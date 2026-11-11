/**
 * Berechnung des voraussichtlichen Zuschusses KfW 458.
 * Rein lokal, ohne Netzwerk. Regeln: ./regeln-458.ts
 *
 * Grundsätze:
 *  - Zuschuss, Kredit, Steuer und Einspeisung werden NIE addiert.
 *  - Fehlt eine Angabe, wird konservativ gerechnet und die Lücke als offener Punkt benannt.
 *  - Nicht abgebildete Fälle liefern status "unsupported" mit Erklärung – keine 0 €.
 */
import {
  ANGEKUENDIGT_Q1_2027,
  EINKOMMENS_BONUS,
  FAMILIENZUSCHLAG,
  GRUNDFOERDERUNG,
  HOECHSTKOSTEN_WE1,
  HOECHSTKOSTEN_WEITERE,
  KLIMA_BONUS,
  KLIMA_BONUS_RULES,
  MINDESTINVESTITION,
  OBERGRENZE,
  VALIDITY,
} from "./regeln-458.ts";

export type YesNoUnknown = "yes" | "no" | "unknown";

export type Applicant =
  | "owner" // Eigentümer des ganzen Gebäudes (EFH, ZFH, MFH)
  | "weg" // Wohnungseigentum / WEG
  | "tenant"
  | "gbr_niessbrauch"
  | "other";

export type OldHeating =
  | "oil"
  | "coal"
  | "gas_floor"
  | "night_storage"
  | "gas"
  | "biomass"
  | "renewable"
  | "district"
  | "other"
  | "unknown";

export type NewHeating = "wp_air_water" | "wp_ground" | "wp_water" | "wp_air_air";

export type CalcInput = {
  /** Heutiges Datum (YYYY-MM-DD) – für Plausibilität */
  today: string;
  /** Geplantes Antragsdatum oder null = „weiß ich noch nicht“ (dann: heute) */
  applicationDate: string | null;
  applicant: Applicant;
  /** Vertrag ohne Förderbedingung geschlossen oder Arbeiten begonnen? */
  projectStarted: YesNoUnknown;
  /** Bauantrag mindestens 5 Jahre vor Antragstellung? */
  buildingOldEnough: YesNoUnknown;
  /** Anzahl Wohneinheiten (nur Wohnungen, keine Gewerbeeinheiten) */
  units: number;
  /** Gewerbeanteil vorhanden? Dann: Wohnfläche > 50 % der beheizten Fläche? */
  mixedUse: boolean;
  residentialOver50: YesNoUnknown;
  /** Selbstnutzung einer Wohneinheit als Haupt- oder alleiniger Wohnsitz */
  selfUse: boolean;
  oldHeating: OldHeating;
  /** Inbetriebnahmejahr der alten Heizung (nur Gas/Biomasse relevant) */
  oldHeatingYear: number | null;
  oldHeatingWorking: YesNoUnknown;
  /** Bleibt nach dem Tausch eine Öl-/Gasheizung für dieselben Räume in Betrieb? */
  fossilRemains: YesNoUnknown;
  newHeating: NewHeating;
  /** Geplante Investitionskosten brutto oder null = unbekannt */
  costs: number | null;
  /** Darin enthaltene nicht förderfähige Kosten (z. B. PV, Speicher) */
  nonEligibleCosts: number;
  /** Durchschnittliches zu versteuerndes Haushaltsjahreseinkommen oder null = keine Angabe */
  income: number | null;
  children: YesNoUnknown;
};

export type Line = { label: string; amount: number; note?: string };

export type CalcResult =
  | { status: "invalid"; errors: Partial<Record<keyof CalcInput, string>> }
  | { status: "not_eligible"; reasons: string[]; hints: string[] }
  | { status: "unsupported"; reason: string; hints: string[] }
  | {
      status: "ok";
      grant: number;
      /** angewandter Fördersatz bezogen auf die berücksichtigten Kosten (in %) */
      effectiveRate: number;
      consideredCosts: number;
      eligibleCosts: number;
      costCap: number;
      costsAssumed: boolean;
      applicationDate: string;
      dateAssumed: boolean;
      lines: Line[];
      capReduction: number;
      selfUseShare: number | null;
      unitRate: number | null;
      remaining: number | null;
      assumptions: string[];
      openPoints: string[];
      /** Szenarien, falls offene Punkte zutreffen (nicht addieren) */
      scenarios: Array<{ label: string; grant: number }>;
    };

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (n: number, p: number) => round2((n * p) / 100);
const eur = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function inRange<T extends { from: string; to: string }>(table: readonly T[], date: string) {
  return table.find((r) => r.from <= date && date <= r.to);
}

export function klimaBonusPercent(date: string) {
  return inRange(KLIMA_BONUS, date)?.percent ?? 0;
}

export function costCapForBuilding(units: number, date: string) {
  const we1 = inRange(HOECHSTKOSTEN_WE1, date)?.amount;
  if (we1 === undefined) return null;
  const mid = Math.min(Math.max(units - 1, 0), 5) * HOECHSTKOSTEN_WEITERE.we2bis6;
  const rest = Math.max(units - 6, 0) * HOECHSTKOSTEN_WEITERE.abWe7;
  return we1 + mid + rest;
}

export function incomeBonusPercent(effectiveIncome: number) {
  return EINKOMMENS_BONUS.find((b) => effectiveIncome <= b.upTo)?.percent ?? 0;
}

export function validate(i: CalcInput): Partial<Record<keyof CalcInput, string>> {
  const e: Partial<Record<keyof CalcInput, string>> = {};
  if (i.applicationDate !== null) {
    if (!ISO.test(i.applicationDate) || Number.isNaN(Date.parse(i.applicationDate)))
      e.applicationDate = "Bitte ein gültiges Datum angeben.";
    else if (i.applicationDate < i.today) e.applicationDate = "Das Antragsdatum darf nicht in der Vergangenheit liegen.";
  }
  if (!Number.isInteger(i.units) || i.units < 1 || i.units > 200)
    e.units = "Bitte die Zahl der Wohneinheiten angeben (1 bis 200).";
  if (i.costs !== null && (!Number.isFinite(i.costs) || i.costs < 0 || i.costs > 5_000_000))
    e.costs = "Bitte einen Betrag zwischen 0 und 5.000.000 € angeben.";
  if (!Number.isFinite(i.nonEligibleCosts) || i.nonEligibleCosts < 0)
    e.nonEligibleCosts = "Bitte einen Betrag ab 0 € angeben.";
  else if (i.costs !== null && i.nonEligibleCosts > i.costs)
    e.nonEligibleCosts = "Die nicht förderfähigen Kosten können nicht höher sein als die Gesamtkosten.";
  if (i.income !== null && (!Number.isFinite(i.income) || i.income < 0 || i.income > 10_000_000))
    e.income = "Bitte ein Einkommen ab 0 € angeben.";
  const year = Number(i.today.slice(0, 4));
  if (i.oldHeatingYear !== null && (!Number.isInteger(i.oldHeatingYear) || i.oldHeatingYear < 1900 || i.oldHeatingYear > year))
    e.oldHeatingYear = `Bitte ein Jahr zwischen 1900 und ${year} angeben.`;
  return e;
}

/** Alter der Heizung bei Antragstellung – nur Jahr bekannt, daher Grenzjahr unsicher */
function ageCheck(year: number | null, appDate: string): YesNoUnknown {
  if (year === null) return "unknown";
  const appYear = Number(appDate.slice(0, 4));
  const diff = appYear - year;
  if (diff > KLIMA_BONUS_RULES.minAgeYears) return "yes";
  if (diff < KLIMA_BONUS_RULES.minAgeYears) return "no";
  return "unknown"; // genau 20 Jahre: hängt vom Monat der Inbetriebnahme ab
}

type Core = {
  grant: number;
  lines: Line[];
  capReduction: number;
  unitRate: number | null;
  share: number | null;
};

function core(considered: number, units: number, selfUse: boolean, klima: number, income: number | null, children: boolean, baseOverride?: number): Core {
  const basePct = baseOverride ?? GRUNDFOERDERUNG.percent;
  const base = pct(considered, basePct);
  const lines: Line[] = [{ label: `Grundförderung ${basePct} %`, amount: base, note: `${basePct} % von ${eur(considered)}` }];
  if (!selfUse) return { grant: base, lines, capReduction: 0, unitRate: null, share: null };

  const share = round2(considered / units);
  const effIncome = income === null ? null : Math.max(0, income - (children ? FAMILIENZUSCHLAG.amount : 0));
  const incomePct = effIncome === null ? 0 : incomeBonusPercent(effIncome);
  const capPct = effIncome !== null && effIncome <= OBERGRENZE.lowIncomeLimit ? OBERGRENZE.lowIncomePercent : OBERGRENZE.percent;

  const shareNote = units > 1 ? ` von ${eur(share)} (Anteil der selbstgenutzten Wohneinheit)` : ` von ${eur(share)}`;
  if (klima > 0) lines.push({ label: `Klimageschwindigkeitsbonus ${klima} %`, amount: pct(share, klima), note: `${klima} %${shareNote}` });
  if (incomePct > 0) lines.push({ label: `Einkommensbonus ${incomePct} %`, amount: pct(share, incomePct), note: `${incomePct} %${shareNote}` });

  const unitRate = Math.min(basePct + klima + incomePct, capPct);
  const bonusGranted = pct(share, unitRate - basePct);
  const bonusRaw = lines.slice(1).reduce((s, l) => s + l.amount, 0);
  const capReduction = round2(bonusRaw - bonusGranted);
  return { grant: round2(base + bonusGranted), lines, capReduction, unitRate, share };
}

export function calculate(i: CalcInput): CalcResult {
  const errors = validate(i);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  /* --- Fälle außerhalb des Rechners --- */
  if (i.applicant === "weg")
    return {
      status: "unsupported",
      reason:
        "Bei Wohnungseigentum (WEG) hängt die Förderung davon ab, ob Gemeinschafts- oder Sondereigentum betroffen ist. Boni werden über Zusatzanträge nach Miteigentumsanteil berechnet. Diese Konstellationen bildet der Rechner nicht verlässlich ab.",
      hints: ["Wir prüfen Ihren Fall gern persönlich – bringen Sie Teilungserklärung und Beschlusslage mit."],
    };
  if (i.applicant === "other")
    return {
      status: "unsupported",
      reason:
        "Für Ihre Eigentumssituation (zum Beispiel Erbbaurecht) enthalten die offiziellen Unterlagen keine eindeutige Regel. Wir möchten hier nichts schätzen.",
      hints: ["Bitte klären Sie die Antragsberechtigung direkt mit der KfW oder sprechen Sie uns an."],
    };

  const reasons: string[] = [];
  if (i.applicant === "tenant")
    reasons.push("Mieterinnen und Mieter können die Heizungsförderung 458 nicht beantragen – antragsberechtigt ist die Eigentümerseite.");
  if (i.applicant === "gbr_niessbrauch")
    reasons.push("Gesellschaften bürgerlichen Rechts (GbR) und Nießbrauchberechtigte sind im Programm 458 ausgeschlossen. Für GbR gibt es ein eigenes KfW-Programm für Unternehmen.");
  if (i.projectStarted === "yes")
    reasons.push("Wer vor dem Antrag einen Vertrag ohne Förderbedingung abschließt oder mit den Arbeiten beginnt, verliert die Förderung (Vorhabenbeginn).");
  if (i.buildingOldEnough === "no")
    reasons.push("Gefördert werden nur bestehende Gebäude, deren Bauantrag bei Antragstellung mindestens fünf Jahre zurückliegt.");
  if (i.mixedUse && i.residentialOver50 === "no")
    reasons.push("Das Programm 458 gilt für Wohngebäude. Bei gemischter Nutzung muss die Wohnfläche mehr als 50 % der beheizten Fläche ausmachen.");
  if (i.costs !== null && i.costs < MINDESTINVESTITION)
    reasons.push(`Die Mindestinvestition beträgt ${MINDESTINVESTITION} € brutto.`);
  if (reasons.length) return { status: "not_eligible", reasons, hints: ["Sprechen Sie uns an, wenn Sie unsicher sind – manche Punkte lassen sich vor Antragstellung noch klären."] };

  const dateAssumed = i.applicationDate === null;
  const date = i.applicationDate ?? i.today;
  if (date < VALIDITY.from || date > VALIDITY.to)
    return {
      status: "unsupported",
      reason: `Für Anträge nach dem ${VALIDITY.to.split("-").reverse().join(".")} gibt es noch keine offiziellen Regeln.`,
      hints: ["Wir aktualisieren den Rechner, sobald neue Bedingungen veröffentlicht sind."],
    };

  const cap = costCapForBuilding(i.units, date)!;
  const costsAssumed = i.costs === null;
  const eligible = costsAssumed ? cap : Math.max(0, i.costs! - i.nonEligibleCosts);
  const considered = Math.min(eligible, cap);

  const assumptions: string[] = [];
  const openPoints: string[] = [];
  const scenarios: Array<{ label: string; grant: number }> = [];

  if (dateAssumed) assumptions.push(`Antragsdatum unbekannt – gerechnet mit Antrag heute (${date.split("-").reverse().join(".")}). Spätere Anträge können niedriger gefördert werden.`);
  if (costsAssumed) assumptions.push(`Kosten unbekannt – gerechnet mit dem förderfähigen Höchstbetrag von ${eur(cap)}. Das ist der höchstmögliche Wert, nicht Ihr tatsächlicher.`);
  if (i.buildingOldEnough === "unknown") openPoints.push("Bauantrag des Gebäudes: Er muss bei Antragstellung mindestens fünf Jahre zurückliegen.");
  if (i.projectStarted === "unknown") openPoints.push("Vertrag und Baubeginn: Vor dem Antrag darf nur ein Vertrag mit Förderbedingung (aufschiebend oder auflösend) bestehen.");
  if (i.mixedUse && i.residentialOver50 === "unknown") openPoints.push("Gemischte Nutzung: Die Wohnfläche muss mehr als 50 % der beheizten Fläche ausmachen.");

  /* --- Klimageschwindigkeitsbonus --- */
  let klima = 0;
  const klimaRate = klimaBonusPercent(date);
  const anyAge = (KLIMA_BONUS_RULES.anyAge as readonly string[]).includes(i.oldHeating);
  const age20 = (KLIMA_BONUS_RULES.minAge20 as readonly string[]).includes(i.oldHeating);
  let klimaPotential = false;
  if (i.selfUse && klimaRate > 0 && (anyAge || age20)) {
    const ageOk = anyAge ? "yes" : ageCheck(i.oldHeatingYear, date);
    const conds: YesNoUnknown[] = [ageOk, i.oldHeatingWorking, i.fossilRemains === "unknown" ? "unknown" : i.fossilRemains === "no" ? "yes" : "no"];
    if (conds.every((c) => c === "yes")) klima = klimaRate;
    else if (!conds.includes("no")) {
      klimaPotential = true;
      if (ageOk === "unknown")
        openPoints.push(
          i.oldHeatingYear === null
            ? "Alter der Gas- oder Biomasseheizung: Für den Klimageschwindigkeitsbonus muss die Inbetriebnahme bei Antragstellung mindestens 20 Jahre zurückliegen."
            : "Inbetriebnahme genau vor 20 Jahren: Ob der Bonus greift, hängt vom Monat der Inbetriebnahme ab (Typenschild oder Schornsteinfeger-Protokoll prüfen).",
        );
      if (i.oldHeatingWorking === "unknown") openPoints.push("Funktionstüchtigkeit der alten Heizung: Der Klimageschwindigkeitsbonus setzt eine funktionierende Heizung voraus.");
      if (i.fossilRemains === "unknown") openPoints.push("Nach dem Tausch darf keine Öl- oder Gasheizung dieselben Räume weiter versorgen (auch keine Hybrid-Kombination mit Gaskessel).");
    } else {
      if (i.oldHeatingWorking === "no") assumptions.push("Klimageschwindigkeitsbonus nicht berücksichtigt: Er gilt nur für den Austausch einer funktionstüchtigen Heizung.");
      if (i.fossilRemains === "yes") assumptions.push("Klimageschwindigkeitsbonus nicht berücksichtigt: Nach dem Tausch bliebe eine Öl- oder Gasheizung in Betrieb.");
      if (ageOk === "no") assumptions.push("Klimageschwindigkeitsbonus nicht berücksichtigt: Gas- und Biomasseheizungen müssen bei Antragstellung mindestens 20 Jahre alt sein.");
    }
  }
  if (i.selfUse && klimaRate === 0 && (anyAge || age20)) assumptions.push("Der Klimageschwindigkeitsbonus ist für Anträge ab dem 01.08.2028 entfallen.");
  if (i.selfUse && i.oldHeating === "unknown") openPoints.push("Art der alten Heizung: Bei Öl-, Kohle-, Gas-Etagen- und Nachtspeicherheizungen sowie älteren Gas- und Biomasseheizungen kann ein Klimageschwindigkeitsbonus hinzukommen.");

  /* --- Einkommen --- */
  const hasChild = i.children === "yes";
  if (i.selfUse) {
    if (i.income === null) assumptions.push("Ohne Angabe zum Einkommen ist kein Einkommensbonus berücksichtigt.");
    else if (i.children === "unknown" && i.income > OBERGRENZE.lowIncomeLimit && i.income - FAMILIENZUSCHLAG.amount <= 50000)
      openPoints.push("Kinder im Haushalt: Ein minderjähriges Kind mit Kindergeldanspruch senkt das anzusetzende Einkommen pauschal um 10.000 €.");
    if (i.income !== null) assumptions.push("Einkommen: Durchschnitt der zu versteuernden Haushaltseinkommen des zweiten und dritten Jahres vor Antragstellung, nachgewiesen über Steuerbescheide.");
  }

  const r = core(considered, i.units, i.selfUse, klima, i.selfUse ? i.income : null, hasChild);

  /* --- Szenarien für offene Punkte --- */
  if (klimaPotential) {
    const alt = core(considered, i.units, true, klimaRate, i.income, hasChild);
    if (alt.grant > r.grant) scenarios.push({ label: "falls die Voraussetzungen für den Klimageschwindigkeitsbonus erfüllt sind", grant: alt.grant });
  }
  if (i.selfUse && i.children === "unknown" && i.income !== null) {
    const alt = core(considered, i.units, true, klima, i.income, true);
    if (alt.grant > r.grant) scenarios.push({ label: "falls ein minderjähriges Kind im Haushalt gemeldet ist", grant: alt.grant });
  }
  if (date >= ANGEKUENDIGT_Q1_2027.earliest) {
    const alt = core(considered, i.units, i.selfUse, klima, i.selfUse ? i.income : null, hasChild, ANGEKUENDIGT_Q1_2027.grundfoerderungPercent);
    openPoints.push(
      "Für 2027 ist angekündigt: Grundförderung für Wärmepumpen nur noch 15 %, dafür 15 Prozentpunkte Bonus für Wärmepumpen aus EU-Herstellung. Ein Startdatum ist offiziell noch nicht festgelegt – berechnet ist der heute gültige Stand.",
    );
    scenarios.push({ label: "falls die angekündigte Änderung bei Antragstellung gilt und die Wärmepumpe nicht aus der EU stammt", grant: alt.grant });
  }

  if (i.oldHeating === "renewable")
    openPoints.push("Bereits erneuerbare Heizung vorhanden: Nach angekündigten Regeln für 2027 kann der Ersatz von Anlagen, die ab 2008 in Betrieb gingen, ausgeschlossen werden.");
  if (i.newHeating === "wp_air_air") openPoints.push("Luft-Luft-Wärmepumpen sind nur mit hohen Effizienzwerten förderfähig; Raumluft als Wärmequelle ist ausgeschlossen.");

  const remaining = costsAssumed ? null : round2(Math.max(0, i.costs! - r.grant));

  return {
    status: "ok",
    grant: r.grant,
    effectiveRate: considered > 0 ? round2((r.grant / considered) * 100) : 0,
    consideredCosts: considered,
    eligibleCosts: eligible,
    costCap: cap,
    costsAssumed,
    applicationDate: date,
    dateAssumed,
    lines: r.lines,
    capReduction: r.capReduction,
    selfUseShare: r.share,
    unitRate: r.unitRate,
    remaining,
    assumptions,
    openPoints,
    scenarios,
  };
}

export { eur };
