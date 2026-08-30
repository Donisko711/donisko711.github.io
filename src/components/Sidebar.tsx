import React, { useState } from 'react';
import { 
  Home, 
  CheckSquare, 
  ShieldAlert, 
  FileText, 
  Calculator, 
  Gift, 
  Dices, 
  CreditCard, 
  FileSpreadsheet, 
  MessageSquare, 
  Headphones, 
  Bot, 
  TrendingUp, 
  Trophy, 
  Sparkles, 
  Gamepad2, 
  Flame, 
  SearchCheck, 
  FileBadge, 
  ChevronDown, 
  ChevronRight,
  Laptop,
  Coins,
  GraduationCap,
  WalletCards,
  Zap,
  Globe,
  Code2
} from 'lucide-react';
import { ShiftType, UserProfile } from '../types';

export const OFFICIAL_DON_ISKO_IMG = 'https://ik.imagekit.io/donisko711/donisko711.jpg';

export type ActiveView = 
  | 'home'
  | 'ai-intelegency'
  | 'nawala-checker'
  | 'generate-artikel'
  | 'phising-checker'
  | 'bbfs-angka-tarung'
  | 'kalkulator-parlay'
  | 'jobdesk-cs'
  | 'bagi-bonus-slot'
  | 'bagi-bonus-parlay'
  | 'edit-pembayaran'
  | 'laporan-cs-ganti-data'
  | 'laporan-cs-locked'
  | 'sc-memo'
  | 'sc-lc'
  | 'jobdesk-kasir'
  | 'wd-auto-flop'
  | 'info-wd'
  | 'info-data-pl'
  | 'modul-sportbooks'
  | 'modul-togel-cara'
  | 'modul-togel-hadiah'
  | 'modul-togel-jadwal'
  | 'modul-slot'
  | 'modul-casino'
  | 'modul-cari-selisih'
  | 'modul-ganti-docs';

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
    if (['ai-intelegency', 'nawala-checker', 'generate-artikel', 'phising-checker', 'bbfs-angka-tarung', 'kalkulator-parlay'].includes(activeView)) {
      return 'menu-utama';
    }
    if (['jobdesk-cs', 'bagi-bonus-slot', 'bagi-bonus-parlay', 'edit-pembayaran', 'laporan-cs-ganti-data', 'laporan-cs-locked', 'sc-memo', 'sc-lc'].includes(activeView)) {
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
        <button
          onClick={() => handleSelectView('home')}
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
        </button>

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
        {/* CATEGORY: MENU UTAMA (Collapsible Accordion)               */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-[#141414]/75 backdrop-blur-md border border-white/10 p-1.5 overflow-hidden transition-all shadow-md">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('menu-utama')}
              type="button"
              id="btn-toggle-menu-utama"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#1E1E24]/90 to-[#18181F]/90 hover:bg-[#25252F]/90 border border-yellow-400/30 text-left transition-all cursor-pointer group mb-1.5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white font-sans group-hover:text-yellow-400 transition-colors">
                    MENU UTAMA
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    6 Fitur Utama
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                  6 UTAMA
                </span>
                {openCategory === 'menu-utama' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                )}
              </div>
            </button>
          ) : (
            <div 
              onClick={() => toggleCategory('menu-utama')} 
              className="w-full text-center text-[10px] font-mono text-yellow-400 py-1 cursor-pointer font-bold"
              title="Menu Utama"
            >
              UTAMA
            </div>
          )}

          {/* Collapsible Children of MENU UTAMA */}
          {openCategory === 'menu-utama' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
              {/* 1. AI INTELEGENCY */}
              <button
                onClick={() => handleSelectView('ai-intelegency', undefined, 'menu-utama')}
                id="menu-ai-intelegency"
                className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  activeView === 'ai-intelegency'
                    ? 'bg-gradient-to-r from-[#00F3FF]/25 to-yellow-400/20 border border-[#00F3FF] text-white shadow-[0_0_15px_rgba(0,243,255,0.3)] font-bold'
                    : 'bg-[#1A1A1A]/80 hover:bg-[#252525]/90 text-gray-200 hover:text-white border border-white/5 hover:border-[#00F3FF]/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-[#00F3FF]/20 to-yellow-400/20 text-[#00F3FF] border border-[#00F3FF]/40 group-hover:scale-105 transition-transform">
                    <Bot className="w-4 h-4 text-[#00F3FF]" />
                  </div>
                  {isOpen && (
                    <div className="text-left">
                      <span className="block text-xs font-bold tracking-wide flex items-center gap-1.5">
                        <span className="text-white">AI INTELEGENCY</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-yellow-400 text-black font-extrabold font-mono animate-pulse">
                          NEW
                        </span>
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">Asisten CS & Kasir 711</span>
                    </div>
                  )}
                </div>
                {isOpen && <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
              </button>

              {/* 2. CEK STATUS NAWALA */}
              <button
                onClick={() => handleSelectView('nawala-checker', undefined, 'menu-utama')}
                id="menu-nawala-checker"
                className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  activeView === 'nawala-checker'
                    ? 'bg-[#1F1F1F]/90 border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.2)] font-bold'
                    : 'bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-gray-200 hover:text-white border border-white/5 hover:border-[#00F3FF]/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  {isOpen && (
                    <div className="text-left">
                      <span className="block text-xs font-semibold">CEK STATUS NAWALA</span>
                      <span className="text-[9px] text-gray-400 font-mono">Link & Domain Checker</span>
                    </div>
                  )}
                </div>
                {isOpen && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-gray-400">DNS</span>
                )}
              </button>

              {/* 3. GENERATE ARTIKEL */}
              <button
                onClick={() => handleSelectView('generate-artikel', undefined, 'menu-utama')}
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
              </button>

              {/* 4. PHISING CHECKER (NEW!) */}
              <button
                onClick={() => handleSelectView('phising-checker', undefined, 'menu-utama')}
                id="menu-phising-checker"
                className={`w-full px-3 py-2 rounded-[20px] transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  activeView === 'phising-checker'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 border border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
                    : 'bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-gray-200 hover:text-white border border-white/5 hover:border-emerald-400/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  {isOpen && (
                    <div className="text-left">
                      <span className="block text-xs font-bold tracking-wide flex items-center gap-1.5">
                        <span className="text-white">PHISING CHECKER</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-black font-extrabold font-mono">
                          NEW
                        </span>
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">Baca Script Page Domain</span>
                    </div>
                  )}
                </div>
                {isOpen && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">HTML</span>
                )}
              </button>

              {/* 5. BBFS & ANGKA TARUNG */}
              <button
                onClick={() => handleSelectView('bbfs-angka-tarung', undefined, 'menu-utama')}
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
              </button>

              {/* 6. KALKULATOR PARLAY */}
              <button
                onClick={() => handleSelectView('kalkulator-parlay', undefined, 'menu-utama')}
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
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CATEGORY 1: TOOLS KERJA CS (Collapsible Single Accordion) */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-[#141414]/70 backdrop-blur-md border border-white/10 p-1.5 overflow-hidden transition-all shadow-md">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('tools-cs')}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#1C1C1C]/80 hover:bg-[#252525]/90 border border-white/10 text-left transition-all cursor-pointer group mb-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#00F3FF]/15 text-[#00F3FF] border border-[#00F3FF]/30">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white font-sans group-hover:text-[#00F3FF] transition-colors">
                    TOOLS KERJA CS
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    6 Modul Operasional
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#121212]/80 text-[#00F3FF] border border-[#00F3FF]/30">
                  CS
                </span>
                {openCategory === 'tools-cs' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#00F3FF]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
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
              {/* 1. JOBDESK CS (Auto Minimalis: klik membuka sub-menu dan menutup accordion lain) */}
              <div>
                <button
                  onClick={() => {
                    toggleAccordion('jobdesk-cs');
                    handleSelectView('jobdesk-cs', 'jobdesk-cs', 'tools-cs');
                  }}
                  id="menu-jobdesk-cs"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    activeView === 'jobdesk-cs' || openAccordion === 'jobdesk-cs'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">JOBDESK CS</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {jobdeskCsCount.done}/{jobdeskCsCount.total}
                      </span>
                      {openAccordion === 'jobdesk-cs' ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#00F3FF]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub Menu Jobdesk CS */}
                {isOpen && openAccordion === 'jobdesk-cs' && (
                  <div className="mt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-1">
                    {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
                      <button
                        key={`cs-shift-${shift}`}
                        onClick={() => {
                          setSelectedShiftFilter(shift);
                          handleSelectView('jobdesk-cs', 'jobdesk-cs', 'tools-cs');
                        }}
                        className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                          activeView === 'jobdesk-cs' && selectedShiftFilter === shift
                            ? 'border-l-2 border-[#00F3FF] text-[#00F3FF] font-bold opacity-100'
                            : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                        }`}
                      >
                        SHIFT {shift === 'PAGI' ? 'PAGI' : shift === 'SORE' ? 'SORE' : 'MALAM'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. BAGI BONUS */}
              <div>
                <button
                  onClick={() => toggleAccordion('bagi-bonus')}
                  id="menu-bagi-bonus"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    isViewInGroup(['bagi-bonus-slot', 'bagi-bonus-parlay']) || openAccordion === 'bagi-bonus'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-gray-400" />
                    {isOpen && <span className="font-semibold text-xs">BAGI BONUS</span>}
                  </div>
                  {isOpen && (
                    openAccordion === 'bagi-bonus' ? <ChevronDown className="w-3.5 h-3.5 text-[#00F3FF]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>

                {isOpen && openAccordion === 'bagi-bonus' && (
                  <div className="mt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <button
                      onClick={() => handleSelectView('bagi-bonus-slot', 'bagi-bonus', 'tools-cs')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'bagi-bonus-slot'
                          ? 'border-l-2 border-[#00F3FF] text-[#00F3FF] font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      SCATTER & HARIAN SLOT
                    </button>
                    <button
                      onClick={() => handleSelectView('bagi-bonus-parlay', 'bagi-bonus', 'tools-cs')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'bagi-bonus-parlay'
                          ? 'border-l-2 border-[#00F3FF] text-[#00F3FF] font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      BONUS PARLAY
                    </button>
                  </div>
                )}
              </div>

              {/* 3. EDIT PEMBAYARAN */}
              <button
                onClick={() => handleSelectView('edit-pembayaran', undefined, 'tools-cs')}
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
              </button>

              {/* 4. LAPORAN CS */}
              <div>
                <button
                  onClick={() => toggleAccordion('laporan-cs')}
                  id="menu-laporan-cs"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    isViewInGroup(['laporan-cs-ganti-data', 'laporan-cs-locked']) || openAccordion === 'laporan-cs'
                      ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                    {isOpen && <span className="font-semibold text-xs">LAPORAN CS</span>}
                  </div>
                  {isOpen && (
                    openAccordion === 'laporan-cs' ? <ChevronDown className="w-3.5 h-3.5 text-[#00F3FF]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>

                {isOpen && openAccordion === 'laporan-cs' && (
                  <div className="mt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <button
                      onClick={() => handleSelectView('laporan-cs-ganti-data', 'laporan-cs', 'tools-cs')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'laporan-cs-ganti-data'
                          ? 'border-l-2 border-[#00F3FF] text-[#00F3FF] font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      LAPORAN GANTI DATA
                    </button>
                    <button
                      onClick={() => handleSelectView('laporan-cs-locked', 'laporan-cs', 'tools-cs')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'laporan-cs-locked'
                          ? 'border-l-2 border-[#00F3FF] text-[#00F3FF] font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      LAPORAN LOCKED / UNLOCK
                    </button>
                  </div>
                )}
              </div>

              {/* 5. SC MEMO */}
              <button
                onClick={() => handleSelectView('sc-memo', undefined, 'tools-cs')}
                id="menu-sc-memo"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'sc-memo'
                    ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  {isOpen && <span className="font-semibold text-xs">SC MEMO</span>}
                </div>
                {isOpen && <span className="text-[10px] text-[#00F3FF] font-mono">+ Add</span>}
              </button>

              {/* 6. SC LC */}
              <button
                onClick={() => handleSelectView('sc-lc', undefined, 'tools-cs')}
                id="menu-sc-lc"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'sc-lc'
                    ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-gray-400" />
                  {isOpen && <span className="font-semibold text-xs">SC LC (LIVECHAT)</span>}
                </div>
                {isOpen && <span className="text-[10px] text-[#00F3FF] font-mono">+ Add</span>}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* WD AUTO FLOP (BERADA DI ANTARA TOOLS CS & TOOLS KASIR)     */}
        {/* ========================================================= */}
        <button
          onClick={() => handleSelectView('wd-auto-flop')}
          id="menu-wd-auto-flop-standalone"
          className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm ${
            activeView === 'wd-auto-flop'
              ? 'bg-gradient-to-r from-emerald-500/25 to-green-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
              : 'bg-[#141414]/85 hover:bg-[#18261e] text-gray-200 hover:text-white border border-white/10 hover:border-emerald-400/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            {isOpen && (
              <div className="text-left">
                <span className="block text-xs font-bold tracking-wide text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                  WD AUTO FLOP
                </span>
                <span className="text-[9px] text-gray-400 font-mono">Auto Withdraw Parser</span>
              </div>
            )}
          </div>
          {isOpen && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              PARSING
            </span>
          )}
        </button>

        {/* ========================================================= */}
        {/* CATEGORY 2: TOOLS KERJA KASIR (Collapsible Single Accordion) */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-[#141414]/70 backdrop-blur-md border border-white/10 p-1.5 overflow-hidden transition-all shadow-md">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('kasir')}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#1C1C1C]/80 hover:bg-[#252525]/90 border border-white/10 text-left transition-all cursor-pointer group mb-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white font-sans group-hover:text-yellow-400 transition-colors">
                    TOOLS KERJA KASIR
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    3 Modul Kasir
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#121212]/80 text-yellow-400 border border-yellow-400/30">
                  KASIR
                </span>
                {openCategory === 'kasir' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                )}
              </div>
            </button>
          ) : (
            <div 
              onClick={() => toggleCategory('kasir')} 
              className="w-full text-center text-[10px] font-mono text-yellow-400 py-1 cursor-pointer font-bold"
              title="Tools Kerja Kasir"
            >
              KASIR
            </div>
          )}

          {openCategory === 'kasir' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
              {/* 1. JOBDESK KASIR (Auto Minimalis) */}
              <div>
                <button
                  onClick={() => {
                    toggleAccordion('jobdesk-kasir');
                    handleSelectView('jobdesk-kasir', 'jobdesk-kasir', 'kasir');
                  }}
                  id="menu-jobdesk-kasir"
                  className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    activeView === 'jobdesk-kasir' || openAccordion === 'jobdesk-kasir'
                      ? 'bg-[#1F1F1F] border border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] font-semibold'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-yellow-400" />
                    {isOpen && (
                      <div className="text-left">
                        <span className="block text-xs font-semibold">JOBDESK KASIR</span>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-yellow-400/80 font-mono">
                        {jobdeskKasirCount.done}/{jobdeskKasirCount.total}
                      </span>
                      {openAccordion === 'jobdesk-kasir' ? (
                        <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub Menu Jobdesk Kasir */}
                {isOpen && openAccordion === 'jobdesk-kasir' && (
                  <div className="mt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-1">
                    {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
                      <button
                        key={`ks-shift-${shift}`}
                        onClick={() => {
                          setSelectedShiftFilter(shift);
                          handleSelectView('jobdesk-kasir', 'jobdesk-kasir', 'kasir');
                        }}
                        className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                          activeView === 'jobdesk-kasir' && selectedShiftFilter === shift
                            ? 'border-l-2 border-yellow-400 text-yellow-300 font-bold opacity-100'
                            : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                        }`}
                      >
                        SHIFT {shift === 'PAGI' ? 'PAGI' : shift === 'SORE' ? 'SORE' : 'MALAM'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. INFO WD */}
              <button
                onClick={() => handleSelectView('info-wd', undefined, 'kasir')}
                id="menu-info-wd"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'info-wd'
                    ? 'bg-[#1F1F1F] border border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <WalletCards className="w-4 h-4 text-yellow-400" />
                  {isOpen && <span className="font-semibold text-xs">INFO WD</span>}
                </div>
                {isOpen && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>}
              </button>

              {/* 3. INFO DATA MEMBER */}
              <button
                onClick={() => handleSelectView('info-data-pl', undefined, 'kasir')}
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
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CATEGORY 3: MODUL BELAJAR (Collapsible Single Accordion)   */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-[#141414]/70 backdrop-blur-md border border-white/10 p-1.5 overflow-hidden transition-all shadow-md">
          {isOpen ? (
            <button
              onClick={() => toggleCategory('modul-sop')}
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#1C1C1C]/80 hover:bg-[#252525]/90 border border-white/10 text-left transition-all cursor-pointer group mb-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white font-sans group-hover:text-emerald-400 transition-colors">
                    MODUL BELAJAR
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    6 Materi & Training
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#121212]/80 text-emerald-400 border border-emerald-500/30">
                  SOP
                </span>
                {openCategory === 'modul-sop' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                )}
              </div>
            </button>
          ) : (
            <div 
              onClick={() => toggleCategory('modul-sop')} 
              className="w-full text-center text-[10px] font-mono text-emerald-400 py-1 cursor-pointer font-bold"
              title="Modul Belajar"
            >
              SOP
            </div>
          )}

          {openCategory === 'modul-sop' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
              {/* MODUL SPORTBOOKS */}
              <button
                onClick={() => handleSelectView('modul-sportbooks', undefined, 'modul-sop')}
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
              </button>

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
                    <button
                      onClick={() => handleSelectView('modul-togel-cara', 'modul-togel', 'modul-sop')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-cara'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      CARA BERMAIN TOGEL
                    </button>
                    <button
                      onClick={() => handleSelectView('modul-togel-hadiah', 'modul-togel', 'modul-sop')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-hadiah'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      HADIAH TOGEL ONLINE
                    </button>
                    <button
                      onClick={() => handleSelectView('modul-togel-jadwal', 'modul-togel', 'modul-sop')}
                      className={`w-full text-left text-xs py-1.5 pl-4 transition-all cursor-pointer ${
                        activeView === 'modul-togel-jadwal'
                          ? 'border-l-2 border-emerald-400 text-emerald-300 font-bold opacity-100'
                          : 'border-l-2 border-gray-700 text-gray-400 hover:text-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      JADWAL PASARAN TOGEL
                    </button>
                  </div>
                )}
              </div>

              {/* MODUL SLOT */}
              <button
                onClick={() => handleSelectView('modul-slot', undefined, 'modul-sop')}
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
              </button>

              {/* MODUL CASINO */}
              <button
                onClick={() => handleSelectView('modul-casino', undefined, 'modul-sop')}
                id="menu-modul-casino"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'modul-casino'
                    ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  {isOpen && <span className="font-semibold text-xs">MODUL CASINO</span>}
                </div>
              </button>

              {/* MODUL CARI SELISIH */}
              <button
                onClick={() => handleSelectView('modul-cari-selisih', undefined, 'modul-sop')}
                id="menu-modul-cari-selisih"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'modul-cari-selisih'
                    ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SearchCheck className="w-4 h-4 text-emerald-400" />
                  {isOpen && <span className="font-semibold text-xs">CARA CARI SELISIH</span>}
                </div>
              </button>

              {/* MODUL GANTI DOKUMEN */}
              <button
                onClick={() => handleSelectView('modul-ganti-docs', undefined, 'modul-sop')}
                id="menu-modul-ganti-docs"
                className={`w-full px-3.5 py-2.5 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView === 'modul-ganti-docs'
                    ? 'bg-[#1F1F1F] border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-semibold'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileBadge className="w-4 h-4 text-emerald-400" />
                  {isOpen && <span className="font-semibold text-xs">CARA GANTI DOKUMEN</span>}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Poster Cyberpunk 711 HS Group - Diperbesar Ukurannya Panjang ke Bawah untuk Melengkapi Ruang Kosong */}
        {isOpen && (
          <div className="pt-2 px-1 flex-1 min-h-[300px] flex flex-col justify-end">
            <div 
              onClick={onOpenCustomizer}
              title="Klik untuk Ganti Gambar Poster Sidebar"
              className="rounded-2xl p-1 bg-gradient-to-b from-[#1E1E28] to-[#101016] border-2 border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.25)] relative overflow-hidden group cursor-pointer w-full"
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
        onClick={onOpenCustomizer}
        title="Klik untuk Mengatur Profil & Tampilan"
        className="p-3.5 border-t border-white/10 bg-[#0A0A0A]/95 hover:bg-[#121212] transition-all cursor-pointer"
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
