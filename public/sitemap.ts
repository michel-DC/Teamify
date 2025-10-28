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

function publicRoutes(): string[] {
  return [
    "/",
    "/landing",
    "/legal/legal-notice",
    "/legal/privacy-policy",
    "/legal/cookies-policy",
    "/legal/terms-of-use",
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  return publicRoutes().map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}


