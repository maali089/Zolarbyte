"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import { validateInquiry, type InquiryErrors } from "@/lib/validation";
import { CheckIcon, TopicIcon } from "./icons";
import { SunArcProgress } from "./SunArcProgress";
import {
  HANDOFF_KEY,
  INQUIRY_TOPICS,
  OBJEKT_OPTIONS,
  PV_EXTRA_OPTIONS,
  WALLBOX_EXTRA_OPTIONS,
  ZEITRAUM_OPTIONS,
  topicBySlug,
  type InquiryTopicSlug,
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

const EMPTY: Values = { topic: "", objekt: "", zeitraum: "", ort: "", extra: "", name: "", email: "", phone: "", message: "" };
const STORAGE_KEY = "zb-inquiry-v1";
const STEP_LABELS = ["Anliegen", "Rahmen", "Kontakt"];
const MAX_ORT = 80;

const PLACEHOLDERS: Record<string, string> = {
  photovoltaik: "Zum Beispiel: Einfamilienhaus mit Satteldach. Ich möchte wissen, ob der Zählerschrank dafür geeignet ist.",
  wallbox: "Zum Beispiel: Stellplatz in der Garage, etwa 15 Meter vom Zählerschrank entfernt. Reicht die Hausinstallation?",
  elektroinstallation: "Zum Beispiel: Zusätzliche Steckdosen im Wohnzimmer und neue Beleuchtung in der Küche.",
  stoerung: "Zum Beispiel: Die Sicherung im Keller löst immer wieder aus, sobald die Waschmaschine läuft.",
  pruefung: "Zum Beispiel: E-Check für ein Mehrfamilienhaus oder DGUV-V3-Prüfung von Geräten im Betrieb.",
  schulung: "Zum Beispiel: Welche Themen interessieren Sie, und für wie viele Personen?",
  sonstiges: "Schreiben Sie einfach in eigenen Worten, worum es geht.",
};

function scrollIntoView(el: HTMLElement | null) {
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: Record<string, unknown>) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72) - 16 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

type ChipGroupProps = {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

/** Optionale Einzelauswahl als echte Radio-Gruppe. Erneuter Klick oder „Zurücksetzen“ hebt die Auswahl auf. */
function ChipGroup({ legend, name, options, value, onChange, hint }: ChipGroupProps) {
  return (
    <fieldset className="as-group">
      <legend>
        {legend}
        {value ? (
          <button type="button" className="as-reset" onClick={() => onChange("")}>
            Zurücksetzen
          </button>
        ) : null}
      </legend>
      {hint ? <p className="as-hint">{hint}</p> : null}
      <div className="as-chips">
        {options.map((o) => (
          <label key={o} className="as-chip">
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              onClick={(e) => {
                // Mausklick auf die bereits gewählte Option hebt sie auf (Tastatur: „Zurücksetzen“)
                if (e.detail > 0 && value === o) onChange("");
              }}
            />
            <span className="as-chip__face">
              <CheckIcon />
              {o.includes(": ") ? o.split(": ")[1].replace(/^./, (c) => c.toUpperCase()) : o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

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
  const [nav, setNav] = useState({ step: 0, dir: 1 });
  const { step, dir } = nav;
  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, topic: topicBySlug(initialTopic)?.slug ?? "" }));
  const [errors, setErrors] = useState<InquiryErrors & { topic?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [confirming, setConfirming] = useState<string>("");
  const [summary, setSummary] = useState<Values | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const focusHeading = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topic = topicBySlug(values.topic);
  const isStoerung = values.topic === "stoerung";
  const done = status === "success";

  const clearTimer = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };

  const goTo = useCallback((next: number, opts?: { focus?: boolean }) => {
    setNav((cur) => ({ step: next, dir: next >= cur.step ? 1 : -1 }));
    focusHeading.current = opts?.focus !== false;
    setErrors({});
  }, []);

  /** Anliegen von außen (Prop, URL, Event): übernehmen, zu Schritt 2, in den Blick scrollen. */
  const applyExternalTopic = useCallback(
    (slug: string, scroll: boolean) => {
      const t = topicBySlug(slug);
      if (!t) return;
      clearTimer();
      setConfirming("");
      setStatus((s) => (s === "success" ? "idle" : s));
      setValues((v) => (v.topic === t.slug ? v : { ...v, topic: t.slug, extra: "" }));
      goTo(t.slug === "stoerung" ? 0 : 1);
      if (scroll) requestAnimationFrame(() => scrollIntoView(rootRef.current));
    },
    [goTo],
  );

  // Wiederherstellen (sessionStorage), danach URL-Parameter und Rechner-Übergabe
  useEffect(() => {
    startedAt.current = Date.now();
    let restoredStep = 0;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { step?: number; values?: Partial<Values>; t?: number };
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
        if (typeof saved.step === "number" && saved.step >= 0 && saved.step <= 2) restoredStep = saved.step;
        setNav({ step: restoredStep, dir: 1 });
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
        setNav({ step: 2, dir: 1 });
      }
    } catch {
      /* ignorieren */
    }

    const param = new URLSearchParams(window.location.search).get("anliegen");
    if (param && topicBySlug(param)) {
      applyExternalTopic(param, true);
    } else if (initialTopic && topicBySlug(initialTopic) && restoredStep === 0) {
      setNav((n) => (n.step === 0 && topicBySlug(initialTopic)?.slug !== "stoerung" ? { step: 1, dir: 1 } : n));
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

  // Zustand sichern (nach Erfolg nicht mehr)
  useEffect(() => {
    if (!hydrated) return;
    // Erst nach einer Nutzereingabe speichern (§ 25 Abs. 2 TDDDG: nur auf Nutzeraktion)
    const touched = step > 0 || Object.values(values).some((v) => typeof v === "string" && v.trim() !== "");
    if (!touched && !done) return;
    try {
      if (done) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, values, t: startedAt.current }));
    } catch {
      /* ignorieren */
    }
  }, [hydrated, step, values, done]);

  useEffect(() => clearTimer, []);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((er) => (er[key as keyof InquiryErrors] ? { ...er, [key]: undefined } : er));
  };

  function selectTopic(slug: InquiryTopicSlug) {
    setValues((v) => (v.topic === slug ? v : { ...v, topic: slug, extra: "" }));
    setErrors({});
  }

  function onTopicClick(slug: InquiryTopicSlug) {
    // Kein automatischer Schrittwechsel (WCAG 3.2.2) – nur kurze Bestätigung, weiter über „Weiter“
    selectTopic(slug);
    clearTimer();
    setConfirming(slug);
    advanceTimer.current = setTimeout(() => setConfirming(""), reduce ? 120 : 600);
  }

  function next() {
    if (step === 0) {
      if (!values.topic) {
        setErrors({ topic: "Bitte wählen Sie ein Anliegen aus." });
        return;
      }
      clearTimer();
      setConfirming("");
      goTo(1);
    } else if (step === 1) {
      if (values.ort.length > MAX_ORT) {
        setErrors({ ort: "Bitte kürzen Sie die Angabe (max. 80 Zeichen)." });
        return;
      }
      goTo(2);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 2) return;
    const payload = {
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
    };
    const found = validateInquiry(payload);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      if (first === "service" || first === "topic") {
        goTo(0);
      } else if (first === "ort" || first === "objekt" || first === "zeitraum" || first === "extra") {
        goTo(1);
      } else {
        formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      }
      return;
    }

    setStatus("sending");
    const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    let result: Status = "error";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website, t: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: InquiryErrors };
      if (res.ok && data.ok) result = "success";
      else if (data.error === "validation" && data.errors) {
        setErrors(data.errors);
        result = "idle";
      } else if (data.error === "not_configured") result = "not_configured";
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
    setNav({ step: 0, dir: -1 });
    startedAt.current = Date.now();
    focusHeading.current = true;
  }

  const headingRef = (el: HTMLHeadingElement | null) => {
    if (el && focusHeading.current) {
      focusHeading.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const slide = reduce ? 0 : 28;
  const motionProps = {
    initial: { opacity: 0, x: dir * slide },
    animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, x: -dir * (slide / 2), transition: { duration: 0.12, ease: "easeIn" as const } },
  };

  const phoneCall = (
    <div className="as-call">
      <p>
        <strong>Bei Störungen ist ein Anruf am schnellsten.</strong>
        <span>Rufen Sie uns direkt an – das Formular bleibt als Alternative.</span>
      </p>
      <a className="as-btn as-btn--call" href={site.general.phoneHref}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 005 5l1.4-2.2L19 14.2V18a2 2 0 01-2 2A13 13 0 013 6a2 2 0 012-2z" />
        </svg>
        {site.general.phone}
      </a>
    </div>
  );

  const err = (key: string, id: string) =>
    (errors as Record<string, string | undefined>)[key] ? (
      <p id={id} className="as-error">
        {(errors as Record<string, string | undefined>)[key]}
      </p>
    ) : null;

  const wallboxExtra = values.topic === "photovoltaik";
  const pvExtra = values.topic === "wallbox";

  const live = done
    ? "Ihre Anfrage wurde gesendet."
    : status === "sending"
      ? "Anfrage wird gesendet."
      : `Schritt ${step + 1} von 3: ${STEP_LABELS[step]}`;

  return (
    <div ref={rootRef} className={`zb-assist zb-assist--${tone}`} data-step={step}>
      {!mailConfigured && previewNote ? (
        <p className="as-notice" role="note">
          <strong>Vorschau:</strong> Der Formularversand ist noch nicht eingerichtet. Anfragen über dieses Formular werden
          derzeit nicht übermittelt.
        </p>
      ) : null}

      {!done ? <SunArcProgress labels={STEP_LABELS} current={step} onGo={(i) => goTo(i)} /> : null}
      <p className="as-count" role="status" aria-live="polite">
        {done ? null : <span aria-hidden="true">Schritt {step + 1} von 3</span>}
        <span className="visually-hidden">{live}</span>
      </p>

      <form ref={formRef} noValidate onSubmit={onSubmit} className="as-form" aria-label="Anfrage-Assistent">
        <div className="as-stage">
          <AnimatePresence mode="wait" initial={false}>
            {done && summary ? (
              <motion.div key="done" className="as-step" {...motionProps}>
                <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                  Danke, Ihre Anfrage ist bei uns.
                </h3>
                <p className="as-lead">
                  Wir melden uns persönlich bei Ihnen, per E-Mail
                  {summary.phone.trim() ? " oder telefonisch" : ""}. Falls es dringend ist, erreichen Sie uns auch direkt
                  unter <a href={site.general.phoneHref}>{site.general.phone}</a>.
                </p>
                <dl className="as-summary">
                  <div>
                    <dt>Anliegen</dt>
                    <dd>{topicBySlug(summary.topic)?.service}</dd>
                  </div>
                  {[
                    ["Objekt", summary.objekt],
                    ["Zeitraum", summary.zeitraum],
                    ["PLZ / Ort", summary.ort.trim()],
                    ["Zusatzangabe", summary.extra],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  <div>
                    <dt>Name</dt>
                    <dd>{summary.name.trim()}</dd>
                  </div>
                  <div>
                    <dt>E-Mail</dt>
                    <dd>{summary.email.trim()}</dd>
                  </div>
                  {summary.phone.trim() ? (
                    <div>
                      <dt>Telefon</dt>
                      <dd>{summary.phone.trim()}</dd>
                    </div>
                  ) : null}
                  {summary.message.trim() ? (
                    <div>
                      <dt>Nachricht</dt>
                      <dd className="as-summary__msg">{summary.message.trim()}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="as-nav">
                  <button type="button" className="as-btn as-btn--ghost" onClick={restart}>
                    Weitere Anfrage stellen
                  </button>
                </div>
              </motion.div>
            ) : step === 0 ? (
              <motion.div key="s0" className="as-step" {...motionProps}>
                <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                  Worum geht es?
                </h3>
                <fieldset className="as-topics" aria-describedby={errors.topic ? `${uid}-topic-error` : undefined}>
                  <legend className="visually-hidden">Anliegen auswählen</legend>
                  <div className="as-topics__grid">
                    {INQUIRY_TOPICS.map((t) => (
                      <label key={t.slug} className={`as-topic${confirming === t.slug ? " is-confirming" : ""}`}>
                        <input
                          type="radio"
                          name={`${uid}-topic`}
                          value={t.slug}
                          checked={values.topic === t.slug}
                          onChange={() => selectTopic(t.slug)}
                          onClick={() => onTopicClick(t.slug)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              selectTopic(t.slug);
                              if (t.slug !== "stoerung") goTo(1);
                            }
                          }}
                        />
                        <span className="as-topic__face">
                          <TopicIcon slug={t.slug} />
                          <span className="as-topic__label">{t.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {err("topic", `${uid}-topic-error`)}
                {isStoerung ? phoneCall : null}
                <div className="as-nav">
                  <button type="button" className="as-btn as-btn--primary" onClick={next}>
                    {isStoerung ? "Trotzdem online anfragen" : "Weiter"}
                  </button>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="s1" className="as-step" {...motionProps}>
                <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                  Ein paar Eckdaten
                </h3>
                <p className="as-lead">
                  Zu <strong>{topic?.label}</strong>. Alles hier ist freiwillig, ein Klick genügt.
                </p>
                {isStoerung ? <div className="as-call as-call--compact"><a href={site.general.phoneHref}>Direkt anrufen: {site.general.phone}</a></div> : null}
                {values.topic !== "schulung" ? (
                  <ChipGroup legend="Objekt" name={`${uid}-objekt`} options={OBJEKT_OPTIONS} value={values.objekt} onChange={(v) => set("objekt", v)} />
                ) : null}
                <ChipGroup legend="Zeitraum" name={`${uid}-zeitraum`} options={ZEITRAUM_OPTIONS} value={values.zeitraum} onChange={(v) => set("zeitraum", v)} />
                {wallboxExtra ? (
                  <ChipGroup legend="Wallbox mitdenken?" name={`${uid}-extra`} options={WALLBOX_EXTRA_OPTIONS} value={values.extra} onChange={(v) => set("extra", v)} />
                ) : null}
                {pvExtra ? (
                  <ChipGroup legend="PV-Anlage vorhanden?" name={`${uid}-extra`} options={PV_EXTRA_OPTIONS} value={values.extra} onChange={(v) => set("extra", v)} />
                ) : null}
                <div className="as-field">
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
                    aria-describedby={errors.ort ? `${uid}-ort-error` : undefined}
                    placeholder="zum Beispiel 85757"
                  />
                  {err("ort", `${uid}-ort-error`)}
                </div>
                <div className="as-nav">
                  <button type="button" className="as-btn as-btn--ghost" onClick={() => goTo(0)}>
                    Zurück
                  </button>
                  <button type="button" className="as-btn as-btn--text" onClick={() => goTo(2)}>
                    Überspringen
                  </button>
                  <button type="button" className="as-btn as-btn--primary" onClick={next}>
                    Weiter
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="s2" className="as-step" {...motionProps}>
                <h3 className="as-title" tabIndex={-1} ref={headingRef}>
                  Wie erreichen wir Sie?
                </h3>
                <p className="as-lead">Pflichtfelder sind mit * gekennzeichnet.</p>
                {prefilled ? <p className="as-notice" role="status">Ihre Angaben aus dem Rechner wurden in die Nachricht übernommen. Sie können sie vor dem Absenden ändern.</p> : null}
                {isStoerung ? <div className="as-call as-call--compact"><a href={site.general.phoneHref}>Bei Störungen schneller: {site.general.phone}</a></div> : null}

                <div className="as-fields">
                  <div className="as-field">
                    <label htmlFor={`${uid}-name`}>Name *</label>
                    <input
                      id={`${uid}-name`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={200}
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                    />
                    {err("name", `${uid}-name-error`)}
                  </div>
                  <div className="as-field">
                    <label htmlFor={`${uid}-email`}>E-Mail *</label>
                    <input
                      id={`${uid}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      maxLength={200}
                      value={values.email}
                      onChange={(e) => set("email", e.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                    />
                    {err("email", `${uid}-email-error`)}
                  </div>
                  <div className="as-field">
                    <label htmlFor={`${uid}-phone`}>
                      Telefon <span className="as-opt">(optional, für den Rückruf)</span>
                    </label>
                    <input
                      id={`${uid}-phone`}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={50}
                      value={values.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      aria-invalid={errors.phone ? true : undefined}
                      aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
                    />
                    {err("phone", `${uid}-phone-error`)}
                  </div>
                  <div className="as-field as-field--wide">
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
                </div>

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
                      Ihre Anfrage wurde nicht gesendet, weil der Formularversand noch nicht eingerichtet ist. Bitte
                      schreiben Sie uns direkt an <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
                    </p>
                  ) : null}
                  {status === "error" ? (
                    <p className="as-banner as-banner--error">
                      Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie
                      uns an <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
                    </p>
                  ) : null}
                </div>

                <div className="as-nav">
                  <button type="button" className="as-btn as-btn--ghost" onClick={() => goTo(1)}>
                    Zurück
                  </button>
                  <button type="submit" className="as-btn as-btn--primary" disabled={status === "sending"}>
                    {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
