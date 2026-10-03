import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Radio, 
  ShieldCheck, 
  Bot, 
  Code2, 
  ShieldAlert, 
  ChevronDown, 
  Sparkles, 
  Laptop, 
  Coins, 
  GraduationCap, 
  CheckSquare, 
  Gift, 
  CreditCard, 
  Table, 
  FileSpreadsheet, 
  FileText, 
  Dices, 
  Calculator, 
  WalletCards, 
  TrendingUp, 
  Trophy
} from 'lucide-react';
import { ActiveView } from './Sidebar';
import { UserProfile } from '../types';

interface TopNavbarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  currentUser?: UserProfile | null;
  jobdeskCsCount?: { done: number; total: number };
  jobdeskKasirCount?: { done: number; total: number };
}

export const TopNavbar: React.FC<TopNavbarProps> = React.memo(({
  activeView,
  onSelectView,
  currentUser,
  jobdeskCsCount = { done: 0, total: 0 },
  jobdeskKasirCount = { done: 0, total: 0 }
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 220);
  };

  const handleItemClick = (e: React.MouseEvent, view: ActiveView) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return; // Allow native browser new tab
    }
    e.preventDefault();
    onSelectView(view);
    setOpenDropdown(null);
  };

  // Group membership helpers
  const isAlatGenerateActive = ['generate-artikel', 'bbfs-angka-tarung', 'kalkulator-parlay'].includes(activeView);
  const isToolsCsActive = ['jobdesk-cs', 'bagi-bonus', 'bagi-bonus-slot', 'bagi-bonus-parlay', 'edit-pembayaran', 'isi-rekapan', 'laporan-cs', 'laporan-cs-ganti-data', 'laporan-cs-locked', 'laporan-cs-crosscheck'].includes(activeView);
  const isToolsKasirActive = ['jobdesk-kasir', 'info-wd', 'info-data-pl'].includes(activeView);
  const isModulBelajarActive = activeView.startsWith('modul-');

  return (
    <div 
      ref={navRef}
      className="w-full bg-[#080A10]/95 backdrop-blur-2xl border-b border-white/10 z-40 shadow-[0_6px_25px_rgba(0,0,0,0.7)] select-none overflow-visible relative py-1"
    >
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 overflow-visible">
        {/* Horizontal Navigation List dengan Kotak Garis Neon Berpembatas di Setiap Button */}
        <nav className="flex items-center gap-1.5 sm:gap-2 py-1 flex-wrap lg:flex-nowrap overflow-visible">
          
          {/* 1. DASHBOARD - Kotak Garis Neon Cyan */}
          <a
            href="?view=home"
            onClick={(e) => handleItemClick(e, 'home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
              activeView === 'home'
                ? 'bg-cyan-500/25 text-[#00F3FF] border-2 border-[#00F3FF] shadow-[0_0_16px_rgba(0,243,255,0.6)]'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,243,255,0.25)] hover:border-[#00F3FF] hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:text-white'
            }`}
            title="Dashboard Utama"
          >
            <Home className="w-3.5 h-3.5 text-[#00F3FF]" />
            <span>DASHBOARD</span>
          </a>

          {/* 2. LIVESCORE (WIB) - Kotak Garis Neon Rose / Red */}
          <a
            href="?view=livescore"
            onClick={(e) => handleItemClick(e, 'livescore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 animate-kelap-kelip-livescore ${
              activeView === 'livescore'
                ? 'bg-rose-500/30 text-rose-200 border-2 border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.65)]'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:border-rose-400 hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:text-white'
            }`}
            title="LiveScore Realtime (WIB)"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>LIVESCORE</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500 text-white font-black shadow-[0_0_8px_rgba(244,63,94,0.7)]">
              LIVE
            </span>
          </a>

          {/* 3. VALIDATOR REKENING - Kotak Garis Neon Yellow / Gold */}
          <a
            href="?view=validator-rekening"
            onClick={(e) => handleItemClick(e, 'validator-rekening')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 animate-kelap-kelip-validator ${
              activeView === 'validator-rekening'
                ? 'bg-yellow-500/30 text-yellow-200 border-2 border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.65)]'
                : 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/60 shadow-[0_0_10px_rgba(250,204,21,0.25)] hover:border-yellow-300 hover:bg-yellow-400/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:text-white'
            }`}
            title="Validator Rekening & E-Wallet Mandiri"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>VALIDATOR REKENING</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-yellow-400 text-black font-black shadow-[0_0_8px_rgba(250,204,21,0.7)]">
              AKTIF
            </span>
          </a>

          {/* 4. WD AUTO FLOP - Kotak Garis Neon Emerald Green */}
          <a
            href="?view=wd-auto-flop"
            onClick={(e) => handleItemClick(e, 'wd-auto-flop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
              activeView === 'wd-auto-flop'
                ? 'bg-emerald-500/30 text-emerald-200 border-2 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.65)]'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:text-white'
            }`}
            title="Auto Withdraw Flop Parser"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>WD AUTO FLOP</span>
          </a>

          {/* 5. PHISING CHECKER - Kotak Garis Neon Cyan / Electric Blue */}
          <a
            href="?view=phising-checker"
            onClick={(e) => handleItemClick(e, 'phising-checker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
              activeView === 'phising-checker'
                ? 'bg-cyan-500/30 text-cyan-200 border-2 border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.65)]'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:text-white'
            }`}
            title="Phising Checker Domain Script"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>PHISING CHECKER</span>
          </a>

          {/* 6. CEK NAWALA - Kotak Garis Neon Amber / Orange */}
          <a
            href="?view=nawala-checker"
            onClick={(e) => handleItemClick(e, 'nawala-checker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
              activeView === 'nawala-checker'
                ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.65)]'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:text-white'
            }`}
            title="Cek Status Nawala & DNS Blokir"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>CEK NAWALA</span>
          </a>

          {/* 7. ALAT GENERATE (Dropdown Menu) - Kotak Garis Neon Yellow / Sparkle */}
          <div 
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter('alat-generate')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'alat-generate' ? null : 'alat-generate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isAlatGenerateActive || openDropdown === 'alat-generate'
                  ? 'bg-yellow-500/30 text-yellow-200 border-2 border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.65)]'
                  : 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/60 shadow-[0_0_10px_rgba(250,204,21,0.25)] hover:border-yellow-300 hover:bg-yellow-400/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>ALAT GENERATE</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'alat-generate' ? 'rotate-180 text-yellow-300' : 'text-yellow-400'}`} />
            </button>

            {/* Dropdown Box (Z-[100] & Clean Dark Glassmorphism) */}
            {openDropdown === 'alat-generate' && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#0D101A] border-2 border-yellow-400/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-1 space-y-1 backdrop-blur-2xl">
                <a
                  href="?view=generate-artikel"
                  onClick={(e) => handleItemClick(e, 'generate-artikel')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'generate-artikel' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">GENERATE ARTIKEL</div>
                    <div className="text-[10px] text-gray-400 font-mono">SEO & Promo Builder</div>
                  </div>
                </a>

                <a
                  href="?view=bbfs-angka-tarung"
                  onClick={(e) => handleItemClick(e, 'bbfs-angka-tarung')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'bbfs-angka-tarung' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Dices className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">BBFS & ANGKA TARUNG</div>
                    <div className="text-[10px] text-gray-400 font-mono">Generator 2D/3D/4D</div>
                  </div>
                </a>

                <a
                  href="?view=kalkulator-parlay"
                  onClick={(e) => handleItemClick(e, 'kalkulator-parlay')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'kalkulator-parlay' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">KALKULATOR PARLAY</div>
                    <div className="text-[10px] text-gray-400 font-mono">Hitung Odds & Payout</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 8. TOOLS CS (Dropdown Menu) - Kotak Garis Neon Cyan / Teal */}
          <div 
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter('tools-cs')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'tools-cs' ? null : 'tools-cs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isToolsCsActive || openDropdown === 'tools-cs'
                  ? 'bg-cyan-500/30 text-cyan-200 border-2 border-[#00F3FF] shadow-[0_0_18px_rgba(0,243,255,0.65)]'
                  : 'bg-cyan-500/10 text-cyan-300 border border-[#00F3FF]/60 shadow-[0_0_10px_rgba(0,243,255,0.25)] hover:border-[#00F3FF] hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#00F3FF]" />
              <span>TOOLS CS</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'tools-cs' ? 'rotate-180 text-cyan-200' : 'text-[#00F3FF]'}`} />
            </button>

            {/* Dropdown Box (Z-[100] & Clean Dark Glassmorphism) */}
            {openDropdown === 'tools-cs' && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#0D101A] border-2 border-[#00F3FF]/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-1 space-y-1 backdrop-blur-2xl">
                <a
                  href="?view=jobdesk-cs"
                  onClick={(e) => handleItemClick(e, 'jobdesk-cs')}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'jobdesk-cs' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-[#00F3FF] flex-shrink-0" />
                    <div>
                      <div className="font-bold">JOBDESK CS</div>
                      <div className="text-[10px] text-gray-400 font-mono">Pagi • Sore • Malam</div>
                    </div>
                  </div>
                  {jobdeskCsCount.total > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00F3FF] font-mono font-bold">
                      {jobdeskCsCount.done}/{jobdeskCsCount.total}
                    </span>
                  )}
                </a>

                <a
                  href="?view=bagi-bonus"
                  onClick={(e) => handleItemClick(e, 'bagi-bonus')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    ['bagi-bonus', 'bagi-bonus-slot', 'bagi-bonus-parlay'].includes(activeView) ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Gift className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">BAGI BONUS</div>
                    <div className="text-[10px] text-gray-400 font-mono">Scatter & Parlay</div>
                  </div>
                </a>

                <a
                  href="?view=edit-pembayaran"
                  onClick={(e) => handleItemClick(e, 'edit-pembayaran')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'edit-pembayaran' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">EDIT PEMBAYARAN</div>
                    <div className="text-[10px] text-gray-400 font-mono">Deposit Manual</div>
                  </div>
                </a>

                <a
                  href="?view=isi-rekapan"
                  onClick={(e) => handleItemClick(e, 'isi-rekapan')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'isi-rekapan' ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Table className="w-4 h-4 text-[#00F3FF] flex-shrink-0" />
                  <div>
                    <div className="font-bold">ISI REKAPAN</div>
                    <div className="text-[10px] text-gray-400 font-mono">Validasi PL & Koin</div>
                  </div>
                </a>

                <a
                  href="?view=laporan-cs"
                  onClick={(e) => handleItemClick(e, 'laporan-cs')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView.startsWith('laporan-cs') ? 'bg-[#00F3FF]/20 text-[#00F3FF] font-bold border border-[#00F3FF]/40' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">LAPORAN CS</div>
                    <div className="text-[10px] text-gray-400 font-mono">Ganti Data & Crosscheck</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 9. TOOLS KASIR (Dropdown Menu) - Kotak Garis Neon Purple / Violet */}
          <div 
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter('kasir')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'kasir' ? null : 'kasir')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isToolsKasirActive || openDropdown === 'kasir'
                  ? 'bg-purple-500/30 text-purple-200 border-2 border-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.65)]'
                  : 'bg-purple-500/10 text-purple-300 border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)] hover:border-purple-300 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              <span>TOOLS KASIR</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'kasir' ? 'rotate-180 text-purple-200' : 'text-purple-400'}`} />
            </button>

            {/* Dropdown Box (Z-[100] & Clean Dark Glassmorphism, Right-aligned to never cut off) */}
            {openDropdown === 'kasir' && (
              <div className="absolute right-0 sm:left-auto lg:right-0 xl:left-0 top-full mt-2 w-64 rounded-2xl bg-[#0D101A] border-2 border-purple-400/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-1 space-y-1 backdrop-blur-2xl">
                <a
                  href="?view=jobdesk-kasir"
                  onClick={(e) => handleItemClick(e, 'jobdesk-kasir')}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'jobdesk-kasir' ? 'bg-purple-500/25 text-purple-200 font-bold border border-purple-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold">JOBDESK KASIR</div>
                      <div className="text-[10px] text-gray-400 font-mono">Pagi • Sore • Malam</div>
                    </div>
                  </div>
                  {jobdeskKasirCount.total > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                      {jobdeskKasirCount.done}/{jobdeskKasirCount.total}
                    </span>
                  )}
                </a>

                <a
                  href="?view=info-wd"
                  onClick={(e) => handleItemClick(e, 'info-wd')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'info-wd' ? 'bg-purple-500/25 text-purple-200 font-bold border border-purple-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <WalletCards className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">INFO DP / WD</div>
                    <div className="text-[10px] text-gray-400 font-mono">Saldo Kasir Realtime</div>
                  </div>
                </a>

                <a
                  href="?view=info-data-pl"
                  onClick={(e) => handleItemClick(e, 'info-data-pl')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'info-data-pl' ? 'bg-purple-500/25 text-purple-200 font-bold border border-purple-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">INFO DATA MEMBER</div>
                    <div className="text-[10px] text-gray-400 font-mono">Pengecekan PL Member</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 10. MODUL BELAJAR (Dropdown Menu) - Kotak Garis Neon Rose / Pink */}
          <div 
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter('modul-sop')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'modul-sop' ? null : 'modul-sop')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isModulBelajarActive || openDropdown === 'modul-sop'
                  ? 'bg-rose-500/30 text-rose-200 border-2 border-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.65)]'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-400/60 shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:border-rose-300 hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
              <span>MODUL BELAJAR</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'modul-sop' ? 'rotate-180 text-rose-200' : 'text-rose-400'}`} />
            </button>

            {/* Dropdown Box (Z-[100] & Clean Dark Glassmorphism, Right-aligned to stay on-screen) */}
            {openDropdown === 'modul-sop' && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0D101A] border-2 border-rose-400/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-1 space-y-1 backdrop-blur-2xl">
                <a
                  href="?view=modul-sportbooks"
                  onClick={(e) => handleItemClick(e, 'modul-sportbooks')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'modul-sportbooks' ? 'bg-rose-500/25 text-rose-200 font-bold border border-rose-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">MODUL SPORTBOOKS</div>
                    <div className="text-[10px] text-gray-400 font-mono">Panduan Pasaran Bola</div>
                  </div>
                </a>

                <a
                  href="?view=modul-togel-cara"
                  onClick={(e) => handleItemClick(e, 'modul-togel-cara')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'modul-togel-cara' ? 'bg-rose-500/25 text-rose-200 font-bold border border-rose-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Dices className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">CARA BERMAIN TOGEL</div>
                    <div className="text-[10px] text-gray-400 font-mono">Panduan Bet 2D/3D/4D</div>
                  </div>
                </a>

                <a
                  href="?view=modul-togel-hadiah"
                  onClick={(e) => handleItemClick(e, 'modul-togel-hadiah')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'modul-togel-hadiah' ? 'bg-rose-500/25 text-rose-200 font-bold border border-rose-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">HADIAH TOGEL ONLINE</div>
                    <div className="text-[10px] text-gray-400 font-mono">Tabel Pembayaran</div>
                  </div>
                </a>

                <a
                  href="?view=modul-togel-jadwal"
                  onClick={(e) => handleItemClick(e, 'modul-togel-jadwal')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'modul-togel-jadwal' ? 'bg-rose-500/25 text-rose-200 font-bold border border-rose-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Table className="w-4 h-4 text-[#00F3FF] flex-shrink-0" />
                  <div>
                    <div className="font-bold">JADWAL PASARAN TOGEL</div>
                    <div className="text-[10px] text-gray-400 font-mono">Jam Buka & Tutup Pasaran</div>
                  </div>
                </a>

                <a
                  href="?view=modul-slot"
                  onClick={(e) => handleItemClick(e, 'modul-slot')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeView === 'modul-slot' ? 'bg-rose-500/25 text-rose-200 font-bold border border-rose-400/50' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">MODUL SLOT ONLINE</div>
                    <div className="text-[10px] text-gray-400 font-mono">SOP & Panduan Game Slot</div>
                  </div>
                </a>
              </div>
            )}
          </div>

        </nav>
      </div>
    </div>
  );
});

TopNavbar.displayName = 'TopNavbar';
