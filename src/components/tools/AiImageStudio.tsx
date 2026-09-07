import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Maximize2, 
  Trash2, 
  Layers, 
  ExternalLink,
  Flame,
  Zap,
  Info
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  ratio: string;
  timestamp: number;
}

const STYLE_PRESETS = [
  {
    id: 'banner-promo',
    label: 'Banner Promosi',
    icon: '🎯',
    desc: 'Warna tajam, ruang teks bersih, komersial'
  },
  {
    id: 'luxury-gold',
    label: 'Mewah Emas & Hitam',
    icon: '🌟',
    desc: 'Logam emas 3D, latar hitam elegan'
  },
  {
    id: 'neon-cyberpunk',
    label: 'Neon Cyberpunk',
    icon: '⚡',
    desc: 'Efek cahaya neon menyala, futuristik'
  },
  {
    id: 'vector-logo',
    label: 'Logo & Emblem 711',
    icon: '🛡️',
    desc: 'Maskot vektor tajam, badge esports'
  },
  {
    id: 'realistic',
    label: 'Foto Realistis 8K',
    icon: '📸',
    desc: 'Pencahayaan sinematik detail tinggi'
  }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Persegi', sub: '1024x1024 (Post & Profil)', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9 Banner', sub: '1280x720 (Header & Web)', width: 1280, height: 720 },
  { id: '9:16', label: '9:16 Story', sub: '720x1280 (WA & Reels)', width: 720, height: 1280 }
];

const INSPIRATION_PROMPTS = [
  'Banner promosi slot neon 711 dengan efek emas mewah, kilau koin bertebaran, dan petir futuristik',
  'Logo maskot Don Isko 711 dengan mahkota emas bergaya 3D render mengkilap latar belakang gelap',
  'Desain poster turnamen parlay bola malam hari di stadion megah bertabur lampu sorot dan hologram',
  'Customer Service AI robot wanita ramah melayani member di ruang kontrol futuristik bernuansa cyan neon',
  'Kartu as emas dan chip casino melayang dengan efek api elektrik biru dan teks jackpot 711'
];

export const AiImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('banner-promo');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('don_isko_ai_images_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Save gallery to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('don_isko_ai_images_v1', JSON.stringify(imageHistory.slice(0, 30)));
    } catch (e) {
      console.warn('Gagal menyimpan riwayat gambar:', e);
    }
  }, [imageHistory]);

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt !== undefined ? customPrompt : prompt;
    if (!textToUse.trim() || isGenerating) return;

    setIsGenerating(true);
    const activeRatioObj = ASPECT_RATIOS.find(r => r.id === selectedRatio) || ASPECT_RATIOS[0];

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse.trim(),
          style: selectedStyle,
          width: activeRatioObj.width,
          height: activeRatioObj.height
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP status: ${res.status}`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        const newImg: GeneratedImage = {
          id: `img-${Date.now()}`,
          imageUrl: data.imageUrl,
          prompt: textToUse.trim(),
          style: selectedStyle,
          ratio: selectedRatio,
          timestamp: Date.now()
        };
        setCurrentImage(newImg);
        setImageHistory(prev => [newImg, ...prev.filter(i => i.imageUrl !== newImg.imageUrl)]);
      }
    } catch (err: any) {
      console.error('Image generate error:', err);
      // Fallback direct URL generation
      const seed = Math.floor(Math.random() * 1000000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(textToUse + ', 4k digital art')}?width=${activeRatioObj.width}&height=${activeRatioObj.height}&seed=${seed}&nologo=true`;
      const fallbackImg: GeneratedImage = {
        id: `img-${Date.now()}`,
        imageUrl: fallbackUrl,
        prompt: textToUse.trim(),
        style: selectedStyle,
        ratio: selectedRatio,
        timestamp: Date.now()
      };
      setCurrentImage(fallbackImg);
      setImageHistory(prev => [fallbackImg, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `don_isko_ai_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback open direct
      window.open(img.imageUrl, '_blank');
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageHistory(prev => prev.filter(item => item.id !== id));
    if (currentImage?.id === id) {
      setCurrentImage(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-[#141414] to-[#0A0A0A] p-4 sm:p-6 space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-[#181824] via-[#10121C] to-[#1E1210] p-4 sm:p-5 rounded-2xl border border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-yellow-400 to-[#00F3FF] text-black font-black text-sm shadow-md">
              🎨
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>STUDIO GAMBAR AI (TEXT-TO-IMAGE)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
              100% GRATIS &amp; UNLIMITED
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Ketik deskripsi gambar apa saja (banner promo 711, logo emas, maskot, karakter, poster turnamen) dan AI akan langsung merendernya dalam hitungan detik.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
          <span className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-yellow-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            POLLINATIONS &amp; FLUX CORE
          </span>
        </div>
      </div>

      {/* Input Console & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Configuration & Prompt Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4 bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/10">
          {/* Prompt Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Wand2 className="w-3.5 h-3.5" />
                DESKRIPSI GAMBAR (PROMPT):
              </span>
              <span className="text-[10px] text-gray-500">Bisa Bahasa Indonesia atau Inggris</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Banner promosi slot neon 711 dengan koin emas mewah dan efek petir biru..."
              className="w-full p-3.5 rounded-xl bg-black/80 text-white text-xs sm:text-sm border border-white/15 focus:border-[#00F3FF] focus:shadow-[0_0_15px_rgba(0,243,255,0.25)] outline-none resize-none transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Quick Inspiration Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> CONTOH INSPIRASI PROMPT:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((insp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(insp);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] border border-white/5 transition-all text-left truncate max-w-full"
                  title={insp}
                >
                  💡 {insp.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-bold text-gray-300 font-mono flex items-center gap-1.5">
              <span>GAYA VISUAL (PRESET STYLE):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLE_PRESETS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    selectedStyle === st.id
                      ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                      : 'bg-black/40 hover:bg-black/70 border-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{st.icon}</span>
                    <span className="text-xs font-bold truncate">{st.label}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 line-clamp-1">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-bold text-gray-300 font-mono flex items-center gap-1.5">
              <span>UKURAN RASIO (ASPECT RATIO):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setSelectedRatio(ar.id)}
                  className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${
                    selectedRatio === ar.id
                      ? 'bg-[#00F3FF]/10 border-[#00F3FF] text-[#00F3FF] font-bold shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                      : 'bg-black/40 hover:bg-black/70 border-white/10 text-gray-400'
                  }`}
                >
                  <p className="text-xs font-black">{ar.label}</p>
                  <p className="text-[9px] text-gray-500 font-mono">{ar.id}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={() => handleGenerate()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-[#00F3FF] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all cursor-pointer active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>AI Sedang Merender Gambar (Tunggu Sebentar)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>BUAT GAMBAR SEKARANG (GENERATE IMAGE)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Active Result Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#00F3FF]" />
              HASIL GENERATE GAMBAR
            </h3>
            {currentImage && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                SELESAI
              </span>
            )}
          </div>

          {isGenerating ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center space-y-4 p-6 text-center bg-black/60 rounded-xl border border-dashed border-[#00F3FF]/40 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-[#00F3FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                <RefreshCw className="w-8 h-8 text-black animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white">Memproses Piksel &amp; Pencahayaan AI...</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Model AI sedang memformulasikan komposisi visual sesuai prompt Anda.
                </p>
              </div>
            </div>
          ) : currentImage ? (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="relative group rounded-xl overflow-hidden border border-white/20 bg-black aspect-auto max-h-[360px] flex items-center justify-center">
                <img
                  src={currentImage.imageUrl}
                  alt={currentImage.prompt}
                  className="w-full h-full object-contain rounded-xl"
                  loading="lazy"
                />
                <a
                  href={currentImage.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Lihat Ukuran Penuh"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-gray-300 font-sans italic bg-black/50 p-2.5 rounded-lg border border-white/5 line-clamp-2">
                  &ldquo;{currentImage.prompt}&rdquo;
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(currentImage)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(currentImage.imageUrl, currentImage.id)}
                    className="py-2.5 px-3 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === currentImage.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#00F3FF]" />
                        <span>Salin Tautan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center space-y-3 p-6 text-center bg-black/40 rounded-xl border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                🖼️
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-300">Belum Ada Gambar yang Dibuat</p>
                <p className="text-[11px] text-gray-500 max-w-xs">
                  Pilih salah satu contoh inspirasi atau ketik ide gambar Anda pada kolom di sebelah kiri, lalu klik Generate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery of Previously Generated Images */}
      {imageHistory.length > 0 && (
        <div className="space-y-3 bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-black text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-400" />
              <span>GALERI RIWAYAT GAMBAR ({imageHistory.length})</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Tersimpan di browser lokal Anda</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {imageHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentImage(item)}
                className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all aspect-square bg-black ${
                  currentImage?.id === item.id
                    ? 'border-[#00F3FF] shadow-[0_0_12px_rgba(0,243,255,0.3)] ring-1 ring-[#00F3FF]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[9px] text-white line-clamp-2 leading-tight font-sans">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="p-1 rounded bg-black/60 hover:bg-emerald-500 text-white hover:text-black transition-colors"
                      title="Unduh"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                      className="p-1 rounded bg-black/60 hover:bg-red-500 text-white transition-colors"
                      title="Hapus dari Galeri"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
