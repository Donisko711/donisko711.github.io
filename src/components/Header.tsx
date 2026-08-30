import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Image as ImageIcon, 
  LogOut, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ShiftType, UserProfile } from '../types';
import donIskoLogo from '../assets/images/don_isko_711_1788035559676.jpg';

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
  currentShift?: ShiftType;
  setCurrentShift?: (shift: ShiftType) => void;
  user?: UserProfile | null;
  currentUser?: UserProfile | null;
  activeShift?: ShiftType;
  onShiftChange?: (shift: ShiftType) => void;
  onLogout: () => void;
  onOpenBgModal: () => void;
  onOpenLoginModal?: () => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  activeMenuTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentShift,
  setCurrentShift,
  user,
  currentUser,
  activeShift,
  onShiftChange,
  onLogout,
  onOpenBgModal,
  soundEnabled = true,
  setSoundEnabled,
  activeMenuTitle
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState(false);

  const effectiveUser = user ?? currentUser ?? null;
  const effectiveShift = currentShift ?? activeShift ?? 'PAGI';

  const handleToggleSidebar = () => {
    if (typeof setSidebarOpen === 'function') {
      setSidebarOpen(prev => !prev);
    }
  };

  const handleToggleSound = () => {
    if (typeof setSoundEnabled === 'function') {
      setSoundEnabled(prev => !prev);
    }
  };

  const handleShiftSelect = (shift: ShiftType) => {
    if (typeof setCurrentShift === 'function') {
      setCurrentShift(shift);
    }
    if (typeof onShiftChange === 'function') {
      onShiftChange(shift);
    }
    setShiftDropdownOpen(false);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      setTimeStr(`${day}-${month}-${year} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getShiftIcon = (shift: ShiftType) => {
    switch (shift) {
      case 'PAGI':
        return <Sunrise className="w-4 h-4 text-amber-300 animate-pulse" />;
      case 'SORE':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'MALAM':
      default:
        return <Moon className="w-4 h-4 text-cyan-300" />;
    }
  };

  const getShiftLabel = (shift: ShiftType) => {
    switch (shift) {
      case 'PAGI':
        return 'SHIFT PAGI (07:00 - 15:00)';
      case 'SORE':
        return 'SHIFT SORE (15:00 - 23:00)';
      case 'MALAM':
        return 'SHIFT MALAM (23:00 - 07:00)';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121212]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.6)] relative">
      {/* Left: Sidebar Toggle, Time Clock, Status Tag */}
      <div className="flex items-center gap-3 sm:gap-4 z-10">
        <button
          onClick={handleToggleSidebar}
          id="btn-toggle-sidebar"
          title="Buka/Tutup Sidebar"
          className="p-2 rounded-xl bg-[#1A1A1A]/80 text-[#00F3FF] hover:text-white hover:bg-[#222222]/90 border border-white/10 hover:border-[#00F3FF]/40 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Real-time Clock Badge */}
        <div className="hidden md:flex flex-col border-l border-white/10 pl-3.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-wider font-mono">WAKTU SISTEM</span>
          <p className="text-xs font-mono text-white flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#00F3FF]" />
            <span>{timeStr || '29-08-2026 13:08:00'}</span>
          </p>
        </div>

        {/* Status Pill (ONLINE) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F3FF]/15 border border-[#00F3FF]/30 text-[10px] font-bold text-[#00F3FF] font-mono tracking-wider backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F3FF] animate-pulse"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* Center: Brand Logo DON ISKO (Centered Perfectly) */}
      <div className="flex sm:absolute sm:left-1/2 sm:-translate-x-1/2 items-center gap-2.5 sm:gap-3 z-10">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400/90 shadow-[0_0_20px_rgba(234,179,8,0.5)] flex-shrink-0 bg-black">
          <img 
            src={donIskoLogo} 
            alt="DON ISKO - HS GROUP 711"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col items-start sm:items-center text-left sm:text-center">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white uppercase font-sans flex items-center gap-1.5 leading-tight">
            <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">DON</span>
            <span className="text-[#00F3FF] drop-shadow-[0_0_10px_rgba(0,243,255,0.4)]">ISKO</span>
          </span>
          <span className="text-[10px] font-extrabold text-yellow-400 font-mono tracking-widest uppercase">
            HS GROUP 711
          </span>
        </div>
      </div>

      {/* Right: Background Customizer, Sound FX, Shift Selector & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 z-10">
        {/* Background Selector Button */}
        <button
          onClick={onOpenBgModal}
          id="btn-open-bg-modal"
          title="Tempel / Ganti Wallpaper Background"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-[#00F3FF] text-xs font-medium border border-white/10 hover:border-[#00F3FF]/40 shadow-[0_0_10px_rgba(0,243,255,0.1)] transition-all cursor-pointer backdrop-blur-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#00F3FF]" />
          <span className="hidden sm:inline text-gray-200 hover:text-white">Wallpaper</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          id="btn-toggle-sound"
          title={soundEnabled ? "Suara Aktif (Klik untuk Mute)" : "Suara Senyap (Klik untuk Unmute)"}
          className="p-2 rounded-full bg-[#1A1A1A]/80 text-gray-300 hover:text-yellow-400 border border-white/10 hover:border-yellow-500/40 transition-all cursor-pointer backdrop-blur-sm"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#00F3FF]" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Shift Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShiftDropdownOpen(prev => !prev)}
            id="btn-shift-dropdown"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F3FF]/15 text-[#00F3FF] text-xs font-bold border border-[#00F3FF]/40 shadow-[0_0_12px_rgba(0,243,255,0.2)] hover:border-[#00F3FF] transition-all cursor-pointer backdrop-blur-sm"
          >
            {getShiftIcon(effectiveShift)}
            <span className="tracking-wide hidden xs:inline">
              SHIFT {effectiveShift}
            </span>
          </button>

          {shiftDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1F1F1F] flex items-center justify-between">
                <span>Pilih Shift Kerja</span>
                <Sparkles className="w-3.5 h-3.5 text-[#00F3FF]" />
              </div>
              <div className="py-1 space-y-1">
                {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
                  <button
                    key={shift}
                    onClick={() => handleShiftSelect(shift)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      effectiveShift === shift
                        ? 'bg-[#00F3FF22] text-[#00F3FF] border border-[#00F3FF44]'
                        : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getShiftIcon(shift)}
                      <span>{getShiftLabel(shift)}</span>
                    </div>
                    {effectiveShift === shift && (
                      <span className="w-2 h-2 rounded-full bg-[#00F3FF] shadow-[0_0_6px_#00F3FF]"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sleek Yellow Logout */}
        {effectiveUser ? (
          <div className="flex items-center gap-3 pl-2 border-l border-[#1F1F1F]">
            <div className="hidden lg:flex items-center gap-2.5 bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-[#1F1F1F]">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px]">
                {effectiveUser.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {effectiveUser.name}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {effectiveUser.role}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              id="btn-logout"
              title="Keluar"
              className="bg-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(234,179,8,0.3)] active:scale-95 cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="bg-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-yellow-400"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
};
