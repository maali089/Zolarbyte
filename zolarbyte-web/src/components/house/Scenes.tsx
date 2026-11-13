import { ANCHORS, CROPS, HERO, HERO_ANCHORS } from "./geometry";
import { HouseSvg, HOUSE_RATIO } from "./HouseSvg";
import { HeroHouse } from "./HeroHouse";
import { EnergyExplorer } from "./EnergyExplorer";
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
