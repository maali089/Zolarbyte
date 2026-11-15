import type { Metadata } from "next";
import { ClosingInquiry, JsonLd, PageHead } from "@/components/sections/Blocks";
import { ServiceIndex } from "@/components/sections/ServiceIndex";
import { services } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leistungen: Photovoltaik, Wallbox, Elektro",
  description:
    "Photovoltaik, E-Mobilität, Elektroinstallation, Kundendienst, E-Check und Schulungen – alle Leistungen des Elektrotechnik-Meisterbetriebs Zolarbyte in Karlsfeld bei München.",
  alternates: { canonical: "/leistungen" },
};

export default function LeistungenPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Start", item: site.url },
            { "@type": "ListItem", position: 2, name: "Leistungen", item: `${site.url}/leistungen` },
          ],
        }}
      />
      <PageHead
        title={"Ein Betrieb für\nden ganzen Stromkreis."}
        lead="Sechs Leistungen, ein Ansprechpartner. Photovoltaik ist ein Teil davon – das Fundament bleibt eine sauber geplante und ausgeführte Elektroinstallation."
        crumbs={[{ href: "/leistungen", label: "Leistungen" }]}
      />
      <section className="section services services--page" aria-label="Alle Leistungen" data-ground="day">
        <div className="container">
          <ServiceIndex services={services} headingLevel={2} />
        </div>
      </section>
      <ClosingInquiry />
    </>
  );
}
