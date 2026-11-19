import type { MetadataRoute } from "next";

/** Tells search engines they may read the whole site, and where its page list is. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://hawioyugi.com/sitemap.xml",
  };
}
