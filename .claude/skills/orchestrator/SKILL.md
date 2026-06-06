# Orchestrator — Loop Autônomo Central

> **Tipo:** Orquestrador de ciclo de evolução contínua
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** `docs/superpowers/multi-agent/MULTI-AGENT-SYSTEM.md`

## Quando Ativar

- Início de nova sessão de desenvolvimento
- Após merge de PR grande
- Ciclo de evolução automática
- "executar ciclo completo", "rodar multi-agente", "rodar evolução", "start loop"

## Entrada

```json
{
  "phase": "N",
  "tasks": ["N.A - validar correlação", "N.B - validar arquitetura IA", "N.C - validar UI/UX"],
  "target": "QUALITY_SCORE >= 0.91"
}
```

## Fluxo de Execução

```bash
# Verificar estado atual
cat PROGRESS.md | head -60
cat memory/cycle-506.md  # ultimo ciclo
pnpm run cycle:assess     # ou: pnpm run cycle:full
```

**Verificar:**
- Gaps do ciclo anterior (CM-01, S6, A2)
- Build está verde?
- Tests estão passando?
- Painel Doc 21 (decisões pendentes)

### PLAN (Planejamento)

Identificar 3 tarefas coesas da fase atual alinhadas com:
1. Painel Doc 21 (decisões 🟡 pendentes)
2. Gaps do ciclo anterior
3. Vetores de evolução (Doc 20 §6): Profundidade do glossário, Refino da correlação, Novos sistemas

**Declarar critérios de sucesso:**
- Testes passam? (0 falhas)
- Build compila? (0 erros TypeScript)
- Quality Score >= 91%?

### EXECUTE (Execução Paralela)
Disparar 6 agentes especializados em paralelo:
```
┌──────────────────────────────────────────────────────────┐
│                 6 AGENTES EM PARALELO                    │
│                                                          │
│ spiritual-validator    → correlações espirituais         │
│ arch-ai-engineer      → arquitetura IA + swarm          │
│ ui-ux-evolution       → interface + UX                  │
│ devops-qa-tester      → DevOps/QA + testes              │
│ knowledge-validator    → base de conhecimento            │
│ platform-evolver       → coordenação + evolução          │
└──────────────────────────────────────────────────────────┘
```

### VERIFY (Verificação)

```bash
npm run build        # TypeScript: 0 erros
npm run test:run     # Tests: 0 falhas  
npm run lint         # Lint: 0 warnings
```

### EVOLVE (Evolução)

```
SE QUALITY_SCORE >= 0.91:
  → Adicionar correlação espiritual validada
  → Propor melhoria arquitetural
  → Escrever memory/cycle-NNN.md
  → Atualizar PROGRESS.md §Fases
  → Atualizar Doc 21 (decisões ✅)

SE QUALITY_SCORE < 0.91:
  → Fixar blockers primeiro
  → NÃO avançar para nova feature
  → Documentar em "Lições" do cycle-NNN.md
```

## Saída

```json
{
  "phase": "N",
  "quality_score": 0.918,
  "gates_passed": ["build", "tests", "correlations", "architecture", "uiux", "devops"],
  "gaps": [{"id": "CM-01", "severity": "MEDIUM", "status": "fixed|pending"}],
  "next_phase_tasks": ["N+1.A", "N+1.B", "N+1.C"],
  "cycles_completed": 506
}
```

## Critérios de Sucesso

| Gate | Critério | Falha se |
|------|----------|----------|
| Build | `npm run build` = 0 erros | qualquer erro TypeScript |
| Tests | `npm run test:run` = 0 falhas | qualquer teste falhando |
| Lint | `npm run lint` = 0 warnings | qualquer warning |
| Correlação | AD-20.1..20.9 validados | correspondência sem fonte |
| Arquitetura | Doc 06 + Doc 12 respeitados | pergunta aberta no dossiê |
| UI/UX | Doc 17 + Doc 13 respeitados | modal detectada |
| DevOps | Doc 19 + Doc 22 respeitados | PII em log |
| Conhecimento | Doc 15 + Doc 20 respeitados | significado inventado |

**QUALITY_SCORE** = gates_aprovados / 8

## Regras

1. **Nunca inventar correspondência.** Fonte é obrigatória (AD-20.1).
2. **Testes antes de assertar.** Passou no `npm run test:run` antes de declarar.
3. **Cada ciclo gera memória.** `memory/cycle-NNN.md` é obrigatório.
4. **Cirúrgico.** Não "melhorar" código fora do escopo.
5. **Documentação vence código.** Hierarquia: Doc 17 → Doc 18 → Doc 23 → Doc 16 → Doc 13 → Doc 11 → Doc 06 → Doc 20.

## Contexto de Arquivos Canônicos

| Conceito | Fonte |
|----------|-------|
| 36 cartas | `src/lib/constants/lenormand-cards.ts` |
| 16 Odus | `src/lib/constants/odus.ts` |
| 36 casas correlação | `src/lib/ai/correlation-map.ts` |
| Theme router | `src/lib/ai/theme-router.ts` |
| 4 mapas | `src/types/index.ts` |
| Calculadoras | `src/lib/calculators/*` |
| Swarm 12 agentes | `src/lib/swarm/swarm-orchestrator.ts` |
| Ledger correlações | `IDEIA.md` |
| Painel decisões | `docs/21_registro-decisoes-roadmap.md` |
