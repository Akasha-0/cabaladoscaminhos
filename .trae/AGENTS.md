# .Trae DOX

## Purpose

Specs e planejamentos de versões do projeto Akasha. Este AGENTS.md também serve como raiz das regras do projeto — ver `rules/project_rules.md`.

## CodeGraph

Este projeto tem CodeGraph configurado (MCP server conectado ao TRAE). Sempre use `codegraph_explore` para perguntas de arquitetura e dependências antes de Grep/Glob/Read. Ver `rules/project_rules.md`.

## Ownership

- `rules/`: Regras do projeto (inclui CodeGraph e comandos de verificação)
- `specs/`: Especificações por versão (akasha-vX.Y.Z/)

## Local Contracts

- Cada spec contém: spec.md, tasks.md, checklist.md
- Tags git seguem padrão vMAJOR.MINOR.PATCH
- Ciclos de memória em `memory/` para記録

## Work Guidance

- Specs são criados para milestones significativas
- Tasks executadas em ordem de prioridade
- Commits atômicos por tarefa completada

## Verification

- `pnpm --filter akasha-portal typecheck` antes de qualquer commit
- Revisão de checklist antes de fechar spec
- `codegraph sync` após bulk file changes

## Child DOX Index

- [specs](file:///home/skynet/cabala-dos-caminhos/.trae/specs/AGENTS.md) (se existir)
- [rules](file:///home/skynet/cabala-dos-caminhos/.trae/rules/project_rules.md) (projeto)
