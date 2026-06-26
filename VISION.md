# 🌌 Akasha Portal — Visão da Comunidade

> **Versão:** 2.0 | **Data:** 2026-06-26
> **Mudança:** de "ferramenta de Zelador" → **comunidade viva de espiritualidade universalista + IA**

---

## 1. Propósito

Criar uma **comunidade online de espiritualidade universalista** onde pessoas podem:

- **Compartilhar** experiências, práticas e descobertas espirituais
- **Aprender** com base em evidências científicas e tradições ancestrais
- **Evoluir** juntas em consciência, com a IA como curadora/orientadora

A IA dentro do sistema **co-evolui junto com a comunidade**, trazendo:
- Correlações entre tradições (numerologia, Odu, astrologia, tantra,...)
- Artigos científicos com embasamento (Reiki, ayahuasca, psilocibina,...)
- Fundamentos daquilo que tem **evidência comprovada**

> "Acredito que criar uma comunidade assim seria algo muito gratificante, pro despertar das pessoas."

---

## 2. O que já temos (base sólida)

Construímos ao longo dos últimos meses:

### 🔬 Motor espiritual
- **Numerologia Cabalística** — caminho de vida, expressão, motivação
- **Odu (Ifá)** — 16 odus + orixás regentes + orixás pedindo atenção
- **Astrologia** — signo solar, ascendente, mapa completo
- **Numerologia Tântrica** — chakras dominantes
- **Elementos** — fogo, água, terra, ar, éter
- **Engine de correlação** — cruza os 4 mapas pra dar insights profundos

### 🎴 Jogo oracular pessoal
- **Mesa Real** — 36 casas ciganas com cruzamento por mapa
- **Cigano Ramiro** — entidade guia (não debochar, respeitar)
- **Sistema de tiragem** com IA gerando dossiê final

### 🧘 Práticas diárias
- Afirmações, sabedoria do dia, chakras, oráculo IA, mapa astral
- 12+ widgets no dashboard pessoal

### 📚 Documentação de governança
- IDEIA.md (banco de correspondências esotéricas)
- MAPA.md, ROADMAP.md, SPEC.md (no origin)

> **Nada disso é jogado fora.** É o **conhecimento** que a comunidade vai compartilhar e enriquecer juntos.

---

## 3. O que muda (nova camada)

### ❌ Antes (não seguimos mais)
- Visão de "ferramenta do Zelador"
- Atendimentos 1-para-1 com consulente
- Cockpit oracular como centro
- Usuário único usando sistema pessoal
- IA como "Mentor" prescritor

### ✅ Agora (visão da comunidade)
- **Rede social espiritual universalista**
- Múltiplos usuários trocando, aprendendo juntos
- **Home = timeline da comunidade** (não cockpit pessoal)
- Perfis públicos com seu mapa espiritual visível
- IA como **curadora/orientadora** — ajuda a achar conteúdo, conecta saberes, sugere leituras

---

## 4. Arquitetura proposta

### 4.1 Camadas

```
┌─────────────────────────────────────────────────┐
│  COMUNIDADE (camada social)                      │
│  Posts · Comentários · Grupos · Seguir · Curtir  │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  CONHECIMENTO (camada espiritual + científica)   │
│  Motor de correlação · Biblioteca · Artigos      │
│  Evidências científicas · Tradições              │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  PERFIL ESPIRITUAL (camada pessoal, compartilhada)│
│  Numerologia · Odu · Astrologia · Mapa pessoal  │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  IA CURADORA (camada de inteligência)            │
│  Recomendações · Correlações · Resumos           │
│  Chat comunitário · Busca semântica              │
└─────────────────────────────────────────────────┘
```

### 4.2 Modelo de dados (esboço)

```prisma
// Identidade
model User {
  id            String   @id @default(cuid())
  handle        String   @unique  // @seunome
  displayName   String
  bio           String?
  avatarUrl     String?
  spiritualProfile SpiritualProfile?
  posts         Post[]
  comments      Comment[]
  following     Follow[]  @relation("follower")
  followers     Follow[]  @relation("followed")
  groupMembers  GroupMember[]
  createdAt     DateTime @default(now())
}

// Mapa espiritual (público ou privado)
model SpiritualProfile {
  userId            String  @unique
  user              User    @relation(fields: [userId], references: [id])
  birthName         String
  birthDate         DateTime
  birthTime         String?
  birthPlace        String?
  // resultado calculado
  caminhoDeVida     Int?
  numeroPessoal     Int?
  oduNascimento     String?
  orixaRegente      String?
  signoSolar        String?
  ascendente        String?
  mapaJson          Json?   // cache completo do motor
  visibility        Visibility @default(public)
}

enum Visibility { public, community, private }

// Posts da comunidade
model Post {
  id        String   @id @default(cuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  content   String   @db.Text
  mediaUrls String[]
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
  tradition TraditionTag?  // xamanismo, cabala, ifa, tantra,...
  evidence  EvidenceTag?   // anedoctal, estudo, revisado
  references Json?         // links pros artigos científicos
  likes     Like[]
  comments  Comment[]
  createdAt DateTime @default(now())
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  content   String   @db.Text
  parentId  String?  // para threading
  parent    Comment? @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
  createdAt DateTime @default(now())
}

// Grupos por tradição/linha
model Group {
  id          String   @id @default(cuid())
  slug        String   @unique  // cabala, ifa, xamanismo, tantra, reiki,...
  name        String
  description String   @db.Text
  iconUrl     String?
  bannerUrl   String?
  tradition   String
  members     GroupMember[]
  posts       Post[]
  createdAt   DateTime @default(now())
}

model GroupMember {
  groupId   String
  group     Group    @relation(fields: [groupId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  role      GroupRole @default(member)
  joinedAt  DateTime @default(now())
  @@id([groupId, userId])
}

enum GroupRole { member, moderator, admin }

// Biblioteca coletiva (artigos, papers, livros)
model Article {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  summary     String   @db.Text
  body        String   @db.Text
  authorId    String?
  type        ArticleType  // paper, article, book, video, podcast
  tradition   String?
  topics      String[]
  references  Json?        // DOI, links
  evidenceLevel EvidenceLevel
  publishedAt DateTime
  createdAt   DateTime @default(now())
}

enum ArticleType { scientific_paper, magazine_article, book, video, podcast, essay }
enum EvidenceLevel { anecdotal, observational, peer_reviewed, meta_analysis }

// Social graph
model Follow {
  followerId  String
  followedId  String
  follower    User @relation("follower", fields: [followerId], references: [id])
  followed    User @relation("followed", fields: [followedId], references: [id])
  createdAt   DateTime @default(now())
  @@id([followerId, followedId])
}

model Like {
  userId    String
  postId    String
  user      User @relation(fields: [userId], references: [id])
  post      Post @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
  @@id([userId, postId])
}
```

### 4.3 Telas principais

1. **Home / Timeline** — feed personalizado (algoritmo: tradição + grupos + pessoas que sigo)
2. **Explorar** — trending na comunidade, tradições, artigos em destaque
3. **Grupos** — lista de tradições, entrar/sair, ver posts do grupo
4. **Biblioteca** — artigos científicos, papers, livros, vídeos com filtro por tradição/nível de evidência
5. **Perfil espiritual** — meu mapa completo (público, comunidade ou privado)
6. **Mesa Real / Oráculo** — ferramentas pessoais mantidas (agora compartilháveis)
7. **IA Curadora** — chat pra perguntar "me explica o que é xamanismo", "acha artigos sobre psilocibina", "qual a correlação entre signo X e odu Y"
8. **Notificações** — seguidores, comentários, artigos novos na sua tradição

---

## 5. Estratégia técnica

### 5.1 Stack mantida
- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind** + componentes atuais (SpiritualWidgetSystem)
- **Prisma** + **PostgreSQL/Supabase**
- **NextAuth** ou **Supabase Auth**

### 5.2 Bibliotecas novas necessárias
- **Editor de post**: Tiptap ou Lexical (rich text + markdown)
- **Busca semântica**: pgvector + embeddings (OpenAI/Cohere) — pra "achar artigos parecidos"
- **Notificações real-time**: Supabase Realtime ou Pusher
- **Upload de mídia**: Supabase Storage ou S3
- **Markdown + sanitize**: pra renderizar artigos com referências

### 5.3 IA Curadora
- Usa o motor de correlação que já existe (não joga fora)
- Adiciona RAG (Retrieval-Augmented Generation) com a biblioteca de artigos
- Prompt engineering pra tom: **curador/orientador**, não prescritor
- Co-evolui: a cada novo artigo indexado, IA fica mais esperta

---

## 6. Roadmap sugerido (3 fases)

### 🚀 Fase 1 — MVP da comunidade (4-6 semanas)
- Schema: User, SpiritualProfile, Post, Comment, Like, Follow
- Home com timeline básica
- Perfis públicos com mapa espiritual
- Auth via Supabase
- Onboarding que gera mapa espiritual automaticamente
- **Sem IA ainda** — só a rede social

### 🌱 Fase 2 — Conhecimento + grupos (4-6 semanas)
- Schema: Group, GroupMember, Article
- Grupos por tradição (cabalística, ifá, xamanismo, tantra,...)
- Biblioteca inicial: 50+ artigos curados sobre Reiki, ayahuasca, psilocibina, meditação
- Sistema de tags + nível de evidência
- Filtros e busca simples

### 🤖 Fase 3 — IA Curadora (4-6 semanas)
- pgvector + embeddings nos artigos
- Chat curador (RAG)
- Recomendações personalizadas
- Correlações automáticas via IA
- Co-evolução: feedback da comunidade melhora a IA

---

## 7. Decisões pendentes

1. **Forçar o main** pra essa nova visão (perde o trabalho do "Akasha Portal" atual)?
2. **Mobile-first ou web-first** pro MVP?
3. **Anonimato ou identidade real** — perfis são públicos com nome verdadeiro ou pseudônimos?
4. **Moderação** — como evitar discurso de ódio, charlatanismo, promessas perigosas?
5. **Monetização** — vai ser gratuito, freemium, comunidade fechada paga?

---

## 8. Tom de voz

Mantém o estilo do projeto:
- **Respeitoso** com todas as tradições (universalista, não proselitista)
- **Científico** quando tem evidência, **honesto** quando não tem
- **Comunitário** — "juntos evoluindo", não "guru dizendo"
- **Cuidado** com promessas — Reiki não cura câncer, ayahuasca não é pra todo mundo
- **Português** — público-alvo fala PT-BR (interface + moderação inicial)

---

> "Plante a semente da consciência. Colha uma comunidade desperta." 🌱