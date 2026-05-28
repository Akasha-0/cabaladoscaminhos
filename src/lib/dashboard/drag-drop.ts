export interface WidgetItem {
  id: string;
  order: number;
}

export function reorderWidgets<T extends WidgetItem>(
  items: T[],
  sourceId: string,
  destinationIndex: number
): T[] {
  const result = [...items];
  const sourceIndex = result.findIndex((item) => item.id === sourceId);
  if (sourceIndex === -1) {
    return result;
  }
  const [moved] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, moved);
  return result.map((item, index) => ({ ...item, order: index }));
}

export function saveLayout(key: string, layout: WidgetItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // storage unavailable
  }
}

export function loadLayout<T extends WidgetItem>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
