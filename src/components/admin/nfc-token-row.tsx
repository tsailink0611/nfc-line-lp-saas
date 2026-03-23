"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toggleNfcToken, deleteNfcToken } from "@/app/admin/nfc/actions";
import { Trash2, Copy, QrCode, Check } from "lucide-react";
import type { NfcToken } from "@/types/database";
import { useState } from "react";
import Image from "next/image";

type Props = {
  token: NfcToken & {
    staff_member: { last_name: string; first_name: string; slug: string } | null;
  };
};

export function NfcTokenRow({ token }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const nfcUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/n/${token.token}`
      : `/n/${token.token}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(nfcUrl)}&color=1a1a2e&bgcolor=ffffff`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(nfcUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: prompt で表示
      window.prompt("URLをコピーしてください:", nfcUrl);
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm font-mono text-gray-700">
          {token.token.slice(0, 8)}...
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
          {token.staff_member
            ? `${token.staff_member.last_name} ${token.staff_member.first_name}`
            : "-"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          <span className="font-mono text-xs">{token.target_path}</span>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
          {token.note ?? "-"}
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <button
            onClick={() => toggleNfcToken(token.id, !token.is_active)}
            className="cursor-pointer"
          >
            <Badge variant={token.is_active ? "success" : "default"}>
              {token.is_active ? "有効" : "無効"}
            </Badge>
          </button>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title="NFCリダイレクトURLをコピー"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQrOpen(true)}
              title="QRコードを表示"
            >
              <QrCode className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("このトークンを削除しますか？")) {
                  deleteNfcToken(token.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </td>
      </tr>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} title="QRコード">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-block rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Image
              src={qrImageUrl}
              alt="NFC redirect QR code"
              width={200}
              height={200}
              unoptimized
            />
          </div>
          <p className="mb-3 break-all text-xs text-gray-500">{nfcUrl}</p>
          {token.staff_member && (
            <p className="text-sm text-gray-700">
              {token.staff_member.last_name} {token.staff_member.first_name}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "コピー済み" : "URLをコピー"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setQrOpen(false)}>
              閉じる
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
