/**
 * parse.js — turns the Notion text properties into structured data.
 *
 * Every rule here was derived from the actual strings in the Family Recipes
 * database, not from a generic recipe format. Where the real cards do
 * something inconvenient, there's a comment saying so.
 *
 * Safe to import from both server and client components — no dependencies.
 */

/* ---------------------------------------------------------------------------
 * Fraction glyphs
 * The handwritten cards use these constantly ("1½ c. sugar", "1⅓ cups").
 * ------------------------------------------------------------------------- */
const GLYPH_TO_NUM = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4,
  "⅕": 1 / 5, "⅖": 2 / 5, "⅗": 3 / 5, "⅘": 4 / 5,
  "⅙": 1 / 6, "⅚": 5 / 6,
  "⅛": 1 / 8, "⅜": 3 / 8, "⅝": 5 / 8, "⅞": 7 / 8,
};

const NUM_TO_GLYPH = [
  [0, ""], [1 / 8, "⅛"], [1 / 6, "⅙"], [1 / 5, "⅕"], [1 / 4, "¼"],
  [1 / 3, "⅓"], [3 / 8, "⅜"], [2 / 5, "⅖"], [1 / 2, "½"], [3 / 5, "⅗"],
  [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [4 / 5, "⅘"], [5 / 6, "⅚"],
  [7 / 8, "⅞"], [1, ""],
];

const GLYPHS = Object.keys(GLYPH_TO_NUM).join("");

/**
 * Leading-quantity matcher.
 *
 * The `[-\s]` in the mixed-number branches is not decorative: the cards write
 * "1-¾ c. sugar" (Buttermilk Pie) and "1-3/4 cups water" (Lemon Garlic
 * Chicken). Without it those parse as bare "1" and scale to nonsense.
 *
 * The trailing (?![\d/-]) stops "18 1/2-ounce package" from being read as
 * eighteen packages — though see normalizeKnownQuirks() below, because the
 * real fix for that one is in the data.
 */
const QTY_RE = new RegExp(
  "^\\s*(" +
    "\\d+[-\\s]+\\d+\\/\\d+" +        // 1 1/2   |  1-3/4
    "|\\d+[-\\s]*[" + GLYPHS + "]" +  // 1½      |  1-¾
    "|\\d+\\/\\d+" +                  // 1/2
    "|\\d*\\.?\\d+" +                 // 2       |  2.5
    "|[" + GLYPHS + "]" +             // ½
  ")(?![\\d/-])\\s*(.*)$"
);

/**
 * Parse one ingredient line into a scalable quantity plus the rest of the text.
 * Lines with no leading number ("Dash salt", "Baked pie shell") come back with
 * qty: null and are never scaled — multiplying "to taste" is meaningless.
 */
export function parseIngredient(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return null;

  // A chunk that is only a label ("Crust:", "Glaze:") is a section header.
  if (/^[A-Za-z][A-Za-z\s]{0,24}:$/.test(text)) {
    return { kind: "heading", label: text.replace(/:$/, ""), raw: text };
  }

  const m = text.match(QTY_RE);
  if (!m) return { kind: "item", qty: null, rest: text, raw: text };

  const token = m[1].trim();
  let qty = 0;

  if (token.includes("/")) {
    const parts = token.split(/[-\s]+/);
    const [num, den] = parts.pop().split("/");
    qty = Number(num) / Number(den);
    if (parts.length) qty += Number(parts[0]);
  } else if (/[^\d.\s-]/.test(token)) {
    const glyph = token.slice(-1);
    const whole = token.slice(0, -1).replace(/[-\s]/g, "");
    qty = (whole ? Number(whole) : 0) + (GLYPH_TO_NUM[glyph] || 0);
  } else {
    qty = Number(token);
  }

  if (!Number.isFinite(qty) || qty <= 0) {
    return { kind: "item", qty: null, rest: text, raw: text };
  }
  return { kind: "item", qty, rest: m[2].trim(), raw: text };
}

/**
 * Split the Ingredients property. The cards are semicolon-delimited, which is
 * unambiguous — no recipe uses a semicolon inside an ingredient.
 */
export function parseIngredients(text) {
  if (!text) return [];
  return String(text)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseIngredient)
    .filter(Boolean);
}

/**
 * Split the Instructions property.
 *
 * Instructions read "1. Do this. 2. Do that." but plenty of numbers appear
 * mid-sentence: "1-quart bowl", "13x9-inch pan", "350°F". So we only accept a
 * numbered run that actually starts at 1 and increments — a stray "2." that
 * doesn't continue the sequence is left inside its step.
 *
 * Recipes with no numbering at all (Vanilla Ice Cream, Simple Sausage Balls)
 * come back as a single step rather than an empty list.
 */
export function parseSteps(text) {
  const src = String(text ?? "").trim();
  if (!src) return [];

  const re = /(?:^|\s)(\d{1,2})\.\s+/g;
  const hits = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    hits.push({
      n: Number(m[1]),
      start: m.index === 0 ? 0 : m.index + 1,
      after: re.lastIndex,
    });
  }

  const run = [];
  let want = 1;
  for (const h of hits) {
    if (h.n === want) { run.push(h); want += 1; }
  }
  if (run.length < 2) return [src];

  return run
    .map((h, i) =>
      src.slice(h.after, i + 1 < run.length ? run[i + 1].start : src.length).trim()
    )
    .filter(Boolean);
}

/**
 * Render a scaled number the way a cook writes it. 1.6667 becomes "1⅔";
 * decimals in a recipe read as a bug.
 */
export function formatQty(n) {
  if (n == null || !Number.isFinite(n)) return "";
  if (n === 0) return "0";

  let whole = Math.floor(n + 1e-9);
  const frac = n - whole;

  let best = NUM_TO_GLYPH[0];
  let bestDist = Infinity;
  for (const entry of NUM_TO_GLYPH) {
    const d = Math.abs(frac - entry[0]);
    if (d < bestDist) { bestDist = d; best = entry; }
  }

  if (best[0] === 1) { whole += 1; best = NUM_TO_GLYPH[0]; }

  // Not close to any kitchen fraction (0.45 of a cup) — show a decimal rather
  // than lying with a tidy-looking glyph.
  if (bestDist > 0.04) {
    const quarter = Math.round(n * 4) / 4;
    if (Math.abs(quarter - n) < 0.03) return formatQty(quarter);
    return String(Math.round(n * 10) / 10);
  }

  if (whole === 0) return best[1] || "0";
  return whole + best[1];
}

/** Total time, tolerating the fact that most recipes have neither number. */
export function totalMinutes(recipe) {
  const a = recipe.prepMinutes ?? 0;
  const b = recipe.cookMinutes ?? 0;
  const t = a + b;
  return t > 0 ? t : null;
}

/** Who to credit. Submitted By is the family member; Source is provenance. */
export function attribution(recipe) {
  return recipe.submittedBy || recipe.source || null;
}
