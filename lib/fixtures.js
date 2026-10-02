/**
 * Offline fallback. Reads the CSV export of the Notion database so the app
 * runs with no token — useful for development, and it keeps a deploy from
 * going blank if Notion is unreachable.
 *
 * Shape matches mapRecipe() in notion.js exactly, so nothing downstream cares
 * which source it came from.
 */
import raw from "./fixtures/recipes.json";
import { parseIngredients, parseSteps } from "./parse";

const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function fixtureRecipes() {
  return raw.map((r, i) => ({
    id: `fixture-${i}`,
    title: r.Name ?? "Untitled",
    slug: slugify(r.Name ?? `recipe-${i}`),
    description: r.Description ?? null,
    category: r.Category ?? null,
    difficulty: r.Difficulty ?? null,
    tags: r.Tags ?? [],
    servings: r.Servings ?? null,
    prepMinutes: r.PrepTime ?? null,
    cookMinutes: r.CookTime ?? null,
    submittedBy: r.SubmittedBy ?? null,
    source: r.Source ?? null,
    notes: r.Notes ?? null,
    lastEdited: null,
    photoUrl: null,
    ingredients: parseIngredients(r.Ingredients),
    steps: parseSteps(r.Instructions),
  }));
}
