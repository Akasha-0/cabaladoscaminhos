/**
 * Destiny Tracking — persist path progress in LocalStorage
 */

export interface DestinyMilestone {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: number;
}

export interface DestinyProgress {
  pathId: string;
  startedAt: number;
  milestones: DestinyMilestone[];
}

const STORAGE_KEY = 'cabala-destiny-progress';

/**
 * Load all stored progress entries.
 */
function loadAll(): Record<string, DestinyProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DestinyProgress>) : {};
  } catch {
    return {};
  }
}

/**
 * Persist progress entries.
 */
function saveAll(data: Record<string, DestinyProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Track progress for a given destiny path.
 *
 * @param pathId - unique identifier of the destiny path
 * @param milestones - milestones to track; merges with any existing record
 */
export function trackProgress(
  pathId: string,
  milestones: Omit<DestinyMilestone, 'completed' | 'completedAt'>[]
): DestinyProgress {
  const all = loadAll();
  const existing = all[pathId];

  const milestoneMap = new Map<string, DestinyMilestone>(
    existing?.milestones.map((m) => [m.id, m]) ?? []
  );

  for (const input of milestones) {
    if (!milestoneMap.has(input.id)) {
      milestoneMap.set(input.id, { ...input, completed: false });
    }
  }

  const progress: DestinyProgress = {
    pathId,
    startedAt: existing?.startedAt ?? Date.now(),
    milestones: Array.from(milestoneMap.values()),
  };

  all[pathId] = progress;
  saveAll(all);

  return progress;
}