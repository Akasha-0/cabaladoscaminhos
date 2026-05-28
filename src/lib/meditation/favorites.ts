const STORAGE_KEY = 'cabala_meditation_favorites';

export interface MeditationFavorite {
  id: string;
  title: string;
  category: string;
  addedAt: number;
}

function getStored(): MeditationFavorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: MeditationFavorite[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addFavorite(item: Omit<MeditationFavorite, 'addedAt'>): MeditationFavorite {
  const favorites = getStored();
  if (favorites.some((f) => f.id === item.id)) {
    return favorites.find((f) => f.id === item.id)!;
  }
  const favorite: MeditationFavorite = { ...item, addedAt: Date.now() };
  persist([...favorites, favorite]);
  return favorite;
}

export function getFavorites(): MeditationFavorite[] {
  return getStored();
}
