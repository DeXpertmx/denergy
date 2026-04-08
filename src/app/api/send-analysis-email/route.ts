import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAnalysisEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Se requiere leadId" },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "SMTP no configurado. Requiere SMTP_HOST, SMTP_USER, SMTP_PASS en .env" },
        { status: 500 }
      );
    }

    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    if (lead.analysisEmailSent) {
      return NextResponse.json({
        success: true,
        message: "Email de análisis ya fue enviado anteriormente",
        sentAt: lead.createdAt,
      });
    }

    const result = await sendAnalysisEmail({
      leadId: lead.id,
      nombre: lead.nombre,
      email: lead.email,
      whatsapp: lead.whatsapp,
      cups: lead.cups || undefined,
      direccion: lead.direccion || undefined,
      comercializadora: lead.comercializadora || undefined,
      tarifa: lead.tarifa || undefined,
      potenciaP1: lead.potenciaP1 || undefined,
      potenciaP2: lead.potenciaP2 || undefined,
      consumoMensual: lead.consumoMensual || undefined,
      importeTotal: lead.importeTotal || undefined,
      fechaFactura: lead.fechaFactura || undefined,
      periodoFacturacion: lead.periodoFacturacion || undefined,
      fileName: lead.fileName || undefined,
      createdAt: lead.createdAt.toISOString(),
    });

    if (result.success) {
      await db.lead.update({
        where: { id: leadId },
        data: { analysisEmailSent: true },
      });
    }

    return NextResponse.json({
      success: result.success,
      leadId,
      nombre: lead.nombre,
      error: result.error,
    });
  } catch (error) {
    console.error("[API] Error in send-analysis-email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
