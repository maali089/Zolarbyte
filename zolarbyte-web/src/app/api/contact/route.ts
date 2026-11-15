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
  });

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 503 : 502;
    return Response.json({ ok: false, error: result.reason }, { status });
  }

  return Response.json({ ok: true });
}
