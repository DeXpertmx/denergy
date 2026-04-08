import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendProposalEmail, isEmailConfigured } from "@/lib/email";
import ZAI from "z-ai-web-dev-sdk";

const PROPOSAL_PROMPT = `Eres un asesor comercial experto en energía eléctrica de Dimension Energy / GBP Energía en España.

Tu tarea es generar una propuesta comercial personalizada para un cliente que ha subido su factura de electricidad. La propuesta debe ser:
- Profesional pero cercana
- Basada en los datos reales de su factura
- Enfatizar el ahorro potencial con GBP Energía
- Incluir datos concretos cuando sea posible

La propuesta debe estar en formato HTML (sin las etiquetas <html>, <head>, <body>) con este contenido:

1. **Subtítulo**: "Por qué cambiar a GBP Energía"
2. **Puntos clave de ahorro**: 3-5 bullets con beneficios concretos basados en sus datos
3. **Comparativa estimada**: Una tabla comparativa entre su tarifa actual y la estimada con GBP Energía
4. **Servicios adicionales**: Gestión de trámites, sin permanencia, atención personalizada
5. **Próximos pasos**: Cómo formalizar el cambio

Reglas IMPORTANTES:
- Si tienes datos de consumo, calcula un ahorro estimado del 15-25%
- Si tienes datos de potencias, menciona la posibilidad de optimizarlas
- Siempre menciona que el cambio es GRATUITO y sin compromiso
- Incluye que se gestiona toda la paperwork
- NO inventes datos que no tengas
- Usa formato HTML válido (h2, h3, ul, li, table, strong, etc.)
- NO uses markdown, solo HTML puro`;

interface LeadData {
  id: string;
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
}

async function generateProposal(lead: LeadData): Promise<string> {
  const zai = await ZAI.create();

  const clientContext = `
DATOS DEL CLIENTE:
- Nombre: ${lead.nombre}
- CUPS: ${lead.cups || 'No disponible'}
- Dirección: ${lead.direccion || 'No disponible'}
- Comercializadora actual: ${lead.comercializadora || 'No disponible'}
- Tarifa actual: ${lead.tarifa || 'No disponible'}
- Potencia P1: ${lead.potenciaP1 || 'No disponible'}
- Potencia P2: ${lead.potenciaP2 || 'No disponible'}
- Consumo mensual: ${lead.consumoMensual ? `${lead.consumoMensual} kWh` : 'No disponible'}
- Importe factura: ${lead.importeTotal || 'No disponible'}
- Fecha factura: ${lead.fechaFactura || 'No disponible'}`;

  const response = await zai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: PROPOSAL_PROMPT },
      {
        role: "user",
        content: `Genera la propuesta personalizada para este cliente:\n\n${clientContext}`,
      },
    ],
    thinking: { type: "disabled" },
    max_tokens: 2000,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No se pudo generar la propuesta");
  }

  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, force } = body;

    if (!leadId && !force) {
      return NextResponse.json(
        { error: "Se requiere leadId o el parámetro force" },
        { status: 400 }
      );
    }

    // If force is true, find all leads needing proposal
    if (force) {
      return await processPendingLeads();
    }

    // Send proposal to specific lead
    return await sendProposalToLead(leadId);
  } catch (error) {
    console.error("[API] Error in send-proposal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}

async function sendProposalToLead(leadId: string) {
  // Find the lead
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  if (lead.proposalSentAt) {
    return NextResponse.json(
      { error: "La propuesta ya fue enviada a este lead", sentAt: lead.proposalSentAt },
      { status: 400 }
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS." },
      { status: 500 }
    );
  }

  // Generate proposal using LLM
  console.log(`[Proposal] Generating proposal for lead ${leadId} (${lead.nombre})...`);
  const propuesta = await generateProposal(lead);

  // Send proposal email
  const emailResult = await sendProposalEmail({
    nombre: lead.nombre,
    email: lead.email,
    whatsapp: lead.whatsapp,
    cups: lead.cups || undefined,
    comercializadora: lead.comercializadora || undefined,
    tarifa: lead.tarifa || undefined,
    consumoMensual: lead.consumoMensual || undefined,
    importeTotal: lead.importeTotal || undefined,
    potenciaP1: lead.potenciaP1 || undefined,
    potenciaP2: lead.potenciaP2 || undefined,
    direccion: lead.direccion || undefined,
    propuesta,
  });

  if (emailResult.success) {
    await db.lead.update({
      where: { id: leadId },
      data: { proposalSentAt: new Date() },
    });

    console.log(`[Proposal] Proposal sent to ${lead.nombre} (${lead.email})`);
  }

  return NextResponse.json({
    success: emailResult.success,
    leadId,
    nombre: lead.nombre,
    email: lead.email,
    error: emailResult.error,
  });
}

async function processPendingLeads() {
  if (!isEmailConfigured()) {
    return NextResponse.json({
      processed: 0,
      error: "Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.",
    });
  }

  // Find leads created more than 24 hours ago that haven't received a proposal
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingLeads = await db.lead.findMany({
    where: {
      proposalSentAt: null,
      createdAt: {
        lte: twentyFourHoursAgo,
      },
    },
    orderBy: { createdAt: "asc" },
    take: 10, // Process max 10 at a time
  });

  if (pendingLeads.length === 0) {
    return NextResponse.json({
      processed: 0,
      message: "No hay leads pendientes de propuesta.",
    });
  }

  console.log(`[Proposal] Found ${pendingLeads.length} leads pending proposal.`);

  const results = [];
  for (const lead of pendingLeads) {
    try {
      const propuesta = await generateProposal(lead);
      const emailResult = await sendProposalEmail({
        nombre: lead.nombre,
        email: lead.email,
        whatsapp: lead.whatsapp,
        cups: lead.cups || undefined,
        comercializadora: lead.comercializadora || undefined,
        tarifa: lead.tarifa || undefined,
        consumoMensual: lead.consumoMensual || undefined,
        importeTotal: lead.importeTotal || undefined,
        potenciaP1: lead.potenciaP1 || undefined,
        potenciaP2: lead.potenciaP2 || undefined,
        direccion: lead.direccion || undefined,
        propuesta,
      });

      if (emailResult.success) {
        await db.lead.update({
          where: { id: lead.id },
          data: { proposalSentAt: new Date() },
        });
      }

      results.push({
        leadId: lead.id,
        nombre: lead.nombre,
        email: lead.email,
        success: emailResult.success,
        error: emailResult.error,
      });

      // Wait between emails to avoid rate limiting
      if (pendingLeads.indexOf(lead) < pendingLeads.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`[Proposal] Error processing lead ${lead.id}:`, error);
      results.push({
        leadId: lead.id,
        nombre: lead.nombre,
        success: false,
        error: String(error),
      });
    }
  }

  const successful = results.filter((r) => r.success).length;
  console.log(`[Proposal] Processed ${successful}/${results.length} proposals successfully.`);

  return NextResponse.json({
    processed: results.length,
    successful,
    results,
  });
}
