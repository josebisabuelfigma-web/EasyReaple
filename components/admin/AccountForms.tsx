"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Ocurrió un error.");
  return data;
}

export default function AccountForms({ username, email }: { username: string; email: string }) {
  const router = useRouter();

  const [profile, setProfile] = useState({ username, email });
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const [pass, setPass] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [passBusy, setPassBusy] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileBusy(true);
    setProfileMsg(null);
    try {
      await send("/api/admin/account", "PUT", profile);
      setProfileMsg({ type: "ok", text: "Datos actualizados." });
      router.refresh();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileBusy(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    if (pass.newPassword !== pass.confirm) {
      setPassMsg({ type: "error", text: "La confirmación no coincide con la contraseña nueva." });
      return;
    }
    setPassBusy(true);
    try {
      await send("/api/admin/account/password", "POST", {
        currentPassword: pass.currentPassword,
        newPassword: pass.newPassword,
      });
      setPass({ currentPassword: "", newPassword: "", confirm: "" });
      setPassMsg({ type: "ok", text: "Contraseña cambiada. Se cerraron tus otras sesiones abiertas." });
    } catch (err: any) {
      setPassMsg({ type: "error", text: err.message });
    } finally {
      setPassBusy(false);
    }
  }

  return (
    <>
      <form className="a-card" onSubmit={saveProfile}>
        <h2>Usuario y correo</h2>
        <p className="a-sub">El correo es al que llega el enlace para recuperar tu contraseña.</p>
        {profileMsg && <div className={`a-msg ${profileMsg.type}`}>{profileMsg.text}</div>}
        <div className="a-field">
          <label htmlFor="acc-user">Usuario</label>
          <input id="acc-user" className="a-input" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value.replace(/\s/g, "") })} />
          <span className="a-help">Sin espacios. Con este nombre inicias sesión.</span>
        </div>
        <div className="a-field">
          <label htmlFor="acc-mail">Correo de recuperación</label>
          <input id="acc-mail" type="email" className="a-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </div>
        <button className="a-btn primary" disabled={profileBusy}>{profileBusy ? "Guardando..." : "Guardar datos"}</button>
      </form>

      <form className="a-card" onSubmit={savePassword}>
        <h2>Cambiar contraseña</h2>
        <p className="a-sub">Mínimo 8 caracteres.</p>
        {passMsg && <div className={`a-msg ${passMsg.type}`}>{passMsg.text}</div>}
        <div className="a-field">
          <label htmlFor="pw-cur">Contraseña actual</label>
          <input id="pw-cur" type="password" autoComplete="current-password" className="a-input" value={pass.currentPassword} onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} />
        </div>
        <div className="a-field">
          <label htmlFor="pw-new">Contraseña nueva</label>
          <input id="pw-new" type="password" autoComplete="new-password" className="a-input" value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} />
        </div>
        <div className="a-field">
          <label htmlFor="pw-conf">Repetir contraseña nueva</label>
          <input id="pw-conf" type="password" autoComplete="new-password" className="a-input" value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} />
        </div>
        <button className="a-btn primary" disabled={passBusy}>{passBusy ? "Guardando..." : "Cambiar contraseña"}</button>
      </form>
    </>
  );
}
