"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractInvoiceData(base64Image: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analiza esta imagen de una factura de productos estéticos. 
    Extrae los productos y devuélvelos estrictamente en este formato JSON:
    {
      "productos": [
        {
          "nombre": "Nombre comercial del producto",
          "marca": "Marca (Allergan, Galderma, etc.)",
          "lote": "Número de lote",
          "fecha_vencimiento": "YYYY-MM-DD",
          "cantidad": 10,
          "precio_unidad": 150.50
        }
      ]
    }
    Si no encuentras algún dato, pon null. No escribas nada más que el JSON.
  `;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
  ]);

  const response = await result.response;
  return JSON.parse(response.text());
}