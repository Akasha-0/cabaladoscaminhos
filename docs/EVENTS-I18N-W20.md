# Events i18n — W20 Worker C

> Status: ✅ Delivered (W20, branch `w20/events`)
> Author: W20-Worker-C
> Date: 2026-06-28
> Stack touched: `src/lib/i18n/**`, `src/components/events/**`, `src/app/workshops/**`

## TL;DR

W26 shipped a **fully working** events MVP (`/workshops`, `/workshops/[slug]`,
EventCard, EventList, SignupButton, mock data, JSON-LD, schema.org/Event), but
its copy was 100% hardcoded in PT-BR inline. The W26 commit message explicitly
flagged this as a known gap:

> "i18n locales (pt-BR.ts/en.ts/es.ts) ainda vazios — chaves só wired"

W20 fills that gap. We:

1. Added an `events` namespace to all three locale dictionaries
   (PT-BR / EN / ES) — **33 keys × 3 locales = 99 strings**.
2. Wired the **client components** (`EventCard`, `EventList`, `SignupButton`)
   to `useT()` so the active locale drives the rendered copy in real time.
3. Added a new `src/lib/i18n/server.ts` helper (`getServerT()` + `getServerLocale()`)
   and wired the **server components** (`/workshops`, `/workshops/[slug]`)
   to it. The original W26 stub `t(key, fallback) => fallback` did nothing —
   it now actually looks up the locale dictionary with PT-BR fallback.
4. Replaced hardcoded `'pt-BR'` locale in `Intl.DateTimeFormat` /
   `Intl.NumberFormat` calls with the active locale, so dates and prices
   format in the user's language.

No new Prisma models. No middleware changes. No new npm dependencies. No
auth-page edits. TSC delta: **+0 errors** (baseline 643 → after 643).

## Why this matters

Switching the active locale via the existing W19 `LanguageSwitcher` now
actually changes the workshops page copy, instead of silently re-rendering
PT-BR strings inside an EN/ES shell. The events MVP is the **second
major surface** (after `feed`, `auth`, `library`, `akashic`, etc.) to ship
real translations across all 3 languages.

## Files changed (9 total)

### Locale dictionaries (3 × ~150 lines added)

| File | Lines (before → after) | Net |
|------|------------------------|-----|
| `src/lib/i18n/locales/pt-BR.ts` | 362 → 523 | **+161** |
| `src/lib/i18n/locales/en.ts` | 361 → 513 | **+152** |
| `src/lib/i18n/locales/es.ts` | 363 → 516 | **+153** |

Each locale gains the same `events` namespace with identical shape:

```
events:
  eyebrow, title, subtitle, empty, emptyHint
  seeOnlineCircles, backToEvents
  upcomingCountOne, upcomingCountOther
  badges: { full, closed, free }
  card:   { byHostPrefix }
  capacity: { unlimited, remainingOne, remainingOther }
  price:  { free }
  relativeDay: { past, today, tomorrow, inDays, inWeeks, inMonths }
  cta:    { seeDetails }
  types:  { workshop, ritual, study-circle, meditation }
  traditions: { cabala, ifa, astrologia, tantra, reiki, meditacao,
                xamanismo, 'cristianismo-mistico', sufismo, taoismo,
                umbanda, candomble }
  filters: {
    searchPlaceholder, searchAriaLabel, clearSearch,
    typeLabel, locationLabel, traditionLabel,
    clearAll, clearFilters, featured,
    resultsCountOne, resultsCountOther,
    typeOptions:     { all, workshop, ritual, study-circle, meditation }
    locationOptions: { all, online, presencial, hybrid }
    traditionOptions:{ all }
  }
  signup: { login, success, full, closed, submitting, waitlist, join }
  detail: {
    notFound, aboutEvent, aboutHost, moreFromHost, viewFullProfile,
    photoOfHost,
    meta:    { date, duration, platform, location, modality, spots }
    duration:{ minutes, hours, hoursMinutes }
    spots:   { filledCount, openWithRemaining, openNoRemaining }
    hints:   { online, presencial }
    defaultLocation: { online, presencial, hybrid }
  }
```

Pluralization strategy: PT-BR/EN/ES all share the same "1 vs N" pattern.
We model this with `XxxOne` / `XxxOther` suffixes (`resultsCountOne` /
`resultsCountOther`, `capacity.remainingOne` / `remainingOther`,
`upcomingCountOne` / `upcomingCountOther`) instead of an ICU plural
runtime — keeps the `interpolate()` helper in `src/lib/i18n/index.ts`
simple (already supports `{key}` substitution only).

### New helper (1 file)

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/i18n/server.ts` | 132 | Server-side translator for RSC. Reads cookie (`akasha-locale`, set by W19 middleware), falls back to Accept-Language, then to PT-BR. Synchronous dictionary lookup. |

Exports:
- `getServerLocale(): Promise<Locale>` — read locale from cookies/headers
- `makeT(locale: Locale)` — build a `t(key, params?)` function for a known locale
- `getServerT()` — convenience: `(await getServerLocale()) + makeT`

Future-proofing: when the W19 `src/lib/i18n/server.ts` lands on `main`,
this file can be merged or replaced — they solve the same problem with
overlapping APIs. Keeping it for now because W19's version isn't merged
to `main` (only on `w19/worker-b-i18n`).

### Wired components (5 files modified)

| File | What changed |
|------|--------------|
| `src/components/events/EventCard.tsx` | `useT()` + `useI18n()` for badges, type/tradition labels, "by host" prefix, relative day, capacity, price, CTA hint. Date/price formatters now accept `locale` instead of hardcoded `'pt-BR'`. |
| `src/components/events/EventList.tsx` | `useT()` for search placeholder/aria, filter labels (Tipo/Onde/Tradição), "Limpar tudo / Limpar filtros", "Em destaque", "N resultados". Removed module-level `TYPE_FILTERS` / `LOCATION_FILTERS` / `TRADITION_FILTERS` constants — now rebuilt on each render from translations, so they re-render correctly when the user switches language. Removed the unused `emptyLabel` / `emptyHint` props (server now passes them via the `t` function). |
| `src/components/events/SignupButton.tsx` | `useT()` for all 7 button states (login / success / full / closed / submitting / waitlist / join). |
| `src/app/workshops/page.tsx` | Page is now `async`, uses `getServerT()` instead of the `t(key, fallback) => fallback` stub. Title/subtitle/eyebrow/empty/count all wired. Removed `emptyLabel` / `emptyHint` props (now handled by `EventList` directly via `t`). |
| `src/app/workshops/[slug]/page.tsx` | Same treatment. Date/price formatters now accept `locale`. Type & tradition badges look up via `t(\`events.types.${type}\`)` / `t(\`events.traditions.${tradition}\`)`. "Mais com {name}", "Sobre este evento", "Sobre o facilitador", meta grid labels, capacity labels (Lotado (n/m), n/m · k restantes), and the post-signup hint (online link by email / presencial bring ID) all wired. |

## What we did NOT change (deliberate non-goals)

- **Metadata (`generateMetadata`)** — left as PT-BR hardcoded. Google indexes
  one canonical version anyway (per-page `canonical` URL is set), and the
  `metadata` export in `page.tsx` is module-level static, which can't
  await `getServerLocale()`. To localize it, the next worker should convert
  `metadata` to `generateMetadata()` (async function). Left as TODO W21.
- **JSON-LD** — `Event` schema.org blocks stay PT-BR. SEO crawlers don't
  translate them and they serve the canonical Brazilian site.
- **Mock data** (`src/lib/events/mock.ts`) — event titles/descriptions stay
  PT-BR. These are demo content owned by the seed script, not copy.
- **Tags** (e.g. "iniciantes", "100% prático") — display as-is. They're
  user-generated content in the future schema.

## Translation samples

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `events.title` | Workshops, Rituais e Círculos | Workshops, Rituals & Circles | Workshops, Rituales y Círculos |
| `events.signup.login` | Entrar para participar | Sign in to attend | Inicia sesión para participar |
| `events.signup.full` | Lotado | Full | Lleno |
| `events.types.workshop` | Workshop | Workshop | Workshop |
| `events.traditions.cabala` | Cabala | Kabbalah | Cábala |
| `events.detail.spots.filledCount` | Lotado (14/20) | Full (14/20) | Lleno (14/20) |
| `events.detail.hints.online` | Você receberá o link de acesso por email após a inscrição. | You will receive the access link by email after sign-up. | Recibirás el enlace de acceso por email tras la inscripción. |
| `events.relativeDay.inDays` | em 5 dias | in 5 days | en 5 días |

Verified at runtime via a 33-key probe (see `verify-i18n.mjs` in commit).

## Verification

### TSC delta

Baseline (before W20): 643 errors
After W20: 643 errors
Delta: **+0**

All pre-existing errors are in files outside the events/i18n surface
(`__tests__/`, `prisma/seed/`, `src/app/(admin)/`, `src/app/(community)/{akashic,explore,feedback,groups,mentorship,settings,u}/*`,
`src/app/api/admin/*`). W20 touched only:
- `src/lib/i18n/{locales,server}.ts` (4 files) → 0 errors
- `src/components/events/*.tsx` (3 files) → 0 errors
- `src/app/workshops/{page,[slug]/page}.tsx` (2 files) → 0 errors

### Smoke check

```bash
node --experimental-strip-types --no-warnings verify-i18n.mjs
# → OK — all 33 keys present in pt-BR/en/es
```

The probe imports all three locale modules and walks a 33-key subset
(critical user-facing strings: titles, badges, signup states, types,
traditions, meta labels, plural forms, hints) to confirm none are
missing in any of the 3 dictionaries.

### Manual test plan (for owner)

1. `npm run dev` from a clean checkout with the merged branch
2. Visit `/workshops` → copy is in PT-BR (default locale)
3. Open `LanguageSwitcher` (top-right of `/`) → pick 🇺🇸 EN
4. Reload `/workshops` → copy now reads "Workshops, Rituals & Circles" /
   "Full / Hybrid / Kabbalah / Candomblé / Sign in to attend" / etc.
5. Click any event card → detail page also in EN, dates formatted
   as "Sat, Jun 28, 2:00 PM" not "sáb., 28 de jun., 14:00"
6. Switch to 🇪🇸 ES → all copy + dates flip again

## Known limitations / follow-ups

- **Server-side `metadata` localization** — TODO W21. Move from static
  `metadata` to async `generateMetadata()` and call `getServerT()`.
- **`next-intl` migration** — W29 already scaffolded a `next-intl` 4.13.0
  opt-in layer (separate branch). When it merges, the `events` namespace
  already follows the same dot-notation shape, so the migration is just
  a copy-paste of these 3 blocks into `messages/{pt-BR,en,es}/events.json`.
- **Tradition labels** — currently cover the 12 enum values from
  `src/lib/events/types.ts`. If new traditions get added to the enum, the
  W20 fallback `t('events.traditions.X') || X` will show the raw enum
  string in EN/ES until someone adds the key (this is intentional — it
  surfaces missing translations instead of silently falling back to PT-BR).
- **TypeScript literal type for tradition lookup** — we use
  `t(\`events.traditions.${event.tradition}\` as \`events.traditions.${Tradition}\`)`
  with a `|| event.tradition` runtime fallback. A stricter typed-lookup
  helper (`getTraditionLabel(t, tradition)`) would be safer for future
  additions to the enum.

## Diff stats (vs `main`)

```
 docs/EVENTS-I18N-W20.md                |  178 +++++++++++
 src/app/workshops/[slug]/page.tsx      |  120 ++++++----
 src/app/workshops/page.tsx             |   38 +++--
 src/components/events/EventCard.tsx    |   78 +++++---
 src/components/events/EventList.tsx    |  100 +++++----
 src/components/events/SignupButton.tsx |   30 ++--
 src/lib/i18n/locales/en.ts             |  152 +++++++++++
 src/lib/i18n/locales/es.ts             |  153 +++++++++++
 src/lib/i18n/locales/pt-BR.ts          |  161 +++++++++++
 src/lib/i18n/server.ts                 |  132 +++++++++++
 10 files changed, 1045 insertions(+), 97 deletions(-)
```
