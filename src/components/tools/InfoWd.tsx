import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Table, 
  Info, 
  User, 
  Trash2,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  FileCheck2
} from 'lucide-react';
import { UserProfile } from '../../types';

interface InfoWdProps {
  currentUser?: UserProfile | null;
}

export interface ParsedTransactionItem {
  id: string;
  no: number;
  dateTime: string;
  userId: string;
  bank: string;
  nominal: number;
  nominalFormatted: string;
  keterangan: string;
  status?: string;
  rawType: 'WD' | 'DEPO' | 'FLOP';
}

export const KETERANGAN_OPTIONS = [
  'Bantu Cek WD BARU',
  'WD Diatas 500.000',
  'WD Diatas 1.000.000',
  'STATUS PROSES | SALDO TERPOTONG',
  'GG FLOP | Saldo Belum Refund',
  'GG FLOP | Saldo Sudah Refund',
  'GG Akun PL Limit',
  'GG No Rek Tidak Valid',
  'GG Nama Rek Beda',
  'GG Akun Belum Premium',
  'Spam Form Kosong',
  'Salah Nominal Depo',
  'Deposit Two In One'
];

export const InfoWd: React.FC<InfoWdProps> = () => {
  // Filter mode for WD list: whether to only show >= 500k or show all
  const [filterMin500k, setFilterMin500k] = useState<boolean>(true);

  // Raw input text - Clean empty initial state
  const [rawText, setRawText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [parsedList, setParsedList] = useState<ParsedTransactionItem[]>([]);

  // Copy feedback states
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState(false);

  // 5-second Auto-Clear idle timer
  const [autoClearEnabled, setAutoClearEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const idleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const startIdleTimer = () => {
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
      setRawText('');
      setCountdown(null);
    }, 5000);
  };

  // Helper formatting numbers with Indonesian dot separator (e.g. 500.000, 1.500.000)
  const formatRupiahDots = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Get current date/time string formatted DD-MM-YYYY HH:mm:ss
  const getCurrentDateTimeStr = (): string => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${d}-${m}-${y} ${hh}:${mm}:${ss}`;
  };

  // Helper to standardize date strings (e.g. 2026-08-28 05:42:46 or 01-09-2026 02:46:06) to DD-MM-YYYY HH:mm:ss
  const formatDateTimeString = (raw: string): string => {
    if (!raw) return getCurrentDateTimeStr();
    const trimmed = raw.trim();
    // Format YYYY-MM-DD HH:mm:ss or YYYY/MM/DD HH:mm:ss
    const match1 = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}[:.]\d{2}[:.]\d{2})/);
    if (match1) {
      const timeClean = match1[4].replace(/\./g, ':');
      return `${match1[3]}-${match1[2]}-${match1[1]} ${timeClean}`;
    }
    // Format DD-MM-YYYY HH:mm:ss or DD/MM/YYYY HH:mm:ss
    const match2 = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})\s+(\d{2}[:.]\d{2}[:.]\d{2})/);
    if (match2) {
      const timeClean = match2[4].replace(/\./g, ':');
      return `${match2[1]}-${match2[2]}-${match2[3]} ${timeClean}`;
    }
    return trimmed;
  };

  // =========================================================================
  // PARSING ENGINE (Handles Multi-line DP, Multi-line WD, Single-line WD, and Flop)
  // =========================================================================
  useEffect(() => {
    if (!rawText.trim()) {
      // If rawText is cleared (e.g. by auto-clear on copy), preserve existing parsedList unless reset
      return;
    }

    const items: ParsedTransactionItem[] = [];
    const fallbackDateTime = getCurrentDateTimeStr();

    // Detect format type
    const isMultiLineDepo = /Deposit\s+\d{4}-\d{2}-\d{2}/i.test(rawText) 
      || /Deposit\s+\d{2}-\d{2}-\d{4}/i.test(rawText) 
      || /From\s*:\s*.*To\s*:/i.test(rawText) 
      || /(?:^\s*\d+[\s\t]+|^)[a-zA-Z0-9_\-]+\s*\r?\n\s*Deposit/im.test(rawText);

    const isMultiLineWithdraw = !isMultiLineDepo && (
      /(?:^\s*\d+[\s\t]+|^)[a-zA-Z0-9_\-]+\s*\r?\n\s*Withdraw/im.test(rawText) 
      || (/\bWithdraw\s+\d{4}-\d{2}-\d{2}/i.test(rawText) && /\r?\n\s*G\d/i.test(rawText))
    );

    const isFlop = !/Withdraw/i.test(rawText) && !/Deposit/i.test(rawText) && (
      /[a-zA-Z0-9_\-]+\s+[^,\n]+,\s*\d+,\s*[A-Z0-9]+\s+[0-9,.]+/i.test(rawText) || /FLOP/i.test(rawText)
    );

    // -----------------------------------------------------------------------
    // PATTERN A: Multi-line Deposit (DP) Format
    // -----------------------------------------------------------------------
    if (isMultiLineDepo) {
      const chunks = rawText
        .split(/(?=(?:^\s*\d+[\s\t]+|^)[a-zA-Z0-9_\-]+\s*\r?\n\s*Deposit)/im)
        .map(c => c.trim())
        .filter(c => c.length > 0 && /Deposit/i.test(c));

      const effectiveChunks = chunks.length > 0 ? chunks : [rawText];

      effectiveChunks.forEach((chunk, idx) => {
        let userId = 'member_user';
        const userMatch = chunk.match(/(?:^\s*\d+[\s\t]+|^)([a-zA-Z0-9_\-]+)\s*\r?\n\s*Deposit/im) 
          || chunk.match(/^([a-zA-Z0-9_\-]+)\s*\r?\n/m)
          || chunk.match(/([a-zA-Z0-9_\-]+)/i);
        if (userMatch) {
          userId = userMatch[1].trim();
        }

        let dt = fallbackDateTime;
        const dtMatch = chunk.match(/Deposit\s+(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}[:.]\d{2}[:.]\d{2})/i)
          || chunk.match(/Deposit\s+(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}[:.]\d{2}[:.]\d{2})/i)
          || chunk.match(/(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}[:.]\d{2}[:.]\d{2})/)
          || chunk.match(/(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}[:.]\d{2}[:.]\d{2})/);
        if (dtMatch) {
          dt = formatDateTimeString(dtMatch[1]);
        }

        let nominal = 10000;
        const nomMatch = chunk.match(/Deposit[\s\t]+[\d-/:. ]+[\s\t]+([0-9,.]+)/i)
          || chunk.match(/Deposit\s+[\d-]+\s+[\d:]+\s+([0-9,.]+)/i)
          || chunk.match(/([0-9]{1,3}(?:,[0-9]{3})+)/);
        if (nomMatch) {
          nominal = parseInt(nomMatch[1].replace(/[^0-9]/g, ''), 10) || 10000;
        }

        let bank = 'DANA';
        const fromBankMatch = chunk.match(/From\s*:\s*.*?\(([A-Za-z0-9]+)\)/i);
        if (fromBankMatch) {
          bank = fromBankMatch[1].toUpperCase();
        } else {
          const bankMatch = chunk.match(/\b(BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS|XL|TELKOMSEL|TRI|AXIS)\b/i);
          if (bankMatch) {
            bank = bankMatch[1].toUpperCase();
          }
        }

        items.push({
          id: `depo-${idx}-${Date.now()}`,
          no: idx + 1,
          dateTime: dt,
          userId,
          bank,
          nominal,
          nominalFormatted: formatRupiahDots(nominal),
          keterangan: 'Salah Nominal Depo',
          rawType: 'DEPO'
        });
      });
    } 
    // -----------------------------------------------------------------------
    // PATTERN B: Multi-line Withdraw (WD Format 1)
    // -----------------------------------------------------------------------
    else if (isMultiLineWithdraw) {
      const chunks = rawText
        .split(/(?=(?:^\s*\d+[\s\t]+|^)[a-zA-Z0-9_\-]+\s*\r?\n\s*Withdraw)/im)
        .map(c => c.trim())
        .filter(c => c.length > 0 && /Withdraw/i.test(c));

      const effectiveChunks = chunks.length > 0 ? chunks : [rawText];

      effectiveChunks.forEach((chunk, idx) => {
        let userId = 'member_user';
        const userMatch = chunk.match(/(?:^\s*\d+[\s\t]+|^)([a-zA-Z0-9_\-]+)\s*\r?\n\s*Withdraw/im)
          || chunk.match(/^([a-zA-Z0-9_\-]+)\s*\r?\n/m)
          || chunk.match(/([a-zA-Z0-9_\-]+)/i);
        if (userMatch) {
          userId = userMatch[1].trim();
        }

        let dt = fallbackDateTime;
        const dtMatch = chunk.match(/Withdraw\s+(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}[:.]\d{2}[:.]\d{2})/i)
          || chunk.match(/Withdraw\s+(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}[:.]\d{2}[:.]\d{2})/i)
          || chunk.match(/(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}[:.]\d{2}[:.]\d{2})/)
          || chunk.match(/(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}[:.]\d{2}[:.]\d{2})/);
        if (dtMatch) {
          dt = formatDateTimeString(dtMatch[1]);
        }

        let nominal = 0;
        const nomMatch = chunk.match(/Withdraw[\s\t]+[\d-/:. ]+[\s\t]+([0-9,.]+)/i)
          || chunk.match(/Withdraw\s+[\d-]+\s+[\d:]+\s+([0-9,.]+)/i)
          || chunk.match(/-\s*([0-9,.]+)/)
          || chunk.match(/([0-9]{1,3}(?:,[0-9]{3})+)/);
        if (nomMatch) {
          nominal = parseInt(nomMatch[1].replace(/[^0-9]/g, ''), 10) || 0;
        }

        let bank = 'DANA';
        const bankMatch = chunk.match(/\b(BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS)\b/i);
        if (bankMatch) {
          bank = bankMatch[1].toUpperCase();
        }

        let itemKet = 'WD Diatas 500.000';
        if (nominal >= 1000000) {
          itemKet = 'WD Diatas 1.000.000';
        } else if (nominal >= 500000) {
          itemKet = 'WD Diatas 500.000';
        } else {
          itemKet = 'WD Diatas 500.000';
        }

        items.push({
          id: `wd-block-${idx}-${Date.now()}`,
          no: idx + 1,
          dateTime: dt,
          userId,
          bank,
          nominal,
          nominalFormatted: formatRupiahDots(nominal),
          keterangan: itemKet,
          rawType: 'WD'
        });
      });
    }
    // -----------------------------------------------------------------------
    // PATTERN C: Flop Format
    // -----------------------------------------------------------------------
    else if (isFlop) {
      const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const flopEntries: string[] = [];

      rawLines.forEach(line => {
        const hasBankOrUser = /\b(BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS)\b/i.test(line);
        if (hasBankOrUser || flopEntries.length === 0) {
          flopEntries.push(line);
        } else {
          // If line is just numbers/continuation without bank, append to previous entry
          flopEntries[flopEntries.length - 1] += ' ' + line;
        }
      });

      flopEntries.forEach((entry, idx) => {
        const tokens = entry.split(/\s+/);
        const userId = tokens[0] || `user_${idx + 1}`;

        let bank = 'DANA';
        const bankMatch = entry.match(/\b(BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS)\b/i);
        if (bankMatch) {
          bank = bankMatch[1].toUpperCase();
        }

        let nominal = 5000000;
        // 1. First priority: match number right after the bank name (e.g. "DANA 5,000,000" or "DANA 5.000.000")
        const afterBankMatch = entry.match(/\b(?:BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS)\s+([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]+)/i);
        if (afterBankMatch) {
          nominal = parseInt(afterBankMatch[1].replace(/[^0-9]/g, ''), 10) || 5000000;
        } else {
          // 2. Second priority: match formatted currency with thousand separators (e.g. 5,000,000)
          const formattedNums = entry.match(/[0-9]{1,3}(?:,[0-9]{3})+|[0-9]{1,3}(?:\.[0-9]{3})+/g);
          if (formattedNums && formattedNums.length > 0) {
            nominal = parseInt(formattedNums[0].replace(/[^0-9]/g, ''), 10) || 5000000;
          } else {
            // 3. Fallback: match tokens excluding phone numbers (which start with 08 or 62)
            const numbers = entry.split(/[\s,]+/).filter(t => /^[0-9]+$/.test(t) && !t.startsWith('08') && !t.startsWith('62') && t.length < 10);
            if (numbers.length > 0) {
              nominal = parseInt(numbers[numbers.length - 1], 10) || 5000000;
            }
          }
        }

        items.push({
          id: `flop-${idx}-${Date.now()}`,
          no: idx + 1,
          dateTime: fallbackDateTime,
          userId,
          bank,
          nominal,
          nominalFormatted: formatRupiahDots(nominal),
          keterangan: 'GG FLOP | Saldo Belum Refund',
          status: 'Tunggu Saldo Flop Refund Baru Proses Manual',
          rawType: 'FLOP'
        });
      });
    }
    // -----------------------------------------------------------------------
    // PATTERN D: Single-line Tabular Withdraw / Generic Log Lines (WD Format 2)
    // -----------------------------------------------------------------------
    else {
      // Split by numbered log row (e.g. "1 2026-09-01..." or "1\t2026-09-01...") or date timestamp start
      let chunks = rawText
        .split(/(?=^\s*\d+[\s\t]+(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})|^\s*(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\s+\d{2}[:.]\d{2}[:.]\d{2})/im)
        .map(c => c.trim())
        .filter(Boolean);

      if (chunks.length <= 1) {
        // Fallback split by numbered row at start of line
        const altChunks = rawText
          .split(/(?=^\s*\d+[\s\t]+)/m)
          .map(c => c.trim())
          .filter(Boolean);
        if (altChunks.length > 1) {
          chunks = altChunks;
        } else {
          chunks = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        }
      }

      chunks.forEach((chunk, idx) => {
        let dt = fallbackDateTime;
        const dtMatch = chunk.match(/(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}[:.]\d{2}[:.]\d{2})/) 
          || chunk.match(/(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}[:.]\d{2}[:.]\d{2})/);
        if (dtMatch) {
          dt = formatDateTimeString(dtMatch[1]);
        }

        let userId = '';
        const userMatch = chunk.match(/(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\s+\d{2}[:.]\d{2}[:.]\d{2}[\s\t]+([a-zA-Z0-9_\-]+)/i)
          || chunk.match(/[\d-]+\s+[\d:]+\s+([a-zA-Z0-9_\-]+)\s+(?:Withdraw|Deposit|Accept)/i)
          || chunk.match(/\b([a-zA-Z0-9_\-]+)\s+(?:Withdraw|Deposit)\b/i)
          || chunk.match(/(?:^\s*\d+[\s\t]+|^)([a-zA-Z0-9_\-]+)\s+(?:Withdraw|Deposit)/im)
          || chunk.match(/^\s*\d+\s+([a-zA-Z0-9_\-]+)/i);
        if (userMatch) {
          userId = userMatch[1].trim();
        } else {
          const tokens = chunk.split(/\s+|\t/);
          userId = tokens[3] || tokens[2] || tokens[1] || `user_${idx + 1}`;
        }

        // Clean out date timestamps before searching for nominal to avoid matching the '-' in YYYY-MM-DD
        const chunkNoDate = chunk
          .replace(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/g, '')
          .replace(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/g, '');

        let nominal = 0;
        // Priority 1: match withdraw minus column e.g. "- 600,000" or "- 530,000"
        const nomMatchDash = chunkNoDate.match(/(?:^|[\s\t])-\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,10})/);
        if (nomMatchDash) {
          nominal = parseInt(nomMatchDash[1].replace(/[^0-9]/g, ''), 10) || 0;
        } else {
          // Priority 2: match bank followed by nominal e.g. "BCA 530,000" or "GOPAY - 600,000"
          const nomAfterBank = chunkNoDate.match(/\b(?:BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS|XL|TELKOMSEL|TRI|AXIS)[\s\t,-]+(?:-\s*)?([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
          if (nomAfterBank) {
            nominal = parseInt(nomAfterBank[1].replace(/[^0-9]/g, ''), 10) || 0;
          } else {
            // Priority 3: match formatted numbers with thousand separators
            const nomMatch = chunkNoDate.match(/total\s+withdraw\s+([0-9,.]+)/i)
              || chunkNoDate.match(/([0-9]{1,3}(?:,[0-9]{3})+)/)
              || chunkNoDate.match(/([0-9]{1,3}(?:\.[0-9]{3})+)/);
            if (nomMatch) {
              nominal = parseInt(nomMatch[1].replace(/[^0-9]/g, ''), 10) || 0;
            }
          }
        }

        let bank = 'DANA';
        const bankMatch = chunk.match(/\b(BCA|BNI|BRI|MANDIRI|DANAMON|CIMB|PERMATA|BSI|BNC|NEO|JAGO|SEABANK|DANA|OVO|GOPAY|LINKAJA|SHOPEEPAY|QRIS|XL|TELKOMSEL|TRI|AXIS)\b/i);
        if (bankMatch) {
          bank = bankMatch[1].toUpperCase();
        }

        let itemKet = 'WD Diatas 500.000';
        if (/flop/i.test(chunk)) {
          itemKet = 'GG FLOP | Saldo Belum Refund';
        } else if (/deposit/i.test(chunk)) {
          itemKet = 'Salah Nominal Depo';
        } else if (nominal >= 1000000) {
          itemKet = 'WD Diatas 1.000.000';
        } else if (nominal >= 500000) {
          itemKet = 'WD Diatas 500.000';
        } else {
          itemKet = 'WD Diatas 500.000';
        }

        items.push({
          id: `tx-line-${idx}-${Date.now()}`,
          no: idx + 1,
          dateTime: dt,
          userId,
          bank,
          nominal,
          nominalFormatted: formatRupiahDots(nominal),
          keterangan: itemKet,
          status: itemKet.includes('FLOP') ? 'Tunggu Saldo Flop Refund Baru Proses Manual' : undefined,
          rawType: /deposit/i.test(chunk) ? 'DEPO' : 'WD'
        });
      });
    }

    setParsedList(items);
  }, [rawText]);

  // =========================================================================
  // REPORT COMPOSER (Builds the exact output text required)
  // =========================================================================
  useEffect(() => {
    if (parsedList.length === 0) {
      setExtractedText('');
      return;
    }

    // Filter parsed list if in WD mode and filterMin500k is active
    let displayList = parsedList;
    if (filterMin500k) {
      const filtered = parsedList.filter(item => {
        if (item.rawType !== 'WD') return true;
        if (item.keterangan === 'Bantu Cek WD BARU' || item.keterangan.includes('WD BARU')) return true;
        if (item.keterangan.includes('Salah Nominal') || item.keterangan.includes('Spam Form')) return true;
        return item.nominal >= 500000;
      });
      displayList = filtered;
    }

    const blocks: string[] = [];
    const headerGreeting = `Info Ko/ Ci`;

    displayList.forEach((item) => {
      const isFlop = item.rawType === 'FLOP' || item.keterangan.includes('FLOP');

      // Determine the specific NB for this item based on Keterangan
      let itemNb = '';
      const ket = item.keterangan || '';
      if (ket.includes('Salah Nominal') || ket.includes('Deposit Two In One')) {
        itemNb = 'NB : Tolong Bantu Manualkan Ko/ Ci';
      } else if (ket.includes('Spam Form Kosong')) {
        itemNb = 'NB : Tolong Bantu Locked Yaa Ko/ Ci';
      } else if (ket === 'Bantu Cek WD BARU' || ket.includes('WD BARU')) {
        itemNb = 'NB : Tolong Bantu Check Yaa Ko/ Ci';
      } else if (ket.includes('WD Diatas') || (item.nominal >= 500000 && item.rawType === 'WD')) {
        itemNb = 'NB : Tolong Bantu Check Yaa Ko/ Ci';
      } else if (ket.includes('FLOP') || ket.includes('Saldo Belum Refund') || ket.includes('Saldo Sudah Refund')) {
        itemNb = ''; // Flop uses the Status line
      } else if (ket.startsWith('GG ')) {
        itemNb = 'NB : Tolong Bantu Check Yaa Ko/ Ci';
      } else {
        itemNb = 'NB : Tolong Bantu Check Yaa Ko/ Ci';
      }

      let block = '';
      if (item.keterangan === 'GG FLOP | Saldo Sudah Refund') {
        block = 
`${headerGreeting}
Tanggal & Jam : ${item.dateTime}
User ID : ${item.userId}
Nominal : ${item.nominalFormatted}
Bank : ${item.bank}
Keterangan : GG FLOP | Saldo Sudah Refund
Status : ${item.status || 'Done Proses Manual BK / Docs'}`;
      } else if (isFlop) {
        block = 
`${headerGreeting}
Tanggal & Jam : ${item.dateTime}
User ID : ${item.userId}
Nominal : ${item.nominalFormatted}
Bank : ${item.bank}
Keterangan : ${item.keterangan}
Status : ${item.status || 'Tunggu Saldo Flop Refund Baru Proses Manual'}`;
      } else {
        block = 
`${headerGreeting}
Tanggal & Jam : ${item.dateTime}
User ID : ${item.userId}
Bank : ${item.bank}
Nominal : ${item.nominalFormatted}
Ket : ${item.keterangan}`;
        if (item.status) {
          block += `\nStatus : ${item.status}`;
        }
        if (itemNb) {
          block += `\n${itemNb}`;
        }
      }

      blocks.push(block);
    });

    const fullOutput = blocks.join('\n\n');
    setExtractedText(fullOutput);
  }, [parsedList, filterMin500k]);

  // Update Keterangan for a single individual row
  const handleUpdateItemKet = (id: string, newKet: string) => {
    setParsedList(prev => prev.map(item => {
      if (item.id === id) {
        let newStatus = item.status;
        if (newKet === 'GG FLOP | Saldo Sudah Refund') {
          newStatus = 'Done Proses Manual BK / Docs';
        } else if (newKet.includes('FLOP') || newKet.includes('Saldo Belum Refund')) {
          newStatus = 'Tunggu Saldo Flop Refund Baru Proses Manual';
        } else if (item.rawType !== 'FLOP') {
          newStatus = undefined;
        }
        return {
          ...item,
          keterangan: newKet,
          status: newStatus
        };
      }
      return item;
    }));
  };

  // Apply Keterangan to all rows at once
  const handleApplyAllKet = (newKet: string) => {
    setParsedList(prev => prev.map(item => {
      let newStatus = item.status;
      if (newKet === 'GG FLOP | Saldo Sudah Refund') {
        newStatus = 'Done Proses Manual BK / Docs';
      } else if (newKet.includes('FLOP') || newKet.includes('Saldo Belum Refund')) {
        newStatus = 'Tunggu Saldo Flop Refund Baru Proses Manual';
      } else if (item.rawType !== 'FLOP') {
        newStatus = undefined;
      }
      return {
        ...item,
        keterangan: newKet,
        status: newStatus
      };
    }));
  };

  // Bank Color Badge Helper
  const getBankBadgeStyle = (bankName: string) => {
    const b = (bankName || '').toUpperCase();
    if (b.includes('BCA')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (b.includes('BNI')) return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    if (b.includes('BRI')) return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (b.includes('MANDIRI')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (b.includes('DANA')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (b.includes('GOPAY')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (b.includes('OVO')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (b.includes('LINKAJA') || b.includes('TELKOMSEL')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (b.includes('QRIS')) return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
    return 'bg-gray-700/40 text-gray-300 border-gray-600/40';
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
    if (autoClearEnabled) {
      setRawText('');
      setCountdown(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCopyDetail = () => {
    const rows = parsedList.map(item => 
      `${item.no}\t${item.dateTime}\t${item.userId}\t${item.bank}\t${item.nominalFormatted}\t${item.keterangan}\t${item.status || 'Done'}`
    ).join('\n');
    const header = 'NO\tTANGGAL & JAM\tUSER ID\tBANK\tNOMINAL\tKETERANGAN\tSTATUS\n';
    navigator.clipboard.writeText(header + rows);
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2000);
  };

  const handleReset = () => {
    setRawText('');
    setExtractedText('');
    setParsedList([]);
    setCountdown(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
        startIdleTimer();
      }
    } catch {
      // Ignore if permission denied
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* ========================================================= */}
      {/* HEADER BAR                                                */}
      {/* ========================================================= */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a101d] via-[#101b30] to-[#0a101d] border border-cyan-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-bold font-mono border border-cyan-500/30 tracking-wider">
              TOOLS KASIR
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Auto Ekstraksi Laporan DP, WD & Flop
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-sans uppercase tracking-wider">
            INFO DP / WD & LAPORAN TRANSAKSI
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Otomatis menyusun format laporan transaksi WD besar (≥500rb/1jt), Flop saldo refund, dan kendala deposit tanpa nama staff.
          </p>
        </div>

        {/* Manual Config Fields */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filter Toggle for WD >= 500k */}
          <button
            onClick={() => setFilterMin500k(!filterMin500k)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-sm ${
              filterMin500k 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-[#060a14] text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
            }`}
            title="Jika aktif, hanya transaksi WD >= 500.000 yang akan dimasukkan ke laporan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{filterMin500k ? 'Filter WD ≥ 500k: AKTIF' : 'Semua Nominal (Tanpa Filter)'}</span>
          </button>
        </div>
      </div>

      {/* Auto Clear Notification Bar */}
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
      {/* 2-COLUMN MAIN WORKSPACE (INPUT & LIVE EXTRACTION)         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Box 1: Input Data Mentah */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-blue-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-xs font-black font-mono border border-blue-500/40">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    Tempel Format / Data Mentah Kasir
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
                  className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Tempel langsung dari Clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>Paste Clipboard</span>
                </button>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  INPUT KASIR
                </span>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                startIdleTimer();
              }}
              placeholder={`Tempelkan format report WD / DP / Flop di sini...\n\nContoh format yang didukung:\n1  2026-09-01 02:49:18  bujangbangsa  Withdraw  Albert pakpahan, 081363992619, GOPAY  -  600,000  ACCEPT  jvsaaautowd\n2  2026-09-01 02:48:48  sint  Withdraw  Dailafi firdaus, 088293829351, GOPAY  -  100,000  ACCEPT  jvsaaautowd\n3  2026-09-01 02:46:06  marlen2026  Withdraw  Marwan hidayat, 085716294676, DANA  -  50,000  ACCEPT  jvsaaautowd`}
              className="w-full h-72 p-4 rounded-xl bg-[#050811] border border-blue-900/40 text-xs text-gray-200 placeholder-gray-500 font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all resize-none shadow-inner leading-relaxed"
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

        {/* Box 2: Hasil Ekstraksi Otomatis */}
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-purple-600/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-400 text-xs font-black font-mono border border-purple-500/40">
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
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                READY TO COPY
              </span>
            </div>

            <textarea
              readOnly
              value={extractedText}
              placeholder={`Laporan hasil ekstraksi otomatis akan langsung muncul di sini sesuai format standar...`}
              className="w-full h-72 p-4 rounded-xl bg-[#050811] border border-purple-900/40 text-xs text-purple-200 placeholder-gray-500 font-mono outline-none focus:border-purple-500 transition-all resize-none shadow-inner leading-relaxed select-all font-semibold"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCopyReport}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            >
              <div className="flex items-center gap-2 text-sm">
                {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? 'Tersalin ke Clipboard!' : 'COPY LAPORAN TRANSAKSI'}</span>
              </div>
              {autoClearEnabled && (
                <span className="text-[10px] font-normal text-purple-200/80 mt-0.5 font-mono">
                  {copiedReport ? '✓ Data input mentah otomatis dibersihkan' : '• Input mentah otomatis dibersihkan saat tombol ini diklik'}
                </span>
              )}
            </button>

            {/* Transaksi Counter */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#050811] border border-emerald-900/40 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">
                  Jumlah Transaksi Terproses: {parsedList.length} User
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                {filterMin500k ? 'Filter WD ≥ 500k Aktif' : 'Semua Transaksi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOX 3: DETAIL DATA TABLE (EDIT KETERANGAN 1 PER 1)        */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-black font-mono border border-emerald-500/40">
              03
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Tabel Transaksi & Ganti Keterangan Per User ID
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Jika ada kendala yang berbeda dalam 1 laporan, Anda dapat mengganti Keterangan masing-masing baris secara terpisah:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Set All Keterangan Quick Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060a14] border border-white/10">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-gray-300 font-mono">Ubah Semua:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleApplyAllKet(e.target.value);
                }}
                defaultValue=""
                className="bg-[#050811] text-xs text-cyan-300 font-mono outline-none px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer focus:border-cyan-400"
              >
                <option value="" disabled>Pilih Keterangan...</option>
                {KETERANGAN_OPTIONS.map(opt => (
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
              <tr className="border-b border-white/10 text-cyan-400 uppercase text-[11px] bg-[#050811]">
                <th className="py-3 px-3.5">NO</th>
                <th className="py-3 px-3.5">TANGGAL & JAM</th>
                <th className="py-3 px-3.5">USER ID</th>
                <th className="py-3 px-3.5">BANK</th>
                <th className="py-3 px-3.5">NOMINAL</th>
                <th className="py-3 px-3.5 min-w-[280px]">KETERANGAN (BISA DIUBAH 1 PER 1)</th>
                <th className="py-3 px-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#070c18]/50">
              {parsedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                    Belum ada data transaksi. Silakan tempelkan format di Box 01 untuk mengekstrak data otomatis.
                  </td>
                </tr>
              ) : (
                parsedList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3.5 text-gray-400">{item.no}</td>
                    <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap">{item.dateTime}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {item.userId}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBankBadgeStyle(item.bank)}`}>
                        {item.bank}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-emerald-400 font-bold whitespace-nowrap text-sm">
                      Rp {item.nominalFormatted}
                    </td>
                    <td className="py-3 px-3.5">
                      <select
                        value={item.keterangan}
                        onChange={(e) => handleUpdateItemKet(item.id, e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#050811] border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {KETERANGAN_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status 
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
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
