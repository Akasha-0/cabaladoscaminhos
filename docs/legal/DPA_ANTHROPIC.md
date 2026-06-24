# Data Processing Agreement (DPA) — Anthropic

> **Status (Wave 8.3):** template para negociação. Advogado PI deve
> validar antes de envio formal à Anthropic.
> **LGPD Art. 33:** transferência internacional de dados para os EUA
> requer garantias adequadas (SCC, Privacy Shield successor, cláusulas
> contratuais específicas, ou outra base legal válida).
> **Audiência:** DPO, jurídico, time de engenharia (Akasha).

---

## 1. Partes

- **Operador (Akasha Portal):** cabala-dos-caminhos / Akasha OS
  (controlador dos dados dos consulentes — pessoas físicas titulares).
- **Suboperador (Anthropic):** Anthropic PBC (provedor de LLM via API).
  Sede nos EUA. Oferece DPA padrão enterprise via
  https://www.anthropic.com/legal/commercial-terms.

---

## 2. Base legal para a transferência internacional (LGPD Art. 33)

Anthropic deve satisfazer **uma** das hipóteses do Art. 33 LGPD:

1. **Cláusulas-padrão contratuais (SCC)** aprovadas pela ANPD
   (Resolução CD/ANPD nº 4/2023) — caminho recomendado.
2. **Certificação** de códigos de conduta ou certificações regulares
   emitidas por organismo profissional.
3. **Acordos de cooperação internacional** (mais raro).
4. **Cláusulas contratuais específicas** para determinada transferência,
   mediante aprovação da ANPD.

**Recomendação Akasha:** priorizar SCC da ANPD + Privacy Shield successor
(EU-US Data Privacy Framework, do qual Anthropic é participante via
https://www.dataprivacyframework.gov/).

---

## 3. Cláusulas obrigatórias (template)

1. **Objeto e duração do tratamento:** prover API de LLM para o
   Akasha Portal processar consultas esotéricas (Mentor + Consult).
   Vigência: 12 meses, renovável.
2. **Natureza e finalidade do tratamento:** inferência de LLM para gerar
   respostas contextualizadas ao mapa astrológico/cabalístico do
   consulente. NÃO é usado para treinar modelos da Anthropic (verificar
   em https://trust.anthropic.com/).
3. **Tipo de dados pessoais transferidos:** ver §6 (Auditoria de rotas).
4. **Categorias de titulares:** consulentes (pessoas físicas que
   contratam Zeladores via Akasha Portal). Não inclui dados de menores
   de 18 anos (termos de uso Akasha proíbem).
5. **Obrigações do operador (Anthropic):**
   - Processar dados somente conforme instruções documentadas.
   - Não usar dados para treinar/afinar modelos (a menos de opt-in
     explícito e revogável).
   - Implementar medidas técnicas e organizacionais robustas (encryption
     at rest/transit, controle de acesso por princípio do menor
     privilégio).
   - Notificar Akasha em até **72 horas** de qualquer incidente de
     segurança que afete dados pessoais (LGPD Art. 48).
6. **Local de processamento:** EUA (servidores Anthropic). Confirmar
   regiões específicas no DPA (ex.: us-east-1, us-west-2).
7. **Medidas de segurança:**
   - SOC 2 Type II (Anthropic publica em
     https://trust.anthropic.com/).
   - ISO 27001 / 27018 (verificar status atual).
   - HIPAA BAA disponível sob acordo separado (não aplicável a Akasha).
8. **Subcontratados autorizados:** Anthropic pode usar subprocessadores
   (listados em https://trust.anthropic.com/subprocessors). Akasha
   reserva-se o direito de objetar a novos subprocessadores com 30 dias
   de aviso prévio.
9. **Direitos do titular (LGPD Art. 18):** Akasha mantém canal para
   exercício de direitos (acesso, correção, eliminação, portabilidade,
   revogação de consentimento). Anthropic cooperará com pedidos
   razoáveis de exclusão de logs/prompts específicos em até 30 dias.
10. **Notificação de incidentes:** 72h após conhecimento do incidente
    pelo subprocessador (LGPD Art. 48 + DPA padrão Anthropic).
11. **Auditoria e inspeção:** Akasha pode solicitar certificações
    atualizadas e relatórios de auditoria SOC 2 anualmente. Inspeção
    on-site mediante acordo de NDA e custos por conta da Akasha.
12. **Retorno/Eliminação de dados ao término:** ao final do contrato,
    todos os prompts/respostas armazenados pela Anthropic devem ser
    deletados em até 90 dias. Logs de billing mantidos conforme
    obrigações fiscais/legais (até 7 anos).
13. **Responsabilidade:** limitada a danos diretos, com cap
    razoável (ex.: 12 meses de fees pagos). Segurar PI/profissional
    pela Anthropic como salvaguarda adicional.
14. **Lei aplicável e foro:** lei da Califórnia (EUA), com arbitragem
    em São Francisco como último recurso. Akasha mantém jurisdição
    brasileira para questões com titulares brasileiros.

---

## 4. Checklist pré-envio (advogado + DPO)

- [ ] Anthropic aceitou DPA padrão da empresa (https://www.anthropic.com/legal/commercial-terms)?
- [ ] Anthropic tem SOC 2 Type II ativo? (solicitar PDF atualizado)
- [ ] Anthropic é participante do EU-US Data Privacy Framework? (consultar https://www.dataprivacyframework.gov/)
- [ ] Nosso uso de API key é privado (server-side only, sem exposição client)?
- [ ] Logs não retêm PII além de 30 dias? (atualmente NÃO — `logLlmCall` em llm-router.ts é no-op em prod; falta logging estruturado)
- [ ] Consentimento do titular (LGPD Art. 7º/11) cobre transferência internacional? (termos de uso Akasha devem mencionar explicitamente)
- [ ] DPO da Akasha está nomeado e comunicável à Anthropic?
- [ ] Cláusula de subprocessor objection (30 dias) está no contrato?
- [ ]我们有 um processo formal para responder solicitações de titulares (Art. 18) que envolvam dados em poder da Anthropic?

---

## 5. Status atual no código Akasha (snapshot Wave 8.3)

| Item | Estado | Gap |
|------|--------|-----|
| API key Anthropic | via env `ANTHROPIC_API_KEY` | Server-side only ✓ |
| Logging de chamadas | `logLlmCall` é stub no-op | **Não retém PII** (✓) mas **não temos auditoria** de uso (gap LGPD Art. 37) |
| Retenção de prompts/respostas | Anthropic: até 30 dias (Free/Build); Pro/Enterprise configurável | Verificar contrato enterprise |
| Opt-out de treinamento | Anthropic API por padrão NÃO usa dados para treino | Confirmar em DPA assinado |
| Roteamento via MiniMax (Mentor) | Primário (`@/lib/application/mentor/llm-router.ts`) | Anthropic só é provider alternativo em `application/ai/llm-router.ts` |
| Endpoint que toca Anthropic | Apenas `POST /api/akasha/consult` via `streamCompletion` | Único consumidor real |

---

## 6. Auditoria de rotas LLM no código (escopo Wave 8.3)

Esta seção é a auditoria técnica exigida pelo LGPD Art. 33 — quais rotas
do Akasha Portal efetivamente transferem dados para provedores de LLM
nos EUA.

### 6.1 Rota direta para Anthropic

#### `POST /api/akasha/consult` (`apps/akasha-portal/src/app/api/akasha/consult/route.ts`)

- **Função de chamada:** `streamCompletion` importada de
  `@/lib/application/ai/llm-router`.
- **Provider configurável:** por env `LLM_PROVIDER`. Quando
  `LLM_PROVIDER=anthropic`, chamadas vão para
  `https://api.anthropic.com/v1/messages`.
- **Modelo default:** `claude-3-5-sonnet` (override via `ANTHROPIC_MODEL`).
- **Propósito:** gerar resposta esotérica contextualizada ao mapa
  cabalístico/astrológico/odú do consulente (5 Pilares + I Ching +
  grimório curado via RAG).
- **Dados pessoais enviados no prompt:**
  - Nome do consulente (vem de `User.name`).
  - Mapa astrológico completo (`BirthChart.astrologyMap` — signos,
    planetas, casas, aspectos).
  - Mapa cabalístico (`BirthChart.kabalisticMap` — Sefirot, Caminhos,
    Mispar Hechrachi).
  - Mapa de Odú (`BirthChart.oduBirth` — Odu regente, esotérico).
  - Mapa I Ching (se ativado: `User.ichingMap`).
  - Pergunta livre do consulente (1–1000 chars).
  - Sessão anterior (se `consultationId` fornecido, lê de `Consultation`
    table — histórico completo).
- **Frequência:** por request de consulta. Rate limitado pelo middleware
  global (`src/lib/infrastructure/rate-limit.ts`).
- **Retenção no provedor:** Anthropic API não retém prompts/respostas
  por padrão (Free/Build tier — 30 dias para abuse monitoring;
  Enterprise configurável).
- **Base legal:** execução de contrato (titular contratou serviço via
  Zelador) + consentimento (termos de uso Akasha mencionam uso de LLM).

### 6.2 Rota que NÃO vai para Anthropic (informativo)

#### `POST /api/mentor/ask` (`apps/akasha-portal/src/app/api/mentor/ask/route.ts`)

- **Função de chamada:** `streamMentorResponse` importada de
  `@/lib/application/mentor/llm-router`.
- **Provider:** **MiniMax M3** primário (F-236 — `MINIMAX_API_TOKEN`).
- **Por que não Anthropic:** MiniMax é o LLM primário do Mentor por
  custo (plano global barato) e capacidade de raciocínio profundo
  (cadeia de pensamento explícita). Anthropic é fallback opcional
  configurável mas **não é o caminho padrão em produção**.
- **Observação LGPD:** MiniMax está sediada em CN (transferência
  internacional separada — DPA MiniMax necessário; ver
  `DPA_MINIMAX.md` futuro, Wave 9 follow-up).

### 6.3 Rotas de baixo risco (não enviam PII ao LLM)

| Rota | Função | Por que não toca LLM externo |
|------|--------|------------------------------|
| `POST /api/akasha/profile/[id]` | DELETE profile (Wave 8.3 A.1) | Apenas DB local + audit log local |
| `POST /api/akasha/auth/*` | Login/logout/refresh | JWT local + cookie |
| `POST /api/akasha/daily` | DailyContent (climate + ritual + synthesis) | Síntese local a partir de BirthChart + heurística + grimório curado (RAG interno); zero chamada LLM |
| `POST /api/akasha/tratamento/calcular` | 7 camadas de tratamento | Síntese local (engine em `@akasha/tratamento`); zero chamada LLM |

### 6.4 Tabela-resumo para o DPO

| Rota | Provedor LLM | PII enviada | Retenção provedor | DPA assinado |
|------|--------------|-------------|-------------------|--------------|
| `/api/akasha/consult` | Anthropic (quando `LLM_PROVIDER=anthropic`) | Nome + mapas + pergunta + sessão | Até 30 dias (Anthropic default); configurável Enterprise | **Pendente** (template = este doc) |
| `/api/mentor/ask` | MiniMax (primary) | Nome + mapas + pergunta + histórico | MiniMax retention policy | **Pendente** (DPA MiniMax separado) |
| `/api/akasha/daily` | Nenhum | — | — | N/A |
| `/api/akasha/tratamento/calcular` | Nenhum | — | — | N/A |
| `/api/profile/[id]` DELETE | Nenhum | — | — | N/A |

---

## 7. Recomendações técnicas pós-DPA (follow-up Wave 9)

1. **Logging de chamadas LLM persistente:** substituir o stub no-op
   `logLlmCall` por sink real (Loki/Datadog/BigQuery) com retenção
   configurável e mascaramento de PII no payload.
2. **Opt-out granular:** permitir que o Zelador desabilite provedores
   específicos por configuração (não apenas env global).
3. **Hash de PII antes do envio:** avaliar hashing reversível ou
   anonimização do nome do consulente antes de incluir no prompt
   (preserva raciocínio do LLM mas quebra traceability).
4. **Auditoria trimestral:** revisar a tabela §6.4 a cada 3 meses para
   detectar novas rotas que inadvertidamente começam a chamar LLM.
5. **Switch para EU-region quando Anthropic oferecer:** preferir
   endpoints europeus (Frankfurt, Paris) para reduzir risco de
   transferência internacional EUA↔Brasil.

---

## 8. Histórico de revisão

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-06-24 | Wave 8.3 subagent | Template inicial + auditoria de rotas |