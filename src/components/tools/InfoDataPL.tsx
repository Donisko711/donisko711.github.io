import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  History, 
  DollarSign, 
  UserPlus,
  Layers,
  Sparkles
} from 'lucide-react';

interface PlayerData {
  username: string;
  registeredDate: string;
  bank: string;
  accountNo: string;
  accountName: string;
  totalDeposit: number;
  totalWithdraw: number;
  netCompanyProfit: number;
  vipTier: 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP PLATINUM';
  favoriteGames: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastActive: string;
}

export const InfoDataPL: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<PlayerData[]>([
    {
      username: 'bocah_petir99',
      registeredDate: '12 Jan 2025',
      bank: 'BCA',
      accountNo: '8830192831',
      accountName: 'RUDI HERMAWAN',
      totalDeposit: 45000000,
      totalWithdraw: 38500000,
      netCompanyProfit: 6500000,
      vipTier: 'VIP PLATINUM',
      favoriteGames: 'Gates of Olympus, Mahjong Ways 2',
      riskLevel: 'LOW',
      lastActive: '5 menit lalu'
    },
    {
      username: 'sultan_parlay77',
      registeredDate: '04 Mar 2025',
      bank: 'MANDIRI',
      accountNo: '142009384912',
      accountName: 'AGUS SETIAWAN',
      totalDeposit: 12000000,
      totalWithdraw: 28000000,
      netCompanyProfit: -16000000,
      vipTier: 'GOLD',
      favoriteGames: 'Mix Parlay, HDP Bola',
      riskLevel: 'HIGH',
      lastActive: '1 jam lalu'
    },
    {
      username: 'member_gacor88',
      registeredDate: '19 Jun 2025',
      bank: 'DANA',
      accountNo: '081399482910',
      accountName: 'SITI NURHALIZA',
      totalDeposit: 8500000,
      totalWithdraw: 4200000,
      netCompanyProfit: 4300000,
      vipTier: 'SILVER',
      favoriteGames: 'Starlight Princess, Sweet Bonanza',
      riskLevel: 'LOW',
      lastActive: 'Online Sekarang'
    },
    {
      username: 'hunter_bonus12',
      registeredDate: '01 Agu 2025',
      bank: 'BRI',
      accountNo: '012901928312',
      accountName: 'EKO PRASETYO',
      totalDeposit: 2000000,
      totalWithdraw: 2150000,
      netCompanyProfit: -150000,
      vipTier: 'REGULAR',
      favoriteGames: 'Spaceman, Togel Macau',
      riskLevel: 'MEDIUM',
      lastActive: '2 hari lalu'
    }
  ]);

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(players[0]);

  const filteredPlayers = players.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.accountNo.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              MEMBER INTELLIGENCE & CRM
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Win/Loss Data & Risk Profile
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Info Data Member & Profil P/L
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cek riwayat akumulasi deposit, withdraw, keuntungan bersih, dan status risiko akun member.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Player List */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari username / nama..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredPlayers.map(p => (
              <div
                key={p.username}
                onClick={() => setSelectedPlayer(p)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedPlayer?.username === p.username
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{p.username}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    p.vipTier === 'VIP PLATINUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    p.vipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-zinc-800 text-slate-400'
                  }`}>
                    {p.vipTier}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {p.bank} • {p.accountName}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1.5 border-t border-zinc-800/80">
                  <span className="text-slate-500">P/L:</span>
                  <span className={`font-bold ${p.netCompanyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.netCompanyProfit >= 0 ? '+' : ''}Rp {p.netCompanyProfit.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Card */}
        {selectedPlayer && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white font-['Rajdhani']">
                    {selectedPlayer.username}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
                    {selectedPlayer.vipTier}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Bergabung: {selectedPlayer.registeredDate} • Aktif: {selectedPlayer.lastActive}
                </div>
              </div>

              <div>
                {selectedPlayer.riskLevel === 'LOW' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Akun Normal (Aman)
                  </span>
                )}
                {selectedPlayer.riskLevel === 'HIGH' && (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Pola Win Tinggi (Pantau)
                  </span>
                )}
                {selectedPlayer.riskLevel === 'MEDIUM' && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Risiko Sedang
                  </span>
                )}
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-[11px] text-slate-400 font-mono">Total Akumulasi Depo</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                  Rp {selectedPlayer.totalDeposit.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-[11px] text-slate-400 font-mono">Total Akumulasi WD</div>
                <div className="text-lg font-black text-amber-300 font-mono mt-1">
                  Rp {selectedPlayer.totalWithdraw.toLocaleString('id-ID')}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                selectedPlayer.netCompanyProfit >= 0
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}>
                <div className="text-[11px] text-slate-300 font-mono">Net Margin Situs (P/L)</div>
                <div className={`text-lg font-black font-mono mt-1 ${
                  selectedPlayer.netCompanyProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
                }`}>
                  {selectedPlayer.netCompanyProfit >= 0 ? '+' : ''}Rp {selectedPlayer.netCompanyProfit.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Banking and Behavior */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Data Rekening Terdaftar
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-slate-400">Nama Bank:</span>
                <span className="font-bold text-white">{selectedPlayer.bank}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-slate-400">Nomor Rekening:</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedPlayer.accountNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-slate-400">Nama Pemilik:</span>
                <span className="font-bold text-white">{selectedPlayer.accountName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Game Favorit:</span>
                <span className="text-amber-300">{selectedPlayer.favoriteGames}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
