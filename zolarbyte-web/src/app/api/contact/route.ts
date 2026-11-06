import { sendInquiry } from "@/lib/mail";
import { validateInquiry, type InquiryInput } from "@/lib/validation";

function str(v: unknown, max = 5000) {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot: von Bots ausgefüllt, für Menschen unsichtbar
  if (str(body.website)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const input: InquiryInput = {
    name: str(body.name, 200),
    email: str(body.email, 200),
    phone: str(body.phone, 50),
    service: str(body.service, 200),
    message: str(body.message, 6000),
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
  });

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 503 : 502;
    return Response.json({ ok: false, error: result.reason }, { status });
  }

  return Response.json({ ok: true });
}
