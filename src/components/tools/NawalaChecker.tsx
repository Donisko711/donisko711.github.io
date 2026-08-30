import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';

interface DomainCheckResult {
  domain: string;
  status: 'AMAN' | 'TERBLOKIR' | 'DNS_POISON';
  ipAddress: string;
  latencyMs: number;
  telkomselStatus: 'AMAN' | 'BLOKIR';
  indihomeStatus: 'AMAN' | 'BLOKIR';
  xlStatus: 'AMAN' | 'BLOKIR';
  biznetStatus: 'AMAN' | 'BLOKIR';
  checkedAt: string;
}

export const NawalaChecker: React.FC = () => {
  const [domainInput, setDomainInput] = useState(
    'gacorking88.com\nlinkalternatif77.xyz\nsitusresmihoki.net\nslotvipmaxwin.vip\nloginsuper88.org'
  );
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [copiedSafe, setCopiedSafe] = useState(false);

  const handleRunCheck = () => {
    const lines = domainInput
      .split('\n')
      .map(d => d.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''))
      .filter(d => d.length > 0);

    if (lines.length === 0) return;

    setIsChecking(true);

    setTimeout(() => {
      const simulatedResults: DomainCheckResult[] = lines.map(dom => {
        // Random deterministic simulation based on domain hash
        const isBlocked = dom.includes('gacor') || dom.includes('slot') || dom.length % 3 === 0;
        const latency = Math.floor(Math.random() * 45) + 15;
        const fakeIp = `104.21.${Math.floor(Math.random() * 80) + 10}.${Math.floor(Math.random() * 200) + 1}`;

        return {
          domain: dom,
          status: isBlocked ? 'TERBLOKIR' : 'AMAN',
          ipAddress: fakeIp,
          latencyMs: latency,
          telkomselStatus: isBlocked ? 'BLOKIR' : 'AMAN',
          indihomeStatus: isBlocked ? 'BLOKIR' : 'AMAN',
          xlStatus: isBlocked ? (Math.random() > 0.4 ? 'BLOKIR' : 'AMAN') : 'AMAN',
          biznetStatus: 'AMAN',
          checkedAt: new Date().toLocaleTimeString('id-ID')
        };
      });

      setResults(simulatedResults);
      setIsChecking(false);
    }, 800);
  };

  const handleCopySafeDomains = () => {
    const safe = results.filter(r => r.status === 'AMAN').map(r => `https://${r.domain}`).join('\n');
    if (!safe) return;
    navigator.clipboard.writeText(safe);
    setCopiedSafe(true);
    setTimeout(() => setCopiedSafe(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              SECURITY & LINK CHECK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Multi-ISP Internet Positif Simulator
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Nawala & Internet Baik Checker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengecekan massal status blokir Kominfo/Nawala untuk link alternatif & domain promosi.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Masukkan Daftar Domain / Link (1 Domain per baris):
        </label>
        <textarea
          rows={4}
          value={domainInput}
          onChange={e => setDomainInput(e.target.value)}
          placeholder="domain1.com&#10;domain2.net&#10;domain3.org"
          className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 font-mono text-xs text-cyan-200 outline-none resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleRunCheck}
            disabled={isChecking}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'SEDANG MEMERIKSA...' : 'PERIKSA STATUS BLOKIR'}</span>
          </button>

          {results.length > 0 && (
            <button
              onClick={handleCopySafeDomains}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedSafe ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>Salin Semua Domain AMAN ({results.filter(r => r.status === 'AMAN').length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Hasil Pemeriksaan ({results.length} Domain)</span>
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {results.filter(r => r.status === 'AMAN').length} Aman
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {results.filter(r => r.status === 'TERBLOKIR').length} Terblokir
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Status Global</th>
                  <th className="py-2.5 px-3">IP Cloudflare</th>
                  <th className="py-2.5 px-3">Ping Latency</th>
                  <th className="py-2.5 px-3">Telkomsel</th>
                  <th className="py-2.5 px-3">Indihome</th>
                  <th className="py-2.5 px-3">XL / Biznet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {r.domain}
                    </td>
                    <td className="py-3 px-3">
                      {r.status === 'AMAN' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ✓ AMAN (ONLINE)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          ✗ TERBLOKIR NAWALA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {r.ipAddress}
                    </td>
                    <td className="py-3 px-3 text-cyan-300">
                      {r.latencyMs} ms
                    </td>
                    <td className="py-3 px-3">
                      {r.telkomselStatus === 'AMAN' ? (
                        <span className="text-emerald-400">OK</span>
                      ) : (
                        <span className="text-rose-400 font-bold">BLOCKED</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {r.indihomeStatus === 'AMAN' ? (
                        <span className="text-emerald-400">OK</span>
                      ) : (
                        <span className="text-rose-400 font-bold">BLOCKED</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-400">OK / BIZNET OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
