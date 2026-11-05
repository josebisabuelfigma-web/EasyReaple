/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // Enlaces de la versión anterior (todo en una sola página) -> páginas nuevas.
  async redirects() {
    return [
      { source: "/contacto", destination: "/nosotros#contacto", permanent: true },
      { source: "/catalogo", destination: "/tienda", permanent: true },
      { source: "/galeria", destination: "/nosotros#galeria", permanent: true },
      { source: "/tecnologia", destination: "/nosotros#tecnologia", permanent: true },
    ];
  },
};

module.exports = nextConfig;
