import { FadeUp } from "./fade-up";
import type { IndustryTemplate } from "@/lib/industry-templates";
import { LineIcon } from "./line-icon";
import { TrackedLineLink } from "./tracked-link";

type Props = {
  template: IndustryTemplate;
  lineUrl: string | null;
  ctaLabel: string;
  staffSlug: string;
};

export function LineStepsSection({ template, lineUrl, ctaLabel, staffSlug }: Props) {
  return (
    <section className="px-6 py-10 sm:px-8" style={{ backgroundColor: "var(--lp-cream)" }}>
      <FadeUp>
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--lp-secondary)" }}>
            HOW IT WORKS
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 font-[family-name:var(--font-serif)]">
            LINEで今すぐできること
          </h2>
        </div>

        <div className="relative">
          {/* 縦ライン */}
          <div
            className="absolute left-[22px] top-5 bottom-5 w-px"
            style={{ backgroundColor: "var(--lp-secondary)", opacity: 0.2 }}
          />

          <div className="space-y-5">
            {template.lineSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* ステップ番号 */}
                <div
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                  style={{ backgroundColor: "var(--lp-secondary)" }}
                >
                  {i + 1}
                </div>
                {/* テキスト */}
                <div className="flex-1 pt-1.5">
                  <p className="text-sm font-bold text-gray-800">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {lineUrl && (
          <TrackedLineLink
            href={lineUrl}
            staffSlug={staffSlug}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#05b04c]"
          >
            <LineIcon className="h-4.5 w-4.5" />
            {ctaLabel}
          </TrackedLineLink>
        )}
      </FadeUp>
    </section>
  );
}
