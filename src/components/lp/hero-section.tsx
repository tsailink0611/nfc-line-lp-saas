import type { StaffLpData } from "@/types/database";

type Props = {
  staff: StaffLpData;
};

export function HeroSection({ staff }: Props) {
  const catchCopy = staff.lp_settings?.hero_catch ?? "あなたの理想を実現する";
  const subCatch = staff.lp_settings?.hero_subcatch ?? "";
  const ctaLabel = staff.lp_settings?.cta_label ?? "LINEで相談する";

  return (
    <section className="relative overflow-hidden">
      {staff.main_image_url ? (
        <div className="relative h-[70vh] min-h-[480px]">
          <img
            src={staff.main_image_url}
            alt={`${staff.last_name} ${staff.first_name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-lg font-medium tracking-wide opacity-90">{catchCopy}</p>
            {subCatch && (
              <p className="mt-1 text-sm opacity-70">{subCatch}</p>
            )}
            <h1 className="mt-3 text-3xl font-bold">
              {staff.display_name ?? `${staff.last_name} ${staff.first_name}`}
            </h1>
            {staff.position && (
              <p className="mt-1 text-sm opacity-80">{staff.position}</p>
            )}
            {staff.staff_line_url && (
              <a
                href={staff.staff_line_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#06C755] px-8 py-3 font-bold text-white shadow-lg transition hover:bg-[#05b04c]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                {ctaLabel}
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-16 text-white">
          <p className="text-lg font-medium tracking-wide opacity-90">{catchCopy}</p>
          <h1 className="mt-3 text-3xl font-bold">
            {staff.display_name ?? `${staff.last_name} ${staff.first_name}`}
          </h1>
          {staff.position && (
            <p className="mt-1 text-sm opacity-80">{staff.position}</p>
          )}
        </div>
      )}
    </section>
  );
}
