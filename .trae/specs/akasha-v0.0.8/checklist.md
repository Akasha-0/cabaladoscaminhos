# Checklist — Akasha v0.0.8

## Pré-Verificações

- [ ] Nenhum teste está quebrado antes de começar (`pnpm test:run`)
- [ ] Typecheck está limpo (`pnpm typecheck`)
- [ ] Git working tree está limpo ou mudanças estão em branch separado

## Eixo A: Arquitetura (V001 + Re-exports)

- [ ] T1: V001 verificado — `domain/` não importa de `interface/`
- [ ] T1: Nenhuma outra violação de arquitetura encontrada
- [ ] T2: `interface/api/spiritual-correlations.ts` limpo (forwarding ou deletado)
- [ ] T3: `docs/03_architecture-spec.md` atualizado — V001 ✅
- [ ] T3: CONTEXT.md atualizado com novos padrões

## Eixo B: Fallow (3166 → 0)

- [ ] T4: Análise inicial concluída — categorias identificadas
- [ ] T5: Código morto real removido (commits atômicos)
- [ ] T6: Violações de arquitetura resolvidas
- [ ] T7: Clone groups consolidados
- [ ] T8: `pnpm fallow` retorna 0 issues
- [ ] T8: Baseline salvo em `docs/audit/`

## Eixo C: Qualidade

- [ ] T9: `pnpm test:run` — todos passando
- [ ] T9: `pnpm typecheck` — 0 erros
- [ ] T9: `pnpm lint` — 0 erros, warnings <= baseline anterior
- [ ] T9: `pnpm build` — compilação OK

## Documentação

- [ ] T10: ADRs criados para decisões significativas
- [ ] Changelog v0.0.8 criado
- [ ] `PROGRESS.md` atualizado
- [ ] `docs/08_roadmap.md` atualizado (v0.0.8 ✅)

## Pós-Verificações

- [ ] Commits com mensagens descritivas
- [ ] Tag `v0.0.8` criada no git
- [ ] Baseline Fallow documentado
