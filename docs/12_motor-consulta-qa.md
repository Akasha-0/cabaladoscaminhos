# Documento 12 — Motor de Consulta Interativa (Q&A)
## Cabala dos Caminhos

> **Tipo:** Especificação funcional e técnica
> **Versão:** 1.0 | **Resolve:** G5, G10 e a inconsistência I3 do Doc 10
> **Escopo (D5):** recomendado para a **Fase 2** do roadmap, após o MVP do dossiê. Pode ser ativado por feature flag.

---

## 1. Visão

Depois que o dossiê é gerado, o terapeuta (ou o consulente, via leitura mediada pelo terapeuta) pode **fazer perguntas abertas** sobre a leitura — "e quanto à minha vida amorosa?", "esse dinheiro vem este ano?", "devo aceitar a proposta de trabalho?". O motor de Q&A responde **ancorado exclusivamente** na leitura já realizada: nos quatro mapas natais, nas casas tiradas e no dossiê gerado.

Este é o ponto que **resolve a inconsistência I3** (Doc 06 §1, "a IA nunca recebe perguntas abertas"):

> **A reformulação correta:** A IA aceita perguntas abertas **na camada de consulta**, mas elas são **roteadas deterministicamente** para as casas e aspectos natais relevantes antes de chegar ao LLM. O motor por-casa (gerador do dossiê) permanece 100% determinístico. A pergunta aberta nunca vira "conhecimento livre" — vira um recorte estruturado do que já foi calculado.

---

## 2. Arquitetura de Camadas

```
[Pergunta aberta do usuário]
        │
        ▼
[Roteador de Temática]  ─── classifica a pergunta em 1+ temas
        │                   (taxonomia fixa, §4)
        ▼
[Resolução de Contexto]  ── mapeia tema → casa(s) + aspectos natais
        │                   (inverso da Matriz de Correlação)
        ▼
[Montagem RAG Fechado]   ── recorta do dossiê + mapas + casas tiradas
        │                   (nunca conhecimento aberto, §5)
        ▼
[LLM com persona do Oráculo]  ── responde em streaming (§6)
        │
        ▼
[Persistência: ChatMessage]
```

O **Roteador** é o "inverso da Matriz": a Matriz de Correlação (Doc 06) vai de **casa → aspectos**; o Roteador vai de **tema → casa(s) → aspectos**.

---

## 3. Modelo de Dados

Adicionado ao schema do Doc 04. A conversa **herda** todo o contexto de um `Reading` (e, por ele, do `Client` e do `Report`).

```prisma
// ─────────────────────────────────────────────
// CONSULTA INTERATIVA — Thread de Q&A sobre uma leitura
// ─────────────────────────────────────────────
model Consultation {
  id          String        @id @default(cuid())
  title       String?       // Opcional: resumo do tema dominante da conversa

  readingId   String
  reading     Reading       @relation(fields: [readingId], references: [id], onDelete: Cascade)

  userId      String
  user        User          @relation(fields: [userId], references: [id])

  messages    ChatMessage[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([readingId])
  @@map("consultations")
}

model ChatMessage {
  id             String        @id @default(cuid())
  role           ChatRole      // USER | ORACLE
  content        String        // Texto (Markdown) da mensagem

  // Rastreabilidade do roteamento (apenas para mensagens do ORACLE):
  // quais temas e casas foram usados para ancorar a resposta.
  routedThemes   String[]      // Ex: ["amor", "decisao"]
  routedHouses   Int[]         // Ex: [24, 22]

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

> **Relações a adicionar:** `Reading` ganha `consultations Consultation[]`; `User` ganha `consultations Consultation[]`.

---

## 4. Roteador de Temática (Taxonomia Fixa)

Tabela canônica `tema → casas primárias + secundárias + aspectos natais`. As âncoras vêm da visão; as demais derivam da Matriz de Correlação (Doc 06 §2).

| Tema | Casas Primárias | Casas Secundárias | Aspectos Natais Chave |
|---|---|---|---|
| `amor` | 24 (Coração) | 25 (Anel), 29 (Cigana) | Vênus, Lua, 5ª Casa |
| `sexualidade` | 7 (Serpente) | 30 (Lírios), 8 (Caixão) | Lilith, Plutão, 8ª Casa |
| `dinheiro` | 34 (Peixes) | 15 (Urso), 2 (Trevo) | 2ª Casa, Vênus, Karma (mês) |
| `trabalho` | 35 (Âncora) | 31 (Sol), 15 (Urso) | 6ª/10ª Casa, Saturno, Missão |
| `carreira_sucesso` | 31 (Sol) | 15 (Urso), 33 (Chave) | 10ª Casa (MC), Sol |
| `familia` | 4 (A Casa) | 5 (Árvore) | 4ª Casa, Lua, Karma (mês) |
| `saude` | 5 (Árvore) | 23 (Rato) | 6ª Casa, Sol, Corpo Prânico |
| `decisao` | 22 (Caminhos) | 10 (Foice), 33 (Chave) | Nodos Norte/Sul, Caminho de Vida |
| `espiritualidade` | 16 (Estrela) | 26 (Livro), 36 (Cruz) | Netuno, 9ª/12ª Casa, números mestres |
| `obstaculos` | 21 (Montanha) | 6 (Nuvens), 19 (Torre) | Saturno tenso, Desafios, Dívidas |
| `relacionamentos_sociais` | 20 (Jardim) | 18 (Cachorro) | 11ª/7ª Casa, Vênus |
| `comunicacao` | 12 (Pássaros) | 27 (Carta), 14 (Raposa) | Mercúrio, 3ª Casa, Expressão |
| `mudancas` | 17 (Cegonha) | 8 (Caixão), 13 (Criança) | Nodo Norte, Urano, Destino |
| `karma_destino` | 36 (Cruz) | 22 (Caminhos), 8 (Caixão) | Nodo Sul, Dívidas Kármicas, Karma |
| `geral` | (todas as casas tiradas) | — | síntese completa do dossiê |

### 4.1 Regras de roteamento
1. O roteador classifica a pergunta em **1 a 3 temas** (com confiança). Ele NÃO inventa temas fora da taxonomia.
2. Para cada tema, inclui as casas primárias **que foram tiradas na leitura** (`matrixData`). Casas não tiradas entram apenas como contexto natal (sem carta/Odu do dia).
3. Se nenhum tema casar (`< limiar de confiança`), usa o tema `geral`.
4. O roteador é determinístico no resultado: mesma pergunta + mesma leitura → mesmas casas roteadas. Implementável por (a) classificação por LLM com saída estruturada (JSON `{themes, confidence}`) validada por Zod, ou (b) match por palavras-chave/embeddings sobre a taxonomia. Recomendado começar com classificação estruturada por LLM com `temperature: 0`.

---

## 5. Contrato de Contexto (RAG Fechado)

A resposta do Oráculo é ancorada **somente** em:
1. **O dossiê já gerado** (`Report.content`) — recorte das casas roteadas + a síntese relevante.
2. **Os quatro mapas natais** (`astrologyMap`, `kabalisticMap`, `tantricMap`, `oduBirth`) — apenas os aspectos do tema roteado.
3. **As casas tiradas** das casas roteadas (`matrixData`): carta + Odu do dia.
4. **O histórico da conversa** (mensagens anteriores da mesma `Consultation`).

**Proibições absolutas (guarda-corpos de contexto):**
- ❌ Nunca usar conhecimento aberto/externo à leitura para fazer afirmações sobre a vida do consulente.
- ❌ Nunca contradizer o dossiê já gerado — coerência absoluta.
- ❌ Nunca recalcular mapas — usa os cacheados.
- ❌ Nunca inventar casa/carta/Odu que não está na leitura.

---

## 6. Persona e Guarda-Corpos de Conteúdo

A persona é **a mesma do Oráculo** (Docs 06 §3.2 e 09), no espírito do Cigano Ramiro (Doc 13):

```
Você é o Oráculo da Cabala dos Caminhos, no espírito do Cigano Ramiro.
O consulente já recebeu um dossiê. Agora ele faz uma pergunta.

REGRAS:
1. Responda SEMPRE na 2ª pessoa (você, seu, sua), tom místico-tecnológico e protetor.
2. Ancore-se EXCLUSIVAMENTE no contexto fornecido (dossiê + mapas + casas roteadas).
   Se a pergunta não puder ser respondida pelo que foi tirado, diga isso com honestidade
   e convide a uma nova tiragem — nunca invente.
3. Estruture a resposta: (a) o que os mapas natais dizem sobre o tema (Terreno),
   (b) o que as casas tiradas revelam do momento (Evento),
   (c) a direção/conselho do Odu (Direção). Pode ser mais conciso que o dossiê.
4. Feche com uma linha-síntese em itálico.
5. NUNCA dê determinações médicas, jurídicas ou financeiras categóricas
   ("você terá câncer", "você ganhará a causa", "invista em X"). Fale em tendências,
   energias e direções — o livre-arbítrio é do consulente.
6. Coerência absoluta com o dossiê: nunca contradiga o que já foi dito.
```

---

## 7. API

### `POST /api/consult` (streaming)

**Request:**
```typescript
interface ConsultRequest {
  readingId: string;            // A leitura que ancora a conversa
  consultationId?: string;      // Se ausente, cria nova Consultation
  question: string;             // Pergunta aberta do usuário
}
```

**Pipeline do handler:**
1. Autenticação (401 se sem sessão).
2. Validação Zod do body (400 em erro).
3. Carrega `Reading` + `Client` + `Report` (mapas e dossiê).
4. **Roteador de Temática** classifica `question` → `{ themes, houses }` (§4).
5. **Resolução de Contexto** monta o recorte RAG fechado (§5).
6. Persiste a mensagem `USER`.
7. Chama o LLM (persona §6) com `temperature` moderada (0.6) em streaming.
8. Ao concluir, persiste a mensagem `ORACLE` com `routedThemes`/`routedHouses`.
9. Retorna o stream (SSE) para o frontend.

**Response:** stream de texto Markdown (mesmo padrão do `/api/generate-dossier`).

---

## 8. UI da Consulta

Especificada no Doc 05 §9 (nova seção). Resumo:
- Acessível a partir do dossiê (`/dashboard/leituras/[id]`) por uma aba/painel "Consultar o Oráculo".
- Layout de chat: bolhas do usuário (laranja, à direita) e do Oráculo (royal, à esquerda), tipografia Lora.
- Cada resposta do Oráculo mostra, de forma discreta, **quais casas foram consultadas** (chips royal: "Casa 24 · Casa 22") — transparência do roteamento.
- Input fixo no rodapé com botão "Enviar" (laranja) e streaming token-a-token.

---

## 9. Critérios de Aceitação

- [ ] `POST /api/consult` exige sessão e valida o body.
- [ ] Uma pergunta sobre amor roteia para a Casa 24 (+ Vênus/Lua) e responde ancorada no dossiê.
- [ ] A resposta nunca cita carta/Odu que não está na `matrixData` da leitura.
- [ ] A resposta nunca contradiz o dossiê gerado.
- [ ] Perguntas fora de tema caem em `geral` e usam a síntese.
- [ ] Determinações médicas/jurídicas/financeiras categóricas são recusadas e reformuladas como tendência.
- [ ] As mensagens (USER e ORACLE) são persistidas com `routedThemes`/`routedHouses`.
- [ ] O streaming começa em menos de 3s.

---

## 10. Relação com a Extensibilidade (Doc 14)

Ao adicionar um novo sistema oracular (ex.: I-Ching), a §4 (taxonomia de temas) ganha as colunas/aspectos do novo sistema, e a Resolução de Contexto passa a recortar também o `<sistema>Map`. O roteador não muda de arquitetura — apenas de tabela. Ver Doc 14 §3, passo 5.
