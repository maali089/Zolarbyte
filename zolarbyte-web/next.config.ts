import type { NextConfig } from "next";

/**
 * Weiterleitungen von Adressen der bisherigen WordPress-Seite.
 * Die alten Blog-, Tag- und Archivseiten enthielten nur Platzhaltertexte.
 */
const legacy: Array<[string, string]> = [
  ["/services", "/#leistungen"],
  ["/ueber-uns", "/meisterbetrieb"],
  ["/about-us", "/meisterbetrieb"],
  ["/unsere-partner", "/"],
  ["/disclaimer", "/impressum"],
  ["/hello-world", "/"],
  ["/i-must-explain-to-you-how-all-this", "/"],
  ["/solar-panels-adipiscing-elit-incididunt", "/"],
  ["/solar-panels-themselves-require", "/"],
  ["/tag/:slug*", "/"],
  ["/category/:slug*", "/"],
  ["/2020/:slug*", "/"],
  ["/2021/:slug*", "/"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  trailingSlash: false,
  async redirects() {
    return [
      ...legacy.map(([source, destination]) => ({ source, destination, permanent: true })),
      // früheres internes Rechner-Konzept
      { source: "/intern/rechner", destination: "/foerderrechner", permanent: false },
      { source: "/rechner", destination: "/foerderrechner", permanent: true },
      { source: "/foerderung", destination: "/foerderrechner", permanent: true },
      // AGB: alte Vorlage nicht übernommen – Ziel nach Klärung festlegen
      { source: "/agb", destination: "/kontakt", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
