# Documento 04 — Modelo de Dados
## Cabala dos Caminhos

> **Versão:** 1.0 | **ORM:** Prisma | **Banco:** PostgreSQL

---

## 1. Prisma Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// USUÁRIO — O Operador/Terapeuta do sistema
// ─────────────────────────────────────────────
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         UserRole  @default(OPERATOR)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  readings     Reading[]

  @@map("users")
}

enum UserRole {
  OPERATOR
  ADMIN
}

// ─────────────────────────────────────────────
// CONSULENTE — Dados fixos do cliente
// ─────────────────────────────────────────────
model Client {
  id           String   @id @default(cuid())

  // Dados de identificação
  fullName     String   // Nome conforme certidão (usado na Numerologia Cabalística)
  birthDate    DateTime // Data de nascimento
  birthTime    String   // Hora exata "HH:MM" (ex: "14:35") — necessária para Ascendente
  birthCity    String
  birthState   String
  birthCountry String

  // Coordenadas geográficas (salvas junto com a cidade para cálculo astral)
  birthLatitude  Float?
  birthLongitude Float?
  birthTimezone  String?  // Ex: "America/Sao_Paulo"

  // Mapas calculados e cacheados (calculados no cadastro, nunca recalculados)
  astrologyMap   Json?   // Ver estrutura AstrologyMap abaixo
  kabalisticMap  Json?   // Ver estrutura KabalisticMap abaixo
  tantricMap     Json?   // Ver estrutura TantricMap abaixo
  oduBirth       Json?   // Ver estrutura OduBirth abaixo

  notes        String?  // Campo livre para o terapeuta anotar observações

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  readings     Reading[]

  @@map("clients")
}

// ─────────────────────────────────────────────
// LEITURA — Uma sessão de Mesa Real
// ─────────────────────────────────────────────
model Reading {
  id          String        @id @default(cuid())
  date        DateTime      @default(now())
  status      ReadingStatus @default(PENDING)
  notes       String?       // Observações do terapeuta sobre a sessão

  // A Matriz Mesa Real 9x4 salva como JSON
  // Estrutura: { "1": { "carta": 19, "cartaName": "A Torre", "odu": 10, "oduName": "Osá" }, ... }
  matrixData  Json

  // Relacionamentos
  clientId    String
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)

  userId      String
  user        User          @relation(fields: [userId], references: [id])

  report      Report?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("readings")
}

enum ReadingStatus {
  PENDING     // Mesa preenchida, dossiê ainda não gerado
  GENERATING  // IA processando
  COMPLETED   // Dossiê gerado com sucesso
  ERROR       // Falha na geração
}

// ─────────────────────────────────────────────
// DOSSIÊ — O relatório gerado pela IA
// ─────────────────────────────────────────────
model Report {
  id        String   @id @default(cuid())

  // Conteúdo gerado pelo LLM
  // Estrutura: { "houses": { "1": "Markdown...", "4": "Markdown..." }, "synthesis": "Markdown..." }
  content   Json

  // Metadata
  llmModel  String?  // Ex: "gpt-4o" ou "claude-3-5-sonnet"
  tokensUsed Int?
  pdfUrl    String?  // URL do PDF armazenado no storage

  readingId String   @unique
  reading   Reading  @relation(fields: [readingId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("reports")
}
```

---

## 2. Estruturas JSON dos Mapas Calculados

### 2.1 AstrologyMap (campo `astrologyMap` no Client)

```typescript
interface AstrologyMap {
  // Luminares e Ascendente
  sun: {
    sign: string;        // Ex: "Leo"
    degree: number;      // Ex: 27.5
    house: number;       // Ex: 10
  };
  moon: {
    sign: string;
    degree: number;
    house: number;
  };
  ascendant: {
    sign: string;
    degree: number;
  };

  // 10 Planetas Clássicos
  planets: {
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    uranus: PlanetPosition;
    neptune: PlanetPosition;
    pluto: PlanetPosition;
    chiron: PlanetPosition;  // Asteroide — ferida e cura
    lilith: PlanetPosition;  // Lua Negra — sombra e poder oculto
  };

  // Nodos Lunares (karma e destino)
  northNode: { sign: string; house: number };
  southNode: { sign: string; house: number };

  // As 12 Casas Astrológicas (signo regente de cada casa)
  houses: {
    1: string;   // Ascendente / Self
    2: string;   // Finanças pessoais / Valores
    3: string;   // Comunicação / Irmãos / Vizinhança
    4: string;   // Lar / Família / Fundo do Céu
    5: string;   // Criatividade / Romance / Filhos
    6: string;   // Trabalho diário / Saúde / Rotina
    7: string;   // Parcerias / Casamento / Contratos
    8: string;   // Transformação / Morte / Recursos Partilhados
    9: string;   // Filosofia / Viagens / Espiritualidade
    10: string;  // Carreira / Meio do Céu / Status
    11: string;  // Amigos / Grupos / Esperanças
    12: string;  // Inconsciente / Isolamento / Karma oculto
  };

  // Planetas em casas específicas (para lookup rápido pelo PromptBuilder)
  planetsInHouses: {
    [houseNumber: string]: string[];  // Ex: { "10": ["Sun", "Mercury"] }
  };

  // Aspectos principais
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
    orb: number;
  }>;
}

interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}
```

### 2.2 KabalisticMap (campo `kabalisticMap` no Client)

```typescript
interface KabalisticMap {
  // Número de Caminho de Vida (soma de todos os dígitos da data, reduzida)
  lifePath: number;            // Ex: 7
  lifePathMaster: boolean;     // true se for 11, 22 ou 33

  // Número de Missão (variante da data, pode coincidir com lifePath)
  mission: number;

  // Número de Expressão (conversão alfanumérica do nome completo, reduzida)
  expression: number;
  expressionMaster: boolean;

  // Número de Motivação / Impulso da Alma (apenas vogais do nome, reduzidas)
  motivation: number;

  // Dons Nativos (dia de nascimento não reduzido se for 10-31)
  nativeDayNumber: number;     // Ex: 20

  // Números de Desafio (gerados pela data, representam os obstáculos de vida)
  challenges: {
    first: number;
    second: number;
    main: number;
    last: number;
  };

  // Karmas da Vida (números ausentes entre 1-9 no nome completo)
  karmaicDebts: number[];      // Ex: [4, 8] = ausência dos números 4 e 8 no nome

  // Ciclos de Vida (3 grandes períodos)
  lifeCycles: {
    first: { number: number; ageStart: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third: { number: number; ageStart: number };
  };
}
```

### 2.3 TantricMap (campo `tantricMap` no Client)

```typescript
interface TantricMap {
  // Corpo Negativo / Número de Alma (dia de nascimento, reduzido)
  soul: number;                // Ex: 20 → 2+0 = 2
  soulDescription: string;     // Ex: "Corpo Negativo — Mente Protetora"

  // Corpo Prânico / Número de Karma (mês de nascimento)
  karma: number;               // Ex: 8
  karmaDescription: string;    // Ex: "Corpo Prânico — Energia Vital"

  // Número de Dom Divino (ano de nascimento reduzido em dois passos)
  divineGift: number;          // Ex: 1986 → 8+6=14 → 1+4=5
  divineGiftDescription: string; // Ex: "Corpo Físico — A Palavra e o Dom"

  // Número de Destino (ano completo de 4 dígitos, reduzido)
  destiny: number;             // Ex: 1+9+8+6=24 → 2+4=6

  // Número de Caminho Tântrico (soma total de dia+mês+ano, reduzida)
  tantricPath: number;

  // Atributo de cada número tântrico (1 a 11)
  tantricBodies: {
    [key: number]: string;     // Ex: { 1: "Corpo Sutil", 2: "Corpo Negativo", ... }
  };
}
```

### 2.4 OduBirth (campo `oduBirth` no Client)

```typescript
interface OduBirth {
  oduNumber: number;           // 1 a 16
  oduName: string;             // Ex: "Ejionile"
  orixaRegency: string[];      // Ex: ["Xangô", "Oxalá"]
  elementalForce: string;      // Ex: "Justiça, Força, Liderança"
  lifeLesson: string;          // Síntese do ensinamento central do Odu
}
```

---

## 3. Estrutura JSON da Matriz da Mesa Real (matrixData)

Este é o objeto salvo no campo `matrixData` do modelo `Reading`. É gerado pelo Zustand store no frontend e enviado para a API.

```typescript
interface MatrixData {
  [houseNumber: string]: {
    carta: number;       // Número da carta (1-36)
    cartaName: string;   // Ex: "A Torre"
    odu: number;         // Número do Odu (1-16)
    oduName: string;     // Ex: "Ejionile"
  };
}

// Exemplo real de um matrixData parcialmente preenchido:
const matrixDataExample: MatrixData = {
  "1":  { carta: 19, cartaName: "A Torre",    odu: 10, oduName: "Osá" },
  "4":  { carta: 4,  cartaName: "A Casa",     odu: 8,  oduName: "Ejionile" },
  "12": { carta: 12, cartaName: "Os Pássaros",odu: 6,  oduName: "Obará" },
  "31": { carta: 31, cartaName: "O Sol",      odu: 6,  oduName: "Obará" },
  "34": { carta: 34, cartaName: "Os Peixes",  odu: 4,  oduName: "Irosun" },
  // ... demais casas preenchidas
};
```

---

## 4. Estrutura JSON do Relatório Gerado (content no Report)

```typescript
interface ReportContent {
  // Análise de cada casa preenchida (chave = número da casa como string)
  houses: {
    [houseNumber: string]: {
      houseNumber: number;
      houseName: string;
      carta: string;
      odu: string;
      interpretation: string;  // Markdown gerado pelo LLM para esta casa
    };
  };

  // Síntese final integrando todas as casas
  synthesis: {
    workAndMoney: string;      // Caminho do Trabalho e Dinheiro — Markdown
    homeAndFamily: string;     // Caminho do Lar e Família — Markdown
    loveAndRelationships: string; // Caminho do Amor e Relacionamentos — Markdown
    spiritualPath: string;     // O Grande Conselho Espiritual — Markdown
    finalVerdict: string;      // Veredito Final e Direcionamento — Markdown
  };

  // Metadata da geração
  generatedAt: string;         // ISO timestamp
  llmModel: string;
  totalHousesAnalyzed: number;
}
```

---

## 5. Constantes Imutáveis do Sistema

### 5.1 As 36 Cartas Ciganas (Lenormand)

```typescript
// src/lib/constants/lenormand-cards.ts
export const LENORMAND_CARDS = [
  { id: 1,  name: "O Cavaleiro",   keywords: "Notícias, movimento, mensagens, velocidade" },
  { id: 2,  name: "O Trevo",       keywords: "Sorte, pequenas oportunidades, esperança" },
  { id: 3,  name: "O Navio",       keywords: "Viagem, negócios, distância, importação/exportação" },
  { id: 4,  name: "A Casa",        keywords: "Lar, família, estabilidade, propriedade" },
  { id: 5,  name: "A Árvore",      keywords: "Saúde, raízes, crescimento, ancestralidade" },
  { id: 6,  name: "As Nuvens",     keywords: "Confusão, dúvidas, instabilidade mental, nebulosidade" },
  { id: 7,  name: "A Serpente",    keywords: "Perigo, traição, sexualidade, sabedoria oculta" },
  { id: 8,  name: "O Caixão",      keywords: "Fim, transformação, encerramento de ciclos, crise" },
  { id: 9,  name: "Os Buquês",     keywords: "Presentes, surpresas felizes, beleza, reconhecimento" },
  { id: 10, name: "A Foice",       keywords: "Corte, decisão, colheita, separação" },
  { id: 11, name: "O Chicote",     keywords: "Conflito, repetição, estresse, padrões destrutivos" },
  { id: 12, name: "Os Pássaros",   keywords: "Comunicação, parceria, nervosismo, conversas" },
  { id: 13, name: "A Criança",     keywords: "Novo começo, inocência, projeto inicial, juventude" },
  { id: 14, name: "A Raposa",      keywords: "Astúcia, estratégia, autossuficiência, cautela" },
  { id: 15, name: "O Urso",        keywords: "Poder, autoridade, finanças, força, chefe" },
  { id: 16, name: "A Estrela",     keywords: "Esperança, espiritualidade, guia, brilho, sonhos" },
  { id: 17, name: "A Cegonha",     keywords: "Mudança, renovação, melhoria, gestação" },
  { id: 18, name: "O Cachorro",    keywords: "Lealdade, amizade, confiança, proteção" },
  { id: 19, name: "A Torre",       keywords: "Isolamento, autoridade, ego, solidão consciente" },
  { id: 20, name: "O Jardim",      keywords: "Vida social, público, eventos, natureza" },
  { id: 21, name: "A Montanha",    keywords: "Obstáculo, bloqueio, desafio, inimigo oculto" },
  { id: 22, name: "Os Caminhos",   keywords: "Escolha, bifurcação, decisão, múltiplas direções" },
  { id: 23, name: "O Rato",        keywords: "Perda, desgaste, ansiedade, roubo de energia" },
  { id: 24, name: "O Coração",     keywords: "Amor, sentimentos, emoções, desejo" },
  { id: 25, name: "O Anel",        keywords: "Comprometimento, contrato, ciclo, aliança" },
  { id: 26, name: "O Livro",       keywords: "Segredo, conhecimento, educação, mistério" },
  { id: 27, name: "A Carta",       keywords: "Documento, notícia escrita, comunicação formal" },
  { id: 28, name: "O Cigano",      keywords: "Figura masculina, ação, protagonismo, o consulente homem" },
  { id: 29, name: "A Cigana",      keywords: "Figura feminina, intuição, receptividade, a consulente mulher" },
  { id: 30, name: "Os Lírios",     keywords: "Paz, maturidade, pureza, sabedoria, sexualidade madura" },
  { id: 31, name: "O Sol",         keywords: "Sucesso máximo, clareza, vitalidade, conquista" },
  { id: 32, name: "A Lua",         keywords: "Intuição, reconhecimento, honrarias, emoções profundas" },
  { id: 33, name: "A Chave",       keywords: "Solução, abertura, resposta, importância" },
  { id: 34, name: "Os Peixes",     keywords: "Dinheiro, abundância, fluxo financeiro, negócios" },
  { id: 35, name: "A Âncora",      keywords: "Estabilidade, trabalho fixo, permanência, segurança" },
  { id: 36, name: "A Cruz",        keywords: "Fardo, karma, destino, teste espiritual, responsabilidade" },
] as const;
```

### 5.2 Os 16 Odus com Regências

```typescript
// src/lib/constants/odus.ts
export const ODUS = [
  { id: 1,  name: "Ogbe",      orixas: ["Oxalá"],              essence: "Luz, origem, criação, renovação" },
  { id: 2,  name: "Ejiokô",    orixas: ["Ibeji", "Ogum"],      essence: "Dualidade, movimento, parcerias" },
  { id: 3,  name: "Etogundá",  orixas: ["Ogum", "Ogun"],       essence: "Batalha, conquista, abertura de caminhos" },
  { id: 4,  name: "Irosun",    orixas: ["Oxum", "Iemanjá"],    essence: "Atenção, sangue, cuidado com traições" },
  { id: 5,  name: "Oxê",       orixas: ["Oxum", "Iemanjá"],    essence: "Beleza, amor, fertilidade, magnetismo" },
  { id: 6,  name: "Obará",     orixas: ["Xangô", "Oxóssi"],    essence: "Riqueza, glória, abundância, fartura" },
  { id: 7,  name: "Odi",       orixas: ["Exu", "Omolu"],       essence: "Segredos, transformação, cautela, limpeza" },
  { id: 8,  name: "Ejionile",  orixas: ["Xangô", "Oxalá"],     essence: "Justiça, liderança, força, vitória" },
  { id: 9,  name: "Ossá",      orixas: ["Iemanjá", "Oyá"],     essence: "Proteção feminina, sabedoria, turbulência" },
  { id: 10, name: "Ofun",      orixas: ["Oxalufan", "Oxalá"],  essence: "Espiritualidade profunda, equilíbrio mental" },
  { id: 11, name: "Owarin",    orixas: ["Exu", "Oyá"],         essence: "Dinâmica, perigo, astúcia, movimento rápido" },
  { id: 12, name: "Ejilaxebô", orixas: ["Ogum", "Oxum"],       essence: "Honra, proteção, caminho aberto" },
  { id: 13, name: "Oturupon",  orixas: ["Omolu", "Nanã"],      essence: "Cura, purificação, ancestralidade" },
  { id: 14, name: "Oturá",     orixas: ["Oxalá", "Iemanjá"],   essence: "Paz, benevolência, proteção divina" },
  { id: 15, name: "Iká",       orixas: ["Xangô", "Oxum"],      essence: "Poder, estratégia, responsabilidade" },
  { id: 16, name: "Ofurufu",   orixas: ["Oxalá", "Todos os Orixás"], essence: "Completude, totalidade, bênção universal" },
] as const;
```

---

## 6. Script de Seed (Usuário Inicial)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('sua-senha-segura-aqui', 12);

  await prisma.user.upsert({
    where: { email: 'gabriel@cabala.com' },
    update: {},
    create: {
      email: 'gabriel@cabala.com',
      name: 'Gabriel',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado com sucesso.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
