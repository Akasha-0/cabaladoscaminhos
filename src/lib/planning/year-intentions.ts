const STORAGE_KEY = 'year_intentions';

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface YearIntention {
  id: string;
  intention: string;
  description?: string;
  createdAt: string;
  year: number;
  milestones: Milestone[];
}

export interface YearProgress {
  year: number;
  intentions: YearIntention[];
  overallProgress: number;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function readStorage(): YearIntention[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(data: YearIntention[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function setYearIntention(
  intention: string,
  options?: {
    description?: string;
    milestones?: { title: string; targetDate: string }[];
  }
): YearIntention {
  const data = readStorage();
  const currentYear = getCurrentYear();

  // Remove any existing intention for this year
  const filtered = data.filter(i => i.year !== currentYear);

  const milestones: Milestone[] = (options?.milestones || []).map((m, index) => ({
    id: `${Date.now()}_${index}`,
    title: m.title,
    targetDate: m.targetDate,
    completed: false,
  }));

  const newIntention: YearIntention = {
    id: `${Date.now()}`,
    intention,
    description: options?.description,
    createdAt: new Date().toISOString(),
    year: currentYear,
    milestones,
  };

  filtered.push(newIntention);
  writeStorage(filtered);

  return newIntention;
}

export function getYearProgress(year?: number): YearProgress {
  const data = readStorage();
  const targetYear = year || getCurrentYear();

  const intentions = data.filter(i => i.year === targetYear);

  if (intentions.length === 0) {
    return {
      year: targetYear,
      intentions: [],
      overallProgress: 0,
    };
  }

  let totalMilestones = 0;
  let completedMilestones = 0;

  for (const intention of intentions) {
    totalMilestones += intention.milestones.length;
    completedMilestones += intention.milestones.filter(m => m.completed).length;
  }

  // Calculate based on milestones if any exist, otherwise 50% for active intention
  const overallProgress = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 50;

  return {
    year: targetYear,
    intentions,
    overallProgress,
  };
}

export function toggleMilestone(
  intentionId: string,
  milestoneId: string,
  completed: boolean
): void {
  const data = readStorage();
  const intentionIndex = data.findIndex(i => i.id === intentionId);

  if (intentionIndex === -1) return;

  const milestoneIndex = data[intentionIndex].milestones.findIndex(
    m => m.id === milestoneId
  );

  if (milestoneIndex === -1) return;

  data[intentionIndex].milestones[milestoneIndex].completed = completed;
  data[intentionIndex].milestones[milestoneIndex].completedAt = completed
    ? new Date().toISOString()
    : undefined;

  writeStorage(data);
}