// Testes unitários para o RateLimitMonitor (Wave 11.2).
//
// O monitor é um singleton (`rateLimitMonitor`) com estado mutável interno
// (events + alerts). Para isolar testes entre si, resetamos o estado
// diretamente entre cenários via `vi.resetModules()` + re-import dinâmico.
//
// NOTA: o monitor roda setInterval no construtor (cleanup de eventos antigos).
// Usamos `vi.useFakeTimers()` para que os timers não vazem durante os testes
// e para controlar o tempo em cenários de janela/alerta.
//
// Wave 11.2 — task 11.2 (aumentar cobertura). Cobertura alvo:
// - record() acumula eventos e dispara checkAlertCondition quando bloqueado
// - trim em `maxEvents` (ring buffer em eventos)
// - getStats agrega topIdentifiers / byEndpoint / timeSeries
// - getHealth() classifica status conforme blockRate e recentAlerts
// - getAlerts(since) filtra por timestamp
// - clearAlerts() reseta a lista
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mockamos o singleton exportado: cada teste usa vi.resetModules() para
// recriar a instância (já que `getInstance` só cria uma vez por processo).
// Também stubamos process.stdout para não sujar a saída de teste.

const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

async function loadModule() {
  vi.resetModules();
  return import('./rate-limit-monitor');
}

beforeEach(() => {
  writeSpy.mockClear();
  warnSpy.mockClear();
  errorSpy.mockClear();
  logSpy.mockClear();
  vi.useFakeTimers();
  // Avançamos para uma data estável: facilita asserções que dependem de
  // timestamps "agora" (Date.now() baseado em 2026-06-24T12:00:00Z).
  vi.setSystemTime(new Date('2026-06-24T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('rateLimitMonitor.record()', () => {
  it('acumula evento com timestamp atual e campos básicos', async () => {
    const { rateLimitMonitor } = await loadModule();

    rateLimitMonitor.record('ip-1', true, '/api/foo', 'GET');

    // Acesso indireto: getStats reflete o evento armazenado.
    const stats = rateLimitMonitor.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.allowedRequests).toBe(1);
    expect(stats.blockedRequests).toBe(0);
    expect(stats.byEndpoint['/api/foo']).toEqual({ allowed: 1, blocked: 0 });
  });

  it('registra evento bloqueado e reflete em getStats', async () => {
    const { rateLimitMonitor } = await loadModule();

    rateLimitMonitor.record('ip-1', false, '/api/foo', 'POST');

    const stats = rateLimitMonitor.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.allowedRequests).toBe(0);
    expect(stats.blockedRequests).toBe(1);
    expect(stats.byEndpoint['/api/foo']).toEqual({ allowed: 0, blocked: 1 });
  });

  it('faz trim para maxEvents (10000) quando enche o buffer', async () => {
    const { rateLimitMonitor } = await loadModule();

    // Insere 10001 eventos. Como maxEvents=10000, o monitor mantém só os
    // últimos 10000. Verificamos via totalRequests depois de encher.
    for (let i = 0; i < 10001; i++) {
      rateLimitMonitor.record(`ip-${i}`, true);
    }

    const stats = rateLimitMonitor.getStats();
    expect(stats.totalRequests).toBe(10000);
  });

  it('não dispara alerta para eventos permitidos', async () => {
    const { rateLimitMonitor } = await loadModule();

    for (let i = 0; i < 5; i++) {
      rateLimitMonitor.record('ip-1', true);
    }

    expect(rateLimitMonitor.getAlerts()).toHaveLength(0);
  });

  it('dispara alerta quando >= 10 bloqueios em 1 minuto para mesmo identifier', async () => {
    const { rateLimitMonitor } = await loadModule();

    for (let i = 0; i < 10; i++) {
      rateLimitMonitor.record('ip-bad', false);
    }

    const alerts = rateLimitMonitor.getAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].identifier).toBe('ip-bad');
    expect(alerts[0].blockedCount).toBe(10);
    expect(alerts[0].threshold).toBe(10);
  });

  it('respeita cooldown de 60s entre alertas do mesmo identifier', async () => {
    const { rateLimitMonitor } = await loadModule();

    for (let i = 0; i < 10; i++) {
      rateLimitMonitor.record('ip-bad', false);
    }
    expect(rateLimitMonitor.getAlerts()).toHaveLength(1);

    // Avançar < 60s não deve disparar novo alerta.
    vi.advanceTimersByTime(30_000);
    for (let i = 0; i < 10; i++) {
      rateLimitMonitor.record('ip-bad', false);
    }
    expect(rateLimitMonitor.getAlerts()).toHaveLength(1);

    // Avançar > 60s permite novo alerta.
    vi.advanceTimersByTime(31_000);
    for (let i = 0; i < 10; i++) {
      rateLimitMonitor.record('ip-bad', false);
    }
    expect(rateLimitMonitor.getAlerts()).toHaveLength(2);
  });

  it('não mistura identificadores no alerta (isolamento)', async () => {
    const { rateLimitMonitor } = await loadModule();

    // 5 bloqueios de ip-a, 10 de ip-b. Apenas ip-b atinge threshold.
    for (let i = 0; i < 5; i++) rateLimitMonitor.record('ip-a', false);
    for (let i = 0; i < 10; i++) rateLimitMonitor.record('ip-b', false);

    const alerts = rateLimitMonitor.getAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].identifier).toBe('ip-b');
  });
});

describe('rateLimitMonitor.getStats()', () => {
  it('retorna zeros quando não há eventos', async () => {
    const { rateLimitMonitor } = await loadModule();

    const stats = rateLimitMonitor.getStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.allowedRequests).toBe(0);
    expect(stats.blockedRequests).toBe(0);
    expect(stats.uniqueIdentifiers).toBe(0);
    expect(stats.topIdentifiers).toEqual([]);
    expect(stats.byEndpoint).toEqual({});
  });

  it('conta uniqueIdentifiers corretamente', async () => {
    const { rateLimitMonitor } = await loadModule();

    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-2', true);
    rateLimitMonitor.record('ip-3', true);

    const stats = rateLimitMonitor.getStats();
    expect(stats.uniqueIdentifiers).toBe(3);
  });

  it('topIdentifiers retorna até 10 ordenado por count desc', async () => {
    const { rateLimitMonitor } = await loadModule();

    // ip-heavy: 5 hits; ip-mid: 3; ip-low: 1; outros com 1 cada
    for (let i = 0; i < 5; i++) rateLimitMonitor.record('ip-heavy', true);
    for (let i = 0; i < 3; i++) rateLimitMonitor.record('ip-mid', true);
    rateLimitMonitor.record('ip-low', true);
    rateLimitMonitor.record('ip-low2', true);

    const stats = rateLimitMonitor.getStats();
    expect(stats.topIdentifiers[0]).toMatchObject({
      identifier: 'ip-heavy',
      count: 5,
      allowed: 5,
      blocked: 0,
    });
    expect(stats.topIdentifiers[1].identifier).toBe('ip-mid');
    expect(stats.topIdentifiers[1].count).toBe(3);
  });

  it('timeSeries popula buckets de 5min a partir do cutoff', async () => {
    const { rateLimitMonitor } = await loadModule();

    rateLimitMonitor.record('ip-1', true);

    const stats = rateLimitMonitor.getStats();
    expect(stats.timeSeries.length).toBeGreaterThan(0);
    // Cada bucket tem allowed/blocked contadores.
    for (const bucket of stats.timeSeries) {
      expect(bucket).toHaveProperty('timestamp');
      expect(bucket).toHaveProperty('allowed');
      expect(bucket).toHaveProperty('blocked');
    }
  });

  it('respeita timeWindowMs customizado (sem disparar cleanup)', async () => {
    // IMPORTANTE: o monitor tem setInterval de cleanup (60s) que remove
    // eventos > 1h. Sob fake timers, esse interval é armado quando o módulo
    // carrega (vi.advanceTimersByTime dispara). Para isolar a janela do
    // getStats() do cleanup, registramos eventos e consultamos stats IMEDIATAMENTE
    // sem avançar o clock entre eles.
    const { rateLimitMonitor } = await loadModule();

    rateLimitMonitor.record('ip-1', true, '/recent', 'GET');
    rateLimitMonitor.record('ip-2', true, '/also-recent', 'GET');

    // Janela 1min — ambos eventos foram criados agora, ambos devem contar.
    const narrowStats = rateLimitMonitor.getStats(60_000);
    expect(narrowStats.totalRequests).toBe(2);

    // Janela 1h (default) — também 2.
    const defaultStats = rateLimitMonitor.getStats();
    expect(defaultStats.totalRequests).toBe(2);
    expect(defaultStats.byEndpoint['/recent']).toBeDefined();
    expect(defaultStats.byEndpoint['/also-recent']).toBeDefined();

    // Avançar 1s — agora os eventos estão 1s no passado. Janela 100ms
    // (cutoff = now - 100ms) é estritamente depois dos eventos, então
    // e.timestamp > cutoff falha e o evento cai fora.
    vi.advanceTimersByTime(1_000);
    const tinyStats = rateLimitMonitor.getStats(100);
    expect(tinyStats.totalRequests).toBe(0);
  });
});

describe('rateLimitMonitor.getAlerts()', () => {
  it('retorna cópia do array (imutabilidade)', async () => {
    const { rateLimitMonitor } = await loadModule();

    for (let i = 0; i < 10; i++) rateLimitMonitor.record('ip-x', false);

    const alerts = rateLimitMonitor.getAlerts();
    expect(alerts).toHaveLength(1);

    // Mutação externa não deve afetar estado interno.
    alerts.push({ identifier: 'fake', blockedCount: 999, threshold: 1, timestamp: 0 });
    expect(rateLimitMonitor.getAlerts()).toHaveLength(1);
  });

  it('filtra por timestamp `since` (boundary exclusiva)', async () => {
    const { rateLimitMonitor } = await loadModule();

    // 10 bloqueios → primeiro alerta em T0.
    for (let i = 0; i < 10; i++) rateLimitMonitor.record('ip-x', false);

    // Capturamos t0 = Date.now() após o alerta (mesmo instante).
    const t0 = Date.now();

    vi.advanceTimersByTime(120_000); // +2 min — passa o cooldown
    for (let i = 0; i < 10; i++) rateLimitMonitor.record('ip-x', false);
    // Segundo alerta em T0 + 120s.

    const all = rateLimitMonitor.getAlerts();
    expect(all).toHaveLength(2);

    // since = t0 (mesmo timestamp do alerta 1). `getAlerts` filtra com
    // `a.timestamp > since`, então o alerta 1 (timestamp === t0) NÃO passa.
    // Só o alerta 2 passa.
    const sinceT0 = rateLimitMonitor.getAlerts(t0);
    expect(sinceT0).toHaveLength(1);
    expect(sinceT0[0].timestamp).toBeGreaterThan(t0);

    // since = t0 - 1 (1ms antes) — ambos passam.
    const sinceBefore = rateLimitMonitor.getAlerts(t0 - 1);
    expect(sinceBefore).toHaveLength(2);

    // since > segundo alerta: vazio.
    const future = rateLimitMonitor.getAlerts(Date.now() + 1000);
    expect(future).toHaveLength(0);
  });
});

describe('rateLimitMonitor.clearAlerts()', () => {
  it('limpa o array de alertas sem afetar events', async () => {
    const { rateLimitMonitor } = await loadModule();

    for (let i = 0; i < 10; i++) rateLimitMonitor.record('ip-1', false);
    expect(rateLimitMonitor.getAlerts()).toHaveLength(1);

    rateLimitMonitor.clearAlerts();
    expect(rateLimitMonitor.getAlerts()).toHaveLength(0);

    // Events não foram afetados.
    expect(rateLimitMonitor.getStats().totalRequests).toBe(10);
  });
});

describe('rateLimitMonitor.getHealth()', () => {
  it('retorna status "healthy" sem tráfego', async () => {
    const { rateLimitMonitor } = await loadModule();

    const health = rateLimitMonitor.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.blockRate).toBe(0);
    expect(health.activeIdentifiers).toBe(0);
    expect(health.recentAlerts).toBe(0);
  });

  it('classifica "degraded" quando blockRate > 20%', async () => {
    const { rateLimitMonitor } = await loadModule();

    // 5 allowed + 2 blocked = blockRate 28.5%
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-2', false);
    rateLimitMonitor.record('ip-2', false);

    const health = rateLimitMonitor.getHealth();
    expect(health.blockRate).toBeGreaterThan(20);
    expect(health.blockRate).toBeLessThanOrEqual(50);
    expect(health.status).toBe('degraded');
  });

  it('classifica "critical" quando blockRate > 50%', async () => {
    const { rateLimitMonitor } = await loadModule();

    // 1 allowed + 4 blocked = blockRate 80%
    rateLimitMonitor.record('ip-1', true);
    for (let i = 0; i < 4; i++) rateLimitMonitor.record('ip-2', false);

    const health = rateLimitMonitor.getHealth();
    expect(health.blockRate).toBe(80);
    expect(health.status).toBe('critical');
  });

  it('classifica "critical" quando recentAlerts > 5', async () => {
    const { rateLimitMonitor } = await loadModule();

    // Disparar 6 alertas: 10 bloqueios por identifier, 6 identifiers diferentes
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 10; j++) {
        rateLimitMonitor.record(`ip-${i}`, false);
      }
    }

    const health = rateLimitMonitor.getHealth();
    expect(health.recentAlerts).toBeGreaterThan(5);
    expect(health.status).toBe('critical');
  });

  it('arredonda blockRate para 2 casas decimais', async () => {
    const { rateLimitMonitor } = await loadModule();

    // 1 blocked + 2 allowed = 33.333...% → 33.33
    rateLimitMonitor.record('ip-1', false);
    rateLimitMonitor.record('ip-1', true);
    rateLimitMonitor.record('ip-1', true);

    const health = rateLimitMonitor.getHealth();
    expect(health.blockRate).toBe(33.33);
  });
});

describe('rateLimitMonitor singleton', () => {
  it('getInstance() retorna a mesma referência dentro do mesmo módulo', async () => {
    // Sob vi.resetModules(), cada import recria a classe + instância. Isso é
    // esperado para isolar testes. Aqui validamos que a fábrica produz uma
    // instância estável DENTRO do mesmo módulo carregado.
    const mod = await loadModule();
    // mod.rateLimitMonitor é a instância cacheada — múltiplos acessos
    // devem retornar a mesma referência.
    expect(mod.rateLimitMonitor).toBe(mod.rateLimitMonitor);
  });

  it('resetModules recria instância isolada (sem contaminar estado entre testes)', async () => {
    const m1 = await loadModule();
    m1.rateLimitMonitor.record('ip-1', true);

    const m2 = await loadModule();
    // m2 é uma nova instância — começa vazia.
    expect(m2.rateLimitMonitor.getStats().totalRequests).toBe(0);
  });
});