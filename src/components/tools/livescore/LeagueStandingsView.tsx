import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Calendar, 
  Search, 
  Copy, 
  Check, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  Info,
  RefreshCw
} from 'lucide-react';
import { LeagueStandingItem } from '../../../types';
import { 
  SUPPORTED_LEAGUES, 
  getLeagueStandings 
} from '../../../services/seasonDataService';

export const LeagueStandingsView: React.FC = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('epl');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026/2027');
  const [standings, setStandings] = useState<LeagueStandingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTeam, setSearchTeam] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Available seasons
  const seasonsList = ['2026/2027', '2025/2026', '2024/2025', '2023/2024'];

  // Current active league
  const currentLeague = useMemo(() => {
    return SUPPORTED_LEAGUES.find(l => l.id === selectedLeagueId) || SUPPORTED_LEAGUES[0];
  }, [selectedLeagueId]);

  // Load standings data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getLeagueStandings(selectedLeagueId, selectedSeason).then((data) => {
      if (isMounted) {
        setStandings(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLeagueId, selectedSeason]);

  // Filtered standings
  const filteredStandings = useMemo(() => {
    if (!searchTeam.trim()) return standings;
    const q = searchTeam.toLowerCase().trim();
    return standings.filter(
      (s) => s.teamName.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q)
    );
  }, [standings, searchTeam]);

  // Copy standings for CS
  const handleCopyStandings = () => {
    if (standings.length === 0) return;

    let text = `🏆 TABEL KLASEMEN RESMI - ${currentLeague.name.toUpperCase()}\n`;
    text += `Musim: ${selectedSeason}\n`;
    text += `------------------------------------------------------\n`;
    text += `POS | TIM                    | P  | W  | D  | L  | GD  | PTS\n`;
    text += `------------------------------------------------------\n`;

    standings.slice(0, 10).forEach((s) => {
      const pos = String(s.position).padStart(2, ' ');
      const name = s.teamName.padEnd(22, ' ').slice(0, 22);
      const p = String(s.played).padStart(2, ' ');
      const w = String(s.won).padStart(2, ' ');
      const d = String(s.drawn).padStart(2, ' ');
      const l = String(s.lost).padStart(2, ' ');
      const gd = (s.goalDifference > 0 ? `+${s.goalDifference}` : `${s.goalDifference}`).padStart(4, ' ');
      const pts = String(s.points).padStart(3, ' ');
      text += `${pos}  | ${name} | ${p} | ${w} | ${d} | ${l} | ${gd} | ${pts}\n`;
    });

    text += `------------------------------------------------------\n`;
    text += `Sumber: Operasional Kasir & CS DON ISKO 711 HS GROUP`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090A10] border-2 border-[#00F3FF]/40 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00F3FF] text-black text-[10px] font-mono font-black flex items-center gap-1 shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                <Trophy className="w-3 h-3 text-black" />
                TABEL KLASEMEN LENGKAP PER MUSIM
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black text-yellow-300 border border-yellow-400 text-[10px] font-mono font-bold">
                ARSIP RESMI: 2026/2027 s/d 2023/2024
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="text-[#00F3FF]">{currentLeague.name}</span>
              <span className="text-gray-400">-</span>
              <span className="text-yellow-400">MUSIM {selectedSeason}</span>
            </h2>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Tabel peringkat klasemen lengkap berdasarkan musim kompetisi. Pilih musim yang ingin dilihat (contoh: <strong className="text-yellow-300 font-bold">Musim 2023 - 2024</strong> atau <strong className="text-[#00F3FF] font-bold">Musim 2026/2027</strong>) untuk melihat statistik Main, Menang, Seri, Kalah, Selisih Gol, dan Total Poin.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyStandings}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                copied
                  ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                  : 'bg-black hover:bg-yellow-400 text-yellow-400 hover:text-black border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin untuk CS' : 'Salin Klasemen (CS)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Season Selection Pills */}
      <div className="p-3 rounded-2xl bg-black border-2 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-mono font-black text-yellow-300 uppercase">
            PILIH MUSIM BERMAIN:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {seasonsList.map((s) => {
            const isSelected = selectedSeason === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSeason(s)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer whitespace-nowrap border-2 ${
                  isSelected
                    ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                    : 'bg-[#0E101A] hover:bg-[#1A1E30] text-gray-300 border-white/20 hover:border-yellow-400/60'
                }`}
              >
                {s === '2023/2024' ? 'Musim 2023 - 2024' : `Musim ${s}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SUPPORTED_LEAGUES.map((lg) => {
          const isSelected = selectedLeagueId === lg.id;
          return (
            <button
              key={lg.id}
              type="button"
              onClick={() => setSelectedLeagueId(lg.id)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center ${
                isSelected
                  ? 'bg-black border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                  : 'bg-[#090A12] border-white/10 hover:border-[#00F3FF]/40 text-gray-400 hover:text-white'
              }`}
            >
              <img 
                src={lg.logo} 
                alt={lg.name} 
                className="w-8 h-8 object-contain bg-white/5 p-1 rounded-lg"
              />
              <span className={`text-[11px] font-mono font-bold leading-tight ${isSelected ? 'text-[#00F3FF]' : 'text-gray-300'}`}>
                {lg.name.split(' (')[0]}
              </span>
              <span className="text-[9px] font-mono text-gray-500">
                {lg.country}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
            placeholder="Cari klub di tabel klasemen (contoh: Man City, Arsenal, Barcelona)..."
            className="w-full bg-black border-2 border-white/20 focus:border-[#00F3FF] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Legend / Color Zone Info */}
        <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-gray-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Liga Champions (UCL)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            Liga Europa (UEL)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Degradasi
          </span>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="rounded-2xl bg-[#07080E] border-2 border-white/15 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0D16] border-b-2 border-white/15 text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-14">POS</th>
                <th className="py-3 px-4">KLUB / TIM</th>
                <th className="py-3 px-2 text-center w-12 text-yellow-400" title="Main">P</th>
                <th className="py-3 px-2 text-center w-12" title="Menang">W</th>
                <th className="py-3 px-2 text-center w-12" title="Seri">D</th>
                <th className="py-3 px-2 text-center w-12" title="Kalah">L</th>
                <th className="py-3 px-2 text-center w-14 hidden sm:table-cell" title="Gol Masuk">GF</th>
                <th className="py-3 px-2 text-center w-14 hidden sm:table-cell" title="Kebobolan">GA</th>
                <th className="py-3 px-2 text-center w-14" title="Selisih Gol">GD</th>
                <th className="py-3 px-3 text-center w-16 text-[#00F3FF]" title="Poin">PTS</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">5 LAGA TERAKHIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs font-mono">
              {filteredStandings.map((item) => {
                const isUcl = item.zoneType === 'ucl' || item.position <= 4;
                const isUel = item.zoneType === 'uel' || item.position === 5;
                const isRelegation = item.zoneType === 'relegation' || item.position >= 18;

                return (
                  <tr 
                    key={item.position}
                    className={`transition-colors hover:bg-white/5 ${
                      item.position === 1 ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span 
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                            isUcl 
                              ? 'bg-cyan-500/20 text-[#00F3FF] border border-[#00F3FF]/60'
                              : isUel
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50'
                                : isRelegation
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                                  : 'text-gray-300'
                          }`}
                        >
                          {item.position}
                        </span>
                      </div>
                    </td>

                    {/* Team Name & Logo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {item.logo ? (
                          <img 
                            src={item.logo} 
                            alt={item.teamName} 
                            className="w-6 h-6 object-contain rounded-full bg-white/5 p-0.5 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {item.shortName}
                          </div>
                        )}
                        <span className="font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
                          {item.teamName}
                        </span>
                        {item.position === 1 && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[9px] font-black uppercase shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                            PEMUNCAK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3 px-2 text-center text-yellow-300 font-bold">
                      {item.played}
                    </td>

                    {/* Won */}
                    <td className="py-3 px-2 text-center text-emerald-400 font-bold">
                      {item.won}
                    </td>

                    {/* Drawn */}
                    <td className="py-3 px-2 text-center text-gray-300">
                      {item.drawn}
                    </td>

                    {/* Lost */}
                    <td className="py-3 px-2 text-center text-rose-400">
                      {item.lost}
                    </td>

                    {/* GF */}
                    <td className="py-3 px-2 text-center text-gray-400 hidden sm:table-cell">
                      {item.goalsFor}
                    </td>

                    {/* GA */}
                    <td className="py-3 px-2 text-center text-gray-400 hidden sm:table-cell">
                      {item.goalsAgainst}
                    </td>

                    {/* GD */}
                    <td className="py-3 px-2 text-center font-bold">
                      <span className={item.goalDifference > 0 ? 'text-emerald-400' : item.goalDifference < 0 ? 'text-rose-400' : 'text-gray-400'}>
                        {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                      </span>
                    </td>

                    {/* PTS */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-black border border-[#00F3FF] text-[#00F3FF] font-black text-sm shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                        {item.points}
                      </span>
                    </td>

                    {/* Form */}
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {item.form && item.form.map((f, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                              f === 'W'
                                ? 'bg-emerald-500 text-black'
                                : f === 'D'
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-rose-500 text-white'
                            }`}
                            title={f === 'W' ? 'Menang' : f === 'D' ? 'Seri' : 'Kalah'}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Zone Note */}
        <div className="p-3 bg-[#0A0C14] border-t border-white/10 text-xs font-mono text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span>Keterangan: Posisi 1-4 Lolos Liga Champions, Posisi 5 Lolos Liga Europa, Posisi 18-20 Zona Degradasi.</span>
          </div>
          <span className="text-yellow-300 font-bold">
            Data Resmi {selectedSeason} • DON ISKO 711
          </span>
        </div>
      </div>
    </div>
  );
};
