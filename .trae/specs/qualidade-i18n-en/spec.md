# Spec Qualidade (i18n EN completo) — F-231

> **Multi-spec roadmap**: spec 2/4 (continua de Mandala → este → Grimoire → RAG).
> Sessão única 4-8h, totalmente autônoma.
> Implementa 3 fases focadas no gap real de i18n.

## Por que

CodeGraph check + análise manual revelaram o gap real:

**Bom estado atual** (paridade quase completa):
- `en.json` e `pt-BR.json` têm paridade 1:1 nas chaves (35 chaves cada, 0 chaves faltando)
- 98 dos 99 arquivos `.md` de grimoire já têm `## EN` section + `title_en` no frontmatter
- Middleware de locale está implementado (cookie-based)
- LocaleSwitcher funciona

**Gap real** (4 problemas):
1. **`grimoire-completeness.test.ts`** está escaneando `AGENTS.md` files como se fossem entries de grimoire → teste falha com 3 falsos positivos
2. **`dictionaries.test.ts`** importa `'../../../src/i18n/pt-BR.json'` mas o teste está em `tests/lib/i18n/` (4 níveis da raiz), então o path relativo está errado (deveria ser `'../../apps/akasha-portal/src/i18n/pt-BR.json'`)
3. **`comprehensive.test.ts`** e **`middleware.test.ts`** — provavelmente têm o mesmo problema de path
4. **1 arquivo de grimoire** está sem `## EN` e/ou `title_en` (gap real pequeno mas desconhecido)

**Resultado**: 4 arquivos de teste i18n falham (parte dos 263 testes falhando do projeto).

## O que muda

### Fase A — Fix i18n test infrastructure (alto impacto)

Consertar os 4 testes i18n quebrados. Não é trabalho criativo, é correção de path/filter bugs.

- Fix `tests/lib/i18n/dictionaries.test.ts`: import path
- Fix `tests/lib/i18n/comprehensive.test.ts`: import path
- Fix `tests/lib/i18n/middleware.test.ts`: import path
- Fix `tests/lib/i18n/grimoire-completeness.test.ts`: excluir `AGENTS.md` da lista de arquivos escaneados

**Verificação**: `pnpm test:run tests/lib/i18n/` → 4/4 passing

### Fase B — Completude do grimoire EN

Localizar e corrigir o arquivo de grimoire que está sem `## EN` e/ou `title_en`.

- Encontrar o(s) arquivo(s) com gap
- Para cada um: adicionar `title_en` no frontmatter (via dicionário do `translate-en-sections.mjs` ou manual)
- Rodar `node scripts/translate-en-sections.mjs` para gerar `## EN` automaticamente (o script já detecta arquivos sem tradução)

**Verificação**: `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts` → passing

### Fase C — Validação automatizada en.json ↔ pt-BR.json

Adicionar script CI-ready que valida paridade das chaves em cada PR.

- Script: `scripts/check-i18n-parity.mjs` que:
  - Lê `en.json` e `pt-BR.json`
  - Reporta chaves em pt-BR faltando em en (e vice-versa)
  - Exit code 1 se houver mismatch
- Adicionar `pnpm i18n:check` no `apps/akasha-portal/package.json`
- Documentar em `apps/akasha-portal/AGENTS.md`

**Verificação**: `pnpm i18n:check` → exit 0; pnpm typecheck continua ok

## Impacto

- **Specs afetados**:
  - [`mandala-fase3-zodiac-tantra`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase3-zodiac-tantra/spec.md) — i18n sincronizado en+pt-BR já é parte do critério de "done"
- **Código afetado**:
  - `tests/lib/i18n/dictionaries.test.ts` (caminho de import)
  - `tests/lib/i18n/comprehensive.test.ts` (caminho de import)
  - `tests/lib/i18n/middleware.test.ts` (caminho de import)
  - `tests/lib/i18n/grimoire-completeness.test.ts` (filtro de arquivos)
  - `apps/akasha-portal/src/i18n/en.json` + `pt-BR.json` (se gap existir)
  - `grimoire/**/*.md` (1 arquivo com gap)
  - `scripts/check-i18n-parity.mjs` (novo)
  - `apps/akasha-portal/package.json` (novo script)
  - `apps/akasha-portal/AGENTS.md` (Work Guidance atualizado)

## Constraints

- **Pilar 1 (Cabala) koréby**: traduções EN não inventadas (usar dicionário + padrões de mercado)
- **LGPD by design**: i18n não muda PII handling
- **Build**: typecheck + lint + test:unit passam
- **i18n**: en.json + pt-BR.json com paridade 1:1 (validado por script)
- **Sem mudanças cosméticas**: foco é consertar o que está quebrado

## Não-objetivos (fora do escopo)

- ❌ Reescrever `translate-en-sections.mjs` (já funciona)
- ❌ Tradução nativa de alta qualidade (Doc 25 §9 Fase 2 — futuro)
- ❌ Cobertura de testes mais ampla (outro spec)
- ❌ Acessibilidade ampliada, perf, segurança (outros specs)
- ❌ Adicionar novo idioma (ES, FR) — futuro
- ❌ Refatorar o sistema i18n (funciona bem)

## Critério de Pronto

- [ ] 4 testes i18n passam: `pnpm test:run tests/lib/i18n/` → exit 0
- [ ] Grimoire 100% EN: `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts` → exit 0
- [ ] Script `pnpm i18n:check` funciona: exit 0 quando paridade ok
- [ ] typecheck + lint passam
- [ ] AGENTS.md do akasha-portal atualizado com `i18n:check` script
- [ ] Memory cycle-519.md criado
