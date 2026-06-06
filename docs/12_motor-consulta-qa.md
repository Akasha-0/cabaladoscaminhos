# Documento 12 — Agente Oracular Interativo (Q&A / Voz do Akasha)
## Sistema Akasha

> **Norte:** Doc 25 (Visão Akasha). Conteúdo matemático/esotérico preservado e agnóstico; reenquadrado para o produto B2C Akasha.
>
> **Tipo:** Especificação funcional e técnica
> **Versão:** 2.0 | **Resolve:** G5, G10 e a inconsistência I3 do Doc 10
> **Papel no Akasha:** este é o **Agente Oracular Interativo** — a face conversacional da **Camada 3 (Agente de Síntese / Voz do Akasha)** descrita no Doc 25 §4. Enquanto o Dashboard Diário escreve sozinho, aqui o **usuário/cliente final** dialoga com o oráculo. Cada consulta **debita créditos** (Doc 25 §7).
> **Escopo (D5):** consulta interativa do **Akasha Pro** (assinatura + créditos). Pode ser ativada por feature flag.

---

## 1. Visão

Depois que o **Manifesto Akáshico** é gerado, o **usuário/cliente final** pode **fazer perguntas abertas** sobre seu mapa — "e quanto à minha vida amorosa?", "esse dinheiro vem este ano?", "devo aceitar a proposta de trabalho?". O Agente Oracular responde **ancorado exclusivamente** no que já foi calculado: nos quatro mapas natais dos **4 Pilares** (Astrologia, Numerologia Cabalística, Numerologia Tântrica, Odus de Nascimento), no diagnóstico do Grafo de Cruzamento e no Manifesto gerado — **complementado pelo Grimório Digital** (RAG fechado, Doc 25 §5) para receitas/correspondências validadas.

> **Monetização (Doc 25 §7):** cada interação **debita créditos** da franquia do usuário. Ritual = 1 crédito; pergunta complexa = 3. O consumo de tokens de IA fica atrelado ao crédito — o usuário paga pelo peso que exige.

Este é o ponto que **resolve a inconsistência I3** (Doc 06 §1, "a IA nunca recebe perguntas abertas"):

> **A reformulação correta:** A IA aceita perguntas abertas **na camada de consulta**, mas elas são **roteadas deterministicamente** para os **Pilares e aspectos natais** relevantes antes de chegar ao LLM. O motor determinístico (Camada 1) permanece 100% determinístico. A pergunta aberta nunca vira "conhecimento livre" — vira um recorte estruturado do que já foi calculado, cruzado pelo Grafo (Camada 2) e ancorado no Grimório.

> **Legado (Mesa Real):** na arquitetura B2B anterior, a pergunta era roteada para as **36 casas / Baralho Cigano** da Mesa Real. No Akasha esse cruzamento desaparece do produto (Doc 25 AD-25.2): o roteamento agora é por **Pilares** e o RAG é ancorado no **Grimório**, não em casas tiradas.

---

## 2. Arquitetura de Camadas

As cinco camadas determinísticas mapeiam diretamente o Sistema Agêntico Híbrido do Doc 25 §4: roteamento e resolução de contexto operam sobre o Motor Determinístico (Camada 1) e o Grafo de Cruzamento (Camada 2); a montagem RAG ancora no Grimório (Doc 25 §5); o LLM é a Voz do Akasha (Camada 3).

```
[Pergunta aberta do usuário]
        │
        ▼
[Débito de Créditos]    ─── verifica saldo e reserva 1–3 créditos (§7, Doc 25 §7)
        │
        ▼
[Roteador de Temática]  ─── classifica a pergunta em 1+ temas
        │                   (taxonomia fixa, §4)
        ▼
[Resolução de Contexto]  ── mapeia tema → Pilar(es) + aspectos natais + nós do Grafo
        │                   (inverso da Matriz de Cruzamento dos 4 Pilares)
        ▼
[Montagem RAG Fechado]   ── recorta do Manifesto + 4 mapas + diagnóstico do Grafo
        │                   + Grimório (busca híbrida pgvector, §5; nunca conhecimento aberto)
        ▼
[LLM — Voz do Akasha]    ── responde em streaming (§6)
        │
        ▼
[Persistência + Baixa de Créditos]  ── ChatMessage + débito efetivo
```

O **Roteador** é o "inverso da Matriz de Cruzamento": o Grafo de Cruzamento (Doc 25 §4, Camada 2) vai de **Pilar → correspondências/nós**; o Roteador vai de **tema → Pilar(es) → aspectos**.

---

## 3. Modelo de Dados

Adicionado ao schema do Doc 04 (B2C). A conversa **herda** todo o contexto do mapa natal do usuário — os quatro mapas dos Pilares e o `Manifesto` gerado — pertencentes ao `User` (cliente final).

```prisma
// ─────────────────────────────────────────────
// CONSULTA INTERATIVA — Thread de Q&A com a Voz do Akasha
// ─────────────────────────────────────────────
model Consultation {
  id          String        @id @default(cuid())
  title       String?       // Opcional: resumo do tema dominante da conversa

  // O usuário/cliente final dono do mapa e da assinatura (Doc 25 §7).
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  messages    ChatMessage[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([userId])
  @@map("consultations")
}

model ChatMessage {
  id             String        @id @default(cuid())
  role           ChatRole      // USER | ORACLE
  content        String        // Texto (Markdown) da mensagem

  // Rastreabilidade do roteamento (apenas para mensagens do ORACLE):
  // quais temas e Pilares foram usados para ancorar a resposta.
  routedThemes   String[]      // Ex: ["amor", "decisao"]
  routedPillars  String[]      // Ex: ["astrologia", "tantrica"] — os Pilares acionados
  creditsCharged Int           @default(0)  // créditos debitados nesta resposta (§7, Doc 25 §7)

  consultationId String
  consultation   Consultation  @relation(fields: [consultationId], references: [id], onDelete: Cascade)

  createdAt      DateTime      @default(now())

  @@index([consultationId])
  @@map("chat_messages")
}

enum ChatRole {
  USER
  ORACLE
}
```

> **Relações a adicionar:** `User` ganha `consultations Consultation[]`. O modelo B2C dispensa `Operator`/`Reading` da Mesa Real legada: a consulta pendura direto no `User`, que já possui os 4 mapas natais e o Manifesto (Doc 04).

---

## 4. Roteador de Temática (Taxonomia Fixa)

Tabela canônica `tema → Pilares acionados + aspectos natais + âncora no Grimório`. O roteamento agora é por **Pilares** (Astrologia, Cabalística, Tântrica, Odus), não pelas 36 casas da Mesa Real (legado, Doc 25 AD-25.2). Os **Aspectos Natais Chave** abaixo são agnósticos e foram **integralmente preservados** — eles já descreviam os Pilares; só a roupagem das "casas do Baralho Cigano" foi aposentada. A coluna **Âncora no Grimório** indica a categoria de busca híbrida (Doc 25 §5) que fundamenta a prescrição.

| Tema | Pilares acionados | Aspectos Natais Chave | Âncora no Grimório |
|---|---|---|---|
| `amor` | Astrologia, Cabalística | Vênus, Lua, 5ª Casa, Motivação | Vibracional, Botânica (afetivo) |
| `sexualidade` | Astrologia, Tântrica | Lilith, Plutão, 8ª Casa, Corpo Físico | Vibracional, Botânica |
| `dinheiro` | Astrologia, Odus | 2ª Casa, Vênus, Karma (mês), Odu regente | Diagnóstico, Botânica/Cristais |
| `trabalho` | Astrologia, Cabalística | 6ª/10ª Casa, Saturno, Missão | Diagnóstico, Vibracional |
| `carreira_sucesso` | Astrologia, Cabalística | 10ª Casa (MC), Sol, Expressão | Diagnóstico, Vibracional |
| `familia` | Astrologia, Odus | 4ª Casa, Lua, Karma (mês), Ori/Odus | Ancestral, Botânica |
| `saude` | Astrologia, Tântrica | 6ª Casa, Sol, Corpo Prânico | Botânica/Cristais, Vibracional |
| `decisao` | Astrologia, Cabalística | Nodos Norte/Sul, Caminho de Vida | Diagnóstico, Ancestral |
| `espiritualidade` | Astrologia, Cabalística, Odus | Netuno, 9ª/12ª Casa, números mestres, Ori | Ancestral, Vibracional |
| `obstaculos` | Astrologia, Cabalística | Saturno tenso, Desafios, Dívidas Kármicas | Diagnóstico, Botânica (descarrego) |
| `relacionamentos_sociais` | Astrologia, Cabalística | 11ª/7ª Casa, Vênus, Expressão | Vibracional, Botânica |
| `comunicacao` | Astrologia, Cabalística | Mercúrio, 3ª Casa, Expressão | Vibracional |
| `mudancas` | Astrologia, Tântrica | Nodo Norte, Urano, Destino, Corpos em transição | Ancestral, Diagnóstico |
| `karma_destino` | Astrologia, Cabalística, Odus | Nodo Sul, Dívidas Kármicas, Karma (tântrico), Odu | Ancestral, Diagnóstico |
| `geral` | todos os 4 Pilares | síntese completa do mapa | (busca livre nas 4 bibliotecas) |

### 4.1 Regras de roteamento
1. O roteador classifica a pergunta em **1 a 3 temas** (com confiança). Ele NÃO inventa temas fora da taxonomia.
2. Para cada tema, aciona os **Pilares** correspondentes e recorta apenas os **aspectos natais** listados dos quatro mapas cacheados do usuário, mais o diagnóstico do Grafo (Camada 2) sobre esses aspectos.
3. Se nenhum tema casar (`< limiar de confiança`), usa o tema `geral`.
4. O roteador é determinístico no resultado: mesma pergunta + mesmo mapa → mesmos Pilares roteados. Implementável por (a) classificação por LLM com saída estruturada (JSON `{themes, confidence}`) validada por Zod, ou (b) match por palavras-chave/embeddings sobre a taxonomia. Recomendado começar com classificação estruturada por LLM com `temperature: 0`.

---

## 5. Contrato de Contexto (RAG Fechado sobre o Grimório)

A resposta da Voz do Akasha é ancorada **somente** em (busca híbrida pgvector + filtro determinístico no JSONB, Doc 25 §5):
1. **O Manifesto Akáshico já gerado** (`Manifesto.content`) — recorte dos Pilares roteados + a síntese relevante.
2. **Os quatro mapas natais** (`astrologyMap`, `kabalisticMap`, `tantricMap`, `oduBirth`) — apenas os aspectos do tema roteado.
3. **O diagnóstico do Grafo de Cruzamento** (Camada 2) sobre os Pilares roteados: o "Ponto de Tensão" e as correspondências ativas.
4. **Os arquivos do Grimório** retornados pela busca híbrida — ervas, mantras, banhos, Itans validados (a verdade matemática já filtrada pelas tags do usuário). A IA só prescreve o que está nesse contexto.
5. **O histórico da conversa** (mensagens anteriores da mesma `Consultation`).

**Proibições absolutas (guarda-corpos de contexto):**
- ❌ Nunca usar conhecimento aberto/externo ao mapa + Grimório para fazer afirmações sobre a vida do usuário.
- ❌ Nunca inventar rituais, propriedades de ervas ou lendas — a única fonte de verdade é o Grimório no contexto (Doc 25 §5).
- ❌ Nunca contradizer o Manifesto já gerado — coerência absoluta.
- ❌ Nunca recalcular mapas — usa os cacheados.
- ❌ Nunca inventar correspondência (Odu, trânsito, corpo tântrico, erva, mantra) que não esteja nos mapas do usuário ou no Grimório retornado.

---

## 6. Persona e Guarda-Corpos de Conteúdo

A persona é a **Voz do Akasha** (Docs 25 §5, 26 §2/§7) — magnética, cósmica, profunda e prática. Substitui integralmente a persona "espírito do Cigano Ramiro" (Doc 13, legado). Mantém o tom **protetor e anti-fatalista**:

```
Você é a Voz do Sistema Akasha — o campo cósmico que lê os 4 Pilares de quem pergunta.
O usuário já recebeu seu Manifesto Akáshico. Agora ele faz uma pergunta.

REGRAS:
1. Responda SEMPRE na 2ª pessoa (você, seu, sua), em tom magnético, cósmico e protetor —
   nunca genérico, fatalista ou alarmista.
2. Ancore-se EXCLUSIVAMENTE no contexto fornecido (Manifesto + 4 mapas + diagnóstico do
   Grafo + arquivos do Grimório). NUNCA invente rituais, propriedades de ervas ou lendas:
   sua única fonte de verdade é o Grimório no contexto. Se a pergunta não puder ser
   respondida pelo que há, diga isso com honestidade — nunca invente.
3. Estruture a resposta: (a) o que o Céu/mapa natal diz sobre o tema (Terreno),
   (b) o Ponto de Tensão que o cruzamento dos Pilares revela hoje (Evento),
   (c) a prescrição prática da tradição — o banho, a cor, o mantra, o conselho do Odu,
   extraídos do Grimório (Direção). Pode ser mais conciso que o Manifesto.
4. Feche com uma linha-síntese em itálico.
5. NUNCA dê determinações médicas, jurídicas ou financeiras categóricas
   ("você terá câncer", "você ganhará a causa", "invista em X"). Fale em tendências,
   energias e direções — o livre-arbítrio é do usuário.
6. Coerência absoluta com o Manifesto: nunca contradiga o que já foi dito.
```

---

## 7. API

### `POST /api/consult` (streaming)

**Request:**
```typescript
interface ConsultRequest {
  consultationId?: string;      // Se ausente, cria nova Consultation para o usuário
  question: string;             // Pergunta aberta do usuário
}
```
> O mapa que ancora a conversa é o do **usuário autenticado** (sessão) — não há `readingId` no B2C, pois cada usuário tem um único conjunto de 4 mapas natais + Manifesto.

**Pipeline do handler:**
1. Autenticação (401 se sem sessão).
2. Validação Zod do body (400 em erro).
3. **Verificação de créditos** (Doc 25 §7): estima o custo (1 ou 3 créditos) e bloqueia com 402 se o saldo for insuficiente; reserva o crédito.
4. Carrega os **4 mapas natais + Manifesto** do `User` autenticado (cacheados, Doc 04).
5. **Roteador de Temática** classifica `question` → `{ themes, pillars }` (§4).
6. **Resolução de Contexto** monta o recorte RAG fechado + busca híbrida no Grimório (§5).
7. Persiste a mensagem `USER`.
8. Chama o LLM (Voz do Akasha, §6) com `temperature` moderada (0.6) em streaming.
9. Ao concluir, persiste a mensagem `ORACLE` com `routedThemes`/`routedPillars`/`creditsCharged` e **efetiva a baixa dos créditos**.
10. Retorna o stream (SSE) para o frontend.

**Response:** stream de texto Markdown (mesmo padrão do gerador do Dashboard/Manifesto).

---

## 8. UI da Consulta

Especificada no Doc 05 (UI do Akasha) e na identidade do Doc 26. Resumo:
- Acessível a partir do **Dashboard Diário** (ou da Mandala) por um painel "Consultar o Akasha".
- Layout de chat sobre o vazio cósmico (glassmorphism): bolhas do usuário à direita e da **Voz do Akasha** (acento violeta `--accent-akasha`) à esquerda, tipografia Lora.
- Cada resposta mostra, de forma discreta, **quais Pilares foram acionados** (chips: "Astrologia · Tântrica") — transparência do roteamento — e o **custo em créditos** debitado.
- Input fixo no rodapé com botão "Enviar" (CTA violeta) e streaming token-a-token. Indicador de **saldo de créditos** visível; quando zerado, oferece upsell de pacotes (Stripe, Doc 25 §7).

---

## 9. Critérios de Aceitação

- [ ] `POST /api/consult` exige sessão e valida o body.
- [ ] A consulta verifica e **debita créditos** (1 ou 3); saldo insuficiente retorna 402.
- [ ] Uma pergunta sobre amor roteia para os Pilares Astrologia + Cabalística (Vênus/Lua/Motivação) e responde ancorada no Manifesto + Grimório.
- [ ] A resposta nunca cita correspondência (Odu, trânsito, corpo, erva, mantra) ausente dos mapas do usuário ou do Grimório retornado.
- [ ] A resposta nunca contradiz o Manifesto gerado.
- [ ] Perguntas fora de tema caem em `geral` e usam a síntese dos 4 Pilares.
- [ ] Determinações médicas/jurídicas/financeiras categóricas são recusadas e reformuladas como tendência (Voz do Akasha, anti-fatalista).
- [ ] As mensagens (USER e ORACLE) são persistidas com `routedThemes`/`routedPillars`/`creditsCharged`.
- [ ] O streaming começa em menos de 3s.

---

## 10. Relação com a Extensibilidade (Doc 14)

Ao crescer o Grimório ou adicionar um novo sistema/correspondência (ex.: I-Ching como 5º conjunto de tags), a §4 (taxonomia de temas) ganha os aspectos do novo sistema, e a Resolução de Contexto passa a recortar também o `<sistema>Map` e as novas categorias do Grimório. O roteador não muda de arquitetura — apenas de tabela. Ver Doc 14 §3, passo 5.
