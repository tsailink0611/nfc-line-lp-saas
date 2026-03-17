import type { StaffLpData } from "@/types/database";
import { FadeUp } from "./fade-up";
import { SectionHeading } from "./section-heading";

type Props = {
  staff: StaffLpData;
};

export function ProfileSection({ staff }: Props) {
  if (!staff.profile_text && staff.career_years == null) return null;

  return (
    <section className="px-6 py-10 sm:px-8" style={{ backgroundColor: "var(--lp-cream)" }}>
      <FadeUp>
        <SectionHeading title="プロフィール" />

        <div className="flex items-start gap-4">
          {staff.sub_image_url && (
            <img
              src={staff.sub_image_url}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-md sm:h-24 sm:w-24"
            />
          )}
          <div className="flex-1">
            {staff.career_years != null && (
              <p className="mb-2 text-sm font-medium" style={{ color: "var(--lp-secondary)" }}>
                キャリア {staff.career_years}年
              </p>
            )}
            {staff.profile_text && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {staff.profile_text}
              </p>
            )}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
