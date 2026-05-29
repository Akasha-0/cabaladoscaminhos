// ============================================================
// CART MANAGEMENT - Cabala dos Caminhos
// ============================================================
// High-level cart management interface
// ============================================================

import {
  type Cart,
  type CartItem,
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  updateCartItemQuantity,
} from './cart';

export type { Cart, CartItem };

export interface CartOperation {
  type: 'add' | 'remove' | 'update' | 'clear' | 'fetch';
  itemId?: string;
  item?: Omit<CartItem, 'quantity'> & { quantity?: number };
  quantity?: number;
}

export interface CartManagementResult {
  cart: Cart;
  operation: CartOperation;
  success: boolean;
  error?: string;
}

/**
 * Manages cart operations with a unified interface
 */
export function manageCart(operation: CartOperation): CartManagementResult {
  try {
    let cart: Cart;

    switch (operation.type) {
      case 'add': {
        if (!operation.item) {
          return {
            cart: getCart(),
            operation,
            success: false,
            error: 'No item provided for add operation',
          };
        }
        cart = addToCart(operation.item);
        break;
      }

      case 'remove': {
        if (!operation.itemId) {
          return {
            cart: getCart(),
            operation,
            success: false,
            error: 'No itemId provided for remove operation',
          };
        }
        cart = removeFromCart(operation.itemId);
        break;
      }

      case 'update': {
        if (!operation.itemId || operation.quantity === undefined) {
          return {
            cart: getCart(),
            operation,
            success: false,
            error: 'Missing itemId or quantity for update operation',
          };
        }
        cart = updateCartItemQuantity(operation.itemId, operation.quantity);
        break;
      }

      case 'clear': {
        cart = clearCart();
        break;
      }

      case 'fetch':
      default: {
        cart = getCart();
        break;
      }
    }

    return { cart, operation, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown cart management error';
    return {
      cart: getCart(),
      operation,
      success: false,
      error: message,
    };
  }
}

/**
 * Type for quick add operation
 */
export type QuickAddItem = Omit<CartItem, 'quantity'> & { quantity?: number };

export function quickAdd(item: QuickAddItem): CartManagementResult {
  return manageCart({ type: 'add', item });
}

/**
 * Quick remove from cart
 */
export function quickRemove(itemId: string): CartManagementResult {
  return manageCart({ type: 'remove', itemId });
}

/**
 * Quick update quantity
 */
export function quickUpdate(itemId: string, quantity: number): CartManagementResult {
  return manageCart({ type: 'update', itemId, quantity });
}

/**
 * Quick fetch current cart
 */
export function fetchCart(): CartManagementResult {
  return manageCart({ type: 'fetch' });
}

/**
 * Get cart summary
 */
export function getCartSummary(): {
  itemCount: number;
  total: number;
  items: CartItem[];
} {
  const cart = getCart();
  return {
    itemCount: getCartItemCount(),
    total: getCartTotal(),
    items: cart.items,
  };
}

/**
 * Check if cart has items
 */
export function hasItems(): boolean {
  return getCartItemCount() > 0;
}