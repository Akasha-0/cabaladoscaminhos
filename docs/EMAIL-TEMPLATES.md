# ✉️ Email Templates — Notificações Akasha

> **Status:** ✅ Implementado (Onda 3 — `feat/notifications-real`, 2026-06-27)
> **Provider:** Resend (REST API)
> **Render:** HTML table-based + plain text fallback
> **Dev mode:** `console.log` ao invés de enviar

Templates de email para cada tipo de notificação. Estrutura
consistente (header gradient + body + CTA + LGPD footer), LGPD-compliant
(em todo email: preferências, unsubscribe, deletar conta).

---

## 🏗️ Estrutura padrão

Todo email segue o mesmo layout:

```
┌──────────────────────────────────────────────────┐
│  HEADER (gradient amber→violet→pink)             │
│  ✨ Akasha Portal                                │
├──────────────────────────────────────────────────┤
│  TÍTULO (amber-400)                              │
│                                                  │
│  {body do tipo — com nome do ator + excerpt}     │
│                                                  │
│       ┌──────────────────────────┐               │
│       │  CTA — Ver no Akasha →   │               │
│       └──────────────────────────┘               │
│                                                  │
│  Notification ID: <code>...</code>               │
├──────────────────────────────────────────────────┤
│  FOOTER (slate-900)                              │
│  Preferências · Cancelar inscrição · Excluir    │
│  conta (LGPD)                                    │
└──────────────────────────────────────────────────┘
```

**Tokens de LGPD (substituídos antes de enviar):**
- `{{unsubscribeUrl}}` — link one-click para parar de receber este tipo
- `{{preferencesUrl}}` — `/settings/notifications` (granular)
- `{{deleteAccountUrl}}` — `/settings/account#delete`

**Header HTTP:** `List-Unsubscribe: <{{unsubscribeUrl}}>` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058).

---

## 📋 Templates por tipo

### 1. LIKE

- **Subject:** `{actorName} curtiu seu post`
- **Título:** `❤️ Nova curtida`
- **Body:** `{actorName} curtiu seu post: "{excerpt[:200]}"`
- **CTA link:** `/post/{postId}` (ou `payload.link`)
- **Tom:** caloroso, curto.

**Variáveis usadas:**
- `actorSnapshot.displayName` (com fallback "Alguém")
- `payload.excerpt` (primeiros 200 chars do post)

### 2. COMMENT

- **Subject:** `{actorName} comentou no seu post`
- **Título:** `💬 Novo comentário`
- **Body:** `{actorName} comentou: "{excerpt[:200]}"`
- **CTA link:** `/post/{postId}#comment-{commentId}`

### 3. POST_REPLY (resposta a comentário)

- **Subject:** `{actorName} respondeu seu comentário`
- **Título:** `↩️ Nova resposta`
- **Body:** `{actorName} respondeu seu comentário: "{excerpt[:200]}"`
- **CTA link:** `/post/{postId}#comment-{commentId}`

### 4. FOLLOW

- **Subject:** `{actorName} começou a seguir você`
- **Título:** `✨ Novo seguidor`
- **Body:** `{actorName} começou a seguir você no Akasha.`
- **CTA link:** `/u/{actorId}`

### 5. MENTION

- **Subject:** `{actorName} mencionou você`
- **Título:** `📢 Você foi mencionado`
- **Body:** `{actorName} mencionou você em: "{excerpt[:200]}"`
- **CTA link:** `payload.link` ou derivado do entity

### 6. GROUP_INVITE

- **Subject:** `Convite para um grupo`
- **Título:** `🌱 Novo convite`
- **Body:** `{actorName} convidou você para participar de um grupo.`
- **CTA link:** `/groups/{groupId}`

### 7. GROUP_POST

- **Subject:** `Novo post em um grupo que você participa`
- **Título:** `👥 Novo post no grupo`
- **Body:** `{actorName} postou em um grupo que você participa: "{excerpt[:200]}"`
- **CTA link:** `/post/{postId}` (com group badge no UI)

### 8. GROUP_ROLE_CHANGE

- **Subject:** `Mudança de papel no grupo`
- **Título:** `🛡️ Você mudou de papel`
- **Body:** `{actorName} alterou seu papel no grupo.`
- **CTA link:** `/groups/{groupId}#members`

### 9. ARTICLE_RECOMMENDATION

- **Subject:** `Akasha IA: artigo recomendado para você`
- **Título:** `📚 Recomendação da Akasha`
- **Body:** `Descobrimos um artigo que pode ressoar com sua jornada: "{excerpt[:200]}"`
- **CTA link:** `/library/{articleId}`

### 10. ARTICLE_PUBLISHED

- **Subject:** `{actorName} publicou um artigo`
- **Título:** `📖 Novo artigo`
- **Body:** `{actorName} publicou um novo artigo: "{excerpt[:200]}"`
- **CTA link:** `/library/{articleId}`

### 11. SYSTEM_ALERT

- **Subject:** `Akasha — Alerta do sistema`
- **Título:** `⚠️ Alerta`
- **Body:** `{excerpt}` (texto livre, sem actor)
- **CTA link:** configurável
- **Importante:** ignora preferências (sempre enviado)

### 12. MODERATION_ACTION

- **Subject:** `Akasha — Ação de moderação`
- **Título:** `🛡️ Moderação`
- **Body:** `{excerpt}` (ex: "Seu post foi removido por violar X")
- **Importante:** ignora preferências

### 13. DIGEST_WEEKLY

- **Subject:** `Seu resumo semanal Akasha`
- **Título:** `✨ Resumo da semana`
- **Body:** `excerpt` (até 1000 chars, agregado)
- **CTA link:** `/notifications?filter=unread`

---

## 🛡️ Segurança & LGPD

### Escape

Todos os dados interpolados passam por `escapeHtml()` antes de
entrar no HTML. O excerpt é truncado em 200 chars (digest: 1000).

```ts
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### Headers de email

```http
List-Unsubscribe: <https://akasha.app/api/notifications/unsubscribe?token=...>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Unsubscribe (LGPD-friendly)

**Fluxo:**
1. Usuário clica "Cancelar inscrição deste tipo" no email
2. Abre `/api/notifications/unsubscribe?token=...` (GET)
3. Valida token (não expirado, não usado)
4. Redireciona pra `/settings/notifications?unsub=confirm&type=X`
5. Usuário confirma → POST `/api/notifications/unsubscribe` com `{token, scope: 'type'}`
6. Marca token como usado, atualiza `NotificationPreference.email = false`

**Scopes:**
- `scope: 'type'` — desabilita só o tipo
- `scope: 'all'` — desabilita todos os emails

---

## 🎨 Branding

| Elemento | Cor | Hex |
|---|---|---|
| Background | deep indigo | `#0a0a1a` |
| Card | dark violet | `#1e1b3a` |
| Border | violet-900 | `#312e81` |
| Title (CTA) | amber-400 | `#fbbf24` |
| Body | slate-300 | `#cbd5e1` |
| Footer bg | slate-900 | `#0f172a` |
| Footer text | slate-400 | `#94a3b8` |
| Gradient | amber→violet→pink | `#f59e0b → #a855f7 → #ec4899` |

---

## 📝 Como adicionar um novo template

1. **Adicionar tipo no enum Prisma:** `prisma/community.prisma` → enum `NotificationType`.
2. **Adicionar case em `renderByType()`:** `src/lib/notifications/email.ts`.
3. **Adicionar default em `DEFAULT_PREFERENCES`:** `src/lib/notifications/preferences.ts`.
4. **Atualizar teste em `__tests__/email-templates.test.ts`**.
5. **Atualizar este doc** com subject/título/body.
6. **Atualizar `NotificationBell` e `/notifications` page** se o tipo tiver ícone/cor próprios.

---

## 🧪 Como testar

### Dev (sem Resend)

Configure `NODE_ENV=development` (ou deixe unset). Os emails são
logados no console com shape:

```json
{
  "to": "user@example.com",
  "subject": "João curtiu seu post",
  "notificationId": "n1",
  "type": "LIKE"
}
```

### Prod (com Resend)

```bash
export RESEND_API_KEY=re_xxx
export NOTIFICATION_EMAIL_FROM="Akasha <no-reply@akasha.app>"
export NODE_ENV=production
```

### Teste automatizado

```bash
pnpm test __tests__/email-templates.test.ts
```

Cobre:
- Render de cada tipo
- Escape de HTML perigoso
- Placeholders LGPD presentes
- Truncamento de excerpts
- Dev fallback (não chama Resend)

---

## 🔗 Referências

- [NOTIFICATIONS-SPEC.md](./NOTIFICATIONS-SPEC.md) — Arquitetura geral.
- [Resend API docs](https://resend.com/docs/api-reference/emails/send-email)
- [RFC 8058 — One-Click List-Unsubscribe Header](https://datatracker.ietf.org/doc/html/rfc8058)
- [LGPD — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
