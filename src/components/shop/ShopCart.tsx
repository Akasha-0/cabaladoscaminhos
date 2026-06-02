// fallow-ignore-file unused-file
"use client";

import { useState, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShopCartProps {
  initialItems?: CartItem[];
  onCheckout?: (items: CartItem[]) => void;
  onItemRemove?: (itemId: string) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
}

export function ShopCart({
  initialItems = [],
  onCheckout,
  onItemRemove,
  onQuantityChange,
}: ShopCartProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      onItemRemove?.(itemId);
    },
    [onItemRemove]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
      onQuantityChange?.(itemId, quantity);
    },
    [onQuantityChange]
  );

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shop-cart">
      <div className="cart-header">
        <h2>Carrinho ({itemCount})</h2>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Seu carrinho está vazio</p>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                {item.image && (
                  <img src={item.image} alt={item.name} className="item-image" />
                )}
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <div className="item-subtotal">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="remove-btn"
                  aria-label="Remover item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => onCheckout?.(items)}
              className="checkout-btn"
            >
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ShopCart;
