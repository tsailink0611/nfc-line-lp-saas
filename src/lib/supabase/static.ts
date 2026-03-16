import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ビルド時（generateStaticParams等）で使用する匿名クライアント
// cookies不要のため、リクエストコンテキスト外でも動作する
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
