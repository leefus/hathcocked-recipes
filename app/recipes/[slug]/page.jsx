import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame, Users } from "lucide-react";
import { getRecipes, getRecipeBySlug } from "@/lib/notion";
import { totalMinutes, attribution } from "@/lib/parse";
import Dish from "@/components/Dish";
import ScaledIngredients from "@/components/ScaledIngredients";

export const revalidate = 3600;

/** Pre-build all 80 pages at deploy time — they load instantly. */
export async function generateStaticParams() {
  const recipes = await getRecipes();
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Not found" };
  return {
    title: `${recipe.title} — Hathcocked Recipes`,
    description:
      recipe.description ?? `A family recipe from ${attribution(recipe) ?? "the book"}.`,
  };
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="chip-neutral inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export default async function RecipePage({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const mins = totalMinutes(recipe);
  const from = attribution(recipe);

  return (
    <article className="pb-24">
      {/* Tablet and up: ingredient index beside the step directions. */}
      <div className="mx-auto max-w-container lg:flex lg:gap-12 lg:px-12 lg:pt-10">
        <div className="relative h-72 sm:h-96 lg:sticky lg:top-10 lg:h-[540px] lg:w-[42%] lg:shrink-0 lg:self-start lg:overflow-hidden lg:rounded-lg">
          <Dish recipe={recipe} priority sizes="(min-width:1024px) 42vw, 100vw" />
          <div className="absolute inset-x-0 top-0 p-4">
            <Link
              href="/"
              aria-label="Back to the cookbook"
              className="tap grid place-items-center rounded-full border border-hairline bg-card/90 backdrop-blur transition-transform active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5 text-ink" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        {/* Bottom sheet on mobile, column on desktop. */}
        <div className="relative -mt-8 rounded-t-xl bg-canvas px-5 pt-8 sm:px-8 lg:mt-0 lg:min-w-0 lg:flex-1 lg:rounded-none lg:px-0 lg:pt-0">
          {recipe.category && (
            <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-sage-ink">
              {recipe.category}
            </p>
          )}

          <h1 className="mt-2 font-serif text-display-mobile font-medium text-ink sm:text-display-lg">
            {recipe.title}
          </h1>

          {from && (
            <p className="mt-2 font-serif text-note-italic italic text-muted">
              from {from}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {mins && <Meta icon={Clock}><span className="tnum">{mins}</span> min</Meta>}
            {recipe.servings && (
              <Meta icon={Users}>Serves <span className="tnum">{recipe.servings}</span></Meta>
            )}
            {recipe.difficulty && <Meta icon={Flame}>{recipe.difficulty}</Meta>}
            {recipe.tags.map((t) => (
              <span key={t} className="chip-sage">{t}</span>
            ))}
          </div>

          {recipe.description && (
            <p className="mt-5 font-serif text-body-lg leading-relaxed text-ink">
              {recipe.description}
            </p>
          )}

          <section className="mt-9">
            <h2 className="font-serif text-headline-md font-semibold text-ink">
              Ingredients
            </h2>
            <div className="mt-4">
              <ScaledIngredients
                ingredients={recipe.ingredients}
                servings={recipe.servings}
              />
            </div>
          </section>

          <section className="mt-11">
            <h2 className="font-serif text-headline-md font-semibold text-ink">
              Directions
            </h2>
            <ol className="mt-5 space-y-6">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  {/* 32px sage circles, Newsreader numerals — order matters here,
                      so the numbering is carrying real information. */}
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage font-serif text-label-lg font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-body-lg text-ink">{s}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Heirloom marginalia — the handwritten-card advice. */}
          {recipe.notes && (
            <aside className="mt-11 rounded-md border-l-4 border-saffron bg-marginalia p-5">
              <h2 className="text-label-sm font-semibold uppercase tracking-[0.12em] text-saffron">
                From the card
              </h2>
              <p className="mt-2 font-serif text-note-italic italic leading-relaxed text-ink">
                {recipe.notes}
              </p>
            </aside>
          )}

          {recipe.source && recipe.source !== recipe.submittedBy && (
            <p className="mt-9 text-label-md font-semibold uppercase tracking-[0.1em] text-muted">
              Source · {recipe.source}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
