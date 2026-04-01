"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Store,
  Megaphone,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/staff", label: "担当者", icon: Users },
  { href: "/admin/stores", label: "店舗", icon: Store },
  { href: "/admin/campaigns", label: "キャンペーン", icon: Megaphone },
  { href: "/admin/nfc", label: "NFC管理", icon: CreditCard },
  { href: "/admin/analytics", label: "分析", icon: BarChart2 },
  { href: "/admin/settings", label: "設定", icon: Settings },
];

type Props = {
  userName: string;
  companyName: string;
  role?: string;
};

export function AdminSidebar({ userName, companyName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="border-b border-gray-700 px-4 py-5">
        <p className="text-sm font-semibold text-white truncate">{companyName}</p>
        <p className="mt-1 text-xs text-gray-400 truncate">{userName}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 px-3 py-4 space-y-1">
        {role === "super_admin" && (
          <Link
            href="/admin/super"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive("/admin/super")
                ? "bg-indigo-600 text-white"
                : "text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-100"
            )}
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            全社管理
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          ログアウト
        </button>
      </div>

    </>
  );

  return (
    <>
      {/* モバイルハンバーガー */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* モバイルオーバーレイ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* モバイルサイドバー */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-800 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* デスクトップサイドバー */}
      <aside className="hidden w-64 flex-col bg-gray-800 lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
