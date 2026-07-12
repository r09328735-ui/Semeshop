import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

export default async function AdminLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <AdminMobileNav />
          <div className="ml-auto">
            <AdminUserMenu />
          </div>
        </header>
        <main className="flex-1 bg-muted/10 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
