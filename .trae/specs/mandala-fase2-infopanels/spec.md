# Mandala Fase 2 — InfoPanels Completos Spec

## Status

✅ **CLOSED** — implemented in earlier cycle (pre-cycle 510). KabalaPanel
(Camada 2) and AstrologyPanel (Camada 4) were updated to display the full
fields exposed by Fase 1. Active state migration to `useCockpitStore` was
optional and tracked separately. See cycle history in
`memory/cycle-510..518.md`.

## Por que

Os InfoPanels existentes em `MandalaChart.tsx` exibem dados parciais do KabalisticMap. A API route `/api/akasha/mandala` foi expandida na Fase 1 para expor o KabalisticMap Nível 3 completo, mas os panels não foram atualizados para exibir todos os campos disponíveis.

## O que muda

- **KabalaPanel (Camada 2)**: Completar com Sefira, Letra Hebraica, Tarot Card, 4 Desafios, 4 Pináculos (com idades), 3 Ciclos de Vida (com anos)
- **AstrologyPanel (Camada 4)**: Adicionar os 5 aspectos astrológicos com interpretação
- **Estado do cockpit**: Opcionalmente migrar `activeLayer` para `useCockpitStore` (não obrigatório - pode manter local state)

## Impacto

- **Specs afetados**: Nenhum (extensão de feature existente)
- **Código afetado**:
  - `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` (InfoPanels lines 879-1162)
  - Opcional: `apps/akasha-portal/src/stores/cockpit-store.ts`

## Requisitos Adicionados

### Requisito: KabalaPanel Completo

O sistema DEVERÁ exibir todos os dados Kabalísticos disponíveis no MandalaData quando a Camada 2 (Contrato de Alma) estiver ativa.

#### Cenário: Painel Kabala expandido
- **QUANDO** usuário toca na Camada 2 do MandalaChart
- **ENTÃO** o InfoPanel exibe:
  - Caminho de Vida com indicador ★ Mestre se `lifePathMaster: true`
  - Expressão com indicador ★ Mestre se `expressionMaster: true`
  - Motivação, Impressão, Missão
  - Ano, Mês e Dia Pessoal
  - Sefira (árvore cabalística)
  - Letra Hebraica
  - Tarot Card (nome e significado)
  - 4 Desafios: Primeiro, Segundo, Principal, Último
  - 4 Pináculos: cada um com número, idade final e significado
  - 3 Ciclos de Vida: cada um com número, idade inicial e idade final

### Requisito: AstrologyPanel com Aspectos

O sistema DEVERÁ exibir os 5 aspectos astrológicos principais com suas interpretações quando a Camada 4 (Astrologia) estiver ativa.

#### Cenário: Painel Astrológico com Aspectos
- **QUANDO** usuário toca na Camada 4 do MandalaChart
- **ENTÃO** o InfoPanel exibe:
  - Ascendente, Meio do Céu, Planeta dominante
  - Lista de planetas (limitado a 5 para não poluir)
  - Balanço elemental com badges coloridos
  - **5 aspectos principais** em formato compacto: `{planeta1} {aspecto} {planeta2}: {interpretação}`
  - Orientação de equilíbrio elemental
  - SignificadoEmbed com source attribution

## Campos MandalaData disponíveis (Kabala)

```typescript
interface KabalaData {
  lifePath: number | null;
  lifePathMaster: boolean;
  expression: number | null;
  expressionMaster: boolean;
  motivation: number | null;
  impression: number | null;      // ADICIONAR
  mission: number | null;          // ADICIONAR
  personalYear: number | null;
  personalMonth: number | null;    // ADICIONAR
  personalDay: number | null;      // ADICIONAR
  sefira: string | null;          // ADICIONAR
  hebrewLetter: string | null;     // ADICIONAR
  tarotCard: { major: number; name: string; meaning: string } | null; // ADICIONAR
  challenges: {
    first: number;      // ADICIONAR
    second: number;     // ADICIONAR
    main: number;       // ADICIONAR
    last: number;      // ADICIONAR
  } | null;
  pinnacles: {
    first: { number: number; ageEnd: number; meaning: string } | null;
    second: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
    third: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
    fourth: { number: number; ageStart: number; meaning: string } | null;
  } | null; // ADICIONAR
  lifeCycles: {
    first: { number: number; ageStart: number; ageEnd: number } | null;
    second: { number: number; ageStart: number; ageEnd: number } | null;
    third: { number: number; ageStart: number } | null;
  } | null; // ADICIONAR
}
```

## Campos MandalaData disponíveis (Astrologia)

```typescript
interface AstrologyAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

interface AstrologyData {
  ascendant: string | null;
  midheaven: string | null;
  dominantPlanet: string | null;
  planets: Array<{ name: string; sign: string; degree: number; house: number }>;
  aspects: AstrologyAspect[]; // MOSTRAR OS 5 PRINCIPAIS
  elementalBalance: { fire: number; earth: number; air: number; water: number };
}
```

## Constraints

- Pilar 4 (Odu) ethics: manter aviso "requer consentimento + terreiro"
- LGPD by design: mínimo PII - não expor datas de nascimento completas
- Não inventar correspondências esotéricas
- Manter consistência visual com os panels existentes
