import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Textos, contacto y redes</h1>
          <p>Cambia el WhatsApp, el horario, los enlaces de redes sociales y los textos de cada sección del sitio.</p>
        </div>
      </div>
      <SettingsForm />
    </>
  );
}
