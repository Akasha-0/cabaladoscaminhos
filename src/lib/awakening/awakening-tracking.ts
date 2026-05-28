const STORAGE_KEY = "awakening_progress";

export interface TrackProgressOptions {
  date?: string;
  level?: number;
}

export function trackProgress(options?: TrackProgressOptions): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const progress: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    progress.date = options?.date ?? new Date().toISOString().split("T")[0];
    if (options?.level !== undefined) {
      progress.level = options.level;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable or corrupted; skip silently
  }
}
