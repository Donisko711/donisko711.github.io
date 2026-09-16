import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  FileText, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ArrowRightLeft
} from 'lucide-react';
import { UserProfile } from '../../types';

interface CrosscheckLockedProps {
  currentUser?: UserProfile | null;
}

interface ParsedLogLine {
  id: string;
  source: 'KOLOM_1' | 'KOLOM_2';
  rawLine: string;
  no: number;
  dateStr: string;
  timeStr: string;
  timestamp: number;
  staff: string;
  action: 'Locked' | 'Unlocked';
  kendala: string;
  userId: string;
}

export type DeadlineCategory = '1X24_JAM' | '2X24_JAM' | 'SELAMANYA';

export interface CrosscheckMemberResult {
  userId: string;
  isUnlocked: boolean;
  statusText: string;
  deadlineCategory: DeadlineCategory;
  deadlineLabel: string;
  isOverdue: boolean;
  overdueHours: number;
  kendala: string;
  lockStaff: string;
  lockDate: string;
  lockTime: string;
  lockTimestamp: number;
  unlockStaff?: string;
  unlockDate?: string;
  unlockTime?: string;
  unlockTimestamp?: number;
  durationLabel: string;
  recommendation: string;
  sourceSummary: string;
}

// Normalisasi kendala ke format baku
export const cleanCrosscheckReason = (rawReason: string): string => {
  const r = (rawReason || '').trim();
  if (!r) return 'Kendala Akun';

  if (/invest|colok\s*bebas/i.test(r)) {
    return 'Invest / Colok Bebas';
  }
  if (/hantu\s*togel|togel\s*hantu/i.test(r)) {
    return 'Hantu Togel';
  }
  if (/form\s*kosong|spam\s*form/i.test(r)) {
    return 'Spam Form Kosong';
  }
  if (/(?:nomor\s*rekening|no\s*rek(?:ening)?|rekening|rek)\s*tidak\s*valid/i.test(r)) {
    return 'No Rek Tidak Valid';
  }
  if (/e-?wallet\s*pl\s*(?:tidak|belum)\s*premium/i.test(r)) {
    return 'Ewallet PL Tidak Premium';
  }
  if (/nama\s*rekening\s*beda|nama\s*rek\s*beda|nama\s*beda/i.test(r)) {
    return 'Nama Rek Beda';
  }
  if (/akun\s*belum\s*premium|belum\s*premium/i.test(r)) {
    return 'Akun Belum Premium';
  }

  // Huruf besar di awal kata jika belum terformat
  return r.charAt(0).toUpperCase() + r.slice(1);
};

// Deteksi kategori deadline
export const getDeadlineCategory = (kendala: string): DeadlineCategory => {
  const k = kendala.toLowerCase();
  if (/invest|colok\s*bebas|hantu\s*togel|togel\s*hantu/i.test(k)) {
    return 'SELAMANYA';
  }
  if (/form\s*kosong|spam/i.test(k)) {
    return '1X24_JAM';
  }
  return '2X24_JAM';
};

// Parser tanggal & jam string menjadi timestamp angka (milidetik)
export const parseLogDateTime = (dateStr: string, timeStr?: string): { date: Date | null; timestamp: number } => {
  if (!dateStr) return { date: null, timestamp: 0 };
  const cleanDate = dateStr.trim().replace(/\//g, '-');
  const cleanTime = (timeStr || '00:00:00').trim();

  // Format DD-MM-YYYY
  const dmy = cleanDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const timeParts = cleanTime.split(':').map(p => parseInt(p, 10) || 0);
    const d = new Date(year, month, day, timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
    return { date: d, timestamp: d.getTime() };
  }

  // Format YYYY-MM-DD
  const ymd = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    const timeParts = cleanTime.split(':').map(p => parseInt(p, 10) || 0);
    const d = new Date(year, month, day, timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
    return { date: d, timestamp: d.getTime() };
  }

  const d = new Date(`${cleanDate} ${cleanTime}`);
  return { date: isNaN(d.getTime()) ? null : d, timestamp: isNaN(d.getTime()) ? 0 : d.getTime() };
};

// Parser baris teks mentah menjadi ParsedLogLine
export const parseRawLogLines = (rawText: string, source: 'KOLOM_1' | 'KOLOM_2'): ParsedLogLine[] => {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: ParsedLogLine[] = [];

  lines.forEach((line, idx) => {
    // 1. Tanggal dan Jam
    let dateStr = '';
    let timeStr = '00:00:00';
    const dtMatch = line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})\s+(\d{2}:\d{2}:\d{2})/)
      || line.match(/(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})/)
      || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})\s+(\d{2}:\d{2}:\d{2})/)
      || line.match(/(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/);

    if (dtMatch) {
      dateStr = dtMatch[1].replace(/\s+/g, '').replace(/\//g, '-');
      if (dtMatch[2]) {
        timeStr = dtMatch[2];
      }
    }

    const { timestamp } = parseLogDateTime(dateStr, timeStr);

    // 2. Action (Locked vs Unlocked)
    const isLocked = /\b(?:locked|lock)\b/i.test(line) || /status\s*->\s*locked/i.test(line);
    const isUnlocked = /\b(?:unlocked|unlock)\b/i.test(line) || /status\s*->\s*unlocked/i.test(line);
    let action: 'Locked' | 'Unlocked' = 'Locked';
    if (isUnlocked && !isLocked) {
      action = 'Unlocked';
    } else if (source === 'KOLOM_2' && isUnlocked) {
      action = 'Unlocked';
    }

    // 3. User ID
    let userId = '';
    const explicitUser = line.match(/(?:user\s*id|username|id\s*user|id\s*member|user)\s*[:=]\s*([a-zA-Z0-9_\-\.]+)/i);
    const afterActionMatch = line.match(/(?:locked|unlocked)\s*(?:\([^)]*\))?\s+([a-zA-Z0-9_\-\.]+)$/i);
    const tabCols = line.split('\t').map(c => c.trim());

    if (explicitUser) {
      userId = explicitUser[1].trim();
    } else if (tabCols.length >= 5 && /^[a-zA-Z0-9_\-\.]+$/.test(tabCols[tabCols.length - 1])) {
      userId = tabCols[tabCols.length - 1];
    } else if (afterActionMatch) {
      userId = afterActionMatch[1].trim();
    } else {
      const words = line.split(/\s+/).map(w => w.trim()).filter(Boolean);
      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        if (/^[a-zA-Z0-9_\-\.]{3,25}$/.test(lastWord) && !/^(locked|unlocked|member)$/i.test(lastWord)) {
          userId = lastWord;
        }
      }
    }

    if (!userId) return; // Baris tidak memuat User ID valid

    // 4. Kendala / Alasan
    let rawKendala = '';
    const updateInfoMatch = line.match(/update\s+info\s*:\s*(?:->\s*)?([^,\t\r\n]+?)(?:,?\s*Status\s*->|$)/i);
    const reasonMatch = line.match(/(?:locked|unlocked)\s*\(([^)]*)\)/i);
    const ketMatch = line.match(/(?:ket(?:erangan)?|alasan|kendala)\s*[:=]\s*(?:->\s*)?([^,\t\r\n]+)/i);

    if (updateInfoMatch && updateInfoMatch[1].trim()) {
      rawKendala = updateInfoMatch[1].trim();
    } else if (reasonMatch && reasonMatch[1].trim()) {
      rawKendala = reasonMatch[1].trim();
    } else if (ketMatch && ketMatch[1].trim() && !/^(locked|unlocked)$/i.test(ketMatch[1].trim())) {
      rawKendala = ketMatch[1].trim();
    } else if (action === 'Unlocked') {
      rawKendala = 'Buka Kunci Akun';
    } else {
      rawKendala = 'Kendala Akun';
    }

    const cleanKendala = cleanCrosscheckReason(rawKendala);

    // 5. Staff
    let staff = '';
    const staffMatch = line.match(/\b([a-zA-Z0-9_]+acs\d*)\b/i) || line.match(/staff\s*[:=]\s*([a-zA-Z0-9_]+)/i);
    if (staffMatch) {
      staff = staffMatch[1].trim();
    } else if (tabCols.length >= 3 && /^[a-zA-Z0-9_]+$/i.test(tabCols[2])) {
      staff = tabCols[2];
    }

    results.push({
      id: `${source}-${idx}-${userId}`,
      source,
      rawLine: line,
      no: idx + 1,
      dateStr,
      timeStr,
      timestamp: timestamp || (Date.now() - (idx * 60000)),
      staff: staff || '-',
      action,
      kendala: cleanKendala,
      userId: userId.toLowerCase()
    });
  });

  return results;
};

export const CrosscheckLocked: React.FC<CrosscheckLockedProps> = () => {
  // 2 Kolom Input Mentah
  const [col1Text, setCol1Text] = useState('');
  const [col2Text, setCol2Text] = useState('');

  // Status UI
  const [copiedResult, setCopiedResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'LOCKED' | 'UNLOCKED' | 'PERMANENT'>('ALL');

  // Parser Kolom 1 & Kolom 2
  const parsedCol1 = useMemo(() => parseRawLogLines(col1Text, 'KOLOM_1'), [col1Text]);
  const parsedCol2 = useMemo(() => parseRawLogLines(col2Text, 'KOLOM_2'), [col2Text]);

  // Gabungkan semua item
  const allParsedItems = useMemo(() => [...parsedCol1, ...parsedCol2], [parsedCol1, parsedCol2]);

  // Evaluasi Crosscheck per User ID
  const crosscheckResults = useMemo<CrosscheckMemberResult[]>(() => {
    if (allParsedItems.length === 0) return [];

    // Tentukan waktu acuan (Timestamp log terbaru dari data yang ditempel)
    const maxTimestampFromData = allParsedItems.reduce((max, item) => Math.max(max, item.timestamp), 0);
    // Jika data memuat timestamp valid di masa mendatang atau masa lampau, gunakan max(timestamp data, waktu sekarang)
    const referenceTimestamp = maxTimestampFromData > 0 ? maxTimestampFromData : Date.now();

    // Kumpulkan seluruh User ID unik (menjaga urutan kemunculan pertama)
    const userIdMap = new Map<string, ParsedLogLine[]>();
    allParsedItems.forEach(item => {
      const uid = item.userId.toLowerCase();
      const existing = userIdMap.get(uid) || [];
      existing.push(item);
      userIdMap.set(uid, existing);
    });

    const results: CrosscheckMemberResult[] = [];

    userIdMap.forEach((items, uid) => {
      // Urutkan item secara kronologis (terlama ke terbaru)
      const sortedItems = [...items].sort((a, b) => a.timestamp - b.timestamp);

      // Cari event Lock terakhir & event Unlock terakhir
      const lockEvents = sortedItems.filter(i => i.action === 'Locked');
      const unlockEvents = sortedItems.filter(i => i.action === 'Unlocked');

      const lastLock = lockEvents.length > 0 ? lockEvents[lockEvents.length - 1] : undefined;
      const lastUnlock = unlockEvents.length > 0 ? unlockEvents[unlockEvents.length - 1] : undefined;

      // Status Buka Kunci:
      // 1. Ada event unlock di Kolom 2
      // 2. ATAU event unlock terakhir terjadi setelah/setara event lock terakhir
      // 3. ATAU hanya ada event unlock tanpa event lock
      let isUnlocked = false;
      if (lastUnlock) {
        if (!lastLock) {
          isUnlocked = true;
        } else if (lastUnlock.timestamp >= lastLock.timestamp) {
          isUnlocked = true;
        } else if (lastUnlock.source === 'KOLOM_2') {
          // Jika sengaja ditaruh di Kolom 2 (Kolom Unlock), dianggap sudah dibuka
          isUnlocked = true;
        }
      }

      // Kendala: ambil dari event lock terakhir (atau event pertama)
      const effectiveKendala = lastLock?.kendala || items[0].kendala || 'Kendala Akun';
      const deadlineCategory = getDeadlineCategory(effectiveKendala);

      // Hitung durasi terkunci (Jam)
      const lockTimestamp = lastLock ? lastLock.timestamp : items[0].timestamp;
      const endTimestamp = isUnlocked && lastUnlock ? lastUnlock.timestamp : referenceTimestamp;
      const diffMs = Math.max(0, endTimestamp - lockTimestamp);
      const elapsedHours = Math.floor(diffMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const durationLabel = elapsedHours >= 24
        ? `${Math.floor(elapsedHours / 24)} Hari ${elapsedHours % 24} Jam`
        : `${elapsedHours} Jam ${elapsedMinutes} Menit`;

      // Evaluasi Overdue & Label
      let isOverdue = false;
      let statusText = '';
      let deadlineLabel = '';
      let recommendation = '';

      if (isUnlocked) {
        statusText = 'Sudah Di Buka';
        deadlineLabel = deadlineCategory === '1X24_JAM' 
          ? '1x24 Jam (Spam Form Kosong)' 
          : deadlineCategory === 'SELAMANYA' 
            ? 'Locked Selamanya' 
            : '2x24 Jam (Reguler)';
        recommendation = '✅ Selesai (Akun Sudah Dibuka)';
      } else {
        // Belum dibuka
        if (deadlineCategory === 'SELAMANYA') {
          deadlineLabel = 'Locked Selamanya (Permanen)';
          statusText = 'Locked Selamanya (Invest / Hantu Togel)';
          isOverdue = false;
          recommendation = '🔒 Tetap Terkunci (Akun Invest / Hantu Togel)';
        } else if (deadlineCategory === '1X24_JAM') {
          deadlineLabel = '1x24 Jam (1 Hari)';
          // Batas 24 jam untuk spam form kosong
          if (elapsedHours >= 24) {
            isOverdue = true;
            statusText = 'Belum Di Buka (segera dibuka karena melebihi durasi 1x24 jam)';
            recommendation = '🚨 SEGERA BUKA KUNCI (Melebihi Batas 1x24 Jam)';
          } else {
            statusText = 'Belum Di Buka (Dalam Batas Waktu 1x24 Jam)';
            recommendation = '⏳ Menunggu Batas 1x24 Jam';
          }
        } else {
          // 2x24 jam untuk kendala lainnya
          deadlineLabel = '2x24 Jam (2 Hari)';
          if (elapsedHours >= 48) {
            isOverdue = true;
            statusText = 'Belum Di Buka (segera dibuka karena melebihi durasi 2x24 jam)';
            recommendation = '🚨 SEGERA BUKA KUNCI (Melebihi Batas 2x24 Jam)';
          } else {
            statusText = 'Belum Di Buka (Dalam Batas Waktu 2x24 Jam)';
            recommendation = '⏳ Menunggu Batas 2x24 Jam';
          }
        }
      }

      // Ringkasan sumber data
      const col1Found = items.some(i => i.source === 'KOLOM_1');
      const col2Found = items.some(i => i.source === 'KOLOM_2');
      let sourceSummary = 'Kolom 1';
      if (col1Found && col2Found) sourceSummary = 'Kolom 1 & 2';
      else if (col2Found) sourceSummary = 'Kolom 2';

      results.push({
        userId: uid,
        isUnlocked,
        statusText,
        deadlineCategory,
        deadlineLabel,
        isOverdue,
        overdueHours: elapsedHours,
        kendala: effectiveKendala,
        lockStaff: lastLock?.staff || '-',
        lockDate: lastLock?.dateStr || '-',
        lockTime: lastLock?.timeStr || '-',
        lockTimestamp,
        unlockStaff: lastUnlock?.staff,
        unlockDate: lastUnlock?.dateStr,
        unlockTime: lastUnlock?.timeStr,
        unlockTimestamp: lastUnlock?.timestamp,
        durationLabel,
        recommendation,
        sourceSummary
      });
    });

    return results;
  }, [allParsedItems]);

  // Format Teks Hasil Ekstraksi untuk disalin (persis seperti yang diminta user)
  const formattedOutputText = useMemo(() => {
    if (crosscheckResults.length === 0) return '';

    const blocks = crosscheckResults.map(res => {
      return `ID : ${res.userId}\nStatus : ${res.statusText}`;
    });

    return blocks.join('\n\n');
  }, [crosscheckResults]);

  // Akun yang Overdue (Perlu Segera Dibuka)
  const overdueMembers = useMemo(() => {
    return crosscheckResults.filter(r => r.isOverdue);
  }, [crosscheckResults]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const total = crosscheckResults.length;
    const unlocked = crosscheckResults.filter(r => r.isUnlocked).length;
    const overdue = crosscheckResults.filter(r => r.isOverdue).length;
    const pendingSafe = crosscheckResults.filter(r => !r.isUnlocked && !r.isOverdue && r.deadlineCategory !== 'SELAMANYA').length;
    const permanent = crosscheckResults.filter(r => r.deadlineCategory === 'SELAMANYA').length;

    return { total, unlocked, overdue, pendingSafe, permanent };
  }, [crosscheckResults]);

  // Handle Salin Hasil
  const handleCopyResult = () => {
    if (!formattedOutputText) return;
    navigator.clipboard.writeText(formattedOutputText);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2500);
  };

  // Muat Contoh Format Sesuai Instruksi User
  const handleLoadSample = () => {
    const sampleCol1 = `3\t16-09-2026 14:58:17\tkeoaacs2\tChange Lock/Unlock\tLocked (Invest Colok Bebas2D)\tinpess
4\t16-09-2026 02:46:55\tkeoaacs1\tChange Lock/Unlock\tLocked (spam form kosong)\tadamsaputra
6\t16-09-2026 00:23:30\tkeoaacs7\tChange Lock/Unlock\tLocked (spam form kosong)\tdhoblank`;

    const sampleCol2 = `1\t17-09-2026 03:59:11\tkeoaacs1\tChange Lock/Unlock\tUnlocked ()\tadamsaputra
2\t17-09-2026 03:40:07\tkeoaacs1\tChange Lock/Unlock\tLocked (Ewallet pl tidak premium)\thejo`;

    setCol1Text(sampleCol1);
    setCol2Text(sampleCol2);
  };

  // Bersihkan input
  const handleClearAll = () => {
    setCol1Text('');
    setCol2Text('');
  };

  // Filter Hasil Tabel
  const filteredTableList = useMemo(() => {
    return crosscheckResults.filter(item => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = item.userId.toLowerCase().includes(q);
        const matchKendala = item.kendala.toLowerCase().includes(q);
        const matchStaff = item.lockStaff.toLowerCase().includes(q);
        if (!matchUser && !matchKendala && !matchStaff) return false;
      }

      // 2. Status Filter
      if (statusFilter === 'OVERDUE') return item.isOverdue;
      if (statusFilter === 'LOCKED') return !item.isUnlocked && item.deadlineCategory !== 'SELAMANYA';
      if (statusFilter === 'UNLOCKED') return item.isUnlocked;
      if (statusFilter === 'PERMANENT') return item.deadlineCategory === 'SELAMANYA';

      return true;
    });
  }, [crosscheckResults, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in" id="crosscheck-locked-container">
      {/* ATURAN BATAS WAKTU BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-[#0e1626] to-[#070b14] border border-amber-500/30 flex items-start gap-3 shadow-md">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 font-mono">BATAS 1x24 JAM</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                1 Hari
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">Spam Form Kosong / Form Kosong</p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              Jika member di-lock tanggal 16, maka tanggal 17 statusnya wajib sudah di-unlock.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-[#0e1626] to-[#070b14] border border-blue-500/30 flex items-start gap-3 shadow-md">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-300 font-mono">BATAS 2x24 JAM</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
                2 Hari
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">Kendala Lainnya (Reguler)</p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              Rekening tidak valid, Ewallet PL, Nama beda memiliki batas waktu maksimal 2x24 jam.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-[#0e1626] to-[#070b14] border border-purple-500/30 flex items-start gap-3 shadow-md">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-purple-300 font-mono">LOCKED SELAMANYA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                Permanen
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">Invest / Colok Bebas & Hantu Togel</p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              Terkunci selamanya dan tidak perlu dibuka kuncinya. Tidak akan memicu alert keterlambatan.
            </p>
          </div>
        </div>
      </div>

      {/* ALERT / REMINDER OVERDUE JIKA ADA MEMBER MELEBIHI WAKTU */}
      {overdueMembers.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#2a0c14] to-[#1a080d] border-2 border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/30 text-rose-300 border border-rose-400/50 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-rose-200 tracking-wide font-sans flex items-center gap-2">
                  <span>PERINGATAN: TERDAPAT {overdueMembers.length} AKUN LOCKED MELEBIHI BATAS WAKTU!</span>
                </h3>
                <p className="text-xs text-rose-300/80 font-mono mt-0.5">
                  Segera lakukan pembukaan akun (unlock) untuk member berikut karena telah melebihi batas waktu 1x24 jam / 2x24 jam:
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-500 text-black text-xs font-mono font-black self-start sm:self-auto shrink-0 shadow-md">
              {overdueMembers.length} AKUN OVERDUE
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-rose-500/30">
            {overdueMembers.map(item => (
              <div 
                key={item.userId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-rose-500/50 text-xs font-mono text-rose-200"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold text-white uppercase">{item.userId}</span>
                <span className="text-[10px] text-gray-400">({item.kendala})</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold text-[10px]">
                  Terlambat {item.overdueHours} Jam
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2-KOLOM INPUT UNTUK TEMPEL FORMAT                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* KOLOM 1: LOG LOCKED / KEMARIN */}
        <div className="p-5 rounded-2xl bg-[#09101f] border border-blue-500/30 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-black font-mono border border-blue-500/40">
                  KOLOM 1
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                    <span>Log Locked / Data Kemarin</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-bold">
                      {parsedCol1.length} Baris
                    </span>
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Tempel daftar log akun yang di-lock atau data tanggal sebelumnya:
                  </span>
                </div>
              </div>

              {col1Text && (
                <button
                  type="button"
                  onClick={() => setCol1Text('')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-transparent hover:border-rose-500/30 text-xs transition-colors cursor-pointer"
                  title="Bersihkan Kolom 1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <textarea
              value={col1Text}
              onChange={(e) => setCol1Text(e.target.value)}
              placeholder={`Tempelkan format log locked / data tanggal sebelumnya di sini...\n\nContoh:\n3\t16-09-2026 14:58:17\tkeoaacs2\tChange Lock/Unlock\tLocked (Invest Colok Bebas2D)\tinpess\n4\t16-09-2026 02:46:55\tkeoaacs1\tChange Lock/Unlock\tLocked (spam form kosong)\tadamsaputra\n6\t16-09-2026 00:23:30\tkeoaacs7\tChange Lock/Unlock\tLocked (spam form kosong)\tdhoblank`}
              className="mt-3 w-full h-56 p-3.5 rounded-xl bg-[#050811] border border-blue-900/40 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
            <span>💡 Terdeteksi: {parsedCol1.length} baris log locked</span>
            <span className="text-blue-400">Input Data 1</span>
          </div>
        </div>

        {/* KOLOM 2: LOG UNLOCKED / HARI INI */}
        <div className="p-5 rounded-2xl bg-[#09101f] border border-emerald-500/30 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black font-mono border border-emerald-500/40">
                  KOLOM 2
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                    <span>Log Unlocked / Data Hari Ini</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold">
                      {parsedCol2.length} Baris
                    </span>
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Tempel daftar log akun yang di-unlock atau data hari ini:
                  </span>
                </div>
              </div>

              {col2Text && (
                <button
                  type="button"
                  onClick={() => setCol2Text('')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-transparent hover:border-rose-500/30 text-xs transition-colors cursor-pointer"
                  title="Bersihkan Kolom 2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <textarea
              value={col2Text}
              onChange={(e) => setCol2Text(e.target.value)}
              placeholder={`Tempelkan format log unlocked / data hari ini di sini...\n\nContoh:\n1\t17-09-2026 03:59:11\tkeoaacs1\tChange Lock/Unlock\tUnlocked ()\tadamsaputra\n2\t17-09-2026 03:40:07\tkeoaacs1\tChange Lock/Unlock\tLocked (Ewallet pl tidak premium)\thejo`}
              className="mt-3 w-full h-56 p-3.5 rounded-xl bg-[#050811] border border-emerald-900/40 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
            <span>💡 Terdeteksi: {parsedCol2.length} baris log unlocked</span>
            <span className="text-emerald-400">Input Data 2</span>
          </div>
        </div>
      </div>

      {/* ACTION BAR: CONTOH FORMAT & BERSIHKAN */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080d19] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-gray-300">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Bisa tempel di 2 kolom terpisah (Kemarin & Hari ini) atau gabungkan langsung dalam 1 kolom.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contoh Format Sesuai Instruksi</span>
          </button>
          {(col1Text || col2Text) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Input</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* HASIL KOTAK TEKS OUTPUT (PERSIS FORMAT LAPORAN USER)       */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#09101f] border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black font-mono border border-amber-500/40">
              HASIL
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <span>Hasil Crosscheck Status ID Locked</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {crosscheckResults.length} Akun Diproses
                </span>
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">
                Format siap disalin untuk pengecekan atau laporan internal:
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyResult}
            disabled={!formattedOutputText}
            className={`px-4 py-2 rounded-xl font-mono font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-md ${
              copiedResult
                ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse'
                : formattedOutputText
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 text-gray-500 border-white/10 opacity-30 cursor-not-allowed'
            }`}
          >
            {copiedResult ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedResult ? 'Tersalin ke Clipboard!' : 'COPY HASIL CROSSCHECK'}</span>
          </button>
        </div>

        <textarea
          readOnly
          value={formattedOutputText}
          placeholder="Hasil perbandingan crosscheck ID locked dan unlocked akan tampil di sini..."
          className="w-full h-52 p-4 rounded-xl bg-[#050811] border border-amber-900/40 text-xs text-amber-200 placeholder-gray-500 font-mono outline-none focus:border-amber-500 transition-all resize-none shadow-inner leading-relaxed select-all font-semibold"
        />

        {/* Counter Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#050811] border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 uppercase block">Total Akun</span>
            <span className="text-base font-black text-white mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#050811] border border-emerald-500/20 text-center">
            <span className="text-[10px] text-emerald-400 uppercase block">Sudah Dibuka</span>
            <span className="text-base font-black text-emerald-400 mt-0.5 block">{stats.unlocked}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#050811] border border-rose-500/20 text-center">
            <span className="text-[10px] text-rose-400 uppercase block">Melebihi Waktu</span>
            <span className="text-base font-black text-rose-400 mt-0.5 block">{stats.overdue}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#050811] border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-400 uppercase block">Belum Dibuka (Aman)</span>
            <span className="text-base font-black text-amber-400 mt-0.5 block">{stats.pendingSafe}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#050811] border border-purple-500/20 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-purple-400 uppercase block">Invest (Permanen)</span>
            <span className="text-base font-black text-purple-400 mt-0.5 block">{stats.permanent}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABEL DETAIL CROSSCHECK INFORMASIONAL                      */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#09101f] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black font-mono border border-cyan-500/40">
              TABEL
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <span>Tabel Informasi Crosscheck ID Locked</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Informasi mendalam mengenai batas waktu, durasi terkunci, kendala, dan rekomendasi tindakan:
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari User ID / Kendala..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#050811] border border-white/10 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-cyan-500 transition-all w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center p-1 rounded-xl bg-[#050811] border border-white/10 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  statusFilter === 'ALL' ? 'bg-cyan-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Semua ({crosscheckResults.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OVERDUE')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  statusFilter === 'OVERDUE' ? 'bg-rose-500 text-black shadow-sm' : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                🚨 Overdue ({stats.overdue})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('LOCKED')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  statusFilter === 'LOCKED' ? 'bg-amber-500 text-black shadow-sm' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Belum Buka ({stats.pendingSafe})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('UNLOCKED')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  statusFilter === 'UNLOCKED' ? 'bg-emerald-500 text-black shadow-sm' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Sudah Buka ({stats.unlocked})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PERMANENT')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  statusFilter === 'PERMANENT' ? 'bg-purple-500 text-white shadow-sm' : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Invest ({stats.permanent})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/10 text-cyan-400 uppercase text-[11px] bg-[#050811]">
                <th className="py-3 px-3.5">NO</th>
                <th className="py-3 px-3.5">USER ID</th>
                <th className="py-3 px-3.5">STATUS</th>
                <th className="py-3 px-3.5">KENDALA / ALASAN</th>
                <th className="py-3 px-3.5">BATAS MAKSIMAL</th>
                <th className="py-3 px-3.5">DURASI TERKUNCI</th>
                <th className="py-3 px-3.5">WAKTU LOCK</th>
                <th className="py-3 px-3.5">WAKTU UNLOCK</th>
                <th className="py-3 px-3.5">REKOMENDASI TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTableList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-mono">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-gray-600 animate-pulse" />
                      <span>Belum ada data crosscheck. Tempelkan format log pada Kolom 1 atau Kolom 2 di atas.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTableList.map((res, index) => {
                  return (
                    <tr 
                      key={res.userId}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        res.isOverdue 
                          ? 'bg-rose-950/20' 
                          : res.isUnlocked 
                            ? 'bg-emerald-950/10' 
                            : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-gray-400 font-bold">{index + 1}</td>
                      <td className="py-3 px-3.5 font-bold font-mono">
                        <span className="text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {res.userId}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {res.isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Sudah Di Buka
                          </span>
                        ) : res.isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Belum Buka (Overdue)
                          </span>
                        ) : res.deadlineCategory === 'SELAMANYA' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            <Lock className="w-3 h-3" />
                            Locked Selamanya
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3" />
                            Belum Di Buka (Aman)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-gray-200">
                        {res.kendala}
                      </td>
                      <td className="py-3 px-3.5 text-gray-300">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.deadlineCategory === '1X24_JAM'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : res.deadlineCategory === 'SELAMANYA'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {res.deadlineLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-gray-200">
                        <span className={res.isOverdue ? 'text-rose-400 font-bold' : 'text-gray-300'}>
                          {res.durationLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-gray-400 text-[11px]">
                        <div>{res.lockDate}</div>
                        <div className="text-[10px] text-gray-500">{res.lockTime} ({res.lockStaff})</div>
                      </td>
                      <td className="py-3 px-3.5 text-gray-400 text-[11px]">
                        {res.unlockDate && res.unlockDate !== '-' ? (
                          <>
                            <div className="text-emerald-300 font-semibold">{res.unlockDate}</div>
                            <div className="text-[10px] text-gray-500">{res.unlockTime} ({res.unlockStaff || '-'})</div>
                          </>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`text-[11px] font-bold font-mono ${
                          res.isOverdue 
                            ? 'text-rose-400 font-black' 
                            : res.isUnlocked 
                              ? 'text-emerald-400' 
                              : res.deadlineCategory === 'SELAMANYA' 
                                ? 'text-purple-400' 
                                : 'text-amber-400'
                        }`}>
                          {res.recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
