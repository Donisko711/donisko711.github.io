import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sunrise, 
  Sun, 
  Moon, 
  RotateCcw,
  Edit2,
  Save,
  X,
  Database,
  Zap,
  Coffee,
  Clock,
  Filter,
  CheckCircle2,
  Layers,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobdeskTask, JobdeskTaskType, ShiftType } from '../../types';
import { deleteJobdeskTask } from '../../utils/jobdeskStorage';

interface JobdeskManagerProps {
  tasks: JobdeskTask[];
  onUpdateTasks: (tasks: JobdeskTask[]) => void;
  category: 'CS' | 'KASIR';
  activeShift: ShiftType;
  onShiftChange: (shift: ShiftType) => void;
  onManualRefresh?: () => Promise<void>;
  isSyncing?: boolean;
  lastSyncedAt?: string | null;
}

export const JobdeskManager: React.FC<JobdeskManagerProps> = ({
  tasks,
  onUpdateTasks,
  category,
  activeShift,
  onShiftChange,
  onManualRefresh,
  isSyncing = false,
  lastSyncedAt
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskShiftTarget, setNewTaskShiftTarget] = useState<ShiftType | 'ALL'>(activeShift);
  const [newTaskType, setNewTaskType] = useState<JobdeskTaskType>('UTAMA');
  const [isAdding, setIsAdding] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editShift, setEditShift] = useState<ShiftType>(activeShift);
  const [editTaskType, setEditTaskType] = useState<JobdeskTaskType>('UTAMA');

  // Filter Category: 'ALL' | 'UTAMA' | 'SAMBILAN'
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'UTAMA' | 'SAMBILAN'>('ALL');

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tasks filtered by current category & shift
  const shiftTasks = tasks
    .filter(t => t.category === category && t.shift === activeShift)
    .sort((a, b) => a.order - b.order);

  // Categorized tasks
  const utamaTasks = shiftTasks.filter(t => (t.taskType || 'UTAMA') === 'UTAMA');
  const sambilanTasks = shiftTasks.filter(t => t.taskType === 'SAMBILAN');

  const utamaCompleted = utamaTasks.filter(t => t.completed).length;
  const sambilanCompleted = sambilanTasks.filter(t => t.completed).length;

  const totalCount = shiftTasks.length;
  const completedCount = shiftTasks.filter(t => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Displayed tasks based on tab filter
  const displayedTasks = shiftTasks.filter(t => {
    const itemType = t.taskType || 'UTAMA';
    if (typeFilter === 'ALL') return true;
    return itemType === typeFilter;
  });

  // Toggle task status
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch (e) {
            // ignore confetti error
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Move task up within shift
  const handleMoveUp = (indexInShift: number) => {
    if (indexInShift === 0) return;
    const currentTask = shiftTasks[indexInShift];
    const prevTask = shiftTasks[indexInShift - 1];

    const updated = tasks.map(t => {
      if (t.id === currentTask.id) return { ...t, order: prevTask.order };
      if (t.id === prevTask.id) return { ...t, order: currentTask.order };
      return t;
    });
    onUpdateTasks(updated);
  };

  // Move task down within shift
  const handleMoveDown = (indexInShift: number) => {
    if (indexInShift === shiftTasks.length - 1) return;
    const currentTask = shiftTasks[indexInShift];
    const nextTask = shiftTasks[indexInShift + 1];

    const updated = tasks.map(t => {
      if (t.id === currentTask.id) return { ...t, order: nextTask.order };
      if (t.id === nextTask.id) return { ...t, order: currentTask.order };
      return t;
    });
    onUpdateTasks(updated);
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const timestamp = Date.now();
    let newTasksToAdd: JobdeskTask[] = [];

    if (newTaskShiftTarget === 'ALL') {
      const shifts: ShiftType[] = ['PAGI', 'SORE', 'MALAM'];
      newTasksToAdd = shifts.map((sh, idx) => {
        const existingCount = tasks.filter(t => t.category === category && t.shift === sh).length;
        return {
          id: `${category.toLowerCase()}-${sh.toLowerCase()}-${timestamp}-${idx}`,
          title: newTaskTitle.trim(),
          category,
          shift: sh,
          taskType: newTaskType,
          completed: false,
          order: existingCount + 1,
          timeNote: newTaskTime.trim() || undefined,
          description: newTaskDesc.trim() || undefined,
          createdAt: new Date().toISOString()
        };
      });
    } else {
      const existingCount = tasks.filter(t => t.category === category && t.shift === newTaskShiftTarget).length;
      newTasksToAdd = [{
        id: `${category.toLowerCase()}-${newTaskShiftTarget.toLowerCase()}-${timestamp}`,
        title: newTaskTitle.trim(),
        category,
        shift: newTaskShiftTarget,
        taskType: newTaskType,
        completed: false,
        order: existingCount + 1,
        timeNote: newTaskTime.trim() || undefined,
        description: newTaskDesc.trim() || undefined,
        createdAt: new Date().toISOString()
      }];
    }

    onUpdateTasks([...tasks, ...newTasksToAdd]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskDesc('');
    setIsAdding(false);
    showToast(`✅ ${newTaskType === 'UTAMA' ? '⚡ Tugas Utama' : '☕ Tugas Sambilan'} berhasil disimpan ke server & semua komputer ${newTaskShiftTarget === 'ALL' ? '(SEMUA SHIFT)' : `(Shift ${newTaskShiftTarget})`}!`);
  };

  // Start editing a task
  const handleStartEdit = (task: JobdeskTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditTime(task.timeNote || '');
    setEditDesc(task.description || '');
    setEditShift(task.shift);
    setEditTaskType(task.taskType || 'UTAMA');
  };

  // Save edited task
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editTitle.trim()) return;

    const updated = tasks.map(t => {
      if (t.id === editingTaskId) {
        const modified: JobdeskTask = {
          ...t,
          title: editTitle.trim(),
          timeNote: editTime.trim() || undefined,
          description: editDesc.trim() || undefined,
          shift: editShift,
          taskType: editTaskType
        };
        return modified;
      }
      return t;
    });

    onUpdateTasks(updated);
    setEditingTaskId(null);
    showToast('✅ Perubahan tugas berhasil diperbarui ke server & semua komputer!');
  };

  // Delete task
  const handleDeleteTask = async (task: JobdeskTask) => {
    if (window.confirm(`Hapus tugas ini secara permanen dari SEMUA komputer & staff?\n\n"${task.title}"\n[${task.taskType === 'SAMBILAN' ? '☕ Tugas Sambilan' : '⚡ Tugas Utama'} - Shift ${task.shift}]`)) {
      const updated = await deleteJobdeskTask(task.id, tasks);
      onUpdateTasks(updated);
      showToast('🗑️ Tugas berhasil dihapus dari server & semua komputer.');
    }
  };

  // Reset shift checklist (only unchecks, never deletes tasks!)
  const handleResetChecklist = () => {
    if (window.confirm(`Reset centang status selesai untuk ${category} Shift ${activeShift}?\n\nCatatan: Daftar tugas TIDAK akan terhapus, hanya tanda centang yang direset untuk pergantian shift baru.`)) {
      const updated = tasks.map(t => {
        if (t.category === category && t.shift === activeShift) {
          return { ...t, completed: false };
        }
        return t;
      });
      onUpdateTasks(updated);
      showToast(`🔄 Status ceklis Shift ${activeShift} berhasil direset.`);
    }
  };

  // Copy report summary for WhatsApp / Telegram handoff
  const handleCopyHandover = () => {
    const shiftLabel = activeShift === 'PAGI' ? 'PAGI (07:00 - 15:00)' : activeShift === 'SORE' ? 'SORE (15:00 - 23:00)' : 'MALAM (23:00 - 07:00)';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `📋 *LAPORAN SERAH TERIMA JOBDESK ${category}*\n`;
    text += `🕒 *Shift:* ${shiftLabel}\n`;
    text += `📅 *Tanggal:* ${dateStr}\n`;
    text += `📊 *Total Selesai:* ${completedCount}/${totalCount} (${progressPercent}%)\n\n`;

    // Tugas Utama Section
    text += `⚡ *TUGAS UTAMA (WAJIB) [${utamaCompleted}/${utamaTasks.length} Selesai]:*\n`;
    if (utamaTasks.length === 0) {
      text += `  (Belum ada tugas utama)\n`;
    } else {
      utamaTasks.forEach((t, i) => {
        const statusIcon = t.completed ? '✅' : '⏳';
        text += `${i + 1}. ${statusIcon} ${t.title} ${t.timeNote ? `[${t.timeNote}]` : ''}\n`;
        if (t.description) {
          text += `   └ Note: ${t.description}\n`;
        }
      });
    }

    text += `\n`;

    // Tugas Sambilan Section
    text += `☕ *TUGAS SAMBILAN (SAAT SENGGANG / CEK KEMBALI) [${sambilanCompleted}/${sambilanTasks.length} Selesai]:*\n`;
    if (sambilanTasks.length === 0) {
      text += `  (Belum ada tugas sambilan)\n`;
    } else {
      sambilanTasks.forEach((t, i) => {
        const statusIcon = t.completed ? '✅' : '⏳';
        text += `${i + 1}. ${statusIcon} ${t.title} ${t.timeNote ? `[${t.timeNote}]` : ''}\n`;
        if (t.description) {
          text += `   └ Note: ${t.description}\n`;
        }
      });
    }

    text += `\n_Laporan dibuat otomatis via Dashboard Bantuan Kerja 711_`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
    showToast('📋 Format laporan serah terima berhasil disalin!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-cyan-500 text-cyan-300 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              OPERASIONAL {category}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-PC Live Sync</span>
            </div>
            {lastSyncedAt && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Terakhir Sinkron: {(() => {
                  try {
                    return new Date(lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
                  } catch {
                    return 'Baru Saja';
                  }
                })()}
              </span>
            )}
            {onManualRefresh && (
              <button
                type="button"
                onClick={async () => {
                  await onManualRefresh();
                  showToast('🔄 Data Jobdesk berhasil diperbarui langsung dari server pusat!');
                }}
                disabled={isSyncing}
                title="Sinkronkan data dari server sekarang"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
              </button>
            )}
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Jobdesk {category === 'CS' ? 'Customer Service' : 'Kasir / Keuangan'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tersinkronisasi otomatis antar semua komputer, lokasi, & IP staff. Dikelompokkan menjadi <strong className="text-amber-300">Tugas Utama (Wajib)</strong> dan <strong className="text-indigo-300">Tugas Sambilan</strong>.
          </p>
        </div>

        {/* Quick Shift Switcher Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
            <button
              key={shift}
              onClick={() => {
                onShiftChange(shift);
                setNewTaskShiftTarget(shift);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShift === shift
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {shift === 'PAGI' && <Sunrise className="w-3.5 h-3.5" />}
              {shift === 'SORE' && <Sun className="w-3.5 h-3.5" />}
              {shift === 'MALAM' && <Moon className="w-3.5 h-3.5" />}
              <span>Shift {shift}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Category Summary Cards (Pembeda Jelas: Tugas Utama vs Tugas Sambilan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Tugas Utama */}
        <div 
          onClick={() => setTypeFilter(typeFilter === 'UTAMA' ? 'ALL' : 'UTAMA')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            typeFilter === 'UTAMA'
              ? 'bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-[#0e131b]/90 border-amber-500/30 hover:border-amber-400/60'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Zap className="w-4 h-4 fill-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tugas Utama</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    WAJIB DIKERJAKAN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Prioritas inti yang wajib selesai selama shift berlangsung</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-amber-400">
                {utamaCompleted}/{utamaTasks.length}
              </span>
              <p className="text-[10px] text-slate-400">Selesai</p>
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-3 w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${utamaTasks.length > 0 ? (utamaCompleted / utamaTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card Tugas Sambilan */}
        <div 
          onClick={() => setTypeFilter(typeFilter === 'SAMBILAN' ? 'ALL' : 'SAMBILAN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            typeFilter === 'SAMBILAN'
              ? 'bg-indigo-950/30 border-indigo-400 ring-2 ring-indigo-400/40'
              : 'bg-[#0e131b]/90 border-indigo-500/30 hover:border-indigo-400/60'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tugas Sambilan</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40">
                    SAAT SENGGANG
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Dikerjakan &amp; dicek kembali saat senggang atau antrian sepi</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-indigo-400">
                {sambilanCompleted}/{sambilanTasks.length}
              </span>
              <p className="text-[10px] text-slate-400">Selesai</p>
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-3 w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${sambilanTasks.length > 0 ? (sambilanCompleted / sambilanTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e131b]/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              typeFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Semua ({totalCount})</span>
          </button>

          <button
            onClick={() => setTypeFilter('UTAMA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              typeFilter === 'UTAMA'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-amber-300/80 hover:text-amber-300'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Tugas Utama ({utamaCompleted}/{utamaTasks.length})</span>
          </button>

          <button
            onClick={() => setTypeFilter('SAMBILAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              typeFilter === 'SAMBILAN'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-indigo-300/80 hover:text-indigo-300'
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>Tugas Sambilan ({sambilanCompleted}/{sambilanTasks.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setNewTaskShiftTarget(activeShift);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>

          <button
            onClick={handleCopyHandover}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'Tersalin!' : 'Copy Serah Terima'}</span>
          </button>

          <button
            onClick={handleResetChecklist}
            title="Reset Ceklis Shift Ini (Daftar tugas tidak terhapus, hanya centang dibersihkan)"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-rose-400 border border-zinc-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Task Form Modal/Card */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-5 rounded-2xl bg-zinc-900/95 border border-cyan-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Tambah Jobdesk Baru ({category})
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Kategori Pilihan: Tugas Utama vs Tugas Sambilan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Kategori Tugas <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setNewTaskType('UTAMA')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  newTaskType === 'UTAMA'
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg mt-0.5 ${newTaskType === 'UTAMA' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-slate-400'}`}>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">⚡ Tugas Utama (Wajib)</div>
                  <div className="text-[11px] text-slate-400">Wajib dikerjakan &amp; diselesaikan pada shift ini</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewTaskType('SAMBILAN')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  newTaskType === 'SAMBILAN'
                    ? 'bg-indigo-950/40 border-indigo-400 ring-1 ring-indigo-400/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg mt-0.5 ${newTaskType === 'SAMBILAN' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-slate-400'}`}>
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-300">☕ Tugas Sambilan (Saat Senggang)</div>
                  <div className="text-[11px] text-slate-400">Dikerjakan / dicek kembali saat ada waktu luang</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Judul Tugas / Instruksi <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder={newTaskType === 'UTAMA' ? 'Contoh: Proses WD & DP antrian pagi...' : 'Contoh: Cek mutasi bank selisih, cek artikel, cek promo...'}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Target Shift
              </label>
              <select
                value={newTaskShiftTarget}
                onChange={e => setNewTaskShiftTarget(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-cyan-300 outline-none cursor-pointer"
              >
                <option value="PAGI">Shift Pagi</option>
                <option value="SORE">Shift Sore</option>
                <option value="MALAM">Shift Malam</option>
                <option value="ALL">⭐ Terapkan ke SEMUA Shift</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jam / Waktu (Opsional)
              </label>
              <input
                type="text"
                value={newTaskTime}
                onChange={e => setNewTaskTime(e.target.value)}
                placeholder="Contoh: 10:00 WIB"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Catatan SOP / Petunjuk Pengerjaan (Opsional)
            </label>
            <input
              type="text"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              placeholder="Catatan pengerjaan atau format checklist khusus..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Tersimpan permanen, tidak akan hilang
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Permanen</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Edit Task Modal/Form */}
      {editingTaskId && (
        <form onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-zinc-900/95 border border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Edit2 className="w-4 h-4" /> Edit Tugas Jobdesk ({category})
            </span>
            <button
              type="button"
              onClick={() => setEditingTaskId(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Kategori Edit */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Kategori Tugas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setEditTaskType('UTAMA')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  editTaskType === 'UTAMA'
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700'
                }`}
              >
                <Zap className={`w-4 h-4 ${editTaskType === 'UTAMA' ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-amber-300">⚡ Tugas Utama (Wajib)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditTaskType('SAMBILAN')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  editTaskType === 'SAMBILAN'
                    ? 'bg-indigo-950/40 border-indigo-400 ring-1 ring-indigo-400/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700'
                }`}
              >
                <Coffee className={`w-4 h-4 ${editTaskType === 'SAMBILAN' ? 'text-indigo-300' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-indigo-300">☕ Tugas Sambilan (Saat Senggang)</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Judul Tugas / Instruksi <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Shift
              </label>
              <select
                value={editShift}
                onChange={e => setEditShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-xs text-amber-300 outline-none cursor-pointer"
              >
                <option value="PAGI">Shift Pagi</option>
                <option value="SORE">Shift Sore</option>
                <option value="MALAM">Shift Malam</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jam / Waktu (Opsional)
              </label>
              <input
                type="text"
                value={editTime}
                onChange={e => setEditTime(e.target.value)}
                placeholder="Contoh: 10:00 WIB"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Catatan SOP / Petunjuk Pengerjaan (Opsional)
            </label>
            <input
              type="text"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Catatan detail SOP..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-xs text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setEditingTaskId(null)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      )}

      {/* Task List Items (dengan pembeda visual yang tegas antara Tugas Utama & Tugas Sambilan) */}
      <div className="space-y-3">
        {displayedTasks.map((task) => {
          // Find absolute index in shiftTasks for order moving
          const indexInShift = shiftTasks.findIndex(t => t.id === task.id);
          const isUtama = (task.taskType || 'UTAMA') === 'UTAMA';

          return (
            <div
              key={task.id}
              className={`group relative flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 ${
                task.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                  : isUtama
                    ? 'bg-[#0e131b]/95 border-l-4 border-l-amber-400 border-amber-500/25 hover:border-amber-400/50 text-slate-200 shadow-[0_0_15px_rgba(245,158,11,0.03)]'
                    : 'bg-[#0c1017]/90 border-l-4 border-l-indigo-400 border-indigo-500/25 hover:border-indigo-400/50 text-slate-200 shadow-[0_0_15px_rgba(99,102,241,0.03)]'
              }`}
            >
              {/* Left: Checkbox & Content */}
              <div className="flex items-start gap-3 flex-1 pr-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 p-1 rounded-lg transition-all cursor-pointer ${
                    task.completed
                      ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/50'
                      : isUtama
                        ? 'text-slate-500 hover:text-amber-400 bg-zinc-900 border border-amber-500/30'
                        : 'text-slate-500 hover:text-indigo-400 bg-zinc-900 border border-indigo-500/30'
                  }`}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1.5 flex-1">
                  {/* Tags / Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isUtama ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-amber-400" /> TUGAS UTAMA (WAJIB)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                        <Coffee className="w-3 h-3" /> SAMBILAN (SAAT SENGGANG)
                      </span>
                    )}

                    {task.timeNote && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-cyan-300 text-[10px] font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {task.timeNote}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold leading-snug ${
                      task.completed ? 'line-through text-slate-400 font-normal' : 'text-white'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Description / Note */}
                  {task.description && (
                    <p className="text-xs text-slate-400">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Controls (Edit, Move Up/Down, Delete) */}
              <div className="flex items-center gap-1 self-center">
                <button
                  onClick={() => handleStartEdit(task)}
                  title="Edit Tugas Ini"
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-amber-300 border border-zinc-700 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleMoveUp(indexInShift)}
                  disabled={indexInShift === 0}
                  title="Pindahkan ke Atas"
                  className={`p-1.5 rounded-lg border transition-all ${
                    indexInShift === 0
                      ? 'opacity-30 cursor-not-allowed border-zinc-800 text-slate-600'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-cyan-300 border-zinc-700 cursor-pointer'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleMoveDown(indexInShift)}
                  disabled={indexInShift === shiftTasks.length - 1}
                  title="Pindahkan ke Bawah"
                  className={`p-1.5 rounded-lg border transition-all ${
                    indexInShift === shiftTasks.length - 1
                      ? 'opacity-30 cursor-not-allowed border-zinc-800 text-slate-600'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-cyan-300 border-zinc-700 cursor-pointer'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task)}
                  title="Hapus Tugas Ini Secara Permanen"
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/40 transition-all cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {displayedTasks.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 text-slate-400 text-xs space-y-3">
            <p>
              {typeFilter === 'ALL'
                ? `Belum ada tugas untuk Shift ${activeShift}.`
                : typeFilter === 'UTAMA'
                  ? `Tidak ada Tugas Utama pada Shift ${activeShift}.`
                  : `Tidak ada Tugas Sambilan pada Shift ${activeShift}.`}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setIsAdding(true);
                  setNewTaskShiftTarget(activeShift);
                  if (typeFilter === 'SAMBILAN') setNewTaskType('SAMBILAN');
                  else setNewTaskType('UTAMA');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold cursor-pointer hover:bg-cyan-500/30 transition-all"
              >
                + Tambah Tugas Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
