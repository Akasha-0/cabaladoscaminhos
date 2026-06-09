# Changelog — Akasha v0.0.7

> **Data:** 2026-06-08
> **Tipo:** Limpeza Arquitetural

## Arquivos Deletados

### Categoria 1: Subprodutos Fallow (9)
- `dead-code/` — diretório de relatório vazio
- `dupes/` — diretório de relatório vazio
- `health/` — diretório de relatório vazio
- `fallow-report.json` — relatório com 1029 issues
- `fallow-baseline-health.json` — baseline antigo
- `fallow-baseline-dupes.json` — baseline antigo
- `.fallowrc.json.bak` — backup redundante
- `.fallowrc.json.orig` — arquivo vazio
- `MEMORY.md` — índice manual redundante

### Categoria 2: Vestígios Cockpit (3)
- `inspect-pages.mjs` — Playwright para rotas inexistentes
- `smoke-test.mjs` — Playwright para rotas inexistentes
- `test-cockpit-auth-full.mjs` — Autenticação Cockpit

## Arquivos Movidos

- `quality-report-latest.json` → `docs/audit/`
- `quality-evolution-history.json` → `docs/audit/`

## Arquivos Criados

- `CONTEXT.md` — índice centralizado para agentes de IA

## Arquivos Atualizados

- `AGENTS.md` — regras consolidadas para agentes
- `.fallowrc.json` — baselines apontando para `docs/audit/`
- `.gitignore` — padrões Fallow adicionados
- `docs/03_architecture-spec.md` — referência ao CONTEXT.md

## Arquitetura

### Violação Documentada (V001)
- **Arquivo:** `src/lib/domain/tarot/spread-calculator.ts:12`
- **Tipo:** domain importando de interface
- **Recomendação:** Extrair tipo para domain/types/ ou shared/

## Métricas Fallow
- 3166 issues encontrados no novo baseline

## Non-Goals (O que NÃO foi feito)
- Nenhuma refatoração de código fonte
- Nenhuma nova feature
- Nenhuma modificação de schemas ou APIs
- Nenhum mexer em packages/ ou apps/
