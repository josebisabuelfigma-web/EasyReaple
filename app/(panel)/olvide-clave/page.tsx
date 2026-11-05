"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Si los datos son correctos, te enviamos un enlace al correo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={submit}>
        <img src="/logo.png" alt="EasyReaple" />
        <h1>Recuperar contraseña</h1>
        <p className="a-sub">Escribe tu usuario o tu correo y te enviamos un enlace para elegir una contraseña nueva.</p>

        {message ? (
          <div className="a-msg ok">{message}</div>
        ) : (
          <>
            <div className="a-field">
              <label htmlFor="id">Usuario o correo</label>
              <input id="id" className="a-input" autoCapitalize="none" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>
            <button className="a-btn primary" disabled={busy}>{busy ? "Enviando..." : "Enviar enlace"}</button>
          </>
        )}

        <div className="a-auth-links">
          <Link href="/login">Volver a iniciar sesión</Link>
        </div>
      </form>
    </div>
  );
}
