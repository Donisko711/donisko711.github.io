import React, { useState, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Sliders, 
  Code2,
  Table,
  Dices,
  Edit3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface TogelPasaranInfo {
  code: string;
  name: string;
  defaultPeriode: string;
}

export const PASARAN_PRESETS: TogelPasaranInfo[] = [
  { code: 'SGEO', name: 'SINGAPORE', defaultPeriode: '1080' },
  { code: 'SYEO', name: 'SYDNEY', defaultPeriode: '1511' },
  { code: 'SDYN', name: 'SYDNEY', defaultPeriode: '1511' },
  { code: 'HKEO', name: 'HONGKONG', defaultPeriode: '2490' },
  { code: 'TM', name: 'TOTO MACAU 4D', defaultPeriode: '4521' },
  { code: 'TM5D', name: 'TOTO MACAU 5D', defaultPeriode: '1204' },
  { code: 'KK4D', name: 'KINGKONG 4D', defaultPeriode: '0892' },
  { code: 'CAM', name: 'CAMBODIA', defaultPeriode: '3120' },
  { code: 'TW', name: 'TAIWAN', defaultPeriode: '1980' },
  { code: 'CHN', name: 'CHINA', defaultPeriode: '2214' }
];

export interface TogelTxRow {
  id: string;
  no: number | string;
  periodeNum: string;    // e.g. '1080'
  periodeCode: string;   // e.g. 'SGEO'
  periode: string;       // Combined: '1080 - SGEO'
  tanggal: string;       // '2026-09-07 17:45:41'
  keterangan: string;    // e.g. 'Menang Pool SINGAPORE' or 'Beli SINGAPORE 4D - FULL'
  tesiId: string;        // e.g. '12072178'
  hasLink: boolean;      // true if links to user_detil.php
  status: 'Menang' | 'Beli' | 'Withdraw' | 'Deposit' | string;
  debet: string;         // formatted e.g. '44,000'
  kredit: string;        // formatted e.g. '1,400,000'
  saldo: string;         // formatted e.g. '1,460,133'
  via: 'Mobile' | 'Website' | '-' | string;
  bgType: 'gray' | 'peach';
}

export const TransaksiTogelEditor: React.FC = () => {
  // Generator Config
  const [cfgRows, setCfgRows] = useState<number>(7);
  const [cfgPemain, setCfgPemain] = useState<string>('saif');
  const [selectedPasaranCode, setSelectedPasaranCode] = useState<string>('SGEO');
  const [cfgDefaultPeriode, setCfgDefaultPeriode] = useState<string>('1080');
  const [cfgBetMin, setCfgBetMin] = useState<number>(10000);
  const [cfgBetMax, setCfgBetMax] = useState<number>(100000);
  const [cfgWinMin, setCfgWinMin] = useState<number>(200000);
  const [cfgWinMax, setCfgWinMax] = useState<number>(2000000);
  const [cfgWdMin, setCfgWdMin] = useState<number>(500000);
  const [cfgWdMax, setCfgWdMax] = useState<number>(2000000);
  const [cfgGapMin, setCfgGapMin] = useState<number>(5);
  const [cfgGapMax, setCfgGapMax] = useState<number>(60);

  // View States
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [copiedHtmlStatus, setCopiedHtmlStatus] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'HTML_CODE'>('PREVIEW');

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Initial Sample Data (Mirrors the exact user reference HTML script)
  const initialRows: TogelTxRow[] = [
    {
      id: 'row-1',
      no: 1,
      periodeNum: '',
      periodeCode: '',
      periode: '',
      tanggal: '2026-09-07 17:50:13',
      keterangan: 'Tarik Dana',
      tesiId: '',
      hasLink: false,
      status: 'Withdraw',
      debet: '1,255,000',
      kredit: '0',
      saldo: '205,133',
      via: 'Mobile',
      bgType: 'gray'
    },
    {
      id: 'row-2',
      no: 2,
      periodeNum: '1080',
      periodeCode: 'SGEO',
      periode: '1080 - SGEO',
      tanggal: '2026-09-07 17:45:41',
      keterangan: 'Menang Pool SINGAPORE',
      tesiId: '12072178',
      hasLink: true,
      status: 'Menang',
      debet: '0',
      kredit: '1,400,000',
      saldo: '1,460,133',
      via: '-',
      bgType: 'peach'
    },
    {
      id: 'row-3',
      no: 3,
      periodeNum: '1080',
      periodeCode: 'SGEO',
      periode: '1080 - SGEO',
      tanggal: '2026-09-07 16:39:23',
      keterangan: 'Beli SINGAPORE 4D - FULL',
      tesiId: '11934418',
      hasLink: true,
      status: 'Beli',
      debet: '44,000',
      kredit: '0',
      saldo: '60,133',
      via: 'Mobile',
      bgType: 'gray'
    },
    {
      id: 'row-4',
      no: 4,
      periodeNum: '1080',
      periodeCode: 'SGEO',
      periode: '1080 - SGEO',
      tanggal: '2026-09-07 16:37:13',
      keterangan: 'Beli SINGAPORE BB - FULL',
      tesiId: '11930177',
      hasLink: true,
      status: 'Beli',
      debet: '96,000',
      kredit: '0',
      saldo: '104,133',
      via: 'Mobile',
      bgType: 'peach'
    },
    {
      id: 'row-5',
      no: 7,
      periodeNum: '1511',
      periodeCode: 'SYEO',
      periode: '1511 - SYEO',
      tanggal: '2026-09-07 12:14:30',
      keterangan: 'Beli SYDNEY BB - FULL',
      tesiId: '11349792',
      hasLink: true,
      status: 'Beli',
      debet: '96,000',
      kredit: '0',
      saldo: '18,133',
      via: 'Mobile',
      bgType: 'gray'
    },
    {
      id: 'row-6',
      no: 8,
      periodeNum: '',
      periodeCode: '',
      periode: '',
      tanggal: '2026-09-07 12:12:51',
      keterangan: 'Deposit PGA',
      tesiId: '',
      hasLink: false,
      status: 'Deposit',
      debet: '0',
      kredit: '112,219',
      saldo: '114,133',
      via: 'Website',
      bgType: 'peach'
    },
    {
      id: 'row-7',
      no: 9,
      periodeNum: '',
      periodeCode: '',
      periode: '',
      tanggal: '2026-09-06 23:14:21',
      keterangan: 'Bonus Rolling Slot',
      tesiId: '',
      hasLink: false,
      status: 'rolling',
      debet: '0',
      kredit: '202',
      saldo: '1,914',
      via: '-',
      bgType: 'gray'
    },
    {
      id: 'row-8',
      no: 16,
      periodeNum: '',
      periodeCode: '',
      periode: '',
      tanggal: '2026-09-06 17:02:27',
      keterangan: 'Deposit PGA',
      tesiId: '',
      hasLink: false,
      status: 'Deposit',
      debet: '0',
      kredit: '10,677',
      saldo: '13,712',
      via: 'Website',
      bgType: 'peach'
    }
  ];

  const [rows, setRows] = useState<TogelTxRow[]>(initialRows);
  const [lastBalance, setLastBalance] = useState<string>('205,133');

  // Helpers
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const roundTo = (val: number, step: number) => Math.round(val / step) * step;
  const formatMoney = (val: number) => Math.max(0, Math.round(val)).toLocaleString('en-US');
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const getPasaranName = (code: string) => {
    const found = PASARAN_PRESETS.find(p => p.code === code);
    if (found) return found.name;
    if (code === 'SYEO') return 'SYDNEY';
    return code;
  };

  // Generate Automatic Simulation tailored for Togel
  const handleGenerate = () => {
    setIsGenerating(true);

    const numRows = clamp(cfgRows, 1, 50);
    let bMin = clamp(cfgBetMin, 1000, 100000000);
    let bMax = clamp(cfgBetMax, 1000, 100000000);
    let wMin = clamp(cfgWinMin, 1000, 100000000);
    let wMax = clamp(cfgWinMax, 1000, 100000000);
    let wdMin = clamp(cfgWdMin, 10000, 100000000);
    let wdMax = clamp(cfgWdMax, 10000, 100000000);
    const gMin = clamp(cfgGapMin, 1, 1440);
    const gMax = clamp(cfgGapMax, 1, 1440);

    if (bMin > bMax) [bMin, bMax] = [bMax, bMin];
    if (wMin > wMax) [wMin, wMax] = [wMax, wMin];
    if (wdMin > wdMax) [wdMin, wdMax] = [wdMax, wdMin];

    const currentPasaran = PASARAN_PRESETS.find(p => p.code === selectedPasaranCode) || PASARAN_PRESETS[0];
    const pCode = currentPasaran.code;
    const pName = currentPasaran.name;
    const basePeriodeNum = parseInt(cfgDefaultPeriode, 10) || 1080;

    let balance = randInt(100, 500) * 1000 + 133;
    let current = new Date();
    const newItems: TogelTxRow[] = [];

    // Layout plan:
    // Row 1: often Tarik Dana (Withdraw) or latest Menang Pool
    // Row 2: Menang Pool
    // Row 3-N: Beli 4D / BB / 3D / 2D
    const betTypes = ['4D - FULL', 'BB - FULL', '3D - FULL', '2D - DISKON', 'COLOK BEBAS'];

    for (let i = 1; i <= numRows; i++) {
      let isWithdraw = false;
      let isWin = false;
      let isBet = false;

      if (i === 1) {
        // First row is withdraw to match reference
        isWithdraw = true;
      } else if (i === 2 || (numRows >= 6 && i === 5)) {
        // Winning pool
        isWin = true;
      } else {
        // Betting
        isBet = true;
      }

      let debet = 0;
      let kredit = 0;
      let status = 'Beli';
      let keterangan = '';
      let via = 'Mobile';
      let rowPeriode = '';
      let rowPeriodeNum = '';
      let rowPeriodeCode = '';
      let hasLink = false;
      const tesiId = String(randInt(11000000, 12999999));

      if (isWithdraw) {
        const wdAmount = roundTo(randInt(wdMin, wdMax), 1000);
        debet = wdAmount;
        kredit = 0;
        status = 'Withdraw';
        keterangan = 'Tarik Dana';
        via = Math.random() < 0.8 ? 'Mobile' : 'Website';
        rowPeriode = '';
        hasLink = false;
      } else if (isWin) {
        const winAmount = roundTo(randInt(wMin, wMax), 10000);
        kredit = winAmount;
        debet = 0;
        status = 'Menang';
        keterangan = `Menang Pool ${pName}`;
        via = '-';
        rowPeriodeNum = String(basePeriodeNum);
        rowPeriodeCode = pCode;
        rowPeriode = `${rowPeriodeNum} - ${rowPeriodeCode}`;
        hasLink = true;
      } else {
        // Bet row
        const betType = betTypes[randInt(0, betTypes.length - 1)];
        const betAmount = roundTo(randInt(bMin, bMax), 1000);
        debet = betAmount;
        kredit = 0;
        status = 'Beli';
        keterangan = `Beli ${pName} ${betType}`;
        via = Math.random() < 0.85 ? 'Mobile' : 'Website';
        rowPeriodeNum = String(basePeriodeNum);
        rowPeriodeCode = pCode;
        rowPeriode = `${rowPeriodeNum} - ${rowPeriodeCode}`;
        hasLink = true;
      }

      // Update running balance backwards or forwards
      newItems.push({
        id: `row-${Date.now()}-${i}`,
        no: i,
        periodeNum: rowPeriodeNum,
        periodeCode: rowPeriodeCode,
        periode: rowPeriode,
        tanggal: formatDate(new Date(current)),
        keterangan,
        tesiId,
        hasLink,
        status,
        debet: formatMoney(debet),
        kredit: formatMoney(kredit),
        saldo: '', // will calculate below
        via,
        bgType: (i - 1) % 2 === 0 ? 'gray' : 'peach'
      });

      // Decrease time by random minutes
      current = new Date(current.getTime() - randInt(gMin, gMax) * 60000);
    }

    // Now calculate realistic Saldo values from bottom to top
    // Start at bottom row with a base balance
    let runningBalance = randInt(10, 50) * 1000 + 133;
    for (let j = newItems.length - 1; j >= 0; j--) {
      const item = newItems[j];
      const d = parseInt(item.debet.replace(/,/g, ''), 10) || 0;
      const k = parseInt(item.kredit.replace(/,/g, ''), 10) || 0;
      
      // If user bet/withdrew (debet), previous balance must be higher than current
      // balance = previous + kredit - debet => previous = balance - kredit + debet
      if (j === newItems.length - 1) {
        item.saldo = formatMoney(runningBalance);
      } else {
        runningBalance = runningBalance + k - d;
        if (runningBalance <= 0) runningBalance = Math.abs(runningBalance) + 50000 + 133;
        item.saldo = formatMoney(runningBalance);
      }
    }

    // Set last balance to match row 1's balance
    const topBalance = newItems[0]?.saldo || '205,133';
    setLastBalance(topBalance);
    setRows(newItems);
    setSelectedRowId(null);

    setTimeout(() => {
      setIsGenerating(false);
    }, 250);
  };

  // Add Row
  const handleAddRow = () => {
    const newNo = rows.length + 1;
    const currentPasaran = PASARAN_PRESETS.find(p => p.code === selectedPasaranCode) || PASARAN_PRESETS[0];
    const newRow: TogelTxRow = {
      id: `row-${Date.now()}`,
      no: newNo,
      periodeNum: cfgDefaultPeriode,
      periodeCode: currentPasaran.code,
      periode: `${cfgDefaultPeriode} - ${currentPasaran.code}`,
      tanggal: formatDate(new Date()),
      keterangan: `Beli ${currentPasaran.name} 4D - FULL`,
      tesiId: String(randInt(11000000, 12999999)),
      hasLink: true,
      status: 'Beli',
      debet: '44,000',
      kredit: '0',
      saldo: '100,133',
      via: 'Mobile',
      bgType: (rows.length % 2 === 0) ? 'gray' : 'peach'
    };
    setRows([...rows, newRow]);
    setSelectedRowId(newRow.id);
  };

  // Reset to exact user reference
  const handleReset = () => {
    setRows(initialRows);
    setLastBalance('205,133');
    setCfgPemain('saif');
    setSelectedRowId(null);
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

  // Cell edit
  const handleCellChange = (id: string, field: keyof TogelTxRow, value: any) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      // If periodeNum or periodeCode changed, update combined periode
      if (field === 'periodeNum' || field === 'periodeCode') {
        const num = field === 'periodeNum' ? value : r.periodeNum;
        const code = field === 'periodeCode' ? value : r.periodeCode;
        if (num || code) {
          updated.periode = num && code ? `${num} - ${code}` : (num || code);
        } else {
          updated.periode = '';
        }
      } else if (field === 'periode') {
        updated.periode = value;
        if (value && typeof value === 'string' && value.includes(' - ')) {
          const parts = value.split(' - ');
          updated.periodeNum = parts[0]?.trim() || '';
          updated.periodeCode = parts[1]?.trim() || '';
        } else if (!value) {
          updated.periodeNum = '';
          updated.periodeCode = '';
        }
      }
      return updated;
    }));
  };

  // Quick Pasaran Changer for Selected Row
  const handleQuickPasaranSelect = (code: string) => {
    if (!selectedRowId) return;
    const pasaran = PASARAN_PRESETS.find(p => p.code === code);
    if (!pasaran) return;

    setRows(prev => prev.map(r => {
      if (r.id !== selectedRowId) return r;
      const num = r.periodeNum || pasaran.defaultPeriode;
      let newKet = r.keterangan;
      // Auto replace market name if it matches standard patterns
      if (newKet.startsWith('Menang Pool')) {
        newKet = `Menang Pool ${pasaran.name}`;
      } else if (newKet.startsWith('Beli')) {
        const parts = newKet.split(' ');
        const betSuffix = parts.slice(2).join(' ') || '4D - FULL';
        newKet = `Beli ${pasaran.name} ${betSuffix}`;
      }
      return {
        ...r,
        periodeCode: code,
        periodeNum: num,
        periode: `${num} - ${code}`,
        keterangan: newKet,
        hasLink: true
      };
    }));
  };

  // Quick Keterangan Changer for Selected Row
  const handleQuickKeterangan = (type: 'MENANG' | 'BELI_4D' | 'BELI_BB' | 'BELI_3D' | 'BELI_2D' | 'WD' | 'DEPO') => {
    if (!selectedRowId) return;
    const row = rows.find(r => r.id === selectedRowId);
    if (!row) return;

    const pasaranName = getPasaranName(row.periodeCode || selectedPasaranCode);
    const pasaranCode = row.periodeCode || selectedPasaranCode;
    const periodeNum = row.periodeNum || cfgDefaultPeriode;

    setRows(prev => prev.map(r => {
      if (r.id !== selectedRowId) return r;
      switch (type) {
        case 'MENANG':
          return {
            ...r,
            keterangan: `Menang Pool ${pasaranName}`,
            status: 'Menang',
            debet: '0',
            kredit: r.kredit === '0' ? '1,400,000' : r.kredit,
            hasLink: true,
            via: '-'
          };
        case 'BELI_4D':
          return {
            ...r,
            keterangan: `Beli ${pasaranName} 4D - FULL`,
            status: 'Beli',
            debet: r.debet === '0' ? '44,000' : r.debet,
            kredit: '0',
            hasLink: true,
            via: 'Mobile'
          };
        case 'BELI_BB':
          return {
            ...r,
            keterangan: `Beli ${pasaranName} BB - FULL`,
            status: 'Beli',
            debet: r.debet === '0' ? '96,000' : r.debet,
            kredit: '0',
            hasLink: true,
            via: 'Mobile'
          };
        case 'BELI_3D':
          return {
            ...r,
            keterangan: `Beli ${pasaranName} 3D - FULL`,
            status: 'Beli',
            debet: r.debet === '0' ? '28,000' : r.debet,
            kredit: '0',
            hasLink: true,
            via: 'Mobile'
          };
        case 'BELI_2D':
          return {
            ...r,
            keterangan: `Beli ${pasaranName} 2D - DISKON`,
            status: 'Beli',
            debet: r.debet === '0' ? '14,000' : r.debet,
            kredit: '0',
            hasLink: true,
            via: 'Mobile'
          };
        case 'WD':
          return {
            ...r,
            keterangan: 'Tarik Dana',
            status: 'Withdraw',
            periode: '',
            periodeCode: '',
            periodeNum: '',
            debet: r.debet === '0' ? '1,255,000' : r.debet,
            kredit: '0',
            hasLink: false,
            via: 'Mobile'
          };
        case 'DEPO':
          return {
            ...r,
            keterangan: 'Deposit Bank',
            status: 'Deposit',
            periode: '',
            periodeCode: '',
            periodeNum: '',
            debet: '0',
            kredit: r.kredit === '0' ? '500,000' : r.kredit,
            hasLink: false,
            via: 'Website'
          };
        default:
          return r;
      }
    }));
  };

  // Generate the exact HTML string as requested by the user
  const generateRawHtmlScript = () => {
    let html = `<table width="100%">
    <tbody><tr>
\t\t<td>
<a href="admin_transaksi.php?pemain2=${encodeURIComponent(cfgPemain)}&amp;start=25&amp;end=50&amp;sta=Baru">[ &gt;&gt; ]</a></td></tr><tr bgcolor="#F5E363">
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>No</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Periode</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Tanggal</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Keterangan</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Status</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Debet</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Kredit</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Saldo</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>Via</b></font></td>
</tr>
<tr bgcolor="#FFDBB7">
\t<td align="center" colspan="5"><font size="2" color="#000000" face="verdana"><b>&nbsp;</b></font></td>
\t<td align="center" colspan="2"><font size="2" color="#000000" face="verdana"><b>Last Balance</b></font></td>
\t<td align="center"><font size="2" color="#0000FF" face="verdana"><b>${lastBalance}</b></font></td>
\t<td align="center"><font size="2" color="#000000" face="verdana"><b>&nbsp;</b></font></td>
</tr>`;

    rows.forEach((r) => {
      const bg = r.bgType === 'gray' ? '#EFEFEF' : '#FFDBB7';
      const debetColor = '#000000';
      const kreditColor = '#0000FF';
      const saldoColor = '#0000FF';
      const statusColor = 'red';

      let ketCell = `<font size="2" color="#000000" face="verdana">${r.keterangan}</font>`;
      if (r.hasLink && r.tesiId) {
        ketCell = `<font size="2" color="#000000" face="verdana"><a href="javascript:popUp('user_detil.php?tesi=${r.tesiId}&amp;sta=Baru&amp;pemain=${cfgPemain}')">${r.keterangan}</a></font>`;
      }

      html += `<tr bgcolor="${bg}">` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.no}</font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.periode || ''}</font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.tanggal}</font></td>` +
        `<td align="center">${ketCell}</td>` +
        `<td align="center"><font size="2" color="${statusColor}" face="verdana">${r.status}</font></td>` +
        `<td align="center"><font size="2" color="${debetColor}" face="verdana">${r.debet}</font></td>` +
        `<td align="center"><font size="2" color="${kreditColor}" face="verdana">${r.kredit}</font></td>` +
        `<td align="center"><font size="2" color="${saldoColor}" face="verdana">${r.saldo} </font></td>` +
        `<td align="center"><font size="2" color="#000000" face="verdana">${r.via}</font></td>` +
        `</tr>`;
    });

    html += `\n</tbody></table>`;
    return html;
  };

  // Copy Tabular Plain Text
  const handleCopyTableText = () => {
    let text = `Transaksi Pemain : ${cfgPemain}\nLast Balance: ${lastBalance}\n\n`;
    text += `No\tPeriode\tTanggal\tKeterangan\tStatus\tDebet\tKredit\tSaldo\tVia\n`;
    rows.forEach(r => {
      text += `${r.no}\t${r.periode || '-'}\t${r.tanggal}\t${r.keterangan}\t${r.status}\t${r.debet}\t${r.kredit}\t${r.saldo}\t${r.via}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Copy Full HTML Script
  const handleCopyHtmlScript = () => {
    const htmlCode = generateRawHtmlScript();
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtmlStatus(true);
    setTimeout(() => setCopiedHtmlStatus(false), 2000);
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
      link.download = `transaksi_togel_${cfgPemain}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedRowId);

  return (
    <div className="space-y-4">
      {/* 1. EASY PANEL GENERATOR CONTROLS (MIRRORS SCREENSHOT TEMPLATE) */}
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
            <span>Generator Transaksi Togel Simulasi</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#60758a' }}>
              • Menang Pool • Beli 4D/3D/2D/BB • Tarik Dana • Kode Pasaran Fleksibel
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

        {/* Inputs Grid - Matches image structure */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 items-end text-xs">
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
            <span>User / Pemain</span>
            <input 
              type="text" 
              value={cfgPemain}
              onChange={e => setCfgPemain(e.target.value)}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#0000cc'
              }}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Pilih Pasaran</span>
            <select
              value={selectedPasaranCode}
              onChange={e => {
                const code = e.target.value;
                setSelectedPasaranCode(code);
                const pasaran = PASARAN_PRESETS.find(p => p.code === code);
                if (pasaran) setCfgDefaultPeriode(pasaran.defaultPeriode);
              }}
              style={{
                height: '30px',
                border: '1px solid #b9c6d3',
                borderRadius: '5px',
                padding: '4px 7px',
                background: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#0d47a1'
              }}
            >
              {PASARAN_PRESETS.map(p => (
                <option key={p.code} value={p.code}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-700">
            <span>Angka Periode</span>
            <input 
              type="text" 
              value={cfgDefaultPeriode}
              onChange={e => setCfgDefaultPeriode(e.target.value)}
              placeholder="Contoh: 1080"
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
            <span>Beli (Taruhan) min</span>
            <input 
              type="number" 
              min={1000} 
              step={1000} 
              value={cfgBetMin}
              onChange={e => setCfgBetMin(Number(e.target.value))}
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
            <span>Beli (Taruhan) max</span>
            <input 
              type="number" 
              min={1000} 
              step={1000} 
              value={cfgBetMax}
              onChange={e => setCfgBetMax(Number(e.target.value))}
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
            <span>Menang min</span>
            <input 
              type="number" 
              min={10000} 
              step={10000} 
              value={cfgWinMin}
              onChange={e => setCfgWinMin(Number(e.target.value))}
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
            <span>Menang max</span>
            <input 
              type="number" 
              min={10000} 
              step={10000} 
              value={cfgWinMax}
              onChange={e => setCfgWinMax(Number(e.target.value))}
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

            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-2.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Kembalikan format data contoh template"
            >
              <RotateCcw className="w-3 h-3 text-gray-500" />
              <span>Reset Template</span>
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTableText}
              className="h-8 px-3 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
              <span>{copiedStatus ? 'Tersalin!' : 'Salin Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyHtmlScript}
              className="h-8 px-3 rounded-md bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Salin persis format table script HTML/PHP seperti yang diminta"
            >
              {copiedHtmlStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5 text-amber-700" />}
              <span>{copiedHtmlStatus ? 'HTML Tersalin!' : 'Salin Format Script'}</span>
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

      {/* 2. QUICK EDITOR PANEL FOR SELECTED ROW (Mengganti Angka Periode, Kode Pasaran & Keterangan) */}
      <div className="p-3.5 bg-[#0b1424] border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-cyan-300 uppercase">
              {selectedRow ? `Edit Baris Terpilih: #${selectedRow.no} (${selectedRow.keterangan || 'Baris'})` : 'Pilih Baris Pada Tabel Untuk Ganti Periode, Pasaran & Keterangan'}
            </span>
          </div>
          {selectedRow && (
            <span className="text-[11px] text-yellow-300">
              Periode Aktif: <strong className="text-white">{selectedRow.periode || '(Kosong/Withdraw)'}</strong>
            </span>
          )}
        </div>

        {selectedRow ? (
          <div className="space-y-3">
            {/* Quick Pasaran Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 text-[11px] mr-1">Kode Pasaran:</span>
              {PASARAN_PRESETS.map((p) => {
                const isActive = selectedRow.periodeCode === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleQuickPasaranSelect(p.code)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)] font-black' 
                        : 'bg-[#15233c] hover:bg-[#1f3358] text-cyan-200 border border-cyan-500/30'
                    }`}
                  >
                    {p.code} ({p.name})
                  </button>
                );
              })}
            </div>

            {/* Detailed Row Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Angka Periode:</label>
                <input
                  type="text"
                  value={selectedRow.periodeNum}
                  onChange={e => handleCellChange(selectedRow.id, 'periodeNum', e.target.value)}
                  placeholder="Contoh: 1080"
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-cyan-500/50 text-yellow-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Kode Pasaran:</label>
                <input
                  type="text"
                  value={selectedRow.periodeCode}
                  onChange={e => handleCellChange(selectedRow.id, 'periodeCode', e.target.value)}
                  placeholder="SGEO / SDYN / HKEO"
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-cyan-500/50 text-cyan-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Teks Keterangan:</label>
                <input
                  type="text"
                  value={selectedRow.keterangan}
                  onChange={e => handleCellChange(selectedRow.id, 'keterangan', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-white/20 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Status:</label>
                <select
                  value={selectedRow.status}
                  onChange={e => handleCellChange(selectedRow.id, 'status', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-white/20 text-red-400 font-bold text-xs"
                >
                  <option value="Menang">Menang</option>
                  <option value="Beli">Beli</option>
                  <option value="Withdraw">Withdraw</option>
                  <option value="Deposit">Deposit</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">No. Tesi Link:</label>
                <input
                  type="text"
                  value={selectedRow.tesiId}
                  onChange={e => handleCellChange(selectedRow.id, 'tesiId', e.target.value)}
                  placeholder="12072178"
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-white/20 text-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Warna Baris:</label>
                <select
                  value={selectedRow.bgType}
                  onChange={e => handleCellChange(selectedRow.id, 'bgType', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#060b13] border border-white/20 text-gray-300 text-xs"
                >
                  <option value="gray">Abu-abu (#EFEFEF)</option>
                  <option value="peach">Peach (#FFDBB7)</option>
                </select>
              </div>
            </div>

            {/* Quick Keterangan Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-gray-400 text-[11px] mr-1">Preset Keterangan:</span>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('MENANG')}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Menang Pool
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('BELI_4D')}
                className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Beli 4D - FULL
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('BELI_BB')}
                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Beli BB - FULL
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('BELI_3D')}
                className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Beli 3D
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('BELI_2D')}
                className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Beli 2D Diskon
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('WD')}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Tarik Dana (Withdraw)
              </button>
              <button
                type="button"
                onClick={() => handleQuickKeterangan('DEPO')}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
              >
                + Deposit Bank
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-gray-400 text-xs">
            💡 <em>Klik salah satu baris pada tabel di bawah untuk mengubah angka periode, kode pasaran (SGEO, SDYN, HKEO, dll), dan teks keterangan dengan cepat.</em>
          </div>
        )}
      </div>

      {/* 3. TABS VIEW: PREVIEW VS RAW HTML SCRIPT */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('PREVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'PREVIEW'
              ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'bg-[#0f172a] text-gray-300 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Tampilan Visual Tabel (Preview &amp; Edit Langsung)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HTML_CODE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'HTML_CODE'
              ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'bg-[#0f172a] text-gray-300 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Kode Script HTML &lt;table&gt; Asli</span>
        </button>
      </div>

      {/* 4. THE PAGE & TABLE VIEW (EXACT MATCH TO ATTACHED SCRIPT) */}
      {activeTab === 'PREVIEW' && (
        <div className="p-3 bg-gray-800 rounded-xl overflow-x-auto shadow-inner">
          <div 
            ref={tableContainerRef}
            style={{
              position: 'relative',
              width: '100%',
              minWidth: '950px',
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '6px 8px 16px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'Verdana, Arial, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            {/* Watermark */}
            {showWatermark && (
              <div 
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(-18deg)',
                  zIndex: 99,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  font: '900 44px/1 Arial, sans-serif',
                  letterSpacing: '4px',
                  color: 'rgba(210, 0, 0, 0.16)',
                  border: '7px solid rgba(210, 0, 0, 0.12)',
                  padding: '16px 28px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                SIMULASI / DEMO
              </div>
            )}

            {/* Paging link at the very top, exactly like script: [ >> ] */}
            <div style={{ marginBottom: '2px' }}>
              <a 
                href={`admin_transaksi.php?pemain2=${encodeURIComponent(cfgPemain)}&start=25&end=50&sta=Baru`}
                onClick={(e) => e.preventDefault()}
                style={{
                  fontFamily: 'Verdana, Arial, sans-serif',
                  fontSize: '11px',
                  color: '#0000ff',
                  textDecoration: 'underline',
                  fontWeight: 'normal'
                }}
              >
                [ &gt;&gt; ]
              </a>
            </div>

            {/* Title Header: Transaksi Pemain : saif */}
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
                value={cfgPemain}
                onChange={e => setCfgPemain(e.target.value)}
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#0000cc',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  minWidth: '60px',
                  width: `${Math.max(cfgPemain.length * 7.5, 50)}px`,
                  padding: '0 2px'
                }}
              />
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

            {/* Main Table following user table script structure */}
            <table
              width="100%"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Verdana, Arial, sans-serif',
                fontSize: '11px',
                lineHeight: '14px'
              }}
            >
              <tbody>
                {/* Header Row (bgcolor="#F5E363") */}
                <tr style={{ backgroundColor: '#F5E363' }}>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>No</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Periode</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Tanggal</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Keterangan</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Status</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Debet</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Kredit</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Saldo</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Via</b></span>
                  </td>
                </tr>

                {/* Subheader: Last Balance Row (bgcolor="#FFDBB7") */}
                <tr style={{ backgroundColor: '#FFDBB7' }}>
                  <td align="center" colSpan={5} style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>&nbsp;</b></span>
                  </td>
                  <td align="center" colSpan={2} style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>Last Balance</b></span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#0000FF', fontFamily: 'Verdana, Arial, sans-serif' }}>
                      <b>
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
                            fontWeight: 'bold',
                            fontFamily: 'Verdana, Arial, sans-serif',
                            fontSize: '11px'
                          }}
                        />
                      </b>
                    </span>
                  </td>
                  <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                    <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}><b>&nbsp;</b></span>
                  </td>
                </tr>

                {/* Dynamic Transaction Rows */}
                {rows.map((row) => {
                  const isSelected = selectedRowId === row.id;
                  const bgColor = row.bgType === 'gray' ? '#EFEFEF' : '#FFDBB7';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(prev => prev === row.id ? null : row.id)}
                      style={{
                        backgroundColor: bgColor,
                        boxShadow: isSelected ? 'inset 0 0 0 2px #1f6feb' : 'none',
                        cursor: 'pointer'
                      }}
                      title="Klik untuk memilih dan mengedit baris ini"
                    >
                      {/* No */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.no}
                            onChange={e => handleCellChange(row.id, 'no', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '24px', fontSize: '11px' }}
                          />
                        </span>
                      </td>

                      {/* Periode (Bisa diubah: e.g. 1080 - SGEO, 1511 - SYEO) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.periode}
                            onChange={e => handleCellChange(row.id, 'periode', e.target.value)}
                            placeholder=""
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              outline: 'none', 
                              textAlign: 'center', 
                              width: '105px', 
                              fontSize: '11px',
                              color: '#000000',
                              fontWeight: 'normal',
                              fontFamily: 'Verdana, Arial, sans-serif'
                            }}
                          />
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.tanggal}
                            onChange={e => handleCellChange(row.id, 'tanggal', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '135px', fontSize: '11px' }}
                          />
                        </span>
                      </td>

                      {/* Keterangan (with link style if applicable) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          {row.hasLink ? (
                            <span style={{ color: '#0000ff', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <input
                                type="text"
                                value={row.keterangan}
                                onChange={e => handleCellChange(row.id, 'keterangan', e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  textAlign: 'center',
                                  color: '#0000ff',
                                  textDecoration: 'underline',
                                  fontSize: '11px',
                                  width: '210px'
                                }}
                              />
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={row.keterangan}
                              onChange={e => handleCellChange(row.id, 'keterangan', e.target.value)}
                              style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '150px', fontSize: '11px' }}
                            />
                          )}
                        </span>
                      </td>

                      {/* Status (Red text color) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: 'red', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.status}
                            onChange={e => handleCellChange(row.id, 'status', e.target.value)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              textAlign: 'center',
                              width: '75px',
                              color: 'red',
                              fontWeight: 'normal',
                              fontSize: '11px'
                            }}
                          />
                        </span>
                      </td>

                      {/* Debet (Black text) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.debet}
                            onChange={e => handleCellChange(row.id, 'debet', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '80px', fontSize: '11px' }}
                          />
                        </span>
                      </td>

                      {/* Kredit (Blue text) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#0000FF', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.kredit}
                            onChange={e => handleCellChange(row.id, 'kredit', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '80px', color: '#0000FF', fontSize: '11px' }}
                          />
                        </span>
                      </td>

                      {/* Saldo (Blue text) */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#0000FF', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.saldo}
                            onChange={e => handleCellChange(row.id, 'saldo', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '85px', color: '#0000FF', fontSize: '11px' }}
                          />
                        </span>
                      </td>

                      {/* Via */}
                      <td align="center" style={{ padding: '3px 4px', border: '1px solid #ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Verdana, Arial, sans-serif' }}>
                          <input
                            type="text"
                            value={row.via}
                            onChange={e => handleCellChange(row.id, 'via', e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', width: '55px', fontSize: '11px' }}
                          />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: RAW HTML CODE VIEW */}
      {activeTab === 'HTML_CODE' && (
        <div className="p-4 bg-[#0a0f18] border border-cyan-500/30 rounded-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Kode Script HTML &lt;table&gt; Siap Dipakai
            </span>
            <button
              type="button"
              onClick={handleCopyHtmlScript}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHtmlStatus ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHtmlStatus ? 'Berhasil Tersalin!' : 'Salin Kode Script'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#050811] border border-white/10 text-xs text-emerald-400 overflow-x-auto max-h-[450px] select-all whitespace-pre-wrap">
            {generateRawHtmlScript()}
          </pre>
        </div>
      )}
    </div>
  );
};
