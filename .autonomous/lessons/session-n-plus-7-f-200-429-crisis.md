# Lesson — 429 Token Plan crisis + F-200 real engine integration

**Date:** 2026-06-11
**Session:** N+7 (supervisor mode — loop killed at start)
**Commits:** `3ddf05f4` (F-200 + R-013) + `1f44e3fa` (loop hardening)

## Contexto

3 sessões consecutivas do loop (033, 034, 035) falharam com `429 Token Plan
usage limit reached` após 10 retries de 30s+ cada. Loop ficou em
respawn-loop infinito, desperdiçando ~10 min de wall-clock por sessão
sem produzir código.

Supervisor (este agente) foi invocado para destravar. Achados:

1. **F-200 estava 90% pronto** no diretório de trabalho da sessão
   stuck. 297/298 testes passavam (Pilar 4 Odu falhava por nome
   composto yorubá retornado pelo real engine).
2. **`tsconfig.json paths` faltava `@akasha/core-iching`** — único
   erro NOVO introduzido pelo F-200 (4 outros engines já mapeados).
3. **Pre-bash allowlist + orchestrator** tinham sido editados em
   sessão anterior mas nunca commitados (loop morria antes do commit).
4. **Token plan exhausted** impede QUALQUER sessão de fazer trabalho
   útil até reset.

## Aprendizado

### L1 — Pilar 4 (Odu) ethics invariant: NUNCA inventar correspondência

Real engine `@akasha/core-odus` retorna nomes compostos yorubás
(`Etogundá`, `Ejiogbe`, etc.) que não estão na lista canônica IFA_ODUS
(15 nomes derivados de D-044). Decisão ética (R-022 §4.4 +
AGENTS.md §5): **stub fallback quando real engine retorna nome
não-canônico** em vez de vazar correspondência sem curadoria. Stub
preserva 16 names (Fase 5 test contract) até D-040 unificar em 15.

```ts
const CANONICAL_15 = new Set([...]);
if (CANONICAL_15.has(principal)) return real;
// senão: stub fallback com warning "Pilar 4 ethics invariant"
```

**Como aplicar:** qualquer Pilar com `aviso: 'requer X'` (Odu=terreiro,
Astrologia=consentimento, etc.) deve ter canonical-whitelist check antes
de vazar string do real engine.

### L2 — Loop sem circuit-breaker = respawn-loop em 429

Orchestrator respawna sessão após exit, mesmo se exit=429. Resultado:
3+ sessões desperdiçadas, ~30 min de wall-clock, $0 de código produzido.
**Fix necessário:** orchestrator deve detectar 429 + backoff
exponencial + escrever stop.signal após N retries consecutivos.

### L3 — Pre-commit checklist quando herda work-in-progress

Loop deixou 4 arquivos modificados (F-200 + tsconfig + pnpm-lock +
allowlist) + 63 untracked files. Supervisor teve que:
1. `git stash` para snapshot do trabalho
2. Inspecionar diff e validar
3. Re-validar triad (298/298 testes)
4. Fazer 2 commits atômicos separados (código vs loop config)

**Como aplicar:** supervisor SEMPRE começa por `git status` + triad,
mesmo que loop diga "feature pronta". Trust + verify.

### L4 — tsconfig paths é o "custo invisível" de adicionar engine

Adicionar 1 engine ao projeto = 2 mudanças:
- `packages/core-X/package.json` (criar pacote)
- `tsconfig.json paths` (mapear para src/index.ts)
- `pnpm-lock.yaml` (resolver workspace link)

Esquecer o `tsconfig.json paths` causa `TS2307 Cannot find module
'@akasha/core-X'` que parece erro de install mas é só config.

**Como aplicar:** quando F-200+ introduz novo engine, F-202-style
checklist inclui: `grep "@akasha/core-X" tsconfig.json`.

### L5 — Untracked mass (60+ files) = work-in-progress paralelo

State atual tem 63 arquivos untracked (correlation-engine, ritual-calculator,
mentor LLM factory, 15+ API routes portal, dashboard components). **Não é
trabalho do loop** — é de outro agente/workspace em paralelo. Supervisor
NÃO toca: deixa para o humano decidir se commita como feature grande ou
separa. Disciplina do loop = 1 feature = 1 commit.

## Como aplicar

**Próxima sessão (N+8):**

1. **F-101 (deadcode)** — rodar `pnpm exec ts-prune` em packages/apps
   commitados (não untracked), remover imports/vars mortos, commit atômico.
2. **Orchestrator circuit-breaker** — adicionar contador de 429
   consecutivos, backoff exponencial, stop.signal após N=3.
3. **F-207 (3 perfis de teste)** — adicionar fixtures Ana/Bruno/Carlos
   com chart completo (só os já no profiles-fixtures.ts? verificar).
4. **F-102 (security review)** — listar endpoints, OWASP top 10 check.

**Não fazer:**
- Tentar comitar os 60+ untracked files (não é meu trabalho).
- Reiniciar loop até token plan reset (verificar primeiro com
  `claude --print` smoke test).
- Tocar no Pilar 4 sem passar por Pilar 4 ethics checklist.
