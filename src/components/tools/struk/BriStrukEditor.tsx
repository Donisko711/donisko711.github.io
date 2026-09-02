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
import { BRI_TEMPLATE_BASE64 } from './briTemplateBase64';

export interface BriStrukEditorProps {
  onBackToGeneral?: () => void;
}

export const BriStrukEditor: React.FC<BriStrukEditorProps> = ({ onBackToGeneral }) => {
  // State Input BRI (Sesuai field yang ditandai user)
  // 1. Tanggal dan Jam otomatis
  const [tanggalJam, setTanggalJam] = useState<string>('');
  // 2. Nominal total transaksi
  const [nominalRaw, setNominalRaw] = useState<string>('6.000.000');
  // 3. No. Ref
  const [refNumber, setRefNumber] = useState<string>('205515488726');
  // 4. Data Pengirim (Sumber Dana)
  const [namaPengirim, setNamaPengirim] = useState<string>('Adin');
  const [norekPengirim, setNorekPengirim] = useState<string>('3460 **** **** 508');
  // 5. Data Tujuan (Penerima)
  const [namaTujuan, setNamaTujuan] = useState<string>('ELIS KARTIWI');
  const [norekTujuan, setNorekTujuan] = useState<string>('3675 0100 4888 503');

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

  // Helper formatting bulan Indonesia
  const getIndonesianDateString = (date: Date) => {
    const bulanIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = bulanIndo[date.getMonth()];
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${dd} ${mm} ${yyyy}, ${hh}:${min}:${ss} WIB`;
  };

  // Helper Init & Sinkron Waktu Otomatis saat menu BRI dipilih
  const setWaktuSekarang = () => {
    const now = new Date();
    setTanggalJam(getIndonesianDateString(now));

    // Generate 12-digit realistic BRI Ref ID
    const random12 = '2055' + Math.floor(10000000 + Math.random() * 90000000);
    setRefNumber(random12);
  };

  // Auto trigger on initial load / menu BRI selected
  useEffect(() => {
    setWaktuSekarang();
  }, []);

  // Format nominal input handler
  const formatNominalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      setNominalRaw(parseInt(value, 10).toLocaleString('id-ID'));
    } else {
      setNominalRaw('');
    }
  };

  // Generate Initials Avatar
  const getInitials = (name: string, maxChars = 2) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'B';
    if (parts.length === 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, maxChars);
  };

  // Acak Data
  const acakData = () => {
    const now = new Date();
    setTanggalJam(getIndonesianDateString(now));

    // Random nominal between 500k to 50jt
    const nominalOptions = [
      1500000, 2750000, 3500000, 5000000, 6000000, 7850000, 
      10000000, 12500000, 15000000, 22000000, 35000000, 48000000
    ];
    const randomNominal = nominalOptions[Math.floor(Math.random() * nominalOptions.length)];
    setNominalRaw(randomNominal.toLocaleString('id-ID'));

    // Random 12-digit Ref
    const random12 = '20' + Math.floor(1000000000 + Math.random() * 9000000000);
    setRefNumber(random12);

    // List Pengirim
    const listPengirim = ['Adin', 'Rian', 'Bayu', 'Dimas', 'Fajar', 'Reza', 'Bagus', 'Hendra', 'Eko'];
    const selectedPengirim = listPengirim[Math.floor(Math.random() * listPengirim.length)];
    setNamaPengirim(selectedPengirim);
    setNorekPengirim(`${Math.floor(1000 + Math.random() * 9000)} **** **** ${Math.floor(100 + Math.random() * 900)}`);

    // List Penerima
    const listPenerima = [
      'ELIS KARTIWI', 'SRI WAHYUNI', 'BAMBANG PAMUNGKAS', 'NURUL HIDAYAH',
      'AGUS SULISTYO', 'RATNA JUWITA', 'BUDI SANTOSO', 'DEWI ANGGRAENI',
      'HENDRA WIJAYA', 'SITI AISYAH', 'EKO PRASETYO', 'MAYA INDRIANI'
    ];
    const selectedPenerima = listPenerima[Math.floor(Math.random() * listPenerima.length)];
    setNamaTujuan(selectedPenerima);
    
    // Format rekening 15 digit (XXXX XXXX XXXX XXX)
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = String(Math.floor(100 + Math.random() * 900)).padStart(4, '0');
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const p4 = Math.floor(100 + Math.random() * 900);
    setNorekTujuan(`${p1} ${p2} ${p3} ${p4}`);

    displayMessage('🎲 Data BRImo berhasil diacak & waktu disinkronkan!');
  };

  // Download PNG Struk
  const downloadPNG = async () => {
    if (!strukRef.current) return;
    try {
      setIsDownloading(true);
      const struk = strukRef.current;

      const canvas = await html2canvas(struk, {
        useCORS: true,
        scale: 3,
        logging: false,
        backgroundColor: '#0074e0'
      });

      const link = document.createElement('a');
      link.download = `struk-brimo-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      displayMessage('✅ Struk BRImo berhasil diunduh bersih (3x HD)!');
    } catch (err) {
      console.error('Gagal saat screenshot BRImo:', err);
      displayMessage('❌ Gagal mengunduh gambar!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Text
  const handleCopyText = () => {
    const formattedNominal = nominalRaw ? `Rp${nominalRaw}` : 'Rp0';

    const text = `🏦 *BUKTI TRANSAKSI BRImo (BANK BRI)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *Status:* Transaksi Berhasil\n` +
      `📅 *Waktu:* ${tanggalJam}\n` +
      `💰 *Total Transaksi:* ${formattedNominal}\n` +
      `🔖 *No. Ref:* ${refNumber}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📤 *SUMBER DANA:*\n` +
      `   • Nama: ${namaPengirim}\n` +
      `   • Bank: BANK BRI\n` +
      `   • No. Rekening: ${norekPengirim}\n` +
      `📥 *TUJUAN:*\n` +
      `   • Nama: ${namaTujuan}\n` +
      `   • Bank: BANK BRI\n` +
      `   • No. Rekening: ${norekTujuan}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Transaksi resmi & terverifikasi aplikasi BRImo._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const nominalDisplay = nominalRaw ? `Rp${nominalRaw}` : 'Rp0';

  return (
    <div className="space-y-6">
      {/* Top Notification Badge & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#004b93] via-[#0066cc] to-[#002f6c] border border-blue-400/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">EDIT STRUK BANK BRI (BRImo)</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[#0066cc] text-[10px] font-black uppercase tracking-wider">
                Bersih &amp; Rapi
              </span>
            </div>
            <p className="text-xs text-blue-100 font-mono mt-0.5">
              Template struk transfer BRImo asli: Tanggal otomatis, nominal, no ref, data pengirim &amp; penerima tanpa watermark coretan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* PANEL KIRI: BRI CONTROL PANEL FORM CONTROLS              */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-[#1e293b] shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0074e0] animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                  PENGATURAN STRUK BRI
                </h2>
              </div>
              <button
                type="button"
                onClick={setWaktuSekarang}
                className="text-[11px] font-bold text-[#38bdf8] hover:text-sky-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-400/40 transition-all cursor-pointer"
                title="Sinkronkan tanggal dan jam saat ini"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            {/* Input Groups Sesuai Permintaan User */}
            <div className="space-y-3.5">
              {/* 1. Tanggal & Jam Otomatis */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    1. Tanggal &amp; Waktu Transaksi (Otomatis)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Auto-Sync
                  </span>
                </div>
                <input
                  type="text"
                  value={tanggalJam}
                  onChange={(e) => setTanggalJam(e.target.value)}
                  placeholder="02 September 2026, 20:53:04 WIB"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                />
              </div>

              {/* 2. Nominal Total Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  2. Nominal Total Transaksi (Rp)
                </label>
                <input
                  type="text"
                  value={nominalRaw}
                  onChange={formatNominalInput}
                  placeholder="6.000.000"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] text-[#38bdf8] font-bold text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                />
              </div>

              {/* 3. No. Ref */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  3. Nomor Referensi (No. Ref)
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="205515488726"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] text-amber-300 text-xs font-mono font-bold focus:outline-none focus:border-[#0074e0] transition-all"
                />
              </div>

              {/* 4. Sumber Dana (Pengirim) */}
              <div className="p-3.5 rounded-xl bg-[#131d31] border border-blue-900/50 space-y-3">
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  4. Data Sumber Dana (Pengirim)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Nama Sumber Dana
                    </label>
                    <input
                      type="text"
                      value={namaPengirim}
                      onChange={(e) => setNamaPengirim(e.target.value)}
                      placeholder="Adin"
                      className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      No. Rekening Pengirim
                    </label>
                    <input
                      type="text"
                      value={norekPengirim}
                      onChange={(e) => setNorekPengirim(e.target.value)}
                      placeholder="3460 **** **** 508"
                      className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-gray-200 text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Tujuan (Penerima) */}
              <div className="p-3.5 rounded-xl bg-[#131d31] border border-blue-900/50 space-y-3">
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  5. Data Tujuan (Penerima)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Nama Tujuan
                    </label>
                    <input
                      type="text"
                      value={namaTujuan}
                      onChange={(e) => setNamaTujuan(e.target.value.toUpperCase())}
                      placeholder="ELIS KARTIWI"
                      className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      No. Rekening Tujuan
                    </label>
                    <input
                      type="text"
                      value={norekTujuan}
                      onChange={(e) => setNorekTujuan(e.target.value)}
                      placeholder="3675 0100 4888 503"
                      className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-yellow-300 font-bold text-sm font-sans focus:outline-none focus:border-[#0074e0] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Button Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={acakData}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-gradient-to-r from-[#1c355e] to-[#2d4e85] hover:brightness-110 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
              >
                <Shuffle className="w-4 h-4" />
                <span>Acak Data</span>
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl font-sans font-black text-xs text-white uppercase tracking-wider bg-gradient-to-r from-[#00529C] via-[#006ec4] to-[#0088D2] hover:brightness-110 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-blue-300/40 disabled:opacity-50"
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
                  : 'bg-zinc-800 hover:bg-zinc-700 text-[#38bdf8] border border-blue-500/40'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Teks Struk Berhasil Disalin!' : 'Salin Format Teks Chat / WhatsApp'}</span>
            </button>

            {/* Message alert feedback */}
            {msgAlert && (
              <div className="p-2.5 text-center bg-blue-950/60 border border-blue-400/40 rounded-xl text-xs font-bold text-blue-200">
                {msgAlert}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL KANAN: STRUK BRI PREVIEW (TEMPLATE ASLI BERSIH)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Eye className="w-4 h-4" /> Pratinjau Struk Transfer BRImo (Presisi HD)
            </span>
            <span className="text-[11px] text-gray-500">Resolusi Canvas: 341px x 761px</span>
          </div>

          {/* Struk Card Container */}
          <div className="p-2 bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div 
              id="strukBriMoTemplate"
              ref={strukRef}
              style={{
                position: 'relative',
                width: '341px',
                minWidth: '341px',
                maxWidth: '341px',
                height: '761px',
                minHeight: '761px',
                maxHeight: '761px',
                backgroundImage: `url(${BRI_TEMPLATE_BASE64})`,
                backgroundSize: '341px 761px',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                overflow: 'hidden',
                borderRadius: '24px',
                boxShadow: '0 16px 45px rgba(0, 0, 0, 0.45)',
                boxSizing: 'border-box',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              }}
            >
              {/* 1. STATUS HEADER: TRANSAKSI BERHASIL */}
              <div
                style={{
                  position: 'absolute',
                  top: '127px',
                  left: '10px',
                  right: '10px',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '17px',
                  fontWeight: 800,
                  letterSpacing: '-0.2px',
                  lineHeight: '1.2',
                  zIndex: 10
                }}
              >
                Transaksi Berhasil
              </div>

              {/* 2. TANGGAL & JAM TRANSAKSI (DI BAWAH TRANSAKSI BERHASIL) */}
              <div
                style={{
                  position: 'absolute',
                  top: '151px',
                  left: '10px',
                  right: '10px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.1px',
                  lineHeight: '1.2',
                  zIndex: 10
                }}
              >
                {tanggalJam}
              </div>

              {/* 3. TOTAL TRANSAKSI (NOMINAL Rp) */}
              <div
                style={{
                  position: 'absolute',
                  top: '235px',
                  left: '15px',
                  right: '15px',
                  textAlign: 'center',
                  color: '#00529C',
                  fontSize: '23px',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2',
                  zIndex: 10
                }}
              >
                {nominalDisplay}
              </div>

              {/* 4. NOMOR REFERENSI (NO. REF) */}
              <div
                style={{
                  position: 'absolute',
                  top: '277px',
                  right: '25px',
                  textAlign: 'right',
                  color: '#1e293b',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  letterSpacing: '0.2px',
                  lineHeight: '1.2',
                  zIndex: 10
                }}
              >
                {refNumber}
              </div>

              {/* 5. SUMBER DANA (PENGIRIM) - AVATAR INITIAL LINGKARAN BIRU */}
              <div
                style={{
                  position: 'absolute',
                  top: '344px',
                  left: '30px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#0074e0',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                {getInitials(namaPengirim, 1)}
              </div>

              {/* 5. SUMBER DANA (PENGIRIM) - NAMA, BANK BRI & NO REKENING */}
              <div
                style={{
                  position: 'absolute',
                  top: '341px',
                  left: '74px',
                  right: '25px',
                  lineHeight: '1.25',
                  zIndex: 10
                }}
              >
                <div 
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {namaPengirim}
                </div>
                <div 
                  style={{
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginTop: '1px',
                    fontWeight: 500
                  }}
                >
                  BANK BRI
                </div>
                <div 
                  style={{
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginTop: '1px',
                    fontWeight: 500
                  }}
                >
                  {norekPengirim}
                </div>
              </div>

              {/* 6. TUJUAN (PENERIMA) - AVATAR INITIAL LINGKARAN BIRU MUDA */}
              <div
                style={{
                  position: 'absolute',
                  top: '456px',
                  left: '30px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  color: '#0074e0',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                {getInitials(namaTujuan, 2)}
              </div>

              {/* 6. TUJUAN (PENERIMA) - NAMA, BANK BRI & NO REKENING */}
              <div
                style={{
                  position: 'absolute',
                  top: '453px',
                  left: '74px',
                  right: '25px',
                  lineHeight: '1.25',
                  zIndex: 10
                }}
              >
                <div 
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {namaTujuan}
                </div>
                <div 
                  style={{
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginTop: '1px',
                    fontWeight: 500
                  }}
                >
                  BANK BRI
                </div>
                <div 
                  style={{
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginTop: '1px',
                    fontWeight: 500
                  }}
                >
                  {norekTujuan}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


