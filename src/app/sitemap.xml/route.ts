import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://teamify.onlinemichel.dev";

const staticPages = [
  "",
  "landing",
  "legal/legal-notice",
  "legal/privacy-policy",
  "legal/cookies-policy",
  "legal/terms-of-use",
];

export async function GET() {
  const pages = staticPages.map(
    (p) => `<url><loc>${BASE_URL}/${p}</loc><changefreq>weekly</changefreq><priority>${p === "" ? "1.0" : "0.7"}</priority></url>`
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
