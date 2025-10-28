import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (envUrl) {
    const hasProtocol = envUrl.startsWith("http://") || envUrl.startsWith("https://");
    return hasProtocol ? envUrl.replace(/\/$/, "") : `https://${envUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing", "/legal/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/auth/",
          "/create-organization",
          "/invite/",
          "/join-event",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


