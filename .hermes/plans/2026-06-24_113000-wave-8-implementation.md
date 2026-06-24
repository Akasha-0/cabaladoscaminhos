# Wave 8 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> Each sub-wave (8.1 / 8.2 / 8.3 / 8.4) is a separate `delegate_task` call, each in its own git worktree (per `WORKTREE-PER-SUBAGENT` rule).

**Goal:** Close Wave 7 follow-ups: 62 pre-existing test failures → 0, LGPD/DPA blockers técnicos (DELETE /profile com cascata, DPA template, disclaimer de terceiros), e MCP server skeleton integration.

**Architecture:** 4 sub-waves paralelas (mas executadas em sequência para respeitar subagent lifetime ~30 min). Cada sub-wave = 1-2 tasks focadas com TDD onde aplicável. LGPD/DPA blockers usam docs-only + código cirúrgico. MCP server fica como STUB (sem transporte real) até Wave 9 quando tools concretas forem registradas.

**Tech Stack:** TypeScript + Next.js 16 + Prisma 7 + Vitest. Hermes subagents via `delegate_task`. Conventional Commits PT-BR.

**Branch base:** `main @ 6ce508bd` (Wave 7 já merged). Todos sub-waves brancham de `main`.

**Worktree-per-subagent pattern (OBRIGATÓRIO):**

```bash
cd /home/skynet/cabala-dos-caminhos
git fetch origin
git worktree add -b wave-8.1-test-fixtures \
  ../cabala-dos-caminhos-worktrees/wave-8.1 \
  main
# (criar 4 worktrees no total, 1 por sub-wave)
```

**Cleanup-between-Waves (após merge):**

```bash
for w in wave-8.1 wave-8.2 wave-8.3 wave-8.4 wave-8-integration; do
  git worktree remove --force "../cabala-dos-caminhos-worktrees/$w"
  git branch -D $w
done
```

---

## Overview dos Sub-Waves

| Sub-Wave | Escopo | Subagente | Tempo | Deps |
|---|---|---|---|---|
| **8.1** | Front C-a: 30 test fixtures quebrados | 1 Coder | ~30 min | nenhuma (blocking) |
| **8.2** | Front C-b: 32 test errors restantes | 1 Coder | ~60 min | 8.1 merged |
| **8.3** | Front A: LGPD/DPA (DELETE + DPA + disclaimer) | 1 Coder | ~60 min | nenhuma |
| **8.4** | Front B: MCP server skeleton + Mentor integration | 1 Coder | ~60 min | nenhuma |
| **integration** | merge sequencial + typecheck + 3 reviewers | orquestrador | ~15 min | 8.1, 8.2, 8.3, 8.4 |

**Total: ~4h wall-time se sequencial, ~3h se 8.1+8.3+8.4 paralelos (subagent lifetime dita).**

**Ordem recomendada:** 8.1 e 8.3+8.4 paralelos primeiro (escopos independentes); 8.2 depois (depende de 8.1 merged); integration por último.

---

# Sub-Wave 8.1 — Front C-a: Test Fixtures Quebrados

**Objetivo:** Atualizar test fixtures quebrados por mudanças recentes. Especialmente `Layer2Kabala.test.tsx` e `Layer4Astrology.test.tsx` que ficaram órfãos após `f45ac426` (commit que mudou `Layer2Kabala` props de `kabVerts/trianglePath/tooltipByLayer:string` para `sefiraTree/tooltipByLayer:TooltipKey`).

**Meta:** Fechar ~30 dos 62 test failures. Os 32 restantes ficam pra 8.2.

**Worktree:** `../cabala-dos-caminhos-worktrees/wave-8.1` (branch `wave-8.1-test-fixtures`)

**Files a modificar:**

| Path | Mudança esperada |
|---|---|
| `tests/components/akasha/layers/Layer2Kabala.test.tsx` | Atualizar props mock de `kabVerts/trianglePath` para `sefiraTree` (SefiraTree type); atualizar `tooltipByLayer: Record<Layer, TooltipKey>` (não mais `string`); ajustar assertions que checavam `tooltipByLayer[2]` como string |
| `tests/components/akasha/layers/Layer4Astrology.test.tsx` | Investigar que props quebraram (provavelmente mesma issue: TooltipKey migration); aplicar fix simétrico |

### Task 8.1.1: Investigar Layer2Kabala.test.tsx

**Step 1:** Ler `tests/components/akasha/layers/Layer2Kabala.test.tsx` e identificar quais props/types estão errados.

**Step 2:** Ler `src/components/akasha/layers/Layer2Kabala.tsx` para confirmar shape atual.

**Step 3:** Rodar `pnpm test:run ../../tests/components/akasha/layers/Layer2Kabala.test.tsx` para confirmar 16 falhas.

### Task 8.1.2: Atualizar mocks do Layer2Kabala.test.tsx

**Step 1:** Trocar mock `mockKabVerts` (KabVert[]) por `mockSefiraTree: SefiraTree` (nodes: SefiraNode[], paths: SefiraPath[]).

**Step 2:** Trocar `tooltipByLayer: { 2: 'string', ... }` para `tooltipByLayer: { 2: { key: 'mandala.tooltips.layer2', params: { n: '3', essencia: 'vida' } }, ... }`.

**Step 3:** Trocar assertions que esperam `ariaLabel` string → agora é o resolved string (use `t(key, params)` para gerar string comparável).

**Step 4:** Rodar test novamente. Esperado: 16/16 passing.

### Task 8.1.3: Investigar + consertar Layer4Astrology.test.tsx

**Step 1:** Mesmo padrão do 8.1.1 — ler arquivo, identificar props quebrados.

**Step 2:** Aplicar fix simétrico.

**Step 3:** Rodar test. Esperado: 14/14 passing.

### Task 8.1.4: Investigar + consertar MandalaInfoPanels.test.tsx (8 failures)

Aplicar o mesmo padrão: identificar props/types errados, atualizar mocks, rodar até passar.

### Task 8.1.5: Commit + Push

```bash
git add tests/
git commit -m "fix(portal): Wave 8.1 test fixtures — Layer2Kabala/Layer4Astrology/MandalaInfoPanels updated for TooltipKey migration"
```

**Validação final Wave 8.1:** Rodar `pnpm test:run` na app inteira, contar failures antes/depois. Esperado: 62 → ~32.

---

# Sub-Wave 8.2 — Front C-b: Remaining Test Errors

**Objetivo:** Investigar e consertar os ~32 test errors restantes após 8.1.

**Dependência:** 8.1 merged (código do Layer2Kabala test pode mudar comportamento de testes vizinhos)

**Worktree:** `../cabala-dos-caminhos-worktrees/wave-8.2` (branch `wave-8.2-remaining-tests`)

**Files a investigar:**

| Path | Suspeita |
|---|---|
| `src/lib/application/auth/akasha-jwt.test.ts` (11 failures) | fixtures quebradas após Wave 7.3 mudanças |
| `src/lib/infrastructure/prisma.test.ts` (3 failures) | NODE_ENV readonly @types/node>=22 — Wave 7.3 fixou parte, falta verificar |
| `src/lib/application/auth/middleware-auth.test.ts` (1 failure) | pre-existente |
| `src/lib/grimoire/search.test.ts` (1 failure) | cosine similarity re-ranking assertion bug (reportado por subagente Wave 7.4) |
| `src/lib/grimoire/traducao-areas.test.ts` (1 failure) | pre-existente |
| `src/lib/application/admin/credit-reconciliation.test.ts` (4 failures) | pode requerer prisma regen |
| `src/app/api/cron/daily-transits-cron.test.ts` (1 failure) | pre-existente |
| `src/app/api/mentor/history/route.test.ts` (2 failures) | relacionado a Wave 8.4 B.2 — provavelmente corrigidos após B.2 |
| `tests/lib/grimoire/iching-completeness.test.ts` (1 failure) | corpus pre-existente |
| `tests/lib/grimoire/curatorship-guardian-iching.test.ts` (1 failure) | pre-existente |
| `tests/lib/admin/credit-reconciliation.test.ts` (4 failures) | dup do app/ |
| `tests/calculators/*.test.ts` (vários) | pre-existente |
| `tests/architecture/package-boundaries.test.ts` (1 failure) | pode ser architectural |
| `tests/architecture/AGENTS.md` (listed as test) | **DOX framework bug** — arquivo de docs sendo ingerido como teste. Não é teste real; reportar como bug separado |

### Task 8.2.1: Investigar akasha-jwt.test.ts (11 failures)

**Step 1:** Rodar `pnpm test:run src/lib/application/auth/akasha-jwt.test.ts` para ver erros exatos.

**Step 2:** Ler `akasha-jwt.ts` para entender API atual (`signAkashaRefreshToken`, `verifyAkashaToken`, etc).

**Step 3:** Aplicar fix surgical 1 variable at a time (skill systematic-debugging): para cada erro, ler contexto, identificar root cause, fixar, rodar test, commitar.

**Step 4:** Re-rodar. Esperado: 11 → 0.

### Task 8.2.2: Investigar prisma.test.ts + middleware-auth.test.ts (4 failures)

Aplicar mesmo padrão.

### Task 8.2.3: Investigar grimoire/* tests (3 failures)

Aplicar mesmo padrão. Se for bug de assertion (não type), corrigir assertion logic.

### Task 8.2.4: Investigar credit-reconciliation + daily-transits-cron (5 failures)

Aplicar mesmo padrão. Se precisar `prisma generate`, rodar antes.

### Task 8.2.5: Investigar AGENTS.md "test file" issue (DOX bug)

**Step 1:** Identificar onde DOX framework está ingerindo `.md` como test (provavelmente `tests/architecture/AGENTS.md`).

**Step 2:** Se for bug do DOX (não da app), documentar como follow-up separado e excluir do scope Wave 8. Não inventar fix.

### Task 8.2.6: Commit + Push

```bash
git add src/ tests/
git commit -m "fix(portal): Wave 8.2 remaining test errors — 32 → 0 (architectural if needed, document as Wave 9)"
```

**Validação final Wave 8.2:** `pnpm test:run` → 0 failures. Se não for possível, documentar quais são arquiteturais (não-fixáveis no escopo) e separar como Wave 9 follow-ups.

---

# Sub-Wave 8.3 — Front A: LGPD/DPA Blockers Técnicos

**Objetivo:** Implementar 3 deliverables LGPD/DPA que bloqueiam produção:

- **A.1** DELETE /profile com cascata (LGPD Art. 18 — direito ao esquecimento)
- **A.2** docs/legal/DPA_ANTHROPIC.md template + auditoria rotas LLM (Art. 33 — transferência internacional)
- **A.3** Disclaimer de terceiros em Conexões (consentimento)

**Worktree:** `../cabala-dos-caminhos-worktrees/wave-8.3` (branch `wave-8.3-lgpd-dpa`)

**Total: ~60 min single subagente.** Se um subagente morrer no meio, commitar cada sub-task independentemente.

### Task 8.3.1: Investigar schema Prisma + modelo User

**Step 1:** Ler `apps/akasha-portal/prisma/schema.prisma` para confirmar models: User, Caminhante, Caminhada, Sessao, MapaCalculo, GrimorioPessoal, MapaRelacional.

**Step 2:** Identificar as FK relations (qual model referencia User via `userId`/`user_id`).

**Step 3:** Confirmar que todas as 6 cascades estão corretamente configuradas (`onDelete: Cascade` nas relations). Se NÃO estiverem, esse é o gap a fechar.

### Task 8.3.2: Implementar A.1 — DELETE /profile com cascata

**Step 1:** Criar `apps/akasha-portal/src/app/api/akasha/profile/[id]/route.ts` com handler DELETE.

**Step 2:** Handler signature:
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth: verifyAkashaToken + check user.id === params.id (ou admin)
  // 2. Audit log: "profile_delete_requested" (antes de deletar)
  // 3. Opcional: ?dryRun=true → retorna o que seria deletado sem deletar
  // 4. prisma.user.delete({ where: { id } }) — cascata via onDelete: Cascade
  // 5. Audit log: "profile_delete_completed" com count de cascata
  // 6. Return: { deleted: true, cascaded: { caminhantes: N, caminhadas: M, ... } }
}
```

**Step 3:** Dry-run mode é importante para LGPD compliance (Art. 18 §2 — confirmação antes de deletar). Padrão:
```typescript
const url = new URL(request.url);
const dryRun = url.searchParams.get('dryRun') === 'true';
if (dryRun) {
  const counts = await countCascade(targetId);
  return NextResponse.json({ dryRun: true, counts });
}
```

**Step 4:** Auditoria via `apps/akasha-portal/src/lib/infrastructure/audit-log.ts` (verificar se existe; senão, criar um stub que loga pra console com timestamp + userId + action).

### Task 8.3.3: Testar A.1 — DELETE /profile

**Step 1:** Criar `tests/api/akasha/profile/[id]/route.test.ts` com 5 testes:

1. `test_delete_user_with_no_relations` — User sem cascade, delete OK
2. `test_delete_user_with_cascading_caminhantes` — 3 caminhantes, todos deletados
3. `test_delete_other_user_returns_403` — auth check funciona
4. `test_delete_with_dry_run_returns_counts_without_deleting` — dry-run NÃO deleta
5. `test_delete_nonexistent_returns_404` — error handling

**Step 2:** Rodar `pnpm test:run tests/api/akasha/profile/`. Esperado: 5/5 passing.

### Task 8.3.4: Criar A.2 — docs/legal/DPA_ANTHROPIC.md

**Step 1:** Criar arquivo em `apps/akasha-portal/docs/legal/DPA_ANTHROPIC.md` com template de DPA para Anthropic:

```markdown
# Data Processing Agreement (DPA) — Anthropic

> **Status:** template para negociacao. Advogado PI deve validar antes de envio.
> **LGPD Art. 33:** transferencia internacional de dados para os EUA requer
> garantias adequadas.

## Clausulas obrigatorias
1. Objeto e duracao do tratamento
2. Natureza e finalidade do tratamento (LLM para Mentor + Consult)
3. Tipo de dados pessoais transferidos (PII do consulente: nome, data
   nascimento, local, respostas clinicas)
4. Categorias de titulares
5. Obrigacoes do operador (Anthropic)
6. Local de processamento (US, com clausula SCC ou similar)
7. Medidas de seguranca (encryption at rest/transit, SOC2, etc)
8. Subcontratados autorizados
9. Direitos do titular (acesso, correcao, eliminacao)
10. Notificacao de incidentes (72h)
11. Auditoria e inspecao
12. Retorno/Eliminacao de dados ao termino
13. Responsabilidade

## Checklist pre-envio (advogado)
- [ ] Anthropic aceitou DPA padrao da empresa?
- [ ] Anthropic tem SOC2 Type II?
- [ ] Anthropic esta em Privacy Shield successor (EU-US Data Privacy Framework)?
- [ ] Nosso uso de API key e privado (server-side only)?
- [ ] Logs nao retem PII alem de 30 dias?

## Auditoria de rotas LLM (que enviam PII)

| Rota | PII enviada | Frequencia | Retencao |
|------|-----------|-----------|----------|
| /api/mentor/ask | nome, respostas | per-request | 30 dias |
| /api/akasha/consult | nome, mapa inteiro | per-request | 30 dias |
| /api/mentor/history | conversation_id | per-request | 90 dias |

**Recomendacao:** contrato DPA deve exigir exclusao automatica de logs
apos 30 dias para PII.
```

### Task 8.3.5: Implementar A.3 — Disclaimer de terceiros em Conexões

**Step 1:** Investigar `apps/akasha-portal/src/components/akasha/conexoes/ConexaoPartnerForm.tsx` (ou similar) para encontrar onde o usuário cadastra outra pessoa como par de conexão.

**Step 2:** Adicionar disclaimer inline ANTES do submit:

```tsx
<p className="text-xs text-amber-700 dark:text-amber-300 italic">
  Ao adicionar uma conexão, você declara ter consentimento da outra
  pessoa para compartilhar dados de mapa astrológico com ela.
  Akasha não verifica este consentimento. (LGPD Art. 37)
</p>
```

**Step 3:** Verificar consent flow signup → first Caminhante → first Sessao → primeira conexão. Para cada step, confirmar que existe consent ativo (pode ser checkbox, ou flag no DB).

**Step 4:** Commit separado para A.3.

### Task 8.3.6: Commits

```bash
git add apps/akasha-portal/src/app/api/akasha/profile/ tests/api/akasha/profile/
git commit -m "feat(portal): Wave 8.3 A.1 — DELETE /profile with cascade + dry-run + audit log (LGPD Art. 18)"

git add docs/legal/DPA_ANTHROPIC.md
git commit -m "docs(legal): Wave 8.3 A.2 — DPA Anthropic template + LLM routes audit (LGPD Art. 33)"

git add apps/akasha-portal/src/components/akasha/conexoes/
git commit -m "feat(portal): Wave 8.3 A.3 — third-party disclaimer for Conexoes (LGPD Art. 37)"
```

---

# Sub-Wave 8.4 — Front B: MCP Server Skeleton + Mentor Integration

**Objetivo:** Fechar o gap entre ADR 0006 (que é só types) e código real. Implementar skeleton de MCP server + integração mínima com Mentor route. Server permanece STUB (sem transporte real).

**Worktree:** `../cabala-dos-caminhos-worktrees/wave-8.4` (branch `wave-8.4-mcp-server`)

### Task 8.4.1: Implementar B.1 — packages/mcp/src/server.ts

**Step 1:** Ler `packages/mcp/src/index.ts` (Wave 7.2 criou) para entender types registry.

**Step 2:** Criar `packages/mcp/src/server.ts`:

```typescript
/**
 * AkashaMcpServer — skeleton runtime.
 *
 * Wave 8.4 stub: accepts a registry of AkashaTool/AkashaResource, holds
 * them in-memory, no transporte real (stdio/http) ainda. Wave 9+ vai
 * implementar:
 * - stdio transport (for CLI integration)
 * - HTTP transport (for web client integration)
 * - Multi-tenant context (zeladorId + caminhadaId)
 * - Tool invocation dispatch
 */
import type { AkashaMcpRegistry, AkashaTool } from './index';

export interface AkashaMcpServerOptions {
  name?: string;
  version?: string;
}

export class AkashaMcpServer {
  private readonly name: string;
  private readonly version: string;
  private registry: AkashaMcpRegistry = {
    tools: [],
    resources: [],
    prompts: [],
  };

  constructor(options: AkashaMcpServerOptions = {}) {
    this.name = options.name ?? 'akasha-mcp';
    this.version = options.version ?? '0.1.0-types-only';
  }

  /** Register a tool. Idempotent (re-register replaces). */
  registerTool(tool: AkashaTool): this {
    const idx = this.registry.tools.findIndex(t => t.name === tool.name);
    if (idx >= 0) this.registry.tools[idx] = tool;
    else this.registry.tools.push(tool);
    return this;
  }

  /** Get current registry (read-only). */
  getRegistry(): Readonly<AkashaMcpRegistry> {
    return Object.freeze({ ...this.registry });
  }

  /** Start the server (STUB in Wave 8.4 — logs only). */
  async start(): Promise<void> {
    console.log(
      `[akasha-mcp] server started (name=${this.name}, version=${this.version}, ` +
      `tools=${this.registry.tools.length}, resources=${this.registry.resources.length})`
    );
  }

  /** Stop the server (STUB in Wave 8.4 — no-op). */
  async stop(): Promise<void> {
    // no-op
  }
}

export const mcpServer = new AkashaMcpServer();
```

**Step 3:** Atualizar `packages/mcp/src/index.ts` para exportar `AkashaMcpServer` + `AkashaMcpServerOptions`.

### Task 8.4.2: Testar B.1

**Step 1:** Criar `packages/mcp/src/__tests__/server.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { AkashaMcpServer } from '../server';
import type { AkashaTool } from '../index';

describe('AkashaMcpServer (Wave 8.4 stub)', () => {
  it('registers a tool', () => {
    const server = new AkashaMcpServer({ name: 'test' });
    const tool: AkashaTool = {
      name: 'echo',
      description: 'Echoes input',
      inputSchema: { type: 'object' },
      handler: async (input) => input,
    };
    server.registerTool(tool);
    expect(server.getRegistry().tools).toHaveLength(1);
    expect(server.getRegistry().tools[0]?.name).toBe('echo');
  });

  it('re-register replaces existing tool', () => {
    const server = new AkashaMcpServer();
    server.registerTool({ name: 't', description: 'v1', inputSchema: {}, handler: async () => ({}) });
    server.registerTool({ name: 't', description: 'v2', inputSchema: {}, handler: async () => ({}) });
    expect(server.getRegistry().tools).toHaveLength(1);
    expect(server.getRegistry().tools[0]?.description).toBe('v2');
  });

  it('start/stop are no-ops in stub mode', async () => {
    const server = new AkashaMcpServer();
    await expect(server.start()).resolves.toBeUndefined();
    await expect(server.stop()).resolves.toBeUndefined();
  });
});
```

**Step 2:** Rodar `pnpm test:run`. Esperado: 3/3 passing.

### Task 8.4.3: Implementar B.2 — Mentor route integration

**Step 1:** Ler `apps/akasha-portal/src/app/api/mentor/ask/route.ts` para entender o handler atual (deve chamar LLM direto).

**Step 2:** Adicionar lazy import + check registry:

```typescript
import { NextResponse } from 'next/server';
// ... existing imports

export async function POST(request: NextRequest) {
  // ... existing auth + body parsing

  // Wave 8.4 B.2: try MCP server first, fallback to direct LLM
  try {
    const { mcpServer } = await import('@akasha/mcp');
    const registry = mcpServer.getRegistry();
    const mentorTools = registry.tools.filter(t => t.name.startsWith('mentor.'));
    if (mentorTools.length > 0) {
      // Use MCP tools if registered (Wave 9+ will have actual tools)
      // For now, just log + continue to direct LLM
      console.log(`[mentor] found ${mentorTools.length} MCP tools, using direct LLM fallback (no tool impl yet)`);
    }
  } catch (err) {
    // @akasha/mcp not installed or import failed → fallback to direct LLM
    console.warn('[mentor] MCP server unavailable, using direct LLM:', err);
  }

  // ... existing direct LLM call (unchanged)
}
```

**Step 3:** Commitar.

### Task 8.4.4: Testar B.2

**Step 1:** Criar `tests/api/mentor/ask/mcp-fallback.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Mentor /ask — MCP fallback (Wave 8.4 B.2)', () => {
  it('falls back to direct LLM when @akasha/mcp unavailable', async () => {
    // Mock @akasha/mcp to throw on import
    vi.doMock('@akasha/mcp', () => {
      throw new Error('Module not found');
    });

    const req = new Request('http://test/api/mentor/ask', {
      method: 'POST',
      body: JSON.stringify({ question: 'test' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    // Direct LLM path should still return 200 (or whatever baseline)
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});
```

**Step 2:** Rodar. Esperado: 1/1 passing.

### Task 8.4.5: Commits

```bash
git add packages/mcp/src/server.ts packages/mcp/src/__tests__/server.test.ts packages/mcp/src/index.ts
git commit -m "feat(mcp): Wave 8.4 B.1 — AkashaMcpServer stub (in-memory registry, no transport yet)"

git add apps/akasha-portal/src/app/api/mentor/ask/ tests/api/mentor/ask/
git commit -m "feat(mentor): Wave 8.4 B.2 — lazy @akasha/mcp import + graceful fallback to direct LLM"
```

---

# Sub-Wave Integration — Merge Sequencial + Review

**Objetivo:** Mergear 4 sub-waves em `wave-8-integration`, rodar typecheck + 3 reviewers paralelos, merge to main.

**Worktree:** `../cabala-dos-caminhos-worktrees/wave-8-integration` (branch `wave-8-integration`, base = main)

### Task integration.1: Merge sequencial

```bash
cd /home/skynet/cabala-dos-caminhos-worktrees/wave-8-integration
git merge --no-ff wave-8.1-test-fixtures -m "merge: Wave 8.1 Front C-a — test fixtures"
git merge --no-ff wave-8.2-remaining-tests -m "merge: Wave 8.2 Front C-b — remaining test errors"
git merge --no-ff wave-8.3-lgpd-dpa -m "merge: Wave 8.3 Front A — LGPD/DPA blockers"
git merge --no-ff wave-8.4-mcp-server -m "merge: Wave 8.4 Front B — MCP server skeleton"
```

**Resolver conflitos se houver** (provavelmente em test fixtures — diferentes sub-waves podem tocar mesmo arquivo).

### Task integration.2: Typecheck + i18n parity + prisma generate

```bash
cd apps/akasha-portal
pnpm exec prisma generate
pnpm typecheck  # esperado 0 errors
pnpm i18n:check  # esperado PARITY OK
pnpm test:run  # esperado 0 failures (ou arquiteturais documentados)
```

### Task integration.3: 3 reviewers paralelos (sua rule: delegation = 3 reviewers)

Delegar 3 subagentes Researcher em paralelo (1 call `delegate_task` com 3 tasks):

1. **Schema/DB reviewer**: foca em A.1 (DELETE cascade) + prisma relations
2. **Code/Security reviewer**: foca em A.1 audit log + A.3 disclaimer + 8.1/8.2 test fixtures
3. **ADR alignment reviewer**: foca em A.2 DPA template + ADR 0006 vs B.1+B.2 implementation + scope match com plan

Cada um escreve em `.hermes/plans/review-{dim}-wave8-2026-06-24.md`.

### Task integration.4: Consolidar + fix P0

Orquestrador (eu) leio 3 reviews, consolido P0/P1/P2, apresento 1 sumário a você. Você decide se:
- (a) Fix P0 myself (~30 min)
- (b) Re-dispatch com prompt refinado
- (c) Pause

### Task integration.5: Merge to main + push

```bash
cd /home/skynet/cabala-dos-caminhos
git checkout main
git merge --no-ff wave-8-integration -m "merge: Wave 8 (C-a/C-b/A/B) — 0 test failures, LGPD/DPA blockers, MCP server stub"
git push origin main
```

### Task integration.6: Cleanup worktrees

```bash
for w in wave-8.1 wave-8.2 wave-8.3 wave-8.4 wave-8-integration; do
  git worktree remove --force "../cabala-dos-caminhos-worktrees/$w"
  git branch -D wave-8-$w
done
```

---

# Open Questions / Risks

1. **A.1 DELETE cascade** — risco alto. Se o Prisma não tem `onDelete: Cascade` em todas as 6 relations, delete falhará silenciosamente ou parcialmente. **Wave 8.3 Task 8.3.1 é critical**: confirmar FK relations ANTES de implementar handler.

2. **8.2 pode revelar erros arquiteturais** — não-quick-fixes. Se isso acontecer, vou documentar como Wave 9 follow-ups e fechar 8.2 com "32 → N erros restantes documentados".

3. **B.1 stub vs feature** — server é STUB. Não espere usar como MCP server real. Wave 9+ implementa transporte. Se você precisar de MCP server funcional HOJE (não stub), Wave 8.4 deve virar feature, não skeleton.

4. **Conexoes disclaimer (A.3)** — pode ser que o fluxo de consent já exista (signup → Caminhante → Sessao) e só precise adicionar disclaimer no form de Conexoes. Vou verificar no Task 8.3.5.

5. **DOX `tests/architecture/AGENTS.md` "test file" issue** — bug do DOX framework, não da app. Vou documentar, não tentar fixar.

---

# Decision Tree Snapshot

Decisões tomadas durante o grill Wave 8 (2026-06-24):

- **Root**: Wave 8 = 3 fronts paralelos (test failures + LGPD/DPA + MCP server stub)
- **Q2**: Decompor C em C-a (8.1, 30 min) + C-b (8.2, 60 min, depende de 8.1)
- **Q3**: Front A = 3 sub-tarefas técnicas (DELETE + DPA + disclaimer) num único subagente (8.3, 60 min)
- **Q4**: Front B = server skeleton + Mentor integration (8.4, 60 min) — STUB, não feature

Decisões em aberto (resolvidas durante execução):

- **8.2 se revelar arquiteturais**: documentar e dividir em Wave 9 (não bloquear merge Wave 8)
- **DOX AGENTS.md "test file" bug**: separar como bug separado (não Wave 8)

---

# Validation & Done Criteria

Wave 8 está **done** quando:

- [ ] `pnpm typecheck` em apps/akasha-portal → 0 errors
- [ ] `pnpm i18n:check` → PARITY OK
- [ ] `pnpm test:run` → 0 failures (ou arquiteturais documentados em Wave 9 follow-ups)
- [ ] `DELETE /api/akasha/profile/[id]` funciona com cascade + dry-run + audit log
- [ ] `docs/legal/DPA_ANTHROPIC.md` existe com template completo
- [ ] Conexoes tem disclaimer de terceiros visível antes do submit
- [ ] `packages/mcp/src/server.ts` tem AkashaMcpServer stub com testes
- [ ] Mentor /ask route tem lazy import do @akasha/mcp com graceful fallback
- [ ] 3 reviewers paralelos escreveram reports em `.hermes/plans/review-*-wave8-2026-06-24.md`
- [ ] P0 blockers (se houver) corrigidos
- [ ] Branch `wave-8-integration` merged to main + pushed to origin
- [ ] Todos 5 worktrees Wave 8 limpos
- [ ] CONTEXT.md atualizado com "Wave 8 done" entry