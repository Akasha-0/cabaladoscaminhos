export interface Favorite {
  id: string;
  createdAt: number;
}

const STORAGE_KEY = 'cabala_favorites';

export function getFavorites(): Favorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addFavorite(id: string): void {
  const favorites = getFavorites();
  if (favorites.some((f) => f.id === id)) return;
  favorites.push({ id, createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(id: string): void {
  if (getFavorites().some((f) => f.id === id)) {
    removeFavorite(id);
  } else {
    addFavorite(id);
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}
