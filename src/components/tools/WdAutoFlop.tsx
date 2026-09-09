import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  ArrowUpDown,
  Download,
  AlertCircle,
  Bot,
  Clock,
  User,
  CreditCard,
  DollarSign,
  Timer,
  RefreshCw,
  Zap
} from 'lucide-react';

export interface ParsedWdRow {
  id: string;
  time: string;
  username: string;
  bankInfo: string;
  emptyCol: string;
  amount: string;
  rawTime?: string;
}

const EXAMPLE_FORMAT_1 = `1 188888
Withdraw 2026-09-09 00:19:24 1,000,000 145
G4
MANDIRI, 1140033394092, Sugiyanto
2 menang1000
Withdraw 2026-07-30 11:02:59 455,000 159,208
G1
DANA, 0882005684416, Ahmad Bayu Prasetyo`;

const EXAMPLE_FORMAT_2 = `96\t2026-09-09 00:19:24\t188888\tWithdraw\tSugiyanto, 1140033394092, MANDIRI\t-\t1,000,000\tACCEPT\tjvsaaautowd
97\t2026-08-30 03:49:02\tframudya\tWithdraw\tRAFLY FRAMUDYA, 082216135887, DANA\t-\t250,000\tACCEPT\tjvsaaautowd
98\t2026-08-30 03:43:46\tmontu78\tWithdraw\tKristian Adinegoro Simanjuntak, 1916107801, BNI\t-\t100,000\tACCEPT\tjvsaaautowd`;

const EXAMPLE_FORMAT_3 = `3\t\tzenroel
Withdraw\t2026-07-30 11:06:02\t400,000 \t18,243.62
G5
BCA, 4212336428, CHAIRUL ZEIN prioritas
4\t\tkecakal
Withdraw\t2026-07-30 11:07:08\t80,000 \t302.75
G3
DANA, 081292396707, Leon`;

export const WdAutoFlop: React.FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [copyFormat, setCopyFormat] = useState<'tab' | 'pipe' | 'comma'>('tab');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [sortByTime, setSortByTime] = useState<boolean>(true);
  const [showExampleMenu, setShowExampleMenu] = useState(false);

  // Auto-delete / Auto-Clear Cache timer states
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(true);
  const [autoClearSeconds, setAutoClearSeconds] = useState<number>(5); // 5 detik default
  const [countdown, setCountdown] = useState<number>(0);
  const [justCleared, setJustCleared] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bank name helpers for formatting reversal
  const KNOWN_BANKS = [
    'BCA', 'BRI', 'BNI', 'MANDIRI', 'DANA', 'OVO', 'GOPAY', 'LINKAJA', 'QRIS', 
    'CIMB', 'PERMATA', 'BSI', 'PANIN', 'DANAMON', 'SEABANK', 'JAGO', 'NEO', 
    'BNC', 'MAYBANK', 'BTPN', 'JENIUS', 'SINARMAS', 'OCBC', 'BJB', 'BANK',
    'BTN', 'MEGA', 'ALLO', 'SHOPEEPAY', 'SAKUKU'
  ];

  // Helper to standardize Bank Format to "Nama, NoRek, Bank"
  const standardizeBankFormat = (rawBankStr: string): string => {
    if (!rawBankStr) return '';
    const parts = rawBankStr.includes(',') 
      ? rawBankStr.split(',').map(p => p.trim()).filter(Boolean)
      : rawBankStr.split(/\t+/).map(p => p.trim()).filter(Boolean);

    if (parts.length < 2) return rawBankStr.trim();

    if (parts.length >= 3) {
      const part0Upper = parts[0].toUpperCase();
      const isPart0Bank = KNOWN_BANKS.some(b => part0Upper.startsWith(b) || part0Upper === b);
      
      // If starts with Bank: "MANDIRI, 1140033394092, Sugiyanto" -> "Sugiyanto, 1140033394092, MANDIRI"
      if (isPart0Bank) {
        const bankName = parts[0];
        const accountNo = parts[1];
        const accountName = parts.slice(2).join(', ');
        return `${accountName}, ${accountNo}, ${bankName}`;
      }
    }
    return parts.join(', ');
  };

  // Helper to format hour: strip leading zero for single-digit hours (e.g. 00:19:24 -> 0:19:24, 03:49:02 -> 3:49:02)
  const formatTime = (timeVal: string): string => {
    if (!timeVal) return '-';
    return timeVal.replace(/^0(\d:)/, '$1');
  };

  // Main Parser Engine supporting both Format 1 (multi-line) and Format 2 (single-line tab/space)
  // Even when user ID contains purely digits (e.g. "188888")
  const parsedData = useMemo<ParsedWdRow[]>(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const results: ParsedWdRow[] = [];

    // Helper to identify single-line records (Format 2: Date + Withdraw + Bank + Status/Tabs on one line)
    const isSingleLineRecord = (line: string): boolean => {
      const hasDate = /\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}:\d{2}/.test(line);
      if (!hasDate) return false;
      if (!/withdraw/i.test(line)) return false;
      const upper = line.toUpperCase();
      const hasBank = KNOWN_BANKS.some(b => upper.includes(b)) && line.includes(',');
      const hasStatusOrTabs = /ACCEPT|REJECT|PENDING|CANCEL|jvsaaautowd/i.test(line) || line.split(/\t+/).length >= 5;
      return hasBank && hasStatusOrTabs;
    };

    let currentBlock: Partial<ParsedWdRow> = {};

    const flushBlock = () => {
      if (currentBlock.username || currentBlock.amount || currentBlock.bankInfo) {
        results.push({
          id: `block-${results.length}-${Date.now()}-${Math.random()}`,
          time: formatTime(currentBlock.time || ''),
          rawTime: currentBlock.time || '',
          username: currentBlock.username || '-',
          bankInfo: currentBlock.bankInfo || '-',
          emptyCol: '',
          amount: currentBlock.amount || '0'
        });
        currentBlock = {};
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip header line
      if (line.toLowerCase().startsWith('no') && line.toLowerCase().includes('user') && line.toLowerCase().includes('amount')) {
        continue;
      }

      // 1. Check if Single-line record (Format 2: "96 \t 2026-09-09 00:19:24 \t 188888 \t Withdraw \t Sugiyanto, 1140033394092, MANDIRI \t - \t 1,000,000 \t ACCEPT \t jvsaaautowd")
      if (isSingleLineRecord(line)) {
        flushBlock();

        let timeVal = '';
        let userVal = '';
        let bankVal = '';
        let amountVal = '';

        const dtMatch = line.match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}:\d{2}:\d{2})/);
        if (dtMatch) timeVal = dtMatch[1];

        const tabs = line.split(/\t+/).map(p => p.trim()).filter(Boolean);
        if (tabs.length >= 5) {
          const dateIdx = tabs.findIndex(p => /\d{4}-\d{2}-\d{2}/.test(p));
          const withdrawIdx = tabs.findIndex(p => /^withdraw$/i.test(p));

          // User ID is between date and withdraw (supports pure digits like "188888")
          if (dateIdx !== -1 && withdrawIdx !== -1 && withdrawIdx > dateIdx) {
            userVal = tabs.slice(dateIdx + 1, withdrawIdx).join(' ').trim();
          } else if (withdrawIdx !== -1 && withdrawIdx >= 2) {
            userVal = tabs[withdrawIdx - 1];
          } else if (dateIdx !== -1 && tabs[dateIdx + 1] && !/^withdraw$/i.test(tabs[dateIdx + 1])) {
            userVal = tabs[dateIdx + 1];
          }

          // Bank part:
          let bankPart = '';
          if (withdrawIdx !== -1 && tabs[withdrawIdx + 1] && tabs[withdrawIdx + 1].includes(',')) {
            bankPart = tabs[withdrawIdx + 1];
          } else {
            bankPart = tabs.find(p => p.includes(',') && !p.includes('Withdraw') && !p.includes(':')) || '';
          }
          bankVal = standardizeBankFormat(bankPart);

          // Find amount: search AFTER the bank part or from right to avoid confusing with numeric User ID
          const bankIdx = tabs.indexOf(bankPart);
          const searchParts = bankIdx !== -1 ? tabs.slice(bankIdx + 1) : tabs;
          for (const p of searchParts) {
            if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(p)) {
              amountVal = p;
              break;
            }
          }
          if (!amountVal) {
            for (const p of searchParts) {
              if (/^\d{4,}$/.test(p) && p !== userVal) {
                amountVal = p;
                break;
              }
            }
          }
        } else {
          // Space-separated single line
          const userBeforeWithdraw = line.match(/\s+([a-zA-Z0-9_\-\.]+)\s+Withdraw\b/i);
          if (userBeforeWithdraw) {
            userVal = userBeforeWithdraw[1];
          }

          const afterWithdraw = line.slice(line.toLowerCase().indexOf('withdraw') + 8);
          const amountMatch = afterWithdraw.match(/-\s+([0-9,]+(?:\.\d+)?)/) || afterWithdraw.match(/\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.\d+)?)\b/);
          if (amountMatch) {
            amountVal = amountMatch[1];
          }

          const bankMatch = afterWithdraw.match(/^\s*([\s\S]+?)\s+(?:-\s+|[0-9]{1,3}(?:,[0-9]{3})+)/);
          if (bankMatch) {
            bankVal = standardizeBankFormat(bankMatch[1].trim());
          }
        }

        results.push({
          id: `single-${results.length}-${Date.now()}-${Math.random()}`,
          time: formatTime(timeVal),
          rawTime: timeVal,
          username: userVal || '-',
          bankInfo: bankVal || '-',
          emptyCol: '',
          amount: amountVal || '0'
        });

        continue;
      }

      // 2. Multi-line block parsing (Format 1: "1 188888\nWithdraw 2026-09-09 00:19:24 1,000,000 145\nG4\nMANDIRI, 1140033394092, Sugiyanto")
      // Skip group indicators like G1, G4, G5
      if (/^G\d+$/i.test(line)) {
        continue;
      }

      // Bank line: "MANDIRI, 1140033394092, Sugiyanto"
      if (line.includes(',') && !line.includes('Withdraw') && !line.includes(':')) {
        currentBlock.bankInfo = standardizeBankFormat(line);
        continue;
      }

      // Withdraw line: "Withdraw 2026-09-09 00:19:24 1,000,000 145"
      if (/withdraw/i.test(line) || /\d{4}-\d{2}-\d{2}/.test(line)) {
        const timeMatch = line.match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}:\d{2}:\d{2})/);
        if (timeMatch) {
          currentBlock.time = timeMatch[1];
        }
        const amountMatch = line.match(/\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}:\d{2}\s+([0-9,]+(?:\.\d+)?)/);
        if (amountMatch) {
          currentBlock.amount = amountMatch[1].trim();
        } else {
          const nums = line.match(/(\d{1,3}(,\d{3})+(\.\d+)?)/g);
          if (nums && nums.length > 0) {
            currentBlock.amount = nums[0];
          }
        }
        continue;
      }

      // User line (e.g. "1 188888", "1\t\tmenang1000", or standalone "188888")
      // If we already have a previous record with data, flush it
      if (currentBlock.username && (currentBlock.amount || currentBlock.bankInfo)) {
        flushBlock();
      }

      const seqAndUser = line.match(/^(\d+)\s+([a-zA-Z0-9_\-\.]+)/);
      if (seqAndUser) {
        // First token is sequence number, second token is username (even if purely numeric like 188888)
        currentBlock.username = seqAndUser[2].trim();
      } else {
        // Standalone user ID
        const singleUser = line.match(/^([a-zA-Z0-9_\-\.]+)/);
        if (singleUser && !/^withdraw$/i.test(singleUser[1])) {
          currentBlock.username = singleUser[1].trim();
        }
      }
    }

    // Flush final block
    flushBlock();

    // Chronological ascending sorting if enabled
    if (sortByTime && results.length > 0) {
      results.sort((a, b) => (a.rawTime || a.time).padStart(8, '0').localeCompare((b.rawTime || b.time).padStart(8, '0')));
    }

    return results;
  }, [rawText, sortByTime]);

  // Generate output string for single row:
  // "0:19:24\t188888\tSugiyanto, 1140033394092, MANDIRI\t\t1,000,000"
  const formatSingleRow = (row: ParsedWdRow, format: 'tab' | 'pipe' | 'comma'): string => {
    if (format === 'tab') {
      return `${row.time}\t${row.username}\t${row.bankInfo}\t\t${row.amount}`;
    }
    if (format === 'pipe') {
      return `${row.time} | ${row.username} | ${row.bankInfo} |  | ${row.amount}`;
    }
    return `${row.time}, ${row.username}, "${row.bankInfo}", , ${row.amount}`;
  };

  // Generate output string for all rows
  const allFormattedText = useMemo(() => {
    return parsedData.map(r => formatSingleRow(r, copyFormat)).join('\n');
  }, [parsedData, copyFormat]);

  // Handle Auto Clear / Auto Delete timer whenever rawText changes
  useEffect(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!rawText.trim() || !autoClearEnabled) {
      setCountdown(0);
      return;
    }

    // Start countdown
    setCountdown(autoClearSeconds);
    const startTime = Date.now();
    const durationMs = autoClearSeconds * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setCountdown(remaining);
    }, 200);

    timerRef.current = setTimeout(() => {
      setRawText('');
      setCountdown(0);
      setJustCleared(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => setJustCleared(false), 2500);
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rawText, autoClearEnabled, autoClearSeconds]);

  // Copy All Data
  const handleCopyAll = () => {
    if (!allFormattedText) return;
    navigator.clipboard.writeText(allFormattedText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy Single Row Data
  const handleCopyRow = (row: ParsedWdRow) => {
    const formatted = formatSingleRow(row, copyFormat);
    navigator.clipboard.writeText(formatted);
    setCopiedRowId(row.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  // Manual Clear Cache / Reset Input
  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRawText('');
    setCountdown(0);
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 2000);
  };

  // Load Examples
  const loadExample = (formatType: 1 | 2 | 3) => {
    if (formatType === 1) setRawText(EXAMPLE_FORMAT_1);
    if (formatType === 2) setRawText(EXAMPLE_FORMAT_2);
    if (formatType === 3) setRawText(EXAMPLE_FORMAT_3);
    setShowExampleMenu(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      
      {/* ========================================================= */}
      {/* TOP CARD: AUTO WD FLOP (4 KOLOM) & TEXTAREA INPUT         */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-[#121212]/80 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-5 sm:p-6 space-y-4">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-['Rajdhani']">
                  AUTO WD FLOP (4 KOLOM)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {parsedData.length} BARIS
                </span>
                {justCleared && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold animate-pulse flex items-center gap-1">
                    <Check className="w-3 h-3" /> CACHE BERSIH
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Parser Otomatis Antrean Withdraw 4 Kolom (Waktu, User, Bank Asal, Amount)
              </p>
            </div>
          </div>

          {/* Action Buttons: Auto Clear Control, Contoh Data & Clear Cache */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Auto Delete / Clear Cache Toggle */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAutoClearEnabled(!autoClearEnabled)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  autoClearEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Aktifkan/Nonaktifkan Hapus Otomatis 5 Detik"
              >
                <Timer className={`w-3.5 h-3.5 ${autoClearEnabled ? 'text-emerald-400 animate-spin' : 'text-gray-500'}`} style={{ animationDuration: '6s' }} />
                <span>AUTO CLEAR: {autoClearEnabled ? `${autoClearSeconds}S` : 'OFF'}</span>
              </button>

              {autoClearEnabled && (
                <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                  {[3, 5, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAutoClearSeconds(sec)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        autoClearSeconds === sec
                          ? 'bg-emerald-400 text-black font-extrabold'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contoh Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExampleMenu(!showExampleMenu)}
                className="px-3 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#282828] text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>CONTOH</span>
              </button>

              {showExampleMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#181818] border border-white/15 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono border-b border-white/10">
                    PILIH FORMAT CONTOH:
                  </div>
                  <button
                    onClick={() => loadExample(1)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-semibold">Format 1 (1 188888)</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-yellow-400">Multi-Baris</span>
                  </button>
                  <button
                    onClick={() => loadExample(2)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-semibold">Format 2 (Single-Line 188888)</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-emerald-400">Tab / Baris</span>
                  </button>
                  <button
                    onClick={() => loadExample(3)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-semibold">Format 3 (zenroel / BCA)</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-cyan-400">G5 Prioritas</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clear Cache / Reset Button */}
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Bersihkan Data & Cache Seketika"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>CLEAR CACHE</span>
            </button>
          </div>
        </div>

        {/* Textarea Input Data Mentah + Auto Clear Progress Bar Indicator */}
        <div className="relative">
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Tempel / Paste data mentah withdraw di sini... (Data otomatis dihapus dalam 5 detik untuk mencegah duplikasi/dobel)"
            className="w-full p-4 rounded-2xl bg-[#0D0D0D]/90 border border-white/15 focus:border-[#00F3FF] focus:shadow-[0_0_20px_rgba(0,243,255,0.25)] font-mono text-xs text-gray-100 placeholder-gray-600 outline-none leading-relaxed resize-y min-h-[130px] selection:bg-[#00F3FF] selection:text-black transition-all"
          />

          {/* Floating Countdown Bar if text is present */}
          {rawText.trim() && autoClearEnabled && countdown > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/80 border border-yellow-400/50 backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <span className="text-[11px] font-mono font-bold text-yellow-300">
                Auto Hapus: {countdown}s
              </span>
            </div>
          )}
        </div>

        {/* Format Salin Toolbar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Format Radio Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-300 font-mono flex items-center gap-1">
              Format Salin:
            </span>
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setCopyFormat('tab')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer ${
                  copyFormat === 'tab'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                TAB (EXCEL)
              </button>
              <button
                type="button"
                onClick={() => setCopyFormat('pipe')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer ${
                  copyFormat === 'pipe'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                PIPE (|)
              </button>
              <button
                type="button"
                onClick={() => setCopyFormat('comma')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer ${
                  copyFormat === 'comma'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                KOMA (,)
              </button>
            </div>
          </div>

          {/* Salin Semua Data Button */}
          <button
            onClick={handleCopyAll}
            disabled={parsedData.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>SEMUA DATA TERSALIN!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black stroke-[2.5]" />
                <span>SALIN SEMUA DATA</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* BOTTOM CARD: HASIL PARSING & TABEL 4 KOLOM                */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-[#121212]/80 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Table Banner Header */}
        <div className="p-4 bg-gradient-to-r from-[#181818] to-[#121212] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-white font-['Rajdhani'] uppercase tracking-wider flex items-center gap-2">
              <span>HASIL PARSING ({parsedData.length} BARIS)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              disabled={parsedData.length === 0}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.3)] transition-all cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>SALIN SEMUA</span>
            </button>
          </div>
        </div>

        {/* 5 Column Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#181818]/90 text-gray-300 border-b border-white/10 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 text-center w-12 text-gray-400">#</th>
                <th className="py-3 px-4 min-w-[130px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-yellow-400 font-bold">A</span>
                    <span>Waktu</span>
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[140px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-cyan-400 font-bold">B</span>
                    <span>User ID</span>
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[280px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-purple-400 font-bold">C</span>
                    <span>Bank Asal (Nama, Rek, Bank)</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-28 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-400">
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-gray-500 font-bold">D</span>
                    <span>(Kosong)</span>
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[160px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-emerald-400 font-bold">E</span>
                    <span>Amount / Nominal</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-16 text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parsedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-600" />
                      <p className="text-xs font-sans">Belum ada data yang diparsing. Tempel data di kolom atas atau klik tombol Contoh.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                parsedData.map((row, index) => {
                  const isCopied = copiedRowId === row.id;
                  return (
                    <tr 
                      key={row.id || index}
                      className="hover:bg-white/[0.04] transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3 px-3.5 text-center text-gray-500 font-bold">
                        {index + 1}
                      </td>

                      {/* Kolom 1 (A): Waktu */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-yellow-400 font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-yellow-400/80" />
                          {row.time}
                        </span>
                      </td>

                      {/* Kolom 2 (B): User ID */}
                      <td className="py-3 px-4">
                        <span className="text-cyan-400 font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {row.username}
                        </span>
                      </td>

                      {/* Kolom 3 (C): Bank Asal (Nama, Rek, Bank) */}
                      <td className="py-3 px-4 text-gray-200">
                        <span className="font-semibold text-white">
                          {row.bankInfo}
                        </span>
                      </td>

                      {/* Kolom 4 (D): (Kosong) */}
                      <td className="py-3 px-4 text-center text-gray-500 italic text-[11px]">
                        (Kosong)
                      </td>

                      {/* Kolom 5 (E): Amount / Nominal */}
                      <td className="py-3 px-4 text-emerald-400 font-extrabold text-sm">
                        {row.amount}
                      </td>

                      {/* Kolom Aksi: Copy Row */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleCopyRow(row)}
                          title="Salin baris ini"
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-[#00F3FF]/20 text-gray-400 hover:text-[#00F3FF] border border-white/5 hover:border-[#00F3FF]/40 transition-all cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info Result */}
        {parsedData.length > 0 && (
          <div className="p-3.5 bg-black/30 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Total Terparsing: <strong className="text-white">{parsedData.length}</strong> transaksi</span>
            </div>
            <div>
              <span>Format Keluaran Salin: <strong className="text-yellow-400 uppercase">{copyFormat}</strong></span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

