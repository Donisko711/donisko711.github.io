import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Info, 
  RefreshCw, 
  Building2, 
  Activity,
  Layers
} from 'lucide-react';

interface BankWdStatus {
  bank: string;
  code: string;
  status: 'ONLINE' | 'OFFLINE' | 'GANGGUAN' | 'LIMIT_MAX';
  minWd: number;
  maxWdPerTrx: number;
  dailyLimit: number;
  processedToday: number;
  scheduleOffline: string;
  notes: string;
}

export const InfoWd: React.FC = () => {
  const [banks, setBanks] = useState<BankWdStatus[]>([
    {
      bank: 'BANK CENTRAL ASIA',
      code: 'BCA',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 50000000,
      dailyLimit: 500000000,
      processedToday: 182400000,
      scheduleOffline: 'Setiap Hari 21:00 - 00:30 WIB (Tentatif)',
      notes: 'Layanan transfer normal via KlikBCA Bisnis API'
    },
    {
      bank: 'BANK MANDIRI',
      code: 'MANDIRI',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 50000000,
      dailyLimit: 400000000,
      processedToday: 120500000,
      scheduleOffline: 'Setiap Hari 22:45 - 04:00 WIB',
      notes: 'MCM 2.0 aktif'
    },
    {
      bank: 'BANK RAKYAT INDONESIA',
      code: 'BRI',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 25000000,
      dailyLimit: 300000000,
      processedToday: 95000000,
      scheduleOffline: 'Setiap Hari 22:00 - 05:00 WIB (Sering Maintenance)',
      notes: 'Pastikan validasi mutasi jika transfer saat jam offline'
    },
    {
      bank: 'BANK NEGARA INDONESIA',
      code: 'BNI',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 50000000,
      dailyLimit: 300000000,
      processedToday: 68000000,
      scheduleOffline: '24 Jam Online (Jarang Offline)',
      notes: 'BNI Direct normal'
    },
    {
      bank: 'E-WALLET DANA',
      code: 'DANA',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 10000000,
      dailyLimit: 150000000,
      processedToday: 42000000,
      scheduleOffline: '24 Jam Online',
      notes: 'Limit akun DANA Premium penerima maksimal 20jt/bulan'
    },
    {
      bank: 'E-WALLET GOPAY / OVO',
      code: 'E-WALLET',
      status: 'ONLINE',
      minWd: 50000,
      maxWdPerTrx: 10000000,
      dailyLimit: 150000000,
      processedToday: 31000000,
      scheduleOffline: '24 Jam Online',
      notes: 'Verifikasi status upgrade e-wallet member sebelum kirim'
    }
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              BANKING STATUS & LIMIT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Bank Gateway & Jadwal Offline
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Informasi Status Bank & Limit WD
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Panduan status online/offline perbankan, batasan per transaksi, dan sisa limit kasir harian.
          </p>
        </div>
      </div>

      {/* Grid of Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map((b, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-cyan-300">
                    {b.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.bank}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Min WD: Rp {b.minWd.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  {b.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Maks per Transaksi:</span>
                  <span className="font-mono font-bold text-white">Rp {b.maxWdPerTrx.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Terproses Hari Ini:</span>
                  <span className="font-mono text-cyan-300">Rp {b.processedToday.toLocaleString('id-ID')}</span>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="text-[10px] font-mono text-amber-400 font-semibold mb-0.5">
                    ⏰ Jadwal Offline Bank:
                  </div>
                  <div className="text-[11px] text-slate-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    {b.scheduleOffline}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-slate-400 font-sans">
              ℹ️ {b.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
