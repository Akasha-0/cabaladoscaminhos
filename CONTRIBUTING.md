# Contributing Guide - Cabala dos Caminhos

Guia para contribuição no projeto Cabala dos Caminhos.

## Configuração Local

### 1. Pré-requisitos

- Node.js 20+
- npm ou bun
- PostgreSQL (via Supabase ou local)
- Conta no Supabase (para autenticação)
- Conta no Stripe (para pagamentos)

### 2. Clonar e Instalar

```bash
git clone <repo-url>
cd cabala-dos-caminhos
npm install
```

### 3. Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Prisma
DATABASE_URL=postgresql://usuario:senha@localhost:5432/cabala

# Auth JWT (opcional, para rotas legacy)
JWT_SECRET=seu-secret-aqui
```

### 4. Configurar Banco

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrations
npm run db:push

# (Opcional) Studio Prisma
npm run db:studio
```

### 5. Iniciar Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Estrutura do Projeto

```
cabala-dos-caminhos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Páginas de autenticação
│   │   ├── (dashboard)/       # Páginas do dashboard
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── numerologia/
│   │   │   └── ...
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn)
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── auth/              # Componentes de auth
│   │   └── astrologia/        # Componentes astrológicos
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── ai/                # Integração OpenAI
│   │   ├── astrologia/        # Cálculos astrológicos
│   │   ├── chat/              # Serviço de chat
│   │   ├── credits/           # Sistema de créditos
│   │   ├── numerologia/       # Cálculos numerológicos
│   │   ├── odus/              # Cálculos de Odús
│   │   ├── data/              # Dados espirituais
│   │   └── auth-jwt/          # Helper JWT
│   ├── hooks/                 # React hooks customizados
│   └── middleware.ts          # Middleware Next.js
├── prisma/
│   └── schema.prisma          # Schema do banco
├── tests/                     # Testes
│   ├── lib/
│   ├── hooks/
│   ├── api/
│   └── integration/
├── docs/                      # Documentação
└── public/                    # Arquivos estáticos
```

---

## Convenções de Código

### TypeScript

- Use Tipos explicitamente para estruturas de dados
- Prefira `interface` para objetos públicos
- Use `type` para unions e alias

```typescript
// Bom
interface Usuario {
  id: string;
  email: string;
  nome: string;
}

// Bom
type TemaChat = 'relacionamento' | 'trabalho' | 'dinheiro';
```

### Nomenclatura

- **Arquivos de componentes**: PascalCase (`InsightDiario.tsx`)
- **Arquivos de utilities**: camelCase (`calcularPitagorica.ts`)
- **Funções e variáveis**: camelCase (`buscarHistorico`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_CREDITOS`)

### Imports

Organize imports na seguinte ordem:
1. Dependências externas (React, Next, etc.)
2. Dependências do projeto (@/components, @/lib)
3. Tipos locais
4. Utilitários locais

```typescript
import React from 'react';                    // externo
import { Button } from '@/components/ui/button'; // projeto
import type { Usuario } from '@/lib/types';    // tipos
import { formatDate } from '@/lib/utils';      // utils
```

### Componentes React

- Use `'use client'` apenas quando necessário (interatividade)
- Exporte componentes como funções nomeadas
- Documente props com JSDoc quando complexo

```tsx
'use client';

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Card component for dashboard content.
 */
export function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
```

### API Routes

- Valide inputs com Zod
- Retorne erros significativos
- Use status codes HTTP corretos

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const data = searchParams.get('data');

  if (!data) {
    return NextResponse.json(
      { error: 'Parâmetro "data" é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const resultado = await calcular(data);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

---

## Fluxo de Trabalho Git

### 1. Criar Branch

```bash
git checkout -b feat/nome-da-funcionalidade
# ou
git checkout -b fix/correcao-de-bug
# ou
git checkout -b docs/atualizar-documentacao
```

### 2. Commits

Use Conventional Commits:

```bash
# Feature
git commit -m "feat: adicionar cálculo de ciclos temporais"

# Bug fix
git commit -m "fix: corrigir rate limit no chat"

# Docs
git commit -m "docs: atualizar API reference"

# Refactor
git commit -m "refactor: extrair validadores para módulo separado"

# Test
git commit -m "test: adicionar testes para hook useNumerologia"
```

### 3. Push e PR

```bash
git push origin feat/nome-da-funcionalidade
```

Crie Pull Request no GitHub com:
- Descrição clara do que foi feito
- Screenshots se aplicável
- Links para issues relacionados
- Checklist de verificação

---

## Checklist de PR

- [ ] Código compila sem erros
- [ ] Testes passam (`npm run test:run`)
- [ ] Lint passa (`npm run lint`)
- [ ] Commits seguem Conventional Commits
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem console.log de debug
- [ ] Variáveis sensíveis não commitadas

---

## Padrões de Testes

### Estrutura

```
tests/
├── lib/
│   └── numerologia/
│       └── calculos.test.ts
├── hooks/
│   └── useNumerologia.test.ts
├── api/
│   └── numerologia.test.ts
└── integration/
    └── api-routes.test.ts
```

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { calcularPitagorica } from '@/lib/numerologia/calculos';

describe('calcularPitagorica', () => {
  it('deve calcular número corretamente', () => {
    const resultado = calcularPitagorica('MARIA');
    expect(resultado).toBeGreaterThan(0);
  });

  it('deve reduzir para número de dígito único', () => {
    const resultado = calcularPitagorica('TESTE');
    expect(resultado).toBeLessThanOrEqual(9);
  });
});
```

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes específicos
npm run test:run src/tests/lib/numerologia

# Modo watch
npm run test
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar servidor de produção |
| `npm run lint` | Verificar código com ESLint |
| `npm run test` | Executar testes (watch mode) |
| `npm run test:run` | Executar testes uma vez |
| `npm run db:generate` | Gerar cliente Prisma |
| `npm run db:push` | Aplicar schema ao banco |
| `npm run db:migrate` | Criar migration |
| `npm run db:studio` | Abrir Prisma Studio |

---

## Bibliotecas Principais

### UI
- **shadcn/ui** - Sistema de componentes base
- **tailwindcss** - Estilização
- **lucide-react** - Ícones

### Backend
- **Next.js 16** - Framework full-stack
- **Prisma** - ORM
- **Supabase** - Auth e banco
- **Stripe** - Pagamentos

### Utilities
- **Zod** - Validação de schemas
- **Zustand** - Gerenciamento de estado
- **Vitest** - Testes

---

## Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://prisma.io/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)

---

## Dúvidas?

Abra uma issue no repositório com a tag `question`.