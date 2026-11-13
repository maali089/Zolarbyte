/**
 * Zentrale Unternehmensdaten.
 * Nur bestätigte Angaben eintragen. Alles mit `confirmed: false`
 * erscheint nicht auf der öffentlichen Seite.
 */

export const site = {
  name: "ZOLARBYTE ENERGY",
  legalName: "ZOLARBYTE ENERGY",
  url: "https://zolarbyte.de",
  tagline: "Photovoltaik, Wärmepumpen und Stromspeicher vom Elektrotechnik-Meisterbetrieb",
  description:
    "ZOLARBYTE ENERGY plant Photovoltaik, Wärmepumpen und Stromspeicher als abgestimmtes Energiesystem – vom Elektrotechnik-Meisterbetrieb aus Karlsfeld bei München. Mit Förderrechner für die KfW-Heizungsförderung.",
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
    email: "info@zolarbyte.de",
  },
  /**
   * Ansprechpartner für Projekte (Anfragen, Beratung, Angebote).
   * Diese Nummer gilt für alle projektbezogenen Kontaktwege inkl. WhatsApp.
   */
  project: {
    name: "Elzat Ablet",
    role: "Geschäftsinhaber",
    phone: "+49 157 57510000",
    phoneHref: "tel:+4915757510000",
    email: "info@zolarbyte.de",
  },
  /** Inhaber (Angabe des Auftraggebers, 13.11.2026) */
  management: {
    name: "Elzat Ablet",
    role: "Geschäftsinhaber",
  },
  chamber: {
    name: "Handwerkskammer für München und Oberbayern",
    street: "Max-Joseph-Straße 4",
    city: "80333 München",
    registration: "7216270",
  },
  /** WhatsApp – Nummer vom Auftraggeber bestätigt (13.11.2026), gleiche Nummer wie Projektanfragen */
  whatsapp: "4915757510000",
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
  /** Partner: Liste vom Auftraggeber bestätigt (13.11.2026) */
  partners: true,
  /** Kundenstimmen: keine freigegebenen Stimmen */
  testimonials: false,
} as const;

/** Vorschau-Modus: zeigt interne Hinweise (Entwurf, Formularstatus). */
export const isPreview = process.env.NEXT_PUBLIC_SITE_MODE !== "production";

export const fullAddress = `${site.address.street}, ${site.address.zip} ${site.address.city}`;

/** Vorbereiteter WhatsApp-Text – enthält nie Angaben aus Formular oder Rechner */
export const WHATSAPP_TEXT = "Hallo Zolarbyte-Team, ich interessiere mich für ein Projekt und möchte mich beraten lassen.";
export const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
