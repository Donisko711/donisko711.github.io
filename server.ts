import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fastCheckBrands, HS_BRAND_DEFINITIONS } from "./src/utils/brandAnalysis";

dotenv.config();

// Bypass SSL certificate verification for domain security inspection (allows scanning domains with expired or self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

    let rawInput = url.trim().replace(/^["']|["']$/g, "");
    if (!rawInput) {
      res.status(400).json({ error: "URL domain tidak valid" });
      return;
    }

    let targetUrl = rawInput;

    // Google Search Console Googlebot Smartphone & Desktop User-Agents
    const googlebotMobileUA = "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.53 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

    let selectedUA = googlebotMobileUA;
    if (userAgentMode === "desktop") {
      selectedUA = desktopUA;
    } else if (userAgentMode === "mobile") {
      selectedUA = mobileUA;
    } else if (userAgentMode === "googlebot") {
      selectedUA = googlebotMobileUA;
    }

    const startTime = Date.now();

    // Helper fetch with timeout, Googlebot headers, and resilient SSL handling
    const fetchWithTimeout = async (fetchUrl: string, uaToUse = selectedUA, timeoutMs = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const isBot = uaToUse.includes("Googlebot");
        const headers: Record<string, string> = {
          "User-Agent": uaToUse,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Upgrade-Insecure-Requests": "1",
        };

        if (isBot) {
          headers["Referer"] = "https://www.google.com/";
          headers["From"] = "googlebot(at)googlebot.com";
          headers["X-Forwarded-For"] = "66.249.66.1";
          headers["X-Real-IP"] = "66.249.66.1";
          headers["CF-Connecting-IP"] = "66.249.66.1";
          headers["True-Client-IP"] = "66.249.66.1";
          headers["Sec-Fetch-Dest"] = "document";
          headers["Sec-Fetch-Mode"] = "navigate";
          headers["Sec-Fetch-Site"] = "cross-site";
        }

        const response = await fetch(fetchUrl, {
          method: "GET",
          headers,
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

    // Build list of candidate URLs for universal domain compatibility
    let candidateUrls: string[] = [];
    if (/^https?:\/\//i.test(rawInput)) {
      candidateUrls.push(rawInput);
      if (rawInput.startsWith("https://")) {
        candidateUrls.push(rawInput.replace(/^https:\/\//i, "http://"));
      }
    } else {
      candidateUrls.push(`https://${rawInput}`);
      candidateUrls.push(`http://${rawInput}`);
      try {
        const parsed = new URL(`https://${rawInput}`);
        if (!parsed.hostname.startsWith("www.") && parsed.hostname.split(".").length === 2) {
          candidateUrls.push(`https://www.${rawInput}`);
          candidateUrls.push(`http://www.${rawInput}`);
        }
      } catch {}
    }

    try {
      let response: Response | null = null;
      let finalUsedUrl = candidateUrls[0];
      let usedUA = selectedUA;
      let lastErr: any = null;

      // Try candidate URLs until one connects successfully
      for (const candidate of candidateUrls) {
        try {
          const res = await fetchWithTimeout(candidate, selectedUA, 15000);
          response = res;
          finalUsedUrl = candidate;
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!response) {
        throw lastErr || new Error("Gagal menghubungi domain tujuan pada semua protokol (HTTPS/HTTP).");
      }

      let html = await response.text();

      // If server blocks Googlebot (403, 401, 503, or 0 bytes), automatically fallback to Desktop Chrome
      if ((!html || html.length === 0 || response.status === 403 || response.status === 503) && selectedUA !== desktopUA) {
        try {
          const fallbackRes = await fetchWithTimeout(finalUsedUrl, desktopUA, 12000);
          const fallbackHtml = await fallbackRes.text();
          if (fallbackHtml && fallbackHtml.length > 0) {
            response = fallbackRes;
            html = fallbackHtml;
            usedUA = desktopUA;
          }
        } catch {
          // Keep original response if fallback fails
        }
      }

      const responseTimeMs = Date.now() - startTime;
      const status = response.status;
      const statusText = response.statusText;
      const finalUrl = response.url || finalUsedUrl;

      // Extract basic header dictionary
      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key] = val;
      });

      const checkBrands = (content: string): string[] => {
        if (!content) return [];
        const found = fastCheckBrands(content);
        const lower = content.toLowerCase();
        // Additional auxiliary probe terms
        const auxiliary = ['diana4d', 'dewi138', 'spinharta', 'mancingduit', 'metro4d', 'pay4d'];
        for (const aux of auxiliary) {
          if (lower.includes(aux) && !found.includes(aux.toUpperCase())) {
            found.push(aux.toUpperCase());
          }
        }
        return found;
      };

      const directBrands = checkBrands(html);

      // Check User-Agent based cloaking (Googlebot vs Desktop response comparison)
      let userAgentCloaking: {
        detected: boolean;
        botBrands: string[];
        desktopBrands: string[];
        botTitle: string;
        desktopTitle: string;
      } | null = null;

      try {
        if (selectedUA === googlebotMobileUA) {
          const deskRes = await fetchWithTimeout(finalUrl, desktopUA, 5000);
          if (deskRes.ok) {
            const deskHtml = await deskRes.text();
            const deskBrands = checkBrands(deskHtml);
            const botTitleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const deskTitleM = deskHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const botTitle = botTitleM ? botTitleM[1].trim() : "";
            const deskTitle = deskTitleM ? deskTitleM[1].trim() : "";

            const hasBotPhishing = directBrands.length > 0;
            const hasDeskPhishing = deskBrands.length > 0;

            if (hasBotPhishing !== hasDeskPhishing || (hasBotPhishing && Math.abs(html.length - deskHtml.length) > 1000)) {
              userAgentCloaking = {
                detected: true,
                botBrands: directBrands,
                desktopBrands: deskBrands,
                botTitle,
                desktopTitle: deskTitle
              };
            }
          }
        }
      } catch {}

      // =========================================================================
      // UNIVERSAL SITEMAP & GOOGLE CONSOLE CLOAKING DISCOVERY FOR ANY DOMAIN
      // =========================================================================
      let sitemapDiscovery: {
        found: boolean;
        sitemapUrl?: string;
        pages: Array<{ url: string; title: string; status: number; detectedBrands: string[] }>;
      } | null = null;

      let googleConsoleCloaking: {
        detected: boolean;
        originalTargetUrl: string;
        activeScriptUrl: string;
        cloakedPageTitle: string;
        detectedBrands: string[];
        decoyHtml: string;
      } | null = null;

      try {
        const u = new URL(finalUrl);
        const origin = u.origin;

        // Collect candidate sitemaps from robots.txt and standard endpoints
        const candidateSitemaps = new Set<string>();

        // 1. Probe robots.txt for custom Sitemap: declarations
        try {
          const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`, desktopUA, 3500);
          if (robotsRes.ok) {
            const robotsTxt = await robotsRes.text();
            const smMatches = robotsTxt.matchAll(/Sitemap:\s*(https?:\/\/[^\s\r\n]+)/gi);
            for (const sm of smMatches) {
              if (sm[1]) candidateSitemaps.add(sm[1].trim());
            }
          }
        } catch {}

        // 2. Standard sitemap paths
        candidateSitemaps.add(`${origin}/sitemap.xml`);
        candidateSitemaps.add(`${origin}/sitemap_index.xml`);
        candidateSitemaps.add(`${origin}/wp-sitemap.xml`);
        candidateSitemaps.add(`${origin}/sitemap.txt`);
        candidateSitemaps.add(`${origin}/page-sitemap.xml`);
        candidateSitemaps.add(`${origin}/post-sitemap.xml`);

        let foundSitemapUrl: string | undefined;
        let sitemapXmlContent = "";

        // Find the first working sitemap
        for (const sUrl of candidateSitemaps) {
          try {
            const smRes = await fetchWithTimeout(sUrl, desktopUA, 3500);
            if (smRes.ok) {
              const text = await smRes.text();
              if (text && (text.includes("<loc>") || sUrl.endsWith(".txt"))) {
                foundSitemapUrl = sUrl;
                sitemapXmlContent = text;
                break;
              }
            }
          } catch {}
        }

        if (foundSitemapUrl && sitemapXmlContent) {
          const discoveredUrls = new Set<string>();

          // Handle Sitemap Index files (contains nested <sitemap><loc>...</loc></sitemap>)
          if (sitemapXmlContent.includes("<sitemap>")) {
            const subSitemapRegex = /<sitemap>[\s\S]*?<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>[\s\S]*?<\/sitemap>/gi;
            const subSitemaps: string[] = [];
            let subM;
            while ((subM = subSitemapRegex.exec(sitemapXmlContent)) !== null && subSitemaps.length < 3) {
              subSitemaps.push(subM[1].trim());
            }

            for (const childSmUrl of subSitemaps) {
              try {
                const childRes = await fetchWithTimeout(childSmUrl, desktopUA, 3500);
                if (childRes.ok) {
                  const childText = await childRes.text();
                  const locRegex = /<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi;
                  let cM;
                  while ((cM = locRegex.exec(childText)) !== null && discoveredUrls.size < 40) {
                    discoveredUrls.add(cM[1].trim());
                  }
                }
              } catch {}
            }
          }

          // Extract direct <loc> URLs from the sitemap
          const locRegex = /<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi;
          let locMatch;
          while ((locMatch = locRegex.exec(sitemapXmlContent)) !== null && discoveredUrls.size < 40) {
            discoveredUrls.add(locMatch[1].trim());
          }

          // Filter out static media files and the origin homepage itself
          const cleanDiscovered = Array.from(discoveredUrls).filter((pageUrl) => {
            const lower = pageUrl.toLowerCase();
            const isMedia = /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|css|js|xml|mp4)$/i.test(lower);
            const isRoot = pageUrl === origin || pageUrl === `${origin}/`;
            return !isMedia && !isRoot;
          });

          // Prioritize suspicious URLs that phishers typically hide in sitemaps
          const scoredCandidates = cleanDiscovered.map((pageUrl) => {
            const lower = pageUrl.toLowerCase();
            let weight = 0;
            if (lower.includes("gallery")) weight += 50;
            if (lower.includes("slot") || lower.includes("gacor")) weight += 50;
            if (lower.includes("zeus") || lower.includes("711")) weight += 80;
            if (lower.includes("bigo") || lower.includes("4d")) weight += 80;
            if (lower.includes("haes") || lower.includes("sempoa") || lower.includes("hoki")) weight += 80;
            if (lower.includes("judi") || lower.includes("togel")) weight += 40;
            if (lower.includes("index.html") || lower.includes("login") || lower.includes("daftar")) weight += 30;
            if (lower.includes("wp-") || lower.includes("page")) weight += 10;
            return { url: pageUrl, weight };
          });

          scoredCandidates.sort((a, b) => b.weight - a.weight);
          const topCandidates = scoredCandidates.slice(0, 15).map(c => c.url);

          if (topCandidates.length > 0) {
            // Probe top sitemap candidates in parallel using Googlebot headers
            const pageProbePromises = topCandidates.map(async (pageUrl) => {
              try {
                const pRes = await fetchWithTimeout(pageUrl, googlebotMobileUA, 4000);
                const pHtml = await pRes.text();
                const titleM = pHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
                const pTitle = titleM ? titleM[1].trim() : "(Tanpa Judul)";
                const detected = checkBrands(pHtml);

                let score = 0;
                for (const b of detected) {
                  score += 100;
                }

                return {
                  url: pageUrl,
                  title: pTitle,
                  status: pRes.status,
                  detectedBrands: detected,
                  htmlContent: pHtml,
                  priorityScore: score
                };
              } catch {
                return {
                  url: pageUrl,
                  title: "(Gagal Membaca)",
                  status: 0,
                  detectedBrands: [],
                  priorityScore: 0
                };
              }
            });

            const pageResults = await Promise.all(pageProbePromises);

            sitemapDiscovery = {
              found: true,
              sitemapUrl: foundSitemapUrl,
              pages: pageResults.map(p => ({
                url: p.url,
                title: p.title,
                status: p.status,
                detectedBrands: p.detectedBrands
              }))
            };

            // Identify highest ranking phishing page in sitemap
            const highestPhishing = pageResults
              .filter(p => p.priorityScore > 0 && p.htmlContent)
              .sort((a, b) => b.priorityScore - a.priorityScore)[0];

            // AUTO-PIVOT FOR CLOAKED SITES:
            // If the main requested page had 0 brands, but Google Search Console sitemap indexed a phising subpage,
            // or if the subpage has far more specific brand targeting, expose it automatically!
            if (highestPhishing && highestPhishing.htmlContent && directBrands.length === 0) {
              googleConsoleCloaking = {
                detected: true,
                originalTargetUrl: finalUrl,
                activeScriptUrl: highestPhishing.url,
                cloakedPageTitle: highestPhishing.title,
                detectedBrands: highestPhishing.detectedBrands,
                decoyHtml: html
              };

              // Swap in the exact script Google Search Console reads and indexes
              html = highestPhishing.htmlContent;
            }
          }
        }
      } catch (smErr) {
        console.warn("Sitemap discovery error:", smErr);
      }

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
        usedUA,
        sitemapDiscovery,
        googleConsoleCloaking,
        userAgentCloaking
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
