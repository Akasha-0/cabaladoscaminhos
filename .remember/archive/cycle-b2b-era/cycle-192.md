---
name: cycle-192
description: quick — 2026-06-03 — chore(refactor): remove 5 dead files (no consumers)
metadata:
  type: project
  cycle: 192
  mode: quick
  duration_s: ~360
  originSessionId: cabala-hourly-loop
---

# Cycle 192 — quick — 2026-06-03

## Mudanças

- **Commit `e12fc997`**: `chore(refactor): remove 5 dead files (no consumers)`
- **5 arquivos removidos, -886 LOC**:
  - `src/components/cockpit/dashboard/MetricsCards.tsx` (58) — 0 importers (DashboardPanel tem `RecentReadingsTable` inline)
  - `src/components/cockpit/dashboard/RecentReadings.tsx` (106) — 0 importers (mesma razão)
  - `src/components/operator/auth/ForgotPasswordForm.tsx` (162) — 0 importers (UI de recovery não montada, Phase 19 pendente)
  - `src/components/operator/auth/ResetPasswordForm.tsx` (252) — 0 importers (mesma razão)
  - `src/styles/tokens.css` (308) — self-marked `// fallow-ignore-file unused-file`; `ramiro-tokens.css` é o live source
- **Fallowrc**: nenhuma entry para remover (cockpit/** já broad-ignored; tokens.css self-flagged; password forms não estavam no ignorePatterns — fallow passaria a reportar, mas esses arquivos já não existem)

## Verificação

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run test:run` | ✅ 1772 passed, 17 skipped (82 files), 23.89s — **0 regressões vs cycle-191** |
| `npm run build` | ❌ **PRE-EXISTING** — `/_global-error` useContext null (cycle-188/189/190/191) |

## Pré-existentes registrados (NÃO mexer)

- Build error em `/_global-error` — reproduz em HEAD limpo. Root cause `next/font/google` no layout cria contexto React 19 indisponível durante prerender de `/_global-error`. Sem consumidores dessa rota no app atual. **4+ ciclos consecutivos**.

## Próximas fases sugeridas

- **P0 build fix (cycle-188+)**: substituir `next/font/google` em `src/app/layout.tsx` por `<link rel="stylesheet">` direto no `<head>` + redefinir `--font-cinzel/cormorant/raleway/imfell/lora/jetbrains` em `globals.css` (ou via `:root { font-family }`). Cycle-189 hipótese: provavelmente destrava o prerender de `/_global-error`. **30min-1h, alto valor.**
- T7.2 keyboard shortcuts (~4h) — UX polish
- Fase 14 Operator.sessions — **já feito em cycle-127 (Fase 18)**, atualizar task-queue.md
- Mais dead-file sweep: candidates restantes do knip (verificar próximos; `src/lib/credits/custos.ts` tem 1 importer → KEEP)

## Lições

- Cockpit dashboard `MetricsCards`/`RecentReadings` são resquícios da Onda E; `DashboardPanel.tsx` consolida ambos em `RecentReadingsTable` inline + cards próprios.
- Password forms são sketches preparados para Fase 19 (recovery flow) ainda não implementada. Manter REMOVIDOS até Fase 19 — quando recriar, copiar do git history.
- `styles/tokens.css` vs `styles/ramiro-tokens.css` confusão recorrente — só o ramiro- é live.
