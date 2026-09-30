import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeCard from "@/app/components/RecipeCard";
import SiteHeader from "@/app/components/SiteHeader";
import { getAllContributors, getRecipesByContributor } from "@/lib/recipes";

export function generateStaticParams() { return getAllContributors().map((person) => ({ slug: person.slug })); }

export default function ContributorDetailPage({ params }) {
  const contributor = getAllContributors().find((person) => person.slug === params.slug);
  if (!contributor) notFound();
  const contributorRecipes = getRecipesByContributor(params.slug);
  return <main className="min-h-screen bg-canvas text-ink"><SiteHeader title={contributor.name} /><div className="mx-auto max-w-container px-6 py-16"><Link href="/contributors" className="text-body-sm font-medium text-primary">← All contributors</Link><div className="mb-10 mt-8"><p className="text-label-md uppercase tracking-[0.18em] text-sage">{contributorRecipes.length} recipes</p><h2 className="mt-2 font-serif text-display-mobile md:text-display-lg">The kitchen notes and favorites carried by {contributor.name}</h2></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{contributorRecipes.map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} compact />)}</div></div></main>;
}
