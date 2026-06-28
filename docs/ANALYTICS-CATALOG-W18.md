# Analytics Events Catalog — Wave 18

> **Status**: ✅ Implementado
> **Branch**: main
> **Data**: 2026-06-27
> **Total eventos catalogados**: 50

Catálogo tipado de eventos de tracking + helpers + integrações críticas.
Single source of truth para todos os eventos enviados ao PostHog.

---

## TL;DR

| O quê | Onde | Como |
|---|---|---|
| Catálogo (50 eventos) | `src/lib/analytics/events-catalog.ts` | Zod schemas tipados por nome |
| Helpers semânticos | mesmo arquivo | `trackSignup()`, `trackPostCreate()`, etc |
| Server-side tracking | `src/lib/analytics/server.ts` | `trackServerEvent(name, props, userId)` |
| Integrações aplicadas | 10 endpoints críticos | Ver tabela abaixo |
| LGPD | classification por evento | `none` / `low` / `high` |

---

## Por que eventos tipados?

Sem tipagem, você acaba com:
- Eventos duplicados (`user_signup` vs `signup` vs `register`)
- Properties divergentes (`userId` vs `user_id` vs `uid`)
- Payloads silenciosamente errados quebrando dashboards

O catálogo força:
- **Nome único** registrado no índice
- **Schema Zod** validado em runtime antes do envio
- **Categorização** para organização de dashboards
- **Sensitivity LGPD** para opt-in/opt-out futuro

---

## Estrutura do catálogo

Cada evento tem 5 campos:

```ts
{
  name: "user_signed_up",          // snake_case, imutável
  category: "auth",                // agrupamento semântico
  sensitivity: "low",              // LGPD: none | low | high
  description: "...",              // quando dispara
  schema: z.object({...})          // validação runtime
}
```

A union de tipos `EventName` é inferida automaticamente. Cada helper
semântico tem types derivados do schema, então TS pega erros em tempo
de compilação.

---

## Eventos por categoria (50 total)

### Auth (7)

| Evento | Sensitivity | Quando |
|---|---|---|
| `user_signed_up` | low | Signup completou (email + OAuth) |
| `user_logged_in` | low | Login com sucesso |
| `user_logged_out` | none | Logout |
| `password_reset_requested` | low | Pedido de reset |
| `password_reset_completed` | low | Reset completou |
| `oauth_flow_started` | low | Click em botão OAuth |
| `oauth_flow_completed` | low | OAuth resolveu (sucesso/erro) |

### Onboarding (6)

| Evento | Sensitivity | Quando |
|---|---|---|
| `onboarding_step_viewed` | none | Step apareceu |
| `onboarding_step_completed` | low | Step completou |
| `onboarding_tradition_selected` | low | Tradições escolhidas |
| `onboarding_skipped` | none | Skip CTA |
| `onboarding_completed` | low | Todas etapas completas |
| `onboarding_abandoned` | none | Saiu sem completar |

### Feed (8)

| Evento | Sensitivity | Quando |
|---|---|---|
| `feed_viewed` | none | Feed carregou |
| `post_created` | low | POST /api/posts sucesso |
| `post_viewed` | none | Abriu post individual |
| `post_liked` | none | Curtiu (não unlike) |
| `post_unliked` | none | Removeu curtida |
| `post_shared` | low | Compartilhou (qualquer canal) |
| `comment_created` | low | Comentário criado |
| `comment_liked` | none | Curtiu comentário |

### Library (5)

| Evento | Sensitivity | Quando |
|---|---|---|
| `library_article_viewed` | none | Abriu artigo |
| `library_article_read_completed` | none | Scroll >= 90% |
| `library_article_bookmarked` | none | Favoritou / desfavoritou |
| `library_article_shared` | low | Compartilhou artigo |
| `library_searched` | none | Busca na biblioteca |

### Akashic (6)

| Evento | Sensitivity | Quando |
|---|---|---|
| `akashic_chat_opened` | none | Abriu chat IA |
| `akashic_message_sent` | low | Enviou msg pra IA |
| `akashic_message_received` | none | Recebeu resposta |
| `akashic_voice_played` | none | Tocou TTS |
| `akashic_feedback_positive` | none | Thumbs up |
| `akashic_feedback_negative` | low | Thumbs down |

### Events (4)

| Evento | Sensitivity | Quando |
|---|---|---|
| `event_viewed` | none | Abriu página de evento |
| `event_joined` | low | Confirmou participação |
| `event_created` | low | Criou evento |
| `event_left` | none | Cancelou participação |

### Groups (2)

| Evento | Sensitivity | Quando |
|---|---|---|
| `group_created` | low | Criou grupo |
| `group_joined` | low | Entrou em grupo |

### Mentorship (4)

| Evento | Sensitivity | Quando |
|---|---|---|
| `mentor_profile_viewed` | none | Abriu perfil mentor |
| `mentorship_request_sent` | low | Enviou solicitação |
| `mentorship_request_accepted` | low | Mentor aceitou |
| `mentorship_message_sent` | low | Msg em mentoria ativa |

### Marketplace (4)

| Evento | Sensitivity | Quando |
|---|---|---|
| `marketplace_listing_viewed` | none | Abriu listing |
| `marketplace_affiliate_clicked` | low | Click em afiliado |
| `marketplace_purchase_intent` | **high** | Iniciou checkout |
| `newsletter_subscribed` | low | Newsletter signup |

### Reputation (1)

| Evento | Sensitivity | Quando |
|---|---|---|
| `reputation_contribution_earned` | low | Ganhou pontos |

### Errors (3)

| Evento | Sensitivity | Quando |
|---|---|---|
| `api_error` | low | API >= 500 |
| `validation_error` | none | Payload 4xx |
| `network_error` | none | Offline / timeout / DNS |

### Navigation (1)

| Evento | Sensitivity | Quando |
|---|---|---|
| `page_viewed` | none | Route change (auto) |

---

## Helpers disponíveis

```ts
import {
  trackSignup, trackLogin, trackLogout,
  trackPostCreate, trackPostLike,
  trackArticleView, trackAkashicMessageSent,
  trackNewsletterSubscribe, trackGroupJoined,
  trackApiError,
  trackEvent,           // escape hatch — qualquer evento do catálogo
  hashEmailForAnalytics, // LGPD-safe email hash
} from '@/lib/analytics/events-catalog';
```

Para server-side (API routes):

```ts
import { trackServerEvent, trackServerEventValidated } from '@/lib/analytics/server';

await trackServerEventValidated('post_created', {
  postId: '...', authorId: '...', ...
}, viewerId);
```

---

## Integrações aplicadas (10 endpoints críticos)

| # | Endpoint / Local | Evento | Quem dispara |
|---|---|---|---|
| 1 | `POST /api/posts` | `post_created` | Server (route handler) |
| 2 | `POST /api/posts/[id]/like` | `post_liked` | Server (só quando liked=true) |
| 3 | `POST /api/groups` | `group_created` | Server |
| 4 | `POST /api/akashic/chat` | `akashic_message_sent` | Server (com tookMs) |
| 5 | `POST /api/newsletter/subscribe` | `newsletter_subscribed` | Server (com emailHash) |
| 6 | `RegisterForm.tsx` | `user_signed_up` | Client (captura imediata) |
| 7 | `PostHogProvider` | `page_viewed` | Client (auto via usePathname) |
| 8 | `POST /api/posts/[id]/comments` | `comment_created` | Server |
| 9 | `POST /api/events` | `event_created` | Server |
| 10 | `SupabaseProvider.onAuthStateChange` | `user_logged_in` / `user_logged_out` | Client (auth state) |

**Por que server-side em APIs?**
- Eventos críticos (post criado, signup) não podem se perder se o usuário
  fechar a tab antes do flush de 5s do client.
- Webhooks de providers (Stripe, etc.) só rodam server-side.

**Por que client-side em signup?**
- Captura IMEDIATA do momento (mesmo que server-side tenha falhado).
- Permite identify() no PostHog com user_id antes de qualquer outro evento.

---

## Como usar no PostHog Dashboard

### 1. Acessar PostHog

```
https://us.i.posthog.com  (default)
```

ou host customizado via `NEXT_PUBLIC_POSTHOG_HOST`.

### 2. Insights principais

Pré-configurações sugeridas:

| Insight | Tipo | Eventos | Granularidade |
|---|---|---|---|
| **DAU** | Trend | `page_viewed` (unique users) | Day |
| **Signups/dia** | Trend | `user_signed_up` | Day |
| **Activation rate** | Funnel | `user_signed_up` → `onboarding_completed` → `post_created` | - |
| **Content engagement** | Trend | `post_created`, `post_liked`, `comment_created` | Week |
| **Akashic usage** | Trend | `akashic_message_sent` (count + unique users) | Day |
| **Newsletter conversion** | Funnel | `newsletter_subscribed` by `frequency` | - |
| **Error rate** | Trend | `api_error` group by `endpoint` | Day |

### 3. Cohorts sugeridos

| Cohort | Definição |
|---|---|
| **Ativados** | `user_signed_up` + `post_created` nos primeiros 7 dias |
| **Power users** | `post_created` >= 5 OR `akashic_message_sent` >= 20 |
| **Akashic fans** | `akashic_message_sent` >= 10 |
| **Engajados biblioteca** | `library_article_read_completed` >= 3 |
| **Inativos 30d** | Último `page_viewed` > 30 dias atrás |

### 4. Feature flags

Use `user_signed_up` + `onboarding_tradition_selected.traditions` para
rollouts graduais por tradição espiritual.

---

## Privacy & LGPD

### Classificação de sensibilidade

| Level | Significado | Ação |
|---|---|---|
| `none` | Sem PII, agregados | Sempre coletado |
| `low` | Pode ter PII não-cru (uuid, hash) | Coletado por padrão |
| `high` | Intensa ou pode revelar identidade | Requer consentimento explícito |

Atualmente **NENHUM** evento está em produção com `high`. O único caso
mapeado é `marketplace_purchase_intent` (preparado para futuro checkout).

### Regras aplicadas

1. **PII nunca cru**: emails são hashed com SHA-256 (16 chars)
   via `hashEmailForAnalytics()`. Telefones e CPFs são proibidos
   como properties.
2. **UUID only**: user IDs são sempre Supabase UUIDs (não
   sequenciais expostos).
3. **Opt-in/opt-out por categoria**: implementado o ponto de
   extensão `window.akasha.consent.analytics` — eventos `high`
   checam antes de enviar. (Ativação final depende do
   `CookieConsent`).
4. **Amostragem**: configurável via `POSTHOG_SAMPLE_RATE` (default 1.0).
   Eventos `high` ignoram sample rate (sempre 100%).

### Como adicionar evento novo respeitando LGPD

```ts
// 1. Escolha a sensitivity correta:
//    - none: contagens, page views, cliques
//    - low: ações de usuário identificável (uuid, hash)
//    - high: dados financeiros, saúde, orientação sexual

// 2. Nunca use PII cru:
trackEvent('newsletter_subscribed', {
  emailHash: await hashEmailForAnalytics(email), // ✅
  email,                                         // ❌ NUNCA
});

// 3. Documente no catálogo (Zod schema com .email() etc só
//    para campos que validam formato, NAO armazenam valor)
```

---

## Como adicionar evento novo

1. **Adicione ao catálogo** em `src/lib/analytics/events-catalog.ts`:

   ```ts
   export const EVENT_CATALOG_FEED = {
     // ... outros
     MY_NEW_EVENT: {
       name: 'my_new_event',
       category: 'feed',
       sensitivity: 'low',
       description: 'Quando X acontece',
       schema: z.object({
         userId: z.string().uuid(),
         foo: z.string(),
       }),
     },
   } as const;
   ```

2. **Type inference é automática** — TS pega o novo evento em
   `EventName` e `EventSchemaMap`.

3. **(Opcional) Helper semântico**:

   ```ts
   export function trackMyNewEvent(userId: string, foo: string) {
     trackEvent('my_new_event', { userId, foo });
   }
   ```

4. **Documente nesta página** (tabela da categoria).

5. **Use no call-site**:

   ```ts
   // Client
   trackMyNewEvent(viewer.id, 'bar');

   // Server
   await trackServerEventValidated('my_new_event', {...}, viewerId);
   ```

---

## Como funciona o tracking

### Client

```
┌─ Component ─┐
│  trackX()   │
└──────┬──────┘
       │ trackEvent() valida via zod
       ▼
┌─ window.akasha.posthog (singleton) ─┐
│  queue.push()                        │
└──────┬──────────────────────────────┘
       │ flush a cada 5s ou 20 eventos
       ▼
┌─ PostHog /batch endpoint ──────────┐
│  api_key + batch[]                 │
└────────────────────────────────────┘
```

### Server (API route)

```
┌─ API Route ─┐
│  trackPostCreate()                 │
└──────┬─────────────────────────────┘
       │ window é undefined → import('./server')
       ▼
┌─ captureServerEventSafe ───────────┐
│  fetch POST /capture               │
└──────┬─────────────────────────────┘
       │ fire-and-forget
       ▼
┌─ PostHog /capture endpoint ────────┐
└────────────────────────────────────┘
```

Falhas são silenciosas (analytics não quebra UX).

---

## Mobile-first & performance

Decisões para não degradar UX mobile:

1. **Sample rate**: 1.0 por padrão, mas configurável
   (`POSTHOG_SAMPLE_RATE=0.3` em prod de alto tráfego).
2. **Batch flush**: 5s ou 20 eventos (reduz requests).
3. **beforeunload**: força flush antes de fechar a tab.
4. **Bundle size**: helper `trackEvent` é ~3KB gzip.
   Para pages mobile-first, use helpers semânticos (`trackSignup`)
   em vez de `trackEvent` para tree-shaking melhor.
5. **Sem blocking**: tracking é fire-and-forget. Latência
   adicional: <1ms (apenas validação Zod).

---

## Métricas de saúde do tracking

Verifique periodicamente no PostHog:

| Métrica | Esperado |
|---|---|
| `page_viewed` volume / DAU | ratio > 3:1 (usuários ativos vêem >3 páginas) |
| `api_error` rate | < 1% das requests totais |
| `user_signed_up` drop-off | > 70% completa `onboarding_completed` |
| `akashic_message_sent` per session | > 1.5 (indica boa retenção) |
| `newsletter_subscribed` com `emailHash` | 100% (sanity check LGPD) |

---

## Próximos passos

- [ ] **Wave 19**: Adicionar eventos de `search_query`, `filter_applied`,
  `sort_changed` (engagement granular)
- [ ] **Wave 19**: Integrar consentimento LGPD com `CookieConsent`
  (gate de eventos `high`)
- [ ] **Wave 20**: PostHog experiments (A/B testing no onboarding)
- [ ] **Wave 20**: Dashboard público `/stats` com top eventos agregados

---

## Arquivos modificados (Wave 18)

| Arquivo | Mudança |
|---|---|
| `src/lib/analytics/events-catalog.ts` | **NOVO** — catálogo + helpers (50 eventos) |
| `src/lib/analytics/server.ts` | **NOVO** — wrappers server-side |
| `src/app/api/posts/route.ts` | + `trackPostCreate` |
| `src/app/api/posts/[id]/like/route.ts` | + `trackPostLike` |
| `src/app/api/posts/[id]/comments/route.ts` | + `trackEvent('comment_created')` |
| `src/app/api/groups/route.ts` | + `trackEvent('group_created')` |
| `src/app/api/events/route.ts` | + `trackEvent('event_created')` |
| `src/app/api/akashic/chat/route.ts` | + `trackAkashicMessageSent` |
| `src/app/api/newsletter/subscribe/route.ts` | + `trackNewsletterSubscribe` |
| `src/components/auth/RegisterForm.tsx` | + `trackSignup` |
| `src/components/providers/SupabaseProvider.tsx` | + `trackLogin` / `trackLogout` |

Sem mudança em `src/lib/monitoring/posthog.ts` (já tinha o singleton).

---

**Refs**:
- `docs/MONITORING-WAVE11.md` — setup PostHog
- `docs/CONSENT-LGPD.md` — política de consentimento (TODO Wave 19)
- [PostHog Capture API](https://posthog.com/docs/api/capture)