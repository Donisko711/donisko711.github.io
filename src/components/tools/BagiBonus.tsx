import React, { useState, useEffect } from 'react';
import { Gift, Flame, Trophy, Sparkles } from 'lucide-react';
import { BonusCalculator } from './BonusCalculator';
import { BonusParlayCalculator } from './BonusParlayCalculator';

interface BagiBonusProps {
  initialTab?: 'SLOT' | 'PARLAY';
}

export const BagiBonus: React.FC<BagiBonusProps> = ({ initialTab = 'SLOT' }) => {
  const [activeTab, setActiveTab] = useState<'SLOT' | 'PARLAY'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Top Banner Navigation Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0a111a]/95 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold font-mono border border-cyan-500/40">
              MODUL OPERASIONAL CS
            </span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[11px] font-mono font-bold">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Sistem Pembagian Bonus 711</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider font-['Rajdhani'] flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-[#00F3FF]" />
            <span>BAGI BONUS {activeTab === 'SLOT' ? '— SCATTER & HARIAN SLOT' : '— MIX PARLAY SPORTSBOOK'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {activeTab === 'SLOT'
              ? 'Pengecekan dan validasi otomatis tiket klaim scatter Mahjong Ways, PG Soft, dan event turnamen slot harian.'
              : 'Perhitungan dan klaim otomatis bonus kemenangan event win streak & mix parlay sportsbook.'}
          </p>
        </div>

        {/* Tab Switcher: Scatter & Harian Slot vs Bonus Parlay */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#040810] border border-cyan-900/50 self-start md:self-auto shadow-inner gap-1">
          <button
            type="button"
            id="tab-bagi-bonus-slot"
            onClick={() => setActiveTab('SLOT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'SLOT'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>SCATTER &amp; HARIAN SLOT</span>
          </button>
          <button
            type="button"
            id="tab-bagi-bonus-parlay"
            onClick={() => setActiveTab('PARLAY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'PARLAY'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>BONUS PARLAY</span>
          </button>
        </div>
      </div>

      {/* Render Active Bonus Calculator Component */}
      <div className="transition-all">
        {activeTab === 'SLOT' ? (
          <BonusCalculator />
        ) : (
          <BonusParlayCalculator />
        )}
      </div>
    </div>
  );
};
