# Tasks — Akasha v0.0.8

## Ordem de Execução

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10
                      ↑───────┴──────┘
                      (podem ser paralelos após T4)
```

**Dependências:**
- T5-T8 dependem de T4 (análise inicial do Fallow)
- T5, T6, T7 podem rodar em paralelo após T4
- T9 é gate para tudo
- T10 é sempre última

---

## T1: Verificar V001 (Violação de Arquitetura)

**Responsável:** Verificação manual
**Prioridade:** 🔴 Alta

- [ ] Confirmar que `domain/tarot/spread-calculator.ts` importa de `domain/types/`
- [ ] Buscar outras violações: `grep -r "from.*interface" src/lib/domain/`
- [ ] Buscar violações: `grep -r "from.*interface" src/lib/application/`
- [ ] Documentar violações encontradas

---

## T2: Limpar Re-exports Redundantes

**Responsável:** Agente de arquitetura
**Prioridade:** 🟡 Média

- [ ] Analisar `interface/api/spiritual-correlations.ts`
- [ ] Verificar se barrel file tem lógica ou é só forwarding
- [ ] Se for forwarding: deletar ou documentar como deprecated
- [ ] Buscar outros barrel files redundantes em `interface/`

---

## T3: Atualizar Documentação

**Responsável:** Agente de docs
**Prioridade:** 🟡 Média

- [ ] `docs/03_architecture-spec.md` → marcar V001 como ✅
- [ ] Adicionar nota sobre padrão de tipos em `domain/types/`
- [ ] Verificar se CONTEXT.md precisa de atualização

---

## T4: Análise Inicial Fallow

**Responsável:** Agente de análise
**Prioridade:** 🔴 Alta
**Output:** Relatório em `docs/audit/fallow-analysis-v0.0.8.md`

- [ ] Rodar `pnpm fallow`
- [ ] Classificar issues por categoria (código morto, complexidade, duplicação)
- [ ] Identificar padrões recorrentes
- [ ] Criar lista de prioridades por severidade
- [ ] Documentar findings em `docs/audit/`

---

## T5: Código Morto Real

**Responsável:** Agente de cleanup
**Prioridade:** 🔴 Alta

- [ ] Arquivos sem imports ativos
- [ ] Funções nunca chamadas (grep por nome)
- [ ] Tipos definidos mas nunca usados
- [ ] Commits atômicos por categoria

---

## T6: Violações de Arquitetura

**Responsável:** Agente de arquitetura
**Prioridade:** 🔴 Alta

- [ ] Verificar todas dependências cross-layer
- [ ] Aplicar padrão: tipos compartilhados → `domain/types/` ou `shared/`
- [ ] Atualizar barrel files para apontar para fonte canônica
- [ ] Commits por violação resolvida

---

## T7: Limpeza de Duplicação

**Responsável:** Agente de deduplicação
**Prioridade:** 🟡 Média

- [ ] Analisar clone groups do Fallow
- [ ] Identificar fontes canônicas
- [ ] Consolidar duplicações
- [ ] Commits por grupo consolidado

---

## T8: Novo Baseline Fallow

**Responsável:** Agente de qualidade
**Prioridade:** 🔴 Alta

- [ ] Após limpeza completa, rodar `pnpm fallow`
- [ ] Verificar 0 issues
- [ ] Salvar novo baseline em `docs/audit/`
- [ ] Atualizar `.fallowrc.json`

---

## T9: Verificação de Qualidade

**Responsável:** CI/Gates
**Prioridade:** 🔴 Alta

- [ ] `pnpm test:run` — todos testes passando
- [ ] `pnpm typecheck` — 0 erros
- [ ] `pnpm lint` — warnings aceitáveis
- [ ] `pnpm build` — compilação OK

---

## T10: Documentação de Decisões

**Responsável:** Agente de docs
**Prioridade:** 🟢 Baixa

**ADRs obrigatórios:**
- ADR-XXX: Tipos compartilhados em `domain/types/`
- ADR-XXX: Padrão barrel files (quando usar vs. deletar)
- ADR-XXX: Resolução de V001

- [ ] Criar ADRs para decisões arquiteturais significativas
- [ ] Atualizar CONTEXT.md com novos padrões
- [ ] Documentar exceções aceitas
