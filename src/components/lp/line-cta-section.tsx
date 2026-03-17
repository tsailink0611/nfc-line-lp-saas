import { LineIcon } from "./line-icon";
import { FadeUp } from "./fade-up";

type Props = {
  lineUrl: string | null;
  ctaLabel: string;
  staffName: string;
};

export function LineCtaSection({ lineUrl, ctaLabel, staffName }: Props) {
  if (!lineUrl) return null;

  return (
    <section className="px-6 py-12 text-center sm:px-8" style={{ backgroundColor: "var(--lp-cream)" }}>
      <FadeUp>
        <p className="text-sm text-gray-500">
          {staffName}へのご相談はこちら
        </p>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-cta-pulse mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#06C755] px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-[#05b04c] hover:-translate-y-0.5 hover:shadow-2xl"
        >
          <LineIcon className="h-6 w-6" />
          {ctaLabel}
        </a>
      </FadeUp>
    </section>
  );
}
