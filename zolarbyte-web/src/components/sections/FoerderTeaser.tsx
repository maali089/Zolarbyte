import Link from "next/link";
import { Words } from "@/components/fx/Words";
import { features, isPreview } from "@/lib/site";

/** Verweis auf den Förder-Check (nur wenn freigegeben bzw. in der Vorschau). */
export function FoerderTeaser() {
  if (!features.foerdercheck && !isPreview) return null;
  return (
    <section className="ft" aria-labelledby="ft-title" data-ground="day">
      <div className="container ft__grid">
        <h2 id="ft-title" className="h2">
          <Words text={"Welche Förderung\npasst zu Ihnen?"} accent={["Förderung"]} />
        </h2>
        <div className="ft__side" data-reveal>
          <p className="lead">
            Sechs kurze Fragen, am Ende ein klarer Überblick: was Ihnen bei Photovoltaik, Speicher und Wallbox zusteht – mit amtlicher Quelle.
          </p>
          <Link href="/foerderung" className="btn btn--primary" data-cursor="Prüfen">
            Förder-Check starten
            <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </Link>
        </div>
      </div>
      <svg className="ft__arc" viewBox="0 0 1000 300" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M0 300 C 250 20, 750 20, 1000 300" vectorEffect="non-scaling-stroke" />
      </svg>
    </section>
  );
}
