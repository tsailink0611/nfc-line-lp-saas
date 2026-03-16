import type { StaffLpData } from "@/types/database";

type Props = {
  staff: StaffLpData;
};

export function SpecialtySection({ staff }: Props) {
  const hasBadges = staff.badges.length > 0;
  const hasText = !!staff.specialties_text;

  if (!hasBadges && !hasText) return null;

  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">得意分野</h2>

      {hasBadges && (
        <div className="mt-4 flex flex-wrap gap-2">
          {staff.badges.map((badge) => (
            <span
              key={badge.id}
              className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white"
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {hasText && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {staff.specialties_text}
        </p>
      )}
    </section>
  );
}
