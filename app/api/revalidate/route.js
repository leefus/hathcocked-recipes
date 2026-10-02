import { revalidateTag } from "next/cache";

/**
 * Force a refresh after editing Notion instead of waiting out the hour.
 * Visit /api/revalidate?secret=YOUR_SECRET
 */
export async function GET(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: "Bad secret" }, { status: 401 });
  }
  revalidateTag("recipes");
  return Response.json({ ok: true, refreshed: new Date().toISOString() });
}
