# Scripts DOX

## Purpose
Scripts utilitários para manutenção e automação.

## Ownership
- Scripts de setup e deployment
- Scripts de migração
- Scripts de sincronização
- Integrações com ferramentas externas (ex.: `headroom-*`)

## Local Contracts
- Scripts são executáveis standalone
- Preferir .mjs para scripts Node.js
- .sh para scripts shell
- Headroom scripts dependem de `.headroom-venv/` na raiz do projeto

## Work Guidance
- Documentar propósito e uso no header
- Scripts de produção em `deploy/`
- Scripts de dev/test em `scripts/`

## Inventory
- `headroom-handoff.sh` — comprime um arquivo markdown/texto via `headroom.compress()` e grava `.compressed.md` com header de stats
- `headroom-wrap-claude.sh` — sobe `headroom proxy` na 8787 e executa `claude` com `ANTHROPIC_BASE_URL` apontado ao proxy; integra com CodeGraph (CodeGraph MCP continua funcionando, é local)

## Verification
- Verificar executável com `chmod +x` quando necessário
- Testar em ambiente limpo

## Child DOX Index
(Nenhum subdiretório com AGENTS.md)
