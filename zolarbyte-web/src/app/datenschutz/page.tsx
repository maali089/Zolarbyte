import type { Metadata } from "next";
import { isPreview, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Website von Zolarbyte.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Datenschutzerklärung</h1>
        </div>
      </section>
      <section className="section page-body">
        <div className="container prose">
          {isPreview ? (
            <div className="notice" role="note">
              <span>
                <strong>Entwurf – vor Veröffentlichung prüfen lassen.</strong> Dieser Text beschreibt die neue Website in
                ihrem aktuellen technischen Stand (keine Analyse- oder Marketingdienste, lokal eingebundene Schriften). Vor
                dem Livegang müssen Hosting-Anbieter und E-Mail-Versanddienst benannt und der Text rechtlich geprüft
                werden.
              </span>
            </div>
          ) : null}

          <h2>1. Verantwortlicher</h2>
          <p>
            {site.legalName}
            <br />
            {site.address.street}, {site.address.zip} {site.address.city}
            <br />
            Telefon: {site.general.phone}
            <br />
            E-Mail: <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
          </p>

          <h2>2. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten, auf Berichtigung,
            Löschung und Einschränkung der Verarbeitung, auf Datenübertragbarkeit sowie das Recht, einer Verarbeitung
            auf Grundlage berechtigter Interessen zu widersprechen (Art. 15–21 DSGVO). Wenden Sie sich dazu an die oben
            genannte Adresse.
          </p>
          <p>
            Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig ist das Bayerische
            Landesamt für Datenschutzaufsicht, Promenade 18, 91522 Ansbach.
          </p>

          <h2>3. Hosting und Server-Logfiles</h2>
          <p>
            Diese Website wird bei einem externen Dienstleister betrieben. Beim Aufruf der Seiten werden technisch
            notwendige Daten verarbeitet, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit des Zugriffs,
            aufgerufene Seite, Referrer-URL, Browsertyp und Betriebssystem. Diese Daten dienen ausschließlich dem
            sicheren und stabilen Betrieb der Website und werden nicht mit anderen Datenquellen zusammengeführt.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>

          <h2>4. Kontaktformular und Anfragen per E-Mail oder Telefon</h2>
          <p>
            Wenn Sie uns über das Kontaktformular, per E-Mail oder telefonisch kontaktieren, verarbeiten wir Ihre Angaben
            (Name, E-Mail-Adresse, optional Telefonnummer, gewünschte Leistung und Ihre Nachricht), um Ihre Anfrage zu
            bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertrag abzielt,
            andernfalls unser berechtigtes Interesse an der Beantwortung (Art. 6 Abs. 1 lit. f DSGVO). Wir löschen die
            Daten, sobald sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>

          <h2>5. Schriftarten</h2>
          <p>
            Die auf dieser Website verwendeten Schriftarten werden lokal von unserem Server ausgeliefert. Es wird dabei
            keine Verbindung zu Servern Dritter (etwa Google) hergestellt.
          </p>

          <h2>6. Cookies und Analyse</h2>
          <p>
            Diese Website setzt keine Cookies zu Analyse- oder Marketingzwecken und verwendet keine Tracking- oder
            Reichweitenmessdienste.
          </p>

          <h2>7. Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung
            erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.
          </p>
        </div>
      </section>
    </>
  );
}
