// Wishlist Management

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: Date;
  notes?: string;
}

export interface WishlistManager {
  add: (userId: string, productId: string, notes?: string) => Promise<WishlistItem>;
  remove: (userId: string, productId: string) => Promise<void>;
  get: (userId: string) => Promise<WishlistItem[]>;
  has: (userId: string, productId: string) => Promise<boolean>;
  clear: (userId: string) => Promise<void>;
}

function createWishlistStore() {
  const store = new Map<string, WishlistItem[]>();

  return {
    get(userId: string): WishlistItem[] {
      return store.get(userId) ?? [];
    },
    add(item: WishlistItem): void {
      const existing = store.get(item.userId) ?? [];
      const updated = existing.filter(i => i.productId !== item.productId);
      updated.push(item);
      store.set(item.userId, updated);
    },
    remove(userId: string, productId: string): void {
      const existing = store.get(userId) ?? [];
      store.set(userId, existing.filter(i => i.productId !== productId));
    },
    clear(userId: string): void {
      store.delete(userId);
    },
  };
}

const wishlistStore = createWishlistStore();

export function manageWishlist(): WishlistManager {
  return {
    async add(userId: string, productId: string, notes?: string): Promise<WishlistItem> {
      const item: WishlistItem = {
        id: `${userId}-${productId}-${Date.now()}`,
        productId,
        userId,
        addedAt: new Date(),
        notes,
      };
      wishlistStore.add(item);
      return item;
    },

    async remove(userId: string, productId: string): Promise<void> {
      wishlistStore.remove(userId, productId);
    },

    async get(userId: string): Promise<WishlistItem[]> {
      return wishlistStore.get(userId);
    },

    async has(userId: string, productId: string): Promise<boolean> {
      const items = wishlistStore.get(userId);
      return items.some(i => i.productId === productId);
    },

    async clear(userId: string): Promise<void> {
      wishlistStore.clear(userId);
    },
  };
}