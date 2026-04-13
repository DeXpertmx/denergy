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

const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "openrouter/free"
];

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, fileName } = await request.json();

    if (!fileBase64) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Configuración incompleta", details: "Falta OPENROUTER_API_KEY" }, { status: 500 });
    }

    const ext = fileName?.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf";
    const mimeType = isPdf ? "application/pdf" : `image/${ext === "png" ? "png" : "jpeg"}`;
    const base64Content = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    // Prepare message content once
    const messageContent: any[] = [{ type: "text", text: EXTRACTION_PROMPT }];
    if (isPdf) {
      messageContent.push({ type: "file", file: { file_data: dataUrl } });
    } else {
      messageContent.push({ type: "image_url", image_url: { url: dataUrl } });
    }

    let lastError = null;
    
    // MODEL ROTATION LOOP
    for (const modelId of FREE_MODELS) {
      try {
        console.log(`Attempting extraction with model: ${modelId}`);
        
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
            messages: [
              {
                role: "user",
                content: messageContent
              }
            ],
            temperature: 0.1,
          }),
          // 25 second timeout per attempt to stay within Vercel execution limits
          signal: AbortSignal.timeout(25000), 
        });

        const rawResponse = await response.text();
        let result;
        
        try {
          result = JSON.parse(rawResponse);
        } catch (e) {
          console.warn(`Non-JSON response from ${modelId}. Status: ${response.status}`);
          lastError = `Provider ${modelId} returned invalid response.`;
          continue; // Try next model
        }

        if (!response.ok) {
          const errorMsg = result.error?.message || result.error || "Error desconocido";
          console.warn(`Model ${modelId} failed with ${response.status}: ${errorMsg}`);
          
          // Continue to next model on ALMOST ANY error that isn't Authorisation (401)
          // This covers 429 (Rate Limit), 404 (No endpoints), 500+ (Server error)
          if (response.status !== 401) {
            lastError = `[${modelId}] ${errorMsg}`;
            continue;
          }
          
          // For Authorisation errors, stop and report (likely API Key issue)
          return NextResponse.json({ 
            error: "Error de autenticación", 
            details: "La API Key de OpenRouter parece inválida o ha expirado." 
          }, { status: 401 });
        }

        const content = result.choices?.[0]?.message?.content || "";
        if (!content) {
          console.warn(`Model ${modelId} returned empty content.`);
          continue;
        }

        // Extract JSON
        let cleanedContent = content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanedContent = jsonMatch[0];

        try {
          const parsedData = JSON.parse(cleanedContent);
          return NextResponse.json({ 
            success: true, 
            data: parsedData,
            sourceModel: modelId 
          });
        } catch (e) {
          console.error(`Model ${modelId} output parsing failed. Content:`, content);
          lastError = `Error de formato en la respuesta de ${modelId}.`;
          continue;
        }

      } catch (innerError: any) {
        console.error(`Error during attempt with ${modelId}:`, innerError);
        lastError = innerError.message;
        continue;
      }
    }

    // If we exhausted all models
    return NextResponse.json({ 
      error: "No se pudo realizar la extracción", 
      details: `Todos los modelos intentados fallaron o están saturados. Último error: ${lastError}` 
    }, { status: 503 });

  } catch (error: any) {
    console.error("Critical API error:", error);
    return NextResponse.json({ 
      error: "Error interno", 
      details: error.message 
    }, { status: 500 });
  }
}
