/**
 * @akasha/memory — Wave 31.5 Long-term Memory Distillation MVP
 *
 * Public barrel. Re-exporta o pipeline completo de consolidação:
 *   - consolidate()           — entrypoint principal
 *   - distillClusters()       — heurística de clustering
 *   - InMemoryStorage         — implementação in-memory para tests
 *   - normalizeAnchor()       — helpers de data
 *
 * Decisão de design: package é puro TypeScript (sem deps de runtime).
 * A integração com Prisma acontece fora (em apps/akasha-portal), via
 * adapters injetados. Isso permite testar sem DB e mantém o package
 * leve.
 */

export * from './types.js';
export * from './distillation.js';
export * from './storage.js';
export * from './consolidator.js';
