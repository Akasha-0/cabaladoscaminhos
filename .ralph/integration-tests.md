## Task: Implementar Testes de Integração para APIs REST

### Meta
Adicionar cobertura de testes de integração para as APIs do projeto cabala-dos-caminhos.

### Context
- Stack: Next.js 16, Vitest, Prisma, PostgreSQL
- 14 APIs existentes (públicas + protegidas)
- JWT Auth implementado (v0.0.2)

### Implementation Steps

1. **Criar setup de testes**
   - `tests/integration/setup.ts`
   - Configurar ambiente com JWT_SECRET e variáveis

2. **Criar testes de API Auth**
   - `tests/integration/api/auth.test.ts`
   - POST /api/auth/login (válido, inválido, campos faltando)
   - POST /api/auth/logout

3. **Criar testes de APIs Públicas**
   - `tests/integration/api/public.test.ts`
   - POST /api/astrologia/mapa-natal
   - POST /api/astrologia/transitos
   - POST /api/numerologia
   - GET /api/odus
   - POST /api/ciclos

4. **Criar testes de APIs Protegidas**
   - `tests/integration/api/protected.test.ts`
   - GET /api/creditos (com/sem token)
   - POST /api/creditos/debitar

5. **Criar testes de Middleware**
   - `tests/integration/middleware.test.ts`
   - Rotas protegidas retornam 401 sem token
   - Rotas públicas não requerem token

6. **Verificar**
   - npm run test -- --run
   - npm run lint
   - npm run build

### Definition of Done
- [ ] Todos os testes passam
- [ ] Cobertura >= 70% para APIs
- [ ] Build passa