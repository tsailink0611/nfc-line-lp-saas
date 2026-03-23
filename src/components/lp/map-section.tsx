import { FadeUp } from "./fade-up";

type Props = {
  embedUrl: string | null;
};

export function MapSection({ embedUrl }: Props) {
  if (!embedUrl) return null;

  return (
    <section className="px-6 pb-10 sm:px-8">
      <FadeUp>
        <div className="overflow-hidden rounded-xl shadow-sm">
          <iframe
            src={embedUrl}
            title="Google Map"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[200px] w-full border-0 sm:h-[240px]"
          />
        </div>
      </FadeUp>
    </section>
  );
}
