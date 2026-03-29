## このリポジトリの位置づけと開発フロー

### 全体像

このリポジトリ（NFC営業OS）は、中小企業AX化を推進する4事業のうち**NFC事業の実装・コード資産**を管理する。経営判断・提案設計・要件定義・品質基準のナレッジは ai-organization-os リポジトリ（経営OS）に集約されている。

```
ai-organization-os（経営OS）
        ┌─────────────────────────┐
        │  経営判断・設計・品質基準   │
        │  スキル / エージェント     │
        │  ルール / テンプレート      │
        └────────┬────────────────┘
                 │ Plan / Act
┌────────────────┼────────────────┐
│                │                │
▼                ▼                ▼
★ 本リポ        チャットボット    DX伴走・メモリアル
NFC営業OS       （今後整備）      （今後整備）
                Do / Check
```

### 役割分担

| リポジトリ | 役割 | 扱うもの |
|---|---|---|
| ai-organization-os（経営OS） | Plan / Act（考える・改善する） | スキル・テンプレート・ルール・設計書・要件定義・経営判断 |
| 本リポ（NFC営業OS） | Do / Check（作る・検証する） | 管理画面・LP・DB・API・Cloudflare Workers・デプロイ |

### PDCAサイクル

```
ai-organization-os              本リポ（NFC営業OS）
━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━
Plan ──────────────────────→ Do
・ヒアリング整理                ・コード実装
・要件定義                     ・DB設計（Supabase）
・提案書・営業シナリオ設計       ・LP構築・Workers開発
・品質基準の定義                ・管理画面の機能追加

Act ←────────────────────── Check
・スキル改善                    ・テスト結果
・テンプレート更新               ・顧客フィードバック
・評価基準の調整                ・スキャン数・KPI数値
・新パターンのスキル化           ・障害・改善要望
```

### 経営OSからの引き渡しフロー

1. 経営OSリポで要件定義・設計書・画面設計をMarkdownで作成する
2. その出力を本リポのセッションに渡して実装する
3. 実装結果（テスト結果・顧客フィードバック・KPI数値）を経営OSリポにフィードバックする
4. 経営OS側でスキル・テンプレート・評価基準を改善する

### 経営OSリポの参照先

設計判断に迷ったとき、以下の基準を参照すること：

- NFC製品全体像：`~/ai-organization-os/.claude/skills/nfc-product-overview/`
- 提案書テンプレート：`~/ai-organization-os/templates/proposal.md`
- 品質評価基準：`~/ai-organization-os/.claude/rules/evaluation-criteria.md`
- 文書スタイル：`~/ai-organization-os/.claude/rules/writing-style.md`
- 機密情報ルール：`~/ai-organization-os/.claude/rules/confidentiality.md`
- 安全表現ルール：`~/ai-organization-os/.claude/rules/safety.md`

#### 環境別の参照方法

| 環境 | 参照方法 |
|---|---|
| ローカル Claude Code CLI | 上記パス（`~/ai-organization-os/...`）を直接参照可能 |
| Claude Code Web セッション | 1リポ＝1セッションのため直接参照不可。経営OSリポの設計書・要件定義はセッション間で手動コピー（貼り付け）して引き渡す |

```
ローカルPC
├── ~/ai-organization-os/        ← 経営OS（Plan/Act）
│   └── .claude/skills/...
├── ~/nfc-line-lp-saas/          ← NFC営業OS（Do/Check）★本リポ
│   └── CLAUDE.md に参照パスを記載
```

> **Web環境での運用ルール**: 経営OSリポで作成した設計書・要件定義の内容を、本リポのセッションに貼り付けて実装指示とする。実装結果（テスト結果・KPI数値など）は逆方向に貼り付けてフィードバックする。
