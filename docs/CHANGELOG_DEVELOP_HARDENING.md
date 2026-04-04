# develop ブランチ商用PoC対応 — 変更記録

> develop ブランチを商用PoCに耐える状態へ引き上げるための変更記録。

---

## 完了済み

### P0: 機密情報の除去

#### 1. `.mcp.json` をgit管理から除去
- **理由**: Tailscale内部IP（`100.74.224.93`）が含まれており、公開リポジトリに不適切
- **対応**:
  - `.gitignore` に `.mcp.json` を追加
  - `git rm --cached .mcp.json` で追跡を解除
  - `.mcp.example.json` をダミー値で作成（使い方の説明用）

#### 2. ドキュメント内の機密情報を伏字化
- **`docs/n8n-workflows.md`**:
  - n8n内部IP → `<N8N_HOST>`
  - Google Sheets ID / credential ID → 「運用ドキュメント参照」
  - Supabase company_id一覧 → 「super admin画面で確認」
- **`docs/PROJECT_OVERVIEW.md`**:
  - デモパスワード → 「運用ドキュメント参照」
  - Cloudflare Workers URL → `${NEXT_PUBLIC_SITE_URL}` プレースホルダー

### P1: セットアップ文書整備

#### 3. `.env.local.example` を更新
- 必須変数を追加: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `N8N_MCP_TOKEN`
- 各変数に用途コメント付き

#### 4. `README.md` を全面更新
- migration 6本の順序を明記
- 環境変数一覧テーブル
- super admin 初期作成手順（SQL付き）
- Cloudflare Workers / OpenNext デプロイ注意点
- プロジェクト構成図

### P1: バグ修正

#### 5. `src/app/admin/super/page.tsx` のテーブル名誤り
- `.from("staff")` → `.from("staff_members")`
- `staff` テーブルは存在せず、Supabaseが空配列を返していた

#### 6. `booking_url` スキーマ不整合
- **状況**: 型定義 + Zodバリデータ + UIフォームに存在するが、DBカラムが未作成
- **対応**: `supabase/migrations/006_add_booking_url.sql` を追加
- `ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS booking_url TEXT`

#### 7. `PageVisit` 型定義の更新
- migration 005 で追加された `company_id`, `event_type`, `metadata` を `src/types/database.ts` に反映

### P1: super admin 会社切替の実機能化

#### 8. `src/lib/admin-context.ts` を新設
- `getCurrentAdminContext()` 関数:
  - 通常admin → 自社 `company_id`
  - super_admin → Cookie `super_viewing_company_id` があればその会社（実在チェック付き）

#### 9. 全 admin ページを統一
- 以下のページを `getCurrentAdminContext()` に統一:
  - `admin/page.tsx`（ダッシュボード）
  - `admin/staff/page.tsx`
  - `admin/settings/page.tsx`
  - `admin/analytics/page.tsx`
  - `admin/campaigns/page.tsx`
  - `admin/stores/page.tsx`
  - `admin/nfc/page.tsx`
- 全クエリに `.eq("company_id", ctx.companyId)` を追加
- super_admin が会社を切り替えると、実際のデータも切り替わるように

### P2: イベント記録改善

#### 10. `/api/track` API route 新設
- **理由**: ISRキャッシュ配信中はサーバーサイドinsertが実行されない
- **対応**: クライアントサイドから `POST /api/track` で page_visit を記録
- バリデーション: UUID形式チェック、スタッフ実在＆公開チェック、Content-Typeチェック
- `PageTracker` クライアントコンポーネントを作成、`sendBeacon` で fire-and-forget
- LPページのサーバーサイドinsertを削除し、`<PageTracker>` に置換

### P2: webhook送信処理の強化

#### 11. `src/lib/webhook.ts` をリファクタ
- **structured log**: JSON形式で component/event/status/durationMs/company_id を出力
- **payload検証**: 送信前に必須フィールド（event_type, timestamp, company_id, token, target_path）をチェック
- **WebhookResult型**: 成功/失敗/ステータス/所要時間を返す
- **retry方針**: コメントで明記（現時点はリトライなし、理由付き）

---

## 検証結果

| チェック | 結果 |
|---------|------|
| `npx tsc --noEmit` | 通過（エラー0件） |
| `npm run lint` | 通過（warning/error 0件） |
| `npm run build` | Google Fonts ネットワークエラーのみ（Web環境の外部接続制限。コード起因ではない） |

---

## 残課題

| 優先度 | 内容 | 詳細 |
|--------|------|------|
| P1 | server action の会社コンテキスト | `staff/actions.ts`, `settings/actions.ts` 等のServer Actionは現在 `adminUser.company_id` を直接使用。super_admin会社切替時にAction側も `getCurrentAdminContext()` を使うよう統一が必要 |
| P1 | `get_staff_visit_ranking` RPC | `auth.uid()` ベースで会社をフィルタしているため、super_admin会社切替時に正確な結果が返らない。RPCに `company_id` パラメータを追加するか、SQL側を改修する必要あり |
| P2 | rate limiting | `/api/track` に本格的なrate limit（IP単位 or fingerprint）が未実装。PoCレベルでは問題ないが、本番前に検討 |
| P2 | webhook retry | 現在リトライなし。n8n側の冪等性確認後に1回リトライ追加を検討 |
| P2 | audit log | super_admin操作（会社作成・アカウント発行・切替）のログ記録が未実装 |
| P3 | テストコード | ユニットテスト・E2Eテストが未作成 |
