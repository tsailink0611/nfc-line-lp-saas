import type { Store } from "@/types/database";
import { MapPin, Phone, Clock, Calendar } from "lucide-react";

type Props = {
  store: Store;
};

export function StoreSection({ store }: Props) {
  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">店舗情報</h2>
      <div className="mt-4 space-y-3">
        <p className="font-medium text-gray-900">{store.store_name}</p>

        {store.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span>{store.postal_code && `〒${store.postal_code} `}{store.address}</span>
          </div>
        )}

        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <a href={`tel:${store.phone}`} className="underline">{store.phone}</a>
          </div>
        )}

        {store.business_hours && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{store.business_hours}</span>
          </div>
        )}

        {store.regular_holiday && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            <span>定休日: {store.regular_holiday}</span>
          </div>
        )}
      </div>
    </section>
  );
}
