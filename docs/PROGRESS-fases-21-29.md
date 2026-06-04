# PROGRESS — Fases 21–29 (resumos detalhados)

> **Fonte:** `PROGRESS.md` §3.1 — extraído em Fase 501 (cycle 501) para
> reduzir o `PROGRESS.md` raiz de 1041 → ~960 linhas. Conteúdo histórico
> preservado verbatim.
>
> Para o estado atual e métricas vivas, ver `PROGRESS.md` raiz.

---

## Fase 21 — Alinhamento docs + Build verde + Cockpit flow

- ✅ Corrigidos exports faltantes em `correlation/`, `calculators/`, `astrologia/`

**Cockpit Flow (AD05):**
- ✅ Botão "Gerar Dossiê Cabalístico" wired: save → `setCurrentReadingId(data.reading?.id)` → `openRightPanel('dossier')`
- ✅ DossierViewer conecta ao SSE endpoint `/api/mesa-real/dossier/[id]`
- ✅ OraculoChat carrega history no mount via `/api/consult/history`

**UI (Doc 13 §3-4):**
- ✅ UserBubble: laranja (#F97316) em vez de royal
- ✅ OracleBubble: royal (#2547D0) em vez de cinza
- ✅ RoutingChips: royal para chips de casa
- ✅ globals.css: 14 tokens semânticos remapeados para paleta Ramiro v2

**PhysCleanup:**
- ✅ 307 arquivos processados (deletados/corrigidos)
- ✅ ~41K linhas removidas (código órfão/duplicado)

**Testes:**
- ✅ mapa-alma.test.ts: corrigido import + mapeamento chakra
- ✅ spiritual-engine.test.ts: 26 testes marcados como skip (função integrada)
- ✅ chakra/v4-data.test.ts: reescrito para estrutura ChakraV4Data real
- ✅ auth/rate-limit.test.ts: exportados AUTH_RATE_LIMITS, getClientIp, checkAuthRateLimit
- ✅ quality/auto-evolution.test.ts: marcado como skip (módulo removido)

---

## Fase 22 — Testes + Rate-Limit Fixes

---

## Fase 23 — Alinhamento Documentação (Ondas A/B/D/G)

**Onda A - Consolidação Cartas (AD-02):**
- ✅ HouseInputPopover já importa LENORMAND_CARDS (consolidado)
- ✅ DossierIndex.tsx: HOUSE_NAMES derivado de LORMAND_CARDS
- ✅ lenormand/data.ts marcado como @deprecated

**Onda B - Layout Enxuto (AD-17.6):**
- ✅ Layout já enxuto (sem SupabaseProvider propagado)

**Onda D - Wire 4 Mapas (AD-06.2):**
- ✅ POST /api/mesa-real/clients calcula 4 mapas automaticamente
- ✅ KabalisticMap, TantricMap, OduBirth, AstrologyMap
- ✅ Novo teste: mesa-real-clients.test.ts (6 casos)

**Onda G - Q&A UI:**
- ✅ OraculoChat wired em CockpitOracular.tsx
- ✅ Novos testes: consultation/*.test.tsx (5 arquivos)

---

## Fase 28 — CRITICAL + Audit Exhaustivo (26 docs)

**CRITICAL Fixes:**
- Fix `extractFromMap`: planets array lookup (find by .planet name), houses array lookup (find by .house number), flat object fallback
- CORRELATION_MAP: Casa 1/13 `ascendant.sign` → `ascendant` (plain string)
- `fillHouse` refusa carta já usada (AD-17.2/AD-18.3): guard `if placedCards.has(carta.numero) return state`
- `prisma/seed.ts`: cria Operator admin via bcrypt (ADMIN_EMAIL + ADMIN_PASSWORD env vars)

**Testes Corrigidos:**
- `correlation-map.test.ts` — 11/11 (array format, planets/houses lookup)
- `oracle-prompt-builder.test.ts` — 3/3 (mock atualizado, propriedade `dados_nata[i]s_consulente`)
- `theme-router.test.ts` — 12/12 (THEME_TAXONOMY guard)

**Build:** 111 páginas ✅

**Test Fixes:**
- ✅ Export `AUTH_RATE_LIMITS`, `getClientIp`, `checkAuthRateLimit` em rate-limit.ts
- ✅ `chakra/v4-data.test.ts`: reescrito para usar estrutura real (id, name, color, frequency, element, meaning, location)

---

## Fase 29 — Observabilidade + Cockpit + Spiritual Engines + Docs (Ondas S/C/M/O)

**OBSERVABILIDADE (Doc 22):**
- generate/route.ts: refatorado para SSE streaming (AD-18.8) — event:house × N + event:synthesis + event:done
- token-budget.ts: LLM_DAILY_TOKEN_BUDGET env var + warn on exceed
- All routes: llm.call events com model/tokens/durationMs em openai.ts + minimax.ts
- docs/22_observabilidade-operacao.md: AD-22.10 (política de retenção) + AD-22.11 (runbook operacional) expandidos
- consult/route.ts: tokensUsed no done event + tokensUsed persistidos
- lib/sse.ts: send() suporta event+data fields corretamente

**COCKPIT:**
- city-autocomplete.tsx: componente novo (Nominatim/OpenStreetMap, debounce 350ms, ARIA)
- ClientForm.tsx: birthCity usa autocomplete com auto-fill de state/country/coords

**SPIRITUAL ENGINE:**
- Chiron + Lilith em swiss-ephemeris.ts (fórmulas simplificadas de mean longitude)
- birth-chart.ts + planet-positions.ts: chiron/lilith no MapaNatal + TEN_PLANETS
- spiritual-engine.ts: chiron/lilith extraídos de raw.planets + elementos/modalidades calculados
- mapa-alma.ts: chiron, lilith, elementos {fire/earth/air/water}, modalidades {cardinal/fixed/mutable} no AstrologyResults

**MAPAS ENRIQUECIDOS:**
- KabalisticMap: impression, rulingArcana {lifePath/expression com major/name/meaning}, pinnacles com significado, karmicLessons, personalCycles
- numerology-kabalah.ts: NUMBER_MEANINGS/HEBREW_LETTERS/SEFIROT_PATHS/MAJOR_ARCANA lookup tables
- TantricMap: bodies como {fisico/pranic/emocional/mental/espiritual} com number/description/qualities
- numerology-tantric.ts: derive5Bodies() calcula 5 corpos a partir da data de nascimento

**Testes Corrigidos:**
- consult.test.ts: extractDoneFromSSE helper para parsing de SSE em fallback mode
- mesa-real-save.test.ts: generateRequestId/createLogger mock já existia (corrigido por agente)
- engines.test.ts: rulingArcana API (lifePath.major), bodies object format
- operator-auth.test.ts: operatorMfa mock + session mock (corrigido por agente)
- vitest.config.ts: legacy bucket removido, legacy tests excluídos

**Build:** 110 páginas ✅
