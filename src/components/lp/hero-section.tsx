import Image from "next/image";
import type { StaffLpData } from "@/types/database";
import { LineIcon } from "./line-icon";
import type { IndustryTemplate } from "@/lib/industry-templates";
import { TrackedLineLink, TrackedPhoneLink } from "./tracked-link";

type Props = {
  staff: StaffLpData;
  template: IndustryTemplate;
  monthlyTapCount?: number;
};

export function HeroSection({ staff, template, monthlyTapCount }: Props) {
  const catchCopy = staff.lp_settings?.hero_catch ?? template.defaultCatchCopy;
  const subCatch = staff.lp_settings?.hero_subcatch ?? "";
  const ctaLabel = staff.lp_settings?.cta_label ?? template.defaultCtaLabel;
  const displayName = staff.display_name ?? `${staff.last_name} ${staff.first_name}`;
  const hasEnName = staff.first_name_en || staff.last_name_en;
  const enName = hasEnName ? `${staff.first_name_en ?? ""} ${staff.last_name_en ?? ""}`.trim() : null;
  const bgUrl = staff.lp_settings?.hero_background_url;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: bgUrl
          ? `linear-gradient(180deg, rgba(var(--lp-primary-rgb),0.88) 0%, rgba(var(--lp-primary-rgb),0.96) 100%), url(${bgUrl}) center/cover`
          : `linear-gradient(160deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 60%, black) 100%)`,
      } as React.CSSProperties}
    >
      {/* 装飾 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[-50px] top-[12%] h-40 w-40 rotate-45 rounded-lg opacity-[0.07]"
          style={{ border: "2px solid var(--lp-secondary)" }}
        />
        <div
          className="absolute left-[-30px] top-[55%] h-24 w-24 rotate-45 rounded-md opacity-[0.07]"
          style={{ border: "1.5px solid var(--lp-secondary)" }}
        />
        <div
          className="absolute right-[20%] bottom-[8%] h-16 w-16 rotate-45 rounded-sm opacity-[0.05]"
          style={{ border: "1.5px solid var(--lp-secondary)" }}
        />
        {/* グロー */}
        <div className="absolute left-1/2 top-[20%] h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-[0.04]"
          style={{ background: `radial-gradient(circle, var(--lp-secondary) 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative flex flex-col items-center px-6 pb-12 pt-14 text-center sm:px-8 sm:pb-14 sm:pt-16">
        {/* NFC タッチラベル */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{
            border: "1px solid rgba(var(--lp-secondary-rgb), 0.3)",
            backgroundColor: "rgba(var(--lp-secondary-rgb), 0.08)",
            color: "var(--lp-secondary)",
          }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
          NFC Touch
        </div>

        {/* タップ数バッジ（社会的証明） */}
        {monthlyTapCount != null && monthlyTapCount >= 3 && (
          <div
            className="mb-8 mt-2.5 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            今月 {monthlyTapCount}人がタッチ
          </div>
        )}
        {(monthlyTapCount == null || monthlyTapCount < 3) && <div className="mb-8" />}

        {/* プロフィール写真 */}
        {staff.main_image_url ? (
          <div
            className="relative mb-7 h-[140px] w-[140px] overflow-hidden rounded-full sm:h-[164px] sm:w-[164px]"
            style={{
              boxShadow: `0 0 0 3px var(--lp-secondary), 0 0 0 6px rgba(var(--lp-secondary-rgb), 0.2), 0 24px 64px rgba(0,0,0,0.5)`,
            }}
          >
            <Image
              src={staff.main_image_url}
              alt={displayName}
              fill
              className="object-cover"
              sizes="164px"
              priority
            />
          </div>
        ) : (
          <div
            className="mb-7 flex h-[140px] w-[140px] items-center justify-center rounded-full text-5xl font-bold sm:h-[164px] sm:w-[164px]"
            style={{
              background: `linear-gradient(135deg, var(--lp-secondary), color-mix(in srgb, var(--lp-secondary) 70%, var(--lp-primary)))`,
              color: "#fff",
              boxShadow: `0 0 0 3px var(--lp-secondary), 0 0 0 6px rgba(var(--lp-secondary-rgb), 0.2), 0 24px 64px rgba(0,0,0,0.5)`,
            } as React.CSSProperties}
          >
            {staff.last_name.charAt(0)}
          </div>
        )}

        {/* 店舗名 */}
        <p
          className="mb-2 text-xs font-medium tracking-[0.08em]"
          style={{ color: "var(--lp-secondary)" }}
        >
          {staff.company.company_name} {staff.store && `/ ${staff.store.store_name}`}
        </p>

        {/* 名前 */}
        <h1
          className="text-[28px] font-bold leading-tight tracking-wide font-[family-name:var(--font-serif)] sm:text-[34px]"
          style={{ color: "var(--lp-hero-text)" }}
        >
          {displayName}
        </h1>
        {enName && (
          <p
            className="mt-1 text-[13px] tracking-[0.25em] font-[family-name:var(--font-display)]"
            style={{ color: "rgba(var(--lp-secondary-rgb), 0.7)" }}
          >
            {enName}
          </p>
        )}

        {/* 役職 */}
        {staff.position && (
          <p className="mt-2 text-sm" style={{ color: "var(--lp-hero-sub)" }}>
            {staff.position}
            {staff.career_years != null && ` / キャリア${staff.career_years}年`}
          </p>
        )}

        {/* キャッチコピー */}
        <div className="mx-auto mt-8 max-w-xs sm:max-w-sm">
          <div className="mx-auto mb-4 h-px w-12" style={{ backgroundColor: "var(--lp-secondary)" }} />
          <p
            className="text-base font-medium leading-[1.9] font-[family-name:var(--font-serif)] sm:text-lg"
            style={{ color: "var(--lp-hero-text)" }}
          >
            {catchCopy}
          </p>
          {subCatch && (
            <p className="mt-2 text-xs" style={{ color: "var(--lp-hero-sub)" }}>
              {subCatch}
            </p>
          )}
        </div>

        {/* LINE CTA */}
        {staff.staff_line_url && (
          <TrackedLineLink
            href={staff.staff_line_url}
            staffSlug={staff.slug}
            className="lp-cta-pulse mt-9 inline-flex items-center gap-2.5 rounded-full bg-[#06C755] px-9 py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(6,199,85,0.35)] transition hover:bg-[#05b04c] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(6,199,85,0.4)]"
          >
            <LineIcon className="h-5 w-5" />
            {ctaLabel}
          </TrackedLineLink>
        )}

        {/* 電話番号 */}
        {staff.company_mobile_number && (
          <TrackedPhoneLink
            href={`tel:${staff.company_mobile_number}`}
            staffSlug={staff.slug}
            phone={staff.company_mobile_number}
            className="mt-3 inline-flex items-center gap-1.5 text-xs transition hover:opacity-80"
            style={{ color: "var(--lp-hero-sub)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {staff.company_mobile_number}
          </TrackedPhoneLink>
        )}
      </div>
    </section>
  );
}
