"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBadges } from "@/app/admin/staff/actions";
import { Plus, X, GripVertical } from "lucide-react";
import type { StaffBadge } from "@/types/database";

type Props = {
  staffId: string;
  initialBadges: StaffBadge[];
};

export function BadgeManager({ staffId, initialBadges }: Props) {
  const [badges, setBadges] = useState(
    initialBadges.map((b) => ({ label: b.label, sort_order: b.sort_order }))
  );
  const [saving, setSaving] = useState(false);

  function addBadge() {
    setBadges([...badges, { label: "", sort_order: badges.length }]);
  }

  function removeBadge(index: number) {
    setBadges(badges.filter((_, i) => i !== index));
  }

  function updateLabel(index: number, label: string) {
    const updated = [...badges];
    updated[index] = { ...updated[index], label };
    setBadges(updated);
  }

  async function handleSave() {
    setSaving(true);
    const valid = badges
      .filter((b) => b.label.trim())
      .map((b, i) => ({ ...b, sort_order: i }));
    await updateBadges(staffId, valid);
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      {badges.map((badge, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
          <Input
            value={badge.label}
            onChange={(e) => updateLabel(i, e.target.value)}
            placeholder="バッジ名"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeBadge(i)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addBadge}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "バッジを保存"}
        </Button>
      </div>
    </div>
  );
}
