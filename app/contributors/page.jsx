import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import { getAllContributors } from "@/lib/recipes";

export default function ContributorsPage() {
  const contributors = getAllContributors();
  return <main className="min-h-screen bg-canvas text-ink"><SiteHeader title="Contributors" /><div className="mx-auto max-w-container px-6 py-16"><div className="mb-10"><p className="text-label-md uppercase tracking-[0.2em] text-muted">Family voices</p><h2 className="mt-2 font-serif text-display-mobile md:text-display-lg">The hands that shaped the table</h2></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{contributors.map((person) => <Link key={person.slug} href={`/contributors/${person.slug}`} className="rounded-xl border border-hairline bg-card p-6 shadow-e1 transition hover:-translate-y-1 hover:shadow-e2"><p className="text-label-sm uppercase tracking-[0.18em] text-sage">{person.recipeCount} {person.recipeCount === 1 ? "recipe" : "recipes"}</p><h3 className="mt-3 font-serif text-headline-md">{person.name}</h3><div className="mt-6 flex justify-between"><span className="text-body-sm text-muted">View recipes</span><span className="text-body-sm font-medium text-primary">Open →</span></div></Link>)}</div></div></main>;
}
