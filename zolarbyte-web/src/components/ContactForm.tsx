"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { SERVICE_OPTIONS, validateInquiry, type InquiryErrors, type InquiryInput } from "@/lib/validation";

export const HANDOFF_KEY = "zb-calculator-handoff";

type Status = "idle" | "sending" | "success" | "error" | "not_configured";

const EMPTY: InquiryInput = { name: "", email: "", phone: "", service: "", message: "" };

export function ContactForm({ mailConfigured, previewNote }: { mailConfigured: boolean; previewNote: boolean }) {
  const [values, setValues] = useState<InquiryInput>(EMPTY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [prefilled, setPrefilled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  // Angaben aus dem Rechner übernehmen (nur interne Vorschau)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { service?: string; message?: string };
      sessionStorage.removeItem(HANDOFF_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalige Übernahme aus sessionStorage
      setValues((v) => ({
        ...v,
        service: data.service && SERVICE_OPTIONS.includes(data.service) ? data.service : v.service,
        message: data.message ?? v.message,
      }));
      setPrefilled(true);
    } catch {
      /* ignorieren */
    }
  }, []);

  const set = (key: keyof InquiryInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateInquiry(values);
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
        body: JSON.stringify({ ...values, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: InquiryErrors };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(EMPTY);
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

      {prefilled ? (
        <div className="notice" role="status">
          <span>Ihre Angaben aus dem Rechner wurden in die Nachricht übernommen. Sie können sie vor dem Absenden ändern.</span>
        </div>
      ) : null}

      <p id={`${uid}-required`} className="field__hint">
        Pflichtfelder sind mit * gekennzeichnet.
      </p>

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
            Telefon <span className="optional">(optional)</span>
          </label>
          <input type="tel" autoComplete="tel" inputMode="tel" {...field("phone")} />
          {error("phone")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-service`}>Gewünschte Leistung *</label>
          <select required {...field("service")}>
            <option value="" disabled>
              Bitte auswählen
            </option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {error("service")}
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${uid}-message`}>Nachricht *</label>
        <textarea rows={6} required {...field("message")} />
        {error("message")}
      </div>

      <div className="form__hp" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="form__legal">
        Ihre Angaben verwenden wir ausschließlich zur Bearbeitung Ihrer Anfrage. Mehr dazu in der{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
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
            uns direkt an <a href="mailto:kontakt@zolarbyte.de">kontakt@zolarbyte.de</a>.
          </div>
        ) : null}
        {status === "error" ? (
          <div className="form__status form__status--error">
            Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns an{" "}
            <a href="mailto:kontakt@zolarbyte.de">kontakt@zolarbyte.de</a>.
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
