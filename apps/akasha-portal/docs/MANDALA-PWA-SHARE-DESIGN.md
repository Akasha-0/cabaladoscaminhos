# Mandala PWA Offline + Web Share Design — Phase 8

## 1. Context and Objectives

Mandala Phase 8 adds two production-grade PWA capabilities to the Akasha Portal:

- **Offline resilience**: The Mandala chart, dashboard, and daily synthesis must remain readable and exportable even when the device has no network.
- **Web Share Target**: Installed PWA instances must receive shared content (images, URLs, text) from any native app and surface them as Mentor consultation drafts.

These two capabilities share the same foundation — the Service Worker and the manifest — and are designed to be implemented sequentially without breaking the existing Phase 7 authentication and data-fetching contracts.

---

## 2. Service Worker Strategy

### 2.1 Current State

`public/sw.js` (version `akasha-v0.0.4-pwa-v2`) implements:

| Route pattern | Strategy | Notes |
|---|---|---|
| `/icons/*`, `/_next/static/*`, `*.{png,svg,woff2}` | Cache-first | Populates STATIC_CACHE |
| `/api/akasha/transits/today` | Network-first, 503 JSON fallback | Populates API_CACHE |
| `/api/akasha/mandala` | Stale-while-revalidate | Returns cached immediately, refreshes in background |
| Navigation HTML | Stale-while-revalidate | Cached as shell |
| `/api/akasha/auth/*`, `/api/akasha/credits/*`, `/api/akasha/consult/*` | Bypass | Never cached |

**Gaps for Phase 8**:
- `/_next/static/` build hashes change on every deploy; the current SW does not self-invalidate when the app deploys (it relies on `skipWaiting` + `clients.claim` but `CACHE_VERSION` must be bumped manually).
- No background-sync queue for outbound user actions (save, share-draft creation) that fail offline.
- `share_target` receive URL `/compartilhar/receber` is not pre-cached (POST only, but the page shell should be available offline).
- Mandala SVG export assets (fonts, any external images embedded in the chart) are not explicitly covered.

### 2.2 Phase 8 Service Worker Changes

**File**: `public/sw.js`
**New version**: `akasha-v0.0.4-pwa-v3`

#### 2.2.1 Cache Groups (additions)

```js
const MANDALA_CACHE = `${CACHE_VERSION}-mandala`;

// Static assets requiring aggressive cache-first
const MANDALA_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon-180.png',
];

// User-facing pages that must be available offline
const OFFLINE_PAGES = [
  '/mandala',
  '/dashboard',
  '/meu-dia',
];
```

#### 2.2.2 Cache Strategies by Resource Type

**Mandala SVG assets** (fonts embedded via CSS `url()` or SVG `<use>`):
- Strategy: **Cache-first** — SVG elements are deterministic and immutable for a given chart state.
- Once a user's Mandala is fetched, the SVG layers (LayerDefs, LayerStars, Layer1–5) and associated CSS are frozen in cache. Re-exports always match the cached data.
- Font files (`/_next/static/*/fonts/*.woff2`): cached on first use. If fonts fail to load, the Mandala falls back to system fonts with no visual guarantee (acceptable degradation).

**Mandala API data** (`/api/akasha/mandala`):
- Strategy: **Stale-while-revalidate** (already implemented).
- **Phase 8 addition**: On `install`, do NOT pre-fetch Mandala API (user-specific, auth-gated). Instead, a " prefetch on first load" pattern: the app calls `navigator.serviceWorker.controller.postMessage({ type: 'CACHE_MANDALA' })` after the first successful `/api/akasha/mandala` response, instructing the SW to cache it for offline use.

**Share receive page** (`/compartilhar/receber`):
- Strategy: **Stale-while-revalidate** for the HTML shell only.
- The actual POST processing requires network; offline users receive a "Your content is queued and will be processed when you're back online" state stored in **Background Sync**.

**Daily synthesis** (`/api/akasha/transits/today`, `/api/akasha/daily`):
- Already network-first. Phase 8 adds **periodic background revalidation** via `BackgroundSync` API when available, so the daily content is always fresh on morning launch.

#### 2.2.3 Background Sync Queue

For the share-receive flow (`POST /api/share/receive`) and any future write operations:

```
offline-write-queue (BackgroundSync tag)
  → POST body serialized to IndexedDB
  → Sync fires when online
  → On conflict: latest write wins (timestamp-based)
```

Implementation: use the **Broadcast Channel API** alongside Background Sync so the app UI gets live feedback when the queued operation finally completes.

#### 2.2.4 Install/Activate Lifecycle

```js
// install: pre-cache shell + static assets
event.waitUntil(
  caches.open(STATIC_CACHE).then(cache => cache.addAll([
    ...APP_SHELL,
    ...MANDALA_ASSETS,
    // do NOT pre-cache /mandala, /dashboard — auth-gated, cache lazily
  ]))
);

// activate: purge old cache versions (already implemented)
// Phase 8 addition: also purge MANDALA_CACHE entries older than 30 days
```

#### 2.2.5 Navigation Request Guard

```js
// After fetch handler — offline fallback for navigation
if (request.mode === 'navigate') {
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(cached =>
        cached ?? caches.match('/')  // always serve at least the app shell
      )
    )
  );
}
```

---

## 3. SVG Export / Download

### 3.1 Approach: Client-Side Serialization via Canvas

The Mandala SVG is a self-contained `<svg viewBox="0 0 400 400">` rendered by `MandalaChart.tsx`. Export is performed entirely client-side — no server round-trip required.

**Export formats**:
| Format | Use case | Implementation |
|---|---|---|
| PNG (default) | Social sharing, WhatsApp, print | Canvas 2D `drawImage` |
| SVG | High-quality print, vector editing | Direct `outerHTML` serialization |
| JPEG | Smaller file size, legacy compatibility | Canvas 2D `toBlob('image/jpeg')` |

### 3.2 Export Utility

**File**: `src/lib/application/akasha/mandala-export.ts` (new)

```ts
// Pseudocode — exact types in implementation

interface ExportOptions {
  format: 'png' | 'svg' | 'jpeg';
  quality?: number;        // 0–1, for JPEG (default 0.92)
  scale?: number;          // pixel multiplier (default 2 → 800×800px export)
  includeMetadata?: boolean; // embed author + timestamp in SVG (default true)
}

/**
 * serializeMandalaSvg — extracts the rendered SVG outerHTML from the DOM
 * and optionally embeds inline fonts and images for a portable file.
 */
export function serializeMandalaSvg(
  svgElement: SVGSVGElement,
  options: ExportOptions
): string { ... }

/**
 * exportMandalaToPng — renders SVG to a high-DPI canvas and returns a Blob.
 * Uses Image + Canvas 2D API (no external library).
 */
export async function exportMandalaToPng(
  svgElement: SVGSVGElement,
  options?: Partial<ExportOptions>
): Promise<Blob> { ... }

/**
 * downloadMandala — triggers browser download of the exported Mandala.
 * Falls back to Web Share API on mobile if available.
 */
export async function downloadMandala(
  svgElement: SVGSVGElement,
  format: ExportOptions['format'],
  filename?: string
): Promise<void> { ... }

/**
 * shareMandala — uses navigator.share() if available, otherwise falls back
 * to downloadMandala. On failure (no Web Share support), shows a toast with
 * the PNG blob URL so the user can share manually.
 */
export async function shareMandala(
  svgElement: SVGSVGElement,
  title: string,
  text: string
): Promise<void> { ... }
```

### 3.3 Export Implementation Details

**SVG → Canvas**:
1. Clone the SVG node: `const clone = svgElement.cloneNode(true)`.
2. Inline all computed styles (SVG presentational attributes vs CSS properties) by walking computed styles and setting them as attributes on the clone.
3. Serialize: `const serializer = new XMLSerializer(); const svgStr = serializer.serializeToString(clone)`.
4. Encode: `const blob = new Blob([svgStr], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob)`.
5. Load into an `Image`: `const img = new Image(); img.src = url`.
6. Draw on canvas at `scale × viewBox` dimensions.
7. `canvas.toBlob()` → PNG or JPEG Blob.
8. `URL.revokeObjectURL(url)` to free memory.

**Font embedding** (for SVG export):
- Extract `@font-face` rules from `document.styleSheets`.
- Base64-encode fetched font files.
- Inject as `<style>` block inside the serialized SVG string.
- Result: portable, self-contained SVG with embedded fonts.

**Filename convention**:
```
mandala-akasha-{YYYYMMDD}-{HHMMSS}.{png|svg|jpg}
```
e.g., `mandala-akasha-20250619-143052.png`

### 3.4 Export UI Integration

**File**: `src/components/akasha/MandalaExportButton.tsx` (new)

- Adds a "Exportar / Compartilhar" button below the Mandala SVG on the `/mandala` page.
- Icon: `Download` from lucide-react (download) + `Share2` (Web Share).
- Button triggers a small popover/menu with three options: PNG, SVG, JPEG.
- On mobile, "Compartilhar" uses `shareMandala()`.
- On desktop, "Compartilhar" triggers `downloadMandala(format: 'png')`.
- Button requires `svgElement` ref — obtained via `useRef<SVGSVGElement>()` forwarded from `MandalaChart`.

### 3.5 Watermark / Attribution

All exported Mandala images include a subtle bottom-center attribution:
```xml
<text x="200" y="392" text-anchor="middle" font-size="8" fill="#555" opacity="0.6">
  Akasha Portal — akasha.cabala.pt
</text>
```
Injected programmatically during export serialization, not rendered in the live UI.

---

## 4. Web Share Target Integration

### 4.1 Current State

`public/manifest.json` already declares:

```json
"share_target": {
  "action": "/compartilhar/receber",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": { "title": "title", "text": "text", "url": "url" }
}
```

This only accepts `title`, `text`, and `url` — **no file/image support**. The corresponding API route at `src/app/api/share/receive/route.ts` handles text/URL POSTs today.

### 4.2 Phase 8 Web Share Target Design

The manifest must be extended to handle **incoming image files** from any native sharing sheet (WhatsApp, Photos, etc.).

#### 4.2.1 Manifest Additions

```json
// In public/manifest.json — additions to existing share_target block
"share_target": [
  {
    "action": "/compartilhar/receber",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": [
      { "name": "title", "required": false },
      { "name": "text",  "required": false },
      { "name": "url",   "required": false }
    ]
  },
  {
    "action": "/compartilhar/receber",
    "method": "POST",
    "enctype": "multipart/form-data",
    "accept": ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
  }
],
```

**Note**: Android Chrome requires a separate `share_target` entry per accept type. iOS Safari PWA share_target with files is limited; the `text`/`url` entry remains the primary cross-platform path.

#### 4.2.2 Share Receive API — Phase 8 Extensions

**File**: `src/app/api/share/receive/route.ts`

Phase 8 additions:

1. **Image file handling**: Parse `FormData` with a file field named `files[]`. Store the incoming image (max 10 MB, validated by content-type header) in a new `SharedImage` Prisma model.
2. **Database model**: `SharedImage { id, userId, imageUrl, thumbnailUrl, sourceApp?, sharedAt }` — stored in Supabase Storage or as a base64 blob in the DB (size-gated at 2 MB for DB).
3. **Mandala integration trigger**: If the shared content is an image, surface it in the `/oraculo` flow as a "imagem de referência" that the Mentor RAG can reference.
4. **Background Sync**: If the user is offline when sharing, the POST fails gracefully; the SW intercepts the failed POST, queues it in IndexedDB, and replays it via Background Sync when online. The receive API responds to the queued request identically.
5. **Rate limiting**: Maximum 20 shared items per user per day (enforced via Redis counter or DB flag).

#### 4.2.3 Share Receive Page — Phase 8 Additions

**File**: `src/app/[locale]/(akasha)/compartilhar/receber/page.tsx`

Phase 8 additions:

1. **Image preview**: If the POST contained a file, display a thumbnail of the received image on the landing page before redirecting.
2. **Offline queue status**: If Background Sync queued the request, show "Seu conteúdo foi guardado — será processado quando você voltar à rede." instead of immediately redirecting.
3. **OG image generation** (optional Phase 8 stretch): When a Mandala is shared via `navigator.share()` with `navigator.canShare({ files: [...] })`, generate a social-card PNG server-side and attach it to the share payload.

#### 4.2.4 Web Share API — Outbound Sharing

The `shareMandala()` utility (Section 3.4) uses:

```ts
// src/lib/application/akasha/mandala-export.ts

async function doNativeShare(blob: Blob, title: string, text: string) {
  if (navigator.canShare?.({ files: [blob], title, text })) {
    await navigator.share({ files: [blob], title, text });
  } else if (navigator.canShare?.({ title, text, url: blobUrl })) {
    // iOS fallback: share as URL blob (opens share sheet with image)
    await navigator.share({ title, text, url: blobUrl });
  } else {
    throw new Error('Share not supported');
  }
}
```

**Progressive enhancement**: `navigator.share` is only available on Android Chrome and iOS Safari. Desktop browsers receive a direct download. Feature-detect before calling.

---

## 5. manifest.json Updates

**File**: `public/manifest.json`

```diff
{
  "name": "Sistema Akasha",
  "short_name": "Akasha",
+ "id": "/",
+ "start_url": "/meu-dia",
+ "orientation": "portrait",
+ "display_override": ["standalone", "minimal-ui"],
+ "handle_links": "preferred",
+ "launch_handler": {
+   "client_mode": "navigate-existing"
+ },

  "share_target": [
    {
      "action": "/compartilhar/receber",
      "method": "POST",
      "enctype": "multipart/form-data",
-     "params": {
-       "title": "title",
-       "text":  "text",
-       "url":   "url"
-     }
+     "params": [
+       { "name": "title", "required": false },
+       { "name": "text",  "required": false },
+       { "name": "url",   "required": false }
+     ]
+   },
+   {
+     "action": "/compartilhar/receber",
+     "method": "POST",
+     "enctype": "multipart/form-data",
+     "accept": ["image/png", "image/jpeg", "image/webp"]
    }
  ],

  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
+   ],
+   "screenshots": [
+     {
+       "src": "/screenshots/mandala-export.png",
+       "sizes": "1080x1920",
+       "type": "image/png",
+       "form_factor": "narrow",
+       "label": "Mandala Akáshica — export e share"
+     }
  ],

  "categories": ["lifestyle", "spirituality", "health"],
+ "related_applications": [],
+ "prefer_related_applications": false
}
```

**Fields explained**:
- `"id": "/"` — prevents PWA duplication on some Android launchers.
- `"display_override"`: preferred `standalone`, fallback `minimal-ui` (shows URL bar on Safari).
- `"handle_links": "preferred"` — opens all Akasha links within the PWA, not the browser.
- `"launch_handler": { "client_mode": "navigate-existing" }` — reuses existing PWA instance on Android.
- `"screenshots"`: Required for Google Play Store PWA install eligibility (A2HS requires ≥1 screenshot).

---

## 6. Offline Fallback

### 6.1 Cached Data Available Offline

| Data | What's cached | Fresh when |
|---|---|---|
| App shell (HTML, CSS, JS) | Full Next.js static bundle | After first online visit |
| Mandala SVG layers + styles | Cached on first `/api/akasha/mandala` response | Stale-while-revalidate; updated on next online visit |
| `/meu-dia` (ONE SCREEN) | Stale HTML shell + last known Mandala API data | Same |
| `/dashboard` | Stale HTML + Mandala + last daily synthesis | Same |
| User auth session | Cookie (not affected by SW) | Session cookie unchanged |
| Fonts | `/_next/static/*/fonts/*.woff2` | Cache-first, long TTL |
| Icons | `icons/*` | Cache-first, immutable |

### 6.2 Data NOT Available Offline

| Data | Reason | User-visible behavior |
|---|---|---|
| `/api/akasha/transits/today` (live) | Network-first, 503 JSON on failure | Banner: "Trânsitos indisponíveis offline — mostrei os últimos dados guardados" |
| `/api/akasha/daily` | Network-first | Same banner |
| `/api/akasha/mandala` (current) | Auth-gated, cached on demand only | Shows last cached Mandala (may be stale by days) |
| New Mentor drafts | Requires server write | Queued via Background Sync |
| New shared content received | POST requires server | Queued via Background Sync |

### 6.3 Offline UI Indicators

Add to the Mandala page (`MandalaChart.tsx` or the page wrapper):

```tsx
// src/components/akasha/hooks/useOfflineStatus.ts (new)
export function useOfflineStatus() {
  const [isOffline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOffline;
}
```

When `isOffline === true`:
- Render a subtle banner at the top of the Mandala page: `"📴 Modo offline — mostrando dados de [date]. Some dados podem estar desatualizados."`
- The Export button remains fully functional (client-side SVG serialization needs no network).
- The Share button shows: "Compartilhar quando online" (disables native share, enables download-as-fallback).

### 6.4 Offline Page Shell

```tsx
// src/app/[locale]/(akasha)/compartilhar/receber/page.tsx additions

export default async function CompartilharReceberPage(...) {
  const isOffline = /* check via headers or client hint */;

  if (isOffline) {
    // Store the pending share in a cookie / sessionStorage and redirect
    // Background Sync will replay when online
    return (
      <div className="offline-pending">
        <p>📴 Seu conteúdo foi guardado.</p>
        <p>Quando voltar à rede, ele aparecerá automaticamente no Oráculo.</p>
        <Link href={`/${locale}/meu-dia`}>Voltar ao Meu Dia</Link>
      </div>
    );
  }
  // ... existing redirect logic
}
```

---

## 7. File Change Plan

### 7.1 New Files

| File | Purpose |
|---|---|
| `src/lib/application/akasha/mandala-export.ts` | SVG serialization, PNG/JPEG/SVG export, download, Web Share |
| `src/components/akasha/MandalaExportButton.tsx` | Export/Share UI (popover with format options) |
| `src/components/akasha/hooks/useOfflineStatus.ts` | `useOfflineStatus` hook |
| `src/app/[locale]/(akasha)/compartilhar/receber/offline-pending.tsx` | Offline queue confirmation screen |
| `prisma/migrations/20260619000000_add_shared_image_and_share_queue/` | DB migration for `SharedImage` and `ShareQueueItem` models |
| `public/screenshots/mandala-export.png` | Play Store screenshot (1080×1920) |

### 7.2 Modified Files

| File | Change |
|---|---|
| `public/sw.js` | Version bump to `akasha-v0.0.4-pwa-v3`; add MANDALA_CACHE; add Background Sync handler; add message types `CACHE_MANDALA`, `QUEUE_SHARE` |
| `public/manifest.json` | Add `share_target` array (text/URL + image), `display_override`, `handle_links`, `screenshots`, `id` |
| `src/app/api/share/receive/route.ts` | Add image `FormData` parsing; add `SharedImage` create; Background Sync queue replay |
| `src/app/[locale]/(akasha)/compartilhar/receber/page.tsx` | Add image preview; offline queue status |
| `src/app/[locale]/(akasha)/mandala/page.tsx` | Import and render `<MandalaExportButton>` below the chart |
| `prisma/schema.prisma` | Add `SharedImage` model; add `ShareQueueItem` model for offline queue |

### 7.3 Prisma Schema Additions

```prisma
// prisma/schema.prisma additions

model SharedImage {
  id         String   @id @default(cuid())
  userId     String
  imageUrl   String
  mimeType   String
  sizeBytes  Int
  sourceApp  String?
  sharedAt   DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}

model ShareQueueItem {
  id          String   @id @default(cuid())
  userId      String
  payload     Json     // Serialized FormData fields
  status      String   @default("pending") // pending | processing | done | failed
  createdAt   DateTime @default(now())
  processedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 8. Verification Criteria

### 8.1 Lighthouse PWA Score

- **Target**: ≥ 90 (per AGENTS.md F-228)
- **Checklist**:
  - [ ] `public/sw.js` registered in `_document.tsx` or `layout.tsx` via `<Script strategy="lazyOnload">`
  - [ ] All icon sizes present: 192×192, 512×512, maskable-512
  - [ ] `manifest.json` has `name`, `short_name`, `start_url`, `display`, `icons`, `theme_color`, `background_color`
  - [ ] No `output: 'export'` in `next.config.ts` (confirmed: not present)
  - [ ] Service worker responds with 200 when offline for cached assets
  - [ ] Install prompt fires on supported browsers

### 8.2 Export Functionality

- [ ] PNG export at 2× resolution (800×800px) downloads correctly
- [ ] SVG export downloads as valid, self-contained SVG (opens in Illustrator/Figma)
- [ ] JPEG export at quality 0.92 downloads correctly
- [ ] Attribution watermark present in all exports
- [ ] Export works with zero network (airplane mode)
- [ ] Web Share API `navigator.share({ files: [...] })` fires on Android Chrome PWA
- [ ] Desktop fallback (direct download) works in Chrome, Firefox, Safari

### 8.3 Web Share Target

- [ ] Share URL from Chrome Android → POST to `/compartilhar/receber` → redirect to `/oraculo?intent=...`
- [ ] Share text from WhatsApp → POST → redirect → text appears in Oráculo input
- [ ] Share image from Photos (Android) → POST with `multipart/form-data` file → `SharedImage` record created
- [ ] Offline share → Background Sync queues → replays when back online → record created
- [ ] Rate limit (20 shares/day) returns 429 gracefully

### 8.4 Offline Behavior

- [ ] App shell loads from cache when offline (`/`, `/mandala`, `/dashboard`)
- [ ] Mandala chart renders from cached `/api/akasha/mandala` response
- [ ] Offline banner visible on Mandala page
- [ ] Export button functional offline
- [ ] Share button degrades gracefully (shows "compartilhar quando online")
- [ ] No 404 on static assets when offline
- [ ] On reconnect, SW syncs queued writes without user action

### 8.5 Security

- [ ] Shared images validated by MIME type (no executable uploads)
- [ ] Max image size enforced (10 MB)
- [ ] `javascript:` URLs rejected in shared `url` field
- [ ] Auth required for all share receive POSTs (confirmed: redirect to login if no session)
- [ ] CORS headers prevent cross-origin abuse of share endpoint

---

## 9. Sequence and Dependencies

```
Phase 8a — Service Worker (Foundation)
  1. Update public/sw.js → v3
     - Add MANDALA_CACHE + message handler for CACHE_MANDALA
     - Add Background Sync registration
     - Add offline queue replay handler
  2. Update manifest.json → add id, display_override, handle_links, screenshots
     (Dep: manifest icons/screenshots assets ready)
  3. Register SW in _document.tsx or root layout via <Script strategy="lazyOnload">

Phase 8b — SVG Export
  4. Create src/lib/application/akasha/mandala-export.ts
     (Dep: MandalaChart.tsx SVG structure stable — confirmed: 5 layers, viewBox 400×400)
  5. Create src/components/akasha/MandalaExportButton.tsx
     (Dep: mandala-export.ts)
  6. Mount MandalaExportButton in src/app/[locale]/(akasha)/mandala/page.tsx
     (Dep: MandalaExportButton.tsx)

Phase 8c — Web Share Target
  7. Add prisma migration for SharedImage + ShareQueueItem
     (Dep: prisma/schema.prisma)
  8. Update src/app/api/share/receive/route.ts → image handling + queue replay
     (Dep: migration ready)
  9. Update src/app/[locale]/(akasha)/compartilhar/receber/page.tsx → image preview + offline state
     (Dep: share receive route)

Phase 8d — Offline UX
  10. Create src/components/akasha/hooks/useOfflineStatus.ts
  11. Add offline banner to mandala/page.tsx and dashboard
      (Dep: useOfflineStatus.ts)
  12. Add public/screenshots/mandala-export.png (Play Store screenshot)
      (Dep: UI finalized)

Phase 8e — Verification
  13. Run Lighthouse PWA audit → score ≥ 90
  14. Manual: airplane mode + Mandala export/display
  15. Manual: Android Chrome → share image from Photos → verify record in DB
  16. Manual: offline share → reconnect → verify queue replay
```

---

## 10. Critical Files Reference

| File | Why it matters |
|---|---|
| `public/sw.js` | Core offline engine; all Phase 8 SW changes land here |
| `public/manifest.json` | PWA identity; Share Target declaration; install UX |
| `src/app/api/share/receive/route.ts` | Share Target POST handler; Phase 8 primary API touch |
| `src/app/[locale]/(akasha)/compartilhar/receber/page.tsx` | Share Target landing page; offline state handling |
| `src/components/akasha/MandalaChart.tsx` | SVG root element; `viewBox="0 0 400 400"`; export ref source |
| `src/lib/application/akasha/mandala-export.ts` | **New** — all export logic lives here |
| `src/components/akasha/MandalaExportButton.tsx` | **New** — user-facing export/share UI |
| `prisma/schema.prisma` | `SharedImage` and `ShareQueueItem` models |
| `src/app/[locale]/(akasha)/mandala/page.tsx` | Mount point for MandalaExportButton |
| `AGENTS.md` §PWA | Confirms: no `output:'export'`, Vercel Fluid Compute, Lighthouse ≥ 90 |
