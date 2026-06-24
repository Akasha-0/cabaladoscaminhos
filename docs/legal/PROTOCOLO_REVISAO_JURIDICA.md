# PROTOCOLO_REVISAO_JURIDICA.md — Briefing para Advogado de PI

> **Objetivo**: parecer formal de advogado brasileiro especializado em
> Propriedade Intelectual (PI) sobre os riscos jurídicos do Akasha Portal
> antes do lançamento público dos Pilares 6 (Human Design traduzido) e
> 7 (Gene Keys traduzido).
>
> **Tipo de revisão**: Direito Autoral (copyright) + Direito Marcário
> (trademark) + Conformidade LGPD + Eventual ANVISA.
>
> **Status atual**: pré-lançamento. Aguardando aprovação para marcar como
> "aprovado para produção".
>
> **Orçamento esperado**: R$ 2.000–5.000 (~5–10h de trabalho).
>
> **Data prevista de contratação**: Wave 8.
>
> **Acompanhamento interno**: equipe Akasha (Zelador + produto).

---

## 1. Contexto do Projeto (para o advogado)

O **Akasha Portal** é uma plataforma SaaS B2B usada por **Zeladores**
(praticantes esotéricos profissionais — counselors espirituais, terapeutas
holísticos) para atender **consulentes** (clientes finais).

O sistema correlaciona **5 Pilares canônicos**:

1. **Cabala** (numerologia cabalística, Mispar Hechrachi).
2. **Astrologia** (zodíaco tropical, casas, aspectos — via Swiss Ephemeris).
3. **Tantra** (11 corpos Yogi Bhajan + 5 koshas védicas + 4 temperamentos gregos).
4. **Odu** (15 Odus canônicos do Candomblé, escritos do zero).
5. **I Ching** (64 hexagramas King Wen, Wilhelm/Baynes 1950).

E, **em Wave 8+**, pretende adicionar 2 Pilares traduzidos (não literais):

6. **Pilar 6 — "Mapa Energético Integrado"** (tradução universalista do
   Human Design, com nomenclatura renomeada — ver ADR 0002).
7. **Pilar 7 — "Espectro Sombra-Dom-Siddhi"** (tradução universalista do
   Gene Keys, com 64 Portas escritas do zero — ver ADR 0002).

### Stack técnica

- TypeScript / Next.js / Postgres / Redis.
- 352 corpus texts indexados (RAG).
- 61 rotas API REST autenticadas (JWT + multi-tenant).
- Hospedagem: a definir (Vercel / Railway / VPS próprio).

### Modelo de negócio

- **B2B** (Zelador paga assinatura mensal ou anual).
- **Sem marketplace público** de consulentes.
- **Sem rede social** (não há feed, like, share público).
- **Conteúdo fechado**: consulente só vê o próprio mapa.

### Público-alvo

- Brasil (PT-BR primeiro).
- Idade 25-65 anos, predominantemente feminino (~70%).
- Praticantes ou simpatizantes de tradições esotéricas (Cabala, Astrologia,
  Candomblé, Tantra, I Ching, Human Design, Gene Keys).

---

## 2. Itens a Revisar (Checklist Estruturado)

### 2.1. Direito Marcário (Trademark) — PRIORIDADE ALTA

**Pergunta ao advogado**: os nomes proprietários abaixo, quando aparecem
em fontes externas (links, referências cruzadas, citações) mas não na UI
do Akasha, configuram risco de marca?

#### Marcas em inglês (origem)

- **Human Design®** — sistema criado por Ra Uru Hu (Alan Krakower), 1987.
  - Registros conhecidos: USPTO (US), EUIPO (UE), possivelmente INPI.
  - Empresa: Jovian Archive (detentora).
- **Gene Keys** — sistema criado por Richard Rudd, 2009.
  - Registros: USPTO, possivelmente EUIPO.
  - Empresa: Gene Keys LLC.
- **I Ching** — termo genérico (milenar, domínio público).
  - **Atenção**: traduções específicas (ex: "Wilhelm/Baynes 1950") podem
    ter copyright de tradução, mas não trademark.
- **Astrologia / Astrology** — termo genérico.
- **Odu** — termo genérico (Candomblé, Ifá).
- **Tantra** — termo genérico (sânscrito, milenar).

#### Marcas derivadas (PT-BR)

- **Human Design Brasil** — verificar se há registros ativos no INPI.
- **Gene Keys Brasil** — verificar.
- **Mapa Energético Integrado** — termo criado por nós (verificar
  disponibilidade para registro futuro).
- **Espectro Sombra-Dom-Siddhi** — termo criado por nós.

#### Outputs esperados

- Lista de marcas que **não podem aparecer** na UI, copy, código, schema,
  metadata, OpenGraph, sitemap, nem em URLs públicas.
- Lista de marcas que **podem aparecer** em citações acadêmicas
  explícitas (ex: "Inspirado em princípios do Human Design de Ra Uru Hu").
- Recomendação de registro de marca própria (Akasha Portal) no INPI.

### 2.2. Direito Autoral (Copyright) — PRIORIDADE ALTA

**Pergunta ao advogado**: os 352 corpus texts do Akasha estão em situação
jurídica segura?

#### Corpus canônico (origens abertas)

| Fonte | Status | Volume estimado |
|---|---|---|
| **I Ching — Wilhelm/Baynes 1950** | Copyright de tradução expirado em vários países (EUA: obra publicada antes de 1978, regras complexas); domínio público na prática para o texto clássico. | ~64 hexagramas |
| **I Ching — outras traduções clássicas** (Legge 1899, Wilhelm 1923) | Domínio público. | idem |
| **Sepher Yetzirah** (texto cabalístico medieval) | Domínio público (século III-IV). | 1 texto |
| **Zohar** (texto cabalístico medieval) | Domínio público (século XIII). | volumes canônicos |
| **Bhagavad Gita** | Domínio público (sânscrito clássico). | 1 texto |
| **Yoga Sutras de Patanjali** | Domínio público (~200 AC). | 1 texto |
| **16 Odus canônicos do Candomblé** | Tradição oral → registros acadêmicos; tratamos como domínio público com versão escrita do zero. | 16 textos |
| **Textos sobre Tantra Yogi Bhajan** | ⚠️ Alguns têm copyright ativo (Yogi Bhajan Estate). Verificar caso a caso. | varia |
| **Textos de Alexandre Cumino** (astrologia humanista BR) | Copyright ativo do autor (verificar cessão ou licença). | varia |
| **Textos de Rubens Saraceni** (Cabala BR) | Copyright ativo do autor (verificar cessão ou licença). | varia |
| **Textos de Adriano Camargo** (numerologia) | Copyright ativo (verificar cessão ou licença). | varia |

#### Outputs esperados

- Lista completa dos 352 corpus com **status de copyright por item**.
- Identificação de itens que **exigem licença escrita** (cessão,
  royalty, ou remoção).
- Identificação de itens que **estão OK** (domínio público ou licença
  compatível).
- Recomendação de licença própria para o conteúdo escrito do zero pela
  equipe (ex: CC BY-NC-SA 4.0?).

### 2.3. Conformidade LGPD — PRIORIDADE CRÍTICA

**Pergunta ao advogado**: o Akasha está em conformidade com a LGPD
(Lei 13.709/2018)?

#### Art. 37 LGPD — Consentimento

- [x] **Cadastro**: campo `consent: true` obrigatório (literal zod).
  Ver `apps/akasha-portal/src/app/api/akasha/auth/register/route.ts:20`.
- [ ] **Política de privacidade**: precisa estar linkada no fluxo de
  cadastro **e** no rodapé de todas as páginas autenticadas.
- [ ] **Revogação de consentimento**: verificar se o Zelador pode
  deletar a conta e todos os dados derivados.
- [ ] **Consentimento granular**: perguntar separadamente para marketing,
  analytics, compartilhamento com IA/LLM.

#### Art. 33 LGPD — Transferência internacional

- [ ] **LLM providers** (Anthropic, OpenAI): dados de consulentes (pergunta,
  contexto, mapa) são enviados para servidores nos EUA. Adequação?
  - Verificar se há DPA (Data Processing Agreement) assinado.
  - Verificar se há cláusula de "transferência internacional" na
    política de privacidade.

#### Art. 18 LGPD — Direitos do titular

- [x] **Acesso** (ver `apps/akasha-portal/src/app/conta/legal/page.tsx:65`).
- [x] **Correção** (perfil editável).
- [x] **Portabilidade** (export JSON — verificar implementação).
- [x] **Exclusão** (direito ao esquecimento — verificar implementação
    completa: cascata para notas, sessões, etc).
- [x] **Revogação** (consentimento).

#### Art. 46 LGPD — Segurança

- [ ] **Criptografia em repouso**: dados sensíveis (data nascimento,
  respostas de tratamento) criptografados?
- [ ] **Criptografia em trânsito**: HTTPS obrigatório (verificar HSTS).
- [ ] **Logs**: PII em logs? (auditar — ver `docs/legal/DATA_FLOWS.md`).
- [ ] **Backups**: política de retenção e criptografia.
- [ ] **DPO**: nomear encarregado de dados (Data Protection Officer).

#### Art. 50 LGPD — Boas práticas

- [ ] **Privacy by design**: revisão de arquitetura.
- [ ] **Privacy by default**: settings default mais restritivos.
- [ ] **Registro de operações**: inventário de tratamentos (este
      documento é parte).

#### Outputs esperados

- Parecer formal de conformidade LGPD (ou lista de gaps a corrigir).
- Identificação do **controlador** vs **operador** (Zelador vs Akasha).
- Identificação da **base legal** para cada tratamento (consentimento,
  execução de contrato, legítimo interesse).
- Revisão da política de privacidade atual.
- Recomendação de prazo de retenção (ver seção 4 deste briefing).

### 2.4. ANVISA / Conselho Federal — PRIORIDADE BAIXA

**Pergunta ao advogado**: o Akasha faz "promessa de cura" ou "prescrição
terapêutica"?

- O disclaimer atual já afirma explicitamente:
  > "O Akasha Portal é uma ferramenta de **autoconhecimento e prática
  > espiritual educativa**, não substitui acompanhamento profissional de
  > saúde mental, médico, jurídico ou financeiro."
- Verificar se a linguagem usada ("tratamento", "cura", "terapia") pode
  configurar exercício ilegal de medicina/psicologia.
- Recomendação: reforçar disclaimer; evitar palavras-gatilho em copy.

### 2.5. ANATEL / CFEM / Outros — N/A

Não aplicável ao escopo.

---

## 3. Brief Pre-Filled (informações para o advogado trabalhar)

### 3.1. Renomeações Universalistas (ADR 0002 — já implementadas)

| Original (proprietário) | Tradução Akasha |
|---|---|
| Type: Generator | Tipo: Iniciador (ou "Perfil de Energia Contínua") |
| Type: Projector | Tipo: Projetor (ou "Perfil de Guia") |
| Type: Manifestor | Tipo: Manifestador |
| Type: Reflector | Tipo: Refletor |
| Authority: Emotional | (mantido — genérico) |
| Authority: Sacral | (mantido — genérico) |
| Authority: Splenic | Autoridade: Esplênica |
| Authority: Ego/Heart | Autoridade: Cardíaca |
| Authority: G-Center | Autoridade: Centro de Identidade |
| Authority: Lunar | (mantido — genérico) |
| Strategy: To Respond | Estratégia: Esperar Convite |
| Strategy: To Inform | Estratégia: Informar |
| Strategy: To Initiate | Estratégia: Iniciar |
| Strategy: To Wait | Estratégia: Esperar (lua de 29 dias) |
| Centers: 9 | (mantido) |
| Channels | (mantido — genérico) |
| Gates | Portas (mantido) |
| Shadow → Gift → Siddhi | Sombra → Dom → Siddhi |
| Venus Sequence | Sequência Venusiana |
| Golden Pathway | Caminho Dourado |
| Incarnation Cross | Cruz de Encarnação |

**Nota**: decisão final da nomenclatura pública dos Pilares 6 e 7 está
em aberto (ver ADR 0002 — proposta: "Mapa Energético Integrado" para
Pilar 6, "Espectro Sombra-Dom-Siddhi" para Pilar 7).

### 3.2. Disclaimer Legal Atual (implementado)

Já em produção em `/[locale]/(akasha)/conta/legal`:

> "Este sistema integra **princípios esotéricos universais** (Cabala,
> Astrologia, Tantra, I Ching, sistemas energéticos correlatos).
> Inspirações conceituais incluem tradições como Human Design e Gene Keys,
> **reinterpretadas de forma original e não-comercial**.
>
> Não somos afiliados, endossados ou licenciados pelos detentores dessas
> marcas. Todo o conteúdo textual é escrito do zero pela nossa equipe,
> sem cópia literal de fontes proprietárias. A nomenclatura utilizada
> no sistema (Pilares 6 e 7) é universalista e não comercial.
>
> O Akasha Portal é uma ferramenta de **autoconhecimento e prática
> espiritual educativa**, não substitui acompanhamento profissional
> de saúde mental, médico, jurídico ou financeiro."

**Pergunta ao advogado**: este disclaimer é suficiente? Reforçar em quais
pontos?

### 3.3. Fontes do Corpus (lista resumida para auditoria de copyright)

Documento completo: `docs/legal/CORPUS_SOURCES.md` (TODO Wave 8).

Por origem:
- **Domínio público**: I Ching (Wilhelm/Baynes 1950, Legge 1899),
  Sepher Yetzirah, Zohar, Bhagavad Gita, Yoga Sutras, Odus (escritos do zero).
- **Copyright ativo, com licença**: Tantra (Yogi Bhajan — verificar cessão),
  textos do Alexandre Cumino, Rubens Saraceni, Adriano Camargo.
- **Escritos do zero pela equipe**: 16 Odus, 64 Portas do Pilar 7,
  descrições dos Tipos/Autoridades do Pilar 6.

---

## 4. Recomendação de Política de Retenção (a validar com advogado)

> **Esta seção é recomendação interna; o advogado deve validar ou ajustar.**

### Proposta de retenção

| Tipo de dado | Retenção ativa | Após delete de conta | Justificativa |
|---|---|---|---|
| **Dados de conta** (nome, email, hash senha) | Indefinida | Delete imediato (cascata) | LGPD Art. 18 V |
| **Dados de nascimento** (data, hora, local, lat/lng) | Indefinida | Delete imediato | PII sensível |
| **Mapas calculados** (5 Pilares) | Indefinida | Delete imediato | Derivado de PII |
| **Notas de consulente** (Zelador → consulente) | Indefinida | Delete imediato (cascata) | Conteúdo do Zelador |
| **Sessões** (data, tipo, notas) | Indefinida | Delete imediato | Conteúdo do Zelador |
| **Mensagens do Mentor** (perguntas, respostas) | 24 meses | Delete imediato após período | LLM context window |
| **Logs de auditoria** | 6 meses (anonimizado após 12 meses) | Anonimização automática | LGPD Art. 37 + auditoria |
| **Backups** | 90 dias (rolling) | Delete no próximo ciclo | Disaster recovery |
| **Faturas/notas fiscais** | 5 anos | Retido por obrigação legal | Legislação fiscal BR |

### Anonimização vs Delete

- **Delete** = remoção física do registro.
- **Anonimização** = manter dados estatísticos sem possibilidade de
  re-identificação (ex: hash SHA-256 do user_id + data aproximada).

Logs de auditoria devem ser **anonimizados** após 12 meses (não deletados,
para fins de segurança e auditoria agregada).

---

## 5. Deliverables Esperados do Advogado

1. **Parecer formal de trademark** (PDF, ~3-5 páginas):
   - Lista de marcas que NÃO podem aparecer na UI/copy.
   - Lista de marcas que PODEM aparecer em citações.
   - Recomendação de registro de marca própria no INPI.

2. **Parecer formal de copyright** (PDF, ~5-10 páginas):
   - Status de copyright dos 352 corpus (tabela).
   - Itens que exigem licença escrita.
   - Recomendação de licença para conteúdo próprio.

3. **Parecer de conformidade LGPD** (PDF, ~8-15 páginas):
   - Mapeamento Art. 37, 18, 33, 46, 50.
   - Lista de gaps a corrigir antes do lançamento.
   - Política de privacidade revisada.
   - Recomendação de DPO.

4. **Parecer ANVISA** (1-2 páginas):
   - Confirmação de que o disclaimer atual afasta risco regulatório.
   - Sugestões de reforço se necessário.

5. **Parecer final consolidado** (~2 páginas):
   - GO / NO-GO para lançamento público.
   - Lista priorizada de ajustes (P0, P1, P2).

---

## 6. Cronograma Sugerido

| Semana | Atividade |
|---|---|
| Semana 1 | Briefing + envio de corpus sources list + NDA |
| Semana 2-3 | Análise do advogado + reuniões de dúvidas |
| Semana 4 | Entrega dos 5 pareceres |
| Semana 5 | Implementação de ajustes P0 + re-revisão |
| Semana 6 | GO/NO-GO final |

---

## 7. Orçamento

- **Estimativa**: R$ 2.000–5.000 (5–10h × R$ 400-500/h advogado sênior PI).
- **Inclui**: 1 reunião de kickoff (1h), análise assíncrona, 1 reunião
  de dúvidas (1h), entrega dos pareceres.
- **Não inclui**: litígio, negociação de licença, registro de marca no
  INPI (orçamento separado se necessário).

---

## 8. Contatos Internos

- **Product Owner**: [a definir]
- **Tech Lead**: [a definir]
- **DPO (se houver)**: [a definir]
- **Repositório**: `cabala-dos-caminhos` (branch `main`).

---

## 9. Anexos para Envio ao Advogado

1. ADR 0002 (renomeações universalistas) — `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md`.
2. ADR 0006 (MCP — contexto técnico) — `docs/adrs/0006-mcp-protocol.md`.
3. Documento de data flows (LGPD) — `docs/legal/DATA_FLOWS.md`.
4. Disclaimer legal atual — `apps/akasha-portal/src/app/[locale]/(akasha)/conta/legal/page.tsx`.
5. Lista completa do corpus (352 textos) — `docs/legal/CORPUS_SOURCES.md` (TODO Wave 8).
6. Documento de produto (`docs/01_product-brief.md`, `docs/02_prd.md`).

---

**Última atualização**: 2026-06-24 (Wave 7.2 hardening — versão inicial).
