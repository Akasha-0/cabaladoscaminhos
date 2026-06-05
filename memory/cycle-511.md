# Cycle 511 — Client Duplication Check and Listing Corrections

**Date:** 2026-06-04
**Type:** Bug Fix
**Branch:** worktree-local

## Contexto

O usuário reportou dois problemas:
1. Ao tentar cadastrar o mesmo cliente múltiplas vezes sob "Nova Consulta", o sistema criava múltiplos registros duplicados no banco de dados, poluindo a busca.
2. Na página "Consulentes", nenhum cliente recém-cadastrado era exibido caso não possuísse leituras vinculadas, dando a falsa impressão de que os dados não haviam sido gravados.

## Mudanças

**`src/lib/db/client-actions.ts`**:
- Adicionado um check de duplicação em `createClientWithMaps` buscando por um cliente com o mesmo `fullName` (case-insensitive) e `birthDate` (dentro da mesma faixa de data UTC, cobrindo o dia inteiro).
- Retorna `{ ok: false, error: 'Consulente com este nome e data de nascimento já cadastrado' }` se encontrado.

**`src/app/api/mesa-real/clients/route.ts`**:
- Atualizado o handler do `POST` para capturar a resposta com erro contendo "já cadastrado" e retornar uma resposta de status `409 Conflict` contendo o erro limpo.

**`src/app/cockpit/consulentes/page.tsx`**:
- Substituída a query baseada em `Reading` por uma consulta direta à tabela `Client`. Agora ela busca todos os clientes cadastrados (`prisma.client.findMany`), incluindo suas leituras filtradas pelo `operatorId` do operador logado, retornando a contagem de leituras correta e permitindo que clientes com 0 leituras sejam listados.

**`tests/api/mesa-real-clients.test.ts`**:
- Mockado `findFirst: vi.fn()` em `prisma.client` para evitar falhas nos testes existentes.
- Adicionado `vi.mocked(prisma.client.findFirst).mockResolvedValue(null)` em `beforeEach` como comportamento padrão de não-duplicidade.
- Adicionado teste de integração `returns 409 Conflict when a duplicate client is found` para validar o comportamento da API e o retorno correto do status.

## Validação

- `npx tsc --noEmit` → 0 erros
- `npm run test:run` → **8745 passed** | 29 skipped | 0 failing (+1 vs baseline 8744)
- `npm run build` → Build concluído com sucesso (compile e generate)

## Lições

- **Deduplicação por faixa de dia UTC**: Datas de nascimento podem vir com horas diferentes (como `12:00` no formulário via sidebar e `00:00` no date picker raw). Mapear `startOfDay` e `endOfDay` usando `Date.UTC` garante robustez e evita falsos negativos.
- **Query de Relacionamentos Inversa**: Listagens de entidades globais associadas por tabelas de relacionamento (como `Client` e `Operator` via `Reading`) devem listar a entidade base e incluir o relacionamento filtrado (`include { readings: { where: { operatorId } } }`) em vez de listar o relacionamento filtrado e agrupar, evitando ocultar registros com zero associações.
