// Data store for infinite data operations

export interface InfiniteData {
  id: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const data: InfiniteData[] = [];

// Initialize with some seed data
for (let i = 0; i < 1000; i++) {
  data.push({
    id: `infinite-${i}`,
    value: i * Math.PI,
    timestamp: Date.now() + i,
    metadata: { index: i, source: 'infinite-seed' },
  });
}

export function getData(): InfiniteData[] {
  return data;
}

export function addData(item: Omit<InfiniteData, 'id' | 'timestamp'>): InfiniteData {
  const newItem: InfiniteData = {
    ...item,
    id: `infinite-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
