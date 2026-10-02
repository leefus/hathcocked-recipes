/**
 * notion.js — the only file that talks to Notion.
 *
 * Runs server-side only. NOTION_TOKEN never reaches the browser.
 *
 * Everything the app needs lives in Notion *properties*, not page bodies, so
 * one query returns all 80 recipes complete. There is no per-recipe fetch,
 * which means no N+1 and no rate-limit pressure.
 */

import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { parseIngredients, parseSteps } from "./parse";
import { fixtureRecipes } from "./fixtures";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Data source, not database. As of Notion-Version 2025-09-03 a database is a
// container for one or more data sources, and databases.query is gone.
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID;

/* -------------------------------------------------------------------------- */

const plain = (rich) => {
  const s = (rich ?? []).map((t) => t.plain_text).join("").trim();
  return s || null;
};

export const slugify = (s) =>
  s.toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function mapRecipe(page) {
  const p = page.properties ?? {};
  const title = plain(p["Name"]?.title) ?? "Untitled";
  const files = p["Picture"]?.files ?? [];

  return {
    id: page.id,
    title,
    slug: slugify(title),
    description: plain(p["Description"]?.rich_text),
    category: p["Category"]?.select?.name ?? null,
    difficulty: p["Difficulty"]?.select?.name ?? null,
    tags: (p["Tags"]?.multi_select ?? []).map((t) => t.name),
    servings: p["Servings"]?.number ?? null,
    prepMinutes: p["Prep Time"]?.number ?? null,
    cookMinutes: p["Cook Time"]?.number ?? null,
    submittedBy: plain(p["Submitted By"]?.rich_text),
    source: plain(p["Source"]?.rich_text),
    notes: plain(p["Notes"]?.rich_text),
    lastEdited: page.last_edited_time,

    // Never hand the raw Notion file URL to the browser — it's a signed S3 link
    // that dies in about an hour. This route proxies and caches the bytes, so
    // the URL the browser sees is permanent. `v` busts the cache when the photo
    // is replaced in Notion.
    photoUrl: files.length
      ? `/api/photo/${page.id}?v=${encodeURIComponent(page.last_edited_time)}`
      : null,

    ingredients: parseIngredients(plain(p["Ingredients"]?.rich_text)),
    steps: parseSteps(plain(p["Instructions"]?.rich_text)),
  };
}

/** Two recipes can share a title. Keep URLs pretty; disambiguate only on collision. */
function dedupeSlugs(recipes) {
  const seen = new Map();
  for (const r of recipes) {
    const n = (seen.get(r.slug) ?? 0) + 1;
    seen.set(r.slug, n);
    if (n > 1) r.slug = `${r.slug}-${n}`;
  }
  return recipes;
}

/* -------------------------------------------------------------------------- */

async function fetchAll() {
  // No credentials? Run off the CSV export instead of failing. Lets you develop
  // on a plane, and keeps the build green if Notion is down.
  if (!process.env.NOTION_TOKEN || !DATA_SOURCE_ID) {
    console.warn("[notion] no credentials — using lib/fixtures/recipes.json");
    return dedupeSlugs(fixtureRecipes());
  }

  const pages = [];
  let cursor;

  // 80 recipes fit in one page today, but the loop costs nothing and the
  // family will keep adding.
  do {
    const res = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: "Name", direction: "ascending" }],
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return dedupeSlugs(pages.map(mapRecipe));
}

/**
 * Cached for an hour. Editing a recipe in Notion shows up within the hour, or
 * immediately if you hit the revalidate route.
 */
export const getRecipes = unstable_cache(fetchAll, ["recipes"], {
  revalidate: 3600,
  tags: ["recipes"],
});

export async function getRecipeBySlug(slug) {
  const all = await getRecipes();
  return all.find((r) => r.slug === slug) ?? null;
}

/** Filter rails. Category is on every recipe; Tags are on most. */
export async function getFacets() {
  const all = await getRecipes();
  const categories = new Set();
  const tags = new Set();
  const difficulties = new Set();
  for (const r of all) {
    if (r.category) categories.add(r.category);
    if (r.difficulty) difficulties.add(r.difficulty);
    r.tags.forEach((t) => tags.add(t));
  }
  return {
    categories: [...categories].sort(),
    tags: [...tags].sort(),
    difficulties: [...difficulties].sort(),
  };
}

/* ---------------------------------------------------------------------------
 * Writing
 * ------------------------------------------------------------------------- */

export const canWrite = () => Boolean(process.env.NOTION_TOKEN && DATA_SOURCE_ID);

// Notion caps a single rich-text run at 2000 characters. Long method text from
// an old card can exceed that, so split rather than let the API reject it.
const richText = (s) => {
  const text = String(s ?? "").trim();
  if (!text) return [];
  const runs = [];
  for (let i = 0; i < text.length; i += 2000) {
    runs.push({ type: "text", text: { content: text.slice(i, i + 2000) } });
  }
  return runs;
};

/** Upload a photo to Notion so it lives in the database, not on a third-party host. */
async function uploadPhoto(file) {
  const filename = file.name || "photo.jpg";
  const upload = await notion.fileUploads.create({
    mode: "single_part",
    filename,
    content_type: file.type || "image/jpeg",
  });
  await notion.fileUploads.send({
    file_upload_id: upload.id,
    file: { filename, data: file },
  });
  return { type: "file_upload", file_upload: { id: upload.id }, name: filename };
}

/**
 * Create one recipe in the Family Recipes data source.
 *
 * Writes the same property shapes mapRecipe() reads: ingredients
 * semicolon-delimited, instructions as "1. … 2. …", so parse.js treats a
 * recipe added from the site exactly like one typed in from a card.
 */
export async function createRecipePage(r) {
  const properties = {
    Name: { title: richText(r.title) },
    Ingredients: { rich_text: richText(r.ingredients.join("; ")) },
    Instructions: {
      rich_text: richText(r.steps.map((s, i) => `${i + 1}. ${s}`).join(" ")),
    },
    Tags: { multi_select: r.tags.map((name) => ({ name })) },
  };

  if (r.category) properties.Category = { select: { name: r.category } };
  if (r.difficulty) properties.Difficulty = { select: { name: r.difficulty } };
  if (r.servings != null) properties.Servings = { number: r.servings };
  if (r.prepMinutes != null) properties["Prep Time"] = { number: r.prepMinutes };
  if (r.cookMinutes != null) properties["Cook Time"] = { number: r.cookMinutes };
  if (r.description) properties.Description = { rich_text: richText(r.description) };
  if (r.submittedBy) properties["Submitted By"] = { rich_text: richText(r.submittedBy) };
  if (r.source) properties.Source = { rich_text: richText(r.source) };
  if (r.notes) properties.Notes = { rich_text: richText(r.notes) };
  if (r.photo) properties.Picture = { files: [await uploadPhoto(r.photo)] };

  return notion.pages.create({
    parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
    properties,
  });
}
