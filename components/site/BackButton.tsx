"use client";

import { useRouter } from "next/navigation";

// «Volver»: regresa a la página anterior del sitio; si la persona llegó
// directo (por Google o un enlace), la lleva al Inicio.
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => {
        const cameFromSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
        if (cameFromSite && window.history.length > 1) router.back();
        else router.push("/");
      }}
    >
      <i className="fa-solid fa-arrow-left"></i> Volver
    </button>
  );
}
