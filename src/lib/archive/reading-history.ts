// Reading history for archive

export type HistoryEntry = {
  id: string;
  type: 'article' | 'report' | 'document' | 'material';
  title: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

const history: HistoryEntry[] = [];

export function getHistory(): HistoryEntry[] {
  return [...history];
}

export function addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const fullEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.push(fullEntry);
}