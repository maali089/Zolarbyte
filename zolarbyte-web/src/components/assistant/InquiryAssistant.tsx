"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { site } from "@/lib/site";
import { validateInquiry, type InquiryErrors } from "@/lib/validation";
import {
  HANDOFF_KEY,
  INQUIRY_TOPICS,
  OBJEKT_OPTIONS,
  PV_EXTRA_OPTIONS,
  WALLBOX_EXTRA_OPTIONS,
  ZEITRAUM_OPTIONS,
  topicBySlug,
} from "./topics";
import "./assistant.css";

type Values = {
  topic: string;
  objekt: string;
  zeitraum: string;
  ort: string;
  extra: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

type Status = "idle" | "sending" | "success" | "error" | "not_configured";
type StepId = "anliegen" | "objekt" | "details" | "zeitraum" | "ort" | "kontakt" | "nachricht";
type Opt = { value: string; label: string; hint?: string; wide?: boolean };

const EMPTY: Values = { topic: "", objekt: "", zeitraum: "", ort: "", extra: "", name: "", email: "", phone: "", message: "" };
const STORAGE_KEY = "zb-inquiry-v2";
const MAX_ORT = 80;

const STEP_LABEL: Record<StepId, string> = {
  anliegen: "Anliegen",
  objekt: "Gebäude",
  details: "Details",
  zeitraum: "Zeitraum",
  ort: "Ort",
  kontakt: "Kontakt",
  nachricht: "Nachricht",
};

const TOPIC_HINT: Record<string, string> = {
  photovoltaik: "Montage & Anschluss",
  wallbox: "Laden zu Hause",
  elektroinstallation: "Installation & Wartung",
  stoerung: "Fehlersuche & Reparatur",
  pruefung: "E-Check, DGUV V3",
  schulung: "Inhalte nach Absprache",
  sonstiges: "Beschreiben Sie es einfach selbst",
};

const TOPIC_OPTS: Opt[] = INQUIRY_TOPICS.map((t) => ({
  value: t.slug,
  label: t.label,
  hint: TOPIC_HINT[t.slug],
  wide: t.slug === "sonstiges",
}));

const OBJEKT_HINT: Record<string, string> = {
  Einfamilienhaus: "auch Doppel- oder Reihenhaus",
  Wohnung: "Eigentum oder Miete",
  Mehrfamilienhaus: "mehrere Parteien",
  Gewerbe: "Büro, Werkstatt, Halle",
};
const OBJEKT_OPTS: Opt[] = OBJEKT_OPTIONS.map((o) => ({ value: o, label: o, hint: OBJEKT_HINT[o] }));
const ZEITRAUM_OPTS: Opt[] = ZEITRAUM_OPTIONS.map((o) => ({ value: o, label: o }));
const WALLBOX_OPTS: Opt[] = [
  { value: WALLBOX_EXTRA_OPTIONS[0], label: "Ja, gleich mitdenken" },
  { value: WALLBOX_EXTRA_OPTIONS[1], label: "Nein, nur Photovoltaik" },
];
const PV_OPTS: Opt[] = [
  { value: PV_EXTRA_OPTIONS[0], label: "Ja, vorhanden" },
  { value: PV_EXTRA_OPTIONS[1], label: "Nein" },
  { value: PV_EXTRA_OPTIONS[2], label: "Ist geplant" },
];

const PLACEHOLDERS: Record<string, string> = {
  photovoltaik: "Zum Beispiel: Einfamilienhaus mit Satteldach. Ich möchte wissen, ob der Zählerschrank dafür geeignet ist.",
  wallbox: "Zum Beispiel: Stellplatz in der Garage, etwa 15 Meter vom Zählerschrank entfernt. Reicht die Hausinstallation?",
  elektroinstallation: "Zum Beispiel: Zusätzliche Steckdosen im Wohnzimmer und neue Beleuchtung in der Küche.",
  stoerung: "Zum Beispiel: Die Sicherung im Keller löst immer wieder aus, sobald die Waschmaschine läuft.",
  pruefung: "Zum Beispiel: E-Check für ein Mehrfamilienhaus oder DGUV-V3-Prüfung von Geräten im Betrieb.",
  schulung: "Zum Beispiel: Welche Themen interessieren Sie, und für wie viele Personen?",
  sonstiges: "Schreiben Sie einfach in eigenen Worten, worum es geht.",
};

function stepsFor(topic: string): StepId[] {
  const s: StepId[] = ["anliegen"];
  if (topic !== "schulung") s.push("objekt");
  if (topic === "photovoltaik" || topic === "wallbox") s.push("details");
  s.push("zeitraum", "ort", "kontakt", "nachricht");
  return s;
}

function scrollIntoView(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  // Nur scrollen, wenn der Anfang des Assistenten nicht im oberen Bildschirmbereich liegt
  if (top >= 0 && top < window.innerHeight * 0.5) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: Record<string, unknown>) => void } }).__lenis;
  const offset = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72) - 16;
  if (lenis) {
    lenis.scrollTo(el, { offset });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: window.scrollY + top + offset, behavior: reduce ? "auto" : "smooth" });
}

/** Einzelauswahl als Karten (echte Radio-Gruppe). Erneuter Mausklick hebt optionale Auswahl auf. */
function Cards({
  legend,
  name,
  options,
  value,
  onChange,
  onEnter,
  optional = true,
  describedBy,
}: {
  legend: string;
  name: string;
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  optional?: boolean;
  describedBy?: string;
}) {
  return (
    <fieldset className="as-q" aria-describedby={describedBy}>
      <legend className="as-q__legend">{legend}</legend>
      <div className={`as-opts${options.length > 3 ? " as-opts--grid" : ""}`}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label key={o.value} className={`as-card${checked ? " is-checked" : ""}${o.wide ? " as-card--wide" : ""}`}>
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                onClick={(e) => {
                  if (optional && e.detail > 0 && checked) onChange("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onEnter) {
                    e.preventDefault();
                    onChange(o.value);
                    onEnter();
                  }
                }}
              />
              <span className="as-card__mark" aria-hidden="true" />
              <span className="as-card__text">
                <span className="as-card__label">{o.label}</span>
                {o.hint ? <span className="as-card__hint">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Progress({ steps, index, done }: { steps: StepId[]; index: number; done: boolean }) {
  const p = done ? 1 : Math.min(1, index / steps.length);
  return (
    <div className="as-progress" aria-hidden="true">
      <div className="as-progress__track">
        <span className="as-progress__fill" style={{ transform: `scaleX(${p})` }} />
        <span className="as-progress__sun" style={{ left: `${p * 100}%` }} />
      </div>
      <ol className="as-progress__steps">
        {steps.map((s, i) => (
          <li key={s} className={done || i < index ? "is-done" : i === index ? "is-current" : undefined}>
            {STEP_LABEL[s]}
          </li>
        ))}
      </ol>
    </div>
  );
}

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg className="as-btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={back ? "M16 10H5M9 5l-5 5 5 5" : "M4 10h11M11 5l5 5-5 5"} />
  </svg>
);

export function InquiryAssistant({
  mailConfigured,
  previewNote,
  initialTopic,
  tone = "night",
}: {
  mailConfigured: boolean;
  previewNote: boolean;
  initialTopic?: string;
  tone?: "day" | "night";
}) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, topic: topicBySlug(initialTopic)?.slug ?? "" }));
  const steps = useMemo(() => stepsFor(values.topic), [values.topic]);
  const [nav, setNav] = useState<{ id: StepId; dir: number }>({ id: "anliegen", dir: 1 });
  const stepId: StepId = steps.includes(nav.id) ? nav.id : "anliegen";
  const index = steps.indexOf(stepId);
  const { dir } = nav;
  const [errors, setErrors] = useState<InquiryErrors & { topic?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState<Values | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const focusHeading = useRef(false);

  const topic = topicBySlug(values.topic);
  const isStoerung = values.topic === "stoerung";
  const done = status === "success";

  const goToId = useCallback((id: StepId, opts?: { focus?: boolean }) => {
    setNav((cur) => {
      const s = stepsFor(values.topic);
      return { id, dir: s.indexOf(id) >= s.indexOf(cur.id) ? 1 : -1 };
    });
    focusHeading.current = opts?.focus !== false;
    setErrors({});
    requestAnimationFrame(() => scrollIntoView(rootRef.current));
  }, [values.topic]);

  /** Anliegen von außen (Prop, URL, Event): übernehmen und direkt zur nächsten Frage. */
  const applyExternalTopic = useCallback((slug: string, scroll: boolean) => {
    const t = topicBySlug(slug);
    if (!t) return;
    setStatus((s) => (s === "success" ? "idle" : s));
    setValues((v) => (v.topic === t.slug ? v : { ...v, topic: t.slug, extra: "" }));
    setNav({ id: t.slug === "stoerung" ? "anliegen" : stepsFor(t.slug)[1], dir: 1 });
    focusHeading.current = true;
    if (scroll) requestAnimationFrame(() => scrollIntoView(rootRef.current));
  }, []);

  // Wiederherstellen (sessionStorage), danach URL-Parameter und Rechner-Übergabe
  useEffect(() => {
    startedAt.current = Date.now();
    let restored = false;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { step?: string; values?: Partial<Values>; t?: number };
        if (saved.values) {
          /* eslint-disable react-hooks/set-state-in-effect -- einmalige Wiederherstellung aus sessionStorage */
          setValues((v) => ({
            ...v,
            ...Object.fromEntries(Object.entries(saved.values!).filter(([k, val]) => k in EMPTY && typeof val === "string")),
            ...(initialTopic && topicBySlug(initialTopic) ? { topic: initialTopic } : {}),
          }));
          /* eslint-enable react-hooks/set-state-in-effect */
        }
        if (typeof saved.t === "number" && saved.t < Date.now()) startedAt.current = saved.t;
        if (saved.step && saved.step in STEP_LABEL) {
          setNav({ id: saved.step as StepId, dir: 1 });
          restored = saved.step !== "anliegen";
        }
      }
    } catch {
      /* ignorieren */
    }

    try {
      const handoff = sessionStorage.getItem(HANDOFF_KEY);
      if (handoff) {
        const data = JSON.parse(handoff) as { service?: string; message?: string };
        sessionStorage.removeItem(HANDOFF_KEY);
        const t = INQUIRY_TOPICS.find((x) => x.service === data.service);
        setValues((v) => ({ ...v, topic: t?.slug ?? v.topic, message: typeof data.message === "string" ? data.message.slice(0, 5000) : v.message }));
        setPrefilled(true);
        setNav({ id: "kontakt", dir: 1 });
        restored = true;
      }
    } catch {
      /* ignorieren */
    }

    const param = new URLSearchParams(window.location.search).get("anliegen");
    if (param && topicBySlug(param)) {
      applyExternalTopic(param, true);
    } else if (initialTopic && topicBySlug(initialTopic) && !restored && initialTopic !== "stoerung") {
      setNav({ id: stepsFor(initialTopic)[1], dir: 1 });
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Mounten
  }, []);

  // Globales Event: window.dispatchEvent(new CustomEvent("zb:inquiry", { detail: { topic: "<slug>" } }))
  useEffect(() => {
    const onEvent = (e: Event) => {
      const slug = (e as CustomEvent<{ topic?: string }>).detail?.topic;
      if (slug) applyExternalTopic(slug, true);
    };
    window.addEventListener("zb:inquiry", onEvent);
    return () => window.removeEventListener("zb:inquiry", onEvent);
  }, [applyExternalTopic]);

  // Zustand sichern – erst nach einer Nutzereingabe (§ 25 Abs. 2 TDDDG), nach Erfolg löschen
  useEffect(() => {
    if (!hydrated) return;
    const touched = stepId !== "anliegen" || Object.values(values).some((v) => v.trim() !== "");
    if (!touched && !done) return;
    try {
      if (done) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: stepId, values, t: startedAt.current }));
    } catch {
      /* ignorieren */
    }
  }, [hydrated, stepId, values, done]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((er) => (er[key as keyof InquiryErrors] ? { ...er, [key]: undefined } : er));
  };

  const payload = () => ({
    name: values.name,
    email: values.email,
    phone: values.phone,
    message: values.message,
    service: topic?.service ?? "",
    topic: values.topic,
    objekt: values.objekt,
    zeitraum: values.zeitraum,
    ort: values.ort,
    extra: values.extra,
  });

  function next() {
    if (stepId === "anliegen" && !values.topic) {
      setErrors({ topic: "Bitte wählen Sie ein Anliegen aus." });
      return;
    }
    if (stepId === "ort" && values.ort.length > MAX_ORT) {
      setErrors({ ort: "Bitte kürzen Sie die Angabe (max. 80 Zeichen)." });
      return;
    }
    if (stepId === "kontakt") {
      const found = validateInquiry(payload());
      const own = Object.fromEntries(Object.entries(found).filter(([k]) => k === "name" || k === "email" || k === "phone"));
      if (Object.keys(own).length) {
        setErrors(own);
        formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(own)[0]}"]`)?.focus();
        return;
      }
    }
    const nextId = stepsFor(values.topic)[index + 1];
    if (nextId) goToId(nextId);
  }

  function back() {
    const prev = steps[index - 1];
    if (prev) goToId(prev);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stepId !== "nachricht") {
      next();
      return;
    }
    const data = payload();
    const found = validateInquiry(data);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      if (first === "service" || first === "topic") goToId("anliegen");
      else if (first === "name" || first === "email" || first === "phone") goToId("kontakt");
      else if (first === "ort") goToId("ort");
      else if (first === "objekt") goToId("objekt");
      else if (first === "zeitraum") goToId("zeitraum");
      else if (first === "extra") goToId("details");
      else formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    let result: Status = "error";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website, t: startedAt.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: InquiryErrors };
      if (res.ok && body.ok) result = "success";
      else if (body.error === "validation" && body.errors) {
        setErrors(body.errors);
        result = "idle";
      } else if (body.error === "not_configured") result = "not_configured";
    } catch {
      result = "error";
    }
    if (result === "success") {
      setSummary(values);
      setValues(EMPTY);
      focusHeading.current = true;
    }
    setStatus(result);
    requestAnimationFrame(() => {
      if (result !== "success") statusRef.current?.focus();
    });
  }

  function restart() {
    setSummary(null);
    setStatus("idle");
    setNav({ id: "anliegen", dir: -1 });
    startedAt.current = Date.now();
    focusHeading.current = true;
  }

  const headingRef = (el: HTMLHeadingElement | null) => {
    if (el && focusHeading.current) {
      focusHeading.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const err = (key: string, id: string) =>
    (errors as Record<string, string | undefined>)[key] ? (
      <p id={id} className="as-error">
        {(errors as Record<string, string | undefined>)[key]}
      </p>
    ) : null;

  const field = (
    key: "name" | "email" | "phone",
    label: React.ReactNode,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className="as-field">
      <label htmlFor={`${uid}-${key}`}>{label}</label>
      <input
        id={`${uid}-${key}`}
        name={key}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            next();
          }
        }}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${uid}-${key}-error` : undefined}
        {...props}
      />
      {err(key, `${uid}-${key}-error`)}
    </div>
  );

  const optionalChosen: Partial<Record<StepId, string>> = {
    objekt: values.objekt,
    details: values.extra,
    zeitraum: values.zeitraum,
    ort: values.ort.trim(),
  };
  const isOptional = stepId in optionalChosen;
  const nextLabel = isOptional && !optionalChosen[stepId] ? "Ohne Angabe weiter" : "Weiter";

  const TITLE: Record<StepId, string> = {
    anliegen: "Worum geht es?",
    objekt: "Um welches Gebäude geht es?",
    details: values.topic === "photovoltaik" ? "Wallbox gleich mitplanen?" : "Gibt es schon eine PV-Anlage?",
    zeitraum: "Wann soll es losgehen?",
    ort: "Wo ist das Gebäude?",
    kontakt: "Wie erreichen wir Sie?",
    nachricht: "Noch etwas, das wir wissen sollten?",
  };

  const body = (() => {
    switch (stepId) {
      case "anliegen":
        return (
          <>
            <Cards
              legend="Wählen Sie ein Anliegen."
              name={`${uid}-topic`}
              options={TOPIC_OPTS}
              value={values.topic}
              optional={false}
              onChange={(v) => {
                setValues((cur) => (cur.topic === v ? cur : { ...cur, topic: v, extra: "" }));
                setErrors({});
              }}
              onEnter={() => requestAnimationFrame(() => next())}
              describedBy={errors.topic ? `${uid}-topic-error` : undefined}
            />
            {err("topic", `${uid}-topic-error`)}
            {isStoerung ? (
              <div className="as-call">
                <p>
                  <strong>Bei Störungen ist ein Anruf am schnellsten.</strong>
                  <span>Rufen Sie uns direkt an – online anfragen geht trotzdem.</span>
                </p>
                <a className="as-btn as-btn--call" href={site.general.phoneHref}>
                  {site.general.phone}
                </a>
              </div>
            ) : null}
          </>
        );
      case "objekt":
        return (
          <Cards legend="Freiwillig – hilft uns bei der Einschätzung." name={`${uid}-objekt`} options={OBJEKT_OPTS} value={values.objekt} onChange={(v) => set("objekt", v)} onEnter={next} />
        );
      case "details":
        return values.topic === "photovoltaik" ? (
          <Cards legend="Laden mit eigenem Solarstrom – das planen wir gern zusammen." name={`${uid}-extra`} options={WALLBOX_OPTS} value={values.extra} onChange={(v) => set("extra", v)} onEnter={next} />
        ) : (
          <Cards legend="Dann denken wir Wallbox und Photovoltaik zusammen." name={`${uid}-extra`} options={PV_OPTS} value={values.extra} onChange={(v) => set("extra", v)} onEnter={next} />
        );
      case "zeitraum":
        return (
          <Cards legend="Grobe Richtung genügt." name={`${uid}-zeitraum`} options={ZEITRAUM_OPTS} value={values.zeitraum} onChange={(v) => set("zeitraum", v)} onEnter={next} />
        );
      case "ort":
        return (
          <div className="as-field as-field--solo">
            <label htmlFor={`${uid}-ort`}>PLZ oder Ort</label>
            <input
              id={`${uid}-ort`}
              name="ort"
              type="text"
              autoComplete="postal-code"
              maxLength={MAX_ORT}
              value={values.ort}
              onChange={(e) => set("ort", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  next();
                }
              }}
              aria-invalid={errors.ort ? true : undefined}
              aria-describedby={`${uid}-ort-hint${errors.ort ? ` ${uid}-ort-error` : ""}`}
              placeholder="zum Beispiel 85757 Karlsfeld"
            />
            <p id={`${uid}-ort-hint`} className="as-hint">
              Freiwillig. Wir sind in Karlsfeld, im Landkreis Dachau und in München unterwegs.
            </p>
            {err("ort", `${uid}-ort-error`)}
          </div>
        );
      case "kontakt":
        return (
          <>
            {prefilled ? (
              <p className="as-notice" role="status">
                Ihre Angaben aus dem Förder-Check sind in der Nachricht hinterlegt. Sie können sie im nächsten Schritt ändern.
              </p>
            ) : null}
            <div className="as-fields">
              {field("name", "Name *", { type: "text", autoComplete: "name", required: true, maxLength: 200 })}
              {field("email", "E-Mail *", { type: "email", autoComplete: "email", inputMode: "email", required: true, maxLength: 200 })}
              {field(
                "phone",
                <>
                  Telefon <span className="as-opt">(optional, für den Rückruf)</span>
                </>,
                { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 50 },
              )}
            </div>
          </>
        );
      case "nachricht":
        return (
          <>
            <div className="as-field">
              <label htmlFor={`${uid}-message`}>
                Nachricht <span className="as-opt">(optional)</span>
              </label>
              <textarea
                id={`${uid}-message`}
                name="message"
                rows={5}
                maxLength={5000}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder={PLACEHOLDERS[values.topic] ?? PLACEHOLDERS.sonstiges}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? `${uid}-message-error` : undefined}
              />
              {err("message", `${uid}-message-error`)}
            </div>

            <dl className="as-recap" aria-label="Ihre Angaben">
              {[
                ["Anliegen", topic?.label ?? ""],
                ["Gebäude", values.objekt],
                ["Details", values.extra ? values.extra.split(": ")[1].replace(/^./, (c) => c.toUpperCase()) : ""],
                ["Zeitraum", values.zeitraum],
                ["Ort", values.ort.trim()],
                ["Kontakt", [values.name.trim(), values.email.trim(), values.phone.trim()].filter(Boolean).join(" · ")],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>

            <div className="as-hp" aria-hidden="true">
              <label htmlFor={`${uid}-website`}>Website</label>
              <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <p className="as-legal">
              Ihre Angaben verwenden wir ausschließlich zur Bearbeitung Ihrer Anfrage. Mehr dazu in der{" "}
              <Link href="/datenschutz">Datenschutzerklärung</Link>.
            </p>

            <div ref={statusRef} tabIndex={-1} className="as-status" aria-live="polite">
              {status === "not_configured" ? (
                <p className="as-banner as-banner--error">
                  Ihre Anfrage wurde nicht gesendet, weil der Formularversand noch nicht eingerichtet ist. Bitte schreiben Sie
                  uns direkt an <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
                </p>
              ) : null}
              {status === "error" ? (
                <p className="as-banner as-banner--error">
                  Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns an{" "}
                  <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
                </p>
              ) : null}
            </div>
          </>
        );
    }
  })();

  const live = done
    ? "Ihre Anfrage wurde gesendet."
    : status === "sending"
      ? "Anfrage wird gesendet."
      : `Schritt ${index + 1} von ${steps.length}: ${STEP_LABEL[stepId]}`;

  const slide = reduce ? 0 : 40;

  return (
    <div ref={rootRef} className={`zb-assist zb-assist--${tone}`} data-step={stepId}>
      {!mailConfigured && previewNote ? (
        <p className="as-notice" role="note">
          <strong>Vorschau:</strong> Der Formularversand ist noch nicht eingerichtet. Anfragen über dieses Formular werden
          derzeit nicht übermittelt.
        </p>
      ) : null}

      <Progress steps={steps} index={index} done={done} />
      <p className="visually-hidden" role="status" aria-live="polite">
        {live}
      </p>

      <form ref={formRef} noValidate onSubmit={onSubmit} className="as-form" aria-label="Anfrage-Assistent">
        <div className="as-stage">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={done ? "done" : stepId}
              className="as-step"
              initial={{ opacity: 0, x: dir * slide }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, x: -dir * slide, transition: { duration: 0.14, ease: "easeIn" } }}
            >
              {done && summary ? (
                <>
                  <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                    Danke, Ihre Anfrage ist bei uns.
                  </h3>
                  <p className="as-lead">
                    Wir melden uns persönlich bei Ihnen, per E-Mail
                    {summary.phone.trim() ? " oder telefonisch" : ""}. Falls es dringend ist, erreichen Sie uns direkt
                    unter <a href={site.general.phoneHref}>{site.general.phone}</a>.
                  </p>
                  <dl className="as-recap">
                    {[
                      ["Anliegen", topicBySlug(summary.topic)?.service ?? ""],
                      ["Gebäude", summary.objekt],
                      ["Zeitraum", summary.zeitraum],
                      ["Ort", summary.ort.trim()],
                      ["Kontakt", [summary.name.trim(), summary.email.trim(), summary.phone.trim()].filter(Boolean).join(" · ")],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                </>
              ) : (
                <>
                  <p className="as-count" aria-hidden="true">
                    Schritt {index + 1} von {steps.length}
                    {topic && stepId !== "anliegen" ? <span> · {topic.label}</span> : null}
                  </p>
                  <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                    {TITLE[stepId]}
                  </h3>
                  <div className="as-body">{body}</div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="as-nav">
          {done ? (
            <button type="button" className="as-btn as-btn--ghost" onClick={restart}>
              Weitere Anfrage stellen
            </button>
          ) : (
            <>
              {index > 0 ? (
                <button type="button" className="as-back" onClick={back}>
                  <Arrow back />
                  Zurück
                </button>
              ) : (
                <span />
              )}
              {stepId === "nachricht" ? (
                <button key="submit" type="submit" className="as-btn as-btn--primary" disabled={status === "sending"}>
                  {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
                  {status === "sending" ? null : <Arrow />}
                </button>
              ) : (
                <button key="next" type="button" className="as-btn as-btn--primary" onClick={next}>
                  {stepId === "anliegen" && isStoerung ? "Online anfragen" : nextLabel}
                  <Arrow />
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
