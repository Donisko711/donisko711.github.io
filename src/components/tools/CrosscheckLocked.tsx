import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  RefreshCw,
  Info,
  Timer
} from 'lucide-react';
import { UserProfile } from '../../types';

interface CrosscheckLockedProps {
  currentUser?: UserProfile | null;
}

export interface ParsedLogLine {
  id: string;
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
  statusType: 'SUDAH_DIBUKA' | 'BELUM_DIBUKA_OVERDUE' | 'BELUM_DIBUKA_NORMAL' | 'LOCKED_SELAMANYA';
  statusTextShort: string;      // e.g. "masih di locked" / "sudah di buka" / "masih locked"
  statusTextDetail: string;     // e.g. "Belum Di Buka (segera dibuka karena melebihi durasi 1x24 jam)"
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
  latestDate: string;
}

// Data Contoh dari User (Format 2 Tanggal: 17 & 18 September 2026)
export const SAMPLE_TWO_DATE_LOG = `1\t18-09-2026 01:13:18\tlelaacs2\tChange Lock/Unlock\tLocked (spam form kosong)\tadinda1212
2\t17-09-2026 20:45:26\tlelaacs3\tChange Lock/Unlock\tLocked (form kosong )\tpadang11
3\t17-09-2026 14:32:03\tlelaacs2\tChange Lock/Unlock\tLocked (form kosong)\thalimah5
4\t17-09-2026 14:31:32\tlelaacs5\tChange Lock/Unlock\tLocked (form kosong)\tagussedihh
5\t17-09-2026 14:31:01\tlelaacs2\tChange Lock/Unlock\tLocked (form kosong)\ttasem
6\t17-09-2026 14:12:11\tlelaacs2\tChange Lock/Unlock\tLocked (Invest2D)\tinpess24
7\t17-09-2026 14:11:49\tlelaacs2\tChange Lock/Unlock\tLocked (Invest2D)\tinpess23
8\t17-09-2026 14:10:26\tlelaacs5\tChange Lock/Unlock\tLocked (SPAM FORM KOSONG)\tpahlawansctr
9\t17-09-2026 12:41:38\tlelaacs5\tChange Lock/Unlock\tUnlocked ()\tagusekuk
10\t17-09-2026 12:27:14\tlelaacs5\tChange Lock/Unlock\tLocked (form kosong)\tmogajjp
11\t17-09-2026 12:26:40\tlelaacs5\tChange Lock/Unlock\tLocked (rek tidak valid)\tagusekuk
12\t17-09-2026 04:06:36\tlelaacs1\tChange Lock/Unlock\tUnlocked ()\tcoy1234
13\t17-09-2026 04:06:21\tlelaacs1\tChange Lock/Unlock\tUnlocked ()\tjalii
14\t17-09-2026 00:10:03\tlelaacs2\tChange Lock/Unlock\tUnlocked ()\terlangga15`;

// Normalisasi kendala ke format teks baku
export const cleanCrosscheckReason = (rawReason: string): string => {
  const r = (rawReason || '').trim();
  if (!r) return 'Kendala Akun';

  if (/invest/i.test(r)) {
    if (/2d/i.test(r)) return 'Invest 2D';
    if (/3d/i.test(r)) return 'Invest 3D';
    if (/4d/i.test(r)) return 'Invest 4D';
    if (/colok\s*bebas/i.test(r)) return 'Invest Colok Bebas';
    return `Invest (${r})`;
  }
  if (/hantu\s*togel|togel\s*hantu/i.test(r)) {
    return 'Hantu Togel';
  }
  if (/spam\s*form/i.test(r)) {
    return 'Spam Form Kosong';
  }
  if (/form\s*kosong/i.test(r)) {
    return 'Form Kosong';
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

  return r.charAt(0).toUpperCase() + r.slice(1);
};

// Deteksi kategori batas waktu
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
export const parseRawLogLines = (rawText: string): ParsedLogLine[] => {
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
    // CATATAN PENTING: teks log sering memuat "Change Lock/Unlock" sebagai nama fitur,
    // maka kita harus mengabaikan frasa "Change Lock/Unlock" agar tidak salah deteksi action.
    const lineWithoutChangeHeader = line.replace(/Change\s+Lock\s*\/\s*Unlock/gi, '');
    let action: 'Locked' | 'Unlocked' = 'Locked';

    if (/\bunlocked\b/i.test(lineWithoutChangeHeader) || /status\s*->\s*unlocked/i.test(line)) {
      action = 'Unlocked';
    } else if (/\blocked\b/i.test(lineWithoutChangeHeader) || /status\s*->\s*locked/i.test(line)) {
      action = 'Locked';
    }

    // 3. User ID
    let userId = '';
    const tabCols = line.split('\t').map(c => c.trim()).filter(Boolean);
    const explicitUser = line.match(/(?:user\s*id|username|id\s*user|id\s*member|user)\s*[:=]\s*([a-zA-Z0-9_\-\.]+)/i);
    const afterActionMatch = line.match(/(?:locked|unlocked)\s*(?:\([^)]*\))?\s+([a-zA-Z0-9_\-\.]+)$/i);

    if (explicitUser) {
      userId = explicitUser[1].trim();
    } else if (tabCols.length >= 5 && /^[a-zA-Z0-9_\-\.]{3,30}$/.test(tabCols[tabCols.length - 1])) {
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

    if (!userId) return; // Abaikan baris tanpa User ID valid

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
      id: `log-${idx}-${userId}`,
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
  // Hanya SATU KOLOM input teks mentah sesuai instruksi user
  const [rawText, setRawText] = useState(SAMPLE_TWO_DATE_LOG);

  // Auto-Clear Timer states (seperti pada modul Bonus Scatter)
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(true);
  const [autoClearSeconds, setAutoClearSeconds] = useState<number>(5);
  const [countdown, setCountdown] = useState<number>(0);
  const [justCleared, setJustCleared] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persisted state agar data hasil analisis tetap tersimpan saat teks di-auto clear
  const [persistedResults, setPersistedResults] = useState<CrosscheckMemberResult[]>([]);
  const [persistedDetectedDates, setPersistedDetectedDates] = useState<string[]>([]);
  const [persistedLatestDate, setPersistedLatestDate] = useState<string>('');
  const [persistedItemsCount, setPersistedItemsCount] = useState<number>(0);

  // Status UI
  const [copiedResult, setCopiedResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'LOCKED' | 'UNLOCKED' | 'PERMANENT'>('ALL');

  // Parser baris log
  const parsedItems = useMemo(() => parseRawLogLines(rawText), [rawText]);

  // Deteksi Tanggal Unik yang terdapat dalam format log
  const detectedDates = useMemo(() => {
    const dates = Array.from(new Set(parsedItems.map(p => p.dateStr).filter(Boolean)));
    // Urutkan tanggal dari terlama ke terbaru
    return dates.sort((a, b) => {
      const tA = parseLogDateTime(a).timestamp;
      const tB = parseLogDateTime(b).timestamp;
      return tA - tB;
    });
  }, [parsedItems]);

  // Tanggal terbaru dalam data (Tanggal referensi perbandingan)
  const latestDateInLog = useMemo(() => {
    if (detectedDates.length === 0) return '';
    return detectedDates[detectedDates.length - 1];
  }, [detectedDates]);

  // Evaluasi Crosscheck per User ID
  const crosscheckResults = useMemo<CrosscheckMemberResult[]>(() => {
    if (parsedItems.length === 0) return [];

    // Tentukan waktu acuan (Timestamp log terbaru dari data yang ditempel)
    const maxTimestampFromData = parsedItems.reduce((max, item) => Math.max(max, item.timestamp), 0);
    const referenceTimestamp = maxTimestampFromData > 0 ? maxTimestampFromData : Date.now();

    // Kumpulkan seluruh User ID unik (menjaga urutan kemunculan pertama)
    const userIdMap = new Map<string, ParsedLogLine[]>();
    parsedItems.forEach(item => {
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
      // Akun dianggap SUDAH DIBUKA jika:
      // 1. Ada event unlock, dan tidak ada event lock
      // 2. ATAU event unlock terakhir terjadi SETELAH atau BERSAMAAN DENGAN event lock terakhir
      let isUnlocked = false;
      if (lastUnlock) {
        if (!lastLock) {
          isUnlocked = true;
        } else if (lastUnlock.timestamp >= lastLock.timestamp) {
          isUnlocked = true;
        }
      }

      // Kendala: ambil dari event lock terakhir (atau event pertama)
      const effectiveKendala = lastLock?.kendala || items[0].kendala || 'Kendala Akun';
      const deadlineCategory = getDeadlineCategory(effectiveKendala);

      // Tanggal lock
      const lockDate = lastLock ? lastLock.dateStr : items[0].dateStr;
      const lockTime = lastLock ? lastLock.timeStr : items[0].timeStr;
      const lockTimestamp = lastLock ? lastLock.timestamp : items[0].timestamp;

      // Hitung selisih durasi (Jam & Hari)
      const endTimestamp = isUnlocked && lastUnlock ? lastUnlock.timestamp : referenceTimestamp;
      const diffMs = Math.max(0, endTimestamp - lockTimestamp);
      const elapsedHours = Math.floor(diffMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const durationLabel = elapsedHours >= 24
        ? `${Math.floor(elapsedHours / 24)} Hari ${elapsedHours % 24} Jam`
        : `${elapsedHours} Jam ${elapsedMinutes} Menit`;

      // Cek apakah tanggal lock berbeda dengan tanggal terbaru (misal di-lock tgl 17, tgl terbaru tgl 18)
      const isCrossDay = lockDate && latestDateInLog && lockDate !== latestDateInLog;

      let statusType: 'SUDAH_DIBUKA' | 'BELUM_DIBUKA_OVERDUE' | 'BELUM_DIBUKA_NORMAL' | 'LOCKED_SELAMANYA' = 'BELUM_DIBUKA_NORMAL';
      let isOverdue = false;
      let statusTextShort = 'masih di locked';
      let statusTextDetail = '';
      let deadlineLabel = '';
      let recommendation = '';

      if (isUnlocked) {
        statusType = 'SUDAH_DIBUKA';
        statusTextShort = 'sudah di buka';
        statusTextDetail = 'Sudah Di Buka';
        deadlineLabel = deadlineCategory === '1X24_JAM' 
          ? '1x24 Jam (Form Kosong)' 
          : deadlineCategory === 'SELAMANYA' 
            ? 'Locked Selamanya' 
            : '2x24 Jam (Reguler)';
        recommendation = '✅ Selesai (Akun Sudah Dibuka)';
      } else {
        // Akun Masih Terkunci
        if (deadlineCategory === 'SELAMANYA') {
          statusType = 'LOCKED_SELAMANYA';
          statusTextShort = 'masih locked';
          statusTextDetail = 'Locked Selamanya (Invest / Hantu Togel)';
          deadlineLabel = 'Locked Selamanya (Permanen)';
          isOverdue = false;
          recommendation = '🔒 Tetap Terkunci (Akun Invest / Hantu Togel)';
        } else if (deadlineCategory === '1X24_JAM') {
          deadlineLabel = '1x24 Jam (1 Hari)';
          // Batas 1x24 jam untuk form kosong / spam form kosong:
          // Jika di-lock pada tanggal 17 dan pada tanggal 18 belum ada status unlocked,
          // atau selisih jam sudah >= 24 jam -> OVERDUE (Segera Dibuka)
          if (isCrossDay || elapsedHours >= 24) {
            isOverdue = true;
            statusType = 'BELUM_DIBUKA_OVERDUE';
            statusTextShort = 'masih di locked';
            statusTextDetail = 'Belum Di Buka (segera dibuka karena melebihi durasi 1x24 jam)';
            recommendation = '🚨 SEGERA BUKA KUNCI (Melebihi Batas 1x24 Jam)';
          } else {
            statusType = 'BELUM_DIBUKA_NORMAL';
            statusTextShort = 'masih di locked';
            statusTextDetail = 'Belum Di Buka (Dalam Batas Waktu 1x24 Jam)';
            recommendation = '⏳ Dalam Batas Waktu 1x24 Jam';
          }
        } else {
          // 2x24 jam untuk kendala reguler lainnya
          deadlineLabel = '2x24 Jam (2 Hari)';
          if (elapsedHours >= 48) {
            isOverdue = true;
            statusType = 'BELUM_DIBUKA_OVERDUE';
            statusTextShort = 'masih di locked';
            statusTextDetail = 'Belum Di Buka (segera dibuka karena melebihi durasi 2x24 jam)';
            recommendation = '🚨 SEGERA BUKA KUNCI (Melebihi Batas 2x24 Jam)';
          } else {
            statusType = 'BELUM_DIBUKA_NORMAL';
            statusTextShort = 'masih di locked';
            statusTextDetail = 'Belum Di Buka (Dalam Batas Waktu 2x24 Jam)';
            recommendation = '⏳ Dalam Batas Waktu 2x24 Jam';
          }
        }
      }

      results.push({
        userId: uid,
        isUnlocked,
        statusType,
        statusTextShort,
        statusTextDetail,
        deadlineCategory,
        deadlineLabel,
        isOverdue,
        overdueHours: Math.max(0, elapsedHours - (deadlineCategory === '1X24_JAM' ? 24 : 48)),
        kendala: effectiveKendala,
        lockStaff: lastLock?.staff || '-',
        lockDate,
        lockTime,
        lockTimestamp,
        unlockStaff: lastUnlock?.staff,
        unlockDate: lastUnlock?.dateStr,
        unlockTime: lastUnlock?.timeStr,
        unlockTimestamp: lastUnlock?.timestamp,
        durationLabel,
        recommendation,
        latestDate: latestDateInLog
      });
    });

    // Urutkan hasil secara kronologis (dari log terlama ke terbaru)
    return results.sort((a, b) => a.lockTimestamp - b.lockTimestamp);
  }, [parsedItems, latestDateInLog]);

  // Sinkronisasi ke persisted state ketika ada data baru
  useEffect(() => {
    if (crosscheckResults.length > 0) {
      setPersistedResults(crosscheckResults);
      setPersistedDetectedDates(detectedDates);
      setPersistedLatestDate(latestDateInLog);
      setPersistedItemsCount(parsedItems.length);
    }
  }, [crosscheckResults, detectedDates, latestDateInLog, parsedItems.length]);

  // Data aktif yang ditampilkan di tabel dan metrik (tetap ada meskipun textarea sudah ter-auto clear)
  const activeResults = useMemo(() => {
    return crosscheckResults.length > 0 ? crosscheckResults : persistedResults;
  }, [crosscheckResults, persistedResults]);

  const activeDetectedDates = useMemo(() => {
    return detectedDates.length > 0 ? detectedDates : persistedDetectedDates;
  }, [detectedDates, persistedDetectedDates]);

  const activeLatestDate = useMemo(() => {
    return latestDateInLog || persistedLatestDate;
  }, [latestDateInLog, persistedLatestDate]);

  const activeItemsCount = useMemo(() => {
    return parsedItems.length > 0 ? parsedItems.length : persistedItemsCount;
  }, [parsedItems.length, persistedItemsCount]);

  // Auto-Clear Timer Logic (persis seperti modul Bonus Scatter)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!rawText.trim() || !autoClearEnabled) {
      setCountdown(0);
      return;
    }

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

  // Bersihkan input teks sekaligus reset hasil analisis
  const handleClearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRawText('');
    setCountdown(0);
    setPersistedResults([]);
    setPersistedDetectedDates([]);
    setPersistedLatestDate('');
    setPersistedItemsCount(0);
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 2000);
  };

  // Metrik Statistik (berdasarkan activeResults)
  const metrics = useMemo(() => {
    const total = activeResults.length;
    const stillLocked = activeResults.filter(r => !r.isUnlocked);
    const overdue = activeResults.filter(r => r.isOverdue);
    const unlocked = activeResults.filter(r => r.isUnlocked);
    const permanent = activeResults.filter(r => r.deadlineCategory === 'SELAMANYA');

    return {
      total,
      stillLockedCount: stillLocked.length,
      overdueCount: overdue.length,
      unlockedCount: unlocked.length,
      permanentCount: permanent.length
    };
  }, [activeResults]);

  // Daftar Member Yang Masih Terkunci
  const stillLockedMembers = useMemo(() => {
    return activeResults.filter(r => !r.isUnlocked);
  }, [activeResults]);

  // Filter Hasil untuk Tabel
  const filteredResults = useMemo(() => {
    return activeResults.filter(item => {
      const matchSearch = item.userId.includes(searchQuery.toLowerCase()) || 
                          item.kendala.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (statusFilter === 'OVERDUE') return item.isOverdue;
      if (statusFilter === 'LOCKED') return !item.isUnlocked;
      if (statusFilter === 'UNLOCKED') return item.isUnlocked;
      if (statusFilter === 'PERMANENT') return item.deadlineCategory === 'SELAMANYA';
      return true;
    });
  }, [activeResults, searchQuery, statusFilter]);

  // Salin ke Clipboard (List Member Masih Locked)
  const handleCopyStillLocked = async () => {
    if (stillLockedMembers.length === 0) return;
    const text = stillLockedMembers.map(m => `${m.userId} ${m.statusTextShort}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. KARTU ATURAN BATAS WAKTU (BUSINESS LOGIC NOTICE)       */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1424] via-[#111c33] to-[#0d1424] border border-amber-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider font-mono">
                Aturan &amp; Batas Waktu Crosscheck ID Locked CS
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                Tempelkan seluruh riwayat log yang mencakup <strong className="text-white">2 tanggal</strong> (misal tanggal 17 &amp; 18) ke dalam <strong className="text-amber-300">1 kolom input</strong> di bawah. Sistem akan otomatis mendeteksi member yang di-lock dan mencocokkan apakah sudah ada status <strong className="text-emerald-300">Unlocked</strong> di tanggal terbaru.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 shrink-0 font-mono text-[11px]">
            <div className="px-3 py-2 rounded-xl bg-[#070b14] border border-rose-500/30 text-rose-300 text-center">
              <span className="block font-bold text-xs text-rose-400">1x24 Jam</span>
              <span className="text-[10px] text-gray-400">Form Kosong</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#070b14] border border-cyan-500/30 text-cyan-300 text-center">
              <span className="block font-bold text-xs text-cyan-400">2x24 Jam</span>
              <span className="text-[10px] text-gray-400">Reguler / Lainnya</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#070b14] border border-purple-500/30 text-purple-300 text-center">
              <span className="block font-bold text-xs text-purple-400">Selamanya</span>
              <span className="text-[10px] text-gray-400">Invest / Togel</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SATU KOLOM TEMPEL FORMAT LOG (SINGLE INPUT BOX)        */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-blue-600/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-xs font-black font-mono border border-blue-500/40">
              KOLOM INPUT
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <span>Tempel Format Log CS (1 Kolom Multi-Tanggal)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  Aktif
                </span>
                {justCleared && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold animate-pulse">
                    CACHE BERSIH (ANTI DOUBLE)
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Tempelkan seluruh baris log perubahan Lock/Unlock dari tanggal sebelumnya hingga tanggal terbaru.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Delete / Auto Clear Control Toggle (Persis Seperti Modul Bonus Scatter) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono flex-shrink-0">
              <button
                type="button"
                onClick={() => setAutoClearEnabled(!autoClearEnabled)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  autoClearEnabled 
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Aktifkan/Nonaktifkan Auto Clear Anti-Double Data (Seperti Bonus Scatter)"
              >
                <Timer className={`w-3.5 h-3.5 ${autoClearEnabled ? 'text-yellow-400 animate-spin' : 'text-gray-500'}`} style={{ animationDuration: '6s' }} />
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
                          ? 'bg-yellow-400 text-black font-extrabold'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setRawText(SAMPLE_TWO_DATE_LOG)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Muat contoh format 14 baris (tgl 17 & 18)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Contoh 2 Tanggal</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Bersihkan input teks dan reset hasil"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {/* Textarea Input Mentah dengan Floating Countdown Badge */}
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder={`Tempelkan format log di sini... (Otomatis dibersihkan dalam ${autoClearSeconds} detik agar tidak double data saat menempelkan data baru)\nContoh:\n1\t18-09-2026 01:13:18\tlelaacs2\tChange Lock/Unlock\tLocked (spam form kosong)\tadinda1212\n2\t17-09-2026 20:45:26\tlelaacs3\tChange Lock/Unlock\tLocked (form kosong )\tpadang11\n9\t17-09-2026 12:41:38\tlelaacs5\tChange Lock/Unlock\tUnlocked ()\tagusekuk`}
            className="w-full p-4 rounded-xl bg-[#050811] border border-cyan-500/30 text-xs text-white font-mono leading-relaxed outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all resize-y placeholder:text-gray-600"
          />

          {/* Floating Countdown Badge Persis Seperti Bonus Scatter */}
          {rawText.trim() && autoClearEnabled && countdown > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/85 border border-yellow-400/60 backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in z-10">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <span className="text-[11px] font-mono font-bold text-yellow-300">
                Auto Clear: {countdown}s
              </span>
            </div>
          )}
        </div>

        {/* Live Info Bar di bawah Textarea */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#060a14] border border-white/5 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-400">
              📊 Baris: <strong className="text-white">{activeItemsCount}</strong>
            </span>
            <span className="text-gray-400">
              👤 Member Dianalisis: <strong className="text-cyan-300">{activeResults.length}</strong>
            </span>
            {activeDetectedDates.length > 0 && (
              <span className="text-gray-400 flex items-center gap-1">
                📅 Tanggal Terdeteksi ({activeDetectedDates.length}):
                {activeDetectedDates.map(d => (
                  <span key={d} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    {d}
                  </span>
                ))}
              </span>
            )}
          </div>

          {activeLatestDate && (
            <span className="text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Tanggal Acuan Terbaru: <strong>{activeLatestDate}</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ALERT BANNER KRITIS (JIKA ADA YANG MELEBIHI BATAS)     */}
      {/* ========================================================= */}
      {metrics.overdueCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-[#1e0a13] to-rose-950/70 border-2 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider font-mono">
                🚨 ALERT / REMINDER: {metrics.overdueCount} MEMBER PERLU SEGERA DIBUKA KUNCI!
              </h3>
              <p className="text-xs text-gray-300">
                Akun berikut di-lock dengan kendala form kosong / reguler pada tanggal sebelumnya, dan hingga tanggal terbaru ({activeLatestDate || 'hari ini'}) belum ada status unlocked (melebihi batas 1x24 jam):
              </p>
            </div>
          </div>

          {/* Chips Member yang Overdue */}
          <div className="flex flex-wrap gap-2 pt-1">
            {crosscheckResults.filter(r => r.isOverdue).map(m => (
              <div 
                key={m.userId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-white">{m.userId}</span>
                <span className="text-[10px] text-rose-300 font-normal">({m.kendala} • {m.lockDate})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TABEL DETAIL INFORMASI LENGKAP & FILTER                 */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-blue-600/30 shadow-xl space-y-4">
        {/* Stat Badges Rangkuman Cepat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#060a14] border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 font-mono uppercase block">Total Akun</span>
            <span className="text-lg font-black text-white font-mono">{metrics.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#060a14] border border-rose-500/30 text-center">
            <span className="text-[10px] text-rose-300 font-mono uppercase block">Masih Locked</span>
            <span className="text-lg font-black text-rose-400 font-mono">{metrics.stillLockedCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#060a14] border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-300 font-mono uppercase block">Perlu Segera Dibuka</span>
            <span className="text-lg font-black text-amber-400 font-mono">{metrics.overdueCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#060a14] border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-300 font-mono uppercase block">Sudah Di Buka</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{metrics.unlockedCount}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-t border-b border-white/10 py-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
              Tabel Informasi Detail Status Member
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">
              Rincian tanggal penguncian, batas waktu kedaluwarsa, dan rekomendasi aksi CS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stillLockedMembers.length > 0 && (
              <button
                onClick={handleCopyStillLocked}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  copiedResult
                    ? 'bg-emerald-500 text-black'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                }`}
                title="Salin list username yang masih di locked"
              >
                {copiedResult ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin List Masih Locked</span>
                  </>
                )}
              </button>
            )}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID Member / Kendala..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/30 text-xs text-white font-mono placeholder:text-gray-600 outline-none w-48 focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center p-0.5 rounded-lg bg-[#050811] border border-white/10 text-[11px] font-mono">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Semua ({metrics.total})
              </button>
              <button
                onClick={() => setStatusFilter('OVERDUE')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'OVERDUE' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Segera Buka ({metrics.overdueCount})
              </button>
              <button
                onClick={() => setStatusFilter('LOCKED')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'LOCKED' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Masih Locked ({metrics.stillLockedCount})
              </button>
              <button
                onClick={() => setStatusFilter('UNLOCKED')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'UNLOCKED' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sudah Buka ({metrics.unlockedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#0c1322] text-gray-400 border-b border-white/10 text-[11px]">
                <th className="py-3 px-3.5 font-bold">NO</th>
                <th className="py-3 px-3.5 font-bold">USER ID</th>
                <th className="py-3 px-3.5 font-bold">STATUS</th>
                <th className="py-3 px-3.5 font-bold">KENDALA</th>
                <th className="py-3 px-3.5 font-bold">LOG LOCKED</th>
                <th className="py-3 px-3.5 font-bold">LOG UNLOCKED</th>
                <th className="py-3 px-3.5 font-bold">BATAS WAKTU</th>
                <th className="py-3 px-3.5 font-bold">REKOMENDASI AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#070b14]">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Tidak ada data member yang cocok dengan filter atau input teks masih kosong.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item, idx) => (
                  <tr 
                    key={item.userId}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      item.isOverdue ? 'bg-rose-500/[0.04]' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 text-gray-500 font-bold">{idx + 1}</td>
                    
                    {/* User ID */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        {item.isUnlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : item.isOverdue ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-white tracking-wide">{item.userId}</span>
                      </div>
                    </td>

                    {/* Status Saat Ini */}
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        item.isUnlocked
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : item.isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                            : item.deadlineCategory === 'SELAMANYA'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.isUnlocked ? 'SUDAH DIBUKA' : item.isOverdue ? 'SEGERA DIBUKA' : item.deadlineCategory === 'SELAMANYA' ? 'LOCKED SELAMANYA' : 'MASIH LOCKED'}
                      </span>
                    </td>

                    {/* Kendala */}
                    <td className="py-3 px-3.5 text-gray-200">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 text-[11px] border border-white/10">
                        {item.kendala}
                      </span>
                    </td>

                    {/* Log Locked */}
                    <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">
                      {item.lockDate ? (
                        <div>
                          <span className="text-white font-bold">{item.lockDate}</span>{' '}
                          <span className="text-gray-400">{item.lockTime}</span>
                          {item.lockStaff !== '-' && (
                            <span className="block text-[10px] text-gray-500">Staff: {item.lockStaff}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* Log Unlocked */}
                    <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">
                      {item.unlockDate ? (
                        <div>
                          <span className="text-emerald-300 font-bold">{item.unlockDate}</span>{' '}
                          <span className="text-gray-400">{item.unlockTime}</span>
                          {item.unlockStaff && (
                            <span className="block text-[10px] text-gray-500">Staff: {item.unlockStaff}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-rose-400/70 italic text-[11px]">Belum Dibuka</span>
                      )}
                    </td>

                    {/* Batas Waktu */}
                    <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-gray-400">{item.deadlineLabel}</span>
                    </td>

                    {/* Rekomendasi Aksi */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`text-[11px] font-bold ${
                        item.isUnlocked
                          ? 'text-emerald-400'
                          : item.isOverdue
                            ? 'text-rose-400 animate-pulse'
                            : item.deadlineCategory === 'SELAMANYA'
                              ? 'text-purple-400'
                              : 'text-amber-400'
                      }`}>
                        {item.recommendation}
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
