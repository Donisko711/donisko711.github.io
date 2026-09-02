import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  ArrowRight,
  Shuffle
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface MandiriStrukEditorProps {
  onBackToGeneral?: () => void;
}

export const MandiriStrukEditor: React.FC<MandiriStrukEditorProps> = ({ onBackToGeneral }) => {
  // State Input Mandiri
  const [nominalRaw, setNominalRaw] = useState<string>('48.800.000');
  const [tanggal, setTanggal] = useState<string>('11 Jul 2025');
  const [waktuLengkap, setWaktuLengkap] = useState<string>('14:21:38 WIB');
  const [refNumber, setRefNumber] = useState<string>('2507111421386591753');
  const [namaPenerima, setNamaPenerima] = useState<string>('AGUS SULISTYO');
  const [norekPenerima, setNorekPenerima] = useState<string>('107007926766023');
  const [namaPengirim, setNamaPengirim] = useState<string>('HENDRA GUNAWAN');
  const [norekPengirimSuffix, setNorekPengirimSuffix] = useState<string>('9435');

  // UI state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [msgAlert, setMsgAlert] = useState<string>('');
  const strukRef = useRef<HTMLDivElement | null>(null);

  const displayMessage = (msg: string) => {
    setMsgAlert(msg);
    setTimeout(() => {
      setMsgAlert('');
    }, 2500);
  };

  // Helper utils
  const formatNominalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      setNominalRaw(parseInt(value, 10).toLocaleString('id-ID'));
    } else {
      setNominalRaw('');
    }
  };

  const generateRandomName = () => {
    const listNames = [
      'AGUS SULISTYO', 'HENDRA GUNAWAN', 'BUDI SANTOSO', 'SITI NURHALIZA',
      'AHMAD WIJAYA', 'DEWI SARTIKA', 'RIZKI PRATAMA', 'MAYA SARI',
      'ANDI SETIAWAN', 'LINDA KUSUMA', 'RATNA DEWI', 'EKO PRASETYO',
      'HERU SETIAWAN', 'DENI SAPUTRA', 'BAMBANG PAMUNGKAS', 'LANI MARLINA'
    ];
    return listNames[Math.floor(Math.random() * listNames.length)];
  };

  // Set Waktu Sekarang
  const setWaktuSekarang = () => {
    const now = new Date();
    const jam = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const formattedTanggal = now
      .toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace('.', '');

    const nowRef = new Date();
    const refTime =
      nowRef.getFullYear().toString().slice(-2) +
      String(nowRef.getMonth() + 1).padStart(2, '0') +
      String(nowRef.getDate()).padStart(2, '0') +
      String(nowRef.getHours()).padStart(2, '0') +
      String(nowRef.getMinutes()).padStart(2, '0') +
      String(nowRef.getSeconds()).padStart(2, '0');

    const refAjak = Math.floor(1000000 + Math.random() * 9000000); // 7 digit acak

    setTanggal(formattedTanggal);
    setWaktuLengkap(jam);
    setRefNumber(refTime + refAjak);
  };

  useEffect(() => {
    setWaktuSekarang();
  }, []);

  // Acak Data
  const acakData = () => {
    const now = new Date();
    const jam = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const formattedTanggal = now
      .toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace('.', '');

    const randomNominal = (Math.floor(Math.random() * 801) + 200) * 100000;
    setNominalRaw(randomNominal.toLocaleString('id-ID'));
    setTanggal(formattedTanggal);
    setWaktuLengkap(jam);

    const nowRef = new Date();
    const refTime =
      nowRef.getFullYear().toString().slice(-2) +
      String(nowRef.getMonth() + 1).padStart(2, '0') +
      String(nowRef.getDate()).padStart(2, '0') +
      String(nowRef.getHours()).padStart(2, '0') +
      String(nowRef.getMinutes()).padStart(2, '0') +
      String(nowRef.getSeconds()).padStart(2, '0');

    const refAjak = Math.floor(1000000 + Math.random() * 9000000);
    setRefNumber(refTime + refAjak);

    setNamaPenerima(generateRandomName());
    setNorekPenerima('10700' + Math.floor(1000000000 + Math.random() * 9000000000));
    setNamaPengirim(generateRandomName());
    setNorekPengirimSuffix(String(Math.floor(1000 + Math.random() * 9000)));

    displayMessage('🎲 Data Mandiri berhasil diacak!');
  };

  // Download PNG Struk
  const downloadPNG = async () => {
    if (!strukRef.current) return;
    try {
      setIsDownloading(true);
      const struk = strukRef.current;

      const canvas = await html2canvas(struk, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `struk-mandiri-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      displayMessage('✅ Struk Mandiri berhasil diunduh!');
    } catch (err) {
      console.error('Gagal saat screenshot Mandiri:', err);
      displayMessage('❌ Gagal mengunduh gambar!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Text
  const handleCopyText = () => {
    const formattedNominal = nominalRaw ? `Rp ${nominalRaw}` : 'Rp 0';

    const text = `🏦 *BUKTI TRANSAKSI LIVIN BY MANDIRI*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Status:* Transaksi Berhasil\n` +
      `💰 *Nominal Transfer:* ${formattedNominal}\n` +
      `📅 *Tanggal:* ${tanggal}\n` +
      `🕒 *Waktu:* ${waktuLengkap}\n` +
      `🔖 *No. Referensi:* ${refNumber}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📥 *PENERIMA:*\n` +
      `   • Nama: ${namaPenerima}\n` +
      `   • Bank: Bank Mandiri\n` +
      `   • No. Rekening: ${norekPenerima}\n` +
      `📤 *PENGIRIM:*\n` +
      `   • Nama: ${namaPengirim}\n` +
      `   • Bank: Bank Mandiri\n` +
      `   • No. Rekening: •••• ${norekPengirimSuffix}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Transaksi resmi via Livin' by Mandiri._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const nominalDisplay = nominalRaw ? `Rp ${nominalRaw}` : 'Rp 0';

  return (
    <div className="space-y-6">
      {/* Top Notification Badge & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#003833] via-[#051c1a] to-[#040810] border border-[#00c2a8]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00c2a8]/20 border border-[#00c2a8]/40 flex items-center justify-center text-[#00c2a8]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">EDIT STRUK MANDIRI (Livin' by Mandiri)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00c2a8] text-black text-[10px] font-black uppercase">
                MANDIRI PRO
              </span>
            </div>
            <p className="text-xs text-teal-200/80 font-mono mt-0.5">
              Template struk transfer resmi Bank Mandiri dengan tata letak Livin' presisi dan ekspor resolusi tinggi.
            </p>
          </div>
        </div>

        {onBackToGeneral && (
          <button
            onClick={onBackToGeneral}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white text-xs font-mono font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Pilih Bank Lain</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* PANEL KIRI: MANDIRI CONTROL PANEL FORM CONTROLS          */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#1e1e1e] border border-[#333333] shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00c2a8] animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                  MANDIRI CONTROL PANEL
                </h2>
              </div>
              <button
                type="button"
                onClick={setWaktuSekarang}
                className="text-[11px] font-bold text-[#00c2a8] hover:text-teal-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950/40 border border-[#00c2a8]/30 transition-all cursor-pointer"
                title="Sinkronkan tanggal dan jam saat ini"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            {/* Input Groups */}
            <div className="space-y-3.5">
              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nominal Transfer (misal: 48800000)
                </label>
                <input
                  type="text"
                  value={nominalRaw}
                  onChange={formatNominalInput}
                  placeholder="48.800.000"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-[#00c2a8] font-bold text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="text"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    placeholder="11 Jul 2025"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-white text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Waktu Transaksi Lengkap
                  </label>
                  <input
                    type="text"
                    value={waktuLengkap}
                    onChange={(e) => setWaktuLengkap(e.target.value)}
                    placeholder="14:21:38 WIB"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-white text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
              </div>

              {/* No Ref */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nomor Referensi (No. Ref.)
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="2507111421386591753"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-cyan-300 text-xs font-mono focus:outline-none focus:border-[#00c2a8] transition-all"
                />
              </div>

              {/* Nama & Norek Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value.toUpperCase())}
                    placeholder="Nama Penerima"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-white text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    No. Rekening Penerima
                  </label>
                  <input
                    type="text"
                    value={norekPenerima}
                    onChange={(e) => setNorekPenerima(e.target.value)}
                    placeholder="107007926766023"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-yellow-300 font-bold text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
              </div>

              {/* Nama & Norek Pengirim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    value={namaPengirim}
                    onChange={(e) => setNamaPengirim(e.target.value.toUpperCase())}
                    placeholder="Nama Pengirim"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-white text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Rek. Pengirim (4 Digit Akhir)
                  </label>
                  <input
                    type="text"
                    value={norekPengirimSuffix}
                    onChange={(e) => setNorekPengirimSuffix(e.target.value)}
                    maxLength={4}
                    placeholder="9435"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#555555] text-white text-sm font-sans focus:outline-none focus:border-[#00c2a8] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Button Actions with Premium Theme */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={acakData}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-gradient-to-r from-[#513307] via-[#a96f12] to-[#e4b950] hover:brightness-110 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#ffe5a3]/40"
              >
                <Shuffle className="w-4 h-4" />
                <span>Acak Data</span>
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl font-sans font-black text-xs text-white uppercase tracking-wider bg-gradient-to-r from-[#063c38] via-[#087f74] to-[#00b9a4] hover:brightness-110 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Copy Action */}
            <button
              type="button"
              onClick={handleCopyText}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedText
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-[#00c2a8] border border-[#00c2a8]/30'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Teks Struk Berhasil Disalin!' : 'Salin Format Teks Chat / WhatsApp'}</span>
            </button>

            {/* Message alert feedback */}
            {msgAlert && (
              <div className="p-2.5 text-center bg-teal-950/60 border border-[#00c2a8]/40 rounded-xl text-xs font-bold text-teal-200">
                {msgAlert}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL KANAN: STRUK MANDIRI PREVIEW EXACT MATCH           */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-[#00c2a8] font-bold">
              <Eye className="w-4 h-4" /> Pratinjau Struk Mandiri
            </span>
            <span className="text-[11px] text-gray-500">Resolusi Canvas: 375px Auto (3x HD)</span>
          </div>

          {/* Struk Card Container with Exact Architecture */}
          <div className="p-3 bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div 
              id="struk"
              ref={strukRef}
              style={{
                position: 'relative',
                width: '375px',
                minWidth: '375px',
                maxWidth: '375px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                display: 'block',
                lineHeight: 'normal',
                fontFamily: "'Roboto', sans-serif"
              }}
            >
              {/* Background Image */}
              <img 
                src="https://i.imgur.com/u2GrDvu.png" 
                alt="Struk Mandiri" 
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  display: 'block',
                  margin: 0,
                  padding: 0
                }}
              />

              {/* Data Struk Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  fontSize: '12px',
                  fontFamily: "'Roboto', sans-serif",
                  pointerEvents: 'none'
                }}
              >
                {/* 1. Tanggal, Waktu & No. Ref (top: 160px, left: 30px) */}
                <div 
                  id="tanggal"
                  style={{
                    position: 'absolute',
                    top: '160px',
                    left: '30px',
                    width: '330px',
                    fontSize: '11px',
                    color: '#9E9E9E',
                    lineHeight: 1.2,
                    fontWeight: 400
                  }}
                >
                  {`${tanggal} • ${waktuLengkap} • No. Ref.`}
                  <br />
                  {refNumber}
                </div>

                {/* 2. Nama Penerima (top: 278px, left: 47px) */}
                <div 
                  id="nama-penerima"
                  style={{
                    position: 'absolute',
                    top: '278px',
                    left: '47px',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#111111',
                    lineHeight: 1.2
                  }}
                >
                  {namaPenerima}
                </div>

                {/* 3. Bank & Norek Penerima (top: 309px, left: 47px) */}
                <div 
                  id="bank-norek"
                  style={{
                    position: 'absolute',
                    top: '309px',
                    left: '47px',
                    fontSize: '13px',
                    color: '#6F6F6F',
                    lineHeight: 1.2,
                    fontWeight: 400
                  }}
                >
                  {`Bank Mandiri - ${norekPenerima}`}
                </div>

                {/* 4. Nominal (top: 428px, right: 47px) */}
                <div 
                  id="nominal"
                  style={{
                    position: 'absolute',
                    top: '428px',
                    right: '47px',
                    fontSize: '16px',
                    fontWeight: 900,
                    textAlign: 'right',
                    color: '#111111',
                    lineHeight: 1.2
                  }}
                >
                  {nominalDisplay}
                </div>

                {/* 5. Nama Pengirim (top: 507px, left: 47px) */}
                <div 
                  id="pengirim"
                  style={{
                    position: 'absolute',
                    top: '507px',
                    left: '47px',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#111111',
                    lineHeight: 1.2
                  }}
                >
                  {namaPengirim}
                </div>

                {/* 6. Bank Pengirim (top: 537px, left: 47px) */}
                <div 
                  id="bankpengirim"
                  style={{
                    position: 'absolute',
                    top: '537px',
                    left: '47px',
                    fontSize: '12px',
                    color: '#6F6F6F',
                    lineHeight: 1.2,
                    fontWeight: 400
                  }}
                >
                  Bank Mandiri
                </div>

                {/* 7. Norek Pengirim Suffix (top: 537px, left: 173px) */}
                <div 
                  id="norekpengirim"
                  style={{
                    position: 'absolute',
                    top: '537px',
                    left: '173px',
                    fontSize: '12px',
                    color: '#6F6F6F',
                    lineHeight: 1.2,
                    fontWeight: 400
                  }}
                >
                  {norekPengirimSuffix}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
