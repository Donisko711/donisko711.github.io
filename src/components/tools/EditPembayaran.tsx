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
  Sparkles
} from 'lucide-react';

export const EditPembayaran: React.FC = () => {
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
  const [copiedText, setCopiedText] = useState(false);

  const getBankColor = () => {
    switch (bankType) {
      case 'BCA': return 'from-blue-600 to-blue-800 border-blue-500';
      case 'MANDIRI': return 'from-yellow-600 to-blue-900 border-amber-500';
      case 'BRI': return 'from-blue-700 to-cyan-800 border-cyan-500';
      case 'BNI': return 'from-teal-600 to-teal-800 border-teal-500';
      case 'DANA': return 'from-sky-500 to-blue-600 border-sky-400';
      case 'QRIS': return 'from-rose-600 to-zinc-900 border-rose-500';
      default: return 'from-zinc-800 to-zinc-900 border-zinc-700';
    }
  };

  const handleCopySlipText = () => {
    const timeNow = new Date().toLocaleString('id-ID');
    let text = `🧾 *BUKTI TRANSFER ${trxType} RESMI*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏦 *Metode Pembayaran:* ${bankType}\n`;
    text += `📌 *Nomor Referensi:* ${refNumber}\n`;
    text += `🕒 *Waktu Transaksi:* ${timeNow}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Penerima:* ${recipientName}\n`;
    text += `💳 *No. Rekening:* ${recipientAccount}\n`;
    text += `💵 *Nominal:* Rp ${amount.toLocaleString('id-ID')}\n`;
    text += `📝 *Catatan:* ${notes}\n`;
    text += `⚡ *Status:* [ ${status} ]\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Terima kasih telah mempercayakan transaksi bersama kami._`;

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              PAYMENT & RECEIPT EDITOR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Slip Transfer & Konfirmasi Pembayaran
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Edit & Generator Bukti Pembayaran
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buat struk transfer digital instan bank BCA, Mandiri, BRI, BNI, Dana, QRIS untuk konfirmasi ke member.
          </p>
        </div>

        <button
          onClick={handleGenerateRef}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate No. Ref Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-3.5">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Parameter Transaksi
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Bank / Provider
              </label>
              <select
                value={bankType}
                onChange={e => setBankType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-bold text-xs text-cyan-300 outline-none"
              >
                <option value="BCA">Bank BCA</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">Bank BRI</option>
                <option value="BNI">Bank BNI</option>
                <option value="DANA">E-Wallet DANA</option>
                <option value="OVO">E-Wallet OVO</option>
                <option value="GOPAY">E-Wallet GoPay</option>
                <option value="QRIS">QRIS Standar</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jenis Transaksi
              </label>
              <select
                value={trxType}
                onChange={e => setTrxType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-bold text-xs text-amber-300 outline-none"
              >
                <option value="WITHDRAW">Withdraw (Penarikan)</option>
                <option value="DEPOSIT">Deposit (Isi Saldo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nama Penerima / Member
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                No. Rekening Tujuan
              </label>
              <input
                type="text"
                value={recipientAccount}
                onChange={e => setRecipientAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nominal Transfer (Rp)
              </label>
              <input
                type="number"
                min={10000}
                step={50000}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-emerald-400 font-bold outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Status Pengiriman
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-bold text-xs text-emerald-300 outline-none"
              >
                <option value="BERHASIL">✓ Berhasil (Sukses)</option>
                <option value="DIPROSES">⏳ Sedang Diproses</option>
                <option value="PENDING">⏱️ Menunggu Antrian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Nomor Referensi (TRX ID)
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-xs text-cyan-300 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Catatan / Berita Transfer
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-300 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Live Struk Preview (E-Receipt Card) */}
        <div className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Pratinjau Struk Digital
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-slate-400 font-mono">
                E-Receipt Preview
              </span>
            </div>

            {/* Receipt Box */}
            <div className={`p-6 rounded-2xl bg-gradient-to-b ${getBankColor()} border shadow-2xl text-white space-y-4`}>
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white text-black font-extrabold flex items-center justify-center text-xs">
                    {bankType.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">{bankType} E-TRANSFER</div>
                    <div className="text-[10px] text-white/80 font-mono">{trxType} BERHASIL</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{status}</span>
                </div>
              </div>

              <div className="text-center py-2 bg-black/20 rounded-xl">
                <div className="text-[11px] text-white/70">Total Transfer</div>
                <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  Rp {amount.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-white/90 font-mono">
                <div className="flex justify-between">
                  <span className="text-white/60">Penerima:</span>
                  <span className="font-bold">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Rekening Tujuan:</span>
                  <span>{recipientAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">No. Referensi:</span>
                  <span className="text-[11px]">{refNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Waktu:</span>
                  <span>{new Date().toLocaleString('id-ID')}</span>
                </div>
                {notes && (
                  <div className="flex justify-between pt-1 border-t border-white/10 text-[11px]">
                    <span className="text-white/60">Catatan:</span>
                    <span>{notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopySlipText}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Format WA Tersalin!' : 'Copy Format Konfirmasi WA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
