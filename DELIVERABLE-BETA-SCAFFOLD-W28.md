# DELIVERABLE — Beta Landing Scaffold · Wave 28

> **Sessão:** 414124944695386 (Coder root)
> **Wave:** 28 — Beta Launch (pre-work dry-run)
> **Status:** ✅ **DELIVERED**
> **Data:** 2026-06-28
> **Trigger:** Coordinator W27 (sessão 414124111171840) finalizou push readiness + identificou Coder como owner do pre-work `/beta/page.tsx`.

---

## TL;DR

Scaffold completo da landing `/beta` para o beta privado de 50 vagas em 3 ondas. Página mobile-first com 6 seções, formulário white-glove de 5 campos, suporte a magic-link tokens via `?token=` e `?wave=1|2|3`, SEO metadata completa, e tracking via PostHog. **Tudo passou em TSC + ESLint.**

**O que está pronto:**
- ✅ `/beta` rota montável em preview (não depende de push W27)
- ✅ Copy alinhada com `docs/BETA-LAUNCH-PLAYBOOK.md` (Wave 16)
- ✅ Form white-glove com 5 campos (nome, email, perfil, tradição, intenção)
- ✅ Magic link detection: `?token=...&wave=...` exibe banner "Convite pessoal"
- ✅ Mobile-first responsivo (320px → desktop), touch targets ≥ 44px
- ✅ A11y básica: labels, role="radiogroup", aria-live, role="alert"
- ✅ LGPD: copy explícita + Lock icon + email link de contato

**O que NÃO está pronto (escopo intencional):**
- ⏳ `/api/beta/invite/route.ts` (magic-link validator) — Owner Coder, Wave 28 Day 1+
- ⏳ Schema estendido `/api/waitlist` (campos extras) — workaround: metadata via JSON field
- ⏳ Validação visual em browser (sandbox bloqueia dev server)
- ⏳ Tag `v0.3.0` + deploy prod (owner-only, depende W27 push)

---

## 📂 Arquivos Criados

| Arquivo | Linhas | Propósito |
|---|---:|---|
| `src/app/beta/page.tsx` | 536 | Server component: metadata + hero + 5 seções + form embed |
| `src/components/beta/BetaSignupForm.tsx` | 403 | Client component: form 5-campos + estados (idle/submitting/success/error) |

**Total:** 939 linhas adicionadas, 0 removidas.

---

## 🎨 Estrutura da Página

### 1. Hero (acima da fold)
- Badge: "Beta privado · Onda ? · 50 vagas"
- Headline: "A primeira comunidade **universalista** de espiritualidade do Brasil"
- Sub: copy de valor (Cabala + Ifá + Tantra + Astrologia + Xamanismo + IA)
- Social proof: 1.200+ waitlist · 50+ artigos · 8 tradições
- CTA: scroll-suave para `#inscricao`
- Microcopy: "100% gratuito · Sem spam · LGPD"

### 2. Como funciona (4 fases + 3 ondas)
- 3 cards de onda (Onda 1: 10 pioneiros / Onda 2: 20 expansão / Onda 3: 20 comunidade)
  - Onda detectada via `?wave=` ganha ring amber + visual "ativa"
- 4 phases numeradas (Pre-launch / Convite / Onboarding / Co-evolução)
  - Cada uma com timeline (T-30 → T+30) + descrição

### 3. O que você recebe (6 benefícios)
- 1-on-1 30min · Canal #feedback · Mapa espiritual · IA tradutora · Comunidade curada · Badge Beta Pioneer
- Cada um com ícone + cor (amber/violet/emerald/pink)

### 4. Quem está por trás
- Avatar Unicode (🜂)
- Bio curta: "Fundador-operator, não CEO. Akasha é projeto pessoal, não startup."
- Stack de tradição cigana Ramiro + engenharia de software
- 2 CTAs: Manifesto + VISION.md

### 5. Princípios (8 do BETA-LAUNCH-PLAYBOOK.md)
- Escassez honesta · White-glove sempre · Diversidade · Co-evolução · Sem guru · Mobile-first · Transparência · Respeito
- Numeração monospace amber + descrição caption

### 6. Formulário de Inscrição (`#inscricao`)
- Hero adaptativo: "Confirme seu convite" vs "Entre na fila"
- **BetaSignupForm** (componente client, abaixo)

### 7. CTA Final + Footer mínimo
- ShieldCheck icon + copy LGPD + email `beta@akasha.portal`

---

## 📝 Formulário (BetaSignupForm)

### Campos (5)

| # | Campo | Tipo | Required | Por quê |
|---|---|---|:---:|---|
| 1 | Nome completo | text | ✅ | Personalização do 1-on-1 (PM chama pelo nome) |
| 2 | Email | email | ✅ | Confirmação + envio do convite |
| 3 | Como você se descreve? | radio cards (4) | ✅ | Mix VISION §3 (Buscador/Praticante/Acadêmico/Curador) |
| 4 | Tradição favorita | select (9 opções) | — | Segmentação Fase 2 do playbook |
| 5 | Por que quer entrar? | textarea | — | Qualitative data para o PM ler |

### UX

- **Mobile-first:** single column < 640px, 2-column grid para radio cards em ≥ 640px
- **Touch targets:** todos os inputs `h-11` (44px), botão submit `h-12` (48px)
- **Magic link banner:** se `?token=` presente, banner amber com "Convite pessoal · Onda ? · Token válido por 7 dias"
- **Estados:** idle / submitting (Loader spinner) / success (verde com CircleCheck) / error (vermelho com CircleAlert)
- **A11y:** `<label htmlFor>` em todos · `role="radiogroup"` · `aria-checked` · `aria-live="polite"` no success · `role="alert"` no error · `aria-invalid` em email
- **LGPD:** copy explícita "Seus dados ficam no nosso servidor (LGPD). Usamos só para o beta — sem spam, sem venda."

### Validação

| Campo | Regra | Mensagem |
|---|---|---|
| Nome | trim non-empty | "Por favor, informe seu nome completo." |
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Email inválido." |
| Perfil | one of 4 valores | "Por favor, escolha um perfil." |
| Tradição | any (inclui vazio) | — (optional) |
| Intenção | ≤ 500 chars | contador exibe "X/500" |

### Persistência

**Por enquanto:** POST `/api/waitlist` com:
```ts
{
  email: string,
  source: 'beta-landing' | 'beta-magic-link',
  metadata: {
    name: string,
    profile: 'buscador'|'praticante'|'academico'|'curador',
    tradition: string | null,
    intent: string | null,
    inviteToken: string | null,
    wave: '1'|'2'|'3'|null,
  },
}
```

**Limitação conhecida:** schema atual do `/api/waitlist/route.ts` (zod) aceita só `email`, `source`, `referrer`, `utm`. O `metadata` é enviado mas silenciosamente descartado até schema ser extendido. **Workaround:** usuário entra na waitlist genérica, e PM faz merge manual com planilha `beta-users.md` (já prevista no playbook §3.1).

### Tracking

```ts
trackEvent('page_viewed', {
  path: '/beta-signup-success',
  query: { source, profile, wave },
});
```

Helper `trackEvent` já validado por zod schema em `events-catalog.ts` (categoria: navigation, sensitivity: none — LGPD-safe).

---

## 🔍 Verificação

### TSC (targeted)
```bash
cd /workspace/cabaladoscaminhos
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "src/app/beta|src/components/beta"
# → (zero matches) ✅
```

**Resultado observado nesta sessão:**
```
$ npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "src/app/beta|src/components/beta"
$ echo $?
1   # grep "no matches" exit 1 = o que queremos
```

Único erro pré-existente (não relacionado): `node_modules/csstype/index.d.ts:6385` — bug conhecido do csstype em alguma versão, não impacta runtime nem meus arquivos.

### ESLint (targeted)
```bash
npx eslint src/app/beta/page.tsx src/components/beta/BetaSignupForm.tsx --no-warn-ignored
# → (zero output, exit 0) ✅
```

**Resultado observado nesta sessão:**
```
$ npx eslint src/app/beta/page.tsx src/components/beta/BetaSignupForm.tsx
$ echo $?
0
```

### Notas sobre ícones

3 ícones do `lucide-react` foram **renomeados** em versões recentes (a v0.x deste projeto):

| Original (v0.x antigo) | Atual (v0.x novo) |
|---|---|
| `Loader2` | `Loader` |
| `CheckCircle2` | `CircleCheck` |
| `AlertCircle` | `CircleAlert` |

Todos os 18 ícones usados foram validados contra `node_modules/lucide-react/dist/esm/icons/index.mjs` antes do commit (ver `bash for icon in ... loop` no histórico desta sessão).

---

## 📋 Pendências (fora de escopo deste scaffold)

### `/api/beta/invite/route.ts` (Magic link validator)
**Owner:** Coder · **ETA:** 2-3h · **Quando:** Wave 28 Day 1+

Schema proposto:
```ts
// POST /api/beta/invite
// Body: { token: string, action: 'validate' | 'redeem' }
// Response: { valid: boolean, wave?: 1|2|3, expiresAt?: ISO, error?: string }

// Storage: tabela Prisma `BetaInvite` (token, wave, redeemedBy, expiresAt, createdAt)
// Token: UUID v4 + HMAC signature (anti-tamper)
// TTL: 7 dias (configurável)
// Rate limit: 10 req/min por IP (reusar middleware global)
```

Dependências:
- Migration Prisma para `BetaInvite`
- Secret `BETA_INVITE_SECRET` em `.env` (não commitar)
- Email sender (Resend) configurado para envio Day 0

### Schema estendido `/api/waitlist/route.ts`
**Owner:** Coder · **ETA:** 1h · **Quando:** Wave 28 Day 1+

```ts
// Atualizar zod schema para aceitar `metadata: z.object({...}).optional()`
// Persistir em data/waitlist.json (mesmo arquivo, formato backward-compatible)
// Ou migrar para Prisma `WaitlistEntry.metadata Json`
```

### OG image `/public/og/beta.png`
**Owner:** Designer (Lina) · **ETA:** 30min · **Quando:** Wave 28 Day 1

Especificação:
- 1200×630px
- Headline "Beta Akasha · 50 vagas"
- Visual: gradient amber/violet + texto serif
- Output: PNG otimizado < 200KB

### Verificação visual em browser
**Owner:** Verifier · **ETA:** 30min · **Quando:** Wave 28 Day 1

Checklist:
- [ ] Renderiza em `/beta` sem erros no console
- [ ] Mobile (375px, 414px) — single column, sem horizontal scroll
- [ ] Tablet (768px) — radio cards em 2-col
- [ ] Desktop (1280px+) — max-width 4xl centralizado
- [ ] `?token=test-uuid&wave=2` mostra banner "Convite pessoal · Onda 2"
- [ ] Form submit → POST `/api/waitlist` → success state
- [ ] Tab navigation funciona (a11y)
- [ ] Screen reader (VoiceOver/NVDA) lê labels corretamente

---

## 🚀 Como testar em preview (após W27 push)

```bash
# Local dev
pnpm dev
# → http://localhost:3000/beta

# Magic link variant
# → http://localhost:3000/beta?token=550e8400-e29b-41d4-a716-446655440000&wave=2

# Staging (após W27 deploy)
# → https://akasha-beta.vercel.app/beta
```

Para smoke test em prod (após tag v0.3.0 + Vercel auto-deploy):
1. Acessar `/beta` → conferir metadata (title, OG image)
2. Submeter form com email descartável (ex: tempmail.com)
3. Verificar se entrada aparece em `data/waitlist.json`
4. Conferir evento PostHog `page_viewed` com path `/beta-signup-success`

---

## 🔗 Referências Cruzadas

- **Spec:** `docs/WAVE-28-PLAN.md` §"Dia 1 — Beta landing page" + §"Entregáveis Wave 28"
- **Copy base:** `docs/BETA-LAUNCH-PLAYBOOK.md` (8 princípios, 4 fases, 3 ondas)
- **Origem:** coordinator W27 sessão 414124111171840 — `docs/PUSH-READINESS-W27.md`
- **Padrões copiados:**
  - Server component + client subcomponent: `src/app/welcome/page.tsx`
  - Metadata + OG: `src/app/validacao/page.tsx`
  - Email capture pattern: `src/components/conversion/InlineEmailCapture.tsx`
  - Tracking helper: `src/lib/analytics/events-catalog.ts`
- **Pendências documentadas em:** WAVE-28-PLAN.md §"Entregáveis" (magic link infra)

---

## ⚠️ Riscos Conhecidos

| # | Risco | Mitigação |
|---|---|---|
| 1 | `/api/waitlist` ignora campos extras do `metadata` | Schema extension é trabalho de Wave 28 Day 1+ (não bloqueia scaffold) |
| 2 | Sem `/api/beta/invite` route, magic link é decorativo | Banner exibe mas form submete como signup orgânico |
| 3 | OG image `/public/og/beta.png` não existe | Metadata referencia path; 404 visual em social previews até Designer criar |
| 4 | Validação visual em browser não foi possível nesta sessão (sandbox) | Verifier roda checklist Day 1+ em preview deploy |
| 5 | Possível collision com parallel Coder session (padrão W24-W27) | Commit atômico por arquivo reduz risco; DELIVERABLE preserva auditoria |

---

## 📦 Commit Status

**Tentativa de commit planejada** (ver §"Next Steps"). Conforme memory 2026-06-27, git operations podem hang em sandbox cabaladoscaminhos. Workaround: documentar comando exato + tentar com timeout curto.

---

## ✅ Definition of Done (escopo deste scaffold)

- [x] Rota `/beta/page.tsx` montável (TSC clean, ESLint clean)
- [x] Metadata completa (title, description, OG, twitter, robots, canonical)
- [x] 6 seções conforme WAVE-28-PLAN.md §Dia 1
- [x] Form white-glove 5 campos com validação
- [x] Magic link detection (`?token=`, `?wave=`, `?ref=`)
- [x] Mobile-first (touch targets ≥ 44px, single column < 640px)
- [x] A11y básica (labels, role, aria-live, aria-invalid)
- [x] LGPD copy explícita + Lock icon
- [x] Tracking PostHog via helper existente
- [x] DELIVERABLE-BETA-SCAFFOLD-W28.md documentando pendências

**Fora de escopo (documentado, não bloqueia):**
- [ ] `/api/beta/invite/route.ts` — Wave 28 Day 1+
- [ ] Schema estendido `/api/waitlist` — Wave 28 Day 1+
- [ ] OG image `/public/og/beta.png` — Designer (Lina) Wave 28 Day 1
- [ ] Visual regression snapshot — Wave 26 infra já tem, adicionar `tests/visual/beta.spec.ts` quando deploy live

---

## 🎯 Próximo Passo Imediato

1. **Tentar commit** dos 2 novos arquivos + DELIVERABLE (com fallback se git hang)
2. **PM Tomás:** redigir `docs/ONBOARDING-WHITE-GLOVE.md` (3h, paralelo)
3. **Growth:** preparar 50 emails `docs/beta-emails/wave-{1,2,3}.md` (4h, paralelo)
4. **Aguardar W27 deploy live** (owner procedure 30min)
5. **Quando live:** subir `/beta` em prod (10min) + smoke test (5min) + cron Wave 1 (`2026-07-02 09:00 UTC`)

**Trigger Wave 28:** owner aciona `#launch-beta` no Slack/Discord quando deploy live confirmado.
