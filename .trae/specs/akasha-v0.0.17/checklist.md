# Akasha OS v0.0.17 — Checklist de Verificação

**Versão:** akasha-v0.0.17
**Data:** 2026-06-10
**Responsável:** Implementação via `subagent-driven-development`

---

## Pré-requisitos

- [ ] PostgreSQL instalado e configurado
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Dependências do projeto instaladas (`pnpm install`)

---

## Qualidade de Código

- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test:run` passa
- [ ] `pnpm fallow` não tem novos issues

---

## Bug Fix: Onboarding

- [ ] PostgreSQL instalado via script
- [ ] Banco criado com usuário correto
- [ ] `.env.local` gerado com `DATABASE_URL`
- [ ] Migrations aplicadas com sucesso
- [ ] Registro de novo usuário funciona
- [ ] Login funciona após registro
- [ ] Mapa calculado após registro

---

## CLI: akasha

- [ ] Comando `akasha` abre TUI
- [ ] TUI exibe layout correto
- [ ] Input interativo funciona
- [ ] Streaming de resposta funciona
- [ ] Histórico preservado na sessão
- [ ] Comando `akasha -q "pergunta"` funciona
- [ ] Comando `akasha --help` exibe ajuda

---

## CLI: akasha setup

- [ ] Script detecta Linux corretamente
- [ ] Script detecta macOS corretamente
- [ ] PostgreSQL instalado automaticamente
- [ ] Banco criado com owner correto
- [ ] `.env.local` gerado
- [ ] Migrations executadas
- [ ] Verificação de conexão funciona
- [ ] Mensagem de sucesso exibida

---

## CLI: akasha status

- [ ] Status do PostgreSQL exibido
- [ ] Status do Redis exibido (se configurado)
- [ ] Versão do sistema exibida
- [ ] Variáveis de ambiente verificadas
- [ ] Problemas destacados

---

## CLI: akasha diagnostico

- [ ] Verifica dependências
- [ ] Testa conexão com banco
- [ ] Lista migrations pendentes
- [ ] Sugere correções quando aplicável
- [ ] Saída formatada legível

---

## Documentação

- [ ] `docs/akasha-agent-vision.md` criado
- [ ] Arquitetura documentada
- [ ] Roadmap de fases documentado
- [ ] Referências incluídas

---

## UX/UI

- [ ] Cores da interface consistentes
- [ ] Mensagens de erro claras
- [ ] Progress indicators visíveis
- [ ] Help text disponível
- [ ] Logo/marca no banner

---

## Testes

### Unitários
- [ ] Testes do script setup
- [ ] Testes do CLI parser
- [ ] Testes de helpers

### Integração
- [ ] Teste de setup completo
- [ ] Teste de onboarding
- [ ] Teste de CLI commands

---

## Commits

- [ ] Commit: "fix: add PostgreSQL setup script"
- [ ] Commit: "feat: add akasha CLI with TUI chat"
- [ ] Commit: "feat: add akasha setup command"
- [ ] Commit: "feat: add akasha status command"
- [ ] Commit: "feat: add akasha diagnostico command"
- [ ] Commit: "docs: add akasha-agent-vision.md"
- [ ] Commit: "chore: add akasha bin to package.json"

---

## Tag e Release

- [ ] Tag `v0.0.17` criada
- [ ] CHANGELOG.md atualizado
- [ ] Versão no package.json atualizada
