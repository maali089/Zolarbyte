import type { Metadata } from "next";
import { EnergyServicePage } from "@/components/EnergyServicePage";

export const metadata: Metadata = {
  title: "Photovoltaik",
  description: "Photovoltaik-Anlagen planen, montieren und elektrisch anschließen lassen – vom Elektrotechnik-Meisterbetrieb Zolarbyte aus Karlsfeld bei München.",
  alternates: { canonical: "/photovoltaik" },
};

export default function Page() {
  return <EnergyServicePage id="photovoltaik" />;
}
