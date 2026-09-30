# Heirloom Kitchen

A warm family recipe archive built with Next.js, React, Tailwind CSS, and optional Notion content.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app works without Notion and uses `lib/recipes.js` as its local data source.

## Optional Notion source

Create a Notion integration, share your recipe database with it, then set these values in `.env.local`:

```env
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...
```

The expected database properties are `Name` (title), `Subtitle`, `Summary`, `Contributor`, `Provenance`, `Ingredients`, `Method`, and `Notes` (rich text); `Category` (select); `Tags` (multi-select); `PrepTime`, `CookTime`, and `Servings` (number); and optional `Slug` (rich text) and `Photo` (file or external URL).

## Routes

- `/` — featured family recipes
- `/recipes` — searchable, filterable archive
- `/recipes/[slug]` — recipe detail
- `/contributors` — contributor archive
- `/contributors/[slug]` — contributor recipes
- `/about` — family story
- `/api/photo?recipe=...` — generated placeholder artwork
