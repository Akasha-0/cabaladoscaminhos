// fallow-ignore-file unused-file
// ============================================================
// TRANSACTION HISTORY - Cabala dos Caminhos
// ============================================================
// LocalStorage-based transaction history system
// ============================================================

const HISTORY_KEY = 'cabala-transaction-history';

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  balanceAfter: number;
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function readHistory(): Transaction[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Transaction[];
  } catch {
    return [];
  }
}

function writeHistory(history: Transaction[]): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

// ============================================================
// PUBLIC API
// ============================================================

export function getHistory(): Transaction[] {
  return readHistory();
}

export function addTransaction(
  transaction: Omit<Transaction, 'id' | 'timestamp'>
): Transaction {
  const history = readHistory();
  const entry: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(entry);
  writeHistory(history);
  return entry;
}

export function clearHistory(): void {
  writeHistory([]);
}
