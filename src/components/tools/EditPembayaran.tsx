import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Building2, 
  Smartphone, 
  QrCode, 
  Download,
  Share2,
  Sparkles,
  History,
  Gamepad2,
  Dices,
  Receipt,
  Repeat,
  FileSpreadsheet,
  Trash2,
  Plus,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';

export type PaymentSubMode = 
  | 'STRUK'
  | 'HISTORY_TRANSAKSI'
  | 'TRANSAKSI_SLOT'
  | 'TRANSAKSI_TOGEL'
  | 'TRANSAKSI_LIVEGAME'
  | 'SEAMLESS'
  | 'BET_TOGEL';

export const EditPembayaran: React.FC = () => {
  const [subMode, setSubMode] = useState<PaymentSubMode>('STRUK');

  // ==========================================
  // STATE 1: EDIT STRUK TRANSFER (BANYAK BANK)
  // ==========================================
  const [bankType, setBankType] = useState('BCA');
  const [trxType, setTrxType] = useState<'DEPOSIT' | 'WITHDRAW'>('WITHDRAW');
  const [status, setStatus] = useState<'BERHASIL' | 'PENDING' | 'DIPROSES'>('BERHASIL');
  const [senderName, setSenderName] = useState('KEUANGAN OPERATOR');
  const [senderAccount, setSenderAccount] = useState('0128392182');
  const [recipientName, setRecipientName] = useState('RUDI HERMAWAN');
  const [recipientAccount, setRecipientAccount] = useState('8830192831');
  const [amount, setAmount] = useState<number>(1500000);
  const [refNumber, setRefNumber] = useState('TRX-20260830-884920');
  const [notes, setNotes] = useState('Penarikan Saldo Member ID bocah_petir99');
  const [trxDate, setTrxDate] = useState('31/08/2026 21:45:10 WIB');
  const [copiedText, setCopiedText] = useState(false);

  // ==========================================
  // STATE 2: HISTORY TRANSAKSI (MUTASI USER)
  // ==========================================
  const [historyUsername, setHistoryUsername] = useState('bocah_petir99');
  const [historyItems, setHistoryItems] = useState([
    { id: '1', date: '31-08-2026 21:45', type: 'WITHDRAW', amount: 1500000, status: 'APPROVED', note: 'WD Bank BCA' },
    { id: '2', date: '31-08-2026 19:12', type: 'DEPOSIT', amount: 300000, status: 'APPROVED', note: 'Depo QRIS Instan' },
    { id: '3', date: '31-08-2026 14:05', type: 'BONUS', amount: 50000, status: 'APPROVED', note: 'Bonus Harian 10%' },
    { id: '4', date: '30-08-2026 22:30', type: 'DEPOSIT', amount: 500000, status: 'APPROVED', note: 'Depo Mandiri' },
    { id: '5', date: '30-08-2026 18:20', type: 'WITHDRAW', amount: 2400000, status: 'APPROVED', note: 'WD Bank Mandiri' }
  ]);

  // ==========================================
  // STATE 3: EDIT TRANSAKSI SLOT
  // ==========================================
  const [slotProvider, setSlotProvider] = useState('PRAGMATIC');
  const [slotGame, setSlotGame] = useState('Gates of Olympus 1000');
  const [slotRoundId, setSlotRoundId] = useState('8830192847291839');
  const [slotBet, setSlotBet] = useState(2400);
  const [slotMultiplier, setSlotMultiplier] = useState('x1,250');
  const [slotPayout, setSlotPayout] = useState(3000000);
  const [slotTime, setSlotTime] = useState('31-08-2026 21:30:15');
  const [slotUser, setSlotUser] = useState('zeus_mania77');

  // ==========================================
  // STATE 4: EDIT TRANSAKSI TOGEL
  // ==========================================
  const [togelPasaran, setTogelPasaran] = useState('HONGKONG (HK)');
  const [togelPeriode, setTogelPeriode] = useState('HK-2490');
  const [togelNomor, setTogelNomor] = useState('7118');
  const [togelGameType, setTogelGameType] = useState('4D / 3D / 2D SET');
  const [togelBetAmount, setTogelBetAmount] = useState(10000);
  const [togelDiskon, setTogelDiskon] = useState('66% (Rp 3.400)');
  const [togelStatus, setTogelStatus] = useState('MENANG (WIN)');
  const [togelPrize, setTogelPrize] = useState(30000000);
  const [togelUser, setTogelUser] = useState('master_hk99');

  // ==========================================
  // STATE 5: EDIT TRANSAKSI LIVEGAME
  // ==========================================
  const [liveGameType, setLiveGameType] = useState('ROULETTE 12D');
  const [liveTable, setLiveTable] = useState('Table 03 (Dealer: Amanda)');
  const [liveRound, setLiveRound] = useState('RD-994821');
  const [liveBetChoice, setLiveChoice] = useState('MERAH (RED) / ANGKA 7');
  const [liveBet, setLiveBet] = useState(50000);
  const [liveResult, setLiveResult] = useState('RED 7 (WIN)');
  const [livePayout, setLivePayout] = useState(1800000);

  // ==========================================
  // STATE 6: EDIT SEAMLESS TRANSFER
  // ==========================================
  const [seamlessSource, setSeamlessSource] = useState('MAIN WALLET (DOMPET UTAMA)');
  const [seamlessTarget, setSeamlessTarget] = useState('PG SOFT (SEAMLESS API)');
  const [seamlessAmount, setSeamlessAmount] = useState(250000);
  const [seamlessTxId, setSeamlessTxId] = useState('SM-20260831-99841');
  const [seamlessUser, setSeamlessUser] = useState('cuan_mighty99');

  // ==========================================
  // STATE 7: EDIT BET TOGEL (SLIP FISIK / NOTA)
  // ==========================================
  const [slipPasaran, setSlipPasaran] = useState('SINGAPORE POOLS (SGP)');
  const [slipTanggal, setSlipTanggal] = useState('31-08-2026');
  const [slipItems, setSlipItems] = useState([
    { no: '1', tebakan: '8492', tipe: '4D', bayar: 3400, diskon: '66%', hadiah: 'x3000' },
    { no: '2', tebakan: '492', tipe: '3D', bayar: 4100, diskon: '59%', hadiah: 'x400' },
    { no: '3', tebakan: '92', tipe: '2D', bayar: 7100, diskon: '29%', hadiah: 'x70' }
  ]);

  const bankOptions = [
    { value: 'BCA', label: 'Bank BCA', color: 'from-blue-600 to-blue-900 border-blue-500' },
    { value: 'MANDIRI', label: 'Bank Mandiri', color: 'from-amber-600 to-blue-950 border-amber-500' },
    { value: 'BRI', label: 'Bank BRI', color: 'from-blue-700 to-cyan-900 border-cyan-500' },
    { value: 'BNI', label: 'Bank BNI', color: 'from-teal-600 to-teal-900 border-teal-500' },
    { value: 'DANAMON', label: 'Bank Danamon', color: 'from-orange-600 to-amber-900 border-orange-500' },
    { value: 'CIMB', label: 'CIMB Niaga', color: 'from-rose-700 to-red-950 border-red-500' },
    { value: 'PERMATA', label: 'Bank Permata', color: 'from-emerald-700 to-teal-950 border-emerald-500' },
    { value: 'SEABANK', label: 'SeaBank Indonesia', color: 'from-orange-500 to-orange-800 border-orange-400' },
    { value: 'JAGO', label: 'Bank Jago', color: 'from-yellow-500 to-amber-700 border-yellow-400' },
    { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)', color: 'from-teal-700 to-emerald-900 border-teal-400' },
    { value: 'DANA', label: 'E-Wallet DANA', color: 'from-sky-500 to-blue-700 border-sky-400' },
    { value: 'OVO', label: 'E-Wallet OVO', color: 'from-purple-600 to-indigo-900 border-purple-400' },
    { value: 'GOPAY', label: 'E-Wallet GoPay', color: 'from-cyan-600 to-blue-900 border-cyan-400' },
    { value: 'LINKAJA', label: 'E-Wallet LinkAja', color: 'from-red-600 to-rose-900 border-red-500' },
    { value: 'SHOPEEPAY', label: 'ShopeePay', color: 'from-orange-600 to-red-800 border-orange-500' },
    { value: 'QRIS', label: 'QRIS Standar Nasional', color: 'from-rose-600 to-zinc-950 border-rose-500' }
  ];

  const currentBankColor = bankOptions.find(b => b.value === bankType)?.color || 'from-zinc-800 to-zinc-900 border-zinc-700';

  const handleCopySlipText = () => {
    let text = '';
    if (subMode === 'STRUK') {
      text = `🧾 *BUKTI TRANSFER ${trxType} RESMI*\n━━━━━━━━━━━━━━━━━━━━\n🏦 *Metode:* ${bankType}\n📌 *No. Ref:* ${refNumber}\n🕒 *Waktu:* ${trxDate}\n━━━━━━━━━━━━━━━━━━━━\n👤 *Penerima:* ${recipientName}\n💳 *No. Rekening:* ${recipientAccount}\n💵 *Nominal:* Rp ${amount.toLocaleString('id-ID')}\n📝 *Catatan:* ${notes}\n⚡ *Status:* [ ${status} ]\n━━━━━━━━━━━━━━━━━━━━\n_Terima kasih telah bertransaksi bersama kami._`;
    } else if (subMode === 'TRANSAKSI_SLOT') {
      text = `🎰 *BUKTI JACKPOT SPIN SLOT RESMI*\n━━━━━━━━━━━━━━━━━━━━\n👤 *User ID:* ${slotUser}\n🎮 *Game:* ${slotGame} (${slotProvider})\n🔖 *Round ID:* ${slotRoundId}\n🕒 *Waktu:* ${slotTime}\n💵 *Bet:* Rp ${slotBet.toLocaleString('id-ID')}\n⚡ *Multiplier:* ${slotMultiplier}\n💰 *Total Win:* Rp ${slotPayout.toLocaleString('id-ID')}\n━━━━━━━━━━━━━━━━━━━━`;
    } else if (subMode === 'TRANSAKSI_TOGEL') {
      text = `🎯 *NOTA INVOICE TOGEL RESMI*\n━━━━━━━━━━━━━━━━━━━━\n👤 *User ID:* ${togelUser}\n🌐 *Pasaran:* ${togelPasaran} (${togelPeriode})\n🔢 *Nomor:* ${togelNomor} [${togelGameType}]\n💵 *Bayar Bet:* Rp ${togelBetAmount.toLocaleString('id-ID')}\n⚡ *Status:* ${togelStatus}\n🏆 *Hadiah Menang:* Rp ${togelPrize.toLocaleString('id-ID')}\n━━━━━━━━━━━━━━━━━━━━`;
    } else if (subMode === 'SEAMLESS') {
      text = `🔄 *BUKTI SEAMLESS WALLET TRANSFER*\n━━━━━━━━━━━━━━━━━━━━\n👤 *User ID:* ${seamlessUser}\n🔖 *Tx ID:* ${seamlessTxId}\n📤 *Dari:* ${seamlessSource}\n📥 *Ke:* ${seamlessTarget}\n💵 *Jumlah:* Rp ${seamlessAmount.toLocaleString('id-ID')}\n⚡ *Status:* BERHASIL (SUCCESS)\n━━━━━━━━━━━━━━━━━━━━`;
    }

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateRef = () => {
    const random = Math.floor(Math.random() * 899999) + 100000;
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    setRefNumber(`TRX-${dateCode}-${random}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in">
      {/* Header Banner Cyberpunk dengan Selector Sub-Menu di Kanan Atas */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1624] via-[#102235] to-[#0a111c] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              PAYMENT &amp; TRANSACTION SUITE
            </span>
            <span className="text-xs text-yellow-400 font-mono flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              MULTI-MODE EDITOR KASIR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
            Edit Pembayaran &amp; Transaksi
          </h1>
          <p className="text-xs text-cyan-200/80 font-mono mt-1 max-w-xl">
            Pilih modul pengeditan di panel kanan atas: Edit Struk (BCA/Mandiri/dll), History Transaksi, Edit Slot, Togel, Livegame, Seamless, atau Slip Bet.
          </p>
        </div>

        {/* SELECTOR PILIHAN DI KANAN ATAS (PERSIS SESUAI PERMINTAAN USER) */}
        <div className="p-2 rounded-2xl bg-[#060b13] border border-cyan-500/40 shadow-inner flex flex-wrap lg:flex-col gap-1 max-w-md w-full lg:w-auto">
          <span className="text-[10px] font-mono font-bold text-gray-400 px-2 py-0.5 uppercase">
            PILIHAN KATEGORI EDIT:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5">
            <button
              onClick={() => setSubMode('STRUK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'STRUK'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Struk Transfer</span>
            </button>

            <button
              onClick={() => setSubMode('HISTORY_TRANSAKSI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'HISTORY_TRANSAKSI'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>History Transaksi</span>
            </button>

            <button
              onClick={() => setSubMode('TRANSAKSI_SLOT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'TRANSAKSI_SLOT'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Transaksi Slot</span>
            </button>

            <button
              onClick={() => setSubMode('TRANSAKSI_TOGEL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'TRANSAKSI_TOGEL'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <Dices className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Transaksi Togel</span>
            </button>

            <button
              onClick={() => setSubMode('TRANSAKSI_LIVEGAME')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'TRANSAKSI_LIVEGAME'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Transaksi Livegame</span>
            </button>

            <button
              onClick={() => setSubMode('SEAMLESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'SEAMLESS'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0a0f18] text-gray-300 hover:text-white hover:bg-[#141e30] border border-white/5'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Seamless</span>
            </button>

            <button
              onClick={() => setSubMode('BET_TOGEL')}
              className={`col-span-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                subMode === 'BET_TOGEL'
                  ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                  : 'bg-[#0a0f18] text-yellow-300 hover:text-yellow-200 hover:bg-[#141e30] border border-yellow-500/20'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Bet Togel (Slip Fisik/Digital)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: EDIT STRUK TRANSFER (BCA, MANDIRI, BRI, BNI, EWALLET, QRIS DLL)   */}
      {/* ========================================================================= */}
      {subMode === 'STRUK' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Form Input Struk */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-cyan-300 font-mono uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Form Parameter Struk Transfer
              </h3>
              <button
                onClick={handleGenerateRef}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-yellow-300 border border-yellow-500/30 cursor-pointer"
              >
                Acak No. Ref
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Pilih Bank / E-Wallet:</label>
                <select
                  value={bankType}
                  onChange={e => setBankType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs font-mono font-bold text-yellow-400 focus:outline-none focus:border-cyan-400"
                >
                  {bankOptions.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Jenis Mutasi:</label>
                <select
                  value={trxType}
                  onChange={e => setTrxType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-400"
                >
                  <option value="WITHDRAW">WITHDRAW (PENARIKAN SALDO)</option>
                  <option value="DEPOSIT">DEPOSIT (SETOR SALDO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nama Penerima / Member:</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">No. Rekening / No. HP Tujuan:</label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={e => setRecipientAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nominal Transfer (Rp):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Status Transaksi:</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                >
                  <option value="BERHASIL">BERHASIL (SUCCESS)</option>
                  <option value="DIPROSES">SEDANG DIPROSES</option>
                  <option value="PENDING">PENDING ANTRIAN</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-gray-400 mb-1">Waktu &amp; Tanggal Transaksi:</label>
                <input
                  type="text"
                  value={trxDate}
                  onChange={e => setTrxDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-gray-400 mb-1">Berita / Catatan Transaksi:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Struk Card Digital Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-6 rounded-3xl bg-gradient-to-b ${currentBankColor} border-2 shadow-2xl text-white space-y-4 font-mono relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-white" />
                  <span className="font-black text-sm tracking-wider uppercase">{bankType} ONLINE</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-black uppercase">
                  {status}
                </span>
              </div>

              <div className="text-center py-2 space-y-1">
                <span className="text-[10px] text-white/70 block uppercase tracking-widest">TOTAL TRANSFER {trxType}</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  Rp {amount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Penerima:</span>
                  <span className="font-bold text-white uppercase">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">No. Rek / Akun:</span>
                  <span className="font-bold text-yellow-300">{recipientAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">No. Referensi:</span>
                  <span className="font-mono text-[11px] text-cyan-300">{refNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Waktu:</span>
                  <span className="text-[11px] text-white/80">{trxDate}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-white/60">Catatan:</span>
                  <span className="text-[11px] text-white/90 truncate max-w-[180px]">{notes}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/70 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transaksi Resmi &amp; Terverifikasi Sistem 24/7</span>
              </div>
            </div>

            <button
              onClick={handleCopySlipText}
              className={`w-full py-3 rounded-2xl font-mono text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedText
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Struk Tersalin!' : 'Salin Format Text Struk Transfer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: HISTORY TRANSAKSI (STATEMENT MUTASI USER)                         */}
      {/* ========================================================================= */}
      {subMode === 'HISTORY_TRANSAKSI' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase">
                  Statement Mutasi Riwayat Transaksi Member
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">User ID:</span>
                <input
                  type="text"
                  value={historyUsername}
                  onChange={e => setHistoryUsername(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs font-bold text-yellow-400 outline-none"
                />
              </div>
            </div>

            {/* Table Statement */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[11px] bg-[#050811]">
                    <th className="p-3">WAKTU</th>
                    <th className="p-3">JENIS TRANSAKSI</th>
                    <th className="p-3">NOMINAL (IDR)</th>
                    <th className="p-3">KETERANGAN</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-gray-300">{item.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.type === 'DEPOSIT' ? 'bg-cyan-500/20 text-cyan-300' :
                          item.type === 'WITHDRAW' ? 'bg-rose-500/20 text-rose-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className={`p-3 font-bold ${item.type === 'DEPOSIT' ? 'text-emerald-400' : item.type === 'WITHDRAW' ? 'text-rose-400' : 'text-yellow-400'}`}>
                        {item.type === 'DEPOSIT' ? '+' : item.type === 'WITHDRAW' ? '-' : '+'} Rp {item.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-gray-300">{item.note}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: EDIT TRANSAKSI SLOT                                               */}
      {/* ========================================================================= */}
      {subMode === 'TRANSAKSI_SLOT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4 font-mono">
            <h3 className="text-sm font-black text-cyan-300 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <Gamepad2 className="w-4 h-4" /> Form Detail Spin Jackpot Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Provider Slot:</label>
                <select
                  value={slotProvider}
                  onChange={e => setSlotProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs font-bold text-yellow-400"
                >
                  <option value="PRAGMATIC">Pragmatic Play</option>
                  <option value="PGSOFT">PG Soft</option>
                  <option value="HABANERO">Habanero</option>
                  <option value="SPADEGAMING">Spadegaming</option>
                  <option value="NOLIMIT">NoLimit City</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nama Game:</label>
                <input
                  type="text"
                  value={slotGame}
                  onChange={e => setSlotGame(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">User ID Member:</label>
                <input
                  type="text"
                  value={slotUser}
                  onChange={e => setSlotUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-cyan-300 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Round ID Spin:</label>
                <input
                  type="text"
                  value={slotRoundId}
                  onChange={e => setSlotRoundId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Stake Bet (Rp):</label>
                <input
                  type="number"
                  value={slotBet}
                  onChange={e => setSlotBet(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Multiplier Pecah:</label>
                <input
                  type="text"
                  value={slotMultiplier}
                  onChange={e => setSlotMultiplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 block mb-1">Total Payout Kemenangan (Rp):</label>
                <input
                  type="number"
                  value={slotPayout}
                  onChange={e => setSlotPayout(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-emerald-400 font-black text-sm"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1a1505] to-[#0d0a02] border-2 border-yellow-400 shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-yellow-400/30 pb-2">
                <span className="text-xs font-black text-yellow-400 uppercase">SLIP JACKPOT SLOT OFFICIAL</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-black font-black">MAXWIN / BIG WIN</span>
              </div>
              <div className="space-y-1 text-center py-2">
                <span className="text-[10px] text-gray-400 uppercase">TOTAL KEMENANGAN SPIN</span>
                <div className="text-2xl font-black text-yellow-400">Rp {slotPayout.toLocaleString('id-ID')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">User ID:</span><span className="text-white font-bold">{slotUser}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Game:</span><span className="text-cyan-300 font-bold">{slotGame}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bet / Multiplier:</span><span className="text-yellow-300 font-bold">Rp {slotBet.toLocaleString('id-ID')} ({slotMultiplier})</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Round ID:</span><span className="text-gray-300 text-[10px]">{slotRoundId}</span></div>
              </div>
            </div>
            <button
              onClick={handleCopySlipText}
              className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Copy className="w-4 h-4" />
              <span>Salin Bukti Jackpot Slot</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: EDIT TRANSAKSI TOGEL                                              */}
      {/* ========================================================================= */}
      {subMode === 'TRANSAKSI_TOGEL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4 font-mono">
            <h3 className="text-sm font-black text-cyan-300 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <Dices className="w-4 h-4" /> Form Detail Invoice Transaksi Togel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Pasaran Togel:</label>
                <input
                  type="text"
                  value={togelPasaran}
                  onChange={e => setTogelPasaran(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Periode Pasaran:</label>
                <input
                  type="text"
                  value={togelPeriode}
                  onChange={e => setTogelPeriode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nomor Tebakan Pasang:</label>
                <input
                  type="text"
                  value={togelNomor}
                  onChange={e => setTogelNomor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-cyan-300 font-black tracking-widest"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Hadiah Kemenangan (Rp):</label>
                <input
                  type="number"
                  value={togelPrize}
                  onChange={e => setTogelPrize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-emerald-400 font-black"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0a1e2f] to-[#040810] border-2 border-cyan-400 shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <span className="text-xs font-black text-cyan-300 uppercase">NOTA BETTING TOGEL</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-black font-black">{togelStatus}</span>
              </div>
              <div className="space-y-1 text-center py-2">
                <span className="text-[10px] text-gray-400 uppercase">NOMOR TEBAKAN RESULT</span>
                <div className="text-3xl font-black text-cyan-400 tracking-widest">{togelNomor}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Pasaran:</span><span className="text-white font-bold">{togelPasaran}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Hadiah:</span><span className="text-emerald-400 font-black">Rp {togelPrize.toLocaleString('id-ID')}</span></div>
              </div>
            </div>
            <button
              onClick={handleCopySlipText}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Copy className="w-4 h-4" />
              <span>Salin Nota Transaksi Togel</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 5: EDIT TRANSAKSI LIVEGAME                                           */}
      {/* ========================================================================= */}
      {subMode === 'TRANSAKSI_LIVEGAME' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4 font-mono">
            <h3 className="text-sm font-black text-cyan-300 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <Repeat className="w-4 h-4" /> Form Detail Livegame Casino
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Jenis Game:</label>
                <input
                  type="text"
                  value={liveGameType}
                  onChange={e => setLiveGameType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Meja &amp; Dealer:</label>
                <input
                  type="text"
                  value={liveTable}
                  onChange={e => setLiveTable(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Pilihan Taruhan:</label>
                <input
                  type="text"
                  value={liveBetChoice}
                  onChange={e => setLiveChoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-cyan-300 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Total Payout (Rp):</label>
                <input
                  type="number"
                  value={livePayout}
                  onChange={e => setLivePayout(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-emerald-400 font-black"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1c0d24] to-[#0a050d] border-2 border-purple-400 shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-purple-400/30 pb-2">
                <span className="text-xs font-black text-purple-300 uppercase">LIVE CASINO WIN TICKET</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-400 text-black font-black">VALID RESULT</span>
              </div>
              <div className="space-y-1 text-center py-2">
                <span className="text-[10px] text-gray-400 uppercase">TOTAL BAYARAN CASINO</span>
                <div className="text-2xl font-black text-purple-300">Rp {livePayout.toLocaleString('id-ID')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Meja:</span><span className="text-white font-bold">{liveTable}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bet / Result:</span><span className="text-yellow-300 font-bold">{liveBetChoice}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 6: EDIT SEAMLESS (TRANSFER API GAME)                                 */}
      {/* ========================================================================= */}
      {subMode === 'SEAMLESS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4 font-mono">
            <h3 className="text-sm font-black text-cyan-300 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <ArrowRightLeft className="w-4 h-4" /> Form Seamless Wallet Transfer In / Out
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Dari (Source Wallet):</label>
                <input
                  type="text"
                  value={seamlessSource}
                  onChange={e => setSeamlessSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs text-cyan-300 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Ke (Target Wallet API):</label>
                <input
                  type="text"
                  value={seamlessTarget}
                  onChange={e => setSeamlessTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">User ID Member:</label>
                <input
                  type="text"
                  value={seamlessUser}
                  onChange={e => setSeamlessUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nominal Saldo (Rp):</label>
                <input
                  type="number"
                  value={seamlessAmount}
                  onChange={e => setSeamlessAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-emerald-400 font-black"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0a1e2f] to-[#040810] border-2 border-cyan-400 shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <span className="text-xs font-black text-cyan-300 uppercase">SEAMLESS LOG STATEMENT</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-black font-black">SUCCESS 200</span>
              </div>
              <div className="space-y-1 text-center py-2">
                <span className="text-[10px] text-gray-400 uppercase">JUMLAH TRANSFER WALLET</span>
                <div className="text-2xl font-black text-cyan-300">Rp {seamlessAmount.toLocaleString('id-ID')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">User:</span><span className="text-white font-bold">{seamlessUser}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Sumber:</span><span className="text-cyan-300 font-bold">{seamlessSource}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tujuan:</span><span className="text-yellow-400 font-bold">{seamlessTarget}</span></div>
              </div>
            </div>
            <button
              onClick={handleCopySlipText}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Copy className="w-4 h-4" />
              <span>Salin Log Seamless</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 7: EDIT BET TOGEL (SLIP FISIK / NOTA CETAK)                          */}
      {/* ========================================================================= */}
      {subMode === 'BET_TOGEL' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-[#0a0f18] border border-yellow-500/40 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black text-yellow-400 uppercase">
                  Editor Slip Bukti Bet Togel (Cetak Fisik / Struk Struk Nota)
                </h3>
              </div>
              <span className="text-xs text-gray-400">Mode Invoice Kasir</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nama Pasaran:</label>
                <input
                  type="text"
                  value={slipPasaran}
                  onChange={e => setSlipPasaran(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-yellow-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tanggal Pasang:</label>
                <input
                  type="text"
                  value={slipTanggal}
                  onChange={e => setSlipTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            {/* Preview Slip Nota */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-yellow-500/30 text-white space-y-3 max-w-xl mx-auto">
              <div className="text-center border-b border-dashed border-white/20 pb-2">
                <span className="text-base font-black tracking-wider text-yellow-400 block">*** SLIP INVOICE TOGEL RESMI ***</span>
                <span className="text-xs text-gray-400">{slipPasaran} • {slipTanggal}</span>
              </div>

              <div className="space-y-1 text-xs">
                {slipItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                    <span>{idx + 1}. [{item.tipe}] Angka: <b>{item.tebakan}</b></span>
                    <span>Bayar: <b>Rp {item.bayar.toLocaleString('id-ID')}</b> ({item.diskon})</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-white/20 flex justify-between font-black text-sm text-yellow-400">
                <span>TOTAL BAYAR:</span>
                <span>Rp 14.600</span>
              </div>
              <div className="text-center text-[10px] text-gray-500 pt-1">
                LUNAS • SIMPAN SLIP INI SEBAGAI BUKTI KLAIM SAH
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
