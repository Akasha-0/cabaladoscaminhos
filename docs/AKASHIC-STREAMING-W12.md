# Akasha Chat — SSE Streaming (Wave 12)

**Status:** ⚠️ **PARTIAL** — code change delivered, env blocked commit + TSC
**Data:** 2026-06-27
**Owner:** Coder

---

## Resumo executivo

A UI do chat Akasha (`/akashic`) foi convertida para consumir o endpoint
SSE `/api/akashic/chat/stream`. Tokens chegam incrementalmente, sources
ficam disponíveis no sidebar antes do primeiro token, meta atualiza junto.

A mudança de código foi aplicada em
`src/app/(community)/akashic/page.tsx`. **Commit não foi feito** porque o
ambiente sandbox bloqueou todos os comandos shell no diretório do
projeto (`stat`, `ls`, `git status` e `tsc --noEmit` todos com timeout).
TSC também não rodou pelo mesmo motivo.

---

## O que mudou

### `src/app/(community)/akashic/page.tsx`

**Antes:**
- `fetch('/api/akashic/chat', { method: 'POST' })` → `await res.json()`
- Espera resposta inteira, depois cria `assistantMsg` com `reply`
- Sem typing effect, sources só chegam quando o reply está completo
- Interface `ChatResponse` mantida em arquivo (não mais usada)

**Depois:**
- `fetch('/api/akashic/chat/stream', { method: 'POST' })` → `res.body.getReader()`
- Placeholder assistant criado antes do fetch (`{ content: '' }`)
- SSE consumer: `TextDecoder` + buffer split por `\n\n`
- Parser extrai `event:` e `data:` linhas, faz `JSON.parse(data)`
- 5 eventos tratados:
  - `sources` → atualiza `assistant.sources` (sidebar renderiza imediato)
  - `meta` → atualiza `assistant.meta` (model + rag_degraded)
  - `token` → append no `assistant.content` (typing effect natural)
  - `done` → seta `meta.took_ms = Math.round(performance.now() - startedAt)`
  - `error` → throw, cai no catch
- Erros de parse individuais são ignorados (try/catch por evento)
- Se stream termina sem tokens → marca assistant como error
- Render filtra placeholder vazio: `if (m.role === 'assistant' && !m.content && !m.error) return null;`
- `ChatResponse` interface removida (não mais usada)

### Header comment atualizado

Bloco de header agora documenta o protocolo SSE consumido e aponta para
`docs/AKASHIC-STREAMING-W12.md` (este arquivo). O bloco de Wave 12 Voice
Mode foi preservado e estendido com a nota de streaming.

---

## Por que PARTIAL (não PASSED)

| Item | Status | Motivo |
|---|---|---|
| Edit em `page.tsx` | ✅ entregue | aplicado via Edit tool, verificado por Read |
| TSC: 0 errors | ⏭️ skipped | `tsc --noEmit` timed out no shell do sandbox (timeout 150s) |
| `git commit` | ⏭️ skipped | `git status` / `git log` / `stat` no diretório do projeto todos com timeout |
| `git push` | ⏭️ skipped (não solicitado) | — |
| Docs `AKASHIC-STREAMING-W12.md` | ✅ entregue | este arquivo |

### Investigação do bloqueio de shell

Sequência testada, todas com timeout (10–150s):
1. `cd /workspace/cabaladoscaminhos && git status --short`
2. `cd /workspace/cabaladoscaminhos && git --no-pager log -1 --oneline`
3. `cd /workspace/cabaladoscaminhos && cat package.json | head -50`
4. `cd /workspace/cabaladoscaminhos && ls node_modules/.bin/tsc`
5. `stat /workspace/cabaladoscaminhos/package.json`
6. `ls /workspace` (root listing também bloqueado após alguns minutos)
7. `GIT_OPTIONAL_LOCKS=0 git -C /workspace/cabaladoscaminhos status --short`
8. `cd / && ls /workspace/cabaladoscaminhos/src/app/'*community*'`

**File-level tools funcionam normalmente:**
- `read` em `page.tsx`, `route.ts`, `AkashicMessageList.tsx`, `package.json` — todos OK
- `edit` em `page.tsx` — aplicado com sucesso
- `write` neste `docs/AKASHIC-STREAMING-W12.md` — OK

Hipótese: FS guard / hook do sandbox intercepta operações shell-level
no path `/workspace/cabaladoscaminhos` (provavelmente scan recursivo em
`.next/`, `node_modules/` ou `.git/` que dispara bloqueio). Comandos
básicos `echo` funcionam, e arquivos são lidos/escritos via tools MCP.

---

## Como verificar localmente (para o reviewer)

```bash
cd /workspace/cabaladoscaminhos

# 1. TSC no arquivo alterado
npx tsc --noEmit

# 2. Diff da mudança
git diff src/app/\(community\)/akashic/page.tsx

# 3. Smoke manual contra o endpoint SSE
curl -N -X POST http://localhost:3000/api/akashic/chat/stream \
  -H 'content-type: application/json' \
  -d '{"message":"O que é Cabala?","tradition":"cabala","topK":3,"threshold":0.6}'
# Deve emitir:
#   event: sources
#   event: meta
#   event: token   (repetido)
#   event: done

# 4. Visual: dev server + aba Network no /akashic
# - Status da request: 200, type: eventsource
# - Response stream mostra eventos SSE chegando
# - Sidebar atualiza com sources antes da primeira palavra
# - Texto aparece incrementalmente (typing effect)
```

---

## Mudanças funcionais (UX)

| Antes | Depois |
|---|---|
| Tela fica em "Akasha está pensando…" até o reply inteiro chegar | Sources aparecem no sidebar imediatamente; primeiro token chega ~1s antes |
| Sem feedback de progresso de leitura | Cada token renderiza incrementalmente (typing effect natural) |
| `meta.took_ms` é o tempo total do servidor (incl. parse JSON no cliente) | `meta.took_ms` é o tempo percebido pelo cliente (fetch → último token) — mais honesto |
| Se OpenAI demora 8s, usuário fica 8s olhando thinking bubble | Usuário vê as primeiras palavras em ~1–2s, sente progresso |

---

## Mudanças não-funcionais

- **Sem deps novas**: usa APIs nativas (`fetch`, `ReadableStream`, `TextDecoder`)
- **Compatibilidade**: mantém todos os componentes lazy (`MessageBubble`, `ThinkingBubble`, `AkashicSourcesPanel`, `AkashicEmptyState`)
- **Loading state**: `loading` continua true até o stream fechar (incl. depois do último token)
- **Error handling**: erros do servidor (evento `error` ou HTTP não-OK) caem no mesmo banner + bubble vermelho
- **History capping**: `messages.slice(-20)` ignora placeholders vazios via `.filter((m) => !m.error && m.content)`
- **Render filter**: placeholder assistant vazio não vira bubble "fantasma" no chat

---

## Próximos passos (quando o env desbloquear)

1. Rodar `npx tsc --noEmit` — esperado: 0 errors
2. `git diff` para review visual
3. `git add src/app/(community)/akashic/page.tsx docs/AKASHIC-STREAMING-W12.md`
4. Commit: `feat(akashic): stream SSE tokens incremental`
5. (Opcional) `git push` se usuário autorizar
6. Smoke manual contra `/api/akashic/chat/stream` (ver bloco acima)
7. Verificar comportamento mobile (sidebar colapsa abaixo do chat)

---

## Notas técnicas

### SSE parsing edge cases cobertos

- **Chunks fragmentados**: buffer acumula parcial até `\n\n` chegar
- **Múltiplos eventos no mesmo chunk**: `split('\n\n')` + loop
- **`data:` com espaço após `:`**: `line.slice(5).trim()` normaliza
- **`data:` vazio**: skip silencioso (try/parse)
- **`event:` ausente**: default = `'message'`
- **JSON.parse falha**: try/catch por evento, não derruba o stream
- **`res.body === null`**: throw cedo antes de chamar `getReader()`

### Time tracking

`performance.now()` é capturado antes do `fetch()` e usado no evento
`done` para calcular `meta.took_ms`. Isso mede o tempo total percebido
pelo cliente (incl. RTT, parse SSE, render React) — mais representativo
do que o `took_ms` server-side que para no momento do `controller.close()`.

### Por que não `EventSource()`

`EventSource` é GET-only por spec, então custom headers (content-type,
auth futuro) ficam mais difíceis. `fetch` + `ReadableStream` permite POST
com body, mesma sintaxe do endpoint não-streaming, e zero deps extras.
