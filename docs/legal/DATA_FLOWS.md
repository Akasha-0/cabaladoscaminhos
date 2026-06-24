# DATA_FLOWS.md — Mapeamento de Fluxos de Dados (LGPD)

> **Objetivo**: inventário sistemático de todas as rotas API do Akasha Portal
> que processam **dados pessoais** (PII) ou dados sensíveis (LGPD Art. 5° II),
> para subsidiar parecer de advogado de PI e auditoria de conformidade LGPD.
>
> **Escopo**: `apps/akasha-portal/src/app/api/` (61 rotas).
>
> **Gerado em**: 2026-06-24 (Wave 7.2 hardening).
>
> **Status**: auditoria inicial — recomenta-se revisão pelo advogado PI
> e pelo DPO antes do lançamento público.
>
> **Não escopo**: front-end components (ver `apps/akasha-portal/src/components/`),
> scripts CLI (`packages/akasha-cli/`), scripts de migração de banco.

---

## 1. Classificação de PII (para referência)

| Categoria | Exemplos | LGPD |
|---|---|---|
| **PII comum** | nome, email, telefone, endereço | Art. 5° I |
| **PII sensível** | data nascimento, hora nascimento, local nascimento, respostas de "tratamento", crença espiritual/religiosa, orientação sexual (Yogi Bhajan inclui práticas tântricas), dados de saúde (perguntas sobre bem-estar) | Art. 5° II |
| **Credencial** | hash de senha (bcrypt), JWT token | Segurança (Art. 46) |
| **Comportamental** | logs de acesso, métricas de uso, histórico de consultas do Mentor | Art. 5° IV (dados de uso) |
| **Financeiro** | ID de customer Stripe, faturas, créditos | Art. 5° I + obrigação fiscal |

---

## 2. Inventário de Rotas — Por Categoria

### 2.1. Autenticação & Identidade (CRÍTICO — PII comum + credencial)

| Rota | Método | PII Processada | Operações | Retenção Recomendada |
|---|---|---|---|---|
| `/api/akasha/auth/register` | POST | **email**, **password (hash bcrypt)**, **nome**, **data nascimento**, **hora nascimento**, **cidade nascimento**, lat/lng, timezone, **consentimento LGPD** | CREATE User | Indefinida até delete de conta |
| `/api/akasha/auth/login` | POST | email, password | READ User (auth) | Logs: 6 meses |
| `/api/akasha/auth/me` | GET | (via JWT) retorna perfil | READ User | n/a |
| `/api/akasha/auth/refresh` | POST | (via refresh token) | UPDATE token | n/a |
| `/api/akasha/auth/logout` | POST | (invalida sessão) | DELETE sessão | Logs: 6 meses |

**Notas LGPD**:
- `consent: literal(true)` em `register/route.ts:20` ✓ conforme Art. 37.
- Bcrypt ✓ conforme Art. 46 (senha nunca em texto claro).
- **Ação**: verificar se política de privacidade é linkada ANTES do
  `consent: true` (não apenas checkbox sem contexto).

### 2.2. Perfil & Dados de Nascimento (CRÍTICO — PII sensível)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/profile` | PATCH / GET | **nome**, **data nascimento**, **hora nascimento**, **cidade nascimento**, lat/lng, timezone | UPDATE / READ User | Indefinida até delete |
| `/api/akasha/chart` | GET | (lê perfil, retorna 5 mapas calculados) | READ User + compute | Indefinida |
| `/api/akasha/mandala` | GET | (lê perfil, retorna Mandala SVG) | READ User + compute | Indefinida |
| `/api/akasha/cycle/snapshot` | POST | **data nascimento**, data atual | CREATE CycleSnapshot | Indefinida |
| `/api/akasha/transits/today` | GET | (lê perfil, retorna trânsitos astrológicos atuais) | READ User | n/a |
| `/api/akasha/daily` | GET | (lê perfil + data atual) | READ User + compute | Indefinida |

**Notas LGPD**:
- `data nascimento` + `hora` + `local` = trio sensível (astrologia + mapa
  cabalístico dependem). Não há como "anonimizar" mantendo utilidade
  para o Zelador.
- **Geocoding**: `geocodeCity` (Nominatim/OSM) — a cidade é enviada para
  serviço externo. Verificar DPA com OSM Nominatim (Art. 33 — transferência
  internacional? OSM é servidor na UE/EUA).
- **Ação**: implementar `DELETE /api/akasha/profile` que cascateia para
  birthChart, notas, sessões, mensagens.

### 2.3. Caminhantes / Consulentes (Zelador-only — multi-tenant)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/caminhantes/[id]/mapa` | GET | (lê mapa do consulente) | READ Caminhante | Indefinida |
| `/api/akasha/caminhantes/[id]/notas` | GET / POST | **notas clínicas** (categoria: observação, prescrição, ritual, firmeza, intercorrência) — conteúdo livre do Zelador | READ / CREATE NotaConsulente | Indefinida |
| `/api/akasha/caminhantes/[id]/sessoes` | GET / POST | **sessão** (tipo, data, notas) | READ / CREATE Sessao | Indefinida |
| `/api/akasha/sessoes/[id]/fechar` | POST | sessão + fechamento | UPDATE Sessao | Indefinida |
| `/api/akasha/conexoes` | GET / POST | **dados de OUTRA pessoa** (nome, data nascimento, hora, cidade) — para correlação de mapas | READ / CREATE Conexao | Indefinida |
| `/api/akasha/conexoes/[id]` | GET / PATCH / DELETE | dados da conexão | READ / UPDATE / DELETE | Indefinida |

**Notas LGPD**:
- **CRÍTICO**: `conexoes` armazena dados de **terceiros** (não-consulentes)
  fornecidos pelo Zelador. Ex: "fulano de tal, nascido em X, parente do
  consulente". Isso pode configurar tratamento de PII de terceiro SEM
  consentimento. **Recomendação**: disclaimer no formulário de criação de
  conexão alertando o Zelador sobre a responsabilidade.
- Notas de consulente são **conteúdo clínico** — mesmo formato de prontuário.
  **Recomendação**: criptografia em repouso + auditoria de acesso.
- Multi-tenant via `withCaminhanteContext` (ADR 0004) ✓ — proteção contra
  vazamento entre Zeladores está implementada.

### 2.4. Tratamento (CRÍTICO — PII sensível + respostas de anamnese)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/tratamento/calcular` | POST | **nome do consulente**, **data nascimento**, **hora nascimento**, **local nascimento**, **respostas de perguntas de anamnese** (conteúdo livre) | CREATE Tratamento + compute | Indefinida |

**Schema** (`tratamento/schemas.ts`):

```ts
{
  zeladorId: cuid,
  caminhadaId: cuid,
  consulenteNome: string,
  dataNascimento: 'YYYY-MM-DD',
  horaNascimento: 'HH:mm',
  localNascimento: string,
  respostasPerguntas?: [{ pergunta_id, resposta }], // conteúdo livre
}
```

**Notas LGPD**:
- **Respostas de anamnese** = dados sensíveis (crença, saúde, vida pessoal).
  São enviadas como input para cálculo determinístico (não vão para LLM).
- **Ação**: confirmar que as respostas **não são usadas como contexto
  para o Mentor (LLM)** sem consentimento explícito adicional.

### 2.5. Mentor (LLM — transferência internacional)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/mentor/ask` | POST | **pergunta do consulente** (texto livre), **contexto do mapa** (perfil, mapas calculados) | CREATE MentorMessage + LLM call | 24 meses recomendado |
| `/api/akasha/mentor/history` | GET | histórico de mensagens | READ MentorMessage | idem |
| `/api/akasha/consult` | POST | **pergunta + contexto** (idem ask) | LLM streaming | 24 meses recomendado |

**Notas LGPD**:
- **CRÍTICO — Art. 33**: perguntas + perfil são enviados para LLM provider
  (Anthropic Claude ou similar). Verificar:
  - DPA assinado com provider?
  - Provider está em país com adequação (LGPD Art. 33 II)?
  - Logs do provider são retidos por quanto tempo?
- **Recomendação**: adicionar opt-in explícito "Permitir uso de IA para
  responder minhas perguntas" separado do `consent` geral.
- **Rate limiting** ✓ via `checkMemoryRateLimit`.

### 2.6. Pagamentos (Financeiro)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/checkout` | POST | (cria sessão Stripe) | READ User, CREATE StripeSession | n/a |
| `/api/akasha/credits` | GET / POST | saldo de créditos | READ / UPDATE User | Indefinida |
| `/api/akasha/subscription` | GET | status assinatura | READ User | Indefinida |
| `/api/webhooks/akasha-stripe` | POST | webhook Stripe (não tem PII direta, só IDs) | UPDATE User/Subscription | 5 anos (fiscal) |

**Notas LGPD**:
- Dados financeiros (faturas) retidos por **5 anos** por obrigação fiscal
  brasileira (CTN Art. 173/174). Não deletáveis antes do prazo.
- **Stripe customer ID** é PII comum (vincula usuário).

### 2.7. Push Notifications

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/push/subscribe` | POST | **push subscription** (endpoint, keys) | CREATE / UPDATE PushSubscription | Até unsubscribe |
| `/api/push/subscribe` | POST | idem | idem | idem |
| `/api/cron/daily-push` | POST (cron) | (lê usuários, envia push) | READ User + send push | Logs: 6 meses |

**Notas LGPD**:
- **Push subscription** = endpoint técnico, não é PII direta. Mas vincula
  dispositivo → usuário.
- **Recomendação**: política de retenção clara (unsubscribe = delete).

### 2.8. Search & RAG (comportamental)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/search` | GET | **query de busca** (texto livre) | READ Corpus | Logs: 6 meses (anonimizado) |
| `/api/search/index` | POST / GET | indexação de corpus (admin) | READ / UPDATE index | n/a |
| `/api/search/spiritual` | GET | query + contexto | READ Corpus | Logs: 6 meses |
| `/api/akasha/rag/search` | POST | query + contexto do mapa | READ Corpus + LLM | 6 meses |
| `/api/akasha/rag/index` | POST / GET | indexação | READ / UPDATE | n/a |

**Notas LGPD**:
- Query de busca **pode conter PII** (ex: usuário busca por "minha prima
  Maria"). Logs devem ser anonimizados (SHA-256 do user_id + timestamp).
- **Ação**: auditar logs atuais — alguma query em texto claro está sendo
  persistida?

### 2.9. Chat & Práticas (conteúdo)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/chat` | POST | mensagem livre | CREATE ChatMessage | 24 meses |
| `/api/akasha/chat/practice` | POST | prática livre | CREATE ChatMessage | idem |
| `/api/akasha/chat/ritual` | POST | ritual livre | CREATE ChatMessage | idem |
| `/api/akasha/ritual` | POST / GET | ritual config | READ / CREATE | Indefinida |
| `/api/akasha/ritual/today` | GET | ritual do dia | READ | n/a |
| `/api/akasha/ritual/config` | POST | config | UPDATE | n/a |
| `/api/akasha/iching/daily` | GET | I Ching do dia | READ Corpus | n/a |
| `/api/akasha/oraculo/iching` | POST | pergunta + sortida | CREATE OraculoIChing | Indefinida |
| `/api/akasha/mandato-do-dia` | GET | mandato do dia | READ | n/a |

**Notas LGPD**:
- Mensagens de chat = conteúdo livre do usuário. Pode conter PII própria
  ou de terceiros.
- **Recomendação**: rotular claramente que conteúdo gerado pelo usuário
  fica armazenado por 24 meses para histórico.

### 2.10. Dashboard & Manifesto (analítico)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/akasha/dashboard/complete` | POST | (marca onboarding completo) | UPDATE User | n/a |
| `/api/akasha/dashboard/history` | GET | histórico de uso | READ | 6 meses |
| `/api/akasha/dashboard/stats` | GET | estatísticas agregadas | READ | n/a |
| `/api/akasha/dashboard/streak` | GET | streak de uso | READ | n/a |
| `/api/akasha/manifesto/generate` | POST | gera manifesto pessoal (baseado em perfil) | CREATE Manifesto | Indefinida |
| `/api/akasha/manifesto/pdf` | GET | gera PDF do manifesto | READ Manifesto | n/a |
| `/api/akasha/oraculo/iching` | POST | (já listado em 2.9) | — | — |

**Notas LGPD**:
- Manifesto pessoal = **derivado de PII sensível** (mapas baseados em
  nascimento). Tratar com mesmo nível de proteção.
- **Recomendação**: PDF gerado on-the-fly, não persistido em disco.

### 2.11. Admin & Ops (interno)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/admin/credits/reconcile` | POST | (ajusta créditos — admin only) | UPDATE User | Logs: 12 meses |
| `/api/admin/webhooks/grimoire-sync` | POST | (sincroniza corpus — admin only) | UPDATE Corpus | n/a |
| `/api/security/headers` | GET | (devolve headers de segurança) | n/a | n/a |
| `/api/health/*` | GET | métricas agregadas (CPU, memória, latência) | READ | n/a |
| `/api/progresso` | GET / POST | progresso do Zelador | READ / UPDATE | Indefinida |

**Notas LGPD**:
- Admin routes devem ter **auditoria completa** (quem acessou, quando, o quê).
- Health endpoints **NUNCA** devem logar PII (apenas métricas agregadas).

### 2.12. Share / External (cuidado)

| Rota | Método | PII Processada | Operações | Retenção |
|---|---|---|---|---|
| `/api/share/receive` | POST | título, texto, URL compartilhado (Web Share Target API — PWA) | CREATE MentorRascunho | 30 dias |

**Notas LGPD**:
- URL compartilhada **pode conter PII** (link de rede social, perfil pessoal).
- **Recomendação**: sanitizar URL (rejeitar `javascript:` scheme ✓ já feito).

---

## 3. Matriz Consolidada — Risco LGPD por Rota

| Rota | PII | Sensível? | LLM? | Multi-tenant? | Risco | Ação |
|---|---|---|---|---|---|---|
| `auth/register` | ✓ | ✓ | — | — | **Médio** | Linkar política de privacidade |
| `auth/login` | ✓ | — | — | — | Baixo | n/a |
| `auth/me`, `refresh`, `logout` | (via JWT) | — | — | — | Baixo | n/a |
| `profile` PATCH | ✓ | ✓ | — | — | Médio | Implementar DELETE |
| `chart`, `mandala`, `daily`, `transits` | (via perfil) | ✓ | — | — | Médio | Herdam risco do perfil |
| `cycle/snapshot` | ✓ | ✓ | — | — | Médio | Retenção recomendada |
| `caminhantes/[id]/*` | ✓ | ✓ | — | ✓ | **Alto** | Criptografia + auditoria |
| `conexoes` POST | ✓ (terceiro!) | ✓ | — | ✓ | **Alto** | Disclaimer no form |
| `tratamento/calcular` | ✓ | ✓ | — | ✓ | **Alto** | Não enviar para LLM |
| `mentor/ask`, `consult` | ✓ | ✓ | ✓ | — | **Crítico** | Opt-in separado + DPA |
| `checkout`, `subscription`, `credits` | ✓ (financeiro) | — | — | — | Médio | Retenção fiscal 5 anos |
| `webhooks/akasha-stripe` | (IDs) | — | — | — | Baixo | Validar assinatura |
| `push/subscribe`, `cron/daily-push` | (endpoint) | — | — | — | Baixo | Política de unsubscribe |
| `search/*`, `rag/*` | (queries) | — | parcial | — | Médio | Anonimizar logs |
| `chat/*`, `ritual/*`, `oraculo/*` | ✓ | ✓ | parcial | — | **Alto** | Retenção 24 meses + opt-in |
| `dashboard/*`, `manifesto/*` | (agregado) | — | — | — | Baixo | n/a |
| `admin/*`, `security/*`, `health/*` | — | — | — | — | Baixo | **Nunca logar PII** |
| `share/receive` | ✓ | — | — | — | Médio | Sanitização ✓ |

---

## 4. Recomendações (para o advogado validar)

### 4.1. Política de Retenção (proposta)

| Tipo | Retenção | Após delete de conta |
|---|---|---|
| Conta (User) | Indefinida | Delete imediato (cascata) |
| Mapas calculados | Indefinida | Delete imediato |
| Notas/Sessões | Indefinida | Delete imediato |
| Mensagens Mentor/Chat | 24 meses | Delete imediato |
| Logs de auditoria | 6 meses (anonimizado após 12 meses) | Anonimização |
| Backups | 90 dias rolling | Delete no próximo ciclo |
| Faturas | 5 anos | Retido (fiscal) |

### 4.2. Implementações Técnicas Recomendadas

- [ ] **DELETE /api/akasha/profile** com cascata completa.
- [ ] **Criptografia em repouso** para notas de consulente (campo livre).
- [ ] **Anonimização automática** de logs > 12 meses.
- [ ] **Opt-in granular** para uso de IA (Mentor) separado do consent geral.
- [ ] **DPA com Anthropic** (e qualquer LLM provider usado).
- [ ] **Auditoria de acesso** a notas de consulente (quem viu, quando).
- [ ] **Política de privacidade** linkada no fluxo de cadastro ANTES do
      checkbox `consent`.
- [ ] **Disclaimer explícito** no formulário de criação de `conexao`
      (responsabilidade do Zelador por dados de terceiros).
- [ ] **HTTPS obrigatório** + HSTS (verificar headers via
      `/api/security/headers`).
- [ ] **Rate limiting** já existe ✓ (`checkMemoryRateLimit`).

### 4.3. Direitos do Titular (Art. 18) — Verificação

- [x] **Acesso**: `/api/akasha/auth/me` + `/conta/legal` lista direitos.
- [x] **Correção**: `/api/akasha/profile` PATCH.
- [ ] **Portabilidade**: endpoint de export JSON **TODO** (verificar
      se existe em outro lugar).
- [ ] **Exclusão**: **TODO** — não há endpoint DELETE explícito.
- [x] **Revogação**: fluxo via `/conta` (verificar UI).

### 4.4. Itens Fora do Escopo deste Doc (apenas documentar)

- `prisma/AGENTS.md` — recomenda-se adicionar política de retenção ao
  schema (campos `deletedAt`, `retentionUntil`). **Não modificar** neste
  wave.
- Política de privacidade completa (texto) — **TODO** Wave 8 com advogado.
- Nomeação de DPO — **TODO** Wave 8.

---

## 5. Disclaimer Legal — Status

**Já implementado** em `apps/akasha-portal/src/app/[locale]/(akasha)/conta/legal/page.tsx`.

Conteúdo atual (resumo):

> "Este sistema integra **princípios esotéricos universais** (Cabala,
> Astrologia, Tantra, I Ching, sistemas energéticos correlatos)...
> Não somos afiliados, endossados ou licenciados pelos detentores dessas
> marcas... O Akasha Portal é uma ferramenta de **autoconhecimento e
> prática espiritual educativa**, não substitui acompanhamento profissional
> de saúde mental, médico, jurídico ou financeiro... O sistema respeita
> LGPD: você pode exportar e deletar seus dados a qualquer momento."

**Ações identificadas** (para Wave 8):

- [ ] Reforçar seção LGPD com Art. 18 numerado (5 direitos).
- [ ] Adicionar seção específica para uso de IA (transferência internacional).
- [ ] Adicionar aviso sobre dados de terceiros em `conexoes`.
- [ ] Adicionar contato do DPO.
- [ ] Data de "última atualização" + versão.

**Não modificar** este arquivo de disclaimer nesta wave (escopo fora).

---

## 6. Próximos Passos

1. **Wave 7.2 (esta)**: este documento criado como auditoria inicial.
2. **Wave 7.3 (próxima)**: revisão pelo time interno + priorização.
3. **Wave 8**:
   - Advogado de PI revisa este doc + corpus sources + ADR 0002/0006.
   - Política de privacidade completa é redigida.
   - Endpoints de portabilidade/exclusão são implementados.
   - DPA com LLM providers é assinado.
4. **Pré-lançamento**: DPO nomeado + treinamento interno + página de
   privacidade atualizada.

---

## 7. Anexos

- `docs/legal/PROTOCOLO_REVISAO_JURIDICA.md` — briefing para advogado.
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` — renomeações.
- `docs/adrs/0006-mcp-protocol.md` — contexto técnico MCP.
- `apps/akasha-portal/src/app/[locale]/(akasha)/conta/legal/page.tsx` — disclaimer.

---

**Última atualização**: 2026-06-24 (Wave 7.2 hardening — versão inicial).
