# Akasha v0.0.8 — Limpeza Fallow Completa + Arquitetura

> **Versão:** 0.0.8
> **Status:** Proposta
> **Sucessor de:** `akasha-v0.0.7` (Limpeza da Raiz + CONTEXT.md)
> **Baseado em:** Grill Session - decisões documentadas
> **Foco:** Dívida técnica — arquitetura e código morto

---

## Why

A v0.0.7 criou o CONTEXT.md e limpou a raiz, mas deixou:
1. **3166 issues no Fallow baseline** — código morto e violações de arquitetura
2. **Violação V001 documentada** — `domain/tarot/spread-calculator.ts` importava de `interface/`
3. **Re-export circular** — `interface/api/spiritual-correlations.ts` era apenas forwarding

A v0.0.8 endereça a dívida técnica acumulada para estabelecer uma base limpa.

---

## What Changes

### Eixo A — Resolver V001 + Limpeza de Re-exports

**T1: Verificar V001**
- Confirmar que `domain/tarot/spread-calculator.ts` importa de `domain/types/`
- Verificar se há outras violações de arquitetura (domain→interface, application→interface)

**T2: Limpar re-exports redundantes**
- `interface/api/spiritual-correlations.ts` → re-export de `domain/types/`
- Verificar outros barrel files em `interface/` que são apenas forwarding

**T3: Atualizar documentação**
- `docs/03_architecture-spec.md` → marcar V001 como resolvido
- Adicionar nota sobre padrão de tipos em `domain/types/`

### Eixo B — Fallow Completo (3166 issues)

**T4: Análise inicial**
- Rodar `pnpm fallow` para identificar categorias de issues
- Classificar por severidade: código morto real vs. warnings de complexidade

**T5: Código morto real**
- Arquivos sem imports/exports ativos
- Funções nunca chamadas
- Tipos definidos mas nunca usados

**T6: Violações de arquitetura**
- Verificar dependências cross-layer (domain→interface, etc)
- Aplicar padrão: tipos compartilhados vão para `domain/types/` ou `shared/`

**T7: Limpeza de duplicação**
- Clone groups identificados pelo Fallow
- Consolidar em fontes canônicas

**T8: Novo baseline**
- Após limpeza completa, estabelecer baseline zero
- Atualizar `.fallowrc.json` com novo baseline

### Eixo C — Qualidade Contínua

**T9: Verificação de testes**
- `pnpm test:run` deve passar após cada fix
- `pnpm typecheck` deve estar limpo

**T10: Documentação de decisões**
- ADRs para decisões arquiteturais significativas
- Atualizar CONTEXT.md com novos padrões estabelecidos

---

## Impact

### Affected code

- Limpeza de código morto em todo o monorepo
- Resolvedor de dependências cross-layer
- Possível refatoração de barrel files redundantes

### Non-Goals

- ❌ Não adicionar features
- ❌ Não modificar schemas ou APIs
- ❌ Não quebrar funcionalidades existentes
- ❌ Não fazer mudanças de UX/UI

---

## Critérios de Sucesso

1. **V001 resolvido** — `docs/03_architecture-spec.md` marca V001 como ✅
2. **Fallow baseline zero** — `pnpm fallow` retorna 0 issues
3. **Testes passando** — `pnpm test:run` sem falhas
4. **Typecheck limpo** — `pnpm typecheck` sem erros
5. **Commits atômicos** — agentes fazem commits por categoria

---

## Cross-References

- **Specs anteriores:** `.trae/specs/akasha-v0.0.7/`
- **Arquitetura:** `docs/03_architecture-spec.md`
- **Roadmap:** `docs/08_roadmap.md`
- **CONTEXT.md:** índice centralizado para agentes

---

## Source of Truth

- `.trae/specs/akasha-v0.0.8/` — esta spec e tasks
- `.fallowrc.json` — configuração e baseline
- `docs/audit/` — relatórios de auditoria
