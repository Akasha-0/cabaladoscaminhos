
export interface EnergySnapshot {
  timestamp: number;
  data: unknown;
}

export function getHistory(): EnergySnapshot[] {
  try {
    const raw = localStorage.getItem('energy-history');
    if (!raw) return [];
    return JSON.parse(raw) as EnergySnapshot[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: unknown): void {
  try {
    const history = getHistory();
    history.unshift({
      timestamp: Date.now(),
      data: entry,
    });
    localStorage.setItem('energy-history', JSON.stringify(history));
  } catch {
    // storage unavailable
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem('energy-history');
  } catch {
    // storage unavailable
  }
}
