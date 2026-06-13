# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog

### Ciclo 2 (2026-06-12)
- **feat(w2): AkashaSignificadoCard no dashboard principal** — substituído `LifePathInsightCard` (compacto) pelo `AkashaSignificadoCard` completo na página `/dashboard` (commit `0e1ef333`). Usuário agora vê interpretação profunda com seletor de nível (shadow/gift/siddhi) e seletor de 5 áreas de vida diretamente no dashboard, sem navegar para `/mapa/significado`.
- **fix(w2): hygiene — HTML entities e Next.js Link** — `&ldquo;`/`&rdquo;` corrigidos em `AkashaLifeAreasDashboard.tsx` (5 instâncias), `MandalaNarrative.tsx` (1 instância), `mandala/page.tsx` (`<a>` → `<Link>`), `Route` import não-utilizado removido de `AkashaLifeAreasDashboard`.

### Ciclo 3 (2026-06-12)
- **feat(w2): AkashaSignificadoCard mobile-responsive** — padding com `clamp()` para adaptação automática sem media queries; `maxWidth: '100%'` + `overflow: 'hidden'` + `box-sizing: 'border-box'` no container outer (commit `6b4977f1`).
- **feat(w2): AkashaSignificadoCard prop defaultNivel** — `defaultNivel?: 'shadow' | 'gift' | 'siddhi'` adicionado ao componente; dashboard passa `akashaProfile.dominantFrequency` para abrir no nível correto do perfil (commit `6b4977f1`).

### Ciclo 5 (2026-06-12)
- **fix(w2): .gitignore** — removida entrada `apps/akasha-portal/cap-build.sh` que inadvertidamente ignorava o script (só o dir `capacitor/` build output deve ser ignorado).

### Ciclo 6 (2026-06-12)
- **feat(w2): cap-build.sh — APK build completo** — script `apps/akasha-portal/cap-build.sh` que auto-detecta Java (`/home/skynet/java/jdk-*`) e Android SDK, copia `.next/standalone/` → `capacitor/`, roda `npx cap sync android` e `./gradlew assembleDebug` (commit `4e0d96f3`). APK de 4.4MB gerado em `android/app/build/outputs/apk/debug/app-debug.apk`. Usuário consegue build local com `./cap-build.sh`.
### Ciclo 7 (2026-06-12)
- **feat(w2): AkashaSignificadoCard — 7 áreas da vida** — expandido `AREAS_WITH_DATA` de 5 para 7 áreas, adicionando `sexualidade` e `espiritualidade` (que têm `aplicacao` em `VIDA_CONTENT`). DEC-005 menciona 9 áreas — `familia` e `criatividade` existem no tipo `LifeArea` mas não têm `aplicacao` em `interpretarVida`. Commit `056edbeb`. Usuário agora vê interpretação em todas as 7 áreas com dado.
- **fix(w2): type mismatch LifeArea** — `area` state alterado de `LifeArea` para `string`; casts `as LifeArea` adicionados onde `aplicacao` é indexada (3 lugares). Motivo: `proposito` e `sexualidade` não estão no tipo `LifeArea` mas são usados em `aplicacao` — mismatch reportado a w1 em `requests.md`.

### Ciclo 9 (2026-06-12)
- **docs(w2): PWA audit completa** — `public/manifest.json` e `public/sw.js` auditados. Manifest completo com icons (192/512/maskable), shortcuts, categories; service worker com estrategia cache-first para estaticos e network-first para transitos. `server.url` em `capacitor.config.ts` aponta para Vercel production — APK funciona online-only; offline capability bloqueada por architecture decision (P1). Requests.md atualizado com pedido P1 para integrador.
