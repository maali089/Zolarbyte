"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatedMark, Wordmark } from "@/components/Logo";

const SOLUTIONS = [
  { href: "/photovoltaik", label: "Photovoltaik", note: "Strom vom eigenen Dach" },
  { href: "/waermepumpe", label: "Wärmepumpe", note: "Heizen mit Umweltwärme" },
  { href: "/stromspeicher", label: "Stromspeicher", note: "Solarstrom für den Abend" },
  { href: "/#zusammenspiel", label: "Zusammenspiel", note: "Das Energiesystem erklärt" },
  { href: "/elektrotechnik", label: "Elektrotechnik", note: "Installation, Service, Prüfung" },
];

const NAV = [
  { href: "/foerderrechner", label: "Förderrechner" },
  { href: "/meisterbetrieb", label: "Meisterbetrieb" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const pathname = usePathname();
  const subRef = useRef<HTMLLIElement>(null);

  // Menü bei Seitenwechsel schließen
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setSub(false);
  }

  useEffect(() => {
    if (!open && !sub) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSub(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (sub && subRef.current && !subRef.current.contains(e.target as Node)) setSub(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, sub]);

  const close = () => {
    setOpen(false);
    setSub(false);
  };

  const isSolution = SOLUTIONS.some((s) => s.href === pathname);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="Zolarbyte – zur Startseite">
          <AnimatedMark className="brand__mark" data-zb-mark="" />
          <span className="brand__text">
            <Wordmark className="brand__word" />
            <span className="brand__sub">Elektrotechnik-Meisterbetrieb</span>
          </span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="hauptnavigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="visually-hidden">{open ? "Menü schließen" : "Menü öffnen"}</span>
        </button>

        <nav id="hauptnavigation" className="site-nav" aria-label="Hauptnavigation">
          <ul>
            <li ref={subRef} className={`has-sub${sub ? " is-sub-open" : ""}`}>
              <button
                type="button"
                className={`site-nav__link site-nav__toggle${isSolution ? " is-current" : ""}`}
                aria-expanded={sub}
                aria-controls="nav-loesungen"
                onClick={() => setSub((v) => !v)}
              >
                Energielösungen
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" />
                </svg>
              </button>
              <ul id="nav-loesungen" className="subnav">
                {SOLUTIONS.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} onClick={close} aria-current={pathname === s.href ? "page" : undefined}>
                      <strong>{s.label}</strong>
                      <span>{s.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`site-nav__link${pathname === item.href ? " is-current" : ""}`}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={close}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/kontakt#anfrage" className="btn btn--primary btn--small" onClick={close}>
            Projekt anfragen
          </Link>
        </nav>
      </div>
    </header>
  );
}
