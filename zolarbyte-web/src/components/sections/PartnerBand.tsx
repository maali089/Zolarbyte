import Image from "next/image";
import { partners } from "@/lib/content";
import { features, isPreview } from "@/lib/site";

/**
 * Laufband der Partner/Hersteller. Logos ruhig in Graustufen, beim Überfahren in Farbe;
 * das Band hält an, sobald Zeiger oder Fokus darauf liegen. Reduzierte Bewegung → statisches Raster.
 * Öffentlich erst mit features.partners (Freigabe der Liste ausstehend).
 */
export function PartnerBand({ title = "Mit wem wir arbeiten" }: { title?: string }) {
  if (!features.partners && !isPreview) return null;
  if (!partners.length) return null;

  const row = (hidden: boolean) => (
    <ul className="pband__row" aria-hidden={hidden || undefined}>
      {partners.map((p) => (
        <li key={p.id} className="pband__item">
          <span className="pband__plate" data-cursor={hidden ? undefined : p.name}>
            <Image
              src={p.logo}
              alt=""
              width={p.width}
              height={p.height}
              className="pband__logo"
              sizes="180px"
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
          <p className="pband__note tech">Vorschau · Liste von 2023, Freigabe offen</p>
        ) : null}
      </div>
      <div className="pband__track" tabIndex={0} aria-label="Partner (Laufband, hält bei Fokus an)">
        <div className="pband__marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
