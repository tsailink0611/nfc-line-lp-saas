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

## ユーティリティ（UTIL- / 全社共通機能）

| ワークフロー名 | n8n ID | 機能 | トリガー | 状態 |
|---|---|---|---|---|
| `UTIL-HOT-LEAD-ALERT-v1.0` | `RGXNdSwfmKRh1cpb` | 48h以内に同一NFC 2回タップ→管理者LINE「購買意欲MAX」アラート | Webhook POST `/webhook/hot-lead-check` | 作成済み |
| `UTIL-WEEKLY-RANKING-v1.0` | `Oal4rXW1p3VpST9E` | 毎週月曜9時にスタッフ別タップ数ランキングを管理者LINEへ送信 | スケジュール（月曜 09:00） | 作成済み |
| `UTIL-AFTER-HOURS-ALERT-v1.0` | `5xohlvw43JRsqG5L` | 深夜22時〜早朝6時のタップを翌朝8時JST通知 | Webhook POST `/webhook/after-hours-check` | 作成済み |

### UTIL系の必要環境変数（n8n .env に追加が必要）

```
SUPABASE_URL=https://addvxojlhppgxyllvsih.supabase.co
SUPABASE_ANON_KEY=<anonキー>        # anon読み取りRLSポリシー適用済み（サービスロールキー不要）
LINE_NOTIFY_USER_ID=<管理者のLINE User ID>  # UTIL-HOT-LEAD-ALERT / UTIL-AFTER-HOURS-ALERT で使用
```

> **注意**：`SUPABASE_SERVICE_ROLE_KEY` は使用していない。`ADMIN_LINE_USER_ID` ではなく `LINE_NOTIFY_USER_ID` を参照している。

### Supabase 追加アセット（2026-04-05作成済み）

| 名前 | 種別 | 用途 |
|---|---|---|
| `nfc_tap_analytics` | VIEW | nfc_resolutions + nfc_tokens + staff_members の結合ビュー |
| `check_hot_lead(token_id, hours)` | FUNCTION | 指定時間内に2回以上タップ → boolean |
| `get_weekly_tap_ranking(company_id)` | FUNCTION | 過去7日間のスタッフ別タップ数集計 |

---

## AI統合ワークフロー（AI- / 全業種共通）

| ワークフロー名 | n8n ID | 機能 | エンドポイント | 状態 |
|---|---|---|---|---|
| `AI-FOLLOW-UNIVERSAL-v1.0` | `RuDH4o7MNluXYyg6` | NFCタップ起点にGPT-4.1-miniで業種別フォローメッセージを生成、1日・3日・7日・14日後にスタッフLINEへ自動送信 | Webhook POST `/webhook/ai-follow` | **稼働中** |

### AI-FOLLOW-UNIVERSAL-v1.0 詳細

**フロー構成（11ノード）:**
```
Webhook受信（/webhook/ai-follow）
  ↓
クレデンシャル注入（Setノード・$env読み込み）
  ↓
スタッフ・業種情報取得（Codeノード・Supabase REST）
  ├─ lp_settings から industry_type 取得
  ├─ nfc_tokens から staff_member_id 取得
  └─ staff_members から display_name 取得
  ↓
Wait 1日 → AIフォロー 1日目（お礼・温かいフォロー）
  ↓
Wait 2日 → AIフォロー 3日目（ご検討状況確認）
  ↓
Wait 4日 → AIフォロー 7日目（具体提案・情報提供）
  ↓
Wait 7日 → AIフォロー 14日目（次のアクション促進）
```

**AIモデル:** `gpt-4.1-mini`（$0.40/1M input・$1.60/1M output）

**対応業種（industry_type）:**
`fudosan_baibai` / `fudosan_chintai` / `kensetsu` / `house_maker` / `car_dealer` / `b2b_eigyo` / `parking` / `kanko` / `general`

**必要環境変数（n8n .env に追加が必要）:**
```
LINE_CHANNEL_ACCESS_TOKEN=<LINEチャンネルアクセストークン>
LINE_NOTIFY_USER_ID=<通知先スタッフのLINE User ID>
OPENAI_API_KEY=<OpenAI APIキー>
SUPABASE_URL=https://addvxojlhppgxyllvsih.supabase.co
SUPABASE_ANON_KEY=<anonキー>
```

**webhookペイロード（route.tsから送信）:**
```json
{
  "token": "4b73221f-...",
  "company_id": "a0000000-...",
  "event_type": "tag_tapped",
  "timestamp": "2026-04-05T09:00:00Z"
}
```

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
| 2026-04-05 | Supabaseビュー・関数作成 | nfc_tap_analytics / check_hot_lead / get_weekly_tap_ranking |
| 2026-04-05 | ユーティリティワークフロー3本作成 | UTIL-HOT-LEAD-ALERT / UTIL-WEEKLY-RANKING / UTIL-AFTER-HOURS-ALERT |
| 2026-04-05 | AI統合フォローワークフロー作成・公開 | AI-FOLLOW-UNIVERSAL-v1.0（ID: RuDH4o7MNluXYyg6） |
| 2026-04-06 | Google Sheetsノード削除 | nfc-sales-os-event-router-v1（Append Raw Event / Notification Log / Daily Summary を削除。Supabase+PostHogに一本化） |
