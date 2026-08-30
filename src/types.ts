export type ShiftType = 'PAGI' | 'SORE' | 'MALAM';

export type UserRole = 'CS' | 'KASIR' | 'SUPERVISOR' | 'ADMIN' | 'CS_SENIOR';

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
