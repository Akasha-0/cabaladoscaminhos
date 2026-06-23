# Proposal: D-ZZZ Pilar 7 — Espectro de Transformacao (traduzido)

## Context

Apos realignment (Akasha = ferramenta do Zelador — `docs/25_visao-akasha.md` revisada), tu decidiu adicionar **Human Design e Gene Keys como Pilares 6 e 7** (decision via grill 2026-06-23).

**Pilar 7 (Gene Keys)** — sistema que mapeia o espectro **Sombra → Dom → Siddhi** para cada uma das 64 portas (correspondentes aos 64 hexagramas do I Ching). E mais **filosofico/narrativo** que Pilar 6 (Human Design, que e mais tipologico/operacional).

**Problema legal:** Mesmo do Pilar 6 — Gene Keys tem copyright ativo. 4 guardrails do ADR 0002 aplicam:
1. Renomear termos (Sombra → Dom → Siddhi → manter, ja genericos)
2. Escrever textos do zero
3. Visualizacao propria
4. Disclaimer legal

**Research basis:**
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` (ADR 0002, accepted)
- `.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md` (Research 2)

## Decision

**Implementar Pilar 7 como "Espectro de Transformacao"** — captura a funcao do Gene Keys (espectro sombra/dom/siddhi aplicado as 64 portas) sem copiar terminologia especifica, Venus Sequence, Golden Pathway, ou textos das chaves.

### Nome publico (universalista)

- **"Pilar 7 — Espectro de Transformacao"** (oficial)
- **Tagline:** "64 chaves para entender onde voce esta preso, onde pode brilhar, e onde pode transcender"

### Estrutura conceitual

**Cada uma das 64 chaves (= 64 hexagramas I Ching) tem 3 estagios:**

1. **Sombra** (o que te prende) — medo, sombra, padrao destrutivo
2. **Dom** (o que voce pode brilhar) — presente, dom cultivado
3. **Siddhi** (a transcendência) — quando transcende o dom, vira sabedoria pura

**Para o consulente:**
- Sombra → identificar **onde esta travado**
- Dom → **cultivar** essa qualidade conscientemente
- Siddhi → meta aspiracional, mas **nao prescritiva** (cada um chega quando chega)

### Sinergia com Pilar 5 (I Ching)

**A numeracao das 64 chaves Gene Keys = a numeracao dos 64 hexagramas I Ching (King Wen sequence).** Pilar 7 reusa Pilar 5:

- Pilar 5 calcula o hexagrama natal do consulente (`DailyReading.hexagram` int 1-64, ja em D-041)
- Pilar 7 atribui **Sombra/Dom/Siddhi** baseado nesse hexagrama

**Insight universalista:** o Pilar 5 (I Ching) e o "esqueleto numerico". O Pilar 7 (Gene Keys traduzido) e a "interpretacao narrativa" (3 camadas por chave). Pilar 6 (Human Design traduzido) e a "tipologia estrutural".

### Relacao com os outros Pilares

| Pilar | Funcao | Sinergia com Pilar 7 |
|---|---|---|
| 1 Cabala | Numerologia Cabalistica | Pilar 7 amplifica via chaves |
| 2 Astrologia | Mapa Natal | Aspectos planetarios afetam Sombra/Dom |
| 3 Tantra | Corpos Energeticos | Siddhi alinhado com chakras elevados |
| 4 Odu | Ancestralidade | Sombra tem raiz ancestral |
| 5 I Ching | Numeracao das 64 chaves | **Estrutura do Pilar 7** |
| 6 Mapa Energetico | Tipologia | Correlacao tipo ↔ dom |
| 7 Espectro de Transf. | Narrativa | **Sinergia maxima** |

## Proposed Changes

### 1. `schema.prisma` — 3 models novos (Wave 4)

```prisma
// Adicionar ao schema.prisma depois de Pilar6Calculo

model Pilar7Calculo {
  id                String   @id @default(cuid())

  // FKs (escopo multi-tenant — alinha D-XXX)
  zeladorId         String
  zelador           User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId       String
  caminhada         Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // Pilar 7 calculation result
  // 64 chaves (1-64 = I Ching) — cada uma com 3 estagios
  estagios          Pilar7Estagio[]        // relation
  estagioAtual      EstagioTransformacao   // Sombra | Dom | Siddhi (onde esta HOJE)
  estagioPredominio Int                    // 1-64 (chave dominante na vida atual)
  textoSombra       String                 // texto proprio (do zero — Guardrail 2)
  textoDom          String
  textoSiddhi       String

  // Auditoria
  versaoCalculo     String                 // ex: "v1"
  calculadoEm       DateTime               @default(now())
  atualizadoEm      DateTime               @updatedAt

  @@unique([zeladorId, caminhadaId, versaoCalculo])
  @@index([zeladorId, versaoCalculo])
  @@map("pilar7_calculos")
}

enum EstagioTransformacao {
  sombra
  dom
  siddhi
}

model Pilar7Estagio {
  id                String   @id @default(cuid())

  // FKs
  zeladorId         String
  zelador           User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  calculoId         String
  calculo           Pilar7Calculo @relation(fields: [calculoId], references: [id], onDelete: Cascade)

  // Identificacao da chave
  chaveNumero       Int                    // 1-64 (corresponde a hexagrama I Ching)
  chaveNome         String                 // nome proprio (do zero — Guardrail 2)
  estagio           EstagioTransformacao   // qual dos 3 estagios esta chave representa no consulente
  texto             String                 // texto proprio (do zero)

  // Sequence position (Gene Keys tem "Venus Sequence" + "Golden Pathway" — renomeados)
  sequencePosition  Int?                   // 1-22 (Sequence Venusiana — 22 chaves)
  pathwayPosition   Int?                   // 1-11 (Caminho Dourado — 11 chaves)

  @@index([zeladorId, calculoId])
  @@index([zeladorId, chaveNumero])
  @@map("pilar7_estagios")
}
```

### 2. App-layer: Pilar 7 calculator (`packages/core-pilar7/` NOVO)

**Estrutura proposta:**
```
packages/core-pilar7/
├── src/
│   ├── espectro.ts               // 3 estagios por chave
│   ├── chave.ts                  // calculo da chave natal (1-64)
│   ├── sequence.ts               // Sequence Venusiana (22 chaves)
│   ├── pathway.ts                // Caminho Dourado (11 chaves)
│   ├── calcular.ts               // orquestrador
│   ├── textos/                   // 64 chaves × 3 estagios = 192 textos proprios
│   │   ├── chave-01-sombra.md
│   │   ├── chave-01-dom.md
│   │   ├── chave-01-siddhi.md
│   │   └── ...
│   └── types.ts
├── package.json
└── README.md
```

**Inspiracao algoritmica:**
- **Chave natal** — derivada do Pilar 5 (I Ching natal). 1-64 direto.
- **Estagio atual** — heuristica baseada em idade + fase de vida + Pilar 4 (Odu, que tem informacao sobre estagio de vida). NAO copia Gene Keys' "Program" + "Mind" + "Body" calculation — isso e complexo demais para Wave 4.
- **Sequence + Pathway** — posicoes sao **literais** (Sequence tem 22 chaves, Pathway tem 11). Implementacao propria (sequencia numerica, nao copia texto).

### 3. Migracao Pilar 7 (Wave 4)

```sql
-- Migration: 041_pilar7_espectro_transformacao
CREATE TYPE "EstagioTransformacao" AS ENUM ('sombra', 'dom', 'siddhi');

CREATE TABLE "pilar7_calculos" (...);
CREATE TABLE "pilar7_estagios" (...);

CREATE INDEX idx_pilar7_calculos_zelador ON pilar7_calculos("zeladorId");
CREATE INDEX idx_pilar7_estagios_zelador ON pilar7_estagios("zeladorId");
```

## Architectural Decisions (inline)

| # | Decision | Justification | Reversibility |
|---|---|---|---|
| D-ZZZ.1 | Nomes universalistas (Sombra/Dom/Siddhi mantidos, ja genericos) | Termos sao tradicao antiga, nao-protegiveis | Trivial |
| D-ZZZ.2 | Textos escritos do zero (Guardrail 2) | Sem copyright | Hard — reescrever 192 textos |
| D-ZZZ.3 | 64 chaves = 64 hexagramas I Ching (sinergia com Pilar 5) | Reusa Pilar 5 ja calculado | Trivial |
| D-ZZZ.4 | Sem "Program/Mind/Body calculation" (heuristica simples) | Complexidade do Gene Keys original alta demais; simplificacao Wave 4 | Medium — Wave 5+ adicionar |
| D-ZZZ.5 | Venus Sequence + Golden Pathway renomeados (Sequence Venusiana + Caminho Dourado) | Traducao literal, nao copia | Trivial |
| D-ZZZ.6 | Visualizacao propria (Guardrail 3) | Mandala SVG com 64 chaves em nova camada | Hard — design |
| D-ZZZ.7 | Disclaimer legal no app (Guardrail 4) | Boa-fe + protecao | Trivial |

## Open Dependencies

- **Pilar 5 (I Ching)** — **applied**. Pilar 7 reusa `DailyReading.hexagram` int 1-64.
- **D-XXX** (Schema Multi-Tenant) — **Wave 3** (pre-requisito). Pilar7Calculo depende de `withCaminhanteContext()`.
- **D-041** (Caminhante) — **applied**.
- **D-YYY** (Pilar 6) — **Wave 4**. Pilar 6 e 7 sao correlatos (Wave 4 implementa ambos).
- **64 textos proprios** — **content production task** (escrita de 192 textos = 64 chaves × 3 estagios). Pode ser Wave 4 ou Wave 5+.

## Migration Plan

1. **Wave 2 (now)**: Este proposal aceito (revisao tua)
2. **Wave 4**: Implementar `packages/core-pilar7/` (engine)
3. **Wave 4**: Apply migration `041_pilar7_espectro_transformacao`
4. **Wave 4**: Adicionar campo `pilar7` em `MapaCalculo` (D-XXX schema)
5. **Wave 4**: Integrar no chat MCP (ADR 0004)
6. **Wave 5+**: Produzir 192 textos proprios (ou contratar escritor + revisar com Cumino/Saraceni)
7. **PRE-LANCAMENTO**: Validacao juridica (P0 do Research 2)

## Risk and Rollback

- **Risk:** 192 textos proprios = **trabalho de escrita significativo**. Pode levar meses se feito por 1 pessoa. Mitigacao: contratar escritor ou aceitar implementacao parcial (Wave 4 = 16 chaves prioritarias, Wave 5+ = restante).
- **Risk:** Mesmo com termos genericos, "Sombra → Dom → Siddhi" pode ser considerado marca registrada. Mitigacao: parecer juridico P0 antes de lancamento.
- **Risk:** Sem "Program/Mind/Body calculation", Pilar 7 perde precisao. Mitigacao: documentado como limitacao conhecida Wave 4; Wave 5+ adicionar se uso real mostrar valor.
- **Rollback:** `git revert` + DROP TABLE.

## Verification

- `pnpm exec prisma validate` passa
- `pnpm --filter core-pilar7 test:run` 100% passing
- **Smoke test:** Pilar7Calculo de um consulente deve retornar chaveNatal + estagios + textoSombra + textoDom + textoSiddhi
- **Trade-off check:** comparar texto de Pilar 7 com Gene Keys original — **zero copia literal** (auditar com `diff`)
- **Content quality:** Wave 4 entrega com placeholder texts; Wave 5+ substitui por textos finais proprios

## Approval Required

Aprovacao tua antes de Wave 4 implementar.

---

**Author:** vision realignment session + research consolidation (2026-06-23).
**Anchors:**
- `docs/25_visao-akasha.md` (visao revisada)
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` (ADR 0002, accepted)
- `.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md` (Research 2)
- `CONTEXT.md` (glossario: I Ching = 64 hexagramas, Odu = ancestralidade)
- `apps/akasha-portal/prisma/AGENTS.md:69-82` (migration protocol)
