---
title: Convite & Integração de Curadores (Wave 35)
wave: 35
date: 2026-07-01
owners:
  - role: Iyá (Curadora-chefe)
    responsibility: "Aprovação final, revisão cruzada, vetos editoriais"
  - role: Coordinator (Wave Orchestrator)
    responsibility: "Spawn de workers, audit, gate-by-gate"
curators_convidados:
  - tradição: Cabala
    foco: "Árvore da Vida, Sefirot, Tarot cabalístico, mística judaica"
    slug: cabala
  - tradição: Ifá
    foco: "Odu Ifá, Ori, Ifá tradicional iorubá, linhagem ketu/nagô"
    slug: ifa
  - tradição: Tantra / Astrologia
    foco: "Tantra não-dual, astrologia védica + ocidental, cosmologias integradas"
    slug: tantra | astrologia
lgpd_artigos:
  - "Art. 7º, I — consentimento explícito no aceite do convite"
  - "Art. 18 — direitos do titular (acesso, correção, exclusão, revogação)"
  - "Art. 37 — registro de operações de tratamento (audit log)"
universalismo_principles:
  - "Nenhuma tradição é superior; curadores representam com igualdade"
  - "Cross-revisão apenas com canReviewOtherTraditions=true (default false)"
  - "Iyá tem poder de veto + última palavra em conflito de revisão"
estado: entregue (commit local, sem push)
---

# Convite & Integração de Curadores — Wave 35

> Onda 35 — 2026-07-01. Worker Coordinator + Iyá (Curator).
> **Escopo:** preparar a esteira técnica para a decisão estratégica D2 (3 curadores convidados).

---

## Sumário

1. [Motivação Estratégica](#1-motivação-estratégica)
2. [Decisão D2 — Estado Atual](#2-decisão-d2--estado-atual)
3. [Arquitetura: Subtree de Curadores](#3-arquitetura-subtree-de-curadores)
4. [Modelo de Dados — Schema Consolidado](#4-modelo-de-dados--schema-consolidado)
5. [Enum UserRole — Hierarquia Completa](#5-enum-userrole--hierarquia-completa)
6. [Enum CuratorRole — Papéis Específicos](#6-enum-curatorrole--papéis-específicos)
7. [Tradições Cobertas — Catálogo Inicial](#7-tradições-cobertas--catálogo-inicial)
8. [3 Perfis de Curador Convidado](#8-3-perfis-de-curador-convidado)
9. [Matriz de Permissões](#9-matriz-de-permissões)
10. [Workflow de Aprovação (Onboarding)](#10-workflow-de-aprovação-onboarding)
11. [API Endpoints — Inventário Completo](#11-api-endpoints--inventário-completo)
12. [POST /api/admin/curators/invite — Spec](#12-post-apiadmincuratorsinvite--spec)
13. [GET /api/admin/curators — Spec](#13-get-apiadmincurators--spec)
14. [PATCH/DELETE /api/admin/curators/[id] — Spec](#14-patchdelete-apiadmincuratorsid--spec)
15. [POST /api/curators/[tradition]/approve-article — Spec](#15-post-apicuratorstraditionapprove-article--spec)
16. [Email Template — curator-invite.ts](#16-email-template--curator-invitets)
17. [Pages — Admin e Workspace](#17-pages--admin-e-workspace)
18. [Audit Log — Eventos de Curador](#18-audit-log--eventos-de-curador)
19. [LGPD — Operações de Tratamento](#19-lgpd--operações-de-tratamento)
20. [Universalismo — Guard-rails Editoriais](#20-universalismo--guard-rails-editoriais)
21. [Migração de Banco — Plano](#21-migração-de-banco--plano)
22. [Onboarding do Curador — Runbook](#22-onboarding-do-curador--runbook)
23. [Riscos & Mitigações](#23-riscos--mitigações)
24. [Testes Manuais — Checklist](#24-testes-manuais--checklist)
25. [Métricas de Sucesso (30/60/90d)](#25-métricas-de-sucesso-306090d)
26. [Próximas Ondas — Roadmap Curador](#26-próximas-ondas--roadmap-curador)
27. [Decisões em Aberto (Owner)](#27-decisões-em-aberto-owner)
28. [Apêndice — Snippets Úteis](#28-apêndice--snippets-úteis)
29. [Apêndice — Glossário de Termos Sagrados](#29-apêndice--glossário-de-termos-sagrados)
30. [Referências & Cross-links](#30-referências--cross-links)

---

## 1. Motivação Estratégica

A **Biblioteca Akasha** é o coração educativo do portal Cabala dos Caminhos. Desde Wave 29, a curadoria de artigos opera com:

- **Iyá (curadora-chefe)** como raiz: revisão final, vetos, padrão editorial.
- **Akasha IA** como assistente de pré-triagem (filtros de evidência, alinhamento linguístico, anti-proselitismo).
- **Comunidade** como contribuidora: submissão + flags.

A dependência em uma única pessoa (Iyá) é o gargalo de escala: backlog cresce, tempo médio de aprovação sobe, e a curadoria fica refém de disponibilidade humana. **Wave 35 resolve isso** criando o subtree de curadores convidados.

## 2. Decisão D2 — Estado Atual

> **Status:** D2 pendente, owner silente há 7h+ (cycle 106 HOLD); código preparado.

A decisão D2 ("quem convidar, em que ordem, com quais critérios") é **estratégica**. O trabalho entregue aqui é **preparação de infraestrutura**: schema, APIs, email, dashboard. **Não envia convite sem aprovação.**

Quando o owner retomar:

1. Revisa este doc + [W29-8 Curator Quality](#30-referências--cross-links).
2. Aprova os 3 perfis de curador (seção 8) ou ajusta.
3. Dispara `POST /api/admin/curators/invite` × 3 — email sai automaticamente.

## 3. Arquitetura: Subtree de Curadores

```
        ADMIN_EMAILS (env)
              ↓
        ┌─────────────┐
        │    ADMIN    │ (escape hatch operacional)
        └─────────────┘
              ↓
        ┌─────────────┐         ┌────────────────────────────┐
        │     Iyá     │←────────│  CuratorProfile.curatorRole│
        │ (curadora-  │         │      = IYA                 │
        │   chefe)    │         └────────────────────────────┘
        └─────────────┘
              ↓ convida
   ┌──────────┬───────────┬─────────────┐
   ↓          ↓           ↓             ↓
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│Cabala  │ │  Ifá   │ │ Tantra   │ │Astrologia│
│ C_*    │ │ C_IFA  │ │ C_TANTRA │ │ C_ASTRO  │
└────────┘ └────────┘ └──────────┘ └──────────┘
   ╲           ╲            ╲             ╱
    ╲           ╲            ╲           ╱
     ╲           ╲     ┌────────────┐   ╱
      ╲           ╲    │GUEST_CURATOR│  ╱
       ╲           ╲   │  (temporário)│ ╱
        ╲           ╲  └────────────┘  ╱
         ╲           ╲                ╱
          ↓           ↓              ↓
      CuratorProfile.tradition
      (slug canônico: cabala/ifa/tantra/...)
```

## 4. Modelo de Dados — Schema Consolidado

Adicionado em `prisma/schema.prisma`:

```prisma
enum UserRole            { USER | ADMIN | IYA | CURATOR | GUEST_CURATOR }
enum CuratorRole         { IYA | CURATOR_CABALA | CURATOR_IFA | CURATOR_TANTRA | CURATOR_ASTROLOGIA | GUEST_CURATOR }
enum CuratorInvitationStatus { PENDING | ACCEPTED | DECLINED | EXPIRED | REVOKED }

model User {
  // ... campos existentes
  role          UserRole        @default(USER)   // NEW (W35)
  curatorProfile CuratorProfile?                   // NEW (W35)
  @@index([role])                                  // NEW
}

model CuratorProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  tradition     String                              // slug canônico
  curatorRole   CuratorRole @default(GUEST_CURATOR)
  bio           String?  @db.Text
  credentials   String?  @db.Text                  // LGPD: opt-in
  approvedBy    String?
  approvedAt    DateTime?
  active        Boolean  @default(true)
  deactivatedReason String?
  permissions   Json     @default("{}")
  guestExpiresAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  invitations   CuratorInvitation[]
  @@index([tradition, active])
  @@index([curatorRole, active])
  @@map("curator_profiles")
}

model CuratorInvitation {
  id              String   @id @default(cuid())
  profileId       String?
  email           String
  displayName     String
  tradition       String
  curatorRole     CuratorRole @default(GUEST_CURATOR)
  acceptToken     String   @unique                 // HMAC, single-use
  status          CuratorInvitationStatus @default(PENDING)
  invitedById     String
  invitedByName   String
  personalMessage String?  @db.Text
  expiresAt       DateTime
  acceptedAt      DateTime?
  declinedAt      DateTime?
  revokedAt       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([email])
  @@index([status, expiresAt])
  @@index([tradition, status])
  @@map("curator_invitations")
}
```

## 5. Enum UserRole — Hierarquia Completa

| Valor | Descrição | Como vira |
|-------|-----------|-----------|
| `USER` | Membro regular da comunidade | Default em novos signups |
| `ADMIN` | Admin operacional | `ADMIN_EMAILS` env ou `planoAssinatura='ADMIN'` |
| `IYA` | Curadora-chefe (raiz do subtree Curator) | `IYA_EMAIL` env (escape hatch) **ou** `User.role=IYA` definido por outro Iyá |
| `CURATOR` | Curador convidado ativo (qualquer tradição) | Aceitou convite + ativado |
| `GUEST_CURATOR` | Curador temporário com prazo | `guestExpiresAt < now()` ⇒ cai para revisão |

**Resolução de role** em `lib/curators/service.ts > resolveUserRole()`:

```
ADMIN_EMAILS ∋ email          → ADMIN (defense-in-depth)
IYA_EMAIL = email             → IYA
User.role (DB)                → IYA | CURATOR | GUEST_CURATOR | USER
planoAssinatura = 'ADMIN'     → ADMIN (escape hatch)
```

## 6. Enum CuratorRole — Papéis Específicos

| Valor | Quem recebe | Permissões default | Quem pode atribuir |
|-------|-------------|---------------------|---------------------|
| `IYA` | Curadora-chefe | canApprove✓, canCurate✓, canModerate✓, canInviteCurators✓, canReviewOtherTraditions✓ | Apenas outra Iyá |
| `CURATOR_CABALA` | Convidado Cabala | canApprove✓, canCurate✓, canModerate✓, rest false | Iyá |
| `CURATOR_IFA` | Convidado Ifá | mesma de Cabala | Iyá |
| `CURATOR_TANTRA` | Convidado Tantra | mesma | Iyá |
| `CURATOR_ASTROLOGIA` | Convidado Astrologia | mesma | Iyá |
| `GUEST_CURATOR` | Especialista temporário | canApprove✓ apenas (1 tradition, prazo) | Iyá / Admin |

## 7. Tradições Cobertas — Catálogo Inicial

Slugs canônicos usados em `CuratorProfile.tradition` (string, não enum — facilita onboarding de novas tradições sem migration):

| Slug | Label PT-BR | Status atual |
|------|-------------|--------------|
| `cabala` | Cabala | 🟡 Curador a convidar |
| `ifa` | Ifá | 🟡 Curador a convidar |
| `tantra` | Tantra | 🟡 Curador a convidar |
| `astrologia` | Astrologia | 🟡 Combinada com Tantra (decisão D2) |
| `xamanismo` | Xamanismo | 🔴 Sem curador (fase 2) |
| `umbanda` | Umbanda | 🔴 Sem curador |
| `candomble` | Candomblé | 🔴 Sem curador |
| `reiki` | Reiki | 🔴 Sem curador |
| `ayurveda` | Ayurveda | 🔴 Sem curador |

## 8. 3 Perfis de Curador Convidado

### 8.1 Curador(a) Cabala

- **Slug:** `cabala`
- **Papel CuratorRole:** `CURATOR_CABALA`
- **Foco editorial:** Árvore da Vida (Sefirot), Tarot cabalístico, mística judaica, meditação Merkabah, simbolismo hermético.
- **Linhagem desejável:** formação em escola cabalística reconhecida (Pirchei Shoshanim, Bnei Baruch, etc.) **ou** publicação autoral revisada por pares.
- **Universo de revisão:** artigos da tradição Cabala + cross-revisão opcional (com permissão).
- **Email placeholder:** `curador.cabala@cabaladoscaminhos.app` (substituir pelo real antes de convidar).

### 8.2 Curador(a) Ifá

- **Slug:** `ifa`
- **Papel CuratorRole:** `CURATOR_IFA`
- **Foco editorial:** Odu Ifá (256 odus), sistema Orí, liturgia Ketu/Nagô, Ifá tradicional iorubá (vs. Ifá "popular" ocidental).
- **Linhagem desejável:** formação com Babalorixá/Yalorixá de terreiro reconhecido, **ou** publicação na área (língua iorubá é diferencial).
- **Universo de revisão:** artigos Ifá + cross-revisão Candomblé/Umbanda (tradições-irmãs) — essa permissão fica off por default, ligar depois.
- **Cuidado editorial:** não permitir simplificações que essencializem Ifá como "cartomancia genérica"; preservar o Òrìṣà como categoria teológica, não decorativa.

### 8.3 Curador(a) Tantra / Astrologia

- **Slug:** `tantra` (principal) + `astrologia` (sub-foco)
- **Papel CuratorRole:** `CURATOR_TANTRA` (decisão D2: dois papéis ou um combinado)
- **Foco editorial:** Tantra não-dual (Kashmiri Shaivismo, Trika), tantra budista (Vajrayana), astrologia védica (Jyotish) e ocidental (psicológica/humanista).
- **Linhagem desejável:** linhagem reconhecível em uma das tradições + fluência crítica para distinguir abordagem devocional de abordagem esotérica.
- **Cuidado editorial:** Tantra **não é sexualidade tântrica popular**; curador deve coibir essa confusão editorial.

> **Decisão D2 (owner):** "Tantra/Astrologia" = 1 curador com curatorRole CURATOR_TANTRA + canReviewOtherTraditions=true, ou 2 curadores separados? Tradeoff: menos gente na curadoria vs. especialização. Recomendação do agente: 2 curadores, `CURATOR_TANTRA` e `CURATOR_ASTROLOGIA` separados, cross-revisão opcional.

## 9. Matriz de Permissões

`CuratorProfile.permissions` é um JSON armazenado:

```jsonc
{
  "canApproveContent":       true,   // decidir approve/reject de artigos
  "canCurateLibrary":        true,   // propor/editar metadados, tags, evidências
  "canModeratePosts":        true,   // agir em posts sinalizados da tradição
  "canInviteCurators":       false,  // emitir novos convites (Iyá-only)
  "canReviewOtherTraditions": false  // revisar conteúdo de tradição que não é a sua
}
```

Defaults por `CuratorRole` (em `service.ts > defaultPermissionsFor`):

| Papel | canApprove | canCurate | canModerate | canInvite | canReviewOther |
|-------|:----------:|:---------:|:-----------:|:---------:|:--------------:|
| IYA | ✓ | ✓ | ✓ | ✓ | ✓ |
| CURATOR_* | ✓ | ✓ | ✓ | ✗ | ✗ |
| GUEST_CURATOR | ✓ | ✗ | ✗ | ✗ | ✗ |

## 10. Workflow de Aprovação (Onboarding)

```
 Owner decide D2
      ↓
 Admin/Iyá: POST /api/admin/curators/invite
      ├── generateInviteToken() (HMAC, 24B random + 22B sig)
      ├── INSERT CuratorInvitation (PENDING, expiresAt = now + 14d)
      ├── logAudit CURATOR_INVITED
      └── sendTransactionalEmail(templateId='curator-invite')
      ↓
 Email entregue ao convidado(a)
      ↓ (no mesmo browser, via /curator/convite/[token])
 Convidado(a) cria conta (se primeira vez) ou loga
      ↓
 Server: valida token + cria/atualiza CuratorProfile
      ├── INSERT/UPDATE User (set role=CURATOR)
      ├── INSERT/UPDATE CuratorProfile (curatorRole, permissions default)
      ├── UPDATE CuratorInvitation (status=ACCEPTED, acceptedAt)
      └── logAudit CURATOR_INVITE_ACCEPTED
      ↓
 Curador(a) entra em /curator/[tradition]
 (workspace com fila + posts sinalizados + ações)
```

### Janela de expiração

- **14 dias** desde o envio (configurável via `CURATOR_INVITE_TTL_DAYS`).
- Convite expirado vira `status=EXPIRED` no próximo cron `processExpiredInvitations` (a ser criado em W36, item de roadmap).
- Admin/Iyá pode revogar manualmente via `DELETE /api/admin/curators/[id]` que atualiza convites `PENDING` para `REVOKED`.

## 11. API Endpoints — Inventário Completo

| Método | Rota | Auth | Função |
|--------|------|------|--------|
| POST | `/api/admin/curators/invite` | Admin/Iyá | Emitir convite + email |
| GET | `/api/admin/curators` | Admin/Iyá | Listar curadores + convites pendentes |
| PATCH | `/api/admin/curators/[id]` | Admin/Iyá | Atualizar permissions, active, role |
| DELETE | `/api/admin/curators/[id]` | Admin/Iyá | Desativar (soft) + revogar convites |
| POST | `/api/curators/[tradition]/approve-article` | Curador (canApproveContent) | Aprovar/rejeitar artigo da tradição |

## 12. POST /api/admin/curators/invite — Spec

**Request:**
```json
{
  "email": "curador@exemplo.com",
  "displayName": "Mestra Fátima",
  "tradition": "ifa",
  "curatorRole": "CURATOR_IFA",
  "personalMessage": "Vimos sua liderança..."
}
```

**Response 200:**
```json
{
  "data": {
    "invitationId": "cm...",
    "acceptUrl": "https://.../curator/convite/cinv_xxx_yyy",
    "expiresAt": "2026-07-15T03:57:00.000Z",
    "tradition": "ifa",
    "traditionLabel": "Ifá",
    "curatorRole": "CURATOR_IFA",
    "emailSent": true,
    "emailError": null,
    "defaultPermissions": {
      "canApproveContent": true,
      "canCurateLibrary": true,
      "canModeratePosts": true,
      "canInviteCurators": false,
      "canReviewOtherTraditions": false
    }
  },
  "meta": { ... }
}
```

**Status:**
- 200 — convite criado + email disparado (best-effort)
- 400 — payload inválido (zod)
- 403 — sem permissão (não admin/Iyá)
- 409 — já existe convite `PENDING` ativo para esse email

**Auditoria:** grava `CURATOR_INVITED` com metadata `{ tradition, curatorRole, inviteeEmail, acceptUrl }`.

## 13. GET /api/admin/curators — Spec

**Query params:**
- `active` — `true|false` (default `true`)
- `tradition` — slug canônico opcional

**Response:**
```json
{
  "data": {
    "curators": [
      {
        "id": "cm...",
        "userId": "cm...",
        "email": "...",
        "displayName": "Mestra Fátima",
        "tradition": "ifa",
        "traditionLabel": "Ifá",
        "curatorRole": "CURATOR_IFA",
        "active": true,
        "approvedAt": "2026-06-28T...",
        "approvedBy": "...",
        "approvedByName": "Iyá Akasha",
        "stats": { "articlesApproved": 12, "postsModerated": 3, "npsReceived": 5 },
        "createdAt": "2026-06-28T..."
      }
    ],
    "invitations": [
      {
        "id": "cm...",
        "email": "convite@novo.com",
        "displayName": "Novo Curador",
        "tradition": "cabala",
        "traditionLabel": "Cabala",
        "curatorRole": "CURATOR_CABALA",
        "invitedByName": "Iyá Akasha",
        "status": "PENDING",
        "expiresAt": "2026-07-15T...",
        "createdAt": "2026-07-01T..."
      }
    ],
    "totals": {
      "active": 1, "inactive": 0,
      "invitedByStatus": { "PENDING": 1, "ACCEPTED": 1, "REVOKED": 0 },
      "activeByStatus":  { "true": 1, "false": 0 }
    }
  },
  "meta": { ... }
}
```

## 14. PATCH/DELETE /api/admin/curators/[id] — Spec

### PATCH

**Body (todos opcionais):**
```json
{
  "active": true,
  "curatorRole": "CURATOR_CABALA",
  "permissions": { "canApproveContent": true, "canModeratePosts": false },
  "bio": "...",
  "credentials": "...",
  "guestExpiresAt": "2026-09-01T00:00:00.000Z",
  "deactivatedReason": "fim de temporada como guest"
}
```

**Regras:**
- Apenas Iyá pode promover alguém a `IYA` (autorização verificada em runtime).
- `permissions` é **mesclado** com o JSON atual (não sobrescrito inteiro).
- Se `active=false`, registra `CURATOR_DEACTIVATED` (com motivo); se outra edição, `CURATOR_PROFILE_UPDATED`.

### DELETE

**Sem body.** Requer role admin/Iyá.

**Ações:**
- `active=false` (soft)
- `deactivatedReason = ?reason=...` (query string, default "Desativado por admin")
- Convites PENDING do mesmo email viram `REVOKED`
- Log: `CURATOR_DEACTIVATED`

**Bloqueio:** não permite desativar Iyá (`curatorRole='IYA'`).

## 15. POST /api/curators/[tradition]/approve-article — Spec

**Auth:** sessão Supabase + `resolveCurator(tradition)` + `canApproveContent=true`.

**Body:**
```json
{
  "articleId": "cm...",
  "decision": "approve",        // | "reject"
  "reason": "opcional"          // obrigatório (>=10 chars) em reject
}
```

**Validações:**
- Artigo existe.
- `article.tradition === path.tradition` (cross-tradição → 403 salvo `canReviewOtherTraditions=true`).
- Em reject sem reason ≥10 chars → 400 zod.

**Side effects:**
- `Article.publishedAt` = now (approve) ou null (reject).
- `Article.curatedBy` = curator userId.
- AuditLog: `ARTICLE_APPROVED` | `ARTICLE_REJECTED` com `{ tradition, curatorRole, articleTitle, reason? }`.

## 16. Email Template — `curator-invite.ts`

Arquivo: `src/lib/email/templates/curator-invite.ts`.

**Id:** `curator-invite` (registrado em `templates/index.ts`).

**Tom:**
- Saudação pessoal (`Olá, ${displayName}`)
- Cerimonioso-sem-rigidez (mostra responsabilidade sem pressionar)
- CTA único: **"Aceitar convite e conhecer o contrato"**
- Janela de 14 dias visível

**Blocos:**
1. Boas-vindas (quem convida, de qual papel)
2. Lista de responsabilidades (4 itens: revisar artigos, moderar posts, zelo editorial, LGPD)
3. Mensagem pessoal (se enviada) — caixa destacada roxa
4. O que recebe (workspace, poderes, visibilidade, encontros mensais)
5. CTA
6. Footer LGPD (Art. 7º, I — aceite registrado em log)

**Subject:** `✶ Convite formal: curador(a) de {tradição} · Biblioteca Akasha`

## 17. Pages — Admin e Workspace

### `/admin/curators` (server)

- 3 tabelas: convites pendentes, curadores ativos, histórico de desativados.
- Stats 30d inline (artigos aprovados, moderações, NPS recebido).
- Painel "Novo convite" com snippet curl pronto.

### `/curator/[tradition]` (server + client island)

- Header com saudação ao curador + warning se cross-tradição.
- 3 stat cards: artigos pendentes, aprovados 30d, posts sinalizados.
- Lista de artigos (`ArticleActions.tsx` — client island para approve/reject com input de reason).
- Lista de posts sinalizados (apenas leitura — moderar abre no `/admin/flags`).
- Sem login → mensagem convidando a logar; sem permissão → mensagem explicando o motivo.

**Filtros via search params:** `status=approved|rejected|draft`, `priority=high|normal`.

## 18. Audit Log — Eventos de Curador

Estendidos em `AuditAction`:

| Evento | Quando | Metadata principal |
|--------|--------|---------------------|
| `CURATOR_INVITED` | POST `/invite` | `{ tradition, curatorRole, inviteeEmail, acceptUrl }` |
| `CURATOR_INVITE_ACCEPTED` | Aceite (a implementar W36) | `{ profileId, tradition, curatorRole }` |
| `CURATOR_INVITE_DECLINED` | Recusa explícita | `{ profileId, reason? }` |
| `CURATOR_INVITE_EXPIRED` | Cron de expiração | `{ invitationId, daysLate }` |
| `CURATOR_INVITE_REVOKED` | DELETE cascade | `{ invitationId, reason }` |
| `CURATOR_PROFILE_UPDATED` | PATCH | `{ before, after }` |
| `CURATOR_DEACTIVATED` | PATCH/DELETE c/ active=false | `{ deactivatedReason, userId }` |
| `ARTICLE_APPROVED` | approve-article | `{ tradition, curatorRole, articleTitle }` |
| `ARTICLE_REJECTED` | approve-article | `{ tradition, curatorRole, articleTitle, reason }` |
| `POST_MODERATED_BY_CURATOR` | flag cross-curador (W36) | `{ postId, tradition, decision }` |

## 19. LGPD — Operações de Tratamento

| Dado | Base legal (Art. 7º) | Retenção | Observação |
|------|---------------------|----------|------------|
| Email + displayName do convidado | Consentimento (I) | Até revoke ou 24 meses após último acesso | Necessário para aceite |
| Bio + credentials | Consentimento (I) — opt-in | Até revoke | Curador decide compartilhar ou não |
| Logs de auditoria | Legítimo interesse + obrigação legal (Art. 37) | 5 anos (regime padrão de log) | IP armazenado como `ipHash` (SHA256 salted) |
| Stats operacionais (artigos aprovados, NPS, moderações) | Legítimo interesse | 24 meses | Denormalizado no read |

**Direitos do titular (Art. 18):**
- Acesso: GET com o próprio userId retorna todas as curator profiles + invitations.
- Correção: PATCH `/admin/curators/[id]` é o canal operacional.
- Exclusão: DELETE `/admin/curators/[id]` (soft) + cron de purge após 6 meses.
- Revogação de consent: email para `privacidade@cabaladoscaminhos.app` dispara `DELETE`.

## 20. Universalismo — Guard-rails Editoriais

> "Nenhuma tradição é superior; curadores representam com igualdade."

Implementações concretas:

1. **Cross-tradição opt-in:** `canReviewOtherTraditions=false` por default. Curador convidado **só** revê a própria tradição; cross é upgrade explícito pela Iyá.
2. **Slug canônico neutro:** nomes como `ifa` (não "Ifá Yorubá" — evita hierarquia).
3. **Audit visual:** página `/curator/[tradition]` mostra aviso se a revisão for cross-tradição (audit trail transparente).
4. **Veto Iyá:** última palavra em conflito. Implementar botão "Iyá override" em W36.
5. **Sem proselitismo:** template de email e copy de UI mencionam "respeitoso" e "sem proselitismo"; validação futura por Akasha IA em pré-triagem (W36).

## 21. Migração de Banco — Plano

```bash
# Rodar após merge
npx prisma migrate dev --name w35_curator_system
npx prisma generate
```

**Caveats:**
- Coluna `User.role` é nova e nullable=False com default `USER`. Não precisa backfill.
- Migration deve rodar **antes** de qualquer `POST /api/admin/curators/invite` em prod (constraint falharia).
- Em dev/sandbox: rodar `npx prisma db push` (não-migration).

**Rollback:** migration `down` mantém as tabelas e remove apenas colunas; FKs em cascata são preservadas.

## 22. Onboarding do Curador — Runbook

### T-0: convite emitido

```bash
curl -X POST https://cabaladoscaminhos.app/api/admin/curators/invite \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <admin session>' \
  -d '{
    "email":"<email>",
    "displayName":"<nome>",
    "tradition":"<slug>",
    "curatorRole":"CURATOR_<TRADICAO>",
    "personalMessage":"<msg opcional>"
  }'
```

### T-1: convidado(a) recebe email

- Verificar entrega: `/admin/curators` mostra convite PENDING.
- Revogar se enviado errado: remover via SQL (`UPDATE CuratorInvitation SET status='REVOKED'`) **+** W36 implementa DELETE /api/admin/curators/invitations/[id].

### T-2: aceite via `/curator/convite/[token]`

**Não implementado em W35** (escopo era infraestrutura). W36 ship:

```typescript
// src/app/curator/convite/[token]/page.tsx
//   - valida token (verifyInviteToken)
//   - check expiresAt < now
//   - mostra contract UI
//   - POST /api/curators/accept-invite/ [token]
```

### T-3: primeiro dia do curador

- Login em `/curator/[tradition]`
- Fila de artigos pendentes aparece
- Posts sinalizados aparecem em painel lateral
- "Encontro mensal Iyá + curadores" convites em W36

## 23. Riscos & Mitigações

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Convidado(a) nunca aceita | Média | Cron `processExpiredInvitations` (W36) marca EXPIRED; owner pode reemitir |
| Email vai para spam | Média | SPF/DKIM/DMARC já configurados (W33 newsletter); usar domínio verificado |
| Curador abusa de poder (aprova conteúdo problemático) | Média | Iyá/Admin pode desativar via DELETE; audit log detecta padrão |
| Token HMAC vazado antes do aceite | Baixa | Sig de 22 chars (≈128 bits effective); single-use via `acceptToken` UNIQUE |
| Iyá acumula muitos curadores e vira gargalo de novo | Baixa | Métricas de SLA (aprovação < 7d); convite de GUEST_CURATOR adicional é 1 endpoint |
| LGPD: credentials são PII | Média | Marcar `credentials` como opt-in explícito no contract UI (W36) |
| Conflito entre curadores (mesmo artigo, decisões diferentes) | Baixa | Última palavra fica com Iyá; padrão atual é "primeira decisão vale" |

## 24. Testes Manuais — Checklist

### Smoke test (rodar antes de merge)

- [ ] `pnpm typecheck` passa (sem erro de schema, sem `Prisma.*` sem export).
- [ ] `pnpm test:unit` (vitest) roda sem regressão.
- [ ] `prisma migrate dev` em sandbox executa limpo.
- [ ] `prisma generate` atualiza client.
- [ ] Página `/admin/curators` renderiza (cache vazio: mostra "nenhum convite").
- [ ] Página `/curator/cabala` sem login mostra prompt.
- [ ] Página `/curator/cabala` com login sem role mostra motivo.

### Integração (manual, post-merge)

- [ ] `POST /api/admin/curators/invite` × 3 emite 3 emails (verificar Inbox do Mailtrap/dev).
- [ ] `GET /api/admin/curators` lista os 3 PENDING.
- [ ] Token gerado tem formato `cinv_<random>_<sig>`.
- [ ] PATCH em um convite com `active:false` move de "ativos" para "inativos".
- [ ] DELETE em convite existente marca `status=REVOKED` em CuratorInvitation.

### E2E (futuro W36+)

- [ ] Fluxo completo: aceitar convite → workspace visível → aprovar artigo → audit log gravado.
- [ ] Cross-tradição: curador cabala acessa `/curator/ifa` → 403 (default), mas com `canReviewOtherTraditions=true` → aprova normalmente.

## 25. Métricas de Sucesso (30/60/90d)

| Janela | KPI | Meta |
|--------|-----|------|
| 30d | Curadores ativos | ≥ 3 (D2: Cabala, Ifá, Tantra/Astrologia) |
| 30d | Taxa de aceite de convite | ≥ 66% (≥2/3) |
| 30d | Tempo médio de aprovação de artigo | ≤ 7d (baseline pré-W35 era ~21d) |
| 60d | Engagement Akasha IA (sentimento nas reviews) | ≥ 4.2/5 |
| 90d | NPS recebido por curador(a) | ≥ 50 |
| 90d | Cross-revisões (artigos revisados por curador de outra tradição) | ≥ 5% |

Painel de acompanhamento: `/admin/insights/curators` (a criar em W36).

## 26. Próximas Ondas — Roadmap Curador

### W36 — Accept + Revoke + Cron

- `POST /api/curators/accept-invite/[token]` — finalizar contrato e ativar perfil.
- `POST /api/admin/curators/invitations/[id]/revoke` — revogar convite individual.
- `cron: processExpiredInvitations` — marca EXPIRED automaticamente.
- `/admin/insights/curators` — métricas operacionais (acceptance rate, SLA).
- Akasha IA pré-triagem (`POST /api/articles/pre-check` com `reviewedByCurator` flag).

### W37 — Iyá override + Veto

- `POST /api/admin/curators/iyá-override` — última palavra.
- Componentes: badge "Iyá aprovou" + audit trail.
- Slack/Discord opcional de notificação de decisão.

### W38 — Curador Público + Community

- Página pública `/[tradition]` lista curadores ativos (opt-in via `publicProfile` boolean).
- Comunidade pode "elogiar" curador (NPS dedicado).
- Recompensa simbólica: "Anel de curador(a)" visual.

### W39+ — IA co-curadoria

- Akasha IA vira "co-curador" com suggestion layer.
- Curador humano revê 100% das decisões da IA até W42; depois auto-aprovação para baixo risco.

## 27. Decisões em Aberto (Owner)

> Aguardando autorização do owner (silente há 7h+ no contexto do cycle 106 HOLD).

- [ ] **D2.1** Quem convidar para Cabala, Ifá, Tantra/Astrologia (3 perfis identificáveis).
- [ ] **D2.2** Tantra + Astrologia: 1 curador combinado ou 2 separados? (recomendação: 2 separados).
- [ ] **D2.3** Cross-tradição Ifá ↔ Candomblé/Umbanda: ligar `canReviewOtherTraditions=true` desde o aceite?
- [ ] **D2.4** Contrato jurídico: aceitar PDF anexo ao email ou redação mais leve?
- [ ] **D2.5** Janela de convite: 14d (default) ou 30d para convidados VIP?

## 28. Apêndice — Snippets Úteis

### Emitir convite (curl)

```bash
curl -X POST https://cabaladoscaminhos.app/api/admin/curators/invite \
  -H 'Content-Type: application/json' \
  -H "Cookie: $(printenv ADMIN_COOKIE)" \
  -d '{
    "email": "curador.cabala@exemplo.com",
    "displayName": "Rabino X",
    "tradition": "cabala",
    "curatorRole": "CURATOR_CABALA",
    "personalMessage": "Vimos sua contribuição na revista X e queremos honrar..."
  }'
```

### Listar curadores

```bash
curl 'https://cabaladoscaminhos.app/api/admin/curators?active=true' \
  -H "Cookie: $(printenv ADMIN_COOKIE)"
```

### Desativar curador

```bash
curl -X DELETE 'https://cabaladoscaminhos.app/api/admin/curators/<id>?reason=fim_de_temporada' \
  -H "Cookie: $(printenv ADMIN_COOKIE)"
```

### Aprovar artigo (curador logado)

```bash
curl -X POST 'https://cabaladoscaminhos.app/api/curators/cabala/approve-article' \
  -H 'Content-Type: application/json' \
  -H "Cookie: $(printenv CURATOR_COOKIE)" \
  -d '{"articleId":"cm...","decision":"approve"}'
```

## 29. Apêndice — Glossário de Termos Sagrados

| Termo | Origem | Significado editorial |
|-------|--------|------------------------|
| Cabala | Hebraico (קַבָּלָה, "recebimento") | Tradição mística judaica, ênfase na Árvore da Vida |
| Ifá | Iorubá (Ọ̀rúnmìlà) | Sistema divinatório iorubá baseado nos 256 Odu |
| Tantra | Sânscrito (तन्त्र, "tecer/trama") | Conjunto de tradições esotéricas hindus e budistas |
| Astrologia | Latim (astrologia) | Estudo da relação simbólica entre posições celestes e eventos terrestres/humanos |
| Odu | Iorubá | Cada um dos 256 signos fundamentais do Ifá |
| Sefirot | Hebraico (סְפִירוֹת) | As 10 emanações divinas na Árvore da Vida |
| Kashmiri Shaivismo | Sânscrito | Tradição tântrica não-dual do norte da Índia |
| Jyotish | Sânscrito (ज्योतिष, "ciência da luz") | Astrologia védica |

> **Importante:** Glossário é descritivo e **neutro**; curadores podem corrigir, mas não substituir por definições próprias.

## 30. Referências & Cross-links

- **W29-8 Curator Quality** — `DELIVERABLE-W29-AI-CURATION-ENGINE.md` (Akasha IA como pré-triagem).
- **W20 Admin Dashboard** — `src/lib/admin/session.ts` (camada de role defense-in-depth).
- **W22 LGPD** — Art. 7º, 18º, 37º (consentimento, direitos, logs).
- **W33 Newsletter** — `src/lib/email/` (camada de email reutilizada pelo curator-invite).
- **W32 Beta Invite** — `src/lib/email/templates/beta-invite.ts` (template-irmão usado como modelo).
- **AGENTS.md** — convenções de Conventional Commits + LGPD.

---

> **Aviso final:** este trabalho **NÃO envia convite** automaticamente. Wave 35 entrega a esteira técnica; emissão fica condicionada à aprovação do owner no D2. Quando o owner retomar, este doc serve como briefing de 1 página.
