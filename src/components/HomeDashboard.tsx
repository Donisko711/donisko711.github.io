import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Radio,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { DASHBOARD_MODULE_CARDS } from '../data/initialData';
import { ActiveView } from './Sidebar';
import { LiveScore } from './tools/LiveScore';
import { UserProfile } from '../types';

interface HomeDashboardProps {
  onNavigate: (view: ActiveView) => void;
  shiftName: string;
  currentUser?: UserProfile | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, shiftName, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickPills = [
    { label: 'PHISING CHECKER', view: 'phising-checker' as ActiveView },
    { label: 'CEK STATUS NAWALA', view: 'nawala-checker' as ActiveView },
    { label: 'AUTO WD FLOP', view: 'wd-auto-flop' as ActiveView },
    { label: 'DEPOSIT MANUAL', view: 'edit-pembayaran' as ActiveView },
    { label: 'SALDO WD', view: 'info-wd' as ActiveView },
    { label: 'KALKULATOR PARLAY', view: 'kalkulator-parlay' as ActiveView },
    { label: 'BONUS PARLAY', view: 'bonus-parlay' as ActiveView },
    { label: 'BBFS & ANGKA TARUNG', view: 'bbfs-angka-tarung' as ActiveView },
    { label: 'GENERATE ARTIKEL', view: 'generate-artikel' as ActiveView },
    { label: 'FORM DEPO / WD', view: 'form-depo-wd' as ActiveView },
    { label: 'LAPORAN CS', view: 'laporan-cs' as ActiveView },
    { label: 'JOBDESK CS', view: 'jobdesk-cs' as ActiveView }
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return DASHBOARD_MODULE_CARDS.filter(card => 
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.categoryLabel.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Main Banner Card (Workstation CS & Kasir Terpadu) */}
      <div className="relative w-full rounded-3xl bg-[#121212]/75 backdrop-blur-xl border border-white/10 p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-visible">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Top tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A]/80 border border-yellow-500/50 text-yellow-400 text-[10px] font-bold font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]"></span>
                👑 {currentUser?.username?.toUpperCase() === 'LEO' ? 'LEO (INTEL SENIOR)' : (currentUser?.username?.toUpperCase() || 'DON ISKO')} • HS GROUP 711
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F3FF]/15 border border-[#00F3FF]/30 text-[#00F3FF] text-[10px] font-bold font-mono">
                ⚡ SHIFT {shiftName || 'PAGI'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SISTEM ONLINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                LIVESCORE WIB AKTIF
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Workstation CS & Kasir Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              Monitoring jadwal pertandingan resmi, skor realtime (LIVE WIB), dan modul alur kerja CS & Kasir. Pilih modul pintasan di bawah atau gunakan menu navigasi sebelah kiri.
            </p>
          </div>

          {/* Quick Search bar in Hero */}
          <div className="w-full lg:w-96 space-y-2 flex-shrink-0 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F3FF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari modul / alat CS..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#1A1A1A]/90 border border-white/10 focus:border-[#00F3FF] text-xs text-white placeholder-gray-400 outline-none transition-all backdrop-blur-sm shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Quick Search Results */}
            {searchQuery.trim() && (
              <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#121420]/95 backdrop-blur-2xl border-2 border-[#00F3FF]/40 rounded-2xl p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar">
                <div className="text-[10px] font-mono text-gray-400 px-2 py-1 flex items-center justify-between border-b border-white/10">
                  <span>Hasil Pencarian Modul:</span>
                  <span className="text-[#00F3FF] font-bold">{searchResults.length} ditemukan</span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    Tidak ditemukan modul dengan kata kunci tersebut.
                  </div>
                ) : (
                  searchResults.map(card => (
                    <button
                      key={card.id}
                      onClick={() => {
                        onNavigate(card.actionMenuId as ActiveView);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-[#00F3FF]/15 hover:border-[#00F3FF]/50 border border-white/5 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-[#00F3FF] transition-colors truncate">
                          {card.title}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {card.categoryLabel}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00F3FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-gray-400 px-2 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00F3FF]" />
                Sinkronisasi: Realtime WIB
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A]/80 text-[#00F3FF] font-bold border border-white/10">
                {DASHBOARD_MODULE_CARDS.length} Modul
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Pills Row */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1 mr-1 font-mono">
              ⚡ PINTASAN CEPAT:
            </span>
            {quickPills.map(pill => (
              <button
                key={pill.label}
                onClick={() => onNavigate(pill.view)}
                className="px-3.5 py-1.5 rounded-full bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-[#00F3FF] hover:text-white border border-white/10 hover:border-[#00F3FF]/40 text-xs font-semibold transition-all cursor-pointer backdrop-blur-sm shadow-sm"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tampilan LiveScore Utama di Bagian Depan (Dibawah Kolom Workstation CS & Kasir Terpadu) */}
      <div className="w-full">
        <LiveScore />
      </div>
    </div>
  );
};
