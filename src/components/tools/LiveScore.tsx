import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Radio, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  MapPin, 
  ExternalLink,
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { LiveMatch, SportType, MatchStatusFilter } from '../../types';
import { 
  fetchAllLiveScores, 
  getWibDateString, 
  formatWibDate, 
  formatWibTime 
} from '../../services/liveScoreService';

export const LiveScore: React.FC = () => {
  // State
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0); // 0 = Hari ini, -1 = Kemarin, 1 = Besok
  const [customDate, setCustomDate] = useState<string>('');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [currentWibTime, setCurrentWibTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live WIB Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to UTC+7 for WIB
      const wibDate = new Date(now.getTime() + (7 * 3600 * 1000));
      const hours = String(wibDate.getUTCHours()).padStart(2, '0');
      const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(wibDate.getUTCSeconds()).padStart(2, '0');
      setCurrentWibTime(`${hours}:${minutes}:${seconds} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch match data
  const loadMatches = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      let dateQueryStr: string | undefined;
      if (customDate) {
        dateQueryStr = customDate.replace(/-/g, '');
      } else {
        dateQueryStr = getWibDateString(selectedDateOffset);
      }

      const data = await fetchAllLiveScores({
        sport: selectedSport,
        dateStr: dateQueryStr
      });
      setMatches(data);
    } catch (err) {
      console.error('Error loading live scores:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setCountdown(30);
    }
  }, [selectedSport, selectedDateOffset, customDate]);

  // Initial load and reload when date or sport changes
  useEffect(() => {
    loadMatches(true);
  }, [loadMatches]);

  // Auto-refresh countdown (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadMatches(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, loadMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Sport filter
      if (selectedSport !== 'all' && m.sport !== selectedSport) {
        return false;
      }

      // Status filter
      if (statusFilter === 'LIVE' && m.status !== 'LIVE') return false;
      if (statusFilter === 'FINISHED' && m.status !== 'FINISHED') return false;
      if (statusFilter === 'SCHEDULED' && m.status !== 'SCHEDULED') return false;

      // Search query filter (Team name, league, or venue)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchHome = m.homeTeam.name.toLowerCase().includes(q) || m.homeTeam.shortName.toLowerCase().includes(q);
        const matchAway = m.awayTeam.name.toLowerCase().includes(q) || m.awayTeam.shortName.toLowerCase().includes(q);
        const matchLeague = m.league.toLowerCase().includes(q);
        const matchVenue = m.venue ? m.venue.toLowerCase().includes(q) : false;
        if (!matchHome && !matchAway && !matchLeague && !matchVenue) {
          return false;
        }
      }

      return true;
    });
  }, [matches, selectedSport, statusFilter, searchQuery]);

  // Group by league
  const groupedByLeague = useMemo(() => {
    const groups: { [league: string]: { league: string; logo?: string; sport: SportType; matches: LiveMatch[] } } = {};

    filteredMatches.forEach((m) => {
      if (!groups[m.league]) {
        groups[m.league] = {
          league: m.league,
          logo: m.leagueLogo,
          sport: m.sport,
          matches: []
        };
      }
      groups[m.league].matches.push(m);
    });

    return Object.values(groups);
  }, [filteredMatches]);

  // Set default expanded league (prefer the one with LIVE matches or the first league)
  useEffect(() => {
    if (groupedByLeague.length > 0) {
      setExpandedLeague((prev) => {
        // If current expanded league still exists in the filtered list, maintain it
        if (prev && groupedByLeague.some((g) => g.league === prev)) {
          return prev;
        }
        // Otherwise, prioritize league with LIVE matches, or fallback to first league
        const withLive = groupedByLeague.find((g) => g.matches.some((m) => m.status === 'LIVE'));
        return withLive ? withLive.league : groupedByLeague[0].league;
      });
    } else {
      setExpandedLeague(null);
    }
  }, [groupedByLeague]);

  // Summary counts
  const liveCount = useMemo(() => matches.filter((m) => m.status === 'LIVE').length, [matches]);
  const finishedCount = useMemo(() => matches.filter((m) => m.status === 'FINISHED').length, [matches]);
  const scheduledCount = useMemo(() => matches.filter((m) => m.status === 'SCHEDULED').length, [matches]);

  // Copy match summary to clipboard for CS/Staff
  const handleCopyMatchInfo = (m: LiveMatch) => {
    let text = `[LIVESCORE HS 711 - WAKTU INDONESIA BARAT (WIB)]\n`;
    text += `🏆 Kompetisi : ${m.league}\n`;
    text += `⚔️ Pertandingan : ${m.homeTeam.name} vs ${m.awayTeam.name}\n`;
    text += `📅 Jadwal / Waktu : ${m.wibDate} | ${m.wibTime}\n`;
    
    if (m.status === 'LIVE') {
      text += `🔴 Status : LIVE (${m.statusDetail})\n`;
      text += `⚽ Skor Sementara : ${m.homeTeam.score} - ${m.awayTeam.score}\n`;
    } else if (m.status === 'FINISHED') {
      text += `✅ Status : Selesai (Full Time)\n`;
      text += `🎯 Skor Akhir : ${m.homeTeam.score} - ${m.awayTeam.score}\n`;
    } else {
      text += `⏰ Status : Terjadwal (Belum Dimulai)\n`;
      text += `📌 Kick-off : ${m.wibTime}\n`;
    }

    if (m.venue) {
      text += `🏟️ Stadion/Venue : ${m.venue}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedMatchId(m.id);
    setToastMessage(`Skor ${m.homeTeam.shortName} vs ${m.awayTeam.shortName} disalin!`);
    setTimeout(() => {
      setCopiedMatchId(null);
      setToastMessage(null);
    }, 2500);
  };

  const sportsTabs: { id: SportType; label: string; icon: string; count?: number }[] = [
    { id: 'all', label: 'SEMUA OLAHRAGA', icon: '🌟' },
    { id: 'soccer', label: 'SEPAKBOLA', icon: '⚽' },
    { id: 'basketball', label: 'BOLA BASKET', icon: '🏀' },
    { id: 'badminton', label: 'BULU TANGKIS', icon: '🏸' },
    { id: 'tennis', label: 'TENIS', icon: '🎾' },
    { id: 'other', label: 'ESPORTS & LAINNYA', icon: '🎮' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-gray-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16A34A] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & WIB Server Clock */}
      <div className="rounded-2xl bg-[#06070B] p-5 sm:p-6 border-2 border-[#00F3FF] shadow-[0_0_25px_rgba(0,243,255,0.25)] relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-black text-rose-300 border-2 border-rose-500 text-[10px] font-mono font-black tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                LIVESCORE REALTIME RESMI
              </span>
              <span className="px-3 py-1 rounded-full bg-black text-[#00F3FF] border-2 border-[#00F3FF] text-[10px] font-mono font-black tracking-wide flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,243,255,0.35)]">
                <Clock className="w-3 h-3 text-[#00F3FF]" />
                ZONA WAKTU: WIB (UTC+7)
              </span>
              <span className="px-3 py-1 rounded-full bg-yellow-400 text-black border border-yellow-300 text-[10px] font-mono font-black shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                HS GROUP 711
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wide text-white flex items-center gap-2.5">
              <span className="text-[#00F3FF] drop-shadow-[0_0_12px_rgba(0,243,255,0.6)]">LIVESCORE</span>
              <span className="text-gray-400">&amp;</span>
              <span className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]">JADWAL PERTANDINGAN</span>
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Jadwal pertandingan, skor langsung (LIVE), dan riwayat hasil tim olahraga resmi dunia (Sepak Bola, Basket, Badminton, Tenis &amp; eSports). Seluruh waktu otomatis tersinkronisasi dalam <strong className="text-yellow-300 font-bold">WIB (Waktu Indonesia Barat)</strong> untuk memudahkan staf kasir dan CS mengecek tiket dan melayani member.
            </p>
          </div>

          {/* Clock & Realtime Refresh Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 flex-shrink-0">
            <div className="p-3.5 rounded-2xl bg-black border-2 border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.35)] text-right w-full sm:w-auto">
              <div className="text-[10px] uppercase font-mono text-yellow-400 tracking-wider flex items-center justify-end gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                Waktu Realtime WIB
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                {currentWibTime || 'Memuat WIB...'}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  autoRefresh 
                    ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)] hover:bg-emerald-500/20' 
                    : 'bg-black text-gray-400 border-white/20 hover:border-white/40'
                }`}
                title="Toggle Auto Refresh Skor"
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                {autoRefresh ? `Auto: ON (${countdown}s)` : 'Auto: OFF'}
              </button>

              <button
                type="button"
                onClick={() => loadMatches(false)}
                disabled={isRefreshing}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border-2 border-[#00F3FF] text-[11px] font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,243,255,0.3)] active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Neon Box Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 pt-4 border-t-2 border-[#00F3FF]/30">
          <div 
            onClick={() => setStatusFilter('LIVE')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'LIVE' 
                ? 'bg-black border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.45)]' 
                : 'bg-[#090A10] border-white/10 hover:border-rose-500/60'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-300 block font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                Sedang Berlangsung
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">{liveCount} Pertandingan</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-black border-2 border-rose-500 text-rose-300 font-black shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              LIVE
            </span>
          </div>

          <div 
            onClick={() => setStatusFilter('FINISHED')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'FINISHED' 
                ? 'bg-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                : 'bg-[#090A10] border-white/10 hover:border-emerald-500/60'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-300 block font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Riwayat Selesai
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{finishedCount} Selesai</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-black border-2 border-emerald-400 text-emerald-300 font-black shadow-[0_0_10px_rgba(52,211,153,0.3)]">
              FT
            </span>
          </div>

          <div 
            onClick={() => setStatusFilter('SCHEDULED')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'SCHEDULED' 
                ? 'bg-black border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
                : 'bg-[#090A10] border-white/10 hover:border-yellow-400/60'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-300 block font-bold flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-yellow-400" />
                Jadwal Mendatang
              </span>
              <span className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">{scheduledCount} Jadwal</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-black border-2 border-yellow-400 text-yellow-300 font-black shadow-[0_0_10px_rgba(250,204,21,0.3)]">
              UPCOMING
            </span>
          </div>
        </div>
      </div>

      {/* Sports Filter Tabs (Neon Box Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {sportsTabs.map((tab) => {
          const isActive = selectedSport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedSport(tab.id);
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 flex-shrink-0 border-2 ${
                isActive
                  ? 'bg-black border-yellow-400 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.4)]'
                  : 'bg-[#0A0B12] hover:bg-[#121422] text-white border-[#00F3FF]/40 hover:border-[#00F3FF] shadow-sm'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar (Neon Box Style) */}
      <div className="p-4 rounded-2xl bg-[#06070B] border-2 border-[#00F3FF]/60 shadow-[0_0_20px_rgba(0,243,255,0.18)] space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tim / liga / kompetisi..."
              className="w-full pl-9.5 pr-4 py-2 bg-black border-2 border-[#00F3FF]/50 focus:border-[#00F3FF] rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:shadow-[0_0_12px_rgba(0,243,255,0.3)] transition-all font-semibold"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 text-xs font-mono font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Selector Shortcuts & Custom Picker */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <button
              type="button"
              onClick={() => {
                setSelectedDateOffset(-1);
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 ${
                selectedDateOffset === -1 && !customDate
                  ? 'bg-black text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-black text-gray-300 border-white/20 hover:border-white/40'
              }`}
            >
              Kemarin (H-1)
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDateOffset(0);
                setCustomDate('');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 ${
                selectedDateOffset === 0 && !customDate
                  ? 'bg-black text-[#00F3FF] border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                  : 'bg-black text-gray-300 border-white/20 hover:border-white/40'
              }`}
            >
              Hari Ini (LIVE)
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDateOffset(1);
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 ${
                selectedDateOffset === 1 && !customDate
                  ? 'bg-black text-yellow-300 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                  : 'bg-black text-gray-300 border-white/20 hover:border-white/40'
              }`}
            >
              Besok (H+1)
            </button>

            {/* Custom Date Input */}
            <div className="flex items-center gap-1.5 bg-black border-2 border-[#00F3FF]/50 rounded-xl px-2.5 py-1 shadow-[0_0_8px_rgba(0,243,255,0.2)]">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setSelectedDateOffset(999);
                }}
                className="bg-transparent text-[11px] font-mono font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t-2 border-[#00F3FF]/20">
          <span className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-wider pr-1">Filter Status:</span>
          {(['ALL', 'LIVE', 'FINISHED', 'SCHEDULED'] as MatchStatusFilter[]).map((st) => {
            const label = st === 'ALL' ? 'Semua Pertandingan' : st === 'LIVE' ? '🔴 Sedang Main' : st === 'FINISHED' ? '✅ Selesai (FT)' : '📅 Jadwal Mendatang';
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono font-black transition-all cursor-pointer whitespace-nowrap border-2 ${
                  isSelected
                    ? 'bg-black text-yellow-300 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                    : 'bg-black text-gray-300 border-white/10 hover:border-[#00F3FF]/50 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match List Area */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-[#06070B] border-2 border-[#00F3FF] shadow-[0_0_25px_rgba(0,243,255,0.25)] text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-black text-[#00F3FF] border-2 border-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.4)] animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Memuat Data Skor Realtime...</h3>
            <p className="text-xs text-gray-300">Menyinkronkan jadwal dan skor resmi dunia dalam WIB (UTC+7)...</p>
          </div>
        </div>
      ) : groupedByLeague.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#06070B] border-2 border-[#00F3FF] shadow-[0_0_25px_rgba(0,243,255,0.2)] text-center space-y-3">
          <div className="inline-block p-4 rounded-full bg-black text-yellow-400 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-white">Tidak Ada Pertandingan Ditemukan</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Tidak ada pertandingan yang sesuai dengan filter atau kata kunci &ldquo;{searchQuery}&rdquo;. Silakan pilih tanggal lain atau ubah filter cabang olahraga.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSport('all');
              setStatusFilter('ALL');
              setSearchQuery('');
              setSelectedDateOffset(0);
              setCustomDate('');
            }}
            className="px-4 py-2 rounded-xl bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border-2 border-[#00F3FF] text-xs font-mono font-black cursor-pointer transition-all shadow-[0_0_12px_rgba(0,243,255,0.3)]"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick League Menu Bar (Menu Pilihan Liga Cepat) */}
          {groupedByLeague.length > 1 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#06070B] border-2 border-[#00F3FF]/50 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  <span className="text-sm font-black text-white tracking-wide uppercase">
                    MENU PILIHAN LIGA <span className="text-yellow-400 font-mono">({groupedByLeague.length} KOMPETISI)</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span>Klik liga untuk membuka jadwal tim (otomatis menutup liga lain)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-yellow-400/50">
                {groupedByLeague.map((g) => {
                  const isCurrent = expandedLeague === g.league;
                  const gHasLive = g.matches.some((m) => m.status === 'LIVE');
                  return (
                    <button
                      key={g.league}
                      type="button"
                      onClick={() => setExpandedLeague(isCurrent ? null : g.league)}
                      className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border-2 active:scale-95 flex-shrink-0 ${
                        isCurrent
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                          : 'bg-black text-gray-200 hover:text-white border-[#00F3FF]/60 hover:border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.2)] hover:bg-[#00F3FF]/10'
                      }`}
                    >
                      {g.logo ? (
                        <img 
                          src={g.logo} 
                          alt="" 
                          className="w-4 h-4 object-contain rounded-full bg-white/20 p-0.5" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Trophy className={`w-4 h-4 ${isCurrent ? 'text-black' : 'text-yellow-400'}`} />
                      )}
                      <span className="uppercase">{g.league}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black ${
                        isCurrent ? 'bg-black text-yellow-400' : 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40'
                      }`}>
                        {g.matches.length} LAGA
                      </span>
                      {gHasLive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* League Accordion Cards */}
          {groupedByLeague.map((group) => {
            const isLeagueOpen = expandedLeague === group.league;
            const hasLiveMatch = group.matches.some((m) => m.status === 'LIVE');
            const liveMatchesCount = group.matches.filter((m) => m.status === 'LIVE').length;

            return (
              <div 
                key={group.league} 
                className={`rounded-2xl bg-[#06070B] overflow-hidden transition-all duration-300 border-2 ${
                  isLeagueOpen 
                    ? 'border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.35)]' 
                    : 'border-[#00F3FF]/70 hover:border-[#00F3FF] shadow-[0_0_16px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.35)]'
                }`}
              >
                {/* Enlarged Clickable League Header Banner (Menu Style Accordion) */}
                <button
                  type="button"
                  onClick={() => setExpandedLeague(isLeagueOpen ? null : group.league)}
                  className={`w-full text-left p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                    isLeagueOpen
                      ? 'bg-gradient-to-r from-[#141E33] via-[#0C111F] to-[#141E33] border-b-2 border-yellow-400/80'
                      : 'bg-gradient-to-r from-[#0C0E17] via-[#07080E] to-[#0C0E17] hover:bg-[#0F1426]'
                  }`}
                  title={isLeagueOpen ? `Klik untuk meminimize ${group.league}` : `Klik untuk membuka ${group.league}`}
                >
                  {/* Left: Trophy/Logo + Big League Title & Badges */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    {group.logo ? (
                      <img 
                        src={group.logo} 
                        alt={group.league} 
                        className={`w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full bg-black p-1 border-2 transition-all flex-shrink-0 ${
                          isLeagueOpen 
                            ? 'border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.5)]' 
                            : 'border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center border-2 flex-shrink-0 ${
                        isLeagueOpen 
                          ? 'border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.5)]' 
                          : 'border-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                      }`}>
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      </div>
                    )}

                    <div className="min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Enlarged League Title */}
                        <h2 className={`text-base sm:text-xl md:text-2xl font-black uppercase tracking-wider transition-colors drop-shadow-sm ${
                          isLeagueOpen ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]' : 'text-white hover:text-yellow-300'
                        }`}>
                          {group.league}
                        </h2>

                        {/* Sport Pill Badge */}
                        <span className="bg-yellow-400 text-black font-black text-[11px] sm:text-xs px-3 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(250,204,21,0.5)] whitespace-nowrap">
                          {group.sport === 'soccer' ? 'Sepak Bola' : group.sport === 'basketball' ? 'Bola Basket' : group.sport === 'badminton' ? 'Bulu Tangkis' : group.sport === 'tennis' ? 'Tenis' : 'Olahraga Resmi'}
                        </span>

                        {/* Live Matches Indicator in Header */}
                        {hasLiveMatch && (
                          <span className="px-3 py-0.5 rounded-full bg-black border-2 border-rose-500 text-rose-300 text-[10px] sm:text-xs font-mono font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span>{liveMatchesCount} LAGA LIVE</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                        <span className={isLeagueOpen ? 'text-yellow-400 font-bold' : 'text-[#00F3FF]'}>
                          {isLeagueOpen ? '▼ Sedang Ditampilkan (Klik untuk Tutup / Minimize)' : '▶ Klik untuk Menampilkan Jadwal Tim'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Matches Count & Neon Toggle Button */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-mono font-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-black border-2 border-[#00F3FF] text-[#00F3FF] shadow-[0_0_14px_rgba(0,243,255,0.35)] whitespace-nowrap">
                      {group.matches.length} LAGA
                    </span>

                    <div className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center gap-2 transition-all border-2 ${
                      isLeagueOpen
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.55)]'
                        : 'bg-black text-[#00F3FF] border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.3)] hover:bg-[#00F3FF] hover:text-black'
                    }`}>
                      <span className="hidden md:inline">
                        {isLeagueOpen ? 'Tutup Liga' : 'Buka Tim'}
                      </span>
                      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                        isLeagueOpen ? 'rotate-180 text-black' : 'text-current'
                      }`} />
                    </div>
                  </div>
                </button>

                {/* Collapsible Content: Only Shown When isLeagueOpen is True */}
                {isLeagueOpen && (
                  <div>
                    {/* Table Column Header Bar (Desktop & Tablet) */}
                    <div className="hidden md:flex items-center justify-between px-5 py-2.5 bg-[#090A12] border-b border-[#00F3FF]/30 text-[11px] font-mono font-black tracking-wider uppercase text-gray-400">
                      <div className="w-48 text-yellow-400 flex items-center gap-1.5 flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>WAKTU (WIB) &amp; STATUS</span>
                      </div>
                      <div className="flex-1 text-right pr-4 text-white">
                        TIM KANDANG (HOME)
                      </div>
                      <div className="w-28 text-center text-[#00F3FF] flex-shrink-0">
                        SKOR / VS
                      </div>
                      <div className="flex-1 text-left pl-4 text-white">
                        TIM TANDANG (AWAY)
                      </div>
                      <div className="w-44 text-right text-yellow-400 flex-shrink-0">
                        AKSI STAF CS
                      </div>
                    </div>

                    {/* Match Rows List */}
                    <div className="divide-y divide-white/10">
                {group.matches.map((match) => {
                  const isExpanded = expandedMatchId === match.id;
                  const isCopied = copiedMatchId === match.id;
                  const isLive = match.status === 'LIVE';
                  const isFinished = match.status === 'FINISHED';
                  const isScheduled = match.status === 'SCHEDULED' || (!isLive && !isFinished);

                  return (
                    <div 
                      key={match.id} 
                      className={`p-3.5 sm:px-5 sm:py-4 transition-all ${
                        isLive 
                          ? 'bg-[#12070A] hover:bg-[#1A0A0F]' 
                          : 'bg-[#07080D] hover:bg-[#0E101A]'
                      }`}
                    >
                      {/* Desktop / Tablet Sports Table Row */}
                      <div className="hidden md:flex items-center justify-between gap-3">
                        {/* 1. Time / Status Column */}
                        <div className="w-48 flex-shrink-0 flex flex-col justify-center">
                          {isLive ? (
                            <div className="px-3 py-1.5 rounded-xl bg-black border-2 border-rose-500 text-rose-300 text-xs font-mono font-black flex items-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.45)] w-fit">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              <span>LIVE {match.statusDetail}</span>
                            </div>
                          ) : isFinished ? (
                            <div className="px-3 py-1.5 rounded-xl bg-black border-2 border-emerald-400 text-emerald-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.3)] w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{match.statusDetail}</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-black border-2 border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.25)] w-fit">
                              <div className="text-xs font-mono font-black text-yellow-300 flex items-center gap-1">
                                <span>⏰</span>
                                <span>{match.wibTime}</span>
                              </div>
                              <div className="text-[10px] font-mono text-gray-300 whitespace-nowrap">
                                {match.wibDate.split(',')[1] || match.wibDate}
                              </div>
                            </div>
                          )}

                          {match.venue && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-300 truncate max-w-[180px] mt-1.5" title={match.venue}>
                              <MapPin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                              <span className="truncate">{match.venue}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Home Team (Right Aligned) */}
                        <div className="flex-1 min-w-0 flex items-center justify-end gap-3 pr-4">
                          <div className="min-w-0 text-right">
                            <div className="text-sm sm:text-base font-black text-white hover:text-yellow-300 transition-colors truncate drop-shadow-sm">
                              {match.homeTeam.name}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-0.5">
                              {match.homeTeam.form && (
                                <div className="flex items-center gap-1">
                                  {match.homeTeam.form.map((f, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-3.5 h-3.5 rounded text-[8px] font-mono font-black flex items-center justify-center ${
                                        f === 'W' ? 'bg-emerald-500 text-black' :
                                        f === 'D' ? 'bg-yellow-400 text-black' :
                                        'bg-rose-500 text-white'
                                      }`}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {match.homeTeam.record && (
                                <span className="text-[10px] font-mono font-bold text-yellow-300/90 whitespace-nowrap">
                                  {match.homeTeam.record}
                                </span>
                              )}
                            </div>
                          </div>

                          {match.homeTeam.logo ? (
                            <img 
                              src={match.homeTeam.logo} 
                              alt={match.homeTeam.name} 
                              className="w-9 h-9 object-contain rounded-full bg-black p-1 border-2 border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)] flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
                              }}
                            />
                          ) : (
                            <Shield className="w-8 h-8 text-white flex-shrink-0" />
                          )}
                        </div>

                        {/* 3. Central Score / VS Neon Box */}
                        <div className="w-28 flex-shrink-0 flex items-center justify-center">
                          {isScheduled ? (
                            <div className="border-2 border-yellow-400 bg-black text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.45)] px-4 py-1.5 rounded-xl text-center flex flex-col items-center justify-center">
                              <span className="text-sm font-black tracking-widest text-yellow-400">VS</span>
                              <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-wider">JADWAL</span>
                            </div>
                          ) : isLive ? (
                            <div className="border-2 border-rose-500 bg-black text-white shadow-[0_0_18px_rgba(244,63,94,0.5)] px-3.5 py-1 rounded-xl text-center flex items-center justify-center gap-1.5 font-mono font-black text-xl">
                              <span className="text-yellow-400">{match.homeTeam.score}</span>
                              <span className="text-rose-400 animate-pulse">:</span>
                              <span className="text-yellow-400">{match.awayTeam.score}</span>
                            </div>
                          ) : (
                            <div className="border-2 border-[#00F3FF] bg-black text-white shadow-[0_0_14px_rgba(0,243,255,0.35)] px-3.5 py-1 rounded-xl text-center flex items-center justify-center gap-2 font-mono font-black text-xl">
                              <span className="text-white">{match.homeTeam.score}</span>
                              <span className="text-gray-400">-</span>
                              <span className="text-white">{match.awayTeam.score}</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Away Team (Left Aligned) */}
                        <div className="flex-1 min-w-0 flex items-center justify-start gap-3 pl-4">
                          {match.awayTeam.logo ? (
                            <img 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name} 
                              className="w-9 h-9 object-contain rounded-full bg-black p-1 border-2 border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)] flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
                              }}
                            />
                          ) : (
                            <Shield className="w-8 h-8 text-white flex-shrink-0" />
                          )}

                          <div className="min-w-0 text-left">
                            <div className="text-sm sm:text-base font-black text-white hover:text-yellow-300 transition-colors truncate drop-shadow-sm">
                              {match.awayTeam.name}
                            </div>
                            <div className="flex items-center justify-start gap-2 mt-0.5">
                              {match.awayTeam.record && (
                                <span className="text-[10px] font-mono font-bold text-yellow-300/90 whitespace-nowrap">
                                  {match.awayTeam.record}
                                </span>
                              )}
                              {match.awayTeam.form && (
                                <div className="flex items-center gap-1">
                                  {match.awayTeam.form.map((f, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-3.5 h-3.5 rounded text-[8px] font-mono font-black flex items-center justify-center ${
                                        f === 'W' ? 'bg-emerald-500 text-black' :
                                        f === 'D' ? 'bg-yellow-400 text-black' :
                                        'bg-rose-500 text-white'
                                      }`}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 5. CS Action Buttons (Neon Box Style) */}
                        <div className="w-44 flex-shrink-0 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyMatchInfo(match)}
                            className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border-2 ${
                              isCopied
                                ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                                : 'bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                            }`}
                            title="Salin rincian pertandingan untuk CS"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            className="px-3 py-1.5 rounded-xl bg-black hover:bg-yellow-400 text-yellow-400 hover:text-black border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.3)] text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <span>Detail</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Mobile Card Layout (< md) */}
                      <div className="md:hidden space-y-3">
                        {/* Mobile Top Bar: Status & Venue */}
                        <div className="flex items-center justify-between gap-2">
                          {isLive ? (
                            <span className="px-2.5 py-1 rounded-xl bg-black border-2 border-rose-500 text-rose-300 text-[10px] font-mono font-black flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              LIVE {match.statusDetail}
                            </span>
                          ) : isFinished ? (
                            <span className="px-2.5 py-1 rounded-xl bg-black border-2 border-emerald-400 text-emerald-300 text-[10px] font-mono font-black flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {match.statusDetail}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-black border-2 border-[#00F3FF] text-yellow-300 text-[10px] font-mono font-black shadow-[0_0_10px_rgba(0,243,255,0.25)]">
                              ⏰ {match.wibTime} | {match.wibDate.split(',')[1] || match.wibDate}
                            </span>
                          )}

                          {match.venue && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-300 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                              <span className="truncate">{match.venue}</span>
                            </span>
                          )}
                        </div>

                        {/* Mobile Center Bar: Home VS Away */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black border-2 border-[#00F3FF]/40 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
                          {/* Home */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {match.homeTeam.logo ? (
                              <img 
                                src={match.homeTeam.logo} 
                                alt={match.homeTeam.name} 
                                className="w-8 h-8 object-contain rounded-full bg-black p-0.5 border border-white/40 flex-shrink-0"
                              />
                            ) : (
                              <Shield className="w-7 h-7 text-white flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">{match.homeTeam.name}</div>
                              {match.homeTeam.record && (
                                <div className="text-[9px] font-mono text-yellow-400 truncate">{match.homeTeam.record}</div>
                              )}
                            </div>
                          </div>

                          {/* Center Score or VS */}
                          <div className="px-3 flex-shrink-0">
                            {isScheduled ? (
                              <div className="border-2 border-yellow-400 bg-black text-yellow-400 px-2.5 py-1 rounded-lg text-xs font-black shadow-[0_0_10px_rgba(250,204,21,0.35)]">
                                VS
                              </div>
                            ) : (
                              <div className="border-2 border-[#00F3FF] bg-black text-white px-2.5 py-1 rounded-lg text-sm font-mono font-black shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                                <span className={isLive ? 'text-yellow-400' : 'text-white'}>{match.homeTeam.score}</span>
                                <span className="mx-1 text-gray-400">-</span>
                                <span className={isLive ? 'text-yellow-400' : 'text-white'}>{match.awayTeam.score}</span>
                              </div>
                            )}
                          </div>

                          {/* Away */}
                          <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">{match.awayTeam.name}</div>
                              {match.awayTeam.record && (
                                <div className="text-[9px] font-mono text-yellow-400 truncate">{match.awayTeam.record}</div>
                              )}
                            </div>
                            {match.awayTeam.logo ? (
                              <img 
                                src={match.awayTeam.logo} 
                                alt={match.awayTeam.name} 
                                className="w-8 h-8 object-contain rounded-full bg-black p-0.5 border border-white/40 flex-shrink-0"
                              />
                            ) : (
                              <Shield className="w-7 h-7 text-white flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyMatchInfo(match)}
                            className="px-3 py-1.5 rounded-xl bg-black hover:bg-[#00F3FF] text-[#00F3FF] hover:text-black border-2 border-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.25)] font-mono font-black text-xs transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            className="px-3 py-1.5 rounded-xl bg-black hover:bg-yellow-400 text-yellow-400 hover:text-black border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.25)] font-mono font-black text-xs transition-all flex items-center gap-1 active:scale-95"
                          >
                            <span>Detail</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: Head-to-Head & Match Details (Neon Box Style) */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t-2 border-[#00F3FF]/40 bg-black rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in border border-white/10 shadow-[0_0_20px_rgba(0,243,255,0.15)]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Head to Head Record */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-yellow-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                <TrendingUp className="w-4 h-4 text-yellow-400" />
                                Rekor Pertemuan Terakhir (H2H)
                              </h4>
                              {match.h2h && match.h2h.recentMatches && match.h2h.recentMatches.length > 0 ? (
                                <div className="space-y-2">
                                  {match.h2h.recentMatches.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#090A12] text-xs border border-white/10">
                                      <span className="text-gray-400 font-mono text-[10px]">{h.date}</span>
                                      <div className="font-bold text-white">
                                        {h.homeTeam} <span className="font-mono text-yellow-400 mx-1.5 font-black">{h.score}</span> {h.awayTeam}
                                      </div>
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg font-black border ${
                                        h.winner === 'home' ? 'bg-black text-emerald-400 border-emerald-400' :
                                        h.winner === 'away' ? 'bg-black text-[#00F3FF] border-[#00F3FF]' :
                                        'bg-black text-gray-400 border-gray-500'
                                      }`}>
                                        {h.winner === 'home' ? 'Home Win' : h.winner === 'away' ? 'Away Win' : 'Draw'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic bg-[#090A12] p-3 rounded-xl border border-white/10">
                                  Data statistik head-to-head kedua tim dalam proses sinkronisasi server resmi.
                                </p>
                              )}
                            </div>

                            {/* Match Details & Venue Info */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-yellow-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                <Info className="w-4 h-4 text-yellow-400" />
                                Informasi Laga &amp; Venue
                              </h4>
                              <div className="p-3.5 rounded-xl bg-[#090A12] border border-white/10 space-y-2 text-xs">
                                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                  <span className="text-gray-400">Kompetisi:</span>
                                  <span className="font-black text-white">{match.league}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                  <span className="text-gray-400">Jadwal Kick-off:</span>
                                  <span className="font-mono font-black text-yellow-400">{match.wibDate} | {match.wibTime}</span>
                                </div>
                                {match.venue && (
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-gray-400">Stadion / Arena:</span>
                                    <span className="font-bold text-white text-right">{match.venue}</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">Status Pertandingan:</span>
                                  <span className="font-mono font-black text-[#00F3FF]">{match.statusDetail}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    })}
        </div>
      )}

      {/* Footer Info / Guidance for CS & Kasir (Neon Box Style) */}
      <div className="p-4 rounded-2xl bg-[#06070B] border-2 border-[#00F3FF]/50 shadow-[0_0_20px_rgba(0,243,255,0.15)] text-xs text-gray-300 space-y-2">
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <Sparkles className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
          <span className="text-yellow-400">Panduan Penggunaan Livescore untuk Staf CS &amp; Kasir:</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed text-gray-300">
          <li>Seluruh jadwal kick-off otomatis tersinkronisasi dalam <strong className="text-white font-bold">WIB (Waktu Indonesia Barat)</strong> agar staf tidak perlu mengonversi perbedaan jam luar negeri.</li>
          <li>Pertandingan yang belum dimulai menampilkan badge <strong className="text-yellow-400 font-bold">VS</strong> kuning neon berserta jam kick-off.</li>
          <li>Klik tombol <strong className="text-[#00F3FF] font-bold">&ldquo;Salin&rdquo;</strong> biru neon untuk langsung mengambil format memo/livechat yang siap dikirim kepada member.</li>
          <li>Laga yang berstatus <strong className="text-rose-400 font-bold">LIVE</strong> diperbarui otomatis secara realtime setiap 30 detik tanpa perlu merefresh halaman.</li>
        </ul>
      </div>
    </div>
  );
};
