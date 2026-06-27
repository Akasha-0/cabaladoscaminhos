# Test Setup — Community Portal (Akasha)

> Documentação dos testes automatizados dos componentes UI da comunidade
> (`feat/community-platform`). Cobre instalação, execução, arquitetura
> dos mocks, troubleshooting e extensão futura.

---

## 1. Stack de testes

| Camada                       | Ferramenta                                | Versão  |
| ---------------------------- | ----------------------------------------- | ------- |
| Test runner                  | [Vitest](https://vitest.dev)              | ^4.1.7  |
| DOM                          | [jsdom](https://github.com/jsdom/jsdom)   | ^29.1.1 |
| Render React                 | `@testing-library/react`                  | ^16.3.2 |
| Eventos / interação          | `@testing-library/user-event`             | ^14.6.1 |
| Matchers de DOM              | `@testing-library/jest-dom`               | ^6.9.1  |
| Plugin Vite + React          | `@vitejs/plugin-react`                    | ^6.0.2  |

Tudo já está instalado em `devDependencies`. **Nenhum `npm install` extra é
necessário** para rodar os testes.

---

## 2. Arquivos de configuração

### 2.1 `vitest.config.ts` (já existente na raiz)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    exclude: [
      'node_modules/**',
      '**/*.test.skip',
      '**/*.test.disabled',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Pontos-chave:

- `environment: 'jsdom'` — emula DOM em memória (necessário pra
  `screen.getByRole` etc.).
- `globals: true` — habilita `describe/it/expect/vi` globais. Os testes não
  precisam importar de `'vitest'` no topo, mas fazem por **convenção e
  clareza**.
- `setupFiles: ['./tests/setup.ts']` — carrega o setup global antes de cada
  arquivo de teste.
- `resolve.alias['@']` — espelha o alias do `tsconfig.json` pra que os testes
  consigam resolver `@/components/...`.

### 2.2 `tests/setup.ts` (já existente)

```ts
import '@testing-library/jest-dom';
```

Adiciona matchers semânticos como `toBeInTheDocument`, `toHaveClass`,
`toBeVisible` etc. ao `expect`.

### 2.3 `tsconfig.json`

Já inclui `"types": ["vitest/globals"]`, então o TypeScript reconhece
`describe`, `it`, `expect` etc. sem import.

---

## 3. Scripts npm

Adicionado em `package.json`:

```json
"test": "vitest",
"test:run": "vitest run",
"test:community": "vitest run src/components/community/__tests__"
```

| Comando                | O que faz                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| `npm test`             | Modo watch (re-roda ao salvar).                                     |
| `npm run test:run`     | Roda **uma vez** todos os testes do projeto.                       |
| `npm run test:community` | Roda **apenas** os 5 arquivos da comunidade (escopo deste PR).    |

---

## 4. Layout dos testes

```
src/components/community/
├── CommunityNav.tsx
├── CommunityShell.tsx
└── __tests__/
    ├── _mocks.tsx              # helpers compartilhados (vi.mock)
    ├── CommunityNav.test.tsx
    ├── CommunityShell.test.tsx
    ├── feed-page.test.tsx
    ├── library-page.test.tsx
    └── notifications-page.test.tsx
```

Cada arquivo cobre um componente (ou página), e todos importam o helper
central `_mocks.tsx` na primeira linha do `describe` (lado de efeito):
`import './_mocks';`.

---

## 5. O helper `_mocks.tsx` — por que existe?

O componente `CommunityNav` e a página `/notifications` importam
`@/components/ui/avatar`, mas **esse arquivo não existe** no projeto (o
diretório `src/components/ui/` só tem `button`, `card`, `input`,
`tabs`, `textarea`, `badge`, etc.).

Sem o mock, **todos os testes da comunidade quebrariam em tempo de
importação**, porque o Vite/Vitest não consegue resolver o módulo.

`_mocks.tsx` registra:

| Mock                        | Por quê                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `next/navigation`           | `usePathname()` é um hook client do Next 16; precisamos de um stub previsível.           |
| `next/link`                 | Em jsdom o `next/link` original não é necessário; um `<a>` simples basta.                |
| `@/components/ui/avatar`    | Módulo inexistente. Stub com `Avatar`/`AvatarImage`/`AvatarFallback` para `data-testid`. |
| `@/components/ui/tabs`      | Stub defensivo (mesmo que `feed/page.tsx` não use `Tabs`, deixamos preparado).           |

Para sobrescrever o pathname em um teste:

```ts
import { usePathnameMock } from './_mocks';
usePathnameMock.mockReturnValue('/library');
```

`resetCommunityMocks()` (chamado em `beforeEach`) reinicia o pathname
para `/feed`.

---

## 6. Cobertura de testes (resumo)

### 6.1 `CommunityNav.test.tsx` — 21 casos

- Renderização básica (deslogado / logado).
- Estados: sem user, com user, contador de notificações, badge `9+`.
- Link ativo baseado em `usePathname`.
- Handlers: `onSearch` ao digitar, abrir/fechar busca, abrir menu mobile,
  fechar menu mobile ao clicar em link, abrir profile dropdown.

### 6.2 `CommunityShell.test.tsx` — 8 casos

- Render sem crash, children aparecem, tag `<main>` envolve o conteúdo.
- Propagação de `user` para o `CommunityNav` interno.
- Múltiplos children em ordem.

### 6.3 `feed-page.test.tsx` — 23 casos

- Render inicial (4 posts mock, subheadline, filtros).
- **PostCard**: like (toggle de contador), bookmark (classe
  `text-amber-400`), comentário e share (handler loga o id).
- **Filtros**: Tudo / Seguindo / Meus grupos / Tendências — apenas um
  ativo por vez.
- **ComposeBox**: Publicar oculto até focar; desabilitado vazio;
  habilita com texto; cria post; limpa textarea.
- **Sidebar**: "Tradições em destaque", sugestões da IA, CTA de mapa.

### 6.4 `library-page.test.tsx` — 22 casos

- Render inicial (8 artigos).
- **Filtros isolados**: tradição (cabala → 2), tipo (Paper → 3),
  evidência (Meta-análise → 2).
- **Busca textual**: por título, por summary, case-insensitive.
- **Filtros combinados** (AND entre categorias).
- **Sort**: Recente (default ativo) / Popular (primeiro = mais leituras).
- **Empty state** com botão "Limpar filtros".
- Singular/plural ("1 artigo" vs "N artigos").

### 6.5 `notifications-page.test.tsx` — 16 casos

- Render inicial (7 mocks, contador "3 não lidas", chips com count).
- Filtro "Tudo" / "Não lidas".
- Marcar individualmente (remove do filtro, atualiza contador).
- "Marcar todas como lidas" zera contador, esconde botão.
- Empty state.
- Links corretos (`/u/<handle>`, `/post/<id>`, `/library#a1`).
- Indicadores visuais (border `amber` vs `slate`).

**Total: ~90 casos cobrindo os 5 escopos definidos.**

---

## 7. Padrões adotados nos testes

1. **Convenções BDD**: cada arquivo tem `describe(Component) → describe(área) → it(cenário)`.
2. **`screen.getByRole`** preferido sobre `getByText` quando o nó
   tem papel semântico (botões, links, headings).
3. **`userEvent`** para fluxos com foco/typing (substitui `fireEvent.change`
   + `fireEvent.click`).
4. **`expect(...).toBeTruthy()`** em vez de `toBeInTheDocument()` por
   compatibilidade — funciona em qualquer versão do `@testing-library/jest-dom`.
5. **Mocks no topo** via `vi.mock(...)` (registrado antes do import do
   componente, com hoisting).
6. **`beforeEach`** sempre chama `resetCommunityMocks()` para isolar testes.
7. **Logs esperados** (`console.log` em handlers de comentário/share) são
   silenciados com `vi.spyOn(console, 'log').mockImplementation(() => {})`.

---

## 8. Como rodar

```bash
# Apenas comunidade (rápido)
npm run test:community

# Watch mode para um arquivo
npx vitest src/components/community/__tests__/CommunityNav.test.tsx

# Tudo do projeto
npm run test:run
```

Saída esperada (resumida):

```
RUN v4.1.7 /workspace/cabaladoscaminhos

✓ src/components/community/__tests__/CommunityNav.test.tsx  (21 tests)
✓ src/components/community/__tests__/CommunityShell.test.tsx (8 tests)
✓ src/components/community/__tests__/feed-page.test.tsx     (23 tests)
✓ src/components/community/__tests__/library-page.test.tsx  (22 tests)
✓ src/components/community/__tests__/notifications-page.test.tsx (16 tests)

Test Files  5 passed
Tests       ~90 passed
```

---

## 9. Verificação de TypeScript

Antes de commitar:

```bash
npx tsc --noEmit --skipLibCheck
```

Deve retornar **0 erros**. Os testes são `.tsx` e respeitam o `tsconfig`
existente (que já inclui `"types": ["vitest/globals"]`).

> ⚠️ O `tsc` em uma primeira execução pode ser lento se o cache estiver
> frio. Builds subsequentes usam o cache incremental em `.tsbuildinfo`.

---

## 10. Troubleshooting

### 10.1 "Cannot find module '@/components/ui/avatar'"

Causa: módulo importado por `CommunityNav.tsx` e páginas de feed/notification
que **não existe** no projeto. O `_mocks.tsx` intercepta isso via `vi.mock`.

Se você ver o erro, garanta que o arquivo `_mocks.tsx` foi importado
**antes** do componente em cada suite:

```ts
import './_mocks';            // <-- PRIMEIRO (registra vi.mock)
import { Component } from '@/...';
```

### 10.2 "usePathname is not a function" / hook retornando undefined

`usePathname` foi mockado em `_mocks.tsx`. Se você sobrescrever manualmente
em um teste, lembre de resetar com `resetCommunityMocks()` em `beforeEach`.

### 10.3 Testes lentos / travando (RAM baixa)

Se o host tiver pouca RAM e o Vitest estourar:

```bash
# Roda 1 arquivo por vez com --no-isolate
npx vitest run src/components/community/__tests__/CommunityShell.test.tsx --no-isolate
```

Ou use `--pool=forks --poolOptions.forks.singleFork=true`:

```bash
npx vitest run src/components/community/__tests__ \
  --pool=forks \
  --poolOptions.forks.singleFork=true
```

Em último caso, executar **um arquivo por vez** (acima) é a alternativa
proposta na task.

### 10.4 "next/link não funciona em jsdom"

Já tratado pelo mock de `next/link` em `_mocks.tsx`. Se você criar uma
suite nova que renderiza diretamente `<Link>`, **importe `_mocks.tsx`
antes** do componente.

### 10.5 Estilo (Tailwind) em produção não bate com o de teste

Os testes verificam **classes** (`text-amber-400`, `from-amber-500/20`),
não estilos computados. Se a UI mudar a paleta, basta atualizar as
strings nos testes.

---

## 11. Extensão futura

Quando novos componentes da comunidade surgirem (ex.: `CommunitySidebar`,
`ComposeArticle`, `GroupHeader`), crie um arquivo
`src/components/community/__tests__/<Nome>.test.tsx` seguindo o mesmo
padrão:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import './_mocks';               // ← sempre primeiro
import { resetCommunityMocks } from './_mocks';

import { NovoComponente } from '@/components/community/NovoComponente';

describe('NovoComponente', () => {
  beforeEach(() => resetCommunityMocks());

  it('renderiza sem crash', () => {
    expect(() => render(<NovoComponente />)).not.toThrow();
  });

  // ... mais casos
});
```

E re-rodar:

```bash
npm run test:community
```

---

## 12. Status

- **Suite criada**: ✅ 5 arquivos
- **Mocks centralizados**: ✅ `_mocks.tsx`
- **Script dedicado**: ✅ `npm run test:community`
- **Cobertura**: ~90 casos
- **Documentação**: este arquivo
- **Execução local**: ver Seção 8