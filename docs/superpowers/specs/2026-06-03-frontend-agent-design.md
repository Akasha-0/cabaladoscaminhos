# Pacote Agente Frontend — Sistema Akasha

> **Norte:** Doc 25 + Doc 26.
**Data:** 2026-06-03
**Autor:** Hermes (sessão de design)
**Status:** Draft para revisão de Gabriel

## 1. Contexto e objetivo

O **Sistema Akasha** (`apps/b2c-portal`) é um app B2C Next.js 16 / React 19,
mobile-first, cuja interface é a **Mandala Toroidal** (Three.js/R3F de atmosfera
+ SVG/D3 de dados + glassmorphism) sob o **Design System cósmico Akasha** (Doc 26).
Os ~9k testes dos motores espirituais vivem nos `packages/core-*` (Doc 25 §11).
Trabalhos de frontend (Mandala, onboarding, Dashboard Diário, Manifesto, Agente
Oracular) eram feitos manualmente por Gabriel em sessões de chat ou sprint, sem
um fluxo dedicado.

> **Aposentado:** a identidade "Cigano Ramiro" (laranja+royal) e o `apps/legacy-cockpit`
> (Mesa Real B2B) saem do alvo deste agente — ver Doc 26 §0/§8 (checklist de migração).

**Objetivo:** criar um pacote de "agente de frontend" que
**a)** carregue automaticamente as convenções, tokens e padrões do
projeto e **b)** entregue cada tarefa de UI como **branch + commit +
PR draft** sem merge, respeitando o AGENTS.md (Simplicidade,
Cirúrgico, Espiritual).

**Fora do escopo:** backend, banco, Prisma, API routes, regras de
negócio espiritual (já cobertas pelo agente principal), merge de PRs,
deploy.

## 2. Decisões de design já validadas com Gabriel

| Decisão | Escolha | Por quê |
|---|---|---|
| Forma do pacote | Skill + profile + helpers (não só skill) | Isolamento, workdir fixo, invocação simples |
| Onde mora a skill | `~/.hermes/skills/frontend-cabala/` (user-local) | Não polui repo; itera rápido |
| Modelo | Reusa o do profile default (`minimax-oauth` / `minimax/MiniMax-M3`) | Zero setup de credencial |
| Autonomia | Modo B (autônomo, para só em dúvida) | Compatível com 488 sprints |
| Output | Branch + commit + PR draft, **sem merge** | Rastreável, GitHub visualiza diff |
| Invocação | Standalone (manual, sob demanda) | Sem automação que interfira no fluxo |

## 3. Arquitetura

Quatro peças se compõem como uma pilha. Cada peça tem um
responsabilidade única.

```
┌──────────────────────────────────────────────────────────┐
│ 1. Helpers shell  (~/.local/bin/frontend-*)             │
│    - frontend-task "..."  (one-shot)                     │
│    - frontend-session       (tmux interativo)            │
│    - frontend-review <PR>  (code review focado)          │
├──────────────────────────────────────────────────────────┤
│ 2. Wrapper script  (~/.hermes/profiles/frontend/bin/    │
│    frontend-run)  →  encapsula `hermes chat` com skill   │
│    e contexto injetados                                   │
├──────────────────────────────────────────────────────────┤
│ 3. Skill SKILL.md  (~/.hermes/skills/frontend-cabala/)   │
│    - convenções, padrões, guardrails, workflow           │
├──────────────────────────────────────────────────────────┤
│ 4. Profile  (hermes profile create frontend)             │
│    - workdir=/home/skynet/cabala-dos-caminhos            │
│    - toolsets: file, terminal, browser, skills, search,  │
│      todo, git, gh                                       │
│    - skills auto-carrega: frontend-cabala                │
└──────────────────────────────────────────────────────────┘
```

**Por que quatro peças e não uma só?** Separação de concerns.
- Helpers são estáveis e podem ganhar aliases (`ftask`, `fsess`).
- Wrapper é o "cola" entre shell e Hermes.
- Skill é a documentação procedural — o que **muda** quando o
  design system evolui.
- Profile é config estática — muda raramente.

## 4. Componentes

### 4.1 Skill `frontend-cabala`

**Path:** `~/.hermes/skills/frontend-cabala/SKILL.md`

**Frontmatter:**

```yaml
---
name: frontend-akasha
description: Use when creating, editing or reviewing UI components, pages, layouts, styles, or design-system work in the Sistema Akasha (apps/b2c-portal). Triggers include "componente", "página", "tela", "card", "mandala", "toroide", "onboarding", "dashboard", "refactor visual", "design system", "tailwind", "three.js", "d3", "glassmorphism", "akasha", "style". Loads project conventions for Next.js 16 App Router, Tailwind v4, the Akasha cosmic design tokens (Doc 26), mobile-first PWA, next-intl, and the spiritual guardrails.
version: 1.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [frontend, ui, nextjs, react, tailwind, three.js, d3, design-system, akasha]
    related_skills: [requesting-code-review, brainstorming]
---
```

**Estrutura do body (≤ 12k chars):**

1. **Overview** — agente especialista em UI do Akasha; carrega
   contexto cósmico (Doc 26) e técnico (Doc 25 §8). Tudo mobile-first,
   PWA, com a Mandala Toroidal no centro.
2. **When to Use** — lista de gatilhos (componente, página, layout,
   Mandala, onboarding, dashboard, style, design system) e quando
   **NÃO** usar (API routes, schema Prisma, motores `packages/core-*`).
3. **Stack Quick Reference** — tabela com:
   - Framework: Next.js 16 App Router (`apps/b2c-portal/...`), rotas `/(pt-br|en)/…` (next-intl)
   - Atmosfera (Mandala fundo): Three.js / React Three Fiber — Toroide wireframe/partículas (não carrega dados)
   - Dados (Mandala operacional): **SVG 2D + D3.js** (coordenadas polares: 12 casas, 11 nós, centro) — nós clicáveis no DOM
   - Efeitos: glassmorphism (`backdrop-filter`), glows de nebulosa, Framer Motion / GSAP
   - Variantes: `class-variance-authority` (`cva`)
   - Merge: `cn()` de `@/lib/utils` (clsx + tailwind-merge)
   - Style: Tailwind v4 com CSS variables em `@theme`; tokens cósmicos `akasha`/`aurora`/`ori` (Doc 26 §3)
   - State: `zustand`
   - Forms/validação: `zod` + `react-hook-form` (onboarding)
   - Markdown: `react-markdown` + `remark-gfm` (Manifesto, Dashboard, voz do Oráculo)
   - PDF do Manifesto: `@react-pdf/renderer` (NUNCA Puppeteer — Doc 25 §3)
4. **Estrutura de pastas do projeto** — mapa de decisão (dentro de `apps/b2c-portal`):
   - UI primitivo reutilizável → `components/ui/`
   - Mandala (atmosfera WebGL + dados SVG/D3) → `components/mandala/`
   - Telas-chave (onboarding, dashboard, manifesto, oráculo) → `components/<feature>/`
   - Sistema de design cósmico (tipografia, background toroidal, glass) → `components/design-system/`
   - Página → `app/[locale]/<rota>/page.tsx`
5. **Regra de reuso (não-violável)** — antes de criar componente
   novo, agente DEVE:
   1. Listar `components/ui/*` e verificar se já existe
   2. Listar `components/mandala/*` e `components/<feature>/*`
   3. Listar `components/design-system/*`
   4. Se nada servir, **criar com justificativa** registrada no
      commit message (ex: "feat: novo PillarNode — reuso insuficiente
      porque combina nó SVG/D3 + glow + tooltip do pilar em fluxo único")
6. **Padrões copy-paste** — snippets prontos para:
   - **Nó da Mandala** (casa astrológica, corpo tântrico, núcleo Ori) —
     elemento SVG clicável com glow por estado (ciano=aberto, magenta=curto-circuito)
   - **Card de diagnóstico** (Clima / Ritual / Alerta do Dashboard) com glassmorphism
   - **Onboarding step** ("Coleta Sagrada"/Quiz) com Zod + `useForm` e tom cerimonial
   - **Loading ritualístico** — Toroide Three.js acendendo + frases em sincronia (Doc 25 §6)
   - **Página de resultado** com `react-markdown` para o Manifesto / voz do Oráculo
7. **Guardrails espirituais** — não-fazer:
   - **Sem cores hardcoded** — sempre `bg-primary`, `text-foreground`,
     `bg-card` etc. (apontam para CSS vars)
   - **Sem gradientes bregas** — só os tokens cósmicos `akasha`,
     `aurora` ou `ori` são aceitos (Doc 26 §3)
   - **Voz do Oráculo (Doc 26 §7)** — magnética e situada, nunca genérica
     nem fatalista; sem copy que prometa resultado garantido ou determinação
     médica/jurídica/financeira; alerta é cuidado, não sentença
   - **Sem emojis religiosos exagerados** — `✦`, `✧` (já usados
     pelo projeto) são OK; 🕉️🔮✨ em massa não
   - **Sem animações invasivas** — respeitar `prefers-reduced-motion`
   - **Sem `any`** em props ou state
8. **Workflow obrigatório (10 passos)** — o agente segue esta
   sequência sem pular:
   1. Ler o brief / pedido
   2. `cd /home/skynet/cabala-dos-caminhos && git status --short` —
      worktree limpo?
   3. Checar reuso (regra §5)
   4. Criar branch `feat/<escopo-kebab>` (ou `fix/`, `refactor/`,
      `style/`)
   5. Implementar seguindo stack quick reference
   6. Criar teste em `tests/components/<mesma-estrutura>/<X>.test.tsx`
      com header `/** @vitest-environment jsdom */`
   7. Rodar `npm run test:core -- <pattern>` para validar
   8. Rodar `npx tsc --noEmit` para type-check
   9. Commit com mensagem `feat: <descrição>` (ou tipo apropriado)
      + body justificando reuso quando aplicável
   10. `gh pr create --draft --fill` e reportar URL
9. **Checklist pré-PR** — antes de abrir draft:
   - [ ] Sem `any` em código novo
   - [ ] Acessibilidade: `aria-label` em botões de ícone, `alt` em
     imagens, foco visível
   - [ ] Mobile-first (testar mentalmente em 375px)
   - [ ] Tokens via CSS vars (sem hex inline)
   - [ ] Teste do componente com @testing-library/react
   - [ ] Type-check passa
   - [ ] Test:core passa
   - [ ] Mensagem de commit segue AGENTS.md §10
10. **Quando parar e perguntar** — gatilhos de dúvida (NÃO adivinhar):
    - Brief diz "nó da Mandala" mas não diz qual pilar/dado (casa, corpo, Odu)
    - Múltiplas interpretações de layout equally válidas
    - Pedido toca motor espiritual `packages/core-*` (regra do AGENTS.md §5 —
      parar e pedir)
    - Mudança nos tokens cósmicos / `@theme` (afeta tema inteiro — Doc 26)
    - Qualquer `rm` ou mudança destrutiva

### 4.2 Profile `frontend`

**Comando de criação:**

```bash
hermes profile create frontend \
  --clone \
  --workdir /home/skynet/cabala-dos-caminhos \
  --skills frontend-cabala,requesting-code-review
```

**`~/.hermes/profiles/frontend/config.yaml` final esperado:**

```yaml
model:
  default: minimax/MiniMax-M3
  provider: minimax-oauth
agent:
  max_turns: 50
  tool_use_enforcement: true
terminal:
  backend: local
  cwd: /home/skynet/cabala-dos-caminhos
  timeout: 300
display:
  skin: default
  show_reasoning: false
```

**Toolsets ativos** (configurados via `hermes tools` ou na config
do profile):

```
file, terminal, browser, skills, search, todo, git, gh
```

**Não habilitados (intencional):** delegation, cronjob, kanban,
messaging, vision, image_gen, tts, discord, etc. — mantém o
agente focado.

### 4.3 Wrapper script `frontend-run`

**Path:** `~/.hermes/profiles/frontend/bin/frontend-run`

Linguagem: Bash (simples, auditável). Encapsula:

```bash
#!/usr/bin/env bash
set -euo pipefail

PROMPT="${1:?uso: frontend-run '<brief>'}"
SKILL="frontend-cabala"
PROFILE="frontend"

# Pre-flight checks
command -v gh >/dev/null || { echo "❌ gh não instalado"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "❌ gh não autenticado — rode: gh auth login"; exit 1; }
[ -d "/home/skynet/cabala-dos-caminhos" ] || { echo "❌ workdir não existe"; exit 1; }

exec hermes --profile "$PROFILE" chat \
  --skill "$SKILL" \
  -q "$PROMPT"
```

### 4.4 Helpers shell em `~/.local/bin/`

#### `frontend-task`

```bash
#!/usr/bin/env bash
# frontend-task "<brief de UI>"
set -euo pipefail
[ $# -ge 1 ] || { echo "uso: frontend-task '<brief>'"; exit 1; }
exec ~/.hermes/profiles/frontend/bin/frontend-run "$*"
```

#### `frontend-session`

```bash
#!/usr/bin/env bash
# frontend-session  — tmux interativo
set -euo pipefail
SESSION="${1:-frontend}"
tmux new-session -d -s "$SESSION" -x 120 -y 40 \
  "hermes --profile frontend --skill frontend-cabala"
sleep 1
tmux attach -t "$SESSION"
```

#### `frontend-review <PR-number>`

```bash
#!/usr/bin/env bash
# frontend-review <PR-number>  — code review focado em UI
set -euo pipefail
PR="${1:?uso: frontend-review <pr-number>}"
[ -d "/home/skynet/cabala-dos-caminhos" ] || { echo "❌ workdir não existe"; exit 1; }
cd /home/skynet/cabala-dos-caminhos
gh pr diff "$PR" > /tmp/pr-$PR.diff
gh pr view "$PR" --json title,body,files > /tmp/pr-$PR.json
PROMPT="Faça code review focado em UI do PR #$PR.
Regras:
1. Carregue a skill frontend-cabala antes.
2. Verifique: reuso de componentes, tokens (sem hardcode),
   acessibilidade, type-safety, teste presente.
3. Comente inline via gh pr review --comment ou apenas relate
   findings se não for um PR seu.
4. NUNCA faça merge."
exec hermes --profile frontend --skill frontend-cabala,requesting-code-review \
  chat -q "$PROMPT"
```

## 5. Fluxo de uso típico

```bash
# 1) Gabriel decide criar um nó da Mandala
$ frontend-task "Cria o nó do núcleo (Ori/Odus) da Mandala: búzio/ponto de luz
  pulsante no centro, glow dourado (token ori), clicável, com tooltip do Odu
  regente e Orixás. SVG/D3, mobile-first. Teste em
  apps/b2c-portal/__tests__/components/mandala/."

# 2) Hermes (com skill carregada) executa o workflow de 10 passos
#    e ao final imprime:
# ✅ Branch feat/mandala-ori-node criada
# ✅ Componente + teste implementados
# ✅ npm run test:core -- mandala-ori passou
# ✅ tsc --noEmit limpo
# ✅ Commit + PR draft criados
# 🔗 https://github.com/Akasha-0/cabala-dos-caminhos/pull/NNN

# 3) Gabriel revisa o PR no GitHub e faz merge manual
```

**Modo interativo (quando quer acompanhar):**

```bash
$ frontend-session
# abre tmux com chat interativo do agente frontend
```

**Modo review:**

```bash
$ frontend-review 487
# sub-agente focado em revisar PR de UI
```

## 6. Error handling

| Falha | Detecção | Resposta |
|---|---|---|
| Skill `frontend-cabala` não carrega | `frontend-run` valida via `hermes skills list \| grep frontend-cabala` | Aborta com mensagem clara apontando o path esperado |
| `gh` não autenticado | `gh auth status` no pre-flight | Aborta pedindo `gh auth login` |
| Worktree sujo | Agente checa `git status --short` no passo 2 | Para e pergunta: commitar, stash ou abortar |
| `npx tsc --noEmit` falha | Agente roda no passo 8 | Itera até 3x corrigindo, depois para e pede input |
| `npm run test:core` falha | Passo 7 | Itera até 3x corrigindo, depois para |
| Branch já existe | `git rev-parse --verify` antes de criar | Pergunta: reaproveitar ou nome novo |
| Touch em motor espiritual (`packages/core-*/**`) | Pattern de path no workflow | Para e lembra: regra do AGENTS.md §5, escalar para agente principal |
| Touch nos tokens cósmicos / `@theme` (Doc 26) | Pattern no workflow | Para e pergunta: mudança de tema é decisão grande |
| Token da LLM cai / rate limit | Mensagem de erro do provider | Reporta e para; não tenta fallback automático |

## 7. Testes / validação da implementação

Como é infraestrutura (não aplicação runtime), valido
manualmente após implementação:

1. `hermes profile list` — vê `frontend` na lista
2. `hermes profile show frontend` — config confere
3. `hermes skills list | grep frontend-cabala` — skill aparece
4. `which frontend-task` — helper no PATH
5. `frontend-task "echo test"` — agente responde mencionando a
   skill carregada (verificável: deve aparecer "frontend-cabala" no
   contexto)
6. Skill passa pelo validador do `skill_manage` (frontmatter
   válido, ≤ 1024 chars descrição, ≤ 100k chars total)
7. Smoke test real: `frontend-task "Lista os componentes em
   apps/b2c-portal/components/ui/"` — agente responde com a lista correta
8. Smoke test de PR: `frontend-task "Adiciona um comentário
   "// frontend-agent test" em apps/b2c-portal/components/ui/button.tsx, abre
   PR draft e reverte o comentário"` — verifica fluxo completo

> **Nota:** os smoke tests com efeito colateral (item 8) devem ser
> rodados com branch descartável e revertidos após. Gabriel acompanha.

## 8. Arquivos a serem criados

| # | Path | Tamanho estimado | Conteúdo |
|---|---|---|---|
| 1 | `~/.hermes/skills/frontend-cabala/SKILL.md` | ~10k chars | A skill completa (seção 4.1) |
| 2 | `~/.hermes/profiles/frontend/config.yaml` | ~30 linhas | Config do profile (seção 4.2) |
| 3 | `~/.hermes/profiles/frontend/bin/frontend-run` | ~20 linhas bash | Wrapper (seção 4.3) |
| 4 | `~/.local/bin/frontend-task` | 3 linhas | One-shot helper |
| 5 | `~/.local/bin/frontend-session` | 5 linhas | Tmux helper |
| 6 | `~/.local/bin/frontend-review` | ~15 linhas | Review helper |

Tudo é **escopo da Hermes-home**, não toca o repo
`/home/skynet/cabala-dos-caminhos` em produção (exceto o spec em
`docs/superpowers/specs/` e o PR draft de smoke test).

## 9. Trade-offs assumidos

| Escolha | Benefício | Custo |
|---|---|---|
| Skill em `~/.hermes/` (não in-repo) | Iteração rápida, não polui repo | Não compartilhada com outros clones |
| Profile + 3 helpers (não só skill) | Isolamento, invocação simples, auditável | 6 arquivos para manter |
| Modo B autônomo | Velocidade, respeito ao AGENTS.md | Gabriel pode pegar um refactor de surpresa |
| Branch+commit+PR draft (não commita nada) | Rastreável, GitHub visualiza | 1 step a mais se for descartar |
| Reuso de modelo do default | Zero setup | Se o default ficar lento, frontend fica lento também |
| Standalone (não Kanban/hook) | Sem acoplamento | Gabriel precisa lembrar de invocar |

## 10. Próximos passos (após aprovação)

1. Implementação: 6 arquivos, branch descartável
2. Smoke tests (seção 7)
3. Gabriel acompanha o primeiro uso real
4. Após 1-2 sprints de uso real, considerar promoção da skill
   para in-repo (`cabala-dos-caminhos/.hermes/skills/`) para
   compartilhar com outros devs

## 11. Out of scope (explícito)

- Backend / API routes / lógica de engine
- Banco / Prisma
- Mudanças no design system Akasha (Doc 26) que alterem a paleta de marca
- CI/CD
- Merge de PRs
- Integração com Kanban ou cron
- Suporte a múltiplos projetos (este pacote é **específico** do
  Cabala dos Caminhos)
