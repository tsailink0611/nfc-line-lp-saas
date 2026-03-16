# NFC x LINE x LP 営業支援SaaS MVP

NFCタッチから営業担当者専用LPを表示し、会社支給LINEへ誘導する営業支援システム。

## 技術スタック

- **Frontend**: Next.js 15 / React 19 / Tailwind CSS 4
- **Backend/DB**: Supabase (PostgreSQL / Auth / Storage)
- **Infrastructure**: Cloudflare Workers + OpenNext adapter

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL と ANON KEY を設定
npm run dev
```

## Supabase マイグレーション

`supabase/migrations/` 配下の SQL を Supabase ダッシュボードの SQL Editor で実行:

1. `001_initial_schema.sql` — テーブル作成
2. `002_rls_policies.sql` — RLS ポリシー + Storage バケット

## デプロイ

```bash
npm run deploy
```
