"use client";

export default function RecipeFilters({ categories, selectedCategory, onCategoryChange, searchValue, onSearchChange }) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-5 shadow-e1">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <label htmlFor="recipe-search" className="mb-2 block text-label-sm uppercase tracking-[0.12em] text-muted">Search recipes</label>
          <input id="recipe-search" type="search" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by name, note, or ingredient" className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-body-md text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="w-full lg:max-w-xl">
          <p className="mb-2 text-label-sm uppercase tracking-[0.12em] text-muted">Filter by category</p>
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((category) => <button key={category} type="button" onClick={() => onCategoryChange(category)} className={`rounded-full px-3 py-2 text-label-sm transition ${selectedCategory === category ? "bg-primary text-white" : "border border-hairline bg-white text-muted hover:border-hairline-strong"}`}>{category}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
