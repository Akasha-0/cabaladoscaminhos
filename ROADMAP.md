# ROADMAP — Akasha System

> Derived from constitution priorities + current codebase state.
> Written: 2026-06-17

---

## Prioridade 1 — Motor de Tradução: criar estrutura `mapeamentos/`

**✅ ENTREGUE (Iteração 4):**
- `packages/akasha-core/src/mapeamentos/types.ts` — PRIMITIVOS 12, PrimitiveContribution, Tradicao, Dominio, PESOS_TRADICAO_DOMINIO
- `packages/akasha-core/src/mapeamentos/iching.ts` — 64 hexagramas (Wilhelm/Baynes 1976)
- `packages/akasha-core/src/mapeamentos/index.ts` — synthesizePrimitives(), traduzIChing/Cabala/Astrologia/Tantra/Odu, HEXAGRAMA_PRIMITIVOS 64, PARES_TENSOES
- Integrado em `akasha-core.ts`: `AkashaLeitura.primitivos?: SynthesizedProfile`; `calcular()` chama `synthesizePrimitives()`
- Exported de `packages/akasha-core/src/index.ts`
- Build ✅ 48 rotas

**Entregáveis restantes (futuro):**
- [x] `cabala/`: número → frequência, elemento, séfira, caminho — DONE (iter20): `mapeamentos/cabala/numeros.ts` criado com 12 entradas (1-9 + 11, 22, 33); `traduzCabala` enriquecido com séfira/elemento/caminho/fonte; Ano Pessoal agora coberto
- [x] `odu/`: odu → frequência, elemento, orixá regente, proibição ✅ Iter21 — `mapeamentos/odu/numeros.ts` criado (16 Odu, fonte enriquecida em `traduzOdu`)
- [x] `astrologia/`: planeta → frequência, elemento, signo, casa — DONE (iter22): `mapeamentos/astrologia/numeros.ts` criado com 10 planetas (Sol/Lua/Mercúrio/Vênus/Marte/Júpiter/Saturno/Urano/Netuno/Plutão); `traduzAstrologia` enriquecida com arquétipoplaneta + elemento na fonte
- [x] `tantra/`: corpo (1-11) → frequência, chakra, elemento — DONE (iter22): `mapeamentos/tantra/numeros.ts` criado com 11 corpos tântricos; `traduzTantra` refactorada para usar `CORPOS_NUMEROLOGIA` com chakra/elemento/proposta na fonte
- [x] Integração em `synthesis-engine/area-builders.ts` — área narrativa deriva de `mapeamentos/` e não de lógica inline (Iteração 6/7: synthesizePrimitives() chamado em buildAkashaSynthesis, 6 area functions aceitam _synthesizedProfile opcional)

**Dependência:** Nenhuma — pode começar imediatamente.

---

## Prioridade 2 — Síntese Akáshica (camada 4): expandir oneProfile de 3→9+ tipos com todos os 5 pilares

**✅ ENTREGUE (Iteração 6):**
- `deriveAkashaType()` refactored com votação 5 pilares (Odu 3x, I Ching 2x, Cabala LP 2x, Astrologia 1x, Tantra→autoridade)
- `AkashicHologram.ichingHex?: number | null` adicionado à interface e a `aggregateHologram`
- `buildDailyContent` aceitando `ichingHex?: number | null` pos-5
- 9 ROADMAP-tests cobrindo astro-only (não-arquiteto), I Ching, Cabala LP, Odu dominance, fallback
- Catalogue 9 tipos intacto; cada tipo tem critérios documentados em código

**Entregáveis:**
- [x] Refactor `deriveAkashaType()` agregar sinais dos 5 pilares com peso configurável ✅
- [x] `akasha-types-catalog.ts` — 9 tipos (arquiteto…catalisador) ✅
- [x] Teste: astro-only (Escorpião) → não-arquiteto ✅
- [x] Teste: Odu+Astrologia domina peso correto ✅

## Prioridade 3 — Cobertura de vida (secção 6): aprofundar 6 áreas existentes

**O que é:** As 6 áreas (`vitalidadeEnergia`, `conexoesAmor`, `carreiraProsperidade`, `oriCabecaQuizilas`, `missaoDestino`, `desafiosSombras`) têm estrutura básica mas conteúdo fino. `generateAreaNarrativeFull()` gera texto genérico quando menos de 3 pilares estão disponíveis.

**Por que é o maior impacto agora:**
O utilizador interactua diariamente com estas áreas. Conteúdo fino ou repetitivo Mata a confiança no sistema mais rápido que qualquer outra falha. A profundidade nestas áreas é o diferenciador real entre o Akasha e um agregador de tradições.

**Entregáveis:**
- [x] Auditar cada área: contar quantas combinações de pilares produzem narrativa única vs. fallback genérico — **Addressado (iter16+iter17):** generateAreaNarrativeFull recebe _synthesizedProfile; primitives usados como âncora narrativa quando hasCount <= 2; 5ª tradição I Ching integrada com buildTransformacaoIChingNarrative
- [x] Preencher mapeamentos/iching/ para que I Ching contribua a missaoDestino e oriCabecaQuizilas — **addressado (iter17):** buildTransformacaoIChingNarrative deriva orientação por área do ichingHex do hologram + primitives do _synthesizedProfile
- [x] Garantir que cada área tem pelo menos 3 combinações de pilares produzindo narrativas distintas (teste automatizado) — **addressado (iter17):** `it('cada área gera pillarContribution distintas (não-identidade) — 3 combos')` em `synthesis-engine.test.ts`; all-null / kab-only / full validation ✅
- [x] Curar conteúdo para a área `desafiosSombras` — actualmente usa `buildShadowSymptoms()` com lógica ad-hoc; migrar para mapeamentos  **DONE (iter17):** shadow-sintomas.ts criado em apps/akasha-portal/src/lib/grimoire/mapeamentos/ com 5 mapas curados (Saturno/Plutão por signo, dívida kármica, desafio, proibições Odu)
- [x] Teste de não-repetição: gerar 50 sínteses aleatórias e verificar que nenhuma narrativa é idêntica a outra — DONE (iter18): `gera 50 síntese distintas`, `mesmos inputs → mesmo output`, `null inputs geram saída graceful` em synthesis-engine.test.ts; 38/38 ✅

**Dependência:** Requer Prioridade 1 (mapeamentos/).

---

## Prioridade 4 — Agente Evolutivo (camada 7): só após 0–6 sólido

**O que é:** O `personal-cycle-engine.ts` existe como esboço mas não constitui um agente evolutivo. A camada 7 exige: memória persistente do ciclo de vida do utilizador, capacidade de propor exercícios e rituais, seguimento de progresso ao longo de semanas.

**Por que não agora:**
Um agente evolutivo que opera sobre dados finos (Prioridade 3) e síntese incompleta (Prioridade 2) gera recomendações desenquadradas. Construir sobre foundations incertas multiplica o retrabalho.

**Pré-requisitos para iniciar:**
- [x] Prioridade 1 completa (mapeamentos/ com todas as 5 tradições: cabala/✅ iter20, odu/✅ iter21, astrologia/✅ iter22, tantra/✅ iter22, iching/✅ baseline)
- [x] Prioridade 2 completa (oneProfile com todos os 5 pilares — todas as 5 tradições integradas em synthesizePrimitives + deriveAkashaType + UI Iter23-25)
- [ ] Prioridade 3 completa (mínimo: 80% das combinações de áreas com narrativa não-genérica)
- [x] `PersonalCycleEngine` refactored para usar `mapeamentos/personal-cycle.ts` (4 tabelas externas: PINNACLE_THEMES, CHALLENGE_DESCRIPTIONS, KARMIC_LESSON_DESCRIPTIONS, MATURITY_THEMES)

**Entregáveis (quando desbloqueado):**
- [ ] `agents/evolutionary-agent/` — módulo com estado de ciclo por utilizador
- [ ] Integração com `useAkashaSynthesis` — historial de áreas influencia narrativa do dia
- [ ] UI: secção "Meu Ciclo" com exercícios personalizados por área e semana lunar

---

## Notas de Arquitectura

- A estrutura `mapeamentos/` é o contrato de dados entre motores. Todos os motores de interpretação (camadas 2–4) devem consumir mapeamentos, não lógica inline.
- O catálogo de tipos (`akasha-types-catalog.ts`) vive em `synthesis-engine/`; os tipos são dados, não código — adicionar novo tipo não exige mudança de lógica.
- A regra de dependência: Prioridade N+1 só começa quando Prioridade N tem testes determinísticos a passar.

---

*Este roadmap substitui o Doc 08_roadmap.md para matters de constituição. As ondas anteriores (1-7) permanecem como registo histórico em `docs/08_roadmap.md`.*

## Progress Update (2026-06-17 — Iteração 2)

- [x] `ConexoesClient.tsx` criado ( Fase 4 do plano Conexões) — UI de 3 estágios funcional com mock data
- [ ] `packages/akasha-core/src/conexoes.ts` (Fase 1 — engine de comparação) — pendente
- [ ] `POST /api/akasha/conexoes` route (Fase 2) — pendente
- [ ] Prisma `Connection` model (Fase 3) — pendente

- [x] `ConexoesClient.tsx` criado (Fase 4 do plano Conexões) ✅ Iteração 2
- [x] `packages/akasha-core/src/conexoes.ts` (Fase 1 — engine de comparação) ✅ engine existia, foi discovery
- [x] `POST /api/akasha/conexoes` route (Fase 2) ✅ Iteração 3
- [ ] Prisma `Connection` model (Fase 3) — pendente

## Progress Update (2026-06-17 — Iteração 23)

- [x] Prioridade 2 — `deriveAkashaType` agora recebe `SynthesizedProfile` como parâmetro opcional
  - `typeConfidence: 'alta' | 'media' | 'baixa' | null` adicionado a `AkashaTypeProfile`
  - Confiança derivada da convergência média dos primitivos dominantes (top-3)
  - `corePattern` enriquecido com `tensaoPrincipal` quando existe tensão entre primitivos
  - 4 ficheiros alterados: synthesis-types.ts, derive-akasha-type.ts, synthesis-engine.ts, akasha-types-catalog.ts
  - TypeScript: 0 erros ✅ | synthesis-engine tests: 38/38 ✅ | Build: 49/49 ✅

## Progress Update (2026-06-17 — Iteração 24)

- [x] `typeConfidence` visível na UI — `AkashaTypeProfileUI` gains `typeConfidence` field; `OneProfileCard` renders confidence badge (alta/media/baixa) com cores distintas e texto explicativo
  - AkashaTypeProfileUI.ts: 1 campo adicionado
  - OneProfileCard: badge com 3 variantes de cor + estado oculto para null
  - TypeScript: 0 erros ✅ | synthesis-engine tests: 38/38 ✅ | Build: 49/49 ✅

## Progress Update (2026-06-17 — Iteração 25)

- [x] `narrativaCentral` visível na UI — `SynthesizedProfile.narrativaCentral` (top-3 primitivos dominantes com polaridades + tensão) agora exposta em duas superfícies:
  - `OneProfileCard` (dashboard): card com gradiente roxo→turquesa após Growth+Shadow
  - `MandalaNarrative` (página mandala): card com icon Brain e delay 0.2s após synthesisParagraph
  - 4 ficheiros: `useAkashaSynthesis.ts`, `AkashaLifeAreasDashboard.tsx`, `MandalaNarrative.tsx`, `MandalaNarrativeLoader.tsx`
  - Build: 49/49 ✅ | Suite: 1361/1361 ✅ | TypeScript portal: 0 erros ✅
- [x] Prioridade 2 marcada completa no ROADMAP — todas as 5 tradições integradas: synthesizePrimitives → deriveAkashaType → AkashaSynthesis → UI (Iter23-25)

## Progress Update (2026-06-17 — Iteração 27)

- [x] Prioridade 3 — I Ching integrado na síntese de áreas — generateAreaNarrativeFull agora inclui I Ching como 5ª voz na integratedNarrative
  Bug: hasCount não contava I Ching; templates SYNTHESIS só tinham 4 params; ichingBlock era descartado
  Fix: ParaFn tipo 5-param opcional; ichingCore extraído via coreOf(); hasIChing flag; 24 templates actualizados; fallbackSynthesis actualizado; 7 call sites passam ichingCore
  Todas as 5 tradições (Cabala/Astrologia/Tantra/Odu/I Ching) contribuem para o narrative integrado
  TypeScript: 0 erros | Suite: 1361/1361 | 93 files passed | 4 skipped
