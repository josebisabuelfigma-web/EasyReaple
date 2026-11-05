import { redirect } from "next/navigation";
import { getSessionUserFromCookies } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");
  return <AdminShell username={user.username}>{children}</AdminShell>;
}
