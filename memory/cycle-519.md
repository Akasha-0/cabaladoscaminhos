# Cycle 519 — 2026-06-15

## F-231: Qualidade (i18n EN completo)

Spec 2/4 do roadmap contínuo (Mandala → este → Grimoire → RAG).
Sessão única, totalmente autônoma.

### What was done

#### Fase A — Fix i18n test infrastructure ✓
4 testes i18n estavam falhando:
- `tests/lib/i18n/dictionaries.test.ts`: caminho de import errado (3 níveis → 3 níveis corretos)
- `tests/lib/i18n/comprehensive.test.ts`: mesmo problema + import do `config.ts`
- `tests/lib/i18n/middleware.test.ts`: mesmo problema
- `tests/lib/i18n/grimoire-completeness.test.ts`: escaneava `AGENTS.md` files como entries de grimoire → 3 falsos positivos

**Antes**: 4/4 i18n test files failing (parte dos 263 testes falhando do projeto)
**Depois**: 4/4 i18n test files passing, **42/42 tests passing**

#### Fase B — Completude do grimoire EN ✓
Grimoire 100% EN. Não havia gap real (após fix do AGENTS.md filter, todos os 99 arquivos
não-AGENTS têm `## EN` section com >200 chars e `title_en` no frontmatter).

#### Fase C — Validação automatizada en.json ↔ pt-BR.json ✓
- Script `scripts/check-i18n-parity.mjs` (novo): valida paridade de chaves, exit 0/1
- Adicionado `pnpm i18n:check` no `apps/akasha-portal/package.json`
- Documentado em `apps/akasha-portal/AGENTS.md` (Work Guidance)

### Verification
- `pnpm test:run tests/lib/i18n/`: **4/4 files passing, 42/42 tests**
- `pnpm i18n:check`: exit 0 (paridade 1:1, 35 chaves)
- `pnpm --filter akasha-portal typecheck`: exit 0
- `pnpm --filter akasha-portal lint`: 0 errors

### Key Files Changed
- `tests/lib/i18n/dictionaries.test.ts` — fix import path
- `tests/lib/i18n/comprehensive.test.ts` — fix import paths (3 imports)
- `tests/lib/i18n/middleware.test.ts` — fix import path
- `tests/lib/i18n/grimoire-completeness.test.ts` — exclude AGENTS.md
- `scripts/check-i18n-parity.mjs` — novo
- `apps/akasha-portal/package.json` — adicionado `i18n:check` script
- `apps/akasha-portal/AGENTS.md` — DOX pass (Work Guidance)
- `.trae/specs/qualidade-i18n-en/spec.md` — spec multi-fase

### Decisions
- **CodeGraph + análise manual antes de tudo**: evitou escopo inflado. Foco no gap real (4
  testes quebrados + 1 script novo), não no que parecia estar quebrado.
- **Não reescrevi `translate-en-sections.mjs`**: o script já funciona (98/99 grimoire files
  já tinham ## EN). A correção foi de TESTES, não do script.
- **Path dos imports**: tests em `tests/lib/i18n/` (4 níveis da raiz) precisam de
  `../../../` para chegar à raiz. O código original usava `../../../` apontando para
  `src/i18n/` que resolvia para `tests/src/i18n/` (inexistente). Corrigido para
  `../../../apps/akasha-portal/src/i18n/`.

### Next Spec (Grimoire)
Próximo do roadmap: Expansão do Grimoire. Candidatos:
- Validar 16 odus restantes contra fontes publicadas
- Completar 64 hexagramas I-Ching com grima
- Catálogo de ervas (Candomblé/Umbanda) — quantas faltam?
- EN translation pipeline (Doc 25 §9 Fase 2)
- RAG corpus preparation

### Next
- Próxima sessão: spec Grimoire (próximo do roadmap)
- Considerar rodar `pnpm i18n:check` no CI (GitHub Actions)
- Investigar por que os outros ~259 testes falham (provavelmente ResizeObserver SSR issue,
  infraestrutura de testes)
