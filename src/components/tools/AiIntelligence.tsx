import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Plus, 
  MessageSquare, 
  Zap, 
  StopCircle, 
  Settings2, 
  ShieldCheck, 
  Calculator, 
  Code2, 
  BookOpen, 
  Share2, 
  ChevronRight, 
  Clock, 
  Volume2, 
  ThumbsUp, 
  ThumbsDown,
  Layers,
  ArrowDown,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import donIskoLogo from '../../assets/images/don_isko_711_1788035559676.jpg';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  status?: 'streaming' | 'complete' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
  persona: string;
}

const PERSONAS = [
  {
    id: 'general',
    name: 'Gemini General Assistant',
    badge: 'ALL-ROUND',
    desc: 'Tanya apa saja seperti ChatGPT / Ask Gemini: wawasan umum, riset, sains, teknologi, dan pemecahan masalah.',
    systemPrompt: 'Anda adalah asisten AI serbaguna dan cerdas. Jawab pertanyaan pengguna secara akurat, terstruktur, mendalam, dan santun dalam Bahasa Indonesia.'
  },
  {
    id: 'cs-expert',
    name: 'SOP CS & Kasir 711',
    badge: 'OPERASIONAL',
    desc: 'Keahlian khusus operasional HS GROUP 711: SOP LiveChat, respon komplain, analisa mutasi, dan etika komunikasi.',
    systemPrompt: 'Anda adalah Supervisor Senior CS & Kasir HS GROUP 711. Berikan respon, draft balasan LiveChat, panduan penanganan dispute transaksi, dan SOP resmi dengan bahasa ramah dan solutif.'
  },
  {
    id: 'copywriter',
    name: 'Promo & Copywriting AI',
    badge: 'KREATIF',
    desc: 'Pembuat artikel SEO, kata-kata promosi menarik, broadcast WhatsApp, dan caption media sosial.',
    systemPrompt: 'Anda adalah Copywriter dan Digital Marketer profesional. Buatkan teks promosi, artikel SEO, dan kalimat broadcast yang persuasif, berenergi, dan menarik.'
  },
  {
    id: 'math-analyst',
    name: 'Kalkulasi & Analisis Data',
    badge: 'LOGIKA & ANGKA',
    desc: 'Hitung rumus turnover (TO), odds parlay, persentase bonus, dan simulasi probabilitas matematika.',
    systemPrompt: 'Anda adalah analis angka dan kalkulasi. Berikan perhitungan langkah demi langkah yang teliti, rumus yang jelas, dan hasil akhir yang akurat.'
  },
  {
    id: 'code-it',
    name: 'IT & Technical Assistant',
    badge: 'TEKNIKAL',
    desc: 'Bantuan teknis DNS, troubleshooting jaringan, pemblokiran Nawala, web development, dan scripting.',
    systemPrompt: 'Anda adalah Senior IT Engineer. Berikan solusi teknis, konfigurasi DNS, troubleshooting domain, dan penjelasan kode secara rapi dan profesional.'
  }
];

const SUGGESTED_PROMPTS = [
  {
    icon: '💬',
    title: 'Balas Komplain Deposit Pending',
    prompt: 'Buatkan respon LiveChat yang ramah untuk member yang komplain deposit BCA Rp 500.000 belum masuk karena gangguan mutasi perbankan.'
  },
  {
    icon: '🧮',
    title: 'Hitung Syarat Turnover (TO)',
    prompt: 'Bagaimana rumus dan cara menghitung Turnover (TO) jika member depo Rp 100.000 + bonus 100% dengan syarat TO x18 di game slot?'
  },
  {
    icon: '🛡️',
    title: 'Ciri-Ciri Akun Bonus Hunter',
    prompt: 'Jelaskan indikasi akun yang dicurigai sebagai sindikat bonus hunter atau kesamaan IP, serta langkah mitigasi bagi kasir & CS.'
  },
  {
    icon: '🌐',
    title: 'Cara Kerja DNS & Buka Blokir',
    prompt: 'Jelaskan secara sederhana bagaimana cara kerja DNS 1.1.1.1 Cloudflare untuk mengatasi domain yang terkena Internet Positif / Nawala.'
  },
  {
    icon: '✍️',
    title: 'Buat Artikel Promo Slot Gacor',
    prompt: 'Tuliskan artikel promosi 300 kata tentang event bonus slot scatter harian HS GROUP 711 dengan gaya bahasa menarik dan SEO friendly.'
  },
  {
    icon: '⚡',
    title: 'Tanya Apa Saja Bebas',
    prompt: 'Jelaskan apa itu Artificial Intelligence dan bagaimana model AI generasi terbaru membantu produktivitas kerja sehari-hari.'
  }
];

export const AiIntelligence: React.FC = () => {
  // Chat Sessions Storage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('don_isko_ai_sessions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'session-default',
        title: 'Percakapan Baru',
        createdAt: Date.now(),
        persona: 'general',
        messages: [
          {
            id: 'msg-welcome',
            role: 'model',
            content: `### Halo! Saya DON ISKO AI INTELLIGENCE ⚡
Asisten kecerdasan buatan terintegrasi HS GROUP 711 yang bekerja layaknya **Ask Gemini** & **ChatGPT**.

Saya dapat membantu Anda dalam:
- 💡 **Menjawab Segala Pertanyaan Umum, Sains, & Teknologi**
- 💬 **Menyusun Template Respon LiveChat & CS Handover**
- 🛡️ **Menganalisis Kasus Dispute Transaksi & Indikasi Fraud**
- 🧮 **Menghitung Rumus Matematika, Odds Parlay, & Turnover (TO)**
- ✍️ **Membuat Artikel SEO, Broadcast WhatsApp, & Copywriting**

*Silakan ketik pertanyaan apapun di bawah atau pilih topik prompt yang tersedia!*`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-default');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('general');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('don_isko_ai_sessions_v1', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save chat sessions to localStorage:', e);
    }
  }, [sessions]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isGenerating]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Adjust textarea height automatically
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Create a new chat session
  const handleCreateNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'Percakapan Baru',
      createdAt: Date.now(),
      persona: selectedPersona,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          content: 'Halo! Ada yang bisa saya bantu untuk tugas atau pertanyaan Anda saat ini? Silakan tanyakan apa saja.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setInputPrompt('');
  };

  // Delete chat session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If deleting last session, reset to fresh one
      const freshId = `session-${Date.now()}`;
      setSessions([
        {
          id: freshId,
          title: 'Percakapan Baru',
          createdAt: Date.now(),
          persona: 'general',
          messages: []
        }
      ]);
      setActiveSessionId(freshId);
      return;
    }

    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0]?.id || '');
    }
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  // Send message to AI via Server SSE Stream
  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = textToSend !== undefined ? textToSend : inputPrompt;
    const content = rawContent.trim();
    if (!content || isGenerating) return;

    const userMessageId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: userTimestamp,
      status: 'complete'
    };

    // Update active session with user message & auto-generate title from first prompt
    const updatedMessages = [...(activeSession?.messages || []), newUserMessage];
    const sessionTitle = activeSession.messages.filter(m => m.role === 'user').length === 0
      ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
      : activeSession.title;

    const aiMessageId = `ai-${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'streaming'
    };

    const currentPersona = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0];

    // Append user message + empty AI message placeholder
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: sessionTitle,
            messages: [...updatedMessages, aiPlaceholder]
          };
        }
        return s;
      })
    );

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Prepare payload for backend API
      const historyPayload = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: historyPayload,
          systemPrompt: currentPersona.systemPrompt,
          modelName: 'gemini-3.7-flash'
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                setSessions(prev =>
                  prev.map(s => {
                    if (s.id === activeSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map(m =>
                          m.id === aiMessageId ? { ...m, content: accumulatedText } : m
                        )
                      };
                    }
                    return s;
                  })
                );
              }
              if (data.error) {
                accumulatedText += `\n\n*(Error: ${data.error})*`;
              }
            } catch {
              // ignore json parse chunk errors
            }
          }
        }
      }

      // Mark completed
      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === aiMessageId ? { ...m, status: 'complete' } : m
              )
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked stop generating
        setSessions(prev =>
          prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map(m =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + '\n\n*(Proses pembuatan dihentikan)*', status: 'complete' }
                    : m
                )
              };
            }
            return s;
          })
        );
      } else {
        console.error('Chat error:', err);
        const fallbackText = `⚠️ Terjadi kendala saat menghubungkan ke server AI: ${err.message || 'Koneksi gagal'}. Silakan coba kirim ulang pertanyaan Anda.`;
        setSessions(prev =>
          prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map(m =>
                  m.id === aiMessageId
                    ? { ...m, content: fallbackText, status: 'error' }
                    : m
                )
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Copy message text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-to-Speech playback
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_~]/g, ''));
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (isGenerating || !activeSession || activeSession.messages.length < 2) return;
    const lastUserMsg = [...activeSession.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove last AI message and resend
      const filtered = activeSession.messages.filter(m => m.id !== activeSession.messages[activeSession.messages.length - 1].id);
      setSessions(prev =>
        prev.map(s => (s.id === activeSessionId ? { ...s, messages: filtered } : s))
      );
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row rounded-3xl bg-[#121212]/80 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR: SESSIONS & PERSONA (ChatGPT Style Drawer)  */}
      {/* ========================================================= */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-72 lg:w-80' : 'hidden md:flex md:w-0'
        } transition-all duration-300 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#101010]/95 md:bg-[#121212]/70`}
      >
        {/* Sidebar Header: New Chat */}
        <div className="p-3.5 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-400/80 bg-black flex-shrink-0">
                <img src={donIskoLogo} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>DON ISKO AI</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00F3FF]/20 text-[#00F3FF]">
                    3.7
                  </span>
                </h2>
                <p className="text-[9px] text-gray-400 font-mono">ASK GEMINI / GPT MODE</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 md:hidden"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#00c8ff] hover:from-[#33f6ff] hover:to-[#00b4e6] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Chat Baru (+ New Chat)</span>
          </button>
        </div>

        {/* Persona Selector Selector */}
        <div className="p-3 border-b border-white/10 space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Settings2 className="w-3 h-3 text-[#00F3FF]" />
            <span>MODUS KECERDASAN (PERSONA):</span>
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs ${
                  selectedPersona === p.id
                    ? 'bg-[#1F1F1F] border border-[#00F3FF] text-[#00F3FF] font-bold shadow-sm'
                    : 'bg-[#181818]/60 hover:bg-[#202020] text-gray-300 border border-transparent'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate font-sans">{p.name}</p>
                  <p className="text-[9px] text-gray-400 truncate font-mono">{p.badge}</p>
                </div>
                {selectedPersona === p.id && <Check className="w-3.5 h-3.5 text-[#00F3FF] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span>RIWAYAT PERCAKAPAN</span>
          </p>

          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => {
                setActiveSessionId(s.id);
                // On mobile close sidebar after select
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group text-xs ${
                activeSessionId === s.id
                  ? 'bg-[#1F1F1F]/90 border border-white/20 text-white font-bold'
                  : 'bg-[#161616]/40 hover:bg-[#1E1E1E]/60 text-gray-300 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === s.id ? 'text-[#00F3FF]' : 'text-gray-500'}`} />
                <span className="truncate">{s.title || 'Percakapan Tanpa Judul'}</span>
              </div>

              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                title="Hapus Percakapan"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-white/10 text-[10px] text-gray-400 font-mono flex items-center justify-between bg-black/20">
          <span>HS GROUP 711</span>
          <span className="text-[#00F3FF] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" /> GEMINI 3.7 FLASH
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT CHAT CONSOLE: INTERACTIVE CONVERSATION (GPT/Gemini) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#141414]/90 to-[#0F0F0F]/90 relative">
        
        {/* Chat Header Bar */}
        <div className="p-3.5 border-b border-white/10 bg-[#161616]/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Buka Menu Samping"
                className="p-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                <PanelLeft className="w-4 h-4 text-[#00F3FF]" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{activeSession.title || 'AI Intelegency Chat'}</span>
                </h1>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                Mode: {PERSONAS.find(p => p.id === selectedPersona)?.name || 'General'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="p-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#00F3FF]" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Chat Message Scroll Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
        >
          {activeSession.messages.length === 0 ? (
            /* Empty State / Welcome Screen with Suggestions */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl mx-auto space-y-6 py-8 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl p-1 bg-gradient-to-tr from-yellow-400 via-[#00F3FF] to-yellow-300 shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-black flex items-center justify-center">
                  <img src={donIskoLogo} alt="AI" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Ada yang bisa saya bantu hari ini?
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                  Tanyakan apapun seputar CS, Kasir, analisa kendala member, matematika, kalkulator parlay, atau pertanyaan umum layaknya ChatGPT & Ask Gemini.
                </p>
              </div>

              {/* Starter Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                {SUGGESTED_PROMPTS.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="p-3.5 rounded-2xl bg-[#1A1A1A]/80 hover:bg-[#252525] border border-white/10 hover:border-[#00F3FF]/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{sp.icon}</span>
                      <span className="text-xs font-bold text-white group-hover:text-[#00F3FF] transition-colors">
                        {sp.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {sp.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Streamed Message Bubbles */
            activeSession.messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                } group`}
              >
                {/* AI Avatar */}
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-400/80 bg-black flex-shrink-0 shadow-md mt-1">
                    <img src={donIskoLogo} alt="AI" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg relative ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#00F3FF]/20 to-[#0099ff]/20 border border-[#00F3FF]/40 text-white rounded-tr-none'
                      : 'bg-[#181818]/90 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {/* Message Meta */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/5">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-yellow-400 flex items-center gap-1.5">
                      {msg.role === 'user' ? (
                        <>👤 ANDA (OPERATOR)</>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          DON ISKO AI INTELLIGENCE
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Body with Markdown formatting */}
                  <div className="text-xs sm:text-sm leading-relaxed space-y-2 text-gray-100 selection:bg-[#00F3FF] selection:text-black">
                    {msg.content ? (
                      <div className="markdown-body prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed [&>p]:mb-2.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2.5 [&>h1]:text-base [&>h1]:font-bold [&>h1]:text-yellow-400 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-[#00F3FF] [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-emerald-400 [&>pre]:bg-black/60 [&>pre]:p-3 [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-white/10 [&>pre]:overflow-x-auto [&>code]:text-yellow-300 [&>code]:font-mono [&>blockquote]:border-l-2 [&>blockquote]:border-yellow-400 [&>blockquote]:pl-3 [&>blockquote]:text-gray-300 [&>table]:w-full [&>table]:text-left [&>table]:border-collapse [&>table_th]:border-b [&>table_th]:border-white/20 [&>table_th]:p-2 [&>table_td]:border-b [&>table_td]:border-white/10 [&>table_td]:p-2">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      /* Thinking / Typing Pulse Animation */
                      <div className="flex items-center gap-2 text-xs text-[#00F3FF] font-mono py-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00F3FF]" />
                        <span>DON ISKO AI sedang berpikir dan merumuskan jawaban...</span>
                      </div>
                    )}
                  </div>

                  {/* AI Message Action Toolbar */}
                  {msg.role === 'model' && msg.content && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white text-[10px] font-mono border border-white/5 transition-all cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#00F3FF]" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.content)}
                          title="Bacakan Jawaban (Audio TTS)"
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white text-[10px] border border-white/5 transition-all cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>

                      {index === activeSession.messages.length - 1 && !isGenerating && (
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-yellow-400/20 text-gray-300 hover:text-yellow-300 text-[10px] font-mono border border-white/5 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-yellow-400" />
                          <span>Buat Ulang (Regenerate)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll To Bottom Floating Button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-2.5 rounded-full bg-[#1F1F1F] text-[#00F3FF] border border-[#00F3FF]/40 shadow-xl hover:scale-110 transition-all cursor-pointer z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Quick Suggestion Chips (Above Input) */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#121212]/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-gray-400 font-mono whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> Cepat:
          </span>
          <button
            onClick={() => handleSendMessage('Buatkan template balasan LiveChat untuk komplain deposit pending')}
            className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-gray-300 hover:text-white text-[10px] whitespace-nowrap transition-all cursor-pointer"
          >
            Deposit Pending
          </button>
          <button
            onClick={() => handleSendMessage('Apa saja SOP serah terima handover shift kasir dan CS?')}
            className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-gray-300 hover:text-white text-[10px] whitespace-nowrap transition-all cursor-pointer"
          >
            Handover Shift
          </button>
          <button
            onClick={() => handleSendMessage('Hitung Turnover (TO) bonus 100% depo 200rb syarat TO x15')}
            className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-gray-300 hover:text-white text-[10px] whitespace-nowrap transition-all cursor-pointer"
          >
            Hitung TO
          </button>
          <button
            onClick={() => handleSendMessage('Jelaskan cara setting DNS 1.1.1.1 agar bebas blokir')}
            className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-gray-300 hover:text-white text-[10px] whitespace-nowrap transition-all cursor-pointer"
          >
            DNS Nawala
          </button>
        </div>

        {/* Interactive Chat Input Box (ChatGPT / Ask Gemini Layout) */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#121212]/95 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex flex-col rounded-2xl bg-[#1A1A1A] border border-white/15 focus-within:border-[#00F3FF] focus-within:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan apa saja kepada DON ISKO AI (contoh: cara hitung TO, template balasan chat, atau pertanyaan umum)..."
              className="w-full px-4 py-3 bg-transparent text-white text-xs sm:text-sm placeholder-gray-500 outline-none resize-none max-h-44 min-h-[44px]"
            />

            {/* Input Action Controls */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">Enter</kbd> kirim, <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">Shift+Enter</kbd> baris baru</span>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Hentikan</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim()}
                    className="px-4 py-1.5 rounded-xl bg-[#00F3FF] hover:bg-[#33f6ff] disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,243,255,0.4)] transition-all cursor-pointer"
                  >
                    <span>Kirim</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="text-center text-[9px] text-gray-500 font-mono mt-2">
            DON ISKO AI INTELLIGENCE bertenaga Gemini 3.7 Flash dapat membuat kesalahan. Selalu periksa kembali data transaksi perbankan riil.
          </p>
        </div>

      </div>
    </div>
  );
};
