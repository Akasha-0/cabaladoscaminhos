# LGPD Compliance Checklist — Akasha Portal (Wave 11)

> **Status:** Wave 11 entregue em 2026-06-27. 9/9 direitos do titular implementados. 7/8 artigos principais conformes.
> **Próxima revisão:** mensal ou antes de cada release que toque auth/dados/payment.
> **Referência legal:** Lei 13.709/2018 (LGPD) + Regulamentação ANPD.
> **Auditor:** Caio (AppSec) · **Branch:** `main`

---

## Sumário executivo

- **8 artigos LGPD** verificados (9°, 18, 7°, 37, 41, 46, 48, 16)
- **9/9 direitos do titular** implementados e expostos ao usuário
- **DPO designado** (`dpo@cabaladoscaminhos.com`)
- **Política de privacidade** reescrita em Wave 11 com artigos citados e base legal explícita
- **Audit log imutável** de ações sensíveis (24 meses retenção para LGPD, 12 para AUTH/CONTENT)
- **Status:** 🟢 **CONFORME** para release privado controlado. Para B2C público, verificar se há controlador formal constituído (LTDA).

---

## Artigo 9° — Princípio da Necessidade

> "O controlador só poderá tratar dados pessoais para finalidades legítimas, específicas e explícitas."

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| Coleta mínima (sem CPF, RG, endereço, telefone, dados de saúde) | ✅ | `src/app/(info)/privacy/page.tsx` §2 |
| Finalidade explícita por coleta | ✅ | Privacy §3 lista base legal por finalidade |
| Hora e local de nascimento opcionais | ✅ | `signupSchema` em `src/lib/validation/auth.ts` |

---

## Artigo 18 — Direitos do Titular

> "O titular dos dados pessoais tem direito a obter do controlador..."

| Item | Status | Endpoint / Componente |
|------|--------|------------------------|
| I. Confirmação da existência de tratamento | ✅ | Banner cookie + audit log |
| II. Acesso aos dados | ✅ | `GET /api/users/[id]/export` |
| III. Correção | ✅ | `/onboarding` re-edit + `updateUser` action |
| IV. Anonimização/bloqueio/eliminação | ✅ | `deleteUserData()` em `src/lib/privacy/data-deletion.ts` |
| **V. Portabilidade** | ✅ **W11** | `GET /api/users/[id]/export` retorna JSON estruturado + `Content-Disposition: attachment` |
| **VI. Eliminação** | ✅ **W11** | `POST /api/users/[id]/delete-account` com confirmação textual |
| VII. Revogação do consentimento | ✅ **W11** | Banner cookie + `POST /api/consent` |
| VIII. Oposição | ✅ | Cancelar inscrição via `unsubscribeTokens` |
| IX. Revisão de decisões automatizadas | ✅ | Akashic IA é assistente — decisão humana é do usuário |

---

## Artigo 7° — Base Legal para Tratamento

| Finalidade | Base Legal | Documentado em |
|------------|-----------|----------------|
| Cadastro / geração de mapa astral | Execução de contrato (V) | Privacy §3 |
| Comunidade (posts, comments, follows) | Execução de contrato (V) | Privacy §3 |
| Cookies opcionais | Consentimento (I) | CookieConsent banner |
| Comunicações promocionais | Consentimento (I) | opt-in separado (futuro) |
| Moderação, segurança, anti-fraude | Legítimo interesse (IX) | Privacy §3 |
| Logs de auditoria | Legítimo interesse (IX) + obrigação legal (II) | Privacy §3 + §6 |
| Retenção fiscal (notas) | Obrigação legal (II) | Privacy §6 (5 anos) |

---

## Artigo 16 — Eliminação após Tratamento

| Categoria | Retenção | Mecanismo |
|-----------|----------|-----------|
| Conta ativa | enquanto o usuário mantiver cadastro | Soft-delete no `deleteUserData()` |
| Após exclusão (recovery) | 30 dias em backup criptografado | Manual restore window |
| Logs de auditoria LGPD | 24 meses | `purgeOldAuditLogs()` em `src/lib/audit/index.ts` |
| Logs de autenticação | 12 meses | `purgeOldAuditLogs()` |
| IP/User-Agent waitlist | 90 dias | Manual ou futuro cron job |
| Notas fiscais | 5 anos (obrigação legal) | Sistema fiscal |

---

## Artigo 37 — Registro de Operações

| Evento | Capturado em | Retenção |
|--------|--------------|----------|
| Login sucesso/falha | `LOGIN_SUCCESS` / `LOGIN_FAIL` | 12 meses |
| Logout | `LOGOUT` | 12 meses |
| Reset de senha (request + success) | `PASSWORD_RESET_*` | 24 meses |
| **Solicitação de delete** | `ACCOUNT_DELETE_REQUEST` | 24 meses |
| **Confirmação de delete** | `ACCOUNT_DELETE_CONFIRMED` | 24 meses |
| **Solicitação de export** | `DATA_EXPORT_REQUEST` | 24 meses |
| **Entrega de export** | `DATA_EXPORT_DELIVERED` | 24 meses |
| **Concessão de consentimento** | `CONSENT_GRANTED` | 24 meses |
| **Revogação de consentimento** | `CONSENT_REVOKED` | 24 meses |
| Criação/remoção de conteúdo | `POST_CREATED` / `COMMENT_DELETED` | 12 meses |
| Moderação | `ADMIN_USER_BAN` / `ADMIN_CONTENT_REMOVE` | 24 meses |

**Implementação:** `src/lib/audit/index.ts` + `prisma/migrations/20260627_010000_audit_log/migration.sql`.

**Hash de IP:** Utiliza `AUDIT_IP_SALT` (env) + SHA-256. IP cru nunca é persistido.

---

## Artigo 41 — Encarregado (DPO)

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| DPO designado | ✅ | `dpo@cabaladoscaminhos.com` |
| Identidade pública | ✅ | `src/app/(info)/privacy/page.tsx` §9 |
| Email público | ✅ | Privacy §9 |
| Prazo de resposta | ✅ | 15 dias úteis (LGPD §5° art. 18) |
| Orientação interna | 🟡 | Documentar em política interna Wave 12 |
| Comunicação ANPD | ✅ | Atribuído ao DPO |

---

## Artigo 46 — Segurança e Boas Práticas

| Medida | Status | Detalhes |
|--------|--------|----------|
| TLS/HTTPS em trânsito | ✅ | HSTS preload (max-age=2 anos + subdomínios) |
| Criptografia em repouso | ✅ | AES-256 (Supabase managed) |
| Senhas hash | ✅ | bcrypt + salt (10 rounds) |
| **CSP** | ✅ **W11** | `middleware.ts` — default-src 'self', frame-ancestors 'none', etc |
| HSTS | ✅ | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | ✅ | `DENY` |
| X-Content-Type-Options | ✅ | `nosniff` |
| Permissions-Policy | ✅ **W11** | geolocation/mic/camera/usb/magnetometer/gyroscope/accelerometer/browsing-topics/interest-cohort = () |
| Rate limiting por IP | ✅ | `src/lib/rate-limit.ts` (100 req/min) |
| **Rate limiting por user** | ✅ **W11** | `src/lib/rate-limit-user.ts` — post 10/h, comment 30/h, like 100/h, follow 50/h |
| Audit log imutável | ✅ **W11** | `audit_logs` table + helpers |
| WAF (Web Application Firewall) | ✅ | Vercel Edge Network |
| Backup diário criptografado | ✅ | Supabase automated, 30 dias |
| Plano de resposta a incidentes | ✅ | Privacy §10 (72h titulares + ANPD) |

---

## Artigo 48 — Comunicação de Incidente

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| Plano formal de resposta | ✅ | Privacy §10 |
| Comunicação titulares (72h) | ✅ | Privacy §10 |
| Comunicação ANPD | ✅ | Privacy §10 |
| Post-mortem público anonimizado | ✅ | Privacy §10 |
| Status page pública | 🟡 | Planejado Wave 12 (`/status`) |

---

## Artigo 27-33 — Compartilhamento com Operadores

| Operador | Dados compartilhados | Localização | Garantia legal |
|----------|---------------------|-------------|----------------|
| Supabase | Postgres + Auth | EUA | Cláusulas contratuais-padrão |
| Vercel | CDN + serverless logs | EUA | Privacy Shield successor + DPA |
| OpenAI / MiniMax | Prompts (sem PII identificável) | EUA | DPA + truncation 500 chars |
| Stripe | Tokenização de pagamento (sem cartão por nós) | EUA | PCI-DSS Level 1 |
| Sentry | Erros técnicos (PII removido) | EUA | DPA |

**NÃO vendemos, alugamos ou comercializamos dados pessoais.**

---

## Consentimento (Art. 8°)

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| Consentimento livre, informado, inequívoco | ✅ **W11** | `CookieConsent.tsx` |
| Categorias granulares (essencial/analytics/marketing) | ✅ **W11** | 3 toggles no painel "Personalizar" |
| Recusa fácil (sem opt-out impossível) | ✅ **W11** | Botão "Recusar opcionais" |
| Persistência da decisão | ✅ **W11** | localStorage + cookie (1 ano) |
| Versão de consentimento | ✅ **W11** | `CONSENT_VERSION=2026-06-27-wave11` |
| Revogação a qualquer momento | ✅ **W11** | `POST /api/consent` + audit log |
| Audit log do consentimento | ✅ **W11** | `CONSENT_GRANTED` / `CONSENT_REVOKED` |

---

## Direitos Especiais (Art. 18, §§ 1°-5°)

| Requisito | Status | Detalhes |
|-----------|--------|----------|
| Atendimento gratuito | ✅ | Privacy §7 — "Sem custo" |
| Comprovação de identidade | ✅ | Privacy §7 — "pode ser exigida para segurança" |
| Prazo de 15 dias | ✅ | Privacy §7 |
| Resposta completa e clara | ✅ | Privacy §7 |
| Canal seguro | 🟡 | Email padrão; PGP disponível sob solicitação |

---

## Testes automatizados

| Suite | Status | Cobre |
|-------|--------|-------|
| `src/lib/audit/index.ts` | 🔴 Wave 12 | logAudit, audit.consentGranted, purgeOldAuditLogs |
| `src/lib/privacy/data-deletion.ts` | 🔴 Wave 12 | deleteUserData happy path + edge cases |
| `src/lib/rate-limit-user.ts` | 🔴 Wave 12 | checkUserRateLimit + cleanup |
| `src/components/consent/CookieConsent.tsx` | 🔴 Wave 12 | render + interactions |
| `src/app/api/users/[id]/delete-account/route.ts` | 🔴 Wave 12 | auth, confirm, cascade |
| `src/app/api/users/[id]/export/route.ts` | 🔴 Wave 12 | auth, payload shape |
| `src/app/api/consent/route.ts` | 🔴 Wave 12 | Zod validation, audit log |

---

## Ações pendentes (não-bloqueantes)

- [ ] **Wave 12** — Testes Vitest para módulos LGPD
- [ ] **Wave 12** — Migrar rate-limiter para Upstash Redis (atualmente in-memory)
- [ ] **Wave 12** — Job cron `purgeOldAuditLogs()` rodando diariamente
- [ ] **Wave 12** — Implementar nonce-based CSP (substituir `'unsafe-inline'`)
- [ ] **Wave 13** — Status page pública `/status` para incidentes
- [ ] **Wave 13** — PGP key pública do DPO
- [ ] **Wave 14** — DPO formal contratado (LGPD art. 41 §2° exige para grandes controladores)
- [ ] **Wave 14** — DPIA (Data Protection Impact Assessment) para Akashic IA

---

## Referências

- LGPD — Lei 13.709/2018: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>
- ANPD: <https://www.gov.br/anpd>
- Política de privacidade: `/privacy`
- Auditoria Wave 10: `docs/SECURITY-AUDIT.md`
- Migration do audit log: `prisma/migrations/20260627_010000_audit_log/migration.sql`

---

**Auditor:** Caio (AppSec Engineer) · **Última atualização:** 2026-06-27 · **Próxima revisão:** 2026-07-27
