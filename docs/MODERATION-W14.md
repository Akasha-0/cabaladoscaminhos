# Sistema de Moderação — Wave 14 (2026-06-27)

> Comunidade segura, moderação transparente, fluxo respeitoso.

## Filosofia

O sistema de moderação da Akasha nasce de três princípios:

1. **Respeito** — nunca expor o denunciante. Nunca tratar quem reporta como "problema".
2. **Transparência** — toda ação é registrada em `AuditLog`. Membros podem ver que existe moderação, não quem faz.
3. **Cirurgia > velocidade** — ações são proporcionais. Spam recebe `dismiss` ou `hide`. Assédio repetido pode receber `delete`. Em caso de dúvida, `dismiss` (caminho da não-violência).

> A moderação é uma **rede de cuidado**, não uma patrulha. Membros sinalizam,
> equipe humana decide, conteúdo fica auditado.

---

## Fluxo (membro)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Membro vê post/comentário problemático                        │
│                                                                  │
│ 2. Toca no ícone de bandeira (FlagButton)                        │
│    Aparece em PostCard (rodapé) e CommentThread (ao lado de      │
│    "Responder"). Discreto, sem cor agressiva.                    │
│                                                                  │
│ 3. FlagModal abre (full-screen mobile, modal no desktop)         │
│    - Escolhe 1 de 4 motivos: SPAM | HARASSMENT | MISINFO | OTHER │
│    - Pode adicionar descrição opcional (até 500 chars)           │
│    - Vê aviso verde: "Sua identidade não será revelada"          │
│                                                                  │
│ 4. Envia. Sistema:                                               │
│    - Cria registro em `flags` (status=PENDING)                   │
│    - Verifica duplicado: se já existe flag aberta do mesmo       │
│      reporter para o mesmo target, devolve a existente (idemp.)  │
│    - Rate limit: 10 flags/dia por usuário                        │
│    - Audit log best-effort                                       │
│                                                                  │
│ 5. Vê confirmação:                                               │
│    "Denúncia registrada. Obrigado por cuidar da comunidade."     │
└──────────────────────────────────────────────────────────────────┘
```

## Fluxo (admin)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Admin acessa /admin/moderation                                │
│    Em dev: ?asAdmin=1&userId=admin-xxx (auth via header)         │
│    Em prod: middleware Supabase + role check                     │
│                                                                  │
│ 2. Vê a fila priorizada (PENDING primeiro, mais antiga no topo) │
│    Abas: Pendentes | Revisadas | Agidas | Arquivadas            │
│    Cada card mostra: motivo, tipo (Post/Comment/User/Group),     │
│    descrição, idade, targetId                                    │
│                                                                  │
│ 3. Decide ação (3 botões, 44px touch):                           │
│    - Arquivar (dismiss) — improcedente                           │
│    - Ocultar (hide) — soft delete (deletedAt=now)                │
│    - Deletar (delete) — soft delete + remove do feed             │
│                                                                  │
│ 4. Sistema:                                                      │
│    - Aplica soft delete no Post/Comment OU isPublic=false no Group│
│    - Marca flag como ACTIONED (ou DISMISSED)                     │
│    - Preenche reviewedAt, reviewerId, actionTaken                │
│    - Audit log com event=FLAG_RESOLVED                           │
│                                                                  │
│ 5. Reporter pode ver status da própria denúncia (futuro:         │
│    /profile/reports) — sem expor quem foi o admin                │
└──────────────────────────────────────────────────────────────────┘
```

## Modelo de dados

```prisma
enum FlagTargetType { POST, COMMENT, USER, GROUP }
enum FlagReason     { SPAM, HARASSMENT, MISINFO, OTHER }
enum FlagStatus     { PENDING, REVIEWED, ACTIONED, DISMISSED }

model Flag {
  id          String         @id @default(cuid())
  targetType  FlagTargetType
  targetId    String
  reporterId  String         // privado — nunca exposto no feed
  reason      FlagReason
  description String?
  status      FlagStatus     @default(PENDING)
  createdAt   DateTime       @default(now())
  reviewedAt  DateTime?
  reviewerId  String?
  actionTaken String?        // 'dismiss' | 'hide' | 'delete'

  @@index([status, createdAt])     // queue
  @@index([reporterId, createdAt])  // "minhas denúncias"
  @@index([targetType, targetId])   // "este post tem N flags"
  @@index([reviewerId, reviewedAt]) // audit
}
```

### Decisões de schema

- **Sem FKs** para `reporterId`/`targetId`. Razão: `User` é gerenciado pelo
  Supabase (id fora desta DB), e flags precisam sobreviver ao soft delete
  do conteúdo (audit trail). Resolução de target é via app query.
- **`reporterId` nunca exposto** no GET `/api/admin/flags`. Audit fica
  no DB mas o card da fila mostra só `targetId` + `description` + idade.
- **`actionTaken` em string livre** (não enum). Permite futuras ações
  sem migration (`warn`, `restrict`, `escalate`, ...) e simplifica o
  log de auditoria.

## Endpoints

### `POST /api/flags` — membro autenticado

```http
POST /api/flags
Content-Type: application/json
Authorization: <user>

{
  "targetType": "POST",
  "targetId": "ckx...",
  "reason": "SPAM",
  "description": "Comentário repetido com link de venda"  // opcional
}
```

**Respostas:**
- `201 { id, status, createdAt, message }` — flag criada
- `200 { id, status, alreadyReported: true, ... }` — duplicado, devolve existente
- `400` — payload inválido
- `401` — não autenticado
- `404` — target não existe (sem distinção de tipo, anti-probing)
- `429` — rate limit (10/dia)

### `GET /api/admin/flags?status=PENDING` — admin

```http
GET /api/admin/flags?status=PENDING&limit=50
x-admin-allow: 1     # dev
x-dev-user-id: ...   # dev
```

**Resposta:**
```json
{
  "data": {
    "flags": [
      {
        "id": "...",
        "targetType": "POST",
        "targetId": "ckx...",
        "reason": "HARASSMENT",
        "description": "Ataque pessoal contra...",
        "status": "PENDING",
        "createdAt": "2026-06-27T...",
        "reviewedAt": null,
        "reviewerId": null,
        "actionTaken": null
      }
    ],
    "counts": { "pending": 3, "reviewed": 1, "actioned": 5, "dismissed": 12, "total": 21 }
  }
}
```

### `POST /api/admin/flags/[id]/action` — admin

```http
POST /api/admin/flags/ckx.../action
Content-Type: application/json
{ "action": "hide", "note": "Ofensa repetida pelo mesmo autor" }
```

**Resposta:** `{ id, status, reviewedAt, actionTaken, contentAffected }`

## Componentes

| Componente | Local | Responsabilidade |
|---|---|---|
| `FlagButton` | `src/components/moderation/FlagButton.tsx` | Botão discreto (ícone ou menu-item). Renderiza modal. |
| `FlagModal` | `src/components/moderation/FlagModal.tsx` | Dialog acessível (ESC, focus trap, ARIA). Sucesso/erro. |
| `/admin/moderation` | `src/app/(admin)/moderation/page.tsx` | Fila priorizada com tabs e ações. |

### `FlagButton` variants

- `icon` (padrão) — botão compacto 44×44px. Aparece no rodapé do `PostCard`.
- `menu-item` — item de menu. Aparece dentro do dropdown "⋮" do `PostCard`.

O `CommentThread` usa a variant `icon` ao lado do botão "Responder".

## Acessibilidade

- **Touch targets ≥ 44×44px** (mobile-first, WCAG AAA)
- **ARIA**: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Foco visível** (ring-amber-500/60) em todos os controles interativos
- **ESC fecha** o modal
- **Focus trap**: primeiro botão recebe foco ao abrir
- **Scroll lock** no body quando modal está aberto
- **Mensagens de erro** com `role="alert"` (leitor de tela)

## Privacidade

- Reporter ID **nunca aparece** no GET do admin (omitido no DTO)
- Reporter ID **fica no DB** só para deduplicação + audit
- Conteúdo deletado é **soft delete** (`deletedAt=now`) — preserva trilha
- `targetId` é o único dado "público" no card do admin (ele já está na URL
  pública do post, então não é vazamento)
- Rate limit (10/dia) evita abuse e probing

## Auditoria

Toda ação passa por `AuditLog`:

```typescript
await prisma.auditLog.create({
  data: {
    actorId: admin.userId,
    targetId: flag.targetId,
    action: 'ADMIN_CONTENT_REMOVE', // ou proxy genérico
    metadata: {
      event: 'FLAG_RESOLVED',
      flagId: flag.id,
      flagReason: 'SPAM',
      targetType: 'POST',
      action: 'hide',
      contentAffected: true,
    },
  },
});
```

Criação de flag também é auditada (best-effort, não bloqueia a request).

## Rate limiting

- **10 flags/dia por usuário** (in-memory, MVP)
- Futuramente: Redis/Upstash + tier por role (mentores têm 20/dia?)

## Soft delete (ação `hide` / `delete`)

| Target | Comportamento |
|---|---|
| `POST` | `posts.deletedAt = now()` — PostCard checa `!post.deletedAt` no feed |
| `COMMENT` | `comments.deletedAt = now()` — CommentThread renderiza placeholder |
| `GROUP` | `groups.isPublic = false` — grupo some da listagem pública |
| `USER` | Não modifica (precisa de fluxo separado `ADMIN_USER_BAN`) |

## Pendências (próximas ondas)

- [ ] **Onda 15**: página `/profile/reports` — usuário vê status das próprias
      denúncias (PENDING / REVIEWED / ACTIONED / DISMISSED) com nota da equipe
- [ ] **Onda 15**: contador agregado no `Post` — "este post tem 3 denúncias"
      para priorização automática na fila
- [ ] **Onda 15**: notificação `NotificationType.MODERATION_ACTION` quando
      flag do usuário é resolvida
- [ ] **Onda 16**: confiança progressiva — 5+ flags em 30 dias de um mesmo
      autor auto-promove o caso para fila prioritária
- [ ] **Onda 16**: campo `User.isModerator` + role-based access control
      (substituir o `x-admin-allow` header em produção)
- [ ] **Onda 17**: análise de sentimento no `description` para clustering
      de flags similares ("5 reports mencionam 'golpe'")

## Princípios para a equipe de moderação

1. **Presuma boa-fé do reporter.** Membros raramente denunciam por maldade.
2. **Contexto > literal.** Um termo forte pode ser citação acadêmica, não ofensa.
3. **Dê peso à história do autor.** Primeiro `hide` é quase sempre educacional.
4. **Dismissa com elegância.** Reporter merece resposta, mesmo que seja "olhamos e está ok".
5. **Documente o raciocínio.** O campo `note` da ação é interno mas fica
   no audit — quem chegar depois entende por que agimos.

---

**Onda:** 14
**Data:** 2026-06-27
**Status:** ✅ Implementado (schema + migration + 3 endpoints + 3 components + 1 page)
**Próxima revisão:** Onda 15 — UX pós-denúncia (status visível para o reporter)
