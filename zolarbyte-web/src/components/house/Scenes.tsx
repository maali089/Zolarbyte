import { ANCHORS, CROPS, HERO, HERO_ANCHORS, VIEWS, VIEW_MARKERS } from "./geometry";
import { HouseSvg, HOUSE_RATIO } from "./HouseSvg";
import { HeroHouse } from "./HeroHouse";
import { EnergyExplorer } from "./EnergyExplorer";
import { EnergyHouse, type PartInfo } from "./EnergyHouse";
import { energyServices } from "@/lib/content";
import "./house.css";

const LABEL =
  "Beispielhafte Darstellung eines Wohnhauses mit Photovoltaik auf dem Dach, Wärmepumpe vor dem Haus, einem Technikraum im Schnitt mit Zählerschrank, Wechselrichter und Stromspeicher sowie einer Garage mit Wallbox, an der ein Auto lädt. Linien zeigen, wie Strom und Wärme fließen.";

/** Energiehaus im Einstieg (Server-Teil, Geometrie wird hier erzeugt) */
export function HeroHouseScene() {
  return (
    <HeroHouse ratio={HERO.ratio} houseStart={HERO.houseStart} anchors={HERO_ANCHORS}>
      <HouseSvg id="hh-" label={LABEL} viewBox={HERO.viewBox} backdrop />
    </HeroHouse>
  );
}

/** Interaktive Erklärung des Zusammenspiels */
export function ExplorerScene() {
  return (
    <EnergyExplorer ratio={HOUSE_RATIO} anchors={ANCHORS}>
      <HouseSvg id="hx-" label={LABEL} />
    </EnergyExplorer>
  );
}

const CROP_LABEL: Record<keyof typeof CROPS, string> = {
  photovoltaik: "Detail: Photovoltaik-Module auf dem Dach.",
  waermepumpe: "Detail: Außeneinheit einer Luft-Wasser-Wärmepumpe vor der Fassade.",
  stromspeicher: "Detail: Technikraum mit Zählerschrank, Wechselrichter und Batteriespeicher.",
};

/** Ruhiger Detailausschnitt derselben Szene */
export function HouseDetail({ part }: { part: keyof typeof CROPS }) {
  const [, , w, h] = CROPS[part].split(" ").map(Number);
  return (
    <div className="house house--detail" data-part={part} style={{ aspectRatio: `${w} / ${h}` }}>
      <HouseSvg id={`hd-${part}-`} label={CROP_LABEL[part]} viewBox={CROPS[part]} />
    </div>
  );
}

const svc = (id: "photovoltaik" | "waermepumpe" | "stromspeicher") => energyServices.find((s) => s.id === id)!;

const PARTS: PartInfo[] = [
  {
    id: "all",
    name: "Ihr Energiehaus",
    short: "Alles am Zählerschrank",
    more: { href: "/meisterbetrieb", label: "Warum Meisterbetrieb" },
    ask: { href: "/kontakt?interesse=kombination#anfrage", label: "Kombination anfragen" },
    text: {
      day: {
        title: "Vier Bausteine, ein Anschluss.",
        text: "Dach erzeugt, Speicher puffert, Wärmepumpe heizt, Wallbox lädt – verbunden über den Zählerschrank.",
      },
      evening: {
        title: "Abends übernimmt der Speicher.",
        text: "Ist er leer, liefert das Netz. Völlige Unabhängigkeit übers ganze Jahr ist bei Wohnhäusern in der Regel nicht realistisch.",
      },
    },
  },
  {
    id: "pv",
    name: "Photovoltaik",
    short: "Strom vom Dach",
    deliverables: svc("photovoltaik").deliverables,
    more: { href: "/photovoltaik", label: "Mehr zur Photovoltaik" },
    ask: { href: "/kontakt?interesse=photovoltaik#anfrage", label: "Anfragen" },
    text: {
      day: {
        title: "Jedes Modul liefert mit.",
        text: "Der Strom läuft über alle Module zum Wechselrichter und versorgt zuerst Ihr Haus.",
      },
      evening: {
        title: "Ohne Sonne keine Erzeugung.",
        text: "Nachts liefern die Module nichts – dann übernehmen Speicher oder Netz.",
      },
    },
  },
  {
    id: "storage",
    name: "Stromspeicher",
    short: "Solarstrom für den Abend",
    deliverables: svc("stromspeicher").deliverables,
    more: { href: "/stromspeicher", label: "Mehr zum Speicher" },
    ask: { href: "/kontakt?interesse=stromspeicher#anfrage", label: "Anfragen" },
    text: {
      day: {
        title: "Mittags laden.",
        text: "Überschuss vom Dach lädt den Speicher im Technikraum – passend zu Ihrem Verbrauch ausgelegt.",
      },
      evening: {
        title: "Abends nutzen.",
        text: "Der Speicher gibt den Solarstrom ans Haus ab. Ersatzstrom bei Netzausfall ist eine eigene Option.",
      },
    },
  },
  {
    id: "heat",
    name: "Wärmepumpe",
    short: "Heizen mit Umweltwärme",
    deliverables: svc("waermepumpe").deliverables,
    more: { href: "/waermepumpe", label: "Mehr zur Wärmepumpe" },
    ask: { href: "/foerderrechner", label: "Förderung berechnen" },
    text: {
      day: {
        title: "Luft rein, Wärme raus.",
        text: "Aus Umweltwärme und Strom wird Heizwärme und Warmwasser – tagsüber teils mit Strom vom Dach.",
      },
      evening: {
        title: "Heizt auch abends.",
        text: "Dann kommt der Strom aus Speicher oder Netz. Heizlast und Heizflächen prüfen wir vorher.",
      },
    },
  },
  {
    id: "wb",
    name: "Wallbox",
    short: "Laden an der Garage",
    more: { href: "/elektrotechnik#e-mobilitaet", label: "Mehr zur E-Mobilität" },
    ask: { href: "/kontakt?interesse=elektrotechnik#anfrage", label: "Anfragen" },
    text: {
      day: {
        title: "Solarstrom tanken.",
        text: "Wallbox an der Garagenwand, angebunden an den Zählerschrank und beim Netzbetreiber angemeldet.",
      },
      evening: {
        title: "Laden am Abend.",
        text: "Dann aus Speicher oder Netz. Ein Energiemanagement legt das Laden auf Solarüberschuss.",
      },
    },
  },
];

/** Energiehaus mit Kamerafahrt zu den Bausteinen */
export function EnergyHouseScene() {
  return (
    <EnergyHouse views={VIEWS} markers={VIEW_MARKERS} parts={PARTS}>
      <HouseSvg id="he-" label={LABEL} viewBox={VIEWS.all} />
    </EnergyHouse>
  );
}
