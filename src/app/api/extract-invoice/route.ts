import { NextRequest, NextResponse } from "next/server";

// Configuración del esquema de respuesta para forzar JSON puro
const EXTRACTION_PROMPT = `Analiza detalladamente esta factura eléctrica española y extrae los datos técnicos.
Debes responder exclusivamente en formato JSON válido.

Campos requeridos:
{
  "titular": "Nombre completo",
  "cups": "Código ES... (20-22 caracteres)",
  "direccion": "Dirección de suministro",
  "comercializadora": "Nombre de la empresa",
  "tarifa": "Ej: 2.0TD, 3.0TD",
  "potencia_p1": "Valor en kW",
  "potencia_p2": "Valor en kW",
  "consumo_mensual": "Número total de kWh",
  "importe_total": "Valor con símbolo €",
  "fecha_factura": "DD/MM/YYYY",
  "periodo_facturacion": "Rango de fechas o días"
}

Reglas:
1. Si un dato no es visible, usa null.
2. No incluyas texto explicativo, solo el objeto JSON.
3. Asegúrate de que el JSON sea válido y no tenga caracteres de control extraños.`;

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();

    if (!fileBase64) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    // Identificar el MIME type
    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    let mimeType = "image/jpeg";
    if (ext === "pdf") mimeType = "application/pdf";
    if (ext === "png") mimeType = "image/png";
    if (ext === "webp") mimeType = "image/webp";

    // Llamada a OpenRouter (usando Gemma 2 9B o similar que sea free)
    const content = await callOpenRouter(fileBase64, mimeType);

    // Intentar extraer el JSON si el modelo incluyó markdown
    let cleanedContent = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(cleanedContent)
    });
  } catch (error) {
    console.error("Error en extracción:", error);
    return NextResponse.json({ error: "Error al procesar", details: String(error) }, { status: 500 });
  }
}

async function callOpenRouter(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Falta OPENROUTER_API_KEY en las variables de entorno");

  // Limpieza de prefijos base64
  const base64Content = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://dimension-energy.app",
      "X-Title": "Dimension Energy Extractor",
    },
    body: JSON.stringify({
      model: "google/gemma-2-9b-it:free",
      messages: [
        {
          role: "system",
          content: "Eres un experto en extracción de datos de facturas eléctricas españolas. Responde siempre con JSON válido."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: EXTRACTION_PROMPT
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Content}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter Error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || "";
}

