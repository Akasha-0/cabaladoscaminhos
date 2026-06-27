# 🧪 Testing Guide — Akasha Portal

> Como rodar, como adicionar e como fazer troubleshooting dos testes
> (Vitest + Playwright) deste projeto.

---

## TL;DR

```bash
# 1) Testes unitários / SSR (Vitest) — rápidos, em memória
npm run test:run                       # roda uma vez
npm test                               # modo watch

# 2) Smoke tests E2E (Playwright) — sobem o dev server, abrem chromium
npx playwright install chromium        # só na primeira vez
npm run e2e:smoke                      # roda os smoke tests
npm run e2e:screenshots                # captura screenshots em .screenshots/

# 3) Tudo junto (local CI)
bash scripts/ci-local.sh               # tsc + lint + vitest + playwright + relatório
```

---

## 1. Stack

| Camada | Ferramenta | Para quê |
|---|---|---|
| **Unit / SSR** | Vitest + jsdom + Testing Library | Componentes, hooks, rotas SSR |
| **E2E smoke** | Playwright | Rotas em browser real (chromium mobile) |
| **TS check** | `tsc --noEmit` | Garantir que nada quebrou de tipo |
| **Lint** | ESLint (next config) | Padrão de código |

Tudo já está em `devDependencies` do `package.json` — **nenhum `npm install` extra é necessário**, exceto o binário do chromium do Playwright.

---

## 2. Estrutura de testes

```
cabala-dos-caminhos/
├── e2e/                                  ← Playwright specs
│   ├── smoke.spec.ts                     ← 9 testes de rotas chave
│   └── screenshots.spec.ts               ← 8 capturas de PNGs
│
├── __tests__/                            ← Vitest suites novos
│   └── ssr/
│       └── smoke.test.tsx                ← SSR das rotas principais
│
├── tests/                                ← Vitest suites legados
│   ├── api/
│   ├── components/
│   ├── e2e/
│   ├── integration/
│   ├── middleware/
│   └── setup.ts
│
├── playwright.config.ts                  ← config E2E
├── vitest.config.ts                      ← config Vitest
└── .screenshots/                         ← saída de screenshots (gitignored)
```

---

## 3. Configurações

### 3.1 `playwright.config.ts`

- **baseURL**: `http://localhost:3000`
- **viewport**: `iPhone 13` (390×844) — mobile-first porque o uso real é mobile
- **workers**: `1` — sandbox tem pouca RAM, paralelismo derruba por OOM
- **timeout**: `30s` por teste (Next.js dev é lento)
- **webServer**: sobe `npm run dev` automaticamente se nada estiver rodando
- **trace/screenshot/video**: só em falha (economiza disco)
- **deviceScaleFactor**: `2` (densidade retina)

Para mudar para desktop, edite o bloco `projects`:

```ts
projects: [
  { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile-chromium', use: { ...devices['iPhone 13'] } },
]
```

### 3.2 `vitest.config.ts`

- **environment**: `jsdom` (DOM simulado)
- **globals**: `true` (`describe`, `it`, `expect` sem import)
- **alias**: `@ → ./src`
- **env**: `JWT_SECRET` + `DATABASE_URL` placeholder (para que imports não falhem)
- **exclude**: pula `*.test.skip` e `*.test.disabled`

---

## 4. Como rodar

### 4.1 Vitest (rápido)

```bash
npm run test:run                # roda tudo uma vez
npm test                        # modo watch (reroda ao salvar)
npm run test:community          # só os testes da pasta community
```

Saída esperada:

```
✓ tests/integration/auth-login.test.ts (3)
✓ tests/integration/auth-register.test.ts (5)
...
Test Files  18 passed (18)
     Tests  132 passed (132)
```

### 4.2 Playwright (E2E)

```bash
# primeira vez: instalar chromium
npx playwright install chromium

# rodar smoke (sobe dev server automaticamente)
npm run e2e:smoke

# rodar só os screenshots
npm run e2e:screenshots

# rodar todos os specs
npx playwright test

# rodar com UI (debug interativo)
npx playwright test --ui

# rodar 1 teste específico
npx playwright test -g "waitlist submit"

# gerar relatório HTML (CI mode)
CI=1 npx playwright test
# resultado em playwright-report/index.html
```

Saída esperada:

```
Running 9 tests using 1 worker

  ✓  1 [mobile-chromium] › smoke.spec.ts:18 › home renders (2.4s)
  ✓  2 [mobile-chromium] › smoke.spec.ts:31 › validation page works (1.8s)
  ...
  9 passed (28.4s)
```

### 4.3 CI local completo

```bash
bash scripts/ci-local.sh
```

Equivalente a rodar `tsc + lint + vitest + playwright` em sequência.
Gera `docs/CI-RUN.md` com o que passou/falhou.

---

## 5. Adicionando um novo teste

### 5.1 Novo teste unitário / SSR (Vitest)

```bash
# Criar arquivo em __tests__/ ou src/**/__tests__/
touch src/components/foo/__tests__/Foo.test.tsx
```

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Foo } from '../Foo';

describe('<Foo />', () => {
  it('renders name prop', () => {
    render(<Foo name="Akasha" />);
    expect(screen.getByText('Akasha')).toBeInTheDocument();
  });
});
```

Roda com `npm run test:run src/components/foo`.

### 5.2 Novo teste E2E (Playwright)

```bash
touch e2e/fluxo-novo.spec.ts
```

```ts
import { test, expect } from '@playwright/test';

test('novo fluxo E2E', async ({ page }) => {
  await page.goto('/rota-nova');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

Roda com `npx playwright test e2e/fluxo-novo.spec.ts`.

### 5.3 Adicionar rota aos screenshots

Edite `e2e/screenshots.spec.ts` e adicione:

```ts
{ name: 'minha-rota', path: '/minha-rota' }
```

Pronto, próxima execução gera `.screenshots/minha-rota.png`.

---

## 6. Troubleshooting

### 6.1 "OOM / JavaScript heap out of memory"

Sintoma:
```
FATAL ERROR: Reached heap limit Allocation failed
```

Causa: Next.js dev + jsdom + Playwright juntos consomem > 2 GB.

Mitigações:
1. **Vitest**: rodar arquivos individuais em vez de toda a suite
   ```bash
   npx vitest run __tests__/ssr/smoke.test.tsx
   ```
2. **Playwright**: já roda com `workers: 1`, mas se persistir:
   ```bash
   NODE_OPTIONS="--max-old-space-size=2048" npx playwright test
   ```
3. **Matar processos Node órfãos**:
   ```bash
   pkill -f "next dev"
   pkill -f "playwright"
   ```
4. **Subir o sandbox com mais RAM** (recurso do host, não do projeto)

### 6.2 "TimeoutError: page.goto exceeded 15s"

Sintoma: teste demora mais que 15s para carregar rota.

Causas comuns:
- Primeira compilação do Next.js (cold start) demora 30–60s — Playwright espera só 15s por padrão.

Mitigações:
1. Aumentar `navigationTimeout` em `playwright.config.ts` (já em 15s; pode ir a 30s)
2. Pré-aquecer o dev server antes de rodar testes:
   ```bash
   npm run dev &  # em background
   sleep 30       # deixa compilar
   npx playwright test
   ```
3. Rodar contra `next start` + `next build` em vez de dev mode (muito mais rápido, mas perde HMR)

### 6.3 "Chromium not found"

```bash
npx playwright install chromium
```

### 6.4 "Supabase env vars ausentes"

Os testes são desenhados para **NÃO depender de Supabase real**. Páginas
client-side caem em modo "no supabase" quando env vars faltam (ver
`SupabaseProvider.tsx`). Se aparecer erro relacionado, garanta que:
- `.env.example` NÃO tem `NEXT_PUBLIC_SUPABASE_URL` real
- Os specs usam mocks embutidos (MOCK_POSTS, MOCK_NOTIFS, etc)

### 6.5 "Test passes locally, fails in CI"

Causa comum: dependência de ordem de execução. Playwright é determinístico
por padrão (1 worker, ordem do array). Se precisar de paralelismo:

```ts
test.describe.parallel('group', () => { ... });
```

Ou configurar `workers: 2` em CI:

```ts
workers: process.env.CI ? 2 : 1,
```

### 6.6 "Sandbox sem pnpm"

Este projeto usa `pnpm` no `package.json` mas o sandbox só tem `npm`.
Os scripts E2E foram escritos para usar `npm run` (não `pnpm`).
Se for rodar local com pnpm:

```bash
pnpm dev
pnpm e2e:smoke   # adicione ao package.json
```

---

## 7. CI integration

`.github/workflows/CI.yml` já tem jobs de `lint` e `test`. Para adicionar
E2E, criar um novo job:

```yaml
e2e:
  name: E2E Smoke
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run e2e:smoke
      env:
        CI: 1
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

---

## 8. Métricas & exit codes

| Ferramenta | Exit 0 (pass) | Exit ≠ 0 (fail) |
|---|---|---|
| `tsc --noEmit` | Sem erros de tipo | Erros bloqueantes |
| `eslint` | Sem violations | ≥ 1 violation (errors) |
| `vitest run` | Todos os testes passam | ≥ 1 falha |
| `playwright test` | Todos os specs passam | ≥ 1 falha |

`scripts/ci-local.sh` captura todos os exits e gera relatório agregador.
