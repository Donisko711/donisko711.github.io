import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Info, 
  ExternalLink,
  Volume2,
  AlertTriangle
} from 'lucide-react';

export interface ClubScheduleInfo {
  id: string;
  name: string;
  shortName: string;
  league: string;
  logo: string;
  statusToday: 'NOT_PLAYING' | 'PLAYING_TODAY' | 'ALREADY_FINISHED';
  statusBadgeText: string;
  lastMatch?: {
    opponent: string;
    score: string;
    dateWib: string;
    status: string;
  };
  nextMatch: {
    opponent: string;
    isHome: boolean;
    competition: string;
    wibDateTime: string;
    dateOffset: number; // 0 = Hari ini, 1 = Besok, etc.
    venue: string;
  };
  specialNotice?: string;
  csReplyTemplate: string;
}

export const VERIFIED_CLUBS: ClubScheduleInfo[] = [
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    league: 'Spanish LALIGA (Spanyol)',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png',
    statusToday: 'NOT_PLAYING',
    statusBadgeText: '🔴 TIDAK MAIN HARI INI (05 Sep 2026)',
    lastMatch: {
      opponent: 'Rayo Vallecano',
      score: 'Rayo 1 - 2 Barcelona',
      dateWib: '01 Sep 2026 02:30 WIB',
      status: 'FT (Selesai Menang)'
    },
    nextMatch: {
      opponent: 'Valencia CF',
      isHome: false,
      competition: 'LALIGA Spanyol (Pekan 4)',
      wibDateTime: 'Minggu, 06 September 2026, 21:15 WIB',
      dateOffset: 1,
      venue: 'Estadio de Mestalla, Valencia'
    },
    specialNotice: 'PERINGATAN STAFF CS: Barcelona dan Real Madrid TIDAK bertanding hari ini (05 Sep 2026)! Laga resmi El Clásico baru akan digelar pada 26 Oktober 2026 pukul 01:00 WIB di Camp Nou.',
    csReplyTemplate: 'Halo Kak, mengenai jadwal FC Barcelona: Hari ini (Sabtu, 05 September 2026) FC Barcelona tidak memiliki jadwal bertanding. Pertandingan resmi berikutnya adalah Valencia CF vs FC Barcelona pada hari Minggu, 06 September 2026 pukul 21:15 WIB. Terima kasih.'
  },
  {
    id: 'madrid',
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    league: 'Spanish LALIGA (Spanyol)',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png',
    statusToday: 'ALREADY_FINISHED',
    statusBadgeText: '⚪ SELESAI MAIN KEMARIN (05 Sep 02:00 WIB)',
    lastMatch: {
      opponent: 'Real Betis',
      score: 'Real Betis 1 - 2 Real Madrid',
      dateWib: 'Sabtu, 05 Sep 2026 02:00 WIB',
      status: 'FT (Selesai Menang 1 - 2)'
    },
    nextMatch: {
      opponent: 'Rayo Vallecano',
      isHome: true,
      competition: 'LALIGA Spanyol (Pekan 5)',
      wibDateTime: 'Sabtu, 12 September 2026, 02:00 WIB',
      dateOffset: 7,
      venue: 'Santiago Bernabéu, Madrid'
    },
    specialNotice: 'INFO TIKET KASIR: Laga Real Madrid vs Real Betis sudah selesai kemarin dini hari (FT 1-2). Pertandingan pekan ke-5 Real Madrid adalah vs Rayo Vallecano pada 12 September 2026.',
    csReplyTemplate: 'Halo Kak, untuk tim Real Madrid: Pertandingan pekan ke-4 sudah selesai dini hari tadi dengan skor Real Betis 1 - 2 Real Madrid. Pertandingan berikutnya adalah Real Madrid vs Rayo Vallecano pada hari Sabtu, 12 September 2026 pukul 02:00 WIB. Terima kasih.'
  },
  {
    id: 'mancity',
    name: 'Manchester City',
    shortName: 'Man City',
    league: 'English Premier League (Inggris)',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/382.png',
    statusToday: 'PLAYING_TODAY',
    statusBadgeText: '🟢 MAIN HARI INI (21:00 WIB)',
    nextMatch: {
      opponent: 'Coventry City',
      isHome: true,
      competition: 'English Premier League (Pekan 4)',
      wibDateTime: 'Sabtu, 05 September 2026, 21:00 WIB',
      dateOffset: 0,
      venue: 'Etihad Stadium, Manchester'
    },
    specialNotice: 'INFO TIKET KASIR: Laga Manchester City vs Coventry City berlangsung malam ini pukul 21:00 WIB. Tiket aktif dapat dicek di tabel LiveScore hari ini.',
    csReplyTemplate: 'Halo Kak, Manchester City bertanding malam ini: Manchester City vs Coventry City pada hari Sabtu, 05 September 2026 pukul 21:00 WIB (Premier League). Silakan pantau livescore di menu LiveScore. Terima kasih.'
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    shortName: 'Arsenal',
    league: 'English Premier League (Inggris)',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/359.png',
    statusToday: 'NOT_PLAYING',
    statusBadgeText: '🔴 TIDAK MAIN HARI INI (Main Besok)',
    nextMatch: {
      opponent: 'Tottenham Hotspur',
      isHome: false,
      competition: 'Premier League (North London Derby)',
      wibDateTime: 'Minggu, 06 September 2026, 22:30 WIB',
      dateOffset: 1,
      venue: 'Tottenham Hotspur Stadium, London'
    },
    specialNotice: 'Derby London Utara (Tottenham vs Arsenal) baru akan berlangsung besok malam (Minggu, 06 Sep 22:30 WIB).',
    csReplyTemplate: 'Halo Kak, Arsenal tidak bertanding hari ini. Laga berikutnya adalah Big Match North London Derby: Tottenham Hotspur vs Arsenal pada hari Minggu, 06 September 2026 pukul 22:30 WIB. Terima kasih.'
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    league: 'English Premier League (Inggris)',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/364.png',
    statusToday: 'NOT_PLAYING',
    statusBadgeText: '🔴 TIDAK MAIN HARI INI (Main Besok)',
    nextMatch: {
      opponent: 'Everton',
      isHome: true,
      competition: 'Premier League (Merseyside Derby)',
      wibDateTime: 'Minggu, 06 September 2026, 20:00 WIB',
      dateOffset: 1,
      venue: 'Anfield, Liverpool'
    },
    specialNotice: 'Merseyside Derby (Liverpool vs Everton) akan berlangsung besok malam (Minggu, 06 Sep 20:00 WIB).',
    csReplyTemplate: 'Halo Kak, Liverpool tidak bertanding hari ini. Pertandingan berikutnya adalah Liverpool vs Everton pada hari Minggu, 06 September 2026 pukul 20:00 WIB di Anfield. Terima kasih.'
  },
  {
    id: 'persija',
    name: 'Persija Jakarta',
    shortName: 'Persija',
    league: 'BRI Liga 1 Indonesia',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80',
    statusToday: 'NOT_PLAYING',
    statusBadgeText: '🔴 TIDAK MAIN HARI INI (10 Sep 19:00 WIB)',
    nextMatch: {
      opponent: 'PSIS Semarang',
      isHome: true,
      competition: 'BRI Liga 1 Indonesia (Pekan 5)',
      wibDateTime: 'Kamis, 10 September 2026, 19:00 WIB',
      dateOffset: 5,
      venue: 'Jakarta International Stadium (JIS)'
    },
    csReplyTemplate: 'Halo Kak, untuk jadwal Persija Jakarta: Persija bertanding pada hari Kamis, 10 September 2026 pukul 19:00 WIB melawan PSIS Semarang. Terima kasih.'
  },
  {
    id: 'persib',
    name: 'Persib Bandung',
    shortName: 'Persib',
    league: 'BRI Liga 1 Indonesia',
    logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=100&auto=format&fit=crop&q=80',
    statusToday: 'NOT_PLAYING',
    statusBadgeText: '🔴 TIDAK MAIN HARI INI (11 Sep 15:30 WIB)',
    nextMatch: {
      opponent: 'Persebaya Surabaya',
      isHome: false,
      competition: 'BRI Liga 1 Indonesia (Klasik Indonesia)',
      wibDateTime: 'Jumat, 11 September 2026, 15:30 WIB',
      dateOffset: 6,
      venue: 'Stadion Gelora Bung Tomo, Surabaya'
    },
    csReplyTemplate: 'Halo Kak, untuk jadwal Persib Bandung: Persib bertanding pada hari Jumat, 11 September 2026 pukul 15:30 WIB melawan Persebaya Surabaya. Terima kasih.'
  }
];

interface ClubScheduleVerifierProps {
  onFilterClub: (clubName: string, dateOffset?: number) => void;
  onOpenNotificationCenter: () => void;
  onShowToast: (msg: string) => void;
}

export const ClubScheduleVerifier: React.FC<ClubScheduleVerifierProps> = ({
  onFilterClub,
  onOpenNotificationCenter,
  onShowToast
}) => {
  const [selectedClubId, setSelectedClubId] = useState<string>('barcelona');
  const [copiedClubId, setCopiedClubId] = useState<string | null>(null);

  const selectedClub = VERIFIED_CLUBS.find(c => c.id === selectedClubId) || VERIFIED_CLUBS[0];

  const handleCopyReply = (club: ClubScheduleInfo) => {
    navigator.clipboard.writeText(club.csReplyTemplate);
    setCopiedClubId(club.id);
    onShowToast(`✅ Template balasan CS untuk ${club.shortName} berhasil disalin!`);
    setTimeout(() => {
      setCopiedClubId(null);
    }, 2500);
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-[#090B14] border-2 border-[#00F3FF]/40 shadow-[0_0_25px_rgba(0,243,255,0.12)]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00F3FF]/15 border border-[#00F3FF]/50 text-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.3)]">
            <ShieldCheck className="w-5 h-5 text-[#00F3FF]" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span className="text-[#00F3FF] uppercase tracking-wider">PANDUAN VERIFIKASI RESMI JADWAL &amp; TIKET</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 font-bold">
                KHUSUS KASIR &amp; CS
              </span>
            </div>
            <p className="text-[11px] text-gray-300 font-mono mt-0.5">
              Cek keakuratan jadwal klub sebelum memproses tiket atau menjawab pertanyaan member:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNotificationCenter}
          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs font-mono shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 flex-shrink-0"
        >
          <Volume2 className="w-4 h-4 text-black" />
          <span>AUDIO &amp; PUSAT NOTIFIKASI</span>
        </button>
      </div>

      {/* Quick Club Selector Chips */}
      <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {VERIFIED_CLUBS.map((club) => {
          const isSelected = selectedClubId === club.id;
          return (
            <button
              key={club.id}
              type="button"
              onClick={() => setSelectedClubId(club.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-black border-[#00F3FF] text-white shadow-[0_0_15px_rgba(0,243,255,0.4)] ring-1 ring-[#00F3FF]'
                  : 'bg-[#111422] border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              <img 
                src={club.logo} 
                alt={club.name} 
                className="w-4 h-4 object-contain rounded-full bg-white/10 p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} 
              />
              <span>{club.shortName}</span>
              {club.statusToday === 'PLAYING_TODAY' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Verification Card */}
      {selectedClub && (
        <div className="mt-2 p-3.5 rounded-xl bg-black/60 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column: Status & Official Breakdown */}
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src={selectedClub.logo} 
                  alt={selectedClub.name} 
                  className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h4 className="text-sm font-black text-white">{selectedClub.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">{selectedClub.league}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black font-mono border ${
                selectedClub.statusToday === 'PLAYING_TODAY'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : selectedClub.statusToday === 'ALREADY_FINISHED'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/50'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/50'
              }`}>
                {selectedClub.statusBadgeText}
              </span>
            </div>

            {/* Special Notice Alert if any */}
            {selectedClub.specialNotice && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200 font-mono leading-relaxed">
                  {selectedClub.specialNotice}
                </p>
              </div>
            )}

            {/* Last & Next Match Schedules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {selectedClub.lastMatch && (
                <div className="p-2.5 rounded-lg bg-[#111422] border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Laga Terakhir</span>
                  <div className="font-bold text-white text-xs">{selectedClub.lastMatch.opponent}</div>
                  <div className="text-emerald-400 font-black text-xs">{selectedClub.lastMatch.score}</div>
                  <div className="text-[10px] text-gray-400">{selectedClub.lastMatch.dateWib}</div>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-[#111422] border border-[#00F3FF]/20 space-y-1">
                <span className="text-[10px] text-[#00F3FF] uppercase tracking-wider block font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00F3FF]" />
                  Jadwal Resmi Berikutnya
                </span>
                <div className="font-bold text-white text-xs">
                  {selectedClub.nextMatch.isHome ? `${selectedClub.shortName} vs ${selectedClub.nextMatch.opponent}` : `${selectedClub.nextMatch.opponent} vs ${selectedClub.shortName}`}
                </div>
                <div className="text-yellow-300 font-black text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  {selectedClub.nextMatch.wibDateTime}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {selectedClub.nextMatch.venue}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CS Reply Copy Tool & Navigation */}
          <div className="lg:col-span-4 p-3 rounded-xl bg-[#111320] border border-white/10 space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#00F3FF]" />
                Template Balasan CS ke Member
              </span>
              <p className="text-[11px] text-gray-300 font-sans italic bg-black/50 p-2.5 rounded-lg border border-white/5 mt-1 leading-relaxed">
                "{selectedClub.csReplyTemplate}"
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleCopyReply(selectedClub)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00F3FF]/20 to-blue-500/20 hover:from-[#00F3FF]/30 hover:to-blue-500/30 text-[#00F3FF] border border-[#00F3FF]/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              >
                {copiedClubId === selectedClub.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#00F3FF]" />
                    <span>Salin Format Balasan CS</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onFilterClub(selectedClub.shortName, selectedClub.nextMatch.dateOffset)}
                className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-gray-400" />
                <span>Lihat Laga di Tabel LiveScore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
