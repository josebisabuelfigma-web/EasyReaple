"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    particlesJS?: (id: string, config: unknown) => void;
  }
}

// En celular se usan menos partículas y sin pantalla retina para que no pese.
function particlesConfig(small: boolean) {
  return {
    particles: {
      number: { value: small ? 38 : 70, density: { enable: true, value_area: 900 } },
      color: { value: "#0A84FF" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 2 },
      line_linked: { enable: true, distance: small ? 130 : 170, color: "#3A9EFF", opacity: 0.35, width: 1 },
      move: { enable: true, speed: small ? 1 : 1.5 },
    },
    interactivity: {
      // "window": el lienzo va detrás del contenido, así que se sigue el mouse en toda la ventana.
      detect_on: "window",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
      modes: { grab: { distance: small ? 160 : 280, line_linked: { opacity: 1 } } },
    },
    retina_detect: !small,
  };
}

// particles.js no entiende el tacto: se convierte el dedo en movimiento de mouse.
function bridgeTouch() {
  const send = (type: string, t?: Touch) =>
    window.dispatchEvent(new MouseEvent(type, { clientX: t?.clientX ?? 0, clientY: t?.clientY ?? 0, bubbles: true }));
  const move = (e: TouchEvent) => send("mousemove", e.touches[0]);
  const end = () => send("mouseleave");
  window.addEventListener("touchstart", move, { passive: true });
  window.addEventListener("touchmove", move, { passive: true });
  window.addEventListener("touchend", end, { passive: true });
  window.addEventListener("touchcancel", end, { passive: true });
  return () => {
    window.removeEventListener("touchstart", move);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", end);
    window.removeEventListener("touchcancel", end);
  };
}

// Efectos de la página: pantalla de carga, aparición al hacer scroll
// (.reveal) y fondo de partículas.
export default function PageEffects() {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");

    const loader = document.getElementById("pageLoader");
    const hide = () => loader?.classList.add("loaded");
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    const fallback = setTimeout(hide, 4000);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const observeAll = () =>
      document.querySelectorAll(".reveal:not(.active)").forEach((el) => observer.observe(el));
    observeAll();

    // El catálogo se vuelve a dibujar al filtrar o buscar.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    const unbridge = bridgeTouch();

    return () => {
      unbridge();
      window.removeEventListener("load", hide);
      clearTimeout(fallback);
      observer.disconnect();
      mutations.disconnect();
      document.documentElement.classList.remove("js-ready");
    };
  }, []);

  return (
    <Script
      src="/particles.min.js"
      strategy="lazyOnload"
      onReady={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce && document.getElementById("particles-js") && window.particlesJS) {
          window.particlesJS("particles-js", particlesConfig(window.innerWidth < 768));
        }
      }}
    />
  );
}
