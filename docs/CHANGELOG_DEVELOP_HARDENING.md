# develop ブランチ商用PoC対応 — 作業記録

> このドキュメントは develop ブランチを商用PoCに耐える状態へ引き上げるための変更記録。
> 作業途中で中断しているため、後続セッションはここから再開すること。

---

## 完了済み（P0）

### 1. `.mcp.json` をgit管理から除去
- **理由**: Tailscale内部IP（`100.74.224.93`）が含まれており、公開リポジトリに不適切
- **対応**:
  - `.gitignore` に `.mcp.json` を追加
  - `git rm --cached .mcp.json` で追跡を解除
  - `.mcp.example.json` をダミー値で作成（使い方の説明用）

### 2. ドキュメント内の機密情報を伏字化
- **`docs/n8n-workflows.md`**:
  - n8n内部IP → `<N8N_HOST>`
  - Google Sheets ID / credential ID → 「運用ドキュメント参照」
  - Supabase company_id一覧 → 「super admin画面で確認」
- **`docs/PROJECT_OVERVIEW.md`**:
  - デモパスワード `Demo2026!` → 「運用ドキュメント参照」
  - Cloudflare Workers URL → `${NEXT_PUBLIC_SITE_URL}` プレースホルダー

## 進行中（P1: セットアップ文書）

### 3. `.env.local.example` を更新済み
- 必須変数を追加: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `N8N_MCP_TOKEN`
- 各変数に用途コメント付き

### 4. `README.md` — **未着手**
- migration 5本の順序明記
- 環境変数一覧
- super admin 初期作成手順
- Cloudflare Workers / OpenNext 注意点

---

## 未着手（後続セッションで実施）

### P1: バグ修正
5. **`src/app/admin/super/page.tsx:34`** — `.from("staff")` を `.from("staff_members")` に修正（テーブル名誤り）
6. **`booking_url` のスキーマ不整合** — 型定義 + Zodバリデータに存在するが、DB migration に列がない → `006_add_booking_url.sql` を追加
7. **`page_visits` / `nfc_resolutions` の型定義** — migration 005 で追加された `company_id`, `event_type`, `metadata` が `src/types/database.ts` の `PageVisit` 型に未反映

### P1: super admin 会社切替の実機能化
8. **`src/lib/admin-context.ts` を新設** — `getCurrentAdminContext()` 関数で会社コンテキストを共通化
   - 通常admin → 自社 company_id
   - super_admin → Cookie `super_viewing_company_id` の値 or 自社
9. **各admin page を統一** — `page.tsx`, `staff/page.tsx`, `settings/page.tsx`, `analytics/page.tsx` が個別に `adminUser.company_id` を取得している箇所を共通関数に置換

### P2: イベント記録改善
10. **`/api/track` API route 新設** — ISRキャッシュでpage_visit記録が欠落する問題の対策
    - クライアントサイドから非同期POSTで記録
    - 基本バリデーション（UUID形式チェック等）付き
11. **イベントテーブルの耐汚染性** — 最低限のrate limit / required field check

### P2: webhook強化
12. **`src/lib/webhook.ts`** — structured log / payload検証 / retry方針コメント

---

## 発見した主要な問題の詳細

### テーブル名誤り
```
src/app/admin/super/page.tsx:34
  .from("staff")    ← 存在しないテーブル名
  .from("staff_members")  ← 正しいテーブル名
```

### booking_url スキーマ不整合
```
型定義あり:  src/types/database.ts:51        booking_url: string | null
Zodあり:    src/lib/validators/staff.ts:19   booking_url: z.string().url(...)
UIあり:     src/components/admin/staff-form.tsx:227-234
DBカラム:   001_initial_schema.sql の staff_members に booking_url 列なし ← 不整合
```

### page_visits 型とDBの乖離
```
migration 005 で追加されたカラム:
  company_id UUID, event_type TEXT, metadata JSONB

src/types/database.ts の PageVisit 型:
  company_id なし, event_type なし, metadata なし ← 未反映
```

### super admin 会社切替の問題
```
admin/layout.tsx: Cookie "super_viewing_company_id" を読んで表示名を切替
→ 表示名は切り替わるが、各ページのデータ取得クエリは自社company_idのまま
→ 会社切替しても実データが切り替わらない

影響範囲:
  - admin/page.tsx（ダッシュボード） — RLSで自社のみ
  - admin/staff/page.tsx — RLSで自社のみ
  - admin/settings/page.tsx — adminUser.company_id 直接使用
  - admin/analytics/page.tsx — RLSで自社のみ
```

---

## ビルド・lint・typecheck 確認

**まだ実行していない**（変更途中のため後続セッションで実行すること）

```bash
npm run build
npx tsc --noEmit
npm run lint
```
