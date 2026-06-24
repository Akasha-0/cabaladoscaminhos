# Contexto do Projeto

O mapa canonico do repositorio agora vive em `docs/00_README.md`.

- Indice mestre: `docs/00_README.md`
- Visao do produto: `docs/25_visao-akasha.md`
- Arquitetura tecnica: `docs/03_architecture-spec.md`
- Pesquisa consolidada em docs: `docs/pesquisa/README.md`
- Trilha research-first: `.autonomous/VISION.md` e `.autonomous/app_spec.txt`

---

## Glossario de Termos Canonicos

### Mandala Akáshica

A Mandala e o artefato central da experiencia Akasha — uma visualizacao SVG dos 5 Pilares da existencia, onde cada camada representa um sistema oracular. O usuario interage com a Mandala para explorar seu perfil nos 5 sistemas (Odus, Cabala, Tantra, Astrologia, I Ching).

### 5 Pilares (Camadas da Mandala)

| Pilar | Camada SVG | Dominio | Descricao |
|-------|-----------|---------|-----------|
| Pilar 1 | Cabala | Numerologia Cabalistica | Arvore da Vida, Sefirot, Numeros de vida |
| Pilar 2 | Astrologia | Mapa Natal | Signos, planetas, aspectos |
| Pilar 3 | Tantra | Corpos Energeticos | 11 corpos, chakras, Alma/Karma/Destino |
| Pilar 4 | Odus | Ifa/Candomble | Odu de nascimento, Orixa, Preceitos |
| Pilar 5 | I Ching | Oraculo Chines | Hexagrama, trigramas |

### KabalisticMap

O mapa cabalistico e gerado por `buildKabalisticMap()` em `@akasha/core-cabala`. Contem os numeros de vida (Life Path, Expression, Motivation, Mission, Impression) e meta-informacoes cabalisticas (sefira regente, letra hebraica, taro regente).

Campos exportados para a Mandala (Nivel 3):
- Life Path, Expression, Motivation, Mission, Impression
- Sefira Regente, Letra Hebraica, Taro Regente
- 4 Desafios (first, second, main, last)
- 4 Pinalculos (first, second, third, fourth)
- 3 Ciclos de Vida (first, second, third)

### Sefira / Sefirot

As 10 emocoes da Arvore da Vida Cabalistica. Cada Sefira tem: nome, nome divino, cor, anjo regente, qualidade, essencia, letra hebraica, elemento. Mapeadas por numero de Life Path em `SEFIROT_PATHS`.

### ONE Akasha Profile

Sistema de 9 tipos de personalidade derivado da correlacao dos 5 pilares (inspirado em Human Design + Gene Keys). Gerado por `synthesis-engine.ts` + `narrative-generator.ts` (template-based, sem LLM). Mostra: tipo, estrategia, autoridade, diretiva diaria, area de crescimento, armadilha de sombra.

### TantricMap

O mapa tantrico e gerado por `buildTantricMap()` em `@akasha/core-tantra`. Contem Alma, Karma, Dom Divino, Destino, Caminho Tantrico e os 5 corpos numerologicos (fisico, pranico, emocional, mental, espiritual) derivados da data de nascimento. Todos os 11 corpos sao ativos (nao ha logica de atividade/inatividade implementada).

### AstrologyMap

O mapa astrologico e gerado por `getBirthChart()` em `@akasha/core-astrology`. Contem signo ascendente, Meio do Ceu, planeta dominante, posicoes dos 10 planetas e aspectos. Para a Mandala, expomos: ascendente, meio do ceu, planeta dominante, 10 planetas nos signos e 5 aspectos principais.

### OduBirth

O Odu de nascimento e o sistema oracular de Ifa/Candomble. Cada Odu tem: nome, orixa regente, elemento, preceitos, quizilas. O modelo existe em `@akasha/core-odux`.

### Fluxo de Dados da Mandala

```
mandala/page.tsx (Server)
  └─> /api/akasha/mandala/route.ts
       └─> buildKabalisticMap()   [core-cabala]
       └─> getBirthChart()        [core-astrology]
       └─> buildTantricMap()      [core-tantra]
       └─> getBirthOdu()          [core-odux]
       └─> computeBirthHexagram() [core-iching]
       Retorna: MandalaData (formato simplificado)
  └─> MandalaChart.tsx (Client)
       ├─> SVG de 5 camadas concéntricas
       └─> InfoPanels interativos (resumo + expandido)
  └─> MandalaNarrativeLoader
       └─> /api/akasha/daily/route.ts
            └─> buildDailyContent()
                 └─> synthesis-engine.ts (template-based)
```

### Levels de Profundidade por Pilar

| Pilar | Nivel | Conteudo |
|-------|-------|----------|
| Cabala | 3 | Life Path, Expression, Motivation, Mission, Impression + Sefira, Letra, Taro + Desafios (4) + Pinalculos (4) + Ciclos (3) |
| Astrologia | Planetas+Aspectos | 10 planetas nos signos + 5 aspectos principais + anel zodiacal expandido |
| Tantra | 3 | Alma/Karma/Dom/Destino + significado dos 5 corpos numerologicos |
| Odus | 2 | Odu + Orixa + Elemento + Preceitos + Quizilas + Mythos/Archetype |
| I Ching | 1 | Hexagrama + Trigramas + Linhas |

### Hierarquia de InfoPanel

Cada camada tem dois niveis de detalhe:
- **Resumo** (ao clicar): 4-6 campos principais
- **Expandido** (botao "Ver mais"): Todos os campos do nivel

### Design Visual

Estilo **Elegante/Mistico**: fundo escuro, paleta dourado + cobre, tipografia serifada para titulos, animacoes suaves. Centro da Mandala pulsa com energia do Odu. Animacao de entrada: a Mandala desenha a si mesma ao carregar.

### Implementacao em Fasess

| Fase | Escopo | Dependencias |
|------|--------|-------------|
| 1 | API route: expor todos campos KabalisticMap (Nivel 3) + 10 planetas + aspectos | Nenhuma |
| 2 | MandalaChart: InfoPanels com dois niveis (resumo + expandido) | Fase 1 |
| 3 | SVG Layer 4: anel zodiacal expandido com 10 planetas | Fase 1, 2 |
| 4 | Campos Tantricos: significados reais dos 5 corpos numerologicos | Fase 1 |
| 5 | Orientacao pratica: Mandato + Ritual + Dashboard de energia | Fase 1, 2 |
| 6 | Animacao de entrada + centro respirante | Fase 2 |

---

## Wave Status Log

Historico de decisoes tomadas em sessoes de grill. Cada Wave marca um
marcador duravel: o que foi entregue, o que ficou pendente, e o que
foi decidido para a proxima Wave. Esta secao NAO substitui os
`.hermes/plans/wave-N-plan-actual-*.md` files — esses sao fonte de verdade.
Aqui fica apenas o resumo executivo.

### Wave 7 — fechada 2026-06-24

**Escopo:** 3 fronts paralelos (A=Engine improvements, B=Hardening docs,
C=Hygiene typecheck). 11 cards totais.

**Entregue:** 16 commits merged em `main @ 6ce508bd`. Typecheck 42 → 0.
Tratamento tests 9 → 18. 3 ADRs/legais criados (ADR 0006 MCP, Advogado PI
checklist, LGPD audit). 1 bug de producao corrigido (`ewe-database.ts`
tipo `neutro`).

**Pendencias nao-bloqueantes (Wave 8 follow-up):**
- 62 test failures pre-existentes (Layer2Kabala/Layer4Astrology testes
  desatualizados apos `f45ac426`; auth-jwt fixtures quebrados; prisma
  tests; MandalaInfoPanels; credit-reconciliation)
- LGPD/DPA blockers de producao (DPA Anthropic pendente; DELETE /profile
  com cascata faltando; conexoes sem disclaimer de terceiros)
- ADR 0006 MCP e so types — server real nao implementado
- Brief Advogado PI pronto em `docs/legal/PROTOCOLO_REVISAO_JURIDICA.md`
  (R$ 2-5k, ~5-10h, aguardar contratacao)

### Wave 8 — decidida 2026-06-24 (grill sessao)

**Escopo decidido (root decision):** Fix 62 test failures + LGPD/DPA
blockers tecnicos + MCP server skeleton implementation. 3 fronts paralelos.

**Decomposicao decidida (questao 2 do grill):**
- Wave 8.1 = Front C-a (~30 min): test fixtures quebrados por mudancas
  recentes, especialmente Layer2Kabala/Layer4Astrology apos `f45ac426`.
  Esperado fechar ~30 dos 62 errors. Blocking para Wave 8.2.
- Wave 8.2 = Front C-b (~60 min): investigar e consertar os 32 errors
  restantes. Pode revelar erros arquiteturais (Wave 9 follow-up).

**Pendencias para resolver no grill Wave 8 (questoes restantes):**
- Q3 (em aberto): decompor Front A (LGPD/DPA) e Front B (MCP server)

**Q3 (2026-06-24, confirmada):**
- Wave 8.3 = Front A (3 sub-tarefas tecnicas LGPD/DPA) ~60 min single subagente
- A.1 = DELETE /profile com cascata (User + Caminhante + Caminhada + Sessao +
  MapaCalculo + GrimorioPessoal + MapaRelacional) — LGPD Art. 18
- A.2 = docs/legal/DPA_ANTHROPIC.md template + checklist Art. 33
  (transferencia internacional) + auditoria rotas LLM
- A.3 = disclaimer de terceiros em feature Conexoes + verificacao
  consent flow (signup → first Caminhante → first Sessao)
- Subagente DEVE cobrir A.1 com testes (cascade + dry-run + audit log)

**Q4 (2026-06-24, confirmada):**
- Wave 8.4 = Front B (MCP server skeleton + Mentor route integration) ~60 min
- B.1 = packages/mcp/src/server.ts runtime types (AkashaMcpServer class com
  start() lazy, in-process, sem transporte real ainda)
- B.2 = apps/akasha-portal/src/app/api/mentor/ask/route.ts lazy import
  @akasha/mcp + graceful degradation (registry vazio → cai pra LLM direto)
- B.2 inclui 1 teste novo cobrindo "registry empty → fallback direct LLM"
- MCP server permanece STUB (sem stdio/http transport, sem multi-tenant
  context, sem tools reais) — esses sao Wave 9+ quando tools concretas
  forem registradas
