import Link from "next/link";
import { Logo } from "@/components/Logo";
import { services } from "@/lib/content";
import { features, isPreview, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer" data-ground="night">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo animated={false} />
          <p>
            Elektrotechnik-Meisterbetrieb
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city} bei München
          </p>
        </div>

        <div>
          <h2 className="site-footer__title">Leistungen</h2>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/leistungen/${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="site-footer__title">Kontakt</h2>
          <ul>
            <li>
              <a href={site.general.phoneHref}>{site.general.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
            </li>
            <li>
              <Link href="/kontakt">Anfrage starten</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__title">Betrieb</h2>
          <ul>
            <li>
              <Link href="/betrieb">Über uns &amp; Ablauf</Link>
            </li>
            <li>
              <Link href="/fragen">Häufige Fragen</Link>
            </li>
            {features.foerdercheck || isPreview ? (
              <li>
                <Link href="/foerderung">Förder-Check</Link>
              </li>
            ) : null}
          </ul>
          <h2 className="site-footer__title site-footer__title--gap">Rechtliches</h2>
          <ul>
            <li>
              <Link href="/impressum">Impressum</Link>
            </li>
            <li>
              <Link href="/datenschutz">Datenschutz</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container site-footer__base">
        <p>
          © {site.copyrightYear} {site.legalName}
        </p>
        <p>Eingetragen bei der {site.chamber.name}</p>
        <p className="footer-credit">
          Website von{" "}
          <a href="https://pje-systems.de" target="_blank" rel="noopener">
            PJE Systems
          </a>
        </p>
      </div>
    </footer>
  );
}
