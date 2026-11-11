import type { Metadata } from "next";
import Link from "next/link";
import { ContactPerson } from "@/components/ContactPerson";
import { steps } from "@/lib/content";
import { features, isPreview, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meisterbetrieb",
  description:
    "ZOLARBYTE ENERGY ist Elektrotechnik-Meisterbetrieb in Karlsfeld bei München, eingetragen bei der Handwerkskammer für München und Oberbayern.",
  alternates: { canonical: "/meisterbetrieb" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function MeisterbetriebPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="badge-meister">Elektrotechnik-Meisterbetrieb</span>
          <h1 style={{ marginTop: "1.5rem" }}>Energietechnik mit elektrotechnischer Verantwortung.</h1>
          <p>
            ZOLARBYTE ENERGY ist als Elektrotechnik-Meisterbetrieb in die Handwerksrolle der {site.chamber.name} eingetragen
            (Betriebsnummer {site.chamber.registration}). Sitz ist {site.address.street} in {site.address.zip}{" "}
            {site.address.city} bei München. {site.management.role} ist {site.management.name}.
          </p>
        </div>
      </section>

      <section className="section page-body" aria-labelledby="rollen-title">
        <div className="container">
          <h2 id="rollen-title" className="h2" style={{ marginBottom: "2rem" }}>
            Wer berät, wer plant, wer schließt an?
          </h2>
          <ul className="roles">
            <li>
              <h3>Beratung & Angebot</h3>
              <p>
                {site.sales.name}, {site.sales.role}, ist Ihr persönlicher Ansprechpartner für neue Projekte – vom ersten
                Gespräch bis zum Angebot.
              </p>
            </li>
            <li>
              <h3>Planung & elektrischer Anschluss</h3>
              <p>
                Auslegung, Anschluss an Zählerschrank und Hausinstallation sowie Absicherung liegen in der Verantwortung des
                Meisterbetriebs – nach den geltenden VDE-Bestimmungen.
              </p>
            </li>
            <li>
              <h3>Inbetriebnahme & Dokumentation</h3>
              <p>Wir nehmen die Anlage in Betrieb, prüfen sie und übergeben sie mit Dokumentation und Einweisung.</p>
            </li>
          </ul>

          {isPreview ? (
            <div className="notice" role="note" style={{ marginTop: "2rem" }}>
              <span>
                <strong>Vorschau – fehlt noch:</strong> Name der Meisterin bzw. des Meisters, echte Team- und
                Montagefotos, Projektbeispiele und bestätigte Partner. Bewusst wurden keine Fotos, Siegel oder Zahlen
                ergänzt, die nicht belegt sind.
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section people" aria-labelledby="kontakt-title">
        <div className="container people__grid">
          <div>
            <p className="eyebrow">Ansprechpartner</p>
            <h2 id="kontakt-title" className="h2">
              Persönlich erreichbar.
            </h2>
            <p className="lead people__lead">
              Für neue Projekte sprechen Sie direkt mit unserem Vertriebsleiter. Allgemeine Anfragen und Störungen
              erreichen uns über den zentralen Kontakt.
            </p>
            <div className="general-contact">
              <h3 className="general-contact__title">Allgemeiner Kontakt</h3>
              <p>
                <a href={site.general.phoneHref}>{site.general.phone}</a>
                <br />
                <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
              </p>
            </div>
          </div>
          <ContactPerson />
        </div>
      </section>

      <section className="section process" aria-labelledby="ablauf-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Ablauf</p>
              <h2 id="ablauf-title" className="h2">
                So arbeiten wir.
              </h2>
            </div>
          </div>
          <ol className="process__steps">
            {steps.map((step, i) => (
              <li key={step.title} className="process__step">
                <span className="process__node" aria-hidden="true" />
                <span className="process__index" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h3 className="process__title">{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="hero__actions" style={{ marginTop: "3rem" }}>
            <Link href="/kontakt#anfrage" className="btn btn--primary">
              Projekt anfragen
            </Link>
            {features.calculator ? (
              <Link href="/foerderrechner" className="btn btn--ghost">
                Förderung berechnen
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
