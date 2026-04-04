import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/track
 *
 * クライアントサイドからLP表示イベントを記録する。
 * ISRキャッシュ中はサーバーサイドinsertが実行されないため、
 * クライアントから非同期で呼び出すことで記録漏れを防ぐ。
 *
 * Body: { staff_member_id: string }
 */
export async function POST(request: Request) {
  // 基本レート制限: Content-Typeチェック
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ error: "invalid content-type" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { staff_member_id } = body as { staff_member_id?: string };

  // バリデーション: UUID形式チェック
  if (!staff_member_id || !UUID_RE.test(staff_member_id)) {
    return NextResponse.json({ error: "invalid staff_member_id" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  const supabase = await createClient();

  // スタッフが実在し公開中かチェック（不正IDによる汚染防止）
  const { data: staff } = await supabase
    .from("staff_members")
    .select("id")
    .eq("id", staff_member_id)
    .eq("is_public", true)
    .single();

  if (!staff) {
    return NextResponse.json({ error: "staff not found" }, { status: 404 });
  }

  await supabase.from("page_visits").insert({
    staff_member_id,
    user_agent: userAgent,
    referrer,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
