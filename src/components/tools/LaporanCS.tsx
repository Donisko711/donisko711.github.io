import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  Lock, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Table, 
  Clock, 
  ShieldAlert,
  Edit3,
  User,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LaporanCSProps {
  initialTab?: 'GANTI_DATA' | 'LOCKED';
  currentUser?: UserProfile | null;
}

interface ParsedGantiDataItem {
  id: string;
  no: number;
  date: string;
  time: string;
  staff: string;
  userId: string;
  oldBank: string;
  newBank: string;
  oldRek: string;
  newRek: string;
  oldAcc: string;
  newAcc: string;
  changeType: string;
}

interface ParsedLockedItem {
  id: string;
  no: number;
  date: string;
  time: string;
  staff: string;
  csName: string;
  action: 'Locked' | 'Unlocked';
  kendala: string;
  userId: string;
}

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

export const LaporanCS: React.FC<LaporanCSProps> = ({ initialTab = 'GANTI_DATA', currentUser }) => {
  const [activeTab, setActiveTab] = useState<'GANTI_DATA' | 'LOCKED'>(initialTab);

  // Common Staff Alias manual field - default empty as requested (Staff : )
  const [staffAlias, setStaffAlias] = useState('');

  // GANTI DATA STATES - Clean initial state (empty to prevent double data)
  const [gdRawText, setGdRawText] = useState('');
  const [gdExtractedText, setGdExtractedText] = useState('');
  const [gdParsedList, setGdParsedList] = useState<ParsedGantiDataItem[]>([]);

  // LOCKED / UNLOCK STATES - Clean initial state
  const [lockRawText, setLockRawText] = useState('');
  const [lockExtractedText, setLockExtractedText] = useState('');
  const [lockParsedList, setLockParsedList] = useState<ParsedLockedItem[]>([]);

  // Copy feedbacks
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState(false);

  // 5-second Auto-Clear idle feature (Enabled by default as requested)
  const [autoClearEnabled, setAutoClearEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const idleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const startIdleTimer = (type: 'GD' | 'LOCK') => {
    if (!autoClearEnabled) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

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
      if (type === 'GD') {
        setGdRawText('');
      } else {
        setLockRawText('');
      }
      setCountdown(null);
    }, 5000);
  };

  // Helper title case
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s|\/|-)\S/g, (char) => char.toUpperCase());
  };

  // Helper clean format reason
  const cleanReason = (rawReason: string) => {
    const r = rawReason.trim();
    if (!r) return 'Kendala Akun';

    // Priority regex mapping
    if (/^rek\s*tidak\s*valid$/i.test(r)) {
      return 'Rek Tidak Valid';
    }
    if (/nomor\s*rekening\s*tidak\s*valid|no\s*rekening\s*tidak\s*valid|no\s*rek\s*tidak\s*valid/i.test(r)) {
      return 'No Rekening Tidak Valid';
    }
    if (/nama\s*rekening\s*beda|nama\s*rek\s*beda|nama\s*beda/i.test(r)) {
      return 'Nama Rek Beda';
    }
    if (/akun\s*belum\s*premium|belum\s*premium/i.test(r)) {
      return 'Akun Belum Premium';
    }
    if (/ewallet\s*pl\s*limit|e-wallet\s*pl\s*limit/i.test(r)) {
      return 'Ewallet Pl Limit';
    }
    if (/akun\s*pl\s*limit/i.test(r)) {
      return 'Akun PL Limit';
    }
    if (/form\s*kosong|spam\s*form\s*kosong/i.test(r)) {
      return 'Spam Form Kosong';
    }
    if (/invest\s*2d\s*depan/i.test(r)) {
      return 'Invest 2D Depan';
    }

    // Default to clean title case with acronym preservation
    let formatted = toTitleCase(r);
    formatted = formatted
      .replace(/\bPl\b/g, 'PL')
      .replace(/\bId\b/g, 'ID')
      .replace(/\bWd\b/g, 'WD')
      .replace(/\bDp\b/g, 'DP')
      .replace(/\bNomor\b/g, 'No');
    return formatted;
  };

  // ==========================================
  // PARSER 1: GANTI DATA
  // ==========================================
  useEffect(() => {
    if (!gdRawText.trim()) {
      // Don't wipe existing parsed list if auto-cleared, only clear if explicitly reset
      return;
    }

    const lines = gdRawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsedItems: ParsedGantiDataItem[] = [];
    let detectedRawDate = '';

    lines.forEach((line, index) => {
      // Find user ID
      let userId = '';
      const userMatch = line.match(/change\s+user\s+info\s+([a-zA-Z0-9_\-]+)/i);
      if (userMatch) {
        userId = userMatch[1].trim();
      } else {
        const tokens = line.split(/\s+|\t/);
        userId = tokens[tokens.length - 1] || `user_${index + 1}`;
      }

      // Date and Time
      let date = '';
      let time = new Date().toLocaleTimeString('id-ID', { hour12: false });
      const dtMatch = line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/);
      if (dtMatch) {
        date = dtMatch[1].replace(/\s+/g, '').replace(/\//g, '-');
        if (!detectedRawDate) detectedRawDate = date;
        const tmMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
        if (tmMatch) time = tmMatch[1];
      }

      // Staff code
      let staff = staffAlias ? staffAlias.trim() : '';
      const staffMatch = line.match(/jvsaacs\d+|jvsaaks\d+|staff\w+/i);
      if (staffMatch) {
        staff = staffMatch[0];
      }

      // Old vs New Bank
      let oldBank = 'BRI';
      let newBank = 'OVO';
      const bankMatch = line.match(/bank\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/i);
      if (bankMatch) {
        oldBank = bankMatch[1].trim().toUpperCase();
        newBank = bankMatch[2].trim().toUpperCase();
      }

      // Old vs New Rek
      let oldRek = '-';
      let newRek = '-';
      const rekMatch = line.match(/rek\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/i);
      if (rekMatch) {
        oldRek = rekMatch[1].trim();
        newRek = rekMatch[2].trim();
      }

      // Old vs New Acc Name
      let oldAcc = '-';
      let newAcc = '-';
      const accMatch = line.match(/acc\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/i);
      if (accMatch) {
        oldAcc = toTitleCase(accMatch[1].trim());
        newAcc = toTitleCase(accMatch[2].trim());
      }

      const item: ParsedGantiDataItem = {
        id: `gd-${index}-${Date.now()}`,
        no: index + 1,
        date: date || detectedRawDate || new Date().toISOString().slice(0, 10),
        time,
        staff: staffAlias ? staffAlias.trim() : staff,
        userId,
        oldBank,
        newBank,
        oldRek,
        newRek,
        oldAcc: oldAcc === '-' ? newAcc : oldAcc,
        newAcc,
        changeType: `${oldBank} To ${newBank}`
      };

      parsedItems.push(item);
    });

    // Deduplicate Ganti Data by userId
    const seenUsers = new Set<string>();
    const uniqueItems: ParsedGantiDataItem[] = [];
    parsedItems.forEach(item => {
      const key = item.userId.toLowerCase();
      if (!seenUsers.has(key)) {
        seenUsers.add(key);
        uniqueItems.push(item);
      }
    });

    setGdParsedList(uniqueItems);
  }, [gdRawText]);

  // Re-generate Ganti Data text whenever parsed items or staff alias changes
  useEffect(() => {
    if (gdParsedList.length === 0) {
      setGdExtractedText('');
      return;
    }

    const blocks = gdParsedList.map((item) => {
      const formattedDate = formatIndonesianDate(item.date, false);
      return `Staff : ${staffAlias ? staffAlias.trim() : ''}
Tanggal : ${formattedDate}
Info Ko / Ci
Ket : Update Rekening PL, Terlampir Dibawah :

User ID : ${item.userId}
Data Sebelumnya : ${item.oldBank}, ${item.oldRek}, ${item.oldAcc}
Data Terbaru : ${item.newBank}, ${item.newRek}, ${item.newAcc}

NB : Pergantian Dilakukan Pada Jenis Bank ${item.oldBank} To ${item.newBank}`;
    });

    setGdExtractedText(blocks.join('\n\n'));
  }, [gdParsedList, staffAlias]);

  // ==========================================
  // PARSER 2: LOCKED / UNLOCK
  // ==========================================
  useEffect(() => {
    if (!lockRawText.trim()) {
      return;
    }

    const lines = lockRawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsedItems: ParsedLockedItem[] = [];
    let detectedRawDate = '';

    lines.forEach((line, index) => {
      // Date and Time
      let date = '';
      let time = new Date().toLocaleTimeString('id-ID', { hour12: false });
      const dtMatch = line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})\s+(\d{2}:\d{2}:\d{2})/)
        || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/);
      if (dtMatch) {
        date = dtMatch[1].replace(/\s+/g, '').replace(/\//g, '-');
        if (!detectedRawDate) detectedRawDate = date;
        const tmMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
        if (tmMatch) time = tmMatch[1];
      }

      // Check action: Locked or Unlocked
      const isLocked = /\blocked\b/i.test(line);
      const isUnlocked = /\bunlocked\b/i.test(line);
      const action: 'Locked' | 'Unlocked' = isLocked ? 'Locked' : 'Unlocked';

      let kendala = 'Kendala Akun';
      let userId = '';

      // Pattern: Action (reason) username
      // e.g.: Locked (nomor rekening tidak valid ) rubicon
      // or: Unlocked () rubicon
      const detailedMatch = line.match(/(?:locked|unlocked)\s*\(([^)]*)\)\s+([^\s\t\r\n]+)$/i);
      if (detailedMatch) {
        const rawReason = detailedMatch[1].trim();
        userId = detailedMatch[2].trim();
        if (rawReason) {
          kendala = cleanReason(rawReason);
        } else if (isUnlocked) {
          kendala = 'Buka Kunci Akun';
        } else {
          kendala = 'Kendala Akun';
        }
      } else {
        const tokens = line.split(/\s+|\t/);
        userId = tokens[tokens.length - 1] || `member${index + 1}`;
        const reasonMatch = line.match(/(?:locked|unlocked)\s*\(([^)]*)\)/i);
        if (reasonMatch && reasonMatch[1].trim()) {
          kendala = cleanReason(reasonMatch[1].trim());
        } else if (isUnlocked) {
          kendala = 'Buka Kunci Akun';
        }
      }

      // Staff match
      let staff = staffAlias ? staffAlias.trim() : '';
      const staffMatch = line.match(/\b(jvsaacs\d+|jvsaaks\d+|staff\w+)\b/i);
      if (staffMatch) {
        staff = staffMatch[0];
      }

      const item: ParsedLockedItem = {
        id: `lock-${index}-${Date.now()}`,
        no: index + 1,
        date: date || detectedRawDate || new Date().toISOString().slice(0, 10),
        time,
        staff,
        csName: currentUser?.name || 'CS On Duty',
        action,
        kendala,
        userId
      };

      parsedItems.push(item);
    });

    setLockParsedList(parsedItems);
  }, [lockRawText, currentUser]);

  // Re-generate Lock text whenever parsed items, individual kendala, or staff alias changes
  useEffect(() => {
    if (lockParsedList.length === 0) {
      setLockExtractedText('');
      return;
    }

    const firstDate = lockParsedList.find(l => l.date)?.date;
    const reportDate = formatIndonesianDate(firstDate, false); // e.g. "03 Agustus 2026"

    // Deduplicate locked items by userId (case-insensitive) in chronological order
    const uniqueLocked = new Map<string, ParsedLockedItem>();
    const lockedOnly = lockParsedList.filter(l => l.action === 'Locked');

    // Sort chronologically (earliest to latest in shift)
    const sortedLocked = [...lockedOnly].sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return (a.time || '').localeCompare(b.time || '');
    });

    sortedLocked.forEach(item => {
      const key = item.userId.toLowerCase();
      if (!uniqueLocked.has(key)) {
        uniqueLocked.set(key, item);
      }
    });

    const lockedListLines = Array.from(uniqueLocked.values())
      .map(item => `* ${item.userId} - ${item.kendala}`);

    const reportOutput = 
`Staff : ${staffAlias ? staffAlias.trim() : ''}
Tanggal : ${reportDate}
Info Ko / Ci
Ket : Locked ID PL, Terlampir Dibawah :

${lockedListLines.length > 0 ? lockedListLines.join('\n') : '* Tidak ada user locked'}

NB : Untuk PL Diatas Sudah Di Locked Yaa Ko/Ci ..`;

    setLockExtractedText(reportOutput);
  }, [lockParsedList, staffAlias]);

  // Update kendala for an individual locked user
  const handleUpdateKendala = (id: string, newKendala: string) => {
    setLockParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, kendala: newKendala } : item
    ));
  };

  // Helper bank badge style
  const getBankBadgeStyle = (bankName: string) => {
    const b = (bankName || '').toUpperCase();
    if (b.includes('BCA')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (b.includes('BNI')) return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    if (b.includes('BRI')) return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (b.includes('MANDIRI')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (b.includes('DANA')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (b.includes('GOPAY')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (b.includes('OVO')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    return 'bg-gray-700/40 text-gray-300 border-gray-600/40';
  };

  // Copy Handlers
  const handleCopyRaw = () => {
    const textToCopy = activeTab === 'GANTI_DATA' ? gdRawText : lockRawText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyReport = () => {
    const textToCopy = activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedReport(true);
    
    // Auto-clear input format immediately upon copy if autoClearEnabled
    if (autoClearEnabled) {
      if (activeTab === 'GANTI_DATA') {
        setGdRawText('');
      } else {
        setLockRawText('');
      }
      setCountdown(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCopyDetail = () => {
    if (activeTab === 'GANTI_DATA') {
      const rows = gdParsedList.map(item => 
        `${item.no}\t${formatIndonesianDate(item.date, false)} ${item.time}\t${item.userId}\t${item.staff}\t${item.oldBank} - ${item.oldRek} (${item.oldAcc})\t${item.newBank} - ${item.newRek} (${item.newAcc})\t${item.changeType}`
      ).join('\n');
      const header = 'NO\tTANGGAL & JAM\tUSER ID\tSTAFF\tDATA SEBELUMNYA\tDATA TERBARU\tJENIS PERGANTIAN\n';
      navigator.clipboard.writeText(header + rows);
    } else {
      const rows = lockParsedList.map(item => 
        `${item.userId}\t${item.staff}\t${item.csName}\t${item.kendala}\t${item.time}`
      ).join('\n');
      const header = 'USER ID\tSTAFF YANG LOCK\tNAMA CS YANG LOCK\tKENDALA\tJAM LOCK\n';
      navigator.clipboard.writeText(header + rows);
    }
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2000);
  };

  const handleReset = () => {
    if (activeTab === 'GANTI_DATA') {
      setGdRawText('');
      setGdExtractedText('');
      setGdParsedList([]);
    } else {
      setLockRawText('');
      setLockExtractedText('');
      setLockParsedList([]);
    }
    setCountdown(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (activeTab === 'GANTI_DATA') {
          setGdRawText(text);
          startIdleTimer('GD');
        } else {
          setLockRawText(text);
          startIdleTimer('LOCK');
        }
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a101d] via-[#101b30] to-[#0a101d] border border-cyan-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-bold font-mono border border-cyan-500/30 tracking-wider">
              TOOLS OPERASIONAL CS
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Extractor & Formatter
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-sans uppercase tracking-wider">
            {activeTab === 'GANTI_DATA' ? 'LAPORAN GANTI DATA CS' : 'LAPORAN LOCKED / UNLOCK CS'}
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            {activeTab === 'GANTI_DATA' 
              ? 'Ekstraksi log pergantian rekening/identitas member ke format laporan baku CS yang siap dikirim.'
              : 'Ekstraksi log penguncian/pembukaan akun member ke format laporan baku CS yang siap dikirim.'}
          </p>
        </div>

        {/* Tab Selector & Staff Alias Input */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Alias Input - Dedicated Field */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#060a14] border border-cyan-500/40 shadow-inner">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Nama / Kode Alias:</span>
              <input
                type="text"
                value={staffAlias}
                onChange={(e) => setStaffAlias(e.target.value)}
                placeholder="(Kosongkan saja)"
                className="bg-transparent text-xs text-cyan-300 font-mono font-bold outline-none w-36 border-b border-cyan-500/50 pb-0.5 focus:border-cyan-300 transition-colors placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Sub Tab Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[#060a14] border border-white/10 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('GANTI_DATA');
                setCountdown(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'GANTI_DATA'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>GANTI DATA</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('LOCKED');
                setCountdown(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'LOCKED'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>LOCKED / UNLOCK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto Clear Setting Alert Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#09101d] border border-cyan-500/20 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-gray-300 font-mono text-[11px] sm:text-xs">
            {autoClearEnabled 
              ? countdown !== null 
                ? `⏱️ Format mentah otomatis terhapus dalam ${countdown} detik jika tidak ada perubahan.` 
                : 'Auto-Clear Aktif: Format input otomatis dibersihkan saat laporan disalin (atau 5 detik setelah tempel).'
              : 'Auto-Clear sedang dinonaktifkan (format input tidak akan terhapus otomatis).'}
          </span>
        </div>
        <button
          onClick={() => setAutoClearEnabled(!autoClearEnabled)}
          className={`self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
            autoClearEnabled 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
          }`}
        >
          {autoClearEnabled ? 'Auto-Clear: AKTIF' : 'Auto-Clear: NONAKTIF'}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN MAIN EXTRACTOR GRID (BOX 01 & BOX 02)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ========================================================= */}
        {/* BOX 01: DATA MENTAH                                       */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-blue-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-xs font-black font-mono border border-blue-500/40">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    Tempel Format Mentah CS
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {(activeTab === 'GANTI_DATA' ? gdRawText : lockRawText) 
                      ? `${(activeTab === 'GANTI_DATA' ? gdRawText : lockRawText).split('\n').filter(Boolean).length} Baris Terdeteksi` 
                      : 'Siap Menampung Data'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Tempel langsung dari Clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>Paste Clipboard</span>
                </button>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  RAW INPUT
                </span>
              </div>
            </div>

            <textarea
              value={activeTab === 'GANTI_DATA' ? gdRawText : lockRawText}
              onChange={(e) => {
                if (activeTab === 'GANTI_DATA') {
                  setGdRawText(e.target.value);
                  startIdleTimer('GD');
                } else {
                  setLockRawText(e.target.value);
                  startIdleTimer('LOCK');
                }
              }}
              placeholder={activeTab === 'GANTI_DATA'
                ? `Tempelkan format log ganti data di sini...\n\nContoh:\n1 28-08-2026 12:58:53 jvsaaks3 change user info julamri12 bank : bri => OVO,rek : 085184408544 => 085184408544,acc : JULAMRI => JUL AMRI julamri12`
                : `Tempelkan format log locked / unlocked di sini...\n\nContoh:\n1 28-08-2026 12:45:10 jvsaacs2 Locked (Spam Form Kosong) budi88\n2 28-08-2026 12:40:02 jvsaacs2 Locked (No Rekening Tidak Valid) andi99`
              }
              className="w-full h-64 p-4 rounded-xl bg-[#050811] border border-blue-900/40 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopyRaw}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {copiedRaw ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
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

        {/* ========================================================= */}
        {/* BOX 02: NAIK LAPORAN (READY TO COPY)                      */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-purple-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-400 text-xs font-black font-mono border border-purple-500/40">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    {activeTab === 'GANTI_DATA' ? 'Ganti Data Naik Laporan' : 'Locked / Unlock Naik Laporan'}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {(activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText) ? 'Format Siap Digunakan' : 'Menunggu Input Mentah'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                READY TO COPY
              </span>
            </div>

            <textarea
              readOnly
              value={activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText}
              placeholder={`Laporan hasil ekstraksi ${activeTab === 'GANTI_DATA' ? 'ganti data' : 'lock dan unlock'} akan tampil otomatis di sini...`}
              className="w-full h-64 p-4 rounded-xl bg-[#050811] border border-purple-900/40 text-xs text-purple-200 placeholder-gray-500 font-mono outline-none focus:border-purple-500 transition-all resize-none shadow-inner leading-relaxed select-all font-semibold"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCopyReport}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            >
              <div className="flex items-center gap-2 text-sm">
                {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>
                  {copiedReport 
                    ? 'Tersalin ke Clipboard!' 
                    : activeTab === 'GANTI_DATA' 
                      ? 'COPY GANTI DATA NAIK LAPORAN' 
                      : 'COPY LOCK UNLOCK NAIK LAPORAN'}
                </span>
              </div>
              {autoClearEnabled && (
                <span className="text-[10px] font-normal text-purple-200/80 mt-0.5 font-mono">
                  {copiedReport ? '✓ Data input mentah otomatis dibersihkan' : '• Input mentah otomatis dibersihkan saat tombol ini diklik'}
                </span>
              )}
            </button>

            {/* Counter pill */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#050811] border border-emerald-900/40 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] flex items-center justify-center border border-emerald-500/40">
                  {activeTab === 'GANTI_DATA' ? gdParsedList.length : lockParsedList.filter(l => l.action === 'Locked').length}
                </span>
                <span className="text-emerald-300 font-semibold">
                  {activeTab === 'GANTI_DATA'
                    ? `Jumlah User Ganti Data: ${gdParsedList.length} Akun`
                    : `Jumlah User Locked: ${lockParsedList.filter(l => l.action === 'Locked').length} Akun`}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                Staff: <strong className="text-cyan-300">{staffAlias.trim() || '(Kosong)'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOX 03: DETAIL DATA TABLE                                 */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-black font-mono border border-emerald-500/40">
              03
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                {activeTab === 'GANTI_DATA' ? 'Tabel Detail Ganti Data User' : 'Tabel Detail Locked User'}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                {activeTab === 'GANTI_DATA' 
                  ? 'Data rincian pergantian rekening/identitas member yang berhasil diekstrak:'
                  : 'Rincian kendala dan staf yang melakukan lock/unlock (kendala dapat diedit per baris):'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
              {activeTab === 'GANTI_DATA' ? `${gdParsedList.length} Baris Terproses` : `${lockParsedList.length} Baris Terproses`}
            </span>
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
          {activeTab === 'GANTI_DATA' ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 text-cyan-400 uppercase text-[11px] bg-[#050811]">
                  <th className="py-3 px-3.5">NO</th>
                  <th className="py-3 px-3.5">TANGGAL & JAM</th>
                  <th className="py-3 px-3.5">USER ID</th>
                  <th className="py-3 px-3.5">STAFF</th>
                  <th className="py-3 px-3.5">DATA SEBELUMNYA</th>
                  <th className="py-3 px-3.5">DATA TERBARU</th>
                  <th className="py-3 px-3.5">JENIS PERGANTIAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#070c18]/50">
                {gdParsedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                      Belum ada data ganti data yang ditempel... Silakan tempel log mentah di Box 01.
                    </td>
                  </tr>
                ) : (
                  gdParsedList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3.5 text-gray-400">{item.no}</td>
                      <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">{formatIndonesianDate(item.date, false)} {item.time}</td>
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {item.userId}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-gray-400">{item.staff}</td>
                      <td className="py-3 px-3.5">
                        <span className="text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          {item.oldBank}, {item.oldRek}, {item.oldAcc}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {item.newBank}, {item.newRek}, {item.newAcc}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                          {item.changeType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 text-cyan-400 uppercase text-[11px] bg-[#050811]">
                  <th className="py-3 px-3.5">USER ID</th>
                  <th className="py-3 px-3.5">STAFF YANG LOCK</th>
                  <th className="py-3 px-3.5">NAMA CS YANG LOCK</th>
                  <th className="py-3 px-3.5 min-w-[280px]">KENDALA (DAPAT DIEDIT PER BARIS)</th>
                  <th className="py-3 px-3.5">JAM LOCK</th>
                  <th className="py-3 px-3.5">STATUS ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#070c18]/50">
                {lockParsedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                      Belum ada data lock/unlock yang ditempel... Silakan tempel log mentah di Box 01.
                    </td>
                  </tr>
                ) : (
                  lockParsedList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {item.userId}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-gray-400">{item.staff}</td>
                      <td className="py-3 px-3.5 text-gray-300">{item.csName}</td>
                      <td className="py-3 px-3.5">
                        <input
                          type="text"
                          value={item.kendala}
                          onChange={(e) => handleUpdateKendala(item.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/40 text-xs text-white font-mono outline-none focus:border-cyan-400"
                        />
                      </td>
                      <td className="py-3 px-3.5 text-gray-400 whitespace-nowrap">{item.time}</td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.action === 'Locked'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {item.action}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
