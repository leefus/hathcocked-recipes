import { getFacets } from "@/lib/notion";
import AddRecipeForm from "@/components/AddRecipeForm";
import { HeaderBrand } from "@/components/Brand";

export const revalidate = 3600;

export const metadata = {
  title: "Add a recipe — Hathcocked Recipes",
};

export default async function AddRecipe() {
  const facets = await getFacets();

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-36 pt-6 sm:px-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-sage-ink">
            Into the book
          </p>
          <h1 className="mt-1.5 font-serif text-display-mobile font-medium text-ink sm:text-display-lg">
            Add a recipe
          </h1>
          <p className="mt-2 font-serif text-note-italic italic text-muted">
            Copy it down the way it's written on the card.
          </p>
        </div>
        <HeaderBrand />
      </header>

      <AddRecipeForm
        categories={facets.categories}
        tags={facets.tags}
        difficulties={facets.difficulties}
      />
    </div>
  );
}
