import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Faltan las variables de entorno de correo (SMTP_HOST / SMTP_USER / SMTP_PASSWORD).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 20000,
    socketTimeout: 20000,
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const fromName = process.env.MAIL_FROM_NAME || "EasyReaple";
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (info.rejected && info.rejected.length > 0) {
    throw new Error(`El servidor de correo rechazó a: ${info.rejected.map(String).join(", ")}`);
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function passwordResetEmailHtml(params: { username: string; resetUrl: string; minutes: number }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const logo = appUrl
    ? `<img src="${appUrl}/logo.png" alt="EasyReaple" style="max-width:160px;margin-bottom:16px;" />`
    : "";
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    ${logo}
    <h2 style="margin-bottom: 8px;">Restablecer tu contraseña</h2>
    <p>Hola ${escapeHtml(params.username)},</p>
    <p>Recibimos una solicitud para restablecer la contraseña del panel de administración de EasyReaple.</p>
    <p style="margin: 24px 0;">
      <a href="${params.resetUrl}"
         style="background:#0A84FF;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Elegir una contraseña nueva
      </a>
    </p>
    <p style="font-size: 13px; color: #92400e; background:#fff7ed; border:1px solid #fcd9a8; padding:10px 14px; border-radius:8px;">
      Este enlace sirve una sola vez y vence en ${params.minutes} minutos.
    </p>
    <p style="font-size: 13px; color: #666;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <a href="${params.resetUrl}">${params.resetUrl}</a>
    </p>
    <p style="font-size: 13px; color: #666;">
      Si tú no lo pediste, ignora este correo: tu contraseña actual sigue funcionando.
    </p>
  </div>
  `;
}
