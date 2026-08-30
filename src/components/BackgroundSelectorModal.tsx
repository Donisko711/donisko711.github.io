import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Check, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  User, 
  LayoutTemplate, 
  RotateCcw,
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react';
import { PRESET_BACKGROUNDS } from '../data/initialData';
import { UserProfile, ShiftType } from '../types';

export const OFFICIAL_DON_ISKO_IMG = 'https://ik.imagekit.io/donisko711/donisko711.jpg';

interface BackgroundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl: string;
  onSelectBgUrl: (url: string) => void;
  currentSidebarImgUrl?: string;
  onSelectSidebarImgUrl?: (url: string) => void;
  currentUser?: UserProfile | null;
  currentUserProfile?: UserProfile | null;
  onUpdateUserProfile?: (updated: UserProfile) => void;
  initialTab?: 'background' | 'sidebar' | 'profile';
}

export const BackgroundSelectorModal: React.FC<BackgroundSelectorModalProps> = ({
  isOpen,
  onClose,
  currentBgUrl,
  onSelectBgUrl,
  currentSidebarImgUrl = OFFICIAL_DON_ISKO_IMG,
  onSelectSidebarImgUrl,
  currentUser,
  currentUserProfile,
  onUpdateUserProfile,
  initialTab = 'background'
}) => {
  const activeUser = currentUserProfile || currentUser || null;
  const [activeTab, setActiveTab] = useState<'background' | 'sidebar' | 'profile'>(initialTab);

  // Background states (Draft selection before save)
  const [selectedBgCandidate, setSelectedBgCandidate] = useState<string>(currentBgUrl);
  const [customBgUrl, setCustomBgUrl] = useState('');
  
  // Sidebar Image states (Draft selection before save)
  const [selectedSidebarCandidate, setSelectedSidebarCandidate] = useState<string>(currentSidebarImgUrl);
  const [customSidebarUrl, setCustomSidebarUrl] = useState('');

  // Profile states
  const [profileName, setProfileName] = useState(activeUser?.name || 'DON ISKO');
  const [profileRole, setProfileRole] = useState(activeUser?.role || 'Super Admin & Owner');
  const [profileAvatar, setProfileAvatar] = useState(activeUser?.avatar || OFFICIAL_DON_ISKO_IMG);
  const [profileShift, setProfileShift] = useState<ShiftType>(activeUser?.shift || 'PAGI');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 3000);
  };

  // Background handlers: Save permanently
  const handleSaveWallpaper = (targetUrl?: string) => {
    const urlToSave = targetUrl || selectedBgCandidate || customBgUrl.trim();
    if (urlToSave) {
      onSelectBgUrl(urlToSave);
      setSelectedBgCandidate(urlToSave);
      if (typeof window !== 'undefined') {
        localStorage.setItem('don_isko_dashboard_bg', urlToSave);
      }
      showNotice('Wallpaper Background berhasil disimpan & diterapkan!');
    }
  };

  const handleApplyCustomBgUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBgUrl.trim()) {
      handleSaveWallpaper(customBgUrl.trim());
      setCustomBgUrl('');
    }
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleSaveWallpaper(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sidebar Image handlers: Save permanently
  const handleSaveSidebarImage = (targetUrl?: string) => {
    const urlToSave = targetUrl || selectedSidebarCandidate || customSidebarUrl.trim();
    if (urlToSave && onSelectSidebarImgUrl) {
      onSelectSidebarImgUrl(urlToSave);
      setSelectedSidebarCandidate(urlToSave);
      if (typeof window !== 'undefined') {
        localStorage.setItem('don_isko_sidebar_img', urlToSave);
      }
      showNotice('Gambar Poster Sidebar berhasil disimpan & diterapkan!');
    }
  };

  const handleApplyCustomSidebarUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSidebarUrl.trim()) {
      handleSaveSidebarImage(customSidebarUrl.trim());
      setCustomSidebarUrl('');
    }
  };

  const handleSidebarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSelectSidebarImgUrl) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleSaveSidebarImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSidebarToOfficial = () => {
    handleSaveSidebarImage(OFFICIAL_DON_ISKO_IMG);
  };

  // Profile Handlers
  const handleProfileAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserProfile && activeUser) {
      const updatedUser: UserProfile = {
        ...activeUser,
        name: profileName.trim() || 'DON ISKO',
        role: profileRole.trim() || 'Admin',
        avatar: profileAvatar.trim() || OFFICIAL_DON_ISKO_IMG,
        shift: profileShift
      };
      onUpdateUserProfile(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('don_isko_current_user', JSON.stringify(updatedUser));
      }
      showNotice('Profil Pengguna & Pemilik Dashboard berhasil disimpan!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#0A0D14] border-2 border-[#00F3FF]/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,243,255,0.3)] max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00F3FF]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00F3FF]/10 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]">
              <Sparkles className="w-6 h-6 text-[#00FF66]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <span>Pengaturan Tampilan & Kustomisasi Wallpaper</span>
              </h3>
              <p className="text-xs text-zinc-300">
                Ubah Wallpaper Background, Gambar Menu Sidebar, atau Foto Profil Pemilik Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Notification Toast */}
        {saveSuccessNotice && (
          <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00F3FF] text-black font-extrabold text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,255,102,0.5)] animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 text-black" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 my-4 border-b border-zinc-800 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'bg-gradient-to-r from-[#00E676] to-[#00FF88] text-black font-black shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-[#0E131F] text-zinc-300 hover:text-white hover:bg-[#151D2E] border border-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>1. Wallpaper Background</span>
          </button>

          <button
            onClick={() => setActiveTab('sidebar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sidebar'
                ? 'bg-[#00F3FF] text-black font-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'bg-[#0E131F] text-zinc-300 hover:text-white hover:bg-[#151D2E] border border-zinc-800'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>2. Gambar Menu Sidebar</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-yellow-400 text-black font-black shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                : 'bg-[#0E131F] text-zinc-300 hover:text-white hover:bg-[#151D2E] border border-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>3. Profil & Identitas Pemilik</span>
          </button>
        </div>

        {/* TAB 1: WALLPAPER BACKGROUND */}
        {activeTab === 'background' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Action Bar Simpan Wallpaper Terpilih */}
            <div className="p-4 rounded-2xl bg-[#07090F] border-2 border-[#00F3FF]/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#00F3FF]/60 flex-shrink-0 bg-black">
                  <img src={selectedBgCandidate || currentBgUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[11px] text-[#00F3FF] font-mono font-bold block">Status Wallpaper Saat Ini:</span>
                  <span className="text-xs text-white font-semibold line-clamp-1 max-w-[240px]">
                    {selectedBgCandidate === currentBgUrl ? '✓ Tersimpan & Aktif' : '⚠ Perubahan Belum Disimpan'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSaveWallpaper(selectedBgCandidate)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] via-[#00FF88] to-[#00C853] hover:from-[#00FF88] hover:to-[#00E676] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,102,0.4)] cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all whitespace-nowrap"
              >
                <Save className="w-4 h-4 text-black" />
                <span>SIMPAN & TERAPKAN WALLPAPER</span>
              </button>
            </div>

            {/* Presets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-[#00F3FF] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-[#00FF66]" />
                  <span>Pilihan Tema Preset Wallpaper (Klik untuk Pilih & Simpan)</span>
                </label>
                <span className="text-[11px] text-zinc-400">Pilih salah satu gambar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {PRESET_BACKGROUNDS.map(bg => {
                  const isSelected = (selectedBgCandidate || currentBgUrl) === bg.url;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => {
                        setSelectedBgCandidate(bg.url);
                        handleSaveWallpaper(bg.url);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.4)] bg-[#0A1612]'
                          : 'border-zinc-800 hover:border-[#00F3FF]/60 bg-[#0E131F]'
                      }`}
                    >
                      <div className="h-28 rounded-xl overflow-hidden mb-2.5 relative bg-zinc-950">
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#00FF66] text-black font-black text-[10px] shadow-md flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>AKTIF</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#00F3FF]">
                        {bg.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {bg.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL & Upload */}
            <div className="p-4 rounded-2xl bg-[#090D16] border-2 border-[#00F3FF]/40 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#00F3FF]" />
                <span>Gunakan Link Foto / URL Wallpaper Kustom</span>
              </h4>

              <form onSubmit={handleApplyCustomBgUrl} className="flex gap-2">
                <input
                  type="url"
                  value={customBgUrl}
                  onChange={e => setCustomBgUrl(e.target.value)}
                  placeholder="Tempel link URL gambar (https://...)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#05070A] border-2 border-[#00F3FF]/40 focus:border-[#00FF66] text-xs text-white outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00FF88] text-black font-black text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)] whitespace-nowrap flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-black" />
                  <span>Simpan URL</span>
                </button>
              </form>

              <div>
                <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-[#00F3FF]/40 hover:border-[#00FF66] bg-[#05070A] hover:bg-[#080C14] text-xs text-zinc-300 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-[#00FF66]" />
                  <span>Atau Upload File Gambar dari Komputer / HP (JPG, PNG, WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GAMBAR MENU SIDEBAR */}
        {activeTab === 'sidebar' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Preview Poster Sidebar */}
              <div className="md:col-span-5 flex flex-col items-center">
                <label className="text-xs font-bold text-[#00F3FF] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <LayoutTemplate className="w-4 h-4" />
                  <span>Preview Poster Sidebar</span>
                </label>
                <div className="w-60 rounded-2xl p-1.5 bg-gradient-to-b from-[#1E1E28] to-[#101016] border-2 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.3)] relative overflow-hidden">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img 
                      src={selectedSidebarCandidate || currentSidebarImgUrl} 
                      alt="Preview Sidebar Poster" 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-black/90 text-[#00F3FF] text-[9.5px] font-mono font-black border border-[#00F3FF]/60 shadow-md">
                        DON ISKO
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/90 text-yellow-400 text-[9.5px] font-mono font-black border border-yellow-400/60 shadow-md">
                        711 HS GROUP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-3 w-60">
                  <button
                    onClick={() => handleSaveSidebarImage(selectedSidebarCandidate)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00FF88] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>SIMPAN GAMBAR SIDEBAR</span>
                  </button>

                  <button
                    onClick={handleResetSidebarToOfficial}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0E131F] hover:bg-[#151D2E] text-xs font-mono text-zinc-300 hover:text-yellow-400 border border-zinc-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Reset Gambar Resmi Don Isko</span>
                  </button>
                </div>
              </div>

              {/* Form Ganti Gambar Sidebar */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-[#090D16] border-2 border-[#00F3FF]/40 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#00F3FF]" />
                    <span>Ganti Link URL Gambar Poster Sidebar</span>
                  </h4>
                  
                  <div className="text-xs text-zinc-300 font-sans space-y-1">
                    <p>Gambar resmi Don Isko saat ini:</p>
                    <code className="block p-2 rounded-lg bg-black text-[#00F3FF] text-[11px] break-all font-mono border border-zinc-800">
                      {OFFICIAL_DON_ISKO_IMG}
                    </code>
                  </div>

                  <form onSubmit={handleApplyCustomSidebarUrl} className="flex gap-2">
                    <input
                      type="url"
                      value={customSidebarUrl}
                      onChange={e => setCustomSidebarUrl(e.target.value)}
                      placeholder="Tempel link URL gambar baru (https://...)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black border-2 border-[#00F3FF]/40 focus:border-[#00FF66] text-xs text-white outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#00F3FF] hover:bg-[#00d0db] text-black font-extrabold text-xs transition-all cursor-pointer shadow-md whitespace-nowrap"
                    >
                      Simpan
                    </button>
                  </form>

                  <div>
                    <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-[#00F3FF]/40 hover:border-[#00FF66] bg-[#05070A] hover:bg-[#080C14] text-xs text-zinc-300 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-[#00FF66]" />
                      <span>Upload Gambar Poster Sidebar Baru (JPG, PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSidebarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PROFIL & IDENTITAS PEMILIK */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-[#090D16] border-2 border-yellow-400/40 space-y-5">
              
              {/* Foto Profil / Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-zinc-800">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] flex-shrink-0 bg-black">
                  <img 
                    src={profileAvatar} 
                    alt={profileName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider font-mono">
                    Foto Profil / Avatar Akun Header
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profileAvatar}
                      onChange={e => setProfileAvatar(e.target.value)}
                      placeholder="Link URL Foto Avatar (https://...)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-zinc-700 text-xs text-white outline-none font-mono focus:border-yellow-400"
                    />
                    <label className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-zinc-700">
                      <Upload className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setProfileAvatar(OFFICIAL_DON_ISKO_IMG)}
                      className="text-[11px] text-zinc-400 hover:text-yellow-400 underline font-mono"
                    >
                      Gunakan Logo Don Isko 711
                    </button>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={() => setProfileAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                      className="text-[11px] text-zinc-400 hover:text-yellow-400 underline font-mono"
                    >
                      Gunakan Avatar CS Sinta Manis
                    </button>
                  </div>
                </div>
              </div>

              {/* Nama & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Nama Akun / Operator Header *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Contoh: SINTA MANIS / DON ISKO"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 focus:border-yellow-400 text-white font-bold text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Jabatan / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileRole}
                    onChange={e => setProfileRole(e.target.value)}
                    placeholder="Contoh: Secretary Don Isko / Super Admin"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 focus:border-yellow-400 text-white font-bold text-sm outline-none"
                  />
                </div>
              </div>

              {/* Shift Kerja */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Shift Kerja Aktif
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => setProfileShift(shift)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black font-mono transition-all border ${
                        profileShift === shift
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                          : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      SHIFT {shift}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-4 mt-auto border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>Semua pengaturan wallpaper, poster sidebar, dan profil tersimpan permanen di browser ini.</span>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white underline cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
