import Link from "next/link";
import { Words } from "@/components/fx/Words";
import { BaseFacts, ClosingInquiry, JsonLd } from "@/components/sections/Blocks";
import { FoerderTeaser } from "@/components/sections/FoerderTeaser";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { DayStage } from "@/components/sections/DayStage";
import { ServiceIndex } from "@/components/sections/ServiceIndex";
import { HouseSlot } from "@/components/sections/Slots";
import { services } from "@/lib/content";
import { businessLd } from "@/lib/schema";

export default function Home() {
  return (
    <>
      <JsonLd data={businessLd} />

      {/* Einstieg + Ein Tag am Haus */}
      <DayStage house={<HouseSlot />} />

      {/* Leistungen (Übersicht → Leistungsseiten) */}
      <section id="leistungen" className="section services" aria-labelledby="leistungen-title" data-ground="day">
        <div className="container">
          <header className="sec-head sec-head--split">
            <h2 id="leistungen-title" className="h2">
              <Words text={"Ein Betrieb für\nden ganzen Stromkreis."} accent={["Stromkreis"]} />
            </h2>
            <p className="lead" data-reveal>
              Vom Modul auf dem Dach bis zum Prüfprotokoll: ein Ansprechpartner, der die ganze Anlage im Blick hat.
            </p>
          </header>
          <ServiceIndex services={services} />
          <p className="sec-more" data-reveal>
            <Link href="/leistungen" className="btn btn--ghost">
              Alle Leistungen im Detail
              <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      <FoerderTeaser />

      {/* Betrieb (Teaser) */}
      <section id="betrieb" className="section base" aria-labelledby="betrieb-title" data-ground="day">
        <div className="container base__grid">
          <div className="base__copy">
            <h2 id="betrieb-title" className="h2">
              <Words text={"Fundament\nvor Fassade."} accent={["Fassade"]} />
            </h2>
            <p className="lead" data-reveal>
              Ein Modul ist schnell aufs Dach gebracht. Das Fundament bleibt eine sauber geplante und ausgeführte
              Elektroinstallation – und die ist unser Handwerk.
            </p>
            <p className="sec-more" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
              <Link href="/betrieb" className="btn btn--ghost">
                Betrieb &amp; Ablauf kennenlernen
                <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 10h11M11 5l5 5-5 5" />
                </svg>
              </Link>
            </p>
          </div>
          <BaseFacts />
        </div>
      </section>

      <PartnerBand />

      <ClosingInquiry />
    </>
  );
}
