import Image from "next/image";
import { partners } from "@/lib/content";
import { features, isPreview } from "@/lib/site";

/**
 * Laufband der Partner/Hersteller. Logos ruhig in Graustufen, beim Überfahren in Farbe;
 * das Band hält an, sobald Zeiger oder Fokus darauf liegen. Reduzierte Bewegung → statisches Raster.
 * Liste vom Auftraggeber bestätigt (features.partners).
 */
export function PartnerBand({ title = "Hersteller, mit denen wir arbeiten" }: { title?: string }) {
  if (!features.partners && !isPreview) return null;
  if (!partners.length) return null;

  const row = (hidden: boolean) => (
    <ul className="pband__row" aria-hidden={hidden || undefined}>
      {partners.map((p) => (
        <li key={p.id} className="pband__item">
          <span className="pband__plate" data-tile={p.tile} data-cursor={hidden ? undefined : p.name}>
            <Image
              src={p.logo}
              alt=""
              width={Math.round(p.ratio * 120)}
              height={120}
              className="pband__logo"
              sizes="180px"
              unoptimized={p.logo.endsWith(".svg")}
            />
          </span>
          <span className="pband__name tech">{p.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="pband" aria-labelledby="pband-title" data-ground="day">
      <div className="container pband__head">
        <h2 id="pband-title" className="pband__title">
          {title}
        </h2>
        {!features.partners && isPreview ? (
          <p className="pband__note tech">Vorschau · Freigabe offen</p>
        ) : null}
      </div>
      <div className="pband__track" tabIndex={0} aria-label={`Partner und Hersteller: ${partners.map((p) => p.name).join(", ")}`}>
        <div className="pband__marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
