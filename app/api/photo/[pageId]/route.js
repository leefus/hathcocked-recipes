/**
 * /api/photo/[pageId]
 *
 * Notion returns photos as signed S3 URLs that expire in roughly an hour. If we
 * put those straight in an <img src>, every photo on the site 404s by dinner.
 *
 * This route asks Notion for a fresh signed URL, streams the bytes back, and
 * lets the CDN hold onto them. The browser only ever sees /api/photo/<id>,
 * which never expires. The ?v=<lastEdited> query the app appends means
 * replacing a photo in Notion busts the cache immediately.
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const FALLBACK_HEADERS = {
  "Cache-Control": "public, max-age=60",
};

export async function GET(_request, { params }) {
  const { pageId } = await params;

  if (!/^[0-9a-f-]{32,36}$/i.test(pageId)) {
    return new Response("Bad page id", { status: 400, headers: FALLBACK_HEADERS });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const file = page.properties?.["Picture"]?.files?.[0];
    const url = file?.file?.url ?? file?.external?.url;

    if (!url) {
      return new Response("No photo", { status: 404, headers: FALLBACK_HEADERS });
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream failed", { status: 502, headers: FALLBACK_HEADERS });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Long CDN life is safe because ?v changes when the photo does.
        "Cache-Control":
          "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("photo route failed", pageId, err);
    return new Response("Not available", { status: 502, headers: FALLBACK_HEADERS });
  }
}
