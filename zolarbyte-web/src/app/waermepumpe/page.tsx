import type { Metadata } from "next";
import { EnergyServicePage } from "@/components/EnergyServicePage";

export const metadata: Metadata = {
  title: "Wärmepumpe",
  description: "Wärmepumpe planen und elektrisch einbinden – mit Prüfung von Gebäude und Heizsystem und Förderrechner für die KfW-Heizungsförderung.",
  alternates: { canonical: "/waermepumpe" },
};

export default function Page() {
  return <EnergyServicePage id="waermepumpe" />;
}
