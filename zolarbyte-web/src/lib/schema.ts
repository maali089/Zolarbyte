import { services } from "@/lib/content";
import { site } from "@/lib/site";

/** Unternehmensdaten als JSON-LD (nur bestätigte Angaben aus site.ts/content.ts). */
export const businessLd = {
  "@context": "https://schema.org",
  "@type": "Electrician",
  "@id": `${site.url}/#organisation`,
  name: site.legalName,
  alternateName: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/opengraph-image`,
  telephone: site.general.phone,
  email: site.general.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.zip,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: [
    { "@type": "City", name: "Karlsfeld" },
    { "@type": "City", name: "München" },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: site.general.phone,
      email: site.general.email,
      availableLanguage: "de",
    },
  ],
  employee: [
    { "@type": "Person", name: site.sales.name, jobTitle: site.sales.role },
  ],
  knowsAbout: services.map((s) => s.title),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Leistungen",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title, description: s.lead, url: `${site.url}/leistungen/${s.id}` },
    })),
  },
};
