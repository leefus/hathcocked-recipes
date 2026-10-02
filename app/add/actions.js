"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { APIErrorCode, isNotionClientError } from "@notionhq/client";
import { canWrite, createRecipePage, getRecipes, slugify } from "@/lib/notion";

// Vercel rejects request bodies over 4.5 MB. The form shrinks photos in the
// browser first, so this only trips on something unusual.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const text = (fd, key) => {
  const v = String(fd.get(key) ?? "").trim();
  return v || null;
};

const number = (fd, key) => {
  const v = text(fd, key);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** One entry per line. Semicolons are the ingredient delimiter, so soften any typed ones. */
const lines = (fd, key) =>
  String(fd.get(key) ?? "")
    .split(/\r?\n/)
    // People paste steps already numbered or bulleted; the site numbers them.
    .map((l) => l.replace(/^\s*(?:\d{1,2}[.)]|[-*•])\s+/, "").replace(/;/g, ",").trim())
    .filter(Boolean);

/**
 * Save a recipe from the Add page to Notion.
 * Returns { slug } on success or { error } with a message fit to show a cook.
 */
export async function createRecipe(formData) {
  const passcode = process.env.ADD_RECIPE_PASSCODE;
  if (!passcode || !canWrite()) {
    return { error: "Adding recipes isn't switched on for this site yet." };
  }
  if (text(formData, "passcode") !== passcode) {
    return { error: "That family passcode isn't right.", field: "passcode" };
  }

  const title = text(formData, "title");
  const ingredients = lines(formData, "ingredients");
  const steps = lines(formData, "steps");

  if (!title) return { error: "Give the recipe a name.", field: "title" };
  if (!ingredients.length) return { error: "Add at least one ingredient.", field: "ingredients" };
  if (!steps.length) return { error: "Add at least one step.", field: "steps" };

  const slug = slugify(title);
  const existing = await getRecipes();
  if (existing.some((r) => r.slug === slug)) {
    return {
      error: `There's already a recipe called "${title}". Try adding whose version it is, like "${title} (Gayle's)".`,
      field: "title",
    };
  }

  let photo = formData.get("photo");
  if (!(photo instanceof Blob) || photo.size === 0) photo = null;
  if (photo && !photo.type.startsWith("image/")) {
    return { error: "The photo needs to be an image file.", field: "photo" };
  }
  if (photo && photo.size > MAX_PHOTO_BYTES) {
    return { error: "That photo is too large. Try a smaller one.", field: "photo" };
  }

  try {
    await createRecipePage({
      title,
      ingredients,
      steps,
      category: text(formData, "category"),
      difficulty: text(formData, "difficulty"),
      tags: formData.getAll("tags").map(String).filter(Boolean),
      servings: number(formData, "servings"),
      prepMinutes: number(formData, "prepMinutes"),
      cookMinutes: number(formData, "cookMinutes"),
      description: text(formData, "description"),
      submittedBy: text(formData, "submittedBy"),
      source: text(formData, "source"),
      notes: text(formData, "notes"),
      photo,
    });
  } catch (err) {
    console.error("createRecipe failed", err);
    if (isNotionClientError(err)) {
      if (
        err.code === APIErrorCode.Unauthorized ||
        err.code === APIErrorCode.RestrictedResource ||
        err.code === APIErrorCode.ObjectNotFound
      ) {
        return {
          error:
            "Notion refused the save. The integration needs the Insert content capability and a connection to the Family Recipes database.",
        };
      }
      if (err.code === APIErrorCode.ValidationError) {
        return { error: `Notion didn't accept that recipe: ${err.message}` };
      }
    }
    return { error: "Couldn't reach Notion. Your recipe wasn't saved. Try again in a moment." };
  }

  // Show it everywhere now rather than at the top of the hour.
  revalidateTag("recipes");
  revalidatePath("/");
  revalidatePath("/saved");

  return { slug };
}
