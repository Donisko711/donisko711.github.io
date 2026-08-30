import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Send,
  Save,
  Tag
} from 'lucide-react';
import { ScriptChatItem } from '../../types';
import { INITIAL_SC_MEMO } from '../../data/initialData';

export const ScriptChatMemo: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptChatItem[]>(() => 
    INITIAL_SC_MEMO.map(s => ({
      id: s.id,
      title: s.title,
      category: s.category.toUpperCase(),
      shortcut: `/memo_${s.id}`,
      content: s.content
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('DEPOSIT');
  const [formShortcut, setFormShortcut] = useState('');
  const [formContent, setFormContent] = useState('');

  const categories = ['ALL', 'DEPOSIT', 'WITHDRAW', 'BONUS', 'AKUN', 'UMUM'];

  const filteredScripts = scripts.filter(s => {
    const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.shortcut && s.shortcut.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('DEPOSIT');
    setFormShortcut('/memo_');
    setFormContent('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (script: ScriptChatItem) => {
    setEditingId(script.id);
    setFormTitle(script.title);
    setFormCategory(script.category);
    setFormShortcut(script.shortcut || '');
    setFormContent(script.content);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus script memo ini?')) {
      setScripts(scripts.filter(s => s.id !== id));
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    if (editingId) {
      setScripts(
        scripts.map(s =>
          s.id === editingId
            ? {
                ...s,
                title: formTitle,
                category: formCategory,
                shortcut: formShortcut,
                content: formContent
              }
            : s
        )
      );
    } else {
      const newScript: ScriptChatItem = {
        id: `memo-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        shortcut: formShortcut || `/memo_${Date.now()}`,
        content: formContent
      };
      setScripts([newScript, ...scripts]);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              INTERNAL & TICKET SCRIPTS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Template Balasan Memo / Pesan Internal
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Script Chat MEMO (CS & Kasir)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar template memo resmi untuk merespon pertanyaan tiket saldo, perbankan, dan keluhan player.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Template Memo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e131b]/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari judul memo / shortcut..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <form onSubmit={handleSaveForm} className="p-5 rounded-2xl bg-zinc-900/95 border border-cyan-500/50 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> {editingId ? 'Edit Template Script Memo' : 'Tambah Script Memo Baru'}
            </span>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs text-slate-400 hover:text-white">
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Judul / Case Memo</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Contoh: Balasan Deposit Mutasi Lambat"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Kategori</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-cyan-300 font-bold outline-none"
              >
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="WITHDRAW">WITHDRAW</option>
                <option value="BONUS">BONUS</option>
                <option value="AKUN">AKUN</option>
                <option value="UMUM">UMUM</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Shortcut Singkatan</label>
              <input
                type="text"
                value={formShortcut}
                onChange={e => setFormShortcut(e.target.value)}
                placeholder="/memo_gangguan"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-xs text-amber-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Isi Pesan / Template Respon</label>
            <textarea
              rows={5}
              required
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Ketik isi template memo disini..."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-slate-200 leading-relaxed outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Script</span>
            </button>
          </div>
        </form>
      )}

      {/* Script Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScripts.map(script => (
          <div
            key={script.id}
            className="p-5 rounded-2xl bg-[#0e131b]/90 border border-zinc-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-500/40">
                    {script.category}
                  </span>
                  {script.shortcut && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {script.shortcut}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(script)}
                    title="Edit Script"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(script.id)}
                    title="Hapus Script"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">{script.title}</h4>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {script.content}
              </div>
            </div>

            <button
              onClick={() => handleCopy(script.id, script.content)}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedId === script.id
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-zinc-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {copiedId === script.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === script.id ? 'Script Tersalin!' : 'Copy Script Memo'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
