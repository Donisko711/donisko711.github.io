import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fastCheckBrands, HS_BRAND_DEFINITIONS } from "./src/utils/brandAnalysis";
import { INITIAL_JOBDESK_CS, INITIAL_JOBDESK_KASIR } from "./src/data/initialData";
import { JobdeskTask } from "./src/types";

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

let cachedGroqModel: string | null = null;

async function getBestGroqModel(apiKey: string): Promise<string> {
  if (cachedGroqModel) return cachedGroqModel;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const modelIds: string[] = (data?.data || []).map((m: any) => m.id);
      const priorities = [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "qwen/qwen3.6-27b",
        "openai/gpt-oss-20b",
        "groq/compound-mini",
        "groq/compound",
        "llama-3.3-70b-versatile",
        "llama-3.1-70b-versatile",
        "llama3-70b-8192",
      ];
      for (const pref of priorities) {
        if (modelIds.includes(pref)) {
          cachedGroqModel = pref;
          return pref;
        }
      }
      const chatFallback = modelIds.find(
        (id) => !id.includes("whisper") && !id.includes("guard")
      );
      if (chatFallback) {
        cachedGroqModel = chatFallback;
        return chatFallback;
      }
    }
  } catch (err) {
    console.error("Failed to query Groq models list:", err);
  }
  return "openai/gpt-oss-120b";
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
    res.json({ 
      status: "ok", 
      aiReady: Boolean(process.env.GEMINI_API_KEY),
      groqReady: Boolean(process.env.GROQ_API_KEY),
    });
  });

  // AI Service Status Endpoint
  app.get("/api/ai/status", (_req, res) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasGroq = Boolean(process.env.GROQ_API_KEY);
    res.json({
      geminiReady: hasGemini,
      groqReady: hasGroq,
      freeImageReady: true,
      activeProvider: hasGemini ? "gemini" : hasGroq ? "groq" : "builtin",
      models: {
        text: hasGemini ? "Google Gemini 3.8 Flash (Free Tier)" : hasGroq ? "Groq Llama 3.3 (Free Tier)" : "DON ISKO Intelligent Core",
        image: "AI Image Studio (Free Text-to-Image / Pollinations)",
      }
    });
  });

  // AI Image Generation Endpoint (Free Text-to-Image Engine)
  app.post("/api/ai/image", async (req, res) => {
    const { prompt, style, width = 1024, height = 1024 } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Deskripsi gambar (prompt) wajib diisi." });
      return;
    }

    try {
      let styleModifier = "";
      switch (style) {
        case "neon-cyberpunk":
          styleModifier = ", cyberpunk neon glowing style, high contrast, dark luxury background, ultra detailed, 8k render";
          break;
        case "luxury-gold":
          styleModifier = ", luxury golden metallic, elegant black background, cinematic lighting, 3d octane render";
          break;
        case "banner-promo":
          styleModifier = ", high quality marketing promotional banner, crisp graphics, modern typography space, clean commercial design";
          break;
        case "vector-logo":
          styleModifier = ", clean minimalist vector logo emblem, esports gaming badge, sharp vector lines, high resolution";
          break;
        case "realistic":
          styleModifier = ", photorealistic, 8k resolution, cinematic lighting, hyper-detailed photography";
          break;
        default:
          styleModifier = ", highly detailed, vivid colors, modern sharp design, 4k";
          break;
      }

      const enhancedPrompt = `${prompt.trim()}${styleModifier}`;
      const randomSeed = Math.floor(Math.random() * 10000000);
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true`;

      res.json({
        success: true,
        imageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        width,
        height,
        seed: randomSeed,
        timestamp: Date.now()
      });
    } catch (err: any) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: err?.message || "Gagal menghasilkan gambar AI." });
    }
  });

  // ==========================================
  // JOBDESK CS & KASIR PERSISTENT STORAGE
  // ==========================================
  const DATA_DIR = path.join(process.cwd(), "data");
  const JOBDESK_FILE = path.join(DATA_DIR, "jobdesk_storage.json");
  const DELETED_TASKS_FILE = path.join(DATA_DIR, "deleted_tasks.json");

  function getDeletedTaskIds(): string[] {
    try {
      if (fs.existsSync(DELETED_TASKS_FILE)) {
        const raw = fs.readFileSync(DELETED_TASKS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error("Error reading deleted tasks file:", err);
    }
    return [];
  }

  function recordDeletedTaskId(id: string) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const deleted = getDeletedTaskIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        fs.writeFileSync(DELETED_TASKS_FILE, JSON.stringify(deleted, null, 2), "utf-8");
      }
    } catch (err) {
      console.error("Error recording deleted task:", err);
    }
  }

  function ensureJobdeskStorage(): JobdeskTask[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const deletedIds = new Set(getDeletedTaskIds());
      const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
      const defaultMap = new Map(defaultTasks.map(d => [d.id, d]));

      if (fs.existsSync(JOBDESK_FILE)) {
        const raw = fs.readFileSync(JOBDESK_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out explicitly deleted tasks
          const activeTasks = parsed.filter((t: JobdeskTask) => !deletedIds.has(t.id));

          // Ensure all active tasks have valid taskType ('UTAMA' or 'SAMBILAN')
          const normalized = activeTasks.map((t: JobdeskTask) => {
            const defTask = defaultMap.get(t.id);
            return {
              ...t,
              taskType: t.taskType || (defTask ? defTask.taskType : 'UTAMA')
            };
          });

          // Ensure any default tasks that were not deleted are present
          const existingIds = new Set(normalized.map(t => t.id));
          defaultTasks.forEach(def => {
            if (!existingIds.has(def.id) && !deletedIds.has(def.id)) {
              normalized.push({
                ...def,
                taskType: def.taskType || 'UTAMA'
              });
            }
          });

          fs.writeFileSync(JOBDESK_FILE, JSON.stringify(normalized, null, 2), "utf-8");
          return normalized;
        }
      }

      // Initial seed excluding any recorded deleted tasks
      const initialTasks: JobdeskTask[] = defaultTasks.filter(t => !deletedIds.has(t.id));
      fs.writeFileSync(JOBDESK_FILE, JSON.stringify(initialTasks, null, 2), "utf-8");
      return initialTasks;
    } catch (err) {
      console.error("Error ensuring jobdesk storage:", err);
      return [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
    }
  }

  function saveJobdeskStorage(tasks: JobdeskTask[]): boolean {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const deletedIds = new Set(getDeletedTaskIds());
      const activeTasks = tasks.filter(t => !deletedIds.has(t.id));
      fs.writeFileSync(JOBDESK_FILE, JSON.stringify(activeTasks, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("Error saving jobdesk storage:", err);
      return false;
    }
  }

  // GET all jobdesk tasks and deleted IDs
  app.get("/api/jobdesk", (_req, res) => {
    const tasks = ensureJobdeskStorage();
    const deletedIds = getDeletedTaskIds();
    res.json({ success: true, tasks, deletedIds });
  });

  // POST replace/save full jobdesk tasks list
  app.post("/api/jobdesk", (req, res) => {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: "Invalid tasks payload" });
      return;
    }
    const saved = saveJobdeskStorage(tasks);
    if (saved) {
      res.json({ success: true, count: tasks.length });
    } else {
      res.status(500).json({ error: "Failed to write jobdesk storage" });
    }
  });

  // POST add or update a single task
  app.post("/api/jobdesk/task", (req, res) => {
    const { task } = req.body;
    if (!task || !task.id || !task.title) {
      res.status(400).json({ error: "Task with id and title required" });
      return;
    }
    const tasks = ensureJobdeskStorage();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...tasks[existingIndex], ...task };
    } else {
      tasks.push(task);
    }
    saveJobdeskStorage(tasks);
    res.json({ success: true, task });
  });

  // DELETE a task permanently
  app.delete("/api/jobdesk/task/:id", (req, res) => {
    const { id } = req.params;
    recordDeletedTaskId(id);
    const tasks = ensureJobdeskStorage();
    const filtered = tasks.filter(t => t.id !== id);
    saveJobdeskStorage(filtered);
    res.json({ success: true, deletedId: id });
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
          const res = await fetchWithTimeout(candidate, selectedUA, 7000);
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
          const fallbackRes = await fetchWithTimeout(finalUsedUrl, desktopUA, 6000);
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
      let errorDetail = err.message || "Gagal menghubungi domain tujuan.";

      if (err.cause) {
        if (err.cause.code === "ENOTFOUND") {
          errorDetail = "Domain tidak ditemukan / DNS mati (Domain Expired, Suspended oleh Registrar, atau salah ketik).";
        } else if (err.cause.code === "ECONNREFUSED") {
          errorDetail = "Koneksi ditolak oleh server tujuan (Port 80/443 ditutup atau server hosting target mati).";
        } else if (err.cause.code === "ETIMEDOUT" || err.cause.name === "AbortError" || isTimeout) {
          errorDetail = "Waktu koneksi habis (Timeout). Server tujuan lambat atau memblokir IP server.";
        } else if (err.cause.code === "ECONNRESET") {
          errorDetail = "Koneksi diputus paksa oleh server target (Firewall / Cloudflare Anti-Bot WAF memutus akses).";
        } else if (err.cause.message) {
          errorDetail = `Gagal membaca domain (${err.cause.message})`;
        }
      } else if (isTimeout) {
        errorDetail = "Request Timeout (server tujuan tidak merespons dalam batas waktu).";
      }

      res.status(500).json({
        success: false,
        targetUrl,
        error: errorDetail,
      });
    }
  });

  // Streaming Chat Completion Endpoint (SSE - Server Sent Events)
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemPrompt, modelName, provider } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Pesan tidak boleh kosong" });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = (lastMessage?.content || "").trim();

    // Set headers for SSE Streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // 1. Cek apakah ini permintaan pembuatan gambar langsung (misal: /gambar atau /image)
    if (userQuery.startsWith("/gambar ") || userQuery.startsWith("/image ") || userQuery.toLowerCase().startsWith("buatkan gambar ")) {
      const imagePrompt = userQuery.replace(/^\/(gambar|image)\s+/i, "").replace(/^buatkan gambar\s+/i, "").trim();
      if (imagePrompt) {
        const seed = Math.floor(Math.random() * 10000000);
        const enhancedPrompt = `${imagePrompt}, highly detailed, vibrant colors, 4k digital art, clean commercial composition`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

        const markdownReply = `🎨 **Hasil Pembuatan Gambar AI:**\n\n` +
          `**Prompt:** *${imagePrompt}*\n\n` +
          `![${imagePrompt}](${imageUrl})\n\n` +
          `🔗 **[Klik Disini untuk Buka Gambar Ukuran Penuh (HD)](${imageUrl})**\n\n` +
          `> *Gambar dibuat menggunakan mesin AI Image Studio (Free Text-to-Image). Anda dapat menyalin tautan atau klik kanan untuk menyimpan.*`;

        res.write(`data: ${JSON.stringify({ chunk: markdownReply })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    }

    const ai = getGenAI();
    const groqKey = process.env.GROQ_API_KEY;

    // 2. Gunakan Groq jika diminta atau jika Gemini tidak ada dan Groq tersedia
    if ((provider === "groq" || (!ai && groqKey)) && groqKey) {
      try {
        const groqModel = await getBestGroqModel(groqKey);
        const groqMessages = [
          {
            role: "system",
            content: systemPrompt ? `${SYSTEM_INSTRUCTION}\n\nInstruksi Khusus Mode: ${systemPrompt}` : SYSTEM_INSTRUCTION
          },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === "model" ? "assistant" : m.role,
            content: m.content
          }))
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: groqModel,
            messages: groqMessages,
            temperature: 0.7,
            stream: true
          })
        });

        if (!groqRes.ok) {
          const errBody = await groqRes.text().catch(() => "");
          console.error("Groq API error status:", groqRes.status, errBody);
          throw new Error(`Groq API returned status ${groqRes.status}: ${errBody}`);
        }

        const reader = groqRes.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(trimmed.slice(6));
                  const text = parsed.choices?.[0]?.delta?.content || "";
                  if (text) {
                    res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
                  }
                } catch {
                  // ignore partial JSON parse
                }
              }
            }
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      } catch (groqErr) {
        console.error("Groq API error, falling back:", groqErr);
      }
    }

    // 3. Gunakan Google Gemini (dengan auto-fallback jika kuota model tertentu penuh)
    if (ai) {
      const candidateModels = [
        modelName || "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
      ];

      let streamSuccess = false;
      let lastAiError: any = null;

      for (const mName of candidateModels) {
        try {
          // Transform messages into contents for @google/genai
          const contents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          }));

          const fullSystemInstruction = systemPrompt 
            ? `${SYSTEM_INSTRUCTION}\n\nInstruksi Khusus Mode: ${systemPrompt}`
            : SYSTEM_INSTRUCTION;

          const responseStream = await ai.models.generateContentStream({
            model: mName,
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
          streamSuccess = true;
          return;
        } catch (error: any) {
          console.warn(`Gemini model ${mName} error:`, error?.message);
          lastAiError = error;
          // Continue to next model if quota/resource exhausted
          if (error?.message?.includes("resource_exhausted") || error?.status === 429) {
            continue;
          }
          break;
        }
      }

      if (!streamSuccess) {
        console.error("All Gemini API models failed:", lastAiError);
        const errorMessage = lastAiError?.message?.includes("resource_exhausted")
          ? "Kuota penggunaan AI model sedang penuh/mencapai batas. Silakan tunggu 1 menit atau gunakan akun API Key baru."
          : (lastAiError?.message || "Terjadi kesalahan saat memproses permintaan AI.");
        res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
        res.end();
        return;
      }
    }

    // 4. Intelligent Fallback Assistant jika API key belum dimasukkan
    let smartFallback = "";
    const lowerQuery = userQuery.toLowerCase();

    if (lowerQuery.includes("script") || lowerQuery.includes("kode") || lowerQuery.includes("python") || lowerQuery.includes("javascript") || lowerQuery.includes("bot")) {
      smartFallback = `💻 **Contoh Script Automasi (DON ISKO Script Engine):**\n\n` +
        `Berikut adalah template script pemantauan status website & notifikasi Telegram yang siap Anda gunakan:\n\n` +
        "```javascript\n" +
        "// Script Monitoring Domain & Notifikasi Telegram (Node.js)\n" +
        "const https = require('https');\n" +
        "const TELEGRAM_TOKEN = 'YOUR_BOT_TOKEN';\n" +
        "const CHAT_ID = 'YOUR_CHAT_ID';\n" +
        "const TARGET_URL = 'https://donisko711.com';\n\n" +
        "function checkWebsite() {\n" +
        "  https.get(TARGET_URL, (res) => {\n" +
        "    if (res.statusCode === 200) {\n" +
        "      console.log(`[OK] ${TARGET_URL} aktif (Status: 200)`);\n" +
        "    } else {\n" +
        "      sendTelegramAlert(`⚠️ PERINGATAN: ${TARGET_URL} down! Status: ${res.statusCode}`);\n" +
        "    }\n" +
        "  }).on('error', (e) => {\n" +
        "    sendTelegramAlert(`🚨 ERROR: Tidak dapat mengakses ${TARGET_URL}: ${e.message}`);\n" +
        "  });\n" +
        "}\n\n" +
        "function sendTelegramAlert(message) {\n" +
        "  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;\n" +
        "  https.get(url);\n" +
        "}\n\n" +
        "setInterval(checkWebsite, 60000); // Periksa setiap 1 menit\n" +
        "console.log('Monitoring aktif...');\n" +
        "```\n\n" +
        `💡 *Tips: Anda dapat menghubungkan \`GEMINI_API_KEY\` gratis dari Google AI Studio untuk membuat script bahasa pemrograman lain secara otomatis.*`;
    } else if (lowerQuery.includes("deposit") || lowerQuery.includes("pending") || lowerQuery.includes("komplain")) {
      smartFallback = `💬 **Rekomendasi Draft CS 711 - Penanganan Deposit Pending:**\n\n` +
        `*"Halo Bosku, mohon maaf atas ketidaknyamanannya. Terkait kendala deposit yang belum masuk, saat ini sistem perbankan kami sedang melakukan verifikasi mutasi berkala. Silakan lampirkan bukti transfer struk/m-Banking yang memuat nomor referensi dan jam transaksi ya Bosku, tim kasir kami akan segera memprosesnya secepat mungkin. Terima kasih atas kesabarannya 🙏"*\n\n` +
        `**Langkah Operasional CS:**\n` +
        `1. Cek mutasi rekening di internet banking terkait.\n` +
        `2. Pastikan nominal dan 3 digit angka unik (bila ada) sesuai.\n` +
        `3. Jika mutasi bank sedang maintenance, berikan estimasi waktu yang sopan kepada member.`;
    } else if (lowerQuery.includes("turnover") || lowerQuery.includes(" to ") || lowerQuery.includes("rumus")) {
      smartFallback = `🧮 **Panduan & Rumus Hitung Turnover (TO):**\n\n` +
        `**Rumus Dasar:**\n` +
        `$$\\text{Target TO} = (\\text{Deposit} + \\text{Bonus}) \\times \\text{Syarat TO}$$\n\n` +
        `**Contoh Kasus:**\n` +
        `- Deposit: Rp 100.000\n` +
        `- Bonus 100%: Rp 100.000\n` +
        `- Total Modal: Rp 200.000\n` +
        `- Syarat TO: x18\n` +
        `- **Target Turnover:** Rp 200.000 × 18 = **Rp 3.600.000**\n\n` +
        `*Catatan: Turnover dihitung dari total nominal taruhan yang sah (menang/kalah), bukan dari sisa saldo.*`;
    } else {
      smartFallback = `Halo! Saya **DON ISKO AI INTELLIGENCE**.\n\n` +
        `Pertanyaan Anda: *"${userQuery}"*\n\n` +
        `Saya siap membantu Anda dalam:\n` +
        `1. 💬 **Tanya Jawab & CS Knowledge**: SOP pelayanan, balasan komplain, dan kalkulasi odds/TO.\n` +
        `2. 💻 **Script & Coding Generator**: Menulis kode JavaScript, Python, Bash, SQL, formula Excel, dll.\n` +
        `3. 🎨 **Pembuatan Gambar AI**: Ketik \`/gambar [deskripsi]\` atau gunakan tab **Studio Gambar** di atas untuk membuat visual/banner promosi gratis!\n\n` +
        `ℹ️ *Untuk mengaktifkan model penuh Google Gemini 3.8 Flash secara gratis, masukkan \`GEMINI_API_KEY\` Anda di menu Settings > Secrets.*`;
    }

    res.write(`data: ${JSON.stringify({ chunk: smartFallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  });

  // Standard Non-streaming Generate Endpoint
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt, systemPrompt, modelName } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGenAI();
    const groqKey = process.env.GROQ_API_KEY;

    if (!ai && groqKey) {
      try {
        const groqModel = await getBestGroqModel(groqKey);
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              {
                role: "system",
                content: systemPrompt ? `${SYSTEM_INSTRUCTION}\n${systemPrompt}` : SYSTEM_INSTRUCTION,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (groqRes.ok) {
          const data = (await groqRes.json()) as any;
          const reply = data?.choices?.[0]?.message?.content || "";
          res.json({ text: reply });
          return;
        }
      } catch (groqErr) {
        console.error("Groq Generate Error:", groqErr);
      }
    }

    if (!ai) {
      res.json({
        text: `Kunci API belum dikonfigurasi. Respon lokal: Terima kasih atas pertanyaan "${prompt}".`,
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
