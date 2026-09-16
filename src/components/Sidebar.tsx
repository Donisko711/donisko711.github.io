import React, { useState } from 'react';
import { 
  Home, 
  CheckSquare, 
  ShieldAlert, 
  FileText, 
  Calculator, 
  Dices, 
  CreditCard, 
  FileSpreadsheet, 
  Bot, 
  TrendingUp, 
  Trophy, 
  Sparkles, 
  Flame, 
  ChevronDown, 
  ChevronRight,
  Laptop,
  Coins,
  GraduationCap,
  WalletCards,
  Zap,
  Globe,
  Code2,
  Table,
  Radio,
  Activity,
  Gift
} from 'lucide-react';
import { ShiftType, UserProfile } from '../types';

export const OFFICIAL_DON_ISKO_IMG = 'https://ik.imagekit.io/donisko711/donisko711.jpg';

export type ActiveView = 
  | 'home'
  | 'nawala-checker'
  | 'generate-artikel'
  | 'phising-checker'
  | 'bbfs-angka-tarung'
  | 'kalkulator-parlay'
  | 'livescore'
  | 'jobdesk-cs'
  | 'bagi-bonus'
  | 'bagi-bonus-slot'
  | 'bagi-bonus-parlay'
  | 'edit-pembayaran'
  | 'isi-rekapan'
  | 'laporan-cs'
  | 'laporan-cs-ganti-data'
  | 'laporan-cs-locked'
  | 'jobdesk-kasir'
  | 'wd-auto-flop'
  | 'info-wd'
  | 'info-data-pl'
  | 'modul-sportbooks'
  | 'modul-togel-cara'
  | 'modul-togel-hadiah'
  | 'modul-togel-jadwal'
  | 'modul-slot';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedShiftFilter: ShiftType;
  setSelectedShiftFilter: (shift: ShiftType) => void;
  jobdeskCsCount: { done: number; total: number };
  jobdeskKasirCount: { done: number; total: number };
  sidebarImage?: string;
  currentUser?: UserProfile | null;
  onOpenCustomizer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  activeView,
  setActiveView,
  selectedShiftFilter,
  setSelectedShiftFilter,
  jobdeskCsCount = { done: 0, total: 0 },
  jobdeskKasirCount = { done: 0, total: 0 },
  sidebarImage = OFFICIAL_DON_ISKO_IMG,
  currentUser,
  onOpenCustomizer
}) => {
  // Single-open Category Accordion (Minimize Otomatis):
  // Ketika kategori lain diklik, kategori sebelumnya otomatis tertutup dan hanya kategori baru yang terbuka.
  const [openCategory, setOpenCategory] = useState<string | null>(() => {
    if (['generate-artikel', 'bbfs-angka-tarung', 'kalkulator-parlay'].includes(activeView)) {
      return 'alat-generate';
    }
    if (['jobdesk-cs', 'bagi-bonus', 'bagi-bonus-slot', 'bagi-bonus-parlay', 'edit-pembayaran', 'isi-rekapan', 'laporan-cs', 'laporan-cs-ganti-data', 'laporan-cs-locked'].includes(activeView)) {
      return 'tools-cs';
    }
    if (['jobdesk-kasir', 'wd-auto-flop', 'info-wd', 'info-data-pl'].includes(activeView)) {
      return 'kasir';
    }
    if (activeView.startsWith('modul-')) {
      return 'modul-sop';
    }
    return null;
  });

  const toggleCategory = (catKey: string) => {
    // Minimize otomatis: klik kategori baru akan menutup semua kategori lain!
    setOpenCategory(prev => (prev === catKey ? null : catKey));
  };

  // Sub-menu accordion open state: Only one sub-menu open at a time (Auto Minimalis)
  const [openAccordion, setOpenAccordion] = useState<string | null>(() => {
    const viewStr = activeView || '';
    if (viewStr.startsWith('jobdesk-cs')) return 'jobdesk-cs';
    if (viewStr.startsWith('bagi-bonus')) return 'bagi-bonus';
    if (viewStr.startsWith('laporan-cs')) return 'laporan-cs';
    if (viewStr.startsWith('jobdesk-kasir')) return 'jobdesk-kasir';
    if (viewStr.startsWith('modul-togel')) return 'modul-togel';
    return null;
  });

  const toggleAccordion = (accordionId: string) => {
    // Minimize otomatis: menutup sub-menu lainnya ketika salah satu sub-menu dibuka
    setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
  };

  const handleSelectView = (view: ActiveView, accordionParent?: string, categoryKey?: string) => {
    if (typeof setActiveView === 'function') {
      setActiveView(view);
    }
    if (categoryKey) {
      setOpenCategory(categoryKey);
    }
    if (accordionParent) {
      setOpenAccordion(accordionParent);
    }
    if (onCloseMobile && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  // Support Ctrl + Click to open target menu in new browser window/tab
  const handleItemClick = (
    e: React.MouseEvent,
    view: ActiveView,
    accordionParent?: string,
    categoryKey?: string
  ) => {
    // Check if Ctrl (Windows/Linux) or Meta/Cmd (Mac) or Middle mouse button was pressed
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      // Allow browser native navigation to open href in new tab (Ctrl+Tab friendly)
      return;
    }
    e.preventDefault();
    handleSelectView(view, accordionParent, categoryKey);
  };

  const isViewInGroup = (views: ActiveView[]) => views.includes(activeView);

  return (
    <aside
      className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] z-50 lg:z-30 transition-all duration-300 ease-in-out flex flex-col bg-[#121216] lg:bg-[#121212]/80 backdrop-blur-xl border-r border-white/10 ${
        isOpen 
          ? 'w-72 translate-x-0 shadow-2xl lg:shadow-none' 
          : '-translate-x-full lg:translate-x-0 lg:w-20'
      }`}
    >
      {/* Sidebar Header Navigation: DASHBOARD UTAMA (Langsung di bagian atas tanpa poster/badge merah) */}
      <div className="p-3 border-b border-white/10 bg-[#0c0c10]/90 flex items-center justify-between gap-2">
        <a
          href="?view=home"
          onClick={(e) => handleItemClick(e, 'home')}
          id="btn-sidebar-home"
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-[24px] transition-all cursor-pointer ${
            activeView === 'home'
              ? 'bg-[#1F1F1F]/90 border border-[#00F3FF] text-[#00F3FF] font-bold shadow-[0_0_15px_rgba(0,243,255,0.25)]'
              : 'bg-[#181818]/70 hover:bg-[#222222]/80 text-gray-300 hover:text-white border border-white/5'
          }`}
        >
          <Home className="w-4 h-4 text-inherit" />
          {isOpen && (
            <span className="font-bold text-xs tracking-wider uppercase font-sans">
              DASHBOARD UTAMA
            </span>
          )}
        </a>

        {/* Close Button on Mobile View */}
        {isOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Scrollable Bubble Menu Items (Compact & Fits All Core Menus) */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-2 text-xs select-none">
        
        {/* ========================================================= */}
        {/* MENU HIGHLIGHT (Berada di Atas Kategori / Bawah Dashboard) */}
        {/* 1. LIVESCORE                                              */}
        {/* 2. PHISING CHECKER                                        */}
        {/* 3. CEK STATUS NAWALA                                      */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131622] to-[#0A0C14] border-2 border-[#00F3FF]/40 shadow-[0_0_20px_rgba(0,243,255,0.18)] p-1.5 space-y-1.5 overflow-hidden transition-all">
            {isOpen ? (
              <div className="px-2 pt-1 pb-0.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00F3FF] animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white font-sans flex items-center gap-1">
                    <span>MENU HIGHLIGHT</span>
                    <span className="text-yellow-400 font-mono text-[9px]">(TOP 3)</span>
                  </span>
                </div>
                <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                  PRIORITAS
                </span>
              </div>
            ) : (
              <div className="w-full text-center text-[9px] font-mono text-yellow-400 py-0.5 font-black uppercase tracking-tighter" title="Menu Highlight">
                TOP
              </div>
            )}

            {/* 1. LIVESCORE */}
            <a
              href="?view=livescore"
              onClick={(e) => handleItemClick(e, 'livescore')}
              id="menu-livescore"
              title="LiveScore - Skor & Jadwal (WIB)"
              className={`w-full px-2.5 py-2 rounded-[18px] transition-all duration-200 cursor-pointer flex items-center ${isOpen ? 'justify-between' : 'justify-center'} group ${
                activeView === 'livescore'
                  ? 'bg-gradient-to-r from-rose-500/30 via-cyan-500/20 to-rose-500/20 border-2 border-rose-400 text-white shadow-[0_0_18px_rgba(244,63,94,0.4)] font-bold'
                  : 'bg-[#141724]/90 hover:bg-[#1E2235] text-gray-200 hover:text-white border border-rose-500/30 hover:border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className={`flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'}`}>
                <div className="p-1.5 rounded-xl bg-rose-500/25 text-rose-400 border border-rose-500/50 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(244,63,94,0.3)] flex-shrink-0">
                  <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                </div>
                {isOpen && (
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black tracking-wide text-white">LIVESCORE</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black font-mono animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[9px] text-rose-300 font-mono block truncate">Skor & Jadwal (WIB)</span>
                  </div>
                )}
              </div>
              {isOpen && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex-shrink-0">
                  WIB
                </span>
              )}
            </a>

            {/* 3. PHISING CHECKER */}
            <a
              href="?view=phising-checker"
              onClick={(e) => handleItemClick(e, 'phising-checker')}
              id="menu-phising-checker"
              title="Phising Checker - Baca Script Page Domain"
              className={`w-full px-2.5 py-2 rounded-[18px] transition-all duration-200 cursor-pointer flex items-center ${isOpen ? 'justify-between' : 'justify-center'} group ${
                activeView === 'phising-checker'
                  ? 'bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-emerald-500/20 border-2 border-emerald-400 text-white shadow-[0_0_18px_rgba(16,185,129,0.4)] font-bold'
                  : 'bg-[#141724]/90 hover:bg-[#1E2235] text-gray-200 hover:text-white border border-emerald-500/30 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
              }`}
            >
              <div className={`flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'}`}>
                <div className="p-1.5 rounded-xl bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.3)] flex-shrink-0">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                </div>
                {isOpen && (
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black tracking-wide text-white">PHISING CHECKER</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-black font-black font-mono">
                        NEW
                      </span>
                    </div>
                    <span className="text-[9px] text-emerald-300 font-mono block truncate">Baca Script Page Domain</span>
                  </div>
                )}
              </div>
              {isOpen && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex-shrink-0">
                  HTML
                </span>
              )}
            </a>

            {/* 4. CEK STATUS NAWALA */}
            <a
              href="?view=nawala-checker"
              onClick={(e) => handleItemClick(e, 'nawala-checker')}
              id="menu-nawala-checker"
              title="Cek Status Nawala - Link & Domain Checker"
              className={`w-full px-2.5 py-2 rounded-[18px] transition-all duration-200 cursor-pointer flex items-center ${isOpen ? 'justify-between' : 'justify-center'} group ${
                activeView === 'nawala-checker'
                  ? 'bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-amber-500/20 border-2 border-amber-400 text-white shadow-[0_0_18px_rgba(245,158,11,0.4)] font-bold'
                  : 'bg-[#141724]/90 hover:bg-[#1E2235] text-gray-200 hover:text-white border border-amber-500/30 hover:border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
              }`}
            >
              <div className={`flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'}`}>
                <div className="p-1.5 rounded-xl bg-amber-500/25 text-amber-400 border border-amber-500/50 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.3)] flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                {isOpen && (
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black tracking-wide text-white">CEK STATUS NAWALA</span>
                    </div>
                    <span className="text-[9px] text-amber-300 font-mono block truncate">Link & Domain Checker</span>
                  </div>
                )}
              </div>
              {isOpen && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex-shrink-0">
                  DNS
                </span>
              )}
            </a>
          </div>

        {/* ========================================================= */}
        {/* CATEGORY: ALAT GENERATE (Collapsible Accordion)            */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-b from-[#211905]/85 to-[#120D02]/90 border border-amber-400/50 p-1.5 overflow-hidden transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            {isOpen ? (
              <button
                onClick={() => toggleCategory('alat-generate')}
                type="button"
                id="btn-toggle-alat-generate"
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-[#1E1605]/95 hover:from-amber-500/35 hover:to-yellow-500/25 border border-amber-400/70 hover:border-amber-300 text-left transition-all cursor-pointer group mb-1.5 shadow-[0_0_10px_rgba(245,158,11,0.18)]"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-[0_0_8px_rgba(250,204,21,0.5)] flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-wider text-yellow-300 font-sans group-hover:text-yellow-200 transition-colors">
                      ALAT GENERATE
                    </span>
                    <span className="text-[9px] text-amber-200/70 font-mono">
                      3 Alat Generator
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-yellow-400 text-black border border-yellow-300 font-black shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                    3 ALAT
                  </span>
                  {openCategory === 'alat-generate' ? (
                    <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300/80 group-hover:text-white" />
                  )}
                </div>
              </button>
            ) : (
              <div 
                onClick={() => toggleCategory('alat-generate')} 
                className="w-full text-center text-[9px] font-mono text-yellow-400 py-1 cursor-pointer font-bold uppercase"
                title="Alat Generate"
              >
                GENERATE
              </div>
            )}

            {/* Collapsible Children of ALAT GENERATE */}
            {openCategory === 'alat-generate' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
                {/* 1. GENERATE ARTIKEL */}
                <a
                  href="?view=generate-artikel"
                  onClick={(e) => handleItemClick(e, 'generate-artikel', undefined, 'alat-generate')}
                  id="menu-generate-artikel"
                  className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    activeView === 'generate-artikel'
                      ? 'bg-[#1F1F1F]/90 border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.2)] font-bold'
                      : 'bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-gray-200 hover:text-white border border-white/5 hover:border-[#00F3FF]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">GENERATE ARTIKEL</span>
                        <span className="text-[9px] text-gray-400 font-mono">SEO & Promo Builder</span>
                      </div>
                    )}
                  </div>
                </a>

                {/* 2. BBFS & ANGKA TARUNG */}
                <a
                  href="?view=bbfs-angka-tarung"
                  onClick={(e) => handleItemClick(e, 'bbfs-angka-tarung', undefined, 'alat-generate')}
                  id="menu-bbfs-tarung"
                  className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    activeView === 'bbfs-angka-tarung'
                      ? 'bg-[#1F1F1F]/90 border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.2)] font-bold'
                      : 'bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-gray-200 hover:text-white border border-white/5 hover:border-[#00F3FF]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      <Dices className="w-4 h-4 text-purple-400" />
                    </div>
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">BBFS & ANGKA TARUNG</span>
                        <span className="text-[9px] text-gray-400 font-mono">Generator 2D/3D/4D</span>
                      </div>
                    )}
                  </div>
                </a>

                {/* 3. KALKULATOR PARLAY */}
                <a
                  href="?view=kalkulator-parlay"
                  onClick={(e) => handleItemClick(e, 'kalkulator-parlay', undefined, 'alat-generate')}
                  id="menu-kalkulator-parlay"
                  className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    activeView === 'kalkulator-parlay'
                      ? 'bg-[#1F1F1F]/90 border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.2)] font-bold'
                      : 'bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-gray-200 hover:text-white border border-white/5 hover:border-[#00F3FF]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                    </div>
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">KALKULATOR PARLAY</span>
                        <span className="text-[9px] text-gray-400 font-mono">Hitung Odds & Payout</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono">HOT</span>
                  )}
                </a>
              </div>
            )}
          </div>

        {/* ========================================================= */}
        {/* CATEGORY 1: TOOLS KERJA CS (Collapsible Single Accordion) */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-b from-[#081C26]/85 to-[#040E14]/90 border border-[#00F3FF]/50 p-1.5 overflow-hidden transition-all shadow-[0_0_15px_rgba(0,243,255,0.15)]">
            {isOpen ? (
              <button
                onClick={() => toggleCategory('tools-cs')}
                type="button"
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#00F3FF]/25 via-cyan-900/40 to-[#081824]/95 hover:from-[#00F3FF]/35 hover:to-cyan-800/40 border border-[#00F3FF]/70 hover:border-[#00F3FF] text-left transition-all cursor-pointer group mb-1.5 shadow-[0_0_10px_rgba(0,243,255,0.18)]"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-[#00F3FF] to-cyan-500 text-black shadow-[0_0_8px_rgba(0,243,255,0.5)] flex-shrink-0">
                    <Laptop className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#00F3FF] font-sans group-hover:text-cyan-200 transition-colors">
                      TOOLS KERJA CS
                    </span>
                    <span className="text-[9px] text-cyan-200/70 font-mono">
                      6 Modul Operasional
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00F3FF] text-black border border-cyan-300 font-black shadow-[0_0_8px_rgba(0,243,255,0.4)]">
                    CS
                  </span>
                  {openCategory === 'tools-cs' ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#00F3FF]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-300/80 group-hover:text-white" />
                  )}
                </div>
              </button>
            ) : (
              <div 
                onClick={() => toggleCategory('tools-cs')} 
                className="w-full text-center text-[10px] font-mono text-[#00F3FF] py-1 cursor-pointer font-bold"
                title="Tools CS"
              >
                CS
              </div>
            )}

            {openCategory === 'tools-cs' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
                {/* 1. JOBDESK CS */}
                <a
                  href="?view=jobdesk-cs"
                  onClick={(e) => handleItemClick(e, 'jobdesk-cs', undefined, 'tools-cs')}
                  id="menu-jobdesk-cs"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    activeView === 'jobdesk-cs'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-[#00F3FF]" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">JOBDESK CS</span>
                        <span className="text-[9px] text-gray-400 font-mono">Pagi • Sore • Malam</span>
                      </div>
                    )}
                  </div>
                </a>

                {/* 2. BAGI BONUS */}
                <a
                  href="?view=bagi-bonus"
                  onClick={(e) => handleItemClick(e, 'bagi-bonus', undefined, 'tools-cs')}
                  id="menu-bagi-bonus"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    isViewInGroup(['bagi-bonus', 'bagi-bonus-slot', 'bagi-bonus-parlay'])
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-gray-400" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="font-semibold text-xs block">BAGI BONUS</span>
                        <span className="text-[9px] text-gray-400 font-mono">Scatter & Parlay</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00F3FF] font-mono font-bold border border-cyan-500/30">
                      SLOT & PARLAY
                    </span>
                  )}
                </a>

                {/* 3. EDIT PEMBAYARAN */}
                <a
                  href="?view=edit-pembayaran"
                  onClick={(e) => handleItemClick(e, 'edit-pembayaran', undefined, 'tools-cs')}
                  id="menu-edit-pembayaran"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    activeView === 'edit-pembayaran'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {isOpen && <span className="font-semibold text-xs">EDIT PEMBAYARAN</span>}
                  </div>
                </a>

                {/* 4. ISI REKAPAN */}
                <a
                  href="?view=isi-rekapan"
                  onClick={(e) => handleItemClick(e, 'isi-rekapan', undefined, 'tools-cs')}
                  id="menu-isi-rekapan"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    activeView === 'isi-rekapan'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Table className="w-4 h-4 text-[#00F3FF]" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="block font-semibold text-xs text-white">ISI REKAPAN</span>
                        <span className="text-[9px] text-[#00F3FF]/80 font-mono">Validasi PL &amp; Koin</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-[#00F3FF] font-mono font-bold border border-cyan-500/30">
                      NEW
                    </span>
                  )}
                </a>

                {/* 5. LAPORAN CS */}
                <a
                  href="?view=laporan-cs"
                  onClick={(e) => handleItemClick(e, 'laporan-cs', undefined, 'tools-cs')}
                  id="menu-laporan-cs"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    isViewInGroup(['laporan-cs', 'laporan-cs-ganti-data', 'laporan-cs-locked'])
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="font-semibold text-xs block">LAPORAN CS</span>
                        <span className="text-[9px] text-gray-400 font-mono">Ganti Data & Locked</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00F3FF] font-mono font-bold border border-cyan-500/30">
                      GANTI &amp; LOCK
                    </span>
                  )}
                </a>
              </div>
            )}
          </div>

        {/* ========================================================= */}
        {/* WD AUTO FLOP (BERADA DI ANTARA TOOLS CS & TOOLS KASIR)     */}
        {/* ========================================================= */}
        <a
          href="?view=wd-auto-flop"
          onClick={(e) => handleItemClick(e, 'wd-auto-flop')}
          id="menu-wd-auto-flop-standalone"
          className={`w-full px-3.5 py-2 rounded-[24px] transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm ${
            activeView === 'wd-auto-flop'
              ? 'bg-gradient-to-r from-emerald-500/30 via-green-600/25 to-[#061C10]/95 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)] font-bold'
              : 'bg-gradient-to-r from-emerald-500/20 via-green-900/30 to-[#06180E]/90 hover:from-emerald-500/30 hover:to-green-800/35 text-gray-200 hover:text-white border border-emerald-400/60 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.18)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-black" />
            </div>
            {isOpen && (
              <div className="text-left">
                <span className="block text-[11px] font-black tracking-wide text-emerald-300 group-hover:text-emerald-200 transition-colors whitespace-nowrap">
                  WD AUTO FLOP
                </span>
                <span className="text-[9px] text-emerald-200/70 font-mono">Auto Withdraw Parser</span>
              </div>
            )}
          </div>
          {isOpen && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400 text-black font-mono border border-emerald-300 font-black shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              PARSING
            </span>
          )}
        </a>

        {/* ========================================================= */}
        {/* CATEGORY 2: TOOLS KERJA KASIR (Collapsible Single Accordion) */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-b from-[#1C0F2E]/85 to-[#0E0617]/90 border border-purple-500/50 p-1.5 overflow-hidden transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('kasir')}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/25 via-indigo-950/40 to-[#180C28]/95 hover:from-purple-600/35 hover:to-indigo-900/45 border border-purple-400/70 hover:border-purple-300 text-left transition-all cursor-pointer group mb-1.5 shadow-[0_0_10px_rgba(168,85,247,0.18)]"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 text-black shadow-[0_0_8px_rgba(168,85,247,0.5)] flex-shrink-0">
                  <Coins className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 font-sans group-hover:text-purple-200 transition-colors">
                    TOOLS KERJA KASIR
                  </span>
                  <span className="text-[9px] text-purple-200/70 font-mono">
                    3 Modul Kasir
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-400 text-black border border-purple-300 font-black shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  KASIR
                </span>
                {openCategory === 'kasir' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300/80 group-hover:text-white" />
                )}
              </div>
            </button>
          ) : (
            <div 
              onClick={() => toggleCategory('kasir')} 
              className="w-full text-center text-[10px] font-mono text-purple-300 py-1 cursor-pointer font-bold"
              title="Tools Kerja Kasir"
            >
              KASIR
            </div>
          )}

          {openCategory === 'kasir' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
              {/* 1. JOBDESK KASIR */}
              <a
                href="?view=jobdesk-kasir"
                onClick={(e) => handleItemClick(e, 'jobdesk-kasir', undefined, 'kasir')}
                id="menu-jobdesk-kasir"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'jobdesk-kasir'
                    ? 'bg-[#1F1F1F] border border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-yellow-400" />
                  {isOpen && (
                    <div className="text-left">
                      <span className="block text-xs font-semibold">JOBDESK KASIR</span>
                      <span className="text-[9px] text-gray-400 font-mono">Pagi • Sore • Malam</span>
                    </div>
                  )}
                </div>
              </a>

              {/* 2. INFO DP / WD */}
              <a
                href="?view=info-wd"
                onClick={(e) => handleItemClick(e, 'info-wd', undefined, 'kasir')}
                id="menu-info-wd"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'info-wd'
                    ? 'bg-[#1F1F1F] border border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <WalletCards className="w-4 h-4 text-yellow-400" />
                  {isOpen && <span className="font-semibold text-xs">INFO DP / WD</span>}
                </div>
                {isOpen && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>}
              </a>

              {/* 3. INFO DATA MEMBER */}
              <a
                href="?view=info-data-pl"
                onClick={(e) => handleItemClick(e, 'info-data-pl', undefined, 'kasir')}
                id="menu-info-data-pl"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'info-data-pl'
                    ? 'bg-[#1F1F1F] border border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  {isOpen && <span className="font-semibold text-xs">INFO DATA MEMBER</span>}
                </div>
              </a>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CATEGORY 3: MODUL BELAJAR (Collapsible Single Accordion)   */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-b from-[#280C1A]/85 to-[#14050D]/90 border border-rose-500/50 p-1.5 overflow-hidden transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('modul-sop')}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-rose-600/25 via-pink-950/40 to-[#220B16]/95 hover:from-rose-600/35 hover:to-pink-900/45 border border-rose-400/70 hover:border-rose-300 text-left transition-all cursor-pointer group mb-1.5 shadow-[0_0_10px_rgba(244,63,94,0.18)]"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 text-black shadow-[0_0_8px_rgba(244,63,94,0.5)] flex-shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-300 font-sans group-hover:text-rose-200 transition-colors">
                    MODUL BELAJAR
                  </span>
                  <span className="text-[9px] text-rose-200/70 font-mono">
                    6 Materi & Training
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-400 text-black border border-rose-300 font-black shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                  SOP
                </span>
                {openCategory === 'modul-sop' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-rose-300" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-rose-300/80 group-hover:text-white" />
                )}
              </div>
            </button>
          ) : (
            <div 
              onClick={() => toggleCategory('modul-sop')} 
              className="w-full text-center text-[10px] font-mono text-rose-300 py-1 cursor-pointer font-bold"
              title="Modul Belajar"
            >
              SOP
            </div>
          )}

          {openCategory === 'modul-sop' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
              {/* MODUL SPORTBOOKS */}
              <a
                href="?view=modul-sportbooks"
                onClick={(e) => handleItemClick(e, 'modul-sportbooks', undefined, 'modul-sop')}
                id="menu-modul-sportbooks"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'modul-sportbooks'
                    ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  {isOpen && <span className="font-semibold text-xs">MODUL SPORTBOOKS</span>}
                </div>
              </a>

              {/* MODUL TOGEL (Sub-accordion) */}
              <div>
                <button
                  onClick={() => toggleAccordion('modul-togel')}
                  id="menu-modul-togel"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    isViewInGroup(['modul-togel-cara', 'modul-togel-hadiah', 'modul-togel-jadwal']) || openAccordion === 'modul-togel'
                      ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Dices className="w-4 h-4 text-emerald-400" />
                    {isOpen && <span className="font-semibold text-xs">MODUL TOGEL</span>}
                  </div>
                  {isOpen && (
                    openAccordion === 'modul-togel' ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>

                {isOpen && openAccordion === 'modul-togel' && (
                  <div className="mt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <a
                      href="?view=modul-togel-cara"
                      onClick={(e) => handleItemClick(e, 'modul-togel-cara', 'modul-togel', 'modul-sop')}
                      className={`block w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-cara'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      CARA BERMAIN TOGEL
                    </a>
                    <a
                      href="?view=modul-togel-hadiah"
                      onClick={(e) => handleItemClick(e, 'modul-togel-hadiah', 'modul-togel', 'modul-sop')}
                      className={`block w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-hadiah'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      HADIAH TOGEL ONLINE
                    </a>
                    <a
                      href="?view=modul-togel-jadwal"
                      onClick={(e) => handleItemClick(e, 'modul-togel-jadwal', 'modul-togel', 'modul-sop')}
                      className={`block w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-jadwal'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      JADWAL PASARAN TOGEL
                    </a>
                  </div>
                )}
              </div>

              {/* MODUL SLOT */}
              <a
                href="?view=modul-slot"
                onClick={(e) => handleItemClick(e, 'modul-slot', undefined, 'modul-sop')}
                id="menu-modul-slot"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'modul-slot'
                    ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  {isOpen && <span className="font-semibold text-xs">MODUL SLOT</span>}
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Poster Cyberpunk 711 HS Group - Diperbesar Ukurannya Panjang ke Bawah untuk Melengkapi Ruang Kosong */}
        {isOpen && (
          <div className="pt-2 px-1 flex-1 min-h-[300px] flex flex-col justify-end">
            <div 
              onClick={currentUser?.username?.toLowerCase() === 'donisko' ? onOpenCustomizer : undefined}
              title={currentUser?.username?.toLowerCase() === 'donisko' ? "Klik untuk Ganti Gambar Poster Sidebar" : "HS GROUP 711"}
              className={`rounded-2xl p-1 bg-gradient-to-b from-[#1E1E28] to-[#101016] border-2 border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.25)] relative overflow-hidden group w-full ${currentUser?.username?.toLowerCase() === 'donisko' ? 'cursor-pointer' : ''}`}
            >
              <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={sidebarImage || OFFICIAL_DON_ISKO_IMG} 
                  alt="711 HS GROUP - By: Don Isko" 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded bg-black/90 text-[#00F3FF] text-[10px] font-mono font-black border border-[#00F3FF]/70 shadow-lg">
                    DON ISKO
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/90 text-yellow-400 text-[10px] font-mono font-black border border-yellow-400/70 shadow-lg">
                    711 HS GROUP
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Footer: DON ISKO - 711 HS GROUP Beserta Foto Resmi Don Isko */}
      <div 
        onClick={currentUser?.username?.toLowerCase() === 'donisko' ? onOpenCustomizer : undefined}
        title={currentUser?.username?.toLowerCase() === 'donisko' ? "Klik untuk Mengatur Profil & Tampilan" : "DON ISKO • 711 HS GROUP"}
        className={`p-3.5 border-t border-white/10 bg-[#0A0A0A]/95 transition-all ${currentUser?.username?.toLowerCase() === 'donisko' ? 'hover:bg-[#121212] cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`flex items-center ${isOpen ? 'justify-center gap-3.5 px-2' : 'justify-center'}`}>
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)] flex-shrink-0 bg-black">
            <img 
              src={OFFICIAL_DON_ISKO_IMG} 
              alt="DON ISKO - 711 HS GROUP" 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          {isOpen && (
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-white font-mono tracking-wider">
                DON ISKO
              </span>
              <span className="text-[10px] text-yellow-400 font-mono tracking-wider font-extrabold">
                711 HS GROUP
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
