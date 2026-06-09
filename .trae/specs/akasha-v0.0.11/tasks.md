# Tasks — Akasha v0.0.11

## Ordem de Execução (Incremental)

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

**Estratégia:** Incremental — cada tarefa é um milestone testável.

---

## T1: Setup do Pacote `packages/mentor`

**Responsável:** Agente de domínio
**Prioridade:** 🔴 Alta

### Contexto
- Novo pacote workspace para isolar código do agente
- Reutiliza código existente (DeepCorrelationEngine, swarm-memory, cores)

### Implementação

- [ ] Criar `packages/mentor/package.json` com dependências:
  - `@akasha/core-cabala`
  - `@akasha/core-odus`
  - `@akasha/core-astrology`
  - `@akasha/core-tantra`
  - `ink` (CLI)
  - `react` (CLI rendering)

- [ ] Criar `packages/mentor/tsconfig.json`

- [ ] Atualizar `pnpm-workspace.yaml` para incluir `packages/mentor`

- [ ] Criar estrutura base:
  ```
  packages/mentor/src/
  ├── index.ts
  ├── types.ts
  ├── mentor.ts
  ├── maps.ts
  ├── correlation.ts
  ├── memory.ts
  ├── cli/
  │   ├── index.ts
  │   ├── chat.ts
  │   └── login.ts
  ├── web/
  │   ├── MentorChat.tsx
  │   └── MentorPage.tsx
  └── api/
      ├── ask/route.ts
      └── history/route.ts
  ```

### Entrega
- Pacote compila sem erros
- Exporta tipos básicos
- Commit: `feat: create packages/mentor skeleton`

---

## T2: Tipos e Modelos de Dados

**Responsável:** Agente de domínio
**Prioridade:** 🔴 Alta

### Contexto
- Define contratos entre camadas
- Integra com Prisma existente

### Implementação

- [ ] Criar `packages/mentor/src/types.ts`:
  ```typescript
  export interface UserMaps {
    cabala: CabalaMap;
    odu: OduMap;
    astrology: AstrologyMap;
    tantra: TantraMap;
  }

  export interface MentorMessage {
    id: string;
    userId: string;
    role: 'user' | 'mentor';
    content: string;
    maps?: string[]; // mapas mencionados na mensagem
    createdAt: Date;
  }

  export interface MentorSession {
    messages: MentorMessage[];
    maps: UserMaps;
  }

  export interface AskRequest {
    question: string;
    userId: string;
    sessionHistory?: MentorMessage[];
  }

  export interface AskResponse {
    answer: string;
    mapsUsed: string[];
    correlation: CorrelationResult;
    streaming: boolean;
  }

  export interface CorrelationResult {
    primary: string;
    secondary: string;
    insight: string;
  }
  ```

- [ ] Atualizar schema Prisma (se necessário para `Message`)

### Entrega
- Tipos exportados e documentados
- Commit: `feat: add mentor types`

---

## T3: Wrapper de Mapas (`maps.ts`)

**Responsável:** Agente de domínio
**Prioridade:** 🔴 Alta

### Contexto
- Carrega os 4 mapas do usuário autenticado
- Interface unificada para acesso aos cores

### Implementação

- [ ] Criar `packages/mentor/src/maps.ts`:
  ```typescript
  import { calculateLifePath } from '@akasha/core-cabala';
  import { getOduBirth } from '@akasha/core-odus';
  import { getBirthChart } from '@akasha/core-astrology';
  import { getTantraBody } from '@akasha/core-tantra';

  export async function loadUserMaps(userId: string): Promise<UserMaps> {
    // Busca dados do usuário no banco
    const userData = await prisma.user.findUnique({ ... });

    // Calcula cada mapa
    const cabala = calculateLifePath(userData.birthDate, userData.name);
    const odu = getOduBirth(userData.birthDate);
    const astrology = getBirthChart(userData.birthDate, userData.location);
    const tantra = getTantraBody(userData.birthDate);

    return { cabala, odu, astrology, tantra };
  }

  export function formatMapsSummary(maps: UserMaps): string {
    return `
📊 SEUS MAPAS:
• Caminho de Vida: ${maps.cabala.lifePath} (${maps.cabala.description})
• Odu Regente: ${maps.odu.primary}
• Sol: ${maps.astrology.sun}
• Corpo Tântrico: ${maps.tantra.primary}
    `.trim();
  }
  ```

### Entrega
- Função `loadUserMaps` carrega todos os 4 mapas
- Função `formatMapsSummary` formata para display
- Commit: `feat: add user maps loader`

---

## T4: Wrapper de Correlação (`correlation.ts`)

**Responsável:** Agente de IA
**Prioridade:** 🔴 Alta

### Contexto
- Usa `DeepCorrelationEngine` existente
- Wrapper para interface do mentor

### Implementação

- [ ] Criar `packages/mentor/src/correlation.ts`:
  ```typescript
  import { DeepCorrelationEngine } from '@/lib/application/ai/deep-correlation-engine';

  export async function getCorrelations(
    maps: UserMaps,
    question: string
  ): Promise<CorrelationResult[]> {
    const engine = new DeepCorrelationEngine(maps);
    const correlations = engine.findCorrelations(question);
    return correlations;
  }
  ```

- [ ] Integrar com prompt do LLM

### Entrega
- Correlações entre 4 mapas disponíveis
- Commit: `feat: integrate deep correlation engine`

---

## T5: CLI com Ink (`akasha chat`)

**Responsável:** Agente de interface
**Prioridade:** 🔴 Alta

### Contexto
- Usuário digita `akasha chat` e conversa no terminal
- Login via CLI, REPL interativo

### Implementação

- [ ] Criar `packages/mentor/src/cli/index.ts`:
  ```typescript
  #!/usr/bin/env node
  import { render } from 'ink';
  import React from 'react';
  import { MentorCLI } from './MentorCLI';

  render(<MentorCLI />);
  ```

- [ ] Criar `packages/mentor/src/cli/MentorCLI.tsx`:
  - Componente Ink principal
  - Estados: login, loading, chat, error

- [ ] Criar `packages/mentor/src/cli/chat.ts`:
  - Loop REPL
  - Input do usuário
  - Output streaming

- [ ] Criar `packages/mentor/src/cli/login.ts`:
  - Login email/senha via API
  - Armazena JWT localmente

- [ ] Atualizar `package.json` raiz:
  ```json
  "bin": {
    "akasha": "./packages/mentor/dist/cli/index.js"
  }
  ```

### Entrega
- `akasha chat` funciona no terminal
- Login, mapas, chat com streaming
- Commit: `feat: add akasha chat CLI`

---

## T6: Web Interface (`/oraculo`)

**Responsável:** Agente de interface
**Prioridade:** 🔴 Alta

### Contexto
- Extende `/oraculo` existente
- Chatbox + streaming + cards

### Implementação

- [ ] Criar `packages/mentor/src/web/MentorChat.tsx`:
  ```typescript
  interface MentorChatProps {
    userId: string;
    onMapsLoaded: (maps: UserMaps) => void;
  }
  ```

- [ ] Componentes:
  - ChatBox (input + output)
  - MessageList (histórico)
  - StreamingText (token-by-token)
  - MapCards (símbolos dos mapas mencionados)
  - StopButton (cancelar streaming)

- [ ] Criar API routes:
  - `apps/akasha-portal/src/app/api/mentor/ask/route.ts`
  - `apps/akasha-portal/src/app/api/mentor/history/route.ts`

- [ ] Integrar em `/oraculo/page.tsx`

### Entrega
- `/oraculo` mostra chat do mentor
- Streaming funciona
- Commit: `feat: add mentor web interface`

---

## T7: LLM Router + Rate Limit + Credits

**Responsável:** Agente de infraestrutura
**Prioridade:** 🔴 Alta

### Contexto
- OpenAI primary, Ollama fallback
- Rate limit 10 msg/min
- Desconta 1 credit

### Implementação

- [ ] Criar `packages/mentor/src/llm-router.ts`:
  ```typescript
  export async function askMentor(
    request: AskRequest,
    maps: UserMaps,
    history: MentorMessage[]
  ): Promise<AsyncIterable<string>> {
    // 1. Tenta OpenAI
    // 2. Fallback Ollama se falhar
    // 3. Streaming SSE
  }
  ```

- [ ] Criar `packages/mentor/src/rate-limit.ts`:
  - 10 msg/min por usuário
  - Usar Redis ou memória

- [ ] Criar `packages/mentor/src/credits.ts`:
  - Verificar credits ≥ 1
  - Debitar 1 credit por pergunta

- [ ] Criar `grimoire/mentor/system-prompt.md`

### Entrega
- LLM responde com streaming
- Rate limit funciona
- Credits desconta
- Commit: `feat: add LLM router and guards`

---

## T8: Testes de Integração

**Responsável:** QA
**Prioridade:** 🔴 Alta

### Contexto
- Testa fluxo completo
- Garante qualidade

### Implementação

- [ ] Criar `tests/integration/mentor/`:
  ```typescript
  // ask-flow.test.ts
  test('pergunta retorna resposta com mapas', async () => { ... })

  // rate-limit.test.ts
  test('bloqueia após 10 msg/min', async () => { ... })

  // credits.test.ts
  test('desconta 1 credit por pergunta', async () => { ... })

  // auth.test.ts
  test('redireciona sem login', async () => { ... })

  // maps.test.ts
  test('carrega 4 mapas do usuário', async () => { ... })
  ```

### Entrega
- 5 testes de integração
- `pnpm test:run` passa
- Commit: `test: add mentor integration tests`

---

## T9: Documentação

**Responsável:** Agente de domínio
**Prioridade:** 🟡 Média

### Implementação

- [ ] Criar `packages/mentor/README.md`:
  - Instalação
  - Uso (CLI + Web)
  - API
  - Contribuição

- [ ] Atualizar `docs/08_roadmap.md` (v0.0.11 ✅)

### Entrega
- README completo
- Roadmap atualizado
- Commit: `docs: add mentor package README`

---

## Dependências Entre Tarefas

```
T1 (setup) → T2 (tipos) → T3 (maps) → T4 (correlation)
                                         ↓
T5 (CLI) ← T1, T2 ← T6 (web) ← T1, T2
                        ↓
T7 (LLM + guards) → T8 (testes) → T9 (docs)
```

---

## Critérios de Verificação

Para cada tarefa:
1. Compila sem erros (`pnpm typecheck`)
2. Testes passam (`pnpm test:run`)
3. Lint limpo (`pnpm lint`)
4. Commit atômico
