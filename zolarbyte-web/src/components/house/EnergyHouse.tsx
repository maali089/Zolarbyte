"use client";

import { useEffect, useState } from "react";
import { daylight, dusk, stageFocus, type StageFocus } from "@/lib/daylight";
import { HouseScene } from "./HouseScene";

/**
 * Energiehaus der Startseiten-Bühne: Kamera folgt der aktiven Tagesphase,
 * die Scroll-Tageszeit schaltet Abendlicht und Flussrichtung (--dusk kommt von .stage).
 */
export function EnergyHouse() {
  const [focus, setFocus] = useState<StageFocus>(() => stageFocus.get());
  const [evening, setEvening] = useState(() => dusk(daylight.get()) > 0.5);

  useEffect(() => {
    const unFocus = stageFocus.subscribe(setFocus);
    const unDay = daylight.subscribe((h) => setEvening(dusk(h) > 0.5));
    return () => {
      unFocus();
      unDay();
    };
  }, []);

  return <HouseScene view={focus} time={evening ? "evening" : "day"} tags intro className="ehouse--stage" />;
}
