import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Share2, 
  Sliders, 
  Flame,
  Download
} from 'lucide-react';

export const ArticleGenerator: React.FC = () => {
  const [topic, setTopic] = useState('Slot Gacor Hari Ini & Pola Maxwin');
  const [brandName, setBrandName] = useState('SITUS HOKI 88');
  const [category, setCategory] = useState('SLOT');
  const [keywords, setKeywords] = useState('slot gacor, rtp live hari ini, pola zeus maxwin, bocoran slot');
  const [wordCount, setWordCount] = useState<'PENDEK' | 'SEDANG' | 'PANJANG'>('SEDANG');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let article = '';
      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      if (category === 'SLOT') {
        article = `# ${topic.toUpperCase()} - REKOMENDASI TERBAIK ${brandName} (${dateStr})\n\n` +
          `Bagi para pecinta permainan slot online di Indonesia, mencari platform resmi dengan persentase kemenangan tertinggi adalah prioritas utama. **${brandName}** hadir sebagai solusi terpercaya yang menyajikan bocoran RTP live terupdate secara real-time dan pola spin paling akurat.\n\n` +
          `## Mengapa Memilih Bermain di ${brandName}?\n` +
          `1. **RTP Live Tertinggi Hingga 98.8%**: Setiap game dari provider ternama seperti Pragmatic Play, PG Soft, dan Habanero dipantau langsung untuk memastikan peluang jackpot maksimal.\n` +
          `2. **Proses Deposit & Withdraw Kilat**: Didukung sistem pembayaran mutakhir via Transfer Bank (BCA, Mandiri, BRI, BNI) dan E-Wallet (DANA, OVO, Gopay, QRIS) tanpa potongan dalam hitungan detik.\n` +
          `3. **Layanan Customer Service 24 Jam**: Tim CS profesional yang ramah siap melayani segala kendala dan konfirmasi klaim bonus secara responsif.\n\n` +
          `## Bocoran Pola Spin Gacor Hari Ini:\n` +
          `- **Gates of Olympus / Starlight Princess**:\n` +
          `  - 20x Spin Manual (Quick Spin Aktif)\n` +
          `  - 30x Spin Auto (Turbo Spin Aktif - Bet Stabil)\n` +
          `  - Beli Free Spin jika muncul 3 scatter berturut-turut.\n\n` +
          `- **Mahjong Ways 2 (PG Soft)**:\n` +
          `  - 10x Spin Manual Normal\n` +
          `  - 50x Auto Spin dengan Turbo Aktif\n\n` +
          `## Kesimpulan & Cara Bergabung\n` +
          `Jangan lewatkan kesempatan meraih maxwin sensasional hari ini. Daftarkan akun VIP Anda sekarang juga di link resmi **${brandName}** dan nikmati bonus new member 100% serta cashback mingguan terbesar!\n\n` +
          `_Keywords: ${keywords}_`;
      } else if (category === 'TOGEL') {
        article = `# PREDIKSI JITU & PANDUAN TOGEL HONGKONG, SINGAPORE & SYDNEY - ${brandName}\n\n` +
          `Selamat datang di pusat informasi dan prediksi pasaran togel online terlengkap bersama **${brandName}**. Kami menyediakan live draw tercepat, hasil result terlengkap, dan diskon pasang angka terbesar di kelasnya.\n\n` +
          `## Keunggulan Pasang Togel di ${brandName}:\n` +
          `- **Diskon Terbesar Se-Indonesia**: 4D Diskon 66%, 3D Diskon 59%, 2D Diskon 29%.\n` +
          `- **Hadiah Kemenangan Spektakuler**: Hadiah 4D x 3000, 3D x 400, 2D x 70.\n` +
          `- **Pasaran Resmi WLA Terlengkap**: SDY (Sydney), SGP (Singapore), HK (Hongkong), Cambodia, China, dan Toto Macau Putaran 1-5.\n\n` +
          `## Tips Menang Pasang BBFS & Angka Tarung:\n` +
          `Gunakan kombinasi 7 digit BBFS untuk mengunci seluruh variasi 4D, 3D, dan 2D tanpa khawatir angka terbalik. Manfaatkan tools BBFS generator resmi kami untuk memudahkan penyusunan angka hoki Anda.\n\n` +
          `Daftar dan buktikan kemudahan taruhan dengan minimal bet hanya 100 perak di **${brandName}**!\n\n` +
          `_Tag: ${keywords}_`;
      } else {
        article = `# INFORMASI PROMO & EVENT SPESIAL RESMI - ${brandName}\n\n` +
          `Kabar gembira untuk seluruh member setia **${brandName}**! Nikmati deretan promo eksklusif mingguan dan harian dengan syarat turnover paling ringan dan proses klaim super cepat.\n\n` +
          `## Daftar Bonus Tersedia:\n` +
          `1. **Bonus New Member 100%**: Langsung di depan untuk seluruh permainan slot.\n` +
          `2. **Bonus Rollingan Mingguan 0.8%**: Dibagikan otomatis setiap hari Senin.\n` +
          `3. **Cashback Kekalahan Sportbooks Up To 10%**: Jaminan proteksi modal untuk pecinta mix parlay.\n` +
          `4. **Extra Bonus Scatter & Petir Zeus**: Hadiah tambahan saldo cuma-cuma untuk setiap pecahan perkalian x500.\n\n` +
          `Hubungi Customer Service LiveChat **${brandName}** sekarang untuk klaim hak bonus Anda!\n\n` +
          `_Keyword SEO: ${keywords}_`;
      }

      setGeneratedArticle(article);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              CONTENT & PROMO TOOL
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SEO Article & Broadcast Text Generator
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Generate Artikel & Promo SEO
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buat artikel SEO, ulasan game, teks broadcast WhatsApp/Telegram promosi secara instan dengan kata kunci kustom.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Settings */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <Sliders className="w-4 h-4" /> Pengaturan Konten
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Kategori Artikel
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-cyan-300 font-bold outline-none"
            >
              <option value="SLOT">Slot Online & Pola RTP</option>
              <option value="TOGEL">Togel Online & Prediksi</option>
              <option value="PROMO">Promo & Event Bonus</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Nama Brand Website
            </label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Contoh: HOKISLOT88"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Judul / Topik Utama
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Contoh: Pola Gacor Mahjong Ways 2..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Target Keyword SEO (Pisahkan Koma)
            </label>
            <textarea
              rows={3}
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-300 outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'MEN-GENERATE...' : 'GENERATE ARTIKEL SEKARANG'}</span>
          </button>
        </div>

        {/* Right Output Editor */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Hasil Teks Artikel / Promo
              </span>
              {generatedArticle && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Copy ke Clipboard'}</span>
                </button>
              )}
            </div>

            <textarea
              rows={16}
              value={generatedArticle || 'Klik tombol "GENERATE ARTIKEL SEKARANG" di sebelah kiri untuk membuat artikel baru.'}
              onChange={e => setGeneratedArticle(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-slate-200 leading-relaxed outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-zinc-800/80">
            <span>Jumlah Karakter: {generatedArticle.length} | Kata: {generatedArticle ? generatedArticle.split(/\s+/).length : 0}</span>
            <span className="text-amber-400 font-mono">Format Siap Publish ke Blog / WP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
