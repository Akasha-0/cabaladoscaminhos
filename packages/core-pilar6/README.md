# @akasha/core-pilar6

> **Pilar 6 — Mapa Energético Integrado** (tradução universalista).
> Motor determinístico, sem dependências de framework.

## O que é

Engine puro (TypeScript) que computa o Pilar 6 do Akasha a partir dos
5 Pilares canônicos (Cabala, Astrologia, Tantra, Odu, I Ching) + MC
canônico do D-041 (Caminhante). Implementa 4 sub-componentes:

1. **Tipo Energético** — 4 tipos (Iniciador, Guia, Iniciador Aberto,
   Refletor).
2. **Estratégia Energética** — 4 estratégias (Esperar Convite, Informar,
   Iniciar, Esperar Ciclo Lunar).
3. **Autoridade Energética** — 6 autoridades internas (reutiliza D-041).
4. **Centros Energéticos** — 9 centros (universalistas, I Ching + Cabala +
   Tantra) + **Canais** — 36 canais entre pares de centros adjacentes
   definidos.

## Guardrails respeitados (ADR 0002)

- ✅ **Sem termos proprietários** do Human Design ou Gene Keys.
- ✅ **Textos originais** (do zero, sem cópia nem tradução literal).
- ✅ **Sem visualização proprietária** (BodyGraph não clonado).
- ✅ **Engine puro** — não toca UI, não toca LLM, não toca schema.

## Uso

```ts
import { calcular } from '@akasha/core-pilar6';

const resultado = calcular(pilares, mc);
// resultado.tipo         -> 'iniciador' | 'guia' | 'iniciador_aberto' | 'refletor'
// resultado.estrategia   -> 'esperar_convite' | 'informar' | 'iniciar' | 'esperar_ciclo_lunar'
// resultado.autoridade   -> 6 autoridades | null
// resultado.centrosDefinidos -> subset dos 9 centros
// resultado.canais       -> 0..36 canais ativos
// resultado.versaoCalculo -> 'v1'
// resultado.calculadoEm  -> Date
```

## Verificação

```bash
pnpm --filter @akasha/core-pilar6 typecheck
pnpm --filter @akasha/core-pilar6 test:run
```

## Status

- **Wave 4 Task 1** — engine criado. Algoritmo heurístico (stub)
  será refinado em Wave 5+ a partir de uso real.
- **Integração com `@akasha/core`** (orchestrator) é Wave 4 Task 3
  (não incluído aqui).
- **Visualização na Mandala** é Wave 4 Task 4 (MandalaChart update).
- **Disclaimer legal** (Guardrail 4) é Wave 4 Task 4.

## Referências

- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` — 4 guardrails
- `apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md` —
  design proposal implementado
- `apps/akasha-portal/src/lib/grimoire/significados-especificos.ts` —
  shape canônico de `PilaresDados`
- `apps/akasha-portal/prisma/designs/d-041-prisma-caminhante-caminhada-proposal.md` —
  shape canônico de `MandalaCaminho` (MC)
