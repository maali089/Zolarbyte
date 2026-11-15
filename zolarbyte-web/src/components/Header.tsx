"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Magnetic } from "@/components/motion/Magnetic";
import { services } from "@/lib/content";
import { features, isPreview, site } from "@/lib/site";

const NAV = [
  { href: "/leistungen", label: "Leistungen" },
  ...(features.foerdercheck || isPreview ? [{ href: "/foerderung", label: "Förderung" }] : []),
  { href: "/betrieb", label: "Betrieb" },
  { href: "/fragen", label: "Fragen" },
  { href: "/kontakt", label: "Kontakt" },
];

type LenisScroll = { scrollTo: (t: Element, o?: { offset?: number }) => void };

type LenisLike = { stop: () => void; start: () => void };

function lock(locked: boolean) {
  const l = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (l) {
    if (locked) l.stop();
    else l.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaRef = useRef<HTMLLIElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const lastY = useRef(0);

  // Menü bei Seitenwechsel schließen
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMega(false);
  }

  useEffect(() => {
    lock(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lock(false);
    };
  }, [open]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 8);
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 480);
          lastY.current = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mega-Menü: Escape und Klick außerhalb schließen
  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        megaRef.current?.querySelector<HTMLButtonElement>(".site-nav__trigger")?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [mega]);

  const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
  const hoverOpen = () => {
    if (!fine()) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const hoverClose = () => {
    if (!fine()) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 180);
  };
  const leistungenActive = pathname === "/leistungen" || pathname.startsWith("/leistungen/");

  // CTA: Auf Seiten mit Anfrage-Bereich dorthin scrollen, sonst zur Kontaktseite
  const onCta = (e: React.MouseEvent) => {
    setOpen(false);
    const target = document.getElementById("anfrage");
    if (!target) return;
    e.preventDefault();
    const lenis = (window as unknown as { __lenis?: LenisScroll }).__lenis;
    if (lenis) lenis.scrollTo(target, { offset: -16 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`site-header${open ? " is-open" : ""}${scrolled ? " is-scrolled" : ""}${hidden && !mega ? " is-hidden" : ""}${mega ? " has-mega" : ""}`}
    >
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="ZOLARBYTE ENERGY – zur Startseite" data-cursor="Start">
          <Logo />
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
            {NAV.map((item, i) =>
              item.href === "/leistungen" ? (
                <li
                  key={item.href}
                  ref={megaRef}
                  className={`site-nav__mega-item${mega ? " is-mega" : ""}`}
                  onPointerEnter={hoverOpen}
                  onPointerLeave={hoverClose}
                >
                  <button
                    type="button"
                    className="site-nav__link site-nav__trigger"
                    aria-expanded={mega}
                    aria-controls="mega-leistungen"
                    aria-current={leistungenActive ? "page" : undefined}
                    onClick={() => setMega((v) => !v)}
                  >
                    {item.label}
                    <svg className="site-nav__chev" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2.5 4.5 6 8l3.5-3.5" />
                    </svg>
                    <span className="site-nav__index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>

                  <div id="mega-leistungen" className="mega" inert={!mega}>
                    <div className="mega__inner">
                      <ul className="mega__list">
                        {services.map((sv, k) => (
                          <li key={sv.id} style={{ "--k": k } as React.CSSProperties}>
                            <Link
                              href={`/leistungen/${sv.id}`}
                              className="mega__link"
                              aria-current={pathname === `/leistungen/${sv.id}` ? "page" : undefined}
                              onClick={() => {
                                setMega(false);
                                setOpen(false);
                              }}
                            >
                              <span className="mega__thumb" aria-hidden="true">
                                <Image src={`/renders/${sv.id}.webp`} alt="" width={320} height={240} sizes="(min-width: 901px) 132px, 64px" />
                              </span>
                              <span className="mega__text">
                                <span className="mega__title">{sv.title}</span>
                                <span className="mega__lead">{sv.lead}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mega__side">
                        <Link
                          href="/leistungen"
                          className="mega__all"
                          onClick={() => {
                            setMega(false);
                            setOpen(false);
                          }}
                        >
                          Alle Leistungen im Überblick
                          <svg viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M4 10h11M11 5l5 5-5 5" />
                          </svg>
                        </Link>
                        {features.foerdercheck || isPreview ? (
                          <Link
                            href="/foerderung"
                            className="mega__promo"
                            onClick={() => {
                              setMega(false);
                              setOpen(false);
                            }}
                          >
                            <span className="mega__promo-title">Förder-Check</span>
                            <span className="mega__promo-text">Welche Förderung passt zu PV, Wärmepumpe, Speicher oder Wallbox?</span>
                          </Link>
                        ) : null}
                        <p className="mega__phone">
                          <span className="tech">Direkt</span>
                          <a href={site.general.phoneHref}>{site.general.phone}</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="site-nav__link"
                    aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                    <span className="site-nav__index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
          <p className="site-nav__phone">
            Lieber direkt sprechen?
            <a href={site.general.phoneHref}>{site.general.phone}</a>
          </p>
          <Magnetic strength={0.25} className="site-nav__cta">
            <Link href="/kontakt" className="btn btn--primary btn--small" onClick={onCta}>
              Anfrage starten
            </Link>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}
