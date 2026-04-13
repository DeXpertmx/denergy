import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Volkern CRM configuration
const VOLKERN_API_URL = process.env.VOLKERN_API_URL || "https://volkern.app/api";
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY || "";

async function createVolkernLead(payload: Record<string, any>) {
  if (!VOLKERN_API_KEY) {
    return { success: false, reason: "Configuración incompleta: Falta VOLKERN_API_KEY en Vercel." };
  }

  try {
    const response = await fetch(`${VOLKERN_API_URL}/leads`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLKERN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000), // 8s timeout for lead creation
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, reason: data.message || data.error || `Status ${response.status}` };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, reason: error.name === 'AbortError' ? 'Tiempo de espera agotado' : error.message };
  }
}

async function createVolkernNote(leadId: string, content: string) {
  if (!VOLKERN_API_KEY || !leadId) return;
  try {
    await fetch(`${VOLKERN_API_URL}/leads/${leadId}/notes`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${VOLKERN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: content }),
      signal: AbortSignal.timeout(5000), // Independent 5s timeout
    });
  } catch (e) { console.error("[Volkern] Note fail:", e); }
}

async function createVolkernTask(leadId: string, leadNombre: string) {
  if (!VOLKERN_API_KEY || !leadId) return;
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    await fetch(`${VOLKERN_API_URL}/leads/${leadId}/tasks`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${VOLKERN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "llamada",
        titulo: `Llamada seguimiento: ${leadNombre}`,
        descripcion: "Seguimiento propuesta energética web.",
        fechaVencimiento: tomorrow.toISOString(),
      }),
      signal: AbortSignal.timeout(5000), // Independent 5s timeout
    });
  } catch (e) { console.error("[Volkern] Task fail:", e); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, invoice, context } = body;

    if (!lead?.nombre || !lead?.whatsapp) {
      return NextResponse.json({ error: "Datos de contacto incompletos" }, { status: 400 });
    }

    // 1. Save locally (Prisma)
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
        invoiceContext: context || null,
      },
    });

    // 2. Try CRM (Lead only)
    const volkernResult = await createVolkernLead({
      nombre: lead.nombre,
      email: lead.email || null,
      telefono: lead.whatsapp,
      canal: "web",
      estado: "nuevo",
      etiquetas: ["dimension-energy", "analisis-web"],
      contextoProyecto: context || "Captado desde Dimension Energy",
    });

    // 3. Optional CRM additions (Note/Task) - Do not crash if they fail
    if (volkernResult.success) {
      const volkernId = volkernResult.data?.id || volkernResult.data?.lead_id || volkernResult.data?.data?.id;
      if (volkernId) {
        const invoiceSummary = `Extracción: CUPS ${invoice?.cups || 'N/A'}, Consumo ${invoice?.consumoMensual || 'N/A'}, Importe ${invoice?.importeTotal || 'N/A'}`;
        // Parallel but isolated
        Promise.allSettled([
          createVolkernNote(volkernId, invoiceSummary),
          createVolkernTask(volkernId, lead.nombre)
        ]).catch(e => console.error("Optional CRM steps failed", e));
      }
    }

    // 4. Update local DB with CRM status
    try {
      await db.lead.update({
        where: { id: dbLead.id },
        data: { crmSent: volkernResult.success, crmResponse: JSON.stringify(volkernResult) },
      });
    } catch (e) { console.error("Local status update fail", e); }

    return NextResponse.json({
      success: true,
      crmSuccess: volkernResult.success,
      message: volkernResult.success 
        ? "Lead registrado con éxito" 
        : `Guardado localmente. (Error CRM: ${volkernResult.reason || 'Saturación'})`
    });

  } catch (error: any) {
    console.error("Submit-Lead 500:", error);
    return NextResponse.json({ error: "Error técnico", details: error.message }, { status: 500 });
  }
}
