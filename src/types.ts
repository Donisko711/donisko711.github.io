export type ShiftType = 'PAGI' | 'SORE' | 'MALAM';

export type UserRole = 'CS' | 'KASIR' | 'SUPERVISOR' | 'ADMIN' | 'CS_SENIOR' | 'SECRETARY';

export interface UserProfile {
  id?: string;
  username: string;
  name: string;
  role: UserRole | string;
  currentShift?: ShiftType;
  shift: ShiftType;
  avatar?: string;
  token?: string;
}

export interface JobdeskTask {
  id: string;
  title: string;
  category: 'CS' | 'KASIR';
  shift: ShiftType;
  completed: boolean;
  order: number;
  timeNote?: string;
  description?: string;
  createdAt?: string;
}

export interface ScriptItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags?: string[];
  type: 'MEMO' | 'LC';
  createdAt?: string;
}

export interface ScriptChatItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  content: string;
}

export interface ModulItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  content: string;
}

export interface LaporanGantiDataItem {
  id: string;
  username: string;
  oldData: string;
  newData: string;
  dataType: 'NO_REK' | 'NAMA_REK' | 'NO_HP' | 'EMAIL' | 'BANK';
  reason: string;
  operator: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  proofUrl?: string;
}

export interface LaporanLockItem {
  id: string;
  username: string;
  action: 'LOCK' | 'UNLOCK';
  reason: string;
  ipAddress?: string;
  operator: string;
  timestamp: string;
  status: 'SUCCESS' | 'WAITING_SUPERVISOR';
}

export interface ParlayMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  betType: 'HDP' | 'OU' | '1X2' | 'OE';
  pick: string;
  odds: number;
  status: 'WIN' | 'WIN_HALF' | 'DRAW' | 'LOSE_HALF' | 'LOSE' | 'CANCEL';
}

export interface WdFlopItem {
  id: string;
  username: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  flopCode?: string;
  status: 'PENDING' | 'PROCESSED' | 'REJECT' | 'HOLD';
  time: string;
}

export interface TogelPasaran {
  id: string;
  name: string;
  code: string;
  country: string;
  closeTime: string;
  resultTime: string;
  days: string[];
  lastResult?: string;
  website?: string;
}

export interface DashboardModuleCard {
  id: string;
  title: string;
  category: 'KASIR' | 'CS' | 'PRODUK' | 'SISTEM';
  categoryLabel: string;
  description: string;
  badge?: 'BARU' | 'UTAMA' | 'POPULER';
  icon: string;
  actionMenuId: string;
}

export type SportType = 'all' | 'soccer' | 'basketball' | 'badminton' | 'tennis' | 'other';
export type MatchStatusFilter = 'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED';

export interface CompetitorTeam {
  id?: string;
  name: string;
  shortName: string;
  logo?: string;
  score?: number | string;
  periodScores?: (number | string)[];
  record?: string;
  form?: string[];
  ranking?: number | string;
}

export interface MatchEventItem {
  type: 'goal' | 'card' | 'sub' | 'point';
  minute?: string;
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

export interface LiveMatch {
  id: string;
  sport: SportType;
  sportLabel: string;
  league: string;
  leagueCode?: string;
  leagueLogo?: string;
  country?: string;
  season?: string;
  homeTeam: CompetitorTeam;
  awayTeam: CompetitorTeam;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'POSTPONED';
  statusDetail: string;
  period?: number | string;
  displayClock?: string;
  rawUtcDate: string;
  wibTime: string;
  wibDate: string;
  venue?: string;
  events?: MatchEventItem[];
  isBigMatch?: boolean;
  h2h?: {
    totalMeetings?: number;
    homeWins?: number;
    draws?: number;
    awayWins?: number;
    recentMatches?: {
      date: string;
      homeTeam: string;
      awayTeam: string;
      score: string;
      winner: 'home' | 'away' | 'draw';
    }[];
  };
}

export type LiveScoreAlertType = 'KICKOFF' | 'GOAL' | 'FULLTIME' | 'INFO';

export interface LiveScoreAlertItem {
  id: string;
  type: LiveScoreAlertType;
  matchId: string;
  matchTitle: string;
  league: string;
  timeWib: string;
  title: string;
  message: string;
  scoringTeam?: string;
  scorerName?: string;
  minute?: string;
  currentScore?: string;
  winner?: string;
  timestamp: number;
}

export interface SeasonArchiveMatch {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueLogo?: string;
  season: string; // e.g. '2026/2027', '2025/2026', '2024/2025', '2023/2024'
  matchweek: number;
  matchweekLabel: string; // e.g. 'Pekan 1', 'Pekan 2'
  dateIso: string;
  wibDate: string; // e.g. 'Selasa, 01 September 2026'
  wibTime: string; // e.g. '02:30 WIB'
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    score: number;
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    score: number;
  };
  halftimeScore?: string;
  status: 'FINISHED' | 'POSTPONED';
  venue?: string;
  scorers?: {
    player: string;
    minute: string;
    team: 'home' | 'away';
  }[];
  referee?: string;
}

export interface LeagueStandingItem {
  position: number;
  teamId?: string;
  teamName: string;
  shortName: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  zoneType?: 'ucl' | 'ucl_qual' | 'uel' | 'uecl' | 'relegation' | 'normal';
  zoneDescription?: string;
}

export interface LeagueSeasonInfo {
  id: string;
  name: string;
  country: string;
  logo: string;
  currentSeason: string;
  seasons: string[];
  startDate2026: string; // '22 Agustus 2026'
}
