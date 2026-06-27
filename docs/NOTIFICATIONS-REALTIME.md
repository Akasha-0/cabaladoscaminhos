# 🔔 Notifications Realtime — Verificação

> Documento de 2026-06-27 cobrindo P1 #7 do gap analysis
> Como verificar que notificações Realtime funcionam end-to-end

## Arquitetura

```
┌────────────────────┐      INSERT       ┌─────────────────┐
│ /api/notifications │ ────────────────► │   Postgres      │
│ /api/posts/[id]/   │   via Prisma      │   notifications │
│   like             │                   │   table         │
└────────────────────┘                   └─────────────────┘
                                                     │
                                                     │ postgres_changes
                                                     │ (Realtime)
                                                     ▼
                                          ┌─────────────────────┐
                                          │  Supabase Realtime  │
                                          │  channel:           │
                                          │  "notifications"    │
                                          └─────────────────────┘
                                                     │
                                                     │ websocket
                                                     ▼
                                          ┌─────────────────────┐
                                          │ useCommunity        │
                                          │ Notifications hook  │
                                          │ → UI atualiza       │
                                          │ + toast/badge       │
                                          └─────────────────────┘
```

## Producer

| Endpoint | Quando gera notificação |
|---|---|
| `POST /api/posts/[id]/like` | Like em post → notif pro autor |
| `POST /api/users/[id]/follow` | Follow → notif pro seguido |
| `POST /api/posts/[id]/comments` | Comentário → notif pro autor do post |
| `POST /api/groups/[slug]/invite` | Convite → notif pro convidado |
| `POST /api/notifications` (admin) | Manuais (ex: evento, menção) |

Localização do código: `src/lib/notifications/triggers.ts`

## Consumer

- Hook: `src/hooks/useCommunityNotifications.ts` (409 linhas, completo)
- Subscreve canal `notifications` com `postgres_changes` event `INSERT`
- Filtra por `userId === currentUserId` (segurança)
- Atualiza `unreadCount` + adiciona na lista + dispara callback
- Suporta polling fallback se Realtime indisponível

## Verificação automatizada

### Script: `scripts/verify-notifications-realtime.ts`

```bash
# 1. Configure .env.local com Supabase URL + service-role key
cat .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# 2. Rode
pnpm verify:notifications-realtime
```

**Saída esperada:**

```
[setup] SUPABASE_URL=https://xxx.supabase.co
[setup] TEST_USER_ID=verify-1719484800000
[connect] subscribing to channel=notifications...
[connect] status=SUBSCRIBED
[connect] OK (assuming SUBSCRIBED)
[insert] inserting test notification via service-role...
[insert] inserted notification id=abc-123
[insert] received: { id: 'abc-123', userId: 'verify-...', type: 'TEST_VERIFY', ... }
[verify] OK — realtime delivery confirmed
  - id: abc-123
  - userId: verify-...
  - type: TEST_VERIFY
[cleanup] test notification deleted, channel removed
[done] PASS
```

**Exit codes:**
- `0` — PASS (realtime delivery confirmada)
- `2` — INSERT falhou (RLS / table missing)
- `3` — Payload mismatch (filtro errado ou evento não disparou)
- `99` — Erro inesperado

## Verificação manual (UI)

### Setup

1. Abra o app em duas abas/janelas com usuários diferentes (A e B)
2. Faça login com B em uma aba, A em outra
3. Na aba A: navegue para a página de perfil de B
4. Na aba B: fique numa página que mostra o sino de notificações (ex: `/feed`)

### Ações

1. **Like:** Na aba A, clique em "curtir" num post de B
2. **Aguarde <2s** — na aba B, deve aparecer:
   - Badge no sino de notificações (número incrementa)
   - Item na lista de notificações
   - (Opcional) Toast no canto inferior direito

### Validação visual

- Badge: incrementa de N para N+1
- Lista: nova notif no topo com tipo "LIKE" e ator "A"
- Toast: aparece e some em 4s

## Troubleshooting

### Realtime não conecta

1. **Verifique RLS na tabela notifications** — service-role bypassa, mas o cliente do user precisa de policy SELECT
2. **Verifique Realtime publication:**
   ```sql
   -- No SQL editor do Supabase:
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   -- Deve incluir "notifications"
   ```
3. **Verifique variáveis:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` devem estar públicas (NEXT_PUBLIC_*)

### Payload não chega

1. **Confirme que `enableRealtime=true`** no hook — default é true, mas pode ser desligado
2. **Confirme que `getCurrentUserId()` retorna o ID correto** — log no console: `console.log(sessionStorage.getItem('userId'))`
3. **Abra DevTools → Network → WS** — deve ter conexão `wss://*.supabase.co/realtime/v1/websocket`

### Polling fallback

Se Realtime falha, o hook automaticamente cai pra polling (`/api/notifications` a cada N segundos). Não é tempo real mas funciona.

Para forçar polling: `enableRealtime={false}` no consumer.

## Tests automatizados

- `__tests__/useCommunityNotifications.test.ts` (484 linhas) — polling + state + filtros
- `__tests__/notifications-api.test.ts` (582 linhas) — CRUD + triggers

Mocks do Supabase client são usados (não testam conexão real). Para testar a conexão real, use o script `verify:notifications-realtime`.

## Próximos passos

- [ ] Adicionar browser Notification API (desktop notifications com permissão)
- [ ] Sound feedback em nova notif
- [ ] Reconnect indicator no UI quando Realtime cai
- [ ] Toast component (existem via `useToast` mas não conectado ao hook ainda)
- [ ] Notif grouping (várias curtidas → "+5 curtidas no seu post")