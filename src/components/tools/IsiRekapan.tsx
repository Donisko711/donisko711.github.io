import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  AlertTriangle,
  Upload,
  FileUp,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

// Bank list matching the exact columns in Image 1
const B = (w: string) => new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`, 'i');

export const VALIDATION_BANKS_CONFIG = [
  { key: 'JAGO', label: 'BANK JAGO', rx: [/bank\s*jago\b/i, B('jago')] },
  { key: 'BCA', label: 'BCA', rx: [/bank\s*central\s*asia/i, B('bca')] },
  { key: 'BNI', label: 'BNI', rx: [/bank\s*negara\s*indonesia/i, B('bni')] },
  { key: 'BRI', label: 'BRI', rx: [/\brakyat\s+indonesia\b/i, /\bbrimo\b/i, B('bri')] },
  { key: 'BSI', label: 'BSI', rx: [/syariah\s*indonesia/i, B('bsi')] },
  { key: 'CIMB', label: 'CIMB', rx: [/cimb\s*niaga/i, B('octo'), B('cimb'), B('cwb')] },
  { key: 'DANA', label: 'DANA', rx: [B('dana')] },
  { key: 'DANAMON', label: 'DANAMON', rx: [B('danamon')] },
  { key: 'GOPAY', label: 'GOPAY', rx: [/go-?pay/i, B('gopay')] },
  { key: 'LINKAJA', label: 'LINKAJA', rx: [/link\s*aja/i, B('linkaja')] },
  { key: 'MANDIRI', label: 'MANDIRI', rx: [/\blivin\b/i, B('mandiri')] },
  { key: 'MAYBANK', label: 'MAYBANK', rx: [B('maybank'), B('bii')] },
  { key: 'MEGA', label: 'MEGA', rx: [B('mega')] },
  { key: 'OCBC', label: 'OCBC', rx: [/ocbc\s*nisp/i, B('ocbc'), B('nisp')] },
  { key: 'OVO', label: 'OVO', rx: [B('ovo')] },
  { key: 'PANIN', label: 'PANIN', rx: [B('panin')] },
  { key: 'PERMATA', label: 'PERMATA', rx: [B('permata')] },
  { key: 'SEABANK', label: 'SEABANK', rx: [/\bsea\s*bank\b/i, B('seabank')] },
  { key: 'SINARMAS', label: 'SINARMAS', rx: [/sinar\s*mas/i, B('sinarmas')] },
  { key: 'ALLO', label: 'ALLOBANK', rx: [/allo\s*bank/i, B('allobank'), B('allo')] },
];

export const VALIDATION_BANKS = VALIDATION_BANKS_CONFIG.map(b => b.label);
export type ValidationBankType = typeof VALIDATION_BANKS[number];

// Helper scrubbing and segmentation for Bank Detection
function getBankSegment(line: string): string {
  if (!line) return '';
  const idx = line.indexOf('-');
  return (idx !== -1) ? line.slice(idx + 1).trim() : '';
}

function scrub(t: string): string {
  if (!t) return '';
  return t
    .replace(/[A-Z0-9._%+*-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, ' ')
    .replace(/\bhttps?:\/\/\S+/ig, ' ')
    .replace(/[\d*+()-]{6,}/g, ' ')
    .replace(/\b\w+Locked\b/ig, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBankKeyFromSegment(seg: string): string | null {
  const s = scrub(seg);
  if (!s) return null;

  for (const b of VALIDATION_BANKS_CONFIG) {
    for (const r of b.rx) {
      if (r.test(s)) return b.key;
    }
  }
  return null;
}

function detectBankKeyFromLine(line: string): string | null {
  if (!line) return null;
  const seg = getBankSegment(line);
  let key = seg ? extractBankKeyFromSegment(seg) : null;
  if (!key) key = extractBankKeyFromSegment(line);
  return key;
}

function prefilter(lines: string[]): string[] {
  return lines.filter((line, idx, arr) => {
    if (line.includes('-')) return true;
    const nextKey = detectBankKeyFromLine(arr[idx + 1] || '');
    return !nextKey;
  });
}

export interface ParsedValidationItem {
  id: string;
  rawText: string;
  bankDetected: string;
  isBonus: boolean;
  userId?: string;
  nominal?: number;
  dateTime?: string;
}

export interface HistoryKoinRow {
  id: string;
  info: string;
  by: string;
  coin: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  subType: 'REGULAR' | 'QRIS' | 'PGA_SPV' | 'GARUDA' | 'AUTO_WD';
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
        countsByBank: VALIDATION_BANKS_CONFIG.reduce((acc, b) => ({ ...acc, [b.key]: 0 }), {} as Record<string, number>),
        totalBankCount: 0,
        bonus711Count: 0,
        bonus711Lines: [] as string[],
        unknownLines: [] as string[],
        items: [] as ParsedValidationItem[]
      };
    }

    const rawLines = plInputText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const lines = prefilter(rawLines);

    const counts: Record<string, number> = {};
    VALIDATION_BANKS_CONFIG.forEach(b => { counts[b.key] = 0; });

    const unknown: string[] = [];
    const items: ParsedValidationItem[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const k = detectBankKeyFromLine(line);
      const isBonus = /bonus711/i.test(line);

      if (k) {
        counts[k]++;
      } else {
        unknown.push(line);
      }

      items.push({
        id: `pl-item-${idx}`,
        rawText: line,
        bankDetected: k ? (VALIDATION_BANKS_CONFIG.find(b => b.key === k)?.label || k) : (isBonus ? 'BONUS711' : 'TIDAK DIKENALI'),
        isBonus
      });
    }

    let detected = 0;
    VALIDATION_BANKS_CONFIG.forEach(b => {
      detected += (counts[b.key] || 0);
    });

    const bonus711Lines = lines.filter(l => /bonus711/i.test(l));

    return {
      totalLines: rawLines.length,
      detectedCount: detected,
      unrecognizedCount: unknown.length,
      countsByBank: counts,
      totalBankCount: detected,
      bonus711Count: bonus711Lines.length,
      bonus711Lines,
      unknownLines: unknown,
      items
    };
  }, [plInputText]);

  // Tab 1 Copy Helpers
  const handleCopyCountsRow = () => {
    // Exact row order matching script and Image 1:
    // JAGO ... ALLOBANK -> TOTAL -> BONUS711
    const keys = VALIDATION_BANKS_CONFIG.map(b => b.key);
    const values = keys.map(k => String(parsedPlResult.countsByBank[k] || 0));
    values.push(String(parsedPlResult.totalBankCount || 0));
    values.push(String(parsedPlResult.bonus711Count || 0));

    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedCountsRow(true);

    if (autoClearPl) {
      setPlInputText('');
    }
    setTimeout(() => setCopiedCountsRow(false), 2500);
  };

  const handleCopyAllColumns = () => {
    const headers = [...VALIDATION_BANKS_CONFIG.map(b => b.label), 'TOTAL', 'BONUS711'];
    const keys = VALIDATION_BANKS_CONFIG.map(b => b.key);
    const values = keys.map(k => String(parsedPlResult.countsByBank[k] || 0));
    values.push(String(parsedPlResult.totalBankCount || 0));
    values.push(String(parsedPlResult.bonus711Count || 0));

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

    const activeBankLines = VALIDATION_BANKS_CONFIG
      .filter(b => (parsedPlResult.countsByBank[b.key] || 0) > 0)
      .map(b => `• ${b.label}: ${parsedPlResult.countsByBank[b.key]} Transaksi`)
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
  // TAB 2: REKAP HISTORY KOIN STATE & PARSER
  // ==========================================
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [rawKoinRows, setRawKoinRows] = useState<any[]>([]);
  const [copiedKoinRow, setCopiedKoinRow] = useState<boolean>(false);
  const [copiedKoinFull, setCopiedKoinFull] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [filterPreview, setFilterPreview] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'QRIS' | 'PGA_SPV'>('ALL');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalization and Helper Functions from Script
  const normalizeTextKoin = (value: any): string => {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  };

  const parseCoinValue = (value: any): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;

    let text = String(value ?? '').trim();
    if (!text) return 0;

    text = text.replace(/\s/g, '');
    text = text.replace(/,/g, '');
    text = text.replace(/[^0-9.\-]/g, '');

    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  };

  const getRowValue = (row: any, possibleNames: string[]): any => {
    for (const key of Object.keys(row)) {
      const cleanKey = normalizeTextKoin(key).replace(/\s+/g, '');

      for (const name of possibleNames) {
        const cleanName = normalizeTextKoin(name).replace(/\s+/g, '');
        if (cleanKey === cleanName) return row[key];
      }
    }
    return '';
  };

  // Process Excel / CSV File matching the Script
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedFileName(file.name);
    setIsParsingFile(true);

    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      let rawData: any[] = [];

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } else {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      }

      setRawKoinRows(rawData);
    } catch (err) {
      console.error('Error parsing history koin file:', err);
    } finally {
      setIsParsingFile(false);
    }
  };

  // Sample Demo Preset for instant test
  const handleLoadSampleKoin = () => {
    setUploadedFileName('sample_history_koin_711.xlsx');
    const demoData = [
      { Info: 'Deposit', BY: 'admin_pagi', Coin: 1500000 },
      { Info: 'Deposit', BY: 'pga2_garuda', Coin: 2300000 },
      { Info: 'Deposit', BY: 'admin_pagi', Coin: 850000 },
      { Info: 'Deposit (PGA)', BY: 'pga', Coin: 750000 },
      { Info: 'Deposit (PGA)', BY: 'pga', Coin: 1250000 },
      { Info: 'Deposit', BY: 'pga2_express', Coin: 650000 },
      { Info: 'Withdraw', BY: 'admin_pagi', Coin: -1200000 },
      { Info: 'Withdraw', BY: 'admin_pagi', Coin: -800000 },
      { Info: 'Withdraw (PGA-IDF)', BY: 'admin_pagi', Coin: -1500000 },
      { Info: 'Withdraw', BY: 'autowd_engine', Coin: -450000 },
    ];
    setRawKoinRows(demoData);
  };

  // Reset Rekap Koin
  const handleResetKoin = () => {
    setUploadedFileName('');
    setRawKoinRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 14 Column Calculations matching Script Exactly
  const rekapKoinStats = useMemo(() => {
    const res = {
      deposit: 0,
      qris: 0,
      withdraw: 0,
      dpPgaSpv: 0,
      wdPgaSpv: 0,
      totalDeposit: 0,
      realWithdraw: 0,
      hasil: 0,
      formDp: 0,
      formDpGaruda: 0,
      formDpQris: 0,
      totalFormDp: 0,
      formWd: 0,
      formAutoWd: 0
    };

    if (rawKoinRows.length === 0) {
      return res;
    }

    for (const row of rawKoinRows) {
      const info = normalizeTextKoin(getRowValue(row, ['Info']));
      const by = normalizeTextKoin(getRowValue(row, ['BY', 'By']));
      const coin = parseCoinValue(getRowValue(row, ['Coin']));

      const isDeposit = info === 'deposit';
      const isDepositPga = info === 'deposit (pga)';
      const isWithdraw = info === 'withdraw';
      const isWithdrawPgaIdf =
        info === 'withdraw(pga-idf)' ||
        info === 'withdraw (pga-idf)';
      const isReject = info.includes('reject');

      if (isDeposit) {
        res.deposit += coin;

        if (by.includes('pga2')) {
          res.formDpGaruda += 1;
        } else {
          res.formDp += 1;
        }
      }

      if (isDepositPga) {
        res.qris += coin;
        if (by === 'pga') res.formDpQris += 1;
      }

      if (!isReject && (isWithdraw || isWithdrawPgaIdf)) {
        res.withdraw += Math.abs(coin);

        if (by.includes('autowd')) {
          res.formAutoWd += 1;
        } else {
          res.formWd += 1;
        }
      }
    }

    res.dpPgaSpv = 0;
    res.wdPgaSpv = 0;
    res.totalDeposit = res.deposit + res.qris + res.dpPgaSpv;
    res.realWithdraw = res.withdraw - res.wdPgaSpv;
    res.hasil = res.totalDeposit - res.realWithdraw;
    res.totalFormDp =
      res.formDp +
      res.formDpGaruda +
      res.formDpQris;

    return res;
  }, [rawKoinRows]);

  // Transformed preview rows
  const previewKoinRows = useMemo(() => {
    return rawKoinRows.map((row, idx) => {
      const info = normalizeTextKoin(getRowValue(row, ['Info']));
      const by = normalizeTextKoin(getRowValue(row, ['BY', 'By']));
      const coin = parseCoinValue(getRowValue(row, ['Coin']));

      let type: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
      let subType: 'REGULAR' | 'QRIS' | 'PGA_SPV' | 'GARUDA' | 'AUTO_WD' = 'REGULAR';

      if (info === 'deposit (pga)') {
        type = 'DEPOSIT';
        subType = 'QRIS';
      } else if (info === 'deposit') {
        type = 'DEPOSIT';
        subType = by.includes('pga2') ? 'GARUDA' : (by.includes('spv') || by.includes('pga') ? 'PGA_SPV' : 'REGULAR');
      } else if (info.includes('withdraw')) {
        type = 'WITHDRAW';
        subType = by.includes('autowd') ? 'AUTO_WD' : (by.includes('spv') || by.includes('pga') ? 'PGA_SPV' : 'REGULAR');
      }

      return {
        id: `koin-row-${idx}`,
        info: String(getRowValue(row, ['Info']) || info),
        by: String(getRowValue(row, ['BY', 'By']) || by),
        coin: Math.abs(coin),
        type,
        subType: subType as 'REGULAR' | 'QRIS' | 'PGA_SPV' | 'GARUDA' | 'AUTO_WD'
      };
    });
  }, [rawKoinRows]);

  // Copy 14 TSV Values for Excel/Google Sheets matching Script
  const handleCopyKoinOnly = () => {
    const order = [
      'deposit',
      'qris',
      'withdraw',
      'dpPgaSpv',
      'wdPgaSpv',
      'totalDeposit',
      'realWithdraw',
      'hasil',
      'formDp',
      'formDpGaruda',
      'formDpQris',
      'totalFormDp',
      'formWd',
      'formAutoWd'
    ] as const;

    const values = order.map(key => rekapKoinStats[key]);
    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedKoinRow(true);
    setTimeout(() => setCopiedKoinRow(false), 2500);
  };

  const handleCopyKoinWithHeader = () => {
    const headers = [
      'Deposit',
      'Total QRIS IDN',
      'Withdraw',
      'DP PGA SPV',
      'WD PGA SPV',
      'Total Deposit',
      'Real Withdraw',
      'Hasil',
      'Form DP',
      'Form DP garuda',
      'Form DP QRIS',
      'Total Form DP',
      'Form WD',
      'Form auto WD'
    ];
    const order = [
      'deposit',
      'qris',
      'withdraw',
      'dpPgaSpv',
      'wdPgaSpv',
      'totalDeposit',
      'realWithdraw',
      'hasil',
      'formDp',
      'formDpGaruda',
      'formDpQris',
      'totalFormDp',
      'formWd',
      'formAutoWd'
    ] as const;

    const values = order.map(key => rekapKoinStats[key]);
    const fullTsv = `${headers.join('\t')}\n${values.join('\t')}`;
    navigator.clipboard.writeText(fullTsv);
    setCopiedKoinFull(true);
    setTimeout(() => setCopiedKoinFull(false), 2500);
  };

  // ==========================================
  // TAB 3: DATA TURNOVER (EXTRACTOR TRANSAKSI LENGKAP) - EXACT SCRIPT LOGIC
  // ==========================================
  const TURNOVER_GROUPS = [
    { key: "TOGEL", label: "TOGEL", aliases: ["TOGEL", "TOTO"] },
    { key: "TOTOMACAU", label: "TOTOMACAU", aliases: ["TOTOMACAU", "TOTO MACAU"] },
    { key: "TOTOMACAU_5D", label: "TOTOMACAU 5D", aliases: ["TOTOMACAU 5D", "TOTO MACAU 5D", "TOTOMACAU5D"] },
    { key: "KINGKONG_4D", label: "KINGKONG 4D", aliases: ["KINGKONG 4D", "KINGKONG4D"] },
    { key: "PRAGMATIC", label: "Pragmatic Play", aliases: ["PRAGMATIC PLAY", "PRAGMATIC"] },
    { key: "ELOTTERY", label: "Elottery", aliases: ["ELOTTERY", "E-LOTTERY"] },
    { key: "ARCADE", label: "Arcade", aliases: ["ARCADE"] },
    { key: "POKER", label: "poker", aliases: ["POKER"] },
    { key: "ESPORTS", label: "Esports", aliases: ["ESPORTS", "E-SPORTS"] },
    { key: "SBO", label: "Sbo Sportsbook", aliases: ["SBO SPORTSBOOK", "SBO"] },
    { key: "SABA", label: "Saba Sportsbook", aliases: ["SABA SPORTSBOOK", "SABA"] },
    { key: "STREAMSPIN", label: "Streamspin", aliases: ["STREAMSPIN"] },
    { key: "STREAMSPIN_GIFT", label: "Streamspin Gift", aliases: ["STREAMSPIN GIFT"] },
    { key: "PP98", label: "Pp98", aliases: ["PP98", "PP 98"] },
    { key: "LIVE_GAME", label: "Live Game", aliases: ["LIVE GAME", "LIVEGAME"] },
    { key: "SLOT", label: "Slot", aliases: ["SLOT"] },
    { key: "TOTAL", label: "TOTAL", aliases: ["TOTAL ALL", "TOTAL"] }
  ];

  const SAMPLE_TRANSAKSI_LENGKAP = `TOGEL	15,450,000	-2,340,000
TOTOMACAU	28,900,000	+4,120,000
TOTOMACAU 5D	8,650,000	-1,200,000
KINGKONG 4D	4,300,000	+650,000
Pragmatic Play	85,400,000	-12,500,000
Elottery	2,100,000	-350,000
Arcade	6,750,000	+980,000
poker	18,200,000	+1,450,000
Esports	3,400,000	-450,000
Sbo Sportsbook	42,600,000	+8,300,000
Saba Sportsbook	21,150,000	-3,200,000
Streamspin	1,850,000	-250,000
Streamspin Gift	950,000	+150,000
Pp98	3,200,000	-600,000
Live Game	54,800,000	+11,200,000
Slot	98,600,000	-14,350,000`;

  const [rawTurnoverText, setRawTurnoverText] = useState<string>('');
  const [clipboardHtml, setClipboardHtml] = useState<string>('');
  const [turnoverValues, setTurnoverValues] = useState<Record<string, { turnover: string; wl: string }>>(() => {
    const obj: Record<string, { turnover: string; wl: string }> = {};
    TURNOVER_GROUPS.forEach(g => { obj[g.key] = { turnover: '0', wl: '0' }; });
    return obj;
  });
  const [copiedTurnoverRow, setCopiedTurnoverRow] = useState<boolean>(false);
  const [extractorStatusMsg, setExtractorStatusMsg] = useState<string>('');

  // Helper Functions from Extractor Script
  function norm(s: any): string {
    return String(s || '')
      .replace(/\u00a0/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '');
  }

  function cleanNumber(s: any): string {
    let t = String(s || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[−–—]/g, '-')
      .trim();

    const paren = t.match(/\(\s*(\d[\d,]*(?:\.\d+)?)\s*\)/);
    if (paren) return '-' + paren[1];

    const m = t.match(/[+-]?\d[\d,]*(?:\.\d+)?/);
    return m ? m[0] : '';
  }

  function isPercent(s: any): boolean {
    return /%/.test(String(s || ''));
  }

  function findGroup(name: string) {
    const n = norm(name);
    return TURNOVER_GROUPS.find(g => g.aliases.some(a => norm(a) === n)) || null;
  }

  function defaultValues() {
    const obj: Record<string, { turnover: string; wl: string }> = {};
    TURNOVER_GROUPS.forEach(g => { obj[g.key] = { turnover: '0', wl: '0' }; });
    return obj;
  }

  function parseHtml(html: string) {
    const out = defaultValues();
    if (!html) return out;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));

    let turnoverIndex = -1;
    let wlIndex = -1;

    for (const tr of rows) {
      const cells = Array.from(tr.querySelectorAll('th,td')).map(x => (x.textContent || '').trim());
      if (!cells.length) continue;

      cells.forEach((c, i) => {
        const n = norm(c);
        if (turnoverIndex === -1 && n.includes('TURNOVER')) {
          turnoverIndex = i;
        }

        if (
          wlIndex === -1 &&
          (
            n.includes('WLGAME') ||
            n.includes('PLAYERMENANGKALAH') ||
            n === 'WL' ||
            n.includes('WINLOSS')
          )
        ) {
          wlIndex = i;
        }
      });

      if (turnoverIndex !== -1 && wlIndex !== -1) break;
    }

    rows.forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('th,td')).map(x => (x.textContent || '').trim());
      if (!cells.length) return;

      let grp = null;
      let idx = -1;

      for (let i = 0; i < Math.min(6, cells.length); i++) {
        grp = findGroup(cells[i]);
        if (grp) { idx = i; break; }
      }

      if (!grp || grp.key === 'TOTAL') return;

      let turnover = '';
      let wl = '';

      if (
        turnoverIndex >= 0 &&
        wlIndex >= 0 &&
        turnoverIndex < cells.length &&
        wlIndex < cells.length
      ) {
        turnover = cleanNumber(cells[turnoverIndex]);
        wl = cleanNumber(cells[wlIndex]);
      }

      if (turnover === '' || wl === '') {
        const after = cells.slice(idx + 1);
        const nums: string[] = [];

        for (const c of after) {
          if (isPercent(c)) continue;
          const n = cleanNumber(c);
          if (n !== '') nums.push(n);
        }

        if (nums.length >= 2) {
          turnover = nums[0];
          wl = nums[1];
        }
      }

      if (turnover !== '' && wl !== '') {
        out[grp.key] = { turnover, wl };
      }
    });

    return out;
  }

  function hasRealValue(v: any): boolean {
    return !!v && (String(v.turnover) !== '0' || String(v.wl) !== '0');
  }

  function mergeParsed(primary: any, secondary: any) {
    const out = defaultValues();
    TURNOVER_GROUPS.forEach(g => {
      if (g.key === 'TOTAL') return;
      const a = primary && primary[g.key];
      const b = secondary && secondary[g.key];
      out[g.key] = hasRealValue(a) ? a : (hasRealValue(b) ? b : { turnover: '0', wl: '0' });
    });
    return out;
  }

  function parseText(text: string) {
    const out = defaultValues();

    const raw = String(text || '')
      .replace(/\r/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[−–—]/g, '-')
      .replace(/\u2028|\u2029/g, '\n');

    const lines = raw.split(/\n+/);

    const candidates: { g: typeof TURNOVER_GROUPS[0]; a: string }[] = [];
    TURNOVER_GROUPS.forEach(g => {
      if (g.key === 'TOTAL') return;
      g.aliases.forEach(a => candidates.push({ g, a }));
    });
    candidates.sort((x, y) => y.a.length - x.a.length);

    let turnoverIndex = -1;
    let wlIndex = -1;

    for (const originalLine of lines) {
      const tabCells = originalLine.split('\t').map(x => x.trim());
      if (tabCells.length < 2) continue;

      tabCells.forEach((c, i) => {
        const n = norm(c);

        if (turnoverIndex === -1 && n.includes('TURNOVER')) {
          turnoverIndex = i;
        }

        if (
          wlIndex === -1 &&
          (
            n.includes('WLGAME') ||
            n.includes('PLAYERMENANGKALAH') ||
            n === 'WL' ||
            n.includes('WINLOSS')
          )
        ) {
          wlIndex = i;
        }
      });

      if (turnoverIndex !== -1 && wlIndex !== -1) break;
    }

    for (const originalLine of lines) {
      const line = originalLine.trim();
      if (!line) continue;

      const tabCells = originalLine.split('\t').map(x => x.trim());

      let matched: { item: { g: typeof TURNOVER_GROUPS[0]; a: string }; re?: RegExp } | null = null;
      let matchedCellIndex = -1;

      if (tabCells.length > 1) {
        for (let i = 0; i < Math.min(6, tabCells.length); i++) {
          const g = findGroup(tabCells[i]);
          if (g && g.key !== 'TOTAL') {
            matched = { item: { g, a: tabCells[i] } };
            matchedCellIndex = i;
            break;
          }
        }
      }

      if (!matched) {
        for (const item of candidates) {
          const esc = item.a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const aliasPattern = esc.replace(/\s+/g, '\\s+');
          const re = new RegExp('^\\s*' + aliasPattern + '(?=\\s|\\t|:|-)', 'i');

          if (re.test(line)) {
            matched = { item, re };
            break;
          }
        }
      }

      if (!matched) continue;

      let turnover = '';
      let wl = '';

      if (
        tabCells.length > 1 &&
        turnoverIndex >= 0 &&
        wlIndex >= 0 &&
        turnoverIndex < tabCells.length &&
        wlIndex < tabCells.length
      ) {
        turnover = cleanNumber(tabCells[turnoverIndex]);
        wl = cleanNumber(tabCells[wlIndex]);
      }

      if (turnover === '' || wl === '') {
        let rest = line;

        if (matched.re) {
          rest = line.replace(matched.re, '').replace(/^[\s\t:|-]+/, '');
        } else if (matchedCellIndex >= 0) {
          rest = tabCells.slice(matchedCellIndex + 1).join('\t');
        }

        const parts = rest.match(/\(?[+-]?\d[\d,]*(?:\.\d+)?\)?%?/g) || [];
        const nums: string[] = [];

        for (const p of parts) {
          if (isPercent(p)) continue;
          const n = cleanNumber(p);
          if (n !== '') nums.push(n);
        }

        if (nums.length >= 2) {
          turnover = nums[0];
          wl = nums[1];
        }
      }

      if (turnover !== '' && wl !== '') {
        out[matched.item.g.key] = { turnover, wl };
      }
    }

    const flat = raw.replace(/\s+/g, ' ').trim();

    for (const item of candidates) {
      if (hasRealValue(out[item.g.key])) continue;

      const esc = item.a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const aliasPattern = esc.replace(/\s+/g, '\\s+');

      const re = new RegExp(
        '(?:^|\\s)' + aliasPattern +
        '\\s+([+-]?\\d[\\d,]*(?:\\.\\d+)?)' +
        '\\s+(?:[+-]?\\d+(?:\\.\\d+)?%\\s+)?' +
        '([+-]?\\d[\\d,]*(?:\\.\\d+)?)',
        'i'
      );

      const m = flat.match(re);
      if (m) {
        out[item.g.key] = {
          turnover: m[1],
          wl: m[2]
        };
      }
    }

    return out;
  }

  function toNumber(v: any): number {
    const n = parseFloat(String(v ?? '0').replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Exact Sign Inversion Rule for WL_GAME:
  //  100.00  -> -100.00
  // -100.00  -> +100.00
  // +100.00  -> -100.00
  //  0       -> 0
  function invertWLValue(v: any): string {
    const raw = String(v ?? '0').trim();
    const n = toNumber(raw);

    if (n === 0 || raw === '') return '0';

    const unsigned = raw.replace(/^[+-]/, '');
    return n < 0 ? '+' + unsigned : '-' + unsigned;
  }

  function applyWLRuleToAllColumns(source: Record<string, { turnover: string; wl: string }>) {
    const out = defaultValues();

    TURNOVER_GROUPS.forEach(g => {
      if (g.key === 'TOTAL') return;

      const item = source[g.key] || { turnover: '0', wl: '0' };

      out[g.key] = {
        turnover: item.turnover ?? '0',
        wl: invertWLValue(item.wl ?? '0')
      };
    });

    return out;
  }

  function calculateTotal(valObj: Record<string, { turnover: string; wl: string }>) {
    let totalTurnover = 0;
    let totalWL = 0;

    TURNOVER_GROUPS.forEach(g => {
      if (g.key === 'TOTAL') return;
      const v = valObj[g.key] || { turnover: '0', wl: '0' };
      totalTurnover += toNumber(v.turnover);
      totalWL += toNumber(v.wl);
    });

    valObj.TOTAL = {
      turnover: formatNumber(totalTurnover),
      wl: totalWL > 0 ? '+' + formatNumber(totalWL) : formatNumber(totalWL)
    };
  }

  const handleProcessTurnoverData = () => {
    const fromHtml = clipboardHtml ? parseHtml(clipboardHtml) : defaultValues();
    const fromText = parseText(rawTurnoverText);
    const rawVals = mergeParsed(fromHtml, fromText);

    // Apply rule: inverse sign for all WL_GAME columns
    const finalVals = applyWLRuleToAllColumns(rawVals);
    calculateTotal(finalVals);

    setTurnoverValues(finalVals);

    const count = Object.entries(finalVals).filter(([k, v]) =>
      k !== 'TOTAL' && (v.turnover !== '0' || v.wl !== '0')
    ).length;

    const checked = ['PRAGMATIC', 'POKER', 'SABA', 'LIVE_GAME']
      .map(k => `${TURNOVER_GROUPS.find(g => g.key === k)?.label || k}: ${finalVals[k]?.wl ?? '0'}`)
      .join(' | ');

    setExtractorStatusMsg(
      `Selesai. ${count} kelompok data terbaca. Semua kolom WL_GAME sudah dibalik: plus jadi minus, minus jadi plus. ${checked} | TOTAL WL_GAME = ${finalVals.TOTAL.wl}`
    );
  };

  function sanitizeCopyValue(v: any): string {
    let s = String(v ?? '').trim();
    s = s.replace(/^=+\s*/, '');
    s = s.replace(/^\+\s*/, '');
    return s;
  }

  function getFlatValuesForCopy() {
    const arr: string[] = [];

    TURNOVER_GROUPS.forEach(g => {
      if (g.key === 'TOTAL') return;
      if (g.key === 'SLOT') arr.push('', '');

      const v = turnoverValues[g.key] || { turnover: '0', wl: '0' };
      arr.push(sanitizeCopyValue(v.turnover));
      arr.push(sanitizeCopyValue(v.wl));
    });

    return arr;
  }

  const handleCopyTurnoverRow = () => {
    const data = getFlatValuesForCopy();
    const tsvString = data.join('\t');
    navigator.clipboard.writeText(tsvString);
    setCopiedTurnoverRow(true);
    setExtractorStatusMsg(
      'Data berhasil disalin. Semua WL_GAME sudah memakai hasil pembalikan tanda. Nilai negatif tetap membawa tanda minus.'
    );
    setTimeout(() => setCopiedTurnoverRow(false), 2500);
  };

  const handleClearTurnover = () => {
    setRawTurnoverText('');
    setClipboardHtml('');
    const fresh = defaultValues();
    calculateTotal(fresh);
    setTurnoverValues(fresh);
    setExtractorStatusMsg('Data dibersihkan.');
  };

  const handleLoadSampleTurnover = () => {
    setRawTurnoverText(SAMPLE_TRANSAKSI_LENGKAP);
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
      {/* TAB 2: REKAP HISTORY KOIN (Persis Gambar Uploaded User)   */}
      {/* ========================================================= */}
      {activeTab === 'rekap-koin' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#080d17] border border-cyan-500/30 shadow-2xl space-y-6">
            
            {/* Top Badge: REKAP HISTORY KOIN (Persis Gambar) */}
            <div className="text-center space-y-2.5">
              <div className="inline-block px-7 py-1.5 rounded-full bg-[#05131d] border border-cyan-500/50 text-[#00F3FF] text-xs font-black font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(0,243,255,0.25)]">
                REKAP HISTORY KOIN
              </div>
              <p className="text-xs sm:text-sm text-gray-300 font-mono">
                Upload file Excel/CSV history koin. Rekap akan dihitung otomatis dari kolom <strong className="text-cyan-300">Info</strong>, <strong className="text-cyan-300">BY</strong>, dan <strong className="text-cyan-300">Coin</strong>.
              </p>
            </div>

            {/* Controls Bar: Pilih File, Copy Hasil Saja, Reset (Persis Gambar) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {/* File Input Box */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#040813] border border-cyan-500/40 text-xs font-mono text-gray-300 shadow-inner">
                <label className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-black font-bold text-xs font-sans cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-black" />
                  <span>Pilih File</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-300 max-w-[180px] sm:max-w-[280px] truncate font-mono">
                  {uploadedFileName || 'Tidak ada file yang dipilih'}
                </span>
              </div>

              {/* Copy Hasil Saja Button (Orange / Yellow Gold) */}
              <button
                type="button"
                onClick={handleCopyKoinOnly}
                className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] text-black font-black text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-2"
                title="Menyalin 14 angka hasil rekap (dipisahkan TAB) untuk ditempel ke Excel/Google Sheets"
              >
                {copiedKoinRow ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedKoinRow ? 'Hasil Tersalin!' : 'Copy Hasil Saja'}</span>
              </button>

              {/* Reset Button (Dark Red) */}
              <button
                type="button"
                onClick={handleResetKoin}
                className="px-6 py-2.5 rounded-xl bg-[#3B1219] hover:bg-[#521A24] active:scale-[0.98] text-rose-200 border border-rose-600/40 font-black text-xs font-mono transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-rose-300" />
                <span>Reset</span>
              </button>
            </div>

            {/* Quick Demo & Status Text */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left pt-1">
              <p className="text-xs text-gray-400 font-mono">
                {isParsingFile ? (
                  <span className="text-yellow-400 flex items-center justify-center sm:justify-start gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sedang memproses file Excel/CSV...
                  </span>
                ) : uploadedFileName ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center sm:justify-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    File "{uploadedFileName}" terbaca ({rawKoinRows.length} baris transaksi)
                  </span>
                ) : (
                  'Upload file Excel/CSV history koin, lalu rekap akan muncul otomatis.'
                )}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleKoin}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Contoh Data (Demo)</span>
                </button>
                {rawKoinRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDataPreview(!showDataPreview)}
                    className="px-3 py-1 rounded-lg bg-[#131d2e] hover:bg-[#1a2840] text-gray-300 text-xs font-mono font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{showDataPreview ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 14-KOLOM TABEL REKAPAN KOIN (PERSIS GAMBAR DENGAN WARNA & TAMPILAN RESMI)   */}
            {/* ========================================================================= */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-[#040711] overflow-x-auto shadow-2xl">
              <table className="w-full border-collapse font-mono text-xs text-center whitespace-nowrap">
                {/* Header Row: Orange/Golden Amber Background */}
                <thead>
                  <tr className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black uppercase text-xs tracking-wider">
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Deposit</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Total QRIS IDN</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Withdraw</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">DP PGA SPV</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">WD PGA SPV</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Total Deposit</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Real Withdraw</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Hasil</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Form DP</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Form DP garuda</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Form DP QRIS</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Total Form DP</th>
                    <th className="px-4 py-3.5 border-r border-amber-600/40">Form WD</th>
                    <th className="px-4 py-3.5">Form auto WD</th>
                  </tr>
                </thead>

                {/* Data Row: Warna Cell Persis Gambar (White, Yellow, Green) */}
                <tbody>
                  <tr className="font-extrabold text-sm text-black">
                    {/* 1. Deposit (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.deposit.toLocaleString('id-ID')}
                    </td>

                    {/* 2. Total QRIS IDN (Yellow) */}
                    <td className="px-4 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {rekapKoinStats.qris.toLocaleString('id-ID')}
                    </td>

                    {/* 3. Withdraw (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.withdraw.toLocaleString('id-ID')}
                    </td>

                    {/* 4. DP PGA SPV (Green) */}
                    <td className="px-4 py-3.5 bg-[#00FF66] border-r border-zinc-300 font-black">
                      {rekapKoinStats.dpPgaSpv.toLocaleString('id-ID')}
                    </td>

                    {/* 5. WD PGA SPV (Green) */}
                    <td className="px-4 py-3.5 bg-[#00FF66] border-r border-zinc-300 font-black">
                      {rekapKoinStats.wdPgaSpv.toLocaleString('id-ID')}
                    </td>

                    {/* 6. Total Deposit (Yellow) */}
                    <td className="px-4 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {rekapKoinStats.totalDeposit.toLocaleString('id-ID')}
                    </td>

                    {/* 7. Real Withdraw (Yellow) */}
                    <td className="px-4 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {rekapKoinStats.realWithdraw.toLocaleString('id-ID')}
                    </td>

                    {/* 8. Hasil (Yellow) */}
                    <td className="px-4 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {rekapKoinStats.hasil.toLocaleString('id-ID')}
                    </td>

                    {/* 9. Form DP (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.formDp}
                    </td>

                    {/* 10. Form DP garuda (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.formDpGaruda}
                    </td>

                    {/* 11. Form DP QRIS (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.formDpQris}
                    </td>

                    {/* 12. Total Form DP (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.totalFormDp}
                    </td>

                    {/* 13. Form WD (White) */}
                    <td className="px-4 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {rekapKoinStats.formWd}
                    </td>

                    {/* 14. Form auto WD (White) */}
                    <td className="px-4 py-3.5 bg-white font-bold">
                      {rekapKoinStats.formAutoWd}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtext Footnote (Persis Gambar) */}
            <p className="text-xs text-gray-400 text-center font-mono">
              Hasil copy dipisahkan dengan TAB agar bisa langsung ditempel ke Excel/Google Sheets.
            </p>

            {/* Additional Secondary Action: Copy dengan Header */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleCopyKoinWithHeader}
                className="px-4 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a2840] text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                {copiedKoinFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Table className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedKoinFull ? 'Header + Data Tersalin!' : 'Copy Baris Header + Nilai (TSV)'}</span>
              </button>
            </div>

            {/* Optional Collapsible Audit Preview Table */}
            {showDataPreview && previewKoinRows.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#040810] border border-cyan-500/30 space-y-3 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Pratinjau Data Transaksi Terbaca ({previewKoinRows.length} Baris):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['ALL', 'DEPOSIT', 'WITHDRAW', 'QRIS', 'PGA_SPV'] as const).map((f) => (
                      <button
                        key={`filter-${f}`}
                        onClick={() => setFilterPreview(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          filterPreview === f
                            ? 'bg-cyan-500 text-black font-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0b1424] text-gray-300 sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-white/10">#</th>
                        <th className="p-2 border-b border-white/10">Info</th>
                        <th className="p-2 border-b border-white/10">BY</th>
                        <th className="p-2 border-b border-white/10">Tipe</th>
                        <th className="p-2 border-b border-white/10">Kategori</th>
                        <th className="p-2 border-b border-white/10 text-right">Coin (Nominal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewKoinRows
                        .filter((r) => {
                          if (filterPreview === 'DEPOSIT') return r.type === 'DEPOSIT';
                          if (filterPreview === 'WITHDRAW') return r.type === 'WITHDRAW';
                          if (filterPreview === 'QRIS') return r.subType === 'QRIS';
                          if (filterPreview === 'PGA_SPV') return r.subType === 'PGA_SPV';
                          return true;
                        })
                        .slice(0, 100)
                        .map((r, i) => (
                          <tr key={r.id} className="hover:bg-white/[0.03]">
                            <td className="p-2 text-gray-500">{i + 1}</td>
                            <td className="p-2 text-white font-medium">{r.info}</td>
                            <td className="p-2 text-cyan-300">{r.by}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {r.type}
                              </span>
                            </td>
                            <td className="p-2 text-gray-400 text-[10px]">{r.subType}</td>
                            <td className="p-2 text-right font-bold text-yellow-300">
                              Rp {r.coin.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATA TURNOVER (EXTRACTOR TRANSAKSI LENGKAP)        */}
      {/* ========================================================= */}
      {activeTab === 'data-turnover' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#080d17] border border-cyan-500/30 shadow-2xl space-y-6">
            
            {/* Top Badge: DATA TRANSAKSI LENGKAP */}
            <div className="text-center">
              <div className="inline-block px-7 py-1.5 rounded-full bg-[#05131d] border border-cyan-500/50 text-[#00F3FF] text-xs font-black font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(0,243,255,0.25)]">
                DATA TRANSAKSI LENGKAP
              </div>
            </div>

            {/* Extractor Laporan Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide font-sans">
                  Extractor Laporan
                </h3>
                <p className="text-xs text-gray-300 font-mono mt-0.5">
                  Paste tabel <strong className="text-cyan-300">Transaksi Lengkap</strong>, lalu tekan <strong className="text-cyan-300">Proses Data</strong>. Sistem mengambil TURNOVER dan WL_GAME.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-[#040810] border border-white/20 text-[11px] font-mono font-bold text-gray-300 shadow-inner flex items-center gap-1.5">
                <span className="text-cyan-400 font-mono">Ctrl + Enter</span>
                <span>= Proses</span>
              </div>
            </div>

            {/* Textarea Input Container */}
            <div className="rounded-2xl bg-[#040810] border border-cyan-500/40 p-4 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-extrabold text-cyan-400 tracking-wider">DATA TRANSAKSI LENGKAP</span>
                <span className="text-gray-400 text-[11px]">
                  {rawTurnoverText.length} karakter • {rawTurnoverText ? rawTurnoverText.split(/\r?\n/).filter(Boolean).length : 0} baris
                </span>
              </div>
              <textarea
                rows={7}
                value={rawTurnoverText}
                onChange={(e) => setRawTurnoverText(e.target.value)}
                onPaste={(e) => {
                  const html = e.clipboardData.getData('text/html');
                  if (html) {
                    setClipboardHtml(html);
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleProcessTurnoverData();
                  }
                }}
                placeholder="Paste tabel laporan di sini..."
                className="w-full bg-transparent text-gray-200 font-mono text-xs focus:outline-none resize-y p-1 leading-relaxed placeholder:text-gray-600 min-h-[140px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleProcessTurnoverData}
                className="px-6 py-2.5 rounded-xl bg-[#00F3FF] hover:bg-[#00d0dc] active:scale-[0.98] text-black font-black text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.35)] flex items-center gap-2 uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                <span>PROSES DATA</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTurnoverRow}
                className="px-6 py-2.5 rounded-xl bg-[#00FF66] hover:bg-[#00dd55] active:scale-[0.98] text-black font-black text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.35)] flex items-center gap-2 uppercase tracking-wider"
                title="Salin 34 nilai baris data (dipisahkan TAB) untuk Excel/Google Sheets"
              >
                {copiedTurnoverRow ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedTurnoverRow ? 'BARIS TERSALIN!' : 'SALIN BARIS DATA'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearTurnover}
                className="px-6 py-2.5 rounded-xl bg-[#131d2e] hover:bg-[#1a2840] active:scale-[0.98] text-gray-200 border border-white/20 font-black text-xs font-mono transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
              >
                <RotateCcw className="w-4 h-4 text-gray-300" />
                <span>BERSIHKAN</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleTurnover}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs font-mono transition-all cursor-pointer sm:ml-auto flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Contoh Data (Demo)</span>
              </button>
            </div>

            {/* Status Feedback Message */}
            {extractorStatusMsg && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 leading-relaxed">
                {extractorStatusMsg}
              </div>
            )}

            {/* Hasil Data Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-extrabold text-white text-sm tracking-wider uppercase">HASIL DATA</span>
                <span className="text-gray-400 text-[11px]">Geser horizontal untuk melihat seluruh data</span>
              </div>

              {/* 34-Column Table */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-[#040711] overflow-x-auto shadow-2xl">
                <table className="w-full border-collapse font-mono text-xs text-center whitespace-nowrap">
                  <thead>
                    {/* Row 1: Categories */}
                    <tr className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black uppercase text-xs tracking-wider">
                      {TURNOVER_GROUPS.filter(g => g.key !== 'TOTAL').map((cat) => (
                        <th key={`head1-${cat.key}`} colSpan={2} className="px-4 py-3 border-r border-amber-600/40">
                          {cat.label}
                        </th>
                      ))}
                      <th colSpan={2} className="px-4 py-3 bg-[#f59e0b] text-black font-black">
                        TOTAL
                      </th>
                    </tr>

                    {/* Row 2: Sub-headers TURNOVER & WL_GAME */}
                    <tr className="bg-[#fbbf24] text-black font-black text-[11px] uppercase tracking-wider border-t border-amber-500/50">
                      {TURNOVER_GROUPS.filter(g => g.key !== 'TOTAL').map((cat) => (
                        <React.Fragment key={`head2-${cat.key}`}>
                          <th className="px-3 py-2 border-r border-amber-600/30 font-bold">TURNOVER</th>
                          <th className="px-3 py-2 border-r border-amber-600/40 font-bold">WL_GAME</th>
                        </React.Fragment>
                      ))}
                      <th className="px-3 py-2 border-r border-amber-600/30 font-black">TURNOVER</th>
                      <th className="px-3 py-2 font-black">WL_GAME</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="font-bold text-sm text-black">
                      {TURNOVER_GROUPS.filter(g => g.key !== 'TOTAL').map((cat) => {
                        const data = turnoverValues[cat.key] || { turnover: '0', wl: '0' };
                        const wlNum = toNumber(data.wl);
                        return (
                          <React.Fragment key={`val-${cat.key}`}>
                            <td className="px-3 py-3 bg-white border-r border-zinc-300 font-bold">
                              {data.turnover}
                            </td>
                            <td className={`px-3 py-3 bg-white border-r border-zinc-300 font-bold ${
                              wlNum > 0 ? 'text-emerald-600' : wlNum < 0 ? 'text-rose-600' : 'text-black'
                            }`}>
                              {data.wl}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* TOTAL Cells */}
                      <td className="px-3 py-3 bg-white border-r border-zinc-300 font-black text-black">
                        {turnoverValues.TOTAL?.turnover || '0.00'}
                      </td>
                      <td className={`px-3 py-3 bg-white font-black ${
                        toNumber(turnoverValues.TOTAL?.wl) > 0 ? 'text-emerald-600' : toNumber(turnoverValues.TOTAL?.wl) < 0 ? 'text-rose-600' : 'text-black'
                      }`}>
                        {turnoverValues.TOTAL?.wl || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-400 text-center font-mono pt-1">
                Hasil salin berupa data teks biasa agar mudah ditempel langsung ke Excel, Google Sheets, atau dokumen kerja.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default IsiRekapan;
