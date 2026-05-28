/**
 * Daily missions system
 * Provides user-facing goals that reset each day
 */

export type MissionCategory = 'prática' | 'conhecimento' | 'social' | 'exploração';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  xpReward: number;
  completedAt?: string | null; // ISO timestamp
}

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  xpReward: number;
}

const MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    id: 'meditar',
    title: 'Prática do Dia',
    description: 'Complete uma sessão de meditação guiada',
    category: 'prática',
    xpReward: 50,
  },
  {
    id: 'respirar',
    title: 'Respiração Consciente',
    description: 'Pratique 3 minutos de respiração holotrópica',
    category: 'prática',
    xpReward: 30,
  },
  {
    id: 'ler-mapa',
    title: 'Estudo do Mapa',
    description: 'Revise seu mapa natal completo',
    category: 'conhecimento',
    xpReward: 40,
  },
  {
    id: 'ciclos',
    title: 'Reflexão Cíclica',
    description: 'Analise seus ciclos astrológicos do dia',
    category: 'conhecimento',
    xpReward: 35,
  },
  {
    id: 'numeros',
    title: 'Harmonia Numérica',
    description: 'Calcule seu número do dia e reflita',
    category: 'conhecimento',
    xpReward: 25,
  },
  {
    id: 'geometria',
    title: 'Geometria Sagrada',
    description: 'Explore um símbolo de geometria sagrada',
    category: 'exploração',
    xpReward: 30,
  },
  {
    id: 'ritual',
    title: 'Ritual Personalizado',
    description: 'Crie ou execute um ritual do dia',
    category: 'prática',
    xpReward: 60,
  },
  {
    id: 'compartilhar',
    title: 'Compartilhar Saberes',
    description: 'Indique um recurso a um amigo',
    category: 'social',
    xpReward: 45,
  },
];

const MISSIONS_STORAGE_KEY = 'gamification_daily_missions';
const DATE_KEY = 'gamification_missions_date';

interface MissionStore {
  missions: Mission[];
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function readStorage(): MissionStore {
  if (typeof window === 'undefined') {
    return { missions: [] };
  }
  try {
    const raw = localStorage.getItem(MISSIONS_STORAGE_KEY);
    if (!raw) return { missions: [] };
    return JSON.parse(raw) as MissionStore;
  } catch {
    return { missions: [] };
  }
}

function writeStorage(data: MissionStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded or unavailable
  }
}

function getStoredDate(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DATE_KEY);
}

function setStoredDate(date: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DATE_KEY, date);
}

function isNewDay(): boolean {
  const today = getTodayString();
  const stored = getStoredDate();
  return stored !== today;
}

function buildDailyMissions(): Mission[] {
  const shuffled = [...MISSION_DEFINITIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((def) => ({
    ...def,
    completedAt: null,
  }));
}

/**
 * Returns today's missions, refreshing if the day has changed
 */
export function getDailyMissions(): Mission[] {
  if (isNewDay()) {
    const missions = buildDailyMissions();
    writeStorage({ missions });
    setStoredDate(getTodayString());
    return missions;
  }
  return readStorage().missions;
}

/**
 * Marks a mission as completed and returns the updated mission.
 * Returns undefined if the mission id does not exist in today's set.
 */
export function completeMission(id: string): Mission | undefined {
  const today = getTodayString();
  const store = readStorage();

  const idx = store.missions.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;

  store.missions[idx] = {
    ...store.missions[idx],
    completedAt: today,
  };

  writeStorage(store);
  return store.missions[idx];
}

/**
 * Returns missions from yesterday (for recovery or stats)
 */
export function getCompletedCount(): number {
  return getDailyMissions().filter((m) => m.completedAt).length;
}

/**
 * Returns total missions for the day
 */
export function getTotalMissionCount(): number {
  return getDailyMissions().length;
}

/**
 * Returns completion percentage for today
 */
export function getMissionCompletionPercentage(): number {
  const total = getTotalMissionCount();
  if (total === 0) return 0;
  return Math.round((getCompletedCount() / total) * 100);
}

/**
 * Returns the mission object for a specific id if it exists today
 */
export function getMissionById(id: string): Mission | undefined {
  return getDailyMissions().find((m) => m.id === id);
}