import { CalendarDays } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { FadeUp } from "./fade-up";

type Props = {
  bookingUrl: string;
  staffName: string;
};

export function BookingSection({ bookingUrl, staffName }: Props) {
  return (
    <section className="bg-gray-50 px-5 py-12">
      <FadeUp>
        <SectionHeading title="打ち合わせのご予約" />
        <p className="mt-3 text-center text-sm text-gray-500">
          {staffName}のカレンダーから空き時間を選んでご予約いただけます
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
          >
            <CalendarDays className="h-5 w-5" />
            打ち合わせを予約する
          </a>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Googleカレンダーで空き状況を確認してご予約ください
        </p>
      </FadeUp>
    </section>
  );
}
