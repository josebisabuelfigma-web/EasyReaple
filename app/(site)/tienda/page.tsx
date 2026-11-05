import type { Metadata } from "next";
import { getSiteData } from "@/lib/siteData";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Catalog from "@/components/site/Catalog";
import { JsonLd, PageHero } from "@/components/site/parts";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata("/tienda");

export default async function TiendaPage() {
  const data = await getSiteData();
  const s = data.settings;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Tienda", path: "/tienda" }])} />

      <PageHero crumb="Tienda" subtitle={s.catalog_subtitle} title={s.catalog_title} description={s.catalog_description} />

      <section className="products page-body" id="catalogo">
        <div className="container">
          <Catalog
            categories={data.categories}
            brands={data.brands}
            products={data.products}
            whatsappNumber={s.whatsapp_number}
          />
        </div>
      </section>
    </>
  );
}
