import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Headphones, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { INITIAL_MODUL_BELAJAR } from '../../data/initialData';
import { ModulItem } from '../../types';

interface ModulBelajarProps {
  initialModuleId?: string;
  initialCategory?: string;
}

export const ModulBelajar: React.FC<ModulBelajarProps> = ({ initialModuleId, initialCategory }) => {
  const [modules, setModules] = useState<ModulItem[]>(INITIAL_MODUL_BELAJAR);
  const [selectedModule, setSelectedModule] = useState<ModulItem>(() => {
    if (initialModuleId) {
      const found = INITIAL_MODUL_BELAJAR.find(m => m.id === initialModuleId);
      if (found) return found;
    }
    if (initialCategory) {
      const found = INITIAL_MODUL_BELAJAR.find(m => m.category.toLowerCase().includes(initialCategory.toLowerCase()));
      if (found) return found;
    }
    return INITIAL_MODUL_BELAJAR[0];
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = modules.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#121212] border border-[#1F1F1F] shadow-[0_4px_24px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00F3FF22] text-[#00F3FF] text-[10px] font-bold font-mono border border-[#00F3FF44]">
              KNOWLEDGE BASE & TRAINING
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Standar Operasional Prosedur (SOP)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
            Modul Belajar CS / Kasir
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Materi pelatihan lengkap prosedur customer care, penanganan transaksi deposit/withdraw, dan regulasi keamanan akun.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Module List */}
        <div className="lg:col-span-1 p-5 rounded-3xl bg-[#121212] border border-[#1F1F1F] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F3FF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari modul SOP..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-[#1A1A1A] border border-[#1F1F1F] text-xs text-white placeholder-gray-500 outline-none focus:border-[#00F3FF]"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedModule(m)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  selectedModule?.id === m.id
                    ? 'bg-[#1F1F1F] border-[#00F3FF] text-[#00F3FF] shadow-[0_0_10px_rgba(0,243,255,0.15)]'
                    : 'bg-[#1A1A1A] border-[#1F1F1F] text-gray-300 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121212] text-yellow-400 border border-[#1F1F1F]">
                      {m.category}
                    </span>
                    <span className="text-[10px] text-gray-500">{m.readTime}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{m.title}</h4>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedModule?.id === m.id ? 'translate-x-1 text-[#00F3FF]' : 'text-gray-600'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Article Reader */}
        {selectedModule && (
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#121212] border border-[#1F1F1F] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00F3FF22] text-[#00F3FF] text-xs font-bold font-mono border border-[#00F3FF44]">
                  {selectedModule.category}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                  {selectedModule.title}
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">{selectedModule.readTime}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#1F1F1F] text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
              {selectedModule.content}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                SOP Resmi Operasional Wajib Dipatuhi Semua Staff CS & Kasir
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
