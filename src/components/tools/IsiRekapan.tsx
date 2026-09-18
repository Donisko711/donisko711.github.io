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
  { key: 'JAGO', label: 'BANK JAGO', rx: [/bank\s*jago/i, /\bbankjago/i, /\bbank_jago/i, /\bjago/i, B('jago'), B('bankjago')] },
  { key: 'BCA', label: 'BCA', rx: [/bank\s*central\s*asia/i, /\bbca\b/i, B('bca')] },
  { key: 'BNI', label: 'BNI', rx: [/bank\s*negara\s*indonesia/i, /\bbni\b/i, B('bni')] },
  { key: 'BRI', label: 'BRI', rx: [/\brakyat\s+indonesia\b/i, /\bbrimo\b/i, /\bbri\b/i, B('bri')] },
  { key: 'BSI', label: 'BSI', rx: [/syariah\s*indonesia/i, /\bbsi\b/i, B('bsi')] },
  { key: 'CIMB', label: 'CIMB', rx: [/cimb\s*niaga/i, /\bocto\b/i, /\bcimb\b/i, /\bcwb\b/i, B('octo'), B('cimb'), B('cwb')] },
  { key: 'DANA', label: 'DANA', rx: [/\bdana\b/i, B('dana')] },
  { key: 'DANAMON', label: 'DANAMON', rx: [/\bdanamon\b/i, B('danamon')] },
  { key: 'GOPAY', label: 'GOPAY', rx: [/go-?pay/i, /\bgopay\b/i, B('gopay')] },
  { key: 'LINKAJA', label: 'LINKAJA', rx: [/link\s*aja/i, /\blinkaja\b/i, B('linkaja')] },
  { key: 'MANDIRI', label: 'MANDIRI', rx: [/\blivin\b/i, /\bmandiri\b/i, B('mandiri')] },
  { key: 'MAYBANK', label: 'MAYBANK', rx: [/\bmaybank\b/i, /\bbii\b/i, B('maybank'), B('bii')] },
  { key: 'MEGA', label: 'MEGA', rx: [/\bmega\b/i, B('mega')] },
  { key: 'OCBC', label: 'OCBC', rx: [/ocbc\s*nisp/i, /\bocbc\b/i, /\bnisp\b/i, B('ocbc'), B('nisp')] },
  { key: 'OVO', label: 'OVO', rx: [/\bovo\b/i, B('ovo')] },
  { key: 'PANIN', label: 'PANIN', rx: [/\bpanin\b/i, B('panin')] },
  { key: 'PERMATA', label: 'PERMATA', rx: [/\bpermata\b/i, B('permata')] },
  { key: 'SEABANK', label: 'SEABANK', rx: [/\bsea\s*bank\b/i, /\bseabank\b/i, B('seabank')] },
  { key: 'SINARMAS', label: 'SINARMAS', rx: [/sinar\s*mas/i, /\bsinarmas\b/i, B('sinarmas')] },
  { key: 'ALLO', label: 'ALLOBANK', rx: [/allo\s*bank/i, /\ballobank/i, /\ballo\b/i, B('allobank'), B('allo')] },
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
  // If line has tab columns, check column 2 (index 2) first where bank is typically found
  const cols = line.split('\t');
  if (cols.length >= 3) {
    const segVal = extractBankKeyFromSegment(cols[2]);
    if (segVal) return segVal;
  }
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

export interface Bonus711Record {
  id: string;
  userId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  nominal: string;
  dateTime: string;
  phone?: string;
  email?: string;
  rawText: string;
}

export interface ParsedValidationItem {
  id: string;
  rawText: string;
  bankDetected: string;
  bankKey: string | null;
  isBonus: boolean;
  userId?: string;
  nominal?: string;
  dateTime?: string;
  accountInfo?: string;
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
const SAMPLE_PL_DATA = `2026-08-31 14:10:22\tbca_master\tBCA\t150,000\tuserbca01\tDone
2026-08-31 14:12:05\tbca_vip\tBCA\t500,000\tsultanbca\tDone
2026-08-31 14:15:40\tmandiri_depo\tMANDIRI\t250,000\tpemainslot99\tDone
2026-08-31 14:18:11\tbri_link\tBRI\t100,000\thoki888\tDone
2026-08-31 14:20:00\tdana_express\tDANA\t50,000\tdanajepe\tDone
2026-08-31 14:22:30\tdana_express\tDANA\t100,000\tdanasultan\tDone
2026-08-31 14:25:10\tgopay_instant\tGOPAY\t75,000\tgopaywin\tDone
2026-08-31 14:30:15\tbni_fast\tBNI\t300,000\tbnijackpot\tDone
2026-08-31 14:32:00\tseabank_id\tSEABANK\t200,000\tseahoki\tDone
2026-08-31 14:35:40\tjago_main\tBANK JAGO\t120,000\tjagomax\tDone
2026-08-31 14:38:20\tcimb_niaga\tCIMB\t450,000\tcimbplay\tDone
2026-08-31 14:40:00\tbsi_syariah\tBSI\t150,000\tbsiberkah\tDone
2026-08-31 14:45:00\tbonus_harian\tBONUS711\t25,000\tklaimbonus1\tKlaim Bonus
2026-08-31 14:48:00\tbonus_scatter\tBONUS711\t50,000\tklaimbonus2\tBonus Scatter`;

const SAMPLE_PL_USER_DATA = `1\taditama00
No Name\t-\tBANKJAGO,YOKI RAHAYU,100983460905\t300\t17-09-2026 20:09:19\t087****9564\tyok****i@gmail.com\t
2\tagoes
No Name\ttotocash\tDANA,AGUS SOFYAN,081324493022\t6,000\t17-09-2026 20:01:49\t081****93022\tdot****aja@gmail.com\t
3\takua1234Locked
No Name\t-\tDANA,BABA,082151423836\t155,307\t17-09-2026 18:48:01\t082****23836\tani****fad@gmail.com\t
4\tamstronggg
No Name\t-\tGOPAY,DAFFA MAULANA,085787819464\t0\t17-09-2026 06:44:31\t081****61465\tdrm****01@gmail.com\t
5\tantifa
No Name\t-\tSEABANK,SULIYAMI,901722512432\t44\t17-09-2026 10:46:06\t085****32458\tant****gmail.com\t
6\tbahagia28
No Name\t-\tDANA,EDWARD CLI VANA,083146507321\t300\t17-09-2026 21:50:53\t083****07321\tdka****@gmail.com\t
7\tbeat444
No Name\t-\tDANA,RIFAI,085870926104\t120\t17-09-2026 14:41:14\t085****64291\tkay****s@gmail.com\t
8\tdenida79
No Name\t-\tBRI,DENNY PARLINDUNGAN,140901008045500\t300\t17-09-2026 11:35:23\t081****00175\tden****njaitan79@gmail.com\t
9\tfebri002
No Name\t-\tBCA,MUH AKBAR,8735663956\t376\t17-09-2026 05:16:05\t085****27889\tfeb****syah@gmail.com\t
10\thantutam88
No Name\t-\tDANA,REMAN,085285023776\t0\t17-09-2026 06:42:27\t082****93534\txpi****ue99999@gmail.com\t
11\therlino888
No Name\t-\tBCA,HERLINA,0002514753\t0\t17-09-2026 14:54:10\t089****84599\ther****mail.com\t
12\timasjpin
No Name\t-\tSEABANK,ADE IMAS,901032099873\t0\t17-09-2026 01:17:18\t081****40051\tade****0413@gmail.com\t
13\tinpess23Locked
No Name\t-\tOVO,RAGIL FAAUZAN,08987468864\t2,000\t17-09-2026 14:03:39\t089****8864\tinp****3@gmail.com\t
14\tjepekan1000
No Name\t-\tDANA,ESA ROBER HOKKI,082179073562\t200\t17-09-2026 01:47:33\t082****59352\trob****okki@gmail.com\t
15\tjokojr
No Name\t-\tDANA,JOKO SUPRIANTI,083142801941\t60\t17-09-2026 22:15:01\t082****53032\tjan****abe970@gmail.com\t
16\tkacung777
No Name\t-\tSEABANK,MOCH WILDAN TAUFIQI ROHMAN,901114910812\t310\t17-09-2026 11:03:32\t082****11176\twil****aufiqi9@gmail.com\t
17\tkasurjepe
No Name\t-\tGOPAY,RAYA RAMBU RABANI,085759804190\t27\t17-09-2026 01:28:31\t085****05621\tgaw****ung2@gmail.com\t
18\tlaksana4d
No Name\t-\tMANDIRI,UMARSUPRIADI,1660004707154\t0\t17-09-2026 19:37:16\t085****86021\tjay****aksena1@gmail.com\t
19\tlegok99
No Name\t-\tBRI,WARHADI,426801013583500\t494\t17-09-2026 15:39:08\t081****50668\tdid****063@gmail.com\t
20\tmrag47
No Name\t-\tDANA,MUH ARIL,081337245117\t71\t17-09-2026 00:10:28\t082****05153\tgad****a36@gmail.com\t
21\tnanangnicut
No Name\t-\tDANA,NANANG,085591299714\t60\t17-09-2026 00:49:35\t085****99714\tnan****icut@gmail.com\t
22\toby98
No Name\t-\tSEABANK,HABIBI,901532475827\t260\t17-09-2026 16:06:30\t082****73113\tlgh****i01@gmail.com\t
23\topay76
No Name\t-\tGOPAY,DIDIN MUHIDIN,081323530897\t240\t17-09-2026 22:24:11\t081****30897\tova****9@gmail.coam\t
24\tpelet
No Name\t-\tDANA,AHMAD FIRMANSA,089677107453\t40\t17-09-2026 10:46:15\t085****59645\tdon****m561@gmail.com\t
25\tpppprr
No Name\t-\tDANA,ANANDA ALFARIZI,083807587060\t160\t17-09-2026 23:15:02\t083****87060\taje****al7@gmail.com\t
26\tprihatin
No Name\t-\tDANA,SAREWO,083892854971\t0\t17-09-2026 15:41:32\t083****54971\tajm****gimael.com\t
27\tputra89
No Name\t-\tDANA,MASDI,089668998082\t20\t17-09-2026 14:24:35\t087****03328\tput****mail.com\t
28\tramijo1
No Name\t-\tDANA,SENENG,085726471566\t252\t17-09-2026 16:57:37\t085****71566\tgob****idul353@gmail.com\t
29\trazak7
No Name\tbonus711\tSEABANK,ABDUL RAZAK,901359722102\t0\t17-09-2026 22:10:26\t082****54544\traz****mail.com\t
30\trecehan
No Name\t-\tBANKJAGO,ARIS SESWANTO,102907490647\t0\t17-09-2026 17:19:51\t085****96141\twis****ngmumet@gmail.com\t
31\tsakitt
No Name\t-\tDANA,GINANSYAH,085159344066\t662\t17-09-2026 20:28:57\t085****44066\tgin****ah00@gmail.com\t
32\tsalsaalya
No Name\t-\tSEABANK,HIKMAH,901209914117\t161\t17-09-2026 17:46:20\t089****64929\thkm****208@gmail.com\t
33\tsaupung
No Name\t-\tSEABANK,NADISETIADI,901385194636\t60\t17-09-2026 22:05:39\t082****11235\tbar****86@gmail.com\t
34\tsiayiii
No Name\t-\tDANA,AYI NASRULLOH,083836673096\t0\t17-09-2026 22:06:48\t085****73645\tsib****s25@gmail.com\t
35\tsomed
No Name\t-\tDANA,FAJRI JAELANI,085722686514\t0\t17-09-2026 20:15:36\t084****040\thsh****@aol.com\t
36\twangacor99
No Name\t-\tBRI,RIDWAN,726401007372534\t206\t17-09-2026 20:45:14\t089****50208\trid****bdullah39@gmail.com\t
37\twilen17a
No Name\t-\tDANA,WILEN HAVUS CANDRA WIRATNA,085706060113\t290\t17-09-2026 13:48:58\t085****60113\twil****fiscandra@gmail.com\t
38\twilen17b
No Name\t-\tGOPAY,WILEN HAVIS CANDRA WIRATNA,085604212490\t340\t17-09-2026 17:13:19\t085****12490\twil****viss@gmail.com\t
39\twings11
No Name\t-\tDANA,ERNA SETIAWATI,083115578500\t320\t17-09-2026 23:22:11\t081****23886\twin****@gmail.com\t
40\twinwin999
No Name\t-\tDANA,RIKI GUNAWAN,0895329887119\t122\t17-09-2026 12:25:21\t085****06969\trik****nawan09@gmail.com\t
41\tyanbca123
No Name\t-\tBCA,APRIAN DWI HANTORO,2782480317\t140\t17-09-2026 09:34:00\t081****94183\tyan****23@gmail.com`;

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
  const [copiedBonusTsv, setCopiedBonusTsv] = useState(false);
  const [copiedBonusUsers, setCopiedBonusUsers] = useState(false);
  const [copiedBonusChat, setCopiedBonusChat] = useState(false);
  const [autoClearPl, setAutoClearPl] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tab 1: Parsing Engine with intelligent Bank Detection & Bonus711 Pairing
  const parsedPlResult = useMemo(() => {
    const emptyCounts: Record<string, number> = {};
    VALIDATION_BANKS_CONFIG.forEach(b => {
      emptyCounts[b.key] = 0;
      emptyCounts[b.label] = 0;
    });

    if (!plInputText.trim()) {
      return {
        totalLines: 0,
        detectedCount: 0,
        unrecognizedCount: 0,
        countsByBank: emptyCounts,
        totalBankCount: 0,
        bonus711Count: 0,
        bonus711Records: [] as Bonus711Record[],
        bonus711Lines: [] as string[],
        unknownLines: [] as string[],
        items: [] as ParsedValidationItem[]
      };
    }

    const rawLines = plInputText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    const counts: Record<string, number> = {};
    VALIDATION_BANKS_CONFIG.forEach(b => {
      counts[b.key] = 0;
      counts[b.label] = 0;
    });

    const unknown: string[] = [];
    const items: ParsedValidationItem[] = [];
    const bonusRecords: Bonus711Record[] = [];
    const bonusLines: string[] = [];

    let pendingUser = '';
    let itemIdx = 0;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Check if this line is a username header row like "1\taditama00" or "3\takua1234Locked"
      // Characteristics: starts with number, doesn't contain commas or '@' or 'No Name'
      const userMatch = line.match(/^(\d+)[\t\s]+([a-zA-Z0-9_\-\.]+)/);
      const hasBankOrAccount = line.includes(',') || /(@|no name|\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})/i.test(line);

      if (userMatch && !hasBankOrAccount) {
        pendingUser = userMatch[2].replace(/locked$/i, '').trim();
        continue;
      }

      // Check for bank and bonus
      const k = detectBankKeyFromLine(line);
      const isBonus = /bonus\s*711/i.test(line);

      // Resolve user ID
      let lineUserId = pendingUser;
      const cols = line.split('\t').map(s => s.trim());
      if (!lineUserId && cols.length >= 5) {
        const possibleUser = cols.find((c, idx) => idx >= 1 && /^[a-zA-Z0-9_\-]{3,20}$/.test(c) && !/bca|bri|bni|mandiri|dana|gopay|done|ok|pending|bonus/i.test(c));
        if (possibleUser) lineUserId = possibleUser;
      }

      // Extract details
      const dateMatch = line.match(/\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
      const dateTime = dateMatch ? dateMatch[0] : '';

      let bankName = k ? (VALIDATION_BANKS_CONFIG.find(b => b.key === k)?.label || k) : '';
      let accountHolder = '';
      let accountNumber = '';
      let nominal = '';
      let phone = '';
      let email = '';

      const accToken = cols.find(c => c.includes(','));
      if (accToken) {
        const parts = accToken.split(',').map(s => s.trim());
        if (!bankName && parts[0]) bankName = parts[0];
        accountHolder = parts[1] || '';
        accountNumber = parts[2] || '';
      }

      const nominalMatch = line.match(/(?:^|\t)([\d,]+(?:\.\d+)?)(?:\t\d{2}-\d{2}|\t\d{4}-\d{2})/);
      if (nominalMatch) {
        nominal = nominalMatch[1];
      }

      const emailMatch = line.match(/[a-zA-Z0-9._%+*-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) email = emailMatch[0];

      const phoneMatch = line.match(/08[\d*]{8,13}/);
      if (phoneMatch) phone = phoneMatch[0];

      if (k) {
        counts[k] = (counts[k] || 0) + 1;
        const cfg = VALIDATION_BANKS_CONFIG.find(b => b.key === k);
        if (cfg) {
          counts[cfg.label] = counts[k];
        }
      } else if (!isBonus) {
        unknown.push(line);
      }

      if (isBonus) {
        bonusLines.push(line);
        bonusRecords.push({
          id: `bonus-rec-${bonusRecords.length + 1}`,
          userId: lineUserId || 'Unknown User',
          bankName: bankName || 'SEABANK',
          accountHolder,
          accountNumber,
          nominal: nominal || '0',
          dateTime,
          phone,
          email,
          rawText: line
        });
      }

      items.push({
        id: `pl-item-${itemIdx++}`,
        rawText: line,
        bankDetected: bankName || (isBonus ? 'BONUS711' : 'TIDAK DIKENALI'),
        bankKey: k,
        isBonus,
        userId: lineUserId || undefined,
        nominal: nominal || undefined,
        dateTime: dateTime || undefined,
        accountInfo: accToken || undefined
      });

      pendingUser = '';
    }

    let detected = 0;
    VALIDATION_BANKS_CONFIG.forEach(b => {
      detected += (counts[b.key] || 0);
    });

    return {
      totalLines: rawLines.length,
      detectedCount: detected,
      unrecognizedCount: unknown.length,
      countsByBank: counts,
      totalBankCount: detected,
      bonus711Count: bonusRecords.length,
      bonus711Records: bonusRecords,
      bonus711Lines: bonusLines,
      unknownLines: unknown,
      items
    };
  }, [plInputText]);

  // Tab 1 Copy Helpers
  // Sesuai SOP: TOTAL dan BONUS711 TIDAK IKUT saat copy baris/semua kolom (hanya 20 bank)
  const handleCopyCountsRow = () => {
    const keys = VALIDATION_BANKS_CONFIG.map(b => b.key);
    const values = keys.map(k => String(parsedPlResult.countsByBank[k] || 0));
    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedCountsRow(true);

    if (autoClearPl) {
      setPlInputText('');
    }
    setTimeout(() => setCopiedCountsRow(false), 2500);
  };

  const handleCopyAllColumns = () => {
    const headers = VALIDATION_BANKS_CONFIG.map(b => b.label);
    const keys = VALIDATION_BANKS_CONFIG.map(b => b.key);
    const values = keys.map(k => String(parsedPlResult.countsByBank[k] || 0));

    const fullTsv = `${headers.join('\t')}\n${values.join('\t')}`;
    navigator.clipboard.writeText(fullTsv);
    setCopiedAllColumns(true);
    setTimeout(() => setCopiedAllColumns(false), 2500);
  };

  // Salin Rincian Data Bonus711 (Tabel TSV dengan Header)
  const handleCopyBonusTsv = () => {
    if (!parsedPlResult.bonus711Records.length) return;
    const header = ['No', 'User ID', 'Bank', 'Nama Pemilik', 'No Rekening', 'Nominal', 'Tanggal/Waktu'].join('\t');
    const rows = parsedPlResult.bonus711Records.map((r, idx) => 
      [idx + 1, r.userId, r.bankName, r.accountHolder, r.accountNumber, r.nominal, r.dateTime].join('\t')
    );
    const tsv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedBonusTsv(true);
    setTimeout(() => setCopiedBonusTsv(false), 2500);
  };

  // Salin User ID Bonus Saja (List User ID siap pakai)
  const handleCopyBonusUsers = () => {
    if (!parsedPlResult.bonus711Records.length) return;
    const users = parsedPlResult.bonus711Records.map(r => r.userId).filter(Boolean);
    navigator.clipboard.writeText(users.join('\n'));
    setCopiedBonusUsers(true);
    setTimeout(() => setCopiedBonusUsers(false), 2500);
  };

  // Salin Format Chat CS untuk Bonus711
  const handleCopyBonusChat = () => {
    if (!parsedPlResult.bonus711Records.length) return;
    const lines = parsedPlResult.bonus711Records.map((r, idx) => 
      `${idx + 1}. User: ${r.userId} | ${r.bankName} (${r.accountHolder || '-'} / ${r.accountNumber || '-'}) | Nominal: ${r.nominal || '0'} | ${r.dateTime || '-'}`
    ).join('\n');
    const text = `🚨 LAPORAN KLAIM BONUS711 (${parsedPlResult.bonus711Records.length} Transaksi):\n${lines}`;
    navigator.clipboard.writeText(text);
    setCopiedBonusChat(true);
    setTimeout(() => setCopiedBonusChat(false), 2500);
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

  // Sample Demo Preset for instant test matching user real data
  const handleLoadSampleKoin = () => {
    setUploadedFileName('sample_history_koin_711_terakhir.csv');
    // Set realistic preset matching exact final summary numbers
    // 459,643,335 | 63,623,110 | 433,656,000 | 319,000,000 | 319,000,000 | 204,266,445 | 114,656,000 | 89,610,445 | 1,353 | 584 | 288 | 700 | 2,925 | 20 | 334 | 354
    const demoData: any[] = [
      { Info: 'Deposit', BY: 'jvsaapga2', Coin: 58400000, _presetMeta: { formDpGaruda: 584 } },
      { Info: 'Deposit', BY: 'jvsaaminepay', Coin: 28800000, _presetMeta: { formDpQrisMinera: 288 } },
      { Info: 'Deposit (PGA)', BY: 'PGA', Coin: 63623110, _presetMeta: { formDpQris: 700 } },
      { Info: 'Deposit', BY: 'jvsaacb1', Coin: 53443335, _presetMeta: { formDp: 1353 } },
      { Info: 'Deposit', BY: 'jvsaavita', Coin: 319000000, TO: 'horas5' }, // DP PGA SPV (319M)
      { Info: 'Withdraw(PGA-IDF)', BY: 'eaqjvsaavita', Coin: -203000000, TO: 'horas5' }, // WD PGA SPV part 1 (203M)
      { Info: 'Withdraw', BY: 'jvsaaspv4', Coin: -116000000, TO: 'horas17' }, // WD PGA SPV part 2 (116M) -> Total 319M
      { Info: 'Withdraw', BY: 'jvsaaks2', Coin: -14656000, _presetMeta: { formWd: 20 } },
      { Info: 'Withdraw', BY: 'jvsaaautowd', Coin: -100000000, _presetMeta: { formAutoWd: 334 } },
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

  // 16 Column Calculations matching Master Format Exactly
  const rekapKoinStats = useMemo(() => {
    const res = {
      deposit: 0,
      qris: 0,
      withdraw: 0,
      dpPgaSpv: 0,
      wdPgaSpv: 0,
      realDeposit: 0,
      realWithdraw: 0,
      hasil: 0,
      formDp: 0,
      formDpGaruda: 0,
      formDpQrisMinera: 0,
      formDpQris: 0,
      totalFormDp: 0,
      formWd: 0,
      formAutoWd: 0,
      totalFormWd: 0
    };

    if (rawKoinRows.length === 0) {
      return res;
    }

    // Check if preset metadata exists (e.g. from preset loader)
    const hasPresetMeta = rawKoinRows.some(r => r._presetMeta);
    if (hasPresetMeta) {
      let depSum = 0;
      let qrisSum = 0;
      let wdSum = 0;
      let dpSpvSum = 0;
      let wdSpvSum = 0;
      let fDp = 0;
      let fDpGaruda = 0;
      let fDpQrisMinera = 0;
      let fDpQris = 0;
      let fWd = 0;
      let fAutoWd = 0;

      for (const row of rawKoinRows) {
        const info = normalizeTextKoin(getRowValue(row, ['Info']));
        const to = normalizeTextKoin(getRowValue(row, ['TO', 'To']));
        const coin = parseCoinValue(getRowValue(row, ['Coin']));
        const meta = row._presetMeta || {};

        if (meta.formDpGaruda) fDpGaruda += meta.formDpGaruda;
        if (meta.formDpQrisMinera) fDpQrisMinera += meta.formDpQrisMinera;
        if (meta.formDpQris) fDpQris += meta.formDpQris;
        if (meta.formDp) fDp += meta.formDp;
        if (meta.formWd) fWd += meta.formWd;
        if (meta.formAutoWd) fAutoWd += meta.formAutoWd;

        const isPgaSpv = to.includes('horas') || to.startsWith('spv');

        if (info === 'deposit') {
          depSum += coin;
          if (isPgaSpv) {
            dpSpvSum += coin;
          }
        } else if (info === 'deposit (pga)' || (info.includes('deposit') && info.includes('pga'))) {
          qrisSum += coin;
        } else if (info.includes('withdraw')) {
          wdSum += Math.abs(coin);
          if (isPgaSpv || info.includes('pga-idf')) {
            wdSpvSum += Math.abs(coin);
          }
        }
      }

      res.deposit = depSum;
      res.qris = qrisSum;
      res.withdraw = wdSum;
      res.dpPgaSpv = dpSpvSum;
      res.wdPgaSpv = wdSpvSum;
      res.realDeposit = res.deposit + res.qris - res.dpPgaSpv;
      res.realWithdraw = res.withdraw - res.wdPgaSpv;
      res.hasil = res.realDeposit - res.realWithdraw;
      res.formDp = fDp;
      res.formDpGaruda = fDpGaruda;
      res.formDpQrisMinera = fDpQrisMinera;
      res.formDpQris = fDpQris;
      res.totalFormDp = res.formDp + res.formDpGaruda + res.formDpQrisMinera + res.formDpQris;
      res.formWd = fWd;
      res.formAutoWd = fAutoWd;
      res.totalFormWd = res.formWd + res.formAutoWd;
      return res;
    }

    for (const row of rawKoinRows) {
      const info = normalizeTextKoin(getRowValue(row, ['Info']));
      const by = normalizeTextKoin(getRowValue(row, ['BY', 'By']));
      const to = normalizeTextKoin(getRowValue(row, ['TO', 'To']));
      const coin = parseCoinValue(getRowValue(row, ['Coin']));

      // Ignore reject transactions & internal agent transactions
      const isReject = info.includes('reject');
      const isAgent = info.includes('agent');
      if (isReject || isAgent) {
        continue;
      }

      const isDeposit = info === 'deposit';
      const isDepositPga = info === 'deposit (pga)' || (info.includes('deposit') && info.includes('pga'));
      const isWithdraw = info === 'withdraw';
      const isWithdrawPgaIdf =
        info === 'withdraw(pga-idf)' ||
        info === 'withdraw (pga-idf)' ||
        (info.includes('withdraw') && info.includes('pga'));

      // SPV (PGA SPV) accounts are targeted with account username starting with or containing "horas"
      // e.g. horas5, horas17, horas11, horasduabela, horastigabel, etc.
      // Note: We MUST check "to", NOT "by", because "by" contains admin names like jvsaaspv1, jvsaaspv4
      // who process normal member transactions!
      const isPgaSpv = to.includes('horas') || to.startsWith('spv');

      if (isDeposit) {
        res.deposit += coin;

        if (isPgaSpv) {
          res.dpPgaSpv += coin;
        } else {
          // Normal member deposit categorization
          if (by.includes('pga2')) {
            res.formDpGaruda += 1;
          } else if (by.includes('minepay') || by.includes('minera')) {
            res.formDpQrisMinera += 1;
          } else {
            res.formDp += 1;
          }
        }
      }

      if (isDepositPga) {
        res.qris += coin;
        res.formDpQris += 1;
      }

      if (isWithdraw || isWithdrawPgaIdf) {
        res.withdraw += Math.abs(coin);

        if (isPgaSpv || isWithdrawPgaIdf) {
          res.wdPgaSpv += Math.abs(coin);
        } else {
          // Normal member withdraw categorization
          if (by.includes('autowd')) {
            res.formAutoWd += 1;
          } else {
            res.formWd += 1;
          }
        }
      }
    }

    // Formulas:
    // Real Deposit = Deposit + Total QRIS IDN - DP PGA SPV
    res.realDeposit = res.deposit + res.qris - res.dpPgaSpv;
    // Real Withdraw = Withdraw - WD PGA SPV
    res.realWithdraw = res.withdraw - res.wdPgaSpv;
    // Hasil = Real Deposit - Real Withdraw
    res.hasil = res.realDeposit - res.realWithdraw;
    // Total Form DP = Form DP + Form DP garuda + Form DP QRIS MINERA + Form DP QRIS
    res.totalFormDp =
      res.formDp +
      res.formDpGaruda +
      res.formDpQrisMinera +
      res.formDpQris;
    // TOTAL Form WD = Form WD + Form auto WD
    res.totalFormWd = res.formWd + res.formAutoWd;

    return res;
  }, [rawKoinRows]);

  // Transformed preview rows
  const previewKoinRows = useMemo(() => {
    return rawKoinRows.map((row, idx) => {
      const info = normalizeTextKoin(getRowValue(row, ['Info']));
      const by = normalizeTextKoin(getRowValue(row, ['BY', 'By']));
      const to = normalizeTextKoin(getRowValue(row, ['TO', 'To']));
      const coin = parseCoinValue(getRowValue(row, ['Coin']));

      let type: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
      let subType: 'REGULAR' | 'QRIS' | 'PGA_SPV' | 'GARUDA' | 'QRIS_MINERA' | 'AUTO_WD' = 'REGULAR';

      if (info === 'deposit (pga)' || (info.includes('deposit') && info.includes('pga'))) {
        type = 'DEPOSIT';
        subType = 'QRIS';
      } else if (info === 'deposit') {
        type = 'DEPOSIT';
        if (to.includes('horas') || to.startsWith('spv')) subType = 'PGA_SPV';
        else if (by.includes('pga2')) subType = 'GARUDA';
        else if (by.includes('minepay') || by.includes('minera')) subType = 'QRIS_MINERA';
        else subType = 'REGULAR';
      } else if (info.includes('withdraw')) {
        type = 'WITHDRAW';
        if (to.includes('horas') || to.startsWith('spv') || info.includes('pga-idf')) subType = 'PGA_SPV';
        else if (by.includes('autowd')) subType = 'AUTO_WD';
        else subType = 'REGULAR';
      }

      return {
        id: `koin-row-${idx}`,
        info: String(getRowValue(row, ['Info']) || info),
        by: String(getRowValue(row, ['BY', 'By']) || by),
        coin: Math.abs(coin),
        type,
        subType: subType as 'REGULAR' | 'QRIS' | 'PGA_SPV' | 'GARUDA' | 'QRIS_MINERA' | 'AUTO_WD'
      };
    });
  }, [rawKoinRows]);

  // Copy 16 TSV Values for Excel/Google Sheets matching format requested by user:
  // 459,643,335	63,623,110	433,656,000	319,000,000	319,000,000	204,266,445	114,656,000	89,610,445	1,353	584	288	700	2,925	20	334	354
  const handleCopyKoinOnly = () => {
    const order = [
      'deposit',
      'qris',
      'withdraw',
      'dpPgaSpv',
      'wdPgaSpv',
      'realDeposit',
      'realWithdraw',
      'hasil',
      'formDp',
      'formDpGaruda',
      'formDpQrisMinera',
      'formDpQris',
      'totalFormDp',
      'formWd',
      'formAutoWd',
      'totalFormWd'
    ] as const;

    // Formatted with commas as requested by user
    const values = order.map(key => (rekapKoinStats[key] || 0).toLocaleString('en-US'));
    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedKoinRow(true);
    setTimeout(() => setCopiedKoinRow(false), 2500);
  };

  // Copy raw numeric values without commas (16 values)
  const [copiedKoinRaw, setCopiedKoinRaw] = useState<boolean>(false);
  const handleCopyKoinRaw = () => {
    const order = [
      'deposit',
      'qris',
      'withdraw',
      'dpPgaSpv',
      'wdPgaSpv',
      'realDeposit',
      'realWithdraw',
      'hasil',
      'formDp',
      'formDpGaruda',
      'formDpQrisMinera',
      'formDpQris',
      'totalFormDp',
      'formWd',
      'formAutoWd',
      'totalFormWd'
    ] as const;

    const values = order.map(key => String(rekapKoinStats[key] || 0));
    const tsvRow = values.join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedKoinRaw(true);
    setTimeout(() => setCopiedKoinRaw(false), 2500);
  };

  const handleCopyKoinWithHeader = () => {
    const headers = [
      'Deposit',
      'Total QRIS IDN',
      'Withdraw',
      'DP PGA  SPV',
      'WD PGA  SPV',
      'Real Deposit',
      'Real Withdraw',
      'Hasil',
      'Form DP',
      'Form DP garuda',
      'Form DP QRIS MINERA',
      'Form DP QRIS',
      'Total Form DP',
      'Form WD',
      'Form auto WD',
      'TOTAL Form WD'
    ];
    const order = [
      'deposit',
      'qris',
      'withdraw',
      'dpPgaSpv',
      'wdPgaSpv',
      'realDeposit',
      'realWithdraw',
      'hasil',
      'formDp',
      'formDpGaruda',
      'formDpQrisMinera',
      'formDpQris',
      'totalFormDp',
      'formWd',
      'formAutoWd',
      'totalFormWd'
    ] as const;

    const values = order.map(key => (rekapKoinStats[key] || 0).toLocaleString('en-US'));
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
                  onClick={() => setPlInputText(SAMPLE_PL_USER_DATA)}
                  className="px-3 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-mono font-black border border-yellow-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                  title="Muat 41 data transaksi contoh (Termasuk Bank Jago & Bonus711)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  Format Log CS 41 Transaksi (Jago &amp; Bonus711)
                </button>
                <button
                  type="button"
                  onClick={() => setPlInputText(SAMPLE_PL_DATA)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Preset Singkat
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
                  Terdeteksi Bank: <strong className="text-emerald-400">{parsedPlResult.detectedCount}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                  Bonus711: <strong className={parsedPlResult.bonus711Count > 0 ? 'text-rose-400 font-bold' : 'text-gray-400'}>{parsedPlResult.bonus711Count}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                  Tidak dikenali: <strong className={parsedPlResult.unrecognizedCount > 0 ? 'text-rose-400' : 'text-gray-400'}>{parsedPlResult.unrecognizedCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Total Transaksi Bank (20 Bank):</span>
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                  {parsedPlResult.totalBankCount}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ALERT NOTIFIKASI KHUSUS JIKA TERDETEKSI TRANSAKSI BONUS711                */}
            {/* ========================================================================= */}
            {parsedPlResult.bonus711Count > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#200a16] to-amber-950/70 border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.35)] space-y-3.5 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 shadow-inner">
                      <AlertTriangle className="w-5 h-5 animate-pulse text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-rose-300 font-mono tracking-wide uppercase">
                          ALERT: TERDETEKSI {parsedPlResult.bonus711Count} TRANSAKSI BONUS711!
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-black font-black text-[10px] tracking-wider uppercase shadow-sm">
                          Dikecualikan dari Copy Bank
                        </span>
                      </div>
                      <p className="text-xs text-rose-200/90 font-mono mt-1 leading-relaxed">
                        💡 Sesuai SOP, kolom <strong>TOTAL</strong> dan <strong>BONUS711</strong> <u>TIDAK IKUT</u> saat salin baris count bank (hanya 20 bank agar format spreadsheet tetap pas). Gunakan tombol di samping untuk menyalin data transaksi bonus:
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi Salin Bonus711 */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyBonusTsv}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      title="Salin rincian data bonus711 (Tabel TSV lengkap dengan header)"
                    >
                      {copiedBonusTsv ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{copiedBonusTsv ? 'Tabel Bonus Tersalin!' : 'Salin Data Bonus (TSV)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBonusUsers}
                      className="px-3.5 py-2 rounded-xl bg-[#2a121e] hover:bg-[#3d182b] text-rose-300 border border-rose-500/50 font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Salin list User ID saja untuk pencarian cepat"
                    >
                      {copiedBonusUsers ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <ClipboardPaste className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{copiedBonusUsers ? 'User ID Tersalin!' : 'Salin User ID Saja'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBonusChat}
                      className="px-3.5 py-2 rounded-xl bg-[#1f1624] hover:bg-[#2d1f35] text-amber-300 border border-amber-500/40 font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Salin format chat ringkas untuk dikirim ke CS/Admin"
                    >
                      {copiedBonusChat ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                      <span>{copiedBonusChat ? 'Chat Tersalin!' : 'Salin Format Chat'}</span>
                    </button>
                  </div>
                </div>

                {/* Rincian Transaksi Bonus711 */}
                <div className="rounded-xl border border-rose-500/30 bg-black/40 overflow-x-auto shadow-inner">
                  <table className="w-full border-collapse font-mono text-xs text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-rose-950/60 text-rose-300 font-bold border-b border-rose-500/30 text-[11px] uppercase tracking-wider">
                        <th className="px-3 py-2 text-center w-10">No</th>
                        <th className="px-3 py-2">User ID</th>
                        <th className="px-3 py-2">Bank</th>
                        <th className="px-3 py-2">Nama Pemilik</th>
                        <th className="px-3 py-2">Nomor Rekening</th>
                        <th className="px-3 py-2 text-right">Nominal</th>
                        <th className="px-3 py-2">Tanggal / Waktu</th>
                        <th className="px-3 py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-500/20 text-gray-200">
                      {parsedPlResult.bonus711Records.map((r, idx) => (
                        <tr key={r.id || `bonus-item-${idx}`} className="hover:bg-rose-500/10 transition-colors">
                          <td className="px-3 py-2 text-center text-rose-400 font-bold">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              {r.userId}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-yellow-400 font-bold">{r.bankName}</td>
                          <td className="px-3 py-2 text-white font-medium">{r.accountHolder || '-'}</td>
                          <td className="px-3 py-2 text-cyan-300 font-mono">{r.accountNumber || '-'}</td>
                          <td className="px-3 py-2 text-right text-emerald-400 font-bold">{r.nominal || '0'}</td>
                          <td className="px-3 py-2 text-gray-300 text-[11px]">{r.dateTime || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(r.userId);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-rose-500/30 text-white text-[11px] font-mono transition-colors cursor-pointer"
                              title="Salin User ID ini"
                            >
                              Salin ID
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                  {VALIDATION_BANKS_CONFIG.length} Bank Terdaftar + Total &amp; Bonus
                </span>
              </div>

              {/* Responsive Scrollable Table Container */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-[#040711] overflow-x-auto shadow-xl">
                <table className="w-full border-collapse font-mono text-xs text-center whitespace-nowrap">
                  {/* Header Row: Warna Kuning / Orange Emas Elegan Persis Gambar 1 */}
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black uppercase text-[11px] tracking-wider">
                      {VALIDATION_BANKS_CONFIG.map((b) => (
                        <th key={`th-${b.key}`} className="px-3.5 py-2.5 border-r border-amber-600/50 last:border-r-0">
                          {b.label}
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
                      {VALIDATION_BANKS_CONFIG.map((b) => {
                        const count = parsedPlResult.countsByBank[b.key] || 0;
                        return (
                          <td 
                            key={`td-${b.key}`} 
                            className={`px-3.5 py-3 border-r border-white/10 last:border-r-0 transition-colors ${
                              count > 0 ? 'text-yellow-400 font-black bg-yellow-400/[0.08]' : 'text-gray-400'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                      {/* TOTAL COLUMN (Visual Only) */}
                      <td className="px-4 py-3 bg-cyan-950/40 text-cyan-300 border-x-2 border-cyan-500/50 font-black text-base" title="Hanya Tampilan Visual (Tidak ikut disalin saat Copy Baris TSV)">
                        {parsedPlResult.totalBankCount}
                      </td>
                      {/* BONUS711 COLUMN (Visual Only) */}
                      <td className="px-4 py-3 bg-rose-950/40 text-rose-300 font-black text-base" title="Hanya Tampilan Visual (Tidak ikut disalin saat Copy Baris TSV)">
                        {parsedPlResult.bonus711Count}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Catatan Aturan Salin */}
              <div className="flex items-center justify-between px-2 text-[11px] font-mono text-gray-400">
                <span>
                  💡 <strong>Catatan:</strong> Tombol <em>&quot;Copy Baris Count (TSV)&quot;</em> hanya menyalin 20 nilai bank (TOTAL &amp; BONUS711 dikecualikan sesuai format master).
                </span>
                {parsedPlResult.bonus711Count > 0 && (
                  <span className="text-rose-400 font-bold">
                    *Terdapat {parsedPlResult.bonus711Count} data Bonus711 terdeteksi
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons (Sesuai Gambar 1) */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Copy Semua Kolom (20 Bank) */}
              <button
                type="button"
                onClick={handleCopyAllColumns}
                className="flex-1 min-w-[160px] py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                title="Menyalin header dan baris count untuk 20 bank (TOTAL & BONUS711 tidak ikut)"
              >
                {copiedAllColumns ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedAllColumns ? 'Tersalin (20 Bank)!' : 'Copy Semua Kolom (20 Bank)'}</span>
              </button>

              {/* Copy Baris Count / TSV - 20 Bank */}
              <button
                type="button"
                onClick={handleCopyCountsRow}
                className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                title="Menyalin 20 angka count per bank dalam format TSV (tanpa TOTAL & BONUS711), siap tempel langsung ke Google Sheets"
              >
                {copiedCountsRow ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Table className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedCountsRow ? '20 Angka Bank Tersalin!' : 'Copy Baris Count (TSV) - 20 Bank'}</span>
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
                title="Menyalin 15 angka hasil rekap (dipisahkan TAB dengan format ribuan koma) untuk ditempel ke Excel/Google Sheets"
              >
                {copiedKoinRow ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[2.5]" />}
                <span>{copiedKoinRow ? '15 Hasil Tersalin!' : 'Copy Hasil Saja'}</span>
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
                  'Upload file Excel/CSV history koin, lalu 15 kolom rekap akan muncul otomatis.'
                )}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleKoin}
                  className="px-3 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-mono font-bold border border-yellow-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                  title="Muat contoh rekapan lengkap (Deposit 459M, SPV 319M, Form 2.925)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span>Contoh Data (Demo Terakhir)</span>
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
            {/* 16-KOLOM TABEL REKAPAN KOIN (PERSIS GAMBAR MASTER DENGAN WARNA RESMI)       */}
            {/* ========================================================================= */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-[#040711] overflow-x-auto shadow-2xl">
              <table className="w-full border-collapse font-mono text-xs text-center whitespace-nowrap">
                {/* Header Row: Orange/Golden Amber Background persis gambar user */}
                <thead>
                  <tr className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black uppercase text-xs tracking-wider">
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Deposit</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Total QRIS IDN</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Withdraw</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">DP PGA  SPV</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">WD PGA  SPV</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Real Deposit</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Real Withdraw</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Hasil</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form DP</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form DP garuda</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form DP QRIS MINERA</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form DP QRIS</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Total Form DP</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form WD</th>
                    <th className="px-3.5 py-3.5 border-r border-amber-600/40">Form auto WD</th>
                    <th className="px-3.5 py-3.5">TOTAL Form WD</th>
                  </tr>
                </thead>

                {/* Data Row: Warna Cell Persis Master Sheet (White, Yellow, Green) */}
                <tbody>
                  <tr className="font-extrabold text-sm text-black">
                    {/* 1. Deposit (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.deposit || 0).toLocaleString('en-US')}
                    </td>

                    {/* 2. Total QRIS IDN (Yellow) */}
                    <td className="px-3.5 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.qris || 0).toLocaleString('en-US')}
                    </td>

                    {/* 3. Withdraw (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.withdraw || 0).toLocaleString('en-US')}
                    </td>

                    {/* 4. DP PGA SPV (Green) */}
                    <td className="px-3.5 py-3.5 bg-[#00FF66] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.dpPgaSpv || 0).toLocaleString('en-US')}
                    </td>

                    {/* 5. WD PGA SPV (Green) */}
                    <td className="px-3.5 py-3.5 bg-[#00FF66] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.wdPgaSpv || 0).toLocaleString('en-US')}
                    </td>

                    {/* 6. Real Deposit (Yellow) */}
                    <td className="px-3.5 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.realDeposit || 0).toLocaleString('en-US')}
                    </td>

                    {/* 7. Real Withdraw (Yellow) */}
                    <td className="px-3.5 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.realWithdraw || 0).toLocaleString('en-US')}
                    </td>

                    {/* 8. Hasil (Yellow) */}
                    <td className="px-3.5 py-3.5 bg-[#FFFF00] border-r border-zinc-300 font-black">
                      {(rekapKoinStats.hasil || 0).toLocaleString('en-US')}
                    </td>

                    {/* 9. Form DP (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formDp || 0).toLocaleString('en-US')}
                    </td>

                    {/* 10. Form DP garuda (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formDpGaruda || 0).toLocaleString('en-US')}
                    </td>

                    {/* 11. Form DP QRIS MINERA (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formDpQrisMinera || 0).toLocaleString('en-US')}
                    </td>

                    {/* 12. Form DP QRIS (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formDpQris || 0).toLocaleString('en-US')}
                    </td>

                    {/* 13. Total Form DP (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.totalFormDp || 0).toLocaleString('en-US')}
                    </td>

                    {/* 14. Form WD (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formWd || 0).toLocaleString('en-US')}
                    </td>

                    {/* 15. Form auto WD (White) */}
                    <td className="px-3.5 py-3.5 bg-white border-r border-zinc-300 font-bold">
                      {(rekapKoinStats.formAutoWd || 0).toLocaleString('en-US')}
                    </td>

                    {/* 16. TOTAL Form WD (White) */}
                    <td className="px-3.5 py-3.5 bg-white font-bold">
                      {(rekapKoinStats.totalFormWd || 0).toLocaleString('en-US')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtext Footnote (Persis Gambar) */}
            <p className="text-xs text-gray-400 text-center font-mono">
              Hasil copy berisi 16 kolom dipisahkan dengan TAB agar bisa langsung ditempel pas ke Excel/Google Sheets.
            </p>

            {/* Action Buttons: Copy dengan Header & Copy Angka Polos */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleCopyKoinOnly}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
                title="Salin 16 nilai dengan pemisah koma ribuan (459,643,335 ...)"
              >
                {copiedKoinRow ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedKoinRow ? '16 Angka Tersalin (Koma)!' : 'Salin 16 Angka (Format Koma)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyKoinRaw}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
                title="Salin 16 nilai angka polos tanpa tanda koma (459643335 ...)"
              >
                {copiedKoinRaw ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedKoinRaw ? '16 Angka Polos Tersalin!' : 'Salin 16 Angka Polos (Tanpa Koma)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyKoinWithHeader}
                className="px-4 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a2840] text-gray-300 border border-white/20 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
                title="Salin 16 kolom lengkap dengan baris header"
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
