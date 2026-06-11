# Akasha OS v0.0.12 — Checklist de Verificação

## Critérios de Sucesso

- [ ] `core-iching` expandido com 10 Asas
- [ ] Mapa de correlações Ifá↔Hexagrama↔Sefirot implementado
- [ ] Catálogo de 50 práticas integrativas com guardrails
- [ ] Motor de correlação híbrida funcionando
- [ ] Testes passando (`pnpm test:run`)
- [ ] Typecheck limpo (`pnpm typecheck`)

---

## Verificação por Sprint

### Sprint 1: Expansão core-iching

- [ ] `wings.ts` criado com 10 Asas completas
- [ ] Tipo `Wing` adicionado em `types.ts`
- [ ] Função `getHexagramWithWings()` implementada
- [ ] 20 práticas integrativas catalogadas
- [ ] Testes unitários passando
- [ ] Typecheck limpo

### Sprint 2: Mapa de Correlações

- [ ] Arquivo `correlation-map.ts` criado
- [ ] 16 Odús mapeados para Hexagramas
- [ ] 10 Sefirot mapeados para Trigramas
- [ ] Função `findCorrelations()` implementada
- [ ] Testes de validação passando
- [ ] Typecheck limpo

### Sprint 3: Catálogo de Práticas

- [ ] 50 práticas catalogadas
- [ ] Guardrails implementados
- [ ] Função `isSafePractice()` funcionando
- [ ] Testes de guardrails passando
- [ ] Typecheck limpo

---

## Quality Gates

```bash
pnpm test:run          # Todos os testes passando
pnpm typecheck         # 0 erros TypeScript
pnpm lint             # 0 warnings ESLint
pnpm quality          # Gates de qualidade
```

---

## Checklist de Revisão

### Código

- [ ] Nomenclatura consistente
- [ ] Comentários em português
- [ ] Sem código duplicado
- [ ] Funções pequenas e focadas
- [ ] Types bem definidos

### Documentação

- [ ] JSDoc em funções públicas
- [ ] README atualizado se necessário
- [ ] CHANGELOG atualizado

### Testes

- [ ] Cobertura > 80%
- [ ] Testes legíveis
- [ ] Sem testes commented-out
- [ ] Mocks quando necessário

---

## Criteria of Done

1. **Testes passando** — `pnpm test:run` retorna 0 erros
2. **Typecheck limpo** — `pnpm typecheck` retorna 0 erros
3. **Lint passando** — `pnpm lint` retorna 0 warnings
4. **Código revisado** — PR criado e aprovado
5. **Documentação atualizada** — Docs refletem implementação
