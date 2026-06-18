# MAPA.md — Akasha System Surface Inventory

> **Data:** 2026-06-17
> **Constitution base:** 5 perguntas fundamentais que o Akasha responde
> **Propósito:** Inventário completo de todas as superfícies — páginas, APIs, B2B — com estado e alinhamento às perguntas da constituição.

---

## As 5 Perguntas da Constituição

| # | Pergunta | Domínio |
|---|----------|---------|
| Q1 | **Who am I?** — Quem eu sou? | Identidade, propósito, essência |
| Q2 | **How does my energy work?** — Como minha energia funciona? | Energia vital, corpo, fluxo das forças |
| Q3 | **What are my talents/challenges?** — Quais meus dons e obstáculos? | Talentos natos, sombras, lições |
| Q4 | **How do I prosper?** — Como eu prospero? | Dinheiro, carreira, abundância |
| Q5 | **What do I do with this?** — O que eu faço com isso? | Prática, ação, ritual, decisão |

---

## Convenções de Estado

| Tag | Significado |
|-----|-------------|
| **viva** | Funcional, em produção, respondendo à pergunta |
| **candidata a fusão** | Redundante — sobrepõe-se a outra superfície viva; merece merge |
| **candidata a corte** | Não responde a nenhuma das 5 perguntas; utilitário ou obsoleto |
| **candidate-for-build** | Planejada mas não existe ainda no código |
| **redirect** | Rota que só redireciona; sem valor próprio |

---

## Arquitetura — Camadas (0–7)

| Camada | Papel |
|--------|-------|
| 0 | Dados: Prisma/SQL, Redis, pgvector |
| 1 | Engines de cálculo: `packages/core-*` (cabala, astrology, tantra, odu, iching) |
| 2 | Application services: daily-engine, synthesis-engine, narrative-generator |
| 3 | API routes: `/api/akasha/*` |
| 4 | Componentes React: MandalaChart, Dashboard, MyDayScreen, etc. |
| 5 | Páginas B2C: todas as rotas em `[locale]/(akasha)/` |
| 6 | Interface conversacional: Oráculo (camada de chat) |
| 7 | B2B Cockpit: operador/consulente (legacy — fora do escopo B2C) |

---

## Inventário Completo

### Páginas B2C — `[locale]/(akasha)/`

#### `/dashboard` — Dashboard do Dia
- **Rota:** `[locale]/(akasha)/dashboard/page.tsx`
- **Pergunta:** Q1 Q2 Q3 Q4 Q5 (síntese de todas as 5)
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Tela principal pós-login. Mostra síntese diária, streak, estatísticas de prática, mapas de vida. Responde todas as 5 perguntas indiretamente através da síntese dos 5 pilares.
- **API backing:** `GET /api/akasha/daily`, `GET /api/akasha/dashboard/*`

---

#### `/mandala` — Mandala Visual
- **Rota:** `[locale]/(akasha)/mandala/page.tsx`
- **Pergunta:** Q1 Q2 Q3 Q4 Q5 (nenhuma diretamente — é navegação visual)
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Visualização SVG cymática dos 5 pilares em camadas concêntricas. Não entrega conteúdo textual — é a interface de exploração visual do mapa natal.Painéis de significadoabrem por pilar (PilarCard). Mandato do Dia aparece como card integrado.
- **API backing:** `GET /api/akasha/mandala`

---

#### `/diario` — Diário Energético
- **Rota:** `[locale]/(akasha)/diario/page.tsx`
- **Pergunta:** Q2 — *How does my energy work?*
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Climático energético do dia + ritual prescrito + alerta. Cada pilar (cabala, astrologia, tantra, odu, iching) com redação própria. Mostra 3 frases extraídas do Mandato. Escala temporal: diária.
- **API backing:** `GET /api/akasha/mandato-do-dia`

---

#### `/diario/foco` — Foco do Dia
- **Rota:** `[locale]/(akasha)/diario/foco/page.tsx`
- **Pergunta:** Q2 Q4 — *How does my energy work? / How do I prosper?*
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Usuário escolhe 1 Área de vida (paz, saúde, relações, dinheiro, trabalho, propósito, criatividade, espiritualidade, sexualidade). Sistema devolve: acolhimento, o que o Pilar principal do dia diz para aquela área, ecos dos outros 4 pilares, conexões, sombra a observar, prática de 3–5 min.

---

#### /meu-dia — Minha Tela Única Diária
- **Rota:** `[locale]/(akasha)/meu-dia/page.tsx`
- **Pergunta:** Q2 — *How does my energy work?*
- **Camada:** 5
- **Estado:** **redirect** → `/diario`
- **Resumo:** Era uma tela mobile funcionalmente idêntica ao `/diario` (mesmo endpoint `GET /api/akasha/mandato-do-dia`). Unificada em `/diario`. Rota mantida como redirect 301 para compatibilidade de bookmarks e links existentes.

---

#### `/oraculo` — Oráculo Interativo
- **Rota:** `[locale]/(akasha)/oraculo/page.tsx`
- **Pergunta:** Q5 — *What do I do with this?*
- **Camada:** 6 (interface conversacional)
- **Estado:** viva
- **Resumo:** Chat interativo com o Oráculo. Usuário faz perguntas abertas (ex: *"Como meu Odu 8 lida com o trânsito de Plutão na minha carreira?"*). Sistema roteia para pilares relevantes, responde ancorado no Grimório + mapa do usuário. Custo: 1 crédito (ritual simples) ou 3 créditos (pergunta complexa). SSE streaming.
- **API backing:** `POST /api/akasha/consult`

---

#### `/manifesto` — Manifesto Akáshico
- **Rota:** `[locale]/(akasha)/manifesto/page.tsx`
- **Pergunta:** Q1 Q3 — *Who am I? / What are my talents/challenges?*
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Relatório completo do mapa natal — 4 camadas (Ori/Odus, Cabala, 11 Corpos Tântricos, Astrologia) + síntese integradora. Gerado uma única vez na compra (Nível 2). PDF exportável via `@react-pdf/renderer`. Pode ser expandido (comprar capítulos). Responde Q1 (identidade) e Q3 (dons/talentos) com profundidade.

---

#### `/mapa` — Hub do Mapa do Ser
**Cortada (Iter43).** Rota de entrada que só redirecionava para `/mapa/significado`. Sem valor próprio — `/mapa/significado` é a rota canônica. Removida. Links hardcoded em `not-found.tsx` e `ConexoesClient.tsx` atualizados para `/mapa/significado`.
---

#### `/mapa/significado` — Significado dos 5 Pilares
- **Rota:** `[locale]/(akasha)/mapa/significado/page.tsx`
- **Pergunta:** Q1 Q3 Q4
- **Camada:** 5
- **Estado:** viva
- **Resumo:** 5 Pilares detalhados + 40 Áreas de vida traduzidas. Cada Pilar (cabala, astrologia, tantra, odu, iching) com Significado específico + traduções por área. Insight do dia + Conexões entre pilares. Este é o mapa completo de significados — responde Q1 (quem eu sou via Pilar), Q3 (dons/talentos), Q4 (prosperidade em cada área).
- **API backing:** `GET /api/akasha/mandato-do-dia`, `GET /api/akasha/daily`

---

#### /minha-caixa — Minha Caixa (9 Dimensões)
- **Rota:** `[locale]/(akasha)/minha-caixa/page.tsx`
- **Pergunta:** Q1 Q3 Q4
- **Camada:** 5
- **Estado:** **redirect** → `/mapa/significado`
- **Resumo:** Sobrepunha-se a `/mapa/significado` (ambos mostram 5 pilares × áreas de vida). Sexualidade deep dive agora acessível em `/mapa/significado`. Rota mantida como redirect 301 para compatibilidade de links existentes.

---

#### `/glossario` — Glossário Vivo
- **Rota:** `[locale]/(akasha)/glossario/page.tsx`
- **Pergunta:** Q5 (indiretamente) — *What do I do with this?*
- **Camada:** 5
- **Estado:** **candidata a corte**
- **Resumo:** Termos técnicos das 5 tradições traduzidos em linguagem acessível. Cada termo = 1 card (definição, sistema de origem, fonte, sinônimos cross-ref). Serve como referência, não responde diretamente nenhuma das 5 perguntas. Útil como utilidade, mas não é superfície de navegação primária.
- **Nota:** Se o glossário for movido para dentro do `/mapa/significado` como tooltips/expansões nos cartões de Pilar, esta página pode ser eliminada.

---

#### `/conta` — Conta e Pagamentos
- **Rota:** `[locale]/(akasha)/conta/page.tsx`
- **Pergunta:** (nenhuma — gestão de conta)
- **Camada:** 5
- **Estado:** viva (infraestrutura)
- **Resumo:** Perfil do usuário, saldo de créditos, assinatura Stripe, status de checkout. Não responde às 5 perguntas — é infraestrutura de monetização.keep por ser essencial ao funcionamento do sistema.

---

#### `/onboarding` — Onboarding Ritualístico
- **Rota:** `[locale]/(akasha)/onboarding/page.tsx`
- **Pergunta:** Q1 (parcialmente) — setup do mapa natal
- **Camada:** 5
- **Estado:** viva (onboarding)
- **Resumo:** Input ritualístico: nome completo, data/hora/local de nascimento, 2 perguntas de ancoragem. Calcula os 4 mapas (cabala, tantra, astrologia, odu) e persiste no BirthChart. Após cálculo, redireciona para `/significado-primeiro` ou `/dashboard`.

---

#### `/compartilhar/receber` — Share Target PWA
- **Rota:** `[locale]/(akasha)/compartilhar/receber/page.tsx`
- **Pergunta:** (nenhuma — infraestrutura de compartilhamento)
- **Camada:** 5
- **Estado:** viva (utilidade PWA)
- **Resumo:** Fallback visual para when the OS share target POSTs to this route. Persiste rascunho do Mentor via query param e redireciona para `/oraculo`. Caso extremo — 99% dos compartilhamentos vão direto para o redirect sem renderizar.
#### `/conexoes` — Análise de Compatibilidade Akasha
- **Rota:** `[locale]/(akasha)/conexoes/page.tsx`
- **Pergunta:** Q1 Q3 — *Who am I in relation to another?*
- **Camada:** 5
- **Estado:** viva
- **Resumo:** Análise de compatibilidade entre dois mapas Akasha. Dois modos: pessoa registrada (e-mail) ou dados avulsos (nome + data + cidade). Três tipos: amorosa, negócio/parceria, completa. Scores 0-100 por dimensão, authority match, Odu sync, body sync, narrativa e recomendações. UI criada nesta iteração (ConexoesClient.tsx); engine + API route pendentes (PLANS/conexoes.md Fases 1-3).
- **API backing:** `POST /api/akasha/conexoes` (pendente — UI usa mock data)

---

#### `/significado-primeiro` — Significado do Pilar Principal
- **Rota:** `[locale]/(akasha)/significado-primeiro/page.tsx`
- **Pergunta:** Q1 — *Who am I?*
- **Camada:** 5
- **Estado:** **candidata a fusão**
- **Resumo:** 1 tela de boas-vindas pós-onboarding mostrando o Significado do Pilar principal do usuário (ex: *"Caminho de Vida 11 — Você é um canal de iluminação..."*). Resolve o "e daí?" pós-cadastro. Funcionalmente coberto por `/mapa/significado` (que mostra todos os pilares). **Proposta:** Manter como etapa de onboarding se for estrategicamente valiosa para engajamento; caso contrário, fundir com `/dashboard` ou `/mapa/significado`.

---

#### `/sobre` — Sobre o Sistema
- **Rota:** `[locale]/(akasha)/sobre/page.tsx`
- **Pergunta:** (nenhuma — página institucional)
- **Camada:** 5
- **Estado:** **candidata a corte**
- **Resumo:** Explica os 5 pilares canônicos, as 4 camadas temporais, e os compromissos éticos do Akasha. Serve para usuários que querem entender o sistema — não para uso recorrente. Se o glossário for co-locado em `/mapa/significado`, a mesma lógica se aplica aqui.

---


### API Routes — `/api/akasha/`

#### `GET /api/akasha/daily`
- **Pergunta:** Q2 — daily energy synthesis
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Retorna leitura diária cached (climate, ritual, alert, tensionPoint, hexagram, synthesis). Persistida em `prisma.dailyReading`.

---

#### `GET /api/akasha/mandato-do-dia`
- **Rota:** `src/app/api/akasha/mandato-do-dia/route.ts`
- **Pergunta:** Q2 — daily energy directive
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Retorna o Mandato do Dia: Pilar do dia, frases de síntese, ritual, pergunta padrão por pilar, micro-ritual. Dados vindos de `buildDailyContent`.

---

#### `GET /api/akasha/mandala`
- **Rota:** `src/app/api/akasha/mandala/route.ts`
- **Pergunta:** Q1 Q2 Q3 Q4 Q5 (nenhuma diretamente — fornece dados para visualização)
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Agrega dados do BirthChart (astrologia, cabala, tantra, odu, iching) + calcula aspectos astrológicos (5 principais). Retorna estrutura MandalaData para o componente SVG.

---

#### `GET /api/akasha/synthesis` — (não existe como arquivo)
- **Nota:** `synthesis-engine` existe em `src/lib/application/akasha/synthesis-engine/` mas não há API route `/api/akasha/synthesis` exposa o motor diretamente. O dashboard consome synthesis via `/daily` + hooks client-side.

---

#### `POST /api/akasha/consult`
- **Rota:** `src/app/api/akasha/consult/route.ts`
- **Pergunta:** Q5 — *What do I do with this?*
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Endpoint do Oráculo interativo. Valida créditos, debita saldo, processa pergunta via synthesis-engine + grimoire RAG, retorna resposta ancorada. Streaming SSE.

---

#### `POST /api/akasha/chat` + `/ritual` + `/practice`
- **Rota:** `src/app/api/akasha/chat/route.ts` + sub-rotas
- **Pergunta:** Q5
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Múltiplos endpoints de chat/oráculo para diferentesfluxos (chat geral, ritual, practice).

---

#### `GET /api/akasha/chart`
- **Rota:** `src/app/api/akasha/chart/route.ts`
- **Pergunta:** Q1 Q2 Q3 Q4 Q5 (all — birth chart completo)
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Retorna o mapa natal completo do usuário (astrologia, cabala, tantra, odu, iching). Alimenta Dashboard e Mandala.

---

#### `GET /api/akasha/dashboard/*`
- **Rotas:** `complete`, `history`, `streak`, `stats`
- **Pergunta:** Q1 Q2 Q3 (partial — dados para dashboard)
- **Camada:** 3
- **Estado:** viva

---

#### `POST /api/akasha/manifesto/generate`
- **Rota:** `src/app/api/akasha/manifesto/generate/route.ts`
- **Pergunta:** Q1 Q3 — birth chart → full report
- **Camada:** 3
- **Estado:** viva

---

#### `GET /api/akasha/iching/daily`
- **Rota:** `src/app/api/akasha/iching/daily/route.ts`
- **Pergunta:** Q2 Q5
- **Camada:** 3
- **Estado:** viva
- **Resumo:** Hexagrama I Ching do dia + linhas. Usado no daily reading e no `/diario`.

---

### Cockpit B2B — Páginas de Operador

#### `/cockpit/leituras` — Leituras dos Clientes
- **Pergunta:** (B2B — operador vendo dados dos clientes)
- **Camada:** 7
- **Estado:** candidate-for-build
- **Resumo:** Página do operador (consulente/anfitrião) para visualizar as leituras dos seus clientes. Sem equivalente em código atual (`apps/legacy-cockpit` foi movido para quarantine). Aguarda decisão sobre construir Cockpit interno ou usar tooling externo.

---

#### `/cockpit/consulentes` — Gestão de Consulentes
- **Pergunta:** (B2B — gestão de operadores)
- **Camada:** 7
- **Estado:** candidate-for-build
- **Resumo:** Dashboard B2B para gestão de consulentes (anfitriões de leitura). Sem equivalente em código. Aguarda arquitetura Cockpit B2B.

---

### Páginas Não Localizadas (no current codebase)

Estas superfícies foram mencionadas no task brief mas **não existem no código atual**:

| Rota | Motivo |
|------|--------|
| `cockpit/leituras` | Não existe em `apps/akasha-portal` nem em `apps/legacy-cockpit` |
| `cockpit/consulentes` | Não existe em `apps/akasha-portal` nem em `apps/legacy-cockpit` |

---

## Mapa de Decisões

### Fusões Recomendadas

| De | Para | Rationale |
|----|------|-----------|
| `/meu-dia` | `/diario` | Mesmo conteúdo, mesmo endpoint, mesma pergunta Q2. Unificar em `/diario` mobile-first. |
| `/mapa/significado` + `/minha-caixa` | `/mapa/significado` (ou novo `/dimensoes`) | Ambos mostram 5 pilares × áreas de vida. Differenciam-se em UX (grid vs. accordion) mas podrían compartir fonte de dados. Avaliar: 1 página com 2 modos de visualização, ou manter separadas com intent clara. |
| `/significado-primeiro` | `/dashboard` ou `/mapa/significado` | Etapa pós-onboarding já é cobertapor outras superfícies. Manter only if há dado de conversão justifying a etapa dedicated. |

### Cortes Recomendados

| Rota | Rationale |
|------|-----------|
| `/mapa` (entry point) | ~~Só faz redirect. Eliminar — a rota target já existe.~~ **Cortada Iter43.** |
| `/mural` | Não responde a nenhuma das 5 perguntas. Feature deengajamento sem KPI comprovado. Cortar ou mover para `/sobre` como seção. |
| `/glossario` | Serve como referência mas não responde perguntas. Cortar se os termos forem migrados para tooltips em `/mapa/significado`. |

---

## Cobertura das 5 Perguntas

| Pergunta | Páginas que respondem |
|----------|----------------------|
| Q1 — *Who am I?* | `/dashboard` (síntese), `/manifesto` (full birth chart), `/mapa/significado` (pilar principal), `/significado-primeiro` (boas-vindas), `/minha-caixa` (9 dimensões) |
| Q2 — *How does my energy work?* | `/dashboard` (daily synthesis), `/diario` (daily energy), `/diario/foco` (área específica), `/meu-dia` (redundante → fusão), `/mapa/significado` (pilar do dia) |
| Q3 — *What are my talents/challenges?* | `/dashboard` (stats + life areas), `/manifesto` (dons nativos), `/mapa/significado` (significado + lições), `/minha-caixa` (9 dimensões) |
| Q4 — *How do I prosper?* | `/dashboard` (career/abundance via life areas), `/manifesto` (prosperidade por pilar), `/mapa/significado` (área dinheiro/trabalho), `/diario/foco` (foco em área), `/minha-caixa` (dimensões materiais) |
| Q5 — *What do I do with this?* | `/oraculo` (chat interativo), `/diario` (ritual prescrito), `/diario/foco` (prática de 3–5 min), `/dashboard` (botão "Realizado" no ritual) |

**GAP identificado:** Q4 (prosperidade) tem cobertura fraca nos conteúdos curados. `/mapa/significado` mostra áreas de Dinheiro e Trabalho, mas não há síntese dedicada de prosperidade que cruza os 5 pilares para dar orientação prática de abundância. Considerar criar `/prosperidade` ou expandir `/diario/foco` para cobrir esta lacuna.

---

## Notas de Arquitetura

- **Camada 0–1 (dados + engines):** Estáveis. `packages/core-*` calculam mapas natais una vez.
- **Camada 2–3 (application + API):** Estáveis. Síntese diária funciona via cronjob.
- **Camada 4–5 (componentes + páginas):** Em evolução. TDZ deprecation em curso (ver AD-003).
- **Camada 6 (Oráculo):** Viva mas com dependência de MiniMax (rate limits frequentes — 429 circuit breaker).
- **Camada 7 (Cockpit B2B):** Não existe. `apps/legacy-cockpit` em quarantine. Decisão de build necessária.
