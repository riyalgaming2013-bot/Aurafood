import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  foodName: string;
  alternateMatches: string[];
  confidence: number;
  confidenceMessage: string;
  nutrition: {
    calories: string;
    protein: string;
    sugar: string;
    carbs: string;
    fat: string;
    fiber: string;
    sodium: string;
    servingSize: string;
  };
  safety: {
    safeToEatStatus: "likely okay" | "eat with caution" | "probably avoid" | "not enough confidence to decide";
    riskIndicator: "low" | "medium" | "high" | "unknown";
    explanation: string;
    visibleWarnings: string[];
  };
  health: {
    category: "healthy" | "neutral" | "unhealthy" | "unknown";
    explanation: string;
    practicalSuggestions: string[];
  };
  finalVerdict: {
    summary: string;
    actionableRecommendation: string;
  };
}

// Convert File to base64 to pass to Gemini
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve(null);
      }
    };
    reader.readAsDataURL(file);
  });
  
  const base64 = await base64EncodedDataPromise;
  if (!base64) throw new Error("Could not read file");

  return {
    inlineData: {
      data: base64 as string,
      mimeType: file.type,
    },
  };
}

export async function analyzeFoodImage(file: File): Promise<AnalysisResult> {
  const imagePart = await fileToGenerativePart(file);
  const prompt = `You are an expert food scientist and nutritionist. Analyze this image to identify the food.
Provide a detailed structured analysis focusing on:
1. Identifying what the food is, with alternatives and confidence level. (If unsure, state uncertainty clearly).
2. Estimating nutritional values per estimated serving size (use reasonable ranges if uncertain). Focus on Calories, Protein, Sugar, Carbs, Fat, Fiber, Sodium.
3. Assessing visual hygiene and freshness. Look for warning signs (mold, undercooked, spoilage). Provide a risk score (low/medium/high) and an explanation. Always include a disclaimer about visual limits.
4. Health guidance (healthy, neutral, unhealthy) with practical suggestions.
5. A final summary and actionable recommendation.

If the image is too blurry, dark, not food, or you are unsure, adjust your confidence and provide appropriate values.

Ensure the output is in JSON format that exactly matches this schema:
{
  "foodName": "string",
  "alternateMatches": ["string"],
  "confidence": number (0 to 100),
  "confidenceMessage": "string (Explain why you are confident or not)",
  "nutrition": {
    "calories": "string (e.g., '150-200 kcal')",
    "protein": "string",
    "sugar": "string",
    "carbs": "string",
    "fat": "string",
    "fiber": "string",
    "sodium": "string",
    "servingSize": "string"
  },
  "safety": {
    "safeToEatStatus": "likely okay" | "eat with caution" | "probably avoid" | "not enough confidence to decide",
    "riskIndicator": "low" | "medium" | "high" | "unknown",
    "explanation": "string (Explain hygiene/safety risks simply)",
    "visibleWarnings": ["string"]
  },
  "health": {
    "category": "healthy" | "neutral" | "unhealthy" | "unknown",
    "explanation": "string",
    "practicalSuggestions": ["string"]
  },
  "finalVerdict": {
    "summary": "string",
    "actionableRecommendation": "string"
  }
}

Do not include markdown backticks around the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            imagePart,
            { text: prompt }
          ],
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      let text = response.text.trim();
      if (text.startsWith("```json")) {
        text = text.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (text.startsWith("```")) {
        text = text.replace(/^```/, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(text) as AnalysisResult;
      return parsed;
    } else {
      throw new Error("No response generated.");
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
