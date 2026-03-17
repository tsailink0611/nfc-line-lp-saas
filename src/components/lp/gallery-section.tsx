import type { Gallery } from "@/types/database";
import { FadeUp } from "./fade-up";
import { SectionHeading } from "./section-heading";

type Props = {
  galleries: Gallery[];
};

export function GallerySection({ galleries }: Props) {
  if (galleries.length === 0) return null;

  return (
    <section className="px-6 py-10 sm:px-8">
      <FadeUp>
        <SectionHeading title="ギャラリー" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleries.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl">
              <img
                src={item.image_url}
                alt={item.caption ?? "ギャラリー画像"}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition group-hover:opacity-100">
                  <p className="text-xs font-medium text-white">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
