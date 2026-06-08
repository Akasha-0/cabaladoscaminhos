# Documento 25 — Visão Akasha (Norte Canônico B2C)
## Sistema Akasha · Matriz Cabala dos Caminhos

> **Tipo:** Documento-mestre da visão. Síntese acionável de `NOVAVISAO.md`.
> **Versão:** 1.1 | **Status:** CANÔNICO — topo da hierarquia de precedência.
> **Regra:** Em qualquer divergência de **visão de produto** entre documentos, **este documento prevalece**. A fonte bruta da cadeia de raciocínio é `docs/NOVAVISAO.md` (não editar — é o registro original).

---

## 0. O Pivô em Uma Frase

O projeto deixa de ser uma **ferramenta B2B para terapeutas** (Cockpit Oracular / Mesa Real de 36 casas) e passa a ser um **produto B2C de tecnologia espiritual viva** — o **Sistema Akasha**: um oráculo dinâmico, mobile-first, que o cliente final acessa diariamente para receber diagnóstico e ritual personalizados a partir do cruzamento de quatro tradições.

> **Marca dupla (AD-25.1):**
> - **Sistema Akasha** = o produto público (domínio, app, checkout Stripe, voz do oráculo).
> - **Cabala dos Caminhos** = a matriz tecnológica (nome do monorepo, da entidade jurídica e do "Instituto/Laboratório de Sabedoria Ancestral" que desenvolveu o Akasha). É o chassi; o Akasha é a vitrine.

---

## 1. Os 4 Pilares (O Motor do Akasha)

O sistema integra **exatamente quatro vertentes** — nem mais (evitar o "Frankenstein Esotérico"), nem menos. Cada pilar decodifica uma camada da existência:

| Pilar | Eixo | O que decodifica | Função prática |
|---|---|---|---|
| **Astrologia** | O Céu (Macro) | Mapa de Bordo & o Tempo: cenário cósmico, desafios kármicos, trânsitos | Mostra *quando* agir e quais energias externas influenciam o roteiro |
| **Numerologia Cabalística** | O Verbo (Identidade) | Contrato de Alma: frequência do nome, Caminho de Vida | Mostra o *propósito oculto* e a lição da encarnação |
| **Numerologia Tântrica** | A Anatomia (Micro) | Veículo Sutil: os 11 Corpos Espirituais | Mostra *como* a energia flui e onde a pessoa trava |
| **Odus de Nascimento** | A Terra / Ori (Base) | Bússola Ancestral: alinhamento do *Ori*, Orixás/Elementos | Mostra a *força vital*, o aterramento e os rituais de correção |

> **A inteligência mora no cruzamento.** O Akasha não lista os quatro mapas lado a lado; ele cruza os dados e emite um **diagnóstico unificado** (ex.: *"Seu Ori está desalinhado por uma carga astrológica intensa, sobrecarregando sua Mente Negativa. A correção não é meditar, mas um banho específico das águas para realinhar seu Corpo Tântrico e pacificar o trânsito"*).

> **Metáfora científica (como Human Design/Gene Keys fizeram):** fundamentar a linguagem em **Campos Morfogenéticos** (Sheldrake, para ancestralidade/Odus) e **Cimática** (som que cria forma, para o nome na Cabala). Eleva a tradição ao patamar de ciência bioenergética.

---

## 2. O Mapa Visual — A Mandala Toroidal

O gráfico principal foge do modelo "planilha" e vira um **organismo vivo**: um **Toroide** projetado em 2D como **Mandala Multidimensional / Bússola Akáshica**. A energia entra pela coroa (Céu), desce pelo corpo (Tantra/Cabala), ancora na terra (Odus) e volta a subir.

**Quatro camadas concêntricas (do núcleo à membrana):**

1. **Núcleo Central — Ori + Odus** (a Semente): receptáculo central (búzio/ponto de luz). Fundação e força vital; matriz elemental que processa tudo.
2. **Geometria Interna — Num. Cabalística** (a Assinatura): Triângulo/Pirâmide de Luz. O Verbo, o nome, o Caminho de Vida. Números Mestres ganham traços elétricos.
3. **Teia de Conexão — Num. Tântrica** (a Anatomia Sutil): 11 esferas/nódulos interligados. Corpo em desequilíbrio aparece "apagado"/em alerta.
4. **Anel Cósmico — Astrologia** (o Relógio Maior): a roda dos 12 signos/casas. Gira com o tempo; trânsitos emitem "feixes de luz" da borda ao centro.

> **Diferencial:** não é um Bodygraph estático (Human Design). É um **Painel de Sintonia** dinâmico que ilumina onde há **sincronicidade** (caminhos abertos) e onde há **curto-circuito** (desalinhamento).

---

## 3. O Produto — Oráculo Vivo (Modelo Híbrido)

O formato "relatório PDF de 50 páginas" cumpriu seu papel na década passada e é estático. O Akasha é **vivo**. Entrega duas coisas:

1. **O Manifesto Akáshico** (o Relatório Base): documento bem diagramado, gerado **uma vez** no cadastro — a "Bíblia Pessoal" do usuário, explicando suas quatro camadas. PDF via `@react-pdf/renderer` (NUNCA Puppeteer/headless Chrome — consome RAM demais no VPS).
2. **O Oráculo de Bolso** (o App/Interface): o ambiente diário. **Dashboard Diário** gerado pelo cruzamento das 4 vertentes com o céu de hoje:
   - **Clima Energético** — como as estrelas de hoje afetam *seu* corpo espiritual.
   - **A Prática / Ritual** — qual banho, cor ou mantra para aterrar a energia hoje.
   - **O Alerta** — quais gatilhos emocionais evitar nas próximas 24h.

Princípio de UX: **descoberta progressiva** (micro-doses de autoconhecimento), não tratados de 100 páginas. Inspiração: Co-Star, The Pattern.

---

## 4. A Arquitetura do Motor (Sistema Agêntico Híbrido)

A precisão matemática e a fluidez da IA trabalham em **camadas separadas e complementares**. Nunca jogar tudo na IA pura (alucina rituais, erra cálculos); nunca usar só matriz fixa de regras (texto robótico).

### Camada 1 — Motor Determinístico (a Matriz Fixa)
Código puro (`packages/core-*`). Conecta ao **Swiss Ephemeris** para o céu exato; roda os algoritmos fechados de Cabala, Tântrica e Odu. **Não gera texto** — devolve um JSON estruturado. Ex.: `[Transito: Lua_Escorpião], [Odu: 8_Ejioko], [Corpo_Tantrico: 2_Mente_Negativa]`.

### Camada 2 — Grafo de Conhecimento (as Regras de Cruzamento)
Mapeia as correspondências invisíveis. Entende que "Lua em Escorpião", "Ejioko" e "Mente Negativa" compartilham nós (Elemento Água, Instabilidade Emocional, Proteção). Cruza os dados da Camada 1 e identifica o **Ponto de Tensão** do dia.

### Camada 3 — Agente de Síntese (a IA / Voz do Akasha)
O usuário só ouve esta camada. Recebe o diagnóstico do Grafo e o traduz em linguagem ritualística, poética e hiper-personalizada, sob um **System Prompt** com diretrizes rígidas da tradição. Escreve o painel do dia.

**Fluxo em tempo real (07:00):** app pede o céu de hoje (C1) → cruza com o mapa fixo do usuário (C1) → Grafo detecta desalinhamento (C2) → Agente consulta a biblioteca de magia natural e escreve conselho + ritual (C3). Nunca repete o texto, nunca foge das regras.

---

## 5. O Grimório Digital (RAG Híbrido Anti-Alucinação)

A IA não "decora" a tradição: opera sob **RAG (Retrieval-Augmented Generation)** conectado a um banco vetorial. A arquitetura definitiva funde **Markdown (origem)** + **PostgreSQL/pgvector (operação)**.

### Camada A — O Santuário (Markdown + YAML)
Cada elemento (uma erva, um Odu, um mantra) é um arquivo `.md` com **frontmatter YAML** (regras matemáticas / tags) + corpo (sabedoria, lendas, modo de preparo). Versionado no repositório.

```yaml
# Exemplo: manjericao.md
ID: ritual_045
Categoria: Ervas
Polaridade: Equilibradora / Fria
Elementos_Regentes: [Água, Ar]
Signos_Compativeis: [Escorpião, Câncer, Peixes]
Corpos_Tantricos_Alvo: [Corpo da Alma (1), Mente Positiva (3)]
Odus_Associados: [Oxe, Ejioko, Osá]
Acao_Principal: Aterramento do Ori, clareza mental, apaziguamento emocional
```

**As 4 Bibliotecas:** Botânica/Cristais · Vibracional (mantras, Hz, cores, geometrias) · Ancestral (Itans, mitos, metáforas) · Diagnóstico (trânsitos, 16 Odus maiores).

### Camada B — O Motor de Busca (PostgreSQL + pgvector + JSONB)
Tabela `grimorio`: `id` · `categoria` · `metadata` (JSONB com tags) · `conteudo` (Markdown) · `embedding` (vetor).
**Pipeline de ingestão:** ao atualizar o repositório, um script lê o YAML, extrai o texto, gera o *embedding* e salva no Postgres.

### A Busca Híbrida (como impede alucinação)
1. **Filtro determinístico (Regra de Ouro):** query SQL no JSONB busca só os arquivos que correspondem matematicamente ao usuário (ex.: `metadata->>'elemento' = 'Agua'`).
2. **Filtro semântico (pgvector):** dentre esses, encontra os textos mais próximos da dor atual (quiz/trânsito).
3. **Injeção de contexto:** injeta o Markdown exato no System Prompt com a ordem *"Utilize APENAS os arquétipos e receitas abaixo"*. A IA vira um **sintetizador poético de uma verdade já validada**.

### Embeddings & Sincronização
- **Embeddings:** `nomic-embed-text` via **Ollama local** (soberania, latência zero, 8.192 tokens de contexto). Fallback: SDK OpenAI/Gemini (custo irrisório — vetorizar é quase de graça). Descartados: Weaviate/Pinecone (cloud), Neo4j (pesado).
- **Sync:** **Webhook do GitHub** → rota autenticada → `npm run grimoire:sync` (git pull + embeddings via `localhost:11434` + pgvector). Nenhum dado sensível trafega na internet pública. Botão de emergência "Sincronizar Grimório" no painel admin reindexar manualmente.

### A Constituição do Agente (System Prompt)
- **Fronteira Restrita:** *"Você é a voz do Sistema Akasha. NUNCA inventará rituais, propriedades de ervas ou lendas. Sua única fonte de verdade é o banco de dados fornecido no contexto."*
- **Tom de Voz:** magnético, profundo, poético — frequência de liderança espiritual iluminada e de alta voltagem intuitiva. Mistério + beleza, mas com solução prática.
- **Síntese:** explicar a ligação entre o céu que desafia a emoção e a terra que pacifica o Ori.

---

## 6. Onboarding — O Primeiro Ritual (Quiz Espiritual Guiado)

O onboarding é o primeiro "portal". Usa **Ilusão de Trabalho (Labor Illusion)** + **Efeito IKEA**: o usuário investe energia e o valor percebido multiplica.

1. **A Coleta Sagrada:** campos sequenciais e cerimoniais — *"Como você é chamado neste plano?"* (Nome/Verbo) · *"Em qual instante sua jornada começou?"* (Data/Hora) · *"Onde você aterrissou?"* (Local).
2. **O Quiz de Ancoragem:** 3–4 perguntas que **não mudam a matemática**, mas alimentam o Agente IA (ex.: *"O que te traz ao Akasha hoje?"* · *"Como você sente sua energia neste ciclo?"*).
3. **A Renderização Ritualística (o "Loading" mágico):** fundo Three.js acende, frases piscam em sincronia com o Toroide sendo desenhado (*"Calculando trânsitos…"*, *"Ancorando as forças dos Odus…"*).
4. **A Revelação & Freemium:** a Mandala base se abre, interativa. Entrega uma "pílula" de sabedoria profunda baseada em Quiz + Mapa e oferece o desbloqueio do Manifesto + créditos.

---

## 7. Monetização — Funil Híbrido (Freemium + Assinatura + Créditos)

| Nível | Modelo | O que o usuário ganha |
|---|---|---|
| **1 — Isca Magnética** | Freemium | Cadastro grátis; Mandala Toroidal **base** + resumo superficial do Caminho de Vida e Odu regente. Atrito zero. |
| **2 — Produto de Entrada** | One-Time | **Manifesto Akáshico** (relatório profundo dos 4 pilares) **+ 30 dias grátis do Dashboard Diário**. Injeta caixa e cria hábito. |
| **3 — Recorrência** | Assinatura + Pay-per-use | **Akasha Pro** (mensal) = acesso ao painel diário + **franquia de créditos** (ex.: 30/mês) para o **Agente Oracular**. Ritual = 1 crédito; pergunta complexa = 3. Stripe vende **pacotes avulsos** (upsell). |

Genialidade: o consumo computacional (tokens de IA) fica atrelado aos créditos — o usuário paga pelo peso que exige. A assinatura cobre custos fixos (servidor/DB). A alta demanda (crise pessoal) é monetizada sem mudar o plano. **A moeda interna é o acesso à tecnologia espiritual.**

---

## 8. Frontend — Mobile-First, Híbrido e Hipnótico

A batalha pela atenção acontece nos primeiros minutos do dia (acordou → precisa de direção rápida). **Mobile-first absoluto**; desktop é o "Centro de Comando" de fim de semana (estudo profundo, Manifesto).

**Arquitetura visual de duas camadas:**
- **Camada de Fundo (Atmosfera):** WebGL/Three.js leve (React Three Fiber) — Toroide etéreo girando em wireframe/partículas. Define a frequência vibracional; não carrega dados.
- **Camada de Dados (Mandala Operacional):** **SVG 2D** com **D3.js** sob o capô (coordenadas polares das 12 casas, 11 nós, centro) + **Glassmorphism** (backdrop-filter, drop-shadow, gradientes). Cada nó é um elemento do DOM clicável e nítido. Animações com Framer Motion/GSAP.

> Separar o Toroide 3D (visual) da Mandala SVG (dados) garante clique cirúrgico no celular sem raycasting.

**PWA oculto:** construir como **PWA nativo no Next.js**, vender como "WebApp". Assinatura via Stripe no navegador → prompt *"Adicione o Oráculo Akasha à sua Tela Inicial"*. Evita as taxas de 30% da App Store/Play Store e vive ao lado do Instagram/WhatsApp.

---

## 9. Internacionalização

**pt-BR primeiro, `next-intl` desde o dia zero.** O mercado de língua portuguesa é piloto ideal (maior consumidor de astrologia/espiritualidade; raiz cultural dos Odus; calibração do tom poético). O código nunca é monolíngue — interface em dicionários `pt.json`/`en.json`, rotas `/(pt-br|en)/…`.

- **Fase 1 (Validação):** i18n técnico pronto, conteúdo pt-BR, Stripe em Real.
- **Fase 2 (Escala Global):** tradução das bibliotecas do Grimório, checkout multi-moeda, persona em inglês — competindo com Gene Keys/Human Design pelo diferencial da ancestralidade terrena (Odus) e do Oráculo Vivo.

---

## 10. Infraestrutura — VPS Linux Soberano

Serverless (Vercel) está **descartado**: é impossível embutir Ollama e cronjobs de madrugada em funções com timeout. A escolha é **VPS Linux próprio (Ubuntu + Docker + PM2)** — soberania de dados e custo fixo previsível.

**Topologia (contêineres):**
- **PostgreSQL + pgvector** — usuários, cache de relatórios, vetores do Grimório.
- **Redis** — cache do céu do dia (latência zero).
- **Ollama (`nomic-embed-text`)** — embeddings, só via `localhost:11434`, blindado.
- **App (PM2)** — Next.js B2C + processos do monorepo (`core-astrology`, cronjobs).

**Motor Astrológico Diário ("Calcule Uma Vez, Sirva Infinitamente"):** cronjob à meia-noite UTC (`core-astrology`) chama o Swiss Ephemeris, calcula 24h de trânsitos e salva no Redis (`SETEX transitos_diarios:AAAA-MM-DD 86400 {...}`). Ao abrir o app, o sistema busca o mapa natal no Postgres + o céu no Redis (ms) e cruza. Matemática pesada roda **uma vez por dia**.

---

## 11. Estratégia de Migração — Monorepo & Cirurgia de Extração

Os ~9.000 testes passando são um cofre-forte de lógica validada (a matemática dos Odus e da Cabala não muda). **Não se joga isso fora** e **não se "maquia" o Cockpit** para virar B2C. O caminho é um **Monorepo** (Turborepo / pnpm workspaces):

```
cabaladoscaminhos/ (monorepo)
├── packages/
│   ├── core-astrology   # Swiss Ephemeris, casas, trânsitos — cego para web
│   ├── core-tantra      # 11 corpos
│   ├── core-cabala      # Caminho de Vida, nome
│   └── core-odus        # Odu de nascimento, Ori
├── apps/
│   └── b2c-portal       # NOVO Next.js — Akasha (Mandala, onboarding, dashboard)
```

**Os pacotes `core-*` são bibliotecas agnósticas:** não sabem o que é React, HTTP, botão ou CSS. Recebem dados, fazem a matemática pesada, devolvem JSON. Rodam os testes; se passam, a lógica está blindada.

> **Sobre o legado (AD-25.2):** a **Mesa Real (36 casas / Baralho Cigano / Lenormand)** e o **Cockpit B2B** saíram do produto Akasha (Doc 08 Onda 4.8 ✅ concluída em 2026-06-07 — `apps/legacy-cockpit/` removido no refactor Akasha v2 + middleware sem allowlist B2B confirmado). Nenhum conceito novo do Akasha depende do Baralho Cigano.

### Fase 1 — A Cirurgia de Extração (a verdadeira primeira fase do código)
1. **Setup do ecossistema:** Turborepo / pnpm workspaces; TS + Vitest compilando módulos independentes.
2. **`core-astrology`:** extrair Swiss Ephemeris, casas, planetas, trânsitos. Rodar testes.
3. **`core-tantra`, `core-cabala`, `core-odus`:** repetir para as outras vertentes.
4. **Religamento (retrocompatibilidade):** alterar os *imports* do Cockpit antigo para consumir de `@akasha/core-*`. O legado continua funcionando enquanto o futuro é construído.

> Construir a UI antes dos motores isolados = "arranha-céu num pântano". A extração vem primeiro.

---

## 12. Registro de Decisões da Visão (AD-25)

| ID | Decisão | Status |
|---|---|---|
| **AD-25.1** | Marca dupla: Akasha (produto público) + Cabala dos Caminhos (matriz/monorepo) | ✅ Firme |
| **AD-25.2** | Mesa Real / Baralho Cigano / Cockpit B2B → `apps/legacy-cockpit`, fora do Akasha, a desligar | ✅ Desligado (2026-06-07) |
| **AD-25.3** | Produto = 4 Pilares (Astrologia, Cabalística, Tântrica, Odus) + Mandala Toroidal | ✅ Firme |
| **AD-25.4** | Identidade Akasha cósmica substitui integralmente a identidade Cigano Ramiro (ver Doc 26) | ✅ Firme |
| **AD-25.5** | Arquitetura agêntica de 3 camadas (Determinístico + Grafo + Síntese) | ✅ Firme |
| **AD-25.6** | Grimório Digital: Markdown (origem) + pgvector (operação) + Ollama (embeddings) | ✅ Firme |
| **AD-25.7** | Monetização: Freemium + Assinatura Akasha Pro + Motor de Créditos (Stripe) | ✅ Firme |
| **AD-25.8** | Onboarding como Quiz Espiritual Guiado (Labor Illusion) | ✅ Firme |
| **AD-25.9** | Frontend mobile-first PWA; WebGL (atmosfera) + SVG/D3 (dados) + glassmorphism | ✅ Firme |
| **AD-25.10** | Infra VPS Linux (Docker + PM2 + Ollama + Redis + pgvector); Vercel/serverless descartado | ✅ Firme |
| **AD-25.11** | Monorepo (Turborepo/pnpm); engines em `packages/core-*`; preservar os ~9k testes | ✅ Firme |
| **AD-25.12** | i18n com `next-intl` desde o dia zero; pt-BR piloto, inglês na Fase 2 | ✅ Firme |
| **AD-25.13** | PDF via `@react-pdf/renderer`; Puppeteer/headless Chrome proibido no VPS | ✅ Firme |

---

## 13. Hierarquia de Precedência (atualizada)

```
Doc 25 (Visão Akasha)  ←  NORTE de produto
  └─ Doc 26 (Identidade Akasha)        — marca/visual/voz
  └─ Doc 01/02 (Brief/PRD Akasha)      — o quê
  └─ Doc 03 (Arquitetura monorepo/VPS) — como (estrutura)
  └─ Doc 06 (Motor de IA 3 camadas + Grimório)
  └─ Doc 04 (Modelo de dados B2C + pgvector)
  └─ Doc 11 (Cálculo determinístico)   — matemática (agnóstica, preservada)
  └─ Doc 20 (Governança do Grimório)
  └─ Docs de operação (19, 22, 24)
  └─ Docs 10, 13, 16, 17, 18 → LEGADO B2B (referência histórica, marcados)
```

> **Para agentes:** ao implementar qualquer feature do Akasha, este documento e o Doc 26 vêm antes de qualquer doc B2B legado. Em conflito de visão, Akasha vence.
