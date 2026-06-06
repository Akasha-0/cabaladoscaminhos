# Cycle 513 — Arquitetura de Dados Dinâmica & Configurações de Múltiplos Provedores de LLM

**Date:** 2026-06-05
**Type:** Feature / LLM Integration
**Branch:** worktree-local

## Contexto

Visando eliminar o acúmulo de dicionários e explicações textuais estáticas redundantes de correspondências esotéricas (reduzindo linhas de código estáticas desnecessárias), o sistema foi migrado para uma arquitetura orientada por inteligência artificial gerada dinamicamente sob demanda. 
O cockpit agora permite ao operador configurar múltiplos provedores de LLM (OpenAI, Minimax, Anthropic e modelos locais rodando via LM Studio ou Ollama) e obter interpretações sob demanda direto em cada elemento visual do mapa de um consulente através de um modal com streaming SSE.

## Mudanças

**`prisma/schema.prisma`**:
- Criado o modelo `OperatorLlmSetting` para guardar chaves de API, endpoints customizados e ID do modelo para cada operador.
- Adicionada a relação `llmSetting` um-para-um no modelo `Operator`.

**`src/lib/db/llm-settings-actions.ts`**:
- Criadas Server Actions para salvar e recuperar configurações do operador ativo, encapsulando e mapeando explicitamente o tipo do banco de dados para a tipagem Zod da interface.

**`src/lib/ai/llm-router.ts`**:
- Criada a camada de roteamento unificada (`getLlmConfig`, `generateCompletion`, `streamCompletion`) suportando OpenAI, Minimax, Anthropic e provedores compatíveis com a API da OpenAI.
- Corrigido bug de validação da Anthropic onde system prompts eram inseridos na lista de mensagens normais, gerando múltiplos papéis de usuário repetidos consecutivamente.

**`src/app/api/operator/interpret-aspect/route.ts`**:
- Desenvolvido o endpoint HTTP POST que recupera as coordenadas e dados do consulente e inicia o stream SSE na persona do Cigano Ramiro (tom místico-tecnológico, segunda pessoa, conciso em 2 parágrafos com conselho ao final).

**`src/components/cockpit/clients/ClientMapPreview.tsx`**:
- Adicionados cards interativos e botões/ícones para abrir modal de aprofundamento.
- Corrigido erro de mutabilidade onde a variável `geocoded` de autocompletar coordenadas de consulente estava declarada como `const`.

**`src/components/cockpit/clients/ClientAspectModal.tsx`**:
- Criado modal centralizado com glassmorphic design e animações premium para consumir e exibir em tempo real o stream da análise mística via SSE.

**`src/app/cockpit/settings/page.tsx`**:
- Integrado o formulário de configurações de LLM (`LlmSettingsForm`) permitindo a alternância de provedores.

**`tests/lib/ai/llm-router.test.ts` & `tests/api/interpret-aspect.test.ts`**:
- Criados testes unitários e de integração validando o roteador (fallbacks, OpenAI SDK, chamadas REST da Anthropic e Minimax, geradores de stream) e o endpoint de streaming com autenticação e validação de parâmetros.

## Validação

- `npx tsc --noEmit` → 0 erros
- `npm run test:run` → **8764 passed** | 29 skipped | 0 failing (+12 vs baseline 8752)
- `npm run build` → Build de produção concluído com sucesso

## Lições

- **Normalização de Múltiplos SDKs**: Integrar provedores locais (LM Studio e Ollama) é extremamente simples usando a biblioteca oficial da OpenAI e apenas sobrescrevendo o parâmetro `baseURL` (apontando para o endpoint local) e definindo uma chave de API fictícia.
- **Alternação de Roles na Anthropic**: Diferente da OpenAI que permite misturar mensagens do sistema ou consecutivas, o endpoint `/v1/messages` da Anthropic lança erros HTTP 400 se mensagens `system` forem convertidas para `user` resultando em mensagens repetidas do mesmo emissor. A filtragem estrita é obrigatória.
