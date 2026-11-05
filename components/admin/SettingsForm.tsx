"use client";

import { useEffect, useState } from "react";
import { SETTING_GROUPS, type SiteSettings } from "@/lib/settings";
import ImageField from "./ImageField";

export default function SettingsForm() {
  const [values, setValues] = useState<SiteSettings | null>(null);
  const [active, setActive] = useState(SETTING_GROUPS[0].id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => (d.settings ? setValues(d.settings) : setError(d.error || "No se pudo cargar.")))
      .catch(() => setError("No se pudo cargar."));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      setValues(data.settings);
      setNotice("Guardado. El sitio ya se actualizó.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!values) {
    return error ? <div className="a-msg error">{error}</div> : <p className="a-empty">Cargando...</p>;
  }

  const group = SETTING_GROUPS.find((g) => g.id === active)!;

  return (
    <form onSubmit={save}>
      <div className="a-tabs">
        {SETTING_GROUPS.map((g) => (
          <button type="button" key={g.id} className={`a-tab${g.id === active ? " active" : ""}`} onClick={() => setActive(g.id)}>
            {g.title.replace(/^Sección «(.*)»$/, "$1")}
          </button>
        ))}
      </div>

      {error && <div className="a-msg error">{error}</div>}
      {notice && <div className="a-msg ok">{notice}</div>}

      <div className="a-card">
        <h2>{group.title}</h2>
        {group.description && <p className="a-sub">{group.description}</p>}

        {group.fields.map((f) => (
          <div className="a-field" key={f.key}>
            <label htmlFor={`s-${f.key}`}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={`s-${f.key}`} className="a-textarea" value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
            ) : f.type === "image" ? (
              <ImageField value={values[f.key] || null} folder="about" onChange={(p) => setValues({ ...values, [f.key]: p || "" })} />
            ) : (
              <input id={`s-${f.key}`} className="a-input" placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
            )}
            {f.help && <span className="a-help">{f.help}</span>}
          </div>
        ))}
      </div>

      <div className="a-savebar">
        <button className="a-btn primary" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        <span className="a-help">Se guardan los cambios de todas las pestañas.</span>
      </div>
    </form>
  );
}
