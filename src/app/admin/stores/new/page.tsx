import { StoreForm } from "@/components/admin/store-form";
import { createStore } from "@/app/admin/stores/actions";

export default function NewStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">店舗 新規登録</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <StoreForm action={createStore} />
      </div>
    </div>
  );
}
