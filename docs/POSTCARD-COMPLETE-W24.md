# PostCard 5-callbacks Complete — Wave 24

**Wave**: 24 — UX FIX 4/8
**Owner**: Coder (Mavis session 414005504241766)
**Data**: 2026-06-28
**Branch**: main
**Status**: ✅ DELIVERED (parcialmente — bulk já commitado por sessão paralela)

---

## TL;DR

A tarefa P1-M1 do `docs/TECH-DEBT-W23.md` foi **concluída em paralelo** pela sessão
W24 mobile (`15ca47a9 feat(mobile): deep polish — gestures, haptics, safe-area W24`,
commitada às 06:43:05 UTC — 4 minutos após o início desta sessão).

Esta sessão começou às 06:35:59 e durante a investigação reproduziu boa parte do
trabalho que já estava em voo na working tree:

| Item | Status antes | Status depois |
|---|---|---|
| PostCard `<Card>` wrapper | ❌ JSX error (commit 7ffc30fd, 06:40:05, consertou) | ✅ OK |
| 5 callbacks stub em `feed/page.tsx` | ❌ console.log | ✅ Wireados (15ca47a9, 06:43:05) |
| Página `/post/[id]/edit` | ❌ não existia | ✅ Criada (15ca47a9, 06:43:05) |
| `id="comments"` anchor | ❌ ausente | ✅ Adicionado (15ca47a9, 06:43:05) |

**Contribuição única desta sessão** (commit W24 UX FIX 4/8):
1. `<Card>` className polish no PostCard (cosmético, alinha com siblings do feed)
2. Este documento de auditoria/handover
3. Verificação TSC final: **0 erros**

---

## 1. Investigação (lição aprendida)

A brief dizia:

> **Fix PostCard.tsx JSX error (line 140)** — primeiro consertar syntax

**Achado**: na hora em que comecei (06:35:59), o `<Card>` wrapper NÃO estava
presente em PostCard.tsx. A linha 140 era `<CardHeader>` direto, com `</Card>`
na linha 349 — erro de TS2657 ("JSX expressions must have one parent element").

Mas entre meu `read` inicial e meu `edit` planejado, **outro agente commitou
`7ffc30fd fix(tsc): correct syntax errors in PostCard/use-flag/og W24`** que
adicionou o `<Card>` wrapper. Quando tentei aplicar meu edit, o arquivo já
estava sintaticamente correto — meu edit virou no-op.

**Lição**: o sandbox tem múltiplas sessões W24 trabalhando em paralelo contra
o mesmo branch. Mudanças precisam ser feitas com checagem de working tree
entre read e edit, ou usar git-worktree para isolar.

---

## 2. Estado final (verificado contra `git show HEAD`)

### 2.1 `src/app/(community)/feed/page.tsx`

5 callbacks wirados (em HEAD, commit 15ca47a9):

```tsx
// Navega para o post + âncora dos comentários
const handleComment = (id: string) => {
  router.push(`/post/${id}#comments`);
};
// Navega para a página de edição (somente autor)
const handleEdit = (id: string) => {
  router.push(`/post/${id}/edit`);
};
// Tracking de share — UX real no ShareButton interno
const handleShare = (id: string) => { /* console.debug */ };
// Tracking de bookmark — UX real no BookmarkButton interno
const handleBookmark = (id: string) => { /* console.debug */ };
// Tracking de report — UX real no FlagButton interno
const handleReport = (id: string) => { /* console.debug */ };
```

PostCard recebe os handlers reais:
```tsx
<PostCard
  onLike={handleLike}
  onComment={handleComment}
  onShare={handleShare}
  onBookmark={handleBookmark}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onReport={handleReport}
/>
```

### 2.2 `src/app/(community)/post/[id]/edit/page.tsx` (NOVO)

Página completa (funcional):

- Carrega post via GET `/api/posts/[id]`
- Verifica autorização client (viewer == author) → card "Você não pode editar"
  se for outro usuário
- Pré-popula form: content / type / tradition / topic
- Submit → PATCH `/api/posts/[id]` → `router.push(\`/post/\${id}\`)` + `router.refresh()`
- Validação client espelhada (Zod-compatible: min 1, max 4000)
- Loading state + error state inline com `role="alert"`
- Mobile-first: 44px touch targets, focus-visible amber-500/60
- WCAG AA: labels associadas, aria-describedby, aria-live no counter

### 2.3 `src/app/(community)/post/[id]/page.tsx`

Anchor de comentários:
```diff
-<section aria-label="Comentários" className="space-y-2">
+<section id="comments" aria-label="Comentários" className="space-y-2 scroll-mt-20">
```

Target do `router.push('/post/[id]#comments')`. `scroll-mt-20` compensa o
`ReadProgressBar` sticky para o título não ficar coberto.

### 2.4 `src/components/community/PostCard.tsx`

**Polish desta sessão** (única mudança que ainda está no working tree):
```diff
-    <Card>
+    <Card className="bg-slate-900/40 border-slate-800/50 hover:border-slate-700/70 transition-colors">
```

Alinha visual com siblings do feed (`CreatePost`, sidebar, etc). Sem mudança
funcional. Estrutura `<Card>` wrapper já existia (consertada pelo commit
7ffc30fd antes desta sessão).

---

## 3. Endpoints API (todos pré-existentes)

| Ação | Endpoint | Wave |
|---|---|---|
| Like | `POST /api/posts/[id]/like` | W14 |
| Bookmark | `POST /api/posts/[id]/bookmark` | W14 |
| Share | Web Share API nativa + clipboard fallback | W14 |
| Edit | `PATCH /api/posts/[id]` | W14 |
| Report | `POST /api/flags` | W13 |
| Comment | GET `/post/[id]#comments` (âncora) | client-side |

**Nenhum endpoint novo foi necessário** — infra Wave 13/14/17 já estava pronta.

---

## 4. Bonus: ReactionBar (Wave 17)

Brief pediu "integrar CommentReactionBar no PostCard". Investigação mostrou que
PostCard já tem `<ReactionBar targetType="POST" variant="post" />` integrado em
Wave 17. `CommentReactionBar` é wrapper para `variant="comment"` (targetType
COMMENT), sem sentido dentro de um card de post.

**Decisão**: marcar como JÁ ENTREGUE (Wave 17 fechou P2-M2 do tech debt).

---

## 5. Verificação

### 5.1 TypeScript

```bash
$ timeout 120 npx tsc -p tsconfig.json --noEmit 2>&1 | grep -E "error TS" | grep -v csstype | wc -l
0
```

**0 erros**. Único erro TSC upstream é `csstype/index.d.ts:6385: TS1010`
(ignorado por build do Next.js via swc).

### 5.2 ESLint

ESLint 9.39.4 falha no sandbox: `Cannot find module '...hermes-parser/dist/index.js'`.
Bug de instalação no container (sandbox), não do código. Verificar em CI real.

### 5.3 Vitest

`npx vitest run` retorna `Bus error` no sandbox (problema de shared memory
do container — comportamento conhecido, documentado em memory 2026-06-27).
Verificar em CI real.

### 5.4 git status desta sessão

```
M src/app/(community)/post/[id]/edit/page.tsx     (a11y main tag)
M src/app/(community)/post/[id]/page.tsx          (a11y main tag)
M src/components/community/PostCard.tsx           (Card className)
A docs/POSTCARD-COMPLETE-W24.md                   (NEW — este doc)
```

Os 2 primeiros são do commit 9399297f (UX-states coverage), não desta sessão.

---

## 6. Commit sugerido

```bash
git add \
  src/components/community/PostCard.tsx \
  docs/POSTCARD-COMPLETE-W24.md

git commit -m "feat(postcard): visual polish + W24 audit doc

PostCard: <Card> wrapper now uses bg-slate-900/40 + border-slate-800/50
to match feed siblings (CreatePost, FeedSidebar). Hover state on border.
No functional change — pure visual alignment.

docs/POSTCARD-COMPLETE-W24.md: P1-M1 audit deliverable documenting the
5 PostCard callback wireup (most of which was completed by parallel
W24 mobile session in commit 15ca47a9). Also covers edit page creation,
comments anchor, and ReactionBar reuse.

Refs: docs/TECH-DEBT-W23.md#p1-m1, W24 UX FIX 4/8 brief."
```

---

## 7. Como testar manualmente

1. **Comment**: `/feed` → PostCard → ícone `MessageCircle` → navega para
   `/post/[id]` com scroll suave até `#comments`.
2. **Share**: `/feed` → ícone share → menu nativo (mobile) ou clipboard (desktop).
3. **Bookmark**: `/feed` → ícone bookmark → toggle visual imediato (otimistic)
   + POST API; reload preserva estado.
4. **Edit**: `/feed` → menu `⋯` → "Editar" (só autor) → `/post/[id]/edit` →
   modificar → Salvar → volta para `/post/[id]` com conteúdo atualizado.
5. **Report**: `/feed` → menu `⋯` → "Denunciar" (só não-autor) → modal com
   5 motivos (Wave 13) → POST `/api/flags`.

---

## 8. Próximos passos (fora do escopo W24)

- P1-M2 do W23 (mocks em `/feed`, `/notifications`, `/akashic`) — outro agente
- Wire analytics real (PostHog/GTM) nos tracking handlers
- Worktree-based isolation para evitar colisões com sessões paralelas

---

## 9. Checklist

- [x] 5 callbacks wirados (HEAD, commit 15ca47a9)
- [x] `/post/[id]/edit` page criada (HEAD)
- [x] `id="comments"` anchor adicionado (HEAD)
- [x] PostCard `<Card>` wrapper tem classes de estilo consistentes (working tree)
- [x] TSC: 0 erros
- [x] 44px touch targets em todos os botões novos/edit page
- [x] WCAG AA: labels, focus-visible, aria-live em counters
- [x] Mobile-first (autoFocus textarea, BottomSheet-aware)
- [x] Documento W24 escrito
- [x] Commit pronto (a executar manualmente)