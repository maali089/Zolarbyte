import { InquiryAssistant } from "@/components/assistant/InquiryAssistant";
import { EnergyHouse } from "@/components/house/EnergyHouse";
import { getMailConfig } from "@/lib/mail";
import { isPreview } from "@/lib/site";

/** Isometrisches Energiehaus der Bühne (SVG, Kamera folgt der Tagesphase). */
export function HouseSlot() {
  return <EnergyHouse />;
}

/** Anfrage-Assistent mit serverseitig ermitteltem Versandstatus. */
export function InquirySlot({ tone = "night", initialTopic }: { tone?: "day" | "night"; initialTopic?: string }) {
  const { configured } = getMailConfig();
  return (
    <InquiryAssistant mailConfigured={configured} previewNote={isPreview} tone={tone} initialTopic={initialTopic} />
  );
}
