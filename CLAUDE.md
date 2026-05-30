# CLAUDE.md — Cabala dos Caminhos

## Arquivos de Contexto Obrigatórios

Este projeto usa um sistema de arquivos de contexto que fornecem informações críticas para o desenvolvimento:

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| `@AGENTS.md` | Regras comportamentais e processo de auto-evolução | Sempre antes de codar |
| `@GOAL.md` | Engenharia de harness e arquitetura do loop | Ao iniciar tarefa complexa |
| `@THINKING.MD` | Cadeia de pensamento e raciocínio espiritual | Ao trabalhar em correlações |
| `@IDEIA.md` | Banco de dados de correspondências esotéricas | Ao implementar engines espirituais |
| `@PROGRESS.md` | Estado atual do projeto | Ao planejar novas features |

## Stack do Projeto

- **Framework**: Next.js 16 + React 19 + App Router (Turbopack)
- **Database**: Prisma 7 + PostgreSQL via pg adapter
- **Cache**: Redis/ioredis
- **Auth**: JWT/bcryptjs própria (não NextAuth)
- **AI**: OpenAI SDK + Minimax API
- **Payments**: Stripe
- **PDF**: jsPDF
- **Testing**: Vitest
- **Validation**: Zod
- **State**: Zustand

## Comandos Principais

```bash
npm run test:run   # Validar que testes passam
npm run build      # Validar que build passa
npm run lint       # Validar linting
npm run quality    # Análise de qualidade de código
npm run db:generate # Após mudanças no schema Prisma
```

## Arquitetura de Auto-Evolução

Este projeto opera com um sistema de **loop de evolução contínua**:

```
ASSESS → PLAN → EXECUTE → VERIFY → EVOLVE → LOOP
```

### Fluxo por Ciclo

1. **ASSESS**: Ler PROGRESS.md, memory://root, AGENTS.md
2. **PLAN**: Identificar tarefas prioritárias (1-3 por ciclo)
3. **EXECUTE**: Implementar, testar, documentar
4. **VERIFY**: npm run build && npm run lint && npm run test:run
5. **EVOLVE**: Commit, atualizar memória
6. **LOOP**: Próximo ciclo

### Métricas de Sucesso

- QUALITY_SCORE >= 0.91 (91%)
- 100% testes passando
- Build válido
- Lint limpo
- Nova correlação espiritual descoberta (3+ tradições)

## Engines Espirituais Implementadas

| Engine | Status | Testes |
|--------|--------|--------|
| Numerologia Cabalística | ✅ Completo | 41+ |
| Odu Ifá (Merindilogun) | ✅ Completo | 26+ |
| Astrologia | ✅ Completo | 17+ |
| MapaAlma Completo | ✅ Completo | 23+ |
| Deep Correlation Engine | ✅ Completo | - |
| AI Insights Engine | ✅ Completo | - |

## Tradições Suportadas

O sistema integra múltiplas tradições espirituais:

- **Numerologia Cabalística** — caminhos de vida, números da alma/destino
- **Odu Ifá (Merindilogun)** — 16 Odús com quizilas e preceitos
- **Astrologia** — signos, planetas, casas, aspectos
- **Tarot** — Arcanos Maiores (22 cartas) e Menores (56 cartas)
- **Cabala** — Sephiroth (10), Árvore da Vida (22 caminhos)
- **Orixás** — Candomblé e Umbanda (12 orixás principais)
- **Chakras** — 7 chakras com cores, sons, frequências
- **Geometria Sagrada** — Poliedros Platônicos
- **Frequências Solfeggio** — 9 frequências curativas

## Regras de Ouro

1. **SEMPRE** ler AGENTS.md antes de codar
2. **SEMPRE** usar dados do IDEIA.md (nunca inventar)
3. **SEMPRE** validar com testes antes de commit
4. **SEMPRE** manter worktree limpo (commit antes de autoresearch)
5. **SEMPRE** atualizar memória após aprendizado significativo

## Contato e Contexto

- **Projeto**: Cabala dos Caminhos — Sistema de Tecnologia Espiritual
- **Objetivo**: Maior sistema de correlações espirituais do mundo

---

*Última atualização: 2026-05-30*
*Versão: 3.0 — Inclui sistema de auto-evolução e contexto completo*