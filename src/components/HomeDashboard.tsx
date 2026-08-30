import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  LayoutGrid, 
  Layers, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Bot, 
  FileSpreadsheet, 
  WalletCards, 
  Repeat, 
  LineChart, 
  Award, 
  CheckSquare, 
  ShieldAlert, 
  FileText, 
  Calculator, 
  Gift, 
  Dices, 
  CreditCard, 
  UserCheck, 
  Lock, 
  MessageSquareText, 
  Headphones, 
  Trophy, 
  Gamepad2, 
  Flame, 
  SearchCheck, 
  FileBadge 
} from 'lucide-react';
import { DASHBOARD_MODULE_CARDS } from '../data/initialData';
import { ActiveView } from './Sidebar';

interface HomeDashboardProps {
  onNavigate: (view: ActiveView) => void;
  shiftName: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, shiftName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'SEMUA MENU', count: DASHBOARD_MODULE_CARDS.length },
    { id: 'KASIR', label: 'KASIR & REKAPAN', count: DASHBOARD_MODULE_CARDS.filter(c => c.category === 'KASIR').length },
    { id: 'CS', label: 'CUSTOMER SERVICE', count: DASHBOARD_MODULE_CARDS.filter(c => c.category === 'CS').length },
    { id: 'PRODUK', label: 'INFO PRODUK & GAMES', count: DASHBOARD_MODULE_CARDS.filter(c => c.category === 'PRODUK').length },
    { id: 'SISTEM', label: 'UTILITAS & CEK SISTEM', count: DASHBOARD_MODULE_CARDS.filter(c => c.category === 'SISTEM').length },
  ];

  const quickPills = [
    { label: 'AI INTELEGENCY', view: 'ai-intelegency' as ActiveView },
    { label: 'CEK STATUS NAWALA', view: 'nawala-checker' as ActiveView },
    { label: 'GENERATE ARTIKEL', view: 'generate-artikel' as ActiveView },
    { label: 'BBFS & ANGKA TARUNG', view: 'bbfs-angka-tarung' as ActiveView },
    { label: 'KALKULATOR PARLAY', view: 'kalkulator-parlay' as ActiveView },
    { label: 'HITUNG TOP-UP', view: 'wd-auto-flop' as ActiveView },
    { label: 'HITUNG WD', view: 'wd-auto-flop' as ActiveView },
    { label: 'AUTO WD FLOP', view: 'wd-auto-flop' as ActiveView },
    { label: 'DEPOSIT MANUAL', view: 'edit-pembayaran' as ActiveView },
    { label: 'SALDO WD', view: 'info-wd' as ActiveView },
    { label: 'TEMPLATE MEMO', view: 'sc-memo' as ActiveView }
  ];

  const filteredCards = useMemo(() => {
    return DASHBOARD_MODULE_CARDS.filter(card => {
      const matchCat = selectedCategory === 'ALL' || card.category === selectedCategory;
      const matchSearch = 
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const renderIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-amber-400" };
    switch (iconName) {
      case 'ArrowDownToLine': return <ArrowDownToLine {...props} className="w-5 h-5 text-emerald-400" />;
      case 'ArrowUpFromLine': return <ArrowUpFromLine {...props} className="w-5 h-5 text-amber-400" />;
      case 'Bot': return <Bot {...props} className="w-5 h-5 text-cyan-400" />;
      case 'FileSpreadsheet': return <FileSpreadsheet {...props} className="w-5 h-5 text-emerald-400" />;
      case 'WalletCards': return <WalletCards {...props} className="w-5 h-5 text-amber-400" />;
      case 'Repeat': return <Repeat {...props} className="w-5 h-5 text-cyan-400" />;
      case 'LineChart': return <LineChart {...props} className="w-5 h-5 text-amber-400" />;
      case 'Award': return <Award {...props} className="w-5 h-5 text-yellow-400" />;
      case 'CheckSquare': return <CheckSquare {...props} className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert {...props} className="w-5 h-5 text-rose-400" />;
      case 'FileText': return <FileText {...props} className="w-5 h-5 text-cyan-400" />;
      case 'Calculator': return <Calculator {...props} className="w-5 h-5 text-amber-400" />;
      case 'Dices': return <Dices {...props} className="w-5 h-5 text-yellow-400" />;
      case 'Gift': return <Gift {...props} className="w-5 h-5 text-purple-400" />;
      case 'CreditCard': return <CreditCard {...props} className="w-5 h-5 text-cyan-400" />;
      case 'UserCheck': return <UserCheck {...props} className="w-5 h-5 text-cyan-400" />;
      case 'Lock': return <Lock {...props} className="w-5 h-5 text-amber-400" />;
      case 'MessageSquareText': return <MessageSquareText {...props} className="w-5 h-5 text-cyan-400" />;
      case 'Headphones': return <Headphones {...props} className="w-5 h-5 text-cyan-400" />;
      case 'Trophy': return <Trophy {...props} className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles {...props} className="w-5 h-5 text-yellow-400" />;
      case 'Gamepad2': return <Gamepad2 {...props} className="w-5 h-5 text-purple-400" />;
      case 'Flame': return <Flame {...props} className="w-5 h-5 text-rose-400" />;
      case 'SearchCheck': return <SearchCheck {...props} className="w-5 h-5 text-amber-400" />;
      case 'FileBadge': return <FileBadge {...props} className="w-5 h-5 text-cyan-400" />;
      default: return <Sparkles {...props} />;
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'BARU':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'UTAMA':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'POPULER':
        return 'bg-[#00F3FF22] text-[#00F3FF] border-[#00F3FF44]';
      default:
        return 'bg-[#1A1A1A] text-gray-400 border-[#1F1F1F]';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Main Banner Card (Sleek Interface with Translucent Glass) */}
      <div className="relative rounded-3xl bg-[#121212]/75 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A]/80 border border-yellow-500/50 text-yellow-400 text-[10px] font-bold font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]"></span>
                👑 DON ISKO • HS GROUP 711
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F3FF]/15 border border-[#00F3FF]/30 text-[#00F3FF] text-[10px] font-bold font-mono">
                ⚡ SHIFT {shiftName || 'PAGI'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SISTEM ONLINE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Workstation CS & Kasir Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Semua modul alur kerja Customer Service, Kasir, dan Modul SOP telah dikelompokkan secara terstruktur. Pilih modul di bawah atau gunakan filter pencarian cepat.
            </p>
          </div>

          {/* Search bar in Hero */}
          <div className="w-full lg:w-96 space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F3FF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama modul / fungsi..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#1A1A1A]/80 border border-white/10 focus:border-[#00F3FF] text-xs text-white placeholder-gray-400 outline-none transition-all backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-2 font-mono">
              <span>Total Modul Tersedia:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A]/80 text-[#00F3FF] font-bold border border-white/10">
                {filteredCards.length} Fitur
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Pills Row */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1 mr-1 font-mono">
              ⚡ AKSES CEPAT:
            </span>
            {quickPills.map(pill => (
              <button
                key={pill.label}
                onClick={() => onNavigate(pill.view)}
                className="px-3.5 py-1.5 rounded-full bg-[#1A1A1A]/80 hover:bg-[#222222]/90 text-[#00F3FF] hover:text-white border border-white/10 hover:border-[#00F3FF]/40 text-xs font-semibold transition-all cursor-pointer backdrop-blur-sm shadow-sm"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer backdrop-blur-sm ${
              selectedCategory === cat.id
                ? 'bg-[#1F1F1F]/90 text-[#00F3FF] border border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.2)] font-bold'
                : 'bg-[#1A1A1A]/70 text-gray-300 hover:text-white border border-white/10 hover:border-gray-500'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              selectedCategory === cat.id ? 'bg-[#00F3FF]/20 text-[#00F3FF]' : 'bg-black/40 text-gray-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Modular Cards (Translucent Glass Styling) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map(card => (
          <div
            key={card.id}
            onClick={() => onNavigate(card.actionMenuId as ActiveView)}
            className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#121212]/75 hover:bg-[#181818]/90 backdrop-blur-xl border border-white/10 hover:border-[#00F3FF] shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,243,255,0.2)] transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div>
              {/* Header: Icon & Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#1A1A1A]/80 border border-white/10 group-hover:border-[#00F3FF]/40 text-[#00F3FF] transition-all shadow-inner">
                  {renderIcon(card.icon)}
                </div>
                {card.badge && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${getBadgeStyle(card.badge)}`}>
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Category Label */}
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                {card.categoryLabel}
              </div>

              {/* Card Title */}
              <h3 className="text-base font-bold text-white group-hover:text-[#00F3FF] tracking-tight transition-colors mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-4">
                {card.description}
              </p>
            </div>

            {/* Action Link Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#00F3FF] group-hover:text-[#00F3FF]">
              <span className="group-hover:translate-x-1 transition-transform">
                Buka Modul
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#121212]/75 backdrop-blur-xl border border-white/10">
          <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Modul Tidak Ditemukan</h3>
          <p className="text-xs text-gray-300">
            Coba kata kunci pencarian lain atau pilih kategori Semua Menu.
          </p>
        </div>
      )}
    </div>
  );
};
