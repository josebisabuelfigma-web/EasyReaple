import AccountForms from "@/components/admin/AccountForms";
import { getSessionUserFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUserFromCookies();
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Mi cuenta</h1>
          <p>Cambia tu usuario, el correo de recuperación y tu contraseña.</p>
        </div>
      </div>
      <AccountForms username={user?.username || ""} email={user?.email || ""} />
    </>
  );
}
