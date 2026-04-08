import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAnalysisEmail, isEmailConfigured } from "@/lib/email";

// Volkern CRM configuration
const VOLKERN_API_URL = process.env.VOLKERN_API_URL || "https://volkern.app/api";
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY || "";

async function createVolkernLead(payload: Record<string, unknown>) {
  if (!VOLKERN_API_KEY) {
    console.log("[Volkern] No VOLKERN_API_KEY configured. Data saved locally only.");
    return { success: false, source: "local_only" };
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Volkern API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("[Volkern] Lead created successfully:", data);
    return { success: true, source: "volkern", data };
  } catch (error) {
    console.error("[Volkern] Error creating lead:", error);
    return { success: false, source: "error", error: String(error) };
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
    if (!lead?.nombre || !lead?.email || !lead?.whatsapp) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, email, whatsapp" },
        { status: 400 }
      );
    }

    // ---- 1. Save to local database ----
    const dbLead = await db.lead.create({
      data: {
        nombre: lead.nombre,
        email: lead.email,
        whatsapp: lead.whatsapp,
        cups: invoice?.cups || null,
        direccion: invoice?.direccion || null,
        comercializadora: invoice?.comercializadora || null,
        tarifa: invoice?.tarifa || null,
        potenciaP1: invoice?.potencia_p1 || null,
        potenciaP2: invoice?.potencia_p2 || null,
        consumoMensual: invoice?.consumo_mensual || null,
        importeTotal: invoice?.importe_total || null,
        fechaFactura: invoice?.fecha_factura || null,
        periodoFacturacion: invoice?.periodo_facturacion || null,
        fileName: invoice?.file_name || null,
        fileType: invoice?.file_type || null,
        fileSize: invoice?.file_size || null,
        fileBase64: invoice?.file_base64 || null,
        invoiceContext: context || null,
      },
    });

    // ---- 2. Forward to Volkern CRM ----
    const volkernLeadPayload = {
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.whatsapp,
      canal: "web",
      estado: "nuevo",
      etiquetas: ["dimension-energy", "factura-luz", "gbp-energia"],
      contextoProyecto: context || null,
    };

    const volkernResult = await createVolkernLead(volkernLeadPayload);

    // If lead was created in Volkern, add invoice details as a note
    if (volkernResult.success && volkernResult.data?.id) {
      await createVolkernNote(
        volkernResult.data.id,
        context || "Lead capturado desde landing page de Dimension Energy."
      );
    }

    // Update CRM status in local DB
    await db.lead.update({
      where: { id: dbLead.id },
      data: {
        crmSent: volkernResult.success,
        crmResponse: JSON.stringify(volkernResult),
      },
    });

    // ---- 3. Send analysis email ----
    let analysisEmailResult = { success: false, error: "Email not configured" };
    if (isEmailConfigured()) {
      analysisEmailResult = await sendAnalysisEmail({
        leadId: dbLead.id,
        nombre: lead.nombre,
        email: lead.email,
        whatsapp: lead.whatsapp,
        cups: invoice?.cups || undefined,
        direccion: invoice?.direccion || undefined,
        comercializadora: invoice?.comercializadora || undefined,
        tarifa: invoice?.tarifa || undefined,
        potenciaP1: invoice?.potencia_p1 || undefined,
        potenciaP2: invoice?.potencia_p2 || undefined,
        consumoMensual: invoice?.consumo_mensual || undefined,
        importeTotal: invoice?.importe_total || undefined,
        fechaFactura: invoice?.fecha_factura || undefined,
        periodoFacturacion: invoice?.periodo_facturacion || undefined,
        fileName: invoice?.file_name || undefined,
        createdAt: dbLead.createdAt.toISOString(),
      });

      if (analysisEmailResult.success) {
        await db.lead.update({
          where: { id: dbLead.id },
          data: { analysisEmailSent: true },
        });
      }
    } else {
      console.log("[Email] SMTP not configured. Skipping analysis email.");
      console.log("[Email] To enable: Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
    }

    return NextResponse.json({
      success: true,
      localId: dbLead.id,
      volkernResult,
      analysisEmail: analysisEmailResult,
      message: `Lead procesado correctamente${analysisEmailResult.success ? '. Email de análisis enviado.' : ''}`,
    });
  } catch (error) {
    console.error("[API] Error in submit-lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
