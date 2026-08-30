import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization for Google GenAI client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `Anda adalah DON ISKO AI INTELLIGENCE — asisten AI mutakhir bertenaga Gemini mutakhir untuk HS GROUP 711. 
Karakteristik & Kemampuan Anda:
1. Berfungsi penuh seperti ChatGPT dan Ask Gemini: Anda mampu menjawab SEGALA PERTANYAAN umum, sains, teknologi, matematika, coding, penerjemahan bahasa, pembuatan konten kreatif, dan analisis mendalam.
2. Memiliki keahlian khusus dalam operasional Customer Service (CS) & Kasir HS GROUP 711: SOP LiveChat, respon komplain member yang ramah/tegas, analisa indikasi fraud & bonus hunter, kalkulasi turnover (TO), aturan pasaran togel, odds parlay, pola game slot, dan administrasi serah terima shift.
3. Selalu menggunakan format teks yang rapi, profesional, mudah dibaca (gunakan poin-poin/bullet, format tebal, dan blok kode jika diperlukan).
4. Gunakan Bahasa Indonesia yang sopan, ramah, jelas, dan solutif.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", aiReady: Boolean(process.env.GEMINI_API_KEY) });
  });

  // Streaming Chat Completion Endpoint (SSE - Server Sent Events)
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemPrompt, modelName } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Pesan tidak boleh kosong" });
      return;
    }

    const ai = getGenAI();

    // Set headers for SSE Streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    if (!ai) {
      // Fallback if API key is not yet set in environment
      const fallbackReply = `⚠️ **Pemberitahuan Sistem AI Studio:**
Kunci API \`GEMINI_API_KEY\` belum terdeteksi pada environment server. 

Namun DON ISKO AI tetap siap beroperasi. Silakan hubungkan API Key melalui menu Settings > Secrets bila diperlukan.
Pertanyaan Anda: "${messages[messages.length - 1]?.content || ''}"`;

      res.write(`data: ${JSON.stringify({ chunk: fallbackReply, done: true })}\n\n`);
      res.end();
      return;
    }

    try {
      const selectedModel = modelName || "gemini-3.7-flash";

      // Transform messages into contents for @google/genai
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const fullSystemInstruction = systemPrompt 
        ? `${SYSTEM_INSTRUCTION}\n\nInstruksi Khusus Mode: ${systemPrompt}`
        : SYSTEM_INSTRUCTION;

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage = error?.message || "Terjadi kesalahan saat memproses permintaan AI.";
      res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
      res.end();
    }
  });

  // Standard Non-streaming Generate Endpoint
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt, systemPrompt, modelName } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.json({
        text: `Kunci API GEMINI_API_KEY belum dikonfigurasi. Respon lokal: Terima kasih atas pertanyaan "${prompt}".`,
      });
      return;
    }

    try {
      const selectedModel = modelName || "gemini-3.7-flash";
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt ? `${SYSTEM_INSTRUCTION}\n${systemPrompt}` : SYSTEM_INSTRUCTION,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini Generate Error:", error);
      res.status(500).json({ error: error?.message || "Gagal menghasilkan jawaban." });
    }
  });

  // Vite Middleware for Development / Static Serve for Production
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
    console.log(`🚀 HS GROUP 711 Server running on http://localhost:${PORT}`);
  });
}

startServer();
