import React, { useState } from 'react';
import { Shield, Lock, User, Sparkles, Key, CheckCircle, Sunrise, Sun, Moon } from 'lucide-react';
import { ShiftType, UserRole, UserProfile } from '../types';
import donIskoLogo from '../assets/images/don_isko_711_1788035559676.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('operator_cs1');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState<UserRole>('CS');
  const [shift, setShift] = useState<ShiftType>('MALAM');
  const [name, setName] = useState('Staff CS Dewi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: `user-${Date.now()}`,
      username: username.trim() || 'staff_operator',
      name: name.trim() || `${role} Operator`,
      role,
      shift,
      currentShift: shift
    });
  };

  const handleQuickLogin = (selectedRole: UserRole, selectedShift: ShiftType, opName: string) => {
    onLogin({
      id: `user-${Date.now()}`,
      username: selectedRole.toLowerCase() + '_operator',
      name: opName,
      role: selectedRole,
      shift: selectedShift,
      currentShift: selectedShift
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1117] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

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
          <p className="text-xs text-yellow-400 font-mono tracking-widest uppercase mt-0.5">
            711 HS GROUP • CS & KASIR WORKSTATION
          </p>
        </div>

        {/* Quick Demo Logins */}
        <div className="mb-5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Akses Cepat Demo</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('CS', 'MALAM', 'CS Dewi (Shift Malam)')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              👩‍💼 Staff CS
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('KASIR', 'PAGI', 'Kasir Rudi (Shift Pagi)')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              💰 Staff Kasir
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('SUPERVISOR', 'MALAM', 'Supervisor Hendra')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              👑 SPV Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Operator
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role Divisi
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 focus:border-cyan-400 text-sm text-cyan-300 font-bold outline-none cursor-pointer"
              >
                <option value="CS">Customer Service (CS)</option>
                <option value="KASIR">Kasir / Keuangan</option>
                <option value="SUPERVISOR">Supervisor / Leader</option>
                <option value="ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Shift Operasional
              </label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 focus:border-amber-400 text-sm text-amber-300 font-bold outline-none cursor-pointer"
              >
                <option value="PAGI">Shift Pagi (07-15)</option>
                <option value="SORE">Shift Sore (15-23)</option>
                <option value="MALAM">Shift Malam (23-07)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-amber-400 text-black font-['Rajdhani'] font-extrabold text-base tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-black" />
            <span>MASUK KE DASHBOARD OPERATOR</span>
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] text-slate-500">
          Sistem Terenkripsi & Monitoring Shift Terpusat • v3.8
        </div>
      </div>
    </div>
  );
};
