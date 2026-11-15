import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryAssistant } from "@/components/assistant/InquiryAssistant";
import { INQUIRY_TOPICS } from "@/components/assistant/topics";
import { getMailConfig } from "@/lib/mail";
import { isPreview } from "@/lib/site";

export const metadata: Metadata = {
  title: "Anfrage-Assistent – Labor (intern)",
  robots: { index: false, follow: false },
};

export default function AnfrageLaborPage() {
  // Nur in der internen Vorschau erreichbar
  if (!isPreview) notFound();
  const { configured } = getMailConfig();

  return (
    <main id="main">
      <section style={{ background: "#f1f2ee", color: "#15171c", padding: "64px clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.25rem" }}>Labor: Anfrage-Assistent, Ton „day“ (Kalk)</h1>
          <p style={{ margin: "0 0 40px" }}>
            Interne Vorschau. Einstiege testen: <code>?anliegen=wallbox</code> oder Event <code>zb:inquiry</code>. Slugs:{" "}
            {INQUIRY_TOPICS.map((t) => t.slug).join(", ")}.
          </p>
          <InquiryAssistant mailConfigured={configured} previewNote={isPreview} tone="day" />
        </div>
      </section>
      <section style={{ background: "#17121f", color: "#f3eff5", padding: "64px clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 40px", fontSize: "1.25rem" }}>Labor: Anfrage-Assistent, Ton „night“ (Nacht)</h2>
          <InquiryAssistant mailConfigured={configured} previewNote={isPreview} tone="night" initialTopic="wallbox" />
        </div>
      </section>
    </main>
  );
}
