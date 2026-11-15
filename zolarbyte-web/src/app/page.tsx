import Link from "next/link";
import { HeroHouseScene, EnergyHouseScene } from "@/components/house/Scenes";
import { Chapter } from "@/components/Chapter";
import { GuideTrack } from "@/components/GuideTrack";
import { Reveal } from "@/components/Reveal";
import { ContactPerson } from "@/components/ContactPerson";
import { ContactForm } from "@/components/ContactForm";
import { ContactLinks } from "@/components/ContactLinks";
import { FoerderRechner } from "@/components/foerderrechner/FoerderRechner";
import { PartnerMarquee } from "@/components/Partners";
import { faqs, situations, steps } from "@/lib/content";
import { GRUNDFOERDERUNG, OBERGRENZE, STAND } from "@/lib/foerderung/regeln-458";
import { getMailConfig } from "@/lib/mail";
import { features, isPreview, site } from "@/lib/site";

const business = {
  "@type": "Electrician",
  "@id": `${site.url}/#betrieb`,
  areaServed: "Karlsfeld und Umgebung bei München",
  knowsAbout: ["Photovoltaik", "Wärmepumpe", "Stromspeicher", "Wallbox", "Elektroinstallation"],
  founder: { "@type": "Person", name: site.management.name, jobTitle: site.management.role },
  name: site.legalName,
  url: site.url,
  telephone: site.project.phone,
  email: site.general.email,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.zip,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    business,
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function Home() {
  const { configured } = getMailConfig();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Einstieg: Szene mit Haus, Garage, Wallbox */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner container">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow">ZOLARBYTE ENERGY · Elektrotechnik-Meisterbetrieb</p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__line">Eigener Strom.</span>
              <span className="hero__line">Effiziente Wärme.</span>
              <span className="hero__line">
                <em>Intelligent gespeichert.</em>
              </span>
            </h1>
            <p className="hero__lead">
              PV, Wärmepumpe, Speicher und Wallbox – geplant und angeschlossen vom Meisterbetrieb aus{" "}
              {site.address.city}.
            </p>
            <div className="hero__actions">
              <Link href="/kontakt#anfrage" className="btn btn--primary">
                Anfrage jetzt senden
              </Link>
              <Link href="/foerderrechner" className="btn btn--ghost">
                Förderung berechnen
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <HeroHouseScene />
          </div>
        </div>
        <p className="hero__stamp container">
          <span>Eingetragen in die Handwerksrolle</span> {site.chamber.name}
        </p>
      </section>

      {/* 01 Energiehaus: was wir bauen und wie es zusammenspielt */}
      <section id="zusammenspiel" className="ch ch--house" aria-labelledby="house-title">
        <div className="container">
          <Reveal className="ch-house__head">
            <Chapter no={1}>Energiehaus</Chapter>
            <h2 id="house-title" className="ch__title">
              So arbeitet Ihr Energiehaus.
            </h2>
            <p className="ch-house__lead">Scrollen Sie durchs Haus – die Kamera fährt zu jedem Baustein.</p>
          </Reveal>
          <EnergyHouseScene />
          <p className="ch-house__more">
            Außerdem für Sie da: <Link href="/elektrotechnik">Elektroinstallation, Kundendienst und Prüfungen</Link>
          </p>
        </div>
      </section>

      {/* 02 Wegweiser: horizontale Strecke */}
      <GuideTrack items={situations} />

      {/* 03 Förderung: helle Arbeitsfläche */}
      {features.calculator ? (
        <section id="foerderung" className="ch ch--paper" aria-labelledby="foerderung-title">
          <div className="container">
            <header className="paper__head">
              <div>
                <Chapter no={3}>Förderung</Chapter>
                <h2 id="foerderung-title" className="ch__title">
                  Was zahlt die KfW für Ihre Wärmepumpe?
                </h2>
                <p>
                  Fünf Schritte zur KfW-Heizungsförderung. Gerechnet wird nur in Ihrem Browser.
                </p>
              </div>
              <dl className="paper__facts">
                <div>
                  <dt>Grundförderung</dt>
                  <dd>{GRUNDFOERDERUNG.percent} %</dd>
                </div>
                <div>
                  <dt>Zuschuss insgesamt höchstens</dt>
                  <dd>
                    {OBERGRENZE.percent} %<small> bzw. {OBERGRENZE.lowIncomePercent} % bei geringem Einkommen</small>
                  </dd>
                </div>
                <div>
                  <dt>Regeln geprüft</dt>
                  <dd className="paper__date">{STAND}</dd>
                </div>
              </dl>
            </header>
            <FoerderRechner />
            <p className="paper__more">
              Photovoltaik und Speicher werden nicht über diesen Zuschuss gefördert – was es dort gibt, steht unter{" "}
              <Link href="/foerderrechner#pv-speicher">Förderung für PV und Speicher</Link>.
            </p>
          </div>
        </section>
      ) : null}

      {/* 04 Meisterbetrieb: persönlich, mit Ablauf als Leitungsweg */}
      <section id="betrieb" className="ch ch--meister" aria-labelledby="meister-title">
        <div className="container meister">
          <Reveal className="meister__statement">
            <Chapter no={4}>Meisterbetrieb</Chapter>
            <h2 id="meister-title" className="ch__title ch__title--xl">
              Am Ende hängt alles am <em>Zählerschrank.</em>
            </h2>
            <p className="meister__lead">
              Technik ist nur so gut wie ihr Anschluss. Als eingetragener Elektrotechnik-Meisterbetrieb verantworten wir
              Planung, Anschluss und Inbetriebnahme selbst.
            </p>
          </Reveal>

          <div className="meister__person">
            <p className="meister__who">
              <span>Ihr Ansprechpartner</span>
              {site.management.name}, {site.management.role}
            </p>
            <ContactPerson />
            <Link href="/meisterbetrieb" className="text-link">
              Mehr über den Betrieb
            </Link>
          </div>

          <ol className="route" aria-label="So läuft ein Projekt ab">
            {steps.map((step, i) => (
              <li key={step.title} className="route__step">
                <span className="route__node" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>

          {isPreview && !features.references ? (
            <p className="notice meister__notice" role="note">
              <span>
                <strong>Vorschau:</strong> Hier können später freigegebene Projektfotos und Referenzen stehen.
              </span>
            </p>
          ) : null}
        </div>
      </section>

      {/* Partnerband als Übergang */}
      {features.partners ? (
        <section id="partner" className="partners-band" aria-labelledby="partner-title">
          <div className="container partners-band__inner">
            <h2 id="partner-title" className="partners-band__title">
              Hersteller, mit denen wir arbeiten
            </h2>
            <PartnerMarquee />
          </div>
        </section>
      ) : null}

      {/* 05 Anfrage und Fragen */}
      <section id="anfrage" className="ch ch--ask" aria-labelledby="anfrage-title">
        <div className="container ask">
          <Reveal className="ask__intro">
            <Chapter no={5}>Anfrage</Chapter>
            <h2 id="anfrage-title" className="ch__title">
              Sprechen wir über <em>Ihr Haus.</em>
            </h2>
            <p>Ein paar Angaben genügen. {site.management.name} meldet sich persönlich – oder Sie schreiben direkt.</p>
            <ContactLinks className="contact-links--stack" />
          </Reveal>
          <div className="ask__form">
            <ContactForm mailConfigured={configured} previewNote={isPreview} />
          </div>
          <div className="ask__faq" id="fragen">
            <h3 className="ask__faq-title">Häufige Fragen</h3>
            <div className="faq__list">
              {faqs.map((f) => (
                <details key={f.q} className="faq__item">
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
