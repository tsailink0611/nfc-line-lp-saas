# LINE Harness OSS — ローカル開発ガイド

## プロジェクト概要

LINE公式アカウントの完全オープンソースCRM。Cloudflare無料枠で月額0円運用。
ソースリポジトリ: https://github.com/Shudesu/line-harness-oss

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| API / Webhook | Cloudflare Workers + Hono |
| データベース | Cloudflare D1 (SQLite) — 42テーブル |
| 管理画面 | Next.js 15 (App Router) + Tailwind CSS |
| LIFF | Vite + TypeScript |
| SDK | TypeScript (ESM + CJS) |
| Cron | Workers Cron Triggers (5分毎) |
| 画像 | Cloudflare R2 |

## モノレポ構成

```
line-harness-oss/
├── apps/worker/        # Workers API (Hono) — ポート5173(Vite経由)
├── apps/web/           # Next.js管理画面 — ポート3001
├── packages/db/        # D1スキーマ + クエリ (ビルド不要, src直接参照)
├── packages/line-sdk/  # LINE API ラッパー (要ビルド)
├── packages/shared/    # 共有型定義 (要ビルド)
├── packages/sdk/       # 外部向けTypeScript SDK
├── packages/mcp-server/# Claude Code連携
└── packages/create-line-harness/ # セットアップCLI
```

## ローカル起動手順

### 前提
- Node.js 20+
- pnpm 9+ (corepack enable)

### 手順

```bash
# 1. クローン & インストール
git clone https://github.com/Shudesu/line-harness-oss.git
cd line-harness-oss
pnpm install

# 2. 内部パッケージビルド
pnpm --filter @line-crm/shared build
pnpm --filter @line-crm/line-sdk build

# 3. ローカルD1にスキーマ投入
cd apps/worker
npx wrangler d1 execute line-harness --file=../../packages/db/schema.sql --local

# 4. Worker起動
pnpm dev
# → http://localhost:5173 (Vite Cloudflareプラグイン経由)

# 5. 疎通確認
curl -s http://localhost:5173/api/tags -H "Authorization: Bearer test-local-api-key-12345"
```

### 環境変数

Worker用: `apps/worker/.dev.vars`
```
API_KEY=test-local-api-key-12345
LINE_CHANNEL_ACCESS_TOKEN=dummy-for-local-testing
LINE_CHANNEL_SECRET=dummy-for-local-testing
LINE_LOGIN_CHANNEL_ID=dummy
LINE_LOGIN_CHANNEL_SECRET=dummy
```

Web用: `apps/web/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5173
```

## 開発ルール

- 破壊的変更する前に理由を説明
- 本番設定を勝手に書き換えない
- 変更はdiff形式で示す
- 最小変更で進める
- エラーは原因仮説を複数出して最短で切り分け

## 注意点

- `package.json` の `db:migrate` は `line-crm` を参照するが、`wrangler.toml` の DB名は `line-harness`
  → `apps/worker` ディレクトリで `npx wrangler d1 execute line-harness ...` を使うこと
- `@line-crm/db` はビルド不要（main が `./src/index.ts` 直接参照）
- Workerのローカルポートは 8787 ではなく 5173（Vite Cloudflareプラグイン）
- `.dev.vars` ファイルの文字エンコーディングに注意（BOM付きNG）
