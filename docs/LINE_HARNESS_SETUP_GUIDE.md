# LINE Harness OSS — Windows向け完全セットアップガイド

このガイドは https://github.com/Shudesu/line-harness-oss を
Windows環境でローカル起動→本番デプロイまで行うための手順書です。

---

## 目次

1. [必要なアカウント・ツール一覧](#1-必要なアカウントツール一覧)
2. [ローカル環境構築](#2-ローカル環境構築)
3. [ローカル動作確認](#3-ローカル動作確認)
4. [LINE Developers セットアップ](#4-line-developers-セットアップ)
5. [ローカルWebhookテスト (ngrok)](#5-ローカルwebhookテスト-ngrok)
6. [Cloudflareデプロイ](#6-cloudflareデプロイ)
7. [管理画面デプロイ](#7-管理画面デプロイ)
8. [E2Eテスト](#8-e2eテスト)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. 必要なアカウント・ツール一覧

### ローカル動作確認のみ

| 項目 | 用途 | 入手方法 |
|------|------|---------|
| Node.js 20+ | ランタイム | https://nodejs.org/ |
| pnpm 9+ | パッケージマネージャ | `corepack enable` |
| Git | ソース管理 | https://git-scm.com/ |

### LINE連携テスト (追加)

| 項目 | 用途 | 入手方法 |
|------|------|---------|
| LINE Developers アカウント | チャネル作成 | https://developers.line.biz/ |
| ngrok | ローカルトンネル | https://ngrok.com/ |
| テスト用LINE公式アカウント | Webhook受信 | LINE Developers Console |

### 本番デプロイ (追加)

| 項目 | 用途 | 入手方法 |
|------|------|---------|
| Cloudflare アカウント | Workers/D1/R2 | https://dash.cloudflare.com/sign-up |
| Vercel アカウント (任意) | 管理画面ホスティング | https://vercel.com/ |

---

## 2. ローカル環境構築

### 2-1. Node.js & pnpm の確認

```powershell
node -v    # v20.0.0 以上であること
pnpm -v    # 9.x 以上であること

# pnpm が無い場合
corepack enable
```

### 2-2. クローン & インストール

```powershell
git clone https://github.com/Shudesu/line-harness-oss.git
cd line-harness-oss
pnpm install
```

所要時間: 約1〜3分（ネットワーク速度による）

### 2-3. 内部パッケージのビルド

```powershell
pnpm --filter @line-crm/shared build
pnpm --filter @line-crm/line-sdk build
```

注意: `@line-crm/db` はビルド不要（TypeScriptソースを直接参照する設計）

### 2-4. 環境変数ファイルの作成

**Worker用** (`apps/worker/.dev.vars`):

テキストエディタで `apps/worker/.dev.vars` を新規作成し、以下を記入:
```
API_KEY=test-local-api-key-12345
LINE_CHANNEL_ACCESS_TOKEN=dummy-for-local-testing
LINE_CHANNEL_SECRET=dummy-for-local-testing
LINE_LOGIN_CHANNEL_ID=dummy
LINE_LOGIN_CHANNEL_SECRET=dummy
```

PowerShellの場合:
```powershell
@"
API_KEY=test-local-api-key-12345
LINE_CHANNEL_ACCESS_TOKEN=dummy-for-local-testing
LINE_CHANNEL_SECRET=dummy-for-local-testing
LINE_LOGIN_CHANNEL_ID=dummy
LINE_LOGIN_CHANNEL_SECRET=dummy
"@ | Out-File -Encoding ascii apps\worker\.dev.vars
```

**管理画面用** (`apps/web/.env.local`):
```powershell
@"
NEXT_PUBLIC_API_URL=http://localhost:5173
"@ | Out-File -Encoding ascii apps\web\.env.local
```

### 2-5. ローカルD1データベースの初期化

```powershell
cd apps\worker
npx wrangler d1 execute line-harness --file=..\..\packages\db\schema.sql --local
cd ..\..
```

成功メッセージ: `80 commands executed successfully.`

**重要:** `apps/worker` ディレクトリで実行すること。ルートから実行するとDB名エラーになる。

---

## 3. ローカル動作確認

### 3-1. Worker (APIサーバー) 起動

```powershell
pnpm dev:worker
```

表示: `VITE ready in XXXms` → `http://localhost:5173/`

### 3-2. API疎通テスト

別のターミナルを開いて:

```powershell
# タグ一覧取得
Invoke-WebRequest -Uri "http://localhost:5173/api/tags" `
  -Headers @{ Authorization = "Bearer test-local-api-key-12345" } `
  | Select-Object -ExpandProperty Content
```

期待される応答: `{"success":true,"data":[]}`

```powershell
# タグ作成テスト
Invoke-WebRequest -Uri "http://localhost:5173/api/tags" `
  -Method POST `
  -Headers @{
    Authorization = "Bearer test-local-api-key-12345"
    "Content-Type" = "application/json"
  } `
  -Body '{"name":"テストタグ","color":"#FF0000"}' `
  | Select-Object -ExpandProperty Content
```

期待される応答: `{"success":true,"data":{"id":"...","name":"テストタグ","color":"#FF0000",...}}`

### 3-3. 管理画面 起動

```powershell
# 別のターミナルで
pnpm dev:web
```

ブラウザで `http://localhost:3001` を開く → 「LINE CRM 管理画面」が表示される

### 3-4. SDKテスト

```powershell
pnpm --filter @line-harness/sdk test
```

期待: `Test Files  9 passed (9)` / `Tests  43 passed (43)`

---

## 4. LINE Developers セットアップ

### 4-1. プロバイダー作成

1. https://developers.line.biz/console/ にログイン
2. 「プロバイダーを作成」→ 任意の名前（例: テスト用LINE Harness）

### 4-2. Messaging API チャネル作成

1. プロバイダー内で「チャネルを作成」→「Messaging API」
2. 必要情報を入力して作成
3. 以下をメモ:
   - **チャネルシークレット** (Basic settings) → `LINE_CHANNEL_SECRET`
   - **チャネルアクセストークン** (Messaging API settings → Issue) → `LINE_CHANNEL_ACCESS_TOKEN`

### 4-3. LINE Login チャネル作成

1. **同じプロバイダー内**で「チャネルを作成」→「LINE Login」
2. 以下をメモ:
   - **チャネルID** → `LINE_LOGIN_CHANNEL_ID`
   - **チャネルシークレット** → `LINE_LOGIN_CHANNEL_SECRET`

**重要:** LINE Login チャネルがないと `/auth/line` 経由のUUID取得ができない

### 4-4. .dev.vars を本物の値に更新

```
API_KEY=your-secure-api-key-here
LINE_CHANNEL_ACCESS_TOKEN=<4-2で取得した値>
LINE_CHANNEL_SECRET=<4-2で取得した値>
LINE_LOGIN_CHANNEL_ID=<4-3で取得した値>
LINE_LOGIN_CHANNEL_SECRET=<4-3で取得した値>
```

---

## 5. ローカルWebhookテスト (ngrok)

### 5-1. ngrok インストール & 起動

```powershell
# ngrok をインストール済みの前提
ngrok http 5173
```

表示される Forwarding URL をメモ: `https://xxxx-xxxx.ngrok-free.app`

### 5-2. LINE Developers Console で Webhook URL 設定

1. Messaging API settings → Webhook URL
2. `https://xxxx-xxxx.ngrok-free.app/webhook` を設定
3. 「Webhookの利用」をオンにする
4. 「検証」ボタンを押して成功を確認

### 5-3. 友だち追加テスト

1. Messaging API settings に表示されるQRコードをスキャン
2. 友だち追加する
3. Worker のコンソールに follow イベントのログが出ること確認
4. API で友だちが登録されたか確認:

```powershell
Invoke-WebRequest -Uri "http://localhost:5173/api/friends" `
  -Headers @{ Authorization = "Bearer your-secure-api-key-here" } `
  | Select-Object -ExpandProperty Content
```

---

## 6. Cloudflareデプロイ

### 6-1. Cloudflare アカウント & wrangler ログイン

```powershell
npx wrangler login
```

### 6-2. D1 データベース作成

```powershell
npx wrangler d1 create line-harness
```

出力される `database_id` をメモし、`apps/worker/wrangler.toml` を編集:
```toml
account_id = "<your-account-id>"

[[d1_databases]]
binding = "DB"
database_name = "line-harness"
database_id = "<出力されたdatabase_id>"
```

### 6-3. スキーマ投入 (リモート)

```powershell
cd apps\worker
npx wrangler d1 execute line-harness --file=..\..\packages\db\schema.sql --remote
```

### 6-4. R2バケット作成

```powershell
npx wrangler r2 bucket create line-harness-images
```

### 6-5. シークレット設定

```powershell
npx wrangler secret put API_KEY
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
npx wrangler secret put LINE_LOGIN_CHANNEL_SECRET
```

### 6-6. デプロイ

```powershell
cd apps\worker
pnpm deploy
```

デプロイ先: `https://line-harness.<subdomain>.workers.dev`

### 6-7. LINE Webhook URL を本番URLに更新

LINE Developers Console → Messaging API → Webhook URL:
```
https://line-harness.<subdomain>.workers.dev/webhook
```

---

## 7. 管理画面デプロイ

管理画面は `output: 'export'` の静的サイトなので、Vercel / Cloudflare Pages / 任意のホスティングに配置可能。

### Vercelの場合

```powershell
cd apps\web
npx vercel --prod
```

環境変数:
```
NEXT_PUBLIC_API_URL=https://line-harness.<subdomain>.workers.dev
```

### Cloudflare Pages の場合

```powershell
cd apps\web
pnpm build
npx wrangler pages deploy out
```

---

## 8. E2Eテスト

1. デプロイ済みWorker URLでAPI疎通確認
2. LINE Developers Console で Webhook URL を本番URLに設定
3. QRコードで友だち追加
4. 管理画面で友だちが表示されることを確認
5. シナリオを作成し、友だち追加トリガーで自動配信されることを確認
6. タグ付与、ブロードキャスト、自動返信をそれぞれテスト

---

## 9. トラブルシューティング

### pnpm install でエラー

```powershell
# pnpmバージョンを合わせる
corepack use pnpm@9.15.4
pnpm install
```

### DB名エラー (`Couldn't find a D1 DB with the name`)

`apps/worker` ディレクトリで実行しているか確認。ルートからだとwrangler.tomlを読めない。

### ポート5173が使用中

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### .dev.vars が読み込まれない

- ファイルがBOM付きUTF-8の可能性 → テキストエディタで「UTF-8 (BOMなし)」で保存し直す
- ファイル名が `.dev.vars.txt` になっていないか確認

### Worker typecheck エラー (`Cannot find name 'c'`)

上流リポジトリの既知バグ。webhook.ts:285行目。実行には影響なし。

### SDK ビルドで DTS エラー (`Cannot find name 'URL'`)

上流リポジトリの既知バグ。tsconfig の lib に DOM がない。JS/CJSビルドは成功する。
