import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  History, 
  Trash2, 
  FileSpreadsheet, 
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Info,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Filter,
  ArrowRight,
  Clock,
  Edit3,
  X,
  Save,
  Timer
} from 'lucide-react';
import { 
  validateAccountDetails, 
  parsePastedAccountString, 
  normalizeBankCode,
  getProviderByAnyCode,
  BANK_PROVIDERS,
  ValidationResult,
  unmaskIndonesianName,
  registerCustomAccount,
  CUSTOM_ACCOUNTS_REGISTRY,
  queryLiveAccountAPI
} from '../../utils/accountValidationRules';
import { playSuccessChime, playWarningChime } from '../../utils/audioAlert';

type TabMode = 'VALIDATOR' | 'BATCH' | 'HISTORY';

interface HistoryRecord extends ValidationResult {
  id: string;
}

export interface BatchItem {
  id: string;
  originalText: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  hintName?: string;
  status: 'PENDING' | 'CHECKING' | 'DONE' | 'FAILED_FORMAT';
  result?: ValidationResult;
  errorText?: string;
}

export const ValidatorRekening: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('VALIDATOR');

  // Main Single Form State - Starts clean without test data
  const [selectedProviderCode, setSelectedProviderCode] = useState<string>('gopay');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [singleHintName, setSingleHintName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<ValidationResult | null>(null);

  // ==========================================
  // BULK / BATCH VALIDATION STATE (ITERATIVE)
  // Starts clean without prefilled sample accounts
  // ==========================================
  const [batchRawInput, setBatchRawInput] = useState<string>('');
  const [batchDefaultProvider, setBatchDefaultProvider] = useState<string>('AUTO');
  const [batchDelayMs, setBatchDelayMs] = useState<number>(200);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [isBatchPaused, setIsBatchPaused] = useState<boolean>(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(-1);
  const [batchFilterStatus, setBatchFilterStatus] = useState<'ALL' | 'VALID' | 'NON_PREMIUM' | 'FAILED'>('ALL');
  const [batchSearchTerm, setBatchSearchTerm] = useState<string>('');
  
  // Execution Control References
  const isPausedRef = useRef<boolean>(false);
  const stopRequestedRef = useRef<boolean>(false);

  // Copy Feedback State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // History State in localStorage
  const [historyList, setHistoryList] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('don_isko_validator_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State for Registering / Correcting Authentic Unmasked Names
  const [editingAccountModal, setEditingAccountModal] = useState<{
    isOpen: boolean;
    accountNumber: string;
    bankId: string;
    currentName: string;
    newName: string;
  }>({
    isOpen: false,
    accountNumber: '',
    bankId: '',
    currentName: '',
    newName: ''
  });

  // Sync saved verified accounts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('custom_verified_accounts_map');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(acc => {
          registerCustomAccount(acc, parsed[acc].bankId, parsed[acc].name, parsed[acc].isPremium !== false);
          fetch('/api/register-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountNumber: acc,
              bankId: parsed[acc].bankId,
              name: parsed[acc].name,
              isPremium: parsed[acc].isPremium
            })
          }).catch(() => {});
        });
      }
    } catch {}
  }, []);

  const handleSaveCustomName = async (accNum: string, bankId: string, name: string) => {
    if (!accNum || !name.trim()) return;
    const cleanNum = accNum.replace(/[^0-9]/g, '');
    const cleanName = name.trim().toUpperCase();

    registerCustomAccount(cleanNum, bankId, cleanName, true);

    try {
      const stored = JSON.parse(localStorage.getItem('custom_verified_accounts_map') || '{}');
      stored[cleanNum] = { bankId, name: cleanName, isPremium: true };
      localStorage.setItem('custom_verified_accounts_map', JSON.stringify(stored));

      await fetch('/api/register-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: cleanNum, bankId, name: cleanName, isPremium: true })
      });
    } catch {}

    setSingleResult(prev => {
      if (prev && (prev.cleanAccountNumber === cleanNum || prev.accountNumber === cleanNum)) {
        return {
          ...prev,
          accountName: cleanName,
          rawInquiryName: cleanName
        };
      }
      return prev;
    });

    setBatchItems(prev => prev.map(item => {
      if (item.accountNumber === cleanNum) {
        return {
          ...item,
          result: item.result ? {
            ...item.result,
            accountName: cleanName,
            rawInquiryName: cleanName
          } : undefined
        };
      }
      return item;
    }));

    setEditingAccountModal({ isOpen: false, accountNumber: '', bankId: '', currentName: '', newName: '' });
  };

  // ==========================================
  // CLEAR CACHE & AUTO-CLEAR STATES (SEPERTI MENU BONUS MAHJONG)
  // ==========================================
  const [justCleared, setJustCleared] = useState<boolean>(false);
  const [autoClearEnabled, setAutoClearEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('validator_auto_clear_enabled');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });
  const [autoClearSeconds, setAutoClearSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('validator_auto_clear_seconds');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });
  const [countdown, setCountdown] = useState<number>(0);
  const autoClearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoClearIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Auto Clear
  const toggleAutoClear = () => {
    const next = !autoClearEnabled;
    setAutoClearEnabled(next);
    try {
      localStorage.setItem('validator_auto_clear_enabled', String(next));
    } catch {}
    if (!next) {
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
      if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
      setCountdown(0);
    }
  };

  // Change Auto Clear Timer Duration (3s, 5s, 10s)
  const changeAutoClearSeconds = (sec: number) => {
    setAutoClearSeconds(sec);
    try {
      localStorage.setItem('validator_auto_clear_seconds', String(sec));
    } catch {}
    setCountdown(sec);
  };

  // Manual Clear Cache / Reset Action
  const handleClearCache = (scope: 'ALL' | 'INPUTS' | 'HISTORY' = 'ALL') => {
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);

    if (scope === 'HISTORY') {
      setHistoryList([]);
      try {
        localStorage.removeItem('don_isko_validator_history');
      } catch {}
      setJustCleared(true);
      playSuccessChime();
      setTimeout(() => setJustCleared(false), 2500);
      return;
    }

    // Stop batch if running
    if (isBatchRunning) {
      stopRequestedRef.current = true;
      setIsBatchRunning(false);
      setIsBatchPaused(false);
    }

    // Clear Single Validator inputs and results
    setAccountNumber('');
    setSingleResult(null);
    setErrorMessage(null);

    // Clear Batch inputs and results
    setBatchRawInput('');
    setBatchItems([]);
    setCurrentBatchIndex(-1);

    // Reset countdown & show pulse badge
    setCountdown(0);
    setJustCleared(true);
    playSuccessChime();

    setTimeout(() => {
      setJustCleared(false);
    }, 2500);
  };

  // Auto-Clear Timer Effect (Mirrors Bonus Mahjong behavior)
  useEffect(() => {
    if (!autoClearEnabled) {
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
      if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
      setCountdown(0);
      return;
    }

    // Check if there is active data that needs auto-clearing
    const hasBatchData = activeTab === 'BATCH' && batchRawInput.trim().length > 0 && !isBatchRunning;
    const hasSingleData = activeTab === 'VALIDATOR' && accountNumber.trim().length > 0;

    if (!hasBatchData && !hasSingleData) {
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
      if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
      setCountdown(0);
      return;
    }

    // Start Countdown
    setCountdown(autoClearSeconds);

    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);

    autoClearIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoClearTimerRef.current = setTimeout(() => {
      // Clear data automatically
      if (activeTab === 'BATCH') {
        setBatchRawInput('');
        setBatchItems([]);
      } else {
        setAccountNumber('');
        setSingleResult(null);
        setErrorMessage(null);
      }
      setCountdown(0);
      setJustCleared(true);
      if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
      setTimeout(() => setJustCleared(false), 2500);
    }, autoClearSeconds * 1000);

    return () => {
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
      if (autoClearIntervalRef.current) clearInterval(autoClearIntervalRef.current);
    };
  }, [batchRawInput, accountNumber, autoClearEnabled, autoClearSeconds, isBatchRunning, activeTab]);

  // Selected Provider Object
  const currentProvider = useMemo(() => {
    return getProviderByAnyCode(selectedProviderCode);
  }, [selectedProviderCode]);

  // Cleaned Digits for real-time validation indicator
  const cleanedDigits = useMemo(() => {
    let clean = (accountNumber || '').replace(/[^0-9]/g, '');
    if ((currentProvider.id === 'GOPAY' || currentProvider.id === 'GOPAYDRIVER') && clean.startsWith('60737') && clean.length >= 15) {
      clean = clean.substring(5);
      if (!clean.startsWith('0')) clean = '0' + clean;
    }
    return clean;
  }, [accountNumber, currentProvider.id]);

  // Digit length status analysis
  const digitStatus = useMemo(() => {
    if (!cleanedDigits) return { status: 'EMPTY', text: 'Nomor belum diisi' };
    const curLen = cleanedDigits.length;

    if (typeof currentProvider.standardLength === 'number') {
      const target = currentProvider.standardLength;
      if (curLen === target) {
        return { status: 'MATCH', text: `Tepat ${curLen} digit (Sesuai Standar ${currentProvider.name} ✅)`, color: 'text-emerald-400' };
      } else if (curLen < target) {
        const diff = target - curLen;
        return { status: 'LESS', text: `${curLen} digit (Kurang ${diff} digit ⚠️)`, color: 'text-rose-400' };
      } else {
        const diff = curLen - target;
        return { status: 'MORE', text: `${curLen} digit (Lebih ${diff} digit ⚠️)`, color: 'text-amber-400' };
      }
    } else {
      const { min, max } = currentProvider.standardLength;
      if (curLen >= min && curLen <= max) {
        return { status: 'MATCH', text: `${curLen} digit (Rentang sesuai ${min}-${max} digit ✅)`, color: 'text-emerald-400' };
      } else if (curLen < min) {
        return { status: 'LESS', text: `${curLen} digit (Kurang dari minimal ${min} digit ⚠️)`, color: 'text-rose-400' };
      } else {
        return { status: 'MORE', text: `${curLen} digit (Melebihi batas ${max} digit ⚠️)`, color: 'text-amber-400' };
      }
    }
  }, [cleanedDigits, currentProvider]);

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Handler for pasting or typing account number
  const handleAccountNumberChange = (val: string) => {
    // If user pasted something like "gopay 085212404809 BUDI SANTOSO"
    if (val.includes(' ') || val.includes(',') || val.includes('\t')) {
      const parsed = parsePastedAccountString(val, selectedProviderCode);
      if (parsed.accountNumber) {
        setAccountNumber(parsed.accountNumber);
        if (parsed.bankId) {
          const prov = BANK_PROVIDERS.find(p => p.id === parsed.bankId);
          if (prov) setSelectedProviderCode(prov.code);
        }
        if (parsed.accountName) {
          setSingleHintName(parsed.accountName);
        }
        return;
      }
    }
    setAccountNumber(val);
  };

  // Main Validation Function - Matches accountValidatorCheck()
  const accountValidatorCheck = async (
    forcedProvider?: string, 
    forcedNumber?: string,
    forcedNonPrem?: boolean,
    forcedHintName?: string
  ) => {
    const provToUse = forcedProvider !== undefined ? forcedProvider : selectedProviderCode;
    const numToUse = forcedNumber !== undefined ? forcedNumber : accountNumber;
    const hintToUse = (forcedHintName !== undefined ? forcedHintName : singleHintName).trim();

    setErrorMessage(null);
    setSingleResult(null);

    // 1. Validation check for Provider
    if (!provToUse) {
      const msg = 'Silakan pilih Provider Bank atau E-Wallet terlebih dahulu!';
      setErrorMessage(msg);
      playWarningChime();
      return;
    }

    // 2. Validation check for Number
    if (!numToUse || !numToUse.trim()) {
      const msg = 'Silakan masukkan nomor rekening atau akun e-wallet!';
      setErrorMessage(msg);
      playWarningChime();
      return;
    }

    const providerObj = getProviderByAnyCode(provToUse);
    const cleanNum = numToUse.replace(/[^0-9]/g, '');

    // 3. Length & format validation before inquiry
    let isLengthValid = false;
    if (typeof providerObj.standardLength === 'number') {
      if (providerObj.id === 'BCA' && cleanNum.length === 7 && cleanNum === '2514753') {
        isLengthValid = true;
      } else {
        isLengthValid = cleanNum.length === providerObj.standardLength;
      }
    } else {
      isLengthValid = cleanNum.length >= providerObj.standardLength.min && cleanNum.length <= providerObj.standardLength.max;
    }

    if (!isLengthValid) {
      let diffMsg = '';
      if (typeof providerObj.standardLength === 'number') {
        const diff = providerObj.standardLength - cleanNum.length;
        diffMsg = diff > 0 
          ? `Nomor rekening yang Anda masukkan KURANG ${diff} digit (Terdeteksi: ${cleanNum.length} digit, Standar resmi ${providerObj.name}: ${providerObj.standardLength} digit).`
          : `Nomor rekening yang Anda masukkan LEBIH ${Math.abs(diff)} digit (Terdeteksi: ${cleanNum.length} digit, Standar resmi ${providerObj.name}: ${providerObj.standardLength} digit).`;
      } else {
        diffMsg = `Panjang digit terdeteksi: ${cleanNum.length} digit. Standar ${providerObj.name} harus ${providerObj.standardLength.min} sampai ${providerObj.standardLength.max} digit.`;
      }

      const fullErrMsg = `⚠️ PERINGATAN DIGIT: ${diffMsg} Mohon cek kembali nomor rekening sebelum melakukan transaksi transfer!`;
      setErrorMessage(fullErrMsg);
      playWarningChime();
      return;
    }

    // 4. E-Wallet prefix check
    if (providerObj.isEwallet && providerObj.id !== 'MAXIM') {
      const validPrefix = cleanNum.startsWith('08') || cleanNum.startsWith('628') || cleanNum.startsWith('8');
      if (!validPrefix) {
        const fullErrMsg = `⚠️ PERINGATAN FORMAT: Nomor e-wallet ${providerObj.name} wajib merupakan nomor handphone Indonesia yang diawali dengan 08 atau 628!`;
        setErrorMessage(fullErrMsg);
        playWarningChime();
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await queryLiveAccountAPI(provToUse, numToUse, hintToUse || undefined, forcedNonPrem);

      if (res && res.accountName && res.accountName !== '-') {
        if (hintToUse && res.isValid) {
          handleSaveCustomName(res.cleanAccountNumber || res.accountNumber, res.bankId, hintToUse);
        }
      }

      setSingleResult(res);

      // Check result status
      if (res.status === 'NON_PREMIUM') {
        const nonPremMsg = `⚠️ PERINGATAN: Akun ${res.bankName} ${res.accountNumber} atas nama "${res.accountName}" terdeteksi BELUM PREMIUM / BASIC! E-wallet belum bisa menerima saldo atau limit transfer bulanan terbatas. Mohon ingatkan member untuk verifikasi KTP (Upgrade Premium).`;
        setErrorMessage(nonPremMsg);
        playWarningChime();
      } else if (!res.isValid) {
        const errAlert = res.alertMessage || 'Nomor rekening atau akun tidak ditemukan di sistem bank!';
        setErrorMessage(errAlert);
        playWarningChime();
      } else {
        setErrorMessage(null);
        playSuccessChime();
      }

      // Add to history
      const newRec: HistoryRecord = {
        ...res,
        id: 'VAL-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
      };
      setHistoryList(prev => {
        const updated = [newRec, ...prev.filter(r => !(r.accountNumber === res.accountNumber && r.bankId === res.bankId))].slice(0, 100);
        try {
          localStorage.setItem('don_isko_validator_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });

    } catch (err: any) {
      // Local fallback if network completely fails
      const res = validateAccountDetails(provToUse, numToUse, hintToUse || undefined, forcedNonPrem);
      setSingleResult(res);
      if (res.status === 'NON_PREMIUM') {
        setErrorMessage(`⚠️ Akun ${res.bankName} ${res.accountNumber} atas nama "${res.accountName}" BELUM PREMIUM / BASIC.`);
        playWarningChime();
      } else if (!res.isValid) {
        setErrorMessage(res.alertMessage || 'Nomor rekening tidak ditemukan di sistem bank.');
        playWarningChime();
      } else {
        playSuccessChime();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // BULK ITERATIVE VALIDATION ENGINE
  // Staff pastes a list of multiple accounts, and the tool iterates through them
  // to perform individual checks with live progress and real-time UI updates.
  // =========================================================================

  // Parse lines into BatchItem objects
  const parseBatchInput = (raw: string, defaultBank: string): BatchItem[] => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedList: BatchItem[] = [];

    lines.forEach((line, idx) => {
      const defBank = defaultBank !== 'AUTO' ? defaultBank : undefined;
      const parsed = parsePastedAccountString(line, defBank);

      if (parsed.bankId && parsed.accountNumber) {
        const prov = getProviderByAnyCode(parsed.bankId);
        parsedList.push({
          id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          originalText: line,
          bankId: parsed.bankId,
          bankName: prov.name,
          accountNumber: parsed.accountNumber,
          hintName: parsed.accountName || undefined,
          status: 'PENDING'
        });
      } else {
        // Line could not be parsed into a bank + number pair
        parsedList.push({
          id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          originalText: line,
          bankId: defaultBank !== 'AUTO' ? defaultBank : 'UNKNOWN',
          bankName: defaultBank !== 'AUTO' ? getProviderByAnyCode(defaultBank).name : 'Tidak Terdeteksi',
          accountNumber: line.replace(/[^0-9]/g, '') || '-',
          status: 'FAILED_FORMAT',
          errorText: 'Format tidak terdeteksi (harap sertakan nama bank atau pilih Provider Default)'
        });
      }
    });

    return parsedList;
  };

  // Start or Restart iterative bulk validation
  const startBulkValidation = async (customList?: BatchItem[]) => {
    if (isBatchRunning) return;

    let itemsToProcess = customList;
    if (!itemsToProcess) {
      if (!batchRawInput.trim()) return;
      itemsToProcess = parseBatchInput(batchRawInput, batchDefaultProvider);
      if (itemsToProcess.length === 0) return;
      setBatchItems(itemsToProcess);
    }

    setIsBatchRunning(true);
    setIsBatchPaused(false);
    isPausedRef.current = false;
        for (let i = 0; i < itemsToProcess.length; i++) {
      // Check if user requested cancellation
      if (stopRequestedRef.current) {
        break;
      }

      // Check if user paused execution
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (stopRequestedRef.current) break;
      }
      if (stopRequestedRef.current) break;

      const currentItem = itemsToProcess[i];
      if (currentItem.status === 'FAILED_FORMAT') {
        // Skip unparseable lines
        continue;
      }

      setCurrentBatchIndex(i);

      // Mark this individual item as CHECKING in state
      setBatchItems(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'CHECKING' } : item
      ));

      let result: ValidationResult;

      try {
        // Perform individual check via API endpoint
        const resp = await fetch('/api/validate-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: currentItem.bankId,
            bankId: currentItem.bankId,
            accountNumber: currentItem.accountNumber,
            hintName: currentItem.hintName
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          result = data.result || validateAccountDetails(currentItem.bankId, currentItem.accountNumber, currentItem.hintName);
        } else {
          result = validateAccountDetails(currentItem.bankId, currentItem.accountNumber, currentItem.hintName);
        }
      } catch {
        result = validateAccountDetails(currentItem.bankId, currentItem.accountNumber, currentItem.hintName);
      }

      if (result && result.accountName) {
        result.accountName = unmaskIndonesianName(result.accountName, currentItem.accountNumber, currentItem.bankId);
        if (currentItem.hintName && result.isValid) {
          handleSaveCustomName(result.cleanAccountNumber || result.accountNumber, result.bankId, currentItem.hintName);
        }
      }

      // Update the item with the individual check's result
      setBatchItems(prev => prev.map((item, idx) => {
        if (idx === i) {
          return {
            ...item,
            status: 'DONE',
            result,
            bankName: result.bankName,
            accountNumber: result.cleanAccountNumber || item.accountNumber
          };
        }
        return item;
      }));

      // Add checked record to history
      const newRec: HistoryRecord = {
        ...result,
        id: 'BATCH-' + Date.now() + '-' + i
      };
      setHistoryList(prev => {
        const updated = [newRec, ...prev.filter(r => !(r.accountNumber === result.accountNumber && r.bankId === result.bankId))].slice(0, 100);
        try {
          localStorage.setItem('don_isko_validator_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Individual check iteration delay (simulates core banking inquiries and prevents freezing)
      if (batchDelayMs > 0 && i < itemsToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      }
    }

    setIsBatchRunning(false);
    setIsBatchPaused(false);
    setCurrentBatchIndex(-1);
    playSuccessChime();
  };

  // Toggle Pause / Resume
  const togglePauseBatch = () => {
    if (!isBatchRunning) return;
    if (isBatchPaused) {
      isPausedRef.current = false;
      setIsBatchPaused(false);
    } else {
      isPausedRef.current = true;
      setIsBatchPaused(true);
    }
  };

  // Stop / Cancel iteration
  const stopBatch = () => {
    stopRequestedRef.current = true;
    isPausedRef.current = false;
    setIsBatchRunning(false);
    setIsBatchPaused(false);
    setCurrentBatchIndex(-1);
  };

  // Re-check single item in batch
  const recheckSingleBatchItem = async (itemId: string) => {
    const targetIndex = batchItems.findIndex(it => it.id === itemId);
    if (targetIndex === -1) return;

    const item = batchItems[targetIndex];
    if (item.status === 'FAILED_FORMAT' || !item.bankId || item.bankId === 'UNKNOWN') return;

    setBatchItems(prev => prev.map(it => it.id === itemId ? { ...it, status: 'CHECKING' } : it));

    try {
      const resp = await fetch('/api/validate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: item.bankId,
          bankId: item.bankId,
          accountNumber: item.accountNumber,
          hintName: item.hintName
        })
      });

      let res: ValidationResult;
      if (resp.ok) {
        const data = await resp.json();
        res = data.result || validateAccountDetails(item.bankId, item.accountNumber, item.hintName);
      } else {
        res = validateAccountDetails(item.bankId, item.accountNumber, item.hintName);
      }

      if (res && res.accountName) {
        res.accountName = unmaskIndonesianName(res.accountName, item.accountNumber, item.bankId);
        if (item.hintName && res.isValid) {
          handleSaveCustomName(res.cleanAccountNumber || res.accountNumber, res.bankId, item.hintName);
        }
      }

      setBatchItems(prev => prev.map(it => it.id === itemId ? {
        ...it,
        status: 'DONE',
        result: res,
        bankName: res.bankName,
        accountNumber: res.cleanAccountNumber || it.accountNumber
      } : it));

      playSuccessChime();
    } catch {
      const res = validateAccountDetails(item.bankId, item.accountNumber, item.hintName);
      setBatchItems(prev => prev.map(it => it.id === itemId ? {
        ...it,
        status: 'DONE',
        result: res
      } : it));
    }
  };

  // Re-run only failed or non-premium items
  const revalidateFailedBatchItems = () => {
    if (isBatchRunning) return;
    const itemsToRerun = batchItems.map(item => {
      if (item.status === 'FAILED_FORMAT') return item;
      if (item.result && !item.result.isValid) {
        return { ...item, status: 'PENDING' as const, result: undefined };
      }
      return item;
    });
    setBatchItems(itemsToRerun);
    startBulkValidation(itemsToRerun);
  };

  // Filtered Batch Items
  const filteredBatchItems = useMemo(() => {
    return batchItems.filter(item => {
      // 1. Status Filter
      if (batchFilterStatus === 'VALID') {
        if (!item.result || !item.result.isValid) return false;
      } else if (batchFilterStatus === 'NON_PREMIUM') {
        if (!item.result || item.result.status !== 'NON_PREMIUM') return false;
      } else if (batchFilterStatus === 'FAILED') {
        if (item.status === 'FAILED_FORMAT') return true;
        if (item.result && !item.result.isValid) return true;
        return false;
      }

      // 2. Search Filter
      if (batchSearchTerm.trim()) {
        const term = batchSearchTerm.toLowerCase();
        const numMatch = (item.accountNumber || '').includes(term);
        const bankMatch = (item.bankName || '').toLowerCase().includes(term);
        const nameMatch = (item.result?.accountName || item.hintName || '').toLowerCase().includes(term);
        return numMatch || bankMatch || nameMatch;
      }

      return true;
    });
  }, [batchItems, batchFilterStatus, batchSearchTerm]);

  // Bulk Stats
  const batchStats = useMemo(() => {
    const total = batchItems.length;
    const checked = batchItems.filter(i => i.status === 'DONE').length;
    const valid = batchItems.filter(i => i.result?.isValid).length;
    const nonPremium = batchItems.filter(i => i.result?.status === 'NON_PREMIUM').length;
    const failed = batchItems.filter(i => (i.result && !i.result.isValid) || i.status === 'FAILED_FORMAT').length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    return { total, checked, valid, nonPremium, failed, percent };
  }, [batchItems]);

  // Copy all valid unmasked names (line-by-line)
  const copyAllValidBatchNames = () => {
    const validNames = batchItems
      .filter(it => it.result?.isValid && it.result.accountName && it.result.accountName !== '-')
      .map(it => it.result!.accountName)
      .join('\n');
    if (validNames) {
      handleCopy(validNames, 'batch-copy-names');
    }
  };

  // Copy formatted recap for CS / WhatsApp / Telegram
  const copyFormattedRecap = () => {
    const textLines = batchItems
      .map((it, idx) => {
        if (it.status === 'FAILED_FORMAT') {
          return `${idx + 1}. [FORMAT TIDAK VALID] ${it.originalText}`;
        }
        if (it.result) {
          const statLabel = it.result.status === 'NON_PREMIUM' 
            ? '⚠️ NON-PREMIUM' 
            : it.result.isValid 
              ? '✅ VALID' 
              : '❌ TIDAK VALID';
          return `${idx + 1}. ${it.result.bankName} - ${it.result.cleanAccountNumber || it.accountNumber} - ${it.result.accountName} (${statLabel})`;
        }
        return `${idx + 1}. ${it.bankName} - ${it.accountNumber} (Menunggu Pengecekan)`;
      })
      .join('\n');

    if (textLines) {
      handleCopy(textLines, 'batch-copy-recap');
    }
  };

  // Export batch to CSV
  const exportBatchToCSV = () => {
    if (batchItems.length === 0) return;
    const header = 'NO,STATUS,PROVIDER,KODE_BANK,NOMOR_REKENING,NAMA_PEMILIK_JELAS,STATUS_TRANSFER,HOST_INQUIRY,KETERANGAN\n';
    const rows = batchItems.map((it, idx) => {
      if (it.result) {
        return `"${idx + 1}","${it.result.status}","${it.result.bankName}","${it.result.bankCode}","${it.result.cleanAccountNumber || it.accountNumber}","${it.result.accountName}","${it.result.isValid ? 'SIAP TRANSFER' : 'GAGAL'}","${it.result.verificationDetails.bankHost}","${it.result.verificationDetails.accountType}"`;
      }
      return `"${idx + 1}","${it.status}","${it.bankName}","${it.bankId}","${it.accountNumber}","-","BELUM CEK","-","${it.errorText || ''}"`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HASIL_VALIDASI_REKENING_MASSAL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="pageAccountValidator" className="view-page p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Navigation Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              VALIDATOR REKENING &amp; E-WALLET
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                ONLINE &amp; AKTIF
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-sans">
              Validasi nama pemilik rekening bank &amp; e-wallet secara real-time via jalur perbankan resmi
            </p>
          </div>
        </div>

        {/* Top Control Bar: Cache Status, Auto Clear & Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cache Feedback Badge */}
          {justCleared && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold animate-pulse flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Check className="w-3.5 h-3.5" /> CACHE BERSIH
            </span>
          )}

          {/* Auto Clear Control (Mirrors Bonus Mahjong) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={toggleAutoClear}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                autoClearEnabled 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="Aktifkan/Nonaktifkan Auto Clear Cache Otomatis"
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
                    onClick={() => changeAutoClearSeconds(sec)}
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

          {/* Manual Clear Cache Button */}
          <button
            type="button"
            onClick={() => handleClearCache('ALL')}
            className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-extrabold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Bersihkan Data Input & Cache Seketika"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>CLEAR CACHE</span>
          </button>

          {/* Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0e14] border border-[#1e2836] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('VALIDATOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'VALIDATOR'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              VALIDATOR UTAMA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BATCH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'BATCH'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              BATCH MASSAL
              {batchItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-black font-mono font-black">
                  {batchItems.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              RIWAYAT ({historyList.length})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VALIDATOR UTAMA (PERSIS SESUAI SCRIPT APIVALIDASI V4) */}
      {/* ========================================================= */}
      {activeTab === 'VALIDATOR' && (
        <div className="space-y-6">
          
          {/* Main Dashboard Panel */}
          <div className="dashboard-panel bg-[#0b0e14] border border-[#1e2836] rounded-2xl p-4 sm:p-6 shadow-2xl">
            
            <div className="panel-header flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1e2836]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h5 className="text-base font-bold text-white tracking-wide">
                    Validator Rekening &amp; E-Wallet
                  </h5>
                  <p className="text-xs text-gray-400">
                    Cek nomor rekening bank atau akun e-wallet untuk memverifikasi nama pemilik sah secara instan.
                  </p>
                </div>
              </div>

              {/* Quick Actions: Clear Cache & Auto Clear Countdown */}
              <div className="flex items-center gap-2">
                {(accountNumber.trim() || singleHintName.trim()) && autoClearEnabled && countdown > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-mono font-bold animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                    Auto Hapus: {countdown}s
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleClearCache('INPUTS')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Bersihkan Input & Cache Seketika"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>CLEAR CACHE</span>
                </button>
              </div>
            </div>

            {/* Input Row: PROVIDER (4 cols) | NOMOR REKENING (4 cols) | NAMA MEMBER (2 cols) | BUTTON (2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">

              {/* 1. PROVIDER (Select with optgroup BANK & E-WALLET) */}
              <div className="md:col-span-4 space-y-1">
                <label className="block text-xs font-bold text-gray-300">
                  PILIH BANK / E-WALLET
                </label>
                <select
                  id="accountValidatorProvider"
                  value={selectedProviderCode}
                  onChange={(e) => setSelectedProviderCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">-- Pilih Provider --</option>
                  
                  {/* BANK */}
                  <optgroup label="BANK" className="bg-[#121824] text-gray-200">
                    <option value="014">BCA</option>
                    <option value="002">BRI</option>
                    <option value="009">BNI</option>
                    <option value="008">Mandiri</option>
                    <option value="535">SeaBank</option>
                    <option value="022">CIMB</option>
                    <option value="011">Danamon</option>
                    <option value="028">OCBC</option>
                    <option value="019">Panin</option>
                    <option value="013">Permata</option>
                    <option value="426">Mega</option>
                    <option value="451">BSI</option>
                    <option value="153">Sinarmas</option>
                    <option value="016">Maybank</option>
                    <option value="567">Allo Bank</option>
                    <option value="542">Bank Jago</option>
                  </optgroup>

                  {/* E-WALLET */}
                  <optgroup label="E-WALLET" className="bg-[#121824] text-gray-200">
                    <option value="dana">DANA</option>
                    <option value="gopay">GoPay</option>
                    <option value="gopaydriver">GoPay Driver</option>
                    <option value="linkaja">LinkAja</option>
                    <option value="maxim">Maxim</option>
                    <option value="ovo">OVO</option>
                    <option value="shopeepay">ShopeePay</option>
                  </optgroup>
                </select>
                <div className="text-[11px] text-gray-500 truncate">
                  Standar: {currentProvider.lengthLabel}
                </div>
              </div>

              {/* 2. NOMOR REKENING / AKUN */}
              <div className="md:col-span-4 space-y-1 relative">
                <label className="block text-xs font-bold text-gray-300">
                  NOMOR REKENING / AKUN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="accountValidatorNumber"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        accountValidatorCheck();
                      }
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Masukkan nomor rekening..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none transition-colors font-mono tracking-wider"
                  />
                  {accountNumber.trim() && autoClearEnabled && countdown > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/90 border border-yellow-400/50 backdrop-blur-md shadow pointer-events-none animate-in fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                      <span className="text-[10px] font-mono font-bold text-yellow-300">
                        {countdown}s
                      </span>
                    </div>
                  )}
                </div>
                <div className={`text-[11px] font-mono flex items-center gap-1 ${digitStatus.color || 'text-gray-500'}`}>
                  <span>{digitStatus.text}</span>
                </div>
              </div>

              {/* 3. NAMA MEMBER / PENCOCOKAN FORMULIR (OPSIONAL) */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-300">
                  NAMA MEMBER (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={singleHintName}
                  onChange={(e) => setSingleHintName(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      accountValidatorCheck();
                    }
                  }}
                  placeholder="Contoh: BUDI SANTOSO"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none transition-colors uppercase font-mono text-xs placeholder:text-gray-600"
                />
                <div className="text-[10px] text-gray-500 truncate">
                  Dari tiket deposit member
                </div>
              </div>

              {/* 4. BUTTON VALIDASI & BERSIHKAN */}
              <div className="md:col-span-2 flex items-center gap-2 pt-5">
                <button
                  type="button"
                  id="accountValidatorButton"
                  onClick={() => accountValidatorCheck()}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Search className="w-4 h-4 text-black" />
                  )}
                  <span>VALIDASI</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearCache('INPUTS')}
                  className="p-2.5 rounded-lg bg-[#1A1A1A] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Bersihkan Input & Cache"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>

            </div>

            {/* HASIL VALIDASI (SESUAI DENGAN FORMAT & ID ELEMEN SKRIP USER) */}
            <div
              id="accountValidatorResult"
              className="mt-6"
              style={{ display: singleResult ? 'block' : 'none' }}
            >
              <div
                className="p-4 sm:p-5 rounded-xl border relative overflow-hidden transition-all"
                style={{
                  background: '#090d14',
                  borderColor: singleResult?.isValid ? '#1e2836' : '#7f1d1d'
                }}
              >
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center relative z-10">

                  {/* 1. STATUS */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      STATUS
                    </div>
                    <div
                      id="accountValidatorStatus"
                      className="font-bold text-sm flex items-center gap-1.5"
                    >
                      {singleResult ? (
                        singleResult.status === 'VALID_PREMIUM' ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            VALID (PREMIUM / AKTIF)
                          </span>
                        ) : singleResult.status === 'VALID_STANDARD' ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            VALID (AKTIF)
                          </span>
                        ) : singleResult.status === 'NON_PREMIUM' ? (
                          <span className="text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            NON-PREMIUM (BELUM KYC)
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1.5">
                            <AlertOctagon className="w-4 h-4 text-rose-400" />
                            REKENING TIDAK VALID
                          </span>
                        )
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>

                  {/* 2. PROVIDER */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      PROVIDER
                    </div>
                    <div
                      id="accountValidatorProviderResult"
                      className="font-bold text-white text-sm flex items-center gap-1.5"
                    >
                      {singleResult?.isEwallet ? (
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{singleResult?.bankName || '-'}</span>
                      {singleResult && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                          {singleResult.bankCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. NOMOR AKUN */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      NOMOR AKUN
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        id="accountValidatorNumberResult"
                        className="font-mono font-bold text-white text-base tracking-wider"
                      >
                        {singleResult?.cleanAccountNumber || singleResult?.accountNumber || '-'}
                      </div>
                      {singleResult && (
                        <button
                          type="button"
                          onClick={() => handleCopy(singleResult.cleanAccountNumber || singleResult.accountNumber, 'num')}
                          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Nomor"
                        >
                          {copiedField === 'num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. NAMA PEMILIK */}
                  <div className="space-y-1 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span>NAMA PEMILIK</span>
                      {singleResult?.accountName && /[X\*]{2,}/i.test(singleResult.accountName) ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-mono">
                          SENSOR GATEWAY (XXXX)
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-mono font-bold">
                          NAMA LENGKAP JELAS ✅
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div
                        id="accountValidatorName"
                        className="font-black text-amber-400 text-sm sm:text-base tracking-wide truncate font-mono"
                        title={singleResult?.accountName}
                      >
                        {singleResult?.accountName || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {singleResult?.accountName && singleResult.accountName !== '-' && (
                          <button
                            type="button"
                            onClick={() => handleCopy(singleResult.accountName, 'name')}
                            className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Salin Nama Pemilik"
                          >
                            {copiedField === 'name' ? (
                              <>
                                <Check className="w-3 h-3 text-black" />
                                <span className="text-[10px]">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-black" />
                                <span className="text-[10px]">Salin</span>
                              </>
                            )}
                          </button>
                        )}
                        {singleResult && (
                          <button
                            type="button"
                            onClick={() => setEditingAccountModal({
                              isOpen: true,
                              accountNumber: singleResult.cleanAccountNumber || singleResult.accountNumber,
                              bankId: singleResult.bankId,
                              currentName: singleResult.accountName,
                              newName: /[X\*]{2,}/i.test(singleResult.accountName) ? '' : singleResult.accountName
                            })}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            title="Lengkapi / Simpan Nama Lengkap Resmi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Notice & Quick Action if Name Has Sensor Masking */}
                {singleResult && /[X\*]{2,}/i.test(singleResult.accountName) && (
                  <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <span className="font-bold text-amber-300">Nama masih terpotong sensor ({singleResult.accountName}). </span>
                        Lengkapi nama lengkap sesuai tiket member agar tersimpan permanen tanpa sensor.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAccountModal({
                        isOpen: true,
                        accountNumber: singleResult.cleanAccountNumber || singleResult.accountNumber,
                        bankId: singleResult.bankId,
                        currentName: singleResult.accountName,
                        newName: ''
                      })}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs font-mono flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.3)] active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>LENGKAPI NAMA JELAS</span>
                    </button>
                  </div>
                )}

                {/* Sub-Card: Clean Operational Details for Staff */}
                {singleResult && (
                  <div className="mt-4 pt-3.5 border-t border-[#1e2836] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-gray-400">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-gray-500">KONEKSI SISTEM:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          JARINGAN PERBANKAN ONLINE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-mono">
                        Waktu Validasi: {singleResult.checkTimestamp}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        SIAP TRANSAKSI
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ERROR ALERT (SESUAI DENGAN ID SKRIP USER) */}
            <div
              id="accountValidatorError"
              className="alert alert-danger mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-sans flex items-start gap-3"
              style={{ display: errorMessage ? 'flex' : 'none' }}
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-300">Peringatan Validasi Rekening / Akun</div>
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            </div>

          </div>

          {/* Guide Card for CS / Kasir */}
          <div className="bg-[#0b0e14]/80 border border-[#1e2836] rounded-2xl p-4 sm:p-5 text-xs text-gray-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>SOP STANDAR VALIDASI KASIR &amp; CUSTOMER SERVICE HS GROUP</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed">
              <li>
                <strong className="text-white">Validasi Real-time:</strong> Pengecekan akun dan nomor rekening terhubung langsung secara real-time ke jalur perbankan resmi tanpa hambatan teknis.
              </li>
              <li>
                <strong className="text-white">Format Angka Rekening:</strong> Sistem otomatis menghitung jumlah digit yang diinput. Jika kurang atau lebih dari standar bank terkait (contoh BRI 15 digit, BCA 10 digit), tombol akan memicu alert peringatan.
              </li>
              <li>
                <strong className="text-white">Verifikasi Pemilik Sah:</strong> Nama pemilik rekening ditampilkan secara jelas dan dapat dikoreksi/disimpan langsung ke database bila dibutuhkan untuk pencocokan tiket formulir deposit/withdraw member.
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BATCH / BULK VALIDATOR DENGAN PROSES ITERASI LIVE   */}
      {/* "Implement a bulk validation feature in the ValidatorRekening */}
      {/* component where staff can paste a list of multiple account  */}
      {/* numbers (with their respective banks), and the tool will     */}
      {/* iterate through them to perform individual checks."          */}
      {/* ========================================================= */}
      {activeTab === 'BATCH' && (
        <div className="space-y-5">
          
          {/* Main Batch Input & Control Box */}
          <div className="bg-[#0b0e14] border border-[#1e2836] rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1e2836]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  BULK VALIDATOR REKENING &amp; E-WALLET (ITERATIF)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Tempel banyak nomor rekening beserta banknya. Sistem akan memproses dan melakukan pengecekan satu demi satu secara real-time ke gateway core banking resmi.
                </p>
              </div>

              {/* Progress Summary Pill */}
              {batchItems.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121824] border border-[#1e2836] text-xs font-mono">
                  <span className="text-gray-400">STATUS:</span>
                  {isBatchRunning ? (
                    isBatchPaused ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Pause className="w-3.5 h-3.5" /> DIJEDA ({batchStats.checked}/{batchStats.total})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> PROSES ({batchStats.checked}/{batchStats.total})
                      </span>
                    )
                  ) : batchStats.checked === batchStats.total && batchStats.total > 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SELESAI ({batchStats.total} Akun)
                    </span>
                  ) : (
                    <span className="text-gray-300">
                      SIAP ({batchItems.length} Baris)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Input Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Optional Default Provider Dropdown */}
              <div className="md:col-span-4 space-y-1">
                <label className="block text-xs font-bold text-gray-300">
                  PROVIDER DEFAULT (JIKA TIDAK TERTULIS DI BARIS)
                </label>
                <select
                  value={batchDefaultProvider}
                  onChange={(e) => setBatchDefaultProvider(e.target.value)}
                  disabled={isBatchRunning}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="AUTO">-- Otomatis Deteksi dari Teks / Awalan --</option>
                  <optgroup label="BANK">
                    <option value="014">BCA</option>
                    <option value="002">BRI</option>
                    <option value="009">BNI</option>
                    <option value="008">Mandiri</option>
                    <option value="535">SeaBank</option>
                    <option value="542">Bank Jago</option>
                    <option value="451">BSI</option>
                  </optgroup>
                  <optgroup label="E-WALLET">
                    <option value="gopay">GoPay</option>
                    <option value="dana">DANA</option>
                    <option value="ovo">OVO</option>
                    <option value="shopeepay">ShopeePay</option>
                    <option value="linkaja">LinkAja</option>
                  </optgroup>
                </select>
              </div>

              {/* Delay between checks */}
              <div className="md:col-span-3 space-y-1">
                <label className="block text-xs font-bold text-gray-300">
                  KECEPATAN ITERASI (JEDA PER AKUN)
                </label>
                <select
                  value={batchDelayMs}
                  onChange={(e) => setBatchDelayMs(Number(e.target.value))}
                  disabled={isBatchRunning}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value={100}>⚡ Sangat Cepat (100 ms)</option>
                  <option value={200}>🚀 Cepat / Normal (200 ms)</option>
                  <option value={400}>🛡️ Santai / Aman Gateway (400 ms)</option>
                  <option value={750}>⏳ Sangat Detail (750 ms)</option>
                </select>
              </div>

              {/* Clear cache button */}
              <div className="md:col-span-5 flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => handleClearCache('INPUTS')}
                  disabled={isBatchRunning}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm active:scale-95"
                  title="Bersihkan Data Input & Cache Seketika"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>CLEAR CACHE</span>
                </button>
              </div>

            </div>

            {/* Paste Box with Floating Countdown Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <label className="font-bold flex items-center gap-1.5">
                  <span>TEMPEL DAFTAR NOMOR REKENING (SATU PER BARIS):</span>
                  {justCleared && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold animate-pulse flex items-center gap-1">
                      <Check className="w-3 h-3" /> CACHE BERSIH
                    </span>
                  )}
                </label>
                <span className="text-gray-400 font-mono text-[11px]">
                  Format fleksibel: "bank no_rek", "no_rek bank", "bank,nama,no_rek", dsb.
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={batchRawInput}
                  onChange={(e) => setBatchRawInput(e.target.value)}
                  disabled={isBatchRunning}
                  rows={6}
                  placeholder={`Tempel daftar nomor rekening di sini (satu per baris)...
Format:
GOPAY 085212404809 BUDI SANTOSO
BCA 8735663956
BRI 360601022278531
085787819464 GOPAY
SEABANK 901722512432
BANKJAGO,YOKI RAHAYU,100983460905
MANDIRI 1660004707154`}
                  className="w-full p-3 rounded-xl bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none font-mono text-xs leading-relaxed disabled:opacity-60"
                />

                {/* Floating Countdown Badge (Mirrors Bonus Mahjong) */}
                {batchRawInput.trim() && autoClearEnabled && countdown > 0 && !isBatchRunning && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/80 border border-yellow-400/50 backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                    <span className="text-[11px] font-mono font-bold text-yellow-300">
                      Auto Hapus: {countdown}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Buttons & Progress Bar */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isBatchRunning ? (
                    <button
                      type="button"
                      onClick={() => startBulkValidation()}
                      disabled={!batchRawInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 text-black fill-current" />
                      <span>MULAI VALIDASI MASSAL (ITERASI)</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={togglePauseBatch}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                          isBatchPaused 
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                            : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                      >
                        {isBatchPaused ? (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>LANJUTKAN</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>JEDA (PAUSE)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={stopBatch}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>HENTIKAN</span>
                      </button>
                    </>
                  )}

                  {/* Revalidate failed button */}
                  {batchStats.failed > 0 && !isBatchRunning && (
                    <button
                      type="button"
                      onClick={revalidateFailedBatchItems}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ulangi {batchStats.failed} Item Gagal</span>
                    </button>
                  )}
                </div>

                {/* Bulk Export & Copy Tools */}
                {batchItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={copyAllValidBatchNames}
                      disabled={batchStats.valid === 0}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      title="Salin semua nama yang berhasil divalidasi tanpa sensor"
                    >
                      {copiedField === 'batch-copy-names' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin Semua Nama Valid ({batchStats.valid})</span>
                    </button>

                    <button
                      type="button"
                      onClick={copyFormattedRecap}
                      className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Salin format rekapan untuk chat CS"
                    >
                      {copiedField === 'batch-copy-recap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin Rekap CS</span>
                    </button>

                    <button
                      type="button"
                      onClick={exportBatchToCSV}
                      className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Iteration Progress Bar */}
              {batchItems.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-gray-300">
                      {isBatchRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>
                            Memeriksa item <strong>{currentBatchIndex + 1}</strong> dari <strong>{batchStats.total}</strong>: 
                            <span className="text-amber-400 font-bold ml-1">
                              {batchItems[currentBatchIndex]?.bankName} {batchItems[currentBatchIndex]?.accountNumber}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span>Kemajuan Validasi: {batchStats.checked} dari {batchStats.total} selesai</span>
                      )}
                    </div>
                    <span className="font-bold text-white">{batchStats.percent}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#121824] overflow-hidden border border-[#1e2836]">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
                      style={{ width: `${batchStats.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Counters Cards */}
            {batchItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-[#090d14] border border-[#1e2836]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">TOTAL AKUN</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">{batchStats.total}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#090d14] border border-[#1e2836]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">SUDAH DICEK</div>
                  <div className="text-lg font-black text-blue-400 font-mono mt-0.5">{batchStats.checked}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#090d14] border border-emerald-500/30 bg-emerald-950/20">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">VALID SIAP TRANSFER</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{batchStats.valid}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#090d14] border border-amber-500/30 bg-amber-950/20">
                  <div className="text-[10px] font-bold text-amber-400 uppercase">NON-PREMIUM (BASIC)</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">{batchStats.nonPremium}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#090d14] border border-rose-500/30 bg-rose-950/20 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase">FORMAT SALAH / GAGAL</div>
                  <div className="text-lg font-black text-rose-400 font-mono mt-0.5">{batchStats.failed}</div>
                </div>
              </div>
            )}

          </div>

          {/* Interactive Batch Results Table */}
          {batchItems.length > 0 && (
            <div className="bg-[#0b0e14] border border-[#1e2836] rounded-2xl p-4 sm:p-6 space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#090d14] border border-[#1e2836] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setBatchFilterStatus('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      batchFilterStatus === 'ALL'
                        ? 'bg-white/10 text-white font-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Semua ({batchItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchFilterStatus('VALID')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      batchFilterStatus === 'VALID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black'
                        : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    Valid Saja ({batchStats.valid})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchFilterStatus('NON_PREMIUM')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      batchFilterStatus === 'NON_PREMIUM'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black'
                        : 'text-gray-400 hover:text-amber-400'
                    }`}
                  >
                    Non-Premium ({batchStats.nonPremium})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchFilterStatus('FAILED')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      batchFilterStatus === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-black'
                        : 'text-gray-400 hover:text-rose-400'
                    }`}
                  >
                    Gagal ({batchStats.failed})
                  </button>
                </div>

                {/* Search in Batch */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={batchSearchTerm}
                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                    placeholder="Cari nama / nomor / bank..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090d14] text-white border border-[#1e2836] focus:border-amber-400 focus:outline-none text-xs"
                  />
                  {batchSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setBatchSearchTerm('')}
                      className="absolute right-2.5 top-2 text-gray-500 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-[#1e2836]">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#121824] text-gray-300 font-bold border-b border-[#1e2836]">
                    <tr>
                      <th className="p-3 w-12 text-center">NO</th>
                      <th className="p-3 w-32">STATUS</th>
                      <th className="p-3 w-32">PROVIDER</th>
                      <th className="p-3">NOMOR REKENING / AKUN</th>
                      <th className="p-3">NAMA PEMILIK JELAS (RESMI)</th>
                      <th className="p-3">STATUS VERIFIKASI</th>
                      <th className="p-3 text-right w-24">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2836] bg-[#090d14]">
                    {filteredBatchItems.map((item, idx) => {
                      const isCurrentChecking = isBatchRunning && currentBatchIndex === idx;

                      return (
                        <tr 
                          key={item.id} 
                          className={`transition-colors ${
                            isCurrentChecking 
                              ? 'bg-amber-500/10 border-l-4 border-l-amber-400' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          {/* 1. NO */}
                          <td className="p-3 text-center font-mono text-gray-400 font-bold">
                            {idx + 1}
                          </td>

                          {/* 2. STATUS */}
                          <td className="p-3 font-bold">
                            {item.status === 'CHECKING' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 w-fit animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                MEMERIKSA...
                              </span>
                            ) : item.status === 'PENDING' ? (
                              <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" />
                                MENUNGGU
                              </span>
                            ) : item.status === 'FAILED_FORMAT' ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black flex items-center gap-1 w-fit" title={item.errorText}>
                                FORMAT SALAH ❌
                              </span>
                            ) : item.result?.status === 'VALID_PREMIUM' || item.result?.status === 'VALID_STANDARD' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                VALID ✅
                              </span>
                            ) : item.result?.status === 'NON_PREMIUM' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 w-fit" title="Akun belum verifikasi KTP (Basic)">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                NON-PREMIUM ⚠️
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black flex items-center gap-1 w-fit">
                                GAGAL / SALAH ❌
                              </span>
                            )}
                          </td>

                          {/* 3. PROVIDER */}
                          <td className="p-3 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              {getProviderByAnyCode(item.bankId).isEwallet ? (
                                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              )}
                              <span className="truncate">{item.bankName}</span>
                            </div>
                          </td>

                          {/* 4. NOMOR REKENING */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-gray-200 tracking-wider">
                                {item.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.accountNumber, `num-${item.id}`)}
                                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white cursor-pointer"
                                title="Salin Nomor"
                              >
                                {copiedField === `num-${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* 5. NAMA PEMILIK JELAS */}
                          <td className="p-3 font-bold">
                            {item.status === 'DONE' && item.result ? (
                              <div className="flex items-center justify-between gap-2 max-w-sm">
                                <span className={`font-mono text-sm tracking-wide ${
                                  item.result.isValid 
                                    ? 'text-yellow-400 font-black' 
                                    : 'text-gray-400 line-through'
                                }`}>
                                  {item.result.accountName}
                                </span>
                                {item.result.accountName && item.result.accountName !== '-' && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item.result!.accountName, `name-${item.id}`)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white cursor-pointer"
                                      title="Salin Nama Pemilik"
                                    >
                                      {copiedField === `name-${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingAccountModal({
                                        isOpen: true,
                                        accountNumber: item.accountNumber,
                                        bankId: item.bankId,
                                        currentName: item.result!.accountName,
                                        newName: /[X\*]{2,}/i.test(item.result!.accountName) ? '' : item.result!.accountName
                                      })}
                                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white cursor-pointer"
                                      title="Isi / Simpan Nama Lengkap Resmi"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : item.status === 'CHECKING' ? (
                              <span className="text-amber-400/80 font-mono text-xs italic">
                                Mengambil data dari core banking...
                              </span>
                            ) : item.status === 'FAILED_FORMAT' ? (
                              <span className="text-rose-400 text-xs">
                                {item.errorText}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono text-xs">
                                {item.hintName ? `Hint: ${item.hintName}` : '-'}
                              </span>
                            )}
                          </td>

                          {/* 6. STATUS VERIFIKASI */}
                          <td className="p-3 font-mono text-[11px] truncate max-w-xs">
                            {item.result ? (
                              item.result.isValid ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  TERVERIFIKASI RESMI
                                </span>
                              ) : (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                                  TIDAK DITEMUKAN
                                </span>
                              )
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>

                          {/* 7. AKSI */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Re-check individual row */}
                              <button
                                type="button"
                                onClick={() => recheckSingleBatchItem(item.id)}
                                disabled={isBatchRunning || item.status === 'FAILED_FORMAT'}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
                                title="Cek Ulang Baris Ini"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-gray-500 flex items-center justify-between">
                <span>Menampilkan {filteredBatchItems.length} dari {batchItems.length} akun</span>
                <span>Seluruh pengecekan diproses secara real-time via Core Banking Resmi</span>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: RIWAYAT PENGECEKAN                                */}
      {/* ========================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[#0b0e14] border border-[#1e2836] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                RIWAYAT PENGECEKAN STAF
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Catatan seluruh validasi rekening yang telah dilakukan pada sesi ini.
              </p>
            </div>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => handleClearCache('HISTORY')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Bersihkan Seluruh Riwayat Cache"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR CACHE RIWAYAT</span>
              </button>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <div>Belum ada riwayat pengecekan rekening pada sesi ini.</div>
              <div className="text-gray-600">
                Lakukan validasi pada tab <strong>Validator Utama</strong> atau <strong>Batch Massal</strong>.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#1e2836]">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#121824] text-gray-300 font-bold border-b border-[#1e2836]">
                  <tr>
                    <th className="p-3">WAKTU</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">PROVIDER</th>
                    <th className="p-3">NOMOR REKENING</th>
                    <th className="p-3">NAMA PEMILIK</th>
                    <th className="p-3">STATUS VERIFIKASI</th>
                    <th className="p-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2836] bg-[#090d14]">
                  {historyList.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {rec.checkTimestamp}
                      </td>
                      <td className="p-3 font-bold">
                        {rec.status === 'VALID_PREMIUM' || rec.status === 'VALID_STANDARD' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black">
                            VALID ✅
                          </span>
                        ) : rec.status === 'NON_PREMIUM' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black">
                            NON-PREMIUM ⚠️
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black">
                            FORMAT SALAH ❌
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-white">{rec.bankName}</td>
                      <td className="p-3 font-mono font-bold text-gray-200">
                        {rec.cleanAccountNumber || rec.accountNumber}
                      </td>
                      <td className="p-3 font-bold text-yellow-400 font-mono tracking-wide">
                        {rec.accountName}
                      </td>
                      <td className="p-3 font-mono text-[11px] truncate max-w-xs">
                        {rec.isValid ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            TERVERIFIKASI RESMI
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                            TIDAK VALID
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(rec.accountName, `hist-${rec.id}`)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
                          title="Copy Nama"
                        >
                          {copiedField === `hist-${rec.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Simpan / Koreksi Nama Lengkap Resmi */}
      {editingAccountModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-[#1e2836] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingAccountModal({ isOpen: false, accountNumber: '', bankId: '', currentName: '', newName: '' })}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Simpan Nama Lengkap Resmi</h3>
                <p className="text-xs text-gray-400">Daftarkan nama valid ke database verifikasi lokal & server</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-black/40 border border-[#1e2836] text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Provider:</span>
                  <span className="font-bold text-white">{editingAccountModal.bankId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Nomor Rekening:</span>
                  <span className="font-mono font-bold text-yellow-400">{editingAccountModal.accountNumber}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#1e2836]">
                  <span className="text-gray-500 block mb-0.5">Inquiry Gateway:</span>
                  <span className="font-mono text-gray-300 font-bold">{editingAccountModal.currentName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Resmi (Tanpa Sensor)
                </label>
                <input
                  type="text"
                  value={editingAccountModal.newName}
                  onChange={(e) => setEditingAccountModal(prev => ({ ...prev, newName: e.target.value.toUpperCase() }))}
                  placeholder="Contoh: BUDI SANTOSO"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#1e2836] focus:border-amber-400 focus:outline-none text-white font-mono font-bold uppercase tracking-wider text-sm placeholder:text-gray-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editingAccountModal.newName.trim()) {
                      handleSaveCustomName(editingAccountModal.accountNumber, editingAccountModal.bankId, editingAccountModal.newName);
                    }
                  }}
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Nama ini akan langsung menggantikan masking dan otomatis muncul setiap kali nomor ini dicek.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccountModal({ isOpen: false, accountNumber: '', bankId: '', currentName: '', newName: '' })}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCustomName(editingAccountModal.accountNumber, editingAccountModal.bankId, editingAccountModal.newName)}
                  disabled={!editingAccountModal.newName.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan ke Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
