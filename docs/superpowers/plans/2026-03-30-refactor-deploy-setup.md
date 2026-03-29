# デプロイ構成リファクタリング 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** developブランチを主開発ラインとして確立し、mainに混入したデプロイ回避ワークアラウンドを除去してリポジトリを安定状態に戻す。

**Architecture:** mainをベースにdevelopブランチをリセット→不要なファイルを除去→クリーンなデプロイスクリプトを整備→.gitignoreを更新してゴミファイルが混入しない状態にする。

**Tech Stack:** Next.js 15 / @opennextjs/cloudflare v1 / Wrangler v4 / Git

---

## 変更対象ファイル一覧

| 操作 | ファイル | 理由 |
|---|---|---|
| 変更 | `next.config.ts` | `output: "standalone"` を削除（opennextjs-cloudflareと干渉） |
| 変更 | `package.json` | deployスクリプトを元の形に戻す |
| 削除 | `scripts/deploy.mjs` | ジャンクション方式は廃止 |
| 削除 | `deploy_log.txt` | ゴミファイル |
| 削除 | `Users/` | ジャンクション経由の混入ファイル |
| 変更 | `.gitignore` | deploy_log.txt、.open-next/等を追加 |

---

## Task 1: developブランチをmainに合わせてリセット

**Files:**
- Modify: `.git/` (gitコマンドのみ)

- [ ] **Step 1: ローカルのdevelopブランチをmainと同一状態にリセット**

```bash
cd "C:/Users/tsail/Desktop/claude code 経営システム/nfc-line-lp-saas"
git fetch origin
git checkout develop
git reset --hard origin/main
```

Expected output:
```
HEAD is now at f95b412 feat: remove extra LINE CTA and booking section
```

- [ ] **Step 2: リモートのdevelopブランチに強制プッシュ**

```bash
git push origin develop --force-with-lease
```

Expected: `develop -> develop (forced update)`

---

## Task 2: next.config.ts から output: "standalone" を除去

**Files:**
- Modify: `next.config.ts`

**なぜ除去するか：** `@opennextjs/cloudflare` は独自のビルドパイプラインを持ち、`output: "standalone"` の設定と競合する。この設定はVercelデプロイ用であり、Cloudflare Workersには不要。

- [ ] **Step 1: next.config.ts を修正**

`next.config.ts` を以下の内容に書き換える：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: ビルドが通ることを確認**

```bash
npm run build
```

Expected: `✓ Compiled successfully` （エラーなし）

- [ ] **Step 3: コミット**

```bash
git add next.config.ts
git commit -m "fix: remove output:standalone incompatible with opennextjs-cloudflare"
```

---

## Task 3: package.json のデプロイスクリプトを元に戻す

**Files:**
- Modify: `package.json`

**なぜ戻すか：** `_deploy` / `deploy: node scripts/deploy.mjs` という二重構成は混乱を招く。ジャンクション方式を廃止し、`scripts` セクションを明瞭に保つ。

- [ ] **Step 1: package.json の scripts セクションを修正**

`"scripts"` セクションを以下に書き換える：

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "preview": "opennextjs-cloudflare build && wrangler dev",
  "deploy": "opennextjs-cloudflare build && wrangler deploy"
},
```

- [ ] **Step 2: コミット**

```bash
git add package.json
git commit -m "fix: restore original deploy script, remove junction workaround"
```

---

## Task 4: ゴミファイルの削除と .gitignore の整備

**Files:**
- Delete: `scripts/deploy.mjs`
- Delete: `deploy_log.txt`
- Delete: `Users/` (ディレクトリごと)
- Modify: `.gitignore`

- [ ] **Step 1: .gitignore を確認・更新**

現在の `.gitignore` に以下が含まれていなければ追記する：

```
# Cloudflare build output
.open-next/

# Deploy logs
deploy_log.txt

# Windows junction artifacts
Users/

# Local scripts
scripts/
```

- [ ] **Step 2: 不要ファイルを削除**

```bash
rm -rf scripts/
rm -f deploy_log.txt
rm -rf Users/
```

- [ ] **Step 3: ステージングして確認**

```bash
git status
```

Expected: `scripts/`, `deploy_log.txt`, `Users/` が「deleted」または「untracked」として表示される。

- [ ] **Step 4: コミット**

```bash
git add .gitignore
git rm -r --cached scripts/ 2>/dev/null || true
git rm --cached deploy_log.txt 2>/dev/null || true
git rm -r --cached Users/ 2>/dev/null || true
git commit -m "chore: remove deploy workaround artifacts, update .gitignore"
```

---

## Task 5: developブランチをリモートにプッシュして動作確認

- [ ] **Step 1: プッシュ**

```bash
git push origin develop
```

- [ ] **Step 2: ブランチ状態を確認**

```bash
git log --oneline -5
git status
```

Expected: `working tree clean`、ローカルとリモートが一致

- [ ] **Step 3: ビルド最終確認**

```bash
npm run build
```

Expected: エラーなし

---

## 完了後の運用ルール

| ルール | 内容 |
|---|---|
| 開発ブランチ | `develop` を主開発ライン、`feature/*` で個別機能 |
| mainへのマージ | `develop` → `main` へPR経由のみ |
| デプロイ | ローカルから `npm run deploy`（Windowsの場合はWSL推奨）またはCloudflare DashboardのGitHub連携 |
| コミット禁止 | mainへの直接コミット禁止 |
