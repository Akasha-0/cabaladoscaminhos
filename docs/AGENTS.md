# Docs DOX

## Purpose

Documentação canônica do projeto Akasha.

## CodeGraph

Para perguntas sobre arquitetura, dependências ou estrutura do código, use `codegraph_explore` — não leia arquivos manualmente para descoberta. Ver `.trae/rules/project_rules.md`.

## Ownership

- `adrs/`: Architecture Decision Records
- `audit/`: Relatórios de auditoria e fallow
- `pesquisa/`: benchmark, sínteses e resumos de pesquisa
- `sintese/`: síntese interna e arquitetura de referência
- `superpowers/`: Especificações de superpoderes multi-agent

## Local Contracts

- Docs são fonte de verdade para decisões de arquitetura
- ADR-###: Formato padrão de decisão
- Specs em `.trae/specs/` para planejamentos
- Ponteiro canônico: `00_README.md`

## Work Guidance

- Manter docs atualizados após mudanças significativas
- ADR é criado quando há decisão arquitetural importante
- Audit reports refletem estado do código

## Verification

- Revisão manual ao fechar milestones
- Fallow analysis: `pnpm fallow`

## Child DOX Index

- [adrs](file:///home/skynet/cabala-dos-caminhos/docs/adrs/AGENTS.md)
