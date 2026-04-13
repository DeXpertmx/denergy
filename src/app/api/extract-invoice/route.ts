import { NextRequest, NextResponse } from "next/server";
import ZAI, { VisionMessage } from 'z-ai-web-dev-sdk';

export const maxDuration = 60; // Allow 1 minute for complex thinking extraction

const EXTRACTION_PROMPT = `Analiza esta factura eléctrica española y extrae los datos técnicos. 
Responde exclusivamente con un objeto JSON válido (sin explicaciones) con estas claves:
{
  "titular": "Nombre del titular",
  "cups": "Código ES...",
  "direccion": "Dirección completa",
  "comercializadoraActual": "Empresa",
  "tarifaActual": "Ej: 2.0TD",
  "potenciaP1": "P1 en kW",
  "potenciaP2": "P2 en kW",
  "consumoMensual": "kWh total",
  "importeTotal": "€ total",
  "fechaFactura": "DD/MM/YYYY",
  "periodoFacturacion": "Rango de fechas"
}`;

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();
    if (!fileBase64) return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });

    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf";
    const mimeType = isPdf ? "application/pdf" : `image/${ext === "png" ? "png" : "jpeg"}`;
    const base64Content = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    // 1. Initialize Z-AI SDK (Skill Logic)
    const zai = await ZAI.create();

    // 2. Prepare Messages following VLM Skill patterns
    const messages: VisionMessage[] = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Eres un experto en extracción de datos de facturas eléctricas. Devuelve solo JSON válido.' }
        ]
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          { 
            // Use file_url for PDFs and image_url for images as per VLM skill
            type: isPdf ? 'file_url' : 'image_url', 
            [isPdf ? 'file_url' : 'image_url']: { url: dataUrl } 
          }
        ]
      }
    ];

    // 3. Execute with Thinking mode enabled (High Fidelity extraction)
    // We attempt to use the SDK's native vision model
    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v', // This is the recommended model in your VLM skills
      messages,
      thinking: { type: 'enabled' } // Enabled for complex structural analysis
    });

    const content = response.choices?.[0]?.message?.content || "";
    if (!content) {
      throw new Error("El modelo de la Skill devolvió una respuesta vacía.");
    }

    // 4. Extract and Clean JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const cleanedContent = jsonMatch ? jsonMatch[0] : content;
    
    try {
      const parsedData = JSON.parse(cleanedContent);
      return NextResponse.json({ 
        success: true, 
        data: parsedData,
        sourceModel: 'z-ai-vlm-skill'
      });
    } catch (parseError) {
      console.error("JSON Parse Error on Skill Output:", content);
      return NextResponse.json({ 
        error: "Error de formato en la Skill", 
        details: "El modelo generó texto en lugar de JSON.",
        raw: content
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error("Critical Skill API error:", error);
    
    // Fallback info for the user
    return NextResponse.json({ 
      error: "Error en la Skill de extracción", 
      details: error.message || "La Skill Z-AI no respondió correctamente."
    }, { status: 500 });
  }
}
