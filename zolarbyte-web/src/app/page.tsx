import Link from "next/link";
import { HeroHouseScene, ExplorerScene, HouseDetail } from "@/components/house/Scenes";
import { ContactPerson } from "@/components/ContactPerson";
import { ContactForm } from "@/components/ContactForm";
import { FoerderRechner } from "@/components/foerderrechner/FoerderRechner";
import { ServiceIcon } from "@/components/ServiceIcon";
import { energyServices, faqs, steps } from "@/lib/content";
import { getMailConfig } from "@/lib/mail";
import { features, isPreview, site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Electrician",
  name: site.legalName,
  url: site.url,
  telephone: site.general.phone,
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

const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const { configured } = getMailConfig();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ---------- 1 Einstieg ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner container">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow">Zolarbyte · Elektrotechnik-Meisterbetrieb</p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__line">Eigener Strom.</span>
              <span className="hero__line">Effiziente Wärme.</span>
              <span className="hero__line">
                <em>Intelligent gespeichert.</em>
              </span>
            </h1>
            <p className="hero__lead">
              Photovoltaik, Wärmepumpen und Stromspeicher – passend zu Ihrem Zuhause geplant. Zolarbyte verbindet moderne
              Energietechnik mit elektrotechnischer Meisterkompetenz.
            </p>
            <div className="hero__actions">
              <Link href="/kontakt#anfrage" className="btn btn--primary">
                Projekt anfragen
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

        <div className="container">
          <ul className="hero__rail" aria-label="Unsere Schwerpunkte">
            {energyServices.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="hero__service">
                  <ServiceIcon id={s.id} />
                  <span>
                    <strong>{s.name}</strong>
                    <span>{s.claim}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li className="hero__meister">
              <span className="hero__meister-k">Meisterbetrieb</span>
              <span>
                Planung, Anschluss und Inbetriebnahme aus einer Hand – aus {site.address.city} bei München.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- 2 Übersicht ---------- */}
      <section id="leistungen" className="section overview" aria-labelledby="leistungen-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Energielösungen</p>
              <h2 id="leistungen-title" className="h2">
                Drei Bausteine. Ein System.
              </h2>
            </div>
            <p className="section-head__text">
              Jede Komponente funktioniert für sich. Ihren vollen Nutzen entfalten sie, wenn sie elektrisch sauber
              aufeinander abgestimmt sind – genau das ist unser Handwerk.
            </p>
          </div>

          <ol className="overview__list">
            {energyServices.map((s, i) => (
              <li key={s.id} className="overview__item">
                <span className="overview__index" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h3 className="overview__title">
                  <Link href={s.href}>{s.name}</Link>
                </h3>
                <p className="overview__text">{s.short}</p>
                <span className="overview__arrow" aria-hidden="true">
                  →
                </span>
              </li>
            ))}
          </ol>
          <p className="overview__more">
            Ergänzend weiterhin für Sie da: <Link href="/elektrotechnik">Elektroinstallation, Kundendienst und elektrische Prüfungen</Link>.
          </p>
        </div>
      </section>

      {/* ---------- 3 Zusammenspiel ---------- */}
      <section id="zusammenspiel" className="section system" aria-labelledby="system-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">So arbeitet Ihr Energiesystem</p>
              <h2 id="system-title" className="h2">
                Wohin fließt Ihr Strom?
              </h2>
            </div>
            <p className="section-head__text">
              Wählen Sie einen Baustein oder die Tageszeit. Die Darstellung ist schematisch und zeigt keine Messwerte.
            </p>
          </div>
          <ExplorerScene />
        </div>
      </section>

      {/* ---------- 4 Leistungen im Einzelnen ---------- */}
      {energyServices.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`section feature${i % 2 ? " feature--flip" : ""}`}
          aria-labelledby={`${s.id}-title`}
        >
          <div className="container feature__grid">
            <div className="feature__visual">
              <HouseDetail part={s.id} />
            </div>
            <div className="feature__copy">
              <p className="eyebrow">
                {pad(i + 1)} · {s.name}
              </p>
              <h2 id={`${s.id}-title`} className="h2 feature__title">
                {s.claim}
              </h2>
              <p className="feature__text">{s.sections[0].text}</p>
              <ul className="ticks">
                {s.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="feature__meister">
                <span>Meisterbetrieb</span>
                {s.meister}
              </p>
              <div className="feature__actions">
                <Link href={s.href} className="btn btn--ghost">
                  Mehr zu {s.name === "Wärmepumpe" ? "Wärmepumpen" : s.name}
                </Link>
                {s.id === "waermepumpe" ? (
                  <Link href="/foerderrechner" className="text-link">
                    Förderung berechnen
                  </Link>
                ) : (
                  <Link href={`/kontakt?interesse=${s.id}#anfrage`} className="text-link">
                    {s.name} anfragen
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ---------- 5 Förderrechner ---------- */}
      {features.calculator ? (
        <section id="foerderung" className="section calc-section" aria-labelledby="foerderung-title">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Förderrechner Wärmepumpe</p>
                <h2 id="foerderung-title" className="h2">
                  Wie viel Zuschuss ist möglich?
                </h2>
              </div>
              <p className="section-head__text">
                Wenige Fragen zur KfW-Heizungsförderung. Die Berechnung läuft nur in Ihrem Browser – ohne Anmeldung und
                ohne Pflichtformular. Zu Photovoltaik und Speicher finden Sie Hinweise auf der{" "}
                <Link href="/foerderrechner#pv-speicher">Seite des Förderrechners</Link>.
              </p>
            </div>
            <FoerderRechner />
          </div>
        </section>
      ) : null}

      {/* ---------- 6 Meisterbetrieb & Ansprechpartner ---------- */}
      <section id="betrieb" className="section people" aria-labelledby="people-title">
        <div className="container people__grid">
          <div>
            <p className="eyebrow">Meisterbetrieb aus Karlsfeld</p>
            <h2 id="people-title" className="h2">
              Energietechnik braucht saubere Elektrik.
            </h2>
            <p className="lead people__lead">
              Photovoltaik, Speicher und Wärmepumpe hängen am Zählerschrank und an der Hausinstallation. Zolarbyte ist
              als Elektrotechnik-Meisterbetrieb bei der Handwerkskammer für München und Oberbayern eingetragen und
              verantwortet Planung, elektrischen Anschluss und Inbetriebnahme.
            </p>
            <dl className="spec">
              <div>
                <dt>Betrieb</dt>
                <dd>Elektrotechnik-Meisterbetrieb, Handwerkskammer für München und Oberbayern</dd>
              </div>
              <div>
                <dt>Sitz</dt>
                <dd>
                  {site.address.street}, {site.address.zip} {site.address.city}
                </dd>
              </div>
              <div>
                <dt>Ansprechpartner</dt>
                <dd>
                  {site.sales.name}, {site.sales.role} – berät Sie zu neuen Projekten
                </dd>
              </div>
            </dl>
            <Link href="/meisterbetrieb" className="text-link people__more">
              Mehr über den Meisterbetrieb
            </Link>
          </div>
          <ContactPerson />
        </div>
      </section>

      {/* ---------- 7 Referenzen (nur mit freigegebenem Material) ---------- */}
      {isPreview && !features.references ? (
        <section className="section preview-gap" aria-label="Hinweis Referenzen">
          <div className="container">
            <div className="notice" role="note">
              <span>
                <strong>Vorschau – Platz für Referenzen:</strong> Hier erscheinen echte Projekte, Fotos und bestätigte
                Partner, sobald sie freigegeben sind. Bis dahin bleibt der Bereich auf der öffentlichen Seite
                ausgeblendet.
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- 8 Ablauf ---------- */}
      <section id="ablauf" className="section process" aria-labelledby="ablauf-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Ablauf</p>
              <h2 id="ablauf-title" className="h2">
                Von der Anfrage bis zur Inbetriebnahme.
              </h2>
            </div>
            <p className="section-head__text">
              Ein Ansprechpartner, klare Schritte und eine Anlage, die elektrisch zu Ihrem Haus passt.
            </p>
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
        </div>
      </section>

      {/* ---------- 9 Fragen ---------- */}
      <section id="fragen" className="section faq" aria-labelledby="fragen-title">
        <div className="container faq__grid">
          <div>
            <p className="eyebrow">Häufige Fragen</p>
            <h2 id="fragen-title" className="h2">
              Kurz beantwortet.
            </h2>
          </div>
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
      </section>

      {/* ---------- 10 Anfrage ---------- */}
      <section id="anfrage" className="section inquiry" aria-labelledby="anfrage-title">
        <div className="container inquiry__grid">
          <div>
            <p className="eyebrow">Projekt anfragen</p>
            <h2 id="anfrage-title" className="h2">
              Sprechen wir über <em>Ihr Haus.</em>
            </h2>
            <p className="inquiry__text">
              Ein paar Angaben genügen. Wir melden uns persönlich – oder Sie rufen direkt an.
            </p>
            <a href={site.general.phoneHref} className="cta__phone">
              <span>Telefon</span>
              {site.general.phone}
            </a>
          </div>
          <ContactForm mailConfigured={configured} previewNote={isPreview} />
        </div>
      </section>
    </>
  );
}
