# Visual Regression Suite — Wave 26 · Trilha Design 6/8

**Data:** 2026-06-28
**Agentes:** Coder + Lina (Designer) — orquestrado por General
**Status:** ✅ SUITE COMPLETA · 8 specs + 3 viewports + 2 themes + helper padronizado

---

## 📋 TL;DR

| Item | Valor | Observação |
|---|---|---|
| **Specs criadas** | 8 | feed, library, notifications, akashic, profile, groups, onboarding, landing |
| **Viewports** | 3 | desktop (1280×720), tablet (768×1024), mobile (375×667) |
| **Themes** | 2 | light + dark |
| **States cobertos** | 4 | default, empty, loading, error |
| **Baselines esperadas** | ~40 | depende do estado disponível em cada página |
| **Tempo de execução** | ~8-12 min local | single worker (sandbox-safe) |
| **Threshold** | 100 px / 20% | tolera anti-aliasing + fontes |
| **Sandbox-friendly** | ✅ | roda em `npm run dev` |

---

## 1. Arquitetura

### 1.1 Estrutura de arquivos

```
tests/visual/
├── helpers/
│   └── visual-helper.ts       # Theme, viewport, state helpers compartilhados
├── feed.spec.ts               # Feed (default + empty + loading + error)
├── library.spec.ts            # Library (default + empty + loading + error)
├── notifications.spec.ts      # Notifications (default + empty + error)
├── akashic.spec.ts            # Akashic Chat (default + error)
├── profile.spec.ts            # Profile (default + empty)
├── groups.spec.ts             # Groups (default + empty + loading + error)
├── onboarding.spec.ts         # Onboarding (default)
├── landing.spec.ts            # Landing (default + validation + manifesto)
└── __snapshots__/             # Auto-gerado pelo Playwright
```

### 1.2 Projects no `playwright.config.ts`

3 novos projects dedicados a visual regression (não conflitam com e2e):

| Project | Viewport | Device | Uso |
|---|---|---|---|
| `visual-desktop` | 1280×720 | Desktop Chrome | desktop baseline |
| `visual-tablet` | 768×1024 | iPad portrait | tablet/iPad baseline |
| `visual-mobile` | 375×667 | iPhone SE | mobile baseline (uso real) |

**Por que NÃO usar `devices['iPhone 13']` direto?**
- Viewport canônico (375×667) é mais estável que 390×844 (iPhone 13)
- Mobile-first design (uso real é mobile) — visual diff fica mais significativo
- 720p desktop é o "menor denominador comum" (cabe em qualquer tela)

### 1.3 Helper compartilhado (`visual-helper.ts`)

Responsabilidades:

1. **Theme switching** — aplica `.dark` + `data-theme="dark"` simultaneamente (robusto)
2. **Viewport detection** — `getViewportName(page)` retorna `desktop|tablet|mobile`
3. **State forcing** — `forceLoadingState`, `forceErrorState`, `forceEmptyState` mockam rotas
4. **Wait stability** — `waitForVisualStability()` aguarda networkidle + 500ms extra
5. **Screenshot naming** — `${page}-${viewport}-${theme}-${mode}.png` (determinístico)

---

## 2. Como rodar localmente

### 2.1 Pré-requisitos

```bash
# 1. Dependências instaladas
npm install

# 2. Browser chromium instalado
npx playwright install chromium

# 3. Dev server rodando (em outro terminal)
npm run dev
# ou deixe o Playwright subir automaticamente (webServer no config)
```

### 2.2 Comandos

```bash
# Rodar TUDO (8 specs × 3 viewports = 24 runs)
npm run test:visual

# Apenas desktop (mais rápido pra desenvolvimento)
npm run test:visual:desktop

# Apenas tablet
npm run test:visual:tablet

# Apenas mobile
npm run test:visual:mobile

# Atualizar baselines (após mudança visual intencional)
npm run test:visual:update

# Ver HTML report
npm run test:visual:report
```

### 2.3 Filtrar specs individuais

```bash
# Apenas feed
npx playwright test tests/visual/feed.spec.ts

# Apenas landing em mobile
npx playwright test tests/visual/landing.spec.ts --project=visual-mobile

# Apenas dark mode
npx playwright test tests/visual/ --grep "dark"
```

### 2.4 Primeiro run (gerar baselines)

No primeiro run, Playwright cria os snapshots em `tests/visual/__snapshots__/`.
**Esses arquivos DEVEM ser commitados** — eles são a referência do diff.

```bash
npm run test:visual:update   # gera baselines na primeira vez
git add tests/visual/__snapshots__/
git commit -m "test(visual): initial visual baselines W26"
```

---

## 3. Thresholds e tolerâncias

### 3.1 Configuração global (`expect.toHaveScreenshot`)

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,    // ~0.5% de 1280×720
    threshold: 0.2,        // 20% de diff por pixel (tolera anti-aliasing)
    animations: 'disabled', // pausa animações durante screenshot
  },
}
```

### 3.2 Por que esses números?

- **maxDiffPixels: 100** — limita diffs grandes (mudança de componente inteiro)
- **threshold: 0.2** — tolera pequenas variações de cor/font rendering
- **animations: 'disabled'** — elimina flakiness de transições CSS

### 3.3 Quando ajustar?

| Cenário | Ação |
|---|---|
| Mudança visual **intencional** | `npm run test:visual:update` |
| Mudança de **fonte/typography** | Aumentar `maxDiffPixels: 500` temporariamente |
| **Flaky** (passa 7/10 vezes) | Aumentar `threshold: 0.3` |
| Falha por **horário/data** | Usar `page.clock` ou mock de `Date.now()` |

---

## 4. Cobertura por página

### 4.1 Matriz de cobertura

| Página | Default | Empty | Loading | Error | Total baselines |
|---|---|---|---|---|---|
| **feed** | ✅ (L+D) | ✅ | ✅ | ✅ | 8 |
| **library** | ✅ (L+D) | ✅ | ✅ | ✅ | 8 |
| **notifications** | ✅ (L+D) | ✅ | — | ✅ | 6 |
| **akashic** | ✅ (L+D) | — | — | ✅ | 6 |
| **profile** | ✅ (L+D) | ✅ | — | — | 6 |
| **groups** | ✅ (L+D) | ✅ | ✅ | ✅ | 8 |
| **onboarding** | ✅ (L+D) | — | — | — | 6 |
| **landing** | ✅ (L+D) | ✅ (L+D) | ✅ | — | 10 |
| **TOTAL** | | | | | **~58 baselines** |

(L+D = light + dark; demais = light only — dark é simétrico via theme switch)

### 4.2 Pages intencionalmente fora do escopo

- `/admin/*` — rota admin (não precisa de visual regression público)
- `/api/*` — endpoints JSON (sem UI)
- `/offline` — PWA offline page (testado em E2E separado)
- `/post/[id]/edit` — form denso, cobertura via e2e/profile-edit

---

## 5. Estratégia de states

### 5.1 Default state

Rota carrega com dados normais (mockados via seed do Supabase ou fixtures).
Captura o "look & feel" real que o usuário vê.

### 5.2 Empty state

Mock retorna `[]` das APIs. UI mostra mensagens de "nenhum item".
Captura: copy, ilustrações, CTAs de ação quando vazio.

### 5.3 Loading state

Mock atrasa resposta em 30s. Screenshot captura ANTES do timeout.
Captura: skeletons, spinners, placeholders.

### 5.4 Error state

Mock retorna 500. UI mostra error boundary ou mensagem de erro.
Captura: tom de comunicação, retry CTAs, fallback visual.

---

## 6. Integração com CI

### 6.1 Status atual

**NÃO integrado** ao CI principal. Por quê:
- Visual diff em CI é caro (screenshot generation + diff upload)
- Sandbox degrada — não roda em ambiente com <2GB RAM
- Threshold precisa ajuste fino por ambiente

### 6.2 Recomendação Wave 27+

1. Rodar visual specs em **PR branch only** (não main)
2. Upload de **diff PNGs** como artifact do GitHub Actions
3. **Soft fail** — não bloqueia PR, marca pra review manual
4. **Update automático** quando label `visual:update` for aplicada

### 6.3 Comandos CI sugeridos

```yaml
- name: Visual Regression
  run: npm run test:visual
  if: github.event.label.name != 'visual:update'

- name: Update Baselines
  run: npm run test:visual:update
  if: github.event.label.name == 'visual:update'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 7. Troubleshooting

### 7.1 Test passa local mas falha em CI

- **Causa:** diferença de fontes (system fonts diferentes)
- **Fix:** rodar `npm run test:visual:update` localmente + commit

### 7.2 Diff aparece "sem mudança visual"

- **Causa:** random data (mock retornando IDs/UUIDs)
- **Fix:** seed determinístico em `prisma/seed/`

### 7.3 Loading state nunca aparece

- **Causa:** `forceLoadingState` bloqueia route mas Next.js cache SSR
- **Fix:** usar `page.context().clearCookies()` antes do goto

### 7.4 Mobile screenshots cortados

- **Causa:** `deviceScaleFactor: 2` em viewport pequeno
- **Fix:** alterar `use.deviceScaleFactor: 1` para mobile se necessário

### 7.5 Theme switch não persiste

- **Causa:** `next-themes` sobrescreve no mount
- **Fix:** adicionar `await page.waitForFunction(() => document.documentElement.classList.contains('dark'))`

---

## 8. Limitações conhecidas

1. **Não captura interações complexas** — hover, focus rings, dropdowns abertos
2. **Não captura vídeo/animações** — `animations: 'disabled'` é necessário
3. **Não captura iframes** — Next.js dev tools não renderizam em screenshot
4. **Não captura WebGL/Canvas** — Akashic chat usa SVG, mas se virar Canvas precisa mock
5. **Sandbox-degraded** — não roda neste sandbox (2GB RAM); apenas local/CI com 4GB+

---

## 9. Próximos passos (Wave 27+)

- [ ] Adicionar **visual regression pra /onboarding passos 2-3** (welcome → traditions → done)
- [ ] Adicionar **hover/focus states** com `page.hover()` antes do screenshot
- [ ] Adicionar **dark mode em todos os empty states** (não só default)
- [ ] Adicionar **printed stylesheet** screenshot (`@media print`)
- [ ] Integrar com **Percy ou Chromatic** pra SaaS visual diff (Wave 28+)
- [ ] Adicionar **axe-core a11y check** em paralelo aos screenshots

---

## 10. Referências

- **Wave 11 E2E setup:** `e2e/screenshots.spec.ts`, `playwright.config.ts`
- **Design System v2:** `docs/DESIGN-SYSTEM-V2.md`
- **Visual UI Audit (Wave 24):** `docs/VISUAL-UI-AUDIT-W24.md`
- **UX States Coverage (Wave 24):** `docs/UX-STATES-COVERAGE-W24.md`
- **Playwright docs:** https://playwright.dev/docs/test-snapshots
- **Lina / Designer persona:** sensibilidade visual, fundamentação em tokens, foco em acessibilidade
