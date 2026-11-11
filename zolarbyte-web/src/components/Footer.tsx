import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/Logo";
import { energyServices } from "@/lib/content";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="footer-brand">
            <LogoMark className="footer-brand__mark" />
            <Wordmark />
          </span>
          <p>
            <strong className="site-footer__meister">Elektrotechnik-Meisterbetrieb</strong>
            <br />
            eingetragen bei der Handwerkskammer für München und Oberbayern
            <br />
            {site.address.street}, {site.address.zip} {site.address.city} bei München
          </p>
        </div>

        <div>
          <h2 className="site-footer__title">Energielösungen</h2>
          <ul>
            {energyServices.map((s) => (
              <li key={s.id}>
                <Link href={s.href}>{s.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/elektrotechnik">Elektrotechnik</Link>
            </li>
            <li>
              <Link href="/foerderrechner">Förderrechner</Link>
            </li>
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
              <Link href="/kontakt#anfrage">Projekt anfragen</Link>
            </li>
            <li>
              <Link href="/meisterbetrieb">Meisterbetrieb</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__title">Rechtliches</h2>
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
      </div>
    </footer>
  );
}
