# Tasks — Akasha v0.0.7

## Eixo A: Limpeza da Raiz

- [ ] **T1: Deletar arquivos Categoria 1 (seguro)**
  - [ ] T1.1: Deletar `dead-code`
  - [ ] T1.2: Deletar `dupes`
  - [ ] T1.3: Deletar `health`
  - [ ] T1.4: Deletar `fallow-report.json`
  - [ ] T1.5: Deletar `fallow-baseline-health.json`
  - [ ] T1.6: Deletar `fallow-baseline-dupes.json`
  - [ ] T1.7: Deletar `.fallowrc.json.bak`
  - [ ] T1.8: Deletar `.fallowrc.json.orig`
  - [ ] T1.9: Deletar `MEMORY.md`

- [ ] **T2: Deletar arquivos Categoria 2 (vestígios Cockpit)**
  - [ ] T2.1: Deletar `inspect-pages.mjs`
  - [ ] T2.2: Deletar `smoke-test.mjs`
  - [ ] T2.3: Deletar `test-cockpit-auth-full.mjs`

- [ ] **T3: Arquivar quality reports**
  - [ ] T3.1: Mover `quality-report-latest.json` → `docs/audit/`
  - [ ] T3.2: Mover `quality-evolution-history.json` → `docs/audit/`

## Eixo B: Contexto Centralizado

- [ ] **T4: Criar `CONTEXT.md` na raiz**
  - [ ] T4.1: Criar índice central com estrutura do monorepo
  - [ ] T4.2: Incluir links para specs, docs, memory
  - [ ] T4.3: Incluir estado atual do projeto
  - [ ] T4.4: Incluir como verificar status no GitHub
  - [ ] T4.5: Incluir como rodar testes e quality gates

- [ ] **T5: Atualizar `AGENTS.md`**
  - [ ] T5.1: Consolidar regras de comportamento
  - [ ] T5.2: Incluir como usar specs
  - [ ] T5.3: Incluir como verificar progresso
  - [ ] T5.4: Incluir padrão de nomenclatura de versões

## Eixo C: Atualizar Baselines e Configs

- [ ] **T6: Atualizar `.fallowrc.json`**
  - [ ] T6.1: Apontar baselines para `docs/audit/`
  - [ ] T6.2: Remover referências a arquivos deletados

- [ ] **T7: Verificar e atualizar `.gitignore`**
  - [ ] T7.1: Garantir que `fallow-report.json` está ignorado
  - [ ] T7.2: Garantir que `dead-code`, `dupes`, `health` estão ignorados
  - [ ] T7.3: Garantir que quality reports da raiz estão ignorados

- [ ] **T8: Rodar ciclo Fallow limpo**
  - [ ] T8.1: Executar `pnpm fallow`
  - [ ] T8.2: Verificar novo baseline em `docs/audit/`
  - [ ] T8.3: Documentar número de issues encontrados

## Eixo D: Verificação de Arquitetura

- [ ] **T9: Verificar aderência ao layout de 5 camadas**
  - [ ] T9.1: Verificar que `src/lib/domain/` não importa de `infrastructure/`
  - [ ] T9.2: Verificar que `src/lib/domain/` não importa de `interface/`
  - [ ] T9.3: Verificar que `src/lib/application/` não importa de `interface/`
  - [ ] T9.4: Documentar violações se houver

- [ ] **T10: Atualizar `docs/03_architecture-spec.md`**
  - [ ] T10.1: Incluir referência ao novo `CONTEXT.md`
  - [ ] T10.2: Atualizar seção de dependências se necessário

## Eixo E: Documentação Final

- [ ] **T11: Criar changelog da v0.0.7**
  - [ ] T11.1: Documentar arquivos deletados
  - [ ] T11.2: Documentar arquivos movidos
  - [ ] T11.3: Documentar novos arquivos criados

- [ ] **T12: Atualizar `PROGRESS.md`**
  - [ ] T12.1: Adicionar entrada para v0.0.7
  - [ ] T12.2: Incluir métricas: arquivos deletados, etc

---

## Task Dependencies

```
T1 → T6 (só atualizar .fallowrc.json após deletar arquivos)
T3 → T6 (mover arquivos antes de atualizar config)
T4 → T5 (criar CONTEXT.md antes de consolidar AGENTS.md)
T6 → T7 (atualizar configs na ordem correta)
T7 → T8 (gitignore deve estar correto antes de rodar fallow)
T9 → T10 (verificar arquitetura antes de atualizar docs)
T8 → T11 (rodar fallow antes de documentar)
T11 → T12 (changelog antes de progress)
```

## Prioridade de Execução

**Fase 1 (Paralelo):** T1, T2, T3 (limpeza da raiz)
**Fase 2 (Sequencial):** T4 → T5 (contexto centralizado)
**Fase 3 (Paralelo):** T6, T7 (configs)
**Fase 4 (Sequencial):** T8 → T11 (fallow → changelog)
**Fase 5 (Paralelo):** T9, T10, T12 (verificação e docs)
