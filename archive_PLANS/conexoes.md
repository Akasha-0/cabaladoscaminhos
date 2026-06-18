# Plano: Conexões — Análise de Compatibilidade Akasha

**Data:** 2026-06-17
**Feature:** Conexões (formerly "Synastry")
**Pergunta que responde:** Q1 + Q3 — "Who am I in relation to another?"

---

## Conceito

Conexões ≠ Sinastria astrológica clássica. Não é "signo × signo". É a análise de como **dois mapas Akasha completos** ressoam entre si — em qualquer tipo de relação.

**Dois modos de comparação:**
1. **Usuário registrado** — busca por e-mail; usa BirthChart existente
2. **Dados avulsos** — preenche nome + data + cidade + hora (opcional); calcula pilares em tempo real

**Dois tipos de análise:**
- **Amorosa** — química emocional, intimidade, autoridade emocional (Casa 8), Corpo 3/4
- **Negócio/Parceria** — autoridade de decisão, estratégia, complementação de sombras

---

## Fase 1 — Engine de Comparação

### `packages/akasha-core/src/conexoes.ts` (novo)

Funções puras que comparam dois AkashaMaps.

#### Input: `AkashaMap` por pessoa
```typescript
type AkashaMap = {
  name: string;
  birthDate: string; // 'YYYY-MM-DD'
  birthTime?: string;
  birthCity?: string;
  kabalisticMap: KabalisticMap;
  astrologyMap: AstrologyMap;
  tantricMap: TantricMap;
  oduBirth: OduBirth;
  authority: AkashaAuthority; // from synthesizer
};
```

#### Output: `ConexaoResult`
```typescript
type ConexaoResult = {
  romantic: number; // 0-100
  partnership: number; // 0-100
  dominantType: 'romantic' | 'partnership' | 'both' | 'challenging';
  authorityMatch: 'aligned' | 'complementary' | 'conflict';
  dimensions: ConnectionDimension[];
  oduSync: OduSync;
  bodySync: BodySync;
  narrative: string;
  recommendations: string[];
};

type ConnectionDimension = {
  dimension: string; // 'Emocional' | 'Sexual' | 'Espiritual' | 'Material' | 'Mental'
  score: number;
  description: string;
  tip: string;
};

type OduSync = {
  score: number;
  sharedOdu: boolean;
  complementaryOdu: boolean;
  description: string;
};
```

#### Scoring logic

| Pilar | O que compara | Peso |
|-------|--------------|------|
| **Authority** (Corpo 3/4 + tipo) | paz/paz, ansiedade/ansiedade, mista | 25% |
| **Casa 8 astrológica** | Presença em ambos, aspecto entre luas | 20% |
| **Odu** | Mesmo Odu = espiritual ressonância alta; Odu 8 + Odu 1 = intimidade profunda | 20% |
| **Tantra body type** | Corpo predominante: água×fogo = tensão; terra×ar = harmonia | 15% |
| **Kabbalah** | Caminho de Vida: números complementares (1+9, 2+8) vs iguais | 10% |
| **Astrologia Lua** | Lua no mesmo elemento = emocional ressonância | 10% |

#### Funções a implementar
- `compareAkashaMaps(mapA: AkashaMap, mapB: AkashaMap): ConexaoResult`
- `scoreAuthority(a: AkashaAuthority, b: AkashaAuthority): number`
- `scoreCasaOito(a: AstrologyMap, b: AstrologyMap): number`
- `scoreOdu(a: OduBirth, b: OduBirth): OduSync`
- `scoreTantra(a: string, b: string): number`
- `scoreKabbalisticPath(a: number, b: number): number`
- `scoreLua(a: AstrologyMap, b: AstrologyMap): number`
- `buildConexaoNarrative(result: ConexaoResult): string`
- `generateRecommendations(result: ConexaoResult): string[]`

---

## Fase 2 — API Route

### `POST /api/akasha/conexoes`

**Request body:**
```typescript
{
  mode: 'registered' | 'raw';
  userA: {
    // mode 'registered'
    email?: string;
    // mode 'raw'
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthCity?: string;
  };
  userB: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthCity?: string;
    birthLatitude?: number;
    birthLongitude?: number;
  };
  type: 'romantic' | 'partnership' | 'full';
}
```

**Fluxo:**
1. Se `mode === 'registered'`, busca usuário por e-mail → usa BirthChart existente
2. Se `mode === 'raw'`, calcula pilares para userB em tempo real (mesmo cálculo do onboarding)
3. Para userA, busca BirthChart do usuário autenticado
4. Chama `compareAkashaMaps(mapA, mapB)`
5. Salva resultado em `Connection` (Prisma) para histórico

**Response:** `ConexaoResult` (acima)

**HTTP codes:**
- 200: resultado
- 400: dados inválidos
- 404: usuário registrado não encontrado
- 401: não autenticado

---

## Fase 3 — Prisma Schema

### Adicionar `model Connection`
```prisma
model Connection {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  otherName String
  otherEmail String?
  otherBirthDate DateTime
  otherBirthTime String?
  otherBirthCity String?
  romanticScore  Int?
  partnershipScore Int?
  dominantType   String?
  authorityMatch String?
  resultData     Json    // ConexaoResult completo
  createdAt DateTime @default(now())
  @@map("connections")
}
```

**Migration:** `npx prisma migrate dev --name add_connections`

---

## Fase 4 — UI Conexões

### `src/app/[locale]/(akasha)/conexoes/page.tsx` (novo)
- Server component: auth guard → redirect se não logado
- Renderiza `<ConexoesClient>`

### `ConexoesClient` (novo em `components/akasha/ConexoesClient.tsx`)

**Layout em 3 etapas:**

#### Etapa 1 — Seleção
```
┌─────────────────────────────────────┐
│  Conexões                            │
│  Descubra como dois mapas Akasha    │
│  se relacionam                       │
│                                      │
│  Seu perfil já está carregado.       │
│                                      │
│  Modo: ○ Pessoa registrada (e-mail) │
│         ○ Dados avulsos              │
│                                      │
│  Dados da outra pessoa:              │
│  Nome:  [________________]           │
│  Data:  [________]                   │
│  Hora:  [________]  (opcional)       │
│  Cidade:[________________]           │
│                                      │
│  Tipo: ○ Amorosa                    │
│         ○ Negócio/Parceria           │
│         ○ Análise completa           │
│                                      │
│  [Analisar Conexão]                  │
└─────────────────────────────────────┘
```

#### Etapa 2 — Resultados (cards)

```
┌─────────────────────────────────────┐
│  [Avatar A] × [Avatar B]            │
│  Nome A × Nome B                     │
│                                      │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Score      │  │ Score       │  │
│  │ Amorosa    │  │ Negócio     │  │
│  │   78       │  │   62        │  │
│  └─────────────┘  └─────────────┘  │
│                                      │
│  Tipo dominante: Amorosa             │
│  Authority: Complementar             │
│                                      │
│  Dimensões:                          │
│  ┌─────────────────────────────────┐│
│  │ Emocional   ████████░░  82%   ││
│  │ Sexual      █████░░░░░  58%   ││
│  │ Espiritual  █████████░  91%   ││
│  │ Material    ████░░░░░░  45%   ││
│  │ Mental      ███████░░░  72%   ││
│  └─────────────────────────────────┘│
│                                      │
│  Odu: Odu 8 × Odu 3 — Alta         │
│  ressonância espiritual              │
│                                      │
│  Recomendação:                       │
│  "A conexión espiritual é o ponto   │
│   forte. A área material pede       │
│   atenção. Trabalhem juntos na      │
│   visão de longo prazo."            │
└─────────────────────────────────────┘
```

#### Etapa 3 — Detalhamento por pilar (expandível)
- Authority (Corpo 3/4) lado a lado
- Casa 8 + Lua lado a lado
- Odu sync
- Tantra body comparison
- Kabbalistic path compatibility

---

## Fase 5 — Navegação

### `AkashaNavigation.tsx`
Adicionar link para Conexões no `navLinks`:
```typescript
{
  href: `/${locale}/conexoes`,
  label: 'Conexões',
  icon: Heart,
}
```
Usar `Heart` do lucide-react (já disponível).

Posição: entre `Akasha` e `Diário` (após a link "Akasha" que foi adicionado na tarefa anterior).

### `public/manifest.json`
Adicionar PWA shortcut:
```json
{
  "name": "Conexões Akasha",
  "short_name": "Conexões",
  "url": "/conexoes",
  "icons": [...]
}
```

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `packages/akasha-core/src/conexoes.ts` | Criar — engine de comparação |
| `packages/akasha-core/src/index.ts` | Adicionar exports |
| `apps/akasha-portal/src/app/api/akasha/conexoes/route.ts` | Criar — API route |
| `apps/akasha-portal/prisma/schema.prisma` | Adicionar `Connection` model |
| `apps/akasha-portal/prisma/migrations/` | Migration |
| `apps/akasha-portal/src/components/akasha/ConexoesClient.tsx` | Criar — UI client |
| `apps/akasha-portal/src/app/[locale]/(akasha)/conexoes/page.tsx` | Criar — página |
| `apps/akasha-portal/src/components/akasha/AkashaNavigation.tsx` | Adicionar link Conexões |
| `apps/akasha-portal/public/manifest.json` | Adicionar shortcut |
| `MAPA.md` | Registrar `/conexoes` |

---

## Métricas de Aceitação

- [ ] Usuário consegue comparar seu mapa com dados avulsos de outra pessoa
- [ ] Usuário consegue comparar seu mapa com outro usuário registrado (por e-mail)
- [ ] Scores numéricos são exibidos (0-100)
- [ ] Dimensões são detalhadas por pilar
- [ ] Recomendação narrativa é gerada
- [ ] Resultado é salvo no histórico de Conexões
- [ ] Link "Conexões" aparece na navegação
- [ ] PWA shortcut existe
- [ ] `pnpm build` passa
- [ ] `npx vitest run` passa
