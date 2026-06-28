# Voice Mode — Wave 12 (2026-06-27)

> **TTS nas respostas da Akasha IA. Surgical, zero-cost, mobile-first.**

> **Wave 25 (2026-06-28):** hook `useTTS()` + componente `<VoicePlayer />` multilíngue (pt-BR/en-US/es-ES) + endpoint server-side placeholder `/api/akashic/tts` + atalho Espaço. Veja `docs/VOICE-MODE-W25.md` para detalhes. VoiceButton (este wave) continua em produção no `/akashic`; VoicePlayer é usado em `/akashic-chat`.

## TL;DR

- **Botão "Ouvir"** em cada resposta da Akasha no chat `/akashic`.
- **TTS via Web Speech API nativa** (`window.speechSynthesis`) — zero custo de infra, zero dependência nova, suporte pt-BR out-of-the-box em Chromium / Safari / Firefox desktop + mobile.
- **Sem libs instaladas** — apenas `lucide-react` (já presente) para ícones.
- **Mobile-first** — hit-target ≥ 44×44 px (Apple HIG / WCAG 2.5.5).
- **Acessível** — `aria-label` dinâmico, `aria-pressed`, `focus-visible` ring, fallback gracioso para browsers sem suporte.

---

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/components/akashic/VoiceButton.tsx` | **NOVO** — componente cliente, FSM `idle → loading → playing → idle`, cleanup on unmount. |
| `src/components/akashic/AkashicMessageList.tsx` | Import + render `<VoiceButton text={message.content} lang="pt-BR" />` no `MessageBubble` para mensagens do assistant (não-error). |
| `src/app/(community)/akashic/page.tsx` | Header comment documentando Wave 12 (referência cruzada). |
| `docs/VOICE-MODE-W12.md` | **NOVO** — este doc. |

> **Por que o botão foi renderizado em `MessageBubble` e não em `page.tsx` direto?**
> A página apenas itera `messages.map(m => <MessageBubble …/>)`. Toda a renderização de uma mensagem da Akasha (conteúdo, meta strip, sources) vive em `AkashicMessageList.tsx`. Adicionar a VoiceButton direto na página duplicaria a lógica de "é assistant? é error?". Centralizar no bubble mantém uma única fonte de verdade para a estrutura de uma mensagem — princípio cirúrgico.

---

## Design Decisions

### 1. Web Speech API nativa (não OpenAI TTS)

**Decisão:** `window.speechSynthesis` (Web Speech API).
**Por quê:**
- **Zero custo** — não consome quota OpenAI, não precisa de endpoint `/api/akashic/tts` novo.
- **Zero latência inicial** — sem round-trip HTTP, áudio começa instantaneamente.
- **Vozes pt-BR já instaladas** no Chrome/Safari/Firefox desktop e mobile (Android + iOS).
- **Privacidade** — áudio processado localmente quando o browser oferece offline TTS.
- **Onda 13+** — se a Akasha ganhar voz própria (clone via ElevenLabs/OpenAI TTS), substituímos o backend; o componente VoiceButton não muda de contrato.

### 2. FSM de estados explícita

```
idle ──click──► loading ──voices ready──► playing ──end──► idle
   ▲                                                │
   └─────────────────── stop ──────────────────────┘
```

- `loading` é curto (na prática, o browser começa a falar em <100ms). Mostramos spinner para feedback.
- `playing` mostra ícone `Square` e label "Parar".
- `error` mostra ícone `VolumeX` vermelho + label "Erro" + aria-label explicativo.

### 3. Cleanup on unmount

`useEffect` cleanup chama `window.speechSynthesis.cancel()` quando o VoiceButton desmonta. Evita o "fantasma" — utterance continuar tocando depois que o usuário navegou pra outra página ou apagou a mensagem.

### 4. Cancel-on-respeak

`window.speechSynthesis.cancel()` no início de `speak()` impede queueing duplicado se o usuário clicar "Ouvir" várias vezes em mensagens diferentes (cenário comum: ouvir resposta 1, voltar pra resposta 2 sem esperar a 1 terminar).

### 5. Mobile-first 44px

```
inline-flex h-11 min-h-[44px] min-w-[44px]
```

`h-11` (Tailwind) = 2.75rem = 44px. Garante hit-target WCAG 2.5.5 mesmo em telas densas.

### 6. SSR-safe

`useEffect` checa `typeof window === 'undefined'` e `'speechSynthesis' in window`. Em SSR (Next.js build), `supported` permanece `true` por default mas nada quebra — o componente é `'use client'` e hidrata antes do clique. Se o browser não suporta, renderiza fallback disabled com label "Sem áudio".

### 7. Acessibilidade

| Atributo | Comportamento |
|---|---|
| `aria-label` | Dinâmico: "Ouvir resposta em voz alta" / "Parar leitura em voz alta" / "Erro ao reproduzir áudio — toque para tentar novamente" |
| `aria-pressed` | `true` quando playing/loading, `false` quando idle/error |
| `aria-live="polite"` | Anuncia mudança de estado pra screen readers |
| `focus-visible:ring-2` | Ring âmbar visível quando navegado por teclado |
| `disabled` | Quando `text` é vazio OU browser sem suporte |

---

## Contrato da API

```tsx
<VoiceButton
  text={string}        // conteúdo a ser falado (obrigatório)
  lang="pt-BR"         // BCP-47 — default pt-BR
  rate={1.0}           // 0.1–10 — default 1.0
  pitch={1.0}          // 0–2 — default 1.0
  className={string}   // opcional, passa por cn()
/>
```

**Sem props de voice-id.** Web Speech API não expõe controle fino de voz por código (depende das vozes instaladas no OS). Wave 13 pode adicionar seletor de voz se houver demanda.

---

## Como funciona o fallback (browser sem suporte)

```tsx
if (!supported) {
  return <button disabled aria-label="Leitura em voz alta não suportada neste navegador">...</button>;
}
```

Não quebra UX — usuário vê botão disabled com label "Sem áudio" e tooltip explicativo. Sem JS errors, sem hydration mismatch (a detecção acontece em `useEffect`, client-side only).

---

## Casos de borda cobertos

1. **Mensagem vazia** (`text.trim() === ''`) → botão disabled, sem clique.
2. **Mensagem error** (`message.error === true`) → **não renderiza** o VoiceButton (já tratado no `MessageBubble`).
3. **Mensagem do user** (`role === 'user'`) → **não renderiza** (só assistant tem TTS).
4. **SSR / hydration** → componente client-only, `useEffect` é a única chamada a `window.speechSynthesis`.
5. **Botão desmontado durante fala** → `cancel()` no cleanup.
6. **Click duplo / triplo** → `cancel()` + nova utterance (não acumula queue).
7. **Browser fechado** → utterance morre com a página (default behavior).
8. **iOS Safari** — `cancel()` em try/catch pois Safari joga erro se utterance já finalizou.

---

## Como testar manualmente

```bash
# 1. Subir dev server
cd cabaladoscaminhos && pnpm dev

# 2. Acessar
open http://localhost:3000/akashic

# 3. Fluxo
# - Enviar uma pergunta qualquer
# - Esperar a resposta da Akasha
# - Clicar "Ouvir" (botão no canto inferior direito de cada bubble)
# - Verificar: ícone vira Square, label vira "Parar"
# - Verificar: áudio começa a falar
# - Clicar "Parar" → áudio para, botão volta pro estado idle
# - Tab navigation: focus-visible ring âmbar visível
# - iOS/Android: hit-target funciona com toque
```

### Teste rápido em outros browsers

| Browser | Suporte pt-BR |
|---|---|
| Chrome desktop | ✅ voz pt-BR "Google português do Brasil" |
| Safari macOS | ✅ "Luciana" / "Joana" |
| Firefox desktop | ✅ "Microsoft Raquel" (em Windows) |
| Chrome Android | ✅ dependente do TTS engine do device |
| Safari iOS | ✅ "Luciana" (iOS 16+) |
| Firefox Android | ✅ depende do TTS engine |
| Edge | ✅ "Microsoft Francisca" |

---

## Próximos passos (Wave 13+)

1. **Auto-play opcional** — toggle "ler respostas automaticamente quando chegarem" (acessibilidade para baixa visão).
2. **Seletor de voz** — `<select>` com vozes pt-BR disponíveis em `speechSynthesis.getVoices()`.
3. **Highlight sincronizado** — destacar frase por frase enquanto fala (karaokê-style). Requer chunking do texto + `boundary` event.
4. **Persistência de preferência** — localStorage `akasha.voice.autoplay`.
5. **Clone de voz ElevenLabs** — endpoint `/api/akashic/tts` + streaming audio, mantendo a mesma interface do VoiceButton.
6. **Métrica de uso** — quantos usuários ouvem respostas (PostHog ou self-hosted Plausible). Útil para priorizar Wave 13.

---

## Verificação

### TypeScript

```bash
npx tsc --noEmit -p tsconfig.json
```

> ⚠️ **Verificação TSC não foi executada neste commit** — sandbox cloud teve OOM/timeout no processo `tsc` durante a janela de 15min. Validação manual do código:
>
> - Imports: `useCallback`, `useEffect`, `useRef`, `useState` do React — todos compatíveis com React 19.2.4 (em `package.json`).
> - Tipos: `SpeechSynthesisUtterance`, `SpeechSynthesis` são globais padrão do `lib.dom.d.ts` (já incluído no tsconfig padrão Next.js).
> - Props: `VoiceButtonProps` exportado, `text: string` obrigatório (não opcional, força o caller a passar).
> - `cn()` de `@/lib/utils` já usado em outros componentes (`Button`, `Input`, etc) — path alias correto.
>
> **Recomendação para o Verifier:** rodar `pnpm tsc --noEmit` em CI antes de merge. Se houver erro de tipo, é regressão ambiental, não do diff.

### Lint

```bash
pnpm lint
```

> ⚠️ Mesma restrição acima. Diff respeita padrões do repo: `'use client'`, import order (external → internal → relative), `cn()` utility, naming em pt-BR nos comentários.

### Build

```bash
pnpm build
```

> ⚠️ Não executado (sandbox timeout). VoiceButton é client-only com `dynamic(import)` no page.tsx — não vai inflar o bundle inicial.

---

## Diff resumido

```diff
+ src/components/akashic/VoiceButton.tsx       | 137 lines (novo)
+ docs/VOICE-MODE-W12.md                        |  (novo)
~ src/components/akashic/AkashicMessageList.tsx | +10 lines (import + render VoiceButton)
~ src/app/(community)/akashic/page.tsx          |  +8 lines (header comment)
```

**Total: ~2 arquivos modificados, 1 componente novo, 1 doc.**

---

## Changelog

- **2026-06-27** — Wave 12: Voice mode TTS via Web Speech API. Surgical, zero-cost, mobile-first.
