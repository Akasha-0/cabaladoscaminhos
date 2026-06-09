# Checklist — Akasha v0.0.7

## Pré-Verificações

- [ ] Nenhum teste está quebrado antes de começar (`pnpm test:run`)
- [ ] Typecheck está limpo (`pnpm typecheck`)
- [ ] Git working tree está limpo ou mudanças estão em branch separado

## Eixo A: Limpeza da Raiz

- [ ] `dead-code` deletado da raiz
- [ ] `dupes` deletado da raiz
- [ ] `health` deletado da raiz
- [ ] `fallow-report.json` deletado da raiz
- [ ] `fallow-baseline-health.json` deletado da raiz
- [ ] `fallow-baseline-dupes.json` deletado da raiz
- [ ] `.fallowrc.json.bak` deletado da raiz
- [ ] `.fallowrc.json.orig` deletado da raiz
- [ ] `MEMORY.md` deletado da raiz
- [ ] `inspect-pages.mjs` deletado da raiz
- [ ] `smoke-test.mjs` deletado da raiz
- [ ] `test-cockpit-auth-full.mjs` deletado da raiz
- [ ] `quality-report-latest.json` movido para `docs/audit/`
- [ ] `quality-evolution-history.json` movido para `docs/audit/`
- [ ] Commits de exclusão feitos (atomicidade)

## Eixo B: Contexto Centralizado

- [ ] `CONTEXT.md` criado na raiz com:
  - [ ] Estrutura do monorepo
  - [ ] Links para specs
  - [ ] Links para docs
  - [ ] Links para memory
  - [ ] Estado atual do projeto
  - [ ] Como verificar status no GitHub
  - [ ] Como rodar testes
- [ ] `AGENTS.md` atualizado com:
  - [ ] Regras de comportamento
  - [ ] Como usar specs
  - [ ] Como verificar progresso
  - [ ] Padrão de nomenclatura

## Eixo C: Atualizar Baselines e Configs

- [ ] `.fallowrc.json` atualizado:
  - [ ] Baselines apontando para `docs/audit/`
  - [ ] Sem referências a arquivos deletados
- [ ] `.gitignore` verificado/atualizado:
  - [ ] `fallow-report.json` ignorado
  - [ ] `dead-code` ignorado
  - [ ] `dupes` ignorado
  - [ ] `health` ignorado
  - [ ] Quality reports da raiz ignorados
- [ ] Ciclo Fallow limpo executado (`pnpm fallow`)
- [ ] Novo baseline salvo em `docs/audit/`

## Eixo D: Verificação de Arquitetura

- [ ] Verificação: `src/lib/domain/` não importa de `infrastructure/`
- [ ] Verificação: `src/lib/domain/` não importa de `interface/`
- [ ] Verificação: `src/lib/application/` não importa de `interface/`
- [ ] Violações documentadas (se houver)
- [ ] `docs/03_architecture-spec.md` atualizado com referência ao `CONTEXT.md`

## Eixo E: Documentação Final

- [ ] Changelog da v0.0.7 criado
- [ ] `PROGRESS.md` atualizado com entrada v0.0.7
- [ ] Métricas documentadas:
  - [ ] Números de arquivos deletados
  - [ ] Números de arquivos movidos
  - [ ] Números de issues Fallow

## Pós-Verificações

- [ ] `pnpm typecheck` ainda limpo após mudanças
- [ ] `pnpm test:run` ainda passando
- [ ] Commits feitos com mensagens descritivas
- [ ] Tag `v0.0.7` criada no git (se aplicável)
