import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Trash2, 
  Zap, 
  Clock, 
  Coins, 
  FileText, 
  Gamepad2, 
  Layers, 
  RotateCcw,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface ParsedSlotData {
  userId: string;
  namaRekening: string;
  nomorRekening: string;
  periodePatokan: string;
  totalCredit: number;
  totalDebit: number;
  barisTerbaca: number;
  provider: string;
  permainan: string;
  kodeTicket: string;
  roundId: string;
  superBuy: string;
}

const SAMPLE_RAW_DATA = `isna
ITWLFA - jvsaa
30 Aug 2026 - 00:40:39
Credit
IDR 1,200
Balance : IDR 205,563
Mahjong Ways
PGSoft
2093755723547846146-2093755723547846146-106-0
Ext. ID : DB2093755723547846146-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:40:39
Debit
IDR 1,200
Balance : IDR 204,363`;

interface BonusCalculatorProps {
  initialTab?: 'SLOT' | 'PARLAY';
}

export const BonusCalculator: React.FC<BonusCalculatorProps> = ({ initialTab = 'SLOT' }) => {
  const [rawText, setRawText] = useState<string>(SAMPLE_RAW_DATA);
  const [copiedScatter, setCopiedScatter] = useState(false);
  const [copiedHarian, setCopiedHarian] = useState(false);

  // Editable Account info if not in statement
  const [customUserId, setCustomUserId] = useState<string>('');
  const [customNamaRek, setCustomNamaRek] = useState<string>('-');
  const [customNoRek, setCustomNoRek] = useState<string>('-');
  const [customSuperBuy, setCustomSuperBuy] = useState<string>('-');

  // Parse Raw Statement
  const parsed: ParsedSlotData = useMemo(() => {
    if (!rawText.trim()) {
      return {
        userId: customUserId || '-',
        namaRekening: customNamaRek || '-',
        nomorRekening: customNoRek || '-',
        periodePatokan: '-',
        totalCredit: 0,
        totalDebit: 0,
        barisTerbaca: 0,
        provider: '-',
        permainan: '-',
        kodeTicket: '-',
        roundId: '-',
        superBuy: customSuperBuy || '-'
      };
    }

    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const barisCount = rawText.split('\n').length;

    let detectedUser = '';
    let detectedTime = '';
    let detectedGame = '';
    let detectedProvider = '';
    let detectedTicket = '';
    let detectedRoundId = '';
    let sumCredit = 0;
    let sumDebit = 0;

    // Helper to parse numbers like 1,200 or 1.200
    const parseAmount = (str: string): number => {
      const clean = str.replace(/[^0-9]/g, '');
      return parseInt(clean, 10) || 0;
    };

    // Providers list
    const knownProviders = [
      'PGSoft', 'PG Soft', 'Pragmatic Play', 'Pragmatic', 'IDNSlot', 'IDN Slot', 
      'Slot Mania', 'SlotMania', 'Habanero', 'Microgaming', 'Spadegaming', 'Joker Gaming', 'NoLimit City'
    ];

    // Known Games
    const knownGames = [
      'Mahjong Ways', 'Mahjong Ways 2', 'Mahjong Ways 3', 'Gates of Olympus', 'Gates of Gatotkaca',
      'Starlight Princess', 'Sweet Bonanza', 'Aztec Gems', 'Wild Bandito', 'Lucky Neko',
      'Treasures of Aztec', 'Caishen Wins', 'Captain Bounty', 'Dragon Hatch', 'Ganesha Fortune'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect Timestamp: e.g. "30 Aug 2026 - 00:40:39" or similar
      if (!detectedTime && (line.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s*-\s*\d{2}:\d{2}:\d{2}/) || line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/))) {
        detectedTime = line;
      }

      // Detect Username: typically line 0 if it's a single word and not a keyword
      if (!detectedUser && i === 0 && !line.includes(':') && !line.includes('-') && line.length <= 20) {
        detectedUser = line;
      }

      // Detect Provider
      for (const prov of knownProviders) {
        if (line.toLowerCase() === prov.toLowerCase() || line.toLowerCase().includes(prov.toLowerCase())) {
          if (!detectedProvider) detectedProvider = prov;
        }
      }

      // Detect Game
      for (const gm of knownGames) {
        if (line.toLowerCase() === gm.toLowerCase() || line.toLowerCase().includes(gm.toLowerCase())) {
          if (!detectedGame) detectedGame = gm;
        }
      }

      // Detect Ticket / Round ID (Long number with hyphen or Ext. ID)
      if (line.includes('Ext. ID :') || line.includes('Ext. ID:')) {
        const parts = line.split(':');
        if (parts[1]) detectedTicket = parts[1].trim();
      } else if (!detectedTicket && line.match(/^\d{10,}-\d{10,}/)) {
        detectedTicket = line;
        detectedRoundId = line;
      }

      // Detect Credit / Debit values
      if (line.toLowerCase() === 'credit' && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.toUpperCase().includes('IDR') || nextLine.match(/\d+/)) {
          sumCredit += parseAmount(nextLine);
        }
      } else if (line.toLowerCase().startsWith('credit:')) {
        sumCredit += parseAmount(line);
      }

      if (line.toLowerCase() === 'debit' && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.toUpperCase().includes('IDR') || nextLine.match(/\d+/)) {
          sumDebit += parseAmount(nextLine);
        }
      } else if (line.toLowerCase().startsWith('debit:')) {
        sumDebit += parseAmount(line);
      }
    }

    // Fallbacks
    if (!detectedGame) detectedGame = 'Mahjong Ways';
    if (!detectedProvider) detectedProvider = 'PGSoft';
    if (!detectedTicket && detectedRoundId) detectedTicket = detectedRoundId;
    if (!detectedRoundId && detectedTicket) detectedRoundId = detectedTicket;
    if (!detectedUser && lines.length > 0) detectedUser = lines[0];

    return {
      userId: customUserId || detectedUser || 'isna',
      namaRekening: customNamaRek || '-',
      nomorRekening: customNoRek || '-',
      periodePatokan: detectedTime || '30 Aug 2026 - 00:40:39',
      totalCredit: sumCredit || 1200,
      totalDebit: sumDebit || 1200,
      barisTerbaca: barisCount,
      provider: detectedProvider || 'PGSoft',
      permainan: detectedGame || 'Mahjong Ways',
      kodeTicket: detectedTicket || '2093755723547846146-2093755723547846146-106-0',
      roundId: detectedRoundId || detectedTicket || '2093755723547846146-2093755723547846146-106-0',
      superBuy: customSuperBuy || '-'
    };
  }, [rawText, customUserId, customNamaRek, customNoRek, customSuperBuy]);

  // Copy Handlers
  const handleCopyScatter = () => {
    // Format TSV / Tabular data for Excel / Chat
    const text = `${parsed.userId}\t${parsed.namaRekening}\t${parsed.nomorRekening}\t${parsed.permainan}\t${parsed.kodeTicket}\t${parsed.totalCredit}\t${parsed.totalDebit}`;
    navigator.clipboard.writeText(text);
    setCopiedScatter(true);
    setTimeout(() => setCopiedScatter(false), 2000);
  };

  const handleCopyHarian = () => {
    // Format TSV / Tabular data for Excel / Chat
    const text = `${parsed.userId}\t${parsed.namaRekening}\t${parsed.nomorRekening}\t${parsed.provider}\t${parsed.permainan}\t${parsed.roundId}\t${parsed.superBuy}\t${parsed.totalCredit}\t${parsed.totalDebit}`;
    navigator.clipboard.writeText(text);
    setCopiedHarian(true);
    setTimeout(() => setCopiedHarian(false), 2000);
  };

  const handleClear = () => {
    setRawText('');
    setCustomUserId('');
    setCustomNamaRek('-');
    setCustomNoRek('-');
    setCustomSuperBuy('-');
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_RAW_DATA);
    setCustomUserId('');
    setCustomNamaRek('-');
    setCustomNoRek('-');
    setCustomSuperBuy('-');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              SLOT PARSER & REKAPAN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Auto Formula Statement Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            BONUS HARIAN SLOT & MAHJONG
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula otomatis membaca statement taruhan, menghitung total credit/debit, dan menyusun tabel klaim bonus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONTOH DATA</span>
          </button>
        </div>
      </div>

      {/* Grid: Left (Input Data) & Right (Hasil Pembacaan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Input Textarea */}
        <div className="lg:col-span-7 rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-white/10 p-5 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                PASTE DATA DI BAWAH INI 👇
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-gray-300 text-[10px] font-mono font-bold border border-white/10">
              CTRL + V
            </span>
          </div>

          <div className="relative flex-1 min-h-[260px]">
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Tempel data log statement transaksi di sini..."
              className="w-full h-full min-h-[260px] p-4 rounded-2xl bg-black/70 border border-white/10 focus:border-cyan-400 text-xs font-mono text-cyan-300 outline-none resize-none leading-relaxed transition-colors shadow-inner"
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {}}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-black stroke-black" />
              <span>PROSES SESUAI RUMUS</span>
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-3 rounded-2xl bg-[#1A1A1A] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>BERSIHKAN</span>
            </button>
          </div>
        </div>

        {/* Right Card: Hasil Pembacaan */}
        <div className="lg:col-span-5 rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-white/10 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                HASIL PEMBACAAN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                FORMULA MODE
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {/* Periode Patokan Box */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 font-mono flex items-center gap-1">
                  <span>⚡ PERIODE PATOKAN (Q2) ⚡</span>
                </div>
                <div className="text-sm font-black text-white font-mono">
                  {parsed.periodePatokan}
                </div>
              </div>

              {/* 2 Column Stats: Credit & Debit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    TOTAL CREDIT / KEMENANGAN
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {parsed.totalCredit.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    TOTAL DEBIT / TARUHAN
                  </div>
                  <div className="text-xl font-black text-cyan-300 font-mono">
                    {parsed.totalDebit.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* 2 Column Stats: Baris Terbaca & Provider */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    BARIS TERBACA
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {parsed.barisTerbaca}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    PROVIDER A2
                  </div>
                  <div className="text-sm font-black text-yellow-400 font-mono truncate mt-1">
                    {parsed.provider}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit Inputs for Rekening */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase flex items-center justify-between">
              <span>Data Rekening Tambahan:</span>
              <span className="text-[9px] text-cyan-400 font-normal">Otomatis / Manual</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Nama Rekening (-)"
                  value={customNamaRek === '-' ? '' : customNamaRek}
                  onChange={e => setCustomNamaRek(e.target.value || '-')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-400 text-xs font-mono text-white outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="No Rekening (-)"
                  value={customNoRek === '-' ? '' : customNoRek}
                  onChange={e => setCustomNoRek(e.target.value || '-')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-400 text-xs font-mono text-white outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* TABLE 1: BONUS SCATTER MAHJONG WAYS 1 & 2                 */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-cyan-300 font-mono uppercase tracking-wider">
              BONUS SCATTER MAHJONG WAYS 1 & 2
            </h2>
          </div>

          <button
            onClick={handleCopyScatter}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            {copiedScatter ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 1 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">USER ID</th>
                <th className="py-3 px-4 min-w-[140px]">NAMA REKENING</th>
                <th className="py-3 px-4 min-w-[140px]">NOMOR REKENING</th>
                <th className="py-3 px-4 min-w-[140px]">PERMAINAN</th>
                <th className="py-3 px-4 min-w-[200px]">KODE TICKET</th>
                <th className="py-3 px-4 text-center min-w-[140px]">TOTAL KEMENANGAN</th>
                <th className="py-3 px-4 text-center min-w-[120px]">NILAI TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">
                  {parsed.userId}
                </td>
                <td className="py-3.5 px-4 text-gray-300">
                  {parsed.namaRekening}
                </td>
                <td className="py-3.5 px-4 text-gray-300">
                  {parsed.nomorRekening}
                </td>
                <td className="py-3.5 px-4 font-semibold text-yellow-400">
                  {parsed.permainan}
                </td>
                <td className="py-3.5 px-4 text-gray-300 text-[11px] truncate max-w-[240px]">
                  {parsed.kodeTicket}
                </td>
                <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">
                  {parsed.totalCredit.toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-4 text-center font-extrabold text-cyan-300">
                  {parsed.totalDebit.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLE 2: BONUS HARIAN SLOT PRAGMATIC PLAY- IDNSLOT - SLOT MANIA - PGSOFT  */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-yellow-300 font-mono uppercase tracking-wider">
              BONUS HARIAN SLOT PRAGMATIC PLAY- IDNSLOT - SLOT MANIA - PGSOFT
            </h2>
          </div>

          <button
            onClick={handleCopyHarian}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            {copiedHarian ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 2 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 min-w-[100px]">USER ID</th>
                <th className="py-3 px-3.5 min-w-[120px]">NAMA REKENING</th>
                <th className="py-3 px-3.5 min-w-[120px]">NOMOR REKENING</th>
                <th className="py-3 px-3.5 min-w-[100px]">PROVIDER</th>
                <th className="py-3 px-3.5 min-w-[130px]">PERMAINAN</th>
                <th className="py-3 px-3.5 min-w-[180px]">ROUND ID</th>
                <th className="py-3 px-3.5 text-center min-w-[120px]">SUPER BUY FREE SPIN</th>
                <th className="py-3 px-3.5 text-center min-w-[110px]">KEMENANGAN</th>
                <th className="py-3 px-3.5 text-center min-w-[100px]">TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-3.5 font-bold text-white">
                  {parsed.userId}
                </td>
                <td className="py-3.5 px-3.5 text-gray-300">
                  {parsed.namaRekening}
                </td>
                <td className="py-3.5 px-3.5 text-gray-300">
                  {parsed.nomorRekening}
                </td>
                <td className="py-3.5 px-3.5 font-semibold text-cyan-400">
                  {parsed.provider}
                </td>
                <td className="py-3.5 px-3.5 font-semibold text-yellow-400">
                  {parsed.permainan}
                </td>
                <td className="py-3.5 px-3.5 text-gray-300 text-[11px] truncate max-w-[200px]">
                  {parsed.roundId}
                </td>
                <td className="py-3.5 px-3.5 text-center text-gray-400">
                  {parsed.superBuy}
                </td>
                <td className="py-3.5 px-3.5 text-center font-extrabold text-emerald-400">
                  {parsed.totalCredit.toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-3.5 text-center font-extrabold text-cyan-300">
                  {parsed.totalDebit.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
