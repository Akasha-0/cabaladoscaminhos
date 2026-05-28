# Arquitetura - Cabala dos Caminhos

## Visão Geral

Este documento descreve a arquitetura atual do projeto "Cabala dos Caminhos", identifica problemas e define um roadmap de evolução.

**Stack tecnológico:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (State Management)
- Prisma (ORM)
- Supabase (Auth + Database)
- OpenAI (AI Integration)
- Stripe (Payments)

---

## Estado Atual da Arquitetura

### 1. Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group
│   ├── (dashboard)/         # Protected dashboard
│   ├── api/                # API Routes
│   │   ├── auth/
│   │   ├── astrologia/
│   │   ├── chat/
│   │   ├── creditos/
│   │   ├── ciclos/
│   │   ├── insights/
│   │   ├── numerologia/
│   │   ├── odus/
│   │   ├── payments/
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── astrologia/
│   ├── auth/
│   ├── dashboard/
│   ├── providers/
│   └── ui/                 # Shadcn/ui components
├── hooks/                  # React hooks (src/hooks)
├── lib/                    # Business logic & utilities
│   ├── ai/
│   ├── astrologia/
│   ├── auth-jwt/
│   ├── chat/
│   ├── credits/
│   ├── hooks/              # lib/hooks (custom hooks)
│   ├── numerologia/
│   ├── odus/
│   ├── store/             # Zustand stores
│   ├── api/               # NEW: API utilities
│   ├── error-handling.ts
│   ├── logging.ts
│   ├── validators.ts
│   └── utils.ts
├── middleware/
│   └── rateLimit.ts
└── proxy.ts.bak
```

### 2. State Management

**Antes:** Store fragmentado em `src/lib/store/userPreferences.ts` (único store)

**Agora:** Store unificado em `src/lib/store/index.ts` com:
- `useAuthStore` - Estado de autenticação
- `useCreditsStore` - Créditos com suporte a optimistic updates
- `useUIStore` - UI state (theme, sidebar, modals)
- `useCacheStore` - Cache de requisições para evitar chamadas redundantes

### 3. API Routes

**Padrões identificados:**
- Rotas em `src/app/api/[resource]/route.ts`
- Validação manual com `if (!param)` checks
- Error handling inconsistente (algumas usam `try/catch`, outras não)
- Sem rate limiting em várias rotas
- Sem resposta padronizada

**Agora:** Infraestrutura em `src/lib/api/base-route.ts`:
- `validateRequestBody()` / `validateQueryParams()` - Validação Zod
- `checkRequestRateLimit()` - Rate limiting
- `successResponse()` / `errorResponse()` - Respostas padronizadas
- `getAuthUser()` - Extração de usuário autenticado

### 4. Type Safety

**Tipos existentes:**
- `src/lib/astrologia/tipos.ts` - Tipos de astrologia (forte)
- `src/lib/ai/types.ts` - Tipos de chat/AI
- `src/lib/chat/types.ts` - Tipos de conversa
- `src/lib/validators.ts` - Schemas Zod

**Melhorias aplicadas:**
- `src/lib/api/types.ts` - Tipos API compartilhados
- Schemas Zod exportados para validação no cliente e servidor

---

## Problemas Identificados

### 🔴 Problema 1: Store Fragmentado e Inconsistente

**Sintoma:** Cada feature (credits, numerologia, etc.) implementa seu próprio estado local com `useState`. Isso causa:
- Estado duplicado (ex: saldo de créditos em múltiplos lugares)
- Dificuldade de sincronização entre componentes
- Lógica de optimistic updates repetida

**Impacto:** Alta complexidade de manutenção quando o estado precisa ser compartilhado.

**Solução Implementada:** Store centralizado em `src/lib/store/index.ts`:
```typescript
// Exemplo de uso
const { saldo, debit, credit } = useCreditsStore();
// Optimistic update atômico
if (creditsStore.debit(5)) {
  // Faz a requisição, rollback em caso de erro
}
```

### 🟡 Problema 2: API Routes sem Validação Padronizada

**Sintoma:** Validação manual em cada rota:
```typescript
// ANTES - validação manual
if (!tipo) {
  return NextResponse.json({ error: 'Parâmetro obrigatório' }, { status: 400 });
}
if (!nome) {
  return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
}
```

**Impacto:**
- Lógica de validação duplicada
- Inconsistência de mensagens de erro
- Falta de type safety no parsing de query params

**Solução Implementada:** `src/lib/api/base-route.ts`:
```typescript
// AGORA - validação Zod
const schema = z.object({
  tipo: z.enum(['pitagorica', 'caldeia', ...]),
  nome: z.string().optional(),
});
const result = validateQueryParams(schema, request.nextUrl.searchParams);
if (result.error) return errorResponse(result.error);
```

### 🟡 Problema 3: Ausência de Cache Layer para Requisições

**Sintoma:** Hooks fazem requisições repetidas sem cache:
```typescript
// Cada componente que usa useMapaNatal faz fetch() separadamente
useEffect(() => { fetch('/api/astrologia/mapa-natal') }, []);
```

**Impacto:**
- Excessivas chamadas de rede
- UI com loading states desnecessários
- Dados inconsistentes entre componentes

**Solução Implementada:** `useCacheStore` no store centralizado:
```typescript
// Cache com TTL de 5 minutos
const cached = useCacheStore.get().get<MapaNatal>('mapa-natal');
if (cached) return cached;

const response = await fetch(...);
useCacheStore.get().set('mapa-natal', response);
```

---

## Roadmap de Melhorias

### Fase 1: Infraestrutura (✅ COMPLETO)
- [x] Store centralizado com Zustand
- [x] Base route helpers para API
- [x] Tipos API compartilhados
- [x] Error handling centralizado

### Fase 2: API Routes (Em Progresso)
- [ ] Migrar `/api/creditos` para usar base-route
- [ ] Migrar `/api/ciclos` para usar base-route
- [ ] Migrar `/api/astrologia/*` para usar base-route
- [ ] Implementar Response caching strategy

### Fase 3: Performance
- [ ] Lazy loading de componentes pesados (Gráficos, Mapas)
- [ ] Code splitting por rota
- [ ] SWR para data fetching
- [ ] Memoização de cálculos numerológicos

### Fase 4: Separação de Concerns
- [ ] Mover business logic de components para services
- [ ] Consolidar hooks em `src/lib/hooks/`
- [ ] API routes como thin layer sobre services

### Fase 5: Observabilidade
- [ ] Integrar logging em todas API routes
- [ ] Métricas de performance (Core Web Vitals)
- [ ] Error tracking (Sentry)

---

## Padrões Recomendados

### Estrutura de API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  successResponse, 
  errorResponse,
  validateQueryParams,
  checkRequestRateLimit,
  getAuthUser,
} from '@/lib/api/base-route';
import { ErrorCode } from '@/lib/error-handling';
import { logger } from '@/lib/logging';

// 1. Schema de validação
const querySchema = z.object({
  id: z.string().min(1),
});

// 2. Handlers
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRequestRateLimit(request, {
    maxRequests: 100,
    windowMs: 60000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: {...} }, { status: 429 });
  }

  // Validação
  const validation = validateQueryParams(querySchema, request.nextUrl.searchParams);
  if (validation.error) return errorResponse(validation.error);

  // Lógica de negócio
  try {
    const result = await getData(validation.data.id);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    logger.error('Erro ao buscar dados', { id: validation.data.id });
    return errorResponse(error as Error);
  }
}
```

### Estrutura de Store

```typescript
// src/lib/store/index.ts
export interface FeatureState {
  data: DataType | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetch: () => Promise<void>;
  update: (data: Partial<DataType>) => void;
  reset: () => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      data: null,
      isLoading: false,
      error: null,
      
      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/feature');
          const { data } = await response.json();
          set({ data, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      update: (partial) => set(state => ({ 
        data: state.data ? { ...state.data, ...partial } : null 
      })),
      reset: () => set({ data: null, error: null }),
    }),
    { name: 'feature-storage' }
  )
);
```

### Validação Zod Compartilhada

```typescript
// src/lib/validators.ts
export const mySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Usar em API route
import { mySchema } from '@/lib/validators';

// Usar em Client (com parse)
const result = mySchema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.flatten().fieldErrors);
}
```

---

## Comandos Úteis

```bash
# Gerar tipos do Prisma
npm run db:generate

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Testes
npm run test
```

---

## Glossário

| Termo | Definição |
|-------|-----------|
| Zustand | Biblioteca de state management para React |
| Prisma | ORM para TypeScript |
| SWR | Stale-While-Revalidate - estratégia de cache |
| Zod | Biblioteca de validação de schemas |
| Optimistic Update | Atualizar UI antes da confirmação do servidor |

---

*Última atualização: 2026-05-28*