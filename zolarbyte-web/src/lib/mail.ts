import "server-only";
import { interestLabel } from "@/lib/validation";

/**
 * Formularversand über die Resend-API (https://resend.com).
 * Benötigte Umgebungsvariablen:
 *   CONTACT_RECIPIENT  – Empfängeradresse (vor Livegang bestätigen lassen)
 *   CONTACT_FROM       – Absender, z. B. "Zolarbyte Website <website@zolarbyte.de>"
 *   RESEND_API_KEY     – API-Schlüssel
 * Ist etwas davon nicht gesetzt, gilt der Versand als nicht eingerichtet.
 */
export function getMailConfig() {
  const recipient = process.env.CONTACT_RECIPIENT?.trim();
  const from = process.env.CONTACT_FROM?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return {
    configured: Boolean(recipient && from && apiKey),
    recipient,
    from,
    apiKey,
  };
}

export type Inquiry = {
  interest: string;
  building: string;
  location: string;
  stage: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  calc: string;
};

export async function sendInquiry(inquiry: Inquiry) {
  const cfg = getMailConfig();
  if (!cfg.configured) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const interest = interestLabel(inquiry.interest);
  const text = [
    `Neue Projektanfrage über zolarbyte.de`,
    ``,
    `Interesse: ${interest}`,
    `Gebäude: ${inquiry.building || "–"}`,
    `Standort: ${inquiry.location || "–"}`,
    `Projektstand: ${inquiry.stage || "–"}`,
    ``,
    `Name: ${inquiry.name}`,
    `E-Mail: ${inquiry.email}`,
    `Telefon: ${inquiry.phone || "–"}`,
    ``,
    `Nachricht:`,
    inquiry.message || "–",
    ...(inquiry.calc ? [``, `--- Vom Absender freigegebene Angaben aus dem Förderrechner ---`, inquiry.calc] : []),
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [cfg.recipient],
        reply_to: inquiry.email,
        subject: `Anfrage ${interest} – ${inquiry.name}`,
        text,
      }),
    });
    if (!res.ok) return { ok: false as const, reason: "send_failed" as const };
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: "send_failed" as const };
  }
}
