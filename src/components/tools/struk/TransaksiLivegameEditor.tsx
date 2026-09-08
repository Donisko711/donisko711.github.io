import React, { useState, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Sliders, 
  Code2, 
  Table, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  CopyCheck,
  Dices,
  ExternalLink,
  Clock,
  Lock,
  ArrowRight,
  History
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface LiveCasinoGameInfo {
  code: string;
  name: string;
  defaultPeriode: string;
  defaultBeliKet: string;
  defaultMenangKet: string;
}

export const LIVE_CASINO_PRESETS: LiveCasinoGameInfo[] = [
  { code: '24dspin', name: '24D Spin', defaultPeriode: '3329460', defaultBeliKet: 'Beli 24Dspin', defaultMenangKet: 'Menang 24D Spin' },
  { code: '24D', name: '24D Games', defaultPeriode: '2982451', defaultBeliKet: 'Beli 24D', defaultMenangKet: 'Menang 24D Games' },
  { code: 'RL', name: 'Roulette', defaultPeriode: '2513586', defaultBeliKet: 'Beli Roulette', defaultMenangKet: 'Menang Roulette Games' },
  { code: '12D', name: '12D Games', defaultPeriode: '1985420', defaultBeliKet: 'Beli 12D', defaultMenangKet: 'Menang 12D Games' },
  { code: 'SB', name: 'Sicbo[Dice]', defaultPeriode: '2240185', defaultBeliKet: 'Beli Sicbo', defaultMenangKet: 'Menang Sicbo Games' },
  { code: 'BC', name: 'Baccarat', defaultPeriode: '1760490', defaultBeliKet: 'Beli Baccarat', defaultMenangKet: 'Menang Baccarat Games' },
  { code: 'DT', name: 'Dragon Tiger', defaultPeriode: '1430982', defaultBeliKet: 'Beli Dragon Tiger', defaultMenangKet: 'Menang Dragon Tiger Games' },
  { code: 'D6', name: 'Dice 6', defaultPeriode: '1890240', defaultBeliKet: 'Beli Dice 6', defaultMenangKet: 'Menang Dice 6 Games' },
  { code: '24DS', name: '24D Spin (Legacy)', defaultPeriode: '2085340', defaultBeliKet: 'Beli 24D Spin', defaultMenangKet: 'Menang 24D Spin Games' },
  { code: 'RW', name: 'Red White', defaultPeriode: '1650390', defaultBeliKet: 'Beli Red White', defaultMenangKet: 'Menang Red White Games' },
  { code: 'HT', name: 'Head & Tail', defaultPeriode: '1340920', defaultBeliKet: 'Beli Head Tail', defaultMenangKet: 'Menang Head Tail Games' },
  { code: 'GB', name: 'Gong Ball', defaultPeriode: '1120480', defaultBeliKet: 'Beli Gong Ball', defaultMenangKet: 'Menang Gong Ball Games' },
  { code: 'SW', name: 'Suwit', defaultPeriode: '1090450', defaultBeliKet: 'Beli Suwit', defaultMenangKet: 'Menang Suwit Games' },
  { code: 'PD', name: 'Poker Dice', defaultPeriode: '1830290', defaultBeliKet: 'Beli Poker Dice', defaultMenangKet: 'Menang Poker Dice Games' },
  { code: 'MN', name: 'Monopoly', defaultPeriode: '2140590', defaultBeliKet: 'Beli Monopoly', defaultMenangKet: 'Menang Monopoly Games' },
  { code: 'OGLOK', name: 'Oglok', defaultPeriode: '1780430', defaultBeliKet: 'Beli Oglok', defaultMenangKet: 'Menang Oglok Games' },
  { code: 'BL', name: 'Billiards', defaultPeriode: '1290480', defaultBeliKet: 'Beli Billiards', defaultMenangKet: 'Menang Billiards Games' },
  { code: '5D', name: '5D Ball', defaultPeriode: '1490280', defaultBeliKet: 'Beli 5D Ball', defaultMenangKet: 'Menang 5D Ball Games' },
  { code: 'FT', name: 'Fan Tan', defaultPeriode: '1020490', defaultBeliKet: 'Beli Fan Tan', defaultMenangKet: 'Menang Fan Tan Games' },
  { code: 'IDN4', name: 'IDN 4 Stand', defaultPeriode: '1150290', defaultBeliKet: 'Beli IDN 4 Stand', defaultMenangKet: 'Menang IDN 4 Stand' },
  { code: 'NN', name: 'Niu Niu', defaultPeriode: '1380120', defaultBeliKet: 'Beli Niu Niu', defaultMenangKet: 'Menang Niu Niu Games' },
];

export interface LivegameTxRow {
  id: string;
  no: number | string;
  periodeNum: string;    // e.g. '2982451'
  gameCode: string;      // e.g. '24D' or 'RL'
  periode: string;       // Combined e.g. '2982451 - 24D'
  tanggal: string;       // '2026-09-08 11:31:57'
  keterangan: string;    // 'Menang 24D Games' or 'Beli 24D'
  tesiId: string;        // '13928284'
  hasLink: boolean;
  status: 'Menang' | 'Beli' | 'Withdraw' | 'Deposit' | string;
  debet: string;         // '0' or '40,000'
  kredit: string;        // '431,250' or '0'
  saldo: string;         // '1,432,150 '
  via: 'Mobile' | '-' | 'Website' | string;
  bgType: 'gray' | 'peach';
}

export const TransaksiLivegameEditor: React.FC = () => {
  // Top Config States
  const [cfgRows, setCfgRows] = useState<number>(6);
  const [cfgPemain, setCfgPemain] = useState<string>('alekjiji');
  const [selectedGameCode, setSelectedGameCode] = useState<string>('24dspin');
  const [customGameName, setCustomGameName] = useState<string>('');
  const [cfgDefaultPeriode, setCfgDefaultPeriode] = useState<string>('3329460');
  const [cfgBetMin, setCfgBetMin] = useState<number>(5000);
  const [cfgBetMax, setCfgBetMax] = useState<number>(700000);
  const [cfgWinMin, setCfgWinMin] = useState<number>(50000);
  const [cfgWinMax, setCfgWinMax] = useState<number>(1150000);
  const [cfgLastBalance, setCfgLastBalance] = useState<string>('181');

  // Chronology Scenario States: Pasang -> Menang -> Withdraw
  const [cfgWdAmount, setCfgWdAmount] = useState<string>('1,100,000');
  const [cfgWdTime, setCfgWdTime] = useState<string>('2026-09-08 13:06:31');
  const [cfgWinAmount, setCfgWinAmount] = useState<string>('1,150,000');
  const [cfgWinTime, setCfgWinTime] = useState<string>('2026-09-08 13:02:06');
  const [cfgBetAmount, setCfgBetAmount] = useState<string>('700,000');
  const [cfgBetTime, setCfgBetTime] = useState<string>('2026-09-08 13:01:45');
  const [cfgSisaSaldo, setCfgSisaSaldo] = useState<string>('51,041');

  // UI & View States
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [copiedHtmlStatus, setCopiedHtmlStatus] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'HTML_CODE'>('PREVIEW');
  const [showPagingHeader, setShowPagingHeader] = useState<boolean>(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Exact sample data as specified in user request
  const initialRows: LivegameTxRow[] = [
    {
      id: 'row-1',
      no: 1,
      periodeNum: '',
      gameCode: '',
      periode: '',
      tanggal: '2026-09-08 13:06:31',
      keterangan: 'Tarik Dana',
      tesiId: '',
      hasLink: false,
      status: 'Withdraw',
      debet: '1,100,000',
      kredit: '0',
      saldo: '51,041',
      via: 'Mobile',
      bgType: 'gray'
    },
    {
      id: 'row-2',
      no: 2,
      periodeNum: '3329460',
      gameCode: '24dspin',
      periode: '3329460 - 24dspin',
      tanggal: '2026-09-08 13:02:06',
      keterangan: 'Menang 24D Spin',
      tesiId: '14170880',
      hasLink: true,
      status: 'Menang',
      debet: '0',
      kredit: '1,150,000',
      saldo: '1,151,041',
      via: '-',
      bgType: 'peach'
    },
    {
      id: 'row-3',
      no: 3,
      periodeNum: '3329460',
      gameCode: '24dspin',
      periode: '3329460 - 24dspin',
      tanggal: '2026-09-08 13:01:45',
      keterangan: 'Beli 24Dspin',
      tesiId: '14170320',
      hasLink: true,
      status: 'Beli',
      debet: '700,000',
      kredit: '0',
      saldo: '1,041',
      via: 'Mobile',
      bgType: 'gray'
    },
    {
      id: 'row-100',
      no: 100,
      periodeNum: '3327667',
      gameCode: '24dspin',
      periode: '3327667 - 24dspin',
      tanggal: '2026-09-07 00:43:49',
      keterangan: 'Beli 24Dspin',
      tesiId: '10396378',
      hasLink: true,
      status: 'Beli',
      debet: '83,000',
      kredit: '0',
      saldo: '196',
      via: 'Mobile',
      bgType: 'peach'
    },
    {
      id: 'row-101',
      no: 101,
      periodeNum: '',
      gameCode: '',
      periode: '',
      tanggal: '2026-09-06 23:18:01',
      keterangan: 'Bonus Rolling Slot',
      tesiId: '',
      hasLink: false,
      status: 'rolling',
      debet: '0',
      kredit: '1,248',
      saldo: '83,196',
      via: '-',
      bgType: 'gray'
    },
    {
      id: 'row-102',
      no: 102,
      periodeNum: '',
      gameCode: '',
      periode: '',
      tanggal: '2026-09-06 23:17:52',
      keterangan: 'Bonus Rolling',
      tesiId: '',
      hasLink: false,
      status: 'rolling',
      debet: '0',
      kredit: '81,340',
      saldo: '81,948',
      via: '-',
      bgType: 'peach'
    }
  ];

  const [rows, setRows] = useState<LivegameTxRow[]>(initialRows);

  // Helper calculations
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const roundTo = (val: number, step: number) => Math.round(val / step) * step;
  const formatMoney = (val: number) => Math.max(0, Math.round(val)).toLocaleString('en-US');
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Check if a row is a game betting or winning transaction (Beli / Menang)
  // RULE: Jika keterangan terisi selain beli atau menang, maka kolom periode harusnya kosong tidak terisi
  const isBeliOrMenang = (keterangan?: string, status?: string): boolean => {
    const ket = (keterangan || '').trim().toLowerCase();
    const sta = (status || '').trim().toLowerCase();
    if (!ket && !sta) return false;
    const isKetBeli = ket.startsWith('beli') || ket.includes('beli');
    const isKetMenang = ket.startsWith('menang') || ket.includes('menang');
    const isStaBeli = sta === 'beli';
    const isStaMenang = sta === 'menang';
    return isKetBeli || isKetMenang || isStaBeli || isStaMenang;
  };

  const getGameInfo = (code: string) => {
    const found = LIVE_CASINO_PRESETS.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (found) return found;
    return {
      code: code,
      name: customGameName || code,
      defaultPeriode: cfgDefaultPeriode,
      defaultBeliKet: `Beli ${customGameName || code}`,
      defaultMenangKet: `Menang ${customGameName || code} Games`
    };
  };

  // Generate Automatic Simulation for Livegame Casino
  // STRICT RULE: Row 1 is ALWAYS Status: "Withdraw" and Keterangan: "Tarik Dana"
  // Rows below represent the chronological progression: Pasang (Beli) -> Menang -> Withdraw
  const handleGenerate = () => {
    setIsGenerating(true);

    const numRows = Math.max(3, clamp(cfgRows, 1, 50));
    let bMin = clamp(cfgBetMin, 1000, 100000000);
    let bMax = clamp(cfgBetMax, 1000, 100000000);
    let wMin = clamp(cfgWinMin, 1000, 100000000);
    let wMax = clamp(cfgWinMax, 1000, 100000000);

    if (bMin > bMax) [bMin, bMax] = [bMax, bMin];
    if (wMin > wMax) [wMin, wMax] = [wMax, wMin];

    const currentGame = getGameInfo(selectedGameCode);
    let basePeriodeNum = parseInt(cfgDefaultPeriode, 10) || 3329460;

    // Timeline anchor: Withdraw is latest event
    let wdDate = new Date();
    if (cfgWdTime) {
      const parsed = new Date(cfgWdTime.replace(' ', 'T'));
      if (!isNaN(parsed.getTime())) wdDate = parsed;
    }

    // Menang is 2 - 5 minutes before withdraw (e.g. 4m 25s)
    const winDate = new Date(wdDate.getTime() - randInt(180, 290) * 1000);
    // Pasang (Beli) is 20 - 45 seconds before menang
    const betDate = new Date(winDate.getTime() - randInt(21, 40) * 1000);

    const betAmount = roundTo(randInt(bMin, bMax), 1000);
    const winAmount = roundTo(randInt(Math.max(wMin, betAmount + 50000), wMax), 10000);
    const sisaSaldo = randInt(10, 99) * 1000 + randInt(10, 990);
    const saldoSaatBeli = 1041;
    const saldoSaatMenang = saldoSaatBeli + winAmount;
    const wdAmount = Math.max(50000, saldoSaatMenang - sisaSaldo);

    const wdTimeStr = formatDate(wdDate);
    const winTimeStr = formatDate(winDate);
    const betTimeStr = formatDate(betDate);

    setCfgWdTime(wdTimeStr);
    setCfgWdAmount(formatMoney(wdAmount));
    setCfgWinTime(winTimeStr);
    setCfgWinAmount(formatMoney(winAmount));
    setCfgBetTime(betTimeStr);
    setCfgBetAmount(formatMoney(betAmount));
    setCfgSisaSaldo(formatMoney(sisaSaldo));

    const newItems: LivegameTxRow[] = [];

    // ROW 1: STATUS WITHDRAW & KETERANGAN TARIK DANA (MANDATORY AT TOP)
    newItems.push({
      id: `row-1`,
      no: 1,
      periodeNum: '',
      gameCode: '',
      periode: '',
      tanggal: wdTimeStr,
      keterangan: 'Tarik Dana',
      tesiId: '',
      hasLink: false,
      status: 'Withdraw',
      debet: formatMoney(wdAmount),
      kredit: '0',
      saldo: formatMoney(sisaSaldo),
      via: 'Mobile',
      bgType: 'gray'
    });

    // ROW 2: MENANG GAMES (PUTARAN TERSEBUT)
    newItems.push({
      id: `row-2`,
      no: 2,
      periodeNum: String(basePeriodeNum),
      gameCode: currentGame.code,
      periode: `${basePeriodeNum} - ${currentGame.code}`,
      tanggal: winTimeStr,
      keterangan: currentGame.defaultMenangKet,
      tesiId: String(randInt(14100000, 14199999)),
      hasLink: true,
      status: 'Menang',
      debet: '0',
      kredit: formatMoney(winAmount),
      saldo: formatMoney(saldoSaatMenang),
      via: '-',
      bgType: 'peach'
    });

    // ROW 3: BELI (PASANG PUTARAN TERSEBUT)
    newItems.push({
      id: `row-3`,
      no: 3,
      periodeNum: String(basePeriodeNum),
      gameCode: currentGame.code,
      periode: `${basePeriodeNum} - ${currentGame.code}`,
      tanggal: betTimeStr,
      keterangan: currentGame.defaultBeliKet,
      tesiId: String(randInt(14100000, 14199999)),
      hasLink: true,
      status: 'Beli',
      debet: formatMoney(betAmount),
      kredit: '0',
      saldo: formatMoney(saldoSaatBeli),
      via: 'Mobile',
      bgType: 'gray'
    });

    // Older history rows (Row 4+)
    let histTime = new Date(betDate.getTime() - randInt(3600, 7200) * 1000);
    let histNo = 100;
    let histPeriode = basePeriodeNum - randInt(1, 5);

    for (let i = 4; i <= numRows; i++) {
      const isRolling = i >= numRows - 1;
      const bgType = (i - 1) % 2 === 0 ? 'gray' : 'peach';

      if (isRolling) {
        newItems.push({
          id: `row-${i}`,
          no: histNo,
          periodeNum: '',
          gameCode: '',
          periode: '',
          tanggal: formatDate(histTime),
          keterangan: i === numRows ? 'Bonus Rolling' : 'Bonus Rolling Slot',
          tesiId: '',
          hasLink: false,
          status: 'rolling',
          debet: '0',
          kredit: formatMoney(i === numRows ? 81340 : 1248),
          saldo: formatMoney(i === numRows ? 81948 : 83196),
          via: '-',
          bgType
        });
      } else {
        newItems.push({
          id: `row-${i}`,
          no: histNo,
          periodeNum: String(histPeriode),
          gameCode: currentGame.code,
          periode: `${histPeriode} - ${currentGame.code}`,
          tanggal: formatDate(histTime),
          keterangan: currentGame.defaultBeliKet,
          tesiId: String(randInt(10000000, 14199999)),
          hasLink: true,
          status: 'Beli',
          debet: formatMoney(roundTo(randInt(bMin, bMax), 1000)),
          kredit: '0',
          saldo: formatMoney(randInt(100, 5000)),
          via: 'Mobile',
          bgType
        });
        histPeriode = Math.max(1, histPeriode - 1);
      }
      histNo++;
      histTime = new Date(histTime.getTime() - randInt(60, 600) * 1000);
    }

    setRows(newItems);
    setSelectedRowId(null);

    setTimeout(() => {
      setIsGenerating(false);
    }, 150);
  };

  // Apply Chronology (Pasang -> Menang -> Withdraw) to Rows 1, 2, 3
  const handleApplyChronology = () => {
    const currentGame = getGameInfo(selectedGameCode);
    const pNum = cfgDefaultPeriode || '3329460';
    const numBet = parseInt(cfgBetAmount.replace(/,/g, ''), 10) || 700000;
    const numWin = parseInt(cfgWinAmount.replace(/,/g, ''), 10) || 1150000;
    const numWd = parseInt(cfgWdAmount.replace(/,/g, ''), 10) || 1100000;
    const numSisa = parseInt(cfgSisaSaldo.replace(/,/g, ''), 10) || 51041;

    const saldoMenang = numSisa + numWd;
    const saldoBeli = Math.max(1041, saldoMenang - numWin);

    setRows(prev => {
      const updated = [...prev];
      // Row 1: Withdraw (Tarik Dana) - ALWAYS TOP ROW
      if (updated.length > 0) {
        updated[0] = {
          ...updated[0],
          no: 1,
          periode: '',
          periodeNum: '',
          gameCode: '',
          tanggal: cfgWdTime,
          keterangan: 'Tarik Dana',
          status: 'Withdraw',
          debet: formatMoney(numWd),
          kredit: '0',
          saldo: formatMoney(numSisa),
          via: 'Mobile',
          hasLink: false,
          tesiId: '',
          bgType: 'gray'
        };
      }
      // Row 2: Menang
      if (updated.length > 1) {
        updated[1] = {
          ...updated[1],
          no: 2,
          periodeNum: pNum,
          gameCode: currentGame.code,
          periode: `${pNum} - ${currentGame.code}`,
          tanggal: cfgWinTime,
          keterangan: currentGame.defaultMenangKet,
          status: 'Menang',
          debet: '0',
          kredit: formatMoney(numWin),
          saldo: formatMoney(saldoMenang),
          via: '-',
          hasLink: true,
          tesiId: updated[1].tesiId || '14170880',
          bgType: 'peach'
        };
      }
      // Row 3: Beli (Pasang)
      if (updated.length > 2) {
        updated[2] = {
          ...updated[2],
          no: 3,
          periodeNum: pNum,
          gameCode: currentGame.code,
          periode: `${pNum} - ${currentGame.code}`,
          tanggal: cfgBetTime,
          keterangan: currentGame.defaultBeliKet,
          status: 'Beli',
          debet: formatMoney(numBet),
          kredit: '0',
          saldo: formatMoney(saldoBeli),
          via: 'Mobile',
          hasLink: true,
          tesiId: updated[2].tesiId || '14170320',
          bgType: 'gray'
        };
      }
      return updated;
    });
  };

  // Set timestamps relative to current time
  const handleSetScenarioToNow = () => {
    const now = new Date();
    // Withdraw now
    const wdT = formatDate(now);
    // Menang 4 minutes 25 seconds ago
    const winDate = new Date(now.getTime() - (4 * 60 + 25) * 1000);
    const winT = formatDate(winDate);
    // Pasang 21 seconds before winning
    const betDate = new Date(winDate.getTime() - 21 * 1000);
    const betT = formatDate(betDate);

    setCfgWdTime(wdT);
    setCfgWinTime(winT);
    setCfgBetTime(betT);

    // Apply timestamps directly to rows 1, 2, 3
    setRows(prev => {
      const updated = [...prev];
      if (updated[0]) updated[0] = { ...updated[0], tanggal: wdT };
      if (updated[1]) updated[1] = { ...updated[1], tanggal: winT };
      if (updated[2]) updated[2] = { ...updated[2], tanggal: betT };
      return updated;
    });
  };

  // Add new row (always inserted below row 1 to preserve top Withdraw row)
  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    const newNo = lastRow ? Number(lastRow.no) + 1 : 1;
    const currentGame = getGameInfo(selectedGameCode);
    const newRow: LivegameTxRow = {
      id: `row-${Date.now()}`,
      no: newNo,
      periodeNum: cfgDefaultPeriode,
      gameCode: currentGame.code,
      periode: `${cfgDefaultPeriode} - ${currentGame.code}`,
      tanggal: formatDate(new Date()),
      keterangan: currentGame.defaultBeliKet,
      tesiId: String(randInt(13900000, 13999999)),
      hasLink: true,
      status: 'Beli',
      debet: '50,000',
      kredit: '0',
      saldo: '1,000,000',
      via: 'Mobile',
      bgType: rows.length % 2 === 0 ? 'gray' : 'peach'
    };
    setRows([...rows, newRow]);
    setSelectedRowId(newRow.id);
  };

  // Reset to original template
  const handleReset = () => {
    setRows(initialRows);
    setCfgPemain('alekjiji');
    setSelectedGameCode('24dspin');
    setCfgDefaultPeriode('3329460');
    setCfgLastBalance('181');
    setCfgWdAmount('1,100,000');
    setCfgWdTime('2026-09-08 13:06:31');
    setCfgWinAmount('1,150,000');
    setCfgWinTime('2026-09-08 13:02:06');
    setCfgBetAmount('700,000');
    setCfgBetTime('2026-09-08 13:01:45');
    setCfgSisaSaldo('51,041');
    setSelectedRowId(null);
  };

  // Delete selected row (Top row is protected)
  const handleDeleteSelectedRow = () => {
    if (!selectedRowId) return;
    if (rows[0]?.id === selectedRowId) {
      // Row 1 is mandatory Tarik Dana / Withdraw and cannot be deleted
      return;
    }
    const updated = rows.filter(r => r.id !== selectedRowId).map((r, idx) => ({
      ...r,
      bgType: idx % 2 === 0 ? 'gray' as const : 'peach' as const
    }));
    setRows(updated);
    setSelectedRowId(null);
  };

  // Duplicate selected row
  const handleDuplicateRow = () => {
    if (!selectedRowId) return;
    const targetIdx = rows.findIndex(r => r.id === selectedRowId);
    if (targetIdx === -1) return;
    const target = rows[targetIdx];
    const cloned: LivegameTxRow = {
      ...target,
      id: `row-${Date.now()}`,
      no: typeof target.no === 'number' ? target.no + 1 : `${target.no}_copy`,
      tesiId: String(randInt(13900000, 13999999))
    };
    const nextRows = [...rows];
    nextRows.splice(targetIdx + 1, 0, cloned);
    setRows(nextRows.map((r, idx) => ({
      ...r,
      bgType: idx % 2 === 0 ? 'gray' : 'peach'
    })));
    setSelectedRowId(cloned.id);
  };

  // Move row up/down (Top row 0 is pinned)
  const handleMoveRow = (direction: 'up' | 'down') => {
    if (!selectedRowId) return;
    const idx = rows.findIndex(r => r.id === selectedRowId);
    if (idx === -1) return;
    // Row 0 is pinned at top (Tarik Dana / Withdraw)
    if (idx === 0) return;
    if (direction === 'up' && idx <= 1) return; // Cannot move above Row 1
    if (direction === 'down' && idx === rows.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const nextRows = [...rows];
    const temp = nextRows[idx];
    nextRows[idx] = nextRows[targetIdx];
    nextRows[targetIdx] = temp;

    setRows(nextRows.map((r, i) => ({
      ...r,
      bgType: i % 2 === 0 ? 'gray' : 'peach'
    })));
  };

  // Cell change (Protects Row 1 status & keterangan, and enforces empty periode for non-beli/menang)
  const handleCellChange = (id: string, field: keyof LivegameTxRow, value: any) => {
    setRows(prev => prev.map((r, idx) => {
      if (r.id !== id) return r;
      const isTopRow = idx === 0;

      // Status and keterangan for top row are protected
      let updatedVal = value;
      if (isTopRow && field === 'status' && !value) updatedVal = 'Withdraw';
      if (isTopRow && field === 'keterangan' && !value) updatedVal = 'Tarik Dana';
      if (isTopRow && (field === 'periode' || field === 'periodeNum' || field === 'gameCode')) updatedVal = '';

      const updated = { ...r, [field]: updatedVal };
      
      // RULE: Jika keterangan terisi selain beli atau menang, maka kolom periode harusnya kosong tidak terisi
      const canHavePeriode = !isTopRow && isBeliOrMenang(updated.keterangan, updated.status);
      if (!canHavePeriode) {
        updated.periode = '';
        updated.periodeNum = '';
        updated.gameCode = '';
      } else {
        // If row just switched to Beli or Menang and had no periode, initialize with default
        if (!updated.periode && (field === 'keterangan' || field === 'status')) {
          const defaultGame = getGameInfo(selectedGameCode);
          updated.periodeNum = cfgDefaultPeriode || '3329460';
          updated.gameCode = defaultGame.code;
          updated.periode = `${updated.periodeNum} - ${defaultGame.code}`;
        }

        // Update combined periode if periodeNum or gameCode changes
        if (field === 'periodeNum' || field === 'gameCode') {
          const num = field === 'periodeNum' ? value : r.periodeNum;
          const code = field === 'gameCode' ? value : r.gameCode;
          if (num || code) {
            updated.periode = num && code ? `${num} - ${code}` : (num || code);
          } else {
            updated.periode = '';
          }
        } else if (field === 'periode') {
          const parts = String(value).split('-');
          if (parts.length >= 2) {
            updated.periodeNum = parts[0].trim();
            updated.gameCode = parts.slice(1).join('-').trim();
          } else {
            updated.periodeNum = String(value).trim();
          }
        }
      }
      return updated;
    }));
  };

  // Quick Action Changer for Selected Row (Protects Row 1)
  const handleQuickAction = (actionType: 'MENANG' | 'BELI' | 'WD' | 'DEPO' | 'ROLLING') => {
    if (!selectedRowId) return;
    const isTopRow = rows[0]?.id === selectedRowId;
    if (isTopRow && actionType !== 'WD') {
      // Row 1 must remain Withdraw / Tarik Dana
      return;
    }

    const row = rows.find(r => r.id === selectedRowId);
    if (!row) return;

    const game = getGameInfo(row.gameCode || selectedGameCode);

    setRows(prev => prev.map(r => {
      if (r.id !== selectedRowId) return r;
      switch (actionType) {
        case 'MENANG':
          return {
            ...r,
            keterangan: game.defaultMenangKet,
            status: 'Menang',
            debet: '0',
            kredit: r.kredit === '0' ? '431,250' : r.kredit,
            hasLink: true,
            via: '-'
          };
        case 'BELI':
          return {
            ...r,
            keterangan: game.defaultBeliKet,
            status: 'Beli',
            debet: r.debet === '0' ? '40,000' : r.debet,
            kredit: '0',
            hasLink: true,
            via: 'Mobile'
          };
        case 'WD':
          return {
            ...r,
            keterangan: 'Tarik Dana',
            status: 'Withdraw',
            periode: '',
            gameCode: '',
            periodeNum: '',
            debet: r.debet === '0' ? '1,000,000' : r.debet,
            kredit: '0',
            hasLink: false,
            via: 'Mobile'
          };
        case 'DEPO':
          return {
            ...r,
            keterangan: 'Deposit PGA',
            status: 'Deposit',
            periode: '',
            gameCode: '',
            periodeNum: '',
            debet: '0',
            kredit: r.kredit === '0' ? '200,000' : r.kredit,
            hasLink: false,
            via: 'Website'
          };
        case 'ROLLING':
          return {
            ...r,
            keterangan: 'Bonus Rollingan Livegame',
            status: 'rolling',
            periode: '',
            gameCode: '',
            periodeNum: '',
            debet: '0',
            kredit: r.kredit === '0' ? '15,000' : r.kredit,
            hasLink: false,
            via: '-'
          };
        default:
          return r;
      }
    }));
  };

  // Change Game for selected row or apply to all (Only applies to Beli or Menang rows)
  const handleApplyGameToRow = (game: LiveCasinoGameInfo, applyToAll = false) => {
    if (applyToAll) {
      setRows(prev => prev.map(r => {
        // If not Beli or Menang, ensure periode remains completely empty
        if (!isBeliOrMenang(r.keterangan, r.status)) {
          return {
            ...r,
            periode: '',
            periodeNum: '',
            gameCode: ''
          };
        }
        const ket = r.status === 'Menang' ? game.defaultMenangKet : game.defaultBeliKet;
        return {
          ...r,
          gameCode: game.code,
          periodeNum: r.periodeNum || game.defaultPeriode,
          periode: `${r.periodeNum || game.defaultPeriode} - ${game.code}`,
          keterangan: ket
        };
      }));
    } else if (selectedRowId) {
      setRows(prev => prev.map(r => {
        if (r.id !== selectedRowId) return r;
        if (!isBeliOrMenang(r.keterangan, r.status)) return r;
        const ket = r.status === 'Menang' ? game.defaultMenangKet : game.defaultBeliKet;
        return {
          ...r,
          gameCode: game.code,
          periodeNum: r.periodeNum || game.defaultPeriode,
          periode: `${r.periodeNum || game.defaultPeriode} - ${game.code}`,
          keterangan: ket
        };
      }));
    }
  };

  // Generate exact HTML script as provided by user
  const generateRawHtmlScript = () => {
    const pagingHtml = showPagingHeader
      ? `<a href="admin_transaksi.php?pemain2=${encodeURIComponent(cfgPemain)}&amp;start=25&amp;end=50&amp;sta=Baru">[ &gt;&gt; ]</a>\n`
      : '';

    let html = `<table width="100%">
    <tbody><tr>
		<td>
${pagingHtml}</td></tr><tr bgcolor="#F5E363">
	<td align="center"><font size="2" color="#000000" face="verdana"><b>No</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Periode</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Tanggal</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Keterangan</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Status</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Debet</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Kredit</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Saldo</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>Via</b></font></td>
</tr>
<tr bgcolor="#FFDBB7">
	<td align="center" colspan="5"><font size="2" color="#000000" face="verdana"><b>&nbsp;</b></font></td>
	<td align="center" colspan="2"><font size="2" color="#000000" face="verdana"><b>Last Balance</b></font></td>
	<td align="center"><font size="2" color="#0000FF" face="verdana"><b>${cfgLastBalance}</b></font></td>
	<td align="center"><font size="2" color="#000000" face="verdana"><b>&nbsp;</b></font></td>
</tr>`;

    rows.forEach(r => {
      const bg = r.bgType === 'gray' ? '#EFEFEF' : '#FFDBB7';
      const debetColor = '#000000';
      const kreditColor = '#0000FF';
      const saldoColor = '#0000FF';
      const statusColor = 'red';

      // RULE: Jika keterangan selain beli atau menang, kolom periode kosong tidak terisi
      const canHavePeriode = isBeliOrMenang(r.keterangan, r.status);
      const periodeDisplay = canHavePeriode ? (r.periode || '') : '';

      let ketCell = `<font size="2" color="#000000" face="verdana">${r.keterangan}</font>`;
      if (r.hasLink && r.tesiId) {
        ketCell = `<font size="2" color="#000000" face="verdana"><a href="javascript:popUp('user_detil.php?tesi=${r.tesiId}&amp;sta=Baru&amp;pemain=${cfgPemain}')">${r.keterangan}</a></font>`;
      }

      html += `<tr bgcolor="${bg}">` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.no}</font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${periodeDisplay || '&nbsp;'}</font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.tanggal}</font></td>` +
        `<td align="center">${ketCell}</td>` +
        `<td align="center"><font size="2" color="${statusColor}" face="verdana">${r.status}</font></td>` +
        `<td align="center"><font size="2" color="${debetColor}" face="verdana">${r.debet}</font></td>` +
        `<td align="center"><font size="2" color="${kreditColor}" face="verdana">${r.kredit}</font></td>` +
        `<td align="center"><font size="2" color="${saldoColor}" face="verdana">${r.saldo ? r.saldo.trim() : ''} </font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.via}</font></td>` +
        `</tr>`;
    });

    html += `\n</tbody></table>`;
    return html;
  };

  // Copy Plain Text
  const handleCopyTableText = () => {
    let text = `Transaksi Pemain : ${cfgPemain}\nLast Balance: ${cfgLastBalance}\n\n`;
    text += `No\tPeriode\tTanggal\tKeterangan\tStatus\tDebet\tKredit\tSaldo\tVia\n`;
    rows.forEach(r => {
      const canHavePeriode = isBeliOrMenang(r.keterangan, r.status);
      const periodeDisplay = canHavePeriode ? (r.periode || '') : '';
      text += `${r.no}\t${periodeDisplay}\t${r.tanggal}\t${r.keterangan}\t${r.status}\t${r.debet}\t${r.kredit}\t${r.saldo}\t${r.via}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Copy HTML script
  const handleCopyHtmlScript = () => {
    const html = generateRawHtmlScript();
    navigator.clipboard.writeText(html);
    setCopiedHtmlStatus(true);
    setTimeout(() => setCopiedHtmlStatus(false), 2000);
  };

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!tableContainerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableContainerRef.current, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `transaksi-livegame-${cfgPemain}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedRowId) || null;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* 1. TOP CONTROL BAR (Mirrors the screenshot aesthetic and controls) */}
      <div 
        style={{
          background: '#e9eef5',
          border: '1px solid #c4d3e2',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#cfd8e3]">
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#163b63' }} className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span>Generator Transaksi Livegame Casino</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#60758a' }}>
              • 24D • Roulette • 12D • Sicbo • Baccarat • Dragon Tiger • Dice 6 • Periode Fleksibel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPagingHeader(!showPagingHeader)}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                showPagingHeader ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              Header [ &gt;&gt; ]: {showPagingHeader ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => setShowWatermark(!showWatermark)}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                showWatermark ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              Watermark: {showWatermark ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Inputs Grid matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 items-end text-xs">
          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Jumlah baris</span>
            <input 
              type="number" 
              min={1} 
              max={50} 
              value={cfgRows}
              onChange={e => setCfgRows(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>User / Pemain</span>
            <input 
              type="text" 
              value={cfgPemain}
              onChange={e => setCfgPemain(e.target.value)}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#0000cc'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Pilih Game Casino</span>
            <select
              value={selectedGameCode}
              onChange={e => {
                const code = e.target.value;
                setSelectedGameCode(code);
                const game = LIVE_CASINO_PRESETS.find(g => g.code === code);
                if (game) setCfgDefaultPeriode(game.defaultPeriode);
              }}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#0d47a1'
              }}
            >
              {LIVE_CASINO_PRESETS.map(g => (
                <option key={g.code} value={g.code}>
                  {g.code} - {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Angka Periode</span>
            <input 
              type="text" 
              value={cfgDefaultPeriode}
              onChange={e => setCfgDefaultPeriode(e.target.value)}
              placeholder="Contoh: 2982451"
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Beli (Taruhan) min</span>
            <input 
              type="number" 
              min={1000} 
              step={1000} 
              value={cfgBetMin}
              onChange={e => setCfgBetMin(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Beli (Taruhan) max</span>
            <input 
              type="number" 
              min={1000} 
              step={1000} 
              value={cfgBetMax}
              onChange={e => setCfgBetMax(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Menang min</span>
            <input 
              type="number" 
              min={10000} 
              step={10000} 
              value={cfgWinMin}
              onChange={e => setCfgWinMin(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Menang max</span>
            <input 
              type="number" 
              min={10000} 
              step={10000} 
              value={cfgWinMax}
              onChange={e => setCfgWinMax(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#cfd8e3]">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                height: '32px',
                border: '0',
                borderRadius: '6px',
                background: '#0891b2',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isGenerating ? '0 0 16px rgba(8,145,178,0.9)' : 'none'
              }}
              className="hover:brightness-95 transition-all text-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isGenerating ? 'MEN-GENERATE...' : '⚡ BUAT OTOMATIS'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-8 px-3 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Tambah Baris</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-2.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Kembalikan format data contoh template asli"
            >
              <RotateCcw className="w-3 h-3 text-gray-500" />
              <span>Reset Template</span>
            </button>

            {selectedRowId && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicateRow}
                  className="h-8 px-2.5 rounded-md bg-cyan-50 border border-cyan-300 hover:bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Duplikat baris yang dipilih"
                >
                  <CopyCheck className="w-3.5 h-3.5" />
                  <span>Duplikat</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveRow('up')}
                  className="h-8 px-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center cursor-pointer"
                  title="Pindah ke atas"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveRow('down')}
                  className="h-8 px-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center cursor-pointer"
                  title="Pindah ke bawah"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelectedRow}
                  className="h-8 px-3 rounded-md bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Baris</span>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTableText}
              className="h-8 px-3 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-cyan-600" />}
              <span>{copiedStatus ? 'Tersalin!' : 'Salin Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyHtmlScript}
              className="h-8 px-3 rounded-md bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Salin persis format table script HTML yang diminta"
            >
              {copiedHtmlStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5 text-amber-700" />}
              <span>{copiedHtmlStatus ? 'HTML Tersalin!' : '</> Salin Format Script'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : '📥 Download PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KRONOLOGI TRANSAKSI: PASANG (BELI) -> MENANG -> WITHDRAW (TARIK DANA) */}
      <div className="p-3.5 bg-[#0f172a] border border-amber-500/40 rounded-xl space-y-3 font-mono text-xs shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              KRONOLOGI: PASANG JAM BERAPA ➔ MENANG JAM BERAPA ➔ WITHDRAW JAM BERAPA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetScenarioToNow}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="Setel jam pasang, menang, dan withdraw relatif terhadap jam saat ini"
            >
              <Clock className="w-3 h-3" />
              <span>Setel Jam Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleApplyChronology}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
              title="Terapkan jam & nominal ke Baris 1 (Withdraw), Baris 2 (Menang), Baris 3 (Beli)"
            >
              <Check className="w-3 h-3" />
              <span>Terapkan ke Tabel</span>
            </button>
          </div>
        </div>

        <p className="text-gray-300 text-[11px]">
          📌 <strong className="text-yellow-400">Status paling atas selalu Tarik Dana / Withdraw</strong>. Baris di bawahnya menampilkan jam ketika pemain memasang taruhan, jam saat menang, dan jam saat withdraw.
        </p>

        {/* 3 Connected Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Step 1: Pasang (Beli) */}
          <div className="p-2.5 rounded-lg bg-[#1e293b] border border-blue-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-[11px] flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 inline-flex items-center justify-center text-[10px]">1</span>
                <span>Pasang Taruhan (Beli)</span>
              </span>
              <span className="text-[10px] text-gray-400">Baris #3</span>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Jam Pasang (Tanggal &amp; Jam):</label>
              <input
                type="text"
                value={cfgBetTime}
                onChange={e => setCfgBetTime(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#0b1120] border border-blue-500/30 text-blue-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Nominal Pasang (Debet):</label>
              <input
                type="text"
                value={cfgBetAmount}
                onChange={e => setCfgBetAmount(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#0b1120] border border-blue-500/30 text-white font-mono text-xs font-bold"
              />
            </div>
          </div>

          {/* Step 2: Menang Games */}
          <div className="p-2.5 rounded-lg bg-[#1e293b] border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 inline-flex items-center justify-center text-[10px]">2</span>
                <span>Menang Games</span>
              </span>
              <span className="text-[10px] text-gray-400">Baris #2</span>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Jam Menang (Tanggal &amp; Jam):</label>
              <input
                type="text"
                value={cfgWinTime}
                onChange={e => setCfgWinTime(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#0b1120] border border-emerald-500/30 text-emerald-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Nominal Menang (Kredit):</label>
              <input
                type="text"
                value={cfgWinAmount}
                onChange={e => setCfgWinAmount(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#0b1120] border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold"
              />
            </div>
          </div>

          {/* Step 3: Withdraw (Tarik Dana) */}
          <div className="p-2.5 rounded-lg bg-[#1e293b] border-2 border-rose-500/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Tarik Dana (Withdraw)</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[9px] font-bold">
                BARIS #1 (TETAP ATAS)
              </span>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Jam Withdraw (Tanggal &amp; Jam):</label>
              <input
                type="text"
                value={cfgWdTime}
                onChange={e => setCfgWdTime(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#0b1120] border border-rose-500/30 text-rose-200 font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Nominal WD (Debet):</label>
                <input
                  type="text"
                  value={cfgWdAmount}
                  onChange={e => setCfgWdAmount(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#0b1120] border border-rose-500/30 text-yellow-300 font-mono text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Sisa Saldo:</label>
                <input
                  type="text"
                  value={cfgSisaSaldo}
                  onChange={e => setCfgSisaSaldo(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#0b1120] border border-rose-500/30 text-cyan-300 font-mono text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK EDITOR PANEL FOR SELECTED ROW (Ganti Game, Angka Periode & Keterangan) */}
      <div className="p-3.5 bg-[#0b1424] border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-cyan-300 uppercase">
              {selectedRow ? `EDIT BARIS #${selectedRow.no} (${selectedRow.keterangan || 'Baris'})` : 'PILIH BARIS PADA TABEL UNTUK GANTI PERIODE, PERMAINAN CASINO & KETERANGAN'}
            </span>
          </div>
          {selectedRow && (
            <span className="text-[11px] text-yellow-300">
              Periode Aktif: <strong className="text-white">{selectedRow.periode || '(Kosong/Withdraw/Deposit)'}</strong>
            </span>
          )}
        </div>

        {selectedRow ? (
          <div className="space-y-3">
            {/* If row 1 is selected, display protection note */}
            {selectedRow.id === rows[0]?.id && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-200 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>Baris #1 (TETAP STATUS WITHDRAW &amp; KETERANGAN TARIK DANA):</strong> Sesuai aturan, transaksi teratas selalu berstatus Withdraw dan Tarik Dana. Anda tetap bebas mengubah jam tanggal, nominal penarikan (debet), dan sisa saldo.
                </span>
              </div>
            )}
            {/* Quick Game Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 text-[11px] mr-1">Ganti Permainan:</span>
              {LIVE_CASINO_PRESETS.slice(0, 10).map((g) => {
                const isActive = selectedRow.gameCode === g.code;
                return (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleApplyGameToRow(g, false)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500 text-black shadow-md' 
                        : 'bg-[#15233c] text-cyan-300 hover:bg-[#1f355c] border border-cyan-500/30'
                    }`}
                  >
                    {g.code} ({g.name})
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const game = LIVE_CASINO_PRESETS.find(g => g.code === selectedRow.gameCode) || LIVE_CASINO_PRESETS[0];
                  handleApplyGameToRow(game, true);
                }}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer ml-auto"
                title="Terapkan game ini ke SEMUA baris dalam tabel"
              >
                Terapkan ke Semua Baris
              </button>
            </div>

            {/* Quick Actions (Menang, Beli, WD, Depo, Rolling) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
              <span className="text-gray-400 text-[11px] mr-1">Tipe Transaksi Cepat:</span>
              <button
                type="button"
                onClick={() => handleQuickAction('MENANG')}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Menang Games
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('BELI')}
                className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Beli Game
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('WD')}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Tarik Dana (Withdraw)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('DEPO')}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Deposit PGA
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('ROLLING')}
                className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Bonus Rollingan
              </button>
            </div>

            {/* Detailed Row Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 border-t border-white/5">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">No Urut:</label>
                <input
                  type="text"
                  value={selectedRow.no}
                  onChange={e => handleCellChange(selectedRow.id, 'no', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-yellow-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Angka Periode:</label>
                <input
                  type="text"
                  value={selectedRow.periodeNum}
                  onChange={e => handleCellChange(selectedRow.id, 'periodeNum', e.target.value)}
                  placeholder="2982451"
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Kode Game Casino:</label>
                <input
                  type="text"
                  value={selectedRow.gameCode}
                  onChange={e => handleCellChange(selectedRow.id, 'gameCode', e.target.value)}
                  placeholder="24D, RL, SB, BC"
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-cyan-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Gabungan Periode:</label>
                <input
                  type="text"
                  value={selectedRow.periode}
                  onChange={e => handleCellChange(selectedRow.id, 'periode', e.target.value)}
                  placeholder="2982451 - 24D"
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Tanggal &amp; Jam:</label>
                <input
                  type="text"
                  value={selectedRow.tanggal}
                  onChange={e => handleCellChange(selectedRow.id, 'tanggal', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-gray-400 block mb-1">Teks Keterangan:</label>
                <input
                  type="text"
                  value={selectedRow.keterangan}
                  onChange={e => handleCellChange(selectedRow.id, 'keterangan', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-cyan-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Status:</label>
                <select
                  value={selectedRow.status}
                  onChange={e => handleCellChange(selectedRow.id, 'status', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-red-400 font-bold text-xs"
                >
                  <option value="Menang">Menang</option>
                  <option value="Beli">Beli</option>
                  <option value="Withdraw">Withdraw</option>
                  <option value="Deposit">Deposit</option>
                  <option value="rolling">rolling</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Debet:</label>
                <input
                  type="text"
                  value={selectedRow.debet}
                  onChange={e => handleCellChange(selectedRow.id, 'debet', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Kredit:</label>
                <input
                  type="text"
                  value={selectedRow.kredit}
                  onChange={e => handleCellChange(selectedRow.id, 'kredit', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-blue-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Saldo:</label>
                <input
                  type="text"
                  value={selectedRow.saldo}
                  onChange={e => handleCellChange(selectedRow.id, 'saldo', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-blue-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Via:</label>
                <select
                  value={selectedRow.via}
                  onChange={e => handleCellChange(selectedRow.id, 'via', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-white text-xs"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="-">-</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">No. Tesi Link:</label>
                <input
                  type="text"
                  value={selectedRow.tesiId}
                  onChange={e => handleCellChange(selectedRow.id, 'tesiId', e.target.value)}
                  placeholder="13928284"
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Warna Baris:</label>
                <select
                  value={selectedRow.bgType}
                  onChange={e => handleCellChange(selectedRow.id, 'bgType', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#060b13] border border-white/20 text-gray-300 text-xs"
                >
                  <option value="gray">Abu-abu (#EFEFEF)</option>
                  <option value="peach">Peach (#FFDBB7)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-gray-400 text-xs">
            💡 <em>Klik salah satu baris pada tabel di bawah untuk mengubah angka periode, permainan casino (24D, RL, SB, BC, dll), dan teks keterangan dengan cepat.</em>
          </div>
        )}
      </div>

      {/* 3. TABS: PREVIEW VS RAW HTML SCRIPT */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('PREVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'PREVIEW'
              ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'bg-[#0f172a] text-gray-300 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Tampilan Visual Tabel (Preview &amp; Edit Langsung)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HTML_CODE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'HTML_CODE'
              ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'bg-[#0f172a] text-gray-300 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Kode Script HTML &lt;table&gt; Asli</span>
        </button>
      </div>

      {/* 4. VISUAL TABLE PREVIEW */}
      {activeTab === 'PREVIEW' && (
        <div className="p-3 bg-gray-800 rounded-xl overflow-x-auto shadow-inner">
          <div 
            ref={tableContainerRef}
            style={{
              position: 'relative',
              width: '100%',
              minWidth: '950px',
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '8px 10px 18px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'Verdana, Arial, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            {/* Watermark simulation */}
            {showWatermark && (
              <div 
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(-18deg)',
                  zIndex: 99,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  font: '900 44px/1 Arial, sans-serif',
                  letterSpacing: '4px',
                  color: 'rgba(210, 0, 0, 0.16)',
                  border: '7px solid rgba(210, 0, 0, 0.12)',
                  padding: '16px 28px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                SIMULASI / DEMO
              </div>
            )}

            {/* Paging link at top matching script: [ >> ] */}
            {showPagingHeader && (
              <div style={{ marginBottom: '4px' }}>
                <a 
                  href={`admin_transaksi.php?pemain2=${encodeURIComponent(cfgPemain)}&start=25&end=50&sta=Baru`}
                  onClick={(e) => e.preventDefault()}
                  style={{
                    fontFamily: 'Verdana, Arial, sans-serif',
                    fontSize: '11px',
                    color: '#0000ff',
                    textDecoration: 'underline',
                    fontWeight: 'normal'
                  }}
                >
                  [ &gt;&gt; ]
                </a>
              </div>
            )}

            {/* Title Header: Transaksi Pemain : saif / kontrol02 */}
            <div 
              style={{
                minHeight: '22px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2px',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '12px',
                fontWeight: 'bold',
                lineHeight: '14px',
                color: '#0000cc',
                marginBottom: '5px'
              }}
            >
              <span 
                style={{
                  width: '14px',
                  height: '14px',
                  marginRight: '2px',
                  flex: '0 0 14px',
                  backgroundImage: 'url("https://agwl2.admitoto.com/images/log.png")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                  display: 'inline-block'
                }}
              />
              <span>Transaksi Pemain :&nbsp;</span>
              <input
                type="text"
                value={cfgPemain}
                onChange={e => setCfgPemain(e.target.value)}
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#0000cc',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  minWidth: '60px',
                  width: `${Math.max(cfgPemain.length * 7.5, 50)}px`,
                  padding: '0 2px'
                }}
              />
              <span 
                style={{
                  width: '6px',
                  height: '6px',
                  marginLeft: '2px',
                  borderRadius: '50%',
                  background: '#5b8bd9',
                  boxShadow: '0 0 0 1px #c7d7f2 inset',
                  display: 'inline-block'
                }}
              />
            </div>

            {/* Table following user's script */}
            <table
              width="100%"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Verdana, Arial, sans-serif',
                fontSize: '11px',
                lineHeight: '14px'
              }}
            >
              <tbody>
                {/* Spacer row matching user script: <tr><td></td></tr> */}
                <tr>
                  <td colSpan={9} style={{ height: '2px', padding: '0' }}></td>
                </tr>

                {/* Header Row: #F5E363 */}
                <tr style={{ backgroundColor: '#F5E363' }}>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>No</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Periode</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Tanggal</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Keterangan</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Status</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Debet</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Kredit</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Saldo</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Via</b></span>
                  </td>
                </tr>

                {/* Subheader: Last Balance Row: #FFDBB7 */}
                <tr style={{ backgroundColor: '#FFDBB7' }}>
                  <td align="center" colSpan={5} style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>&nbsp;</b></span>
                  </td>
                  <td align="center" colSpan={2} style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Last Balance</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#0000FF', fontFamily: 'Verdana, Arial, sans-serif' }}>
                      <b>
                        <input
                          type="text"
                          value={cfgLastBalance}
                          onChange={e => setCfgLastBalance(e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: '#0000FF',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '80px'
                          }}
                        />
                      </b>
                    </span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>&nbsp;</b></span>
                  </td>
                </tr>

                {/* Data Rows */}
                {rows.map((row) => {
                  const isSelected = row.id === selectedRowId;
                  const rowBg = row.bgType === 'gray' ? '#EFEFEF' : '#FFDBB7';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      style={{
                        backgroundColor: rowBg,
                        cursor: 'pointer',
                        outline: isSelected ? '2px solid #0891b2' : 'none',
                        position: 'relative'
                      }}
                      title="Klik untuk memilih dan mengedit baris ini"
                    >
                      {/* No */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.no}
                          onChange={e => handleCellChange(row.id, 'no', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            color: '#000000',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '32px'
                          }}
                        />
                      </td>

                      {/* Periode */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        {!isBeliOrMenang(row.keterangan, row.status) ? (
                          <span style={{ fontFamily: 'Verdana, Arial, sans-serif', fontSize: '11px', color: '#000000' }}>&nbsp;</span>
                        ) : (
                          <input
                            type="text"
                            value={row.periode}
                            onChange={e => handleCellChange(row.id, 'periode', e.target.value)}
                            placeholder="3329460 - 24dspin"
                            style={{
                              fontFamily: 'Verdana, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 'normal',
                              color: '#000000',
                              textAlign: 'center',
                              border: 'none',
                              background: 'transparent',
                              outline: 'none',
                              width: '120px'
                            }}
                          />
                        )}
                      </td>

                      {/* Tanggal */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.tanggal}
                          onChange={e => handleCellChange(row.id, 'tanggal', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 'normal',
                            color: '#000000',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '145px'
                          }}
                        />
                      </td>

                      {/* Keterangan */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        {row.hasLink && row.tesiId ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <a
                              href={`javascript:popUp('user_detil.php?tesi=${row.tesiId}&amp;sta=Baru&amp;pemain=${cfgPemain}')`}
                              onClick={(e) => e.preventDefault()}
                              style={{
                                fontFamily: 'Verdana, Arial, sans-serif',
                                fontSize: '11px',
                                fontWeight: 'normal',
                                color: '#0000ff',
                                textDecoration: 'underline'
                              }}
                            >
                              <input
                                type="text"
                                value={row.keterangan}
                                onChange={e => handleCellChange(row.id, 'keterangan', e.target.value)}
                                style={{
                                  fontFamily: 'Verdana, Arial, sans-serif',
                                  fontSize: '11px',
                                  fontWeight: 'normal',
                                  color: '#0000ff',
                                  textDecoration: 'underline',
                                  textAlign: 'center',
                                  border: 'none',
                                  background: 'transparent',
                                  outline: 'none',
                                  width: `${Math.max(row.keterangan.length * 8.5, 120)}px`
                                }}
                              />
                            </a>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={row.keterangan}
                            onChange={e => handleCellChange(row.id, 'keterangan', e.target.value)}
                            style={{
                              fontFamily: 'Verdana, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 'normal',
                              color: '#000000',
                              textAlign: 'center',
                              border: 'none',
                              background: 'transparent',
                              outline: 'none',
                              width: `${Math.max(row.keterangan.length * 8.5, 90)}px`
                            }}
                          />
                        )}
                      </td>

                      {/* Status (red font, normal weight NOT bold) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.status}
                          onChange={e => handleCellChange(row.id, 'status', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 'normal',
                            color: 'red',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '65px'
                          }}
                        />
                      </td>

                      {/* Debet (black font) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.debet}
                          onChange={e => handleCellChange(row.id, 'debet', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            color: '#000000',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '80px'
                          }}
                        />
                      </td>

                      {/* Kredit (blue font) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.kredit}
                          onChange={e => handleCellChange(row.id, 'kredit', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            color: '#0000FF',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '80px'
                          }}
                        />
                      </td>

                      {/* Saldo (blue font) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.saldo}
                          onChange={e => handleCellChange(row.id, 'saldo', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            color: '#0000FF',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '95px'
                          }}
                        />
                      </td>

                      {/* Via */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <input
                          type="text"
                          value={row.via}
                          onChange={e => handleCellChange(row.id, 'via', e.target.value)}
                          style={{
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px',
                            color: '#000000',
                            textAlign: 'center',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '55px'
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: RAW HTML CODE VIEW */}
      {activeTab === 'HTML_CODE' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Kode HTML &lt;table&gt; Siap Dipakai / Di-paste:</span>
            <button
              type="button"
              onClick={handleCopyHtmlScript}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHtmlStatus ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHtmlStatus ? 'Tersalin!' : 'Salin Semua Kode HTML'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={generateRawHtmlScript()}
            rows={18}
            className="w-full p-4 rounded-xl bg-[#070d18] border border-amber-500/40 text-amber-300 font-mono text-xs leading-relaxed focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
