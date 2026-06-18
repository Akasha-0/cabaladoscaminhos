# @akasha/mentor DOX

## Purpose

Mentor AI com correlação entre sistemas oraculares. CLI + API + RAG.

## Ownership

- `src/cli/`: Interface CLI standalone (Ink-based, react ink)
- `src/api/`: API Route (App Router — `/api/mentor/ask`)
- `src/rag/`: RAG pipeline (openai-embedder, cohere-embedder, rag-service)
- `src/llm/`: LLM clients (ollama, outros)
- `src/context/`: Context builders (system-prompt, code-of-day)
- `src/correlation.ts`: Motor de correlação entre sistemas
- `src/maps.ts`: Mapeamento entre 4 tradições
- `src/memory.ts`: Memória de sessão do mentor
- `src/intent-detector.ts`: Detecta intenção do usuário (consulta, crise, navegação)
- `src/mentor.ts`: Orquestrador principal

## Local Contracts

- Entry points públicos (definidos em `package.json` exports): `.`, `./cli`,
  `./api`, `./types`, `./maps`, `./correlation`, `./rag`
- API Route usa `rate-limit.ts` do portal (`@/lib/infrastructure/rate-limit`)
  — NÃO duplicar lógica de rate limit aqui
- CLI usa `src/cli/index.ts` como entry (comando `pnpm dev`)
- RAG é **obrigatório** em todas as respostas do Mentor (Doc 25 §8.3 —
  contexto grounding antes de LLM call)
- LLM provider é selecionado por `src/llm/router.ts` (Ollama por padrão,
  outros via env)
- Embedder é selecionável (OpenAI ou Cohere) via env `EMBEDDER_PROVIDER`
- `intent-detector.ts` ANTES do LLM — classifica a query (consulta, crise,
  navegação) e ajusta o prompt

## Work Guidance

- **PT-BR primeiro** (i18n config do portal). Respostas do mentor sempre
  em português brasileiro (regra do system-prompt — `grimoire/mentor/
system-prompt.md`).
- **Pilar 4 (Odu) ethics invariant**: aviso `requer consentimento +
terreiro` quando o user toca em temas de Odu. Implementado em
  `intent-detector.ts` + RAG context.
- **LGPD by design**: mínimo PII em logs de sessão. `memory.ts` tem TTL
  configurável; sessões sensíveis (com `crise_detectada=true`) devem ser
  marcadas com `expiresAt` curto.
- **Não inventar correspondências esotéricas** (AGENTS.md §5). Toda
  afirmação sobre uma tradição (Cabala, Ifá, Astrologia, Tantra) deve
  ser grounded no RAG — sem alucinação.
- **Sempre correlacionar** (Doc 25 §4): 1 resposta = no mínimo 2
  tradições conectadas. `correlation.ts` é o motor; não bypassar.
- **CLI**: usar Ink (react) — manter dependência `ink` v5.x.
- **API rate limit**: compartilhado com portal (NÃO criar próprio limiter).

## Verification

- `pnpm --filter @akasha/mentor typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/mentor test:run` — vitest (ex: `src/mentor.test.ts`,
  `src/intent-detector.test.ts`)
- Antes de commit: rodar typecheck E test:run
- Antes de merge: rodar `pnpm --filter akasha-portal typecheck` (a API
  Route importa este package — typecheck end-to-end importa)
- Smoke test manual: `pnpm dev` (roda CLI standalone para validar UX)
- **Known issue**: `@akasha/mentor typecheck` pode falhar com
  "Cannot find module '@akasha/core'" ou `'@/lib/application/ai/...'` se
  o portal estiver no meio de refactor em `lib/application/ai/*`. Isso
  é pre-existente e não causado por mudanças neste package.

## CodeGraph

Use `codegraph_explore` para perguntas de arquitetura. O mentor usa o barrel `@akasha/core-*` com imports relativos dentro dos packages. Para descobrir o que cada módulo exporta, use CodeGraph.

## Child DOX Index

(nenhum)
