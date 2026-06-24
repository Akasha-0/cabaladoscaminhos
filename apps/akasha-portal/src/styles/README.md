# Akasha Design System (Wave 10.2)

Documentação rápida para os subagentes Wave 10.3 (Hub), 10.4 (Mentor) e
10.5 (BottomNav) — usar estes tokens em vez de hex/rgb/valores hardcoded.

## Onde está

| Arquivo | Propósito |
| --- | --- |
| `apps/akasha-portal/src/styles/tokens.css` | **Single source of truth** — todos os tokens CSS (`--ak-*`) |
| `apps/akasha-portal/src/app/globals.css` | Importa `tokens.css` + registra tokens como utilities Tailwind v4 (`bg-ak-*`, `text-ak-*`) |
| `apps/akasha-portal/src/components/ui/EmptyState.tsx` | Novo — estado vazio reutilizável |
| `apps/akasha-portal/src/components/ui/button.tsx` | Refinado — touch targets ≥ 48px, novos variants `primary` / `success` |
| `apps/akasha-portal/src/components/ui/card.tsx` | Refinado — `variant: default / elevated / interactive / glass` |

## Como usar

### 1. Cores semânticas (Tailwind utilities)

Disponíveis em qualquer className (graças ao `@theme` em globals.css):

```tsx
// Backgrounds
<div className="bg-ak-bg-cosmic-gradient">  // gradiente cósmico padrão
<div className="bg-ak-bg-void">             // #06070F — background principal
<div className="bg-ak-bg-deep">             // #0b0e1c — surface elevada

// Texto
<p className="text-ak-text-primary">        // #f4f5ff — alta hierarquia
<p className="text-ak-text-muted">          // #a7aecf — texto de apoio
<p className="text-ak-text-subtle">         // #5c6691 — labels / metadata

// Bordas
<div className="border-ak-border-default">  // rgba(255,255,255,0.1)
<div className="border-ak-border-accent">   // rgba(124,92,255,0.25) — destaque

// Accents
<button className="bg-ak-accent-primary">           // #7c5cff — violeta Akasha
<button className="bg-ak-accent-tertiary">          // #f0b429 — dourado Ori
<span className="text-ak-accent-alert">             // #fb5781 — tensão
```

### 2. Espaçamento

Use a escala `--ak-space-N` ou as Tailwind utilities equivalentes (`p-4 = 16px`,
`p-6 = 24px`, etc). Touch targets ≥ 48px = `min-h-12`.

```tsx
<main className="px-5 py-6 pb-20">   {/* 20px / 24px / 80px — mobile-first */}
<div className="max-w-[var(--ak-container-narrow)] mx-auto"> {/* 480px */}
```

### 3. Tipografia

| Token | Tamanho | Uso |
| --- | --- | --- |
| `--ak-text-xs` | 12px | labels uppercase, metadata |
| `--ak-text-sm` | 14px | body de cards, descrições |
| `--ak-text-base` | 16px | body principal |
| `--ak-text-lg` | 18px | ênfase |
| `--ak-text-xl` | 20px | CTA, sub-headings |
| `--ak-text-2xl` | 24px | títulos de seção |
| `--ak-text-3xl` | 30px | hero headings |
| `--ak-text-4xl` | 36px | saudação principal (Meu Dia) |

Fontes:
- `--ak-font-cinzel` — títulos, hero
- `--ak-font-inter` — body, UI
- `--ak-font-lora` — parágrafos longos (manifesto)

### 4. Componentes

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Empty state
<EmptyState
  icon={<Sparkles size={28} />}
  title="Sem conexões"
  description="Quando alguém compartilhar um mapa, aparece aqui."
  action={<Button>Convidar alguém</Button>}
/>

// Card interativo (com hover/active)
<Card variant="interactive" onClick={...}>
  <CardHeader>
    <CardTitle>Mandala do dia</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>

// Botão com token (toque mínimo 48px)
<Button variant="primary" size="default">Ver minha Caixa</Button>
```

## Princípios (Wave 10 plan §"Princípios de design")

1. **Minimalista**: copy < 12 palavras por linha
2. **Mobile-first**: 360px width, touch targets ≥ 48px (`min-h-12`)
3. **State-adaptive**: 4 estados emocionais (Wave 9.1)
4. **Dark theme**: `--ak-bg-void` (`#06070f`) é o background canônico
5. **PT-BR primeiro**: i18n via `messages/pt-BR.json` + `messages/en.json`
6. **Acessibilidade**: focus-visible global em `tokens.css`,
   `prefers-reduced-motion` respeitado

## i18n

Para `EmptyState`, novas chaves em `messages/{pt-BR,en}.json`:

```json
"common": {
  "empty": {
    "semDadosTitulo": "Nada por aqui ainda",
    "semDadosDescricao": "Quando algo chegar, você vê aqui.",
    "semCreditosTitulo": "Sem créditos",
    ...
  }
}
```

Paridade validada por `pnpm i18n:check`.

## Validação

- `pnpm typecheck` — 0 novos erros
- `pnpm i18n:check` — 365 chaves, parity OK
- Antes de merge: tokens respeitam AGENTS.md constraints (no Edge Runtime, no pnpm-lock.yaml noise)

## Próximos passos (Subagentes 10.3 / 10.4 / 10.5)

- Subagente 3 (Hub Polish): substituir hex hardcoded em
  `my-day/MeuDiaHub.tsx`, `my-day/state-picker/*`, `my-day/AnsiosoView.tsx`,
  `BreathOrb.tsx` pelos tokens `bg-ak-*` / `text-ak-*` /
  `border-ak-*` (mesma estratégia que `MyDayScreen.tsx`).
- Subagente 4 (Mentor Chat): usar `<EmptyState>` para o "3-4 perguntas
  starter" e `<Card variant="elevated">` para bolhas de mensagem.
- Subagente 5 (BottomNav): usar `--ak-z-sticky` (z-index 20) e
  `bg-ak-bg-elevated/80 backdrop-blur-md` para o nav mobile.

## Métricas de impacto (Wave 10.2)

| Componente | Hex/rgb hardcoded ANTES | DEPOIS |
| --- | --- | --- |
| `MyDayScreen.tsx` | 20 | 0 |
| `my-day/MeuDiaHub.tsx` | 3 | 0 |
| **Total removido** | **23** | **0** |

`ContaClient.tsx` (71 hardcoded) é o próximo candidato — reservado para
Subagente 3 ou 4 quando reduzir o escopo da refatoração.