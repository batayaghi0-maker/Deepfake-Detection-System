import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  isFake: boolean;
  confidence: number;
  reasoning: string;
  type: 'ai_generated' | 'manually_edited' | 'authentic' | 'unknown';
  details: {
    visualInconsistencies: string[];
    audioInconsistencies: string[];
    metadataAnalysis: string;
  };
}

export async function analyzeMedia(file: File): Promise<AnalysisResult> {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type;
  const isImage = mimeType.startsWith('image');
  const isVideo = mimeType.startsWith('video');
  const isAudio = mimeType.startsWith('audio');

  const prompt = `
    Analyze this ${isVideo ? 'video' : isAudio ? 'audio' : 'image'} for signs of Deepfake, AI generation, or manual manipulation.
    
    ${isImage ? `
    For IMAGES, specifically look for:
    1. AI Generation (GAN/Diffusion): Unnatural textures, warped backgrounds, inconsistent shadows, "hallucinated" details (e.g., extra fingers, weird ear shapes), or overly smooth skin.
    2. Manual Editing (Photoshop): Clone stamp artifacts, inconsistent lighting on subjects, jagged edges from cutting/pasting, or metadata indicating software usage.
    ` : ''}
    
    ${isVideo ? `
    For VIDEOS, look for:
    1. Visual artifacts (unnatural blinking, skin texture, lighting inconsistencies between face and body).
    2. Temporal inconsistencies (jittering, flickering around the face edges).
    ` : ''}
    
    ${isAudio ? `
    For AUDIO, look for:
    1. Robotic tone, unnatural pauses, background noise mismatch, or frequency artifacts.
    ` : ''}
    
    Return the result in strict JSON format:
    {
      "isFake": boolean,
      "confidence": number (0-100),
      "type": "ai_generated" | "manually_edited" | "authentic" | "unknown",
      "reasoning": "string summary",
      "details": {
        "visualInconsistencies": ["list", "of", "findings"],
        "audioInconsistencies": ["list", "of", "findings"],
        "metadataAnalysis": "string"
      }
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data.split(',')[1], mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze media. Please try again.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
