import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fireWebhook } from "@/lib/webhook";
import type { WebhookPayload } from "@/lib/webhook";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: nfcToken } = await supabase
    .from("nfc_tokens")
    .select("id, company_id, target_path, is_active")
    .eq("token", token)
    .single();

  if (!nfcToken || !nfcToken.is_active) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>無効なリンク</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;">
<div style="text-align:center;padding:2rem;">
<h1 style="font-size:1.5rem;color:#111;">このリンクは無効です</h1>
<p style="color:#6b7280;margin-top:0.5rem;">NFCトークンが見つからないか、無効化されています。</p>
</div>
</body>
</html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  const userAgent = request.headers.get("user-agent");

  // NFCスキャンをトラッキング（fire and forget）
  supabase
    .from("nfc_resolutions")
    .insert({
      nfc_token_id: nfcToken.id,
      company_id: nfcToken.company_id,
      event_type: "tag_tapped",
      user_agent: userAgent,
    })
    .then(() => {});

  // webhook設定を取得してn8nへ通知（fire and forget）
  supabase
    .from("lp_settings")
    .select("webhook_url, webhook_secret")
    .eq("company_id", nfcToken.company_id)
    .single()
    .then(({ data: lpSettings }) => {
      if (!lpSettings?.webhook_url) return;

      const payload: WebhookPayload = {
        event_type: "tag_tapped",
        timestamp: new Date().toISOString(),
        company_id: nfcToken.company_id,
        token,
        target_path: nfcToken.target_path,
        user_agent: userAgent,
      };

      fireWebhook({
        url: lpSettings.webhook_url,
        secret: lpSettings.webhook_secret,
        payload,
      });
    });

  return NextResponse.redirect(
    new URL(nfcToken.target_path, process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
    302
  );
}
