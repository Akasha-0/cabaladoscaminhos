# 🧪 Test Report — Akasha Portal

> Caderno de bordo do cron `akasha-tests-pre-release`
> Status diário dos testes

---

## 2026-06-26 (inicial)

### TypeScript
```
$ npx tsc --noEmit --skipLibCheck
✅ ZERO ERROS nos arquivos do projeto
⚠️ 1 erro em node_modules/csstype/index.d.ts (não relacionado ao nosso código)
```

### Lint
```
$ npx eslint src/
⚠️ ESLint quebrado por dep `hermes-parser` corrompida em node_modules
   Não bloqueante — pode ser resolvido com `npm install` limpo
```

### Testes existentes (Vitest)
```
$ ls src/components/community/__tests__/
- _mocks.tsx
- CommunityNav.test.tsx
- CommunityShell.test.tsx
- feed-page.test.tsx
- library-page.test.tsx
- notifications-page.test.tsx

Status: testes criados mas não rodados nesta sessão
(sandbox tem pouca RAM — vitest quebra por OOM)
```

### Cobertura estimada
| Módulo | Cobertura |
|---|---|
| Auth | 0% — não implementado |
| Feed | 0% — mocks |
| Library | 0% — mocks |
| Notifications | 0% — mocks |
| Groups | 0% — mocks |
| CommunityNav | 0% — testes existem |
| CommunityShell | 0% — testes existem |

### Pendências
- [ ] Rodar suite de testes em ambiente com mais RAM
- [ ] Adicionar testes pros componentes da página de perfil
- [ ] Adicionar testes pra OnboardingEspiritual (quando criado)
- [ ] Adicionar testes E2E com Playwright

### Status
- **PARTIAL** — projeto compila, testes existem mas não rodam no sandbox
- Pronto para implementação dos componentes reais
