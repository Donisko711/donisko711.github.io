import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ChevronRight, 
  MapPin, 
  Award, 
  Clock, 
  Trophy,
  History,
  Sparkles,
  Info
} from 'lucide-react';
import { SeasonArchiveMatch } from '../../../types';
import { 
  SUPPORTED_LEAGUES, 
  getSeasonArchiveMatches 
} from '../../../services/seasonDataService';

export const SeasonMatchArchiveView: React.FC = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026/2027');
  const [selectedMatchweek, setSelectedMatchweek] = useState<number>(0); // 0 = Semua
  const [dateSearch, setDateSearch] = useState<string>('');
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter matches
  const matches = useMemo(() => {
    return getSeasonArchiveMatches({
      leagueId: selectedLeagueId,
      season: selectedSeason,
      matchweek: selectedMatchweek,
      dateStr: dateSearch,
      query: teamSearchQuery
    });
  }, [selectedLeagueId, selectedSeason, selectedMatchweek, dateSearch, teamSearchQuery]);

  // Copy result for Customer Service
  const handleCopyResult = (match: SeasonArchiveMatch) => {
    const scorersText = match.scorers && match.scorers.length > 0
      ? `\n⚽ Pencetak Gol:\n` + match.scorers.map(s => `  • ${s.minute} ${s.player} (${s.team === 'home' ? match.homeTeam.name : match.awayTeam.name})`).join('\n')
      : '';

    const text = `🏆 HASIL PERTANDINGAN RESMI - ${match.leagueName.toUpperCase()}
Musim: ${match.season} (${match.matchweekLabel})
📅 Tanggal: ${match.wibDate}
⏰ Waktu Kick-Off: ${match.wibTime}
🏟️ Stadion: ${match.venue || '-'}
------------------------------------
${match.homeTeam.name}  ${match.homeTeam.score} - ${match.awayTeam.score}  ${match.awayTeam.name}
(Babak 1: ${match.halftimeScore || '-'})
Status: FINISHED (Selesai FT)${scorersText}
------------------------------------
Sumber: CS & Kasir DON ISKO 711 HS GROUP (WIB Official)`;

    navigator.clipboard.writeText(text);
    setCopiedId(match.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Quick preset click handler (e.g., Barcelona vs Rayo Vallecano 01 Sep 2026)
  const applyPresetExample = (team: string, date: string, season: string, league: string) => {
    setSelectedSeason(season);
    setSelectedLeagueId(league);
    setDateSearch(date);
    setTeamSearchQuery(team);
    setSelectedMatchweek(0);
  };

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090A10] border-2 border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-mono font-black flex items-center gap-1 shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                <History className="w-3 h-3 text-black" />
                ARSIP HASIL LENGKAP SEJAK KICKOFF LIGA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black text-[#00F3FF] border border-[#00F3FF] text-[10px] font-mono font-bold">
                WAKTU KICKOFF WIB LENGKAP
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="text-yellow-400">HASIL PERTANDINGAN</span>
              <span className="text-gray-400">&amp;</span>
              <span className="text-[#00F3FF]">RIWAYAT SKOR AKHIR</span>
            </h2>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Cek rekapan hasil skor akhir seluruh pertandingan dari sejak awal musim sebuah liga resmi dibuka (contoh: Musim 2026/2027 dimulai 22 Agustus 2026). Dilengkapi tanggal, jam kick-off WIB, skor akhir, pencetak gol, dan tombol cepat salin data untuk staf CS.
            </p>
          </div>

          {/* Quick Presets / Shortcuts for User Examples */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono text-yellow-300 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              CONTOH PENCARIAN CEPAT:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => applyPresetExample('Barcelona', '01 September', '2026/2027', 'laliga')}
                className="px-2.5 py-1.5 rounded-xl bg-black hover:bg-yellow-400 text-yellow-300 hover:text-black border border-yellow-400/60 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(250,204,21,0.2)]"
              >
                ⚽ Barcelona 2-1 Rayo (01 Sep 2026, 02:30 WIB)
              </button>
              <button
                type="button"
                onClick={() => applyPresetExample('Man City', '22 Agustus', '2026/2027', 'epl')}
                className="px-2.5 py-1.5 rounded-xl bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border border-[#00F3FF]/60 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              >
                ⚽ Kickoff EPL 22 Agu 2026 (Chelsea vs Man City)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-black border-2 border-[#00F3FF]/40 shadow-[0_0_15px_rgba(0,243,255,0.15)] space-y-4">
        {/* Row 1: Season Selector & League Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Season Selector */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-yellow-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              PILIH MUSIM LIGA:
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-[#0A0C14] border-2 border-yellow-400/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-yellow-400 shadow-sm"
            >
              <option value="2026/2027">Musim 2026/2027 (Mulai 22 Agu 2026)</option>
              <option value="2025/2026">Musim 2025/2026</option>
              <option value="2024/2025">Musim 2024/2025</option>
              <option value="2023/2024">Musim 2023 - 2024</option>
            </select>
          </div>

          {/* League Selector */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#00F3FF] mb-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              PILIH KOMPETISI / LIGA:
            </label>
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="w-full bg-[#0A0C14] border-2 border-[#00F3FF]/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#00F3FF] shadow-sm"
            >
              <option value="all">Semua Liga Sepak Bola</option>
              {SUPPORTED_LEAGUES.map((lg) => (
                <option key={lg.id} value={lg.id}>
                  {lg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Matchweek (Pekan) */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-emerald-400 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              PEKAN PERTANDINGAN:
            </label>
            <select
              value={selectedMatchweek}
              onChange={(e) => setSelectedMatchweek(Number(e.target.value))}
              className="w-full bg-[#0A0C14] border-2 border-emerald-400/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400 shadow-sm"
            >
              <option value={0}>Semua Pekan Pertandingan</option>
              <option value={1}>Pekan 1 (Kick-off Pembuka)</option>
              <option value={2}>Pekan 2</option>
              <option value={3}>Pekan 3</option>
              <option value={4}>Pekan 4</option>
              <option value={32}>Pekan 32 (El Clasico)</option>
              <option value={38}>Pekan 38 (Pekan Terakhir)</option>
            </select>
          </div>

          {/* Date Search */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              CARI TANGGAL (Contoh: 01 September):
            </label>
            <input
              type="text"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              placeholder="01 September / 22 Agustus..."
              className="w-full bg-[#0A0C14] border-2 border-white/20 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Search Team Name & Reset Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={teamSearchQuery}
              onChange={(e) => setTeamSearchQuery(e.target.value)}
              placeholder="Cari klub atau pemain (contoh: Barcelona, Rayo Vallecano, Real Madrid, Lewandowski, Haaland)..."
              className="w-full bg-[#0A0C14] border-2 border-white/20 focus:border-[#00F3FF] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none shadow-sm"
            />
          </div>

          {(dateSearch || teamSearchQuery || selectedLeagueId !== 'all' || selectedMatchweek !== 0) && (
            <button
              type="button"
              onClick={() => {
                setDateSearch('');
                setTeamSearchQuery('');
                setSelectedLeagueId('all');
                setSelectedMatchweek(0);
              }}
              className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono cursor-pointer transition-all whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Menampilkan <strong className="text-white font-bold">{matches.length}</strong> pertandingan resmi ({selectedSeason})
        </span>
        <span className="text-[11px] text-yellow-300">
          Zona Waktu: WIB (UTC+7)
        </span>
      </div>

      {/* Matches List Cards */}
      {matches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090A10] border-2 border-dashed border-white/20 text-gray-400 space-y-2">
          <Info className="w-8 h-8 text-yellow-400 mx-auto" />
          <p className="font-bold text-sm text-white">Tidak ada hasil pertandingan yang cocok dengan filter.</p>
          <p className="text-xs">Coba reset filter tanggal atau cari nama klub lain seperti "Barcelona", "Man City", "Real Madrid".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const isCopied = copiedId === match.id;
            const isHomeWinner = match.homeTeam.score > match.awayTeam.score;
            const isAwayWinner = match.awayTeam.score > match.homeTeam.score;

            return (
              <div
                key={match.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#07080E] border-2 border-white/15 hover:border-[#00F3FF]/70 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
              >
                {/* Top Card Meta Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-wrap">
                    {match.leagueLogo && (
                      <img 
                        src={match.leagueLogo} 
                        alt={match.leagueName} 
                        className="w-5 h-5 object-contain bg-white/10 p-0.5 rounded"
                      />
                    )}
                    <span className="text-xs font-mono font-black text-white">
                      {match.leagueName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black border border-yellow-400/50 text-[10px] font-mono font-bold text-yellow-300">
                      {match.season} • {match.matchweekLabel}
                    </span>
                  </div>

                  {/* Date & WIB Time Highlight */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-black border-2 border-yellow-400/80 text-yellow-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(250,204,21,0.25)]">
                      <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{match.wibDate}</span>
                      <span className="text-gray-400">|</span>
                      <Clock className="w-3.5 h-3.5 text-[#00F3FF]" />
                      <span className="text-[#00F3FF]">{match.wibTime}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono font-black">
                      SELESAI (FT)
                    </span>
                  </div>
                </div>

                {/* Scoreline Center Grid */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                  {/* Home Team */}
                  <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-3 text-right">
                    <div className="text-left md:text-right">
                      <h4 className={`text-base sm:text-lg font-black tracking-wide ${isHomeWinner ? 'text-yellow-400 font-black' : 'text-white'}`}>
                        {match.homeTeam.name}
                      </h4>
                      <span className="text-xs font-mono text-gray-400">Tuan Rumah (Home)</span>
                    </div>
                    {match.homeTeam.logo ? (
                      <img 
                        src={match.homeTeam.logo} 
                        alt={match.homeTeam.name} 
                        className="w-10 h-10 object-contain rounded-full bg-white/5 p-1 border border-white/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                        {match.homeTeam.shortName}
                      </div>
                    )}
                  </div>

                  {/* Scoreboard Neon Box */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-black border-2 border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white flex items-center gap-2">
                      <span className={isHomeWinner ? 'text-yellow-400' : 'text-white'}>{match.homeTeam.score}</span>
                      <span className="text-gray-500">-</span>
                      <span className={isAwayWinner ? 'text-yellow-400' : 'text-white'}>{match.awayTeam.score}</span>
                    </div>
                    {match.halftimeScore && (
                      <span className="text-[10px] font-mono text-gray-400">
                        HT: {match.halftimeScore}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="md:col-span-3 flex items-center justify-start gap-3 text-left">
                    {match.awayTeam.logo ? (
                      <img 
                        src={match.awayTeam.logo} 
                        alt={match.awayTeam.name} 
                        className="w-10 h-10 object-contain rounded-full bg-white/5 p-1 border border-white/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                        {match.awayTeam.shortName}
                      </div>
                    )}
                    <div>
                      <h4 className={`text-base sm:text-lg font-black tracking-wide ${isAwayWinner ? 'text-yellow-400 font-black' : 'text-white'}`}>
                        {match.awayTeam.name}
                      </h4>
                      <span className="text-xs font-mono text-gray-400">Tim Tamu (Away)</span>
                    </div>
                  </div>
                </div>

                {/* Scorers & Venue Footnote */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  {/* Goal Scorers List */}
                  <div className="flex-1">
                    {match.scorers && match.scorers.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap text-gray-300 font-mono text-[11px]">
                        <span className="text-yellow-400 font-bold flex items-center gap-1">
                          ⚽ Gol:
                        </span>
                        {match.scorers.map((s, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded bg-black border border-white/20 text-gray-200"
                          >
                            {s.player} <span className="text-yellow-400 font-bold">{s.minute}</span> ({s.team === 'home' ? match.homeTeam.shortName : match.awayTeam.shortName})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[11px] font-mono">Tidak ada gol tercipta</span>
                    )}

                    {match.venue && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 font-mono">
                        <MapPin className="w-3 h-3 text-yellow-400" />
                        <span>{match.venue}</span>
                        {match.referee && <span>• Wasit: {match.referee}</span>}
                      </div>
                    )}
                  </div>

                  {/* Copy Result Button for CS */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyResult(match)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isCopied
                          ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                          : 'bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Tersalin untuk CS' : 'Salin Hasil (CS)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
