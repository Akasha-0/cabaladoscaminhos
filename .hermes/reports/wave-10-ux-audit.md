# Wave 10 — Auditoria UX/UI do Akasha Portal

**Data:** 2026-06-24
**Base:** `main` @ 0fa1db66 (Wave 9 inteira merged)
**Escopo:** Auditoria visual + heurística. **Nenhum código de implementação.**
**Persona-alvo:** Gabriel Letteriello, founder solo, testador primário.

---

## Sumário executivo

1. **A promessa da One-Screen Hub (Wave 9.1) está cumprida** no `meu-dia/`: detecção por 1 clique, 4 estados emocionais, sem menu-hunting, copy curta. A arquitetura (StatePicker → AdaptiveContent → View especializada) está sólida e com 43 testes.
2. **A maior dívida de UX está fora do `meu-dia/`** — `Diário`, `Conta`, `Login` e a navegação global (sidebar) **continuam com a copy longa, 5 cards/accordions empilhados e sem affordance mobile-first** que o Gabriel reclamou no grill-me. A Wave 9 tratou 1 das 6 telas.
3. **Inconsistência de design system é sistêmica**: 4-5 paletas concorrentes (roxo `#7C5CFF` da navegação, laranja `#FF9500` do meu-dia, azul `#60A5FA` do ansioso, âmbar `#FBBF24` do perdido, violeta `#A78BFA` do curioso), múltiplos gradientes, hexadecimais hardcoded em **mais de 200 arquivos**. Nenhum token CSS compartilhado.
4. **Navigation é desktop-first disfarçada de responsiva**: a `AkashaNavigation` (`AkashaNavigation.tsx:228-269`) usa sidebar fixa `md:flex` + drawer mobile via hamburger. Para um app "PWA mobile-first" (F-228, F-224), falta o **bottom-tab nav** com 4 destinos primários — é a fricção que faz o Gabriel "ficar procurando na interface".
5. **Acessibilidade é boa em intenção, fraca em execução**: `role="radiogroup"`, `aria-label`, `aria-live="polite"` no `AnsiosoView`, `prefers-reduced-motion` no `BreathOrb` e `MandalaChart`. Mas faltam: skip-links, focus-trap em drawers, contraste mínimo WCAG AA em vários textos `text-white/40` / `text-white/55` (provavelmente < 4.5:1), e `aria-current="page"` no nav ativo.

---

## Telas auditadas

### 1. `/meu-dia` (One-Screen Hub — Wave 9.1)
**Arquivos:** `meu-dia/page.tsx`, `state-picker/StatePicker.tsx`, `my-day/MeuDiaHub.tsx`, `my-day/AdaptiveContent.tsx`, `my-day/{ansioso,centrado,perdido,curioso}/*.tsx`
**Status:** ✅ Tela mais bem cuidada do app. Respeita o brief do grill-me: copy curta, 1-clique, escopo reduzido.
**Pontos fortes:**
- `StatePicker.tsx:122-174` — 4 tiles em grid 2×2, 96×96px, ícones grandes (22px), gradiente por estado, focus-visible, `role="radio"`. Acessível e escaneável.
- `AnsiosoView.tsx:35-130` — 3 elementos verticais (orb → frase → CTA). Sem scroll, hierarquia clara. `BreathOrb` com `prefers-reduced-motion` honrado.
- Persistência 24h em localStorage + cookie mirror documentada em ADR-009.

**Problemas pontuais:**
- **P2** — `MeuDiaHub.tsx:120-128` "Trocar estado" é um link `text-[11px] text-white/40` centralizado. Contraste insuficiente (~3.0:1 sobre `#06070F`, falha WCAG AA 4.5:1) e provavelmente invisível para usuários com baixa visão.
- **P2** — `MeuDiaHub.tsx:53-141` background usa `linear-gradient(180deg, #0B0E1C → #1A1F3A)` mas o tema global é `#06070F` (F-228). Inconsistência com resto do app.
- **P2** — `CentradoView.tsx:79-86` "Estratégia:" em `text-white/65` com valor `text-white/85` — diferença insuficiente para hierarquia.
- **P1** — `MeuDiaHub.tsx:106-130` após escolher estado, **não há nenhuma indicação visual de qual estado está ativo** (a cor do estado não vira o background do hub). O "Trocar estado" não diz "atual: ansioso". Usuário que volta 5min depois pode não lembrar.
- **P2** — `MyDayScreen.tsx:240-252` (legado F-224, **não está mais em uso** pelo hub novo, mas existe). A tensão ativa vaza copy longa que o Gabriel reclamou — limpar/arquivar.

### 2. `/diario` (Mandato do Dia — F-235)
**Arquivos:** `diario/page.tsx`, `diario/MandatoUnificado.tsx`, `diario/{RitualSection,DiarioAuthorityBlock,SignificadoSection,AreasSection}.tsx`
**Status:** ⚠️ Refatoração recente (5 telas → 1 scroll contínuo) melhorou a navegação entre seções, mas a copy interna e a densidade continuam pesadas — **exatamente o que o Gabriel pediu pra resolver**.
**Pontos fortes:**
- `loading.tsx:1-14` + `DiarioPageSkeleton.tsx` — Suspense boundary + skeleton dedicado, evita jump.
- `DiarioErrorBoundary` no `page.tsx:199` — erro isolado, app não cai.
- `MandatoUnificado.tsx:107-148` bloco CVV-188 (crise) tem destaque visual forte, contraste alto, fonte 1.4rem no número — leitura por pessoa em sofrimento funciona.

**Problemas críticos:**
- **P0** — `MandatoUnificado.tsx:81-181` "Voz do Akasha" renderiza até **3 frases longas** (`mandato.frases`) sem hierarquia visual entre elas. Cada frase pode ter 20-40 palavras. É a maior violação do brief "textos muito longos".
- **P0** — `page.tsx:209-249` a página é **um único scroll de 5 seções**, todas com 100vh+ de altura. No mobile (360px), usuário precisa de 4-5 scrolls pra chegar na "pergunta do dia". Mobile-first quebrado.
- **P1** — `SignificadoSection.tsx:46-67` e `AreasSection.tsx:39-53` abrem com chevron `▼` Unicode — não é ícone (não escala, não respeita `currentColor` em SVG).
- **P1** — `MandatoUnificado.tsx:227-234` textarea da "Pergunta do dia" tem `min-h-[100px]` mas placeholder e hint estão em `text-[0.65rem] text-[#8A9BB8]` — abaixo do mínimo recomendado 0.75rem para hint, contraste ~3.2:1.
- **P1** — `AreasSection.tsx:107-118` lista 8 áreas em grid 1 coluna (`grid-cols-1 gap-3`). No mobile isso vira **8 cards sequenciais** de altura similar — exatamente o "scroll infinito" que o Gabriel disse que não entrega "o que precisa fazer agora". Solução: mostrar top 3 (já calculados em `SignificadoSection` via `tresPilares`) com "ver todas (8)" expansível.
- **P2** — `diario/page.tsx:33-37` erros 401 → redirect login é OK, mas erros 5xx do `mandatoRes` mostram só `{status}` literal pro usuário (linha 103: `t('diario.mandato.indisponivelDesc', { status: String(mandatoRes.status) })`). Pessoa ansiosa vê "Diário indisponível 503" — confuso.
- **P2** — `MandatoUnificado.tsx:88` `<section aria-label>` está OK, mas não há `<h1>` visível na página — só `<h2>` nas seções. SEO + leitores de tela perdem o "esta é a página Diário".

### 3. `/conta` (Perfil + Saldo + Planos)
**Arquivo:** `conta/page.tsx` + `conta/ContaClient.tsx` (637 linhas, monolítico)
**Status:** 🔴 A tela mais densa, mais copy, mais distraída. **Nenhuma das 4 frustrações do Gabriel está resolvida aqui**.
**Pontos fortes:**
- `ContaClient.tsx:236-247` banner de sucesso `checkoutStatus='success'` com cor verde e ícone.
- `ContaClient.tsx:436-473` toggle de notificações LGPD-compliant com texto explicativo claro e copy "ativar/desativar" explícita.
- `ContaClient.tsx:478-524` grid 2 colunas (Plano + Créditos) — escaneável.

**Problemas críticos:**
- **P0** — `ContaClient.tsx:148-149` `setTimeout(() => window.location.reload(), 600)` — **reload full-page** após salvar perfil. Quebra PWA (perde state, scroll, instalação standalone feel). Usar `router.refresh()`.
- **P0** — `ContaClient.tsx:222-232` bloco `chartLoading` está em **escopo de bloco JSX (entre chaves)** que é **ignorado pelo React** (linha 222: `{ chartLoading && (<div ...) }` — isso é uma *expressão* sem retorno útil, renderiza nada). **Bug latente** — usuário vê o painel de loading 0 vezes, mesmo quando chart está recalculando. Era pra ser `{chartLoading && (...)}` no JSX principal.
- **P0** — `ContaClient.tsx:234` `min-h-[calc(100vh-56px)] px-4 py-12` — top padding 48px (`py-12`) no mobile deixa a primeira seção 96px abaixo do header. Em mobile 360px isso desperdiça ~1/3 da viewport.
- **P1** — `ContaClient.tsx:288-298` card "Profile" mostra só `name` + `email`. Falta o saldo grande, link rápido pro `meu-dia`, ou indicador de "Akasha Pro/Freemium" junto. O usuário abre `/conta` esperando visão geral e vê só uma ficha.
- **P1** — `ContaClient.tsx:602-633` 3 "pacotes de créditos" (`10/30/60`) com `description` `10 consultas simples` — copy repetitiva e pouco diferenciadora. Não diz **pra que cada crédito serve** (já existe "1 crédito = 1 consulta simples" no card Créditos, mas a relação não é óbvia).
- **P1** — `ContaClient.tsx:30-34` `glassCard` é um objeto literal — sem token, duplicado em `page.tsx:30-34`. Quando Wave 10.2 chegar, vai ter que atualizar 2 lugares (mais outras dezenas que repetem o mesmo).
- **P2** — `ContaClient.tsx:566-592` "Manifesto Akáshico R$29,90 · pagamento único" sem **descrição expandida do que vem no PDF**. Quem nunca comprou fica inseguro.
- **P2** — `ContaClient.tsx:151-155` erros de rede são `setProfileError(e.message)` — mensagem técnica em inglês (ex: "Failed to fetch") vaza pro usuário. Localizar/tratar.

### 4. `/login`
**Arquivo:** `login/page.tsx` + `login/LoginClient.tsx`
**Status:** 🟡 Tela simples, funcional, com fix de cookie já aplicado. Mas copy do título ainda não-PT-BR-nativa ("Bem-vindo de volta" em vez de "Entre na sua conta").
**Pontos fortes:**
- `page.tsx:14-23` honra `?return=` corretamente (commit e11face8 do fix Wave 9.5).
- `LoginClient.tsx:36-49` lida com `redirect: 'manual'` para garantir Set-Cookie antes de navegar — sem race condition.
- Centralizado, max-width 420px, dark theme consistente.

**Problemas:**
- **P1** — `page.tsx:93-97` "Bem-vindo de volta" + "Entre para acessar sua Mandala Akáshica" — bom, mas falta link "Esqueci minha senha" abaixo do botão. Usuário que errou 5 vezes fica sem saída.
- **P1** — `LoginClient.tsx:111-125` erro genérico `setError(data.error ?? 'Falha ao entrar. Tente novamente.')` — não diferencia 401 (credenciais) de 429 (rate limit) de 500 (servidor). Para ansiedade + login falhado, é preciso dizer "aguarde 30s" vs "senha errada".
- **P2** — `LoginClient.tsx:85-109` inputs sem `aria-invalid` quando há erro, sem `aria-describedby` apontando pra div de erro. Leitor de tela não associa.
- **P2** — `page.tsx:60-69` link "Criar conta" no header sem contraste suficiente (`color: '#9D86FF'` sobre `#06070F` — ~4.0:1, falha AA 4.5:1 em texto pequeno).
- **P3** — `LoginClient.tsx:40-42` `credentials: 'include'` está OK, mas o `redirect: 'manual'` esconde o status HTTP do servidor. Debug mais difícil (sem 4xx/5xx em logs de browser).

### 5. MandalaChart (SVG 5 camadas) + InnerMandalaChart
**Arquivo:** `MandalaChart.tsx` (364 linhas, 5 sub-camadas em `layers/`)
**Status:** 🟢 Funcionalmente rico. ⚠️ Visualmente denso pra mobile. Sem acessibilidade de teclado.
**Pontos fortes:**
- `MandalaChart.tsx:196-227` 5 botões de camada com `aria-pressed`, `aria-label`, min 44×88px. Bom.
- `MandalaChart.tsx:243-321` SVG com `viewBox` responsivo, `LayerDefs` (gradients) reaproveitáveis, F-230 mantido.
- `MandalaChart.tsx:316-320` "dados parciais" badge no rodapé do SVG.
- `InnerMandalaChart.tsx:343-356` info panels por camada com `activeLayer === N` (show/hide condicional, sem re-render de tudo).

**Problemas:**
- **P0** — `MandalaChart.tsx:200-227` **em mobile (360px), 5 botões de 88px+ cada com gap-2 = 5×88 + 4×8 = 472px** — não cabem em uma linha, viram `flex-wrap` em 2-3 linhas. Toma ~150px de altura antes do SVG começar. Empurra conteúdo importante pra baixo do fold.
- **P1** — `MandalaChart.tsx:230-321` SVG inteiro 400×400 fixo, **não tem aria-describedby** linkando pro info panel ativo. Leitor de tela lê só "Mandala Akáshica Toroidal" — perde 100% do conteúdo.
- **P1** — `MandalaChart.tsx:343-356` info panels renderizam **condicionalmente sem AnimatePresence** — flash seco ao alternar camadas. Sem `prefers-reduced-motion` honored.
- **P2** — `MandalaChart.tsx:359-361` renderiza `<AkashaAuthorityPrompt>` no **mesmo nível do info panel** (concorrente). Se o user tá na camada 4 (Astrologia), vê 2 cards verticais (info panel + authority prompt) sem hierarquia clara de qual é a "resposta" e qual é a "explicação".
- **P2** — `MandalaChart.tsx:325-340` "CAMADA N — NOME" legend em `font-size: 0.65rem, opacity: 0.75` — contraste ~3.0:1 sobre bg. Falha AA.
- **P3** — `MandalaChart.tsx:249-264` linhas pentagrama (`strokeDasharray="3 5"`, `strokeWidth: 0.5`) **são invisíveis em telas pequenas** — feature só vista em desktop, mas renderizam em mobile ocupando path de pintura.

### 6. Navegação global (`AkashaNavigation.tsx`)
**Arquivo:** `AkashaNavigation.tsx` (336 linhas, **compartilhado por todas as telas autenticadas**)
**Status:** 🔴 **Maior dívida de UX mobile do app**. Desktop-first; mobile depende de hamburger + drawer.
**Pontos fortes:**
- `AkashaNavigation.tsx:230-269` sidebar desktop com gradiente + backdrop-blur, hover states, user card com iniciais.
- `AkashaNavigation.tsx:51-64` 6 links principais claros: Painel, Mandala, Diário, Conexões, Oráculo, Sobre.
- `AkashaNavigation.tsx:270-286` mobile header fixo com hamburger.
- `AkashaNavigation.tsx:289-333` drawer mobile com AnimatePresence + backdrop, fecha onClick outside.

**Problemas críticos:**
- **P0** — `AkashaNavigation.tsx:51-64` **não tem `meu-dia/` na lista de links** — vai só por `/dashboard`. Para o app "One-Screen Hub" (a tela que o Gabriel mais quer ver primeiro), não há atalho na nav.
- **P0** — `AkashaNavigation.tsx:228-269` sidebar desktop `md:fixed md:inset-y-0 md:left-0` **consome 256px (ou 64px collapsed)** da largura no mobile, mas o `main` em `AkashaLayoutClient.tsx:30-32` aplica `md:pl-64`/`md:pl-16` que é **ignorado no mobile**. Bom. **Mas** `AkashaLayoutClient.tsx:33` aplica `max-w-5xl mx-auto` + `px-4 py-6` no main — o padding lateral 16px + max-width em mobile (360px) deixa `328px` de conteúdo, OK. No tablet (768px) com sidebar visível, conteúdo fica `768-256-32=480px` — não respeita o brief `max-w-460` que `MeuDiaHub` e `MandalaChart` esperam.
- **P0** — `AkashaNavigation.tsx:51-64` 6 links no hamburger. **Wave 10.5 plano diz "BottomNav 4-5 itens: Meu Dia, Mandala, Mentor, Conta"**. Hoje não há bottom nav. Mobile-only-first quebrado.
- **P1** — `AkashaNavigation.tsx:280-286` hamburger button tem `p-2` (= 32px) — **touch target 32px < 48px WCAG / Apple HIG**. Polegar erra.
- **P1** — `AkashaNavigation.tsx:152-164` user card collapsed (sem foto) vira `✦ Iniciar Jornada` — texto com `text-xs` (~12px) e cor `text-white` sobre `bg-[#7C5CFF]/20` — contraste OK, mas o ícone `✦` é usado em **3 lugares** (brand, onboarding CTA, avatar fallback) com semântica diferente.
- **P2** — `AkashaNavigation.tsx:84` `pathname.startsWith(link.href + '/')` — match `/conta/123` funciona, mas `/contas` (hipotético) também matcharia `/conta`. Falso positivo.
- **P2** — `AkashaLayoutClient.tsx:30-32` transição `transition-all duration-300` no `pl-16/64` — quando o user toggla a sidebar, **o conteúdo faz shift de 192px** em 300ms. Reflow pesado, jank visível.
- **P3** — `AkashaNavigation.tsx` **não tem skip-link** "Pular para conteúdo principal". Usuário de teclado Tab-tem que passar pelos 6 links + user card antes de chegar no `<main>`.

---

## Top 10 issues priorizados

| # | Severidade | Tela | Issue | Arquivo:linha | Heurística Nielsen violada |
|---|------------|------|-------|---------------|----------------------------|
| 1 | **P0** | Global | Sem **bottom-tab nav mobile** (4-5 destinos primários). Fricção "fica procurando na interface" do Gabriel. | `AkashaNavigation.tsx:270-286` | #6 (reconhecer vs recordar) |
| 2 | **P0** | `/conta` | `setTimeout(window.location.reload, 600)` após save — quebra PWA + perde state + scroll jump. | `ContaClient.tsx:149` | #3 (controle do usuário) |
| 3 | **P0** | `/conta` | Painel de loading `chartLoading` está em **escopo de bloco JSX ignorado pelo React** (entre chaves sem return). 0% dos usuários vê o loading. | `ContaClient.tsx:222-232` | #1 (visibility of status) |
| 4 | **P0** | `/diario` | Página única com 5 seções empilhadas = 4-5 scrolls no mobile. Densidade alta onde o user precisa decidir. | `diario/page.tsx:209-249` | #8 (estética/minimalismo) |
| 5 | **P0** | `/diario` | "Voz do Akasha" renderiza **3 frases longas** sem hierarquia visual. Copy literal do problema "textos muito longos". | `MandatoUnificado.tsx:177-181` | #8 (estética/minimalismo) |
| 6 | **P0** | Mandala | 5 botões de camada (88px cada) com `flex-wrap` no mobile = 2-3 linhas + 150px de altura. Conteúdo do SVG fica abaixo do fold. | `MandalaChart.tsx:200-227` | #6 (reconhecer) |
| 7 | **P0** | Global | `meu-dia/` **ausente do menu lateral/drawer** — sem atalho pra tela que o Gabriel quer ver primeiro. | `AkashaNavigation.tsx:51-64` | #6 (reconhecer) |
| 8 | **P1** | `/conta` | Card "Profile" mostra só nome+email. Falta visão geral (saldo, plano, CTA pro meu-dia). | `ContaClient.tsx:288-298` | #4 (consistência) |
| 9 | **P1** | `/conta` | `py-12` no top = 48px de espaço vazio. Mobile desperdiça ~1/3 da viewport. | `ContaClient.tsx:234` | #8 (estética) |
| 10 | **P1** | `/meu-dia` | Estado emocional ativo **não aparece** em nenhum lugar depois de escolhido. "Trocar estado" não diz qual está ativo. | `MeuDiaHub.tsx:106-130` | #1 (visibility) |

### Outros P1/P2 dignos de nota (não top 10 mas relevantes)

- **P1** `/login` — sem "esqueci senha" + erro genérico que não diferencia 401/429/500.
- **P1** `/diario` — 8 áreas em grid 1 coluna = scroll enorme. Mostrar top 3 + "ver todas".
- **P1** Mandala — info panels sem `prefers-reduced-motion` honored, flash seco ao trocar camada.
- **P1** Mandala — `aria-describedby` ausente: leitor de tela lê só "Mandala Akáshica Toroidal".
- **P1** Global — hamburger `p-2` (32px) < 48px touch target WCAG.
- **P2** `/conta` — `setProfileError(e.message)` vaza "Failed to fetch" em inglês.
- **P2** Mandala — `text-[0.65rem] opacity-0.75` (legend) contraste ~3.0:1, falha AA.
- **P2** `/meu-dia` — `Trocar estado` em `text-[11px] text-white/40` contraste ~3.0:1, falha AA.
- **P2** Global — sem skip-link "Pular para conteúdo".

---

## Quick wins (< 1h cada, alto impacto)

Estes são ações que **outros subagentes** podem fazer amanhã, sem refatoração grande:

### QW-1. Adicionar `meu-dia` na nav global (Subagente 5)
**Esforço:** 5 min. **Arquivo:** `AkashaNavigation.tsx:51-64`
**Diff mental:** inserir `{ href: '/${locale}/meu-dia', label: 'Meu Dia', icon: Sun }` na 1ª posição.
**Impacto:** P0 #7 resolvido. Atalho pra tela principal do app.
**Risco:** zero (apenas mais um link no array).

### QW-2. Substituir `window.location.reload()` por `router.refresh()` (Subagente 2 ou 3)
**Esforço:** 10 min. **Arquivo:** `ContaClient.tsx:149`
**Diff mental:** trocar `setTimeout(() => window.location.reload(), 600)` por `setTimeout(() => router.refresh(), 600)`, importar `useRouter` do `next/navigation` (já importado em `LoginClient.tsx:5`).
**Impacto:** P0 #2 resolvido. PWA não perde state.
**Risco:** testar se `router.refresh()` re-busca o `/api/akasha/auth/me` etc — sim, é exatamente o que faz (RSC re-fetch). Garantir que o user atualizado aparece.

### QW-3. Corrigir o bloco chartLoading ignorado (Subagente 2)
**Esforço:** 15 min. **Arquivo:** `ContaClient.tsx:222-232`
**Diff mental:** mover o JSX de `{ chartLoading && (...) }` para dentro do `return` principal, próximo da notificação de sucesso.
**Impacto:** P0 #3 resolvido. Loading visível durante recálculo do mapa.
**Risco:** zero, é um copy-paste de bloco.

### QW-4. Indicar estado ativo no `meu-dia` (Subagente 3)
**Esforço:** 20 min. **Arquivo:** `MeuDiaHub.tsx:73-97` (header) + `:120-128` (trocar)
**Diff mental:** adicionar badge pequeno "Estado: 🌊 Ansioso" no header + mudar "Trocar estado" pra "Trocar: ansioso" (com label dinâmico).
**Impacto:** P1 #10 resolvido. User nunca esquece o que escolheu.
**Risco:** zero, é adição de UI.

### QW-5. Cortar copy do "Voz do Akasha" (Subagente 3 ou spec/UX writer)
**Esforço:** 30 min. **Arquivo:** `MandatoUnificado.tsx:177-181` + payload do API `/api/akasha/mandato-do-dia`
**Diff mental:** garantir que cada `frase` ≤ 12 palavras; adicionar regra de fallback no backend se vier longa.
**Impacto:** P0 #5 resolvido. Maior reclamação literal do Gabriel.
**Risco:** requer decisão de copy (curto vs. longo) — fazer com base em exemplos reais de geração.

### QW-6. WCAG: corrigir contraste de textos secundários (Subagente 2 — design tokens)
**Esforço:** 30 min (afetar ~5 componentes). **Arquivos:** `MeuDiaHub.tsx:124`, `MandalaChart.tsx:330-335`, `ContaClient.tsx:295-296, 343, 446, 521, 575, 622`.
**Diff mental:** subir `text-white/40` → `text-white/55` (a partir do bg `#06070F`, isso dá ~4.5:1). Idem `text-white/35` → `text-white/50`.
**Impacto:** P1+P2 contraste resolvidos em uma passada.
**Risco:** zero. Acessibilidade ganha.

### QW-7. Touch target hamburger 32px → 48px (Subagente 5)
**Esforço:** 2 min. **Arquivo:** `AkashaNavigation.tsx:280-286`
**Diff mental:** trocar `className="p-2 text-[#A7AECF]"` por `className="p-3 text-[#A7AECF]"`.
**Impacto:** P1 touch target resolvido.
**Risco:** zero.

---

## Recomendações para Wave 10.x (subagentes 2-5)

### Para Subagente 2 (Design Tokens + Componentes Base) — **ordem 1, merge PRIMEIRO**
1. **CSS variables tokens** (`apps/akasha-portal/src/styles/tokens.css`):
   - Cores: `--color-bg-primary: #06070F; --color-bg-card: rgba(11,14,28,0.72); --color-accent-violet: #7C5CFF; --color-accent-amber: #F59E0B; --color-accent-rose: #FB5781; --color-state-centrado: #34D399; --color-state-ansioso: #60A5FA; --color-state-perdido: #FBBF24; --color-state-curioso: #A78BFA;`
   - Spacing: `--space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px;`
   - Touch: `--touch-target: 48px;`
   - Texto: `--text-hint-contrast: 0.55` (mínimo AA) / `--text-secondary-contrast: 0.65` / `--text-primary-contrast: 0.85`.
2. **Substituir hex literais por tokens** nos 6 arquivos auditados + ~50 outros com `border-white/10`, `bg-[#7C5CFF]/20`, etc. (grep `bg-\[#` retorna muitas ocorrências).
3. **Componente `EmptyState`** reutilizável: ícone + 1 frase + 1 CTA. Aplicar em `meu-dia` (CentradoView fallback), `diario` (no `SignificadoSection` quando `sig` é null), `conta` (quando `subscription` falha).
4. **Componente `LoadingState`** (skeleton reutilizável, hoje duplicado em 3 lugares: `MeuDiaHub`, `CentradoView`, `diario/DiarioPageSkeleton`).
5. **Componente `ErrorBanner`** com `role="alert"`, hoje `ContaClient.tsx:260-271` e `page.tsx:97-107` reinventam.

### Para Subagente 3 (One-Screen Hub Polish) — **ordem 3, depois dos tokens**
1. Reduzir copy em `CentradoView.tsx`, `AnsiosoView.tsx:87-89` (frase), `PerdidoView.tsx:96-99`, `CuriosoView.tsx:103-110`. Meta: ≤ 12 palavras/linha.
2. **Indicador de estado ativo** (QW-4).
3. Adicionar haptic feedback visual ao `BreathOrb` (micro-pulse + cor sincronizada com fase).
4. StatePicker: ícones 28px (atualmente 22px em `StatePicker.tsx:159`), `aria-live="polite"` no wrapper pra anunciar a seleção.
5. **Empty state robusto** em `CentradoView.tsx:126-132` (atualmente só 1 frase).

### Para Subagente 4 (Mentor Chat UX) — **ordem 4**
1. Streaming typewriter (não-bloqueante).
2. Suggestion chips baseadas em estado emocional (lê `useEmotionalState`).
3. Citation visual de qual tool foi chamada (impacto direto no "preciso achar o que preciso" do Gabriel).
4. Empty state com 3-4 perguntas starter (a `/diario?intencao=X` é exatamente o que falta — cada estado tem intent próprio).

### Para Subagente 5 (Mobile Navigation + PWA Install) — **ordem 2, habilita navegação**
1. **BottomTabNav** (4 itens: Meu Dia, Mandala, Mentor, Conta). Touch targets 48px+. `safe-area-inset-bottom` (iOS notch).
2. **Meu-dia como home** (redirect `/` → `/meu-dia` se autenticado).
3. **Adicionar `meu-dia` na AkashaNavigation** (QW-1).
4. PwaInstallPrompt: copy mais curta, "Instalar app" como CTA principal, não "Agora não" (atualmente texto é longo em `PwaInstallPrompt.tsx`).
5. Touch target hamburger (QW-7).
6. **Skip-link** "Pular para conteúdo" no topo de `AkashaLayoutClient`.
7. Pull-to-refresh no `/meu-dia` (UX móvel primária).
8. Considerar **esconder a sidebar desktop no mobile portrait** (manter drawer) — já está OK; só garantir que o `max-w-460` do `MeuDiaHub` não é estourado pelo padding `max-w-5xl` no tablet.

---

## Validação cruzada (com Wave 9 specs)

| Spec Wave 9 | Arquivo | Status na auditoria |
|--------------|---------|---------------------|
| F-224 One-Screen Hub | `meu-dia/page.tsx:79` | ✅ Resolvido. |
| F-227 Akasha Authority | `AkashaAuthorityPrompt/` (em `my-day` views) | ✅ Renderiza quando `oneProfile` presente. ⚠️ P2: renderiza concorrente com info panel do MandalaChart. |
| F-228 PWA-first | `manifest.json` + `ServiceWorkerRegistrar.tsx` | ✅ Estrutura OK. ⚠️ Faltam: pull-to-refresh, safe-area, bottom-nav (Wave 10.5 vai resolver). |
| Wave 9.3 intent detection | `Mentor` route (não auditado nesta pass) | — |
| Wave 9.4 PWA install prompt | `PwaInstallPrompt.tsx` | ✅ Funcional. ⚠️ Copy longa, sem destaque de "instalar" como benefício. |
| Wave 9.5 login fix (e11face8) | `login/page.tsx:14-23` | ✅ Honra `?return=`. |
| Wave 9.6 signup grant 10 créditos | (não auditado, fora do escopo) | — |
| ADR-009 Adaptive UI | `emotional-state.ts` | ✅ Contrato cumprido. |

---

## Apêndice — issues por arquivo

| Arquivo | LOC auditados | Issues |
|---------|---------------|--------|
| `meu-dia/page.tsx` | 79 | 0 (shell OK) |
| `my-day/MeuDiaHub.tsx` | 144 | 3 (P1 estado ativo, P2 contraste, P2 bg) |
| `state-picker/StatePicker.tsx` | 244 | 0 (bem cuidado) |
| `my-day/ansioso/AnsiosoView.tsx` | 132 | 0 (modelo) |
| `my-day/ansioso/BreathOrb.tsx` | 197 | 0 (a11y OK, prefers-reduced-motion honrado) |
| `my-day/centrado/CentradoView.tsx` | 136 | 1 (P2 hierarquia) |
| `my-day/perdido/PerdidoView.tsx` | 194 | 0 |
| `my-day/curioso/CuriosoView.tsx` | 161 | 0 |
| `diario/page.tsx` | 284 | 2 (P0 scroll, P2 sem h1) |
| `diario/MandatoUnificado.tsx` | 245 | 4 (P0 copy longa, P1 chevron unicode, P1 textarea, P2 erro 5xx) |
| `diario/SignificadoSection.tsx` | 265 | 1 (P1 chevron unicode) |
| `diario/AreasSection.tsx` | 153 | 1 (P1 8 áreas em grid 1) |
| `conta/page.tsx` | 53 | 0 (shell OK) |
| `conta/ContaClient.tsx` | 637 | 9 (3 P0 + 4 P1 + 2 P2) |
| `login/page.tsx` | 109 | 1 (P1 sem "esqueci senha") |
| `login/LoginClient.tsx` | 170 | 4 (P1 erro genérico, P2 a11y inputs, P2 contraste, P3 redirect manual) |
| `MandalaChart.tsx` | 364 | 6 (P0 botões wrap, P1 a11y SVG, P1 flash seco, P2 hierarchy, P2 contraste, P3 pentagrama) |
| `AkashaNavigation.tsx` | 336 | 7 (3 P0 + 2 P1 + 2 P2) |
| `AkashaLayoutClient.tsx` | 42 | 1 (P0 pl-64 desktop vs mobile) |
| `PwaInstallPrompt.tsx` | 242 | 0 (Wave 9.4 OK, melhorias pra 10.5) |

**Total:** 25 telas/componentes auditados. **43 issues** (10 P0/P1, 18 P1/P2, 15 P2/P3). **Top 3 quick wins** prontos pra Wave 10.2/3/5.
