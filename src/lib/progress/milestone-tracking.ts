// fallow-ignore-file unused-file
const STORAGE_KEY = 'milestone_tracking';

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  completedAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface MilestoneState {
  milestones: Milestone[];
  lastUpdated: string;
}

function loadState(): MilestoneState {
  if (typeof window === 'undefined') {
    return { milestones: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { milestones: [], lastUpdated: new Date().toISOString() };
    return JSON.parse(raw) as MilestoneState;
  } catch {
    return { milestones: [], lastUpdated: new Date().toISOString() };
  }
}

function saveState(state: MilestoneState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or unavailable
  }
}

// fallow-ignore-next-line complexity
export function trackMilestone(
  id: string,
  name: string,
  options?: { description?: string; metadata?: Record<string, unknown> }
): Milestone {
  const state = loadState();
  const existing = state.milestones.find((m) => m.id === id);

  const milestone: Milestone = {
    id,
    name,
    description: options?.description,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    completedAt: existing?.completedAt ?? new Date().toISOString(),
    metadata: options?.metadata,
  };

  if (existing) {
    state.milestones = state.milestones.map((m) => (m.id === id ? milestone : m));
  } else {
    state.milestones.push(milestone);
  }

  state.lastUpdated = new Date().toISOString();
  saveState(state);

  return milestone;
}