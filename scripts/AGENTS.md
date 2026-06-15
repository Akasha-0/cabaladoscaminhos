# Scripts DOX

## Purpose

Scripts utilitários para manutenção, automação, i18n, e integrações.
Todos executáveis standalone (sem deps externas além de Node.js ou
`.headroom-venv/` local).

## Ownership

### Setup & Deployment
- `akasha-setup.sh` — bootstrap do ambiente (DB, deps, .env)

### i18n
- `check-i18n-parity.mjs` — valida paridade en.json ↔ pt-BR.json
  (F-231 spec, Fase C). Exit 0 = parity OK, 1 = mismatch.
  Uso: `pnpm i18n:check` ou `node scripts/check-i18n-parity.mjs`
- `add-en-sections.mjs` — adiciona `## EN` section em entries MD
  (translation-status note + summary, NUNCA full translation)
- `translate-en-sections.mjs` — batch translation (LLM ou manual)

### Headroom (compress tool outputs)
- `headroom-handoff.sh` — comprime markdown/texto via `headroom.compress()`,
  grava `.compressed.md` com header de stats
- `headroom-wrap-claude.sh` — sobe `headroom proxy` na 8787 e executa
  `claude` com `ANTHROPIC_BASE_URL` apontado ao proxy
  ⚠️ Requer `~/.local/bin/headroom` (symlink, ver N+28)

## Local Contracts

- **Standalone executável** (sem deps complexas além de Node ou venv)
- **.mjs** para Node.js (ESM modules)
- **.sh** para shell scripts
- **Headroom scripts** dependem de `.headroom-venv/` na raiz do projeto
- **Idempotência** quando aplicável (rerunnable sem side-effects)
- **Documentação no header** (shebang `#!/usr/bin/env bash` + comment block
  com Usage, Exit codes, Dependencies)

## Work Guidance

- Scripts de produção em `deploy/` (systemd unit files)
- Scripts de dev/test em `scripts/`
- Não commitar secrets ou credenciais hardcoded
- Preferir .mjs (ESM) sobre .cjs ou .js
- Testar em ambiente limpo antes de merge

## Verification

- Verificar executável com `chmod +x` quando necessário
- Testar em ambiente limpo
- `pnpm i18n:check` (CI gate) para validar mudanças em i18n files
- `shellcheck scripts/*.sh` antes de merge (recomendado, não obrigatório)

## Notas Históricas

- `headroom-handoff.sh` foi criado para comprimir plan files para CCR
  (Compressed Context Retrieval); menos útil após MCP headroom (jun/2026)
- `headroom-wrap-claude.sh` resolveu o problema de `headroom: not found`
  via symlink em `~/.local/bin/headroom` (lesson N+28)
- `check-i18n-parity.mjs` é o gate de CI para paridade i18n (F-231)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md. Scripts são flat — adicionar novo
script = adicionar entry em "Inventory" acima.)
