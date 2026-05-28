// ============================================================
// ORDER HISTORY - Cabala dos Caminhos
// ============================================================
// LocalStorage-based order history system
// ============================================================

const HISTORY_KEY = 'cabala-order-history';
const HISTORY_VERSION = '1';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistory {
  version: string;
  orders: Order[];
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function readHistory(): OrderHistory {
  if (typeof window === 'undefined') {
    return createEmptyHistory();
  }

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return createEmptyHistory();

    const parsed = JSON.parse(stored) as OrderHistory;
    return parsed.version === HISTORY_VERSION ? parsed : createEmptyHistory();
  } catch {
    return createEmptyHistory();
  }
}

function writeHistory(history: OrderHistory): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

function createEmptyHistory(): OrderHistory {
  return {
    version: HISTORY_VERSION,
    orders: [],
  };
}

// ============================================================
// PUBLIC API
// ============================================================

export function getOrderHistory(): Order[] {
  return readHistory().orders.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(orderId: string): Order | undefined {
  const history = readHistory();
  return history.orders.find((order) => order.id === orderId);
}

export function addOrder(order: Omit<Order, 'createdAt' | 'updatedAt'>): Order {
  const history = readHistory();
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...order,
    createdAt: now,
    updatedAt: now,
  };
  history.orders.unshift(newOrder);
  writeHistory(history);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order | null {
  const history = readHistory();
  const index = history.orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  history.orders[index].status = status;
  history.orders[index].updatedAt = new Date().toISOString();
  writeHistory(history);
  return history.orders[index];
}

export function clearOrderHistory(): void {
  writeHistory(createEmptyHistory());
}
