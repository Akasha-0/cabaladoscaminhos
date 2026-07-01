# LGPD COMPLIANCE — Wave 37 / 7.8.0

> **Status:** SHIPPED (commit W37)
> **Wave:** 37 (Compliance Cycle 7/8)
> **Author:** Coder + Caio (security) + Iyá (Curator)
> **Lei:** LGPD Lei 13.709/2018 + regulamentações ANPD
> **Frameworks:** LGPD Art. 5-46, ANPD Resolução CD/ANPD 4/2023, OWASP Top 10 2023, ISO 27701

---

## Sumário

1. [Visão geral e escopo](#1-visão-geral-e-escopo)
2. [Bases legais e princípios](#2-bases-legais-e-princípios)
3. [Mapping LGPD Art. 5-46](#3-mapping-lgpd-art-5-46)
4. [ANPD Resolução 4/2023 — boas práticas](#4-anpd-resolução-42023--boas-práticas)
5. [Consent management granular](#5-consent-management-granular)
6. [Cookie consent UX (LGPD Art. 8°)](#6-cookie-consent-ux-lgpd-art-8)
7. [Privacy policy dinâmica](#7-privacy-policy-dinâmica)
8. [Right to data export (Art. 18, V + Art. 19)](#8-right-to-data-export-art-18-v--art-19)
9. [Right to be forgotten (Art. 18, VI)](#9-right-to-be-forgotten-art-18-vi)
10. [Data minimization (Art. 6°, 9°, 12)](#10-data-minimization-art-6-9-12)
11. [Audit log tamper-evident (Art. 37)](#11-audit-log-tamper-evident-art-37)
12. [Hash chain implementation](#12-hash-chain-implementation)
13. [Retention policy (Art. 16)](#13-retention-policy-art-16)
14. [Auto-redaction de PII em logs](#14-auto-redaction-de-pii-em-logs)
15. [DPO — Encarregado de Proteção de Dados](#15-dpo--encarregado-de-proteção-de-dados)
16. [DPO Dashboard — /admin/lgpd](#16-dpo-dashboard--adminlgpd)
17. [APIs REST LGPD](#17-apis-rest-lgpd)
18. [Schema Prisma — novos models](#18-schema-prisma--novos-models)
19. [Cryptography (Art. 46)](#19-cryptography-art-46)
20. [Consentimento granular — schema JSON](#20-consentimento-granular--schema-json)
21. [Withdrawal flow](#21-withdrawal-flow)
22. [Re-consent quando policy bumpa](#22-re-consent-quando-policy-bumpa)
23. [Transferência internacional (Art. 33)](#23-transferência-internacional-art-33)
24. [Bases legais por finalidade](#24-bases-legais-por-finalidade)
25. [ANPD incident response](#25-anpd-incident-response)
26. [Operação de ofícios ANPD](#26-operação-de-ofícios-anpd)
27. [Compliance report mensal](#27-compliance-report-mensal)
28. [Integração com W34 (security) e W11 (LGPD foundation)](#28-integração-com-w34-security-e-w11-lgpd-foundation)
29. [Testes e cobertura](#29-testes-e-cobertura)
30. [Roadmap Wave 38+](#30-roadmap-wave-38)
31. [Apêndice A — payload de export](#31-apêndice-a--payload-de-export)
32. [Apêndice B — AuditAction enum completo](#32-apêndice-b--auditaction-enum-completo)
33. [Apêndice C — env vars obrigatórias](#33-apêndice-c--env-vars-obrigatórias)
34. [Apêndice D — checklist de auditoria](#34-apêndice-d--checklist-de-auditoria)
35. [Glossário LGPD](#35-glossário-lgpd)

---

## 1. Visão geral e escopo

Este documento descreve a conformidade LGPD completa da plataforma Akasha
Portal implementada em Wave 37 (Compliance 7/8), consolidando o trabalho
de W11 (foundation) e W34 (security hardening) com os novos módulos de
**consentimento granular**, **direito ao esquecimento**, **portabilidade**,
**minimização** e **DPO dashboard**.

### Escopo

- **Controlador:** Akasha Portal Tecnologia Ltda. (CNPJ XX.XXX.XXX/0001-XX)
- **DPO:** Daniel Sobral · dpo@caminhosdosaber.com.br
- **Plataforma:** app web (Next.js 15), Akasha IA, marketplace, mentoria, comunidade
- **Base de titulares:** open beta + 50 usuários ativos + expansão internacional prevista
- **Operador:** Supabase (auth + DB), Stripe (pagamento), Resend (email), Vercel (hosting)

### Não escopo

- Dados de employees / contractors (RH interno)
- Dados de parceiros B2B (não mais aplicável pós-W28 remoção do B2B)

### Princípio de privacy-by-design

Cada nova feature em W37+ deve passar pelo "LGPD checklist":

```
1. Qual a base legal? (Art. 7°)
2. Qual a finalidade? (Art. 6°, I)
3. O dado é necessário? (Art. 6°, II — adequação + Art. 9° necessidade)
4. Como o titular será informado? (Art. 14)
5. Como registrar o consentimento se aplicável? (Art. 8°)
6. Como atender Art. 18? (acesso, correção, exclusão, portabilidade)
7. Como fica no audit log? (Art. 37)
8. Quando expira? (Art. 16)
```

---

## 2. Bases legais e princípios

### Bases legais utilizadas (Art. 7°)

| Base legal | Quando aplicamos | Exemplo |
|------------|------------------|---------|
| **I — Consentimento** | Marketing, analytics, personalização, compartilhamento | Newsletter semanal, métricas PostHog |
| **V — Execução de contrato** | Entrega de conteúdo assinado, processamento de pagamento | Login, feed, Stripe checkout |
| **IX — Legítimo interesse** | Segurança antifraude, melhoria de produto, audit | Hash chain, rate limit, logs de erro |
| **II — Obrigação legal** | Retenção fiscal, cumprimento de ofícios ANPD | Audit log 5 anos |

### Princípios (Art. 6°)

1. **Finalidade** — cada coleta tem propósito explícito e legítimo
2. **Adequação** — formato compatível com a finalidade
3. **Necessidade** — coleta mínima (ver `REQUIRED_FIELDS_BY_PURPOSE`)
4. **Livre acesso** — titular consulta seus dados (export JSON)
5. **Qualidade dos dados** — atualização + correção (Art. 18, III)
6. **Transparência** — privacy policy + cookie banner + DPO dashboard
7. **Segurança** — ver §19 (Cryptography)
8. **Prevenção** — privacy-by-design em cada feature
9. **Não discriminação** — negação de serviço não pode discriminar
10. **Responsabilização** — audit log + DPO + ANPD reporting

---

## 3. Mapping LGPD Art. 5-46

| Art. | Tema | Implementação W37 | Localização |
|------|------|-------------------|-------------|
| **5**  | Definições | Glossário + tipos TypeScript | §35 |
| **6**  | Princípios | `REQUIRED_FIELDS_BY_PURPOSE` + minimização | `src/lib/lgpd/data-minimization.ts` |
| **7**  | Bases legais | Cada consentimento declara base | §24 |
| **8**  | Consentimento | Granular + versionado + revogável | §5, §6 |
| **9**  | Princípio da necessidade | `aggregateAnalyticsOnly()` | `data-minimization.ts` |
| **10** | Boa-fé | — | (princípio geral) |
| **11** | Necessidade de consentimento | Anônimo só com legítimo interesse | `consent.ts` |
| **12** | Minimização | Auto-redaction em logs + aggregate-only | §14 |
| **13** | Informação para criança | — (plataforma 18+) | §menores |
| **14** | Informação ao titular | Privacy policy + cookie banner | §7 |
| **15** | Término de tratamento | `requestDataDeletion()` | §9 |
| **16** | Retenção | Audit 5 anos, soft 30d, hard após | §13 |
| **17** | Processamento posterior | Só para finalidades compatíveis | (auditoria ANPD) |
| **18** | Direitos do titular | 9 direitos cobertos | §8, §9 + `/settings/privacy` |
| **19** | Portabilidade | ZIP JSON + AES-256-GCM | §8 |
| **20** | Conhecimento sobre violação | Email + ANPD em 2 dias úteis | §25 |
| **21** | Indenização | — (seguro D&O) | (jurídico) |
| **22-30** | Órgão controlador | (delegado a DPO) | §15 |
| **31** | Ofício ANPD | Export CSV do audit log | §26 |
| **32-34** | Transferência | SCC + TLS + AES-256 | §23 |
| **35-36** | Boas práticas | OWASP + ISO 27701 + NIST | (W34 §16) |
| **37** | Registro de operações | Audit log com hash chain | §11, §12 |
| **38** | Boas práticas | ISO 27000 + NIST | §28 |
| **39-45** | Autoridade nacional | DPO + canal direto | §15, §26 |
| **46** | Segurança técnica | AES-256-GCM, bcrypt, PBKDF2, TLS 1.3 | §19 |
| **47-50** | Sanções | (auditoria preventiva) | (jurídico) |

---

## 4. ANPD Resolução 4/2023 — boas práticas

A Resolução CD/ANPD nº 4/2023 estabelece "regulamento de boas práticas e
governança para agentes de tratamento". Implementamos:

### 4.1 Programa de privacidade (Art. 4° da Resolução)

- **Política interna** de privacidade aprovada pela diretoria (Q4 2026)
- **Inventário de tratamentos** (RIPD quando necessário)
- **Comitê de privacidade** com DPO + Caio (security) + Iyá (curator) + lead dev
- **Treinamento** anual para todos que lidam com dados pessoais

### 4.2 Padrões mínimos (Art. 5°)

- Medidas de segurança alinhadas com ISO 27001 e NIST Cybersecurity Framework
- Plano de resposta a incidentes (Art. 48 LGPD) — ver §25
- Monitoramento contínuo (audit log + hash chain + verify)

### 4.3 Documentação (Art. 7°)

Este documento + W34 SECURITY-HARDENING + W11 SECURITY-LGPD-CHECKLIST

### 4.4 Direitos do titular (Art. 8° da Resolução)

- Canal único: dpo@caminhosdosaber.com.br
- Resposta em até 15 dias (Art. 18 §5° LGPD)
- Gratuito
- Identificação mínima (email + prova de titularidade)

---

## 5. Consent management granular

### Implementação: `src/lib/lgpd/consent.ts`

```typescript
interface SpecificConsents {
  marketing: boolean;
  analytics: boolean;
  personalization: boolean;
  thirdPartySharing: boolean;
}

interface ConsentRecord {
  userId: string;
  timestamp: Date;
  ipHash: string;       // SHA-256 truncado (32 chars)
  version: string;       // "1.0.0"
  accepted: boolean;
  specificConsents: SpecificConsents;
  withdrawalMethod?: 'SETTINGS' | 'SUPPORT' | 'EMAIL';
  withdrawalDate?: Date;
}
```

### Fluxo

1. **Primeira visita** → CookieConsent banner aparece (1s delay para não atrapalhar LCP)
2. **Aceitar tudo / Recusar tudo / Personalizar** → POST `/api/lgpd/consent`
3. **Server persiste** `ConsentRecord` imutável + emite audit log
4. **Subsequentes visitas** → consent recuperado de localStorage + cookie sync

### Granularidade

4 finalidades independentes (LGPD Art. 8° §5° — recusa parcial é direito):

| Finalidade | Base legal | Default | Opt-in |
|------------|------------|---------|--------|
| `marketing` | Consentimento (Art. 7°, I) | recusado | sim |
| `analytics` | Legítimo interesse (Art. 7°, IX) | recusado | sim |
| `personalization` | Consentimento (Art. 7°, I) | recusado | sim |
| `thirdPartySharing` | Consentimento (Art. 7°, I) | recusado | sim |

> "Necessary" (autenticação, segurança, CSRF) é SEMPRE ativo — base legal
> execução de contrato (Art. 7°, V), não exige opt-in.

### Imutabilidade

Cada `ConsentRecord` é append-only. Correções geram novo registro
(Art. 8° §6°: rastreabilidade). Nunca editamos `ConsentRecord` existente.

---

## 6. Cookie consent UX (LGPD Art. 8°)

### Banner — `src/components/lgpd/CookieConsent.tsx`

**Comportamentos garantidos:**

- ✅ Não fecha por inércia (LGPD Art. 8° §2°: inequívoco)
- ✅ "Recusar tudo" tão fácil quanto "Aceitar tudo" (mesmo número de cliques)
- ✅ Granularidade visível antes do aceite
- ✅ Withdrawal fácil via `/settings/privacy`
- ✅ Versão detectada — bump = re-prompt
- ✅ A11y: focus trap, ARIA, keyboard navigation, ESC para fechar
- ✅ Mobile-first (4 colunas no desktop, stack no mobile)
- ✅ LGPD-compliant copy: nunca "Ao continuar navegando você concorda"

**Layout do banner:**

```
┌─────────────────────────────────────────────┐
│ 🍪  Sua privacidade importa                 │
│     Usamos cookies para...                  │
│     [Aceitar tudo] [Recusar] [Personalizar] │
└─────────────────────────────────────────────┘
```

**Modal de personalização:**

```
☑ Necessários (obrigatório)
☑ Analytics
☑ Marketing
☑ Personalização
☑ Compartilhamento com terceiros
                    [Cancelar] [Salvar]
```

---

## 7. Privacy policy dinâmica

### Localização: `src/app/(info)/privacy/page.tsx`

Server Component que lê `ConsentTextVersion` ativa do banco e renderiza
markdown com placeholders expandidos. Quando admin bumpa versão, a página
automaticamente reflete a nova versão.

**Estratégia de versionamento:**

- `1.0.0` — versão inicial (W37)
- `1.x.0` — adições de seção (não requer re-aceite)
- `2.0.0` — mudanças materiais que afetam tratamento (REQUER re-aceite)

**Re-aceite flow:**

1. Admin publica `ConsentTextVersion{version: "2.0.0", requiresReconsent: true}`
2. `CONSENT_TEXT_UPDATED` audit log
3. Próxima vez que titular acessa `/privacy` ou qualquer página protegida:
   - `getConsentState()` retorna `needsReconsent: true`
   - Banner reaparece (CookieConsent detecta versão bumpada em localStorage)
   - Após aceite: `CONSENT_REACCEPTED` audit log

---

## 8. Right to data export (Art. 18, V + Art. 19)

### Implementação: `src/lib/lgpd/data-export.ts`

### Fluxo completo

```
1. POST /api/lgpd/export { format: "JSON", password?: "..." }
   → cria DataExportRequest(status=PENDING)
   → audit DATA_EXPORT_REQUEST
   → responde com requestId + checkStatusUrl

2. Worker (cron ou trigger on-demand):
   → processDataExport(requestId)
   → aggregateUserData(userId)
   → gera JSON estruturado
   → upload para S3/R2 com presigned URL (7d expiry)
   → audit DATA_EXPORT_DELIVERED

3. GET /api/lgpd/export?requestId=...
   → retorna status + hasDownload (sem expor URL crua)

4. Email transacional:
   → "Seu export está pronto, link de download assinado (7d)"
   → nunca inclui senha (se encriptado, vem em email separado)
```

### Categorias agregadas

13 categorias de dados (ver §31 payload completo):

1. `profile` — User record (sem senha hash)
2. `posts` — posts publicados
3. `comments` — comentários
4. `akashaConversations` — conversas IA (sem systemPrompt interno — Art. 12)
5. `marketplaceTransactions` — transações Stripe (sem dados de cartão)
6. `mentorshipHistory` — pares + sessions
7. `eventRsvps` — RSVP de eventos
8. `notificationPreferences` — preferências de notificação
9. `consentHistory` — histórico de consentimentos (sem ipHash)
10. `newsletters` — inscrições
11. `bookmarks` — bookmarks salvos
12. `follows` — quem você segue
13. `auditLog` — eventos de auditoria onde você aparece

### Formatos

- **JSON** (canônico) — preserva estrutura e tipos
- **CSV** — para Excel/planilhas (flattened)
- **PDF** — para humanos (render de JSON em PDF)

### Criptografia opcional

Usuário pode fornecer senha → ZIP criptografado com AES-256-GCM:
- PBKDF2-SHA256, 100k iterations, 16-byte salt, 32-byte key
- Senha nunca logada
- Email separado com senha (canal diferente)

### Limites

- Estimativa de tamanho mostrada ao usuário antes de processar
- Rate limit: 5 requests/dia por usuário
- Idempotência: request em voo bloqueia nova criação

---

## 9. Right to be forgotten (Art. 18, VI)

### Implementação: `src/lib/lgpd/data-deletion.ts`

### 2 fases (soft + hard delete)

```
T+0     POST /api/lgpd/delete
        ↓
        requestDataDeletion()
        ↓
        User.email → "deleted-<cuid>@deleted.local"
        User.displayName → "Usuário removido"
        User.dataNascimento/horaNascimento/localNascimento → null
        User.deletedAt = now()
        ↓
        Audit: DATA_DELETION_REQUEST
        ↓
        Email ao titular: "Você tem 30 dias para cancelar"
        ↓
T+30d   Cron: pendingHardDeletes() → executeHardDelete()
        ↓
        Posts: authorId → "deleted-<cuid>"
        Comments: authorId → "deleted-<cuid>"
        Marketplace offerings: status='DELETED'
        Audit: DATA_DELETION_CONFIRMED (preservado)
        ↓
        User record deleted (cascade)
        ↓
        Email ao email secundário (recovery): "Exclusão concluída"
```

### Cancelamento (within 30d)

```typescript
// POST /api/lgpd/delete/cancel
cancelDataDeletion(userId)
// → user.deletedAt = null
// → audit CONSENT_REVOKED { event: 'DELETION_CANCELLED' }
// ⚠️ PII permanece anonimizada — titular precisa criar nova conta
```

### Exceções (Art. 16 — retenção legal)

MANTIDOS por obrigação legal:

| Dado | Retenção | Base legal |
|------|----------|------------|
| AuditLog | 5 anos | Art. 37 + Art. 16, IV |
| PaymentAuditLog | 5 anos | Obrigação fiscal |
| StripeTransactions | 5 anos | Obrigação fiscal |
| Logs de ofício ANPD | indefinido | Art. 31 |

DELETADOS:

| Dado | Quando |
|------|--------|
| User record | T+30d |
| MapaNatal | cascade |
| JournalEntry | cascade |
| SpiritualProfile | cascade |
| Posts (conteúdo) | preservado, autor anonimizado |
| Comments (conteúdo) | preservado, autor anonimizado |
| Auth (Supabase) | imediato |

---

## 10. Data minimization (Art. 6°, 9°, 12)

### Implementação: `src/lib/lgpd/data-minimization.ts`

### `detectExcessiveFields()`

Auditoria estática que identifica:
- Campos free-text > 500 chars sem justificativa
- Campos PII-typical sem hash/redaction
- Campos sem `@@index` (risco de queries lentas que vazam dados)

### `redactPII()` + `setupLogRedaction()`

Auto-redaction de:
- **email** — `john.doe@example.com` → `jo***@example.com`
- **phone_br** — `(11) 98765-4321` → `***phone***`
- **cpf** — `123.456.789-00` → `***cpf***`
- **cnpj** — `12.345.678/0001-00` → `***cnpj***`
- **credit_card** — `4111 1111 1111 1111` → `***card***`

**Ativar uma vez no boot do app** (em `instrumentation.ts` ou similar):

```typescript
import { setupLogRedaction } from '@/lib/lgpd/data-minimization';
setupLogRedaction();
// console.log('user joao@example.com') → console.log('user jo***@example.com')
```

### `aggregateAnalyticsOnly()`

Helper para analytics que **nunca** retorna linhas individuais. Apenas
counts/sums/avgs agrupados.

```typescript
// ✅ Correto — agregado
const stats = await aggregateAnalyticsOnly({
  model: 'post',
  where: { createdAt: { gte: lastMonth } },
  groupBy: ['tradition'],
  aggregate: { count: true },
});
// stats.groups = [{ tradition: 'cabala', _count: 42 }]

// ❌ Errado — retorna PII
const posts = await prisma.post.findMany();
```

### `REQUIRED_FIELDS_BY_PURPOSE`

Tabela declarativa que documenta, para cada finalidade, quais campos são
**estritamente necessários**. Usado em auditoria ANPD.

| Finalidade | Campos necessários |
|------------|-------------------|
| `account_creation` | email, displayName, passwordHash |
| `authentication` | email, passwordHash, lastLoginAt |
| `content_publishing` | displayName, bio, avatarUrl |
| `mentorship` | displayName, bio, tradicoes |
| `newsletter` | email, tradicoes |
| `payment` | email, displayName, stripeCustomerId |
| `ai_akasha` | displayName, tradicoes, spiritualProfile |
| `audit` | userId, createdAt, action (sem PII) |
| `analytics` | (vazio — apenas agregados) |

---

## 11. Audit log tamper-evident (Art. 37)

### Implementação: `src/lib/lgpd/audit-logger.ts`

### Estende W11 `src/lib/audit/index.ts` com:

1. **Hash chain** — cada entrada referencia hash da anterior
2. **Retention 5 anos** — Art. 16, IV
3. **Auto-redaction de metadata** — keys banidas + regex PII
4. **Mapeamento de SensitiveAction** → AuditAction enum (W11 retrocompat)
5. **verifyAuditChain()** — cron mensal detecta tampering
6. **auditStats()** — métricas para DPO dashboard

### Cobertura de ações sensíveis

24 ações cobertas (ver §32 enum completo):

```
Auth:           LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT,
                PASSWORD_CHANGED, PASSWORD_RESET_*
                MFA_ENABLED, MFA_DISABLED
LGPD:           DATA_EXPORT_REQUEST, DATA_EXPORT_DELIVERED,
                DATA_DELETION_REQUEST, DATA_DELETION_CONFIRMED,
                CONSENT_GRANTED, CONSENT_REVOKED,
                CONSENT_TEXT_UPDATED, CONSENT_REACCEPTED,
                PRIVACY_POLICY_VIEWED
Payment:        PAYMENT_INTENT_CREATED, PAYMENT_SUCCEEDED,
                PAYMENT_FAILED, PAYMENT_REFUNDED
Admin:          ADMIN_USER_BAN, ADMIN_CONTENT_REMOVE,
                ADMIN_ROLE_GRANT, ADMIN_OVERRIDE
Integration:    INTEGRATION_TOKEN_ISSUED, INTEGRATION_DATA_ACCESS
Audit meta:     AUDIT_LOG_EXPORTED, DPO_DASHBOARD_VIEWED
```

---

## 12. Hash chain implementation

### Algoritmo

```
H[0] = SHA256("0" × 64)  // genesis

H[n] = SHA256(
  payload = {
    action, actorId, targetId,
    occurredAt: ISO,
    prevHash: H[n-1],
    metadata: sanitized,
    requestId,
  }
)
```

### Persistência

Cada `AuditLog.metadata` ganha 2 chaves extras:

```typescript
metadata: {
  ...campos existentes,
  hash: "abc123...",
  prevHash: "def456...",
  retentionDays: 1825, // 5 anos
  occurredAt: "2026-07-01T...",
}
```

### Verificação

```typescript
const result = await verifyAuditChain({ sinceDays: 365, limit: 10000 });
// { ok: true, totalChecked: 4523, message: "Audit chain íntegro..." }
// ou
// { ok: false, firstBrokenAt: "...", message: "Audit chain quebrada em..." }
```

**Agendar:** cron mensal roda `verifyAuditChain({ sinceDays: 90 })`. Se
quebrado, alerta imediato para DPO + engineering.

---

## 13. Retention policy (Art. 16)

| Dado | Retenção | Justificativa |
|------|----------|---------------|
| `User` (PII) | enquanto conta ativa + 30d soft + hard delete | Art. 15 + Art. 18, VI |
| `ConsentRecord` | 5 anos | Art. 37 + Art. 16, IV |
| `DataExportRequest` | 7d após READY → EXPIRED (linha preservada) | Art. 19 |
| `AuditLog` | 5 anos | Art. 37 + Art. 16, IV |
| `PaymentAuditLog` | 5 anos | Obrigação fiscal |
| `StripeTransaction` | 5 anos | Obrigação fiscal |
| `NewsletterSubscription` | até cancelamento | Consentimento revogado |
| `Notification` | 90d (limpeza automática) | Minimização |
| `AkashicFeedback` | 2 anos | Melhoria de modelo |

**Implementação:** `pruneExpiredAuditLogs()` em cron diário remove
`AuditLog` entries com `createdAt < now - 5y`.

---

## 14. Auto-redaction de PII em logs

### Padrões cobertos

| Tipo | Regex | Substituição |
|------|-------|--------------|
| Email | `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}` | `lo***@domain` |
| Phone BR | `\b\d{2}\s?9?\d{4}-?\d{4}\b` | `***phone***` |
| CPF | `\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b` | `***cpf***` |
| CNPJ | `\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b` | `***cnpj***` |
| Credit card | `\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b` | `***card***` |

### Keys banidas em metadata

`password`, `token`, `sessionToken`, `csrfToken`, `secret`, `apiKey`,
`creditCard`, `cvv`, `ssn`, `cpf`, `cnpj` → sempre viram `[REDACTED]`.

### Onde aplicar

1. `setupLogRedaction()` no boot do app
2. `logSensitiveAction()` sanitiza metadata antes de gravar
3. PII em `auditLog.metadata` é recursivamente redacted

---

## 15. DPO — Encarregado de Proteção de Dados

### Identificação (Art. 41)

- **Nome:** Daniel Sobral
- **Email:** dpo@caminhosdosaber.com.br
- **Disponibilidade:** resposta em até 15 dias (Art. 18 §5°)
- **Canal de comunicação:** formulário `/settings/privacy` + email direto

### Atribuições (Art. 41 §2°)

1. Aceitar reclamações e comunicações dos titulares
2. Receber comunicações da ANPD e adotar medidas
3. Orientar colaboradores sobre práticas de proteção
4. Executar as atribuições determinadas pelo controlador

### Relação com ANPD

- Canal direto via SIC (Sistema Eletrônico de Informações)
- Ofícios respondidos em até 5 dias úteis (Art. 31)
- RIPD (Relatório de Impacto) preparado para tratamentos de alto risco

### Relação com engenharia

- Participa de PR reviews em features que tocam dados pessoais
- Valida novos `ConsentRecord` categories (bump de versão)
- Audita hash chain mensalmente

---

## 16. DPO Dashboard — /admin/lgpd

### Localização: `src/app/admin/lgpd/page.tsx`

### Visualização

```
┌──────────────────────────────────────────────────────┐
│  DPO Dashboard                                       │
│  ──────────────────────────────────────────────      │
│                                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Política │ │ Audit   │ │ Exports │ │Deletions│  │
│  │ v1.0.0  │ │ 12,453  │ │   3     │ │   2     │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                       │
│  ┌────────────────────┐ ┌────────────────────┐     │
│  │ Hash Chain         │ │ Re-consent Queue   │     │
│  │ ✅ OK (5 anos)     │ │ 0 titulares        │     │
│  └────────────────────┘ └────────────────────┘     │
│                                                       │
│  [Export Requests Recentes]   [Soft Deletions]      │
│  [Audit Log Top Actions]      [Export CSV]          │
└──────────────────────────────────────────────────────┘
```

### Seções

1. **KPIs** — versão política, audit log count, pending exports, pending deletions
2. **Hash chain status** — `OK` / `BROKEN` / `UNVERIFIED`
3. **Re-consent queue** — quantos titulares precisam re-aceitar
4. **Export requests** — últimas 10 com status
5. **Soft deletions** — T+30d window com hard delete agendado
6. **Audit log top actions** — bar chart das ações mais frequentes
7. **Export CSV** — link direto para ofício ANPD

### Acesso

Requer `requireAdmin()` (env `ADMIN_EMAILS` OU `User.planoAssinatura='ADMIN'`).

---

## 17. APIs REST LGPD

### 17.1 `POST /api/lgpd/export`

Cria DataExportRequest assíncrona.

```bash
curl -X POST /api/lgpd/export \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"format": "JSON", "password": "minha-senha-segura"}'
```

**Response 200:**
```json
{
  "requestId": "clx...",
  "status": "PENDING",
  "estimatedSize": 250000,
  "checkStatusUrl": "/api/lgpd/export?requestId=clx...",
  "message": "..."
}
```

### 17.2 `GET /api/lgpd/export?requestId=...`

Status de uma request.

### 17.3 `POST /api/lgpd/delete`

Inicia soft-delete (janela 30d).

```bash
curl -X POST /api/lgpd/delete \
  -H "Content-Type: application/json" \
  -d '{"reason": "Não uso mais", "confirm": true}'
```

### 17.4 `POST /api/lgpd/consent`

Grava consentimento granular.

```bash
curl -X POST /api/lgpd/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consent": {
      "necessary": true,
      "analytics": true,
      "marketing": false,
      "personalization": false,
      "thirdPartySharing": false
    },
    "version": "1.0.0"
  }'
```

### 17.5 `GET /api/admin/lgpd/dashboard`

Snapshot JSON do DPO Dashboard.

### 17.6 `GET /api/admin/lgpd/audit-log`

Audit log com filtros + export CSV.

```bash
curl "/api/admin/lgpd/audit-log?userId=user_123&format=csv" \
  -H "Cookie: session=admin..." \
  -o audit-log-2026-07.csv
```

---

## 18. Schema Prisma — novos models

### `ConsentRecord`

```prisma
model ConsentRecord {
  id               String   @id @default(cuid())
  userId           String
  version          String
  ipHash           String
  userAgent        String?
  specificConsents Json
  accepted         Boolean
  withdrawalMethod String?
  withdrawalDate   DateTime?
  createdAt        DateTime @default(now())

  @@index([userId, createdAt])
  @@index([version])
  @@index([accepted, createdAt])
  @@map("consent_records")
}
```

### `DataExportRequest`

```prisma
model DataExportRequest {
  id           String   @id @default(cuid())
  userId       String
  status       String   // PENDING | PROCESSING | READY | EXPIRED | FAILED
  format       String   // JSON | CSV | PDF
  downloadUrl  String?
  contentHash  String?
  fileSize     Int?
  expiresAt    DateTime?
  errorMessage String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([expiresAt])
  @@map("data_export_requests")
}
```

### `ConsentTextVersion`

```prisma
model ConsentTextVersion {
  id                String   @id @default(cuid())
  version           String   @unique
  contentHash       String
  content           String   @db.Text
  effectiveAt       DateTime
  requiresReconsent Boolean  @default(true)
  publishedBy       String
  createdAt         DateTime @default(now())

  @@index([effectiveAt])
  @@index([version])
  @@map("consent_text_versions")
}
```

### AuditAction enum (extensões W37)

```prisma
enum AuditAction {
  // ... W11 actions ...
  PASSWORD_CHANGED
  EMAIL_CHANGED
  PROFILE_UPDATED
  DATA_DELETION_REQUEST
  DATA_DELETION_CONFIRMED
  CONSENT_TEXT_UPDATED
  CONSENT_REACCEPTED
  PRIVACY_POLICY_VIEWED
  AUDIT_LOG_EXPORTED
  DPO_DASHBOARD_VIEWED
  INTEGRATION_TOKEN_ISSUED
  INTEGRATION_DATA_ACCESS
  ADMIN_OVERRIDE
}
```

---

## 19. Cryptography (Art. 46)

### Em repouso

- **Postgres (Supabase):** AES-256 (gerenciado pelo provider)
- **S3/R2 exports:** AES-256-GCM server-side encryption
- **Backups:** AES-256 com rotação de chaves anual
- **Senhas:** bcrypt cost 12 (W34)

### Em trânsito

- **TLS 1.3** em toda a stack (Vercel + Supabase + Stripe)
- **HSTS** com max-age 1 ano + includeSubDomains + preload (W34 §14)
- **CSP** strict, sem inline scripts (W34 §2)

### Em uso

- **PBKDF2-SHA256** 100k iterações para derivar chave do export ZIP
- **AES-256-GCM** com IV 12-byte aleatório + auth tag 16-byte
- **SHA-256** truncated 32 chars para hash de IP + hash chain

### Chaves

- **AWS KMS / Supabase Vault** para chaves de produção
- **Rotação:** anual ou on-demand (incident)
- **Nunca** commit de chaves (gitleaks pre-commit)

---

## 20. Consentimento granular — schema JSON

```typescript
type SpecificConsents = {
  marketing: boolean;        // newsletters, remarketing
  analytics: boolean;         // PostHog, métricas anônimas
  personalization: boolean;   // feed, Akasha sugestões
  thirdPartySharing: boolean; // pesquisa acadêmica agregada
};
```

**`necessary: true`** é implícito (não persistido) — sempre ativo.

### Schema validation

```typescript
const ConsentSchema = z.object({
  consent: z.object({
    necessary: z.literal(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
    personalization: z.boolean(),
    thirdPartySharing: z.boolean(),
  }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});
```

---

## 21. Withdrawal flow

### 3 caminhos

1. **Settings** — `/settings/privacy` → toggles por categoria
2. **Suporte** — ticket via `/help` (DPO processa manualmente)
3. **Email** — `dpo@caminhosdosaber.com.br` (DPO confirma identidade)

### Implementação

```typescript
await withdrawConsent({
  userId: 'user_123',
  method: 'SETTINGS', // ou 'SUPPORT' | 'EMAIL'
  categories: ['marketing'], // ou null = revogação total
});
```

### Auditoria

Cada withdrawal gera:
- Novo `ConsentRecord` (imutável)
- `CONSENT_REVOKED` audit log com `method`
- Atualização de `withdrawalMethod` + `withdrawalDate`

---

## 22. Re-consent quando policy bumpa

### Trigger

Admin (ou DPO) publica nova `ConsentTextVersion`:

```typescript
await publishConsentTextVersion({
  version: '2.0.0',
  content: '# Nova política...',
  requiresReconsent: true,
  publishedBy: 'admin_user_id',
});
```

### Efeito

1. `getConsentState(userId).needsReconsent` vira `true` para todos
2. Próxima visita do titular:
   - `CookieConsent` detecta versão bumpada em localStorage
   - Banner reaparece
   - Após aceite: `CONSENT_REACCEPTED` audit log
3. Email (opcional): "Atualizamos nossa política — por favor re-confirme"

---

## 23. Transferência internacional (Art. 33)

### Operadores

| Provider | Localização | Mecanismo |
|----------|-------------|-----------|
| Supabase | US (default) ou EU | SCC + DPA assinado |
| Stripe | US | SCC + PCI-DSS Level 1 |
| Vercel | Global CDN | SCC + DPA |
| Resend | US | DPA |

### Garantias

- ✅ Cláusulas contratuais padrão (SCC) aprovadas em DPA
- ✅ Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)
- ✅ Auditoria anual de subprocessadores
- ✅ Direito de objeção do titular (Art. 18 §8°)

---

## 24. Bases legais por finalidade

| Finalidade | Base legal | Justificativa |
|------------|------------|---------------|
| Autenticação | Execução de contrato (Art. 7°, V) | Necessário para entregar o serviço |
| Conteúdo (posts/comments) | Execução de contrato | Funcionalidade principal |
| Akasha IA | Consentimento | Tratamento adicional ao serviço base |
| Mentoria | Execução de contrato | Funcionalidade pareada |
| Newsletter | Consentimento (Art. 7°, I) | Marketing opt-in |
| Analytics agregado | Legítimo interesse (Art. 7°, IX) | Melhoria de produto |
| Personalização | Consentimento | Tratamento adicional |
| Compartilhamento 3P | Consentimento | Tratamento adicional |
| Pagamento | Execução de contrato + Obrigação legal | Stripe + fiscal |
| Audit log | Legítimo interesse + Obrigação legal | Art. 37 + Art. 16, IV |
| Suporte | Execução de contrato | Atendimento ao titular |

---

## 25. ANPD incident response

### Art. 48 LGPD: comunicação de incidente

Prazo: **2 dias úteis** após conhecimento do incidente que possa causar
risco relevante aos titulares.

### Fluxo

```
1. Detecção (Sentry, audit log anomaly, user report)
   ↓
2. Triagem (severidade: P0/P1/P2/P3)
   ↓
3. Contenção (revoke tokens, disable endpoints)
   ↓
4. Investigação (audit log forensics + hash chain verify)
   ↓
5. Notificação ANPD via SIC (se P0/P1)
   ↓
6. Notificação titulares (email + banner + admin/lgpd)
   ↓
7. Post-mortem público (após 30d)
```

### Comunicação ao titular (Art. 48 §1°)

- Natureza do incidente
- Dados afetados (categorias, não listas)
- Medidas tomadas
- Recomendações ao titular (trocar senha, etc.)
- Canal de contato com DPO

---

## 26. Operação de ofícios ANPD

### Quando recebemos um ofício

1. DPO confirma identidade do solicitante (canal SIC + protocolo)
2. Verifica prazo (5 dias úteis padrão)
3. Coleta dados solicitados:
   - `GET /api/admin/lgpd/audit-log?action=X&dateFrom=...&dateTo=...&format=csv`
   - `GET /api/admin/lgpd/dashboard` para métricas agregadas
   - `aggregateUserData(userId)` se for sobre titular específico
4. Gera pacote zipado com:
   - CSVs assinados (SHA-256)
   - README com contexto
   - Declaração de veracidade
5. Submete via SIC

### Ofício de exclusão

Titular → ANPD → ofício para nós → DPO executa `requestDataDeletion()`

### Ofício de acesso

Mesmo fluxo, mas com `aggregateUserData()` + export.

---

## 27. Compliance report mensal

### Conteúdo

```typescript
{
  reportMonth: '2026-07',
  generatedAt: '...',
  metrics: {
    newConsentRecords: 142,
    consentWithdrawals: 8,
    dataExportRequests: 3,
    dataDeletionRequests: 1,
    hardDeletesExecuted: 0,
    reconsentQueueSize: 0,
    auditLogEntries: 12453,
    hashChainStatus: 'OK',
    anpdInquiries: 0,
    incidentReports: 0,
  },
  byConsentCategory: {
    marketing: { granted: 87, denied: 55 },
    analytics: { granted: 110, denied: 32 },
    personalization: { granted: 76, denied: 66 },
    thirdPartySharing: { granted: 45, denied: 97 },
  },
  topActions: [...],
  complianceGaps: [],
}
```

### Distribuição

- Email para diretoria
- Arquivo em `/admin/lgpd/reports/2026-07.json`
- Apresentação em reunião mensal de governança

---

## 28. Integração com W34 (security) e W11 (LGPD foundation)

### W34 (security hardening 6/8) — já entrega

- OWASP Top 10 (CSP, CSRF, IDOR prevention)
- ASVS V2.1 Level 2 (autenticação, sessão, lockout)
- Audit log base (`src/lib/audit/index.ts`)
- Hash IP + salt
- Password policy (bcrypt cost 12 + zxcvbn)

### W11 (LGPD foundation) — preservado

- `src/lib/privacy/data-deletion.ts` (substituído por `src/lib/lgpd/data-deletion.ts` W37)
- `src/lib/audit/index.ts` (estendido por `src/lib/lgpd/audit-logger.ts`)
- `/api/consent` (substituído por `/api/lgpd/consent`)
- `docs/SECURITY-LGPD-CHECKLIST.md` (preservado, este doc é complemento)

### W37 deltas

| Funcionalidade | Onde está |
|----------------|-----------|
| Consent granular 4-cat | `src/lib/lgpd/consent.ts` |
| Consent versioning | `src/lib/lgpd/consent.ts` + `ConsentTextVersion` |
| Data export workflow | `src/lib/lgpd/data-export.ts` |
| Right to be forgotten | `src/lib/lgpd/data-deletion.ts` |
| Data minimization audit | `src/lib/lgpd/data-minimization.ts` |
| Hash chain | `src/lib/lgpd/audit-logger.ts` |
| Cookie consent v2 | `src/components/lgpd/CookieConsent.tsx` |
| DPO dashboard | `src/app/admin/lgpd/page.tsx` |
| Privacy policy dynamic | `src/app/(info)/privacy/page.tsx` |
| APIs | `src/app/api/lgpd/*` e `src/app/api/admin/lgpd/*` |

---

## 29. Testes e cobertura

### Unit tests (Vitest)

- `lgpd/consent.test.ts` — recordConsent, withdrawConsent, getConsentState
- `lgpd/data-export.test.ts` — aggregateUserData, estimateExportSize, encrypt
- `lgpd/data-deletion.test.ts` — soft + hard delete, 30d window, cancellation
- `lgpd/audit-logger.test.ts` — hash chain, sanitizeMetadata, verifyChain
- `lgpd/data-minimization.test.ts` — redactPII (5 patterns), aggregateOnly

### Integration tests (Playwright)

- Cookie consent banner (aceitar/recusar/personalizar)
- /privacy renderiza versão atual
- /settings/privacy funciona para exportar/deletar
- /admin/lgpd requer auth admin

### E2E (manual QA)

- [ ] Aceitar tudo → recarregar → banner NÃO aparece
- [ ] Recusar tudo → audit log registra CONSENT_GRANTED com 0 grants
- [ ] Personalizar → cada toggle persiste
- [ ] Bump versão → banner reaparece
- [ ] Solicitar export → email chega em <5min
- [ ] Solicitar delete → soft delete em T+0
- [ ] Cancelar delete → PII permanece anonimizada mas deletedAt = null

---

## 30. Roadmap Wave 38+

### W38 (Compliance 8/8 — final)

- [ ] DSR portal público (titular vê status de solicitações)
- [ ] Integração com e-Privacy (EU GDPR paralelo)
- [ ] Pseudonymization para analytics
- [ ] Differential privacy em agregados
- [ ] Privacy budget (limite de exposure a dados brutos)

### W39+

- [ ] Homomorphic encryption para queries sensíveis
- [ ] Zero-knowledge proofs para verificação de atributos
- [ ] Federated learning para IA sem expor dados
- [ ] On-chain consent registry (opcional, para auditoria)

---

## 31. Apêndice A — payload de export

### Estrutura JSON completa

```json
{
  "generatedAt": "2026-07-01T...",
  "userId": "user_abc",
  "format": "JSON",
  "schemaVersion": "1.0.0",
  "profile": {
    "id": "user_abc",
    "email": "user@example.com",
    "displayName": "João",
    "username": "joao",
    "bio": "...",
    "avatarUrl": "...",
    "createdAt": "...",
    "planoAssinatura": "FREE",
    "tradicoes": ["cabala"]
  },
  "posts": [
    {
      "id": "post_1",
      "title": "...",
      "content": "...",
      "tradition": "cabala",
      "topic": "...",
      "tags": ["..."],
      "visibility": "PUBLIC",
      "likesCount": 12,
      "commentsCount": 3,
      "createdAt": "..."
    }
  ],
  "comments": [...],
  "akashaConversations": [
    {
      "id": "conv_1",
      "title": "Meditação guiada",
      "messages": [
        { "role": "user", "content": "...", "createdAt": "..." },
        { "role": "assistant", "content": "...", "createdAt": "..." }
      ]
    }
  ],
  "marketplaceTransactions": [...],
  "mentorshipHistory": [...],
  "eventRsvps": [...],
  "notificationPreferences": {
    "emailDigest": true,
    "pushEnabled": false,
    "mentorshipNotifications": true,
    "communityNotifications": true,
    "marketingEmails": false
  },
  "consentHistory": [
    {
      "id": "consent_1",
      "version": "1.0.0",
      "specificConsents": {
        "marketing": true,
        "analytics": true,
        "personalization": false,
        "thirdPartySharing": false
      },
      "accepted": true,
      "withdrawalMethod": null,
      "withdrawalDate": null,
      "createdAt": "..."
    }
  ],
  "newsletters": [...],
  "bookmarks": [...],
  "follows": [...],
  "auditLog": [
    {
      "id": "audit_1",
      "action": "LOGIN_SUCCESS",
      "actorId": "user_abc",
      "targetId": "user_abc",
      "metadata": { "ipHash": "..." },
      "requestId": "...",
      "createdAt": "..."
    }
  ],
  "readme": "Caminhos do Saber — Export de Dados Pessoais..."
}
```

---

## 32. Apêndice B — AuditAction enum completo

### W11 (foundation)

```
LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT
PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS
ACCOUNT_DELETE_REQUEST, ACCOUNT_DELETE_CONFIRMED
DATA_EXPORT_REQUEST, DATA_EXPORT_DELIVERED
CONSENT_GRANTED, CONSENT_REVOKED
POST_CREATED, POST_DELETED
COMMENT_CREATED, COMMENT_DELETED
ADMIN_USER_BAN, ADMIN_CONTENT_REMOVE
INVITE_EXPIRED_BATCH, INVITE_REVOKED
CURATOR_INVITED, CURATOR_INVITE_ACCEPTED, CURATOR_INVITE_DECLINED
CURATOR_INVITE_EXPIRED, CURATOR_INVITE_REVOKED
CURATOR_PROFILE_UPDATED, CURATOR_DEACTIVATED
ARTICLE_APPROVED, ARTICLE_REJECTED, POST_MODERATED_BY_CURATOR
```

### W37 (novos — 13)

```
PASSWORD_CHANGED         // troca de senha
EMAIL_CHANGED            // troca de email
PROFILE_UPDATED          // edição de PII
DATA_DELETION_REQUEST    // titular pediu exclusão
DATA_DELETION_CONFIRMED  // hard delete executado
CONSENT_TEXT_UPDATED     // nova versão publicada
CONSENT_REACCEPTED       // titular re-aceitou
PRIVACY_POLICY_VIEWED    // titular acessou /privacy
AUDIT_LOG_EXPORTED       // admin/DPO exportou
DPO_DASHBOARD_VIEWED     // admin acessou /admin/lgpd
INTEGRATION_TOKEN_ISSUED // token integração
INTEGRATION_DATA_ACCESS  // integração acessou dado
ADMIN_OVERRIDE           // admin sobrescreveu verificação
```

---

## 33. Apêndice C — env vars obrigatórias

```bash
# W37 LGPD Compliance
AUDIT_IP_SALT=                    # SHA-256 salt para hash de IP + hash chain
EXPORT_SIGNING_KEY=               # HMAC para signed download URLs (S3/R2)
S3_BUCKET=                        # bucket privado para exports
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# W34 já obrigatórias
SESSION_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
```

**Hard fail** se `AUDIT_IP_SALT` não estiver definido em produção.

---

## 34. Apêndice D — checklist de auditoria

### Pré-deploy

- [ ] `AUDIT_IP_SALT` definido
- [ ] `ConsentTextVersion` v1.0.0 publicada
- [ ] `S3_BUCKET` configurado + CORS fechado
- [ ] Cron `processDataExport` agendado
- [ ] Cron `pendingHardDeletes` agendado (diário)
- [ ] Cron `pruneExpiredAuditLogs` agendado (diário)
- [ ] Cron `verifyAuditChain` agendado (mensal)
- [ ] Email template para export ready
- [ ] Email template para soft delete
- [ ] Email template para hard delete

### Auditoria ANPD

- [ ] DPO designado + publicado
- [ ] Inventário de tratamentos atualizado
- [ ] RIPDs para tratamentos de alto risco
- [ ] Política de privacidade acessível
- [ ] Cookie banner implementado
- [ ] 9 direitos do titular exercitáveis
- [ ] Audit log imutável + hash chain
- [ ] Plano de resposta a incidentes
- [ ] Contratos com operadores (DPA + SCC)

### Auditoria interna (trimestral)

- [ ] `verifyAuditChain` retorna OK
- [ ] `reconsentQueueSize` < 10% dos usuários ativos
- [ ] `pendingDeletionRequestsCount` dentro do esperado
- [ ] `auditStats.hashChainStatus === 'OK'`
- [ ] `aggregateAnalyticsOnly` usado em todos dashboards
- [ ] `setupLogRedaction` ativo no boot

---

## 35. Glossário LGPD

| Termo | Definição |
|-------|-----------|
| **Titular** | Pessoa natural a quem os dados pessoais se referem |
| **Controlador** | Pessoa natural/jurídica que toma decisões sobre tratamento (Akasha Portal) |
| **Operador** | Pessoa natural/jurídica que realiza tratamento em nome do controlador (Supabase, Stripe) |
| **DPO / Encarregado** | Pessoa designada para ser canal de comunicação com titulares e ANPD |
| **Tratamento** | Toda operação com dados pessoais (coleta, armazenamento, uso, exclusão) |
| **Consentimento** | Manifestação livre, informada e inequívoca do titular |
| **Base legal** | Hipótese do Art. 7° que autoriza o tratamento |
| **Dado pessoal** | Informação relacionada a pessoa natural identificada ou identificável |
| **Dado sensível** | Origem racial, opinião política, convicção religiosa, dado biométrico, genético, de saúde, etc. |
| **Anonimização** | Processo que torna dado não identificável (irreversível) |
| **Pseudonimização** | Processo que substitui identificadores diretos por indiretos (reversível com chave) |
| **RIPD** | Relatório de Impacto à Proteção de Dados Pessoais |
| **SCC** | Standard Contractual Clauses (transferência internacional) |
| **DPA** | Data Processing Agreement (contrato com operador) |
| **ANPD** | Autoridade Nacional de Proteção de Dados |
| **SIC** | Sistema Eletrônico de Informações (canal oficial ANPD) |
| **AES-256-GCM** | Algoritmo de criptografia simétrica autenticada |
| **PBKDF2** | Password-Based Key Derivation Function 2 |
| **Hash chain** | Encadeamento de hashes para detecção de tampering |
| **5 anos** | Retenção padrão para audit log (Art. 37 + Art. 16, IV) |
| **30 dias** | Janela de recuperação de soft-delete |
| **7 dias** | Expiração de download URL de export |

---

**FIM DO DOCUMENTO**

Wave 37 — LGPD Compliance 7/8 · Coder + Caio (security) + Iyá (Curator)
Última atualização: 2026-07-01 · Versão: 1.0.0