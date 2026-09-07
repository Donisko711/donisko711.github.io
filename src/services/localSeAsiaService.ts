import { LiveMatch } from '../types';

interface FixtureDef {
  id: string;
  sportLabel: string;
  league: string;
  leagueCode: string;
  leagueLogo: string;
  country: string;
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    record?: string;
    form?: string[];
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    record?: string;
    form?: string[];
  };
  kickoffHour: number; // in WIB (UTC+7)
  kickoffMinute: number;
  dateStr: string; // YYYYMMDD
  wibDate: string; // e.g. "Minggu, 06 September 2026"
  venue: string;
  isBigMatch?: boolean;
  fixedFinalScore?: { home: number; away: number };
  events?: {
    minute: string;
    type: 'goal' | 'yellow_card' | 'red_card';
    player: string;
    team: 'home' | 'away';
    detail?: string;
  }[];
}

const SE_ASIA_FIXTURES: FixtureDef[] = [
  // ==========================================
  // 1. CAMBODIAN PREMIER LEAGUE (CPL) 2026-2027
  // ==========================================
  // Sunday, 06 September 2026
  {
    id: 'cpl-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Preah_Khan_Reach_Svay_Rieng_FC_logo.svg/300px-Preah_Khan_Reach_Svay_Rieng_FC_logo.svg.png',
    country: 'Cambodia',
    homeTeam: {
      name: 'Kirivong Sok Sen Chey FC',
      shortName: 'Kirivong',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 9 • 0W-0D-0L',
      form: ['L', 'D', 'L']
    },
    awayTeam: {
      name: 'Preah Khan Reach Svay Rieng FC',
      shortName: 'Svay Rieng',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Juara Bertahan • 0W-0D-0L',
      form: ['W', 'W', 'W']
    },
    kickoffHour: 15,
    kickoffMinute: 45,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Takeo Provincial Stadium, Takeo',
    isBigMatch: true,
    events: [
      { minute: "19'", type: 'goal', player: 'Bounphachan Bounkong', team: 'away', detail: 'Assist: Min Ratanak' },
      { minute: "38'", type: 'goal', player: 'Jose Elmer', team: 'home', detail: 'Tendangan Bebas' },
      { minute: "62'", type: 'goal', player: 'Gabriel Silva', team: 'away', detail: 'Sepakan Kaki Kiri' },
      { minute: "71'", type: 'yellow_card', player: 'Sok Samnang', team: 'home' }
    ]
  },
  {
    id: 'cpl-20260906-2',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Cambodia',
    homeTeam: {
      name: 'Royal Cambodian Armed Forces FC',
      shortName: 'Tiffy Army',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'L']
    },
    awayTeam: {
      name: 'Visakha FC',
      shortName: 'Visakha',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'RCAF Old Stadium, Phnom Penh',
    isBigMatch: true
  },
  {
    id: 'cpl-20260906-3',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Cambodia',
    homeTeam: {
      name: 'ISI Dangkor Senchey FC',
      shortName: 'ISI Dangkor',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['L', 'W', 'D']
    },
    awayTeam: {
      name: 'Boeung Ket FC',
      shortName: 'Boeung Ket',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'AIA Stadium KMH PARK, Phnom Penh',
    isBigMatch: false
  },
  // Saturday, 05 September 2026 (Finished matches)
  {
    id: 'cpl-20260905-1',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Cambodia',
    homeTeam: {
      name: 'Phnom Penh Crown FC',
      shortName: 'Phnom Penh Crown',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'W', 'W']
    },
    awayTeam: {
      name: 'NagaWorld FC',
      shortName: 'NagaWorld',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'L', 'W']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260905',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Smart RSN Stadium, Phnom Penh',
    fixedFinalScore: { home: 2, away: 2 },
    events: [
      { minute: "14'", type: 'goal', player: 'Shintaro Shimizu', team: 'home' },
      { minute: "41'", type: 'goal', player: 'Marques Marcio', team: 'away' },
      { minute: "67'", type: 'goal', player: 'Lim Pisoth', team: 'home' },
      { minute: "89'", type: 'goal', player: 'Cristian Roque', team: 'away' }
    ]
  },
  {
    id: 'cpl-20260905-2',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Cambodia',
    homeTeam: {
      name: 'Angkor Tiger FC',
      shortName: 'Angkor Tiger',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'L', 'D']
    },
    awayTeam: {
      name: 'MOI Kompong Dewa FC',
      shortName: 'Kompong Dewa',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'D', 'L']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260905',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Hanuman Stadium, Siem Reap',
    fixedFinalScore: { home: 0, away: 0 }
  },

  // ==========================================
  // 2. BRI LIGA 1 INDONESIA 2026-2027 (PEKAN 1)
  // ==========================================
  // Sunday, 06 September 2026
  {
    id: 'liga1-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Persik Kediri',
      shortName: 'Persik',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19089.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'L']
    },
    awayTeam: {
      name: 'Dewa United FC',
      shortName: 'Dewa United',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20349.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Brawijaya, Kediri',
    isBigMatch: false,
    events: [
      { minute: "22'", type: 'goal', player: 'Ramiro Fergonzi', team: 'home', detail: 'Assist: Ze Valente' },
      { minute: "54'", type: 'goal', player: 'Alex Martins', team: 'away', detail: 'Sundulan Kepala' },
      { minute: "68'", type: 'yellow_card', player: 'Ricky Kambuaya', team: 'away' }
    ]
  },
  {
    id: 'liga1-20260906-2',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Bhayangkara Presisi FC',
      shortName: 'Bhayangkara FC',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17799.png',
      record: '0W-0D-0L',
      form: ['L', 'D', 'W']
    },
    awayTeam: {
      name: 'Persebaya Surabaya',
      shortName: 'Persebaya',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11090.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion PTIK, Jakarta Selatan',
    isBigMatch: true,
    events: [
      { minute: "33'", type: 'goal', player: 'Bruno Moreira', team: 'away', detail: 'Penalti' },
      { minute: "61'", type: 'yellow_card', player: 'Arief Catur', team: 'away' }
    ]
  },
  {
    id: 'liga1-20260906-3',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'PSIM Yogyakarta',
      shortName: 'PSIM',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Persita Tangerang',
      shortName: 'Persita',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11094.png',
      record: '0W-0D-0L',
      form: ['D', 'L', 'W']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Mandala Krida, Yogyakarta',
    events: [
      { minute: "12'", type: 'goal', player: 'Rafael Rodrigues', team: 'home' },
      { minute: "44'", type: 'goal', player: 'Marios Ogkmpoe', team: 'away' },
      { minute: "70'", type: 'goal', player: 'Savio Sheva', team: 'home' }
    ]
  },
  {
    id: 'liga1-20260906-4',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Persib Bandung',
      shortName: 'Persib',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11087.png',
      record: 'Juara Bertahan • 0W-0D-0L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'PSM Makassar',
      shortName: 'PSM',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11091.png',
      record: '0W-0D-0L',
      form: ['D', 'W', 'W']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Gelora Bandung Lautan Api (GBLA), Bandung',
    isBigMatch: true,
    events: [
      { minute: "19'", type: 'yellow_card', player: 'Marc Klok', team: 'home', detail: 'Pelanggaran Keras' },
      { minute: "26'", type: 'goal', player: 'Ciro Alves', team: 'home', detail: 'Assist: David da Silva' },
      { minute: "38'", type: 'yellow_card', player: 'Yuran Fernandes', team: 'away', detail: 'Protes Keras Wasit' },
      { minute: "59'", type: 'goal', player: 'Nermin Haljeta', team: 'away', detail: 'Sundulan Kepala' },
      { minute: "72'", type: 'red_card', player: 'Ananda Raehan', team: 'away', detail: 'Pelanggaran Keras' },
      { minute: "83'", type: 'goal', player: 'Tyronne del Pino', team: 'home', detail: 'Sepakan Kaki Kiri' }
    ]
  },
  {
    id: 'liga1-20260906-5',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Borneo FC Samarinda',
      shortName: 'Borneo FC',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17798.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Persija Jakarta',
      shortName: 'Persija',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11088.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Segiri, Samarinda',
    isBigMatch: true
  },
  {
    id: 'liga1-20260906-6',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Madura United FC',
      shortName: 'Madura Utd',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17797.png',
      record: '0W-0D-0L',
      form: ['L', 'D', 'W']
    },
    awayTeam: {
      name: 'Persijap Jepara',
      shortName: 'Persijap',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Gelora Ratu Pamelingan, Pamekasan'
  },
  // Saturday, 05 September 2026
  {
    id: 'liga1-20260905-1',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Bali United FC',
      shortName: 'Bali United',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17796.png',
      record: '1W-0D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Semen Padang FC',
      shortName: 'Semen Padang',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11093.png',
      record: '0W-0D-1L',
      form: ['L', 'W', 'L']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260905',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Stadion Kapten I Wayan Dipta, Gianyar',
    fixedFinalScore: { home: 2, away: 1 },
    events: [
      { minute: "18'", type: 'goal', player: 'Everton Nascimento', team: 'home' },
      { minute: "52'", type: 'goal', player: 'Kenneth Ngwoke', team: 'away' },
      { minute: "79'", type: 'goal', player: 'Privat Mbarga', team: 'home' }
    ]
  },
  {
    id: 'liga1-20260905-2',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Arema FC',
      shortName: 'Arema',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11086.png',
      record: '0W-1D-0L',
      form: ['D', 'W', 'L']
    },
    awayTeam: {
      name: 'Malut United FC',
      shortName: 'Malut United',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'D', 'W']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260905',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Stadion Soepriadi, Blitar',
    fixedFinalScore: { home: 1, away: 1 },
    events: [
      { minute: "35'", type: 'goal', player: 'Dalberto', team: 'home' },
      { minute: "73'", type: 'goal', player: 'Yakob Sayuri', team: 'away' }
    ]
  },

  // ==========================================
  // 3. PEGADAIAN LIGA 2 INDONESIA 2026-2027
  // ==========================================
  {
    id: 'liga2-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'Pegadaian Liga 2 Indonesia',
    leagueCode: 'idn.2',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Sriwijaya FC',
      shortName: 'Sriwijaya',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11095.png',
      record: '0W-0D-0L',
      form: ['W', 'D', 'L']
    },
    awayTeam: {
      name: 'PSMS Medan',
      shortName: 'PSMS Medan',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11092.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Gelora Sriwijaya Jakabaring, Palembang',
    events: [
      { minute: "28'", type: 'goal', player: 'Chencho Gyeltshen', team: 'home' },
      { minute: "65'", type: 'goal', player: 'Jacinto Cabral', team: 'away' }
    ]
  },
  {
    id: 'liga2-20260906-2',
    sportLabel: 'Sepak Bola',
    league: 'Pegadaian Liga 2 Indonesia',
    leagueCode: 'idn.2',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Indonesia',
    homeTeam: {
      name: 'Persela Lamongan',
      shortName: 'Persela',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11089.png',
      record: '0W-0D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Deltras Sidoarjo',
      shortName: 'Deltras',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-0L',
      form: ['D', 'W', 'L']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Surajaya, Lamongan',
    events: [
      { minute: "41'", type: 'goal', player: 'Ezechiel Ndouasel', team: 'home' }
    ]
  }
];

/**
 * Returns dynamic LiveMatch objects for Southeast Asian leagues (Cambodia & Indonesia)
 * Calculates realtime live status, minute in-play, and scores relative to WIB (UTC+7).
 */
export function getSeAsiaMatches(targetDateStr?: string): LiveMatch[] {
  const now = new Date();
  // WIB time
  const wibTimeMs = now.getTime() + 7 * 3600 * 1000;
  const wibDateObj = new Date(wibTimeMs);
  const currentWibY = wibDateObj.getUTCFullYear();
  const currentWibM = String(wibDateObj.getUTCMonth() + 1).padStart(2, '0');
  const currentWibD = String(wibDateObj.getUTCDate()).padStart(2, '0');
  const todayWibDateStr = `${currentWibY}${currentWibM}${currentWibD}`;

  const currentWibHour = wibDateObj.getUTCHours();
  const currentWibMinute = wibDateObj.getUTCMinutes();
  const currentWibTotalMinutes = currentWibHour * 60 + currentWibMinute;

  // Filter fixtures for target date (default to today if empty)
  const queryDate = targetDateStr || todayWibDateStr;
  const matchedFixtures = SE_ASIA_FIXTURES.filter((f) => f.dateStr === queryDate);

  return matchedFixtures.map((fix) => {
    const kickoffTotalMinutes = fix.kickoffHour * 60 + fix.kickoffMinute;
    const diffMinutes = currentWibTotalMinutes - kickoffTotalMinutes;

    // Construct raw UTC date
    const y = fix.dateStr.slice(0, 4);
    const m = fix.dateStr.slice(4, 6);
    const d = fix.dateStr.slice(6, 8);
    // Kickoff UTC hour = kickoffHour - 7
    let utcHour = fix.kickoffHour - 7;
    let utcDay = Number(d);
    if (utcHour < 0) {
      utcHour += 24;
      utcDay -= 1;
    }
    const rawUtcDate = `${y}-${m}-${String(utcDay).padStart(2, '0')}T${String(utcHour).padStart(2, '0')}:${String(fix.kickoffMinute).padStart(2, '0')}:00.000Z`;
    const wibTime = `${String(fix.kickoffHour).padStart(2, '0')}:${String(fix.kickoffMinute).padStart(2, '0')} WIB`;

    let status: 'LIVE' | 'FINISHED' | 'SCHEDULED' = 'SCHEDULED';
    let statusDetail = wibTime;
    let elapsedMinutes: number | undefined;
    let elapsedDetail = '';
    let displayClock = '';
    let homeScore: number | string = 0;
    let awayScore: number | string = 0;

    const isToday = fix.dateStr === todayWibDateStr;
    const isPastDate = fix.dateStr < todayWibDateStr;

    if (fix.fixedFinalScore) {
      status = 'FINISHED';
      statusDetail = 'FT (Selesai)';
      elapsedDetail = "Pertandingan Selesai Penuh (Full Time 90')";
      homeScore = fix.fixedFinalScore.home;
      awayScore = fix.fixedFinalScore.away;
    } else if (isPastDate) {
      // Past dates without explicit final score default to finished
      status = 'FINISHED';
      statusDetail = 'FT (Selesai)';
      elapsedDetail = "Pertandingan Selesai Penuh (Full Time 90')";
      homeScore = 1;
      awayScore = 1;
    } else if (isToday) {
      if (diffMinutes < 0) {
        // Scheduled (not yet started)
        status = 'SCHEDULED';
        statusDetail = wibTime;
        const minsLeft = Math.abs(diffMinutes);
        const hrs = Math.floor(minsLeft / 60);
        const remMins = minsLeft % 60;
        elapsedDetail = hrs > 0 ? `Kickoff dalam ${hrs} jam ${remMins} mnt` : `Kickoff dalam ${remMins} menit`;
        homeScore = 0;
        awayScore = 0;
      } else if (diffMinutes <= 115) {
        // Live match!
        status = 'LIVE';
        if (diffMinutes <= 45) {
          elapsedMinutes = Math.max(1, diffMinutes);
          displayClock = `${elapsedMinutes}'`;
          statusDetail = `Babak 1 (${displayClock})`;
          elapsedDetail = `Babak 1 • Menit ${displayClock}`;
          // Progressive score simulation based on events
          homeScore = fix.events?.filter(e => e.team === 'home' && parseInt(e.minute) <= diffMinutes).length || 0;
          awayScore = fix.events?.filter(e => e.team === 'away' && parseInt(e.minute) <= diffMinutes).length || 0;
        } else if (diffMinutes <= 60) {
          statusDetail = 'HT (Turun Minum)';
          displayClock = 'HT';
          elapsedDetail = 'Istirahat Babak Pertama (HT ~15 Menit)';
          homeScore = fix.events?.filter(e => e.team === 'home' && parseInt(e.minute) <= 45).length || 0;
          awayScore = fix.events?.filter(e => e.team === 'away' && parseInt(e.minute) <= 45).length || 0;
        } else {
          const secondHalfMins = Math.min(90, 45 + (diffMinutes - 60));
          elapsedMinutes = secondHalfMins;
          displayClock = `${secondHalfMins}'`;
          statusDetail = `Babak 2 (${displayClock})`;
          elapsedDetail = `Babak 2 • Menit ${displayClock}`;
          homeScore = fix.events?.filter(e => e.team === 'home' && parseInt(e.minute) <= secondHalfMins).length || 0;
          awayScore = fix.events?.filter(e => e.team === 'away' && parseInt(e.minute) <= secondHalfMins).length || 0;
        }
      } else {
        // Match completed full time
        status = 'FINISHED';
        statusDetail = 'FT (Selesai)';
        elapsedDetail = "Pertandingan Selesai Penuh (Full Time 90')";
        homeScore = fix.events?.filter(e => e.team === 'home').length || 1;
        awayScore = fix.events?.filter(e => e.team === 'away').length || 1;
      }
    } else {
      // Future date
      status = 'SCHEDULED';
      statusDetail = wibTime;
      elapsedDetail = `Jadwal Terdaftar (${fix.wibDate})`;
      homeScore = 0;
      awayScore = 0;
    }

    return {
      id: fix.id,
      sport: 'soccer',
      sportLabel: fix.sportLabel,
      league: fix.league,
      leagueCode: fix.leagueCode,
      leagueLogo: fix.leagueLogo,
      country: fix.country,
      season: '2026-2027',
      homeTeam: {
        name: fix.homeTeam.name,
        shortName: fix.homeTeam.shortName,
        logo: fix.homeTeam.logo,
        score: homeScore,
        record: fix.homeTeam.record,
        form: fix.homeTeam.form
      },
      awayTeam: {
        name: fix.awayTeam.name,
        shortName: fix.awayTeam.shortName,
        logo: fix.awayTeam.logo,
        score: awayScore,
        record: fix.awayTeam.record,
        form: fix.awayTeam.form
      },
      status,
      statusDetail,
      displayClock,
      elapsedMinutes,
      elapsedDetail,
      kickoffWib: wibTime,
      rawUtcDate,
      wibTime,
      wibDate: fix.wibDate,
      venue: fix.venue,
      region: 'asia',
      isBigMatch: fix.isBigMatch,
      events: (() => {
        let active = fix.events || [];
        if (status === 'LIVE') {
          const currentMin = elapsedMinutes || diffMinutes;
          active = (fix.events || []).filter((e) => {
            const minNum = parseInt(e.minute, 10);
            return isNaN(minNum) || minNum <= currentMin;
          });
        } else if (status === 'SCHEDULED') {
          active = [];
        }
        return active.map((e) => ({
          type: e.type,
          minute: e.minute,
          player: e.player,
          team: e.team,
          detail: e.detail,
          cardType: e.type === 'yellow_card' ? 'yellow' : e.type === 'red_card' ? 'red' : undefined
        }));
      })()
    };
  });
}
