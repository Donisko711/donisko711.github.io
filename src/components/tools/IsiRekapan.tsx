import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Info, 
  ClipboardPaste,
  Layers,
  ArrowRight,
  Database,
  Calculator,
  Building2,
  Table,
  Filter,
  BarChart3,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

// Bank list matching the exact columns in Image 1
export const VALIDATION_BANKS = [
  'BANK JAGO',
  'BCA',
  'BNI',
  'BRI',
  'BSI',
  'CIMB',
  'DANA',
  'DANAMON',
  'GOPAY',
  'LINKAJA',
  'MANDIRI',
  'MAYBANK',
  'MEGA',
  'OCBC',
  'OVO',
  'PANIN',
  'PERMATA',
  'SEABANK',
  'SINARMAS',
  'ALLOBANK'
] as const;

export type ValidationBankType = typeof VALIDATION_BANKS[number];

export interface ParsedValidationItem {
  id: string;
  rawText: string;
  bankDetected: string;
  isBonus: boolean;
  userId?: string;
  nominal?: number;
  dateTime?: string;
}

// Preset Data Sample for quick testing
const SAMPLE_PL_DATA = `2026-08-31 14:10:22	bca_master	BCA	150,000	userbca01	Done
2026-08-31 14:12:05	bca_vip	BCA	500,000	sultanbca	Done
2026-08-31 14:15:40	mandiri_depo	MANDIRI	250,000	pemainslot99	Done
2026-08-31 14:18:11	bri_link	BRI	100,000	hoki888	Done
2026-08-31 14:20:00	dana_express	DANA	50,000	danajepe	Done
2026-08-31 14:22:30	dana_express	DANA	100,000	danasultan	Done
2026-08-31 14:25:10	gopay_instant	GOPAY	75,000	gopaywin	Done
2026-08-31 14:30:15	bni_fast	BNI	300,000	bnijackpot	Done
2026-08-31 14:32:00	seabank_id	SEABANK	200,000	seahoki	Done
2026-08-31 14:35:40	jago_main	BANK JAGO	120,000	jagomax	Done
2026-08-31 14:38:20	cimb_niaga	CIMB	450,000	cimbplay	Done
2026-08-31 14:40:00	bsi_syariah	BSI	150,000	bsiberkah	Done
2026-08-31 14:45:00	bonus_harian	BONUS711	25,000	klaimbonus1	Klaim Bonus
2026-08-31 14:48:00	bonus_scatter	BONUS711	50,000	klaimbonus2	Bonus Scatter`;

export const IsiRekapan: React.FC = () => {
  // Main Tab: 'validasi-pl' | 'rekap-koin' | 'data-turnover'
  const [activeTab, setActiveTab] = useState<'validasi-pl' | 'rekap-koin' | 'data-turnover'>('validasi-pl');

  // ==========================================
  // TAB 1: VALIDASI PL STATE
  // ==========================================
  const [plInputText, setPlInputText] = useState('');
  const [copiedCountsRow, setCopiedCountsRow] = useState(false);
  const [copiedAllColumns, setCopiedAllColumns] = useState(false);
  const [copiedCsReport, setCopiedCsReport] = useState(false);
  const [autoClearPl, setAutoClearPl] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tab 1: Parsing Engine
  const parsedPlResult = useMemo(() => {
    if (!plInputText.trim()) {
      return {
        totalLines: 0,
        detectedCount: 0,
        unrecognizedCount: 0,
        countsByBank: VALIDATION_BANKS.reduce((acc, b) => ({ ...acc, [b]: 0 }), {} as Record<ValidationBankType, number>),
        totalBankCount: 0,
        bonus711Count: 0,
        items: [] as ParsedValidationItem[]
      };
    }

    const lines = plInputText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const countsByBank = VALIDATION_BANKS.reduce((acc, b) => ({ ...acc, [b]: 0 }), {} as Record<ValidationBankType, number>);
    let bonus711Count = 0;
    let detectedCount = 0;
    let unrecognizedCount = 0;
    const items: ParsedValidationItem[] = [];

    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      let matchedBank: ValidationBankType | null = null;

      // Check Bonus711 first
      const isBonus = lower.includes('bonus711') || lower.includes('bonus 711') || lower.includes('klaim bonus') || lower.includes('bagi bonus');

      // Check Specific Bank Matches
      if (lower.includes('jago') || lower.includes('bank jago')) {
        matchedBank = 'BANK JAGO';
      } else if (lower.includes('allobank') || lower.includes('allo bank') || lower.includes('allo')) {
        matchedBank = 'ALLOBANK';
      } else if (lower.includes('seabank') || lower.includes('sea bank')) {
        matchedBank = 'SEABANK';
      } else if (lower.includes('sinarmas') || lower.includes('sinar mas')) {
        matchedBank = 'SINARMAS';
      } else if (lower.includes('permata') || lower.includes('bank permata')) {
        matchedBank = 'PERMATA';
      } else if (lower.includes('panin') || lower.includes('bank panin')) {
        matchedBank = 'PANIN';
      } else if (lower.includes('maybank') || lower.includes('may bank')) {
        matchedBank = 'MAYBANK';
      } else if (lower.includes('danamon')) {
        matchedBank = 'DANAMON';
      } else if (lower.includes('linkaja') || lower.includes('link aja')) {
        matchedBank = 'LINKAJA';
      } else if (lower.includes('gopay') || lower.includes('go-pay') || lower.includes('go pay')) {
        matchedBank = 'GOPAY';
      } else if (lower.includes('dana') || lower.includes('qris dana')) {
        matchedBank = 'DANA';
      } else if (lower.includes('ovo')) {
        matchedBank = 'OVO';
      } else if (lower.includes('ocbc') || lower.includes('ocbc nisp')) {
        matchedBank = 'OCBC';
      } else if (lower.includes('mega') || lower.includes('bank mega')) {
        matchedBank = 'MEGA';
      } else if (lower.includes('cimb') || lower.includes('niaga')) {
        matchedBank = 'CIMB';
      } else if (lower.includes('bsi') || lower.includes('syariah indonesia')) {
        matchedBank = 'BSI';
      } else if (lower.includes('bca') || lower.includes('klikbca') || lower.includes('qris bca')) {
        matchedBank = 'BCA';
      } else if (lower.includes('bni') || lower.includes('bank bni')) {
        matchedBank = 'BNI';
      } else if (lower.includes('bri') || lower.includes('bank bri') || lower.includes('brimo')) {
        matchedBank = 'BRI';
      } else if (lower.includes('mandiri') || lower.includes('livin')) {
        matchedBank = 'MANDIRI';
      }

      if (isBonus) {
        bonus711Count++;
        detectedCount++;
      }

      if (matchedBank) {
        countsByBank[matchedBank]++;
        if (!isBonus) {
          detectedCount++;
        }
      }

      if (!matchedBank && !isBonus) {
        unrecognizedCount++;
      }

      items.push({
        id: `pl-item-${idx}`,
        rawText: line,
        bankDetected: matchedBank || (isBonus ? 'BONUS711' : 'TIDAK DIKENALI'),
        isBonus
      });
    });

    const totalBankCount = Object.values(countsByBank).reduce((sum, c) => sum + c, 0);

    return {
      totalLines: lines.length,
      detectedCount,
      unrecognizedCount,
      countsByBank,
      totalBankCount,
      bonus711Count,
      items
    };
  }, [plInputText]);

  // Tab 1 Copy Helpers
  const handleCopyCountsRow = () => {
    // Exact row order matching Image 1:
    // BANK JAGO \t BCA \t BNI \t BRI \t BSI \t CIMB \t DANA \t DANAMON \t GOPAY \t LINKAJA \t MANDIRI \t MAYBANK \t MEGA \t OCBC \t OVO \t PANIN \t PERMATA \t SEABANK \t SINARMAS \t ALLOBANK \t TOTAL \t BONUS711
    const values = [
      ...VALIDATION_BANKS.map(b => parsedPlResult.countsByBank[b]),
      parsedPlResult.totalBankCount,
      parsedPlResult.bonus711Count
    ];
    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedCountsRow(true);

    if (autoClearPl) {
      setPlInputText('');
    }
    setTimeout(() => setCopiedCountsRow(false), 2500);
  };

  const handleCopyAllColumns = () => {
    const headers = [...VALIDATION_BANKS, 'TOTAL', 'BONUS711'];
    const values = [
      ...VALIDATION_BANKS.map(b => parsedPlResult.countsByBank[b]),
      parsedPlResult.totalBankCount,
      parsedPlResult.bonus711Count
    ];
    const fullTsv = `${headers.join('\t')}\n${values.join('\t')}`;
    navigator.clipboard.writeText(fullTsv);
    setCopiedAllColumns(true);
    setTimeout(() => setCopiedAllColumns(false), 2500);
  };

  const handleCopyCsReportText = () => {
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const activeBankLines = VALIDATION_BANKS
      .filter(b => parsedPlResult.countsByBank[b] > 0)
      .map(b => `• ${b}: ${parsedPlResult.countsByBank[b]} Transaksi`)
      .join('\n');

    const report = 
`📊 LAPORAN REKAPAN VALIDASI PL CS 711
📅 Hari/Tanggal : ${dateStr}
━━━━━━━━━━━━━━━━━━━━━
HASIL VALIDASI PER BANK:
${activeBankLines || '• Belum ada transaksi per bank'}
━━━━━━━━━━━━━━━━━━━━━
🔥 TOTAL TRANSAKSI BANK : ${parsedPlResult.totalBankCount}
🎁 BONUS 711            : ${parsedPlResult.bonus711Count}
TOTAL KESELURUHAN      : ${parsedPlResult.totalBankCount + parsedPlResult.bonus711Count}
━━━━━━━━━━━━━━━━━━━━━
Status: VALIDASI SELESAI (DONE DOCS)`;

    navigator.clipboard.writeText(report);
    setCopiedCsReport(true);
    setTimeout(() => setCopiedCsReport(false), 2500);
  };

  const handlePastePl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPlInputText(text);
      }
    } catch {
      // Ignore if permission denied
    }
  };

  // ==========================================
  // TAB 2: REKAP KOIN STATE
  // ==========================================
  const [koinShift, setKoinShift] = useState<'PAGI' | 'SORE' | 'MALAM'>('PAGI');
  const [koinDate, setKoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [koinAwal, setKoinAwal] = useState<number>(50000000);
  const [koinMasuk, setKoinMasuk] = useState<number>(24500000);
  const [koinKeluar, setKoinKeluar] = useState<number>(18200000);
  const [koinAdjust, setKoinAdjust] = useState<number>(0);
  const [koinAkhirReal, setKoinAkhirReal] = useState<number>(56300000);
  const [copiedKoinReport, setCopiedKoinReport] = useState(false);

  const koinCalculations = useMemo(() => {
    const sistemAkhir = koinAwal + koinMasuk - koinKeluar + koinAdjust;
    const selisih = koinAkhirReal - sistemAkhir;
    const winLoseKoin = koinMasuk - koinKeluar;
    const status = selisih === 0 ? 'BALANCE (COCOK)' : selisih > 0 ? `LEBIH (+${selisih.toLocaleString('id-ID')})` : `KURANG (${selisih.toLocaleString('id-ID')})`;

    return {
      sistemAkhir,
      selisih,
      winLoseKoin,
      status,
      isBalanced: selisih === 0
    };
  }, [koinAwal, koinMasuk, koinKeluar, koinAdjust, koinAkhirReal]);

  const handleCopyKoinReport = () => {
    const report = 
`🎰 REKAPAN KOIN / CHIPS SHIFT ${koinShift}
📅 Tanggal : ${koinDate}
━━━━━━━━━━━━━━━━━━━━━
• Koin Awal          : Rp ${koinAwal.toLocaleString('id-ID')}
• Koin Masuk (Depo)  : Rp ${koinMasuk.toLocaleString('id-ID')}
• Koin Keluar (WD)   : Rp ${koinKeluar.toLocaleString('id-ID')}
• Penyesuaian/Adjust : Rp ${koinAdjust.toLocaleString('id-ID')}
━━━━━━━━━━━━━━━━━━━━━
• Koin Akhir Sistem  : Rp ${koinCalculations.sistemAkhir.toLocaleString('id-ID')}
• Koin Fisik/Real    : Rp ${koinAkhirReal.toLocaleString('id-ID')}
• Selisih Saldo      : Rp ${koinCalculations.selisih.toLocaleString('id-ID')}
• Win/Lose Shift     : Rp ${koinCalculations.winLoseKoin.toLocaleString('id-ID')} (${koinCalculations.winLoseKoin >= 0 ? 'PROFIT' : 'MINUS'})
• Status Rekapan     : ${koinCalculations.status}
━━━━━━━━━━━━━━━━━━━━━
Dicatat oleh: CS Shift ${koinShift}`;

    navigator.clipboard.writeText(report);
    setCopiedKoinReport(true);
    setTimeout(() => setCopiedKoinReport(false), 2500);
  };

  // ==========================================
  // TAB 3: DATA TURNOVER STATE
  // ==========================================
  const [toSlot, setToSlot] = useState<number>(145000000);
  const [toCasino, setToCasino] = useState<number>(68000000);
  const [toSports, setToSports] = useState<number>(35000000);
  const [toTogel, setToTogel] = useState<number>(12000000);
  const [toArcade, setToArcade] = useState<number>(5000000);
  const [copiedToReport, setCopiedToReport] = useState(false);

  const toCalculations = useMemo(() => {
    const totalTo = toSlot + toCasino + toSports + toTogel + toArcade;
    return {
      totalTo,
      slotPct: totalTo > 0 ? ((toSlot / totalTo) * 100).toFixed(1) : '0',
      casinoPct: totalTo > 0 ? ((toCasino / totalTo) * 100).toFixed(1) : '0',
      sportsPct: totalTo > 0 ? ((toSports / totalTo) * 100).toFixed(1) : '0',
      togelPct: totalTo > 0 ? ((toTogel / totalTo) * 100).toFixed(1) : '0',
      arcadePct: totalTo > 0 ? ((toArcade / totalTo) * 100).toFixed(1) : '0'
    };
  }, [toSlot, toCasino, toSports, toTogel, toArcade]);

  const handleCopyToReport = () => {
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const report = 
`📈 REKAPAN TURNOVER (TO) HARIAN
📅 Tanggal : ${dateStr}
━━━━━━━━━━━━━━━━━━━━━
• Slot Games    : Rp ${toSlot.toLocaleString('id-ID')} (${toCalculations.slotPct}%)
• Live Casino   : Rp ${toCasino.toLocaleString('id-ID')} (${toCalculations.casinoPct}%)
• Sportsbooks   : Rp ${toSports.toLocaleString('id-ID')} (${toCalculations.sportsPct}%)
• Togel Online  : Rp ${toTogel.toLocaleString('id-ID')} (${toCalculations.togelPct}%)
• Arcade/Others : Rp ${toArcade.toLocaleString('id-ID')} (${toCalculations.arcadePct}%)
━━━━━━━━━━━━━━━━━━━━━
🔥 TOTAL TURNOVER (TO) : Rp ${toCalculations.totalTo.toLocaleString('id-ID')}
━━━━━━━━━━━━━━━━━━━━━
Status: REKAP TO DONE`;

    navigator.clipboard.writeText(report);
    setCopiedToReport(true);
    setTimeout(() => setCopiedToReport(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in">
      {/* ========================================================= */}
      {/* HEADER BANNER                                             */}
      {/* ========================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a101d] via-[#101c2e] to-[#0a101d] border border-cyan-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-bold font-mono border border-cyan-500/30 tracking-wider">
              TOOLS KERJA CS
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Otomatisasi Rekapan Data Harian & Validasi PL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-sans uppercase tracking-wider flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>ISI REKAPAN &amp; VALIDASI DATA CS</span>
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Form khusus CS &amp; Kasir untuk menghitung cepat transaksi per bank, total validasi PL harian, rekapitulasi koin, dan data turnover shift.
          </p>
        </div>

        {/* Action Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#070d18] text-yellow-400 border border-yellow-500/30 font-bold shadow-sm">
            ⚡ 3 MODE REKAPAN
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3 TOP NAVIGATION TABS (Sesuai Konsep Gambar 1)            */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090e18] border border-white/10 shadow-md overflow-x-auto">
        <button
          onClick={() => setActiveTab('validasi-pl')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'validasi-pl'
              ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <span>✓ Validasi PL</span>
          {parsedPlResult.totalLines > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] ${activeTab === 'validasi-pl' ? 'bg-black text-cyan-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
              {parsedPlResult.totalBankCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rekap-koin')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rekap-koin'
              ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Rekap Koin</span>
        </button>

        <button
          onClick={() => setActiveTab('data-turnover')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'data-turnover'
              ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Data Turnover</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VALIDASI PL (Sesuai Gambar 1)                      */}
      {/* ========================================================= */}
      {activeTab === 'validasi-pl' && (
        <div className="space-y-6">
          {/* Main Card Container */}
          <div className="p-6 rounded-3xl bg-[#080d17] border border-cyan-500/30 shadow-2xl space-y-5">
            
            {/* Top Subheader with Centered Yellow Badge */}
            <div className="text-center space-y-2">
              <div className="inline-block px-5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black font-mono tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] uppercase">
                ISI DATA VALIDASI
              </div>
              <p className="text-xs text-gray-300 font-mono">
                Tempel data transaksi. Tombol Copy Baris Count menyalin semua hasil.
              </p>
            </div>

            {/* Quick Actions & Preset Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-gray-400">Contoh Data:</span>
                <button
                  type="button"
                  onClick={() => setPlInputText(SAMPLE_PL_DATA)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  Preset PL Campuran (BCA, Mandiri, BRI, DANA, JAGO, dll)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePastePl}
                  className="px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs font-mono font-bold border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Tempel Clipboard
                </button>
                <button
                  type="button"
                  onClick={() => setPlInputText('')}
                  className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-mono font-bold border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Bersihkan
                </button>
              </div>
            </div>

            {/* Large Input Textarea */}
            <div className="relative">
              <textarea
                value={plInputText}
                onChange={(e) => setPlInputText(e.target.value)}
                placeholder="Tempel data transaksi di sini..."
                className="w-full h-44 p-4 rounded-2xl bg-[#040810] border border-cyan-500/30 text-cyan-200 placeholder-gray-500 text-xs font-mono outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-y shadow-inner leading-relaxed"
              />
            </div>

            {/* Stats Bar */}
            <div className="p-3 rounded-xl bg-[#050a14] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-300">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Baris input: <strong className="text-white">{parsedPlResult.totalLines}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                  Terdeteksi: <strong className="text-emerald-400">{parsedPlResult.detectedCount}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                  Tidak dikenali: <strong className={parsedPlResult.unrecognizedCount > 0 ? 'text-rose-400' : 'text-gray-400'}>{parsedPlResult.unrecognizedCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Total Transaksi Bank:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                  {parsedPlResult.totalBankCount}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* HASIL VALIDASI PER JENIS BANK (PL HARIAN) - GRID PERSIS GAMBAR 1         */}
            {/* ========================================================================= */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-yellow-400 font-mono uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-yellow-400" />
                  <span>HASIL VALIDASI PER JENIS BANK (PL HARIAN)</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-300">
                  {VALIDATION_BANKS.length} Bank Terdaftar + Total &amp; Bonus
                </span>
              </div>

              {/* Responsive Scrollable Table Container */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-[#040711] overflow-x-auto shadow-xl">
                <table className="w-full border-collapse font-mono text-xs text-center whitespace-nowrap">
                  {/* Header Row: Warna Kuning / Orange Emas Elegan Persis Gambar 1 */}
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black uppercase text-[11px] tracking-wider">
                      {VALIDATION_BANKS.map((b) => (
                        <th key={`th-${b}`} className="px-3.5 py-2.5 border-r border-amber-600/50 last:border-r-0">
                          {b}
                        </th>
                      ))}
                      <th className="px-4 py-2.5 bg-black text-cyan-300 border-x-2 border-cyan-400 font-black">
                        TOTAL
                      </th>
                      <th className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black">
                        BONUS711
                      </th>
                    </tr>
                  </thead>

                  {/* Body Row: Angka Count Hasil Ekstraksi */}
                  <tbody>
                    <tr className="bg-[#060a15] text-white font-extrabold text-sm hover:bg-[#0a1224] transition-colors">
                      {VALIDATION_BANKS.map((b) => {
                        const count = parsedPlResult.countsByBank[b];
                        return (
                          <td 
                            key={`td-${b}`} 
                            className={`px-3.5 py-3 border-r border-white/10 last:border-r-0 transition-colors ${
                              count > 0 ? 'text-yellow-400 font-black bg-yellow-400/[0.08]' : 'text-gray-400'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                      {/* TOTAL COLUMN */}
                      <td className="px-4 py-3 bg-cyan-950/40 text-cyan-300 border-x-2 border-cyan-500/50 font-black text-base">
                        {parsedPlResult.totalBankCount}
                      </td>
                      {/* BONUS711 COLUMN */}
                      <td className="px-4 py-3 bg-rose-950/40 text-rose-300 font-black text-base">
                        {parsedPlResult.bonus711Count}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Action Buttons (Sesuai Gambar 1) */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Copy Semua Kolom */}
              <button
                type="button"
                onClick={handleCopyAllColumns}
                className="flex-1 min-w-[160px] py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {copiedAllColumns ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedAllColumns ? 'Tersalin!' : 'Copy Semua Kolom'}</span>
              </button>

              {/* Copy Baris Count / TSV */}
              <button
                type="button"
                onClick={handleCopyCountsRow}
                className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                title="Menyalin angka-angka count dalam 1 baris format tab-separated, siap tempel langsung ke baris Google Sheet / Excel"
              >
                {copiedCountsRow ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Table className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedCountsRow ? 'Baris Angka Tersalin!' : 'Copy Baris Count (TSV)'}</span>
              </button>

              {/* Copy Format Laporan CS */}
              <button
                type="button"
                onClick={handleCopyCsReportText}
                className="flex-1 min-w-[160px] py-3 px-4 rounded-xl bg-[#131d2e] hover:bg-[#1a2840] text-cyan-300 border border-cyan-500/40 font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {copiedCsReport ? <Check className="w-4 h-4 text-emerald-400" /> : <ClipboardPaste className="w-4 h-4 text-cyan-400" />}
                <span>{copiedCsReport ? 'Laporan CS Tersalin!' : 'Salin Format Chat CS'}</span>
              </button>

              {/* Reset Button (Warna Merah Gelap Persis Gambar 1) */}
              <button
                type="button"
                onClick={() => setPlInputText('')}
                className="py-3 px-6 rounded-xl bg-[#450a0a] hover:bg-[#7f1d1d] text-rose-200 border border-rose-600/40 font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-rose-300" />
                <span>Reset</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: REKAP KOIN (Rekapan Chips & Saldo Kasir/CS)         */}
      {/* ========================================================= */}
      {activeTab === 'rekap-koin' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#080d17] border border-cyan-500/30 shadow-2xl space-y-6">
            
            {/* Header Tab 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span>REKAPITULASI KOIN &amp; SALDO CHIPS</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Hitung selisih koin masuk (deposit), koin keluar (withdraw), koin fisik, dan profit/loss per shift.
                </p>
              </div>

              {/* Shift Selector */}
              <div className="flex items-center gap-2 bg-[#040810] p-1.5 rounded-xl border border-white/10">
                {(['PAGI', 'SORE', 'MALAM'] as const).map((s) => (
                  <button
                    key={`koin-shift-${s}`}
                    onClick={() => setKoinShift(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      koinShift === s
                        ? 'bg-yellow-400 text-black font-black shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    SHIFT {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Grid Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {/* Koin Awal */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-white/10 space-y-2">
                <label className="text-gray-400 font-bold block">1. Koin Awal Shift (Rp):</label>
                <input
                  type="number"
                  value={koinAwal}
                  onChange={(e) => setKoinAwal(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-white/15 text-white font-bold text-sm outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-cyan-300">Rp {koinAwal.toLocaleString('id-ID')}</span>
              </div>

              {/* Koin Masuk (Depo) */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-emerald-500/30 space-y-2">
                <label className="text-emerald-400 font-bold block">2. Koin Masuk / Depo (Rp):</label>
                <input
                  type="number"
                  value={koinMasuk}
                  onChange={(e) => setKoinMasuk(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-emerald-500/40 text-emerald-300 font-bold text-sm outline-none focus:border-emerald-400"
                />
                <span className="text-[11px] text-emerald-400">Rp {koinMasuk.toLocaleString('id-ID')}</span>
              </div>

              {/* Koin Keluar (WD) */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-rose-500/30 space-y-2">
                <label className="text-rose-400 font-bold block">3. Koin Keluar / WD (Rp):</label>
                <input
                  type="number"
                  value={koinKeluar}
                  onChange={(e) => setKoinKeluar(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-rose-500/40 text-rose-300 font-bold text-sm outline-none focus:border-rose-400"
                />
                <span className="text-[11px] text-rose-400">Rp {koinKeluar.toLocaleString('id-ID')}</span>
              </div>

              {/* Penyesuaian / Adjust */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-white/10 space-y-2">
                <label className="text-gray-400 font-bold block">4. Penyesuaian / Adjust (Rp):</label>
                <input
                  type="number"
                  value={koinAdjust}
                  onChange={(e) => setKoinAdjust(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-white/15 text-white font-bold text-sm outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-gray-400">Rp {koinAdjust.toLocaleString('id-ID')}</span>
              </div>

              {/* Koin Fisik / Real */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-yellow-500/30 space-y-2">
                <label className="text-yellow-400 font-bold block">5. Koin Akhir Fisik / Real (Rp):</label>
                <input
                  type="number"
                  value={koinAkhirReal}
                  onChange={(e) => setKoinAkhirReal(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-yellow-500/40 text-yellow-300 font-bold text-sm outline-none focus:border-yellow-400"
                />
                <span className="text-[11px] text-yellow-400">Rp {koinAkhirReal.toLocaleString('id-ID')}</span>
              </div>

              {/* Tanggal Rekapan */}
              <div className="p-4 rounded-2xl bg-[#040810] border border-white/10 space-y-2">
                <label className="text-gray-400 font-bold block">6. Tanggal Rekapan:</label>
                <input
                  type="date"
                  value={koinDate}
                  onChange={(e) => setKoinDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-white/15 text-white font-bold text-sm outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Calculations Summary Card */}
            <div className="p-5 rounded-2xl bg-[#040810] border-2 border-cyan-500/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                <div className="p-3 rounded-xl bg-[#09101d] border border-white/10">
                  <span className="text-[10px] text-gray-400 block uppercase">Koin Akhir Sistem:</span>
                  <span className="text-sm font-black text-white">Rp {koinCalculations.sistemAkhir.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#09101d] border border-white/10">
                  <span className="text-[10px] text-gray-400 block uppercase">Selisih Koin:</span>
                  <span className={`text-sm font-black ${koinCalculations.isBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rp {koinCalculations.selisih.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#09101d] border border-white/10">
                  <span className="text-[10px] text-gray-400 block uppercase">Win / Lose Koin:</span>
                  <span className={`text-sm font-black ${koinCalculations.winLoseKoin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rp {koinCalculations.winLoseKoin.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#09101d] border border-white/10">
                  <span className="text-[10px] text-gray-400 block uppercase">Status Koin:</span>
                  <span className={`text-xs font-black ${koinCalculations.isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {koinCalculations.status}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCopyKoinReport}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {copiedKoinReport ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                <span>{copiedKoinReport ? 'Rekapan Koin Tersalin!' : 'Salin Laporan Rekapan Koin (Chat)'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATA TURNOVER (TO HARIAN PER GAME)                 */}
      {/* ========================================================= */}
      {activeTab === 'data-turnover' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#080d17] border border-cyan-500/30 shadow-2xl space-y-6">
            
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>REKAPAN TURNOVER (TO) PER GAME &amp; PROVIDER</span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Catat dan kalkulasikan total turnover harian per kategori game untuk laporan shift dan pembagian komisi / bonus.
              </p>
            </div>

            {/* Input Grid TO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#040810] border border-cyan-500/30 space-y-2">
                <label className="text-cyan-400 font-bold block">1. TO Slot Games (Rp):</label>
                <input
                  type="number"
                  value={toSlot}
                  onChange={(e) => setToSlot(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-cyan-500/40 text-cyan-300 font-bold text-sm outline-none focus:border-cyan-400"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Rp {toSlot.toLocaleString('id-ID')}</span>
                  <span className="text-cyan-300 font-bold">{toCalculations.slotPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#040810] border border-purple-500/30 space-y-2">
                <label className="text-purple-400 font-bold block">2. TO Live Casino (Rp):</label>
                <input
                  type="number"
                  value={toCasino}
                  onChange={(e) => setToCasino(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-purple-500/40 text-purple-300 font-bold text-sm outline-none focus:border-purple-400"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Rp {toCasino.toLocaleString('id-ID')}</span>
                  <span className="text-purple-300 font-bold">{toCalculations.casinoPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#040810] border border-emerald-500/30 space-y-2">
                <label className="text-emerald-400 font-bold block">3. TO Sportsbooks (Rp):</label>
                <input
                  type="number"
                  value={toSports}
                  onChange={(e) => setToSports(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-emerald-500/40 text-emerald-300 font-bold text-sm outline-none focus:border-emerald-400"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Rp {toSports.toLocaleString('id-ID')}</span>
                  <span className="text-emerald-300 font-bold">{toCalculations.sportsPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#040810] border border-yellow-500/30 space-y-2">
                <label className="text-yellow-400 font-bold block">4. TO Togel Online (Rp):</label>
                <input
                  type="number"
                  value={toTogel}
                  onChange={(e) => setToTogel(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-yellow-500/40 text-yellow-300 font-bold text-sm outline-none focus:border-yellow-400"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Rp {toTogel.toLocaleString('id-ID')}</span>
                  <span className="text-yellow-300 font-bold">{toCalculations.togelPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#040810] border border-pink-500/30 space-y-2">
                <label className="text-pink-400 font-bold block">5. TO Arcade / Lainnya (Rp):</label>
                <input
                  type="number"
                  value={toArcade}
                  onChange={(e) => setToArcade(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[#09101d] border border-pink-500/40 text-pink-300 font-bold text-sm outline-none focus:border-pink-400"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Rp {toArcade.toLocaleString('id-ID')}</span>
                  <span className="text-pink-300 font-bold">{toCalculations.arcadePct}%</span>
                </div>
              </div>

              {/* Total TO Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1c30] to-[#060e1a] border-2 border-cyan-400 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <span className="text-cyan-300 font-black block uppercase text-[11px]">🔥 TOTAL TURNOVER HARIAN:</span>
                <span className="text-lg font-black text-white block">
                  Rp {toCalculations.totalTo.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-cyan-200 block font-mono">100% Volume Taruhan Member</span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyToReport}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {copiedToReport ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
              <span>{copiedToReport ? 'Rekapan TO Tersalin!' : 'Salin Laporan Turnover (Chat)'}</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default IsiRekapan;
