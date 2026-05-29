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
**Leia o IDEIA.md antes de implementar qualquer engine espiritual.**
- O IDEIA.md contém 42.9KB de correspondências esotéricas cuidadosamente mapeadas.
- Nunca invente correspondências esotéricas. Use APENAS os dados do IDEIA.md.
- Trate as tradições afro-brasileiras (Candomblé, Umbanda, Odus) com reverência absoluta.
- Valide cálculos espirituais com casos reais antes de considerar implementação completa.
- As quizilas e preceitos dos Odús são regras reais — erros têm impacto real nas pessoas.

## 6. Estado do Projeto
**Leia o PROGRESS.md antes de qualquer ação em novo ciclo.**
- O PROGRESS.md é a fonte da verdade sobre o que existe e o que falta.
- Se não existir, crie-o como primeira ação absoluta.
- Atualize-o após cada feature, bug fix ou decisão arquitetural importante.

## Stack do projeto
Next.js 16 + React 19 + Prisma 7 + Supabase + Redis (ioredis) + OpenAI + Stripe + jsPDF
Auth: JWT/bcryptjs própria (não NextAuth). Testes: Vitest. Validação: Zod. State: Zustand.

## Comandos principais
- `npm run test:run` — validar que testes passam
- `npm run build` — validar que build passa
- `npm run lint` — validar linting
- `npm run db:generate` — após mudanças no schema Prisma