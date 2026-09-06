import { JobdeskTask } from '../types';
import { INITIAL_JOBDESK_CS, INITIAL_JOBDESK_KASIR } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'don_isko_jobdesk_tasks_v2';
const LEGACY_STORAGE_KEY = 'don_isko_jobdesk_tasks_v1';
const CUSTOM_BACKUP_KEY = 'don_isko_custom_jobdesk_backup_v2';
const DELETED_IDS_KEY = 'don_isko_deleted_task_ids_v2';

/**
 * Get the list of IDs that were explicitly deleted by users
 */
export function getLocalDeletedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading deleted task IDs:', err);
  }
  return [];
}

/**
 * Record a deleted task ID locally so it is never re-added or resurrected
 */
export function recordLocalDeletedId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalDeletedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(current));
    }
    // Also remove from custom backup if present
    const custom = getLocalCustomTasks();
    const updatedCustom = custom.filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_BACKUP_KEY, JSON.stringify(updatedCustom));
  } catch (err) {
    console.warn('Error recording deleted ID locally:', err);
  }
}

/**
 * Get user-created custom tasks from local backup storage
 */
export function getLocalCustomTasks(): JobdeskTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading custom jobdesk backup:', err);
  }
  return [];
}

/**
 * Save user-created custom tasks to local backup storage
 */
export function saveLocalCustomTask(task: JobdeskTask): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCustomTasks();
    const idx = current.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      current[idx] = task;
    } else {
      current.push(task);
    }
    localStorage.setItem(CUSTOM_BACKUP_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error saving custom jobdesk backup:', err);
  }
}

/**
 * Read the initial tasks from local storage or defaults on boot
 */
export function getInitialJobdeskTasks(): JobdeskTask[] {
  const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
  if (typeof window === 'undefined') return defaultTasks;

  const deletedIds = new Set(getLocalDeletedIds());
  const customTasks = getLocalCustomTasks();

  let loadedTasks: JobdeskTask[] = [];

  try {
    // Check v2 key first, then legacy v1 key
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedTasks = parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading initial tasks from localStorage:', err);
  }

  // If no saved tasks found, use default tasks
  if (loadedTasks.length === 0) {
    loadedTasks = defaultTasks;
  }

  // Merge with custom tasks backup to ensure no custom tasks were lost
  const taskMap = new Map<string, JobdeskTask>();
  loadedTasks.forEach(t => {
    if (!deletedIds.has(t.id)) {
      taskMap.set(t.id, {
        ...t,
        taskType: t.taskType || 'UTAMA'
      });
    }
  });

  customTasks.forEach(t => {
    if (!deletedIds.has(t.id) && !taskMap.has(t.id)) {
      taskMap.set(t.id, {
        ...t,
        taskType: t.taskType || 'UTAMA'
      });
    }
  });

  // Ensure non-deleted defaults are present
  defaultTasks.forEach(def => {
    if (!deletedIds.has(def.id) && !taskMap.has(def.id)) {
      taskMap.set(def.id, def);
    }
  });

  return Array.from(taskMap.values());
}

/**
 * Two-way merge server tasks with local tasks, respecting deleted IDs and custom tasks
 */
export function mergeJobdeskTasks(
  localTasks: JobdeskTask[],
  serverTasks: JobdeskTask[],
  serverDeletedIds: string[] = []
): { merged: JobdeskTask[]; hasNewLocalTasks: boolean } {
  // Sync deleted IDs
  const localDeleted = getLocalDeletedIds();
  const allDeletedIds = new Set([...localDeleted, ...serverDeletedIds]);

  // Update local deleted IDs
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(allDeletedIds)));
    } catch {}
  }

  const customTasks = getLocalCustomTasks();
  const mergedMap = new Map<string, JobdeskTask>();

  // 1. Add server tasks that are not deleted
  serverTasks.forEach(t => {
    if (!allDeletedIds.has(t.id)) {
      mergedMap.set(t.id, {
        ...t,
        taskType: t.taskType || 'UTAMA'
      });
    }
  });

  let hasNewLocalTasks = false;

  // 2. Merge local tasks (preserve local checked status or local custom additions)
  localTasks.forEach(localT => {
    if (allDeletedIds.has(localT.id)) return;

    if (!mergedMap.has(localT.id)) {
      // Local has a task that server does not have -> preserve it and flag for sync!
      mergedMap.set(localT.id, {
        ...localT,
        taskType: localT.taskType || 'UTAMA'
      });
      hasNewLocalTasks = true;
    } else {
      // If task already on server, retain completed toggle from local if available
      const existing = mergedMap.get(localT.id)!;
      mergedMap.set(localT.id, {
        ...existing,
        completed: localT.completed !== undefined ? localT.completed : existing.completed,
        order: localT.order !== undefined ? localT.order : existing.order
      });
    }
  });

  // 3. Merge custom backup tasks
  customTasks.forEach(customT => {
    if (!allDeletedIds.has(customT.id) && !mergedMap.has(customT.id)) {
      mergedMap.set(customT.id, {
        ...customT,
        taskType: customT.taskType || 'UTAMA'
      });
      hasNewLocalTasks = true;
    }
  });

  const merged = Array.from(mergedMap.values());

  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }

  return { merged, hasNewLocalTasks };
}

/**
 * Persist tasks locally and sync to server API
 */
export async function persistJobdeskTasks(tasks: JobdeskTask[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      // Save any custom task to custom backup key
      const defaultIds = new Set([...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR].map(d => d.id));
      const customTasks = tasks.filter(t => !defaultIds.has(t.id));
      if (customTasks.length > 0) {
        localStorage.setItem(CUSTOM_BACKUP_KEY, JSON.stringify(customTasks));
      }
    } catch (err) {
      console.warn('Gagal menyimpan jobdesk ke localStorage:', err);
    }
  }

  try {
    const res = await fetch('/api/jobdesk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks })
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal sync jobdesk ke server API:', err);
    return false;
  }
}

/**
 * Delete a task locally and on server
 */
export async function deleteJobdeskTask(taskId: string, currentTasks: JobdeskTask[]): Promise<JobdeskTask[]> {
  recordLocalDeletedId(taskId);
  const updated = currentTasks.filter(t => t.id !== taskId);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      const custom = getLocalCustomTasks().filter(t => t.id !== taskId);
      localStorage.setItem(CUSTOM_BACKUP_KEY, JSON.stringify(custom));
    } catch {}
  }

  try {
    fetch(`/api/jobdesk/task/${encodeURIComponent(taskId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch {}

  return updated;
}
