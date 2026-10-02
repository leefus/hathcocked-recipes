"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Users, X } from "lucide-react";
import Dish from "./Dish";
import { HeaderBrand } from "./Brand";
import { totalMinutes, attribution } from "@/lib/parse";

/**
 * All 80 recipes arrive from the server in one payload, so search and filtering
 * happen instantly with no round trip. At this size that beats paginating.
 */

function ContributorBadge({ name }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-contributor-br bg-contributor-bg py-1 pl-1 pr-3">
      <span
        aria-hidden="true"
        className="grid h-5 w-5 place-items-center rounded-full bg-sage font-serif text-[11px] font-semibold text-white"
      >
        {initial}
      </span>
      <span className="text-label-md font-semibold text-ink">{name}</span>
    </span>
  );
}

function RecipeCard({ recipe, featured }) {
  const mins = totalMinutes(recipe);
  const from = attribution(recipe);

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className={`group surface-1 block overflow-hidden rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-e2 ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`relative ${featured ? "h-60 sm:h-72" : "aspect-[4/3]"}`}>
        <Dish
          recipe={recipe}
          priority={featured}
          sizes={featured ? "(min-width:640px) 66vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"}
        />
        {recipe.submittedBy && (
          <span className="absolute left-3 top-3">
            <ContributorBadge name={recipe.submittedBy} />
          </span>
        )}
      </div>

      <div className="p-4">
        {recipe.category && (
          <span className="text-label-sm font-semibold uppercase tracking-[0.08em] text-sage-ink">
            {recipe.category}
          </span>
        )}

        <h3
          className={`mt-1 font-serif font-semibold leading-tight text-ink ${
            featured ? "text-headline-lg" : "text-headline-sm"
          }`}
        >
          {recipe.title}
        </h3>

        {recipe.description ? (
          <p className="mt-1.5 line-clamp-2 text-body-sm text-muted">{recipe.description}</p>
        ) : (
          // Source is populated on every recipe and is often the most
          // interesting thing on the card. Italic serif treats it as lore.
          from && (
            <p className="mt-1.5 font-serif text-note-italic italic leading-snug text-muted">
              {from}
            </p>
          )
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {mins && (
            <span className="chip-neutral inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="tnum">{mins}</span> min
            </span>
          )}
          {recipe.servings && (
            <span className="chip-neutral inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="tnum">{recipe.servings}</span>
            </span>
          )}
          <span className="ml-auto text-label-md font-semibold text-muted">
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function RecipeBrowser({ recipes, categories, tags, heading, eyebrow }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (tag && !r.tags.includes(tag)) return false;
      if (!q) return true;
      // Ingredients are searchable too — "what can I make with buttermilk" is
      // the question people actually have, standing in the kitchen.
      const hay = [
        r.title, r.submittedBy ?? "", r.source ?? "",
        ...r.tags,
        ...r.ingredients.map((i) => i.rest ?? i.label ?? ""),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [recipes, query, category, tag]);

  const filtered = category !== "All" || tag || query.trim();

  return (
    <div className="mx-auto w-full max-w-container px-5 pb-36 pt-6 sm:px-8 lg:px-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-sage-ink">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 font-serif text-display-mobile font-medium text-ink sm:text-display-lg">
            {heading}
          </h1>
        </div>
        <HeaderBrand />
      </header>

      <div className="relative mt-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
          strokeWidth={2}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a dish or an ingredient"
          aria-label="Search recipes"
          className="tap w-full rounded-full border border-hairline bg-card py-3.5 pl-12 pr-4 text-body-md text-ink placeholder:text-muted/70 focus:border-primary focus:shadow-focus focus:outline-none"
        />
      </div>

      {/* Category is on all 80 recipes, so it's the primary rail. */}
      <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-1 no-scrollbar sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex w-max gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-label-lg font-semibold transition-colors ${
                category === c
                  ? "bg-primary text-white"
                  : "border border-hairline bg-card text-muted hover:bg-ghost-tint hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tags are a second, quieter axis — sage, per the taxonomy spec. */}
      <div className="-mx-5 mt-2 overflow-x-auto px-5 pb-1 no-scrollbar sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex w-max gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              className={`shrink-0 rounded px-3 py-1.5 text-label-md font-semibold transition-colors ${
                tag === t
                  ? "bg-sage text-white"
                  : "bg-sage/[0.12] text-sage-ink hover:bg-sage/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <p className="text-label-md font-semibold text-muted">
          <span className="tnum">{results.length}</span>{" "}
          {results.length === 1 ? "recipe" : "recipes"}
        </p>
        {filtered && (
          <button
            onClick={() => { setQuery(""); setCategory("All"); setTag(null); }}
            className="inline-flex items-center gap-1 text-label-md font-semibold text-muted hover:text-primary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} /> Clear
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="font-serif text-headline-md font-semibold text-ink">
            Nothing matches that
          </p>
          <p className="mx-auto mt-2 max-w-xs text-body-md text-muted">
            Try a different ingredient, or clear the filters.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {results.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} featured={i === 0 && !filtered} />
          ))}
        </div>
      )}
    </div>
  );
}
