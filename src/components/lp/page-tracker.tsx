"use client";

import { useEffect } from "react";

type Props = {
  staffMemberId: string;
};

/**
 * LP表示時にpage_visitを記録するクライアントコンポーネント。
 * ISRキャッシュ配信時でも確実にイベントを記録する。
 */
export function PageTracker({ staffMemberId }: Props) {
  useEffect(() => {
    // sendBeacon で fire-and-forget（ページ離脱時でも送信される）
    const body = JSON.stringify({ staff_member_id: staffMemberId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [staffMemberId]);

  return null;
}
