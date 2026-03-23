"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  folder: string;
  className?: string;
};

export function ImageUpload({ currentUrl, onUpload, onRemove, folder, className }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME チェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    // 5MB制限
    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("public-assets")
      .upload(path, file);

    if (error) {
      alert("アップロードに失敗しました");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("public-assets")
      .getPublicUrl(path);

    onUpload(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {currentUrl ? (
        <div className="relative inline-block">
          <Image
            src={currentUrl}
            alt=""
            width={128}
            height={128}
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <span className="text-xs text-gray-500">アップロード中...</span>
          ) : (
            <Upload className="h-6 w-6 text-gray-400" />
          )}
        </label>
      )}
    </div>
  );
}
