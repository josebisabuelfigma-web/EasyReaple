"use client";

import { useEffect, useMemo, useState } from "react";
import { RESOURCES, type ResourceConfig, type ResourceField } from "@/lib/resources";
import { imageUrl } from "@/lib/imageUrl";
import ImageField from "./ImageField";

type Row = Record<string, any>;

const FOLDERS: Record<string, "products" | "equipment" | "gallery"> = {
  products: "products",
  equipment: "equipment",
  gallery: "gallery",
};

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Ocurrió un error.");
  return data;
}

function emptyForm(cfg: ResourceConfig): Row {
  const form: Row = {};
  for (const f of cfg.fields) {
    if (f.type === "checkbox") form[f.key] = f.key === "active";
    else if (f.type === "number") form[f.key] = 0;
    else if (f.type === "select") form[f.key] = f.options![0].value;
    else if (f.type === "relation" || f.type === "image") form[f.key] = null;
    else form[f.key] = "";
  }
  return form;
}

export default function ResourceManager({ resource }: { resource: string }) {
  const cfg = RESOURCES[resource];
  const [items, setItems] = useState<Row[]>([]);
  const [relations, setRelations] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; form: Row } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    try {
      const data = await api(`/api/admin/r/${resource}`);
      setItems(data.items);
      const rels = [...new Set(cfg.fields.filter((f) => f.type === "relation").map((f) => f.relation!))];
      const loaded: Record<string, Row[]> = {};
      for (const r of rels) loaded[r] = (await api(`/api/admin/r/${r}`)).items;
      setRelations(loaded);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const relationName = (f: ResourceField, id: string | null) =>
    id ? relations[f.relation!]?.find((r) => r.id === id)?.name : null;

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) => `${i[cfg.titleKey]} ${cfg.subtitleKey ? i[cfg.subtitleKey] : ""}`.toLowerCase().includes(term));
  }, [items, filter, cfg]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      const payload: Row = { ...editing.form };
      if (editing.id) {
        await api(`/api/admin/r/${resource}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/admin/r/${resource}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      flash("Guardado. El sitio ya se actualizó.");
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(row: Row, key: "sold_out" | "active") {
    try {
      await api(`/api/admin/r/${resource}/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !row[key] }),
      });
      setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, [key]: !row[key] } : r)));
      flash("Guardado. El sitio ya se actualizó.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(row: Row) {
    const name = row[cfg.titleKey];
    if (!confirm(`¿Borrar ${cfg.singular} «${name}»? Esta acción no se puede deshacer.`)) return;
    try {
      await api(`/api/admin/r/${resource}/${row.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((r) => r.id !== row.id));
      flash("Borrado.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  function setField(key: string, value: any) {
    setEditing((e) => (e ? { ...e, form: { ...e.form, [key]: value } } : e));
  }

  function renderField(f: ResourceField) {
    const form = editing!.form;
    const id = `f-${f.key}`;
    const wide = f.type === "textarea" || f.type === "image" || f.type === "checkbox";

    let control: React.ReactNode;
    if (f.type === "textarea") {
      control = (
        <textarea id={id} className="a-textarea" value={form[f.key] ?? ""} maxLength={f.max} onChange={(e) => setField(f.key, e.target.value)} />
      );
    } else if (f.type === "number") {
      control = (
        <input id={id} type="number" className="a-input" value={form[f.key] ?? 0} onChange={(e) => setField(f.key, e.target.value)} />
      );
    } else if (f.type === "checkbox") {
      return (
        <div className="a-field full" key={f.key}>
          <label className="a-check">
            <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setField(f.key, e.target.checked)} />
            {f.label}
          </label>
          {f.help && <span className="a-help">{f.help}</span>}
        </div>
      );
    } else if (f.type === "image") {
      control = <ImageField value={form[f.key]} folder={FOLDERS[resource]} onChange={(p) => setField(f.key, p)} />;
    } else if (f.type === "select") {
      control = (
        <select id={id} className="a-select" value={String(form[f.key])} onChange={(e) => setField(f.key, e.target.value)}>
          {f.options!.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    } else if (f.type === "relation") {
      control = (
        <select id={id} className="a-select" value={form[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value || null)}>
          <option value="">{f.emptyLabel || "Ninguna"}</option>
          {(relations[f.relation!] || []).map((r) => (
            <option key={r.id} value={r.id}>{r.name}{r.active ? "" : " (oculta)"}</option>
          ))}
        </select>
      );
    } else {
      control = (
        <input id={id} className="a-input" value={form[f.key] ?? ""} maxLength={f.max} onChange={(e) => setField(f.key, e.target.value)} />
      );
    }

    return (
      <div className={`a-field${wide ? " full" : ""}`} key={f.key}>
        <label htmlFor={id}>{f.label}{f.required ? " *" : ""}</label>
        {control}
        {f.help && <span className="a-help">{f.help}</span>}
      </div>
    );
  }

  const hasSoldOut = cfg.fields.some((f) => f.key === "sold_out");

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{cfg.title}</h1>
          {cfg.intro && <p>{cfg.intro}</p>}
        </div>
        <button className="a-btn primary" onClick={() => { setFormError(""); setEditing({ id: null, form: emptyForm(cfg) }); }}>
          <i className="fa-solid fa-plus"></i> Nuevo {cfg.singular}
        </button>
      </div>

      {notice && <div className="a-msg ok">{notice}</div>}
      {error && <div className="a-msg error">{error}</div>}

      <div className="a-card">
        {items.length > 6 && (
          <div className="a-toolbar">
            <input className="a-input" placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        )}

        {loading ? (
          <p className="a-empty">Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="a-empty">{items.length === 0 ? `Todavía no hay ${cfg.title.toLowerCase()}. Crea el primero con el botón «Nuevo».` : "Sin resultados."}</p>
        ) : (
          <div className="a-list">
            {visible.map((row) => (
              <div className="a-row" key={row.id}>
                {cfg.imageKey && (
                  <div className="a-row-thumb">
                    {row[cfg.imageKey] ? <img src={imageUrl(row[cfg.imageKey])} alt="" /> : <i className="fa-regular fa-image"></i>}
                  </div>
                )}
                <div className="a-row-main">
                  <div className="a-row-title">
                    {row[cfg.titleKey]}
                    {!row.active && <span className="a-chip">Oculto</span>}
                    {row.sold_out && <span className="a-chip danger">Agotado</span>}
                    {row.badge && <span className="a-chip warn">{row.badge}</span>}
                    {cfg.fields.filter((f) => f.type === "relation").map((f) => {
                      const n = relationName(f, row[f.key]);
                      return n ? <span className="a-chip" key={f.key}>{n}</span> : null;
                    })}
                  </div>
                  {cfg.subtitleKey && <div className="a-row-sub">{row[cfg.subtitleKey]}</div>}
                </div>
                <div className="a-row-actions">
                  {hasSoldOut && (
                    <button className="a-btn small" onClick={() => quickToggle(row, "sold_out")}>
                      {row.sold_out ? "Marcar disponible" : "Marcar agotado"}
                    </button>
                  )}
                  <button className="a-btn small" onClick={() => quickToggle(row, "active")}>
                    {row.active ? "Ocultar" : "Mostrar"}
                  </button>
                  <button className="a-btn small" onClick={() => { setFormError(""); setEditing({ id: row.id, form: { ...emptyForm(cfg), ...row, sort_order: row.sort_order } }); }}>
                    Editar
                  </button>
                  <button className="a-btn small danger" onClick={() => remove(row)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {cfg.deleteHint && <p className="a-help" style={{ marginTop: 14, color: "var(--a-muted)", fontSize: ".78rem" }}>{cfg.deleteHint}</p>}
      </div>

      {editing && (
        <div className="a-modal-back" onMouseDown={(e) => e.target === e.currentTarget && !saving && setEditing(null)}>
          <form
            className="a-modal"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <h2>{editing.id ? `Editar ${cfg.singular}` : `Nuevo ${cfg.singular}`}</h2>
            {formError && <div className="a-msg error">{formError}</div>}
            <div className="a-form-grid">{cfg.fields.map(renderField)}</div>
            <div className="a-modal-foot">
              <button type="button" className="a-btn" disabled={saving} onClick={() => setEditing(null)}>Cancelar</button>
              <button type="submit" className="a-btn primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
