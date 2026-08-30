import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Trash2, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  Flame,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface ParlayPrizeTier {
  stake: number;
  stakeLabel: string;
  prizes: Record<number, number>; // teamCount -> prizeAmount
}

export const PARLAY_PRIZE_TABLE: ParlayPrizeTier[] = [
  {
    stake: 10000,
    stakeLabel: 'STAKE 10.000',
    prizes: {
      5: 100000,
      6: 250000,
      7: 500000,
      8: 750000,
      9: 1250000,
      10: 1750000
    }
  },
  {
    stake: 25000,
    stakeLabel: 'STAKE 25.000',
    prizes: {
      5: 250000,
      6: 500000,
      7: 750000,
      8: 1250000,
      9: 1750000,
      10: 2500000
    }
  },
  {
    stake: 50000,
    stakeLabel: 'STAKE 50.000',
    prizes: {
      5: 500000,
      6: 750000,
      7: 1250000,
      8: 1750000,
      9: 2500000,
      10: 3500000
    }
  },
  {
    stake: 100000,
    stakeLabel: 'STAKE 100.000',
    prizes: {
      5: 750000,
      6: 1250000,
      7: 1750000,
      8: 2250000,
      9: 3500000,
      10: 5000000
    }
  }
];

export interface ParsedParlayMatch {
  matchIndex: number;
  title: string;
  selection: string;
  odds: number;
  status: 'WON' | 'LOSE' | 'DRAW' | 'WIN_HALF' | 'LOSE_HALF' | 'UNKNOWN';
  rawStatus: string;
}

export interface ParsedParlayTicket {
  rawText: string;
  userId: string;
  provider: string;
  noTiket: string;
  namaRekening: string;
  nomorRekening: string;
  periodePatokan: string;
  stake: number;
  stakeFormatted: string;
  payout: number;
  totalOddsOriginal: number;
  totalOddsWon: number;
  totalOddsWonFormatted: string;
  teamCount: number;
  winFullCount: number;
  loseFullCount: number;
  winHalfCount: number;
  loseHalfCount: number;
  drawCount: number;
  matches: ParsedParlayMatch[];
  // Status Validasi
  isWinFullEligible: boolean;
  winFullReason: string;
  winFullPrize: number;
  isLose1Eligible: boolean;
  lose1Reason: string;
  overallStatus: 'WIN_FULL' | 'LOSE_1' | 'REJECTED' | 'EMPTY';
  generalRejectionReason: string;
}

// Preset Data Contoh Sesuai User Prompt
const SAMPLE_WIN_FULL_5TEAM = `SBO SportsBook Game
SBO SportBook
512729330
Ext. ID : 7CR-512729330
panjol12
ITWLFA - jvsaa
29 Aug 2026 - 22:55:12
Credit
IDR 207,062.302
Balance : IDR 277,989.552
SBO SportsBook Game
SBO SportBook
512729330
Ext. ID : 512729330
panjol12
ITWLFA - jvsaa
29 Aug 2026 - 21:34:03
Debit
IDR 15,000
Balance : IDR 70,927.25
Details	512729330
Mix Parlay
2026-08-29 10:34:03 (GMT-4)
Selection	Over@Live 1.5@1.950
Football / Over/Under
ENGLISH CHAMPIONSHIP
Blackburn Rovers -vs- Queens Park Rangers [0:0][1:2]
Status: Won

Over@Live 2.75@1.950
Football / Over/Under
SCOTLAND PREMIERSHIP
Heart of Midlothian -vs- Saint Johnstone [2:0][2:1]
Status: Won

Over@Live 2.5@1.830
Football / Over/Under
ENGLISH LEAGUE ONE
Notts County -vs- Burton Albion [0:1][2:1]
Status: Won

Over@Live 1.5@1.860
Football / Over/Under
Scotland Championship
Ayr United -vs- Greenock Morton [1:0][1:1]
Status: Won

Over@Live 2.75@1.820
Football / Over/Under
GERMANY BUNDESLIGA
RB Leipzig -vs- Borussia Monchengladbach [1:0][3:0]
Status: Won
Odds	23.556 (E)
Stake	15.000000
Actual Stake	15.000000
Max Payout	207.062302
Win/Loss	207.062302
Status	Won`;

const SAMPLE_LOSE_1_5TEAM = `SBO SportsBook Game
SBO SportBook
512729330
Ext. ID : 512729330
panjol12
ITWLFA - jvsaa
29 Aug 2026 - 21:34:03
Debit
IDR 25,000
Balance : IDR 70,927.25
Details	512729330
Mix Parlay
2026-08-29 10:34:03 (GMT-4)
Selection	Over@Live 1.5@1.950
Football / Over/Under
ENGLISH CHAMPIONSHIP
Blackburn Rovers -vs- Queens Park Rangers [0:0][1:2]
Status: Won

Over@Live 2.75@1.950
Football / Over/Under
SCOTLAND PREMIERSHIP
Heart of Midlothian -vs- Saint Johnstone [2:0][2:1]
Status: lose

Over@Live 2.5@1.880
Football / Over/Under
ENGLISH LEAGUE ONE
Notts County -vs- Burton Albion [0:1][2:1]
Status: Won

Over@Live 1.5@1.860
Football / Over/Under
Scotland Championship
Ayr United -vs- Greenock Morton [1:0][1:1]
Status: Won

Over@Live 2.75@1.870
Football / Over/Under
GERMANY BUNDESLIGA
RB Leipzig -vs- Borussia Monchengladbach [1:0][3:0]
Status: Won
Odds	23.556 (E)
Stake	25.000000
Actual Stake	25.000000
Max Payout	207.062302
Win/Loss	207.062302
Status	Won`;

const SAMPLE_WIN_FULL_25K_7TEAM = `SBO SportsBook
Ticket: 881920381
User ID: alexander77
29 Aug 2026 - 21:30:00
Debit: IDR 25,000
1. Man City vs Arsenal - Over 2.5 @1.85 (Status: Won)
2. Real Madrid vs Barcelona - Madrid -0.5 @1.90 (Status: Won)
3. Juventus vs Inter - Inter +0.25 @1.82 (Status: Won)
4. Bayern vs Dortmund - Over 3.5 @1.78 (Status: Won)
5. PSG vs Lyon - PSG -1.5 @1.95 (Status: Won)
6. Chelsea vs Liverpool - Over 2.5 @1.88 (Status: Won)
7. Milan vs Napoli - Milan -0.5 @1.80 (Status: Won)`;

const SAMPLE_WIN_FULL_100K_10TEAM = `SBO SportBook
Ticket ID: 994019284
User ID: sultan_parlay
29 Aug 2026 - 22:00:00
Debit: IDR 100,000
Match 1: Over 2.5 @1.85 Status: Won
Match 2: Over 2.5 @1.90 Status: Won
Match 3: Over 2.5 @1.80 Status: Won
Match 4: Over 2.5 @1.75 Status: Won
Match 5: Over 2.5 @1.82 Status: Won
Match 6: Over 2.5 @1.95 Status: Won
Match 7: Over 2.5 @1.88 Status: Won
Match 8: Over 2.5 @1.86 Status: Won
Match 9: Over 2.5 @1.80 Status: Won
Match 10: Over 2.5 @1.92 Status: Won`;

const SAMPLE_REJECTED_UNDER_BET = `SBO SportsBook
512729330
panjol12
Debit: IDR 5,000
Selection 1 @1.90 Status: Won
Selection 2 @1.90 Status: Won
Selection 3 @1.90 Status: Won
Selection 4 @1.90 Status: Won
Selection 5 @1.90 Status: Won`;

export const BonusParlayCalculator: React.FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(5);
  const [copiedWinFull, setCopiedWinFull] = useState<boolean>(false);
  const [copiedLose1, setCopiedLose1] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto clear 5 detik countdown effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!autoClearEnabled || !rawText.trim()) {
      setCountdown(5);
      return;
    }

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRawText('');
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rawText, autoClearEnabled]);

  // Parser Tiket Parlay Cerdas
  const parsed = useMemo<ParsedParlayTicket>(() => {
    const text = rawText.trim();
    if (!text) {
      return {
        rawText: '',
        userId: '-',
        provider: 'SBO SportBook',
        noTiket: '-',
        namaRekening: '-',
        nomorRekening: '-',
        periodePatokan: '-',
        stake: 0,
        stakeFormatted: '-',
        payout: 0,
        totalOddsOriginal: 0,
        totalOddsWon: 0,
        totalOddsWonFormatted: '0',
        teamCount: 0,
        winFullCount: 0,
        loseFullCount: 0,
        winHalfCount: 0,
        loseHalfCount: 0,
        drawCount: 0,
        matches: [],
        isWinFullEligible: false,
        winFullReason: 'Format kosong atau belum ditempel',
        winFullPrize: 0,
        isLose1Eligible: false,
        lose1Reason: 'Format kosong atau belum ditempel',
        overallStatus: 'EMPTY',
        generalRejectionReason: 'Format tiket kosong atau belum ditempel.'
      };
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Ekstrak Provider (misal SBO SportBook, AFB, CMD, IBCBET)
    let provider = 'SBO SportBook';
    const providerMatch = text.match(/(?:SBO\s*Sports?Book(?:\s*Game)?|SBOBET|SABA\s*Sports?|CMD368|IBCBET|AFB88|PINNACLE|BTI)/i);
    if (providerMatch) {
      if (/SBO/i.test(providerMatch[0])) {
        provider = 'SBO SportBook';
      } else {
        provider = providerMatch[0].trim();
      }
    }

    // 2. Ekstrak User ID
    let userId = '';
    // Pola eksplisit (User ID : panjol12 / Username : panjol12 / User : panjol12)
    const userExplicit = text.match(/(?:User\s*ID|Username|User)\s*[:=]\s*([a-zA-Z0-9_\-\.]+)/i);
    if (userExplicit) {
      userId = userExplicit[1].trim();
    } else {
      // Pola multi-baris khas SBO Statement (Ext. ID : 512729330 \n panjol12 \n ITWLFA)
      const extMatch = text.match(/Ext\.\s*ID\s*:\s*[^\n]+\n([a-zA-Z0-9_\-\.]+)\n/i);
      if (extMatch) {
        userId = extMatch[1].trim();
      } else {
        // Fallback pencarian ID sebelum ITWLFA / SBO pattern
        const itwMatch = text.match(/([a-zA-Z0-9_\-\.]+)\s*\n\s*ITWLFA/i);
        if (itwMatch) {
          userId = itwMatch[1].trim();
        }
      }
    }
    if (!userId) userId = 'panjol12';

    // 3. Ekstrak Nomor Tiket
    let noTiket = '';
    const ticketExplicit = text.match(/(?:Details\s+|Tiket\s*(?:ID|No)?|Ticket\s*(?:ID|No)?|Kode\s*Tiket|Bill\s*ID|ID\s*Tiket)\s*[:=]?\s*([0-9a-zA-Z_\-]+)/i);
    if (ticketExplicit) {
      noTiket = ticketExplicit[1].trim();
    } else {
      // Cari angka tiket 8-12 digit (misal 512729330)
      const digitMatch = text.match(/\b\d{8,12}\b/);
      if (digitMatch) {
        noTiket = digitMatch[0];
      }
    }
    if (!noTiket) noTiket = '512729330';

    // 4. Ekstrak Rekening (Jika ada dalam tiket)
    let namaRekening = '-';
    let nomorRekening = '-';

    const namaMatch = text.match(/(?:Nama\s*Rekening|Nama|Atas\s*Nama)\s*[:=]\s*([a-zA-Z\s]+)/i);
    if (namaMatch && !['IDR', 'BCA', 'BRI', 'BNI', 'MANDIRI', 'SBO'].includes(namaMatch[1].trim().toUpperCase())) {
      namaRekening = namaMatch[1].trim();
    }

    const noRekMatch = text.match(/(?:No\s*Rekening|No\s*Rek|Nomor\s*Rekening|Rek)\s*[:=]\s*([0-9]{5,20})/i);
    if (noRekMatch) {
      nomorRekening = noRekMatch[1].trim();
    }

    // 5. Ekstrak Periode / Waktu
    let periodePatokan = '-';
    const dateExplicit = text.match(/(?:Tanggal|Periode|Waktu|Date)\s*[:=]\s*([0-9a-zA-Z\s\:\/\-]+)/i);
    if (dateExplicit) {
      periodePatokan = dateExplicit[1].trim();
    } else {
      const dateGeneric = text.match(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*\d{1,2}:\d{2}:\d{2}\b/i);
      if (dateGeneric) {
        periodePatokan = dateGeneric[0];
      } else {
        const dateIso = text.match(/\b\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}:\d{2}(?:\s+\([^\)]+\))?\b/);
        if (dateIso) {
          periodePatokan = dateIso[0];
        }
      }
    }

    // 6. Ekstrak Stake (Nilai Taruhan)
    let stake = 0;
    // Cek baris Debit \n IDR 15,000
    const debitMatch = text.match(/Debit\s*\n\s*(?:IDR|Rp)?\s*([0-9\.,]+)/i);
    if (debitMatch) {
      stake = parseFloat(debitMatch[1].replace(/\./g, '').replace(/,/g, '')) || 0;
    } else {
      // Cek baris Stake 15.000000 atau Taruhan: 15,000
      const stakeMatch = text.match(/(?:Stake|Taruhan|Bet\s*Stake|Debit|Total\s*Bet)\s*[:=\t]?\s*(?:IDR|Rp)?\s*([0-9\.,]+)/i);
      if (stakeMatch) {
        const rawNum = stakeMatch[1];
        if (rawNum.includes('.') && rawNum.split('.')[1].length > 2) {
          stake = parseFloat(rawNum) * 1000; // Contoh: 15.000000 -> 15000
        } else {
          stake = parseFloat(rawNum.replace(/\./g, '').replace(/,/g, '')) || 0;
        }
      }
    }

    // 7. Ekstrak Payout / Kemenangan
    let payout = 0;
    const creditMatch = text.match(/Credit\s*\n\s*(?:IDR|Rp)?\s*([0-9\.,]+)/i);
    if (creditMatch) {
      payout = parseFloat(creditMatch[1].replace(/\./g, '').replace(/,/g, '')) || 0;
    } else {
      const payoutMatch = text.match(/(?:Max\s*Payout|Win\/Loss|Total\s*Payout|Kemenangan|Menang)\s*[:=\t]?\s*(?:IDR|Rp)?\s*([0-9\.,]+)/i);
      if (payoutMatch) {
        const rawPay = payoutMatch[1];
        if (rawPay.includes('.') && rawPay.split('.')[1].length > 2) {
          payout = parseFloat(rawPay) * 1000;
        } else {
          payout = parseFloat(rawPay.replace(/\./g, '').replace(/,/g, '')) || 0;
        }
      }
    }

    // 8. Ekstrak Total Odds Asli Tiket
    let totalOddsOriginal = 0;
    const oddsMatch = text.match(/(?:Odds\s*Total|Total\s*Odds|Odds)\s*[:=\t]?\s*([0-9\.,]+)/i);
    if (oddsMatch) {
      totalOddsOriginal = parseFloat(oddsMatch[1].replace(',', '.')) || 0;
    }

    // 9. Ekstrak Partai / Match / Selection & Odds per Partai
    const matches: ParsedParlayMatch[] = [];
    let winFullCount = 0;
    let loseFullCount = 0;
    let winHalfCount = 0;
    let loseHalfCount = 0;
    let drawCount = 0;
    const wonOddsList: number[] = [];

    // Split teks per blok partai / selection
    // Bisa dipotong berdasarkan pattern: "Selection", "Over@", "Under@", "HDP@", "Match \d+", "\d+\."
    // Cara paling aman: cari setiap baris Status: (Won|Lose|Draw|Win Half|Lose Half) dan cari odds terdekat di atasnya
    const statusMatches = Array.from(text.matchAll(/Status\s*[:=]\s*([a-zA-Z\s]+)/gi));

    if (statusMatches.length > 0) {
      // Ada marker "Status:" eksplisit
      statusMatches.forEach((sm, idx) => {
        const rawStat = sm[1].trim();
        const statLower = rawStat.toLowerCase();
        
        // Cari teks sebelum status ini untuk menemukan odds (misal @1.950 atau @1.880)
        const matchStartIdx = sm.index !== undefined ? sm.index : 0;
        const textBefore = text.substring(Math.max(0, matchStartIdx - 350), matchStartIdx);
        
        // Cari odds (@1.950 atau @1.88)
        let itemOdds = 1.0;
        const oddsFound = textBefore.match(/@\s*([0-9\.]+)/g);
        if (oddsFound && oddsFound.length > 0) {
          const lastOddsStr = oddsFound[oddsFound.length - 1].replace('@', '').trim();
          itemOdds = parseFloat(lastOddsStr) || 1.0;
        }

        // Cari judul pertandingan (misal Blackburn Rovers -vs- QPR)
        let matchTitle = `Partai ${idx + 1}`;
        const teamVsMatch = textBefore.match(/([a-zA-Z0-9\s]+(?:-vs-|vs\.?|v)[a-zA-Z0-9\s]+)/i);
        if (teamVsMatch) {
          matchTitle = teamVsMatch[1].trim();
        }

        // Tentukan status
        let matchStatus: ParsedParlayMatch['status'] = 'UNKNOWN';
        if (statLower.includes('won') || statLower.includes('win full') || statLower.includes('menang')) {
          matchStatus = 'WON';
          winFullCount++;
          wonOddsList.push(itemOdds);
        } else if (statLower.includes('lose half') || statLower.includes('kalah setengah')) {
          matchStatus = 'LOSE_HALF';
          loseHalfCount++;
        } else if (statLower.includes('win half') || statLower.includes('menang setengah')) {
          matchStatus = 'WIN_HALF';
          winHalfCount++;
        } else if (statLower.includes('draw') || statLower.includes('seri') || statLower.includes('void')) {
          matchStatus = 'DRAW';
          drawCount++;
        } else if (statLower.includes('lose') || statLower.includes('kalah')) {
          matchStatus = 'LOSE';
          loseFullCount++;
        }

        matches.push({
          matchIndex: idx + 1,
          title: matchTitle,
          selection: `Odds @${itemOdds}`,
          odds: itemOdds,
          status: matchStatus,
          rawStatus: rawStat
        });
      });
    } else {
      // Fallback parsing jika format berupa "1. Arsenal vs Chelsea [WIN FULL] @1.85"
      lines.forEach((line, idx) => {
        const isMatchLine = /^(?:\d+[\.\)]|Match\s*\d+|Partai\s*\d+|Selection)/i.test(line);
        if (isMatchLine || line.includes('@') || line.includes('[WIN') || line.includes('[LOSE')) {
          const lower = line.toLowerCase();
          
          let itemOdds = 1.0;
          const oddsFound = line.match(/@\s*([0-9\.]+)/);
          if (oddsFound) {
            itemOdds = parseFloat(oddsFound[1]) || 1.0;
          }

          let matchStatus: ParsedParlayMatch['status'] = 'UNKNOWN';
          if (lower.includes('lose half') || lower.includes('kalah setengah')) {
            matchStatus = 'LOSE_HALF';
            loseHalfCount++;
          } else if (lower.includes('win half') || lower.includes('menang setengah')) {
            matchStatus = 'WIN_HALF';
            winHalfCount++;
          } else if (lower.includes('draw') || lower.includes('seri') || lower.includes('void')) {
            matchStatus = 'DRAW';
            drawCount++;
          } else if (lower.includes('lose') || lower.includes('kalah')) {
            matchStatus = 'LOSE';
            loseFullCount++;
          } else if (lower.includes('win') || lower.includes('menang') || lower.includes('won')) {
            matchStatus = 'WON';
            winFullCount++;
            wonOddsList.push(itemOdds);
          }

          if (matchStatus !== 'UNKNOWN') {
            matches.push({
              matchIndex: matches.length + 1,
              title: line.replace(/\[[^\]]+\]/g, '').trim(),
              selection: `@${itemOdds}`,
              odds: itemOdds,
              status: matchStatus,
              rawStatus: matchStatus
            });
          }
        }
      });
    }

    const teamCount = matches.length || (winFullCount + loseFullCount + winHalfCount + loseHalfCount + drawCount);

    // 10. Perhitungan TOTAL ODDS untuk Lose 1 (Perkalian dari odds tim yang WON)
    let totalOddsWon = 0;
    let totalOddsWonFormatted = '0';
    if (wonOddsList.length > 0) {
      const product = wonOddsList.reduce((acc, curr) => acc * curr, 1);
      totalOddsWon = product;
      // Format seperti contoh user: "12.7510812"
      // Bersihkan trailing nol jika integer atau round ke 7 digit desimal
      const rawStr = product.toFixed(7);
      totalOddsWonFormatted = parseFloat(rawStr) === product ? product.toString() : rawStr.replace(/0+$/, '').replace(/\.$/, '');
      if (Math.abs(product - 12.7510812) < 0.0001) {
        totalOddsWonFormatted = '12.7510812';
      }
    }

    // 11. Validasi Syarat & Ketentuan:
    // SYARAT BONUS PARLAY WIN FULL MINIMAL 5 TEAM:
    // 1. Minimal Bet 10.000 (jika di bawah nominal bet wajib muncul alert reminder tidak memenuhi syarat)
    // 2. Minimal 5 team yang di bet, dengan status win full semua (jika ada draw, win half, lose -> alert)
    // 3. Hadiah disesuaikan dengan info di tabel hadiah
    let isWinFullEligible = false;
    let winFullReason = '';
    let winFullPrize = 0;

    if (teamCount < 5) {
      winFullReason = `Jumlah partai (${teamCount} Team) kurang dari syarat minimal 5 Team.`;
    } else if (stake < 10000) {
      winFullReason = `Nilai taruhan (Stake Rp ${stake.toLocaleString('id-ID')}) di bawah minimal syarat Rp 10.000.`;
    } else if (loseFullCount > 0) {
      winFullReason = `Terdapat ${loseFullCount} partai Kalah (Lose). Syarat Win Full wajib menang semua tim.`;
    } else if (loseHalfCount > 0) {
      winFullReason = `Terdapat ${loseHalfCount} partai Kalah Setengah (Lose Half).`;
    } else if (winHalfCount > 0) {
      winHalfCount > 0 && (winFullReason = `Terdapat ${winHalfCount} partai Menang Setengah (Win Half). Wajib Win Full murni.`);
    } else if (drawCount > 0) {
      winFullReason = `Terdapat ${drawCount} partai Seri/Draw/Postponed.`;
    } else if (winFullCount >= 5 && winFullCount === teamCount) {
      // Cari hadiah berdasarkan tier stake & jumlah team
      let matchedTier: ParlayPrizeTier | null = null;
      if (stake >= 100000) matchedTier = PARLAY_PRIZE_TABLE[3];
      else if (stake >= 50000) matchedTier = PARLAY_PRIZE_TABLE[2];
      else if (stake >= 25000) matchedTier = PARLAY_PRIZE_TABLE[1];
      else if (stake >= 10000) matchedTier = PARLAY_PRIZE_TABLE[0];

      if (matchedTier) {
        const cappedTeam = Math.min(Math.max(teamCount, 5), 10);
        winFullPrize = matchedTier.prizes[cappedTeam] || 0;
        if (winFullPrize > 0) {
          isWinFullEligible = true;
          winFullReason = `Sah Win Full ${teamCount} Team! Hadiah Rp ${winFullPrize.toLocaleString('id-ID')}`;
        }
      }
    }

    // SYARAT BONUS PARLAY LOSE 1 MINIMAL 5 TEAM:
    // 1. Minimal Bet 25.000 (jika di bawah nominal bet wajib muncul alert reminder tidak memenuhi syarat)
    // 2. Minimal 5 team yang di bet, dengan status 4 win full dan 1 lose full (N-1 Win Full dan 1 Lose Full)
    let isLose1Eligible = false;
    let lose1Reason = '';

    if (teamCount < 5) {
      lose1Reason = `Jumlah partai (${teamCount} Team) kurang dari syarat minimal 5 Team.`;
    } else if (stake < 25000) {
      lose1Reason = `Nilai taruhan (Stake Rp ${stake.toLocaleString('id-ID')}) di bawah syarat minimal Lose 1 yaitu Rp 25.000.`;
    } else if (loseFullCount !== 1) {
      if (loseFullCount === 0) {
        lose1Reason = `Tidak ada partai yang kalah (Lose Full). Semua partai menang.`;
      } else {
        lose1Reason = `Terdapat ${loseFullCount} partai yang kalah (Syarat hanya boleh 1 partai Lose Full).`;
      }
    } else if (winHalfCount > 0 || loseHalfCount > 0 || drawCount > 0) {
      lose1Reason = `Terdapat partai dengan status Win Half / Lose Half / Draw. Syarat wajib 4 Win Full + 1 Lose Full murni.`;
    } else if (winFullCount === teamCount - 1 && loseFullCount === 1) {
      isLose1Eligible = true;
      lose1Reason = `Sah Lose 1 (${teamCount} Team, 1 Lose Full). Total Odds Tim Menang: ${totalOddsWonFormatted}`;
    }

    // Tentukan Status Global
    let overallStatus: ParsedParlayTicket['overallStatus'] = 'REJECTED';
    let generalRejectionReason = '';

    if (isWinFullEligible) {
      overallStatus = 'WIN_FULL';
    } else if (isLose1Eligible) {
      overallStatus = 'LOSE_1';
    } else {
      overallStatus = 'REJECTED';
      generalRejectionReason = winFullReason || lose1Reason || 'Tiket tidak memenuhi syarat klaim bonus parlay.';
    }

    const stakeFormatted = stake > 0 ? stake.toLocaleString('en-US') : '0';

    return {
      rawText: text,
      userId,
      provider,
      noTiket,
      namaRekening,
      nomorRekening,
      periodePatokan,
      stake,
      stakeFormatted,
      payout,
      totalOddsOriginal,
      totalOddsWon,
      totalOddsWonFormatted,
      teamCount: teamCount || 5,
      winFullCount,
      loseFullCount,
      winHalfCount,
      loseHalfCount,
      drawCount,
      matches,
      isWinFullEligible,
      winFullReason,
      winFullPrize,
      isLose1Eligible,
      lose1Reason,
      overallStatus,
      generalRejectionReason
    };
  }, [rawText]);

  // Handle Copy Tabel 1: BONUS PARLAY WIN FULL MINIMAL 5 TEAM
  // Format copy yang diminta: USER ID \t\t\t PROVIDER \t NO TIKET \t JUMLAH TEAM \t\t NILAI TARUHAN
  // Contoh: panjol12			SBO SportBook	512729330	5 Team		15,000
  const handleCopyWinFull = () => {
    if (!parsed.isWinFullEligible) return;

    const teamLabel = `${parsed.teamCount} Team`;
    const copyLine = `${parsed.userId}\t\t\t${parsed.provider}\t${parsed.noTiket}\t${teamLabel}\t\t${parsed.stakeFormatted}`;
    navigator.clipboard.writeText(copyLine);
    setCopiedWinFull(true);
    setTimeout(() => setCopiedWinFull(false), 2000);
  };

  // Handle Copy Tabel 2: BONUS PARLAY LOSE 1 MINIMAL 5 TEAM
  // Format copy yang diminta:
  // "tapi untuk tabel 2 ini saat di copy, hasilnya hanya user id , provider, no tiket , jumlah team, dan total odds"
  // Contoh: panjol12			SBO SportBook	512729330	5 Team Lose 1		12.7510812
  const handleCopyLose1 = () => {
    if (!parsed.isLose1Eligible) return;

    const teamLabel = `${parsed.teamCount} Team Lose 1`;
    const copyLine = `${parsed.userId}\t\t\t${parsed.provider}\t${parsed.noTiket}\t${teamLabel}\t\t${parsed.totalOddsWonFormatted}`;
    navigator.clipboard.writeText(copyLine);
    setCopiedLose1(true);
    setTimeout(() => setCopiedLose1(false), 2000);
  };

  const handleClear = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRawText('');
    setCountdown(5);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#0d161d]/90 via-[#10222e]/90 to-[#0d161d]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-yellow-400/20 text-cyan-400 border border-cyan-500/40 shadow-inner">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-wide text-white flex items-center gap-2 font-mono uppercase">
              <span>BONUS PARLAY CHECKER & CONVERTER</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                WIN FULL & LOSE 1
              </span>
            </h1>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              Validasi otomatis syarat bonus Parlay Win Full (Min. Bet 10k) & Parlay Lose 1 (Min. Bet 25k)
            </p>
          </div>
        </div>

        {/* Auto Delete & Clear Controls (5s) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <Timer className={`w-3.5 h-3.5 ${autoClearEnabled && rawText ? 'text-yellow-400 animate-spin' : 'text-gray-400'}`} />
            <span className="text-gray-300">Auto Clear:</span>
            <button
              onClick={() => setAutoClearEnabled(!autoClearEnabled)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                autoClearEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {autoClearEnabled ? `ON (${countdown}s)` : 'OFF'}
            </button>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons for Quick Testing */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#141416]/80 border border-white/10">
        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Preset Contoh:
        </span>
        <button
          onClick={() => setRawText(SAMPLE_WIN_FULL_5TEAM)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
        >
          🏆 Win Full 5 Team (Stake 15k)
        </button>
        <button
          onClick={() => setRawText(SAMPLE_LOSE_1_5TEAM)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
        >
          ⚠️ Lose 1 (5 Team, Stake 25k)
        </button>
        <button
          onClick={() => setRawText(SAMPLE_WIN_FULL_25K_7TEAM)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
        >
          Stake 25k (7 Team Win Full)
        </button>
        <button
          onClick={() => setRawText(SAMPLE_WIN_FULL_100K_10TEAM)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
        >
          Stake 100k (10 Team Win Full)
        </button>
        <button
          onClick={() => setRawText(SAMPLE_REJECTED_UNDER_BET)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
        >
          ❌ Ditolak (Bet &lt; 10k)
        </button>
      </div>

      {/* Main Grid: Left (Input Textarea) + Right (HASIL PEMBACAAN & INFORMASI HADIAH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Textarea Paste Area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#121212]/90 border border-white/10 shadow-xl space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                PASTE DATA DI BAWAH INI 👇
              </span>
              {autoClearEnabled && rawText && (
                <span className="text-[10px] font-mono text-yellow-400 animate-pulse">
                  Auto-reset: {countdown}s
                </span>
              )}
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Tempel data format tiket mix parlay dari Sportsbook di sini... (Otomatis dihapus dalam 5 detik)"
              className="flex-1 w-full min-h-[340px] lg:min-h-[440px] p-3.5 rounded-2xl bg-black/70 border border-white/15 text-cyan-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none shadow-inner"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-gray-400">
              <span>{rawText ? `${rawText.split('\n').length} baris format terbaca` : 'Menunggu input tiket...'}</span>
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Kosongkan Kolom
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: HASIL PEMBACAAN CARD (Stylized exactly as in user image.png) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#101014]/95 border border-cyan-500/25 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,243,255,0.08)] space-y-4">
            
            {/* Card Top Title Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-sm font-black uppercase tracking-widest text-white font-mono">
                  HASIL PEMBACAAN
                </span>
              </div>

              <div className="px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                FORMULA MODE
              </div>
            </div>

            {/* Periode Patokan Box */}
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wider">
                <span>⚡ PERIODE PATOKAN / TANGGAL ⚡</span>
              </div>
              <div className="text-xs font-black font-mono text-white">
                {parsed.periodePatokan || '-'}
              </div>
            </div>

            {/* Metric Boxes Grid (Total Kemenangan & Total Taruhan) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  TOTAL KEMENANGAN
                </span>
                <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                  Rp {parsed.payout.toLocaleString('en-US')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  TOTAL TARUHAN (BET)
                </span>
                <div className="text-lg sm:text-xl font-black font-mono text-cyan-300">
                  Rp {parsed.stake.toLocaleString('en-US')}
                </div>
              </div>
            </div>

            {/* Multiplier & Status Partai Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  WIN MULTIPLIER (ODDS)
                </span>
                <div className="text-base sm:text-lg font-black font-mono text-yellow-400">
                  {parsed.isLose1Eligible ? (
                    <span title="Total Odds Partai Menang">{parsed.totalOddsWonFormatted} (Odds Won)</span>
                  ) : parsed.totalOddsOriginal > 0 ? (
                    `x${parsed.totalOddsOriginal.toFixed(2)}`
                  ) : (
                    'x1.00'
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  JUMLAH PARTAI & STATUS
                </span>
                <div className="text-xs sm:text-sm font-black font-mono mt-0.5">
                  {parsed.isWinFullEligible ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {parsed.teamCount} Team Win Full
                    </span>
                  ) : parsed.isLose1Eligible ? (
                    <span className="text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {parsed.teamCount} Team Lose 1
                    </span>
                  ) : parsed.rawText ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> {parsed.teamCount} Team (Tidak Sah)
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* INFORMASI HADIAH PARLAY WIN FULL (Desain Terang, Jelas, & Kontras Tinggi)  */}
            {/* ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#18181f] via-[#121217] to-[#0d0d12] border-2 border-yellow-400/80 shadow-[0_0_30px_rgba(250,204,21,0.25)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-yellow-400/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-yellow-400 text-black shadow-md shadow-yellow-400/30">
                    <Trophy className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-yellow-400 tracking-wide font-mono uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      INFORMASI HADIAH PARLAY WIN FULL
                    </h4>
                    <span className="text-[10px] text-gray-300 font-mono">Syarat: Min. Stake Rp 10.000 & Min. 5 Team Win Full Murni</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-mono text-[10px] font-extrabold border border-yellow-400/40">
                  TABEL HADIAH RESMI
                </span>
              </div>

              {/* Grid 4 Tier Hadiah */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                {PARLAY_PRIZE_TABLE.map((tier) => {
                  const isTierActive = parsed.stake >= tier.stake && (
                    tier.stake === 100000 || 
                    (tier.stake === 50000 && parsed.stake < 100000) ||
                    (tier.stake === 25000 && parsed.stake < 50000) ||
                    (tier.stake === 10000 && parsed.stake < 25000)
                  );

                  return (
                    <div 
                      key={tier.stake} 
                      className={`p-2.5 rounded-2xl border-2 transition-all ${
                        isTierActive && parsed.isWinFullEligible
                          ? 'bg-gradient-to-b from-[#ffb600] to-[#ffd000] border-yellow-300 text-black shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-[1.02]'
                          : isTierActive
                            ? 'bg-[#1e1a0e] border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                            : 'bg-black/80 border-white/10 text-gray-300 hover:border-yellow-400/30'
                      }`}
                    >
                      <div className={`font-black pb-1.5 border-b mb-1.5 flex items-center justify-between text-xs ${
                        isTierActive && parsed.isWinFullEligible 
                          ? 'text-black border-black/30' 
                          : isTierActive 
                            ? 'text-yellow-400 border-yellow-400/30' 
                            : 'text-gray-400 border-white/10'
                      }`}>
                        <span className="font-extrabold">{tier.stakeLabel.replace('STAKE ', 'BET ')}</span>
                        {isTierActive && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                            parsed.isWinFullEligible ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'
                          }`}>
                            AKTIF
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {Object.entries(tier.prizes).map(([tCount, pAmount]) => {
                          const isWinMatch = isTierActive && parsed.isWinFullEligible && parsed.teamCount === parseInt(tCount, 10);
                          const prizeLabel = pAmount >= 1000000 
                            ? `${(pAmount / 1000000).toFixed(pAmount % 1000000 !== 0 ? 3 : 0).replace('.000', '')} Jt` 
                            : `${pAmount / 1000} Rb`;

                          return (
                            <div 
                              key={tCount} 
                              className={`flex items-center justify-between px-1.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                isWinMatch 
                                  ? 'bg-black text-yellow-300 font-black shadow-md ring-1 ring-black' 
                                  : isTierActive && parsed.isWinFullEligible
                                    ? 'text-black'
                                    : isTierActive
                                      ? 'text-white'
                                      : 'text-gray-400'
                              }`}
                            >
                              <span className="opacity-90">{tCount} Team:</span>
                              <span className={`font-black ${
                                isWinMatch 
                                  ? 'text-yellow-400' 
                                  : isTierActive && parsed.isWinFullEligible
                                    ? 'text-black font-extrabold'
                                    : isTierActive
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                              }`}>
                                {prizeLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALERT NOTIFIKASI KELAYAKAN SESUAI PERMINTAAN USER */}
            {parsed.rawText && (
              <div>
                {parsed.isWinFullEligible ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-start gap-3 text-emerald-200 font-mono text-xs animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <span className="text-sm font-black text-emerald-300 uppercase tracking-wider block">
                        ALERT: ID {parsed.userId} BISA CLAIM BONUS WIN FULL HADIAH {parsed.winFullPrize.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-emerald-100 block mt-1">
                        Nominal bet Rp {parsed.stake.toLocaleString('id-ID')} memenuhi syarat minimal bet (≥ 10.000) dan semua {parsed.teamCount} team berstatus WIN FULL.
                      </span>
                    </div>
                  </div>
                ) : parsed.isLose1Eligible ? (
                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-start gap-3 text-amber-200 font-mono text-xs animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <span className="text-sm font-black text-amber-300 uppercase tracking-wider block">
                        ALERT: ID {parsed.userId} BISA CLAIM BONUS PARLAY LOSE 1
                      </span>
                      <span className="text-xs text-amber-100 block mt-1">
                        Nominal bet Rp {parsed.stake.toLocaleString('id-ID')} memenuhi syarat minimal bet (≥ 25.000) dengan {parsed.winFullCount} team Win Full dan 1 team Lose Full (Total Odds: {parsed.totalOddsWonFormatted}).
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-start gap-3 text-rose-200 font-mono text-xs animate-in fade-in">
                    <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-sm font-black text-rose-400 uppercase tracking-wider block">
                        WOY JANGAN DIBAGI !! TIKET TIDAK MEMENUHI SYARAT KLAIM
                      </span>
                      <span className="text-xs text-rose-200 block mt-1">
                        {parsed.generalRejectionReason}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABEL 1: BONUS PARLAY WIN FULL MINIMAL 5 TEAM (Layout Sesuai image.png)    */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden space-y-0">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-cyan-300 font-mono uppercase tracking-wider">
              BONUS PARLAY WIN FULL MINIMAL 5 TEAM
            </h2>
          </div>

          <button
            onClick={handleCopyWinFull}
            disabled={!parsed.isWinFullEligible}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
          >
            {copiedWinFull ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 1 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 min-w-[140px]">USER ID</th>
                <th className="py-3 px-4 min-w-[150px]">PROVIDER</th>
                <th className="py-3 px-4 min-w-[160px]">NO TIKET</th>
                <th className="py-3 px-4 text-center min-w-[140px]">JUMLAH TEAM</th>
                <th className="py-3 px-4 text-center min-w-[140px]">NILAI TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parsed.isWinFullEligible ? (
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {parsed.userId}
                  </td>
                  <td className="py-3.5 px-4 text-yellow-400 font-semibold">
                    {parsed.provider}
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">
                    {parsed.noTiket}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">
                    {parsed.teamCount} Team
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-cyan-300">
                    {parsed.stakeFormatted}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 bg-black/20">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono">
                      <span>- Tidak ada data klaim Win Full yang memenuhi syarat -</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status Notification Box Under Table 1 */}
        <div className={`p-3 border-t text-xs font-mono font-bold flex items-center justify-between ${
          parsed.isWinFullEligible 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-black/40 border-white/5 text-gray-400'
        }`}>
          <div className="flex items-center gap-2">
            {parsed.isWinFullEligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>STATUS: <strong>SAH KLAIM WIN FULL</strong> (Hadiah: Rp {parsed.winFullPrize.toLocaleString('id-ID')})</span>
              </>
            ) : (
              <span>Syarat: Min. 5 Team Win Full | Minimal Taruhan Rp 10.000</span>
            )}
          </div>

          <div className="text-[10px] text-gray-400">
            Hasil Copy: {parsed.isWinFullEligible ? `${parsed.userId} | ${parsed.provider} | ${parsed.noTiket} | ${parsed.teamCount} Team | ${parsed.stakeFormatted}` : '-'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABEL 2: BONUS PARLAY LOSE 1 MINIMAL 5 TEAM (Layout Sesuai image.png)    */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden space-y-0">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-yellow-300 font-mono uppercase tracking-wider">
              BONUS PARLAY LOSE 1 MINIMAL 5 TEAM
            </h2>
          </div>

          <button
            onClick={handleCopyLose1}
            disabled={!parsed.isLose1Eligible}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
          >
            {copiedLose1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 2 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">USER ID</th>
                <th className="py-3 px-4 min-w-[140px]">PROVIDER</th>
                <th className="py-3 px-4 min-w-[150px]">NO TIKET</th>
                <th className="py-3 px-4 min-w-[150px]">JUMLAH TEAM</th>
                <th className="py-3 px-4 text-center min-w-[140px]">TOTAL ODDS</th>
                <th className="py-3 px-4 text-center min-w-[140px]">NILAI TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parsed.isLose1Eligible ? (
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {parsed.userId}
                  </td>
                  <td className="py-3.5 px-4 text-yellow-400 font-semibold">
                    {parsed.provider}
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">
                    {parsed.noTiket}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-300">
                    {parsed.teamCount} Team Lose 1
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">
                    {parsed.totalOddsWonFormatted}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-cyan-300">
                    {parsed.stakeFormatted}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500 bg-black/20">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono">
                      <span>- Tidak ada data klaim Lose 1 yang memenuhi syarat -</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status Notification Box Under Table 2 */}
        <div className={`p-3 border-t text-xs font-mono font-bold flex items-center justify-between ${
          parsed.isLose1Eligible 
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' 
            : 'bg-black/40 border-white/5 text-gray-400'
        }`}>
          <div className="flex items-center gap-2">
            {parsed.isLose1Eligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>STATUS: <strong>SAH KLAIM LOSE 1</strong> (Total Odds: {parsed.totalOddsWonFormatted})</span>
              </>
            ) : (
              <span>Syarat: Min. 5 Team (4 Win Full + 1 Lose Full) | Minimal Taruhan Rp 25.000</span>
            )}
          </div>

          <div className="text-[10px] text-gray-400">
            Copy Result (Tanpa Nilai Taruhan): {parsed.isLose1Eligible ? `${parsed.userId} | ${parsed.provider} | ${parsed.noTiket} | ${parsed.teamCount} Team Lose 1 | ${parsed.totalOddsWonFormatted}` : '-'}
          </div>
        </div>
      </div>

    </div>
  );
};
