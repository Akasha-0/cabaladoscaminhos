# Cycle 512 — Client CRUD (Edit/Delete) & Automatic Map Recalculation

**Date:** 2026-06-04
**Type:** Feature / CRUD
**Branch:** worktree-local

## Contexto

Após a correção da listagem de consulentes e deduplicação no cadastro (Cycle 511), o usuário solicitou a implementação do CRUD completo de consulentes, permitindo editar e deletar registros diretamente na interface do Cockpit (página "Consulentes").

## Mudanças

**`src/lib/db/client-actions.ts`**:
- Atualizado `updateClientSchema` para aceitar todas as propriedades (`birthLatitude`, `birthLongitude`, `birthTimezone`, `notes`, `consentGiven`) e relaxar `birthDate` para string geral.
- Refatorado `updateClient` para realizar a verificação de duplicados (mesmo nome case-insensitive + faixa de data UTC, excluindo o próprio ID do cliente sendo alterado) lançando erro em caso de conflito.
- Implementado o recálculo automático e cache dos 4 mapas natais (Astrologia, Cabala, Tântrica, Odu) se houver alteração nos campos fundamentais (`fullName`, `birthDate`, `birthTime`, ou coordenadas/local).

**`src/app/api/mesa-real/clients/route.ts`**:
- Atualizado o bloco de erro no método `PATCH` para responder com status `409 Conflict` se for lançada a mensagem de duplicado.

**`src/components/cockpit/clients/ClientForm.tsx`**:
- Modificado para aceitar a prop opcional `client`. Em caso de edição, inicializa o formulário com os valores existentes, muda o botão para "Salvar Alterações" e faz uma requisição `PATCH /api/mesa-real/clients` com `action: 'update'` em vez de `POST`.

**`src/app/cockpit/consulentes/[id]/editar/page.tsx`**:
- Criado novo Server Component que busca os dados do consulente correspondente ao `id` da rota e renderiza o `ClientForm` em modo de edição.

**`src/components/cockpit/clients/ProfileHeaderActions.tsx`**:
- Criado componente cliente que exibe botões de "Editar" e "Excluir" no topo da página de perfil do consulente. A exclusão exibe um aviso de confirmação e executa a chamada `DELETE`.

**`src/app/cockpit/consulentes/[id]/page.tsx`**:
- Integrado o `ProfileHeaderActions` na seção de cabeçalho do perfil do consulente.

**`src/components/cockpit/consulentes/ConsulentesTable.tsx`**:
- Adicionada a coluna "Ações" ao final da tabela com ícones de edição e exclusão (com aviso de confirmação e chamada `DELETE`). Atualizado `colSpan` da linha de sem resultados de 5 para 6.

**`tests/api/mesa-real-clients-crud.test.ts`**:
- Criado arquivo com 7 testes de integração validando auth gates, exclusão bem-sucedida, edição básica, bloqueio 409 por duplicidade e recálculo automático de mapas sob modificações de data.

## Validação

- `npx tsc --noEmit` → 0 erros
- `npm run test:run` → **8752 passed** | 29 skipped | 0 failing (+7 vs baseline 8745)
- `npm run build` → Build concluído com sucesso (compile e generate)

## Lições

- **Garantia de Sincronismo Oculto**: Mapas natais dependem diretamente de nome e data/local de nascimento. Se esses dados são editáveis na UI, a lógica de persistência deve forçar o recálculo dos mapas server-side de forma reativa para que as consultas e dossiês gerados em cima do perfil alterado correspondam aos dados corrigidos.
- **Componentização de Ações Clientes em Server Pages**: Manter a página de perfil como Server Component e mover apenas os botões interativos para um pequeno Client Component (`ProfileHeaderActions`) é a melhor prática para preservar SEO, velocidade de carregamento inicial e facilidade de manutenção no Next.js App Router.
