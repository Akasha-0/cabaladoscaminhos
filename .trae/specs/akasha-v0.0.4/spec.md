# Akasha v0.0.4 — Pós-Launch: Conclusão, Atmosfera & Escala — Spec

## Why

Os dois specs anteriores estão concluídos e o **release v1.0.0-akasha** está marcado como shipped no `PROGRESS.md` e no `Doc 08` (Onda 3 + Onda 4 ✅). Porém, uma auditoria direta do estado real do repositório revela que **o pós-launch ainda tem trabalho crítico** para tirar o Akasha de "launchable" para "vibrante, soberano e global":

**Estado verificado (auditoria direta):**

1. **Migração monorepo incompleta.** Os pacotes `packages/core-{astrology,cabala,odus,tantra,types}/` existem (Fase A ✅), porém o diretório `apps/akasha-portal/` está **vazio** (apenas `next-env.d.ts` e `tsconfig.tsbuildinfo`). O código B2C real continua em `src/app/(akasha)/`, `src/app/api/akasha/`, `src/lib/akasha/`, `src/lib/grimoire/` — a estrutura-alvo `apps/b2c-portal/` do Doc 03 §2 / Doc 25 §11 ainda não foi populada.
2. **Grimório botânica está completo (52 ervas)** — o gap reportado em `PROGRESS.md` ("8/50 ervas") foi superado, mas a curadoria/proveniência (Doc 20 AD-20.1–.6) precisa de validação no `IDEIA.md`.
3. **Doc 15 §1 ainda tem `⚠️ PROVISIONAL (D4)`** nos 16 Odus — `metadata.source`/`metadata.lineage` não estão consolidados em todos os arquivos do Grimório Ancestral.
4. **Atmosfera WebGL (Three.js) não implementada** (Doc 25 §8, AD-25.9, Doc 26). A Mandala roda em SVG/D3; o Toroide etéreo é só planejado.
5. **Push notifications não implementadas** (Doc 25 §8, Doc 08 Onda 4.5). VAPID, schema `User.pushEnabled`/`pushSubscription`, service worker de push, subscribe endpoint — tudo por fazer.
6. **i18n EN só nos frontmatters.** Todos os arquivos têm `title_en`, mas o **corpo** do Grimório está em PT-BR. Doc 25 §9 Fase 2 ainda em aberto.
7. **`apps/legacy-cockpit` e middleware com allowlist B2B**: PROGRESS.md diz "Onda 4 ✅", mas a auditoria do `middleware.ts` mostra que o estado real precisa ser confirmado e o shutdown formalizado (Doc 25 AD-25.2).
8. **I-Ching como 5º sistema** (Doc 14 §1) é "Fase 2+ (fora do MVP)" — pode entrar no v0.0.4 como item opcional.

> **Premissa:** este spec assume que `refactor-akasha-v2` (v0.0.1) e `akasha-v0.0.2` (Onda 3 Live + Lançamento) estão concluídos, com os 8113 testes passando, build OK, 9 modelos B2C canônicos, Grimório curado, RAG-fechado verde, reconciliação LLM×créditos OK, runbook publicado. **A Ordem de Execução no fim explicita as dependências internas.**

## What Changes

- **Conclusão da migração monorepo** — mover o código B2C de `src/{app,lib,components,middleware,hooks,types}/` para `apps/akasha-portal/` (Doc 03 §2, Doc 25 §11).
- **Validação D4 dos Odus** — consolidar `metadata.source` e `metadata.lineage` em `grimoire/ancestral/odu-*.md` e remover o `⚠️ PROVISIONAL (D4)` do Doc 15 §1.
- **Shutdown formal do `apps/legacy-cockpit`** — remover rotas/páginas/libs B2B remanescentes, validar `middleware.ts` sem allowlist de Cockpit, atualizar Doc 25 AD-25.2 e Doc 08 Onda 4.8 para ✅.
- **Atmosfera WebGL Three.js** — Toroide etéreo (wireframe + partículas) sob a Mandala SVG/D3, com `prefers-reduced-motion: reduce` (Doc 25 §8, AD-25.9, Doc 26 §3).
- **Push notifications** — VAPID, schema `User.pushEnabled`/`pushSubscription`, `lib/push/subscribe.ts` + `lib/push/send.ts`, integração no cronjob de trânsitos (Doc 25 §8, Doc 22 AD-22.2).
- **PWA full-install** — completar `manifest.json`, `sw.js` com cache-first/network-first/SWR (Doc 25 §8, AD-25.9).
- **i18n EN completa do Grimório** — traduzir o corpo (`## EN` section) dos 52 ervas + 16 Odus + 11 Corpos + 4 Diagnósticos; ativar `next-intl` (Doc 25 §9 Fase 2, AD-25.12).
- **(Opcional) I-Ching como 5º sistema** — seguir os 5 pontos de extensão do Doc 14: campo no `User`, `packages/core-iching`, bloco em `CorrelationEntry`, extração no `PromptBuilder`, roteador de temas.
- **Quality gates** — `prisma validate` + `tsc --noEmit` + `test:run` + `build` + `lint` + `fallow` verdes (Doc 19 §5).

## Impact

### Affected specs (docs/)
- `docs/03_architecture-spec.md` — confirmar monorepo `apps/b2c-portal/` (Doc 03 §2)
- `docs/08_roadmap.md` — incluir Onda 5 (Pós-Launch) e marcar Onda 4.8 como ✅ (legacy-cockpit desligado)
- `docs/15_glossario-oracular.md` — remover `⚠️ PROVISIONAL (D4)` da §1
- `docs/20_governanca-conteudo-oracular.md` — validação de proveniência concluída (AD-20.1–.6)
- `docs/22_observabilidade-operacao.md` — novo evento `push.sent` (AD-22.4)
- `docs/25_visao-akasha.md` — AD-25.9 (PWA+WebGL) e AD-25.12 (i18n) marcados como ✅
- `AUTH-AUDIT.md` — confirmar zero rotas/páginas B2B
- `MIGRATIONS.md` — nova migration para `User.pushEnabled`/`pushSubscription`

### Affected code
- **Monorepo:** `apps/akasha-portal/` (novo), `apps/legacy-cockpit/` (remoção), `packages/core-iching/` (opcional)
- **Portal B2C:** mover `src/{app,lib,components,middleware,hooks,types}/akasha*` para `apps/akasha-portal/src/`
- **Schema/migration:** `prisma/schema.prisma` (pushEnabled/pushSubscription), `prisma/migrations/<ts>_user_push/`
- **Atmosfera WebGL:** `apps/akasha-portal/src/components/mandala/MandalaAtmosphere.tsx` (novo), `MandalaChart.tsx` (wire-up)
- **Push:** `apps/akasha-portal/src/lib/push/{subscribe,send}.ts`, `src/scripts/daily-transits-cron.ts` (integração)
- **PWA:** `public/manifest.json`, `public/sw.js`, `src/app/layout.tsx` (registro SW)
- **i18n:** `next-intl`, `src/i18n/pt-BR.json` + `en.json`, `grimoire/{botanica,ancestral,vibracional,diagnostico}/*.md` (corpo EN)
- **Testes:** reorganizar `tests/{api,components,lib,integration}/` para o novo monorepo; manter gate `test:core` (Doc 19 AD-19.1)

## ADDED Requirements

### Requirement: Migração monorepo completa
O sistema SHALL mover o código B2C (`src/app/(akasha)/`, `src/app/api/akasha/`, `src/lib/akasha/`, `src/lib/grimoire/`, `src/components/mandala/`, `src/middleware/`, etc.) para `apps/akasha-portal/src/`, conforme a estrutura-alvo definida em Doc 03 §2 e Doc 25 §11, preservando os 8113+ testes verdes.

#### Scenario: Build pós-migração
- **WHEN** o desenvolvedor roda `pnpm --filter akasha-portal build` na raiz do monorepo
- **THEN** o build completa sem erros TypeScript
- **AND** todos os imports relativos funcionam (`@/lib/akasha/*` resolvem para `apps/akasha-portal/src/lib/akasha/*`)
- **AND** `apps/legacy-cockpit/` está removido (sem dependências quebradas)

#### Scenario: Quality gates pós-migração
- **WHEN** o desenvolvedor roda `pnpm test:core`
- **THEN** ≥ 8113 testes passam, 0 falhas
- **AND** `tsc --noEmit` retorna 0 erros
- **AND** `prisma validate` retorna OK

### Requirement: Shutdown formal do legacy-cockpit
O sistema SHALL remover formalmente `apps/legacy-cockpit/`, rotas `/api/operator/*`, `/api/mesa-real/*`, `/api/consult/*` (legado), `/cockpit/*`, e a allowlist correspondente no `middleware.ts`, conforme Doc 25 AD-25.2 e Doc 08 Onda 4.8.

#### Scenario: Acesso a superfície legada
- **WHEN** alguém chama `GET /api/operator/auth/login` ou `GET /cockpit` ou `GET /api/mesa-real/generate`
- **THEN** a aplicação responde 404 (rota inexistente)
- **AND** o `middleware.ts` não contém `allowlist` com prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`)

### Requirement: Validação D4 (16 Odus) — remoção do PROVISIONAL
O sistema SHALL consolidar `metadata.source` (livro, autor, edição/página) e `metadata.lineage` (tradição) em todos os 16 arquivos `grimoire/ancestral/odu-*.md`, refletidos no `IDEIA.md` (ledger, Doc 20 AD-20.5), permitindo a remoção do `⚠️ PROVISIONAL (D4)` no Doc 15 §1.

#### Scenario: Auditoria do grimório ancestral
- **WHEN** o `tests/grimoire/odus-validation.test.ts` executa
- **THEN** todos os 16 arquivos `grimoire/ancestral/odu-*.md` têm `metadata.source` não-vazio e `metadata.lineage` não-vazio
- **AND** o frontmatter YAML é parseável
- **AND** o teste-guardião da curadoria (Doc 19 AD-19.4 #4) passa

#### Scenario: Doc 15 §1 sem PROVISIONAL
- **WHEN** o operador consulta `docs/15_glossario-oracular.md §1`
- **THEN** o cabeçalho **não** contém mais `⚠️ PROVISIONAL (D4)`
- **AND** a tabela dos 16 Odus referencia o `metadata.source` de cada `grimoire/ancestral/odu-*.md`

### Requirement: Atmosfera WebGL Three.js (Toroide etéreo)
O sistema SHALL renderizar uma camada de atmosfera WebGL (Toroide etéreo em `wireframe` + partículas 50–100 instâncias) sob a Mandala SVG/D3, em camada `-z-10` (sem raycasting cruzado), com `dpr={[1, 2]}` para retina, rotação lenta (0.1 rad/s) e `frameloop="demand"` em `prefers-reduced-motion: reduce`, conforme Doc 25 §8 + AD-25.9 + Doc 26 §3.

#### Scenario: Mobile-first
- **WHEN** o usuário abre o app em um celular (iOS/Android)
- **THEN** o Toroide WebGL renderiza em ≥ 30fps (alvo: 60fps)
- **AND** a interação com os nós SVG da Mandala permanece cirúrgica (sem raycasting cruzado)
- **AND** `prefers-reduced-motion: reduce` desabilita a animação automaticamente

#### Scenario: Desktop (Centro de Comando)
- **WHEN** o usuário acessa `/mandala` em desktop
- **THEN** a atmosfera WebGL está com efeitos completos (rotação mais rápida, mais partículas)
- **AND** o "Painel de Sintonia" ilumina caminhos abertos e curto-circuitos (Doc 25 §2)

### Requirement: Push notifications (Web Push API + VAPID)
O sistema SHALL enviar push notification diária ("Seu ritual de hoje está pronto") para usuários com `pushEnabled = true`, via Web Push API, sem incluir conteúdo do ritual (Doc 22 AD-22.2 — privacidade), conforme Doc 25 §8 + Doc 08 Onda 4.5.

#### Scenario: Opt-in LGPD
- **WHEN** o usuário acessa `/conta` e ativa o toggle "Notificações"
- **THEN** o cliente solicita permissão do browser
- **AND** a `PushSubscription` é enviada ao servidor e persistida em `User.pushSubscription` (JSON)
- **AND** `User.pushEnabled = true` é persistido

#### Scenario: Push diário após cronjob
- **WHEN** o cronjob `cabala-transits.service` executa à 00:00 UTC e gera `daily_readings` para ≥ 1 usuário
- **THEN** o servidor envia push para todos os `User.pushEnabled = true` (mensagem genérica, sem conteúdo do ritual)
- **AND** o evento `push.sent` é registrado no log estruturado (Doc 22 AD-22.4)

### Requirement: PWA full-install
O sistema SHALL ser instalável como PWA no iOS/Android (sem loja) com `manifest.json` completo, `sw.js` com estratégias de cache, e prompt "Adicione à Tela Inicial" no segundo acesso, conforme Doc 25 §8 + AD-25.9.

#### Scenario: Instalação
- **WHEN** o usuário acessa o app no celular pela 2ª vez
- **THEN** o browser exibe o prompt "Adicione à Tela Inicial"
- **AND** o `manifest.json` declara `name`, `short_name`, `icons[192/512]`, `start_url`, `display: standalone`, `theme_color`
- **AND** Lighthouse PWA ≥ 90

#### Scenario: Service worker ativo
- **WHEN** o usuário está offline
- **THEN** o app continua navegável (cache de assets + HTML stale-while-revalidate)
- **AND** a rota `/api/akasha/transits/today` degrada com mensagem clara (Doc 22 AD-22.8)

### Requirement: i18n EN completa do Grimório
O sistema SHALL traduzir o **corpo** (Markdown) dos 52 ervas + 16 Odus + 11 Corpos + 4 Diagnósticos para inglês, adicionando uma seção `## EN` em cada arquivo `.md` do Grimório, e SHALL ativar `next-intl` para a UI (rotas `/(pt-BR|en)/`, cookie `NEXT_LOCALE`, fallback pt-BR), conforme Doc 25 §9 Fase 2 + AD-25.12.

#### Scenario: Acesso EN
- **WHEN** um novo usuário acessa o app com `Accept-Language: en`
- **THEN** a UI é servida em inglês
- **AND** o Grimório exibe o conteúdo em inglês (seção `## EN`)

#### Scenario: Troca manual de idioma
- **WHEN** o usuário clica no toggle pt-BR ↔ en
- **THEN** a preferência é persistida em cookie httpOnly
- **AND** a URL preserva a rota (sem redirect para `/`)

#### Scenario: Cobertura EN do Grimório
- **WHEN** o `tests/i18n/grimoire-completeness.test.ts` executa
- **THEN** todos os 83 arquivos do Grimório têm seção `## EN` não-vazia
- **AND** o título em inglês está presente no frontmatter (`title_en`)

### Requirement: (Opcional) I-Ching como 5º sistema oracular
O sistema SHALL implementar o I-Ching seguindo os **5 pontos de extensão** do Doc 14 §2: (1) campo `User.ichingMap Json?`, (2) `packages/core-iching/` agnóstico, (3) bloco `CorrelationEntry.iching{}`, (4) extração no `PromptBuilder`, (5) roteador de temas, com cobertura mínima de 8 hexagramas curados.

#### Scenario: Hexagrama natal
- **WHEN** o usuário conclui o onboarding
- **THEN** o sistema calcula o hexagrama natal (método trigrama superior/inferior baseado em ano/mês/dia) e persiste em `User.ichingMap`
- **AND** o hexagrama é exibido no Centro de Comando com proveniência (Doc 20 AD-20.3)

## MODIFIED Requirements

### Requirement: Roadmap com Onda 5
**Doc 08** SHALL incluir a **Onda 5 (Pós-Launch)** com: conclusão do monorepo, validação D4, WebGL, Push, PWA, i18n EN completa, e (opcional) I-Ching 5º sistema. As decisões de produto registradas em `Doc 21` SHALL refletir o estado real (Onda 4.8 ✅ legacy-cockpit desligado; Onda 5 em execução).

### Requirement: Doc 22 — evento push.sent
**Doc 22 §4** SHALL incluir o evento `push.sent` na tabela de auditoria de negócio, com campos `{ userId, dailyReadingId, status, error? }`, sem PII nem conteúdo do ritual (AD-22.2).

## REMOVED Requirements

### Requirement: `apps/legacy-cockpit/` e allowlist B2B
**Reason:** Doc 25 AD-25.2 — o Cockpit B2B e a Mesa Real foram desligados. A allowlist B2B no `middleware.ts` e o diretório `apps/legacy-cockpit/` (se ainda existir) são removidos.
**Migration:** rotas/páginas/libs B2B já removidas em Fase 54 (B2C Legacy Removal); o v0.0.4 apenas confirma e remove o que sobrou (allowlist no middleware, comentários legados).

### Requirement: Marcação `⚠️ PROVISIONAL (D4)` no Doc 15 §1
**Reason:** os 16 Odus foram validados (provenance + lineage) e o conteúdo está curado no Grimório (`grimoire/ancestral/odu-*.md`).
**Migration:** nenhum — apenas remoção do cabeçalho e atualização do `metadata.version` para 2.2.

---

## Ordem de Execução (dependências internas)

```
Fase 0 — PRÉ-REQUISITO (verificar, não executar)
  Verificar v0.0.1 + v0.0.2 concluídos:
    - 9 modelos B2C canônicos (Doc 04 §1) no schema
    - 8113+ testes passando, 0 falhas
    - 52 ervas + 16 Odus + 11 Corpos + 4 Diagnósticos no grimório
    - Doc 15 ainda tem ⚠️ PROVISIONAL (D4) — GAP CONFIRMADO
    - apps/akasha-portal/ vazio — GAP CONFIRMADO

Fase 1 — CONCLUSÃO TÉCNICA
  T1. Conclusão da migração monorepo (apps/akasha-portal/)
  T2. Shutdown formal do legacy-cockpit (allowlist + rotas remanescentes)
  T3. Validação D4 dos 16 Odus (remover ⚠️ PROVISIONAL)
  T4. Quality gates Fase 1

Fase 2 — CAMADA ATMOSFÉRICA
  T5.  Three.js atmosfera WebGL (Toroide etéreo)
  T6.  PWA full-install (manifest + sw.js)
  T7.  Push notifications (VAPID + Web Push + schema + cronjob)
  T8.  Quality gates Fase 2

Fase 3 — ESCALA GLOBAL
  T9.  i18n EN completa do Grimório (corpo + UI)
  T10. (Opcional) I-Ching 5º sistema (Doc 14)
  T11. Quality gates finais
```

> **Caminho crítico:** T1 → T2 → T3 → T5 → T7 → T9 → T11. T6 (PWA) pode rodar em paralelo com T5/T7. T10 (I-Ching) é opcional e pode ser um spec separado (v0.0.5) se a prioridade for lançar antes.
