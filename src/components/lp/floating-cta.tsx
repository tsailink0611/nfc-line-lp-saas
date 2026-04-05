"use client";

import { useEffect, useState } from "react";
import { LineIcon } from "./line-icon";
import { trackLineAddClick } from "@/lib/analytics";

type Props = {
  lineUrl: string | null;
  ctaLabel: string;
  staffSlug: string;
};

export function FloatingCta({ lineUrl, ctaLabel, staffSlug }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!lineUrl) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 px-4 py-3 shadow-[0_-2px_20px_rgba(0,0,0,0.1)] backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] py-3.5 font-bold text-white shadow-lg transition hover:bg-[#05b04c]"
        onClick={() => trackLineAddClick(staffSlug)}
      >
        <LineIcon className="h-5 w-5" />
        {ctaLabel}
      </a>
    </div>
  );
}
