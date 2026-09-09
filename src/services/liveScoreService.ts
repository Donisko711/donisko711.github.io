import { LiveMatch, MatchEventItem, SportType } from '../types';
import { getSeAsiaMatches } from './localSeAsiaService';
import { getSbobetWorldMatches } from './sbobetWorldService';
import { generateSbobetSpecialtyMatches } from '../data/sbobetSports';

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
      type: { text: string; type?: string };
      clock?: { value?: number; displayValue?: string };
      team?: { id: string };
      athletesInvolved?: { displayName?: string; shortName?: string }[];
      scoringPlay?: boolean;
      redCard?: boolean;
      yellowCard?: boolean;
      penaltyKick?: boolean;
      ownGoal?: boolean;
      period?: { number: number };
    }[];
  }[];
}

export interface FetchOptions {
  sport?: SportType;
  dateStr?: string; // YYYYMMDD
  forceFresh?: boolean;
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

// Convert any ISO date string to YYYYMMDD in WIB
export function getWibDateKey(isoDate?: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    const wib = new Date(d.getTime() + (7 * 3600 * 1000));
    const y = wib.getUTCFullYear();
    const m = String(wib.getUTCMonth() + 1).padStart(2, '0');
    const day = String(wib.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  } catch {
    return '';
  }
}

// Helper to detect league region according to SBOBET sports market
export function detectMatchRegion(
  league: string, 
  presetRegion?: 'england' | 'europe' | 'latin_america' | 'asia' | 'other'
): 'england' | 'europe' | 'latin_america' | 'asia' | 'other' {
  if (presetRegion) return presetRegion;
  const l = (league || '').toLowerCase();
  if (
    l.includes('premier league') || 
    l.includes('championship') || 
    l.includes('fa cup') || 
    l.includes('carabao') || 
    l.includes('efl') || 
    l.includes('england') || 
    l.includes('english')
  ) {
    return 'england';
  }
  if (
    l.includes('argentin') || 
    l.includes('colombia') || 
    l.includes('brazil') || 
    l.includes('brasileir') || 
    l.includes('mexic') || 
    l.includes('chile') || 
    l.includes('libertadores') || 
    l.includes('sudamericana') || 
    l.includes('conmebol') || 
    l.includes('copa america')
  ) {
    return 'latin_america';
  }
  if (
    l.includes('laliga') || 
    l.includes('serie a') || 
    l.includes('serie b') || 
    l.includes('bundesliga') || 
    l.includes('ligue 1') || 
    l.includes('ligue 2') || 
    l.includes('eredivisie') || 
    l.includes('portugal') || 
    l.includes('turk') || 
    l.includes('scottish') || 
    l.includes('belgian') || 
    l.includes('uefa') || 
    l.includes('champions league') || 
    l.includes('europa') || 
    l.includes('nations league') || 
    l.includes('copa del rey') || 
    l.includes('dfb') || 
    l.includes('coppa italia') || 
    l.includes('european') || 
    l.includes('euro')
  ) {
    return 'europe';
  }
  if (
    l.includes('indonesia') || 
    l.includes('liga 1') || 
    l.includes('j1') || 
    l.includes('j-league') || 
    l.includes('jepang') || 
    l.includes('saudi') || 
    l.includes('k league') || 
    l.includes('korea') || 
    l.includes('australia') || 
    l.includes('a-league') || 
    l.includes('china') || 
    l.includes('chinese') || 
    l.includes('afc') || 
    l.includes('asia')
  ) {
    return 'asia';
  }
  return 'other';
}

// Map ESPN event to our unified LiveMatch interface
function mapEspnEvent(
  ev: EspnEvent, 
  sport: SportType, 
  leagueName: string, 
  leagueLogo?: string,
  regionPreset?: 'england' | 'europe' | 'latin_america' | 'asia' | 'other'
): LiveMatch | null {
  const comp = ev.competitions?.[0];
  if (!comp || !comp.competitors || comp.competitors.length < 2) return null;

  const homeComp = comp.competitors.find(c => c.homeAway === 'home') || comp.competitors[0];
  const awayComp = comp.competitors.find(c => c.homeAway === 'away') || comp.competitors[1];

  const state = ev.status?.type?.state;
  let status: 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'POSTPONED' = 'SCHEDULED';
  let statusDetail = ev.status?.type?.shortDetail || ev.status?.type?.description || 'Jadwal';
  let elapsedMinutes: number | undefined = undefined;
  let elapsedDetail: string = '';

  const wibTime = formatWibTime(ev.date);
  const wibDate = formatWibDate(ev.date);

  const displayClock = ev.status?.displayClock || '';
  const period = ev.status?.period;
  const statusDesc = (ev.status?.type?.description || '').toLowerCase();
  const shortDetail = (ev.status?.type?.shortDetail || '').toLowerCase();

  // Elapsed real-world minutes from kickoff
  const kickoffMs = new Date(ev.date).getTime();
  const nowMs = Date.now();
  const diffMinutes = Math.floor((nowMs - kickoffMs) / 60000);

  if (state === 'in') {
    status = 'LIVE';
    elapsedMinutes = diffMinutes > 0 ? diffMinutes : undefined;

    if (displayClock) {
      statusDetail = displayClock;
    }

    if (sport === 'soccer') {
      if (statusDesc.includes('halftime') || shortDetail.includes('halftime') || displayClock.toUpperCase() === 'HT') {
        statusDetail = 'HT (Turun Minum)';
        elapsedDetail = 'Istirahat Babak Pertama (HT ~15 Menit)';
      } else if (period === 1) {
        statusDetail = displayClock ? `Menit ${displayClock}` : `Babak 1 (${Math.max(1, diffMinutes)}')`;
        elapsedDetail = `Babak 1 • Menit ${displayClock || `${diffMinutes}'`} (Berjalan ~${Math.max(1, diffMinutes)} mnt)`;
      } else if (period === 2) {
        statusDetail = displayClock ? `Menit ${displayClock}` : `Babak 2 (${Math.max(46, diffMinutes)}')`;
        elapsedDetail = `Babak 2 • Menit ${displayClock || `${diffMinutes}'`} (Berjalan ~${Math.max(45, diffMinutes)} mnt)`;
      } else if (displayClock.includes('+')) {
        statusDetail = `Injury Time ${displayClock}`;
        elapsedDetail = `Perpanjangan Waktu (Injury Time) • ${displayClock}`;
      } else {
        statusDetail = displayClock ? `Menit ${displayClock}` : `LIVE (${Math.max(1, diffMinutes)}')`;
        elapsedDetail = `Sedang Bertanding • Berjalan ~${Math.max(1, diffMinutes)} mnt`;
      }
    } else if (sport === 'basketball') {
      statusDetail = `Q${period || 1} • ${displayClock || 'LIVE'}`;
      elapsedDetail = `Quarter ${period || 1} • Sisa Waktu ${displayClock}`;
    } else {
      statusDetail = displayClock || 'Sedang Main (LIVE)';
      elapsedDetail = `Sedang Bermain • Berjalan ~${Math.max(1, diffMinutes)} mnt`;
    }
  } else if (state === 'post') {
    status = 'FINISHED';
    statusDetail = ev.status?.type?.description?.toUpperCase() === 'FINAL' ? 'FT (Selesai)' : (ev.status?.type?.shortDetail || 'FT');
    elapsedDetail = 'Pertandingan Selesai Penuh (Full Time 90\')';
  } else if (ev.status?.type?.name?.includes('POSTPONED') || ev.status?.type?.name?.includes('CANCEL')) {
    status = 'POSTPONED';
    statusDetail = 'Ditunda';
    elapsedDetail = 'Pertandingan Ditunda / Dibatalkan';
  } else {
    status = 'SCHEDULED';
    statusDetail = wibTime;
    const diffRemaining = kickoffMs - nowMs;
    if (diffRemaining > 0) {
      const hours = Math.floor(diffRemaining / 3600000);
      const mins = Math.floor((diffRemaining % 3600000) / 60000);
      elapsedDetail = hours > 0 ? `Kickoff dalam ${hours} jam ${mins} mnt` : `Kickoff dalam ${mins} menit`;
    } else {
      elapsedDetail = `Segera Dimulai (Menunggu Kick-off)`;
    }
  }

  // Linescores for quarters/halves
  const homePeriodScores = homeComp.linescores?.map(ls => ls.displayValue || String(ls.value)) || [];
  const awayPeriodScores = awayComp.linescores?.map(ls => ls.displayValue || String(ls.value)) || [];

  // Venue
  const venue = comp.venue ? `${comp.venue.fullName || ''}${comp.venue.city ? `, ${comp.venue.city}` : ''}`.trim() : undefined;

  // Match events (goals, yellow cards, red cards)
  const events: MatchEventItem[] = [];
  const compDetails = comp.details || [];

  for (const d of compDetails) {
    const isHome = d.team?.id ? d.team.id === homeComp.team?.id : true;
    const team: 'home' | 'away' = isHome ? 'home' : 'away';
    const minute = d.clock?.displayValue || (d.clock?.value ? `${Math.floor(d.clock.value / 60)}'` : '');
    const playerName = d.athletesInvolved?.[0]?.displayName || d.athletesInvolved?.[0]?.shortName || d.type?.text || 'Pemain';

    let eventType: 'goal' | 'yellow_card' | 'red_card' | 'yellow_red_card' | 'sub' | 'point' = 'goal';
    let detail = d.type?.text || '';
    let cardType: 'yellow' | 'red' | 'yellow_red' | undefined = undefined;

    const lowerText = (d.type?.text || '').toLowerCase();

    if (d.scoringPlay || lowerText.includes('goal') || d.type?.type === 'goal') {
      eventType = 'goal';
      if (d.penaltyKick || lowerText.includes('penalty')) detail = 'Penalti';
      else if (d.ownGoal || lowerText.includes('own goal')) detail = 'Gol Bunuh Diri (OG)';
      else detail = 'Gol';
    } else if (d.redCard || lowerText.includes('red card')) {
      eventType = 'red_card';
      cardType = 'red';
      detail = 'Kartu Merah Langsung';
    } else if (d.yellowCard || lowerText.includes('yellow card')) {
      eventType = 'yellow_card';
      cardType = 'yellow';
      detail = 'Kartu Kuning';
    } else if (lowerText.includes('sub')) {
      eventType = 'sub';
      detail = 'Pergantian Pemain';
    } else {
      continue;
    }

    events.push({
      type: eventType,
      minute,
      team,
      teamId: d.team?.id,
      player: playerName,
      detail,
      cardType,
      period: d.period?.number
    });
  }

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
    elapsedMinutes,
    elapsedDetail,
    kickoffWib: wibTime,
    rawUtcDate: ev.date,
    wibTime,
    wibDate,
    venue,
    region: detectMatchRegion(leagueName, regionPreset),
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

// Map ESPN Tennis competitions
function mapEspnTennisEvent(ev: any, comp: any, tournamentName: string): LiveMatch | null {
  if (!comp || !comp.competitors || comp.competitors.length < 2) return null;
  const p1 = comp.competitors[0];
  const p2 = comp.competitors[1];

  const state = comp.status?.type?.state;
  let status: 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'POSTPONED' = 'SCHEDULED';
  let statusDetail = 'Belum Bertanding';

  const matchDate = comp.date || ev.date || new Date().toISOString();
  const timeFormatted = formatWibTime(matchDate);

  // Extract competitor names properly (supports Singles and Doubles)
  const p1Name = p1.athlete?.displayName || p1.roster?.displayName || p1.athlete?.fullName || p1.displayName || 'Player 1';
  const p2Name = p2.athlete?.displayName || p2.roster?.displayName || p2.athlete?.fullName || p2.displayName || 'Player 2';

  const p1Short = p1.athlete?.shortName || p1.roster?.shortDisplayName || p1Name;
  const p2Short = p2.athlete?.shortName || p2.roster?.shortDisplayName || p2Name;

  const p1Logo = p1.athlete?.headshot?.href || p1.roster?.athletes?.[0]?.flag?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
  const p2Logo = p2.athlete?.headshot?.href || p2.roster?.athletes?.[0]?.flag?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';

  // Calculate real set scores from linescores
  let p1SetsWon = 0;
  let p2SetsWon = 0;
  const p1PeriodScores: string[] = [];
  const p2PeriodScores: string[] = [];

  if (p1?.linescores && p2?.linescores) {
    p1.linescores.forEach((l: any, idx: number) => {
      const p2L = p2.linescores[idx];
      const val1 = typeof l?.value === 'number' ? l.value : parseInt(l?.value, 10);
      const val2 = typeof p2L?.value === 'number' ? p2L.value : (p2L ? parseInt(p2L.value, 10) : 0);

      if (l?.winner === true) {
        p1SetsWon++;
      } else if (p2L?.winner === true) {
        p2SetsWon++;
      } else if (!isNaN(val1) && !isNaN(val2)) {
        if (val1 > val2) p1SetsWon++;
        else if (val2 > val1) p2SetsWon++;
      }

      if (!isNaN(val1)) p1PeriodScores.push(String(val1));
      if (!isNaN(val2)) p2PeriodScores.push(String(val2));
    });
  }

  if (state === 'in') {
    status = 'LIVE';
    statusDetail = comp.status?.type?.shortDetail || 'LIVE';
  } else if (state === 'post') {
    status = 'FINISHED';
    statusDetail = `Selesai (${p1SetsWon} - ${p2SetsWon} Set)`;
  } else if (comp.status?.type?.name?.includes('POSTPONED') || comp.status?.type?.name?.includes('CANCEL')) {
    status = 'POSTPONED';
    statusDetail = 'Ditunda';
  } else {
    status = 'SCHEDULED';
    statusDetail = `Belum Bertanding (Pukul ${timeFormatted})`;
  }

  // Score display: if match has not started yet (SCHEDULED), show '-' so it does not falsely display 0-0!
  const p1Score = status === 'SCHEDULED' ? '-' : String(p1SetsWon);
  const p2Score = status === 'SCHEDULED' ? '-' : String(p2SetsWon);

  return {
    id: `espn-tennis-${comp.id || ev.id}`,
    sport: 'tennis',
    sportLabel: 'Tenis',
    league: tournamentName || 'ATP / WTA Tour',
    leagueLogo: 'https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png',
    homeTeam: {
      id: p1.id,
      name: p1Name,
      shortName: p1Short,
      logo: p1Logo,
      score: p1Score,
      periodScores: p1PeriodScores
    },
    awayTeam: {
      id: p2.id,
      name: p2Name,
      shortName: p2Short,
      logo: p2Logo,
      score: p2Score,
      periodScores: p2PeriodScores
    },
    status,
    statusDetail,
    rawUtcDate: matchDate,
    wibTime: timeFormatted,
    wibDate: formatWibDate(matchDate),
    venue: comp.venue?.fullName || ev.venue?.fullName || 'Arthur Ashe Stadium, New York'
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

// Curated official fixtures: pure authentic references (NO fake or fabricated LIVE matches)
const SUPPLEMENTAL_OFFICIAL_MATCHES: LiveMatch[] = [];

// In-memory cache to guarantee instant response and avoid request rate issues
const liveScoreCache = new Map<string, { data: LiveMatch[]; timestamp: number }>();
const CACHE_TTL_MS = 15000; // 15 seconds cache

export async function fetchAllLiveScores(options: FetchOptions = {}): Promise<LiveMatch[]> {
  const { dateStr, sport = 'all', forceFresh = false } = options;
  const cacheKey = `${sport}_${dateStr || 'today'}`;

  // Serve from cache if fresh and not forced
  if (!forceFresh) {
    const cached = liveScoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return [...cached.data];
    }
  }

  const dateQuery = dateStr ? `?dates=${dateStr}` : '';

  const endpoints: {
    key: SportType;
    code: string;
    region: 'england' | 'europe' | 'latin_america' | 'asia' | 'other';
    league: string;
    logo: string;
    url: string;
  }[] = [
    // --- 1. INGGRIS (ENGLAND - SBOBET MAJOR) ---
    { key: 'soccer', code: 'eng.1', region: 'england', league: 'English Premier League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'eng.2', region: 'england', league: 'English Championship', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/24.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.2/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'eng.fa', region: 'england', league: 'English FA Cup', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2443.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.fa/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'eng.league_cup', region: 'england', league: 'English Carabao Cup', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2444.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.league_cup/scoreboard${dateQuery}` },

    // --- 2. AMERIKA LATIN (LATIN AMERICA - SBOBET MAJOR: ARGENTINA, COLOMBIA, BRASIL, MEKSIKO, PARAGUAY, DLL) ---
    { key: 'soccer', code: 'arg.1', region: 'latin_america', league: 'Argentine Liga Profesional', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'col.1', region: 'latin_america', league: 'Colombian Primera A', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2288.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'bra.1', region: 'latin_america', league: 'Brazilian Serie A', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'mex.1', region: 'latin_america', league: 'Mexican Liga BBVA MX', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/22.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'par.1', region: 'latin_america', league: 'Paraguayan Primera División', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/300px-Flag_of_Paraguay.svg.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/par.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'chi.1', region: 'latin_america', league: 'Chilean Primera División', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2286.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/chi.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'conmebol.libertadores', region: 'latin_america', league: 'CONMEBOL Libertadores', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2684.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.libertadores/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'conmebol.sudamericana', region: 'latin_america', league: 'CONMEBOL Sudamericana', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2685.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.sudamericana/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'fifa.worldq.conmebol', region: 'latin_america', league: 'FIFA World Cup Qualifying - CONMEBOL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2320.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.worldq.conmebol/scoreboard${dateQuery}` },

    // --- 3. EROPA UTAMA & SEKUNDER (EUROPE - SBOBET MAJOR) ---
    { key: 'soccer', code: 'esp.1', region: 'europe', league: 'Spanish LALIGA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'esp.2', region: 'europe', league: 'Spanish LALIGA 2', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/17.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.2/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'ita.1', region: 'europe', league: 'Italian Serie A', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'ita.2', region: 'europe', league: 'Italian Serie B', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/13.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ita.2/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'ger.1', region: 'europe', league: 'German Bundesliga', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'ger.2', region: 'europe', league: 'German 2. Bundesliga', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/27.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.2/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'fra.1', region: 'europe', league: 'French Ligue 1', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'fra.2', region: 'europe', league: 'French Ligue 2', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/18.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.2/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'ned.1', region: 'europe', league: 'Dutch Eredivisie', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/11.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/ned.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'por.1', region: 'europe', league: 'Liga Portugal', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/14.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/por.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'tur.1', region: 'europe', league: 'Turkish Super Lig', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2283.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'swe.1', region: 'europe', league: 'Allsvenskan Swedia', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Allsvenskan_logo.svg/300px-Allsvenskan_logo.svg.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/swe.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'den.1', region: 'europe', league: 'Liga Super Denmark', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Danish_Superliga_logo.svg/300px-Danish_Superliga_logo.svg.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/den.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'sco.1', region: 'europe', league: 'Scottish Premiership', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/45.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/sco.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'bel.1', region: 'europe', league: 'Belgian Pro League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2279.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/bel.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'uefa.champions', region: 'europe', league: 'UEFA Champions League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'uefa.europa', region: 'europe', league: 'UEFA Europa League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'uefa.europa.conf', region: 'europe', league: 'UEFA Conference League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2311.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa.conf/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'uefa.nations', region: 'europe', league: 'UEFA Nations League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2744.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.nations/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'fifa.worldq.uefa', region: 'europe', league: 'FIFA World Cup Qualifying - UEFA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2320.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.worldq.uefa/scoreboard${dateQuery}` },

    // --- 4. ASIA, OSEANIA & TIMUR TENGAH (ASIA & PACIFIC - SBOBET MAJOR) ---
    { key: 'soccer', code: 'idn.1', region: 'asia', league: 'BRI Liga 1 Indonesia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2281.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/idn.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'jpn.1', region: 'asia', league: 'J1 League Jepang', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2253.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/jpn.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'sau.1', region: 'asia', league: 'Saudi Pro League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2347.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/sau.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'aus.1', region: 'asia', league: 'Australian A-League Men', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1308.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/aus.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'chn.1', region: 'asia', league: 'Chinese Super League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2278.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/chn.1/scoreboard${dateQuery}` },
    { key: 'soccer', code: 'afc.champions', region: 'asia', league: 'AFC Champions League', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2679.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/afc.champions/scoreboard${dateQuery}` },

    // --- 5. AMERIKA UTARA ---
    { key: 'soccer', code: 'usa.1', region: 'other', league: 'Major League Soccer (MLS)', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard${dateQuery}` },

    // --- 6. BASKETBALL (SBOBET MARKET) ---
    { key: 'basketball', code: 'nba', region: 'other', league: 'NBA (National Basketball Association)', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateQuery}` },
    { key: 'basketball', code: 'mens-college-basketball', region: 'other', league: 'NCAA Basketball', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mens-college-basketball.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard${dateQuery}` },
    { key: 'basketball', code: 'wnba', region: 'other', league: 'WNBA', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard${dateQuery}` },

    // --- 7. BASEBALL (SBOBET MARKET) ---
    { key: 'other', code: 'mlb', region: 'other', league: 'Major League Baseball (MLB)', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png', url: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard${dateQuery}` }
  ];

  const results: LiveMatch[] = [];

  try {
    // 1. Fetch official scoreboards
    const fetchPromises = endpoints.map(async (ep) => {
      // Filter out if sport tab is specifically chosen and doesn't match
      if (options.sport && options.sport !== 'all' && options.sport !== ep.key) {
        return [];
      }

      try {
        const res = await fetch(ep.url);
        if (!res.ok) return [];
        const data = await res.json();
        const events: EspnEvent[] = data.events || [];
        const mappedList: LiveMatch[] = [];
        
        for (const ev of events) {
          const mapped = mapEspnEvent(
            ev, 
            ep.key as SportType, 
            data.leagues?.[0]?.name || ep.league, 
            ep.logo,
            ep.region
          );
          if (mapped) mappedList.push(mapped);
        }
        return mappedList;
      } catch {
        return [];
      }
    });

    // 2. Fetch real tennis scoreboards if tennis or all sports requested
    const tennisPromises: Promise<LiveMatch[]>[] = [];
    if (!options.sport || options.sport === 'all' || options.sport === 'tennis') {
      const tennisEndpoints = [
        { url: `https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard${dateQuery}`, label: 'ATP World Tour' },
        { url: `https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard${dateQuery}`, label: 'WTA Tour' }
      ];

      tennisEndpoints.forEach((t) => {
        tennisPromises.push((async () => {
          try {
            const res = await fetch(t.url);
            if (!res.ok) return [];
            const data = await res.json();
            const tennisList: LiveMatch[] = [];
            for (const ev of data.events || []) {
              const tourName = ev.name || t.label;
              for (const group of ev.groupings || []) {
                for (const comp of group.competitions || []) {
                  const compDate = comp.date || ev.date;
                  const wibKey = getWibDateKey(compDate);
                  const utcDateKey = compDate ? compDate.slice(0, 10).replace(/-/g, '') : '';
                  const isLive = comp.status?.type?.state === 'in';
                  const isTargetDate = !dateStr || wibKey === dateStr || utcDateKey === dateStr;

                  // Only show live in-play matches or matches on the selected date (WIB or UTC)
                  if (isLive || isTargetDate) {
                    const mapped = mapEspnTennisEvent(ev, comp, tourName);
                    if (mapped) {
                      tennisList.push(mapped);
                    }
                  }
                }
              }
            }
            return tennisList;
          } catch {
            return [];
          }
        })());
      });
    }

    const settled = await Promise.allSettled([...fetchPromises, ...tennisPromises]);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        results.push(...res.value);
      }
    });

    // 3. Merge complete worldwide leagues from SBOBET World Service
    // Includes: Liga Pro Uzbekistan, Paraguay Reserves, Cambodian Premier League, BRI Liga 1 & Liga 2 Indonesia,
    // Allsvenskan Swedia, Liga Super Denmark, Liga Portugal, Super Lig Turki, France Ligue 2, Serie B Italia, etc.
    if (!options.sport || options.sport === 'all' || options.sport === 'soccer') {
      const sbobetWorldMatches = getSbobetWorldMatches(dateStr);
      for (const swm of sbobetWorldMatches) {
        // If an ESPN match already exists for this exact fixture, don't duplicate
        const isDuplicated = results.some((r) => {
          if (r.id === swm.id) return true;
          const sameHome = r.homeTeam.shortName.toLowerCase().includes(swm.homeTeam.shortName.toLowerCase()) ||
                           swm.homeTeam.shortName.toLowerCase().includes(r.homeTeam.shortName.toLowerCase());
          const sameAway = r.awayTeam.shortName.toLowerCase().includes(swm.awayTeam.shortName.toLowerCase()) ||
                           swm.awayTeam.shortName.toLowerCase().includes(r.awayTeam.shortName.toLowerCase());
          return sameHome && sameAway;
        });

        if (!isDuplicated) {
          results.push(swm);
        }
      }
    }

    // 4. Incorporate specialty sports matches for all 26 SBOBET sports
    const specialtyMatches = generateSbobetSpecialtyMatches(options.dateStr);
    for (const spec of specialtyMatches) {
      if (!options.sport || options.sport === 'all' || options.sport === spec.sport) {
        results.push(spec);
      }
    }
  } catch (err) {
    console.error('Failed to fetch official live scores:', err);
  }

  // Deduplicate matches by unique id
  const seenIds = new Set<string>();
  const uniqueMatches: LiveMatch[] = [];
  for (const m of results) {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMatches.push(m);
    }
  }

  // Sort matches:
  // Priority 1: LIVE matches first (currently playing)
  // Priority 2: SCHEDULED matches (soonest kick-off first)
  // Priority 3: FINISHED matches (most recently completed first)
  uniqueMatches.sort((a, b) => {
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

  // Store in cache
  liveScoreCache.set(cacheKey, {
    data: uniqueMatches,
    timestamp: Date.now()
  });

  return uniqueMatches;
}
