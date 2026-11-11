"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BUILDINGS, INTERESTS, STAGES } from "@/lib/content";
import { site } from "@/lib/site";
import { INTEREST_VALUES, validateInquiry, type InquiryErrors, type InquiryInput } from "@/lib/validation";

/** Übergabe aus dem Förderrechner – nur, wenn der Nutzer das ausdrücklich auslöst */
export const HANDOFF_KEY = "zb-calculator-handoff";

type Status = "idle" | "sending" | "success" | "error" | "not_configured";

const EMPTY: InquiryInput = {
  interest: "",
  building: "",
  location: "",
  stage: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  calc: "",
};

export function ContactForm({ mailConfigured, previewNote }: { mailConfigured: boolean; previewNote: boolean }) {
  const [values, setValues] = useState<InquiryInput>(EMPTY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [includeCalc, setIncludeCalc] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  // Vorauswahl über ?interesse=… und freiwillige Übernahme aus dem Rechner
  useEffect(() => {
    const next: Partial<InquiryInput> = {};
    try {
      const q = new URLSearchParams(window.location.search).get("interesse");
      if (q && INTEREST_VALUES.includes(q)) next.interest = q;
      const raw = sessionStorage.getItem(HANDOFF_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { summary?: string };
        if (typeof data.summary === "string") {
          next.calc = data.summary.slice(0, 4000);
          next.interest = next.interest ?? "waermepumpe";
        }
      }
    } catch {
      /* ignorieren */
    }
    if (Object.keys(next).length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalige Übernahme beim Laden
      setValues((v) => ({ ...v, ...next }));
    }
  }, []);

  const update = (key: keyof InquiryInput, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const set =
    (key: keyof InquiryInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      update(key, e.target.value);

  function removeCalc() {
    update("calc", "");
    try {
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      /* ignorieren */
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { ...values, calc: includeCalc ? values.calc : "" };
    const found = validateInquiry(payload);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: InquiryErrors };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(EMPTY);
        try {
          sessionStorage.removeItem(HANDOFF_KEY);
        } catch {
          /* ignorieren */
        }
      } else if (data.error === "validation" && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
      } else if (data.error === "not_configured") {
        setStatus("not_configured");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const field = (key: keyof InquiryInput) => ({
    id: `${uid}-${key}`,
    name: key,
    value: values[key],
    onChange: set(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
  });

  const error = (key: keyof InquiryInput) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} className="field__error">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-describedby={`${uid}-required`}>
      {!mailConfigured && previewNote ? (
        <div className="notice" role="note">
          <span>
            <strong>Vorschau:</strong> Der Formularversand ist noch nicht eingerichtet. Anfragen über dieses Formular
            werden derzeit nicht übermittelt.
          </span>
        </div>
      ) : null}

      <fieldset className="field choice" aria-describedby={errors.interest ? `${uid}-interest-error` : undefined}>
        <legend>Worum geht es? *</legend>
        <div className="choice__grid">
          {INTERESTS.map((i) => (
            <label key={i.value} className="choice__item">
              <input
                type="radio"
                name="interest"
                value={i.value}
                checked={values.interest === i.value}
                onChange={() => update("interest", i.value)}
              />
              <span>{i.label}</span>
            </label>
          ))}
        </div>
        {error("interest")}
      </fieldset>

      <div className="form__row form__row--3">
        <div className="field">
          <label htmlFor={`${uid}-building`}>
            Gebäude <span className="optional">(optional)</span>
          </label>
          <select {...field("building")}>
            <option value="">Bitte wählen</option>
            {BUILDINGS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {error("building")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-location`}>
            PLZ und Ort <span className="optional">(optional)</span>
          </label>
          <input type="text" autoComplete="postal-code" placeholder="z. B. 85757 Karlsfeld" {...field("location")} />
          {error("location")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-stage`}>
            Projektstand <span className="optional">(optional)</span>
          </label>
          <select {...field("stage")}>
            <option value="">Bitte wählen</option>
            {STAGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {error("stage")}
        </div>
      </div>

      <div className="form__row form__row--2">
        <div className="field">
          <label htmlFor={`${uid}-name`}>Name *</label>
          <input type="text" autoComplete="name" required {...field("name")} />
          {error("name")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`}>E-Mail *</label>
          <input type="email" autoComplete="email" inputMode="email" required {...field("email")} />
          {error("email")}
        </div>
      </div>

      <div className="form__row form__row--2">
        <div className="field">
          <label htmlFor={`${uid}-phone`}>
            Telefon <span className="optional">(optional, für Rückruf)</span>
          </label>
          <input type="tel" autoComplete="tel" inputMode="tel" {...field("phone")} />
          {error("phone")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-message`}>
            Nachricht <span className="optional">(optional)</span>
          </label>
          <textarea rows={3} {...field("message")} />
          {error("message")}
        </div>
      </div>

      {values.calc ? (
        <div className="handoff">
          <p className="handoff__title">Angaben aus dem Förderrechner</p>
          <p className="handoff__hint">
            Genau dieser Text wird mitgesendet, wenn das Häkchen gesetzt ist. Ihr Einkommen ist nicht enthalten.
          </p>
          <pre className="handoff__text">{values.calc}</pre>
          <div className="handoff__actions">
            <label className="check">
              <input type="checkbox" checked={includeCalc} onChange={(e) => setIncludeCalc(e.target.checked)} />
              <span>Diese Angaben mit der Anfrage senden</span>
            </label>
            <button type="button" className="text-button" onClick={removeCalc}>
              Entfernen
            </button>
          </div>
        </div>
      ) : null}

      <div className="form__hp" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p id={`${uid}-required`} className="form__legal">
        Pflichtfelder sind mit * gekennzeichnet. Ihre Angaben verwenden wir ausschließlich zur Bearbeitung Ihrer
        Anfrage. Mehr dazu in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <div ref={statusRef} tabIndex={-1} aria-live="polite">
        {status === "success" ? (
          <div className="form__status form__status--success">
            Vielen Dank! Ihre Anfrage ist bei uns eingegangen. Wir melden uns so bald wie möglich bei Ihnen.
          </div>
        ) : null}
        {status === "not_configured" ? (
          <div className="form__status form__status--error">
            Ihre Anfrage wurde nicht gesendet, weil der Formularversand noch nicht eingerichtet ist. Bitte schreiben Sie
            uns direkt an <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
          </div>
        ) : null}
        {status === "error" ? (
          <div className="form__status form__status--error">
            Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns an{" "}
            <a href={`mailto:${site.general.email}`}>{site.general.email}</a>.
          </div>
        ) : null}
      </div>

      <div>
        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
        </button>
      </div>
    </form>
  );
}
