# n8n ワークフロー台帳

> **Claude Codeはワークフロー操作前に必ずこのファイルを確認すること。**
> 指示には必ずフルワークフロー名を含めること（例：「PROD-DEMO-FUDOSAN-v1.0のワークフローに追加して」）

---

## 命名規則

| プレフィックス | 意味 | ルール |
|---|---|---|
| `TMPL-` | テンプレート | **編集禁止・複製専用** |
| `PROD-` | 本番稼働中 | クライアント稼働中・変更は慎重に |
| `TEST-` | テスト用 | 自由に変更・削除OK |

---

## テンプレート一覧（TMPL- / 編集禁止）

| ワークフロー名 | n8n ID | 業種 | フォロー構成 | 状態 |
|---|---|---|---|---|
| `nfc-sales-os-event-router-v1` | `3SNJoMa2lChixNAh` | ベース（全業種共通） | 即時通知のみ | 稼働中・テンプレート扱い |
| `TMPL-FUDOSAN-BAIBAI-v1.0` | `ceVwYOfFeg7WccJ5` | 不動産（売買） | 即時＋1日・3日・7日・14日 | 作成済み |
| `TMPL-FUDOSAN-CHINTAI-v1.0` | `fFrdPCN9BTutTXpJ` | 不動産（賃貸） | 即時＋1日・3日・内見リマインド(7日) | 作成済み |
| `TMPL-KENSETSU-v1.0` | `KH9Q2UFJxFHJyNeF` | 建設・工務店 | 即時＋1日・7日・見積期限(14日) | 作成済み |
| `TMPL-HOUSE-MAKER-v1.0` | `p67ZsGCH5wuea21T` | ハウスメーカー | 即時＋1日・3日・モデルハウス(7日) | 作成済み |
| `TMPL-CAR-DEALER-v1.0` | `qKNQl40XFreDcMow` | 自動車ディーラー | 即時＋1日・3日 | 作成済み |
| `TMPL-B2B-EIGYO-v1.0` | `mv7Tz39NIbW245pN` | B2B営業 | 即時＋1日・7日・提案書(14日) | 作成済み |
| `TMPL-PARKING-v1.0` | `HlRYMI62RLBpLh4x` | 無人駐車場 | 即時のみ | 作成済み |
| `TMPL-KANKO-v1.0` | `dnNcRqiLd6kNK1qq` | 観光地・施設 | 即時＋再来場促進(14日) | 作成済み |

---

## 本番稼働中（PROD-）

| ワークフロー名 | n8n ID | 会社名 | webhook_url | 状態 |
|---|---|---|---|---|
| （まだなし） | - | - | - | - |

---

## Supabase 会社ID一覧

<!-- 本番company_idは公開リポジトリに記載しない。super admin画面またはSupabaseダッシュボードで確認 -->

| 会社名 | company_id | webhook_url設定状況 |
|---|---|---|
| （super admin画面で確認） | - | - |

---

## n8n 環境情報

<!-- 実際の値は .env.local または運用チーム内ドキュメントを参照 -->

| 項目 | 値 |
|---|---|
| URL | `http://<N8N_HOST>:5678`（Tailscale内部IP。.env.local参照） |
| 設定ファイル | `/opt/n8n/.env` |
| docker-compose | `/opt/n8n/docker-compose.yml` |
| Google Sheets ID | （運用ドキュメント参照） |
| Sheetsシート | `raw_events` / `notification_log` / `daily_summary` |
| Sheets credential ID | （n8n管理画面参照） |

---

## 操作履歴

| 日付 | 操作 | 対象 |
|---|---|---|
| 2026-04-04 | ベースワークフロー完成 | `nfc-sales-os-event-router-v1` |
| 2026-04-04 | エラーブランチ追加 | `nfc-sales-os-event-router-v1` |
| 2026-04-04 | E2E動作確認完了 | ベース全フロー |
| 2026-04-04 | 業種別テンプレート8本並列作成 | 全TMPL-* |
