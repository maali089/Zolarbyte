"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HANDOFF_KEY } from "@/components/assistant/topics";
import { serviceById } from "@/lib/content";
import { ART_LABEL, FOERDER_STAND, regional, type Vorhaben } from "@/lib/foerderung";
import { EMPTY, buildResults, type Answers, type ResultItem } from "./logic";

type Opt<V extends string> = { id: V; label: string; hint?: string };

const VORHABEN: Opt<Vorhaben>[] = [
  { id: "pv", label: "Photovoltaikanlage", hint: "Module aufs Dach" },
  { id: "speicher", label: "Batteriespeicher", hint: "Solarstrom für abends" },
  { id: "wallbox", label: "Wallbox", hint: "Laden zu Hause" },
  { id: "zaehler", label: "Zählerschrank", hint: "Erneuerung / Umbau" },
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

type StepId = "vorhaben" | "objekt" | "rolle" | "anlage" | "zeit" | "kredit";

const STEP_LABEL: Record<StepId, string> = {
  vorhaben: "Vorhaben",
  objekt: "Gebäude",
  rolle: "Nutzung",
  anlage: "Anlage",
  zeit: "Zeitplan",
  kredit: "Finanzierung",
};

function stepsFor(a: Answers): StepId[] {
  const s: StepId[] = ["vorhaben", "objekt", "rolle"];
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
    case "anlage":
      return Boolean(a.groesse && a.einspeisung);
    case "zeit":
      return Boolean(a.start && a.stand);
    case "kredit":
      return Boolean(a.kredit);
  }
}

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
}: {
  name: string;
  legend: string;
  options: Opt<V>[];
  value: V | V[] | "";
  onChange: (v: V) => void;
  multi?: boolean;
}) {
  return (
    <fieldset className="fw__q">
      <legend className="fw__legend">{legend}</legend>
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

function ResultRow({ r, i }: { r: ResultItem; i: number }) {
  const [open, setOpen] = useState(false);
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
          {r.p.bedingungen.length ? (
            <ul className="fc__cond">
              {r.p.bedingungen.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
          <a className="fc__src link-line" href={r.p.quelle.url} target="_blank" rel="noopener noreferrer">
            Quelle: {r.p.quelle.label} · Stand {r.p.stand}
          </a>
        </div>
      </div>
    </motion.li>
  );
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
  const fitting = results.filter((r) => r.status !== "nicht-mehr").length;

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
    const service =
      a.vorhaben.includes("pv") || a.vorhaben.includes("speicher")
        ? serviceById("photovoltaik")?.title
        : a.vorhaben.includes("wallbox")
          ? serviceById("e-mobilitaet")?.title
          : serviceById("elektroinstallation")?.title;
    const lines = [
      `Förder-Check: ${a.vorhaben.map((v) => labelOf(VORHABEN, v)).join(", ")}`,
      `Ort/Gebäude: ${labelOf(ORT, a.ort)}, ${labelOf(GEBAEUDE, a.gebaeude)} · ${labelOf(ROLLE, a.rolle)}`,
      a.vorhaben.includes("pv") ? `Anlage: ${labelOf(GROESSE, a.groesse)}, ${labelOf(EINSPEISUNG, a.einspeisung)}` : "",
      `Zeitplan: ${labelOf(START, a.start)} · ${labelOf(STAND, a.stand)} · Kredit: ${labelOf(KREDIT, a.kredit)}`,
      fitting ? `Passend laut Check: ${results.filter((r) => r.status !== "nicht-mehr").map((r) => r.p.name).join("; ")}` : "",
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
            <Choice
              name="start"
              legend="Wann soll die Anlage in Betrieb gehen?"
              options={START}
              value={a.start}
              onChange={(v) => set("start", v)}
            />
            <Choice name="stand" legend="Wie weit sind Sie?" options={STAND} value={a.stand} onChange={(v) => set("stand", v)} />
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
                    {a.vorhaben.map((v) => labelOf(VORHABEN, v)).join(" + ")} · {labelOf(GEBAEUDE, a.gebaeude)} ·{" "}
                    {labelOf(ROLLE, a.rolle)}
                    {a.vorhaben.includes("pv") ? ` · ${labelOf(GROESSE, a.groesse)}` : ""} · Inbetriebnahme {labelOf(START, a.start).toLowerCase()}
                  </p>
                  <p className="tech fr__stand">Datenstand {FOERDER_STAND} · amtliche Quellen</p>
                </div>

                {kfwOpen ? (
                  <p className="fr__alert">
                    <strong>Wichtig:</strong> Den KfW-Kredit beantragen Sie über Ihre Hausbank, bevor Sie einen Auftrag
                    vergeben.
                  </p>
                ) : null}

                <ol className="fr__list">
                  {results.map((r, i) => (
                    <ResultRow key={r.p.id} r={r} i={i} />
                  ))}
                </ol>

                <aside className="fr__regional">
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
