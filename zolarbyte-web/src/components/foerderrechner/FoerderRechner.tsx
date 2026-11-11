"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { calculate, eur, type CalcInput, type CalcResult } from "@/lib/foerderung/berechnung";
import { KREDIT, SOURCES, STAND, STEUER_35C } from "@/lib/foerderung/regeln-458";
import { HANDOFF_KEY } from "@/components/ContactForm";
import "./rechner.css";

/*
 * Förderrechner KfW 458 – läuft vollständig im Browser.
 * Keine Übertragung an Dritte, kein Speichern. Nur wenn Nutzer:innen es ausdrücklich
 * auslösen, wird eine sichtbare Zusammenfassung (ohne Einkommen) an das Anfrageformular übergeben.
 */

type Answers = {
  applicant: "" | CalcInput["applicant"];
  projectStarted: "" | CalcInput["projectStarted"];
  dateMode: "" | "known" | "unknown";
  applicationDate: string;
  building: "" | "efh" | "mfh" | "mixed";
  units: string;
  residentialOver50: "" | CalcInput["residentialOver50"];
  buildingOldEnough: "" | CalcInput["buildingOldEnough"];
  selfUse: "" | "yes" | "no";
  oldHeating: "" | CalcInput["oldHeating"];
  oldHeatingYear: string;
  oldHeatingYearUnknown: boolean;
  oldHeatingWorking: "" | CalcInput["oldHeatingWorking"];
  fossilRemains: "" | CalcInput["fossilRemains"];
  newHeating: "" | CalcInput["newHeating"];
  costs: string;
  costsUnknown: boolean;
  nonEligibleCosts: string;
  income: string;
  incomeMode: "" | "known" | "skip";
  children: "" | CalcInput["children"];
};

const EMPTY: Answers = {
  applicant: "",
  projectStarted: "",
  dateMode: "",
  applicationDate: "",
  building: "",
  units: "",
  residentialOver50: "",
  buildingOldEnough: "",
  selfUse: "",
  oldHeating: "",
  oldHeatingYear: "",
  oldHeatingYearUnknown: false,
  oldHeatingWorking: "",
  fossilRemains: "",
  newHeating: "",
  costs: "",
  costsUnknown: false,
  nonEligibleCosts: "",
  income: "",
  incomeMode: "",
  children: "",
};

type StepId = "antrag" | "gebaeude" | "heizung" | "kosten" | "einkommen";

const STEP_TITLES: Record<StepId, string> = {
  antrag: "Antrag & Eigentum",
  gebaeude: "Gebäude",
  heizung: "Nutzung & alte Heizung",
  kosten: "Neue Heizung & Kosten",
  einkommen: "Haushaltseinkommen",
};

const BONUS_HEATINGS = ["oil", "coal", "gas_floor", "night_storage", "gas", "biomass"];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const num = (s: string) => {
  const t = s.replace(/\./g, "").replace(/\s/g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
};

/* ---------- Auswahlfläche ---------- */

function Choice<T extends string>({
  legend,
  hint,
  name,
  value,
  options,
  onChange,
  error,
  columns = 2,
}: {
  legend: string;
  hint?: string;
  name: string;
  value: T | "";
  options: Array<{ value: T; label: string; note?: string }>;
  onChange: (v: T) => void;
  error?: string;
  columns?: number;
}) {
  const id = useId();
  return (
    <fieldset className="q" aria-describedby={[hint ? `${id}-h` : "", error ? `${id}-e` : ""].join(" ").trim() || undefined}>
      <legend className="q__legend">{legend}</legend>
      {hint ? (
        <p id={`${id}-h`} className="q__hint">
          {hint}
        </p>
      ) : null}
      <div className={`q__options q__options--${columns}`}>
        {options.map((o) => (
          <label key={o.value} className="opt">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="opt__body">
              <span className="opt__label">{o.label}</span>
              {o.note ? <span className="opt__note">{o.note}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-e`} className="field__error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function Amount({
  label,
  hint,
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="field q">
      <label htmlFor={id} className="q__legend">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-h`} className="q__hint">
          {hint}
        </p>
      ) : null}
      <div className="amount">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint ? `${id}-h` : "", error ? `${id}-e` : ""].join(" ").trim() || undefined}
        />
        <span aria-hidden="true">€</span>
      </div>
      {error ? (
        <p id={`${id}-e`} className="field__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const YNU = [
  { value: "yes" as const, label: "Ja" },
  { value: "no" as const, label: "Nein" },
  { value: "unknown" as const, label: "Weiß ich noch nicht" },
];

/* ---------- Rechner ---------- */

export function FoerderRechner() {
  const [a, setA] = useState<Answers>(EMPTY);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [handoff, setHandoff] = useState<"" | "preview" | "done">("");
  const rootRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const stops = a.applicant !== "" && a.applicant !== "owner";
  const steps: StepId[] = stops
    ? ["antrag"]
    : (["antrag", "gebaeude", "heizung", "kosten", ...(a.selfUse === "no" ? [] : ["einkommen"])] as StepId[]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex >= steps.length - 1;

  const needsYear = a.selfUse === "yes" && (a.oldHeating === "gas" || a.oldHeating === "biomass");
  const needsBonusChecks = a.selfUse === "yes" && BONUS_HEATINGS.includes(a.oldHeating);
  const incomeNum = num(a.income);
  const needsChildren = a.incomeMode === "known" && Number.isFinite(incomeNum) && incomeNum > 30000 && incomeNum <= 60000;

  function check(s: StepId): Record<string, string> {
    const today = todayIso();
    const e: Record<string, string> = {};
    const req = "Bitte wählen Sie eine Antwort.";
    if (s === "antrag") {
      if (!a.applicant) e.applicant = req;
      if (a.applicant === "owner") {
        if (!a.projectStarted) e.projectStarted = req;
        if (!a.dateMode) e.dateMode = req;
        if (a.dateMode === "known") {
          if (!a.applicationDate) e.applicationDate = "Bitte ein Datum angeben.";
          else if (a.applicationDate < today) e.applicationDate = "Das Datum darf nicht in der Vergangenheit liegen.";
          else if (a.applicationDate > "2030-12-31") e.applicationDate = "Für Anträge nach 2030 gibt es noch keine Regeln.";
        }
      }
    }
    if (s === "gebaeude") {
      if (!a.building) e.building = req;
      if (a.building === "mfh" || a.building === "mixed") {
        const u = num(a.units);
        if (!Number.isInteger(u) || u < (a.building === "mfh" ? 2 : 1) || u > 200)
          e.units = a.building === "mfh" ? "Bitte eine ganze Zahl ab 2 angeben." : "Bitte eine ganze Zahl ab 1 angeben.";
      }
      if (a.building === "mixed" && !a.residentialOver50) e.residentialOver50 = req;
      if (!a.buildingOldEnough) e.buildingOldEnough = req;
    }
    if (s === "heizung") {
      if (!a.selfUse) e.selfUse = req;
      if (!a.oldHeating) e.oldHeating = req;
      if (needsYear && !a.oldHeatingYearUnknown) {
        const y = num(a.oldHeatingYear);
        const max = Number(today.slice(0, 4));
        if (!Number.isInteger(y) || y < 1900 || y > max) e.oldHeatingYear = `Bitte ein Jahr zwischen 1900 und ${max} angeben – oder „Weiß ich nicht“ wählen.`;
      }
      if (needsBonusChecks) {
        if (!a.oldHeatingWorking) e.oldHeatingWorking = req;
        if (!a.fossilRemains) e.fossilRemains = req;
      }
    }
    if (s === "kosten") {
      if (!a.newHeating) e.newHeating = req;
      if (!a.costsUnknown) {
        const c = num(a.costs);
        if (!Number.isFinite(c) || c <= 0) e.costs = "Bitte einen Betrag angeben – oder „Weiß ich noch nicht“ wählen.";
        else if (c > 5_000_000) e.costs = "Bitte einen realistischen Betrag angeben.";
      }
      if (a.nonEligibleCosts.trim()) {
        const n = num(a.nonEligibleCosts);
        if (!Number.isFinite(n) || n < 0) e.nonEligibleCosts = "Bitte einen Betrag ab 0 € angeben.";
        else if (!a.costsUnknown && n > num(a.costs)) e.nonEligibleCosts = "Darf nicht höher sein als die Gesamtkosten.";
      }
    }
    if (s === "einkommen") {
      if (!a.incomeMode) e.incomeMode = req;
      if (a.incomeMode === "known" && (!Number.isFinite(incomeNum) || incomeNum < 0)) e.income = "Bitte einen Betrag ab 0 € angeben.";
      if (needsChildren && !a.children) e.children = req;
    }
    return e;
  }

  function focusTop() {
    requestAnimationFrame(() => {
      const el = rootRef.current?.querySelector<HTMLElement>("[data-focus-target]");
      el?.focus();
      rootRef.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }

  function next() {
    const e = check(step);
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], .field__error")?.closest(".q")?.querySelector<HTMLElement>("input")?.focus());
      return;
    }
    if (isLast) setShowResult(true);
    else setStepIndex((i) => i + 1);
    focusTop();
  }

  function back() {
    setErrors({});
    if (showResult) setShowResult(false);
    else setStepIndex((i) => Math.max(0, i - 1));
    focusTop();
  }

  function restart() {
    setA(EMPTY);
    setStepIndex(0);
    setShowResult(false);
    setHandoff("");
    setErrors({});
    focusTop();
  }

  // Datum erst bei Bedarf lesen (nicht beim Vorrendern)
  const buildInput = (): CalcInput => ({
    today: todayIso(),
    applicationDate: a.dateMode === "known" && a.applicationDate ? a.applicationDate : null,
    applicant: a.applicant || "owner",
    projectStarted: a.projectStarted || "unknown",
    buildingOldEnough: a.buildingOldEnough || "unknown",
    units: a.building === "efh" || a.building === "" ? 1 : num(a.units),
    mixedUse: a.building === "mixed",
    residentialOver50: a.residentialOver50 || "unknown",
    selfUse: a.selfUse === "yes",
    oldHeating: a.oldHeating || "unknown",
    oldHeatingYear: needsYear && !a.oldHeatingYearUnknown && a.oldHeatingYear ? num(a.oldHeatingYear) : null,
    oldHeatingWorking: a.oldHeatingWorking || "unknown",
    fossilRemains: a.fossilRemains || "unknown",
    newHeating: a.newHeating || "wp_air_water",
    costs: a.costsUnknown ? null : num(a.costs),
    nonEligibleCosts: a.nonEligibleCosts.trim() ? num(a.nonEligibleCosts) : 0,
    income: a.selfUse === "yes" && a.incomeMode === "known" ? incomeNum : null,
    children: needsChildren ? a.children || "unknown" : "no",
  });

  const input = showResult ? buildInput() : null;
  const result: CalcResult | null = input ? calculate(input) : null;
  const progress = showResult ? 100 : Math.round((stepIndex / steps.length) * 100);

  /* ---------- Zusammenfassung für die freiwillige Anfrage (ohne Einkommen) ---------- */
  function summary(r: CalcResult) {
    if (!input) return "";
    const lines = [`Förderrechner KfW 458 (Regelstand ${STAND}) – unverbindliche Orientierung`];
    const heat: Record<string, string> = {
      oil: "Öl",
      coal: "Kohle",
      gas_floor: "Gas-Etagenheizung",
      night_storage: "Nachtspeicher",
      gas: "Gas",
      biomass: "Biomasse",
      renewable: "bereits erneuerbar",
      district: "Fernwärme",
      other: "Sonstige",
      unknown: "unbekannt",
    };
    lines.push(`Gebäude: ${a.building === "efh" ? "Einfamilienhaus" : `${input.units} Wohneinheiten${a.building === "mixed" ? " (gemischt genutzt)" : ""}`}`);
    lines.push(`Selbstnutzung: ${a.selfUse === "yes" ? "ja" : "nein"} · alte Heizung: ${heat[input.oldHeating]}${input.oldHeatingYear ? ` (Baujahr ${input.oldHeatingYear})` : ""}`);
    if (r.status === "ok") {
      lines.push(`Voraussichtlicher Zuschuss: ${eur(r.grant)} (${r.effectiveRate.toLocaleString("de-DE")} % von ${eur(r.consideredCosts)})`);
      lines.push(`Antragsdatum: ${r.applicationDate.split("-").reverse().join(".")}${r.dateAssumed ? " (angenommen)" : ""}`);
      lines.push(`Kosten: ${r.costsAssumed ? "noch offen" : eur(input.costs ?? 0)}`);
      lines.push(`Einkommensbonus berücksichtigt: ${r.lines.some((l) => l.label.startsWith("Einkommens")) ? "ja" : "nein"}`);
      if (r.openPoints.length) lines.push(`Offene Punkte: ${r.openPoints.length}`);
    } else if (r.status === "not_eligible") {
      lines.push("Ergebnis: nach den Angaben voraussichtlich nicht förderfähig");
    } else if (r.status === "unsupported") {
      lines.push("Ergebnis: Fall wird vom Rechner nicht abgebildet – Beratung gewünscht");
    }
    return lines.join("\n");
  }

  function confirmHandoff(r: CalcResult) {
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ summary: summary(r) }));
      setHandoff("done");
    } catch {
      setHandoff("done");
    }
  }

  return (
    <div ref={rootRef} className="rechner" id="rechner">
      <div className="rechner__head">
        <div className="rechner__progress" aria-hidden="true">
          <span style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
        <p className="rechner__step" aria-live="polite">
          {showResult ? "Ergebnis" : `Schritt ${stepIndex + 1} von ${steps.length} · ${STEP_TITLES[step]}`}
        </p>
        <p className="rechner__privacy">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v7h-9z" />
          </svg>
          Berechnung nur in Ihrem Browser. Es wird nichts gespeichert oder gesendet.
        </p>
      </div>

      {!showResult ? (
        <form
          className="rechner__body"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <h3 className="rechner__title" tabIndex={-1} data-focus-target="">
            {STEP_TITLES[step]}
          </h3>

          {step === "antrag" ? (
            <>
              <Choice
                legend="Wer würde den Antrag stellen?"
                name="applicant"
                value={a.applicant}
                onChange={(v) => set("applicant", v)}
                error={errors.applicant}
                options={[
                  { value: "owner", label: "Eigentümer:in des ganzen Hauses", note: "Ein- oder Mehrfamilienhaus, allein oder gemeinsam" },
                  { value: "weg", label: "Eigentumswohnung / WEG", note: "Wohnung in einer Eigentümergemeinschaft" },
                  { value: "tenant", label: "Mieter:in" },
                  { value: "gbr_niessbrauch", label: "GbR oder Nießbrauch" },
                  { value: "other", label: "Andere Situation", note: "z. B. Erbbaurecht" },
                ]}
              />
              {a.applicant === "owner" ? (
                <>
                  <Choice
                    legend="Haben Sie schon einen Vertrag ohne Förderbedingung unterschrieben oder mit den Arbeiten begonnen?"
                    hint="Vor dem Antrag ist nur ein Vertrag erlaubt, der ausdrücklich von der Förderzusage abhängt. Planung und Beratung sind vorher erlaubt."
                    name="projectStarted"
                    value={a.projectStarted}
                    onChange={(v) => set("projectStarted", v)}
                    error={errors.projectStarted}
                    columns={3}
                    options={[
                      { value: "no", label: "Nein" },
                      { value: "yes", label: "Ja" },
                      { value: "unknown", label: "Weiß ich nicht" },
                    ]}
                  />
                  <Choice
                    legend="Wann möchten Sie den Antrag stellen?"
                    hint="Der Klimageschwindigkeitsbonus und der Höchstbetrag sinken stufenweise. Maßgeblich ist das Datum der Antragstellung."
                    name="dateMode"
                    value={a.dateMode}
                    onChange={(v) => set("dateMode", v)}
                    error={errors.dateMode}
                    options={[
                      { value: "known", label: "Datum angeben" },
                      { value: "unknown", label: "Weiß ich noch nicht", note: "Dann rechnen wir mit heute" },
                    ]}
                  />
                  {a.dateMode === "known" ? (
                    <div className="field q">
                      <label htmlFor="zb-date" className="q__legend">
                        Geplantes Antragsdatum
                      </label>
                      <input
                        id="zb-date"
                        type="date"
                        min={todayIso()}
                        max="2030-12-31"
                        value={a.applicationDate}
                        onChange={(e) => set("applicationDate", e.target.value)}
                        aria-invalid={errors.applicationDate ? true : undefined}
                        aria-describedby={errors.applicationDate ? "zb-date-e" : undefined}
                      />
                      {errors.applicationDate ? (
                        <p id="zb-date-e" className="field__error">
                          {errors.applicationDate}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {step === "gebaeude" ? (
            <>
              <Choice
                legend="Um welches Gebäude geht es?"
                name="building"
                value={a.building}
                onChange={(v) => set("building", v)}
                error={errors.building}
                columns={3}
                options={[
                  { value: "efh", label: "Einfamilienhaus", note: "eine Wohnung" },
                  { value: "mfh", label: "Zwei- oder Mehrfamilienhaus", note: "auch mit Einliegerwohnung" },
                  { value: "mixed", label: "Wohnen und Gewerbe", note: "gemischt genutzt" },
                ]}
              />
              {a.building === "mfh" || a.building === "mixed" ? (
                <div className="field q">
                  <label htmlFor="zb-units" className="q__legend">
                    Wie viele Wohnungen hat das Gebäude?
                  </label>
                  <p id="zb-units-h" className="q__hint">
                    Nur Wohneinheiten zählen, keine Gewerbeeinheiten.
                  </p>
                  <input
                    id="zb-units"
                    className="input-short"
                    inputMode="numeric"
                    value={a.units}
                    onChange={(e) => set("units", e.target.value)}
                    aria-invalid={errors.units ? true : undefined}
                    aria-describedby={`zb-units-h${errors.units ? " zb-units-e" : ""}`}
                  />
                  {errors.units ? (
                    <p id="zb-units-e" className="field__error">
                      {errors.units}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {a.building === "mixed" ? (
                <Choice
                  legend="Macht die Wohnfläche mehr als die Hälfte der beheizten Fläche aus?"
                  name="residentialOver50"
                  value={a.residentialOver50}
                  onChange={(v) => set("residentialOver50", v)}
                  error={errors.residentialOver50}
                  columns={3}
                  options={YNU}
                />
              ) : null}
              <Choice
                legend="Liegt der Bauantrag des Gebäudes mindestens fünf Jahre zurück?"
                hint="Gefördert werden bestehende Gebäude. Bei älteren Häusern ist das praktisch immer der Fall."
                name="buildingOldEnough"
                value={a.buildingOldEnough}
                onChange={(v) => set("buildingOldEnough", v)}
                error={errors.buildingOldEnough}
                columns={3}
                options={YNU}
              />
            </>
          ) : null}

          {step === "heizung" ? (
            <>
              <Choice
                legend={a.building === "efh" ? "Wohnen Sie selbst in dem Haus?" : "Wohnen Sie selbst in einer der Wohnungen?"}
                hint="Gemeint ist Ihr Haupt- oder alleiniger Wohnsitz. Nur dann sind Boni möglich."
                name="selfUse"
                value={a.selfUse}
                onChange={(v) => set("selfUse", v)}
                error={errors.selfUse}
                options={[
                  { value: "yes", label: "Ja, ich wohne selbst dort" },
                  { value: "no", label: "Nein, vermietet oder leer" },
                ]}
              />
              <Choice
                legend="Welche Heizung soll ersetzt werden?"
                name="oldHeating"
                value={a.oldHeating}
                onChange={(v) => set("oldHeating", v)}
                error={errors.oldHeating}
                columns={3}
                options={[
                  { value: "oil", label: "Ölheizung" },
                  { value: "gas", label: "Gasheizung (zentral)" },
                  { value: "gas_floor", label: "Gas-Etagenheizung" },
                  { value: "night_storage", label: "Nachtspeicher" },
                  { value: "coal", label: "Kohle" },
                  { value: "biomass", label: "Holz / Pellets" },
                  { value: "renewable", label: "Bereits erneuerbar", note: "z. B. ältere Wärmepumpe" },
                  { value: "district", label: "Fernwärme" },
                  { value: "unknown", label: "Weiß ich nicht" },
                ]}
              />
              {needsYear ? (
                <div className="field q">
                  <label htmlFor="zb-year" className="q__legend">
                    In welchem Jahr wurde die Heizung in Betrieb genommen?
                  </label>
                  <p id="zb-year-h" className="q__hint">
                    Steht meist auf dem Typenschild oder im Protokoll des Schornsteinfegers. Für den Bonus muss die
                    Inbetriebnahme bei Antragstellung mindestens 20 Jahre zurückliegen.
                  </p>
                  <div className="inline-row">
                    <input
                      id="zb-year"
                      className="input-short"
                      inputMode="numeric"
                      value={a.oldHeatingYear}
                      disabled={a.oldHeatingYearUnknown}
                      onChange={(e) => set("oldHeatingYear", e.target.value)}
                      aria-invalid={errors.oldHeatingYear ? true : undefined}
                      aria-describedby={`zb-year-h${errors.oldHeatingYear ? " zb-year-e" : ""}`}
                    />
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={a.oldHeatingYearUnknown}
                        onChange={(e) => set("oldHeatingYearUnknown", e.target.checked)}
                      />
                      <span>Weiß ich nicht</span>
                    </label>
                  </div>
                  {errors.oldHeatingYear ? (
                    <p id="zb-year-e" className="field__error">
                      {errors.oldHeatingYear}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {needsBonusChecks ? (
                <>
                  <Choice
                    legend="Funktioniert die alte Heizung noch?"
                    hint="Der Klimageschwindigkeitsbonus gilt nur für den Austausch einer funktionstüchtigen Heizung."
                    name="oldHeatingWorking"
                    value={a.oldHeatingWorking}
                    onChange={(v) => set("oldHeatingWorking", v)}
                    error={errors.oldHeatingWorking}
                    columns={3}
                    options={YNU}
                  />
                  <Choice
                    legend="Bleibt nach dem Tausch eine Öl- oder Gasheizung für dieselben Räume in Betrieb?"
                    hint="Zum Beispiel ein Gaskessel als Spitzenlast in einer Hybridanlage. Dann entfällt der Klimageschwindigkeitsbonus."
                    name="fossilRemains"
                    value={a.fossilRemains}
                    onChange={(v) => set("fossilRemains", v)}
                    error={errors.fossilRemains}
                    columns={3}
                    options={[
                      { value: "no", label: "Nein, sie wird entfernt" },
                      { value: "yes", label: "Ja" },
                      { value: "unknown", label: "Weiß ich noch nicht" },
                    ]}
                  />
                </>
              ) : null}
            </>
          ) : null}

          {step === "kosten" ? (
            <>
              <Choice
                legend="Welche Wärmepumpe ist geplant?"
                hint="Das Gerät muss auf der Liste des BAFA stehen und technische Mindestanforderungen erfüllen (unter anderem Jahresarbeitszahl ab 3,0)."
                name="newHeating"
                value={a.newHeating}
                onChange={(v) => set("newHeating", v)}
                error={errors.newHeating}
                options={[
                  { value: "wp_air_water", label: "Luft-Wasser", note: "Außeneinheit, häufigste Bauart" },
                  { value: "wp_ground", label: "Sole-Wasser", note: "Erdwärme" },
                  { value: "wp_water", label: "Wasser-Wasser", note: "Grundwasser" },
                  { value: "wp_air_air", label: "Luft-Luft" },
                ]}
              />
              <Amount
                label="Geplante Gesamtkosten (brutto)"
                hint="Gerät, Installation, Demontage der alten Heizung und notwendige Umfeldmaßnahmen. Ein Angebot liegt noch nicht vor? Dann wählen Sie „Weiß ich noch nicht“."
                value={a.costs}
                onChange={(v) => set("costs", v)}
                error={errors.costs}
                disabled={a.costsUnknown}
                placeholder="z. B. 32.000"
              />
              <label className="check q">
                <input type="checkbox" checked={a.costsUnknown} onChange={(e) => set("costsUnknown", e.target.checked)} />
                <span>Weiß ich noch nicht – mit dem förderfähigen Höchstbetrag rechnen</span>
              </label>
              <Amount
                label="Davon nicht förderfähig (optional)"
                hint="Zum Beispiel Photovoltaik, Stromspeicher oder Wechselrichter im selben Angebot – diese sind in der Heizungsförderung ausgeschlossen."
                value={a.nonEligibleCosts}
                onChange={(v) => set("nonEligibleCosts", v)}
                error={errors.nonEligibleCosts}
                placeholder="0"
              />
            </>
          ) : null}

          {step === "einkommen" ? (
            <>
              <Choice
                legend="Möchten Sie den Einkommensbonus prüfen?"
                hint="Maßgeblich ist das zu versteuernde Einkommen aller Eigentümer:innen im Haushalt samt Partner:in – der Durchschnitt aus dem zweiten und dritten Jahr vor dem Antrag (für 2026: 2023 und 2024). Sie finden es im Steuerbescheid. Die Angabe bleibt in Ihrem Browser."
                name="incomeMode"
                value={a.incomeMode}
                onChange={(v) => set("incomeMode", v)}
                error={errors.incomeMode}
                options={[
                  { value: "known", label: "Ja, Betrag eingeben" },
                  { value: "skip", label: "Nein / weiß ich nicht", note: "Dann ohne Einkommensbonus" },
                ]}
              />
              {a.incomeMode === "known" ? (
                <Amount
                  label="Zu versteuerndes Haushaltsjahreseinkommen (Durchschnitt)"
                  value={a.income}
                  onChange={(v) => set("income", v)}
                  error={errors.income}
                  placeholder="z. B. 42.000"
                />
              ) : null}
              {needsChildren ? (
                <Choice
                  legend="Lebt mindestens ein minderjähriges Kind mit Kindergeldanspruch in Ihrem Haushalt?"
                  hint="Dann wird das anzusetzende Einkommen pauschal um 10.000 € gesenkt. Weitere Kinderfreibeträge werden nicht angerechnet."
                  name="children"
                  value={a.children}
                  onChange={(v) => set("children", v)}
                  error={errors.children}
                  columns={3}
                  options={YNU}
                />
              ) : null}
            </>
          ) : null}

          <div className="rechner__nav">
            {stepIndex > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={back}>
                Zurück
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn--primary">
              {isLast ? "Ergebnis anzeigen" : "Weiter"}
            </button>
          </div>
        </form>
      ) : result ? (
        <div className="rechner__body rechner__result">
          <h3 className="visually-hidden" tabIndex={-1} data-focus-target="">
            Ergebnis
          </h3>
          <ResultView r={result} input={input!} />

          <div className="rechner__actions no-print">
            <button type="button" className="btn btn--ghost" onClick={back}>
              Angaben ändern
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
              Ergebnis drucken
            </button>
            <button type="button" className="text-button" onClick={restart}>
              Neu beginnen
            </button>
          </div>

          <div className="handoff-box no-print">
            <h4>Persönlich prüfen lassen</h4>
            <p>
              Sie möchten, dass wir uns Ihren Fall ansehen? Sie können eine kurze Zusammenfassung in das Anfrageformular
              übernehmen. Ihr Einkommen ist darin nicht enthalten.
            </p>
            {handoff === "" ? (
              <button type="button" className="btn btn--primary" onClick={() => setHandoff("preview")}>
                Zusammenfassung ansehen
              </button>
            ) : null}
            {handoff === "preview" ? (
              <>
                <pre className="handoff__text">{summary(result)}</pre>
                <div className="rechner__actions">
                  <button type="button" className="btn btn--primary" onClick={() => confirmHandoff(result)}>
                    In die Anfrage übernehmen
                  </button>
                  <button type="button" className="text-button" onClick={() => setHandoff("")}>
                    Abbrechen
                  </button>
                </div>
              </>
            ) : null}
            {handoff === "done" ? (
              <p className="handoff__done">
                Übernommen. <Link href="/kontakt#anfrage">Weiter zur Anfrage</Link> – dort sehen Sie den Text noch einmal
                und können ihn entfernen.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Ergebnisdarstellung ---------- */

function ResultView({ r, input }: { r: CalcResult; input: CalcInput }) {
  if (r.status === "invalid") {
    return (
      <div className="res res--note">
        <h4>Bitte prüfen Sie Ihre Angaben</h4>
        <ul>
          {Object.values(r.errors).map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (r.status === "not_eligible" || r.status === "unsupported") {
    return (
      <div className="res res--note">
        <p className="res__kicker">{r.status === "not_eligible" ? "Voraussichtlich nicht förderfähig" : "Diesen Fall rechnen wir nicht automatisch"}</p>
        <h4>{r.status === "not_eligible" ? "Nach Ihren Angaben greift die Heizungsförderung 458 nicht." : "Hier braucht es eine persönliche Prüfung."}</h4>
        <ul className="res__list">
          {(r.status === "not_eligible" ? r.reasons : [r.reason]).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {r.hints.map((h) => (
          <p key={h} className="res__hint">
            {h}
          </p>
        ))}
        <Link href="/kontakt?interesse=waermepumpe#anfrage" className="btn btn--primary">
          Beratung anfragen
        </Link>
      </div>
    );
  }

  const fmtDate = (d: string) => d.split("-").reverse().join(".");
  return (
    <>
      <div className="res res--main">
        <p className="res__kicker">Voraussichtlicher Zuschuss KfW 458</p>
        <p className="res__big">{eur(r.grant)}</p>
        <p className="res__sub">
          {r.effectiveRate.toLocaleString("de-DE")} % von {eur(r.consideredCosts)} berücksichtigten Kosten
          {r.costsAssumed ? " (Höchstbetrag, da Kosten noch offen)" : ""}
        </p>
        <div className="res__bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, r.effectiveRate)}%` }} />
        </div>
        <p className="res__disclaimer">Unverbindliche Orientierung, keine Förderzusage. Maßgeblich ist allein die Entscheidung der KfW.</p>
      </div>

      <div className="res__grid">
        <div className="res">
          <h4>So setzt sich der Zuschuss zusammen</h4>
          <table className="res__table">
            <tbody>
              {r.lines.map((l) => (
                <tr key={l.label}>
                  <th scope="row">
                    {l.label}
                    {l.note ? <span>{l.note}</span> : null}
                  </th>
                  <td>{eur(l.amount)}</td>
                </tr>
              ))}
              {r.capReduction > 0 ? (
                <tr className="res__cap">
                  <th scope="row">
                    Begrenzung auf {r.unitRate} %<span>Höchstfördersatz je Wohneinheit</span>
                  </th>
                  <td>−{eur(r.capReduction)}</td>
                </tr>
              ) : null}
              <tr className="res__sum">
                <th scope="row">Voraussichtlicher Zuschuss</th>
                <td>{eur(r.grant)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="res">
          <h4>Kosten</h4>
          <dl className="res__dl">
            {!r.costsAssumed ? (
              <div>
                <dt>Geplante Gesamtkosten</dt>
                <dd>{eur(input.costs ?? 0)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Förderfähig</dt>
              <dd>{eur(r.eligibleCosts)}</dd>
            </div>
            <div>
              <dt>Höchstbetrag für {input.units === 1 ? "das Haus" : `${input.units} Wohneinheiten`}</dt>
              <dd>{eur(r.costCap)}</dd>
            </div>
            <div>
              <dt>Berücksichtigt</dt>
              <dd>{eur(r.consideredCosts)}</dd>
            </div>
            {r.remaining !== null ? (
              <div className="res__dl-strong">
                <dt>Verbleibend nach Zuschuss</dt>
                <dd>{eur(r.remaining)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {r.scenarios.length ? (
        <div className="res">
          <h4>Wenn offene Punkte zutreffen</h4>
          <ul className="res__list">
            {r.scenarios.map((s) => (
              <li key={s.label}>
                <strong>{eur(s.grant)}</strong> {s.label}
              </li>
            ))}
          </ul>
          <p className="res__hint">Diese Werte sind Alternativen zum Ergebnis oben, keine zusätzlichen Beträge.</p>
        </div>
      ) : null}

      {r.openPoints.length || r.assumptions.length ? (
        <div className="res">
          <h4>Annahmen und offene Punkte</h4>
          <ul className="res__list">
            {r.openPoints.map((p) => (
              <li key={p} className="is-open">
                {p}
              </li>
            ))}
            {r.assumptions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="res">
        <h4>Weitere Möglichkeiten – nicht zum Zuschuss addieren</h4>
        <dl className="res__other">
          <div>
            <dt>Förderkredit</dt>
            <dd>
              Nach einer Zuschusszusage ist ein KfW-Ergänzungskredit möglich (bis {eur(KREDIT.maxPerUnit)} je Wohneinheit).
              Selbstnutzer:innen mit einem Haushaltseinkommen bis {eur(KREDIT.plusIncomeLimit)} können einen zinsverbilligten
              Kredit erhalten. Das ist ein Darlehen, kein Zuschuss.{" "}
              <a href={KREDIT.source.url} target="_blank" rel="noopener noreferrer">
                Merkblatt 358/359
              </a>
            </dd>
          </div>
          <div>
            <dt>Steuerliche Förderung</dt>
            <dd>
              Alternativ zum Zuschuss: Steuerermäßigung nach § 35c EStG ({STEUER_35C.percentTotal} % über drei Jahre, höchstens{" "}
              {eur(STEUER_35C.maxReduction)}) bei selbstgenutztem Wohneigentum, das älter als zehn Jahre ist. Für dieselbe
              Maßnahme nicht mit dem Zuschuss kombinierbar.
            </dd>
          </div>
          <div>
            <dt>Einspeisevergütung</dt>
            <dd>Betrifft Photovoltaik, nicht die Wärmepumpe. Hinweise im Bereich „Photovoltaik und Speicher“.</dd>
          </div>
          <div>
            <dt>Betriebskosten</dt>
            <dd>
              Eine Ersparnis rechnen wir hier bewusst nicht aus – sie hängt von Gebäude, Verbrauch und Stromtarif ab. Das
              ermitteln wir in der Beratung.
            </dd>
          </div>
        </dl>
      </div>

      <div className="res res--sources">
        <h4>Regelstand und Quellen</h4>
        <p>
          Antragsdatum {fmtDate(r.applicationDate)}
          {r.dateAssumed ? " (angenommen)" : ""}. Regeln geprüft am {STAND}:
        </p>
        <ul>
          {[SOURCES.richtlinie, SOURCES.merkblatt, SOURCES.produktseite].map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Technische Voraussetzungen (Auswahl): Gerät auf der BAFA-Liste, Jahresarbeitszahl ab 3,0, bei Luft-Wasser-Geräten
          Schall mindestens 10 dB unter dem EU-Grenzwert, hydraulischer Abgleich, Schnittstelle zur netzdienlichen Steuerung
          und Bestellung eines intelligenten Messsystems bis zur Inbetriebnahme. Vor Antragstellung braucht es eine
          „Bestätigung zum Antrag“ von einer Energieeffizienz-Expertin bzw. einem -Experten oder einem Fachunternehmen.
        </p>
      </div>
    </>
  );
}
