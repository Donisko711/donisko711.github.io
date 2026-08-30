import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  Zap,
  RotateCcw
} from 'lucide-react';

export interface PasaranTogelItem {
  id: string;
  name: string;
  tutup: string;
  buka: string;
  link: string;
  hari: string;
  isCustom?: boolean;
}

export const DEFAULT_PASARAN_TOGEL: PasaranTogelItem[] = [
  { id: 'pasaran-1', name: 'TOTO MACAU 00:00', tutup: '00:00', buka: '00:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-2', name: 'IOWA', tutup: '00:00', buka: '00:15', link: 'https://www.iowalotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-3', name: 'KENTUCKY MIDDAY', tutup: '00:05', buka: '00:20', link: 'https://www.kylottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-4', name: 'FLORIDA MIDDAY', tutup: '00:15', buka: '00:30', link: 'https://www.floridalottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-5', name: 'BURMA', tutup: '00:30', buka: '00:45', link: 'https://www.burmalotterytoday.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-6', name: 'ATHENA', tutup: '01:00', buka: '01:15', link: 'https://www.athena4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-7', name: 'NEW YORK MIDDAY', tutup: '01:10', buka: '01:25', link: 'https://nylottery.ny.gov', hari: 'SETIAP HARI' },
  { id: 'pasaran-8', name: 'ISTANBUL', tutup: '01:30', buka: '01:45', link: 'https://www.istanbullotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-9', name: 'CAROLINA DAY', tutup: '01:45', buka: '02:00', link: 'https://www.nclottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-10', name: 'BOMBAY', tutup: '02:00', buka: '02:20', link: 'https://www.bombay4d.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-11', name: 'KYOTO', tutup: '02:45', buka: '03:00', link: 'https://www.kyotolotterytoday.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-12', name: 'OREGON 03:00', tutup: '02:45', buka: '03:00', link: 'https://www.oregonlottery.org', hari: 'SETIAP HARI' },
  { id: 'pasaran-13', name: 'NEW DELHI', tutup: '03:15', buka: '03:30', link: 'https://www.newdelhi4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-14', name: 'COLOMBO', tutup: '03:45', buka: '04:00', link: 'https://www.colombolotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-15', name: 'VIENTIANE', tutup: '04:15', buka: '04:30', link: 'https://www.vientiane4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-16', name: 'YORDANIA', tutup: '04:45', buka: '05:00', link: 'https://www.yordania-lottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-17', name: 'BRUSSELS', tutup: '05:15', buka: '05:35', link: 'https://www.brusselslotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-18', name: 'OREGON 06:00', tutup: '05:45', buka: '06:00', link: 'https://www.oregonlottery.org', hari: 'SETIAP HARI' },
  { id: 'pasaran-19', name: 'CALIFORNIA', tutup: '08:15', buka: '08:30', link: 'https://www.calottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-20', name: 'FLORIDA EVENING', tutup: '08:30', buka: '08:45', link: 'https://www.floridalottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-21', name: 'OREGON 09:00', tutup: '08:45', buka: '09:00', link: 'https://www.oregonlottery.org', hari: 'SETIAP HARI' },
  { id: 'pasaran-22', name: 'NEW YORK EVENING', tutup: '09:20', buka: '09:35', link: 'https://nylottery.ny.gov', hari: 'SETIAP HARI' },
  { id: 'pasaran-23', name: 'KENTUCKY EVENING', tutup: '09:45', buka: '10:00', link: 'https://www.kylottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-24', name: 'CAROLINA EVENING', tutup: '10:07', buka: '10:22', link: 'https://www.nclottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-25', name: 'DELAWARE EVENING', tutup: '10:45', buka: '11:00', link: 'https://www.delawarelotto.net', hari: 'SETIAP HARI' },
  { id: 'pasaran-26', name: 'TOKYO', tutup: '11:10', buka: '11:25', link: 'https://www.tokyolotterytoday.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-27', name: 'PHNOMPENH LOTTO', tutup: '11:35', buka: '11:50', link: 'https://www.phnompenh-lotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-28', name: 'CHIANGMAI', tutup: '11:40', buka: '11:55', link: 'https://www.chiangmai4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-29', name: 'OREGON 12:00', tutup: '11:45', buka: '12:00', link: 'https://www.oregonlottery.org', hari: 'SETIAP HARI' },
  { id: 'pasaran-30', name: 'BULLSEYE', tutup: '13:00', buka: '13:15', link: 'https://www.mylotto.co.nz', hari: 'SETIAP HARI' },
  { id: 'pasaran-31', name: 'HOI AN', tutup: '12:10', buka: '12:30', link: 'https://www.hoianlottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-32', name: 'MADRID', tutup: '12:45', buka: '13:00', link: 'https://www.madridlotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-33', name: 'TOTO MACAU 13:00', tutup: '13:00', buka: '13:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-34', name: 'SENEGAL', tutup: '13:15', buka: '13:30', link: 'https://www.senegal4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-35', name: 'SYDNEY', tutup: '13:49', buka: '14:05', link: 'https://www.sydneylotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-36', name: 'PHUKET', tutup: '14:05', buka: '14:25', link: 'https://www.phuketpoolstoday.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-37', name: 'KUALA LUMPUR', tutup: '14:35', buka: '14:55', link: 'https://www.kl4djackpot.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-38', name: 'TOTO MACAU 5D 15.00', tutup: '15:15', buka: '15:25', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-39', name: 'BEIJING', tutup: '15:10', buka: '15:30', link: 'https://www.beijinglottery.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-40', name: 'TOTO MACAU 16:00', tutup: '16:00', buka: '16:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-41', name: 'GUANGZHOU', tutup: '16:30', buka: '16:45', link: 'https://www.guangzhoulottery.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-42', name: 'KINGKONG 4D SORE', tutup: '17:00', buka: '17:15', link: 'https://www.kingkongpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-43', name: 'NAGOYA', tutup: '17:00', buka: '17:20', link: 'https://www.nagoya6dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-44', name: 'SINGAPORE', tutup: '17:30', buka: '17:40', link: 'https://www.singaporepools.com.sg', hari: 'SELASA & JUMAT LIBUR' },
  { id: 'pasaran-45', name: 'LONDON', tutup: '17:55', buka: '18:10', link: 'https://www.londonlotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-46', name: 'MAGNUM4D', tutup: '18:10', buka: '18:40', link: 'https://www.magnum4d.my/', hari: 'SENIN,SELASA,KAMIS,JUMAT LIBUR' },
  { id: 'pasaran-47', name: 'HANOI', tutup: '18:15', buka: '18:30', link: 'https://www.hanoi6dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-48', name: 'BUSAN', tutup: '18:45', buka: '19:05', link: 'https://www.busan-lotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-49', name: 'TOTO MACAU 19:00', tutup: '19:00', buka: '19:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-50', name: 'DUBAI', tutup: '19:30', buka: '19:50', link: 'https://www.dubai4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-51', name: 'PCSO', tutup: '19:50', buka: '20:25', link: 'https://www.pcso.gov.ph', hari: 'MINGGU LIBUR' },
  { id: 'pasaran-52', name: 'DELAWARE DAY', tutup: '20:05', buka: '20:20', link: 'https://www.delawarelotto.net', hari: 'SETIAP HARI' },
  { id: 'pasaran-53', name: 'PYONGYANG', tutup: '20:15', buka: '20:30', link: 'https://www.pyongyanglotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-54', name: 'SHANGHAI', tutup: '20:35', buka: '20:50', link: 'https://www.shanghailotterytoday.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-55', name: 'TOTO MACAU 5D 21.00', tutup: '21:15', buka: '21:25', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-56', name: 'TAIPEI', tutup: '21:00', buka: '21:15', link: 'https://www.taipei4dpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-57', name: 'MANILA', tutup: '21:30', buka: '21:45', link: 'https://www.manilalotteries.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-58', name: 'TOTO MACAU 22:00', tutup: '22:00', buka: '22:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-59', name: 'PATTAYA', tutup: '22:10', buka: '22:25', link: 'https://www.pattaya-lotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-60', name: 'HONGKONG', tutup: '22:59', buka: '23:15', link: 'https://www.hongkonglotto.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-61', name: 'TOTO MACAU 23:00', tutup: '23:00', buka: '23:15', link: 'https://www.poolstotomacao.asia', hari: 'SETIAP HARI' },
  { id: 'pasaran-62', name: 'KINGKONG 4D MALAM', tutup: '23:30', buka: '23:45', link: 'https://www.kingkongpools.com', hari: 'SETIAP HARI' },
  { id: 'pasaran-63', name: 'SEOUL', tutup: '23:30', buka: '23:50', link: 'https://www.seoullottery.net', hari: 'SETIAP HARI' }
];

export const JadwalPasaranTogel: React.FC = () => {
  const [pasaranList, setPasaranList] = useState<PasaranTogelItem[]>(() => {
    try {
      const saved = localStorage.getItem('don_isko_jadwal_pasaran_togel');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_PASARAN_TOGEL;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPasaran, setNewPasaran] = useState({
    name: '',
    tutup: '',
    buka: '',
    link: '',
    hari: 'SETIAP HARI'
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('don_isko_jadwal_pasaran_togel', JSON.stringify(pasaranList));
    } catch {
      // ignore
    }
  }, [pasaranList]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleAddPasaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasaran.name.trim()) return;

    let linkFormatted = newPasaran.link.trim();
    if (linkFormatted && !linkFormatted.startsWith('http://') && !linkFormatted.startsWith('https://')) {
      linkFormatted = `https://${linkFormatted}`;
    }

    const item: PasaranTogelItem = {
      id: `pasaran-custom-${Date.now()}`,
      name: newPasaran.name.trim().toUpperCase(),
      tutup: newPasaran.tutup.trim() || '00:00',
      buka: newPasaran.buka.trim() || '00:15',
      link: linkFormatted || 'https://www.google.com',
      hari: newPasaran.hari.trim().toUpperCase() || 'SETIAP HARI',
      isCustom: true
    };

    setPasaranList([item, ...pasaranList]);
    setNewPasaran({ name: '', tutup: '', buka: '', link: '', hari: 'SETIAP HARI' });
    setIsAddModalOpen(false);
    showToast(`Pasaran ${item.name} berhasil ditambahkan!`);
  };

  const handleDeletePasaran = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pasaran "${name}"?`)) {
      setPasaranList(pasaranList.filter(p => p.id !== id));
      showToast(`Pasaran ${name} berhasil dihapus.`);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset daftar pasaran kembali ke jadwal default 63 pasaran resmi?')) {
      setPasaranList(DEFAULT_PASARAN_TOGEL);
      showToast('Daftar pasaran berhasil direset ke default.');
    }
  };

  const filteredPasaran = pasaranList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tutup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.buka.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hari.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Bar: Dominasi Hitam, Kuning Gold, & Putih */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121214]/95 border border-zinc-800 border-b-4 border-b-yellow-400 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-[10px] font-bold font-mono border border-yellow-400/40 shadow-sm">
                LIVE JADWAL RESMI POOLS
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Total {pasaranList.length} Pasaran Togel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-sans">
              JAM & JADWAL BUKAAN TOGEL
            </h1>
          </div>

          {/* Search Box & Add Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pasar..."
                className="w-full pl-5 pr-10 py-2.5 rounded-full bg-[#0A0A0C] text-white font-semibold text-sm outline-none border border-zinc-700 focus:border-yellow-400 placeholder:italic placeholder:text-zinc-500 shadow-inner focus:shadow-[0_0_15px_rgba(250,204,21,0.25)] transition-all"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              id="btn-tambah-pasaran"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Status & Reset Action */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-yellow-400 font-bold">Waktu Acuan: WIB (GMT+7)</span>
            <span>•</span>
            <span>Menampilkan: {filteredPasaran.length} dari {pasaranList.length} pasaran</span>
          </div>
          <button
            onClick={handleResetDefault}
            className="text-xs text-zinc-400 hover:text-yellow-400 underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-yellow-400" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Jadwal Pasaran Dominasi Hitam, Kuning Gold, & Putih */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
        {filteredPasaran.map((item, index) => {
          const isHoliday = item.hari.includes('LIBUR');
          return (
            <div
              key={item.id}
              className="relative rounded-2xl bg-[#121215] p-5 text-white border border-zinc-800 hover:border-yellow-400/80 shadow-xl hover:shadow-[0_8px_25px_rgba(250,204,21,0.15)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
            >
              {/* Badge Nomor Urut di Atas Tengah */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#09090B] border border-yellow-400 text-yellow-400 font-black text-xs font-mono shadow-[0_0_10px_rgba(250,204,21,0.3)] z-10 flex items-center gap-1">
                <span>{index + 1}</span>
              </div>

              {/* Action Delete Button jika pasaran custom/ingin dihapus */}
              <button
                onClick={() => handleDeletePasaran(item.id, item.name)}
                title="Hapus pasaran dari jadwal"
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/5 hover:bg-rose-600 hover:text-white text-zinc-500 transition-all cursor-pointer z-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2">
                {/* Nama Pasaran */}
                <h3 className="text-center font-black text-sm tracking-wider text-white group-hover:text-yellow-400 uppercase pb-2 transition-colors">
                  {item.name}
                </h3>

                {/* Garis Putus-Putus */}
                <div className="border-b border-dashed border-zinc-800 group-hover:border-yellow-400/40 my-1 w-full transition-colors"></div>

                {/* Baris Informasi Hari, Tutup, Buka */}
                <div className="space-y-2.5 py-3 px-1 text-xs font-bold font-sans">
                  {/* Hari */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Hari</span>
                    </div>
                    <span className={`text-right font-black ${isHoliday ? 'text-rose-400 underline' : 'text-zinc-200'}`}>
                      {item.hari}
                    </span>
                  </div>

                  {/* Tutup */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tutup</span>
                    </div>
                    <span className="text-rose-400 font-black text-sm font-mono">
                      {item.tutup} <span className="text-[10px] font-normal text-zinc-500">(WIB)</span>
                    </span>
                  </div>

                  {/* Buka */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Buka</span>
                    </div>
                    <span className="text-yellow-400 font-black text-sm font-mono drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]">
                      {item.buka} <span className="text-[10px] font-normal text-zinc-500">(WIB)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol KUNJUNGI WEBSITE */}
              <div className="pt-2">
                <a
                  href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C1C20] hover:bg-[#27272E] text-zinc-200 hover:text-white font-bold text-xs tracking-wider uppercase border border-zinc-700 hover:border-yellow-400 shadow-sm active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>KUNJUNGI WEBSITE</span>
                  <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPasaran.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#121215] border border-zinc-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Pasaran Togel Tidak Ditemukan</h3>
          <p className="text-xs text-zinc-400">
            Tidak ada pasaran yang cocok dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs shadow-md cursor-pointer"
          >
            Hapus Pencarian
          </button>
        </div>
      )}

      {/* Modal Tambah Pasaran Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#121215] border border-zinc-700 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Tambah Pasaran Togel Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPasaran} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">NAMA PASARAN TOGEL *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TOTO MACAU 00:00 / SINGAPORE"
                  value={newPasaran.name}
                  onChange={e => setNewPasaran({ ...newPasaran, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-white focus:border-yellow-400 outline-none uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">JAM TUTUP (WIB) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 17:30"
                    value={newPasaran.tutup}
                    onChange={e => setNewPasaran({ ...newPasaran, tutup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-rose-400 font-bold focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">JAM BUKA (WIB) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 17:40"
                    value={newPasaran.buka}
                    onChange={e => setNewPasaran({ ...newPasaran, buka: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-yellow-400 font-bold focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">HARI OPERASIONAL</label>
                <input
                  type="text"
                  placeholder="Contoh: SETIAP HARI / SELASA & JUMAT LIBUR"
                  value={newPasaran.hari}
                  onChange={e => setNewPasaran({ ...newPasaran, hari: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-white focus:border-yellow-400 outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">LINK WEBSITE RESMI POOLS</label>
                <input
                  type="text"
                  placeholder="Contoh: https://www.singaporepools.com.sg"
                  value={newPasaran.link}
                  onChange={e => setNewPasaran({ ...newPasaran, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold uppercase shadow-[0_0_15px_rgba(250,204,21,0.3)] cursor-pointer"
                >
                  Simpan Pasaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
