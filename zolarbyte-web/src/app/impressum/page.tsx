import type { Metadata } from "next";
import { isPreview, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der Zolarbyte Elektrotechnik Meisterbetrieb, Karlsfeld.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Impressum</h1>
        </div>
      </section>
      <section className="section">
        <div className="container prose">
          {isPreview ? (
            <div className="notice" role="note">
              <span>
                <strong>Entwurf – vor Veröffentlichung prüfen lassen.</strong> Die Angaben stammen aus dem bisherigen
                Impressum und sind nicht rechtlich geprüft. Offen sind insbesondere: Rechtsform und vertretungsberechtigte
                Person, gesetzliche Berufsbezeichnung mit verleihendem Staat, ggf. Umsatzsteuer-Identifikationsnummer,
                Handelsregistereintrag sowie die Aussage zur Verbraucherschlichtung.
              </span>
            </div>
          ) : null}

          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            {site.legalName}
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </p>
          <p>
            Vertreten durch: {site.management.name}
          </p>

          <h2>Kontakt</h2>
          <p>
            Telefon: <a href={site.general.phoneHref}>{site.general.phone}</a>
            <br />
            E-Mail: <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
          </p>

          <h2>Handwerksrolle und Aufsichtsbehörde</h2>
          <p>
            Eingetragen in die Handwerksrolle der {site.chamber.name}, Betriebsnummer {site.chamber.registration}.
          </p>
          <p>
            Zuständige Kammer:
            <br />
            {site.chamber.name}
            <br />
            {site.chamber.street}
            <br />
            {site.chamber.city}
            <br />
            <a href="https://www.hwk-muenchen.de" rel="noopener">
              www.hwk-muenchen.de
            </a>
          </p>
          <p>
            Berufsrechtliche Regelungen: Gesetz zur Ordnung des Handwerks (Handwerksordnung), einsehbar unter{" "}
            <a href="https://www.gesetze-im-internet.de/hwo/" rel="noopener">
              www.gesetze-im-internet.de/hwo
            </a>
            .
          </p>

          <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>
            {site.management.name}
            <br />
            {site.address.street}, {site.address.zip} {site.address.city}
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für
            die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei
            Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.
          </p>
        </div>
      </section>
    </>
  );
}
