import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/photovoltaik", "/waermepumpe", "/stromspeicher", "/foerderrechner", "/meisterbetrieb", "/elektrotechnik", "/kontakt", "/impressum", "/datenschutz"].map((path) => ({
    url: `${site.url}${path}`,
  }));
}
