# Tasks
- [ ] Task 1: Auditoria e “gap list” (DB + superfícies B2B)
  - [ ] Mapear o schema atual (models/enums/relacionamentos) e comparar com Doc 04 §1–5
  - [ ] Listar superfícies B2B a remover: páginas, rotas API, libs de auth, scripts, testes
  - [ ] Registrar decisões de migração destrutiva (drop/recriar) e implicações

- [ ] Task 2: Refatorar `prisma/schema.prisma` para o núcleo Akasha v2
  - [ ] Remover completamente models/enums B2B (Operator/Client/Reading/Report/*)
  - [ ] Remover duplicações do tipo `Akasha*` e `User/Assinatura/Credito/*` que conflitam
  - [ ] Implementar exatamente os models/enums do Doc 04 §1–5 (com `@@map` conforme necessário)
  - [ ] Ajustar `GrimoireEntry` para compat com pgvector conforme Doc MIGRATIONS

- [ ] Task 3: Migrations destrutivas (novo baseline)
  - [ ] Definir estratégia: resetar histórico de migrations ou criar migration “drop legado + create canônico”
  - [ ] Criar migration(s) canônica(s) e revisar SQL (incluindo `CREATE EXTENSION vector` e índices do embedding)
  - [ ] Atualizar `prisma/seed.ts` para criar o admin (Doc 04 §7) e quaisquer seeds mínimas do Akasha v2

- [ ] Task 4: Refatorar o código para os modelos canônicos
  - [ ] Atualizar Prisma client usage (queries/CRUD) para `User/BirthChart/...` (nomes novos)
  - [ ] Ajustar rotas `src/app/api/akasha/**` para o schema canônico
  - [ ] Remover rotas/páginas B2B: `src/app/api/operator/**`, `src/app/cockpit/**` e correlatos
  - [ ] Remover libs B2B: `src/lib/auth/operator-*` e dependências

- [ ] Task 5: Refatorar testes e scripts
  - [ ] Remover/atualizar testes que cobrem B2B (Operator/Mesa Real)
  - [ ] Atualizar testes B2C/Akasha para os modelos canônicos
  - [ ] Ajustar scripts que assumem modelos legados (ex.: find-operators)

- [ ] Task 6: Atualizar documentação em `docs/`
  - [ ] Doc 04: remover §6 (legado B2B) e alinhar o texto ao schema efetivo
  - [ ] Doc 03: remover menções a `legacy-cockpit` e ajustar estrutura do repo se necessário
  - [ ] AUTH-AUDIT e MIGRATIONS: remover seções B2B e deixar apenas B2C/Akasha v2

- [ ] Task 7: Quality gates
  - [ ] `npx prisma validate` + `npx prisma generate`
  - [ ] `npx tsc --noEmit`
  - [ ] `npm run test:run`
  - [ ] `npm run build`

# Task Dependencies
- Task 2 depende de Task 1
- Task 3 depende de Task 2
- Task 4 depende de Task 2 e Task 3
- Task 5 depende de Task 4
- Task 6 pode rodar em paralelo com Task 4/5, mas deve refletir o resultado final
- Task 7 depende de Task 3, Task 4 e Task 5

