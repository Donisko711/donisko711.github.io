import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Flame, 
  Trophy, 
  Percent, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Coins, 
  Gamepad2, 
  Dices, 
  ChevronRight,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react';

export interface PromoItem {
  id: string;
  title: string;
  category: 'NEW_MEMBER' | 'HARIAN' | 'CASHBACK' | 'ROLLINGAN' | 'EVENT_SLOT' | 'PARLAY' | 'TOGEL' | 'REFERRAL';
  categoryLabel: string;
  brand: string[];
  bannerUrl: string;
  badge: string;
  badgeColor: string;
  minDepo: string;
  maxBonus: string;
  turnOver: string;
  targetGame: string;
  deskripsi: string;
  syaratKetentuan: string[];
  csScriptReply: string;
}

export const PROMO_DATA: PromoItem[] = [
  {
    id: 'promo-1',
    title: 'BONUS NEW MEMBER 100% (KHUSUS SLOT)',
    category: 'NEW_MEMBER',
    categoryLabel: 'New Member',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'AYUTOGEL', 'BLACKTOGEL', 'SEMPOA4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    badge: 'HOT PROMO',
    badgeColor: 'bg-rose-500 text-white',
    minDepo: 'Rp 25.000',
    maxBonus: 'Rp 100.000',
    turnOver: 'TO Saldo x8 (Khusus Pragmatic & PG Soft)',
    targetGame: 'Slot Games (Kecuali Money Roll & Classic)',
    deskripsi: 'Bonus selamat datang 100% ekstra saldo langsung di depan untuk seluruh member baru yang melakukan deposit pertama via Bank / E-Wallet.',
    syaratKetentuan: [
      'Khusus deposit pertama member baru via Bank & E-Wallet (BCA, Mandiri, BRI, BNI, Dana, Ovo, Gopay).',
      'Wajib klaim ke Livechat / WhatsApp resmi sebelum saldo dimainkan.',
      'Syarat Withdraw adalah Turn Over (TO) Saldo x8 (Contoh: Depo 50k + Bonus 50k = 100k x 8 = Target Saldo 800k).',
      'Dilarang melakukan hold spin / simpan free spin. Jika terindikasi kecurangan saldo dan kemenangan akan dibekukan.'
    ],
    csScriptReply: `Halo Bosku! 🎉 Khusus pendaftaran baru hari ini tersedia Promo *BONUS NEW MEMBER 100%*!\n\n📌 Min Depo: Rp 25.000 (Maks Bonus Rp 100.000)\n🎯 Syarat TO: x8 Target Saldo\n🎰 Berlaku untuk semua provider Slot Pragmatic & PG Soft.\n\nSilakan lakukan deposit dan konfirmasi formulir setor dana, tim kasir kami siap langsung proseskan ya Bosku! 🚀`
  },
  {
    id: 'promo-2',
    title: 'BONUS DEPOSIT HARIAN 10% - 20% SETIAP HARI',
    category: 'HARIAN',
    categoryLabel: 'Bonus Harian',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'AYUTOGEL', 'SEMPOA4D', 'TEMA4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    badge: 'DAILY BONUS',
    badgeColor: 'bg-amber-500 text-black',
    minDepo: 'Rp 20.000',
    maxBonus: 'Rp 500.000 / Hari',
    turnOver: 'TO Betting x3',
    targetGame: 'Semua Permainan Slot & Live Casino',
    deskripsi: 'Tambahan saldo 10% s/d 20% yang dapat diklaim setiap hari 1x untuk memberikan modal lebih dalam meraih jackpot.',
    syaratKetentuan: [
      'Dapat diklaim 1x per hari saat deposit pertama di hari tersebut.',
      'Syarat Turn Over hanya x3 dari (Deposit + Bonus).',
      'Bebas buy spin dan bebas semua game slot tanpa batasan IP.',
      'Bisa deposit via Bank, E-Wallet, dan QRIS Instan.'
    ],
    csScriptReply: `Kabar gembira Bosku! ⚡ Promo *BONUS DEPOSIT HARIAN 10%* sudah aktif di akun Bosku.\n\n💵 Min Depo: Rp 20.000\n🔥 Syarat TO Ringan: Hanya x3 Bettingan!\n\nLangsung depo sekarang via QRIS/Bank agar bonus otomatis masuk ke saldo ya Bosku. Salam Cuan! 💰`
  },
  {
    id: 'promo-3',
    title: 'BONUS CASHBACK KEKALAHAN SPORTBOOK & CASINO 5% - 10%',
    category: 'CASHBACK',
    categoryLabel: 'Cashback',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'HAES4D', 'BLACKTOGEL'],
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    badge: 'MINGGUAN',
    badgeColor: 'bg-emerald-500 text-black',
    minDepo: 'Min Lose Rp 100.000 / Minggu',
    maxBonus: 'Tanpa Batas (Unlimited)',
    turnOver: 'Tanpa TO (Bisa Langsung WD)',
    targetGame: 'Sportsbook SBO/CMD & Live Casino',
    deskripsi: 'Garansi modal kembali dengan pembagian cashback mingguan tanpa batas setiap hari Senin langsung masuk ke user ID.',
    syaratKetentuan: [
      'Dihitung dari total kekalahan bersih (Lose) member dari periode Senin s/d Minggu.',
      'Minimal kekalahan per minggu adalah Rp 100.000.',
      'Cashback 5% untuk kekalahan 100k - 50jt, 10% untuk kekalahan > 50jt.',
      'Bonus dibagikan otomatis setiap Senin pukul 12.00 - 15.00 WIB tanpa perlu diklaim manual.'
    ],
    csScriptReply: `Halo Bosku, untuk *CASHBACK SPORTBOOK & CASINO 5%-10%* dibagikan otomatis setiap hari Senin siang ya Bosku. Bonus dihitung dari total lose bersih selama 1 minggu dan *BISA LANGSUNG DI-WITHDRAW-KAN* tanpa syarat TO! 🎁`
  },
  {
    id: 'promo-4',
    title: 'ROLLINGAN / REBATE HARIAN & MINGGUAN 0.8% - 1.0%',
    category: 'ROLLINGAN',
    categoryLabel: 'Rebate',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'AYUTOGEL', 'BLACKTOGEL', 'SEMPOA4D', 'BIGOTO4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
    badge: 'UNLIMITED',
    badgeColor: 'bg-cyan-500 text-black',
    minDepo: 'Min TO Rp 500.000',
    maxBonus: 'Tanpa Batas Maksimal',
    turnOver: 'Tanpa TO (Langsung Cair)',
    targetGame: 'Slot Games & Live Casino',
    deskripsi: 'Dapatkan komisi rollingan turnover terbesar yang dibagikan secara transparan semakin sering Anda bermain.',
    syaratKetentuan: [
      'Dihitung dari total turnover (perputaran taruhan) menang ataupun kalah.',
      'Persentase: Slot 0.8%, Live Casino 0.8%, Poker/Games 0.5%.',
      'Dibagikan rutin ke dompet utama member dan bisa langsung dimainkan atau di-withdraw.'
    ],
    csScriptReply: `Halo Bosku! Bonus *ROLLINGAN / REBATE 0.8%* dihitung dari total taruhan Bosku selama bermain (menang maupun kalah tetap dihitung). Semakin sering bermain, semakin besar bonus saldo yang Bosku dapatkan! 🔥`
  },
  {
    id: 'promo-5',
    title: 'EVENT EXTRA SCATTER & FREESPIN PRAGMATIC / PG SOFT',
    category: 'EVENT_SLOT',
    categoryLabel: 'Event Slot',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'AYUTOGEL', 'SEMPOA4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    badge: 'EXTRA PRIZE',
    badgeColor: 'bg-purple-500 text-white',
    minDepo: 'Min Stake Bet Rp 800',
    maxBonus: 'Rp 1.500.000 / Klaim (Maks 3x Sehari)',
    turnOver: 'Tanpa TO',
    targetGame: 'Mahjong Ways 1 & 2, Gates of Olympus, Starlight Princess',
    deskripsi: 'Dapatkan hadiah uang tunai tambahan saat mendapatkan Scatter 4, 5, 6 di game Mahjong Ways atau Petir x100, x250, x500 di Gates of Olympus.',
    syaratKetentuan: [
      'Wajib screenshot bukti scatter / multiplier petir dan riwayat permainan.',
      'Posting ke Grup Facebook / Telegram Official dengan hashtag resmi.',
      'Klaim melalui WhatsApp Bonus / Livechat CS dengan mengirimkan bukti screenshot.',
      'Maksimal klaim 3x per hari per akun (reset setiap jam 00:00 WIB).'
    ],
    csScriptReply: `Selamat atas kemenangannya Bosku! 🎉 Untuk klaim *EVENT EXTRA SCATTER / PETIR*:\n\n1. Screenshot bukti kemenangan Scatter / Multiplier di ronde tersebut.\n2. Kirimkan foto bukti + User ID ke Livechat / WhatsApp kami.\n\nTim kami segera cek history ronde dan langsung cairkan bonusnya ke akun Bosku ya! ⚡`
  },
  {
    id: 'promo-6',
    title: 'EVENT BONUS PARLAY WIN FULL & LOSE 1 CASH PRIZE',
    category: 'PARLAY',
    categoryLabel: 'Mix Parlay',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'BLACKTOGEL', 'HAES4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    badge: 'SPORT EVENT',
    badgeColor: 'bg-blue-500 text-white',
    minDepo: 'Min Stake Rp 10.000 (Win Full) / Rp 25.000 (Lose 1)',
    maxBonus: 'Hingga Rp 5.000.000 / Tiket',
    turnOver: 'Tanpa TO',
    targetGame: 'Sportsbook Mix Parlay (HDP / OU / 1X2)',
    deskripsi: 'Hadiah tunai ekstra bagi pemain Mix Parlay yang tembus Win Full 5 - 10 Team (Maks 5 Juta) atau kalah tipis 1 Partai Lose Full (Cashback Odds).',
    syaratKetentuan: [
      'Minimal 5 partai dalam 1 tiket Mix Parlay.',
      'Odds minimal per partai 1.75 (Odds Indonesia / Desimal).',
      'Tiket wajib berstatus Win Full semua (tanpa LH, WH, Void) untuk klaim Win Full.',
      'Untuk Lose 1, wajib 4 partai Win Full + 1 partai Lose Full murni (Min Stake Rp 25.000).'
    ],
    csScriptReply: `Mantap Bosku! Tiket parlay Bosku bisa dicek langsung di sistem kami. Untuk *PARLAY WIN FULL* hadiah tambahan mulai dari 100k hingga 5 JUTA RUPIAH! Silakan kirimkan nomor tiket parlaynya ya Bosku! ⚽🏆`
  },
  {
    id: 'promo-7',
    title: 'DISKON & HADIAH TOGEL TERBESAR 4D/3D/2D HINGGA 10 JUTA',
    category: 'TOGEL',
    categoryLabel: 'Togel Online',
    brand: ['ALL BRAND', 'AYUTOGEL', 'BLACKTOGEL', 'SEMPOA4D', 'TEMA4D', 'HAES4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
    badge: 'HADIAH MAX',
    badgeColor: 'bg-emerald-600 text-white',
    minDepo: 'Min Bet Rp 100 Perak',
    maxBonus: 'Hadiah 4D x10.000 (10 Juta)',
    turnOver: 'Tanpa TO',
    targetGame: 'Semua Pasaran Togel Resmi (HK, SGP, SDY, Macau, dll)',
    deskripsi: 'Nikmati pembayaran hadiah tebak angka togel terbesar dengan diskon bet mencapai 66% dan opsi Bet Full bayaran Rp 10.000.000 untuk 4D.',
    syaratKetentuan: [
      'Tersedia Mode Bet Full (4D x10.000, 3D x1.000, 2D x100) dan Mode Bet Diskon (Diskon 4D 66%, 3D 59%, 2D 29%).',
      'Tanpa batasan line untuk BBFS (Bebas pasang angka bolak balik).',
      'Buka 24 jam dengan pasaran resmi WLA bersertifikat internasional.'
    ],
    csScriptReply: `Halo Bosku! Di situs kami hadiah TOGEL 4D mencapai *Rp 10.000.000* untuk Bet Full, serta diskon bet hingga 66% dengan minimal pasang hanya 100 perak saja. Pasaran lengkap Singapore, Hongkong, Sydney, Macau dan buka setiap hari! 🎯`
  },
  {
    id: 'promo-8',
    title: 'BONUS REFERRAL SEUMUR HIDUP 1% - 2.5% TANPA MODAL',
    category: 'REFERRAL',
    categoryLabel: 'Referral',
    brand: ['ALL BRAND', 'HORAS711', 'ZEUS711', 'AYUTOGEL', 'BLACKTOGEL', 'SEMPOA4D'],
    bannerUrl: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80',
    badge: 'PASIF INCOME',
    badgeColor: 'bg-yellow-500 text-black',
    minDepo: 'Rp 0 (Tanpa Deposit)',
    maxBonus: 'Tanpa Batas Seumur Hidup',
    turnOver: 'Tanpa Syarat TO',
    targetGame: 'Seluruh Turnover Member Downline',
    deskripsi: 'Ajak teman dan bagikan link referral Anda untuk mendapatkan passive income otomatis setiap minggu seumur hidup.',
    syaratKetentuan: [
      'Dapatkan link referral unik di menu profil akun Anda.',
      'Komisi dihitung dari total perputaran taruhan atau turnover seluruh downline yang terdaftar di bawah link Anda.',
      'Komisi otomatis cair ke saldo akun setiap awal bulan / mingguan dan bisa langsung di-withdraw.'
    ],
    csScriptReply: `Halo Bosku! Mau dapat penghasilan pasif tanpa modal? Cukup bagikan *LINK REFERRAL* Bosku ke teman-teman. Setiap kali teman bermain, Bosku otomatis dapat komisi bonus hingga 2.5% seumur hidup! 💎`
  }
];

export const ModulPromoSitus: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL BRAND');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalPromo, setActiveModalPromo] = useState<PromoItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Semua Promo' },
    { id: 'NEW_MEMBER', label: 'New Member' },
    { id: 'HARIAN', label: 'Bonus Harian' },
    { id: 'CASHBACK', label: 'Cashback' },
    { id: 'ROLLINGAN', label: 'Rollingan / Rebate' },
    { id: 'EVENT_SLOT', label: 'Event Scatter Slot' },
    { id: 'PARLAY', label: 'Bonus Parlay' },
    { id: 'TOGEL', label: 'Hadiah Togel' },
    { id: 'REFERRAL', label: 'Referral' }
  ];

  const brands = [
    'ALL BRAND',
    'HORAS711',
    'ZEUS711',
    'AYUTOGEL',
    'BLACKTOGEL',
    'SEMPOA4D',
    'TEMA4D',
    'HAES4D',
    'BIGOTO4D'
  ];

  const filteredPromos = PROMO_DATA.filter(promo => {
    const matchCategory = selectedCategory === 'ALL' || promo.category === selectedCategory;
    const matchBrand = selectedBrand === 'ALL BRAND' || promo.brand.includes('ALL BRAND') || promo.brand.includes(selectedBrand);
    const matchSearch = promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        promo.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        promo.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchBrand && matchSearch;
  });

  const handleCopyScript = (promo: PromoItem) => {
    navigator.clipboard.writeText(promo.csScriptReply);
    setCopiedId(promo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in">
      {/* Header Banner Cyberpunk HS Group */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1624] via-[#102235] to-[#0a111c] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              MODUL BELAJAR • KATALOG PROMO
            </span>
            <span className="text-xs text-yellow-400 font-mono flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              PROMO SITUS HS GROUP 711
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
            Katalog &amp; Panduan Promo Situs
          </h1>
          <p className="text-xs text-cyan-200/80 font-mono mt-1 max-w-2xl">
            Informasi lengkap seluruh promosi resmi brand (New Member, Harian, Rollingan, Event Scatter, Mix Parlay, Hadiah Togel) beserta skrip template cepat untuk Customer Service.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#060b13] border border-cyan-500/30 text-xs font-mono">
          <Gift className="w-5 h-5 text-yellow-400 animate-bounce" />
          <div>
            <span className="text-gray-400 block text-[10px]">TOTAL PROMO AKTIF</span>
            <span className="text-cyan-300 font-black text-sm">{PROMO_DATA.length} Promo Resmi</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#0a0f18] border border-white/10 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari promo (contoh: New Member, Scatter, Parlay, Hadiah Togel)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#050811] border border-cyan-500/30 text-xs font-mono text-cyan-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
            />
          </div>

          {/* Filter Brand */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-gray-400 whitespace-nowrap">Filter Brand:</span>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#050811] border border-cyan-500/30 text-xs font-mono font-bold text-yellow-400 focus:outline-none focus:border-cyan-400"
            >
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#050811] text-gray-400 border-white/10 hover:text-white hover:border-cyan-500/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPromos.map(promo => (
          <div
            key={promo.id}
            className="rounded-3xl bg-[#0a0f18] border border-cyan-500/30 shadow-xl overflow-hidden flex flex-col justify-between hover:border-cyan-400/60 transition-all group"
          >
            <div>
              {/* Promo Thumbnail / Banner Header */}
              <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                <img
                  src={promo.bannerUrl}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-black/60" />
                
                {/* Badge Top Left & Brand Top Right */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider shadow-md ${promo.badgeColor}`}>
                    {promo.badge}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold backdrop-blur-md">
                    {promo.categoryLabel}
                  </span>
                </div>

                {/* Title inside card banner bottom */}
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-sm font-black text-white font-mono leading-snug drop-shadow-md">
                    {promo.title}
                  </h3>
                </div>
              </div>

              {/* Promo Key Stats Grid */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#050811] border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-gray-400 block">MIN DEPO:</span>
                    <span className="text-emerald-400 font-black">{promo.minDepo}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#050811] border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-gray-400 block">SYARAT TO:</span>
                    <span className="text-yellow-400 font-black truncate block" title={promo.turnOver}>{promo.turnOver}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 font-mono leading-relaxed line-clamp-2">
                  {promo.deskripsi}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {promo.brand.map(b => (
                    <span key={b} className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => handleCopyScript(promo)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  copiedId === promo.id
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
                }`}
                title="Salin skrip template balasan CS"
              >
                {copiedId === promo.id ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === promo.id ? 'Tersalin CS!' : 'Salin Skrip CS'}</span>
              </button>

              <button
                onClick={() => setActiveModalPromo(promo)}
                className="py-2 px-3 rounded-xl bg-[#050811] hover:bg-[#141e30] text-gray-300 hover:text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPromos.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#0a0f18] border border-white/10 space-y-3 font-mono">
          <Gift className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">Tidak ada promo yang cocok dengan pencarian</h3>
          <p className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau ganti filter brand.</p>
        </div>
      )}

      {/* Modal Detail Promo */}
      {activeModalPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0f18] border-2 border-cyan-500/50 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${activeModalPromo.badgeColor}`}>
                  {activeModalPromo.badge}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  {activeModalPromo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalPromo(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#050811] border border-white/10">
                <span className="text-[10px] text-gray-400 block">MIN DEPO:</span>
                <span className="text-emerald-400 font-bold">{activeModalPromo.minDepo}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050811] border border-white/10">
                <span className="text-[10px] text-gray-400 block">MAKS BONUS:</span>
                <span className="text-cyan-300 font-bold">{activeModalPromo.maxBonus}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050811] border border-white/10">
                <span className="text-[10px] text-gray-400 block">TARGET GAME:</span>
                <span className="text-yellow-400 font-bold truncate block">{activeModalPromo.targetGame}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050811] border border-white/10">
                <span className="text-[10px] text-gray-400 block">SYARAT TO:</span>
                <span className="text-amber-300 font-bold truncate block">{activeModalPromo.turnOver}</span>
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Syarat &amp; Ketentuan Promo Resmi:
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300 bg-[#050811] p-3.5 rounded-2xl border border-white/10">
                {activeModalPromo.syaratKetentuan.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Template Balasan CS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Skrip CS Balasan Cepat (Fast Reply Livechat / WhatsApp):
                </h4>
                <button
                  onClick={() => handleCopyScript(activeModalPromo)}
                  className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === activeModalPromo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === activeModalPromo.id ? 'Tersalin!' : 'Salin Skrip'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#050811] border border-cyan-500/30 text-xs text-cyan-200 whitespace-pre-line leading-relaxed">
                {activeModalPromo.csScriptReply}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalPromo(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-black text-xs cursor-pointer hover:bg-cyan-400 transition-colors"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
