"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

type Props = {
  slug: string;
  isPublic: boolean;
  siteUrl: string;
};

export function StaffLpUrlCell({ slug, isPublic, siteUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl}/staff/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* URL表示（省略） */}
      <span className="max-w-[180px] truncate font-mono text-xs text-gray-400" title={url}>
        /staff/{slug}
      </span>

      {/* コピーボタン */}
      <button
        type="button"
        onClick={handleCopy}
        title="URLをコピー"
        className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* 新しいタブで開く */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="LPをプレビュー"
        className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      {/* 非公開バッジ */}
      {!isPublic && (
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
          非公開
        </span>
      )}
    </div>
  );
}
