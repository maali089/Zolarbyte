"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { HANDOFF_KEY } from "@/components/ContactForm";
import "./wizard.css";

/*
 * Modular einsetzbare Schritt-für-Schritt-Abfrage.
 * Die Komponente berechnet selbst nichts: Ergebnislogik wird über
 * `renderResult` ergänzt, sobald Zweck und Datengrundlage feststehen.
 */

export type WizardOption = { value: string; label: string; description?: string };

export type WizardStep =
  | { id: string; kind: "choice"; title: string; help?: string; options: WizardOption[] }
  | {
      id: string;
      kind: "number";
      title: string;
      help?: string;
      label: string;
      unit?: string;
      min: number;
      max: number;
    }
  | { id: string; kind: "text"; title: string; help?: string; label: string; pattern?: RegExp; patternMessage?: string };

export type WizardAnswers = Record<string, string>;

type Props = {
  steps: WizardStep[];
  /** Ergebnisansicht. Ohne Angabe wird eine Zusammenfassung gezeigt. */
  renderResult?: (answers: WizardAnswers) => React.ReactNode;
  /** Optionale Übergabe an das Kontaktformular */
  handoff?: { service: string; intro: string };
};

/** Deutsche Zahlenschreibweise zulassen: "4.200" oder "4 200" */
function parseNumber(value: string) {
  return Number(value.trim().replace(/[.\s]/g, "").replace(",", "."));
}

function displayValue(step: WizardStep, value: string) {
  if (step.kind === "choice") return step.options.find((o) => o.value === value)?.label ?? value;
  if (step.kind === "number") return `${parseNumber(value).toLocaleString("de-DE")}${step.unit ? ` ${step.unit}` : ""}`;
  return value;
}

export function summarize(steps: WizardStep[], answers: WizardAnswers) {
  return steps.map((s) => ({ id: s.id, title: s.title, value: displayValue(s, answers[s.id] ?? "") }));
}

export function StepWizard({ steps, renderResult, handoff }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const uid = useId();
  const router = useRouter();

  const done = index >= steps.length;
  const step = steps[index];
  const progress = Math.round((Math.min(index, steps.length) / steps.length) * 100);

  // Fokus bei Schrittwechsel auf die Überschrift setzen (nicht beim ersten Laden)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  function validate(s: WizardStep, value: string | undefined): string | null {
    const v = (value ?? "").trim();
    if (s.kind === "choice") return v ? null : "Bitte wählen Sie eine Option aus.";
    if (s.kind === "number") {
      const n = parseNumber(v);
      if (!v || Number.isNaN(n)) return "Bitte geben Sie eine Zahl ein.";
      if (n < s.min || n > s.max)
        return `Bitte geben Sie einen Wert zwischen ${s.min.toLocaleString("de-DE")} und ${s.max.toLocaleString("de-DE")} ein.`;
      return null;
    }
    if (!v) return "Bitte füllen Sie dieses Feld aus.";
    if (s.pattern && !s.pattern.test(v)) return s.patternMessage ?? "Bitte prüfen Sie Ihre Eingabe.";
    return null;
  }

  function next(e?: React.FormEvent) {
    e?.preventDefault();
    if (!step) return;
    const msg = validate(step, answers[step.id]);
    setError(msg);
    if (msg) return;
    setIndex((i) => i + 1);
  }

  function back() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  function setAnswer(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  }

  function sendToInquiry() {
    if (!handoff) return;
    const lines = summarize(steps, answers).map((r) => `${r.title}: ${r.value}`);
    sessionStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({ service: handoff.service, message: `${handoff.intro}\n\n${lines.join("\n")}` }),
    );
    router.push("/kontakt");
  }

  const errorId = `${uid}-error`;

  return (
    <div className="wizard">
      <div className="wizard__progress">
        <p className="wizard__count" aria-live="polite">
          {done ? "Ihre Angaben" : `Schritt ${index + 1} von ${steps.length}`}
        </p>
        <div
          className="wizard__bar"
          role="progressbar"
          aria-label="Fortschritt"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={done ? 100 : progress}
        >
          <span style={{ width: `${done ? 100 : progress}%` }} />
        </div>
      </div>

      {!done && step ? (
        <form className="wizard__step" onSubmit={next} noValidate>
          <h2 ref={headingRef} tabIndex={-1} className="wizard__title" id={`${uid}-title`}>
            {step.title}
          </h2>
          {step.help ? <p className="wizard__help">{step.help}</p> : null}

          {step.kind === "choice" ? (
            <fieldset
              className="wizard__choices"
              aria-labelledby={`${uid}-title`}
              aria-describedby={error ? errorId : undefined}
            >
              {step.options.map((o) => (
                <label key={o.value} className="choice">
                  <input
                    type="radio"
                    name={step.id}
                    value={o.value}
                    checked={answers[step.id] === o.value}
                    onChange={() => setAnswer(step.id, o.value)}
                  />
                  <span className="choice__box">
                    <span className="choice__label">{o.label}</span>
                    {o.description ? <span className="choice__desc">{o.description}</span> : null}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="field wizard__field">
              <label htmlFor={`${uid}-${step.id}`}>{step.label}</label>
              <div className="wizard__input">
                <input
                  id={`${uid}-${step.id}`}
                  type="text"
                  inputMode={step.kind === "number" ? "numeric" : "text"}
                  value={answers[step.id] ?? ""}
                  onChange={(e) => setAnswer(step.id, e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                />
                {step.kind === "number" && step.unit ? <span className="wizard__unit">{step.unit}</span> : null}
              </div>
            </div>
          )}

          {error ? (
            <p id={errorId} className="field__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="wizard__nav">
            {index > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={back}>
                Zurück
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn--primary">
              {index === steps.length - 1 ? "Angaben prüfen" : "Weiter"}
            </button>
          </div>
        </form>
      ) : (
        <div className="wizard__result">
          <h2 ref={headingRef} tabIndex={-1} className="wizard__title">
            Ihre Angaben im Überblick
          </h2>
          {renderResult ? renderResult(answers) : null}
          <dl className="wizard__summary">
            {summarize(steps, answers).map((r, i) => (
              <div key={r.id}>
                <dt>{r.title}</dt>
                <dd>{r.value}</dd>
                <button type="button" className="wizard__edit" onClick={() => setIndex(i)}>
                  Ändern<span className="visually-hidden">: {r.title}</span>
                </button>
              </div>
            ))}
          </dl>
          <div className="wizard__nav">
            <button type="button" className="btn btn--ghost" onClick={back}>
              Zurück
            </button>
            {handoff ? (
              <button type="button" className="btn btn--primary" onClick={sendToInquiry}>
                Angaben in Anfrage übernehmen
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
