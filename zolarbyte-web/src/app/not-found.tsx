import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-head" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container">
        <p className="eyebrow">Fehler 404</p>
        <h1>Diese Seite gibt es nicht.</h1>
        <p>Vielleicht hat sich die Adresse geändert. Auf der Startseite finden Sie alle Leistungen und Kontaktwege.</p>
        <div className="hero__actions">
          <Link href="/" className="btn btn--primary">
            Zur Startseite
          </Link>
          <Link href="/kontakt" className="btn btn--ghost">
            Kontakt
          </Link>
        </div>
      </div>
    </section>
  );
}
