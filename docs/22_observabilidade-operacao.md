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
> - **Minimização:** logs por ID (AD-22.2); conteúdo de dossiê/chat só no banco, nunca em log/telemetria externa.
> - **Retenção:** definir política (ex.: readings/consultations retidos enquanto a conta do operador existir; export/delete sob pedido — base LGPD). Documentar antes do go-live multi-operador.
> - **Segredos:** `JWT_SECRET`/`OPENAI_API_KEY` só em env do servidor (Doc 02 §3); rotação documentada no runbook (§9); fallback dev de `JWT_SECRET` **proibido em produção** (já lança erro — `operator-jwt.ts`).

---

## 9. Runbook Operacional (mínimo)

> **AD-22.11 — Runbook versionado.** Procedimentos essenciais (a manter neste doc/anexo):
> - **Deploy:** Vercel + Postgres (Supabase/Neon); `prisma migrate deploy`; conferir env obrigatórias (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`).
> - **Flag de quarentena:** `LEGACY_B2C` ausente/`off` em produção (Doc 16 AD-01).
> - **Verificação pós-deploy:** `GET /api/health` = ok; login do Operator; uma tiragem→dossiê de fumaça.
> - **Incidentes:** LLM 5xx → readings ficam `ERROR`, retry idempotente; rate limit → ajustar `RATE_LIMIT_CONFIG`; vazamento de custo → checar painel de tokens (AD-22.5) e `LLM_DAILY_TOKEN_BUDGET`.
> - **Backup:** snapshot diário do Postgres; testar restore antes do go-live (Doc 08 checklist).

---

## 10. Decisões & Critério de "pronto"

Registradas no painel (Doc 21) como **Onda O** (observabilidade, paralela a G/T):

- [ ] Log estruturado JSON com `requestId` propagado; zero PII/segredos (AD-22.2/.3).
- [ ] Eventos de negócio logados (`reading.saved`, `dossier.generated`, `consult.answered`, …) (AD-22.4).
- [ ] `consult` persiste tokens; painel de custo/dia e custo/dossiê (AD-22.5).
- [ ] SSE com persistência incremental + estado `ERROR` fiel (AD-22.7).
- [ ] liveness × readiness separados (AD-22.8); taxonomia de erro consistente (AD-22.9).
- [ ] Política de retenção/segredos + runbook documentados antes do go-live (AD-22.10/.11).

---

*Doc 22 é a referência canônica de observabilidade e operação. Instrumenta o produto único (Doc 17) e os contratos (Doc 18); protege os dados sensíveis (Doc 02 §3) e o custo da inteligência (Doc 20). Registrado no painel do Doc 21 como Onda O.*
