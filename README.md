# NFC x LINE x LP 営業支援SaaS

NFCタッチから営業担当者専用LPを表示し、会社支給LINEへ誘導するマルチテナント営業支援システム。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 15 / React 19 / Tailwind CSS 4 / TypeScript |
| Backend/DB | Supabase（PostgreSQL / Auth / Storage） |
| Infrastructure | Cloudflare Workers + OpenNext adapter |
| Validation | Zod（日本語エラーメッセージ） |
| Automation | n8n（webhook連携・フォローアップ通知） |

## セットアップ

### 1. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` に以下を設定（詳細は `.env.local.example` のコメント参照）:

| 変数名 | 必須 | 用途 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 必須 | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 必須 | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 必須 | super admin のアカウント発行に使用（公開厳禁） |
| `NEXT_PUBLIC_SITE_URL` | 必須 | NFCリダイレクト・OGP生成で使用 |
| `N8N_MCP_TOKEN` | 任意 | Claude Code CLI から n8n MCP を使う場合 |

### 2. 依存パッケージ

```bash
npm install
```

### 3. Supabase マイグレーション

`supabase/migrations/` 配下の SQL を Supabase ダッシュボードの SQL Editor で**番号順に**実行:

| # | ファイル | 内容 |
|---|---------|------|
| 1 | `001_initial_schema.sql` | テーブル作成（companies, staff_members, stores 等 9テーブル） |
| 2 | `002_rls_policies.sql` | RLS ポリシー + Storage バケット |
| 3 | `003_analytics_and_fixes.sql` | page_visits / nfc_resolutions テーブル + lp_settings カラム追加 |
| 4 | `004_super_admin_rls.sql` | super_admin ロール用 RLS ポリシー + `is_super_admin()` 関数 |
| 5 | `005_webhook_and_events.sql` | webhook設定カラム + イベント基盤拡張 |
| 6 | `006_add_booking_url.sql` | staff_members に booking_url カラム追加 |

> **注意**: 順序を守らないと外部キー制約やカラム参照でエラーになります。

### 4. super admin の初期作成

1. Supabase ダッシュボード > Authentication > Users で管理者ユーザーを作成
2. SQL Editor で以下を実行（会社とadmin_usersレコードを作成）:

```sql
-- 1. 会社を作成
INSERT INTO companies (company_code, company_name, primary_color)
VALUES ('YOUR-COMPANY', 'あなたの会社名', '#1a1a2e');

-- 2. admin_users に super_admin として登録
INSERT INTO admin_users (company_id, auth_user_id, name, email, role)
VALUES (
  (SELECT id FROM companies WHERE company_code = 'YOUR-COMPANY'),
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'あなたの名前',
  'your-email@example.com',
  'super_admin'
);
```

3. 以降の会社登録・アカウント発行は super admin 管理画面（`/admin/super`）から実行可能

### 5. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000/admin/login` からログイン。

## デプロイ（Cloudflare Workers）

```bash
npm run deploy
```

- `opennextjs-cloudflare` でビルド → `wrangler deploy` で Cloudflare Workers にデプロイ
- `wrangler.jsonc` に Workers の設定あり
- `NEXT_PUBLIC_SITE_URL` を本番URLに変更すること

## プロジェクト構成

```
src/
├── app/
│   ├── (public)/          # 公開ページ（LP, NFCリダイレクト）
│   │   ├── staff/[slug]/  # 担当者LP
│   │   └── n/[token]/     # NFCトークンリダイレクト
│   └── admin/             # 管理画面
│       ├── super/         # super admin（会社管理・アカウント発行）
│       ├── staff/         # 担当者CRUD
│       ├── stores/        # 店舗CRUD
│       ├── campaigns/     # キャンペーンCRUD
│       ├── nfc/           # NFCトークン管理
│       ├── analytics/     # アクセス解析
│       └── settings/      # 会社設定・LP設定・webhook設定
├── components/
│   ├── lp/                # LP表示用コンポーネント
│   ├── admin/             # 管理画面コンポーネント
│   └── ui/                # 共通UIパーツ
├── lib/
│   ├── supabase/          # Supabaseクライアント
│   ├── validators/        # Zodスキーマ
│   └── webhook.ts         # n8n webhook発火ユーティリティ
└── types/                 # 型定義

supabase/migrations/       # DBマイグレーション（番号順に実行）
docs/                      # プロジェクトドキュメント
```

## n8n 連携

- ワークフロー台帳: `docs/n8n-workflows.md`
- MCP設定テンプレート: `.mcp.example.json`
- webhook設定は管理画面の「設定 > LP設定 > n8n Webhook設定」から会社ごとに設定
