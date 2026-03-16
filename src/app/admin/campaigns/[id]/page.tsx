import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/admin/campaign-form";
import { updateCampaign, deleteCampaign } from "@/app/admin/campaigns/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { notFound } from "next/navigation";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: campaign }, { data: stores }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("id", id).single(),
    supabase.from("stores").select("*").eq("is_active", true).order("store_name"),
  ]);

  if (!campaign) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">キャンペーン 編集</h1>
        <DeleteButton onDelete={deleteCampaign.bind(null, id)} />
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <CampaignForm stores={stores ?? []} campaign={campaign} action={updateCampaign.bind(null, id)} />
      </div>
    </div>
  );
}
