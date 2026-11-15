/**
 * Zentrale Unternehmensdaten.
 * Nur bestätigte Angaben eintragen. Alles mit `confirmed: false`
 * erscheint nicht auf der öffentlichen Seite.
 */

export const site = {
  /** Firmierung vom Auftraggeber bestätigt (11/2026, Branch main) */
  name: "ZOLARBYTE ENERGY",
  legalName: "ZOLARBYTE ENERGY",
  url: "https://zolarbyte.de",
  tagline: "Photovoltaik, Wärmepumpen und Stromspeicher vom Elektrotechnik-Meisterbetrieb",
  description:
    "ZOLARBYTE ENERGY plant Photovoltaik, Wärmepumpen und Stromspeicher als abgestimmtes Energiesystem – vom Elektrotechnik-Meisterbetrieb aus Karlsfeld bei München. Dazu Wallbox, Elektroinstallation, Störungsbehebung, E-Check und Schulungen.",
  address: {
    street: "Nußbaumstraße 4",
    zip: "85757",
    city: "Karlsfeld",
    region: "Bayern",
    country: "DE",
  },
  /** Zentrale / allgemeine Anfragen (E-Mail vom Auftraggeber bestätigt, 11.11.2026) */
  general: {
    phone: "+49 151 46273201",
    phoneHref: "tel:+4915146273201",
    email: "info@zolarbyte.de",
  },
  /**
   * Ansprechpartner für Projekte (Anfragen, Beratung, Angebote) – vom Auftraggeber bestätigt (13.11.2026).
   * Diese Nummer gilt für alle projektbezogenen Kontaktwege inkl. WhatsApp.
   */
  project: {
    name: "Elzat Ablet",
    role: "Geschäftsinhaber",
    phone: "+49 157 57510000",
    phoneHref: "tel:+4915757510000",
    email: "info@zolarbyte.de",
  },
  /** Vertrieb laut Visitenkarte, bleibt laut Sir auf der Seite (15.11.2026) */
  sales: {
    name: "Jörg Mißfeldt",
    role: "Vertriebsleiter",
    email: "jm@zolarbyte.de",
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
  whatsapp: "4915757510000" as string | null,
  copyrightYear: 2026,
} as const;

/**
 * Bereiche, die erst mit bestätigtem Material öffentlich erscheinen.
 */
export const features = {
  /** Rechner: Zweck und Datengrundlage noch offen */
  calculator: false,
  /** Referenzprojekte: noch kein freigegebenes Material */
  references: false,
  /** Partner und Hersteller: Liste vom Auftraggeber bestätigt (13.11.2026) */
  partners: true,
  /** Kundenstimmen: keine freigegebenen Stimmen */
  testimonials: false,
  /** Förder-Check: Datenstand (src/lib/foerderung.ts) muss vor Livegang von ZOLARBYTE ENERGY freigegeben werden */
  foerdercheck: false,
} as const;

/** Vorschau-Modus: zeigt interne Hinweise (Entwurf, Formularstatus). */
export const isPreview = process.env.NEXT_PUBLIC_SITE_MODE !== "production";

export const fullAddress = `${site.address.street}, ${site.address.zip} ${site.address.city}`;

/** Vorbereiteter WhatsApp-Text – enthält nie Angaben aus Formular oder Rechner */
export const WHATSAPP_TEXT = "Hallo ZOLARBYTE ENERGY, ich interessiere mich für ein Projekt und möchte mich beraten lassen.";
export const whatsappHref = site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_TEXT)}` : null;
