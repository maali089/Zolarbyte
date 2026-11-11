"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Anchor = { left: number; top: number };
type Focus = "pv" | "storage" | "heat" | "all";
type Time = "day" | "evening";

const MODES: Array<{ id: Focus; label: string }> = [
  { id: "pv", label: "Strom erzeugen" },
  { id: "storage", label: "Strom speichern" },
  { id: "heat", label: "Effizient heizen" },
  { id: "all", label: "Zusammenspiel" },
];

const TEXT: Record<Focus, Record<Time, { title: string; text: string }>> = {
  pv: {
    day: {
      title: "Die Module erzeugen Gleichstrom",
      text: "Der Wechselrichter wandelt ihn in Wechselstrom für das Hausnetz. Über die Verteilung im Zählerschrank versorgt er zuerst Ihre Verbraucher. Was übrig bleibt, kann gespeichert oder ins Netz eingespeist werden.",
    },
    evening: {
      title: "Ohne Sonne keine Erzeugung",
      text: "Abends und nachts liefern die Module keinen Strom. Dann übernehmen – sofern vorhanden – der Speicher oder das öffentliche Netz die Versorgung.",
    },
  },
  storage: {
    day: {
      title: "Überschuss für später",
      text: "Erzeugt die Anlage mehr, als im Haus gerade gebraucht wird, lädt der Speicher. Größe und Technik richten sich nach Ihrem Verbrauch und der Anlage.",
    },
    evening: {
      title: "Solarstrom zeitversetzt nutzen",
      text: "Am Abend gibt der Speicher den gespeicherten Strom an das Haus ab. Ist er leer, kommt der Strom wie gewohnt aus dem Netz. Eine Ersatzstromfunktion bei Netzausfall ist eine eigene Option und nicht bei jedem Speicher vorhanden.",
    },
  },
  heat: {
    day: {
      title: "Strom plus Umweltwärme",
      text: "Die Wärmepumpe nimmt Wärme aus der Außenluft auf und bringt sie mit Hilfe von Strom auf Heiztemperatur – für Heizung und Warmwasser. Tagsüber kann ein Teil dieses Stroms vom eigenen Dach kommen.",
    },
    evening: {
      title: "Heizen auch am Abend",
      text: "Die Wärmepumpe arbeitet weiter und bezieht ihren Strom dann aus dem Speicher oder aus dem Netz. Wie gut sie im Gebäude arbeitet, hängt von Heizlast und Wärmeverteilung ab – das prüfen wir vorher.",
    },
  },
  all: {
    day: {
      title: "Ein abgestimmtes System",
      text: "Photovoltaik erzeugt, der Speicher puffert, die Wärmepumpe macht aus Strom und Umweltwärme Heizwärme. Der Zählerschrank verbindet alles mit dem Hausnetz – elektrisch geplant und angeschlossen vom Meisterbetrieb.",
    },
    evening: {
      title: "Ein abgestimmtes System – am Abend",
      text: "Der Speicher versorgt Haushalt und Wärmepumpe, solange er geladen ist. Danach bleibt das Netz die Reserve. Eine vollständige Unabhängigkeit vom Stromnetz übers ganze Jahr ist bei Wohnhäusern in der Regel nicht realistisch.",
    },
  },
};

const LINKS: Record<Focus, { href: string; label: string }> = {
  pv: { href: "/photovoltaik", label: "Mehr zur Photovoltaik" },
  storage: { href: "/stromspeicher", label: "Mehr zum Stromspeicher" },
  heat: { href: "/waermepumpe", label: "Mehr zur Wärmepumpe" },
  all: { href: "/kontakt?interesse=kombination", label: "Kombination anfragen" },
};

/** off = Versatz der Beschriftung in % (nur senkrecht ODER waagerecht, mit Führungslinie) */
type Spot = { key: string; label: string; focus: Focus; at: Anchor; off: { dx: number; dy: number } };

export function EnergyExplorer({
  children,
  ratio,
  anchors,
}: {
  children: React.ReactNode;
  ratio: string;
  anchors: Record<"pv" | "inverter" | "dist" | "battery" | "hp" | "house" | "grid" | "env", Anchor>;
}) {
  const [focus, setFocus] = useState<Focus>("all");
  const [time, setTime] = useState<Time>("day");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const spots: Spot[] = [
    { key: "pv", label: "PV-Module", focus: "pv", at: anchors.pv, off: { dx: 0, dy: 0 } },
    { key: "inv", label: "Wechselrichter", focus: "pv", at: anchors.inverter, off: { dx: 0, dy: -19 } },
    { key: "dist", label: "Zählerschrank", focus: "all", at: anchors.dist, off: { dx: 0, dy: 20 } },
    { key: "bat", label: "Stromspeicher", focus: "storage", at: anchors.battery, off: { dx: 9, dy: 0 } },
    { key: "hp", label: "Wärmepumpe", focus: "heat", at: anchors.hp, off: { dx: 0, dy: 14 } },
  ];

  const info = TEXT[focus][time];
  const link = LINKS[focus];

  return (
    <div className="explorer">
      <div className="explorer__controls">
        <div className="seg" role="group" aria-label="Was möchten Sie sehen?">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="seg__btn"
              aria-pressed={focus === m.id}
              onClick={() => setFocus(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="seg seg--time" role="group" aria-label="Tageszeit der Darstellung">
          <button type="button" className="seg__btn" aria-pressed={time === "day"} onClick={() => setTime("day")}>
            Tagsüber
          </button>
          <button
            type="button"
            className="seg__btn"
            aria-pressed={time === "evening"}
            onClick={() => setTime("evening")}
          >
            Abends
          </button>
        </div>
      </div>

      <div className="explorer__stage">
        <div ref={ref} className="house house--explorer" data-focus={focus} data-time={time} style={{ aspectRatio: ratio }}>
          {children}
          {spots.map((s) =>
            s.off.dx || s.off.dy ? (
              <span key={`${s.key}-lead`} aria-hidden="true">
                <span className="spot__anchor" style={{ left: `${s.at.left}%`, top: `${s.at.top}%` }} />
                <span
                  className="spot__leader"
                  style={{
                    left: `${s.at.left + Math.min(0, s.off.dx)}%`,
                    top: `${s.at.top + Math.min(0, s.off.dy)}%`,
                    width: s.off.dx ? `${Math.abs(s.off.dx)}%` : "1px",
                    height: s.off.dy ? `${Math.abs(s.off.dy)}%` : "1px",
                  }}
                />
              </span>
            ) : null,
          )}
          {spots.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`spot${s.focus === focus && focus !== "all" ? " is-active" : ""}`}
              style={{ left: `${s.at.left + s.off.dx}%`, top: `${s.at.top + s.off.dy}%` }}
              onClick={() => setFocus(s.focus)}
              aria-label={`${s.label} – Erklärung anzeigen`}
            >
              <span className="spot__dot" aria-hidden="true">
                {i + 1}
              </span>
              <span className="spot__label" aria-hidden="true">
                {s.label}
              </span>
            </button>
          ))}
          <span className="house__note house__note--heat" style={{ left: `${anchors.env.left}%`, top: `${anchors.env.top}%` }} aria-hidden="true">
            Umweltwärme
          </span>
        </div>

        <ol className="explorer__list">
          {spots.map((s, i) => (
            <li key={s.key}>
              <button type="button" onClick={() => setFocus(s.focus)}>
                <span aria-hidden="true">{i + 1}</span> {s.label}
              </button>
            </li>
          ))}
        </ol>

        <aside className="explorer__panel" aria-live="polite">
          <p className="explorer__kicker">{time === "day" ? "Tagsüber" : "Abends"} · Beispielhafte Darstellung</p>
          <h3 className="explorer__title">{info.title}</h3>
          <p className="explorer__text">{info.text}</p>
          <Link href={link.href} className="text-link">
            {link.label}
          </Link>
          <ul className="legend" aria-label="Legende">
            <li>
              <span className="legend__line legend__line--power" aria-hidden="true" />
              Strom
            </li>
            <li>
              <span className="legend__line legend__line--heat" aria-hidden="true" />
              Wärme
            </li>
            <li>
              <span className="legend__line legend__line--grid" aria-hidden="true" />
              Netz ({time === "day" ? "Einspeisung möglich" : "Bezug möglich"})
            </li>
          </ul>
          <p className="explorer__disclaimer">
            Schematische Darstellung ohne Messwerte. Welche Kombination für Ihr Haus sinnvoll ist, klären wir in der
            Beratung.
          </p>
        </aside>
      </div>

    </div>
  );
}
