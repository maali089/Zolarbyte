import Link from "next/link";
import { HeroScene } from "@/components/hero/HeroScene";
import { ContactPerson } from "@/components/ContactPerson";
import { faqs, services, steps } from "@/lib/content";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Electrician",
  name: site.legalName,
  url: site.url,
  telephone: site.general.phone,
  email: site.general.email,
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ---------- Einstieg ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner container">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow">Elektrotechnik-Meisterbetrieb · Karlsfeld bei München</p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__line">
                <span>Elektrotechnik,</span>
              </span>
              <span className="hero__line">
                <span>
                  die <em>verbindet.</em>
                </span>
              </span>
            </h1>
            <p className="hero__lead">
              Zolarbyte – Ihr Elektrotechnik-Meisterbetrieb aus Karlsfeld. Für durchdachte Elektroinstallationen,
              Photovoltaik und zuverlässigen Service.
            </p>
            <div className="hero__actions">
              <Link href="/kontakt" className="btn btn--primary">
                Projekt anfragen
              </Link>
              <a href="#leistungen" className="btn btn--ghost">
                Leistungen ansehen
              </a>
            </div>
          </div>
          <div className="hero__visual">
            <HeroScene />
          </div>
        </div>

        <div className="container">
          <ul className="hero__rail" aria-label="Direkter Kontakt">
            <li>
              <span>Telefon</span>
              <a href={site.general.phoneHref}>{site.general.phone}</a>
            </li>
            <li>
              <span>E-Mail</span>
              <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
            </li>
            <li>
              <span>Vertrieb &amp; neue Projekte</span>
              <a href="#ansprechpartner">
                {site.sales.name}, {site.sales.role}
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Betrieb ---------- */}
      <section id="betrieb" className="section intro" aria-labelledby="betrieb-title">
        <div className="container">
          <p className="eyebrow">Der Betrieb</p>
          <h2 id="betrieb-title" className="intro__statement">
            Ein Meisterbetrieb für Ihre <em>gesamte</em> Elektrik.
          </h2>
          <div className="intro__grid">
            <div className="intro__body">
              <p className="lead">
                Zolarbyte ist ein Elektrotechnik-Meisterbetrieb mit Sitz in Karlsfeld bei München. Wir installieren,
                prüfen und warten elektrische Anlagen, beheben Störungen und binden Photovoltaik fachgerecht in
                bestehende Installationen ein.
              </p>
              <p>
                Dabei setzen wir auf persönliche Beratung vor Ort, individuell abgestimmte Lösungen und hochwertige
                Komponenten. Für Ihr Vorhaben haben Sie einen persönlichen Ansprechpartner.
              </p>
            </div>
            <dl className="spec">
              <div>
                <dt>Betrieb</dt>
                <dd>Elektrotechnik-Meisterbetrieb, eingetragen bei der Handwerkskammer für München und Oberbayern</dd>
              </div>
              <div>
                <dt>Sitz</dt>
                <dd>
                  {site.address.street}, {site.address.zip} {site.address.city}
                </dd>
              </div>
              <div>
                <dt>Arbeitsweise</dt>
                <dd>Ausführung und Prüfung nach den geltenden VDE-Bestimmungen</dd>
              </div>
              <div>
                <dt>Beratung</dt>
                <dd>Persönlich und vor Ort</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Leistungen ---------- */}
      <section id="leistungen" className="section services" aria-labelledby="leistungen-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Leistungen</p>
              <h2 id="leistungen-title" className="h2">
                Von der Installation bis zur Prüfung.
              </h2>
            </div>
            <p className="section-head__text">
              Sechs Leistungsbereiche, ein Ansprechpartner. Photovoltaik ist einer davon – das Fundament bleibt eine
              sauber geplante und ausgeführte Elektroinstallation.
            </p>
          </div>

          <ol className="service-list">
            {services.map((s, i) => (
              <li key={s.id} id={s.id} className="service">
                <span className="service__index" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <h3 className="service__title">{s.title}</h3>
                <div className="service__body">
                  <p className="service__text">{s.text}</p>
                  <ul className="service__points" aria-label={`Schwerpunkte ${s.title}`}>
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Ablauf ---------- */}
      <section id="ablauf" className="section process" aria-labelledby="ablauf-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Ablauf</p>
              <h2 id="ablauf-title" className="h2">
                So läuft Ihr Projekt.
              </h2>
            </div>
            <p className="section-head__text">
              Klare Schritte und persönliche Abstimmung – von der ersten Anfrage bis zur fertigen Anlage.
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

      {/* ---------- Ansprechpartner ---------- */}
      <section id="ansprechpartner" className="section people" aria-labelledby="people-title">
        <div className="container people__grid">
          <div>
            <p className="eyebrow">Ansprechpartner</p>
            <h2 id="people-title" className="h2">
              Persönlich erreichbar.
            </h2>
            <p className="lead people__lead">
              Für neue Projekte und Angebote sprechen Sie direkt mit unserem Vertriebsleiter. Allgemeine Anfragen und
              Störungsmeldungen erreichen uns über den zentralen Kontakt.
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

      {/* ---------- Fragen ---------- */}
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

      {/* ---------- Abschluss ---------- */}
      <section className="cta" aria-labelledby="cta-title">
        <div className="container cta__inner">
          <div>
            <h2 id="cta-title" className="cta__title">
              Sprechen wir über <em>Ihr Vorhaben.</em>
            </h2>
            <p className="cta__text">
              Beschreiben Sie uns kurz, was Sie planen oder was nicht funktioniert. Wir melden uns persönlich bei
              Ihnen.
            </p>
          </div>
          <div className="cta__actions">
            <Link href="/kontakt" className="btn btn--primary">
              Projekt anfragen
            </Link>
            <a href={site.general.phoneHref} className="cta__phone">
              <span>Telefon</span>
              {site.general.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
