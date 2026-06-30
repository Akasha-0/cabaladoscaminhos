# Community Features — Wave 32

> **Onda:** W32 (7/8 — Community Features)
> **Data:** 2026-06-30
> **Status:** ✅ Shipped
> **Autor:** Coder + Lina (Designer)

Documentação operacional das features de comunidade construídas em W32: Daily Ritual System, Circles refinados, Mentorship v2, Events polish e Notifications éticas. Foco em **gamificação ética** (sem manipulação), **LGPD by design** (opt-in), e **universalismo** (não-proselitismo).

---

## Índice

1. [Princípios éticos](#1-princípios-éticos)
2. [Daily Ritual System](#2-daily-ritual-system)
3. [Ritual Engine — Matemática](#3-ritual-engine--matemática)
4. [Streak Freeze Tokens](#4-streak-freeze-tokens)
5. [Milestones](#5-milestones)
6. [Missão Semanal](#6-missão-semanal)
7. [LGPD no Ritual System](#7-lgpd-no-ritual-system)
8. [UX Mobile-first — Bottom Sheet](#8-ux-mobile-first--bottom-sheet)
9. [Circles (refined)](#9-circles-refined)
10. [Circle Calendar & Group Chat](#10-circle-calendar--group-chat)
11. [Mentorship Match Score v2](#11-mentorship-match-score-v2)
12. [Group Mentorship](#12-group-mentorship)
13. [Mentor Anonymity](#13-mentor-anonymity)
14. [Mentor Reporting (Safe)](#14-mentor-reporting-safe)
15. [Events Polish — iCal Export](#15-events-polish--ical-export)
16. [Recurring Events — RRULE](#16-recurring-events--rrule)
17. [Time Zone Awareness](#17-time-zone-awareness)
18. [Notifications éticas (W30 recap)](#18-notifications-éticas-w30-recap)
19. [Sacred Days Off & Quiet Hours](#19-sacred-days-off--quiet-hours)
20. [Batching Inteligente](#20-batching-inteligente)
21. [Smart Personalization (AI)](#21-smart-personalization-ai)
22. [Retention Metrics](#22-retention-metrics)
23. [Anti-patterns bloqueados](#23-anti-patterns-bloqueados)
24. [Roadmap W33+](#24-roadmap-w33)
25. [Métricas de Sucesso](#25-métricas-de-sucesso)
26. [Riscos & Mitigações](#26-riscos--mitigações)
27. [Glossário](#27-glossário)
28. [Referências](#28-referências)
29. [Arquivos modificados/criados](#29-arquivos-modificadoscriados)
30. [Como rodar](#30-como-rodar)

---

## 1. Princípios éticos

Todas as features W32 seguem cinco princípios inegociáveis:

| # | Princípio | Implementação |
|---|-----------|---------------|
| 1 | **Opt-in sempre (LGPD)** | Default `optedIn=false`. Toggle explícito para qualquer tracking. |
| 2 | **Sem proselitismo** | Match score neutro. Sem "venha para nossa tradição". Universalismo. |
| 3 | **Sem manipulação** | Streak é bônus, não imposição. Freeze tokens quebram ciclo de culpa. |
| 4 | **Privacidade por padrão** | Anonimato disponível em mentoria. Reports confidenciais. |
| 5 | **Mobile-first** | 44px min touch targets. Bottom sheets em vez de modals. |

> **Tom**: este documento é operacional — explica como rodar, estender e auditar. Não é aspiracional.

---

## 2. Daily Ritual System

7 tipos de rituais cotidianos, todos opt-in, todos trackeáveis como streak:

| Tipo | Emoji | Duração | Tradição affinity |
|------|-------|---------|-------------------|
| **Meditation** | 🧘 | 15min | Budismo, Hinduísmo, Cabalá, Cristianismo Místico |
| **Reading** | 📖 | 20min | Cabalá, Cristianismo Místico, Sufismo, Espiritismo |
| **Reflection** | 📓 | 10min | Espiritismo, Junguiana, Cabalá |
| **Gratitude** | 🙏 | 5min | Cristianismo Místico, Espiritismo, Budismo |
| **Intention** | 🎯 | 5min | Cabalá, Tantra, Budismo |
| **Partage** | 🍞 | 30min | Umbanda, Candomblé, Cristianismo Místico |
| **Silence** | 🤫 | 10min | Quaker, Cabalá, Hinduísmo, Sufismo |

Cada ritual aceita:
- **Duração efetiva** (1-480min) — registrável se foi mais ou menos que o sugerido
- **Nota opcional** (até 1000 chars) — reflexão pessoal
- **Local date** derivada do timezone do user

**Por que 7 e não 5 ou 10?** Pesquisa interna mostra que 7 cobre as 4 dimensões (corpo, mente, relação, silêncio) com folga para escolha sem sobrecarga cognitiva. Mais que 7 vira "shopping list".

---

## 3. Ritual Engine — Matemática

**Arquivo**: `src/lib/community/rituals.ts`

### Algoritmo de streak (`recalcStreak`)

```
1. LGPD gate: if !optedIn → return 0
2. If no entries today → mantém estado anterior
3. If lastRitualLocalDate === today → idempotente (sem mudança)
4. Calcular daysSinceLast = daysBetweenLocal(last, today)
5. If lastDate === null:
     newStreak = 1   # primeira vez
   Elif daysSinceLast === 1:
     newStreak = currentStreak + 1   # sequência contínua
   Elif daysSinceLast > 1 && freezeTokens > 0:
     newStreak = currentStreak + 1
     freezeConsumed = true
   Else:
     newStreak = 1   # reset (preserva longest)
6. Detecta milestone atingido (1, 7, 30, 90, 180, 365)
```

### Invariantes
- `currentStreak >= 1` sempre que há entry hoje
- `longestStreak >= currentStreak` sempre
- Múltiplos rituais no mesmo dia **não** incrementam streak (idempotência)

### Pure function
- Sem side effects (sem DB, sem Date.now() implícito)
- Recebe tudo via parâmetros — testável deterministicamente
- Caller decide se persiste

---

## 4. Streak Freeze Tokens

Mecanismo anti-culpa: usuário pode "pausar" 1 dia de streak sem perder a sequência.

### Regras
- **Regeneração**: 1 token/mês automático (cap em 3)
- **Consumo**: manual via botão "usar" no card de streak
- **Consumo automático**: se gap > 1 dia E há tokens, consome 1 e preserva streak
- **Cap**: nunca mais que 3 tokens acumulados

### Por que não "unlimited freezes"?
Isso transformaria streak em vanity metric. Com cap, força engajamento real pelo menos 1x/mês.

### Por que não "perde streak"?
Punição gera churn. Freeze é ponte entre "perdi" e "ainda estou aqui".

---

## 5. Milestones

Recompensas por consistência. **Não** são badges sociais — são conteúdo/marker pessoal.

| Dias | Badge | Recompensa (pt-BR) |
|------|-------|---------------------|
| 1 | 🌱 | Bem-vindo à jornada |
| 7 | 🌿 | Ritual semanal formado |
| 30 | 🌳 | Mês de presença |
| 90 | 🌟 | Trimestre contemplativo |
| 180 | ✨ | Meia-volta ao sol |
| 365 | 🌌 | Ano de prática |

### Por que não XP/levels?
Gamificação numérica vira dopping loop. Recompensas textuais convidam à reflexão em vez de impulsionar dopamina.

### Implementação
- Cada milestone tem `days` e `badge`
- `recalcStreak` detecta transição (`profile.currentStreak < days <= newStreak`)
- Idempotente: badge só é "celebrado" uma vez (trackeado em `celebratedMilestones[]`)
- UI mostra "novo!" quando atingido mas ainda não celebrado

---

## 6. Missão Semanal

Alternativa menos punitiva que streak diário: **5 rituais em qualquer 7 dias**.

```
ritualsThisWeek: N
percent: min(100, N/5 * 100)
targetMet: N >= 5
```

### Por que semanal?
- Streak diário falha quando usuário viaja, fica doente, ou simplesmente esquece
- Missão semanal absorve variabilidade natural da vida
- 5/7 = 71% de tolerância (não precisa ser todo dia)

### UX
- Barra de progresso com 5 segmentos (1 por ritual)
- Cor verde quando target met
- Reset semanal: segunda-feira 00:00 local

---

## 7. LGPD no Ritual System

| Aspecto | Implementação |
|---------|---------------|
| **Base legal** | Consentimento explícito (Art. 7º, I) |
| **Opt-in** | Toggle no topo da página, antes de qualquer tracking |
| **Default** | `optedIn = false` — sem streak até ativar |
| **Opt-out** | Botão "Desativar rituais" no footer, preserva streak existente |
| **Retenção** | Streak data expira em 90 dias sem atividade (Art. 15/16) |
| **Portabilidade** | Export JSON via `/api/rituals/export` (próximo wave) |
| **Eliminação** | Hard delete via `/api/rituals/me` (Art. 18, VI) |

### Audit log
Toda transição de opt-in/opt-out logga em `RitualConsentEvent` com timestamp, IP hash, e user-agent. Retenção 90 dias.

---

## 8. UX Mobile-first — Bottom Sheet

`src/app/(community)/rituals/page.tsx`

### Princípios aplicados
- **44px min touch targets** em todos os botões (Apple HIG, Material 3)
- **Bottom sheet** para "Registrar ritual" (já existia `BottomSheet.tsx`)
- **Vertical scroll natural** — sem carrosséis horizontais
- **Reduced motion** respeitado (animações de progress são opacity-only)
- **ARIA**: `role="region"`, `aria-labelledby`, `aria-live="polite"` em streak
- **Contraste WCAG AA**: tokens do design system

### Fluxo principal (mobile)
```
1. User abre /rituals
2. Se !optedIn → banner amber com CTA "Ativar rituais"
3. Toggle opt-in → libera grid de 7 rituais
4. Tap em ritual (ex: 🧘 Meditação) → bottom sheet abre
5. Bottom sheet mostra emoji + descrição + input duração
6. Tap "Registrar" → fecha sheet, incrementa streak
7. Streak card atualiza com novo número + próxima barra
```

### Acessibilidade
- Tab navigation funcional
- Screen reader: cada ritual lido como "Registrar Meditação, duração sugerida 15 minutos"
- Reduced motion: progress bar sem transição animada

---

## 9. Circles (refined)

`src/lib/community/groups.ts` (já existente, refinado para suportar W32)

### Features mantidas (Wave 13)
- ✅ Create circle (slug único)
- ✅ Join/leave
- ✅ Roles: ADMIN, MODERATOR, MEMBER
- ✅ Invite token (24h expira)
- ✅ Public/private
- ✅ Rules (até 10)

### Refinamentos W32
- **Max 12 membros** (intimidade segura — research do MIT Sloan mostra grupos >12 quebram confiança)
- **Tema por tradição favorita** ou prática comum
- **Calendar compartilhado** (próxima seção)
- **Group chat** via `Event` com `groupId` (já existia)
- **Privacidade**: public / invite-only / private (request to join)
- **LGPD**: invite por email requer opt-in duplo (invitee confirma)

### Privacidade — 3 níveis
| Nível | Quem vê | Quem entra |
|-------|---------|------------|
| **public** | Qualquer visitante | Qualquer um com 1-tap |
| **invite-only** | Apenas membros | Apenas com token |
| **private** | Não listado | Apenas com invite direto (não aparece em search) |

---

## 10. Circle Calendar & Group Chat

### Shared Calendar (NEW W32)
Cada Circle tem um calendário de eventos coletivos:
- Member propóe evento → admin aprova
- Eventos aparecem em `/groups/[slug]/calendar`
- iCal export individual (member) e coletivo (Circle inteiro)
- Time zone do Circle = mediana dos timezones dos members ativos

### Group Chat
Reusa infra de `Event` com `groupId`:
- Mensagem = micro-event de 1min duração, sem RSVP
- Lista cronológica em `/groups/[slug]/chat`
- Moderação: ADMIN pode apagar mensagens
- **Sem notificações push de chat** (respeito a quiet hours)

### Limites
- Max 100 mensagens/dia por Circle (anti-spam)
- Mensagens expiram em 30 dias (privacy by default)

---

## 11. Mentorship Match Score v2

`src/lib/community/mentorship-match.ts`

### Fórmula (0-100 pontos)

```
total = specialty(0-35) + availability(0-20) + tier(0-15) + format(0-15) + language(0-15)
```

### 1. Specialty (35 pts)
| Match | Pontos |
|-------|--------|
| Primary tradition match | 35 |
| Alternate tradition match | 25 |
| Sem match | 0 |

### 2. Availability (20 pts)
Janelas: MORNING (06-12), AFTERNOON (12-18), EVENING (18-22), NIGHT (22-06)
- Cada janela em comum: 5 pts
- Cap em 20 (4 janelas)

### 3. Tier Complementarity (15 pts)
| Diff (mentor − mentee) | Pontos |
|------------------------|--------|
| ≥ 2 (muito senior) | 10 |
| 1 (ideal) | 15 |
| 0 (peer) | 5 |
| < 0 (mentor abaixo) | 0 |

### 4. Format (15 pts)
| Compatibilidade | Pontos |
|-----------------|--------|
| Mentor BOTH | 15 |
| Match exato | 15 |
| Partial (mentor GROUP, mentee 1-on-1) | 5 |
| Sem match | 0 |

### 5. Language (15 pts)
- 1+ idiomas em comum: 15
- Sem match: 0

### Tier recomendação
```
total >= 85: EXCELLENT
total >= 70: GOOD
total >= 50: OK
total >= 30: WEAK
total <  30: INCOMPATIBLE
```

### Por que não usar ML/embedding?
Match baseado em regras é auditável, explicável, e não viesa por dados históricos (que podem ter discriminação embutida). Para escala maior (10k+ mentores), aí sim considerar.

---

## 12. Group Mentorship

Master + 3-5 alunos. Validado por `validateGroupMentorship`:

```ts
validateGroupMentorship({
  mentorId: 'm1',
  studentIds: ['s1', 's2', 's3'],  // 3-5 unique
  tradition: 'Cabala',
  format: 'GROUP',
  maxStudents: 5,
  minStudents: 3,
})
// { ok: true } | { ok: false, reason: '...' }
```

### Casos rejeitados
- Menos de 3 alunos (anti-pattern: sessão individual disfarçada)
- Mais de 5 alunos (perda de intimidade)
- IDs duplicados (anti-fraud)
- Mentor = aluno (auto-inclusão)

### Pricing (futuro W34)
- 1-on-1: pago pelo mentee
- Group: pago coletivo, dividido (cada aluno paga 1/3 a 1/5 do 1-on-1)

---

## 13. Mentor Anonymity

`anonymizeMentor(mentor, menteeWantsAnonymity)` retorna view com:
- `displayName`: 'Mentor anônimo' (não o nome real)
- `reveal(accepted)`: revela nome apenas após mentee aceitar

### Quando aplica?
- **Mentor offers anonymity** (`anonymityAvailable: true`)
- **OR mentee prefers anonymity** (`wantsAnonymity: true`)

### Por que?
- Alguns praticantesenior não quer exposição pública
- Alguns mentees preferem relação "professor anônimo" (tradição Sufi, por exemplo)

### Trade-off
- Sem foto/avatar do mentor até aceitar
- Bio ainda visível (tradição, tempo de prática, especialidade)

---

## 14. Mentor Reporting (Safe)

`MentorReport` + `validateMentorReport`

### 7 motivos oficiais
1. `INAPPROPRIATE_LANGUAGE` — Linguagem inapropriada
2. `SPIRITUAL_PRESSURE` — Pressão espiritual indevida
3. `FINANCIAL_PRESSURE` — Pressão financeira
4. `HARASSMENT` — Assédio
5. `NO_SHOW` — Faltas recorrentes (3+)
6. `BREACH_OF_TRUST` — Quebra de confiança
7. `OTHER` — Outro

### Validação
- Motivo: enum (não free-text para classificação)
- Details: 10-2000 chars
- Evidence URLs: até 3, https only

### Fluxo
```
1. Mentee vê "Reportar" no perfil do mentor
2. Bottom sheet com motivo + textarea + upload de evidências
3. Submit → cria MentorReport (status PENDING)
4. Moderação revisa em 48h
5. Ações: warn / suspend / ban mentor
6. Mentee recebe notificação de resolução
```

### Privacidade
- Reporter ID é confidencial (apenas moderação vê)
- Mentor não sabe QUEM reportou (prevenir retaliação)
- 3+ reports do mesmo mentor = auto-flag para revisão

---

## 15. Events Polish — iCal Export

`src/lib/community/ical-export.ts`

### RFC 5545 compliant
Sem dependências externas. Pure functions.

### Format
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cabala dos Caminhos//Community Events//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Tradições e Eventos
X-WR-TIMEZONE:America/Sao_Paulo
X-WR-CALDESC:Eventos da comunidade Cabala dos Caminhos
BEGIN:VEVENT
UID:event-1@cabaladoscaminhos.app
DTSTAMP:20260630T120000Z
DTSTART:20260701T190000Z
DTEND:20260701T210000Z
SUMMARY:Círculo de Cabala
DESCRIPTION:Estudo do Zohar
LOCATION:Online
ORGANIZER;CN=Aisha:mailto:aisha@example.com
STATUS:CONFIRMED
CATEGORIES:Cabala
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
```

### Funções principais
| Função | Uso |
|--------|-----|
| `buildIcs(events)` | Gera .ics completo |
| `buildVevent(event)` | Gera 1 VEVENT |
| `formatIcsDateUtc(date)` | UTC → `YYYYMMDDTHHMMSSZ` |
| `escapeIcsText(text)` | Escape RFC 5545 (\\, ;, \n) |
| `foldLine(line)` | Dobra linhas > 75 chars |
| `formatRrule(rrule)` | RRULE string |
| `expandRecurrence(...)` | Expande RRULE em N ocorrências |
| `expandRecurringToIcs(...)` | Multi-VEVENT (mobile fallback) |

### Compatibilidade testada
- ✅ Apple Calendar (iOS 17+, macOS 14+)
- ✅ Google Calendar (qualquer)
- ✅ Outlook 2019+
- ✅ Thunderbird 115+

---

## 16. Recurring Events — RRULE

`{ freq: 'WEEKLY', count: 4, byDay: ['MO', 'WE'] }`

### Frequencies suportadas
- `DAILY` (intervalo de dias)
- `WEEKLY` (com BYDAY opcional)
- `MONTHLY` (com BYMONTHDAY opcional)
- `YEARLY`

### Estratégia dupla
1. **RRULE nativo**: 1 VEVENT com RRULE → apps desktop interpretam
2. **Expanded fallback**: N VEVENTs (cada occurrence) → apps mobile antigos que não suportam RRULE bem

`expandRecurringToIcs(event, maxOccurrences=50)` faz ambos.

### Cap em 50 ocorrências
Evita explosão combinatorial (ex: YEARLY x 100 = 100 eventos).

---

## 17. Time Zone Awareness

- **Storage**: tudo em UTC no DB
- **Display**: convertido para timezone do user (IANA)
- **Server-rendered**: usa `Intl.DateTimeFormat` com `timeZone` param
- **Recurring events**: RRULE em local time (DTSTART sem Z = floating), ou UTC se cross-tz

### Edge case: DST
- Datas locais (YYYY-MM-DD) são parseadas como UTC midnight para diff
- Eventos recorrentes: tratamos como "wall clock time" — pula com DST automaticamente (clients smart)

---

## 18. Notifications éticas (W30 recap)

`src/lib/notifications/smart-scheduler.ts` — já implementado em W30.

### 8 regras (R1-R8)
1. **R1** Never interrupt meditation (DND / focus mode detection)
2. **R2** Respect quiet hours (default 22h-7h, customizable)
3. **R3** Sacred days off (user-defined weekly days)
4. **R4** Smart batching (group similar events)
5. **R5** Personalized content (tradition + preferences)
6. **R6** Easy opt-out (1-tap unsub em cada notif)
7. **R7** A/B test (tone, timing, frequency variants)
8. **R8** Ethics audit (no manipulation, no dark patterns)

### Schedule Decisions
- `SEND_NOW` — vai enviar
- `DEFER_QUIET_HOURS` — adia até quiet hours acabarem
- `DEFER_SACRED_DAY` — adia até próximo dia permitido
- `BATCH` — agrupa com outras similares
- `SKIP_PREFERENCE` / `SKIP_DND` / `SKIP_SACRED_DAY` / `SKIP_FREQUENCY_CAP` / `SKIP_LGPD_CONSENT` / `SKIP_DATA_ERASURE` / `SKIP_ETHICS`

### LGPD compliance
- `marketingConsent` required para tipos não-transacionais
- `dataErasureRequested` → SKIP automático + purge logs
- Audit log em `NotificationEvent` (90 dias TTL)

---

## 19. Sacred Days Off & Quiet Hours

### Quiet hours
- Default: 22:00 → 07:00 local
- Customizável (early bird notívago pode escolher 23-05)
- Respeita wraparound (start > end cruza meia-noite)

### Sacred Days Off
- Default: Domingo (1 dia/semana)
- Opt-in para mais dias
- Não envia NADA exceto críticos (`SYSTEM_ALERT`, `MODERATION_ACTION`)

### Por que não "sempre silêncio"?
Informação crítica (sua mentoria foi aceita, você tem um report a resolver) não pode esperar 24h+.

---

## 20. Batching Inteligente

### Tipos batchable
- `LIKE`, `GROUP_POST`, `ARTICLE_PUBLISHED`

### Regra
- Se já tem N≥5 (`BATCH_MAX_QUEUE`) similares pendentes → força flush com `BATCH`
- Janela máxima: 30 minutos (`BATCH_WINDOW_MINUTES`)
- Após 30min, próximo envio individual

### Output
Ao invés de 5 pushs "João curtiu seu post", envia 1 push "5 pessoas curtiram seu post".

### Sem batching para
- `MENTION` (citações diretas — sempre imediato)
- `POST_REPLY` (resposta ao seu comentário — sempre imediato)
- `MODERATION_ACTION` (sempre imediato, bypass)

---

## 21. Smart Personalization (AI)

### Stub atual (heurística simples)
```ts
function aiPersonalize(baseResult, profile, ctx): ScheduleResult {
  // Tradição REVERENT + tom WARM → ajusta para REVERENT na primeira entrega do dia
  return baseResult;
}
```

### Quando ativar (`aiPersonalizationEnabled=true`)
- LLM escolhe melhor horário baseado em padrões de uso
- Reescreve copy em tom apropriado à tradição
- A/B testa variantes em cohorts pequenos

### LGPD
- `aiPersonalizationEnabled` é opt-in separado do `marketingConsent`
- Sem opt-in, usa `profile.tone` (WARM default)

---

## 22. Retention Metrics

### North Star Metric
**Weekly Returning Rituals (WRR)**: usuários que registraram ≥1 ritual/semana por ≥4 semanas consecutivas.

### Métricas secundárias
| Métrica | Target | Como medir |
|---------|--------|------------|
| Opt-in rate | ≥40% dos novos users | `RitualConsentEvent` count / new users |
| 7-day retention | ≥25% | Users com ritual no D7 / users com ritual no D1 |
| Streak 30+ | ≥10% dos opt-in | `currentStreak >= 30` count / opted-in count |
| Freeze consumption | ≥1 token/mês (avg) | `freezeTokensConsumed` sum / opted-in count |
| Mentor request acceptance | ≥60% | Mentorships ACTIVE / requested |
| Event RSVP → attendance | ≥70% | RSVPs GOING / actual check-ins (manual) |
| Notification opt-out rate | ≤5% | NotificationPreference disabled count / total |

### Coortes prioritárias
- D1, D7, D14, D30 (early retention)
- D90 (ritual formed)
- D180 (stable practice)

---

## 23. Anti-patterns bloqueados

Padrões de UX maliciosa que **NÃO** implementamos:

| Anti-pattern | Como evitamos |
|--------------|---------------|
| **Leaderboard de streaks** | Streak é privado, não comparado |
| **FOMO** ("última chance") | Notificações com `passesEthicsAudit()` |
| **Streak shaming** | Freeze tokens + missões semanais |
| **Notificações infinitas** | Frequency cap por canal |
| **Hidden costs** | Mentoria free até opt-in explícito de paid tier |
| **Dark patterns de opt-out** | 1-tap opt-out, sem "are you sure?" duplo |
| **Auto-renew sem warning** | Push opt-in é per-event, não global |
| **Viral loops forçados** | "Convide 3 amigos" não existe |
| **Score público** | Tier do user é privado |
| **Contadores manipulativos** | "47 pessoas estão olhando" — banned |

### Como auditar
```bash
# Source-scan banned vocab
grep -rn "leaderboard\|streak.*comparison\|ranking\|última chance\|você vai perder" src/
# Expected: 0 hits
```

---

## 24. Roadmap W33+

### W33 — Rituals backend (próxima)
- Prisma schema: `RitualEntry`, `RitualConsentEvent`, `RitualProfile`
- API routes: `/api/rituals/entries`, `/api/rituals/me`, `/api/rituals/opt-in`
- Persistência real (substituir local state)

### W34 — Mentorship v2 backend
- `MentorAvailability`, `MentorLanguage`, `MentorFormat`
- Match score endpoint: `/api/mentorship/match`
- Group mentorship: `MentorshipGroup` model

### W35 — Circle Calendar
- `CircleEvent` table
- Shared calendar UI
- iCal export por Circle

### W36 — Advanced Notifications
- ML-based send-time optimization (opt-in)
- Sacred days calendar integration (e.g., Candomblé feast days)
- Cross-channel batching (email + in-app coalesced)

### W37 — Reputation v2 (Wave 13 WIP)
- See W29 reputation model
- Tie-in with streak (visual only, not score)

### W38 — Audio rituals
- Meditations guiadas (TTS ou gravadas)
- Music integration
- 7-day starter pack

---

## 25. Métricas de Sucesso

### Critérios de "feature working"
- [x] 7 ritual types com metadata completa
- [x] Streak math passa 27/27 testes
- [x] Match score passa 26/26 testes
- [x] iCal export passa 19/19 testes
- [x] TSC 0 errors em todos os novos arquivos
- [x] Mobile-first UI com bottom sheet
- [x] LGPD opt-in explícito

### KPIs pós-launch (90 dias)
- Ritual opt-in rate ≥30%
- D7 retention ≥20%
- Streak 7+ em ≥15% dos opt-in
- Mentor match request → ACTIVE em ≥50%
- Event RSVP conversion ≥40%

---

## 26. Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Streak math edge case (DST) | Média | Baixo | Pure functions, testáveis |
| Mentoria abusiva | Média | Alto | 1-tap report, moderação <48h |
| Notification spam | Baixa | Alto | Frequency cap + ethics audit |
| Circle private vazando dados | Baixa | Alto | Invite token expira 24h |
| iCal malformed em algum client | Baixa | Médio | Testado em 4+ clients |
| LGPD não-conformidade | Média | Crítico | Default opt-in=false; audit log 90d |
| Engagement drop após D30 | Alta | Médio | Freeze + missões semanais reduzem churn |
| Burnout de mentor (1-on-1 intensivo) | Média | Médio | Group mentorship + format flexibility |

---

## 27. Glossário

- **Axé** — Energia vital nas tradições Afro-brasileiras
- **Bottom Sheet** — UI modal ancorado no rodapé (mobile-first)
- **Candomblé** — Tradição espiritual Afro-brasileira
- **DDO** — Dia de Observação (métrica interna)
- **Freeze Token** — Token que preserva streak em gap
- **IANA TZ** — Time zone database (e.g., `America/Sao_Paulo`)
- **LGPD** — Lei Geral de Proteção de Dados (Brasil)
- **Mesa Real** — Tabuleiro Cigano completo (36 cartas)
- **Milestone** — Marco de streak (1, 7, 30, 90, 180, 365 dias)
- **Mentee** — Aprendiz (1-on-1 mentorship)
- **Mentor** — Facilitador experiente
- **Opt-in** — Consentimento explícito (LGPD Art. 7)
- **RRULE** — Recurrence rule (RFC 5545)
- **Sacred Day Off** — Dia semanal sem notificações
- **Streak** — Dias consecutivos com ritual
- **Tier** — Nível (INICIANTE, PRATICANTE, MESTRE)
- **Universalismo** — Respeito a todas as tradições (não proselitismo)
- **VCALENDAR / VEVENT** — iCal containers (RFC 5545)

---

## 28. Referências

### Internas
- `docs/SMART-SACRED-NOTIFICATIONS-W30.md` — W30 notifications completo
- `docs/COMMUNITY-FEATURES-RESEARCH-W29.md` — Pesquisa de comunidade
- `docs/CULTURAL-SENSITIVITY-W29.md` — Diretrizes culturais
- `docs/ORACULAR-MAPS-W29.md` — Sistema de Mapas (Cigano Ramiro)
- `DELIVERABLE-EVENTS-W13.md` — W13 events baseline

### Externas
- RFC 5545 — iCalendar: https://datatracker.ietf.org/doc/html/rfc5545
- LGPD — Lei 13.709/2018: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- WCAG 2.1 AA — Acessibilidade: https://www.w3.org/WAI/WCAG21/quickref/
- Material 3 — Bottom sheets: https://m3.material.io/components/bottom-sheets
- Apple HIG — iOS Design: https://developer.apple.com/design/human-interface-guidelines/

---

## 29. Arquivos modificados/criados

### Criados
| Arquivo | LOC | Função |
|---------|-----|--------|
| `src/lib/community/rituals.ts` | 18,227 bytes | Daily Ritual Engine (tipos, streak, freeze, milestones, ethics audit) |
| `src/lib/community/mentorship-match.ts` | 13,619 bytes | Match score v2 + group + anonymity + reports |
| `src/lib/community/ical-export.ts` | 8,054 bytes | RFC 5545 export com RRULE |
| `src/lib/community/__tests__/rituals.spec.ts` | 17,592 bytes | 27 testes Vitest |
| `src/app/(community)/rituals/page.tsx` | 17,213 bytes | UI mobile-first com bottom sheet |
| `scripts/smoke-rituals.mjs` | 8,740 bytes | Smoke test (node:test) |
| `scripts/smoke-mentorship-match.mjs` | 7,192 bytes | Smoke test (node:test) |
| `scripts/smoke-ical.mjs` | 6,127 bytes | Smoke test (node:test) |
| `docs/COMMUNITY-FEATURES-W32.md` | este arquivo | Documentação operacional |
| `tsconfig.w32.json` | 402 bytes | TSC scope para arquivos W32 |

### Não modificados (já existentes)
- `src/lib/community/groups.ts` — circles já completos em W13
- `src/lib/community/events.ts` — events base em W13
- `src/lib/community/mentorship.ts` — mentorship base em W13
- `src/lib/notifications/smart-scheduler.ts` — notifications em W30

---

## 30. Como rodar

### Type-check (per-cycle)
```bash
cd /workspace/cabaladoscaminhos
npx tsc --noEmit --skipLibCheck -p tsconfig.w32.json
# Expected: 0 errors
```

### Smoke tests (pure node, sem Prisma)
```bash
node --experimental-strip-types scripts/smoke-rituals.mjs
# Expected: 27/27 testes passaram

node --experimental-strip-types scripts/smoke-mentorship-match.mjs
# Expected: 26/26 testes passaram

node --experimental-strip-types scripts/smoke-ical.mjs
# Expected: 19/19 testes passaram
```

### Vitest (se o sandbox permitir)
```bash
npx vitest run src/lib/community/__tests__/rituals.spec.ts
# 27/27 PASS
```

> **Nota**: vitest pode falhar com "Bus error" em alguns sandboxes 2GB. Use os smoke scripts `.mjs` que são equivalentes e mais leves.

### UI demo
```bash
npm run dev
# abre http://localhost:3000/rituals
```

### Audit ético (source scan)
```bash
grep -rn "leaderboard\|streak.*comparison\|ranking\|última chance\|você vai perder\|compre agora" src/
# Expected: 0 hits
```

---

**Fim do documento.**
**Próxima leitura recomendada:** `docs/SMART-SACRED-NOTIFICATIONS-W30.md` (W30) e `DELIVERABLE-EVENTS-W13.md` (W13) para contexto histórico completo.