import { services } from "@/lib/content";

/** Schlüssel, unter dem Rechner-Angaben an den Assistenten übergeben werden (sessionStorage). */
export const HANDOFF_KEY = "zb-calculator-handoff";

export type InquiryTopicSlug =
  | "photovoltaik"
  | "wallbox"
  | "elektroinstallation"
  | "stoerung"
  | "pruefung"
  | "schulung"
  | "sonstiges";

export type InquiryTopic = {
  slug: InquiryTopicSlug;
  /** Beschriftung im Assistenten und in Einstiegs-Chips */
  label: string;
  /** Leistungstitel laut content.ts bzw. "Sonstiges / noch unklar" (Mail und SERVICE_OPTIONS) */
  service: string;
};

const title = (id: string) => services.find((s) => s.id === id)?.title ?? "Sonstiges / noch unklar";

export const INQUIRY_TOPICS: InquiryTopic[] = [
  { slug: "photovoltaik", label: "Photovoltaik", service: title("photovoltaik") },
  { slug: "wallbox", label: "Wallbox & E-Auto", service: title("e-mobilitaet") },
  { slug: "elektroinstallation", label: "Elektroinstallation", service: title("elektroinstallation") },
  { slug: "stoerung", label: "Störung / Reparatur", service: title("kundendienst") },
  { slug: "pruefung", label: "Prüfung / E‑Check", service: title("pruefung") },
  { slug: "schulung", label: "Schulung", service: title("schulungen") },
  { slug: "sonstiges", label: "Etwas anderes", service: "Sonstiges / noch unklar" },
];

export const TOPIC_SLUGS = INQUIRY_TOPICS.map((t) => t.slug) as string[];

export function topicBySlug(slug: string | null | undefined) {
  return INQUIRY_TOPICS.find((t) => t.slug === slug);
}

/** Chip-Werte (Whitelist, wird auch serverseitig geprüft) */
export const OBJEKT_OPTIONS = ["Einfamilienhaus", "Wohnung", "Mehrfamilienhaus", "Gewerbe"];
export const ZEITRAUM_OPTIONS = ["So bald wie möglich", "In den nächsten 3 Monaten", "Noch offen"];
export const WALLBOX_EXTRA_OPTIONS = ["Wallbox mitdenken: ja", "Wallbox mitdenken: nein"];
export const PV_EXTRA_OPTIONS = ["PV-Anlage: vorhanden", "PV-Anlage: nicht vorhanden", "PV-Anlage: geplant"];
export const EXTRA_OPTIONS = [...WALLBOX_EXTRA_OPTIONS, ...PV_EXTRA_OPTIONS];
