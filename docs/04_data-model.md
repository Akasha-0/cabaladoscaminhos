# Documento 04 — Modelo de Dados
## Sistema Akasha

> **Versão:** 2.0 | **ORM:** Prisma 7 | **Banco:** PostgreSQL + **pgvector**
> **Norte:** Doc 25 · **Arquitetura:** Doc 03. As estruturas dos 4 mapas (§3) são **agnósticas e preservadas**; o modelo canônico é o B2C Akasha descrito em §1–2.

---

## 1. Prisma Schema — Núcleo B2C (Akasha)

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
// datasource fica em prisma.config.ts (Prisma 7) + adapter pg

// ─────────────────────────────────────────────
// USUÁRIO — o cliente final (self-service B2C)
// ─────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  passwordHash  String?               // null se OAuth-only
  name          String                // nome usado na Numerologia Cabalística
  locale        String    @default("pt-BR")
  role          UserRole  @default(MEMBER)

  // Dados natais (base dos 4 mapas)
  birthDate     DateTime?
  birthTime     String?               // "HH:MM" — necessário para Ascendente
  birthCity     String?
  birthLatitude  Float?
  birthLongitude Float?
  birthTimezone  String?              // ex: "America/Sao_Paulo"

  // Perfil de intenção (quiz de ancoragem do onboarding) — alimenta o Agente IA
  intentionProfile Json?

  // Os 4 mapas calculados e cacheados (uma vez; nunca recalculados)
  birthChart    BirthChart?

  // Monetização e oráculo
  subscription  Subscription?
  creditLedger  CreditEntry[]
  manifesto     Manifesto?
  dailyReadings DailyReading[]
  consultations Consultation[]
  ritualLog     RitualCompletion[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@map("users")
}

enum UserRole { MEMBER  ADMIN }

// ─────────────────────────────────────────────
// MAPA NATAL — os 4 pilares cacheados (1:1 com User)
// ─────────────────────────────────────────────
model BirthChart {
  id             String  @id @default(cuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  astrologyMap   Json    // AstrologyMap  (§3.1)
  kabalisticMap  Json    // KabalisticMap (§3.2)
  tantricMap     Json    // TantricMap    (§3.3) — 11 Corpos
  oduBirth       Json    // OduBirth      (§3.4) — Ori/Odus

  incomplete     Boolean @default(false)  // true se falta hora/local (astrologia, Doc 23)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@map("birth_charts")
}

// ─────────────────────────────────────────────
// ASSINATURA & CRÉDITOS (Stripe)
// ─────────────────────────────────────────────
model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan               Plan     @default(FREEMIUM)
  status             SubStatus @default(ACTIVE)
  stripeCustomerId   String?
  stripeSubscriptionId String?
  monthlyCreditQuota Int      @default(0)   // franquia mensal de créditos do plano
  dashboardUntil     DateTime?              // janela de Dashboard liberada (ex.: 30 dias do Manifesto)
  currentPeriodEnd   DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  @@map("subscriptions")
}

enum Plan      { FREEMIUM  AKASHA_PRO }
enum SubStatus { ACTIVE  PAST_DUE  CANCELED }

// Razão (ledger) de créditos: franquia, compra avulsa, consumo
model CreditEntry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  delta     Int      // +franquia/+compra / −consumo (ritual=−1, pergunta=−3)
  reason    String   // "monthly_quota" | "purchase" | "consult_simple" | "consult_complex"
  balance   Int      // saldo resultante (snapshot)
  createdAt DateTime @default(now())
  @@index([userId])
  @@map("credit_entries")
}

// ─────────────────────────────────────────────
// MANIFESTO AKÁSHICO — relatório base (gerado uma vez)
// ─────────────────────────────────────────────
model Manifesto {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   Json     // ManifestoContent (§4) — as 4 camadas + síntese
  pdfUrl    String?  // PDF via @react-pdf/renderer
  llmModel  String?
  tokensUsed Int?
  createdAt DateTime @default(now())
  @@map("manifestos")
}

// ─────────────────────────────────────────────
// DASHBOARD DIÁRIO — o Oráculo de Bolso (1 por usuário/dia)
// ─────────────────────────────────────────────
model DailyReading {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date          DateTime @db.Date
  climate       String   // Clima Energético (Markdown)
  ritual        Json     // { grimoireId, titulo, instrucao } — prescrição do dia
  alert         String   // Alerta das próximas 24h
  tensionPoint  Json     // diagnóstico do Grafo (Camada 2) — rastreabilidade
  llmModel      String?
  createdAt     DateTime @default(now())
  @@unique([userId, date])
  @@map("daily_readings")
}

model RitualCompletion {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  grimoireId String  // referência ao GrimoireEntry
  date      DateTime @default(now())
  @@index([userId])
  @@map("ritual_completions")
}

// ─────────────────────────────────────────────
// AGENTE ORACULAR — consultas conversacionais (Doc 12), debita créditos
// ─────────────────────────────────────────────
model Consultation {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  messages  ChatMessage[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  @@index([userId])
  @@map("consultations")
}

model ChatMessage {
  id             String       @id @default(cuid())
  role           ChatRole     // USER | ORACLE
  content        String
  routedPillars  String[]     // ["astrologia","tantra","odus"] — vertentes consultadas
  grimoireRefs   String[]     // ids dos fragmentos do Grimório injetados (transparência)
  creditCost     Int          @default(0)  // 1 (simples) ou 3 (complexa)
  consultationId String
  consultation   Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
  @@index([consultationId])
  @@map("chat_messages")
}

enum ChatRole { USER  ORACLE }

// ─────────────────────────────────────────────
// GRIMÓRIO DIGITAL — RAG (Markdown → pgvector)  (Doc 25 §5)
// ─────────────────────────────────────────────
model GrimoireEntry {
  id         String  @id @default(cuid())
  slug       String  @unique               // ex.: "ritual_045_manjericao"
  categoria  String                         // Ervas | Cristais | Mantra | Itan | Transito ...
  biblioteca String                         // botanica | vibracional | ancestral | diagnostico
  metadata   Json                           // tags YAML (elementos, signos, odus, corpos…)
  conteudo   String                         // Markdown puro
  // embedding  Unsupported("vector(768)")   // pgvector — nomic-embed-text (via SQL/migration)
  sourcePath String                         // caminho do .md no repositório
  updatedAt  DateTime @updatedAt
  @@index([categoria])
  @@index([biblioteca])
  @@map("grimoire")
}
```

> **Volatilidade:** `personalCycles` (KabalisticMap §3.2) e os **trânsitos diários** são derivados sob demanda (data atual / Redis), **não** persistidos no mapa imutável — preservando "mapas natais nunca são recalculados".

> **pgvector:** a coluna `embedding vector(768)` e o índice `ivfflat`/`hnsw` são criados via migration SQL manual (Prisma não tipa `vector` nativamente). Ver Doc MIGRATIONS.

---

## 2. Auth & Conta (B2C)
- `User` é a única identidade canônica: auto-cadastro, e-mail+senha e/ou OAuth (Google/Apple), verificação de e-mail, recuperação de senha, MFA opcional.
- Sessão via JWT/cookie httpOnly. `role = ADMIN` habilita o painel do Grimório (sync manual).
- Detalhes do modelo de auth canônico no AUTH-AUDIT.

---

## 3. Estruturas JSON dos 4 Mapas (agnósticas — preservadas)

> Estado de completude: **Doc 23**. Numerologias 100%; Odu natal ⚠️ `provisional` (D3); Astrologia com Quíron/Lilith, elementos/modalidades, `nature` de aspectos. Fórmulas: **Doc 11**.

### 3.1 AstrologyMap

```typescript
interface AstrologyMap {
  sun:       { sign: string; degree: number; house: number };
  moon:      { sign: string; degree: number; house: number };
  ascendant: { sign: string; degree: number };
  planets: {
    mercury: PlanetPosition; venus: PlanetPosition; mars: PlanetPosition;
    jupiter: PlanetPosition; saturn: PlanetPosition; uranus: PlanetPosition;
    neptune: PlanetPosition; pluto: PlanetPosition;
    chiron: PlanetPosition;  // ferida e cura
    lilith: PlanetPosition;  // Lua Negra — sombra e poder oculto
  };
  northNode: { sign: string; house: number };
  southNode: { sign: string; house: number };
  houses: { [n: string]: string };              // signo regente de cada casa 1..12
  planetsInHouses: { [houseNumber: string]: string[] };
  aspects: Array<{
    planet1: string; planet2: string;
    type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
    orb: number;
    nature: "harmony" | "tension";              // trígono/sextil=harmony; oposição/quadratura=tension
  }>;
  elements:   { fire: number; earth: number; air: number; water: number };
  modalities: { cardinal: number; fixed: number; mutable: number };
}

interface PlanetPosition { sign: string; degree: number; house: number; retrograde: boolean }
```

### 3.2 KabalisticMap

```typescript
interface KabalisticMap {
  lifePath: number; lifePathMaster: boolean;     // 11/22/33
  mission: number;
  expression: number; expressionMaster: boolean;
  motivation: number;                            // vogais do nome
  impression: number;                            // consoantes do nome
  nativeDayNumber: number;                       // dia de nascimento
  challenges: { first: number; second: number; main: number; last: number };
  pinnacles: {
    first:  { number: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third:  { number: number; ageStart: number; ageEnd: number };
    fourth: { number: number; ageStart: number };
  };
  karmicLessons: number[];                        // números ausentes no nome
  karmaicDebts:  number[];                        // 13/14/16/19 nos totais
  lifeCycles: {
    first:  { number: number; ageStart: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third:  { number: number; ageStart: number };
  };
  personalCycles: {                               // VOLÁTIL — derivado da data atual
    personalYear: number; personalMonth: number; personalDay: number; referenceDate: string;
  };
}
```

### 3.3 TantricMap — os 11 Corpos (Pilar "A Anatomia")

> `divineGift` = dois últimos dígitos do ano; `destiny` = soma dos 4 dígitos do ano; `tantricPath` = data completa (Doc 11 §3.1).

```typescript
interface TantricMap {
  soul: number;       soulBody: number;       soulDescription: string;
  karma: number;      karmaBody: number;      karmaDescription: string;
  divineGift: number; divineGiftBody: number; divineGiftDescription: string;
  destiny: number;
  tantricPath: number;
  bodies: Array<{ id: number; name: string; essence: string; balanced: boolean }>;  // 1..11
}

export const TANTRIC_BODIES = [
  { id: 1,  name: "Corpo da Alma",                    essence: "Núcleo, pureza, origem" },
  { id: 2,  name: "Corpo Negativo / Mente Protetora", essence: "Cautela, discernimento, proteção" },
  { id: 3,  name: "Corpo Positivo / Mente Projetiva", essence: "Expansão, otimismo, ação" },
  { id: 4,  name: "Corpo Neutro / Mente Meditativa",  essence: "Equilíbrio, julgamento sereno" },
  { id: 5,  name: "Corpo Físico",                     essence: "Manifestação, a palavra, o dom" },
  { id: 6,  name: "Arco da Linha",                    essence: "Integridade, projeção, intuição" },
  { id: 7,  name: "Aura",                             essence: "Campo de proteção, presença" },
  { id: 8,  name: "Corpo Prânico",                    essence: "Energia vital, respiração, força" },
  { id: 9,  name: "Corpo Sutil",                      essence: "Maestria, sabedoria refinada" },
  { id: 10, name: "Corpo Radiante",                   essence: "Realeza, coragem, brilho" },
  { id: 11, name: "Corpo do Infinito",                essence: "Transcendência, totalidade" },
] as const;
```

### 3.4 OduBirth — o Ori (Pilar "A Terra")

```typescript
interface OduBirth {
  oduNumber: number;        // 1..16
  oduName: string;          // ex: "Ejionile"
  orixaRegency: string[];   // ex: ["Xangô","Oxalá"]
  elementalForce: string;   // ex: "Justiça, Força, Liderança"
  oriAlignment: string;     // estado/conselho do Ori
  openPaths: string[];      // caminhos abertos
  shadows: string[];        // sombras (cuidado, não sentença)
}
```

### 3.5 Os 16 Odus com Regências (constante — Pilar Odus)

> A grafia/regência dos 16 Odus está sujeita à validação de linhagem **D4** (Doc 11 §5 / Doc 15).

```typescript
export const ODUS = [
  { id: 1,  name: "Ogbe",      orixas: ["Oxalá"],                    essence: "Luz, origem, criação, renovação" },
  { id: 2,  name: "Ejiokô",    orixas: ["Ibeji","Ogum"],            essence: "Dualidade, movimento, parcerias" },
  { id: 3,  name: "Etogundá",  orixas: ["Ogum"],                    essence: "Batalha, conquista, abertura de caminhos" },
  { id: 4,  name: "Irosun",    orixas: ["Oxum","Iemanjá"],          essence: "Atenção, sangue, cuidado com traições" },
  { id: 5,  name: "Oxê",       orixas: ["Oxum","Iemanjá"],          essence: "Beleza, amor, fertilidade, magnetismo" },
  { id: 6,  name: "Obará",     orixas: ["Xangô","Oxóssi"],          essence: "Riqueza, glória, abundância, fartura" },
  { id: 7,  name: "Odi",       orixas: ["Exu","Omolu"],             essence: "Segredos, transformação, cautela, limpeza" },
  { id: 8,  name: "Ejionile",  orixas: ["Xangô","Oxalá"],           essence: "Justiça, liderança, força, vitória" },
  { id: 9,  name: "Ossá",      orixas: ["Iemanjá","Oyá"],           essence: "Proteção feminina, sabedoria, turbulência" },
  { id: 10, name: "Ofun",      orixas: ["Oxalufan","Oxalá"],        essence: "Espiritualidade profunda, equilíbrio mental" },
  { id: 11, name: "Owarin",    orixas: ["Exu","Oyá"],               essence: "Dinâmica, perigo, astúcia, movimento rápido" },
  { id: 12, name: "Ejilaxebô", orixas: ["Ogum","Oxum"],             essence: "Honra, proteção, caminho aberto" },
  { id: 13, name: "Oturupon",  orixas: ["Omolu","Nanã"],            essence: "Cura, purificação, ancestralidade" },
  { id: 14, name: "Oturá",     orixas: ["Oxalá","Iemanjá"],         essence: "Paz, benevolência, proteção divina" },
  { id: 15, name: "Iká",       orixas: ["Xangô","Oxum"],            essence: "Poder, estratégia, responsabilidade" },
  { id: 16, name: "Ofurufu",   orixas: ["Oxalá","Todos os Orixás"], essence: "Completude, totalidade, bênção universal" },
] as const;
```

---

## 4. ManifestoContent (campo `content` no Manifesto)

```typescript
interface ManifestoContent {
  // As 4 camadas da Mandala (Doc 25 §2)
  nucleo:   string;  // Ori + Odus (Markdown)
  geometria: string; // Numerologia Cabalística
  teia:     string;  // 11 Corpos Tântricos
  anel:     string;  // Astrologia
  synthesis: string; // Diagnóstico unificado integrador
  generatedAt: string; llmModel: string;
}
```

---

## 5. DailyReading — payload do Dashboard

```typescript
interface RitualPrescription {
  grimoireId: string;   // GrimoireEntry usado (rastreabilidade anti-alucinação)
  titulo: string;       // ex: "Banho de manjericão"
  instrucao: string;    // modo de preparo (texto do Grimório)
  cor?: string; mantra?: string;
}
```

---

## 6. Script de Seed (Admin)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'gabriel@cabaladoscaminhos.com' },
    update: {},
    create: {
      email: 'gabriel@cabaladoscaminhos.com',
      name: 'Gabriel',
      emailVerified: true,
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 12),
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuário admin criado.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
```
