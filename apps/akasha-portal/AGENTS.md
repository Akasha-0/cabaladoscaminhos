# Portal DOX

## Purpose

Aplicação web principal do Akasha — Next.js 16 + React 19. Portal
acessível aos usuários com Mandala, Mandato, Mentor, dashboard,
Meu Dia, Minha Caixa, e 9 dimensões de vida. PWA-ready (F-228 mobile strategy).

## Ownership

- `src/app/`: App Router (rotas, layouts, server components)
  - `api/akasha/`: API routes (~50+ endpoints tracked, auth via JWT)
  - `api/akasha/mandala/route.ts`: payload Mandala com `planets[].absoluteLongitude` (Fase 3)
  - `api/akasha/daily/route.ts`: DailyContent (climate, ritual, alert, synthesis)
  - `[locale]/(akasha)/`: rotas localizadas (PT-BR primário)
    - `meu-dia/`: ONE SCREEN mobile (F-224, com AkashaAuthorityPrompt F-227)
    - `minha-caixa/`: 9 dimensões accordion (F-223, v0.0.19 spec)
    - `dashboard/`: Mandala + Daily synthesis + DailyDecisionCard
    - `diario/`: Mandato do Dia (F-235)
    - `atendimento/`: Wave 22.2 Zelador Attendance UI (sessão ao vivo)
    - `significado-primeiro/`: First-time user flow
- `src/components/`: Componentes React (akasha/_, ui/_, shared/\*)
  - `src/components/akasha/MandalaChart.tsx`: SVG do Mandala (5 camadas). Fase 3: 10 glifos de planetas com longitude absoluta + 12 casas numeradas + tooltips (F-206). Sem rotação contínua.
  - `src/components/akasha/MyDayScreen.tsx`: ONE SCREEN client component (F-224)
  - `src/components/akasha/AkashaAuthorityPrompt/`: F-227 decision card ("Paz vs Ansiedade")
  - `src/components/akasha/CaixaUnificada/`: F-223 9-dimensões accordion
  - `src/components/akasha/dashboard/`: AkashaLifeAreasDashboard (6 áreas Maslow)
  - `src/components/akasha/attendance/`: Wave 22.2 (AttendanceClient + ClientCard + DiscoveryCard + ActionBar + EmotionalStateToggle). UI visceral mobile-first do Zelador em sessão.
- `src/lib/`: Domain + application + infrastructure
  - `src/lib/grimoire/akasha-authority.ts`: F-227 framework (regra Corpo 3=paz, Corpo 4=ansiedade)
  - `src/lib/grimoire/synthesis/synthesizer.ts`: deriveAkashaAuthority + 9 dimensões
  - `src/lib/application/akasha/synthesis-engine.ts`: AkashaSynthesis + 9 Akasha Types + DailyDecision
  - `src/lib/application/akasha/mandala-context.tsx`: MandalaProvider + MandalaContextValue + useMandalaContext hook (Phase 3). Consolidates layer state + Akasha synthesis + F-227 authority; consumed by InnerMandalaChart.
  - `src/lib/application/akasha/narrative-generator.ts`: F-226 (12 caminhos Cabala + LIFE_PATH_NARRATIVES)
  - `src/lib/infrastructure/rate-limit.ts`: rate limit compartilhado para middleware e Mentor
  - `src/lib/shared/zodiac.ts`: helpers do zodíaco (Fase 3)
- `messages/`: i18n (PT-BR primeiro, EN secundário, validation em CI)
- `middleware.ts`: rate limit via infrastructure, CORS, i18n
- `prisma/`: schema + migrations + seed + D-040 design proposal (awaiting human approval)
- `next.config.ts`: Next.js config (TypeScript)

## Local Contracts

- `verifyAkashaToken(token, 'access')` para auth em rotas protegidas
- Zod para validação de input em rotas mutating
- Mandato + Mandala vêm de `@akasha/core` (5 Pilares)
- Mentor orquestra via `@akasha/mentor` (com RAG obrigatório)
- Middleware global e rota do Mentor compartilham `src/lib/infrastructure/rate-limit.ts`
- `data.astrology.planets[].absoluteLongitude` (0-360°) é a fonte de verdade para posicionar planetas no MandalaChart. `degree` (0-30°) é só para display no InfoPanel. (Mandala Fase 3, F-230)
- `data.tantra.bodies` tem 11 entries (Yogi Bhajan); 5 koshas védicas são conceito paralelo no InfoPanel, não no SVG. (Mandala Fase 4, F-230)
- `deriveAkashaAuthority(pilares: Partial<PilaresDados>)` — signature acepta parciais (UI safety)
- `useAkashaSynthesis` hook retorna `DailyContentUI` com `synthesis: AkashaSynthesisUI | null` (null = sem dados dos 5 Pilares ainda)
- `synthesis.oneProfile?: AkashaTypeProfileUI` — só presente se Pilar data completa
- **PWA** (F-228): `output: 'export'` PROIBIDO (incompatível com `cookies()` em rotas auth); usar Vercel Fluid Compute para runtime
- **MandalaContext** (Phase 3): `MandalaProvider` expõe layer state + Akasha synthesis + F-227 authority; `InnerMandalaChart` consome via `useMandalaContext()`. `MandalaData` permanece o contrato imutável de API.

## Work Guidance

- PT-BR primeiro (i18n config)
- Pilar 4 (Odu) ethics invariant: aviso `requer consentimento + terreiro`
- LGPD by design: mínimo PII em responses (omitir pilares quando sensível)
- Não inventar correspondências esotéricas (AGENTS.md §5)
- MandalaChart: rotação contínua do anel zodiacal é PROIBIDA — torna a leitura impossível. Posição fixa com `longitudeToSvgAngle(0)=180°SVG` (ascendente à esquerda).
- i18n: rodar `pnpm i18n:check` antes de commitar mudanças em `en.json` ou `pt-BR.json` (valida paridade de chaves). Rodar em CI também.
- PWA: ativar `manifest.json` + Service Worker (F-228 fase 1)
- F-227 Authority: aparece em `Meu Dia` (F-224) e em fluxos de ação importante
- 9 dimensões: usar `deriveAkashaAuthority` para decidir foco do dia

## Verification

- `pnpm test:run` antes de commit
- `pnpm typecheck` antes de merge (0 errors esperado)
- `pnpm lint` antes de merge (0 errors; 200+ warnings pré-existentes documentados)
- F-102 OWASP audit antes de prod deploy
- `pnpm i18n:check` antes de commit em i18n files
- Lighthouse PWA score >90 (F-228)

## Spec Coverage (v0.0.19 — Akasha Evolution)

| Feature                   | Status      | Files                                                                           |
| ------------------------- | ----------- | ------------------------------------------------------------------------------- |
| R-023 Synthesis Framework | ✅ Done     | `lib/grimoire/synthesis/`                                                       |
| F-223 Caixa Akasha        | ✅ Done     | `components/akasha/CaixaUnificada/` + `[locale]/(akasha)/minha-caixa/`          |
| F-224 Meu Dia             | ✅ Done     | `components/akasha/MyDayScreen.tsx` + `[locale]/(akasha)/meu-dia/`              |
| F-225 Sexualidade Deep    | ✅ Done     | `lib/application/akasha/synthesis-engine.ts:deriveSexualArchetype`              |
| F-226 Narrative Generator | ✅ Done     | `lib/application/akasha/narrative-generator.ts`                                 |
| F-227 Akasha Authority    | ✅ Done     | `lib/grimoire/akasha-authority.ts` + `components/akasha/AkashaAuthorityPrompt/` |
| F-228 Mobile Strategy     | ✅ Doc done | `.trae/specs/akasha-v0.0.19/mobile-strategy.md` (PWA-first)                    |

## Child DOX Index

- [prisma](file:///home/skynet/cabala-dos-caminhos/apps/akasha-portal/prisma/AGENTS.md) — DB schema, migrations, D-040 design proposal (awaiting human approval)
