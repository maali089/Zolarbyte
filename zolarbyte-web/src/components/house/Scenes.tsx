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
    id: "pv",
    name: "Photovoltaik",
    short: "Strom vom eigenen Dach",
    deliverables: svc("photovoltaik").deliverables,
    more: { href: "/photovoltaik", label: "Mehr zur Photovoltaik" },
    ask: { href: "/kontakt?interesse=photovoltaik#anfrage", label: "Photovoltaik anfragen" },
    text: {
      day: {
        title: "Die Module erzeugen Gleichstrom",
        text: "Der Strom läuft über jedes Modul zum Wechselrichter im Technikraum. Dort wird er zu Wechselstrom für das Hausnetz und versorgt zuerst Ihre Verbraucher. Was übrig bleibt, lädt den Speicher oder geht ins Netz.",
      },
      evening: {
        title: "Ohne Sonne keine Erzeugung",
        text: "Abends und nachts liefern die Module keinen Strom. Dann übernehmen – sofern vorhanden – der Speicher oder das öffentliche Netz die Versorgung.",
      },
    },
  },
  {
    id: "storage",
    name: "Stromspeicher",
    short: "Solarstrom für den Abend",
    deliverables: svc("stromspeicher").deliverables,
    more: { href: "/stromspeicher", label: "Mehr zum Stromspeicher" },
    ask: { href: "/kontakt?interesse=stromspeicher#anfrage", label: "Speicher anfragen" },
    text: {
      day: {
        title: "Überschuss für später",
        text: "Erzeugt die Anlage mehr, als im Haus gerade gebraucht wird, lädt der Speicher neben Wechselrichter und Zählerschrank. Größe und Technik richten sich nach Ihrem Verbrauch und der Anlage.",
      },
      evening: {
        title: "Solarstrom zeitversetzt nutzen",
        text: "Am Abend gibt der Speicher den gespeicherten Strom an das Haus ab. Ist er leer, kommt der Strom wie gewohnt aus dem Netz. Eine Ersatzstromfunktion bei Netzausfall ist eine eigene Option und nicht bei jedem Speicher vorhanden.",
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
        title: "Strom plus Umweltwärme",
        text: "Die Außeneinheit nimmt Wärme aus der Luft auf und bringt sie mit Hilfe von Strom auf Heiztemperatur – für Heizung und Warmwasser. Tagsüber kann ein Teil dieses Stroms vom eigenen Dach kommen.",
      },
      evening: {
        title: "Heizen auch am Abend",
        text: "Die Wärmepumpe arbeitet weiter und bezieht ihren Strom dann aus dem Speicher oder aus dem Netz. Wie gut sie im Gebäude arbeitet, hängt von Heizlast und Wärmeverteilung ab – das prüfen wir vorher.",
      },
    },
  },
  {
    id: "wb",
    name: "Wallbox",
    short: "Laden an der Garage",
    more: { href: "/elektrotechnik#e-mobilitaet", label: "Mehr zur E-Mobilität" },
    ask: { href: "/kontakt?interesse=elektrotechnik#anfrage", label: "Wallbox anfragen" },
    text: {
      day: {
        title: "Laden mit Strom vom Dach",
        text: "Die Wallbox sitzt an der Garagenwand neben dem Stellplatz und ist an den Zählerschrank angebunden. Tagsüber kann das Auto Solarstrom laden. Eine Wallbox muss beim Netzbetreiber angemeldet werden – wir sagen Ihnen, was dafür nötig ist.",
      },
      evening: {
        title: "Laden am Abend",
        text: "Abends kommt der Ladestrom aus dem Speicher oder aus dem Netz. Ein Energiemanagement kann das Laden auf Zeiten mit Solarüberschuss legen, wenn das Auto tagsüber zu Hause steht.",
      },
    },
  },
  {
    id: "all",
    name: "Zusammenspiel",
    short: "Alles am Zählerschrank",
    more: { href: "/meisterbetrieb", label: "Warum Meisterbetrieb" },
    ask: { href: "/kontakt?interesse=kombination#anfrage", label: "Kombination anfragen" },
    text: {
      day: {
        title: "Ein abgestimmtes System",
        text: "Photovoltaik erzeugt, der Speicher puffert, die Wärmepumpe macht aus Strom und Umweltwärme Heizwärme, die Wallbox lädt das Auto. Der Zählerschrank verbindet alles mit dem Hausnetz – elektrisch geplant und angeschlossen vom Meisterbetrieb.",
      },
      evening: {
        title: "Ein abgestimmtes System – am Abend",
        text: "Der Speicher versorgt Haushalt und Wärmepumpe, solange er geladen ist. Danach bleibt das Netz die Reserve. Eine vollständige Unabhängigkeit vom Stromnetz übers ganze Jahr ist bei Wohnhäusern in der Regel nicht realistisch.",
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
