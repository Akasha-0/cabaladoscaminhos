# Specs DOX

## Purpose

Especificações de versão do projeto Akasha. Cada `akasha-vX.Y.Z/` é
1 spec completa: spec.md (why/what/impact), tasks.md (workstreams),
checklist.md (verification).

## Ownership

- `akasha-v0.0.1/`, `akasha-v0.0.2/`, ..., `akasha-v0.0.20/`: Cada
  versão tem sua spec independente
  - `spec.md`: Why, What, Impact, Decisões Tomadas
  - `tasks.md`: Lista de tarefas por workstream (WS-N)
  - `checklist.md`: Verificação item-by-item
- `mandala-fase1-api-route/`, `mandala-fase2-infopanels/`,
  `mandala-fase3-zodiac-tantra/`: Specs paralelas para fases do Mandala
- `qualidade-i18n-en/`: Spec para paridade i18n EN (F-231)

## Local Contracts

- **Specs refletem estado PLANEJADO, não histórico** (history → `memory/cycle-NNN.md`)
- **Tags Git** marcam releases correspondentes (`v0.0.X`)
- **Lesson N+27** (spec chain staleness): sempre rodar `ls` antes de
  marcar items como done — checklist drift é sistêmico
- Status values: `📝 Draft` → `⏳ Pronta para implementação` →
  `🚧 Em implementação` → `✅ Completa`
- Uma spec COMPLETA = items no checklist refletem REALIDADE (não
  intenção)

## Work Guidance

- Specs são criados no **início de ciclos** (planning phase)
- Tasks executadas em **ordem de prioridade** (P0 → P3)
- Checklist preenchido ao completar cada item (com file existence check)
- **NÃO mover item para done sem `ls` confirmar** que o file/path existe
- Cross-spec dependency: documente em `Related Files` (lesson N+27)
- Version strategy (memory `autonomous-versioning-strategy`):
  - v0.0.X: bugfixes / DOX / minor
  - v0.X.0: feature complete
  - vX.0.0: GA release (user approval required)

## Verification

- `pnpm test:run` ao final de cada task
- **Triad verification** (typecheck + tests + lint) antes de fechar spec
- Spec close: `git tag vX.Y.Z` + commit `chore(release): vX.Y.Z`
- Spec staleness check: `git log --since="<last-review>" -- .trae/specs/`

## Current Specs Status (Jun 2026)

| Spec | Status | Notes |
|---|---|---|
| akasha-v0.0.19 | ✅ SHIPPED (2026-06-15) | F-223..F-228 + checklist completo |
| akasha-v0.0.20 | 📝 Draft (2026-06-15) | WS-3 (F-240) + WS-5 (F-242) done; WS-1/WS-2/WS-4 já resolvidos |
| mandala-fase1..3 | ✅ Done | (Fase 1+2+3 do Mandala) |
| qualidade-i18n-en | ✅ Done | F-231 (3 fases, iters 1-3 do run anterior) |

## Related Files

- `AGENTS.md` (root) — DOX framework
- `memory/` — execution history (cycle-NNN)
- `.autonomous/lessons/INDEX.md` — cross-session lessons

## Child DOX Index

(20+ specs em `.trae/specs/akasha-v*/`. Cada spec tem seu próprio
checklist.md com items granulares. AGENTS.md dedicado por spec NÃO
é necessário — o `spec.md` é auto-contido. Exceção: se uma spec
tiver sub-specs ou workstreams complexos, criar `spec-N.N/AGENTS.md`.)
