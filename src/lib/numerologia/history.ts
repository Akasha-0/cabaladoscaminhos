export interface NumerologyCalculation {
  id: string;
  timestamp: number;
  type: 'life-path' | 'expression' | 'soul-urge' | 'personality' | 'compatibility';
  input: string;
  result: number;
  interpretation?: string;
}

const STORAGE_KEY = 'numerologia-history';

export function saveCalculation(calculation: Omit<NumerologyCalculation, 'id' | 'timestamp'>): NumerologyCalculation {
  const history = getHistory();
  const entry: NumerologyCalculation = {
    ...calculation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(entry);
  if (history.length > 100) {
    history.pop();
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
  return entry;
}

export function getHistory(): NumerologyCalculation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as NumerologyCalculation[];
  } catch {
    return [];
  }
}