/**
 * Partner (vom Auftraggeber bestätigt, 13.11.2026).
 * Logos stammen von den offiziellen Websites – Quellen: docs/partner-logos.md.
 * `ratio` = Breite/Höhe des Logos, daraus wird eine gleichmäßige optische Größe berechnet.
 * `tile`: helle Kachel (Standard) oder dunkle Kachel für Logos, die es offiziell nur in Weiß gibt.
 */
export type Partner = {
  name: string;
  href: string;
  logo: string;
  ratio: number;
  tile?: "light" | "dark" | "navy";
};

export const PARTNERS: Partner[] = [
  { name: "AIKO", href: "https://aikosolar.com/de/", logo: "/partners/aiko.svg", ratio: 3.81, tile: "dark" },
  { name: "Jolywood", href: "https://www.jolywood.com/en/", logo: "/partners/jolywood.png", ratio: 6.46 },
  { name: "Solar Fabrik", href: "https://solar-fabrik.de/", logo: "/partners/solar-fabrik.png", ratio: 1 },
  { name: "Sigenergy", href: "https://www.sigenergy.com/de", logo: "/partners/sigenergy.webp", ratio: 5.14, tile: "dark" },
  { name: "Huawei", href: "https://www.huawei.com/de/", logo: "/partners/huawei.svg", ratio: 4.58 },
  { name: "K2 Systems", href: "https://k2-systems.com/", logo: "/partners/k2-systems.svg", ratio: 1 },
  { name: "SL Rack", href: "https://www.sl-rack.com/", logo: "/partners/sl-rack.svg", ratio: 2.32 },
  { name: "Fronius", href: "https://www.fronius.com/de-de/germany", logo: "/partners/fronius.webp", ratio: 3.51 },
  {
    name: "Bosch Home Comfort",
    href: "https://www.bosch-homecomfort.com/de/de/wohngebaeude/start/",
    logo: "/partners/bosch.svg",
    ratio: 4.46,
  },
  { name: "Vaillant", href: "https://www.vaillant.de/", logo: "/partners/vaillant.svg", ratio: 3.78 },
  { name: "Viessmann", href: "https://www.viessmann.de/", logo: "/partners/viessmann.svg", ratio: 4.74 },
  { name: "Buderus", href: "https://www.buderus.de/de", logo: "/partners/buderus.svg", ratio: 4.93, tile: "navy" },
  { name: "SpotmyEnergy", href: "https://spotmyenergy.de/", logo: "/partners/spotmyenergy.png", ratio: 2.53 },
  { name: "Solar Manager", href: "https://www.solarmanager.ch/", logo: "/partners/solar-manager.svg", ratio: 1.27 },
];

/** Gleiche optische Fläche für alle Logos: Breite ∝ √ratio, Höhe ∝ 1/√ratio, begrenzt */
export function logoSize(ratio: number, k = 62) {
  let w = k * Math.sqrt(ratio);
  let h = k / Math.sqrt(ratio);
  if (w > 150) {
    w = 150;
    h = w / ratio;
  }
  if (h > 58) {
    h = 58;
    w = h * ratio;
  }
  return { w: Math.round(w), h: Math.round(h) };
}
