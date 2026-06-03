# Documento 22 — Observabilidade & Operação

## Cabala dos Caminhos

> **Tipo:** Decisão de arquitetura — observabilidade, auditoria, custo de IA, resiliência e operação.
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Função:** tornar o produto **operável e auditável** — não se evolui rápido o que não se observa. Foca o núcleo B2B (Doc 17); o legado (Doc 16 AD-01) está fora.

---

## 1. Diagnóstico — primitivos que já existem (e o que falta)

| Primitivo presente | Onde | Lacuna |
|---|---|---|
| Logger singleton + `generateRequestId()` | `lib/logging.ts`, usado no `middleware.ts` | sem **convenção** de campos nem propagação do `requestId` às rotas |
| Rate limiting + monitor | `lib/rate-limit.ts`, `rate-limit-monitor.ts`, `middleware.ts` | ok; documentar limites por rota |
| SSE helper | `lib/sse.ts` (`consult` usa) | sem política de timeout/reconexão/persistência parcial |
| Health check | `/api/health` (db + redis + version + uptime) | falta distinção **liveness × readiness** |
| Custo de IA | `Report.tokensUsed` + `llmModel` persistidos | **sem agregação/orçamento/alerta**; `consult` não persiste tokens |
| Auditoria de sessão | modelo `OperatorSession` (revokedAt, "quem logou de onde") | falta auditar **ações de negócio** (gerar dossiê, criar cliente) |

**Conclusão:** há boa fundação, mas **dispersa e sem contrato**. Este doc define a arquitetura de observabilidade do produto único.

---

## 2. Princípios

> **AD-22.1 — Observabilidade orientada ao produto único.** Instrumentar apenas o núcleo B2B (cockpit + as 5 rotas + camadas de inteligência). Nada de telemetria no legado quarentenado.
>
> **AD-22.2 — Privacidade por padrão (dados sagrados/sensíveis).** Nome de certidão, data/hora/local de nascimento e mapas natais são **dados pessoais sensíveis**. **Nunca** logar PII nem conteúdo de dossiê/pergunta em texto puro. Logs referenciam por **ID** (`clientId`, `readingId`), nunca por conteúdo. Segredos (`JWT_SECRET`, `OPENAI_API_KEY`) jamais aparecem em logs.

---

## 3. Logging Estruturado & Tracing

> **AD-22.3 — Log estruturado (JSON) com `requestId` propagado ponta-a-ponta.** O `middleware` já gera `X-Request-Id`; toda rota o lê e o inclui em cada linha de log. Campos canônicos:
> ```
> { ts, level, requestId, route, operatorId?, event, durationMs?, status?, meta? }
> ```
> - **Níveis:** `error` (falha que exige ação) · `warn` (degradação/limite) · `info` (eventos de negócio) · `debug` (dev).
> - **`event`** é um enum estável (ex.: `reading.saved`, `dossier.generated`, `consult.answered`, `client.created`, `auth.login`, `llm.call`) — facilita busca e métricas derivadas de log.
> - **Proibido em `meta`:** PII e segredos (AD-22.2). Para conteúdo, registrar tamanho/contagem (ex.: `filledHouses: 36`, `tokens: 1500`), não o texto.

---

## 4. Trilha de Auditoria do Operator

> **AD-22.4 — Auditar ações de negócio, não só login.** Além do `OperatorSession` (autenticação), registrar (log `info` + opcionalmente tabela `AuditEvent`) as ações que tocam dados do consulente:
> | Ação | `event` | Campos (sem PII) |
> |---|---|---|
> | Login/logout | `auth.login` / `auth.logout` | operatorId, ip-hash, sessionId |
> | Criar/editar consulente | `client.created` / `client.updated` | operatorId, clientId |
> | Salvar tiragem | `reading.saved` | operatorId, readingId, filledHouses |
> | Gerar dossiê | `dossier.generated` | operatorId, readingId, tokens, llmModel, durationMs |
> | Consultar (Q&A) | `consult.answered` | operatorId, readingId, routedThemes, routedHouses |
>
> **Decisão de persistência:** começar por **log estruturado** (barato); promover a uma tabela `AuditEvent` (Prisma) **se/quando** houver multi-operador (Fase 3) ou exigência de compliance. Não criar a tabela antes da necessidade (evita over-engineering — Doc 09 §9).

---

## 5. Observabilidade de IA (custo & qualidade)

A IA é o maior custo variável e o coração da qualidade. Precisa ser medida.

> **AD-22.5 — Toda chamada de LLM é instrumentada e contabilizada.**
> - **Persistir uso em ambas as rotas:** `generate` já grava `tokensUsed`/`llmModel` no `Report`; **`consult` deve persistir** `tokensUsed` na `ChatMessage` do ORACLE (hoje não persiste). Assim todo gasto fica rastreável por leitura/consulta.
> - **Métrica derivada:** custo por dossiê e por consulta (tokens × preço do modelo por env). Painel mínimo: tokens/dia, custo/dia, custo médio por dossiê.
> - **Orçamento & alerta:** env `LLM_DAILY_TOKEN_BUDGET` (opcional); ao exceder, `warn` no log e degradação graciosa (recusar nova geração com mensagem clara, não estourar custo).
> - **Qualidade:** `event: dossier.generated` registra `housesAnalyzed`, `synthesisPresent` — sinais para auditar se o dossiê cumpriu a estrutura (3§ + síntese, Doc 06) sem ler o conteúdo.

> **AD-22.6 — Modelo e parâmetros sempre por env e logados.** `OPENAI_MODEL`/`ANTHROPIC_MODEL` (Doc 16 §6) + `temperature`/`max_tokens` entram no log da chamada (`event: llm.call`) para correlacionar custo/qualidade com configuração.

---

## 6. Resiliência de Streaming (SSE)

`generate` (Doc 18 AD-18.8) e `consult` usam SSE. Streams falham no meio.

> **AD-22.7 — Streaming tolerante a falha com persistência incremental.**
> - **Persistência parcial:** cada casa concluída no `generate` é gravada no `Report` **imediatamente** (já é cumulativo) — se o stream cair, o que foi gerado **não se perde**; a UI pode retomar pelas casas faltantes.
> - **Estado fiel:** em erro de LLM, `Reading` → `ERROR` (Doc 18 AD-18.9) e o evento SSE `error` informa a UI; retry reabre em `GENERATING`.
> - **Timeouts:** definir teto por chamada (ex.: 60s para dossiê de 36 casas, Doc 02 §D) e por token-stream ocioso; abortar com `error` claro, nunca pendurar.
> - **`consult`** persiste a resposta do ORACLE só quando há `fullAnswer` (já faz) — em falha, não grava resposta vazia.

---

## 7. Saúde, Prontidão & Erros

> **AD-22.8 — Separar liveness de readiness.** `/api/health` distingue:
> - **liveness** (`/api/health/live`): o processo responde — não toca dependências.
> - **readiness** (`/api/health` atual): db + redis ok → apto a servir. Deploy/orquestrador usa readiness; o legado quarentenado não conta.

> **AD-22.9 — Taxonomia de erros HTTP padronizada (já praticada nas rotas):**
> `400` validação (Zod) · `401` sem sessão · `404` recurso inexistente · `429` rate limit · `500` erro interno · `502` LLM falhou · `503` dependência ausente (ex.: `OPENAI_API_KEY`). Corpo de erro sempre `{ error, details? }` — sem stack trace nem PII ao cliente.

---

## 8. Privacidade, Retenção & Segredos (operação)

> **AD-22.10 — Ciclo de vida dos dados sensíveis.**
>
> **Minimização de dados:** logs contêm apenas IDs (`readingId`, `clientId`, `operatorId`), nunca PII ou conteúdo. Dados pessoais sensíveis (nome de certidão, data/hora/local de nascimento, conteúdo de dossiê/chat) existem exclusivamente no banco PostgreSQL, nunca em log, telemetria externa ou serviços de terceiros.
>
> **Períodos de retenção:**
>
> | Dado | Retenção | Destino após expiração |
> |---|---|---|
> | Leituras (`Reading`) + dossiê (`Report`) | Enquanto existir a `OperatorAccount` associateda | Exclusão em cascata via FK `CASCADE` |
> | Consultas Q&A (`ChatMessage`) | Enquanto existir a `Reading` associateda | Exclusão em cascata |
> | Clientes (`Client`) | Enquanto existir a `OperatorAccount` associateda | Exclusão em cascata |
> | Logs de auditoria (console JSON estruturado) | 90 dias rolling | Descarte (syslog/CloudWatch) |
> | Sessões de operador (`OperatorSession`) | 30 dias após `logout` ou expiração do token | Exclusão por `cron` noturno |
> | Tokens de refresh (`RefreshToken`) | 30 dias após revogação | Exclusão por `cron` noturno |
>
> **Exclusão a pedido (LGPD/GDPR — direito ao apagamento):**
> Para excluir todos os dados de um `consulente` (pessoa física), o operador executa via Prisma Studio ou script:
> ```bash
> # Identificar o clientId pelo nome (busca no banco — sem PII no log)
> node -e "
>   const { PrismaClient } = require('@prisma/client');
>   const prisma = new PrismaClient();
>   async function main() {
>     const client = await prisma.client.findFirst({ where: { fullName: 'NOME_FORNECIDO' } });
>     // Exclui em cascata: Reading → ChatMessage, Report
>     await prisma.client.delete({ where: { id: client.id } });
>     console.log('Excluído:', client.id);
>   }
>   main().finally(() => prisma.\$disconnect());
> "
> ```
> **Não há exclusão automática por e-mail/SMS** — o operador deve confirmar a identidade antes de executar.
>
> **Exportação a pedido (LGPD/GDPR — direito à portabilidade):**
> ```bash
> node -e "
>   const { PrismaClient } = require('@prisma/client');
>   const fs = require('fs');
>   const prisma = new PrismaClient();
>   async function main() {
>     const client = await prisma.client.findFirst({ where: { fullName: 'NOME_FORNECIDO' } });
>     const readings = await prisma.reading.findMany({ where: { clientId: client.id }, include: { report: true } });
>     fs.writeFileSync('export.json', JSON.stringify({ client, readings }, null, 2));
>     console.log('Exportado para export.json');
>   }
>   main().finally(() => prisma.\$disconnect());
> "
> ```
>
> **Segredos:** `JWT_SECRET`/`OPENAI_API_KEY` só em env do servidor (Vercel env vars); rotação documentada no runbook (§9). Fallback dev de `JWT_SECRET` **proibido em produção** (já lança erro — `operator-jwt.ts`).

## 9. Runbook Operacional (mínimo)

> **AD-22.11 — Runbook versionado.** Procedimentos essenciais para operação em produção.

> ### Deploy Checklist
>
> **Pré-requisitos:**
> - Acesso à Vercel project settings com permissões de `Deploy`
> - Acesso ao Supabase/Neon com `DATABASE_URL` disponível
> - `LEGACY_B2C` deve estar **off** (não presente) em produção
>
> **Passos do deploy:**
> 1. Executar `git push` para a branch de produção (ou merge de PR na `main`)
> 2. Vercel executa automaticamente: `npm run build` → preview → deploy
> 3. Após deploy, executar `prisma migrate deploy`:
>    ```bash
>    # Via Vercel CLI (se aplicável)
>    vercel env pull .env.local
>    npx prisma migrate deploy
>    ```
> 4. **Variáveis de ambiente obrigatórias em produção:**
>    | Variável | Obrigatória | Notas |
>    |---|---|---|
>    | `DATABASE_URL` | ✅ | Connection string do Supabase/Neon |
>    | `JWT_SECRET` | ✅ | Gerada com `openssl rand -hex 32`; 32+ bytes |
>    | `OPENAI_API_KEY` | ✅ | Chave da OpenAI; `sk-...` |
>    | `OPENAI_MODEL` | ✅ | ex.: `gpt-4o` (AD-22.6) |
>    | `ANTHROPIC_MODEL` | ⬜ | Opcional; para futuro suporte Claude |
>    | `MINIMAX_API_KEY` | ⬜ | Se usar MiniMax |
>    | `JWT_EXPIRY` | ✅ | ex.: `7d` |
>    | `ENCRYPTION_KEY` | ✅ | Para Operator MFA TOTP |
>    | `LEGACY_B2C` | ❌ **OFF/NULL** | **NUNCA definir em produção** |
>
> ### Verificação pós-deploy (Smoke Test)
>
> ```bash
> # 1. Health check
> curl https://seudominio.com/api/health
> # Resposta esperada: { "status": "ok", "db": "ok", "redis": "ok" }
>
> # 2. Login do operator
> curl -X POST https://seudominio.com/api/auth/operator/login \
>   -H "Content-Type: application/json" \
>   -d '{"email":"operador@exemplo.com","password":"senhaforte"}'
> # Resposta esperada: { "token": "...", "operatorId": "..." }
>
> # 3. Fluxo completo: criar cliente → tiragem → dossiê
> # (via UI do Cockpit — não automatizado em runbook)
> ```
>
> ### Resposta a Incidentes
>
> **LLM 5xx (OpenAI/MiniMax retorna erro HTTP 500/502/503):**
> - Leituras em geração ficam com `Reading.status = ERROR`
> - Retry é idempotente: o operador abre a leitura novamente e a UI retransmite
> - Logs: buscar `llm.call` com `status: 5xx` no log aggregator
> - Ação: verificar status da API em [status.openai.com](https://status.openai.com)
>
> **Rate limit (HTTP 429):**
> - Ler `X-RateLimit-Remaining` no header de resposta
> - Ajuste: modificar `RATE_LIMIT_CONFIG` em `middleware.ts`
> - Limite atual: 100 req/min por IP (configurável via env)
>
> **Orçamento de tokens excedido:**
> - Sintoma: todas as leituras param com `LLM_DAILY_TOKEN_BUDGET`
> - Ação: verificar painel de custo (AD-22.5); se正当, aumentar `LLM_DAILY_TOKEN_BUDGET`
> - Alternativa: trocar `OPENAI_MODEL` para modelo mais barato (`gpt-4o-mini`)
>
> **Backup e Restore:**
> - Supabase: backups automáticosdiários configurados no dashboard
> - Neon: Point-in-time recovery disponível
> - Restore: contactar suporte do provedor com timestamp do restore
> - **Testar restore antes do go-live:** criar instância staging e verificar integridade dos dados
Registradas no painel (Doc 21) como **Onda O** (observabilidade, paralela a G/T):

- [x] Log estruturado JSON com `requestId` propagado; zero PII/segredos (AD-22.2/.3).
- [x] Eventos de negocio logados (`reading.saved`, `dossier.generated`, `consult.answered`, `auth.logout/SESSION_REVOKED`, ...) (AD-22.4).
- [x] `consult` persiste tokens; token budget com graceful degradation 429 (AD-22.5).
- [x] SSE com persistencia incremental + timeout 300s + estado `ERROR` fiel (AD-22.7).
- [x] liveness x readiness separados (`/api/health/live`, `/api/health/ready`); taxonomia de erro 400/401/404/429/500/502/503 (AD-22.9).
- [x] Politica de retencao documentada; cron cleanup script criado; runbook operacional documentado (AD-22.10/.11).

---

*Doc 22 é a referência canônica de observabilidade e operação. Instrumenta o produto único (Doc 17) e os contratos (Doc 18); protege os dados sensíveis (Doc 02 §3) e o custo da inteligência (Doc 20). Registrado no painel do Doc 21 como Onda O.*
