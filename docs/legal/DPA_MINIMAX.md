# Data Processing Agreement (DPA) — MiniMax

> **Status (Wave 9.4):** template paralelo ao `DPA_ANTHROPIC.md`
> (Wave 8.3). Advogado PI deve validar antes de envio formal à MiniMax.
> **LGPD Art. 33:** transferência internacional de dados para a CN
> requer garantias adequadas (SCC, certificações, ou cláusulas
> contratuais específicas — China ainda não aderiu formalmente ao
> EU-US Data Privacy Framework nem tem acordo específico com a ANPD).
> **Audiência:** DPO, jurídico, time de engenharia (Akasha).

---

## 1. Partes

- **Operador (Akasha Portal):** cabala-dos-caminhos / Akasha OS
  (controlador dos dados dos consulentes — pessoas físicas titulares).
- **Suboperador (MiniMax):** MiniMax (provedor de LLM via API
  MiniMax-M3). Sede na China (CN). Oferece DPA via termos comerciais
  da plataforma MiniMax (https://api.minimax.io/legal).

---

## 2. Base legal para a transferência internacional (LGPD Art. 33)

A MiniMax está sediada na China. Não há, até a data deste documento,
acordo de adequação específico Brasil↔China aprovado pela ANPD.
Portanto a transferência deve satisfazer **uma** das hipóteses do
Art. 33 LGPD:

1. **Cláusulas-padrão contratuais (SCC)** aprovadas pela ANPD
   (Resolução CD/ANPD nº 4/2023) — caminho recomendado, **mediante
   aprovação caso-a-caso** (não há SCC pré-aprovadas para CN).
2. **Certificação** de códigos de conduta ou certificações regulares
   emitidas por organismo profissional reconhecido.
3. **Acordos de cooperação internacional** (mais raro; não aplicável
   CN↔BR atualmente).
4. **Cláusulas contratuais específicas** para a transferência
   MiniMax, mediante aprovação da ANPD (caminho mais oneroso, porém
   único caminho 100% em conformidade hoje).

**Recomendação Akasha:** priorizar SCC da ANPD + avaliar certificação
ISO 27701 da MiniMax (verificar status em
https://api.minimax.io/security). Aceitar **cláusulas-padrão genéricas
somente após sign-off do advogado PI**.

> ⚠️ **Risco jurídico:** enquanto o DPA não estiver assinado, a
> rota `/api/mentor/ask` (provider primário) representa transferência
> internacional documentada em §6 mas sem cobertura contratual.
> Mitigação atual: anonimização parcial do prompt (não enviar nome
> completo do consulente — apenas primeiro nome + ID interno), e
> logging estruturado para detectar incidentes.

---

## 3. Cláusulas obrigatórias (template)

1. **Objeto e duração do tratamento:** prover API de LLM para o
   Akasha Portal processar consultas esotéricas via Mentor
   (rota `/api/mentor/ask`). Vigência: 12 meses, renovável.
2. **Natureza e finalidade do tratamento:** inferência de LLM
   (`MiniMax-M3`) para gerar respostas contextualizadas ao mapa
   astrológico/cabalístico do consulente, com **suporte explícito
   a tool-calling** (MCP — Model Context Protocol; ver §6.5).
   NÃO é usado para treinar modelos da MiniMax (confirmar em
   https://api.minimax.io/data-policy).
3. **Tipo de dados pessoais transferidos:** ver §6 (Auditoria de
   rotas). Resumo: primeiro nome, mapa astrológico/cabalístico/
   tântrico/odú/iching, pergunta livre, histórico de sessão.
4. **Categorias de titulares:** consulentes (pessoas físicas que
   contratam Zeladores via Akasha Portal). Não inclui dados de
   menores de 18 anos (termos de uso Akasha proíbem).
5. **Obrigações do operador (MiniMax):**
   - Processar dados somente conforme instruções documentadas.
   - Não usar dados para treinar/afinar modelos MiniMax-M3 (verificar
     se MiniMax oferece opt-out equivalente à Anthropic API).
   - Implementar medidas técnicas e organizacionais robustas (encryption
     at rest/transit, controle de acesso por princípio do menor
     privilégio).
   - Notificar Akasha em até **72 horas** de qualquer incidente de
     segurança que afete dados pessoais (LGPD Art. 48).
6. **Local de processamento:** China (servidores MiniMax). Confirmar
   regiões específicas no DPA (ex.: cn-shanghai, cn-beijing). Para
   clientes enterprise, MiniMax oferece EU-region (Frankfurt) sob
   contrato separado — **preferir esta opção se disponível** (reduz
   risco de transferência).
7. **Medidas de segurança:**
   - ISO 27001 (MiniMax publica certificações em
     https://api.minimax.io/security).
   - SOC 2 Type II (verificar status atual; MiniMax pode não ter
     SOC 2 ainda — solicitar relatório).
   - GDPR-compliance (MiniMax EU-region atende; CN-region requer
     análise adicional).
8. **Subcontratados autorizados:** MiniMax pode usar subprocessadores
   listados em https://api.minimax.io/subprocessors. Akasha
   reserva-se o direito de objetar a novos subprocessadores com 30
   dias de aviso prévio.
9. **Direitos do titular (LGPD Art. 18):** Akasha mantém canal para
   exercício de direitos (acesso, correção, eliminação, portabilidade,
   revogação de consentimento). MiniMax cooperará com pedidos
   razoáveis de exclusão de logs/prompts específicos em até 30 dias.
10. **Notificação de incidentes:** 72h após conhecimento do incidente
    pelo subprocessador (LGPD Art. 48).
11. **Auditoria e inspeção:** Akasha pode solicitar certificações
    atualizadas e relatórios de auditoria anualmente. Inspeção
    on-site mediante acordo de NDA e custos por conta da Akasha.
12. **Retorno/Eliminação de dados ao término:** ao final do contrato,
    todos os prompts/respostas armazenados pela MiniMax devem ser
    deletados em até 90 dias. Logs de billing mantidos conforme
    obrigações fiscais/legais chinesas (até 7 anos).
13. **Responsabilidade:** limitada a danos diretos, com cap
    razoável (ex.: 12 meses de fees pagos). Segurar PI/profissional
    pela MiniMax como salvaguarda adicional.
14. **Lei aplicável e foro:** lei da China (RPC), com arbitragem
    em Shanghai (CIETAC) como último recurso. Akasha mantém
    jurisdição brasileira para questões com titulares brasileiros.

---

## 4. Checklist pré-envio (advogado + DPO)

- [ ] MiniMax aceitou DPA padrão da empresa (https://api.minimax.io/legal)?
- [ ] MiniMax tem ISO 27001 ativo? (solicitar PDF atualizado)
- [ ] MiniMax tem SOC 2 Type II ativo? (se não, justificar risco)
- [ ] MiniMax é participante do EU-US Data Privacy Framework?
      (**provavelmente não** — verificar)
- [ ] Nosso uso de API key é privado (server-side only, sem exposição client)?
- [ ] Logs não retêm PII além de 30 dias? (atualmente NÃO — `logLlmCall`
      em mentor/llm-router.ts é no-op em prod; falta logging estruturado)
- [ ] Consentimento do titular (LGPD Art. 7º/11) cobre transferência
      internacional para CN? (termos de uso Akasha devem mencionar
      **explicitamente** a China — não basta mencionar "provedores
      internacionais")
- [ ] DPO da Akasha está nomeado e comunicável à MiniMax?
- [ ] Cláusula de subprocessor objection (30 dias) está no contrato?
- [ ] Cláusula de EU-region preferencial está no contrato (quando
      aplicável)?
- [ ] Avaliamos opção de **opt-out do Mentor em CN-region** (voltar
      ao fallback Anthropic) caso a negociação do DPA trave?

---

## 5. Status atual no código Akasha (snapshot Wave 9.4)

|| Item | Estado | Gap |
||------|--------|-----|
|| API key MiniMax | via env `MINIMAX_API_TOKEN` | Server-side only ✓ |
|| Logging de chamadas | `logLlmCall` é stub no-op | **Não retém PII** (✓) mas **não temos auditoria** de uso (gap LGPD Art. 37) |
|| Retenção de prompts/respostas | MiniMax retention policy (verificar) | Verificar contrato enterprise |
|| Opt-out de treinamento | MiniMax API por padrão: usar ToS para confirmar | Confirmar em DPA assinado |
|| Roteamento primário do Mentor | MiniMax-M3 (`@/lib/application/mentor/llm-router.ts`) | Anthropic é fallback opcional |
|| Endpoint que toca MiniMax | `POST /api/mentor/ask` via `streamMentorResponse` | Único consumidor real |
|| MCP tool dispatch | `MiniMax-M3` suporta tool-calling nativo; usado por `Wave 9.3` emotion-aware dispatcher | Documentar em §6.5 |

---

## 6. Auditoria de rotas LLM no código (escopo Wave 9.4)

Esta seção é a auditoria técnica exigida pelo LGPD Art. 33 — quais rotas
do Akasha Portal efetivamente transferem dados para a MiniMax na CN.

### 6.1 Rota primária para MiniMax

#### `POST /api/mentor/ask` (`apps/akasha-portal/src/app/api/mentor/ask/route.ts`)

- **Função de chamada:** `streamMentorResponse` importada de
  `@/lib/application/mentor/llm-router`.
- **Provider primário:** **MiniMax-M3** (configurável via
  `LLM_PROVIDER=minimax`, default desde F-236).
- **Endpoint:** `https://api.minimax.io/v1/text/chatcompletion_v2`
  (confirmar URL atual no SDK MiniMax).
- **Modelo default:** `MiniMax-M3` (override via `MINIMAX_MODEL`).
- **Propósito:** gerar resposta esotérica contextualizada ao mapa
  cabalístico/astrológico/odú do consulente (5 Pilares + I Ching +
  grimório curado via RAG), **com despacho de tools MCP** quando o
  intent detector identifica emoção (Wave 9.3).
- **Dados pessoais enviados no prompt:**
  - Primeiro nome do consulente (vem de `User.name`; anonimização
    parcial — não enviamos nome completo).
  - Mapa astrológico completo (`BirthChart.astrologyMap` — signos,
    planetas, casas, aspectos).
  - Mapa cabalístico (`BirthChart.kabalisticMap` — Sefirot, Caminhos,
    Mispar Hechrachi).
  - Mapa tântrico (`BirthChart.tantricMap` — Alma, Karma, Dom Divino).
  - Mapa de Odú (`BirthChart.oduBirth` — Odu regente, esotérico).
  - Mapa I Ching (se ativado: `User.ichingMap`).
  - Pergunta livre do consulente (1–1000 chars).
  - Estado emocional atual (`cookie akasha_state` — Wave 9.1).
  - Histórico de sessão (se `sessionId` fornecido, lê de `MentorSession`
    table — histórico completo).
- **Frequência:** por request do Mentor. Rate limitado pelo middleware
  global (`src/lib/infrastructure/rate-limit.ts`) + rate limit específico
  do Mentor.
- **Retenção no provedor:** MiniMax retention policy (verificar ToS).
  Default: 30 dias para abuse monitoring (assumir até confirmar).
- **Base legal:** execução de contrato (titular contratou serviço via
  Zelador) + consentimento (termos de uso Akasha devem mencionar
  **explicitamente** MiniMax + CN).

### 6.2 Tool-calling / MCP (Wave 9.3 + Wave 9.4)

Desde a Wave 9.3, a rota `/api/mentor/ask` despacha tools MCP quando o
intent detector identifica emoção. As tools atualmente registradas
(`packages/mcp/src/server.ts`) são:

1. `akasha.synthesis.generate` — gera síntese diária a partir do mapa
   do consulente. PII: mapa completo (mesmo payload do prompt base).
2. `akasha.iching.cast` — gera hexagrama do dia. PII: mapa parcial
   (apenas data de nascimento).
3. `akasha.odu.lookup` — busca Odu regente. PII: data de nascimento.
4. `akasha.ritual.recommend` — recomenda prática do dia. PII: mapa
   completo + estado emocional.
5. `akasha.authority.derive` — deriva autoridade Akasha. PII: mapa
   completo.

> Cada tool call é uma **requisição adicional** ao LLM (com a tool
> invocada no payload). Multiplique a retenção/documentação por tool
> call.

### 6.3 Rota que NÃO vai para MiniMax (informativo)

#### `POST /api/akasha/consult` (`apps/akasha-portal/src/app/api/akasha/consult/route.ts`)

- **Função de chamada:** `streamCompletion` importada de
  `@/lib/application/ai/llm-router`.
- **Provider:** configurável via env `LLM_PROVIDER`. Quando
  `LLM_PROVIDER=anthropic`, chamadas vão para
  `https://api.anthropic.com/v1/messages` (ver `DPA_ANTHROPIC.md`).
- **Por que não MiniMax (na rota `/consult`):** Mentor tem provider
  primário MiniMax (`@/lib/application/mentor/llm-router`), enquanto
  Consult (`@/lib/application/ai/llm-router`) tem Anthropic primário.
  São dois LLMs distintos, dois DPAs distintos.

### 6.4 Rotas de baixo risco (não enviam PII ao LLM)

|| Rota | Função | Por que não toca LLM externo |
||------|--------|------------------------------|
|| `POST /api/akasha/profile/[id]` | DELETE profile (Wave 8.3 A.1) | Apenas DB local + audit log local |
|| `POST /api/akasha/auth/*` | Login/logout/refresh | JWT local + cookie |
|| `POST /api/akasha/daily` | DailyContent (climate + ritual + synthesis) | Síntese local a partir de BirthChart + heurística + grimório curado (RAG interno); zero chamada LLM |
|| `POST /api/akasha/tratamento/calcular` | 7 camadas de tratamento | Síntese local (engine em `@akasha/tratamento`); zero chamada LLM |
|| `POST /api/mcp` | MCP HTTP transport (Wave 9.4 B.3 — `apps/akasha-portal/src/app/api/mcp/route.ts`) | Não chama LLM diretamente; serve tools MCP que PODEM chamar LLM via Mentor |

### 6.5 Tabela-resumo para o DPO

|| Rota | Provedor LLM | PII enviada | Retenção provedor | DPA assinado |
||------|--------------|-------------|-------------------|--------------|
|| `/api/mentor/ask` | **MiniMax-M3 (CN)** | Nome (parcial) + mapas + pergunta + histórico + tool calls | MiniMax retention policy (verificar) | **Pendente** (template = este doc) |
|| `/api/akasha/consult` | Anthropic (quando `LLM_PROVIDER=anthropic`) | Nome + mapas + pergunta + sessão | Até 30 dias (Anthropic default); configurável Enterprise | **Pendente** (ver `DPA_ANTHROPIC.md`) |
|| `/api/akasha/daily` | Nenhum | — | — | N/A |
|| `/api/akasha/tratamento/calcular` | Nenhum | — | — | N/A |
|| `/api/mcp` | Nenhum (proxy para tools) | tool calls roteadas | depende da tool | depende da tool |
|| `/api/profile/[id]` DELETE | Nenhum | — | — | N/A |

---

## 7. Recomendações técnicas pós-DPA (follow-up Wave 10+)

1. **Logging de chamadas LLM persistente:** substituir o stub no-op
   `logLlmCall` por sink real (Loki/Datadog/BigQuery) com retenção
   configurável e mascaramento de PII no payload.
2. **Opt-out granular:** permitir que o Zelador desabilite provedores
   específicos por configuração (não apenas env global).
3. **Hash de PII antes do envio:** avaliar hashing reversível ou
   anonimização completa do nome do consulente antes de incluir no
   prompt (preserva raciocínio do LLM mas quebra traceability).
4. **Auditoria trimestral:** revisar a tabela §6.5 a cada 3 meses para
   detectar novas rotas que inadvertidamente começam a chamar LLM.
5. **Switch para EU-region quando MiniMax oferecer CN-region-only com
   contrato separado:** preferir endpoints europeus (Frankfurt) para
   reduzir risco de transferência internacional CN↔Brasil.
6. **Tool-call audit trail:** cada tool MCP invocada via Mentor deve
   gerar log estruturado separado (rota, tool name, argumentos,
   resposta, latência) para auditoria LGPD Art. 37.
7. **Reconsentimento transparente:** ao ativar tool-calling no Mentor
   (Wave 9.3+), titular deve ver explicitamente quais tools serão
   invocadas e que isso gera requisições LLM adicionais.

---

## 8. Histórico de revisão

|| Data | Autor | Mudança |
||------|-------|---------|
|| 2026-06-24 | Wave 9.4 subagent | Template inicial paralelo ao DPA Anthropic + auditoria de rotas (incluindo tool-calling MCP Wave 9.3) |