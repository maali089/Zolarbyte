import type { Metadata } from "next";
import Link from "next/link";
import { electricalServices } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elektrotechnik",
  description:
    "Elektroinstallation, Kundendienst, elektrische Prüfungen, Beratung zur E-Mobilität und Schulungen – vom Elektrotechnik-Meisterbetrieb ZOLARBYTE ENERGY in Karlsfeld.",
  alternates: { canonical: "/elektrotechnik" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function ElektrotechnikPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Ergänzende Leistungen</p>
          <h1>Elektrotechnik vom Meisterbetrieb</h1>
          <p>
            Unser handwerkliches Fundament: Elektroinstallation, Störungsbehebung und Prüfungen. Dieselbe Sorgfalt steckt
            in jeder Photovoltaik-, Speicher- und Wärmepumpen-Anlage, die wir anschließen.
          </p>
        </div>
      </section>

      <section className="section services" aria-label="Leistungen Elektrotechnik">
        <div className="container">
          <ol className="service-list">
            {electricalServices.map((s, i) => (
              <li key={s.id} id={s.id} className="service">
                <span className="service__index" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h2 className="service__title">{s.title}</h2>
                <div className="service__body">
                  <p className="service__text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="hero__actions">
            <Link href="/kontakt?interesse=elektrotechnik#anfrage" className="btn btn--primary">
              Anfrage senden
            </Link>
            <a href={site.general.phoneHref} className="btn btn--ghost">
              {site.general.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
