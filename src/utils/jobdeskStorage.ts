import { JobdeskTask } from '../types';
import { INITIAL_JOBDESK_CS, INITIAL_JOBDESK_KASIR } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'don_isko_jobdesk_tasks_v4';
const LEGACY_STORAGE_V3 = 'don_isko_jobdesk_tasks_v3';
const LEGACY_STORAGE_V2 = 'don_isko_jobdesk_tasks_v2';
const LEGACY_STORAGE_V1 = 'don_isko_jobdesk_tasks_v1';
const SYNCED_AT_KEY = 'don_isko_jobdesk_synced_at';
const VERSION_KEY = 'don_isko_jobdesk_version';

/**
 * Read the initial tasks from local storage or defaults on initial frame render
 */
export function getInitialJobdeskTasks(): JobdeskTask[] {
  const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
  if (typeof window === 'undefined') return defaultTasks;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= defaultTasks.length) {
        return parsed.map(t => ({
          ...t,
          taskType: t.taskType || 'UTAMA'
        }));
      }
    }
  } catch (err) {
    console.warn('Gagal membaca initial jobdesk dari local storage:', err);
  }

  return defaultTasks;
}

/**
 * Fetch canonical jobdesk tasks from server API (authoritative source for all computers & IPs)
 */
export async function fetchJobdeskFromServer(): Promise<{ tasks: JobdeskTask[]; version: number; updatedAt: string } | null> {
  try {
    const res = await fetch('/api/jobdesk', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tasks)) {
        const normalizedTasks: JobdeskTask[] = data.tasks.map((t: JobdeskTask) => ({
          ...t,
          taskType: t.taskType || 'UTAMA'
        }));

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedTasks));
            if (data.version) {
              localStorage.setItem(VERSION_KEY, String(data.version));
            }
            if (data.updatedAt) {
              localStorage.setItem(SYNCED_AT_KEY, data.updatedAt);
            }
          } catch {
            // ignore localStorage quota errors
          }
        }

        return {
          tasks: normalizedTasks,
          version: typeof data.version === 'number' ? data.version : 1,
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Gagal memuat jobdesk dari server API:', err);
  }
  return null;
}

/**
 * Persist full jobdesk tasks list to server and update local cache
 */
export async function persistJobdeskTasks(tasks: JobdeskTask[]): Promise<boolean> {
  // Update local cache immediately for zero-lag UI
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      localStorage.setItem(SYNCED_AT_KEY, new Date().toISOString());
    } catch (err) {
      console.warn('Gagal menyimpan jobdesk ke local cache:', err);
    }
  }

  // Push to server API for all staff computers
  try {
    const res = await fetch('/api/jobdesk', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify({ tasks })
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined' && data) {
        if (data.version) localStorage.setItem(VERSION_KEY, String(data.version));
        if (data.updatedAt) localStorage.setItem(SYNCED_AT_KEY, data.updatedAt);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Gagal sinkronisasi jobdesk ke server API:', err);
    return false;
  }
}

/**
 * Delete a jobdesk task permanently on server and local cache
 */
export async function deleteJobdeskTask(taskId: string, currentTasks: JobdeskTask[]): Promise<JobdeskTask[]> {
  const updated = currentTasks.filter(t => t.id !== taskId);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  try {
    const res = await fetch(`/api/jobdesk/task/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });

    if (!res.ok) {
      // Fallback: push full updated array to server
      await persistJobdeskTasks(updated);
    }
  } catch (err) {
    console.warn('Gagal request delete task ke server API, fallback ke persist:', err);
    await persistJobdeskTasks(updated);
  }

  return updated;
}

/**
 * Reset jobdesk to factory defaults on server and local cache
 */
export async function resetJobdeskToFactory(): Promise<JobdeskTask[]> {
  const defaultTasks: JobdeskTask[] = [...INITIAL_JOBDESK_CS, ...INITIAL_JOBDESK_KASIR];
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultTasks));
      localStorage.setItem(SYNCED_AT_KEY, new Date().toISOString());
    } catch {}
  }

  try {
    const res = await fetch('/api/jobdesk/reset', {
      method: 'POST',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tasks)) {
        return data.tasks;
      }
    }
  } catch (err) {
    console.warn('Gagal reset jobdesk ke factory via server API:', err);
  }

  return defaultTasks;
}

/**
 * Compatibility helper for saving custom tasks
 */
export function saveLocalCustomTask(_task: JobdeskTask): void {
  // No-op for cross-device consistency; tasks are saved directly through persistJobdeskTasks
}

/**
 * Compatibility helper for deleted ID tracking
 */
export function recordLocalDeletedId(_id: string): void {
  // No-op; server is now the canonical source of truth for active tasks
}

export function getLocalDeletedIds(): string[] {
  return [];
}

export function getLocalCustomTasks(): JobdeskTask[] {
  return [];
}

export function mergeJobdeskTasks(
  _localTasks: JobdeskTask[],
  serverTasks: JobdeskTask[],
  _serverDeletedIds: string[] = []
): { merged: JobdeskTask[]; hasNewLocalTasks: boolean } {
  return { merged: serverTasks, hasNewLocalTasks: false };
}
