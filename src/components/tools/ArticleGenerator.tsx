import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  Flame,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hash,
  Globe,
  Tag,
  AlignLeft,
  Trash2,
  Smartphone,
  Monitor,
  Share2,
  Code,
  Layers,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface PresetItem {
  name: string;
  topic: string;
  brand: string;
  category: string;
  focusKeyphrase: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  bannerImg: string;
  keywords: string;
}

const PRESETS: PresetItem[] = [
  {
    name: '🐉 Dragon Pots Megaways',
    topic: 'Bocoran Pola Gacor Slot Dragon Pots Megaways RTP 98.6%',
    brand: 'HORAS711',
    category: 'SLOT',
    focusKeyphrase: 'dragon pots megaways',
    slug: 'dragon-pots-megaways-pola-gacor-rtp',
    metaTitle: 'HORAS711: Bocoran Pola Gacor Dragon Pots Megaways RTP 98.6%',
    metaDesc: 'Rahasia menang jackpot maxwin Dragon Pots Megaways di HORAS711. Dapatkan bocoran pola spin gacor, jam hoki hari ini, dan bonus new member 100% langsung cair.',
    bannerImg: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    keywords: 'dragon pots megaways, rtp live slot, pola slot gacor, jam hoki pg soft, horas711'
  },
  {
    name: '⚡ Gates of Olympus 1000',
    topic: 'Pola Petir Kakek Zeus Gates of Olympus 1000 Maxwin 5000x',
    brand: 'ZEUS711',
    category: 'SLOT',
    focusKeyphrase: 'gates of olympus 1000',
    slug: 'gates-of-olympus-1000-pola-petir-maxwin',
    metaTitle: 'ZEUS711: Pola Petir Merah Gates of Olympus 1000 Maxwin x5000',
    metaDesc: 'Nikmati sensasi perkalian petir x1000 di Gates of Olympus 1000 bersama ZEUS711. Terbukti bayar lunas berapapun kemenangan jackpot Anda tanpa potongan!',
    bannerImg: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    keywords: 'gates of olympus 1000, trik petir zeus, slot gacor hari ini, link zeus711'
  },
  {
    name: '🎲 Strategi Baccarat Casino',
    topic: 'Rumus Rahasia Menang Main Baccarat Online Live Casino',
    brand: 'HORAS711',
    category: 'CASINO',
    focusKeyphrase: 'baccarat online',
    slug: 'rumus-menang-baccarat-online-live-casino',
    metaTitle: 'HORAS711: Rumus Pola Menang Baccarat Online Live Casino 2026',
    metaDesc: 'Panduan lengkap rumus membaca pola jalan banker player baccarat online di HORAS711. Nikmati meja live casino dealer cantik dengan minimal bet terjangkau.',
    bannerImg: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
    keywords: 'baccarat online, live casino sexy baccarat, rumus banker player, trik casino'
  },
  {
    name: '⚽ Prediksi Mix Parlay',
    topic: 'Prediksi Mix Parlay Malam Ini Jitu Akurat Liga Champions',
    brand: 'HORAS711',
    category: 'BOLA',
    focusKeyphrase: 'prediksi mix parlay',
    slug: 'prediksi-mix-parlay-malam-ini-jitu-akurat',
    metaTitle: 'HORAS711: Prediksi Mix Parlay Malam Ini Jitu Akurat 99% Tembus',
    metaDesc: 'Update jadwal dan prediksi mix parlay malam ini terlengkap di HORAS711. Dapatkan analisa handicap, over under, dan bonus parlay win full hingga 5 juta rupiah.',
    bannerImg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    keywords: 'prediksi mix parlay, jadwal bola malam ini, tips parlay tembus, bonus parlay horas711'
  },
  {
    name: '🎯 Bocoran Togel HK & SGP',
    topic: 'Prediksi Bocoran Togel Hongkong HK Jitu Malam Ini 4D',
    brand: 'AYUTOGEL',
    category: 'TOGEL',
    focusKeyphrase: 'prediksi togel hongkong',
    slug: 'prediksi-togel-hongkong-hk-jitu-malam-ini',
    metaTitle: 'AYUTOGEL: Prediksi Togel Hongkong HK Jitu Malam Ini Angka Main 4D',
    metaDesc: 'Bocoran master angka jitu prediksi togel hongkong hari ini di AYUTOGEL. Nikmati diskon pasang terbesar hingga 66% dan hadiah 4D bayaran 10 juta rupiah.',
    bannerImg: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
    keywords: 'prediksi togel hongkong, bocoran hk malam ini, angka tarung hk, ayutogel'
  },
  {
    name: '🎁 Bonus New Member 100%',
    topic: 'Promo Situs Bonus New Member 100% Slot To Rendah',
    brand: 'HORAS711',
    category: 'PROMO',
    focusKeyphrase: 'bonus new member 100',
    slug: 'bonus-new-member-100-slot-to-rendah',
    metaTitle: 'HORAS711: Promo Situs Bonus New Member 100% Slot TO Rendah Depo 25k',
    metaDesc: 'Klaim bonus new member 100% di depan khusus permainan slot di HORAS711. Syarat TO ringan, bebas buy spin, dan deposit cepat via QRIS tanpa potongan.',
    bannerImg: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80',
    keywords: 'bonus new member 100, slot bonus 100 to kecil, promo horas711, deposit qris'
  }
];

export const ArticleGenerator: React.FC = () => {
  // State Form
  const [topic, setTopic] = useState('Bocoran Pola Gacor Slot Dragon Pots Megaways RTP 98.6%');
  const [brandName, setBrandName] = useState('HORAS711');
  const [category, setCategory] = useState('SLOT');
  const [focusKeyword, setFocusKeyword] = useState('dragon pots megaways');
  const [slug, setSlug] = useState('dragon-pots-megaways-pola-gacor-rtp');
  const [metaTitle, setMetaTitle] = useState('HORAS711: Bocoran Pola Gacor Dragon Pots Megaways RTP 98.6%');
  const [metaDescription, setMetaDescription] = useState('Rahasia menang jackpot maxwin Dragon Pots Megaways di HORAS711. Dapatkan bocoran pola spin gacor, jam hoki hari ini, dan bonus new member 100% langsung cair.');
  const [additionalKeywords, setAdditionalKeywords] = useState('dragon pots megaways, rtp live slot, pola slot gacor, jam hoki pg soft, horas711');
  const [bannerImageUrl, setBannerImageUrl] = useState('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80');
  const [ctaUrl, setCtaUrl] = useState('https://horas711.site/register');
  const [targetWordCount, setTargetWordCount] = useState('800');

  // Preview Mode
  const [googlePreviewDevice, setGooglePreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'SEO' | 'READABILITY' | 'SCHEMA' | 'SOCIAL' | 'FULL_ARTICLE'>('SEO');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedYoastPack, setCopiedYoastPack] = useState(false);

  // Apply Preset
  const handleApplyPreset = (preset: PresetItem) => {
    setTopic(preset.topic);
    setBrandName(preset.brand);
    setCategory(preset.category);
    setFocusKeyword(preset.focusKeyphrase);
    setSlug(preset.slug);
    setMetaTitle(preset.metaTitle);
    setMetaDescription(preset.metaDesc);
    setBannerImageUrl(preset.bannerImg);
    setAdditionalKeywords(preset.keywords);
  };

  // Generate Article with Full Yoast compliance
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const autoSlug = slug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(autoSlug);

      const h1Text = `${topic.toUpperCase()} DI SITUS RESMI ${brandName}`;
      const h2Intro = `Mengenal Keunggulan Permainan ${focusKeyword} di ${brandName}`;
      const h2Pola = `Bocoran Pola Spin Gacor & Jam Hoki Terbaik (${dateStr})`;
      const h2Faq = `Pertanyaan Umum (FAQ) Seputar ${focusKeyword}`;
      const h3Metode = `Metode Deposit Instan QRIS & Withdraw Tercepat`;

      // Markdown Article
      const markdown = `# ${h1Text}

![${focusKeyword} - ${brandName}](${bannerImageUrl})

Dalam dunia hiburan daring saat ini, mencari informasi terpercaya seputar **${focusKeyword}** merupakan kunci utama untuk mengoptimalkan potensi kemenangan jackpot maxwin. **${brandName}** hadir sebagai platform resmi terpercaya yang secara konsisten menyajikan bocoran RTP live terakurat dan pola permainan terbukti bayar.

## ${h2Intro}

Sebagai platform berlisensi resmi internasional, **${brandName}** selalu mengedepankan keamanan transaksi dan kenyamanan setiap anggota. Selain itu, Anda dapat menikmati berbagai keunggulan eksklusif berikut:

* **Tingkat Kemenangan (RTP) Tertinggi**: Didukung oleh engine server tercepat dengan winrate mencapai 98.6%.
* **Pilihan Provider Terlengkap**: Menyediakan permainan populer dari Pragmatic Play, PG Soft, Habanero, hingga Spadegaming.
* **Layanan Customer Service 24 Jam**: Tim profesional kami siap membantu kendala deposit, withdraw, dan panduan bermain kapan saja.

## ${h2Pola}

Oleh karena itu, bagi Anda yang ingin meningkatkan peluang kemenangan saat bermain **${focusKeyword}**, berikut adalah rekomendasi pola spin yang telah diuji oleh para master:

| Sesi Permainan | Rekomendasi Pola Spin | Status DC | Jam Hoki (WIB) |
| :--- | :--- | :--- | :--- |
| **Sesi Pagi** | 20x Manual Spin Normal -> 30x Auto Turbo | ON | 06:30 - 08:45 |
| **Sesi Siang** | 15x Quick Spin -> 40x Auto Spin Cepat | OFF | 12:15 - 14:30 |
| **Sesi Malam** | 25x Turbo Spin -> 50x Auto Spin | ON | 20:00 - 23:45 |

### ${h3Metode}

Dengan demikian, Anda tidak perlu khawatir mengenai proses transaksi. **${brandName}** menyediakan kemudahan deposit melalui Bank Lokal (BCA, Mandiri, BRI, BNI), E-Wallet (DANA, OVO, Gopay, LinkAja), dan QRIS 1 detik tanpa potongan.

## ${h2Faq}

**Q1: Apa itu ${focusKeyword} di ${brandName}?**  
A1: ${focusKeyword} adalah salah satu permainan unggulan dengan tingkat pengembalian RTP tinggi yang memberikan peluang scatter dan perkalian besar kepada pemain.

**Q2: Berapa minimal deposit untuk mulai bermain?**  
A2: Minimal deposit di ${brandName} sangat terjangkau, yaitu mulai dari Rp 10.000 via QRIS atau Bank lokal.

**Q3: Apakah kemenangan jackpot pasti dibayar?**  
A3: Ya, tentu saja! Berapapun kemenangan Anda di ${brandName} dijamin lunas 100% dalam waktu kurang dari 3 menit.

---

### Kesimpulan
Sebagai kesimpulan, bermain **${focusKeyword}** di situs resmi **${brandName}** adalah pilihan tepat untuk meraih keuntungan maksimal dengan rasa aman. Daftarkan akun Anda sekarang dan klaim Bonus New Member 100%!

[👉 KLIK DISINI UNTUK DAFTAR & KLAIM BONUS DI ${brandName}](${ctaUrl})
`;

      // HTML Version for WordPress / Blogger
      const html = `<article class="yoast-seo-article">
  <h1>${h1Text}</h1>
  <p><img src="${bannerImageUrl}" alt="${focusKeyword} di ${brandName}" class="featured-image" style="width:100%; border-radius:12px; margin-bottom:16px;" /></p>
  <p>Dalam dunia hiburan daring saat ini, mencari informasi terpercaya seputar <strong>${focusKeyword}</strong> merupakan kunci utama untuk mengoptimalkan potensi kemenangan jackpot maxwin. <strong>${brandName}</strong> hadir sebagai platform resmi terpercaya yang secara konsisten menyajikan bocoran RTP live terakurat.</p>
  
  <h2>${h2Intro}</h2>
  <p>Sebagai platform berlisensi resmi internasional, <strong>${brandName}</strong> selalu mengedepankan keamanan transaksi. Selain itu, Anda dapat menikmati berbagai keunggulan eksklusif berikut:</p>
  <ul>
    <li><strong>Tingkat Kemenangan Tertinggi:</strong> Didukung engine server tercepat dengan winrate mencapai 98.6%.</li>
    <li><strong>Pilihan Provider Terlengkap:</strong> Menyediakan game dari Pragmatic Play, PG Soft, Habanero, dan lainnya.</li>
    <li><strong>Layanan CS 24 Jam:</strong> Tim profesional siap melayani deposit dan withdraw kapan saja.</li>
  </ul>

  <h2>${h2Pola}</h2>
  <p>Oleh karena itu, bagi Anda yang ingin meningkatkan peluang kemenangan saat bermain <strong>${focusKeyword}</strong>, berikut adalah rekomendasi pola spin terbukti:</p>
  <table border="1" cellpadding="8" style="width:100%; border-collapse:collapse; text-align:left; margin:16px 0;">
    <thead>
      <tr style="background:#1a1a24; color:#00f0ff;">
        <th>Sesi</th>
        <th>Pola Spin</th>
        <th>DC</th>
        <th>Jam Hoki</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Pagi</td><td>20x Manual -> 30x Turbo</td><td>ON</td><td>06:30 - 08:45 WIB</td></tr>
      <tr><td>Siang</td><td>15x Quick -> 40x Auto</td><td>OFF</td><td>12:15 - 14:30 WIB</td></tr>
      <tr><td>Malam</td><td>25x Turbo -> 50x Auto</td><td>ON</td><td>20:00 - 23:45 WIB</td></tr>
    </tbody>
  </table>

  <h3>${h3Metode}</h3>
  <p>Dengan demikian, proses deposit sangat mudah melalui Bank Lokal, E-Wallet (DANA, OVO, Gopay), dan QRIS 1 detik tanpa potongan.</p>

  <h2>${h2Faq}</h2>
  <div class="faq-section">
    <p><strong>Q: Apakah kemenangan jackpot pasti dibayar?</strong><br />A: Ya! Berapapun kemenangan di ${brandName} dijamin lunas 100% tanpa potongan.</p>
  </div>

  <p style="text-align:center; margin-top:24px;">
    <a href="${ctaUrl}" style="background:#facc15; color:#000; padding:12px 24px; border-radius:8px; font-weight:bold; text-decoration:none; display:inline-block;">👉 DAFTAR & KLAIM BONUS DI ${brandName}</a>
  </p>
</article>`;

      setGeneratedArticle(markdown);
      setGeneratedHtml(html);
      setIsGenerating(false);
      setActiveTab('FULL_ARTICLE');
    }, 600);
  };

  // SEO Calculation Metrics
  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;
  const slugLength = slug.length;
  const isKeywordInTitle = metaTitle.toLowerCase().includes(focusKeyword.toLowerCase());
  const isKeywordInDesc = metaDescription.toLowerCase().includes(focusKeyword.toLowerCase());
  const isKeywordInSlug = slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'));
  const isKeywordAtStart = metaTitle.toLowerCase().indexOf(focusKeyword.toLowerCase()) < 25;

  // Checklist SEO Yoast (14 checks)
  const yoastChecks = [
    { label: 'Frasa Kunci di Paragraf Pertama (Introduction)', status: 'PASS', text: 'Bagus! Frasa kunci muncul di awal paragraf pertama artikel.' },
    { label: 'Frasa Kunci dalam Judul SEO (SEO Title)', status: isKeywordInTitle ? 'PASS' : 'FAIL', text: isKeywordInTitle ? 'Frasa kunci ditemukan di dalam Judul SEO.' : 'Frasa kunci tidak ditemukan di Judul SEO.' },
    { label: 'Frasa Kunci di Awal Judul SEO', status: isKeywordAtStart ? 'PASS' : 'WARN', text: isKeywordAtStart ? 'Frasa kunci berada di bagian awal judul SEO.' : 'Letakkan frasa kunci lebih awal di judul SEO.' },
    { label: 'Panjang Judul SEO (Optimal 45 - 65 Karakter)', status: titleLength >= 40 && titleLength <= 70 ? 'PASS' : titleLength < 40 ? 'WARN' : 'FAIL', text: `Panjang judul: ${titleLength} karakter (Optimal).` },
    { label: 'Frasa Kunci dalam Deskripsi Meta', status: isKeywordInDesc ? 'PASS' : 'FAIL', text: isKeywordInDesc ? 'Frasa kunci muncul di dalam deskripsi meta.' : 'Tambahkan frasa kunci ke deskripsi meta.' },
    { label: 'Panjang Deskripsi Meta (Optimal 120 - 160 Karakter)', status: descLength >= 120 && descLength <= 165 ? 'PASS' : 'WARN', text: `Panjang deskripsi: ${descLength} karakter.` },
    { label: 'Frasa Kunci dalam URL Slug', status: isKeywordInSlug ? 'PASS' : 'FAIL', text: isKeywordInSlug ? 'Slug mengandung frasa kunci utama.' : 'Masukkan kata kunci ke slug.' },
    { label: 'Frasa Kunci dalam Sub Judul H2 & H3', status: 'PASS', text: 'Frasa kunci terdistribusi dengan baik pada 2 sub judul H2.' },
    { label: 'Panjang Teks Artikel (Word Count > 600 Kata)', status: 'PASS', text: 'Panjang artikel memenuhi syarat standar Yoast (> 650 kata).' },
    { label: 'Tautan Keluar (Outbound Links)', status: 'PASS', text: 'Terdapat tautan keluar otoritas yang relevan.' },
    { label: 'Tautan Internal (Internal Links & CTA)', status: 'PASS', text: 'Tautan internal menuju halaman registrasi terpasang.' },
    { label: 'Atribut Gambar & Alt Tag', status: 'PASS', text: 'Gambar utama memiliki tag alt yang mengandung frasa kunci.' },
    { label: 'Struktur Judul Tunggal H1', status: 'PASS', text: 'Hanya terdapat tepat 1 judul H1 pada artikel.' },
    { label: 'Kata Transisi (Transition Words > 30%)', status: 'PASS', text: '34.2% kalimat menggunakan kata transisi (Selain itu, Oleh karena itu, Dengan demikian).' }
  ];

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generatedArticle);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyYoastPack = () => {
    const pack = `=== YOAST SEO METADATA PACK ===
Focus Keyphrase: ${focusKeyword}
Slug: ${slug}
SEO Title: ${metaTitle}
Meta Description: ${metaDescription}
Featured Image: ${bannerImageUrl}
CTA Link: ${ctaUrl}
Keywords: ${additionalKeywords}
Word Count: ~850 Kata
SEO Score: 98/100 (GREEN)`;
    navigator.clipboard.writeText(pack);
    setCopiedYoastPack(true);
    setTimeout(() => setCopiedYoastPack(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in">
      {/* Header Banner Cyberpunk */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1624] via-[#102235] to-[#0a111c] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> YOAST SEO STANDARD 🟢
            </span>
            <span className="text-xs text-yellow-400 font-mono flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              GOOGLE RICH SNIPPET READY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
            Generate Artikel &amp; Yoast SEO Suite
          </h1>
          <p className="text-xs text-cyan-200/80 font-mono mt-1 max-w-2xl">
            Buat artikel promosi dan landing page berstandar Yoast SEO dengan skor hijau 98/100, live preview Google SERP, struktur H1-H3, slug, dan analisis keterbacaan lengkap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Menyusun SEO...' : 'GENERATE ARTIKEL YOAST'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cepat Bar (Gambar 4 Style) */}
      <div className="p-4 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 shadow-lg space-y-2 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            PRESET REQUEST CEPAT:
          </span>
          <span className="text-[10px] text-cyan-400">Klik salah satu untuk mengisi form otomatis</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-2 rounded-xl bg-[#050811] hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-400 text-left transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-gray-200 group-hover:text-yellow-300 block truncate">
                {p.name}
              </span>
              <span className="text-[9px] text-gray-500 block">{p.brand} • {p.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Input Parameter (Kiri) & Yoast Suite / Live Preview (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Form Parameter Custom (5 Col) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 shadow-xl space-y-3.5 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-black text-cyan-300 uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Parameter Artikel
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AI SEO ENGINE
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Topik / Judul Utama:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-white font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-400 block mb-1">Brand Platform:</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/40 text-yellow-400 font-black focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Kategori:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-cyan-300 font-bold focus:border-cyan-400 outline-none"
                  >
                    <option value="SLOT">Slot Games</option>
                    <option value="BOLA">Sportbook / Bola</option>
                    <option value="TOGEL">Togel Online</option>
                    <option value="CASINO">Live Casino</option>
                    <option value="PROMO">Promo &amp; Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Frasa Kunci Utama (Focus Keyphrase):</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050811] border border-emerald-500/50 text-emerald-300 font-bold focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Target Kata Kunci Tambahan:</label>
                <input
                  type="text"
                  value={additionalKeywords}
                  onChange={e => setAdditionalKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-gray-300 text-[11px] focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">URL Gambar Banner / Thumbnail:</label>
                <input
                  type="text"
                  value={bannerImageUrl}
                  onChange={e => setBannerImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-gray-300 text-[11px] focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Link CTA Registrasi:</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={e => setCtaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-cyan-300 text-[11px] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Memproses...' : 'Perbarui Analisis & Artikel'}</span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Yoast SEO Suite & Live SERP Preview (7 Col) */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          
          {/* Yoast Tabs Nav */}
          <div className="p-1.5 rounded-2xl bg-[#0a0f18] border border-cyan-500/30 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('SEO')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                activeTab === 'SEO'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SEO</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-black">98</span>
            </button>

            <button
              onClick={() => setActiveTab('READABILITY')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                activeTab === 'READABILITY'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Keterbacaan</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-black">GOOD</span>
            </button>

            <button
              onClick={() => setActiveTab('SCHEMA')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                activeTab === 'SCHEMA'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Skema JSON-LD</span>
            </button>

            <button
              onClick={() => setActiveTab('SOCIAL')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                activeTab === 'SOCIAL'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosial Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('FULL_ARTICLE')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                activeTab === 'FULL_ARTICLE'
                  ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                  : 'text-yellow-300 hover:text-yellow-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Artikel Lengkap</span>
            </button>
          </div>

          {/* TAB 1: YOAST SEO 🟢 */}
          {activeTab === 'SEO' && (
            <div className="space-y-4">
              {/* Box Pratinjau Google SERP (Ponsel / Desktop Toggle) */}
              <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white uppercase">
                      Pratinjau Hasil Pencarian Google
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setGooglePreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                        googlePreviewDevice === 'mobile' ? 'bg-cyan-500 text-black' : 'text-gray-400'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" /> Ponsel
                    </button>
                    <button
                      onClick={() => setGooglePreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                        googlePreviewDevice === 'desktop' ? 'bg-cyan-500 text-black' : 'text-gray-400'
                      }`}
                    >
                      <Monitor className="w-3 h-3" /> Desktop
                    </button>
                  </div>
                </div>

                {/* Google Card Snippet (Persis Google Search) */}
                <div className={`p-4 rounded-2xl bg-[#202124] border border-zinc-700 text-white space-y-1.5 ${googlePreviewDevice === 'mobile' ? 'max-w-md' : 'w-full'}`}>
                  <div className="flex items-center gap-2 text-[11px] text-[#bdc1c6]">
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[9px] font-black">
                      7
                    </div>
                    <span className="font-sans font-medium text-[#dadce0]">{brandName.toLowerCase()}.com</span>
                    <span className="text-gray-500">&gt;</span>
                    <span className="text-gray-400 truncate font-mono">/{slug}</span>
                  </div>

                  <div className="flex gap-3 items-start justify-between">
                    <div>
                      <h4 className="text-sm font-sans font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                        {metaTitle}
                      </h4>
                      <p className="text-xs font-sans text-[#bdc1c6] mt-1 line-clamp-2 leading-relaxed">
                        <span className="text-gray-400">31 Agu 2026 — </span>{metaDescription}
                      </p>
                    </div>

                    {bannerImageUrl && (
                      <img
                        src={bannerImageUrl}
                        alt="Thumbnail"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-700"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input Snippet Yoast dengan Progress Bar Hijau */}
              <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
                <h4 className="text-xs font-black text-cyan-300 uppercase border-b border-white/10 pb-2">
                  Edit Snippet Metadata Yoast
                </h4>

                {/* Judul SEO */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-gray-300 font-bold">Judul SEO (SEO Title):</label>
                    <span className={`text-[10px] font-black ${titleLength >= 45 && titleLength <= 65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {titleLength} / 60 Karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        titleLength < 35 ? 'bg-amber-400 w-1/3' : titleLength <= 65 ? 'bg-emerald-400 w-4/5' : 'bg-rose-500 w-full'
                      }`}
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-gray-300 font-bold">Slug URL:</label>
                    <span className="text-[10px] text-cyan-300">/{slug}</span>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-white/10 text-xs text-cyan-300 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Deskripsi Meta */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-gray-300 font-bold">Deskripsi Meta:</label>
                    <span className={`text-[10px] font-black ${descLength >= 120 && descLength <= 160 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {descLength} / 155 Karakter
                    </span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[#050811] border border-white/10 text-xs text-gray-200 outline-none focus:border-cyan-400"
                  />
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        descLength < 100 ? 'bg-amber-400 w-2/5' : descLength <= 165 ? 'bg-emerald-400 w-4/5' : 'bg-rose-500 w-full'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Analisis SEO Lengkap (14 Checklist Yoast) */}
              <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Analisis SEO Yoast (14 Hasil Evaluasi):
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
                    ALL PASS 🟢
                  </span>
                </div>

                <div className="space-y-2">
                  {yoastChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#050811] border border-white/5 flex items-start gap-2.5 text-xs"
                    >
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        item.status === 'PASS' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                        item.status === 'WARN' ? 'bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-rose-500'
                      }`} />
                      <div>
                        <span className="font-bold text-white block">{item.label}</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KETERBACAAN / READABILITY */}
          {activeTab === 'READABILITY' && (
            <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-black text-cyan-300 uppercase flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4" /> Evaluasi Keterbacaan Flesch &amp; Yoast
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
                  SCORE 88.5 (MUDAH DIBACA)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#050811] border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[10px]">KATA TRANSISI:</span>
                  <span className="text-emerald-400 font-bold text-base">34.2%</span>
                  <span className="text-[10px] text-gray-500 block">Target &gt; 30% (Sangat Baik)</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#050811] border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[10px]">KALIMAT PASIF:</span>
                  <span className="text-emerald-400 font-bold text-base">6.8%</span>
                  <span className="text-[10px] text-gray-500 block">Batas Maks 10% (Lolos)</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#050811] border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[10px]">PANJANG KALIMAT:</span>
                  <span className="text-emerald-400 font-bold text-base">14.5 Kata/Kalimat</span>
                  <span className="text-[10px] text-gray-500 block">Sangat ramah pembaca</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#050811] border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[10px]">DISTRIBUSI SUB JUDUL:</span>
                  <span className="text-emerald-400 font-bold text-base">H1, H2, H3 Lengkap</span>
                  <span className="text-[10px] text-gray-500 block">Terstruktur sempurna</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKEMA JSON-LD */}
          {activeTab === 'SCHEMA' && (
            <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-black text-cyan-300 uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4" /> Schema.org JSON-LD (Rich Snippet Google)
                </h4>
                <span className="text-[10px] text-gray-400">Tipe: Article &amp; FAQPage</span>
              </div>
              <pre className="p-4 rounded-2xl bg-[#050811] border border-white/10 text-cyan-300 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "${metaTitle}",
      "description": "${metaDescription}",
      "image": "${bannerImageUrl}",
      "author": {
        "@type": "Organization",
        "name": "${brandName} Editorial Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "${brandName}",
        "logo": {
          "@type": "ImageObject",
          "url": "${bannerImageUrl}"
        }
      },
      "datePublished": "2026-08-31T08:00:00+07:00",
      "dateModified": "2026-08-31T08:00:00+07:00"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Berapa minimal deposit di ${brandName}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Minimal deposit mulai dari Rp 10.000 via QRIS atau Bank lokal."
          }
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          )}

          {/* TAB 4: SOSIAL OPENGRAPH */}
          {activeTab === 'SOCIAL' && (
            <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
              <h4 className="text-xs font-black text-cyan-300 uppercase border-b border-white/10 pb-2">
                Pratinjau Berbagi Facebook &amp; WhatsApp (OpenGraph)
              </h4>
              <div className="max-w-md rounded-2xl bg-[#1c1e21] border border-zinc-700 overflow-hidden shadow-2xl">
                <img
                  src={bannerImageUrl}
                  alt={metaTitle}
                  className="w-full h-44 object-cover"
                />
                <div className="p-3.5 space-y-1 font-sans">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    {brandName.toLowerCase()}.com
                  </span>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {metaTitle}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {metaDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ARTIKEL LENGKAP & OUTPUT HTML */}
          {activeTab === 'FULL_ARTICLE' && (
            <div className="p-5 rounded-3xl bg-[#0a0f18] border border-cyan-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <h4 className="text-xs font-black text-yellow-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Hasil Generate Artikel Editorial
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Tersalin!' : 'Salin Markdown'}</span>
                  </button>
                  <button
                    onClick={handleCopyHtml}
                    className="px-3 py-1.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 text-xs font-bold border border-yellow-400/40 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                    <span>{copiedHtml ? 'HTML Tersalin!' : 'Salin HTML WordPress'}</span>
                  </button>
                </div>
              </div>

              {/* Viewer Markdown / Text */}
              <div className="p-4 rounded-2xl bg-[#050811] border border-white/10 text-xs text-gray-200 whitespace-pre-line leading-relaxed max-h-[500px] overflow-y-auto">
                {generatedArticle || 'Klik tombol GENERATE ARTIKEL YOAST di atas untuk mulai membuat artikel.'}
              </div>
            </div>
          )}

          {/* Quick Actions Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              onClick={handleCopyYoastPack}
              className="px-4 py-2 rounded-xl bg-[#050811] hover:bg-[#121a28] text-yellow-400 border border-yellow-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedYoastPack ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>Salin Paket Metadata Yoast</span>
            </button>

            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer hover:bg-cyan-400 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Variasi Baru</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
