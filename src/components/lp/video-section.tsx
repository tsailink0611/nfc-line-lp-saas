"use client";

import { useState } from "react";
import { FadeUp } from "./fade-up";
import { SectionHeading } from "./section-heading";

type Props = {
  youtubeUrl: string | null;
};

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  );
  return match?.[1] ?? null;
}

export function VideoSection({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeUrl) return null;
  const videoId = extractYoutubeId(youtubeUrl);
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section className="px-6 py-10 sm:px-8" style={{ backgroundColor: "var(--lp-cream)" }}>
      <FadeUp>
        <SectionHeading title="動画" />
        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-md">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group relative h-full w-full"
              aria-label="動画を再生"
            >
              <img
                src={thumbnailUrl}
                alt="動画サムネイル"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition group-hover:scale-110">
                  <svg className="ml-1 h-7 w-7 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </FadeUp>
    </section>
  );
}
