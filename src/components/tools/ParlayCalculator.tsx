import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RotateCcw, 
  Trophy, 
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export type ParlayStatus = 'WIN' | 'WIN_HALF' | 'DRAW' | 'LOSE_HALF' | 'LOSE';

export interface SimpleParlayMatch {
  id: string;
  odds: number;
  status: ParlayStatus;
}

export const ParlayCalculator: React.FC = () => {
  const [stake, setStake] = useState<number>(50000);
  const [matches, setMatches] = useState<SimpleParlayMatch[]>([
    {
      id: 'p-1',
      odds: 1.75,
      status: 'WIN'
    },
    {
      id: 'p-2',
      odds: 1.92,
      status: 'WIN'
    },
    {
      id: 'p-3',
      odds: 2.43,
      status: 'WIN_HALF'
    },
    {
      id: 'p-4',
      odds: 1.80,
      status: 'LOSE_HALF'
    }
  ]);
  const [copied, setCopied] = useState(false);

  // Status multiplier calculator
  const getMatchMultiplier = (match: SimpleParlayMatch): number => {
    switch (match.status) {
      case 'WIN':
        return match.odds;
      case 'WIN_HALF':
        // Rumus Menang Setengah: ((Odds - 1) / 2) + 1
        return ((match.odds - 1) / 2) + 1;
      case 'DRAW':
        // Seri / Push / Void: Odds = 1.00
        return 1.0;
      case 'LOSE_HALF':
        // Kalah Setengah: Pengali = 0.50
        return 0.5;
      case 'LOSE':
        // Kalah Penuh: Pengali = 0.00
        return 0.0;
      default:
        return match.odds;
    }
  };

  // Calculate parlay outcome
  const { totalOdds, totalPayout, netProfit, hasLose, statusCounts, summaryText } = useMemo(() => {
    let multiplier = 1;
    let loseFound = false;

    const counts = {
      winFull: 0,
      winHalf: 0,
      draw: 0,
      loseHalf: 0,
      loseFull: 0
    };

    for (const m of matches) {
      if (m.status === 'WIN') counts.winFull++;
      else if (m.status === 'WIN_HALF') counts.winHalf++;
      else if (m.status === 'DRAW') counts.draw++;
      else if (m.status === 'LOSE_HALF') counts.loseHalf++;
      else if (m.status === 'LOSE') {
        counts.loseFull++;
        loseFound = true;
      }

      const mMultiplier = getMatchMultiplier(m);
      multiplier *= mMultiplier;
    }

    // Format total odds to 3 decimals (e.g. 2.878x)
    const calculatedOdds = parseFloat(multiplier.toFixed(3));
    const payout = Math.round(stake * calculatedOdds);
    const profit = payout > 0 ? payout - stake : -stake;

    // Build status breakdown lines
    const statusLines: string[] = [];
    if (counts.winFull > 0) {
      statusLines.push(`* ${counts.winFull} Team Win Full`);
    }
    if (counts.winHalf > 0) {
      statusLines.push(`* ${counts.winHalf} Team Menang Setengah`);
    }
    if (counts.draw > 0) {
      statusLines.push(`* ${counts.draw} Team Seri / Draw`);
    }
    if (counts.loseHalf > 0) {
      statusLines.push(`* ${counts.loseHalf} Team Kalah Setengah`);
    }
    if (counts.loseFull > 0) {
      statusLines.push(`* ${counts.loseFull} Team Kalah Full`);
    }

    // Exact summary format requested by user
    let text = `• Modal Stake: Rp ${stake.toLocaleString('id-ID')}\n`;
    text += `• Total Partai : ${matches.length} Team\n`;
    text += `• Total Perkalian Odds : ${calculatedOdds.toFixed(3)}x\n`;
    text += `• Status : \n`;
    text += statusLines.join('\n') + '\n';
    text += `• Estimasi Kemenangan : Rp ${payout.toLocaleString('id-ID')}\n`;
    text += `• Profit Bersih : Rp ${profit.toLocaleString('id-ID')}`;

    return {
      totalOdds: calculatedOdds,
      totalPayout: payout,
      netProfit: profit,
      hasLose: loseFound,
      statusCounts: counts,
      summaryText: text
    };
  }, [matches, stake]);

  const handleAddMatch = () => {
    const newMatch: SimpleParlayMatch = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      odds: 1.85,
      status: 'WIN'
    };
    setMatches([...matches, newMatch]);
  };

  const handleRemoveMatch = (id: string) => {
    if (matches.length <= 2) {
      alert('Mix Parlay minimal membutuhkan 2 partai / tim.');
      return;
    }
    setMatches(matches.filter(m => m.id !== id));
  };

  const handleUpdateOdds = (id: string, newOdds: number) => {
    setMatches(matches.map(m => (m.id === id ? { ...m, odds: newOdds } : m)));
  };

  const handleUpdateStatus = (id: string, newStatus: ParlayStatus) => {
    setMatches(matches.map(m => (m.id === id ? { ...m, status: newStatus } : m)));
  };

  const handleSetPreset = (presetType: 'contoh' | 'win_all' | '3_team' | '5_team') => {
    if (presetType === 'contoh') {
      setStake(50000);
      setMatches([
        { id: `p-1`, odds: 1.75, status: 'WIN' },
        { id: `p-2`, odds: 1.92, status: 'WIN' },
        { id: `p-3`, odds: 2.43, status: 'WIN_HALF' },
        { id: `p-4`, odds: 1.80, status: 'LOSE_HALF' }
      ]);
    } else if (presetType === 'win_all') {
      setMatches(matches.map(m => ({ ...m, status: 'WIN' })));
    } else if (presetType === '3_team') {
      setMatches([
        { id: `p-1`, odds: 1.85, status: 'WIN' },
        { id: `p-2`, odds: 1.90, status: 'WIN' },
        { id: `p-3`, odds: 2.05, status: 'WIN' }
      ]);
    } else if (presetType === '5_team') {
      setMatches([
        { id: `p-1`, odds: 1.75, status: 'WIN' },
        { id: `p-2`, odds: 1.88, status: 'WIN' },
        { id: `p-3`, odds: 1.95, status: 'WIN' },
        { id: `p-4`, odds: 2.10, status: 'WIN_HALF' },
        { id: `p-5`, odds: 1.80, status: 'WIN' }
      ]);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono border border-amber-500/40">
              SPORTBOOKS TOOLS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Quick Odds & Payout Calculator
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Kalkulator Hitung Mix Parlay
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hitung perkalian odds total, estimasi kemenangan, dan profit bersih berdasarkan status partai.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSetPreset('contoh')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Load contoh 4 tim (2 Win, 1 Win Half, 1 Lose Half)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Contoh (4 Team)</span>
          </button>
          <button
            onClick={handleAddMatch}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Partai</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Table & Stake, Right side Summary Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stake Input & Match Odds Table */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Modal Stake Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Modal Stake (Taruhan)</span>
              </label>
              <div className="flex items-center gap-1">
                {[25000, 50000, 100000, 200000].map(val => (
                  <button
                    key={val}
                    onClick={() => setStake(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      stake === val 
                        ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                        : 'bg-zinc-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                Rp
              </span>
              <input
                type="number"
                min={1000}
                step={5000}
                value={stake || ''}
                onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                placeholder="50000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-base font-mono font-bold text-white outline-none shadow-inner transition-colors"
              />
            </div>
          </div>

          {/* Matches List */}
          <div className="p-4 rounded-2xl bg-[#0e131b]/95 border border-zinc-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                  Daftar Odds & Status Partai ({matches.length} Team)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSetPreset('win_all')}
                  className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono transition-all cursor-pointer"
                >
                  Set Semua Win Full
                </button>
                <button
                  onClick={() => setMatches(matches.slice(0, 2))}
                  disabled={matches.length <= 2}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Reset ke 2 partai minimal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {matches.map((m, index) => {
                const multiplier = getMatchMultiplier(m);
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    {/* Index Badge */}
                    <div className="flex items-center gap-2 min-w-[75px]">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                        #{index + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 font-mono">
                        Partai {index + 1}
                      </span>
                    </div>

                    {/* Odds Input */}
                    <div className="flex-1 sm:max-w-[150px] space-y-0.5">
                      <div className="text-[9px] font-mono uppercase text-slate-400">Nilai Odds</div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="1.01"
                          value={m.odds || ''}
                          onChange={e => handleUpdateOdds(m.id, parseFloat(e.target.value) || 1.0)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-amber-300 font-mono font-extrabold text-sm outline-none shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex-1 space-y-0.5">
                      <div className="text-[9px] font-mono uppercase text-slate-400">Status Hasil</div>
                      <select
                        value={m.status}
                        onChange={e => handleUpdateStatus(m.id, e.target.value as ParlayStatus)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono outline-none border cursor-pointer transition-all ${
                          m.status === 'WIN' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
                          m.status === 'WIN_HALF' ? 'bg-teal-950/80 text-teal-300 border-teal-500/60' :
                          m.status === 'DRAW' ? 'bg-blue-950/80 text-blue-300 border-blue-500/60' :
                          m.status === 'LOSE_HALF' ? 'bg-amber-950/80 text-amber-300 border-amber-500/60' :
                          'bg-rose-950/80 text-rose-300 border-rose-500/60'
                        }`}
                      >
                        <option value="WIN">Win Full (Menang Penuh)</option>
                        <option value="WIN_HALF">Win Half (Menang 1/2)</option>
                        <option value="DRAW">Draw (Seri / Push)</option>
                        <option value="LOSE_HALF">Lose Half (Kalah 1/2)</option>
                        <option value="LOSE">Lose Full (Kalah Penuh)</option>
                      </select>
                    </div>

                    {/* Multiplier Tag Preview */}
                    <div className="sm:w-24 text-right sm:text-center shrink-0">
                      <div className="text-[9px] font-mono uppercase text-slate-400">Multiplier</div>
                      <span className={`text-xs font-extrabold font-mono ${
                        m.status === 'WIN' ? 'text-emerald-400' :
                        m.status === 'WIN_HALF' ? 'text-teal-400' :
                        m.status === 'DRAW' ? 'text-blue-400' :
                        m.status === 'LOSE_HALF' ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>
                        x{multiplier.toFixed(3)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end sm:justify-center">
                      <button
                        onClick={() => handleRemoveMatch(m.id)}
                        disabled={matches.length <= 2}
                        title="Hapus Partai"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Button */}
            <button
              onClick={handleAddMatch}
              className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Partai #{matches.length + 1}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Calculated Output & Copy Result Panel */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Result Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#141d2b] to-[#0e131b] border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white font-['Rajdhani'] uppercase tracking-wider">
                  Rincian Hasil Parlay
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                {matches.length} PARTAI
              </span>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Odds</div>
                <div className="text-xl font-black text-cyan-300 font-mono tracking-tight mt-0.5">
                  {totalOdds.toFixed(3)}x
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Modal Stake</div>
                <div className="text-sm font-black text-white font-mono mt-1">
                  Rp {stake.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Payout & Profit Highlight */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Estimasi Kemenangan</span>
                <span className={`text-lg font-black font-mono ${hasLose ? 'text-rose-400' : 'text-amber-300'}`}>
                  Rp {totalPayout.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Profit Bersih</span>
                <span className={`text-xl font-black font-mono ${hasLose ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Rp {netProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Formatted Output Box (Matches user template exactly) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Format Teks Tiket:</span>
                <span className="text-[10px] text-cyan-400">Siap Copy</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/90 border border-zinc-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner select-all">
                {summaryText}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopySummary}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>RINCIAN BERHASIL DISALIN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                  <span>SALIN RINCIAN PARLAY</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-white font-mono uppercase text-[10px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Aturan Perhitungan Mix Parlay:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] font-mono text-slate-400 pl-1">
              <li><strong>Win Full</strong> = Odds dikalikan penuh</li>
              <li><strong>Win Half (1/2)</strong> = ((Odds - 1) / 2) + 1</li>
              <li><strong>Draw / Seri</strong> = Odds dihitung 1.00 (tetap)</li>
              <li><strong>Lose Half (1/2)</strong> = Nilai perkalian 0.50</li>
              <li><strong>Lose Full</strong> = Tiket gugur (Total Odds 0)</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
