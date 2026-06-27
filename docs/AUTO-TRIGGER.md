# 🔄 Auto-Trigger Pipeline (Wave → Wave)

> Documento de orquestração manual. Quando uma onda termina, lançar a próxima.

---

## Pipeline

```
Wave 2 (Auth + Onboarding + Posts + Smoke Tests)
    ↓ [aguarda plan_a83acfa6 status=completed]
Wave 3 (Biblioteca + Search + Mobile PWA + Notifications + Groups)
    ↓ [aguarda próximo plan]
Wave 4 (Akasha IA MVP + Prompt iteration + i18n + Voice)
    ↓
Wave 5 (Detoxify + LGPD + Security + Backup)
    ↓
Wave 6 (PostHog + SEO + Referral + CRO)
    ↓
Wave 2 (atualizado com aprendizados) — volta ao topo
```

## Como monitorar

O engine manda `team-board-status` constantemente. Quando vir:
- `status: completed` no plano atual
- `phase: awaiting_decision` ou `finished`
- Sem tasks em `producing`/`pending`

→ **Ação imediata:** lançar próxima wave.

## Comando para lançar próxima wave

```bash
# Wave 3 (próxima após Wave 2)
team({ command: "run", args: { plan_path: "/workspace/.mavis/plans/draft/wave-3-content-ux.yaml" } })

# Wave 4
team({ command: "run", args: { plan_path: "/workspace/.mavis/plans/draft/wave-4-akasha-ia.yaml" } })

# Wave 5
team({ command: "run", args: { plan_path: "/workspace/.mavis/plans/draft/wave-5-moderation-security.yaml" } })

# Wave 6
team({ command: "run", args: { plan_path: "/workspace/.mavis/plans/draft/wave-6-analytics-growth.yaml" } })
```

## Decisão entre ciclos

Quando wave termina, engine pede decisão via `team decision`:

```bash
team({
  command: "decision",
  args: {
    plan_id: "<plan_id>",
    decision: {
      last_cycle: [{ task_id: "...", verdict: "accept" }],
      next_cycle: [],
      plan_complete: true
    }
  }
})
```

Se plan_complete=true, **imediatamente disparar próxima wave**.

## Critérios para ajustar entre waves

Antes de lançar wave N+1, revisar deliverables de wave N em:
`/workspace/.mavis/plans/plan_*/outputs/*/deliverable.md`

Atualizar `docs/EVOLUTION-LOG.md` com aprendizados.

---

## Workaround para bug do tool wrapper

`cron create`/`update` não recebem args (sempre undefined). Workaround:

1. **Planos paralelos** ao invés de crons novos (mais flexível)
2. **Heartbeat engine** como gatilho (engine manda status, owner age)
3. **YAML pré-fabricados** em `/workspace/.mavis/plans/draft/`

Quando tool wrapper for consertado, este documento vira script automatizado.

---

> **Última atualização:** 2026-06-27 00:58 UTC
