# Documento 22 — Observabilidade & Operação
## Sistema Akasha
> **Norte:** Doc 25.
> **Tipo:** Decisão de arquitetura — observabilidade, auditoria, custo de IA (atrelado a créditos), resiliência e operação no **VPS Linux soberano**.
> **Versão:** 2.1 | **Data:** 2026-06-06
> **Função:** tornar o Akasha **operável e auditável** — não se evolui rápido o que não se observa. Foca o portal B2C (`apps/b2c-portal`) sobre VPS Linux (Docker + PM2, Doc 25 §10); o Cockpit legado (`apps/legacy-cockpit`) está fora.

---

## 1. Diagnóstico — primitivos que já existem (e o que falta)

| Primitivo presente | Onde | Lacuna |
|---|---|---|
| Logger singleton + `generateRequestId()` | `lib/logging.ts`, usado no `middleware.ts` | sem **convenção** de campos nem propagação do `requestId` às rotas |
| Rate limiting + monitor | `lib/rate-limit.ts`, `rate-limit-monitor.ts`, `middleware.ts` | ok; documentar limites por rota |
| SSE helper | `lib/sse.ts` (Dashboard/`consult` usam) | sem política de timeout/reconexão/persistência parcial |
| Health check | `/api/health` (db + redis + version + uptime) | falta distinção **liveness × readiness**; ainda não cobre Ollama nem o cronjob astrológico |
| Custo de IA | `tokensUsed` + `llmModel` persistidos (`Manifesto`, `DailyReading`, `ChatMessage`) | **sem agregação/orçamento/alerta**; consumo precisa **fechar com o débito de créditos** (Doc 25 §7) |
| Auditoria de sessão | sessão JWT do `User` B2C (cookie httpOnly, Doc 04) | falta auditar **ações de negócio B2C** (gerar Manifesto/Dashboard, consulta oracular, **pagamento e movimentação de créditos**) |

**Conclusão:** há boa fundação, mas **dispersa e sem contrato**. Este doc define a arquitetura de observabilidade do portal B2C sobre o VPS soberano.

---

## 2. Princípios

> **AD-22.1 — Observabilidade orientada ao portal B2C.** Instrumentar o `apps/b2c-portal` (onboarding, chart, daily, manifesto, consult, stripe, grimoire-sync) + as três camadas de inteligência (Doc 25 §4) + os cronjobs/contêineres do VPS (Postgres, Redis, Ollama). Nada de telemetria no `legacy-cockpit`.
>
> **AD-22.2 — Privacidade por padrão (dados sagrados/sensíveis).** Nome, data/hora/local de nascimento e mapas natais do **usuário final** são **dados pessoais sensíveis** (LGPD). **Nunca** logar PII nem conteúdo de Manifesto/Dashboard/consulta em texto puro. Logs referenciam por **ID** (`userId`, `readingId`, `consultationId`), nunca por conteúdo. Segredos (`JWT_SECRET`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `GITHUB_WEBHOOK_SECRET`) jamais aparecem em logs. O Grimório roda em Ollama local (`localhost:11434`) — nenhum dado sensível trafega na internet pública (Doc 25 §5).

---

## 3. Logging Estruturado & Tracing

> **AD-22.3 — Log estruturado (JSON) com `requestId` propagado ponta-a-ponta.** O `middleware` já gera `X-Request-Id`; toda rota o lê e o inclui em cada linha de log. Campos canônicos:
> ```
> { ts, level, requestId, route, userId?, event, durationMs?, status?, meta? }
> ```
> - **Níveis:** `error` (falha que exige ação) · `warn` (degradação/limite) · `info` (eventos de negócio) · `debug` (dev).
> - **`event`** é um enum estável (ex.: `chart.created`, `manifesto.generated`, `daily.generated`, `consult.answered`, `credits.debited`, `payment.succeeded`, `grimoire.synced`, `auth.login`, `llm.call`, `embedding.generated`) — facilita busca e métricas derivadas de log.
> - **Proibido em `meta`:** PII e segredos (AD-22.2). Para conteúdo, registrar tamanho/contagem (ex.: `pillarsAnalyzed: 4`, `tokens: 1500`, `creditCost: 3`), não o texto.

---

## 4. Trilha de Auditoria do Usuário (consulta · pagamento · créditos)

> **AD-22.4 — Auditar ações de negócio, não só login.** Além da sessão JWT (autenticação), registrar (log `info` + opcionalmente tabela `AuditEvent`) as ações que tocam dados, dinheiro ou créditos do usuário:
> | Ação | `event` | Campos (sem PII) |
> |---|---|---|
> | Login/logout | `auth.login` / `auth.logout` | userId, ip-hash, sessionId |
> | Onboarding → 4 mapas | `chart.created` | userId, pillars: 4, incomplete? |
> | Gerar Manifesto | `manifesto.generated` | userId, tokens, llmModel, durationMs |
> | Dashboard Diário | `daily.generated` | userId, date, tensionPoint, tokens, llmModel |
> | Consulta Oracular (Q&A) | `consult.answered` | userId, consultationId, routedPillars, grimoireRefs, creditCost |
> | Movimentação de créditos | `credits.debited` / `credits.granted` | userId, delta, reason, balance |
> | Pagamento (Stripe) | `payment.succeeded` / `payment.failed` / `subscription.updated` | userId, plan, stripeEventId, amount |
> | Sync do Grimório | `grimoire.synced` | entriesUpserted, durationMs, trigger (webhook\|admin) |
>
> **Conciliação crédito × custo (AD-22.5):** todo `consult.answered` que debita créditos deve casar com um `credits.debited` de mesmo `consultationId` — o ledger de créditos (`CreditEntry`, Doc 04) é a fonte de verdade financeira; o log é a trilha de auditoria.
>
> **Decisão de persistência:** começar por **log estruturado** (barato); promover a uma tabela `AuditEvent` (Prisma) **se/quando** o volume B2C ou exigência de compliance (LGPD/Stripe) justificar. O `CreditEntry` já é persistido (não é opcional — é o razão financeiro). Não criar `AuditEvent` antes da necessidade (evita over-engineering).

---

## 5. Observabilidade de IA (custo, créditos & qualidade)

A IA é o maior custo variável e o coração da qualidade — e no Akasha ela está **atrelada a créditos** (Doc 25 §7: "o usuário paga pelo peso que exige"). Precisa ser medida e conciliada.

> **AD-22.5 — Toda chamada de LLM é instrumentada, contabilizada e conciliada com créditos.**
> - **Persistir uso em todas as gerações:** `tokensUsed`/`llmModel` no `Manifesto`, na `DailyReading` e na `ChatMessage` do ORACLE. Assim todo gasto fica rastreável por usuário/consulta.
> - **Conciliação econômica (a genialidade do modelo):** o **custo computacional (tokens)** de cada consulta deve fechar com o **débito de créditos** (`CreditEntry`: ritual = −1, pergunta complexa = −3, Doc 04/25 §7). O painel cruza *tokens consumidos × créditos debitados × custo real do modelo* para validar que a precificação cobre o custo de IA.
> - **Métrica derivada:** custo por Manifesto, por Dashboard e por consulta (tokens × preço do modelo por env). Como o céu do dia é calculado **uma vez** e cacheado no Redis (Doc 25 §10), o custo de efeméride é amortizado entre todos os usuários. Embeddings via Ollama local têm **custo marginal ~zero** (soberania, Doc 25 §5) — registrar `embedding.generated` para volume, não para custo monetário.
> - **Orçamento & alerta:** env `LLM_DAILY_TOKEN_BUDGET` (opcional); ao exceder, `warn` no log e degradação graciosa (recusar nova geração com mensagem clara, **sem debitar crédito do usuário**, não estourar custo).
> - **Qualidade:** `event: daily.generated`/`manifesto.generated` registra `pillarsAnalyzed: 4`, `synthesisPresent`, `grimoireRefs` — sinais para auditar se a saída cruzou os 4 pilares e citou o Grimório (anti-alucinação, Doc 25 §5) sem ler o conteúdo.

> **AD-22.6 — Modelo e parâmetros sempre por env e logados.** `SYNTHESIS_MODEL` (OpenAI/Gemini) + `EMBEDDING_MODEL` (`nomic-embed-text`) + `temperature`/`max_tokens` entram no log da chamada (`event: llm.call`) para correlacionar custo/qualidade com configuração (Doc 03 §5).

---

## 6. Resiliência de Streaming (SSE)

O Manifesto, o Dashboard Diário e a Consulta Oracular usam SSE (Doc 03 §4). Streams falham no meio.

> **AD-22.7 — Streaming tolerante a falha com persistência incremental.**
> - **Persistência parcial:** cada camada/seção concluída na geração do Manifesto (núcleo, geometria, teia, anel, síntese — Doc 04 §4) é gravada **imediatamente** — se o stream cair, o que foi gerado **não se perde**; a UI retoma pelas seções faltantes.
> - **Estado fiel:** em erro de LLM, a geração marca estado `ERROR` e o evento SSE `error` informa a UI; retry reabre a geração. **Nenhum crédito é debitado em falha** (AD-22.5).
> - **Timeouts:** definir teto por chamada (ex.: 60s para o Manifesto dos 4 pilares) e por token-stream ocioso; abortar com `error` claro, nunca pendurar (no VPS, um stream pendurado segura um worker do PM2).
> - **Consulta Oracular** persiste a resposta do ORACLE só quando há resposta completa — em falha, não grava resposta vazia nem debita crédito.

---

## 7. Saúde, Prontidão & Erros

> **AD-22.8 — Separar liveness de readiness.** `/api/health` distingue:
> - **liveness** (`/api/health/live`): o processo responde — não toca dependências.
> - **readiness** (`/api/health` atual): **Postgres+pgvector + Redis + Ollama (`localhost:11434`)** ok → apto a servir. PM2/Docker healthcheck usa readiness; o `legacy-cockpit` não conta. Sinal extra recomendado: presença do céu do dia no Redis (`transitos_diarios:AAAA-MM-DD`) — se o cronjob da meia-noite falhou, o Dashboard degrada.

> **AD-22.9 — Taxonomia de erros HTTP padronizada (já praticada nas rotas):**
> `400` validação (Zod) · `401` sem sessão · `402` créditos insuficientes (consulta oracular) · `404` recurso inexistente · `429` rate limit · `500` erro interno · `502` LLM/Ollama falhou · `503` dependência ausente (ex.: `SYNTHESIS_MODEL`/`OLLAMA_URL`). Corpo de erro sempre `{ error, details? }` — sem stack trace nem PII ao cliente.

---

## 8. Privacidade, Retenção & Segredos (operação)

> **AD-22.10 — Ciclo de vida dos dados sensíveis.**
>
> **Minimização de dados:** logs contêm apenas IDs (`userId`, `readingId`, `consultationId`), nunca PII ou conteúdo. Dados pessoais sensíveis (nome, data/hora/local de nascimento, conteúdo de Manifesto/Dashboard/chat) existem exclusivamente no PostgreSQL **do VPS soberano**, nunca em log, telemetria externa ou serviços de terceiros.
>
> **Períodos de retenção:**
>
> | Dado | Retenção | Destino após expiração |
> |---|---|---|
> | Conta (`User`) + mapa natal (`BirthChart`) | Enquanto a conta existir | Exclusão a pedido do próprio usuário (self-service) |
> | Manifesto / Dashboards (`Manifesto`, `DailyReading`) | Enquanto existir o `User` | Exclusão em cascata via FK `CASCADE` |
> | Consultas Oraculares (`Consultation`/`ChatMessage`) | Enquanto existir o `User` | Exclusão em cascata |
> | Razão de créditos (`CreditEntry`) | Enquanto existir o `User` (histórico financeiro) | Exclusão em cascata; espelho fiscal no Stripe |
> | Logs de auditoria (console JSON estruturado) | 90 dias rolling | Descarte (journald/`pm2-logrotate` no VPS) |
> | Sessões JWT do `User` (refresh) | 30 dias após `logout` ou expiração | Exclusão por `cron` noturno (PM2) |
>
> **Exclusão a pedido (LGPD/GDPR — direito ao apagamento):**
> No B2C, o usuário é **self-service**: a rota autenticada `DELETE /api/conta` apaga a própria conta e tudo em cascata (`User` → `BirthChart`, `Manifesto`, `DailyReading`, `Consultation`, `CreditEntry`) e cancela a assinatura no Stripe. Operação destrutiva confirmada pelo próprio dono da sessão (não por e-mail/SMS de terceiro). Script administrativo equivalente, por `userId` (nunca por nome em log):
> ```bash
> node -e "
>   const { PrismaClient } = require('@prisma/client');
>   const prisma = new PrismaClient();
>   async function main() {
>     // userId obtido pela sessão autenticada / painel admin — sem PII no log
>     await prisma.user.delete({ where: { id: process.env.USER_ID } });
>     console.log('Excluído:', process.env.USER_ID);
>   }
>   main().finally(() => prisma.\$disconnect());
> "
> ```
>
> **Exportação a pedido (LGPD/GDPR — direito à portabilidade):** rota autenticada `GET /api/conta/export` devolve, para o **próprio** usuário, um JSON com conta, mapa natal, Manifesto, Dashboards, consultas e razão de créditos. Equivalente administrativo:
> ```bash
> node -e "
>   const { PrismaClient } = require('@prisma/client');
>   const fs = require('fs');
>   const prisma = new PrismaClient();
>   async function main() {
>     const user = await prisma.user.findUnique({
>       where: { id: process.env.USER_ID },
>       include: { birthChart: true, manifesto: true, dailyReadings: true, consultations: { include: { messages: true } }, creditLedger: true },
>     });
>     fs.writeFileSync('export.json', JSON.stringify(user, null, 2));
>     console.log('Exportado para export.json');
>   }
>   main().finally(() => prisma.\$disconnect());
> "
> ```
>
> **Segredos:** `JWT_SECRET`/`OPENAI_API_KEY`/`STRIPE_SECRET_KEY`/`GITHUB_WEBHOOK_SECRET` só em env do servidor (`.env` do VPS, fora do git; gerido por PM2/Docker secrets); rotação documentada no runbook (§9). Fallback dev de `JWT_SECRET` **proibido em produção** (já lança erro). O `OLLAMA_URL` aponta para `localhost` — nunca exposto externamente.

## 9. Runbook Operacional (VPS Linux soberano)

> **AD-22.11 — Runbook versionado.** Procedimentos essenciais para operação em produção. Aplica-se ao portal B2C (`apps/b2c-portal`) sobre VPS Linux (systemd + Node.js, Doc 25 §10). Última atualização: 2026-06-06 (Onda 3 launch readiness).

> ### 9.1 Topologia
>
> | Componente | Hospedagem | Portas | Saúde |
> |---|---|---|---|
> | Next.js 16 (`b2c-portal`) | systemd `cabala-app.service` (Node 20+ direto, sem Docker) | 3000 (interna, atrás de nginx) | `systemctl status cabala-app` |
> | PostgreSQL 16 + pgvector | systemd `postgresql.service` (nativo) | 5432 | `pg_isready` |
> | Redis 7 | systemd `redis-server.service` | 6379 | `redis-cli ping` |
> | Ollama (`nomic-embed-text`) | systemd `ollama.service` | 11434 (localhost) | `curl localhost:11434/api/tags` |
> | Cron trânsitos diários | systemd timer `cabala-transits.timer` (00:00 UTC) | — | `systemctl list-timers cabala-transits` |
> | Cron backup DB | systemd timer `cabala-backup.timer` (03:00 UTC) | — | `systemctl list-timers cabala-backup` |
> | nginx | reverse proxy + TLS (Let's Encrypt) | 80/443 | `nginx -t` |
>
> ### 9.2 Deploy (VPS soberano, Next.js monolith)
>
> **Pré-requisitos:**
> - Acesso SSH ao VPS Ubuntu 22.04+ com systemd, Node.js 20+, PostgreSQL 16, Redis 7, Ollama, nginx
> - `pgvector` instalado no Postgres: `CREATE EXTENSION IF NOT EXISTS vector;`
> - Ollama com modelo: `ollama pull nomic-embed-text`
> - Usuário deploy com permissões `systemctl` (sudo) e ownership de `/opt/cabala`
>
> **Passos do deploy (rolling):**
> 1. `cd /opt/cabala && git fetch origin && git checkout main && git pull`
> 2. `npm ci` (instala dependências de produção; sem `devDependencies` desnecessárias em prod)
> 3. `npx prisma migrate deploy` (aplica migrations não-aplicadas; idempotente)
> 4. `npm run build` (Next.js build; gera `.next/`)
> 5. `npm run grimoire:sync` (reindexa apenas entries novos/modificados)
> 6. `sudo systemctl reload cabala-app` (systemd recarrega Node.js; zero downtime)
> 7. Conferir: `curl -fsS https://akasha.seudominio.com/api/health/ready`
> 8. Conferir cron: `systemctl list-timers cabala-transits cabala-backup`
>
> **Variáveis obrigatórias** (em `/etc/cabala/app.env`, mode 600, owner root):
> | Variável | Obrigatória | Notas |
> |---|---|---|
> | `DATABASE_URL` | ✅ | `postgresql://cabala:***@localhost:5432/cabala` |
> | `REDIS_URL` | ✅ | `redis://localhost:6379/0` |
> | `OLLAMA_URL` | ✅ | `http://localhost:11434` (rede local) |
> | `EMBEDDING_MODEL` | ✅ | `nomic-embed-text` |
> | `SYNTHESIS_MODEL` | ✅ | ex.: `gpt-4o` (Camada 3) |
> | `OPENAI_API_KEY` / `MINIMAX_API_TOKEN` | ✅ | Síntese |
> | `JWT_SECRET` | ✅ | `openssl rand -hex 32`; ≥ 32 bytes |
> | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | ✅ | Pagamentos |
> | `GITHUB_WEBHOOK_SECRET` | ✅ | Assina `grimoire-sync` |
> | `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` / `VAPID_SUBJECT` | ✅ | Web Push |
> | `NOMINATIM_URL` | ✅ | Geolocalização (Doc 23) |
> | `TRANSITS_FALLBACK_PATH` | opcional | `/var/lib/cabala/transitos_fallback.json` (default `/tmp/transitos_diarios.json`) |
> | `BACKUP_DIR` | opcional | `/var/backups/cabala` (default) |
> | `BACKUP_RETENTION_DAYS` | opcional | `7` (default) |
> | `ALLOWED_ORIGINS` | ✅ | Origens CORS (Doc 22 §2) |
> | `SLACK_WEBHOOK_URL` | opcional | Alertas de healthcheck em `#akasha-ops` |
>
> **Rotação de segredos (trimestral):**
> 1. Gerar novo `JWT_SECRET` / `STRIPE_WEBHOOK_SECRET` / etc. (`openssl rand -hex 32`)
> 2. Atualizar `/etc/cabala/app.env`
> 3. `sudo systemctl reload cabala-app`
> 4. **JWT_SECRET**: todos os tokens existentes são invalidados; usuários precisarão logar novamente (sessões persistidas em cookie httpOnly são perdidas — esperado)
> 5. **STRIPE_WEBHOOK_SECRET**: rotação exige atualizar endpoint no dashboard Stripe
>
> ### 9.3 Verificação pós-deploy (Smoke Test)
>
> ```bash
> # 1. Health readiness (db + redis + ollama + transitos)
> curl -fsS https://akasha.seudominio.com/api/health/ready
> # Esperado: { "status": "ready", "checks": { "db": "ok", "redis": "ok", "ollama": "ok" } }
>
> # 2. Cronjobs rodando
> systemctl list-timers cabala-transits cabala-backup
> # Esperado: ambos com NEXT < 24h
>
> # 3. Céu do dia presente no Redis
> redis-cli EXISTS transitos_diarios:$(date -u +%Y-%m-%d)
> # Esperado: 1
>
> # 4. Grimoire status
> npm run grimoire:status
> # Esperado: total ≥ 50 (botânica), withEmbedding > 0, biblioteca=botanica populada
> ```
>
> ### 9.4 Backup & Restore
>
> **Estratégia de backup (3-2-1 simplificado):**
> - **Postgres**: `pg_dump` diário às 03:00 UTC → `/var/backups/cabala/db-YYYY-MM-DD.sql.gz` (retenção 7 dias local; replicação off-site via `rsync` ou `restic` configurada pelo operador)
> - **pgvector**: incluído no `pg_dump` (vetores são bytea; embutidos no dump)
> - **Grimório**: a fonte de verdade é o **repositório Git** (`grimoire/**/*.md`); reindexável a qualquer momento via `npm run grimoire:sync` — não exige backup do banco
> - **Redis**: efêmero por design (céu do dia recalculável a partir do cronjob); não exige restore
>
> **Backup manual:**
> ```bash
> sudo /opt/cabala/scripts/backup-db.sh
> # Cria /var/backups/cabala/db-$(date +%F).sql.gz
> ```
>
> **Restore (em staging, ANTES de produção):**
> ```bash
> sudo /opt/cabala/scripts/restore-db.sh /var/backups/cabala/db-2026-06-06.sql.gz
> # Drop + recreate DB, aplica dump, reindexa grimório
> ```
>
> **Smoke test de restore (mensal, recomendado):**
> 1. Subir contêiner Postgres staging com a mesma versão
> 2. Rodar `restore-db.sh` contra o staging
> 3. Verificar: contagem de usuários ≥ produção, contagem de embeddings > 0, índice `grimoire_embedding_idx` existe
> 4. Documentar resultado em `logs/restore-test-YYYY-MM-DD.log`
>
> **Falha de restore:** se `pgvector` não carregar, o dump é de versão incompatível — restaurar Postgres exato (`apt install postgresql-16-pgvector`) antes de aplicar.
>
> ### 9.5 Resposta a Incidentes
>
> **LLM de síntese 5xx (OpenAI/Minimax retorna HTTP 500/502/503):**
> - A geração marca estado `ERROR`; **nenhum crédito é debitado** (AD-22.5)
> - Logs: `journalctl -u cabala-app | grep 'event.*llm.call' | grep 'status.*5'`
> - Ação: verificar status do provedor; se prolongada, ajustar `SYNTHESIS_MODEL` para modelo mais barato como fallback
>
> **Ollama indisponível (embeddings):**
> - Sintoma: `ollama: down` no readiness; `grimoire:sync` falha; busca híbrida degrada para JSONB puro
> - Ação: `sudo systemctl restart ollama && sudo -u ollama ollama pull nomic-embed-text`
> - Camada 3 anti-alucinação continua funcional (usa apenas os IDs retornados pelo `searchGrimoire`)
>
> **Cronjob de trânsitos falhou (`event: transits.fallback` no log):**
> - Sintoma: smoke test #3 retorna 0; Dashboard Diário degrada
> - Ação: `sudo systemctl start cabala-transits.service` (roda imediatamente); conferir `/var/lib/cabala/transitos_fallback.json` foi escrito
> - Investigar causa raiz nos logs: `journalctl -u cabala-transits.service -n 50`
>
> **Rate limit (HTTP 429):**
> - Ler `X-RateLimit-Remaining` no header
> - Ajustar `RATE_LIMIT_*` em `middleware.ts` ou env vars
>
> **Créditos divergentes (reconciliação):**
> - Rodar `POST /api/admin/credits/reconcile` (Doc 25 §8) — devolve over-debits automaticamente; under-debits marcados para revisão manual
> - Painel admin: `admin/credits` (a implementar)
>
> **Postgres indisponível:**
> - Sintoma: readiness `db: down`; rotas 5xx
> - Ação: `sudo systemctl restart postgresql`; conferir `journalctl -u postgresql -n 50`
> - Se corrupção: `restore-db.sh` a partir do último backup íntegro
>
> **Disco cheio (pgvector dumps + logs):**
> - Sintoma: erros `ENOSPC` em logs
> - Ação: `journalctl --vacuum-size=100M` (rotação); verificar `/var/backups/cabala` e rotacionar
>
> ### 9.6 Rollback
>
> **Migration com problema:**
> 1. `npx prisma migrate resolve --rolled-back <migration_name>` (marca como revertida)
> 2. **Manter backup de DB dos últimos 7 dias** (config `BACKUP_RETENTION_DAYS=7`); restore se necessário
> 3. Aplicar migration corrigida em branch separada, re-mergear
>
> **Deploy com problema:**
> 1. `cd /opt/cabala && git checkout HEAD~1` (volta 1 commit)
> 2. `npm ci && npx prisma migrate deploy && npm run build`
> 3. `sudo systemctl reload cabala-app`
>
> **Backup de banco mantido por 7 dias** (regra LGPD + segurança operacional). Backups mais antigos são purgados por `backup-db.sh` automaticamente.
>
> ### 9.7 Alertas Slack (`#akasha-ops`)
>
> Quando `SLACK_WEBHOOK_URL` está configurado, o endpoint `/api/health/ready` posta no canal quando:
> - qualquer check retornar `down` ou `degraded` (Postgres / Redis / Ollama / céu do dia)
> - há 3 falhas consecutivas em 5 minutos (debounce)
>
> Formato da mensagem:
> ```
> 🚨 [akasha-prod] Readiness degraded
> Check: redis → down (transitos_diarios:2026-06-06 ausente)
> Time: 2026-06-06T03:14:22Z
> Action: sudo systemctl restart redis-server
> ```
Estado da Onda O (observabilidade) — base herdada do Cockpit, a reaplicar no `b2c-portal`:

- [x] Log estruturado JSON com `requestId` propagado; zero PII/segredos (AD-22.2/.3).
- [~] Eventos de negocio logados — **reenquadrar** para os eventos B2C (`chart.created`, `manifesto.generated`, `daily.generated`, `consult.answered`, `credits.debited`, `payment.succeeded`, `grimoire.synced`) (AD-22.4).
- [~] Persistência de tokens nas 3 gerações + **conciliação com créditos**; token budget com graceful degradation (AD-22.5).
- [x] SSE com persistencia incremental + timeout + estado `ERROR` fiel (AD-22.7).
- [~] liveness x readiness — **incluir Ollama e céu do dia**; taxonomia de erro 400/401/**402**/404/429/500/502/503 (AD-22.9).
- [~] Retenção/LGPD self-service (B2C) + runbook **VPS Linux** (Docker+PM2) documentado (AD-22.10/.11).

---

*Doc 22 é a referência canônica de observabilidade e operação. Instrumenta o portal B2C (Doc 25) sobre o VPS soberano (Doc 25 §10); protege os dados sensíveis do usuário (LGPD) e o custo da inteligência atrelado a créditos (Doc 25 §7) e ao Grimório (Doc 20).*
