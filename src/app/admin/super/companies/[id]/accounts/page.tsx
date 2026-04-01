import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleAdminAccount } from "@/app/admin/super/actions";

type Props = {
  params: Promise<{ id: string }>;
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "スーパー管理者",
  admin: "管理者",
  staff: "スタッフ",
};

export default async function CompanyAccountsPage({ params }: Props) {
  const { id: companyId } = await params;

  const supabase = await createClient();

  // 現在ログイン中のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // 現在のadmin_usersレコードを取得
  const { data: currentAdminUser } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!currentAdminUser || currentAdminUser.role !== "super_admin") {
    redirect("/admin");
  }

  // 会社情報を取得
  const { data: company } = await supabase
    .from("companies")
    .select("id, company_name, company_code")
    .eq("id", companyId)
    .single();

  if (!company) redirect("/admin/super");

  // 該当会社のアカウント一覧を取得
  const { data: accounts } = await supabase
    .from("admin_users")
    .select("id, name, email, role, is_active, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/super"
            className="text-sm text-gray-500 transition hover:text-gray-700"
          >
            ← 会社一覧に戻る
          </Link>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {company.company_name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
              {company.company_code}
            </span>
            <span className="ml-2">
              {accounts?.length ?? 0} アカウント登録済み
            </span>
          </p>
        </div>
        <Link
          href={`/admin/super/accounts/new?company_id=${companyId}`}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          + アカウント追加
        </Link>
      </div>

      {/* アカウント一覧テーブル */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                氏名
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                ロール
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                登録日
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(accounts ?? []).map((account) => {
              // super_admin本人は操作不可
              const isSelf = account.id === currentAdminUser.id;
              const isProtected = isSelf && account.is_active && account.role === "super_admin";

              return (
                <tr key={account.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{account.name}</p>
                    {isSelf && (
                      <span className="text-xs text-gray-400">（自分）</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {account.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {ROLE_LABEL[account.role] ?? account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        account.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {account.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(account.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isProtected ? (
                      <span className="text-xs text-gray-400">操作不可</span>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await toggleAdminAccount(account.id, account.is_active);
                        }}
                      >
                        <button
                          type="submit"
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            account.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {account.is_active ? "無効化" : "有効化"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {(accounts ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  登録されているアカウントがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
