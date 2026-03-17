# NFC x LINE x LP 営業支援SaaS MVP - 実装状況レポート

## 1. プロジェクト概要

NFCタッチから営業担当者専用LPを表示し、会社支給LINEへ誘導する営業支援システムのMVP。

- **リポジトリ**: https://github.com/tsailink0611/nfc-line-lp-saas
- **ブランチ**: `develop`（main への直接コミット禁止）
- **作成日**: 2026-03-17
- **ビルド状態**: `npm run build` 成功（型エラーゼロ、Warning のみ）

---

## 2. 現在の完成度

| レイヤー | 完成度 | 状態 |
|---------|--------|------|
| コード実装 | 90% | build成功、全ページ・全CRUDのコード完成。Warning軽微 |
| ローカル動作確認 | 0% | Supabase未接続のため動作確認不可 |
| 本番デプロイ | 0% | Cloudflare Workers 未デプロイ |

**`npm run build` 成功 = コード整合性OK。本番疎通 = まだこれから。**

---

## 3. 未接続の環境タスク（最優先）

コードは書き終わっているが、以下が未接続のため動作しない:

- [ ] **Supabase プロジェクト未作成**
- [ ] **DDL 未適用**（`001_initial_schema.sql` → `002_rls_policies.sql`）
- [ ] **Storage バケット未作成**（`public-assets`、RLS の SQL で INSERT 済みだが Supabase 側の確認が必要）
- [ ] **`.env.local` 未設定**（Supabase URL / ANON KEY）
- [ ] **Auth ユーザー未作成**（テスト管理者）
- [ ] **初期データ未投入**（companies / admin_users / lp_settings の最低1レコード）
- [ ] **Cloudflare Workers 未デプロイ**
- [ ] **NFC 実機未確認**

---

## 4. 次にやること（優先順位順、5個）

1. **Supabase プロジェクト作成 + migration 適用**
2. **`.env.local` に Supabase URL / ANON KEY を設定**
3. **Auth テスト管理者作成 + 初期データ1件投入**（companies, admin_users, lp_settings）
4. **`npm run dev` → `/admin/login` ログイン → 担当者1名登録**
5. **`/staff/[slug]` と `/n/[token]` の実動作確認**

この5つが通れば MVP は動く。機能追加より疎通確認が本題。

---

## 5. やらないこと（明示的スコープ外）

- 顧客DB は作らない
- ROI ダッシュボード / ログ分析画面は作らない
- Workflows / D1 は使わない
- LINE 公式アカウント前提にしない（担当者個別の会社支給LINE）
- 権限は admin のみ（営業担当者個別ログインなし）
- マルチテナント厳密分離はしない（company_id で将来対応可能にするだけ）
- 監査ログ / 多段承認フローは入れない

---

## 6. 参照の起点

| 役割 | ファイル |
|------|---------|
| 仕様の正 | `docs/00_project-brief.md` ほか分割仕様書（00〜09） |
| 現状の正 | `docs/IMPLEMENTATION_STATUS.md`（このファイル） |
| 変更履歴の正 | `docs/09_change-log.md` |

---

## 7. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.3.2 |
| UI | React + Tailwind CSS | React 19.1 / Tailwind 4.1 |
| 言語 | TypeScript (strict) | 5.8.3 |
| DB / Auth / Storage | Supabase | supabase-js 2.49 / ssr 0.6 |
| インフラ | Cloudflare Workers + OpenNext | @opennextjs/cloudflare 1.0 / wrangler 4.14 |
| バリデーション | Zod | 3.24 |
| アイコン | lucide-react | 0.468 |
| CSS ユーティリティ | clsx + tailwind-merge | - |

### インフラ方針の決定経緯

当初は Cloudflare Pages + `@cloudflare/next-on-pages` を予定していたが、以下の理由で変更:

1. **Cloudflare 公式が Workers + OpenNext adapter を推奨**（2025年以降）
2. **ISR がサポートされる**（Pages + next-on-pages では不可だった）
3. **wrangler.jsonc が推奨**（TOML ではなく JSON 形式）
4. `export const runtime = 'edge'` は adapter に委譲し、必要箇所のみ明示

---

## 8. ディレクトリ構成

```
nfc-line-lp-saas/
├── wrangler.jsonc              # Cloudflare Workers 設定
├── open-next.config.ts         # OpenNext adapter 設定
├── package.json
├── tsconfig.json
├── next.config.ts              # Supabase Storage の remotePatterns 設定
├── postcss.config.mjs
├── .env.local.example          # 環境変数テンプレート
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # 9テーブル + インデックス + トリガー
│       └── 002_rls_policies.sql     # RLS + Storage バケット
├── docs/                       # 設計書（分割MD）
└── src/
    ├── middleware.ts            # 認証ガード（/admin/* → ログインリダイレクト）
    ├── types/
    │   └── database.ts         # 全テーブル TypeScript 型定義
    ├── lib/
    │   ├── utils.ts            # cn() = clsx + tailwind-merge
    │   ├── supabase/
    │   │   ├── client.ts       # ブラウザ用 createBrowserClient
    │   │   ├── server.ts       # Server Component 用 createServerClient（cookie ベース）
    │   │   ├── middleware.ts   # Middleware 用 createServerClient
    │   │   └── static.ts      # ビルド時用匿名クライアント（generateStaticParams 用）
    │   └── validators/
    │       ├── staff.ts        # 担当者 Zod スキーマ
    │       ├── store.ts        # 店舗 Zod スキーマ
    │       ├── campaign.ts     # キャンペーン Zod スキーマ
    │       ├── nfc.ts          # NFC トークン Zod スキーマ
    │       └── settings.ts     # 会社設定 / LP設定 Zod スキーマ
    ├── components/
    │   ├── ui/                 # 共通UI（Button, Input, Label, Textarea, Select, Card, Badge, Toggle, Dialog）
    │   ├── lp/                 # LP セクション（11コンポーネント）
    │   └── admin/              # 管理画面（13コンポーネント）
    └── app/
        ├── layout.tsx          # ルートレイアウト（Noto Sans JP）
        ├── globals.css         # Tailwind + テーマカラー定義
        ├── (public)/
        │   ├── page.tsx                    # トップページ（最小）
        │   ├── staff/[slug]/page.tsx       # 担当者LP（SSG/ISR, revalidate=60）
        │   └── n/[token]/route.ts          # NFCリダイレクト（Route Handler）
        └── admin/
            ├── login/page.tsx              # ログインフォーム
            ├── layout.tsx                  # サイドバー付きレイアウト
            ├── page.tsx                    # ダッシュボード
            ├── staff/                      # 担当者 CRUD（一覧/新規/編集 + actions.ts）
            ├── stores/                     # 店舗 CRUD（一覧/新規/編集 + actions.ts）
            ├── campaigns/                  # キャンペーン CRUD（一覧/新規/編集 + actions.ts）
            ├── nfc/                        # NFC管理（一覧/発行/有効無効 + actions.ts）
            └── settings/                   # 設定（会社情報/LP設定 + actions.ts）
```

---

## 9. DB スキーマ（9テーブル）

### テーブル一覧

| テーブル | 説明 | 主要カラム |
|---------|------|-----------|
| companies | 会社 | company_code (UNIQUE), primary_color, is_active |
| stores | 店舗 | company_id FK, store_code, UNIQUE(company_id, store_code) |
| staff_members | 担当者 | company_id FK, store_id FK, slug (UNIQUE), is_public, sort_order |
| staff_badges | バッジ | staff_member_id FK CASCADE, label, sort_order |
| galleries | ギャラリー | staff_member_id FK CASCADE, image_url, sort_order |
| campaigns | キャンペーン | company_id FK, store_id FK nullable, is_public, start/end_date |
| nfc_tokens | NFCトークン | company_id FK, staff_member_id FK, token (UNIQUE), target_path, is_active |
| lp_settings | LP設定 | company_id FK UNIQUE (1:1), hero_catch, cta_label, theme_type |
| admin_users | 管理者 | company_id FK, auth_user_id UNIQUE (auth.users, ON DELETE SET NULL), role |

### インデックス設計
- 全 FK カラムにインデックス
- `staff_members(company_id, is_public, sort_order)` 複合インデックス（LP一覧用）
- `campaigns(company_id, is_public, sort_order)` 複合インデックス
- slug, token は UNIQUE 制約でカバー

### RLS 設計
- ヘルパー関数 `is_admin_of(company_id)` で管理者判定を一元化（SECURITY DEFINER）
- 公開テーブル: `SELECT WHERE is_active/is_public = true`（匿名可）
- 管理操作: `is_admin_of(company_id)` で company_id 紐づき admin のみ
- admin_users: 自身のレコードのみ SELECT 可
- Storage: `public-assets` バケット（公開読取、認証済みアップロード）

### 設計上の注意点
- `admin_users.auth_user_id` は `auth.users(id) ON DELETE SET NULL` — auth ユーザー削除時に admin_user レコードは残る
- 初期は1社運用だが、全主要テーブルに `company_id` を持ち将来複数社対応可能
- 顧客DBは持たない（設計方針）
- page_visits / nfc_resolutions ログテーブルは初期省略

---

## 10. 実装済み機能一覧

### 10-1. 認証基盤
- [x] Supabase Auth（email/password）
- [x] Next.js Middleware で `/admin/*` を認証ガード（login 除く）
- [x] ログイン済みで `/admin/login` アクセス時は `/admin` へリダイレクト
- [x] ログアウト機能（サイドバー内）

### 10-2. 担当者LP（公開側）
- [x] `/staff/[slug]` — SSG/ISR（revalidate=60, generateStaticParams）
- [x] 10セクション構成:
  1. HeroSection（メイン画像 + キャッチコピー + CTA）
  2. ProfileSection（担当者紹介）
  3. SpecialtySection（バッジ + 得意分野）
  4. StoreSection（店舗情報 + 連絡先）
  5. CampaignSection（キャンペーンカード）
  6. GallerySection（画像グリッド 2列）
  7. VideoSection（YouTube 埋め込み）
  8. MapSection（Google Map 埋め込み）
  9. LineCtaSection（LINE追加ボタン大）
  10. FooterSection（会社情報）
- [x] FloatingCta — モバイル sticky bottom bar（スクロール300px以降で表示）
- [x] モバイルファースト設計（max-w-md 中央配置）
- [x] LINE CTA は担当者個別の会社支給LINE URL（LINE公式アカウントではない）

### 10-3. NFCトークンリダイレクト
- [x] `/n/[token]` — Route Handler
- [x] token → nfc_tokens テーブル照合 → target_path へ 302 リダイレクト
- [x] 無効/非アクティブトークン → HTMLエラーページ（404）

### 10-4. 管理画面
- [x] サイドバーレイアウト（モバイルハンバーガー対応）
- [x] ダッシュボード（統計カード4枚 + 最新更新一覧）
- [x] 担当者 CRUD（一覧/新規/編集 + バッジ管理 + ギャラリー管理）
- [x] 店舗 CRUD（一覧/新規/編集）
- [x] キャンペーン CRUD（一覧/新規/編集、適用店舗選択）
- [x] NFC管理（トークン発行/一覧/有効無効切替/削除）
- [x] 設定（会社情報 + ロゴアップロード + テーマカラー + LP設定）

### 10-5. 共通パターン
- [x] 全フォームは Server Actions で処理
- [x] Zod バリデーション（日本語エラーメッセージ）
- [x] 画像アップロード: Supabase Storage（5MB制限、MIMEチェック）
- [x] 成功時 `revalidatePath` で一覧を更新
- [x] 削除は確認ダイアログ付き

---

## 11. 既知の課題（軽微）

### ビルド Warning（エラーではない）
- `<img>` → `next/image` の `<Image>` に置き換え推奨（LP内6箇所、管理画面1箇所）
- Google Fonts の読み込み方法を `next/font` に変更推奨
- これらは機能に影響なし、パフォーマンス最適化として後日対応可能

### 設計上の注意点
- `settings-company-form.tsx` の color picker: `<input type="color">` と `<Input readOnly>` の二重構造で name 重複の可能性
- Supabase のリレーション展開で `as unknown as` キャストを使用している箇所あり
- `generateStaticParams` は環境変数未設定時に空配列を返すガード付き

---

## 12. 実装の経緯（時系列）

### Phase 1: プロジェクト初期構築
1. 設計書（00〜09の分割MD）を読み込み、仕様を把握
2. 実装計画を策定（7フェーズ、17ステップ）
3. `create-next-app` が環境問題でタイムアウト → Write ツールで手動構築
4. package.json, tsconfig.json, next.config.ts, wrangler.jsonc, open-next.config.ts を作成

### Phase 2: Supabase スキーマ + RLS
1. `001_initial_schema.sql` — 9テーブル + FK インデックス + 複合インデックス + updated_at トリガー
2. `002_rls_policies.sql` — `is_admin_of()` ヘルパー関数 + 全テーブル RLS + Storage ポリシー
3. `src/types/database.ts` — 全テーブルの TypeScript 型 + StaffLpData 結合型

### Phase 3: 認証基盤
1. Supabase SSR クライアント3種（browser, server, middleware） + ビルド用 static クライアント
2. Next.js Middleware で admin ルート保護
3. ログインページ（Client Component）

### Phase 4: 管理画面 CRUD
1. UIコンポーネント9種
2. 管理画面レイアウト（サイドバー + モバイル対応）
3. ダッシュボード + 全CRUD（担当者/店舗/キャンペーン/NFC/設定）

### Phase 5: 担当者LP + NFCリダイレクト
1. LP セクションコンポーネント10種 + FloatingCta
2. `/staff/[slug]` ページ（SSG/ISR）
3. `/n/[token]` Route Handler

### Phase 6: GitHub リポジトリ + ビルド修正
1. GitHub リポジトリ作成 → MCP 経由で全コードプッシュ（3バッチ）
2. `npm install` + `npm run build`
3. 型エラー3件修正（cookiesToSet 型注釈、static client 分離、env ガード、未使用 import）

### 環境問題と対処
- **Bash タイムアウト**: ホームディレクトリの重さが原因。プロジェクトディレクトリ起点で解決
- **`.bash_profile` に `claude` コマンド**: シェル起動の無限ループ → 削除
- **`.bashrc` に壊れた文字列**: パースエラー → クリーンアップ

---

## 13. 中期的な改善（MVP動作後）

1. `<img>` → `next/image` 置き換え（LCP改善）
2. Google Fonts → `next/font/google` に変更
3. LP デザインの高級感向上
4. 管理画面のドラッグ&ドロップ並び替え
5. Seed データスクリプト / LP プレビュー機能

---

## 14. 長期的な拡張可能性

- 複数社対応（company_id は既に全テーブルに配置済み）
- ログ分析（page_visits / nfc_resolutions テーブルは設計済み）
- LINE 公式アカウント連携
- キャンペーンの期間自動公開/非公開

---

## 15. レビュー観点（レビュアー向け）

1. **DB設計**: FK / インデックス / RLS ポリシーの妥当性
2. **セキュリティ**: RLS漏れ、環境変数管理、XSS対策
3. **Cloudflare Workers 互換性**: OpenNext adapter との互換性
4. **Next.js パターン**: Server Actions / Server Components / ISR の使い方
5. **型安全性**: Supabase レスポンスの型キャスト箇所
6. **コンポーネント設計**: 再利用性、props 設計
7. **パフォーマンス**: bundle size、LCP最適化
8. **将来の拡張性**: マルチテナント対応のしやすさ
