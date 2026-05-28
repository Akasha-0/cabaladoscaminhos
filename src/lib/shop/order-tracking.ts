const STORAGE_KEY = 'order_tracking';

export interface OrderTracking {
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  updatedAt: string;
}

function loadTracking(): OrderTracking[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTracking(orders: OrderTracking[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function trackOrder(orderId: string): OrderTracking | null {
  const orders = loadTracking();
  return orders.find((o) => o.orderId === orderId) ?? null;
}

export function saveOrderTracking(order: OrderTracking): void {
  const orders = loadTracking();
  const idx = orders.findIndex((o) => o.orderId === order.orderId);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  saveTracking(orders);
}
