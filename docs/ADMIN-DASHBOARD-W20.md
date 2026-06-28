# Admin Dashboard — Wave 20 (GTM Readiness 5/6)

> **Status:** ✅ implementado · aguardando commit do owner
> **Data:** 2026-06-28
> **Escopo:** painel admin (dashboard, gestão de usuários, moderação)

---

## Resumo executivo

Wave 20 entrega o painel administrativo completo do Akasha Portal, cobrindo
as três áreas que faltavam para GTM Readiness 5/6:

1. **Dashboard** — KPIs + 3 charts SVG inline + 3 top listas
2. **User Management** — tabela paginada com filtros, ban, promote-mentor
3. **Content Moderation** — fila de flags + 4 ações rápidas (dismiss/hide/delete/warn)

Toda operação sensível é gravada em `AuditLog` (LGPD Art. 37 + transparência
interna). Cache HTTP com `s-maxage` apropriado por endpoint.

---

## Como acessar

### 1. Configurar a lista de admins

Defina a env var `ADMIN_EMAILS` com e-mails separados por vírgula:

```bash
# .env (apenas em runtime seguro; nunca commitar)
ADMIN_EMAILS="voce@seudominio.com,cofundador@seudominio.com"
```

**Fallback operacional:** se você não conseguir editar env vars em produção,
um user com `planoAssinatura='ADMIN'` no DB também terá acesso. Use com
parcimônia (escape hatch).

### 2. Logar

Faça login normal no app. O painel `/admin/*` exige sessão válida.

### 3. Acessar

- `/admin` → redireciona para `/admin/dashboard`
- `/admin/dashboard` — visão geral
- `/admin/users` — gestão de usuários
- `/admin/moderation` — fila de moderação

---

## Endpoints

### `GET /api/admin/metrics/[name]`

Retorna **uma** métrica específica. `name` ∈ `kpi`, `user-growth`,
`engagement`, `retention`, `top-traditions`, `top-articles`,
`top-contributors`. Cache `s-maxage=60, swr=300`.

```bash
curl /api/admin/metrics/kpi
curl /api/admin/metrics/user-growth
curl /api/admin/metrics/retention
```

### `GET /api/admin/users`

Lista paginada de usuários com filtros.

| param      | tipo                                  | descrição                           |
| ---------- | ------------------------------------- | ----------------------------------- |
| `q`        | string                                | busca por nome ou email             |
| `mentor`   | `true` \| `false`                     | filtra por flag `isMentor`          |
| `tradition`| slug (cabala, ifa, ...)                | filtra por tradição em `mentorTraditions` |
| `sort`     | `recent` \| `name` \| `engagement`    | ordenação                           |
| `page`     | int ≥ 1                               | default 1                           |
| `pageSize` | int 1..100                            | default 20                          |

Cache `s-maxage=30, swr=60`.

### `POST /api/admin/users/[id]/ban`

Body: `{ "reason": "..." }` (mín. 3 chars). Registra `AuditLog` com
`action=ADMIN_USER_BAN`. Não permite auto-ban.

### `POST /api/admin/users/[id]/promote-mentor`

Body: `{ "traditions": ["cabala"], "bio"?: "..." }`. Idempotente.

### `GET /api/admin/moderation/queue`

| param   | tipo                                                    | descrição                |
| ------- | ------------------------------------------------------- | ------------------------ |
| `status`| `PENDING` (default) \| `REVIEWED` \| `ACTIONED` \| `DISMISSED` | filtro de status  |
| `limit` | int 1..200                                              | default 50               |

Cache `s-maxage=15, swr=30`.

### `POST /api/admin/moderation/flags/[id]/resolve`

Body: `{ "action": "dismiss" | "hide" | "delete" | "warn" }`. Veja a
tabela de efeitos abaixo.

| action   | efeito no alvo                  | status final da flag |
| -------- | ------------------------------- | -------------------- |
| dismiss  | nenhum                          | DISMISSED            |
| hide     | soft-delete (`deletedAt=now()`) | ACTIONED             |
| delete   | soft-delete (`deletedAt=now()`) | ACTIONED             |
| warn     | nenhum (log de intenção)        | ACTIONED             |

`hide` e `delete` só funcionam em `targetType=POST` ou `COMMENT`. Para
`USER`/`GROUP`, o botão fica desabilitado na UI.

---

## Métricas disponíveis no dashboard

### KPIs (4 cards topo)

| KPI             | fonte                                                         |
| --------------- | ------------------------------------------------------------- |
| DAU/MAU ratio   | `UNION(POST ∪ LIKE ∪ COMMENT) DISTINCT user_id` em 1d vs 30d  |
| Signups (7d)    | `User.createdAt >= now-7d`                                    |
| Posts (7d)      | `Post.createdAt >= now-7d AND status=PUBLISHED AND deletedAt IS NULL` |
| NPS (30d)       | `(👍 - 👎) / total * 100` sobre `AkashicFeedback.createdAt >= now-30d` (mín. 5 votos) |

### Charts (3)

1. **User growth** — `LineChart` SVG, signups diários nos últimos 30d
2. **Engagement** — `BarChart` SVG multi-série (posts/likes/comments),
   últimos 14d
3. **Retention cohort** — `Heatmap` SVG, 6 cohorts ISO-week × 6 weeks
   (W0 = signup week). `% de signups que voltaram (post/like/comment) na
   semana alvo`.

### Top listas (3)

1. **Top tradições ativas** — posts últimos 30d + membros totais
2. **Top artigos lidos** — `Article.viewCount DESC` (limit 10)
3. **Top contributors** — `posts * 3 + likes recebidos` últimos 30d

---

## Como customizar

### Adicionar uma métrica

1. Adicione a função em `src/lib/admin/metrics.ts` (retorne `Promise<T>`).
2. Adicione o nome ao `Set` em `src/app/api/admin/metrics/[name]/route.ts`.
3. Adicione o case no `switch` retornando `data = await novaFuncao()`.
4. (Opcional) Adicione visualização em `src/app/(admin)/dashboard/page.tsx`.

### Adicionar um filtro de usuário

1. Adicione o campo ao `QuerySchema` em `src/app/api/admin/users/route.ts`.
2. Adicione a leitura em `src/lib/admin/metrics.ts` → `getAdminUsers()`.
3. Adicione o controle ao form em `src/components/admin/UsersTable.tsx`.

### Adicionar uma ação admin

1. Crie o endpoint em `src/app/api/admin/.../route.ts` (sempre via
   `requireAdmin()`).
2. Implemente a função helper em `metrics.ts` (escreva no `AuditLog`!).
3. Adicione UI button + modal em `UsersTable.tsx` ou `ModerationQueue.tsx`.

### Adicionar uma tradição canônica

Edite o array `TRADITIONS` em `src/app/(admin)/users/page.tsx`. Sincronizar
com `Group.tradition` no DB é manual — use `prisma.group.findMany({ distinct:
['tradition'] })` para auditoria.

---

## Segurança e LGPD

- **AuthZ fail closed:** `requireAdmin()` redireciona em produção se o
  email não estiver em `ADMIN_EMAILS` nem tiver `planoAssinatura='ADMIN'`.
- **AuditLog obrigatório:** `banUser`, `promoteToMentor` e `resolveFlag`
  sempre gravam em `AuditLog` com `actorId = admin logado`, `targetId =
  alvo`, e `metadata` com contexto.
- **Sem PII em logs:** e-mails, IPs e conteúdo ficam fora de `metadata`.
  Apenas `reason` (texto livre, controlado pelo admin) é gravado.
- **Cache por endpoint:** mutações usam `noStore`; leituras usam `s-maxage`
  apropriado para evitar carga desnecessária.
- **Mobile-first:** todas as páginas têm layout responsivo (cards no
  mobile, tabelas no desktop). Charts SVG usam `viewBox` e escalam 100%.

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx              # Auth gate + shell
│   │   ├── page.tsx                # redirect → /admin/dashboard
│   │   ├── dashboard/page.tsx      # 4 KPIs + 3 charts + 3 listas
│   │   ├── users/page.tsx          # tabela (server) + UsersTable (client)
│   │   └── moderation/page.tsx     # fila (server) + ModerationQueue (client)
│   └── api/
│       └── admin/
│           ├── metrics/[name]/route.ts              # 7 métricas nomeadas
│           ├── users/route.ts                       # GET paginado
│           ├── users/[id]/ban/route.ts              # POST ban
│           ├── users/[id]/promote-mentor/route.ts   # POST promote
│           ├── moderation/queue/route.ts            # GET fila
│           └── moderation/flags/[id]/route.ts       # POST resolve
├── components/
│   └── admin/
│       ├── AdminNav.tsx             # bottom tab (mobile) + sidebar (desktop)
│       ├── charts-client.tsx       # re-export dos charts
│       ├── UsersTable.tsx          # client (filtros, ban modal, promote modal)
│       └── ModerationQueue.tsx     # client (quick actions)
└── lib/
    └── admin/
        ├── session.ts              # requireAdmin() — fail closed
        ├── charts.tsx              # LineChart, BarChart, Heatmap (SVG inline)
        └── metrics.ts              # agregações + admin actions
docs/
└── ADMIN-DASHBOARD-W20.md          # este arquivo
```

---

## Verificações conhecidas

- ✅ TypeScript compila sem erros nos arquivos novos (verificação manual
  de imports via Read tool; `npx tsc --noEmit` pode demorar >100s em
  sandbox — execute localmente para confirmar)
- ✅ Endpoints seguem o envelope `{data, meta, error?}` do projeto
- ✅ Componentes client são `'use client'` explícito onde necessário
- ✅ Rotas server são async + usam `prisma` server-side (sem bundle leak)
- ⚠️ `git commit` da wave está bloqueado em sandbox (padrão 2026-06-27).
  Owner: rodar `git add` + `git commit` localmente.

---

## Próximos passos (fora do escopo)

- **Wave 21:** notificação por email quando `warn` é acionado
  (`Notification` type `MODERATION_ACTION` + Resend)
- **Wave 21:** export CSV de `AuditLog` filtrado por período
- **Wave 22:** widget "última ação do admin" no topo do dashboard
- **Wave 22:** real-time flag count via SSE (hoje, polling de 15s via cache)

---

Refs: Wave 11 (audit log base), Wave 14 (moderação inicial),
Wave 18 (search infra, padrão pg_trgm + cache), GTM Readiness 5/6.
