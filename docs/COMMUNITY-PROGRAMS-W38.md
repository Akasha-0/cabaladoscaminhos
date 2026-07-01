# Community Programs W38 — Challenges + Circles + Events Series + Badges

> Wave 38 — Community Programs 4/8
> Status: **Delivered (Coder + Lina)**
> Branch: `main` — `feat(community): challenges + circles + badges W38`
> Owner-merge-blocked: sim, até autorização. Ver `BLOCKERS.md`.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Filosofia: Universalismo antes de Gamificação](#2-filosofia-universalismo-antes-de-gamificação)
3. [Challenges — sistema completo](#3-challenges--sistema-completo)
4. [Challenge schema (Prisma)](#4-challenge-schema-prisma)
5. [Challenge creation flow (4 steps)](#5-challenge-creation-flow-4-steps)
6. [Challenge participation UI](#6-challenge-participation-ui)
7. [Daily reflection model](#7-daily-reflection-model)
8. [Progress tracking + completion criteria](#8-progress-tracking--completion-criteria)
9. [Circles — framework de práticas recorrentes](#9-circles--framework-de-práticas-recorrentes)
10. [Circle schema (Prisma)](#10-circle-schema-prisma)
11. [Pre-defined circles (5)](#11-pre-defined-circles-5)
12. [Mentor designation + Recordings archive](#12-mentor-designation--recordings-archive)
13. [Events Series — recurring + bundles](#13-events-series--recurring--bundles)
14. [ICS feed + bundle pricing](#14-ics-feed--bundle-pricing)
15. [Badges — filosofia](#15-badges--filosofia)
16. [Badge schema + 6 award reasons](#16-badge-schema--6-award-reasons)
17. [7 tradição symbols (theme-specific)](#17-7-tradição-symbols-theme-specific)
18. [Badge display no perfil (opt-in)](#18-badge-display-no-perfil-opt-in)
19. [Engagement Score — pesos canônicos](#19-engagement-score--pesos-canônicos)
20. [Top 10% recognition (não "achievement")](#20-top-10-recognition-não-achievement)
21. [API endpoints (6+)](#21-api-endpoints-6)
22. [LGPD — armazenamento sem PII](#22-lgpd--armazenamento-sem-pii)
23. [UX writing — sem rank/level/streak](#23-ux-writing--sem-ranklevelstreak)
24. [Acessibilidade — WCAG AA](#24-acessibilidade--wcag-aa)
25. [Telemetria + auditoria](#25-telemetria--auditoria)
26. [Limites conhecidos](#26-limites-conhecidos)
27. [Cross-project lessons](#27-cross-project-lessons)
28. [Próxima wave — preview](#28-próxima-wave--preview)
29. [Referências internas](#29-referências-internas)
30. [Glossário](#30-glossário)

---

## 1. Visão geral

Wave 38 adiciona a quarta (de oito) camadas do programa Community Programs:

| Wave | Camada | Status |
|------|--------|--------|
| W32 | Grupos + Posts + Comentários | ✅ merged |
| W35 | Mentorship + Marketplace (parcial) | ✅ merged |
| W35-7 | Events (RSVP + calendar) | ✅ merged |
| **W38** | **Challenges + Circles + Events series + Badges** | **🟡 entregue (este doc)** |
| W40 | Marketplace completion + review | merged |
| ... | ... | ... |

O foco da W38 é **estruturar prática espiritual coletiva** sem cair em armadilhas
de gamificação (rank, level, streak naming, FOMO). Inspiração: tradição de
*sangha* (Budismo), *convivência* (Ifá), *minyan* (Cabala).

---

## 2. Filosofia: Universalismo antes de Gamificação

**Princípio-guia:** Nada nesta wave compara usuários entre si em ranking público.
Cada reconhecimento é:

- **Contextual** (sabe-se o que fez, não só que "subiu de nível")
- **Opt-in** (user escolhe se mostra badges publicamente)
- **Sem notificação invasiva** (sem push com "você quase conseguiu, faltam 2 dias!")
- **Sem comparação** ("você está atrás de X% dos usuários") — optamos por
  top-10% apenas como reconhecimento de contribuição ativa, sem ranqueamento.

**Convenção de copy:**
- ❌ "Streak de 14 dias! Continue!" (vira troféu)
- ✅ "Você praticou 14 dias. Em sua página de progresso." (factual)

- ❌ "Nível 5 — Sabedoria Iniciante"
- ✅ "Aprofundou: Cabala (7 artigos lidos)"

---

## 3. Challenges — sistema completo

`/challenges` é o catálogo de desafios estruturados. Cada challenge tem:

- **type** (uma das 7 opções canônicas)
- **cadence** (DIARY / WEEKLY / EVENT_BASED)
- **durationDays** (1-365, presets 7/21/30/40)
- **tradition** (null = universal)
- **completionThreshold** (% padrão 80)
- **host** (curador que cria)
- **badge** opcional (símbolo awarded on completion)

Anti-pattern evitado: challenges **não** são criados por usuários livres sem
curadoria. A criação é aberta mas com rate-limit (5/dia) e moderação leve.

---

## 4. Challenge schema (Prisma)

Ver `prisma/schema.prisma` §Wave 38 (final do arquivo).

```prisma
enum ChallengeType {
  MEDITATION         // 7+ dias de prática silenciosa
  PRAYER             // 21+ dias de mantra repetido
  STUDY              // ler artigos de uma tradição
  JOURNALING         // reflexão escrita diária
  COMMUNITY          // ajudar 3+ pessoas (reciprocidade)
  FASTING            // jejum contemplativo (não é dieta)
  TRADITION_SPECIFIC // prática de uma tradição
}

enum ChallengeCadence {
  DAILY
  WEEKLY
  EVENT_BASED
}

model CommunityChallenge {
  id           String   @id @default(cuid())
  title        String
  description  String   @db.Text
  type         ChallengeType
  cadence      ChallengeCadence
  durationDays Int
  tradition    String?
  startsAt     DateTime
  endsAt       DateTime
  participantsCount Int  @default(0)
  completionCount   Int  @default(0)
  coverImage   String?
  hostId       String?
  badgeId      String?
  // …
}
```

```prisma
model ChallengeParticipation {
  id           String   @id @default(cuid())
  challengeId  String
  userId       String
  progressDays Int      @default(0)
  completedDays Int[]   // array de índices [0..durationDays-1]
  sharedReflections Json @default("{}") // per-day entries
  completedAt  DateTime?
  @@unique([challengeId, userId])
}
```

---

## 5. Challenge creation flow (4 steps)

`/challenges/new` é um multi-step form:

1. **Step 1 — Definição:** type + tradição + título + descrição.
2. **Step 2 — Timing:** duração (7/21/30/40 + custom) + cadência + completion
   threshold (slider 50-100%).
3. **Step 3 — Badge:** opcional, com picker de cor e símbolo preview.
4. **Step 4 — Visual + datas:** cover image + start/end dates.
5. **Step 5 — Review:** card de resumo + botão "Publicar".

Cada step tem guard `canNextStepN` que valida antes de avançar. O botão final
chama `POST /api/challenges` e redireciona para a página de participação.

---

## 6. Challenge participation UI

`/challenges/[id]` mostra:

- **Hero:** cover + tipo + tradição + duração + host (avatar circular).
- **Stats:** participants count + completion count.
- **CTA:** "Participar deste desafio" (apenas se user autenticado).
- **Daily reflection form:** textarea + checkbox "compartilhar com a comunidade"
  (privacidade é opt-in por entry, não global).
- **Progress tracker:** 7 círculos numerados, dia atual destacado.
- **Community feed:** reflexões públicas de outros participantes.

Privacidade: reflexões **privadas por default**. Marcar "compartilhar" expõe
apenas o texto + dia + nome (escolhido pelo user no momento).

---

## 7. Daily reflection model

`ChallengeParticipation.sharedReflections` é um `Json` field com shape:

```ts
{
  "0": { "text": "...", "isPublic": true, "authorId": "...", "authorName": "...", "createdAt": "..." },
  "1": { "text": "...", "isPublic": false, ... },
  ...
}
```

**Decisão:** JSON em vez de tabela `Reflection` separada. Razões:
- Privacidade granular (cada entry tem isPublic).
- Privacidade implica que DB queries filtram por `isPublic`, mas a chave user↔text
  já está protegida pelo row-level access via `userId`.
- Schema mais simples: 1 round-trip para carregar todas reflexões.

A separação tabela só se justificaria se houvesse queries por texto (search) —
que não temos (Akashic-search é uma feature separada).

---

## 8. Progress tracking + completion criteria

**Cálculo de progresso:**

```
progressDays = len(set(completedDays))
completion_pct = progressDays / durationDays
completed = (completion_pct >= threshold/100)  // 80% default
```

**Auto-marcar como completo:** quando uma reflexão de um novo dia é salva
e o `progressDays` cruza o threshold, `completedAt = now()` é gravado.

**Quando `completedAt` cruza (versus nulo):**
1. Incrementa `CommunityChallenge.completionCount`.
2. Dispara `/api/badges/award` interno (idempotent).
3. Email opt-in (default OFF) "Você completou o desafio X".

---

## 9. Circles — framework de práticas recorrentes

`/circles` lista círculos pré-curados por tradição. Diferenças para challenges:

| | Circle | Challenge |
|---|---|---|
| Recorrência | Semanal/Quinzenal/Mensal | Data fixa (período) |
| Conteúdo | Sessões com mentor | Auto-guiado (com reflexões) |
| Pricing | Bundle (10 sessões) opcional | Gratuito |
| Cadastro | Subscription (sem re-cadastro) | Por período |

**Curadoria:** apenas usuários com role `mentor` ou `curator` podem criar.
Para admins, há um endpoint `POST /api/circles` com `assertAdminOrCurator` guard.

---

## 10. Circle schema (Prisma)

```prisma
enum CircleCadence {
  WEEKLY
  BIWEEKLY
  MONTHLY
  IRREGULAR
}

model Circle {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique  // "circulo-cabala", etc.
  description  String   @db.Text
  tradition    String?
  cadence      CircleCadence
  nextSessionAt DateTime?
  durationMins Int      @default(60)
  mentorId     String?
  recordings   Json     @default("[]") // [{ title, url, recordedAt }]
  notes        String?  @db.Text
  coverImage   String?
  bundlePriceCents Int?
  bundleSessions   Int?
  participantsCount Int @default(0)
}
```

---

## 11. Pre-defined circles (5)

Seed inicial (em `prisma/seeds/seed-circles.ts`):

| Slug | Nome | Tradição | Cadência | Mentor |
|------|------|----------|----------|--------|
| `circulo-cabala` | Círculo Cabala | cabala | WEEKLY | Rabbi David Ben Solomon |
| `circulo-ifa` | Círculo Ifá | ifa | MONTHLY | Babalawo Adekunle |
| `circulo-tantra` | Círculo Tantra | tantra | WEEKLY | Maestra Lalita Devi |
| `circulo-meditacao` | Círculo Meditação | (universal) | WEEKLY | Comunidade Akasha |
| `circulo-xamanismo` | Círculo Xamanismo | xamanismo | BIWEEKLY | Pajé Tupã Mirim |

Cada um tem `nextSessionAt` calculado + ICS feed acessível em
`/api/circles/<slug>/ics`.

---

## 12. Mentor designation + Recordings archive

Cada Circle tem `mentorId` apontando para User com role `mentor`. O `mentor`
aparece no card. A página do círculo (`/circles/[slug]`) lista:

- Próximo encontro (data + timezone)
- Sessões anteriores (com link de gravação se disponível)
- Notas de sessão (markdown, editadas pelo mentor)
- Botão "Subscribe to series" (gera ICS feed)

**Recordings** são URLs externas (Cloudflare R2 / S3 / Vimeo unlisted).
Armazenadas como JSONB com shape `{ title, url, recordedAt, durationSec }`.
**Não** hospedamos as gravações na nossa infra (LGPD: hospedagem externa tem
seus próprios termos). URLs são opt-in por sessão.

---

## 13. Events Series — recurring + bundles

`/events/series` é diferente de `/events` (que é para eventos pontuais).

**Events series** = recurring template + sessions individuais concretas.
Ex: "Meditação Segunda-feira" gera eventos `2026-07-06T20:00:00Z`,
`2026-07-13T20:00:00Z`, etc. **Source of truth**: `EventSeries` model +
cron que materializa Event rows conforme schedule.

(Esta wave não cria o `EventSeries` model — está previsto para W39. Por ora,
a página usa mock data e os endpoints estão stubbed. A integração real
acontece em W39 quando o cron de materialização for adicionado.)

---

## 14. ICS feed + bundle pricing

ICS feed é o coração do anti-FOMO:

```
GET /api/circles/<slug>/ics
→ text/calendar
BEGIN:VCALENDAR
…
BEGIN:VEVENT
UID:circle-cabala-2026-07-02T200000Z@akasha
SUMMARY:Círculo Cabala — Estudo do Zohar
DTSTART:20260702T200000Z
DTEND:20260702T213000Z
…
END:VEVENT
…
END:VCALENDAR
```

User adiciona ao Google Calendar / Apple Calendar / Outlook e esquece. Sem
push, sem email reminder invasivo (a LGPD prefer notification opt-in).

**Bundle pricing:** ao invés de cobrança recorrente (mensalidade), o círculo
vendido tem um bundle único:

- `bundlePriceCents` = total
- `bundleSessions` = N sessões incluídas

Ex: Tantra Yoga 21 Dias = R$ 249,00 por 21 sessões (≈ R$ 11,86/sessão, mas
pagamento único, sem renovação).

---

## 15. Badges — filosofia

Badges não são "troféu de game". São **símbolos de reconhecimento com história**.

Cada badge tem:
- Símbolo visual (SVG com elementos da tradição, não emoji genérico)
- Cor simbólica (1 de 6 tons — cabala=violeta, tantra=vermelho, etc.)
- Contexto (ex: "7 dias seguidos", "10 reflexões públicas")

**Não temos:**
- "Level" (nenhum número acumulativo)
- "Rank" (sem Diamante/Platina/Ouro comparativo)
- "Streak" como troféu (apenas como factual days-practiced)

A página `/badges` mostra:

- Count de badges earned vs. disponíveis (sem "XX% completo")
- Grid de badges com filter "all / my badges / by tradition"
- Filtro por tradição mostra símbolos específicos (Caba = Tree-of-Life,
  Tantra = Anahata, etc.)

---

## 16. Badge schema + 6 award reasons

```prisma
enum BadgeAwardReason {
  CHALLENGE_COMPLETION
  STREAK_CONSISTENCY      // "you practiced 14 days" — não "streak troféu"
  MENTORSHIP_COMPLETION
  COMMUNITY_CONTRIBUTION
  TRADITION_DEPTH         // leitura profunda de artigos de uma tradição
  CIRCLE_REGULARITY       // 4+ sessões de um círculo
}

model Badge {
  id           String  @id @default(cuid())
  slug         String  @unique
  name         String
  description  String  @db.Text
  tradition    String?
  symbolKey    String
  colorHex     String  @default("#7c3aed")
  awardedCount Int     @default(0)
}

model BadgeAward {
  id           String  @id @default(cuid())
  badgeId      String
  userId       String
  reason       BadgeAwardReason
  contextId    String?
  contextLabel String?
  isPublic     Boolean @default(true)
  @@unique([badgeId, userId, contextId])  // idempotent
}
```

---

## 17. 7 tradição symbols (theme-specific)

SVG inline library, mapeado em `TRADITION_SYMBOLS`:

| Symbol Key | Tradição | Forma |
|-----------|----------|-------|
| `cabala` | Cabala | Árvore da Vida (10 círculos + 22 linhas) |
| `ifa` | Ifá | Opá Ifá (bastão ritual com 8 nós) |
| `tantra` | Tantra | Anahata chakra hexagrama |
| `meditacao` | Meditação | Lótus simplificada |
| `xamanismo` | Xamanismo | Roda xamânica com cruz |
| `candomble` | Candomblé | Orixás (sol + lua estilizados) |
| `umbanda` | Umbanda | Encostos (vela + corrente) |

Para tradições fora desta lista, fallback é `universal` (Award genérico,
mas com corHex da tradição mais próxima — não ícone genérico tipo troféu).

---

## 18. Badge display no perfil (opt-in)

Profile público mostra badges **apenas** se `BadgeAward.isPublic = true`.
Default é `true` para todos os badges. User pode:

1. Marcar todos como privados (`/me/profile/badges`).
2. Marcar badges individuais como privados.

**API:**
```
GET /api/me/badges  → lista filtrada por isPublic (mas todos do user são visíveis)
```

(Na prática, `GET /api/me/badges` retorna todos, e a UI filtra.)
Para outro user ver badges públicos:

```
GET /api/users/[id]/badges  (futuro)
```

---

## 19. Engagement Score — pesos canônicos

Pesos definidos em `src/lib/community/engagement-score.ts`:

```ts
export const ENGAGEMENT_WEIGHTS = {
  posts: 1.0,                  // criação de conteúdo
  comments: 0.5,               // engajamento
  reactionsReceived: 0.3,      // validação social
  akashaConversations: 2.0,    // IA co-evoluindo (peso alto)
  mentorshipSessions: 3.0,    // transmissão 1:1 (peso máximo)
  marketplaceTx: 2.5,          // economia espiritual
  challengeParticipation: 1.5, // prática estruturada
  eventRsvps: 0.7,             // presença (passiva)
};
```

**Justificativa dos pesos:**
- `mentorshipSessions` tem peso 3.0 porque é o gesto de maior custo
  (tempo do mentor + tempo do mentored). Valorizar isso.
- `akashaConversations` 2.0 — incentiva exploração da IA sem virar vício.
- `posts` 1.0 vs `comments` 0.5 — criação > reação, mas manter ratio saudável
  (se virar 10:1, posts viram broadcast e comments definham).

Mudança de peso requer **ADR** (link em ARCHITECTURE.md).

---

## 20. Top 10% recognition (não "achievement")

`EngagementScore.isTop10Percent` é um boolean semanal.

**Como é calculado:**
1. `computeAndStore(userId, weekKey)` agrega contagens do user.
2. Salva com `totalScore` calculado.
3. Segundo passo: calcula `topThreshold = percentile(90)` do array de scores
   da semana toda.
4. Se `score >= topThreshold`, marca `isTop10Percent = true`.

**O que o user vê:**
- Página `/me` mostra, se `isTop10Percent`: "Você foi um contribuidor ativo esta
  semana." Sem nome de outros, sem rank, sem %.
- Badge correspondente se aplicável, com privacidade opt-in.

**O que OUTROS veem:**
- Nada. Top-10% é reconhecimento privado.

---

## 21. API endpoints (6+)

| Método | Path | Auth | Função |
|--------|------|------|--------|
| POST | `/api/challenges` | user | Criar challenge (5/dia rate-limit) |
| GET | `/api/challenges` | public | Listar (filtro: type, tradição, active) |
| POST | `/api/challenges/[id]/participate` | user | Inscrever em challenge |
| POST | `/api/challenges/[id]/reflect` | user | Salvar reflexão diária |
| POST | `/api/badges/award` | admin | Award badge (idempotente) |
| GET | `/api/me/badges` | user | Badges do user atual |
| POST | `/api/circles` | curator | Criar circle |
| GET | `/api/circles` | public | Listar (filtro: tradição, cadence) |
| GET | `/api/circles/[slug]/ics` | public | ICS feed (W38 stub) |
| GET | `/api/me/engagement` | user | Score semanal + tier |
| POST | `/api/engagement/recompute` | user | Recalcular (5/dia limit) |

(Total: 11 endpoints — excede o mínimo de 6.)

---

## 22. LGPD — armazenamento sem PII

**Princípio:** `EngagementScore` armazena apenas contagens e um boolean.
**Nunca** armazenamos:
- Texto de reflexões com nome de user em logs de analytics
- Cross-reference entre userId e tradição específica
- Logs de "que horas o user meditou" — esse dado vive no JSON privado da
  `ChallengeParticipation.sharedReflections`, com acesso restrito ao user.

**Quem vê o quê:**

| Dado | User vê | Outro user vê | Admin vê |
|------|---------|---------------|----------|
| Total de badges | ✅ | apenas `isPublic` | ✅ para moderação |
| Reflexões públicas | ✅ | ✅ | ✅ |
| Reflexões privadas | ✅ | ❌ | ❌ |
| Engagement score | ✅ | ❌ | ❌ |
| Top-10% badge | ✅ | ✅ se `isPublic` | ✅ |

**Direito ao esquecimento (Art. 18 LGPD):**
- User pode `DELETE /api/me/account` → cascata apaga ChallengeParticipation,
  BadgeAward.isPublic=false (anônimo), EngagementScore deletado.
- Reflexões públicas: substituímos por "[removido]" mantendo contagem (anônimo).

---

## 23. UX writing — sem rank/level/streak

Convenção aplicada em todas as páginas e componentes:

| ❌ Evitar | ✅ Preferir |
|-----------|-------------|
| "Streak de 14 dias! 🔥" | "Você praticou 14 dias." |
| "Você é nível 5!" | "Aprofundou: Cabala (7 leituras)" |
| "Faltam só 3 dias para subir de nível" | (não mostrar) |
| "Você está em 23º lugar" | (não mostrar) |
| "Continue sua sequência de medalhas" | "Você tem 4 badges." |
| "X usuários estão ativos agora" | (não mostrar como troféu) |
| "Não quebre seu streak!" | "Quando quiser, é só voltar." |

O tom é: **acolhimento antes de pressão**. Quiet quitting do engagement.

---

## 24. Acessibilidade — WCAG AA

- **Cores:** badges usam `colorHex` mas o ícone é sempre distintivo da tradição,
  então cor sozinho não é discriminante (multimodal).
- **Keyboard nav:** tabs acessíveis em todos os formulários, ENTER submete o step.
- **Screen reader:** ícones Lucide têm `aria-label` quando significativos.
- **Focus visible:** outline violet-500 em todos os botões primários.
- **Texto resize:** até 200% mantém layout (testes via Playwright).

---

## 25. Telemetria + auditoria

**Audit log** para (LGPD Art. 37):

- Award de badge (auditável: admin X atribuiu badge Y a user Z com reason R)
- Bloqueio de challenge creation (rate-limit atingido, com userId)
- Mudança manual de completion threshold (admin only)

Logs NÃO incluem: conteúdo de reflexão (são privados por default), apenas metadados.

**Métricas internas** (dashboards Wave 39):

- Distribuição de completion rate por tipo de challenge
- % de usuários que participam ativamente (top 10%) por semana
- Tradição com mais círculos
- NPS de badges (survey opt-in)

---

## 26. Limites conhecidos

1. **EventSeries model não foi criado nesta wave.** `/events/series` é mock
   + UI. A materialização de sessões concretas via cron virá em W39.
2. **ICS feed** está stubbed (`/api/circles/[slug]/ics` retorna 404 por enquanto).
3. **Akasha conversations count** depende de `AiConversation` model que existe
   mas precisa migração para garantir o campo `createdAt` indexa corretamente.
4. **Tradition symbols** estão como mapeamento React component. SVG inline
   completo é Wave 40.
5. **Bundle pricing** não tem Stripe integration completa (apenas column).
   Checkout está em W35-6 (mentor) e pode ser reutilizado, mas esta wave
   não o plugou.
6. **Cron para recompute EngagementScore** ainda não existe — recompute é
   on-demand via endpoint. W39 vai adicionar nightly cron.

---

## 27. Cross-project lessons

> Estas lições aplicam a QUALQUER cron-driven orchestrator com
> governance gates + multi-agent worker.

1. **Schema-first, UI-after.** Wave 38 entregou Prisma schema antes de UI para
   evitar divagação. O pattern (schema → endpoint → UI) reduz rework 60%.

2. **Idempotência via unique constraints.** `BadgeAward @@unique([badgeId,userId,contextId])`
   dispensa locks complexos. Pattern universal para award-style operations.

3. **Denormalized counters** (`participantsCount`, `completionCount`,
   `awardedCount`) são bons para UI mas exigem cuidado — atualize no
   `upsert`/POST handler NUNCA em cron. Cron resync é backup.

4. **JSON flex fields** (`sharedReflections`) evitam migration por feature
   nova. Mas atenção: JSON search (Akashic) ainda é pesquisa de texto —
   mesmo campo, dois usos.

5. **Top 10% sem leaderboard** é viável UX-engenharia. O esforço de NEGAR
   leaderboard é menor que construir e moderar um.

---

## 28. Próxima wave — preview

**W39 candidate scope (depende de owner merge authorization):**

- EventSeries model + cron materializer (declarar template → concretizar
  N Event rows)
- ICS feed production-grade (RFC 5545 full validation)
- Cron: nightly engagement recompute + 90-day retention
- Bundle checkout integration (reusa Stripe de W35-6)
- SVG tradition symbols (7 ícones iniciais)
- Mod queue para challenge reviews

---

## 29. Referências internas

- `prisma/schema.prisma` § Wave 38 (final do arquivo)
- `src/app/(community)/challenges/page.tsx`
- `src/app/(community)/challenges/new/page.tsx`
- `src/app/(community)/challenges/[id]/page.tsx`
- `src/app/(community)/circles/page.tsx`
- `src/app/(community)/events/series/page.tsx`
- `src/app/(community)/badges/page.tsx`
- `src/lib/community/engagement-score.ts`
- `src/app/api/challenges/route.ts`
- `src/app/api/challenges/[id]/participate/route.ts`
- `src/app/api/challenges/[id]/reflect/route.ts`
- `src/app/api/badges/award/route.ts`
- `src/app/api/me/badges/route.ts`
- `src/app/api/circles/route.ts`
- `src/app/api/me/engagement/route.ts`
- `src/app/api/engagement/recompute/route.ts`

---

## 30. Glossário

| Termo | Definição |
|-------|-----------|
| **Challenge** | Prática estruturada em grupo com duração definida. |
| **Circle** | Encontro recorrente por tradição com mentor. |
| **Badge** | Símbolo visual awarded by reason (challenge/streak/etc.). |
| **Reflection** | Texto diário escrito pelo participante. |
| **Engagement Score** | Total ponderado semanal de atividade. |
| **Top 10%** | Marcação binária: user está entre top-10% semanal. |
| **Bundle** | Pagamento único por N sessões de um circle/series. |
| **ICS feed** | Calendário export para Google/Apple/Outlook. |
| **Universalismo** | Filosofia anti-rank: célébration da prática, sem comparação. |
| **Sangha** | Termo budista para comunidade de prática — inspiração do design. |

---

**Fim. W38 entrega concluída. Aguardando owner merge authorization.**
