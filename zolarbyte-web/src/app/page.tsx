import Link from "next/link";
import { HeroHouseScene, EnergyHouseScene } from "@/components/house/Scenes";
import { Chapter } from "@/components/Chapter";
import { ContactPerson } from "@/components/ContactPerson";
import { ContactForm } from "@/components/ContactForm";
import { ContactLinks } from "@/components/ContactLinks";
import { FoerderRechner } from "@/components/foerderrechner/FoerderRechner";
import { PartnerMarquee } from "@/components/Partners";
import { faqs, situations, steps } from "@/lib/content";
import { GRUNDFOERDERUNG, OBERGRENZE, STAND } from "@/lib/foerderung/regeln-458";
import { getMailConfig } from "@/lib/mail";
import { features, isPreview, site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Electrician",
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
              Photovoltaik, Wärmepumpe, Stromspeicher und Wallbox – geplant und angeschlossen vom
              Elektrotechnik-Meisterbetrieb aus {site.address.city} bei München.
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
          <header className="ch-house__head">
            <Chapter no={1}>Energiehaus</Chapter>
            <h2 id="house-title" className="ch__title">
              Vier Bausteine, ein Zählerschrank.
            </h2>
            <p className="ch-house__lead">
              Wählen Sie einen Baustein: Die Ansicht fährt an die Stelle im Haus, daneben steht, was er tut und was wir
              dafür übernehmen.
            </p>
          </header>
          <EnergyHouseScene />
          <p className="ch-house__more">
            Außerdem für Sie da: <Link href="/elektrotechnik">Elektroinstallation, Kundendienst und Prüfungen</Link>
          </p>
        </div>
      </section>

      {/* 02 Wegweiser: ruhig, typografisch */}
      <section id="wegweiser" className="ch ch--guide" aria-labelledby="guide-title">
        <div className="container guide">
          <header className="guide__head">
            <Chapter no={2}>Wegweiser</Chapter>
            <h2 id="guide-title" className="ch__title">
              Welche Lösung passt zu Ihrem Haus?
            </h2>
            <p>
              Fünf typische Ausgangslagen und womit wir jeweils anfangen würden. Die genaue Planung klären wir vor Ort.
            </p>
          </header>
          <ol className="guide__list">
            {situations.map((s) => (
              <li key={s.situation} className="guide__row">
                <h3 className="guide__case">{s.situation}</h3>
                <p className="guide__advice">{s.advice}</p>
                <Link href={s.action.href} className="guide__go">
                  {s.action.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
                  Fünf kurze Schritte zur Heizungsförderung (KfW 458). Gerechnet wird nur in Ihrem Browser – Angaben zum
                  Einkommen verlassen Ihr Gerät nicht.
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
          <div className="meister__statement">
            <Chapter no={4}>Meisterbetrieb</Chapter>
            <h2 id="meister-title" className="ch__title ch__title--xl">
              Am Ende hängt alles am <em>Zählerschrank.</em>
            </h2>
            <p className="meister__lead">
              Module, Speicher, Wärmepumpe und Wallbox sind nur so gut wie ihr elektrischer Anschluss. ZOLARBYTE ENERGY ist
              als Elektrotechnik-Meisterbetrieb in die Handwerksrolle der {site.chamber.name} eingetragen und verantwortet
              Planung, Anschluss und Inbetriebnahme selbst.
            </p>
          </div>

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
          <div className="ask__intro">
            <Chapter no={5}>Anfrage</Chapter>
            <h2 id="anfrage-title" className="ch__title">
              Sprechen wir über <em>Ihr Haus.</em>
            </h2>
            <p>Ein paar Angaben genügen. {site.management.name} meldet sich persönlich – oder Sie schreiben direkt.</p>
            <ContactLinks className="contact-links--stack" />
          </div>
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
