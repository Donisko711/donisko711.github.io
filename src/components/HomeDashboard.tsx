import React from 'react';
import { 
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { ActiveView } from './Sidebar';
import { UserProfile } from '../types';

const LiveScore = React.lazy(() => import('./tools/LiveScore').then(m => ({ default: m.LiveScore })));

interface HomeDashboardProps {
  onNavigate: (view: ActiveView) => void;
  shiftName: string;
  currentUser?: UserProfile | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, shiftName, currentUser }) => {
  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Main Banner Card (Workstation CS & Kasir Terpadu - Tampilan Penuh Lebih Lebar) */}
      <div className="relative w-full rounded-3xl bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Lightweight GPU-accelerated ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/10 rounded-full blur-2xl pointer-events-none transform-gpu"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/5 rounded-full blur-2xl pointer-events-none transform-gpu"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Top tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A]/80 border border-yellow-500/50 text-yellow-400 text-[10px] font-bold font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]"></span>
                👑 {currentUser?.username?.toUpperCase() === 'LEO' ? 'LEO (INTEL SENIOR)' : currentUser?.username?.toUpperCase() === 'YOKA' ? 'YOKA (DJ JUNIOR)' : (currentUser ? `${currentUser.name} (${currentUser.role})` : 'DON ISKO')} • HS GROUP 711
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F3FF]/15 border border-[#00F3FF]/30 text-[#00F3FF] text-[10px] font-bold font-mono">
                ⚡ SHIFT {shiftName || 'PAGI'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SISTEM ONLINE
              </span>
              <button
                type="button"
                onClick={() => onNavigate('livescore')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-[10px] font-mono font-black animate-kelap-kelip-livescore cursor-pointer hover:scale-105 transition-transform"
                title="Buka LiveScore & Jadwal Lengkap (WIB)"
              >
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>LIVESCORE WIB AKTIF</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Workstation CS & Kasir Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              Monitoring jadwal pertandingan resmi, skor realtime (LIVE WIB), dan alur kerja operasional CS & Kasir terintegrasi HS GROUP 711. Seluruh modul dapat langsung diakses melalui menu navigasi di bar atas.
            </p>
          </div>

          {/* Quick System Status Card (Pengganti Kolom Pintasan - Tampilan Bersih & Minimalis) */}
          <div className="flex-shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-3 bg-[#181B26]/80 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3 pr-3 sm:border-r border-white/10">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-[#00F3FF]/30 flex items-center justify-center text-[#00F3FF]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-gray-400">STATUS OPERASIONAL</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  STANDBY AKTIF
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-1 sm:pl-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-gray-400">SINKRONISASI JADWAL</div>
                <div className="text-xs font-bold text-yellow-300 font-mono">
                  REALTIME WIB (UTC+7)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tampilan LiveScore Utama di Bagian Depan (Layar Penuh Lebih Lebar & Responsif) */}
      <div className="w-full">
        <React.Suspense fallback={
          <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-3xl bg-[#121212]/80 border border-white/10 space-y-3">
            <div className="w-8 h-8 border-2 border-[#00F3FF]/20 border-t-[#00F3FF] rounded-full animate-spin shadow-[0_0_15px_rgba(0,243,255,0.3)]"></div>
            <div className="text-xs text-gray-400 font-mono tracking-wider">Memuat LiveScore Realtime (WIB)...</div>
          </div>
        }>
          <LiveScore />
        </React.Suspense>
      </div>
    </div>
  );
};

