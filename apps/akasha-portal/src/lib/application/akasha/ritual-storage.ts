/**
 * Storage in-memory para configurações de Ritual.
 *
 * ATENÇÃO: Este storage é por processo. Em produção com múltiplas
 * instâncias, usar Prisma ou Redis para persistência compartilhada.
 */
import type { RitualConfig } from '@akasha/core';

const ritualConfigs = new Map<string, RitualConfig>();

export function getRitualConfig(userId: string): RitualConfig | undefined {
  return ritualConfigs.get(userId);
}

export function setRitualConfig(userId: string, config: RitualConfig): void {
  ritualConfigs.set(userId, config);
}

export function deleteRitualConfig(userId: string): boolean {
  return ritualConfigs.delete(userId);
}
