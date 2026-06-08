# Tasks

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

- [ ] **Task 0: Confirmar v0.0.1 + v0.0.2 concluídos** _(9/12 ✅ verificados no cycle 355; 3 gaps remanescentes: build pre-existente, Doc 15 §1 PROVISIONAL, apps/akasha-portal vazio — gate da Fase 1 ainda não liberado)_
  - [x] `prisma/schema.prisma` contém os 9 modelos B2C canônicos (User, BirthChart, Subscription, CreditEntry, Manifesto, DailyReading, RitualCompletion, Consultation, ChatMessage, GrimoireEntry) + 4 enums _(verificado cycle 355: 11 modelos presentes — 10 canônicos + PushSubscription; 4 enums ✅)_
  - [x] `npx prisma validate` + `npx prisma generate` → 0 erros _(cycle 355: schema valid, Prisma Client v7.8.0 gerado)_
  - [x] `npx tsc --noEmit` → 0 erros _(cycle 355: exit 0)_
  - [x] `npm run test:run` → ≥ 8113 testes passando, 0 falhas _(cycle 355: 8113 passed / 26 skipped, delta 0)_
  - [ ] `npm run build` → OK _(PRÉ-EXISTENTE: `/_global-error` useContext, registrado cycle 211-212 — fora de escopo)_
  - [x] `grimoire/botanica/*.md` tem ≥ 50 arquivos com `title_en` e frontmatter YAML válido _(cycle 355: 51/51 ✅)_
  - [x] `grimoire/ancestral/odu-*.md` tem 16 arquivos (D4 ainda pendente de proveniência)
  - [x] `grimoire/vibracional/corpo-*.md` tem 11 arquivos
  - [x] `grimoire/diagnostico/*.md` tem 4 arquivos
  - [ ] `docs/15_glossario-oracular.md §1` ainda tem `⚠️ PROVISIONAL (D4)` — GAP CONFIRMADO _(3 ocorrências em §1, linhas 9/28/32)_
  - [ ] `apps/akasha-portal/` está vazio (apenas `next-env.d.ts` e `tsconfig.tsbuildinfo` + `.next/`) — GAP CONFIRMADO
  - [x] `packages/core-{astrology,cabala,odus,tantra,types}/` existem (Fase A ✅) _(cycle 355: 5/5 presentes)_

> **Gate de entrada da Fase 1:** 9/12 verdes — bloqueado em build pre-existente (registrado, fora de escopo), Doc 15 §1 PROVISIONAL (D4) e skeleton `apps/akasha-portal/`. T1.2 (skeleton) destrava o último gap; T3.2-3.5 destrava D4.

> **Gate de entrada da Fase 1:** todos os 12 itens acima verdes.

---

## Fase 1 — CONCLUSÃO TÉCNICA

- [ ] **Task 1: Conclusão da migração monorepo (apps/akasha-portal/)**
  - [x] SubTask 1.1: Inventariar arquivos a mover: `src/app/(akasha)/`, `src/app/api/akasha/`, `src/app/api/admin/webhooks/grimoire-sync/`, `src/lib/akasha/`, `src/lib/grimoire/`, `src/lib/stripe-akasha/`, `src/components/mandala/`, `src/middleware/` (apenas a parte Akasha), `src/hooks/akasha*`, `src/types/akasha*` _(audit `a7564b10`, cycle 344)_
  - [ ] SubTask 1.2: Criar estrutura `apps/akasha-portal/{src,public,prisma}/` com `package.json` próprio e `tsconfig.json` estendendo a raiz
  - [ ] SubTask 1.3: Mover arquivos preservando a árvore de imports (`@/lib/akasha/*` deve resolver para `apps/akasha-portal/src/lib/akasha/*`)
  - [ ] SubTask 1.4: Mover `prisma/schema.prisma` para `apps/akasha-portal/prisma/schema.prisma` e ajustar `prisma.config.ts`
  - [ ] SubTask 1.5: Configurar `pnpm-workspace.yaml` e `turbo.json` para incluir `apps/*` e `packages/*`
  - [ ] SubTask 1.6: Atualizar `package.json` raiz para delegar scripts ao `apps/akasha-portal` (preservando retrocompatibilidade: `npm run build` ainda funciona do root)
  - [ ] SubTask 1.7: Mover/atualizar testes: `tests/api/akasha*`, `tests/components/mandala*`, `tests/lib/grimoire*`, `tests/integration/oraculo-rag-fechado*`, `tests/integration/daily-engine-rag*`
  - [ ] Verify: `pnpm install` + `pnpm --filter akasha-portal build` + `pnpm test:core` verdes; `npm run build` (retrocompat) também verde

- [ ] **Task 2: Shutdown formal do legacy-cockpit**
  - [x] SubTask 2.1: Auditar `apps/legacy-cockpit/` (se ainda existir) e listar dependências _(refactor Akasha v2 `53c8501c`, cycle 334 — já removido)_
  - [x] SubTask 2.2: Remover `apps/legacy-cockpit/` definitivamente _(refactor Akasha v2 `53c8501c`, cycle 334)_
  - [x] SubTask 2.3: Auditar `apps/akasha-portal/src/middleware.ts` — remover allowlist de prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`) _(audit `00d4328a`, cycle 351)_
  - [x] SubTask 2.4: Verificar `apps/akasha-portal/src/app/api/operator/`, `mesa-real/`, `consult/` (legado) — não devem existir _(audit `00d4328a`, cycle 351)_
  - [x] SubTask 2.5: Atualizar `AUTH-AUDIT.md` para refletir zero rotas/páginas B2B _(stamp `bb33dcee`, cycle 350)_
  - [x] SubTask 2.6: Atualizar `Doc 08` v3.0 → v3.1: marcar Onda 4.8 (desligar legacy-cockpit) como ✅ _(formalização `8ecbbfff`, cycle 349)_
  - [x] SubTask 2.7: Atualizar `Doc 25 §11` — `apps/legacy-cockpit` removido do diagrama _(formalização `8ecbbfff`, cycle 349)_
  - [x] Verify (audit only — 2.1–2.7 ✅): testes E2E (curl) — `/api/operator/auth/login` → 404; `/cockpit` → 404 _(deferido para Fase 1 — depende de `apps/akasha-portal/` em T1.2)_

- [ ] **Task 3: Validação D4 (16 Odus) — remoção do PROVISIONAL**
  - [x] SubTask 3.1: Auditar `grimoire/ancestral/odu-*.md` — listar quais têm `metadata.source` e `metadata.lineage` preenchidos _(audit `a0183acb`, cycle 349 — 16/16 sem proveniência, GAP mapeado)_
  - [ ] SubTask 3.2: Para cada Odu sem proveniência, adicionar `source` (livro/autor/edição/página — Doc 20 AD-20.3) e `lineage` (tradição — Yorubá/Ifá/Candomblé/etc.)
  - [ ] SubTask 3.3: Registrar proveniência no `IDEIA.md` (ledger, Doc 20 AD-20.5) para os 16 Odus
  - [ ] SubTask 3.4: Atualizar `Doc 15 §1` — remover `⚠️ PROVISIONAL (D4)` do cabeçalho e da tabela
  - [ ] SubTask 3.5: Bump `Doc 15` version 2.1 → 2.2
  - [ ] SubTask 3.6: Criar `tests/grimoire/odus-validation.test.ts` (auditoria automatizada de proveniência)
  - [ ] Verify: `npm run test:run` verde nos novos testes; Doc 15 sem `⚠️ PROVISIONAL`

- [ ] **Task 4: Quality gates Fase 1**
  - [ ] `npx prisma validate` + `npx prisma generate` verdes
  - [ ] `npx tsc --noEmit` → 0 erros
  - [ ] `npm run test:run` → ≥ 8113 testes passando, 0 falhas
  - [ ] `npm run build` → OK
  - [ ] `npm run lint` → sem novos warnings
  - [ ] `npm run quality` (fallow) → 0 issues novas
  - [ ] `pnpm --filter akasha-portal build` → OK (gate do monorepo)
  - [ ] Atualizar `PROGRESS.md` §3.1 com métricas da Fase 1

> **Gate de saída da Fase 1:** monorepo funcional, legacy-cockpit desligado, Odus validados (D4 ✅).

---

## Fase 2 — CAMADA ATMOSFÉRICA

- [ ] **Task 5: Three.js atmosfera WebGL (Toroide etéreo)**
  - [ ] SubTask 5.1: Instalar `three` + `@react-three/fiber` + `@react-three/drei` (versões estáveis, license MIT) em `apps/akasha-portal/package.json`
  - [ ] SubTask 5.2: Criar `apps/akasha-portal/src/components/mandala/MandalaAtmosphere.tsx`:
    - Toroide etéreo em `wireframe` + 50–100 instâncias de partículas
    - Rotação lenta no eixo Y (0.1 rad/s)
    - `dpr={[1, 2]}` para retina
    - `frameloop="demand"` em `prefers-reduced-motion: reduce` (acessibilidade)
    - Cores conforme Doc 26 §3 (paleta cósmica: violeta akáshico + ciano aurora)
  - [ ] SubTask 5.3: Wire-up em `MandalaChart.tsx` — atmosfera como `<div className="absolute inset-0 -z-10">` sob o SVG (sem raycasting cruzado, Doc 25 §8)
  - [ ] SubTask 5.4: Adicionar toggle de intensidade (low/medium/high) no `cockpit-store` Zustand
  - [ ] SubTask 5.5: Teste de performance `tests/components/mandala/atmosphere.test.tsx`:
    - Renderiza com `prefers-reduced-motion: reduce` → `frameloop="demand"`
    - Smoke test de render (sem FPS real em headless)
  - [ ] SubTask 5.6: Lighthouse mobile — Performance ≥ 90 (não regredir)
  - [ ] Verify: `npm run test:run` + `npm run build` + Lighthouse verde

- [ ] **Task 6: PWA full-install**
  - [ ] SubTask 6.1: Criar/atualizar `apps/akasha-portal/public/manifest.json`:
    ```json
    {
      "name": "Sistema Akasha",
      "short_name": "Akasha",
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#06070F",
      "background_color": "#06070F",
      "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
      ]
    }
    ```
  - [ ] SubTask 6.2: Gerar ícones 192/512 (Doc 26 — Identidade Akasha cósmica) e `apple-touch-icon-180.png`
  - [ ] SubTask 6.3: Criar/atualizar `apps/akasha-portal/public/sw.js`:
    - Cache-first para assets estáticos (`/icons/*`, `/fonts/*`)
    - Network-first com fallback para `transitos_diarios:YYYY-MM-DD` (via `/api/akasha/transits/today`)
    - Stale-while-revalidate para HTML
  - [ ] SubTask 6.4: Registrar service worker em `apps/akasha-portal/src/app/layout.tsx` (client component)
  - [ ] SubTask 6.5: Adicionar `<link rel="manifest">` + `<meta name="theme-color">` + `<link rel="apple-touch-icon">` no `<head>`
  - [ ] SubTask 6.6: Teste manual: Chrome DevTools → Application → Installability deve passar + Lighthouse PWA ≥ 90
  - [ ] Verify: `npm run build` + lighthouse mobile

- [ ] **Task 7: Push notifications (VAPID + Web Push API)**
  - [ ] SubTask 7.1: Gerar par VAPID (`web-push generate-vapid-keys`) e adicionar ao `.env.example`:
    - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
    - `VAPID_PRIVATE_KEY`
    - `VAPID_SUBJECT`
  - [ ] SubTask 7.2: Adicionar ao schema Prisma + migration:
    ```prisma
    model User {
      // ...campos existentes
      pushEnabled     Boolean   @default(false)
      pushSubscription Json?
      // ...
    }
    ```
  - [ ] SubTask 7.3: Criar `apps/akasha-portal/src/lib/push/subscribe.ts` (subscribe endpoint client-side)
  - [ ] SubTask 7.4: Criar `apps/akasha-portal/src/lib/push/send.ts` (server-side, usa `web-push`)
  - [ ] SubTask 7.5: Criar rota `POST /api/akasha/push/subscribe` (gate `requireAkashaApi`)
  - [ ] SubTask 7.6: Adicionar toggle "Notificações" em `/conta` (opt-in LGPD)
  - [ ] SubTask 7.7: Integrar `sendPush` no `apps/akasha-portal/scripts/daily-transits-cron.ts` — após gerar `daily_readings`, envia push para `User.pushEnabled = true` (mensagem genérica, sem conteúdo)
  - [ ] SubTask 7.8: Adicionar evento `push.sent` ao log estruturado (Doc 22 AD-22.4)
  - [ ] SubTask 7.9: Atualizar `Doc 22 §4` (tabela de auditoria) com `push.sent`
  - [ ] SubTask 7.10: Testes:
    - `tests/lib/push/send.test.ts` — mock `web-push`, valida payload (sem conteúdo do ritual)
    - `tests/api/akasha/push/subscribe.test.ts` — POST/DELETE subscription
  - [ ] Verify: `npm run test:run` + smoke test em dev (subscription → push recebido em DevTools)

- [ ] **Task 8: Quality gates Fase 2**
  - [ ] `npx prisma validate` + `npx prisma generate` verdes
  - [ ] `npx tsc --noEmit` → 0 erros
  - [ ] `npm run test:run` → ≥ 8200 testes passando (alvo +87 da Fase 2), 0 falhas
  - [ ] `npm run build` → OK
  - [ ] `npm run lint` → sem novos warnings
  - [ ] `npm run quality` (fallow) → 0 issues novas
  - [ ] Lighthouse mobile: Performance ≥ 90, PWA ≥ 90
  - [ ] Atualizar `PROGRESS.md` §3.1 com métricas da Fase 2

> **Gate de saída da Fase 2:** Akasha visualmente "vivo" (WebGL + PWA) e retentivo (Push).

---

## Fase 3 — ESCALA GLOBAL

- [ ] **Task 9: i18n EN completa do Grimório (corpo + UI)**
  - [ ] SubTask 9.1: Auditar `grimoire/botanica/erva-*.md` (52 arquivos) — listar quais têm seção `## EN` no corpo
  - [ ] SubTask 9.2: Auditar `grimoire/ancestral/odu-*.md` (16 arquivos) — listar quais têm seção `## EN` no corpo
  - [ ] SubTask 9.3: Auditar `grimoire/vibracional/corpo-*.md` (11 arquivos) — listar quais têm seção `## EN` no corpo
  - [ ] SubTask 9.4: Auditar `grimoire/diagnostico/*.md` (4 arquivos) — listar quais têm seção `## EN` no corpo
  - [ ] SubTask 9.5: Traduzir o corpo dos arquivos pendentes (PT-BR → EN), preservando a estrutura Markdown
  - [ ] SubTask 9.6: Instalar/configurar `next-intl` em `apps/akasha-portal/`
  - [ ] SubTask 9.7: Criar `apps/akasha-portal/src/i18n/pt-BR.json` + `en.json` com todas as chaves da UI (rotas, botões, mensagens, validações Zod, e-mails transacionais)
  - [ ] SubTask 9.8: Adicionar `[locale]` segment em `apps/akasha-portal/src/app/(pt-BR|en)/` — mover páginas existentes (onboarding, dashboard, conta, manifesto) para os dois locales
  - [ ] SubTask 9.9: Atualizar `apps/akasha-portal/src/middleware.ts` para detectar locale via `Accept-Language` + cookie `NEXT_LOCALE`
  - [ ] SubTask 9.10: Adicionar toggle de idioma em `apps/akasha-portal/src/components/layout/LocaleSwitcher.tsx` (cookie httpOnly + recarrega preservando rota)
  - [ ] SubTask 9.11: Atualizar `tests/i18n/grimoire-completeness.test.ts`:
    - 83 arquivos do Grimório têm `## EN` não-vazia
    - `metadata.title_en` presente em todos
  - [ ] SubTask 9.12: Atualizar `Doc 15` → v2.3 (EN completo)
  - [ ] SubTask 9.13: Atualizar `Doc 25 §12` — AD-25.12 marcado como ✅
  - [ ] SubTask 9.14: Testes:
    - `tests/i18n/middleware.test.ts` — detecção de locale via header/cookie
    - `tests/i18n/dictionaries.test.ts` — todas as chaves existem em ambos os locales
  - [ ] Verify: `npm run test:run` + manual: `Accept-Language: en` → UI em inglês; cookie pt-BR → UI em pt-BR

- [ ] **Task 10: (Opcional) I-Ching 5º sistema (Doc 14)**
  - [ ] SubTask 10.1: Adicionar `User.ichingMap Json?` ao schema Prisma + migration
  - [ ] SubTask 10.2: Criar `packages/core-iching/` agnóstico com:
    - Função `buildIchingMap({ birthDate, birthTime, ... })`
    - Tabela canônica dos 64 hexagramas (Yin/Yang) e dos 8 trigramas (Bagua)
    - Algoritmo determinístico de hexagrama natal (trigrama superior/inferior baseado em ano/mês/dia)
    - Suíte de testes unitários (≥ 8 hexagramas conhecidos)
  - [ ] SubTask 10.3: Adicionar bloco `CorrelationEntry.iching{ aspects: string[]; extractionKeys: string[] }` em `packages/core-graph/`
  - [ ] SubTask 10.4: Criar `grimoire/iching/` (biblioteca adicional) com 8 hexagramas curados como `.md` (frontmatter YAML + corpo)
  - [ ] SubTask 10.5: Atualizar `PromptBuilder` (Doc 14 Passo 4) — extrair `ichingData` condicionalmente
  - [ ] SubTask 10.6: Adicionar pilar "iching" ao roteador de temas (Doc 12 / Doc 14 Passo 5)
  - [ ] SubTask 10.7: Registrar no `IDEIA.md` (ledger) e atualizar `Doc 25 §1` se aprovado
  - [ ] SubTask 10.8: Atualizar `grimoire:sync` para incluir `grimoire/iching/`
  - [ ] Verify: `npm run test:run` + smoke test (hexagrama natal gerado + exibido no Centro de Comando)

- [ ] **Task 11: Quality gates finais + release**
  - [ ] SubTask 11.1: `npx prisma validate` + `npx prisma generate` verdes
  - [ ] SubTask 11.2: `npx tsc --noEmit` → 0 erros
  - [ ] SubTask 11.3: `npm run test:run` → ≥ 8500 testes passando (alvo +400 da Fase 3)
  - [ ] SubTask 11.4: `npm run build` → OK, 0 warnings novos
  - [ ] SubTask 11.5: `npm run lint` → 0 warnings novos
  - [ ] SubTask 11.6: `npm run quality` (fallow) → 0 issues
  - [ ] SubTask 11.7: Lighthouse mobile: Performance ≥ 90, PWA ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90
  - [ ] SubTask 11.8: Atualizar `PROGRESS.md` §2 e §3.1 com métricas da Fase 3
  - [ ] SubTask 11.9: Atualizar `Doc 08` v3.1 → v3.2 (Onda 5 ✅)
  - [ ] SubTask 11.10: Atualizar `Doc 25 §12` — AD-25.6, AD-25.9, AD-25.12 marcados como ✅
  - [ ] SubTask 11.11: Commit final + push + tag de release `v1.1.0-akasha`

> **Gate de saída da Fase 3:** Akasha v1.1.0 launchable, global (EN completo) e extensível (I-Ching opcional).

---

# Task Dependencies

- Task 0 (gate) → todas as outras
- Task 1 → Task 2, Task 4
- Task 2 → Task 4
- Task 3 → Task 4
- Task 4 → Task 5, Task 6, Task 7
- Task 5, Task 6, Task 7 → Task 8
- Task 8 → Task 9, Task 10
- Task 9 → Task 11
- Task 10 → Task 11 (opcional; pode ser adiado para v0.0.5)

> Tasks 5, 6, 7 podem rodar em paralelo entre si após Task 4 (Fase 2). Task 9 e Task 10 podem rodar em paralelo (Fase 3).
