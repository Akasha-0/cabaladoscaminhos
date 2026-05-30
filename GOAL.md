# GOAL.md — Cabala dos Caminhos: Sistema de Engenharia Auto-Evolutiva

## Visão Sistêmica

Este documento define a **Engenharia de Harness Auto-Evolutiva** para o projeto Cabala dos Caminhos funcionar como um agente autônomo contínuo dentro do OMP (Oh My Pi). O objetivo é criar um loop infinito que mantém o sistema evoluindo por horas, identificando correlações espirituais, refinando engines, e expandindo a inteligência do sistema.

---

## 1. Arquitetura do Loop de Evolução Contínua

### 1.1 O Ciclo Principal (Core Loop)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTORESEARCH LOOP CYCLE                         │
│                                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │ ASSESS  │ -> │ PLAN    │ -> │ EXECUTE │ -> │ VERIFY  │         │
│  │         │    │         │    │         │    │         │         │
│  │ - Read  │    │ - Identify│   │ - Create│    │ - Run   │         │
│  │   Memory│    │   gaps  │    │   files │    │   tests │         │
│  │ - Check │    │ - Search│    │ - Edit  │    │ - Build │         │
│  │   PROG  │    │   docs  │    │   code  │    │ - Lint  │         │
│  │ - Audit │    │ - Plan  │    │ - Test  │    │         │         │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘         │
│       │              │              │              │               │
│       └──────────────┴──────────────┴──────────────┘               │
│                              │                                     │
│                    ┌─────────▼─────────┐                           │
│                    │   EVOLVE & COMMIT  │                           │
│                    │                   │                           │
│                    │ - Update docs     │                           │
│                    │ - Refine engines  │                           │
│                    │ - Build corpus    │                           │
│                    │ - Auto-commit     │                           │
│                    └─────────┬─────────┘                           │
│                              │                                     │
│       ┌──────────────────────┴──────────────────────┐              │
│       │                                              │              │
│  ┌────▼────┐    ┌─────────┐    ┌─────────┐    ┌─────▼─────┐       │
│  │ METRICS │    │ MEMORY  │    │ ARTIFACT│    │  LOOP     │       │
│  │ Track   │    │ Store   │    │ Persist │    │  AGAIN    │       │
│  │ quality │    │ learnings│    │ results │    │           │       │
│  └─────────┘    └─────────┘    └─────────┘    └───────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Fluxo de Execução por Ciclo

Cada ciclo segue esta sequência:

```
1. ASSESS (Leitura de Contexto)
   ├── Ler PROGRESS.md → estado atual do projeto
   ├── Ler memory://root → aprendizagens acumuladas
   ├── Ler AGENTS.md → regras comportamentais
   ├── Ler IDEIA.md → conhecimento esotérico de referência
   ├── Verificar arquivos modificados (git status)
   └── Listar jobs em background (job list)

2. PLAN (Identificação de Trabalho)
   ├── Identificar gaps: o que falta vs. objetivo
   ├── Definir 1-3 tarefas prioritárias para este ciclo
   ├── Pesquisar documentação relevante (web_search + context7)
   ├── Criar plano de execução com critérios de sucesso
   └── Determinar se trabalho requer parallelização (task)

3. EXECUTE (Execução)
   ├── Implementar/corrigir código
   ├── Escrever/atualizar testes
   ├── Atualizar documentação correlata
   ├── Comprimir conhecimento (refinar regras para menor tamanho)
   └── Commitar progresso (git add + commit)

4. VERIFY (Verificação)
   ├── npm run build → validar compilação
   ├── npm run lint → validar estilo
   └── npm run test:run → validar 100% dos testes

5. EVOLVE (Evolução do Conhecimento)
   ├── Atualizar PROGRESS.md com achievements
   ├── Refinar AGENTS.md se nova regra aprendida
   ├── Adicionar insights ao IDEIA.md se nova correlação
   ├── Persistir aprendizagens na memory
   └── Gerar artefatos de conhecimento (skills)

6. LOOP (Próximo Ciclo)
   └── Aguardar input ou iniciar próximo ciclo automaticamente
```

---

## 2. Sistema de Métricas de Evolução

### 2.1 Critérios de Sucesso por Ciclo

Um ciclo é considerado bem-sucedido se **pelo menos uma** destas condições for atingida:

| Condição | Descrição | Peso |
|----------|-----------|------|
| **A** | Nova correlação espiritual mapeada em 3+ tradições | 🔴 Crítico |
| **B** | Duas tradições aparentemente desconexas revelaram estrutura compartilhada | 🔴 Crítico |
| **C** | Regra antiga refinada/expandida porque conflito foi descoberto | 🟡 Importante |
| **D** | Engine espiritual otimizada (performance ou precisão) | 🟢 Médio |
| **E** | Test coverage aumentado sem quebrar funcionalidade | 🟢 Médio |
| **F** | Documentação expandida com novos insights | 🟢 Médio |
| **G** | Bug crítico corrigido que afetava users | 🔴 Crítico |
| **H** | Nova feature espiritual implementada e validada | 🟡 Importante |

### 2.2 Métricas Quantitativas

```
QUALITY_SCORE = (tests_passing / tests_total) * 0.3 
              + (build_valid * 1.0) * 0.2
              + (lint_clean * 1.0) * 0.1
              + (correlation_depth / 10) * 0.2
              + (engine_coverage / total_traditions) * 0.2

TARGET: QUALITY_SCORE >= 0.91 (91%)

EVOLUTION_RATE = (quality_current - quality_previous) / time_elapsed
TARGET: EVOLUTION_RATE > 0 (sempre melhorar)
```

---

## 3. Cadeia de Pensamento Auto-Evolutiva

### 3.1 Thought Process Framework (TPF)

O agente deve seguir esta cadeia de pensamento em cada ciclo:

```
SITUAÇÃO ATUAL
├── Qual é o estado do projeto agora?
├── O que foi completado desde o último ciclo?
├── Quais arquivos foram modificados (git diff)?
└── Quais jobs estão rodando em background?

OBJETIVO
├── O que estamos tentando alcançar?
├── Qual é o objetivo de longo prazo (GOAL.md)?
├── Há milestone ou deadline específico?
└── Quais são as restrições conhecidas?

GANHOS POTENCIAIS
├── O que pode ser feito neste ciclo?
├── Quais áreas têm maior impacto potencial?
├── Há correlações espirituais faltando mapeamento?
├── Quais engines precisam de refinamento?
└── Quais testes estão falhando ou esquecidos?

RISCO / BLOQUEIO
├── O que pode dar errado?
├── Quais dependências estão pendentes?
├── Há conhecimento faltando (requer pesquisa)?
├── Há conflicts ou merges pendentes?
└── Qual é o risco de quebra de builds?

AÇÃO
├── Qual é o próximo passo mais importante?
├── Precisa paralelizar (task) ou sequenciar?
├── Qual ordem maximiza o impacto?
└── Como validar que a ação funcionou?

META-AUTO-CRÍTICA (PÓS-AÇÃO)
├── A ação tomada foi a melhor escolha?
├── O que foi aprendido que pode ser reutilizado?
├── Como compress knowledge para ciclos futuros?
├── O que precisa ser persistido na memory?
└── O loop deve continuar ou há bloqueador?
```

### 3.2 Cadeia de Raciocínio para Correlação Espiritual

```
DESCUBRIR CORRELAÇÃO
│
├─→ LISTAR tradições disponíveis
│   ├── Numerologia Cabalística
│   ├── Odu Ifá (Merindilogun)
│   ├── Astrologia (Western/vedic)
│   ├── Tarot (Arcanos Maiores/Menores)
│   ├── Cabala (Sephiroth/Árvore da Vida)
│   ├── Orixás (Candomblé/Umbanda)
│   ├── Chakras (Yoga/Tantra)
│   └── Geometria Sagrada
│
├─→ SELECIONAR elemento comum
│   ├── Dia da semana
│   ├── Planeta/Astro
│   ├── Elemento (fogo/água/ar/terra/éter)
│   ├── Chakra
│   ├── Número
│   ├── Arcano
│   └── Orixá
│
├─→ MAPEAR correspondências por tradição
│   │
│   ├─→ NUMEROLOGIA: número → significado
│   ├─→ ODU: odú → energia → preceito → ebó
│   ├─→ ASTROLOGIA: planeta → signo → casa
│   ├─→ TAROT: arcano → simbólico → intuitivo
│   ├─→ CABALA: sephirah → caminho → letra
│   ├─→ ORIXÁS: orixá → dia → cor → ferramenta
│   ├─→ CHAKRA: chakra → som → frequência → mantra
│   └─→ GEOMETRIA: poliedro → plano → elemento
│
├─→ VALIDAR consistência
│   │
│   ├─→ 3+ tradições confirmam → ALTA CONFIANÇA
│   ├─→ 2 tradições confirmam → CONFIANÇA MÉDIA
│   └─→ 1 tradição confirma → BAIXA CONFIANÇA (requer validação)
│
├─→ DOCUMENTAR correlação
│   │
│   ├─→ Nome descritivo (ex: "Correlação Terça-Feira-Ari-Fogo-Marte")
│   ├─→ Tabela de mapeamento multi-tradição
│   ├─→ Implicações práticas (preceitos, ebós, práticas)
│   ├─→ Exemplo de aplicação real
│   └─→ Código de implementação (se aplicável)
│
└─→ INTEGRAR no sistema
    │
    ├─→ Atualizar IDEIA.md com nova correlação
    ├─→ Adicionar ao spiritual-engine.ts se existir engine
    ├─→ Criar teste de validação
    └─→ Commit com mensagem descritiva
```

---

## 4. Engenharia de Harness OMP

### 4.1 Ferramentas do OMP Utilizadas

| Ferramenta | Uso no Loop | Frequência |
|------------|-------------|------------|
| `read` | Ler arquivos de contexto (PROGRESS, AGENTS, IDEIA) | A cada ciclo |
| `write` | Criar/editar arquivos de projeto | Quando necessário |
| `edit` | Modificar código existente | Quando necessário |
| `search` | Buscar padrões no código | Frequente |
| `ast_grep` | Buscar estruturas AST | Quando refatorando |
| `lsp` | Code intelligence (goto def, refs) | Quando explorando |
| `bash` | Executar comandos npm, git | A cada ciclo |
| `recipe` | Rodar npm scripts (build, test, lint) | A cada ciclo |
| `task` | Paralelizar trabalho com subagentes | Quando necessário |
| `job` | Monitorar tarefas em background | Se houver jobs ativos |
| `irc` | Comunicação inter-agente | Raro (só se multithread) |
| `web_search` | Pesquisar conceitos externos | Quando requer pesquisa |
| `mcp__context_*` | Documentação de bibliotecas | Quando requer docs |
| `eval` | Computação rápida, código inline | Quando útil |
| `browser` | Verificar páginas web | Quando necessário |
| `todo_write` | Gerenciar tasks multi-fase | Quando trabalho complexo |

### 4.2 Estratégia de Task (Subagentes)

Use `task` quando trabalho pode ser **paralelizado sem dependências**:

```
TRABALHO PARALELIZÁVEL:
├── Implementar múltiplos componentes independentes
├── Escrever testes para múltiplos arquivos
├── Refatorar múltiplos arquivos similares
├── Documentar múltiplas seções
└── Explorar múltiplos diretórios simultaneamente

TRABALHO SEQUENCIAL (NÃO paralelizar):
├── Worktree sujo (precisa commit primeiro)
├── Dependências entre tarefas
├── Decisão arquitetural que afetará outras
└── Criação de novo arquivo que será referência
```

---

## 5. Sistema de Memória e Persistência

### 5.1 Camadas de Memória

```
LAYER 1: SESSION CONTEXT (automático)
├── Histórico da conversa atual
├── Arquivos lidos nesta sessão
└── Estado do workspace

LAYER 2: PROJECT MEMORY (memory://root)
├── Resumo injetado no system prompt ao iniciar
├── MEMORY.md: documento de longo prazo
├── skills/: playbooks reutilizáveis
└── Atualizado: a cada ciclo ou via /memory rebuild

LAYER 3: ARTIFACT PERSISTENCE (agent:// + artifact://)
├── Outputs de subagentes (task outputs)
├── Artefatos de comandos (build logs, etc)
└── States de execução pesada

LAYER 4: GIT HISTORY
├── Commits descritivos com mudanças
├── Branches para work isolation
└── Tags para milestones
```

### 5.2 Atualização de Memória

Ao final de cada ciclo:

```
1. GIT COMMIT
   └── git add . && git commit -m "feat: [descrição]"
   
2. MEMORY UPDATE (se aprendizado significativo)
   ├── Se nova correlação espiritual descoberta:
   │   └── Atualizar IDEIA.md
   ├── Se regra comportamental refinada:
   │   └── Atualizar AGENTS.md
   ├── Se achievement de projeto:
   │   └── Atualizar PROGRESS.md
   └── Se aprendizado de processo:
       └── Escrever em memory://root/MEMORY.md

3. SKILL GENERATION (se conhecimento reutilizável)
   └── Criar skill em memory://root/skills/<nome>/SKILL.md
```

---

## 6. Regras de Comportamento do Agente

### 6.1 Regras de Ouro

```
1. SEMPRE tenha objetivo claro
   → Cada ação deve ter propósito
   → Cada ciclo deve produzir resultado tangível

2. NUNCA deixe trabalho incompleto
   → Se começou feature, complete ou documente por que parou
   → Se não terminou ciclo, deixe plano para próximo

3. SEMPRE valide antes de commit
   → Build deve passar
   → Lint deve passar
   → Testes devem passar

4. MANTENHA worktree limpo
   → Commit antes de autoresearch
   → Descreva mudanças claramente

5. PRESERVE conhecimento
   → Atualize docs, não quebre o que funciona
   → Adicione testes para cada feature
   → Compress knowledge em regras reutilizáveis

6. RESPEITE o contexto espiritual
   → Use APENAS dados do IDEIA.md
   → Nunca invente correspondências
   → Trate tradições com reverência

7. OTIMIZE para evolução contínua
   → A cada ciclo, sistema fica mais inteligente
   → Reduza complexidade, aumente clareza
   → Encontre estruturas profundas, descarte redundâncias
```

---

## 7. Targets e Objetivos de Longo Prazo

### 7.1 Meta Principal
> **Tornar o Cabala dos Caminhos no maior sistema de tecnologia espiritual e correlações do mundo.**

### 7.2 Roadmap de Evolução

```
FASE 1: CONSOLIDAÇÃO (Ciclos 1-50)
├── Meta: 100% test coverage em engines existentes
├── Meta: QUALITY_SCORE >= 0.95
├── Meta: 100% de correlações do IDEIA.md implementadas
└── Deliverable: Sistema robust, tested, documented

FASE 2: EXPANSÃO (Ciclos 51-150)
├── Meta: Adicionar tradições faltantes (I Ching, Runas, etc)
├── Meta: Implementar todas as 303+ correlações no widget registry
├── Meta: Criar engine de calendário de convergência
└── Deliverable: Sistema completo de todas tradições

FASE 3: INTELIGÊNCIA (Ciclos 151-300)
├── Meta: Engine de IA para predições espirituais
├── Meta: Sistema de jornadas personalizadas (21 dias)
├── Meta: Correlação preditiva baseada em gramática do destino
└── Deliverable: Sistema preditivo inteligente

FASE 4: LIDERANÇA (Ciclos 301+)
├── Meta: API pública para desenvolvedores
├── Meta: Marketplace de widgets comunitários
├── Meta: Integração com múltiplas plataformas
└── Deliverable: Plataforma líder mundial
```

---

## 8. Checklist de Evolução por Ciclo

```
PRE-CICLO:
□ Worktree está limpo? (git status sem mudanças pendentes)
□ memory://root atualizado?
□ PROGRESS.md reflete estado atual?

CICLO:
□ Objetivo do ciclo definido?
□ Plano de execução criado?
□ Recursos externos necessários (web_search, docs)?
□ Prioridade estabelecida?

EXECUÇÃO:
□ Implementou código?
□ Escreveu testes?
□ Verificou build (npm run build)?
□ Verificou lint (npm run lint)?
□ Verificou testes (npm run test:run)?

PÓS-CICLO:
□ Commitou mudanças?
□ Atualizou memória?
□ Qual é próximo passo?
□ Ciclo deve continuar?
```

---

*Última atualização: 2026-05-30*
*Versão: 1.0 — Engenharia de Harness Auto-Evolutiva*