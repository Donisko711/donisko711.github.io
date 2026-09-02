import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  Eye,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface BniStrukEditorProps {
  onBackToGeneral?: () => void;
}

export const BniStrukEditor: React.FC<BniStrukEditorProps> = ({ onBackToGeneral }) => {
  // State Input BNI
  const [pengirim, setPengirim] = useState<string>('M. SULAEMAN');
  const [penerima, setPenerima] = useState<string>('Ibu ROHMAT');
  const [rek, setRek] = useState<string>('1910995890');
  const [nominalStr, setNominalStr] = useState<string>('50.000.000');
  const [tgl, setTgl] = useState<string>('');
  const [jam, setJam] = useState<string>('');
  const [emailPenerima, setEmailPenerima] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [fee, setFee] = useState<string>('Rp0');

  // UI state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const strukRef = useRef<HTMLDivElement | null>(null);

  // Set waktu sekarang saat pertama mount
  const setWaktuSekarang = () => {
    const n = new Date();
    const formattedTgl = n.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    const formattedJam = n.toLocaleTimeString('id-ID', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\./g, ':');

    setTgl(formattedTgl);
    setJam(formattedJam);
  };

  useEffect(() => {
    setWaktuSekarang();
  }, []);

  // Format input uang
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setNominalStr('');
    } else {
      const num = parseInt(rawVal, 10);
      setNominalStr(num.toLocaleString('id-ID'));
    }
  };

  // Fungsi Acak Sistem
  const acakSistem = () => {
    const lPeng = [
      'M. SULAEMAN', 
      'ACHMAD ZAENI', 
      'HENDRA KUSUMA', 
      'REZA RAHARDIAN',
      'HERU SETIAWAN',
      'ANDI WIJAYA',
      'DENI SAPUTRA',
      'BAMBANG PAMUNGKAS',
      'EKO PRASETYO'
    ];
    const lPen = [
      'Ibu ROHMAT', 
      'SITI AISYAH', 
      'BUDI SANTOSO', 
      'LANI MARLINA',
      'RINA ASTUTI',
      'AGUS PRATAMA',
      'DEWI LESTARI',
      'YUNI SHARA',
      'MEGAWATI UTAMI'
    ];
    const lRek = [
      '1910995890', 
      '1289614396', 
      '1102301449', 
      '0514208348',
      '0892341052',
      '1723901452',
      '0345918231',
      '1982347102'
    ];

    setPengirim(lPeng[Math.floor(Math.random() * lPeng.length)]);
    setPenerima(lPen[Math.floor(Math.random() * lPen.length)]);
    setRek(lRek[Math.floor(Math.random() * lRek.length)]);

    const min = 200;
    const max = 1000;
    const rNom = (Math.floor(Math.random() * (max - min + 1)) + min) * 100000;
    setNominalStr(rNom.toLocaleString('id-ID'));

    setWaktuSekarang();
  };

  // Download Struk via html2canvas
  const downloadStruk = async () => {
    if (!strukRef.current) return;
    try {
      setIsDownloading(true);
      const el = strukRef.current;
      const rect = el.getBoundingClientRect();

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: rect.width,
        height: rect.height,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `BNI_Struk_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Error generating BNI struk image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Salin Format Teks
  const handleCopyText = () => {
    const formattedNominal = nominalStr ? `Rp${nominalStr}` : 'Rp0';
    const text = `🏦 *BUKTI TRANSAKSI BNI MOBILE BANKING*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Status:* Transaksi Berhasil\n` +
      `💳 *Rekening Tujuan:* ${rek}\n` +
      `👤 *Nama Penerima:* ${penerima}\n` +
      `📅 *Tanggal Transaksi:* ${tgl}\n` +
      `🕒 *Waktu Transaksi:* ${jam} WIB\n` +
      `🏢 *Bank Tujuan:* BNI\n` +
      `👤 *Nama Pengirim:* ${pengirim}\n` +
      `💵 *Nominal:* ${formattedNominal}\n` +
      `🏷️ *Fee:* ${fee}\n` +
      `💰 *Total:* ${formattedNominal}\n` +
      (keterangan ? `📝 *Keterangan:* ${keterangan}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Transaksi resmi via BNI Mobile Banking._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const formattedNominalDisplay = nominalStr ? `Rp${nominalStr}` : 'Rp0';

  return (
    <div className="space-y-6">
      {/* Top Notification Badge & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#002f35] via-[#051a1d] to-[#040810] border border-teal-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">BNI MOBILE PRO - RECEIPT EDITOR</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E55300] text-white text-[10px] font-black uppercase">
                TIME EDIT ENABLED
              </span>
            </div>
            <p className="text-xs text-teal-200/80 font-mono mt-0.5">
              Template struk presisi tinggi BNI Mobile dengan watermark otentik, overlay pixel-perfect, &amp; generator gambar HD.
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
        {/* PANEL KIRI: BNI EDITOR PRO FORM CONTROLS                 */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#141414] border border-[#333333] shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff] animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                  BNI EDITOR PRO
                </h2>
              </div>
              <button
                type="button"
                onClick={setWaktuSekarang}
                className="text-[11px] font-bold text-[#00f5ff] hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 transition-all cursor-pointer"
                title="Sinkronkan dengan waktu komputer saat ini"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            {/* Input Groups */}
            <div className="space-y-3">
              {/* Pengirim */}
              <div>
                <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                  PENGIRIM
                </label>
                <input
                  type="text"
                  value={pengirim}
                  onChange={(e) => setPengirim(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all"
                  placeholder="Nama Pengirim"
                />
              </div>

              {/* Penerima */}
              <div>
                <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                  PENERIMA
                </label>
                <input
                  type="text"
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all"
                  placeholder="Nama Penerima"
                />
              </div>

              {/* No. Rekening */}
              <div>
                <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                  NO. REKENING
                </label>
                <input
                  type="text"
                  value={rek}
                  onChange={(e) => setRek(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-yellow-300 text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all font-bold tracking-wider"
                  placeholder="Nomor Rekening Tujuan"
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                  NOMINAL (IDR)
                </label>
                <input
                  type="text"
                  value={nominalStr}
                  onChange={handleNominalChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-emerald-400 text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all font-bold"
                  placeholder="50.000.000"
                />
              </div>

              {/* Row Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                    TANGGAL
                  </label>
                  <input
                    type="text"
                    value={tgl}
                    onChange={(e) => setTgl(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#00f5ff] uppercase tracking-wider mb-1">
                    JAM
                  </label>
                  <input
                    type="text"
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    placeholder="HH:mm:ss"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#00f5ff] transition-all"
                  />
                </div>
              </div>

              {/* Keterangan Tambahan (Opsional) */}
              <div className="pt-1 border-t border-white/5 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    FEE TRANSAKSI
                  </label>
                  <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-[#333] text-gray-300 text-xs font-sans focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    KETERANGAN
                  </label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="(Kosongkan jika default)"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-[#333] text-gray-300 text-xs font-sans focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={acakSistem}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-[#E55300] hover:bg-[#ff5d00] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🎲 ACAK SISTEM</span>
              </button>

              <button
                type="button"
                onClick={downloadStruk}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-[#005E6A] hover:bg-[#007a8a] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>📥 DOWNLOAD STRUK</span>
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
                  : 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Teks Struk Berhasil Disalin!' : 'Salin Format Teks Chat / WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL KANAN: STRUK BNI PREVIEW EXACT MATCH               */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-teal-400 font-bold">
              <Eye className="w-4 h-4" /> Pratinjau Struk BNI Mobile PRO
            </span>
            <span className="text-[11px] text-gray-500">Resolusi Canvas: 375px Auto (3x HD)</span>
          </div>

          {/* Struk Card Container with Exact CSS Architecture */}
          <div className="p-3 bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div 
              id="strukBNI"
              ref={strukRef}
              style={{
                position: 'relative',
                width: '375px',
                minWidth: '375px',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 40px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                display: 'block',
                lineHeight: 0,
                fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}
            >
              {/* Background Image */}
              <img 
                src="https://i.imgur.com/PAAu9og.jpeg" 
                alt="BNI Background" 
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  display: 'block',
                  margin: 0,
                  padding: 0
                }}
              />

              {/* Authentic Watermark Container */}
              <div 
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '130px',
                  bottom: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  opacity: 0.08,
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <div 
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#005E6A',
                    letterSpacing: '2px',
                    fontFamily: 'sans-serif'
                  }}
                >
                  BNI BNI BNI BNI BNI
                </div>
                <div 
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#005E6A',
                    letterSpacing: '2px',
                    fontFamily: 'sans-serif'
                  }}
                >
                  BNI BNI BNI BNI BNI
                </div>
              </div>

              {/* Data Struk Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  lineHeight: 'normal',
                  zIndex: 3
                }}
              >
                {/* Header Struk */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '22px',
                    width: '100%',
                    textAlign: 'center'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '16px',
                      color: '#424242',
                      marginBottom: '35px',
                      fontWeight: 400
                    }}
                  >
                    Informasi
                  </div>
                  <div 
                    style={{
                      fontSize: '19px',
                      fontWeight: 500,
                      color: '#111111'
                    }}
                  >
                    Transaksi Berhasil
                  </div>
                </div>

                {/* 1. Row Rekening Tujuan (top: 125px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '125px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Rekening Tujuan
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {rek}
                  </div>
                </div>

                {/* 2. Row Nama Penerima (top: 165px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '165px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Nama Penerima
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {penerima}
                  </div>
                </div>

                {/* 3. Row Tanggal Transaksi (top: 205px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '205px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Tanggal Transaksi
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {tgl}
                  </div>
                </div>

                {/* 4. Row Waktu Transaksi (top: 245px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '245px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Waktu Transaksi
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {jam ? `${jam} WIB` : ''}
                  </div>
                </div>

                {/* 5. Row Email Penerima (top: 285px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '285px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Email Penerima
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {emailPenerima}
                  </div>
                </div>

                {/* 6. Row Bank Tujuan (top: 325px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '325px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Bank Tujuan
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    BNI
                  </div>
                </div>

                {/* 7. Row Nama Pengirim (top: 365px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '365px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Nama Pengirim
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {pengirim}
                  </div>
                </div>

                {/* 8. Row Nominal (top: 405px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '405px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Nominal
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {formattedNominalDisplay}
                  </div>
                </div>

                {/* 9. Row Fee (top: 445px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '445px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Fee
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {fee}
                  </div>
                </div>

                {/* 10. Row Total (top: 485px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '485px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Total
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {formattedNominalDisplay}
                  </div>
                </div>

                {/* 11. Row Keterangan (top: 525px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '525px',
                    width: '100%',
                    padding: '0 35px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#424242', fontSize: '13.5px', fontWeight: 400 }}>
                    Keterangan
                  </div>
                  <div style={{ color: '#333333', textAlign: 'right', maxWidth: '200px', fontWeight: 400, fontSize: '13.5px' }}>
                    {keterangan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
