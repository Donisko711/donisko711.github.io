import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Check, 
  Clock, 
  Trophy, 
  Flame, 
  Play, 
  Sparkles,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { LiveScoreAlertItem } from '../../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: LiveScoreAlertItem[];
  onClearAlerts: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerSimulation: (type: 'whistle' | 'cheer' | 'kickoff_demo' | 'goal_demo') => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAlerts,
  soundEnabled,
  onToggleSound,
  onTriggerSimulation
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GOAL' | 'KICKOFF' | 'FULLTIME'>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'ALL') return true;
    return a.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0A0C14] border-l-2 border-amber-400/60 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-[#0E101A] flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]">
              <Bell className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                PUSAT NOTIFIKASI BIGMATCH
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Pemberitahuan Gol, Kick-off, dan Hasil Akhir Sepak Bola
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Audio Test & Alert Demo Panel */}
        <div className="p-3 bg-[#111422] border-b border-white/10 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-300 font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              UJI SISTEM AUDIO &amp; NOTIFIKASI
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-mono font-bold">
              AUDIO CHECK
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            Uji coba bunyi peluit wasit, nada selebrasi gol, dan contoh notifikasi popup untuk memastikan audio staff aktif:
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onTriggerSimulation('whistle')}
              className="px-2.5 py-1.5 rounded-lg bg-[#00F3FF]/15 hover:bg-[#00F3FF]/25 text-[#00F3FF] border border-[#00F3FF]/40 text-[10px] font-bold tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#00F3FF]" />
              Tes Peluit Wasit
            </button>
            <button
              type="button"
              onClick={() => onTriggerSimulation('cheer')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              ⚽ Tes Suara Gol
            </button>
            <button
              type="button"
              onClick={() => onTriggerSimulation('kickoff_demo')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 text-[10px] font-bold tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Radio className="w-3 h-3 text-amber-400" />
              Popup Kick-off (Demo)
            </button>
            <button
              type="button"
              onClick={() => onTriggerSimulation('goal_demo')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/40 text-[10px] font-bold tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              📢 Popup Gol (Demo)
            </button>
          </div>
        </div>

        {/* Filter Tabs & Sound Settings */}
        <div className="px-3 py-2 bg-[#0B0D16] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-amber-400 text-black font-black shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Semua ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('GOAL')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterType === 'GOAL'
                  ? 'bg-emerald-400 text-black font-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              ⚽ Gol
            </button>
            <button
              type="button"
              onClick={() => setFilterType('KICKOFF')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterType === 'KICKOFF'
                  ? 'bg-[#00F3FF] text-black font-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              📢 Kick-off
            </button>
            <button
              type="button"
              onClick={() => setFilterType('FULLTIME')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                filterType === 'FULLTIME'
                  ? 'bg-purple-400 text-black font-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              🏆 Hasil FT
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg text-xs cursor-pointer border ${
                soundEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-black text-gray-500 border-white/10'
              }`}
              title={soundEnabled ? 'Suara Aktif' : 'Suara Mute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
            </button>
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={onClearAlerts}
                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs cursor-pointer"
                title="Hapus Riwayat Notifikasi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
              <Bell className="w-10 h-10 text-gray-600 animate-pulse" />
              <div className="text-sm font-bold text-gray-300">Belum Ada Notifikasi</div>
              <p className="text-xs text-gray-500 max-w-xs">
                Notifikasi kickoff, gol, dan hasil kemenangan pertandingan bigmatch akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            filteredAlerts.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.type === 'GOAL'
                    ? 'bg-[#091C12]/80 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : item.type === 'KICKOFF'
                      ? 'bg-[#0A1722]/80 border-[#00F3FF]/40 shadow-[0_0_12px_rgba(0,243,255,0.15)]'
                      : 'bg-[#170C22]/80 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">
                    {item.league}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timeWib}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-gray-200 mt-0.5 leading-snug">
                      {item.message}
                    </p>
                  </div>

                  {item.currentScore && (
                    <span className="px-2 py-0.5 rounded bg-black border border-yellow-400/50 text-yellow-300 font-mono font-black text-xs">
                      {item.currentScore}
                    </span>
                  )}
                </div>

                {item.scorerName && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">
                      Pencetak Gol: <strong className="text-emerald-300">{item.scorerName}</strong>
                    </span>
                    {item.minute && (
                      <span className="text-emerald-400 font-mono font-bold">
                        Menit {item.minute}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0E101A] border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          >
            Tutup Panel Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
};
