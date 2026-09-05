import React, { useState } from 'react';
import { Volume2, VolumeX, Flame, Bell, Sparkles, Play, Pause } from 'lucide-react';
import { LiveScoreAlertItem } from '../../../types';

interface LiveScoreTickerProps {
  alerts: LiveScoreAlertItem[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSelectAlert?: (alert: LiveScoreAlertItem) => void;
}

export const LiveScoreTicker: React.FC<LiveScoreTickerProps> = ({
  alerts,
  soundEnabled,
  onToggleSound,
  onOpenNotifications,
  unreadCount,
  onSelectAlert
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Default ticker items if no alerts yet
  const displayItems = alerts.length > 0 ? alerts : [
    {
      id: 'default-info-1',
      type: 'KICKOFF' as const,
      matchId: 'info-laliga-today',
      matchTitle: 'Jadwal Resmi LALIGA Hari Ini (05 Sep 2026)',
      league: 'Spanish LALIGA & Premier League',
      timeWib: '21:15 WIB',
      title: '📢 JADWAL RESMI HARI INI (WIB)',
      message: 'Athletic Club vs Atlético Madrid (21:15 WIB) • Rayo Vallecano vs Racing (23:30 WIB) • Man City vs Coventry (21:00 WIB) • Newcastle vs Bournemouth (18:30 WIB)',
      timestamp: Date.now()
    },
    {
      id: 'default-info-2',
      type: 'KICKOFF' as const,
      matchId: 'info-barca-next',
      matchTitle: 'Jadwal FC Barcelona Berikutnya',
      league: 'Spanish LALIGA (Pekan 4)',
      timeWib: '06 Sep 21:15 WIB',
      title: '📌 INFO CS: FC BARCELONA',
      message: 'Barcelona TIDAK MAIN HARI INI (05 Sep). Laga berikutnya: Valencia vs FC Barcelona besok (Minggu, 06 Sep 2026, 21:15 WIB).',
      timestamp: Date.now() - 1800000
    },
    {
      id: 'default-info-3',
      type: 'FULLTIME' as const,
      matchId: 'info-madrid-recent',
      matchTitle: 'Hasil & Jadwal Real Madrid',
      league: 'Spanish LALIGA',
      timeWib: '12 Sep 02:00 WIB',
      title: '📌 INFO CS: REAL MADRID',
      message: 'Hasil laga terakhir: Real Betis 1-2 Real Madrid. Pertandingan berikutnya: Real Madrid vs Rayo Vallecano pada Sabtu, 12 Sep 2026 pukul 02:00 WIB.',
      timestamp: Date.now() - 3600000
    },
    {
      id: 'default-info-4',
      type: 'KICKOFF' as const,
      matchId: 'info-el-clasico-date',
      matchTitle: 'Jadwal Resmi El Clásico 2026',
      league: 'Spanish LALIGA (Pekan 10)',
      timeWib: '26 Okt 01:00 WIB',
      title: '⚡ JADWAL RESMI EL CLÁSICO',
      message: 'Laga resmi FC Barcelona vs Real Madrid di Camp Nou dijadwalkan pada 26 Oktober 2026 pukul 01:00 WIB (Bukan hari ini).',
      timestamp: Date.now() - 5400000
    }
  ];

  return (
    <div className="w-full bg-[#08090D] border-2 border-amber-400/60 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-stretch">
      {/* Ticker Fixed Header Label */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black px-3.5 py-2 flex items-center justify-between sm:justify-center gap-2 flex-shrink-0 font-black text-xs uppercase tracking-wider select-none shadow-md">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-black animate-bounce" />
          <span className="font-extrabold text-[11px] whitespace-nowrap drop-shadow-sm">
            BIGMATCH TEXT BERJALAN
          </span>
        </div>
        <span className="sm:hidden flex items-center gap-1 text-[10px] font-mono bg-black text-yellow-300 px-2 py-0.5 rounded-full font-bold">
          LIVE WIB
        </span>
      </div>

      {/* Marquee Body */}
      <div 
        className="flex-1 overflow-hidden relative py-2 sm:py-2.5 px-3 bg-black/80 flex items-center cursor-pointer group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        title="Klik item untuk melihat detail notifikasi"
      >
        <div 
          className={`flex items-center gap-8 whitespace-nowrap ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            display: 'inline-flex',
            willChange: 'transform'
          }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => onSelectAlert?.(item)}
              className="inline-flex items-center gap-2 text-xs transition-colors hover:text-yellow-300"
            >
              {/* Type Badge */}
              {item.type === 'GOAL' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black text-[10px] tracking-wide flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <span className="animate-ping w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  GOOOL {item.minute || ''}
                </span>
              )}
              {item.type === 'KICKOFF' && (
                <span className="px-2 py-0.5 rounded-md bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/50 font-black text-[10px] tracking-wide flex items-center gap-1 shadow-[0_0_8px_rgba(0,243,255,0.3)]">
                  📢 KICK-OFF
                </span>
              )}
              {item.type === 'FULLTIME' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/50 font-black text-[10px] tracking-wide flex items-center gap-1 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                  🏆 FULL-TIME
                </span>
              )}

              {/* Match Title & Message */}
              <span className="font-extrabold text-white">
                {item.matchTitle}
              </span>
              <span className="text-gray-400 font-medium">
                :
              </span>
              <span className="text-yellow-300 font-bold">
                {item.message}
              </span>

              {item.currentScore && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-[11px] border border-amber-400/40">
                  [{item.currentScore}]
                </span>
              )}

              <span className="text-gray-600 px-2 font-bold">•</span>
            </div>
          ))}

          {/* Duplicate set to ensure seamless infinite looping */}
          {displayItems.map((item, idx) => (
            <div
              key={`dup-${item.id}-${idx}`}
              onClick={() => onSelectAlert?.(item)}
              className="inline-flex items-center gap-2 text-xs transition-colors hover:text-yellow-300"
            >
              {item.type === 'GOAL' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black text-[10px] tracking-wide flex items-center gap-1">
                  GOOOL {item.minute || ''}
                </span>
              )}
              {item.type === 'KICKOFF' && (
                <span className="px-2 py-0.5 rounded-md bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/50 font-black text-[10px] tracking-wide flex items-center gap-1">
                  📢 KICK-OFF
                </span>
              )}
              {item.type === 'FULLTIME' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/50 font-black text-[10px] tracking-wide flex items-center gap-1">
                  🏆 FULL-TIME
                </span>
              )}

              <span className="font-extrabold text-white">
                {item.matchTitle}
              </span>
              <span className="text-gray-400 font-medium">:</span>
              <span className="text-yellow-300 font-bold">
                {item.message}
              </span>

              {item.currentScore && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-[11px] border border-amber-400/40">
                  [{item.currentScore}]
                </span>
              )}

              <span className="text-gray-600 px-2 font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Pause, Sound, Bell (Notification center trigger) */}
      <div className="bg-[#0D0E15] px-2.5 py-1.5 border-t sm:border-t-0 sm:border-l border-white/10 flex items-center justify-end gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
          title={isPaused ? 'Lanjutkan Animasi Ticker' : 'Jeda Animasi Ticker'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-yellow-400" />}
          <span className="text-[10px] font-mono hidden md:inline">{isPaused ? 'Play' : 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer border ${
            soundEnabled 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
              : 'bg-black text-gray-400 border-white/10 hover:border-white/30'
          }`}
          title={soundEnabled ? 'Suara Alert: AKTIF' : 'Suara Alert: NONAKTIF'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          <span className="text-[10px] font-mono font-bold hidden md:inline">
            {soundEnabled ? 'Suara ON' : 'Mute'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 hover:bg-yellow-400/30 transition-all text-xs flex items-center gap-1 cursor-pointer"
          title="Buka Pusat Notifikasi Bigmatch"
        >
          <Bell className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[10px] font-mono font-bold hidden md:inline">Riwayat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
