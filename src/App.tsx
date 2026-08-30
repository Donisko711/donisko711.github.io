/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveView } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { BackgroundSelectorModal } from './components/BackgroundSelectorModal';
import { HomeDashboard } from './components/HomeDashboard';
import { JobdeskManager } from './components/tools/JobdeskManager';
import { NawalaChecker } from './components/tools/NawalaChecker';
import { ArticleGenerator } from './components/tools/ArticleGenerator';
import { PhisingChecker } from './components/tools/PhisingChecker';
import { ParlayCalculator } from './components/tools/ParlayCalculator';
import { BonusCalculator } from './components/tools/BonusCalculator';
import { BonusParlayCalculator } from './components/tools/BonusParlayCalculator';
import { BbfsGenerator } from './components/tools/BbfsGenerator';
import { EditPembayaran } from './components/tools/EditPembayaran';
import { LaporanCS } from './components/tools/LaporanCS';
import { ScriptChatMemo } from './components/tools/ScriptChatMemo';
import { ScriptChatLC } from './components/tools/ScriptChatLC';
import { WdAutoFlop } from './components/tools/WdAutoFlop';
import { InfoWd } from './components/tools/InfoWd';
import { InfoDataPL } from './components/tools/InfoDataPL';
import { ModulBelajar } from './components/tools/ModulBelajar';
import { AiIntelligence } from './components/tools/AiIntelligence';
import { HadiahTogelOnline } from './components/tools/HadiahTogelOnline';
import { JadwalPasaranTogel } from './components/tools/JadwalPasaranTogel';
import { ShiftType, UserProfile, JobdeskTask } from './types';
import { INITIAL_JOBDESK_CS, INITIAL_JOBDESK_KASIR } from './data/initialData';
import { ChevronRight, Home } from 'lucide-react';
import donIskoBg from './assets/images/don_isko_711_1788035559676.jpg';

export default function App() {
  // Session / User Profile (Updated to SINTA MANIS - Secretary Don Isko)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    username: 'sinta_manis',
    name: 'SINTA MANIS',
    role: 'Secretary Don Isko',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    shift: 'PAGI'
  });

  const [activeShift, setActiveShift] = useState<ShiftType>('PAGI');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Jobdesk tasks state for dynamic counts and task completions
  const [tasks, setTasks] = useState<JobdeskTask[]>(() => {
    return [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
  });

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [bgImage, setBgImage] = useState<string>(donIskoBg); // Official Don Isko 711 Background default

  // Responsive sidebar collapse: automatically open when screen is wide, closed when resized to smaller screen
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active shift with user
  const handleShiftChange = (shift: ShiftType) => {
    setActiveShift(shift);
    if (currentUser) {
      setCurrentUser({ ...currentUser, shift });
    }
  };

  const handleSelectView = (viewId: ActiveView) => {
    setActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveShift(user.shift);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Jobdesk progress counts for the current shift
  const csShiftTasks = tasks.filter(t => t.category === 'CS' && t.shift === activeShift);
  const csDoneCount = csShiftTasks.filter(t => t.completed).length;

  const kasirShiftTasks = tasks.filter(t => t.category === 'KASIR' && t.shift === activeShift);
  const kasirDoneCount = kasirShiftTasks.filter(t => t.completed).length;

  // View title helper for breadcrumb
  const getViewBreadcrumb = () => {
    switch (activeView) {
      case 'home': return { category: 'BERANDA', title: 'Dashboard Ringkasan' };
      case 'ai-intelegency': return { category: 'MENU UTAMA', title: 'AI Intelegency Workstation' };
      case 'nawala-checker': return { category: 'MENU UTAMA', title: 'Nawala & Link Checker' };
      case 'generate-artikel': return { category: 'MENU UTAMA', title: 'Generate Artikel & Promo SEO' };
      case 'phising-checker': return { category: 'MENU UTAMA', title: 'Phising & Script Page Checker' };
      case 'bbfs-angka-tarung': return { category: 'MENU UTAMA', title: 'BBFS & Angka Tarung' };
      case 'kalkulator-parlay': return { category: 'MENU UTAMA', title: 'Kalkulator Hitung Parlay' };
      case 'jobdesk-cs': return { category: 'TOOLS KERJA CS', title: `Jobdesk CS (${activeShift})` };
      case 'bagi-bonus-slot': return { category: 'TOOLS KERJA CS', title: 'Bagi Bonus Slot & Harian' };
      case 'bagi-bonus-parlay': return { category: 'TOOLS KERJA CS', title: 'Bagi Bonus Mix Parlay Win Full' };
      case 'edit-pembayaran': return { category: 'TOOLS KERJA CS', title: 'Edit & Generator Pembayaran' };
      case 'laporan-cs-ganti-data': return { category: 'LAPORAN CS', title: 'Laporan Ganti Data' };
      case 'laporan-cs-locked': return { category: 'LAPORAN CS', title: 'Laporan Locked / Unlock' };
      case 'sc-memo': return { category: 'SCRIPT CHAT', title: 'Script Chat MEMO' };
      case 'sc-lc': return { category: 'SCRIPT CHAT', title: 'Script Chat LiveChat' };
      case 'jobdesk-kasir': return { category: 'KASIR & REKAPAN', title: `Jobdesk Kasir (${activeShift})` };
      case 'wd-auto-flop': return { category: 'KASIR & FINANSIAL', title: 'WD Auto Flop Engine' };
      case 'info-wd': return { category: 'KASIR & FINANSIAL', title: 'Informasi Status WD & Bank' };
      case 'info-data-pl': return { category: 'ANALITIK & CRM', title: 'Info Data Member' };
      case 'modul-sportbooks': return { category: 'INFO PRODUK & GAMES', title: 'MODUL SPORTBOOKS & PARLAY' };
      case 'modul-togel-cara': return { category: 'INFO PRODUK & GAMES', title: 'CARA BERMAIN TOGEL' };
      case 'modul-togel-hadiah': return { category: 'INFO PRODUK & GAMES', title: 'HADIAH TOGEL ONLINE' };
      case 'modul-togel-jadwal': return { category: 'INFO PRODUK & GAMES', title: 'JADWAL PASARAN TOGEL' };
      case 'modul-slot': return { category: 'INFO PRODUK & GAMES', title: 'PANDUAN GAME SLOT' };
      case 'modul-casino': return { category: 'INFO PRODUK & GAMES', title: 'PANDUAN LIVEGAME CASINO' };
      case 'modul-cari-selisih': return { category: 'TRAINING & SOP', title: 'CARA CARI SELISIH SALDO' };
      case 'modul-ganti-docs': return { category: 'TRAINING & SOP', title: 'CARA GANTI DOKUMEN' };
      default: return { category: 'TOOLS', title: 'Menu Utama' };
    }
  };

  const breadcrumb = getViewBreadcrumb();

  return (
    <div 
      className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans relative selection:bg-[#00F3FF] selection:text-black overflow-x-hidden"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark & Glass Overlay if Background Applied */}
      <div className={`min-h-screen ${bgImage ? 'bg-black/25 backdrop-blur-[0.5px]' : 'bg-[#0A0A0A]'}`}>
        {/* Top Header */}
        <Header
          sidebarOpen={isSidebarOpen}
          setSidebarOpen={setIsSidebarOpen}
          currentShift={activeShift}
          setCurrentShift={handleShiftChange}
          user={currentUser}
          onLogout={handleLogout}
          onOpenBgModal={() => setIsBgModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Running Marquee Text Bar (Teks Berjalan Don Isko - Slogan Baru) */}
        <div className="w-full bg-[#121212]/70 backdrop-blur-md border-b border-white/10 py-2 px-4 overflow-hidden relative flex items-center shadow-inner z-20">
          <div className="flex items-center gap-2 pr-4 bg-[#121212]/80 z-10 border-r border-white/10 flex-shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F3FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F3FF]"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00F3FF] uppercase whitespace-nowrap">
              BROADCAST
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center">
            <div className="animate-marquee font-mono text-xs font-bold tracking-wider text-yellow-400">
              <span className="mx-6 flex items-center gap-2 text-white">
                <span className="text-yellow-400">🔥</span> HS GROUP 711 | PANDUAN CS & KASIR | BY : DON ISKO <span className="text-yellow-400">🔥</span>
              </span>
              <span className="mx-4 text-gray-500 font-normal">|</span>
              <span className="mx-6 flex items-center gap-2 text-[#00F3FF]">
                <span>⚡</span> WORK HARD | PLAY HARD | LET IT FLOW | NO PAIN NO GAIN <span>⚡</span>
              </span>
              <span className="mx-4 text-gray-500 font-normal">|</span>
              <span className="mx-6 flex items-center gap-2 text-white">
                <span className="text-yellow-400">🔥</span> SINTA MANIS (Secretary Don Isko) | HS GROUP 711 <span className="text-yellow-400">🔥</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Body Layout (Sidebar + Content - Responsif Geser Otomatis) */}
        <div className="flex min-h-[calc(100vh-65px)] relative overflow-x-hidden">
          {/* Mobile Backdrop Overlay when Sidebar is open */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            />
          )}

          {/* Left Sticky Sidebar Container */}
          <div 
            className={`transition-all duration-300 ease-in-out flex-shrink-0 z-50 lg:z-auto ${
              isSidebarOpen ? 'w-0 lg:w-72' : 'w-0 lg:w-20'
            }`}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              onCloseMobile={() => setIsSidebarOpen(false)}
              activeView={activeView}
              setActiveView={handleSelectView}
              selectedShiftFilter={activeShift}
              setSelectedShiftFilter={handleShiftChange}
              jobdeskCsCount={{ done: csDoneCount, total: csShiftTasks.length }}
              jobdeskKasirCount={{ done: kasirDoneCount, total: kasirShiftTasks.length }}
            />
          </div>

          {/* Right Main Content Area - Otomatis Menyesuaikan Ukuran & Bergeser */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-black/15 backdrop-blur-[0.5px] transition-all duration-300">
            {/* Breadcrumb Navigation Bar */}
            <div className="flex items-center justify-between gap-2 mb-6 p-3.5 rounded-2xl bg-[#121216]/70 backdrop-blur-md border border-white/10 text-xs shadow-lg">
              <div className="flex items-center gap-2 text-gray-300 flex-wrap">
                <button
                  onClick={() => handleSelectView('home')}
                  className="flex items-center gap-1 hover:text-[#00F3FF] font-semibold transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400 font-mono uppercase text-[10px]">{breadcrumb.category}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[#00F3FF] font-semibold">{breadcrumb.title}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                <span>Sistem Operasional Aktif</span>
              </div>
            </div>

            {/* Dynamic View Router */}
            {activeView === 'home' && (
              <HomeDashboard
                onNavigate={handleSelectView}
                shiftName={activeShift}
              />
            )}

            {activeView === 'ai-intelegency' && <AiIntelligence />}

            {activeView === 'jobdesk-cs' && (
              <JobdeskManager
                tasks={tasks}
                onUpdateTasks={setTasks}
                category="CS"
                activeShift={activeShift}
                onShiftChange={handleShiftChange}
              />
            )}

            {activeView === 'jobdesk-kasir' && (
              <JobdeskManager
                tasks={tasks}
                onUpdateTasks={setTasks}
                category="KASIR"
                activeShift={activeShift}
                onShiftChange={handleShiftChange}
              />
            )}

            {activeView === 'nawala-checker' && <NawalaChecker />}

            {activeView === 'generate-artikel' && <ArticleGenerator />}

            {activeView === 'phising-checker' && <PhisingChecker />}

            {activeView === 'kalkulator-parlay' && <ParlayCalculator />}

            {activeView === 'bagi-bonus-slot' && (
              <BonusCalculator />
            )}

            {activeView === 'bagi-bonus-parlay' && (
              <BonusParlayCalculator />
            )}

            {activeView === 'bbfs-angka-tarung' && <BbfsGenerator />}

            {activeView === 'edit-pembayaran' && <EditPembayaran />}

            {activeView === 'laporan-cs-ganti-data' && (
              <LaporanCS initialTab="GANTI_DATA" />
            )}

            {activeView === 'laporan-cs-locked' && (
              <LaporanCS initialTab="LOCKED" />
            )}

            {activeView === 'sc-memo' && <ScriptChatMemo />}

            {activeView === 'sc-lc' && <ScriptChatLC />}

            {activeView === 'wd-auto-flop' && <WdAutoFlop />}

            {activeView === 'info-wd' && <InfoWd />}

            {activeView === 'info-data-pl' && <InfoDataPL />}

            {activeView === 'modul-sportbooks' && (
              <ModulBelajar initialModuleId="sop-games-1" />
            )}

            {activeView === 'modul-togel-cara' && (
              <ModulBelajar initialCategory="Togel" />
            )}

            {activeView === 'modul-togel-hadiah' && (
              <HadiahTogelOnline />
            )}

            {activeView === 'modul-togel-jadwal' && (
              <JadwalPasaranTogel />
            )}

            {activeView === 'modul-slot' && (
              <ModulBelajar initialCategory="Slot" />
            )}

            {activeView === 'modul-casino' && (
              <ModulBelajar initialCategory="Casino" />
            )}

            {activeView === 'modul-cari-selisih' && (
              <ModulBelajar initialModuleId="sop-kasir-1" />
            )}

            {activeView === 'modul-ganti-docs' && (
              <ModulBelajar initialModuleId="sop-keamanan-1" />
            )}
          </main>
        </div>

        {/* Modals */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        <BackgroundSelectorModal
          isOpen={isBgModalOpen}
          onClose={() => setIsBgModalOpen(false)}
          currentBgUrl={bgImage}
          onSelectBgUrl={setBgImage}
        />
      </div>
    </div>
  );
}
