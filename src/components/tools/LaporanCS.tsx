import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  UserCheck, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ShieldAlert,
  Download,
  Filter
} from 'lucide-react';
import { LaporanGantiDataItem, LaporanLockItem } from '../../types';
import { INITIAL_LAPORAN_GANTI_DATA, INITIAL_LAPORAN_LOCK } from '../../data/initialData';

interface LaporanCSProps {
  initialTab?: 'GANTI_DATA' | 'LOCKED';
}

export const LaporanCS: React.FC<LaporanCSProps> = ({ initialTab = 'GANTI_DATA' }) => {
  const [activeTab, setActiveTab] = useState<'GANTI_DATA' | 'LOCKED'>(initialTab);

  // Ganti Data state
  const [gantiDataList, setGantiDataList] = useState<LaporanGantiDataItem[]>(INITIAL_LAPORAN_GANTI_DATA);
  const [isAddingGD, setIsAddingGD] = useState(false);
  const [gdUsername, setGdUsername] = useState('');
  const [gdDataType, setGdDataType] = useState<any>('NO_REK');
  const [gdOldData, setGdOldData] = useState('');
  const [gdNewData, setGdNewData] = useState('');
  const [gdReason, setGdReason] = useState('');
  const [gdOperator, setGdOperator] = useState('Staff CS Dewi');

  // Lock / Unlock state
  const [lockList, setLockList] = useState<LaporanLockItem[]>(INITIAL_LAPORAN_LOCK);
  const [isAddingLock, setIsAddingLock] = useState(false);
  const [lockUsername, setLockUsername] = useState('');
  const [lockAction, setLockAction] = useState<'LOCK' | 'UNLOCK'>('LOCK');
  const [lockReason, setLockReason] = useState('');
  const [lockIp, setLockIp] = useState('114.122.30.12');
  const [lockOperator, setLockOperator] = useState('Staff CS Dewi');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Add Ganti Data
  const handleAddGantiData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdUsername || !gdOldData || !gdNewData) return;

    const newItem: LaporanGantiDataItem = {
      id: `gd-${Date.now()}`,
      username: gdUsername.trim(),
      dataType: gdDataType,
      oldData: gdOldData.trim(),
      newData: gdNewData.trim(),
      reason: gdReason.trim() || 'Permohonan validasi data baru member',
      operator: gdOperator.trim(),
      status: 'APPROVED',
      timestamp: new Date().toLocaleString('id-ID')
    };

    setGantiDataList([newItem, ...gantiDataList]);
    setGdUsername('');
    setGdOldData('');
    setGdNewData('');
    setGdReason('');
    setIsAddingGD(false);
  };

  // Handle Add Lock/Unlock
  const handleAddLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockUsername || !lockReason) return;

    const newItem: LaporanLockItem = {
      id: `lock-${Date.now()}`,
      username: lockUsername.trim(),
      action: lockAction,
      reason: lockReason.trim(),
      ipAddress: lockIp.trim(),
      operator: lockOperator.trim(),
      timestamp: new Date().toLocaleString('id-ID'),
      status: 'SUCCESS'
    };

    setLockList([newItem, ...lockList]);
    setLockUsername('');
    setLockReason('');
    setIsAddingLock(false);
  };

  const handleDeleteGD = (id: string) => {
    setGantiDataList(gantiDataList.filter(item => item.id !== id));
  };

  const handleDeleteLock = (id: string) => {
    setLockList(lockList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              CS REPORTING & SECURITY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Audit Data Member & Akun Terkunci
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Laporan CS & Manajemen Akun
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arsip terpusat pengajuan ganti data rekening member dan catatan tindakan penguncian / pembukaan akun.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('GANTI_DATA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'GANTI_DATA'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>LAPORAN GANTI DATA ({gantiDataList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('LOCKED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LOCKED'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>LAPORAN LOCKED / UNLOCK ({lockList.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: CS GANTI DATA */}
      {activeTab === 'GANTI_DATA' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Action and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari username / nomor rekening..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => setIsAddingGD(!isAddingGD)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Input Pengajuan Ganti Data</span>
            </button>
          </div>

          {/* Add Ganti Data Form */}
          {isAddingGD && (
            <form onSubmit={handleAddGantiData} className="p-5 rounded-2xl bg-zinc-900/95 border border-cyan-500/50 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Formulir Validasi Pergantian Data Member
                </span>
                <button type="button" onClick={() => setIsAddingGD(false)} className="text-xs text-slate-400 hover:text-white">
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username Member</label>
                  <input
                    type="text"
                    required
                    value={gdUsername}
                    onChange={e => setGdUsername(e.target.value)}
                    placeholder="Contoh: member_hoki88"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Jenis Data</label>
                  <select
                    value={gdDataType}
                    onChange={e => setGdDataType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-cyan-300 font-bold outline-none"
                  >
                    <option value="NO_REK">Nomor Rekening Bank</option>
                    <option value="NAMA_REK">Nama Rekening</option>
                    <option value="BANK">Ganti Bank / E-Wallet</option>
                    <option value="NO_HP">Nomor WhatsApp / HP</option>
                    <option value="EMAIL">Alamat Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Operator CS</label>
                  <input
                    type="text"
                    value={gdOperator}
                    onChange={e => setGdOperator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data Lama</label>
                  <input
                    type="text"
                    required
                    value={gdOldData}
                    onChange={e => setGdOldData(e.target.value)}
                    placeholder="BCA - 0128392182 (Nama Lama)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-rose-300 outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data Baru</label>
                  <input
                    type="text"
                    required
                    value={gdNewData}
                    onChange={e => setGdNewData(e.target.value)}
                    placeholder="BCA - 0129994821 (Nama Baru Sesuai Rek)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-emerald-300 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Alasan Ganti Data & Bukti</label>
                <input
                  type="text"
                  value={gdReason}
                  onChange={e => setGdReason(e.target.value)}
                  placeholder="Salah ketik / Rekening terblokir, sudah diverifikasi foto buku tabungan"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Simpan & Setujui Perubahan Data
                </button>
              </div>
            </form>
          )}

          {/* Table List Ganti Data */}
          <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Data Lama</th>
                  <th className="py-2.5 px-3">Data Baru</th>
                  <th className="py-2.5 px-3">Alasan</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {gantiDataList
                  .filter(item => 
                    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.oldData.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.newData.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(item => (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">{item.timestamp}</td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">{item.username}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 text-[10px]">
                          {item.dataType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-rose-300 text-[11px]">{item.oldData}</td>
                      <td className="py-3 px-3 text-emerald-300 text-[11px]">{item.newData}</td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate font-sans text-xs">{item.reason}</td>
                      <td className="py-3 px-3 text-amber-300 text-[11px] whitespace-nowrap">{item.operator}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ✓ {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteGD(item.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-zinc-800 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: CS LOCKED / UNLOCKED */}
      {activeTab === 'LOCKED' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari username / IP terkunci..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setIsAddingLock(!isAddingLock)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Lock className="w-4 h-4" />
              <span>Input Tindakan Lock / Unlock</span>
            </button>
          </div>

          {/* Add Lock/Unlock Form */}
          {isAddingLock && (
            <form onSubmit={handleAddLock} className="p-5 rounded-2xl bg-zinc-900/95 border border-amber-500/50 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Form Eksekusi Lock / Unlock User
                </span>
                <button type="button" onClick={() => setIsAddingLock(false)} className="text-xs text-slate-400 hover:text-white">
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username Member</label>
                  <input
                    type="text"
                    required
                    value={lockUsername}
                    onChange={e => setLockUsername(e.target.value)}
                    placeholder="Contoh: user_curang77"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tindakan</label>
                  <select
                    value={lockAction}
                    onChange={e => setLockAction(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-amber-300 font-bold outline-none"
                  >
                    <option value="LOCK">🔒 Kunci Akun (Banned/Suspend)</option>
                    <option value="UNLOCK">🔓 Buka Kunci Akun (Unblock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">IP Address / Operator</label>
                  <input
                    type="text"
                    value={lockIp}
                    onChange={e => setLockIp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Alasan Penindakan</label>
                <input
                  type="text"
                  required
                  value={lockReason}
                  onChange={e => setLockReason(e.target.value)}
                  placeholder="Contoh: Indikasi brute force password / Fraud bet / Permintaan member sendiri"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-200 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Eksekusi & Catat ke Log Sistem
                </button>
              </div>
            </form>
          )}

          {/* Table List Lock/Unlock */}
          <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Tindakan</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Alasan Penindakan</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {lockList
                  .filter(item => 
                    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(item => (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">{item.timestamp}</td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">{item.username}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.action === 'LOCK' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> UNLOCKED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{item.ipAddress || '-'}</td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate font-sans text-xs">{item.reason}</td>
                      <td className="py-3 px-3 text-amber-300 text-[11px] whitespace-nowrap">{item.operator}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold whitespace-nowrap">✓ SUCCESS</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteLock(item.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-zinc-800 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
