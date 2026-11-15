/**
 * Datengrundlage Förder-Check. NUR Programme mit offizieller Quelle, Stand-Datum und Status.
 * Pflege: mindestens halbjährlich (EEG-Sätze ändern sich zum 1.2./1.8.), bei Programmänderungen sofort.
 * Keine Beträge ohne Quelle. Öffentlich erst mit features.foerdercheck (Freigabe durch Zolarbyte).
 */

export type FoerderArt = "zuschuss" | "kredit" | "steuer" | "verguetung" | "netzentgelt";
export type Vorhaben = "pv" | "speicher" | "wallbox" | "zaehler";
export type Gebaeude = "efh" | "mfh" | "gewerbe";
export type Nutzung = "selbst" | "vermietet";

export type Programm = {
  id: string;
  name: string;
  ebene: "Bund" | "Bayern" | "Landkreis Dachau" | "Karlsfeld" | "Netzbetreiber";
  art: FoerderArt;
  fuer: Vorhaben[];
  gebaeude?: Gebaeude[];
  nutzung?: Nutzung[];
  /** Antrag/Zusage muss vor Auftragsvergabe bzw. Vorhabenbeginn liegen */
  vorBeginn?: boolean;
  kurz: string;
  hoehe?: string;
  bedingungen: string[];
  quelle: { label: string; url: string };
  stand: string;
};

export const FOERDER_STAND = "14.11.2026";

/**
 * Recherche 14.11.2026 (Primärquellen). Bewusst NICHT aufgenommen, weil ausgelaufen/nicht verfügbar:
 * KfW 442 und 440 (Wallbox), Bayern 10.000-Häuser-/PV-Speicher-Programm (2022 eingestellt),
 * Bayern Ladeinfrastruktur 2026–2029 (nur öffentliche Ladepunkte/E-Lkw, Aufrufe geschlossen),
 * Bund „Laden im Mehrparteienhaus“ (beendet). Gemeinde Karlsfeld und Landkreis Dachau: keine eigenen Zuschüsse.
 * Offen: EEG-Neuregelung für Inbetriebnahmen ab 1.1.2027 (Novelle nicht verabschiedet) → keine Sätze dafür.
 */
export const programme: Programm[] = [
  {
    id: "eeg",
    name: "EEG-Einspeisevergütung",
    ebene: "Bund",
    art: "verguetung",
    fuer: ["pv"],
    kurz: "Feste Vergütung für eingespeisten Solarstrom, 20 Jahre ab Inbetriebnahme.",
    hoehe:
      "Inbetriebnahme 1.8.–31.12.2026, Teileinspeisung: bis 10 kW 7,70 ct/kWh · 10–40 kW 6,66 ct/kWh · 40–100 kW 5,44 ct/kWh. Volleinspeisung: bis 10 kW 12,22 ct/kWh · 10–100 kW 10,24 ct/kWh.",
    bedingungen: [
      "Für Inbetriebnahmen ab 1.1.2027 ist die Neuregelung noch nicht beschlossen.",
      "Neue Anlagen: keine Vergütung in Zeiten negativer Börsenpreise (Zeit wird am Ende angehängt).",
      "Ab 7 kWp Smart Meter und Steuerbox – sonst Einspeisung auf 60 % begrenzt.",
      "Volleinspeisung vor Inbetriebnahme beim Netzbetreiber melden.",
    ],
    quelle: {
      label: "Bundesnetzagentur",
      url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/EEG_Foerderung/start.html",
    },
    stand: "14.11.2026",
  },
  {
    id: "kfw270",
    name: "KfW 270 – Erneuerbare Energien Standard",
    ebene: "Bund",
    art: "kredit",
    fuer: ["pv", "speicher", "zaehler"],
    vorBeginn: true,
    kurz: "Förderkredit für Photovoltaik, Batteriespeicher sowie Mess- und Steuertechnik – bis zu 100 % der Kosten.",
    hoehe: "Zinssatz wird am Tag der Zusage festgelegt (aktuelle Konditionen bei der KfW).",
    bedingungen: [
      "Antrag über die Hausbank vor Vorhabenbeginn.",
      "Privatpersonen müssen einen Teil des Stroms einspeisen.",
      "Zählerschrank nur als Teil der Investition in die Anlage, nicht einzeln.",
    ],
    quelle: {
      label: "KfW",
      url: "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/F%C3%B6rderprodukte/Erneuerbare-Energien-Standard-(270)/",
    },
    stand: "14.11.2026",
  },
  {
    id: "nullsteuer",
    name: "Nullsteuersatz für Photovoltaik",
    ebene: "Bund",
    art: "steuer",
    fuer: ["pv", "speicher"],
    gebaeude: ["efh", "mfh"],
    kurz: "0 % Umsatzsteuer auf Lieferung und Installation von Modulen, wesentlichen Komponenten und Speichern.",
    bedingungen: [
      "Anlage auf oder in der Nähe von Wohngebäuden (bzw. Gebäuden für das Gemeinwohl).",
      "Bis 30 kWp laut Marktstammdatenregister gilt die Voraussetzung als erfüllt.",
    ],
    quelle: { label: "§ 12 Abs. 3 UStG", url: "https://www.gesetze-im-internet.de/ustg_1980/__12.html" },
    stand: "14.11.2026",
  },
  {
    id: "est",
    name: "Einkommensteuerbefreiung für PV-Einnahmen",
    ebene: "Bund",
    art: "steuer",
    fuer: ["pv"],
    kurz: "Einnahmen aus Photovoltaikanlagen auf, an oder in Gebäuden sind steuerfrei.",
    bedingungen: ["Bis 30 kWp je Wohn- oder Gewerbeeinheit, insgesamt höchstens 100 kWp je Steuerpflichtigem."],
    quelle: { label: "§ 3 Nr. 72 EStG", url: "https://www.gesetze-im-internet.de/estg/__3.html" },
    stand: "14.11.2026",
  },
  {
    id: "handwerker",
    name: "Steuerermäßigung für Handwerkerleistungen",
    ebene: "Bund",
    art: "steuer",
    fuer: ["pv"],
    gebaeude: ["efh", "mfh"],
    nutzung: ["selbst"],
    kurz: "20 % der Arbeitskosten der Installation im eigenen Haushalt mindern die Einkommensteuer.",
    hoehe: "20 % der Arbeitskosten, höchstens 1.200 € pro Jahr und Haushalt.",
    bedingungen: [
      "Nur Arbeitskosten, nicht Material.",
      "Rechnung und Überweisung erforderlich (keine Barzahlung).",
      "Nicht für öffentlich geförderte Maßnahmen mit zinsverbilligtem Darlehen oder steuerfreiem Zuschuss.",
    ],
    quelle: { label: "§ 35a EStG", url: "https://www.gesetze-im-internet.de/estg/__35a.html" },
    stand: "14.11.2026",
  },
  {
    id: "14a",
    name: "Reduziertes Netzentgelt (§ 14a EnWG)",
    ebene: "Bund",
    art: "netzentgelt",
    fuer: ["wallbox", "speicher"],
    kurz:
      "Für steuerbare Verbraucher wie Wallbox oder Speicher (Strombezug über 4,2 kW) senkt der Netzbetreiber das Netzentgelt.",
    hoehe: "Modul 1: Pauschale je Netzbetreiber · Modul 2: Arbeitspreis des Netzentgelts um 60 % reduziert (separater Zähler) · Modul 3: zeitvariabel, nur mit Modul 1.",
    bedingungen: [
      "Pflicht für neue Anlagen seit 1.1.2024.",
      "Der Netzbetreiber darf die Leistung im Ausnahmefall auf 4,2 kW begrenzen.",
    ],
    quelle: {
      label: "Bundesnetzagentur",
      url: "https://www.bundesnetzagentur.de/DE/Vportal/Energie/SteuerbareVBE/start.html",
    },
    stand: "14.11.2026",
  },
  {
    id: "lfa",
    name: "LfA Energiekredit Regenerativ",
    ebene: "Bayern",
    art: "kredit",
    fuer: ["pv", "speicher"],
    gebaeude: ["gewerbe"],
    vorBeginn: true,
    kurz: "Förderkredit für gewerbliche Unternehmen und Freiberufler: Photovoltaik und Speicher (aus PV gespeist).",
    hoehe: "Bis 100 % der förderfähigen Kosten; Richtlinie gültig bis 31.12.2028.",
    bedingungen: ["Antrag über die Hausbank.", "Nicht für Privatpersonen."],
    quelle: {
      label: "Umweltpakt Bayern",
      url: "https://www.umweltpakt.bayern.de/werkzeuge/foerderfibel/programme/391/energiekredit-regenerativ",
    },
    stand: "15.01.2026",
  },
];

/** Regionale Lage (Stand 14.11.2026): keine eigenen Zuschüsse, aber kostenlose Energieberatung. */
export const regional = {
  text: "Gemeinde Karlsfeld und Landkreis Dachau haben derzeit keine eigenen Zuschussprogramme für Photovoltaik, Speicher oder Wallbox. Beide bieten eine kostenlose Energieberatung an.",
  quellen: [
    { label: "Gemeinde Karlsfeld", url: "https://www.karlsfeld.de/foerderprogramme" },
    {
      label: "Landratsamt Dachau",
      url: "https://www.landratsamt-dachau.de/abfall-naturschutz-umwelt/klimaschutz/energieberatung/",
    },
  ],
  stand: "14.11.2026",
};

export const ART_LABEL: Record<FoerderArt, string> = {
  zuschuss: "Zuschuss",
  kredit: "Kredit",
  steuer: "Steuer",
  verguetung: "Vergütung",
  netzentgelt: "Netzentgelt",
};
