import type { Metadata } from "next";
import Link from "next/link";
import { FoerderRechner } from "@/components/foerderrechner/FoerderRechner";
import { PV_INFO, PV_STAND } from "@/lib/foerderung/pv-info";
import { STAND } from "@/lib/foerderung/regeln-458";

export const metadata: Metadata = {
  title: "Förderrechner Wärmepumpe (KfW 458)",
  description:
    "Voraussichtlichen Zuschuss der KfW-Heizungsförderung (Programm 458) für Ihre Wärmepumpe berechnen – unverbindlich, lokal im Browser, mit Quellen. Dazu Hinweise zu Photovoltaik und Speicher.",
  alternates: { canonical: "/foerderrechner" },
};

export default function FoerderrechnerPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Förderrechner · Regelstand {STAND}</p>
          <h1>Wie viel Zuschuss gibt es für Ihre Wärmepumpe?</h1>
          <p>
            Fünf kurze Schritte zur KfW-Heizungsförderung 458. Die Berechnung läuft nur in Ihrem Browser, ohne Anmeldung
            und ohne Pflichtformular. Das Ergebnis ist eine unverbindliche Orientierung, keine Förderzusage.
          </p>
        </div>
      </section>

      <section className="section page-body" aria-label="Förderrechner">
        <div className="container">
          <FoerderRechner />
        </div>
      </section>

      <section id="pv-speicher" className="section" aria-labelledby="pv-title" style={{ background: "var(--black)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Photovoltaik und Speicher</p>
              <h2 id="pv-title" className="h2">
                Was es für PV und Speicher gibt – und was nicht.
              </h2>
            </div>
            <p className="section-head__text">
              Einen allgemeinen bundesweiten Zuschuss für private Photovoltaik-Anlagen oder Stromspeicher gibt es derzeit
              nicht. In der Heizungsförderung sind PV, Speicher und Wechselrichter ausdrücklich nicht förderfähig. Stand
              der Prüfung: {PV_STAND}.
            </p>
          </div>
          <div className="info-grid">
            {PV_INFO.map((c) => (
              <article key={c.title} className="info-card">
                <h3>{c.title}</h3>
                {c.text.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                <p className="src">
                  Quelle:{" "}
                  {c.sources.map((s, i) => (
                    <span key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                      {i < c.sources.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </p>
              </article>
            ))}
          </div>
          <div className="hero__actions" style={{ marginTop: "2.5rem" }}>
            <Link href="/kontakt?interesse=photovoltaik#anfrage" className="btn btn--primary">
              Photovoltaik anfragen
            </Link>
            <Link href="/photovoltaik" className="btn btn--ghost">
              Mehr zur Photovoltaik
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
