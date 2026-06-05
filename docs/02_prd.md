# Documento 02 — PRD (Product Requirements Document)
## Sistema Akasha

> **Versão:** 2.0 | **Escopo:** Portal B2C (Oráculo Vivo)
> **Norte:** Doc 25 · **Identidade:** Doc 26 · **Arquitetura:** Doc 03

---

## 1. Escopo do Produto

O PRD cobre o **portal B2C `apps/b2c-portal`**: a experiência do cliente final, do onboarding ritualístico ao hábito diário com o Oráculo. Os **engines de cálculo** vivem em `packages/core-*` (Doc 03). O **Cockpit B2B / Mesa Real** está em quarentena como `apps/legacy-cockpit` e **fora deste escopo** (Doc 25 §11).

Pré-condição arquitetural: a **Cirurgia de Extração** (Doc 08, Fase 1) move os motores espirituais para `packages/core-*` antes da construção do portal.

---

## 2. Módulos e Funcionalidades

### Módulo A — Conta & Autenticação (B2C self-service)

**A.1 — Cadastro e Login do Usuário**
- Auto-cadastro público: e-mail + senha (e/ou OAuth social — Google/Apple).
- Sessão persistente (JWT/cookie httpOnly). Verificação de e-mail.
- Recuperação de senha. Suporte a MFA opcional (Fase posterior).
- Perfil editável: dados de nascimento, idioma (`pt-BR`/`en`), preferências de notificação.

**Critérios de Aceitação:**
- [ ] Cadastro com e-mail válido cria conta no estado Freemium e dispara verificação.
- [ ] Login redireciona para a Mandala do usuário (`/mandala`).
- [ ] Rotas privadas protegidas; não-autenticado vai para `/entrar`.
- [ ] Editar data/hora/local recalcula os mapas natais (server-side) e regenera a Mandala.

---

### Módulo B — Onboarding Ritualístico (o Primeiro Portal)

Detalhe de UX no Doc 05; estratégia no Doc 25 §6. O onboarding usa **Labor Illusion** + **Efeito IKEA**.

**B.1 — A Coleta Sagrada (Input sequencial)**
- *"Como você é chamado neste plano?"* → Nome completo (conforme certidão) — usado na Numerologia Cabalística.
- *"Em qual instante sua jornada começou?"* → Data + Hora de nascimento (hora obrigatória para Ascendente).
- *"Onde você aterrissou?"* → Local (autocomplete via Nominatim → lat/lng/timezone para Astrologia/Odus).

**B.2 — O Quiz de Ancoragem**
- 3–4 perguntas de múltipla escolha que **não alteram a matemática**, mas alimentam o Agente IA (ex.: *"O que te traz ao Akasha hoje?"*; *"Como você sente sua energia neste ciclo?"*).
- Respostas salvas no perfil (`intentionProfile`) para personalizar o primeiro Manifesto e o roteamento do Grimório.

**B.3 — Processamento dos 4 Mapas (server-side, em `packages/core-*`)**
Ao concluir a coleta, o sistema calcula e persiste:

1. **Numerologia Cabalística** (`core-cabala`, fórmulas no Doc 11 §2): Caminho de Vida, Expressão, Motivação, Impressão, Missão, Dons Nativos, Desafios/Pináculos, Lições/Dívidas Kármicas, Ciclos Pessoais.
2. **Numerologia Tântrica** (`core-tantra`, Doc 11 §3): os **11 Corpos Espirituais** explícitos (Alma, Mente Negativa/Positiva/Neutra, Corpo Físico, Arco, Aura, Corpo Pranayama, Corpo Sutil, Corpo Radiante, etc.) + Alma/Karma/Dom Divino/Destino/Caminho Total.
3. **Astrologia** (`core-astrology`, Swiss Ephemeris): Sol, Lua, Ascendente, 10 planetas + Quíron/Lilith, casas, signos regentes, nodos, aspectos (harmony/tension), distribuição de elementos/modalidades.
4. **Odu de Nascimento / Ori** (`core-odus`, Doc 11 §4): Odu regente, Orixás/Elementos, caminhos abertos e sombras.

Persistidos em `User`/`BirthChart` como JSON. **Calculados uma vez e cacheados** (exceto Ciclos Pessoais e trânsitos diários, voláteis).

**B.4 — A Renderização Ritualística**
- Loading cerimonial: fundo Three.js acende; frases piscam em sincronia com o Toroide sendo desenhado (*"Calculando trânsitos…"*, *"Sintetizando os 11 Corpos Tântricos…"*, *"Ancorando as forças dos Odus…"*).

**Critérios de Aceitação:**
- [ ] A coleta valida cada campo antes de avançar; local resolve lat/lng/timezone.
- [ ] Os 4 mapas são calculados e persistidos em < 10s.
- [ ] Sem hora/local, a astrologia marca `incomplete:true` e a UI pede a informação (Doc 23).

---

### Módulo C — A Mandala Toroidal (a Interface Central)

Especificação visual no Doc 05; conceito no Doc 25 §2.

**C.1 — Quatro camadas concêntricas**
- **Núcleo:** Ori + Odus (dourado, pulsante).
- **Geometria Interna:** Numerologia Cabalística (violeta; Números Mestres elétricos).
- **Teia:** 11 Corpos Tântricos (ciano; corpo em desequilíbrio fica magenta/apagado).
- **Anel Cósmico:** Roda Astrológica (gira com o tempo; trânsitos como feixes).

**C.2 — Painel de Sintonia (dinâmico)**
- Ilumina **sincronicidade** (caminhos abertos, ciano) vs. **curto-circuito** (desalinhamento, magenta).
- Linhas de conexão D3/SVG ligam a borda astrológica aos nós tântricos, à geometria cabalística e ao Ori.

**C.3 — Descoberta Progressiva**
- Freemium vê a Mandala **base** (geometria + resumo superficial).
- Clicar numa camada abre um painel limpo (glassmorphism) com o conteúdo daquela vertente — desbloqueado conforme o nível do usuário.

**Critérios de Aceitação:**
- [ ] A Mandala renderiza no mobile com clique cirúrgico em cada nó (SVG, não raycasting).
- [ ] Nós tântricos em desequilíbrio aparecem em estado de alerta visual.
- [ ] O anel astrológico reflete os trânsitos do dia (Redis).

---

### Módulo D — Dashboard Diário (o Oráculo de Bolso)

O hábito diário (Doc 25 §3). Mobile-first, cards expansíveis / snap-scroll.

**D.1 — Os três blocos do dia**
1. **Clima Energético:** como o céu de hoje afeta *seu* corpo espiritual (resumo em 2 linhas + detalhe).
2. **A Prática / Ritual:** o banho de ervas, cor ou mantra do dia, com botão "Realizado".
3. **O Alerta:** gatilhos emocionais a evitar nas próximas 24h.

**D.2 — Geração (pipeline de 3 camadas — Doc 06)**
1. Busca o céu de hoje no **Redis** (cronjob de madrugada via `core-astrology`).
2. Cruza com o mapa natal do usuário (Camada 1) → Grafo detecta o **Ponto de Tensão** (Camada 2).
3. O **Agente de Síntese** (Camada 3) consulta o Grimório (busca híbrida pgvector + JSONB) e escreve os três blocos com dados 100% da tradição.

**Critérios de Aceitação:**
- [ ] O Dashboard carrega instantâneo (céu já cacheado no Redis).
- [ ] O ritual prescrito existe no Grimório (nenhuma erva/banho inventado — Doc 06/20).
- [ ] "Realizado" registra o ritual no histórico do usuário.

---

### Módulo E — Manifesto Akáshico (o Relatório Base)

**E.1 — Geração única**
- Gerado na compra (Nível 2) a partir dos 4 mapas + quiz de intenção.
- Estrutura: as quatro camadas do usuário (Ori/Odus, Cabala, 11 Corpos Tântricos, Astrologia) + síntese integradora.

**E.2 — Entrega**
- Renderizado na interface (descoberta progressiva) **e** exportável em **PDF via `@react-pdf/renderer`** (vetorial, leve, texto selecionável — **nunca** Puppeteer/headless Chrome no VPS, Doc 25 §10).

**Critérios de Aceitação:**
- [ ] O Manifesto cita dados específicos do mapa do usuário (não genérico).
- [ ] O PDF é gerado no backend consumindo zero RAM gráfica.
- [ ] Comprar o Manifesto concede 30 dias de Dashboard Diário.

---

### Módulo F — Agente Oracular Interativo (Consulta por Créditos)

A Camada 3 conversacional. Especificação completa no Doc 12.

**F.1 — Perguntar ao Oráculo**
- O usuário faz perguntas abertas (*"Como meu Odu 8 lida com o trânsito de Plutão na minha carreira hoje?"*).
- O sistema roteia deterministicamente para os pilares/aspectos relevantes e responde **ancorado no Grimório + no mapa do usuário** (RAG fechado — nunca conhecimento aberto, nunca inventa ritual).

**F.2 — Economia de Créditos**
- Pedir o ritual do dia = **1 crédito**; pergunta complexa = **3 créditos** (Doc 25 §7).
- A assinatura concede uma franquia mensal; esgotada, oferece pacotes avulsos (Stripe).

**Critérios de Aceitação:**
- [ ] `POST /api/consult` exige sessão, valida créditos disponíveis e debita ao responder.
- [ ] A resposta nunca cita erva/ritual fora do Grimório nem contradiz o Manifesto.
- [ ] Resposta em streaming (SSE) começa em < 3s; transparência das vertentes consultadas.
- [ ] Sem determinações médicas/jurídicas/financeiras categóricas.

---

### Módulo G — Monetização & Conta (Stripe)

**G.1 — Planos e Créditos**
- Freemium (default), compra do Manifesto (one-time), assinatura Akasha Pro (recorrente), pacotes avulsos de créditos.
- Webhooks Stripe atualizam `Subscription` e saldo de `Credits`.

**G.2 — PWA**
- Instalável na tela inicial; prompt pós-checkout *"Adicione o Oráculo Akasha à sua Tela Inicial"*.

**Critérios de Aceitação:**
- [ ] Webhook Stripe (assinado) ativa plano e credita a franquia mensal.
- [ ] Saldo de créditos visível; bloqueio gracioso quando zerado (oferta de upsell).

---

## 3. Restrições e Requisitos Não-Funcionais

**Segurança & Soberania:**
- Chaves de API (LLM, Stripe) só no servidor. Embeddings via **Ollama local** (`localhost:11434`) — conhecimento do Grimório não trafega na internet pública (Doc 25 §5).
- Webhook do Grimório com assinatura criptográfica verificada.

**Performance:**
- Mandala e Dashboard carregam instantâneo (céu cacheado no Redis; "Calcule Uma Vez, Sirva Infinitamente").
- Mapas natais calculados uma vez no onboarding e cacheados.

**Mobile-first:**
- Prioridade absoluta ao celular (cards/snap-scroll). Desktop é "Centro de Comando" para estudo profundo. PWA nativo.

**Internacionalização:**
- `next-intl` desde o dia zero; UI em dicionários `pt.json`/`en.json`; rotas localizadas. Conteúdo pt-BR no piloto.

**Disponibilidade:**
- VPS Linux (Docker + PM2). Cronjob de trânsitos à meia-noite UTC. Backup do PostgreSQL (usuários + pgvector).
