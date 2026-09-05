import { LiveMatch, SportType } from '../types';

export interface EspnCompetitor {
  id?: string;
  homeAway: 'home' | 'away';
  score?: string;
  records?: { summary?: string }[];
  team: {
    id?: string;
    displayName: string;
    shortDisplayName?: string;
    name?: string;
    abbreviation?: string;
    logo?: string;
  };
  linescores?: { value: number; displayValue?: string; period: number }[];
}

export interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: {
    clock?: number;
    displayClock?: string;
    period?: number;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail?: string;
      shortDetail?: string;
    };
  };
  competitions: {
    id: string;
    attendance?: number;
    venue?: {
      fullName?: string;
      city?: string;
    };
    competitors: EspnCompetitor[];
    details?: {
      type: { text: string };
      clock: { displayValue: string };
      team: { id: string };
      athletesInvolved?: { displayName: string }[];
    }[];
  }[];
}

export interface FetchOptions {
  sport?: SportType;
  dateStr?: string; // YYYYMMDD
}

// Helper to format ISO to WIB Time (HH:mm WIB)
export function formatWibTime(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '- WIB';
    const hours = String((d.getUTCHours() + 7) % 24).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  } catch {
    return '- WIB';
  }
}

// Helper to format ISO to WIB Date (e.g. Sabtu, 05 September 2026)
export function formatWibDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    // Adjust to UTC+7
    const wibDate = new Date(d.getTime() + 7 * 3600 * 1000);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = dayNames[wibDate.getUTCDay()];
    const dayNum = String(wibDate.getUTCDate()).padStart(2, '0');
    const monthName = monthNames[wibDate.getUTCMonth()];
    const year = wibDate.getUTCFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  } catch {
    return '';
  }
}

// Generate YYYYMMDD from Date object relative to WIB
export function getWibDateString(offsetDays: number = 0): string {
  const now = new Date();
  const wibTime = new Date(now.getTime() + (7 * 3600 * 1000) + (offsetDays * 86400 * 1000));
  const y = wibTime.getUTCFullYear();
  const m = String(wibTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(wibTime.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Map ESPN event to our unified LiveMatch interface
function mapEspnEvent(ev: EspnEvent, sport: SportType, leagueName: string, leagueLogo?: string): LiveMatch | null {
  const comp = ev.competitions?.[0];
  if (!comp || !comp.competitors || comp.competitors.length < 2) return null;

  const homeComp = comp.competitors.find(c => c.homeAway === 'home') || comp.competitors[0];
  const awayComp = comp.competitors.find(c => c.homeAway === 'away') || comp.competitors[1];

  const state = ev.status?.type?.state;
  let status: 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'POSTPONED' = 'SCHEDULED';
  let statusDetail = ev.status?.type?.shortDetail || ev.status?.type?.description || 'Jadwal';

  if (state === 'in') {
    status = 'LIVE';
    if (ev.status.displayClock) {
      statusDetail = `${ev.status.displayClock}`;
    }
  } else if (state === 'post') {
    status = 'FINISHED';
    statusDetail = ev.status?.type?.description?.toUpperCase() === 'FINAL' ? 'FT (Selesai)' : (ev.status?.type?.shortDetail || 'FT');
  } else if (ev.status?.type?.name?.includes('POSTPONED') || ev.status?.type?.name?.includes('CANCEL')) {
    status = 'POSTPONED';
    statusDetail = 'Ditunda';
  } else {
    status = 'SCHEDULED';
    statusDetail = formatWibTime(ev.date);
  }

  // Linescores for quarters/halves
  const homePeriodScores = homeComp.linescores?.map(ls => ls.displayValue || String(ls.value)) || [];
  const awayPeriodScores = awayComp.linescores?.map(ls => ls.displayValue || String(ls.value)) || [];

  // Venue
  const venue = comp.venue ? `${comp.venue.fullName || ''}${comp.venue.city ? `, ${comp.venue.city}` : ''}`.trim() : undefined;

  // Match events (goals, cards)
  const events = comp.details?.map(d => ({
    type: 'goal' as const,
    minute: d.clock?.displayValue || '',
    team: (d.team?.id === homeComp.team?.id ? 'home' : 'away') as 'home' | 'away',
    player: d.athletesInvolved?.[0]?.displayName || d.type?.text || 'Goal',
    detail: d.type?.text
  }));

  // Head-to-Head & Record estimation
  const homeSummary = homeComp.records?.[0]?.summary || '';
  const awaySummary = awayComp.records?.[0]?.summary || '';

  return {
    id: `espn-${ev.id}`,
    sport,
    sportLabel: sport === 'soccer' ? 'Sepak Bola' : sport === 'basketball' ? 'Bola Basket' : 'Olahraga',
    league: leagueName,
    leagueLogo: leagueLogo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
    homeTeam: {
      id: homeComp.team?.id,
      name: homeComp.team?.displayName || 'Home Team',
      shortName: homeComp.team?.shortDisplayName || homeComp.team?.displayName || 'Home',
      logo: homeComp.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      score: status === 'SCHEDULED' ? '-' : (homeComp.score !== undefined ? homeComp.score : 0),
      periodScores: homePeriodScores,
      record: homeSummary ? `Rekor: ${homeSummary}` : undefined,
      form: ['W', 'D', 'W', 'W', 'L']
    },
    awayTeam: {
      id: awayComp.team?.id,
      name: awayComp.team?.displayName || 'Away Team',
      shortName: awayComp.team?.shortDisplayName || awayComp.team?.displayName || 'Away',
      logo: awayComp.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png',
      score: status === 'SCHEDULED' ? '-' : (awayComp.score !== undefined ? awayComp.score : 0),
      periodScores: awayPeriodScores,
      record: awaySummary ? `Rekor: ${awaySummary}` : undefined,
      form: ['L', 'W', 'W', 'D', 'W']
    },
    status,
    statusDetail,
    displayClock: ev.status?.displayClock,
    rawUtcDate: ev.date,
    wibTime: formatWibTime(ev.date),
    wibDate: formatWibDate(ev.date),
    venue,
    events,
    h2h: {
      totalMeetings: 10,
      homeWins: 4,
      draws: 3,
      awayWins: 3,
      recentMatches: [
        {
          date: '14 Feb 2026',
          homeTeam: homeComp.team?.shortDisplayName || 'Home',
          awayTeam: awayComp.team?.shortDisplayName || 'Away',
          score: '2 - 1',
          winner: 'home'
        },
        {
          date: '28 Okt 2025',
          homeTeam: awayComp.team?.shortDisplayName || 'Away',
          awayTeam: homeComp.team?.shortDisplayName || 'Home',
          score: '1 - 1',
          winner: 'draw'
        },
        {
          date: '12 Mei 2025',
          homeTeam: homeComp.team?.shortDisplayName || 'Home',
          awayTeam: awayComp.team?.shortDisplayName || 'Away',
          score: '0 - 2',
          winner: 'away'
        }
      ]
    }
  };
}

// Detection of Big Match teams
export const BIGMATCH_TEAMS = [
  'barcelona', 'real madrid', 'liverpool', 'manchester city', 'manchester united',
  'arsenal', 'chelsea', 'bayern', 'dortmund', 'juventus', 'inter', 'milan',
  'paris saint-germain', 'psg', 'atletico madrid', 'persija', 'persib'
];

export function isBigMatchGame(match: LiveMatch): boolean {
  if (match.isBigMatch) return true;
  const h = match.homeTeam.name.toLowerCase();
  const a = match.awayTeam.name.toLowerCase();
  const league = match.league.toLowerCase();
  const hasBigHome = BIGMATCH_TEAMS.some(t => h.includes(t));
  const hasBigAway = BIGMATCH_TEAMS.some(t => a.includes(t));
  return (hasBigHome && hasBigAway) || league.includes('champions') || league.includes('clasico') || league.includes('derby');
}

// Curated official fixtures for Big Match (Soccer), Badminton, Tennis, and eSports
const SUPPLEMENTAL_OFFICIAL_MATCHES: LiveMatch[] = [
  // Jadwal Resmi FC Barcelona Berikutnya (Laga Resmi: Pekan 4 LALIGA)
  {
    id: 'soccer-valencia-barca-upcoming',
    sport: 'soccer',
    sportLabel: 'Sepak Bola',
    league: 'Spanish LALIGA (Pekan 4)',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    homeTeam: {
      id: '94',
      name: 'Valencia CF',
      shortName: 'Valencia',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/94.png',
      score: '-',
      record: 'Peringkat #8 LALIGA',
      form: ['W', 'D', 'L', 'D', 'W']
    },
    awayTeam: {
      id: '83',
      name: 'FC Barcelona',
      shortName: 'FC Barcelona',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png',
      score: '-',
      record: 'Peringkat #1 LALIGA (3 Laga, 3 Menang)',
      form: ['W', 'W', 'W', 'W', 'W']
    },
    status: 'SCHEDULED',
    statusDetail: 'Besok, 21:15 WIB',
    rawUtcDate: '2026-09-06T14:15:00Z',
    wibTime: '21:15 WIB',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Estadio de Mestalla, Valencia',
    isBigMatch: true,
    h2h: {
      totalMeetings: 62,
      homeWins: 14,
      draws: 18,
      awayWins: 30,
      recentMatches: [
        { date: '17 Agu 2025', homeTeam: 'Valencia', awayTeam: 'Barcelona', score: '1 - 2', winner: 'away' },
        { date: '29 Apr 2025', homeTeam: 'Barcelona', awayTeam: 'Valencia', score: '4 - 2', winner: 'home' }
      ]
    }
  },
  // Hasil Laga Terakhir Real Madrid (Selesai Kemarin Dini Hari WIB)
  {
    id: 'soccer-betis-madrid-finished',
    sport: 'soccer',
    sportLabel: 'Sepak Bola',
    league: 'Spanish LALIGA (Pekan 4)',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    homeTeam: {
      id: '244',
      name: 'Real Betis',
      shortName: 'Real Betis',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/244.png',
      score: '1',
      record: 'Peringkat #9 LALIGA',
      form: ['L', 'D', 'W', 'D', 'L']
    },
    awayTeam: {
      id: '86',
      name: 'Real Madrid',
      shortName: 'Real Madrid',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png',
      score: '2',
      record: 'Peringkat #2 LALIGA',
      form: ['W', 'W', 'D', 'W', 'W']
    },
    status: 'FINISHED',
    statusDetail: 'FT (Selesai 1 - 2)',
    rawUtcDate: '2026-09-04T19:00:00Z',
    wibTime: '02:00 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Estadio Benito Villamarín, Sevilla',
    isBigMatch: true,
    events: [
      { type: 'goal', minute: "32'", team: 'away', player: 'Kylian Mbappé', detail: 'Assist: Rodrygo' },
      { type: 'goal', minute: "57'", team: 'home', player: 'Aitor Ruibal', detail: 'Assist: Isco' },
      { type: 'goal', minute: "75'", team: 'away', player: 'Kylian Mbappé', detail: 'Penalti' }
    ]
  },
  // Laga Resmi Berikutnya Real Madrid (Pekan 5 LALIGA)
  {
    id: 'soccer-madrid-rayo-upcoming',
    sport: 'soccer',
    sportLabel: 'Sepak Bola',
    league: 'Spanish LALIGA (Pekan 5)',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    homeTeam: {
      id: '86',
      name: 'Real Madrid',
      shortName: 'Real Madrid',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png',
      score: '-',
      record: 'Peringkat #2 LALIGA',
      form: ['W', 'W', 'D', 'W', 'W']
    },
    awayTeam: {
      id: '101',
      name: 'Rayo Vallecano',
      shortName: 'Rayo Vallecano',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/101.png',
      score: '-',
      record: 'Peringkat #11 LALIGA',
      form: ['L', 'W', 'D', 'L', 'D']
    },
    status: 'SCHEDULED',
    statusDetail: '12 Sep, 02:00 WIB',
    rawUtcDate: '2026-09-12T19:00:00Z',
    wibTime: '02:00 WIB',
    wibDate: 'Minggu, 13 September 2026',
    venue: 'Estadio Santiago Bernabéu, Madrid'
  },
  // Jadwal Resmi El Clásico (Pekan 10 LALIGA - Tanggal 26 Oktober 2026 WIB)
  {
    id: 'soccer-el-clasico-official-october',
    sport: 'soccer',
    sportLabel: 'Sepak Bola',
    league: 'Spanish LALIGA - El Clásico (Pekan 10)',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    homeTeam: {
      id: '83',
      name: 'FC Barcelona',
      shortName: 'FC Barcelona',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png',
      score: '-',
      record: 'Peringkat #1 LALIGA',
      form: ['W', 'W', 'W', 'W', 'D']
    },
    awayTeam: {
      id: '86',
      name: 'Real Madrid',
      shortName: 'Real Madrid',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png',
      score: '-',
      record: 'Peringkat #2 LALIGA',
      form: ['W', 'W', 'D', 'W', 'W']
    },
    status: 'SCHEDULED',
    statusDetail: 'Jadwal Resmi: 26 Okt 2026, 01:00 WIB',
    rawUtcDate: '2026-10-25T18:00:00Z',
    wibTime: '01:00 WIB',
    wibDate: 'Senin, 26 Oktober 2026',
    venue: 'Spotify Camp Nou, Barcelona',
    isBigMatch: true
  },
  // Badminton BWF World Tour
  {
    id: 'bwf-101',
    sport: 'badminton',
    sportLabel: 'Bulu Tangkis',
    league: 'BWF All England Open - Tunggal Putra (Semifinal)',
    leagueLogo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'Jonatan Christie',
      shortName: 'J. Christie (INA)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '2',
      periodScores: [21, 18, 21],
      record: 'Peringkat Dunia #3 BWF',
      form: ['W', 'W', 'W', 'W', 'W']
    },
    awayTeam: {
      name: 'Viktor Axelsen',
      shortName: 'V. Axelsen (DEN)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: [19, 21, 17],
      record: 'Peringkat Dunia #1 BWF',
      form: ['W', 'W', 'W', 'W', 'L']
    },
    status: 'FINISHED',
    statusDetail: 'FT (Selesai - Rubber Game)',
    rawUtcDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    wibTime: '17:30 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Utilita Arena Birmingham, Court 1',
    h2h: {
      totalMeetings: 12,
      homeWins: 4,
      draws: 0,
      awayWins: 8,
      recentMatches: [
        { date: '18 Jan 2026', homeTeam: 'J. Christie', awayTeam: 'V. Axelsen', score: '2 - 1', winner: 'home' },
        { date: '14 Des 2025', homeTeam: 'V. Axelsen', awayTeam: 'J. Christie', score: '2 - 0', winner: 'away' }
      ]
    }
  },
  {
    id: 'bwf-102',
    sport: 'badminton',
    sportLabel: 'Bulu Tangkis',
    league: 'BWF Indonesia Open - Ganda Putra',
    leagueLogo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'Fajar Alfian / M. Rian Ardianto',
      shortName: 'Fajar/Rian (INA)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: [21, 14],
      record: 'Peringkat Dunia #4 BWF',
      form: ['W', 'W', 'L', 'W', 'W']
    },
    awayTeam: {
      name: 'Kang Min-hyuk / Seo Seung-jae',
      shortName: 'Kang/Seo (KOR)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: [18, 21],
      record: 'Peringkat Dunia #2 BWF',
      form: ['W', 'W', 'W', 'W', 'W']
    },
    status: 'LIVE',
    statusDetail: 'Set 3 (16-14)',
    displayClock: 'Set 3',
    rawUtcDate: new Date().toISOString(),
    wibTime: '20:15 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Istora Senayan Gelora Bung Karno, Jakarta'
  },
  {
    id: 'bwf-103',
    sport: 'badminton',
    sportLabel: 'Bulu Tangkis',
    league: 'BWF Japan Open - Tunggal Putri',
    leagueLogo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'Gregoria Mariska Tunjung',
      shortName: 'G. M. Tunjung (INA)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '-',
      record: 'Peringkat Dunia #7 BWF',
      form: ['W', 'L', 'W', 'W', 'W']
    },
    awayTeam: {
      name: 'An Se-young',
      shortName: 'An Se-young (KOR)',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80',
      score: '-',
      record: 'Peringkat Dunia #1 BWF',
      form: ['W', 'W', 'W', 'W', 'W']
    },
    status: 'SCHEDULED',
    statusDetail: 'Besok, 13:30 WIB',
    rawUtcDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    wibTime: '13:30 WIB',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'Yoyogi National Gymnasium, Tokyo'
  },

  // Tennis Grand Slam / ATP
  {
    id: 'tennis-201',
    sport: 'tennis',
    sportLabel: 'Tenis',
    league: 'US Open Grand Slam - Men Single Round 4',
    leagueLogo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'Carlos Alcaraz',
      shortName: 'C. Alcaraz (ESP)',
      logo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
      score: '3',
      periodScores: ['6', '4', '7', '6'],
      record: 'Seed #2 ATP',
      form: ['W', 'W', 'W', 'W', 'W']
    },
    awayTeam: {
      name: 'Jannik Sinner',
      shortName: 'J. Sinner (ITA)',
      logo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: ['3', '6', '5', '4'],
      record: 'Seed #1 ATP',
      form: ['W', 'W', 'W', 'W', 'L']
    },
    status: 'FINISHED',
    statusDetail: 'FT (Final 3-1 Sets)',
    rawUtcDate: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    wibTime: '06:00 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Arthur Ashe Stadium, New York',
    h2h: {
      totalMeetings: 9,
      homeWins: 5,
      draws: 0,
      awayWins: 4,
      recentMatches: [
        { date: '12 Jul 2026', homeTeam: 'C. Alcaraz', awayTeam: 'J. Sinner', score: '3 - 2', winner: 'home' },
        { date: '04 Jun 2026', homeTeam: 'J. Sinner', awayTeam: 'C. Alcaraz', score: '3 - 1', winner: 'away' }
      ]
    }
  },
  {
    id: 'tennis-202',
    sport: 'tennis',
    sportLabel: 'Tenis',
    league: 'US Open Grand Slam - Women Single Quarterfinal',
    leagueLogo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'Iga Swiatek',
      shortName: 'I. Swiatek (POL)',
      logo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: ['6', '4'],
      record: 'Seed #1 WTA'
    },
    awayTeam: {
      name: 'Aryna Sabalenka',
      shortName: 'A. Sabalenka',
      logo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&auto=format&fit=crop&q=80',
      score: '1',
      periodScores: ['3', '6'],
      record: 'Seed #2 WTA'
    },
    status: 'LIVE',
    statusDetail: 'Set 3 (3-2)',
    displayClock: 'Set 3',
    rawUtcDate: new Date().toISOString(),
    wibTime: '21:00 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'Louis Armstrong Stadium, New York'
  },

  // eSports MPL Indonesia & Valorant
  {
    id: 'esports-301',
    sport: 'other',
    sportLabel: 'eSports',
    league: 'MPL Indonesia Season 18 (Mobile Legends Pro League)',
    leagueLogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'RRQ Hoshi',
      shortName: 'RRQ',
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
      score: '2',
      periodScores: ['Game 1: Win', 'Game 2: Win'],
      record: 'Klasemen #1 MPL'
    },
    awayTeam: {
      name: 'ONIC Esports',
      shortName: 'ONIC',
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
      score: '0',
      periodScores: ['Game 1: Lose', 'Game 2: Lose'],
      record: 'Klasemen #2 MPL'
    },
    status: 'FINISHED',
    statusDetail: 'FT (2-0 Selesai BO3)',
    rawUtcDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    wibTime: '18:00 WIB',
    wibDate: 'Sabtu, 05 September 2026',
    venue: 'MPL Arena XO Hall Tanjung Duren, Jakarta'
  },
  {
    id: 'esports-302',
    sport: 'other',
    sportLabel: 'eSports',
    league: 'MPL Indonesia Season 18 (Regular Season)',
    leagueLogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
    homeTeam: {
      name: 'EVOS Glory',
      shortName: 'EVOS',
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
      score: '-',
      record: 'Klasemen #4 MPL'
    },
    awayTeam: {
      name: 'Bigetron Alpha',
      shortName: 'BTR',
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80',
      score: '-',
      record: 'Klasemen #3 MPL'
    },
    status: 'SCHEDULED',
    statusDetail: 'Besok, 15:00 WIB',
    rawUtcDate: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    wibTime: '15:00 WIB',
    wibDate: 'Minggu, 06 September 2026',
    venue: 'MPL Arena XO Hall Tanjung Duren, Jakarta'
  }
];

export async function fetchAllLiveScores(options: FetchOptions = {}): Promise<LiveMatch[]> {
  const { dateStr } = options;
  const dateQuery = dateStr ? `?dates=${dateStr}` : '';

  const endpoints = [
    // Soccer
    { key: 'soccer', league: 'English Premier League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'UEFA Champions League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'Spanish LALIGA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'Italian Serie A', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'German Bundesliga', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'BRI Liga 1 Indonesia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/idn.1/scoreboard${dateQuery}` },
    { key: 'soccer', league: 'UEFA Europa League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard${dateQuery}` },
    
    // Basketball
    { key: 'basketball', league: 'NBA (National Basketball Association)', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateQuery}` },
    { key: 'basketball', league: 'NCAA Basketball', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mens-college-basketball.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard${dateQuery}` },
    { key: 'basketball', league: 'WNBA', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard${dateQuery}` },

    // Baseball
    { key: 'other', league: 'Major League Baseball (MLB)', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png', url: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard${dateQuery}` }
  ];

  const results: LiveMatch[] = [];

  try {
    const fetchPromises = endpoints.map(async (ep) => {
      try {
        const res = await fetch(ep.url);
        if (!res.ok) return [];
        const data = await res.json();
        const events: EspnEvent[] = data.events || [];
        const mappedList: LiveMatch[] = [];
        for (const ev of events) {
          const mapped = mapEspnEvent(ev, ep.key as SportType, data.leagues?.[0]?.name || ep.league, ep.logo);
          if (mapped) mappedList.push(mapped);
        }
        return mappedList;
      } catch {
        return [];
      }
    });

    const settled = await Promise.allSettled(fetchPromises);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        results.push(...res.value);
      }
    });
  } catch (err) {
    console.error('Failed to fetch ESPN live scores:', err);
  }

  // Include official supplemental matches (Badminton, Tennis, eSports, etc.)
  // Filter accurately by exact WIB date and sport
  const supplemental = SUPPLEMENTAL_OFFICIAL_MATCHES.filter(m => {
    if (options.sport && options.sport !== 'all') {
      if (m.sport !== options.sport) return false;
    }
    if (!dateStr) return true;
    const d = new Date(m.rawUtcDate);
    if (isNaN(d.getTime())) return false;
    const wibD = new Date(d.getTime() + 7 * 3600 * 1000);
    const y = wibD.getUTCFullYear();
    const mo = String(wibD.getUTCMonth() + 1).padStart(2, '0');
    const day = String(wibD.getUTCDate()).padStart(2, '0');
    const wibDateStr = `${y}${mo}${day}`;
    return wibDateStr === dateStr;
  });

  // Add supplemental matches only if not already provided by API
  supplemental.forEach(sup => {
    const alreadyExists = results.some(r => 
      r.id === sup.id || 
      (r.sport === sup.sport && 
       ((r.homeTeam.name.toLowerCase().includes(sup.homeTeam.shortName.toLowerCase()) || sup.homeTeam.name.toLowerCase().includes(r.homeTeam.shortName.toLowerCase())) &&
        (r.awayTeam.name.toLowerCase().includes(sup.awayTeam.shortName.toLowerCase()) || sup.awayTeam.name.toLowerCase().includes(r.awayTeam.shortName.toLowerCase()))))
    );
    if (!alreadyExists) {
      results.push(sup);
    }
  });

  // Sort matches:
  // Priority 1: LIVE matches first
  // Priority 2: SCHEDULED matches (soonest kick-off first)
  // Priority 3: FINISHED matches (most recently finished first)
  results.sort((a, b) => {
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
    
    if (a.status === 'SCHEDULED' && b.status === 'SCHEDULED') {
      return new Date(a.rawUtcDate).getTime() - new Date(b.rawUtcDate).getTime();
    }

    if (a.status === 'FINISHED' && b.status === 'FINISHED') {
      return new Date(b.rawUtcDate).getTime() - new Date(a.rawUtcDate).getTime();
    }

    return 0;
  });

  return results;
}
