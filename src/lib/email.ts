import nodemailer from 'nodemailer';

// Email configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@dimensionexpert.com';
const ANALYSIS_EMAIL = process.env.ANALYSIS_EMAIL || 'energy@dimensionexpert.com';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export interface AnalysisEmailData {
  leadId: string;
  nombre: string;
  email: string;
  whatsapp: string;
  cups?: string;
  direccion?: string;
  comercializadora?: string;
  tarifa?: string;
  potenciaP1?: string;
  potenciaP2?: string;
  consumoMensual?: string;
  importeTotal?: string;
  fechaFactura?: string;
  periodoFacturacion?: string;
  fileName?: string;
  createdAt: string;
}

export async function sendAnalysisEmail(data: AnalysisEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getTransporter();

    const subject = `⚡ Nuevo Lead - Factura de ${data.nombre} - ${data.comercializadora || 'N/A'} - ${data.tarifa || 'N/A'}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.85; }
    .section { padding: 24px 32px; }
    .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .info-item { margin-bottom: 4px; }
    .info-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; color: #1f2937; font-weight: 500; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box .value { font-size: 24px; font-weight: 700; color: #1e3a5f; }
    .highlight-box .label { font-size: 12px; color: #6b7280; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 0; }
    .footer { padding: 16px 32px; background: #f9fafb; font-size: 11px; color: #9ca3af; text-align: center; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Nuevo Lead Recibido</h1>
      <p>${new Date(data.createdAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
    </div>

    <div class="section">
      <div class="section-title">Datos del Cliente</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nombre</div>
          <div class="info-value">${data.nombre}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value"><a href="mailto:${data.email}">${data.email}</a></div>
        </div>
        <div class="info-item">
          <div class="info-label">WhatsApp</div>
          <div class="info-value"><a href="https://wa.me/${data.whatsapp.replace(/[^0-9+]/g, '')}">${data.whatsapp}</a></div>
        </div>
        <div class="info-item">
          <div class="info-label">Dirección</div>
          <div class="info-value">${data.direccion || 'No disponible'}</div>
        </div>
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-label">CUPS</div>
          <div class="info-value" style="font-family: monospace; font-size: 13px;">${data.cups || 'No disponible'}</div>
        </div>
      </div>
    </div>

    <hr class="divider">

    <div class="section">
      <div class="section-title">Datos de la Factura</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Comercializadora</div>
          <div class="info-value">${data.comercializadora || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Tarifa</div>
          <div class="info-value">${data.tarifa || 'N/A'} <span class="badge">Perfilar</span></div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha Factura</div>
          <div class="info-value">${data.fechaFactura || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Período</div>
          <div class="info-value">${data.periodoFacturacion || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Potencia P1</div>
          <div class="info-value">${data.potenciaP1 || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Potencia P2</div>
          <div class="info-value">${data.potenciaP2 || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Consumo Mensual</div>
          <div class="info-value">${data.consumoMensual ? `${data.consumoMensual} kWh` : 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fichero</div>
          <div class="info-value">${data.fileName || 'N/A'}</div>
        </div>
      </div>
    </div>

    <div class="section" style="padding-top: 0;">
      <div class="highlight-box">
        <div class="label">IMPORTE TOTAL FACTURA</div>
        <div class="value">${data.importeTotal || 'No disponible'}</div>
      </div>
    </div>

    <hr class="divider">

    <div class="section" style="padding-bottom: 12px;">
      <div class="section-title">Acciones Requeridas</div>
      <div style="font-size: 13px; color: #374151; line-height: 1.6;">
        <p style="margin: 0 0 8px;">✅ <strong>1.</strong> Analizar la factura y preparar propuesta personalizada con GBP Energía</p>
        <p style="margin: 0 0 8px;">✅ <strong>2.</strong> Enviar propuesta al cliente en las próximas <strong>24 horas</strong></p>
        <p style="margin: 0;">✅ <strong>3.</strong> El sistema enviará automáticamente recordatorio si no se ha enviado</p>
      </div>
    </div>

    <div class="footer">
      <p>Lead ID: ${data.leadId} | Dimension Energy · GBP Energía</p>
      <p style="margin-top: 4px;">Este email fue generado automáticamente por el sistema de captación de leads.</p>
    </div>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: EMAIL_FROM,
      to: ANALYSIS_EMAIL,
      subject,
      html,
    });

    console.log('[Email] Analysis email sent successfully to:', ANALYSIS_EMAIL);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending analysis email:', error);
    return { success: false, error: String(error) };
  }
}

export interface ProposalEmailData {
  nombre: string;
  email: string;
  whatsapp: string;
  cups?: string;
  comercializadora?: string;
  tarifa?: string;
  consumoMensual?: string;
  importeTotal?: string;
  potenciaP1?: string;
  potenciaP2?: string;
  direccion?: string;
  propuesta: string; // HTML content of the proposal
}

export async function sendProposalEmail(data: ProposalEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getTransporter();

    const subject = `Su propuesta personalizada de ahorro energético - Dimension Energy`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: #fff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
    .section { padding: 24px 32px; }
    .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
    .proposal-content { font-size: 14px; color: #374151; line-height: 1.7; }
    .proposal-content h2 { color: #1e3a5f; font-size: 18px; margin-top: 20px; margin-bottom: 8px; }
    .proposal-content h3 { color: #1e3a5f; font-size: 16px; margin-top: 16px; margin-bottom: 6px; }
    .proposal-content ul { margin: 8px 0; padding-left: 20px; }
    .proposal-content li { margin-bottom: 4px; }
    .proposal-content table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .proposal-content th { background: #1e3a5f; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; }
    .proposal-content td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .cta-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 20px 24px; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #2563eb; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .cta-button:hover { background: #1d4ed8; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 0; }
    .footer { padding: 16px 32px; background: #f9fafb; font-size: 11px; color: #9ca3af; text-align: center; }
    .footer a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Su Propuesta de Ahorro Energético</h1>
      <p>Personalizada para ${data.nombre}</p>
    </div>

    <div class="section">
      <div class="section-title">Resumen de su Situación Actual</div>
      <div style="font-size: 13px; color: #6b7280; line-height: 1.8;">
        Comercializadora actual: <strong style="color: #1f2937;">${data.comercializadora || 'N/A'}</strong><br>
        Tarifa: <strong style="color: #1f2937;">${data.tarifa || 'N/A'}</strong> · 
        Consumo: <strong style="color: #1f2937;">${data.consumoMensual ? `${data.consumoMensual} kWh/mes` : 'N/A'}</strong> · 
        Importe: <strong style="color: #1f2937;">${data.importeTotal || 'N/A'}</strong>
      </div>
    </div>

    <hr class="divider">

    <div class="section">
      <div class="section-title">Propuesta Personalizada</div>
      <div class="proposal-content">
        ${data.propuesta}
      </div>
    </div>

    <div class="section" style="padding-top: 0;">
      <div class="cta-box">
        <p style="margin: 0 0 12px; font-size: 14px; color: #1e3a5f;">¿Listo para empezar a ahorrar?</p>
        <a href="https://wa.me/34600971950?text=${encodeURIComponent(`Hola, he recibido la propuesta de Dimension Energy y me gustaría más información.`)}" class="cta-button">💬 Contactar por WhatsApp</a>
        <p style="margin: 12px 0 0; font-size: 12px; color: #6b7280;">o llámenos al <strong>600 971 950</strong></p>
      </div>
    </div>

    <hr class="divider">

    <div class="footer">
      <p><strong>Dimension Energy</strong> · Comercializadora: GBP Energía</p>
      <p style="margin-top: 4px;">📞 600 971 950 · ✉️ <a href="mailto:energy@dimensionexpert.com">energy@dimensionexpert.com</a></p>
      <p style="margin-top: 8px;">L-V 9:00-19:00, S 10:00-14:00</p>
    </div>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: EMAIL_FROM,
      to: data.email,
      subject,
      html,
    });

    console.log('[Email] Proposal email sent to:', data.email);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending proposal email:', error);
    return { success: false, error: String(error) };
  }
}
