const STORAGE_KEY = 'dashboard_state';

export interface DashboardState {
  layout?: string;
  filters?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  lastUpdated?: number;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveDashboardState(state: DashboardState): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: DashboardState = {
      ...state,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage full or unavailable
  }
}

export function loadDashboardState(): DashboardState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardState;
  } catch {
    return null;
  }
}

export function autoSave(state: DashboardState): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveDashboardState(state), 300);
}