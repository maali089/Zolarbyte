/**
 * Zentrale Unternehmensdaten.
 * Nur bestätigte Angaben eintragen. Alles mit `confirmed: false`
 * erscheint nicht auf der öffentlichen Seite.
 */

export const site = {
  name: "Zolarbyte",
  legalName: "ZOLARBYTE ENERGY",
  url: "https://zolarbyte.de",
  tagline: "Photovoltaik, Wärmepumpen und Stromspeicher vom Elektrotechnik-Meisterbetrieb",
  description:
    "Zolarbyte plant Photovoltaik, Wärmepumpen und Stromspeicher als abgestimmtes Energiesystem – vom Elektrotechnik-Meisterbetrieb aus Karlsfeld bei München. Mit Förderrechner für die KfW-Heizungsförderung.",
  address: {
    street: "Nußbaumstraße 4",
    zip: "85757",
    city: "Karlsfeld",
    region: "Bayern",
    country: "DE",
  },
  /** Allgemeiner Kontakt laut bisheriger Website */
  general: {
    phone: "+49 151 46273201",
    phoneHref: "tel:+4915146273201",
    email: "kontakt@zolarbyte.de",
  },
  /** Persönlicher Vertriebskontakt laut Visitenkarte */
  sales: {
    name: "Jörg Mißfeldt",
    role: "Vertriebsleiter",
    roleEn: "Chief Sales Officer (CSO)",
    phone: "+49 157 57510000",
    phoneHref: "tel:+4915757510000",
    email: "jm@zolarbyte.de",
  },
  /** Laut bisherigem Impressum – vor Veröffentlichung bestätigen lassen */
  management: {
    name: "Elzat Ablet",
    role: "Geschäftsführer",
  },
  chamber: {
    name: "Handwerkskammer für München und Oberbayern",
    street: "Max-Joseph-Straße 4",
    city: "80333 München",
    registration: "7216270",
  },
  /** WhatsApp erst eintragen, wenn die Nummer bestätigt ist */
  whatsapp: null as string | null,
  copyrightYear: 2026,
} as const;

/**
 * Bereiche, die erst mit bestätigtem Material öffentlich erscheinen.
 */
export const features = {
  /** Förderrechner KfW 458 (Regeln in src/lib/foerderung) */
  calculator: true,
  /** Referenzprojekte: noch kein freigegebenes Material */
  references: false,
  /** Partner: Liste von 2023 – Aktualität und Freigabe offen */
  partners: false,
  /** Kundenstimmen: keine freigegebenen Stimmen */
  testimonials: false,
} as const;

/** Vorschau-Modus: zeigt interne Hinweise (Entwurf, Formularstatus). */
export const isPreview = process.env.NEXT_PUBLIC_SITE_MODE !== "production";

export const fullAddress = `${site.address.street}, ${site.address.zip} ${site.address.city}`;
