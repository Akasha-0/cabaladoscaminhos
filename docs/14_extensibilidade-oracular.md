# Documento 14 — Contrato de Extensibilidade Oracular
## Sistema Akasha

> **Norte:** Doc 25 (Visão Akasha). Conteúdo matemático/esotérico preservado e agnóstico; reenquadrado para o produto B2C Akasha.
>
> **Tipo:** Contrato de arquitetura (como crescer o Grimório e adicionar sistemas/correspondências)
> **Versão:** 2.0 | **Resolve:** G9 do Doc 10
> **Papel no Akasha:** este contrato governa **dois eixos de crescimento** — (a) **adensar o Grimório Digital** (Doc 25 §5) com novas ervas, mantras, Itans e correspondências dentro dos 4 Pilares; (b) **adicionar um novo sistema oracular** (5º Pilar/conjunto de tags). Ambos entram sem refatorar o motor.
> **Escopo (D6):** I-Ching e outros sistemas além dos **4 Pilares** (Astrologia, Cabalística, Tântrica, Odus) são **Fase 2+ (fora do MVP)**, salvo decisão de produto (Doc 25 §1: evitar o "Frankenstein Esotérico").

---

## 1. Princípio

A arquitetura de extração por chaves (`CorrelationEntry` com `extractionKeys` por sistema — Doc 06 §3.1) e o Grafo de Cruzamento (Doc 25 §4, Camada 2) já foram desenhados para ser extensíveis. Crescer o Grimório ou adicionar um novo sistema oracular (I-Ching, Runas, Tarô completo, Geomância europeia, etc.) **não exige refatorar** o PromptBuilder, o Grafo nem o Motor Determinístico — exige preencher **cinco pontos de extensão** bem definidos.

Este documento fixa esse contrato para que qualquer novo sistema ou correspondência entre de forma uniforme e previsível, mantendo a garantia anti-alucinação (a verdade vem do Grimório, não da memória do LLM).

---

## 2. Os Cinco Pontos de Extensão

Para adicionar um sistema oracular `S` (ex.: `iching`) como novo Pilar/conjunto de tags, o agente deve tocar **exatamente** estes cinco lugares:

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. User.<S>Map (Json?)          → o mapa natal do novo sistema       │
│  2. packages/core-<S>            → o calculador determinístico (C1)   │
│  3. CorrelationEntry.<S>{}       → bloco de cruzamento (nós do Grafo) │
│  4. PromptBuilder (extração)     → injeta <S> no payload + Grimório   │
│  5. Roteador de Temas (Doc 12)   → Pilar <S> por tema                 │
└──────────────────────────────────────────────────────────────────────┘
```

> Para apenas **adensar o Grimório** (nova erva/mantra/Itan dentro dos 4 Pilares existentes), o trabalho é só o **Passo 4-bis** (abaixo) — criar o arquivo `.md` com frontmatter e rodar `npm run grimoire:sync`. Os passos 1–3 e 5 só entram ao introduzir um **novo sistema**.

### Passo 1 — Campo no `User` (Doc 04)
Adicionar ao modelo `User` (B2C; a Mesa Real usava `Client`, legado):
```prisma
ichingMap  Json?   // Mapa natal de I-Ching (hexagrama natal, linhas, trigramas)
```
E a interface TypeScript correspondente em `types/` (ex.: `IChingMap`).

### Passo 2 — Calculador (`packages/core-<S>`)
Pacote agnóstico no monorepo (Doc 25 §11), espelhando `core-astrology`/`core-cabala`/`core-tantra`/`core-odus`. Função pura `build<S>Map(...): <S>Map`, com:
- Entrada bem definida (data/hora/local, ou tiragem própria).
- Tabelas/regras determinísticas (mesma exigência do Doc 11 para os números).
- Testes unitários com casos conhecidos (entra no cofre dos ~9k testes).
- Cacheado no cadastro, **nunca recalculado** em consulta (regra inviolável, Doc 09 §5.3; Doc 25 §10 "calcule uma vez").

### Passo 3 — Bloco na `CorrelationEntry` / nós do Grafo (Doc 06, Doc 25 §4)
Estender o tipo de cruzamento, adicionando o sistema às correspondências que o Grafo (Camada 2) usa para detectar o Ponto de Tensão:
```typescript
export type CorrelationEntry = {
  nodeId: number;
  nodeName: string;
  nodeTheme: string;
  astrology: { primaryHouses: number[]; primaryPlanets: string[]; extractionKeys: string[] };
  kabalah:   { aspects: string[]; extractionKeys: string[] };
  tantric:   { aspects: string[]; extractionKeys: string[] };
  odus:      { aspects: string[]; extractionKeys: string[] };
  iching?:   { aspects: string[]; extractionKeys: string[] };  // ← novo, opcional
};
```
> **Importante:** o campo do novo sistema é **opcional** (`?`). Isso preserva os nós de cruzamento existentes dos 4 Pilares sem migração obrigatória e permite rollout incremental (correspondência a correspondência).
> **Legado (Mesa Real):** na arquitetura B2B, `CorrelationEntry` indexava as **36 casas** do Baralho Cigano (`houseId`/`houseName`). No Akasha o índice são os **nós de cruzamento dos 4 Pilares** (Doc 25 AD-25.2); a mecânica de delegação por chaves é a mesma.

### Passo 4 — Extração no `PromptBuilder` (Doc 06 §3.2)
Em `buildPayload`, adicionar a extração condicional:
```typescript
const ichingData = correlation.iching
  ? this.extractFromMap(user.ichingMap as Record<string, unknown>, correlation.iching.extractionKeys)
  : undefined;
// ... e incluir em dados_natais_usuario quando presente
```
A função `extractFromMap` já é genérica — não muda.

### Passo 4-bis — Ingestão no Grimório (Doc 25 §5)
Para que a prescrição (banho, erva, mantra) do novo sistema seja **citável sem alucinação**, cada correspondência vira um arquivo `.md` com frontmatter YAML nas bibliotecas do Grimório (Botânica/Cristais · Vibracional · Ancestral · Diagnóstico), incluindo as tags do novo sistema (ex.: `Hexagramas_Compativeis: [...]`). O pipeline `npm run grimoire:sync` (git pull → embeddings via Ollama → pgvector) reindexar. A busca híbrida passa a recuperar esses arquivos quando o filtro determinístico no JSONB casar.

### Passo 5 — Roteador de Temas (Doc 12 §4)
Adicionar à taxonomia de temas o novo Pilar e seus aspectos (na coluna **Pilares acionados** + **Aspectos Natais Chave** da tabela `tema → ...`). O roteador não muda de arquitetura.

---

## 3. Checklist de Conformidade (Definition of Done de um novo sistema)

- [ ] `User.<S>Map` adicionado ao schema (Doc 04, B2C) + migration aplicada.
- [ ] Interface `<S>Map` em `types/`.
- [ ] `packages/core-<S>` com função agregadora + testes (casos conhecidos passando, junto aos ~9k).
- [ ] `<S>` adicionado (opcional) à `CorrelationEntry` e preenchido nos nós de cruzamento onde faz sentido.
- [ ] `PromptBuilder` extrai e injeta `<S>` quando presente, sem quebrar os Pilares existentes.
- [ ] **Grimório** (Doc 25 §5): arquivos `.md` com tags do novo sistema criados e indexados via `grimoire:sync`.
- [ ] Glossário (Doc 15) ganha a seção canônica do novo sistema (base do Grimório).
- [ ] Roteador de Temas (Doc 12) referencia o novo Pilar e seus aspectos.
- [ ] Badges/UI (Docs 05/26) ganham a variante do novo sistema dentro da **paleta cósmica** (violeta/ciano/dourado).

---

## 4. Garantias do Contrato

1. **Não-regressão:** os 4 Pilares (astro/cabala/tântrica/Odus) continuam funcionando sem alteração quando um novo sistema é adicionado (campos opcionais); os ~9k testes seguem verdes.
2. **Determinismo preservado:** o novo sistema entra com suas próprias tabelas determinísticas (Doc 11) no `packages/core-<S>`, nunca como "conhecimento livre" do LLM.
3. **Coerência de cruzamento:** todo dado do novo sistema só chega à Voz do Akasha via `extractionKeys` mapeadas por nó de cruzamento, e toda prescrição vem do **Grimório** (Doc 25 §5) — nunca como bloco genérico nem da memória do modelo (regra Doc 09 §5.7).

---

## 5. Roadmap de Sistemas Futuros (sugestão)

| Sistema | Fase recomendada | Observação |
|---|---|---|
| I-Ching | Fase 2+ | Hexagrama natal + tiragem; bom par com o Pilar Astrologia (Nodos/Caminho de Vida) no tema `decisao`. |
| Tarô (Arcanos Maiores) | Fase 2+ | Já há `rulingArcana` no `KabalisticMap` enriquecido (Doc 04) — ponte natural com o Pilar Cabalística. |
| Runas | Fase 3 | Tiragem própria, baixa prioridade. |
| Geomância europeia | Fase 3 | Apenas se houver demanda. |

> Decisão **D6** do Doc 10: por padrão, **documentar I-Ching como extensão futura** (este doc) sem implementá-lo no MVP — o MVP do Akasha são os **4 Pilares** (Doc 25 §1). Reavaliar após o MVP do Manifesto + Dashboard + Agente Oracular.
