- [ ] O schema Prisma contém apenas o núcleo Akasha v2 (User/BirthChart/Subscription/CreditEntry/Manifesto/DailyReading/RitualCompletion/Consultation/ChatMessage/GrimoireEntry) e os enums correspondentes
- [ ] Não existem mais modelos/tabelas Operator/Client/Reading/Report nem rotas `/api/operator/*` nem páginas `/cockpit/*`
- [ ] Migrations incluem criação da extensão pgvector e índice do embedding do `grimoire` conforme Doc MIGRATIONS
- [ ] `prisma/seed.ts` cria o usuário admin conforme Doc 04 §7 (com senha via env)
- [ ] Rotas `src/app/api/akasha/**` operam com os modelos canônicos (sem Akasha* duplicado)
- [ ] Documentos `docs/03_architecture-spec.md`, `docs/04_data-model.md`, `docs/AUTH-AUDIT.md`, `docs/MIGRATIONS.md` não mencionam legado/quarentena B2B e refletem o estado real do código
- [ ] Quality gates passam: `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, `npm run test:run`, `npm run build`

