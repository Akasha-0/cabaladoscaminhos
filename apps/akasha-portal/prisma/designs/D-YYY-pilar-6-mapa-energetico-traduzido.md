# Proposal: D-YYY Pilar 6 — Mapa Energetico Integrado (traduzido)

## Context

Apos realignment da visao (Akasha = ferramenta do Zelador — ver `docs/25_visao-akasha.md` revisada), tu decidiu adicionar **Human Design e Gene Keys como Pilares 6 e 7** do Akasha (decision consolidada via grill 2026-06-23 + research licensing).

**Problema legal:** Human Design e Gene Keys sao **sistemas comerciais com copyright ativo**. O research de licensing (`/home/skynet/cabala-dos-caminhos/.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md`) confirmou que a estrategia "traducao universalista" e juridicamente solida **somente** com 4 guardrails:
1. Renomear todos os termos
2. Escrever textos do zero
3. Visualizacao propria
4. Disclaimer legal

**Research basis:**
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` (ADR 0002, accepted)
- `.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md` (Research 2)

## Decision

**Implementar Pilar 6 como "Mapa Energetico Integrado"** — captura a funcao do Human Design (correlacionar mapas por tipo de energia + estrategia + autoridade) sem copiar terminologia, estrutura, ou visualizacao proprietarias.

### Nome publico (universalista)

- **"Pilar 6 — Mapa Energetico Integrado"** (oficial)
- **Tagline:** "Mapa que correlaciona como sua energia flui, qual sua estrategia natural e onde voce tem autoridade interna"

### Sub-componentes do Pilar 6

**1. Tipo Energetico** (4 tipos, renomeados):

| Original (Human Design) | Traducao universalista | Funcao |
|---|---|---|
| Generator | **Tipo: Iniciador** | Energia sustentada, responde ao mundo |
| Projector | **Tipo: Guia** | Energia focal, guia outros |
| Manifestor | **Tipo: Iniciador Aberto** | Energia de comecar, impacta primeiro |
| Reflector | **Tipo: Refletor** | Energia lunar, amostra ambientes |

**Implementacao:**
```typescript
// /apps/akasha-portal/src/lib/domain/pilar6/tipo.ts (NOVO)

export type TipoEnergetico =
  | 'iniciador'           // ex-Human Design Generator
  | 'guia'                // ex-Human Design Projector
  | 'iniciador_aberto'    // ex-Human Design Manifestor
  | 'refletor'            // ex-Human Design Reflector

export interface Pilar6Tipo {
  tipo: TipoEnergetico
  descricao: string                   // texto proprio (do zero)
  estrategia: string                  // descricao funcional (ver abaixo)
  autoridade: string                  // descricao (ver abaixo)
  centrosDefinidos: CentroEnergetico[] // centros ativos
  processadoEm: DateTime
  versaoCalculo: string               // ex: "v1"
}
```

**2. Estrategia** (4 estrategias, baseadas em COMO o tipo interage com o mundo):

| Original | Traducao universalista | Funcao |
|---|---|---|
| To Respond | **Esperar Convite** | Reage ao mundo; responde a chamados |
| To Inform | **Informar** | Impacta atraves de informacao, nao forca |
| To Initiate | **Iniciar** | Comeca coisas, sem pedir permissao |
| To Wait (lunar) | **Esperar Ciclo Lunar** (29 dias) | Espera o ciclo lunar para decisao |

**3. Autoridade** (6 autoridades internas — **baseada em timing biologico**, nao em chakras):

| Original | Traducao universalista | Base |
|---|---|---|
| Emotional | **Autoridade Emocional** | Ondas emocionais (clarify apos sleep) |
| Sacral | **Autoridade Sacral** | Resposta gut imediata |
| Splenic | **Autoridade Esplenica** | Instinto presente (nao sustentado) |
| Ego/Heart | **Autoridade Cardiaca** | "Quem sou eu?" — vontade |
| G-Center | **Autoridade de Identidade** | Direcao de vida (ambientes) |
| Lunar | **Autoridade Lunar** | Ciclo de 29 dias |

**Decisao tomada:** Autoridades que ja temos em D-041 (Emocional, Esplenica, Cardiaca) sao reutilizadas — **nao duplicamos modelagem**.

**4. Centros Energeticos** (9 centros — baseados em I Ching + Cabala, nao em chakras hindus):

| Original (Human Design) | Traducao universalista | Inspiracao |
|---|---|---|
| Head | **Centro da Inspiracao** | Cabala (Keter) |
| Ajna | **Centro da Mental** | Cabala (Hokhmah/Binah) |
| Throat | **Centro da Manifestacao** | I Ching (canal de expressao) |
| G-Center | **Centro da Identidade** | Astrologia (Ascendente) |
| Heart/Will | **Centro da Vontade** | Tantra (Anahata) |
| Solar Plexus | **Centro das Emocoes** | Tantra (Manipura) |
| Sacral | **Centro da Vitalidade** | Tantra (Svadhisthana) |
| Spleen | **Centro da Sobrevivencia** | Tantra (Muladhara, instinto) |
| Root | **Centro da Fundamentacao** | Tantra (Muladhara, base) |

**Decisao tomada:** Usar 9 centros alinhados com I Ching + Cabala + Tantra (sistematicas canonicas ja no Akasha), nao copiar nomesproprios do Human Design. Visualizacao propria (Guardrail 3 do ADR 0002).

**5. Canais + Portas** (correlacoes entre centros):

- **Canais** — 36 canais (correlacoes entre 2 centros via portas) — implementado como tabela `Canal` no schema (Wave 4).
- **Portas** — 64 portas (= 64 hexagramas do I Ching, ja implementado no Pilar 5). Reutilizar `DailyReading.hexagram` int (1-64).

## Proposed Changes

### 1. `schema.prisma` — 4 models novos (Pilares 6 — Wave 4)

```prisma
// Adicionar ao schema.prisma depois de MapaCalculo (D-XXX)

model Pilar6Calculo {
  id                String   @id @default(cuid())

  // FKs (escopo multi-tenant — alinha D-XXX)
  zeladorId         String
  zelador           User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId       String
  caminhada         Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // Pilar 6 calculation result
  tipo              TipoEnergetico    // 4 tipos
  estrategia        EstrategiaEnergetica  // 4 estrategias
  autoridade        AutoridadeEnergetica? // 6 autoridades (nullable se inconclusivo)
  centrosDefinidos  CentroEnergetico[]     // subset de 9 centros
  canais            CanalPilar6[]          // canais ativos
  textoTipo         String                  // texto proprio (do zero — Guardrail 2)
  textoEstrategia   String
  textoAutoridade   String?

  // Auditoria
  versaoCalculo     String               // ex: "v1"
  calculadoEm       DateTime             @default(now())
  atualizadoEm      DateTime             @updatedAt

  @@unique([zeladorId, caminhadaId, versaoCalculo])  // cache: 1 calculo por versao
  @@index([zeladorId, versaoCalculo])
  @@map("pilar6_calculos")
}

enum TipoEnergetico {
  iniciador
  guia
  iniciador_aberto
  refletor
}

enum EstrategiaEnergetica {
  esperar_convite
  informar
  iniciar
  esperar_ciclo_lunar
}

enum AutoridadeEnergetica {
  emocional
  sacral
  esplenica
  cardiaca
  identidade
  lunar
}

enum CentroEnergetico {
  inspiracao
  mental
  manifestacao
  identidade
  vontade
  emocoes
  vitalidade
  sobrevivencia
  fundamentacao
}

model CanalPilar6 {
  id                String   @id @default(cuid())

  // FKs
  zeladorId         String
  zelador           User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId       String
  caminhada         Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)
  calculoId         String
  calculo           Pilar6Calculo @relation(fields: [calculoId], references: [id], onDelete: Cascade)

  // Canal definition (par de portas + centros)
  portaA            Int                   // 1-64 (I Ching gate)
  portaB            Int                   // 1-64
  centroA           CentroEnergetico
  centroB           CentroEnergetico
  ativo             Boolean               // canal definido vs undefined
  tema              String                // ex: "Inspiracao → Manifestacao"

  @@index([zeladorId, calculoId])
  @@index([zeladorId, portaA])
  @@index([zeladorId, portaB])
  @@map("pilar6_canais")
}
```

### 2. App-layer: Pilar 6 calculator (`packages/core-pilar6/` NOVO)

**Estrutura proposta:**
```
packages/core-pilar6/
├── src/
│   ├── tipo.ts                    // tipo detection
│   ├── estrategia.ts              // estrategia derivation
│   ├── autoridade.ts              // autoridade inference
│   ├── centros.ts                 // 9 centros calculation
│   ├── canais.ts                  // 36 canais detection
│   ├── calcular.ts                // orquestrador
│   └── types.ts                   // TS interfaces
├── package.json
└── README.md
```

**Inspiracao algoritmica:**
- **Tipo detection** — combina `birthOdu` (Pilar 4) + `ascendente` (Pilar 2 Astrologia) + `centro_da_vitalidade` (ativo/inativo pelo MC canonico D-041)
- **Estrategia** — derivada do Tipo + estado dos centros
- **Autoridade** — baseada em MC (D-041 ja calculado) + I Ching linha mutavel (Pilar 5)
- **Centros** — 9 centros fixos, definidos/inativos baseado em MC + posicao astrologica
- **Canais** — quando 2 centros adjacentes sao definidos, o canal entre eles ativa

### 3. Migracao Pilar 6 (Wave 4)

```sql
-- Migration: 040_pilar6_mapa_energetico_integrado
CREATE TYPE "TipoEnergetico" AS ENUM (...);
CREATE TYPE "EstrategiaEnergetica" AS ENUM (...);
CREATE TYPE "AutoridadeEnergetica" AS ENUM (...);
CREATE TYPE "CentroEnergetico" AS ENUM (...);

CREATE TABLE "pilar6_calculos" (...);
CREATE TABLE "pilar6_canais" (...);

CREATE INDEX idx_pilar6_calculos_zelador ON pilar6_calculos("zeladorId");
CREATE INDEX idx_pilar6_canais_zelador ON pilar6_canais("zeladorId");
```

## Architectural Decisions (inline)

| # | Decision | Justification | Reversibility |
|---|---|---|---|
| D-YYY.1 | Nomes universalistas (sem trademark) | Guardrail 1 do ADR 0002 | Trivial — renomear |
| D-YYY.2 | Textos escritos do zero (Guardrail 2) | Sem copyright | Hard — reescrever |
| D-YYY.3 | 9 centros baseados em I Ching + Cabala + Tantra | Reusa sistemas canonicos do Akasha | Trivial |
| D-YYY.4 | Autoridades reusam D-041 (Emocional/Esplenica/Cardiaca) | Sem duplicacao | Trivial |
| D-YYY.5 | Portas = I Ching 1-64 (ja em Pilar 5) | Reusa Pilar 5 | Trivial |
| D-YYY.6 | Visualizacao propria (Guardrail 3) | Mandala SVG ja tem infraestrutura | Hard — redesign |
| D-YYY.7 | Disclaimer legal no app (Guardrail 4) | Boa-fe + protecao | Trivial |

## Open Dependencies

- **D-XXX** (Schema Multi-Tenant) — **Wave 3** (pre-requisito). Pilar6Calculo depende de `withCaminhanteContext()`.
- **D-041** (Caminhante) — **applied**. Pilar6Calculo FK para Caminhada.
- **Pilar 4 (Odu)** — **applied**. Tipo detection usa `birthOdu`.
- **Pilar 2 (Astrologia)** — **applied**. Ascendente e planetas sao inputs.
- **Pilar 5 (I Ching)** — **applied**. Portas 1-64.
- **MC canonico (D-041)** — **applied**. Autoridade ja calculada.

## Migration Plan

1. **Wave 2 (now)**: Este proposal aceito (revisao tua)
2. **Wave 4**: Implementar `packages/core-pilar6/` + tests
3. **Wave 4**: Apply migration `040_pilar6_mapa_energetico_integrado`
4. **Wave 4**: Adicionar campo `pilar6` em `MapaCalculo` (D-XXX schema)
5. **Wave 4**: Integrar no chat MCP (ADR 0004)
6. **Wave 4**: Disclaimer legal no app (Guardrail 4)
7. **PRE-LANCAMENTO**: Validacao juridica (P0 do Research 2)

## Risk and Rollback

- **Risk:** Implementacao inicial pode nao capturar sutilezas do Human Design original (que tem 30+ anos de refinamento). Mitigacao: "Wave 5+ = evoluir a partir de uso real".
- **Risk:** Mesmo com nomes renomeados, "4 Tipos" pode ser considerado obvio o suficiente para trademark. Mitigacao: parecer juridico P0 antes de lancamento.
- **Risk:** Visualizacao propria (Guardrail 3) pode acabar se parecendo com BodyGraph por coincidencia. Mitigacao: testar com advogado + designer.
- **Rollback:** `git revert` + DROP TABLE.

## Verification

- `pnpm exec prisma validate` passa
- `pnpm --filter core-pilar6 test:run` 100% passing
- **Smoke test:** Pilar6Calculo de um consulente deve retornar tipo + estrategia + autoridade + centros
- **Trade-off check:** comparar texto de Pilar 6 com Human Design original — **zero copia literal** (auditar com `diff`)
- **Legal check:** disclaimer no app, parecer juridico pre-lancamento

## Approval Required

Aprovacao tua antes de Wave 4 implementar.

---

**Author:** vision realignment session + research consolidation (2026-06-23).
**Anchors:**
- `docs/25_visao-akasha.md` (visao revisada)
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` (ADR 0002, accepted)
- `.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md` (Research 2)
- `CONTEXT.md` (glossario: 5 Pilares canonicos)
- `apps/akasha-portal/prisma/AGENTS.md:69-82` (migration protocol)
