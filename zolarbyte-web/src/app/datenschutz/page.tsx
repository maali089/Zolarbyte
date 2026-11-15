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
      <section className="section">
        <div className="container prose">
          {isPreview ? (
            <div className="notice" role="note">
              <div>
                <strong>Entwurf – vor Veröffentlichung rechtlich prüfen lassen.</strong> Der Text beschreibt den
                technischen Stand der neuen Website (keine Cookies, keine Analyse- oder Marketingdienste, lokal
                eingebundene Schriften, Anfrage-Assistent mit Versand über Resend). Vor dem Livegang sind diese Angaben
                offen:
                <ul>
                  <li>Hosting-Anbieter, Serverstandort und Auftragsverarbeitungsvertrag (Abschnitt 3) sowie Speicherdauer der Server-Logfiles.</li>
                  <li>
                    Resend: genaue Firmierung und Anschrift, Datenverarbeitungsregion, Auftragsverarbeitungsvertrag und
                    Grundlage der USA-Übermittlung (EU-US Data Privacy Framework oder Standardvertragsklauseln),
                    Abschnitt 5.
                  </li>
                  <li>E-Mail-Anbieter des Empfängerpostfachs für Anfragen (Abschnitt 5).</li>
                  <li>Konkrete Löschfrist für Anfragen (Abschnitt 4) – Vorschlag des Betriebs nötig.</li>
                  <li>Ob ein Datenschutzbeauftragter zu benennen ist (Abschnitt 1).</li>
                  <li>Nach dem Deploy erneut prüfen: Cookies, Requests an Dritte und Header der Live-Seite.</li>
                </ul>
              </div>
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
            Löschung und Einschränkung der Verarbeitung sowie auf Datenübertragbarkeit (Art. 15–20 DSGVO). Sie können
            einer Verarbeitung, die wir auf berechtigte Interessen stützen, aus Gründen, die sich aus Ihrer besonderen
            Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO). Wenden Sie sich dazu an die oben genannte
            Adresse.
          </p>
          <p>
            Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).
            Für uns als nicht-öffentliche Stelle in Bayern ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA),
            Promenade 18, 91522 Ansbach, zuständig.
          </p>

          <h2>3. Hosting und Server-Logfiles</h2>
          <p>
            Diese Website wird bei einem externen Dienstleister betrieben. Beim Aufruf der Seiten verarbeitet dieser
            technisch notwendige Daten, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit des Zugriffs,
            aufgerufene Seite, Referrer-URL, Browsertyp und Betriebssystem. Diese Daten dienen dem sicheren und
            stabilen Betrieb der Website und der Abwehr von Missbrauch. Sie werden nicht mit anderen Datenquellen
            zusammengeführt und nur so lange gespeichert, wie es für diese Zwecke erforderlich ist. Rechtsgrundlage ist
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb der Website).
          </p>

          <h2>4. Anfrage-Assistent, Kontaktformular und Anfragen per E-Mail oder Telefon</h2>
          <p>
            Über den Anfrage-Assistenten können Sie uns in drei Schritten eine Anfrage senden. Wir verarbeiten dabei die
            Angaben, die Sie eingeben: Anliegen, optional Objektart, Zeitraum, PLZ oder Ort und Zusatzangaben, Ihren
            Namen und Ihre E-Mail-Adresse sowie optional Ihre Telefonnummer und eine Nachricht. Pflichtangaben sind im
            Formular gekennzeichnet. Ohne diese Angaben können wir Ihre Anfrage nicht bearbeiten; gesetzlich
            vorgeschrieben ist die Angabe nicht.
          </p>
          <p>
            Zweck ist die Bearbeitung Ihrer Anfrage und die Antwort per E-Mail oder Telefon. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertrag oder vorvertragliche Maßnahmen abzielt,
            andernfalls unser berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
            Dasselbe gilt, wenn Sie uns direkt per E-Mail oder telefonisch kontaktieren.
          </p>
          <p>
            Die Website speichert Anfragen nicht in einer eigenen Datenbank. Die Angaben werden per E-Mail an uns
            übermittelt (siehe Abschnitt 5) und von uns weiterbearbeitet. Wir löschen Ihre Anfrage, sobald sie
            abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen, etwa wenn aus der
            Anfrage ein Auftrag wird.
          </p>
          <p>
            Zum Schutz vor automatisierten Absendungen enthält das Formular ein für Menschen unsichtbares Feld und
            prüft, wie lange das Ausfüllen gedauert hat. Dazu wird beim Öffnen des Assistenten ein Zeitpunkt vermerkt und
            mit der Anfrage übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Schutz der Website vor
            Missbrauch). Es kommt kein externer Spam-Schutzdienst zum Einsatz.
          </p>

          <h2>5. E-Mail-Versand über Resend</h2>
          <p>
            Anfragen aus dem Anfrage-Assistenten werden über den E-Mail-Versanddienst Resend an unser Postfach
            zugestellt. Resend verarbeitet dabei als unser Auftragsverarbeiter den Inhalt Ihrer Anfrage (Name,
            E-Mail-Adresse, Telefonnummer, Anliegen und Nachricht) sowie technische Versanddaten. Der Anbieter hat seinen
            Sitz in den USA. Eine Übermittlung personenbezogener Daten in ein Land außerhalb der EU ist deshalb möglich.
            Sie stützt sich auf einen Angemessenheitsbeschluss der EU-Kommission (EU-US Data Privacy Framework, Art. 45
            DSGVO) oder auf Standardvertragsklauseln (Art. 46 DSGVO). Rechtsgrundlage für den Einsatz des Dienstes ist
            Art. 6 Abs. 1 lit. b und f DSGVO, denn ohne ihn könnten wir Ihre Anfrage nicht entgegennehmen.
          </p>

          <h2>6. Zwischenspeicherung im Browser (Session Storage)</h2>
          <p>
            Der Anfrage-Assistent legt in Ihrem Browser einen Eintrag im Sitzungsspeicher (sessionStorage, Schlüssel
            „zb-inquiry-v2“) an. Er enthält den aktuellen Schritt, Ihre bisherigen Eingaben und den Zeitpunkt, zu dem
            der Assistent geöffnet wurde. So gehen Ihre Eingaben nicht verloren, wenn Sie die Seite neu laden oder
            zwischen unseren Seiten wechseln. Der Eintrag bleibt auf Ihrem Gerät und wird erst übermittelt, wenn Sie die
            Anfrage selbst absenden. Er wird nach erfolgreichem Absenden gelöscht und spätestens beim Schließen des
            Browser-Tabs entfernt. Sie können ihn jederzeit über die Entwicklerwerkzeuge Ihres Browsers löschen.
          </p>
          <p>
            Der Förder-Check verarbeitet Ihre Auswahl ausschließlich in Ihrem Browser und speichert nichts. Nur wenn Sie
            „Förderung im Angebot berücksichtigen“ wählen, wird Ihre Auswahl einmalig im Sitzungsspeicher (Schlüssel
            „zb-calculator-handoff“) an den Anfrage-Assistenten übergeben und dort sofort wieder gelöscht.
          </p>
          <p>
            Die Speicherung ist erforderlich, damit wir den von Ihnen gewünschten Anfrage-Assistenten bereitstellen
            können (§ 25 Abs. 2 Nr. 2 TDDDG); eine Einwilligung ist dafür nicht nötig. Die Verarbeitung Ihrer Eingaben
            erfolgt zur Durchführung Ihrer Anfrage nach Art. 6 Abs. 1 lit. b und f DSGVO.
          </p>

          <h2>7. Schriftarten</h2>
          <p>
            Die auf dieser Website verwendeten Schriftarten werden lokal von unserem Server ausgeliefert. Beim Aufruf der
            Seiten wird dabei keine Verbindung zu Servern Dritter (etwa Google) hergestellt.
          </p>

          <h2>8. Darstellung und Animationen</h2>
          <p>
            Animationen, weiches Scrollen, die Hausdarstellung und der Hintergrund werden direkt in Ihrem Browser
            berechnet. Dafür werden keine Daten an Dritte übertragen und keine externen Inhalte nachgeladen.
          </p>

          <h2>9. Cookies und Analyse</h2>
          <p>
            Diese Website setzt keine Cookies und verwendet keine Analyse-, Tracking- oder Marketingdienste. Eine
            Einwilligungsabfrage (Cookie-Banner) ist deshalb nicht erforderlich.
          </p>

          <h2>10. Links zu anderen Websites</h2>
          <p>
            Wenn Sie einem Link zu einer anderen Website folgen, etwa zur Handwerkskammer, gilt dort die
            Datenschutzerklärung des jeweiligen Betreibers. Erst mit dem Klick wird Ihre IP-Adresse an diesen Betreiber
            übermittelt.
          </p>

          <h2>11. Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung
            erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.
          </p>
        </div>
      </section>
    </>
  );
}
