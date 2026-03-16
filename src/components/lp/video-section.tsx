type Props = {
  youtubeUrl: string | null;
};

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  );
  return match?.[1] ?? null;
}

export function VideoSection({ youtubeUrl }: Props) {
  if (!youtubeUrl) return null;

  const videoId = extractYoutubeId(youtubeUrl);
  if (!videoId) return null;

  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">動画</h2>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
