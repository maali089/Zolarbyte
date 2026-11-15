"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Mobile Kontaktleiste: erscheint nach dem Einstieg, verschwindet,
 * sobald Anfrage-Bereich oder Footer im Blick sind.
 */
export function MobileDock() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [hasInquiry, setHasInquiry] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM ist erst nach dem Mount bekannt
    setHasInquiry(Boolean(document.getElementById("anfrage")));
    let blocked = false;
    let past = false;
    const apply = () => setShow(past && !blocked);

    const targets = Array.from(document.querySelectorAll<HTMLElement>("#anfrage, .site-footer, [data-dock-hide]"));
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target, e.isIntersecting));
        blocked = targets.some((t) => visible.get(t));
        apply();
      },
      { threshold: 0.05 },
    );
    targets.forEach((t) => io.observe(t));

    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.6;
      if (next !== past) {
        past = next;
        apply();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (pathname === "/kontakt") return null;

  return (
    <div className={`dock${show ? " is-shown" : ""}`} aria-hidden={!show}>
      <a className="dock__call" href={site.general.phoneHref} tabIndex={show ? 0 : -1}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M6.6 2.8 8.4 6a1 1 0 0 1-.2 1.2L6.8 8.5a10 10 0 0 0 4.7 4.7l1.3-1.4a1 1 0 0 1 1.2-.2l3.2 1.8a1 1 0 0 1 .5 1.1l-.5 2.2a1.6 1.6 0 0 1-1.7 1.2A15.5 15.5 0 0 1 1.1 3.9a1.6 1.6 0 0 1 1.2-1.7l2.2-.5a1 1 0 0 1 1.1.5z" />
        </svg>
        Anrufen
      </a>
      <Link className="dock__start" href={hasInquiry ? "#anfrage" : "/kontakt"} tabIndex={show ? 0 : -1}>
        Anfrage starten
      </Link>
    </div>
  );
}
