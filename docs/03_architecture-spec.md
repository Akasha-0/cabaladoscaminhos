# Documento 03 — Arquitetura Técnica
## Cabala dos Caminhos

> **Versão:** 1.0 | **Padrão:** Clean Architecture + Next.js App Router

---

## 1. Visão Geral da Arquitetura

O sistema segue uma arquitetura **monolítica modular** com separação clara entre camadas de apresentação, lógica de negócio e persistência. O uso do Next.js App Router permite que componentes de servidor e de cliente coexistam no mesmo repositório, com comunicação via Server Actions e API Routes tipadas.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                         │
│  React Components (Client Components — "use client")            │
│  MesaRealGrid | ClientForm | DossierViewer | PDFExporter        │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP / Server Actions
┌────────────────────────────▼────────────────────────────────────┐
│                     NEXT.JS SERVER LAYER                        │
│  App Router Pages | Server Components | API Routes             │
│  /api/generate-dossier | /api/clients | /api/readings          │
└──────┬─────────────────────┬───────────────────────────────────┘
       │                     │
┌──────▼──────┐    ┌─────────▼──────────────────────────────────┐
│   PRISMA    │    │            SERVICE LAYER                    │
│     ORM     │    │  CalculatorService | PromptBuilderService  │
│             │    │  AstrologyService  | NumerologyService      │
└──────┬──────┘    └─────────────────────────┬───────────────────┘
       │                                     │
┌──────▼──────┐    ┌──────────────┐  ┌───────▼──────────────────┐
│ PostgreSQL  │    │  Astrology   │  │   LLM API                │
│  Database  │    │  API / Swiss │  │  OpenAI GPT-4o            │
│ (Supabase) │    │  Ephemeris   │  │  OR Anthropic Claude      │
└─────────────┘    └──────────────┘  └──────────────────────────┘
```

---

## 2. Tech Stack Definitivo

> **Atualizado para a realidade implementada (Doc 16 §6).** As versões abaixo refletem o código vigente. A v1 deste doc dizia Next 14 / React 18 / NextAuth — substituído pela stack real, mais moderna.

### Frontend
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Next.js | **16** (App Router, Turbopack) | SSR, Server Actions, roteamento moderno |
| React | **19** | Base do framework |
| TypeScript | 5+ (strict mode) | Tipagem completa evita erros em runtime |
| Tailwind CSS | **v4** (`@theme`) | Design system por tokens; paleta v2 Ramiro (Doc 13) via escopo `.ramiro` |
| Radix / shadcn | Latest | Componentes acessíveis (Popover, Select, Dialog, Toast) |
| Zustand | **5+** | Gerenciamento de estado do grid (evita prop drilling) |
| React Hook Form | 7+ | Formulários performáticos com validação |
| Zod | 3+ | Validação de schemas TypeScript-first |

### Backend / Servidor
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Next.js API Routes | — | Mesmo repositório, sem servidor separado |
| Prisma ORM | **7** | Type-safe; conexão via `prisma.config.ts` + adapter `pg` |
| PostgreSQL | 15+ | Banco relacional com suporte nativo a JSON |
| **JWT próprio** (`jsonwebtoken`) | 9+ | Autenticação de sessão do `Operator` — **substitui NextAuth** (Doc 16 AD-03) |
| bcryptjs | — | Hash de senhas |

### Integrações Externas
| Serviço | Propósito | Alternativa |
|---|---|---|
| OpenAI API (GPT-4o) | Geração do Dossiê via LLM | Anthropic Claude 3.5 Sonnet |
| Astronomia API / Astrology.com API | Cálculo do Mapa Astral | Biblioteca `swisseph` (local) |
| Google Places API | Autocomplete de cidade de nascimento | Nominatim (OpenStreetMap, gratuito) |
| Vercel | Hosting e deploy automático | Railway, Render |
| Supabase | PostgreSQL gerenciado | Neon, PlanetScale |
| Vercel Blob / AWS S3 | Armazenamento dos PDFs gerados | Cloudflare R2 |

### Geração de PDF
| Tecnologia | Uso |
|---|---|
| `@react-pdf/renderer` | Geração de PDF no servidor com layout customizado |
| OU `puppeteer` (headless Chrome) | Renderizar HTML/CSS como PDF (mais fiel ao design) |

---

## 3. Estrutura de Diretórios do Repositório

```
cabala-dos-caminhos/
├── prisma/
│   ├── schema.prisma              # Modelo de dados
│   └── seed.ts                    # Seed inicial (criar usuário admin)
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Layout com sidebar fixa
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard com métricas
│   │   │   ├── nova-consulta/
│   │   │   │   └── page.tsx       # O Cockpit principal
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx       # Listagem de consulentes
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx   # Formulário de cadastro
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Perfil do consulente
│   │   │   └── leituras/
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Dossiê salvo
│   │   └── api/
│   │       ├── auth/              # NextAuth routes
│   │       ├── clients/
│   │       │   ├── route.ts       # GET (listagem) / POST (criar)
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET / PUT / DELETE
│   │       ├── readings/
│   │       │   └── route.ts       # POST (criar leitura)
│   │       └── generate-dossier/
│   │           └── route.ts       # POST (dispara a IA)
│   │
│   ├── components/
│   │   ├── ui/                    # Componentes Shadcn (auto-gerados)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── clients/
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   └── ClientMapsPanel.tsx  # Exibe os badges dos mapas
│   │   └── mesa-real/
│   │       ├── MesaRealGrid.tsx     # Componente principal do grid 9x4
│   │       ├── CasaSlot.tsx         # Cada casa individual
│   │       ├── CasaPopover.tsx      # Popover de input (Carta + Odu)
│   │       ├── CartaSelect.tsx      # ComboBox das 36 cartas
│   │       ├── OduSelect.tsx        # ComboBox dos 16 odus
│   │       └── DossierViewer.tsx    # Renderizador do Markdown final
│   │
│   ├── lib/
│   │   ├── calculators/
│   │   │   ├── numerology-kabalah.ts   # Funções de Numerologia Cabalística
│   │   │   ├── numerology-tantric.ts   # Funções de Numerologia Tântrica
│   │   │   └── odu-birth.ts            # Cálculo do Odu de Nascimento
│   │   ├── astrology/
│   │   │   ├── ephemeris.ts            # Integração com API de efemérides
│   │   │   └── houses.ts               # Cálculo das 12 casas astrológicas
│   │   ├── ai/
│   │   │   ├── prompt-builder.ts       # O motor de cruzamento de dados
│   │   │   ├── llm-client.ts           # Wrapper para OpenAI/Anthropic
│   │   │   └── correlation-map.ts      # Dicionário de correlação das 36 casas
│   │   ├── constants/
│   │   │   ├── lenormand-cards.ts      # Dados das 36 cartas ciganas
│   │   │   └── odus.ts                 # Dados dos 16 odus
│   │   ├── pdf/
│   │   │   └── dossier-template.tsx    # Template do PDF com react-pdf
│   │   └── prisma.ts                   # Singleton do Prisma Client
│   │
│   ├── store/
│   │   └── mesa-real-store.ts          # Zustand store para o estado do grid
│   │
│   ├── types/
│   │   ├── index.ts                    # Types globais
│   │   ├── astrology.ts
│   │   └── numerology.ts
│   │
│   └── middleware.ts                   # Proteção de rotas autenticadas
│
├── public/
│   ├── logo.svg
│   └── fonts/                          # Fontes locais (Cinzel, etc.)
│
├── .env.local                          # Variáveis de ambiente (nunca commitado)
├── .env.example                        # Template das variáveis
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Fluxo de Dados Completo (End-to-End)

### Fluxo A — Cadastro de Consulente

```
[Operador preenche formulário]
        │
        ▼
[React Hook Form valida com Zod]
        │
        ▼
[POST /api/clients]
        │
        ▼
[Server: recebe dados brutos]
        │
        ├──► [NumerologyService.calculateKabalah(name, date)]
        │         └── Retorna: { lifePath, mission, expression, motivation, gifts }
        │
        ├──► [NumerologyService.calculateTantric(date)]
        │         └── Retorna: { soul, karma, divineGift, destiny, path }
        │
        ├──► [AstrologyService.calculateChart(date, time, lat, lng)]
        │         └── Retorna: { sun, moon, ascendant, planets, houses, nodes }
        │
        └──► [OduService.calculateBirthOdu(date)]   // algoritmo/tabela no Doc 11 §4 (default provisório até D3)
                  └── Retorna: { odu_number, odu_name, regency }
        │
        ▼
[Prisma: CREATE Client com todos os mapas em JSON]
        │
        ▼
[Response: { success: true, clientId }]
        │
        ▼
[Frontend redireciona para perfil do cliente]
```

### Fluxo B — Geração do Dossiê

```
[Operador preenche a Mesa Real e clica "Gerar Dossiê"]
        │
        ▼
[Zustand Store: { matrixData: { "1": {carta, odu}, "4": {...}, ... } }]
        │
        ▼
[POST /api/generate-dossier { clientId, matrixData }]
        │
        ▼
[Server: busca Client no banco (mapas já calculados)]
        │
        ▼
[PromptBuilder.build(client, matrixData)]
        │   Para cada casa em matrixData:
        │   1. Busca CorrelationMap[casa] → { astroAspect, kabalaAspect, tantricAspect }
        │   2. Extrai os valores correspondentes do client.astrologyMap / kabalisticMap / tantricMap
        │   3. Monta o bloco de contexto daquela casa
        │
        ▼
[Payload final formatado → API do LLM (OpenAI / Anthropic)]
        │
        ▼
[LLM retorna Dossiê em Markdown]
        │
        ▼
[Prisma: CREATE Reading + CREATE Report (com o Markdown)]
        │
        ▼
[Response: stream do Markdown para o frontend]
        │
        ▼
[DossierViewer renderiza o Markdown em tempo real (streaming)]
        │
        ▼
[Botão "Exportar PDF" disponível → /api/generate-pdf]
```

---

## 5. Variáveis de Ambiente (`.env.example`)

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/cabala_dos_caminhos"

# Autenticação (JWT próprio do Operator — Doc 16 AD-03; substitui NextAuth)
JWT_SECRET="seu-secret-aqui"

# APIs de Inteligência Artificial (escolher uma)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
# Nomes de modelo configuráveis (resolve I6 do Doc 10; defaults no llm-client.ts)
OPENAI_MODEL="gpt-4o"
ANTHROPIC_MODEL="claude-sonnet-4-6"

# API de Astrologia (escolher uma)
ASTROLOGY_API_KEY="..."
ASTROLOGY_API_URL="https://api.astrology-provider.com/v1"

# Google Places (autocomplete de cidades)
NEXT_PUBLIC_GOOGLE_PLACES_KEY="..."

# Storage para PDFs (Vercel Blob ou S3)
BLOB_READ_WRITE_TOKEN="..."
# OU
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="cabala-dossiers"

# Ambiente
NODE_ENV="development"

# Quarentena do B2C legado (Doc 16 AD-01).
# Ausente/qualquer valor = B2C fora do roteamento (só o Cockpit B2B responde).
# "on" restaura o B2C legado (reversível por flag).
LEGACY_B2C="off"
```

---

## 6. Decisões de Arquitetura e Justificativas

### Por que Next.js e não separar frontend/backend?
Para o MVP de um sistema usado por 1-2 pessoas, um monólito Next.js reduz drasticamente a complexidade de deploy, manutenção e custo. A separação frontend/backend só vale a pena quando há necessidade de escalar os serviços independentemente.

### Por que Zustand para o grid?
O estado do grid (36 casas com carta e Odu em cada) é complexo o suficiente para justificar um store global, mas simples o suficiente para não precisar de Redux. Zustand é leve, sem boilerplate e funciona perfeitamente com React 18.

### Por que salvar os mapas como JSON e não em tabelas relacionais?
Os mapas astrológicos e numerológicos têm estrutura semi-variável (alguns aspectos podem ou não estar presentes) e nunca precisam ser filtrados individualmente via SQL. Armazená-los como JSON no PostgreSQL (suportado natively pelo Prisma) é mais performático e flexível.

### Por que não usar `localStorage` no frontend?
O estado da mesa real é processual (uma sessão de atendimento) e não precisa persistir entre navegações. O Zustand mantém o estado na memória durante a sessão. Para persistência real, o backend com Prisma é a fonte da verdade.

### LLM: OpenAI vs Anthropic?
Ambos são suportados. Para o MVP, recomenda-se OpenAI GPT-4o por sua velocidade de resposta e custo. O código deve ser construído com um wrapper abstrato (`llm-client.ts`) que permita trocar o provider sem refatorar o `PromptBuilder`.
