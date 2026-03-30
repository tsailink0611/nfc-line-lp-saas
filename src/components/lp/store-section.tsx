import type { Store } from "@/types/database";
import { MapPin, Phone, Clock, Calendar } from "lucide-react";
import { FadeUp } from "./fade-up";
import { SectionHeading } from "./section-heading";

type Props = {
  store: Store;
  storeLabel?: string;
};

export function StoreSection({ store, storeLabel = "店舗情報" }: Props) {
  return (
    <section className="px-6 py-10 sm:px-8">
      <FadeUp>
        <SectionHeading title={storeLabel} />
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="font-bold text-gray-900">{store.store_name}</p>

          <div className="mt-3 space-y-2.5">
            {store.address && (
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--lp-secondary)" }} />
                <span>{store.postal_code && `〒${store.postal_code} `}{store.address}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone className="h-4 w-4 shrink-0" style={{ color: "var(--lp-secondary)" }} />
                <a href={`tel:${store.phone}`} className="font-medium underline underline-offset-2">{store.phone}</a>
              </div>
            )}
            {store.business_hours && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Clock className="h-4 w-4 shrink-0" style={{ color: "var(--lp-secondary)" }} />
                <span>{store.business_hours}</span>
              </div>
            )}
            {store.regular_holiday && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--lp-secondary)" }} />
                <span>定休日: {store.regular_holiday}</span>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="mt-4 flex gap-3">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Phone className="h-4 w-4" />
                電話する
              </a>
            )}
            {store.google_map_embed_url && (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(store.address ?? store.store_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--lp-primary)" }}
              >
                <MapPin className="h-4 w-4" />
                マップで見る
              </a>
            )}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
