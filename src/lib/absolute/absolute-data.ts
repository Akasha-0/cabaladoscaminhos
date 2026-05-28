// Data store for absolute data operations

export interface AbsoluteData {
  id: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const data: AbsoluteData[] = [];

// Initialize with some seed data
for (let i = 0; i < 1000; i++) {
  data.push({
    id: `absolute-${i}`,
    value: i * Math.PI,
    timestamp: Date.now() + i,
    metadata: { index: i, source: 'absolute-seed' },
  });
}

export function getData(): AbsoluteData[] {
  return data;
}

export function addData(item: Omit<AbsoluteData, 'id' | 'timestamp'>): AbsoluteData {
  const newItem: AbsoluteData = {
    ...item,
    id: `absolute-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  data.push(newItem);
  return newItem;
}

export function clearData(): void {
  data.length = 0;
}

export function getDataLength(): number {
  return data.length;
}