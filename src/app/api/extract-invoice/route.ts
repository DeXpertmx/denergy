import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
2. No incluyas texto explicativo, solo el objeto JSON.`;

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();

    if (!fileBase64) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    // Identificar el MIME type para la API de Google
    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    let mimeType = "image/jpeg";
    if (ext === "pdf") mimeType = "application/pdf";
    if (ext === "png") mimeType = "image/png";
    if (ext === "webp") mimeType = "image/webp";

    // Llamada directa a la API de Gemini
    const content = await callGeminiDirect(fileBase64, mimeType);

    return NextResponse.json({
      success: true,
      data: JSON.parse(content) // Gemini 1.5 Flash devolverá JSON válido
    });
  } catch (error) {
    console.error("Error en extracción:", error);
    return NextResponse.json({ error: "Error al procesar", details: String(error) }, { status: 500 });
  }
}

async function callGeminiDirect(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("Falta GOOGLE_AI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Usamos específicamente gemini-1.5-flash
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1, // Baja para mayor exactitud en datos numéricos
      responseMimeType: "application/json", // Característica nativa de Gemini 1.5
    }
  });

  // Limpieza de prefijos base64 (data:image/jpeg;base64,...)
  const base64Content = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Content,
        mimeType: mimeType
      }
    },
    EXTRACTION_PROMPT,
  ]);

  const response = await result.response;
  return response.text();
}
