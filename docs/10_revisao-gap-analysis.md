<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 10 — Revisão, Validação e Gap Analysis
## Cabala dos Caminhos — LEGADO B2B

> ⚠️ **LEGADO B2B — referência histórica (não-canônico).** Este documento pertence ao produto **Cockpit Oracular / Mesa Real (B2B)**, descontinuado com o pivô para o **Sistema Akasha (B2C)**. Permanece apenas como registro do `apps/legacy-cockpit` (mantido durante a migração, depois desligado). **Visão vigente: Doc 25 (Visão Akasha) + Doc 26 (Identidade Akasha).** Não usar como fonte para o produto Akasha. Esta auditoria/gap analysis avaliava a documentação B2B (00–09) e não reflete o escopo do Akasha.

> **Tipo:** Auditoria técnica e de visão da documentação 00–09
> **Objetivo:** Levar a base documental ao estado de "prontidão mecânica" — pronta para um agente de IA implementar sem decisões em aberto.
> **Versão:** 1.0

---

## 1. Veredito de Prontidão

A documentação está **forte na arquitetura, no escopo e no fluxo**, e fraca em **três frentes que hoje bloqueiam a implementação mecânica**: (a) determinismo dos cálculos, (b) o motor de consulta interativa (Q&A), e (c) a profundidade dos mapas natais exigida pela visão. A identidade de marca (Cigano Ramiro) e a paleta de cores também estão desatualizadas nos documentos.

Avaliação por área:

| Área | Doc(s) | Estado | Pronta p/ agente? |
|---|---|---|---|
| Visão e escopo | 01, 02 | Sólida | ✅ |
| Arquitetura e stack | 03, 09 | Sólida | ✅ |
| Modelo de dados (núcleo) | 04 | Bom | ✅ (núcleo) / ⚠️ (mapas e Q&A) |
| UI/UX (estrutura) | 05 | Boa | ⚠️ (paleta antiga) |
| Matriz de Correlação (lógica) | 06 | Excelente em prosa | ⚠️ (código só 3 de 36) |
| Cálculos (numerologia/Odu/astro) | 02, 04, 07 | Insuficientemente determinístico | ❌ |
| Motor de Q&A interativo | — | Inexistente | ❌ |
| Identidade Cigano Ramiro | — | Inexistente nos docs | ❌ |
| Épicos, roadmap | 07, 08 | Sólidos | ✅ (faltam histórias das lacunas) |

**Conclusão:** ainda **não** está em prontidão mecânica. Faltam ~5 peças (detalhadas na §5 e §6). Nenhuma é grande; todas são objetivas.

> **Status pós-refatoração (Onda 1 e 3 aplicadas):** as peças de desbloqueio mecânico foram entregues — Docs 11, 12, 13, 14 e 15 criados; paleta migrada (Docs 01, 05, 07, 09, 13); `correlation-map.ts` completo (36 entradas) inserido no Doc 06; modelos `Consultation`/`ChatMessage` e mapas enriquecidos no Doc 04; índice (Doc 00) atualizado. As decisões de conteúdo D1–D6 permanecem como pontos de validação do operador, sinalizados com marcadores `VALIDAR` nos Docs 11 e 15.

---

## 2. Pontos Fortes — Preservar Sem Mudança

Estes acertos são a espinha dorsal e não devem ser tocados:

1. **A Fórmula de Interpretação por casa** (Doc 06 §1) e a estrutura de 3 parágrafos (Terreno / Evento / Direção) + linha-síntese em itálico + síntese em 4 capítulos + veredito. É o coração do produto e está bem definida.
2. **A Matriz de Correlação em prosa** (Doc 06 §2) — as 36 delegações estão completas, justificadas e coerentes com a visão. É conteúdo de altíssimo valor.
3. **A arquitetura de extração por chaves** (`CorrelationEntry` com `extractionKeys` por sistema, Doc 06 §3.1). É exatamente o que torna o cruzamento determinístico e — ponto importante — extensível (ver G9).
4. **As regras invioláveis de engenharia** (Doc 09 §5 e §9): chaves só no servidor, sem `localStorage`, sem `any`, sem Prisma em Client Component, mapas cacheados, Zustand no grid. Mantêm a qualidade técnica.
5. **O grid 9×4 fixo e nomeado** e o fluxo de Popover de fricção zero (Docs 02 §C, 05 §4). Operacionalmente correto.
6. **A separação dado estático (mapa natal) vs. dado dinâmico (tiragem do dia)**, com cálculo único no cadastro. Princípio certo.

---

## 3. Inconsistências Internas (corrigir)

| # | Onde | Problema | Correção |
|---|---|---|---|
| I1 | Doc 01 §8 (l.105-106) e Doc 05 §1.1 inteira | Paleta antiga **dourado/âmbar + esmeralda**. A identidade vigente é **laranja + azul royal** (Cigano Ramiro). | Migrar tokens e todas as referências de cor. Valores prontos na G2. |
| I2 | Doc 07 (S3.5 l.345, S4.3 l.411,418-419) | Ainda manda "pulsa em âmbar" e "cores âmbar/esmeralda". | Trocar por laranja/azul royal ao migrar a paleta. |
| I3 | Doc 06 §1 (l.11) | "A IA **nunca** recebe perguntas abertas." Contradiz diretamente o motor de Q&A da visão. | Reescrever: perguntas abertas são aceitas **na camada de consulta** e **roteadas deterministicamente** às casas; o motor por-casa segue determinístico. (Ver G5.) |
| I4 | Doc 00 (índice §9-21) | A tabela de índice lista 01–08 e **omite o Doc 09** (Master Prompt). | Adicionar 09 (e os novos docs 10–15) ao índice. |
| I5 | Doc 01 §1 (l.11) | Usa "Geomancia dos Odus"; sua metodologia é **jogo de búzios** (merindilogun) por casa. | Padronizar terminologia para "búzios/Odus" em toda a doc, ou definir "geomancia" explicitamente no glossário. |
| I6 | Doc 06 §3.3 (l.649) | Modelo Anthropic fixo `claude-sonnet-4-6`. | Tornar o nome do modelo configurável por env; documentar que Claude é o fallback (alinhado ao Doc 09 §4). |

---

## 4. Lacunas vs. a Visão — com correção concreta

### G1 — Identidade "Cigano Ramiro" ausente dos documentos
A identidade de marca (consagração ao Cigano Ramiro, significado dual das cores, tom místico-tecnológico, persona do Oráculo no espírito de Ramiro) só existe na instrução de projeto, não nos documentos técnicos. **Fix:** inserir uma seção de Identidade em 01 e no design system de 05; refletir o espírito na persona do system prompt (06/09). Recomendo um doc dedicado (13) para não diluir.

### G2 — Paleta antiga → laranja + azul royal (tokens prontos)
**Fix (substituir o bloco de cores do Doc 05 §1.1 por estes tokens de partida):**

```css
:root {
  /* Backgrounds — azul-noite (harmoniza com o royal) */
  --bg-canvas:   #0A0E1A;
  --bg-surface:  #111726;
  --bg-elevated: #1A2236;
  --bg-border:   #2A3550;

  /* Primária — LARANJA (Ramiro: luz, fogo, movimento, abertura de caminhos) */
  --accent-orange:        #F97316;
  --accent-orange-bright: #FB923C;
  --accent-orange-dim:    #C2410C;
  --accent-orange-glow:   rgba(249,115,22,0.18);

  /* Secundária — AZUL ROYAL (Ramiro: profundidade, mistério, nobreza, proteção) */
  --accent-royal:        #2547D0;
  --accent-royal-bright: #3B5BDB;
  --accent-royal-dim:    #1E3A8A;
  --accent-royal-glow:   rgba(37,71,208,0.18);

  /* Alerta — mantém */
  --accent-alert: #F43F5E;

  /* Texto */
  --text-primary:  #F5F7FF;
  --text-secondary:#9AA7C7;
  --text-muted:    #56618A;
}
```

**Mapeamento semântico recomendado:** laranja = elementos *ativos* (casa preenchida, glow do slot, botão "Gerar Dossiê", títulos `h2` de casa, palavra-chave de destaque); azul royal = *estrutura e profundidade* (badges astrológicos, badge do Odu, glows internos, linha-síntese em itálico). Isso mantém o contraste "fogo acende sobre a profundidade" que a identidade pede. As variantes de badge (Doc 05 §4.2, l.224-227) devem ser remapeadas para tons de royal/laranja em vez de blue/purple/amber/emerald.

### G3 — Mapas natais incompletos (a visão exige "completos, nunca superficiais")
Os mapas especificados em Docs 02/04 são mais rasos do que a regra inegociável da visão. Faltas concretas por mapa:

**KabalisticMap (Doc 04 §2.2) — adicionar:**
- `impression` (Número de Impressão / consoantes do nome) — ausente.
- `destiny` cabalístico — definir se é distinto de `expression` (a visão lista "Destino" e "Expressão" separadamente; hoje só há `expression` e `mission`).
- `pinnacles` (Pináculos / ciclos de realização) — hoje só há `lifeCycles`.
- `personalCycles: { personalDay, personalMonth, personalYear }` — **ausente e crítico** para a consulta interativa responder "o que está acontecendo agora".
- `rulingArcana` (Arcanos regentes / correspondência com o Tarô) — ausente.
- `gematria` — ausente.
- `karmicLessons` distinto de `karmaicDebts`, se forem coisas diferentes no seu método.

**TantricMap (Doc 04 §2.3) — resolver e completar:**
- **Conflito de definição:** a instrução de projeto diz `Destino = data completa` e `Caminho Total = ...`; o Doc 04/07 calcula `destiny` a partir do **ano** (1+9+8+6→6) e `tantricPath` a partir da **data completa** (→7). São rótulos trocados. **Precisa de decisão sua** (ver §5, D2).
- Completar o framework dos **corpos** (Físico, Prânico etc.) de forma explícita, não como dicionário genérico `tantricBodies`.

**AstrologyMap (Doc 04 §2.1) — adicionar:**
- `elements: { fire, earth, air, water }` (contagem/distribuição) — ausente, exigido pela visão.
- `modalities: { cardinal, fixed, mutable }` — ausente, exigido pela visão.
- Opcional: rótulo `harmony | tension` em cada aspecto (hoje só há tipo + orbe).

Todas essas adições precisam ecoar em: o schema/JSON (Doc 04), as histórias de cálculo (Doc 07 S2.2–S2.4) e — quando relevante a alguma casa — a Matriz (Doc 06).

### G4 — `CORRELATION_MAP` codificado só para 3 de 36 casas
Doc 06 §3.1 traz o objeto tipado apenas para as casas **1, 4 e 34**; a linha 455 diz literalmente `// ... continua para todas as 36 casas`. A fonte existe (a prosa da §2 cobre as 36), mas **transcrever 33 entradas à mão é o ponto mais frágil para um agente** — alto risco de erro de `extractionKeys`. **Fix:** escrever o `correlation-map.ts` completo (36 entradas) como artefato pronto, derivado da §2 e do Doc 09 §3.

### G5 — Motor de Consulta Interativa (Q&A) não especificado
É a maior expansão da sua visão e **não existe em nenhum documento**. Para implementar mecanicamente, um doc dedicado (12) precisa definir:
- **Modelo de dados:** `Consultation`/`ChatThread` + `ChatMessage` ligados a um `Reading` (a conversa herda todo o contexto da leitura).
- **Roteador de temática (inverso da Matriz):** tabela `tema → casa(s) primária(s) + secundária(s) + aspectos natais`. Sua visão já dá os exemplos-âncora (sexualidade→7+Lilith+8ª; dinheiro→34+2ª; amor→24+Vênus/Lua; família→4; trabalho→35; decisões→22+Nodos). Falta formalizar a taxonomia completa de temas.
- **Contrato de contexto (RAG fechado):** a resposta é ancorada em (1) o dossiê já gerado, (2) os quatro mapas, (3) a carta+Odu das casas roteadas. Nunca conhecimento aberto.
- **Persona e guarda-corpos:** mesma persona do Oráculo, 2ª pessoa, sem determinismo médico/jurídico/financeiro, coerência absoluta com o dossiê.
- **API:** `POST /api/consult` (streaming), recebe `readingId + pergunta + histórico`.
- **Resolver I3** (a frase "nunca perguntas abertas").

### G6 — Algoritmos de cálculo não são determinísticos o bastante
"Mecânico" exige zero ambiguidade. Hoje faltam:
- **Tabela de conversão alfanumérica completa.** Doc 07 S2.2 (l.163) diz "A=1…Z=9, conforme método cabalístico" — mas não dá a tabela, e "método cabalístico" é ambíguo (Pitagórico 1-9? Cabalístico/Caldeu? variantes BR divergem). **Precisa da tabela exata.**
- **Regras de vogais/consoantes e acentuação.** Y é vogal? Como tratar Ã, Õ, Ç, letras acentuadas e nomes com hífen? O Doc 07 só diz "incluindo acentuadas".
- **Dom Divino tântrico:** o exemplo `1986 → 8+6=14 → 5` usa só os **dois últimos dígitos** (86), mas o texto diz "reduzir o ANO". A regra exata precisa ser fixada.
- **Números mestres:** quando 11/22/33 são preservados e em quais campos.
**Fix:** doc 11 (Referência de Cálculo) com tabelas completas, regras de borda e exemplos resolvidos.

### G7 — Tabela data → Odu de Nascimento ausente
Docs 02 §B.2.4 e 03 referenciam `calculateBirthOdu(date)` "conforme tabela fixa", mas **a tabela/algoritmo não existe em nenhum lugar**. Não há padrão universal — é uma escolha de metodologia **que só você pode definir** (a do Cigano Ramiro). Sem ela, o motor do Odu Natal não pode ser implementado. **Bloqueador de conteúdo.**

### G8 — Lista dos 16 Odus precisa de validação canônica
A tabela do Doc 04 §5.2 tem grafias/regências que variam entre tradições (ex.: "Etogundá", "Ejiokô", "Owarin", "Ofurufu", "Ossá"). Como a precisão do conteúdo oracular é o produto, a lista precisa ser **validada por você** segundo a linhagem que você opera, antes de virar constante imutável.

### G9 — Extensibilidade (I-Ching e novos sistemas) não documentada
Você levantou querer, no futuro, integrar **I-Ching** e outros mapas. A arquitetura atual já suporta isso bem (basta um bloco por sistema em `CorrelationEntry` + um `<sistema>Map` no `Client`), mas **isso não está escrito**. **Fix:** documentar um "Contrato de Extensibilidade Oracular" (doc 14 ou seção em 03): adicionar um sistema = (1) campo `Map` no `Client`, (2) calculador, (3) bloco de delegação por casa na Matriz, (4) extração no PromptBuilder, (5) entrada no roteador de temas. Recomendo marcar I-Ching como **Fase 2+ (fora do MVP)**, salvo decisão sua.

### G10 — Modelo de dados não cobre Q&A nem mapas enriquecidos
Decorrência de G3 e G5: o schema do Doc 04 precisa ganhar (a) os campos novos dos mapas e (b) os modelos `Consultation` + `ChatMessage`. Sem isso, a migração inicial nasce incompleta.

### G11 — Base de conteúdo oracular não curada (risco de alucinação)
As 36 cartas têm `keywords` curtas (Doc 04 §5.1) e os significados profundos ficam por conta do LLM em tempo real. Para garantir "nunca genérico", recomendo um **glossário canônico** (doc 15) com o significado-base validado de cada carta, cada Odu e correspondências — injetado no prompt como verdade, em vez de confiar na memória do modelo.

---

## 5. Decisões de Conteúdo — Dependem de Você (bloqueadoras)

Estas não posso resolver sozinho; são definições da sua metodologia:

- **D1 — Tabela alfanumérica da Numerologia Cabalística** (qual método/valores exatos) + regra de vogais/Y/acentos. *(desbloqueia G6)*
- **D2 — Definições tântricas:** o que é exatamente `Destino` vs `Caminho Total` vs `Dom Divino` (resolver o conflito da G3) e a fórmula exata de cada um. *(desbloqueia G3/G6)*
- **D3 — Tabela/algoritmo data → Odu de Nascimento.** *(desbloqueia G7)*
- **D4 — Validação da lista dos 16 Odus** (grafia, numeração, orixás, essência) na sua linhagem. *(desbloqueia G8)*
- **D5 — Escopo do Q&A:** entra no MVP (Fase 2) ou só depois? *(define G5/roadmap)*
- **D6 — I-Ching:** documentar como extensão futura (recomendado), incluir já, ou deixar de fora? *(define G9)*

---

## 6. Documentos a Criar e Atualizar

**Criar:**
- **10 — Revisão & Gap Analysis** (este documento).
- **11 — Referência de Cálculo Determinístico** (tabelas alfanuméricas, regras de vogais/acentos, fórmulas passo a passo de cada número cabalístico e tântrico, números mestres, exemplos resolvidos; algoritmo/tabela data→Odu; tabela validada dos 16 Odus). *Desbloqueia toda a Fase 2 de cálculo.*
- **12 — Motor de Consulta Interativa (Q&A)** (modelo de dados, roteador de temas, contrato de contexto, persona/guarda-corpos, API). *Resolve a maior expansão da visão.*
- **13 — Identidade Cigano Ramiro & Design System v2** (paleta laranja+azul royal com tokens, tipografia, tom, mapeamento semântico das cores). *Pode, alternativamente, virar atualização de 01+05.*
- **14 — Contrato de Extensibilidade Oracular** (plugin para I-Ching e novos sistemas). *Opcional; pode ser seção no 03.*
- **15 — Glossário Oracular Canônico** (significados-base validados das 36 cartas e 16 Odus). *Reduz alucinação.*

**Atualizar:**
- **01** — seção de identidade Ramiro + paleta.
- **02** — completar exigências dos mapas; adicionar Módulo F (Q&A) conforme D5.
- **04** — schema: mapas enriquecidos + modelos `Consultation`/`ChatMessage`.
- **05** — paleta v2 + tela de chat da consulta.
- **06** — resolver I3 (perguntas abertas); inserir `correlation-map.ts` completo (36); referenciar a camada de Q&A.
- **07** — refs de cor; histórias novas (cálculos enriquecidos + épico de Q&A).
- **08** — onde Q&A e mapas enriquecidos entram nas fases.
- **09** — Master Prompt: adicionar Q&A, extensibilidade e paleta corrigida.
- **00** — índice com 09 e 10–15.

---

## 7. Plano de Ação Priorizado (ondas)

**Onda 0 — Decisões (você):** responder D1–D6. Sem D1–D4, a Fase 2 do roadmap não roda.

**Onda 1 — Desbloqueio mecânico (eu, sem depender de você):**
1. Gerar `correlation-map.ts` completo (36 entradas) — G4.
2. Migrar paleta nos docs 01/05/07 e escrever o doc 13 — G1/G2.
3. Escrever o doc 12 (Q&A) e o doc 14 (extensibilidade) em nível de spec — G5/G9.
4. Atualizar schema do Doc 04 com mapas enriquecidos + modelos de Q&A — G3/G10.

**Onda 2 — Conteúdo determinístico (eu, após D1–D4):**
5. Escrever o doc 11 (cálculos) com suas tabelas — G6/G7/G8.
6. Escrever o doc 15 (glossário canônico) — G11.

**Onda 3 — Consolidação:**
7. Atualizar 02, 06, 07, 08, 09, 00 para refletir tudo acima e reconciliar contradições.

Ao fim da Onda 3, a base fica em prontidão mecânica: um agente consegue ir do setup ao Q&A seguindo os docs sem decisão em aberto.
