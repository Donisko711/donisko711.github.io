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
  ShieldAlert,
  ShieldCheck,
  Gamepad2,
  Flame,
  Info,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Calculator
} from 'lucide-react';

interface ParsedStatement {
  rawText: string;
  userId: string;
  namaRekening: string;
  nomorRekening: string;
  periodePatokan: string;
  totalCredit: number;
  totalDebit: number;
  debitCount: number;
  creditCount: number;
  barisTerbaca: number;
  provider: string;
  permainan: string;
  kodeTicket: string;
  roundId: string;
  superBuy: string;
  isSuperScatterGame: boolean;
  multiplierWin: number;
  hasMultiTicketConflict: boolean;
  hasMultiDebitConflict: boolean;
  hasUnderMinBet: boolean;
}

interface ValidationResult {
  isScatterEligible: boolean;
  scatterReason: string;
  isHarianEligible: boolean;
  harianReason: string;
  overallStatus: 'BOTH' | 'SCATTER_ONLY' | 'HARIAN_ONLY' | 'REJECTED' | 'EMPTY';
}

const SAMPLE_SCATTER_ONLY = `Mahjong Ways 2
PGSoft
2093760412662324736-2093760049250985473-106-0
Ext. ID : CR2093760412662324736-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:59:17
Credit
IDR 2,400
Balance : IDR 222,791
Mahjong Ways 2
PGSoft
2093760344488063488-2093760049250985473-106-0
Ext. ID : CR2093760344488063488-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:59:01
Credit
IDR 12,000
Balance : IDR 220,391
Mahjong Ways 2
PGSoft
2093760331062081537-2093760049250985473-106-0
Ext. ID : CR2093760331062081537-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:57
Credit
IDR 1,200
Balance : IDR 208,391
Mahjong Ways 2
PGSoft
2093760319276125188-2093760049250985473-106-0
Ext. ID : CR2093760319276125188-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:55
Credit
IDR 70,400
Balance : IDR 207,191
Mahjong Ways 2
PGSoft
2093760294684947969-2093760049250985473-106-0
Ext. ID : CR2093760294684947969-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:49
Credit
IDR 1,600
Balance : IDR 136,791
Mahjong Ways 2
PGSoft
2093760271574283780-2093760049250985473-106-0
Ext. ID : CR2093760271574283780-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:43
Credit
IDR 12,800
Balance : IDR 135,191
Mahjong Ways 2
PGSoft
2093760256558682112-2093760049250985473-106-0
Ext. ID : CR2093760256558682112-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:40
Credit
IDR 2,000
Balance : IDR 122,391
Mahjong Ways 2
PGSoft
2093760203190403072-2093760049250985473-106-0
Ext. ID : CR2093760203190403072-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:27
Credit
IDR 7,200
Balance : IDR 120,391
Mahjong Ways 2
PGSoft
2093760190406091776-2093760049250985473-106-0
Ext. ID : CR2093760190406091776-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:24
Credit
IDR 28,000
Balance : IDR 113,191
Mahjong Ways 2
PGSoft
2093760165143805443-2093760049250985473-106-0
Ext. ID : CR2093760165143805443-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:18
Credit
IDR 24,000
Balance : IDR 85,191
Mahjong Ways 2
PGSoft
2093760143505395200-2093760049250985473-106-0
Ext. ID : CR2093760143505395200-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:13
Credit
IDR 7,200
Balance : IDR 61,191
Mahjong Ways 2
PGSoft
2093760118301822977-2093760049250985473-106-0
Ext. ID : CR2093760118301822977-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:07
Credit
IDR 6,000
Balance : IDR 53,991
Mahjong Ways 2
PGSoft
2093760064509865985-2093760049250985473-106-0
Ext. ID : CR2093760064509865985-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:54
Credit
IDR 16,000
Balance : IDR 47,991
Mahjong Ways 2
PGSoft
2093760049250985473-2093760049250985473-106-0
Ext. ID : CR2093760049250985473-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:50
Credit
IDR 7,200
Balance : IDR 31,991
Mahjong Ways 2
PGSoft
2093760049250985473-2093760049250985473-106-0
Ext. ID : DB2093760049250985473-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:50
Debit
IDR 4,000
Balance : IDR 24,791`;

const SAMPLE_BOTH_ELIGIBLE = `Mahjong Ways
PGSoft
2093756137555006465-2093755723547846146-106-0
Ext. ID : CR2093756137555006465-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:42:18
Credit
IDR 3,360
Balance : IDR 638,283
Mahjong Ways
PGSoft
2093756120249370628-2093755723547846146-106-0
Ext. ID : CR2093756120249370628-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:42:13
Credit
IDR 720
Balance : IDR 634,923
Mahjong Ways
PGSoft
2093756066356707841-2093755723547846146-106-0
Ext. ID : CR2093756066356707841-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:42:01
Credit
IDR 79,200
Balance : IDR 634,203
Mahjong Ways
PGSoft
2093756052079294469-2093755723547846146-106-0
Ext. ID : CR2093756052079294469-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:57
Credit
IDR 19,200
Balance : IDR 555,003
Mahjong Ways
PGSoft
2093756038800147968-2093755723547846146-106-0
Ext. ID : CR2093756038800147968-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:54
Credit
IDR 234,720
Balance : IDR 535,803
Mahjong Ways
PGSoft
2093756025017643009-2093755723547846146-106-0
Ext. ID : CR2093756025017643009-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:51
Credit
IDR 7,200
Balance : IDR 301,083
Mahjong Ways
PGSoft
2093756007795816960-2093755723547846146-106-0
Ext. ID : CR2093756007795816960-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:47
Credit
IDR 2,400
Balance : IDR 293,883
Mahjong Ways
PGSoft
2093755958240131585-2093755723547846146-106-0
Ext. ID : CR2093755958240131585-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:35
Credit
IDR 50,400
Balance : IDR 291,483
Mahjong Ways
PGSoft
2093755940972216320-2093755723547846146-106-0
Ext. ID : CR2093755940972216320-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:31
Credit
IDR 2,640
Balance : IDR 241,083
Mahjong Ways
PGSoft
2093755896097327616-2093755723547846146-106-0
Ext. ID : CR2093755896097327616-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:21
Credit
IDR 12,000
Balance : IDR 238,443
Mahjong Ways
PGSoft
2093755878103751173-2093755723547846146-106-0
Ext. ID : CR2093755878103751173-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:16
Credit
IDR 19,200
Balance : IDR 226,443
Mahjong Ways
PGSoft
2093755836039099395-2093755723547846146-106-0
Ext. ID : CR2093755836039099395-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:41:06
Credit
IDR 1,200
Balance : IDR 207,243
Mahjong Ways
PGSoft
2093755800731430915-2093755723547846146-106-0
Ext. ID : CR2093755800731430915-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:40:57
Credit
IDR 480
Balance : IDR 206,043
Mahjong Ways
PGSoft
2093755723547846146-2093755723547846146-106-0
Ext. ID : CR2093755723547846146-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:40:39
Credit
IDR 1,200
Balance : IDR 205,563
Mahjong Ways
PGSoft
2093755723547846146-2093755723547846146-106-0
Ext. ID : DB2093755723547846146-2093755723547846146-106-0
isna
ITWLFA - jvsaa
30 Aug 2026 - 00:40:39
Debit
IDR 1,200
Balance : IDR 204,363`;

const SAMPLE_REJECTED = `Mahjong Ways 2
PGSoft
2093760412662324736-2093760049250985473-106-0
Ext. ID : CR2093760412662324736-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:59:17
Credit
IDR 2,400
Balance : IDR 222,791
Mahjong Ways 2
PGSoft
2093760344488063488-2093760049250985473-106-0
Ext. ID : CR2093760344488063488-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:59:01
Credit
IDR 12,000
Balance : IDR 220,391
Mahjong Ways 2
PGSoft
2093760331062081537-2093760049250985473-106-0
Ext. ID : CR2093760331062081537-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:57
Credit
IDR 1,200
Balance : IDR 208,391
Mahjong Ways 2
PGSoft
2093760319276125188-2093760049250985473-106-0
Ext. ID : CR2093760319276125188-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:55
Credit
IDR 70,400
Balance : IDR 207,191
Mahjong Ways 2
PGSoft
2093760294684947969-2093760049250985473-106-0
Ext. ID : CR2093760294684947969-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:49
Credit
IDR 1,600
Balance : IDR 136,791
Mahjong Ways 2
PGSoft
2093760271574283780-2093760049250985473-106-0
Ext. ID : CR2093760271574283780-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:43
Credit
IDR 12,800
Balance : IDR 135,191
Mahjong Ways 2
PGSoft
2093760256558682112-2093760049250985473-106-0
Ext. ID : CR2093760256558682112-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:40
Credit
IDR 2,000
Balance : IDR 122,391
Mahjong Ways 2
PGSoft
2093760203190403072-2093760049250985473-106-0
Ext. ID : CR2093760203190403072-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:27
Credit
IDR 7,200
Balance : IDR 120,391
Mahjong Ways 2
PGSoft
2093760190406091776-2093760049250985473-106-0
Ext. ID : CR2093760190406091776-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:24
Credit
IDR 28,000
Balance : IDR 113,191
Mahjong Ways 2
PGSoft
2093760165143805443-2093760049250985473-106-0
Ext. ID : CR2093760165143805443-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:18
Credit
IDR 24,000
Balance : IDR 85,191
Mahjong Ways 2
PGSoft
2093760143505395200-2093760049250985473-106-0
Ext. ID : CR2093760143505395200-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:13
Credit
IDR 7,200
Balance : IDR 61,191
Mahjong Ways 2
PGSoft
2093760118301822977-2093760049250985473-106-0
Ext. ID : CR2093760118301822977-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:58:07
Credit
IDR 6,000
Balance : IDR 53,991
Mahjong Ways 2
PGSoft
2093760064509865985-2093760049250985473-106-0
Ext. ID : CR2093760064509865985-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:54
Credit
IDR 16,000
Balance : IDR 47,991
Mahjong Ways 2
PGSoft
2093760049250985473-2093760049250985473-106-0
Ext. ID : CR2093760049250985473-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:50
Credit
IDR 7,200
Balance : IDR 31,991
Mahjong Ways 2
PGSoft
2093760049250985473-2093760049250985473-106-0
Ext. ID : DB2093760049250985473-2093760049250985473-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:50
Debit
IDR 400
Balance : IDR 24,791
Mahjong Ways 2
PGSoft
2093760039063074816-2093760039063074816-106-0
Ext. ID : DB2093760039063074816-2093760039063074816-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:48
Debit
IDR 4,000
Balance : IDR 28,791
Mahjong Ways 2
PGSoft
2093760017156179461-2093759988995637763-106-0
Ext. ID : CR2093760017156179461-2093759988995637763-106-0
ruben77
ITWLFA - jvsaa
30 Aug 2026 - 00:57:42
Credit
IDR 1,200
Balance : IDR 32,791`;

const SAMPLE_MULTI_TICKET_REJECTED = `Mahjong Ways
PGSoft
2094504793124044292-2094504175818937859-106-0
Ext. ID : CR2094504793124044292-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:17:11
Credit
IDR 2,400
Balance : IDR 667,858
Mahjong Ways
PGSoft
2094504689839293954-2094504175818937859-106-0
Ext. ID : CR2094504689839293954-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:46
Credit
IDR 102,000
Balance : IDR 665,458
Mahjong Ways
PGSoft
2094504677122138626-2094504175818937859-106-0
Ext. ID : CR2094504677122138626-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:43
Credit
IDR 49,600
Balance : IDR 563,458
Mahjong Ways
PGSoft
2094504660307250688-2094504175818937859-106-0
Ext. ID : CR2094504660307250688-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:39
Credit
IDR 1,200
Balance : IDR 513,858
Mahjong Ways
PGSoft
2094504624101945344-2094504175818937859-106-0
Ext. ID : CR2094504624101945344-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:31
Credit
IDR 4,000
Balance : IDR 512,658
Mahjong Ways
PGSoft
2094504611737138177-2094504175818937859-106-0
Ext. ID : CR2094504611737138177-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:28
Credit
IDR 3,600
Balance : IDR 508,658
Mahjong Ways
PGSoft
2094504599301047299-2094504175818937859-106-0
Ext. ID : CR2094504599301047299-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:25
Credit
IDR 800
Balance : IDR 505,058
Mahjong Ways
PGSoft
2094504581773048832-2094504175818937859-106-0
Ext. ID : CR2094504581773048832-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:21
Credit
IDR 4,000
Balance : IDR 504,258
Mahjong Ways
PGSoft
2094504558821848066-2094504175818937859-106-0
Ext. ID : CR2094504558821848066-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:15
Credit
IDR 4,800
Balance : IDR 500,258
Mahjong Ways
PGSoft
2094504542086538753-2094504175818937859-106-0
Ext. ID : CR2094504542086538753-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:11
Credit
IDR 2,000
Balance : IDR 495,458
Mahjong Ways
PGSoft
2094504515184320002-2094504175818937859-106-0
Ext. ID : CR2094504515184320002-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:05
Credit
IDR 28,000
Balance : IDR 493,458
Mahjong Ways
PGSoft
2094504502479721986-2094504175818937859-106-0
Ext. ID : CR2094504502479721986-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:16:02
Credit
IDR 1,200
Balance : IDR 465,458
Mahjong Ways
PGSoft
2094504490790226432-2094504175818937859-106-0
Ext. ID : CR2094504490790226432-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:59
Credit
IDR 4,800
Balance : IDR 464,258
Mahjong Ways
PGSoft
2094504473807518208-2094504175818937859-106-0
Ext. ID : CR2094504473807518208-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:55
Credit
IDR 400
Balance : IDR 459,458
Mahjong Ways
PGSoft
2094504445042946562-2094504175818937859-106-0
Ext. ID : CR2094504445042946562-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:48
Credit
IDR 2,000
Balance : IDR 459,058
Mahjong Ways
PGSoft
2094504378961702400-2094504175818937859-106-0
Ext. ID : CR2094504378961702400-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:32
Credit
IDR 18,000
Balance : IDR 457,058
Mahjong Ways
PGSoft
2094504366190002177-2094504175818937859-106-0
Ext. ID : CR2094504366190002177-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:29
Credit
IDR 8,000
Balance : IDR 439,058
Mahjong Ways
PGSoft
2094504353925872128-2094504175818937859-106-0
Ext. ID : CR2094504353925872128-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:26
Credit
IDR 24,000
Balance : IDR 431,058
Mahjong Ways
PGSoft
2094504340424396802-2094504175818937859-106-0
Ext. ID : CR2094504340424396802-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:23
Credit
IDR 4,800
Balance : IDR 407,058
Mahjong Ways
PGSoft
2094504328617427456-2094504175818937859-106-0
Ext. ID : CR2094504328617427456-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:20
Credit
IDR 21,600
Balance : IDR 402,258
Mahjong Ways
PGSoft
2094504311664062976-2094504175818937859-106-0
Ext. ID : CR2094504311664062976-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:15:16
Credit
IDR 2,400
Balance : IDR 380,658
Mahjong Ways
PGSoft
2094504207867628544-2094504175818937859-106-0
Ext. ID : CR2094504207867628544-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:14:51
Credit
IDR 1,200
Balance : IDR 378,258
Mahjong Ways
PGSoft
2094504193695072770-2094504175818937859-106-0
Ext. ID : CR2094504193695072770-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:14:48
Credit
IDR 7,600
Balance : IDR 377,058
Mahjong Ways
PGSoft
2094504175818937859-2094504175818937859-106-0
Ext. ID : CR2094504175818937859-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:14:44
Credit
IDR 1,800
Balance : IDR 369,458
Mahjong Ways
PGSoft
2094504175818937859-2094504175818937859-106-0
Ext. ID : DB2094504175818937859-2094504175818937859-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:14:44
Debit
IDR 2,000
Balance : IDR 367,658
Mahjong Ways
PGSoft
2094504145322198528-2094504145322198528-106-0
Ext. ID : CR2094504145322198528-2094504145322198528-106-0
2409heri
ITWLAD - lelaa
01 Sep 2026 - 02:14:37
Credit
IDR 6,000
Balance : IDR 369,658`;

const SAMPLE_HARIAN_ONLY = `Fortune Of Olympus
Pragmatic Play
80633368385126
Ext. ID : 1246a933d6ef384241c10186b1a
nirwana04
ITWLFA - jvsaa
30 Aug 2026 - 03:13:34
Credit
IDR 1,853,700
Balance : IDR 1,881,510
Fortune Of Olympus
Pragmatic Play
80633368385126
Ext. ID : 1246a933d65f384241c101861c7
nirwana04
ITWLFA - jvsaa
30 Aug 2026 - 03:13:25
Debit
IDR 1,000
Balance : IDR 27,810`;

const SAMPLE_BUY_SPIN_PG = `Mighty Mania
PGSoft
2094413992318556672-2094413652613483520-106-0
Ext. ID : CR2094413992318556672-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:22
Credit
IDR 72,000
Balance : IDR 4,882,085
Mighty Mania
PGSoft
2094413979542636032-2094413652613483520-106-0
Ext. ID : CR2094413979542636032-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:19
Credit
IDR 18,000
Balance : IDR 4,810,085
Mighty Mania
PGSoft
2094413963260404225-2094413652613483520-106-0
Ext. ID : CR2094413963260404225-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:15
Credit
IDR 48,000
Balance : IDR 4,792,085
Mighty Mania
PGSoft
2094413950434234880-2094413652613483520-106-0
Ext. ID : CR2094413950434234880-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:12
Credit
IDR 144,000
Balance : IDR 4,744,085
Mighty Mania
PGSoft
2094413934051260929-2094413652613483520-106-0
Ext. ID : CR2094413934051260929-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:08
Credit
IDR 186,000
Balance : IDR 4,600,085
Mighty Mania
PGSoft
2094413917987039744-2094413652613483520-106-0
Ext. ID : CR2094413917987039744-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:05
Credit
IDR 252,000
Balance : IDR 4,414,085
Mighty Mania
PGSoft
2094413905051805697-2094413652613483520-106-0
Ext. ID : CR2094413905051805697-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:16:02
Credit
IDR 72,000
Balance : IDR 4,162,085
Mighty Mania
PGSoft
2094413887205023744-2094413652613483520-106-0
Ext. ID : CR2094413887205023744-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:58
Credit
IDR 3,888,000
Balance : IDR 4,090,085
Mighty Mania
PGSoft
2094413872101380608-2094413652613483520-106-0
Ext. ID : CR2094413872101380608-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:54
Credit
IDR 12,000
Balance : IDR 202,085
Mighty Mania
PGSoft
2094413857035402753-2094413652613483520-106-0
Ext. ID : CR2094413857035402753-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:50
Credit
IDR 24,000
Balance : IDR 190,085
Mighty Mania
PGSoft
2094413844423122432-2094413652613483520-106-0
Ext. ID : CR2094413844423122432-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:47
Credit
IDR 36,000
Balance : IDR 166,085
Mighty Mania
PGSoft
2094413829130755584-2094413652613483520-106-0
Ext. ID : CR2094413829130755584-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:43
Credit
IDR 7,200
Balance : IDR 130,085
Mighty Mania
PGSoft
2094413808570267649-2094413652613483520-106-0
Ext. ID : CR2094413808570267649-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:39
Credit
IDR 1,800
Balance : IDR 122,885
Mighty Mania
PGSoft
2094413779910566400-2094413652613483520-106-0
Ext. ID : CR2094413779910566400-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:32
Credit
IDR 1,200
Balance : IDR 121,085
Mighty Mania
PGSoft
2094413749212467200-2094413652613483520-106-0
Ext. ID : CR2094413749212467200-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:24
Credit
IDR 2,400
Balance : IDR 119,885
Mighty Mania
PGSoft
2094413728727461889-2094413652613483520-106-0
Ext. ID : CR2094413728727461889-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:20
Credit
IDR 600
Balance : IDR 117,485
Mighty Mania
PGSoft
2094413652613483520-2094413652613483520-106-0
Ext. ID : DB2094413652613483520-2094413652613483520-106-0
jaya66
ITWL63 - Keoaa
31 Aug 2026 - 20:15:01
Debit
IDR 90,000
Balance : IDR 116,885`;

interface BonusCalculatorProps {
  initialTab?: 'SLOT' | 'PARLAY';
}

export const BonusCalculator: React.FC<BonusCalculatorProps> = () => {
  const [rawText, setRawText] = useState<string>('');
  const [copiedScatter, setCopiedScatter] = useState(false);
  const [copiedHarian, setCopiedHarian] = useState(false);

  // Auto-Clear Timer states (5s default)
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(true);
  const [autoClearSeconds, setAutoClearSeconds] = useState<number>(5);
  const [countdown, setCountdown] = useState<number>(0);
  const [justCleared, setJustCleared] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Editable fields (optional)
  const [customNamaRek, setCustomNamaRek] = useState<string>('-');
  const [customNoRek, setCustomNoRek] = useState<string>('-');
  const [customBetInput, setCustomBetInput] = useState<string>('');
  const [isEditingBet, setIsEditingBet] = useState<boolean>(false);

  // Parsing Engine
  const parsed: ParsedStatement = useMemo(() => {
    if (!rawText.trim()) {
      return {
        rawText: '',
        userId: '-',
        namaRekening: customNamaRek || '-',
        nomorRekening: customNoRek || '-',
        periodePatokan: '-',
        totalCredit: 0,
        totalDebit: 0,
        debitCount: 0,
        creditCount: 0,
        barisTerbaca: 0,
        provider: '-',
        permainan: '-',
        kodeTicket: '-',
        roundId: '-',
        superBuy: '-',
        isSuperScatterGame: false,
        multiplierWin: 0,
        hasMultiTicketConflict: false,
        hasMultiDebitConflict: false,
        hasUnderMinBet: false
      };
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const barisCount = rawText.split('\n').length;

    let detectedUser = '';
    let detectedTime = '';
    let detectedGame = '';
    let detectedProvider = '';
    let detectedTicket = '';

    const allGamesSet = new Set<string>();
    const allProvidersSet = new Set<string>();
    const allUsersSet = new Set<string>();
    const allRoundIdsSet = new Set<string>();
    const debitTickets = new Set<string>();
    const allExtIds: string[] = [];
    const debitAmounts: number[] = [];

    let sumCredit = 0;
    let sumDebit = 0;
    let debitCount = 0;
    let creditCount = 0;

    const parseAmount = (str: string): number => {
      const clean = str.replace(/[^0-9]/g, '');
      return parseInt(clean, 10) || 0;
    };

    const extractRoundOrTicketId = (str: string): string | null => {
      const trimmed = str.trim();
      if (!trimmed) return null;

      if (trimmed.includes('Ext. ID')) {
        const rawExt = trimmed.split(':')[1]?.trim() || '';
        const clean = rawExt.replace(/^(CR|DB)/i, '').trim();
        if (clean.includes('-')) {
          const parts = clean.split('-');
          if (parts.length >= 2 && parts[1].length >= 8) {
            return parts[1]; // PGSoft parent round ID
          }
          return parts[0];
        } else if (/^\d{8,}$/.test(clean)) {
          return clean;
        }
        return null;
      }

      if (/^\d{10,}-\d{10,}/.test(trimmed)) {
        const parts = trimmed.split('-');
        if (parts.length >= 2 && parts[1].length >= 8) {
          return parts[1]; // PGSoft parent round ID
        }
        return parts[0];
      }

      if (/^\d{8,20}$/.test(trimmed)) {
        return trimmed;
      }

      return null;
    };

    const knownProviders = [
      'PGSoft', 'PG Soft', 'Pragmatic Play', 'Pragmatic', 'IDNSlot', 'IDN Slot', 
      'Slot Mania', 'SlotMania', 'Habanero', 'Microgaming', 'Spadegaming', 'Joker Gaming', 'NoLimit City'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Check Provider match
      for (const prov of knownProviders) {
        if (lower === prov.toLowerCase() || (lower.includes(prov.toLowerCase()) && line.length < 25)) {
          allProvidersSet.add(prov);
          if (!detectedProvider) detectedProvider = prov;

          // Game Name is typically the line right before the Provider name
          if (i > 0) {
            const prevLine = lines[i - 1];
            const prevLower = prevLine.toLowerCase();
            if (
              !prevLower.includes('balance') && 
              !prevLower.includes('credit') && 
              !prevLower.includes('debit') &&
              !prevLine.includes(':') &&
              !prevLine.match(/^\d{6,}/) &&
              prevLine.length >= 3 &&
              prevLine.length <= 40
            ) {
              allGamesSet.add(prevLine);
              if (!detectedGame) detectedGame = prevLine;
            }
          }
        }
      }

      // Check Ext. ID line
      if (line.includes('Ext. ID :') || line.includes('Ext. ID:')) {
        const parts = line.split(':');
        if (parts[1]) {
          const cleanId = parts[1].trim();
          allExtIds.push(cleanId);
          const rId = extractRoundOrTicketId(line);
          if (rId) allRoundIdsSet.add(rId);
        }

        // Line right after Ext. ID is usually the User ID
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextLower = nextLine.toLowerCase();
          if (
            !nextLower.includes('credit') && 
            !nextLower.includes('debit') && 
            !nextLower.includes('ext.') &&
            !nextLine.includes(':') &&
            !nextLine.includes(' - ') &&
            !nextLine.match(/^\d{8,}$/) &&
            nextLine.length >= 3 &&
            nextLine.length <= 30
          ) {
            allUsersSet.add(nextLine);
            if (!detectedUser) detectedUser = nextLine;
          }
        }
      }

      // Check Agent line (e.g. ITWLFA - jvsaa), then line before it might be User ID
      if (line.includes(' - ') && !line.match(/\d{4}/) && i > 0) {
        const candidateUser = lines[i - 1];
        const candLower = candidateUser.toLowerCase();
        if (
          !candLower.includes('credit') &&
          !candLower.includes('debit') &&
          !candLower.includes('ext.') &&
          !candidateUser.includes(':') &&
          !candidateUser.match(/^\d{8,}$/) &&
          candidateUser.length >= 3 &&
          candidateUser.length <= 30
        ) {
          allUsersSet.add(candidateUser);
          if (!detectedUser) detectedUser = candidateUser;
        }
      }

      // Time detection
      if (!detectedTime && (line.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s*-\s*\d{2}:\d{2}:\d{2}/) || line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/))) {
        detectedTime = line;
      }

      // Ticket number / Round ID line (numeric or hyphenated)
      const detectedLineRoundId = extractRoundOrTicketId(line);
      if (detectedLineRoundId) {
        allRoundIdsSet.add(detectedLineRoundId);
        if (!detectedTicket) {
          detectedTicket = detectedLineRoundId;
        }
      }

      // Credit parser
      if (lower === 'credit') {
        creditCount++;
        if (i + 1 < lines.length) {
          sumCredit += parseAmount(lines[i + 1]);
        }
      }

      // Debit parser
      if (lower === 'debit') {
        debitCount++;
        if (i + 1 < lines.length) {
          const amt = parseAmount(lines[i + 1]);
          sumDebit += amt;
          debitAmounts.push(amt);
        }

        // Look backwards to extract debit ticket / round code
        for (let b = 1; b <= 7 && i - b >= 0; b++) {
          const bLine = lines[i - b];
          const dTicket = extractRoundOrTicketId(bLine);
          if (dTicket) {
            debitTickets.add(dTicket);
            allRoundIdsSet.add(dTicket);
            break;
          }
        }
      }
    }

    // Fallback if game name wasn't captured before provider
    if (!detectedGame) {
      if (lines.length > 0 && !lines[0].includes(':') && lines[0].length < 35) {
        detectedGame = lines[0];
      } else {
        detectedGame = 'Mahjong Ways 2';
      }
    }

    // Determine final ticket code
    if (debitTickets.size > 0) {
      detectedTicket = Array.from(debitTickets)[0];
    } else if (allRoundIdsSet.size > 0) {
      detectedTicket = Array.from(allRoundIdsSet)[0];
    } else if (allExtIds.length > 0) {
      detectedTicket = allExtIds[0].replace(/^[A-Z]{2}/, '').split('-')[0];
    }

    // Super scatter check
    const isSuperScatter = detectedGame.toLowerCase().includes('super scatter');

    // Distinct debit values
    const distinctDebitAmounts = Array.from(new Set(debitAmounts));

    // Conflict flags
    // 1. Multiple debit rows or multiple bet amounts
    const hasMultiDebit = debitCount > 1 || distinctDebitAmounts.length > 1;
    // 2. Bet under minimal threshold
    const hasUnderMin = debitAmounts.length > 0 && debitAmounts.some(amt => amt < 1000);
    // 3. Multiple different tickets / round IDs or multiple different games
    const hasMultiTicket = allRoundIdsSet.size > 1 || allGamesSet.size > 1 || debitTickets.size > 1;

    // Multiplier Win (Credit / Debit)
    const multiplierWin = sumDebit > 0 ? (sumCredit / sumDebit) : 0;

    return {
      rawText,
      userId: detectedUser || (allUsersSet.size > 0 ? Array.from(allUsersSet)[0] : 'ruben77'),
      namaRekening: customNamaRek || '-',
      nomorRekening: customNoRek || '-',
      periodePatokan: detectedTime || '30 Aug 2026 - 00:57:50',
      totalCredit: sumCredit,
      totalDebit: sumDebit,
      debitCount,
      creditCount,
      barisTerbaca: barisCount,
      provider: detectedProvider || 'PGSoft',
      permainan: detectedGame,
      kodeTicket: detectedTicket || '2093760049250985473',
      roundId: detectedTicket || '2093760049250985473',
      superBuy: '-',
      isSuperScatterGame: isSuperScatter,
      multiplierWin,
      hasMultiTicketConflict: hasMultiTicket,
      hasMultiDebitConflict: hasMultiDebit,
      hasUnderMinBet: hasUnderMin
    };
  }, [rawText, customNamaRek, customNoRek]);

  // Effective Bet (Nilai Taruhan Asli dalam game / Diedit untuk Buy Spin / Scatter)
  const parsedCustomBet = useMemo(() => {
    if (!customBetInput.trim()) return null;
    const num = parseInt(customBetInput.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num <= 0 ? null : num;
  }, [customBetInput]);

  const effectiveDebit = parsedCustomBet !== null ? parsedCustomBet : parsed.totalDebit;
  const isCustomBetActive = parsedCustomBet !== null && parsedCustomBet !== parsed.totalDebit;
  const effectiveMultiplier = effectiveDebit > 0 ? (parsed.totalCredit / effectiveDebit) : 0;

  // Validation Rules Evaluation
  const validation: ValidationResult = useMemo(() => {
    if (!rawText.trim() || (parsed.totalDebit === 0 && parsedCustomBet === null)) {
      return {
        isScatterEligible: false,
        scatterReason: 'Data kosong atau belum ditempel transaksi DEBIT (nilai taruhan).',
        isHarianEligible: false,
        harianReason: 'Data kosong atau belum ditempel transaksi DEBIT (nilai taruhan).',
        overallStatus: 'EMPTY'
      };
    }

    // Disqualification conditions (Reject All):
    // 1. Different ticket codes or mixed games / rounds in single log
    // 2. Multiple debit category or multiple bet amounts (debit > 1x)
    // 3. Bet amount under minimum threshold (< 1.000)
    if (parsed.hasMultiTicketConflict) {
      const conflictMsg = 'Terdeteksi lebih dari 1 kode tiket / round ID berbeda dalam satu log (mencampur beberapa putaran/sesi permainan).';
      return {
        isScatterEligible: false,
        scatterReason: conflictMsg,
        isHarianEligible: false,
        harianReason: conflictMsg,
        overallStatus: 'REJECTED'
      };
    }

    if (parsed.hasMultiDebitConflict) {
      const conflictMsg = parsed.debitCount > 1 
        ? `Ada kategori DEBIT lebih dari 1x (${parsed.debitCount}x transaksi debit terdeteksi) dalam satu log.`
        : 'Terdeteksi lebih dari 1 nominal nilai taruhan berbeda dalam satu log.';
      return {
        isScatterEligible: false,
        scatterReason: conflictMsg,
        isHarianEligible: false,
        harianReason: conflictMsg,
        overallStatus: 'REJECTED'
      };
    }

    if (effectiveDebit < 1000) {
      const underBetMsg = `Nominal bet Rp ${effectiveDebit.toLocaleString('en-US')} dibawah batas minimal promo (Min Rp 1,000).`;
      return {
        isScatterEligible: false,
        scatterReason: underBetMsg,
        isHarianEligible: false,
        harianReason: underBetMsg,
        overallStatus: 'REJECTED'
      };
    }

    // Table 1: BONUS SCATTER MAHJONG WAYS 1 & 2
    // Syarat:
    // 1. Nilai taruhan minimal 1.200 (effectiveDebit >= 1200)
    // 2. Total Kemenangan minimal 100.000 (parsed.totalCredit >= 100000)
    // 3. Permainan Mahjong Ways atau Mahjong Ways 2
    const isMahjongGame = 
      parsed.permainan.toLowerCase().includes('mahjong ways') || 
      parsed.permainan.toLowerCase() === 'mahjong ways' || 
      parsed.permainan.toLowerCase() === 'mahjong ways 2';

    let scatterValid = false;
    let scatterMsg = '';

    if (!isMahjongGame) {
      scatterMsg = 'Bukan permainan Mahjong Ways 1 atau Mahjong Ways 2.';
    } else if (effectiveDebit < 1200) {
      scatterMsg = `Nilai taruhan Rp ${effectiveDebit.toLocaleString('en-US')} kurang dari batas minimal Rp 1,200.`;
    } else if (parsed.totalCredit < 100000) {
      scatterMsg = `Total kemenangan Rp ${parsed.totalCredit.toLocaleString('en-US')} belum mencapai batas minimal Rp 100,000.`;
    } else {
      scatterValid = true;
      scatterMsg = 'SAH & BISA CLAIM';
    }

    // Table 2: BONUS HARIAN SLOT PRAGMATIC PLAY- IDNSLOT - SLOT MANIA - PGSOFT
    // Syarat:
    // 1. Nilai Taruhan minimal 1.000 (effectiveDebit >= 1000)
    // 2. Provider: PRAGMATIC PLAY, IDNSLOT, SLOT MANIA, PGSOFT
    // 3. Win Up:
    //    - Slot Biasa: Minimal Win Up x300 (totalCredit >= effectiveDebit * 300)
    //    - Game Super Scatter (e.g. Gates of Olympus Super Scatter): Minimal Win Up x2.000 (totalCredit >= effectiveDebit * 2000)
    const validProviders = ['pgsoft', 'pg soft', 'pragmatic play', 'pragmatic', 'idnslot', 'idn slot', 'slot mania', 'slotmania'];
    const isProviderValid = validProviders.some(p => parsed.provider.toLowerCase().includes(p) || p.includes(parsed.provider.toLowerCase()));

    let harianValid = false;
    let harianMsg = '';

    const minMultiplierRequired = parsed.isSuperScatterGame ? 2000 : 300;

    if (!isProviderValid) {
      harianMsg = `Provider ${parsed.provider} tidak termasuk dalam daftar promo harian.`;
    } else if (effectiveDebit < 1000) {
      harianMsg = `Nilai taruhan Rp ${effectiveDebit.toLocaleString('en-US')} kurang dari batas minimal Rp 1,000.`;
    } else if (effectiveMultiplier < minMultiplierRequired) {
      harianMsg = `Win Up hanya x${effectiveMultiplier.toFixed(1)} (Minimal x${minMultiplierRequired.toLocaleString('en-US')} untuk ${parsed.isSuperScatterGame ? 'Super Scatter' : 'Slot Biasa'}).`;
    } else {
      harianValid = true;
      harianMsg = 'SAH & BISA CLAIM';
    }

    let overall: 'BOTH' | 'SCATTER_ONLY' | 'HARIAN_ONLY' | 'REJECTED' = 'REJECTED';
    if (scatterValid && harianValid) {
      overall = 'BOTH';
    } else if (scatterValid && !harianValid) {
      overall = 'SCATTER_ONLY';
    } else if (!scatterValid && harianValid) {
      overall = 'HARIAN_ONLY';
    } else {
      overall = 'REJECTED';
    }

    return {
      isScatterEligible: scatterValid,
      scatterReason: scatterMsg,
      isHarianEligible: harianValid,
      harianReason: harianMsg,
      overallStatus: overall
    };
  }, [rawText, parsed, effectiveDebit, effectiveMultiplier, parsedCustomBet]);

  // Auto-Clear Timer Logic (5 Seconds)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!rawText.trim() || !autoClearEnabled) {
      setCountdown(0);
      return;
    }

    setCountdown(autoClearSeconds);
    const startTime = Date.now();
    const durationMs = autoClearSeconds * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setCountdown(remaining);
    }, 200);

    timerRef.current = setTimeout(() => {
      setRawText('');
      setCustomBetInput('');
      setIsEditingBet(false);
      setCountdown(0);
      setJustCleared(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => setJustCleared(false), 2500);
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rawText, autoClearEnabled, autoClearSeconds]);

  // Copy Scatter (Tab-separated values matching user's exact requested copy line format)
  // Format: {userId}\t\t\t{permainan}\t{kodeTicket}\t{totalCredit}\t{effectiveDebit}
  const handleCopyScatter = () => {
    if (!validation.isScatterEligible) return;
    const formattedCredit = parsed.totalCredit.toLocaleString('en-US');
    const formattedDebit = effectiveDebit.toLocaleString('en-US');
    const namaRek = parsed.namaRekening === '-' ? '' : parsed.namaRekening;
    const noRek = parsed.nomorRekening === '-' ? '' : parsed.nomorRekening;
    const text = `${parsed.userId}\t${namaRek}\t${noRek}\t${parsed.permainan}\t${parsed.kodeTicket}\t${formattedCredit}\t${formattedDebit}`;
    navigator.clipboard.writeText(text);
    setCopiedScatter(true);
    setTimeout(() => setCopiedScatter(false), 2000);
  };

  const formatProviderName = (prov: string): string => {
    const p = (prov || '').toLowerCase();
    if (p.includes('pg')) return 'PG SOFT';
    if (p.includes('pragmatic')) return 'PRAGMATIC PLAY';
    if (p.includes('idn')) return 'IDNSLOT';
    if (p.includes('slot mania') || p.includes('slotmania')) return 'SLOT MANIA';
    if (p.includes('habanero')) return 'HABANERO';
    if (p.includes('microgaming')) return 'MICROGAMING';
    if (p.includes('spade')) return 'SPADEGAMING';
    if (p.includes('joker')) return 'JOKER GAMING';
    if (p.includes('nolimit')) return 'NOLIMIT CITY';
    return (prov || '').toUpperCase();
  };

  // Copy Harian Slot (Tab-separated values matching user's exact requested copy line format)
  // Format: {userId}\t{namaRek}\t{noRek}\t{provider}\t{permainan}\t{roundId}\t{superBuy}\t{totalCredit}\t{effectiveDebit}
  const handleCopyHarian = () => {
    if (!validation.isHarianEligible) return;
    const formattedCredit = parsed.totalCredit.toLocaleString('en-US');
    const formattedDebit = effectiveDebit.toLocaleString('en-US');
    const namaRek = parsed.namaRekening === '-' ? '' : parsed.namaRekening;
    const noRek = parsed.nomorRekening === '-' ? '' : parsed.nomorRekening;
    const providerFormatted = formatProviderName(parsed.provider);
    const ticketToUse = parsed.roundId || parsed.kodeTicket;
    const superBuy = parsed.superBuy === '-' ? '' : parsed.superBuy;
    const text = `${parsed.userId}\t${namaRek}\t${noRek}\t${providerFormatted}\t${parsed.permainan}\t${ticketToUse}\t${superBuy}\t${formattedCredit}\t${formattedDebit}`;
    navigator.clipboard.writeText(text);
    setCopiedHarian(true);
    setTimeout(() => setCopiedHarian(false), 2000);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRawText('');
    setCustomBetInput('');
    setIsEditingBet(false);
    setCountdown(0);
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              VALIDATOR KELAYAKAN BONUS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Auto Audit, Anti-Double & Buy Spin Support
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            BONUS HARIAN SLOT & MAHJONG WAYS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit otomatis kelayakan klaim bonus member berdasarkan nilai taruhan, total kemenangan, fitur buy spin, dan batas win-up.
          </p>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setRawText(SAMPLE_BUY_SPIN_PG);
              setCustomBetInput('1200');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.25)]"
            title="Contoh: Buy Spin PG Soft (jaya66 - Beli 90k, Bet Asli 1.2k, Menang 4.88 Juta = x4,068.4)"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            <span>Contoh: Buy Spin PG (jaya66 - Bet 1.2k)</span>
          </button>
          <button
            onClick={() => {
              setRawText(SAMPLE_SCATTER_ONLY);
              setCustomBetInput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
            title="Contoh 1: Hanya Bonus Scatter Mahjong (ruben77 - Menang 198k, Bet 4k)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Contoh: Scatter Sah (ruben77)</span>
          </button>
          <button
            onClick={() => {
              setRawText(SAMPLE_BOTH_ELIGIBLE);
              setCustomBetInput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
            title="Contoh 2: Scatter & Harian Slot Sah (isna - Menang 433k, Bet 1.2k = x361.6)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contoh: Keduanya Sah (isna)</span>
          </button>
          <button
            onClick={() => {
              setRawText(SAMPLE_HARIAN_ONLY);
              setCustomBetInput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
            title="Contoh 3: Hanya Bonus Harian Slot (nirwana04 - Fortune Of Olympus / Pragmatic Play)"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contoh: Harian Sah (nirwana04)</span>
          </button>
          <button
            onClick={() => {
              setRawText(SAMPLE_MULTI_TICKET_REJECTED);
              setCustomBetInput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
            title="Contoh 4: Ditolak (2 Kode Tiket Berbeda / Multi Spin - 2409heri)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Contoh: Ditolak (2 Tiket - 2409heri)</span>
          </button>
          <button
            onClick={() => {
              setRawText(SAMPLE_REJECTED);
              setCustomBetInput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs font-mono transition-all cursor-pointer"
            title="Contoh 5: Ditolak (Debit 2x / Bet < 1.000 / Konflik Tiket)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Contoh: Ditolak (Debit 2x)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* GLOBAL STATUS ALERT BANNER                                */}
      {/* ========================================================= */}
      {rawText.trim() && (
        <div className="animate-in zoom-in-95 duration-200">
          {validation.overallStatus === 'BOTH' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-black border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                    <span>STATUS VERIFIKASI BONUS:</span>
                    {isCustomBetActive && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400 text-[10px]">
                        BUY SPIN BET DIAUDIT
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white font-['Rajdhani'] uppercase tracking-wider">
                    USER ID <span className="text-emerald-300 underline font-mono">{parsed.userId}</span> BISA CLAIM BONUS SCATTER MAHJONG & HARIAN SLOT!
                  </div>
                  <div className="text-xs text-emerald-200/80 font-mono mt-0.5">
                    Taruhan: Rp {effectiveDebit.toLocaleString('en-US')} {isCustomBetActive && `(Asli Beli: Rp ${parsed.totalDebit.toLocaleString('en-US')})`} | Kemenangan: Rp {parsed.totalCredit.toLocaleString('en-US')} (Win Up: x{effectiveMultiplier.toFixed(1)})
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-black font-black text-xs font-mono tracking-wider shadow-md">
                SAH & BISA CLAIM
              </span>
            </div>
          )}

          {validation.overallStatus === 'SCATTER_ONLY' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-black border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                    <span>STATUS VERIFIKASI BONUS:</span>
                    {isCustomBetActive && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400 text-[10px]">
                        BUY SPIN BET DIAUDIT
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white font-['Rajdhani'] uppercase tracking-wider">
                    USER ID <span className="text-amber-300 underline font-mono">{parsed.userId}</span> HANYA BISA CLAIM BONUS SCATTER MAHJONG
                  </div>
                  <div className="text-xs text-amber-200/80 font-mono mt-0.5">
                    Bonus Harian Slot tidak memenuhi syarat (Win Up x{effectiveMultiplier.toFixed(1)} belum mencapai x300).
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-400 text-black font-black text-xs font-mono tracking-wider shadow-md">
                SCATTER MAHJONG SAH
              </span>
            </div>
          )}

          {validation.overallStatus === 'HARIAN_ONLY' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-cyan-900/60 to-black border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                    <span>STATUS VERIFIKASI BONUS:</span>
                    {isCustomBetActive && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400 text-[10px]">
                        BUY SPIN BET: Rp {effectiveDebit.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white font-['Rajdhani'] uppercase tracking-wider">
                    USER ID <span className="text-cyan-300 underline font-mono">{parsed.userId}</span> HANYA BISA CLAIM BONUS HARIAN SLOT
                  </div>
                  <div className="text-xs text-cyan-200/80 font-mono mt-0.5">
                    {validation.scatterReason} (Win Up: x{effectiveMultiplier.toFixed(1)})
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-cyan-400 text-black font-black text-xs font-mono tracking-wider shadow-md">
                HARIAN SLOT SAH
              </span>
            </div>
          )}

          {validation.overallStatus === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/60 to-black border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/30 border border-rose-400 text-rose-300">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                    PERINGATAN AUDIT KASIR & CS:
                  </div>
                  <div className="text-lg font-black text-rose-300 font-['Rajdhani'] uppercase tracking-wider">
                    WOY JANGAN DIBAGI !! TIDAK MEMENUHI SYARAT BONUS
                  </div>
                  <div className="text-xs text-rose-200 font-mono mt-0.5">
                    Alasan: {validation.scatterReason || validation.harianReason}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs font-mono tracking-wider shadow-md whitespace-nowrap">
                DITOLAK / INVALID
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid: Left (Input Data + Auto Delete 5s) & Right (Hasil Pembacaan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Input Textarea */}
        <div className="lg:col-span-7 rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-white/10 p-5 shadow-xl space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                PASTE DATA DI BAWAH INI 👇
              </span>
              {justCleared && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold animate-pulse">
                  CACHE BERSIH
                </span>
              )}
            </div>

            {/* Auto Delete / Auto Clear Control Toggle (5s) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAutoClearEnabled(!autoClearEnabled)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  autoClearEnabled 
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Aktifkan/Nonaktifkan Auto Clear 5 Detik Anti-Double"
              >
                <Timer className={`w-3.5 h-3.5 ${autoClearEnabled ? 'text-yellow-400 animate-spin' : 'text-gray-500'}`} style={{ animationDuration: '6s' }} />
                <span>AUTO CLEAR: {autoClearEnabled ? `${autoClearSeconds}S` : 'OFF'}</span>
              </button>

              {autoClearEnabled && (
                <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                  {[3, 5, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAutoClearSeconds(sec)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        autoClearSeconds === sec
                          ? 'bg-yellow-400 text-black font-extrabold'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Textarea with Floating Countdown Badge */}
          <div className="relative flex-1 min-h-[250px]">
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Tempel data log statement transaksi di sini... (Otomatis dihapus dalam 5 detik untuk mencegah klaim dobel)"
              className="w-full h-full min-h-[250px] p-4 rounded-2xl bg-black/70 border border-white/10 focus:border-cyan-400 text-xs font-mono text-cyan-300 outline-none resize-none leading-relaxed transition-colors shadow-inner"
            />

            {/* Countdown Badge */}
            {rawText.trim() && autoClearEnabled && countdown > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/80 border border-yellow-400/50 backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                <span className="text-[11px] font-mono font-bold text-yellow-300">
                  Auto Hapus: {countdown}s
                </span>
              </div>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {}}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-black stroke-black" />
              <span>PROSES SESUAI RUMUS</span>
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-2xl bg-[#1A1A1A] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>BERSIHKAN</span>
            </button>
          </div>
        </div>

        {/* Right Card: Hasil Pembacaan */}
        <div className="lg:col-span-5 rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-white/10 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                HASIL PEMBACAAN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                FORMULA MODE
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {/* Periode Patokan Box */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 font-mono flex items-center gap-1">
                  <span>⚡ PERIODE PATOKAN (Q2) ⚡</span>
                </div>
                <div className="text-xs font-black text-white font-mono">
                  {parsed.periodePatokan}
                </div>
              </div>

              {/* 2 Column Stats: Credit & Debit */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    TOTAL KEMENANGAN
                  </div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    Rp {parsed.totalCredit.toLocaleString('en-US')}
                  </div>
                </div>

                {/* Editable Nilai Taruhan (Bet) Box */}
                <div className={`p-3 rounded-2xl border transition-all space-y-1 ${
                  isCustomBetActive 
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-black/60 border-white/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] font-bold text-gray-400 font-mono uppercase flex items-center gap-1">
                      <span>NILAI TARUHAN</span>
                      {isCustomBetActive && <span className="text-purple-400">(DIEDIT)</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingBet(!isEditingBet)}
                      className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer underline"
                      title="Edit nilai taruhan / Atur Bet Buy Spin"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      <span>{isEditingBet ? 'Tutup' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="text-lg font-black text-cyan-300 font-mono flex items-baseline gap-1.5">
                    <span>Rp {effectiveDebit.toLocaleString('en-US')}</span>
                    {isCustomBetActive && (
                      <span className="text-[10px] text-gray-400 font-normal line-through">
                        Rp {parsed.totalDebit.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible or always accessible Edit Bet Panel */}
              {(isEditingBet || isCustomBetActive) && (
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Sesuaikan Nilai Taruhan Asli (Buy Spin / Scatter):</span>
                    </span>
                    {isCustomBetActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBetInput('');
                          setIsEditingBet(false);
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-0.5 font-bold cursor-pointer"
                        title="Kembalikan ke nilai asli log"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-mono">Rp</span>
                      <input
                        type="text"
                        placeholder="Contoh: 1200"
                        value={customBetInput}
                        onChange={e => setCustomBetInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-8 pr-2 py-1 rounded-xl bg-black border border-purple-400/50 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-300 font-bold"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons for Buy Spin */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[9px] text-gray-400 font-mono">Quick Set:</span>
                    <button
                      type="button"
                      onClick={() => setCustomBetInput('1200')}
                      className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold cursor-pointer"
                      title="Set Bet Asli Rp 1,200 (Batas Min Mahjong & Promo Harian)"
                    >
                      ⚡ Bet 1.200
                    </button>
                    {parsed.totalDebit > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.round(parsed.totalDebit / 75);
                            setCustomBetInput(String(val));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold cursor-pointer"
                          title="PG Soft Buy Spin (Beli Rp 90,000 / 75 = Rp 1,200)"
                        >
                          ÷75 (PG Soft)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = Math.round(parsed.totalDebit / 100);
                            setCustomBetInput(String(val));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold cursor-pointer"
                          title="Pragmatic Play Buy Spin (Beli / 100)"
                        >
                          ÷100 (Pragmatic)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 2 Column Stats: Win Multiplier & Game */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase flex items-center justify-between">
                    <span>WIN MULTIPLIER (WIN UP)</span>
                    {effectiveMultiplier >= 300 && (
                      <span className="text-emerald-400 font-bold text-[8px]">≥ x300</span>
                    )}
                  </div>
                  <div className={`text-base font-black font-mono ${effectiveMultiplier >= 300 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    x{effectiveMultiplier.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                  <div className="text-[9px] font-bold text-gray-400 font-mono uppercase">
                    GAME & PROVIDER
                  </div>
                  <div className="text-xs font-black text-yellow-400 font-mono truncate">
                    {parsed.permainan}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit Inputs for Rekening */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase flex items-center justify-between">
              <span>Data Rekening (Opsional):</span>
              <span className="text-[9px] text-cyan-400 font-normal">Otomatis / Manual</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nama Rekening (-)"
                value={customNamaRek === '-' ? '' : customNamaRek}
                onChange={e => setCustomNamaRek(e.target.value || '-')}
                className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-400 text-xs font-mono text-white outline-none"
              />
              <input
                type="text"
                placeholder="No Rekening (-)"
                value={customNoRek === '-' ? '' : customNoRek}
                onChange={e => setCustomNoRek(e.target.value || '-')}
                className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-400 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* TABLE 1: BONUS SCATTER MAHJONG WAYS 1 & 2                 */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden space-y-0">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-cyan-300 font-mono uppercase tracking-wider">
              BONUS SCATTER MAHJONG WAYS 1 & 2
            </h2>
          </div>

          <button
            onClick={handleCopyScatter}
            disabled={!validation.isScatterEligible}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            {copiedScatter ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 1 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">USER ID</th>
                <th className="py-3 px-4 min-w-[140px]">NAMA REKENING</th>
                <th className="py-3 px-4 min-w-[140px]">NOMOR REKENING</th>
                <th className="py-3 px-4 min-w-[150px]">PERMAINAN</th>
                <th className="py-3 px-4 min-w-[200px]">KODE TICKET</th>
                <th className="py-3 px-4 text-center min-w-[140px]">TOTAL KEMENANGAN</th>
                <th className="py-3 px-4 text-center min-w-[120px]">NILAI TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {validation.isScatterEligible ? (
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {parsed.userId}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {parsed.namaRekening}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {parsed.nomorRekening}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-yellow-400">
                    {parsed.permainan}
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 text-[11px] truncate max-w-[240px]">
                    {parsed.kodeTicket}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">
                    {parsed.totalCredit.toLocaleString('en-US')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-cyan-300">
                    <div>{effectiveDebit.toLocaleString('en-US')}</div>
                    {isCustomBetActive && (
                      <div className="text-[9px] text-purple-400 font-normal">
                        (Buy: {parsed.totalDebit.toLocaleString('en-US')})
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="py-5 text-center text-rose-400 bg-rose-950/20">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>{validation.scatterReason}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status Notification Box Under Table 1 */}
        <div className={`p-3 border-t text-xs font-mono font-bold flex items-center justify-between ${
          validation.isScatterEligible 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {validation.isScatterEligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>STATUS BONUS: <strong>SAH & BISA CLAIM</strong> (Bet ≥ 1,200 & Win ≥ 100,000)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>STATUS BONUS: <strong>Woy Jangan Dibagi !! Tidak Memenuhi Syarat Bonus</strong> ({validation.scatterReason})</span>
              </>
            )}
          </div>

          <div className="text-[10px] text-gray-400">
            Syarat: Bet Min 1,200 | Menang Min 100,000 | Mahjong Ways 1 & 2
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLE 2: BONUS HARIAN SLOT PRAGMATIC PLAY- IDNSLOT - SLOT MANIA - PGSOFT  */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#121212]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden space-y-0">
        
        {/* Banner Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d222e] to-[#121212] border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-black text-yellow-300 font-mono uppercase tracking-wider">
              BONUS HARIAN SLOT PRAGMATIC PLAY- IDNSLOT - SLOT MANIA - PGSOFT
            </h2>
          </div>

          <button
            onClick={handleCopyHarian}
            disabled={!validation.isHarianEligible}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            {copiedHarian ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>COPY &gt;&gt;</span>
          </button>
        </div>

        {/* Table 2 Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-cyan-500/10 text-cyan-300 border-b border-cyan-500/20 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 min-w-[100px]">USER ID</th>
                <th className="py-3 px-3.5 min-w-[120px]">NAMA REKENING</th>
                <th className="py-3 px-3.5 min-w-[120px]">NOMOR REKENING</th>
                <th className="py-3 px-3.5 min-w-[100px]">PROVIDER</th>
                <th className="py-3 px-3.5 min-w-[140px]">PERMAINAN</th>
                <th className="py-3 px-3.5 min-w-[180px]">ROUND ID</th>
                <th className="py-3 px-3.5 text-center min-w-[120px]">SUPER BUY FREE SPIN</th>
                <th className="py-3 px-3.5 text-center min-w-[110px]">KEMENANGAN</th>
                <th className="py-3 px-3.5 text-center min-w-[100px]">TARUHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {validation.isHarianEligible ? (
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-3.5 font-bold text-white">
                    {parsed.userId}
                  </td>
                  <td className="py-3.5 px-3.5 text-gray-400">
                    {parsed.namaRekening}
                  </td>
                  <td className="py-3.5 px-3.5 text-gray-400">
                    {parsed.nomorRekening}
                  </td>
                  <td className="py-3.5 px-3.5 font-semibold text-cyan-400">
                    {formatProviderName(parsed.provider)}
                  </td>
                  <td className="py-3.5 px-3.5 font-semibold text-yellow-400">
                    {parsed.permainan}
                  </td>
                  <td className="py-3.5 px-3.5 text-gray-300 text-[11px] truncate max-w-[200px]">
                    {parsed.roundId}
                  </td>
                  <td className="py-3.5 px-3.5 text-center text-gray-400">
                    {parsed.superBuy}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-extrabold text-emerald-400">
                    {parsed.totalCredit.toLocaleString('en-US')}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-extrabold text-cyan-300">
                    <div>{effectiveDebit.toLocaleString('en-US')}</div>
                    {isCustomBetActive && (
                      <div className="text-[9px] text-purple-400 font-normal">
                        (Buy: {parsed.totalDebit.toLocaleString('en-US')})
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={9} className="py-5 text-center text-rose-400 bg-rose-950/20">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>{validation.harianReason}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status Notification Box Under Table 2 */}
        <div className={`p-3 border-t text-xs font-mono font-bold flex items-center justify-between ${
          validation.isHarianEligible 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {validation.isHarianEligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>STATUS BONUS: <strong>SAH & BISA CLAIM</strong> (Bet ≥ 1,000 & Win Up ≥ x300)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>STATUS BONUS: <strong>Woy Jangan Dibagi !! Tidak Memenuhi Syarat Bonus</strong> ({validation.harianReason})</span>
              </>
            )}
          </div>

          <div className="text-[10px] text-gray-400">
            Syarat: Bet Min 1,000 | Win Up Slot Biasa ≥ x300 | Super Scatter ≥ x2,000
          </div>
        </div>
      </div>

    </div>
  );
};

