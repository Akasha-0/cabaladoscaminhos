# Portal DOX

## Purpose
Aplicação web principal do Akasha — Next.js 16 + React 19. Portal
acessível aos usuários com Mandala, Mandato, Mentor, e dashboards.

## Ownership
- `src/app/`: App Router (rotas, layouts, server components)
  - `api/akasha/`: API routes (47 endpoints tracked)
  - `api/akasha/mandala/route.ts`: payload Mandala com `planets[].absoluteLongitude` (Fase 3)
  - `[locale]/(akasha)/`: rotas localizadas
- `src/components/`: Componentes React (akasha/*, ui/*, shared/*)
  - `src/components/akasha/MandalaChart.tsx`: SVG do Mandala (5 camadas). Fase 3: 10 glifos de planetas com longitude absoluta + 12 casas numeradas, sem rotação contínua. Fase 4: InfoPanel Tantra mostra 5 koshas védicas + 11 bodies Yogi Bhajan (sem mexer no SVG).
- `src/lib/`: Domain + application + infrastructure
  - `src/lib/infrastructure/rate-limit.ts`: rate limit compartilhado para middleware e Mentor, com backend Redis e fallback em memória
  - `src/lib/shared/zodiac.ts`: helpers do zodíaco — `formatDegreeToZodiac`, `GLYPHS_BY_PLANET`, `PLANET_COLORS`, `longitudeToSvgAngle` (Fase 3)
  - `src/lib/shared/koshas.ts`: 5 koshas védicas para InfoPanel Tantra (Fase 4). NÃO substitui os 11 bodies Yogi Bhajan do SVG.
- `messages/`: i18n (PT-BR primeiro)
- `middleware.ts`: rate limit via infrastructure, CORS, i18n
- `prisma/`: schema + migrations + seed
- `next.config.ts`: Next.js config (TypeScript)

## Local Contracts
- `requireAkashaApi()` para auth em rotas protegidas
- Zod para validação de input em rotas mutating
- Mandato + Mandala vêm de `@akasha/core` (5 Pilares)
- Mentor orquestra via `@akasha/mentor` (com RAG obrigatório)
- Middleware global e rota do Mentor compartilham `src/lib/infrastructure/rate-limit.ts`
- `data.astrology.planets[].absoluteLongitude` (0-360°) é a fonte de verdade para posicionar planetas no MandalaChart. `degree` (0-30°) é só para display no InfoPanel. (Mandala Fase 3, F-230)
- `data.tantra.bodies` tem 11 entries (Yogi Bhajan); 5 koshas védicas são conceito paralelo no InfoPanel, não no SVG. (Mandala Fase 4, F-230)

## Work Guidance
- PT-BR primeiro (i18n config)
- Pilar 4 (Odu) ethics invariant: aviso `requer consentimento + terreiro`
- LGPD by design: mínimo PII em responses (omitir pilares quando sensível)
- Não inventar correspondências esotéricas (AGENTS.md §5)
- MandalaChart: rotação contínua do anel zodiacal é PROIBIDA — torna a leitura impossível. Posição fixa com `longitudeToSvgAngle(0)=180°SVG` (ascendente à esquerda).

## Verification
- `pnpm test:run` antes de commit
- `pnpm typecheck` antes de merge
- `pnpm lint` antes de merge
- F-102 OWASP audit antes de prod deploy

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado no momento)
