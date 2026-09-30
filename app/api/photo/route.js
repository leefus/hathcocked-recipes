const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character]));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const recipe = escapeXml(searchParams.get("recipe") || "family recipe");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#F8E3D2"/><stop offset="55%" stop-color="#F5EDE1"/><stop offset="100%" stop-color="#EBDCC8"/></linearGradient></defs><rect width="1200" height="900" fill="url(#bg)"/><circle cx="980" cy="170" r="115" fill="#F1D9C0" opacity=".8"/><circle cx="220" cy="200" r="130" fill="#E9D9BF" opacity=".75"/><rect x="90" y="115" width="1020" height="660" rx="32" fill="#fffdf966" stroke="#6d25082e"/><text x="600" y="460" text-anchor="middle" font-size="72" font-family="Georgia,serif" fill="#2B2118" font-weight="700">${recipe.replace(/-/g, " ")}</text><text x="600" y="530" text-anchor="middle" font-size="28" font-family="Arial,sans-serif" fill="#736356" letter-spacing="4">FAMILY RECIPE</text></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}
