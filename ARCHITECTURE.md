# 🏛️ Arquitetura do Akasha Portal

> **Versão:** 3.0 | **Data:** 2026-06-26
> **Status:** Em refatoração (auditoria completa, plano de limpeza)
> **Visão:** Comunidade viva de espiritualidade universalista + IA co-evoluindo

---

## 1. Decisões macro

### O que é o projeto

- **Comunidade online** de espiritualidade universalista
- **IA curadora** (não prescritora) que aprende com a comunidade
- **Gratuito**, sem fins lucrativos
- **Mobile-first** mas com boa experiência desktop

### O que NÃO é

- ❌ Ferramenta de "zelador" / terapeuta
- ❌ B2B / SaaS
- ❌ Sistema de pagamento / assinatura
- ❌ Atendimento 1-para-1 privado
- ❌ Aplicativo mobile nativo (foco é web responsiva)

---

## 2. Stack definitiva

### ✅ Mantém (essencial)

| Tecnologia | Pra quê |
|---|---|
| **Next.js 16** + **React 19** + **TypeScript** | Framework |
| **Tailwind** + **SpiritualWidgetSystem** | UI |
| **Supabase** | Auth + DB (Postgres) |
| **Prisma** | ORM (com `@prisma/adapter-pg`) |
| **Zod** | Validação |
| **Zustand** | State local |
| **OpenAI** | IA (com fallback MiniMax configurável) |
| **ioredis** | Rate limit (opcional, fallback in-memory) |

### ❌ Remove (não faz sentido pra comunidade)

| Dependência | Razão |
|---|---|
| `stripe`, `@stripe/stripe-js`, `@types/stripe` | Sem monetização. Removido na refatoração. |
| `bcryptjs`, `@types/bcryptjs` | Redundante com Supabase Auth |
| `jsonwebtoken`, `@types/jsonwebtoken` | Supabase emite JWTs |
| `web-push`, `@types/web-push` | Push notifications fora do escopo |
| `qrcode`, `@types/qrcode` | Sem uso no MVP |
| `jspdf`, `@types/jspdf` | Sem export de PDF no MVP (pode voltar na Fase 3) |

### 🔍 Verificar (pode ter uso residual)

| Dependência | Quando decidir |
|---|---|
| `lucide-react@1.16.0` | Suspeito (versão estranha); auditar uso real |
| `shadcn@4.8.2` | DevDep — manter |

---

## 3. Schema Prisma — modelo final

### Remover (B2B / Zelador / Ferramentas pessoais)

```prisma
// TODOS ESTES MODELOS SAEM
model Operator          // zelador/terapeuta
model Client            // atendente (1-para-1)
model Reading           // sessão Mesa Real privada
model Report            // dossiê IA por atendimento
model Assinatura        // pagamento por assinatura
model Credito           // sistema de créditos
model TransacaoCredito  // depende de Credito
model Empresa           // "futuro B2B" nunca usado
model Reminder          // push notifications
model BirthChart        // consolida em SpiritualProfile
model SynastryResult    // feature 1-para-1
model LeituraHistorico  // consolida em Article.view
```

### Refatorar (manter mas ajustar)

```prisma
// User: vira identidade da comunidade
model User {
  id              String   @id @default(cuid())
  supabaseUserId  String?  @unique
  handle          String   @unique          // @seunome
  displayName     String
  bio             String?
  avatarUrl       String?
  email           String   @unique
  plano           Plano    @default(FREE)   // free | premium (reservado p/ futuro)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  spiritualProfile SpiritualProfile?
  posts            Post[]
  comments         Comment[]
  likes            Like[]
  follows          Follow[]  @relation("follower")
  followers        Follow[]  @relation("followed")
  groupMembers     GroupMember[]
  notifications    Notification[]
  bookmarks        Bookmark[]
  aiConversations  AiConversation[]
}

enum Plano { FREE  /* PREMIUM no futuro */ }

// MapaNatal → SpiritualProfile (compartilhável)
model SpiritualProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  birthName  String
  birthDate  DateTime
  birthTime  String?
  birthPlace String?

  // Cache do motor espiritual
  caminhoDeVida    Int?
  numeroPessoal    Int?
  oduNascimento    String?
  orixaRegente     String?
  signoSolar       String?
  ascendente       String?
  elementoDominante String?
  mapaJson         Json?

  visibility Visibility @default(COMMUNITY)
  bio        String?
  onboardedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Insight: vira Post do tipo ARTICLE ou COMMENT
// Favorito: vira Like em Post/Article
// Conversa/Mensagem: vira AiConversation/AiMessage (Fase 3)
// JournalEntry: MANTER como feature pessoal compartilhável
```

### Manter (base de conhecimento)

```prisma
// Tabelas de referência espiritual — alimentam a biblioteca e a IA
model DiaSemana { ... }   // segunda, terça,...
model Orixa     { ... }   // Oxalá, Iemanjá, Ogum,...
model Chakra    { ... }   // 7 chakras
model Sefirot   { ... }   // 10 Sefirot (Árvore da Vida)
model Odu       { ... }   // 16 Odu (Ifá)
model Erva      { ... }   // ervas sagradas
model FaseLua   { ... }   // 4 fases lunares
model Elemento  { ... }   // fogo, água, terra, ar, éter
```

### Adicionar (camada social)

Todos em `prisma/community.prisma` — já criados. Refinamentos pendentes:

- `Post` — com tipo, tradição, tópico, referências científicas
- `Comment` — threaded
- `Group` + `GroupMember` — por tradição
- `Article` — biblioteca com nível de evidência
- `Follow` + `Like` + `CommentLike` + `Bookmark` — social graph
- `Notification` — sistema de notificações
- `AiConversation` + `AiMessage` — IA curadora (Fase 3)
- `FeedItem` — timeline pré-computada
- `SpiritualProfile` — perfil espiritual compartilhável

---

## 4. Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/               # login, register, forgot-password
│   ├── (community)/          # FEED da comunidade
│   │   ├── feed/             # timeline
│   │   ├── explore/          # descoberta
│   │   ├── library/          # biblioteca de artigos
│   │   └── notifications/    # notificações
│   ├── (groups)/             # GRUPOS por tradição
│   │   └── groups/[slug]/
│   ├── (profile)/            # PERFIS
│   │   ├── u/[handle]/       # perfil público
│   │   └── settings/         # configurações pessoais
│   ├── (personal)/           # ESPAÇO PESSOAL (mantido, mas opcional)
│   │   ├── dashboard/        # hub pessoal
│   │   │   ├── mapa/         # mapa espiritual pessoal
│   │   │   ├── perfil/       # editar perfil espiritual
│   │   │   ├── oraculo/      # chat IA curador pessoal
│   │   │   └── insights/     # insights diários
│   │   └── onboarding/       # primeiro acesso (gera mapa)
│   ├── (info)/               # páginas estáticas
│   │   ├── about/
│   │   ├── manifesto/
│   │   ├── privacy/
│   │   └── terms/
│   ├── api/                  # rotas serverless
│   ├── layout.tsx
│   ├── page.tsx              # landing
│   └── globals.css
│
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── community/            # NOVO: PostCard, CommentThread, GroupCard
│   ├── personal/             # widgets pessoais (era dashboard/)
│   ├── auth/                 # LoginForm, RegisterForm
│   ├── providers/            # SupabaseProvider
│   ├── design-system/        # CosmicBackground, Typography
│   ├── shared/               # LoadingSpinner, MysticDivider
│   └── mapa/                 # visualização do mapa espiritual
│
├── lib/
│   ├── prisma.ts             # cliente Prisma
│   ├── supabase.ts           # cliente Supabase browser
│   ├── supabase-server.ts    # cliente Supabase server
│   ├── auth/                 # helpers de auth
│   ├── community/            # NOVO: queries/mutations da comunidade
│   ├── engines/              # motor espiritual (cálculos)
│   ├── ai/                   # integração com OpenAI/MiniMax
│   └── validation/           # schemas Zod
│
├── hooks/                    # custom hooks
├── stores/                   # Zustand stores
├── types/                    # tipos globais
└── styles/                   # CSS adicional
```

---

## 5. Rotas API — essenciais

### Manter

| Rota | Função |
|---|---|
| `/api/auth/login` | Login com Supabase |
| `/api/auth/register` | Signup (admin createUser) |
| `/api/auth/logout` | Logout |
| `/api/auth/me` | **NOVO** — pega usuário logado |
| `/api/onboarding` | Onboarding espiritual |
| `/api/mapa` | Cálculo do mapa pessoal |
| `/api/mapa/insights` | Insights do mapa |
| `/api/health` | Health check |

### Remover

| Rota | Razão |
|---|---|
| `/api/webhooks/stripe` | Stripe sai do projeto |
| `/api/swarm` (legado) | Refatorar como `/api/ai/curator` |
| `/api/swarm/knowledge` | Refatorar como `/api/library` |

### Criar (Fase 1)

```
POST   /api/posts                    # criar post
GET    /api/posts                    # feed (paginado)
GET    /api/posts/[id]               # post individual
DELETE /api/posts/[id]               # soft delete
POST   /api/posts/[id]/comments      # comentar
POST   /api/posts/[id]/likes         # curtir
POST   /api/posts/[id]/bookmarks     # salvar

GET    /api/users/[handle]           # perfil público
POST   /api/users/[handle]/follow    # seguir
DELETE /api/users/[handle]/follow    # parar de seguir

GET    /api/groups                   # listar grupos
GET    /api/groups/[slug]            # detalhes do grupo
POST   /api/groups/[slug]/join       # entrar
DELETE /api/groups/[slug]/join       # sair

GET    /api/articles                 # biblioteca
GET    /api/articles/[slug]          # artigo individual

GET    /api/notifications            # notificações
PATCH  /api/notifications/[id]       # marcar como lida
```

### Criar (Fase 3 — IA Curadora)

```
POST   /api/ai/curator               # chat com IA
GET    /api/ai/conversations         # histórico
POST   /api/ai/feedback              # feedback da resposta
```

---

## 6. Variáveis de ambiente

### Manter (essencial)

```bash
# --- Banco & Auth (Supabase) ---
DATABASE_URL=                       # Postgres connection string
NEXT_PUBLIC_SUPABASE_URL=           # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # public anon key
SUPABASE_SERVICE_ROLE_KEY=          # admin (server-only)

# --- IA ---
OPENAI_API_KEY=

# --- Opcionais (com defaults) ---
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# --- Rate limit (opcional) ---
REDIS_URL=
```

### Remover

```bash
# Tudo relacionado a Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Auth legado
JWT_SECRET
BCRYPT_*
```

---

## 7. Fases de refatoração

### 🚨 Fase 1 — Limpeza (esta sprint)

- [x] Auditoria completa
- [x] Documento de arquitetura (este)
- [ ] **Aplicar migration** — remover modelos B2B do Prisma
- [ ] **Remover componentes mortos** — `cockpit/`, `mesa-real/`
- [ ] **Remover deps** — `stripe`, `bcryptjs`, `jsonwebtoken`, `web-push`, `qrcode`, `jspdf`
- [ ] **Criar `.env.example`**
- [ ] **Mover token MiniMax hardcoded** pra env
- [ ] Limpar pastas vazias (`.mavis/`, `tsconfig` legacy)

### 🌱 Fase 2 — MVP Comunidade (próximas 2 sprints)

- [ ] Schema final aplicado com `community.prisma` mesclado
- [ ] API real substituindo mocks do feed
- [ ] Auth + onboarding com geração de mapa espiritual
- [ ] CRUD de posts, comentários, likes, follows
- [ ] Grupos funcionais
- [ ] Notificações básicas
- [ ] **Remover dashboard pessoal** ou tornar opcional (decidir)

### 🤖 Fase 3 — IA Curadora (3-4 sprints)

- [ ] pgvector + embeddings nos artigos
- [ ] Chat curador (RAG)
- [ ] Recomendações personalizadas
- [ ] Algoritmo de feed
- [ ] Co-evolução: feedback melhora IA

---

## 8. Decisões abertas

Perguntas pro user antes de continuar:

1. **Dashboard pessoal** — manter como espaço privado OU remover e focar 100% na comunidade?
2. **Mesa Real** — manter como jogo compartilhável na comunidade OU remover?
3. **Onboarding espiritual** — obrigatório no signup OU opcional?
4. **Anonimato** — perfil público com nome ou pseudônimo (`@handle`)?
5. **Moderação** — como evitar discurso de ódio, charlatanismo?

---

## 9. Princípios

1. **Não acumular código morto** — se não serve à comunidade, sai
2. **Aproveitar o que funciona** — motor espiritual vira base de conhecimento
3. **IA co-evolui** — quanto mais a comunidade usa, mais inteligente fica
4. **Simplicidade > features** — MVP antes de perfeição
5. **Mobile-first** — uso cotidiano é no celular
6. **PT-BR primeiro** — público fala português

---

> Última atualização: 2026-06-26 (sessão de auditoria)
> Próxima revisão: após Fase 1

## 📚 Documentos relacionados

- **[`docs/STRATEGY-chain-of-thought.md`](docs/STRATEGY-chain-of-thought.md)** — cadeia de pensamento estratégica completa (princípios filosóficos, 3 personas, taxonomia 3-camadas, moderação distribuída, IA curadora, métricas de sucesso, 10 riscos + mitigações)
- **[`VISION.md`](VISION.md)** — visão de alto nível
- **[`README.md`](README.md)** — apresentação do projeto
