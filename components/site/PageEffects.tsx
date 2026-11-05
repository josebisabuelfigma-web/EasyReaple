"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    particlesJS?: (id: string, config: unknown) => void;
  }
}

const PARTICLES_CONFIG = {
  particles: {
    number: { value: 70, density: { enable: true, value_area: 900 } },
    color: { value: "#0A84FF" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 2 },
    line_linked: { enable: true, distance: 170, color: "#3A9EFF", opacity: 0.35, width: 1 },
    move: { enable: true, speed: 1.5 },
  },
  interactivity: {
    detect_on: "canvas",
    events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
    modes: { grab: { distance: 280, line_linked: { opacity: 1 } } },
  },
  retina_detect: true,
};

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

    return () => {
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
        if (document.getElementById("particles-js") && window.particlesJS) {
          window.particlesJS("particles-js", PARTICLES_CONFIG);
        }
      }}
    />
  );
}
