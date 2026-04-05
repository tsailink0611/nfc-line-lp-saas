import { getIndustryTemplate } from "@/lib/industry-templates";
import { LineIcon } from "./line-icon";
import { FadeUp } from "./fade-up";
import { TrackedLineLink } from "./tracked-link";

type Props = {
  industryType: string;
  ctaLabel: string;
  lineUrl: string | null;
  staffSlug: string;
};

export function LineBenefitsSection({ industryType, ctaLabel, lineUrl, staffSlug }: Props) {
  const template = getIndustryTemplate(industryType);

  return (
    <section
      className="px-6 py-10 sm:px-8"
      style={{
        background: `linear-gradient(160deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 75%, black) 100%)`,
      } as React.CSSProperties}
    >
      <FadeUp>
        <h2 className="text-center text-lg font-bold text-white font-[family-name:var(--font-serif)]">
          LINE登録でできること
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {template.lineBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <div
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: benefit.color + "22", color: benefit.color }}
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">{benefit.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{benefit.description}</p>
            </div>
          ))}
        </div>

        {lineUrl && (
          <div className="mt-8 text-center">
            <TrackedLineLink
              href={lineUrl}
              staffSlug={staffSlug}
              className="lp-cta-pulse inline-flex items-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-base font-bold text-white shadow-xl transition hover:bg-[#05b04c] hover:-translate-y-0.5"
            >
              <LineIcon className="h-5 w-5" />
              {ctaLabel}
            </TrackedLineLink>
          </div>
        )}
      </FadeUp>
    </section>
  );
}
