import type { StaffLpData } from "@/types/database";

type Props = {
  staff: StaffLpData;
};

export function ProfileSection({ staff }: Props) {
  return (
    <section className="px-6 py-10">
      <div className="flex items-start gap-4">
        {staff.sub_image_url && (
          <img
            src={staff.sub_image_url}
            alt=""
            className="h-20 w-20 rounded-full object-cover shadow-md"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            {staff.display_name ?? `${staff.last_name} ${staff.first_name}`}
          </h2>
          {(staff.last_name_en || staff.first_name_en) && (
            <p className="text-sm text-gray-400">
              {staff.first_name_en} {staff.last_name_en}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            {staff.position && <span>{staff.position}</span>}
            {staff.career_years != null && (
              <span>/ キャリア {staff.career_years}年</span>
            )}
          </div>
        </div>
      </div>

      {staff.profile_text && (
        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {staff.profile_text}
        </p>
      )}
    </section>
  );
}
