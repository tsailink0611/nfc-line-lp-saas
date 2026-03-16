import { createClient } from "@/lib/supabase/server";
import { StaffForm } from "@/components/admin/staff-form";
import { createStaff } from "@/app/admin/staff/actions";

export default async function NewStaffPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("store_name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">担当者 新規登録</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <StaffForm stores={stores ?? []} action={createStaff} />
      </div>
    </div>
  );
}
