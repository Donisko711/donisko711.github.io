import React, { useState, useMemo } from 'react';
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
  FileCheck
} from 'lucide-react';

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
  error?: string;
}

export const PhisingChecker: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('https://google.com');
  const [userAgentMode, setUserAgentMode] = useState<'desktop' | 'googlebot' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DomainCheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'script' | 'rich-results' | 'phising' | 'meta' | 'headers'>('script');

  // Search in script
  const [scriptSearch, setScriptSearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Quick preset domains
  const PRESET_DOMAINS = [
    { name: 'Google.com', url: 'https://google.com' },
    { name: 'Cloudflare.com', url: 'https://cloudflare.com' },
    { name: 'Example.org', url: 'https://example.org' },
    { name: 'Wikipedia.org', url: 'https://wikipedia.org' }
  ];

  const handleInspect = async (overrideUrl?: string) => {
    const target = (overrideUrl || urlInput).trim();
    if (!target) return;

    setIsLoading(true);
    setErrorMsg(null);

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
      setErrorMsg(err.message || 'Gagal menghubungi server untuk inspeksi domain');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount with default
  React.useEffect(() => {
    handleInspect('https://example.org');
  }, []);

  // Parse HTML elements for Rich Results, Meta, Scripts, Phishing indicators
  const parsedData = useMemo(() => {
    if (!result?.html) return null;

    const html = result.html;
    
    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '(Tanpa Title)';

    // Extract Meta tags
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

    // Extract JSON-LD (Rich Results)
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

    // Extract OpenGraph tags
    const ogTags = metaList.filter(m => m.name.startsWith('og:'));
    const twitterTags = metaList.filter(m => m.name.startsWith('twitter:'));

    // Extract Scripts
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

    // Extract Forms (Phishing Vector detection)
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

    // Phishing / Malicious Script Indicators
    const phishingIndicators: { severity: 'HIGH' | 'MEDIUM' | 'INFO'; title: string; desc: string }[] = [];
    
    // 1. Obfuscated JS patterns
    if (html.includes('eval(') || html.includes('unescape(') || html.includes('fromCharCode')) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Terdeteksi Obfuscated / Executable JS (eval/unescape)',
        desc: 'Script mengandung pemanggilan eval/unescape yang lazim dipakai untuk menyembunyikan payload phishing.'
      });
    }

    // 2. Hidden iframes
    if (/<iframe[^>]*(display\s*:\s*none|visibility\s*:\s*hidden|width=["']0["'])/i.test(html)) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Terdeteksi Hidden IFrame (Iframe Tersembunyi)',
        desc: 'Halaman memuat iframe dengan dimensi 0 atau style display:none yang berpotensi melakukan clickjacking.'
      });
    }

    // 3. Forced redirects (location.replace / meta refresh)
    if (html.includes('window.location.replace') || html.includes('document.location.href') || /http-equiv=["']refresh["']/i.test(html)) {
      phishingIndicators.push({
        severity: 'MEDIUM',
        title: 'Script Redirect Otomatis Ditemukan',
        desc: 'Halaman memiliki mekanisme redirect script browser (window.location / meta refresh).'
      });
    }

    // 4. External Form Target
    const externalForms = forms.filter(f => f.action && f.action.startsWith('http') && !f.action.includes(new URL(result.finalUrl || 'https://example.com').hostname));
    if (externalForms.length > 0) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Form Submission Mengarah ke Domain Eksternal',
        desc: `Terdapat form yang mengirim data ke domain lain: ${externalForms.map(f => f.action).join(', ')}`
      });
    }

    // 5. Password inputs without HTTPS
    if (html.includes('type="password"') && !result.isHttps) {
      phishingIndicators.push({
        severity: 'HIGH',
        title: 'Input Password pada Koneksi Non-HTTPS',
        desc: 'Halaman meminta password namun tidak berjalan di atas protokol terenkripsi SSL/HTTPS.'
      });
    }

    if (phishingIndicators.length === 0) {
      phishingIndicators.push({
        severity: 'INFO',
        title: 'Tidak Ditemukan Indikator Anomali Kritis',
        desc: 'Struktur kode HTML dan form script tampak wajar tanpa injeksi obfuscation yang mencolok.'
      });
    }

    return {
      pageTitle,
      metaList,
      jsonLdBlocks,
      ogTags,
      twitterTags,
      scriptTags,
      forms,
      phishingIndicators,
      totalLines: html.split('\n').length
    };
  }, [result]);

  // Filtered HTML lines for Search
  const filteredHtmlLines = useMemo(() => {
    if (!result?.html) return [];
    const lines = result.html.split('\n');
    return lines;
  }, [result?.html]);

  const handleCopyScript = () => {
    if (!result?.html) return;
    navigator.clipboard.writeText(result.html);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySummary = () => {
    if (!result || !parsedData) return;
    const summary = `=== HS GROUP 711 - DOMAIN & SCRIPT INSPECTION REPORT ===
Target URL: ${result.targetUrl}
Final URL: ${result.finalUrl}
HTTP Status: ${result.status} ${result.statusText}
Response Time: ${result.responseTimeMs}ms
SSL / HTTPS: ${result.isHttps ? 'SECURE (HTTPS)' : 'UNSECURE (HTTP)'}
Page Title: ${parsedData.pageTitle}
Total Baris HTML: ${parsedData.totalLines} baris (${(result.contentLength / 1024).toFixed(2)} KB)
Jumlah Script Terdeteksi: ${parsedData.scriptTags.length} script
Jumlah Form Terdeteksi: ${parsedData.forms.length} form
Rich Results (JSON-LD): ${parsedData.jsonLdBlocks.length} entitas
Status Phising: ${parsedData.phishingIndicators.map(p => `[${p.severity}] ${p.title}`).join(' | ')}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!result?.html) return;
    const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `script-page-${new URL(result.finalUrl).hostname.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#121218]/90 via-[#181824]/90 to-[#121218]/90 border border-[#00F3FF]/30 backdrop-blur-xl shadow-[0_0_25px_rgba(0,243,255,0.1)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00F3FF]/20 to-purple-500/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-inner">
            <Code2 className="w-6 h-6 text-[#00F3FF]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-wide text-white flex items-center gap-2 font-sans">
              <span>PHISING CHECKER & PAGE SCRIPT INSPECTOR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40">
                PRO ENGINE
              </span>
            </h1>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              Membaca & menganalisis script page domain secara instan seperti Google Rich Results Test
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            disabled={!result}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-200 border border-white/10 text-xs font-mono transition-all disabled:opacity-40 cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCheck className="w-3.5 h-3.5 text-[#00F3FF]" />}
            <span>{copiedSummary ? 'Laporan Disalin!' : 'Salin Ringkasan'}</span>
          </button>
        </div>
      </div>

      {/* Input URL Bar & Presets */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141416]/80 border border-white/10 backdrop-blur-md shadow-lg space-y-3">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="flex flex-col md:flex-row items-stretch gap-2.5"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4 text-[#00F3FF]" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Tempel URL atau nama domain (contoh: https://google.com atau website-target.com)..."
              className="w-full pl-10 pr-4 py-3 bg-[#0A0A0C] border border-white/15 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all"
            />
          </div>

          {/* User Agent Selector */}
          <div className="flex items-center gap-1.5 bg-[#0A0A0C] p-1 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => setUserAgentMode('desktop')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                userAgentMode === 'desktop'
                  ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setUserAgentMode('googlebot')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                userAgentMode === 'googlebot'
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Googlebot
            </button>
            <button
              type="button"
              onClick={() => setUserAgentMode('mobile')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                userAgentMode === 'mobile'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mobile
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#00b4d8] hover:from-[#38f8ff] hover:to-[#0096c7] text-black font-extrabold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>MEMBACA SCRIPT...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-black" />
                <span>INSPEKSI DOMAIN</span>
              </>
            )}
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Contoh Cepat:
          </span>
          {PRESET_DOMAINS.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setUrlInput(p.url);
                handleInspect(p.url);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#1D1D22] hover:bg-[#252530] text-gray-300 hover:text-[#00F3FF] border border-white/10 transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-3 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold block">Pemeriksaan Gagal:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Result Container */}
      {result && parsedData && (
        <div className="space-y-4">
          {/* Status Metric Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#141418]/90 border border-white/10 backdrop-blur-md">
            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">HTTP Response</span>
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
                    <Lock className="w-3.5 h-3.5" /> HTTPS (SSL)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" /> HTTP (Beresiko)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Ukuran Script</span>
              <div className="text-sm font-bold font-mono text-yellow-400 mt-1">
                {(result.contentLength / 1024).toFixed(1)} KB ({parsedData.totalLines} baris)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0D10] border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Response Time</span>
              <div className="text-sm font-bold font-mono text-purple-400 mt-1">
                {result.responseTimeMs} ms
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'script'
                  ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Script Page HTML ({parsedData.totalLines})</span>
            </button>

            <button
              onClick={() => setActiveTab('rich-results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'rich-results'
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Rich Results & JSON-LD ({parsedData.jsonLdBlocks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('phising')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'phising'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Analisis Phising ({parsedData.phishingIndicators.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('meta')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'headers'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#141418] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>HTTP Headers ({Object.keys(result.headers).length})</span>
            </button>
          </div>

          {/* TAB 1: SCRIPT PAGE (RAW SOURCE CODE LIKE GOOGLE RICH RESULTS) */}
          {activeTab === 'script' && (
            <div className="rounded-2xl bg-[#0D0D10] border border-white/15 overflow-hidden shadow-2xl">
              {/* Code Bar Controls */}
              <div className="p-3 bg-[#16161C] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={scriptSearch}
                      onChange={(e) => setScriptSearch(e.target.value)}
                      placeholder="Cari di dalam script (kata kunci, function, tag)..."
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A0A0C] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F3FF] w-64"
                    />
                  </div>
                  {scriptSearch && (
                    <button 
                      onClick={() => setScriptSearch('')}
                      className="text-[10px] text-gray-400 hover:text-white font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] hover:bg-[#2E2E38] text-gray-200 text-xs font-mono transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00F3FF]" />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
                  </button>

                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] hover:bg-[#2E2E38] text-gray-200 text-xs font-mono transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Download .HTML</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="max-h-[600px] overflow-y-auto p-4 font-mono text-xs bg-[#08080A] text-gray-300 selection:bg-[#00F3FF] selection:text-black">
                <pre className="overflow-x-auto leading-relaxed">
                  {filteredHtmlLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isMatch = scriptSearch && line.toLowerCase().includes(scriptSearch.toLowerCase());
                    return (
                      <div 
                        key={idx} 
                        className={`flex hover:bg-white/5 py-0.5 px-1 rounded ${
                          isMatch ? 'bg-yellow-400/20 text-yellow-200 font-bold border-l-2 border-yellow-400' : ''
                        }`}
                      >
                        <span className="w-12 text-right pr-4 select-none text-gray-600 text-[10px]">
                          {lineNum}
                        </span>
                        <code className="flex-1 whitespace-pre-wrap break-all">
                          {line}
                        </code>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: RICH RESULTS & STRUCTURED DATA */}
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
                  <div className="p-4 rounded-xl bg-[#0A0A0C] text-gray-400 text-xs font-mono text-center">
                    Tidak ditemukan tag &lt;script type="application/ld+json"&gt; pada halaman ini.
                  </div>
                )}
              </div>

              {/* Open Graph & Twitter Card Meta */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10">
                <h3 className="text-sm font-bold text-[#00F3FF] font-mono mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00F3FF]" />
                  Open Graph & Social Share Preview
                </h3>
                {parsedData.ogTags.length > 0 || parsedData.twitterTags.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    {[...parsedData.ogTags, ...parsedData.twitterTags].map((og, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#0A0A0C] border border-white/5">
                        <span className="text-[#00F3FF] block text-[10px] font-bold">{og.name}</span>
                        <span className="text-gray-200 break-all">{og.content}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0A0A0C] text-gray-400 text-xs font-mono text-center">
                    Tidak ada tag OpenGraph / Twitter card yang terdefinisi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PHISHING & SCRIPT ANALYSIS */}
          {activeTab === 'phising' && (
            <div className="space-y-4">
              {/* Phishing Warning Items */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-rose-400 font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Pemeriksaan Keamanan Script & Indikator Anomali
                </h3>

                <div className="space-y-2.5">
                  {parsedData.phishingIndicators.map((item, idx) => {
                    const isHigh = item.severity === 'HIGH';
                    const isMed = item.severity === 'MEDIUM';
                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border font-mono text-xs flex items-start gap-3 ${
                          isHigh 
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                            : isMed 
                              ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {isHigh ? (
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

              {/* Form Actions Audit */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00F3FF]" />
                  Audit Form & Input Pengguna ({parsedData.forms.length} Form)
                </h3>
                {parsedData.forms.length > 0 ? (
                  <div className="space-y-2">
                    {parsedData.forms.map((form, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0A0A0C] border border-white/10 font-mono text-xs">
                        <div className="flex items-center justify-between text-gray-300 mb-1">
                          <span className="text-[#00F3FF] font-bold">Form #{idx + 1} ({form.method})</span>
                          <span className="text-[10px] text-gray-400">Action: {form.action}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Input Fields Terdeteksi: {form.inputs.length > 0 ? form.inputs.join(', ') : '(tanpa input text khusus)'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0A0A0C] text-gray-400 text-xs font-mono text-center">
                    Tidak ada tag form (&lt;form&gt;) yang ditemukan pada halaman ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: META & SEO */}
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

          {/* TAB 5: HTTP HEADERS */}
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
    </div>
  );
};
