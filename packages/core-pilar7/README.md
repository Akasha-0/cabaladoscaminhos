# @akasha/core-pilar7

**Pilar 7 — Espectro de Transformacao** (Wave 4, D-ZZZ, ADR 0002).

Engine deterministico para o Pilar 7 do Akasha OS. Mapeia 64 chaves (1-64, = 64 hexagramas King Wen do Pilar 5 / I Ching) em 3 estagios de transformacao — **Sombra** / **Dom** / **Siddhi** — alem de duas estruturas auxiliares:

- **Sequence Venusiana** (22 chaves)
- **Caminho Dourado** (11 chaves)

## Instalacao

Workspace interno do monorepo `cabala-dos-caminhos`. Depende de `@akasha/core-iching` (Pilar 5).

## Uso

```ts
import { calcular } from '@akasha/core-pilar7';

const resultado = calcular(
  {
    pilar5: { hexagramNumber: 13, hexagramName: 'Concordancia entre os Homens', /* ... */ },
    // ... outros pilares (Pilar 1-6)
  },
  35 // idade do consulente
);

// resultado.chaveNatal.numero       // 13
// resultado.chaveNatal.nome         // 'A Comunhao' (nome universalista)
// resultado.estagioAtual             // 'sombra' | 'dom' | 'siddhi'
// resultado.sequenceVenusiana.length // 22
// resultado.caminhoDourado.length    // 11
```

## Estrutura

```
packages/core-pilar7/
├── src/
│   ├── chave.ts                  # 64 chaves (sinergia com I Ching)
│   ├── espectro.ts               # 3 estagios: Sombra / Dom / Siddhi
│   ├── sequence.ts               # Sequence Venusiana (22 chaves)
│   ├── pathway.ts                # Caminho Dourado (11 chaves)
│   ├── calcular.ts               # Orquestrador
│   ├── types.ts                  # Tipos compartilhados
│   ├── index.ts                  # Barrel
│   ├── textos/                   # 192 placeholders (64 chaves × 3 estagios)
│   └── __tests__/                # Testes co-locados
├── package.json
├── tsconfig.json
├── AGENTS.md
└── README.md
```

## Guardrails (ADR 0002)

Este pacote respeita os 4 guardrails canonicos de traduca universalista:

1. **Renomeacao** — `Sombra`/`Dom`/`Siddhi` (termos genericos milenares), `Sequence Venusiana`/`Caminho Dourado` (traducoes literais). NAO usamos `Gene Keys`, `Shadow`, `Gift`, `Venus Sequence`, `Golden Pathway`.
2. **Textos proprios** — 192 placeholders em `src/textos/` sao paragrafos originais. Substituicao por textos finais Wave 5+.
3. **Visualizacao propria** — este pacote nao inclui UI. A visualizacao do Pilar 7 sera uma camada SVG propria na Mandala.
4. **Disclaimer legal** — texto canonico em `docs/25_visao-akasha.md` §10. Aparece no app (footer onboarding + `/conta/legal`).

## Verificacao

```bash
pnpm --filter @akasha/core-pilar7 typecheck
pnpm --filter @akasha/core-pilar7 test:run
```

## Referencias

- `apps/akasha-portal/prisma/designs/D-ZZZ-pilar-7-espectro-transformacao-traduzido.md`
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md`
- `docs/25_visao-akasha.md` §2 (7 Pilares) e §10 (decisao canonica)
