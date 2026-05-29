// ============================================================
// CART PERSISTENCE - Cabala dos Caminhos
// ============================================================

import type { Cart } from './cart';

const CART_KEY = 'cabala-cart';
const CART_VERSION = '1';

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage full or unavailable
  }
}

export function loadCart(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return createEmptyCart();
    const cart = JSON.parse(stored) as Cart;
    if (cart.version !== CART_VERSION) return createEmptyCart();
    return cart;
  } catch {
    return createEmptyCart();
  }
}

function createEmptyCart(): Cart {
  return {
    version: CART_VERSION,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}