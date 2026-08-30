import { JobdeskTask, ScriptItem, TogelPasaran, DashboardModuleCard, LaporanGantiDataItem, LaporanLockItem, WdFlopItem, ModulItem } from '../types';

export const INITIAL_JOBDESK_CS: JobdeskTask[] = [
  // Shift Pagi CS
  {
    id: 'cs-p-1',
    title: 'Cek serah terima tugas & saldo awal kas dari Shift Malam',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 1,
    timeNote: '07:00 WIB',
    description: 'Pastikan memo operasional dibaca dan kendala member semalam ditindaklanjuti.'
  },
  {
    id: 'cs-p-2',
    title: 'Login semua akun LiveChat, Memo, WhatsApp & Telegram CS',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 2,
    timeNote: '07:15 WIB',
    description: 'Status akun aktif dan auto-response terpasang.'
  },
  {
    id: 'cs-p-3',
    title: 'Cek rekening aktif & status bank (BCA, BRI, Mandiri, BNI, Dana, QRIS)',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 3,
    timeNote: '07:30 WIB',
    description: 'Pastikan bank yang gangguan segera di-update di running text & memo.'
  },
  {
    id: 'cs-p-4',
    title: 'Follow-up tiket kendala deposit member & mutasi tertahan',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 4,
    timeNote: '09:00 WIB',
    description: 'Verifikasi mutasi pending dengan kasir atau mutasi bank.'
  },
  {
    id: 'cs-p-5',
    title: 'Broadcast promo harian & bagi bonus rollingan/cashback',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 5,
    timeNote: '11:00 WIB',
    description: 'Kirim broadcast event harian ke channel promo resmi.'
  },
  {
    id: 'cs-p-6',
    title: 'Rekap keluhan member & siapkan serah terima ke Shift Sore',
    category: 'CS',
    shift: 'PAGI',
    completed: false,
    order: 6,
    timeNote: '14:30 WIB',
    description: 'Tuliskan catatan khusus dan kendala unsolved pada grup serah terima.'
  },

  // Shift Sore CS
  {
    id: 'cs-s-1',
    title: 'Operasional oper shift sore: Cek keluhan pending & tiket belum selesai',
    category: 'CS',
    shift: 'SORE',
    completed: false,
    order: 1,
    timeNote: '15:00 WIB',
    description: 'Konfirmasi serah terima dari tim Shift Pagi.'
  },
  {
    id: 'cs-s-2',
    title: 'Pantau jam pasaran togel sore (Sydney & Singapore)',
    category: 'CS',
    shift: 'SORE',
    completed: false,
    order: 2,
    timeNote: '15:30 WIB',
    description: 'Cek jam tutup pasaran dan standby pertanyaan nomor result member.'
  },
  {
    id: 'cs-s-3',
    title: 'Pelayanan cepat LiveChat & validasi pendaftaran member baru',
    category: 'CS',
    shift: 'SORE',
    completed: false,
    order: 3,
    timeNote: '17:00 WIB',
    description: 'Pastikan respon di bawah 30 detik pada jam ramai.'
  },
  {
    id: 'cs-s-4',
    title: 'Pengecekan bonus turnover slot & klaim scatter member',
    category: 'CS',
    shift: 'SORE',
    completed: false,
    order: 4,
    timeNote: '19:30 WIB',
    description: 'Cek keabsahan screenshot klaim scatter di grup klaim.'
  },
  {
    id: 'cs-s-5',
    title: 'Rekap ganti data member & persiapan serah terima ke Shift Malam',
    category: 'CS',
    shift: 'SORE',
    completed: false,
    order: 5,
    timeNote: '22:30 WIB',
    description: 'Pastikan data ganti rekening sudah tervalidasi lengkap.'
  },

  // Shift Malam CS
  {
    id: 'cs-m-1',
    title: 'Terima serah terima Shift Malam & cek antrian LiveChat',
    category: 'CS',
    shift: 'MALAM',
    completed: false,
    order: 1,
    timeNote: '23:00 WIB',
    description: 'Pastikan respon tetap sigap di jam malam/dini hari.'
  },
  {
    id: 'cs-m-2',
    title: 'Pantau pasaran Togel Hongkong (Result 23:00 WIB)',
    category: 'CS',
    shift: 'MALAM',
    completed: false,
    order: 2,
    timeNote: '23:15 WIB',
    description: 'Update result HK dan atasi pertanyaan klaim kemenangan member.'
  },
  {
    id: 'cs-m-3',
    title: 'Monitor jadwal maintenance bank offline (BCA, Mandiri, BRI offline rutin)',
    category: 'CS',
    shift: 'MALAM',
    completed: false,
    order: 3,
    timeNote: '01:00 WIB',
    description: 'Arahkan member memakai e-wallet atau QRIS saat bank offline.'
  },
  {
    id: 'cs-m-4',
    title: 'Cek akun spam / indikasi bot pendaftaran mencurigakan',
    category: 'CS',
    shift: 'MALAM',
    completed: false,
    order: 4,
    timeNote: '03:00 WIB',
    description: 'Laporkan IP mencurigakan untuk dikunci sementara.'
  },
  {
    id: 'cs-m-5',
    title: 'Pembersihan memo dan penyusunan log harian untuk Shift Pagi',
    category: 'CS',
    shift: 'MALAM',
    completed: false,
    order: 5,
    timeNote: '06:30 WIB',
    description: 'Rangkum total interaksi, keluhan terselesaikan, dan catatan pending.'
  }
];

export const INITIAL_JOBDESK_KASIR: JobdeskTask[] = [
  // Shift Pagi Kasir
  {
    id: 'ks-p-1',
    title: 'Cek saldo awal seluruh rekening bank penampung & withdraw',
    category: 'KASIR',
    shift: 'PAGI',
    completed: false,
    order: 1,
    timeNote: '07:00 WIB',
    description: 'Catat saldo awal per bank di buku rekapan mutasi.'
  },
  {
    id: 'ks-p-2',
    title: 'Proses antrian Deposit & Withdraw pagi (SLA maks 2 menit)',
    category: 'KASIR',
    shift: 'PAGI',
    completed: false,
    order: 2,
    timeNote: '07:30 WIB',
    description: 'Cocokkan nominal transfer dengan form depo member.'
  },
  {
    id: 'ks-p-3',
    title: 'Jalankan Auto WD FLOP untuk penarikan batch besar',
    category: 'KASIR',
    shift: 'PAGI',
    completed: false,
    order: 3,
    timeNote: '10:00 WIB',
    description: 'Gunakan parsing 4 kolom untuk mempercepat transfer.'
  },
  {
    id: 'ks-p-4',
    title: 'Cek mutasi selisih dana unconfirmed / dana nyasar',
    category: 'KASIR',
    shift: 'PAGI',
    completed: false,
    order: 4,
    timeNote: '12:00 WIB',
    description: 'Cocokkan mutasi rekening bank dengan saldo sistem kasir.'
  },
  {
    id: 'ks-p-5',
    title: 'Rekap Total DP, WD, Selisih & saldo akhir Shift Pagi',
    category: 'KASIR',
    shift: 'PAGI',
    completed: false,
    order: 5,
    timeNote: '14:45 WIB',
    description: 'Serah terima saldo riil ke kasir Shift Sore.'
  },

  // Shift Sore Kasir
  {
    id: 'ks-s-1',
    title: 'Validasi serah terima saldo rekening dari Kasir Shift Pagi',
    category: 'KASIR',
    shift: 'SORE',
    completed: false,
    order: 1,
    timeNote: '15:00 WIB',
    description: 'Pastikan fisik token/internet banking siap beroperasi.'
  },
  {
    id: 'ks-s-2',
    title: 'Standby lonjakan DP & WD pasaran Singapore / Sydney result',
    category: 'KASIR',
    shift: 'SORE',
    completed: false,
    order: 2,
    timeNote: '17:45 WIB',
    description: 'Percepat validasi WD member yang menang togel.'
  },
  {
    id: 'ks-s-3',
    title: 'Pengecekan limit harian mutasi per rekening bank',
    category: 'KASIR',
    shift: 'SORE',
    completed: false,
    order: 3,
    timeNote: '20:00 WIB',
    description: 'Rotasi nomor rekening aktif jika limit transfer hampir penuh.'
  },
  {
    id: 'ks-s-4',
    title: 'Rekapitulasi keuangan Shift Sore & persiapan handoff Shift Malam',
    category: 'KASIR',
    shift: 'SORE',
    completed: false,
    order: 4,
    timeNote: '22:45 WIB',
    description: 'Tutup buku shift sore dan serahkan ke kasir malam.'
  },

  // Shift Malam Kasir
  {
    id: 'ks-m-1',
    title: 'Terima handoff kas malam, periksa ketersediaan saldo rekening WD',
    category: 'KASIR',
    shift: 'MALAM',
    completed: false,
    order: 1,
    timeNote: '23:00 WIB',
    description: 'Pastikan rekening WD memiliki dana cukup untuk kemenangan bola/togel.'
  },
  {
    id: 'ks-m-2',
    title: 'Proses lonjakan WD pasaran Togel Hongkong (23:00 - 01:00)',
    category: 'KASIR',
    shift: 'MALAM',
    completed: false,
    order: 2,
    timeNote: '23:30 WIB',
    description: 'Cek turnover dan pola bet sebelum proses nominal besar.'
  },
  {
    id: 'ks-m-3',
    title: 'Handle transaksi saat bank offline dengan sistem pending verifikasi',
    category: 'KASIR',
    shift: 'MALAM',
    completed: false,
    order: 3,
    timeNote: '02:00 WIB',
    description: 'Simpan bukti struk transfer member untuk dicek saat bank kembali online.'
  },
  {
    id: 'ks-m-4',
    title: 'Tutup Buku Harian (EOD / End of Day Reconciliation)',
    category: 'KASIR',
    shift: 'MALAM',
    completed: false,
    order: 4,
    timeNote: '06:00 WIB',
    description: 'Hitung total Gross Deposit, Total Withdrawal, Net Revenue harian.'
  }
];

export const INITIAL_SC_MEMO: ScriptItem[] = [
  {
    id: 'memo-1',
    title: 'Bank Sedang Offline / Gangguan Rutin',
    category: 'Kendala Bank',
    type: 'MEMO',
    content: 'Halo Kak [USERNAME], mohon maaf atas ketidaknyamanannya. Saat ini bank [NAMA_BANK] sedang mengalami jam offline/gangguan dari pusat perbankan. Form transaksi Kakak akan kami tahan sementara dan langsung diproses otomatis begitu jaringan bank normal kembali. Terima kasih atas kesabarannya.',
    tags: ['Bank', 'Offline', 'Gangguan'],
    createdAt: '2026-08-20'
  },
  {
    id: 'memo-2',
    title: 'Konfirmasi Dana Deposit Belum Masuk Mutasi',
    category: 'Deposit',
    type: 'MEMO',
    content: 'Halo Kak [USERNAME], setelah dilakukan pengecekan mendalam, dana Kakak dengan nominal Rp [NOMINAL] belum terbaca di mutasi rekening kami. Mohon bantu kirimkan foto struk transfer yang jelas atau screenshot mutasi rekening pengirim agar tim kasir dapat melakukan validasi manual ke pihak bank.',
    tags: ['Deposit', 'Mutasi', 'Struk'],
    createdAt: '2026-08-21'
  },
  {
    id: 'memo-3',
    title: 'Akun Terkunci / Reset Password',
    category: 'Akun & Keamanan',
    type: 'MEMO',
    content: 'Halo Kak [USERNAME], untuk keamanan akun Kakak yang terkunci karena salah kata sandi, mohon konfirmasikan: 1) Nama lengkap pemilik rekening, 2) Nomor rekening terdaftar, 3) 4 digit terakhir nomor HP terdaftar. Setelah validasi cocok, password baru sementara akan kami kirimkan.',
    tags: ['Akun', 'Password', 'Reset'],
    createdAt: '2026-08-22'
  },
  {
    id: 'memo-4',
    title: 'Syarat Ganti Data Rekening',
    category: 'Ganti Data',
    type: 'MEMO',
    content: 'Halo Kak [USERNAME], untuk pergantian nomor rekening terdaftar, demi keamanan saldo Kakak mohon lampirkan: 1. Foto buku tabungan lama / tangkapan layar m-banking lama, 2. Foto buku tabungan baru / m-banking baru, 3. Deposit minimal 1x dengan nominal unik dari rekening baru sebagai validasi.',
    tags: ['Ganti Rekening', 'Validasi'],
    createdAt: '2026-08-23'
  },
  {
    id: 'memo-5',
    title: 'Pemberitahuan Klaim Bonus Scatter & TO',
    category: 'Bonus',
    type: 'MEMO',
    content: 'Selamat Kak [USERNAME]! Klaim bonus [NAMA_EVENT] Kakak sebesar Rp [NOMINAL_BONUS] telah berhasil diproses dan langsung masuk ke saldo utama Kakak. Silakan di-refresh akunnya dan selamat bermain kembali, semoga jackpot selalu!',
    tags: ['Bonus', 'Scatter', 'Slot'],
    createdAt: '2026-08-24'
  }
];

export const INITIAL_SC_LC: ScriptItem[] = [
  {
    id: 'lc-1',
    title: 'Salam Pembuka Ramah & Standar CS',
    category: 'Greetings',
    type: 'LC',
    content: 'Halo, selamat datang di Layanan Bantuan Resmi 24 Jam! Saya dengan CS [NAMA_CS] siap melayani Kakak dengan sepenuh hati. Ada yang bisa saya bantu hari ini, Kak?',
    tags: ['Pembuka', 'Welcome'],
    createdAt: '2026-08-20'
  },
  {
    id: 'lc-2',
    title: 'Respon Cepat Mohon Tunggu Pengecekan',
    category: 'Pengecekan',
    type: 'LC',
    content: 'Baik Kak [USERNAME], mohon ditunggu sebentar ya Kak, saat ini data/transaksi Kakak sedang dalam proses pengecekan oleh tim kasir kami. Estimasi 1-3 menit, mohon jangan tutup ruang obrolan ini.',
    tags: ['Tunggu', 'Proses'],
    createdAt: '2026-08-21'
  },
  {
    id: 'lc-3',
    title: 'Deposit / Withdraw Telah Selesai',
    category: 'Transaksi Sukses',
    type: 'LC',
    content: 'Kabar gembira Kak! Transaksi [DEPOSIT/WITHDRAW] Kakak sebesar Rp [NOMINAL] sudah berhasil diproses. Silakan dicek kembali akun/rekening Kakak. Terima kasih telah bermain bersama kami dan semoga selalu beruntung!',
    tags: ['Sukses', 'Selesai'],
    createdAt: '2026-08-22'
  },
  {
    id: 'lc-4',
    title: 'Permintaan Bukti Transfer Mutasi Jelas',
    category: 'Validasi',
    type: 'LC',
    content: 'Boleh dibantu kirimkan foto bukti transfernya yang menampilkan jam transaksi, nomor referensi, dan rekening tujuan yang jelas ya Kak? Agar bisa langsung kami bantu dorong ke bagian keuangan.',
    tags: ['Bukti', 'Transfer'],
    createdAt: '2026-08-23'
  },
  {
    id: 'lc-5',
    title: 'Salam Penutup Sopan & Doa Hoki',
    category: 'Closing',
    type: 'LC',
    content: 'Sama-sama Kak. Jika sudah tidak ada pertanyaan lain, saya izin undur diri ya Kak. Terima kasih banyak telah menghubungi kami, semoga hari Kakak menyenangkan dan selalu meraih jackpot maksimal! Salam hoki selalu ✨',
    tags: ['Penutup', 'Closing'],
    createdAt: '2026-08-24'
  }
];

export const INITIAL_TOGEL_PASARAN: TogelPasaran[] = [
  {
    id: 'sdy',
    name: 'Sydney (SDY)',
    code: 'SDY',
    country: 'Australia',
    closeTime: '13:00',
    resultTime: '13:50',
    days: ['Setiap Hari'],
    lastResult: '7419',
    website: 'sydneypoolstoday.com'
  },
  {
    id: 'sgp',
    name: 'Singapore (SGP)',
    code: 'SGP',
    country: 'Singapura',
    closeTime: '17:30',
    resultTime: '17:45',
    days: ['Senin', 'Rabu', 'Kamis', 'Sabtu', 'Minggu'],
    lastResult: '5820',
    website: 'singaporepools.com.sg'
  },
  {
    id: 'hk',
    name: 'Hongkong (HK)',
    code: 'HK',
    country: 'Hong Kong',
    closeTime: '22:45',
    resultTime: '23:00',
    days: ['Setiap Hari'],
    lastResult: '9304',
    website: 'hongkongpools.com'
  },
  {
    id: 'cam',
    name: 'Cambodia (CAM)',
    code: 'CAM',
    country: 'Kamboja',
    closeTime: '11:35',
    resultTime: '11:50',
    days: ['Setiap Hari'],
    lastResult: '1183',
    website: 'magnumcambodia.com'
  },
  {
    id: 'china',
    name: 'China Pools',
    code: 'CHN',
    country: 'China',
    closeTime: '15:15',
    resultTime: '15:30',
    days: ['Setiap Hari'],
    lastResult: '6291',
    website: 'chinapools.asia'
  },
  {
    id: 'mc',
    name: 'Toto Macau 4D (Putaran 1)',
    code: 'TM-13',
    country: 'Macau',
    closeTime: '13:00',
    resultTime: '13:15',
    days: ['Setiap Hari'],
    lastResult: '4902',
    website: 'totomacaupools.asia'
  },
  {
    id: 'mc2',
    name: 'Toto Macau 4D (Putaran 2)',
    code: 'TM-16',
    country: 'Macau',
    closeTime: '16:00',
    resultTime: '16:15',
    days: ['Setiap Hari'],
    lastResult: '8371',
    website: 'totomacaupools.asia'
  },
  {
    id: 'mc3',
    name: 'Toto Macau 4D (Putaran 3)',
    code: 'TM-19',
    country: 'Macau',
    closeTime: '19:00',
    resultTime: '19:15',
    days: ['Setiap Hari'],
    lastResult: '0284',
    website: 'totomacaupools.asia'
  },
  {
    id: 'mc4',
    name: 'Toto Macau 4D (Putaran 4)',
    code: 'TM-22',
    country: 'Macau',
    closeTime: '22:00',
    resultTime: '22:15',
    days: ['Setiap Hari'],
    lastResult: '6159',
    website: 'totomacaupools.asia'
  },
  {
    id: 'mc5',
    name: 'Toto Macau 4D (Putaran 5)',
    code: 'TM-24',
    country: 'Macau',
    closeTime: '23:55',
    resultTime: '00:15',
    days: ['Setiap Hari'],
    lastResult: '3817',
    website: 'totomacaupools.asia'
  }
];

export const DASHBOARD_MODULE_CARDS: DashboardModuleCard[] = [
  // AI Intelligence & Smart Tools
  {
    id: 'mod-ai',
    title: 'AI INTELEGENCY',
    category: 'SISTEM',
    categoryLabel: 'AI ASSISTANT',
    description: 'Asisten AI Don Isko untuk CS & Kasir: Tanya SOP, template respon LiveChat, analisa fraud & dispute, serta hitung TO otomatis.',
    badge: 'BARU',
    icon: 'Sparkles',
    actionMenuId: 'ai-intelegency'
  },
  // Kasir & Rekap Transaksi
  {
    id: 'mod-1',
    title: 'HITUNG TOP-UP FLOP',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Input data CSV transaksi top-up deposit, kalkulasi total volume, hitung per bank, & kalkulator kustom.',
    badge: 'BARU',
    icon: 'ArrowDownToLine',
    actionMenuId: 'wd-auto-flop'
  },
  {
    id: 'mod-2',
    title: 'HITUNG WD FLOP',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Input data CSV penarikan withdraw flop, hitung total volume, status approved/reject, & filter nominal.',
    badge: 'BARU',
    icon: 'ArrowUpFromLine',
    actionMenuId: 'wd-auto-flop'
  },
  {
    id: 'mod-3',
    title: 'AUTO WD FLOP',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Tool auto-parsing 4 kolom format withdraw untuk kemudahan proses auto wd kasir transfer cepat.',
    badge: 'UTAMA',
    icon: 'Bot',
    actionMenuId: 'wd-auto-flop'
  },
  {
    id: 'mod-4',
    title: 'DEPOSIT MANUAL',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Tool parsing 3 kolom data deposit (User ID, Rekening, Nominal) rapi siap paste ke Excel & Bank.',
    badge: 'UTAMA',
    icon: 'FileSpreadsheet',
    actionMenuId: 'edit-pembayaran'
  },
  {
    id: 'mod-5',
    title: 'SALDO WITHDRAW',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Format otomatis dari tabel mutasi ke tampilan menyamping dengan tombol copas instan.',
    badge: 'BARU',
    icon: 'WalletCards',
    actionMenuId: 'info-wd'
  },
  {
    id: 'mod-6',
    title: 'FORM DEPO / WD',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Input formulir transaksi deposit & withdraw member secara cepat, akurat, dan otomatis tersimpan.',
    badge: 'POPULER',
    icon: 'Repeat',
    actionMenuId: 'edit-pembayaran'
  },
  {
    id: 'mod-7',
    title: 'VALIDASI HARIAN & P/L',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Rekapitulasi keuangan shift harian, profit & loss, & laporan pendaftaran member baru per perbankan.',
    badge: 'UTAMA',
    icon: 'LineChart',
    actionMenuId: 'info-data-pl'
  },
  {
    id: 'mod-8',
    title: 'REKAPAN TO & BONUS',
    category: 'KASIR',
    categoryLabel: 'KASIR & REKAP',
    description: 'Pengecekan dan analisis turnover player aktif serta deteksi klaim bonus dan manipulasi rebate.',
    badge: 'BARU',
    icon: 'Award',
    actionMenuId: 'bagi-bonus-slot'
  },

  // Customer Service & Operasional
  {
    id: 'mod-9',
    title: 'JOBDESK CS SHIFT',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Checklist operasional interaktif Shift Pagi, Sore, dan Malam CS dengan fitur urutkan & tambah task.',
    badge: 'UTAMA',
    icon: 'CheckSquare',
    actionMenuId: 'jobdesk-cs'
  },
  {
    id: 'mod-10',
    title: 'NAWALA CHECKER',
    category: 'SISTEM',
    categoryLabel: 'UTILITAS & SISTEM',
    description: 'Cek status blokir domain Internet Positif / Nawala, response time, dan DNS IP lookup terpadu.',
    badge: 'UTAMA',
    icon: 'ShieldAlert',
    actionMenuId: 'nawala-checker'
  },
  {
    id: 'mod-11',
    title: 'GENERATE ARTIKEL',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Pembuat artikel promosi, SEO gaming, slot, dan togel instan dengan fitur keyword spinner.',
    badge: 'POPULER',
    icon: 'FileText',
    actionMenuId: 'generate-artikel'
  },
  {
    id: 'mod-12',
    title: 'KALKULATOR PARLAY',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Kalkulator hitung mix parlay akurat mendukung win half, lose half, draw, reject, dan multi tim.',
    badge: 'UTAMA',
    icon: 'Calculator',
    actionMenuId: 'kalkulator-parlay'
  },
  {
    id: 'mod-13',
    title: 'BBFS & ANGKA TARUNG',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Generator kombinasi BBFS 4D, 3D, 2D bolak-balik & generator angka tarung As Kop Kepala Ekor.',
    badge: 'POPULER',
    icon: 'Dices',
    actionMenuId: 'bbfs-angka-tarung'
  },
  {
    id: 'mod-14',
    title: 'BAGI BONUS PARLAY & SLOT',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Hitung bonus scatter slot, rollingan turnover mingguan, dan tier cashback parlay cepat.',
    badge: 'BARU',
    icon: 'Gift',
    actionMenuId: 'bagi-bonus-parlay'
  },
  {
    id: 'mod-15',
    title: 'LAPORAN CS GANTI DATA',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Pencatatan dan arsip pengajuan ganti nomor rekening, nama, atau no HP member secara transparan.',
    badge: 'UTAMA',
    icon: 'UserCheck',
    actionMenuId: 'laporan-cs-ganti-data'
  },
  {
    id: 'mod-16',
    title: 'CS LOCKED / UNLOCKED',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Log manajemen pembukaan / penguncian akun bermasalah demi keamanan player dan website.',
    badge: 'BARU',
    icon: 'Lock',
    actionMenuId: 'laporan-cs-locked'
  },
  {
    id: 'mod-17',
    title: 'SC MEMO (SCRIPT CHAT)',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Koleksi template chat internal memo, penanganan kendala bank & jawaban standar 1-klik copy.',
    badge: 'UTAMA',
    icon: 'MessageSquareText',
    actionMenuId: 'sc-memo'
  },
  {
    id: 'mod-18',
    title: 'SC LIVECHAT (TEMPLATES)',
    category: 'CS',
    categoryLabel: 'CUSTOMER SERVICE',
    description: 'Kumpulan respon ramah LiveChat 24/7, salam pembuka, SOP verifikasi, dan salam penutup.',
    badge: 'UTAMA',
    icon: 'Headphones',
    actionMenuId: 'sc-lc'
  },

  // Modul Belajar & Produk
  {
    id: 'mod-19',
    title: 'PANDUAN SPORTBOOKS',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Modul belajar aturan taruhan bola: Asian Handicap, Over/Under, 1X2, Mix Parlay, dan Odds format.',
    badge: 'POPULER',
    icon: 'Trophy',
    actionMenuId: 'modul-sportbooks'
  },
  {
    id: 'mod-20',
    title: 'TOGEL ONLINE LENGKAP',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Panduan bermain 4D/3D/2D, Colok Bebas, tabel hadiah, diskon resmi & jadwal pasaran realtime.',
    badge: 'UTAMA',
    icon: 'Sparkles',
    actionMenuId: 'modul-togel-cara'
  },
  {
    id: 'mod-21',
    title: 'SLOT ONLINE & RTP',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Edukasi istilah slot, Return to Player (RTP), volatilitas tinggi/rendah, dan mekanisme scatter.',
    badge: 'BARU',
    icon: 'Gamepad2',
    actionMenuId: 'modul-slot'
  },
  {
    id: 'mod-22',
    title: 'LIVEGAME CASINO',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'SOP & panduan permainan Baccarat, Roulette 36 angka, Sicbo dadu kopyok, dan Dragon Tiger.',
    badge: 'BARU',
    icon: 'Flame',
    actionMenuId: 'modul-casino'
  },
  {
    id: 'mod-23',
    title: 'CARA CARI SELISIH BANK',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Tutorial langkah demi langkah menemukan selisih mutasi bank vs pencatatan deposit kasir.',
    badge: 'UTAMA',
    icon: 'SearchCheck',
    actionMenuId: 'modul-cari-selisih'
  },
  {
    id: 'mod-24',
    title: 'CARA GANTI DOCS & REK',
    category: 'PRODUK',
    categoryLabel: 'INFO PRODUK & GAMES',
    description: 'Standar Operasional Prosedur (SOP) verifikasi ketat pergantian data pribadi akun member.',
    badge: 'UTAMA',
    icon: 'FileBadge',
    actionMenuId: 'modul-ganti-docs'
  }
];

export const INITIAL_LAPORAN_GANTI_DATA: LaporanGantiDataItem[] = [
  {
    id: 'gd-1',
    username: 'sultan889',
    dataType: 'NO_REK',
    oldData: 'BCA - 0128392182 (AHMAD)',
    newData: 'BCA - 0129994821 (AHMAD FAUZI)',
    reason: 'Salah ketik 2 digit nomor rekening saat registrasi pertama kali',
    operator: 'CS-DEWI (Shift Pagi)',
    status: 'APPROVED',
    timestamp: '2026-08-29 09:15:20',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'gd-2',
    username: 'jackpot_hunter',
    dataType: 'BANK',
    oldData: 'MANDIRI - 132001928311',
    newData: 'DANA - 081299882211',
    reason: 'Rekening Mandiri terblokir, ingin pindah ke akun DANA pribadi yang sama nama',
    operator: 'CS-BAYU (Shift Sore)',
    status: 'APPROVED',
    timestamp: '2026-08-29 16:40:11'
  },
  {
    id: 'gd-3',
    username: 'hoki_selalu99',
    dataType: 'NO_HP',
    oldData: '081234567890',
    newData: '082199887766',
    reason: 'Nomor HP hilang ingin update no WhatsApp aktif untuk verifikasi OTP',
    operator: 'CS-REZA (Shift Malam)',
    status: 'PENDING',
    timestamp: '2026-08-30 01:22:45'
  }
];

export const INITIAL_LAPORAN_LOCK: LaporanLockItem[] = [
  {
    id: 'lock-1',
    username: 'bot_spammer12',
    action: 'LOCK',
    reason: 'Percobaan login berulang 15 kali dengan IP luar negeri yang sama (Indikasi Brute Force)',
    ipAddress: '185.220.101.5',
    operator: 'CS-REZA (Shift Malam)',
    timestamp: '2026-08-30 02:10:00',
    status: 'SUCCESS'
  },
  {
    id: 'lock-2',
    username: 'member_ setia77',
    action: 'UNLOCK',
    reason: 'Member lupa password lama, sudah diverifikasi foto KTP & mutasi depo terakhir',
    ipAddress: '114.122.45.10',
    operator: 'CS-DEWI (Shift Pagi)',
    timestamp: '2026-08-29 11:05:30',
    status: 'SUCCESS'
  }
];

export const INITIAL_WD_ITEMS: WdFlopItem[] = [
  {
    id: 'wd-001',
    username: 'bocah_petir99',
    bankName: 'BCA',
    accountNumber: '8830192831',
    accountName: 'RUDI HERMAWAN',
    amount: 1500000,
    flopCode: 'FLP-BCA-88301',
    status: 'PROCESSED',
    time: '02:15 WIB'
  },
  {
    id: 'wd-002',
    username: 'mahjong_king',
    bankName: 'MANDIRI',
    accountNumber: '1370019284123',
    accountName: 'HENDRA WIJAYA',
    amount: 3250000,
    flopCode: 'FLP-MDR-13700',
    status: 'PROCESSED',
    time: '02:18 WIB'
  },
  {
    id: 'wd-003',
    username: 'zeus_gacor77',
    bankName: 'BRI',
    accountNumber: '021901029381504',
    accountName: 'SITI NURHALIZA',
    amount: 750000,
    flopCode: 'FLP-BRI-02190',
    status: 'PENDING',
    time: '02:29 WIB'
  },
  {
    id: 'wd-004',
    username: 'parlay_master',
    bankName: 'BNI',
    accountNumber: '0819283194',
    accountName: 'AGUS SANTOSO',
    amount: 5400000,
    flopCode: 'FLP-BNI-08192',
    status: 'PENDING',
    time: '02:31 WIB'
  },
  {
    id: 'wd-005',
    username: 'naga_mas88',
    bankName: 'DANA',
    accountNumber: '081399882211',
    accountName: 'DENI KURNIAWAN',
    amount: 450000,
    flopCode: 'FLP-DNA-08139',
    status: 'PROCESSED',
    time: '02:33 WIB'
  }
];

export const INITIAL_MODUL_BELAJAR: ModulItem[] = [
  {
    id: 'sop-cs-1',
    title: 'SOP Pelayanan LiveChat & Etika Komunikasi',
    category: 'CUSTOMER CARE',
    readTime: '5 Menit',
    description: 'Panduan standar tata bahasa, greeting ramah, penanganan keluhan, dan SLA kecepatan respon.',
    content: `1. STANDAR KECEPATAN RESPON (SLA):
- Respon sapaan pertama wajib di bawah 15 detik.
- Waktu tunggu pengecekan maksimal 2 menit, wajib informasikan member jika butuh waktu lebih lama.

2. TATA BAHASA & ETIKA:
- Gunakan panggilan ramah seperti "Kak [Username]" atau "Bosku".
- Dilarang keras menggunakan kata-kata kasar, emosional, atau meremehkan member.
- Selalu doakan keberuntungan di akhir percakapan.`
  },
  {
    id: 'sop-kasir-1',
    title: 'SOP Kasir: Verifikasi Deposit & Mutasi Bank',
    category: 'KASIR & FINANSIAL',
    readTime: '7 Menit',
    description: 'Prosedur pencocokan mutasi bank, penanganan dana pending, jam offline, dan pencegahan fraud.',
    content: `1. VALIDASI TRANSAKSI DEPOSIT:
- Pastikan nominal form deposit SAMA PERSIS dengan saldo mutasi bank.
- Periksa kesesuaian Nama & Rekening Pengirim di sistem dengan buku tabungan akun member.
- Jangan pernah proses form deposit jika mutasi dana belum masuk ke rekening penampung.

2. PENANGANAN JAM BANK OFFLINE:
- Simpan struk validasi transfer dan berikan status PENDING di sistem.
- Begitu mutasi bank online kembali, lakukan audit mutasi lalu setujui form deposit secara berurutan (FIFO).`
  },
  {
    id: 'sop-keamanan-1',
    title: 'SOP Keamanan: Validasi Ganti Rekening & Anti-Brute Force',
    category: 'SECURITY & RISK',
    readTime: '6 Menit',
    description: 'Instruksi verifikasi ketat pergantian data pribadi, penanganan akun terkunci, dan proteksi saldo member.',
    content: `1. SYARAT GANTI DATA REKENING:
- Member wajib melampirkan foto buku tabungan/screenshot m-banking rekening lama dan rekening baru.
- Lakukan verifikasi riwayat deposit dan withdraw terakhir.
- Wajib melakukan deposit verifikasi 1x dengan nominal unik dari rekening baru sebelum diubah secara resmi di sistem.

2. TINDAKAN PENGUNCIAN AKUN (LOCK):
- Kunci akun segera jika terdeteksi percobaan login salah password lebih dari 10 kali dari IP luar negeri.
- Laporkan ke Supervisor CS untuk investigasi lebih lanjut.`
  },
  {
    id: 'sop-games-1',
    title: 'Panduan Aturan Sportbooks & Mix Parlay',
    category: 'Sportbooks',
    readTime: '8 Menit',
    description: 'Penjelasan perhitungan Odds desimal/Indonesia, aturan Win Half, Lose Half, Draw, dan pembatalan pertandingan.',
    content: `1. FORMULA PERHITUNGAN MIX PARLAY:
- Menang Penuh (Win): Perkalian Odds normal (Odds 1 x Odds 2 x Odds 3 ... x Modal).
- Menang Setengah (Win Half): ((Odds - 1) / 2) + 1
- Seri / Batal (Draw/Cancel): Odds dihitung 1.0 (tidak mengurangi kemenangan tim lain).
- Kalah Setengah (Lose Half): Nilai perkalian tiket dibagi 2 (Odds x 0.5).
- Kalah Penuh (Lose): Seluruh tiket dinyatakan kalah (Turnover tetap dihitung).

2. ATURAN PASARAN UTAMA:
- HDP (Handicap): Voor bola berdasarkan selisih gol di waktu normal 2x45 menit.
- Over/Under (O/U): Total akumulasi gol kedua tim.
- 1X2: Tebak 1 (Home Menang), X (Seri), atau 2 (Away Menang).
- Odd/Even (Ganjil/Genap): Total jumlah gol bernilai ganjil atau genap.`
  },
  {
    id: 'sop-togel-1',
    title: 'Cara Bermain & Pasang Togel Online',
    category: 'Togel Online',
    readTime: '6 Menit',
    description: 'Panduan lengkap jenis taruhan 4D/3D/2D, Bolak Balik (BB), Colok Bebas, Colok Jitu, Macau, dan Shio.',
    content: `1. CARA PASANG 4D / 3D / 2D:
- 4D (4 Digit): Pasang 4 angka tepat sesuai result 1st Prize.
- 3D (3 Digit): Pasang 3 angka terakhir (Contoh result 4321, 3D adalah 321).
- 2D (2 Digit): Pasang 2 angka belakang (21), 2 angka depan (43), atau 2 angka tengah (32).

2. JENIS PERMAINAN COLOK:
- Colok Bebas: Menebak 1 angka yang muncul di posisi mana saja pada 4 digit result.
- Colok Macau / 2D: Menebak 2 angka yang muncul di posisi bebas.
- Colok Naga / 3D: Menebak 3 angka yang muncul di posisi bebas.
- Colok Jitu: Menebak 1 angka pada posisi tepat (As, Kop, Kepala, atau Ekor).

3. TARUHAN SHIO & KOMBINASI:
- Shio disesuaikan dengan kalender tahun berjalan (12 Zodiak hewan).
- Besar/Kecil: 00-49 (Kecil), 50-99 (Besar).
- Ganjil/Genap: Berdasarkan 2D belakang result.`
  },
  {
    id: 'sop-togel-2',
    title: 'Daftar Hadiah & Diskon Togel Online',
    category: 'Togel Online',
    readTime: '5 Menit',
    description: 'Rincian pembayaran hadiah Bet Full, Bet Diskon, Bet BB, dan Hadiah Prize 123 resmi.',
    content: `1. STRUKTUR HADIAH BET FULL (TANPA DISKON):
- 4D : x 9.000 s/d 10.000 (Pasang 1.000 -> Hadiah Rp 9.000.000 - Rp 10.000.000)
- 3D : x 950 s/d 1.000 (Pasang 1.000 -> Hadiah Rp 950.000 - Rp 1.000.000)
- 2D : x 95 s/d 100 (Pasang 1.000 -> Hadiah Rp 95.000 - Rp 100.000)

2. STRUKTUR HADIAH BET DISKON (POTONGAN BIAYA):
- 4D : Diskon 66% | Hadiah x 3.000
- 3D : Diskon 59% | Hadiah x 400
- 2D : Diskon 29% | Hadiah x 70

3. HADIAH PERMAINAN COLOK:
- Colok Bebas: Hadiah x 1.5 (Diskon 5%)
- Colok Bebas 2D (Macau): Hadiah x 6.5 (Diskon 10%)
- Colok Naga (3D): Hadiah x 25 (Diskon 10%)
- Colok Jitu: Hadiah x 8 (Diskon 6%)`
  },
  {
    id: 'sop-togel-3',
    title: 'Jadwal Pasaran Togel Internasional',
    category: 'Togel Online',
    readTime: '4 Menit',
    description: 'Jadwal jam tutup pasaran dan waktu pengeluaran result resmi pasaran dunia.',
    content: `1. PASARAN POPULER ASIA & DUNIA:
- SINGAPORE (SGP): Tutup 17:30 WIB | Result 17:45 WIB (Senin, Rabu, Kamis, Sabtu, Minggu)
- HONGKONG (HK): Tutup 22:45 WIB | Result 23:00 WIB (Setiap Hari)
- SYDNEY (SDY): Tutup 13:00 WIB | Result 13:50 WIB (Setiap Hari)

2. PASARAN TOTO MACAU 4D / 5D (PUTARAN SETIAP HARI):
- Putaran 1: Tutup 13:00 WIB | Result 13:15 WIB
- Putaran 2: Tutup 16:00 WIB | Result 16:15 WIB
- Putaran 3: Tutup 19:00 WIB | Result 19:15 WIB
- Putaran 4: Tutup 22:00 WIB | Result 22:15 WIB
- Putaran 5: Tutup 23:55 WIB | Result 00:15 WIB
- Putaran 6: Tutup 00:00 WIB | Result 00:30 WIB`
  },
  {
    id: 'sop-slot-1',
    title: 'Panduan Game Slot Online & Pola RTP',
    category: 'Slot Online',
    readTime: '6 Menit',
    description: 'Pengenalan mekanik reels, paylines, scatter freespin, multiplier, dan panduan edukasi RTP live.',
    content: `1. MEKANIK DASAR SLOT ONLINE:
- Reels & Rows: Formasi gulungan simbol vertikal dan horizontal.
- Paylines: Jalur pembayaran garis lurus atau pola kombinasi kemenangan.
- Tumbling / Cascading: Simbol pecah yang hilang dan digantikan simbol baru beruntun.

2. FITUR SPESIAL & BONUS:
- Scatter Symbol: Memicu babak Free Spin (Putaran Gratis) jika mendapat 4 atau lebih.
- Wild Symbol: Simbol pengganti yang melengkapi payline kemenangan.
- Multiplier (Perkalian): Nilai penggali kemenangan (x2 hingga x500/x1000).

3. PENJELASAN RTP (RETURN TO PLAYER) KE MEMBER:
- Jelaskan bahwa RTP adalah estimasi persentase pengembalian teoritis jangka panjang.
- CS wajib menyarankan bermain secara bijak dengan manajemen modal yang terukur.`
  },
  {
    id: 'sop-casino-1',
    title: 'Panduan Livegame Casino',
    category: 'Livegame Casino',
    readTime: '7 Menit',
    description: 'Aturan bermain Baccarat, Live Roulette, Sicbo (Dadu), Dragon Tiger, dan Blackjack.',
    content: `1. LIVE BACCARAT:
- Player vs Banker vs Tie. Nilai tertinggi adalah 9 (Murni/Natural).
- Kartu 10, J, Q, K bernilai 0. As bernilai 1.
- Banker win dikenakan komisi 5% (pada meja reguler) atau super six (pada non-komisi).

2. LIVE ROULETTE (37 ANGKA: 0 - 36):
- Straight Up (1 Angka): Bayaran 1 : 35
- Split (2 Angka): Bayaran 1 : 17
- Street (3 Angka): Bayaran 1 : 11
- Red/Black, Even/Odd, High/Low: Bayaran 1 : 1

3. SICBO (DICE / DADU):
- Menggunakan 3 buah dadu kocok.
- Big (11-17), Small (4-10). Taruhan kalah jika keluar Triple kembar dadu.`
  },
  {
    id: 'sop-selisih-1',
    title: 'Cara Cari Selisih Saldo & Mutasi Bank',
    category: 'Cara Cari Selisih',
    readTime: '8 Menit',
    description: 'SOP audit kasir untuk melacak selisih nominal mutasi bank penampung vs laporan sistem transaksi.',
    content: `1. LANGKAH-LANGKAH AUDIT MUTASI:
- Tarik riwayat rekening koran bank (Internet Banking / Mutasi CSV) dari jam awal shift hingga akhir shift.
- Ekspor data transaksi sistem deposit & withdraw yang berstatus APPROVED.
- Jumlahkan Total Mutasi Kredit Bank vs Total Form Deposit Sistem.
- Jumlahkan Total Mutasi Debet Bank vs Total Form Withdraw Sistem.

2. PENYEBAB UMUM TERJADINYA SELISIH:
- Form Deposit ganda (terproses 2x oleh operator berbeda).
- Mutasi pending / dana nyangkut dari bank pengirim yang baru masuk terlambat.
- Biaya admin antar bank (misal transfer Rp 50.000 terpotong Rp 2.500/Rp 6.500).
- Salah input nominal oleh kasir (Human Error).

3. FORMULA PENCOCOKAN:
- Selisih Deposit = (Total Mutasi Masuk Bank) - (Total Depo Approved Sistem)
- Selisih Withdraw = (Total Mutasi Keluar Bank) - (Total WD Approved Sistem)
- Jika nilai = 0, pembukuan shift dinyatakan MATCH (SEIMBANG).`
  },
  {
    id: 'sop-ganti-docs-1',
    title: 'Cara Ganti Docs & Validasi Data Member',
    category: 'Cara Ganti Docs',
    readTime: '7 Menit',
    description: 'Prosedur ketat validasi verifikasi pergantian nomor rekening, nama bank, atau nomor kontak member.',
    content: `1. SYARAT WAJIB GANTI REKENING:
- Member wajib melampirkan foto KTP asli dan buku tabungan lama & baru yang jelas tanpa sensor nama.
- Tangkapan layar (screenshot) profil M-Banking aktif yang menampilkan Nama & Nomor Rekening baru.
- Verifikasi mutasi deposit terakhir minimal 1x transaksi 24 jam terakhir.

2. LANGKAH VERIFIKASI OPERATOR CS:
- Cocokkan nama rekening baru dengan data registrasi awal (Wajib SAMA NAMA pemilik).
- Lakukan panggilan konfirmasi / verifikasi via WhatsApp terdaftar jika diperlukan.
- Input data perubahan ke menu LAPORAN CS (Ganti Data) untuk diapprove oleh Supervisor.

3. TINDAKAN PENCEGAHAN (ANTI-HACKING):
- DILARANG KERAS mengubah rekening jika nama pemilik rekening baru BERBEDA dengan pemilik akun.
- Jangan proses ganti data jika akun sedang memiliki tiket withdraw aktif.`
  }
];

export const PRESET_BACKGROUNDS = [
  {
    id: 'bg-don-isko-711',
    name: 'Don Isko 711 HS Group (Official Background)',
    url: '/don-isko-711.jpg',
    description: 'Artwork eksklusif 711 HS Group by Don Isko Cyber Hacker Matrix.'
  },
  {
    id: 'bg-casino-neon',
    name: 'Casino Neon Anime Theme',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1920&auto=format&fit=crop&q=80',
    description: 'Nuansa biru neon futuristik elegan dengan sentuhan game premium.'
  },
  {
    id: 'bg-dark-matte',
    name: 'Matte Carbon Dark Minimalist',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80',
    description: 'Tema gelap dop solid tanpa distraksi, fokus penuh pada kecepatan kerja.'
  },
  {
    id: 'bg-gold-luxury',
    name: 'Gold Luxury Casino Royale',
    url: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=1920&auto=format&fit=crop&q=80',
    description: 'Aksen emas mewah berkelas dipadukan dengan kilau neon kuning.'
  },
  {
    id: 'bg-cyber-blue',
    name: 'Cyberpunk Neon Blue Tech',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=80',
    description: 'Grid futuristik dengan pencahayaan neon biru cerah.'
  }
];

