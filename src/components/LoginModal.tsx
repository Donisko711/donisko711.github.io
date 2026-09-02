import React, { useState } from 'react';
import { Shield, Lock, User, Sparkles, Key, CheckCircle, Sunrise, Sun, Moon, AlertCircle, Crown, ShieldAlert } from 'lucide-react';
import { ShiftType, UserRole, UserProfile } from '../types';
import donIskoLogo from '../assets/images/don_isko_711_1788035559676.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('donisko');
  const [password, setPassword] = useState('8989');
  const [shift, setShift] = useState<ShiftType>('PAGI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Master Login: donisko / 8989
    if (u === 'donisko') {
      if (p === '8989') {
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
        setErrorMsg('Password salah untuk user Master donisko (Gunakan: 8989)');
        return;
      }
    }

    // 2. Staff LEO: LEO / LEO
    if (u === 'leo') {
      if (p.toUpperCase() === 'LEO') {
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
        setErrorMsg('Password salah untuk user LEO (Gunakan: LEO)');
        return;
      }
    }

    // 3. Staff CS: CS / CS
    if (u === 'cs') {
      if (p.toUpperCase() === 'CS') {
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
        setErrorMsg('Password salah untuk user CS (Gunakan: CS)');
        return;
      }
    }

    // Fallback login untuk username lain
    onLogin({
      id: `user-${Date.now()}`,
      username: username.trim(),
      name: username.toUpperCase(),
      role: 'OPERATOR',
      shift: shift,
      currentShift: shift
    });
  };

  const handleQuickLogin = (userCode: 'MASTER' | 'LEO' | 'CS') => {
    setErrorMsg(null);
    if (userCode === 'MASTER') {
      onLogin({
        id: 'user-master-donisko',
        username: 'donisko',
        name: 'DON ISKO',
        role: 'MASTER / OWNER',
        shift: 'PAGI',
        currentShift: 'PAGI',
        avatar: 'https://ik.imagekit.io/donisko711/donisko711.jpg'
      });
    } else if (userCode === 'LEO') {
      onLogin({
        id: 'user-leo',
        username: 'LEO',
        name: 'LEO',
        role: 'INTEL SENIOR',
        shift: 'PAGI',
        currentShift: 'PAGI',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });
    } else if (userCode === 'CS') {
      onLogin({
        id: 'user-cs',
        username: 'CS',
        name: 'CS MANTAP',
        role: 'CS MANTAP',
        shift: 'MALAM',
        currentShift: 'MALAM',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1117] border border-[#00F3FF]/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,243,255,0.25)] overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00F3FF]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Title */}
        <div className="text-center mb-5 relative">
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
            HS GROUP 711 • WORKSTATION PORTAL
          </p>
        </div>

        {/* Quick Demo Logins Buttons */}
        <div className="mb-5 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider flex items-center justify-between">
            <span>PILIHAN AKSES CEPAT</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('MASTER')}
              className="p-2 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 text-[11px] font-bold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="font-extrabold">MASTER</span>
              <span className="text-[9px] text-zinc-400">donisko (Full)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('LEO')}
              className="p-2 rounded-xl bg-[#00F3FF]/15 hover:bg-[#00F3FF]/30 border border-[#00F3FF]/50 text-[#00F3FF] text-[11px] font-bold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
            >
              <Shield className="w-4 h-4 text-[#00F3FF]" />
              <span className="font-extrabold">LEO</span>
              <span className="text-[9px] text-zinc-400">INTEL SENIOR</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('CS')}
              className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold">CS MANTAP</span>
              <span className="text-[9px] text-zinc-400">CS / CS</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form (Disabled Save Password / Autocomplete) */}
        <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username Operator
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F3FF]" />
              <input
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="donisko / LEO / CS"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] text-sm text-white placeholder-slate-500 outline-none font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8989 / LEO / CS"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm text-white placeholder-slate-500 outline-none font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
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
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-yellow-400 to-yellow-500 text-black font-['Rajdhani'] font-extrabold text-base tracking-wider uppercase shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-black" />
            <span>MASUK KE SISTEM WORKSTATION</span>
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] text-slate-500 font-mono">
          Akses Terenkripsi HS GROUP 711 • Sesuai Hak Akses & Jabatan Staf
        </div>
      </div>
    </div>
  );
};
