# Próximos Passos - Cabala dos Caminhos

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar o Sprint 4 (Integração e MVP) e preparar o projeto para testes e deploy.

**Architecture:** Implementar integração de APIs com estados de loading/error, limpar warnings de lint, adicionar preferências de usuário, e preparar para testes MVP.

**Tech Stack:** Next.js 16, TypeScript, React Query (ou SWR), Prisma, Supabase

---

## Resumo do Progresso Atual

### ✅ Concluído
- **Sprint 1**: Setup completo (Next.js, TypeScript, Prisma, Supabase, shadcn/ui)
- **Sprint 2**: Módulos de cálculo (Numerologia, Ciclos Temporais, Base de conhecimento)
- **Sprint 3**: Dashboard, Calendário, Chat, Perfil implementados
- **Sprint 4**: Parcialmente iniciado

### 📋 Pendente

| Tarefa | Descrição | Prioridade |
|--------|-----------|------------|
| 4.1.1-4.1.3 | Integração de APIs com estados de loading/error | Alta |
| 4.2.4 | Preferências de usuário | Média |
| 4.3.1-4.3.4 | Testes MVP | Alta |
| ESLint | Warnings de imports não utilizados | Baixa |
| 4.3.5 | Deploy staging | Alta |

---

## Task 1: Integração de APIs com Estados de Loading/Error

**Files:**
- Create: `src/lib/hooks/useNumerologia.ts`
- Create: `src/lib/hooks/useCiclos.ts`
- Modify: `src/app/(dashboard)/perfil/page.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Criar hook useNumerologia**

```typescript
// src/lib/hooks/useNumerologia.ts
'use client';

import { useState, useEffect } from 'react';

interface NumerologiaResult {
  pitagorica: number | null;
  cabalistica: number | null;
  tantrica: number | null;
  loading: boolean;
  error: string | null;
}

export function useNumerologia(nome: string, dataNascimento: string): NumerologiaResult {
  const [result, setResult] = useState<NumerologiaResult>({
    pitagorica: null,
    cabalistica: null,
    tantrica: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [pitagoricaRes, cabalisticaRes] = await Promise.all([
          fetch(`/api/numerologia?tipo=pitagorica&nome=${encodeURIComponent(nome)}`),
          fetch(`/api/numerologia?tipo=cabalistica&nome=${encodeURIComponent(nome)}`)
        ]);

        if (!pitagoricaRes.ok || !cabalisticaRes.ok) {
          throw new Error('Erro ao buscar dados numerológicos');
        }

        const pitagoricaData = await pitagoricaRes.json();
        const cabalisticaData = await cabalisticaRes.json();

        // Cálculo local da tantrica (não precisa de API)
        const numeros = dataNascimento.replace(/\D/g, '');
        let soma = 0;
        for (const digito of numeros) {
          soma += parseInt(digito);
        }
        while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
          soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
        }

        setResult({
          pitagorica: pitagoricaData.numero,
          cabalistica: cabalisticaData.numero,
          tantrica: soma,
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

    if (nome && dataNascimento) {
      fetchData();
    }
  }, [nome, dataNascimento]);

  return result;
}
```

- [ ] **Step 2: Criar hook useCiclos**

```typescript
// src/lib/hooks/useCiclos.ts
'use client';

import { useState, useEffect } from 'react';

interface CiclosResult {
  ano: { numero: number; sefirot: string } | null;
  mes: { numero: number; sefirot: string } | null;
  dia: { numero: number; sefirot: string } | null;
  loading: boolean;
  error: string | null;
}

export function useCiclos(dataNascimento: string): CiclosResult {
  const [result, setResult] = useState<CiclosResult>({
    ano: null,
    mes: null,
    dia: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ciclos?data=${dataNascimento}&tipo=todos`);
        
        if (!res.ok) {
          throw new Error('Erro ao buscar ciclos');
        }

        const data = await res.json();
        
        setResult({
          ano: { numero: data.ciclos.anoPessoal, sefirot: data.ciclos.sefirotAno },
          mes: { numero: data.ciclos.mesPessoal, sefirot: data.ciclos.sefirotMes },
          dia: { numero: data.ciclos.diaPessoal, sefirot: data.ciclos.sefirotDia },
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

    if (dataNascimento) {
      fetchData();
    }
  }, [dataNascimento]);

  return result;
}
```

- [ ] **Step 3: Atualizar perfil para usar hooks**

Modificar `src/app/(dashboard)/perfil/page.tsx`:
- Substituir cálculos locais por `useNumerologia` e `useCiclos`
- Adicionar estados de loading (spinner/skeleton)
- Adicionar tratamento de error (mensagem amigável)

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks/ src/app/\(dashboard\)/perfil/page.tsx
git commit -m "feat: adicionar hooks de integração com APIs e estados de loading/error"
```

---

## Task 2: Preferências de Usuário

**Files:**
- Modify: `src/lib/store/userPreferences.ts` (criar se não existir)
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Definir schema de preferências**

```typescript
// src/lib/store/userPreferences.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  tema: 'mystical' | 'minimal' | 'cosmic';
  notifications: boolean;
  quizilas: string[];
  orixaFavorito: string | null;
  setTema: (tema: 'mystical' | 'minimal' | 'cosmic') => void;
  setNotifications: (enabled: boolean) => void;
  addQuizila: (quizila: string) => void;
  removeQuizila: (quizila: string) => void;
  setOrixaFavorito: (orixa: string | null) => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      tema: 'mystical',
      notifications: true,
      quizilas: [],
      orixaFavorito: null,
      setTema: (tema) => set({ tema }),
      setNotifications: (notifications) => set({ notifications }),
      addQuizila: (quizila) => set((state) => ({
        quizilas: [...new Set([...state.quizilas, quizila])]
      })),
      removeQuizila: (quizila) => set((state) => ({
        quizilas: state.quizilas.filter(q => q !== quizila)
      })),
      setOrixaFavorito: (orixaFavorito) => set({ orixaFavorito }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
```

- [ ] **Step 2: Criar componente de Settings**

```tsx
// src/components/dashboard/UserSettings.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/lib/store/userPreferences';
import { Moon, Sun, Sparkles, Bell, BellOff, Trash2 } from 'lucide-react';

export function UserSettings() {
  const { 
    tema, 
    notifications, 
    quizilas,
    setTema, 
    setNotifications,
    removeQuizila 
  } = useUserPreferences();

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-cinzel text-primary">
          Configurações
        </CardTitle>
        <CardDescription className="font-raleway">
          Personalize sua experiência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tema</label>
          <div className="flex gap-2">
            <Button
              variant={tema === 'mystical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('mystical')}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Místico
            </Button>
            <Button
              variant={tema === 'minimal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('minimal')}
            >
              <Moon className="w-4 h-4 mr-1" />
              Minimalista
            </Button>
            <Button
              variant={tema === 'cosmic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('cosmic')}
            >
              <Sun className="w-4 h-4 mr-1" />
              Cósmico
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notificações</label>
          <Button
            variant={notifications ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNotifications(!notifications)}
          >
            {notifications ? <Bell className="w-4 h-4 mr-1" /> : <BellOff className="w-4 h-4 mr-1" />}
            {notifications ? 'Ativadas' : 'Desativadas'}
          </Button>
        </div>

        {quizilas.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Suas Quizilas</label>
            <div className="flex flex-wrap gap-2">
              {quizilas.map((quizila) => (
                <Badge key={quizila} variant="secondary" className="text-xs">
                  {quizila}
                  <button
                    onClick={() => removeQuizila(quizila)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Instalar Zustand**

```bash
npm install zustand
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/store/ src/components/dashboard/UserSettings.tsx package.json
git commit -m "feat: adicionar sistema de preferências do usuário com Zustand"
```

---

## Task 3: Limpeza de ESLint Warnings

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`
- Modify: `src/app/(dashboard)/calendario/page.tsx`
- Modify: `src/app/(dashboard)/perfil/page.tsx`
- Modify: `src/components/dashboard/*.tsx`
- Modify: `src/components/ui/*.tsx`

- [ ] **Step 1: Identificar e remover imports não utilizados**

Para cada arquivo com warning, remover imports marcados como "defined but never used".

Arquivos afetados (baseado no lint output):
- `src/app/(dashboard)/page.tsx`: Remover BookOpen, Grid3X3, Sparkles, Heart
- `src/app/(dashboard)/calendario/page.tsx`: Remover Moon
- `src/app/(dashboard)/perfil/page.tsx`: Remover orixas (se não usado)
- `src/components/dashboard/CalendarioSemanal.tsx`: Remover Heart, Wind, orixas, getOrixasDoDia, filtrarQuizilas
- `src/components/dashboard/DiaSpiritual.tsx`: Remover Droplets, Leaf, orixa
- `src/components/dashboard/DashboardNav.tsx`: Remover Sun, Grid3X3
- `src/components/dashboard/OdusExplorer.tsx`: Remover Shield
- `src/components/dashboard/OrixasExplorer.tsx`: Remover Leaf

- [ ] **Step 2: Corrigir erros de sintaxe**

- `src/components/ui/label.tsx` e `textarea.tsx`: Mudar interface vazia para type
- `src/components/dashboard/CartasLenormand.tsx`: Corrigir quotes não escapados

```typescript
// Mudar de:
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Para:
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/
git commit -m "chore: limpar warnings de lint e corrigir erros de sintaxe"
```

---

## Task 4: Testes MVP

**Files:**
- Create: `tests/dashboard/perfil.test.tsx`
- Create: `tests/dashboard/calendario.test.tsx`
- Create: `tests/api/numerologia.test.ts`
- Modify: `vitest.config.ts` (se não existir)

- [ ] **Step 1: Setup Vitest**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2: Teste de integração de API de numerologia**

```typescript
// tests/api/numerologia.test.ts
import { describe, it, expect } from 'vitest';
import { calcularPitagorica, calcularCabalistica, calcularTantrica } from '@/lib/numerologia';

describe('Cálculos Numerológicos', () => {
  it('deve calcular numerologia pitagórica corretamente', () => {
    const resultado = calcularPitagorica('Maria');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve calcular numerologia cabalística corretamente', () => {
    const resultado = calcularCabalistica('João');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve calcular numerologia tântrica corretamente', () => {
    const resultado = calcularTantrica('1990-06-15');
    expect(typeof resultado).toBe('number');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });
});
```

- [ ] **Step 3: Teste de página de perfil**

```typescript
// tests/dashboard/perfil.test.tsx
import { render, screen } from '@testing-library/react';
import { PerfilPage } from '@/app/(dashboard)/perfil/page';

describe('Página de Perfil', () => {
  it('deve renderizar o título', () => {
    render(<PerfilPage />);
    expect(screen.getByText('Seu Perfil Espiritual')).toBeInTheDocument();
  });

  it('deve exibir seção de números do destino', () => {
    render(<PerfilPage />);
    expect(screen.getByText('Números do Destino')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add tests/ vitest.config.ts package.json
git commit -m "test: adicionar testes para APIs e páginas do MVP"
```

---

## Task 5: Deploy Staging

**Files:**
- Modify: `.env.example`
- Create: `vercel.json` (se necessário)

- [ ] **Step 1: Verificar variáveis de ambiente**

Criar `.env.example` com todas as variáveis necessárias:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Optional
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
```

- [ ] **Step 2: Configurar vercel.json**

```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

- [ ] **Step 3: Commit e deploy**

```bash
git add .env.example vercel.json
git commit -m "chore: preparar configuração para deploy staging"
git push
# Deploy via Vercel dashboard ou CLI
```

---

## Checklist de Verificação Final

- [ ] Task 1: Hooks de API funcionando com loading/error states
- [ ] Task 2: Preferências de usuário salvas no localStorage
- [ ] Task 3: `npm run lint` executa sem erros (apenas warnings aceitáveis)
- [ ] Task 4: Testes passam (`npm run test`)
- [ ] Task 5: Deploy em staging funcionando
- [ ] Verificar que todas as páginas carregam sem erros no browser

---

## Comando de Verificação Final

```bash
npm run lint && npm run build && npm run test
```

Se todos passarem, o MVP está pronto para produção.

---

**Plan saved to:** `.trae/documents/2026-05-27-proximos-passos-implementacao.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
