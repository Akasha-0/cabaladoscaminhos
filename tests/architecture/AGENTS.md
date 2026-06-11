# Architecture Tests DOX

## Purpose
Testes de arquitetura e boundaries do projeto.

## Ownership
- `clean-architecture.test.ts`: Verificação de clean architecture
- `package-boundaries.test.ts`: Verificação de limites entre packages

## Local Contracts
- Testes de arquitetura verificam regras estruturais
- Fails em CI se architecture constraints forem violadas

## Work Guidance
- Executar antes de merge de PRs significativos
- Atualizar regras quando architecture mudar

## Verification
- `pnpm test:run tests/architecture/`

## Child DOX Index
(Nenhum subdiretório com AGENTS.md)
