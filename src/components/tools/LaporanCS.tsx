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
import { CrosscheckLocked } from './CrosscheckLocked';

interface LaporanCSProps {
  initialTab?: 'GANTI_DATA' | 'LOCKED' | 'CROSSCHECK';
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
  ket: string;
  nb: string;
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

// Helper title case
export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\S/g, (char) => char.toUpperCase());
};

export const KNOWN_BANKS_SET = new Set([
  'BCA', 'BNI', 'BRI', 'MANDIRI', 'CIMB', 'DANAMON', 'PERMATA', 'PANIN', 'OCBC',
  'BTN', 'BSI', 'BJB', 'DKI', 'SINARMAS', 'BTPN', 'JENIUS', 'MEGA', 'BUKOPIN',
  'DANA', 'OVO', 'GOPAY', 'LINKAJA', 'SHOPEEPAY', 'SAKUKU', 'QRIS', 'SEABANK',
  'JAGO', 'ALADIN', 'NEOBANK', 'ALLO', 'MAYBANK', 'COMMONWEALTH', 'BCA DIGITAL', 'BLU'
]);

export const formatBankDisplayName = (bank: string): string => {
  if (!bank) return '';
  const b = bank.trim().toUpperCase();
  if (['BCA', 'BNI', 'BRI', 'CIMB', 'BSI', 'BJB', 'DKI', 'BTN', 'BTPN', 'QRIS'].includes(b)) {
    return b;
  }
  // Title case for words: Gopay, Dana, Ovo, Mandiri, Permata, Seabank, etc.
  return toTitleCase(bank.trim());
};

export const formatStaffDisplay = (
  rawAdminStaff?: string,
  manualStaffAlias?: string,
  currentUsername?: string
): string => {
  const admin = (rawAdminStaff || '').trim();
  let formattedAdmin = '';
  if (/^jvsaacs9$/i.test(admin)) {
    formattedAdmin = 'Jvsaacs9';
  } else if (/^keoaacs9$/i.test(admin)) {
    formattedAdmin = 'Keoaacs9';
  } else if (/^lelaacs9$/i.test(admin)) {
    formattedAdmin = 'Lelaacs9';
  } else if (admin) {
    formattedAdmin = admin.charAt(0).toUpperCase() + admin.slice(1);
  }

  // Aliases known to belong to staff Ismail: Jvsaacs9, Keoaacs9, Lelaacs9
  const isIsmailAdmin = /^(jvsaacs9|keoaacs9|lelaacs9)$/i.test(admin);

  let secondary = (manualStaffAlias || '').trim();
  if (!secondary) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('laporan_cs_staff_alias') : null;
    if (saved) secondary = saved;
  }

  if (isIsmailAdmin) {
    // Admin Jvsaacs9, Keoaacs9, Lelaacs9 are specifically used by staff Ismail (user donisko)
    if (!secondary || secondary.toLowerCase() === 'donisko' || secondary.toLowerCase() === 'ismail') {
      secondary = 'Ismail';
    }
  } else {
    // Admin selain Jvsaacs9, Keoaacs9, Lelaacs9 BUKAN admin yang digunakan oleh Ismail.
    // Jika secondary alias bernilai 'Ismail' atau 'donisko', jangan tampilkan Ismail!
    if (secondary.toLowerCase() === 'ismail' || secondary.toLowerCase() === 'donisko') {
      secondary = '';
    }
  }

  if (formattedAdmin) {
    return secondary ? `${formattedAdmin} / ${secondary}` : `${formattedAdmin} /`;
  }
  if (secondary) {
    return `${secondary} /`;
  }
  return '/';
};

/**
 * Menghasilkan alasan catatan NB sesuai perbedaan Data Sebelumnya vs Data Terbarunya
 */
export const getGantiDataNB = (item: {
  oldBank: string;
  newBank: string;
  oldAcc: string;
  newAcc: string;
  oldRek: string;
  newRek: string;
}): string => {
  const cleanOldBank = item.oldBank.trim().toUpperCase();
  const cleanNewBank = item.newBank.trim().toUpperCase();
  const isBankChanged = cleanOldBank !== cleanNewBank;

  const cleanOldRek = item.oldRek.trim();
  const cleanNewRek = item.newRek.trim();
  const isRekChanged = cleanOldRek !== cleanNewRek && cleanOldRek !== '-' && cleanNewRek !== '-';

  const rawOldAcc = item.oldAcc.trim();
  const rawNewAcc = item.newAcc.trim();
  const cleanOldAccNoSpace = rawOldAcc.replace(/\s+/g, '').toUpperCase();
  const cleanNewAccNoSpace = rawNewAcc.replace(/\s+/g, '').toUpperCase();
  const isAccChanged = rawOldAcc.toUpperCase() !== rawNewAcc.toUpperCase() && rawOldAcc !== '-' && rawNewAcc !== '-';
  const isSpacingOnly = isAccChanged && cleanOldAccNoSpace === cleanNewAccNoSpace;

  // Jika jenis bank berbeda (misalnya dana => BRI), selalu set "Pergantian Pada Jenis Bank"
  if (isBankChanged) {
    return 'Pergantian Pada Jenis Bank';
  }
  if (isRekChanged && isAccChanged) {
    return 'Pergantian Pada Nama Dan No Rekening';
  }
  if (isRekChanged) {
    return 'Pergantian Pada No Rekening';
  }
  if (isSpacingOnly) {
    return 'Perbaiki Spasi Pada Nama Rekening';
  }
  if (isAccChanged) {
    return 'Pergantian Pada Nama Rekening';
  }
  return 'Pergantian Data Rekening';
};

export const LaporanCS: React.FC<LaporanCSProps> = ({ initialTab = 'GANTI_DATA', currentUser }) => {
  const [activeTab, setActiveTab] = useState<'GANTI_DATA' | 'LOCKED' | 'CROSSCHECK'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Common Staff Alias manual field - default to saved localStorage or Ismail for donisko
  const [staffAlias, setStaffAlias] = useState(() => {
    const saved = localStorage.getItem('laporan_cs_staff_alias');
    if (saved !== null && saved.trim()) return saved;
    if (currentUser?.username?.toLowerCase() === 'donisko') return 'Ismail';
    return '';
  });

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

  // Auto-fill and save Ismail if donisko user or Ismail aliases appear
  useEffect(() => {
    if (currentUser?.username?.toLowerCase() === 'donisko') {
      if (!staffAlias.trim() || staffAlias.toLowerCase() === 'donisko') {
        setStaffAlias('Ismail');
        localStorage.setItem('laporan_cs_staff_alias', 'Ismail');
      }
    }
  }, [currentUser, staffAlias]);

  useEffect(() => {
    const combined = `${gdRawText} ${lockRawText}`;
    if (/jvsaacs9|keoaacs9|lelaacs9/i.test(combined)) {
      if (!staffAlias.trim() || staffAlias.toLowerCase() === 'donisko') {
        setStaffAlias('Ismail');
        localStorage.setItem('laporan_cs_staff_alias', 'Ismail');
      }
    }
  }, [gdRawText, lockRawText, staffAlias]);

  const handleStaffAliasChange = (newVal: string) => {
    setStaffAlias(newVal);
    localStorage.setItem('laporan_cs_staff_alias', newVal);
  };

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

  // Helper clean format reason
  const cleanReason = (rawReason: string) => {
    const r = rawReason.trim();
    if (!r) return 'Kendala Akun';

    // Priority exact/normalized checks
    if (/form\s*kosong|spam\s*form\s*kosong/i.test(r)) {
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
    if (/ewallet\s*pl\s*limit|e-wallet\s*pl\s*limit/i.test(r)) {
      return 'Ewallet PL Limit';
    }
    if (/akun\s*pl\s*limit/i.test(r)) {
      return 'Akun PL Limit';
    }
    if (/invest\s*2d/i.test(r)) {
      return 'Invest 2D';
    }

    // Word-by-word formatting for acronyms, digits, and usernames
    const words = r.split(/\s+/);
    const formattedWords = words.map(w => {
      const low = w.toLowerCase();
      if (low === 'pl') return 'PL';
      if (low === 'id') return 'ID';
      if (low === 'userid' || low === 'user_id') return 'User ID';
      if (low === 'wd') return 'WD';
      if (low === 'dp') return 'DP';
      if (/^\d+d$/i.test(low)) return low.toUpperCase(); // e.g. 2d -> 2D, 3d -> 3D, 4d -> 4D
      // If word contains alphanumeric mix with digits (e.g. rini2022), preserve as lowercase
      if (/^[a-zA-Z]+[0-9]+$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    return formattedWords.join(' ');
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
      const tabCols = line.split('\t').map(c => c.trim());

      // Staff code extraction (e.g. keoaacs9, jvsaacs2, etc.)
      let staff = '';
      if (tabCols.length >= 3 && /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(tabCols[1])) {
        if (tabCols[2] && tabCols[2].length <= 30 && !/^(change|bank|rek|acc)/i.test(tabCols[2])) {
          staff = tabCols[2];
        }
      }
      if (!staff) {
        const dtStaffMatch = line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{4}\s+(?:\d{2}:\d{2}(?::\d{2})?\s+)?([a-zA-Z0-9_\-\.]+)\s+(?:change|locked|unlocked)/i);
        if (dtStaffMatch) {
          staff = dtStaffMatch[1].trim();
        }
      }
      if (!staff) {
        const staffMatch = line.match(/\b([a-zA-Z0-9]*(?:acs|aks|cs)\d*)\b/i) || line.match(/\b(staff\w*)\b/i);
        if (staffMatch && !/^(bank|acc|rek)$/i.test(staffMatch[1])) {
          staff = staffMatch[1].trim();
        }
      }

      // Find user ID (mendukung user ID full angka maupun alfanumerik)
      let userId = '';
      const explicitUser = line.match(/(?:user\s*id|username|id\s*user|id\s*member|user)\s*[:=]\s*([a-zA-Z0-9_\-\.]+)/i)
        || line.match(/change\s+user\s+info\s+([a-zA-Z0-9_\-\.]+)/i);
      if (explicitUser) {
        userId = explicitUser[1].trim();
      } else if (tabCols.length >= 6 && /^[a-zA-Z0-9_\-\.]+$/.test(tabCols[tabCols.length - 1])) {
        userId = tabCols[tabCols.length - 1];
      } else {
        const tokens = line.split(/\s+|\t/).map(t => t.trim()).filter(Boolean);
        // Cari token kandidat user ID (bisa angka semua misal 88726155 atau huruf, bukan tanggal/jam/keyword)
        const candidate = tokens.find(t => 
          !/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(t) &&
          !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(t) &&
          !/^\d{2}:\d{2}(:\d{2})?$/.test(t) &&
          !/^(bca|bni|bri|mandiri|cimb|danamon|dana|ovo|gopay|linkaja|shopeepay|qris|change|user|info|done|rek|bank|acc)$/i.test(t) &&
          !t.includes('=>') &&
          !t.includes(':') &&
          t !== staff &&
          t.length >= 3
        );
        userId = candidate || tokens[tokens.length - 1] || `user_${index + 1}`;
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

      // Old vs New Acc Name (Account Holder Name) - extract first so we can filter bank matches
      let oldAcc = '-';
      let newAcc = '-';
      const accMatches = Array.from(line.matchAll(/(?:acc|nama|nama_rek|nama\s*rekening|account)\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/gi));
      if (accMatches.length > 0) {
        const changed = accMatches.find(m => m[1].trim().toUpperCase() !== m[2].trim().toUpperCase());
        const selected = changed || accMatches[0];
        oldAcc = selected[1].trim().toUpperCase();
        newAcc = selected[2].trim().toUpperCase();
      } else {
        const singleAcc = line.match(/(?:acc|nama|nama_rek|nama\s*rekening|account)\s*:\s*([^=>,\n\t]+)/i);
        if (singleAcc) {
          oldAcc = singleAcc[1].trim().toUpperCase();
          newAcc = oldAcc;
        }
      }

      if (oldAcc === '-' && newAcc !== '-') oldAcc = newAcc;
      if (newAcc === '-' && oldAcc !== '-') newAcc = oldAcc;

      // Old vs New Bank
      let oldBank = 'GOPAY';
      let newBank = 'GOPAY';
      const rawBankMatches = Array.from(line.matchAll(/(?:bank|jenis\s*bank)\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/gi));
      
      // Filter out matches that are actually account names (e.g. "bank : Dahliasari => Dahlia Sari")
      const bankMatches = rawBankMatches.filter(m => {
        const val1 = m[1].trim().toUpperCase();
        const val2 = m[2].trim().toUpperCase();
        const norm1 = val1.replace(/\s+/g, '');
        const norm2 = val2.replace(/\s+/g, '');
        if (oldAcc !== '-' && (norm1 === oldAcc.replace(/\s+/g, '') || norm2 === oldAcc.replace(/\s+/g, ''))) {
          return false;
        }
        if (newAcc !== '-' && (norm1 === newAcc.replace(/\s+/g, '') || norm2 === newAcc.replace(/\s+/g, ''))) {
          return false;
        }
        return true;
      });

      if (bankMatches.length > 0) {
        const knownChanged = bankMatches.find(m => 
          m[1].trim().toUpperCase() !== m[2].trim().toUpperCase() && 
          KNOWN_BANKS_SET.has(m[1].trim().toUpperCase())
        );
        const knownMatch = bankMatches.find(m => 
          KNOWN_BANKS_SET.has(m[1].trim().toUpperCase()) || 
          KNOWN_BANKS_SET.has(m[2].trim().toUpperCase())
        );
        const changed = bankMatches.find(m => m[1].trim().toUpperCase() !== m[2].trim().toUpperCase());
        const selected = knownChanged || knownMatch || changed || bankMatches[0];
        oldBank = selected[1].trim().toUpperCase();
        newBank = selected[2].trim().toUpperCase();
      } else if (rawBankMatches.length > 0) {
        const first = rawBankMatches.find(m => KNOWN_BANKS_SET.has(m[1].trim().toUpperCase())) || rawBankMatches[0];
        oldBank = first[1].trim().toUpperCase();
        newBank = first[2].trim().toUpperCase();
      } else {
        const singleBank = line.match(/(?:bank|jenis\s*bank)\s*:\s*([^=>,\n\t]+)/i);
        if (singleBank) {
          oldBank = singleBank[1].trim().toUpperCase();
          newBank = oldBank;
        }
      }

      // Old vs New Rek
      let oldRek = '-';
      let newRek = '-';
      const rekMatches = Array.from(line.matchAll(/(?:rek|rekening|no\s*rek|no_rek)\s*:\s*([^=>,\n\t]+)\s*=>\s*([^=>,\n\t]+)/gi));
      if (rekMatches.length > 0) {
        const changed = rekMatches.find(m => m[1].trim() !== m[2].trim());
        const selected = changed || rekMatches[rekMatches.length - 1];
        oldRek = selected[1].trim();
        newRek = selected[2].trim();
      } else {
        const singleRek = line.match(/(?:rek|rekening|no\s*rek|no_rek)\s*:\s*([^=>,\n\t]+)/i);
        if (singleRek) {
          oldRek = singleRek[1].trim();
          newRek = oldRek;
        }
      }

      // Determine Keterangan (Ket) & Change Type
      let ket = 'Pergantian Data Rekening';
      let changeType = 'Ganti No Rekening';
      const cleanOldAcc = oldAcc.replace(/\s+/g, '').toUpperCase();
      const cleanNewAcc = newAcc.replace(/\s+/g, '').toUpperCase();

      if (cleanOldAcc && cleanNewAcc && cleanOldAcc === cleanNewAcc && oldAcc.trim() !== newAcc.trim()) {
        ket = 'Perbaiki Spasi Pada Nama Rekening';
        changeType = 'Perbaiki Spasi Nama';
      } else if (oldBank !== newBank) {
        ket = 'Pergantian Data Rekening';
        changeType = `${oldBank} To ${newBank}`;
      } else if (oldRek !== newRek) {
        ket = 'Pergantian Data Rekening';
        changeType = 'Ganti No Rekening';
      } else if (cleanOldAcc !== cleanNewAcc && cleanOldAcc !== '-' && cleanNewAcc !== '-') {
        ket = 'Pergantian Data Rekening';
        changeType = 'Ganti Nama';
      }

      const calculatedNb = getGantiDataNB({
        oldBank,
        newBank,
        oldRek,
        newRek,
        oldAcc,
        newAcc
      });

      const item: ParsedGantiDataItem = {
        id: `gd-${index}-${Date.now()}`,
        no: index + 1,
        date: date || detectedRawDate || new Date().toISOString().slice(0, 10),
        time,
        staff: staff || (staffAlias ? staffAlias.trim() : ''),
        userId,
        oldBank,
        newBank,
        oldRek,
        newRek,
        oldAcc,
        newAcc,
        changeType,
        ket,
        nb: calculatedNb
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
      const staffDisplay = formatStaffDisplay(item.staff, staffAlias, currentUser?.username);

      const oldBankDisplay = formatBankDisplayName(item.oldBank);
      const newBankDisplay = formatBankDisplayName(item.newBank);
      const finalNb = item.nb || getGantiDataNB(item);

      return `Staff : ${staffDisplay}
Tanggal : ${formattedDate}

User ID : ${item.userId}
Ket : ${item.ket}
Data Sebelumnya : ${oldBankDisplay}, ${item.oldAcc.toUpperCase()}, ${item.oldRek}
Data Terbarunya : ${newBankDisplay}, ${item.newAcc.toUpperCase()}, ${item.newRek}

NB : ${finalNb}`;
    });

    setGdExtractedText(blocks.join('\n\n\n'));
  }, [gdParsedList, staffAlias, currentUser]);

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
      const isLocked = /\b(?:locked|lock)\b/i.test(line) || /status\s*->\s*locked/i.test(line);
      const isUnlocked = /\b(?:unlocked|unlock)\b/i.test(line) || /status\s*->\s*unlocked/i.test(line);
      const action: 'Locked' | 'Unlocked' = isUnlocked && !isLocked ? 'Unlocked' : 'Locked';

      let kendala = 'Kendala Akun';
      let userId = '';

      // Ekstrak kendala/reason dari:
      // 1. update info : -> SPAM FORM KOSONG, Status -> Locked
      // 2. locked (invest 2d)
      // 3. ket / alasan / kendala
      const updateInfoMatch = line.match(/update\s+info\s*:\s*(?:->\s*)?([^,\t\r\n]+?)(?:,?\s*Status\s*->|$)/i);
      const reasonMatch = line.match(/(?:locked|unlocked)\s*\(([^)]*)\)/i);
      const ketMatch = line.match(/(?:ket(?:erangan)?|alasan|kendala)\s*[:=]\s*(?:->\s*)?([^,\t\r\n]+)/i);

      if (updateInfoMatch && updateInfoMatch[1].trim()) {
        kendala = cleanReason(updateInfoMatch[1].trim());
      } else if (reasonMatch && reasonMatch[1].trim()) {
        kendala = cleanReason(reasonMatch[1].trim());
      } else if (ketMatch && ketMatch[1].trim() && !/^(locked|unlocked)$/i.test(ketMatch[1].trim())) {
        kendala = cleanReason(ketMatch[1].trim());
      } else if (isUnlocked) {
        kendala = 'Buka Kunci Akun';
      } else {
        kendala = 'Kendala Akun';
      }

      // Deteksi User ID (termasuk user id angka semua e.g. 12345678, 88726155)
      const explicitUser = line.match(/(?:user\s*id|username|id\s*user|id\s*member|user)\s*[:=]\s*([a-zA-Z0-9_\-\.]+)/i);
      const changeUserMatch = line.match(/change\s+user\s+info\s+([a-zA-Z0-9_\-\.]+)/i);
      const afterActionMatch = line.match(/(?:locked|unlocked)\s*(?:\([^)]*\))?\s+([a-zA-Z0-9_\-\.]+)$/i);
      const beforeActionMatch = line.match(/^([a-zA-Z0-9_\-\.]+)\s+(?:locked|unlocked)/i);
      const tabCols = line.split('\t').map(c => c.trim());

      if (explicitUser) {
        userId = explicitUser[1].trim();
      } else if (changeUserMatch) {
        userId = changeUserMatch[1].trim();
      } else if (tabCols.length >= 5 && /^[a-zA-Z0-9_\-\.]+$/.test(tabCols[tabCols.length - 1])) {
        userId = tabCols[tabCols.length - 1];
      } else if (afterActionMatch) {
        userId = afterActionMatch[1].trim();
      } else if (beforeActionMatch) {
        userId = beforeActionMatch[1].trim();
      } else {
        const tokens = line.split(/\s+|\t/).map(t => t.trim()).filter(Boolean);
        const candidate = tokens.find(t => 
          !/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(t) &&
          !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(t) &&
          !/^\d{2}:\d{2}(:\d{2})?$/.test(t) &&
          !/^(locked|unlocked|jvsaacs\d+|jvsaaks\d+|keoaacs\d+|lelaacs\d+|staff\w+)$/i.test(t) &&
          !t.startsWith('(') &&
          !t.endsWith(')') &&
          !t.includes('=>') &&
          !t.includes(':') &&
          !/^(update|info|status|change|user)$/i.test(t) &&
          t.length >= 3
        );
        userId = candidate || tokens[tokens.length - 1] || `member${index + 1}`;
      }

      // Staff match
      let staff = '';
      if (tabCols.length >= 3 && /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(tabCols[1])) {
        if (tabCols[2] && tabCols[2].length <= 30 && !/^(locked|unlocked|change|update)/i.test(tabCols[2])) {
          staff = tabCols[2];
        }
      }
      if (!staff) {
        const dtStaffMatch = line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{4}\s+(?:\d{2}:\d{2}(?::\d{2})?\s+)?([a-zA-Z0-9_\-\.]+)\s+(?:change|locked|unlocked)/i);
        if (dtStaffMatch) {
          staff = dtStaffMatch[1].trim();
        }
      }
      if (!staff) {
        const staffMatch = line.match(/\b([a-zA-Z0-9]*(?:acs|aks|cs)\d*)\b/i) || line.match(/\b(staff\w*)\b/i);
        if (staffMatch && !/^(locked|unlocked|change|update)$/i.test(staffMatch[1])) {
          staff = staffMatch[1].trim();
        }
      }
      if (!staff && staffAlias) {
        staff = staffAlias.trim();
      }

      const isStaffIsmailAdmin = /^(jvsaacs9|keoaacs9|lelaacs9)$/i.test(staff);
      const calculatedCsName = isStaffIsmailAdmin
        ? 'Ismail'
        : (staffAlias && staffAlias.toLowerCase() !== 'ismail' && staffAlias.toLowerCase() !== 'donisko'
            ? staffAlias.trim()
            : '-');

      const item: ParsedLockedItem = {
        id: `lock-${index}-${Date.now()}`,
        no: index + 1,
        date: date || detectedRawDate || new Date().toISOString().slice(0, 10),
        time,
        staff,
        csName: calculatedCsName,
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

    const lockedOnly = lockParsedList.filter(l => l.action === 'Locked');
    const firstDate = lockedOnly.find(l => l.date)?.date || lockParsedList.find(l => l.date)?.date;
    const reportDate = formatIndonesianDate(firstDate, false); // e.g. "17 September 2026"

    // Deduplicate locked items by userId (case-insensitive)
    // Separate into Invest vs Non-Invest (Regular)
    const regularItems: ParsedLockedItem[] = [];
    const investItems: ParsedLockedItem[] = [];
    const seenRegular = new Set<string>();
    const seenInvest = new Set<string>();

    lockedOnly.forEach(item => {
      const key = item.userId.toLowerCase();
      const isInvest = /invest/i.test(item.kendala);
      if (isInvest) {
        if (!seenInvest.has(key)) {
          seenInvest.add(key);
          investItems.push(item);
        }
      } else {
        if (!seenRegular.has(key)) {
          seenRegular.add(key);
          regularItems.push(item);
        }
      }
    });

    // Group regular items by kendala (preserving the order in which each kendala first appears)
    const kendalaGroups = new Map<string, ParsedLockedItem[]>();
    regularItems.forEach(item => {
      const existing = kendalaGroups.get(item.kendala) || [];
      existing.push(item);
      kendalaGroups.set(item.kendala, existing);
    });

    const sortedRegular: ParsedLockedItem[] = [];
    kendalaGroups.forEach(items => {
      sortedRegular.push(...items);
    });

    // For invest items: sort chronologically (earliest timestamp first)
    const sortedInvest = [...investItems].sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      if (a.time && b.time && a.time !== b.time) {
        return a.time.localeCompare(b.time);
      }
      return b.no - a.no;
    });

    const reports: string[] = [];

    // Helper to get staff display for a set of items
    const getCollectionStaff = (items: ParsedLockedItem[]) => {
      const found = items.find(i => i.staff)?.staff || lockParsedList.find(i => i.staff)?.staff || '';
      return formatStaffDisplay(found, staffAlias, currentUser?.username);
    };

    // 1. Regular Locked Report
    if (sortedRegular.length > 0) {
      const listLines = sortedRegular.map(item => `* ${item.userId} - ${item.kendala}`);
      const staffDisplay = getCollectionStaff(sortedRegular);
      const regBlock = 
`Staff : ${staffDisplay}
Tanggal : ${reportDate}
Ket : Locked Member

User ID :
${listLines.join('\n')}`;
      reports.push(regBlock);
    }

    // 2. Invest Locked Report
    if (sortedInvest.length > 0) {
      const investLines = sortedInvest.map(item => `* ${item.userId} - ${item.kendala}`);
      const staffDisplay = getCollectionStaff(sortedInvest);
      const investBlock = 
`Staff : ${staffDisplay}
Tanggal : ${reportDate}
Ket : Locked Member

User ID :
${investLines.join('\n')}

NB : Untuk Member Invest Diatas Sudah Di Manualkan 2.000`;
      reports.push(investBlock);
    }

    if (reports.length === 0) {
      if (lockParsedList.length > 0) {
        const staffDisplay = getCollectionStaff(lockParsedList);
        setLockExtractedText(
`Staff : ${staffDisplay}
Tanggal : ${reportDate}
Ket : Locked Member

User ID :
* Tidak ada user locked`
        );
      } else {
        setLockExtractedText('');
      }
      return;
    }

    setLockExtractedText(reports.join('\n\n\n'));
  }, [lockParsedList, staffAlias, currentUser]);

  // Update kendala for an individual locked user
  const handleUpdateKendala = (id: string, newKendala: string) => {
    setLockParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, kendala: newKendala } : item
    ));
  };

  // Update ket for an individual ganti data item
  const handleUpdateGdKet = (id: string, newKet: string) => {
    setGdParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, ket: newKet } : item
    ));
  };

  // Update nb for an individual ganti data item
  const handleUpdateGdNb = (id: string, newNb: string) => {
    setGdParsedList(prev => prev.map(item => 
      item.id === id ? { ...item, nb: newNb } : item
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
        `${item.no}\t${formatIndonesianDate(item.date, false)} ${item.time}\t${item.userId}\t${item.staff}\t${formatBankDisplayName(item.oldBank)} - ${item.oldAcc} (${item.oldRek})\t${formatBankDisplayName(item.newBank)} - ${item.newAcc} (${item.newRek})\t${item.ket}`
      ).join('\n');
      const header = 'NO\tTANGGAL & JAM\tUSER ID\tSTAFF\tDATA SEBELUMNYA\tDATA TERBARU\tKETERANGAN\n';
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
            {activeTab === 'GANTI_DATA' 
              ? 'LAPORAN GANTI DATA CS' 
              : activeTab === 'LOCKED' 
                ? 'LAPORAN LOCKED / UNLOCK CS'
                : 'CROSSCHECK ID LOCKED CS'}
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            {activeTab === 'GANTI_DATA' 
              ? 'Ekstraksi log pergantian rekening/identitas member ke format laporan baku CS yang siap dikirim.'
              : activeTab === 'LOCKED'
                ? 'Ekstraksi log penguncian/pembukaan akun member ke format laporan baku CS yang siap dikirim.'
                : 'Pemeriksaan otomatis batas waktu lock (1x24 jam untuk Spam Form Kosong, 2x24 jam untuk kendala lain, dan permanen untuk Invest/Hantu Togel).'}
          </p>
        </div>

        {/* Tab Selector & Staff Alias Input */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Alias Input - Dedicated Field */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#060a14] border border-cyan-500/40 shadow-inner">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Nama / Kode Alias:</span>
                {(staffAlias.trim().toLowerCase() === 'ismail' || currentUser?.username?.toLowerCase() === 'donisko') && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    Staff Ismail
                  </span>
                )}
              </div>
              <input
                type="text"
                value={staffAlias}
                onChange={(e) => handleStaffAliasChange(e.target.value)}
                placeholder="Ismail (Otomatis)"
                className="bg-transparent text-xs text-cyan-300 font-mono font-bold outline-none w-40 border-b border-cyan-500/50 pb-0.5 focus:border-cyan-300 transition-colors placeholder:text-gray-600"
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
            <button
              onClick={() => {
                setActiveTab('CROSSCHECK');
                setCountdown(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'CROSSCHECK'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>CROSSCHECK LOCKED</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'CROSSCHECK' ? (
        <CrosscheckLocked currentUser={currentUser} />
      ) : (
        <>
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

            {/* Quick Test Sample Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">Contoh Cepat:</span>
              {activeTab === 'LOCKED' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '3\t17-09-2026 01:35:46\tjvsaacs9\tchange user info rivaldi123xxxx\tupdate info : -> SPAM FORM KOSONG, Status -> Locked\trivaldi123xxxx';
                      setLockRawText(sample);
                      startIdleTimer('LOCK');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                    title="Contoh User: Jvsaacs9 / Ismail - Spam Form Kosong"
                  >
                    ⚡ Jvsaacs9 (rivaldi123xxxx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '1\t17-09-2026 02:10:15\tkeoaacs9\tchange user info budi88xxxx\tupdate info : -> REK TIDAK VALID, Status -> Locked\tbudi88xxxx';
                      setLockRawText(sample);
                      startIdleTimer('LOCK');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                    title="Contoh User: Keoaacs9 / Ismail - Rek Tidak Valid"
                  >
                    ⚡ Keoaacs9 (budi88xxxx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '2\t17-09-2026 03:15:30\tlelaacs9\tchange user info sandi01xxxx\tupdate info : -> INVEST 2D, Status -> Locked\tsandi01xxxx';
                      setLockRawText(sample);
                      startIdleTimer('LOCK');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                    title="Contoh User: Lelaacs9 / Ismail - Invest 2D"
                  >
                    ⚡ Lelaacs9 (sandi01xxxx)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '2\t12-09-2026 12:14:27\tkeoaacs9\tchange user info lesi678xxxx\tbank : gopay => GOPAY,rek : 08569404728 => 085694047282,bank : gopay => GOPAY,acc : Iwan Setiawan => Iwan Setiawan,rek : 08569404728 => 085694047282,color : #FFFFFF => white\tlesi678xxxx';
                      setGdRawText(sample);
                      startIdleTimer('GD');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Contoh 1: Ganti No Rekening (lesi678xxxx)"
                  >
                    ⚡ Ganti No Rek (lesi678xxxx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '2\t12-09-2026 12:14:27\tkeoaacs9\tchange user info lesi678xxxx\tbank : gopay => GOPAY,rek : 085694047282 => 085694047282,bank : gopay => GOPAY,acc : Iwan S => Iwan Setiawan,rek : 085694047282 => 085694047282,color : #FFFFFF => white\tlesi678xxxx';
                      setGdRawText(sample);
                      startIdleTimer('GD');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                    title="Contoh 2: Ganti Nama Rekening (lesi678xxxx)"
                  >
                    ⚡ Ganti Nama Rek (lesi678xxxx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '1\t17-09-2026 20:38:31\tjvsaacs9\tchange user info cawah09xxxx\tbank : gopay => GOPAY,bank : Dahliasari => Dahlia Sari,bank : gopay => GOPAY,acc : Dahliasari => Dahlia Sari,rek : 089638137501 => 089638137501,color : #FFFFFF => white\tcawah09xxxx';
                      setGdRawText(sample);
                      startIdleTimer('GD');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Contoh 3: Spasi Nama (cawah09xxxx)"
                  >
                    ⚡ Spasi Nama (cawah09xxxx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '4\t12-09-2026 14:10:05\tkeoaacs9\tchange user info budi01xxxx\tbank : dana => BRI,bank : dana => BRI,acc : BUDI SANTOSO => BUDI SANTOSO,rek : 081298765432 => 123401005678504,color : #FFFFFF => white\tbudi01xxxx';
                      setGdRawText(sample);
                      startIdleTimer('GD');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                    title="Contoh 4: Ganti Jenis Bank (Dana => BRI)"
                  >
                    ⚡ Ganti Bank (Dana =&gt; BRI)
                  </button>
                </>
              )}
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
                ? `Tempelkan format log ganti data di sini...\n\nContoh 1 (Perbaiki Spasi Nama):\n1 12-09-2026 20:38:31 keoaacs9 change user info cawah09xxxx bank : gopay => GOPAY,bank : Dahliasari => Dahlia Sari,bank : gopay => GOPAY,acc : Dahliasari => Dahlia Sari,rek : 089638137501 => 089638137501,color : #FFFFFF => white cawah09xxxx\n\nContoh 2 (Ganti No Rekening):\n8 12-09-2026 12:14:27 keoaacs9 change user info lesi678xxxx bank : gopay => GOPAY,rek : 08569404728 => 085694047282,bank : gopay => GOPAY,acc : Iwan Setiawan => Iwan Setiawan,rek : 08569404728 => 085694047282,color : #FFFFFF => white lesi678xxxx`
                : `Tempelkan format log locked / unlocked di sini...\n\nContoh:\n1 12-09-2026 18:37:49 keoaacs7 Change Lock/Unlock Locked (invest 2D) ves992xxxx\n2 12-09-2026 15:36:17 keoaacs2 Change Lock/Unlock Locked (pl memilih userid rini2022xxxx) rini999xxxx`
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

              {/* Copy button at top right header (as in Bonus Mahjong with color feedback) */}
              <button
                type="button"
                onClick={handleCopyReport}
                disabled={!(activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText)}
                className={`px-4 py-1.5 rounded-xl font-mono font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  copiedReport
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse'
                    : (activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText)
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 text-gray-500 border-white/10 opacity-30 cursor-not-allowed'
                }`}
                title="Salin hasil laporan ke clipboard"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3] text-black" />
                    <span>TERCOPY!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>COPY &gt;&gt;</span>
                  </>
                )}
              </button>
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
              disabled={!(activeTab === 'GANTI_DATA' ? gdExtractedText : lockExtractedText)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer flex flex-col items-center justify-center shadow-lg ${
                copiedReport
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {copiedReport ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4" />}
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
                  <th className="py-3 px-3.5 min-w-[220px]">KETERANGAN LAPORAN</th>
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
                      <td className="py-3 px-3.5 text-gray-400">{item.staff ? (item.staff.charAt(0).toUpperCase() + item.staff.slice(1)) : '-'}</td>
                      <td className="py-3 px-3.5">
                        <span className="text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          {formatBankDisplayName(item.oldBank)}, {item.oldAcc}, {item.oldRek}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {formatBankDisplayName(item.newBank)}, {item.newAcc}, {item.newRek}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            value={item.ket}
                            onChange={(e) => handleUpdateGdKet(item.id, e.target.value)}
                            className="w-full bg-[#03060f] border border-cyan-900/50 hover:border-cyan-500/50 focus:border-cyan-400 text-[11px] text-cyan-200 px-2 py-1 rounded outline-none transition-colors"
                            title="Klik untuk mengubah keterangan laporan"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-purple-400 font-bold whitespace-nowrap">NB:</span>
                            <input
                              type="text"
                              value={item.nb}
                              onChange={(e) => handleUpdateGdNb(item.id, e.target.value)}
                              className="w-full bg-[#03060f] border border-purple-900/50 hover:border-purple-500/50 focus:border-purple-400 text-[10px] text-purple-200 px-1.5 py-0.5 rounded outline-none transition-colors"
                              title="Klik untuk mengubah catatan NB"
                            />
                          </div>
                        </div>
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
      </>
      )}
    </div>
  );
};
