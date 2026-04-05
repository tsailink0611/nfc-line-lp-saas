"use client";

/**
 * PostHog イベントトラッキングユーティリティ
 * NFC営業OS 専用のイベント定義と送信関数
 */

import posthog from "posthog-js";

// イベント定義
export const NFC_EVENTS = {
  // NFCタップ（サーバーサイドでも送信可）
  NFC_TAP: "nfc_tap",
  // LPページ表示
  LP_VIEW: "lp_view",
  // LINE追加ボタンクリック
  LINE_ADD_CLICK: "line_add_click",
  // 電話ボタンクリック
  PHONE_CLICK: "phone_click",
  // CTAボタンクリック（汎用）
  CTA_CLICK: "cta_click",
  // フォーム送信
  FORM_SUBMIT: "form_submit",
  // 問い合わせボタンクリック
  CONTACT_CLICK: "contact_click",
} as const;

type EventName = (typeof NFC_EVENTS)[keyof typeof NFC_EVENTS];

type NfcTapProps = {
  token: string;
  company_id: string;
  staff_name?: string;
  target_path: string;
};

type LpViewProps = {
  staff_slug: string;
  company_id?: string;
  industry?: string;
};

type CtaClickProps = {
  button_label: string;
  staff_slug?: string;
  destination?: string;
};

// 各イベントの型付き送信関数
export function trackNfcTap(props: NfcTapProps) {
  posthog.capture(NFC_EVENTS.NFC_TAP, props);
}

export function trackLpView(props: LpViewProps) {
  posthog.capture(NFC_EVENTS.LP_VIEW, props);
}

export function trackCtaClick(props: CtaClickProps) {
  posthog.capture(NFC_EVENTS.CTA_CLICK, props);
}

export function trackLineAddClick(staffSlug: string) {
  posthog.capture(NFC_EVENTS.LINE_ADD_CLICK, { staff_slug: staffSlug });
}

export function trackPhoneClick(staffSlug: string, phone: string) {
  posthog.capture(NFC_EVENTS.PHONE_CLICK, { staff_slug: staffSlug, phone });
}

// 汎用トラッカー
export function track(event: EventName, props?: Record<string, unknown>) {
  posthog.capture(event, props);
}
