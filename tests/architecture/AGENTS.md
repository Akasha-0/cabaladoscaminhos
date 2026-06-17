# Architecture Tests DOX

## Purpose

Testes de arquitetura e boundaries do monorepo. Verificam REGRAS
ESTRUTURAIS automaticamente — qualquer violação é CI failure.

## Ownership

- `clean-architecture.test.ts`: Verificação de clean architecture
  (camadas Domain → Application → Infrastructure → Presentation)
- `package-boundaries.test.ts`: Verificação de limites entre packages
  (apps importam packages; packages NUNCA importam apps; cycle detection)

## Local Contracts

- Testes de arquitetura rodam em CI antes de merge
- Falham em CI se architecture constraints forem violadas
- Atualizar regras quando architecture mudar (não silenciar)
- Tests são **autónomos** — não dependem de network ou DB

## Work Guidance

- Rodar antes de merge de PRs significativos
- Adicionar nova regra: editar `clean-architecture.test.ts` ou
  `package-boundaries.test.ts`, com comentário explicando a regra
- Regra comum: dependency direction (dependências apontam para dentro)
- Regra comum: cyclic dependency check (cycle = fail)
- Regra comum: import boundaries (apps → packages, não vice-versa)

## Verification

- `pnpm test:run tests/architecture/`
- CI step: rodar antes de deploy

## Related Files

- Root AGENTS.md (DOX chain)
- `package.json` workspaces config (package boundaries)
- `tsconfig.json` paths (alias config)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `tests/architecture/
{boundary,cyclic,...}/` for criado com sub-páginas, ganhar AGENTS.md próprio.)
