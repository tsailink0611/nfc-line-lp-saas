import { createClient } from "@/lib/supabase/server";
import { StoreForm } from "@/components/admin/store-form";
import { updateStore, deleteStore } from "@/app/admin/stores/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { notFound } from "next/navigation";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase.from("stores").select("*").eq("id", id).single();

  if (!store) notFound();

  const boundUpdate = updateStore.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">店舗 編集</h1>
        <DeleteButton onDelete={deleteStore.bind(null, id)} />
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <StoreForm store={store} action={boundUpdate} />
      </div>
    </div>
  );
}
