/**
 * uptime.ts — process uptime tracker for /api/health (Wave 12.2)
 *
 * Verifica que `getUptimeSeconds()` retorna um inteiro não-negativo
 * consistente com o tempo decorrido desde o module load.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('lib/shared/uptime — Wave 12.2', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-24T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna 0 imediatamente após o module load', async () => {
    // Importa em momento controlado para fixar SERVER_START_MS = now.
    const { getUptimeSeconds } = await import('@/lib/shared/uptime');
    expect(getUptimeSeconds()).toBe(0);
  });

  it('retorna segundos decorridos conforme o tempo passa', async () => {
    const { getUptimeSeconds } = await import('@/lib/shared/uptime');
    // Avança 90s no fake clock
    vi.setSystemTime(new Date('2026-06-24T12:01:30.000Z'));
    expect(getUptimeSeconds()).toBe(90);
  });

  it('clamp em 0 se o relógio for anterior ao server start (clock skew)', async () => {
    const { getUptimeSeconds } = await import('@/lib/shared/uptime');
    // Volta o relógio para antes do module load
    vi.setSystemTime(new Date('2026-06-24T11:59:00.000Z'));
    expect(getUptimeSeconds()).toBe(0);
  });

  it('getServerStartMs retorna um timestamp positivo', async () => {
    const { getServerStartMs } = await import('@/lib/shared/uptime');
    const start = getServerStartMs();
    expect(typeof start).toBe('number');
    expect(start).toBeGreaterThan(0);
    // Deve ser próximo do "agora" controlado pelo fake timer
    expect(start).toBe(new Date('2026-06-24T12:00:00.000Z').getTime());
  });
});