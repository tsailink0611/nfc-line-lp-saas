# NFC x LINE x LP 営業支援SaaS MVP - 実装状況レポート

## 1. プロジェクト概要

NFCタッチから営業担当者専用LPを表示し、会社支給LINEへ誘導する営業支援システムのMVP。

- **リポジトリ**: https://github.com/tsailink0611/nfc-line-lp-saas
- **ブランチ**: `develop`（main への直接コミット禁止）
- **作成日**: 2026-03-17
- **ビルド状態**: `npm run build` 成功（型エラーゼロ、Warning のみ）

---

## 2. 技術スタック

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

## 3. ディレクトリ構成

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

## 4. DB スキーマ（9テーブル）

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
- ヘルパー関数 `is_admin_of(company_id)` で管理者判定を一元化
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

## 5. 実装済み機能一覧

### 5-1. 認証基盤
- [x] Supabase Auth（email/password）
- [x] Next.js Middleware で `/admin/*` を認証ガード（login 除く）
- [x] ログイン済みで `/admin/login` アクセス時は `/admin` へリダイレクト
- [x] ログアウト機能（サイドバー内）

### 5-2. 担当者LP（公開側）
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

### 5-3. NFCトークンリダイレクト
- [x] `/n/[token]` — Route Handler
- [x] token → nfc_tokens テーブル照合 → target_path へ 302 リダイレクト
- [x] 無効/非アクティブトークン → HTMLエラーページ（404）

### 5-4. 管理画面
- [x] サイドバーレイアウト（モバイルハンバーガー対応）
- [x] ダッシュボード（統計カード4枚 + 最新更新一覧）
- [x] 担当者 CRUD（一覧/新規/編集 + バッジ管理 + ギャラリー管理）
- [x] 店舗 CRUD（一覧/新規/編集）
- [x] キャンペーン CRUD（一覧/新規/編集、適用店舗選択）
- [x] NFC管理（トークン発行/一覧/有効無効切替/削除）
- [x] 設定（会社情報 + ロゴアップロード + テーマカラー + LP設定）

### 5-5. 共通パターン
- [x] 全フォームは Server Actions で処理
- [x] Zod バリデーション（日本語エラーメッセージ）
- [x] 画像アップロード: Supabase Storage（5MB制限、MIMEチェック）
- [x] 成功時 `revalidatePath` で一覧を更新
- [x] 削除は確認ダイアログ付き

---

## 6. 未実装・既知の課題

### 6-1. 環境未構築（次のステップ）
- [ ] **Supabase プロジェクト未作成** — DDL / RLS は SQL ファイルとして用意済み、適用が必要
- [ ] **`.env.local` 未設定** — Supabase URL / ANON KEY の設定が必要
- [ ] **初期データ投入** — 最低1社 + 1管理者の Seed データが必要
- [ ] **Cloudflare Workers デプロイ未実施**

### 6-2. ビルド Warning（エラーではない）
- `<img>` → `next/image` の `<Image>` に置き換え推奨（LP内6箇所、管理画面1箇所）
- Google Fonts の読み込み方法を `next/font` に変更推奨
- これらは機能に影響なし、パフォーマンス最適化として後日対応可能

### 6-3. 設計上の制約・注意点
- `settings-company-form.tsx` の color picker が `<input type="color">` と `<Input readOnly>` の二重構造 — color picker の値変更が Input に反映されない（hidden input に name が重複する可能性あり）
- 担当者 LP の staff list ページ: Supabase のリレーション展開で `store` が配列/オブジェクトの型判定に `as` キャストを使用
- `generateStaticParams` は環境変数未設定時に空配列を返す（ビルド時のフォールバック）

### 6-4. スコープ外（設計方針として実装しない）
- 顧客詳細 DB / CRM
- ログ分析画面 / ROI ダッシュボード
- 複雑な権限管理 / 営業担当者個別ログイン
- マルチテナント厳密分離
- LINE 公式アカウント連携
- 監査ログ / 多段承認フロー

---

## 7. 実装の経緯（時系列）

### Phase 1: プロジェクト初期構築
1. 設計書（00〜09の分割MD）を読み込み、仕様を把握
2. 実装計画を策定（7フェーズ、17ステップ）
3. `create-next-app` が環境問題でタイムアウト → Write ツールで手動構築
4. package.json, tsconfig.json, next.config.ts, wrangler.jsonc, open-next.config.ts を作成
5. 追加パッケージ: @supabase/supabase-js, @supabase/ssr, zod, lucide-react, clsx, tailwind-merge

### Phase 2: Supabase スキーマ + RLS
1. `001_initial_schema.sql` — 9テーブル + FK インデックス + 複合インデックス + updated_at トリガー
2. `002_rls_policies.sql` — `is_admin_of()` ヘルパー関数 + 全テーブル RLS + Storage ポリシー
3. `src/types/database.ts` — 全テーブルの TypeScript 型 + StaffLpData 結合型

### Phase 3: 認証基盤
1. Supabase SSR クライアント3種（browser, server, middleware）
2. Next.js Middleware で admin ルート保護
3. ログインページ（Client Component）

### Phase 4: 管理画面 CRUD
1. UIコンポーネント9種（Button, Input, Label, Textarea, Select, Card, Badge, Toggle, Dialog）
2. 管理画面レイアウト（サイドバー + モバイル対応）
3. ダッシュボード（統計カード + 最新更新）
4. 担当者 CRUD（StaffForm + BadgeManager + GalleryManager + ImageUpload）
5. 店舗 CRUD（StoreForm）
6. キャンペーン CRUD（CampaignForm）
7. NFC管理（NfcCreateForm + NfcTokenRow + toggle/delete）
8. 設定（SettingsCompanyForm + SettingsLpForm）

### Phase 5: 担当者LP + NFCリダイレクト
1. LP セクションコンポーネント10種 + FloatingCta
2. `/staff/[slug]` ページ（SSG/ISR, generateStaticParams, データ取得ロジック）
3. `/n/[token]` Route Handler（302リダイレクト、無効時404）
4. トップページ（最小）

### Phase 6: GitHub リポジトリ + ビルド修正
1. GitHub リポジトリ作成（private）
2. Bash タイムアウト問題 → GitHub MCP で直接プッシュ（3バッチ）
3. `develop` ブランチ作成
4. ローカル `npm install` + `npm run build`
5. 型エラー修正:
   - `cookiesToSet` の暗黙 any 型 → 明示的型注釈
   - `generateStaticParams` 内の cookies() 呼び出し → static client 分離
   - 環境変数未設定時のガード追加
   - 未使用 import 削除

### 環境問題と対処
- **Bash タイムアウト**: ホームディレクトリの重さが原因。プロジェクトディレクトリを起点にすることで解決
- **`.bash_profile` に `claude` コマンド**: シェル起動の無限ループ → 削除
- **`.bashrc` にUTF-16壊れ文字列**: パースエラー → クリーンアップ

---

## 8. 今後の開発方針

### 直近のタスク（MVP完成まで）

1. **Supabase プロジェクト作成 + スキーマ適用**
   - Supabase ダッシュボードでプロジェクト作成
   - SQL Editor で `001_initial_schema.sql` → `002_rls_policies.sql` を順に実行
   - Storage バケット `public-assets` の作成確認

2. **環境変数設定**
   - `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定

3. **初期データ投入**
   - Supabase Auth でテスト管理者ユーザーを作成
   - companies テーブルに初期会社データを INSERT
   - admin_users テーブルに管理者レコードを INSERT（auth_user_id 紐付け）
   - lp_settings に初期設定を INSERT

4. **動作確認**
   - `npm run dev` でローカル確認
   - `/admin/login` → ログイン → 各CRUD動作確認
   - 担当者登録 → `/staff/[slug]` でLP表示確認
   - NFCトークン発行 → `/n/[token]` でリダイレクト確認

5. **Cloudflare Workers デプロイ**
   - `npm run deploy` で初回デプロイ
   - Cloudflare ダッシュボードで環境変数設定
   - カスタムドメイン設定

### 中期的な改善（MVP後）

1. **パフォーマンス最適化**
   - `<img>` → `next/image` の `<Image>` に置き換え（LCP改善）
   - Google Fonts → `next/font/google` に変更
   - 画像の lazy loading / サイズ指定

2. **UX改善**
   - LP デザインの高級感向上（グラデーション、アニメーション）
   - 管理画面のドラッグ&ドロップ並び替え
   - 画像クロップ機能

3. **運用機能**
   - Seed データスクリプト
   - 管理者招待機能
   - LP プレビュー機能（管理画面内）

### 長期的な拡張可能性

- 複数社対応（company_id は既に全テーブルに配置済み）
- ログ分析（page_visits / nfc_resolutions テーブルは設計済み、実装は省略）
- LINE 公式アカウント連携
- キャンペーンの期間自動公開/非公開

---

## 9. レビュー観点（レビュアー向け）

以下の観点でのレビューを歓迎します:

1. **DB設計**: FK / インデックス / RLS ポリシーの妥当性
2. **セキュリティ**: RLS漏れ、環境変数管理、XSS対策
3. **Cloudflare Workers 互換性**: OpenNext adapter との互換性、edge runtime の扱い
4. **Next.js パターン**: Server Actions / Server Components / ISR の使い方
5. **型安全性**: Supabase レスポンスの型キャスト箇所
6. **コンポーネント設計**: 再利用性、props 設計
7. **パフォーマンス**: bundle size、LCP最適化
8. **将来の拡張性**: マルチテナント対応のしやすさ
