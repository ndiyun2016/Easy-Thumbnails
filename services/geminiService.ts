import { GoogleGenAI } from "@google/genai";
import { ColorTheme } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize Gemini client
// Note: We create a new instance per request to ensure we pick up the key if it changes (though usually env vars are static)
const getAiClient = () => new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateThumbnail = async (
  imageBase64: string,
  title: string,
  theme: ColorTheme
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = getAiClient();
  const model = "gemini-2.5-flash-image";

  // Clean the base64 string if it has the prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  const prompt = `
    Create a high-quality, 16:9 YouTube video thumbnail.
    
    Composition Instructions:
    1. Use the provided input image as the creator's headshot.
    2. Place the creator in the background or side, applied with a Gaussian blur effect to separate them from the text, but keep them recognizable.
    3. The overall style should be "Neon Cyberpunk" or "High Energy Youtuber".
    4. Text Overlay: Superimpose the text "${title}" in the foreground.
       - Font: Large, Bold, Sans-serif.
       - Style: Neon glowing text effect.
       - Readability: Extremely high. The text must be the focal point.
    5. Color Palette: Use a gradient based on ${theme}.
    6. Ensure the aspect ratio is strictly 16:9.
    
    Make it look professional, viral, and click-worthy.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", // Assuming PNG or standard image format, Gemini is flexible
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: gemini-2.5-flash-image does not support 'responseMimeType' or 'responseSchema'
      // We rely on the model returning an image part.
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response candidates from Gemini.");
    }

    const content = candidates[0].content;
    if (!content) {
      throw new Error("No content found in the first candidate from Gemini.");
    }

    const parts = content.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No parts found in the content from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image found in response (sometimes it might just talk back)
    throw new Error("The AI generated text instead of an image. Please try again with a clearer photo.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate thumbnail.");
  }
};