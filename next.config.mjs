/** @type {import('next').NextConfig} */
export default {
  images: {
    // Photos are served through our own /api/photo route, never straight from
    // Notion's expiring S3 links.
    formats: ["image/avif", "image/webp"],
  },
};
