"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters from "@/app/components/RecipeFilters";
import SiteHeader from "@/app/components/SiteHeader";
import { recipes, getAllCategories } from "@/lib/recipes";

export default function RecipesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(() => getAllCategories(), []);
  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    const haystack = [recipe.title, recipe.summary, recipe.subtitle, recipe.category, recipe.contributor, ...recipe.tags, ...recipe.ingredients, ...recipe.notes].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(searchValue.toLowerCase());
  }), [searchValue, selectedCategory]);

  return <main className="min-h-screen bg-canvas text-ink"><SiteHeader title="Recipes" /><div className="mx-auto max-w-container px-6 py-16"><div className="mb-10"><p className="text-label-md uppercase tracking-[0.2em] text-muted">Family archive</p><h2 className="mt-2 font-serif text-display-mobile md:text-display-lg">Meals worth passing down</h2></div><div className="mb-10"><RecipeFilters categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} searchValue={searchValue} onSearchChange={setSearchValue} /></div><div className="mb-6 flex items-center justify-between"><p className="text-body-sm text-muted">Showing <span className="font-medium text-ink">{filteredRecipes.length}</span> recipes</p><Link href="/contributors" className="text-body-sm font-medium text-primary">Browse contributors</Link></div>{filteredRecipes.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredRecipes.map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div> : <div className="rounded-xl border border-dashed border-hairline bg-card p-10 text-center shadow-e1"><h3 className="font-serif text-headline-sm">No recipes match that search.</h3><p className="mt-3 text-body-md text-muted">Try a different keyword or switch back to “All”.</p></div>}</div></main>;
}
