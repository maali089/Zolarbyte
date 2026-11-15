import "server-only";

/**
 * Formularversand über die Resend-API (https://resend.com) – ohne SDK, ohne Datenbank.
 * Die Anfrage wird nicht gespeichert, sondern nur als E-Mail zugestellt.
 *
 * Benötigte Umgebungsvariablen (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY     – API-Schlüssel mit Berechtigung „Sending access“ (nur für die verifizierte Domain)
 *   CONTACT_FROM       – Absender auf der bei Resend verifizierten Domain, z. B. "Zolarbyte Website <website@zolarbyte.de>"
 *   CONTACT_RECIPIENT  – Empfängerpostfach (vor Livegang bestätigen lassen); mehrere Adressen mit Komma trennen
 * Ist etwas davon nicht gesetzt, gilt der Versand als nicht eingerichtet (API antwortet 503, Formular zeigt Hinweis).
 */
export function getMailConfig() {
  const recipients = (process.env.CONTACT_RECIPIENT ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const from = process.env.CONTACT_FROM?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return {
    configured: Boolean(recipients.length && from && apiKey),
    recipients,
    from,
    apiKey,
  };
}

export type Inquiry = {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
  objekt?: string;
  zeitraum?: string;
  ort?: string;
  extra?: string;
};

/** Einzeilige Felder: Zeilenumbrüche entfernen (kein Einschleusen von Zeilen in Betreff/Text). */
const one = (v?: string) => (v ? v.replace(/[\r\n]+/g, " ").trim() : "");

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function rows(inquiry: Inquiry): Array<[string, string]> {
  return [
    ["Leistung", one(inquiry.service)],
    ["Gebäude", one(inquiry.objekt)],
    ["Zusatzangabe", one(inquiry.extra)],
    ["Zeitraum", one(inquiry.zeitraum)],
    ["PLZ / Ort", one(inquiry.ort)],
    ["Name", one(inquiry.name)],
    ["E-Mail", one(inquiry.email)],
    ["Telefon (Rückruf)", one(inquiry.phone)],
  ];
}

export function renderInquiryText(inquiry: Inquiry) {
  return [
    "Neue Anfrage über die Website",
    "",
    ...rows(inquiry).map(([k, v]) => `${k}: ${v || "–"}`),
    "",
    "NACHRICHT",
    inquiry.message?.trim() || "(keine Nachricht)",
    "",
    "Antworten Sie direkt auf diese E-Mail, um der anfragenden Person zu schreiben.",
  ].join("\n");
}

export function renderInquiryHtml(inquiry: Inquiry) {
  const tr = rows(inquiry)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#63676f;font:13px/1.4 Arial,sans-serif;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;color:#15171c;font:15px/1.4 Arial,sans-serif">${esc(v)}</td></tr>`,
    )
    .join("");
  const msg = inquiry.message?.trim()
    ? `<p style="margin:24px 0 6px;color:#63676f;font:13px/1.4 Arial,sans-serif">Nachricht</p><p style="margin:0;color:#15171c;font:15px/1.55 Arial,sans-serif;white-space:pre-wrap">${esc(inquiry.message.trim())}</p>`
    : "";
  return `<!doctype html><html lang="de"><body style="margin:0;padding:24px;background:#f1f2ee">
<div style="max-width:560px;margin:0 auto;padding:28px;background:#ffffff;border-radius:12px">
<p style="margin:0 0 6px;color:#a3126b;font:bold 12px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Website-Anfrage</p>
<p style="margin:0 0 18px;color:#15171c;font:bold 20px/1.3 Arial,sans-serif">Neue Anfrage: ${esc(one(inquiry.service))}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${tr}</table>
${msg}
<p style="margin:28px 0 0;color:#63676f;font:12px/1.5 Arial,sans-serif">Antworten Sie direkt auf diese E-Mail, um der anfragenden Person zu schreiben.</p>
</div></body></html>`;
}

export async function sendInquiry(inquiry: Inquiry, opts: { idempotencyKey?: string } = {}) {
  const cfg = getMailConfig();
  if (!cfg.configured) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: cfg.from,
        to: cfg.recipients,
        reply_to: one(inquiry.email),
        subject: `Anfrage: ${one(inquiry.service)} – ${one(inquiry.name)}`,
        text: renderInquiryText(inquiry),
        html: renderInquiryHtml(inquiry),
        tags: [{ name: "source", value: "website-anfrage" }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Nur Status und Fehlertyp loggen – keine personenbezogenen Daten
      const detail = (await res.json().catch(() => null)) as { name?: string } | null;
      console.error(`[contact] Resend-Fehler ${res.status}${detail?.name ? ` (${detail.name})` : ""}`);
      return { ok: false as const, reason: "send_failed" as const };
    }
    return { ok: true as const };
  } catch (e) {
    console.error(`[contact] Resend nicht erreichbar: ${e instanceof Error ? e.name : "unbekannt"}`);
    return { ok: false as const, reason: "send_failed" as const };
  }
}
