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

  // Phising / Domain Script Inspector Endpoint (similar to Google Rich Results / Page Source Inspector)
  app.post("/api/check-domain", async (req, res) => {
    const { url, userAgentMode } = req.body;

    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "URL domain wajib diisi" });
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    // Determine User Agent
    let selectedUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    if (userAgentMode === "googlebot") {
      selectedUA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    } else if (userAgentMode === "mobile") {
      selectedUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
    }

    const startTime = Date.now();

    // Helper fetch with timeout
    const fetchWithTimeout = async (fetchUrl: string, timeoutMs = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            "User-Agent": selectedUA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      let response: Response;
      let finalUsedUrl = targetUrl;

      try {
        response = await fetchWithTimeout(targetUrl, 15000);
      } catch (firstErr: any) {
        // If HTTPS fails due to SSL cert or connection, try HTTP as fallback
        if (targetUrl.startsWith("https://")) {
          const httpFallback = targetUrl.replace("https://", "http://");
          try {
            response = await fetchWithTimeout(httpFallback, 15000);
            finalUsedUrl = httpFallback;
          } catch {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }

      const responseTimeMs = Date.now() - startTime;
      const html = await response.text();
      const status = response.status;
      const statusText = response.statusText;
      const finalUrl = response.url || finalUsedUrl;

      // Extract basic header dictionary
      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key] = val;
      });

      res.json({
        success: true,
        targetUrl,
        finalUrl,
        status,
        statusText,
        responseTimeMs,
        contentType: response.headers.get("content-type") || "text/html",
        contentLength: html.length,
        headers: headersObj,
        html,
        isHttps: finalUrl.startsWith("https://"),
      });
    } catch (err: any) {
      console.error("Domain fetch error:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({
        success: false,
        targetUrl,
        error: isTimeout 
          ? "Request Timeout (server tujuan tidak merespons dalam 15 detik)" 
          : (err.message || "Gagal menghubungi domain tujuan. Pastikan nama domain aktif dan dapat diakses."),
      });
    }
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
