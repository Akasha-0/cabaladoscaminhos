# Guia de Contribuição — Cabala dos Caminhos

> **Versão:** 1.0.0  
> **Última atualização:** 2026-06-01  
> **Status:** Ativo

---

## 🎯 Visão Geral

O **Cabala dos Caminhos** é um sistema de autoconhecimento espiritual que conecta múltiplas tradições (Numerologia Cabalística, Odu/Ifá, Astrologia, Numerologia Tântrica) através de correlações inteligentes.

Este guia estabelece padrões e processos para contribuir com o projeto.

---

## 📋 Índice

1. [Começando](#-começando)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Padrões de Código](#-padrões-de-código)
4. [Desenvolvimento de Componentes](#-desenvolvimento-de-componentes)
5. [API e Endpoints](#-api-e-endpoints)
6. [Sistemas Espirituais](#-sistemas-espirituais)
7. [Testes](#-testes)
8. [Documentação](#-documentação)
9. [Processo de Pull Request](#-processo-de-pull-request)
10. [Recursos](#-recursos)

---

## 🚀 Começando

### Pré-requisitos

```bash
# Node.js 20+
node --version  # >= 20.0.0

# npm ou pnpm
npm --version
# ou
pnpm --version

# Git configurado
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Setup Local

```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/cabaladoscaminhos.git
cd cabaladoscaminhos

# 3. Instale dependências
npm install
# ou
pnpm install

# 4. Copie variáveis de ambiente
cp .env.example .env.local

# 5. Edite .env.local com suas credenciais
# Supabase, Stripe, MiniMax, etc.

# 6. Inicie o servidor de desenvolvimento
npm run dev
# ou
pnpm dev
```

### Variáveis de Ambiente Necessárias

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MINIMAX_API_KEY=sua-chave-minimax

# Opcional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
cabaladoscaminhos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── correlation/   # Endpoints de correlação
│   │   │   ├── numerologia/   # Cálculos numerológicos
│   │   │   ├── odu/           # Odús e Ifá
│   │   │   ├── astrologia/    # Mapa natal e trânsitos
│   │   │   └── ...
│   │   ├── (auth)/           # Páginas de autenticação
│   │   ├── dashboard/        # Páginas do dashboard
│   │   └── page.tsx          # Página inicial
│   │
│   ├── components/
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── dashboard/       # Widgets do dashboard
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── astrologia/       # Componentes astrológicos
│   │   └── providers/        # Providers React
│   │
│   ├── lib/
│   │   ├── api/              # Utilitários de API
│   │   ├── ai/               # Integração com MiniMax
│   │   ├── correlation/      # Engine de correlações
│   │   ├── numerologia/      # Cálculos numerológicos
│   │   ├── odu/              # Cálculos de Odús
│   │   ├── astrologia/       # Cálculos astrológicos
│   │   ├── hooks/            # Hooks personalizados
│   │   └── validators/       # Schemas Zod
│   │
│   └── styles/
│       └── globals.css       # Estilos globais
│
├── docs/                      # Documentação
│   ├── API.md                # Referência da API
│   ├── COMPONENTS.md        # Componentes React
│   └── VISION.md            # Visão do projeto
│
├── public/                   # Assets estáticos
├── prisma/                   # Schema do banco
└── package.json
```

---

## 📏 Padrões de Código

### TypeScript

```typescript
// ✅ Use interfaces para tipos de dados
interface UserSpiritualData {
  sign: string;
  numeroPessoal: number;
  odu?: string;
  sefirotDominante?: string[];
  arcoMaior?: number[];
}

// ✅ Use types para unions e computed types
type SpiritualSystem = 'kabbalah' | 'ifa' | 'candomble' | 'tarot' | 'astrology' | 'numerology';

// ✅ Use enums para valores fixos
enum OduType {
  OGBE = 'Ogbe',
  OYEKU = 'Oyeku',
  IWORI = 'Iwori',
  // ...
}
```

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Arquivos de componente | PascalCase | `CorrelationViz.tsx` |
| Arquivos utilitários | camelCase | `calculos.ts`, `validators.ts` |
| Hooks | camelCase com prefixo `use` | `useCreditos.ts`, `useNumerologia.ts` |
| API Routes | kebab-case | `correlation-analyze/route.ts` |
| Variáveis | camelCase | `userData`, `numeroPessoal` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Interfaces | PascalCase | `MapaNatal`, `OduData` |

### Commits

```
feat: adiciona novo widget de correlação
fix: corrige cálculo de odú para datas inválidas
docs: atualiza documentação da API
refactor: simplifica engine de correlações
test: adiciona testes para numerologia tântrica
style: formata código com Prettier
```

---

## 🧩 Desenvolvimento de Componentes

### Estrutura de um Widget

```tsx
// src/components/dashboard/MeuWidget.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface MeuWidgetProps {
  className?: string;
  userData?: UserSpiritualData;
}

export function MeuWidget({ className, userData }: MeuWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/meu-endpoint');
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Título do Widget</CardTitle>
        <Badge variant=\"outline\">Tag</Badge>
      </CardHeader>
      <CardContent>
        {/* Conteúdo */}
      </CardContent>
    </Card>
  );
}
```

### Props opcionais com defaults

```tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ variant = 'default', size = 'md' }: ButtonProps) {
  // ...
}
```

### Componentes Server vs Client

```
Server Components (padrão):
- Renderização inicial
- Fetch de dados
- SEO

Client Components ('use client'):
- Interatividade
- Estados (useState, useEffect)
- Eventos (onClick, onChange)
- Hooks
```

---

## 🔌 API e Endpoints

### Estrutura de uma API Route

```typescript
// src/app/api/meu-recurso/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  param1: z.string().optional(),
  param2: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse({
      param1: searchParams.get('param1'),
      param2: searchParams.get('param2'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Lógica do endpoint
    const result = await processData(parseResult.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 });
  }
}
```

### Resposta Padronizada

```typescript
// Sucesso
{
  "success": true,
  "data": { /* dados */ },
  "timestamp": "2026-06-01T00:00:00Z"
}

// Erro
{
  "success": false,
  "error": "Mensagem de erro",
  "details": { /* detalhes */ }
}
```

### Rate Limiting

```typescript
// Endpoints pagos devem incluir rate limiting
// Verificar lib/api/rate-limit.ts para implementação
```

---

## 🔮 Sistemas Espirituais

### Numerologia Cabalística

```typescript
// Cálculo do caminho de vida
function calcularCaminhoDeVida(data: string): number {
  const digitos = data.replace(/-/g, '');
  let soma = digitos.split('').reduce((acc, d) => acc + parseInt(d), 0);
  
  // Preservar números mestres (11, 22, 33)
  if ([11, 22, 33].includes(soma)) return soma;
  
  while (soma > 9) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  return soma;
}
```

### Odús do Ifá

```typescript
// Cálculo do Odú de nascimento
function calcularOdu(data: string): number {
  const [dia, mes] = data.split('-').map(Number);
  let odu = dia + mes;
  
  // Se > 16, reduzir
  if (odu > 16) {
    odu = odu.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  return odu;
}
```

### Correlação de Sistemas

```typescript
// Estrutura para correlações
interface SpiritualCorrelation {
  source: SpiritualSystem;
  target: string;
  correlation: number; // 0-1
  explanation: string;
  shared_energy: string;
}
```

---

## 🧪 Testes

### Estrutura de Testes

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── numerologia.test.ts
│   │   └── odu.test.ts
│   └── integration/
│       └── api.test.ts
```

### Exemplo de Teste

```typescript
// src/__tests__/unit/numerologia.test.ts

import { describe, it, expect } from 'vitest';
import { calcularPitagorica } from '@/lib/numerologia/calculos';

describe('Numerologia Pitagórica', () => {
  it('deve calcular número corretamente', () => {
    const resultado = calcularPitagorica('Maria');
    expect(resultado).toBeGreaterThan(0);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('deve preservar números mestres', () => {
    // Número mestres: 11, 22, 33
    const resultado = calcularPitagorica('João');
    // Se o resultado for um número mestre, não reduzir
  });
});
```

### Rodar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm test -- --watch

# Cobertura
npm test -- --coverage
```

---

## 📝 Documentação

### Quando atualizar docs?

- ✅ Novo endpoint adicionado
- ✅ Novo componente criado
- ✅ Alteração em lógica de cálculo espiritual
- ✅ Nova integração (API externa)
- ✅ Mudança em variáveis de ambiente

### Formato de Documentação

```markdown
## Nome do Recurso

**Localização:** `caminho/do/arquivo.ts`

**Props/Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| prop1 | string | Sim | Descrição |

**Exemplo:**
\`\`\`tsx
// código de exemplo
\`\`\`

**Notas:**
- Informacao importante 1
- Informacao importante 2
```

---

## 🔀 Processo de Pull Request

### 1. Criar Branch

```bash
# Branch para feature
git checkout -b feat/minha-nova-feature

# Branch para bug fix
git checkout -b fix/correcao-bug

# Branch para documentação
git checkout -b docs/atualizar-api
```

### 2. Desenvolver

```bash
# Faça suas alterações
git add .
git commit -m "feat: descrição da alteração"
```

### 3. Atualizar Documentação

```bash
# Se adicionou endpoint → atualizar API.md
# Se adicionou componente → atualizar COMPONENTS.md
# Se alterou lógica → atualizar VISION.md se necessário
```

### 4. Push e PR

```bash
git push origin feat/minha-nova-feature
```

No GitHub:
1. Criar Pull Request
2. Descrever alterações
3. Adicionar labels (feature, bug, docs)
4. Solicitar revisão

### Checklist do PR

- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem console.log ou debugger
- [ ] Variáveis de ambiente no .env.example

---

## 📚 Recursos

### Links Úteis

| Recurso | URL |
|---------|-----|
| Documentação Next.js | https://nextjs.org/docs |
| Documentação TypeScript | https://www.typescriptlang.org/docs |
| shadcn/ui | https://ui.shadcn.com |
| Zod | https://zod.dev |
| Supabase | https://supabase.com/docs |

### Canais de Comunicação

- **Issues:** GitHub Issues do projeto
- **Discussões:** GitHub Discussions

### Créditos

Este guia foi criado para o projeto **Cabala dos Caminhos**.

---

*Última atualização: 2026-06-01*