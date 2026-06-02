# Documento 14 — Contrato de Extensibilidade Oracular
## Cabala dos Caminhos

> **Tipo:** Contrato de arquitetura (plugin de sistemas oraculares)
> **Versão:** 1.0 | **Resolve:** G9 do Doc 10
> **Escopo (D6):** I-Ching e outros sistemas são marcados como **Fase 2+ (fora do MVP)**, salvo decisão em contrário do operador.

---

## 1. Princípio

A arquitetura de extração por chaves (`CorrelationEntry` com `extractionKeys` por sistema — Doc 06 §3.1) já foi desenhada para ser extensível. Adicionar um novo sistema oracular (I-Ching, Runas, Tarô completo, Geomância europeia, etc.) **não exige refatorar** o PromptBuilder nem o motor — exige preencher **cinco pontos de extensão** bem definidos.

Este documento fixa esse contrato para que qualquer novo sistema entre de forma uniforme e previsível.

---

## 2. Os Cinco Pontos de Extensão

Para adicionar um sistema oracular `S` (ex.: `iching`), o agente deve tocar **exatamente** estes cinco lugares:

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Client.<S>Map (Json?)        → o mapa natal do novo sistema   │
│  2. lib/calculators/<S>.ts       → o calculador determinístico    │
│  3. CorrelationEntry.<S>{}        → bloco de delegação por casa    │
│  4. PromptBuilder (extração)     → injeta <S> no payload da casa   │
│  5. Roteador de Temas (Doc 12)   → aspectos de <S> por tema       │
└──────────────────────────────────────────────────────────────────┘
```

### Passo 1 — Campo no `Client` (Doc 04)
Adicionar ao modelo `Client`:
```prisma
ichingMap  Json?   // Mapa natal de I-Ching (hexagrama natal, linhas, trigramas)
```
E a interface TypeScript correspondente em `types/` (ex.: `IChingMap`).

### Passo 2 — Calculador (`lib/calculators/<S>.ts`)
Função pura `build<S>Map(...): <S>Map`, com:
- Entrada bem definida (data/hora/local, ou tiragem própria).
- Tabelas/regras determinísticas (mesma exigência do Doc 11 para os números).
- Testes unitários com casos conhecidos.
- Cacheado no cadastro, **nunca recalculado** em leitura (regra inviolável, Doc 09 §5.3).

### Passo 3 — Bloco na `CorrelationEntry` (Doc 06)
Estender o tipo:
```typescript
export type CorrelationEntry = {
  houseId: number;
  houseName: string;
  houseTheme: string;
  astrology: { primaryHouses: number[]; primaryPlanets: string[]; extractionKeys: string[] };
  kabalah:   { aspects: string[]; extractionKeys: string[] };
  tantric:   { aspects: string[]; extractionKeys: string[] };
  iching?:   { aspects: string[]; extractionKeys: string[] };  // ← novo, opcional
};
```
> **Importante:** o campo do novo sistema é **opcional** (`?`). Isso preserva as 36 entradas existentes sem migração obrigatória e permite rollout incremental (casa a casa).

### Passo 4 — Extração no `PromptBuilder` (Doc 06 §3.2)
Em `buildHousePayload`, adicionar a extração condicional:
```typescript
const ichingData = correlation.iching
  ? this.extractFromMap(client.ichingMap as Record<string, unknown>, correlation.iching.extractionKeys)
  : undefined;
// ... e incluir em dados_natais_consultante quando presente
```
A função `extractFromMap` já é genérica — não muda.

### Passo 5 — Roteador de Temas (Doc 12 §4)
Adicionar à taxonomia de temas os aspectos do novo sistema (uma coluna a mais na tabela `tema → ...`). O roteador não muda de arquitetura.

---

## 3. Checklist de Conformidade (Definition of Done de um novo sistema)

- [ ] `Client.<S>Map` adicionado ao schema + migration aplicada.
- [ ] Interface `<S>Map` em `types/`.
- [ ] `lib/calculators/<S>.ts` com função agregadora + testes (casos conhecidos passando).
- [ ] `<S>` adicionado (opcional) à `CorrelationEntry` e preenchido nas casas onde faz sentido.
- [ ] `PromptBuilder` extrai e injeta `<S>` quando presente, sem quebrar casas sem `<S>`.
- [ ] Glossário (Doc 15) ganha a seção canônica do novo sistema.
- [ ] Roteador de Temas (Doc 12) referencia os aspectos de `<S>`.
- [ ] Badges/UI (Doc 05/13) ganham a variante de cor do novo sistema, dentro da paleta laranja/royal.

---

## 4. Garantias do Contrato

1. **Não-regressão:** sistemas existentes (astro/cabala/tântrica/Odu) continuam funcionando sem alteração quando um novo é adicionado (campos opcionais).
2. **Determinismo preservado:** o novo sistema entra com suas próprias tabelas determinísticas (Doc 11), nunca como "conhecimento livre" do LLM.
3. **Coerência de cruzamento:** todo dado do novo sistema só chega ao LLM via `extractionKeys` mapeadas por casa — nunca como bloco genérico (regra Doc 09 §5.7).

---

## 5. Roadmap de Sistemas Futuros (sugestão)

| Sistema | Fase recomendada | Observação |
|---|---|---|
| I-Ching | Fase 2+ | Hexagrama natal + tiragem; bom par com a Casa 22 (Os Caminhos). |
| Tarô (Arcanos Maiores) | Fase 2+ | Já há `rulingArcana` no `KabalisticMap` enriquecido (Doc 04) — ponte natural. |
| Runas | Fase 3 | Tiragem própria, baixa prioridade. |
| Geomância europeia | Fase 3 | Apenas se houver demanda. |

> Decisão **D6** do Doc 10: por padrão, **documentar I-Ching como extensão futura** (este doc) sem implementá-lo no MVP. Reavaliar após o MVP do dossiê + Q&A.
