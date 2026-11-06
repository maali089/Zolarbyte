import { services } from "@/lib/content";

export const SERVICE_OPTIONS = [...services.map((s) => s.title), "Sonstiges / noch unklar"];

export type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s/()-]{5,}$/;

export function validateInquiry(v: InquiryInput): InquiryErrors {
  const e: InquiryErrors = {};
  if (v.name.trim().length < 2) e.name = "Bitte geben Sie Ihren Namen an.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim()))
    e.phone = "Bitte prüfen Sie die Telefonnummer (nur Ziffern, Leerzeichen, +, / und -).";
  if (!SERVICE_OPTIONS.includes(v.service)) e.service = "Bitte wählen Sie eine Leistung aus.";
  if (v.message.trim().length < 10) e.message = "Bitte beschreiben Sie Ihr Anliegen in ein paar Worten.";
  if (v.message.length > 5000) e.message = "Die Nachricht ist zu lang (max. 5.000 Zeichen).";
  return e;
}
