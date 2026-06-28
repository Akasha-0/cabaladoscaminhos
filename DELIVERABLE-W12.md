# DELIVERABLE — Wave 12: Voice Mode TTS

**Task:** Adicionar voice mode (TTS) ao Akasha chat — botão "Ouvir" por mensagem, Web Speech API nativa, mobile-first, acessível.
**Time budget:** 15 min (surgical).
**Status:** ⚠️ **PARTIALLY DELIVERED — env constraints blocked TSC + git commit, all artifacts created and inspectable.**

---

## ✅ DELIVERED (inspecionáveis no workspace)

| # | Artefato | Status | Localização |
|---|---|---|---|
| 1 | Componente VoiceButton | ✅ Criado | `src/components/akashic/VoiceButton.tsx` (137 lines) |
| 2 | Integração no MessageBubble | ✅ Modificado | `src/components/akashic/AkashicMessageList.tsx` (+10 lines) |
| 3 | Header comment em page.tsx | ✅ Modificado | `src/app/(community)/akashic/page.tsx` (+8 lines) |
| 4 | Docs Wave 12 | ✅ Criado | `docs/VOICE-MODE-W12.md` |
| 5 | Deliverable report | ✅ Criado | `DELIVERABLE-W12.md` (este arquivo) |

**Todos os arquivos foram criados/modificados via Write/Edit tool e estão prontos para inspeção e commit manual.**

---

## ❌ BLOCKED (env constraints — não foi possível executar)

| # | Operação | Razão |
|---|---|---|
| 1 | `git add` + `git commit` | Sandbox shell degradado — todos os comandos bash timeout > 10s, incluindo `git status`, `git add`, `ls`. Sessão bash não responde desde 15:36 UTC. |
| 2 | `npx tsc --noEmit` | Mesmo motivo acima — `tsc` excedeu timeout de 150s. |
| 3 | `pnpm lint` | Mesmo motivo. |
| 4 | `pnpm build` | Mesmo motivo. |

### Investigation trail

- 15:34 UTC — task iniciada, ambiente shell responsivo.
- 15:35 UTC — `read` tool funcionou para `openai.ts`, `page.tsx`, `AkashicMessageList.tsx`, `package.json`. Contexto carregado.
- 15:35 UTC — Write de `VoiceButton.tsx` ✅.
- 15:35 UTC — Edit de `AkashicMessageList.tsx` ✅.
- 15:35 UTC — Edit de `page.tsx` ✅.
- 15:35 UTC — Write de `docs/VOICE-MODE-W12.md` ✅.
- 15:36 UTC — primeira tentativa de `git status --short`: timeout 60s.
- 15:36 UTC — todas as tentativas subsequentes (git, tsc, ls, date, echo) timeout 5-30s.
- 15:36+ UTC — shell efetivamente morto. Apenas `read`/`write` tools continuam funcionais.

### Razão raiz

Sandbox cloud em estado degradado — processos bash travam em chamadas simples (`ls`, `date`, `echo ping3` respondeu uma vez, depois nunca mais). Não é bug do código entregue, é falha de runtime.

---

## 📋 COMO O VERIFIER DEVE PROCEDER

### 1. Inspecionar arquivos (read tool funciona)

```bash
# Estes reads funcionam normalmente:
cat src/components/akashic/VoiceButton.tsx
cat src/components/akashic/AkashicMessageList.tsx
cat src/app/(community)/akashic/page.tsx
cat docs/VOICE-MODE-W12.md
```

### 2. Verificar tipos (depois que shell voltar)

```bash
cd /workspace/cabaladoscaminhos
npx tsc --noEmit -p tsconfig.json
# Esperado: 0 errors. Tipos usados são React 19 + lib.dom.d.ts padrão.
```

### 3. Lint

```bash
pnpm lint
# Esperado: 0 warnings (diff respeita padrões do repo).
```

### 4. Commit (Conventional Commits)

```bash
cd /workspace/cabaladoscaminhos
git add \
  src/components/akashic/VoiceButton.tsx \
  src/components/akashic/AkashicMessageList.tsx \
  "src/app/(community)/akashic/page.tsx" \
  docs/VOICE-MODE-W12.md \
  DELIVERABLE-W12.md

git commit -m "feat(akashic): voice mode TTS nas respostas

- Novo componente VoiceButton (Web Speech API, zero-cost, pt-BR)
- Renderizado em MessageBubble para cada resposta do assistant
- FSM idle → loading → playing → error, cleanup on unmount
- Mobile-first 44px hit-target, aria-label dinamico, focus-visible ring
- Docs em docs/VOICE-MODE-W12.md

Wave 12 — surgical, sem libs novas, sem custo de infra."

git push origin main
```

### 5. Smoke test manual

```bash
pnpm dev
# Open http://localhost:3000/akashic
# Send any question → wait for reply → click "Ouvir" button (bottom-right of bubble)
# Verify: audio plays in pt-BR, button changes to "Parar" with square icon
# Verify: focus-visible ring (Tab key), hit-target on mobile (touch)
```

---

## 🔍 CHECKLIST

- [x] Botão "Ouvir" em cada mensagem da IA
- [x] Ao clicar, chama TTS com texto da resposta (Web Speech API)
- [x] Reproduz com Web Speech API nativa (zero cost)
- [x] Estado: idle / loading / playing / error
- [x] Botão "Parar" durante playing
- [x] Mobile-first: hit-target ≥ 44px (`h-11 min-h-[44px]`)
- [x] Acessível: aria-label dinâmico, aria-pressed, focus-visible ring, aria-live
- [x] Sem libs novas instaladas
- [x] SSR-safe (useEffect para detectar suporte)
- [x] Cleanup on unmount (cancel utterance)
- [x] Não renderiza em mensagens de user ou error
- [x] Fallback gracioso para browsers sem suporte (`disabled` + "Sem áudio")
- [x] Cancel-on-respeak (evita queue duplicado)
- [x] Componente isolado em arquivo próprio
- [x] Tipos exportados (`VoiceButtonProps`)
- [x] Docs operacionais (como rodar, testar, próximos passos)
- [x] Conventional Commits message pronta
- [ ] **TSC: BLOCKED** (env) — verificar em CI
- [ ] **LINT: BLOCKED** (env) — verificar em CI
- [ ] **BUILD: BLOCKED** (env) — verificar em CI
- [ ] **COMMIT: BLOCKED** (env) — instruções prontas acima
- [ ] **PUSH: BLOCKED** (env) — após commit local

---

## 💡 DECISÕES-CHAVE

1. **Web Speech API nativa** sobre OpenAI TTS — zero custo, zero latência inicial, zero libs. Onda 13 pode adicionar endpoint TTS próprio mantendo o contrato do VoiceButton.
2. **Renderizar no MessageBubble** (não em page.tsx direto) — page.tsx apenas itera `<MessageBubble/>`; toda estrutura da mensagem vive no bubble. Centralizar evita duplicar a lógica "é assistant? é error?".
3. **FSM explícita** com 4 estados — torna o código previsível, testável, e cada estado tem um ícone + label claro.
4. **Cleanup on unmount** — evita "fantasma" da utterance continuando após navegação.
5. **Cancel-on-respeak** — UX natural para ouvir múltiplas respostas em sequência.

---

**Fim do deliverable. Próxima ação: verifier roda TSC + lint + build em ambiente saudável, depois aplica o commit conforme bloco acima.**
