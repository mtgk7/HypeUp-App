import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://hypeuppp.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register", "/login", "/gizlilik", "/kullanim-sartlari"],
        disallow: ["/dashboard/", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
