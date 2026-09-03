import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  RotateCcw,
  Table, 
  Info, 
  User, 
  Trash2, 
  Layers, 
  FileCheck2, 
  Sparkles,
  Link
} from 'lucide-react';
import { UserProfile } from '../../types';

interface InfoDataPLProps {
  currentUser?: UserProfile | null;
}

export interface ParsedNameFixItem {
  id: string;
  no: number;
  date: string;
  time: string;
  userId: string;
  oldName: string;
  newName: string;
  keterangan: string;
  status: string;
  ssValidasi?: string;
}

export const KET_MEMBER_OPTIONS = [
  'Perbaiki Spasi',
  'Spasi Double / Berlebih',
  'Validasi Nama Rekening',
  'Penyesuaian Buku Tabungan',
  'Perbaikan Huruf Kapital',
  'Koreksi Nama E-Wallet'
];

export const MONTHS_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format date string into Indonesian format, e.g. "03 Agustus 2026"
 */
export const formatIndonesianDate = (rawDate?: string | Date, uppercaseMonth = false): string => {
  if (!rawDate) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const mName = MONTHS_INDONESIA[now.getMonth()];
    const m = uppercaseMonth ? mName.toUpperCase() : mName;
    return `${d} ${m} ${now.getFullYear()}`;
  }

  if (rawDate instanceof Date) {
    const d = String(rawDate.getDate()).padStart(2, '0');
    const mName = MONTHS_INDONESIA[rawDate.getMonth()];
    const m = uppercaseMonth ? mName.toUpperCase() : mName;
    return `${d} ${m} ${rawDate.getFullYear()}`;
  }

  const str = String(rawDate).trim();

  // If already formatted like "03 Agustus 2026" or "03 SEPTEMBER 2026"
  const wordMonthMatch = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (wordMonthMatch) {
    const d = wordMonthMatch[1].padStart(2, '0');
    const foundMonth = wordMonthMatch[2].toLowerCase();
    const monthIndex = MONTHS_INDONESIA.findIndex(m => m.toLowerCase() === foundMonth);
    const mName = monthIndex >= 0 ? MONTHS_INDONESIA[monthIndex] : (wordMonthMatch[2].charAt(0).toUpperCase() + wordMonthMatch[2].slice(1).toLowerCase());
    const m = uppercaseMonth ? mName.toUpperCase() : mName;
    const y = wordMonthMatch[3];
    return `${d} ${m} ${y}`;
  }

  // Try matching DD-MM-YYYY or DD/MM/YYYY or DD - MM - YYYY with optional spaces anywhere
  const matchDMY = str.match(/(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/);
  if (matchDMY) {
    const d = matchDMY[1].padStart(2, '0');
    const monthIndex = parseInt(matchDMY[2], 10) - 1;
    const y = matchDMY[3];
    const mName = (monthIndex >= 0 && monthIndex < 12) ? MONTHS_INDONESIA[monthIndex] : matchDMY[2];
    const m = uppercaseMonth ? mName.toUpperCase() : mName;
    return `${d} ${m} ${y}`;
  }

  // Try matching YYYY-MM-DD or YYYY/MM/DD with optional spaces anywhere
  const matchYMD = str.match(/(\d{4})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{1,2})/);
  if (matchYMD) {
    const y = matchYMD[1];
    const monthIndex = parseInt(matchYMD[2], 10) - 1;
    const d = matchYMD[3].padStart(2, '0');
    const mName = (monthIndex >= 0 && monthIndex < 12) ? MONTHS_INDONESIA[monthIndex] : matchYMD[2];
    const m = uppercaseMonth ? mName.toUpperCase() : mName;
    return `${d} ${m} ${y}`;
  }

  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const mName = MONTHS_INDONESIA[now.getMonth()];
  const m = uppercaseMonth ? mName.toUpperCase() : mName;
  return `${d} ${m} ${now.getFullYear()}`;
};

export const InfoDataPL: React.FC<InfoDataPLProps> = () => {
  // Raw input and parsed state (empty by default)
  const [rawText, setRawText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [parsedList, setParsedList] = useState<ParsedNameFixItem[]>([]);
  const [lastRawBackup, setLastRawBackup] = useState('');
  const [justCleared, setJustCleared] = useState(false);

  // Copy feedbacks
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState(false);

  // 5-second Auto-Clear idle timer
  const [autoClearEnabled, setAutoClearEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const idleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const startIdleTimer = (currentText: string) => {
    if (!autoClearEnabled || !currentText.trim()) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(null);
      return;
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setLastRawBackup(currentText);
    setCountdown(5);
    let secondsLeft = 5;

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
      } else {
        setCountdown(secondsLeft);
      }
    }, 1000);

    idleTimerRef.current = setTimeout(() => {
      setLastRawBackup(currentText);
      setRawText('');
      setCountdown(null);
      setJustCleared(true);
      setTimeout(() => setJustCleared(false), 8000);
    }, 5000);
  };

  // Get current date string formatted as Indonesian Date (e.g. 03 Agustus 2026)
  const getTodayDateStr = () => {
    return formatIndonesianDate();
  };

  // =========================================================================
  // PARSING ENGINE (Handles member name change logs)
  // Format:
  // 1 28-08-2026 12:58:53 jvsaaks3 change user info julamri12 bank : dana => DANA,bank : JULAMRI => JUL AMRI,bank : dana => DANA,acc : JULAMRI => JUL AMRI,rek : 085184408544 => 085184408544,color : #FFFFFF => white julamri12
  // 2 28-08-2026 12:56:46 jvsaaautowd accept withdraw total withdraw 100,000 :403540892 julamri12
  // 3 28-08-2026 11:24:34 jvsaaks3 change user info desi23 bank : dana => DANA,bank : Henikristiyanti => Heni kristiyanti,bank : dana => DANA,acc : Henikristiyanti => Heni kristiyanti,rek : 081393953962 => 081393953962,color : #FFFFFF => white desi23
  // =========================================================================
  useEffect(() => {
    if (!rawText.trim()) {
      // Keep existing parsedList intact when rawText is auto-cleared
      return;
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const items: ParsedNameFixItem[] = [];
    const todayDate = getTodayDateStr();
    const defaultTime = new Date().toLocaleTimeString('id-ID', { hour12: false });

    let count = 1;
    lines.forEach((line) => {
      // Must be a change user info or have '=>' for name/acc changes
      // Filter out pure withdraw logs that might be mixed in
      if (!/change\s+user\s+info/i.test(line) && !/acc\s*:\s*.*=>/i.test(line) && !/bank\s*:\s*.*=>/i.test(line)) {
        return;
      }

      let date = todayDate;
      let time = defaultTime;
      const dtMatch = line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/);
      if (dtMatch) {
        date = dtMatch[1].replace(/\s+/g, '').replace(/\//g, '-');
        const tmMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
        if (tmMatch) time = tmMatch[1];
      }

      let userId = '';
      const userMatch = line.match(/change\s+user\s+info\s+([a-zA-Z0-9_\-]+)/i);
      if (userMatch) {
        userId = userMatch[1].trim();
      } else {
        const tokens = line.split(/\s+|\t/);
        userId = tokens[tokens.length - 1] || `user_${count}`;
      }

      let oldName = 'MEMBER';
      let newName = 'MEMBER';

      // Acc match is prioritized: acc : JULAMRI => JUL AMRI
      const accMatch = line.match(/acc\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/i);
      if (accMatch) {
        oldName = accMatch[1].trim().toUpperCase();
        newName = accMatch[2].trim().toUpperCase();
      } else {
        // Look for bank name change like: bank : Henikristiyanti => Heni kristiyanti
        const bankNameMatches = Array.from(line.matchAll(/bank\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/gi));
        for (const m of bankNameMatches) {
          const v1 = m[1].trim();
          const v2 = m[2].trim();
          // Skip if it's just bank name like "bri => OVO" or "dana => DANA"
          if (!/^(bca|bni|bri|mandiri|dana|ovo|gopay|linkaja|shopeepay|qris|cimb|danamon)$/i.test(v1)) {
            oldName = v1.toUpperCase();
            newName = v2.toUpperCase();
            break;
          }
        }
      }

      items.push({
        id: `spasi-${count}-${Date.now()}`,
        no: count++,
        date,
        time,
        userId,
        oldName,
        newName,
        keterangan: 'Perbaiki Spasi',
        status: 'Done'
      });
    });

    // Deduplicate by userId
    const seenUsers = new Set<string>();
    const uniqueItems: ParsedNameFixItem[] = [];
    items.forEach(it => {
      const key = it.userId.toLowerCase();
      if (!seenUsers.has(key)) {
        seenUsers.add(key);
        uniqueItems.push(it);
      }
    });

    setParsedList(uniqueItems);
  }, [rawText]);

  // =========================================================================
  // REPORT COMPOSER
  // Exactly matching:
  // Update Spasi Nama Member
  // Tanggal : 28-08-2026
  // Jam : 12:58:53
  //
  // User ID : julamri12
  // Nama Sebelumnya : JULAMRI
  // Nama Setelahnya : JUL AMRI
  // Keterangan : Perbaiki Spasi
  // Status : Done
  // SS Validasi Bank : (kosongkan Saja karena harus isi manual berupa link screenshot)
  // =========================================================================
  useEffect(() => {
    if (parsedList.length === 0) {
      setExtractedText('');
      return;
    }

    const firstItem = parsedList[0];
    const reportDate = formatIndonesianDate(firstItem?.date, false);
    const reportTime = firstItem?.time || new Date().toLocaleTimeString('id-ID', { hour12: false });

    const memberBlocks = parsedList.map(item => {
      const ssContent = item.ssValidasi?.trim() || '';
      const ssLine = ssContent ? `SS Validasi Bank : ${ssContent}` : `SS Validasi Bank : `;

      return `User ID : ${item.userId}
Nama Sebelumnya : ${item.oldName}
Nama Setelahnya : ${item.newName}
Keterangan : ${item.keterangan || 'Perbaiki Spasi'}
Status : ${item.status || 'Done'}
${ssLine}`;
    });

    const fullReport = `Update Spasi Nama Member\nTanggal : ${reportDate}\nJam : ${reportTime}\n\n${memberBlocks.join('\n\n')}`;
    setExtractedText(fullReport);
  }, [parsedList]);

  // Update Keterangan for a single individual row
  const handleUpdateItemKet = (id: string, newKet: string) => {
    setParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, keterangan: newKet } : item
    ));
  };

  // Update SS Validasi for a single individual row
  const handleUpdateItemSs = (id: string, newSs: string) => {
    setParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, ssValidasi: newSs } : item
    ));
  };

  // Apply Keterangan to all rows
  const handleApplyAllKet = (newKet: string) => {
    setParsedList(prev => prev.map(item => ({ ...item, keterangan: newKet })));
  };

  // Copy helpers
  const handleCopyRaw = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyReport = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopiedReport(true);
    
    // Auto-clear input format immediately upon copy if autoClearEnabled
    if (autoClearEnabled && rawText) {
      setLastRawBackup(rawText);
      setRawText('');
      setCountdown(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setJustCleared(true);
      setTimeout(() => setJustCleared(false), 8000);
    }

    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCopyDetail = () => {
    const rows = parsedList.map(item => 
      `${item.no}\t${formatIndonesianDate(item.date, false)} ${item.time}\t${item.userId}\t${item.oldName}\t${item.newName}\t${item.keterangan}\t${item.status}\t${item.ssValidasi || '-'}`
    ).join('\n');
    const header = 'NO\tTANGGAL & JAM\tUSER ID\tNAMA SEBELUMNYA\tNAMA SETELAHNYA\tKETERANGAN\tSTATUS\tSS VALIDASI\n';
    navigator.clipboard.writeText(header + rows);
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2000);
  };

  const handleReset = () => {
    setRawText('');
    setExtractedText('');
    setParsedList([]);
    setCountdown(null);
    setJustCleared(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleRestoreBackup = () => {
    if (lastRawBackup) {
      setRawText(lastRawBackup);
      startIdleTimer(lastRawBackup);
      setJustCleared(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
        startIdleTimer(text);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* ========================================================= */}
      {/* HEADER BAR                                                */}
      {/* ========================================================= */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a101d] via-[#151208] to-[#0a101d] border border-amber-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold font-mono border border-amber-500/30 tracking-wider">
              TOOLS KASIR
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Update & Validasi Spasi Nama Rekening Member
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-sans uppercase tracking-wider">
            INFO DATA MEMBER (UPDATE SPASI NAMA)
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Ekstraksi otomatis log ganti data dan perbaikan spasi nama rekening member dengan format laporan resmi siap salin.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Counter Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#090e1a] border border-amber-500/30 shadow-inner">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {parsedList.length} Akun Diproses
            </span>
          </div>
        </div>
      </div>

      {/* Auto Clear Notification Bar & Countdown */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#09101d] border border-amber-500/20 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${countdown !== null ? 'bg-amber-400 animate-ping' : 'bg-amber-400'}`} />
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-300 font-mono text-[11px] sm:text-xs">
              {autoClearEnabled 
                ? countdown !== null 
                  ? `⏱️ Format mentah otomatis terhapus dalam ${countdown} detik jika tidak ada perubahan...` 
                  : 'Auto-Clear Aktif: Format mentah otomatis dibersihkan setelah 5 detik tanpa perubahan (hasil laporan tetap tersimpan).'
                : 'Auto-Clear sedang dinonaktifkan (format input tidak akan terhapus otomatis).'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastRawBackup && (
              <button
                type="button"
                onClick={handleRestoreBackup}
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Kembalikan format mentah yang baru saja terhapus otomatis"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kembalikan Input Mentah</span>
              </button>
            )}
            <button
              onClick={() => setAutoClearEnabled(!autoClearEnabled)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                autoClearEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
              }`}
            >
              {autoClearEnabled ? 'Auto-Clear 5s: AKTIF' : 'Auto-Clear 5s: NONAKTIF'}
            </button>
          </div>
        </div>

        {/* Banner if just cleared */}
        {justCleared && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Format mentah telah otomatis dibersihkan (5 detik hening). Hasil laporan di kolom kanan tetap aman!</span>
            </div>
            <button
              type="button"
              onClick={handleRestoreBackup}
              className="text-xs underline font-bold hover:text-white cursor-pointer ml-3"
            >
              Undo / Tampilkan Lagi
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN WORKSPACE (INPUT & LIVE EXTRACTION)               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Box 1: Input Data Mentah */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-amber-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-amber-600/30 text-amber-400 text-xs font-black font-mono border border-amber-500/40">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    Tempel Log Perubahan Data Member
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {rawText ? `${rawText.split('\n').filter(Boolean).length} Baris Terdeteksi` : 'Siap Menampung Data'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Tempel langsung dari Clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>Paste Clipboard</span>
                </button>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  RAW LOGS
                </span>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => {
                const val = e.target.value;
                setRawText(val);
                startIdleTimer(val);
              }}
              placeholder={`Tempelkan format log ganti data / perbaikan spasi nama member di sini...\n\nContoh format yang didukung:\n1 28-08-2026 12:58:53 jvsaaks3 change user info julamri12 bank : dana => DANA,bank : JULAMRI => JUL AMRI,bank : dana => DANA,acc : JULAMRI => JUL AMRI,rek : 085184408544 => 085184408544,color : #FFFFFF => white julamri12\n2 28-08-2026 12:56:46 jvsaaautowd accept withdraw total withdraw 100,000 :403540892 julamri12\n3 28-08-2026 11:24:34 jvsaaks3 change user info desi23 bank : dana => DANA,bank : Henikristiyanti => Heni kristiyanti,bank : dana => DANA,acc : Henikristiyanti => Heni kristiyanti,rek : 081393953962 => 081393953962,color : #FFFFFF => white desi23`}
              className="w-full h-80 p-4 rounded-xl bg-[#050811] border border-amber-900/40 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopyRaw}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              {copiedRaw ? <Check className="w-4 h-4 text-emerald-950 font-bold" /> : <Copy className="w-4 h-4" />}
              <span>{copiedRaw ? 'Tersalin!' : 'Copy Data Mentah'}</span>
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 px-5 rounded-xl bg-[#131b2e] hover:bg-[#1a253d] text-rose-300 hover:text-rose-200 border border-rose-900/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Box 2: Hasil Ekstraksi Otomatis */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-emerald-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-black font-mono border border-emerald-500/40">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    Hasil Ekstraksi Laporan (Siap Salin)
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {extractedText ? 'Format Siap Digunakan' : 'Menunggu Input Mentah'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                READY TO COPY
              </span>
            </div>

            <textarea
              readOnly
              value={extractedText}
              placeholder={`Laporan Update Spasi Nama Member akan otomatis terformat rapi di sini...`}
              className="w-full h-80 p-4 rounded-xl bg-[#050811] border border-emerald-900/40 text-xs text-emerald-200 placeholder-gray-500 font-mono outline-none focus:border-emerald-500 transition-all resize-none shadow-inner leading-relaxed select-all font-semibold"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCopyReport}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              <div className="flex items-center gap-2 text-sm">
                {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? 'Tersalin ke Clipboard!' : 'COPY LAPORAN GANTI DATA'}</span>
              </div>
              {autoClearEnabled && (
                <span className="text-[10px] font-normal text-emerald-200/80 mt-0.5 font-mono">
                  {copiedReport ? '✓ Data input mentah otomatis dibersihkan' : '• Input mentah otomatis dibersihkan saat tombol ini diklik'}
                </span>
              )}
            </button>

            {/* Member Counter */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#050811] border border-emerald-900/40 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">
                  Jumlah Member Terproses: {parsedList.length} User
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                Status: Done | Format Baku
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOX 3: DETAIL DATA TABLE (EDIT KETERANGAN & SS PER ROW)   */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-600/30 text-cyan-400 text-xs font-black font-mono border border-cyan-500/40">
              03
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Tabel Rincian & Validasi Per User ID
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Ubah keterangan nama member secara terpisah atau tambahkan link screenshot validasi bank:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Set All Keterangan Quick Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060a14] border border-white/10">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-gray-300 font-mono">Ubah Semua:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleApplyAllKet(e.target.value);
                }}
                defaultValue=""
                className="bg-[#050811] text-xs text-amber-300 font-mono outline-none px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer focus:border-amber-400"
              >
                <option value="" disabled>Pilih Keterangan...</option>
                {KET_MEMBER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopyDetail}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a253d] text-gray-200 hover:text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
            >
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copiedDetail ? 'Tersalin!' : 'Copy Tabel'}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/10 text-amber-400 uppercase text-[11px] bg-[#050811]">
                <th className="py-3 px-3.5">NO</th>
                <th className="py-3 px-3.5">TANGGAL & JAM</th>
                <th className="py-3 px-3.5">USER ID</th>
                <th className="py-3 px-3.5">NAMA SEBELUMNYA</th>
                <th className="py-3 px-3.5">NAMA SETELAHNYA</th>
                <th className="py-3 px-3.5 min-w-[220px]">KETERANGAN</th>
                <th className="py-3 px-3.5 min-w-[200px]">LINK SS VALIDASI BANK (OPSIONAL)</th>
                <th className="py-3 px-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#070c18]/50">
              {parsedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
                    Belum ada data perbaikan nama member. Silakan tempelkan log di Box 01 untuk mengekstrak data otomatis.
                  </td>
                </tr>
              ) : (
                parsedList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3.5 text-gray-400">{item.no}</td>
                    <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">{formatIndonesianDate(item.date, false)} {item.time}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-yellow-300 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                        {item.userId}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                        {item.oldName}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {item.newName}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <select
                        value={item.keterangan}
                        onChange={(e) => handleUpdateItemKet(item.id, e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#050811] border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {KET_MEMBER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <input
                          type="text"
                          value={item.ssValidasi || ''}
                          onChange={(e) => handleUpdateItemSs(item.id, e.target.value)}
                          placeholder="Link SS (Opsional)"
                          className="w-full px-2 py-1 rounded bg-[#050811] text-xs font-mono text-cyan-200 placeholder-gray-600 border border-white/10 outline-none focus:border-cyan-400"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                        {item.status || 'Done'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
