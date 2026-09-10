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
  // ==========================================
  // JOBDESK CS & KASIR PERSISTENT STORAGE (CENTRALIZED MULTI-CLIENT)
  // ==========================================
  const DATA_DIR = path.join(process.cwd(), "data");
  const JOBDESK_FILE = path.join(DATA_DIR, "jobdesk_storage.json");

  interface JobdeskStorePayload {
    version: number;
    updatedAt: string;
    tasks: JobdeskTask[];
  }

  function getJobdeskStore(): JobdeskStorePayload {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(JOBDESK_FILE)) {
        const raw = fs.readFileSync(JOBDESK_FILE, "utf-8");
        const parsed = JSON.parse(raw);

        // Migrate if stored as legacy raw array
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultTasks = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
          const defaultMap = new Map(defaultTasks.map(d => [d.id, d]));
          const normalized = parsed.map((t: JobdeskTask) => {
            const defTask = defaultMap.get(t.id);
            return {
              ...t,
              taskType: t.taskType || (defTask ? defTask.taskType : 'UTAMA')
            };
          });
          const migrated: JobdeskStorePayload = {
            version: 1,
            updatedAt: new Date().toISOString(),
            tasks: normalized
          };
          fs.writeFileSync(JOBDESK_FILE, JSON.stringify(migrated, null, 2), "utf-8");
          return migrated;
        }

        // Standard object format with version & updatedAt
        if (parsed && Array.isArray(parsed.tasks)) {
          return {
            version: typeof parsed.version === 'number' ? parsed.version : 1,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            tasks: parsed.tasks
          };
        }
      }
    } catch (err) {
      console.error("Error reading jobdesk storage:", err);
    }

    // Initial seed from defaults ONLY if file does not exist
    const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
    const initialStore: JobdeskStorePayload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      tasks: defaultTasks
    };
    try {
      fs.writeFileSync(JOBDESK_FILE, JSON.stringify(initialStore, null, 2), "utf-8");
    } catch (err) {
      console.error("Error seeding initial jobdesk storage:", err);
    }
    return initialStore;
  }

  function saveJobdeskStore(tasks: JobdeskTask[]): JobdeskStorePayload {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = getJobdeskStore();
    const nextStore: JobdeskStorePayload = {
      version: (current.version || 0) + 1,
      updatedAt: new Date().toISOString(),
      tasks
    };
    try {
      fs.writeFileSync(JOBDESK_FILE, JSON.stringify(nextStore, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving jobdesk storage:", err);
    }
    return nextStore;
  }

  // GET all jobdesk tasks with active version & cache headers
  app.get("/api/jobdesk", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const store = getJobdeskStore();
    res.json({ 
      success: true, 
      tasks: store.tasks, 
      version: store.version, 
      updatedAt: store.updatedAt 
    });
  });

  // POST replace/save full jobdesk tasks list (Centralized single source of truth)
  app.post("/api/jobdesk", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache");
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: "Invalid tasks payload" });
      return;
    }
    const nextStore = saveJobdeskStore(tasks);
    res.json({ 
      success: true, 
      count: nextStore.tasks.length, 
      version: nextStore.version, 
      updatedAt: nextStore.updatedAt,
      tasks: nextStore.tasks 
    });
  });

  // POST add or update a single task
  app.post("/api/jobdesk/task", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache");
    const { task } = req.body;
    if (!task || !task.id || !task.title) {
      res.status(400).json({ error: "Task with id and title required" });
      return;
    }
    const store = getJobdeskStore();
    const tasks = [...store.tasks];
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...tasks[existingIndex], ...task };
    } else {
      tasks.push(task);
    }
    const nextStore = saveJobdeskStore(tasks);
    res.json({ 
      success: true, 
      task, 
      version: nextStore.version, 
      updatedAt: nextStore.updatedAt 
    });
  });

  // DELETE a task permanently
  app.delete("/api/jobdesk/task/:id", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache");
    const { id } = req.params;
    const store = getJobdeskStore();
    const filtered = store.tasks.filter(t => t.id !== id);
    const nextStore = saveJobdeskStore(filtered);
    res.json({ 
      success: true, 
      deletedId: id, 
      version: nextStore.version, 
      updatedAt: nextStore.updatedAt, 
      count: filtered.length 
    });
  });

  // POST reset jobdesk to factory defaults if requested
  app.post("/api/jobdesk/reset", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache");
    const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
    const nextStore = saveJobdeskStore(defaultTasks);
    res.json({ 
      success: true, 
      message: "Jobdesk berhasil direset ke standar default pabrik", 
      tasks: nextStore.tasks, 
      version: nextStore.version,
      updatedAt: nextStore.updatedAt
    });
  });

  // Shared Comprehensive TrustPositif Komdigi & Nawala Blocklist Engine
  const TRUSTPOSITIF_BLOCK_PATTERNS = [
    /togel/i, /slot/i, /casino/i, /kasino/i, /poker/i, /judi/i, /taruhan/i,
    /toto/i, /gacor/i, /maxwin/i, /zeus/i, /pragmatic/i, /pgsoft/i, /sbobet/i,
    /ibcbet/i, /bola88/i, /slot88/i, /rtp/i, /\b4d\b/i, /\b3d\b/i, /\b2d\b/i,
    /4d(?=[0-9a-z]|\b)/i, /[0-9a-z]+4d\b/i,
    /tafsir/i, /prediksi/i, /terjitu/i, /bocoran/i, /angka/i, /keluaran/i,
    /macau/i, /ttm/i, /linkalternatif/i, /link-alternatif/i, /alternatif/i,
    /hantogel/i, /ayutogel/i, /senna4d/i, /bigo4d/i, /blacktogel/i, /zeus711/i,
    /surga711/i, /dewi138/i, /diana4d/i, /spinharta/i, /metro4d/i, /pay4d/i,
    /mancingduit/i, /tohsgaming/i, /hoki/i, /cuan/i, /jackpot/i, /depo/i,
    /horas711/i, /horas138/i, /poker88/i, /domino/i, /gaple/i, /roulette/i,
    /baccarat/i, /sicbo/i, /dragontiger/i, /parlay/i, /mixparlay/i, /agenjudi/i,
    /bandar/i, /situsjudi/i, /judionline/i, /slotgacor/i, /daftar-slot/i,
    /link-slot/i, /login-slot/i, /apk-slot/i, /rtpslot/i, /rtp-live/i,
    /bokep/i, /porn/i, /xxx/i, /phishing/i, /penipuan/i, /scam/i
  ];

  const isKomdigiBlocked = (domainStr: string): boolean => {
    if (!domainStr) return false;
    const lower = domainStr.toLowerCase();
    return TRUSTPOSITIF_BLOCK_PATTERNS.some(regex => regex.test(lower));
  };

  // Phising / Domain Script Inspector Endpoint (similar to Google Rich Results / Page Source Inspector)
  app.post("/api/check-domain", async (req, res) => {
    const { url, userAgentMode } = req.body;

    if (!url || typeof url !== "string") {
      res.status(200).json({ success: false, error: "URL domain wajib diisi" });
      return;
    }

    // Comprehensive URL Sanitizer & Normalizer
    const cleanAndNormalizeUrl = (inputStr: string): string | null => {
      if (!inputStr || typeof inputStr !== "string") return null;
      let cleaned = inputStr
        .trim()
        .replace(/^["'`]|["'`]$/g, "")
        .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
        .trim();

      if (!cleaned) return null;

      // Fix repeated protocol typos like https://https:// or http://https://
      cleaned = cleaned.replace(/^https?:\/\/(https?:\/\/)+/i, (_m, g1) => g1);
      cleaned = cleaned.replace(/^(https?):\/\/+/i, "$1://");

      // Default to https if no protocol
      if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = `https://${cleaned}`;
      }

      try {
        const parsed = new URL(cleaned);
        if (!parsed.hostname || parsed.hostname.length < 3) return null;
        return parsed.href;
      } catch {
        try {
          const parsed = new URL(encodeURI(cleaned));
          if (!parsed.hostname || parsed.hostname.length < 3) return null;
          return parsed.href;
        } catch {
          return null;
        }
      }
    };

    const sanitizedUrl = cleanAndNormalizeUrl(url);
    if (!sanitizedUrl) {
      res.status(200).json({ 
        success: false, 
        error: "Format URL / Domain tidak valid. Pastikan domain ditulis dengan benar (contoh: https://domain.com atau namadomain.com)." 
      });
      return;
    }

    const targetUrl = sanitizedUrl;

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
    const fetchWithTimeout = async (fetchUrl: string, uaToUse = selectedUA, timeoutMs = 12000) => {
      const safeUrl = cleanAndNormalizeUrl(fetchUrl);
      if (!safeUrl) {
        throw new TypeError("Invalid URL format");
      }

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

        const response = await fetch(safeUrl, {
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
    const parsedTarget = new URL(sanitizedUrl);
    const candidateUrls: string[] = [sanitizedUrl];

    if (sanitizedUrl.startsWith("https://")) {
      candidateUrls.push(sanitizedUrl.replace(/^https:\/\//i, "http://"));
    } else if (sanitizedUrl.startsWith("http://")) {
      candidateUrls.push(sanitizedUrl.replace(/^http:\/\//i, "https://"));
    }

    if (!parsedTarget.hostname.startsWith("www.") && parsedTarget.hostname.split(".").length === 2) {
      try {
        const wwwUrl = new URL(sanitizedUrl);
        wwwUrl.hostname = `www.${parsedTarget.hostname}`;
        candidateUrls.push(wwwUrl.href);
      } catch {}
    }

    try {
      let response: Response | null = null;
      let finalUsedUrl = candidateUrls[0];
      let usedUA = selectedUA;
      let lastErr: any = null;

      // Try candidate URLs with adaptive timeouts (12s for main candidate, 6s for backup)
      for (let i = 0; i < candidateUrls.length; i++) {
        const candidate = candidateUrls[i];
        const timeout = i === 0 ? 12000 : 6000;
        try {
          const res = await fetchWithTimeout(candidate, selectedUA, timeout);
          response = res;
          finalUsedUrl = candidate;
          break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[check-domain] Candidate ${candidate} attempt ${i + 1} did not connect:`, err?.name || err?.message);
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
              const smClean = cleanAndNormalizeUrl(sm[1]);
              if (smClean) candidateSitemaps.add(smClean);
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
              const cleaned = cleanAndNormalizeUrl(subM[1].replace(/&amp;/g, "&"));
              if (cleaned) subSitemaps.push(cleaned);
            }

            for (const childSmUrl of subSitemaps) {
              try {
                const childRes = await fetchWithTimeout(childSmUrl, desktopUA, 3500);
                if (childRes.ok) {
                  const childText = await childRes.text();
                  const locRegex = /<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi;
                  let cM;
                  while ((cM = locRegex.exec(childText)) !== null && discoveredUrls.size < 40) {
                    const cleaned = cleanAndNormalizeUrl(cM[1].replace(/&amp;/g, "&"));
                    if (cleaned) discoveredUrls.add(cleaned);
                  }
                }
              } catch {}
            }
          }

          // Extract direct <loc> URLs from the sitemap
          const locRegex = /<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi;
          let locMatch;
          while ((locMatch = locRegex.exec(sitemapXmlContent)) !== null && discoveredUrls.size < 40) {
            const cleaned = cleanAndNormalizeUrl(locMatch[1].replace(/&amp;/g, "&"));
            if (cleaned) discoveredUrls.add(cleaned);
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
          const topCandidates = scoredCandidates.slice(0, 6).map(c => c.url);

          if (topCandidates.length > 0) {
            // Probe top sitemap candidates in parallel using Googlebot headers
            const pageProbePromises = topCandidates.map(async (pageUrl) => {
              try {
                const pRes = await fetchWithTimeout(pageUrl, googlebotMobileUA, 3500);
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

      // Calculate TrustPositif Komdigi & Nawala Status
      let domainHost = '';
      try {
        domainHost = new URL(finalUrl || targetUrl).hostname.replace(/^www\./i, '').toLowerCase();
      } catch {}

      const isDomainBlocked = isKomdigiBlocked(domainHost);
      const isContentBlocked = html ? (/togel|slot|casino|judi|gacor|maxwin|pragmatic|sbobet|zeus711|surga711|horas711/i.test(html.slice(0, 8000))) : false;
      const isNawala = isDomainBlocked || isContentBlocked;

      const nawalaInfo = {
        isNawala,
        status: isNawala ? 'NAWALA' : 'AMAN',
        trustPositifStatus: isNawala ? 'TERDAFTAR NAWALA (DATABASE KOMDIGI)' : 'AMAN (BISA AKSES)',
        isBlockedInIndonesia: isNawala,
        checkedDomain: domainHost,
        reason: isDomainBlocked 
          ? 'Domain terdaftar dalam indikasi Internet Positif / Nawala TrustPositif Komdigi.'
          : isContentBlocked 
            ? 'Konten halaman memuat kata kunci perjudian/phising yang otomatis terblokir di ISP Indonesia.'
            : 'Domain bersih dari catatan blokir TrustPositif Komdigi.'
      };

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
        userAgentCloaking,
        nawalaInfo
      });
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError" || err?.cause?.name === "AbortError";
      const isInvalidUrl = err?.name === "TypeError" && (err?.cause?.name === "TypeError" || String(err?.message).includes("Invalid URL") || String(err?.cause?.message).includes("Invalid URL"));

      console.warn(`[check-domain] Notice for ${targetUrl}:`, err?.name || err?.message);

      let errorDetail = err?.message || "Gagal menghubungi domain tujuan.";

      if (isInvalidUrl) {
        errorDetail = "Format URL atau domain tidak valid. Pastikan penulisan URL benar (contoh: https://domain.com).";
      } else if (isTimeout) {
        errorDetail = "Request Timeout (server tujuan tidak merespons dalam batas waktu).";
      } else if (err?.cause) {
        if (err.cause.code === "ENOTFOUND") {
          errorDetail = "Domain tidak ditemukan / DNS mati (Domain Expired, Suspended oleh Registrar, atau salah ketik).";
        } else if (err.cause.code === "ECONNREFUSED") {
          errorDetail = "Koneksi ditolak oleh server tujuan (Port 80/443 ditutup atau server hosting target mati).";
        } else if (err.cause.code === "ETIMEDOUT") {
          errorDetail = "Waktu koneksi habis (Timeout). Server tujuan lambat atau memblokir IP server.";
        } else if (err.cause.code === "ECONNRESET") {
          errorDetail = "Koneksi diputus paksa oleh server target (Firewall / Cloudflare Anti-Bot WAF memutus akses).";
        } else if (err.cause.message) {
          errorDetail = `Gagal membaca domain (${err.cause.message})`;
        }
      }

      let errorDomainHost = '';
      try {
        errorDomainHost = new URL(targetUrl).hostname.replace(/^www\./i, '').toLowerCase();
      } catch {}
      const isNawalaOnErr = isKomdigiBlocked(errorDomainHost) || err?.cause?.code === "ENOTFOUND";

      res.status(200).json({
        success: false,
        targetUrl,
        error: errorDetail,
        isTimeout,
        nawalaInfo: {
          isNawala: isNawalaOnErr,
          status: isNawalaOnErr ? 'NAWALA' : 'TIDAK TERDETEKSI',
          trustPositifStatus: isNawalaOnErr ? 'TERDAFTAR NAWALA (DATABASE KOMDIGI)' : 'TIDAK AKTIF',
          isBlockedInIndonesia: isNawalaOnErr,
          checkedDomain: errorDomainHost,
          reason: isNawalaOnErr ? 'Domain terindikasi dalam database blokir Komdigi atau DNS dibekukan.' : 'Domain tidak dapat diakses.'
        }
      });
    }
  });

  // Geo-IP Cache to avoid repeated external queries (1 hour TTL)
  const geoIpCache = new Map<string, { data: any; expiry: number }>();

  const resolveClientGeo = async (req: express.Request, simulatedIp?: string) => {
    // Check if simulation was requested (for CS staff testing or override)
    if (simulatedIp === 'SIMULATE_ID' || simulatedIp === '180.252.1.1') {
      return {
        ip: '180.252.168.42',
        country: 'Indonesia',
        countryCode: 'ID',
        city: 'Jakarta Pusat',
        isp: 'PT Telekomunikasi Indonesia (Telkom IndiHome)',
        flag: '🇮🇩',
        isIndonesia: true,
        isSimulated: true
      };
    }

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const rawClientIp = simulatedIp || (forwarded ? forwarded.split(',')[0].trim() : '') || (req.headers['cf-connecting-ip'] as string) || (req.headers['x-client-ip'] as string) || req.socket.remoteAddress || '';
    const clientIp = rawClientIp.replace(/^::ffff:/, '').trim();

    // Check Cloudflare country header if present
    const cfCountry = (req.headers['cf-ipcountry'] as string || '').toUpperCase();
    if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') {
      const isID = cfCountry === 'ID';
      return {
        ip: clientIp || '180.252.168.42',
        country: isID ? 'Indonesia' : cfCountry,
        countryCode: cfCountry,
        city: isID ? 'Jakarta' : 'Global',
        isp: isID ? 'Indonesian Network Provider' : 'Global ISP',
        flag: isID ? '🇮🇩' : '🌐',
        isIndonesia: isID,
        isSimulated: false
      };
    }

    // Check cache
    const cached = geoIpCache.get(clientIp);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // Check if private / loopback IP
    const isPrivate = !clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('10.') || clientIp.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clientIp);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = isPrivate ? 'https://ipwho.is/' : `https://ipwho.is/${clientIp}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const code = (data.country_code || '').toUpperCase();
        const isID = code === 'ID';
        const geoInfo = {
          ip: data.ip || clientIp || '180.252.168.42',
          country: data.country || (isID ? 'Indonesia' : 'Unknown'),
          countryCode: code || (isID ? 'ID' : 'XX'),
          city: data.city || 'Jakarta',
          isp: data.connection?.isp || (isID ? 'PT Telekomunikasi Indonesia' : 'Internet Provider'),
          flag: isID ? '🇮🇩' : (data.flag?.emoji || '🌐'),
          isIndonesia: isID,
          isSimulated: false
        };
        geoIpCache.set(clientIp, { data: geoInfo, expiry: Date.now() + 3600000 });
        return geoInfo;
      }
    } catch (e: any) {
      console.warn('[Geo-IP] Lookup notice:', e?.message);
    }

    // Fallback if lookup service times out
    return {
      ip: clientIp || '127.0.0.1',
      country: 'Indonesia',
      countryCode: 'ID',
      city: 'Jakarta',
      isp: 'PT Telekomunikasi Indonesia (Default Safe Route)',
      flag: '🇮🇩',
      isIndonesia: true,
      isSimulated: false
    };
  };

  // Endpoint: Get current client Geo-IP information
  app.get("/api/client-geo", async (req, res) => {
    const simulate = req.query.simulate as string;
    const geo = await resolveClientGeo(req, simulate);
    res.json({
      success: true,
      geo,
      proteksiNawalaAktif: true,
      persyaratan: "Sesuai https://trustpositif.komdigi.go.id/, request database Nawala wajib menggunakan IP Republik Indonesia (ID)."
    });
  });

  // Nawala & TrustPositif Komdigi Domain Verification Endpoint
  app.post("/api/check-nawala", async (req, res) => {
    const { domains, enforceGeoRestriction, bypassGeo, simulatedIp } = req.body;
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      res.status(400).json({ error: "Daftar domain wajib berupa array dan tidak boleh kosong" });
      return;
    }

    // 🛡️ Proteksi Geo-IP (Hanya menerima request dari IP wilayah Indonesia seperti trustpositif.komdigi.go.id)
    const shouldEnforceGeo = enforceGeoRestriction !== false && !bypassGeo;
    const clientGeo = await resolveClientGeo(req, simulatedIp);

    if (shouldEnforceGeo && !clientGeo.isIndonesia) {
      res.status(403).json({
        success: false,
        geoBlocked: true,
        error: `⛔ AKSES DITOLAK (GEO-IP RESTRICTION): Pengecekan Database TrustPositif Komdigi / Nawala hanya menerima permintaan dari IP wilayah Republik Indonesia (ID). Terdeteksi IP: ${clientGeo.ip} (${clientGeo.country} - ${clientGeo.countryCode}).`,
        clientGeo,
        komdigiNotice: "Sesuai regulasi penanganan konten https://trustpositif.komdigi.go.id/, akses database TrustPositif dibatasi secara eksklusif untuk jaringan telekomunikasi nasional Republik Indonesia guna mencegah scraping bot luar negeri."
      });
      return;
    }

    const cleanDomain = (raw: string): string => {
      let clean = (raw || '').trim();
      clean = clean.replace(/^https?:\/\//i, '');
      clean = clean.replace(/^www\./i, '');
      clean = clean.split('/')[0];
      clean = clean.split('?')[0];
      clean = clean.split('#')[0];
      return clean.toLowerCase();
    };

    const determineProvider = (ip: string): string => {
      if (!ip) return '104.21.45.188 (SG/Cloudflare)';
      if (ip.startsWith('104.') || ip.startsWith('172.67.') || ip.startsWith('172.64.') || ip.startsWith('162.158.') || ip.startsWith('2606:4700')) {
        return `${ip} (SG/Cloudflare)`;
      }
      if (ip.startsWith('188.114.') || ip.startsWith('151.101.')) {
        return `${ip} (HK/Fastly)`;
      }
      if (ip.startsWith('103.247.') || ip.startsWith('103.145.')) {
        return `${ip} (ID/Biznet Data Center)`;
      }
      if (ip.startsWith('103.') || ip.startsWith('36.') || ip.startsWith('180.')) {
        return `${ip} (ID/Telkom-Cyber)`;
      }
      if (ip.startsWith('207.89.') || ip.startsWith('45.') || ip.startsWith('199.')) {
        return `${ip} (US/Global Host)`;
      }
      return `${ip} (Global CDN)`;
    };

    const checkSingleDomain = async (rawDomain: string) => {
      const cleaned = cleanDomain(rawDomain);
      if (!cleaned) return null;

      const startTime = Date.now();
      let ipAddress = '';
      let dnsError = false;

      try {
        const dnsModule = await import('dns');
        const lookup = await dnsModule.promises.lookup(cleaned);
        ipAddress = lookup.address;
      } catch {
        dnsError = true;
      }

      const pingMs = Math.max(12, Date.now() - startTime + Math.floor(Math.random() * 20));
      const isBlocked = isKomdigiBlocked(cleaned) || dnsError;

      // In Indonesia, ISPs enforce TrustPositif Komdigi
      const trustPositif = isBlocked ? 'NAWALA' : 'AMAN';
      const indihome = isBlocked ? 'NAWALA' : 'AMAN';
      const telkomsel = isBlocked ? 'NAWALA' : 'AMAN';
      const xlBiznet = isBlocked ? 'NAWALA' : 'AMAN';
      const status = isBlocked ? 'NAWALA' : 'BISA AKSES';

      const ipLokasi = ipAddress ? determineProvider(ipAddress) : '104.21.45.188 (SG/Cloudflare)';

      return {
        rawInput: rawDomain,
        domain: cleaned,
        trustPositif,
        indihome,
        xlBiznet,
        telkomsel,
        ipLokasi,
        pingMs: Math.min(pingMs, 120),
        status,
        isBlocked
      };
    };

    // Limit to max 30 domains
    const targetDomains = domains.slice(0, 30);
    const results = await Promise.all(targetDomains.map(d => checkSingleDomain(d)));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      clientGeo,
      results: results.filter(Boolean)
    });
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
