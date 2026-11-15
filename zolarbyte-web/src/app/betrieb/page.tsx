import type { Metadata } from "next";
import { Words } from "@/components/fx/Words";
import { BaseFacts, ClosingInquiry, JsonLd, PageHead, People } from "@/components/sections/Blocks";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { ProcessArc } from "@/components/sections/ProcessArc";
import { businessLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Elektro-Meisterbetrieb in Karlsfeld",
  description:
    "Zolarbyte ist Elektrotechnik-Meisterbetrieb in Karlsfeld bei München, eingetragen bei der Handwerkskammer für München und Oberbayern. Arbeitsweise, Ablauf und Ansprechpartner.",
  alternates: { canonical: "/betrieb" },
};

export default function BetriebPage() {
  return (
    <>
      <JsonLd data={businessLd} />
      <PageHead
        title={"Fundament\nvor Fassade."}
        lead="Ein Modul ist schnell aufs Dach gebracht. Das Fundament bleibt eine sauber geplante und ausgeführte Elektroinstallation – und die ist unser Handwerk."
        crumbs={[{ href: "/betrieb", label: "Betrieb" }]}
      />

      <section className="section base" aria-labelledby="betrieb-title" data-ground="day">
        <div className="container base__grid">
          <div className="base__copy">
            <h2 id="betrieb-title" className="h2">
              <Words text={"Ein Meisterbetrieb\naus Karlsfeld."} accent={["Karlsfeld"]} />
            </h2>
            <p className="lead" data-reveal>
              Wir installieren, prüfen und warten elektrische Anlagen, beheben Störungen und binden Photovoltaik
              fachgerecht in bestehende Installationen ein – mit persönlicher Beratung vor Ort.
            </p>
          </div>
          <BaseFacts />
        </div>
      </section>

      <section id="ablauf" className="section process" aria-labelledby="ablauf-title" data-ground="day">
        <div className="container">
          <header className="sec-head sec-head--split">
            <h2 id="ablauf-title" className="h2">
              <Words text={"Vier Schritte\nbis zur Übergabe."} />
            </h2>
            <p className="lead" data-reveal>
              Klare Abstimmung von der ersten Nachricht bis zur fertigen, geprüften Anlage.
            </p>
          </header>
          <ProcessArc />
        </div>
      </section>

      <section id="ansprechpartner" className="section people" aria-labelledby="people-title" data-ground="day">
        <div className="container">
          <People />
        </div>
      </section>

      <PartnerBand />

      <ClosingInquiry />
    </>
  );
}
