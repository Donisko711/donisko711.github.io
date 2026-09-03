import React, { useState, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  Code, 
  Gamepad2, 
  SlidersHorizontal,
  Calendar,
  Clock,
  DollarSign,
  User,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Wand2,
  Calculator,
  Shuffle
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface IdnSlotRow {
  id: string;
  gameId: string;
  provider: string;
  roundId: string;
  extId: string;
  nickname: string;
  operator: string;
  operatorUrl: string;
  timestamp: string; // "03 Sep 2026 - 15:00:37"
  type: 'Credit' | 'Debit' | 'Refund' | 'Rollback Win' | 'Rollback Lose' | 'Promotion';
  amount: number; // numeric, e.g. 2160
  balance: number; // numeric, e.g. 120000
  status: boolean; // true = thumbs up
}

export const POPULAR_GAMES: { name: string; provider: string }[] = [
  { name: 'Mahjong Wins Triple Pot', provider: 'Pragmatic Play' },
  { name: 'Gates Of Olympus 1000', provider: 'Pragmatic Play' },
  { name: 'Sugar Rush 1000', provider: 'Pragmatic Play' },
  { name: 'Mahjong Wins 3 - Black Scatter', provider: 'Pragmatic Play' },
  { name: 'Sweet Bonanza 1000', provider: 'Pragmatic Play' },
  { name: 'Starlight Princess 1000', provider: 'Pragmatic Play' },
  { name: 'Gates of Olympus', provider: 'Pragmatic Play' },
  { name: 'Sweet Bonanza', provider: 'Pragmatic Play' },
  { name: 'Wild West Gold', provider: 'Pragmatic Play' },
  { name: 'Gates of Gatot Kaca 1000', provider: 'Pragmatic Play' },
  { name: 'Mahjong Ways 2', provider: 'PGSoft' },
  { name: 'Mahjong Ways', provider: 'PGSoft' },
  { name: 'Treasures of Aztec', provider: 'PGSoft' },
  { name: 'Lucky Neko', provider: 'PGSoft' },
  { name: 'Wild Bandito', provider: 'PGSoft' },
  { name: 'Koi Gate', provider: 'Habanero' },
  { name: 'Fa Cai Shen Deluxe', provider: 'Habanero' }
];

export const PROVIDERS = [
  'Pragmatic Play',
  'PGSoft',
  'Habanero',
  'IDNSLOT',
  'Playtech',
  'Microgaming',
  'No Limit City',
  'Spadegaming',
  'Red Tiger',
  'Fastspin',
  'Booming Games',
  'Top Trend Gaming'
];

export const RANDOM_NICKNAMES = [
  'kuntulkuda16', 'evo07', 'erwin12345', 'aryoangin', 'dengedeng12',
  'cuanmaxwin88', 'bocahjp77', 'zeus_petir77', 'slottergacor99',
  'jossgacor99', 'hoki_selalu', 'sensational88', 'megawin_id',
  'rajajp2026', 'pandagacor', 'sultan99', 'jackpot_hunter', 'petir_x500'
];

export const RANDOM_OPERATORS = [
  'ITWLAD - lelaa', 'ITWLAD - rina', 'ITWLAD - dimas', 'ITWLAD - doni', 'ITWLAD - angga'
];

export const IdnSlotRoundEditor: React.FC = () => {
  // Mode: 2 baris persis screenshot atau tabel lengkap 10 baris
  const [viewMode, setViewMode] = useState<'2_ROWS' | 'FULL_TABLE'>('2_ROWS');
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);
  const [showPagination, setShowPagination] = useState<boolean>(false);

  // General Settings
  const [selectedGame, setSelectedGame] = useState<string>('Mahjong Wins Triple Pot');
  const [selectedProvider, setSelectedProvider] = useState<string>('Pragmatic Play');
  const [sharedRoundId, setSharedRoundId] = useState<string>('96526842218086');
  const [playerNickname, setPlayerNickname] = useState<string>('kuntulkuda16');
  const [operatorText, setOperatorText] = useState<string>('ITWLAD - lelaa');

  // Generator State
  const [startBalance, setStartBalance] = useState<number>(119840);
  const [betAmount, setBetAmount] = useState<number>(2000);
  const [winAmount, setWinAmount] = useState<number>(2160);
  const [spinDateStr, setSpinDateStr] = useState<string>('03 Sep 2026');
  const [betTimeStr, setBetTimeStr] = useState<string>('15:00:31');
  const [winTimeStr, setWinTimeStr] = useState<string>('15:00:37');

  // State Table Rows (Default is the exact 2 rows in user image.png)
  const [rows, setRows] = useState<IdnSlotRow[]>([
    {
      id: 'row-credit-1',
      gameId: 'Mahjong Wins Triple Pot',
      provider: 'Pragmatic Play',
      roundId: '96526842218086',
      extId: '846a992925b7da3f0a7c6f2240',
      nickname: 'kuntulkuda16',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:00:37',
      type: 'Credit',
      amount: 2160,
      balance: 120000,
      status: true
    },
    {
      id: 'row-debit-2',
      gameId: 'Mahjong Wins Triple Pot',
      provider: 'Pragmatic Play',
      roundId: '96526842218086',
      extId: '846a99291fcc0b96169af25ea8',
      nickname: 'kuntulkuda16',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:00:31',
      type: 'Debit',
      amount: 2000,
      balance: 117840,
      status: true
    }
  ]);

  // Additional 8 rows from HTML template when toggled to full table
  const fullSampleRows: IdnSlotRow[] = [
    {
      id: 'row-sample-3',
      gameId: 'Sugar Rush 1000',
      provider: 'Pragmatic Play',
      roundId: '96527084112086',
      extId: '846a992a2cf0d96c0497ee3f78',
      nickname: 'evo07',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:05:00',
      type: 'Credit',
      amount: 10590,
      balance: 15503,
      status: true
    },
    {
      id: 'row-sample-4',
      gameId: 'Mahjong Wins 3 - Black Scatter',
      provider: 'Pragmatic Play',
      roundId: '69837200969165',
      extId: '1636a992a2c373b2d254c4193e6',
      nickname: 'erwin12345',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:05:00',
      type: 'Debit',
      amount: 1000,
      balance: 10856,
      status: true
    },
    {
      id: 'row-sample-5',
      gameId: 'Mahjong Wins 3 - Black Scatter',
      provider: 'Pragmatic Play',
      roundId: '84335137553125',
      extId: '1236a992a2c6463d87dc8957263',
      nickname: 'aryoangin',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:05:00',
      type: 'Debit',
      amount: 4000,
      balance: 243169,
      status: true
    },
    {
      id: 'row-sample-6',
      gameId: 'Gates Of Olympus 1000',
      provider: 'Pragmatic Play',
      roundId: '69837199236165',
      extId: '1636a992a2b373b2d254c419336',
      nickname: 'dengedeng12',
      operator: 'ITWLAD - lelaa',
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: '03 Sep 2026 - 15:04:59',
      type: 'Credit',
      amount: 1000,
      balance: 140135,
      status: true
    }
  ];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Helper Random Hex
  const generateRandomHex = (length = 24) => {
    let result = '846a9929';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length - 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomRoundId = () => {
    return '965' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
  };

  // Format IDR Number e.g. 2,160
  const formatIDR = (num: number) => {
    return Number(num || 0).toLocaleString('en-US');
  };

  // Generate Otomatis: Nama Game, Provider, Nickname, Round ID, Saldo Awal, Nominal Bet, Nominal Menang & Saldo
  const handleGenerateOtomatis = () => {
    // 1. Random Game & Provider
    const randomGameObj = POPULAR_GAMES[Math.floor(Math.random() * POPULAR_GAMES.length)];
    const game = randomGameObj.name;
    const provider = randomGameObj.provider;

    // 2. Random Nickname & Operator
    const nick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const op = RANDOM_OPERATORS[Math.floor(Math.random() * RANDOM_OPERATORS.length)];

    // 3. Random 14-digit Round ID
    const prefixes = ['965', '698', '843', '712'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    const newRound = pfx + Math.floor(10000000000 + Math.random() * 90000000000).toString();

    // 4. Random Nominal Bet (Debit)
    const betOptions = [800, 1000, 1200, 1600, 2000, 2400, 3000, 4000, 5000, 6000, 8000, 10000];
    const bet = betOptions[Math.floor(Math.random() * betOptions.length)];

    // 5. Random Nominal Menang (Credit)
    const winMultipliers = [
      1.08, // seperti contoh gambar (bet 2.000 menang 2.160)
      1.35,
      2.4,
      5.2,
      12.5,
      24.0,
      48.0,
      120.0,
      250.0,
      500.0
    ];
    const mult = winMultipliers[Math.floor(Math.random() * winMultipliers.length)];
    let win = Math.round((bet * mult) / 10) * 10;
    if (mult === 1.08 && bet === 2000) win = 2160;

    // 6. Saldo Awal (sebelum bet)
    const startBalFactors = [40, 60, 100, 150, 250, 400];
    const factor = startBalFactors[Math.floor(Math.random() * startBalFactors.length)];
    let start = bet * factor + (Math.floor(Math.random() * 90) * 10);
    if (bet === 2000 && mult === 1.08) start = 119840;

    // 7. Waktu Bet & Win (jeda 4-7 detik realistis)
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const baseSec = Math.floor(Math.random() * 45);
    const secDebit = String(baseSec).padStart(2, '0');
    const secCredit = String(baseSec + 4 + Math.floor(Math.random() * 4)).padStart(2, '0');
    const betTime = `${h}:${m}:${secDebit}`;
    const winTime = `${h}:${m}:${secCredit}`;

    const debitBal = start - bet;
    const creditBal = debitBal + win;

    const ext1 = generateRandomHex();
    const ext2 = generateRandomHex();

    // Update Input States
    setSelectedGame(game);
    setSelectedProvider(provider);
    setPlayerNickname(nick);
    setOperatorText(op);
    setSharedRoundId(newRound);
    setStartBalance(start);
    setBetAmount(bet);
    setWinAmount(win);
    setBetTimeStr(betTime);
    setWinTimeStr(winTime);

    // Update Table Rows
    setRows(prev => {
      const updated = [...prev];
      updated[0] = {
        id: updated[0]?.id || 'row-credit-1',
        gameId: game,
        provider: provider,
        roundId: newRound,
        extId: ext1,
        nickname: nick,
        operator: op,
        operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
        timestamp: `${spinDateStr} - ${winTime}`,
        type: 'Credit',
        amount: win,
        balance: creditBal,
        status: true
      };
      updated[1] = {
        id: updated[1]?.id || 'row-debit-2',
        gameId: game,
        provider: provider,
        roundId: newRound,
        extId: ext2,
        nickname: nick,
        operator: op,
        operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
        timestamp: `${spinDateStr} - ${betTime}`,
        type: 'Debit',
        amount: bet,
        balance: debitBal,
        status: true
      };
      return updated;
    });
  };

  // Auto Recalculate 2 Slot Transactions
  const handleAutoCalculate = () => {
    const newDebitBalance = startBalance - betAmount;
    const newCreditBalance = newDebitBalance + winAmount;

    setRows(prev => {
      const updated = [...prev];
      if (updated.length >= 2) {
        // Row 1 is Credit (Win)
        updated[0] = {
          ...updated[0],
          gameId: selectedGame,
          provider: selectedProvider,
          roundId: sharedRoundId,
          nickname: playerNickname,
          operator: operatorText,
          timestamp: `${spinDateStr} - ${winTimeStr}`,
          type: 'Credit',
          amount: winAmount,
          balance: newCreditBalance
        };
        // Row 2 is Debit (Bet)
        updated[1] = {
          ...updated[1],
          gameId: selectedGame,
          provider: selectedProvider,
          roundId: sharedRoundId,
          nickname: playerNickname,
          operator: operatorText,
          timestamp: `${spinDateStr} - ${betTimeStr}`,
          type: 'Debit',
          amount: betAmount,
          balance: newDebitBalance
        };
      }
      return updated;
    });
  };

  // Apply Presets
  const handleApplyPreset = (presetName: string) => {
    const newRound = generateRandomRoundId();
    setSharedRoundId(newRound);

    let game = selectedGame;
    let bet = 2000;
    let win = 2160;
    let start = 119840;

    if (presetName === 'IMAGE_EXACT') {
      game = 'Mahjong Wins Triple Pot';
      bet = 2000;
      win = 2160;
      start = 119840;
    } else if (presetName === 'OLYMPUS_WIN') {
      game = 'Gates Of Olympus 1000';
      bet = 4000;
      win = 480000;
      start = 550000;
    } else if (presetName === 'SUGAR_MAX') {
      game = 'Sugar Rush 1000';
      bet = 5000;
      win = 2500000;
      start = 820000;
    } else if (presetName === 'BLACK_SCATTER') {
      game = 'Mahjong Wins 3 - Black Scatter';
      bet = 2000;
      win = 1450000;
      start = 300000;
    } else if (presetName === 'BONANZA') {
      game = 'Sweet Bonanza 1000';
      bet = 3000;
      win = 96000;
      start = 240000;
    }

    setSelectedGame(game);
    setBetAmount(bet);
    setWinAmount(win);
    setStartBalance(start);

    const debitBal = start - bet;
    const creditBal = debitBal + win;

    const ext1 = generateRandomHex();
    const ext2 = generateRandomHex();

    setRows([
      {
        id: 'row-credit-1',
        gameId: game,
        provider: 'Pragmatic Play',
        roundId: newRound,
        extId: ext1,
        nickname: playerNickname,
        operator: operatorText,
        operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
        timestamp: `${spinDateStr} - ${winTimeStr}`,
        type: 'Credit',
        amount: win,
        balance: creditBal,
        status: true
      },
      {
        id: 'row-debit-2',
        gameId: game,
        provider: 'Pragmatic Play',
        roundId: newRound,
        extId: ext2,
        nickname: playerNickname,
        operator: operatorText,
        operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
        timestamp: `${spinDateStr} - ${betTimeStr}`,
        type: 'Debit',
        amount: bet,
        balance: debitBal,
        status: true
      }
    ]);
  };

  // Update Individual Row Cell
  const handleCellChange = (id: string, field: keyof IdnSlotRow, val: any) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: val } : r)));
  };

  // Add Row
  const handleAddRow = () => {
    const newId = 'row-' + Date.now();
    const lastRow = rows[rows.length - 1];
    const newRow: IdnSlotRow = {
      id: newId,
      gameId: selectedGame,
      provider: selectedProvider,
      roundId: sharedRoundId,
      extId: generateRandomHex(),
      nickname: playerNickname,
      operator: operatorText,
      operatorUrl: 'https://regh.idnlive.live/operator-detail/104967852',
      timestamp: `${spinDateStr} - 15:00:00`,
      type: 'Credit',
      amount: 1000,
      balance: (lastRow ? lastRow.balance : 100000) + 1000,
      status: true
    };
    setRows([...rows, newRow]);
  };

  // Delete Row
  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!tableRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `IDN_Slot_${selectedGame.replace(/\s+/g, '_')}_${playerNickname}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Text Summary
  const handleCopySummary = () => {
    const text = rows.map((r, i) => 
      `[${r.type.toUpperCase()}] ${r.gameId} (${r.provider})\nRound ID: ${r.roundId} | Ext ID: ${r.extId}\nUser: ${r.nickname} (${r.operator})\nWaktu: ${r.timestamp}\nAmount: IDR ${formatIDR(r.amount)} | Balance: IDR ${formatIDR(r.balance)}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="idn-slot-editor-section">
      {/* ========================================================= */}
      {/* 1. CONTROL PANEL / GENERATOR FOR 2 TRANSAKSI SLOT         */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/40 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-500/30">
                  FORMAT 2: DETAIL RONDE GAME SLOT
                </span>
                <span className="text-[11px] text-yellow-400 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  IDN METRONIC THEME
                </span>
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide font-sans mt-0.5">
                Edit 2 Transaksi Slot (Debit Bet &amp; Credit Kemenangan)
              </h2>
              <p className="text-xs text-gray-300 font-mono">
                Klik <b className="text-cyan-300">"GENERATE OTOMATIS"</b> untuk mengacak langsung Nama Game, Provider, Nickname, Round ID, Saldo Awal, Nominal Bet, dan Nominal Menang.
              </p>
            </div>
          </div>

          {/* View Mode & Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1 rounded-xl bg-[#050811] border border-white/10 flex items-center gap-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('2_ROWS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === '2_ROWS' 
                    ? 'bg-cyan-500 text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2 Baris (Persis Gambar)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('FULL_TABLE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'FULL_TABLE' 
                    ? 'bg-cyan-500 text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tabel Lengkap (10 Baris)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showFilterBar 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFilterBar ? 'Filter Atas: Tampil' : 'Filter Atas: Sembunyi'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#060a14] border border-white/5">
          <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Preset Cepat:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('IMAGE_EXACT')}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            🎯 Mahjong Wins Triple Pot (Sesuai Gambar)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('OLYMPUS_WIN')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            ⚡ Olympus 1000 (Menang Petir Rp 480k)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('BLACK_SCATTER')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            🀄 Mahjong Wins 3 Black Scatter (Rp 1.45M)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('SUGAR_MAX')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            🍬 Sugar Rush 1000 (Free Spin Rp 2.5M)
          </button>
        </div>

        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Game Selection */}
          <div className="space-y-1">
            <label className="text-gray-300 font-bold flex items-center gap-1">
              <span>Nama Game</span>
            </label>
            <input
              type="text"
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setRows(prev => prev.map(r => ({ ...r, gameId: e.target.value })));
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white font-sans text-xs outline-none focus:border-cyan-400"
              placeholder="Contoh: Mahjong Wins Triple Pot"
            />
            {/* Quick Game Dropdown */}
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                const found = POPULAR_GAMES.find(g => g.name === e.target.value);
                if (found) {
                  setSelectedProvider(found.provider);
                  setRows(prev => prev.map(r => ({ ...r, gameId: found.name, provider: found.provider })));
                } else {
                  setRows(prev => prev.map(r => ({ ...r, gameId: e.target.value })));
                }
              }}
              className="w-full px-2.5 py-1 rounded-lg bg-[#070d1a] border border-white/10 text-gray-400 text-[11px] outline-none cursor-pointer"
            >
              <option value="">-- Pilih Rekomendasi Game --</option>
              {POPULAR_GAMES.map(g => (
                <option key={g.name} value={g.name}>{g.name} ({g.provider})</option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div className="space-y-1">
            <label className="text-gray-300 font-bold">Provider Game</label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setRows(prev => prev.map(r => ({ ...r, provider: e.target.value })));
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white font-sans text-xs outline-none focus:border-cyan-400 cursor-pointer"
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500">Tampil sebagai sub-text di bawah judul game</span>
          </div>

          {/* Nickname & Operator */}
          <div className="space-y-1">
            <label className="text-gray-300 font-bold">Nickname Member</label>
            <input
              type="text"
              value={playerNickname}
              onChange={(e) => {
                setPlayerNickname(e.target.value);
                setRows(prev => prev.map(r => ({ ...r, nickname: e.target.value })));
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white font-mono text-xs outline-none focus:border-cyan-400"
              placeholder="kuntulkuda16"
            />
            <input
              type="text"
              value={operatorText}
              onChange={(e) => {
                setOperatorText(e.target.value);
                setRows(prev => prev.map(r => ({ ...r, operator: e.target.value })));
              }}
              className="w-full px-2.5 py-1 rounded-lg bg-[#070d1a] border border-white/10 text-cyan-300 text-[11px] font-mono outline-none"
              placeholder="Operator: ITWLAD - lelaa"
            />
          </div>

          {/* Round ID */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-bold">Round ID (Identik)</label>
              <button
                type="button"
                onClick={() => {
                  const newRid = generateRandomRoundId();
                  setSharedRoundId(newRid);
                  setRows(prev => prev.map(r => ({ ...r, roundId: newRid })));
                }}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                Acak ID
              </button>
            </div>
            <input
              type="text"
              value={sharedRoundId}
              onChange={(e) => {
                setSharedRoundId(e.target.value);
                setRows(prev => prev.map(r => ({ ...r, roundId: e.target.value })));
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-yellow-300 font-mono text-xs outline-none focus:border-cyan-400 font-bold"
            />
            <span className="text-[10px] text-gray-500">Kedua baris (Bet &amp; Win) memiliki Round ID yang sama</span>
          </div>
        </div>

        {/* Financial & Time Calculation Bar */}
        <div className="p-4 rounded-xl bg-[#050811] border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
          {/* Tanggal & Waktu */}
          <div>
            <label className="text-gray-400 text-[11px]">Tanggal</label>
            <input
              type="text"
              value={spinDateStr}
              onChange={(e) => setSpinDateStr(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-white/10 text-white text-xs outline-none"
              placeholder="03 Sep 2026"
            />
          </div>

          <div>
            <label className="text-gray-400 text-[11px]">Waktu Bet (Debit)</label>
            <input
              type="text"
              value={betTimeStr}
              onChange={(e) => setBetTimeStr(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-rose-500/30 text-rose-300 text-xs outline-none"
              placeholder="15:00:31"
            />
          </div>

          <div>
            <label className="text-gray-400 text-[11px]">Waktu Win (Credit)</label>
            <input
              type="text"
              value={winTimeStr}
              onChange={(e) => setWinTimeStr(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-emerald-500/30 text-emerald-300 text-xs outline-none"
              placeholder="15:00:37"
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="text-gray-400 text-[11px]">Saldo Awal (Sebelum Bet)</label>
            <input
              type="number"
              value={startBalance}
              onChange={(e) => setStartBalance(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-white/10 text-yellow-300 text-xs outline-none"
            />
          </div>

          {/* Nominal Bet (Debit) */}
          <div>
            <label className="text-gray-400 text-[11px]">Nominal Bet (Debit)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-rose-500/40 text-rose-300 font-bold text-xs outline-none"
            />
          </div>

          {/* Nominal Win (Credit) */}
          <div>
            <label className="text-gray-400 text-[11px]">Nominal Menang (Credit)</label>
            <input
              type="number"
              value={winAmount}
              onChange={(e) => setWinAmount(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090e1a] border border-emerald-500/40 text-emerald-300 font-bold text-xs outline-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateOtomatis}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-xs font-mono transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>GENERATE OTOMATIS (GAME, ID, BET, WIN &amp; SALDO)</span>
            </button>

            <button
              type="button"
              onClick={handleAutoCalculate}
              title="Hitung ulang saldo debit & credit berdasarkan angka yang Anda ketik manual"
              className="px-3.5 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253d] text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hitung Saldo</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253d] text-gray-200 hover:text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tambah Baris Transaksi</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a253d] text-gray-200 hover:text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedSummary ? 'Tersalin!' : 'Salin Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'DOWNLOAD PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE IDN / METRONIC TEMPLATE PREVIEW (PIXEL-PERFECT)    */}
      {/* ========================================================= */}
      <div className="p-3 sm:p-5 bg-[#0e1626] rounded-2xl border border-white/10 shadow-2xl overflow-x-auto">
        <div className="text-[11px] font-mono text-cyan-300 mb-2 flex items-center justify-between">
          <span>* Klik langsung teks/angka di dalam tabel preview di bawah jika ingin mengedit manual secara instan:</span>
          <span className="text-gray-400">Dimensi Asli: IDN Live Admin Metronic Datatable</span>
        </div>

        {/* Capture Container for html2canvas */}
        <div 
          ref={tableRef}
          style={{
            minWidth: '1080px',
            backgroundColor: '#ffffff',
            color: '#3f4254',
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            padding: '20px 25px 25px',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Metronic Filter Controls (Exact match to user script) */}
          {showFilterBar && (
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #ebedf3', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Left controls: Open, Reload, DateRange */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    style={{
                      height: '34px',
                      padding: '0 14px',
                      backgroundColor: '#e1f0ff',
                      color: '#3699ff',
                      border: '0',
                      borderRadius: '0.42rem',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900 }}>›</span>
                    <span>Open</span>
                  </button>

                  <button 
                    type="button" 
                    style={{
                      height: '34px',
                      padding: '0 14px',
                      backgroundColor: '#c9f7f5',
                      color: '#1bc5bd',
                      border: '0',
                      borderRadius: '0.42rem',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900 }}>↻</span>
                    <span>Reload</span>
                  </button>

                  {/* Date Range Strict */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e4e6ef', borderRadius: '0.42rem', overflow: 'hidden', height: '34px' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={`${spinDateStr} 12:05 PM`} 
                      style={{ border: 'none', padding: '0 10px', fontSize: '11.5px', color: '#3f4254', width: '135px', outline: 'none', background: '#fff' }} 
                    />
                    <span style={{ padding: '0 8px', background: '#f3f6f9', borderLeft: '1px solid #e4e6ef', borderRight: '1px solid #e4e6ef', height: '100%', display: 'flex', alignItems: 'center', color: '#7e8299', fontSize: '12px' }}>
                      📅
                    </span>
                    <input 
                      type="text" 
                      readOnly 
                      value={`${spinDateStr} 03:05 PM`} 
                      style={{ border: 'none', padding: '0 10px', fontSize: '11.5px', color: '#3f4254', width: '135px', outline: 'none', background: '#fff' }} 
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select 
                    style={{
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid #e4e6ef',
                      borderRadius: '0.42rem',
                      fontSize: '11.5px',
                      color: '#3f4254',
                      background: '#fff',
                      outline: 'none',
                      minWidth: '110px'
                    }}
                  >
                    <option value="">-- All Status --</option>
                    <option value="valid">Valid</option>
                    <option value="invalid">Invalid</option>
                  </select>

                  {/* Type Dropdown */}
                  <select 
                    style={{
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid #e4e6ef',
                      borderRadius: '0.42rem',
                      fontSize: '11.5px',
                      color: '#3f4254',
                      background: '#fff',
                      outline: 'none',
                      minWidth: '105px'
                    }}
                  >
                    <option value="">-- All Type --</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                    <option value="refund">Refund</option>
                  </select>

                  {/* Provider Dropdown */}
                  <select 
                    value={selectedProvider}
                    onChange={e => setSelectedProvider(e.target.value)}
                    style={{
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid #e4e6ef',
                      borderRadius: '0.42rem',
                      fontSize: '11.5px',
                      color: '#3f4254',
                      background: '#fff',
                      outline: 'none',
                      minWidth: '135px'
                    }}
                  >
                    <option value="">-- Select Provider --</option>
                    {PROVIDERS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Right controls: Operator, Game search, Nickname search, Round ID */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <div style={{ height: '34px', padding: '0 10px', border: '1px solid #e4e6ef', borderRadius: '0.42rem', fontSize: '11.5px', color: '#3f4254', display: 'flex', alignItems: 'center', background: '#fff' }}>
                    <span>{operatorText}</span>
                  </div>

                  <div style={{ height: '34px', padding: '0 10px', border: '1px solid #e4e6ef', borderRadius: '0.42rem', fontSize: '11.5px', color: '#7e8299', display: 'flex', alignItems: 'center', background: '#fff', minWidth: '140px' }}>
                    <span>Search by Game</span>
                  </div>

                  <div style={{ height: '34px', padding: '0 10px', border: '1px solid #e4e6ef', borderRadius: '0.42rem', fontSize: '11.5px', color: '#7e8299', display: 'flex', alignItems: 'center', background: '#fff', minWidth: '140px' }}>
                    <span>🔍 Search by Nickname</span>
                  </div>

                  <div style={{ height: '34px', padding: '0 10px', border: '1px solid #e4e6ef', borderRadius: '0.42rem', fontSize: '11.5px', color: '#7e8299', display: 'flex', alignItems: 'center', background: '#fff', minWidth: '140px' }}>
                    <span>🔍 Search by Round ID</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* THE DATATABLE TABLE */}
          <div style={{ border: '1px solid #ebedf3', borderRadius: '4px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              {/* THEAD */}
              <thead>
                <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #ebedf3', height: '42px' }}>
                  <th style={{ width: '28px', padding: '8px 4px 8px 12px' }}></th>
                  <th style={{ width: '190px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Game
                  </th>
                  <th style={{ width: '270px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Round ID
                  </th>
                  <th style={{ width: '190px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    User
                  </th>
                  <th style={{ width: '180px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Timestamp
                  </th>
                  <th style={{ width: '120px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                    Type
                  </th>
                  <th style={{ width: '190px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Amount
                  </th>
                  <th style={{ width: '70px', padding: '8px 12px', color: '#b5b5c3', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                    Status
                  </th>
                </tr>
              </thead>

              {/* TBODY */}
              <tbody>
                {(viewMode === '2_ROWS' ? rows.slice(0, 2) : rows).map((row, idx) => {
                  const isCredit = row.type === 'Credit';
                  const isDebit = row.type === 'Debit';
                  const isEven = idx % 2 === 0;

                  return (
                    <tr 
                      key={row.id}
                      style={{
                        backgroundColor: isEven ? '#ffffff' : '#fcfdfe',
                        borderBottom: '1px solid #ebedf3',
                        height: '52px',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Subtable Toggle (Chevron >) */}
                      <td style={{ padding: '8px 4px 8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{ color: '#3699ff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                          ›
                        </span>
                      </td>

                      {/* Game & Provider */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                        <input
                          type="text"
                          value={row.gameId}
                          onChange={e => handleCellChange(row.id, 'gameId', e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#3f4254',
                            fontWeight: 600,
                            fontSize: '12px',
                            width: '100%',
                            outline: 'none',
                            padding: '0'
                          }}
                        />
                        <input
                          type="text"
                          value={row.provider}
                          onChange={e => handleCellChange(row.id, 'provider', e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#b5b5c3',
                            fontSize: '11px',
                            width: '100%',
                            outline: 'none',
                            padding: '0',
                            marginTop: '1px'
                          }}
                        />
                      </td>

                      {/* Round ID & Ext ID */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                        <input
                          type="text"
                          value={row.roundId}
                          onChange={e => handleCellChange(row.id, 'roundId', e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#3f4254',
                            fontWeight: 500,
                            fontSize: '12px',
                            width: '100%',
                            outline: 'none',
                            padding: '0',
                            fontFamily: 'monospace'
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', color: '#b5b5c3', fontSize: '11px', marginTop: '1px' }}>
                          <span>Ext. ID :&nbsp;</span>
                          <input
                            type="text"
                            value={row.extId}
                            onChange={e => handleCellChange(row.id, 'extId', e.target.value)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#b5b5c3',
                              fontSize: '11px',
                              width: 'calc(100% - 50px)',
                              outline: 'none',
                              padding: '0',
                              fontFamily: 'monospace'
                            }}
                          />
                        </div>
                      </td>

                      {/* User & Operator */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                        <input
                          type="text"
                          value={row.nickname}
                          onChange={e => handleCellChange(row.id, 'nickname', e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#3f4254',
                            fontWeight: 500,
                            fontSize: '12px',
                            width: '100%',
                            outline: 'none',
                            padding: '0'
                          }}
                        />
                        <a 
                          href={row.operatorUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            color: '#3699ff',
                            textDecoration: 'none',
                            fontSize: '11px',
                            display: 'block',
                            marginTop: '1px'
                          }}
                        >
                          {row.operator}
                        </a>
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <input
                          type="text"
                          value={row.timestamp}
                          onChange={e => handleCellChange(row.id, 'timestamp', e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#3f4254',
                            fontSize: '12px',
                            width: '100%',
                            outline: 'none',
                            padding: '0'
                          }}
                        />
                      </td>

                      {/* Type (Credit / Debit) */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span 
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isCredit ? '#1bc5bd' : isDebit ? '#f64e60' : '#3699ff',
                              display: 'inline-block'
                            }}
                          />
                          <select
                            value={row.type}
                            onChange={e => handleCellChange(row.id, 'type', e.target.value)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: isCredit ? '#1bc5bd' : isDebit ? '#f64e60' : '#3699ff',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              outline: 'none',
                              cursor: 'pointer',
                              padding: '0'
                            }}
                          >
                            <option value="Credit" style={{ color: '#1bc5bd' }}>Credit</option>
                            <option value="Debit" style={{ color: '#f64e60' }}>Debit</option>
                            <option value="Refund" style={{ color: '#3699ff' }}>Refund</option>
                            <option value="Rollback Win" style={{ color: '#8950fc' }}>Rollback Win</option>
                            <option value="Promotion" style={{ color: '#ffa800' }}>Promotion</option>
                          </select>
                        </div>
                      </td>

                      {/* Amount & Balance */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: '#3f4254', fontSize: '12px', marginRight: '4px' }}>IDR</span>
                          <input
                            type="text"
                            value={formatIDR(row.amount)}
                            onChange={e => {
                              const cleaned = Number(e.target.value.replace(/[^0-9]/g, ''));
                              handleCellChange(row.id, 'amount', cleaned);
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              fontWeight: 600,
                              color: '#3f4254',
                              fontSize: '12px',
                              width: '100%',
                              outline: 'none',
                              padding: '0'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#b5b5c3', fontSize: '11px', marginTop: '1px' }}>
                          <span>Balance : IDR&nbsp;</span>
                          <input
                            type="text"
                            value={formatIDR(row.balance)}
                            onChange={e => {
                              const cleaned = Number(e.target.value.replace(/[^0-9]/g, ''));
                              handleCellChange(row.id, 'balance', cleaned);
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#b5b5c3',
                              fontSize: '11px',
                              width: 'calc(100% - 85px)',
                              outline: 'none',
                              padding: '0'
                            }}
                          />
                        </div>
                      </td>

                      {/* Status (Thumbs Up Like Icon) */}
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span 
                          style={{
                            color: '#1bc5bd',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                          title="Status: Valid (Success)"
                        >
                          👍
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Datatable Pager / Pagination Bar (If enabled or in full table mode) */}
          {(showPagination || viewMode === 'FULL_TABLE') && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '8px',
                borderTop: '1px solid #ebedf3',
                fontSize: '11.5px',
                color: '#7e8299'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ padding: '5px 9px', borderRadius: '4px', background: '#f3f6f9', color: '#b5b5c3', cursor: 'default' }}>«</span>
                <span style={{ padding: '5px 9px', borderRadius: '4px', background: '#f3f6f9', color: '#b5b5c3', cursor: 'default' }}>‹</span>
                <span style={{ padding: '5px 10px', borderRadius: '4px', background: '#3699ff', color: '#fff', fontWeight: 'bold' }}>1</span>
                <span style={{ padding: '5px 10px', borderRadius: '4px', background: '#f3f6f9', color: '#7e8299', cursor: 'pointer' }}>2</span>
                <span style={{ padding: '5px 10px', borderRadius: '4px', background: '#f3f6f9', color: '#7e8299', cursor: 'pointer' }}>3</span>
                <span style={{ padding: '5px 9px', borderRadius: '4px', background: '#f3f6f9', color: '#7e8299', cursor: 'pointer' }}>›</span>
                <span style={{ padding: '5px 9px', borderRadius: '4px', background: '#f3f6f9', color: '#7e8299', cursor: 'pointer' }}>»</span>
              </div>
              <div>
                <span>Showing 1 - {rows.length} of 30,479</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info helper card */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs font-mono text-cyan-200">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Tips Penggunaan Transaksi Slot IDN:</strong> Anda dapat mengedit langsung seluruh elemen (Game, Provider, Tanggal/Waktu, Round ID, Ext. ID, Debit/Credit, Nilai Bet/Menang, dan Balance). Gunakan tombol <b className="text-cyan-300">"HITUNG OTOMATIS 2 TRANSAKSI"</b> untuk menyelaraskan pergerakan saldo dari bet (debit) sampai kemenangan (credit) secara akurat.
        </div>
      </div>
    </div>
  );
};
