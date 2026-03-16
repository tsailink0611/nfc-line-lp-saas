import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/admin/campaign-form";
import { createCampaign } from "@/app/admin/campaigns/actions";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from("stores").select("*").eq("is_active", true).order("store_name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">キャンペーン 新規登録</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <CampaignForm stores={stores ?? []} action={createCampaign} />
      </div>
    </div>
  );
}
