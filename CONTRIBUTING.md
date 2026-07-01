# 🙏 Contributing — Cabala dos Caminhos

> **Versão:** 2.0 | **Data:** 2026-07-01 | **Wave:** 33 (GITHUB TEMPLATES 5/8)
> **Idioma:** PT-BR primário (EN inline em seções críticas)
>
> Obrigado por querer contribuir para a **Cabala dos Caminhos** — um projeto de **tecnologia sagrada** que conecta pessoas às suas raízes espirituais através de sistemas místicos ancestrais (cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra).

---

## 📑 Índice

1. [Código de Conduta](#-código-de-conduta)
2. [O que Você Pode Fazer](#-o-que-você-pode-fazer)
3. [Setup Local](#-setup-local)
4. [Workflow de Contribuição](#-workflow-de-contribuição)
5. [Conventions: Commits, Branches, Código](#-convenções)
6. [Testes & Quality Gates](#-testes--quality-gates)
7. [Review Process & CODEOWNERS](#-review-process--codeowners)
8. [Compliance Espiritual & Cultural](#-compliance-espiritual--cultural)
9. [Compliance LGPD](#-compliance-lgpd)
10. [Tradução & Localização](#-tradução--localização)
11. [Comunicação & Suporte](#-comunicação--suporte)
12. [Reconhecimento](#-reconhecimento)

---

## 🤝 Código de Conduta

### Nossos Princípios (Universalismo & Respeito)

A Cabala dos Caminhos é um espaço que celebra a **diversidade de tradições espirituais**. Esperamos que toda interação — issues, PRs, reviews, discussions — siga estes princípios:

- 🌟 **Respeito mútuo** — trate todos com dignidade, independente de tradição, gênero, raça, orientação, classe ou experiência
- 🕊️ **Não-apropriação** — não tomamos o que não é nosso; honramos as origens de cada saber
- 🌱 **Inclusividade** — linguagem acolhedora para praticantes e iniciantes
- 🔬 **Curiosidade respeitosa** — perguntas são bem-vindas; ataques não
- 🤲 **Construtividade** — crítica é ferramenta de melhoria, não arma
- 🕉️ **Humildade epistemológica** — reconhecemos os limites do nosso conhecimento

### O que NÃO Toleramos

- ❌ Comentários ofensivos, discriminatórios ou depreciativos
- ❌ Ataques pessoais, gaslighting, ou trolling
- ❌ Spam, promotional content não solicitado, ou auto-promoção
- ❌ Desrespeito às tradições representadas (ex: deboche de práticas religiosas)
- ❌ Apropriação cultural sem crédito ou contexto
- ❌ Violação de privacidade de outros usuários ou contribuidores
- ❌ Qualquer forma de assédio

### Enforcement

Violações podem resultar em:

1. 🟡 **Warning** — primeiro incidente, pública ou privadamente
2. 🟠 **Temporary ban** — 30 dias da comunidade
3. 🔴 **Permanent ban** — em casos graves ou reincidência

Para reportar violação: `conduct@cabaladoscaminhos.com` (privado).

> 🇺🇸 **EN:** This Code of Conduct is inspired by the Contributor Covenant and adapted for our multi-faith, Brazilian-rooted context.

---

## 💫 O que Você Pode Fazer

| Como contribuir | Canal | Dificuldade |
|-----------------|-------|-------------|
| 🐛 Reportar bug | [Issue → bug report](./.github/ISSUE_TEMPLATE/bug_report.md) | ⭐ |
| 💡 Sugerir feature | [Issue → feature request](./.github/ISSUE_TEMPLATE/feature_request.md) | ⭐ |
| 📚 Melhorar docs | [Issue → doc](./.github/ISSUE_TEMPLATE/documentation.md) ou PR direto | ⭐ |
| ❓ Tirar dúvida | [Issue → question](./.github/ISSUE_TEMPLATE/question.md) ou Discussions | ⭐ |
| 🔒 Reportar vulnerabilidade | [`SECURITY.md`](./.github/SECURITY.md) (privado) | ⭐⭐ |
| 🌙 Validar conteúdo cultural | Issue ou email `curation@cabaladoscaminhos.com` | ⭐⭐ |
| 🧪 Escrever testes | PR para área de QA | ⭐⭐ |
| 💻 Contribuir código | PR + CODEOWNERS review | ⭐⭐⭐ |
| 🎨 Design system | PR + review de `@lina-designer` | ⭐⭐⭐ |
| 🌐 Traduzir | PR para `src/i18n/` ou `docs/i18n/` | ⭐⭐ |

---

## 🚀 Setup Local

### Pré-requisitos

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20.x LTS | Use `volta`, `nvm` ou `fnm` |
| **pnpm** | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` |
| **Git** | 2.40+ | `git lfs install` opcional |
| **Docker** | 24+ | Para Postgres + Redis locais |
| **VSCode** | latest | Extensions: ESLint, Prettier, Tailwind IntelliSense, Prisma |

### Clone & Install

```bash
# 1. Clone o repo
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos

# 2. Instale dependências
pnpm install

# 3. Copie e configure variáveis
cp .env.example .env.local
# Edite .env.local — veja seção "Environment Variables"

# 4. Suba o banco local (Supabase via Docker)
npx supabase start

# 5. Aplique migrations
pnpm db:migrate

# 6. (Opcional) Popule com dados de exemplo
pnpm db:seed

# 7. Rode o dev server!
pnpm dev
# → http://localhost:3000
```

### Environment Variables

Edite `.env.local` — **mínimo para dev local**:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<from supabase start>"
SUPABASE_SERVICE_ROLE_KEY="<from supabase start>"
OPENAI_API_KEY="sk-..."            # opcional em dev (fallback para MiniMax)
NEXTAUTH_SECRET="<openssl rand -base64 32>"
```

> ⚠️ **NUNCA** commite `.env.local` ou qualquer arquivo com secrets. Veja `.gitignore`.

### Verificação Final

Rode os quality gates em paralelo:

```bash
pnpm typecheck        # tsc --noEmit (deve dar TSC=0)
pnpm lint             # ESLint (deve passar sem warnings novos)
pnpm test             # vitest em watch mode
pnpm test:run         # vitest single run (CI mode)
pnpm test:e2e         # playwright E2E
pnpm build            # production build
```

**URLs locais (Supabase CLI):**

- App: <http://localhost:3000>
- Postgres: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio: <http://localhost:54323>
- Mailpit (dev emails): <http://localhost:54324>

Para detalhes completos, veja [`docs/dev/DEVELOPER-GUIDE.md`](./docs/dev/DEVELOPER-GUIDE.md).

---

## 🔄 Workflow de Contribuição

```
┌──────────────┐      ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│ 1. Fork/clone│  →   │ 2. Branch   │  →   │ 3. Develop   │  →   │ 4. Push + PR │
└──────────────┘      └─────────────┘      └──────────────┘      └──────────────┘
                                                                       │
                                                                       ↓
                                                              ┌──────────────────┐
                                                              │ 5. CI + Review   │
                                                              │    (CODEOWNERS)  │
                                                              └──────────────────┘
                                                                       │
                                                                       ↓
                                                              ┌──────────────────┐
                                                              │ 6. Merge 🎉      │
                                                              └──────────────────┘
```

### 1️⃣ Fork ou Clone Direto

- **Contribuidores externos:** faça fork do repo
- **Time interno:** clone direto, work em branch

### 2️⃣ Crie uma Branch

```bash
git checkout -b <type>/<scope>-<short-desc>
```

**Conventions:**

| Tipo | Pattern | Exemplo |
|------|---------|---------|
| Feature | `feat/<scope>-<desc>` | `feat/mapa-adicionar-arvore-vida` |
| Bug fix | `fix/<scope>-<desc>` | `fix/auth-corrigir-magic-link` |
| Docs | `docs/<scope>-<desc>` | `docs/api-atualizar-stripe-endpoint` |
| Refactor | `refactor/<scope>-<desc>` | `refactor/ai-prompts-extrair-base` |
| Test | `test/<scope>-<desc>` | `test/community-cobertura-posts` |
| Chore | `chore/<scope>-<desc>` | `chore/deps-bump-next-16` |

### 3️⃣ Desenvolva

- Faça commits pequenos e focados
- Use Conventional Commits (próxima seção)
- Atualize testes para qualquer mudança de comportamento
- Atualize docs se a mudança é user-facing

### 4️⃣ Push & Abra PR

```bash
git push origin <sua-branch>
# → Abra PR via GitHub UI
# → Preencha o template completo (.github/PULL_REQUEST_TEMPLATE.md)
# → Vincule issues: "Closes #123" ou "Refs #456"
```

### 5️⃣ CI & Review

- **CI** deve estar verde (typecheck + lint + tests + build)
- **CODEOWNERS** atribui reviewers automaticamente
- **2 approves** mínimos para merge (ver [Review Process](#-review-process--codeowners))

### 6️⃣ Merge

- Mantenedor faz merge via "Squash and merge" (mantém histórico limpo)
- Branch é deletada automaticamente
- Release notes geradas automaticamente pelo CI

---

## 📝 Convenções

### Commits (Conventional Commits)

Seguimos [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Description | Exemplo |
|------|-------------|---------|
| `feat` | Nova funcionalidade | `feat(mapa): adicionar visualização da árvore da vida` |
| `fix` | Correção de bug | `fix(auth): corrigir validação de magic link expirado` |
| `docs` | Apenas documentação | `docs(readme): atualizar screenshots` |
| `style` | Formatação (CSS, prettier) | `style(ui): reformular espaçamento do card` |
| `refactor` | Refatoração sem mudança de comportamento | `refactor(ai): extrair prompt base` |
| `perf` | Melhoria de performance | `perf(api): adicionar cache Redis para mapa astral` |
| `test` | Adicionar/corrigir testes | `test(community): cobertura de moderação` |
| `chore` | Manutenção (deps, build) | `chore(deps): bump next to 16.2` |
| `ci` | Mudança em CI/CD | `ci(workflow): adicionar cache de pnpm` |
| `revert` | Reverter commit anterior | `revert: feat(mapa) árvore da vida` |

**Scopes comuns:** `ai`, `auth`, `community`, `curation`, `mapa`, `numerologia`, `astrologia`, `cigano`, `candomblé`, `umbanda`, `ifá`, `cabala`, `tantra`, `payments`, `ui`, `docs`, `infra`.

**Exemplos válidos:**

```bash
git commit -m "feat(mapa): adicionar visualização interativa da árvore da vida"
git commit -m "fix(api): corrigir cálculo de ascendente para datas em hemisfério sul

O cálculo estava usando timezone UTC em vez do timezone local do usuário.
Adicionado teste de regressão para casos BR, PT e AO.

Closes #123"

git commit -m "docs(readme): adicionar seção de contributing

Ref #456"
```

### Branches

Veja tabela na seção [Workflow](#-workflow-de-contribuição).

### TypeScript

```typescript
// ✅ Use interfaces para objetos públicos
interface MapaAlma {
  nome: string;
  dataNascimento: Date;
  numerologia: NumerologiaResults;
}

// ✅ Use types para unions e interseções
type TipoOdu = 'ogbe' | 'oyeku' | 'iwori' | 'o.bará' | 'ika' | 'oturupon';
type ResultadoSacerdote = 'ok' | 'rejeitado' | 'aguarda-revisao';

// ✅ Documente com JSDoc em funções públicas
/**
 * Calcula o número de expressão baseado na data de nascimento.
 * @param dataNascimento Data de nascimento do praticante
 * @returns Resultado com número e breakdown
 */
export function calcularNumeroExpressao(dataNascimento: Date): NumerologiaResults {
  // ...
}

// ❌ Evite `any` — use `unknown` e refine
function processar(input: unknown): Resultado {
  if (!isValidInput(input)) {
    throw new Error('Input inválido');
  }
  // input agora é validado
}
```

### React Components

```tsx
'use client';

import { type FC } from 'react';

interface CardProps {
  titulo: string;
  descricao?: string;
  variant?: 'default' | 'sacred';
  children?: React.ReactNode;
}

/** Card espiritual para dashboard com variant sagrado. */
export const CartaoEspiritual: FC<CardProps> = ({
  titulo,
  descricao,
  variant = 'default',
  children,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6',
        variant === 'sacred' && 'border-sacred-gradient shadow-sacred'
      )}
    >
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {descricao && <p className="text-muted-foreground">{descricao}</p>}
      {children}
    </div>
  );
};
```

### API Routes

```typescript
// src/app/api/mapa/numerologia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calcularNumerologia } from '@/lib/engines/numerologia';
import { rateLimit } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // 1. Auth
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Rate limit
  const rl = await rateLimit({ key: session.user.id, limit: 30 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
  }

  // 3. Input validation
  const data = request.nextUrl.searchParams.get('data');
  if (!data) {
    return NextResponse.json(
      { error: 'Parâmetro "data" é obrigatório' },
      { status: 400 }
    );
  }

  // 4. Business logic
  try {
    const resultado = await calcularNumerologia(new Date(data));
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro no cálculo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### Conventional Comments

Em reviews, usamos [Conventional Comments](https://conventionalcomments.org/) para deixar o tom claro:

- `nit:` — cosmético, opcional
- `suggestion:` — ideia, não bloqueante
- `issue:` — aponta problema, bloqueante
- `question:` — dúvida, precisa resposta
- `thought:` — reflexão, não-pedido
- `praise:` — elogio genuíno

Exemplo:

```
nit: variável pode ser renomeada para `numeroExpressao` para clareza
suggestion: considere extrair `calcularSigno()` para um helper reutilizável
issue: este teste falha quando o input é `null` — adicione caso de borda
question: por que usamos `Date.now()` em vez de `performance.now()`?
praise: essa refatoração deixou o código muito mais legível! 🙏
```

---

## 🧪 Testes & Quality Gates

### Quality Gates (Bloqueiam Merge)

| Gate | Comando | Critério |
|------|---------|----------|
| **TypeScript** | `pnpm typecheck` | TSC = 0 |
| **ESLint** | `pnpm lint` | 0 errors, 0 warnings novos |
| **Vitest** | `pnpm test:run` | 100% pass, coverage ≥ 80% |
| **Playwright E2E** | `pnpm test:e2e` | 100% pass para fluxos críticos |
| **Build** | `pnpm build` | Sucesso sem warnings novos |
| **Bundle size** | CI | Não exceder budget (ver `perf-budgets.yml`) |

### Escrevendo Testes

**Unit (Vitest):**

```typescript
// src/lib/engines/__tests__/numerologia.test.ts
import { describe, it, expect } from 'vitest';
import { calcularNumeroExpressao } from '../numerologia';

describe('calcularNumeroExpressao', () => {
  it('retorna 1 para data 1990-01-01', () => {
    const resultado = calcularNumeroExpressao(new Date('1990-01-01'));
    expect(resultado.numero).toBe(1);
    expect(resultado.breakdown).toEqual([1, 9, 9, 0, 0, 1, 0, 1]);
  });

  it('lança erro para data inválida', () => {
    expect(() => calcularNumeroExpressao(new Date('invalid'))).toThrow();
  });
});
```

**Component (Vitest + Testing Library):**

```tsx
import { render, screen } from '@testing-library/react';
import { CartaoEspiritual } from '../CartaoEspiritual';

describe('CartaoEspiritual', () => {
  it('renderiza título e descrição', () => {
    render(<CartaoEspiritual titulo="Mapa" descricao="Descrição" />);
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });

  it('aplica variant sagrado', () => {
    render(<CartaoEspiritual titulo="X" variant="sacred" />);
    expect(screen.getByRole('heading')).toHaveClass('border-sacred-gradient');
  });
});
```

**E2E (Playwright):**

```typescript
// e2e/mapa.spec.ts
import { test, expect } from '@playwright/test';

test('usuário pode calcular mapa numerológico', async ({ page }) => {
  await page.goto('/mapa');
  await page.fill('[data-testid="data-nascimento"]', '1990-01-01');
  await page.click('[data-testid="calcular"]');
  await expect(page.locator('[data-testid="resultado"]')).toBeVisible();
  await expect(page.locator('[data-testid="resultado"]')).toContainText('Número de Expressão');
});
```

### Coverage

- Mínimo: **80%** para código novo
- Meta: **90%** para engines espirituais e APIs críticas
- Excluir: arquivos de tipo (`*.d.ts`), configs, mocks

---

## 👥 Review Process & CODEOWNERS

### Auto-Assignment via CODEOWNERS

O arquivo [`.github/CODEOWNERS`](./.github/CODEOWNERS) define quem revisa cada área:

- `/src/lib/ai/` → `@akasha-ia-team`
- `/src/lib/curation/` → `@iyá-curator`
- `/src/lib/community/` → `@community-team`
- `/prisma/` → `@data-team`
- `/docs/` → `@docs-team`
- `/src/components/ui/v2/` → `@lina-designer`

Quando você abre PR, GitHub automaticamente atribui reviewers baseado nos arquivos modificados.

### Critérios de Aprovação

| Tipo de PR | Approves necessários | Reviewers |
|------------|----------------------|-----------|
| **Bug fix pequeno** | 1 | CODEOWNER da área |
| **Feature nova** | 2 | CODEOWNER da área + 1 do time core |
| **Refactor grande** | 2 | CODEOWNER + arquitetura |
| **Mudança de schema DB** | 2 | `@data-team` + CTO/lead |
| **Mudança espiritual/cultural** | 2 | `@iyá-curator` + CODEOWNER da área |
| **Mudança LGPD/auth** | 2 | `@security-team` + DPO |
| **Mudança de infra/deploy** | 2 | `@devops-team` + CTO/lead |
| **Release PR** | 3 | Core team + 2 CODEOWNERS |

### SLA de Review

| Severidade | SLA |
|------------|-----|
| 🔴 Critical (security, outage) | 4 horas |
| 🟠 High (broken feature) | 1 dia útil |
| 🟡 Medium (improvement) | 3 dias úteis |
| 🟢 Low (docs, refactor) | 7 dias úteis |

> Se um reviewer não responder dentro do SLA, faça `@` mencione explicitamente ou pingue no Discord.

---

## 🌙 Compliance Espiritual & Cultural

Este projeto lida com **conteúdo sagrado** de múltiplas tradições. Contribuidores devem seguir as **8 Regras Éticas**:

### As 8 Regras

1. **🤲 Não-apropriação** — não tomamos saberes sagrados sem crédito e contexto
2. **📚 Fontes e referências** — sempre cite a fonte (livro, autor, tradição) ao adicionar conteúdo espiritual
3. **🙏 Respeito terminológico** — use termos sagrados na língua original (ex: Yorubá, Hebraico, Romani) com tradução entre parênteses na primeira menção
4. **🚫 Sem generalização** — tradições têm variações regionais e linhagens; evite "todo candomblé faz X" — seja específico sobre nação (Ketu, Jeje, Angola) ou linhagem
5. **✅ Validação cultural** — qualquer conteúdo novo ou modificado passa por `@iyá-curator` (curador) e, quando possível, por consultor da tradição
6. **🔒 Contexto fechado** — alguns saberes são restritos a iniciados; NÃO publique conteúdo esotérico profundo sem autorização explícita
7. **💬 Glossário vivo** — termos novos vão para `src/data/glossario/` com definição, fonte e tradição
8. **🌱 Educação, não conversão** — o app informa sobre tradições; não tenta converter ou doutrinar

### Checklist de Conteúdo Espiritual

Ao adicionar/modificar conteúdo espiritual, o PR deve ter:

- [ ] ✅ Fonte(s) citada(s) — autor, livro, tradição, URL (se pública)
- [ ] ✅ Tradução PT-BR + termo original (quando aplicável)
- [ ] ✅ Atribuição de nação/linhagem (quando aplicável)
- [ ] ✅ Entry no glossário (se termo novo)
- [ ] ✅ Review de `@iyá-curator`
- [ ] ✅ Sem simplificação reducionista
- [ ] ✅ Sem apropriação comercial de saber sagrado

### Em Caso de Dúvida

Antes de adicionar conteúdo espiritual que você não domina, **pergunte**:

- 📧 `curation@cabaladoscaminhos.com`
- 🐛 Issue com template `documentation` ou `question`

---

## 🔒 Compliance LGPD

A Cabala dos Caminhos trata dados de mapa astral, mapa numerológico e preferências espirituais como **dados pessoais sensíveis** sob LGPD Art. 11.

### Obrigações do Contribuidor

Toda PR que toca dados pessoais deve:

- [ ] ✅ Documentar **base legal** (Art. 7) — consentimento, execução de contrato, etc.
- [ ] ✅ Documentar **retenção** — por quanto tempo o dado fica armazenado
- [ ] ✅ Implementar **exportação** (Art. 18, V) — usuário pode baixar seus dados
- [ ] ✅ Implementar **exclusão** (Art. 18, VI) — usuário pode deletar conta
- [ ] ✅ **Anonimização** após período de inatividade
- [ ] ✅ **Logs de auditoria** para acesso a dados pessoais
- [ ] ✅ **Sem leak** em logs, traces, analytics, screenshots
- [ ] ✅ Review de `@security-team`

### Categorias de Dados Sensíveis

| Categoria | Exemplos | Sensibilidade |
|-----------|----------|---------------|
| **Astrológico** | Mapa astral, ascendente, posição de planetas | 🔴 Alta |
| **Numerológico** | Número de expressão, ano pessoal | 🟠 Média |
| **Preferência religiosa** | Tradição declarada (candomblé, umbanda, etc.) | 🔴 Alta (Art. 11) |
| **Dados de saúde mental** | Reflexões pessoais no diário | 🔴 Alta |
| **Geolocalização fina** | Local de nascimento preciso | 🟠 Média |
| **Dados financeiros** | Stripe customer ID, subscription status | 🟠 Média |

### Reportar Vazamento

Se você descobrir vazamento de dados pessoais:

📧 `security@cabaladoscaminhos.com` — SLA **24h** (não 48h).

Veja [`SECURITY.md`](./.github/SECURITY.md) completo.

---

## 🌐 Tradução & Localização

A Cabala dos Caminhos é **PT-BR first** com meta de internacionalização para EN, ES e FR.

### Idiomas Suportados

| Code | Idioma | Status |
|------|--------|--------|
| `pt-BR` | Português (Brasil) | ✅ Source of truth |
| `en-US` | English | 🟡 Em progresso |
| `es-LA` | Español (Latam) | 🔴 Planejado |
| `fr-FR` | Français | 🔴 Planejado |

### Estrutura

```
src/
├── i18n/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── mapa.json
│   │   └── ...
│   └── en-US/
│       └── ...
└── lib/
    └── i18n.ts        # hook useTranslation, getServerTranslation
```

### Convenções

- **Nunca hardcode strings em componentes** — sempre use `t('chave')`
- **Chaves descritivas** — `mapa.calcular.button` em vez de `btn1`
- **Variáveis em `{{}}`** — `t('saudacao', { nome: 'Ana' })` → `'Olá, Ana'`
- **Pluralização** — use ICU MessageFormat: `{count, plural, one {# mensagem} other {# mensagens}}`

### Como Contribuir com Tradução

1. Fork o repo
2. Edite/crie arquivo em `src/i18n/<idioma>/`
3. Rode `pnpm i18n:check` para validar completude
4. Abra PR com label `i18n`, `translation`

---

## 💬 Comunicação & Suporte

| Canal | Uso | SLA |
|-------|-----|-----|
| 🐛 GitHub Issues | Bug reports, feature requests | Triagem 3 dias |
| 💬 GitHub Discussions | Perguntas gerais, ideias | Comunidade |
| 📧 security@ | Vulnerabilidades (privado) | 48h |
| 📧 conduct@ | Violações de código de conduta | 24h |
| 📧 curation@ | Validação cultural | 5 dias |
| 💬 Discord | Chat da comunidade, suporte rápido | Comunidade |

### Quando Abrir Issue vs Discussion

- **Issue:** algo concreto para fazer (bug, feature, doc)
- **Discussion:** pergunta aberta, brainstorming, showcase

---

## 🌟 Reconhecimento

Contribuidores são reconhecidos em:

- 📜 [`CONTRIBUTORS.md`](./CONTRIBUTORS.md) _(em breve)_
- 🏆 Hall of Fame em [`SECURITY.md`](./.github/SECURITY.md) — para quem reporta vulnerabilidades
- 🎉 Release notes — toda release menciona contribuidores novos
- 💌 Email direto — para contribuições excepcionais

---

## 📚 Recursos Adicionais

### Documentação Interna

- [`docs/dev/DEVELOPER-GUIDE.md`](./docs/dev/DEVELOPER-GUIDE.md) — guia completo de dev
- [`docs/AI-ETHICS-AUDIT-W30.md`](./docs/AI-ETHICS-AUDIT-W30.md) — auditoria de ética em IA
- [`docs/AKASHA-IA-QUALITY-W32.md`](./docs/AKASHA-IA-QUALITY-W32.md) — qualidade da Akasha IA
- [`docs/PERFORMANCE-W32.md`](./docs/PERFORMANCE-W32.md) — performance budgets
- [`docs/TEST-COVERAGE-W32.md`](./docs/TEST-COVERAGE-W32.md) — cobertura de testes

### Externos

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Conventional Comments](https://conventionalcomments.org/)
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 🙏 Lembretes Espirituais

> *"Assim como é em cima, também é embaixo."* — Hermes Trismegisto

- 🕉️ Cada commit é um ato de serviço
- 🌱 Cada bug corrigido é uma transmutação
- ✨ Cada feature adicionada é uma expansão da consciência
- 🤝 Cada review respeitoso é uma oferenda

---

## 📝 Histórico de Versões deste Arquivo

| Versão | Data | Wave | Mudanças |
|--------|------|------|----------|
| 2.0 | 2026-07-01 | W33 | Reescrita completa: governance, LGPD, 8 regras éticas, CODEOWNERS |
| 1.0 | 2026-05-30 | W-pre | Versão inicial básica |

---

**Dúvidas?** Abra uma issue com o template [`question`](./.github/ISSUE_TEMPLATE/question.md) ou entre na [discussion da comunidade](https://github.com/Akasha-0/cabaladoscaminhos/discussions).

🙏 **Obrigado por fazer parte desta jornada!** 🌟