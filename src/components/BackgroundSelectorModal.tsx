import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Upload, Link, Sparkles } from 'lucide-react';
import { PRESET_BACKGROUNDS } from '../data/initialData';

interface BackgroundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl: string;
  onSelectBgUrl: (url: string) => void;
}

export const BackgroundSelectorModal: React.FC<BackgroundSelectorModalProps> = ({
  isOpen,
  onClose,
  currentBgUrl,
  onSelectBgUrl
}) => {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectBgUrl(customUrl.trim());
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onSelectBgUrl(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Pengaturan Background / Wallpaper Dashboard
              </h3>
              <p className="text-xs text-slate-400">
                Pilih tema tampilan kasino/game atau tempel gambar wallpaper kustom sendiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Wallpapers */}
        <div className="my-5">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Pilihan Tema Preset (HD Game & Neon)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRESET_BACKGROUNDS.map(bg => (
              <div
                key={bg.id}
                onClick={() => {
                  onSelectBgUrl(bg.url);
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden border-2 p-3 cursor-pointer transition-all ${
                  currentBgUrl === bg.url
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-cyan-950/30'
                    : 'border-zinc-800 hover:border-cyan-500/50 bg-zinc-900/60'
                }`}
              >
                <div className="h-28 rounded-xl overflow-hidden mb-2.5 relative bg-zinc-950">
                  <img
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {currentBgUrl === bg.url && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-cyan-500 text-black font-bold shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  {bg.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {bg.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom URL Input & File Upload */}
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-cyan-400" />
              <span>Tempel Link Gambar Background Sendiri (URL)</span>
            </label>
            <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://contoh.com/wallpaper-kustom.jpg"
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                Terapkan URL
              </button>
            </form>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Gambar dari Komputer / HP</span>
            </label>
            <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-900/40 hover:bg-zinc-900 text-xs text-slate-300 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Pilih file gambar (JPG, PNG, WebP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
