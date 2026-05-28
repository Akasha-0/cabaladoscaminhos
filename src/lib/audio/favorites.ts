const STORAGE_KEY = 'cabala_favorites';

export interface Favorite {
  id: string;
  title: string;
  url: string;
  addedAt: number;
}

function getStored(): Favorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: Favorite[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addFavorite(item: Omit<Favorite, 'addedAt'>): Favorite {
  const favorites = getStored();
  if (favorites.some((f) => f.id === item.id)) return favorites.find((f) => f.id === item.id)!;
  const favorite: Favorite = { ...item, addedAt: Date.now() };
  persist([...favorites, favorite]);
  return favorite;
}

export function getFavorites(): Favorite[] {
  return getStored();
}
