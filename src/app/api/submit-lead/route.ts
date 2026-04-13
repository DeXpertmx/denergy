import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60; // Allow enough time for DB save and webhook call

const WEBHOOK_URL = "https://webhook.dimension.expert/webhook/e2310871-0208-4e6a-a366-2ebe2e757d1f";

async function sendToWebhook(payload: Record<string, any>) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // 15s timeout for webhook
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, reason: `Status ${response.status}: ${text}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, reason: error.name === 'AbortError' ? 'Tiempo de espera en Webhook agotado' : error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, invoice, context } = body;

    if (!lead?.nombre || !lead?.whatsapp) {
      return NextResponse.json({ error: "Datos de contacto incompletos" }, { status: 400 });
    }

    // 1. Convert to unified format
    const invoiceSummary = invoice ? `
--- Detalles de Factura ---
CUPS: ${invoice.cups || 'No detectado'}
Dirección: ${invoice.direccion || 'No detectada'}
Comercializadora: ${invoice.comercializadoraActual || invoice.comercializadora || 'N/A'}
Tarifa: ${invoice.tarifaActual || invoice.tarifa || 'N/A'}
Potencia: P1: ${invoice.potenciaP1 || invoice.potencia_p1 || 'N/A'} / P2: ${invoice.potenciaP2 || invoice.potencia_p2 || 'N/A'}
Consumo: ${invoice.consumoMensual || invoice.consumo_mensual || 'N/A'}
Importe: ${invoice.importeTotal || invoice.importe_total || 'N/A'}
    `.trim() : "Lead sin factura adjunta.";

    const finalContext = `${context || ""}\n\n${invoiceSummary}`.trim();

    // 2. Save locally (Prisma)
    const dbLead = await db.lead.create({
      data: {
        nombre: lead.nombre,
        email: lead.email || "sin_email@dimension-energy.es",
        whatsapp: lead.whatsapp,
        cups: invoice?.cups || null,
        direccion: invoice?.direccion || null,
        comercializadora: invoice?.comercializadoraActual || invoice?.comercializadora || null,
        tarifa: invoice?.tarifaActual || invoice?.tarifa || null,
        potenciaP1: invoice?.potenciaP1 || invoice?.potencia_p1 || null,
        potenciaP2: invoice?.potenciaP2 || invoice?.potencia_p2 || null,
        consumoMensual: invoice?.consumoMensual || invoice?.consumo_mensual || null,
        importeTotal: invoice?.importeTotal || invoice?.importe_total || null,
        fechaFactura: invoice?.fechaFactura || invoice?.fecha_factura || null,
        periodoFacturacion: invoice?.periodoFacturacion || invoice?.periodo_facturacion || null,
        fileName: invoice?.file_name || null,
        fileType: invoice?.file_type || null,
        fileSize: invoice?.file_size || null,
        fileBase64: invoice?.file_base64 || null,
        invoiceContext: finalContext,
      },
    });

    // 3. Send payload to webhook
    const webhookPayload = {
      localId: dbLead.id,
      lead: {
        nombre: lead.nombre,
        email: lead.email || null,
        telefono: lead.whatsapp,
        canal: "web",
        estado: "nuevo",
        etiquetas: ["dimension-energy", "analisis-web"]
      },
      invoice: invoice || {},
      contextoProyecto: finalContext,
      invoiceSummary: invoiceSummary
    };

    const webhookResult = await sendToWebhook(webhookPayload);

    // 4. Update local DB with Webhook status
    try {
      await db.lead.update({
        where: { id: dbLead.id },
        data: { 
          crmSent: webhookResult.success, 
          crmResponse: JSON.stringify(webhookResult) 
        },
      });
    } catch (e) { console.error("Local status update fail", e); }

    return NextResponse.json({
      success: true,
      webhookSuccess: webhookResult.success,
      message: webhookResult.success 
        ? "Lead registrado y enviado al CRM exitosamente" 
        : `Guardado localmente. (Error Webhook: ${webhookResult.reason || 'Desconocido'})`
    });

  } catch (error: any) {
    console.error("Submit-Lead 500:", error);
    return NextResponse.json({ error: "Error técnico", details: error.message }, { status: 500 });
  }
}
