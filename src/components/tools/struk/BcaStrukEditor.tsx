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

export interface BcaStrukEditorProps {
  onBackToGeneral?: () => void;
}

export const BcaStrukEditor: React.FC<BcaStrukEditorProps> = ({ onBackToGeneral }) => {
  // State Input BCA
  const [nominalRaw, setNominalRaw] = useState<string>('20.000.000');
  const [namaPenerima, setNamaPenerima] = useState<string>('HARTANTO');
  const [rekDari, setRekDari] = useState<string>('3780971991');
  const [rekKe, setRekKe] = useState<string>('3801435031');
  const [tanggalWaktu, setTanggalWaktu] = useState<string>('');

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

  // Helper functions
  const cleanNominal = (raw: string) => {
    return String(raw || '').replace(/[^\d]/g, '');
  };

  const formatRupiah = (angka: string) => {
    const num = parseInt(cleanNominal(angka), 10) || 0;
    return 'Rp ' + num.toLocaleString('id-ID') + ',00';
  };

  const handleNominalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = cleanNominal(e.target.value);
    if (!val) {
      setNominalRaw('');
      return;
    }
    setNominalRaw(Number(val).toLocaleString('id-ID'));
  };

  const setWaktuSekarang = () => {
    const now = new Date();
    const tgl =
      `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setTanggalWaktu(tgl);
  };

  useEffect(() => {
    setWaktuSekarang();
  }, []);

  // Acak Data
  const acakData = () => {
    const namaList = [
      'HARTANTO', 'AGUS SULISTYO', 'RINA WULANDARI', 'TONO WIRAWAN',
      'HASAN BASRI', 'SITI NURHALIZA', 'AHMAD WIJAYA', 'DEWI SARTIKA',
      'RIZKI PRATAMA', 'MAYA SARI', 'ANDI SETIAWAN', 'LINDA KUSUMA',
      'HENDRA GUNAWAN', 'RATNA DEWI', 'BUDI SANTOSO', 'EKO PRASETYO'
    ];

    const rekeningList = [
      '3801435031', '1234567890', '3902019384', '9283746501', '5610928374',
      '8492018471', '0192847102', '5529103847', '7102938461'
    ];

    const dariRekeningList = ['3780971991', '8123456789', '7778889990', '0928347192'];

    const nominal = (Math.floor(Math.random() * 41) + 10) * 1000000;

    const now = new Date();
    const tgl =
      `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const nama = namaList[Math.floor(Math.random() * namaList.length)];
    const rekTujuan = rekeningList[Math.floor(Math.random() * rekeningList.length)];
    const rekAsal = dariRekeningList[Math.floor(Math.random() * dariRekeningList.length)];

    setNominalRaw(Number(nominal).toLocaleString('id-ID'));
    setNamaPenerima(nama);
    setRekKe(rekTujuan);
    setRekDari(rekAsal);
    setTanggalWaktu(tgl);

    displayMessage('🎲 Data berhasil diacak!');
  };

  // Download Struk
  const downloadStruk = async () => {
    if (!strukRef.current) return;
    try {
      setIsDownloading(true);
      const strukElement = strukRef.current;

      const canvas = await html2canvas(strukElement, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Potong 10px dari bawah jika perlu agar tepi bawah bersih sempurna
      const cropHeight = Math.max(100, canvas.height - 10);
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = cropHeight;

      const ctx = croppedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);
      }

      const link = document.createElement('a');
      link.download = `m-BCA_Struk_${Date.now()}.png`;
      link.href = (ctx ? croppedCanvas : canvas).toDataURL('image/png');
      link.click();

      displayMessage('✅ Struk BCA berhasil diunduh!');
    } catch (err) {
      console.error('Gagal saat screenshot BCA:', err);
      displayMessage('❌ Gagal mengunduh struk!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Text
  const handleCopyText = () => {
    const formattedNominal = formatRupiah(nominalRaw);
    const namaPenerimaDisplay = namaPenerima.length > 25 ? namaPenerima.substring(0, 25) + '...' : namaPenerima;

    const text = `🏦 *BUKTI TRANSAKSI m-BCA (BCA MOBILE)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Jenis:* m-Transfer\n` +
      `✅ *Status:* BERHASIL\n` +
      `💳 *Dari Rekening:* ${rekDari || '-'}\n` +
      `🎯 *Ke Rekening:* ${rekKe || '-'}\n` +
      `👤 *Penerima:* ${namaPenerimaDisplay}\n` +
      `📅 *Tanggal & Waktu:* ${tanggalWaktu}\n` +
      `💵 *Nominal:* ${formattedNominal}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Transaksi resmi via BCA Mobile (m-BCA)._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const namaPenerimaDisplay = (namaPenerima || 'HARTANTO').toUpperCase();
  const namaPenerimaCut = namaPenerimaDisplay.length > 25 ? namaPenerimaDisplay.substring(0, 25) + '...' : namaPenerimaDisplay;
  const nominalFormatted = formatRupiah(nominalRaw);

  return (
    <div className="space-y-6">
      {/* Top Notification Badge & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#002f5e] via-[#051833] to-[#040810] border border-blue-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">EDIT STRUK m-BCA INSTAN</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0074d9] text-white text-[10px] font-black uppercase">
                BCA MOBILE PRO
              </span>
            </div>
            <p className="text-xs text-blue-200/80 font-mono mt-0.5">
              Template struk m-Transfer resmi Bank BCA dengan koordinat teks presisi pixel-perfect &amp; generator gambar resolusi tinggi.
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
        {/* PANEL KIRI: BCA CONTROL PANEL FORM CONTROLS              */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#1e1e1e] border border-[#333333] shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0074d9] animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                  BCA EDITOR PRO
                </h2>
              </div>
              <button
                type="button"
                onClick={setWaktuSekarang}
                className="text-[11px] font-bold text-[#0074d9] hover:text-blue-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 transition-all cursor-pointer"
                title="Sinkronkan dengan waktu komputer saat ini"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            {/* Input Groups */}
            <div className="space-y-3.5">
              {/* Nominal (dengan titik) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nominal (dengan titik)
                </label>
                <input
                  type="text"
                  value={nominalRaw}
                  onChange={handleNominalInput}
                  placeholder="Contoh: 2.000.000"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#444444] text-emerald-400 text-sm font-bold font-sans focus:outline-none focus:border-[#0074d9] focus:ring-2 focus:ring-[#0074d9]/30 transition-all"
                />
              </div>

              {/* Nama Penerima (UPPERCASE) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nama Penerima (UPPERCASE)
                </label>
                <input
                  type="text"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value.toUpperCase())}
                  placeholder="HARTANTO"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#0074d9] focus:ring-2 focus:ring-[#0074d9]/30 transition-all"
                />
              </div>

              {/* Row Rekening */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Rek. Pengirim
                  </label>
                  <input
                    type="text"
                    value={rekDari}
                    onChange={(e) => setRekDari(e.target.value)}
                    placeholder="3780971991"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#0074d9] focus:ring-2 focus:ring-[#0074d9]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Rek. Penerima
                  </label>
                  <input
                    type="text"
                    value={rekKe}
                    onChange={(e) => setRekKe(e.target.value)}
                    placeholder="3801435031"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#444444] text-yellow-300 font-bold text-sm font-sans focus:outline-none focus:border-[#0074d9] focus:ring-2 focus:ring-[#0074d9]/30 transition-all"
                  />
                </div>
              </div>

              {/* Tanggal & Waktu */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Tanggal &amp; Waktu (DD/MM/YYYY HH:MM:SS)
                </label>
                <input
                  type="text"
                  value={tanggalWaktu}
                  onChange={(e) => setTanggalWaktu(e.target.value)}
                  placeholder="07/07/2025 19:29:03"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#2b2b2b] border border-[#444444] text-white text-sm font-sans focus:outline-none focus:border-[#0074d9] focus:ring-2 focus:ring-[#0074d9]/30 transition-all"
                />
              </div>
            </div>

            {/* Button Group */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={acakData}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-[#444444] hover:bg-[#555555] transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Acak Data</span>
              </button>

              <button
                type="button"
                onClick={downloadStruk}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-[#0074d9] hover:bg-[#005fa3] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  : 'bg-zinc-800 hover:bg-zinc-700 text-blue-300 border border-blue-500/30'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Teks Struk Berhasil Disalin!' : 'Salin Format Teks Chat / WhatsApp'}</span>
            </button>

            {/* Message alert feedback */}
            {msgAlert && (
              <div className="p-2.5 text-center bg-blue-900/60 border border-blue-400/40 rounded-xl text-xs font-bold text-blue-200">
                {msgAlert}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL KANAN: STRUK m-BCA PREVIEW EXACT MATCH             */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Eye className="w-4 h-4" /> Pratinjau Struk m-BCA
            </span>
            <span className="text-[11px] text-gray-500">Resolusi Canvas: 375px Auto (3x HD)</span>
          </div>

          {/* Struk Card Container with Exact CSS Architecture */}
          <div className="p-3 bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div 
              id="strukBCA"
              ref={strukRef}
              style={{
                position: 'relative',
                width: '375px',
                minWidth: '375px',
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 0 8px #222',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'block',
                lineHeight: 0,
                fontFamily: "'Inter', Arial, sans-serif"
              }}
            >
              {/* Background Image */}
              <img 
                src="https://i.imgur.com/OTM4h4O.jpg" 
                alt="Struk m-BCA" 
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
                  height: '100%',
                  pointerEvents: 'none',
                  lineHeight: 'normal'
                }}
              >
                {/* 1. Dari Rekening (top: 122px, left: 25px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '122px',
                    left: '25px',
                    fontSize: '13px',
                    color: '#333333',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {rekDari || '3780971991'}
                </div>

                {/* 2. Ke Rekening (top: 170px, left: 25px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '170px',
                    left: '25px',
                    fontSize: '13px',
                    color: '#333333',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`${rekKe || '3801435031'} - ${namaPenerimaCut}`}
                </div>

                {/* 3. Status Line: m-Transfer: (top: 205px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '205px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  m-Transfer:
                </div>

                {/* 4. Status Bold: BERHASIL (top: 222px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '222px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '15px',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  BERHASIL
                </div>

                {/* 5. Tanggal (top: 240px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '240px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tanggalWaktu}
                </div>

                {/* 6. Rekening Tujuan (top: 258px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '258px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`Ke ${rekKe || '3801435031'}`}
                </div>

                {/* 7. Nama Penerima (top: 276px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '276px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {namaPenerimaCut}
                </div>

                {/* 8. Nominal (top: 294px, left: 50px) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '294px',
                    left: '50px',
                    color: '#0154a2',
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {nominalFormatted}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
