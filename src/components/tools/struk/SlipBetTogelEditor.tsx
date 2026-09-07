import React, { useState, useRef, useId } from 'react';
import html2canvas from 'html2canvas';
import {
  Receipt,
  Copy,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  Calculator,
  Layers,
  Sparkles,
  Sliders,
  Code2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  ChevronDown
} from 'lucide-react';

export interface SlipBetRow {
  id: string;
  no: number | string;
  tanggal: string;
  tebakan: string;
  type: string;
  taruhan: string;
  diskon: string;
  kei: string;
  prize: string;
  bayar: string;
  menang: string;
  tombol: string; // for url: 4D, 3D, 2D, 2D Tengah, 2D Belakang, etc.
  psrCode: string; // e.g. p24413
  hasSubtotal: boolean;
  subtotalLabel: string; // e.g. "Total 4D", "Total 3D", "Total 2D Tengah", "Total 2D Belakang"
  subtotalAmount: string; // e.g. "1,000,000"
}

export const PASARAN_OPTIONS = [
  { name: 'SINGAPORE', defaultPeriode: '1080', code: 'SGEO' },
  { name: 'SYDNEY', defaultPeriode: '1511', code: 'SYEO' },
  { name: 'HONGKONG', defaultPeriode: '2490', code: 'HKEO' },
  { name: 'TOTO MACAU 4D', defaultPeriode: '4521', code: 'TM' },
  { name: 'TOTO MACAU 5D', defaultPeriode: '1204', code: 'TM5D' },
  { name: 'KINGKONG 4D', defaultPeriode: '0892', code: 'KK4D' },
  { name: 'CAMBODIA', defaultPeriode: '0931', code: 'CAM' },
  { name: 'TAIWAN', defaultPeriode: '1780', code: 'TW' },
  { name: 'CHINA', defaultPeriode: '1422', code: 'CHN' },
];

export const SlipBetTogelEditor: React.FC = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Configuration States
  const [periode, setPeriode] = useState<string>('1080');
  const [pasaran, setPasaran] = useState<string>('SINGAPORE');
  const [userPemain, setUserPemain] = useState<string>('saif');
  const [globalTanggal, setGlobalTanggal] = useState<string>('2026-09-07 16:37:13');
  const [psrCode, setPsrCode] = useState<string>('p24413');

  // Auto calculate total toggle
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);
  const [manualGrandTotal, setManualGrandTotal] = useState<string>('1,400,000');
  const [customGrandTotalText, setCustomGrandTotalText] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'text'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>('row-1');

  // Rows state initialized to match user's template script
  const [rows, setRows] = useState<SlipBetRow[]>([
    {
      id: 'row-1',
      no: 1,
      tanggal: '2026-09-07 16:37:13',
      tebakan: '024',
      type: 'FULL',
      taruhan: '1,000',
      diskon: '0.00%',
      kei: '0',
      prize: '1000',
      bayar: '1,000',
      menang: '1,000,000',
      tombol: '3D',
      psrCode: 'p24413',
      hasSubtotal: true,
      subtotalLabel: 'Total 3D',
      subtotalAmount: '1,000,000'
    },
    {
      id: 'row-2',
      no: 2,
      tanggal: '2026-09-07 16:37:13',
      tebakan: '02',
      type: 'FULL',
      taruhan: '2,000',
      diskon: '0.00%',
      kei: '0',
      prize: '100',
      bayar: '2,000',
      menang: '200,000',
      tombol: '2D Tengah',
      psrCode: 'p24413',
      hasSubtotal: true,
      subtotalLabel: 'Total 2D Tengah',
      subtotalAmount: '200,000'
    },
    {
      id: 'row-3',
      no: 3,
      tanggal: '2026-09-07 16:37:13',
      tebakan: '24',
      type: 'FULL',
      taruhan: '2,000',
      diskon: '0.00%',
      kei: '0',
      prize: '100',
      bayar: '2,000',
      menang: '200,000',
      tombol: '2D',
      psrCode: 'p24413',
      hasSubtotal: true,
      subtotalLabel: 'Total 2D Belakang',
      subtotalAmount: '200,000'
    }
  ]);

  // Helper number parser
  const parseNum = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const formatNum = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Grand total calculation
  const calculatedGrandTotal = rows.reduce((acc, row) => acc + parseNum(row.menang), 0);
  const displayGrandTotal = autoCalculate ? formatNum(calculatedGrandTotal) : manualGrandTotal;
  const displayGrandTotalLabel = customGrandTotalText.trim()
    ? customGrandTotalText
    : `GRAND TOTAL  Menang Pool ${pasaran}`;

  // Handle cell edit
  const handleCellChange = (id: string, field: keyof SlipBetRow, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      
      // Auto sync subtotal amount if menang is changed
      if (field === 'menang' && updated.hasSubtotal) {
        updated.subtotalAmount = value;
      }
      return updated;
    }));
  };

  // Add new bet row with presets
  const handleAddBetRow = (presetType: '4D' | '3D' | '2D_BELAKANG' | '2D_TENGAH' | '2D_DEPAN' | 'CUSTOM') => {
    const nextNo = rows.length + 1;
    const newId = `row-${Date.now()}`;

    let newRow: SlipBetRow;

    if (presetType === '4D') {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '1080',
        type: 'FULL',
        taruhan: '1,000',
        diskon: '0.00%',
        kei: '0',
        prize: '3000',
        bayar: '1,000',
        menang: '3,000,000',
        tombol: '4D',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 4D',
        subtotalAmount: '3,000,000'
      };
    } else if (presetType === '3D') {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '080',
        type: 'FULL',
        taruhan: '1,000',
        diskon: '0.00%',
        kei: '0',
        prize: '1000',
        bayar: '1,000',
        menang: '1,000,000',
        tombol: '3D',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 3D',
        subtotalAmount: '1,000,000'
      };
    } else if (presetType === '2D_BELAKANG') {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '80',
        type: 'FULL',
        taruhan: '2,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '2,000',
        menang: '200,000',
        tombol: '2D',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 2D Belakang',
        subtotalAmount: '200,000'
      };
    } else if (presetType === '2D_TENGAH') {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '08',
        type: 'FULL',
        taruhan: '2,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '2,000',
        menang: '200,000',
        tombol: '2D Tengah',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 2D Tengah',
        subtotalAmount: '200,000'
      };
    } else if (presetType === '2D_DEPAN') {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '10',
        type: 'FULL',
        taruhan: '2,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '2,000',
        menang: '200,000',
        tombol: '2D Depan',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 2D Depan',
        subtotalAmount: '200,000'
      };
    } else {
      newRow = {
        id: newId,
        no: nextNo,
        tanggal: globalTanggal,
        tebakan: '77',
        type: 'FULL',
        taruhan: '1,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '1,000',
        menang: '100,000',
        tombol: '2D',
        psrCode: psrCode,
        hasSubtotal: true,
        subtotalLabel: 'Total 2D',
        subtotalAmount: '100,000'
      };
    }

    setRows(prev => [...prev, newRow]);
    setSelectedRowId(newId);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return filtered.map((r, idx) => ({ ...r, no: idx + 1 }));
    });
    if (selectedRowId === id) {
      setSelectedRowId(rows[0]?.id || null);
    }
  };

  // Duplicate row
  const handleDuplicateRow = (row: SlipBetRow) => {
    const newId = `row-${Date.now()}`;
    const nextNo = rows.length + 1;
    const duplicated: SlipBetRow = {
      ...row,
      id: newId,
      no: nextNo
    };
    setRows(prev => [...prev, duplicated]);
    setSelectedRowId(newId);
  };

  // Sync all row dates
  const handleApplyGlobalDate = () => {
    setRows(prev => prev.map(r => ({ ...r, tanggal: globalTanggal })));
  };

  // Reset to default template from user request
  const handleResetToDefault = () => {
    setPeriode('1080');
    setPasaran('SINGAPORE');
    setUserPemain('saif');
    setGlobalTanggal('2026-09-07 16:37:13');
    setPsrCode('p24413');
    setAutoCalculate(true);
    setManualGrandTotal('1,400,000');
    setCustomGrandTotalText('');
    setRows([
      {
        id: 'row-1',
        no: 1,
        tanggal: '2026-09-07 16:37:13',
        tebakan: '024',
        type: 'FULL',
        taruhan: '1,000',
        diskon: '0.00%',
        kei: '0',
        prize: '1000',
        bayar: '1,000',
        menang: '1,000,000',
        tombol: '3D',
        psrCode: 'p24413',
        hasSubtotal: true,
        subtotalLabel: 'Total 3D',
        subtotalAmount: '1,000,000'
      },
      {
        id: 'row-2',
        no: 2,
        tanggal: '2026-09-07 16:37:13',
        tebakan: '02',
        type: 'FULL',
        taruhan: '2,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '2,000',
        menang: '200,000',
        tombol: '2D Tengah',
        psrCode: 'p24413',
        hasSubtotal: true,
        subtotalLabel: 'Total 2D Tengah',
        subtotalAmount: '200,000'
      },
      {
        id: 'row-3',
        no: 3,
        tanggal: '2026-09-07 16:37:13',
        tebakan: '24',
        type: 'FULL',
        taruhan: '2,000',
        diskon: '0.00%',
        kei: '0',
        prize: '100',
        bayar: '2,000',
        menang: '200,000',
        tombol: '2D',
        psrCode: 'p24413',
        hasSubtotal: true,
        subtotalLabel: 'Total 2D Belakang',
        subtotalAmount: '200,000'
      }
    ]);
  };

  // Generate exact HTML script as provided by the user
  const generateExactHtmlScript = (): string => {
    let trHtml = '';

    rows.forEach((row, idx) => {
      const slideIndex = idx + 1;
      const urlLink = `admin_invoice13.php?s_periode=${periode}&amp;s_user=${encodeURIComponent(userPemain)}&amp;tombol=${encodeURIComponent(row.tombol)}&amp;psr=${encodeURIComponent(row.psrCode || psrCode)}`;
      
      trHtml += `<tr align="center" class="slide${slideIndex}"><td>${row.no}</td><td>${row.tanggal}</td><td><a href="javascript:popUp('${urlLink}')">${row.tebakan}</a></td><td>${row.type}</td><td>${row.taruhan}</td><td>${row.diskon}</td><td>${row.kei}</td><td>${row.prize}</td><td>${row.bayar}</td><td>${row.menang}</td></tr>`;

      if (row.hasSubtotal) {
        trHtml += `<tr bgcolor="#bfa8a8" align="center" class="cursor" onclick="slide(${slideIndex})"><td></td><td colspan="8">${row.subtotalLabel}</td><td>${row.subtotalAmount}</td></tr>`;
      }
    });

    return `<body style="overflow-y: auto;">
<div align="center">
<font size="4">Periode ${periode} - ${pasaran}<br><input type="hidden" name="totdata" id="totdata" value="${rows.length}"><table width="100%" border="1" bordercolor="#FF0000" align="center" style="border-style: solid;"></table><pre></pre><pre></pre><pre></pre><table width="100%" border="1" bordercolor="#FF0000" align="center" style="border-style: solid;">
                        <tbody><tr>
                            <th align="center">No</th>
                            <th align="center">Tanggal</th>
                            <th align="center">Tebakan</th>
                            <th align="center">Type</th>
                            <th align="center">Taruhan</th>
                            <th align="center">Diskon</th>
                            <th align="center">Kei</th>
                            <th align="center">Prize</th>
                            <th align="center">Bayar</th>
                            <th align="center">Menang</th>
                        </tr> ${trHtml}<tr>
        <td colspan="9" align="right" style="font-weight:bold;color:#000000;text-align: center">${displayGrandTotalLabel}</td>
        <td style="text-align: center">&nbsp;${displayGrandTotal}&nbsp;</td>
        </tr>
       </tbody></table><script type="text/javascript" src="assets/js/jquery-2.1.1.min.js"></script>
<script type="text/javascript">
function popUp(url) {
    day = new Date();
    id = day.getTime();
    eval("page" + id + " = window.open('"+ url +"', '" + id + "', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=0,width=700,height=500,left = 100,top = 134');");
}

function slide(a){
  if ( $( ".slide"+a).is( ":hidden" ) ) {
    $( ".slide"+a).slideDown();
  } else {
    $( ".slide"+a).slideUp();
  }
}
</script>
</font></div></body>`;
  };

  // Copy HTML script
  const handleCopyHtml = () => {
    const htmlCode = generateExactHtmlScript();
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy plain text summary
  const handleCopyText = () => {
    let txt = `*** SLIP BUKTI BET TOGEL - Periode ${periode} - ${pasaran} ***\n`;
    txt += `Pemain: ${userPemain}\n`;
    txt += `--------------------------------------------------------\n`;
    txt += `No | Tanggal | Tebakan | Type | Taruhan | Diskon | Prize | Menang\n`;
    txt += `--------------------------------------------------------\n`;
    rows.forEach(r => {
      txt += `${r.no} | ${r.tanggal} | ${r.tebakan} | ${r.type} | ${r.taruhan} | ${r.diskon} | ${r.prize} | ${r.menang}\n`;
      if (r.hasSubtotal) {
        txt += `   >> ${r.subtotalLabel}: ${r.subtotalAmount}\n`;
      }
    });
    txt += `--------------------------------------------------------\n`;
    txt += `${displayGrandTotalLabel}: ${displayGrandTotal}\n`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download High Quality PNG Image
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
      link.download = `slip_bet_togel_${pasaran}_${periode}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedRowId) || rows[0];

  return (
    <div className="space-y-4">
      {/* 1. KONTROL UTAMA & PENGATURAN PASARAN */}
      <div 
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '14px 16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
        className="text-gray-900 font-sans"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cbd5e1] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600 text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                Editor Slip Bukti Bet Togel (Format Invoice Merah IDN)
              </h2>
              <p className="text-[11px] text-gray-500">
                Sesuaikan teks tebakan, jenis (4D/3D/2D), taruhan, hadiah menang, dan subtotal langsung pada tabel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Reset data ke contoh bawaan user"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Contoh</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Memproses...' : 'Download PNG'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Script HTML'}</span>
            </button>
          </div>
        </div>

        {/* Form Setelan Pasaran, Periode, Pemain, Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
          <div>
            <label className="block text-gray-600 font-bold mb-1">Angka Periode:</label>
            <input
              type="text"
              value={periode}
              onChange={e => setPeriode(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Contoh: 1080"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">Nama Pasaran:</label>
            <input
              type="text"
              value={pasaran}
              onChange={e => setPasaran(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 font-bold text-red-600 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Contoh: SINGAPORE"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">Username Pemain:</label>
            <input
              type="text"
              value={userPemain}
              onChange={e => setUserPemain(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Contoh: saif"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1">Tanggal Global:</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={globalTanggal}
                onChange={e => setGlobalTanggal(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-mono focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleApplyGlobalDate}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] font-bold text-gray-700 whitespace-nowrap cursor-pointer"
                title="Terapkan tanggal ini ke semua baris"
              >
                Samakan
              </button>
            </div>
          </div>
        </div>

        {/* Preset Pasaran Cepat */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-200">
          <span className="text-[11px] font-bold text-gray-500 mr-1">Pilih Pasaran Cepat:</span>
          {PASARAN_OPTIONS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPasaran(p.name);
                setPeriode(p.defaultPeriode);
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                pasaran.toUpperCase() === p.name
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {p.name} ({p.defaultPeriode})
            </button>
          ))}
        </div>
      </div>

      {/* 2. TOMBOL TAMBAH BARIS CEPAT (4D, 3D, 2D, DLL) */}
      <div 
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
        className="space-y-2.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-red-600 font-bold" />
            <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
              Tambah Baris Taruhan Baru:
            </span>
          </div>
          <div className="text-[11px] text-gray-500">
            Total Baris Bet: <span className="font-bold text-gray-800">{rows.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddBetRow('4D')}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bet 4D</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddBetRow('3D')}
            className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bet 3D</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddBetRow('2D_BELAKANG')}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bet 2D Belakang</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddBetRow('2D_TENGAH')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bet 2D Tengah</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddBetRow('2D_DEPAN')}
            className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bet 2D Depan</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddBetRow('CUSTOM')}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Kustom</span>
          </button>
        </div>
      </div>

      {/* 3. PANEL EDITOR BARIS TERPILIH */}
      {selectedRow && (
        <div 
          style={{
            background: '#fff9f9',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px'
          }}
          className="text-xs space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[11px]">
                Baris #{selectedRow.no}
              </span>
              <span className="font-extrabold text-gray-800">
                Tebakan: <span className="text-blue-700 underline font-mono text-sm">{selectedRow.tebakan}</span> ({selectedRow.type})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDuplicateRow(selectedRow)}
                className="px-2 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold cursor-pointer"
              >
                Duplikat Baris
              </button>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteRow(selectedRow.id)}
                  className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Baris
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Tebakan:</label>
              <input
                type="text"
                value={selectedRow.tebakan}
                onChange={e => handleCellChange(selectedRow.id, 'tebakan', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Type:</label>
              <input
                type="text"
                value={selectedRow.type}
                onChange={e => handleCellChange(selectedRow.id, 'type', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-bold text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Taruhan (Rp):</label>
              <input
                type="text"
                value={selectedRow.taruhan}
                onChange={e => handleCellChange(selectedRow.id, 'taruhan', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Prize (Multi):</label>
              <input
                type="text"
                value={selectedRow.prize}
                onChange={e => handleCellChange(selectedRow.id, 'prize', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Bayar (Rp):</label>
              <input
                type="text"
                value={selectedRow.bayar}
                onChange={e => handleCellChange(selectedRow.id, 'bayar', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold">Menang (Rp):</label>
              <input
                type="text"
                value={selectedRow.menang}
                onChange={e => handleCellChange(selectedRow.id, 'menang', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-red-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="check-subtotal"
                checked={selectedRow.hasSubtotal}
                onChange={e => setRows(prev => prev.map(r => r.id === selectedRow.id ? { ...r, hasSubtotal: e.target.checked } : r))}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="check-subtotal" className="text-gray-700 font-semibold cursor-pointer">
                Sertakan Baris Subtotal
              </label>
            </div>

            {selectedRow.hasSubtotal && (
              <>
                <div>
                  <input
                    type="text"
                    value={selectedRow.subtotalLabel}
                    onChange={e => handleCellChange(selectedRow.id, 'subtotalLabel', e.target.value)}
                    placeholder="Contoh: Total 3D"
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={selectedRow.subtotalAmount}
                    onChange={e => handleCellChange(selectedRow.id, 'subtotalAmount', e.target.value)}
                    placeholder="Nominal Subtotal"
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. SETELAN GRAND TOTAL */}
      <div 
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '10px 16px'
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700">
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={e => setAutoCalculate(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span>Hitung Otomatis Grand Total (Jumlah Menang)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-semibold">Teks Label:</span>
          <input
            type="text"
            value={customGrandTotalText}
            onChange={e => setCustomGrandTotalText(e.target.value)}
            placeholder={`GRAND TOTAL  Menang Pool ${pasaran}`}
            className="px-2 py-1 border border-gray-300 rounded text-xs w-56 font-bold text-gray-800"
          />

          {!autoCalculate && (
            <input
              type="text"
              value={manualGrandTotal}
              onChange={e => setManualGrandTotal(e.target.value)}
              placeholder="1,400,000"
              className="px-2 py-1 border border-gray-300 rounded text-xs w-28 font-mono font-bold text-red-600"
            />
          )}
        </div>
      </div>

      {/* 5. TAB VIEW: PREVIEW TAMPILAN ASLI vs SCRIPT HTML */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'preview'
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Slip Invoice (Tampilan Asli)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'html'
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kode Script HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'text'
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Format Teks</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-500 hidden sm:block">
          💡 Tips: Anda dapat langsung mengklik dan mengetik pada sel tabel di bawah untuk mengedit angka.
        </div>
      </div>

      {/* TAB CONTENT 1: PREVIEW TAMPILAN PERSIS SEPERTI GAMBAR DENGAN BORDER MERAH */}
      {activeTab === 'preview' && (
        <div className="overflow-x-auto bg-[#e5e7eb] p-3 sm:p-5 rounded-2xl border border-gray-300 shadow-inner">
          {/* Tangkapan html2canvas */}
          <div
            ref={tableContainerRef}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'Verdana, Arial, sans-serif',
              minWidth: '780px',
              padding: '12px 14px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
          >
            <div style={{ width: '100%', textAlign: 'center' }}>
              {/* Header Title: Periode [Periode] - [Pasaran] */}
              <div 
                style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#000000', 
                  marginBottom: '6px',
                  fontFamily: 'Verdana, Arial, sans-serif'
                }}
              >
                Periode{' '}
                <input
                  type="text"
                  value={periode}
                  onChange={e => setPeriode(e.target.value)}
                  style={{
                    border: 'none',
                    borderBottom: '1px dashed #FF0000',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    width: '60px',
                    fontSize: '18px',
                    color: '#000000',
                    outline: 'none',
                    background: 'transparent'
                  }}
                />
                {' - '}
                <input
                  type="text"
                  value={pasaran}
                  onChange={e => setPasaran(e.target.value)}
                  style={{
                    border: 'none',
                    borderBottom: '1px dashed #FF0000',
                    fontWeight: 'bold',
                    width: '180px',
                    fontSize: '18px',
                    color: '#000000',
                    outline: 'none',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Garis batas merah atas seperti di script asli */}
              <div 
                style={{ 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#FF0000', 
                  marginBottom: '10px' 
                }} 
              />

              {/* TABEL DENGAN BORDER MERAH SOLID */}
              <table
                width="100%"
                style={{
                  borderCollapse: 'collapse',
                  border: '1px solid #FF0000',
                  fontSize: '11px',
                  color: '#000000',
                  fontFamily: 'Verdana, Arial, sans-serif'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>No</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Tanggal</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Tebakan</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Type</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Taruhan</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Diskon</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Kei</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Prize</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Bayar</th>
                    <th align="center" style={{ border: '1px solid #FF0000', padding: '4px 6px', fontWeight: 'bold' }}>Menang</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => {
                    const isSelected = selectedRowId === row.id;

                    return (
                      <React.Fragment key={row.id}>
                        {/* Baris Data Item */}
                        <tr 
                          onClick={() => setSelectedRowId(row.id)}
                          style={{
                            backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {/* No */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.no}
                              onChange={e => handleCellChange(row.id, 'no', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '25px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Tanggal */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.tanggal}
                              onChange={e => handleCellChange(row.id, 'tanggal', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '135px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Tebakan (Warna Biru dengan Garis Bawah seperti Link asli) */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.tebakan}
                              onChange={e => handleCellChange(row.id, 'tebakan', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '55px',
                                fontSize: '11px',
                                color: '#0000FF',
                                textDecoration: 'underline',
                                fontWeight: 'normal'
                              }}
                            />
                          </td>

                          {/* Type */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.type}
                              onChange={e => handleCellChange(row.id, 'type', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '55px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Taruhan */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.taruhan}
                              onChange={e => handleCellChange(row.id, 'taruhan', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '65px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Diskon */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.diskon}
                              onChange={e => handleCellChange(row.id, 'diskon', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '55px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Kei */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.kei}
                              onChange={e => handleCellChange(row.id, 'kei', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '30px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Prize */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.prize}
                              onChange={e => handleCellChange(row.id, 'prize', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '55px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Bayar */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.bayar}
                              onChange={e => handleCellChange(row.id, 'bayar', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '65px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>

                          {/* Menang */}
                          <td align="center" style={{ border: '1px solid #FF0000', padding: '3px 4px' }}>
                            <input
                              type="text"
                              value={row.menang}
                              onChange={e => handleCellChange(row.id, 'menang', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                textAlign: 'center',
                                width: '80px',
                                fontSize: '11px',
                                color: '#000000'
                              }}
                            />
                          </td>
                        </tr>

                        {/* Baris Subtotal: Warna Mauve/Abu-abu (#bfa8a8) */}
                        {row.hasSubtotal && (
                          <tr 
                            style={{ 
                              backgroundColor: '#bfa8a8',
                              color: '#000000',
                              textAlign: 'center'
                            }}
                          >
                            <td style={{ border: '1px solid #FF0000', padding: '3px 4px' }}></td>
                            <td 
                              colSpan={8} 
                              align="center"
                              style={{ 
                                border: '1px solid #FF0000', 
                                padding: '3px 4px', 
                                fontWeight: 'normal',
                                textAlign: 'center'
                              }}
                            >
                              <input
                                type="text"
                                value={row.subtotalLabel}
                                onChange={e => handleCellChange(row.id, 'subtotalLabel', e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  textAlign: 'center',
                                  width: '200px',
                                  fontSize: '11px',
                                  color: '#000000'
                                }}
                              />
                            </td>
                            <td 
                              align="center"
                              style={{ 
                                border: '1px solid #FF0000', 
                                padding: '3px 4px',
                                textAlign: 'center'
                              }}
                            >
                              <input
                                type="text"
                                value={row.subtotalAmount}
                                onChange={e => handleCellChange(row.id, 'subtotalAmount', e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  textAlign: 'center',
                                  width: '80px',
                                  fontSize: '11px',
                                  color: '#000000'
                                }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Baris GRAND TOTAL */}
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td 
                      colSpan={9} 
                      align="center"
                      style={{ 
                        border: '1px solid #FF0000', 
                        padding: '4px 6px',
                        fontWeight: 'bold',
                        color: '#000000',
                        textAlign: 'center',
                        fontSize: '11px'
                      }}
                    >
                      <input
                        type="text"
                        value={displayGrandTotalLabel}
                        onChange={e => setCustomGrandTotalText(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          textAlign: 'center',
                          width: '95%',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          color: '#000000'
                        }}
                      />
                    </td>
                    <td 
                      align="center"
                      style={{ 
                        border: '1px solid #FF0000', 
                        padding: '4px 6px',
                        fontWeight: 'bold',
                        color: '#000000',
                        textAlign: 'center',
                        fontSize: '11px'
                      }}
                    >
                      &nbsp;
                      <input
                        type="text"
                        value={displayGrandTotal}
                        onChange={e => {
                          setAutoCalculate(false);
                          setManualGrandTotal(e.target.value);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          textAlign: 'center',
                          width: '85px',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          color: '#000000'
                        }}
                      />
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SCRIPT HTML ASLI (SIAP COPY & PASTE) */}
      {activeTab === 'html' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Kode Lengkap Script HTML:</span>
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Script'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={generateExactHtmlScript()}
            rows={14}
            className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-xl border border-gray-700 focus:outline-none"
          />
        </div>
      )}

      {/* TAB CONTENT 3: FORMAT TEKS POLOS */}
      {activeTab === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Ringkasan Teks:</span>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Teks</span>
            </button>
          </div>
          <textarea
            readOnly
            value={`Periode: ${periode} - ${pasaran}
Pemain: ${userPemain}
Tanggal: ${globalTanggal}
------------------------------------
${rows.map(r => `${r.no}. [${r.type}] ${r.tebakan} -> Taruhan: Rp ${r.taruhan} | Bayar: Rp ${r.bayar} | Menang: Rp ${r.menang}${r.hasSubtotal ? `\n   >> ${r.subtotalLabel}: Rp ${r.subtotalAmount}` : ''}`).join('\n')}
------------------------------------
${displayGrandTotalLabel}: Rp ${displayGrandTotal}`}
            rows={10}
            className="w-full p-3 font-mono text-xs bg-gray-900 text-yellow-300 rounded-xl border border-gray-700 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
