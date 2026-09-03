import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Printer, 
  Sparkles, 
  Info, 
  Sliders, 
  Eye,
  Gamepad2,
  Table,
  Layers
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { IdnSlotRoundEditor } from './IdnSlotRoundEditor';

export interface SlotTxRow {
  id: string;
  no: number | string;
  periode: string;
  tanggal: string;
  keterangan: string;
  status: 'Deposit' | 'Withdraw' | string;
  debet: string;
  kredit: string;
  saldo: string;
  via: 'Website' | 'Mobile' | string;
  bgType: 'gray' | 'peach';
}

export const TransaksiSlotEditor: React.FC = () => {
  // Generator Config
  const [cfgRows, setCfgRows] = useState<number>(10);
  const [cfgDepMin, setCfgDepMin] = useState<number>(100000);
  const [cfgDepMax, setCfgDepMax] = useState<number>(500000);
  const [cfgWdMin, setCfgWdMin] = useState<number>(10000000);
  const [cfgWdMax, setCfgWdMax] = useState<number>(100000000);
  const [cfgGapMin, setCfgGapMin] = useState<number>(5);
  const [cfgGapMax, setCfgGapMax] = useState<number>(60);

  // Table Data
  const [playerName, setPlayerName] = useState<string>('aurell223');
  const [lastBalance, setLastBalance] = useState<string>('9,901,581');
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [activeFormat, setActiveFormat] = useState<'ALL' | 'MUTASI' | 'IDN_ROUND'>('ALL');

  // Initial Sample Data (Mirrors the exact reference HTML)
  const [rows, setRows] = useState<SlotTxRow[]>([
    {
      id: '1',
      no: 1,
      periode: '',
      tanggal: '2026-08-08 07:22:45',
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '9,900,984',
      saldo: '9,901,581',
      via: 'Website',
      bgType: 'gray'
    },
    {
      id: '2',
      no: 2,
      periode: '',
      tanggal: '2026-08-07 17:31:09',
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '9,000,208',
      saldo: '9,012,397',
      via: 'Website',
      bgType: 'peach'
    },
    {
      id: '3',
      no: 3,
      periode: '',
      tanggal: '2026-08-07 17:17:46',
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '6,000,620',
      saldo: '6,025,189',
      via: 'Website',
      bgType: 'gray'
    },
    {
      id: '4',
      no: 4,
      periode: '',
      tanggal: '2026-08-07 16:44:07',
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '9,000,297',
      saldo: '9,000,569',
      via: 'Website',
      bgType: 'peach'
    },
    {
      id: '5',
      no: 5,
      periode: '',
      tanggal: '2026-08-06 20:05:01',
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '4,500,452',
      saldo: '4,509,432',
      via: 'Website',
      bgType: 'gray'
    },
    {
      id: '6',
      no: 6,
      periode: '',
      tanggal: '2026-08-06 13:29:55',
      keterangan: 'Tarik Dana',
      status: 'Withdraw',
      debet: '230,000',
      kredit: '0',
      saldo: '8,980',
      via: 'Mobile',
      bgType: 'peach'
    }
  ]);

  // Helpers
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const roundTo = (val: number, step: number) => Math.round(val / step) * step;
  const formatMoney = (val: number) => Math.max(0, Math.round(val)).toLocaleString('en-US');
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Generate Automatic Logic matching script exactly
  const handleGenerate = () => {
    setIsGenerating(true);

    let numRows = clamp(cfgRows, 1, 50);
    let dMin = clamp(cfgDepMin, 0, 1000000000);
    let dMax = clamp(cfgDepMax, 0, 1000000000);
    let wMin = clamp(cfgWdMin, 0, 1000000000);
    let wMax = clamp(cfgWdMax, 0, 1000000000);
    let gMin = clamp(cfgGapMin, 1, 1440);
    let gMax = clamp(cfgGapMax, 1, 1440);

    if (dMin > dMax) [dMin, dMax] = [dMax, dMin];
    if (wMin > wMax) [wMin, wMax] = [wMax, wMin];
    if (gMin > gMax) [gMin, gMax] = [gMax, gMin];

    setCfgRows(numRows);
    setCfgDepMin(dMin);
    setCfgDepMax(dMax);
    setCfgWdMin(wMin);
    setCfgWdMax(wMax);
    setCfgGapMin(gMin);
    setCfgGapMax(gMax);

    // Saldo awal hanya sebagai acuan sebelum transaksi terbaru
    const startMin = Math.max(50000, Math.min(dMin, 150000));
    const startMax = Math.max(startMin + 1000, Math.min(Math.max(dMax * 2, 500000), 1500000));
    let balance = randInt(Math.round(startMin), Math.round(startMax));
    if (balance % 1000 === 0) balance += randInt(1, 999);

    let current = new Date();
    const newItems: SlotTxRow[] = [];

    // Tepat 1 transaksi Withdraw pada setiap hasil generator
    const withdrawRowIndex = randInt(1, numRows);

    let pgaRow: number | null = null;
    let regularDepositRow: number | null = null;
    if (numRows >= 3) {
      const candidates: number[] = [];
      for (let n = 1; n <= numRows; n++) {
        if (n !== withdrawRowIndex) candidates.push(n);
      }
      pgaRow = candidates.splice(randInt(0, candidates.length - 1), 1)[0];
      regularDepositRow = candidates.splice(randInt(0, candidates.length - 1), 1)[0];
    } else if (numRows === 2) {
      pgaRow = withdrawRowIndex === 1 ? 2 : 1;
    }

    let finalTopBalance = 0;

    for (let i = 1; i <= numRows; i++) {
      const isWithdraw = i === withdrawRowIndex;
      let debit = 0;
      let credit = 0;
      let description = 'Deposit PGA';
      let status = 'Deposit';
      let via = Math.random() < 0.7 ? 'Website' : 'Mobile';

      if (isWithdraw) {
        let amount = roundTo(randInt(Math.round(wMin), Math.round(wMax)), 1000);
        amount = Math.max(Math.round(wMin), Math.min(amount, Math.round(wMax)));

        let reserve = randInt(50000, 750000);
        if (reserve % 1000 === 0) reserve += randInt(1, 999);
        if (balance < amount + reserve) {
          balance = amount + reserve;
        }

        debit = amount;
        balance = balance - debit;
        if (balance % 1000 === 0) balance += randInt(1, 999);
        description = 'Tarik Dana';
        status = 'Withdraw';
      } else {
        let usePga: boolean;
        if (i === pgaRow) usePga = true;
        else if (i === regularDepositRow) usePga = false;
        else usePga = Math.random() < 0.60;

        if (usePga) {
          let amount = randInt(Math.round(dMin), Math.round(dMax));
          if (amount % 1000 === 0) {
            if (amount < dMax) amount += randInt(1, Math.min(999, dMax - amount));
            else amount -= randInt(1, Math.min(999, Math.max(1, amount - dMin)));
          }
          if (amount % 1000 === 0) amount = Math.max(Math.round(dMin), amount - 1);
          description = 'Deposit PGA';
          credit = amount;
        } else {
          const minK = Math.ceil(dMin / 1000);
          const maxK = Math.floor(dMax / 1000);
          let amount: number;
          if (minK <= maxK) amount = randInt(minK, maxK) * 1000;
          else amount = Math.round(dMin);
          description = 'Deposit';
          credit = amount;
        }

        let residual = randInt(100, 5000);
        if (residual % 1000 === 0) residual += randInt(1, 99);
        balance = credit + residual;
      }

      if (i === 1) {
        finalTopBalance = balance;
      }

      newItems.push({
        id: 'tx-' + Date.now() + '-' + i,
        no: i,
        periode: '',
        tanggal: formatDate(new Date(current)),
        keterangan: description,
        status,
        debet: formatMoney(debit),
        kredit: formatMoney(credit),
        saldo: formatMoney(balance),
        via,
        bgType: (i - 1) % 2 === 0 ? 'gray' : 'peach'
      });

      current = new Date(current.getTime() - randInt(gMin, gMax) * 60000);
    }

    setRows(newItems);
    setLastBalance(formatMoney(finalTopBalance));
    setSelectedRowId(null);

    setTimeout(() => {
      setIsGenerating(false);
    }, 300);
  };

  // Row selection
  const handleRowClick = (id: string) => {
    setSelectedRowId(prev => (prev === id ? null : id));
  };

  // Add Row
  const handleAddRow = () => {
    const newNo = rows.length + 1;
    const newRow: SlotTxRow = {
      id: 'tx-' + Date.now(),
      no: newNo,
      periode: '',
      tanggal: formatDate(new Date()),
      keterangan: 'Deposit PGA',
      status: 'Deposit',
      debet: '0',
      kredit: '500,000',
      saldo: '501,230',
      via: 'Website',
      bgType: (rows.length % 2 === 0) ? 'gray' : 'peach'
    };
    setRows([...rows, newRow]);
  };

  // Delete Selected Row
  const handleDeleteSelectedRow = () => {
    if (!selectedRowId) return;
    const updated = rows.filter(r => r.id !== selectedRowId).map((r, idx) => ({
      ...r,
      no: idx + 1,
      bgType: idx % 2 === 0 ? 'gray' as const : 'peach' as const
    }));
    setRows(updated);
    setSelectedRowId(null);
  };

  // Handle cell edit
  const handleCellChange = (id: string, field: keyof SlotTxRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Download High Quality PNG
  const handleDownloadPng = async () => {
    if (!tableContainerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableContainerRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `transaksi_slot_${playerName}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Tabular / Plain Text
  const handleCopyTable = () => {
    let text = `Transaksi Pemain : ${playerName}\n\n`;
    text += `No\tPeriode\tTanggal\tKeterangan\tStatus\tDebet\tKredit\tSaldo\tVia\n`;
    text += `\t\t\t\t\tLast Balance\t\t${lastBalance}\t\n`;
    rows.forEach(r => {
      text += `${r.no}\t${r.periode}\t${r.tanggal}\t${r.keterangan}\t${r.status}\t${r.debet}\t${r.kredit}\t${r.saldo}\t${r.via}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Keyboard shortcut (Escape to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRowId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ========================================================= */}
      {/* DUAL-FORMAT SELECTOR BANNER DI ATAS MENU TRANSAKSI SLOT   */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#090e1a] via-[#0d172a] to-[#090e1a] border border-cyan-500/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-500/40 tracking-wider">
              DUAL SLOT TRANSACTION SUITE
            </span>
            <span className="text-xs text-yellow-400 font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              2 TRANSAKSI SLOT DALAM 1 MENU
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-mono uppercase tracking-wide mt-1">
            Edit Transaksi Slot Game
          </h1>
          <p className="text-xs text-gray-300 font-mono">
            Menu gabungan untuk mengedit <b>Format 1 (Mutasi Saldo Pemain / Deposit PGA)</b> dan <b>Format 2 (Detail Ronde Slot IDN / Debit &amp; Credit)</b>.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#050811] border border-white/10 font-mono text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setActiveFormat('ALL')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'ALL'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tampilkan Keduanya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('MUTASI')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'MUTASI'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>1. Mutasi Saldo Pemain</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('IDN_ROUND')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'IDN_ROUND'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>2. Detail Ronde IDN (Debit &amp; Credit)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAT 1: MUTASI TRANSAKSI PEMAIN (PGA / TARIK DANA)                      */}
      {/* ========================================================================= */}
      {(activeFormat === 'ALL' || activeFormat === 'MUTASI') && (
        <div className="space-y-4">
          {activeFormat === 'ALL' && (
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px bg-amber-500/30 flex-1" />
              <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-full bg-[#0a101d] border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" />
                Format 1: Mutasi Saldo Pemain (Deposit PGA &amp; Tarik Dana)
              </span>
              <div className="h-px bg-amber-500/30 flex-1" />
            </div>
          )}

          {/* 1. EASY PANEL GENERATOR CONTROLS (MIRRORS HTML SCRIPT) */}
          <div 
            style={{
              background: '#f7fbff',
              border: '1px solid #cfd8e3',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            className="text-gray-900 font-sans"
          >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cfd8e3] pb-2.5 mb-3">
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#163b63' }} className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Generator Transaksi Simulasi</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#60758a' }}>
              • Withdraw 1x • Deposit PGA unik • Deposit bulat
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWatermark(!showWatermark)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                showWatermark ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {showWatermark ? 'Watermark: ON' : 'Watermark: OFF'}
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 items-end text-xs">
          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Jumlah baris</span>
            <input 
              type="number" 
              min={1} 
              max={50} 
              value={cfgRows}
              onChange={e => setCfgRows(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Deposit min</span>
            <input 
              type="number" 
              min={0} 
              step={1000} 
              value={cfgDepMin}
              onChange={e => setCfgDepMin(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Deposit max</span>
            <input 
              type="number" 
              min={0} 
              step={1000} 
              value={cfgDepMax}
              onChange={e => setCfgDepMax(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Withdraw min</span>
            <input 
              type="number" 
              min={0} 
              step={100000} 
              value={cfgWdMin}
              onChange={e => setCfgWdMin(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Withdraw max</span>
            <input 
              type="number" 
              min={0} 
              step={100000} 
              value={cfgWdMax}
              onChange={e => setCfgWdMax(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Jeda min (m)</span>
            <input 
              type="number" 
              min={1} 
              max={1440} 
              value={cfgGapMin}
              onChange={e => setCfgGapMin(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Jeda max (m)</span>
            <input 
              type="number" 
              min={1} 
              max={1440} 
              value={cfgGapMax}
              onChange={e => setCfgGapMax(Number(e.target.value))}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px'
              }}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#cfd8e3]">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                height: '32px',
                border: '0',
                borderRadius: '6px',
                background: '#1f6feb',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isGenerating ? '0 0 16px rgba(31,111,235,0.9)' : 'none'
              }}
              className="hover:brightness-95 transition-all text-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isGenerating ? 'MEN-GENERATE...' : '⚡ BUAT OTOMATIS'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-8 px-3 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tambah Baris</span>
            </button>

            {selectedRowId && (
              <button
                type="button"
                onClick={handleDeleteSelectedRow}
                className="h-8 px-3 rounded-md bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Baris Terpilih</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTable}
              className="h-8 px-3 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
              <span>{copiedStatus ? 'Tersalin!' : 'Salin Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE PAGE & TABLE VIEW (EXACT MATCH TO ATTACHED SCRIPT)                 */}
      {/* ========================================================================= */}
      <div className="p-3 bg-gray-800 rounded-xl overflow-x-auto shadow-inner">
        <div 
          ref={tableContainerRef}
          style={{
            position: 'relative',
            minWidth: '950px',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '4px 0 14px',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontFamily: 'Arial, Helvetica, sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* Watermark */}
          {showWatermark && (
            <div 
              style={{
                position: 'absolute',
                left: '50%',
                top: '53%',
                transform: 'translate(-50%, -50%) rotate(-18deg)',
                zIndex: 99,
                pointerEvents: 'none',
                userSelect: 'none',
                font: '900 42px/1 Arial, sans-serif',
                letterSpacing: '4px',
                color: 'rgba(210, 0, 0, 0.15)',
                border: '7px solid rgba(210, 0, 0, 0.10)',
                padding: '15px 26px',
                borderRadius: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              SIMULASI / DEMO
            </div>
          )}

          {/* Title Header: Transaksi Pemain : aurell223 */}
          <div 
            style={{
              minHeight: '22px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2px',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '12px',
              fontWeight: 'bold',
              lineHeight: '14px',
              color: '#0000cc',
              marginBottom: '4px'
            }}
          >
            {/* Printer Icon */}
            <span 
              style={{
                width: '14px',
                height: '14px',
                marginRight: '2px',
                flex: '0 0 14px',
                backgroundImage: 'url("https://agwl2.admitoto.com/images/log.png")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                display: 'inline-block'
              }}
            />
            <span>Transaksi Pemain :&nbsp;</span>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#0000cc',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                minWidth: '90px',
                width: `${Math.max(playerName.length * 7.5, 70)}px`,
                padding: '0 2px'
              }}
            />
            {/* Dot */}
            <span 
              style={{
                width: '6px',
                height: '6px',
                marginLeft: '2px',
                borderRadius: '50%',
                background: '#5b8bd9',
                boxShadow: '0 0 0 1px #c7d7f2 inset',
                display: 'inline-block'
              }}
            />
          </div>

          {/* Main Table */}
          <table
            style={{
              width: 'calc(100% - 16px)',
              margin: '0 8px',
              borderCollapse: 'separate',
              borderSpacing: '0 1px',
              tableLayout: 'fixed',
              fontSize: '10.5px',
              lineHeight: '12px',
              color: '#000000'
            }}
          >
            <colgroup>
              <col style={{ width: '3.38%' }} />
              <col style={{ width: '8.45%' }} />
              <col style={{ width: '21.59%' }} />
              <col style={{ width: '17.78%' }} />
              <col style={{ width: '9.50%' }} />
              <col style={{ width: '8.40%' }} />
              <col style={{ width: '11.50%' }} />
              <col style={{ width: '11.50%' }} />
              <col style={{ width: '7.90%' }} />
            </colgroup>

            {/* THEAD */}
            <thead>
              <tr>
                {['No', 'Periode', 'Tanggal', 'Keterangan', 'Status', 'Debet', 'Kredit', 'Saldo', 'Via'].map((col, idx, arr) => (
                  <th
                    key={col}
                    style={{
                      height: '17px',
                      padding: '1px 4px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      borderRight: idx === arr.length - 1 ? '0' : '1px solid #ffffff',
                      background: '#f5e363',
                      fontWeight: 'bold',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* TBODY */}
            <tbody>
              {/* Row 1: Last Balance */}
              <tr 
                style={{
                  backgroundColor: '#ffdbb7',
                  outline: selectedRowId === 'last-balance' ? '1px solid #3478f6' : 'none'
                }}
                onClick={() => handleRowClick('last-balance')}
              >
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: '#ffdbb7' }}></td>
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: '#ffdbb7' }}></td>
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: '#ffdbb7' }}></td>
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: '#ffdbb7' }}></td>
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: '#ffdbb7' }}></td>
                <td 
                  colSpan={2}
                  style={{
                    height: '17px',
                    padding: '1px 4px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 700,
                    borderRight: '1px solid #fff',
                    background: '#ffdbb7',
                    fontFamily: 'Arial, Helvetica, sans-serif'
                  }}
                >
                  Last Balance
                </td>
                <td 
                  style={{
                    height: '17px',
                    padding: '1px 4px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: '#0000FF',
                    fontWeight: 700,
                    borderRight: '1px solid #fff',
                    background: '#ffdbb7',
                    fontFamily: 'Arial, Helvetica, sans-serif'
                  }}
                >
                  <input
                    type="text"
                    value={lastBalance}
                    onChange={e => setLastBalance(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      textAlign: 'center',
                      width: '100%',
                      color: '#0000FF',
                      fontWeight: 700,
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      fontSize: '10.5px'
                    }}
                  />
                </td>
                <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '0', background: '#ffdbb7' }}></td>
              </tr>

              {/* Dynamic Transaction Rows */}
              {rows.map((row) => {
                const isSelected = selectedRowId === row.id;
                const bgColor = row.bgType === 'gray' ? '#efefef' : '#ffdbb7';

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    style={{
                      backgroundColor: bgColor,
                      boxShadow: isSelected ? 'inset 0 0 0 1px #3478f6' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {/* No */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.no}
                        onChange={e => handleCellChange(row.id, 'no', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Periode */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.periode}
                        onChange={e => handleCellChange(row.id, 'periode', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Tanggal */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.tanggal}
                        onChange={e => handleCellChange(row.id, 'tanggal', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Keterangan */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.keterangan}
                        onChange={e => handleCellChange(row.id, 'keterangan', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Status (Red text) */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.status}
                        onChange={e => handleCellChange(row.id, 'status', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', color: '#FF0000', fontWeight: 400, fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Debet */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.debet}
                        onChange={e => handleCellChange(row.id, 'debet', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Kredit (Blue text) */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.kredit}
                        onChange={e => handleCellChange(row.id, 'kredit', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', color: '#0000FF', fontWeight: 400, fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Saldo (Blue text) */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #fff', background: bgColor }}>
                      <input
                        type="text"
                        value={row.saldo}
                        onChange={e => handleCellChange(row.id, 'saldo', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', color: '#0000FF', fontWeight: 400, fontSize: '10.5px' }}
                      />
                    </td>

                    {/* Via */}
                    <td style={{ height: '17px', padding: '1px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '0', background: bgColor }}>
                      <input
                        type="text"
                        value={row.via}
                        onChange={e => handleCellChange(row.id, 'via', e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '100%', fontSize: '10.5px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HELP FOOTER NOTE (MIRRORS HTML SCRIPT)                                 */}
      {/* ========================================================================= */}
      <div 
        style={{
          background: '#fff9d9',
          border: '1px solid #ead77a',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '12px',
          lineHeight: '1.45',
          color: '#333333'
        }}
        className="flex items-start gap-2"
      >
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <b>Cara pakai:</b> atur jumlah baris, nominal Deposit/Withdraw, dan jeda waktu, lalu klik{' '}
          <b className="text-blue-700">⚡ BUAT OTOMATIS</b>. Tampilan tabel sudah disesuaikan persis seperti contoh, dan semua teks/sel tetap bisa diedit langsung secara inline.
        </div>
      </div>
    </div>
    )}

    {/* ========================================================================= */}
    {/* FORMAT 2: DETAIL RONDE TRANSAKSI SLOT (METRONIC IDN / DEBIT & CREDIT)     */}
    {/* ========================================================================= */}
    {(activeFormat === 'ALL' || activeFormat === 'IDN_ROUND') && (
      <div className="space-y-4 pt-2">
        {activeFormat === 'ALL' && (
          <div className="flex items-center gap-3 pt-4 border-t border-cyan-500/20">
            <div className="h-px bg-cyan-500/30 flex-1" />
            <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-[#0a101d] border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              Format 2: Detail Ronde Game Slot (Debit Taruhan &amp; Credit Kemenangan)
            </span>
            <div className="h-px bg-cyan-500/30 flex-1" />
          </div>
        )}

        <IdnSlotRoundEditor />
      </div>
    )}
  </div>
);
};
