import React, { useState, useMemo } from 'react';
import { 
  Dices, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Filter,
  Flame
} from 'lucide-react';

export const BbfsGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BBFS' | 'TARUNG'>('BBFS');

  // BBFS states
  const [bbfsInput, setBbfsInput] = useState<string>('0125789');
  const [include4D, setInclude4D] = useState(true);
  const [include3D, setInclude3D] = useState(true);
  const [include2D, setInclude2D] = useState(true);
  const [allowTwin, setAllowTwin] = useState(false);
  const [copiedBbfs, setCopiedBbfs] = useState(false);

  // Angka Tarung states
  const [asInput, setAsInput] = useState('123');
  const [kopInput, setKopInput] = useState('456');
  const [kepalaInput, setKepalaInput] = useState('789');
  const [ekorInput, setEkorInput] = useState('012');
  const [tarungMode, setTarungMode] = useState<'4D' | '3D' | '2D'>('4D');
  const [copiedTarung, setCopiedTarung] = useState(false);

  // Generate BBFS Combinations
  const bbfsResult = useMemo(() => {
    const rawDigits = bbfsInput.replace(/\D/g, '').split('');
    const uniqueDigits: string[] = Array.from(new Set<string>(rawDigits));

    if (uniqueDigits.length < 2) return { d4: [], d3: [], d2: [], total: 0 };

    const getPermutations = (arr: string[], length: number): string[] => {
      const results: string[] = [];
      const permute = (current: string[], remaining: string[]) => {
        if (current.length === length) {
          results.push(current.join(''));
          return;
        }
        for (let i = 0; i < remaining.length; i++) {
          permute([...current, remaining[i]], remaining.filter((_, idx) => idx !== i));
        }
      };
      permute([], arr);
      return Array.from(new Set(results));
    };

    const d4 = include4D && uniqueDigits.length >= 4 ? getPermutations(uniqueDigits, 4) : [];
    const d3 = include3D && uniqueDigits.length >= 3 ? getPermutations(uniqueDigits, 3) : [];
    const d2 = include2D && uniqueDigits.length >= 2 ? getPermutations(uniqueDigits, 2) : [];

    return {
      d4,
      d3,
      d2,
      total: d4.length + d3.length + d2.length
    };
  }, [bbfsInput, include4D, include3D, include2D]);

  // Generate Angka Tarung
  const tarungResult = useMemo(() => {
    const asList = asInput.replace(/\D/g, '').split('');
    const kopList = kopInput.replace(/\D/g, '').split('');
    const kepList = kepalaInput.replace(/\D/g, '').split('');
    const ekorList = ekorInput.replace(/\D/g, '').split('');

    const results: string[] = [];

    if (tarungMode === '4D') {
      asList.forEach(a => {
        kopList.forEach(k => {
          kepList.forEach(kep => {
            ekorList.forEach(e => {
              results.push(`${a}${k}${kep}${e}`);
            });
          });
        });
      });
    } else if (tarungMode === '3D') {
      kopList.forEach(k => {
        kepList.forEach(kep => {
          ekorList.forEach(e => {
            results.push(`${k}${kep}${e}`);
          });
        });
      });
    } else {
      // 2D: Kepala vs Ekor
      kepList.forEach(kep => {
        ekorList.forEach(e => {
          results.push(`${kep}${e}`);
        });
      });
    }

    return Array.from(new Set(results));
  }, [asInput, kopInput, kepalaInput, ekorInput, tarungMode]);

  const handleCopyBbfs = () => {
    const all = [...bbfsResult.d4, ...bbfsResult.d3, ...bbfsResult.d2].join('*');
    if (!all) return;
    navigator.clipboard.writeText(all);
    setCopiedBbfs(true);
    setTimeout(() => setCopiedBbfs(false), 2000);
  };

  const handleCopyTarung = () => {
    const text = tarungResult.join('*');
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTarung(true);
    setTimeout(() => setCopiedTarung(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono border border-amber-500/40">
              TOGEL ENGINE TOOL
            </span>
            <span className="text-xs text-slate-400 font-mono">
              BBFS Combinations & Angka Tarung Generator
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            BBFS & Angka Tarung Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bantu player menghasilkan kombinasi bolak-balik 4D/3D/2D dan tarung As-Kop-Kepala-Ekor siap paste bet.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('BBFS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BBFS'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>BBFS GENERATOR</span>
          </button>
          <button
            onClick={() => setActiveTab('TARUNG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TARUNG'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>ANGKA TARUNG</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BBFS GENERATOR */}
      {activeTab === 'BBFS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Controls */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
              Input Angka BBFS
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Masukkan Angka Main (Maks 10 Digit)
              </label>
              <input
                type="text"
                maxLength={10}
                value={bbfsInput}
                onChange={e => setBbfsInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 1234567"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-lg text-cyan-300 font-bold outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {bbfsInput.length} digit unik terdeteksi
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="block text-[11px] font-semibold text-slate-300">
                Pilih Target Kombinasi:
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={include4D}
                  onChange={e => setInclude4D(e.target.checked)}
                  className="rounded text-cyan-500 bg-zinc-900 border-zinc-700"
                />
                <span>Generate 4D ({bbfsResult.d4.length} Line)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={include3D}
                  onChange={e => setInclude3D(e.target.checked)}
                  className="rounded text-cyan-500 bg-zinc-900 border-zinc-700"
                />
                <span>Generate 3D ({bbfsResult.d3.length} Line)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={include2D}
                  onChange={e => setInclude2D(e.target.checked)}
                  className="rounded text-cyan-500 bg-zinc-900 border-zinc-700"
                />
                <span>Generate 2D ({bbfsResult.d2.length} Line)</span>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">Total Kombinasi:</span>
              <span className="text-base font-bold font-mono text-amber-300">
                {bbfsResult.total} Line
              </span>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Hasil Kombinasi BBFS (Pemisah Bintang *)
                </span>
                <button
                  onClick={handleCopyBbfs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedBbfs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBbfs ? 'Tersalin!' : 'Copy Semua Line'}</span>
                </button>
              </div>

              {/* 4D Box */}
              {include4D && bbfsResult.d4.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 mb-1">
                    [4D - {bbfsResult.d4.length} Line]:
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-slate-300 max-h-32 overflow-y-auto leading-relaxed break-all">
                    {bbfsResult.d4.join(' * ')}
                  </div>
                </div>
              )}

              {/* 3D Box */}
              {include3D && bbfsResult.d3.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-amber-400 mb-1">
                    [3D - {bbfsResult.d3.length} Line]:
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-slate-300 max-h-32 overflow-y-auto leading-relaxed break-all">
                    {bbfsResult.d3.join(' * ')}
                  </div>
                </div>
              )}

              {/* 2D Box */}
              {include2D && bbfsResult.d2.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 mb-1">
                    [2D - {bbfsResult.d2.length} Line]:
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-slate-300 max-h-32 overflow-y-auto leading-relaxed break-all">
                    {bbfsResult.d2.join(' * ')}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 border-t border-zinc-800 pt-2 flex justify-between">
              <span>Format output kompatibel langsung untuk bet panel agen togel.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANGKA TARUNG */}
      {activeTab === 'TARUNG' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Tarung Inputs */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
              Setup Posisi Angka Tarung
            </div>

            <div className="flex gap-2">
              {(['4D', '3D', '2D'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setTarungMode(mode)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    tarungMode === mode
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Mode {mode}
                </button>
              ))}
            </div>

            {tarungMode === '4D' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Posisi AS
                </label>
                <input
                  type="text"
                  value={asInput}
                  onChange={e => setAsInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-cyan-300 font-bold outline-none"
                />
              </div>
            )}

            {(tarungMode === '4D' || tarungMode === '3D') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Posisi KOP
                </label>
                <input
                  type="text"
                  value={kopInput}
                  onChange={e => setKopInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-amber-300 font-bold outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Posisi KEPALA
              </label>
              <input
                type="text"
                value={kepalaInput}
                onChange={e => setKepalaInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-purple-300 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Posisi EKOR
              </label>
              <input
                type="text"
                value={ekorInput}
                onChange={e => setEkorInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-emerald-300 font-bold outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">Hasil Line:</span>
              <span className="text-base font-bold font-mono text-amber-300">
                {tarungResult.length} Line
              </span>
            </div>
          </div>

          {/* Tarung Output */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Hasil Kombinasi Angka Tarung ({tarungMode} - {tarungResult.length} Line)
                </span>
                <button
                  onClick={handleCopyTarung}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedTarung ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTarung ? 'Tersalin!' : 'Copy Line Tarung'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-slate-200 max-h-72 overflow-y-auto leading-relaxed break-all">
                {tarungResult.join(' * ')}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-zinc-800">
              Format standard pemisah bintang (*) langsung dapat diinput ke form betting massal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
