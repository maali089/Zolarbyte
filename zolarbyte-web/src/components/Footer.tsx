import Link from "next/link";
import { Logo } from "@/components/Logo";
import { services } from "@/lib/content";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo tone="light" />
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
                <Link href={`/#${s.id}`}>{s.title}</Link>
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
              <Link href="/kontakt">Projekt anfragen</Link>
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
        <p>© {site.copyrightYear} {site.legalName}</p>
      </div>
    </footer>
  );
}
