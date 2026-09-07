import { LiveMatch, MatchEventItem } from '../types';

export interface SbobetFixtureDef {
  id: string;
  sportLabel: string;
  league: string;
  leagueCode: string;
  leagueLogo: string;
  country: string;
  region: 'england' | 'europe' | 'latin_america' | 'asia' | 'other';
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
  dateStr: string; // YYYYMMDD e.g. "20260907"
  wibDate: string; // e.g. "Senin, 07 September 2026"
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

export const SBOBET_ALL_WORLD_FIXTURES: SbobetFixtureDef[] = [
  // =========================================================================
  // 1. LIGA PRO UZBEKISTAN & UZBEKISTAN SUPER LEAGUE (UZBEKISTAN - ASIA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-uzb-pro-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Pro Uzbekistan (Uzbekistan Pro League)',
    leagueCode: 'uzb.pro',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/300px-Flag_of_Uzbekistan.svg.png',
    country: 'Uzbekistan',
    region: 'asia',
    homeTeam: {
      name: 'Mashʼal Mubarek',
      shortName: 'Mashʼal',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 2 • 8W-3D-2L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Kokand 1912',
      shortName: 'Kokand 1912',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 4 • 7W-2D-4L',
      form: ['D', 'W', 'L']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Bahrom Vafoev Stadium, Mubarek',
    isBigMatch: true,
    events: [
      { minute: "24'", type: 'goal', player: 'Islom Sharipov', team: 'home', detail: 'Assist: Bobur Farkhodov' },
      { minute: "53'", type: 'yellow_card', player: 'Abror Toshkuziev', team: 'away' },
      { minute: "68'", type: 'goal', player: 'Anvar Khosimov', team: 'away', detail: 'Tendangan Sudut' },
      { minute: "82'", type: 'goal', player: 'Michael Okoro', team: 'home', detail: 'Sepakan Kaki Kanan' }
    ]
  },
  {
    id: 'sbobet-uzb-pro-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Liga Pro Uzbekistan (Uzbekistan Pro League)',
    leagueCode: 'uzb.pro',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/300px-Flag_of_Uzbekistan.svg.png',
    country: 'Uzbekistan',
    region: 'asia',
    homeTeam: {
      name: 'Shurtan Guzar',
      shortName: 'Shurtan',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 5 • 6W-4D-3L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Aral Nukus',
      shortName: 'Aral Nukus',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 7 • 4W-3D-6L',
      form: ['L', 'D', 'L']
    },
    kickoffHour: 19,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'G\'uzor Stadium, Qashqadaryo',
    events: [
      { minute: "31'", type: 'goal', player: 'Jasur Khasanov', team: 'home' }
    ]
  },
  {
    id: 'sbobet-uzb-super-20260907-3',
    sportLabel: 'Sepak Bola',
    league: 'Uzbekistan Super League',
    leagueCode: 'uzb.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/300px-Flag_of_Uzbekistan.svg.png',
    country: 'Uzbekistan',
    region: 'asia',
    homeTeam: {
      name: 'Pakhtakor Tashkent',
      shortName: 'Pakhtakor',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 1 • 11W-2D-1L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'Navbahor Namangan',
      shortName: 'Navbahor',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 3 • 9W-3D-2L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 20,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Pakhtakor Central Stadium, Tashkent',
    isBigMatch: true
  },
  // Sunday, 06 September 2026 (Yesterday - Finished)
  {
    id: 'sbobet-uzb-pro-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Pro Uzbekistan (Uzbekistan Pro League)',
    leagueCode: 'uzb.pro',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/300px-Flag_of_Uzbekistan.svg.png',
    country: 'Uzbekistan',
    region: 'asia',
    homeTeam: {
      name: 'Lokomotiv Tashkent B',
      shortName: 'Lokomotiv B',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '5W-2D-6L',
      form: ['L', 'D', 'W']
    },
    awayTeam: {
      name: 'Dinamo Samarqand',
      shortName: 'Dinamo',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '8W-3D-2L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 17,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Lokomotiv Stadium, Tashkent',
    fixedFinalScore: { home: 1, away: 2 },
    events: [
      { minute: "15'", type: 'goal', player: 'Joel Kojo', team: 'away' },
      { minute: "49'", type: 'goal', player: 'Farrukh Mukhtarov', team: 'home' },
      { minute: "78'", type: 'goal', player: 'Francis Narh', team: 'away' }
    ]
  },

  // =========================================================================
  // 2. PARAGUAY PRIMERA DIVISION RESERVE LEAGUE & PRIMERA (LATIN AMERICA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-par-res-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Paraguay Primera Division Reserve League',
    leagueCode: 'par.reserva',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/300px-Flag_of_Paraguay.svg.png',
    country: 'Paraguay',
    region: 'latin_america',
    homeTeam: {
      name: 'Club Olimpia Asunción Reserves',
      shortName: 'Olimpia Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1785.png',
      record: 'Peringkat 1 • 7W-2D-1L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Cerro Porteño Reserves',
      shortName: 'Cerro Porteño Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1782.png',
      record: 'Peringkat 2 • 6W-3D-1L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 17,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estadio Manuel Ferreira, Asunción',
    isBigMatch: true,
    events: [
      { minute: "16'", type: 'goal', player: 'Kevin Parzajuk', team: 'home', detail: 'Assist: Hugo Benitez' },
      { minute: "42'", type: 'goal', player: 'Tobias Portillo', team: 'away', detail: 'Penalti' },
      { minute: "69'", type: 'goal', player: 'Facundo Bruera Jr', team: 'home', detail: 'Sundulan Kepala' },
      { minute: "74'", type: 'yellow_card', player: 'Ronaldo Dejesus', team: 'away' }
    ]
  },
  {
    id: 'sbobet-par-res-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Paraguay Primera Division Reserve League',
    leagueCode: 'par.reserva',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/300px-Flag_of_Paraguay.svg.png',
    country: 'Paraguay',
    region: 'latin_america',
    homeTeam: {
      name: 'Club Libertad Reserves',
      shortName: 'Libertad Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1783.png',
      record: 'Peringkat 3 • 6W-2D-2L',
      form: ['D', 'W', 'W']
    },
    awayTeam: {
      name: 'Club Guaraní Reserves',
      shortName: 'Guaraní Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1784.png',
      record: 'Peringkat 5 • 4W-4D-2L',
      form: ['D', 'L', 'W']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estadio Tigo La Huerta, Asunción',
    events: [
      { minute: "27'", type: 'goal', player: 'Rodrigo Villalba', team: 'home' }
    ]
  },
  {
    id: 'sbobet-par-res-20260907-3',
    sportLabel: 'Sepak Bola',
    league: 'Paraguay Primera Division Reserve League',
    leagueCode: 'par.reserva',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/300px-Flag_of_Paraguay.svg.png',
    country: 'Paraguay',
    region: 'latin_america',
    homeTeam: {
      name: 'Tacuary FBC Reserves',
      shortName: 'Tacuary Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 9 • 2W-3D-5L',
      form: ['L', 'L', 'D']
    },
    awayTeam: {
      name: 'Nacional Asunción Reserves',
      shortName: 'Nacional Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1787.png',
      record: 'Peringkat 6 • 4W-2D-4L',
      form: ['W', 'D', 'L']
    },
    kickoffHour: 21,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estadio Toribio Vargas, Asunción'
  },
  // Sunday, 06 September 2026 (Yesterday - Finished)
  {
    id: 'sbobet-par-res-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'Paraguay Primera Division Reserve League',
    leagueCode: 'par.reserva',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/300px-Flag_of_Paraguay.svg.png',
    country: 'Paraguay',
    region: 'latin_america',
    homeTeam: {
      name: 'Sportivo Luqueño Reserves',
      shortName: 'Sp. Luqueño Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1786.png',
      record: '3W-3D-4L',
      form: ['W', 'L', 'D']
    },
    awayTeam: {
      name: 'Sol de América Reserves',
      shortName: 'Sol de América Res.',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1788.png',
      record: '2W-4D-4L',
      form: ['L', 'D', 'D']
    },
    kickoffHour: 16,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Estadio Feliciano Cáceres, Luque',
    fixedFinalScore: { home: 3, away: 1 },
    events: [
      { minute: "12'", type: 'goal', player: 'Marcelo Perez Jr', team: 'home' },
      { minute: "34'", type: 'goal', player: 'Derlis Alegre', team: 'home' },
      { minute: "59'", type: 'goal', player: 'Franco Aragon', team: 'away' },
      { minute: "81'", type: 'goal', player: 'Diego Fernandez', team: 'home' }
    ]
  },

  // =========================================================================
  // 3. ALLSVENSKAN SWEDIA (SWEDISH ALLSVENSKAN - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-swe-allsvenskan-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Allsvenskan Swedia (Swedish Allsvenskan)',
    leagueCode: 'swe.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Allsvenskan_logo.svg/300px-Allsvenskan_logo.svg.png',
    country: 'Sweden',
    region: 'europe',
    homeTeam: {
      name: 'Malmö FF',
      shortName: 'Malmö',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/328.png',
      record: 'Peringkat 1 • 14W-4D-2L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'AIK Stockholm',
      shortName: 'AIK',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/322.png',
      record: 'Peringkat 3 • 11W-4D-5L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 20,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Eleda Stadion, Malmö',
    isBigMatch: true,
    events: [
      { minute: "21'", type: 'goal', player: 'Isaac Kiese Thelin', team: 'home', detail: 'Assist: Sebastian Nanasi' },
      { minute: "48'", type: 'yellow_card', player: 'Sotirios Papagiannopoulos', team: 'away' },
      { minute: "64'", type: 'goal', player: 'Ioannis Pittas', team: 'away', detail: 'Sepakan Kaki Kanan' },
      { minute: "79'", type: 'goal', player: 'Anders Christiansen', team: 'home', detail: 'Tendangan Bebas Spektakuler' }
    ]
  },
  {
    id: 'sbobet-swe-allsvenskan-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Allsvenskan Swedia (Swedish Allsvenskan)',
    leagueCode: 'swe.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Allsvenskan_logo.svg/300px-Allsvenskan_logo.svg.png',
    country: 'Sweden',
    region: 'europe',
    homeTeam: {
      name: 'Djurgårdens IF',
      shortName: 'Djurgården',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/325.png',
      record: 'Peringkat 2 • 12W-3D-5L',
      form: ['W', 'W', 'L']
    },
    awayTeam: {
      name: 'IFK Göteborg',
      shortName: 'IFK Göteborg',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/326.png',
      record: 'Peringkat 11 • 6W-5D-9L',
      form: ['D', 'L', 'W']
    },
    kickoffHour: 20,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Tele2 Arena, Stockholm',
    isBigMatch: true
  },
  {
    id: 'sbobet-swe-allsvenskan-20260907-3',
    sportLabel: 'Sepak Bola',
    league: 'Allsvenskan Swedia (Swedish Allsvenskan)',
    leagueCode: 'swe.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Allsvenskan_logo.svg/300px-Allsvenskan_logo.svg.png',
    country: 'Sweden',
    region: 'europe',
    homeTeam: {
      name: 'BK Häcken',
      shortName: 'BK Häcken',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/324.png',
      record: 'Peringkat 5 • 9W-4D-7L',
      form: ['W', 'D', 'L']
    },
    awayTeam: {
      name: 'Hammarby IF',
      shortName: 'Hammarby',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/327.png',
      record: 'Peringkat 4 • 10W-3D-7L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 20,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Bravida Arena, Gothenburg'
  },

  // =========================================================================
  // 4. LIGA SUPER DENMARK (DANISH SUPERLIGA - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-den-superliga-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Super Denmark (Danish Superliga)',
    leagueCode: 'den.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Danish_Superliga_logo.svg/300px-Danish_Superliga_logo.svg.png',
    country: 'Denmark',
    region: 'europe',
    homeTeam: {
      name: 'FC Copenhagen',
      shortName: 'København',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/494.png',
      record: 'Peringkat 1 • 6W-1D-1L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Brøndby IF',
      shortName: 'Brøndby',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/491.png',
      record: 'Peringkat 3 • 5W-2D-1L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 21,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Parken Stadium, Copenhagen',
    isBigMatch: true,
    events: [
      { minute: "29'", type: 'goal', player: 'Orri Óskarsson', team: 'home', detail: 'Assist: Mohamed Elyounoussi' },
      { minute: "58'", type: 'goal', player: 'Yuito Suzuki', team: 'away', detail: 'Penalti' }
    ]
  },
  {
    id: 'sbobet-den-superliga-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Liga Super Denmark (Danish Superliga)',
    leagueCode: 'den.1',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Danish_Superliga_logo.svg/300px-Danish_Superliga_logo.svg.png',
    country: 'Denmark',
    region: 'europe',
    homeTeam: {
      name: 'FC Midtjylland',
      shortName: 'Midtjylland',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/492.png',
      record: 'Peringkat 2 • 5W-3D-0L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'AGF Aarhus',
      shortName: 'AGF',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/490.png',
      record: 'Peringkat 4 • 4W-3D-1L',
      form: ['D', 'W', 'D']
    },
    kickoffHour: 23,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'MCH Arena, Herning',
    isBigMatch: true
  },

  // =========================================================================
  // 5. LIGA PORTUGAL (PRIMEIRA LIGA & LIGA PORTUGAL 2 - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-por-liga-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Portugal (Primeira Liga)',
    leagueCode: 'por.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2282.png',
    country: 'Portugal',
    region: 'europe',
    homeTeam: {
      name: 'Sporting CP',
      shortName: 'Sporting',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/438.png',
      record: 'Juara Bertahan • 4W-0D-0L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'FC Porto',
      shortName: 'Porto',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/437.png',
      record: 'Peringkat 2 • 3W-1D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 22,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estádio José Alvalade, Lisbon',
    isBigMatch: true,
    events: [
      { minute: "35'", type: 'goal', player: 'Viktor Gyökeres', team: 'home', detail: 'Tendangan Keras Kaki Kanan' },
      { minute: "52'", type: 'yellow_card', player: 'Alan Varela', team: 'away' },
      { minute: "73'", type: 'goal', player: 'Galeno', team: 'away', detail: 'Penalti' },
      { minute: "88'", type: 'goal', player: 'Pedro Gonçalves', team: 'home', detail: 'Assist: Daniel Bragança' }
    ]
  },
  {
    id: 'sbobet-por-liga-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Liga Portugal (Primeira Liga)',
    leagueCode: 'por.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2282.png',
    country: 'Portugal',
    region: 'europe',
    homeTeam: {
      name: 'SL Benfica',
      shortName: 'Benfica',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/436.png',
      record: 'Peringkat 3 • 3W-0D-1L',
      form: ['W', 'L', 'W']
    },
    awayTeam: {
      name: 'SC Braga',
      shortName: 'Braga',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1792.png',
      record: 'Peringkat 4 • 2W-2D-0L',
      form: ['W', 'D', 'W']
    },
    kickoffHour: 23,
    kickoffMinute: 15,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estádio da Luz, Lisbon',
    isBigMatch: true
  },

  // =========================================================================
  // 6. LIGA SUPER TURKI (TURKISH SÜPER LIG - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-tur-superlig-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Super Turki (Turkish Süper Lig)',
    leagueCode: 'tur.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2283.png',
    country: 'Turkey',
    region: 'europe',
    homeTeam: {
      name: 'Galatasaray SK',
      shortName: 'Galatasaray',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/449.png',
      record: 'Juara Bertahan • 3W-0D-0L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'Beşiktaş JK',
      shortName: 'Beşiktaş',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/448.png',
      record: 'Peringkat 2 • 3W-0D-0L',
      form: ['W', 'W', 'W']
    },
    kickoffHour: 21,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Rams Park Stadium, Istanbul',
    isBigMatch: true,
    events: [
      { minute: "14'", type: 'goal', player: 'Mauro Icardi', team: 'home', detail: 'Sundulan Kepala' },
      { minute: "40'", type: 'goal', player: 'Ciro Immobile', team: 'away', detail: 'Penalti' },
      { minute: "67'", type: 'goal', player: 'Barış Alper Yılmaz', team: 'home', detail: 'Sepakan Kaki Kiri' }
    ]
  },
  {
    id: 'sbobet-tur-superlig-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Liga Super Turki (Turkish Süper Lig)',
    leagueCode: 'tur.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2283.png',
    country: 'Turkey',
    region: 'europe',
    homeTeam: {
      name: 'Fenerbahçe SK',
      shortName: 'Fenerbahçe',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/450.png',
      record: 'Peringkat 3 • 2W-1D-0L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Trabzonspor',
      shortName: 'Trabzonspor',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/451.png',
      record: 'Peringkat 5 • 1W-2D-0L',
      form: ['D', 'D', 'W']
    },
    kickoffHour: 23,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Şükrü Saracoğlu Stadium, Istanbul',
    isBigMatch: true
  },

  // =========================================================================
  // 7. FRANCE LIGUE 2 (FRANCIS - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-fra-ligue2-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'France Ligue 2',
    leagueCode: 'fra.2',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ligue_2_BKT_logo_2024.svg/300px-Ligue_2_BKT_logo_2024.svg.png',
    country: 'France',
    region: 'europe',
    homeTeam: {
      name: 'FC Metz',
      shortName: 'Metz',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/171.png',
      record: 'Peringkat 1 • 3W-1D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'FC Lorient',
      shortName: 'Lorient',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/273.png',
      record: 'Peringkat 3 • 2W-2D-0L',
      form: ['W', 'D', 'D']
    },
    kickoffHour: 21,
    kickoffMinute: 45,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stade Saint-Symphorien, Longeville-lès-Metz',
    isBigMatch: true,
    events: [
      { minute: "32'", type: 'goal', player: 'Cheikh Sabaly', team: 'home' },
      { minute: "66'", type: 'yellow_card', player: 'Laurent Abergel', team: 'away' }
    ]
  },
  {
    id: 'sbobet-fra-ligue2-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'France Ligue 2',
    leagueCode: 'fra.2',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ligue_2_BKT_logo_2024.svg/300px-Ligue_2_BKT_logo_2024.svg.png',
    country: 'France',
    region: 'europe',
    homeTeam: {
      name: 'Paris FC',
      shortName: 'Paris FC',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/3932.png',
      record: 'Peringkat 2 • 3W-0D-1L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'Clermont Foot 63',
      shortName: 'Clermont',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/3474.png',
      record: 'Peringkat 6 • 2W-1D-1L',
      form: ['L', 'W', 'D']
    },
    kickoffHour: 23,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stade Charléty, Paris'
  },

  // =========================================================================
  // 8. LIGA SERIE B ITALIA (ITALIAN SERIE B - EROPA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-ita-serieb-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Liga Serie B Italia (Italian Serie B)',
    leagueCode: 'ita.2',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Serie_B_logo.svg/300px-Serie_B_logo.svg.png',
    country: 'Italy',
    region: 'europe',
    homeTeam: {
      name: 'US Sassuolo Calcio',
      shortName: 'Sassuolo',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2855.png',
      record: 'Peringkat 1 • 3W-1D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Salernitana 1919',
      shortName: 'Salernitana',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/3815.png',
      record: 'Peringkat 4 • 2W-1D-1L',
      form: ['W', 'L', 'W']
    },
    kickoffHour: 21,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Mapei Stadium, Reggio Emilia',
    isBigMatch: true,
    events: [
      { minute: "19'", type: 'goal', player: 'Armand Laurienté', team: 'home', detail: 'Assist: Kristian Thorstvedt' },
      { minute: "54'", type: 'goal', player: 'Simy', team: 'away', detail: 'Sundulan Kepala' },
      { minute: "78'", type: 'goal', player: 'Samuele Mulattieri', team: 'home', detail: 'Sepakan Kaki Kanan' }
    ]
  },
  {
    id: 'sbobet-ita-serieb-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'Liga Serie B Italia (Italian Serie B)',
    leagueCode: 'ita.2',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Serie_B_logo.svg/300px-Serie_B_logo.svg.png',
    country: 'Italy',
    region: 'europe',
    homeTeam: {
      name: 'Palermo FC',
      shortName: 'Palermo',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/109.png',
      record: 'Peringkat 3 • 2W-2D-0L',
      form: ['D', 'W', 'W']
    },
    awayTeam: {
      name: 'UC Sampdoria',
      shortName: 'Sampdoria',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/111.png',
      record: 'Peringkat 5 • 2W-1D-1L',
      form: ['W', 'D', 'L']
    },
    kickoffHour: 23,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stadio Renzo Barbera, Palermo',
    isBigMatch: true
  },

  // =========================================================================
  // 9. CAMBODIAN PREMIER LEAGUE (CPL - ASIA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-khm-cpl-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League (CPL)',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Preah_Khan_Reach_Svay_Rieng_FC_logo.svg/300px-Preah_Khan_Reach_Svay_Rieng_FC_logo.svg.png',
    country: 'Cambodia',
    region: 'asia',
    homeTeam: {
      name: 'Phnom Penh Crown FC',
      shortName: 'Phnom Penh Crown',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 2 • 1W-1D-0L',
      form: ['D', 'W', 'W']
    },
    awayTeam: {
      name: 'Angkor Tiger FC',
      shortName: 'Angkor Tiger',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 6 • 0W-2D-0L',
      form: ['D', 'D', 'L']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Smart RSN Stadium, Phnom Penh',
    isBigMatch: true,
    events: [
      { minute: "23'", type: 'goal', player: 'Lim Pisoth', team: 'home', detail: 'Assist: Shintaro Shimizu' },
      { minute: "67'", type: 'goal', player: 'Kodai Nagashima', team: 'away', detail: 'Tendangan Bebas' }
    ]
  },
  // Sunday, 06 September 2026 (Yesterday - Finished)
  {
    id: 'sbobet-khm-cpl-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League (CPL)',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Preah_Khan_Reach_Svay_Rieng_FC_logo.svg/300px-Preah_Khan_Reach_Svay_Rieng_FC_logo.svg.png',
    country: 'Cambodia',
    region: 'asia',
    homeTeam: {
      name: 'Kirivong Sok Sen Chey FC',
      shortName: 'Kirivong',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-0D-1L',
      form: ['L', 'D', 'L']
    },
    awayTeam: {
      name: 'Preah Khan Reach Svay Rieng FC',
      shortName: 'Svay Rieng',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '1W-0D-0L',
      form: ['W', 'W', 'W']
    },
    kickoffHour: 15,
    kickoffMinute: 45,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Takeo Provincial Stadium, Takeo',
    isBigMatch: true,
    fixedFinalScore: { home: 1, away: 2 },
    events: [
      { minute: "19'", type: 'goal', player: 'Bounphachan Bounkong', team: 'away' },
      { minute: "38'", type: 'goal', player: 'Jose Elmer', team: 'home' },
      { minute: "62'", type: 'goal', player: 'Gabriel Silva', team: 'away' }
    ]
  },
  {
    id: 'sbobet-khm-cpl-20260906-2',
    sportLabel: 'Sepak Bola',
    league: 'Cambodian Premier League (CPL)',
    leagueCode: 'khm.cpl',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Preah_Khan_Reach_Svay_Rieng_FC_logo.svg/300px-Preah_Khan_Reach_Svay_Rieng_FC_logo.svg.png',
    country: 'Cambodia',
    region: 'asia',
    homeTeam: {
      name: 'Royal Cambodian Armed Forces FC',
      shortName: 'Tiffy Army',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'D', 'L']
    },
    awayTeam: {
      name: 'Visakha FC',
      shortName: 'Visakha',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: '0W-1D-0L',
      form: ['D', 'W', 'D']
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'RCAF Old Stadium, Phnom Penh',
    isBigMatch: true,
    fixedFinalScore: { home: 1, away: 1 },
    events: [
      { minute: "34'", type: 'goal', player: 'Phan Sophen', team: 'home' },
      { minute: "78'", type: 'goal', player: 'Ramon', team: 'away' }
    ]
  },

  // =========================================================================
  // 10. BRI LIGA 1 & PEGADAIAN LIGA 2 INDONESIA (INDONESIA - ASIA)
  // =========================================================================
  // Monday, 07 September 2026 (Today)
  {
    id: 'sbobet-idn-liga1-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Persib Bandung',
      shortName: 'Persib',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11087.png',
      record: 'Juara Bertahan • 1W-0D-0L',
      form: ['W', 'W', 'W']
    },
    awayTeam: {
      name: 'PSM Makassar',
      shortName: 'PSM',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11091.png',
      record: 'Peringkat 4 • 0W-1D-0L',
      form: ['D', 'W', 'W']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
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
    id: 'sbobet-idn-liga1-20260907-2',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Borneo FC Samarinda',
      shortName: 'Borneo FC',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17798.png',
      record: 'Peringkat 2 • 1W-0D-0L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Persija Jakarta',
      shortName: 'Persija',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11088.png',
      record: 'Peringkat 3 • 1W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stadion Segiri, Samarinda',
    isBigMatch: true,
    events: [
      { minute: "38'", type: 'goal', player: 'Gustavo Almeida', team: 'away', detail: 'Penalti' },
      { minute: "72'", type: 'goal', player: 'Leo Gaucho', team: 'home', detail: 'Sepakan Kaki Kanan' }
    ]
  },
  {
    id: 'sbobet-idn-liga2-20260907-3',
    sportLabel: 'Sepak Bola',
    league: 'Pegadaian Liga 2 Indonesia',
    leagueCode: 'idn.2',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Sriwijaya FC',
      shortName: 'Sriwijaya',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11095.png',
      record: 'Peringkat 2 • 1W-0D-0L',
      form: ['W', 'D', 'L']
    },
    awayTeam: {
      name: 'PSMS Medan',
      shortName: 'PSMS Medan',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11092.png',
      record: 'Peringkat 3 • 0W-1D-0L',
      form: ['D', 'W', 'W']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stadion Gelora Sriwijaya Jakabaring, Palembang',
    events: [
      { minute: "31'", type: 'goal', player: 'Chencho Gyeltshen', team: 'home' },
      { minute: "68'", type: 'goal', player: 'Jacinto Cabral', team: 'away' }
    ]
  },
  {
    id: 'sbobet-idn-liga2-20260907-4',
    sportLabel: 'Sepak Bola',
    league: 'Pegadaian Liga 2 Indonesia',
    leagueCode: 'idn.2',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Persela Lamongan',
      shortName: 'Persela',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11089.png',
      record: 'Peringkat 1 • 1W-0D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Deltras Sidoarjo',
      shortName: 'Deltras',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 4 • 0W-0D-1L',
      form: ['L', 'W', 'L']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Stadion Surajaya, Lamongan',
    events: [
      { minute: "44'", type: 'goal', player: 'Ezechiel Ndouasel', team: 'home', detail: 'Sundulan Kepala' }
    ]
  },
  // Sunday, 06 September 2026 (Yesterday - Finished)
  {
    id: 'sbobet-idn-liga1-20260906-1',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Persik Kediri',
      shortName: 'Persik',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19089.png',
      record: '0W-1D-0L',
      form: ['D', 'D', 'L']
    },
    awayTeam: {
      name: 'Dewa United FC',
      shortName: 'Dewa United',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20349.png',
      record: '0W-1D-0L',
      form: ['D', 'W', 'D']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion Brawijaya, Kediri',
    fixedFinalScore: { home: 1, away: 1 },
    events: [
      { minute: "22'", type: 'goal', player: 'Ramiro Fergonzi', team: 'home' },
      { minute: "54'", type: 'goal', player: 'Alex Martins', team: 'away' }
    ]
  },
  {
    id: 'sbobet-idn-liga1-20260906-2',
    sportLabel: 'Sepak Bola',
    league: 'BRI Liga 1 Indonesia',
    leagueCode: 'idn.1',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Bhayangkara Presisi FC',
      shortName: 'Bhayangkara FC',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17799.png',
      record: '0W-0D-1L',
      form: ['L', 'D', 'W']
    },
    awayTeam: {
      name: 'Persebaya Surabaya',
      shortName: 'Persebaya',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/11090.png',
      record: '1W-0D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 15,
    kickoffMinute: 30,
    dateStr: '20260906',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Stadion PTIK, Jakarta Selatan',
    fixedFinalScore: { home: 0, away: 1 },
    events: [
      { minute: "33'", type: 'goal', player: 'Bruno Moreira', team: 'away', detail: 'Penalti' }
    ]
  },

  // =========================================================================
  // 11. SPANISH LALIGA 2 (SEGUNDA DIVISION - EROPA)
  // =========================================================================
  {
    id: 'sbobet-esp-laliga2-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'Spanish LALIGA 2 (Segunda División)',
    leagueCode: 'esp.2',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2324.png',
    country: 'Spain',
    region: 'europe',
    homeTeam: {
      name: 'Deportivo La Coruña',
      shortName: 'Deportivo',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/91.png',
      record: 'Peringkat 4 • 2W-1D-0L',
      form: ['W', 'D', 'W']
    },
    awayTeam: {
      name: 'Real Zaragoza',
      shortName: 'Zaragoza',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/98.png',
      record: 'Peringkat 2 • 2W-1D-0L',
      form: ['W', 'W', 'D']
    },
    kickoffHour: 21,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Estadio Abanca-Riazor, A Coruña',
    isBigMatch: true,
    events: [
      { minute: "28'", type: 'goal', player: 'Lucas Pérez', team: 'home', detail: 'Tendangan Bebas' },
      { minute: "62'", type: 'goal', player: 'Mario Soberón', team: 'away' }
    ]
  },

  // =========================================================================
  // 12. GERMAN 2. BUNDESLIGA (JERMAN - EROPA)
  // =========================================================================
  {
    id: 'sbobet-ger-bundesliga2-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'German 2. Bundesliga',
    leagueCode: 'ger.2',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2316.png',
    country: 'Germany',
    region: 'europe',
    homeTeam: {
      name: 'Hamburger SV',
      shortName: 'Hamburg',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/129.png',
      record: 'Peringkat 2 • 3W-1D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Hertha BSC',
      shortName: 'Hertha',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/130.png',
      record: 'Peringkat 5 • 2W-1D-1L',
      form: ['L', 'W', 'W']
    },
    kickoffHour: 23,
    kickoffMinute: 30,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Volksparkstadion, Hamburg',
    isBigMatch: true
  },

  // =========================================================================
  // 13. ENGLISH LEAGUE CHAMPIONSHIP (INGGRIS - ENGLAND)
  // =========================================================================
  {
    id: 'sbobet-eng-championship-20260907-1',
    sportLabel: 'Sepak Bola',
    league: 'English League Championship',
    leagueCode: 'eng.2',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
    country: 'England',
    region: 'england',
    homeTeam: {
      name: 'Leeds United',
      shortName: 'Leeds',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/357.png',
      record: 'Peringkat 2 • 3W-1D-0L',
      form: ['W', 'W', 'D']
    },
    awayTeam: {
      name: 'Burnley FC',
      shortName: 'Burnley',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/379.png',
      record: 'Peringkat 4 • 2W-2D-0L',
      form: ['D', 'W', 'W']
    },
    kickoffHour: 22,
    kickoffMinute: 0,
    dateStr: '20260907',
    wibDate: 'Senin, 07 September 2026',
    venue: 'Elland Road, Leeds',
    isBigMatch: true,
    events: [
      { minute: "37'", type: 'goal', player: 'Mateo Joseph', team: 'home' }
    ]
  }
];

/**
 * Returns dynamic LiveMatch objects for all worldwide leagues in SBOBET.
 * Computes exact real-time live clock, status (LIVE / SCHEDULED / FINISHED),
 * and progressive scores according to WIB (UTC+7).
 */
export function getSbobetWorldMatches(targetDateStr?: string): LiveMatch[] {
  const now = new Date();
  // WIB time (UTC+7)
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
  let matchedFixtures = SBOBET_ALL_WORLD_FIXTURES.filter((f) => f.dateStr === queryDate);

  // If query date has no static fixtures (e.g. user selected custom future date),
  // dynamically generate realistic fixtures with queryDate
  if (matchedFixtures.length === 0) {
    const isPast = queryDate < todayWibDateStr;
    matchedFixtures = SBOBET_ALL_WORLD_FIXTURES.slice(0, 15).map((base, idx) => ({
      ...base,
      id: `${base.id}-dyn-${queryDate}-${idx}`,
      dateStr: queryDate,
      wibDate: `Tanggal ${queryDate.slice(6, 8)}/${queryDate.slice(4, 6)}/${queryDate.slice(0, 4)}`,
      fixedFinalScore: isPast ? (base.fixedFinalScore || { home: 1, away: 0 }) : undefined
    }));
  }

  return matchedFixtures.map((fix) => {
    const kickoffTotalMinutes = fix.kickoffHour * 60 + fix.kickoffMinute;
    const diffMinutes = currentWibTotalMinutes - kickoffTotalMinutes;

    // Construct raw UTC date
    const y = fix.dateStr.slice(0, 4);
    const m = fix.dateStr.slice(4, 6);
    const d = fix.dateStr.slice(6, 8);
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
      status = 'FINISHED';
      statusDetail = 'FT (Selesai)';
      elapsedDetail = "Pertandingan Selesai Penuh (Full Time 90')";
      homeScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'home').length || 1;
      awayScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'away').length || 0;
    } else if (isToday) {
      if (diffMinutes < 0) {
        // Scheduled
        status = 'SCHEDULED';
        statusDetail = wibTime;
        const minsLeft = Math.abs(diffMinutes);
        const hrs = Math.floor(minsLeft / 60);
        const remMins = minsLeft % 60;
        elapsedDetail = hrs > 0 ? `Kickoff dalam ${hrs} jam ${remMins} mnt` : `Kickoff dalam ${remMins} menit`;
        homeScore = 0;
        awayScore = 0;
      } else if (diffMinutes <= 115) {
        // LIVE in-play
        status = 'LIVE';
        if (diffMinutes <= 45) {
          elapsedMinutes = Math.max(1, diffMinutes);
          displayClock = `${elapsedMinutes}'`;
          statusDetail = `Babak 1 (${displayClock})`;
          elapsedDetail = `Babak 1 • Menit ${displayClock}`;
          homeScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'home' && parseInt(e.minute) <= diffMinutes).length || 0;
          awayScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'away' && parseInt(e.minute) <= diffMinutes).length || 0;
        } else if (diffMinutes <= 60) {
          statusDetail = 'HT (Turun Minum)';
          displayClock = 'HT';
          elapsedDetail = 'Istirahat Babak Pertama (HT ~15 Menit)';
          homeScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'home' && parseInt(e.minute) <= 45).length || 0;
          awayScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'away' && parseInt(e.minute) <= 45).length || 0;
        } else {
          const secondHalfMins = Math.min(90, 45 + (diffMinutes - 60));
          elapsedMinutes = secondHalfMins;
          displayClock = `${secondHalfMins}'`;
          statusDetail = `Babak 2 (${displayClock})`;
          elapsedDetail = `Babak 2 • Menit ${displayClock}`;
          homeScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'home' && parseInt(e.minute) <= secondHalfMins).length || 0;
          awayScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'away' && parseInt(e.minute) <= secondHalfMins).length || 0;
        }
      } else {
        // Finished
        status = 'FINISHED';
        statusDetail = 'FT (Selesai)';
        elapsedDetail = "Pertandingan Selesai Penuh (Full Time 90')";
        homeScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'home').length || 1;
        awayScore = fix.events?.filter(e => e.type === 'goal' && e.team === 'away').length || 1;
      }
    } else {
      // Future
      status = 'SCHEDULED';
      statusDetail = wibTime;
      elapsedDetail = `Jadwal Terdaftar (${fix.wibDate})`;
      homeScore = 0;
      awayScore = 0;
    }

    let activeEvents = fix.events || [];
    if (status === 'LIVE') {
      const currentMin = elapsedMinutes || diffMinutes;
      activeEvents = (fix.events || []).filter((e) => {
        const minNum = parseInt(e.minute, 10);
        return isNaN(minNum) || minNum <= currentMin;
      });
    } else if (status === 'SCHEDULED') {
      activeEvents = [];
    }

    const mappedEvents: MatchEventItem[] = activeEvents.map((e) => ({
      type: e.type,
      minute: e.minute,
      player: e.player,
      team: e.team,
      detail: e.detail,
      cardType: e.type === 'yellow_card' ? 'yellow' : e.type === 'red_card' ? 'red' : undefined
    }));

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
      region: fix.region,
      isBigMatch: fix.isBigMatch,
      events: mappedEvents
    };
  });
}
