import { NextRequest, NextResponse } from "next/server";

const EXTRACTION_PROMPT = `Eres un experto en extracción de datos de facturas eléctricas españolas. Analiza esta imagen/documento de factura de electricidad y extrae la siguiente información.

Responde ÚNICAMENTE en formato JSON válido con estos campos (usa null si no encuentras el dato):
{
  "titular": "nombre completo del titular de la factura",
  "cups": "código CUPS (empezará por ES y 20-22 caracteres)",
  "direccion": "dirección de suministro completa",
  "comercializadora": "nombre de la comercializadora actual",
  "tarifa": "tipo de tarifa (ej: 2.0TD, 3.0TD, 6.1TD, etc.)",
  "potencia_p1": "potencia contratada en periodo P1 con unidad (ej: 4.6 kW)",
  "potencia_p2": "potencia contratada en periodo P2 con unidad (ej: 4.6 kW)",
  "consumo_mensual": "consumo total en kWh (solo el número)",
  "importe_total": "importe total de la factura con símbolo € (ej: 67.43 €)",
  "fecha_factura": "fecha de la factura en formato DD/MM/YYYY",
  "periodo_facturacion": "periodo de facturación (ej: 30 días, del 01/03 al 31/03)"
}

Reglas:
- Extrae SOLO la información visible en la factura
- Si un dato no se puede leer claramente, pon null
- El CUPS siempre empieza por ES
- Mantén los formatos originales cuando sea posible
- Responde SOLO con el JSON, sin texto adicional ni markdown`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileBase64, fileName } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { error: "No se proporcionó archivo de factura" },
        { status: 400 }
      );
    }

    // Determine MIME type from file name
    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    if (ext === "pdf") mimeType = "application/pdf";
    if (ext === "webp") mimeType = "image/webp";

    // Provider priority: Gemini > z-ai SDK (sandbox only)
    const geminiKey = process.env.GEMINI_API_KEY;
    let content: string;

    if (geminiKey) {
      content = await callGemini(geminiKey, fileBase64, mimeType);
    } else {
      // Fallback to z-ai-web-dev-sdk (only works in sandbox)
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      const imageUrl = `data:${mimeType};base64,${fileBase64}`;

      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        thinking: { type: "disabled" },
      });

      content = response.choices[0]?.message?.content;
    }

    if (!content) {
      return NextResponse.json(
        { error: "No se pudo extraer información de la factura" },
        { status: 500 }
      );
    }

    // Parse the JSON from the response (handle potential markdown wrapping)
    let extractedData;
    try {
      extractedData = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1].trim());
      } else {
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch) {
          extractedData = JSON.parse(objMatch[0]);
        } else {
          throw new Error("Could not parse extraction result");
        }
      }
    }

    console.log("[VLM] Invoice extracted successfully:", {
      titular: extractedData.titular,
      cups: extractedData.cups,
      comercializadora: extractedData.comercializadora,
    });

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("[API] Error in extract-invoice:", error);
    return NextResponse.json(
      { error: "Error al procesar la factura", details: String(error) },
      { status: 500 }
    );
  }
}

// Google Gemini 1.5 Flash API call
async function callGemini(
  apiKey: string,
  fileBase64: string,
  mimeType: string
): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: fileBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1500,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const messageContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!messageContent) {
    const blockReason = data.candidates?.[0]?.finishReason;
    throw new Error(
      `Respuesta vacía del modelo${blockReason ? ` (finishReason: ${blockReason})` : ""}`
    );
  }

  return messageContent;
}
