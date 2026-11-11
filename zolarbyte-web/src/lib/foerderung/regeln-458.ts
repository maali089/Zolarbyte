/**
 * Förderregeln KfW 458 – Heizungsförderung für Privatpersonen (Wohngebäude)
 * ==========================================================================
 * Stand der Prüfung: 11.11.2026 (alle Werte live aus den offiziellen Dokumenten gelesen).
 *
 * Rechtsgrundlage:
 *  - BEG EM Förderrichtlinie „vom 17. August 2026“, BAnz AT 27.08.2026 B1,
 *    in Kraft mit Wirkung vom 21.07.2026, gilt bis 31.12.2030 (Nr. 10).
 *  - KfW-Merkblatt 458, „Gültig ab 24.09.2026“, Stand 09/2026, Bestell-Nr. 600 000 5131.
 *  - KfW Infoblatt förderfähige Maßnahmen V 11.1 (ab 01.11.2026), TFAQ EM V 8.0 (ab 01.11.2026).
 *
 * Pflege: Jede Regel hat Quelle und Gültigkeit. Bei Änderungen dieses Datei-Stand-Datum,
 * die betroffenen Werte und die Tests (berechnung.test.ts) anpassen.
 * Ausführliche Quellenliste: docs/foerderrechner-quellen.md
 *
 * Diese Datei enthält bewusst keine Werte aus dem Gedächtnis.
 */

export const STAND = "11.11.2026";

export const SOURCES = {
  richtlinie: {
    title: "BEG EM Förderrichtlinie vom 17. August 2026 (BAnz AT 27.08.2026 B1)",
    url: "https://www.bundesanzeiger.de/pub/publication/jLXvW09kHTQoDINAdoC/content/jLXvW09kHTQoDINAdoC/BAnz%20AT%2027.08.2026%20B1.pdf?inline",
  },
  merkblatt: {
    title: "KfW-Merkblatt 458, gültig ab 24.09.2026 (Stand 09/2026)",
    url: "https://www.kfw.de/PDF/Download-Center/F%C3%B6rderprogramme-(Inlandsf%C3%B6rderung)/PDF-Dokumente/6000005131_M_458.pdf",
  },
  produktseite: {
    title: "KfW-Produktseite 458 mit Rechenbeispielen",
    url: "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/F%C3%B6rderprodukte/Heizungsf%C3%B6rderung-f%C3%BCr-Privatpersonen-Wohngeb%C3%A4ude-(458)/",
  },
  infoblatt: {
    title: "KfW Infoblatt förderfähige Maßnahmen, Version 11.1 (ab 01.11.2026)",
    url: "https://www.kfw.de/PDF/Download-Center/F%C3%B6rderprogramme-(Inlandsf%C3%B6rderung)/PDF-Dokumente/6000004863_Infoblatt_BEG_F%C3%B6rderf%C3%A4hige_Ma%C3%9Fnahmen.pdf",
  },
  kredit: {
    title: "KfW-Merkblatt Ergänzungskredit 358/359, gültig ab 24.09.2026",
    url: "https://www.kfw.de/PDF/Download-Center/F%C3%B6rderprogramme-(Inlandsf%C3%B6rderung)/PDF-Dokumente/6000005135_M_358_359.pdf",
  },
  estg35c: {
    title: "§ 35c EStG (gesetze-im-internet.de)",
    url: "https://www.gesetze-im-internet.de/estg/__35c.html",
  },
} as const;

/** Zeitraum, in dem dieser Regelstand Anträge abbildet */
export const VALIDITY = {
  /** Inkrafttreten BEG EM 2026 (rückwirkend) – frühere Anträge: alte Richtlinie */
  from: "2026-07-21",
  /** Ende der Richtlinie */
  to: "2030-12-31",
  source: "BEG EM 2026, Nr. 10",
} as const;

/** Grundförderung: 30 % der förderfähigen Kosten (BEG EM 8.4.1 c; Merkblatt S. 3) */
export const GRUNDFOERDERUNG = { percent: 30, source: "BEG EM 8.4.1 c; Merkblatt 458 S. 3" } as const;

/**
 * Angekündigt „ab dem ersten Quartal 2027“: Grundförderung Wärmepumpe 15 %,
 * zusätzlich 15 Prozentpunkte Wertschöpfungs-Bonus bei Ursprung in der EU.
 * Startdatum offiziell NICHT festgelegt → wird nicht als Regel angewendet,
 * sondern nur als Hinweis/Szenario gezeigt (BEG EM 5.3, 8.4.6; Infoblatt 1.8).
 */
export const ANGEKUENDIGT_Q1_2027 = {
  earliest: "2027-01-01",
  grundfoerderungPercent: 15,
  wertschoepfungsBonusPercent: 15,
  source: "BEG EM 8.4.1 c und 8.4.6; Infoblatt V 11.1 Nr. 1.8 (Datum offen)",
} as const;

/**
 * Klimageschwindigkeitsbonus nach Antragsdatum (BEG EM 8.4.4; Merkblatt S. 4).
 * Nur selbstnutzende Eigentümer, nur für die selbstgenutzte Wohneinheit.
 */
export const KLIMA_BONUS = [
  { from: "2026-07-21", to: "2027-01-31", percent: 16 },
  { from: "2027-02-01", to: "2027-07-31", percent: 12 },
  { from: "2027-08-01", to: "2028-01-31", percent: 8 },
  { from: "2028-02-01", to: "2028-07-31", percent: 4 },
  { from: "2028-08-01", to: "2030-12-31", percent: 0 },
] as const;

export const KLIMA_BONUS_RULES = {
  /** ohne Altersgrenze, wenn funktionstüchtig */
  anyAge: ["oil", "coal", "gas_floor", "night_storage"] as const,
  /** nur wenn Inbetriebnahme bei Antragstellung mindestens 20 Jahre zurückliegt */
  minAge20: ["gas", "biomass"] as const,
  minAgeYears: 20,
  source: "BEG EM 8.4.4",
} as const;

/** Einkommensbonus nach zu versteuerndem Haushaltsjahreseinkommen (BEG EM 8.4.5) */
export const EINKOMMENS_BONUS = [
  { upTo: 30000, percent: 40 },
  { upTo: 40000, percent: 30 },
  { upTo: 50000, percent: 10 },
] as const;

/** Familienzuschlag: pauschal einmalig −10.000 € bei mind. einem minderjährigen Kind im Haushalt (BEG EM 8.4.5) */
export const FAMILIENZUSCHLAG = { amount: 10000, source: "BEG EM 8.4.5; Merkblatt 458 S. 4" } as const;

/** Obergrenze je Wohneinheit: 80 % bei zvE bis 30.000 € (nach Familienzuschlag), sonst 70 % (BEG EM 8.4.1) */
export const OBERGRENZE = { lowIncomeLimit: 30000, lowIncomePercent: 80, percent: 70, source: "BEG EM 8.4.1" } as const;

/** Förderfähige Höchstkosten erste Wohneinheit nach Antragsdatum (BEG EM 8.3.1 a) */
export const HOECHSTKOSTEN_WE1 = [
  { from: "2026-07-21", to: "2027-01-31", amount: 28000 },
  { from: "2027-02-01", to: "2027-07-31", amount: 27250 },
  { from: "2027-08-01", to: "2028-01-31", amount: 26500 },
  { from: "2028-02-01", to: "2028-07-31", amount: 25750 },
  { from: "2028-08-01", to: "2029-01-31", amount: 25000 },
  { from: "2029-02-01", to: "2029-07-31", amount: 24250 },
  { from: "2029-08-01", to: "2030-01-31", amount: 23500 },
  { from: "2030-02-01", to: "2030-07-31", amount: 22750 },
  { from: "2030-08-01", to: "2030-12-31", amount: 22000 },
] as const;

/** Weitere Wohneinheiten (BEG EM 8.3.1 a) */
export const HOECHSTKOSTEN_WEITERE = { we2bis6: 15000, abWe7: 8000 } as const;

/** Mindestinvestition 300 € brutto (Merkblatt S. 2) */
export const MINDESTINVESTITION = 300;

/** Gebäude: Bauantrag mind. 5 Jahre vor Antragstellung (Merkblatt S. 2; BEG EM 3a) */
export const GEBAEUDE_MIN_JAHRE = 5;

/** Ergänzungskredit (nur Information, wird nicht addiert) – Merkblatt 358/359 */
export const KREDIT = {
  maxPerUnit: 120000,
  plusIncomeLimit: 90000,
  source: SOURCES.kredit,
} as const;

/** Steuerliche Alternative § 35c EStG (nicht mit 458 für dieselbe Maßnahme kombinierbar) */
export const STEUER_35C = {
  percentTotal: 20,
  maxReduction: 40000,
  minBuildingAgeYears: 10,
  completedBefore: "2030-01-01",
  source: SOURCES.estg35c,
} as const;
