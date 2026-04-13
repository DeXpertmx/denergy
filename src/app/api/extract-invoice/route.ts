import { NextRequest, NextResponse } from "next/server";

const EXTRACTION_PROMPT = `Analiza esta factura eléctrica española y extrae los datos. 
Responde exclusivamente con un objeto JSON válido con estas claves:
{
  "titular": "Nombre",
  "cups": "ES...",
  "direccion": "Dirección",
  "comercializadoraActual": "Empresa",
  "tarifaActual": "Tarifa",
  "potenciaP1": "kW",
  "potenciaP2": "kW",
  "consumoMensual": "kWh",
  "importeTotal": "€",
  "fechaFactura": "DD/MM/YYYY",
  "periodoFacturacion": "Fechas"
}`;

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();

    if (!fileBase64) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf";
    const mimeType = isPdf ? "application/pdf" : `image/${ext === "png" ? "png" : "jpeg"}`;

    // Clean base64
    const base64Content = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Configuración incompleta", details: "Falta OPENROUTER_API_KEY en Vercel" }, { status: 500 });
    }

    // Build the content array based on file type
    const messageContent: any[] = [{ type: "text", text: EXTRACTION_PROMPT }];

    if (isPdf) {
      // Use "file" type for PDFs as per OpenRouter docs
      messageContent.push({
        type: "file",
        file: {
          file_data: dataUrl
        }
      });
    } else {
      // Use "image_url" for images
      messageContent.push({
        type: "image_url",
        image_url: {
          url: dataUrl
        }
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dimension-energy.app",
        "X-Title": "Dimension Energy Extractor",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent JSON
      }),
    });

    const rawResponse = await response.text();
    let result;

    try {
      result = JSON.parse(rawResponse);
    } catch (e) {
      console.error("OpenRouter returned non-JSON:", rawResponse);
      return NextResponse.json({ 
        error: "Error del proveedor de IA", 
        details: "El servidor de IA devolvió una respuesta inválida (posiblemente saturación o error 503)." 
      }, { status: 502 });
    }

    if (!response.ok) {
      console.error("OpenRouter Error Details:", result);
      const errorMsg = result.error?.message || result.error || "Error desconocido en el proveedor";
      return NextResponse.json({ 
        error: "Error en la extracción", 
        details: errorMsg 
      }, { status: response.status });
    }

    const content = result.choices?.[0]?.message?.content || "";
    
    // Extract JSON from markdown if necessary
    let cleanedContent = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    try {
      const parsedData = JSON.parse(cleanedContent);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", content);
      return NextResponse.json({ 
        error: "Error de formato", 
        details: "La IA no generó un JSON válido. Reintenta con una imagen más clara." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Critical extraction error:", error);
    return NextResponse.json({ 
      error: "Error interno", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}
