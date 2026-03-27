import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateUIScreenshot() {
  const prompt = `
    A high-quality, professional UI/UX design screenshot of a web application called "DeepGuard". 
    The theme is dark and futuristic (cybersecurity/forensic style).
    Background: Dark charcoal/black with a subtle glowing grid pattern.
    Accents: Vibrant orange and neon green.
    Layout: 
    - Left side: A "Digital Integrity Analysis" header with a large, dashed-border drag-and-drop upload area.
    - Right side: A forensic results panel showing a "Deepfake Detected" alert with a 92% confidence score.
    - Sidebar: A "Recent Scans" history list with small thumbnails of videos and images.
    - Icons: Shield, Zap, Activity, and Alert icons in orange.
    - Typography: Bold, uppercase, technical sans-serif fonts.
    The overall look is clean, high-tech, and professional, similar to a high-end security dashboard.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}
