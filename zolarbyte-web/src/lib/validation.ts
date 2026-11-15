import { services } from "@/lib/content";
import {
  EXTRA_OPTIONS,
  OBJEKT_OPTIONS,
  TOPIC_SLUGS,
  ZEITRAUM_OPTIONS,
} from "@/components/assistant/topics";

export const SERVICE_OPTIONS = [...services.map((s) => s.title), "Sonstiges / noch unklar"];

export type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  /** Optionale Angaben des Anfrage-Assistenten */
  topic?: string;
  objekt?: string;
  zeitraum?: string;
  ort?: string;
  extra?: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s/()-]{5,}$/;

export const LIMITS = { name: 200, email: 200, phone: 50, service: 200, message: 5000, ort: 80 } as const;

export function validateInquiry(v: InquiryInput): InquiryErrors {
  const e: InquiryErrors = {};
  if (v.name.trim().length < 2) e.name = "Bitte geben Sie Ihren Namen an.";
  else if (v.name.length > LIMITS.name) e.name = "Der Name ist zu lang.";
  if (!EMAIL_RE.test(v.email.trim()) || v.email.length > LIMITS.email)
    e.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim()))
    e.phone = "Bitte prüfen Sie die Telefonnummer (nur Ziffern, Leerzeichen, +, / und -).";
  if (!SERVICE_OPTIONS.includes(v.service)) e.service = "Bitte wählen Sie ein Anliegen aus.";
  if (v.message.length > LIMITS.message) e.message = "Die Nachricht ist zu lang (max. 5.000 Zeichen).";

  // Optionale Chip-Angaben: nur bekannte Werte zulassen
  if (v.topic && !TOPIC_SLUGS.includes(v.topic)) e.topic = "Ungültiges Anliegen.";
  if (v.objekt && !OBJEKT_OPTIONS.includes(v.objekt)) e.objekt = "Ungültige Angabe.";
  if (v.zeitraum && !ZEITRAUM_OPTIONS.includes(v.zeitraum)) e.zeitraum = "Ungültige Angabe.";
  if (v.extra && !EXTRA_OPTIONS.includes(v.extra)) e.extra = "Ungültige Angabe.";
  if (v.ort && v.ort.trim().length > LIMITS.ort) e.ort = "Bitte kürzen Sie die Angabe (max. 80 Zeichen).";
  return e;
}
