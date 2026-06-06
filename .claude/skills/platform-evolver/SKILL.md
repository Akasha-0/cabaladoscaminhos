# Platform Evolver — Evolução da Plataforma

> **Tipo:** Agente coordenador superior
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** `docs/superpowers/multi-agent/MULTI-AGENT-SYSTEM.md`

## Quando Ativar

- Ciclo de evolução completa (após 5 agentes terminarem)
- "coordenador", "platform-evolver", "sintetizar resultados", "proxima fase"
- Após todos os 5 agentes especializados reportarem

## Entrada

```json
{
  "phase": "N",
  "agentResults": {
    "spiritual-validator": { "score": 1.0, "gaps": [] },
    "arch-ai-engineer": { "score": 0.83, "gaps": [] },
    "ui-ux-evolution": { "score": 0.94, "gaps": [] },
    "devops-qa-tester": { "score": 0.94, "gaps": [] },
    "knowledge-validator": { "score": 0.88, "gaps": [] }
  },
  "qualityScore": 0.918,
  "target": 0.91
}
```

## Fluxo

### 1. Coletar Resultados

Recebe resultados dos 5 agentes:
- `spiritual-validator` — correlações validadas
- `arch-ai-engineer` — arquitetura IA validada
- `ui-ux-evolution` — interface validada
- `devops-qa-tester` — DevOps/QA validado
- `knowledge-validator` — base de conhecimento validada

### 2. Calcular Quality Score

```
QUALITY_SCORE = sum(agent_scores) / num_agents
```

Se QUALITY_SCORE >= 0.91:
- → Propor próxima fase
- → Adicionar correlação espiritual validada
- → Escrever memory/cycle-NNN.md
- → Atualizar PROGRESS.md

Se QUALITY_SCORE < 0.91:
- → Priorizar blockers
- → NÃO avançar para nova feature
- → Documentar em "Lições"

### 3. Propor Próxima Fase

Identificar 3 tarefas coesas alinhadas com:
1. Painel Doc 21 (decisões pendentes)
2. Gaps dos agentes
3. Vetores de evolução (Doc 20 §6):
   - Vetor 1: Profundidade do glossário
   - Vetor 2: Refino da correlação
   - Vetor 3: Novos sistemas (Xing, Flora, Sexualidade)

### 4. Persistir Memória

```
memory/cycle-NNN.md:
- phase: N
- qualityScore: 0.918
- gates: { build: true, tests: true, lint: true, correlations: true, architecture: true, uiux: true, devops: true, knowledge: true }
- gaps: [{ id: "CM-01", severity: "MEDIUM", status: "fixed" }]
- improvements: [corr, arch, ui, devops, knowledge]
- nextPhaseTasks: ["N+1.A", "N+1.B", "N+1.C"]
```

## Critérios de Sucesso

| Gate | Critério |
|------|---------|
| Quality Score | >= 91% |
| Memória | `memory/cycle-NNN.md` escrito |
| Progresso | `PROGRESS.md` atualizado |

## Regras

1. Só propõe nova feature se QUALITY_SCORE >= 91%
2. Cada ciclo gera memória obrigatória
3. Priorizar gaps críticos (CM-01, S6, A2) antes de nova feature
4. Nunca inventar correspondência — fonte é obrigatória
