import type { MetadataRoute } from "next";
import { services } from "@/lib/content";
import { features, site } from "@/lib/site";

/**
 * Nur indexierbare Seiten. `lastModified` bewusst weggelassen: ohne echtes Änderungsdatum
 * (CMS/Git) wäre ein Wert geraten und würde Crawler eher irreführen.
 */
const pages: Array<{ path: string; priority: number; changeFrequency: "monthly" | "yearly" }> = [
  { path: "", priority: 1, changeFrequency: "monthly" },
  { path: "/leistungen", priority: 0.9, changeFrequency: "monthly" },
  ...services.map((s) => ({ path: `/leistungen/${s.id}`, priority: 0.8, changeFrequency: "monthly" as const })),
  { path: "/betrieb", priority: 0.7, changeFrequency: "yearly" },
  { path: "/fragen", priority: 0.6, changeFrequency: "yearly" },
  ...(features.foerdercheck ? [{ path: "/foerderung", priority: 0.7, changeFrequency: "monthly" as const }] : []),
  { path: "/kontakt", priority: 0.8, changeFrequency: "yearly" },
  { path: "/impressum", priority: 0.2, changeFrequency: "yearly" },
  { path: "/datenschutz", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${site.url}${path}`,
    changeFrequency,
    priority,
  }));
}
