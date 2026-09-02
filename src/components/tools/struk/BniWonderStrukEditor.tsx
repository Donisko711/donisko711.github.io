import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  ArrowRight,
  Shuffle,
  Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface BniWonderStrukEditorProps {
  onBackToGeneral?: () => void;
}

export const BniWonderStrukEditor: React.FC<BniWonderStrukEditorProps> = ({ onBackToGeneral }) => {
  // State Input BNI Wonder
  const [nominalStr, setNominalStr] = useState<string>('79.200.000');
  const [tanggal, setTanggal] = useState<string>('04 Sep 2025');
  const [waktuLengkap, setWaktuLengkap] = useState<string>('18:16:07 WIB');
  const [refId, setRefId] = useState<string>('202502060959460003388');
  const [namaPenerima, setNamaPenerima] = useState<string>('ANDI SETIAWAN');
  const [norekPenerima, setNorekPenerima] = useState<string>('5678901234');
  const [namaPengirim, setNamaPengirim] = useState<string>('HENDRA AJA');
  const [norekPengirimSuffix, setNorekPengirimSuffix] = useState<string>('012');

  // UI state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [msgAlert, setMsgAlert] = useState<string>('');
  const captureRef = useRef<HTMLDivElement | null>(null);

  const displayMessage = (msg: string) => {
    setMsgAlert(msg);
    setTimeout(() => {
      setMsgAlert('');
    }, 2500);
  };

  // Helper utils
  const rupiah = (n: number) => {
    return 'Rp' + n.toLocaleString('id-ID');
  };

  const toNumberID = (str: string) => {
    const digits = (str || '').replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = toNumberID(e.target.value);
    setNominalStr(val ? val.toLocaleString('id-ID') : '');
  };

  // Gender helper
  const getGender = (name: string) => {
    const maleNames = [
      'HASAN BASRI', 'AHMAD WIJAYA', 'RIZKI PRATAMA', 'ANDI SETIAWAN', 'JOKO SUDARSO',
      'YUDI PRATAMA', 'HENDRIK KURNIAWAN', 'FIRDAUS AHMAD', 'EDY SULISTYO',
      'SAMSON HALIM', 'RUDI KUSUMA', 'SYAIFUL HAKIM', 'IMAM ZULKIFLI',
      'GUNAWAN SANTOSA', 'WAWAN KUSNADI', 'ZULFADLI MAHMUD', 'BANGKIT WIRAWAN',
      'BUDI PRASETYO', 'HENDRA AJA', 'BAGASTIO ABDURRAJA', 'FAJAR PRATAMA'
    ];

    const femaleNames = [
      'SITI NURHALIZA', 'DEWI SARTIKA', 'MAYA SARI', 'CINDY LESTARI', 'GITA NURANI',
      'LISA PUTRI', 'TANIA WULANDARI', 'VIVIANA KENCANA', 'RINA MUNIR',
      'ANITA KURNIATI', 'LIA HERMAN', 'NATASHA HASTARI', 'JESSICA NOVIANTI',
      'CATHERINE HARAHAP', 'ELSA SUTANTO', 'ANGGI YULIANTI', 'RINA MELANIA'
    ];

    const upper = name.toUpperCase();
    if (maleNames.some(m => upper.includes(m))) return 'Bpk';
    if (femaleNames.some(f => upper.includes(f))) return 'Ibu';
    return 'Bpk';
  };

  // Set Waktu Sekarang
  const setWaktuSekarang = () => {
    const now = new Date();
    const formattedTanggal = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const formattedWaktu = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replaceAll('.', ':') + ' WIB';

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const random6 = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');

    setTanggal(formattedTanggal);
    setWaktuLengkap(formattedWaktu);
    setRefId(`${YYYY}${MM}${DD}${HH}${mm}${ss}${random6}`);
  };

  useEffect(() => {
    setWaktuSekarang();
  }, []);

  // Dataset Acak
  const penerimaNames = [
    'HASAN BASRI', 'SITI NURHALIZA', 'AHMAD WIJAYA', 'DEWI SARTIKA', 'RIZKI PRATAMA',
    'MAYA SARI', 'ANDI SETIAWAN', 'BUDI PRASETYO', 'CINDY LESTARI', 'GITA NURANI',
    'JOKO SUDARSO', 'LISA PUTRI', 'YUDI PRATAMA', 'TANIA WULANDARI', 'HENDRIK KURNIAWAN',
    'VIVIANA KENCANA', 'FIRDAUS AHMAD', 'RINA MUNIR', 'EDY SULISTYO', 'ANITA KURNIATI',
    'SAMSON HALIM', 'LIA HERMAN', 'RUDI KUSUMA', 'NATASHA HASTARI', 'SYAIFUL HAKIM',
    'JESSICA NOVIANTI', 'IMAM ZULKIFLI', 'ARIYANTI SIREGAR', 'CATHERINE HARAHAP',
    'GUNAWAN SANTOSA', 'WAWAN KUSNADI', 'ZULFADLI MAHMUD', 'ELSA SUTANTO',
    'BANGKIT WIRAWAN', 'ANGGI YULIANTI'
  ];

  const sumberNames = [
    'BAGASTIO ABDURRAJA', 'HENDRA AJA', 'MAYA KUSUMA', 'FAJAR PRATAMA', 'LINDA PERMATA',
    'WILLIAM SANTOSO', 'NADYA WULANDARI', 'DINO KURNIAWAN', 'SUSI HARTINI', 'BUDI ARIANTO',
    'TOMMY WINANTO', 'RINA MELANIA', 'ALDO RAHARDIAN', 'ELLY SAFITRI', 'MARCELLA HANDAYANI',
    'RAFAEL DWI', 'MADE WIRAWAN', 'FANYA KURNIA', 'DANI PERMANA', 'ANDREW TARING',
    'NADIA NURJANAH', 'REZA RIZAL', 'VINA NOVITA', 'YUDHI SETIAWAN', 'RIZKI FADILLAH',
    'JULIUS PRATAMA', 'EMILIA SARI', 'DEWANGGA ALIF', 'MELISSA SUTISNA', 'TINO KAWI',
    'RIZAL NOVIANTO', 'VIRGITA AGUSTINA', 'RAHMAT HIDAYAT', 'CINTA MAHARANI'
  ];

  const rekNumbers = [
    '1908457073', '5678901234', '9876543210', '1234567890', '3456789012',
    '0982341723', '1782390145', '6582910384', '2049182374', '8392019482'
  ];

  const srcTails = [
    '012', '027', '053', '088', '102', '123', '145', '167', '189', '201',
    '234', '256', '278', '299', '301', '321', '345', '367', '389', '401',
    '423', '445', '467', '489', '501', '523', '545', '567', '589', '601',
    '623', '645', '667', '689', '701', '723', '745', '767', '789', '801',
    '823', '845', '867', '889', '901', '923', '945', '967', '989'
  ];

  const randNominal = () => {
    const MIN = 20_000_000;
    const MAX = 100_000_000;
    const STEP = 100_000;
    const P100 = 0.2;

    if (Math.random() < P100) return MAX;

    const hi = MAX - STEP;
    const steps = Math.floor((hi - MIN) / STEP) + 1;
    const idx = Math.floor(Math.random() * steps);
    return MIN + idx * STEP;
  };

  const acakData = () => {
    const now = new Date();
    const penerima = penerimaNames[Math.floor(Math.random() * penerimaNames.length)];
    const pengirim = sumberNames[Math.floor(Math.random() * sumberNames.length)];
    const rekening = rekNumbers[Math.floor(Math.random() * rekNumbers.length)];
    const suf = srcTails[Math.floor(Math.random() * srcTails.length)];

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const random6 = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');

    setRefId(`${YYYY}${MM}${DD}${HH}${mm}${ss}${random6}`);

    const nominal = randNominal();
    setNominalStr(nominal.toLocaleString('id-ID'));

    setTanggal(now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }));

    setWaktuLengkap(
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replaceAll('.', ':') + ' WIB'
    );

    setNamaPenerima(penerima);
    setNorekPenerima(rekening);
    setNamaPengirim(pengirim);
    setNorekPengirimSuffix(suf);

    displayMessage('🎲 Data BNI Wonder berhasil diacak!');
  };

  // Download PNG Struk
  const downloadPNG = async () => {
    if (!captureRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `Struk-WONDER-BNI_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      displayMessage('✅ Struk BNI Wonder berhasil diunduh!');
    } catch (err) {
      console.error('Gagal saat screenshot BNI Wonder:', err);
      displayMessage('❌ Gagal mengunduh gambar!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Text
  const handleCopyText = () => {
    const num = toNumberID(nominalStr);
    const formattedNominal = num ? rupiah(num) : 'Rp0';
    const title = getGender(namaPenerima);

    const text = `✨ *BUKTI TRANSAKSI wondr by BNI (BNI WONDER)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *Status:* Berhasil\n` +
      `💰 *Nominal Transfer:* ${formattedNominal}\n` +
      `📅 *Waktu Transaksi:* ${tanggal} · ${waktuLengkap}\n` +
      `🔖 *Ref ID:* ${refId}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📥 *PENERIMA:*\n` +
      `   • Nama: ${title} ${namaPenerima}\n` +
      `   • Bank: BNI\n` +
      `   • No. Rekening: ${norekPenerima}\n` +
      `📤 *PENGIRIM:*\n` +
      `   • Nama: ${namaPengirim}\n` +
      `   • Rekening: TAPLUS · *******${norekPengirimSuffix}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Transaksi resmi via aplikasi wondr by BNI._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const parsedAmount = toNumberID(nominalStr);
  const amountDisplay = parsedAmount ? rupiah(parsedAmount) : 'Rp0';
  const rcvTitle = getGender(namaPenerima);

  return (
    <div className="space-y-6">
      {/* Top Notification Badge & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#172033] via-[#0f172a] to-[#040810] border border-lime-400/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">STRUK TRANSFER BNI WONDER (wondr by BNI)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#e5f14e] text-black text-[10px] font-black uppercase">
                wondr Edition
              </span>
            </div>
            <p className="text-xs text-lime-200/80 font-mono mt-0.5">
              Template struk transfer modern wondr by BNI dengan kartu penerima, kartu pengirim TAPLUS, dan Ref ID otomatis.
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
        {/* PANEL KIRI: BNI WONDER CONTROLS                          */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#1e293b] border border-[#334155] shadow-2xl space-y-4 font-mono text-[#f1f5f9]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5f14e] animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                  BNI WONDER EDITOR
                </h2>
              </div>
              <button
                type="button"
                onClick={setWaktuSekarang}
                className="text-[11px] font-bold text-[#e5f14e] hover:text-lime-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lime-950/40 border border-lime-400/30 transition-all cursor-pointer"
                title="Sinkronkan tanggal dan jam saat ini"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            {/* Input Controls */}
            <div className="space-y-3">
              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Nominal Transfer
                </label>
                <input
                  type="text"
                  value={nominalStr}
                  onChange={handleNominalChange}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-[#e5f14e] font-bold text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="text"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    placeholder="04 Sep 2025"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Waktu Lengkap
                  </label>
                  <input
                    type="text"
                    value={waktuLengkap}
                    onChange={(e) => setWaktuLengkap(e.target.value)}
                    placeholder="18:16:07 WIB"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
              </div>

              {/* Nomor Referensi */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Nomor Referensi (Ref ID)
                </label>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-cyan-300 text-xs font-mono focus:outline-none focus:border-[#e5f14e] transition-all"
                />
              </div>

              {/* Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value.toUpperCase())}
                    placeholder="ANDI SETIAWAN"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    No. Rekening Penerima
                  </label>
                  <input
                    type="text"
                    value={norekPenerima}
                    onChange={(e) => setNorekPenerima(e.target.value)}
                    placeholder="5678901234"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-yellow-300 font-bold text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
              </div>

              {/* Pengirim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    value={namaPengirim}
                    onChange={(e) => setNamaPengirim(e.target.value.toUpperCase())}
                    placeholder="HENDRA AJA"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    4 Digit Akhir Rek. Pengirim
                  </label>
                  <input
                    type="text"
                    value={norekPengirimSuffix}
                    onChange={(e) => setNorekPengirimSuffix(e.target.value)}
                    maxLength={4}
                    placeholder="012"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm font-sans focus:outline-none focus:border-[#e5f14e] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Button Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={acakData}
                className="w-full py-3 px-4 rounded-xl font-sans font-bold text-xs text-white uppercase tracking-wider bg-[#475569] hover:bg-[#334155] transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Acak Data</span>
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl font-sans font-black text-xs text-[#111827] uppercase tracking-wider bg-[#e5f14e] hover:bg-[#d7ef3c] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
                  : 'bg-zinc-800 hover:bg-zinc-700 text-lime-300 border border-lime-500/30'
              }`}
            >
              {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Format Teks Struk Berhasil Disalin!' : 'Salin Format Teks Chat / WhatsApp'}</span>
            </button>

            {/* Message alert feedback */}
            {msgAlert && (
              <div className="p-2.5 text-center bg-lime-950/60 border border-lime-400/40 rounded-xl text-xs font-bold text-lime-200">
                {msgAlert}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL KANAN: STRUK BNI WONDER PREVIEW EXACT MATCH        */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-lime-400 font-bold">
              <Eye className="w-4 h-4" /> Pratinjau Struk wondr by BNI
            </span>
            <span className="text-[11px] text-gray-500">Resolusi Canvas: 390px Auto (3x HD)</span>
          </div>

          {/* Struk Card Container with Exact Architecture */}
          <div className="p-3 bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            <div 
              id="capture"
              ref={captureRef}
              style={{
                position: 'relative',
                width: '390px',
                minWidth: '375px',
                maxWidth: '390px',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
                display: 'block',
                lineHeight: 'normal',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {/* Background Image */}
              <img 
                src="https://i.imgur.com/u1dScHB.jpeg" 
                alt="Struk WONDER BNI" 
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
                  inset: 0,
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                {/* Header (amount, meta, ref) */}
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    textAlign: 'center',
                    top: '180px',
                    color: '#0b1320'
                  }}
                >
                  <div 
                    id="amount"
                    style={{
                      fontWeight: 900,
                      fontSize: '36px',
                      color: '#0b1320',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    {amountDisplay}
                  </div>

                  <div 
                    id="datetime"
                    style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: '#111827',
                      fontWeight: 500
                    }}
                  >
                    {tanggal && waktuLengkap ? `${tanggal} · ${waktuLengkap} ·` : ''}
                  </div>

                  <div 
                    id="ref"
                    style={{
                      marginTop: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: 500
                    }}
                  >
                    {refId ? `Ref ID: ${refId}` : ''}
                  </div>
                </div>

                {/* Receiver Card (.rcv-card, top: 54.8%) */}
                <div 
                  style={{
                    position: 'absolute',
                    width: '84%',
                    left: '8%',
                    height: '84px',
                    top: '54.8%',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Name Line */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '36px',
                      left: '10px',
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span id="rcv_title" style={{ display: 'inline-block', minWidth: '0.25ch' }}>
                      {rcvTitle}
                    </span>
                    <span id="rcv_name" style={{ display: 'inline-block', minWidth: '0.25ch' }}>
                      {namaPenerima}
                    </span>
                  </div>

                  {/* Sub Line */}
                  <div 
                    style={{
                      position: 'relative',
                      top: '58px',
                      left: '10px',
                      height: '20px',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  >
                    <span 
                      id="rcv_bank" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        fontWeight: 600
                      }}
                    >
                      BNI
                    </span>
                    <span 
                      id="src_dot1" 
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: '27px',
                        fontSize: '16px',
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    >
                      ·
                    </span>
                    <span 
                      id="rcv_number" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '36px',
                        fontWeight: 500
                      }}
                    >
                      {norekPenerima}
                    </span>
                  </div>
                </div>

                {/* Sender Card (.src-card, top: 69.0%) */}
                <div 
                  style={{
                    position: 'absolute',
                    width: '84%',
                    left: '8%',
                    height: '84px',
                    top: '69.0%',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Name Line */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '35px',
                      left: '10px',
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: 600
                    }}
                  >
                    <span id="src_name" style={{ display: 'inline-block', minWidth: '0.25ch' }}>
                      {namaPengirim}
                    </span>
                  </div>

                  {/* Sub Line */}
                  <div 
                    style={{
                      position: 'relative',
                      top: '56px',
                      left: '10px',
                      height: '20px',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  >
                    <span 
                      id="src_product" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        fontWeight: 600
                      }}
                    >
                      TAPLUS
                    </span>
                    <span 
                      id="src_dot2" 
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: '57px',
                        fontSize: '16px',
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    >
                      ·
                    </span>
                    <span 
                      id="src_number" 
                      style={{
                        position: 'absolute',
                        top: '0px',
                        left: '66px',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        letterSpacing: '1.2px'
                      }}
                    >
                      *******
                    </span>
                    <span 
                      id="src_number01" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '117px',
                        fontWeight: 500
                      }}
                    >
                      {norekPengirimSuffix}
                    </span>
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
