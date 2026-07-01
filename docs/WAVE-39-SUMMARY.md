# Wave 39 Summary — Production Hardening + Mobile + API Surface

> **Wave 39 = technical production hardening + native mobile + video infrastructure + API gateway.** Builds on Wave 38 community features (challenges, circles, badges). Triggered by Wave 4 = CONSTRAINED/GO open beta disposition + Wave 38 disposition decided.

---

## TL;DR

| Worker | Trilha | Tipo | Status | Outcome |
|--------|--------|------|--------|---------|
| **W39-1** | TSC per-file fix | Coder | 🔄 IN PROGRESS | tsc --noEmit per-file scoped fix, branch-ready |
| **W39-2** | Marketing scale (influencer + ads + partnerships) | PM + Designer + Writer | 🔄 DISPATCHED | 5–10 influencers, paid ads test, partnership pipeline |
| **W39-3** | Akasha production (cost + latency + observability) | Coder + DevOps | 🔄 DISPATCHED | eval latency <800ms p95, cost <R$0.02/req, observability stack |
| **W39-4** | Community health at scale | PM + Moderator | 🔄 DISPATCHED | auto-mod v2, trust scoring, retention loops D7/D30 |
| **W39-5** | Mobile apps native (Expo + iOS + Android) | Coder + Designer | 🔄 DISPATCHED | Expo SDK 53 + EAS Build + App Store + Play Store submission-ready |
| **W39-6** | Video streaming HLS + CDN | Coder + DevOps | 🔄 DISPATCHED | HLS adaptive bitrate, CloudFront/Fastly CDN, signed URLs |
| **W39-7** | API gateway + GraphQL + webhooks | Coder + DevOps | 🔄 DISPATCHED | GraphQL gateway (Yoga/Apollo), webhook HMAC, rate limiting, OpenAPI 3.1 |
| **W39-8** | Wave summary (this doc) | Coordinator + QA | ✅ DONE | docs/WAVE-39-SUMMARY.md + docs/WAVE-40-FULL-PUBLIC-PLAN.md |

**Total Wave 39 LOC budget:** 18.000–26.000 (código + docs + tests) · **Cash budget:** R$12k–22k (influencer + ads + App Store fees + CDN) · **Team:** 8–10 person-weeks

---

## Estado no momento do commit

### Repo state

- **Branch:** main
- **HEAD local:** `30dcbe96` (W38 community: challenges + circles + badges)
- **Divergence:** 81 ahead / 221 behind origin/main (wave-spawner cron race condition carryover)
- **Working tree:** 273 staged deletes from W38 race (PRESERVED — não limpar, evitar perda de trabalho)
- **Push status:** NÃO PUSHED (per Wave 39 constraint: docs + commit only, owner review antes de push)

### Coordination note

Wave 39 disparada com 8 workers paralelos. Race condition Wave 38 carryover (`.git/index` corrompido + last-writer-wins) ainda é risco. Mitigation aplicada:

- Cada worker W39-N opera em **branch isolado** (`w39-N-*`), não em main
- Coordinação via file-path leases (paths únicos por worker)
- Merge gate após cada worker finalizar — coordinator valida antes de squash
- WAVE-LOG.md atualizado a cada checkpoint

### Wave 39 — Trigger conditions

- Wave 4 = CONSTRAINED (100 users) ou GO (500 users) launched ✅
- Wave 38 disposition decided ✅
- Owner ack Wave 39 budget + coordination lock strategy ⏳ (pendente)

---

## Wave 39 — Deliverables por worker

### W39-1 — TSC per-file fix 🔄

**Problema Wave 38:** `tsc --noEmit` full-project crashed com OOM em sandbox 2GB; ~360 zombie tsc processes paralelos corromperam `.git/index`. Wave 38 community work sobreviveu por sorte.

**Solução Wave 39:**

1. **Scoped tsconfig per worker:**
   ```json
   // tsconfig.w39-1.json
   {
     "extends": "./tsconfig.json",
     "include": ["src/types/**/*", "src/lib/akasha/**/*"]
   }
   ```
2. **Per-file validation script** (`scripts/tsc-per-file.sh`): itera arquivos changed vs `main`, roda `tsc --noEmit <file>` individualmente, agrega resultados
3. **Timeout enforcement:** `timeout 60 npx tsc --noEmit --project tsconfig.w39-1.json`
4. **Lock file** `.tsc.lock` para serializar runs
5. **Recovery runbook** (`docs/runbooks/tsc-corruption-recovery.md`)

**SLA:** 7 dias · **Output:** tsconfig scoped + script + runbook · **Status:** em progresso (W39-1 worker)

### W39-2 — Marketing scale 🔄

**Ativação PT-BR spirituality audience:**

- **Influencer partnerships:** 5–10 contratados (R$500–2k fee OU revenue share), yoga teachers, priests, spiritual leaders, herbalists, astrologers
- **Co-branded content:** 3 posts/vídeos por influencer, UTM tracking, affiliate links
- **Paid ads:** Meta Ads + Google Ads (R$5k budget test), audience PT-BR spirituality age 25–55 female 60%, CAC target <R$15, ROAS target >2x
- **Partnership deals:** 5 deals com yoga studios/herbalists/astrologers (revenue share 70/30), co-branded offerings

**Outputs:**
- `docs/influencer-partnerships-W39.md` (lista + contratos + UTM tracker)
- `docs/paid-ads-W39.md` (campaigns + creative assets + métricas baseline)
- `docs/partnership-deals-W39.md` (5 deals + onboarding pipeline)

**SLA:** 14–21 dias · **Status:** dispatched

### W39-3 — Akasha production hardening 🔄

**Akasha (LLM eval) production-grade:**

1. **Latency:** p95 <800ms para eval requests (streaming + parallel scoring)
2. **Cost:** <R$0.02/req (model tier optimization + caching + batching)
3. **Observability:** OpenTelemetry traces + Prometheus metrics + Grafana dashboard
4. **Rate limiting:** per-user + per-org tier-based
5. **Fallback chain:** primary model → cheaper model → static safety response
6. **Eval dataset v2:** 500+ prompts covering edge cases (religious content, PT-BR slang, dual-faith users)

**Outputs:**
- `src/lib/akasha/prod/` (production code)
- `infra/observability/grafana-akasha.json` (dashboard)
- `docs/akasha-prod-readiness-W39.md` (runbook + SLOs)

**SLA:** 14 dias · **Status:** dispatched

### W39-4 — Community health at scale 🔄

**Community não pode quebrar com growth:**

1. **Auto-mod v2:** ML classifier (toxicity + spam + off-topic), feedback loop com moderator decisions
2. **Trust scoring:** user reputation (0–100), baseado em account age, post quality, mod history, peer endorsements
3. **Retention loops:** D7/D30 cohort analysis, re-engagement emails, personalized digest
4. **Moderator dashboard v2:** queue prioritization (trust score + severity), bulk actions, audit log
5. **Crisis playbook:** viral conflict response, mass-report handling, temporary lockdowns

**Outputs:**
- `src/lib/community/auto-mod-v2/`
- `src/app/admin/moderation/dashboard-v2/`
- `docs/community-health-W39.md`

**SLA:** 14 dias · **Status:** dispatched

### W39-5 — Mobile apps native (Expo + iOS + Android) 🔄

**PWA atual não é suficiente para public launch:**

1. **Expo SDK 53** + EAS Build (cloud builds para iOS/Android)
2. **Native modules:** push notifications (expo-notifications), in-app purchases (expo-iap), biometric auth (expo-local-authentication)
3. **App Store + Play Store submission:** metadata, screenshots, privacy policy, age rating
4. **Code signing + CI:** EAS Submit, fastlane, certificates management
5. **OTA updates:** expo-updates para hotfixes sem app store review

**Outputs:**
- `mobile/` (Expo project root)
- `eas.json` (build config)
- `app-store-metadata/` (PT-BR + EN)
- `docs/mobile-apps-W39.md`

**SLA:** 21 dias · **Status:** dispatched (long-running, paraleliza com W39-6/7)

### W39-6 — Video streaming HLS + CDN 🔄

**Live streaming + recorded video events precisam escalar:**

1. **HLS adaptive bitrate:** 4 renditions (240p/480p/720p/1080p), FFmpeg pipeline
2. **CDN:** CloudFront ou Fastly, signed URLs (token expiry 1h), geo-restriction
3. **Live ingest:** RTMP server (nginx-rtmp ou mediasoup), DVR window 24h
4. **Storage:** S3 (origem) + CloudFront (edge), lifecycle policy (recorded → IA após 30d → Glacier após 90d)
5. **Player:** video.js + hls.js, accessibility (captions, audio description)

**Outputs:**
- `infra/video/` (Terraform)
- `src/lib/video/hls-player.ts`
- `docs/video-streaming-W39.md` (architecture + cost estimate)

**SLA:** 14 dias · **Status:** dispatched

### W39-7 — API gateway + GraphQL + webhooks 🔄

**Third-party developers + power users precisam de surface programática:**

1. **GraphQL gateway:** Yoga ou Apollo Server, schema-first, DataLoader para N+1 prevention
2. **REST API v1:** `/api/v1/*` (legacy + non-GraphQL use cases), OpenAPI 3.1 spec
3. **Webhooks:** outbound events (post.created, user.joined, payment.completed), HMAC-SHA256 signing
4. **Rate limiting:** per-token + per-IP, Redis-backed sliding window
5. **Auth:** OAuth 2.0 + API keys (per-developer), scopes (read:posts, write:posts, admin:*)
6. **Developer portal:** docs site (Mintlify ou Docusaurus), API explorer (GraphQL Playground)

**Outputs:**
- `src/lib/api-gateway/`
- `src/app/api/v1/[...]/route.ts`
- `docs/api-gateway-W39.md`
- `developer-portal/` (separate docs site)

**SLA:** 21 dias · **Status:** dispatched

### W39-8 — Wave summary ✅

**Este documento + Wave 40 plan.**

**Outputs:**
- `docs/WAVE-39-SUMMARY.md` (este arquivo)
- `docs/WAVE-40-FULL-PUBLIC-PLAN.md` (full public + Series A)

---

## Wave 39 — Stop conditions

| Trigger | Action |
|---------|--------|
| Conversion (waitlist → invite) <5% após 14d | PIVOT marketing strategy, pausa ads |
| Akasha eval p95 >1.2s por 3 dias consecutivos | ROLLBACK para modelo anterior, investiga |
| Mobile app rejection (App Store + Play Store) | FIX metadata + appeal, paraleliza web |
| HLS playback error rate >2% | ROLLBACK para progressive MP4, re-engineer |
| GraphQL gateway error rate >1% | ROLLBACK para REST-only, re-launch |
| Coordination lock falhar (race condition Wave 38 repetition) | PAUSE Wave 39, FIX infrastructure |

---

## Cross-project lessons (Wave 39 interim)

1. **Scoped tsc + per-file validation é a única solução viável em sandbox 2GB.** Full-project tsc é OOM-prone. Pattern: `tsconfig.w39-N.json` per worker + timeout + lock file. Universal para qualquer monorepo em ambiente constrained.
2. **Multi-agent race condition mitigation via file-path leases** é o caminho. Wave 38 stomp evidence (.git/index corrupto, last-writer-wins) confirma que sem leases, parallel commits em shared main = perda de trabalho. Wave 39 aplica leases + branch-per-worker.
3. **Mobile apps não são "nice to have" para public launch spirituality app.** PT-BR audience espera app store presence como sinal de legitimacy. PWA-only = red flag de "side project". Wave 39 corrige isso.
4. **Video streaming + GraphQL gateway são Wave 39 P0, não P1.** Comunidade espiritual consome conteúdo audiovisual (rituals, ceremonies, lectures) e power-user developers (curadores, integradores) precisam de API. Wave 39 alinha prioridades com realidade de uso.
5. **Akasha (LLM eval) precisa SLOs explícitos** (latency, cost, fallback). Sem SLO, modelo vira black box com bill surpresa. Wave 39 implementa OpenTelemetry + Prometheus desde o início.

---

## Status por deliverable

| Worker | Output esperado | Status | Bloqueios |
|--------|----------------|--------|-----------|
| W39-1 | scoped tsconfig + script + runbook | 🔄 in progress | sandbox OOM retry |
| W39-2 | partnerships + ads + deals docs | 🔄 dispatched | owner ack budget |
| W39-3 | prod code + observability + SLOs | 🔄 dispatched | OpenTelemetry setup |
| W39-4 | auto-mod v2 + dashboard v2 | 🔄 dispatched | dataset labeling |
| W39-5 | Expo project + EAS config + submission | 🔄 dispatched | Apple/Google dev accounts |
| W39-6 | HLS pipeline + CDN + signed URLs | 🔄 dispatched | CDN provider decision |
| W39-7 | GraphQL gateway + REST v1 + webhooks | 🔄 dispatched | OAuth provider choice |
| W39-8 | docs/WAVE-39-SUMMARY + WAVE-40 plan | ✅ DONE | — |

**Total Wave 39 deliverables:** 7 em progresso + 1 done · **Risco:** W39-5 + W39-6 são long-running (21d SLA), podem escorregar para Wave 40.

---

## Próximo passo

### Coordinator (este agente)

1. ✅ Compilar WAVE-39-SUMMARY.md (este doc)
2. ✅ Compilar WAVE-40-FULL-PUBLIC-PLAN.md (next doc)
3. ✅ Commit `docs(summary): wave 39 + plan 40 full public`
4. ⏸️ NÃO push (owner review gate)
5. ⏸️ Report via communicate

### Owner (review antes de Wave 39 → Wave 40 handoff)

1. Review WAVE-39-SUMMARY.md (~10min)
2. Review WAVE-40-FULL-PUBLIC-PLAN.md (~15min)
3. Ack Wave 39 budget: R$12k–22k cash + 8–10 person-weeks
4. Ack Wave 40 budget: R$30k–50k (Series A prep + team scaling)
5. Decide mobile app store priority: iOS first ou Android first?
6. Decide CDN provider: CloudFront vs Fastly vs Bunny.net?
7. Decide Series A timeline: Q4 2026 ou Q1 2027?

### Wave-spawner

- **Pausar** auto-dispatch Wave 39 → Wave 40 até owner ack
- Wave 39 workers podem completar em background; coordenar merge gate via file-path leases
- Wave 40 trigger condition: Wave 39 = 7/8 ✅ + owner ack budget + traction ≥ 1000 MAU

---

## Refs

- `docs/WAVE-38-SUMMARY.md` (Wave 38 honest state — community features shipped despite race condition)
- `docs/WAVE-39-40-PLAN.md` (plan anterior, mantém como referência histórica)
- `docs/WAVE-38-40-PLAN.md` (plan original Wave 38–40, mantém como referência)
- `docs/WAVE-LOG.md` (append-only log, 1MB+, todas as waves desde W1)
- `docs/runbooks/tsc-corruption-recovery.md` (a ser criado por W39-1)