"use server";

export async function processInvoiceAction(base64Image: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  // USAMOS EL NOMBRE EXACTO QUE TU TERMINAL CONFIRMÓ QUE TIENES ACTIVO
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analiza esta factura de estética. Extrae los productos y responde ÚNICAMENTE con un JSON válido: { \"lotes\": [ { \"producto_nombre\": \"string\", \"lote_numero\": \"string\", \"fecha_vencimiento\": \"YYYY-MM-DD\", \"cantidad\": number, \"precio_compra\": number } ] }. No incluyas markdown." },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ ERROR API:", data.error.message);
      return { error: data.error.message };
    }

    const content = data.candidates[0].content.parts[0].text;
    const cleanJson = content.replace(/```json|```/g, "").trim();

    console.log("✅ ¡ALELUYA! Datos recibidos:", cleanJson);
    return JSON.parse(cleanJson);

  } catch (error: any) {
    console.error("❌ FALLO:", error.message);
    return { error: "Error al procesar la factura." };
  }
}