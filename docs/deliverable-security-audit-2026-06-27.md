# Deliverable — Security Audit (Caio) · 2026-06-27

## Status: ✅ ENTREGUE

**Commit:** `ebd9b638ab12cb0ced42a6092e861095b445301b` em `feat/community-platform`
**Audit doc:** `docs/SECURITY-AUDIT.md` (98 linhas, 16 findings)

---

## Resumo de findings

### P0 (críticos — bloqueiam release) — 5
1. **F1** — API key MiniMax hardcoded em 3 arquivos (`src/lib/ai/minimax.ts:7`, `tradition-mapper.ts:9`, `life-areas-ai.ts:11`). **Rotacionar AGORA.**
2. **F2** — Logout em `src/app/api/auth/logout/route.ts:6` deleta cookie que não existe; sessão Supabase permanece válida.
3. **F3** — Login bypass hardcoded em `src/app/api/auth/login-form/route.ts:21` (`demo@cabala.com` / `Demo123456`).
4. **F4** — Zero RLS policies em todas as 2 migrations; anon key tem acesso cross-user irrestrito.
5. **F5** — Direito ao esquecimento (LGPD art. 18, VI) NÃO implementado — `src/lib/privacy/data-deletion.ts` é stub.

### P1 (altos — agendar antes do GA) — 6
- **F6** — CSP/HSTS não aplicados globalmente (só em `/api/security/headers` debug).
- **F7** — Rate limiter em `Map` in-memory; não escala em serverless multi-instance.
- **F8** — `ALLOWED_ORIGINS || '*'` em prod se env ausente.
- **F9** — `/api/auth/register` usa service_role sem rate-limit dedicado pra signup.
- **F10** — Waitlist persiste IP+UA sem base legal documentada.
- **F11** — `/api/auth/status` e `/api/auth/create-test` debug expostos em prod.

### P2 (médios/baixos) — 5
- **F12** – Validação mínima em `/api/auth/login` (não reusa schema Zod).
- **F13** – Sem `DATA-INVENTORY.md`, `PRIVACY-POLICY.md` formal, sem DPO.
- **F14** – Error messages vazam nomes de env vars (reconnaissance).
- **F15** – `extractIdentifier` aceita x-forwarded-for spoofable.
- **F16** – `NEXT_PUBLIC_APP_URL` sem assert em startup.

## LGPD Checklist — 3/8 ✅ · 3 ⚠️ parcial · 2 ❌
- ❌ Direito ao esquecimento (F5)
- ❌ DPO designado (F13)
- ⚠️ Coleta mínima (documentar formalmente)
- ⚠️ Consentimento (faltam opt-ins granulares)
- ⚠️ Portabilidade (lib existe, sem endpoint)

## Top 3 ações imediatas
1. **Rotacionar 3 API keys hardcoded** + adicionar pre-commit gitleaks (~30min)
2. **Implementar RLS + delete account** (~6-8h)
3. **Quebrar logout + remover bypass demo + adicionar CSP/HSTS** (~1h)

## Não escopado nesta passada
- Pentest manual de fluxos IA (mesa-real, oracle, autonomous-insights)
- Auditoria de logs PII mensal
- Threat modeling formal (`docs/SECURITY-THREAT-MODEL.md`)
- Audit de deps (`npm audit --audit-level=high` em CI)
- Pentest de payment flow (Stripe) — B2B removido, low-priority

## Arquivos tocados
- `docs/SECURITY-AUDIT.md` — **NOVO** (98 linhas, 16 findings + LGPD checklist + top-3 ações)

## Próxima auditoria sugerida
- Após merge de F1-F5 (urgente).
- Antes de qualquer deploy público de community.
- Mensal ou antes de cada release que toque auth/data.