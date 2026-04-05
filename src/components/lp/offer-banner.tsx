"use client";

import { useEffect, useState } from "react";
import { LineIcon } from "./line-icon";
import { trackLineAddClick } from "@/lib/analytics";

type Props = {
  text: string;
  lineUrl: string | null;
  ctaLabel: string;
  staffId: string;
  staffSlug: string;
};

export function OfferBanner({ text, lineUrl, ctaLabel, staffId, staffSlug }: Props) {
  const storageKey = `lp_offer_dismissed_${staffId}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey)) return;

    const timer = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(timer);
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-lg"
            style={{ backgroundColor: "var(--lp-primary)" }}
          >
            🎁
          </div>
          <p className="flex-1 text-sm font-bold leading-snug text-gray-800">
            {text}
          </p>
          <button
            onClick={dismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition hover:bg-gray-200"
            aria-label="閉じる"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* LINE ボタン */}
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { dismiss(); trackLineAddClick(staffSlug); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#05b04c]"
          >
            <LineIcon className="h-4.5 w-4.5" />
            {ctaLabel}
          </a>
        )}

        <p className="mt-3 text-center text-[10px] text-gray-400">
          ※ このメッセージは1度のみ表示されます
        </p>
      </div>
    </div>
  );
}
