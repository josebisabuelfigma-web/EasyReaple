import type { Metadata } from "next";
import Link from "next/link";
import { getSiteData } from "@/lib/siteData";
import { whatsappLink } from "@/lib/settings";
import { breadcrumbJsonLd, pageMetadata, servicesJsonLd } from "@/lib/seo";
import { JsonLd, PageHero, RepairCard, SectionHead } from "@/components/site/parts";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata("/servicios");

export default async function ServiciosPage() {
  const data = await getSiteData();
  const s = data.settings;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }])} />
      {data.repairServices.length > 0 && <JsonLd data={servicesJsonLd(data)} />}

      <PageHero crumb="Servicios" subtitle={s.repair_subtitle} title={s.repair_title} description={s.repair_description} />

      <section className="repair-section page-body">
        <div className="container">
          {data.repairServices.length > 0 ? (
            <div className="repair-grid">
              {data.repairServices.map((r) => (
                <RepairCard key={r.id} service={r} whatsappNumber={s.whatsapp_number} />
              ))}
            </div>
          ) : (
            <p className="products-empty">Pronto publicaremos nuestros servicios. Mientras tanto, escríbenos por WhatsApp.</p>
          )}
        </div>
      </section>

      {/* EQUIPOS QUE USAMOS */}
      {data.equipment.length > 0 && (
        <section className="equipment" id="tecnologia">
          <div className="container">
            <SectionHead subtitle={s.equipment_subtitle} title={s.equipment_title} description={s.equipment_description} />
            <div className="services-grid">
              {data.equipment.map((e) => (
                <article className="equipment-card reveal" key={e.id}>
                  <div className="equipment-thumb">{e.image && <img src={e.image} alt={e.title} loading="lazy" />}</div>
                  <div className="equipment-body">
                    <h3>{e.title}</h3>
                    <p>{e.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="container">
          <h2>¿No ves tu falla en la lista?</h2>
          <p>Cuéntanos qué le pasa a tu equipo y te damos un diagnóstico sin compromiso.</p>
          <div className="cta-buttons">
            <a href={whatsappLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <i className="fa-brands fa-whatsapp"></i> Escríbenos por WhatsApp
            </a>
            <Link href="/tienda" className="btn-secondary">
              Ver la tienda
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
