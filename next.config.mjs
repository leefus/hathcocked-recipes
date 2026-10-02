/** @type {import('next').NextConfig} */
export default {
  images: {
    // Photos are served through our own /api/photo route, never straight from
    // Notion's expiring S3 links.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The Add page posts a photo through a server action. Next's 1 MB default
    // is too small; Vercel's own ceiling is 4.5 MB, and the form shrinks
    // photos well under that before sending.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};
