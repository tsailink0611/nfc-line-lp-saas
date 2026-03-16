"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleNfcToken, deleteNfcToken } from "@/app/admin/nfc/actions";
import { Trash2 } from "lucide-react";
import type { NfcToken } from "@/types/database";

type Props = {
  token: NfcToken & {
    staff_member: { last_name: string; first_name: string; slug: string } | null;
  };
};

export function NfcTokenRow({ token }: Props) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-mono text-gray-700">
        {token.token.slice(0, 8)}...
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        {token.staff_member
          ? `${token.staff_member.last_name} ${token.staff_member.first_name}`
          : "-"}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {token.target_path}
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
      </td>
    </tr>
  );
}
