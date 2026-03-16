type Props = {
  embedUrl: string | null;
};

export function MapSection({ embedUrl }: Props) {
  if (!embedUrl) return null;

  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">アクセス</h2>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={embedUrl}
          title="Google Map"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}
