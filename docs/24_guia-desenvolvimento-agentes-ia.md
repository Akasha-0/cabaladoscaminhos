# Documento 24 — Guia de Desenvolvimento para Agentes de IA

## Sistema Akasha · **LEIA ISTO PRIMEIRO**

> **Para quem:** todo agente de IA que **codifica** este projeto.
> **Função:** como desenvolver **alinhado às documentações** da pasta `/docs` na nova visão Akasha B2C.
> **Regra zero:** na dúvida, a documentação vence o código. Mudança que contraria um doc canônico **não entra**. Em conflito de visão, **Akasha vence o legado B2B**.

---

## 1. O que você está construindo (em 5 linhas)

O **Sistema Akasha**: um **produto B2C de oráculo vivo, mobile-first**. O usuário se cadastra, faz um **onboarding ritual**, e recebe uma **Mandala Toroidal** que cruza **4 Pilares** (Astrologia, Numerologia Cabalística, Numerologia Tântrica/11 Corpos, Odus/Ori). A inteligência opera em **3 camadas** (Determinístico → Grafo → Síntese com RAG sobre o **Grimório Digital**) e entrega o **Manifesto Akáshico** (PDF) + **Dashboard Diário** (Clima/Ritual/Alerta) + **Agente Oracular** (consulta por créditos). **O Cockpit/Mesa Real (Baralho Cigano, 36 casas) é legado** (`apps/legacy-cockpit`) — não desenvolva nele.

---

## 2. Mapa de leitura — qual doc responde sua pergunta

| Sua pergunta | Doc |
|---|---|
| Qual a visão / o norte do produto? | **25** |
| O que é o produto / escopo / módulos? | 01, **02** |
| Cores, tipografia, voz, identidade? | **26** |
| Como é a arquitetura (monorepo, VPS, 3 camadas)? | **03** |
| Como a IA funciona (3 camadas, Grimório, RAG)? | **06**, 25 §4–5 |
| Modelo de dados (User, Subscription, Grimoire/pgvector)? | **04** |
| Como calcular os números/Odu/astrologia (fórmulas)? | **11** |
| Os mapas estão completos? Geolocalização? | **23** |
| Significados-base dos Odus/arquétipos (anti-alucinação)? | **15**, 20 |
| Agente Oracular conversacional (RAG, créditos)? | **12** |
| Como é a Mandala / UI / mobile-first? | **05** |
| Roadmap e ordem de execução (ondas)? | **08** |
| Testes / qualidade / CI (monorepo)? | **19** |
| Governança do Grimório (fonte das correspondências)? | **20** |
| Observabilidade, logs, custo de IA/créditos, VPS? | **22** |
| Status das decisões? | **21** (AD-25 vigentes; AD-16…20 = legado) |
| Crescer o Grimório / novos sistemas? | **14** |

---

## 3. Hierarquia de precedência (quem vence em conflito)

```
25 (Visão Akasha) ▸ 26 (Identidade) ▸ 01/02 (produto) ▸ 03 (arquitetura)
   ▸ 06 (IA 3 camadas) ▸ 04 (dados) ▸ 11 (cálculo) ▸ 20 (Grimório)
                         ▸ 21 = painel de STATUS (rastreia, não decide)
```
Docs **10, 13, 16, 17, 18** descrevem o Cockpit/Mesa Real B2B e são **LEGADO** (marcados). Não use como fonte para o Akasha.

---

## 4. A Constituição — regras invioláveis

1. **Escopo Akasha B2C.** Produto para o cliente final (4 Pilares + Mandala). O Cockpit/Mesa Real (Baralho Cigano, 36 casas) é **legado** (`apps/legacy-cockpit`) — não crie features novas nele nem o acople ao `b2c-portal`. (25 §11)
2. **Monorepo, engines puros.** Lógica espiritual em `packages/core-*` (cegos para React/HTTP). Apps só consomem JSON. (03 §2.1)
3. **Mapas natais: cálculo único, server-side, cacheado** em `BirthChart`. Nunca recalcular numa leitura (exceto ciclos pessoais e trânsitos diários). Nunca aceitar mapa do frontend. (02 B.3, 04)
4. **IA blindada (RAG).** A Camada 3 **nunca inventa** ritual/erva/lenda. Fonte da verdade = **Grimório** injetado (busca híbrida pgvector+JSONB). Correspondência sem fonte **não entra** (ledger `IDEIA.md`). (06, 20)
5. **Determinismo nas Camadas 1–2.** Cálculos exatos (`core-*`); cruzamento por correspondências curadas no Grafo, não por palpite do LLM. (06)
6. **Fonte única por conceito.** 16 Odus, 11 Corpos, tipos dos mapas, correspondências do Grimório — **nunca** listas paralelas.
7. **Identidade Akasha.** Paleta cósmica (violeta/ciano/dourado), Voz do Akasha. **Nenhuma referência a Cigano Ramiro / laranja+royal** no produto. (26)
8. **Soberania.** Embeddings e conhecimento do Grimório nunca trafegam na internet pública (Ollama local, `localhost:11434`). (25 §5)
9. **Mobile-first PWA.** Desenhe para o celular primeiro; WebGL atmosfera + SVG/D3 dados. (05)
10. **i18n desde o dia zero.** Nada hardcoded; tudo em dicionários `next-intl`. (25 §9)
11. **Auth + créditos em rotas privadas.** `User` B2C; valide sessão e debite créditos no Agente Oracular. (04)
12. **Privacidade.** Sem PII nem segredos em log; logs por ID. (22)
13. **PDF leve.** Manifesto via `@react-pdf/renderer`. **Puppeteer/headless Chrome proibido** no VPS. (25 §13)
14. **Cirúrgico.** Não "melhore" código adjacente fora do escopo. **Preserve os ~9k testes** na extração. (19)

---

## 5. Workflow de tarefa

```
1. ABRA o painel (Doc 21) → escolha uma tarefa da onda atual (Doc 08: 1→2→3→4).
2. LEIA o Doc 25 (norte) + os docs referenciados na tarefa.
3. IMPLEMENTE o mínimo cirúrgico que cumpre a tarefa (regra 14).
4. SE tocar conteúdo do Grimório → registre a fonte em IDEIA.md e passe pelo validador (20).
5. GATE antes de commitar:  tsc --noEmit  ·  test  ·  build  (Doc 19).
6. ATUALIZE o status no painel (Doc 21).
7. COMMIT conventional: docs(scope)/feat(scope)/fix(scope).
```

---

## 6. Definição de "pronto"

- [ ] Cumpre a tarefa e **respeita a Constituição** (§4).
- [ ] Não cria fonte de verdade paralela, nem acopla ao legado.
- [ ] `tsc --noEmit` + `test` + `build` verdes; teste-guardião quando toca determinismo/Grimório/mapas (19, 23).
- [ ] Ritual/conteúdo oracular tem `grimoireId`/fonte rastreável.
- [ ] Painel (Doc 21) atualizado.

---

## 7. Anti-padrões — NÃO faça

- ❌ Construir UI antes de extrair os engines ("arranha-céu num pântano"). (25 §11)
- ❌ Inventar correspondência/ritual sem fonte no Grimório (20, 06).
- ❌ Desenvolver no `apps/legacy-cockpit` ou acoplar o `b2c-portal` a ele.
- ❌ Usar identidade Cigano Ramiro (laranja/royal) no produto Akasha (26).
- ❌ Recalcular mapa natal numa leitura; aceitar mapa do frontend.
- ❌ Expor Ollama/pgvector à internet; usar Vercel/serverless para o motor (25 §10).
- ❌ Texto hardcoded (quebra i18n); Puppeteer para PDF.
- ❌ Adicionar um 5º sistema esotérico ("Frankenstein Esotérico") — os 4 Pilares bastam.
- ❌ Mapa astral "estimado" silencioso sem geolocalização — marque `incomplete` (23).

---

## 8. Onde mora cada verdade (artefatos canônicos — alvo Akasha)

| Conceito | Fonte única (alvo no monorepo) |
|---|---|
| Cálculo astrológico (Swiss Ephemeris) | `packages/core-astrology` |
| 11 Corpos Tântricos | `packages/core-tantra` |
| Numerologia Cabalística | `packages/core-cabala` |
| 16 Odus / Ori | `packages/core-odus` |
| Grafo de Conhecimento (cruzamento) | `packages/core-graph` |
| Ingestão/busca do Grimório | `packages/grimoire` |
| Conteúdo do Grimório (Markdown+YAML) | `grimorio/{botanica,vibracional,ancestral,diagnostico}/*.md` |
| Tipos dos 4 mapas | tipos compartilhados do monorepo |
| Ledger de correspondências | `IDEIA.md` (AD-20.5) |
| Identidade visual/voz | `docs/26` |
| Status das decisões | `docs/21` |

---

*Doc 24 é o ponto de entrada operacional para agentes de IA. Não substitui os docs canônicos — orienta como navegá-los. Em conflito, vale a hierarquia do §3 (Doc 25 no topo).*
