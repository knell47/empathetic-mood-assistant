import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK with server-side API Key & metadata header for AI Studio
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// Main endpoint to analyze the mood of the text
app.post("/api/mood/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Please share how you are feeling." });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing. Please set it in your environment variables.",
      });
    }

    const systemInstruction = `You are an empathetic, compassionate, and attentive mood assistant.
Analyze the user's text and identify the predominant mood from one of these ten allowed categories:
Happy, Sad, Stressed, Anxious, Excited, Frustrated, Calm, Overwhelmed, Grateful, or Tired.

Your response must strictly conform to the expected JSON schema.
- 'mood' must be exactly one of: Happy, Sad, Stressed, Anxious, Excited, Frustrated, Calm, Overwhelmed, Grateful, Tired.
- 'emoji' must be a single, highly relevant emoji representing this specific mood.
- 'color' must be a soft hex color matching the vibe (such as a soft pastel color, e.g., '#F0FDF4' for Calm, '#EFF6FF' for Happy, '#FDF2F8' for Excitement, '#FEF2F2' for Sadness/Stress).
- 'insight' must be exactly one warm, compassionate, and non-judgmental sentence validating or matching what they feel.
- 'suggestion' must be one tiny, highly specific, easy-to-do physical or cognitive activity to self-care or celebrate that feeling right now in under 15 seconds (e.g. "Take one deep, slow inhalation for 4 seconds, hold for 4, and let it out", "Write down 3 things you can see right now", "Stretch your arms over your head and release your shoulders").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `The user says: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              description: "Must be exactly one of: Happy, Sad, Stressed, Anxious, Excited, Frustrated, Calm, Overwhelmed, Grateful, Tired",
            },
            emoji: {
              type: Type.STRING,
              description: "A single emoji representing the mood",
            },
            color: {
              type: Type.STRING,
              description: "A soft hex pastel color suitable for styling background cards representing this mood",
            },
            insight: {
              type: Type.STRING,
              description: "Exactly one warm sentence validating their mood",
            },
            suggestion: {
              type: Type.STRING,
              description: "One tiny, practical, micro self-care exercise or immediate action",
            },
          },
          required: ["mood", "emoji", "color", "insight", "suggestion"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }

    const result = JSON.parse(responseText.trim());
    return res.json(result);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: "Failed to understand your mood. Please try describing it slightly differently.",
      details: err?.message || String(err),
    });
  }
});

// Configure Vite or Static Files depending on Environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
