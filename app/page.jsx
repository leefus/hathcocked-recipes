import { getRecipes, getFacets } from "@/lib/notion";
import RecipeBrowser from "@/components/RecipeBrowser";

// One Notion query per hour, shared by every visitor.
export const revalidate = 3600;

export default async function Home() {
  const [recipes, facets] = await Promise.all([getRecipes(), getFacets()]);

  return (
    <RecipeBrowser
      recipes={recipes}
      categories={facets.categories}
      tags={facets.tags}
      eyebrow="A Family Recipe Book"
      heading="Hathcocked Recipes"
    />
  );
}
