"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/#leistungen", label: "Leistungen" },
  { href: "/#betrieb", label: "Betrieb" },
  { href: "/#ablauf", label: "Ablauf" },
  { href: "/#fragen", label: "Fragen" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Menü bei Seitenwechsel schließen
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Zolarbyte – zur Startseite">
          <Logo tone="light" />
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
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/kontakt"
            className="btn btn--primary btn--small"
            aria-current={pathname === "/kontakt" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Projekt anfragen
          </Link>
        </nav>
      </div>
    </header>
  );
}
