import React, { useState } from 'react';
import { 
  Calculator, 
  Search, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle,
  Coins,
  Flame,
  Zap
} from 'lucide-react';

interface GameDiskonHadiah {
  id: string;
  title: string;
  diskon: number; // in percentage, e.g. 66.5
  hadiah: number; // multiplier, e.g. 3000
  isTotoMacauSingle?: boolean;
  isBB?: boolean;
  notes?: string;
}

export const LIST_GAME_TOGEL: GameDiskonHadiah[] = [
  { id: 'g-1', title: 'Togel 4D', diskon: 66.5, hadiah: 3000 },
  { id: 'g-2', title: 'Togel 3D', diskon: 59.5, hadiah: 400 },
  { id: 'g-3', title: 'Togel 2D', diskon: 29.5, hadiah: 70 },
  { id: 'g-4', title: 'Colok Bebas', diskon: 5, hadiah: 1.53 },
  { id: 'g-5', title: 'Colok Bebas 2D', diskon: 10, hadiah: 7 },
  { id: 'g-6', title: 'Colok Naga', diskon: 10, hadiah: 22 },
  { id: 'g-7', title: 'Colok Jitu', diskon: 5, hadiah: 8 },
  { id: 'g-8', title: 'SHIO', diskon: 5, hadiah: 9.5 },
  { id: 'g-9', title: 'Kombinasi', diskon: 8, hadiah: 2.6 },
  { id: 'g-10', title: 'Tengah tepi', diskon: 2, hadiah: 2.5 },
  { id: 'g-11', title: 'Dasar', diskon: 2, hadiah: 1.25 },
  { id: 'g-12', title: '50 : 50', diskon: 2, hadiah: 2.5 },
  { id: 'g-13', title: 'Silang Homo', diskon: 2, hadiah: 2.5 },
  { id: 'g-14', title: 'Kembang Kempis', diskon: 2, hadiah: 2.5 },
  { id: 'g-15', title: 'BET FULL 4D', hadiah: 9800, diskon: 0 },
  { id: 'g-16', title: 'BET FULL 3D', hadiah: 980, diskon: 0 },
  { id: 'g-17', title: 'BET FULL 2D', hadiah: 98, diskon: 0 },
  { id: 'g-18', title: 'PRIZE 1 - 4D', hadiah: 6500, diskon: 0 },
  { id: 'g-19', title: 'PRIZE 1 - 3D', hadiah: 650, diskon: 0 },
  { id: 'g-20', title: 'PRIZE 1 - 2D', hadiah: 70, diskon: 0 },
  { id: 'g-21', title: 'PRIZE 2 - 4D', hadiah: 2100, diskon: 0 },
  { id: 'g-22', title: 'PRIZE 2 - 3D', hadiah: 210, diskon: 0 },
  { id: 'g-23', title: 'PRIZE 2 - 2D', hadiah: 20, diskon: 0 },
  { id: 'g-24', title: 'PRIZE 3 - 4D', hadiah: 1100, diskon: 0 },
  { id: 'g-25', title: 'PRIZE 3 - 3D', hadiah: 110, diskon: 0 },
  { id: 'g-26', title: 'PRIZE 3 - 2D', hadiah: 8, diskon: 0 },
  { id: 'g-27', title: '4D TEPAT', hadiah: 4000, diskon: 0 },
  { id: 'g-28', title: '4D BB', hadiah: 200, diskon: 0 },
  { id: 'g-29', title: '3D TEPAT', hadiah: 400, diskon: 0 },
  { id: 'g-30', title: '3D BB', hadiah: 100, diskon: 0 },
  { id: 'g-31', title: '2D TEPAT', hadiah: 70, diskon: 0 },
  { id: 'g-32', title: '2D BB', hadiah: 20, diskon: 0 },
  { id: 'g-33', title: 'DISKON 4D', hadiah: 3000, diskon: 66.5 },
  { id: 'g-34', title: 'DISKON 3D', hadiah: 400, diskon: 59.5 },
  { id: 'g-35', title: 'DISKON 2D', hadiah: 70, diskon: 29.5 },
  { id: 'g-36', title: 'DISKON 2D DEPAN', hadiah: 65, diskon: 29.5 },
  { id: 'g-37', title: 'DISKON 2D TENGAH', hadiah: 65, diskon: 29.5 },
  { id: 'g-38', title: 'TOTO MACAU Diskon', diskon: 33, hadiah: 6000, isTotoMacauSingle: true },
  { id: 'g-39', title: 'TOTO MACAU Super Diskon', diskon: 66, hadiah: 3000, isTotoMacauSingle: true },
  { id: 'g-40', title: 'TOTO MACAU Full', diskon: 0, hadiah: 9000, isTotoMacauSingle: true },
  { id: 'g-41', title: 'TOTO MACAU 3D', diskon: 24, hadiah: 60, isTotoMacauSingle: true },
  { id: 'g-42', title: 'Colok Bebas Macau', diskon: 5, hadiah: 1.53, isTotoMacauSingle: true },
  { id: 'g-43', title: 'Toto Macau 4D', diskon: 60, hadiah: 3000, isTotoMacauSingle: true },
  { id: 'g-44', title: 'Toto Macau 3D', diskon: 59, hadiah: 400, isTotoMacauSingle: true },
  { id: 'g-45', title: 'Toto Macau 2D', diskon: 29, hadiah: 70, isTotoMacauSingle: true },
  { id: 'g-46', title: 'Colok Bebas BB', diskon: 3, hadiah: 1.53, isBB: true },
  { id: 'g-47', title: 'Colok Naga BB', diskon: 10, hadiah: 22, isBB: true },
  { id: 'g-48', title: 'Colok Jitu BB', diskon: 5, hadiah: 8, isBB: true }
];

export const HadiahTogelOnline: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [betInputs, setBetInputs] = useState<Record<string, string>>({});
  const [calcResults, setCalcResults] = useState<Record<string, { bayar: number; menang: number; calculated: boolean }>>({});

  const handleBetChange = (gameId: string, val: string) => {
    setBetInputs(prev => ({ ...prev, [gameId]: val }));
  };

  const handleCalculate = (game: GameDiskonHadiah) => {
    const rawVal = betInputs[game.id];
    const betAmount = parseFloat(rawVal || '0');

    if (isNaN(betAmount) || betAmount <= 0) {
      setCalcResults(prev => ({
        ...prev,
        [game.id]: { bayar: 0, menang: 0, calculated: false }
      }));
      return;
    }

    let bayar = (betAmount * (100 - game.diskon)) / 100;
    bayar = Math.round(bayar * 100) / 100;

    let menang = betAmount * game.hadiah;
    menang = Math.round(menang * 100) / 100;

    setCalcResults(prev => ({
      ...prev,
      [game.id]: { bayar, menang, calculated: true }
    }));
  };

  const handleReset = (gameId: string) => {
    setBetInputs(prev => ({ ...prev, [gameId]: '' }));
    setCalcResults(prev => {
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
  };

  const handleResetAll = () => {
    setBetInputs({});
    setCalcResults({});
  };

  const filteredGames = LIST_GAME_TOGEL.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Header Marquee Banner */}
      <div className="text-center py-2.5 px-4 rounded-2xl bg-[#141416] border border-amber-500/40 shadow-lg">
        <h4 className="text-yellow-400 font-mono font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>DISKON TOGEL & HADIAH TOGEL ONLINE LENGKAP</span>
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        </h4>
      </div>

      {/* Main Header Bar (Dominasi Hitam, Kuning Gold, & Putih) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121214]/95 border border-zinc-800 border-b-4 border-b-yellow-400 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-[10px] font-bold font-mono border border-yellow-400/40 shadow-sm">
                SIMULASI DISKON & PAYOUT
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Total {LIST_GAME_TOGEL.length} Variasi Taruhan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-sans">
              KALKULATOR DISKON PASARAN TOGEL
            </h1>
          </div>

          {/* Search Box & Reset Action */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari jenis permainan..."
                className="w-full pl-5 pr-10 py-2.5 rounded-full bg-[#0A0A0C] text-white font-semibold text-sm outline-none border border-zinc-700 focus:border-yellow-400 placeholder:italic placeholder:text-zinc-500 shadow-inner focus:shadow-[0_0_15px_rgba(250,204,21,0.25)] transition-all"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
            </div>

            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1C20] hover:bg-[#27272E] text-zinc-200 hover:text-white font-bold text-xs tracking-wider uppercase border border-zinc-700 hover:border-yellow-400 transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
              <span>Reset Semua</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
          <span>Masukkan nominal bet untuk menghitung potongan bayar setelah diskon & total menang hadiah.</span>
          <span className="text-yellow-400 font-bold">Menampilkan: {filteredGames.length} Game</span>
        </div>
      </div>

      {/* Grid Kartu Dominasi Hitam, Kuning Gold, & Putih */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-1">
        {filteredGames.map((game) => {
          const res = calcResults[game.id];
          const hasResult = res && res.calculated;

          return (
            <div
              key={game.id}
              className="rounded-2xl bg-[#121215] border border-zinc-800 hover:border-yellow-400/80 p-4 text-white shadow-xl hover:shadow-[0_8px_25px_rgba(250,204,21,0.15)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between select-none group"
            >
              <div>
                {/* Judul Kartu: e.g. TOGEL 4D : */}
                <div className="text-center font-black text-base text-white group-hover:text-yellow-400 uppercase tracking-wide pb-2 border-b border-dashed border-zinc-800 transition-colors">
                  {game.title} :
                </div>

                {/* Info Diskon & Hadiah */}
                <div className="text-center text-xs font-bold py-2.5 flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-[#1C1C22] border border-zinc-700/80 text-zinc-300 text-[11px] font-mono">
                    Diskon: <strong className="text-yellow-400">{game.diskon}%</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1C1C22] border border-zinc-700/80 text-zinc-300 text-[11px] font-mono">
                    Hadiah: <strong className="text-white">x{game.hadiah.toLocaleString('id-ID')}</strong>
                  </span>
                </div>

                {/* Input Total Bet */}
                <div className="space-y-2 pt-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Masukan Total Bet"
                    value={betInputs[game.id] || ''}
                    onChange={e => handleBetChange(game.id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCalculate(game);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090B] text-white font-extrabold text-sm border border-zinc-700 focus:border-yellow-400 outline-none placeholder:text-zinc-600 shadow-inner focus:shadow-[0_0_12px_rgba(250,204,21,0.25)] transition-all font-mono"
                  />

                  {/* Tombol HITUNG & RESET */}
                  <button
                    onClick={() => handleCalculate(game)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.3)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    HITUNG
                  </button>

                  <button
                    onClick={() => handleReset(game.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1C1C20] hover:bg-[#27272E] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    RESET
                  </button>
                </div>
              </div>

              {/* Hasil Output Bayar & Menang */}
              <div className="pt-3 mt-3 border-t border-zinc-800 text-xs font-mono font-black space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                  <span className="text-zinc-400 text-[11px]">BAYAR:</span>
                  <span className="text-sm font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                    {hasResult ? `Rp ${res.bayar.toLocaleString('id-ID')}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                  <span className="text-zinc-400 text-[11px]">MENANG:</span>
                  <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {hasResult ? `Rp ${res.menang.toLocaleString('id-ID')}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
