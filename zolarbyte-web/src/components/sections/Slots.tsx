import { InquiryAssistant } from "@/components/assistant/InquiryAssistant";
import { HouseStageLazy } from "@/components/stage/HouseStageLazy";
import { getMailConfig } from "@/lib/mail";
import { isPreview } from "@/lib/site";

/** 3D-Hausmodell (lädt verzögert, mit SVG-Poster als Fallback). */
export function HouseSlot() {
  return <HouseStageLazy className="house" />;
}

/** Anfrage-Assistent mit serverseitig ermitteltem Versandstatus. */
export function InquirySlot({ tone = "night", initialTopic }: { tone?: "day" | "night"; initialTopic?: string }) {
  const { configured } = getMailConfig();
  return (
    <InquiryAssistant mailConfigured={configured} previewNote={isPreview} tone={tone} initialTopic={initialTopic} />
  );
}
