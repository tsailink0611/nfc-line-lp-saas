import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: nfcToken } = await supabase
    .from("nfc_tokens")
    .select("id, target_path, is_active")
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

  // NFCスキャンをトラッキング（fire and forget: 失敗してもリダイレクトは行う）
  supabase
    .from("nfc_resolutions")
    .insert({
      nfc_token_id: nfcToken.id,
      user_agent: request.headers.get("user-agent"),
    })
    .then(() => {});

  return NextResponse.redirect(
    new URL(nfcToken.target_path, process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
    302
  );
}
