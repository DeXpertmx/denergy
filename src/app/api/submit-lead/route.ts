import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const VOLKERN_API_URL = process.env.VOLKERN_API_URL || "https://volkern.app/api";
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY || "";

function volkernHeaders() {
  return {
    "Authorization": `Bearer ${VOLKERN_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function volkernFetch(path: string, body: Record<string, any>) {
  const res = await fetch(`${VOLKERN_API_URL}${path}`, {
    method: "POST",
    headers: volkernHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Volkern ${path} → ${res.status}: ${data?.error || JSON.stringify(data)}`);
  return data;
}

export async function POST(request: NextRequest) {
  if (!VOLKERN_API_KEY) {
    return NextResponse.json({ error: "Falta VOLKERN_API_KEY en las variables de entorno de Vercel." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { lead, invoice, context } = body;

    if (!lead?.nombre) {
      return NextResponse.json({ error: "Falta el nombre del lead." }, { status: 400 });
    }

    // Build a rich invoice context block
    const invoiceBlock = invoice ? [
      "══════════════════════════════",
      "📋 DATOS FACTURA ELÉCTRICA",
      "══════════════════════════════",
      `👤 Titular: ${invoice.titular || "N/D"}`,
      `📍 CUPS: ${invoice.cups || invoice.CUPS || "N/D"}`,
      `🏠 Dirección: ${invoice.direccion || "N/D"}`,
      `🏢 Comercializadora actual: ${invoice.comercializadoraActual || invoice.comercializadora || "N/D"}`,
      `📊 Tarifa: ${invoice.tarifaActual || invoice.tarifa || "N/D"}`,
      `⚡ Potencia P1: ${invoice.potenciaP1 || invoice.potencia_p1 || "N/D"} | P2: ${invoice.potenciaP2 || invoice.potencia_p2 || "N/D"}`,
      `📈 Consumo mensual: ${invoice.consumoMensual || invoice.consumo_mensual || "N/D"}`,
      `💶 Importe total: ${invoice.importeTotal || invoice.importe_total || "N/D"}`,
      `📅 Fecha factura: ${invoice.fechaFactura || invoice.fecha_factura || "N/D"}`,
      `📆 Período: ${invoice.periodoFacturacion || invoice.periodo_facturacion || "N/D"}`,
      "══════════════════════════════",
      "🔎 Lead captado desde: Dimension Energy (Análisis Web)",
    ].join("\n") : "Lead sin factura adjunta.";

    const contextoProyecto = [context || "", invoiceBlock].filter(Boolean).join("\n\n");

    // ── STEP 1: CREATE LEAD ──
    const leadData = await volkernFetch("/leads", {
      nombre: lead.nombre,
      email: lead.email || undefined,
      telefono: lead.whatsapp || lead.telefono || undefined,
      canal: "web",
      estado: "nuevo",
      etiquetas: ["dimension-energy", "analisis-web"],
      contextoProyecto,
    });

    const leadId = leadData?.lead?.id || leadData?.id || leadData?.data?.id;
    if (!leadId) {
      throw new Error(`Lead creado pero sin ID en respuesta: ${JSON.stringify(leadData)}`);
    }

    // ── STEP 2: ADD NOTE WITH INVOICE SUMMARY ──
    await volkernFetch(`/leads/${leadId}/notes`, {
      titulo: "📄 Análisis de Factura Eléctrica",
      contenido: invoiceBlock,
    });

    // ── STEP 3: CREATE 24H FOLLOW-UP TASK ──
    const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await volkernFetch(`/leads/${leadId}/tasks`, {
      tipo: "llamada",
      titulo: `📞 Seguimiento: ${lead.nombre}`,
      descripcion: "Llamada de seguimiento de propuesta energética captada en web Dimension Energy.",
      fechaVencimiento: followUpDate,
    });

    return NextResponse.json({
      success: true,
      leadId,
      message: "Lead registrado en Volkern CRM con nota de factura y tarea de seguimiento en 24h.",
    });

  } catch (error: any) {
    console.error("[submit-lead] Error:", error.message);
    return NextResponse.json({
      error: "Error al registrar en Volkern CRM",
      details: error.message,
    }, { status: 500 });
  }
}
