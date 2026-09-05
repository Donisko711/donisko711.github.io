import React, { useEffect } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Check, 
  Copy, 
  Flame, 
  Activity, 
  Sparkles,
  Radio,
  Clock
} from 'lucide-react';
import { LiveScoreAlertItem } from '../../../types';

interface BigMatchAlertPopupProps {
  alert: LiveScoreAlertItem | null;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const BigMatchAlertPopup: React.FC<BigMatchAlertPopupProps> = ({
  alert,
  onClose,
  soundEnabled,
  onToggleSound
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  // Auto dismiss after 8 seconds
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  const handleCopyAlert = () => {
    let text = `📢 [LIVESCORE HS 711 - NOTIFIKASI BIGMATCH]\n`;
    text += `🏆 ${alert.league}\n`;
    text += `⚔️ ${alert.matchTitle}\n`;
    text += `📌 ${alert.title}\n`;
    text += `📝 ${alert.message}\n`;
    if (alert.currentScore) {
      text += `⚽ Skor Sementara: ${alert.currentScore}\n`;
    }
    if (alert.scorerName) {
      text += `🎯 Pencetak Gol: ${alert.scorerName} (${alert.minute || ''})\n`;
    }
    text += `⏰ Waktu: ${alert.timeWib}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGoal = alert.type === 'GOAL';
  const isKickoff = alert.type === 'KICKOFF';
  const isFullTime = alert.type === 'FULLTIME';

  return (
    <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-[460px] animate-in slide-in-from-top-4 duration-300">
      <div 
        className={`rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all ${
          isGoal 
            ? 'bg-[#06170E]/95 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.45)]' 
            : isKickoff 
              ? 'bg-[#06131F]/95 border-[#00F3FF] shadow-[0_0_35px_rgba(0,243,255,0.45)]'
              : 'bg-[#150720]/95 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.45)]'
        }`}
      >
        {/* Animated Background Pulse */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${
          isGoal ? 'bg-emerald-400' : isKickoff ? 'bg-[#00F3FF]' : 'bg-purple-400'
        }`} />

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 mb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            {isGoal && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse">
                <span className="text-xs">⚽</span> GOOOL!
              </span>
            )}
            {isKickoff && (
              <span className="px-2.5 py-1 rounded-full bg-[#00F3FF] text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(0,243,255,0.6)] animate-pulse">
                <Radio className="w-3 h-3 text-black" /> KICK-OFF DIMULAI
              </span>
            )}
            {isFullTime && (
              <span className="px-2.5 py-1 rounded-full bg-purple-400 text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                <Trophy className="w-3 h-3 text-black" /> FULL-TIME
              </span>
            )}

            <span className="text-[10px] font-mono text-gray-300 font-bold">
              {alert.league}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleSound}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Matikan Suara Alert' : 'Aktifkan Suara Alert'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide">
              {alert.matchTitle}
            </h4>
            {alert.currentScore && (
              <div className="px-3 py-1 rounded-xl bg-black border-2 border-yellow-400 text-yellow-300 font-mono font-black text-sm tracking-wider shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                {alert.currentScore}
              </div>
            )}
          </div>

          {/* Goal Scorer Highlight Box */}
          {isGoal && alert.scorerName && (
            <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-400/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-sm">
                  ⚽
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">
                    Pencetak Gol ({alert.scoringTeam || 'Tim'})
                  </div>
                  <div className="text-sm font-extrabold text-emerald-300">
                    {alert.scorerName}
                  </div>
                </div>
              </div>
              {alert.minute && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-400/40">
                  Menit {alert.minute}
                </div>
              )}
            </div>
          )}

          {/* Winner highlight for Full-Time */}
          {isFullTime && alert.winner && (
            <div className="p-2.5 rounded-xl bg-black/60 border border-purple-400/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">
                    Hasil Akhir Pertandingan
                  </div>
                  <div className="text-sm font-extrabold text-purple-300">
                    Pemenang: <span className="text-yellow-300 font-black">{alert.winner}</span>
                  </div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 font-mono font-bold text-xs">
                FT
              </div>
            </div>
          )}

          {/* Kickoff message */}
          {isKickoff && (
            <p className="text-xs text-cyan-200 leading-relaxed bg-black/60 p-2.5 rounded-xl border border-[#00F3FF]/40 font-medium">
              {alert.message}
            </p>
          )}

          {/* Action Row */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {alert.timeWib}
            </span>

            <button
              type="button"
              onClick={handleCopyAlert}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
              <span>{copied ? 'Disalin!' : 'Salin Info'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar for Auto-dismiss */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 overflow-hidden">
          <div 
            className={`h-full animate-shrink-width ${
              isGoal ? 'bg-emerald-400' : isKickoff ? 'bg-[#00F3FF]' : 'bg-purple-400'
            }`}
            style={{ animationDuration: '8000ms', animationTimingFunction: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
};
