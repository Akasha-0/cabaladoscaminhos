# Documento 05 — Especificação UI/UX
## Sistema Akasha

> **Versão:** 2.0 | **Norte:** Doc 25 · **Identidade:** Doc 26 (fonte canônica da paleta/voz)
> Substitui a v1 (Cockpit B2B / grid 9×4 da Mesa Real), agora legado. Foco: **Mandala Toroidal**, **mobile-first PWA**, glassmorphism cósmico.

---

## 1. Princípios de Design

1. **Mobile-first absoluto.** A batalha pela atenção é nos primeiros minutos do dia. Tudo é desenhado primeiro para o celular; desktop é o "Centro de Comando" de estudo profundo (Doc 25 §8).
2. **Organismo vivo, não planilha.** A interface respira, gira e pulsa com o céu de hoje. O Toroide é o coração visual.
3. **Descoberta progressiva.** Micro-doses de autoconhecimento. Nunca despejar tudo de uma vez.
4. **Ritual, não formulário.** Cada interação tem peso cerimonial — especialmente o onboarding.
5. **Glassmorphism cósmico.** Painéis translúcidos flutuando sobre o vazio (Doc 26 §4).

---

## 2. Design System (resumo — canônico no Doc 26)

- **Paleta:** vazio cósmico (`--bg-void #06070F`) + violeta akáshico (`#7C5CFF`, o campo) + ciano/aurora (`#2DD4BF`, o fluxo/sincronicidade) + dourado Ori (`#F0B429`, o núcleo) + magenta alerta (`#FB5781`, curto-circuito).
- **Tipografia:** Cinzel (títulos cósmicos) · Cormorant Garamond (subtítulos) · Lora (corpo/Manifesto/voz) · JetBrains Mono (graus/números/IDs) · **Inter** (UI mobile).
- **Efeitos:** `backdrop-filter: blur()`, glows de nebulosa (`--accent-*-glow`), gradientes radiais.
- **Movimento:** Framer Motion / GSAP — pulse suave, rotação do anel, revelação progressiva.

---

## 3. Arquitetura de Renderização (duas camadas)

Decisão técnica (Doc 25 §8): nunca um Toroide 3D monolítico onde o clique compete com a câmera.

**Camada de Fundo (Atmosfera) — WebGL/Three.js (React Three Fiber):**
- Toroide etéreo girando lentamente (wireframe brilhante / partículas).
- Roda assíncrona; **não carrega dados**. Define a "frequência vibracional" da tela.
- Leve: shader simples; degrada graciosamente em aparelhos antigos.

**Camada de Dados (Mandala Operacional) — SVG + D3.js + Glassmorphism:**
- **D3.js sob o capô** calcula coordenadas polares (12 casas astrológicas, 11 nós tântricos, centro).
- Coordenadas injetadas em **elementos SVG** do DOM — cada nó/linha/planeta é clicável e nítido em qualquer tela.
- Filtros CSS (backdrop-filter, drop-shadow, gradientes) dão o Glassmorphism.

> Resultado: clique cirúrgico no celular, sem raycasting; animações fáceis de programar/debugar.

---

## 4. A Mandala Toroidal (a tela central — `/mandala`)

Quatro camadas concêntricas (Doc 25 §2 · cores no Doc 26 §6):

| Camada | Conteúdo | Visual |
|---|---|---|
| **Núcleo** | Ori + Odus | Búzio/ponto dourado pulsante no centro; glow dourado |
| **Geometria Interna** | Numerologia Cabalística | Triângulo/pirâmide violeta; Números Mestres com traços elétricos |
| **Teia** | 11 Corpos Tântricos | 11 nós ciano interligados; corpo em desequilíbrio → magenta apagado |
| **Anel Cósmico** | Roda Astrológica | 12 signos/casas; gira com o tempo; trânsitos como feixes |

**Painel de Sintonia (dinâmico):**
- Linhas D3/SVG conectam a borda astrológica → nós tântricos → geometria cabalística → Ori.
- **Sincronicidade** (caminho aberto) = traço ciano luminoso. **Curto-circuito** (desalinhamento) = traço magenta pulsante.
- Mobile: o usuário **gira o anel externo com o polegar** e as informações mudam no centro (navegador espacial). Não precisa mostrar os 4 anéis o tempo todo.

**Interação:** tocar uma camada abre um painel glassmorphism (bottom-sheet no mobile, drawer no desktop) com o conteúdo daquela vertente — desbloqueado conforme o nível do usuário (Freemium vê a base).

---

## 5. Onboarding Ritualístico (`/onboarding`)

UX do "primeiro portal" (Doc 25 §6). Sequencial, cerimonial, uma pergunta por tela.

**Passo 1 — A Coleta Sagrada** (campos sequenciais, fundo cósmico, foco único):
- *"Como você é chamado neste plano?"* → nome completo.
- *"Em qual instante sua jornada começou?"* → data + hora.
- *"Onde você aterrissou?"* → cidade (autocomplete Nominatim → lat/lng/tz).

**Passo 2 — O Quiz de Ancoragem** (3–4 cards de múltipla escolha):
- *"O que te traz ao Akasha hoje?"* (propósito / cura emocional / alinhamento material / despertar ancestral).
- *"Como você sente sua energia neste ciclo?"* (acelerada / dispersa / estagnada / em fluxo).

**Passo 3 — A Renderização Ritualística (o "Loading" mágico):**
- Fundo Three.js acende; o Toroide é desenhado linha por linha em SVG.
- Frases piscam em sincronia: *"Calculando trânsitos astrológicos…"* · *"Acessando o Caminho de Vida…"* · *"Sintetizando os 11 Corpos Tântricos…"* · *"Ancorando as forças dos Odus…"*.

**Passo 4 — A Revelação & Freemium:**
- A Mandala base se abre, brilhante e interativa. Entrega uma "pílula" de sabedoria profunda (Quiz + Mapa) e oferece o desbloqueio do **Manifesto** + créditos.

---

## 6. Dashboard Diário (`/diario` — o Oráculo de Bolso)

Mobile-first; cards expansíveis / **snap-scrolling** magnético. Três telas (Doc 25 §3):

- **Tela 1 — Clima Energético:** resumo em 2 linhas (céu de hoje × seu corpo espiritual) + detalhe expansível.
- **Tela 2 — O Desafio do Dia:** baseado no Corpo Tântrico em tensão; o nó correspondente pisca na mini-Mandala.
- **Tela 3 — A Prescrição:** o banho/cor/mantra do dia, com botão **"Realizado"**.

Topo: saudação magnética e situada (Voz do Akasha, Doc 26 §7) — nunca "Olá, veja seu horóscopo".

---

## 7. Manifesto Akáshico (`/manifesto`)

- Leitura longa e diagramada (Lora), descoberta progressiva pelas 4 camadas + síntese.
- Botão **"Exportar PDF"** → `@react-pdf/renderer` (vetorial, texto selecionável).
- No desktop, layout de duas colunas (índice sticky + conteúdo); no mobile, coluna única com navegação por seção.

---

## 8. Agente Oracular (`/oraculo`)

Chat com a Voz do Akasha (Doc 12). Bolhas: usuário (violeta, à direita) · Oráculo (glassmorphism com glow aurora, à esquerda). Chips discretos mostram as **vertentes consultadas** (transparência) e o **custo em créditos** antes de enviar. Resposta em streaming (SSE). Saldo de créditos visível; upsell gracioso quando zera.

---

## 9. Conta & Monetização (`/conta`)

- Estado do plano (Freemium / Akasha Pro), saldo de créditos, janela de Dashboard.
- Checkout Stripe inline (Manifesto one-time, assinatura, pacotes de créditos).
- Prompt PWA pós-checkout: *"Adicione o Oráculo Akasha à sua Tela Inicial."*
- Seletor de idioma (pt-BR/en), dados natais, notificações.

---

## 10. Responsividade & PWA

- **Mobile (base):** coluna única, bottom-sheets, snap-scroll, anel girável com o polegar.
- **Desktop (Centro de Comando):** Mandala completa de 4 anéis, painéis laterais, leitura densa, impressão do Manifesto.
- **PWA nativo (Next.js):** manifest + service worker; instalável na tela inicial; vendido como "WebApp" (evita taxas de 30% das app stores — Doc 25 §8).
- **i18n:** todos os textos de UI em dicionários `pt.json`/`en.json` (`next-intl`); nada hardcoded.

---

## 11. Acessibilidade & Performance

- Contraste AA no dark cósmico (texto `--text-primary` sobre `--bg-void/deep`).
- Nós SVG com área de toque ≥ 44px; navegação por teclado no desktop.
- WebGL com fallback estático (imagem do Toroide) para aparelhos sem GPU adequada.
- Mandala e Dashboard carregam instantâneo (céu cacheado no Redis); lazy-load das camadas profundas.
