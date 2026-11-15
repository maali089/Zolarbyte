import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Words } from "@/components/fx/Words";
import { ClosingInquiry, FaqList, JsonLd } from "@/components/sections/Blocks";
import { FoerderTeaser } from "@/components/sections/FoerderTeaser";
import { ProcessArc } from "@/components/sections/ProcessArc";
import { ServiceVisual } from "@/components/sections/ServiceVisual";
import { StartButton } from "@/components/sections/StartButton";
import { faqsFor, serviceById, services } from "@/lib/content";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceById(slug);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/leistungen/${s.id}` },
  };
}

/**
 * Alle sechs Pfade sind über generateStaticParams bekannt und werden vollständig vorgerendert.
 * params bewusst außerhalb von <Suspense> lesen: sonst streamt der Inhalt nach und der Footer springt (CLS).
 * Die Sofort-Navigations-Validierung (Partial Prefetching) ist für diese Route daher abgeschaltet.
 */
export const instant = false;

export default async function LeistungPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceById(slug);
  if (!s) notFound();

  const related = s.related.map(serviceById).filter((x) => x !== undefined);
  const faq = faqsFor(s.id);
  const index = services.findIndex((x) => x.id === s.id);
  const next = services[(index + 1) % services.length];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.seoDescription,
          serviceType: s.title,
          url: `${site.url}/leistungen/${s.id}`,
          provider: { "@id": `${site.url}/#organisation` },
          areaServed: { "@type": "City", name: "Karlsfeld" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Start", item: site.url },
            { "@type": "ListItem", position: 2, name: "Leistungen", item: `${site.url}/leistungen` },
            { "@type": "ListItem", position: 3, name: s.title, item: `${site.url}/leistungen/${s.id}` },
          ],
        }}
      />

      {/* Kopf mit Rendering */}
      <section className="svc-hero" data-ground="day">
        <div className="container svc-hero__grid">
          <div className="svc-hero__copy">
            <nav className="crumbs" aria-label="Brotkrumen">
              <ol>
                <li>
                  <Link href="/">Start</Link>
                </li>
                <li>
                  <Link href="/leistungen">Leistungen</Link>
                </li>
                <li>
                  <span aria-current="page">{s.short}</span>
                </li>
              </ol>
            </nav>
            <h1 className="svc-hero__title">
              <Words text={s.title} />
            </h1>
            <p className="svc-hero__headline" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
              {s.headline}
            </p>
            <p className="lead" data-reveal style={{ "--i": 4 } as React.CSSProperties}>
              {s.lead}
            </p>
            <div className="svc-hero__actions" data-reveal style={{ "--i": 6 } as React.CSSProperties}>
              <StartButton topic={s.topic} label={`${s.short} anfragen`} />
              <a href={site.general.phoneHref} className="btn btn--ghost" data-cursor="Anrufen">
                {site.general.phone}
              </a>
            </div>
          </div>
          <div className="svc-hero__visual" data-reveal="fade">
            <ServiceVisual
              id={s.id}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt={`Modell: ${s.title} am Zolarbyte-Hausmodell`}
            />
          </div>
        </div>
      </section>

      {/* Was dazugehört */}
      <section className="section svc-scope" aria-labelledby="umfang-title" data-ground="day">
        <div className="container svc-scope__grid">
          <div className="svc-scope__copy">
            <h2 id="umfang-title" className="h2">
              <Words text={"Was\ndazugehört."} />
            </h2>
            <p className="lead" data-reveal>
              {s.text}
            </p>
          </div>
          <ol className="scope">
            {s.points.map((p, i) => (
              <li key={p} className="scope__item" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <span className="scope__node" aria-hidden="true" />
                <span className="scope__label">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Gehört zusammen */}
      <section className="section svc-related" aria-labelledby="zusammen-title" data-ground="day">
        <div className="container">
          <header className="sec-head sec-head--split">
            <h2 id="zusammen-title" className="h2">
              <Words text={"Gehört\nzusammen."} accent={["zusammen"]} />
            </h2>
            <p className="lead" data-reveal>
              Eine Anlage ist nur so gut wie die Installation dahinter. Diese Leistungen planen wir oft gleich mit.
            </p>
          </header>
          <ul className="rel">
            {related.map((r, i) => (
              <li key={r.id} className="rel__item" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <Link href={`/leistungen/${r.id}`} className="rel__link" data-cursor="Ansehen">
                  <ServiceVisual id={r.id} className="rel__img" sizes="(min-width: 1024px) 30vw, 90vw" />
                  <span className="rel__title">{r.title}</span>
                  <span className="rel__lead">{r.lead}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {s.id === "photovoltaik" || s.id === "e-mobilitaet" ? <FoerderTeaser /> : null}

      {/* Ablauf */}
      <section className="section process" aria-labelledby="ablauf-title" data-ground="day">
        <div className="container">
          <header className="sec-head sec-head--split">
            <h2 id="ablauf-title" className="h2">
              <Words text={"Vier Schritte\nbis zur Übergabe."} />
            </h2>
            <p className="lead" data-reveal>
              Klare Abstimmung von der ersten Nachricht bis zur fertigen, geprüften Anlage.
            </p>
          </header>
          <ProcessArc />
        </div>
      </section>

      {faq.length ? (
        <section className="section faq" aria-labelledby="fragen-title" data-ground="day">
          <div className="container faq__grid">
            <h2 id="fragen-title" className="h2">
              <Words text={"Kurz\nbeantwortet."} />
            </h2>
            <FaqList items={faq} />
          </div>
        </section>
      ) : null}

      <nav className="svc-next" aria-label="Nächste Leistung" data-ground="day">
        <div className="container">
          <Link href={`/leistungen/${next.id}`} className="svc-next__link" data-cursor="Weiter">
            <span className="tech">Nächste Leistung</span>
            <span className="svc-next__title">{next.title}</span>
          </Link>
        </div>
      </nav>

      <ClosingInquiry topic={s.topic} />
    </>
  );
}
