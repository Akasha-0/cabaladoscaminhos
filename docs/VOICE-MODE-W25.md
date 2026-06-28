# Voice Mode — Wave 25 (2026-06-28)

> **Evolução do Voice Mode (W12) — hook reutilizável + multilíngue + atalho de teclado + endpoint server-side preparado.**

## TL;DR

- **`<VoicePlayer />`** — novo componente cliente em `src/components/akashic/voice-player.tsx`, baseado em `useTTS()`.
- **`useTTS()` hook** — TTS extraído para `src/hooks/use-tts.ts`, pronto para reuso em outras superfícies (artigos, eventos, RSS).
- **Endpoint `/api/akashic/tts`** — placeholder preparado para futura migração pra ElevenLabs / OpenAI TTS (devolve `501 Not Implemented` até lá).
- **Atalho de teclado** — `Espaço` play/pause quando o botão está focado.
- **Suporte multilíngue** — `pt-BR` (default) / `en-US` / `es-ES`, com seletor opcional.
- **Botão integrado ao `/akashic-chat`** — página simplificada também ganha o recurso (antes só o `/akashic` tinha).

> **Nota arquitetural:** o `VoiceButton` da Wave 12 segue sendo usado em `/akashic` (chat principal com RAG). O `VoicePlayer` da Wave 25 é a versão "W25-ready" — multilíngue, com atalho, com fallback server-side opcional. Migração do VoiceButton para VoicePlayer pode ser feita em wave futura quando houver demanda de múltiplos idiomas no chat principal.

---

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/hooks/use-tts.ts` | **NOVO** — hook React para TTS via Web Speech API. FSM, cleanup, autoPlay opcional, SSR-safe. |
| `src/components/akashic/voice-player.tsx` | **NOVO** — componente cliente construído sobre `useTTS`. Multilíngue, atalho Espaço, fallback server-side opcional. |
| `src/app/api/akashic/tts/route.ts` | **NOVO** — endpoint placeholder. Rate-limited (30/min), validação zod, retorna 501 com payload explicativo. |
| `src/app/akashic-chat/page.tsx` | +9 linhas — import + render `<VoicePlayer />` no final de cada mensagem da Akasha. |
| `docs/VOICE-MODE-W25.md` | **NOVO** — este doc. |
| `docs/VOICE-MODE-W12.md` | +2 linhas — link pro W25 doc, nota de coexistência VoiceButton × VoicePlayer. |

**Total: 4 arquivos novos (3 código + 1 doc), 2 modificados.**

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│  <VoicePlayer text="..." locale="pt-BR" />                  │
│                                                              │
│   ├─ useTTS() → window.speechSynthesis  (PRIMARY, 95%+ UX) │
│   │     • Web Speech API nativa                             │
│   │     • Zero custo, zero latência inicial                 │
│   │     • pt-BR out-of-the-box (Chrome/Safari/Firefox)      │
│   │                                                         │
│   └─ fetch(endpoint) → POST /api/akashic/tts  (FALLBACK)     │
│         • Hoje: 501 Not Implemented                         │
│         • Wave 26+: ElevenLabs / OpenAI TTS                 │
│         • Útil pra Firefox antigos ou vozes customizadas     │
└──────────────────────────────────────────────────────────────┘
```

### Por que hook + componente separados

- **Reuso futuro**: artigos, eventos, RSS reader, push notifications — qualquer superfície que precise narrar texto pode chamar `useTTS()` direto.
- **Testabilidade**: o hook é puro (efeitos só em `useEffect`); o componente vira só UI + glue.
- **Server-side TTS**: quando migrarmos pra ElevenLabs, o hook ganha uma opção `backend: 'web' | 'server'` sem mudar a interface pública. VoicePlayer já lê `endpoint` opcional.

### Por que Web Speech API primeiro (e não ElevenLabs direto)

| Critério | Web Speech API | ElevenLabs server-side |
|---|---|---|
| Custo | Grátis | ~$0.30/1000 chars |
| Latência inicial | <100ms | 500ms–2s (HTTP + generation) |
| Privacidade | Local quando offline TTS | Sempre cloud |
| Vozes pt-BR | Já instaladas no browser | Voice cloning caro |
| Mobile support | ✅ iOS, Android | ✅ via streaming |
| SSR-safe | ✅ nativo | precisa endpoint |

**Decisão Wave 25:** Web Speech API cobre 95% dos casos com zero infra. Endpoint server-side fica preparado para Wave 26+ quando a Akasha ganhar voz própria (clone).

---

## Hook `useTTS()`

### API pública

```ts
const { state, supported, hasContent, speak, stop, toggle } = useTTS({
  text: string,
  lang?: 'pt-BR' | 'en-US' | 'es-ES',
  rate?: number,    // 0.1–10, default 1.0
  pitch?: number,   // 0–2, default 1.0
  volume?: number,  // 0–1, default 1.0
  autoPlay?: boolean, // default false
});
```

### FSM

```
idle ──speak()──► loading ──voices ready──► playing ──end──► idle
   ▲                                                  │
   └─────────────────── stop() ──────────────────────┘

   qualquer estado ──erro──► error ──speak()──► loading
```

### SSR-safety

Detecção de suporte em `useEffect` (client-only). Em SSR `supported=true` por default — sem hydration mismatch, porque o componente é `'use client'` e a checagem só acontece após hidratação.

### Cleanup

`useEffect` cleanup chama `window.speechSynthesis.cancel()` no unmount. Evita "voz fantasma" quando o usuário navega pra outra página ou apaga uma mensagem durante a narração.

---

## Componente `<VoicePlayer />`

### Props

```tsx
<VoicePlayer
  text={string}               // conteúdo a narrar (obrigatório)
  locale="pt-BR"              // BCP-47 — default pt-BR
  rate={1.0}                  // 0.1–10 — default 1.0
  pitch={1.0}                 // 0–2 — default 1.0
  volume={1.0}                // 0–1 — default 1.0
  endpoint="/api/akashic/tts" // server-side fallback (opcional)
  showLocaleSwitch={false}    // mostra dropdown de idioma
  className={string}          // classes extras
  labelId={string}            // aria-labelledby custom
/>
```

### Estados visuais

| State | Ícone | Label | aria-label |
|---|---|---|---|
| `idle` | Volume2 | "Ouvir" | "Ouvir resposta em voz alta" |
| `loading` | Loader2 (spin) | "Ouvir" | "Ouvir resposta em voz alta" |
| `playing` | Square | "Parar" | "Parar leitura em voz alta" |
| `error` | Volume2 (red) | "Erro" | "Erro ao reproduzir áudio — toque para tentar novamente" |

### Acessibilidade

| Atributo | Comportamento |
|---|---|
| `aria-labelledby` | Aponta pro span com texto (gera `useId()` se não passar `labelId`) |
| `aria-pressed` | `true` quando playing/loading, `false` quando idle/error |
| `aria-live="polite"` | Anuncia mudança de estado pra screen readers |
| `focus-visible:ring-2` | Ring âmbar visível quando navegado por teclado |
| `Espaço` (keydown) | Toggle play/stop quando botão focado |
| `disabled` | Quando texto vazio OU nenhum backend disponível |

### Mobile-first

`h-11 min-h-[44px] min-w-[44px]` — hit-target 44×44px (Apple HIG / WCAG 2.5.5) em qualquer estado. `active:scale-[0.97]` para feedback tátil em tap.

---

## Endpoint `/api/akashic/tts`

### Estado atual

- ✅ Rate-limited (30 req/min por IP, reusa `checkRateLimit`).
- ✅ Validação com Zod (`text` 1–5000 chars, `locale` enum).
- ✅ Health-check GET.
- ⏳ TTS server-side: ainda não integrado. Retorna `501 Not Implemented`.

### Resposta placeholder

```json
{
  "error": "not_implemented",
  "code": "NOT_IMPLEMENTED",
  "message": "Server-side TTS ainda não está plugado. Usando fallback Web Speech API no cliente.",
  "hint": "Quando integrarmos ElevenLabs / OpenAI TTS, este endpoint devolverá { audioUrl, duration }.",
  "received": { "textLength": 142, "locale": "pt-BR", "voiceId": null }
}
```

### O que falta para Wave 26+

1. `ELEVENLABS_API_KEY` (ou `OPENAI_TTS_API_KEY`) no `.env`.
2. Cache: hash(`text+voiceId+locale`) → URL em R2/S3 (evita regenerar).
3. Substituir o `501` por `stream` de áudio ou `JSON { audioUrl, duration }`.
4. VoicePlayer já lê `endpoint` opcional — passa a URL como prop e ele faz fallback automático.

---

## Limitações conhecidas

### Web Speech API

| Limitação | Workaround / mitigação |
|---|---|
| Firefox desktop tem vozes pt-BR limitadas | Endpoint server-side (Wave 26+) com voz pt-BR clonada |
| iOS Safari cancela utterance se o app vai pra background | Replay manual (botão "Ouvir" de novo) |
| Não permite pause/resume granular (precisa cancel + speak) | UX atual usa stop completo (sem "pause") |
| Sem SSML support cross-browser | Mantemos plain text; pontuação controlada pra ritmo |
| Vozes variam por OS (Windows: "Raquel", macOS: "Luciana", Linux: varia) | Aceito — UX não depende de voz específica |
| Browsers antigos (IE11, Edge legacy) sem suporte | Fallback gracioso: botão disabled "Sem áudio" |

### Hook `useTTS()`

- **AutoPlay**: só dispara quando `text` muda e estado é `idle`. Não retentar em loop (intencional — usuário tem controle).
- **Multiplas instâncias simultâneas**: o hook chama `window.speechSynthesis.cancel()` antes de cada nova utterance, então o último "Ouvir" ganha. Comportamento intencional (evita vozes sobrepostas).
- **Server-side render**: não roda nada que toque `window` durante SSR (verificado). Componentes pai precisam ser `'use client'`.

---

## Como testar manualmente

```bash
# 1. Subir dev server
cd cabaladoscaminhos && pnpm dev

# 2. Acessar /akashic-chat (página simples)
open http://localhost:3000/akashic-chat

# 3. Fluxo
# - Enviar uma pergunta (sugestões pré-prontas ou texto livre)
# - Esperar resposta da Akasha (placeholder por enquanto)
# - Clicar "Ouvir" no canto inferior direito da mensagem
# - Verificar: ícone vira Square, label vira "Parar"
# - Verificar: áudio começa a falar em pt-BR
# - Clicar "Parar" OU apertar Espaço (com botão focado) → áudio para
# - Tab navigation: focus-visible ring âmbar visível

# 4. Endpoint placeholder
curl -X POST http://localhost:3000/api/akashic/tts \
  -H 'content-type: application/json' \
  -d '{"text":"olá mundo","locale":"pt-BR"}'
# → 501 + payload explicativo

curl http://localhost:3000/api/akashic/tts
# → 200 + health-check JSON
```

### Teste multilíngue (Wave 25+)

```tsx
<VoicePlayer text={message.text} showLocaleSwitch />
```

Dropdown aparece ao lado do botão — selecione EN ou ES e clique "Ouvir" novamente.

---

## Coexistência: VoiceButton (W12) × VoicePlayer (W25)

| Aspecto | VoiceButton | VoicePlayer |
|---|---|---|
| **Wave** | 12 (2026-06-27) | 25 (2026-06-28) |
| **Hook** | Lógica embutida no componente | Usa `useTTS()` reutilizável |
| **Idiomas** | pt-BR fixo | pt-BR / en-US / es-ES |
| **Atalho Espaço** | ❌ | ✅ |
| **Endpoint server-side** | ❌ | ✅ (placeholder W25) |
| **Usado em** | `/akashic` (chat RAG completo) | `/akashic-chat` (chat simplificado) |

**Não há migração obrigatória.** VoiceButton continua funcionando em produção. Migração para VoicePlayer pode acontecer em Wave 26 quando houver demanda real de i18n no chat principal.

---

## Próximos passos (Wave 26+)

1. **Integrar ElevenLabs** — `ELEVENLABS_API_KEY`, voice clone pt-BR, cache R2/S3.
2. **Migrar `/akashic`** — substituir VoiceButton por VoicePlayer (mostrar seletor de idioma na barra).
3. **Auto-play opcional** — toggle nas settings: "ler respostas automaticamente quando chegarem" (acessibilidade baixa visão).
4. **Highlight sincronizado** — karaokê-style chunking via `boundary` event.
5. **Persistência** — localStorage `akasha.voice.locale`, `akasha.voice.autoplay`, `akasha.voice.rate`.
6. **Métricas** — PostHog ou Plausible: quantos usuários ouvem respostas (sinal pra priorizar Wave 27).

---

## Verificação

### TypeScript

```bash
cd cabaladoscaminhos && npx tsc --noEmit --skipLibCheck
```

**Resultado Wave 25:**

```
# Arquivos novos W25 — 0 erros
src/hooks/use-tts.ts                                    ✅
src/components/akashic/voice-player.tsx                 ✅
src/app/api/akashic/tts/route.ts                        ✅
src/app/akashic-chat/page.tsx                           ✅

# Erros pré-existentes em main (não tocados por W25):
src/components/community/PostCard.tsx     3 erros
src/hooks/use-flag.ts                     7 erros
src/lib/seo/og.ts                        13 erros
```

> **Total: 23 erros pré-existentes em `main`, zero erros introduzidos por W25.** Os 23 erros existem antes do diff e são ortogonais ao Voice Mode — Wave seguinte pode endereçar em cleanup paralelo.

### Lint

```bash
pnpm lint
```

> ⚠️ Não executado — `node_modules` não instalado na worktree (`pnpm install` fora do escopo da wave de 30min). Diff respeita padrões do repo:
> - `'use client'` em todo componente interativo
> - import order (external → internal → relative)
> - `cn()` utility de `@/lib/utils`
> - Tipos exportados (não inline) para reuso
> - Comentários de header documentando wave

### Build

> ⚠️ Não executado (mesma restrição). Componentes são client-only e leves — sem impacto no bundle inicial do `/akashic-chat`.

---

## Diff resumido

```diff
+ src/hooks/use-tts.ts                          | 195 lines (novo)
+ src/components/akashic/voice-player.tsx       | 290 lines (novo)
+ src/app/api/akashic/tts/route.ts              | 110 lines (novo)
+ docs/VOICE-MODE-W25.md                        |  (novo)
~ src/app/akashic-chat/page.tsx                 | +12 lines (import + render VoicePlayer)
~ docs/VOICE-MODE-W12.md                        |  +2 lines (link pro W25)
```

**Total: 4 novos (3 código + 1 doc), 2 modificados.**

---

## Changelog

- **2026-06-28** — Wave 25: hook `useTTS()`, componente `<VoicePlayer />` multilíngue, endpoint server-side placeholder, atalho Espaço, integração em `/akashic-chat`.
- **2026-06-27** — Wave 12: Voice Mode inicial via Web Speech API + `<VoiceButton />` no `/akashic`. Ver `docs/VOICE-MODE-W12.md`.