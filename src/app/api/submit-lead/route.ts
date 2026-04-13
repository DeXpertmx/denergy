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
    console.log("[Volkern] Note added to lead:", leadId);
  } catch (error) {
    console.error("[Volkern] Error adding note:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, invoice, context } = body;

    // Validate required fields
    if (!lead?.nombre || !lead?.whatsapp) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para el Lead (nombre y whatsapp)" },
        { status: 400 }
      );
    }

    // Prepare Invoice Summary for Note/Context
    const invoiceSummary = invoice ? `
--- Detalles de Factura ---
CUPS: ${invoice.cups || 'No detectado'}
Dirección: ${invoice.direccion || 'No detectada'}
Comercializadora: ${invoice.comercializadoraActual || invoice.comercializadora || 'N/A'}
Tarifa: ${invoice.tarifaActual || invoice.tarifa || 'N/A'}
Potencia: P1: ${invoice.potenciaP1 || invoice.potencia_p1 || 'N/A'} / P2: ${invoice.potenciaP2 || invoice.potencia_p2 || 'N/A'}
Consumo: ${invoice.consumoMensual || invoice.consumo_mensual || 'N/A'}
Importe: ${invoice.importeTotal || invoice.importe_total || 'N/A'}
Fecha: ${invoice.fechaFactura || invoice.fecha_factura || 'N/A'}
      `.trim() : "Lead sin factura adjunta.";

    const finalContext = `${context || ""}\n\n${invoiceSummary}`.trim();

    // ---- 1. Save to local database ----
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
    const volkernLeadPayload = {
      nombre: lead.nombre,
      email: lead.email || null,
      telefono: lead.whatsapp,
      canal: "web",
      estado: "nuevo",
      etiquetas: ["dimension-energy", "captacion-web", "analisis-energia"],
      contextoProyecto: finalContext,
      notas: `Lead registrado desde el portal Dimension Energy (${new Date().toLocaleString()})`
    };

    const volkernResult = await createVolkernLead(volkernLeadPayload);

    // If lead was created in Volkern, ensure detail note is also created
    // The API usually returns the object directly or nested in { data: { id } }
    const volkernId = volkernResult.data?.id || volkernResult.data?.data?.id;
    
    if (volkernResult.success && volkernId) {
      await createVolkernNote(volkernId, invoiceSummary);
    }

    // Update crm status in local DB
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
        ? "Lead registrado correctamente en Dimension Energy y Volkern CRM"
        : `Datos guardados localmente. Error CRM: ${volkernResult.reason || 'Desconocido'}`
    });

  } catch (error) {
    console.error("[API] Error in submit-lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
