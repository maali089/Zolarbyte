"use client";

import { useRouter } from "next/navigation";
import { startInquiry } from "@/components/sections/TopicChips";
import { Magnetic } from "@/components/motion/Magnetic";

/** Primäre Aktion: startet den Assistenten mit vorgewähltem Anliegen. */
export function StartButton({ topic, label = "Anfrage starten" }: { topic: string; label?: string }) {
  const router = useRouter();
  return (
    <Magnetic strength={0.2}>
      <button type="button" className="btn btn--primary" onClick={() => startInquiry(topic, router.push)}>
        {label}
        <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 10h11M11 5l5 5-5 5" />
        </svg>
      </button>
    </Magnetic>
  );
}
