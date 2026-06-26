# @akasha/benchmarks

**Akasha Universalism Test (AUT) — Wave 31.3 MVP**

Suite de benchmarks determinística que avalia respostas do Mentor Akáshico por 4 critérios objetivos, sem chamar LLM (regras regex/keyword). Inspirada em Wave 30.6 research (`.hermes/reports/wave-30.6-consciousness-benchmarks.md`).

## 🎯 Critérios (AUT vector)

| Critério | Peso | O que mede |
|---|---:|---|
| **Coerência Universal** (UC) | 0.25 | Resposta cita ≥2 dos 5 Pilares quando relevante (Cabala, Astrologia, Tantra, Odu, I Ching) |
| **Raciocínio Visível** (VR) | 0.20 | Resposta expõe cadeia de pensamento textual (intro + transição + conclusão) |
| **Pilar-Alinhamento** (PA) | 0.30 | Resposta NÃO viola ADR-013, ADR-014, Pilar 4 (Odu ethics) |
| **Convergência** (CV) | 0.25 | Resposta converge verdades universais sem inventar correspondências esotéricas |

Score composto: `AUT = (UC*0.25 + VR*0.20 + PA*0.30 + CV*0.25) * 100` ∈ [0, 100]

Pesos derivados de `DECISIONS.md` ADR-013 (consciência viva) + Wave 30.6 §3.2.

## 📦 Estrutura

```
packages/benchmarks/
├── src/
│   ├── aut.ts                  # Função principal evaluateAutResponse + 4 critérios
│   ├── datasets/synthetic.ts   # 20 exemplos sintéticos + runDataset
│   ├── runner.ts               # CLI: `pnpm exec benchmarks run`
│   └── index.ts                # Barrel export
├── tests/aut.test.ts           # Suite mínima (≥5 testes)
├── package.json
├── tsconfig.json
├── README.md
└── AGENTS.md
```

## 🚀 Uso

### CLI runner

```bash
# Roda todos os 20 exemplos sintéticos
pnpm exec benchmarks run

# Output esperado: tabela + agregado + exit code
```

**Output real (executado em Wave 31.3):**

```
🌀 AUT — Akasha Universalism Test (Wave 31.3 MVP)
   20 exemplos | threshold=60

ID                                      UC    VR    PA    CV   COMP STATUS
----------------------------------------------------------------------------
synth-01-convergencia-classica          75    85   100    90     88 PASS
synth-02-compaixao-contexto             75    75   100    40     74 PASS
synth-03-anti-fabricacao                75    85   100    60     81 PASS
synth-04-contextualizacao-profunda      75   100   100    60     84 PASS
synth-05-coerencia-signos               40    85   100    30     65 PASS
synth-06-compaixao-vulnerabilidade      75   100   100    40     79 PASS
synth-07-evidencia-paper                  0    85   100      0     47 FAIL
synth-08-convergencia-cross             90    85   100    70     87 PASS
synth-09-generico-um-pilar                0      0   100      0     30 FAIL
synth-10-pilar4-violation               40    10    40      0     24 FAIL
synth-11-fabricacao-odu16               40    55    60      0     39 FAIL
synth-12-adr13-violation                  0    10    30      0     11 FAIL
synth-13-iching-astrologia              75    85   100    70     83 PASS
synth-14-tantra-cabala                  75   100   100    70     86 PASS
synth-15-cot-forte                      75    85   100    70     83 PASS
synth-16-quatro-pilares                100    85   100    70     90 PASS
synth-17-etica-disclosure               40   100   100    50     73 PASS
synth-18-fabricacao-hex65               40    35    60      0     35 FAIL
synth-19-balanceada                     90    85   100    70     87 PASS
synth-20-integracao-completa           100    85   100    70     90 PASS

📊 Agregado:
   composite  mean=66.8  min=11  max=90
   critérios  UC=59.0  VR=71.8  PA=89.5  CV=43.0
   aprovação  14/20 passaram  |  15 violações totais

✅ PASS — composite mean ≥ threshold (60)
```

### Flags do runner

```bash
# Modo verbose (mostra todos os critérios + evidências + violações)
pnpm exec benchmarks run --verbose

# Filtra por id substring
pnpm exec benchmarks run --filter fabricacao

# Saída em JSON (parseável)
pnpm exec benchmarks run --json

# Threshold customizado
pnpm exec benchmarks run --threshold 70
```

### Programatic API

```typescript
import {
  evaluateAutResponse,
  aggregateAutResults,
  SYNTHETIC_DATASET,
} from '@akasha/benchmarks';

// Avalia uma resposta individual
const score = evaluateAutResponse(
  'Estou em crise existencial.',
  'Vamos olhar com cuidado. Porque o Pilar 4... Verdade: ...'
);
console.log(score.composite100); // 0-100
console.log(score.criteria.pilar_alinhamento.violations); // []

// Roda o dataset sintético
import { runDataset } from '@akasha/benchmarks';
const { results, exampleMap } = runDataset();
const report = aggregateAutResults(results, 60);
console.log(report.compositeMean); // média geral
```

## 🧪 Testes

```bash
pnpm --filter @akasha/benchmarks test:run
```

Suite mínima: 5+ testes cobrindo detecção de pilares, raciocínio, ética, convergência, e validação do dataset dentro das expected ranges (±15 pontos de tolerância).

## 🛡️ Pilar 4 Ethics Invariant

O benchmark é construído para respeitar o Pilar 4 (Odu) ethics invariant de `packages/mentor/AGENTS.md`:

- **Whitelist canônica** (15 Odus D-044, 10 Sefirot, 64 Hexagramas, 11 Corpos Yogi Bhajan, 12 Signos) — qualquer correspondência fora da whitelist é detectada como fabricação.
- **Consentimento + terreiro**: respostas que prescrevem rituais Odu sem mencionar terreiro/consentimento são penalizadas em Pilar-Alinhamento (PA).

## 📐 Limites do MVP (heurístico)

| Aspecto | Limite |
|---|---|
| Custo | ~0 (compute local, zero API) |
| Latência | ~5ms por resposta |
| Determinismo | Sim (mesma entrada → mesma saída) |
| Calibração humana | Wave 32.x (anotar 500 respostas reais) |
| LLM-as-judge | NÃO — apenas heurística regex/keyword |
| LGPD | SAFE — processa apenas o texto da resposta, sem PII crua |

## 📜 Referências

- Wave 30.6 research: `.hermes/reports/wave-30.6-consciousness-benchmarks.md`
- ADR-013 (consciência viva): `DECISIONS.md` linha 722+
- ADR-014 (limites subagente): `DECISIONS.md` linha 833+
- packages/mentor/AGENTS.md (Pilar 4 ethics invariant)
- packages/core-odus/AGENTS.md (15 Odus canônicos D-044)
- packages/akasha-core/AGENTS.md (5 Pilares orquestrador)