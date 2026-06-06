# Cycle 509 — COCKPIT_AUTH_BYPASS para dev local

**Date:** 2026-06-04
**Type:** Feature (dev convenience) + investigate login problem
**Branch:** worktree-local

## Contexto

Usuário reportou:
1. Não consegue logar no cockpit.
2. Email de reset de senha não chega (SMTP não configurado / bloqueado).
3. Pediu acesso à dashboard sem login.

Decisão: implementar um bypass temporário controlado por env var
(`COCKPIT_AUTH_BYPASS=true`) que injeta um Operator MOCK (role=ADMIN)
em toda requisição ao cockpit. Permite destravar o trabalho do operador
local sem depender de email/infra de produção.

## Mudanças

**`src/lib/auth/operator-session.ts`**:
- Adicionado bloco `COCKPIT_AUTH_BYPASS` no topo do arquivo
- Constantes: `MOCK_OPERATOR_ID='cockpit-bypass-dev'`, email/nome derivados
- Função `buildBypassOperator()` retorna um `Operator` Prisma-shape com
  role=ADMIN, datas zeradas, sem passwordHash real
- Função `isCockpitAuthBypassEnabled()` (exportada) — checked em ambos
  `getOperatorFromRequest` e `getOperatorFromServerContext` como
  **precedência #0** (ganha de cookie JWT e dev header)
- Hard-refused em `NODE_ENV=production` mesmo se a var vazar
- Documentado como dev-only no header do arquivo

**`src/app/cockpit/layout.tsx`**:
- Importa `isCockpitAuthBypassEnabled`
- Renderiza banner vermelho no topo de toda página cockpit quando bypass
  ativo (com `data-testid="cockpit-auth-bypass-banner"` + `role="alert"`)
- Mostra `NODE_ENV` atual no banner — torna impossível esquecer

**`.env.example`**:
- Documentada a var `COCKPIT_AUTH_BYPASS=true` na seção "Dev / Testing Only"
- Com comentário explicando uso + safety net de produção

## Como usar (para destravar o dev)

1. Em `.env.local`: `COCKPIT_AUTH_BYPASS=true`
2. `npm run dev` (restart do server)
3. Acessar `/cockpit` direto — login bypassado, banner vermelho visível
4. **Reverter**: unset a var + restart

## Validação

- `npx tsc --noEmit` → 0 erros
- `npm run test:run` → **8738 passed** | 29 skipped | 0 failing
  (vs. baseline 8716 — bate com testes anteriormente skipped/skipping)
- Banner testável por `data-testid="cockpit-auth-bypass-banner"`

## Problema raiz NÃO resolvido (registrado)

Email de reset de senha não chega. Possíveis causas a investigar
no próximo ciclo (não escopo deste):

- [ ] SMTP provider não configurado em `.env`/`.env.local`
  (procurar `SMTP_*`, `RESEND_*`, `SENDGRID_*`, `MAILGUN_*`)
- [ ] Serviço de email em sandbox dev só envia para emails
  verificados (Resend/SendGrid free tier)
- [ ] Email cai em spam — verificar cabeçalhos
- [ ] Rate-limit do provedor atingido
- [ ] `EMAIL_FROM` não verificado no domínio

Sugestão: rodar `grep -r "sendEmail\|sendPasswordReset\|mailer" src/`
para localizar o transporter e investigar credenciais/transport.

## Pré-existentes registrados (não escopo)

- `_global-error` prerender fail (Next 16) — cycle-489b
- Lint warnings 562 (pre-existing unused-vars noise)
- 13 login-route mock pollution (cycle-508) → resolvido, 0 failing agora

## Lições

- Bypass de auth **deve** ter visual indicator (banner) — sem ele,
  é fácil esquecer que auth está off e levar mock pra prod por acidente.
- Precedência de auth sources: mock bypass > cookie JWT > dev header.
- Hard-refusal em `NODE_ENV=production` é safety net barata; não confiar
  só em flag value.
