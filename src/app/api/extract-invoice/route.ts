import { NextRequest, NextResponse } from "next/server";

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

const TOP_FREE_MODELS = [
  "google/gemini-2.0-flash-001:free",
  "qwen/qwen-2-vl-72b-instruct:free",
  "openrouter/free"
];

async function attemptExtraction(modelId: string, apiKey: string, messageContent: any[]) {
  const controller = new AbortController();
  // 10 second timeout per model for racing
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dimension-energy.app",
        "X-Title": "Dimension Energy Extractor",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: messageContent }],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`[${modelId}] ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    if (!content) throw new Error(`[${modelId}] Empty response content.`);

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const cleanedContent = jsonMatch ? jsonMatch[0] : content;
    const parsedData = JSON.parse(cleanedContent);

    return { 
      success: true, 
      data: parsedData,
      sourceModel: modelId 
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`Extraction failed for ${modelId}:`, error.message);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();
    if (!fileBase64) return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });

    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf";
    const mimeType = isPdf ? "application/pdf" : `image/${ext === "png" ? "png" : "jpeg"}`;
    const base64Content = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    const messageContent: any[] = [{ type: "text", text: EXTRACTION_PROMPT }];
    if (isPdf) {
      messageContent.push({ type: "file", file: { file_data: dataUrl } });
    } else {
      messageContent.push({ type: "image_url", image_url: { url: dataUrl } });
    }

    // RACE CONDITION: Try all top models in parallel
    // Promise.any returns the first successful one
    try {
      const winner = await Promise.any(
        TOP_FREE_MODELS.map(modelId => attemptExtraction(modelId, apiKey, messageContent))
      );
      
      return NextResponse.json(winner);
    } catch (aggregateError: any) {
      console.error("All models failed the race:", aggregateError);
      return NextResponse.json({ 
        error: "Saturación total del servicio", 
        details: "Todos los modelos gratuitos están saturados o han expirado. Por favor, reintenta en un momento." 
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error("Critical API error:", error);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}
