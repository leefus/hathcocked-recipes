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

const slugify = (s) =>
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
  for (const r of all) {
    if (r.category) categories.add(r.category);
    r.tags.forEach((t) => tags.add(t));
  }
  return {
    categories: [...categories].sort(),
    tags: [...tags].sort(),
  };
}
