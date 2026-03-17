import type { StaffLpData } from "@/types/database";
import { FadeUp } from "./fade-up";
import { SectionHeading } from "./section-heading";

type Props = {
  staff: StaffLpData;
};

export function SpecialtySection({ staff }: Props) {
  const hasBadges = staff.badges.length > 0;
  const hasText = !!staff.specialties_text;

  if (!hasBadges && !hasText) return null;

  return (
    <section className="px-6 py-10 sm:px-8">
      <FadeUp>
        <SectionHeading title="得意分野" />

        {hasBadges && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {staff.badges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--lp-primary)" }}
              >
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {hasText && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {staff.specialties_text}
          </p>
        )}
      </FadeUp>
    </section>
  );
}
