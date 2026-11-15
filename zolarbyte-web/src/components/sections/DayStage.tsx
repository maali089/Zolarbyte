"use client";

import { useEffect, useRef, useState } from "react";
import { SunArc } from "@/components/sections/SunArc";
import { TopicChips } from "@/components/sections/TopicChips";
import { Words } from "@/components/fx/Words";
import { dayPhases } from "@/lib/content";
import { daylight, dusk, formatHour, stageFocus } from "@/lib/daylight";
import { site } from "@/lib/site";

/** Stunde im Einstieg (oben auf der Seite) und am Ende der Tagesphasen. */
const START = 8;
const LAST = 21.25;
/** Sonnenaufgang beim Laden: von knapp unter dem Horizont auf START. */
const RISE_FROM = 5.6;

type LenisLike = { scrollTo: (y: number, o?: { immediate?: boolean; force?: boolean }) => void };

/**
 * Einstieg + „Ein Tag am Haus“: eine gepinnte Bühne (Sonnenbogen + 3D-Haus),
 * davor fließt der Text. Die Tageszeit hängt ausschließlich an der Scrollposition
 * (monoton: oben Morgen, unten Abend). Zieht man die Sonne, scrollt die Seite mit –
 * so gibt es keine Sprünge zwischen „freier“ und „gescrollter“ Uhrzeit.
 */
export function DayStage({ house }: { house: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const phasesRef = useRef<HTMLElement>(null);
  const scrollToHour = useRef<(h: number) => void>(() => {});
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = stageRef.current;
    const phaseEls = Array.from(phasesRef.current?.querySelectorAll<HTMLElement>("[data-phase]") ?? []);
    const hours = dayPhases.map((p) => p.hour);

    const paint = (h: number) => {
      if (!stage) return;
      const d = dusk(h);
      stage.style.setProperty("--dusk", d.toFixed(3));
      const night = d > 0.55 && window.innerWidth >= 1024;
      if (night !== stage.hasAttribute("data-night")) {
        stage.toggleAttribute("data-night", night);
        stage.dataset.ground = night ? "night" : "day";
      }
    };
    const unsub = daylight.subscribe(paint);

    /** Lesezeile: Desktop Viewport-Mitte; mobil Mitte des Textbereichs unter dem Bühnenfenster. */
    const focusFrac = () => (window.innerWidth < 1024 ? 0.73 : 0.5);

    /** Stützstellen: Dokument-Y der Lesezeile ↔ Stunde (monoton steigend). */
    const table = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const pts: Array<[number, number]> = [[vh * focusFrac(), START]];
      phaseEls.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        pts.push([sy + r.top + r.height / 2, hours[i]]);
      });
      const last = pts[pts.length - 1][0];
      pts.push([last + vh * 0.6, LAST]);
      return pts;
    };

    const hourAt = (y: number) => {
      const pts = table();
      if (y <= pts[0][0]) return pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const [y0, h0] = pts[i];
        const [y1, h1] = pts[i + 1];
        if (y <= y1) return h0 + ((y - y0) / Math.max(1, y1 - y0)) * (h1 - h0);
      }
      return pts[pts.length - 1][1];
    };

    scrollToHour.current = (h: number) => {
      const pts = table();
      let y = pts[0][0];
      for (let i = 0; i < pts.length - 1; i++) {
        const [y0, h0] = pts[i];
        const [y1, h1] = pts[i + 1];
        if (h <= h1) {
          y = y0 + ((h - h0) / Math.max(0.001, h1 - h0)) * (y1 - y0);
          break;
        }
        y = y1;
      }
      const top = Math.max(0, y - window.innerHeight * focusFrac());
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    };

    // Sonnenaufgang beim Laden, danach führt nur noch der Scroll
    let raf = 0;
    let current = reduce ? hourAt(window.scrollY + window.innerHeight * focusFrac()) : RISE_FROM;
    const t0 = performance.now();
    let intro = !reduce;
    daylight.set(current);
    paint(current);

    const loop = (t: number) => {
      raf = 0;
      const target = hourAt(window.scrollY + window.innerHeight * focusFrac());
      if (intro) {
        const k = Math.min(1, (t - t0) / 1800);
        const e = 1 - Math.pow(1 - k, 3);
        const introHour = RISE_FROM + (target - RISE_FROM) * e;
        current = Math.max(introHour, Math.min(current, target));
        current = introHour;
        if (k >= 1) intro = false;
      } else {
        current += (target - current) * (reduce ? 1 : 0.18);
      }
      daylight.set(current);
      if (intro || Math.abs(target - current) > 0.002) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);

    // Aktive Phase → Text-Hervorhebung + 3D-Fokus
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.phase);
          setActive(i);
          stageFocus.set(i >= 0 ? dayPhases[i].focus : "overview");
        }
      },
      { rootMargin: window.innerWidth < 1024 ? "-66% 0px -20% 0px" : "-40% 0px -40% 0px" },
    );
    phaseEls.forEach((el) => io.observe(el));
    const heroEl = stage?.querySelector<HTMLElement>(".hero");
    const heroIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(-1);
          stageFocus.set("overview");
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    if (heroEl) heroIo.observe(heroEl);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      unsub();
      io.disconnect();
      heroIo.disconnect();
      stageFocus.set("overview");
    };
  }, []);

  return (
    <div className="stage" ref={stageRef} data-ground="day">
      <div className="stage__pin">
        <div className="stage__ground" aria-hidden="true" />
        <div className="stage__arc">
          <SunArc initialHour={RISE_FROM} onUserSet={(h) => scrollToHour.current(h)} />
        </div>
        <div className="stage__house">{house}</div>
      </div>

      <div className="stage__flow container">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero__title display">
            <Words text={"Vom Dach bis\nzur Steckdose."} accent={["Steckdose"]} delay={150} />
          </h1>
          <p className="hero__lead lead" data-reveal style={{ "--i": 4 } as React.CSSProperties}>
            Photovoltaik, Wärmepumpe und Speicher als ein System – geplant und angeschlossen vom
            Elektrotechnik-Meisterbetrieb aus Karlsfeld bei München.
          </p>
          <div className="hero__start" data-reveal style={{ "--i": 6 } as React.CSSProperties}>
            <p id="hero-start" className="hero__start-label">
              Womit können wir helfen?
            </p>
            <TopicChips labelledBy="hero-start" />
          </div>
          <p className="hero__call" data-reveal style={{ "--i": 8 } as React.CSSProperties}>
            Lieber direkt sprechen?{" "}
            <a href={site.general.phoneHref} className="link-line" data-cursor="Anrufen">
              {site.general.phone}
            </a>
          </p>
        </section>

        <section id="tag" className="day" ref={phasesRef} aria-labelledby="tag-title">
          <h2 id="tag-title" className="day__title h2">
            <Words text={"Ein Tag,\nein Stromkreis."} />
          </h2>
          <ol className="day__phases">
            {dayPhases.map((ph, i) => (
              <li key={ph.title} className={`day__phase${active === i ? " is-active" : ""}`} data-phase={i}>
                <div className="day__row">
                  <p className="day__time tech">
                    <span className="day__time-dot" aria-hidden="true" />
                    <span>{formatHour(ph.hour)}</span>
                  </p>
                  <h3 className="day__phase-title h3">{ph.title}</h3>
                  <p className="day__phase-text">{ph.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
