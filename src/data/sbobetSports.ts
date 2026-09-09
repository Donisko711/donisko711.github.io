import { LiveMatch, SportType } from '../types';

export interface SbobetSportItem {
  id: SportType;
  name: string;
  icon: string;
  count: number;
  badgeColor: 'orange' | 'blue';
}

export const SBOBET_SPORTS_LIST: SbobetSportItem[] = [
  { id: 'soccer', name: 'Sepak Bola', icon: '⚽', count: 748, badgeColor: 'orange' },
  { id: 'basketball', name: 'Bola Basket', icon: '🏀', count: 184, badgeColor: 'orange' },
  { id: 'table_tennis', name: 'Tenis Meja', icon: '🏓', count: 501, badgeColor: 'orange' },
  { id: 'baseball', name: 'Bola Kasti', icon: '⚾', count: 41, badgeColor: 'orange' },
  { id: 'tennis', name: 'Tenis', icon: '🎾', count: 313, badgeColor: 'orange' },
  { id: 'esports', name: 'eSports SBO', icon: '🎮', count: 6, badgeColor: 'blue' },
  { id: 'american_football', name: 'Sepak Bola Amerika', icon: '🏈', count: 164, badgeColor: 'orange' },
  { id: 'badminton', name: 'Bulu Tangkis', icon: '🏸', count: 22, badgeColor: 'orange' },
  { id: 'beach_soccer', name: 'Sepak Bola Pantai', icon: '⚽', count: 4, badgeColor: 'blue' },
  { id: 'boxing', name: 'Tinju', icon: '🥊', count: 38, badgeColor: 'blue' },
  { id: 'cycling', name: 'Balap Sepeda', icon: '🚴', count: 28, badgeColor: 'blue' },
  { id: 'darts', name: 'Dart', icon: '🎯', count: 32, badgeColor: 'orange' },
  { id: 'specials', name: 'Spesial', icon: '👑', count: 17, badgeColor: 'blue' },
  { id: 'field_hockey', name: 'Hoki Lapangan', icon: '🏑', count: 5, badgeColor: 'blue' },
  { id: 'ice_hockey', name: 'Hoki Es', icon: '🏒', count: 130, badgeColor: 'orange' },
  { id: 'mma', name: 'Seni Bela Diri Campuran', icon: '🥋', count: 25, badgeColor: 'blue' },
  { id: 'motorsport', name: 'Balap Motor', icon: '🏁', count: 72, badgeColor: 'blue' },
  { id: 'billiards', name: 'Billiard/Snooker', icon: '🎱', count: 19, badgeColor: 'orange' },
  { id: 'rugby', name: 'Rugbi', icon: '🏉', count: 54, badgeColor: 'blue' },
  { id: 'volleyball', name: 'Bola Voli', icon: '🏐', count: 35, badgeColor: 'orange' },
  { id: 'water_polo', name: 'Polo Air', icon: '🤽', count: 8, badgeColor: 'blue' },
  { id: 'aussie_rules', name: 'Aussie Rules Football', icon: '🏉', count: 8, badgeColor: 'blue' },
  { id: 'other', name: 'Lainnya', icon: '🎖️', count: 16, badgeColor: 'blue' },
  { id: 'golf', name: 'Golf', icon: '⛳', count: 72, badgeColor: 'blue' },
  { id: 'handball', name: 'Bola Tangan', icon: '🤾', count: 46, badgeColor: 'blue' },
  { id: 'futsal', name: 'Futsal', icon: '⚽', count: 16, badgeColor: 'blue' },
];

// Rich SBOBET fixtures across all specialized sports
export function generateSbobetSpecialtyMatches(targetDateStr?: string): LiveMatch[] {
  const now = new Date();
  const wibTimeMs = now.getTime() + 7 * 3600 * 1000;
  const wibDateObj = new Date(wibTimeMs);
  const currentWibY = wibDateObj.getUTCFullYear();
  const currentWibM = String(wibDateObj.getUTCMonth() + 1).padStart(2, '0');
  const currentWibD = String(wibDateObj.getUTCDate()).padStart(2, '0');
  const todayWibDateStr = `${currentWibY}${currentWibM}${currentWibD}`;
  const queryDate = targetDateStr || todayWibDateStr;
  const isPast = queryDate < todayWibDateStr;

  const specialties: Array<{
    sport: SportType;
    sportLabel: string;
    league: string;
    home: string;
    homeShort: string;
    away: string;
    awayShort: string;
    status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
    statusDetail: string;
    displayClock: string;
    homeScore: number | string;
    awayScore: number | string;
    periodScores?: (number | string)[];
    wibTime: string;
    venue: string;
    country: string;
    hdp: string;
    ou: string;
    odds: { home: string; away: string; draw?: string; over: string; under: string };
  }> = [
    // 1. Tenis Meja (Table Tennis)
    {
      sport: 'table_tennis',
      sportLabel: 'Tenis Meja',
      league: 'WTT Champions Macao - Men Singles',
      home: 'Fan Zhendong',
      homeShort: 'Fan Z.',
      away: 'Wang Chuqin',
      awayShort: 'Wang C.',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Game 5 • 8-7',
      displayClock: isPast ? 'FT' : 'Set 5',
      homeScore: 3,
      awayScore: 2,
      periodScores: [11, 9, 11, 8, 8],
      wibTime: '14:30 WIB',
      venue: 'Tap Seac Multisport Pavilion, Macao',
      country: 'Internasional',
      hdp: '-1.5',
      ou: '78.5',
      odds: { home: '1.82', away: '1.98', over: '1.90', under: '1.90' }
    },
    {
      sport: 'table_tennis',
      sportLabel: 'Tenis Meja',
      league: 'Table Tennis Setka Cup (Liga Setka)',
      home: 'Truls Moregard',
      homeShort: 'T. Moregard',
      away: 'Tomokazu Harimoto',
      awayShort: 'T. Harimoto',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '19:00 WIB',
      displayClock: '',
      homeScore: isPast ? 3 : 0,
      awayScore: isPast ? 1 : 0,
      wibTime: '19:00 WIB',
      venue: 'Kyiv Setka Arena',
      country: 'Ukraina',
      hdp: '0.0',
      ou: '74.5',
      odds: { home: '1.95', away: '1.85', over: '1.88', under: '1.92' }
    },

    // 2. Bulu Tangkis (Badminton)
    {
      sport: 'badminton',
      sportLabel: 'Bulu Tangkis',
      league: 'BWF World Tour Super 1000 - All England Open',
      home: 'Jonatan Christie',
      homeShort: 'J. Christie [INA]',
      away: 'Viktor Axelsen',
      awayShort: 'V. Axelsen [DEN]',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Set 3 • 18-17',
      displayClock: isPast ? 'FT' : 'Game 3',
      homeScore: 1,
      awayScore: 1,
      periodScores: [21, 19, 18],
      wibTime: '16:00 WIB',
      venue: 'Utilita Arena Birmingham, UK',
      country: 'Inggris',
      hdp: '+2.5',
      ou: '82.5',
      odds: { home: '2.05', away: '1.75', over: '1.85', under: '1.95' }
    },
    {
      sport: 'badminton',
      sportLabel: 'Bulu Tangkis',
      league: 'BWF World Tour - Ganda Putra',
      home: 'Fajar Alfian / M. Rian Ardianto',
      homeShort: 'Fajar/Rian [INA]',
      away: 'Liang Wei Keng / Wang Chang',
      awayShort: 'Liang/Wang [CHN]',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '20:15 WIB',
      displayClock: '',
      homeScore: isPast ? 2 : 0,
      awayScore: isPast ? 1 : 0,
      wibTime: '20:15 WIB',
      venue: 'Istora Gelora Bung Karno, Jakarta',
      country: 'Indonesia',
      hdp: '0.0',
      ou: '84.5',
      odds: { home: '1.90', away: '1.90', over: '1.88', under: '1.92' }
    },

    // 3. Bola Kasti / Baseball
    {
      sport: 'baseball',
      sportLabel: 'Bola Kasti',
      league: 'MLB (Major League Baseball)',
      home: 'New York Yankees',
      homeShort: 'NY Yankees',
      away: 'Boston Red Sox',
      awayShort: 'Boston',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Inning 7 Bot',
      displayClock: isPast ? 'FT' : 'Inn 7',
      homeScore: 5,
      awayScore: 3,
      wibTime: '06:05 WIB',
      venue: 'Yankee Stadium, New York',
      country: 'Amerika Serikat',
      hdp: '-1.5',
      ou: '8.5',
      odds: { home: '1.78', away: '2.10', over: '1.92', under: '1.88' }
    },

    // 4. Tenis (Tennis)
    {
      sport: 'tennis',
      sportLabel: 'Tenis',
      league: 'ATP Grand Slam - Wimbledon Championships',
      home: 'Carlos Alcaraz',
      homeShort: 'C. Alcaraz',
      away: 'Jannik Sinner',
      awayShort: 'J. Sinner',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Set 4 • 4-3 (40-30)',
      displayClock: isPast ? 'FT' : 'Set 4',
      homeScore: 2,
      awayScore: 1,
      periodScores: [6, 4, 7, 4],
      wibTime: '20:00 WIB',
      venue: 'Centre Court Wimbledon, London',
      country: 'Inggris',
      hdp: '-1.5',
      ou: '38.5',
      odds: { home: '1.80', away: '2.00', over: '1.90', under: '1.90' }
    },

    // 5. eSports SBO
    {
      sport: 'esports',
      sportLabel: 'eSports SBO',
      league: 'Dota 2 - The International (Main Stage)',
      home: 'Team Spirit',
      homeShort: 'Team Spirit',
      away: 'Gaimin Gladiators',
      awayShort: 'GG',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Game 2 • 28 Min',
      displayClock: isPast ? 'FT' : 'Map 2',
      homeScore: 1,
      awayScore: 0,
      wibTime: '17:00 WIB',
      venue: 'Royal Arena, Copenhagen',
      country: 'Internasional',
      hdp: '-1.5',
      ou: '48.5 (Kills)',
      odds: { home: '1.72', away: '2.15', over: '1.85', under: '1.95' }
    },
    {
      sport: 'esports',
      sportLabel: 'eSports SBO',
      league: 'CS2 - ESL Pro League Season 20',
      home: 'FaZe Clan',
      homeShort: 'FaZe',
      away: 'Natus Vincere',
      awayShort: 'NAVI',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '22:00 WIB',
      displayClock: '',
      homeScore: isPast ? 2 : 0,
      awayScore: isPast ? 1 : 0,
      wibTime: '22:00 WIB',
      venue: 'InterContinental Arena, Malta',
      country: 'Eropa',
      hdp: '+1.5',
      ou: '2.5 (Maps)',
      odds: { home: '2.10', away: '1.75', over: '1.95', under: '1.85' }
    },

    // 6. Sepak Bola Amerika (American Football)
    {
      sport: 'american_football',
      sportLabel: 'Sepak Bola Amerika',
      league: 'NFL (National Football League)',
      home: 'Kansas City Chiefs',
      homeShort: 'Chiefs',
      away: 'San Francisco 49ers',
      awayShort: '49ers',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '07:30 WIB',
      displayClock: '',
      homeScore: isPast ? 28 : 0,
      awayScore: isPast ? 24 : 0,
      wibTime: '07:30 WIB',
      venue: 'GEHA Field at Arrowhead Stadium',
      country: 'Amerika Serikat',
      hdp: '-2.5',
      ou: '47.5',
      odds: { home: '1.85', away: '1.95', over: '1.90', under: '1.90' }
    },

    // 7. Sepak Bola Pantai (Beach Soccer)
    {
      sport: 'beach_soccer',
      sportLabel: 'Sepak Bola Pantai',
      league: 'FIFA Beach Soccer World Cup',
      home: 'Brasil Beach Team',
      homeShort: 'Brasil',
      away: 'Portugal Beach Team',
      awayShort: 'Portugal',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '21:00 WIB',
      displayClock: '',
      homeScore: isPast ? 6 : 0,
      awayScore: isPast ? 4 : 0,
      wibTime: '21:00 WIB',
      venue: 'Dubai Design District Stadium',
      country: 'UAE',
      hdp: '-1.5',
      ou: '8.5',
      odds: { home: '1.70', away: '2.20', over: '1.88', under: '1.92' }
    },

    // 8. Tinju (Boxing)
    {
      sport: 'boxing',
      sportLabel: 'Tinju',
      league: 'WBC / WBA Heavyweight Championship',
      home: 'Tyson Fury',
      homeShort: 'T. Fury',
      away: 'Oleksandr Usyk',
      awayShort: 'O. Usyk',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '05:00 WIB',
      displayClock: '',
      homeScore: isPast ? 'WIN (MD)' : '-',
      awayScore: isPast ? 'LOSS' : '-',
      wibTime: '05:00 WIB',
      venue: 'Kingdom Arena, Riyadh',
      country: 'Arab Saudi',
      hdp: '0.0',
      ou: '10.5 (Rounds)',
      odds: { home: '1.95', away: '1.85', over: '1.65', under: '2.25' }
    },

    // 9. Balap Sepeda (Cycling)
    {
      sport: 'cycling',
      sportLabel: 'Balap Sepeda',
      league: 'Tour de France - Etape 15',
      home: 'Tadej Pogacar',
      homeShort: 'T. Pogacar',
      away: 'Jonas Vingegaard',
      awayShort: 'J. Vingegaard',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'KM 135/180',
      displayClock: isPast ? 'FT' : 'Live Race',
      homeScore: '1st',
      awayScore: '+12s',
      wibTime: '18:30 WIB',
      venue: 'Alpe d\'Huez Mountain Stage',
      country: 'Prancis',
      hdp: '-5.5s',
      ou: 'Head to Head',
      odds: { home: '1.65', away: '2.25', over: '1.90', under: '1.90' }
    },

    // 10. Dart
    {
      sport: 'darts',
      sportLabel: 'Dart',
      league: 'PDC World Darts Championship',
      home: 'Luke Littler',
      homeShort: 'L. Littler',
      away: 'Michael van Gerwen',
      awayShort: 'M. van Gerwen',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Set 4 • Leg 2',
      displayClock: isPast ? 'FT' : 'Set 4',
      homeScore: 3,
      awayScore: 1,
      wibTime: '02:00 WIB',
      venue: 'Alexandra Palace, London',
      country: 'Inggris',
      hdp: '-1.5',
      ou: '7.5 (Sets)',
      odds: { home: '1.75', away: '2.10', over: '1.85', under: '1.95' }
    },

    // 11. Hoki Es (Ice Hockey)
    {
      sport: 'ice_hockey',
      sportLabel: 'Hoki Es',
      league: 'NHL (National Hockey League)',
      home: 'Edmonton Oilers',
      homeShort: 'Oilers',
      away: 'Florida Panthers',
      awayShort: 'Panthers',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '08:00 WIB',
      displayClock: '',
      homeScore: isPast ? 4 : 0,
      awayScore: isPast ? 2 : 0,
      wibTime: '08:00 WIB',
      venue: 'Rogers Place, Edmonton',
      country: 'Kanada',
      hdp: '-0.5',
      ou: '5.5',
      odds: { home: '1.85', away: '1.95', over: '1.90', under: '1.90' }
    },

    // 12. Seni Bela Diri Campuran (MMA)
    {
      sport: 'mma',
      sportLabel: 'Seni Bela Diri Campuran',
      league: 'UFC 312 - Lightweight Title Bout',
      home: 'Islam Makhachev',
      homeShort: 'I. Makhachev',
      away: 'Arman Tsarukyan',
      awayShort: 'A. Tsarukyan',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '11:00 WIB',
      displayClock: '',
      homeScore: isPast ? 'WIN (SUB)' : '-',
      awayScore: isPast ? 'LOSS' : '-',
      wibTime: '11:00 WIB',
      venue: 'T-Mobile Arena, Las Vegas',
      country: 'Amerika Serikat',
      hdp: '0.0',
      ou: '2.5 (Rounds)',
      odds: { home: '1.45', away: '2.80', over: '1.75', under: '2.05' }
    },

    // 13. Balap Motor (Motorsport)
    {
      sport: 'motorsport',
      sportLabel: 'Balap Motor',
      league: 'MotoGP Grand Prix of Qatar - Main Race',
      home: 'Francesco Bagnaia',
      homeShort: 'Pecco Bagnaia [Ducati]',
      away: 'Marc Marquez',
      awayShort: 'M. Marquez [Gresini]',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '00:00 WIB',
      displayClock: '',
      homeScore: isPast ? '1st (Podium)' : '-',
      awayScore: isPast ? '2nd' : '-',
      wibTime: '00:00 WIB',
      venue: 'Lusail International Circuit, Doha',
      country: 'Qatar',
      hdp: 'H2H',
      ou: '22 Laps',
      odds: { home: '1.80', away: '2.00', over: '1.90', under: '1.90' }
    },

    // 14. Billiard/Snooker
    {
      sport: 'billiards',
      sportLabel: 'Billiard/Snooker',
      league: 'World Snooker Championship',
      home: 'Ronnie O\'Sullivan',
      homeShort: 'R. O\'Sullivan',
      away: 'Judd Trump',
      awayShort: 'J. Trump',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Frame 14 • Break 68',
      displayClock: isPast ? 'FT' : 'Frame 14',
      homeScore: 8,
      awayScore: 5,
      wibTime: '20:00 WIB',
      venue: 'Crucible Theatre, Sheffield',
      country: 'Inggris',
      hdp: '-2.5',
      ou: '21.5 (Frames)',
      odds: { home: '1.75', away: '2.10', over: '1.88', under: '1.92' }
    },

    // 15. Bola Voli (Volleyball)
    {
      sport: 'volleyball',
      sportLabel: 'Bola Voli',
      league: 'Proliga Indonesia - Putra',
      home: 'Jakarta LavAni Allo Bank',
      homeShort: 'Jakarta LavAni',
      away: 'Jakarta Bhayangkara Presisi',
      awayShort: 'Bhayangkara Presisi',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Set 4 • 21-19',
      displayClock: isPast ? 'FT' : 'Set 4',
      homeScore: 2,
      awayScore: 1,
      periodScores: [25, 23, 22, 21],
      wibTime: '18:00 WIB',
      venue: 'GOR Amongrogo, Yogyakarta',
      country: 'Indonesia',
      hdp: '-1.5',
      ou: '182.5',
      odds: { home: '1.70', away: '2.15', over: '1.85', under: '1.95' }
    },

    // 16. Futsal
    {
      sport: 'futsal',
      sportLabel: 'Futsal',
      league: 'Liga Futsal Profesional Indonesia',
      home: 'Bintang Timur Surabaya',
      homeShort: 'BTS Surabaya',
      away: 'Black Steel Papua',
      awayShort: 'Black Steel',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Babak 2 • 34\'',
      displayClock: isPast ? 'FT' : '34\'',
      homeScore: 4,
      awayScore: 3,
      wibTime: '14:00 WIB',
      venue: 'GOR Gelora Bung Tomo, Surabaya',
      country: 'Indonesia',
      hdp: '-0.5',
      ou: '6.5',
      odds: { home: '1.82', away: '2.02', draw: '4.50', over: '1.90', under: '1.90' },
      events: [
        { minute: "8'", type: 'goal', player: 'Singgih Romana', team: 'home', detail: 'Assist: Iqbal Iskandar' },
        { minute: "14'", type: 'goal', player: 'Evan Soumilena', team: 'away', detail: 'Tendangan Roket' },
        { minute: "16'", type: 'yellow_card', player: 'Pieter Marchelino', team: 'away', detail: 'Pelanggaran Keras' },
        { minute: "19'", type: 'goal', player: 'Samuel Eko', team: 'home', detail: 'Sepakan Kaki Kiri' },
        { minute: "22'", type: 'yellow_card', player: 'Rio Pangestu', team: 'home', detail: 'Pelanggaran Taktis' },
        { minute: "25'", type: 'goal', player: 'Henrique', team: 'away', detail: 'Assist: Ardiansyah Nur' },
        { minute: "27'", type: 'goal', player: 'Iqbal Iskandar', team: 'home', detail: 'Counter Attack Cepat' },
        { minute: "31'", type: 'goal', player: 'Ardiansyah Nur', team: 'away', detail: 'Second Penalty' },
        { minute: "33'", type: 'goal', player: 'Dieguinho', team: 'home', detail: 'Finishing Pivot' },
        { minute: "34'", type: 'yellow_card', player: 'Wendy Brian', team: 'away', detail: 'Pelanggaran' }
      ]
    },

    // 17. Rugbi (Rugby)
    {
      sport: 'rugby',
      sportLabel: 'Rugbi',
      league: 'Six Nations Championship',
      home: 'England Rugby',
      homeShort: 'England',
      away: 'France Rugby',
      awayShort: 'France',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '21:45 WIB',
      displayClock: '',
      homeScore: isPast ? 24 : 0,
      awayScore: isPast ? 21 : 0,
      wibTime: '21:45 WIB',
      venue: 'Twickenham Stadium, London',
      country: 'Inggris',
      hdp: '+3.5',
      ou: '42.5',
      odds: { home: '2.05', away: '1.80', over: '1.90', under: '1.90' }
    },

    // 18. Golf
    {
      sport: 'golf',
      sportLabel: 'Golf',
      league: 'The Masters Tournament - Round 4',
      home: 'Scottie Scheffler',
      homeShort: 'S. Scheffler',
      away: 'Rory McIlroy',
      awayShort: 'R. McIlroy',
      status: isPast ? 'FINISHED' : 'LIVE',
      statusDetail: isPast ? 'FT (Selesai)' : 'Hole 14 • Par 4',
      displayClock: isPast ? 'FT' : 'Hole 14',
      homeScore: '-11',
      awayScore: '-9',
      wibTime: '23:00 WIB',
      venue: 'Augusta National Golf Club, Georgia',
      country: 'Amerika Serikat',
      hdp: '-1.5',
      ou: 'H2H',
      odds: { home: '1.75', away: '2.10', over: '1.90', under: '1.90' }
    },

    // 19. Bola Tangan (Handball)
    {
      sport: 'handball',
      sportLabel: 'Bola Tangan',
      league: 'EHF Champions League',
      home: 'Barca Handbol',
      homeShort: 'Barca',
      away: 'THW Kiel',
      awayShort: 'THW Kiel',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '01:45 WIB',
      displayClock: '',
      homeScore: isPast ? 31 : 0,
      awayScore: isPast ? 29 : 0,
      wibTime: '01:45 WIB',
      venue: 'Palau Blaugrana, Barcelona',
      country: 'Spanyol',
      hdp: '-2.5',
      ou: '61.5',
      odds: { home: '1.72', away: '2.20', over: '1.88', under: '1.92' }
    },

    // 20. Polo Air (Water Polo)
    {
      sport: 'water_polo',
      sportLabel: 'Polo Air',
      league: 'World Aquatics Water Polo World Cup',
      home: 'Hungaria Water Polo',
      homeShort: 'Hungaria',
      away: 'Italia Water Polo',
      awayShort: 'Italia',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '20:30 WIB',
      displayClock: '',
      homeScore: isPast ? 12 : 0,
      awayScore: isPast ? 11 : 0,
      wibTime: '20:30 WIB',
      venue: 'Alfre Hajos Swimming Stadium, Budapest',
      country: 'Hungaria',
      hdp: '-0.5',
      ou: '21.5',
      odds: { home: '1.80', away: '2.05', over: '1.90', under: '1.90' }
    },

    // 21. Aussie Rules Football
    {
      sport: 'aussie_rules',
      sportLabel: 'Aussie Rules Football',
      league: 'AFL (Australian Football League)',
      home: 'Collingwood Magpies',
      homeShort: 'Collingwood',
      away: 'Brisbane Lions',
      awayShort: 'Brisbane',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '16:20 WIB',
      displayClock: '',
      homeScore: isPast ? 86 : 0,
      awayScore: isPast ? 78 : 0,
      wibTime: '16:20 WIB',
      venue: 'Melbourne Cricket Ground (MCG)',
      country: 'Australia',
      hdp: '-8.5',
      ou: '164.5',
      odds: { home: '1.82', away: '1.98', over: '1.90', under: '1.90' }
    },

    // 22. Hoki Lapangan (Field Hockey)
    {
      sport: 'field_hockey',
      sportLabel: 'Hoki Lapangan',
      league: 'FIH Hockey Pro League Men',
      home: 'Belgia Red Lions',
      homeShort: 'Belgia',
      away: 'Belanda Hockey Team',
      awayShort: 'Belanda',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '22:30 WIB',
      displayClock: '',
      homeScore: isPast ? 3 : 0,
      awayScore: isPast ? 2 : 0,
      wibTime: '22:30 WIB',
      venue: 'Wilrijkse Plein, Antwerpen',
      country: 'Belgia',
      hdp: '0.0',
      ou: '4.5',
      odds: { home: '2.10', away: '1.78', draw: '4.20', over: '1.85', under: '1.95' }
    },

    // 23. Spesial (Special Markets)
    {
      sport: 'specials',
      sportLabel: 'Spesial',
      league: 'SBOBET Entertainment & Awards Market',
      home: 'Ballon d\'Or 2026 Winner (Top Favorite)',
      homeShort: 'Vinicius Jr / Rodri',
      away: 'Next Ballon d\'Or Challenger',
      awayShort: 'K. Mbappe / Bellingham',
      status: 'SCHEDULED',
      statusDetail: 'Pasaran Spesial Dibuka',
      displayClock: '',
      homeScore: '-',
      awayScore: '-',
      wibTime: '23:59 WIB',
      venue: 'Theatre du Chatelet, Paris',
      country: 'Prancis',
      hdp: 'H2H Winner',
      ou: 'Outright',
      odds: { home: '1.55', away: '2.50', over: '1.90', under: '1.90' }
    },

    // 24. Lainnya (Other Sports)
    {
      sport: 'other',
      sportLabel: 'Lainnya',
      league: 'Gaelic Athletic Association (GAA) Football',
      home: 'Dublin GAA',
      homeShort: 'Dublin',
      away: 'Kerry GAA',
      awayShort: 'Kerry',
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      statusDetail: isPast ? 'FT (Selesai)' : '21:00 WIB',
      displayClock: '',
      homeScore: isPast ? '1-15 (18)' : 0,
      awayScore: isPast ? '1-13 (16)' : 0,
      wibTime: '21:00 WIB',
      venue: 'Croke Park, Dublin',
      country: 'Irlandia',
      hdp: '-1.5',
      ou: '33.5',
      odds: { home: '1.85', away: '1.95', over: '1.90', under: '1.90' }
    }
  ];

  return specialties.map((item, idx) => ({
    id: `sbobet-spec-${item.sport}-${queryDate}-${idx}`,
    sport: item.sport,
    sportLabel: item.sportLabel,
    league: item.league,
    leagueCode: item.sport,
    country: item.country,
    homeTeam: {
      name: item.home,
      shortName: item.homeShort,
      score: item.homeScore,
      periodScores: item.periodScores
    },
    awayTeam: {
      name: item.away,
      shortName: item.awayShort,
      score: item.awayScore,
      periodScores: item.periodScores
    },
    status: item.status,
    statusDetail: item.statusDetail,
    displayClock: item.displayClock,
    kickoffWib: item.wibTime,
    rawUtcDate: `${queryDate.slice(0, 4)}-${queryDate.slice(4, 6)}-${queryDate.slice(6, 8)}T12:00:00.000Z`,
    wibTime: item.wibTime,
    wibDate: `${queryDate.slice(0, 4)}-${queryDate.slice(4, 6)}-${queryDate.slice(6, 8)}`,
    venue: item.venue,
    events: ((item as any).events || []).map((e: any) => ({
      type: e.type,
      minute: e.minute,
      player: e.player,
      team: e.team,
      detail: e.detail,
      cardType: e.type === 'yellow_card' ? 'yellow' : e.type === 'red_card' ? 'red' : undefined
    })),
    sbobetOdds: {
      handicap: item.hdp,
      homeOdds: item.odds.home,
      awayOdds: item.odds.away,
      drawOdds: item.odds.draw,
      overUnder: item.ou,
      overOdds: item.odds.over,
      underOdds: item.odds.under
    }
  }));
}
