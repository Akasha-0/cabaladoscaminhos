# Akasha OS v0.0.18 — Checklist

**Versão:** akasha-v0.0.18
**Data:** 2026-06-10
**Status:** ⏳ Em implementação

---

## Critérios de Sucesso

### LLM Providers
- [ ] `packages/mentor/src/llm/index.ts` criado
- [ ] `packages/mentor/src/llm/openai.ts` implementa streaming
- [ ] `packages/mentor/src/llm/ollama.ts` implementa streaming
- [ ] `packages/mentor/src/llm/mock.ts` retorna respostas simuladas
- [ ] Detecção automática: Ollama → OpenAI → Mock

### MentorEngine
- [ ] `MentorEngine.ask()` usa LLM Provider real
- [ ] System prompt carregado de `grimoire/mentor/system-prompt.md`
- [ ] Código do dia calculado automaticamente
- [ ] Intent detection integrado

### TUI Streaming
- [ ] Respostas renderizadas token por token
- [ ] Indicador de streaming durante processamento
- [ ] Scroll automático para novas mensagens

### Config Local
- [ ] `~/.akasha/.env` criado com template
- [ ] `~/.akasha/config.json` criado
- [ ] `~/.akasha/data/` preparado para SQLite

### Code Quality
- [ ] Typecheck passa: `pnpm --filter @akasha/mentor exec tsc --noEmit`
- [ ] Typecheck passa: `pnpm --filter akasha-cli exec tsc --noEmit`
- [ ] Tests passam: `pnpm test:run`

---

## Commits Planejados

```
1. feat(mentor): add LLM abstraction layer (OpenAI, Ollama, Mock)
2. feat(mentor): implement streaming in providers
3. feat(mentor): integrate system-prompt loader
4. feat(mentor): add code-of-day calculation
5. feat(akasha-cli): add streaming to TUI output
6. feat(akasha-cli): add ~/.akasha/ config support
```

---

## Notas de Verificação

### Testar OpenAI
```bash
export OPENAI_API_KEY=sk-...
cd packages/akasha-cli && pnpm dev
# Digitar mensagem e verificar resposta real
```

### Testar Ollama
```bash
ollama serve &
ollama pull llama3
cd packages/akasha-cli && pnpm dev
# Verificar se Ollama é detectado automaticamente
```

### Testar Fallback
```bash
# Sem OPENAI_API_KEY, sem Ollama rodando
cd packages/akasha-cli && pnpm dev
# Verificar se mock é usado
```
