import { Client } from "@notionhq/client";
import { recipes as localRecipes } from "@/lib/recipes";

const notion = process.env.NOTION_API_KEY ? new Client({ auth: process.env.NOTION_API_KEY }) : null;
const databaseId = process.env.NOTION_DATABASE_ID;
const text = (property) => property?.rich_text?.map((item) => item.plain_text).join("") || "";
const lines = (value) => value ? value.split("\n").map((line) => line.trim()).filter(Boolean) : [];

export async function getNotionRecipes() {
  if (!notion || !databaseId) return [];
  try {
    const response = await notion.databases.query({ database_id: databaseId, sorts: [{ property: "Name", direction: "ascending" }] });
    return response.results.map((page) => {
      const props = page.properties;
      const title = props.Name?.title?.map((item) => item.plain_text).join("") || "Untitled Recipe";
      const contributor = text(props.Contributor) || "Family";
      const prepTime = Number(props.PrepTime?.number || 0);
      const cookTime = Number(props.CookTime?.number || 0);
      return { slug: text(props.Slug) || page.id, title, subtitle: text(props.Subtitle), summary: text(props.Summary), category: props.Category?.select?.name || "Dinner", tags: props.Tags?.multi_select?.map((tag) => tag.name) || [], contributor, contributorSlug: contributor.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), provenance: text(props.Provenance), prepTime, cookTime, totalTime: prepTime + cookTime, servings: Number(props.Servings?.number || 4), ingredients: lines(text(props.Ingredients)), steps: lines(text(props.Method)), notes: lines(text(props.Notes)), photo: props.Photo?.files?.[0]?.file?.url || props.Photo?.files?.[0]?.external?.url || `/api/photo?recipe=${page.id}` };
    });
  } catch (error) {
    console.error("Notion fetch failed:", error);
    return [];
  }
}

export async function getRecipesFromSource() {
  const remoteRecipes = await getNotionRecipes();
  return remoteRecipes.length ? remoteRecipes : localRecipes;
}
