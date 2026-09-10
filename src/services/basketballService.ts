import { LiveMatch, MatchEventItem } from '../types';

export interface BasketballFixtureDef {
  id: string;
  league: string;
  leagueCode: string;
  leagueLogo: string;
  category: 'friendly' | 'fiba' | 'ibl' | 'pba' | 'euroleague' | 'acb' | 'cba' | 'bleague' | 'wnba' | 'nba';
  country: string;
  region: 'asia' | 'europe' | 'latin_america' | 'other';
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    record?: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    record?: string;
  };
  kickoffHour: number; // WIB (UTC+7)
  kickoffMinute: number;
  periodScores: {
    home: string[]; // [Q1, Q2, Q3, Q4, OT?]
    away: string[];
  };
  venue: string;
  hdp: string;
  ou: string;
  odds: {
    home: string;
    away: string;
    over: string;
    under: string;
  };
  topScorers: {
    home: { player: string; points: number; stats: string };
    away: { player: string; points: number; stats: string };
  };
}

export const BASKETBALL_FIXTURES: BasketballFixtureDef[] = [
  // =========================================================================
  // 1. LAGA PERSAHABATAN ANTARKLUB INTERNASIONAL (CLUB FRIENDLY GAMES)
  // =========================================================================
  {
    id: 'bball-fr-rm-monaco',
    league: 'Laga Persahabatan Antarklub Internasional (Club Friendly)',
    leagueCode: 'club.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'friendly',
    country: 'Eropa / Spanyol',
    region: 'europe',
    homeTeam: {
      name: 'Real Madrid Baloncesto',
      shortName: 'Real Madrid',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Pra-Musim Eropa • 4W-0L'
    },
    awayTeam: {
      name: 'AS Monaco Basket',
      shortName: 'Monaco',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Pra-Musim Eropa • 3W-1L'
    },
    kickoffHour: 15,
    kickoffMinute: 0,
    periodScores: {
      home: ['23', '26', '22', '24'],
      away: ['20', '24', '25', '20']
    },
    venue: 'WiZink Center, Madrid',
    hdp: '-4.5',
    ou: '168.5',
    odds: { home: '1.85', away: '1.95', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Facundo Campazzo', points: 24, stats: '24 Pts, 8 Ast, 3 Stl' },
      away: { player: 'Mike James', points: 26, stats: '26 Pts, 5 Ast, 4 Reb' }
    }
  },
  {
    id: 'bball-fr-pana-oly',
    league: 'Laga Persahabatan Pra-Musim (Pre-Season Friendly Derby)',
    leagueCode: 'club.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'friendly',
    country: 'Yunani',
    region: 'europe',
    homeTeam: {
      name: 'Panathinaikos AKTOR',
      shortName: 'Panathinaikos',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Juara Bertahan EuroLeague'
    },
    awayTeam: {
      name: 'Olympiacos Piraeus',
      shortName: 'Olympiacos',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Final Four EuroLeague'
    },
    kickoffHour: 17,
    kickoffMinute: 30,
    periodScores: {
      home: ['21', '24', '26', '21'],
      away: ['22', '23', '24', '20']
    },
    venue: 'OAKA Altion Arena, Athena',
    hdp: '-2.5',
    ou: '161.5',
    odds: { home: '1.88', away: '1.92', over: '1.87', under: '1.93' },
    topScorers: {
      home: { player: 'Kendrick Nunn', points: 27, stats: '27 Pts, 4 3PM, 5 Reb' },
      away: { player: 'Sasha Vezenkov', points: 25, stats: '25 Pts, 9 Reb, 3 Ast' }
    }
  },
  {
    id: 'bball-fr-fen-anadolu',
    league: 'Laga Persahabatan Piala Presiden (Friendly Cup)',
    leagueCode: 'club.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'friendly',
    country: 'Turki',
    region: 'europe',
    homeTeam: {
      name: 'Fenerbahçe Beko',
      shortName: 'Fenerbahce',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Super Ligi Turki'
    },
    awayTeam: {
      name: 'Anadolu Efes Istanbul',
      shortName: 'Anadolu Efes',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Super Ligi Turki'
    },
    kickoffHour: 20,
    kickoffMinute: 15,
    periodScores: {
      home: ['25', '22', '27', '22'],
      away: ['23', '24', '22', '25']
    },
    venue: 'Ulker Sports Arena, Istanbul',
    hdp: '-3.5',
    ou: '165.5',
    odds: { home: '1.84', away: '1.96', over: '1.91', under: '1.89' },
    topScorers: {
      home: { player: 'Nigel Hayes-Davis', points: 23, stats: '23 Pts, 7 Reb' },
      away: { player: 'Shane Larkin', points: 24, stats: '24 Pts, 8 Ast' }
    }
  },
  {
    id: 'bball-fr-barca-bayern',
    league: 'Laga Persahabatan Uji Coba Eropa (Euro Exhibition)',
    leagueCode: 'club.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'friendly',
    country: 'Jerman / Spanyol',
    region: 'europe',
    homeTeam: {
      name: 'FC Barcelona Basket',
      shortName: 'Barcelona',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Liga ACB Spanyol'
    },
    awayTeam: {
      name: 'FC Bayern München Basketball',
      shortName: 'Bayern Munich',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'BBL Jerman'
    },
    kickoffHour: 22,
    kickoffMinute: 0,
    periodScores: {
      home: ['24', '25', '23', '20'],
      away: ['20', '22', '24', '21']
    },
    venue: 'Palau Blaugrana, Barcelona',
    hdp: '-5.5',
    ou: '164.5',
    odds: { home: '1.82', away: '1.98', over: '1.88', under: '1.92' },
    topScorers: {
      home: { player: 'Willy Hernangómez', points: 22, stats: '22 Pts, 11 Reb' },
      away: { player: 'Carsed Edwards', points: 20, stats: '20 Pts, 4 Ast' }
    }
  },
  {
    id: 'bball-fr-perth-adelaide',
    league: 'NBL Blitz Pre-Season Friendly (Australia)',
    leagueCode: 'nbl.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/National_Basketball_League_logo.svg/300px-National_Basketball_League_logo.svg.png',
    category: 'friendly',
    country: 'Australia',
    region: 'asia',
    homeTeam: {
      name: 'Perth Wildcats',
      shortName: 'Wildcats',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'NBL Pre-Season'
    },
    awayTeam: {
      name: 'Adelaide 36ers',
      shortName: '36ers',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'NBL Pre-Season'
    },
    kickoffHour: 13,
    kickoffMinute: 30,
    periodScores: {
      home: ['28', '24', '26', '27'],
      away: ['22', '26', '23', '25']
    },
    venue: 'RAC Arena, Perth',
    hdp: '-6.5',
    ou: '179.5',
    odds: { home: '1.90', away: '1.90', over: '1.85', under: '1.95' },
    topScorers: {
      home: { player: 'Bryce Cotton', points: 31, stats: '31 Pts, 6 3PM, 5 Ast' },
      away: { player: 'Dejan Vasiljevic', points: 24, stats: '24 Pts, 5 Reb' }
    }
  },

  // =========================================================================
  // 2. FIBA & PERSAHABATAN INTERNASIONAL (INTERNATIONAL FRIENDLIES)
  // =========================================================================
  {
    id: 'bball-fiba-usa-spain',
    league: 'FIBA International Friendly Showcase',
    leagueCode: 'fiba.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/FIBA_logo.svg/300px-FIBA_logo.svg.png',
    category: 'fiba',
    country: 'Internasional',
    region: 'other',
    homeTeam: {
      name: 'USA Basketball Men',
      shortName: 'USA',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/usa.png',
      record: 'FIBA Ranking 1'
    },
    awayTeam: {
      name: 'Spain National Basketball Team',
      shortName: 'Spanyol',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/esp.png',
      record: 'FIBA Ranking 2'
    },
    kickoffHour: 19,
    kickoffMinute: 0,
    periodScores: {
      home: ['28', '31', '26', '27'],
      away: ['23', '25', '24', '26']
    },
    venue: 'Etihad Arena, Abu Dhabi',
    hdp: '-11.5',
    ou: '188.5',
    odds: { home: '1.87', away: '1.93', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Anthony Edwards', points: 28, stats: '28 Pts, 4 3PM, 6 Reb' },
      away: { player: 'Santi Aldama', points: 22, stats: '22 Pts, 8 Reb' }
    }
  },
  {
    id: 'bball-fiba-gilas-korea',
    league: 'FIBA Asia Cup International Friendly',
    leagueCode: 'fiba.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/FIBA_logo.svg/300px-FIBA_logo.svg.png',
    category: 'fiba',
    country: 'Asia',
    region: 'asia',
    homeTeam: {
      name: 'Gilas Pilipinas (Filipina)',
      shortName: 'Filipina',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/phi.png',
      record: 'FIBA Asia Top 4'
    },
    awayTeam: {
      name: 'South Korea Basketball Men',
      shortName: 'Korea Selatan',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/kor.png',
      record: 'FIBA Asia Top 5'
    },
    kickoffHour: 16,
    kickoffMinute: 30,
    periodScores: {
      home: ['22', '25', '24', '23'],
      away: ['21', '23', '22', '25']
    },
    venue: 'Smart Araneta Coliseum, Manila',
    hdp: '-3.5',
    ou: '169.5',
    odds: { home: '1.85', away: '1.95', over: '1.88', under: '1.92' },
    topScorers: {
      home: { player: 'Justin Brownlee', points: 26, stats: '26 Pts, 8 Reb, 6 Ast' },
      away: { player: 'Ra Gun-ah', points: 23, stats: '23 Pts, 12 Reb' }
    }
  },
  {
    id: 'bball-fiba-ina-mas',
    league: 'SEABA Challenge Friendly Match',
    leagueCode: 'fiba.friendly',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/FIBA_logo.svg/300px-FIBA_logo.svg.png',
    category: 'fiba',
    country: 'Indonesia / Asia Tenggara',
    region: 'asia',
    homeTeam: {
      name: 'Indonesia Patriots',
      shortName: 'Indonesia',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ina.png',
      record: 'Timnas Indonesia'
    },
    awayTeam: {
      name: 'Malaysia Basketball Men',
      shortName: 'Malaysia',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/mas.png',
      record: 'Timnas Malaysia'
    },
    kickoffHour: 18,
    kickoffMinute: 0,
    periodScores: {
      home: ['24', '27', '23', '22'],
      away: ['18', '20', '19', '21']
    },
    venue: 'Indonesia Arena, Gelora Bung Karno, Jakarta',
    hdp: '-12.5',
    ou: '159.5',
    odds: { home: '1.82', away: '1.98', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Derrick Michael Xzavierro', points: 24, stats: '24 Pts, 14 Reb, 3 Blk' },
      away: { player: 'Ting Chun Hong', points: 19, stats: '19 Pts, 5 Reb' }
    }
  },

  // =========================================================================
  // 3. IBL INDONESIA (INDONESIAN BASKETBALL LEAGUE)
  // =========================================================================
  {
    id: 'bball-ibl-pelita-satria',
    league: 'IBL Indonesia (Indonesian Basketball League - All Indonesian)',
    leagueCode: 'ibl.ina',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/id/thumb/7/77/Indonesian_Basketball_League_logo.png/300px-Indonesian_Basketball_League_logo.png',
    category: 'ibl',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Pelita Jaya Jakarta',
      shortName: 'Pelita Jaya',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Juara Bertahan IBL 2024'
    },
    awayTeam: {
      name: 'Satria Muda Pertamina Jakarta',
      shortName: 'Satria Muda',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Runner-up IBL 2024'
    },
    kickoffHour: 16,
    kickoffMinute: 0,
    periodScores: {
      home: ['22', '24', '21', '21'],
      away: ['20', '21', '23', '22']
    },
    venue: 'Tennis Indoor Senayan, Jakarta',
    hdp: '-2.5',
    ou: '162.5',
    odds: { home: '1.85', away: '1.95', over: '1.88', under: '1.92' },
    topScorers: {
      home: { player: 'Andakara Prastawa Dhyaksa', points: 22, stats: '22 Pts, 7 Ast, 4 3PM' },
      away: { player: 'Abraham Damar Grahita', points: 23, stats: '23 Pts, 6 Reb, 3 Stl' }
    }
  },
  {
    id: 'bball-ibl-prawira-dewa',
    league: 'IBL Indonesia (Indonesian Basketball League - All Indonesian)',
    leagueCode: 'ibl.ina',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/id/thumb/7/77/Indonesian_Basketball_League_logo.png/300px-Indonesian_Basketball_League_logo.png',
    category: 'ibl',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'Prawira Harum Bandung',
      shortName: 'Prawira Bandung',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Semifinalis IBL'
    },
    awayTeam: {
      name: 'Dewa United Banten',
      shortName: 'Dewa United',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Peringkat 1 Reguler IBL'
    },
    kickoffHour: 18,
    kickoffMinute: 30,
    periodScores: {
      home: ['23', '25', '22', '24'],
      away: ['24', '26', '25', '21']
    },
    venue: 'C-Tra Arena, Bandung',
    hdp: '+1.5',
    ou: '172.5',
    odds: { home: '1.92', away: '1.88', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Yudha Saputera', points: 25, stats: '25 Pts, 8 Ast, 3 Reb' },
      away: { player: 'Kaleb Ramot Gemilang', points: 26, stats: '26 Pts, 7 Reb' }
    }
  },
  {
    id: 'bball-ibl-rans-kesatria',
    league: 'IBL Indonesia (Indonesian Basketball League)',
    leagueCode: 'ibl.ina',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/id/thumb/7/77/Indonesian_Basketball_League_logo.png/300px-Indonesian_Basketball_League_logo.png',
    category: 'ibl',
    country: 'Indonesia',
    region: 'asia',
    homeTeam: {
      name: 'RANS Simba Bogor',
      shortName: 'RANS Bogor',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Playoff IBL 2024'
    },
    awayTeam: {
      name: 'Kesatria Bengawan Solo',
      shortName: 'Bengawan Solo',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Debutan Sensasional IBL'
    },
    kickoffHour: 20,
    kickoffMinute: 0,
    periodScores: {
      home: ['21', '22', '24', '20'],
      away: ['23', '24', '22', '23']
    },
    venue: 'Gymnasium Sekolah Vokasi IPB, Bogor',
    hdp: '+3.5',
    ou: '166.5',
    odds: { home: '1.95', away: '1.85', over: '1.87', under: '1.93' },
    topScorers: {
      home: { player: 'Devon van Oostrum', points: 21, stats: '21 Pts, 9 Ast' },
      away: { player: 'Kentrell Barkley', points: 28, stats: '28 Pts, 11 Reb' }
    }
  },

  // =========================================================================
  // 4. PBA FILIPINA (PHILIPPINE BASKETBALL ASSOCIATION)
  // =========================================================================
  {
    id: 'bball-pba-smb-ginebra',
    league: "PBA Governors' Cup (Filipina)",
    leagueCode: 'pba.phi',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Philippine_Basketball_Association_logo.svg/300px-Philippine_Basketball_Association_logo.svg.png',
    category: 'pba',
    country: 'Filipina',
    region: 'asia',
    homeTeam: {
      name: 'San Miguel Beermen',
      shortName: 'San Miguel',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'PBA Championship Contender'
    },
    awayTeam: {
      name: 'Barangay Ginebra San Miguel',
      shortName: 'Ginebra',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Crowd Favorite PBA'
    },
    kickoffHour: 17,
    kickoffMinute: 15,
    periodScores: {
      home: ['26', '29', '28', '24'],
      away: ['24', '27', '26', '28']
    },
    venue: 'Smart Araneta Coliseum, Quezon City',
    hdp: '-2.5',
    ou: '202.5',
    odds: { home: '1.87', away: '1.93', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'June Mar Fajardo', points: 26, stats: '26 Pts, 16 Reb, 4 Blk' },
      away: { player: 'Justin Brownlee', points: 29, stats: '29 Pts, 9 Reb, 7 Ast' }
    }
  },
  {
    id: 'bball-pba-tnt-magnolia',
    league: "PBA Governors' Cup (Filipina)",
    leagueCode: 'pba.phi',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Philippine_Basketball_Association_logo.svg/300px-Philippine_Basketball_Association_logo.svg.png',
    category: 'pba',
    country: 'Filipina',
    region: 'asia',
    homeTeam: {
      name: 'TNT Tropang Giga',
      shortName: 'TNT Tropang',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'PBA Group Leader'
    },
    awayTeam: {
      name: 'Magnolia Chicken Timplados Hotshots',
      shortName: 'Magnolia',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'PBA Playoff Contender'
    },
    kickoffHour: 19,
    kickoffMinute: 30,
    periodScores: {
      home: ['23', '24', '22', '26'],
      away: ['22', '25', '24', '21']
    },
    venue: 'Ninoy Aquino Stadium, Malate, Manila',
    hdp: '-1.5',
    ou: '188.5',
    odds: { home: '1.86', away: '1.94', over: '1.89', under: '1.91' },
    topScorers: {
      home: { player: 'Rondae Hollis-Jefferson', points: 28, stats: '28 Pts, 12 Reb, 8 Ast' },
      away: { player: 'Paul Lee', points: 24, stats: '24 Pts, 5 3PM' }
    }
  },

  // =========================================================================
  // 5. EUROLEAGUE & LIGA ACB SPANYOL
  // =========================================================================
  {
    id: 'bball-euro-maccabi-zalgiris',
    league: 'Turkish Airlines EuroLeague (Eropa)',
    leagueCode: 'euroleague',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'euroleague',
    country: 'Eropa',
    region: 'europe',
    homeTeam: {
      name: 'Maccabi Playtika Tel Aviv',
      shortName: 'Maccabi',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'EuroLeague Regular'
    },
    awayTeam: {
      name: 'Žalgiris Kaunas',
      shortName: 'Zalgiris',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'EuroLeague Regular'
    },
    kickoffHour: 23,
    kickoffMinute: 0,
    periodScores: {
      home: ['24', '22', '21', '23'],
      away: ['20', '23', '24', '21']
    },
    venue: 'Aleksandar Nikolic Hall, Belgrade',
    hdp: '-3.5',
    ou: '167.5',
    odds: { home: '1.83', away: '1.97', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Roman Sorkin', points: 20, stats: '20 Pts, 8 Reb' },
      away: { player: 'Sylvain Francisco', points: 21, stats: '21 Pts, 6 Ast' }
    }
  },
  {
    id: 'bball-acb-baskonia-unicaja',
    league: 'Liga ACB Spanyol (Liga Endesa)',
    leagueCode: 'esp.acb',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Euroleague_logo.svg/300px-Euroleague_logo.svg.png',
    category: 'acb',
    country: 'Spanyol',
    region: 'europe',
    homeTeam: {
      name: 'Baskonia Vitoria-Gasteiz',
      shortName: 'Baskonia',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Liga ACB'
    },
    awayTeam: {
      name: 'Unicaja Málaga',
      shortName: 'Unicaja',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Juara Copa del Rey Spanyol'
    },
    kickoffHour: 21,
    kickoffMinute: 30,
    periodScores: {
      home: ['25', '24', '23', '22'],
      away: ['23', '26', '24', '25']
    },
    venue: 'Fernando Buesa Arena, Vitoria-Gasteiz',
    hdp: '+1.5',
    ou: '169.5',
    odds: { home: '1.92', away: '1.88', over: '1.86', under: '1.94' },
    topScorers: {
      home: { player: 'Markus Howard', points: 29, stats: '29 Pts, 7 3PM' },
      away: { player: 'Kendrick Perry', points: 22, stats: '22 Pts, 7 Ast' }
    }
  },

  // =========================================================================
  // 6. CBA CHINA & B.LEAGUE JEPANG
  // =========================================================================
  {
    id: 'bball-cba-liaoning-xinjiang',
    league: 'CBA China (Chinese Basketball Association)',
    leagueCode: 'cba.chn',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/300px-Flag_of_the_People%27s_Republic_of_China.svg.png',
    category: 'cba',
    country: 'China',
    region: 'asia',
    homeTeam: {
      name: 'Liaoning Flying Leopards',
      shortName: 'Liaoning',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Juara Bertahan CBA'
    },
    awayTeam: {
      name: 'Xinjiang Flying Tigers',
      shortName: 'Xinjiang',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'Runner-up CBA Finals'
    },
    kickoffHour: 18,
    kickoffMinute: 35,
    periodScores: {
      home: ['28', '29', '25', '26'],
      away: ['24', '26', '25', '25']
    },
    venue: 'Liaoning Gymnasium, Shenyang',
    hdp: '-6.5',
    ou: '198.5',
    odds: { home: '1.85', away: '1.95', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Zhao Jiwei', points: 24, stats: '24 Pts, 11 Ast' },
      away: { player: 'Abdusalam Abdurixit', points: 22, stats: '22 Pts, 10 Reb' }
    }
  },
  {
    id: 'bball-bleague-ryukyu-utsunomiya',
    league: 'B.League Jepang (B1 League Japan)',
    leagueCode: 'b1.jpn',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/300px-Flag_of_Japan.svg.png',
    category: 'bleague',
    country: 'Jepang',
    region: 'asia',
    homeTeam: {
      name: 'Ryukyu Golden Kings',
      shortName: 'Ryukyu Kings',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'B.League Championship Contender'
    },
    awayTeam: {
      name: 'Utsunomiya Brex',
      shortName: 'Brex',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      record: 'B.League Regular Season Champion'
    },
    kickoffHour: 17,
    kickoffMinute: 5,
    periodScores: {
      home: ['21', '22', '23', '20'],
      away: ['19', '24', '22', '21']
    },
    venue: 'Okinawa Arena, Okinawa',
    hdp: '-1.5',
    ou: '158.5',
    odds: { home: '1.88', away: '1.92', over: '1.87', under: '1.93' },
    topScorers: {
      home: { player: 'Jack Cooley', points: 21, stats: '21 Pts, 13 Reb' },
      away: { player: 'Makoto Hiejima', points: 23, stats: '23 Pts, 5 Ast' }
    }
  },

  // =========================================================================
  // 7. WNBA & NBA SHOWCASE
  // =========================================================================
  {
    id: 'bball-wnba-ny-vegas',
    league: 'WNBA (Women\'s National Basketball Association)',
    leagueCode: 'wnba',
    leagueLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png',
    category: 'wnba',
    country: 'Amerika Serikat',
    region: 'other',
    homeTeam: {
      name: 'New York Liberty',
      shortName: 'NY Liberty',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/wnba/500/ny.png',
      record: 'Peringkat 1 WNBA • 28W-6L'
    },
    awayTeam: {
      name: 'Las Vegas Aces',
      shortName: 'LV Aces',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/wnba/500/lv.png',
      record: 'Juara Bertahan WNBA • 24W-10L'
    },
    kickoffHour: 7,
    kickoffMinute: 0,
    periodScores: {
      home: ['25', '27', '24', '22'],
      away: ['23', '24', '26', '21']
    },
    venue: 'Barclays Center, Brooklyn, New York',
    hdp: '-3.5',
    ou: '175.5',
    odds: { home: '1.87', away: '1.93', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Breanna Stewart', points: 28, stats: '28 Pts, 11 Reb, 4 Ast' },
      away: { player: "A'ja Wilson", points: 30, stats: '30 Pts, 14 Reb, 3 Blk' }
    }
  },
  {
    id: 'bball-nba-bos-den',
    league: 'NBA Abu Dhabi Games (Pre-Season Showcase)',
    leagueCode: 'nba.preseason',
    leagueLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    category: 'nba',
    country: 'Amerika Serikat / UEA',
    region: 'other',
    homeTeam: {
      name: 'Boston Celtics',
      shortName: 'Celtics',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png',
      record: 'Juara Bertahan NBA 2024'
    },
    awayTeam: {
      name: 'Denver Nuggets',
      shortName: 'Nuggets',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/den.png',
      record: 'Juara NBA 2023'
    },
    kickoffHour: 23,
    kickoffMinute: 0,
    periodScores: {
      home: ['31', '33', '28', '26'],
      away: ['29', '30', '29', '28']
    },
    venue: 'Etihad Arena, Yas Island, Abu Dhabi',
    hdp: '-2.5',
    ou: '224.5',
    odds: { home: '1.88', away: '1.92', over: '1.90', under: '1.90' },
    topScorers: {
      home: { player: 'Jayson Tatum', points: 27, stats: '27 Pts, 8 Reb, 5 Ast' },
      away: { player: 'Nikola Jokić', points: 25, stats: '25 Pts, 12 Reb, 10 Ast' }
    }
  }
];

/**
 * Helper to compute match status based on current WIB time and target date
 */
export function getBasketballMatches(dateStr?: string): LiveMatch[] {
  const now = new Date();
  const currentWibHours = (now.getUTCHours() + 7) % 24;
  const currentWibMinutes = now.getUTCMinutes();
  const currentTotalMins = currentWibHours * 60 + currentWibMinutes;

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}${m}${d}`;
  const queryDate = dateStr || todayStr;

  const isToday = queryDate === todayStr;
  const isPast = queryDate < todayStr;

  return BASKETBALL_FIXTURES.map((fix) => {
    const fixKickoffMins = fix.kickoffHour * 60 + fix.kickoffMinute;
    const diffMinutes = currentTotalMins - fixKickoffMins;

    const wibTime = `${String(fix.kickoffHour).padStart(2, '0')}:${String(fix.kickoffMinute).padStart(2, '0')} WIB`;
    const rawUtcDate = `${queryDate.slice(0, 4)}-${queryDate.slice(4, 6)}-${queryDate.slice(6, 8)}T${String((fix.kickoffHour - 7 + 24) % 24).padStart(2, '0')}:${String(fix.kickoffMinute).padStart(2, '0')}:00.000Z`;

    let status: 'LIVE' | 'SCHEDULED' | 'FINISHED' = 'SCHEDULED';
    let statusDetail = wibTime;
    let displayClock = '';
    let elapsedDetail = `Kick-off ${wibTime}`;

    // Period scores: [Q1, Q2, Q3, Q4]
    const homeQuarterPoints = fix.periodScores.home.map((p) => parseInt(p, 10) || 0);
    const awayQuarterPoints = fix.periodScores.away.map((p) => parseInt(p, 10) || 0);

    const fullHomeScore = homeQuarterPoints.reduce((a, b) => a + b, 0);
    const fullAwayScore = awayQuarterPoints.reduce((a, b) => a + b, 0);

    let homeScore = 0;
    let awayScore = 0;
    let currentHomePeriods: string[] = [];
    let currentAwayPeriods: string[] = [];

    if (isPast) {
      status = 'FINISHED';
      statusDetail = 'FT (Selesai)';
      displayClock = 'FT';
      elapsedDetail = 'Pertandingan Selesai Penuh (Full Time)';
      homeScore = fullHomeScore;
      awayScore = fullAwayScore;
      currentHomePeriods = fix.periodScores.home;
      currentAwayPeriods = fix.periodScores.away;
    } else if (isToday) {
      if (diffMinutes < 0) {
        // Scheduled
        status = 'SCHEDULED';
        statusDetail = wibTime;
        displayClock = '';
        const waitHours = Math.floor(Math.abs(diffMinutes) / 60);
        const waitMins = Math.abs(diffMinutes) % 60;
        elapsedDetail = waitHours > 0 ? `Kick-off dalam ${waitHours} jam ${waitMins} mnt` : `Kick-off dalam ${waitMins} menit`;
        homeScore = 0;
        awayScore = 0;
        currentHomePeriods = [];
        currentAwayPeriods = [];
      } else if (diffMinutes <= 120) {
        // LIVE in-play basketball match (~2 hours duration)
        status = 'LIVE';
        if (diffMinutes <= 25) {
          // Quarter 1
          const qMins = Math.max(1, Math.min(10, Math.floor(diffMinutes / 2)));
          const qSecs = 60 - ((diffMinutes * 60) % 60);
          displayClock = `Q1 ${String(qMins).padStart(2, '0')}:${String(qSecs).padStart(2, '0')}`;
          statusDetail = `Babak 1 • ${displayClock}`;
          elapsedDetail = `Kuarter 1 (Q1) • Sisa Waktu ${String(qMins).padStart(2, '0')}:${String(qSecs).padStart(2, '0')}`;
          homeScore = Math.floor(homeQuarterPoints[0] * (qMins / 10));
          awayScore = Math.floor(awayQuarterPoints[0] * (qMins / 10));
          currentHomePeriods = [String(homeScore)];
          currentAwayPeriods = [String(awayScore)];
        } else if (diffMinutes <= 50) {
          // Quarter 2
          const qMins = Math.max(1, Math.min(10, Math.floor((diffMinutes - 25) / 2.5)));
          displayClock = `Q2 ${String(qMins).padStart(2, '0')}:30`;
          statusDetail = `Babak 1 • ${displayClock}`;
          elapsedDetail = `Kuarter 2 (Q2) • Sisa Waktu ${String(qMins).padStart(2, '0')}:30`;
          const partialHomeQ2 = Math.floor(homeQuarterPoints[1] * (qMins / 10));
          const partialAwayQ2 = Math.floor(awayQuarterPoints[1] * (qMins / 10));
          homeScore = homeQuarterPoints[0] + partialHomeQ2;
          awayScore = awayQuarterPoints[0] + partialAwayQ2;
          currentHomePeriods = [fix.periodScores.home[0], String(partialHomeQ2)];
          currentAwayPeriods = [fix.periodScores.away[0], String(partialAwayQ2)];
        } else if (diffMinutes <= 65) {
          // Halftime (HT)
          statusDetail = 'HT (Turun Minum / Halftime)';
          displayClock = 'HT';
          elapsedDetail = 'Istirahat Babak Pertama (Halftime 15 Menit)';
          homeScore = homeQuarterPoints[0] + homeQuarterPoints[1];
          awayScore = awayQuarterPoints[0] + awayQuarterPoints[1];
          currentHomePeriods = [fix.periodScores.home[0], fix.periodScores.home[1]];
          currentAwayPeriods = [fix.periodScores.away[0], fix.periodScores.away[1]];
        } else if (diffMinutes <= 90) {
          // Quarter 3
          const qMins = Math.max(1, Math.min(10, Math.floor((diffMinutes - 65) / 2.5)));
          displayClock = `Q3 ${String(qMins).padStart(2, '0')}:45`;
          statusDetail = `Babak 2 • ${displayClock}`;
          elapsedDetail = `Kuarter 3 (Q3) • Sisa Waktu ${String(qMins).padStart(2, '0')}:45`;
          const partialHomeQ3 = Math.floor(homeQuarterPoints[2] * (qMins / 10));
          const partialAwayQ3 = Math.floor(awayQuarterPoints[2] * (qMins / 10));
          homeScore = homeQuarterPoints[0] + homeQuarterPoints[1] + partialHomeQ3;
          awayScore = awayQuarterPoints[0] + awayQuarterPoints[1] + partialAwayQ3;
          currentHomePeriods = [fix.periodScores.home[0], fix.periodScores.home[1], String(partialHomeQ3)];
          currentAwayPeriods = [fix.periodScores.away[0], fix.periodScores.away[1], String(partialAwayQ3)];
        } else {
          // Quarter 4
          const qMins = Math.max(1, Math.min(10, Math.floor((diffMinutes - 90) / 2.5)));
          displayClock = `Q4 ${String(qMins).padStart(2, '0')}:12`;
          statusDetail = `Babak 2 • ${displayClock}`;
          elapsedDetail = `Kuarter 4 (Q4) • Menit Krusial Penentuan`;
          const partialHomeQ4 = Math.floor(homeQuarterPoints[3] * (qMins / 10));
          const partialAwayQ4 = Math.floor(awayQuarterPoints[3] * (qMins / 10));
          homeScore = homeQuarterPoints[0] + homeQuarterPoints[1] + homeQuarterPoints[2] + partialHomeQ4;
          awayScore = awayQuarterPoints[0] + awayQuarterPoints[1] + awayQuarterPoints[2] + partialAwayQ4;
          currentHomePeriods = [fix.periodScores.home[0], fix.periodScores.home[1], fix.periodScores.home[2], String(partialHomeQ4)];
          currentAwayPeriods = [fix.periodScores.away[0], fix.periodScores.away[1], fix.periodScores.away[2], String(partialAwayQ4)];
        }
      } else {
        // Finished
        status = 'FINISHED';
        statusDetail = 'FT (Selesai)';
        displayClock = 'FT';
        elapsedDetail = 'Pertandingan Selesai Penuh (Full Time)';
        homeScore = fullHomeScore;
        awayScore = fullAwayScore;
        currentHomePeriods = fix.periodScores.home;
        currentAwayPeriods = fix.periodScores.away;
      }
    } else {
      // Future date
      status = 'SCHEDULED';
      statusDetail = wibTime;
      displayClock = '';
      elapsedDetail = `Jadwal Terdaftar (${wibTime})`;
      homeScore = 0;
      awayScore = 0;
    }

    // Build basketball events (Top Scorers & Key Highlights)
    const events: MatchEventItem[] = [];
    if (status === 'LIVE' || status === 'FINISHED') {
      events.push({
        type: 'point',
        minute: status === 'FINISHED' ? 'FT' : displayClock || 'LIVE',
        player: `${fix.topScorers.home.player} (${fix.topScorers.home.points} Pts)`,
        team: 'home',
        detail: fix.topScorers.home.stats
      });
      events.push({
        type: 'point',
        minute: status === 'FINISHED' ? 'FT' : displayClock || 'LIVE',
        player: `${fix.topScorers.away.player} (${fix.topScorers.away.points} Pts)`,
        team: 'away',
        detail: fix.topScorers.away.stats
      });
    }

    return {
      id: `${fix.id}-${queryDate}`,
      sport: 'basketball',
      sportLabel: 'Bola Basket',
      league: fix.league,
      leagueCode: fix.leagueCode,
      leagueLogo: fix.leagueLogo,
      country: fix.country,
      season: '2026',
      homeTeam: {
        name: fix.homeTeam.name,
        shortName: fix.homeTeam.shortName,
        logo: fix.homeTeam.logo,
        score: homeScore,
        record: fix.homeTeam.record,
        periodScores: currentHomePeriods
      },
      awayTeam: {
        name: fix.awayTeam.name,
        shortName: fix.awayTeam.shortName,
        logo: fix.awayTeam.logo,
        score: awayScore,
        record: fix.awayTeam.record,
        periodScores: currentAwayPeriods
      },
      status,
      statusDetail,
      displayClock,
      elapsedDetail,
      kickoffWib: wibTime,
      rawUtcDate,
      wibTime,
      wibDate: `${queryDate.slice(0, 4)}-${queryDate.slice(4, 6)}-${queryDate.slice(6, 8)}`,
      venue: fix.venue,
      region: fix.region,
      isBigMatch: fix.category === 'friendly' || fix.category === 'fiba' || fix.category === 'ibl',
      events,
      sbobetOdds: {
        handicap: fix.hdp,
        homeOdds: fix.odds.home,
        awayOdds: fix.odds.away,
        overUnder: fix.ou,
        overOdds: fix.odds.over,
        underOdds: fix.odds.under
      }
    };
  });
}
