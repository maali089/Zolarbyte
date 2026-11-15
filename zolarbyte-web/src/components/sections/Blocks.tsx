import Link from "next/link";
import { Words } from "@/components/fx/Words";
import { InquirySlot } from "@/components/sections/Slots";
import { Stamp } from "@/components/sections/Stamp";
import { site } from "@/lib/site";

/** Seitenkopf der Unterseiten mit Brotkrumen und Sonnenbogen-Motiv. */
export function PageHead({
  title,
  lead,
  crumbs = [],
  children,
}: {
  title: string;
  lead?: string;
  crumbs?: Array<{ href: string; label: string }>;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-head" data-ground="day">
      <div className="container">
        {crumbs.length ? (
          <nav className="crumbs" aria-label="Brotkrumen">
            <ol>
              <li>
                <Link href="/">Start</Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1>
          <Words text={title} />
        </h1>
        {lead ? (
          <p data-reveal style={{ "--i": 3 } as React.CSSProperties}>
            {lead}
          </p>
        ) : null}
        {children}
      </div>
      <svg className="page-head__arc" viewBox="0 0 520 200" fill="none" aria-hidden="true">
        <path d="M0 199 C 130 20, 390 20, 520 199" stroke="currentColor" />
        <line x1="0" y1="199" x2="520" y2="199" stroke="currentColor" strokeDasharray="2 6" />
        <circle cx="388" cy="78" r="9" fill="var(--amber)" stroke="none" />
      </svg>
    </section>
  );
}

/** Abschluss jeder Seite: Anfrage bei Nacht. */
export function ClosingInquiry({
  title = "Erzählen Sie uns,\nwas ansteht.",
  accent = ["ansteht"],
  topic,
}: {
  title?: string;
  accent?: string[];
  topic?: string;
}) {
  return (
    <section id="anfrage" className="closing" aria-labelledby="anfrage-title" data-ground="night">
      <div className="closing__horizon" aria-hidden="true">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" fill="none">
          <path d="M0 200 C 250 40, 750 40, 1000 200" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="closing__sunset" />
      </div>
      <div className="container closing__grid">
        <div className="closing__copy">
          <h2 id="anfrage-title" className="h2">
            <Words text={title} accent={accent} />
          </h2>
          <p className="closing__lead" data-reveal>
            Drei kurze Schritte, keine Pflichtfragen zu Technik oder Budget. Wir melden uns persönlich bei Ihnen.
          </p>
          <div className="closing__direct" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
            <a href={site.general.phoneHref} className="closing__phone" data-cursor="Anrufen">
              {site.general.phone}
            </a>
            <a href={`mailto:${site.general.email}`} className="link-line">
              {site.general.email}
            </a>
          </div>
        </div>
        <div className="closing__form">
          <InquirySlot initialTopic={topic} />
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="faq__list">
      {items.map((f, i) => (
        <details key={f.q} className="faq__item" data-reveal style={{ "--i": i } as React.CSSProperties}>
          <summary>
            <span>{f.q}</span>
            <span className="faq__icon" aria-hidden="true" />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function BaseFacts() {
  return (
    <div className="base__facts">
      <Stamp className="base__stamp" uid="stamp-ring-base" reveal />
      <dl className="facts">
        <div className="facts__row" data-reveal style={{ "--i": 0 } as React.CSSProperties}>
          <dt className="tech">Betrieb</dt>
          <dd>Elektrotechnik-Meisterbetrieb, eingetragen bei der {site.chamber.name}</dd>
        </div>
        <div className="facts__row" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <dt className="tech">Arbeitsweise</dt>
          <dd>Ausführung und Prüfung nach den geltenden VDE-Bestimmungen</dd>
        </div>
        <div className="facts__row" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          <dt className="tech">Beratung</dt>
          <dd>Persönlich und vor Ort</dd>
        </div>
        <div className="facts__row" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
          <dt className="tech">Sitz</dt>
          <dd>
            {site.address.street}, {site.address.zip} {site.address.city}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function People() {
  return (
    <div className="people__grid">
      <h2 id="people-title" className="h2 people__title">
        <Words text={"Persönlich\nerreichbar."} />
      </h2>
      <div className="people__card" data-reveal>
        <p className="people__name">{site.sales.name}</p>
        <p className="people__sub">{site.sales.role} · neue Projekte &amp; Angebote</p>
        <a className="people__phone" href={site.sales.phoneHref} data-cursor="Anrufen">
          {site.sales.phone}
        </a>
        <a className="people__mail link-line" href={`mailto:${site.sales.email}`}>
          {site.sales.email}
        </a>
      </div>
      <div className="people__card" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        <p className="people__name">Zentrale</p>
        <p className="people__sub">Allgemeine Anfragen &amp; Störungen</p>
        <a className="people__phone" href={site.general.phoneHref} data-cursor="Anrufen">
          {site.general.phone}
        </a>
        <a className="people__mail link-line" href={`mailto:${site.general.email}`}>
          {site.general.email}
        </a>
      </div>
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
