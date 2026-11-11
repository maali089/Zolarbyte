import { BUILDINGS, INTERESTS, STAGES } from "@/lib/content";

export const INTEREST_VALUES: string[] = INTERESTS.map((i) => i.value);
export const interestLabel = (v: string) => INTERESTS.find((i) => i.value === v)?.label ?? v;

export type InquiryInput = {
  interest: string;
  building: string;
  location: string;
  stage: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Freiwillig übernommene Zusammenfassung aus dem Förderrechner (vom Nutzer geprüft) */
  calc: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s/()-]{5,}$/;

export function validateInquiry(v: InquiryInput): InquiryErrors {
  const e: InquiryErrors = {};
  if (!INTEREST_VALUES.includes(v.interest)) e.interest = "Bitte wählen Sie aus, worum es geht.";
  if (v.building && !(BUILDINGS as readonly string[]).includes(v.building)) e.building = "Bitte wählen Sie eine Gebäudeart aus der Liste.";
  if (v.stage && !(STAGES as readonly string[]).includes(v.stage)) e.stage = "Bitte wählen Sie einen Projektstand aus der Liste.";
  if (v.location.length > 120) e.location = "Bitte geben Sie nur PLZ und Ort an.";
  if (v.name.trim().length < 2) e.name = "Bitte geben Sie Ihren Namen an.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim()))
    e.phone = "Bitte prüfen Sie die Telefonnummer (nur Ziffern, Leerzeichen, +, / und -).";
  if (v.message.length > 5000) e.message = "Die Nachricht ist zu lang (max. 5.000 Zeichen).";
  if (v.calc.length > 4000) e.calc = "Die Rechner-Zusammenfassung ist zu lang.";
  return e;
}
