import { faqs, services, steps } from "@/lib/content";
import { fullAddress, site } from "@/lib/site";

/** llms.txt: Kurzprofil für KI-Systeme, ausschließlich aus site.ts und content.ts. */
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Betrieb",
    "",
    `- Firma: ${site.legalName}`,
    `- Eingetragen bei: ${site.chamber.name} (Reg.-Nr. ${site.chamber.registration})`,
    `- Adresse: ${fullAddress}`,
    `- Telefon: ${site.general.phone}`,
    `- E-Mail: ${site.general.email}`,
    `- Neue Projekte und Angebote: ${site.sales.name}, ${site.sales.role}, ${site.sales.phone}, ${site.sales.email}`,
    "",
    "## Leistungen",
    "",
    ...services.map((s) => `- [${s.title}](${site.url}/leistungen/${s.id}): ${s.lead}`),
    "",
    "## Ablauf",
    "",
    ...steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`),
    "",
    "## Seiten",
    "",
    `- [Startseite](${site.url}/): Überblick, ein Tag am Haus, Leistungen`,
    `- [Leistungen](${site.url}/leistungen): alle Leistungen mit eigenen Seiten`,
    `- [Betrieb](${site.url}/betrieb): Meisterbetrieb, Ablauf, Ansprechpartner`,
    `- [Häufige Fragen](${site.url}/fragen)`,
    `- [Anfrage & Kontakt](${site.url}/kontakt): Anfrage-Assistent, Telefon, E-Mail, Adresse`,
    `- [Impressum](${site.url}/impressum)`,
    `- [Datenschutz](${site.url}/datenschutz)`,
    "",
    "## Häufige Fragen",
    "",
    ...faqs.map((f) => `- ${f.q} ${f.a}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
