import type { Metadata } from "next";
import { EnergyServicePage } from "@/components/EnergyServicePage";

export const metadata: Metadata = {
  title: "Stromspeicher",
  description: "Stromspeicher passend zu Verbrauch und PV-Anlage auslegen, nachrüsten und installieren – vom Elektrotechnik-Meisterbetrieb Zolarbyte.",
  alternates: { canonical: "/stromspeicher" },
};

export default function Page() {
  return <EnergyServicePage id="stromspeicher" />;
}
