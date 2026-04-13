import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Volkern CRM configuration
const VOLKERN_API_URL = process.env.VOLKERN_API_URL || "https://volkern.app/api";
const VOLKERN_API_KEY = process.env.VOLKERN_API_KEY || "";

async function createVolkernContact(payload: Record<string, unknown>) {
  if (!VOLKERN_API_KEY) {
    console.log("[Volkern] No VOLKERN_API_KEY configured. Contact saved locally only.");
    return { success: false, source: "local_only" };
  }

  try {
    const response = await fetch(`${VOLKERN_API_URL}/contacts`, {
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
    console.log("[Volkern] Contact created successfully:", data);
    return { success: true, source: "volkern", data };
  } catch (error) {
    console.error("[Volkern] Error creating contact:", error);
    return { success: false, source: "error", error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact } = body;

    // Validate required fields
    if (!contact?.nombre || !contact?.email || !contact?.mensaje) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, email, mensaje" },
        { status: 400 }
      );
    }

    // ---- 1. Save to local database ----
    const dbMessage = await db.contactMessage.create({
      data: {
        nombre: contact.nombre,
        email: contact.email,
        whatsapp: contact.whatsapp || null,
        asunto: contact.asunto || null,
        mensaje: contact.mensaje,
      },
    });

    // ---- 2. Forward to Volkern CRM ----
    const volkernContactPayload = {
      nombre: contact.nombre,
      email: contact.email,
      telefono: contact.whatsapp || null,
      tipo: "person" as const,
      notas: [
        contact.asunto ? `[${contact.asunto}]` : null,
        contact.mensaje,
        "",
        "--- Mensaje enviado desde landing page Dimension Energy ---",
      ]
        .filter(Boolean)
        .join("\n"),
      tags: ["dimension-energy", "contacto-web"],
    };

    const volkernResult = await createVolkernContact(volkernContactPayload);

    // Update CRM status in local DB
    await db.contactMessage.update({
      where: { id: dbMessage.id },
      data: {
        crmSent: volkernResult.success,
        crmResponse: JSON.stringify(volkernResult),
      },
    });

    return NextResponse.json({
      success: true,
      localId: dbMessage.id,
      volkernResult,
      message: volkernResult.success
        ? "Mensaje enviado correctamente a Volkern CRM"
        : "Mensaje guardado localmente (CRM no configurado)",
    });
  } catch (error) {
    console.error("[API] Error in submit-contact:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
