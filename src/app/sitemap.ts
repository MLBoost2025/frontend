import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...["about", "terms", "privacy", "refunds", "billing-terms", "contact"].map((path) => ({
      url: `${siteUrl}/${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
