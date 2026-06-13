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
