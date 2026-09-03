import React, { useState } from 'react';
import { Lock, User, CheckCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { ShiftType, UserProfile } from '../types';
import donIskoLogo from '../assets/images/don_isko_711_1788035559676.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: UserProfile) => void;
  isMandatory?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, isMandatory = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shift, setShift] = useState<ShiftType>('PAGI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (!u || !p) {
      setErrorMsg('Harap masukkan User ID dan Password!');
      return;
    }

    // 1. Master Login: donisko / 6969
    if (u === 'donisko') {
      if (p === '6969') {
        onLogin({
          id: 'user-master-donisko',
          username: 'donisko',
          name: 'DON ISKO',
          role: 'MASTER / OWNER',
          shift: shift,
          currentShift: shift,
          avatar: 'https://ik.imagekit.io/donisko711/donisko711.jpg'
        });
        return;
      } else {
        setErrorMsg('User ID atau Password salah! Akses ditolak.');
        return;
      }
    }

    // 2. Staff LEO: LEO / leo (or LEO)
    if (u === 'leo') {
      if (p.toLowerCase() === 'leo') {
        onLogin({
          id: 'user-leo',
          username: 'LEO',
          name: 'LEO',
          role: 'INTEL SENIOR',
          shift: shift,
          currentShift: shift,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        });
        return;
      } else {
        setErrorMsg('User ID atau Password salah! Akses ditolak.');
        return;
      }
    }

    // 3. Staff CS: CS / cs (or CS)
    if (u === 'cs') {
      if (p.toLowerCase() === 'cs') {
        onLogin({
          id: 'user-cs',
          username: 'CS',
          name: 'CS MANTAP',
          role: 'CS MANTAP',
          shift: shift,
          currentShift: shift,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });
        return;
      } else {
        setErrorMsg('User ID atau Password salah! Akses ditolak.');
        return;
      }
    }

    // Akses Ditolak untuk username selain 3 di atas
    setErrorMsg('User ID atau Password salah! Akses ditolak.');
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
      onClick={e => {
        if (!isMandatory && onClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-[#0d1117] border border-[#00F3FF]/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,243,255,0.25)] overflow-hidden pointer-events-auto">
        {/* Close button if not mandatory */}
        {!isMandatory && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 transition-all cursor-pointer z-10"
            title="Tutup Jendela"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00F3FF]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Title */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.5)] mb-3 bg-black">
            <img 
              src={donIskoLogo} 
              alt="DON ISKO 711" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white uppercase font-sans">
            DON <span className="text-[#00F3FF]">ISKO</span>
          </h2>
          <p className="text-xs text-yellow-400 font-mono tracking-widest uppercase mt-0.5 font-bold">
            HS GROUP 711 • PORTAL KEAMANAN LOGIN
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-[11px] font-mono text-yellow-300">
            <Lock className="w-3 h-3 text-yellow-400" />
            <span>Masukkan User ID & Password Anda</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username / User ID
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F3FF]" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="off"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan User ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] text-sm text-white placeholder-slate-500 outline-none font-mono transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan Password..."
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm text-white placeholder-slate-500 outline-none font-mono transition-all cursor-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilihan Shift Operasional
            </label>
            <select
              value={shift}
              onChange={e => setShift(e.target.value as ShiftType)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-yellow-400 text-sm text-yellow-300 font-bold outline-none cursor-pointer"
            >
              <option value="PAGI">Shift Pagi (07:00 - 15:00 WIB)</option>
              <option value="SORE">Shift Sore (15:00 - 23:00 WIB)</option>
              <option value="MALAM">Shift Malam (23:00 - 07:00 WIB)</option>
            </select>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-yellow-400 to-yellow-500 text-black font-['Rajdhani'] font-extrabold text-base tracking-wider uppercase shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-black" />
            <span>MASUK KE SISTEM WORKSTATION</span>
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-slate-500 font-mono">
          Akses Terenkripsi HS GROUP 711 • Hanya Akun Berwenang yang Dapat Masuk
        </div>
      </div>
    </div>
  );
};
