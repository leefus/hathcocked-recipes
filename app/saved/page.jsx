import { getRecipes, getFacets } from "@/lib/notion";
import RecipeBrowser from "@/components/RecipeBrowser";

export const revalidate = 3600;

/**
 * "Saved" reads the existing Family Favorite tag in Notion. Note this is one
 * shared list — favoriting is a family decision, not a personal one. Switching
 * to per-person favorites means either a property per person or browser storage.
 */
export default async function Saved() {
  const [all, facets] = await Promise.all([getRecipes(), getFacets()]);
  const recipes = all.filter((r) => r.tags.includes("Family Favorite"));

  return (
    <RecipeBrowser
      recipes={recipes}
      categories={facets.categories}
      tags={facets.tags.filter((t) => t !== "Family Favorite")}
      eyebrow="Passed down"
      heading="Favorites"
    />
  );
}
