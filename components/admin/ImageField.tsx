"use client";

import { useRef, useState } from "react";
import { imageUrl } from "@/lib/imageUrl";

// Reduce la foto en el navegador antes de subirla (el límite de la petición en
// Vercel es ~4.5 MB; una foto de celular pesa más). Si algo falla, sube el original.
async function shrink(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.85));
    return blob ? new File([blob], "foto.webp", { type: "image/webp" }) : file;
  } catch {
    return file;
  }
}

type Props = {
  value: string | null;
  folder: "products" | "equipment" | "gallery" | "about" | "services";
  onChange: (path: string | null) => void;
};

export default function ImageField({ value, folder, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const small = await shrink(file);
      const form = new FormData();
      form.append("file", small);
      form.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      onChange(data.path);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <div className="a-image-field">
        <div className="a-image-preview">
          {value ? <img src={imageUrl(value)} alt="Vista previa" /> : <i className="fa-regular fa-image"></i>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="a-btn small" disabled={busy} onClick={() => input.current?.click()}>
            <i className="fa-solid fa-upload"></i> {busy ? "Subiendo..." : value ? "Cambiar foto" : "Subir foto"}
          </button>
          {value && !busy && (
            <button type="button" className="a-btn small danger" onClick={() => onChange(null)}>
              Quitar
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && <p className="a-help" style={{ color: "#b42318", marginTop: 6 }}>{error}</p>}
    </div>
  );
}
