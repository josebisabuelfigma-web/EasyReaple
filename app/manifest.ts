import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyReaple",
    short_name: "EasyReaple",
    description: "Servicio técnico especializado en dispositivos Apple y Android en Neiva, Huila.",
    start_url: "/",
    display: "standalone",
    background_color: "#081426",
    theme_color: "#0A84FF",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }],
  };
}
