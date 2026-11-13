import Link from "next/link";
import { HouseDetail } from "@/components/house/Scenes";
import { energyServices, type EnergyService } from "@/lib/content";
import { ContactLinks } from "@/components/ContactLinks";
import { isPreview, site } from "@/lib/site";

/** Gemeinsame Vorlage für Photovoltaik, Wärmepumpe und Stromspeicher */
export function EnergyServicePage({ id }: { id: EnergyService["id"] }) {
  const s = energyServices.find((x) => x.id === id)!;
  const others = energyServices.filter((x) => x.id !== id);

  return (
    <>
      <section className="lp-hero" aria-labelledby="lp-title">
        <div className="container lp-hero__grid">
          <div>
            <p className="eyebrow">Energielösungen · Elektrotechnik-Meisterbetrieb</p>
            <h1 id="lp-title">{s.name}</h1>
            <p className="lp-hero__claim">{s.claim}</p>
            <ul className="ticks">
              {s.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div className="hero__actions">
              <Link href={`/kontakt?interesse=${s.id}#anfrage`} className="btn btn--primary">
                {s.name} anfragen
              </Link>
              {s.id === "waermepumpe" ? (
                <Link href="/foerderrechner" className="btn btn--ghost">
                  Förderung berechnen
                </Link>
              ) : (
                <Link href="/#zusammenspiel" className="btn btn--ghost">
                  Zusammenspiel ansehen
                </Link>
              )}
            </div>
          </div>
          <div className="feature__visual">
            <HouseDetail part={s.id} />
          </div>
        </div>
      </section>

      <section className="section lp-sections" aria-label={`${s.name} im Detail`}>
        <div className="container">
          <ul className="lp-sections__list">
            {s.sections.map((sec) => (
              <li key={sec.title}>
                <h2>{sec.title}</h2>
                <p>{sec.text}</p>
              </li>
            ))}
            <li>
              <h2>Kombinieren</h2>
              <p>
                {s.combine}{" "}
                {others.map((o, i) => (
                  <span key={o.id}>
                    <Link href={o.href} className="inline-link">
                      {o.name}
                    </Link>
                    {i < others.length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section lp-meister" aria-labelledby="lp-meister-title">
        <div className="container">
          <div className="lp-meister__box">
            <span className="badge-meister">Elektrotechnik-Meisterbetrieb</span>
            <h2 id="lp-meister-title">Planung, Anschluss und Inbetriebnahme in einer Verantwortung.</h2>
            <p>{s.meister}</p>
            {isPreview && s.id === "waermepumpe" ? (
              <div className="notice" role="note">
                <span>
                  <strong>Vorschau – vor Veröffentlichung klären:</strong> Wer übernimmt die heizungstechnische
                  (hydraulische) Installation – ZOLARBYTE ENERGY selbst oder ein Partnerbetrieb aus dem Heizungsbau? Und wer stellt
                  die „Bestätigung zum Antrag“ für die KfW aus? Der Text oben ist bewusst neutral formuliert.
                </span>
              </div>
            ) : null}
            <div className="lp-meister__contact">
              <p>
                Ihr Ansprechpartner für neue Projekte: <strong>{site.project.name}</strong>, {site.project.role}
              </p>
              <ContactLinks />
            </div>
          </div>
        </div>
      </section>

      <section className="section faq" aria-labelledby="lp-faq-title">
        <div className="container faq__grid">
          <div>
            <p className="eyebrow">Häufige Fragen</p>
            <h2 id="lp-faq-title" className="h2">
              {s.name}
            </h2>
          </div>
          <div className="faq__list">
            {s.faq.map((f) => (
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

      <section className="cta" aria-labelledby="lp-cta-title">
        <div className="container cta__inner">
          <div>
            <h2 id="lp-cta-title" className="cta__title">
              {s.name} <em>für Ihr Haus.</em>
            </h2>
            <p className="cta__text">Ein paar Angaben genügen – wir melden uns persönlich.</p>
          </div>
          <div className="cta__actions">
            <Link href={`/kontakt?interesse=${s.id}#anfrage`} className="btn btn--primary">
              Projekt anfragen
            </Link>
            <a href={site.project.phoneHref} className="cta__phone">
              <span>Telefon für Projektanfragen</span>
              {site.project.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
