// ============================================================
// SHOPPING CART - Cabala dos Caminhos
// ============================================================
// LocalStorage-based shopping cart system
// ============================================================

const CART_KEY = 'cabala-cart';
const CART_VERSION = '1';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface Cart {
  version: string;
  items: CartItem[];
  updatedAt: string;
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function readCart(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return createEmptyCart();

    const parsed = JSON.parse(stored) as Cart;
    return parsed.version === CART_VERSION ? parsed : createEmptyCart();
  } catch {
    return createEmptyCart();
  }
}

function writeCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  try {
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

function createEmptyCart(): Cart {
  return {
    version: CART_VERSION,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================
// PUBLIC API
// ============================================================

export function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): Cart {
  const cart = readCart();
  const quantity = item.quantity ?? 1;

  const existingIndex = cart.items.findIndex((i) => i.id === item.id);
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ ...item, quantity });
  }

  writeCart(cart);
  return cart;
}

export function removeFromCart(itemId: string): Cart {
  const cart = readCart();
  cart.items = cart.items.filter((i) => i.id !== itemId);
  writeCart(cart);
  return cart;
}

export function getCart(): Cart {
  return readCart();
}

export function updateCart(partial: Partial<Pick<Cart, 'items'>>): Cart {
  const cart = readCart();
  if (partial.items) {
    cart.items = partial.items;
  }
  writeCart(cart);
  return cart;
}

export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
  const cart = readCart();
  const index = cart.items.findIndex((i) => i.id === itemId);

  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
  }

  writeCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const cart = createEmptyCart();
  writeCart(cart);
  return cart;
}

export function getCartTotal(): number {
  const cart = readCart();
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemCount(): number {
  const cart = readCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}