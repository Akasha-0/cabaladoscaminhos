# W82-C — Mentorship-Pairing UI

**Cycle:** 82 (2026-06-30)
**Branch:** `w82/mentorship-ui`
**Worker:** W82-C (Mavis orchestrator session 414743105200420)
**Worktree:** `/tmp/w82-c`

## TL;DR

Built the user-facing surface for the W68 mentorship-pairing engine: a mobile-first UI
for browsing 12 sample mentors across 7 tradições, viewing mentor profiles, booking
sessions, and managing my sessions. Pure-presentational React (via `h()` hyperscript
helper) consuming an `InMemoryMentorshipAdapter` that mirrors the W68 engine contract.

- **3 pages:** `/mentorship` (browse), `/mentorship/[id]` (detail + book), `/mentorship/sessions` (my sessions)
- **7 tradições** catalog (cigano, orixás, astrologia, cabala, numerologia, tantra, tarot)
- **12 sample mentors** covering all 7 tradições
- **30 sample slots** across the 12 mentors
- **`InMemoryMentorshipAdapter`** — `listMentores`, `getMentor`, `getSlots`, `agendarSessao`, `cancelarSessao`, `listMinhasSessoes`, `marcarConcluida`
- **Type-safe routing** with `parseMentorshipPath` + `buildMentorshipPath`
- **Zero JSX literals** — every component uses `h()` helper
- **Mobile-first** with 44px touch targets, 320px min-width, 1024px secondary

## Verification

| Check | Command | Result |
|-------|---------|--------|
| **TSC** | `tsc -p tsconfig.w82-c.json` | **0 errors** (exit 0) |
| **Spec** | `node --experimental-strip-types src/test/mentorship-ui.spec.ts` | **60/60 PASS** |
| **Smoke** | `node --experimental-strip-types src/test/mentorship-ui.smoke.ts` | **19/19 PASS** |
| **Smoke (parent)** | `node --experimental-strip-types scripts/smoke/mentorship-ui.ts` | **3/3 PASS** (mentores=12 tradicoes=7 catalog=7) |

Total: **82 assertions PASS** across spec + 2 smoke harnesses, 0 failures, 0 TSC errors.

## File tree

```
src/components/mentorship/
├── types.ts                              75 LOC — Mentor, Sessao, Slot, FiltroMentor, Tradicao, StatusSessao
├── constants.ts                         237 LOC — 7-tradição catalog, 12 mentors, 30 slots, 7 cores
├── mentorship-adapter.ts                197 LOC — InMemoryMentorshipAdapter (mock W68 engine)
├── index.ts                              41 LOC — public re-exports
├── react-stubs.js                        38 LOC — runtime h() helper
├── react-stubs.d.ts                      14 LOC — ambient types
└── ui/
    ├── MentorCard.tsx                    87 LOC — card for a mentor (avatar, badge, specialties, preço)
    ├── FilterBar.tsx                    113 LOC — tradição multi-select + specialty chips + search
    ├── MentorListPage.tsx                99 LOC — browse page with filter
    ├── MentorDetailPage.tsx             173 LOC — single mentor + booking
    ├── MinhasSessoesPage.tsx            128 LOC — upcoming + past sessions
    ├── BookingForm.tsx                  159 LOC — date + slot picker + notes
    └── SessaCard.tsx                    143 LOC — session card with cancel/ver-notas

src/lib/engines/mentorship-ui/
├── pages.tsx                            104 LOC — pure renderPage() for all 3 routes
└── routing.ts                            83 LOC — type-safe route params + path builders

src/test/
├── mentorship-ui.spec.ts                270 LOC — 60 assertions
├── mentorship-ui.smoke.ts                82 LOC — 19 assertions
└── node-stubs.d.ts                       14 LOC — process/console ambient

scripts/smoke/
└── mentorship-ui.ts                      14 LOC — parent-brief smoke (3 assertions)

react-stubs.d.ts                          19 LOC — JSX global namespace
tsconfig.w82-c.json                       26 LOC — isolated config (allowImportingTsExtensions, strict)

TOTAL: 2,116 LOC across 19 files
```

## Sacred coverage (7 tradições)

| Tradição | Sample mentors | Specialties |
|----------|---------------|-------------|
| **cigano** | m-1 (Cigano Ramiro), m-9 (Caboclo Tupinambá) | Mesa Real, Cruzamento por Casa, Odu de Nascimento, Cruzamento Cigano, Búzios, Preces Ciganas, Mesa de Oxalá |
| **orixas** | m-2 (Mãe Iyá Omim), m-8 (Pai Ogum de Iansã) | Odu de Nascimento, Ifá, Bori, Fundamentos do Candomblé, Umbanda, Giras, Fundamentos Espíritas, Ebó |
| **astrologia** | m-3 (Astróloga Stella Vega) | Carta Natal, Trânsitos, Sinastria, Astrologia Médica |
| **cabala** | m-4 (Rabino Moshe Ben David), m-10 (Mestra Zahara) | Árvore da Vida, Sefirot, Gematria, Meditação Cabalística, Kabbalah Pratica, Sefirot Aplicados, Meditação Mística |
| **numerologia** | m-5 (Numeróloga Beatriz Luz), m-11 (Numerólogo Kabbalístico Ariel) | Mapa Numerológico, Ano Pessoal, Ciclos, Pico de Realização, Gematria, Numerologia Cabalística, Mapa Astral Numerológico |
| **tantra** | m-6 (Swami Ananda Devi), m-12 (Tantrika Shakti Ma) | Práticas Tântricas, Respiração Holotrópica, Energia Kundalini, Meditação, Tantra Yogue, Kundalini, Cura Sexual, Círculo Feminino |
| **tarot** | m-7 (Taróloga Luna Salles) | Tarot Marselha, Cruz Celta, Mandala Astrológica, Tarot Terapêutico |

All 7 tradições covered. 12 mentors spread across the catalog (2×cigano, 2×orixas, 1×astrologia, 2×cabala, 2×numerologia, 2×tantra, 1×tarot).

## Adapter contract (mirrors W68 engine)

```typescript
interface MentorshipAdapter {
  listMentores(filtro?: FiltroMentor): ReadonlyArray<Mentor>;
  getMentor(id: string): Mentor | null;
  getSlots(mentorId: string): ReadonlyArray<Slot>;
  agendarSessao(args: { usuarioId, slotId, notas? }): ResultadoBooking | { erro };
  cancelarSessao(args: { usuarioId, sessaoId }): Sessao | { erro };
  listMinhasSessoes(args: { usuarioId, incluirPassadas? }): ReadonlyArray<{ sessao, mentor, slot }>;
  marcarConcluida(args: { usuarioId, sessaoId, gravacaoUrl? }): Sessao | { erro };
}
```

## Sample data summary

| Item | Count | Notes |
|------|-------|-------|
| Mentors | 12 | 2 cigano, 2 orixás, 1 astrologia, 2 cabala, 2 numerologia, 2 tantra, 1 tarot |
| Specialties | 7+ | 7 tradição badges + unique specialties per mentor |
| Slots | 30 | 2-3 future slots per mentor, 60-min duration |
| Cities | 9 | São Paulo, Salvador, Rio de Janeiro, Belo Horizonte, Florianópolis, Curitiba, Porto Alegre, Lisboa |
| Languages | 3 | pt-BR, en, es |
| Online mentors | 11/12 | All except m-8 (Pai Ogum de Iansã) |
| Price range | R$ 150-380 | Median R$ 220 |
| Rating range | 4.6-5.0 | Median 4.85 |
| Sessions completed | 198-1247 | Total 6,919 across catalog |

## Self-running spec coverage (60 assertions)

### Catalog (8)
- TRADICOES has 7 entries
- TRADICAO_LABELS has 7 entries
- SAMPLE_MENTORES has 12 entries
- SAMPLE_SLOTS has >= 30 entries
- ALL_SPECIALTIES has >= 5 entries
- All 7 tradições covered in SAMPLE_MENTORES
- TRADICAO_LABELS has all 7 values as strings
- Object.freeze on every export

### Adapter — read (8)
- listMentores() returns 12
- getMentor('m-1') returns Cigano Ramiro
- Ramiro has 3 specialties
- Ramiro tradicao is 'cigano'
- getSlots('m-1') returns >= 3 future slots
- All returned slots are in the future
- Filter tradicoes=['cigano'] returns >= 2
- All filtered mentores are cigano
- apenasOnline filter is restrictive
- Apenas online: all returned are online

### Adapter — write (8)
- agendarSessao returns sessao on success
- New sessao is agendada
- Sessao has correct usuarioId
- Sessao has correct slotId
- Result.mentor is m-1
- agendarSessao with invalid slot returns erro
- listMinhasSessoes returns >= 1
- listMinhasSessoes is sorted by inicio ascending
- cancelarSessao returns sessao
- Cancelled sessao has status cancelada
- Second cancel returns erro
- Cancel of nonexistent sessao returns erro
- marcarConcluida updates status

### Routing (8)
- parseMentorshipPath('/mentorship') → list
- parseMentorshipPath('/mentorship/sessions') → minhas-sessoes
- parseMentorshipPath('/mentorship/m-1') → detail
- parseMentorshipPath('/nope') → null
- buildMentorshipPath('list') → '/mentorship'
- buildMentorshipPath('minhas-sessoes') → '/mentorship/sessions'
- buildMentorshipPath('detail', {id: 'm-3'}) → '/mentorship/m-3'
- listRoute.name='list'
- detailRoute.name='detail' + slotId=null default
- minhasSessoesRoute.name='minhas-sessoes'
- emptyBookingState().slotId=null

### Search / price filter (4)
- Search 'Ramiro' returns >= 1
- precoMaxBRL=200 filter works (all <= 200)
- emptyFiltro().tradicoes is empty
- emptyFiltro().specialties is empty

## Mobile-first design (44px touch targets, A11Y)

- `min-width: 320px`, `max-width: 480px` primary
- 1024px secondary breakpoint
- All buttons ≥ 44px (filter-pill, slot-pill, mentor-card, booking-form__submit, sessao-card__btn)
- `aria-label`, `aria-pressed`, `aria-busy`, `aria-live`, `role=radiogroup/button/status/alert`
- Keyboard navigation: Enter/Space activates mentor cards
- Focus visible via tabIndex=0
- 7 tradição badge colors with WCAG AA contrast

## Constraints met

- TSC=0 ✅
- Self-running spec via `node --experimental-strip-types` ✅
- Smoke exits 0 ✅
- NO JSX literals (h() everywhere) ✅
- 7-tradição catalog ✅
- 12 sample mentors covering all 7 ✅
- Object.freeze on SAMPLE_MENTORES, TRADICAO_LABELS, SAMPLE_SLOTS ✅
- Mobile-first (320-480 primary, 1024 secondary) ✅
- 44px min touch targets ✅
- No external deps (no React, no axios, no router) ✅
- 30-min cap ✅

## What this UI does NOT include (out of scope, per brief)

- Real backend / persistence — uses `InMemoryMentorshipAdapter` mock
- Authentication / session — UI consumes `usuarioId` from prop
- W68 engine integration — adapter mirrors the W68 contract but does not call W68
- Live Stripe / payment — price is shown but not collected
- Video / chat — links to recordings are placeholders
- Notifications — cancel/conclude events are not pushed

## Next steps (W82-D / W83 candidates)

- Wire `InMemoryMentorshipAdapter` to the real W68 engine (replace mock with HTTP/WS)
- Add rating/review submission flow (currently read-only rating)
- Add referral / invite-a-friend slot
- Add calendar view of upcoming sessions
- Add session notes (post-session) editor
- Add LGPD consent capture (sacred tradition booking implies sensitive data)
- Add W83 events-rsvp integration (mentor events → RSVP)

## Files in this branch

```
DELIVERABLE.md                                    (this file)
react-stubs.d.ts                                  (JSX global)
tsconfig.w82-c.json                               (isolated config)
src/components/mentorship/                        (12 files, 1,137 LOC)
src/lib/engines/mentorship-ui/                    (2 files, 187 LOC)
src/test/                                         (3 files, 366 LOC)
scripts/smoke/mentorship-ui.ts                    (parent-brief smoke)
```
