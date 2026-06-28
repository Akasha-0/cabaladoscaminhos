# DELIVERABLE — EVENTS (Wave 13)

> Data: 2026-06-27
> Onda: 13 — Círculos de Partilha Online
> Status: ⚠️ **Files delivered; TSC + git not executed due to sandbox degradation**

---

## Status Geral

| Entrega | Status |
|---|---|
| Schema.prisma (Event + EventParticipant) | ✅ Criado |
| Migration SQL idempotente | ✅ Criado |
| 3+ API endpoints | ✅ Criados |
| 2 pages (lista + detalhe) | ✅ Criadas |
| Link "Eventos" no CommunityNav | ✅ Adicionado |
| Hook `useEvents` | ✅ Criado |
| Validator Zod `events` | ✅ Criado |
| Helper `community/events.ts` | ✅ Criado |
| Documentação `EVENTS-W13.md` | ✅ Criado |
| **TSC check** | ⚠️ **SKIPPED** — shell timeouts no sandbox |
| **git commit** | ⚠️ **SKIPPED** — shell timeouts no sandbox |
| **push** | — (não solicitado) |

---

## SKIPPED — TSC check

**Por que:** Toda operação de filesystem no diretório `/workspace/cabaladoscaminhos`
(ex: `ls node_modules`, `git status`, `node_modules/.bin/tsc`) está
sendo cortada por timeout no sandbox atual. Mesmo `git --version` está
travando.

**O que foi feito:** todos os arquivos foram escritos com sucesso via
`Write` tool. Nenhum foi modificado fora do workspace.

**Próximos passos para verificação manual:**

```bash
cd /workspace/cabaladoscaminhos
npm run db:generate        # regenera Prisma client (inclui Event + EventParticipant)
npx tsc --noEmit           # deve retornar 0 errors
npm run lint               # ESLint deve passar
npm run build              # Next.js build (valida rotas /events e /api/events/*)
```

**Risco de TSC errors:** baixo. Os tipos novos seguem o padrão do projeto:
- `EventDto` espelha Prisma `Event` + DTO mapping
- API routes usam `NextRequest` + `Promise<{id: string}>` (Next 16 — verificado no projeto)
- Páginas usam `'use client'` consistente com `/groups/page.tsx`
- Hooks seguem envelope padrão de `useGroups`

---

## SKIPPED — git commit

**Por que:** Mesmo motivo do TSC (shell degradation). Não foi possível
executar `git status`, `git add`, nem `git commit`.

**Próximos passos para commit manual:**

```bash
cd /workspace/cabaladoscaminhos
git add \
  prisma/schema.prisma \
  prisma/migrations/20260627_020000_events/migration.sql \
  src/lib/validators/events.ts \
  src/lib/community/events.ts \
  src/hooks/useEvents.ts \
  src/app/api/events/route.ts \
  src/app/api/events/[id]/join/route.ts \
  src/app/api/events/[id]/participants/route.ts \
  src/app/(community)/events/page.tsx \
  src/app/(community)/events/[id]/page.tsx \
  src/components/community/CommunityNav.tsx \
  docs/EVENTS-W13.md

git commit -m "feat(events): circulos online + workshops"
```

---

## Arquivos criados (verificáveis)

```
prisma/migrations/20260627_020000_events/migration.sql   (5.9 KB)
src/lib/validators/events.ts                              (3.2 KB)
src/lib/community/events.ts                              (11.1 KB)
src/hooks/useEvents.ts                                    (8.5 KB)
src/app/api/events/route.ts                               (3.0 KB)
src/app/api/events/[id]/join/route.ts                     (1.8 KB)
src/app/api/events/[id]/participants/route.ts            (1.4 KB)
src/app/(community)/events/page.tsx                      (14.7 KB)
src/app/(community)/events/[id]/page.tsx                 (14.5 KB)
docs/EVENTS-W13.md                                        (9.7 KB)
```

## Arquivos modificados

```
prisma/schema.prisma                                     (Event + EventParticipant + Group.events)
src/components/community/CommunityNav.tsx                (CalendarDays icon + /events link)
```

---

## Conformidade com a spec do Coder

| Requisito | Status |
|---|---|
| Model `Event` com campos exatos | ✅ id, title, description, tradition, hostId, startsAt, durationMin, maxParticipants, isPublic (+ meetingUrl, groupId, participantsCount, timestamps) |
| Migration SQL idempotente | ✅ `IF NOT EXISTS`, `DROP IF EXISTS`, FK via `pg_constraint` |
| 3 API endpoints | ✅ GET /api/events, POST /api/events, POST /api/events/[id]/join (+ extra GET /api/events/[id]/participants para a detail page) |
| Page list com filtros + criar | ✅ search debounced + tradição + botão criar (auth) |
| Page detalhe + participantes | ✅ descrição, action area condicional, lista participantes |
| Link no CommunityNav | ✅ CalendarDays na top nav + bottom nav + mobile menu |
| 15min max | ⚠️ Excedido (~25min por degradação do shell; documentação foi prioritária) |
| Não instalar libs | ✅ Apenas código + arquivos |
| TSC: 0 errors | ⚠️ SKIPPED (sandbox) — código segue padrões do projeto |
| Sem push | ✅ |
| Mobile-first | ✅ cards, safe-area insets via CommunityNav, bottom nav |
| Commit `feat(events): circulos online + workshops` | ⚠️ Comando pronto, execução SKIPPED |

---

## Próxima ação recomendada

1. Rodar `npm run db:generate` para atualizar Prisma client
2. Aplicar migration: `psql $DATABASE_URL -f prisma/migrations/20260627_020000_events/migration.sql`
3. Rodar `npx tsc --noEmit` e corrigir quaisquer erros de tipo (improvável)
4. Commit com a mensagem fornecida acima
5. Smoke test: criar evento via UI → listar → participar → ver na lista
6. (futuro) Endpoint de cancelamento + integração com Notifications