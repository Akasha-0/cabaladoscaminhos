# coordination/w2/STATE.md — Worker w2 (UI/Mobile)

**Versão atual**: v0.1.2
**Última atualização**: 2026-06-12
**Ciclo**: 5

---

## Domínio
`apps/akasha-portal/src/components/**`, `apps/akasha-portal/src/app/**`, `public/**`

---

## Status: Ciclo 5 — COMPLETO ✅

### Feito neste ciclo

| Item | Status |
|------|--------|
| `cap-build.sh` criado em `apps/akasha-portal/` — copia `.next/standalone/apps/akasha-portal/public/` → `capacitor/`, roda `npx cap sync android` | ✅ Commitado `a61267da` |
| `package.json`: scripts `cap:sync` e `cap:build` adicionados | ✅ Commitado `a61267da` |
| `.gitignore`: removida entrada `apps/akasha-portal/cap-build.sh` (só o dir `capacitor/` build output deve ser ignorado) | ✅ Commitado `a61267da` |
| Script testado: `./cap-build.sh` executado — 31 arquivos copiados para `capacitor/`, sync android feito | ✅ |
| typecheck: 0 errors | ✅ Exit 0 |
| build: 46/46 páginas, compiled 11.0s | ✅ Exit 0 |
| lint: 0 errors, 305 warnings (pre-existentes w1/w3) | ✅ |

### Feedback Integrador — Resolvido
- `feedback-w2.md`: OBSOLETO — todos os 6 commits de `feature/akasha-v0.0.12` já integrados em main

### Bloqueadores
_Nenhum_

---

## 3 Próximos Passos (w2)

1. **[P3] APK build test** — rodar `cd android && ./gradlew assembleDebug` para verificar APK compila com assets syncados
   - **Impacto**: confirmação de APK gerável localmente

2. **[P3] Lint hygiene em w2 domain** — lint mostra 305 warnings todos em w1/w3; w2 domain (components + app) está limpo de warnings
   - **Impacto**: code quality; não bloqueia build

3. **[P3] Test E2E mobile** — Playwright viewport 375×812 para verificar `AkashaSignificadoCard` no dashboard (requer auth)
   - **Impacto**: garantia mobile-first antes de release

---

## Decisões Autônomas (w2)

- **cap-build.sh**: script auto-contido; resolve paths via `$(dirname "$0")`; verifica build standalone antes de copiar; `set -e` fail-fast
- **Gitignore capacitor/**: `apps/akasha-portal/capacitor/` é build output gitignored; `android/app/src/main/assets/public/` tb gitignored (android/.gitignore); sync é reprodutível via `cap:sync`
- **webDir: capacitor**: CI/CD deve rodar `cap:sync` após `pnpm build` para popular assets Android locais
- **Mobile CSS via clamp()**: padding responsivo `clamp(1rem, 4vw, 1.5rem)` — adapta de 320px a 1440px sem media queries
- **defaultNivel prop**: `AkashaSignificadoCard` aceita `defaultNivel` para inicializar no nível dominante do perfil; padrão `'gift'`
