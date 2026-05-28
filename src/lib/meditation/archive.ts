const STORAGE_KEY = 'meditation-archive';

export interface ArchivedSession {
  id: string;
  startedAt: string;
  endedAt: string;
  duration: number;
  templateId?: string;
  templateName?: string;
}

export function getArchive(): ArchivedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ArchivedSession[];
  } catch {
    return [];
  }
}

export function addToArchive(session: ArchivedSession): void {
  if (typeof window === 'undefined') return;
  const archive = getArchive();
  archive.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
}

export function clearArchive(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}