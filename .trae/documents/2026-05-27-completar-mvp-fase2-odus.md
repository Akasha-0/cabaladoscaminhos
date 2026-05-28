# Completar MVP + Iniciar FASE 2: Odús

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar o Sprint 4.1 (Integração de APIs) e Sprint 4.3 (Testes/Deploy), depois iniciar FASE 2 com o cálculo de Odús de nascimento.

**Architecture:** Integrar hooks de API às páginas existentes, adicionar testes de integração, preparar deploy, e implementar sistema de Odús de Ifá para personalização espiritual.

**Tech Stack:** Next.js 16, TypeScript, Prisma, Supabase, Vitest

---

## Resumo do Progresso Atual

### ✅ Completado
- Sprint 2: Cálculos numerológicos (Pitagórica, Cabalística, Caldeia, Tântrica)
- Sprint 2: Ciclos temporais (Ano, Mês, Dia Pessoal)
- Sprint 2: Base de conhecimento (dias, orixás, chakras, ervas)
- Sprint 3.3: Calendário semanal funcional
- Sprint 4.2: Página de perfil com cálculos em tempo real
- Sprint 4: Hooks de integração (useNumerologia, useCiclos)
- Sprint 4: Sistema de preferências (Zustand)
- Sprint 4: Setup de testes (Vitest)

### 📋 Pendente (Sprint 4.1 + 4.3)

| Tarefa | Descrição | Prioridade |
|--------|-----------|------------|
| 4.1.1 | Integrar hooks às páginas do dashboard | Alta |
| 4.1.3 | Tratamento de erros global | Alta |
| 4.3.1-4.3.4 | Testes MVP | Alta |
| 4.3.5 | Deploy staging | Alta |

### 📋 Próxima Fase (FASE 2)

| Tarefa | Descrição | Prioridade |
|--------|-----------|------------|
| 5.1.1-5.1.5 | Cálculo de Odús de nascimento | Alta |
| 5.2.1-5.2.4 | Integração Odús → Dashboard | Média |

---

## Task 1: Integrar Hooks ao Dashboard e Páginas

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`
- Modify: `src/app/(dashboard)/calendario/page.tsx`

- [ ] **Step 1: Integrar useNumerologia à dashboard principal**

Atualizar `src/app/(dashboard)/page.tsx`:
- Importar `useNumerologia` e `useCiclos`
- Adicionar cards de resumo com números calculados
- Mostrar estado de loading com skeleton
- Tratar erros com mensagem amigável

```tsx
// Adicionar imports
import { useNumerologia, useCiclos } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';

// No componente:
const { pitagorica, cabalistica, tantrica, loading, error } = useNumerologia(
  userName,
  userBirthDate
);

// No JSX, substituir valores hardcoded por:
{loading ? (
  <Skeleton className="h-24 w-24 rounded-full" />
) : error ? (
  <div className="text-destructive text-sm">{error}</div>
) : (
  <div className="text-4xl font-cinzel">{pitagorica}</div>
)}
```

- [ ] **Step 2: Integrar useCiclos ao calendário**

Atualizar `src/app/(dashboard)/calendario/page.tsx`:
- Importar hooks necessários
- Passar quizilas do usuário para filtrar recomendações
- Mostrar ciclos temporais no header

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx src/app/\(dashboard\)/calendario/page.tsx
git commit -m "feat: integrar hooks de API ao dashboard e calendário"
```

---

## Task 2: Tratamento de Erros Global

**Files:**
- Create: `src/components/ui/ErrorBoundary.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Criar Error Boundary component**

```tsx
// src/components/ui/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4 bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Algo deu errado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <Button onClick={this.handleReload} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 2: Criar página de erro 404 customizada**

```tsx
// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl font-cinzel text-primary">404</div>
        <h1 className="text-2xl font-cinzel text-primary">
          Caminho Não Encontrado
        </h1>
        <p className="text-muted-foreground font-raleway max-w-md mx-auto">
          A página que você busca não existe nesta dimensão.
          Retorne ao seu caminho espiritual.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ErrorBoundary.tsx src/app/not-found.tsx
git commit -m "feat: adicionar tratamento de erros global e página 404 customizada"
```

---

## Task 3: Testes de Integração MVP

**Files:**
- Create: `tests/hooks/useNumerologia.test.ts`
- Create: `tests/hooks/useCiclos.test.ts`
- Modify: `tests/api/numerologia.test.ts`

- [ ] **Step 1: Criar mocks para fetch**

```typescript
// tests/mocks/handlers.ts
export const mockFetch = (data: unknown, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  }) as Promise<Response>;
};

// tests/mocks/server.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

global.fetch = vi.fn();
```

- [ ] **Step 2: Testar useNumerologia hook**

```typescript
// tests/hooks/useNumerologia.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useNumerologia } from '@/lib/hooks/useNumerologia';
import { mockFetch } from '../mocks/handlers';

describe('useNumerologia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar dados corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetch({ numero: 7 })
    );

    const { result } = renderHook(() => 
      useNumerologia('Maria', '1990-06-15')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pitagorica).toBe(7);
  });

  it('deve mostrar erro quando fetch falha', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetch({ error: 'Erro' }, false)
    );

    const { result } = renderHook(() => 
      useNumerologia('Maria', '1990-06-15')
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

- [ ] **Step 3: Testar useCiclos hook**

```typescript
// tests/hooks/useCiclos.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCiclos } from '@/lib/hooks/useCiclos';
import { mockFetch } from '../mocks/handlers';

describe('useCiclos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar ciclos corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetch({
        ciclos: {
          anoPessoal: 7,
          mesPessoal: 3,
          diaPessoal: 5,
          sefirotAno: 'Tiphereth',
          sefirotMes: 'Hod',
          sefirotDia: 'Netzach',
        }
      })
    );

    const { result } = renderHook(() => useCiclos('1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ano?.numero).toBe(7);
    expect(result.current.ano?.sefirot).toBe('Tiphereth');
  });
});
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run
# Esperado: Todos os testes passando
```

- [ ] **Step 5: Commit**

```bash
git add tests/ tests/mocks/
git commit -m "test: adicionar testes de integração para hooks de API"
```

---

## Task 4: Deploy Staging

**Files:**
- Modify: Supabase project settings (se necessário)
- Modify: Vercel project settings

- [ ] **Step 1: Configurar variáveis de ambiente no Vercel**

1. Acessar Vercel Dashboard
2. Ir em Settings → Environment Variables
3. Adicionar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

- [ ] **Step 2: Configurar Prisma para produção**

Verificar que `prisma.config.ts` está correto:

```typescript
// prisma.config.ts
export default {
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
};
```

- [ ] **Step 3: Deploy manual (primeira vez)**

```bash
# Instalar Vercel CLI se necessário
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ou via GitHub (recomendado)
# Conectar repo no Vercel Dashboard
# Deploy trigger automatico em push para main
```

- [ ] **Step 4: Verificar deployment**

1. Acessar URL do staging
2. Testar fluxo completo:
   - Registro de usuário
   - Login
   - Dashboard carrega dados
   - Calendário funciona
   - Chat demo funciona
   - Perfil com cálculos

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configurar deploy staging"
git push
```

---

## Task 5: Cálculo de Odús de Nascimento (FASE 2)

**Files:**
- Create: `src/lib/odus/calculos.ts`
- Create: `src/app/api/odus/route.ts`
- Modify: `src/lib/data/spiritual-data.ts`

- [ ] **Step 1: Implementar algoritmo de cálculo do Odú**

```typescript
// src/lib/odus/calculos.ts

export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  orixaRegente: string;
  elementos: string;
  quizilas: string[];
  preceitos: string[];
  ebos: string[];
}

const odusData: Record<number, OduInfo> = {
  1: {
    numero: 1,
    nome: 'Okaran',
    significado: 'O começo, a dúvida, a insubordinação.',
    orixaRegente: 'Exu',
    elementos: 'Terra/Fogo',
    quizilas: ['Carne de porco', 'Cachaça em excesso'],
    preceitos: ['Cultivar a paciência', 'Não agir por impulso'],
    ebos: ['Ebó de Caminho/Limpeza']
  },
  2: {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, os caminhos duplos.',
    orixaRegente: 'Ibeji',
    elementos: 'Ar/Terra',
    quizilas: ['Comer ovos', 'Rã'],
    preceitos: ['Manter a alegria interna', 'Cuidar da criança interior'],
    ebos: ['Ebó de Prosperidade']
  },
  // ... continuar para todos os 16 Odús
};

export function calcularOduNascimento(dataNascimento: string): { principal: OduInfo; secundario: OduInfo | null } {
  const numeros = dataNascimento.replace(/\D/g, '');
  
  let soma = 0;
  for (const digito of numeros) {
    soma += parseInt(digito);
  }
  
  // Reduzir até número de Odú (1-16)
  while (soma > 16) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  const principal = odusData[soma] || odusData[1];
  
  // Odú secundário baseado na soma dos dígitos individuais
  const somaSecundaria = numeros.split('').reduce((acc, d) => acc + parseInt(d) * 2, 0);
  const secundarioNum = ((somaSecundaria - 1) % 16) + 1;
  const secundario = odusData[secundarioNum];
  
  return { principal, secundario };
}

export function getQuizilasPorOdu(oduNumero: number): string[] {
  return odusData[oduNumero]?.quizilas || [];
}

export function getPreceitosPorOdu(oduNumero: number): string[] {
  return odusData[oduNumero]?.preceitos || [];
}
```

- [ ] **Step 2: Criar API de Odús**

```typescript
// src/app/api/odus/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calcularOduNascimento, odusData } from '@/lib/odus/calculos';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const data = searchParams.get('data');
  const tipo = searchParams.get('tipo');

  if (!data) {
    return NextResponse.json(
      { error: 'Parâmetro "data" é obrigatório' },
      { status: 400 }
    );
  }

  try {
    if (tipo === 'todos') {
      return NextResponse.json({
        odus: Object.values(odusData),
        timestamp: new Date().toISOString()
      });
    }

    const { principal, secundario } = calcularOduNascimento(data);

    return NextResponse.json({
      principal,
      secundario,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao calcular Odú:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo de Odú' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/odus/ src/app/api/odus/
git commit -m "feat: implementar cálculo de Odús de nascimento"
```

---

## Task 6: Integração Odús → Dashboard

**Files:**
- Modify: `src/app/(dashboard)/perfil/page.tsx`
- Modify: `src/components/dashboard/CalendarioSemanal.tsx`
- Create: `src/lib/hooks/useOdus.ts`

- [ ] **Step 1: Criar hook useOdus**

```typescript
// src/lib/hooks/useOdus.ts
'use client';

import { useState, useEffect } from 'react';

interface OduResult {
  principal: {
    numero: number;
    nome: string;
    significado: string;
    orixaRegente: string;
    quizilas: string[];
    preceitos: string[];
  } | null;
  secundario: {
    numero: number;
    nome: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useOdus(dataNascimento: string): OduResult {
  const [result, setResult] = useState<OduResult>({
    principal: null,
    secundario: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!dataNascimento) {
        setResult(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const res = await fetch(`/api/odus?data=${dataNascimento}`);
        
        if (!res.ok) {
          throw new Error('Erro ao buscar Odú');
        }

        const data = await res.json();
        
        setResult({
          principal: data.principal,
          secundario: data.secundario,
          loading: false,
          error: null
        });
      } catch (err) {
        setResult(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        }));
      }
    }

    fetchData();
  }, [dataNascimento]);

  return result;
}
```

- [ ] **Step 2: Integrar Odú ao perfil**

No `src/app/(dashboard)/perfil/page.tsx`:
- Importar e usar `useOdus`
- Adicionar card mostrando Odú principal e secundário
- Listar quizilas e preceitos

- [ ] **Step 3: Integrar ao Calendário**

No `src/components/dashboard/CalendarioSemanal.tsx`:
- Aceitar `quizilas` como prop
- Filtrar recomendações baseado nas quizilas do usuário

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks/useOdus.ts src/app/\(dashboard\)/perfil/page.tsx src/components/dashboard/CalendarioSemanal.tsx
git commit -m "feat: integrar Odús de nascimento ao perfil e calendário"
```

---

## Checklist de Verificação Final

- [ ] Task 1: Hooks integrados ao dashboard
- [ ] Task 2: Error boundary e página 404 funcionando
- [ ] Task 3: Testes de integração passando
- [ ] Task 4: Deploy em staging funcionando
- [ ] Task 5: Cálculo de Odús implementado
- [ ] Task 6: Odús integrados à interface

---

## Comando de Verificação Final

```bash
npm run lint && npm run test:run && npm run build
```

Se todos passarem, FASE 1 está completa e FASE 2 iniciada!

---

**Plan saved to:** `.trae/documents/2026-05-27-completar-mvp-fase2-odus.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
