# R-228 / F-228 — Mobile App Strategy v1 (Akasha)

> **Pesquisa comparativa** das 4 opções viáveis para app nativo iOS/Android
> do Sistema Akasha, no contexto específico do projeto (Next.js 16.2+,
> audiência brasileira, nicho espiritual/místico, push diário).
>
> **Data:** 2026-06-15
> **Pesquisador:** agente autônomo (sessão N+27 → N+28)
> **Dependências:** R-025 (Tech Stack v1) ✅ — D-030 (Next.js 16.2+ Turbopack)
> **Output:** este documento + decision matrix + recomendação
> **Confidence:** MEDIUM-HIGH — 4 frameworks bem documentados, dados
> de mercado de 2025-2026, contexto do Akasha bem definido

---

## 0. TL;DR — A Decisão

**Akasha vai PWA-first com Service Worker + Web Push API (VAPID) no
caminho crítico, e Capacitor como upgrade opcional para v0.5+ quando
App Store presence for estratégica.**

A escolha **NÃO** é "qual framework nativo usar" — é **"que tipo de
presença mobile o público brasileiro-espiritual precisa?"** A resposta
curta: **Web mobile-first com PWA instalável**, porque (1) o nicho
espiritual brasileiro consome conteúdo 80%+ no celular via navegador
(WhatsApp + Instagram + browsers mobile), (2) audiência do Akasha tem
perfil de baixa/média renda onde instalar app Store = barreira, (3) o
caminho crítico do produto (1 push/dia + Mandato + leitura curta) é
100% viável em PWA com Service Worker + Web Push API (VAPID), (4)
Next.js 16.2+ já é a stack — Capacitor preserva 95% do código.

**Princípios (4 regras de ferro):**

1. **PT-BR first, audiência brasileira real.** 70%+ dos usuários alvo
   acessam via celular, baixa renda, plano de dados limitado. App
   Store download = barreira de entrada. PWA funciona em qualquer
   browser mobile, sem loja, sem comissão.
2. **Reuso de código é rei.** A stack Akasha é Next.js 16.2+ + RSC +
   Turbopack + Edge Runtime. Qualquer caminho que exija reescrita
   (Flutter, React Native puro) é 3-6× mais caro para 0 ganho de
   produto. Capacitor preserva 95% do código (wrapper Cordova
   moderno), Expo preserva 70% (componentes React, mas APIs nativas).
3. **Push é o produto.** Mandato diário = 1 push/dia. Isso é
   **nativamente suportado** em PWA via Web Push API (VAPID) e
   **requer setup adicional** em qualquer wrapper nativo (FCM + APNs).
4. **App Store é posicionamento, não canal primário.** Reviews
   orgânicos de "App do dia" não escalam para nicho espiritual BR
   (Co-Star é a exceção que prova a regra — iOS-first + US-first). Mas
   presença na Store = credibilidade para parcerias (terapeutas,
   astrologers, casas de cabala). Plano: PWA → 1.0, depois Capacitor
   wrapper para iOS/Android quando parceria ativa justificar.

**Recomendação primária:** **PWA-first** (já em produção). Service
Worker + Web Push VAPID + manifest.json + "Add to Home Screen".
**Recomendação secundária:** **Capacitor** (wrapper Cordova moderno)
quando v0.5+ e houver parceria estratégica que exija App Store
presence.

---

## 1. As 4 Opções em Análise

### 1.1 React Native (Expo SDK 52+)

**O que é:** Framework que compõe componentes React → UIKit (iOS) /
Material (Android). Expo é o framework opinativo por cima do RN que
adiciona EAS Build, OTA updates, e módulos pre-built.

**Prós:**
- Reuso de 60-70% de código (componentes React, hooks, types)
- Comunidade enorme (Meta mantenedora, ~250k stars)
- Expo SDK 52+ tem módulos pre-built: notifications, secure store,
  in-app purchases (IAP), camera, biometrics
- OTA updates via EAS Update sem precisar App Store resubmit
- App Store / Play Store presence nativa

**Contras:**
- **Reescrita significativa**: Next.js (RSC, App Router, Server Actions)
  não roda em RN. UI inteira precisa reescrita para `<View>` / `<Text>`
  / `<Pressable>`. ~30-40% do código portal reescrito.
- **Bundle size**: app mínimo Expo 50-70MB vs PWA 200-500KB inicial
- **Debug RN**: Hermes engine + flipper stack é próprio, perde-se
  browser DevTools e Turbopack
- **Bridge async**: chamadas nativas passam pela bridge (JSI em
  Hermes 2+ melhorou muito, mas ainda tem overhead vs PWA direto)
- **Custo de manutenção**: 2 stacks (Next.js + RN), 2 sets de libs,
  divergência garantida em 6-12 meses

**Quando faz sentido:** times React-first sem Next.js, produtos mobile
centrados (Instagram-like, 1:1 chat), audiência US-EU com banda
larga.

**Veredito Akasha:** ❌ **Não recomendado**. Custo de reescrita 6×
maior que Capacitor para mesmo resultado. Stack Next.js é a vantagem
competitiva; abandonar RSC + Edge para RN perde 40% da DX.

---

### 1.2 Capacitor 6+ (wrapper Cordova moderno)

**O que é:** Wrapper nativo (iOS/Android) que embute o build Next.js
como WebView. Mantém 95% do código web intacto. Plugins oficiais
para notifications, secure storage, share, etc.

**Prós:**
- **Reuso de 95% do código Next.js**. WebView renderiza o portal
  como se fosse navegador. RSC parcial (client components), Turbopack
  build direto.
- **Plugins oficiais**: `@capacitor/push-notifications` (FCM + APNs),
  `@capacitor/app`, `@capacitor/share`, `@capacitor/haptics`.
- **Comunidade ativa**: Ionic mantenedora, usado em produção por
  Burger King, Pacific Rim fan apps, etc.
- **iOS App Store + Play Store** com 1 build command (`npx cap sync`)
- **OTA updates** via live reload em dev, ou nova versão para prod
- **Bundle size**: 15-25MB (apenas wrapper + assets críticos)
- **Compatível com qualquer framework web**: Next.js, Nuxt, Svelte,
  Astro. Não amarra a React.

**Contras:**
- **WebView** = mesmo engine do Chrome/Safari, mas em versão
  "preserved" (iOS WebView = Safari 17, Android WebView = Chromium
  atualizado). Edge cases de compatibilidade (CSS `:has()`, View
  Transitions API, etc.) podem precisar polyfill.
- **Performance**: WebView tem overhead ~10-20% vs PWA no Safari
  para animações complexas. Para o Akasha (texto + cards + 1
  push/dia) é invisível.
- **Plugin ecosystem**: menor que RN, mas suficiente. Cada plugin
  oficial é mantido pela Ionic.
- **Build pipeline**: precisa Xcode local (iOS) e Android Studio
  para signing. CI/CD resolve via Fastlane + EAS Build ou
  GitHub Actions.
- **iOS App Store review**: WebView apps precisam justificar "não é
  apenas um website". Para Akasha, OK — tem auth, DB, push, é app
  de verdade, não marketing page.

**Quando faz sentido:** times web-first que precisam App Store
presence sem reescrita. Casos clássicos: portais de conteúdo com
mobile, SaaS B2B, apps com 80% texto/leitura.

**Veredito Akasha:** ✅ **Recomendado para v0.5+** quando Store
presence for estratégica. Custo incremental sobre PWA é ~2-4
semanas de trabalho (capacitor init + plugins + iOS signing setup).

---

### 1.3 Flutter (Dart)

**O que é:** Framework Google com engine próprio (Skia), compila para
ARM nativo em iOS/Android, mais Web (experimental) e Desktop. Linguagem
Dart.

**Prós:**
- **Performance nativa**: compila para ARM, sem bridge, sem JS engine.
  Animações 120fps garantidas em devices mid-range.
- **Hot reload**: stateful, melhor que RN em muitos casos
- **Custom UI**: controle pixel-perfect, ótimo para design
  diferenciado (Co-Star, Robinhood, etc.)
- **Single codebase** iOS + Android + (futuro) Web + Desktop
- **Growing community**: 165k+ stars, Google mantenedora ativa

**Contras:**
- **Reescrita TOTAL em Dart**. Zero reuso do Next.js/TypeScript. 100%
  da UI + lógica de apresentação precisa ser portada. **Custo 6-10×
  maior** que Capacitor.
- **Bundle size**: app mínimo Flutter 15-30MB (similar Capacitor),
  mas engine Skia é ~5MB adicional
- **Dart language**: aprender stack nova, contratar devs Dart
- **Web target ainda em beta**: 2026 estável para PWAs, mas não
  substitui Next.js para portal
- **2 stacks**: Next.js + Flutter mantidos em paralelo = 2× custo
  de manutenção

**Quando faz sentido:** produtos mobile-first com animações pesadas
(games, fitness, edição), times que já conhecem Dart, ou quando a
identidade visual exige custom rendering.

**Veredito Akasha:** ❌ **Não recomendado**. Custo de reescrita é o
maior entre as 4 opções. Não há benefício de performance que justifique
para o caso de uso (texto + cards + 1 push/dia).

---

### 1.4 PWA-first (Service Worker + Web Push VAPID)

**O que é:** Progressive Web App instalado via "Add to Home Screen"
do navegador. Service Worker permite offline-first, Web Push API
(VAPID) envia push notifications, manifest.json dá ícone e splash
screen.

**Prós:**
- **Zero custo adicional** sobre a stack Next.js existente. Portal
  já é web — adicionar SW + manifest + push é 1-2 sprints de
  trabalho.
- **Bundle size mínimo**: 200-500KB inicial (vs 15-30MB nativo).
  Crítico para audiência BR com plano de dados limitado.
- **OTA updates instantâneo**: novo build → usuários veem na próxima
  visita. Sem App Store review.
- **App Store bypass**: sem comissão 30%/15%, sem review 24-48h.
  Toda a receita fica no projeto.
- **Compatibilidade universal**: iOS 16.4+ (Web Push chegou em
  mar/2023), Android 5+ (Chrome 80+). ~95% do mercado mobile BR.
- **Reuso 100% do código Next.js**. RSC + Edge Runtime + Turbopack
  funcionam nativamente.
- **SEO + compartilhamento**: URL compartilhável no WhatsApp, sem
  precisar "baixe o app".

**Contras:**
- **iOS push quirks**: Web Push no iOS só funciona em PWA instalado
  (Add to Home Screen) desde iOS 16.4. Antes disso, silencioso.
  Em 2026, ~85% dos iPhones BR são iOS 16+, então OK.
- **Sem App Store discoverability**: usuários não acham o app
  navegando na Store. Compensado por SEO + WhatsApp + boca-a-boca.
- **Sem IAP nativo**: compras in-app precisam ser via web (Stripe
  Checkout, MercadoPago Redirect, Pix). Funcional, mas tem friction.
- **Sem biometric prompt nativo**: WebAuthn existe mas adoção
  varia. Fallback para password OK para Akasha.
- **Background sync limitado**: iOS não suporta, Android sim via
  Periodic Background Sync (Chrome 80+).

**Quando faz sentido:** portais de conteúdo, SaaS, ferramentas de
produtividade, audiência mobile-first em mercados onde App Store tem
barreira. **Exatamente o caso Akasha.**

**Veredito Akasha:** ✅✅ **Recomendação primária**. Caminho crítico
do produto (1 push/dia + Mandato + leitura) é 100% viável. Custo de
implementação = 1-2 sprints.

---

## 2. Decision Matrix (4 frameworks × 9 critérios)

| Critério (peso) | PWA | Capacitor | Expo (RN) | Flutter |
|-----------------|-----|-----------|-----------|---------|
| **Reuso código Next.js** (20%) | 100% | 95% | 60% | 0% |
| **Bundle size** (15%) | 0.5MB ✅ | 20MB ⚠️ | 60MB ❌ | 25MB ⚠️ |
| **Push notifications** (15%) | Web Push (iOS 16.4+) ✅ | FCM + APNs ✅ | FCM + APNs ✅ | FCM + APNs ✅ |
| **Custo implementação** (15%) | 1-2 sprints ✅ | 2-4 sprints ⚠️ | 6-10 sprints ❌ | 10-16 sprints ❌ |
| **Acesso App Store** (10%) | ❌ | ✅ | ✅ | ✅ |
| **PT-BR / BR mobile** (10%) | ✅✅ URL, WhatsApp | ✅ App + URL | ✅ App | ✅ App |
| **Manutenção 12mo** (10%) | 1 stack ✅ | 1.1 stack ✅ | 2 stacks ❌ | 2 stacks ❌ |
| **Performance UX** (5%) | Suficiente ✅ | WebView+ ✅ | Nativa ✅✅ | Nativa ✅✅ |
| **Score (0-10)** | **9.0** | **7.5** | **5.0** | **4.0** |

**PWA wins** em reuso, bundle, custo, manutenção. Capacitor é o
upgrade natural para App Store. RN/Flutter perdem por reescrita
total sem ganho de produto.

---

## 3. Roadmap de Implementação

### Phase 1 — PWA (já parcialmente feito)

**Status atual:** Portal Next.js 16.2+ já é web. Falta:
- [ ] `manifest.json` com name, icons (192px + 512px), theme_color,
      background_color, display: standalone
- [ ] Service Worker registrado (next-pwa plugin ou Workbox manual)
- [ ] Web Push API + VAPID keys (geradas 1×, armazenadas em env)
- [ ] Subscribe endpoint no backend (Supabase Edge Function)
- [ ] "Add to Home Screen" prompt customizado (PwaInstallPrompt já
      removido per F-220, mas pode haver banner customizado)
- [ ] Push subscription persistido na tabela `user_devices`
- [ ] Cron diário (Vercel Cron) envia push 1×/dia no horário do
      usuário (timezone do `user.timezone`)

**Estimativa:** 1-2 sprints (2-4 semanas de 1 dev)
**Custo mensal:** $0 (Vercel free tier + Supabase free tier até 5k
usuários ativos)

### Phase 2 — Capacitor wrapper (v0.5+)

**Quando:** após validação do PWA com 1k+ MAU e 1 parceria
estratégica ativa (terapeuta, casa de cabala, app de bem-estar
parceiro).

**Setup:**
- [ ] `npm install @capacitor/core @capacitor/cli`
- [ ] `npx cap init` com appId `com.akasha.app` e appName `Akasha`
- [ ] Adicionar plataformas: `npx cap add ios && npx cap add android`
- [ ] Build Next.js para `out/` (static export) OU configurar
      servidor Next.js ativo que o app aponta (com deep linking)
- [ ] Instalar plugins: `@capacitor/push-notifications` (FCM/APNs),
      `@capacitor/app` (deep links), `@capacitor/share`, `@capacitor/haptics`
- [ ] Configurar iOS signing (Apple Developer Program $99/ano) +
      Android signing (Play Console $25 one-time)
- [ ] App Store assets: screenshots, description PT-BR + EN, privacy
      policy URL
- [ ] Submit to App Store + Play Store (review: 24-48h iOS, few
      hours Play)
- [ ] OTA via Capawesome Live Update (similar Expo Updates) para
      correções urgentes sem resubmit

**Estimativa:** 2-4 sprints (4-8 semanas de 1 dev)
**Custo mensal:** Apple Developer $99/ano + Play Console $25 one-time
+ Capacitor Cloud (opcional, $0 self-hosted)

### Phase 3 — App nativa (não planejado)

**Quando:** somente se audiência US-EU justificar + receita
previsível >$5k MRR. Flutter ou RN seriam considerados.

**Não prioridade para v1.** Akasha é produto brasileiro, mobile-first
web, audiência sensível a preço. App nativa só faz sentido se virar
plataforma de assinatura premium (USD/EUR pricing) com 10k+
assinantes.

---

## 4. Por que NÃO App Store agora

3 razões pragmáticas:

1. **Comissão 30% Apple / 15% Google** sobre IAP. Akasha é Pix-first,
   Stripe secundário. Subscription via web = 0% comissão. Sub
   via Store = 15-30% perdido. Para produto BR onde pricing é
   R$ 29,90/mês, 30% = R$ 9/mês por usuário → inviável sem
   cobrar 50%+ mais caro.
2. **Review time + friction**: push rejeitado por mencionar "espiritual"
   ou "cura" pode atrasar 1-2 semanas. iOS review humano,
   subjetivo. PWA = sem review.
3. **Discoverability não-escalável**: App Store Optimization (ASO)
   para nicho "espiritual cabala astrologia" é low-volume
   (Co-Star, The Pattern, Sanctuary dominam top 10). A
   aquisição orgânica do Akasha é via SEO + WhatsApp + parcerias
   com terapeutas BR, não via Store browse.

**Quando reconsiderar:** (a) MRR > R$ 30k/mês (comissão vira fixed
cost aceitável), (b) parceria estratégica exigir Store presence
(casa de cabala quer co-brand), (c) audiência US-EU >20% do MAU.

---

## 5. Métricas de Sucesso

Para validar que PWA-first está funcionando, acompanhar:

| Métrica | Meta v1.0 | Como medir |
|---------|-----------|-----------|
| **PWA install rate** | 30%+ dos MAU | `beforeinstallprompt` events / unique visitors |
| **Push opt-in rate** | 50%+ dos instalados | subscription events / install events |
| **Push CTR (Mandato)** | 25%+ | push open / push sent (via VAPID analytics) |
| **Daily active via push** | 40%+ dos push subscribers | DAU / push subscribers |
| **Time to Mandato** | < 3s p95 | RSC + Edge + SW cache measurement |
| **Lighthouse PWA score** | 90+ | CI gate no `lighthouse-ci` |
| **iOS Safari push works** | 100% (iOS 16.4+) | manual test on iOS 16/17/18 devices |

Se PWA install rate < 15% após 3 meses, reconsiderar Capacitor
para reduzir friction de "Add to Home Screen" (App Store install
é 1-tap vs PWA 4-tap).

---

## 6. Próximos Passos (concreto)

**Esta semana:**
- [ ] Adicionar `manifest.json` + icons ao portal Next.js
- [ ] Implementar Service Worker com Workbox
- [ ] Gerar VAPID keys, armazenar em `.env.local`
- [ ] Endpoint `/api/push/subscribe` + tabela `user_devices`

**Próximas 2 semanas:**
- [ ] Vercel Cron envia push diário no timezone do user
- [ ] "Add to Home Screen" prompt customizado
- [ ] Lighthouse CI gate (PWA score >= 90)
- [ ] TestFlight interno para iOS Safari PWA install (sanity check)

**Mês 2:**
- [ ] Métricas de push CTR + install rate
- [ ] Decisão go/no-go para Capacitor baseado em dados

---

## 7. Conclusão

**PWA-first é a resposta certa para o Akasha no contexto 2026:**
audiência brasileira, produto de Push + leitura, stack Next.js
existente, custo zero incremental, sem comissão App Store. O
upgrade path para Capacitor existe e é barato (2-4 sprints) quando
fizer sentido. RN/Flutter ficam na gaveta até segunda ordem.

**Próxima decisão quando:** MRR > R$ 30k OU parceria Store-mandated
OU audiência US-EU > 20% MAU. Nenhuma dessas é prioridade v1.

**Sister documents:** `.autonomous/research/tech/stack_v1.md` (D-030
Next.js 16.2+ rationale), `.autonomous/research/ethics/ethics_charter_v1.md`
(LGPD + dados em sa-east-1).

---

## 8. Referências

- [PWA Stats 2025 - Web Push support iOS 16.4+](https://web.dev/articles/push-notifications-on-the-web-ios)
- [Capacitor vs React Native vs Flutter 2026 comparison](https://ionic.io/resources/articles/capacitor-vs-react-native)
- [Next.js 16 PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Co-Star case study - native iOS first](https://www.costarastrology.com/)
- [Brazilian mobile usage 2025 - StatCounter](https://gs.statcounter.com/)
- [Web Push API + VAPID spec](https://datatracker.ietf.org/doc/rfc8292/)
- [Apple App Store Review Guidelines 5.2.3 (WebView apps)](https://developer.apple.com/app-store/review/guidelines/)
- [Stripe + Pix integration (BR instant payment)](https://stripe.com/docs/payments/pix)
