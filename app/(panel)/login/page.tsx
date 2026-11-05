"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión.");
      const next = params.get("next");
      // Solo se acepta una ruta interna del panel.
      window.location.href = next && next.startsWith("/admin") ? next : "/admin";
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={submit}>
        <img src="/logo.png" alt="EasyReaple" />
        <h1>Panel de administración</h1>
        <p className="a-sub">Ingresa para administrar el sitio.</p>

        {error && <div className="a-msg error">{error}</div>}

        <div className="a-field">
          <label htmlFor="user">Usuario</label>
          <input id="user" className="a-input" autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="a-field">
          <label htmlFor="pass">Contraseña</label>
          <div className="a-pass">
            <input id="pass" className="a-input" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShow((v) => !v)}>
              <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <button className="a-btn primary" disabled={busy}>{busy ? "Ingresando..." : "Ingresar"}</button>

        <div className="a-auth-links">
          <Link href="/olvide-clave">¿Olvidaste tu contraseña?</Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
