import { createClient } from "@/lib/supabase/server";
import { StaffForm } from "@/components/admin/staff-form";
import { BadgeManager } from "@/components/admin/badge-manager";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { updateStaff, deleteStaff } from "@/app/admin/staff/actions";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: staff }, { data: stores }, { data: badges }, { data: galleries }] =
    await Promise.all([
      supabase.from("staff_members").select("*").eq("id", id).single(),
      supabase.from("stores").select("*").eq("is_active", true).order("store_name"),
      supabase
        .from("staff_badges")
        .select("*")
        .eq("staff_member_id", id)
        .order("sort_order"),
      supabase
        .from("galleries")
        .select("*")
        .eq("staff_member_id", id)
        .order("sort_order"),
    ]);

  if (!staff) notFound();

  const boundUpdate = updateStaff.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">担当者 編集</h1>
        <div className="flex items-center gap-2">
          {staff.is_public && (
            <a href={`/staff/${staff.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                LPをプレビュー
              </Button>
            </a>
          )}
          <DeleteButton onDelete={deleteStaff.bind(null, id)} />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <StaffForm stores={stores ?? []} staff={staff} action={boundUpdate} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">バッジ</h2>
          <BadgeManager staffId={id} initialBadges={badges ?? []} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">ギャラリー</h2>
          <GalleryManager staffId={id} initialGalleries={galleries ?? []} />
        </div>
      </div>
    </div>
  );
}
