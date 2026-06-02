const STORAGE_KEY = 'gamification_achievements';

export type AchievementCategory = 'prática' | 'conhecimento' | 'streak';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  target?: number;
}

const achievementDefinitions: AchievementDefinition[] = [
  // Prática
  { id: 'first-meditation', title: 'Primeiro Passo', description: 'Complete sua primeira meditação', category: 'prática' },
  { id: 'ten-meditations', title: 'Dedicação', description: 'Complete 10 meditações', category: 'prática', target: 10 },
  { id: 'fifty-meditations', title: 'Caminhante', description: 'Complete 50 meditações', category: 'prática', target: 50 },
  { id: 'hundred-meditations', title: 'Mestre Interior', description: 'Complete 100 meditações', category: 'prática', target: 100 },
  { id: 'ritual-beginner', title: 'Iniciante Ritual', description: 'Realize seu primeiro ritual', category: 'prática' },
  { id: 'ritual-five', title: 'Guardião do Sagrado', description: 'Complete 5 rituais', category: 'prática', target: 5 },
  { id: 'tarot-first', title: 'Primeira Leitura', description: 'Receba sua primeira leitura de tarot', category: 'prática' },
  { id: 'tarot-ten', title: 'Explorador Tarot', description: 'Receba 10 leituras de tarot', category: 'prática', target: 10 },
  { id: ' affirmations-daily', title: 'Renovação Diária', description: 'Use affirmations por 7 dias consecutivos', category: 'prática', target: 7 },
  { id: 'mapa-natal', title: 'Autoconhecimento', description: 'Gere seu mapa natal', category: 'prática' },

  // Conhecimento
  { id: 'sefirot-explorer', title: 'Explorador das Sefirot', description: 'Estude as 10 sefirot', category: 'conhecimento', target: 10 },
  { id: 'paths-first', title: 'Primeiros Passos', description: 'Estude seu primeiro caminho da Árvore da Vida', category: 'conhecimento' },
  { id: 'paths-five', title: 'Caminhante da Árvore', description: 'Estude 5 caminhos da Árvore da Vida', category: 'conhecimento', target: 5 },
  { id: 'paths-all', title: 'Mestre da Árvore', description: 'Estude todos os 22 caminhos da Árvore da Vida', category: 'conhecimento', target: 22 },
  { id: 'numerologia-init', title: 'Primeiros Números', description: 'Calcule sua numerologia pela primeira vez', category: 'conhecimento' },
  { id: 'ciclos-understand', title: 'Entendedor dos Ciclos', description: 'Estude todos os 9 ciclos de vida', category: 'conhecimento', target: 9 },
  { id: 'houses-astrology', title: 'Casas Astrológicas', description: 'Explore as 12 casas astrológicas', category: 'conhecimento', target: 12 },
  { id: 'elements-master', title: 'Mestre dos Elementos', description: 'Estude todos os 4 elementos', category: 'conhecimento', target: 4 },
  { id: 'moon-phases', title: 'Filho da Lua', description: 'Acompanhe todas as fases da lua por um ciclo', category: 'conhecimento' },
  { id: 'planets-solar', title: 'Viajante Cósmico', description: 'Estude todos os planetas do sistema solar', category: 'conhecimento', target: 7 },

  // Streak
  { id: 'streak-three', title: 'Semente', description: 'Mantenha uma sequência de 3 dias', category: 'streak', target: 3 },
  { id: 'streak-seven', title: 'Semana Sagrada', description: 'Mantenha uma sequência de 7 dias', category: 'streak', target: 7 },
  { id: 'streak-fourteen', title: 'Quinzena', description: 'Mantenha uma sequência de 14 dias', category: 'streak', target: 14 },
  { id: 'streak-thirty', title: 'Mês de Prática', description: 'Mantenha uma sequência de 30 dias', category: 'streak', target: 30 },
  { id: 'streak-sixty', title: 'Guardião', description: 'Mantenha uma sequência de 60 dias', category: 'streak', target: 60 },
  { id: 'streak-ninety', title: 'Dedicado', description: 'Mantenha uma sequência de 90 dias', category: 'streak', target: 90 },
  { id: 'streak-one-eighty', title: 'Seis Meses', description: 'Mantenha uma sequência de 180 dias', category: 'streak', target: 180 },
  { id: 'streak-three-sixty-five', title: 'Ano de Luz', description: 'Mantenha uma sequência de 365 dias', category: 'streak', target: 365 },
  { id: 'streak-milestone', title: 'Marco Estelar', description: 'Alcance qualquer marco de sequência', category: 'streak' },
  { id: 'comeback', title: 'Retorno', description: 'Retorne após uma pausa de 7+ dias', category: 'streak' },
];

interface AchievementStore {
  [achievementId: string]: {
    unlockedAt: string;
    progress?: number;
  };
}

function readStorage(): AchievementStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: AchievementStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function getAchievements(): Achievement[] {
  const store = readStorage();
  return achievementDefinitions.map((def) => {
    const stored = store[def.id];
    return {
      ...def,
      unlockedAt: stored?.unlockedAt,
      progress: stored?.progress,
    };
  });
}

export function getAchievementById(id: string): Achievement | undefined {
  return getAchievements().find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return getAchievements().filter((a) => a.category === category);
}

export function unlockAchievement(id: string, progress?: number): boolean {
  const store = readStorage();
  const def = achievementDefinitions.find((a) => a.id === id);
  if (!def) return false;
  if (store[id]?.unlockedAt) return false;

  store[id] = {
    unlockedAt: new Date().toISOString(),
    progress: progress ?? def.target,
  };
  writeStorage(store);
  return true;
}

function updateProgress(id: string, progress: number): void {
  const store = readStorage();
  const def = achievementDefinitions.find((a) => a.id === id);
  if (!def || store[id]?.unlockedAt) return;

  store[id] = {
    ...store[id],
    progress,
  };
  writeStorage(store);

  if (def.target && progress >= def.target) {
    unlockAchievement(id, progress);
  }
}

export function getUnlockedCount(): number {
  return getAchievements().filter((a) => a.unlockedAt).length;
}

export function getTotalCount(): number {
  return achievementDefinitions.length;
}

export function getCompletionPercentage(): number {
  const total = getTotalCount();
  if (total === 0) return 0;
  return Math.round((getUnlockedCount() / total) * 100);
}

function getRecentAchievements(limit: number = 5): Achievement[] {
  return getAchievements()
    .filter((a) => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit);
}