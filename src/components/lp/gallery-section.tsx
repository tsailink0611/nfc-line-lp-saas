import type { Gallery } from "@/types/database";

type Props = {
  galleries: Gallery[];
};

export function GallerySection({ galleries }: Props) {
  if (galleries.length === 0) return null;

  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">ギャラリー</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {galleries.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg">
            <img
              src={item.image_url}
              alt={item.caption ?? ""}
              className="aspect-square w-full object-cover"
            />
            {item.caption && (
              <p className="mt-1 text-xs text-gray-500">{item.caption}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
