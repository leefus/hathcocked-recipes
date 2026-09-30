import Link from "next/link";

export default function RecipeCard({ recipe, compact = false }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-hairline bg-card text-ink shadow-e1 transition duration-200 hover:-translate-y-1 hover:shadow-e2">
      <div className={`${compact ? "h-44" : "h-52"} relative bg-[radial-gradient(circle_at_top,_#f8e3d2,_#f6efe2_45%,_#eadfc9)]`}>
        <img src={recipe.photo || `/api/photo?recipe=${recipe.slug}`} alt={recipe.title} className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]" />
      </div>
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-hairline bg-primary-tint px-2.5 py-1 text-label-sm uppercase tracking-[0.12em] text-primary-deep">{recipe.category}</span>
          <span className="text-label-sm text-muted">{recipe.servings} servings</span>
        </div>
        <h3 className={`mt-3 font-serif ${compact ? "text-headline-sm" : "text-headline-md"}`}>{recipe.title}</h3>
        <p className="mt-2 text-body-md text-muted">{recipe.subtitle}</p>
        {!compact && <p className="mt-3 text-body-sm text-muted">{recipe.summary}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-label-sm text-muted">
          <span className="rounded-full bg-ghost-tint px-2 py-1">Prep {recipe.prepTime}m</span>
          <span className="rounded-full bg-ghost-tint px-2 py-1">Cook {recipe.cookTime}m</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-label-sm text-muted">{recipe.contributor}</span>
          <Link href={`/recipes/${recipe.slug}`} className="text-body-sm font-medium text-primary hover:text-primary-deep">Open recipe</Link>
        </div>
      </div>
    </article>
  );
}
