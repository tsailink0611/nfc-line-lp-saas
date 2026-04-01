/**
 * n8n webhook発火ユーティリティ
 * 初期は同期送信。将来的にqueue/非同期化しやすい構造にしておく。
 */

export type WebhookEventType =
  | "tag_tapped"
  | "page_opened"
  | "cta_clicked"
  | "line_clicked"
  | "form_submitted";

export type WebhookPayload = {
  event_type: WebhookEventType;
  timestamp: string;
  company_id: string;
  token: string;
  target_path: string;
  user_agent: string | null;
  // 将来的にstaff_id / campaign_id / template_type等を追加予定
  metadata?: Record<string, unknown>;
};

type FireWebhookOptions = {
  url: string;
  secret?: string | null;
  payload: WebhookPayload;
};

/**
 * webhookを発火する。
 * fire-and-forget用途を想定しているが、エラーはログに残す。
 * 将来的にretry / webhook_logsテーブルへの記録を追加する。
 */
export async function fireWebhook({ url, secret, payload }: FireWebhookOptions): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) {
    headers["X-Webhook-Secret"] = secret;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5秒タイムアウト
    });

    if (!res.ok) {
      console.error(`[webhook] failed: ${res.status} ${res.statusText} url=${url}`);
    }
  } catch (err) {
    // タイムアウト・ネットワークエラーはログのみ。ユーザー体験は妨げない。
    console.error(`[webhook] error: ${err instanceof Error ? err.message : err} url=${url}`);
  }
}
