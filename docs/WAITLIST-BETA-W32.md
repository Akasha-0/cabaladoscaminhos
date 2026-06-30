# WAITLIST BETA — Wave 32 (2026-06-30)

> Documento canônico da operação de captura de leads e triagem para o beta
> privado de 50 vagas em 3 ondas. Cobre arquitetura, fluxo de usuário,
> métricas e melhorias futuras.

---

## 1. Visão Geral

O beta privado da **Cabala dos Caminhos** tem **50 vagas**, abertas em
**3 ondas** (10 + 20 + 20) ao longo de ~6 semanas. O objetivo da Wave 32 é
transformar a landing `/validacao` num funil completo, com:

- Captura qualificada (tradição + perfil + LGPD)
- Confirmação de email (token HMAC, 7 dias)
- Pontuação de prioridade (score por tradição, confirmação, referral)
- Convite automático via email com magic-link
- Painel admin para triagem manual (`/admin/waitlist`)
- 5 templates de email alinhados com tom Iyá (acolhedor, multi-tradição)
- Analytics completo (PostHog) para o funil

Não é objetivo da Wave 32:
- Pagamentos (removido da roadmap — ver § Decisões)
- Mobile app nativo (PWA continua sendo a estratégia)
- Auto-cadastro completo do invite (chega em W33 com tabela Prisma)

---

## 2. Arquitetura

### 2.1 Componentes principais

```
/validacao                         → Landing (Variant A/B/C/D — A/B test)
/validacao/confirmar?email=&token= → Página de confirmação (chama PATCH)
/api/waitlist [POST]               → Captura novo lead (idempotent, rate-limited)
/api/waitlist [GET]                → Stats (público) ou leads (admin via ?admin_token=)
/api/waitlist [PATCH]              → Ações: confirm / send_invite / mark_accepted / reject / unsubscribe
/api/waitlist/accept-invite [GET]  → Magic link — aceita invite + redireciona para /onboarding
/admin/waitlist                    → Dashboard admin (filtros, CSV, send invite)
src/components/validation/WaitlistForm.tsx → Form multi-step (5 steps)
src/lib/email/templates/waitlist-* → 5 templates de email transacional
data/waitlist.json                 → Persistência local (gitignored, substituir por Prisma em W33)
data/waitlist-rate-limit.json      → Rate limit buckets por IP (sliding 1h)
```

### 2.2 Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript strict
- **Validation**: Zod 3 (server + client compartilham schema quando possível)
- **Styling**: Tailwind CSS 4, tokens `slate`/`amber`/`violet`/`emerald`
- **Email**: Resend API + templates HTML inline (compat Outlook)
- **Analytics**: PostHog via `events-catalog.ts` (cliente) + `trackEvent()` (servidor)
- **Persistência**: JSON local (`data/waitlist.json`) — substituir em W33
- **Auth**: tokens HMAC com TTL (sem JWT, sem DB) — substituir em W33

### 2.3 Decisões arquiteturais

| Decisão | Alternativa | Por quê |
|---|---|---|
| JSON local em vez de Prisma | Tabela `waitlist_leads` | Volume esperado (≤500 leads) não justifica schema/DB. JSON lê/escreve em <5ms. Migração para Prisma prevista em W33 com schema já validado. |
| Tokens HMAC em vez de JWT | JWT + session | Magic links são one-shot, então o custo do JWT (assinatura, claims, refresh) não compensa. HMAC + DB lookup resolve em O(1). |
| Multi-step em vez de single-step | Form com todos os campos | Captura mais qualificada (tradição + perfil) + LGPD consent aumenta conversão por etapa (padrão de 60% em drop-off). |
| Score no client em vez de server-side ranking | Server-side ranking | Score calculado server-side na hora da inserção; client só exibe. Mantém a fonte da verdade no JSON. |
| Idempotency via email | Idempotency-Key header | Email é a chave natural. Usuários lembram do email, não de IDs aleatórios. |
| Rate limit por IP (sliding 1h) | Rate limit por user-agent | IP é mais confiável para detectar bots; UA pode ser falsificado. |

---

## 3. User Flow (5 steps)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Email                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Qual seu melhor email?                                      │ │
│ │ [_____________________________________________]              │ │
│ │ Validação: regex email PT-BR, mensagem humanizada          │ │
│ └────────────────────────────────────────────────────────────┘ │
│              ↓                                                   │
│ Step 2: Nome (opcional)                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Como podemos te chamar?                                     │ │
│ │ [_____________________________________________]              │ │
│ │ Primeiro nome é suficiente — usamos nos emails             │ │
│ └────────────────────────────────────────────────────────────┘ │
│              ↓                                                   │
│ Step 3: Tradição principal (REQUIRED)                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Qual sua tradição principal?                                │ │
│ │ [🃏 Baralho Cigano] [🍲 Candomblé] [🕊️ Umbanda]            │ │
│ │ [🪶 Ifá]             [✡️ Cabala]    [⭐ Astrologia]         │ │
│ │ [🕉️ Tantra]                                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│              ↓                                                   │
│ Step 4: Perfil espiritual (REQUIRED)                           │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Como você se vê nessa jornada?                              │ │
│ │ [🌱 Curioso] [🌿 Iniciante] [⚪ Praticante] [⭐ Mestre]      │ │
│ └────────────────────────────────────────────────────────────┘ │
│              ↓                                                   │
│ Step 5: Confirmação + LGPD                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Resumo:                                                     │ │
│ │   Email: ... | Nome: ... | Tradição: ... | Perfil: ...    │ │
│ │                                                              │ │
│ │ ☑ Li e aceito a Política de Privacidade (LGPD Art. 7º, I) │ │
│ │ ☐ Aceito receber comunicações de marketing (opcional)      │ │
│ │                                                              │ │
│ │ [   Entrar na lista de espera   ]                           │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Auto-save**: Cada mudança é salva em `localStorage` (key `akasha_waitlist_draft`)
automaticamente. Se o usuário fechar a aba e voltar, o form retoma do último
step completado (auto-resume). Sem perda de dados.

---

## 4. Validação e Mensagens de Erro (PT-BR)

Todas as mensagens são humanizadas, sem jargão técnico:

| Campo | Regra | Mensagem de erro |
|---|---|---|
| email | required, regex | `Email é obrigatório` / `Email inválido` |
| displayName | optional, max 80 | `Nome muito longo (máx 80 caracteres)` |
| tradition | required, enum | `Escolha uma tradição para continuarmos.` |
| profile | required, enum | `Escolha um perfil para continuarmos.` |
| lgpdConsent | required = true | `Você precisa aceitar a Política de Privacidade para entrar na fila.` |

Erros aparecem inline (vermelho + ícone `AlertCircle`) com `role="alert"` para
screen readers. Não bloqueiam navegação — só aparecem quando o usuário tenta
avançar.

Erros da API (429, 500, network) aparecem num banner destacado acima dos botões
de navegação.

---

## 5. API Reference

### 5.1 POST `/api/waitlist`

**Body:**
```json
{
  "email": "maria@exemplo.com",
  "displayName": "Maria",
  "tradition": "cigano",
  "profile": "praticante",
  "lgpdConsent": true,
  "marketingConsent": false,
  "source": "validacao-A",
  "referredBy": "joao@exemplo.com"  // opcional
}
```

**Response 200:**
```json
{
  "ok": true,
  "alreadyRegistered": false,
  "position": 7,
  "total": 42,
  "capacity": 50,
  "full": false,
  "status": "pending",
  "score": 10
}
```

**Errors:**
- `400 Dados inválidos` — Zod falhou
- `429 Muitas tentativas` — rate limit (3/IP/hora), header `Retry-After`
- `503 Beta lotado` — capacity cheio (ainda aceita na fila geral)

### 5.2 GET `/api/waitlist`

**Público** (sem token):
```json
{
  "total": 42,
  "capacity": 50,
  "remaining": 8,
  "confirmed": 23,
  "conversionRate": 0.548,
  "topTraditions": [...],
  "waves": [...]
}
```

**Admin** (com `?admin_token=ADMIN_API_TOKEN`):
```json
{
  ...publicPayload,
  "leads": [
    {
      "position": 1,
      "email": "...",
      "tradition": "cigano",
      "score": 25,
      "status": "confirmed",
      ...
    }
  ]
}
```

### 5.3 PATCH `/api/waitlist`

**Self-service** (não requer admin token):
```json
{ "action": "confirm", "email": "...", "confirmToken": "..." }
```

**Admin** (requer header `x-admin-token`):
```json
{ "action": "send_invite", "email": "...", "waveNumber": 1 }
{ "action": "mark_accepted", "email": "..." }
{ "action": "reject", "email": "...", "reason": "..." }
{ "action": "unsubscribe", "email": "..." }
```

---

## 6. Score de Prioridade

O score ordena os leads na fila. **Maior score = posição melhor**.

```ts
score =
  baseTradition              // 5-10
  + confirmedBonus           // +5 se confirmou email
  + acceptedBonus            // +20 se entrou no beta
  + referralCount * 3        // +3 por indicação confirmada
  + traditionBoost           // +2 se for cigano (eixo do projeto)
```

### Tabela de tradição → base:

| Tradição | Base | Justificativa |
|---|---|---|
| cigano | 10 | Eixo do projeto (Baralho Cigano Ramiro como método pessoal) |
| candomble | 8 | Tradição afro-brasileira sub-representada em apps |
| umbanda | 8 | Tradição afro-brasileira sub-representada |
| ifa | 8 | Tradição afro-brasileira sub-representada |
| cabala | 5 | Tradição judaica (público-alvo principal) |
| astrologia | 5 | Prática complementar comum |
| tantra | 5 | Prática complementar |

A ordem reflete decisão editorial Wave 32: priorizar diversidade +
eixo pessoal do projeto.

---

## 7. Email Templates

5 templates novos (W32), todos com tom Iyá + LGPD-compliant:

| Template | Quando | Subject | Tom |
|---|---|---|---|
| `waitlist-welcome` | Logo após signup | `✦ Você está dentro — posição #N na fila do beta` | Acolhedor, ancorado em tradição |
| `waitlist-confirmation` | Logo após clicar no link de confirmação | `✓ Email confirmado — sua posição subiu para #N` | Validador, motivador para compartilhar |
| `waitlist-reminder` | 7 dias sem confirmar | `Sua vaga na fila ainda está esperando — confirme` | Leve, sem culpa, com opt-out claro |
| `waitlist-wave-invite` | Quando admin envia invite | `🌀 Você está dentro — bem-vindo(a) à onda N` | Solene, reconhece a jornada |
| `waitlist-wave-closed` | Quando uma onda enche e o lead ficou de fora | `A Onda N lotou — sua próxima chance em X dias` | Transparente, oferece caminho (indications) |

Todos têm:
- Unsubscribe footer (link `?token=...&type=waitlist`)
- Layout `marketing` (footer completo) ou `transactional` (wave-invite)
- Versão text fallback (clientes sem HTML)
- Preheader (preview na inbox)

---

## 8. Painel Admin (`/admin/waitlist`)

### 8.1 Stats Dashboard (4 cards)

1. **Total na fila** — leads únicos capturados
2. **Confirmados** — com % de conversão
3. **Vagas restantes** — visual de urgency
4. **Top tradição** — insight rápido de demanda

### 8.2 Wave Breakdown

3 barras de progresso (Onda 1 / 2 / 3) mostrando `filled / size` e % cheio.
Baseado em score (top-N confirmados vão para Onda 1, próximos para Onda 2, etc).

### 8.3 Distribuição por Tradição

Bar chart horizontal com todas as tradições, ordenado por count.
Mostra demanda relativa — útil para priorizar conteúdo do beta.

### 8.4 Filtros

- **Busca**: por email ou nome
- **Status**: pending / confirmed / invited / accepted / rejected / unsubscribed
- **Tradição**: 7 opções canônicas
- **Ordenação**: score desc/asc, recent, oldest

### 8.5 Ações Inline

- **Send invite (W1 / W2)** — botão visível apenas para status `confirmed`
  - Gera invite token (7 dias de validade)
  - Marca lead como `invited`
  - Envia email `waitlist-wave-invite` via Resend
  - Dispara webhook `invite_sent`
- **Reject** — botão visível para qualquer status exceto `accepted`/`unsubscribed`
- **CSV export** — botão global, exporta todos os leads filtrados
  - Colunas: position, email, displayName, tradition, profile, status, score,
    referralCount, referredBy, lgpdConsent, marketingConsent, source,
    createdAt, updatedAt
  - File name: `waitlist-YYYY-MM-DD.csv`

---

## 9. Rate Limiting e Segurança

### 9.1 Rate limit (3 req/IP/hora)

Sliding window de 1h, persistido em `data/waitlist-rate-limit.json`.
Resposta:
- `429 Too Many Requests`
- Header `Retry-After: <segundos>`
- Body: `{ ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos.", retryAfter: "<iso>" }`

### 9.2 Honeypot

Campo `website` escondido no form. Se preenchido = bot = descarta request
sem nem chamar a API. Legado do W20 — mantido.

### 9.3 Tokens

| Token | Tipo | Validade | Uso |
|---|---|---|---|
| confirmToken | HMAC 64-char hex | 7 dias | Confirmar email após signup |
| inviteToken | HMAC 64-char hex | 7 dias | Aceitar invite (auto-cadastro) |

Ambos são `null` após uso (one-shot). Gerados via `crypto.getRandomValues(32 bytes)`.

### 9.4 LGPD

- Consent checkbox **obrigatório** (`z.literal(true)` no schema → não passa)
- `marketingConsent` separado e opcional
- Email sempre hasheado em analytics (função `hashEmail()` retorna `h_<base36>`)
- Webhook Zapier/Make envia `email_hash`, nunca email cru
- Unsubscribe footer presente em todos os emails marketing
- `/privacidade` linkado explicitamente no form (Art. 9 — direito de informação)

### 9.5 Admin auth

- Header `x-admin-token` obrigatório para PATCH (exceto `action=confirm`)
- Token vem de `process.env.ADMIN_API_TOKEN`
- `NEXT_PUBLIC_ADMIN_TOKEN` exposto ao client para o dashboard (escopo:
  apenas leitura via GET — não permite mutations além do que PATCH admin
  já permite; tradeoff entre UX e segurança aceito em beta)

---

## 10. Webhook (Zapier/Make)

`process.env.WAITLIST_WEBHOOK_URL` (opcional). Se configurada, todo evento
dispara um POST com payload JSON:

```json
{
  "event": "waitlist_joined",  // waitlist_joined | waitlist_confirmed | invite_sent | invite_accepted
  "timestamp": "2026-06-30T15:23:00Z",
  "data": {
    "email": "h_abc123",  // SEMPRE hash, nunca email cru
    "position": 7,
    "tradition": "cigano",
    "score": 10
  }
}
```

Timeout de 5s (AbortSignal.timeout). Best-effort — falhas não quebram o signup.

Casos de uso:
- Zapier → Notion (CRM manual de leads quentes)
- Zapier → Google Sheets (planilha compartilhada de leads)
- Make → Slack (`#beta-leads` notificação em tempo real)

---

## 11. Analytics — Funil Completo

Eventos rastreados (PostHog via `events.ts`):

| Evento | Quando | Properties |
|---|---|---|
| `validation_page_viewed` | Usuário vê `/validacao` | source, variant |
| `validation_cta_clicked` | Usuário clica no hero CTA | (no properties) |
| `waitlist_form_started` | Step 1 visível | source |
| `waitlist_step_completed` | Avança de step | step (1-5), source |
| `waitlist_joined` | POST /api/waitlist 200 | tradition, score, position |
| `waitlist_already_joined` | Idempotent hit | email_hash |
| `waitlist_confirmed` | Clica link de confirmação | email_hash |
| `waitlist_invite_sent` | Admin envia invite | wave, email_hash |
| `invite_accepted` | Lead clica magic-link | email_hash |
| `waitlist_unsubscribed` | Sai da fila | email_hash |

**Funnel esperado** (referência):

```
visit (100%)
  ↓ ~70%
form_start
  ↓ ~85%
step_1_complete (email)
  ↓ ~95%
step_2_complete (nome)
  ↓ ~95%
step_3_complete (tradição)
  ↓ ~95%
step_4_complete (perfil)
  ↓ ~85%
step_5_complete (LGPD + submit)
  ↓ 100%
api_join_success
  ↓ ~60%
confirmation_clicked
  ↓ ~50%
invite_accepted
```

Drop-offs por step permitem identificar friction point. Esperado: Step 5
(LGPD consent) ter o maior drop (15-20%) — aceitável, indica qualidade do lead.

---

## 12. Persistência

### 12.1 Por que JSON local?

- Volume esperado: ≤500 leads nos próximos 2 meses
- Latência de leitura: <2ms (fs.readFile de 50KB)
- Latência de escrita: <5ms (writeFile sync JSON)
- Zero infra (sem DB, sem migrations, sem backup automático)
- Backup manual via git ou cron de tar.gz

### 12.2 Quando migrar para Prisma?

Triggers:
- Leads > 1000 (search/filter fica lento em memória)
- Múltiplos writers concorrentes (risco de race condition no JSON)
- Necessidade de queries complexas (joins com users, posts)
- Auditoria formal (LGPD Art. 37 — registro de operações)

### 12.3 Schema Prisma proposto (W33)

```prisma
model WaitlistLead {
  id                String   @id @default(uuid())
  email             String   @unique
  displayName       String?
  tradition         TraditionSlug?
  profile           ProfileSlug?
  lgpdConsent       Boolean
  marketingConsent  Boolean  @default(false)
  status            LeadStatus @default(PENDING)
  score             Int      @default(0)
  referralCount     Int      @default(0)
  referredBy        String?
  confirmToken      String?  @unique
  inviteToken       String?  @unique
  confirmExpiresAt  DateTime?
  inviteExpiresAt   DateTime?
  source            String?
  utm               Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  acceptedAt        DateTime?
  rejectedAt        DateTime?

  @@index([status, score])
  @@index([tradition])
}

enum TraditionSlug {
  CIGANO
  CANDOMBLE
  UMBANDA
  IFA
  CABALA
  ASTROLOGIA
  TANTRA
}

enum ProfileSlug {
  CURIOSO
  INICIANTE
  PRATICANTE
  MESTRE
}

enum LeadStatus {
  PENDING
  CONFIRMED
  INVITED
  ACCEPTED
  REJECTED
  UNSUBSCRIBED
}
```

---

## 13. LGPD Compliance Checklist

- [x] **Art. 7º, I** — Consentimento explícito para tratamento de dados
  (checkbox obrigatório no step 5, schema `z.literal(true)`)
- [x] **Art. 9º** — Informação clara sobre tratamento (link Política de Privacidade,
  explicação do que acontece após signup)
- [x] **Art. 18** — Direito de revogação (unsubscribe em todos os emails,
  ação `unsubscribe` na API)
- [x] **Art. 20** — Direito de acesso (admin pode ver todos os dados do lead)
- [x] **Art. 37** — Registro de operações (audit log via events-catalog + webhook)
- [x] **Art. 46** — Medidas de segurança (rate limit, tokens HMAC, honeypot,
  sem logs de email cru)

Pendências para W33:
- [ ] Export de dados do lead (Art. 18, V) — endpoint `GET /api/me/data-export`
- [ ] Deleção completa (Art. 18, VI) — endpoint `DELETE /api/me`
- [ ] DPO nomeado e contato visível na Política de Privacidade

---

## 14. Accessibility (WCAG AA)

- [x] Todos os inputs têm `label` ou `aria-label`
- [x] Erros com `role="alert"` (lidos por screen readers)
- [x] Botões com 44×44px touch target (mínimo WCAG 2.5.5)
- [x] Contraste mínimo 4.5:1 em texto normal (slate-100 em slate-950 = 18:1)
- [x] Foco visível com `focus:ring-2 focus:ring-amber-400/20`
- [x] Radio groups com `role="radiogroup"` + `aria-checked`
- [x] Progress indicator com `aria-hidden` (decorativo)
- [x] Skip-to-content link (legado W24)
- [x] Form com `aria-label` global

---

## 15. Performance

### Bundle size (estimado)

- `WaitlistForm.tsx`: ~14KB minified (5 sub-components inline)
- `ConfirmClient.tsx`: ~3KB minified
- `/admin/waitlist`: ~8KB (Tabela + filtros)
- API routes: server-only, zero impacto no bundle

### LCP / FID esperado

- Landing `/validacao`: LCP <2.5s (já otimizada em W24)
- `/admin/waitlist`: LCP <3s (data table), FID <100ms

### Rate limit + cold start

`data/waitlist.json` é pequeno (≤100KB esperado). fs.readFile não bloqueia
event loop significativamente. Não requer warming.

---

## 16. Métricas de Sucesso (KPIs Wave 32)

| Métrica | Baseline (W20) | Target (W32) |
|---|---|---|
| Conversion rate (visit → join) | 3-5% | 6-8% |
| Email confirmation rate | (não rastreado) | ≥50% |
| Form abandonment per step | (não rastreado) | <10% |
| Multi-step completion (visit → submit) | n/a | ≥50% |
| Wave 1 fill (top-10 confirmados) | n/a | ≤21 dias |
| Admin time to invite (manual) | n/a | ≤2 min |
| LGPD consent refusal | n/a | <5% |

Tracked via PostHog dashboard (criar `Waitlist W32` board).

---

## 17. Roadmap Wave 33+

### W33 — Prisma migration + auto-cadastro

- [ ] Schema Prisma + migration (modelo em §12.3)
- [ ] Backfill de `data/waitlist.json` para a tabela
- [ ] `/api/waitlist/accept-invite` cria User automaticamente (sem precisar de signup manual)
- [ ] Endpoint de export de dados (LGPD Art. 18, V)
- [ ] Endpoint de deleção de conta (LGPD Art. 18, VI)
- [ ] Notification center in-app para invite expirado

### W34 — A/B test do multi-step

- [ ] Variant E: single-step (todos campos visíveis) — baseline de comparação
- [ ] Variant F: só email (minimo viable, sem tradição/perfil)
- [ ] Variant G: tradição primeiro (engajamento vs fricção)
- [ ] Métrica alvo: identificar o sweet spot de fields-per-step

### W35 — Referral program estruturado

- [ ] Landing `/convite/<code>` com copy personalizada
- [ ] Tabela de bonuses (X indicados = acesso antecipado)
- [ ] Leaderboard público (opt-in) para early adopters
- [ ] Integração com ShareAPI nativa do browser

### W36 — SMS opt-in para lembretes

- [ ] Twilio integration para reminder via SMS (não-email)
- [ ] Opt-in separado (LGPD Art. 7º, IV)
- [ ] Custo: ~R$0,10/SMS Brasil — verificar ROI vs email

---

## 18. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| JSON corrompido (escrita parcial) | Baixa | Alto | Try/catch em `readWaitlist()` recria vazio + log de erro. W33 migra para Prisma. |
| Bot signup em massa | Média | Médio | Rate limit (3/IP/h) + honeypot + LGPD consent (bots não marcam). Wave W33 adiciona Cloudflare Turnstile. |
| Email delivery falha (Resend outage) | Baixa | Alto | Stub mode (log only) é fallback automático. W33 adiciona retry com exponential backoff. |
| Lead cria múltiplas contas (1 pessoa, 10 emails) | Média | Baixo | Score considera email único + displayName único + IP similar. W33 adiciona fingerprint browser. |
| LGPD audit falha | Baixa | Crítico | Schema força consent + unsubscribe em todos emails. W33 adiciona export + delete. |
| Admin token leak | Baixa | Crítico | Token é env var (não commit). Rotação documentada. W33 migra para OAuth admin. |

---

## 19. Testing Strategy

### 19.1 Manual smoke test (10 min)

```bash
# 1. Landing
curl -I http://localhost:3000/validacao
# 2. Signup
curl -X POST http://localhost:3000/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"email":"teste@exemplo.com","tradition":"cigano","lgpdConsent":true}'
# 3. Confirm (pegar token do log)
curl -X PATCH http://localhost:3000/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"action":"confirm","email":"teste@exemplo.com","confirmToken":"<token>"}'
# 4. Stats (admin)
curl 'http://localhost:3000/api/waitlist?admin_token=<env-token>'
```

### 19.2 Cenários de borda (admin)

- [ ] Signup com email duplicado → idempotency OK
- [ ] Signup com rate limit → 429 + Retry-After
- [ ] Signup sem LGPD consent → 400 com mensagem clara
- [ ] Confirm com token expirado → 410 Gone
- [ ] Invite com status errado → 400 com mensagem
- [ ] Reject de lead já aceito → 400 com mensagem
- [ ] Admin com token errado → 401
- [ ] CSV export com filtros → arquivo correto

### 19.3 Browser tests (Playwright)

- [ ] Form 5 steps completos
- [ ] LocalStorage persiste entre reloads
- [ ] Botão back funciona
- [ ] LGPD checkbox bloqueia submit
- [ ] Admin dashboard carrega e filtra

---

## 20. Decisões Documentadas

### 20.1 Por que multi-step e não single-page?

**Decisão**: Multi-step (5 etapas).

**Razões**:
1. Captura qualificada (tradição + perfil) sem overwhelming
2. Drop-off por step é menor que drop-off de form longo (regra 60% por etapa)
3. Progress indicator dá sensação de avanço (gamificação)
4. LGPD consent fica no último step (consentimento explícito + tempo para revisar)

**Tradeoff aceito**: 1 clique extra vs. dados mais ricos. Em beta, qualidade > volume.

### 20.2 Por que tradição cigano primeiro?

**Decisão**: Cigano = score base 10 (maior).

**Razões**:
1. **Eixo do projeto** — Baralho Cigano Ramiro é o método pessoal do fundador
2. **Diferenciação** — apps generalistas ignoram cigano; ser o "lar cigano" tem valor estratégico
3. **Curadoria** — beta com 50 vagas precisa ter identidade clara

**Tradeoff aceito**: Comunidade Cabala/Umbanda pode se sentir secundária. Mitigação: o score base alto de cigano é compensado pelos bônus de confirmação + referral (qualquer tradição confirmada com 2 indicações empata cigano puro).

### 20.3 Por que JSON e não DB?

**Decisão**: `data/waitlist.json` até W33.

**Razões**:
1. Volume esperado (≤500 leads) cabe em memória
2. Zero infra para configurar/migrar/backup
3. Permite iterar rápido no schema durante o beta

**Quando mudar**: >1000 leads OU múltiplos writers OU auditoria formal.

### 20.4 Por que 3 ondas (10+20+20)?

**Decisão**: Onda 1 (10) → Onda 2 (20) → Onda 3 (20), ~14 dias entre cada.

**Razões**:
1. Onda 1 pequena valida qualidade dos leads (curadoria manual)
2. Onda 2 maior se a coorte 1 der feedback positivo
3. Onda 3 fecha o beta com a maior diversidade
4. Espaço entre ondas permite iterar UX com base em aprendizados

### 20.5 Por que confirmação por email e não telefone?

**Decisão**: Email é o canal de confirmação.

**Razões**:
1. Email é o que coletamos no signup (zero friction extra)
2. LGPD compliance é mais simples para email (base legal mais clara)
3. Custo: email via Resend ≈ R$0,0001/lead; SMS Twilio ≈ R$0,10/lead

**W36 pode adicionar SMS como canal opcional.**

---

## 21. File Inventory (Wave 32)

### Created

- `src/components/validation/WaitlistForm.tsx` (refactor, 30KB)
- `src/app/api/waitlist/route.ts` (rewrite, 26KB)
- `src/app/api/waitlist/accept-invite/route.ts` (new, 3.5KB)
- `src/app/validacao/confirmar/page.tsx` (new, 2.2KB)
- `src/app/validacao/confirmar/ConfirmClient.tsx` (new, 8.5KB)
- `src/app/admin/waitlist/page.tsx` (new, 1.8KB)
- `src/app/admin/waitlist/WaitlistAdminDashboard.tsx` (new, 21KB)
- `src/lib/email/templates/waitlist-welcome.ts` (5.7KB)
- `src/lib/email/templates/waitlist-confirmation.ts` (4.3KB)
- `src/lib/email/templates/waitlist-reminder.ts` (5.8KB)
- `src/lib/email/templates/waitlist-wave-invite.ts` (5.3KB)
- `src/lib/email/templates/waitlist-wave-closed.ts` (5.3KB)
- `docs/WAITLIST-BETA-W32.md` (this file)

### Modified

- `src/lib/email/templates/index.ts` — 5 novos templates registrados
- `src/lib/email/layout.ts` — `renderCta` agora aceita `secondary: boolean`
- `src/lib/analytics/events.ts` — 7 novos eventos do funil
- `src/components/admin/AdminNav.tsx` — entrada "Waitlist" adicionada

---

## 22. Operational Runbook

### Como adicionar uma nova tradição?

1. Editar `CANONICAL_TRADITIONS` em `src/app/api/waitlist/route.ts`
2. Adicionar label em `TRADITIONS` em `src/components/validation/WaitlistForm.tsx`
3. Adicionar entry em `TRADITION_LABELS` em:
   - `src/lib/email/templates/waitlist-welcome.ts`
   - `src/lib/email/templates/waitlist-reminder.ts`
   - `src/app/admin/waitlist/WaitlistAdminDashboard.tsx`
4. Decidir score base em `TRADITION_BASE_SCORE` no route.ts
5. Atualizar este doc (§6 e §20.2)

### Como disparar um reminder em massa?

```bash
# Iterar leads com status='pending' e createdAt < now-7d
# Chamar PATCH /api/waitlist com action='send_invite' (não — reminder!)
# Reminder precisa de novo template/endpoint — ver §17 W33
```

(Não implementado em W32 — reminder só via cron do W33+)

### Como exportar leads?

1. Login em `/admin/waitlist`
2. Aplicar filtros desejados
3. Clicar em **CSV** (botão global)
4. Arquivo `waitlist-YYYY-MM-DD.csv` baixa automaticamente

### Como rotacionar ADMIN_API_TOKEN?

1. Gerar novo token (openssl rand -hex 32)
2. Atualizar `.env` local e prod
3. Atualizar `NEXT_PUBLIC_ADMIN_TOKEN` (frontend)
4. Restart do server
5. Documentar em `docs/SECRETS-ROTATION.md` (criar se não existir)

---

## 23. References

- [W16 — Plano de beta em 3 ondas](./PLAN-BETA-W16.md)
- [W20 — Landing validation](./VALIDACAO-LANDING.md)
- [W18 — Analytics catalog](./ANALYTICS-CATALOG-W18.md)
- [W20 — Email system architecture](./EMAIL-SYSTEM-W20.md)
- [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [PostHog capture API](https://posthog.com/docs/api/capture)

---

**Owner**: Tomás (PM) + Coder (implementação)
**Reviewers**: Ravena (QA), Caio (Security/LGPD), Lina (UX)
**Wave**: 32 (2026-06-30)
**Next review**: End of Wave 33 (after Prisma migration)