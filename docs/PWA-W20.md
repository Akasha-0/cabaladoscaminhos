# 📦 PWA Evolution — Wave 20 (2026-06-28)

> **Status:** ✅ PWA v2 — Offline-first completo + background sync + share target
> **Branch:** `main`
> **Stack:** Next.js 16 + Service Worker v2 + IndexedDB + Web Share Target

---

## 🎯 O que mudou na Wave 20?

A Wave 11 entregou o esqueleto PWA (manifest, InstallPrompt, UpdatePrompt, OfflineIndicator). A Wave 20 transforma em app **de verdade offline**:

| Capacidade | Wave 11 | Wave 20 |
|---|---|---|
| Cache de páginas | ❌ só `offline.html` | ✅ Next.js `/offline` + cached routes |
| Mutations offline | ❌ rejeitadas | ✅ IndexedDB queue + background sync |
| Install prompt | ✅ nativo do Chrome | ✅ custom UI + heurística 2 visits |
| Share de outros apps | ❌ | ✅ Web Share Target API |
| Network resilience | ❌ falha imediata | ✅ network-first 3s timeout |
| API mutations (POST/PATCH) | ❌ cacheava | ✅ network-only (nunca cache) |

---

## 🏗️ Arquitetura Offline

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (PWA instalado)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  Service Worker v2   │    │  IndexedDB Queue     │      │
│  │  ─────────────────   │◄──►│  (akasha-pwa)        │      │
│  │  • install/activate  │    │  • sync-queue        │      │
│  │  • fetch router      │    │  • mutations:        │      │
│  │  • bg sync listener  │    │    - like/comment    │      │
│  │  • push handler      │    │    - post/bookmark   │      │
│  │  • version: v2       │    │    - follow          │      │
│  └──────────────────────┘    └──────────────────────┘      │
│           │                            │                   │
│           ▼                            ▼                   │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  Cache Storage       │    │  React UI            │      │
│  │  ─────────────────   │    │  ─────────────────   │      │
│  │  • static-v2  (shell)│    │  • InstallPrompt     │      │
│  │  • api-v2     (TTL5m)│    │  • BackgroundSync    │      │
│  │  • runtime-v2 (SWR)  │    │  • OfflineIndicator  │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Cache Strategies

| Recurso | Estratégia | TTL | Fallback |
|---|---|---|---|
| **App shell** (`/`, `/feed`, `/dashboard`, `/calendario`, `/chat`) | network-first c/ timeout 3s | até reload | `/offline` (Next.js) ou `/offline.html` |
| **API GET** (`/api/feed`, `/api/posts`, `/api/search`) | stale-while-revalidate | 5 min | JSON `{ error: 'Offline' }` |
| **API crítica** (`/api/notifications`, `/api/me`) | network-first | 5 min | JSON `{ error: 'Offline' }` |
| **API mutations** (POST/PATCH/PUT/DELETE) | **network-only** (nunca cache) | n/a | Erro de rede → IndexedDB queue |
| **Static assets** (`_next/static`, `/icons/*`, `/favicon.ico`) | cache-first | até reload | última versão em cache |
| **CDN** (fonts, images externas) | stale-while-revalidate | 30 dias | erro de rede |
| **Manifest** | cache-first | até reload | erro de rede |

**Versioning:** `CACHE_NAME = 'akasha-v2'`. Qualquer mudança nas estratégias de cache = bump manual da versão → activate event deleta caches antigos automaticamente.

---

## 🔄 Fluxo de Background Sync

### Cenário 1: Usuário curte um post offline

```
1. UI clica em "♥" no feed
2. mutations.like(postId) → IndexedDB enqueue
3. UI mostra "1 curtida pendente" (BackgroundSyncIndicator)
4. Usuário fica offline
5. ... tempo passa ...
6. Usuário volta online (ou SW detecta)
7. SW recebe 'sync' event com tag 'sync-mutations'
8. SW posta 'SYNC_REQUESTED' para clients
9. Client chama flushQueue() → fetch POST /api/feed/{id}/like
10. Sucesso → remove do queue
11. Client posta 'SYNC_COMPLETE' para SW
12. SW propaga para todos os clients
13. UI mostra "✓ 1 sincronizado" por 5s
```

### Cenário 2: User compartilha link de outro app

```
1. User está no Safari/Chrome, vê um paper interessante
2. Toca "Compartilhar" → "Akasha Portal"
3. SO abre POST /share-target (form-data: title, text, url)
4. /share-target/route.ts captura POST → 303 redirect com query params
5. /share-target/page.tsx renderiza form pré-preenchido
6. User revisa, adiciona tradição, publica
7. POST /api/posts → sucesso → redirect para /post/{id}
```

### Cenário 3: User abre app sem internet

```
1. User abre app PWA instalado
2. SW v2 serve a shell cached
3. Network-first tenta buscar com timeout 3s
4. Timeout → tenta cache da request específica
5. Sem cache → serve /offline (Next.js page)
6. /offline mostra:
   - Lista de pages cached (Feed, Dashboard, Calendário, Chat)
   - Botão "Tentar reconectar"
   - Auto-retry quando 'online' event dispara
```

---

## 🧪 Como Testar

### Chrome DevTools — Application Tab

1. **Verificar Service Worker registrado**
   - `chrome://devtools` → Application → Service Workers
   - Status: `activated and running`, source: `/sw.js`, version: `akasha-v2`

2. **Testar offline mode**
   - Application → Service Workers → ☑ Offline
   - Navegar para `/feed` → deve carregar do cache
   - Navegar para `/qualquer-coisa-nova` → deve cair em `/offline`

3. **Testar cache strategies**
   - Application → Cache Storage
   - Deve ter 3 caches: `akasha-v2-static`, `akasha-v2-api`, `akasha-v2-runtime`
   - Expandir cada um para ver entries

4. **Testar background sync**
   - Application → Storage → ☑ Offline
   - Clicar em "♥" em um post → deve aparecer indicador "1 pendente"
   - Desmarcar Offline → SW deve sincronizar automaticamente
   - Verificar no Console: `[SW akasha-v2] Background sync triggered: sync-mutations`

5. **Testar install prompt**
   - Limpar localStorage: `localStorage.clear()` no Console
   - Recarregar 2x → prompt custom deve aparecer (card no canto)
   - Aceitar → Chrome mostra prompt nativo final

6. **Testar Web Share Target**
   - Instalar PWA: Chrome menu → "Instalar Akasha Portal"
   - Em outro app (ex: Safari), tocar "Compartilhar" → "Akasha Portal"
   - App abre em `/share-target?title=...&text=...&url=...`

### Lighthouse Audit

```bash
pnpm dlx lighthouse http://localhost:3000/feed \
  --preset=mobile \
  --view \
  --only-categories=pwa,performance
```

Targets:
- PWA score: **≥ 90**
- Performance: **≥ 80**
- Installable: ✅

### Manual smoke

```bash
# 1. Build
pnpm build
pnpm start &

# 2. Open Chrome DevTools → Application
# 3. Install PWA
# 4. Test scenarios above
```

---

## 🔌 Compatibilidade

| Recurso | Chrome Android | Edge Desktop | Safari iOS | Firefox Android | Samsung Internet |
|---|---|---|---|---|---|
| Install (beforeinstallprompt) | ✅ | ✅ | ❌ (manual) | ⚠️ parcial | ✅ |
| Service Worker | ✅ | ✅ | ⚠️ (PWA só) | ✅ | ✅ |
| Cache API | ✅ | ✅ | ✅ (PWA) | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ | ✅ |
| Background Sync API | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Periodic Background Sync | ✅ (Chrome 80+) | ✅ | ❌ | ❌ | ❌ |
| Push API | ✅ | ✅ | ⚠️ (iOS 16.4+ PWA) | ⚠️ | ✅ |
| Web Share Target | ✅ (Android 71+) | ✅ | ❌ | ❌ | ✅ |
| App Banners | ✅ | ✅ | ❌ | ❌ | ✅ |

**Fallbacks implementados:**
- iOS Safari (sem Background Sync): `online` event listener faz flush
- Firefox (sem Web Share Target): botão "Compartilhar" nas actions do post
- Browser sem SW: SW não registra, app funciona como site normal

---

## 📁 Arquivos Entregues (Wave 20)

### Service Worker
- `public/sw.js` — **v2 rewrite** (467 → ~510 linhas)
  - Bump version `akasha-v2`
  - Network-only mutations (POST/PATCH/PUT/DELETE)
  - Timeout 3s para network-first
  - Cleanup automatic de caches antigos
  - Precache atômico (fallback individual em erro)
  - Mensagens expandidas (SYNC_REQUESTED, SYNC_COMPLETE, etc)

### Libs
- `src/lib/pwa/sync-queue.ts` — IndexedDB queue (250 linhas)
  - Schema v1 (akasha-pwa DB, sync-queue store)
  - Helpers: `mutations.like/comment/post/bookmark/follow`
  - `flushQueue()` com retry + signal
  - `registerBackgroundSync()` com feature detection
- `src/lib/pwa/visit-tracker.ts` — 2-visit heuristic (90 linhas)
  - LocalStorage persistence
  - `shouldShowInstallPrompt()` rules
  - `markPromptOutcome()` 7-day cooldown
- `src/lib/pwa/sync-handler.ts` — SW ↔ UI bridge (110 linhas)
  - `useSyncListener()` hook React
  - `registerSyncHandlers()` browser-level
  - Fallback para `online` event (Safari/Firefox)

### Components
- `src/components/pwa/InstallPrompt.tsx` — **rewrite** (260 linhas)
  - 2-visit heuristic
  - Custom UI (modal + card variants)
  - Lista de benefícios (offline, push, fullscreen)
  - Touch targets ≥ 48px, safe-area-inset
- `src/components/pwa/BackgroundSyncIndicator.tsx` — **novo** (200 linhas)
  - 4 estados: pending, syncing, success, error
  - Breakdown por intent (3 curtidas, 2 comentários)
  - Auto-hide após 5s
  - Polling 5s para refresh do count

### Pages
- `src/app/offline/page.tsx` — **nova** (Next.js fallback)
  - 22 linhas (server component)
- `src/app/offline/OfflinePageClient.tsx` — **nova** (190 linhas)
  - Lista de routes cached (verifica via `caches.match`)
  - Botão "Tentar reconectar" + auto-retry no event `online`
  - Status badge (online/offline) com pulse
- `src/app/share-target/page.tsx` — **nova** (server)
- `src/app/share-target/ShareTargetClient.tsx` — **nova** (290 linhas)
  - Detecção de tipo: link | quote | text
  - Pre-fill do form com dados compartilhados
  - Auth gate
  - Offline queueing
- `src/app/share-target/route.ts` — **nova** (POST handler → 303 redirect)

### Manifest
- `public/manifest.json` — updated
  - `start_url`: `/?source=pwa` → `/feed?source=pwa`
  - `id`: matching update
  - Já tinha: share_target, 9 icon sizes, 2 maskable, theme/background colors

### Layout
- `src/app/layout.tsx` — updated
  - `InstallPrompt` agora vem de `@/components/pwa/` (v2)
  - Adicionado `<BackgroundSyncIndicator />` no body

---

## 🚀 Como Estender

### Adicionar uma nova mutation offline

```ts
// Em src/lib/pwa/sync-queue.ts → mutations
reaction: (postId: string, kind: 'amen' | 'gracas') =>
  enqueueMutation({
    url: `/api/feed/${postId}/reactions`,
    method: 'POST',
    body: { kind },
    intent: 'reaction',  // adicionar ao SyncIntent union
    summary: `Reagir com ${kind} ao post ${postId}`,
  }),
```

### Adicionar uma nova página ao PRECACHE

```js
// Em public/sw.js → PRECACHE_URLS
'/minha-nova-page',
```

### Adicionar uma estratégia diferente para uma rota

```js
// Em public/sw.js → fetch handler
if (url.pathname === '/api/live-stream') {
  event.respondWith(networkOnly(request));  // nunca cacheia
  return;
}
```

---

## ⚠️ Limitações Conhecidas

1. **iOS Safari PWA**: Cache expira após ~7 dias sem uso (limitação do SO)
2. **iOS Safari**: sem `beforeinstallprompt` — usuário precisa usar "Adicionar à Tela de Início" manualmente
3. **Background Sync**: só Chrome/Edge (com flag) — outros browsers usam fallback do event `online`
4. **Web Share Target**: só Chrome/Edge Android e Samsung Internet — iOS/Desktop não suportam
5. **Service Worker scope**: apenas rotas servidas pelo mesmo path do SW — `/sw.js` em `/` cobre todo o app

---

## 📊 Métricas Esperadas

- **LCP offline**: < 1.5s (shell cached)
- **TTI offline**: < 2s
- **Sync latency**: < 3s para mutations pequenas
- **Cache hit rate**: > 70% para assets, > 40% para API GET
- **Install conversion**: +25% (vs. native Chrome prompt) — estim. baseado em apps com 2-visit heuristic

---

## 🔗 Referências

- [MDN — Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Share Target API](https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target)
- [Background Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)
- [web.dev — PWA install patterns](https://web.dev/articles/install-pwa)
- [web.dev — Offline UX](https://web.dev/articles/offline-ux)
- [Wave 11 doc — PWA-SETUP.md](./PWA-SETUP.md) (esqueleto original)
