import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Code2, 
  FileCode, 
  Layers, 
  AlertTriangle, 
  Globe, 
  Lock, 
  Unlock, 
  Sparkles, 
  Terminal, 
  Eye, 
  Filter,
  CheckCircle2,
  XCircle,
  FileCheck,
  Zap,
  Tag,
  Plus,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Info
} from 'lucide-react';
import { 
  scanDocumentForBrands, 
  HS_BRAND_DEFINITIONS, 
  DetectedBrandMatch 
} from '../../utils/brandAnalysis';

interface SitemapPageInfo {
  url: string;
  title: string;
  status: number;
  detectedBrands: string[];
}

interface GoogleConsoleCloakingInfo {
  detected: boolean;
  originalTargetUrl: string;
  activeScriptUrl: string;
  cloakedPageTitle: string;
  detectedBrands: string[];
  decoyHtml: string;
}

interface UserAgentCloakingInfo {
  detected: boolean;
  botBrands: string[];
  desktopBrands: string[];
  botTitle: string;
  desktopTitle: string;
}

interface DomainCheckResponse {
  success: boolean;
  targetUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  contentType: string;
  contentLength: number;
  headers: Record<string, string>;
  html: string;
  isHttps: boolean;
  usedUA?: string;
  sitemapDiscovery?: {
    found: boolean;
    sitemapUrl?: string;
    pages: SitemapPageInfo[];
  } | null;
  googleConsoleCloaking?: GoogleConsoleCloakingInfo | null;
  userAgentCloaking?: UserAgentCloakingInfo | null;
  error?: string;
}

// 28 Automatic Phishing Monitored Keywords requested by user
export const DEFAULT_MONITORED_KEYWORDS = HS_BRAND_DEFINITIONS.map(b => b.displayName);

export const PhisingChecker: React.FC = () => {
  const [inputMode, setInputMode] = useState<'url' | 'raw_console'>('url');
  const [urlInput, setUrlInput] = useState<string>('');
  const [rawConsoleHtml, setRawConsoleHtml] = useState<string>('');
  const [manualKeyword, setManualKeyword] = useState<string>('');
  const [activeKeywords, setActiveKeywords] = useState<string[]>(DEFAULT_MONITORED_KEYWORDS);
  const [newCustomTag, setNewCustomTag] = useState<string>('');
  // Default to Googlebot Search Console emulation
  const [userAgentMode, setUserAgentMode] = useState<'desktop' | 'googlebot' | 'mobile'>('googlebot');
  const [showingDecoyScript, setShowingDecoyScript] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DomainCheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'script' | 'phising' | 'rich-results' | 'meta' | 'headers'>('script');

  // Search inside script viewer
  const [scriptSearch, setScriptSearch] = useState<string>('');
  const [selectedHighlightLine, setSelectedHighlightLine] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Quick preset domains
  const PRESET_DOMAINS = [
    { 
      name: '🚨 coletivomission.com (Bigo 4D Spacing)', 
      url: 'https://coletivomission.com', 
      hint: 'Varian: bigo 4d, bigo 4 d, bigo 4d login' 
    },
    { 
      name: '🚨 curacaoexport/gallery/ (ZEUS711)', 
      url: 'https://curacaoexport.vladesigns.com/gallery/index.html', 
      hint: 'Index Google: Phising Zeus711' 
    },
    { 
      name: '🌐 curacaoexport (Root Domain)', 
      url: 'https://curacaoexport.vladesigns.com', 
      hint: 'Deteksi Sitemap Cloaking Google' 
    },
    { 
      name: '🔥 circuit-mornay.fr (Zeus711)', 
      url: 'https://www.circuit-mornay.fr/mornay-festival/', 
      hint: 'Target Zeus711' 
    },
    { 
      name: 'Google.com', 
      url: 'https://google.com', 
      hint: 'Contoh Bersih' 
    }
  ];

  const handleInspect = async (overrideUrl?: string) => {
    const target = (overrideUrl || urlInput).trim();
    if (!target) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSelectedHighlightLine(null);
    setShowingDecoyScript(false);

    try {
      const res = await fetch('/api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: target,
          userAgentMode
        })
      });

      const data: DomainCheckResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Gagal membaca domain (${res.status})`);
      }

      setResult(data);
    } catch (err: any) {
      console.error('Error inspecting domain:', err);
      setErrorMsg(err.message || 'Gagal menghubungi server untuk inspeksi domain. Pastikan domain aktif dan dapat diakses.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for analyzing pasted raw HTML from Google Search Console / DevTools
  const handleAnalyzeRawConsole = () => {
    const raw = rawConsoleHtml.trim();
    if (!raw) {
      setErrorMsg('Harap tempelkan script HTML dari Google Search Console terlebih dahulu.');
      return;
    }

    setErrorMsg(null);
    setSelectedHighlightLine(null);

    const syntheticResponse: DomainCheckResponse = {
      success: true,
      targetUrl: 'Google Search Console (Raw DOM / Tested Page)',
      finalUrl: 'Google Search Console URL Inspection',
      status: 200,
      statusText: 'Console Rendered Output',
      responseTimeMs: 0,
      contentType: 'text/html; charset=UTF-8',
      contentLength: raw.length,
      headers: {
        'source': 'Google Search Console Tested Page HTML',
        'rendered-by': 'Googlebot Headless Chromium',
      },
      html: raw,
      isHttps: true,
      usedUA: 'Googlebot Smartphone (Search Console Live Inspection)'
    };

    setResult(syntheticResponse);
    setActiveTab('script');
  };

  // Add a new custom keyword to the monitored list
  const handleAddKeyword = () => {
    const trimmed = newCustomTag.trim();
    if (!trimmed) return;
    if (!activeKeywords.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      setActiveKeywords(prev => [...prev, trimmed]);
    }
    setNewCustomTag('');
  };

  // Remove a keyword from list
  const handleRemoveKeyword = (kwToRemove: string) => {
    setActiveKeywords(prev => prev.filter(k => k.toLowerCase() !== kwToRemove.toLowerCase()));
  };

  // Reset to default 28 keywords
  const handleResetKeywords = () => {
    setActiveKeywords(DEFAULT_MONITORED_KEYWORDS);
    setManualKeyword('');
  };

  // Calculate active HTML (Google Console Script vs Decoy Root Script)
  const activeHtml = useMemo(() => {
    if (!result) return '';
    if (showingDecoyScript && result.googleConsoleCloaking?.decoyHtml) {
      return result.googleConsoleCloaking.decoyHtml;
    }
    return result.html || '';
  }, [result, showingDecoyScript]);

  // Comprehensive Parsing of HTML: Phishing detection, keywords scanner, JSON-LD, Meta, Forms
  const parsedData = useMemo(() => {
    if (!activeHtml) return null;

    const html = activeHtml;
    const htmlLower = html.toLowerCase();
    const lines = html.split('\n');

    // 1. Scan for 28 HS Group Brands & Variations (Non-monotonous: Spacing, affixes, root context)
    const scanResult = scanDocumentForBrands(html, activeKeywords, manualKeyword);
    const detectedKeywords: { 
      keyword: string; 
      canonical: string;
      root: string;
      suffix: string;
      count: number; 
      variants: string[];
      lines: number[]; 
      snippets: { lineNum: number; text: string; matchedVariant: string }[];
      isManual?: boolean;
    }[] = scanResult.detectedBrands.map(b => ({
      keyword: b.brand,
      canonical: b.canonical,
      root: b.root,
      suffix: b.suffix,
      count: b.count,
      variants: b.variants,
      lines: b.lines,
      snippets: b.snippets,
      isManual: b.isManual
    }));

    // Check if any manual keyword has match
    const manualKeywordMatch = manualKeyword.trim() 
      ? detectedKeywords.find(d => d.isManual || d.keyword.toLowerCase() === manualKeyword.trim().toLowerCase()) 
      : null;

    // 2. Extract Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '(Tanpa Title)';

    // 3. Extract Meta tags
    const metaList: { name: string; content: string; property?: string }[] = [];
    const metaRegex = /<meta\s+([^>]*?)>/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      const attrs = match[1];
      const nameMatch = attrs.match(/(?:name|property|http-equiv)=["']([^"']*)["']/i);
      const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
      if (nameMatch && contentMatch) {
        metaList.push({
          name: nameMatch[1],
          content: contentMatch[1]
        });
      }
    }

    // 4. Extract JSON-LD (Rich Results)
    const jsonLdBlocks: any[] = [];
    const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1].trim());
        jsonLdBlocks.push(parsed);
      } catch {
        jsonLdBlocks.push({ raw: jsonLdMatch[1].trim() });
      }
    }

    // 5. Extract OpenGraph & Twitter tags
    const ogTags = metaList.filter(m => m.name.startsWith('og:'));
    const twitterTags = metaList.filter(m => m.name.startsWith('twitter:'));

    // 6. Extract Scripts
    const scriptTags: { src?: string; inline?: string; length: number }[] = [];
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      const attrs = scriptMatch[1];
      const inline = scriptMatch[2].trim();
      const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
      scriptTags.push({
        src: srcMatch ? srcMatch[1] : undefined,
        inline: inline || undefined,
        length: inline.length
      });
    }

    // 7. Extract Forms (Phishing Vector detection)
    const forms: { action?: string; method?: string; inputs: string[] }[] = [];
    const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
    let formMatch;
    while ((formMatch = formRegex.exec(html)) !== null) {
      const attrs = formMatch[1];
      const formContent = formMatch[2];
      const actionMatch = attrs.match(/action=["']([^"']*)["']/i);
      const methodMatch = attrs.match(/method=["']([^"']*)["']/i);
      
      const inputNames: string[] = [];
      const inputRegex = /<input\b[^>]*name=["']([^"']*)["']/gi;
      let inpMatch;
      while ((inpMatch = inputRegex.exec(formContent)) !== null) {
        inputNames.push(inpMatch[1]);
      }

      forms.push({
        action: actionMatch ? actionMatch[1] : '(same page)',
        method: methodMatch ? methodMatch[1].toUpperCase() : 'GET',
        inputs: inputNames
      });
    }

    // 8. General Security & Anomaly Indicators
    const phishingIndicators: { severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'; title: string; desc: string }[] = [];

    // Prioritized Brand Phishing Alert
    if (detectedKeywords.length > 0) {
      const brandNames = detectedKeywords.map(k => k.keyword.toUpperCase()).join(', ');
      const brandNamesWithVariants = detectedKeywords.map(k => 
        `${k.keyword.toUpperCase()} [Varian: ${k.variants.slice(0, 3).map(v => `"${v}"`).join(', ')}]`
      ).join('; ');
      const totalMatches = scanResult.totalMatches;
      phishingIndicators.push({
        severity: 'CRITICAL',
        title: `🚨 TERDETEKSI PHISING BRAND: ${brandNames}`,
        desc: `Domain ini menyisipkan ${totalMatches}x kata kunci brand HS Group (${brandNamesWithVariants}) di dalam script HTML. Ini adalah indikasi kuat pembajakan / web phising terhadap situs ${brandNames}.`
      });
    }

    // Obfuscated JS patterns
    if (html.includes('eval(') || html.includes('unescape(') || html.includes('fromCharCode')) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Terdeteksi Obfuscated / Executable JS (eval/unescape)',
        desc: 'Script mengandung pemanggilan eval() atau unescape() yang lazim dipakai untuk menyembunyikan payload injeksi phishing.'
      });
    }

    // Hidden iframes
    if (/<iframe[^>]*(display\s*:\s*none|visibility\s*:\s*hidden|width=["']0["'])/i.test(html)) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Terdeteksi Hidden IFrame (Iframe Tersembunyi)',
        desc: 'Halaman memuat iframe dengan dimensi 0 atau style display:none yang berpotensi melakukan clickjacking.'
      });
    }

    // Forced redirects
    if (html.includes('window.location.replace') || html.includes('document.location.href') || /http-equiv=["']refresh["']/i.test(html)) {
      phishingIndicators.push({
        severity: 'MEDIUM',
        title: 'Script Redirect Otomatis Ditemukan',
        desc: 'Halaman memiliki mekanisme redirect script browser (window.location / meta refresh).'
      });
    }

    // External Form Target
    try {
      const currentHost = new URL(result.finalUrl || 'https://example.com').hostname;
      const externalForms = forms.filter(f => f.action && f.action.startsWith('http') && !f.action.includes(currentHost));
      if (externalForms.length > 0) {
        phishingIndicators.push({
          severity: 'HIGH',
          title: 'Form Submission Mengarah ke Domain Eksternal',
          desc: `Terdapat form yang mengirim data ke domain lain: ${externalForms.map(f => f.action).join(', ')}`
        });
      }
    } catch {
      // ignore
    }

    // Clean status fallback
    if (phishingIndicators.length === 0) {
      phishingIndicators.push({
        severity: 'INFO',
        title: 'Script Bersih & Tidak Ditemukan Indikasi Phising',
        desc: 'Struktur kode HTML wajar, tidak mengandung kata kunci target brand ataupun injeksi tersembunyi.'
      });
    }

    // Line lookup map for highlights in the viewer (with brand names and matched variants)
    const lineHighlightMap = scanResult.highlightMap;

    return {
      pageTitle,
      metaList,
      jsonLdBlocks,
      ogTags,
      twitterTags,
      scriptTags,
      forms,
      phishingIndicators,
      detectedKeywords,
      manualKeywordMatch,
      lineHighlightMap,
      totalLines: lines.length,
      lines
    };
  }, [result, activeHtml, activeKeywords, manualKeyword]);

  // Jump to specific line in script viewer
  const scrollToLine = (lineNum: number) => {
    setActiveTab('script');
    setSelectedHighlightLine(lineNum);
    
    setTimeout(() => {
      const lineElem = document.getElementById(`code-line-${lineNum}`);
      if (lineElem) {
        lineElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCopyScript = () => {
    if (!activeHtml) return;
    navigator.clipboard.writeText(activeHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySummary = () => {
    if (!result || !parsedData) return;
    const isPhishing = parsedData.detectedKeywords.length > 0;
    const summary = `=== HS GROUP 711 - LAPORAN INSPEKSI SCRIPT & AUDIT PHISING ===
Target Domain  : ${result.targetUrl}
Final URL      : ${result.finalUrl}
HTTP Status    : ${result.status} ${result.statusText}
Response Time  : ${result.responseTimeMs} ms
Keamanan SSL   : ${result.isHttps ? 'SECURE (HTTPS)' : 'UNSECURE (HTTP)'}
Judul Halaman  : ${parsedData.pageTitle}
Total Baris    : ${parsedData.totalLines} baris (${(activeHtml.length / 1024).toFixed(2)} KB)

STATUS AUDIT PHISING:
${isPhishing 
  ? `🚨 BAHAYA: TERDETEKSI PHISING TERHADAP BRAND [${parsedData.detectedKeywords.map(k => k.keyword.toUpperCase()).join(', ')}]!
Ditemukan di baris: ${parsedData.detectedKeywords.map(k => `${k.keyword.toUpperCase()} (${k.count}x di baris ${k.lines.slice(0, 10).join(', ')})`).join(' | ')}` 
  : '✅ BERSIH: Tidak ditemukan kata kunci phising brand.'}

Indikator Keamanan Lain:
${parsedData.phishingIndicators.map(p => `[${p.severity}] ${p.title} - ${p.desc}`).join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!activeHtml) return;
    let safeHost = 'page-source';
    try {
      safeHost = new URL(result.finalUrl).hostname.replace(/[^a-zA-Z0-9]/g, '_');
    } catch {
      // ignore
    }
    const blob = new Blob([activeHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `script-page-${safeHost}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasPhishingAlert = parsedData && parsedData.detectedKeywords.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#121218]/95 via-[#181824]/95 to-[#121218]/95 border border-[#00F3FF]/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,243,255,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00F3FF]/20 to-purple-500/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-inner">
            <Code2 className="w-6 h-6 text-[#00F3FF]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2 font-['Rajdhani'] uppercase">
              <span>PHISING CHECKER & PAGE SCRIPT INSPECTOR</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 font-bold">
                RICH RESULTS ENGINE
              </span>
            </h1>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              Membaca & menganalisis script page domain secara instan layaknya Google Rich Results Test & mendeteksi injeksi phising brand secara otomatis.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopySummary}
            disabled={!result}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F1F28] hover:bg-[#2A2A38] text-gray-200 border border-white/10 text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCheck className="w-4 h-4 text-[#00F3FF]" />}
            <span>{copiedSummary ? 'Laporan Disalin!' : 'Salin Laporan Audit'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Input Card: URL Domain & Keyword Search */}
      <div className="p-5 rounded-2xl bg-[#141418]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
        {/* Mode Selector: Direct URL vs Raw Google Search Console Script */}
        <div className="flex items-center gap-2 p-1 bg-[#0A0A0C] rounded-xl border border-white/15 w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              inputMode === 'url'
                ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Inspeksi URL Domain & Google Index</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('raw_console')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              inputMode === 'raw_console'
                ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Paste Script Google Search Console (Raw HTML)</span>
          </button>
        </div>

        {inputMode === 'url' ? (
          /* Mode 1: URL Domain Bar */
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleInspect();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-2.5">
              {/* Domain input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Globe className="w-4 h-4 text-[#00F3FF]" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Tempel URL atau domain yang mau dicek (contoh: https://curacaoexport.vladesigns.com)..."
                  className="w-full pl-10 pr-10 py-3 bg-[#0A0A0C] border border-white/15 rounded-xl text-white placeholder-gray-500 font-mono text-xs sm:text-sm focus:outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Agent Selector */}
              <div className="flex items-center gap-1 bg-[#0A0A0C] p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setUserAgentMode('googlebot')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    userAgentMode === 'googlebot'
                      ? 'bg-yellow-400 text-black font-extrabold shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Mode Google Search Console (Googlebot Mobile + Emulasi Google Headers)"
                >
                  🤖 Google Search Console (Bot)
                </button>
                <button
                  type="button"
                  onClick={() => setUserAgentMode('desktop')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    userAgentMode === 'desktop'
                      ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Browser Desktop Chrome Standar"
                >
                  💻 Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setUserAgentMode('mobile')}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    userAgentMode === 'mobile'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="User-Agent Mobile iPhone / Safari"
                >
                  📱 Mobile
                </button>
              </div>

              {/* Submit Inspect Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] via-[#00c8e6] to-[#0096c7] hover:from-[#38f8ff] hover:to-[#00b4d8] text-black font-extrabold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>MEMBACA SCRIPT...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-black" />
                    <span>INSPEKSI SCRIPT DOMAIN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Paste Raw Script Google Console */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <Code2 className="w-4 h-4" />
                <span>TEMPEL HASIL SCRIPT DARI GOOGLE SEARCH CONSOLE / GOOGLE RICH RESULTS:</span>
              </span>
              <button
                type="button"
                onClick={() => setRawConsoleHtml('')}
                className="text-gray-500 hover:text-white underline cursor-pointer"
              >
                Bersihkan
              </button>
            </div>

            <textarea
              rows={6}
              value={rawConsoleHtml}
              onChange={(e) => setRawConsoleHtml(e.target.value)}
              placeholder="Paste kode HTML lengkap yang diambil dari Google Search Console (Halaman yang Diuji / URL Inspection > View Tested Page)..."
              className="w-full p-3 bg-[#0A0A0C] border border-yellow-500/30 rounded-xl text-yellow-200 placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-yellow-400 transition-all font-mono leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-gray-400">
                {rawConsoleHtml.length > 0 ? `${rawConsoleHtml.length.toLocaleString()} karakter script siap dianalisa` : 'Tempel kode HTML untuk langsung mengaudit baris phising'}
              </span>

              <button
                type="button"
                onClick={handleAnalyzeRawConsole}
                disabled={!rawConsoleHtml.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>ANALISA SCRIPT GOOGLE CONSOLE</span>
              </button>
            </div>
          </div>
        )}

        {/* Row 2: Dedicated Manual Keyword Search & Live Filter */}
        <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400">
              <Search className="w-3.5 h-3.5" />
              <span>CARI KATA KUNCI MANUAL DALAM SCRIPT:</span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              {parsedData && manualKeyword.trim() && (
                <span className={parsedData.manualKeywordMatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {parsedData.manualKeywordMatch 
                    ? `⚠️ Ditemukan ${parsedData.manualKeywordMatch.count}x kemunculan untuk "${manualKeyword}"` 
                    : `✓ Kata kunci "${manualKeyword}" tidak ditemukan dalam script`}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={manualKeyword}
                onChange={(e) => setManualKeyword(e.target.value)}
                placeholder="Ketik kata kunci manual yang ingin dicari (contoh: zeus711, slot, deposit, whatsapp, login)..."
                className="w-full pl-3.5 pr-10 py-2 bg-[#050508] border border-yellow-500/30 rounded-lg text-yellow-200 placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-yellow-400 transition-all font-bold"
              />
              {manualKeyword && (
                <button
                  type="button"
                  onClick={() => setManualKeyword('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick add to monitored tag */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  value={newCustomTag}
                  onChange={(e) => setNewCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="+ Brand Baru..."
                  className="w-full px-3 py-2 bg-[#050508] border border-white/10 rounded-lg text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!newCustomTag.trim()}
                className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Collapsible Monitored Keyword Cloud */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
              <span className="flex items-center gap-1.5 text-[#00F3FF] font-bold">
                <Tag className="w-3 h-3" />
                <span>28 KEYWORD OTOMATIS MONITORING PHISING ({activeKeywords.length} Brand Aktif):</span>
              </span>
              <button
                type="button"
                onClick={handleResetKeywords}
                className="text-gray-400 hover:text-yellow-400 cursor-pointer underline"
                title="Reset daftar kata kunci ke 28 default brand"
              >
                Reset Default
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {activeKeywords.map((kw) => {
                const isMatched = parsedData?.detectedKeywords.some(d => d.keyword.toLowerCase() === kw.toLowerCase());
                const matchObj = parsedData?.detectedKeywords.find(d => d.keyword.toLowerCase() === kw.toLowerCase());
                
                return (
                  <span
                    key={kw}
                    onClick={() => {
                      setManualKeyword(kw);
                      if (matchObj && matchObj.lines.length > 0) {
                        scrollToLine(matchObj.lines[0]);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      isMatched 
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    }`}
                  >
                    <span>{kw}</span>
                    {isMatched && (
                      <span className="px-1 py-0.2 rounded bg-rose-500 text-white font-black text-[9px]">
                        {matchObj?.count}x
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeyword(kw);
                      }}
                      className="ml-0.5 text-gray-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Contoh Uji Cepat:
          </span>
          {PRESET_DOMAINS.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setUrlInput(p.url);
                handleInspect(p.url);
              }}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                p.url.includes('circuit-mornay') 
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 font-bold shadow-[0_0_12px_rgba(244,63,94,0.25)]' 
                  : 'bg-[#1D1D24] hover:bg-[#252532] text-gray-300 hover:text-[#00F3FF] border-white/10'
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[9px] opacity-70">({p.hint})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-3 text-rose-300 text-xs font-mono shadow-lg animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold block text-sm">Gagal Menginspeksi Domain:</span>
            <span className="text-xs text-rose-200/90">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* PRIMARY PHISHING DANGER / SAFETY BANNER ALERT (Triggered by user's exact specification) */}
      {result && parsedData && (
        <div className="space-y-4">
          {/* ⚡ GOOGLE SEARCH CONSOLE CLOAKING BUSTER ALERT CARD */}
          {result.googleConsoleCloaking && result.googleConsoleCloaking.detected && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#191306]/95 to-amber-950/90 border-2 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.3)] space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-3 rounded-xl bg-yellow-400/20 border border-yellow-400 text-yellow-300 flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400 text-black font-black uppercase tracking-wider">
                        HASIL GOOGLE SEARCH CONSOLE CLOAKING
                      </span>
                      <span className="text-xs text-yellow-300 font-mono font-bold">
                        Trik Penyamaran Halaman Sukses Ditembus
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white font-['Rajdhani'] uppercase tracking-wider mt-1">
                      GOOGLE SEARCH CONSOLE MEMBACA SCRIPT PADA:{' '}
                      <span className="text-yellow-300 underline font-mono text-sm break-all">
                        {result.googleConsoleCloaking.activeScriptUrl}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-300 font-mono mt-1 leading-relaxed">
                      Halaman utama (<span className="text-gray-400 underline">{result.targetUrl}</span>) sengaja dibuat bersih sebagai umpan. Namun Google Search Console membaca dan meng-index subhalaman phising dengan judul 
                      <span className="text-yellow-200 font-bold"> &quot;{result.googleConsoleCloaking.cloakedPageTitle}&quot;</span> yang membajak brand 
                      <span className="text-rose-400 font-black uppercase"> {result.googleConsoleCloaking.detectedBrands.join(', ')}</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggle between Google Console script and Decoy script */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-gray-300 font-bold">Tampilan Script:</span>
                  <button
                    type="button"
                    onClick={() => setShowingDecoyScript(false)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !showingDecoyScript
                        ? 'bg-yellow-400 text-black font-black shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                        : 'bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>🚨 Script Hasil Google Search Console ({result.googleConsoleCloaking.detectedBrands[0]?.toUpperCase()})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowingDecoyScript(true)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      showingDecoyScript
                        ? 'bg-[#00F3FF] text-black font-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                        : 'bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 Script Decoy (Halaman Depan Umpan)</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-yellow-300/80">
                  {!showingDecoyScript ? '✓ Menampilkan script yang dibaca Google Search Console' : 'Menampilkan script halaman depan'}
                </div>
              </div>
            </div>
          )}

          {/* ⚡ USER-AGENT CLOAKING BUSTER ALERT CARD */}
          {result.userAgentCloaking && result.userAgentCloaking.detected && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/90 via-[#1a0f05]/95 to-orange-950/90 border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] space-y-3 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500 text-orange-400 flex-shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500 text-black font-black uppercase tracking-wider">
                      USER-AGENT CLOAKING TERDETEKSI
                    </span>
                    <span className="text-xs text-orange-300 font-mono font-bold">
                      Respon Server Berbeda Antara Googlebot vs Browser Biasa
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-mono leading-relaxed">
                    Sistem mendeteksi situs ini menerapkan penyamaran berbasis User-Agent: Script yang disajikan kepada <span className="text-yellow-300 font-bold">Googlebot (Google Search Console)</span> mengandung pembajakan brand <span className="text-rose-400 font-black uppercase">{result.userAgentCloaking.botBrands.join(', ') || 'PHISING'}</span>, sementara browser umum disajikan halaman berbeda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasPhishingAlert ? (
            /* 🚨 PHISHING DETECTED CRITICAL ALERT BANNER */
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-rose-950/80 border-2 border-rose-500/90 shadow-[0_0_35px_rgba(244,63,94,0.35)] animate-in fade-in space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/30 border border-rose-400 text-rose-300 flex-shrink-0">
                    <ShieldAlert className="w-7 h-7 text-rose-400 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-white font-black uppercase tracking-wider">
                        PERINGATAN PHISING TERDETEKSI!
                      </span>
                      <span className="text-xs text-rose-300 font-mono">
                        Domain Terindikasi Melakukan Pembajakan Brand
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white font-['Rajdhani'] uppercase tracking-wider mt-0.5">
                      DOMAIN <span className="text-yellow-300 underline">{result.googleConsoleCloaking && !showingDecoyScript ? result.googleConsoleCloaking.activeScriptUrl : result.finalUrl}</span> MELAKUKAN PHISING KEPADA SITUS{' '}
                      <span className="text-rose-300 underline font-black">
                        {parsedData.detectedKeywords.map(k => `${k.keyword.toUpperCase()} (Varian: ${k.variants.slice(0, 3).map(v => `"${v}"`).join(', ')})`).join(' & ')}
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (parsedData.detectedKeywords[0]?.lines[0]) {
                        scrollToLine(parsedData.detectedKeywords[0].lines[0]);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Injeksi Script</span>
                  </button>
                </div>
              </div>

              {/* Keyword & Variant match breakdown badges */}
              <div className="p-3 rounded-xl bg-black/50 border border-rose-500/30 space-y-2.5">
                <div className="text-xs text-rose-200 font-mono font-bold flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Rincian Kata Kunci & Variasi Penulisan yang Ditemukan di dalam Script:</span>
                  </div>
                  <span className="text-[10px] text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded">
                    ⚡ Mode Analisis Multi-Varian Aktif
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {parsedData.detectedKeywords.map((dk) => (
                    <div 
                      key={dk.keyword}
                      className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-xs font-mono space-y-1.5 text-rose-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm font-['Rajdhani']">{dk.keyword.toUpperCase()}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/40 text-rose-300 font-black text-[10px]">
                          {dk.count}x kemunculan
                        </span>
                        <button
                          type="button"
                          onClick={() => scrollToLine(dk.lines[0])}
                          className="text-[10px] text-yellow-300 hover:text-white underline cursor-pointer font-bold"
                          title="Langsung lompat ke baris kemunculan di script"
                        >
                          (Baris #{dk.lines.slice(0, 3).join(', ')}{dk.lines.length > 3 ? '...' : ''})
                        </button>
                      </div>

                      {/* Display individual detected variants */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] text-gray-400 font-bold">Varian:</span>
                        {dk.variants.map((v, vIdx) => (
                          <button
                            key={vIdx}
                            type="button"
                            onClick={() => {
                              const snip = dk.snippets.find(s => s.matchedVariant.toLowerCase() === v.toLowerCase());
                              if (snip) scrollToLine(snip.lineNum);
                              else scrollToLine(dk.lines[0]);
                            }}
                            className="px-1.5 py-0.5 rounded bg-black/60 border border-rose-400/40 text-yellow-300 text-[10px] font-bold hover:bg-rose-500 hover:text-white cursor-pointer transition-colors"
                            title={`Lompat ke kode baris varian "${v}"`}
                          >
                            "{v}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 🛡️ CLEAN SAFETY BANNER */
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-md flex items-center gap-3 text-emerald-300 font-mono text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-emerald-200">
                  SCRIPT BERSIH: Tidak Ditemukan Indikasi Phising Brand HS GROUP
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Tidak terdapat kata kunci dari {activeKeywords.length} brand yang dimonitor pada kode sumber domain ini.
                </p>
              </div>
            </div>
          )}

          {/* SITEMAP DISCOVERY / GOOGLE SEARCH CONSOLE INDEXED SUBPAGES */}
          {result.sitemapDiscovery && result.sitemapDiscovery.found && result.sitemapDiscovery.pages && result.sitemapDiscovery.pages.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/25 to-amber-950/40 border-2 border-amber-500/50 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-black font-black uppercase">
                        GOOGLE CONSOLE & SITEMAP CLOAKING
                      </span>
                      <span className="text-xs text-amber-300 font-mono font-bold">
                        Ditemukan {result.sitemapDiscovery.pages.length} Halaman Ter-index Google
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">
                      Target mengelabui crawler dengan menyembunyikan konten phising di subhalaman sitemap (<span className="text-amber-300 underline font-bold">{result.sitemapDiscovery.sitemapUrl}</span>) yang dibaca oleh Google:
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {result.sitemapDiscovery.pages.map((page, idx) => {
                  const isCurrent = result.targetUrl === page.url || result.finalUrl === page.url || (result.finalUrl && page.url.includes(result.finalUrl.replace(/\/$/, '')));
                  const hasZeus = page.detectedBrands.some(b => b.toLowerCase().includes('zeus711'));

                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-[#00F3FF]/15 border-[#00F3FF]/60 shadow-[0_0_15px_rgba(0,243,255,0.25)] ring-1 ring-[#00F3FF]'
                          : hasZeus
                            ? 'bg-rose-950/50 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                            : 'bg-black/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 font-bold">
                            HTTP {page.status} OK
                          </span>
                          {hasZeus && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-white font-black animate-pulse">
                              🚨 TARGET PHISING: ZEUS711
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00F3FF] text-black font-black">
                              SEDANG DIPERIKSA
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-mono font-bold text-white line-clamp-1" title={page.title}>
                          {page.title || page.url}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400 break-all mt-0.5">
                          {page.url}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                        <div className="flex flex-wrap gap-1">
                          {page.detectedBrands.map(b => (
                            <span 
                              key={b} 
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                b.toLowerCase() === 'zeus711' 
                                  ? 'bg-rose-500 text-white font-black shadow-sm' 
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setUrlInput(page.url);
                            setInputMode('url');
                            handleInspect(page.url);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00F3FF]/20 hover:bg-[#00F3FF]/30 text-[#00F3FF] border border-[#00F3FF]/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Muat Ulang' : 'Buka Script Halaman Ini'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#141418]/90 border border-white/10 backdrop-blur-md">
            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">HTTP Response Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${result.status < 400 ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></span>
                <span className={`text-sm font-bold font-mono ${result.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.status} {result.statusText || 'OK'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Protokol Keamanan</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-bold font-mono">
                {result.isHttps ? (
                  <span className="text-[#00F3FF] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> HTTPS (SSL Terenkripsi)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" /> HTTP (Non-SSL / Berisiko)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Ukuran Script HTML</span>
              <div className="text-sm font-bold font-mono text-yellow-400 mt-1">
                {(activeHtml.length / 1024).toFixed(1)} KB ({parsedData.totalLines} Baris)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Response Time</span>
              <div className="text-sm font-bold font-mono text-purple-400 mt-1">
                {result.responseTimeMs} ms
              </div>
            </div>
          </div>

          {/* Tab Navigation (Google Rich Results Style) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'script'
                  ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Script Page HTML ({parsedData.totalLines} baris)</span>
            </button>

            <button
              onClick={() => setActiveTab('phising')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'phising'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                Audit Phising & Injeksi {hasPhishingAlert && `(${parsedData.detectedKeywords.length} Temuan)`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rich-results')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'rich-results'
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Rich Results & Schema.org ({parsedData.jsonLdBlocks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('meta')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'meta'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Meta & SEO ({parsedData.metaList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('headers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'headers'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>HTTP Headers ({Object.keys(result.headers).length})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: SCRIPT PAGE VIEWER (GOOGLE RICH RESULTS TEST STYLE) */}
          {/* ========================================================================= */}
          {activeTab === 'script' && (
            <div className="rounded-2xl bg-[#0A0A0E] border border-white/15 overflow-hidden shadow-2xl space-y-0">
              {/* Code Bar Controls */}
              <div className="p-3.5 bg-[#14141A] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={scriptSearch}
                      onChange={(e) => setScriptSearch(e.target.value)}
                      placeholder="Cari kode di viewer script (tag, kata, class, script)..."
                      className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#08080C] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#00F3FF]"
                    />
                    {scriptSearch && (
                      <button 
                        onClick={() => setScriptSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Jump directly to detected keywords */}
                  {parsedData.detectedKeywords.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      <span className="text-[10px] text-rose-300 font-mono font-bold flex-shrink-0">
                        Lompat ke Temuan:
                      </span>
                      {parsedData.detectedKeywords.map(dk => (
                        <button
                          key={dk.keyword}
                          onClick={() => scrollToLine(dk.lines[0])}
                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold cursor-pointer whitespace-nowrap"
                        >
                          {dk.keyword} (#{dk.lines[0]})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F28] hover:bg-[#282836] text-gray-200 text-xs font-mono font-bold transition-all cursor-pointer border border-white/10"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00F3FF]" />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
                  </button>

                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F28] hover:bg-[#282836] text-gray-200 text-xs font-mono font-bold transition-all cursor-pointer border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Download .HTML</span>
                  </button>
                </div>
              </div>

              {/* Script Source Code Display with Exact Line Numbers */}
              <div 
                ref={codeContainerRef}
                className="max-h-[650px] overflow-y-auto p-4 font-mono text-xs bg-[#060609] text-gray-300 selection:bg-[#00F3FF] selection:text-black"
              >
                <div className="font-mono text-xs leading-relaxed space-y-0.5">
                  {parsedData.lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const highlightInfo = parsedData.lineHighlightMap.get(lineNum);
                    const isSearchMatch = scriptSearch.trim() && line.toLowerCase().includes(scriptSearch.trim().toLowerCase());
                    const isSelected = selectedHighlightLine === lineNum;

                    return (
                      <div 
                        key={idx}
                        id={`code-line-${lineNum}`}
                        className={`flex items-start py-0.5 px-1 rounded transition-colors ${
                          isSelected
                            ? 'bg-purple-500/30 border-l-4 border-purple-400 text-white font-bold'
                            : highlightInfo
                              ? 'bg-rose-950/50 border-l-4 border-rose-500 text-rose-200 font-semibold'
                              : isSearchMatch
                                ? 'bg-yellow-400/20 border-l-4 border-yellow-400 text-yellow-200 font-bold'
                                : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Line number */}
                        <span className="w-14 text-right pr-4 select-none text-gray-600 text-[10px] flex-shrink-0 pt-0.5">
                          {lineNum}
                        </span>

                        {/* Code line content */}
                        <div className="flex-1 whitespace-pre-wrap break-all overflow-x-auto">
                          {highlightInfo && (
                            <span className="mr-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider">
                              <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                              <span>
                                PHISING [{highlightInfo.brandNames.join(', ')}: {highlightInfo.variants.slice(0, 2).map(v => `"${v}"`).join(', ')}]
                              </span>
                            </span>
                          )}
                          <code>{line}</code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AUDIT PHISING & INJEKSI SCRIPT */}
          {/* ========================================================================= */}
          {activeTab === 'phising' && (
            <div className="space-y-4">
              {/* Detailed Keyword Injections Table */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-400 font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Hasil Audit Kata Kunci Phising Brand Target</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {parsedData.detectedKeywords.length} dari {activeKeywords.length} Brand Terdeteksi
                  </span>
                </div>

                {parsedData.detectedKeywords.length > 0 ? (
                  <div className="space-y-3">
                    {parsedData.detectedKeywords.map((dk) => (
                      <div 
                        key={dk.keyword}
                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 font-mono text-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-rose-200 border-b border-rose-500/20 pb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white font-['Rajdhani']">
                              BRAND: {dk.keyword.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                              {dk.count}x Kemunculan
                            </span>
                          </div>
                          <button
                            onClick={() => scrollToLine(dk.lines[0])}
                            className="text-xs text-yellow-300 hover:text-white underline font-bold cursor-pointer"
                          >
                            Lompat ke Baris #{dk.lines[0]} &gt;&gt;
                          </button>
                        </div>

                        {/* Detected Variants Tag List */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Varian Penulisan Terdeteksi:</span>
                          {dk.variants.map((v, vIdx) => (
                            <span 
                              key={vIdx} 
                              className="px-2 py-0.5 rounded bg-rose-500/30 border border-rose-500/50 text-yellow-300 font-bold text-[11px]"
                            >
                              "{v}"
                            </span>
                          ))}
                        </div>

                        {/* Snippets of the offending lines */}
                        <div className="space-y-1.5 pt-1 border-t border-rose-500/10">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">
                            Cuplikan Baris Kode yang Terinjeksi:
                          </span>
                          {dk.snippets.map((snip, sIdx) => (
                            <div 
                              key={sIdx} 
                              onClick={() => scrollToLine(snip.lineNum)}
                              className="p-2 rounded-lg bg-black/60 border border-white/5 hover:border-rose-400 cursor-pointer transition-all"
                            >
                              <div className="text-[10px] text-yellow-400 font-bold mb-0.5 flex items-center justify-between">
                                <span>Baris #{snip.lineNum}:</span>
                                <span className="text-[9px] text-rose-300 font-normal">Cocok: "{snip.matchedVariant}"</span>
                              </div>
                              <code className="text-rose-200 break-all text-[11px] block">
                                {snip.text}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-[#0D0D10] text-center font-mono text-xs text-gray-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-300 font-bold">Tidak ada kata kunci brand yang terdeteksi di dalam script.</p>
                    <p className="text-gray-500 text-[11px]">Domain ini tidak mengandung 28 keyword monitoring HS GROUP.</p>
                  </div>
                )}
              </div>

              {/* General Security & Anomaly Indicators */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-yellow-400 font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-yellow-400" />
                  <span>Analisis Anomali & Vektor Script</span>
                </h3>

                <div className="space-y-2.5">
                  {parsedData.phishingIndicators.map((item, idx) => {
                    const isCrit = item.severity === 'CRITICAL';
                    const isHigh = item.severity === 'HIGH';
                    const isMed = item.severity === 'MEDIUM';
                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border font-mono text-xs flex items-start gap-3 ${
                          isCrit 
                            ? 'bg-rose-950/40 border-rose-500/80 text-rose-200' 
                            : isHigh 
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                              : isMed 
                                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {isCrit || isHigh ? (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        ) : isMed ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>{item.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 border border-current">
                              {item.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-300 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: RICH RESULTS & STRUCTURED DATA */}
          {/* ========================================================================= */}
          {activeTab === 'rich-results' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10">
                <h3 className="text-sm font-bold text-yellow-400 font-mono mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  JSON-LD & Schema.org Structured Data
                </h3>
                {parsedData.jsonLdBlocks.length > 0 ? (
                  <div className="space-y-3">
                    {parsedData.jsonLdBlocks.map((block, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#0A0A0C] border border-white/10 font-mono text-xs">
                        <div className="text-yellow-300 font-bold mb-2 pb-1 border-b border-white/10 flex items-center justify-between">
                          <span>Entitas #{idx + 1} ({block['@type'] || 'JSON-LD Data'})</span>
                          <span className="text-[10px] text-gray-400">{block['@context'] || 'Schema'}</span>
                        </div>
                        <pre className="text-emerald-300 overflow-x-auto p-2 bg-black/40 rounded-lg max-h-72">
                          {JSON.stringify(block, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-[#0A0A0C] text-gray-400 text-xs font-mono text-center">
                    Tidak ditemukan tag &lt;script type="application/ld+json"&gt; pada halaman ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: META & SEO */}
          {/* ========================================================================= */}
          {activeTab === 'meta' && (
            <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Daftar Tag Meta & SEO Header
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#0A0A0C] border border-white/10">
                  <span className="text-[#00F3FF] font-bold block text-[10px]">&lt;title&gt;</span>
                  <span className="text-white text-sm font-semibold">{parsedData.pageTitle}</span>
                </div>
                {parsedData.metaList.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#0A0A0C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-yellow-400 font-bold min-w-48">{m.name}</span>
                    <span className="text-gray-300 break-all">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: HTTP HEADERS */}
          {/* ========================================================================= */}
          {activeTab === 'headers' && (
            <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Header Response Server
              </h3>
              <div className="space-y-1.5">
                {Object.entries(result.headers).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-[#0A0A0C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[#00F3FF] font-bold min-w-56">{key}</span>
                    <span className="text-gray-300 break-all">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State before any inspection */}
      {!result && !isLoading && !errorMsg && (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#141418]/60 border border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#00F3FF]/10 border border-[#00F3FF]/30 flex items-center justify-center mx-auto text-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.15)]">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
            Siap Melakukan Inspeksi Phising & Script
          </h3>
          <p className="text-xs text-gray-400 font-mono max-w-md mx-auto leading-relaxed">
            Tempelkan URL domain target pada kolom di atas atau gunakan mode Paste Script Google Search Console untuk memulai audit.
          </p>
        </div>
      )}
    </div>
  );
};
