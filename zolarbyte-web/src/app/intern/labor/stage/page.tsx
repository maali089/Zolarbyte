import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isPreview } from "@/lib/site";
import { StageLabFromQuery } from "@/components/stage/StageLab";

export const metadata: Metadata = {
  title: "Labor – Hausmodell (intern)",
  robots: { index: false, follow: false },
};

export default function StageLabPage() {
  // Nur in der internen Vorschau erreichbar
  if (!isPreview) notFound();
  return (
    <Suspense fallback={null}>
      <StageLabFromQuery />
    </Suspense>
  );
}
