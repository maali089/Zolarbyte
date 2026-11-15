import type { Metadata } from "next";
import { ClosingInquiry, FaqList, JsonLd, PageHead } from "@/components/sections/Blocks";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Häufige Fragen",
  description:
    "Antworten zu Meisterbetrieb, Photovoltaik, elektrischen Prüfungen und Ihrer Anfrage bei Zolarbyte, dem Elektrotechnik-Meisterbetrieb in Karlsfeld bei München.",
  alternates: { canonical: "/fragen" },
};

export default function FragenPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <PageHead
        title={"Kurz\nbeantwortet."}
        lead="Was Kundinnen und Kunden uns vor einer Anfrage am häufigsten fragen."
        crumbs={[{ href: "/fragen", label: "Fragen" }]}
      />
      <section className="section faq" aria-label="Fragen und Antworten" data-ground="day">
        <div className="container faq__grid faq__grid--page">
          <FaqList items={faqs} />
        </div>
      </section>
      <ClosingInquiry />
    </>
  );
}
