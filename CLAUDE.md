# LINE Harness OSS — 開発ガイド & セットアップ手順書

## プロジェクト概要

LINE公式アカウントの完全オープンソースCRM/マーケティング自動化ツール。
L Message / UTage 等の有料SaaS（月額1〜2万円）をCloudflare無料枠（月額0円）で代替する。

- ソースリポジトリ: https://github.com/Shudesu/line-harness-oss
- ライセンス: MIT
- 無料枠で5,000友だちまで運用可能

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| API / Webhook | Cloudflare Workers + Hono |
| データベース | Cloudflare D1 (SQLite) — 42テーブル |
| 管理画面 | Next.js 15 (App Router) + Tailwind CSS 4 + React 19 |
| LIFF | Vite + TypeScript |
| SDK | TypeScript (ESM + CJS, tsup, 43テスト) |
| MCP Server | Claude Code連携 |
| Cron | Workers Cron Triggers (5分毎) |
| 画像 | Cloudflare R2 |
| CI/CD | GitHub Actions → Cloudflare Workers 自動デプロイ |

## モノレポ構成

```
line-harness-oss/
├── apps/
│   ├── worker/              # Cloudflare Workers API (Hono)
│   │                        #   ローカル: http://localhost:5173 (Viteプラグイン経由)
│   │                        #   27 ルートファイル, 100+ エンドポイント
│   └── web/                 # Next.js 15 管理画面
│                            #   ローカル: http://localhost:3001
│                            #   output: 'export' (静的サイト)
├── packages/
│   ├── db/                  # D1スキーマ + クエリヘルパー (ビルド不要, src直接参照)
│   ├── line-sdk/            # LINE Messaging API ラッパー (要ビルド: tsc)
│   ├── shared/              # 共有型定義 (要ビルド: tsc)
│   ├── sdk/                 # 外部向け TypeScript SDK @line-harness/sdk (npm公開)
│   ├── mcp-server/          # MCP Server @line-harness/mcp-server
│   ├── create-line-harness/ # セットアップCLI
│   └── plugin-template/     # プラグインテンプレート
├── docs/
│   ├── wiki/                # 全25ページのドキュメント
│   ├── SPEC.md
│   ├── PROGRESS.md
│   └── CHANGELOG.md
├── scripts/
│   └── sync-oss.sh          # OSS同期スクリプト (Bash)
└── .github/
    └── workflows/
        └── deploy-worker.yml # main push → Worker自動デプロイ
```

## ビルド依存関係

```
@line-crm/shared  (要ビルド: tsc -p tsconfig.build.json)
     ↓
@line-crm/line-sdk (要ビルド: tsc -p tsconfig.build.json)
     ↓
@line-crm/db      (ビルド不要: main → ./src/index.ts)
     ↓
apps/worker       (vite dev / vite build)
apps/web          (next dev / next build)
```

## LINE Webhook → 配信 の実行フロー

```
1. ユーザーが友だち追加 or メッセージ送信
2. LINE Platform → POST /webhook
3. X-Line-Signature を HMAC-SHA256 で検証 (packages/line-sdk/src/webhook.ts)
4. マルチアカウント: line_accounts テーブルから認証情報を特定
5. イベント分岐:
   - follow → upsertFriend → friend_add シナリオ自動登録 → 即時配信(delay=0)
   - unfollow → is_following=false
   - message(text) → ログ記録 → 自動返信チェック → イベントバス発火
6. Cron(5分毎) → step-delivery: next_delivery_at 確認 → pushMessage配信
7. Cron → broadcast: scheduled_at の予約配信実行
8. Cron → reminder-delivery: リマインダー配信
9. Cron → ban-monitor: アカウントヘルス監視
```

## 認証方式

- Bearer Token: `Authorization: Bearer <API_KEY>`
- 2段階チェック: (1) staff_members テーブル → (2) 環境変数 API_KEY フォールバック
- 公開パス (認証スキップ): /webhook, /docs, /r/:ref, /auth/line, /liff/*, /images/*, /forms/:id/submit
- レート制限: 未認証 100req/min, 認証済み 1000req/min

---

# セットアップ手順 (Windows向け)

## 前提条件

| 必須 | バージョン | 確認コマンド |
|------|-----------|-------------|
| Node.js | 20+ (CI/CDは22使用) | `node -v` |
| pnpm | 9+ (project指定: 9.15.4) | `pnpm -v` |
| Git | 最新 | `git --version` |

## 手順1: クローン & インストール

**目的:** ソースコード取得と全パッケージの依存解決

```powershell
git clone https://github.com/Shudesu/line-harness-oss.git
cd line-harness-oss
pnpm install
```

**確認:** エラーなく完了し、`apps/worker/node_modules/.bin/vite` が存在すること

**失敗しやすい点:**
- pnpmバージョン不一致 → `corepack enable` 後 `corepack use pnpm@9.15.4`
- Node.js 18以前 → 20以上にアップデート

## 手順2: 内部パッケージビルド

**目的:** Worker が依存する共有パッケージをコンパイル

```powershell
pnpm --filter @line-crm/shared build
pnpm --filter @line-crm/line-sdk build
```

**確認:** `packages/shared/dist/` と `packages/line-sdk/dist/` にファイルが生成されること

**注意:** `@line-crm/db` はビルド不要（main が `./src/index.ts` を直接参照）

## 手順3: 環境変数の準備

**目的:** ローカル開発用のシークレットを設定

Worker用: `apps/worker/.dev.vars` を作成:
```powershell
@"
API_KEY=test-local-api-key-12345
LINE_CHANNEL_ACCESS_TOKEN=dummy-for-local-testing
LINE_CHANNEL_SECRET=dummy-for-local-testing
LINE_LOGIN_CHANNEL_ID=dummy
LINE_LOGIN_CHANNEL_SECRET=dummy
"@ | Out-File -Encoding ascii apps/worker/.dev.vars
```

Web用: `apps/web/.env.local` を作成:
```powershell
@"
NEXT_PUBLIC_API_URL=http://localhost:5173
"@ | Out-File -Encoding ascii apps/web/.env.local
```

**失敗しやすい点:** BOM付きUTF-8だとwranglerが読めない → `-Encoding ascii` を使う

## 手順4: ローカルD1にスキーマ投入

**目的:** SQLiteにテーブル42個 + インデックスを作成

```powershell
cd apps/worker
npx wrangler d1 execute line-harness --file=../../packages/db/schema.sql --local
```

**確認:** `80 commands executed successfully.` と表示されること

**失敗しやすい点:**
- ルートディレクトリから実行するとDB名が見つからない → **必ず `apps/worker` で実行**
- package.json の `db:migrate:local` は `line-crm` を参照するが wrangler.toml は `line-harness` → 直接コマンド実行推奨

## 手順5: Worker起動

**目的:** APIサーバーの起動

```powershell
cd apps/worker
pnpm dev
```

**確認:** `VITE ready` が表示され `http://localhost:5173/` が応答すること

**注意:** READMEでは 8787 と記載されているが、Vite Cloudflareプラグイン経由のため **5173** が正しい

## 手順6: API疎通テスト

**目的:** 各エンドポイントの正常応答を確認

```powershell
# タグ一覧 (認証付き)
Invoke-WebRequest -Uri "http://localhost:5173/api/tags" `
  -Headers @{ Authorization = "Bearer test-local-api-key-12345" } | Select-Object -ExpandProperty Content
# 期待: {"success":true,"data":[]}

# 友だち一覧
Invoke-WebRequest -Uri "http://localhost:5173/api/friends" `
  -Headers @{ Authorization = "Bearer test-local-api-key-12345" } | Select-Object -ExpandProperty Content
# 期待: {"success":true,"data":{"items":[],"total":0,...}}

# タグ作成 (Write操作)
Invoke-WebRequest -Uri "http://localhost:5173/api/tags" `
  -Method POST `
  -Headers @{ Authorization = "Bearer test-local-api-key-12345"; "Content-Type" = "application/json" } `
  -Body '{"name":"テストタグ","color":"#FF0000"}' | Select-Object -ExpandProperty Content
# 期待: {"success":true,"data":{"id":"...","name":"テストタグ",...}}

# 認証なしアクセス (拒否されること)
Invoke-WebRequest -Uri "http://localhost:5173/api/tags"
# 期待: 401 Unauthorized

# Webhook (公開パス)
Invoke-WebRequest -Uri "http://localhost:5173/webhook" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"events":[]}'
# 期待: {"status":"ok"}
```

## 手順7: 管理画面起動

**目的:** Next.js管理画面の動作確認

```powershell
# 別のターミナルで (Workerは起動したまま)
cd line-harness-oss
pnpm dev:web
```

**確認:** `http://localhost:3001` にブラウザでアクセスし「LINE CRM 管理画面」が表示されること

## 手順8: SDKテスト実行

**目的:** SDKの全テストがパスすることを確認

```powershell
pnpm --filter @line-harness/sdk test
```

**確認:** `9 passed (9)` ファイル, `43 passed (43)` テスト が表示されること

---

# 環境変数・Secrets 完全一覧

## Worker側 (wrangler secret put / .dev.vars)

| 変数名 | 用途 | 必須 | ローカル | 本番 |
|--------|------|------|---------|------|
| `API_KEY` | 管理API認証Bearerトークン | 必須 | .dev.vars | secret |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API送信用 | 必須 | ダミー可 | secret |
| `LINE_CHANNEL_SECRET` | Webhook署名検証 | 必須 | ダミー可 | secret |
| `LINE_LOGIN_CHANNEL_ID` | LINE Login (UUID取得) | 必須 | ダミー可 | secret |
| `LINE_LOGIN_CHANNEL_SECRET` | LINE Login認証 | 必須 | ダミー可 | secret |
| `WORKER_URL` | Worker自身のURL | 任意 | 不要 | secret |
| `LIFF_URL` | LIFF App URL | 任意 | 不要 | secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe決済連携 | 任意 | 不要 | secret |
| `X_HARNESS_URL` | クロスアカウント連携 | 任意 | 不要 | secret |

## Web側 (apps/web/.env.local)

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | Worker APIのURL | 必須 |

## ビルド時 (GitHub Actions vars)

| 変数名 | 用途 |
|--------|------|
| `VITE_LIFF_ID` | LIFFアプリID |
| `VITE_BOT_BASIC_ID` | LINE Bot Basic ID |
| `VITE_CALENDAR_CONNECTION_ID` | Google Calendar接続ID |

## CI/CD (GitHub Secrets)

| 変数名 | 用途 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | wrangler deploy用 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflareアカウント識別 |

## wrangler.toml (要編集)

| 項目 | 値 |
|------|---|
| `account_id` | CloudflareアカウントID |
| `d1_databases.database_id` | D1データベースID |
| `r2_buckets.bucket_name` | R2バケット名 |

---

# 発見した問題点・不整合

## 1. DB名の不整合 (軽微)
- `package.json` の `db:migrate` / `db:migrate:local` → DB名 `line-crm`
- `wrangler.toml` → DB名 `line-harness`
- **対策:** `apps/worker` ディレクトリで `npx wrangler d1 execute line-harness ...` を直接使用

## 2. Worker typecheck エラー (上流バグ)
- `apps/worker/src/routes/webhook.ts:285` で `c.env.LIFF_URL` を参照しているが、
  この箇所は `handleEvent` 関数内で `c` (Hono Context) がスコープ外
- **実行時影響:** なし（Viteビルドは成功する）
- **修正案:** `handleEvent` に `env` パラメータを追加するか、`LIFF_URL` を引数で渡す

## 3. SDK DTS生成エラー (上流バグ)
- `packages/sdk/src/client.ts:76` の `new URL()` が型エラー
- 原因: `tsconfig.base.json` の `lib` に `"DOM"` が含まれていない
- **実行時影響:** なし（JS/CJSビルドは成功する。DTS生成のみ失敗）
- **修正案:** `packages/sdk/tsconfig.json` の `compilerOptions.lib` に `"DOM"` を追加

## 4. README と実装のズレ
- README: ローカルポート 8787 → 実際: 5173 (Vite Cloudflareプラグイン)
- README: `apps/liff/` ディレクトリ → 実際: 存在しない (LIFFはWorkerに統合)

---

# 本番デプロイ手順 (Cloudflare)

## 前提
- Cloudflareアカウント作成済み
- LINE Developers で Messaging API + LINE Login チャネル作成済み

## 手順

```powershell
# 1. D1 データベース作成
npx wrangler d1 create line-harness
# → 出力される database_id を apps/worker/wrangler.toml に記入
# → account_id も記入

# 2. スキーマ投入 (リモート)
cd apps/worker
npx wrangler d1 execute line-harness --file=../../packages/db/schema.sql --remote

# 3. シークレット設定
npx wrangler secret put API_KEY
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
npx wrangler secret put LINE_LOGIN_CHANNEL_SECRET

# 4. R2バケット作成 (画像機能を使う場合)
npx wrangler r2 bucket create line-harness-images

# 5. デプロイ
pnpm deploy:worker
# → https://line-harness.<subdomain>.workers.dev

# 6. LINE Developers Console で Webhook URL 設定
# → https://line-harness.<subdomain>.workers.dev/webhook
```

---

# 開発ルール

- 破壊的変更する前に必ず理由を説明
- 本番設定を勝手に書き換えない
- 変更はdiff形式で示す
- 最小変更で進める
- エラーは原因仮説を複数出して最短で切り分け
- コマンドはPowerShell向けを優先
