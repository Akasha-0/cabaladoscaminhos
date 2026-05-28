// ============================================================
// WISHLIST - Cabala dos Caminhos
// ============================================================
// LocalStorage-based wishlist system
// ============================================================

const WISHLIST_KEY = 'cabala-wishlist';
const WISHLIST_VERSION = '1';

// ============================================================
// TYPES
// ============================================================

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

export interface Wishlist {
  version: string;
  items: WishlistItem[];
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function readWishlist(): Wishlist {
  if (typeof window === 'undefined') {
    return createEmptyWishlist();
  }
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (!stored) return createEmptyWishlist();
    const parsed = JSON.parse(stored) as Wishlist;
    if (parsed.version !== WISHLIST_VERSION) return createEmptyWishlist();
    return parsed;
  } catch {
    return createEmptyWishlist();
  }
}

function writeWishlist(wishlist: Wishlist): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch {
    // Storage full or unavailable
  }
}

function createEmptyWishlist(): Wishlist {
  return {
    version: WISHLIST_VERSION,
    items: [],
  };
}

// ============================================================
// PUBLIC API
// ============================================================

export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>): Wishlist {
  const wishlist = readWishlist();
  const exists = wishlist.items.some(i => i.id === item.id);
  if (!exists) {
    wishlist.items.push({
      ...item,
      addedAt: Date.now(),
    });
    writeWishlist(wishlist);
  }
  return wishlist;
}

export function removeFromWishlist(itemId: string): Wishlist {
  const wishlist = readWishlist();
  wishlist.items = wishlist.items.filter(i => i.id !== itemId);
  writeWishlist(wishlist);
  return wishlist;
}

export function getWishlist(): Wishlist {
  return readWishlist();
}

export function clearWishlist(): Wishlist {
  const wishlist = createEmptyWishlist();
  writeWishlist(wishlist);
  return wishlist;
}

export function isInWishlist(itemId: string): boolean {
  const wishlist = readWishlist();
  return wishlist.items.some(i => i.id === itemId);
}

export function getWishlistItemCount(): number {
  return readWishlist().items.length;
}
