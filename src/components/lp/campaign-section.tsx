"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Campaign } from "@/types/database";
import { SectionHeading } from "./section-heading";

type Props = {
  campaigns: Campaign[];
};

function getCampaignBadge(campaign: Campaign): string | null {
  if (!campaign.start_date && !campaign.end_date) return null;
  const now = new Date();
  const start = campaign.start_date ? new Date(campaign.start_date) : null;
  const end = campaign.end_date ? new Date(campaign.end_date) : null;
  if (end && now > end) return null;
  if (start && now >= start) return "開催中";
  if (start && now < start) return "受付中";
  return null;
}

export function CampaignSection({ campaigns }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // 自動スクロール
  useEffect(() => {
    if (campaigns.length <= 1) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const next = (activeIdx + 1) % campaigns.length;
      const child = el.children[next] as HTMLElement | undefined;
      if (child) {
        el.scrollTo({ left: child.offsetLeft - 16, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIdx, campaigns.length]);

  // スクロール位置監視
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.clientWidth / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIdx(closest);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (campaigns.length === 0) return null;

  return (
    <section className="py-10" style={{ backgroundColor: "var(--lp-cream)" }}>
      <div className="px-6 sm:px-8">
        <SectionHeading title="キャンペーン" />
      </div>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:px-8"
        style={{ scrollbarWidth: "none" }}
      >
        {campaigns.map((campaign) => {
          const badge = getCampaignBadge(campaign);
          return (
            <div
              key={campaign.id}
              className="w-[280px] shrink-0 snap-center overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[300px]"
            >
              {campaign.image_url ? (
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={campaign.image_url}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  {badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow">
                      {badge}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative flex h-40 items-center justify-center" style={{ background: "linear-gradient(135deg, var(--lp-primary), var(--lp-secondary))" }}>
                  <span className="text-2xl font-bold text-white/30">Campaign</span>
                  {badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow">
                      {badge}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{campaign.title}</h3>
                {campaign.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{campaign.summary}</p>
                )}
                {campaign.link_url && (
                  <a
                    href={campaign.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium transition hover:opacity-70"
                    style={{ color: "var(--lp-secondary)" }}
                  >
                    詳細を見る &rarr;
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ドットページネーション */}
      {campaigns.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {campaigns.map((_, i) => (
            <button
              key={i}
              aria-label={`キャンペーン ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === activeIdx ? "w-6" : "w-2 bg-gray-300"}`}
              style={i === activeIdx ? { backgroundColor: "var(--lp-secondary)" } : undefined}
              onClick={() => {
                const el = scrollRef.current;
                const child = el?.children[i] as HTMLElement | undefined;
                if (el && child) el.scrollTo({ left: child.offsetLeft - 16, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
