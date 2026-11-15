import { createHash } from "node:crypto";
import { sendInquiry } from "@/lib/mail";
import { validateInquiry, type InquiryInput } from "@/lib/validation";

/** Maximale Größe des Request-Bodys in Bytes */
const MAX_BODY_BYTES = 16_000;
/** Mindest-Ausfüllzeit in Millisekunden (Schutz gegen automatisierte Absendungen) */
const MIN_FILL_MS = 3000;

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.slice(0, max) : "";
}

const invalid = (status = 400) => Response.json({ ok: false, error: "invalid" }, { status });

/**
 * Einfache Drosselung pro IP (im Speicher der Funktionsinstanz, daher nur „best effort“):
 * höchstens RATE_MAX Anfragen je RATE_WINDOW_MS. Für harte Limits: Vercel Firewall / WAF-Regel auf /api/contact.
 */
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return invalid(415);
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return invalid(413);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return invalid(413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return invalid();
    body = parsed as Record<string, unknown>;
  } catch {
    return invalid();
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": "600" } });
  }

  // Honeypot: von Bots ausgefüllt, für Menschen unsichtbar
  if (str(body.website, 10)) return invalid();

  // Mindest-Ausfüllzeit: `t` = Zeitstempel (ms) beim Start des Assistenten
  const t = typeof body.t === "number" && Number.isFinite(body.t) ? body.t : NaN;
  if (Number.isNaN(t) || Date.now() - t < MIN_FILL_MS) return invalid();

  const input: InquiryInput = {
    name: str(body.name, 201),
    email: str(body.email, 201),
    phone: str(body.phone, 50),
    service: str(body.service, 200),
    message: str(body.message, 5001),
    topic: str(body.topic, 40),
    objekt: str(body.objekt, 60),
    zeitraum: str(body.zeitraum, 60),
    ort: str(body.ort, 81),
    extra: str(body.extra, 60),
  };

  const errors = validateInquiry(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: "validation", errors }, { status: 422 });
  }

  // Doppeltes Absenden derselben Anfrage (Doppelklick, Wiederholung) erzeugt bei Resend nur eine Mail
  const idempotencyKey = `anfrage-${createHash("sha256").update(`${t}|${input.email.trim().toLowerCase()}|${input.message.length}`).digest("hex").slice(0, 32)}`;

  const result = await sendInquiry({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    service: input.service,
    message: input.message.trim(),
    objekt: input.objekt,
    zeitraum: input.zeitraum,
    ort: input.ort?.trim(),
    extra: input.extra,
  }, { idempotencyKey });

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 503 : 502;
    return Response.json({ ok: false, error: result.reason }, { status });
  }

  return Response.json({ ok: true });
}
