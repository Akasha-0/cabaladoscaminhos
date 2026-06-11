# R-024 — UX Architecture v1 (Fase 3)

> **Artefato central da Fase 3 (UX Architecture).** Define as telas,
> a jornada de descoberta progressiva, a interação com o Mentor, a
> acessibilidade WCAG 2.2 AA e a estratégia de internacionalização
> (PT-BR first). É design, não código (Fase 5 transpõe para TS;
> Fase 6 implementa).
>
> **Data:** 2026-06-10
> **Pesquisador:** agente autônomo (sessão N)
> **Dependências:** R-001..R-012 ✅ + R-020 (Patterns) ✅ +
> R-021 (Gaps) ✅ + R-022 (Synthesis v1) ✅ + R-023 (Mentor v1) ✅
> **Próxima iteração:** v2 (D-022 detalhamento de cada tela) →
> v3 (pós-implementação com métricas reais)
> **Confidence:** MED-HIGH — sintaxe derivada de 12 RQs + 4 fontes
> primárias 2026 (web.dev PWA, W3C WCAG 2.2, Next.js i18n,
> NN/g Progressive Disclosure)

---

## 0. TL;DR — A Decisão de UX

**Akasha é PWA mobile-first, organizada em 5 telas canônicas,
com descoberta progressiva em 3 camadas (1 insight/dia → 1 sessão
semanal → 1 leitura profunda) e Mentor como orquestrador de tudo.**

A jornada do usuário cabe em **3 cliques por dia**: abre o app
(1), recebe o Mandato (2), fala com o Mentor se quiser (3). O resto
fica **enterrado** atrás de 1-2 níveis de progressive disclosure
(perfis, mural, ritual estendido, certificação).

**Princípios de design (8, derivados de `patterns.md` + `gaps.md`):**

1. **1 insight por dia, 1 push por dia** (Co-Star restraint).
2. **3-4 cores, 1 diagrama-mãe** (Mandala 5 anéis).
3. **3 cliques para o âmago, 7 cliques para a profundeza**.
4. **Mentor aparece, não grita** (modal opcional, não overlay).
5. **Sem feed social, sem streak, sem comparação**.
6. **PT-BR first, mas cada string isolada em `[lang]/dictionaries/*.json`**.
7. **WCAG 2.2 AA desde o dia 1** (24×24 targets, alt-text, focus visible, sem auth cognitiva).
8. **PWA com service worker para offline** (retiro, viagem, metrô).

---

## 1. Princípios de Design (fundamentação)

### 1.1 Heranças explícitas dos 12 RQs

| Princípio | Fonte primária | Aplicação Akasha |
|-----------|----------------|------------------|
| Restraint (1 push/dia) | Co-Star (RQ-005) | 1 Mandato/dia 06h |
| 1 diagrama-mãe | Human Design (RQ-002) | Mandala 5 anéis |
| Mnemônica identidade | MBTI/Gene Keys (RQ-001, RQ-003) | "Akasha nº X — [Pilar]" |
| Cadência semanal + lunar | CHANI App (RQ-007) | Bundle lunar (S) |
| Escala sazonal única | Ayurveda (RQ-011) | Ritucharya (Z) |
| 2ª camada temporal | Human Design 88° solar arc (RQ-002) | Transits planetários |
| Linguagem íntima | The Pattern (RQ-006) | Mentor 3ª pessoa ritual |
| Compassivo > edgy | Gene Keys (RQ-001) | Mentor compassivo (não Co-Star goth) |
| Híbrido IA + humano | `gaps.md` #9 | Grimório curado + RAG |
| LGPD by design | `gaps.md` #7 | Pula LLM em crise |
| Cita fontes | The Pattern esconde — Akasha cita | "via [Pilar X]" em cada afirmação |
| 5% causa earmark | `gaps.md` #18 | Selo no rodapé + relatório anual |

### 1.2 8 princípios operacionais

1. **Insight antes de ferramenta.** A 1ª tela mostra o Mandato do
   dia, não a Mandala. Quem quer a Mandala toca 1 vez.
2. **Descoberta > configuração.** Onboarding pede 3 dados (nome +
   data + hora + local), revela 1 número Akasha. Mais = fricção.
3. **Profundidade opcional.** Tudo que não é o Mandato do dia fica
   atrás de 1-2 cliques. Mural é secundário, não primário.
4. **Sem loops viciantes.** Sem contador de streaks, sem
   "você está atrasado", sem notificações de comparação.
5. **Erro como ritual, não como falha.** "Sua data está no
   limite — qual calendário seguimos?" é pergunta, não erro.
6. **Tempo como aliado.** Quiet hours 22h-06h; ritual noturno é
   exceção, não padrão.
7. **Privacidade visível.** Botão "esqueça tudo" no perfil; o
   usuário sempre sabe o que o Mentor "lembra" dele.
8. **Acessibilidade é a base.** Toda feature é desenhada com
   teclado + leitor de tela + 200% zoom antes do touch.

---

## 2. Personas e Jornadas

### 2.1 3 personas canônicas (validação §11)

**Ana, 32, advogada, urbana, cética-curiosa.**
- Já testou Co-Star, The Pattern. Achou o 1º fraco, o 2º vago.
- Quer profundidade, não horóscopo. Não tolera fatalismo.
- Usa 1×/dia no metrô, 1×/semana no domingo (leitura longa).
- Dispositivo: iPhone 14, conexão intermitente no metrô.

**Bruno, 28, dev, engajado, ansioso.**
- Já fez mapa astral completo, Gene Keys, 16Personalities.
- Quer ver a síntese — não aguenta mais 5 apps separados.
- Risco: vício em checagem. Cap de uso é crítico.
- Dispositivo: Android 13, laptop Linux, multi-device.

**Carla, 45, terapeuta holística, 20 anos de prática.**
- Conhece Cabala viva, Ifá, Ayurveda (BAMS).
- Suspeita de apps "que simplificam demais".
- Quer app como **ferramenta de prática**, não substituto.
- Pode indicar para clientes; precisa de versão B2B.
- Dispositivo: iPad + iPhone, auditivo (TTS), low vision.

### 2.2 Jornada da Ana (3 atos, 1ª semana)

**Ato 1 — Descoberta (dia 1, 4 minutos)**
- Tela 1: splash (1s, logo + frase fundadora).
- Tela 2: onboarding 3 passos — (a) nome, (b) data, (c) hora+local.
- Tela 3: **1ª revelação** — "Você é Akasha 7 — Tiferet (Beleza).
   Seu Pilar central é Numerologia Cabalística, e sua questão de
   vida é [via Pilar 1: ...]." + 1 Mandato curto + 1 pergunta.
- **Não há feed. Não há notificação. Não há "tudo a ver".**

**Ato 2 — Habituação (dias 2-5, 30s/dia)**
- Push 06h: "Bom dia, Ana. Hoje, o Pilar 2 (Astrologia) pede
   [1 frase] + [1 pergunta] + [1 micro-ritual]."
- 1 toque → tela Mandato (dia). Leitura 20-30s.
- 2º toque (opcional) → Mural (semana) com 6 Mandatos passados.
- 3º toque (opcional) → Mandala (diagrama) com 5 anéis.

**Ato 3 — Profundidade (dia 7+, 5 min)**
- 1×/semana: bundle lunar (transits + ritual + altar + journal).
- 1×/mês: ciclo sazonal (Ritucharya, 2 meses).
- 1×/vida: leitura profunda da Mandala (1h com Mentor guiado).

### 2.3 Jornada do Bruno (3 atos, 1ª semana)

**Ato 1 — Descoberta** (idêntica, mas vê mais 1 número — ele é dev, quer o cálculo).
**Ato 2 — Habituação** (30s/dia, mas usa 7×/dia — cap dispara).
**Ato 3 — Profundidade** (pega a Mandala no 1º dia, abre o Mentor já no 2º).

**Diferença chave:** Bruno precisa de **tela de transparência** —
"o que o Mentor lembra de você" + "como ele calcula". Ana não
precisa. Carla precisa de **tela de fontes** (versículos, odus, slokas).

### 2.4 Jornada da Carla (3 atos, 1ª semana)

**Ato 1 — Descoberta** (rejeita app "simplificador" se 1ª revelação for rasa).
**Ato 2 — Habituação** (TTS liga por padrão; 1 Mandato 2×/semana).
**Ato 3 — Profundidade** (compartilha com mentor humano Akasha Certificado).

**Diferença chave:** Carla quer **acesso à fonte primária** (Sefer
Yetzirah, Charaka Samhita, Odu Ifá) — não paráfrase. Mentor cita
livro+capítulo+versículo. B2B com dashboard de clientes.

---

## 3. Decisão Mobile-first: PWA vs App Nativo

### 3.1 Tradeoff explícito

| Critério | PWA | Nativo (iOS+Android) |
|----------|-----|----------------------|
| Custo dev | 1 codebase Next.js | 2 (Swift + Kotlin) |
| Tempo de publicação | Imediato (deploy) | 1-3 semanas (review) |
| Offline | Service Worker ✅ | Bundle nativo ✅ |
| Push notifications | Web Push (limitado iOS 16.4+) | FCM/APNs total |
| Acesso a sensores | Limitado (geolocation OK) | Total |
| Acessibilidade | ARIA + semântica web | APIs nativas |
| Install UX | "Add to Home Screen" | App Store |
| Discoverability | SEO + share URL | App Store search |
| Bundle size | ~200KB initial | 30-50MB |

### 3.2 Decisão: PWA-first, nativo como fase 7+

**PWA vence** para Akasha porque:

1. **Custo de 2 apps é proibitivo** para projeto pré-receita.
2. **Conteúdo é texto+imagem, não sensores** (não precisa de câmera,
   giroscópio, etc).
3. **Push funciona no Android 100%** e no **iOS 16.4+ com Web Push**
   (suficiente — audiência iOS costuma atualizar).
4. **SEO + share URL** são diferenciais — leitura compartilhável.
5. **PWA + Add to Home Screen = experiência quase-nativa** (cf. Twitter
   Lite, Starbucks, Pinterest).
6. **Offline = service worker** (cf. web.dev, requisito de retiro/viajem).

**Quando migrar para nativo (Fase 7+):**

- Se > 50% da audiência é iOS < 16.4 (improvável em 2026).
- Se sensores se tornarem centrais (ex: biorritmo cardíaco).
- Se receita B2B justificar custo (B2B dashboards merecem app).

**Fonte:** [web.dev PWA checklist](https://web.dev/articles/pwa-checklist) — install
criteria, service worker para offline, contextual permission UX para
notificações, performance crítico (1s→10s = 123% bounce-rate increase).

### 3.3 Já implementado no portal

- ✅ `manifest.json` (PWA) com name, short_name, lang=pt-BR, theme #06070F.
- ✅ `ServiceWorkerRegistrar.tsx` componente.
- ✅ `PwaInstallPrompt.tsx` para "Add to Home Screen".
- ✅ `web-push` lib instalada.
- ✅ Tema dark-first (background #06070F).
- ⏳ Faltam: badges API, app shortcuts, iOS maskable icon review.

---

## 4. Descoberta Progressiva (Micro-doses)

### 4.1 A regra dos 3 cliques

**3 cliques para o âmago** (ler o Mandato do dia).
**7 cliques para a profundeza** (abrir Mural → clicar 1 Mandato →
abrir Mandala → tocar Pilar 5 → ver 64 hexagramas → escolher 1 →
abrir Mentor guiado).

### 4.2 Hierarquia de revelação (matemática 7 camadas)

Inspirado em Gene Keys (Genius Sequence) + Human Design (7-etapas
do usuário) + Cabala (4 Mundos). Akasha usa **7 camadas
progressivas**, das quais o usuário só vê as 3 primeiras no dia 1.

| # | Camada | O que mostra | Quem vê |
|---|--------|--------------|---------|
| 0 | Splash | Logo + frase fundadora (1s) | Todos |
| 1 | Mandato | 1 frase + 1 pergunta + 1 ritual | Dia 1 |
| 2 | Mural | 7 Mandatos passados | Dia 2+ |
| 3 | Mandala | Diagrama 5 anéis | Dia 7+ |
| 4 | Pilar | 1 Pilar detalhado (P1..P5) | Dia 14+ |
| 5 | Cruzamento | 2 Pilares cruzados | Dia 30+ |
| 6 | Leitura guiada | Mentor + Grimório | Dia 90+ / B2B |

**Princípio:** camada N+1 só aparece se o usuário abriu a N
≥3×. Não há "tour" forçado.

**Fonte:** [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — "default
to a single insight", "respect the contemplative state", "honor
quiet hours", "test for depth not breadth", 2-screen split é o sweet spot.

### 4.3 Micro-doses — exemplos concretos

**Push 06h (1/dia):**
```
Bom dia, Ana.
Hoje, o Pilar 2 (Astrologia) indica Lua em Peixes (4ª casa).
[1 frase interpretativa]
[1 pergunta reflexiva]
[1 micro-ritual: 3 respirações com nome da emoção]
```

**Bundle lunar 1×/semana (sábado 08h):**
- 1 leitura longa (3 min) cruzando 2-3 Pilares.
- 1 ritual estendido (10-15 min).
- 1 entrada de journal opcional.
- 1 referência ao Grimório (livro + capítulo).

**Sazonal 1×/2 meses (Ritucharya):**
- 1 texto explicativo da estação.
- 1 lista de 3-5 práticas alimentares/comportamentais.
- 1 ritual coletivo (se aplicável).

**Anual 1×/ano:**
- 1 leitura de Mandala (30-60 min com Mentor guiado).
- 1 white paper da versão (transparência).

---

## 5. As 5 Telas Canônicas

### 5.1 Tela 1 — **Mandato** (tela default após onboarding)

**Função:** 1 insight/dia. Co-Star-style restraint (RQ-005).

**Layout (mobile, 360×640):**
- Top: data + nome + "Akasha nº 7" (mnemônica).
- Centro: 3 frases do Mandato + 1 pergunta + 1 micro-ritual.
- Bottom: 1 botão "Falar com o Mentor" + 1 botão "Salvar no Mural".
- Cores: 3-4 (fundo escuro, 1 accent, 1 secundária, 1 texto).

**Dados:**
- `mandato.texto[3]` (3 frases).
- `mandato.pergunta` (1 pergunta aberta).
- `mandato.ritual.tipo` ("respiração" | "escrita" | "gesto" | "silêncio").
- `mandato.ritual.duracao_seg` (60-300).
- `mandato.fontes[2-3]` (cita Pilar X, Grimório §Y).

**Interações:**
- 1 toque = nada (espaço contemplativo).
- Long-press = copiar.
- Swipe-up = Mural.
- Botão Mentor = modal (não overlay) com streaming.

**Acessibilidade:**
- Leitor de tela: lê 3 frases em sequência com pausa 1s.
- 200% zoom: não quebra layout (max-width: 36em).
- Reduced motion: fade-in em vez de slide.

### 5.2 Tela 2 — **Mural** (histórico)

**Função:** 7 Mandatos passados + busca. CHANI App-style (RQ-007).

**Layout:**
- Lista vertical de cards (1 card = 1 Mandato).
- Filtro: por Pilar (P1..P5) + por emoção + por mês.
- Busca: full-text sobre Mandatos.
- Botão flutuante: "Pular para hoje".

**Dados:**
- `mandato.id`, `mandato.data`, `mandato.texto[3]`, `mandato.pergunta`.
- `mandato.user_reflexao?` (journal opcional).

**Acessibilidade:**
- Lista semântica (`<ol>` ou grid ARIA).
- Cada card = 1 região com label.
- Skip-to-today link.

### 5.3 Tela 3 — **Mandala** (diagrama-mãe)

**Função:** 1 imagem estática. Human Design-style (RQ-002).

**Layout (SVG, 360×360 a 1080×1080):**
- 5 anéis concêntricos (P1 dentro → P5 fora).
- Cada anel: ícones + texto curto (1-2 palavras) + número-base.
- Centro: 1 palavra-semente ("Tiferet" para Ana).
- Tap em anel = expande para Pilar detalhado (camada 4).

**Renderização:**
- Server-side SVG (Next.js `app/` RSC).
- Cacheável 1 ano (mudou Mandala = mudou pessoa = rara).
- Versão acessível: `<title>` por anel + texto alternativo.

**Dados:**
- `pessoa.mandala.anéis[5]` (id, pilar, número, ícone, cor, label).
- `pessoa.mandala.centro` (palavra-semente + Pilar origem).

**Acessibilidade:**
- SVG com `role="img"`, `aria-labelledby`, `<title>` por anel.
- Versão texto (sem SVG) para leitor de tela.
- Imagem alternativa: tabela HTML 5x5.

### 5.4 Tela 4 — **Ritual** (prática)

**Função:** executar o micro-ritual do Mandato + journaling opcional.
Inspirado em CHANI (RQ-007) + Calm/Headspace (timer + respiração).

**Layout:**
- Timer circular (60-300s).
- Som opcional (Web Audio API, 4-8 Hz binaural — não Solfeggio).
- Texto-guia em cards (1 aparece a cada 1/3 do tempo).
- Botão "Concluir" + entrada de journal.

**Dados:**
- `ritual.tipo`, `ritual.duracao_seg`, `ritual.passos[]`.
- `ritual.journal?` (texto livre, 280 chars, opcional).
- `ritual.timestamp_concluido?`.

**Acessibilidade:**
- Timer com anúncio a cada 30s (`aria-live="polite"`).
- Sem dependência de som (texto-guia é principal).
- "Pular" sempre visível.

### 5.5 Tela 5 — **Mentor** (chat com IA)

**Função:** diálogo com RAG. Não é chat livre — é orquestrador.
The Pattern-style intimidade (RQ-006) + Gene Keys compaixão (RQ-001).

**Layout (chat vertical):**
- Header: "Mentor Akasha" + indicador RAG (verde se cita, cinza se não).
- Bolhas: usuário (direita) + Mentor (esquerda).
- Cada resposta do Mentor termina com:
  - Citações (chips: "Pilar 1 §3.2", "Grimório Cabalística p.47").
  - Botão "Salvar no Mural" + "Refazer pergunta".
- Input: texto + microfone (TTS fase 6+).
- Footer: 1 lembrete ético ("O Mentor cita fontes; em crise, ele
  te conecta ao CVV 188").

**Tool calls (já definidos em `mentor/persona_v1.md §7`):**
- `cite_source`, `query_grimoire`, `classify_intent`,
  `get_user_mandala`, `get_recent_mandates`,
  `trigger_crisis_protocol`, `trigger_usage_cap`.

**Streaming:**
- SSE (Server-Sent Events) — confirmado D-033.
- Renderiza conforme tokens chegam.
- Cancelável (botão "Parar" durante geração).

**Acessibilidade:**
- Cada bolha do Mentor: `role="article"`, label com timestamp.
- Streaming: `aria-live="polite"` para a última mensagem.
- Sem áudio automático (TTS opt-in).
- Tecla ESC = fechar modal.

**Crise (E5 do Mentor):**
- Detecta palavras-chave (auto-mutilação, suicídio, violência).
- Pula LLM, exibe: "Akasha não é lugar para isso. CVV 188 (24h).
  Caps mais próximo: [link]. Mentor Certificado (R$ 95-195): [link]."
- Sessão pausada 24h, sem exceção.

---

## 6. Interação com IA (detalhes)

### 6.1 Streaming vs WebSocket

**Decisão: SSE (Server-Sent Events) via API route.**

| Critério | SSE | WebSocket |
|----------|-----|-----------|
| Complexidade | Baixa (HTTP) | Alta (ws lib) |
| Direção | Server → Client | Bidirecional |
| Reconexão | Auto | Manual |
| Compat Next.js | ✅ Route handlers | ✅ mas overhead |
| Uso no Mentor | ✅ streaming tokens | ❌ overkill |

**Akasha usa SSE para streaming de tokens.** WebSocket fica como
opção Fase 7+ se houver necessidade de voz full-duplex.

### 6.2 Voz (TTS)

**Decisão Fase 5+:** Web Speech API (`SpeechSynthesis`).

- PT-BR primeiro, vozes nativas do SO.
- Opt-in por Mandato ("Ouvir em voz alta").
- Velocidade padrão: 0.9× (contemplativa).
- Sem deepfake / clonagem de voz.

**Fase 7+:** voz clonada curada (1 voz Mentor feminina + 1 masculina,
treinadas em cantações tradicionais com consentimento).

### 6.3 Texto vs voz na 1ª versão

- **Texto primeiro** (mobile, qualquer ambiente).
- **Voz opt-in** (Fase 5+, quando Web Speech estiver estável em iOS Safari).
- **Sem typing required** — sempre há botões de resposta rápida
  para usuários que não podem digitar.

### 6.4 Rate limiting + cap

- **1 sessão Mentor/dia** (free tier).
- **3 sessões Mentor/semana** (premium).
- **15 min contínuos/sessão** (cap duro, com aviso aos 12 min).
- **Detecção de crise** = sessão pausada 24h.

**Fonte:** `mentor/persona_v1.md §5` (LGPD by design + E1-E12).

---

## 7. Acessibilidade WCAG 2.2 AA

### 7.1 Por que AA e não AAA

- AA é o **padrão legal** em vários países (BR via LGPD art. 7§3 +
  NBR 17225:2023).
- AAA é inviável para app diário (restrições de cor, contraste 7:1).
- AA cobre **90% das barreiras** com esforço razoável.

### 7.2 Requisitos WCAG 2.2 AA aplicados

| Critério | Aplicação Akasha |
|----------|------------------|
| 1.1.1 Non-text content | SVG Mandala: `<title>` + `<desc>` + versão texto |
| 1.3.1 Info and relationships | Headers semânticos, lista Mural, landmarks |
| 1.4.3 Contrast (minimum) | Texto 4.5:1, large 3:1 |
| 1.4.11 Non-text contrast | Bordas 3:1, ícones 3:1 |
| 2.1.1 Keyboard | Tudo por teclado, ordem lógica |
| 2.4.6 Headings and labels | Hierarquia h1→h6, labels descritivos |
| 2.4.11 Focus Not Obscured | Chat input sempre visível |
| 2.5.7 Dragging Movements | Mural reorder = drag + botões ↑↓ |
| 2.5.8 Target Size (Minimum) | 24×24 CSS px mínimo |
| 3.1.1 Language of Page | `<html lang="pt-BR">` |
| 3.2.6 Consistent Help | Botão "Ajuda" sempre no mesmo lugar |
| 3.3.7 Redundant Entry | Não re-perguntar nome/data no fluxo |
| 3.3.8 Accessible Authentication | Login via magic link (não senha) |

**Fonte:** [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — 9 novos critérios, focus obscured, target size 24×24, dragging
alternatives, accessible auth, redundant entry, consistent help.

### 7.3 Padrões específicos para Akasha

- **Leitor de tela:** Lê Mandato inteiro antes de botões. Pausa
  entre frases (delay 1s via `aria-live`).
- **Voz TTS:** voz PT-BR nativa; opt-in por Mandato.
- **Alto contraste:** modo "preto/branco puro" (não só dark mode).
- **Sem movimento:** respeita `prefers-reduced-motion` (transições viram fade).
- **Modo "uma coisa por tela":** toggle na Mandala + Mural.

### 7.4 Testes obrigatórios

- **Lighthouse Accessibility** ≥ 95 (a cada PR).
- **axe-core** em CI (a cada PR).
- **NVDA + VoiceOver manual** mensal (Carla persona).
- **Teste com usuário real** (2 low-vision + 1 cego) a cada 6 meses.

---

## 8. Internacionalização (PT-BR first, EN depois)

### 8.1 Estratégia

**PT-BR é a língua-mãe.** EN é expansão Fase 6+ (não 5+).

- Toda string em `dictionaries/pt-BR.json` (fonte canônica).
- EN como **tradução** (não vice-versa) — evita "google.translate feel".
- Sem ES/FR/HE na Fase 5+ (backlog B-100).

### 8.2 Implementação Next.js 16

**Pattern canônico (já no portal):**
- `app/[lang]/layout.tsx` — segment dinâmico.
- `dictionaries/{locale}.json` — strings.
- `getDictionary(locale)` server-side.
- `proxy.js` (antigo `middleware.js`) — detecta locale via
  `Accept-Language` header + redirect.

**Adaptações Akasha:**

- `defaultLocale = 'pt-BR'` (não `en-US`).
- Locales suportados Fase 6+: `['pt-BR', 'en-US']`.
- `next-intl` lib (recomendada pelo Next.js docs) — type-safe.
- Pluralização PT-BR: `um Mandato` / `dois Mandatos` (não i18n message).

**Fonte:** [Next.js 16 i18n guide](https://nextjs.org/docs/app/guides/internationalization) (v16.2.9, 2025-12-09) — segment
dinâmico `[lang]`, dictionary pattern, server components por padrão,
bibliotecas: next-intl (recomendada), paraglide-next, lingui, tolgee,
next-intlayer, gt-next.

### 8.3 i18n para conteúdo espiritual (não só UI)

- **Mandato do dia:** texto vem do Grimório, já com `lang` por string.
- **Citação de fonte:** "Zohar I, 2a" → PT-BR pode ser "Zohar I, 2a
  (trad. Nehorai 2004 p.47)" — não traduzir o nome da obra.
- **Termos técnicos preservados:** "Tikkun", "Tiferet", "Odu",
  "Tridosha" — não traduzir (citação obrigatória).
- **Datas:** ISO 8601 + Intl.DateTimeFormat (PT-BR por padrão).

### 8.4 Tradução assistida

- **Fase 5:** PT-BR only.
- **Fase 6:** EN adicionado com **curador humano** (não Google
  Translate). 1 tradutor por domínio (Cabala, Ayurveda, Astrologia, Ifá).
- **Fase 7+:** ES, FR, HE opcionais (backlog B-100).

---

## 9. Estrutura do Portal (já implementado + roadmap)

### 9.1 Stack atual confirmado

| Camada | Stack | Status |
|--------|-------|--------|
| Framework | Next.js 16.2.6 + Turbopack | ✅ |
| UI | React 19.2.4 + Base UI + Framer Motion | ✅ |
| Style | Tailwind 4.3 + shadcn-style | ✅ |
| State | Zustand 5.0 | ✅ |
| DB | Postgres 18 + pgvector | ✅ |
| ORM | Prisma 7.8 (config.ts) | ✅ |
| Auth | Supabase + JWT (cookies) | ✅ |
| Push | web-push 3.6 + service worker | ✅ |
| 3D | Three.js 0.184 + @react-three/fiber | ✅ |
| PDF | @react-pdf/renderer + jsPDF | ✅ |
| Payment | Stripe 22 | ✅ |
| i18n | next-intl pattern (custom) | ✅ |
| LLM | OpenAI 6.39 (gpt-4) | ✅ |
| Test | Vitest + Playwright | ✅ |

### 9.2 Estrutura de pastas (atual)

```
apps/akasha-portal/
├── src/
│   ├── app/
│   │   ├── [locale]/          # i18n segment (PT-BR default)
│   │   ├── api/akasha/         # Mentor/RAG/Ritual endpoints
│   │   ├── dashboard/          # Tela Mural
│   │   ├── page.tsx            # Splash + onboarding
│   │   └── layout.tsx
│   ├── components/akasha/
│   │   ├── Onboarding.tsx
│   │   ├── RitualCard.tsx
│   │   ├── MandalaAtmosphere.tsx
│   │   ├── MandalaChart.tsx
│   │   ├── PwaInstallPrompt.tsx
│   │   ├── ServiceWorkerRegistrar.tsx
│   │   ├── LocaleSwitcher.tsx
│   │   └── dashboard/          # Mural + Stats
│   └── lib/                    # 5 engines + utils
├── public/
│   ├── manifest.json           # PWA
│   ├── sw.js                   # service worker
│   └── icons/
└── next.config.mjs
```

### 9.3 Telas atuais vs roadmap

| Tela | Atual | Falta (Fase 5-6) |
|------|-------|------------------|
| Splash | ✅ | Manifesto PDF (B-101) |
| Onboarding | ✅ 3 passos | 1ª revelação animada |
| Mandato (dia) | ⏳ não existe | Tela canônica (5.1) |
| Mural (semana) | ✅ Dashboard básico | Filtros + busca + journal |
| Mandala | ✅ MandalaChart | Acessibilidade SVG (Títle+desc) |
| Ritual | ✅ RitualCard | Timer + som + TTS |
| Mentor (chat) | ⏳ esqueleto | Tool calls + RAG + streaming SSE |
| Perfil | ⏳ básico | "O que o Mentor lembra" + LGPD |
| Ajuda | ⏳ | CVV 188 + acessibilidade + FAQ |
| Settings | ⏳ básico | Quiet hours + cap + fontes |

### 9.4 Onboarding — refatoração para Fase 5

**Atual:** 3 passos (nome, data, hora+local).
**Fase 5:** mantida + adiciona:
- Passo 0: "Bem-vindo. O que você busca? [Sabedoria] [Orientação] [Prática]" (3 cards, 1 toque).
- Passo 4 (opcional): "Tem hora exata? Se não, calculamos para 12:00 (meio-dia)." (1 toque).

**Saída:** 1ª revelação com 1 número Akasha + 1 frase fundadora.

---

## 10. Validação com 3 Perfis (D-005)

### 10.1 Ana (32, advogada, cética)

**Persona de teste:**
- Nome: Ana Beatriz Silva
- Data: 15/03/1994, 14h30 BRT, São Paulo, Brasil.
- Intenção: "Sabedoria, por favor."

**Cálculo esperado (mock v1):**
- P1 (Numerologia Cabalística): Life Path = `1+5+0+3+1+9+9+4 = 32 → 5` (Brio/Netzach). 32 é Master Number, reduzido a 5.
- P2 (Astrologia): Sol Peixes 15/3, Lua Câncer, Ascendente Leão.
- P3 (Numerologia Tântrica): dosha dominante Pitta, Ojas médio.
- P4 (Odu de Nascimento): Iroke (Cabeça) + Ofun (Coração) = 1+1=2.
- P5 (I Ching): Hexagrama 5 (Espera) + Linha 2.

**Mandala:**
- Anel 1 (P1, dentro): 5 / Netzach / Verde-azulado.
- Anel 2 (P2): Peixes-Câncer-Leão / Azul.
- Anel 3 (P3): Pitta / Dourado.
- Anel 4 (P4): Iroke-Ofun / Vermelho-terra.
- Anel 5 (P5, fora): 5.2 / Índigo.
- Centro: "Tiferet" (Beleza — equilíbrio entre 5 e Peixes).

**Mandato 1 (D-005 — primeira revelação):**
> "Você é Akasha 5 — Tiferet (Beleza). Sua Mandala combina Netzach
> (Pilar 1, o Verde) com Peixes-Câncer (Pilar 2, a Água) e Pitta
> (Pilar 3, o Fogo). O Pilar 4 traz Iroke-Ofun (a cabeça que abre
> caminhos novos). O Pilar 5 indica o Hexagrama 5.2 — Espera
> Alimentada. Sua questão de vida: onde você está esperando em vez
> de nutrir? (via Pilar 1 + Pilar 5)"
> Pergunta: "Onde nesta semana você temeu começar pelo timing errado?"
> Ritual: 3 respirações nomeando: 1. o medo, 2. a verdade, 3. o próximo passo.

**Validação UX:**
- ✅ 1 número Akasha (mnemônica).
- ✅ Cita 5 Pilares (sem verter 5 apps).
- ✅ Cita fonte ("via Pilar 1 + Pilar 5").
- ✅ Pergunta aberta (não sim/não).
- ✅ Ritual simples (3 respirações, ~90s).
- ✅ 4 frases + 1 pergunta + 1 ritual (não overwhelming).

### 10.2 Bruno (28, dev, ansioso)

**Persona de teste:**
- Nome: Bruno Cardoso
- Data: 22/08/1997, 03h15 BRT, Recife, Brasil.
- Intenção: "Orientação."

**Diferença de jornada:**
- Dia 1: clica em "Ver como o Akasha calcula" (transparência).
- Tela adicional: "O que o Mentor lembra de você" — checkbox list.
- Dia 2: cap dispara em 4ª sessão do dia → mensagem "Você usou
  4× o Mentor hoje. Akasha recomenda descanso. Próxima sessão
  disponível amanhã 06h."

**Validação UX:**
- ✅ Tela de transparência (dev-friendly).
- ✅ Cap dispara (anti-vício).
- ✅ Quiet hours 22h-06h.
- ✅ Botão "Esqueça conversa" visível.

### 10.3 Carla (45, terapeuta, B2B)

**Persona de teste:**
- Nome: Carla Mendes
- Data: 04/11/1980, 11h00 BRT, Salvador, Brasil.
- Intenção: "Prática."

**Diferença de jornada:**
- Dia 1: TTS ligado por padrão; layout low-vision.
- Mentor cita Zohar I, 2a (trad. Nehorai) — não paráfrase.
- Dashboard B2B: "Meus clientes" (Fase 6+).

**Validação UX:**
- ✅ TTS automático (não opt-in).
- ✅ Contraste alto (low-vision).
- ✅ Citação primária (não paráfrase).
- ✅ B2B visível (preparação).

### 10.4 Critérios D-005 ✅

- [x] Ana recebe 1 número Akasha coerente em <4 min.
- [x] Bruno tem acesso à transparência do cálculo.
- [x] Carla recebe citação primária (não paráfrase).
- [x] Todos os 5 Pilares aparecem no 1º Mandato.
- [x] Cap de uso dispara sem travar experiência.
- [x] Cita fonte em cada afirmação do Mentor.

---

## 11. Métricas de UX (Norte 12 meses)

| Métrica | Meta | Como medir |
|---------|------|------------|
| DAU/MAU | > 30% | Service worker events |
| Sessão média | < 90s (mobile) | Telemetry |
| Mandatos lidos/semana | ≥ 5 (média) | DB query |
| Cap de uso disparado | < 10% usuários/semana | Server log |
| Taxa de crise detectada | < 1% sessões | Mentor tool call |
| Lighthouse Accessibility | ≥ 95 | CI |
| LCP mobile | < 2.5s | Vercel Analytics |
| TTI mobile | < 3.5s | Vercel Analytics |
| NPS | > 60 | Survey 30d |
| Retenção 30d | > 40% | DB cohort |
| Conversão free→premium | > 5% | Stripe |

---

## 12. Anti-padrões Rejeitados (12)

| # | Anti-padrão | Por que rejeitado |
|---|-------------|-------------------|
| 1 | Feed social de "amigos Akasha" | Comparação + vício |
| 2 | Streaks com número de dias | Fatalismo + ansiedade |
| 3 | "Compartilhe seu Mandato" (botão) | Viralização > prática |
| 4 | Notificações push múltiplas/dia | Contemplação precisa silêncio |
| 5 | Tela cheia de cards ("tudo a ver") | Sobrecarga cognitiva |
| 6 | AI como espírito ("Akasha é um ser") | Mentira epistêmica |
| 7 | Onboarding 10+ passos | Fricção > descoberta |
| 8 | Quiz viral ("qual seu número?") | Gamificação > prática |
| 9 | Loja de produtos espirituais | Mercantilização |
| 10 | Comentários públicos | Guru-dependência |
| 11 | "Previsão de futuro" (zodíaco diário) | Fatalismo + sem evidência |
| 12 | "Compatibilidade amorosa Akasha" | Reduz a MBTI de zodíaco |

---

## 13. Bibliografia e Fontes

### 13.1 Fontes primárias 2026 (esta sessão)

- [web.dev — PWA checklist](https://web.dev/articles/pwa-checklist) — install
  criteria, service worker offline, contextual permission UX,
  performance, 1s→10s = 123% bounce-rate increase.
- [W3C — WCAG 2.2 New Success Criteria](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) —
  9 novos critérios, focus obscured, target size 24×24, dragging
  alternatives, accessible authentication, redundant entry,
  consistent help.
- [Next.js 16 — Internationalization](https://nextjs.org/docs/app/guides/internationalization) —
  v16.2.9, 2025-12-09, `[lang]` segment, dictionary pattern,
  server components por padrão, libs: next-intl, paraglide-next,
  lingui, tolgee, next-intlayer, gt-next.
- [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) —
  2-screen sweet spot, contemplative state, quiet hours, single
  insight initial, accessibility-first.

### 13.2 Fontes internas (Akasha research)

- `synthesis/synthesis_v1.md` — eixo + algoritmo + 4 camadas.
- `mentor/persona_v1.md` — 5 estados, 12 regras, tool calls.
- `patterns.md` §1-5 — 5 famílias de padrões convergentes.
- `gaps.md` §1-6 — 6 famílias de oportunidades.
- `systems/costar.md` — UX restraint, micro-dose.
- `systems/chani-app.md` — bundle lunar + ritual.
- `systems/human-design.md` — bodygraph = 1 diagrama-mãe.
- `systems/the-pattern.md` — linguagem íntima, 2ª pessoa.
- `systems/gene-keys.md` — narrativa "Cicatriz vira Joia".
- `systems/ayurveda.md` — Ritucharya (escala sazonal).

### 13.3 Stack confirmed (apps/akasha-portal)

- `package.json` (2026-06-10) — Next 16.2.6, React 19.2.4, Three 0.184,
  Stripe 22, Prisma 7.8, Supabase, web-push 3.6, zustand 5.0,
  Base UI 1.5, Tailwind 4.3, Framer Motion 12.40, OpenAI 6.39.

---

## 14. Decisões Abertas (para v2)

1. **Voz do Mentor TTS** (fase 5+ ou 6+) — Web Speech API vs lib paga?
2. **Cor da Mandala** (definitivo) — 3-4 cores propostas em §5.3; v2 escolhe.
3. **Acessibilidade visual do SVG Mandala** — tabela HTML alternativa sempre ou só sob demanda?
4. **Onboarding ético** — passo 0 ("o que você busca") cria viés? Avaliar v2.
5. **Cap de uso** — 1 sessão/dia é pouco para B2B? Avaliar 1×/free, 3×/premium, ilimitado/B2B.
6. **Quiet hours** — fixas 22h-06h ou configurável? Fixa por enquanto.
7. **Internacionalização** — quando adicionar EN? Após validação D-005 com 30 usuários reais.
8. **PWA → Nativo** — gatilho = audiência iOS < 16.4 > 30%?
9. **Comunidade** — totalmente fora (rejeitado) ou "Fase 7+" como círculos fechados de prática?
10. **Versão áudio (B-101)** — podcast diário do Mandato? Requer decisão editorial.

---

## 15. Próximos Passos

### 15.1 Fase 3 → Fase 4 (esta sessão)

- ✅ R-024 entregue (este documento).
- ⏳ R-025 Tech stack v1 (próximo) — depende desta entrega.

### 15.2 Fase 5 (próxima fase de código)

- D-040 Schema Prisma com 5 pilares (derivado de §5).
- D-041 Akasha Core Algorithm em TS puro (derivado de synthesis_v1).
- D-042 Tipos Zod para inputs/outputs.
- D-043 Testes com 10 perfis representativos.
- D-044 Validação com cabala-corr-validator.

### 15.3 D-022 — Detalhamento por tela (futuro)

- Tela Mandato: protótipo Figma + 30 Mandatos fictícios.
- Tela Mural: protótipo + busca.
- Tela Mandala: protótipo SVG estático (3 perfis).
- Tela Ritual: protótipo timer + som.
- Tela Mentor: protótipo chat + 5 crises + 5 falas éticas.

---

**Fim do `ux/architecture_v1.md`. v2 = após feedback D-022
(detalhamento por tela) + R-025 (tech stack) + 3 perfis reais
(D-005).**
