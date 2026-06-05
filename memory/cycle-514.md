# Cycle 514 — Descrições Tântricas Dinâmicas e Resolução de Bypass de Banco de Dados

**Date:** 2026-06-05
**Type:** Feature / Bug Fix
**Branch:** worktree-local

## Contexto

Dando continuidade ao aprimoramento da arquitetura de dados dinâmica e correção de erros no Cockpit Oracular, este ciclo focou em enriquecer a experiência do usuário com descrições tântricas dinâmicas nos pilares centrais e garantir que o cockpit de desenvolvimento e bypass de autenticação funcione perfeitamente com as configurações de múltiplos provedores de LLM.

## Mudanças

**`src/components/cockpit/clients/ClientMapPreview.tsx`**:
- **Descrições Tântricas Dinâmicas**: Substituição das descrições estáticas dos 5 fatores tântricos centrais (Alma, Karma, Dom Divino, Destino, Caminho Tântrico) por descrições calculadas de forma dinâmica.
- Desenvolvido um mapeamento interno `TANTRIC_BODIES_MAP` contendo o nome e essência de cada um dos 11 corpos tântricos canônicos.
- Adicionado o helper `getBodyDesc` para extrair e mesclar o nome/essência do corpo energético calculado com a descrição funcional daquele pilar específico (ex.: "Alma (Corpo da Alma) — Como você lida consigo mesmo...").

**`src/lib/db/llm-settings-actions.ts`**:
- **Auto-registro de Operador em Bypass**: Adicionada a função helper `ensureOperatorExists` que detecta se o ID do operador ativo é o ID mock de desenvolvimento (`cockpit-bypass-dev`).
- Caso seja o operador mock, ele é automaticamente inserido na tabela `operators` com dados padrão e senha fictícia.
- Isso resolve o erro de integridade referencial (chave estrangeira) quando desenvolvedores ou agentes usam o bypass de desenvolvimento e tentam ler ou salvar configurações de LLM, tornando o fluxo 100% funcional sem exigir criação manual no banco de dados.

## Validação

- `npx tsc --noEmit` → **0 erros**
- `npm run test:run` → **8767 passed** | 29 skipped | 0 failing (todos os testes passando com sucesso, incluindo novos testes de validação)
- `npm run build` → Build de produção concluído com sucesso

## Lições

- **Flutuações de Bypass de Autenticação em Bancos Relacionais**: Sistemas de bypass de autenticação in-memory (como o usado localmente para agilizar testes e desenvolvimento do cockpit) podem causar colisões ao interagir com tabelas filhas que possuem restrições rígidas de integridade referencial (`FOREIGN KEY`). A verificação e o registro preguiçoso (*lazy load/upsert*) do operador mock no banco resolve esses conflitos de forma limpa sem poluir as regras de produção.
