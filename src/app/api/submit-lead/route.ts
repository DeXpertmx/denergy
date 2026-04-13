import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Volkern CRM configuration
const VOLKERN_API_URL = process.env.VOLKERN_API_URL || "https://volkern.app/api";
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY || "";

async function createVolkernLead(payload: Record<string, any>) {
  if (!VOLKERN_API_KEY) {
    console.log("[Volkern] No VOLKERN_API_KEY configured.");
    return { success: false, reason: "No API Key configured in Environment" };
  }

  try {
    const response = await fetch(`${VOLKERN_API_URL}/leads`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLKERN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`[Volkern] API Error (${response.status}):`, data);
      return { 
        success: false, 
        reason: data.message || data.error || `Status ${response.status}`,
        status: response.status 
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[Volkern] Fetch error:", error);
    return { success: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

async function createVolkernNote(leadId: string, content: string) {
  if (!VOLKERN_API_KEY || !leadId) return;
  try {
    await fetch(`${VOLKERN_API_URL}/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLKERN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contenido: content }),
    });
  } catch (e) {
    console.error("[Volkern] Error note:", e);
  }
}

async function createVolkernTask(leadId: string, leadNombre: string) {
  if (!VOLKERN_API_KEY || !leadId) return;
  
  // Follow-up task exactly 24 hours from now
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  try {
    await fetch(`${VOLKERN_API_URL}/leads/${leadId}/tasks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLKERN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "llamada",
        titulo: `Llamada de seguimiento: ${leadNombre}`,
        descripcion: "Dar seguimiento a la propuesta energética enviada desde la web.",
        fechaVencimiento: tomorrow.toISOString(),
      }),
    });
    console.log("[Volkern] Task created for tomorrow:", tomorrow.toISOString());
  } catch (e) {
    console.error("[Volkern] Error task:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, invoice, context } = body;

    if (!lead?.nombre || !lead?.whatsapp) {
      return NextResponse.json({ error: "Faltan campos obligatorios (nombre y whatsapp)" }, { status: 400 });
    }

    // Prepare Invoice Summary
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

    // ---- 1. Save locally ----
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

    // ---- 2. Forward to Volkern CRM ----
    const volkernResult = await createVolkernLead({
      nombre: lead.nombre,
      email: lead.email || null,
      telefono: lead.whatsapp,
      canal: "web",
      estado: "nuevo",
      etiquetas: ["dimension-energy", "captacion-web", "analisis-energia"],
      contextoProyecto: finalContext,
      notas: `Lead registrado desde el portal Dimension Energy (${new Date().toLocaleString()})`
    });

    // Robust ID identification
    const volkernId = volkernResult.data?.id || 
                    volkernResult.data?.lead_id || 
                    volkernResult.data?.data?.id || 
                    volkernResult.data?.data?.lead_id;
    
    if (volkernResult.success && volkernId) {
      // Create Note & Task
      await Promise.all([
        createVolkernNote(volkernId, invoiceSummary),
        createVolkernTask(volkernId, lead.nombre)
      ]);
    }

    // Update crm status locally
    await db.lead.update({
      where: { id: dbLead.id },
      data: {
        crmSent: volkernResult.success,
        crmResponse: JSON.stringify(volkernResult),
      },
    });

    return NextResponse.json({
      success: true,
      localId: dbLead.id,
      crmSuccess: volkernResult.success,
      crmError: volkernResult.success ? null : volkernResult.reason,
      message: volkernResult.success
        ? "Lead registrado y tarea de seguimiento agendada en 24h"
        : `Guardado localmente. Error CRM: ${volkernResult.reason || 'Desconocido'}`
    });

  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Error interno", details: String(error) }, { status: 500 });
  }
}
