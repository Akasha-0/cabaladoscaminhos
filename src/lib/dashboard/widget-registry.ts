// Widget registry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, { id: string; label: string; component: any }>();

/* eslint-disable @typescript-eslint/no-explicit-any */
export function registerWidget(id: string, label: string, component: any): void {
  registry.set(id, { id, label, component });
}

export function getWidget(id: string) {
  return registry.get(id);
}

export function listWidgets() {
  return Array.from(registry.values());
}
