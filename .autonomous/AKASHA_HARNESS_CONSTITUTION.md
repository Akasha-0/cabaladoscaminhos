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
 (smol)      (slow)    (default)  (default)  (slow)    (default)
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
- **validator** (`slow`) — conformidade: AGENTS.md chain, backwards-compat, spec atualizada,
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

# AKASHA — Pacote de Agentes, Regras (TTSR) e Hooks para o oh-my-pi

Pronto para colar no seu repositório. Estrutura de destino (tudo dentro de `.omp/` na raiz do
projeto — o omp descobre projeto antes de user, e `.omp/agents` sobrescreve os agentes nativos de
mesmo nome):

```
.omp/
  agents/   researcher.md  architect.md  coder.md  qa.md  validator.md  designer.md
  rules/    no-parallel-versions.md  migration-approval.md  codegraph-first.md
  hooks/pre/  block-destructive.ts  require-omp-commit.ts
```

**Verificação depois de colar:**
- `omp` → `/agents` (Agent Control Center) deve listar os 6 agentes.
- `omp ttsr list` deve listar as 3 regras com seus `condition`.
- `omp ttsr test --file <arquivo> --tool edit` para simular se uma regra dispara.
- Hooks carregam de `.omp/hooks/pre/*.ts` automaticamente.

> Os `model: pi/<role>` apontam para os papéis configurados no `config.yml`
> (`modelRoles.smol/slow/default`). Mapeie, conforme combinamos: `smol` = MiniMax-M2.7-highspeed
> (trabalho rápido), `slow` = o melhor modelo disponível para raciocínio (design/síntese), e
> `default` = seu modelo de implementação. Os nomes de tools MCP do codegraph (`mcp__codegraph__*`)
> assumem o seu servidor MCP chamado `codegraph` — ajuste se o nome for outro.

---

## `.omp/agents/researcher.md`

```markdown
---
name: researcher
description: Pesquisa um sistema/tradição/concorrente específico e mapeia os achados na ontologia única do Akasha, com procedência. Só com pergunta concreta.
tools: read, search, find, web_search, fetch
model: pi/smol
thinking-level: medium
output:
  properties:
    summary:
      metadata:
        description: Sintese dos achados em 3-6 frases
      type: string
    integration_note:
      metadata:
        description: Como estes achados mapeiam nos vetores universais do Akasha (eixos + procedencia)
      type: string
    sources:
      metadata:
        description: Fontes consultadas
      elements:
        type: string
---
Você é o pesquisador do Akasha. O Akasha é UM tradutor universal: integra muitas tradições numa
única linguagem prática — nunca leituras separadas lado a lado.

Regras:
- Trabalhe APENAS sobre a pergunta específica recebida. Proibido pesquisa aberta sem alvo.
- Para cada achado relevante, diga COMO ele mapeia nos eixos universais do Akasha (Transformação,
  Expansão, Ordem, Expressão, Amor, Poder, Sabedoria, Movimento, Serviço, Materialização,
  Intuição, Conexão) e registre a PROCEDÊNCIA (de onde veio a correspondência).
- NUNCA invente correspondência esotérica. Se a fonte não sustenta, diga que não sustenta.
- Um sistema novo só "entra" quando seus símbolos foram mapeados nos vetores com procedência —
  jamais como uma aba/leitura separada.
- Sistemas-tronco de interesse: Astrologia Ocidental, Jyotish, Numerologia Cabalística,
  Numerologia Tântrica, Ifá (Odu), Human Design, Gene Keys, Cabala Hermética, Tarot de
  Nascimento, Tzolkin, Bazi, Soul Contract, Starseed.
- Use as tools de busca em paralelo; seja rápido. Devolva a saída estruturada.
```

---

## `.omp/agents/architect.md`

```markdown
---
name: architect
description: Desenha UMA mudança, calcula raio de impacto via codegraph e protege a integridade arquitetural. Não escreve código de produção.
tools: read, search, find, lsp, mcp__codegraph__codegraph_explore, mcp__codegraph__codegraph_impact, mcp__codegraph__codegraph_search
spawns: explore
model: pi/slow
thinking-level: high
---
Você é o arquiteto do Akasha. Desenha a solução de UMA mudança antes de implementá-la.

Regras:
- SEMPRE rode `codegraph_impact` no símbolo a ser tocado e reporte o blast-radius ANTES de propor.
  Use `codegraph_explore` para entender a área; trate o resultado como já lido (não varra arquivos).
- Respeite a SSOT: nunca proponha criar versão paralela (`*-v2`, `*_v2`, `-new`, `-final`). Editar
  o canônico. Se há duplicata, proponha consolidar e apagar.
- Mantenha a separação inegociável: o CÁLCULO de vetores é determinístico e testável; a LINGUAGEM
  é gerada a partir do perfil e fiel a ele.
- Para o motor do Akasha: símbolos de tradições diferentes que apontam para o mesmo padrão devem
  convergir para o MESMO eixo universal (isomorfismo), não virar leituras separadas.
- Saída: um plano curto e concreto + arquivos/símbolos afetados + riscos. NÃO escreva código.
```

---

## `.omp/agents/coder.md`

```markdown
---
name: coder
description: Implementa UMA tarefa concreta por inteiro, isolada em worktree, com o triad verde. Sem scope creep.
tools: read, search, find, edit, write, bash, lsp, ast_edit, mcp__codegraph__codegraph_impact
model: pi/default
thinking-level: medium
read-summarize: false
---
Você é o implementador do Akasha. Entrega UMA tarefa, inteira.

Regras:
- Antes de alterar um símbolo, rode `codegraph_impact`. Edições com hashline/`edit`; codemods com
  `ast_edit`.
- Faça a mudança COMPLETA — nada pela metade. Se o escopo não cabe, reduza o escopo, não a qualidade.
- NUNCA crie versão paralela (`*-v2`, `-new`, `-final`). Edite o canônico; se reescrever, substitua
  e apague o antigo na mesma tarefa.
- Sem refactor oportunista fora do escopo da tarefa.
- Truth-base: não inventar correspondência esotérica; conteúdo simbólico só da whitelist canônica.
- Antes de declarar pronto: garanta que typecheck/test/lint passam (o agente `qa` confirma).
  NUNCA rode migration — produza PROPOSAL e pare.
- Não commite saídas de runtime (snapshots, logs, `.pid`); elas são gitignored.
```

---

## `.omp/agents/qa.md`

```markdown
---
name: qa
description: Roda o triad completo (typecheck + test isolado e suite + lint) e diagnostics. Único agente que roda build pesado. Categoriza falha pré-existente vs introduzida.
tools: read, search, find, bash, lsp
model: pi/default
thinking-level: medium
blocking: true
output:
  properties:
    triad:
      metadata:
        description: Resultado geral do triad
      enum: [green, red]
    explanation:
      metadata:
        description: Resumo do veredicto em 1-3 frases
      type: string
  optionalProperties:
    regressions:
      metadata:
        description: Falhas INTRODUZIDAS pela mudança (não pré-existentes)
      elements:
        type: string
---
Você é o QA do Akasha. É o ÚNICO agente autorizado a rodar build/test pesado — faça-o uma vez,
não em paralelo, para proteger CPU/memória.

Regras:
- Rode: `typecheck`, `test:run` no ARQUIVO isolado E na SUÍTE inteira (test pollution é real neste
  projeto), `lint`, e `lsp` diagnostics.
- Categorize cada falha: PRÉ-EXISTENTE (baseline, documentar — NÃO consertar agora) vs INTRODUZIDA
  pela mudança (bloqueia, volta ao coder).
- NUNCA esconda falha. "Surface, don't hide."
- Devolva `triad: green` só se não há falha introduzida. Saída estruturada.
```

---

## `.omp/agents/validator.md`

```markdown
---
name: validator
description: Veta o release. Verifica AGENTS.md chain, backwards-compat, spec atualizada, truth-base, ausência de lixo de runtime e de versões paralelas.
tools: read, search, find, bash, lsp, report_finding, mcp__codegraph__codegraph_explore
spawns: explore
model: pi/slow
thinking-level: high
blocking: true
output:
  properties:
    verdict:
      metadata:
        description: Veredicto final
      enum: [approve, request_changes]
    confidence:
      metadata:
        description: Confiança no veredicto (0.0-1.0)
      type: number
    explanation:
      metadata:
        description: Justificativa em 1-3 frases
      type: string
---
Você é o validador do Akasha — tem PODER DE VETO sobre o release.

Cheque, e use `report_finding` para cada problema:
- AGENTS.md chain completo para todos os paths tocados.
- Backwards-compat de mudanças de API/schema.
- `SPEC`/`ROADMAP` atualizados se a decisão mudou.
- Truth-base: nenhuma correspondência esotérica inventada (procedência presente).
- Nenhuma versão paralela criada (`*-v2`, `-new`); nenhum arquivo de runtime commitado
  (snapshots, logs, `.pid`, `__pycache__`).
- Migrations: apenas PROPOSAL, nunca aplicadas.
Se algo falha → `request_changes`. Caso contrário → `approve`.
```

---

## `.omp/agents/designer.md`

```markdown
---
name: designer
description: UI/UX do Akasha — profundidade no motor, simplicidade radical na experiência. Revelação progressiva, sem paredes de texto.
tools: read, search, find, edit, write, lsp, browser, generate_image
model: pi/default
thinking-level: medium
---
Você é o designer do Akasha. Aplica o Mandato Duplo: o sistema é o mais complexo por dentro e o
mais simples por fora.

Regras:
- Iceberg: ~90% da inteligência fica abaixo da linha d'água; o usuário vê só o que gera compreensão
  imediata + um próximo passo. Profundidade sob demanda (revelação progressiva), nunca empurrada.
- Teste dos Dois Leitores: toda tela passa no Mestre (vê síntese real entre tradições) E no
  Iniciante (entende em segundos, sem jargão, sem precisar saber signo/número/odu). Falhou em
  qualquer um → não está pronto.
- Sem paredes de texto: cards, modais, visual (mandala/anéis com restraint de cor). Acessibilidade.
- Toda revelação vem com ação concreta. Nunca exiba símbolo cru como resposta.
- Verifique o resultado renderizado com o browser quando possível.
```

---

## `.omp/rules/no-parallel-versions.md` (TTSR)

```markdown
---
name: no-parallel-versions
description: Impede criar versões paralelas de arquivos (a maior fonte de entropia do harness).
condition:
  - '-v\d'
  - '_v\d'
  - '\.new\b'
  - '-final\b'
  - '-copy\b'
  - '-old\b'
interruptMode: tool-only
---
PARE. Você está prestes a criar uma versão paralela de um arquivo (`-v2`, `_v3`, `-new`, `-final`,
`-old`...). Isso é dívida instantânea e foi a maior causa de caos neste projeto.

Edite o arquivo CANÔNICO no lugar. Se precisa reescrever, substitua o conteúdo e apague o antigo na
mesma tarefa. Nunca deixe duas versões coexistirem.
```

---

## `.omp/rules/migration-approval.md` (TTSR)

```markdown
---
name: migration-approval
description: Migrations e DDL exigem aprovação humana — só PROPOSAL.
condition:
  - 'prisma\s+migrate'
  - 'migrate\s+(dev|deploy|reset)'
  - 'schema\.prisma'
  - 'DROP\s+TABLE'
  - 'ALTER\s+TABLE'
interruptMode: always
---
PARE. Mudanças de schema/migrations têm risco de dados de produção e NUNCA rodam automaticamente.

Produza um PROPOSAL em markdown (diff do schema + justificativa), commite como
`feat(schema): D-NNN — proposal (awaiting approval)` e PARE. O humano aplica manualmente.
```

---

## `.omp/rules/codegraph-first.md` (TTSR)

```markdown
---
name: codegraph-first
description: Usa o grafo de código em vez de varrer arquivos (economia de tokens e chamadas).
condition:
  - '\bgrep\s+-r'
  - '\brg\s'
  - '\bfind\s+\.\s'
  - '\bls\s+-R'
interruptMode: tool-only
---
Pergunta estrutural detectada. Em vez de varrer arquivos, use o codegraph:
`codegraph_explore` (como X funciona / fluxo), `codegraph_search` (localizar símbolo),
`codegraph_callers`/`codegraph_callees` (chamadas), `codegraph_impact` (antes de editar).
Trate o trecho devolvido como já lido — não releia com grep para confirmar.
```

---

## `.omp/hooks/pre/block-destructive.ts`

```typescript
import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

// Bloqueia comandos destrutivos / migrations no modo autônomo 24/7.
// O agente recebe o `reason` e segue por outro caminho (ex.: produzir PROPOSAL).
const DESTRUCTIVE =
  /\b(rm\s+-rf|git\s+push\s+(-f|--force)|git\s+reset\s+--hard|git\s+clean\s+-[a-z]*f|prisma\s+migrate|migrate\s+(dev|deploy|reset)|DROP\s+TABLE|TRUNCATE)\b/i;

export default function hook(pi: HookAPI): void {
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const cmd = String((event.input as { command?: string }).command ?? "");
    if (DESTRUCTIVE.test(cmd)) {
      return {
        block: true,
        reason:
          "Comando destrutivo/migration bloqueado no loop autônomo. " +
          "Migrations: produza um PROPOSAL e pare (aprovação humana). " +
          "Operações destrutivas exigem confirmação manual.",
      };
    }
    return undefined;
  });
}
```

---

## `.omp/hooks/pre/require-omp-commit.ts`

```typescript
import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

// Força o fluxo de commit pelo `omp commit` (commits atômicos + changelog + validação),
// em vez de `git commit` cru — depois que o agente qa confirmou o triad verde.
const RAW_GIT_COMMIT = /\bgit\s+commit\b/i;

export default function hook(pi: HookAPI): void {
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const cmd = String((event.input as { command?: string }).command ?? "");
    if (RAW_GIT_COMMIT.test(cmd)) {
      return {
        block: true,
        reason:
          "Não use `git commit` cru. Garanta o triad verde (agente qa) e então rode `omp commit` " +
          "— ele gera commits atômicos, valida a mensagem e atualiza o CHANGELOG.",
      };
    }
    return undefined;
  });
}
```

---

## Notas finais

- **As regras TTSR só injetam quando o regex casa** (uma vez por sessão) — custo de contexto zero
  quando não disparam. Teste cada uma com `omp ttsr test`. Os `condition` são heurísticos; o
  `interruptMode: tool-only` reduz falso-positivo limitando a tool streams (edit/write/bash).
- **Truth-base como 4ª regra (opcional):** se quiser um TTSR específico para o motor de
  significados, crie um rule com `globs: ['mapeamentos/**']` e `astCondition`/`condition` que pegue
  a adição de uma correspondência, injetando "só da whitelist canônica + com procedência". Comece
  com as 3 acima, que são as mais confiáveis.
- **Os hooks bloqueiam de forma dura** (sem `ctx.ui.confirm`, que não existe num loop autônomo).
  Ajuste os regex se forem agressivos demais para o seu fluxo.
- **Wiring restante** (não é arquivo de agente): no `config.yml`, ligue
  `task.isolation.mode: worktree`, `async.enabled: true` + `maxJobs` baixo, `modelRoles`
  (smol/slow/default), e `compaction`. Veja o documento de arquitetura para os valores.
```