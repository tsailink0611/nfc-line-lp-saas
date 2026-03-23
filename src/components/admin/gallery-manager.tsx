"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";
import { updateGalleries } from "@/app/admin/staff/actions";
import { Plus, X } from "lucide-react";
import type { Gallery } from "@/types/database";

type GalleryItem = {
  image_url: string;
  caption: string | null;
  sort_order: number;
};

type Props = {
  staffId: string;
  initialGalleries: Gallery[];
};

export function GalleryManager({ staffId, initialGalleries }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(
    initialGalleries.map((g) => ({
      image_url: g.image_url,
      caption: g.caption,
      sort_order: g.sort_order,
    }))
  );
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems([...items, { image_url: "", caption: null, sort_order: items.length }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, updates: Partial<GalleryItem>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    setItems(updated);
  }

  async function handleSave() {
    setSaving(true);
    const valid = items
      .filter((item) => item.image_url)
      .map((item, i) => ({ ...item, sort_order: i }));
    await updateGalleries(staffId, valid);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-lg border border-gray-200 p-3">
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
            <ImageUpload
              currentUrl={item.image_url || null}
              onUpload={(url) => updateItem(i, { image_url: url })}
              onRemove={() => updateItem(i, { image_url: "" })}
              folder="gallery"
            />
            <Input
              value={item.caption ?? ""}
              onChange={(e) => updateItem(i, { caption: e.target.value || null })}
              placeholder="キャプション"
              className="mt-2"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "ギャラリーを保存"}
        </Button>
      </div>
    </div>
  );
}
