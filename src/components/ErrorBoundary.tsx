import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('don_isko_jobdesk_tasks_v2');
      localStorage.removeItem('don_isko_auth_user');
      localStorage.removeItem('don_isko_current_user');
    } catch {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex items-center justify-center p-4 font-sans selection:bg-[#00F3FF] selection:text-black">
          <div className="max-w-lg w-full bg-[#121216] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#00F3FF]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-5 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mb-2 font-['Rajdhani']">
              {this.props.fallbackTitle || 'Terjadi Kendala Memuat Modul'}
            </h1>
            
            <p className="text-xs sm:text-sm text-gray-400 font-mono mb-6 leading-relaxed">
              Koneksi jaringan terputus atau terdapat versi modul baru. Klik tombol di bawah untuk menyinkronkan kembali antarmuka sistem.
            </p>

            {/* Error Message preview */}
            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-rose-300 text-left max-h-28 overflow-y-auto break-all">
                {this.state.error.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#00b4d8] text-black font-['Rajdhani'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-mono text-xs hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                title="Bersihkan sesi dan muat ulang"
              >
                <Trash2 className="w-4 h-4 text-yellow-400" />
                <span>Reset Cache &amp; Sesi</span>
              </button>
            </div>

            <div className="mt-6 text-[10px] text-gray-600 font-mono tracking-widest uppercase">
              HS GROUP 711 • WORKSTATION SAFEGUARD RECOVERY
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
