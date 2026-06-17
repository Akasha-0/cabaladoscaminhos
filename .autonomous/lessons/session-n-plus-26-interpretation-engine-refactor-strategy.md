# Lesson — Interpretation-Engine progressive refactor strategy

**Date:** 2026-06-16
**Session:** N+26 (loop/w2, akasha-evolution iter 4)
**Commits context:** 13c8cb5c (v0.5.0), 5a402241 (v0.4.0)

## Contexto

`packages/akasha-core/src/interpretation-engine.ts` é o maior arquivo
do monorepo (1051L, v0.4.0). O `large_file` improvement type da iteração
4 do akasha-evolution está extraindo o `VIDA_CONTENT[9]` em
`interpretation-engine/vida-numero-9.ts` (6879 bytes, ~80L).

O arquivo tem 4 extrações já em progresso (paralelas ao refactor
ativo):

- `interpretation-engine/types.ts` (62L) — type contracts isolados
- `interpretation-engine/builders.ts` (96L) — funções `baseInterpretation`, `buildInterpretation`, `buildFallback`
- `interpretation-engine/queries.ts` (88L) — `interpretarVida`, `interpretarVidaArea`
- `interpretation-engine/mestres.ts` (553L) — conteúdo dos mestres 11/22/33
- `interpretation-engine/vida-numero-9.ts` (180L) — entry [9] (em criação)

## Estrutura atual do VIDA_CONTENT (1007L)

```
1: 47-136   (90L)
2: 137-228  (92L)
3: 229-310  (82L)
4: 311-393  (83L)
5: 394-476  (83L)
6: 477-559  (83L)
7: 560-642  (83L)
8: 643-725  (83L)
9: 726-806  (81L) ← sendo extraído
11: 807-889 (83L) ← mestre
22: 890-971 (82L) ← mestre
33: 972-?   (80L) ← mestre
```

Cada entry tem ~80-90L. Após extrair o [9], restam 11 entries que
totalizam ~910L. Se extraídas 1-2 por iteração, o `interpretation-engine.ts`
cai para ~150-200L em 5-6 iterações.

## Aprendizado

1. **Refactor progressivo 1 arquivo por iteração é a política correta.**
   - Cada extração ~80L mantém o diff reviewable
   - Testa imediatamente (typecheck + vitest) — não acumula debt
   - Commita um helper module por vez — git log fica legível

2. **Cuidado com imports circulares.** O `VIDA_CONTENT[9]` referencia
   o módulo `./vida-numero-9` (auto-import do agent). Manter a
   forma `Record<number, NumeroContent>` no arquivo principal e
   fazer `const VIDA_NUMERO_9: NumeroContent = { ... }` no helper
   mantém a type safety sem acoplar.

3. **Mestres (11, 22, 33) já estão extraídos em `mestres.ts` (553L).**
   Os próximos candidatos naturais são os single-digits 1-8. Cada
   um deles é auto-contido (mesma shape `NumeroContent`).

4. **Triad verification é barata após extração.** `tsc --noEmit`
   + `vitest run packages/akasha-core/src/interpretation-engine/`
   roda em <500ms e confirma que nada quebrou.

## Próximas extrações candidatas (ordem sugerida)

1. `interpretation-engine/vida-numero-1.ts` (L47-136, ~90L)
2. `interpretation-engine/vida-numero-2.ts` (L137-228, ~92L)
3. `interpretation-engine/vida-numero-3.ts` (L229-310, ~82L)
4. `interpretation-engine/vida-numero-4.ts` (L311-393, ~83L)
5. `interpretation-engine/vida-numero-5.ts` (L394-476, ~83L)
6. `interpretation-engine/vida-numero-6.ts` (L477-559, ~83L)
7. `interpretation-engine/vida-numero-7.ts` (L560-642, ~83L)
8. `interpretation-engine/vida-numero-8.ts` (L643-725, ~83L)

Após todas, o `interpretation-engine.ts` fica com ~200L (constantes,
tipos e o `VIDA_CONTENT` aggregator vazio que importa todos).

## Consequência para research/

A próxima iteração de RESEARCH pode incluir `large_file` com
target `interpretation-engine.ts` apontando para `vida-numero-1.ts`
como próxima extração. O candidate `large_file` aceita a lista
de oversized files; basta o agent pegar o primeiro da lista que
ainda não foi extraído.

## Métricas atuais (loop/w2)

- v0.4.0 → v0.5.0: ~10 min wall-clock
- 1 extração por iteração
- Triad verde após cada extração
- Test coverage 24/24 em `interpretation-engine/`

## Dados REAIS (verificados em 2026-06-16 11:38)

- `interpretation-engine.ts`: **1051 → 973L** (caiu 78L após extração do [9])
- `vida-numero-9.ts`: **111L** (novo, com `VIDA_NUMERO_9` exportado)
- `VIDA_CONTENT[9]` no main: agora referencia `./vida-numero-9`
- Triad: typecheck ✅ (tsc --noEmit 0 erros), tests ✅ (24/24 em interpretation-engine/)
- Working tree dirty: agent ainda não commitou (provavelmente rodando tests antes)

## Ranking de oversized files (2026-06-16 11:38)

```
1. MandalaChart.tsx                       1001L  (akasha-portal)
2. practices.ts (core-iching)              993L  ← PRÓXIMO CANDIDATO
3. deep-correlation-engine.ts              990L  (akasha-portal — system-helpers extraído)
4. interpretation-engine.ts                973L  (após extração #5)
5. life-areas-engine.ts                    957L
6. personal-cycle-engine.ts                867L
7. narrative-generator.ts                  851L
8. HyperCorrelationEngine.ts               785L
9. AkashaLifeAreasDashboard.tsx            752L
10. traducao-areas.ts                      720L
```

Total: 78220L em 19+ arquivos >700L

## Análise do PRÓXIMO candidato: `practices.ts` (993L)

Estrutura interna verificada:
- L17-936: `PRACTICES: IntegrativePractice[]` (~920L — banco de dados)
- L937-958: 3 lookups (`PRACTICES_BY_ELEMENT`, `_BY_TRADITION`, `_BY_CATEGORY`)
- L963-993: 6 getters (`getPractice`, `getPracticesByElement`, `_ByTradition`, `_ByCategory`, `_ByLifeArea`, `getAllPractices`)

**Estratégia de extração (ordem):**
1. `practices/ifá-candomblé.ts` (banho de ervas, proteção, etc.)
2. `practices/cristaloterapia.ts`
3. `practices/aromaterapia.ts`
4. `practices/cromoterapia.ts`
5. Aggregator: `practices/index.ts` re-exporta tudo + getters

Após extração, `practices.ts` original vira `<200L` (constantes + getters apenas).

## MandalaChart.tsx — JÁ tem 2 extrações

Confirmado: `IchingInfoPanel.tsx` e `AstrologyInfoPanel.tsx` já foram
extraídos em iterações anteriores (F-219/F-220). Resta ainda
~1001L — provável target para próxima extração de sub-painel
(Layer 2 Numerologia, Layer 3 Astrologia oriental, etc.).

