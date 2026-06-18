# AKASHA — Harness & Loop no oh-my-pi (Arquitetura Nativa de Subagentes)

> Documento autoritativo. Baseado na arquitetura real do omp (Task tool com isolamento em
> worktree, swarm/model-roles, memória nativa, compactação, TTSR, hooks, skills, `omp commit`).
> **Supersede o protocolo de "múltiplos terminais + locks manuais"** — o omp faz isolamento e
> merge nativamente, então a arquitetura certa é *um orquestrador que ramifica em subagentes
> isolados nativos*, não N terminais independentes.

---

## 0. A decisão (múltiplos terminais vs. um loop multi-agente)

**Veredicto: UM loop orquestrador que delega a subagentes isolados nativos do omp.** Não rode N
terminais independentes fazendo o loop inteiro.

Razões, ancoradas no que o omp oferece:

- **Comunicação.** Terminais independentes são sessões isoladas — não se comunicam, só colidem via
  filesystem/git. O Task tool nativo dá topologia **hub-and-spoke**: o orquestrador despacha,
  recebe os artefatos dos subagentes em streaming (`agent://<id>`) e sintetiza. É a topologia
  correta; ninguém quer N agentes conversando em paralelo.
- **Zero trabalho duplicado.** Um cérebro atribui tarefas disjuntas. O problema "todos escolhem a
  mesma tarefa" deixa de existir.
- **Isolamento + merge nativos.** `task.isolation.mode: worktree` + `merge: branch|patch` — o omp
  gerencia worktrees e integração. Sem `mkdir` lock frágil.
- **Controle de recursos.** Concorrência limitada por `async.maxJobs`; build pesado num único
  agente QA, não em N paralelos. Muito mais fácil de não fritar a máquina.

**Nuance de escala:** se um orquestrador saturar e a máquina tiver folga, rode *poucos*
orquestradores, cada um no seu próprio worktree de topo (a disciplina de worktree vale entre
orquestradores, não dentro). Comece com **um**.

---

## 1. Pare de reimplementar o que o omp já faz nativamente

A maior alavancagem de inteligência é aposentar o harness Python paralelo e apoiar no nativo.

| O que o harness atual faz à mão | Substituto nativo do omp |
|---|---|
| `akasha-loop-daemon-v4..v8`, multi-agent loops, spawn-agents | **Task tool** (subagentes) + `async`/`await` |
| locks `mkdir`, worktrees manuais, merge à mão | `task.isolation: worktree` + `merge: branch/patch` |
| `context_engine`/`_v2`, snapshots gigantes commitados | **Compactação nativa** (`compaction.*`) |
| `memory_manager`/`_v2`, `memory.json` 32KB | **Memória autônoma nativa** (`/memory`, `memory://root/`) |
| `prompt_engine`/`_v2`, seleção de modelo manual | **Model roles** (`default/smol/slow/plan/commit`) + swarm |
| commit/changelog custom | **`omp commit`** (split atômico + changelog) |
| triad chamado à mão | **LSP** (diagnostics/format on-write) + hooks + `omp commit` |
| guardrails embutidos no prompt (gastam contexto) | **TTSR** (regra injeta só quando regex casa) + **hooks** |
| `skill_discoverer`/`_v2` | **Skills** nativas (`.omp/skills/*/SKILL.md`) |

Mantenha só a **camada fina específica do projeto**: definições de agentes (`.omp/agents/`),
skills de domínio, hooks/TTSR de guardrail, e a memória durável curada (`lessons/` + `SPEC` +
`DECISIONS`). O resto é nativo.

---

## 2. Topologia recomendada (hub-and-spoke)

```
            ┌──────────────────────────────────────────────┐
            │  ORQUESTRADOR  (o /loop — o cérebro)          │
            │  decide UMA melhoria, delega, integra, commita│
            └───────────────┬──────────────────────────────┘
        Task tool (isolation: worktree, merge: branch) | async maxJobs limitado
   ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
researcher  architect   coder      qa       validator  designer
 (smol)      (slow)    (default)  (default)  (default)  (default)
   └── cada um em worktree isolado → resultado volta em streaming ──┘
```

- O orquestrador roda na sessão do `/loop`, mantém coerência e é o único que decide e integra.
- Subagentes rodam **isolados** (cada um seu worktree), em paralelo controlado, e **reportam ao
  orquestrador** — não entre si.
- Build/test pesado mora **só** no agente `qa`, serializando o custo de CPU.

---

## 3. Os agentes especializados (`.omp/agents/`)

Defina cada um como agente do omp (gere via `/agents` para casar com o schema exato; atribua
modelo por agente via swarm extension). Contrato conceitual de cada um:

- **researcher** (`smol`/rápido) — estuda tradições/sistemas e concorrentes. **Só com pergunta
  específica**; proibido pesquisa aberta. Tools: `web_search`, `fetch`, `read`. Saída: achados
  resumidos. *Limite:* não escreve código de produção.
- **architect** (`slow`/raciocínio) — design, blast-radius via codegraph, isomorfismos entre
  sistemas. Tools: codegraph MCP, `read`, `lsp`. *Limite:* não implementa.
- **coder** (`default`) — implementa UMA tarefa. Isolado em worktree. Tools: `edit`/`ast_edit`,
  `read`, `bash`, `lsp`. *Limite:* sem refactor oportunista fora do escopo.
- **qa** (`default`) — roda o triad completo (typecheck/test/lint) + LSP diagnostics. **Único** a
  rodar build pesado. Categoriza falha pré-existente vs. introduzida.
- **validator** (`default`) — conformidade: AGENTS.md chain, backwards-compat, spec atualizada,
  truth-base. **Poder de veto** sobre o release.
- **designer** (`default`) — UI/UX, revelação progressiva, mandala/visual, acessibilidade. (Agente
  `designer` já é nativo do omp.)
- **integrator** (`default`) — *opcional, se houver vários orquestradores:* único a mergear
  branches em `main`, serializado, com triad entre merges. Conflito → aborta e sinaliza.

---

## 4. Configuração nativa (`~/.omp/agent/config.yml` ou `.omp/settings.json`)

```yaml
# Subagentes isolados + concorrência controlada
task:
  eager: false
  isolation:
    mode: worktree      # cada subagente no seu worktree
    merge: branch       # integra por branch (ou patch p/ mudanças pequenas)
async:
  enabled: true
  maxJobs: 4            # COMECE BAIXO — controla CPU/RAM; suba só com folga

# Modelos por papel (mapeando o MiniMax)
modelRoles:
  default: minimax/<seu-modelo-de-implementacao>     # implementação
  smol:    minimax/MiniMax-M2.7-highspeed            # exploração barata/rápida
  slow:    <melhor-modelo-disponivel-p/-raciocinio>  # design/síntese difícil
  plan:    <melhor-modelo-disponivel>                # plan mode
  commit:  minimax/MiniMax-M2.7-highspeed
defaultThinkingLevel: high     # xhigh p/ a síntese da linguagem unificada

# Compactação nativa (substitui o context_engine custom)
compaction:
  enabled: true
  reserveTokens: 16384
  keepRecentTokens: 20000
  autoContinue: true

skills:
  enabled: true
```

> O MiniMax-M2.7-highspeed é rápido porém mais sujeito a erro de julgamento longo: use-o como
> `smol`/`commit` (trabalho braçal) e, na medida do possível, ponha a **síntese difícil** (motor
> de tradução, ontologia cross-sistema) e o **plan** num modelo mais forte. Se for MiniMax em
> tudo, compense com `thinking: xhigh` no orquestrador/plan + verificação rigorosa.

---

## 5. Memória e contexto (nativo + camada durável curada)

- **Memória nativa** (`/memory`, `memory://root/MEMORY.md`, por projeto, consolidação em
  background): use-a como memória de trabalho cross-session. Substitui o `memory_manager_v2`.
- **Compactação nativa**: configurada acima; substitui snapshots manuais.
- **Camada durável (a que importa)** = `lessons/` + `SPEC` + `DECISIONS`, curada e versionada. É o
  aprendizado de longo prazo de verdade. **Toda falha vira uma `lesson`** (você já faz isso, e é
  excelente — é a joia do harness).
- **Recuperação via codegraph (MCP)**, compressão via headroom (MCP) — ambos plugam nativo no omp
  (stdio/HTTP MCP). Pergunta estrutural → codegraph, nunca grep cego.
- **Regras de higiene:** nunca ler arquivo gigante inteiro; gitignore tudo que é runtime
  (snapshots, logs, prompts de agente, `.pid`, `__pycache__`, sessões). Log de 24MB é runaway, não
  memória.

---

## 6. Guardrails sem custo de contexto (TTSR + hooks)

O omp permite mover os guardrails do prompt (que gastam contexto sempre) para mecanismos que só
disparam quando necessário.

**TTSR** (regra com `ttsrTrigger` regex, injeta só quando casa no stream, one-shot por sessão).
Candidatas perfeitas:

- **Anti-invenção (truth-base):** trigger em sinais de "inventar correspondência esotérica" →
  injeta "use só a whitelist canônica derivada da pesquisa".
- **Migration-stop:** trigger em `prisma migrate`/edição de `schema.prisma` → injeta "produza
  PROPOSAL, NÃO rode migration sem aprovação humana".
- **Discover-don't-invent:** trigger ao aplicar trabalho prescrito → injeta "`grep`/`cat` o alvo
  real antes; specs envelhecem".
- **Anti-bloat:** trigger em criar `*-v2`/`*-new`/`-final` → injeta "edite o canônico, não
  versione paralelo".

**Hooks** (pre/post `tool_call`, podem bloquear). Candidatas:

- Bloquear commit quando o triad está vermelho.
- Bloquear `grep`/`find` quando o codegraph pode responder.
- Bloquear `bash` com `sudo`/migration sem confirmação. (Você já tem hooks; migre a lógica pra cá.)

> Resultado: o prompt do loop fica enxuto (barato de reler a cada iteração) e os guardrails ficam
> garantidos por mecanismo, não por o modelo "lembrar".

---

## 7. O loop por iteração (a instrução do orquestrador)

Esta é a instrução que vai no `/loop`. Curta — a profundidade está nos agentes/config/guardrails.
Princípio reitor inalterado: **restrição > intensidade.** Uma melhoria completa e verificada por
iteração, deixando o projeto e o harness mais enxutos.

1. **Orientar (barato).** Memória nativa já injeta o resumo; ler estado git + as `lessons` do tema.
2. **Auditar via codegraph.** Reconstruir o mapa; caçar triad vermelho, duplicata de harness, lixo
   commitado, página órfã. Achados de entropia são alvos de primeira classe.
3. **`/plan`.** Escolher UMA melhoria de maior alavancagem (produto OU harness), com
   `{alvo, ação, raciocínio, confiança}` e blast-radius. Diagnosticar, não obedecer spec velha.
4. **`todo_write`.** Quebrar em fases rastreáveis.
5. **Delegar via Task tool** (isolado): architect desenha → coder implementa em worktree →
   designer cuida do visual se aplicável. Concorrência limitada por `maxJobs`.
6. **QA.** O agente `qa` roda o triad completo (isolado + suite — test pollution é real aqui).
   Vermelho → volta ao coder.
7. **Validator.** Veta se faltou AGENTS.md chain, backwards-compat, truth-base, spec.
8. **Integrar + `omp commit`.** Merge da branch do subagente; commit atômico (split se mexeu em
   coisas distintas) + changelog. Migration → PROPOSAL, nunca aplicar.
9. **Aprender.** Se algo não-óbvio custou tempo → nova `lesson`. Atualizar `SPEC`/`DECISIONS`
   curto. Comprimir o que inchou.
10. **Encerrar limpo.** Working tree estável; nada de runtime commitado.

---

## 8. A visão de produto que o loop serve (13 sistemas → UMA linguagem)

O harness existe para construir **um** sistema, não treze. Mantenha isto como norte de todo
trabalho de produto:

- **Akasha = tradutor universal.** O objetivo NÃO é mostrar "Sol em Escorpião + Caminho 11 + Odu 11
  Owonrin" lado a lado — isso fragmenta o Akasha em três linguagens. O objetivo é mapear TODOS os
  sistemas numa **ontologia única de vetores da consciência** e devolver UMA leitura integrada.
- **Cobertura de vida total:** identidade, propósito, destino, dons/talentos/vocação, carreira,
  dinheiro/negócios, amor/relacionamentos, alinhamento energético, dívidas kármicas, aprendizados,
  sombras, padrões e tendências, sexualidade/desejos ocultos — tudo que os mapas mostram, traduzido
  numa só linguagem prática.
- **Descoberta contínua (o papel do researcher).** Estudar e integrar progressivamente os grandes
  troncos, mapeando cada um na MESMA ontologia (nunca como leitura separada). Conjunto-alvo:
  Astrologia Ocidental, Jyotish, Numerologia Cabalística, Numerologia Tântrica, Ifá (Odu),
  Human Design, Gene Keys, Cabala Hermética, Tarot de Nascimento, Tzolkin Maia, Bazi, Soul
  Contract, Starseed. *(Sua pesquisa em `.autonomous/research/` já cobre boa parte — HD, Gene
  Keys, Kabbalah, Enneagram, Tzolkin, Bazi, Jyotish, Ayurveda.)*
- **Regra de integração:** um sistema novo só "entra" quando seus símbolos foram mapeados nos
  vetores universais com procedência (de onde veio cada correspondência). Adicionar um sistema como
  uma aba/leitura separada é violar a tese do Akasha.
- **A barra:** superar Gene Keys, Human Design e afins — não prometendo prever o futuro, mas pela
  **integração coerente de muitas tradições numa linguagem só + acionabilidade em todas as áreas da
  vida**. Profundidade real no motor, simplicidade radical na experiência.

O loop melhora **todos os aspectos** a serviço disso: arquitetura, inteligência do motor de
tradução, UI/UX (agente designer), QA/testes (agente qa), pesquisa/descoberta (agente researcher),
performance e higiene (faixa de harness).

---

## 9. Recursos e quantos orquestradores

- Comece com **1 orquestrador**, `async.maxJobs: 4`. Meça CPU/RAM/disco por uma hora (`omp stats`).
- Suba `maxJobs` ou adicione um 2º orquestrador (em worktree de topo separado) **só** se o primeiro
  saturar E houver folga de máquina. Mais não é linearmente melhor: integração e conflito crescem.
- Build pesado concentrado no `qa` (um por vez) é o que protege a máquina.

---

## 10. Checklist de migração (do harness atual → nativo omp)

1. **Aposentar os daemons duplicados.** Escolher um orquestrador; mover `*-v4..v8`,
   `*_v2`, ralph-loop, fifo/omp/multi-agent loops para `archive/` fora do tracking.
2. **Definir `.omp/agents/`** para researcher/architect/coder/qa/validator/designer (via `/agents`).
3. **Ligar config nativa** (§4): `task.isolation: worktree`, `async`, `modelRoles`, `compaction`.
4. **Migrar guardrails para TTSR + hooks** (§6); enxugar o prompt do loop.
5. **Adotar memória nativa** (`/memory`) + manter `lessons/`/`SPEC`/`DECISIONS` como camada durável.
6. **Plugar codegraph + headroom via MCP**; gitignore todo runtime; limpar `$TELEMETRY_FILE`,
   `memory:`, duplicatas de doc.
7. **Trocar commit custom por `omp commit`.**
8. **Rodar com 1 orquestrador**, medir, e só então escalar.

> Em uma frase: **o omp já é um harness multi-agente com isolamento e memória nativos — sua
> engenharia de loop deve ser uma camada fina (agentes + skills + guardrails + memória durável)
> em cima dele, com um orquestrador que delega a subagentes isolados, evoluindo o Akasha rumo a
> uma linguagem única que integra todas as tradições.**