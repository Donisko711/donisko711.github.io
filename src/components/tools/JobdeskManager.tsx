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
  Sparkles,
  ClipboardList
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobdeskTask, ShiftType } from '../../types';

interface JobdeskManagerProps {
  tasks: JobdeskTask[];
  onUpdateTasks: (tasks: JobdeskTask[]) => void;
  category: 'CS' | 'KASIR';
  activeShift: ShiftType;
  onShiftChange: (shift: ShiftType) => void;
}

export const JobdeskManager: React.FC<JobdeskManagerProps> = ({
  tasks,
  onUpdateTasks,
  category,
  activeShift,
  onShiftChange
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filter tasks by current category and active shift
  const shiftTasks = tasks
    .filter(t => t.category === category && t.shift === activeShift)
    .sort((a, b) => a.order - b.order);

  const completedCount = shiftTasks.filter(t => t.completed).length;
  const totalCount = shiftTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle check/uncheck
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
            // ignore if confetti fails
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Move task up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentTask = shiftTasks[index];
    const prevTask = shiftTasks[index - 1];

    const updated = tasks.map(t => {
      if (t.id === currentTask.id) return { ...t, order: prevTask.order };
      if (t.id === prevTask.id) return { ...t, order: currentTask.order };
      return t;
    });
    onUpdateTasks(updated);
  };

  // Move task down
  const handleMoveDown = (index: number) => {
    if (index === shiftTasks.length - 1) return;
    const currentTask = shiftTasks[index];
    const nextTask = shiftTasks[index + 1];

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

    const newTask: JobdeskTask = {
      id: `${category.toLowerCase()}-${activeShift.toLowerCase()}-${Date.now()}`,
      title: newTaskTitle.trim(),
      category,
      shift: activeShift,
      completed: false,
      order: shiftTasks.length + 1,
      timeNote: newTaskTime.trim() || undefined,
      description: newTaskDesc.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskDesc('');
    setIsAdding(false);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== taskId));
  };

  // Reset shift checklist
  const handleResetChecklist = () => {
    if (window.confirm(`Reset semua status checklist untuk Shift ${activeShift}?`)) {
      const updated = tasks.map(t => {
        if (t.category === category && t.shift === activeShift) {
          return { ...t, completed: false };
        }
        return t;
      });
      onUpdateTasks(updated);
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
    text += `📊 *Progress:* ${completedCount}/${totalCount} (${progressPercent}% Selesai)\n\n`;
    text += `*Rincian Tugas Shift:*\n`;

    shiftTasks.forEach((t, i) => {
      const statusIcon = t.completed ? '✅' : '⏳';
      text += `${i + 1}. ${statusIcon} ${t.title} ${t.timeNote ? `[${t.timeNote}]` : ''}\n`;
      if (t.description) {
        text += `   └ Note: ${t.description}\n`;
      }
    });

    text += `\n_Laporan dibuat otomatis via Dashboard Bantuan Kerja_`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0e131b]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/40">
              OPERASIONAL {category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Checklist & Order Control
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
            Jobdesk {category === 'CS' ? 'Customer Service' : 'Kasir / Keuangan'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tandai tugas selesai, atur susunan atas/bawah, tambah tugas baru, dan buat laporan serah terima shift.
          </p>
        </div>

        {/* Quick Shift Switcher Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          {(['PAGI', 'SORE', 'MALAM'] as ShiftType[]).map(shift => (
            <button
              key={shift}
              onClick={() => onShiftChange(shift)}
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

      {/* Progress & Quick Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e131b]/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Progress bar */}
        <div className="w-full sm:w-1/2 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">
              Progress Shift {activeShift}:
            </span>
            <span className="text-cyan-400 font-mono font-bold">
              {completedCount} dari {totalCount} Tugas ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>

          <button
            onClick={handleCopyHandover}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'Tersalin!' : 'Copy Serah Terima'}</span>
          </button>

          <button
            onClick={handleResetChecklist}
            title="Reset Ceklis Shift Ini"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-rose-400 border border-zinc-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Task Form Modal/Card */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-5 rounded-2xl bg-zinc-900/95 border border-cyan-500/50 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Tambah Jobdesk Baru ({category} - Shift {activeShift})
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Judul Tugas / Instruksi
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Contoh: Cek mutasi bank mandiri pukul 10:00..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Jam / Target Waktu (Opsional)
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
              Catatan / SOP Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              placeholder="Catatan detail SOP..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-400 text-xs text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* Task List Items (with Checkbox, Move Up/Down, and Delete) */}
      <div className="space-y-2.5">
        {shiftTasks.map((task, index) => (
          <div
            key={task.id}
            className={`group relative flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 ${
              task.completed
                ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                : 'bg-[#0e131b]/90 hover:bg-[#121824] border-zinc-800 hover:border-cyan-500/40 text-slate-200'
            }`}
          >
            {/* Left: Checkbox & Content */}
            <div className="flex items-start gap-3 flex-1 pr-3">
              <button
                onClick={() => handleToggleTask(task.id)}
                className={`mt-0.5 p-1 rounded-lg transition-all cursor-pointer ${
                  task.completed
                    ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/50'
                    : 'text-slate-500 hover:text-cyan-400 bg-zinc-900 border border-zinc-700'
                }`}
              >
                {task.completed ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <span className={`text-sm font-semibold ${
                    task.completed ? 'line-through text-slate-400 font-normal' : 'text-white'
                  }`}>
                    {task.title}
                  </span>
                  {task.timeNote && (
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-300 text-[10px] font-mono">
                      {task.timeNote}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-slate-400">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Reorder Up/Down & Delete Controls */}
            <div className="flex items-center gap-1 self-center">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Pindahkan ke Atas"
                className={`p-1.5 rounded-lg border transition-all ${
                  index === 0
                    ? 'opacity-30 cursor-not-allowed border-zinc-800 text-slate-600'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-cyan-300 border-zinc-700 cursor-pointer'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === shiftTasks.length - 1}
                title="Pindahkan ke Bawah"
                className={`p-1.5 rounded-lg border transition-all ${
                  index === shiftTasks.length - 1
                    ? 'opacity-30 cursor-not-allowed border-zinc-800 text-slate-600'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-cyan-300 border-zinc-700 cursor-pointer'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteTask(task.id)}
                title="Hapus Tugas Ini"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/40 transition-all cursor-pointer ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {shiftTasks.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 text-slate-400 text-xs">
            Belum ada tugas untuk Shift {activeShift}. Klik tombol "+ Tambah Tugas" di atas.
          </div>
        )}
      </div>
    </div>
  );
};
