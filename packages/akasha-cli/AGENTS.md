# Akasha CLI DOX

## Purpose

Interface de linha de comando do sistema Cabala dos Caminhos. CLI
standalone (ESM module) que permite interagir com o sistema Akasha via
terminal — sem browser. Usa TUI `blessed` para chat rico, e conecta
diretamente ao Postgres para leituras.

**Entry point público:** `akasha` (binário via `./bin/akasha.js`)

## Ownership

- `src/cli.ts`: Entry point CLI
- `src/index.ts`: Barrel — exports para uso programático
- `src/commands/`: Comandos top-level
  - `setup.ts`: Setup inicial (credenciais, .env)
  - `chat.ts`: Chat interativo com o Mentor
  - `status.ts`: Status do sistema (DB, LLM, RAG)
  - `diagnostico.ts`: Diagnóstico rápido (versão, conectividade)
- `src/tui/`: Componentes TUI blessed-based
  - `chat.ts`: Janela de chat
  - `interface.ts`: Helpers de interface
  - `output.ts`: Formatadores de output (markdown→terminal)
  - `input.ts`: Input handling
- `src/lib/`: Utilitários
  - `color.ts`: Cores e styling
  - `config.ts`: Carregamento de .env / config files
  - `postgres.ts`: Cliente Postgres (sem @supabase — conexão direta)

## Local Contracts

- **Entry point**: `akasha` (binário). `package.json` `bin.akasha`
  aponta para `./bin/akasha.js`. Comandos são roteados em
  `src/commands/*`.
- **TUI blessed**: usar `blessed` + `blessed-contrib` v4.x. NÃO
  migrar para `ink` (esse é usado pelo `@akasha/mentor` CLI — packages
  diferentes, decisões diferentes).
- **Postgres connection**: `src/lib/postgres.ts` cria cliente direto
  (sem `@supabase` wrapper). Reusa `DATABASE_URL` do `.env`.
- **PT-BR primeiro**: outputs, prompts, mensagens de erro em PT-BR.
- **ESM module**: `package.json` `type: "module"`. Imports com `.js`
  extension (TypeScript ESM convention).
- **Zero network** (exceto DB): sem `@supabase`, sem HTTP client. CLI
  é 100% local + DB.

## Work Guidance

- **PT-BR primeiro** (i18n config do portal + DoX project). Mensagens
  do CLI sempre em PT-BR.
- **Pilar 4 (Odu) ethics invariant**: comandos que tocam em Odu
  (ex: `akasha diagnostico odu`) devem avisar `requer consentimento +
terreiro`.
- **LGPD by design**: `setup` coleta PII mínimo (só o necessário para
  birth chart). Logs não devem persistir PII em claro.
- **TUI testing**: blessed é difícil de testar unitariamente. Smoke
  test manual: `pnpm dev` (roda `akasha` em dev mode).
- **Build artifacts**: `dist/` e `node_modules/` são gitignored. NÃO
  commitar.
- **Compat**: Node.js >= 18.0.0 (per `engines`).
- **Versão CLI** (v0.0.17): acompanha versão do portal. Bump
  together.

## Verification

- `pnpm --filter akasha-cli build` — `tsc` (gera `dist/` + binário)
- Smoke test: `pnpm --filter akasha-cli start -- status` (verifica
  conexão DB)
- Smoke test: `pnpm --filter akasha-cli start -- setup --help` (deve
  mostrar help)
- Antes de commit: build (que roda tsc implicitamente)
- Antes de merge: build + portal typecheck (cross-check shared
  types se houver)

## Known Issues / Notes

- **Sem `typecheck` script** no `package.json` (só dev/build/start).
  Para validar tipos, rodar `pnpm --filter akasha-cli build`
  (tsc compila e falha se tipos quebrados).
- **Sem `test:run` script** no `package.json` (só dev/build/start).
  Tests são manuais (TUI).
- **`bin/akasha.js`** é o entry compilado. Build gera ele via
  `tsc`. Em dev, `tsx watch` roda direto de `src/cli.ts`.
- **Sem `dist/` versionado**: build artifacts são gitignored.

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `src/commands/` ou
`src/tui/` crescerem com decisões arquiteturais não-óbvias, criar
sub-AGENTS.md.)
