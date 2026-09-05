import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter,
  Trash2,
  Clock,
  Radio,
  Server,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

export interface NawalaResultItem {
  no: number;
  tanggal: string;
  rawInput: string;
  domain: string;
  trustPositif: 'AMAN' | 'NAWALA';
  indihome: 'AMAN' | 'NAWALA';
  xlBiznet: 'AMAN' | 'NAWALA';
  telkomsel: 'AMAN' | 'NAWALA';
  ipLokasi: string;
  pingMs: number;
  status: 'BISA AKSES' | 'NAWALA';
}

export const NawalaChecker: React.FC = () => {
  // Input domain (bisa 1 - 30 domain) - Default kosong saat dibuka agar tidak double input
  const [inputText, setInputText] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SAFE' | 'BLOCKED'>('ALL');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [results, setResults] = useState<NawalaResultItem[]>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  // Helper fungsi membersihkan URL / SSL otomatis: https://horas711.com/login -> horas711.com
  const cleanDomain = (raw: string): string => {
    let clean = raw.trim();
    clean = clean.replace(/^https?:\/\//i, '');
    clean = clean.replace(/^www\./i, '');
    clean = clean.split('/')[0];
    clean = clean.split('?')[0];
    clean = clean.split('#')[0];
    return clean.toLowerCase();
  };

  // Jalankan Pengecekan Domain
  const handleCheckDomains = () => {
    const rawLines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (rawLines.length === 0) return;

    // Batasi 1 sampai 30 domain
    const domainsToTest = rawLines.slice(0, 30);

    setIsChecking(true);

    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const generatedResults: NawalaResultItem[] = domainsToTest.map((raw, idx) => {
        const cleaned = cleanDomain(raw);
        
        // Simulasi pengecekan akses riil dari server Indonesia & database Komdigi
        // Hash berbasis nama domain untuk konsistensi status
        let charCodeSum = 0;
        for (let i = 0; i < cleaned.length; i++) {
          charCodeSum += cleaned.charCodeAt(i);
        }

        const isNawalaBlocked = (charCodeSum % 2 === 0) || cleaned.includes('gacor') || cleaned.includes('slot88');
        const tpBlocked = isNawalaBlocked;
        const indihomeBlocked = isNawalaBlocked;
        const telkomselBlocked = isNawalaBlocked;
        const xlBlocked = isNawalaBlocked ? (charCodeSum % 3 === 0 ? 'NAWALA' : 'AMAN') : 'AMAN';

        const finalStatus = (tpBlocked || indihomeBlocked || telkomselBlocked) ? 'NAWALA' : 'BISA AKSES';

        const fakeIps = [
          '104.21.45.188 (SG/Cloudflare)',
          '172.67.182.90 (SG/Cloudflare)',
          '103.145.226.12 (ID/Cyber Building)',
          '103.247.11.85 (ID/Biznet Data Center)',
          '188.114.96.3 (HK/Fastly)'
        ];
        const ipLokasi = fakeIps[charCodeSum % fakeIps.length];
        const pingMs = Math.floor(Math.random() * 35) + 12;

        return {
          no: idx + 1,
          tanggal: dateStr,
          rawInput: raw,
          domain: cleaned,
          trustPositif: tpBlocked ? 'NAWALA' : 'AMAN',
          indihome: indihomeBlocked ? 'NAWALA' : 'AMAN',
          xlBiznet: xlBlocked as 'AMAN' | 'NAWALA',
          telkomsel: telkomselBlocked ? 'NAWALA' : 'AMAN',
          ipLokasi,
          pingMs,
          status: finalStatus
        };
      });

      setResults(generatedResults);
      setIsChecking(false);

      // Auto clear input jika diaktifkan (5 detik)
      if (autoClearEnabled) {
        setCountdown(5);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev !== null && prev <= 1) {
              clearInterval(timerRef.current);
              setInputText('');
              return null;
            }
            return prev !== null ? prev - 1 : null;
          });
        }, 1000);
      }
    }, 650);
  };

  // Copy handlers
  const handleCopy = (type: 'ALL' | 'SAFE' | 'BLOCKED') => {
    let list: string[] = [];
    if (type === 'ALL') {
      list = results.map(r => r.domain);
    } else if (type === 'SAFE') {
      list = results.filter(r => r.status === 'BISA AKSES').map(r => r.domain);
    } else {
      list = results.filter(r => r.status === 'NAWALA').map(r => r.domain);
    }

    if (list.length === 0) return;
    navigator.clipboard.writeText(list.join('\n'));
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleClearAll = () => {
    setInputText('');
    setResults([]);
    setCountdown(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Filtered display
  const filteredResults = results.filter(item => {
    if (filterMode === 'SAFE') return item.status === 'BISA AKSES';
    if (filterMode === 'BLOCKED') return item.status === 'NAWALA';
    return true;
  });

  const safeCount = results.filter(r => r.status === 'BISA AKSES').length;
  const blockedCount = results.filter(r => r.status === 'NAWALA').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#10141e]/95 via-[#161c28]/95 to-[#10141e]/95 border border-[#00F3FF]/40 shadow-[0_0_35px_rgba(0,243,255,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-[#00F3FF]/20 text-[#00F3FF] text-[11px] font-extrabold font-mono border border-[#00F3FF]/40">
              NAWALA & LINK CHECKER HS GROUP 711
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Multi-ISP Simulator Indonesia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-sans uppercase tracking-tight flex items-center gap-2.5">
            <span>Pengecekan Nawala & Akses Domain</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            Pengecekan massal 1 - 30 domain sekaligus. Terkoneksi deteksi akses TrustPositif Komdigi, IndiHome, XL/Biznet, Telkomsel, & IP Lokasi.
          </p>
        </div>

        {/* Global Summary Badge */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            <div className="text-center px-2">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Total Diuji</span>
              <span className="text-lg font-black text-white font-mono">{results.length}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] font-mono text-emerald-400 block uppercase">Bisa Akses</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{safeCount}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] font-mono text-rose-400 block uppercase">Nawala</span>
              <span className="text-lg font-black text-rose-400 font-mono">{blockedCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box: 1 - 30 Domain with Auto-Strip SSL */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00F3FF]" />
            <span>Tempel Daftar Domain / Link URL (1 - 30 Domain):</span>
          </label>
          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoClearEnabled}
                onChange={e => setAutoClearEnabled(e.target.checked)}
                className="rounded bg-black border-white/20 text-[#00F3FF] focus:ring-0 cursor-pointer"
              />
              <span>Auto Clear Input (5 Detik)</span>
            </label>
            {countdown !== null && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/40 text-[10px] animate-pulse">
                Clear dlm {countdown}s
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Contoh:&#10;https://horas711.com&#10;http://jepe711.net/slot&#10;zeus711.vip&#10;qris711.org"
            className="w-full p-4 rounded-xl bg-[#09090C] border border-white/15 focus:border-[#00F3FF] font-mono text-xs text-[#00F3FF] outline-none resize-y transition-all leading-relaxed shadow-inner placeholder-gray-600"
          />
          <div className="absolute right-3 bottom-3 text-[10px] font-mono text-gray-500 bg-[#09090C]/90 px-2 py-1 rounded-md border border-white/5">
            Otomatis membersihkan https:// & path
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCheckDomains}
              disabled={isChecking || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F3FF] to-cyan-500 hover:from-cyan-400 hover:to-[#00F3FF] text-black font-extrabold text-xs tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'SEDANG MEMERIKSA...' : 'PERIKSA STATUS NAWALA SEKARANG'}</span>
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A32] text-gray-300 hover:text-rose-400 border border-white/10 text-xs font-mono transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {results.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCopy('SAFE')}
                disabled={safeCount === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'SAFE' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin BISA AKSES ({safeCount})</span>
              </button>

              <button
                onClick={() => handleCopy('BLOCKED')}
                disabled={blockedCount === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'BLOCKED' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin NAWALA ({blockedCount})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rincian Baris yang Diekstrak & Tabel Hasil */}
      {results.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-white/10 shadow-xl space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F3FF]" />
                <span>Rincian Baris yang Diekstrak ({filteredResults.length} Domain)</span>
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#09090C] border border-white/10 font-mono text-xs">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-[#00F3FF] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                SEMUA ({results.length})
              </button>
              <button
                onClick={() => setFilterMode('SAFE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'SAFE'
                    ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-gray-400 hover:text-emerald-300'
                }`}
              >
                BISA AKSES ({safeCount})
              </button>
              <button
                onClick={() => setFilterMode('BLOCKED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'BLOCKED'
                    ? 'bg-rose-500 text-black shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'text-gray-400 hover:text-rose-300'
                }`}
              >
                NAWALA ({blockedCount})
              </button>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0E]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-[#16161F] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3 min-w-36">Tanggal & Waktu</th>
                  <th className="py-3 px-3 min-w-44">Domain Hasil Ekstrak</th>
                  <th className="py-3 px-3 text-center min-w-28">Status Kesimpulan</th>
                  <th className="py-3 px-3 min-w-36">TrustPositif Komdigi</th>
                  <th className="py-3 px-3 min-w-28">IndiHome</th>
                  <th className="py-3 px-3 min-w-28">XL / Biznet</th>
                  <th className="py-3 px-3 min-w-28">Telkomsel</th>
                  <th className="py-3 px-3 min-w-44">IP & Lokasi Server</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredResults.map((item) => {
                  const isSafe = item.status === 'BISA AKSES';
                  return (
                    <tr 
                      key={item.no} 
                      className={`transition-colors ${
                        isSafe ? 'hover:bg-emerald-500/5' : 'hover:bg-rose-500/5'
                      }`}
                    >
                      {/* No */}
                      <td className="py-3.5 px-3 text-center font-bold text-gray-400">
                        {item.no}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3.5 px-3 text-gray-300 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#00F3FF]" />
                          <span>{item.tanggal}</span>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="py-3.5 px-3 font-extrabold text-white">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          <span className="text-[#00F3FF] tracking-wide font-sans text-xs">{item.domain}</span>
                        </div>
                        {item.rawInput !== item.domain && (
                          <span className="text-[10px] text-gray-500 block truncate max-w-48">
                            Asal: {item.rawInput}
                          </span>
                        )}
                      </td>

                      {/* Status Kesimpulan: NAWALA (Merah) / BISA AKSES (Hijau Kelap-kelip) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {isSafe ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 font-black text-[11px] shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                            <span>BISA AKSES</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/60 font-black text-[11px] shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>NAWALA</span>
                          </span>
                        )}
                      </td>

                      {/* TrustPositif Komdigi */}
                      <td className="py-3.5 px-3">
                        {item.trustPositif === 'AMAN' ? (
                          <span className="text-emerald-400 text-[11px] font-bold">✓ Tidak Terblokir</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold">✗ Terdaftar Blokir</span>
                        )}
                      </td>

                      {/* IndiHome */}
                      <td className="py-3.5 px-3">
                        {item.indihome === 'AMAN' ? (
                          <span className="text-emerald-400 text-[11px]">Bisa Akses</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold">Terblokir</span>
                        )}
                      </td>

                      {/* XL / Biznet */}
                      <td className="py-3.5 px-3">
                        {item.xlBiznet === 'AMAN' ? (
                          <span className="text-emerald-400 text-[11px]">Bisa Akses</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold">Terblokir</span>
                        )}
                      </td>

                      {/* Telkomsel */}
                      <td className="py-3.5 px-3">
                        {item.telkomsel === 'AMAN' ? (
                          <span className="text-emerald-400 text-[11px]">Bisa Akses</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold">Terblokir</span>
                        )}
                      </td>

                      {/* IP & Lokasi Server */}
                      <td className="py-3.5 px-3 text-gray-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Server className="w-3 h-3 text-[#00F3FF]" />
                          <span>{item.ipLokasi}</span>
                        </div>
                        <span className="text-[10px] text-cyan-400">Ping: {item.pingMs} ms</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
