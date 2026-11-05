"use client";

import { useEffect, useState } from "react";

// Botón flotante: aparece al bajar un poco en la página.
export default function WhatsAppFloat({ href }: { href: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-float${visible ? " visible" : ""}`}
      aria-label="Escríbenos por WhatsApp"
    >
      <i className="fa-brands fa-whatsapp"></i>
    </a>
  );
}
