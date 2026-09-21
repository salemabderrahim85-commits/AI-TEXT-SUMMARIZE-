import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

function countWords(str: string): number {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now()
  });
});

// Summarize endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const {
      text,
      format = "paragraph",
      length = "medium",
      tone = "neutral",
      language = "auto"
    } = req.body;

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return res.status(400).json({
        error: "Veuillez fournir un texte d'au moins 10 caractères à résumer."
      });
    }

    const originalWords = countWords(text);
    const originalChars = text.length;

    const ai = getAI();

    const formatInstructions: Record<string, string> = {
      paragraph: "Provide a cohesive, fluent narrative synthesis organized in clean paragraphs.",
      bullets: "Provide a structured breakdown primarily with bulleted key points and sub-points.",
      executive: "Provide an executive briefing format with a high-level overview, strategic takeaways, and actionable conclusions.",
      tldr: "Provide a sharp 1-2 sentence ultra-concise TL;DR followed by 3 rapid bullet points."
    };

    const lengthInstructions: Record<string, string> = {
      short: "Make it extremely compact (approx. 15-25% of original length). Keep only strictly vital facts.",
      medium: "Provide a balanced summary (approx. 30-40% of original length), retaining primary context and supporting arguments.",
      detailed: "Provide a thorough summary (approx. 50-60% of original length) preserving nuances, examples, and background logic."
    };

    const toneInstructions: Record<string, string> = {
      neutral: "Objective, unbiased, and factual tone.",
      professional: "Formal, corporate, polished business tone.",
      casual: "Accessible, conversational, simple and clear language.",
      academic: "Rigorous, analytical, and scholarly tone.",
      simple: "ELI5 style: easy-to-grasp vocabulary, clear explanations without jargon."
    };

    const langInstructions: Record<string, string> = {
      auto: "Detect the language of the source text and write the entire summary in that SAME language.",
      fr: "Write the summary entirely in French (Français).",
      en: "Write the summary entirely in English.",
      es: "Write the summary entirely in Spanish (Español).",
      de: "Write the summary entirely in German (Deutsch).",
      ar: "Write the summary entirely in Arabic (العربية)."
    };

    const systemInstruction = `You are a high-performance multilingual AI Text Summarizer.
Your mission is to analyze the user's input text and generate a high-retention, faithful, and precise summary.

Rules:
1. Never hallucinate facts or add external claims not supported by the source text.
2. Follow these formatting constraints:
   - Format requirement: ${formatInstructions[format] || formatInstructions.paragraph}
   - Length constraint: ${lengthInstructions[length] || lengthInstructions.medium}
   - Tone: ${toneInstructions[tone] || toneInstructions.neutral}
   - Target Language: ${langInstructions[language] || langInstructions.auto}
3. Generate a compelling short title for the content.
4. Extract 3 to 6 key takeaways/findings as concise bullet sentences.
5. Extract 3 to 6 topical keywords/tags.`;

    const prompt = `SOURCE TEXT TO SUMMARIZE:
"""
${text.slice(0, 50000)}
"""`;

    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "A short, descriptive title summarizing the subject of the text."
                },
                summary: {
                  type: Type.STRING,
                  description: "The generated summary formatted cleanly in markdown or plain paragraphs."
                },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key findings, insights, or takeaways."
                },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Core topic keywords or tags."
                }
              },
              required: ["title", "summary", "keyTakeaways", "keywords"]
            }
          }
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next candidate...`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Impossible de générer le résumé pour le moment.");
    }

    const rawOutput = response.text || "{}";
    let parsedData: {
      title?: string;
      summary?: string;
      keyTakeaways?: string[];
      keywords?: string[];
    } = {};

    try {
      parsedData = JSON.parse(rawOutput);
    } catch (parseErr) {
      parsedData = {
        title: "Résumé généré",
        summary: rawOutput,
        keyTakeaways: [],
        keywords: []
      };
    }

    const summaryText = parsedData.summary || "Aucun résumé généré.";
    const summaryWords = countWords(summaryText);
    const summaryChars = summaryText.length;
    
    // Calculate compression reduction
    const reductionPercent = originalWords > 0 
      ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100))
      : 0;

    // Average reading speed: 200 words per minute
    const origReadSeconds = Math.round((originalWords / 200) * 60);
    const summReadSeconds = Math.round((summaryWords / 200) * 60);
    const timeSavedSeconds = Math.max(0, origReadSeconds - summReadSeconds);

    return res.json({
      title: parsedData.title || "Résumé synthétique",
      summary: summaryText,
      keyTakeaways: parsedData.keyTakeaways || [],
      keywords: parsedData.keywords || [],
      stats: {
        originalWords,
        originalChars,
        summaryWords,
        summaryChars,
        reductionPercent,
        timeSavedSeconds
      },
      format,
      length,
      tone,
      language,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error("Error in /api/summarize:", error);
    return res.status(500).json({
      error: error?.message || "Une erreur est survenue lors de la génération du résumé."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Text Summarizer server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
