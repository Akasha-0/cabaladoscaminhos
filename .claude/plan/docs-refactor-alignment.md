# Plano de Refatoração — Alinhar a Interface com a Documentação (`@docs/`)

> **Tipo:** Plano de implementação multi-ciclo (planejamento, sem execução de código).
> **Data:** 2026-06-02
> **Branch:** `claude/docs-refactor-alignment-FOUqN`
> **Escopo aprovado pelo operador (2026-06-02):** Visual/UI completo (Doc 13+05) + features B2B (Doc 16 Onda D+E) · paleta rápida · 1 ADR por ciclo (cirúrgico) · reconciliação de docs (Doc 16 §6).
> **Análise:** Doc 16 já consolidou a auditoria Visão × Código (AD-01 a AD-12). O wrapper Codex/Gemini **não está instalado** neste ambiente; o plano abaixo sintetiza as duas perspectivas a partir do Doc 16 + do estado real do código mapeado.

---

## 0. TL;DR — Ondas do plano

| Onda | Tema | ADRs | Esforço | Risco | Pré-requisito |
|---|---|---|---|---|---|
| **0** | Reconciliação de docs (Doc 16 §6) | — | 0.5d | 🟢 Baixo | nenhum |
| **A** | Fundação visual: tokens Ramiro v2 no escopo B2B | AD-08 | 0.5d | 🟢 Baixo | nenhum |
| **B** | Cockpit existente alinhado (cores/tipografia/estados) | AD-08, AD-09, AD-10, AD-11 | 1.5d | 🟡 Médio | A |
| **C** | Features B2B pendentes (Dashboard, DossierViewer, Q&A Chat, ClientForm, Nav) | AD-06, AD-11, AD-12 | 3-4d | 🔴 Alto | A, B |
| **D** | Polish & QA (micro-interações, responsividade, a11y) | AD-12 §5/§9 | 1d | 🟡 Médio | C |
| **E** | Validação final & go-live checklist | todos | 0.5d | 🟢 Baixo | A,B,C,D |

**Total estimado:** 7-8 dias úteis (1 sprint + meio). Cada onda é um ciclo independente, com critérios de aceitação próprios, e pode ser executada/verificada/cancelada sem afetar as outras.

---

## 1. Estado Atual (mapeado) — Lacunas Docs × Código

### 1.1 Inventário de gaps (referência cruzada)

| # | Lacuna | Doc de origem | Onda |
|---|---|---|---|
| G1 | `HouseCell` usa `bg-slate-900/80` + sombra **dourada** `rgba(212,175,55,0.1)` e **indigo** para badge do Odu | Doc 13 §3+§4 | A,B |
| G2 | `HouseInputPopover` usa `bg-slate-900`, `indigo-500/10` no campo Odu | Doc 13 §4.2 | A,B |
| G3 | `CockpitHeader` usa `bg-slate-900/50`, `text-slate-200`, `bg-indigo-500` no dot "0 odus" | Doc 13 §3+§4 | A,B |
| G4 | `CockpitOracular` usa `bg-slate-950` outer + sombra **dourada** `rgba(212,175,55,0.05)` no grid container | Doc 13 §6 | A,B |
| G5 | `CockpitSidebar` usa `bg-slate-900/80`, `text-slate-400` — não usa tokens Ramiro | Doc 13 §3+§4 | A,B |
| G6 | `globals.css` ainda tem tokens **índigo** (`#4338ca`) no `@theme` raiz (escopo fora de `.ramiro`) | Doc 13 §3.1 / Doc 16 AD-08 | A |
| G7 | **Dashboard B2B não existe** (apenas `/dashboard` B2C legado, quarentenado) | Doc 05 §3 / Doc 16 AD-06.4 | C |
| G8 | **DossierViewer não existe** (rota API existe, falta UI com índice sticky + 2 painéis + Lora) | Doc 05 §5 | C |
| G9 | **Tela "Consultar o Oráculo" (Q&A) não existe** (motor + API prontos; falta UI de chat com bolhas royal/laranja + chips de roteamento) | Doc 05 §9 / Doc 12 §8 | C |
| G10 | **Formulário de cadastro de consulente não existe** (rota API existe, falta form com 3 grupos + autocomplete de cidade) | Doc 05 §6 | C |
| G11 | **Navegação B2B (sidebar com 4 itens) não existe** (Doc 05 §2) | Doc 05 §2 / Doc 16 AD-11 | C |
| G12 | Docs 03, 04, 08, 09 ainda descrevem Next 14/NextAuth/`generate-dossier` — drift | Doc 16 §6 | 0 |
| G13 | `AD-02` (single source of truth das 36 cartas) já aplicado ao `HouseInputPopover`, mas `oracle-cards.ts` legado e `lenormand/data.ts` (42 cartas) seguem no repo | Doc 16 AD-02 | B (cleanup) |
| G14 | `astrologia/swiss-ephemeris.ts` é aproximação própria — sem validação | Doc 16 AD-04 | (deixar para Fase 2 — D-pendente do operador) |
| G15 | PDF do dossiê ainda usa `jsPDF` legado; Doc 03/05 cita `@react-pdf`/Puppeteer | Doc 16 §2.1 | (deixar para Fase 3 — Doc 08 S6) |

### 1.2 Itens já aplicados (não entram no plano)

- **AD-01** Quarentena B2C via middleware flag `LEGACY_B2C` ✅
- **AD-03** Identidade Operator (JWT próprio) + tela `/cockpit/login` + portão de auth + logout ✅
- **AD-09** Fontes Cinzel + Cormorant + Lora + JetBrains Mono no `layout.tsx` + tokens `--font-dossier`/`--font-mono` no `globals.css` ✅
- **AD-02 (parcial)** `HouseInputPopover` importa de `LENORMAND_CARDS` (canônico) ✅ — falta só deprecar `oracle-cards.ts` e `lenormand/data.ts` (G13)

---

## 2. ONDA 0 — Reconciliação de Docs (Doc 16 §6)

> **Tipo:** Texto. Não toca em código. Pode ser feita em uma única PR.

### 2.1 Edições nos docs

| Doc | Seção | Mudança |
|---|---|---|
| `docs/03_architecture-spec.md` | §2 (Stack) | Trocar "Next 14, React 18, Tailwind 3.4, NextAuth, Shadcn" → "Next 16, React 19, Tailwind v4, **JWT próprio (Operator)**, Prisma 7". |
| `docs/03_architecture-spec.md` | §3 (Diretórios) | Trocar árvore `(dashboard)/nova-consulta`, `/api/generate-dossier` → árvore real: `app/cockpit/`, `app/api/mesa-real/`, `app/api/consult/`, `app/api/operator/auth/`. |
| `docs/03_architecture-spec.md` | §5 (Env vars) | `NEXTAUTH_SECRET/URL` → `JWT_SECRET`; manter `OPENAI/ANTHROPIC_MODEL`. |
| `docs/04_data-model.md` | §1 (Relações) | Trocar `User` por `Operator` em `Reading.operator`, `Consultation.operator`. |
| `docs/04_data-model.md` | §2.1-2.4 (Mapas) | Adicionar campos enriquecidos do G3 (Doc 10): `impression`, `destiny` (alias), `pinnacles`, `personalCycles`, `rulingArcana`, `gematria`, `karmicLessons`, `elements`, `modalities`. |
| `docs/08_roadmap.md` | S1.3, S2.6, S6 | Trocar "NextAuth + tela de Login" → "Auth JWT própria (Operator)"; `NEXTAUTH_SECRET` → `JWT_SECRET`. |
| `docs/09_master-agent-prompt.md` | §4, §6, §7 | Atualizar stack/rotas/pastas reais; **manter intactas** as Regras Invioláveis §5. |
| `docs/00_README.md` | Índice | Já contém Doc 16 ✅ — verificar ordem e links. |

### 2.2 Verificação

- [ ] `grep -r "NextAuth\|generate-dossier\|/nova-consulta" docs/03 docs/04 docs/08 docs/09` → **0 ocorrências**.
- [ ] `grep -r "NEXTAUTH" docs/` → **0 ocorrências**.
- [ ] Cada doc referenciado aponta para a stack/rotas reais com exemplos verificáveis.

---

## 3. ONDA A — Fundação Visual (paleta Ramiro v2 no escopo B2B)

> **ADR:** AD-08 (parcial — escopo `.ramiro` já existe; falta promover para `:root` após AD-01 ✅).
> **Princípio:** trocar raw `slate-*`, `indigo-*`, `gold rgba(...)` por **tokens semânticos do Tailwind v4** (`bg-background`, `text-primary`, `border-border`, `bg-primary`) que dentro do escopo `.ramiro` (já aplicado em `cockpit/page.tsx`) resolvem para Ramiro v2.

### 3.1 Substituições canônicas (referência para todas as ondas seguintes)

| Antigo (legado) | Novo (Ramiro) | Onde atua |
|---|---|---|
| `bg-slate-950` / `bg-slate-900` / `bg-slate-800` / `bg-slate-700` | `bg-background` / `bg-card` / `bg-popover` / `bg-muted` | Containers |
| `text-slate-100` / `text-slate-200` / `text-slate-300` / `text-slate-400` / `text-slate-500` | `text-foreground` / `text-foreground/90` / `text-muted-foreground` / `text-muted-foreground/80` / `text-muted-foreground/60` | Tipografia |
| `border-slate-800` / `border-slate-700` | `border-border` | Bordas |
| `bg-indigo-500/10`, `border-indigo-500/30`, `text-indigo-400` | `bg-secondary/10`, `border-secondary/30`, `text-secondary` (royal) | Badge Odu, focus |
| `text-orange-400`, `border-orange-600/50`, `bg-orange-500/10` | `text-primary`, `border-primary/50`, `bg-primary/10` | Casa preenchida, CTA |
| `shadow-[0_0_15px_rgba(212,175,55,0.1)]` (dourado) | `shadow-[0_0_15px_var(--accent-orange-glow)]` | Slot preenchido |
| `shadow-[0_0_80px_rgba(212,175,55,0.05)]` (dourado) | `shadow-[0_0_80px_var(--accent-royal-glow)]` | Grid container |
| `text-orange-500/70` (número da casa) | `text-primary/70` | Mono display |

### 3.2 Passos de execução

1. **A.1 — Auditar todos os componentes do cockpit** e listar classes slate/indigo/gold residuais.
   - Comando: `grep -rE "slate-[0-9]+|indigo-[0-9]+|rgba\(212,?175,?55" src/components/cockpit/ src/app/cockpit/`.
2. **A.2 — Aplicar o mapeamento da §3.1** em todos os arquivos do escopo B2B.
3. **A.3 — Manter as exceções intencionais** (ex.: `text-rose-500` no botão "Limpar Mesa" — `accent-alert` é um token separado).
4. **A.4 — Verificar build + lint + smoke test**:
   - `npm run build` deve passar.
   - `npm run lint` deve passar.
   - `/cockpit` deve renderizar com a paleta Ramiro (sem dourado, sem indigo nas cores principais).

### 3.3 Critérios de aceitação

- [ ] Zero ocorrências de `slate-[0-9]` em `src/components/cockpit/`.
- [ ] Zero ocorrências de `rgba(212,175,55,...)` (dourado) em `src/components/cockpit/`.
- [ ] `indigo-*` aparece **apenas** em `text-indigo-*` para variantes secundárias (badge Odu) e mapeia para royal dentro do escopo.
- [ ] Visualmente: fundo escuro azulado, slot preenchido com glow laranja royal, badge Odu em royal.

---

## 4. ONDA B — Cockpit Existente Alinhado (HouseCell, Popover, Header, Sidebar, Grid)

> **ADRs:** AD-08, AD-09, AD-10, AD-11. Após esta onda, o cockpit existente bate 100% com Doc 05 §4 (macro-layout, grid, popover, painel do consulente).

### 4.1 B.1 — `HouseCell` (Doc 05 §4.3 — `CasaSlot` estados vazio/preenchido)

**Arquivo:** `src/components/cockpit/HouseCell.tsx`

**Estado vazio (substituir):**
- Container: `bg-slate-900/80 border border-dashed border-slate-700` → `bg-card/50 border border-dashed border-border`
- Hover: `hover:border-orange-500/50 hover:bg-slate-900/90` → `hover:border-primary/50 hover:bg-card/70`
- Número da casa: `text-slate-600` → `text-muted-foreground/60` com `font-mono` (JetBrains)
- Ícone `+`: `text-slate-600` → `text-muted-foreground/40`
- Nome da casa: `text-slate-600` → `text-muted-foreground/50` uppercase tracking-widest

**Estado preenchido (substituir):**
- Container: `bg-gradient-to-b from-slate-800 to-slate-900` → `bg-gradient-to-b from-card/80 to-background/80`
- Borda: `border-orange-600/50` → `border-primary/50`
- **Sombra dourada** `shadow-[0_0_15px_rgba(212,175,55,0.1)]` → laranja `shadow-[0_0_15px_var(--accent-orange-glow)]`
- Hover: idem, intensifica glow para `var(--accent-orange-glow)` mais forte (18%).
- **Badge Odu**:
  - `bg-indigo-900/30 border-indigo-500/30 text-indigo-400` → `bg-secondary/15 border-secondary/40 text-secondary-foreground` (royal)
  - Variante do Badge ideal: `variant="kabala"` ou `variant="odu"` (Doc 13 §4.3) — criar/atualizar variantes em `src/components/ui/badge.tsx`.

**Estado ativo (popover aberto):**
- `ring-2 ring-orange-500` → `ring-2 ring-primary`
- Glow interno: `bg-orange-500/5` → `bg-primary/5`

### 4.2 B.2 — `HouseInputPopover` (Doc 05 §4.4)

**Arquivo:** `src/components/cockpit/HouseInputPopover.tsx`

- Container: `bg-slate-900 border-slate-700` → `bg-popover border-border`
- Header: `bg-slate-800/80 border-slate-700/50` → `bg-card/80 border-border/50`
- Labels: `text-slate-400` → `text-muted-foreground`
- Input: `bg-slate-800/50 border-slate-700/50 focus:border-orange-500/50` → `bg-muted/50 border-border/50 focus:border-primary/50`
- **Campo Odu em foco**: `border-indigo-500/50` → `border-secondary` (royal)
- Suggestion list: `bg-slate-800/80 border-slate-700/50` → `bg-muted/80 border-border/50`
- Suggestion hover: `hover:bg-slate-700/50` → `hover:bg-muted`
- **Selected Carta card** (confirmação): `bg-orange-500/10 border-orange-500/30 text-orange-400` → `bg-primary/10 border-primary/30 text-primary` ✅
- **Selected Odu card** (confirmação): `bg-indigo-500/10 border-indigo-500/30 text-indigo-400` → `bg-secondary/10 border-secondary/30 text-secondary` (royal)
- Botão confirmar: `variant="golden"` → verificar se já é laranja (Doc 16 AD-09 ✅); manter.

### 4.3 B.3 — `CockpitHeader` (Doc 05 §4 macro)

**Arquivo:** `src/components/cockpit/CockpitHeader.tsx`

- Container: `bg-slate-900/50 border-slate-800/50` → `bg-background/50 border-border/50`
- Card de contagem: `bg-gradient-to-br from-orange-500/20 to-orange-600/20` → `bg-gradient-to-br from-primary/20 to-primary/30`
- Border card: `border-orange-500/30` → `border-primary/30`
- Texto número: `text-orange-400` → `text-primary`
- Indicador /36: `bg-slate-900 border-slate-700` → `bg-background border-border`
- Texto /36: `text-slate-400` → `text-muted-foreground`
- **Stats dots**: `bg-orange-500`, `bg-indigo-500`, `bg-slate-500` → `bg-primary`, `bg-secondary`, `bg-muted-foreground/50` (royal/laranja/muted)

### 4.4 B.4 — `CockpitSidebar` (Doc 05 §4.2 — Painel do Consulente)

**Arquivo:** `src/components/cockpit/CockpitSidebar.tsx`

- Substituir todas as classes `slate-*` por tokens semânticos conforme §3.1.
- **Badge variantes** para mapas (Doc 13 §4.3):
  - Astrologia → `variant="astro"` (royal-dim bg)
  - Cabala → `variant="kabala"` (royal/10)
  - Tântrica → `variant="tantric"` (orange-dim/15)
  - Odu → `variant="odu"` (royal/15)
  - Criar/atualizar variantes em `src/components/ui/badge.tsx` se ausentes.
- **Botão "Gerar Dossiê"** (mestre, ao final): `bg-primary hover:bg-primary/90` (laranja) — idealmente extrair para `<Button variant="spiritual">` já existente em `ui/spiritual-button.tsx` (verificar).

### 4.5 B.5 — `CockpitOracular` (Doc 05 §4.1 — Layout macro)

**Arquivo:** `src/components/cockpit/CockpitOracular.tsx`

- `bg-slate-950` outer → `bg-background`
- Grid container: `bg-slate-900/50 border-slate-800/50` → `bg-card/50 border-border/50`
- **Sombra dourada do container**: `shadow-[0_0_80px_rgba(212,175,55,0.05)]` → `shadow-[inset_0_0_60px_var(--accent-royal-glow)]` (Doc 05 §4.3)
- Grid glow overlay: `bg-gradient-to-b from-orange-500/5 to-transparent` → `bg-gradient-to-b from-primary/5 to-transparent`
- Legend boxes: `bg-slate-800 border-slate-600` → `bg-muted border-border`; filled `border-orange-600/50` → `border-primary/50`; active `ring-orange-500` → `ring-primary`

### 4.6 B.6 — Limpeza AD-02 (single source of truth)

- `src/lib/divination/oracle-cards.ts` (carta 24 = "A Borboleta" — errada): **deprecar** (mover para `src/_legacy/` ou marcar `@deprecated` com comment apontando para `lenormand-cards.ts`).
- `src/lib/lenormand/data.ts` (baralho 42 cartas obsoleto): **deprecar** (Doc 16 §9.4).
- Verificar com: `grep -r "A Borboleta\|A Caveira" src/` → 0 ocorrências (depois da deprecação).

### 4.7 Critérios de aceitação da Onda B

- [ ] `/cockpit` renderiza com a paleta Ramiro v2 completa (zero dourado, zero indigo nas cores principais).
- [ ] Hover/active/filled states da `HouseCell` seguem Doc 05 §4.3 exatamente.
- [ ] Popover confirma com `bg-primary/10` (laranja) para carta e `bg-secondary/10` (royal) para Odu — dual Ramiro.
- [ ] Card de contagem (`/36`) pulsa em laranja quando mesa completa (Doc 05 §8 — "Botão Gerar Dossiê pulsa em laranja").
- [ ] `npm run build && npm run lint` passam.
- [ ] `npm run test:run` mantém os 9.771+ testes (não regredir — instinto histórico "B2C legacy drift" se aplica).

---

## 5. ONDA C — Features B2B Pendentes (Doc 16 Onda D + E § 4.4, § 4.5, § 4.6)

> **ADRs:** AD-06 (prioridade 4-6), AD-11, AD-12. Esta é a onda de maior risco. Cada item é uma entrega verificável.

### 5.1 C.1 — Dashboard B2B (Doc 05 §3 / Doc 16 AD-06.4)

**Objetivo:** substituir o `/dashboard` B2C (quarentenado) por uma página B2B com métricas reais do operador autenticado.

**Rota:** `/cockpit/dashboard` (não `/dashboard` — está quarentenado).
**Server Component:** `src/app/cockpit/dashboard/page.tsx`.
**Proteção:** reusar `getOperatorFromServerContext` (já existe).

**Componentes:**
- `src/components/cockpit/dashboard/MetricsCards.tsx` — 3 cards: "Consultas este mês", "Consulentes cadastrados", "Hoje pendentes". Usar dados reais via Prisma.
- `src/components/cockpit/dashboard/RecentReadings.tsx` — tabela com últimas 10 leituras (nome, data, status, ação "Ver").
- `src/components/cockpit/dashboard/QuickActions.tsx` — botão "Nova Consulta" (laranja, link para `/cockpit`).

**Tokens visuais:**
- Cards de métrica: `bg-card/60 border-border` com número grande em `text-primary` (laranja) e label em `text-muted-foreground`.
- Tabela: `bg-card/40 border-border`; status `COMPLETED` em `bg-secondary/15 text-secondary` (royal); `PENDING` em `bg-primary/15 text-primary`; `ERROR` em `bg-destructive/15 text-destructive`.

**API route (reuso):** `/api/mesa-real/readings` (já existe — verificar auth/Operator gate) + `prisma.client.count` para consulentes.

### 5.2 C.2 — DossierViewer (Doc 05 §5)

**Objetivo:** tela que consome o stream de `/api/mesa-real/generate` e renderiza o dossiê em dois painéis (índice sticky + conteúdo).

**Rota:** `/cockpit/leituras/[id]` (não `/dashboard/leituras/[id]` — quarentenado).
**Server Component:** `src/app/cockpit/leituras/[id]/page.tsx`.
**Proteção:** `getOperatorFromServerContext` + verificar `reading.operatorId === operator.id`.

**Componentes:**
- `src/components/cockpit/dossier/DossierViewer.tsx` (Client) — consome stream SSE, renderiza Markdown com `react-markdown` + `remark-gfm`.
- `src/components/cockpit/dossier/DossierIndex.tsx` — índice sticky com âncoras por casa e por capítulo da síntese.
- `src/components/cockpit/dossier/DossierHeader.tsx` — botão "Voltar à Mesa", título, data, contador X/36, botão "Exportar PDF" (placeholder para Fase 3).
- `src/components/cockpit/dossier/LoadingOrbital.tsx` — loader orbital laranja (Doc 05 §5 "Loader orbital animado em laranja").
- `src/components/cockpit/dossier/StreamingProgress.tsx` — barra de progresso "X/36 casas" durante geração.

**Tipografia (Doc 05 §5 + Doc 13 §5):**
- Container do conteúdo: `font-dossier` (Lora) `text-[15px] leading-[1.8] text-foreground/90 max-w-[720px]`.
- `h2` (casas): `font-cinzel text-primary text-[18px] border-b border-border pb-2 mt-9`.
- `em` (linha-síntese): `text-secondary font-medium text-[12px] not-italic` (royal-bright, Doc 13 §6.2).
- `blockquote` (conselho): `border-l-2 border-secondary pl-4 italic text-muted-foreground`.

**Tokens visuais:**
- Container principal: `bg-card/30 border-border`.
- Índice: `bg-card/60 border-r border-border` com links `text-muted-foreground hover:text-primary` e ativo `text-primary font-medium`.
- Streaming: cada chunk de texto chega via SSE → concatena em estado local → markdown rerenderiza.

**API route:** `/api/mesa-real/generate` (já existe; verificar se já tem SSE/streams). Se for JSON polling, refatorar para streaming com `ReadableStream`.

### 5.3 C.3 — Tela "Consultar o Oráculo" (Q&A Chat) (Doc 05 §9 + Doc 12 §8)

**Objetivo:** chat ancorado num `Reading` específico, com bolhas royal (oráculo) e laranja (usuário), chips de roteamento e streaming.

**Rota:** `/cockpit/leituras/[id]/consulta` (sub-rota do DossierViewer).
**Componente Client:** `src/components/cockpit/consultation/OraculoChat.tsx`.

**Estrutura:**
```
┌────────────────────────────────────────────────┐
│ Header: "Consultar o Oráculo" + nome do cliente│
├────────────────────────────────────────────────┤
│ Bolhas (scroll reverso, top-down):             │
│   [user] (laranja, dir) — "E quanto ao amor?"  │
│   [oracle] (royal, esq) — Lora, chips [C24]    │
├────────────────────────────────────────────────┤
│ Input fixo: [textarea] [Enviar → (laranja)]    │
└────────────────────────────────────────────────┘
```

**Componentes:**
- `OraculoChat.tsx` — orquestra estado (lista de mensagens, input, streaming).
- `UserBubble.tsx` — `bg-primary/15 border-primary/30 text-primary` alinhado à direita.
- `OracleBubble.tsx` — `bg-secondary/12 border-secondary/30 text-foreground` alinhado à esquerda, `font-dossier`, com `routedHouses` chips.
- `RoutingChips.tsx` — `bg-secondary/15 text-secondary border border-secondary/40 rounded-full` mostrando "Casa 24 · Casa 22".
- `ConsultationInput.tsx` — textarea + botão "Enviar" (laranja), Enter envia, Shift+Enter quebra linha.

**API:** `/api/consult` (já existe, verificar SSE). Streaming via `ReadableStream`.

**Persistência:** `Consultation` + `ChatMessage` (modelos já existem, Doc 12 §3 ✅).

### 5.4 C.4 — Formulário de Cadastro de Consulente (Doc 05 §6)

**Objetivo:** form com 3 grupos (Identificação, Local, Anotações) + cálculo automático dos 4 mapas.

**Rota:** `/cockpit/consulentes/novo`.
**Componente Client:** `src/components/cockpit/clients/ClientForm.tsx` + `ClientMapPreview.tsx`.

**Estrutura (3 grupos):**
1. **Identificação:** Nome Completo (full), Data Nascimento (date), Hora Nascimento (time HH:MM).
2. **Local:** Cidade (Combobox com Google Places API — verificar env `NEXT_PUBLIC_GOOGLE_PLACES_KEY`), Estado (auto), País (auto).
3. **Anotações:** Textarea livre.

**Após salvar:** indicador de progresso ("Calculando mapa astral...", "Processando numerologias..."), depois redireciona para `/cockpit/consulentes/[id]`.

**Validação:** Zod (reusar do projeto).
**Server Action:** `createClient` (já existe conforme Doc 16 §2.3; verificar se está completo com mapas enriquecidos).

### 5.5 C.5 — Navegação B2B (Doc 05 §2 + Doc 16 AD-11)

**Objetivo:** sidebar de navegação canônica com 4 itens: Nova Consulta · Consulentes · Dashboard · Leituras.

**Componente:** `src/components/cockpit/navigation/B2BNav.tsx` (substituir ou complementar `CockpitSidebar`).
**Posicionamento:** dentro de `cockpit/layout.tsx` (criar se não existir), fixo `w-72` (Doc 05 §2).

**Estilo (Doc 05 §2):**
- Logo no topo + nome "Cabala dos Caminhos".
- 4 itens de nav com ícones (Lucide): `Sparkles` (Nova Consulta), `Users` (Consulentes), `LayoutDashboard` (Dashboard), `FileText` (Leituras).
- Item ativo: `bg-secondary/15 text-primary border-l-2 border-primary`.
- Bottom: card "Perfil do operador" com nome + botão Sair (já existe logout no header, mover para cá se for o padrão).
- Estilo geral: `bg-background border-r border-border`.

**Reaproveita:** o logout já implementado em `CockpitHeader.tsx:31-38`.

### 5.6 Critérios de aceitação da Onda C

- [ ] `/cockpit/dashboard` renderiza métricas reais do Prisma (3 cards + tabela últimas leituras).
- [ ] `/cockpit/leituras/[id]` consome stream de `/api/mesa-real/generate`, renderiza com Lora, índice sticky, h2 laranja, em royal.
- [ ] `/cockpit/leituras/[id]/consulta` renderiza chat; pergunta "amor" roteia para Casa 24 e mostra chip.
- [ ] `/cockpit/consulentes/novo` valida com Zod, calcula 4 mapas, persiste via Server Action.
- [ ] Sidebar de navegação com 4 itens, item ativo destacado em laranja, sem itens B2C.
- [ ] `npm run build && npm run lint && npm run test:run` passam.

---

## 6. ONDA D — Polish & QA

> **ADRs:** AD-12 §5/§9. Refinamento de experiência.

### 6.1 D.1 — Micro-interações (Doc 05 §8)

- Slot preenchido: animação `scale(1.02) + glow pulse 0.3s` ao confirmar.
- Botão "Gerar Dossiê" pulsa em laranja quando todas as 36 casas estão preenchidas (`@keyframes pulse-orange` no `globals.css`).
- Transição vazio → preenchido: `fade + slide-up` da carta e Odu no slot.
- Loading do dossiê: loader orbital de partículas em laranja (SVG inline ou Framer Motion).
- Streaming do dossiê: cada token chega via SSE → fade-in linha a linha.

### 6.2 D.2 — Responsividade (Doc 05 §7)

| Breakpoint | Comportamento |
|---|---|
| `xl` (1280px+) | Layout completo: sidebar fixa + grid 9×4 + painel de mapas |
| `lg` (1024px) | Painel de mapas colapsa para badge compacto clicável |
| `md` (768px) | Sidebar vira drawer hamburguer; grid 9×4 mantido com fonte menor |
| `sm` (640px) | Grid vira lista accordion de 36 itens; botão "Gerar Dossiê" fixo no bottom |

### 6.3 D.3 — Acessibilidade

- Aria-labels em todos os botões de ícone.
- `prefers-reduced-motion` desativa animações de slot e pulse.
- Focus visible em todos os elementos interativos (outline `ring-primary/60`).
- Contraste AA verificado em todas as combinações de cor (laranja+royal no fundo escuro passa — verificar com Lighthouse).
- Teclado: Esc fecha popover, Enter confirma, Tab alterna carta↔odu (já existe no `HouseInputPopover` ✅).

### 6.4 D.4 — Performance

- `React.memo` no `HouseCell` (evita re-render de 36 células ao mudar 1).
- `useCallback` em handlers do `CockpitOracular` (já parcialmente feito).
- Streaming chunkado em 50-100 tokens (evita overwhelm do rerender).
- Lazy-load de componentes pesados (`DossierViewer` com `next/dynamic` + `ssr: false`).

### 6.5 Critérios de aceitação da Onda D

- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95 em `/cockpit`.
- [ ] Animações de slot funcionam visualmente.
- [ ] Responsividade verificada em viewport 1280px, 1024px, 768px, 375px.
- [ ] Teste de teclado: navegar cockpit inteiro sem mouse.

---

## 7. ONDA E — Validação Final & Go-Live Checklist

> Checklist baseado em Doc 08 § "Checklist de Go-Live".

- [ ] Todos os mapas enriquecidos validados com 5 casos conhecidos (Doc 11 §2.7).
- [ ] Dossiê gerado para 1 consulta completa de teste (36 casas) — Doc 06 §1 (3 parágrafos por casa + síntese em 4 capítulos + veredito).
- [ ] Q&A testado: "e quanto à minha vida amorosa?" roteia para Casa 24 e responde ancorada.
- [ ] `npm run build` passa; `npm run lint` passa; `npm run test:run` mantém ≥ 9.771 testes.
- [ ] `middleware.ts` com `LEGACY_B2C=off` verificado em runtime (Doc 16 AD-01): `/cockpit`→200, `/dashboard`→307→/cockpit.
- [ ] `JWT_SECRET` rotacionado para produção; chaves de API separadas de dev.
- [ ] Backup do Postgres configurado.
- [ ] `quality-evolution-history.json` atualizado; novo ciclo de memória gravado.

---

## 8. Riscos & Mitigações

| Risco | Onda | Mitigação |
|---|---|---|
| Regressão de testes por troca de classes | A, B | Rodar `npm run test:run` após cada arquivo; se drift pré-existente, registrar em cycle memory (instinto histórico "B2C legacy drift") |
| Build quebra com `@theme` em `globals.css` | A | Verificar dev server overlay vs `npm run build` (instinto "Turbopack stale HMR") |
| Streaming SSE não suportado em runtime | C | Fallback para JSON polling com progressive render |
| Validação astrológica (AD-04) diverge | (fora de escopo) | Manter aproximação com flag `provisional: true` (Doc 11 §4.1) |
| Quarentena B2C revertida acidentalmente | — | `LEGACY_B2C` flag, não mover arquivos; Doc 16 AD-01 |
| Fallow reportando falsos positivos de "unused files" | todas | Instinto "fallow config Next.js App Router" — não deletar arquivos por relatório |

---

## 9. Estratégia de Execução Recomendada (1 ADR por ciclo)

| Ciclo | Onda | ADR | Entregável | Verificação |
|---|---|---|---|---|
| C-N+1 | 0 | — | Docs 03, 04, 08, 09 reconciliados | `grep` 0 ocorrências de NextAuth/generate-dossier |
| C-N+2 | A | AD-08 | Tokens Ramiro propagados (sem refactor visual) | Build verde, paleta idêntica visualmente |
| C-N+3 | B.1 | AD-10 | `HouseCell` alinhada (1 arquivo) | Screenshot + lint |
| C-N+4 | B.2 | AD-10 | `HouseInputPopover` alinhado (1 arquivo) | Screenshot + lint |
| C-N+5 | B.3-B.5 | AD-10, AD-11 | Header/Sidebar/Oracular + cleanup AD-02 | Build verde, navegação funcionando |
| C-N+6 | C.1 | AD-06.4 | Dashboard B2B | Métricas reais do Prisma |
| C-N+7 | C.2 | AD-12 §5 | DossierViewer com streaming | Dossiê gerado e renderizado |
| C-N+8 | C.3 | AD-12 §9 + Doc 12 | Q&A Chat UI | Chat funcional com chips |
| C-N+9 | C.4 | Doc 05 §6 | ClientForm | Cadastro + 4 mapas calculados |
| C-N+10 | C.5 | AD-11 | Nav B2B única | 4 itens, sem B2C |
| C-N+11 | D | AD-12 polish | Micro-interações + a11y | Lighthouse ≥ 90 |
| C-N+12 | E | — | Go-live checklist | Todos os itens checados |

**Sugestão:** executar Onda A + B juntas num único ciclo (são rápidas e correlacionadas), depois C item por item, depois D e E.

---

## 10. Arquivos-Chave (referência consolidada)

### 10.1 A criar (Onda C)

| Arquivo | Descrição |
|---|---|
| `src/app/cockpit/dashboard/page.tsx` | Server Component — Dashboard B2B |
| `src/app/cockpit/leituras/[id]/page.tsx` | Server Component — DossierViewer |
| `src/app/cockpit/leituras/[id]/consulta/page.tsx` | Server Component — Q&A Chat |
| `src/app/cockpit/consulentes/novo/page.tsx` | Server Component — ClientForm |
| `src/app/cockpit/consulentes/[id]/page.tsx` | Server Component — Perfil |
| `src/app/cockpit/layout.tsx` | Layout B2B com sidebar de nav |
| `src/components/cockpit/dashboard/MetricsCards.tsx` | Cards de métricas |
| `src/components/cockpit/dashboard/RecentReadings.tsx` | Tabela de leituras |
| `src/components/cockpit/dossier/DossierViewer.tsx` | Renderizador principal |
| `src/components/cockpit/dossier/DossierIndex.tsx` | Índice sticky |
| `src/components/cockpit/dossier/LoadingOrbital.tsx` | Loader animado |
| `src/components/cockpit/consultation/OraculoChat.tsx` | Orquestrador do chat |
| `src/components/cockpit/consultation/UserBubble.tsx` | Bolha do usuário |
| `src/components/cockpit/consultation/OracleBubble.tsx` | Bolha do Oráculo |
| `src/components/cockpit/consultation/RoutingChips.tsx` | Chips de transparência |
| `src/components/cockpit/clients/ClientForm.tsx` | Form de cadastro |
| `src/components/cockpit/clients/ClientMapPreview.tsx` | Preview dos 4 mapas |
| `src/components/cockpit/navigation/B2BNav.tsx` | Sidebar com 4 itens B2B |

### 10.2 A modificar (Onda A + B)

| Arquivo | Linhas-alvo | Mudança |
|---|---|---|
| `src/components/cockpit/HouseCell.tsx` | 25-127 | Tokens Ramiro em ambos estados |
| `src/components/cockpit/HouseInputPopover.tsx` | 97-287 | Tokens Ramiro + selected cards |
| `src/components/cockpit/CockpitHeader.tsx` | 40-126 | Tokens Ramiro + stats dots |
| `src/components/cockpit/CockpitSidebar.tsx` | 65-... | Tokens Ramiro + variantes Badge |
| `src/components/cockpit/CockpitOracular.tsx` | 88-191 | Sombra royal, glow laranja |
| `src/components/ui/badge.tsx` | — | Adicionar variants `astro`, `kabala`, `tantric`, `odu` (Doc 13 §4.3) |
| `src/app/globals.css` | — | (opcional) Mover indigo de `@theme` raiz para escopo `.legacy-b2c` se ainda existir |

### 10.3 A deprecar (B.6)

| Arquivo | Status |
|---|---|
| `src/lib/divination/oracle-cards.ts` | Marcar `@deprecated` apontando para `lenormand-cards.ts` |
| `src/lib/lenormand/data.ts` | Mover para `src/_legacy/` ou `@deprecated` (42 cartas obsoleto) |

### 10.4 Docs a modificar (Onda 0)

`docs/03_architecture-spec.md`, `docs/04_data-model.md`, `docs/08_roadmap.md`, `docs/09_master-agent-prompt.md`.

---

## 11. Próximos Passos Imediatos

1. **Revisar este plano** e aprovar/cancelar ondas.
2. **Iniciar pela Onda 0** (docs — texto puro, sem risco) e **Onda A** (tokens) — ambas em um único ciclo.
3. **Seguir para Onda B** (cockpit existente) — 1.5d.
4. **Executar Onda C** item por item (C.1→C.5) — 3-4d.
5. **Fechar com D + E** — 1.5d.

**Para executar este plano em uma nova sessão:**

```bash
/ecc:execute .claude/plan/docs-refactor-alignment.md
```

---

*Plano gerado em 2026-06-02 a partir de Doc 16 (auditoria Visão × Código), Doc 13 (paleta Ramiro), Doc 05 (UI/UX), Doc 08 (roadmap), Docs 11/12/15 (cálculo, Q&A, glossário) e do estado real do código em `src/components/cockpit/`, `src/app/cockpit/`, `middleware.ts`, `prisma/schema.prisma`.*
