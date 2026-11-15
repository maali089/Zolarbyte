import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Diese Adresse gibt es auf zolarbyte.de nicht. Zur Startseite oder direkt eine Anfrage starten.",
  alternates: { canonical: null },
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="page-head nf" data-ground="day">
      <div className="container">
        <p className="nf__code tech" aria-hidden="true">
          404 · 23:59 Uhr
        </p>
        <h1>Hier geht die Sonne nicht auf.</h1>
        <p>Diese Adresse gibt es nicht (mehr). Auf der Startseite finden Sie alle Leistungen und Kontaktwege.</p>
        <div className="nf__actions">
          <Link href="/" className="btn btn--primary">
            Zur Startseite
          </Link>
          <Link href="/kontakt" className="btn btn--ghost">
            Anfrage starten
          </Link>
        </div>
      </div>
      <svg className="page-head__arc" viewBox="0 0 520 200" fill="none" aria-hidden="true">
        <path d="M0 199 C 130 20, 390 20, 520 199" stroke="currentColor" strokeDasharray="1 7" strokeLinecap="round" />
        <line x1="0" y1="199" x2="520" y2="199" stroke="currentColor" />
      </svg>
    </section>
  );
}
