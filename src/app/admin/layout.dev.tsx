import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 本機 dev 即個人 CMS，免登入；部署為伺服器時仍需管理員身分
  const allowed =
    process.env.NODE_ENV === "development" || (await isAdmin());
  if (!allowed) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/admin" className="hover:underline">
            儀表板
          </Link>
          <Link href="/admin/inventory" className="hover:underline">
            庫存管理
          </Link>
          <Link href="/admin/scenes" className="hover:underline">
            虛擬收藏室
          </Link>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            登出
          </Button>
        </form>
      </div>
      {children}
    </div>
  );
}
