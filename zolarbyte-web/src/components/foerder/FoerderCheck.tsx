"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { HANDOFF_KEY } from "@/components/assistant/topics";
import { serviceById } from "@/lib/content";
import { ART_LABEL, FOERDER_STAND, regional, type Vorhaben } from "@/lib/foerderung";
import { eur } from "@/lib/foerderung458/berechnung";
import { ANGEKUENDIGT_Q1_2027, KREDIT as KREDIT_458, SOURCES, STAND as STAND_458 } from "@/lib/foerderung458/regeln-458";
import {
  EMPTY,
  buildResults,
  isFitting,
  wpActive,
  wpBetragError,
  wpNeedsKinder,
  wpNeedsYear,
  wpNeedsZustand,
  wpOhneError,
  wpSelf,
  wpUnits,
  wpUnitsError,
  wpYearError,
  type Answers,
  type ResultItem,
  type WpInfo,
} from "./logic";

type Opt<V extends string> = { id: V; label: string; hint?: string };

const VORHABEN: Opt<Vorhaben>[] = [
  { id: "pv", label: "Photovoltaikanlage", hint: "Module aufs Dach" },
  { id: "speicher", label: "Batteriespeicher", hint: "Solarstrom für abends" },
  { id: "wallbox", label: "Wallbox", hint: "Laden zu Hause" },
  { id: "zaehler", label: "Zählerschrank", hint: "Erneuerung / Umbau" },
  { id: "waermepumpe", label: "Wärmepumpe", hint: "Heizung tauschen" },
];
const ORT: Opt<Answers["ort"]>[] = [
  { id: "karlsfeld", label: "Karlsfeld" },
  { id: "dachau", label: "Landkreis Dachau" },
  { id: "muenchen", label: "München & Umland" },
  { id: "bayern", label: "Anderswo in Bayern" },
];
const GEBAEUDE: Opt<Answers["gebaeude"]>[] = [
  { id: "efh", label: "Ein- oder Zweifamilienhaus" },
  { id: "mfh", label: "Mehrfamilienhaus" },
  { id: "gewerbe", label: "Gewerbegebäude" },
];
const ROLLE: Opt<Answers["rolle"]>[] = [
  { id: "selbst", label: "Ich wohne selbst darin", hint: "Eigentümer:in" },
  { id: "vermietet", label: "Ich vermiete", hint: "Eigentümer:in" },
  { id: "unternehmen", label: "Für mein Unternehmen", hint: "Gewerbe / Freiberuf" },
];
const GROESSE: Opt<Answers["groesse"]>[] = [
  { id: "bis10", label: "Bis 10 kWp", hint: "typisch Einfamilienhaus" },
  { id: "bis30", label: "10 bis 30 kWp", hint: "großes Dach" },
  { id: "bis100", label: "30 bis 100 kWp", hint: "Mehrfamilienhaus, Gewerbe" },
  { id: "offen", label: "Weiß ich noch nicht", hint: "klären wir vor Ort" },
];
const EINSPEISUNG: Opt<Answers["einspeisung"]>[] = [
  { id: "teil", label: "Selbst nutzen, Überschuss einspeisen", hint: "üblich" },
  { id: "voll", label: "Alles einspeisen", hint: "Volleinspeisung" },
  { id: "offen", label: "Noch offen" },
];
const START: Opt<Answers["start"]>[] = [
  { id: "2026", label: "Noch 2026" },
  { id: "2027", label: "2027 oder später" },
  { id: "offen", label: "Noch offen" },
];
const STAND: Opt<Answers["stand"]>[] = [
  { id: "offen", label: "Noch ganz am Anfang" },
  { id: "angebot", label: "Ich habe ein Angebot" },
  { id: "beauftragt", label: "Bereits beauftragt" },
];
const KREDIT: Opt<Answers["kredit"]>[] = [
  { id: "ja", label: "Ja, gern" },
  { id: "nein", label: "Nein, ich zahle selbst" },
  { id: "offen", label: "Weiß ich noch nicht" },
];

const YNU: Opt<"yes" | "no" | "unknown">[] = [
  { id: "yes", label: "Ja" },
  { id: "no", label: "Nein" },
  { id: "unknown", label: "Weiß ich nicht" },
];
const EIGENTUM: Opt<Answers["wpEigentum"]>[] = [
  { id: "owner", label: "Mir, allein oder mit Partner:in", hint: "Eigentümer:in des ganzen Hauses" },
  { id: "weg", label: "Eigentümergemeinschaft (WEG)", hint: "Wohnung in einer Eigentumsanlage" },
  { id: "gbr", label: "GbR oder Nießbrauch" },
  { id: "andere", label: "Andere Situation", hint: "zum Beispiel Erbbaurecht" },
];
const WOHNUNGEN_EFH: Opt<string>[] = [
  { id: "1", label: "Eine Wohnung" },
  { id: "2", label: "Zwei Wohnungen", hint: "zum Beispiel mit Einliegerwohnung" },
];
const HEIZUNG: Opt<Exclude<Answers["wpHeizung"], "">>[] = [
  { id: "oil", label: "Ölheizung" },
  { id: "gas", label: "Gasheizung", hint: "zentral fürs ganze Haus" },
  { id: "gas_floor", label: "Gas-Etagenheizung" },
  { id: "night_storage", label: "Nachtspeicher" },
  { id: "coal", label: "Kohle" },
  { id: "biomass", label: "Holz oder Pellets" },
  { id: "renewable", label: "Schon erneuerbar", hint: "zum Beispiel eine ältere Wärmepumpe" },
  { id: "district", label: "Fernwärme" },
  { id: "unknown", label: "Weiß ich nicht" },
];
const FOSSIL: Opt<"yes" | "no" | "unknown">[] = [
  { id: "no", label: "Nein, sie wird entfernt" },
  { id: "yes", label: "Ja" },
  { id: "unknown", label: "Weiß ich noch nicht" },
];
const KOSTEN: Opt<Exclude<Answers["wpKosten"], "">>[] = [
  { id: "bekannt", label: "Ich habe ein Angebot oder eine Schätzung" },
  { id: "offen", label: "Weiß ich noch nicht", hint: "Dann rechnen wir mit dem förderfähigen Höchstbetrag" },
];
const EINKOMMEN: Opt<Exclude<Answers["wpEinkommen"], "">>[] = [
  { id: "bis30", label: "Bis 30.000 €" },
  { id: "bis40", label: "30.001 bis 40.000 €" },
  { id: "bis50", label: "40.001 bis 50.000 €" },
  { id: "bis60", label: "50.001 bis 60.000 €" },
  { id: "ueber60", label: "Über 60.000 €" },
  { id: "keine", label: "Möchte ich nicht angeben", hint: "Dann ohne Einkommensbonus" },
];
const ANTRAG: Opt<Exclude<Answers["wpAntrag"], "">>[] = [
  { id: "jetzt", label: "In den nächsten Wochen" },
  { id: "h1-2027", label: "1. Halbjahr 2027" },
  { id: "h2-2027", label: "2. Halbjahr 2027" },
  { id: "2028", label: "2028 oder später" },
  { id: "offen", label: "Weiß ich noch nicht", hint: "Dann rechnen wir mit heute" },
];
const VERTRAG: Opt<Exclude<Answers["wpVertrag"], "">>[] = [
  { id: "bedingt", label: "Ja, mit Förderbedingung", hint: "Der Vertrag gilt erst mit der Zusage" },
  { id: "unbedingt", label: "Nein, ohne Bedingung" },
  { id: "offen", label: "Weiß ich nicht" },
];

type StepId =
  | "vorhaben"
  | "objekt"
  | "rolle"
  | "wp-haus"
  | "wp-heizung"
  | "wp-zustand"
  | "wp-kosten"
  | "wp-haushalt"
  | "anlage"
  | "zeit"
  | "kredit";

const STEP_LABEL: Record<StepId, string> = {
  vorhaben: "Vorhaben",
  objekt: "Gebäude",
  rolle: "Nutzung",
  "wp-haus": "Haus",
  "wp-heizung": "Heizung",
  "wp-zustand": "Zustand",
  "wp-kosten": "Kosten",
  "wp-haushalt": "Haushalt",
  anlage: "Anlage",
  zeit: "Zeitplan",
  kredit: "Finanzierung",
};

function stepsFor(a: Answers): StepId[] {
  const s: StepId[] = ["vorhaben", "objekt", "rolle"];
  if (wpActive(a)) {
    s.push("wp-haus", "wp-heizung");
    if (wpNeedsZustand(a)) s.push("wp-zustand");
    s.push("wp-kosten");
    if (wpSelf(a)) s.push("wp-haushalt");
  }
  if (a.vorhaben.includes("pv")) s.push("anlage");
  s.push("zeit", "kredit");
  return s;
}

function complete(id: StepId, a: Answers) {
  switch (id) {
    case "vorhaben":
      return a.vorhaben.length > 0;
    case "objekt":
      return Boolean(a.ort && a.gebaeude);
    case "rolle":
      return Boolean(a.rolle);
    case "wp-haus":
      return Boolean(a.wpEigentum && wpUnits(a) !== null && a.wpBauantrag);
    case "wp-heizung":
      return Boolean(a.wpHeizung) && (!wpNeedsYear(a) || (a.wpJahrOffen ? true : Boolean(a.wpJahr.trim()) && !wpYearError(a)));
    case "wp-zustand":
      return Boolean(a.wpFunktion && a.wpFossil);
    case "wp-kosten":
      return Boolean(a.wpKosten) && (a.wpKosten === "offen" || (Boolean(a.wpBetrag.trim()) && !wpBetragError(a) && !wpOhneError(a)));
    case "wp-haushalt":
      return Boolean(a.wpEinkommen) && (!wpNeedsKinder(a) || Boolean(a.wpKinder));
    case "anlage":
      return Boolean(a.groesse && a.einspeisung);
    case "zeit":
      return (
        (!needsStart(a) || Boolean(a.start)) &&
        Boolean(a.stand) &&
        (!wpActive(a) || (Boolean(a.wpAntrag) && (a.stand !== "beauftragt" || Boolean(a.wpVertrag))))
      );
    case "kredit":
      return Boolean(a.kredit);
  }
}

/** Die Frage nach der Inbetriebnahme betrifft nur Vorhaben außer der Wärmepumpe (Vergütung, Netzentgelt) */
const needsStart = (a: Answers) => a.vorhaben.some((v) => v !== "waermepumpe");

function labelOf<V extends string>(opts: Opt<V>[], id: V | "") {
  return opts.find((o) => o.id === id)?.label ?? "";
}

/* ---------- Bausteine ---------- */

function Choice<V extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  multi = false,
  hint,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: Opt<V>[];
  value: V | V[] | "";
  onChange: (v: V) => void;
  multi?: boolean;
}) {
  const hintId = useId();
  return (
    <fieldset className="fw__q" aria-describedby={hint ? hintId : undefined}>
      <legend className="fw__legend">{legend}</legend>
      {hint ? (
        <p id={hintId} className="fw__hint">
          {hint}
        </p>
      ) : null}
      <div className={`fw__opts${options.length > 3 ? " fw__opts--grid" : ""}`}>
        {options.map((o) => {
          const checked = multi ? (value as V[]).includes(o.id) : value === o.id;
          return (
            <label key={o.id} className={`fw__opt${checked ? " is-checked" : ""}`}>
              <input
                type={multi ? "checkbox" : "radio"}
                name={name}
                checked={checked}
                onChange={() => onChange(o.id)}
              />
              <span className="fw__mark" aria-hidden="true" />
              <span className="fw__opt-text">
                <span className="fw__opt-label">{o.label}</span>
                {o.hint ? <span className="fw__opt-hint">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Zahl- oder Betragsfeld mit Label, Hinweis und Fehlermeldung */
function Field({
  legend,
  hint,
  value,
  onChange,
  error,
  suffix,
  placeholder,
  short,
  disabled,
  children,
}: {
  legend: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  suffix?: string;
  placeholder?: string;
  short?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="fw__q fw__field">
      <label className="fw__legend" htmlFor={id}>
        {legend}
      </label>
      {hint ? (
        <p id={`${id}-h`} className="fw__hint">
          {hint}
        </p>
      ) : null}
      <div className="fw__inputrow">
        <div className={`fw__input${short ? " fw__input--short" : ""}`}>
          <input
            id={id}
            inputMode="numeric"
            autoComplete="off"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
          {suffix ? (
            <span className="fw__suffix" aria-hidden="true">
              {suffix}
            </span>
          ) : null}
        </div>
        {children}
      </div>
      {error ? (
        <p id={`${id}-e`} className="fw__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Progress({ steps, index }: { steps: StepId[]; index: number }) {
  const total = steps.length;
  const p = Math.min(1, index / total);
  return (
    <div className="fw__progress" aria-hidden="true">
      <div className="fw__track">
        <span className="fw__fill" style={{ transform: `scaleX(${p})` }} />
        <span className="fw__sun" style={{ left: `${p * 100}%` }} />
      </div>
      <ol className="fw__steps">
        {steps.map((s, i) => (
          <li key={s} className={i < index ? "is-done" : i === index ? "is-current" : undefined}>
            {STEP_LABEL[s]}
          </li>
        ))}
        <li className={index >= total ? "is-current" : undefined}>Ergebnis</li>
      </ol>
    </div>
  );
}

/* ---------- Ergebnis ---------- */

function WpSources() {
  return (
    <p className="fc__src fr__wp-src">
      Rechtsgrundlage:{" "}
      <a className="link-line" href={SOURCES.richtlinie.url} target="_blank" rel="noopener noreferrer">
        BEG-EM-Richtlinie vom 17.08.2026
      </a>{" "}
      ·{" "}
      <a className="link-line" href={SOURCES.produktseite.url} target="_blank" rel="noopener noreferrer">
        KfW-Produktseite mit Rechenbeispielen
      </a>{" "}
      · Rechenstand {STAND_458}
    </p>
  );
}

function WpDetail({ wp, kredit }: { wp: WpInfo; kredit: Answers["kredit"] }) {
  if (wp.kind !== "ok") {
    const reasons = wp.kind === "nein" ? wp.reasons : [wp.reason];
    return (
      <div className="fr__wp">
        <h3 className="fr__sub">{wp.kind === "nein" ? "Warum voraussichtlich nicht" : "Warum wir hier nicht rechnen"}</h3>
        <ul className="fc__cond">
          {reasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {wp.hints.map((h) => (
          <p key={h} className="fr__note">
            {h}
          </p>
        ))}
      </div>
    );
  }

  const { calc, units, costs, extra } = wp;
  return (
    <div className="fr__wp">
      <h3 className="fr__sub">So setzt sich der Zuschuss zusammen</h3>
      <table className="fr__table">
        <tbody>
          {calc.lines.map((l) => (
            <tr key={l.label}>
              <th scope="row">
                {l.label}
                {l.note ? <span>{l.note}</span> : null}
              </th>
              <td>{eur(l.amount)}</td>
            </tr>
          ))}
          {calc.capReduction > 0 ? (
            <tr className="fr__table-cap">
              <th scope="row">
                Begrenzung auf {calc.unitRate} %<span>Höchstfördersatz je Wohnung</span>
              </th>
              <td>−{eur(calc.capReduction)}</td>
            </tr>
          ) : null}
          <tr className="fr__table-sum">
            <th scope="row">Voraussichtlicher Zuschuss</th>
            <td>{eur(calc.grant)}</td>
          </tr>
        </tbody>
      </table>

      <dl className="fr__facts">
        {costs !== null ? (
          <div>
            <dt>Ihre geplanten Kosten</dt>
            <dd>{eur(costs)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Höchstbetrag für {units === 1 ? "das Haus" : `${units} Wohnungen`}</dt>
          <dd>{eur(calc.costCap)}</dd>
        </div>
        <div>
          <dt>Berücksichtigt{calc.costsAssumed ? " (Höchstbetrag)" : ""}</dt>
          <dd>{eur(calc.consideredCosts)}</dd>
        </div>
        {calc.remaining !== null ? (
          <div>
            <dt>Bleibt nach Zuschuss</dt>
            <dd>{eur(calc.remaining)}</dd>
          </div>
        ) : null}
      </dl>

      {calc.scenarios.length ? (
        <>
          <h3 className="fr__sub">Wenn offene Punkte zutreffen</h3>
          <ul className="fc__cond">
            {calc.scenarios.map((x) => (
              <li key={x.label}>
                <strong>{eur(x.grant)}</strong> {x.label}
              </li>
            ))}
          </ul>
          <p className="fr__note">Das sind Alternativen zum Ergebnis oben, keine zusätzlichen Beträge.</p>
        </>
      ) : null}

      {calc.openPoints.length ? (
        <>
          <h3 className="fr__sub">Noch zu klären</h3>
          <ul className="fc__cond">
            {calc.openPoints.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      ) : null}

      {calc.assumptions.length || extra.length ? (
        <>
          <h3 className="fr__sub">Annahmen</h3>
          <ul className="fc__cond">
            {[...extra, ...calc.assumptions].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="fr__note fr__note--change">
        <strong>Angekündigte Änderung:</strong> Ab dem ersten Quartal 2027 soll die Grundförderung für Wärmepumpen nur noch{" "}
        {ANGEKUENDIGT_Q1_2027.grundfoerderungPercent} % betragen, dazu {ANGEKUENDIGT_Q1_2027.wertschoepfungsBonusPercent}{" "}
        Prozentpunkte Bonus für Geräte aus EU-Herstellung. Ein Starttermin ist offiziell nicht festgelegt, deshalb ist hier der
        heute gültige Stand berechnet.
      </p>

      {kredit !== "nein" ? (
        <p className="fr__note">
          <strong>Zusätzlich möglich:</strong> KfW-Ergänzungskredit für den Rest der Kosten, bis {eur(KREDIT_458.maxPerUnit)} je Wohnung.
          Selbstnutzende mit einem Haushaltseinkommen bis {eur(KREDIT_458.plusIncomeLimit)} bekommen ihn zinsverbilligt. Das ist ein
          Darlehen, kein Zuschuss.{" "}
          <a className="link-line" href={KREDIT_458.source.url} target="_blank" rel="noopener noreferrer">
            Merkblatt 358/359
          </a>
        </p>
      ) : null}

    </div>
  );
}

function ResultRow({ r, i, kredit }: { r: ResultItem; i: number; kredit: Answers["kredit"] }) {
  const [open, setOpen] = useState(r.wp?.kind === "ok");
  const reduce = useReducedMotion();
  return (
    <motion.li
      className={`fr__item fr__item--${r.status}`}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <button type="button" className="fr__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="fr__meta">
          <span className={`fc__tag fc__tag--${r.p.art}`}>{ART_LABEL[r.p.art]}</span>
          <span className="tech fr__level">{r.p.ebene}</span>
          {r.status === "pruefen" ? <span className="fr__badge fr__badge--check">Im Einzelfall prüfen</span> : null}
          {r.status === "nicht-mehr" ? <span className="fr__badge fr__badge--no">Frist verpasst</span> : null}
          {r.status === "nein" ? <span className="fr__badge fr__badge--no">Voraussichtlich nicht förderfähig</span> : null}
        </span>
        <span className="fr__name">{r.p.name}</span>
        {r.detail ? <span className="fr__detail">{r.detail}</span> : null}
        <span className="fr__toggle" aria-hidden="true" />
        <span className="visually-hidden">{open ? "Details schließen" : "Details anzeigen"}</span>
      </button>
      {r.hinweis ? <p className="fr__hint">{r.hinweis}</p> : null}
      <div className={`fr__more${open ? " is-open" : ""}`} inert={!open}>
        <div className="fr__more-inner">
          <p className="fr__kurz">{r.p.kurz}</p>
          {r.wp ? <WpDetail wp={r.wp} kredit={kredit} /> : null}
          {r.p.bedingungen.length ? (
            <>
              {r.wp ? <h3 className="fr__sub">Voraussetzungen</h3> : null}
              <ul className="fc__cond">
                {r.p.bedingungen.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </>
          ) : null}
          {r.wp && r.wp.kind !== "beratung" ? <WpSources /> : null}
          <a className="fc__src link-line" href={r.p.quelle.url} target="_blank" rel="noopener noreferrer">
            Quelle: {r.p.quelle.label} · Stand {r.p.stand}
          </a>
        </div>
      </div>
    </motion.li>
  );
}

/* ---------- Zusammenfassung für die Anfrage (ohne Einkommen) ---------- */

function wpHandoffLine(a: Answers) {
  const n = wpUnits(a);
  return [
    `Wärmepumpe: alte Heizung ${labelOf(HEIZUNG, a.wpHeizung)}${wpNeedsYear(a) && !a.wpJahrOffen && a.wpJahr.trim() ? ` (Inbetriebnahme ${a.wpJahr.trim()})` : ""}`,
    n ? `${n} ${n === 1 ? "Wohnung" : "Wohnungen"}` : "",
    `Antrag geplant: ${labelOf(ANTRAG, a.wpAntrag)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function wpResultLine(r: ResultItem) {
  const head = `KfW 458 (Rechenstand ${STAND_458}, unverbindlich): `;
  const wp = r.wp;
  if (!wp) return "";
  if (wp.kind === "nein") return `${head}voraussichtlich nicht förderfähig`;
  if (wp.kind === "beratung") return `${head}Fall wird nicht automatisch gerechnet, persönliche Prüfung gewünscht`;
  const c = wp.calc;
  return `${head}voraussichtlich ${eur(c.grant)} Zuschuss (${c.effectiveRate.toLocaleString("de-DE")} % von ${eur(c.consideredCosts)}${c.costsAssumed ? ", Höchstbetrag, Kosten noch offen" : ""}) · Einkommensbonus berücksichtigt: ${c.lines.some((l) => l.label.startsWith("Einkommens")) ? "ja" : "nein"}${c.openPoints.length ? ` · offene Punkte: ${c.openPoints.length}` : ""}`;
}

/* ---------- Assistent ---------- */

/**
 * Förder-Check als geführter Assistent (eine Frage-Gruppe pro Schritt, Ergebnis am Ende).
 * Ordnet belegte Programme zu und nennt Sätze nur dort, wo sie offiziell feststehen.
 * Speichert nichts; nur „Im Angebot berücksichtigen“ übergibt die Auswahl einmalig an die Anfrage.
 */
export function FoerderCheck() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [a, setA] = useState<Answers>(EMPTY);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const headRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps = stepsFor(a);
  const done = index >= steps.length;
  const step = steps[Math.min(index, steps.length - 1)];
  const results = useMemo(() => (done ? buildResults(a) : []), [done, a]);
  const fitting = results.filter(isFitting).length;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headRef.current?.focus({ preventScroll: true });
    const el = headRef.current?.closest(".fw");
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [index, reduce]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));
  const toggleVorhaben = (v: Vorhaben) =>
    setA((x) => ({ ...x, vorhaben: x.vorhaben.includes(v) ? x.vorhaben.filter((y) => y !== v) : [...x.vorhaben, v] }));

  const go = (n: number) => {
    setDir(n > index ? 1 : -1);
    setIndex(Math.max(0, Math.min(steps.length, n)));
  };
  const canNext = done ? false : complete(step, a);

  const restart = () => {
    setA(EMPTY);
    setDir(-1);
    setIndex(0);
  };

  const handoff = () => {
    // Erstes gewähltes Vorhaben bestimmt das Anliegen im Assistenten
    const byVorhaben: Record<string, string> = {
      pv: "photovoltaik",
      waermepumpe: "waermepumpe",
      speicher: "stromspeicher",
      wallbox: "e-mobilitaet",
    };
    const first = a.vorhaben.find((v) => byVorhaben[v]);
    const service = serviceById(first ? byVorhaben[first] : "elektroinstallation")?.title;
    const wpRow = results.find((r) => r.wp);
    const lines = [
      `Förder-Check: ${a.vorhaben.map((v) => labelOf(VORHABEN, v)).join(", ")}`,
      `Ort/Gebäude: ${labelOf(ORT, a.ort)}, ${labelOf(GEBAEUDE, a.gebaeude)} · ${labelOf(ROLLE, a.rolle)}`,
      a.vorhaben.includes("pv") ? `Anlage: ${labelOf(GROESSE, a.groesse)}, ${labelOf(EINSPEISUNG, a.einspeisung)}` : "",
      wpActive(a) ? wpHandoffLine(a) : "",
      wpRow?.wp ? wpResultLine(wpRow) : "",
      `Zeitplan: ${[needsStart(a) ? labelOf(START, a.start) : "", labelOf(STAND, a.stand)].filter(Boolean).join(" · ")} · Kredit: ${labelOf(KREDIT, a.kredit)}`,
      fitting ? `Passend laut Check: ${results.filter(isFitting).map((r) => r.p.name).join("; ")}` : "",
      "Bitte Förderung im Angebot berücksichtigen.",
    ].filter(Boolean);
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ service, message: lines.join("\n") }));
    } catch {
      /* ignorieren */
    }
    router.push("/kontakt");
  };

  const kfwOpen = results.some((r) => r.p.id === "kfw270" && r.status === "passt");
  const wpOpen = results.some((r) => r.p.id === "kfw458" && isFitting(r));
  const onlyWp = a.vorhaben.length > 0 && a.vorhaben.every((v) => v === "waermepumpe");

  const body = (() => {
    if (done) return null;
    switch (step) {
      case "vorhaben":
        return (
          <Choice
            name="vorhaben"
            legend="Was möchten Sie umsetzen? Mehrfachauswahl möglich."
            options={VORHABEN}
            value={a.vorhaben}
            onChange={toggleVorhaben}
            multi
          />
        );
      case "objekt":
        return (
          <>
            <Choice name="ort" legend="Wo steht das Gebäude?" options={ORT} value={a.ort} onChange={(v) => set("ort", v)} />
            <Choice
              name="gebaeude"
              legend="Um welches Gebäude geht es?"
              options={GEBAEUDE}
              value={a.gebaeude}
              onChange={(v) => set("gebaeude", v)}
            />
          </>
        );
      case "rolle":
        return (
          <Choice name="rolle" legend="Wie nutzen Sie das Gebäude?" options={ROLLE} value={a.rolle} onChange={(v) => set("rolle", v)} />
        );
      case "wp-haus":
        return (
          <>
            <Choice
              name="wpEigentum"
              legend="Wem gehört das Haus?"
              options={EIGENTUM}
              value={a.wpEigentum}
              onChange={(v) => set("wpEigentum", v)}
            />
            {a.gebaeude === "mfh" ? (
              <Field
                legend="Wie viele Wohnungen hat das Haus?"
                hint="Nur Wohnungen zählen, keine Gewerbeeinheiten. Der förderfähige Höchstbetrag steigt mit jeder Wohnung."
                value={a.wpWohnungen}
                onChange={(v) => set("wpWohnungen", v)}
                error={wpUnitsError(a)}
                placeholder="z. B. 6"
                short
              />
            ) : (
              <Choice
                name="wpWohnungen"
                legend="Wie viele Wohnungen hat das Haus?"
                options={WOHNUNGEN_EFH}
                value={a.wpWohnungen}
                onChange={(v) => set("wpWohnungen", v)}
              />
            )}
            <Choice
              name="wpBauantrag"
              legend="Liegt der Bauantrag für das Haus mindestens fünf Jahre zurück?"
              hint="Gefördert werden bestehende Gebäude. Bei älteren Häusern ist das praktisch immer der Fall."
              options={YNU}
              value={a.wpBauantrag}
              onChange={(v) => set("wpBauantrag", v)}
            />
          </>
        );
      case "wp-heizung":
        return (
          <>
            <Choice
              name="wpHeizung"
              legend="Welche Heizung soll ersetzt werden?"
              options={HEIZUNG}
              value={a.wpHeizung}
              onChange={(v) => set("wpHeizung", v)}
            />
            {wpNeedsYear(a) ? (
              <Field
                legend="In welchem Jahr wurde die Heizung in Betrieb genommen?"
                hint="Steht auf dem Typenschild oder im Protokoll des Schornsteinfegers. Für den Klimageschwindigkeitsbonus muss das bei Antragstellung mindestens 20 Jahre her sein."
                value={a.wpJahr}
                onChange={(v) => set("wpJahr", v)}
                error={wpYearError(a)}
                placeholder="z. B. 2004"
                disabled={a.wpJahrOffen}
                short
              >
                <label className={`fw__opt fw__opt--inline${a.wpJahrOffen ? " is-checked" : ""}`}>
                  <input type="checkbox" checked={a.wpJahrOffen} onChange={(e) => set("wpJahrOffen", e.target.checked)} />
                  <span className="fw__mark" aria-hidden="true" />
                  <span className="fw__opt-text">
                    <span className="fw__opt-label">Weiß ich nicht</span>
                  </span>
                </label>
              </Field>
            ) : null}
          </>
        );
      case "wp-zustand":
        return (
          <>
            <Choice
              name="wpFunktion"
              legend="Funktioniert die alte Heizung noch?"
              hint="Der Klimageschwindigkeitsbonus gilt nur für den Austausch einer funktionstüchtigen Heizung."
              options={YNU}
              value={a.wpFunktion}
              onChange={(v) => set("wpFunktion", v)}
            />
            <Choice
              name="wpFossil"
              legend="Bleibt nach dem Tausch eine Öl- oder Gasheizung für dieselben Räume in Betrieb?"
              hint="Zum Beispiel ein Gaskessel als Spitzenlast in einer Hybridanlage. Dann entfällt der Bonus."
              options={FOSSIL}
              value={a.wpFossil}
              onChange={(v) => set("wpFossil", v)}
            />
          </>
        );
      case "wp-kosten":
        return (
          <>
            <Choice
              name="wpKosten"
              legend="Wissen Sie schon, was die Wärmepumpe kosten soll?"
              options={KOSTEN}
              value={a.wpKosten}
              onChange={(v) => set("wpKosten", v)}
            />
            {a.wpKosten === "bekannt" ? (
              <>
                <Field
                  legend="Geplante Gesamtkosten (brutto)"
                  hint="Gerät, Einbau, Abbau der alten Heizung und notwendige Umfeldmaßnahmen."
                  value={a.wpBetrag}
                  onChange={(v) => set("wpBetrag", v)}
                  error={wpBetragError(a)}
                  placeholder="z. B. 32.000"
                  suffix="€"
                  short
                />
                <Field
                  legend="Davon nicht förderfähig (optional)"
                  hint="Zum Beispiel Photovoltaik oder Stromspeicher im selben Angebot. Die zählen bei der Heizungsförderung nicht mit."
                  value={a.wpOhneFoerderung}
                  onChange={(v) => set("wpOhneFoerderung", v)}
                  error={wpOhneError(a)}
                  placeholder="0"
                  suffix="€"
                  short
                />
              </>
            ) : null}
          </>
        );
      case "wp-haushalt":
        return (
          <>
            <Choice
              name="wpEinkommen"
              legend="Wie hoch ist das zu versteuernde Haushaltseinkommen ungefähr?"
              hint="Gemeint ist das Einkommen aller Eigentümer:innen im Haushalt samt Partner:in, im Durchschnitt des zweiten und dritten Jahres vor dem Antrag (bei Antrag 2026: 2023 und 2024). Sie finden es im Steuerbescheid. Die Angabe bleibt in Ihrem Browser und geht nicht in die Anfrage."
              options={EINKOMMEN}
              value={a.wpEinkommen}
              onChange={(v) => set("wpEinkommen", v)}
            />
            {wpNeedsKinder(a) ? (
              <Choice
                name="wpKinder"
                legend="Lebt mindestens ein minderjähriges Kind mit Kindergeldanspruch im Haushalt?"
                hint="Dann wird das Einkommen für den Bonus pauschal um 10.000 € gesenkt."
                options={YNU}
                value={a.wpKinder}
                onChange={(v) => set("wpKinder", v)}
              />
            ) : null}
          </>
        );
      case "anlage":
        return (
          <>
            <Choice
              name="groesse"
              legend="Wie groß wird die Anlage ungefähr?"
              options={GROESSE}
              value={a.groesse}
              onChange={(v) => set("groesse", v)}
            />
            <Choice
              name="einspeisung"
              legend="Was soll mit dem Strom passieren?"
              options={EINSPEISUNG}
              value={a.einspeisung}
              onChange={(v) => set("einspeisung", v)}
            />
          </>
        );
      case "zeit":
        return (
          <>
            {needsStart(a) ? (
              <Choice
                name="start"
                legend="Wann soll die Anlage in Betrieb gehen?"
                options={START}
                value={a.start}
                onChange={(v) => set("start", v)}
              />
            ) : null}
            <Choice name="stand" legend="Wie weit sind Sie?" options={STAND} value={a.stand} onChange={(v) => set("stand", v)} />
            {wpActive(a) && a.stand === "beauftragt" ? (
              <Choice
                name="wpVertrag"
                legend="Hängt der Vertrag für die Wärmepumpe von der Förderzusage ab?"
                hint="Der Zuschuss entfällt, wenn vor dem Antrag ein Vertrag ohne Förderbedingung unterschrieben wurde oder die Arbeiten begonnen haben."
                options={VERTRAG}
                value={a.wpVertrag}
                onChange={(v) => set("wpVertrag", v)}
              />
            ) : null}
            {wpActive(a) ? (
              <Choice
                name="wpAntrag"
                legend="Wann möchten Sie den Förderantrag stellen?"
                hint="Klimageschwindigkeitsbonus und förderfähiger Höchstbetrag sinken stufenweise. Maßgeblich ist das Datum der Antragstellung, nicht der Einbau."
                options={ANTRAG}
                value={a.wpAntrag}
                onChange={(v) => set("wpAntrag", v)}
              />
            ) : null}
          </>
        );
      case "kredit":
        return (
          <Choice
            name="kredit"
            legend="Interessiert Sie ein Förderkredit?"
            options={KREDIT}
            value={a.kredit}
            onChange={(v) => set("kredit", v)}
          />
        );
    }
  })();

  const regionalText =
    a.ort === "karlsfeld" || a.ort === "dachau"
      ? regional.text
      : "Für Ihren Ort prüfen wir regionale Programme gern im Gespräch. In Karlsfeld und im Landkreis Dachau gibt es derzeit keine eigenen Zuschüsse.";

  return (
    <div className="fw">
      <Progress steps={steps} index={index} />

      <div className="fw__stage" aria-live="polite">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={done ? "ergebnis" : step}
            className="fw__panel"
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {!done ? (
              <>
                <p className="fw__count tech">
                  Schritt {index + 1} von {steps.length}
                </p>
                <h2 className="fw__title" tabIndex={-1} ref={headRef}>
                  {
                    {
                      vorhaben: "Was ist geplant?",
                      objekt: "Wo und woran?",
                      rolle: "Wer nutzt das Gebäude?",
                      "wp-haus": "Das Haus",
                      "wp-heizung": "Die Heizung heute",
                      "wp-zustand": "Zustand der alten Heizung",
                      "wp-kosten": "Kosten der Wärmepumpe",
                      "wp-haushalt": "Haushalt",
                      anlage: "Ein paar Eckdaten zur Anlage",
                      zeit: "Zeitplan",
                      kredit: "Finanzierung",
                    }[step]
                  }
                </h2>
                <div className="fw__body">{body}</div>
              </>
            ) : (
              <div className="fr">
                <div className="fr__summary">
                  <h2 className="fw__title" tabIndex={-1} ref={headRef}>
                    {fitting === 0 ? "Aktuell kein passendes Programm" : `${fitting} ${fitting === 1 ? "Möglichkeit" : "Möglichkeiten"} für Ihr Vorhaben`}
                  </h2>
                  <p className="fr__answers">
                    {[
                      a.vorhaben.map((v) => labelOf(VORHABEN, v)).join(" + "),
                      labelOf(GEBAEUDE, a.gebaeude),
                      labelOf(ROLLE, a.rolle),
                      a.vorhaben.includes("pv") ? labelOf(GROESSE, a.groesse) : "",
                      needsStart(a) ? `Inbetriebnahme ${labelOf(START, a.start).toLowerCase()}` : "",
                      wpActive(a) ? `Heizung heute: ${labelOf(HEIZUNG, a.wpHeizung)}` : "",
                      wpActive(a) ? `Antrag: ${labelOf(ANTRAG, a.wpAntrag)}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="tech fr__stand">Datenstand {FOERDER_STAND} · amtliche Quellen</p>
                </div>

                {kfwOpen ? (
                  <p className="fr__alert">
                    <strong>Wichtig:</strong> Den KfW-Kredit beantragen Sie über Ihre Hausbank, bevor Sie einen Auftrag
                    vergeben.
                  </p>
                ) : null}
                {wpOpen ? (
                  <p className="fr__alert">
                    <strong>Wichtig bei der Wärmepumpe:</strong> Zuerst kommt der Förderantrag, dann der Vertrag. Unterschreiben
                    Sie vorher nur einen Vertrag, der ausdrücklich von der Förderzusage abhängt, und lassen Sie die Arbeiten erst
                    danach beginnen.
                  </p>
                ) : null}

                <ol className="fr__list">
                  {results.map((r, i) => (
                    <ResultRow key={r.p.id} r={r} i={i} kredit={a.kredit} />
                  ))}
                </ol>

                <aside className="fr__regional">
                  {!onlyWp ? (
                    <>
                      <p>
                        <strong>Zuschüsse:</strong> Für Photovoltaik, Speicher und Wallbox gibt es derzeit weder vom Bund noch
                        vom Freistaat Bayern einen Zuschuss für Privathaushalte. {regionalText}
                      </p>
                      <p className="fc__src">
                        {regional.quellen.map((q, i) => (
                          <span key={q.url}>
                            {i ? " · " : null}
                            <a className="link-line" href={q.url} target="_blank" rel="noopener noreferrer">
                              {q.label}
                            </a>
                          </span>
                        ))}{" "}
                        · Stand {regional.stand}
                      </p>
                    </>
                  ) : null}
                  {a.vorhaben.includes("waermepumpe") ? (
                    <p>
                      <strong>Wärmepumpe regional:</strong> Zuschüsse von Gemeinde, Landkreis oder Land sind für die
                      Wärmepumpe hier nicht erfasst. Wir klären das gern im Gespräch.
                    </p>
                  ) : null}
                </aside>

                <div className="fr__cta">
                  <button type="button" className="btn btn--primary btn--wrap" onClick={handoff}>
                    Im Angebot berücksichtigen lassen
                    <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 10h11M11 5l5 5-5 5" />
                    </svg>
                  </button>
                  <button type="button" className="fw__ghost" onClick={restart}>
                    Neu starten
                  </button>
                </div>
                <p className="fc__legal">
                  Orientierung, keine Förder- oder Steuerberatung. Angaben ohne Gewähr; maßgeblich sind die Bedingungen
                  der jeweiligen Stelle.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!done ? (
        <div className="fw__nav">
          {index > 0 ? (
            <button type="button" className="fw__ghost" onClick={() => go(index - 1)}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M16 10H5M9 5l-5 5 5 5" />
              </svg>
              Zurück
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn btn--primary" disabled={!canNext} onClick={() => go(index + 1)}>
            {index === steps.length - 1 ? "Ergebnis anzeigen" : "Weiter"}
            <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="fw__nav">
          <button type="button" className="fw__ghost" onClick={() => go(steps.length - 1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M16 10H5M9 5l-5 5 5 5" />
            </svg>
            Antworten ändern
          </button>
          <span />
        </div>
      )}
    </div>
  );
}
