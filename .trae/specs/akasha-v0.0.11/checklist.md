# Checklist — Akasha v0.0.11

## Pré-Verificações

- [ ] Working tree limpo ou em branch separado
- [ ] Tasks.md lido e compreendido
- [ ] Dependências verificadas (cores, Prisma, Ollama)

---

## T1: Setup `packages/mentor`

- [ ] `packages/mentor/package.json` criado
- [ ] `packages/mentor/tsconfig.json` criado
- [ ] `pnpm-workspace.yaml` atualizado
- [ ] Estrutura de diretórios criada
- [ ] `packages/mentor/src/index.ts` exporta módulos
- [ ] Commit: `feat: create packages/mentor skeleton`
- [ ] `pnpm install` executado
- [ ] Spec compliance: ✅/❌

---

## T2: Tipos e Modelos

- [ ] `packages/mentor/src/types.ts` criado
- [ ] `UserMaps` interface definida
- [ ] `MentorMessage` interface definida
- [ ] `AskRequest` interface definida
- [ ] `AskResponse` interface definida
- [ ] `CorrelationResult` interface definida
- [ ] Schema Prisma atualizado (se necessário)
- [ ] Commit: `feat: add mentor types`
- [ ] Spec compliance: ✅/❌

---

## T3: Wrapper de Mapas

- [ ] `packages/mentor/src/maps.ts` criado
- [ ] `loadUserMaps()` funciona
- [ ] `formatMapsSummary()` formata corretamente
- [ ] Integra com `@akasha/core-cabala`
- [ ] Integra com `@akasha/core-odus`
- [ ] Integra com `@akasha/core-astrology`
- [ ] Integra com `@akasha/core-tantra`
- [ ] Commit: `feat: add user maps loader`
- [ ] Spec compliance: ✅/❌

---

## T4: Wrapper de Correlação

- [ ] `packages/mentor/src/correlation.ts` criado
- [ ] `getCorrelations()` retorna correlações
- [ ] Integra com `DeepCorrelationEngine`
- [ ] Prompt inclui correlações
- [ ] Commit: `feat: integrate deep correlation engine`
- [ ] Spec compliance: ✅/❌

---

## T5: CLI com Ink

- [ ] `packages/mentor/src/cli/index.ts` criado
- [ ] `packages/mentor/src/cli/MentorCLI.tsx` criado
- [ ] `packages/mentor/src/cli/chat.ts` criado
- [ ] `packages/mentor/src/cli/login.ts` criado
- [ ] Estados: login, loading, chat, error
- [ ] REPL interativo funciona
- [ ] `package.json` bin configurado
- [ ] `akasha chat` executável
- [ ] Streaming no terminal
- [ ] Commit: `feat: add akasha chat CLI`
- [ ] Spec compliance: ✅/❌

---

## T6: Web Interface

- [ ] `packages/mentor/src/web/MentorChat.tsx` criado
- [ ] Componente ChatBox
- [ ] Componente MessageList
- [ ] Componente StreamingText
- [ ] Componente MapCards
- [ ] Botão Stop (cancelar)
- [ ] API route `/api/mentor/ask`
- [ ] API route `/api/mentor/history`
- [ ] Integrado em `/oraculo`
- [ ] Commit: `feat: add mentor web interface`
- [ ] Spec compliance: ✅/❌

---

## T7: LLM Router + Guards

- [ ] `packages/mentor/src/llm-router.ts` criado
- [ ] OpenAI primary
- [ ] Ollama fallback
- [ ] Streaming SSE
- [ ] `packages/mentor/src/rate-limit.ts` criado
- [ ] 10 msg/min enforced
- [ ] `packages/mentor/src/credits.ts` criado
- [ ] Verifica credits ≥ 1
- [ ] Debita 1 credit por pergunta
- [ ] `grimoire/mentor/system-prompt.md` criado
- [ ] Commit: `feat: add LLM router and guards`
- [ ] Spec compliance: ✅/❌

---

## T8: Testes

- [ ] `tests/integration/mentor/ask-flow.test.ts`
- [ ] `tests/integration/mentor/rate-limit.test.ts`
- [ ] `tests/integration/mentor/credits.test.ts`
- [ ] `tests/integration/mentor/auth.test.ts`
- [ ] `tests/integration/mentor/maps.test.ts`
- [ ] `pnpm test:run` passa
- [ ] Commit: `test: add mentor integration tests`
- [ ] Spec compliance: ✅/❌

---

## T9: Documentação

- [ ] `packages/mentor/README.md` criado
- [ ] Instalação documentada
- [ ] Uso (CLI + Web) documentado
- [ ] API documentada
- [ ] `docs/08_roadmap.md` atualizado (v0.0.11 ✅)
- [ ] Commit: `docs: add mentor package README`
- [ ] Spec compliance: ✅/❌

---

## Verificação Final

- [ ] `pnpm typecheck` — 0 erros
- [ ] `pnpm test:run` — todos passam
- [ ] `pnpm lint` — sem warnings
- [ ] `pnpm fallow` — issues relacionadas
- [ ] CLI `akasha chat` funciona
- [ ] Web `/oraculo` funciona
- [ ] 4 mapas carregados
- [ ] Correlação entre mapas
- [ ] Streaming de resposta
- [ ] Rate limit 10/min
- [ ] Credits desconta 1
- [ ] Login via CLI
- [ ] Memory persiste

---

## Resumo Final

| Tarefa | Status | Commit |
|--------|--------|--------|
| T1: Setup | ⬜ | - |
| T2: Tipos | ⬜ | - |
| T3: Maps | ⬜ | - |
| T4: Correlation | ⬜ | - |
| T5: CLI | ⬜ | - |
| T6: Web | ⬜ | - |
| T7: LLM + Guards | ⬜ | - |
| T8: Testes | ⬜ | - |
| T9: Docs | ⬜ | - |

**Status Final:** ✅ PRONTO / ❌ BLOQUEADO
