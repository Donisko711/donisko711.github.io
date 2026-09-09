import React, { useState, useMemo } from 'react';
import { SportType } from '../../../types';
import { SBOBET_SPORTS_LIST, SbobetSportItem } from '../../../data/sbobetSports';
import { Search, Trophy, X, Check } from 'lucide-react';

interface SbobetSportsSidebarProps {
  selectedSport: SportType;
  onSelectSport: (sport: SportType) => void;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
  actualSportCounts?: Record<string, number>;
}

export const SbobetSportsSidebar: React.FC<SbobetSportsSidebarProps> = ({
  selectedSport,
  onSelectSport,
  isMobileModal = false,
  onCloseMobile,
  actualSportCounts = {}
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredSports = useMemo(() => {
    if (!searchFilter.trim()) return SBOBET_SPORTS_LIST;
    const q = searchFilter.toLowerCase();
    return SBOBET_SPORTS_LIST.filter(s => 
      s.name.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const totalSbobetMarkets = useMemo(() => {
    return SBOBET_SPORTS_LIST.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <div className="flex flex-col bg-[#111625] border-2 border-[#2B3B6D] rounded-xl overflow-hidden shadow-2xl w-full select-none">
      {/* Header SBOBET: Jenis Olahraga (Desain Sesuai Gambar Lampiran) */}
      <div className="bg-[#2E3C6B] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-[#3B4C85]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="font-bold text-sm tracking-wide text-white">
            Jenis Olahraga
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold bg-[#1C2545] text-cyan-300 px-2 py-0.5 rounded border border-[#3B4C85]">
            SBOBET
          </span>
          {isMobileModal && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded hover:bg-[#3B4C85] text-gray-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Search & All Sports Button */}
      <div className="p-2 bg-[#0C101B] border-b border-[#202B4D] space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari jenis olahraga..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#161D30] border border-[#2B3B6D] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Option: SEMUA OLAHRAGA */}
        <button
          type="button"
          onClick={() => {
            onSelectSport('all');
            if (isMobileModal && onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedSport === 'all'
              ? 'bg-[#273966] text-white border border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
              : 'bg-[#151C2E] hover:bg-[#1C2640] text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🌐</span>
            <span className="font-semibold">Semua Olahraga</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-black shadow-sm">
            {totalSbobetMarkets.toLocaleString()}
          </span>
        </button>
      </div>

      {/* List 26 Olahraga Sesuai Tabel SBOBET */}
      <div className="divide-y divide-[#1B233C] max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2B3B6D] scrollbar-track-[#0F1424]">
        {filteredSports.map((sport) => {
          const isSelected = selectedSport === sport.id;
          const countToDisplay = actualSportCounts[sport.id] !== undefined && actualSportCounts[sport.id] > 0
            ? actualSportCounts[sport.id]
            : sport.count;

          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => {
                onSelectSport(sport.id);
                if (isMobileModal && onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer group ${
                isSelected
                  ? 'bg-[#202C50] text-white font-bold border-l-4 border-yellow-400 pl-2'
                  : 'hover:bg-[#182035] text-gray-200'
              }`}
            >
              {/* Left: Icon & Label */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-base flex-shrink-0">{sport.icon}</span>
                <span className={`text-xs truncate ${isSelected ? 'text-white font-bold' : 'text-gray-200 group-hover:text-white'}`}>
                  {sport.name}
                </span>
              </div>

              {/* Right: Badge Count SBOBET (Orange / Red vs Blue) */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-yellow-400 animate-in fade-in" />
                )}
                <span
                  className={`min-w-[32px] text-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-white shadow-sm leading-tight ${
                    sport.badgeColor === 'orange'
                      ? 'bg-[#E55333]'
                      : 'bg-[#4B63AC]'
                  }`}
                >
                  {countToDisplay}
                </span>
              </div>
            </button>
          );
        })}

        {filteredSports.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-400">
            Olahraga "{searchFilter}" tidak ditemukan.
          </div>
        )}
      </div>

      {/* SBOBET Footer Note */}
      <div className="p-2 bg-[#0C101B] border-t border-[#202B4D] text-center">
        <span className="text-[10px] text-gray-400 font-mono">
          Pasaran Odds SBOBET Realtime • WIB
        </span>
      </div>
    </div>
  );
};
