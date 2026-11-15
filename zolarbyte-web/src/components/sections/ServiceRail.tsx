"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ServiceVisual } from "@/components/sections/ServiceVisual";
import { startInquiry } from "@/components/sections/TopicChips";
import type { Service } from "@/lib/content";

const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * Leistungen als horizontale Schiene.
 * Desktop (ohne reduced motion): Die Schiene pinnt unter dem Header, vertikales Scrollen schiebt
 * die Karten seitlich durch. Mobil/Tablet bzw. reduced motion: natives Wischen mit Scroll-Snap.
 */
export function ServiceRail({ services }: { services: Service[] }) {
  const router = useRouter();
  const railRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const total = services.length;

  useEffect(() => {
    const rail = railRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    if (!rail || !pin || !track || !bar) return;

    const mq = window.matchMedia(PIN_QUERY);
    const cards = () => Array.from(track.children) as HTMLElement[];
    let distance = 0;
    let raf = 0;
    let last = -1;

    const pinTop = () => parseFloat(getComputedStyle(pin).top) || 0;

    const pick = (x: number) => {
      const list = cards();
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      let idx = 0;
      let best = Infinity;
      list.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - pad - x);
        if (d < best) {
          best = d;
          idx = i;
        }
      });
      // Am Ende der Schiene gilt die letzte Karte als aktiv
      if (distance > 0 && x >= distance - 2) idx = list.length - 1;
      if (idx !== last) {
        last = idx;
        setActive(idx);
      }
    };

    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const x = Math.min(Math.max(pinTop() - rail.getBoundingClientRect().top, 0), distance);
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      bar.style.transform = `scaleX(${distance ? x / distance : 0})`;
      pick(x);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onNativeScroll = () => {
      if (mq.matches) return;
      const max = track.scrollWidth - track.clientWidth;
      bar.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
      pick(track.scrollLeft);
    };

    const measure = () => {
      if (mq.matches) {
        distance = Math.max(track.scrollWidth - pin.clientWidth, 0);
        rail.style.height = `${pin.offsetHeight + distance}px`;
        update();
      } else {
        distance = 0;
        rail.style.height = "";
        track.style.transform = "";
        onNativeScroll();
      }
    };

    // Tastatur: fokussierte Karte in den sichtbaren Bereich der Schiene scrollen
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches) return;
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
      if (!card) return;
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const x = Math.min(Math.max(card.offsetLeft - pad, 0), distance);
      const y = window.scrollY + rail.getBoundingClientRect().top - pinTop() + x;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo({ top: y });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(pin);
    ro.observe(track);
    mq.addEventListener("change", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scroll", onNativeScroll, { passive: true });
    rail.addEventListener("focusin", onFocus);
    measure();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("scroll", onScroll);
      track.removeEventListener("scroll", onNativeScroll);
      rail.removeEventListener("focusin", onFocus);
      rail.style.height = "";
      track.style.transform = "";
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rail" ref={railRef}>
      <div className="rail__pin" ref={pinRef}>
        <div className="rail__bar container" aria-hidden="true">
          <span className="rail__count tech">
            <span className="rail__now">{pad(active + 1)}</span> / {pad(total)}
          </span>
          <span className="rail__line">
            <span className="rail__fill" ref={barRef} />
          </span>
          <span className="rail__hint tech">
            {services[active]?.short}
          </span>
        </div>

        <ol className="rail__track" ref={trackRef} aria-label="Leistungen">
          {services.map((s, i) => (
            <li key={s.id} id={s.id} className={`rail__card${i === active ? " is-active" : ""}`} data-card>
              <Link href={`/leistungen/${s.id}`} className="rail__media" tabIndex={-1} aria-hidden="true">
                <ServiceVisual id={s.id} className="rail__img" sizes="(min-width: 1024px) 34vw, 82vw" />
              </Link>
              <p className="rail__num tech" aria-hidden="true">
                {pad(i + 1)}
              </p>
              <h3 className="rail__title">
                <Link href={`/leistungen/${s.id}`}>{s.title}</Link>
              </h3>
              <p className="rail__lead">{s.lead}</p>
              <ul className="rail__points" aria-label={`Schwerpunkte: ${s.title}`}>
                {s.points.map((p) => (
                  <li key={p} className="tech">
                    {p}
                  </li>
                ))}
              </ul>
              <div className="rail__actions">
                <Link href={`/leistungen/${s.id}`} className="btn btn--ghost btn--small" data-cursor="Ansehen">
                  Zur Leistung
                  <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 10h11M11 5l5 5-5 5" />
                  </svg>
                </Link>
                <button
                  type="button"
                  className="svc__ask"
                  onClick={() => startInquiry(s.topic, router.push)}
                  aria-label={`${s.title} anfragen`}
                >
                  Anfragen
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 5l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
