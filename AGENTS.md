# AGENTS.md — Cabala dos Caminhos

Behavioral guidelines para agentes de IA desenvolvendo este projeto.

## 1. Think Before Coding
**Não assuma. Não esconda confusão. Mostre tradeoffs.**
- Declare suas assunções explicitamente. Se incerto, pergunte.
- Se múltiplas interpretações existirem, apresente-as — não escolha silenciosamente.
- Se algo está confuso, PARE. Nomeie o que confunde. Pergunte.

## 2. Simplicity First
**Mínimo de código que resolve o problema. Nada especulativo.**
- Sem features além do que foi pedido.
- Sem abstrações para código de uso único.
- Se escreveu 200 linhas e poderia ser 50, reescreva.

## 3. Surgical Changes
**Toque apenas o necessário. Limpe apenas sua própria bagunça.**
- Não "melhore" código adjacente não relacionado.
- Não refatore o que não está quebrado.
- Match do estilo existente, mesmo que você faria diferente.

## 4. Goal-Driven Execution
**Defina critérios de sucesso. Loop até verificado.**
- "Implementar Odu" → "Escrever testes para 3 Odús reais, depois fazer passar"
- Para tarefas multi-etapas, declare um plano breve com verificações.

## 5. Contexto Espiritual (específico deste projeto)
<<<<<<< Updated upstream
**Leia o IDEIA.md antes de implementar qualquer engine espiritual.**
- O IDEIA.md contém correspondências esotéricas cuidadosamente mapeadas.
- Nunca invente correspondências esotéricas. Use APENAS os dados do IDEIA.md.
=======
**Leia o GOAL.md antes de implementar qualquer engine espiritual.**
- O GOAL.md contém 42.9KB de correspondências esotéricas cuidadosamente mapeadas.
- Nunca invente correspondências esotéricas. Use APENAS os dados do GOAL.md.
>>>>>>> Stashed changes
- Trate as tradições afro-brasileiras (Candomblé, Umbanda, Odus) com reverência absoluta.
- Valide cálculos espirituais com casos reais antes de considerar implementação completa.
- As quizilas e preceitos dos Odús são regras reais — erros têm impacto real nas pessoas.

## 6. Estado do Projeto
**Leia o PROGRESS.md antes de qualquer ação em novo ciclo.**
- O PROGRESS.md é a fonte da verdade sobre o que existe e o que falta.
- Se não existir, crie-o como primeira ação absoluta.
- Atualize-o após cada feature, bug fix ou decisão arquitetural importante.

## 7. Auto-Evolution Loop (Harness de Evolução Contínua)

### 7.1 O Ciclo Principal

O projeto opera em ciclos de evolução contínua. Cada ciclo segue esta estrutura:

```
ASSESS → PLAN → EXECUTE → VERIFY → EVOLVE → LOOP
```

### 7.2 ASSESS (Avaliação de Contexto)

Sempre iniciar lendo:
- `PROGRESS.md` — estado atual do projeto
- `memory://root/memory_summary.md` — aprendizagens acumuladas
- `GOAL.md` — objetivo de longo prazo
- `THINKING.MD` — cadeia de pensamento atual

Verificar:
- `git status` — worktree está limpo?
- `job list` — há jobs em background?

### 7.3 Métricas de Sucesso

Um ciclo é bem-sucedido se qualquer uma:
- Nova correlação espiritual mapeada em 3+ tradições
- Duas tradições revelaram estrutura compartilhada
- Regra antiga refinada por conflito descoberto
- Engine otimizada (performance ou precisão)
- Test coverage aumentado
- Bug crítico corrigido

Target: `QUALITY_SCORE >= 0.91`

## 8. Cadeia de Pensamento para Correlação Espiritual

### Processo de Descoberta de Correlação

```
1. LISTAR tradições disponíveis
   - Numerologia Cabalística
   - Odu Ifá (Merindilogun)
   - Astrologia (Western/Vedic)
   - Tarot (Arcanos Maiores/Menores)
   - Cabala (Sephiroth/Árvore da Vida)
   - Orixás (Candomblé/Umbanda)
   - Chakras (Yoga/Tantra)
   - Geometria Sagrada (Poliedros Platônicos)
   - Frequências Solfeggio
   - Botânica Oculta

2. SELECIONAR elemento comum
   - Dia da semana
   - Planeta/Astro
   - Elemento (fogo/água/ar/terra/éter)
   - Chakra
   - Número
   - Arcano
   - Orixá

3. MAPEAR correspondências por tradição

4. VALIDAR consistência
   - 3+ tradições confirmam → ALTA CONFIANÇA
   - 2 tradições confirmam → CONFIANÇA MÉDIA
   - 1 tradição confirma → BAIXA CONFIANÇA

5. DOCUMENTAR correlação
   - Nome descritivo
   - Tabela de mapeamento
   - Implicações práticas

6. INTEGRAR no sistema
   - Atualizar IDEIA.md
   - Implementar em spiritual-engine.ts
   - Criar teste de validação
```

### Motor de Substituição

Quando quizila ou preceito detectado:
1. Perguntar: "qual é a função energética?"
2. Encontrar equivalente funcional em outra tradição
3. Redirecionar sem perder intenção

## 9. Stack do Projeto

- **Framework**: Next.js 16 + React 19
- **Database**: Prisma 7 + PostgreSQL
- **Cache**: Redis/ioredis
- **Auth**: JWT/bcryptjs própria
- **AI**: OpenAI SDK + Minimax API
- **Payments**: Stripe
- **PDF**: jsPDF
- **Testing**: Vitest
- **Validation**: Zod
- **State**: Zustand

### Comandos Principais

```bash
npm run test:run   # Validar que testes passam
npm run build      # Validar que build passa
npm run lint       # Validar linting
npm run quality    # Análise de qualidade de código
npm run db:generate # Após mudanças no schema Prisma
```

## 10. Estrutura de Commits

```
TIPO: [scope] descrição

Tipos:
- feat: nova feature
- fix: correção de bug
- refactor: refatoração
- test: adicionar/modificar testes
- docs: documentação
- chore: manutenção
- spiritual-correlation: nova correlação espiritual
```

---

*Última atualização: 2026-05-30*
*Versão: 2.0 — Inclui Auto-Evolution Loop e Cadeia de Pensamento Espiritual*