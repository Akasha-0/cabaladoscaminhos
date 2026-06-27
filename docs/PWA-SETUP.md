# 📦 PWA Setup — Akasha Portal

> **Status:** ✅ PWA INSTALÁVEL + OFFLINE-FIRST
> **Data:** 2026-06-27
> **Branch:** `feat/mobile-pwa`
> **Stack:** Next.js 16 + Service Worker (vanilla) + Web App Manifest

---

## 🎯 O que é uma PWA?

Progressive Web App = site que se comporta como app nativo:

- 📲 **Instalável** — adiciona à tela inicial sem app store
- 🔌 **Offline-first** — funciona sem internet
- 🚀 **Rápido** — assets em cache, abre instantaneamente
- 🔔 **Notificações push** — mesmo com browser fechado
- 🪟 **Fullscreen** — sem barra de URL
- 📱 **Native-like** — splash screen, gestos, haptics

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (PWA Shell)                  │
├─────────────────────────────────────────────────────────┤
│  Service Worker (sw.js)                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Static Cache │ │  API Cache   │ │Runtime Cache │   │
│  │  (precache)  │ │  (TTL 5min)  │ │  (30d age)   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Cache Strategies                                       │
│  • Cache-first:   assets estáticos (CSS/JS/img/font)    │
│  • Network-first: API + navigation (com cache fallback)│
│  • SWR:           same-origin resources                │
│  • Offline:       fallback /offline.html               │
├─────────────────────────────────────────────────────────┤
│  Manifest (manifest.json)                               │
│  • Icons (72px-512px)                                   │
│  • Display: standalone                                 │
│  • Shortcuts (5 atalhos rápidos)                       │
│  • Theme color + background                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Arquivos

### 1. `public/manifest.json`

Define identidade da PWA:

| Campo | Valor | Por quê |
|---|---|---|
| `name` | Akasha Portal — Cabala dos Caminhos | Nome completo em "Sobre o app" |
| `short_name` | Akasha | Limite 12 chars — usado em home screen |
| `start_url` | `/?source=pwa` | Tracking de origem |
| `display` | `standalone` | Sem browser chrome |
| `theme_color` | `#fbbf24` | Dourado Akasha — cor da UI |
| `background_color` | `#0a0a0f` | Match com splash screen |
| `icons` | 9 tamanhos | Compatibilidade universal |
| `shortcuts` | 5 atalhos | Long-press menu |

### 2. `public/sw.js`

Service Worker. Versão atual: `akasha-v1`.

**Estratégias por tipo de request:**

| Tipo | Estratégia | Cache |
|---|---|---|
| `/api/*` | Network-first | `API_CACHE` (5 min TTL) |
| Navegação (HTML) | Network-first | `RUNTIME_CACHE` |
| CSS/JS/img/font | Cache-first | `STATIC_CACHE` |
| Cross-origin | Stale-while-revalidate | `RUNTIME_CACHE` |
| Outros same-origin | Stale-while-revalidate | `RUNTIME_CACHE` |

**Por que network-first para navegação?**
- Usuário sempre vê versão mais recente
- Cache só quando offline (e mostra offline.html)

**Por que cache-first para assets?**
- Performance: zero network round-trip
- Versão controlada via versioning (`?v=hash` ou cache name bumping)

### 3. `public/offline.html`

Fallback completo quando usuário está offline e tenta acessar página não cacheada.

- HTML inline zero deps (funciona mesmo sem SW)
- Animação floating (respeita `prefers-reduced-motion`)
- Auto-retry quando online
- Acessível (ARIA labels, skip-link)
- Safe-area insets

### 4. `src/components/pwa/UpdatePrompt.tsx`

Snackbar "Nova versão disponível".

- Detecta `updatefound` no SW
- Polling a cada 60min para verificar updates
- Botão "Atualizar" dispara `SKIP_WAITING` + reload
- Dismissal lembrado por 24h em localStorage

### 5. `src/hooks/usePWA.ts` (já existente)

Hook central com estado PWA:

```ts
const {
  isOnline,          // navigator.onLine
  isStandalone,      // display-mode: standalone
  canInstall,        // beforeinstallprompt disparado
  serviceWorkerReady,// SW registrado
  updateAvailable,   // nova versão detectada
  pendingSyncs,      // queue de syncs offline
  installApp,        // prompt de instalação
  updateApp,         // aplicar update
  queueSync,         // enfileirar sync offline
  processSync,       // processar queue
} = usePWA();
```

---

## 🚀 Fluxo de instalação

```
1. Usuário visita / (HTTPS obrigatório)
2. Browser dispara 'beforeinstallprompt'
3. usePWA captura evento, set canInstall = true
4. <InstallPrompt /> aparece após 1.5s
5. Usuário clica "Instalar"
6. installApp() chama prompt()
7. Se accepted: app adicionado à home screen
8. Próxima abertura: launch como standalone (sem browser chrome)
```

---

## 🔄 Fluxo de atualização

```
1. Dev faz deploy com novo sw.js
2. Browser baixa novo SW (background)
3. SW novo dispara 'install', pre-cache novos assets
4. SW novo fica em 'waiting' (não toma controle ainda)
5. usePWA detecta updatefound + state = 'installed'
6. <UpdatePrompt /> aparece após 1.5s
7. Usuário clica "Atualizar"
8. SW novo recebe 'SKIP_WAITING'
9. SW novo assume controle (activate)
10. controllerchange dispara
11. window.location.reload()
12. Usuário vê nova versão
```

**Se usuário ignorar:** SW waiting assume controle no próximo reload natural (fechar/ reabrir todas as abas).

---

## 🔌 Fluxo offline

```
1. Usuário perde conexão (offline event)
2. <OfflineIndicator /> aparece no topo
3. Próxima request a /api/*:
   - Tenta fetch → falha
   - Serve do cache (se não expirou)
   - Se não tem cache: 503 com { error: 'Offline' }
4. Navegação para página não cacheada:
   - Tenta fetch → falha
   - Tenta cache → serve versão antiga
   - Se não tem: /offline.html
5. Quando conexão volta:
   - online event
   - processSync() drena queue de ações offline
```

---

## 🧪 Como testar PWA localmente

### Pré-requisitos
- HTTPS (obrigatório para SW + install)
- Chrome DevTools → Application tab

### Chrome DevTools

1. **Manifest**
   - Application → Manifest
   - Verificar: nome, ícones, theme color, display

2. **Service Worker**
   - Application → Service Workers
   - Status: "activated and running"
   - Update on reload: ✅ (para iterar)

3. **Cache Storage**
   - Application → Cache Storage
   - Verificar 3 caches: static, api, runtime

4. **Lighthouse PWA audit**
   - F12 → Lighthouse → PWA category
   - Target: ≥ 90

### Modo offline

1. DevTools → Network → Throttling: "Offline"
2. Reload página
3. Verificar: assets carregam do cache, navegação mostra offline.html

### Update prompt

1. Editar `public/sw.js` (mudar `VERSION`)
2. Recarregar página (Update on reload habilitado)
3. UpdatePrompt deve aparecer em ~1.5s
4. Clicar "Atualizar" → reload → nova versão

---

## 📱 Compatibilidade

| Feature | Chrome Android | Safari iOS | Edge | Firefox |
|---|---|---|---|---|
| Install | ✅ | ✅ (Add to Home Screen) | ✅ | ❌ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push notifications | ✅ | ⚠️ (iOS 16.4+) | ✅ | ❌ |
| Background sync | ✅ | ❌ | ✅ | ❌ |
| App shortcuts | ✅ | ❌ | ✅ | ❌ |
| Share target | ✅ | ❌ | ✅ | ❌ |
| Protocol handlers | ✅ | ❌ | ✅ | ❌ |
| Vibration API | ✅ | ⚠️ (PWA only) | ✅ | ❌ |

**iOS limitations:**
- Vibration API só funciona em PWAs adicionados à home screen
- Push notifications requer iOS 16.4+ e add to home screen
- Background sync não suportado (queue fica em localStorage)

---

## 🛠️ Manutenção

### Adicionar nova página ao precache

Editar `public/sw.js`:

```js
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/nova-pagina',  // ← adicionar aqui
  // ...
];
```

⚠️ Incrementar `VERSION` para forçar re-download:

```js
const VERSION = 'akasha-v2'; // era v1
```

### Limpar cache programaticamente

```ts
navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
```

### Verificar versão ativa

```ts
navigator.serviceWorker.controller?.postMessage({ type: 'GET_VERSION' });
// Resposta: { type: 'SW_VERSION', version: 'akasha-v1' }
```

---

## 📊 Métricas esperadas (Lighthouse)

| Categoria | Target | Mobile target |
|---|---|---|
| Performance | ≥ 90 | ≥ 90 |
| Accessibility | ≥ 95 | ≥ 90 |
| Best Practices | ≥ 95 | ≥ 90 |
| SEO | ≥ 95 | ≥ 90 |
| **PWA** | ✅ installable | ✅ installable |

---

## 🐛 Troubleshooting

### "Add to Home Screen" não aparece no iOS
- iOS exige interação do usuário (botão Share → Add to Home Screen)
- Manifest deve ter `start_url`, ícones 152x152+ e `display: standalone`
- Service worker deve estar ativo (DevTools → Application)

### Service Worker não atualiza
- Verificar: `Update on reload` em DevTools → Application
- Forçar: DevTools → Application → Service Workers → "Unregister" + reload
- Ou: `?nocache=1` na URL

### Cache muito grande
- Chrome limita a ~6% do espaço em disco livre
- `MAX_AGE = 30 dias` no sw.js controla limpeza automática
- Limpar manualmente: DevTools → Application → Storage → Clear site data

### Push notifications não chegam (iOS)
- iOS 16.4+ necessário
- App DEVE estar adicionado à home screen (não funciona em browser)
- Verificar permissão: Settings → Safari → Advanced → Notifications

---

## 📚 Referências

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)
- [W3C: Web App Manifest](https://www.w3.org/TR/appmanifest/)

---

**Mantido por:** General + Coder
**Próxima revisão:** quando Stack Next.js major bump ou Lighthouse < 90
**Issues:** abrir PR referenciando este doc