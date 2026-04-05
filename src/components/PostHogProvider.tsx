"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ページ遷移ごとにpageviewを記録するコンポーネント
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const phog = usePostHog();

  useEffect(() => {
    if (pathname && phog) {
      let url = window.origin + pathname;
      const params = searchParams.toString();
      if (params) url += `?${params}`;
      phog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, phog]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  useEffect(() => {
    if (!key) return;
    posthog.init(key, {
      api_host: host,
      capture_pageview: false, // 手動でキャプチャ
      capture_pageleave: true,
      persistence: "localStorage",
    });
  }, [key, host]);

  if (!key) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
