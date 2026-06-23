// Test cases intentionally exercise module loading boundaries — the
// module under test caches state across imports, so we must use
// `vi.resetModules()` and dynamic `import()` to drive each scenario
// in isolation. Static imports would defeat the purpose.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrismaPgCtor = vi.fn();
const mockPrismaClientCtor = vi.fn();

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    opts: { connectionString: string };
    __tag = 'PrismaPg';
    constructor(opts: { connectionString: string }) {
      this.opts = opts;
      mockPrismaPgCtor(opts);
    }
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    adapter: unknown;
    log: string[];
    __tag = 'PrismaClient';
    // Stub delegates — existem no client para que `proxy.<prop>` retorne
    // valores definidos. O teste de delegação verifica QUE o valor veio do
    // client subjacente, não a identidade específica do valor.
    user = 'mock-user-delegate';
    consultation = 'mock-consultation-delegate';
    chatMessage = 'mock-chat-delegate';
    constructor(opts: { adapter: unknown; log: string[] }) {
      this.adapter = opts.adapter;
      this.log = opts.log;
      mockPrismaClientCtor(opts);
    }
  },
}));

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  // CRÍTICO: prisma.ts escreve o client em `globalThis.prisma` em qualquer
  // env != production. Sem este reset, testes posteriores reusam um mock
  // stale via `globalForPrisma.prisma ?? createPrismaClient()` antes de
  // chamar `createPrismaClient`, mascarando a cobertura real do caminho
  // de criação. Bug original #EE1A — 6 de 8 testes falhavam por isso.
  delete (globalThis as { prisma?: unknown }).prisma;
});

afterEach(() => {
  // Restaura env global
  if (ORIGINAL_DATABASE_URL === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  if (ORIGINAL_NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  // Limpa o cache global escrito por prisma.ts para não vazar entre arquivos
  delete (globalThis as { prisma?: unknown }).prisma;
});

async function loadPrismaModule() {
  // `await import()` é necessário aqui: o módulo é reavaliado depois de
  // `vi.resetModules()` e static imports ficariam cacheados.
  const mod = await import('./prisma');
  return mod.prisma;
}

/**
 * Acessar uma propriedade do proxy dispara o get handler que constrói
 * o PrismaClient. Usar este helper em vez de `loadPrismaModule` direto
 * quando o teste precisa do client materializado.
 */
async function loadAndTouchPrisma() {
  const prisma = await loadPrismaModule();
  void prisma.user; // força construção lazy
  return prisma;
}

describe('prisma.ts — lazy proxy', () => {
  it('lança erro claro quando DATABASE_URL não está definida', async () => {
    delete process.env.DATABASE_URL;
    vi.resetModules();

    const prisma = await loadPrismaModule();
    expect(() => void prisma.user).toThrow('DATABASE_URL não está definida');
  });

  it('instancia PrismaPg com a connection string do env', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    vi.resetModules();

    await loadAndTouchPrisma();

    expect(mockPrismaPgCtor).toHaveBeenCalledTimes(1);
    expect(mockPrismaPgCtor).toHaveBeenCalledWith({ connectionString: 'postgresql://user:pass@localhost:5432/db' });
  });

  it('instancia PrismaClient com log verbose em development', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.NODE_ENV = 'development';
    vi.resetModules();

    await loadAndTouchPrisma();

    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
    const opts = mockPrismaClientCtor.mock.calls[0]?.[0];
    expect(opts).toBeDefined();
    expect(opts?.log).toEqual(['query', 'error', 'warn']);
  });

  it('instancia PrismaClient com log mínimo em produção', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    await loadAndTouchPrisma();

    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
    const opts = mockPrismaClientCtor.mock.calls[0]?.[0];
    expect(opts).toBeDefined();
    expect(opts?.log).toEqual(['error']);
  });

  it('lazy: não instancia PrismaClient até o primeiro acesso', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    vi.resetModules();

    await loadPrismaModule();
    expect(mockPrismaClientCtor).not.toHaveBeenCalled();
    expect(mockPrismaPgCtor).not.toHaveBeenCalled();
  });

  it('cacheia o client em env não-production — não recria no segundo acesso', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.NODE_ENV = 'test';
    vi.resetModules();

    const prisma = await loadPrismaModule();
    void prisma.user;
    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);

    // Segundo acesso deve reusar o cache (não recriar)
    void prisma.consultation;
    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
  });

  it('proxy delega leituras ao client subjacente', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    vi.resetModules();

    const prisma = await loadPrismaModule();
    // Verificamos o delegate stub `user` adicionado no mock — se o proxy
    // delegasse ao `_target = {}` (vazio), o retorno seria `undefined`.
    // O valor exato `'mock-user-delegate'` prova que veio do client real.
    const userProp = prisma.user;
    expect(userProp).toBe('mock-user-delegate');
  });

  it('recarrega módulo isolado entre testes (vi.resetModules funciona)', async () => {
    process.env.DATABASE_URL = 'postgresql://first';
    vi.resetModules();
    const first = await loadAndTouchPrisma();
    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);

    process.env.DATABASE_URL = 'postgresql://second';
    vi.resetModules();
    const second = await loadAndTouchPrisma();

    // módulo reavaliado — client reconstruído com a nova URL
    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(2);
    expect(mockPrismaPgCtor).toHaveBeenLastCalledWith({ connectionString: 'postgresql://second' });
    // referências diferentes entre reimports
    expect(first).not.toBe(second);
  });

  // ─── Coverage: production mode does NOT mutate globalThis ──────────────
  it('production: NÃO escreve em globalThis.prisma (HMR não vaza clients)', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    await loadAndTouchPrisma();

    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
    // CRÍTICO em produção: nunca poluir globalThis — múltiplos HMR reloads
    // em produção compartilhariam o mesmo client e esgotariam o pool do DB.
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined();
  });

  // ─── Coverage: pre-seeded globalThis.prisma is reused (HMR recovery) ──
  it('reusa globalThis.prisma pre-existente (recuperação após HMR)', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.NODE_ENV = 'test';
    vi.resetModules();

    // Simula o cenário onde um reload de módulo preservou um client em
    // globalThis. getPrisma deve reusar este client em vez de criar um novo.
    const preExisting = {
      __tag: 'PreExistingClient',
      user: 'preexisting-user-delegate',
    };
    (globalThis as { prisma?: unknown }).prisma = preExisting;

    const prisma = await loadAndTouchPrisma();

    // Não chamou os ctors — reusou o global pre-existente
    expect(mockPrismaPgCtor).not.toHaveBeenCalled();
    expect(mockPrismaClientCtor).not.toHaveBeenCalled();
    // E o proxy entregou o valor do client pre-existente
    expect(prisma.user).toBe('preexisting-user-delegate');
  });

  // ─── Coverage: production + vi.resetModules recria o client (sem cache) ─
  it('production: vi.resetModules força recriação (sem cache global)', async () => {
    process.env.DATABASE_URL = 'postgresql://first';
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    await loadAndTouchPrisma();
    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined();

    // Reimportar o módulo em production NÃO preserva o client —
    // cada import ganha uma instância nova. Isto é intencional: o runtime
    // de produção (sem HMR) não deveria ter múltiplos reloads.
    process.env.DATABASE_URL = 'postgresql://second';
    vi.resetModules();
    await loadAndTouchPrisma();

    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(2);
    expect(mockPrismaPgCtor).toHaveBeenLastCalledWith({ connectionString: 'postgresql://second' });
  });

  // ─── Coverage: legacy re-export em src/lib/prisma.ts ───────────────────
  it('legacy src/lib/prisma.ts re-exporta o singleton canônico (mesma identidade)', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    vi.resetModules();

    const canonical = await import('./prisma');
    const legacy = await import('../prisma');

    // O arquivo legado existe apenas para preservar a identidade do
    // singleton — se divergir, dois callers diferentes recebem dois
    // PrismaClients e esgotam o pool do DB.
    expect(legacy.prisma).toBe(canonical.prisma);
  });

  // ─── Coverage: deprecated stub em apps/akasha-portal/lib/infrastructure ─
  it('stub deprecated apps/akasha-portal/lib/infrastructure/prisma re-exporta o canônico', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    vi.resetModules();

    const canonical = await import('./prisma');
    // apps/akasha-portal/lib/infrastructure/prisma.ts é um stub deprecated
    // mantido para forward-compat com tooling. Deve apontar ao canônico.
    const deprecatedStub = await import('../../../lib/infrastructure/prisma');

    expect(deprecatedStub.prisma).toBe(canonical.prisma);
  });

  // ─── Coverage: proxy entrega múltiplas propriedades distintas ──────────
  it('proxy entrega múltiplas propriedades distintas em uma única instância', async () => {
    process.env.DATABASE_URL = 'postgresql://x';
    vi.resetModules();

    const prisma = await loadAndTouchPrisma();

    // Três propriedades diferentes — todas devem vir do client criado
    // uma única vez (o proxy não deve causar recriação).
    expect(prisma.user).toBe('mock-user-delegate');
    expect(prisma.consultation).toBe('mock-consultation-delegate');
    expect(prisma.chatMessage).toBe('mock-chat-delegate');

    expect(mockPrismaClientCtor).toHaveBeenCalledTimes(1);
  });
});
