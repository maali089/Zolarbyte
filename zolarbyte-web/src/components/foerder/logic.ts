import { programme, type Programm, type Vorhaben } from "@/lib/foerderung";
import { STEUER_35C } from "@/lib/foerderung458/regeln-458";
import { calculate, eur, type CalcInput, type CalcResult, type OldHeating } from "@/lib/foerderung458/berechnung";

type Ynu = "yes" | "no" | "unknown";

export type Answers = {
  vorhaben: Vorhaben[];
  ort: "karlsfeld" | "dachau" | "muenchen" | "bayern" | "";
  gebaeude: "efh" | "mfh" | "gewerbe" | "";
  rolle: "selbst" | "vermietet" | "unternehmen" | "";
  groesse: "bis10" | "bis30" | "bis100" | "offen" | "";
  einspeisung: "teil" | "voll" | "offen" | "";
  start: "2026" | "2027" | "offen" | "";
  stand: "offen" | "angebot" | "beauftragt" | "";
  kredit: "ja" | "nein" | "offen" | "";
  /* --- Wärmepumpe (KfW 458) --- */
  wpEigentum: "owner" | "weg" | "gbr" | "andere" | "";
  wpWohnungen: string;
  wpBauantrag: "" | Ynu;
  wpHeizung: "" | Exclude<OldHeating, "other">;
  wpJahr: string;
  wpJahrOffen: boolean;
  wpFunktion: "" | Ynu;
  wpFossil: "" | Ynu;
  wpKosten: "bekannt" | "offen" | "";
  wpBetrag: string;
  wpOhneFoerderung: string;
  wpEinkommen: "bis30" | "bis40" | "bis50" | "bis60" | "ueber60" | "keine" | "";
  wpKinder: "" | Ynu;
  wpAntrag: "jetzt" | "h1-2027" | "h2-2027" | "2028" | "offen" | "";
  wpVertrag: "bedingt" | "unbedingt" | "offen" | "";
};

export const EMPTY: Answers = {
  vorhaben: [],
  ort: "",
  gebaeude: "",
  rolle: "",
  groesse: "",
  einspeisung: "",
  start: "",
  stand: "",
  kredit: "",
  wpEigentum: "",
  wpWohnungen: "",
  wpBauantrag: "",
  wpHeizung: "",
  wpJahr: "",
  wpJahrOffen: false,
  wpFunktion: "",
  wpFossil: "",
  wpKosten: "",
  wpBetrag: "",
  wpOhneFoerderung: "",
  wpEinkommen: "",
  wpKinder: "",
  wpAntrag: "",
  wpVertrag: "",
};

export type ResultItem = {
  p: Programm;
  /** Konkreter Satz / Kernaussage für diese Antworten */
  detail?: string;
  /** Wichtiger Hinweis (z. B. Frist, Einschränkung) */
  hinweis?: string;
  /** passt · pruefen = im Einzelfall prüfen · nein = voraussichtlich nicht förderfähig · nicht-mehr = Frist verpasst */
  status: "passt" | "pruefen" | "nein" | "nicht-mehr";
  /** Nur KfW 458: Rechenergebnis samt Annahmen für die Detailansicht */
  wp?: WpInfo;
};

export type WpOk = Extract<CalcResult, { status: "ok" }>;

export type WpInfo =
  | { kind: "ok"; calc: WpOk; units: number; costs: number | null; extra: string[] }
  | { kind: "nein"; reasons: string[]; hints: string[] }
  | { kind: "beratung"; reason: string; hints: string[] };

/** Ergebnis zählt als „passend“ (nicht ausgeschlossen, nicht verpasst) */
export const isFitting = (r: ResultItem) => r.status === "passt" || r.status === "pruefen";

/* ---------- Wärmepumpe: Ableitungen aus den Antworten ---------- */

export const parseNum = (s: string) => {
  const t = s.replace(/\./g, "").replace(/\s/g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Heizungsarten, für die der Klimageschwindigkeitsbonus in Frage kommt */
const BONUS_HEATINGS = ["oil", "coal", "gas_floor", "night_storage", "gas", "biomass"];

/** Wärmepumpen-Fragen gelten nur für Wohngebäude von Privatpersonen */
export const wpAsked = (a: Answers) => a.vorhaben.includes("waermepumpe");
export const wpActive = (a: Answers) => wpAsked(a) && a.gebaeude !== "gewerbe" && a.rolle !== "unternehmen";
export const wpSelf = (a: Answers) => a.rolle === "selbst";
export const wpNeedsYear = (a: Answers) => wpSelf(a) && (a.wpHeizung === "gas" || a.wpHeizung === "biomass");
export const wpNeedsZustand = (a: Answers) => wpSelf(a) && BONUS_HEATINGS.includes(a.wpHeizung);
export const wpNeedsKinder = (a: Answers) => wpSelf(a) && ["bis40", "bis50", "bis60"].includes(a.wpEinkommen);

/** Anzahl Wohnungen oder null, wenn leer/ungültig */
export function wpUnits(a: Answers): number | null {
  const n = parseNum(a.wpWohnungen);
  if (!Number.isInteger(n)) return null;
  if (a.gebaeude === "efh") return n === 1 || n === 2 ? n : null;
  return n >= 2 && n <= 200 ? n : null;
}

export function wpUnitsError(a: Answers): string {
  if (a.gebaeude !== "mfh" || !a.wpWohnungen.trim() || wpUnits(a) !== null) return "";
  return "Bitte eine ganze Zahl von 2 bis 200 angeben.";
}

export function wpYearError(a: Answers): string {
  if (!a.wpJahr.trim() || a.wpJahrOffen) return "";
  const max = Number(todayIso().slice(0, 4));
  const y = parseNum(a.wpJahr);
  return Number.isInteger(y) && y >= 1900 && y <= max ? "" : `Bitte ein Jahr zwischen 1900 und ${max} angeben.`;
}

export function wpBetragError(a: Answers): string {
  if (!a.wpBetrag.trim()) return "";
  const n = parseNum(a.wpBetrag);
  if (!Number.isFinite(n) || n <= 0 || n > 5_000_000) return "Bitte einen Betrag zwischen 1 und 5.000.000 € angeben.";
  return "";
}

export function wpOhneError(a: Answers): string {
  if (!a.wpOhneFoerderung.trim()) return "";
  const n = parseNum(a.wpOhneFoerderung);
  if (!Number.isFinite(n) || n < 0) return "Bitte einen Betrag ab 0 € angeben.";
  const total = parseNum(a.wpBetrag);
  if (Number.isFinite(total) && n > total) return "Darf nicht höher sein als die Gesamtkosten.";
  return "";
}

/** Stichtag je Antragszeitraum: bewusst der für Sie ungünstigste Tag des Zeitraums (Bonus und Höchstbetrag sinken stufenweise) */
export const ANTRAG_STICHTAG: Record<"h1-2027" | "h2-2027" | "2028", string> = {
  "h1-2027": "2027-06-30",
  "h2-2027": "2027-12-31",
  "2028": "2028-12-31",
};

const EINKOMMEN_OBERGRENZE: Record<string, number | null> = {
  bis30: 30000,
  bis40: 40000,
  bis50: 50000,
  bis60: 60000,
  ueber60: 60001,
  keine: null,
};

/** EEG-Sätze (Inbetriebnahme 1.8.–31.12.2026), Quelle: Bundesnetzagentur, Stand 14.11.2026 */
const EEG = {
  teil: { bis10: "7,70 ct/kWh", bis40: "6,66 ct/kWh", bis100: "5,44 ct/kWh" },
  voll: { bis10: "12,22 ct/kWh", bis100: "10,24 ct/kWh" },
};

function eegDetail(a: Answers): { detail?: string; hinweis?: string; status: ResultItem["status"] } {
  if (a.start === "2027")
    return {
      status: "pruefen",
      hinweis: "Für Inbetriebnahmen ab 1.1.2027 ist die Neuregelung noch nicht beschlossen – Sätze stehen noch nicht fest.",
    };
  const voll = a.einspeisung === "voll";
  const g = a.groesse;
  let detail: string | undefined;
  if (g === "bis10") detail = voll ? `${EEG.voll.bis10} (Volleinspeisung)` : `${EEG.teil.bis10} für eingespeisten Überschuss`;
  else if (g === "bis30")
    detail = voll
      ? `bis 10 kW ${EEG.voll.bis10}, darüber anteilig ${EEG.voll.bis100} (Volleinspeisung)`
      : `bis 10 kW ${EEG.teil.bis10}, darüber anteilig ${EEG.teil.bis40}`;
  else if (g === "bis100")
    detail = voll
      ? `bis 10 kW ${EEG.voll.bis10}, darüber anteilig ${EEG.voll.bis100} (Volleinspeisung)`
      : `bis 10 kW ${EEG.teil.bis10} · 10–40 kW ${EEG.teil.bis40} · 40–100 kW ${EEG.teil.bis100}`;
  else detail = `Teileinspeisung ab ${EEG.teil.bis100} bis ${EEG.teil.bis10}, Volleinspeisung ${EEG.voll.bis100} bis ${EEG.voll.bis10} – je nach Größe`;
  return {
    status: a.start === "offen" ? "pruefen" : "passt",
    detail: `${detail} · 20 Jahre fest`,
    hinweis:
      a.start === "offen"
        ? "Gilt für Inbetriebnahme bis 31.12.2026. Danach greift eine noch nicht beschlossene Neuregelung."
        : "Gilt für Inbetriebnahme bis 31.12.2026.",
  };
}

export function buildResults(a: Answers): ResultItem[] {
  const out: ResultItem[] = [];
  const has = (v: Vorhaben) => a.vorhaben.includes(v);
  const wohn = a.gebaeude === "efh" || a.gebaeude === "mfh";
  const privat = a.rolle === "selbst" || a.rolle === "vermietet";
  const beauftragt = a.stand === "beauftragt";
  const get = (id: string) => programme.find((p) => p.id === id)!;

  if (has("pv")) {
    const e = eegDetail(a);
    out.push({ p: get("eeg"), ...e });
  }

  if ((has("pv") || has("speicher")) && wohn) {
    out.push({
      p: get("nullsteuer"),
      detail: "0 % Umsatzsteuer auf Module, Wechselrichter, Speicher und Installation",
      status: a.groesse === "bis100" ? "pruefen" : "passt",
      hinweis: a.groesse === "bis100" ? "Über 30 kWp: Voraussetzungen im Einzelfall prüfen." : undefined,
    });
  }

  if (has("pv")) {
    out.push({
      p: get("est"),
      detail: "Einnahmen aus der Anlage bleiben einkommensteuerfrei",
      status: a.groesse === "bis100" ? "pruefen" : "passt",
      hinweis: a.groesse === "bis100" ? "Grenze: 30 kWp je Wohn-/Gewerbeeinheit, max. 100 kWp je Person." : undefined,
    });
  }

  const kfwPassend = (has("pv") || has("speicher") || has("zaehler")) && (privat || a.rolle === "unternehmen") && a.gebaeude !== "gewerbe";
  if (kfwPassend && a.kredit !== "nein") {
    out.push({
      p: get("kfw270"),
      detail: "Bis zu 100 % der Kosten als Förderkredit über die Hausbank",
      status: beauftragt ? "nicht-mehr" : "passt",
      hinweis: beauftragt
        ? "Antrag nur vor Vorhabenbeginn – bei bereits beauftragtem Vorhaben in der Regel ausgeschlossen."
        : "Antrag bei der Hausbank stellen, bevor Sie den Auftrag vergeben.",
    });
  }

  if (has("pv") && a.rolle === "selbst" && wohn) {
    out.push({
      p: get("handwerker"),
      detail: "20 % der Arbeitskosten, höchstens 1.200 € im Jahr",
      status: a.kredit === "ja" ? "pruefen" : "passt",
      hinweis:
        a.kredit === "ja"
          ? "Nicht für Maßnahmen, die mit öffentlich gefördertem Kredit finanziert werden – mit KfW-Kredit in der Regel ausgeschlossen."
          : undefined,
    });
  }

  if (has("wallbox") || has("speicher")) {
    out.push({
      p: get("14a"),
      detail: has("wallbox") ? "Wallbox über 4,2 kW: reduziertes Netzentgelt" : "Speicher mit Netzbezug über 4,2 kW: reduziertes Netzentgelt",
      status: "passt",
    });
  }

  if ((has("pv") || has("speicher")) && (a.gebaeude === "gewerbe" || a.rolle === "unternehmen") && a.kredit !== "nein") {
    out.push({
      p: get("lfa"),
      detail: "Förderkredit für Unternehmen und Freiberufler in Bayern",
      status: beauftragt ? "nicht-mehr" : "passt",
      hinweis: "Antrag über die Hausbank.",
    });
  }

  if (has("waermepumpe")) {
    out.push(...waermepumpeResults(a, get));
  }

  const order = { passt: 0, pruefen: 1, nein: 2, "nicht-mehr": 3 };
  return out.sort((x, y) => order[x.status] - order[y.status]);
}

/* ---------- KfW 458 und § 35c EStG ---------- */

const fmtDate = (d: string) => d.split("-").reverse().join(".");
const NOT_EU_NOTE = "Für 2027 ist angekündigt";

function waermepumpeResults(a: Answers, get: (id: string) => Programm): ResultItem[] {
  const p458 = get("kfw458");
  const p35c = get("est35c");

  /* Gewerbe und Unternehmen: außerhalb des Programms */
  if (!wpActive(a)) {
    return [
      {
        p: p458,
        status: "nein",
        detail: "Gilt für Wohngebäude von Privatpersonen",
        hinweis: "Für Gewerbegebäude und Unternehmen gelten andere Programme. Wir schauen im Gespräch, was für Sie passt.",
        wp: {
          kind: "nein",
          reasons: ["Die Heizungsförderung 458 gilt für Wohngebäude und richtet sich an Privatpersonen."],
          hints: ["Für Gewerbegebäude und Unternehmen gelten andere Programme. Sprechen Sie uns an, wir klären das mit Ihnen."],
        },
      },
    ];
  }

  const selfUse = wpSelf(a);
  const units = wpUnits(a) ?? 1;
  const today = todayIso();
  const costs = a.wpKosten === "bekannt" ? parseNum(a.wpBetrag) : null;
  const antrag = a.wpAntrag;
  const applicationDate = antrag === "jetzt" ? today : antrag === "h1-2027" || antrag === "h2-2027" || antrag === "2028" ? ANTRAG_STICHTAG[antrag] : null;

  const projectStarted: Ynu =
    a.stand === "beauftragt" ? (a.wpVertrag === "bedingt" ? "no" : a.wpVertrag === "unbedingt" ? "yes" : "unknown") : "no";

  const input: CalcInput = {
    today,
    applicationDate,
    applicant: a.wpEigentum === "owner" ? "owner" : a.wpEigentum === "weg" ? "weg" : a.wpEigentum === "gbr" ? "gbr_niessbrauch" : "other",
    projectStarted,
    buildingOldEnough: a.wpBauantrag || "unknown",
    units,
    mixedUse: false,
    residentialOver50: "yes",
    selfUse,
    oldHeating: a.wpHeizung || "unknown",
    oldHeatingYear: wpNeedsYear(a) && !a.wpJahrOffen && a.wpJahr ? parseNum(a.wpJahr) : null,
    oldHeatingWorking: a.wpFunktion || "unknown",
    fossilRemains: a.wpFossil || "unknown",
    newHeating: "wp_air_water",
    costs,
    nonEligibleCosts: costs !== null && a.wpOhneFoerderung.trim() ? parseNum(a.wpOhneFoerderung) : 0,
    income: selfUse ? EINKOMMEN_OBERGRENZE[a.wpEinkommen] ?? null : null,
    children: wpNeedsKinder(a) ? a.wpKinder || "unknown" : "no",
  };

  const calc = calculate(input);
  const out: ResultItem[] = [];

  if (calc.status === "ok") {
    const extra: string[] = [];
    if (applicationDate && antrag !== "jetzt")
      extra.push(
        `Antragstermin: gerechnet mit dem ${fmtDate(applicationDate)}, dem ungünstigsten Tag Ihres Zeitraums. Klimageschwindigkeitsbonus und Höchstbetrag sinken stufenweise, ein früherer Antrag kann mehr bringen.`,
      );
    if (a.wpEinkommen && a.wpEinkommen !== "keine" && selfUse)
      extra.push("Einkommen: gerechnet mit dem oberen Ende Ihrer Spanne. Liegt Ihr Einkommen darunter, kann der Einkommensbonus höher ausfallen.");
    const clean: WpOk = { ...calc, openPoints: calc.openPoints.filter((x) => !x.startsWith(NOT_EU_NOTE)) };
    const rate = clean.effectiveRate.toLocaleString("de-DE");
    const unclear = a.wpBauantrag !== "yes" || projectStarted === "unknown";
    const hinweis =
      a.stand === "beauftragt"
        ? "Bereits beauftragt: Förderfähig bleibt das Vorhaben nur, wenn der Vertrag ausdrücklich von der Förderzusage abhängt (aufschiebende oder auflösende Bedingung) und die Arbeiten noch nicht begonnen haben."
        : "Der Antrag kommt vor dem Vertrag. Unterschreiben Sie nur einen Vertrag, der ausdrücklich von der Förderzusage abhängt.";
    out.push({
      p: p458,
      status: unclear ? "pruefen" : "passt",
      detail: `Voraussichtlich ${eur(clean.grant)} Zuschuss · ${rate} % von ${eur(clean.consideredCosts)}${clean.costsAssumed ? " (Höchstbetrag, Kosten noch offen)" : ""}`,
      hinweis,
      wp: { kind: "ok", calc: clean, units, costs, extra },
    });
  } else if (calc.status === "not_eligible") {
    out.push({
      p: p458,
      status: "nein",
      hinweis: calc.reasons[0],
      wp: { kind: "nein", reasons: calc.reasons, hints: calc.hints },
    });
  } else {
    const reason = calc.status === "unsupported" ? calc.reason : Object.values(calc.errors).join(" ");
    const hints = calc.status === "unsupported" ? calc.hints : ["Bitte prüfen Sie die Angaben."];
    out.push({
      p: p458,
      status: "pruefen",
      detail: "Persönliche Prüfung nötig",
      hinweis: reason,
      wp: { kind: "beratung", reason, hints },
    });
  }

  /* § 35c EStG: Alternative für Selbstnutzer, nicht mit 458 für dieselbe Maßnahme kombinierbar */
  if (selfUse && a.wpEigentum === "owner") {
    out.push({
      p: p35c,
      status: "pruefen",
      detail: `Alternative zum Zuschuss: ${STEUER_35C.percentTotal} % der Kosten über drei Jahre, höchstens ${eur(STEUER_35C.maxReduction)}`,
      hinweis: "Nicht mit dem KfW-Zuschuss für dieselbe Maßnahme kombinierbar. Voraussetzung: Das Gebäude ist älter als zehn Jahre.",
    });
  }
  return out;
}
