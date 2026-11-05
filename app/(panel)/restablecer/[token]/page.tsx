"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPage({ params }: { params: { token: string } }) {
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/password/reset?token=${encodeURIComponent(params.token)}`)
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(false));
  }, [params.token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar la contraseña.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={submit}>
        <img src="/logo.png" alt="EasyReaple" />
        <h1>Nueva contraseña</h1>

        {valid === null && <p className="a-sub">Verificando enlace...</p>}

        {valid === false && !done && (
          <div className="a-msg error">
            Este enlace no es válido o ya venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».
          </div>
        )}

        {done && <div className="a-msg ok">Listo, tu contraseña quedó actualizada. Ya puedes iniciar sesión.</div>}

        {valid && !done && (
          <>
            <p className="a-sub">Mínimo 8 caracteres.</p>
            {error && <div className="a-msg error">{error}</div>}
            <div className="a-field">
              <label htmlFor="np">Contraseña nueva</label>
              <input id="np" type="password" autoComplete="new-password" className="a-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="a-field">
              <label htmlFor="cp">Repetir contraseña</label>
              <input id="cp" type="password" autoComplete="new-password" className="a-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button className="a-btn primary" disabled={busy}>{busy ? "Guardando..." : "Guardar contraseña"}</button>
          </>
        )}

        <div className="a-auth-links">
          <Link href="/login">Ir a iniciar sesión</Link>
        </div>
      </form>
    </div>
  );
}
