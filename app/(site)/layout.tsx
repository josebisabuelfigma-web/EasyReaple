// Estilos del sitio público (se cargan solo aquí, para no afectar al panel).
import "@/styles/reset.css";
import "@/styles/variables.css";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/hero.css";
import "@/styles/services.css";
import "@/styles/products.css";
import "@/styles/gallery.css";
import "@/styles/contact.css";
import "@/styles/footer.css";
import "@/styles/animations.css";
import "@/styles/responsive.css";
import "@/styles/site-extra.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
