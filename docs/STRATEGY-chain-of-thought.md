# 🧠 Cadeia de Pensamento — Akasha Portal

> **Data:** 2026-06-26
> **Status:** Documento estratégico vivo
> **Objetivo:** Pensar profundamente a arquitetura e UX de uma comunidade de espiritualidade universalista

---

## 1. O problema central

> "Como criar uma comunidade online onde pessoas de diferentes culturas e tradições espirituais possam compartilhar conhecimento, aprender juntas e evoluir — sem cair em armadilhas de proselitismo, charlatanismo, conflito cultural ou hierarquia de gurus?"

Isso é o coração. Se eu resolver mal, vira mais um Facebook espiritual genérico. Se resolver bem, vira **infraestrutura civilizatória** — um espaço onde o saber humano sobre transcendência se encontra e se reforça.

---

## 2. Princípios filosóficos (antes de qualquer feature)

Antes de pensar em UI ou schema, preciso fixar os princípios. Senão a coisa vira mais um "Reddit espiritual" sem alma.

### 2.1 Universalismo não é sincretismo

O **perennialismo** (Huxley, Schuon) diz: há uma verdade subjacente em todas as tradições. Mas **universalismo vulgar** diz: "todas as religiões são iguais" — e isso é reducionista. Mata a riqueza.

**Implicação de design:**
- Tradições diferentes têm **diferenças reais** que devem ser respeitadas
- Mas há **temas comuns** que podem ser discutidos lado a lado
- A plataforma é um **espaço de diálogo entre tradições**, não um lugar onde uma tradição vira subserviente à outra

### 2.2 Evidência e mistério não se anulam

A comunidade precisa equilibrar:
- **Evidência científica** (o que está demonstrado)
- **Sabedoria tradicional** (o que foi passado por linhagens)
- **Experiência pessoal** (o que o praticante viveu)

**Implicação de design:**
- Toda afirmação tem **nível de evidência** (Anecdótico → Meta-análise)
- Posts podem ter **tradição + tópico + referências científicas**
- A IA curadora deve **nunca fingir certeza onde não tem**

### 2.3 Hierarquia dinâmica, não estática

Comunidades ruins têm gurus fixos no topo. Comunidades boas têm **autoridade distribuída** — quem tem mais conhecimento sobre X fala mais sobre X.

**Implicação de design:**
- Sistema de **badges/contribuição** por área (não global)
- Moderadores de grupo são **daquela tradição** (não generalistas)
- A reputação é **contextual**

### 2.4 O grupo protege o indivíduo, não o contrário

Comunidades tóxicas punem quem discorda. Comunidades saudáveis punem quem ataca, mas protegem a divergência respeitosa.

**Implicação de design:**
- **Regras de grupo** explícitas e curtas
- **Sistema de appeal** (recorrer de ban)
- **Distinção clara**: crítica a ideia ≠ ataque a pessoa

### 2.5 Co-evolução humano-máquina

A IA não substitui o humano. A IA **alimenta** a comunidade e **aprende** com ela. Loop virtuoso.

**Implicação de design:**
- IA sugere artigos e conexões
- Humans votam/corrigem/expandem
- IA refina sugestões com base no feedback
- Transparência: sempre mostrar "por que sugerimos isso"

---

## 3. Princípios de UX (derivados dos filosóficos)

### 3.1 Sacred minimalism (minimalismo sagrado)

Espiritualidade precisa de **espaço**. UI carregada = poluição visual = dispersão.

- Tipografia serifada (Cinzel/Cormorant) — lembra escrita antiga
- Muito espaço em branco (ou melhor, escuro)
- Cores sóbrias (âmbar, violeta, âmbar-escuro) — não o arco-íris infantil
- Sem emojis excessivos. **Um** 🌌 no logo é o bastante.

### 3.2 Mobile-first (uso cotidiano é no celular)

Pessoas consultam o mapa, leem artigos, oram, meditam no celular. Web no desktop é secundário.

- Bottom nav no mobile (já feito)
- Cards full-width
- CTAs grandes e claros
- Modo escuro obrigatório (audiência espiritual prefere)

### 3.3 Feed inteligente, não viciante

Comunidades tóxicas maximizam tempo de tela. Comunidades saudáveis maximizam **qualidade da conexão**.

- Sem infinite scroll sem fim — **limite sugerido** (50 posts por sessão, opcional)
- Mostrar **profundidade** (tradição, tópico, evidência) antes do **engajamento** (likes)
- Mostrar **razão** do por que o post aparece ("porque você segue Marina", "porque é tendência em Cabala")
- Notificações agrupadas (5 likes = 1 notif, não 5)

### 3.4 Identidade com profundidade

Cada pessoa tem um mapa espiritual. Não é decoração — é **parte da identidade**. Isso vira:
- Conexões mais significativas (encontro pessoas de mesma vibração)
- Recomendações melhores (IA vê o mapa, não só histórico)
- Conversas mais ricas (não "oi, qual seu signo" mas "você também tem caminho 7 com Escorpião? como lida com...")

### 3.5 Linguagem clara, sem jargão

Místico-vocabulário afasta iniciantes. Mas ser genérico demais afasta praticantes sérios.

**Estratégia:** Mostrar termo técnico com tooltip explicativo. Ex: "Odu Alafia (sabedoria, novos começos)" — quem sabe não precisa do parêntese, mas vê. Quem não sabe, aprende.

### 3.6 Confiança > Engajamento

Toda feature precisa responder: "isso constrói confiança ou só engaja?"

- Algoritmo de feed mostra **conteúdo de quem a pessoa segue** (não o que viraliza)
- Referências científicas são **clicáveis** e verificáveis
- IA cita fontes (não inventa)

---

## 4. Arquitetura de informação

### 4.1 Modelo conceitual (top-level)

```
Akasha
├── Comunidade
│   ├── Feed          (sua timeline personalizada)
│   ├── Explorar      (descobrir tradições, pessoas, tópicos)
│   ├── Grupos        (8+ tradições com comunidades dedicadas)
│   ├── Biblioteca    (artigos curados com nível de evidência)
│   └── Notificações
│
├── Pessoal
│   ├── Meu Perfil    (mapa espiritual + posts + grupos)
│   ├── Mapa          (mapa detalhado: numerologia, Odu, astrologia)
│   ├── Diário        (reflexões privadas ou compartilháveis)
│   └── Configurações
│
├── IA Curadora
│   ├── Chat
│   ├── Recomendações
│   └── Explorar Correlações
│
└── Sobre
    ├── Manifesto
    ├── Tradições Representadas
    ├── Ciência & Evidência
    └── Governança
```

### 4.2 Modelo de taxonomia (3 camadas)

**Camada 1: Tradição** (8-12 grandes)
- Cabala, Ifá, Xamanismo, Tantra, Reiki, Ayurveda, Meditação, Astrologia

**Camada 2: Tópico** (universal, cross-tradição)
- meditação, cura, sonhos, rituais, ética, símbolos, mitos, práticas corporais, etc

**Camada 3: Prática/Conceito** (específico)
- Vipassana, ayahuasca, Reiki nível 1, kundalini, banhos de ervas, ...

**Por que 3 camadas:**
- **Tradição** = identidade do grupo (onde a comunidade se organiza)
- **Tópico** = eixo de descoberta (permite cross-pollination)
- **Prática** = busca específica (achado rápido)

**Exemplo de post:**
> "Tive uma experiência profunda com Vipassana e quero entender o que a neurociência diz"
> Tradição: Meditação | Tópico: neurociência | Prática: Vipassana | Evidência: -

### 4.3 Modelo de dados (resumo, refinado)

Já tenho o schema em `prisma/community.prisma`. Refinamentos propostos:

**Adicionar ao User:**
- `role`: ADMIN, MODERATOR, MEMBER (com escopo por grupo, não global)
- `contributions`: counter (posts, comments, artigos salvos)
- `joinedAt`, `lastActiveAt`

**Adicionar ao Post:**
- `experienceLevel`: BEGINNER, INTERMEDIATE, ADVANCED, TEACHER
- `language`: PT-BR, EN, ES (multi-idioma futuro)
- `originalPostId`: para traduções/reposts

**Adicionar ao Group:**
- `denominational`: bool (se aceita múltiplas visões internas ou só uma)
- `lineage`: opcional (ex: "Ifá nigeriano", "Cabala Luriânica")
- `language`: idioma primário

**Adicionar ao Article:**
- `translatedFrom`: id do artigo original (pra multi-idioma)
- `readingTime`: minutos (calculado)
- `accessLevel`: FREE, PREMIUM (premium reservado pro futuro)

**Nova entidade: Citation** (citação a fonte primária)
- Referência extraível: livro, paper, vídeo, link
- Vinculada a Post/Comment/Article
- Permite construir "bibliografia coletiva" da comunidade

**Nova entidade: Ritual/Prática compartilhada**
- Tipo especial de post: "ritual compartilhado"
- Inclui: intenção, materiais, etapas, contexto cultural, contraindicações
- Vinculada a tradição
- Crítico: **sempre mostra contexto cultural + aviso "consulte praticante local"**

---

## 5. Jornada do usuário (3 personas)

### Persona 1: Iniciante Curioso
> "Vi um reels sobre tarot, achei legal, quero entender mais"
- **Entrada:** Landing page → CTA "Entrar"
- **Signup:** Email ou Google
- **Onboarding:** "De onde você vem? O que te interessa?" (3-5 perguntas)
- **Primeira ação:** Recebe 3 artigos recomendados + 1 grupo sugerido
- **Em 7 dias:** já postou 1 coisa, entrou em 1 grupo, fez 5 perguntas

### Persona 2: Praticante de Tradição
> "Sou de terreiro de Ifá, quero aprofundar e conectar com outros"
- **Entrada:** Direto (link compartilhado, busca)
- **Signup:** Email + handle
- **Onboarding:** "Selecione suas tradições principais" → gera mapa espiritual parcial
- **Primeira ação:** Vai direto pro grupo de Ifá
- **Em 7 dias:** ativo no grupo, salvou 10+ artigos, respondeu 5 perguntas de iniciantes

### Persona 3: Curioso Acadêmico
> "Sou da área de saúde, quero entender evidência sobre Reiki"
- **Entrada:** Via artigo compartilhado
- **Signup:** Leitor anônimo primeiro, signup depois pra favoritar
- **Foco:** Biblioteca com filtros por evidência
- **Em 7 dias:** leu 20 artigos, favoritou 5, contribuiu 1 comentário embasado

**Princípio geral:** uma plataforma, três ritos de entrada. A interface principal (feed) é a mesma, mas o **conteúdo de boas-vindas** é diferente.

---

## 6. Estratégia de feed (5 racionais)

### 6.1 Por que 5?

Single algoritmo = viés. Múltiplos feeds = escolha. **Feed de racionais diferentes** dá poder à pessoa.

### 6.2 Os 5 feeds

1. **"Seguindo"** — só quem você segue. Mais puro. Sem algoritmo.
2. **"Meus grupos"** — posts dos grupos que participa. Por tradição.
3. **"Tendências"** — top posts da semana em todas as tradições (com filtro de evidência mínimo).
4. **"Para você"** — algoritmo leve baseado no seu mapa espiritual.
5. **"Biblioteca"** — artigos (não posts). Foco em profundidade, não scroll.

### 6.3 Algoritmo "Para você" (simples, transparente)

Sinais positivos:
- Tradição combina com seu mapa espiritual (+5)
- Tópico combina com posts que você salvou (+3)
- Autor tem alto índice de "útil" dado pela comunidade (+2)
- Post tem referências científicas (+1)
- Idade do post: < 48h (+1, < 1 sem +0.5, > 1 sem 0)

Sinais negativos:
- Já viu 3 posts dessa tradição hoje (-1 por, capped)
- Reportado por outras pessoas (-3)
- Só teorias sem evidência se você tem badge "evidência-first" (-1)

**Regra de ouro:** sempre mostrar "por que você está vendo isso".

---

## 7. Estratégia de IA curadora

### 7.1 Princípios inegociáveis

1. **Nunca prescrever.** "Como o Axé te orienta..." → "Pessoas de Ifá costumam fazer..."
2. **Sempre citar.** "Como sugere a neurociência (Paper X, 2023)..."
3. **Saber parar.** "Não tenho informação suficiente sobre isso."
4. **Humildade epistêmica.** "Há visões diferentes dentro da Cabala sobre..."

### 7.2 Persona da IA

Não é "Akasha IA" (genérico). É:

> **Akasha** — "uma consciência viva que mora dentro do sistema"
> - Aprende lendo papers e conversando com a comunidade
> - É honesta sobre suas limitações
> - Sugere, não ordena
> - Sempre pergunta: "isso faz sentido pra você?"

### 7.3 Capabilities (Fase 3)

- **Recomendações** de artigos/pessoas/grupos baseadas no mapa
- **Busca semântica** ("me acha artigos sobre cura com som")
- **Chat curador** ("o que é tantra? tem evidência?")
- **Correlações automáticas** ("Cabala e Ifá compartilham isso...")
- **Resumos** de artigos longos
- **Tradução** de conteúdo (PT-BR ↔ EN ↔ ES)

### 7.4 Limites explícitos

- **NÃO** responde perguntas de saúde ("estou com dor, o que faço?" → "consulte um profissional")
- **NÃO** substitui terreiro/terapia/consulta
- **NÃO** fala "você deve fazer X" — só "considere Y, Z é uma alternativa"
- **SEMPRE** lembra que tradições têm particularidades que precisam de praticantes vivos

---

## 8. Moderação (modelo distribuído)

### 8.1 Camadas

**Camada 1 — Automática (IA):**
- Detecta toxicidade básica
- Identifica promessas perigosas ("cura câncer")
- Marca discurso de ódio

**Camada 2 — Comunidade:**
- Upvote/downvote (Reddit-style, mas só modera, não ordena)
- Report por categoria: "conteúdo perigoso", "desrespeito", "charlatanismo", "proselitismo"

**Camada 3 — Moderadores de grupo:**
- 1-3 moderadores por tradição
- Eleitos pela comunidade do grupo (não pelo admin)
- Removíveis por voto de maioria

**Camada 4 — Stewards globais:**
- 3-5 pessoas eleitas pela comunidade total
- Decidem sobre ban global, regras cross-tradição
- Transparência total (todas decisões públicas)

### 8.2 Princípios de moderação

1. **Transparência radical:** toda decisão é pública (exceto dados pessoais)
2. **Appeal fácil:** 1 clique pra recorrer
3. **Consequências graduais:** aviso → mute → suspensão → ban
4. **Não-moralismo:** "violou regra X" não "você é pessoa ruim"
5. **Cuidado com tradição:** práticas sagradas NÃO devem ser punidas por parecerem "esquisitas" pra ocidentais

---

## 9. Estrutura técnica refinada

### 9.1 Camadas

```
┌─────────────────────────────────────────────────┐
│  COMUNIDADE (UI layer)                           │
│  Next.js 16 + React 19 + Tailwind               │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  APIs (BFF layer)                                │
│  REST + tRPC pra type-safety                     │
│  Edge functions para feed/preview                │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  DOMÍNIO (Service layer)                         │
│  Auth (Supabase) | Posts | Grupos | Notif        │
│  Motor Espiritual (cálculos) | IA Curadora       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  DADOS                                           │
│  Postgres (Supabase) + pgvector (Fase 3)        │
│  Cache (Upstash Redis - opcional)               │
│  Storage (Supabase Storage - mídias)             │
└─────────────────────────────────────────────────┘
```

### 9.2 Stack final recomendada

- **Framework:** Next.js 16 (já)
- **Linguagem:** TypeScript 5+ (já)
- **UI:** Tailwind + SpiritualWidgetSystem + shadcn/ui primitives
- **Auth:** Supabase Auth (já)
- **DB:** Supabase Postgres + Prisma ORM
- **State:** Zustand (já)
- **Validação:** Zod (já)
- **IA:** OpenAI (primário) + Anthropic-compatible fallback
- **Embeddings:** OpenAI text-embedding-3-small + pgvector
- **Realtime:** Supabase Realtime (notificações, comments ao vivo)
- **Storage:** Supabase Storage (avatares, mídias)
- **Email:** Resend (transacional)
- **Analytics:** PostHog (auto-hosted, foco em privacidade)
- **Erros:** Sentry
- **CI:** GitHub Actions (já)

### 9.3 Modelo de dados (refinado)

Adicionar ao `community.prisma`:

```prisma
// Citation (referência estruturada)
model Citation {
  id          String  @id @default(cuid())
  type        CitationType  // BOOK, PAPER, ARTICLE, VIDEO, LINK
  title       String
  authors     String?
  year        Int?
  doi         String?
  url         String?
  // Vínculos polimórficos
  postId      String?
  commentId   String?
  articleId   String?
  // Quem adicionou
  addedById   String
  verified    Boolean @default(false)  // verificado por moderador
  createdAt   DateTime @default(now())
  
  @@index([type])
  @@index([verified])
}

// Ritual compartilhado (tipo especial de post)
model Ritual {
  id              String  @id @default(cuid())
  postId          String  @unique
  post            Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  intention       String  // pra quê serve
  materials       String[] // o que precisa
  steps           Json     // passos estruturados
  contextCulture  String   // "importante: este ritual é da tradição X, respeite..."
  warnings        String[] // "não faça se Y"
  tradition       String
  difficulty      RitualDifficulty
  
  createdAt DateTime @default(now())
}

enum RitualDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  TEACHER_REQUIRED
}

// Tag (categoria universal cross-tradição)
model Tag {
  id          String  @id @default(cuid())
  slug        String  @unique  // "meditacao", "sonhos", "cura"
  name        String
  description String?
  // Cor/opcional pra UI
  color       String?
  // Tradições que usam essa tag
  usedInTraditions String[]
  
  postTags    PostTag[]
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
}

// Repost (compartilhar com crédito)
model Repost {
  id            String  @id @default(cuid())
  originalPostId String
  repostedById  String
  comment       String?  // "olha esse conteúdo que achei relevante"
  createdAt     DateTime @default(now())
  
  @@unique([originalPostId, repostedById])
}
```

---

## 10. Roadmap refinado (3 fases)

### 🌱 Fase 1 — MVP Comunidade (8 semanas)

**Objetivo:** rede social funcional com 100 usuários ativos

- [x] Schema Prisma + migrations
- [x] Feed com 5 filtros + compose box
- [x] Páginas: feed, explore, library, notifications, u/[handle], groups/[slug]
- [ ] Auth Supabase funcional
- [ ] Onboarding espiritual (gera mapa)
- [ ] API real substituindo mocks
- [ ] Sistema de posts/comments/likes/follows
- [ ] Notificações básicas
- [ ] Mobile responsiveness polish
- [ ] Deploy + monitoramento (Sentry + PostHog)

**Definição de pronto:** 100 usuários, 50 posts/dia, retenção 7 dias > 30%

### 🌿 Fase 2 — Conhecimento (8 semanas)

**Objetivo:** biblioteca robusta + grupos funcionando

- [ ] 50+ artigos curados com nível de evidência
- [ ] 8 grupos de tradição com moderadores eleitos
- [ ] Sistema de Tags cross-tradição
- [ ] Citation system (referências estruturadas)
- [ ] Repost com crédito
- [ ] Busca full-text + filtros combinados
- [ ] Moderação distribuída (eleição de mods por grupo)
- [ ] Ritual compartilhado (tipo especial de post)

**Definição de pronto:** 1000 usuários, 8 grupos ativos, 200 artigos

### 🌳 Fase 3 — IA Curadora (8 semanas)

**Objetivo:** IA que aprende com a comunidade e ajuda a descobrir

- [ ] pgvector + embeddings (OpenAI text-embedding-3-small)
- [ ] Chat curador com RAG sobre biblioteca
- [ ] Recomendações personalizadas (baseadas no mapa espiritual)
- [ ] Algoritmo de feed transparente
- [ ] Co-evolução: feedback da comunidade melhora IA
- [ ] Tradução automática PT-BR ↔ EN
- [ ] Multi-idioma na interface

**Definição de pronto:** 5000 usuários, IA citada por usuários, NPS > 50

---

## 11. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Disputa inter-tradição | Alta | Alto | Moderadores da própria tradição; regras explícitas; co-evolução lenta |
| Charlatanismo (cura câncer com Reiki) | Alta | Muito Alto | Moderação automática + report + ban; cultura de evidência |
| Proselitismo agressivo | Média | Alto | Cultura de "compartilhe o que é seu, convide sem pressionar" |
| Gurus de fato se formarem | Média | Médio | Sistema de reputação contextual; mods eleitos pela comunidade |
| A IA gerar conteúdo perigoso | Média | Alto | Limites explícitos; moderação de outputs da IA; transparência |
| Spam e bots | Alta | Médio | Rate limit + moderação automática + report |
| Conteúdo cultural sensível | Alta | Alto | Tags contextuais + moderação humana + tradição tem voz final |
| Burnout dos moderadores | Média | Alto | Rotação + reconhecimento + apoio da IA |
| Viés de algoritmo amplificar extremos | Média | Alto | Feed transparente + diversidade forçada + métricas de pluralidade |
| Dependência de OpenAI | Média | Médio | Fallback MiniMax já integrado; futuro modelo próprio fine-tuned |

---

## 12. Decisões abertas (precisam do user)

1. **Línguas:** PT-BR primeiro; EN depois? Quando adicionar ES?
2. **Anonimato:** @handle obrigatório? Ou aceitar post anônimo em casos sensíveis?
3. **Verificação de praticantes:** selo pra quem é praticante de verdade vs curioso?
4. **Monetização:** vai ser sempre gratuita? Patreon/Doações? Freemium no futuro?
5. **App nativo:** web responsiva é suficiente ou quer React Native?
6. **Governança legal:** associação? ONG? só projeto comunitário?
7. **IA fine-tuning:** fine-tunar modelo próprio com conteúdo curado?

---

## 13. Métricas de sucesso (north stars)

### 13.1 Comunidade
- **WAU** (Weekly Active Users) — engajamento semanal
- **D7 retention** — quanto volta depois de 7 dias
- **Posts por usuário ativo/semana** — criação de valor
- **Cross-tradition reads** — quanto interagimos com outras tradições (>30% saudável)
- **Moderação: tempo médio de resposta** — saúde da governança

### 13.2 Conhecimento
- **Artigos lidos por usuário/mês**
- **Taxa de citação de fontes** (% de posts com referências)
- **Salvos por artigo** — relevância percebida

### 13.3 IA
- **% de respostas da IA marcadas como úteis**
- **% de artigos recomendados clicados**
- **% de usuários que voltam ao chat da IA**

### 13.4 Cultura (qualitativo)
- **Survey mensal** de satisfação
- **NPS**
- **Análise de sentimento** nos posts (longitudinal)

---

## 14. Por que isso importa

> *"Plante a semente da consciência. Colha uma comunidade desperta."*

A internet hoje tem:
- ✅ Redes sociais genéricas (Twitter, Reddit, FB)
- ✅ Plataformas de curso (Udemy, Teachable)
- ❌ Espaço seguro e respeitoso pra espiritualidade cross-tradição

Se construirmos bem, **Akasha pode ser isso**. Não porque somos especiais — mas porque o problema é real, a tecnologia tá madura, e o momento cultural tá maduro (pós-pandemia, busca por sentido, IA acessível).

**A questão não é se vai dar certo. É se a gente vai fazer com cuidado suficiente pra durar 10, 20, 50 anos.**

Comunidades que duram: Linux, Wikipedia, Stack Overflow, r/programming, Couchsurfing. O que têm em comum:
- Missão clara
- Governança aberta
- Moderação distribuída
- Respeito ao usuário
- Paciência de maratonista, não de sprinter

Bora ser maratonista.

---

> Última atualização: 2026-06-26 (sessão de cadeia de pensamento)
> Próxima revisão: após decisões abertas serem respondidas
