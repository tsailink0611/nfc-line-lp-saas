/**
 * n8n webhook発火ユーティリティ
 * fire-and-forget 方式。成功/失敗をstructured logで出力する。
 *
 * Retry方針:
 *   現時点ではリトライしない（n8n側で冪等性が保証されていないため）。
 *   将来的にretryを追加する場合は以下を前提とする:
 *   - 最大1回リトライ（2回目で成功しなければ諦める）
 *   - 5xx / タイムアウトのみリトライ対象（4xxはリトライしない）
 *   - リトライ間隔は2秒
 *   - webhook_logsテーブルへの記録を追加してから
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
  metadata?: Record<string, unknown>;
};

type FireWebhookOptions = {
  url: string;
  secret?: string | null;
  payload: WebhookPayload;
};

/**
 * payloadの必須フィールドを検証する。
 * 不正なpayloadはn8n側でエラーになるため、送信前にチェック。
 */
function validatePayload(payload: WebhookPayload): string | null {
  if (!payload.event_type) return "event_type is required";
  if (!payload.timestamp) return "timestamp is required";
  if (!payload.company_id) return "company_id is required";
  if (!payload.token) return "token is required";
  if (!payload.target_path) return "target_path is required";
  return null;
}

export type WebhookResult = {
  success: boolean;
  status?: number;
  error?: string;
  durationMs: number;
};

/**
 * webhookを発火する。
 * fire-and-forget用途を想定。成功/失敗をstructured logで出力し、
 * 呼び出し元が結果を利用できるようWebhookResultを返す。
 */
export async function fireWebhook({ url, secret, payload }: FireWebhookOptions): Promise<WebhookResult> {
  // payload検証
  const validationError = validatePayload(payload);
  if (validationError) {
    console.error(JSON.stringify({
      level: "error",
      component: "webhook",
      event: "validation_failed",
      reason: validationError,
      company_id: payload.company_id || "unknown",
      event_type: payload.event_type || "unknown",
    }));
    return { success: false, error: validationError, durationMs: 0 };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) {
    headers["X-Webhook-Secret"] = secret;
  }

  const startMs = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    const durationMs = Date.now() - startMs;

    if (res.ok) {
      console.log(JSON.stringify({
        level: "info",
        component: "webhook",
        event: "sent",
        status: res.status,
        durationMs,
        company_id: payload.company_id,
        event_type: payload.event_type,
      }));
      return { success: true, status: res.status, durationMs };
    }

    console.error(JSON.stringify({
      level: "error",
      component: "webhook",
      event: "http_error",
      status: res.status,
      statusText: res.statusText,
      durationMs,
      url,
      company_id: payload.company_id,
      event_type: payload.event_type,
    }));
    return { success: false, status: res.status, error: res.statusText, durationMs };
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isTimeout = errorMessage.includes("timeout") || errorMessage.includes("aborted");

    console.error(JSON.stringify({
      level: "error",
      component: "webhook",
      event: isTimeout ? "timeout" : "network_error",
      error: errorMessage,
      durationMs,
      url,
      company_id: payload.company_id,
      event_type: payload.event_type,
    }));
    return { success: false, error: errorMessage, durationMs };
  }
}
