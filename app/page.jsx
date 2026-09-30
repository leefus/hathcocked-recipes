import Link from "next/link";
import RecipeCard from "@/app/components/RecipeCard";
import SiteHeader from "@/app/components/SiteHeader";
import { recipes } from "@/lib/recipes";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader title="Family Recipe Space" />
      <section className="mx-auto max-w-container px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-label-lg uppercase tracking-[0.18em] text-primary">A complete family recipe space</p>
            <h2 className="font-serif text-display-lg">The meals, memories, and notes that made home.</h2>
            <p className="mt-6 max-w-xl text-body-lg text-muted">Gathered from family tables, handwritten cards, and kitchen windowsill annotations. This archive keeps every favorite meal in one warm place.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Link href="/recipes" className="rounded-full bg-primary px-6 py-3 text-body-sm font-medium text-white shadow-e2 hover:bg-primary-deep">Browse recipes</Link><Link href="/about" className="rounded-full border border-hairline bg-white px-6 py-3 text-body-sm font-medium text-ink hover:border-hairline-strong">Our story</Link></div>
          </div>
          <div className="overflow-hidden rounded-xl border border-hairline bg-card p-4 shadow-e2"><img src="/api/photo?recipe=family-table" alt="Illustrated family recipe table" className="h-[420px] w-full rounded-lg object-cover" /></div>
        </div>
      </section>
      <section className="mx-auto max-w-container px-6 pb-20"><div className="mb-8 flex items-end justify-between"><div><p className="text-label-md uppercase tracking-[0.18em] text-muted">Featured recipes</p><h3 className="font-serif text-headline-lg">From the kitchen table</h3></div><Link href="/recipes" className="text-body-sm font-medium text-primary">View all</Link></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{recipes.slice(0, 3).map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div></section>
    </main>
  );
}
