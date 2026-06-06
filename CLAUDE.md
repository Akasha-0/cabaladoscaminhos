# CLAUDE.md — Cabala dos Caminhos

> Autonomous agent context file. This file provides persistent context for
> Claude Code sessions on this project.

## Project Identity

**Cabala dos Caminhos** é um sistema de tecnologia espiritual que integra múltiplas
tradições (Numerologia Cabalística, Odu Ifá, Astrologia, Tarot, Cabala, Orixás,
Chakras, Geometria Sagrada, Frequências Solfeggio) em um produto B2B (Cockpit
Oracular) com correlações verificáveis.

- **Stack**: Next.js 16 + React 19 · Prisma 7 + PostgreSQL · Redis · JWT · Stripe
- **Quality target**: `QUALITY_SCORE >= 0.91`
- **Tests**: ~9771 passing, build OK

## Memory Files

- `memory/summary.md` — project overview + current state
- `memory/task-queue.md` — persistent task list for autonomous operation
- `memory/autonomous-workflows.md` — scheduled cron definitions

## Critical Rules

1. **Ler PROGRESS.md antes de implementar** — fonte da verdade sobre estado
2. **NUNCA inventar correspondências esotéricas** — usar apenas dados do GOAL.md
3. **Surgical changes** — não "melhorar" código adjacente não relacionado
4. **Verificar antes de claim completo** — `npm run test:run` + `npm run build`

## Commands

```bash
npm run test:run   # Validar testes
npm run build      # Validar build
npm run lint       # Validar linting
npx tsc --noEmit   # Type-check
```

## Roadmap

Phases 19-27 pending (MFA, audit log, health checks, CSP, rate-limit, password reset, lockout, Stripe hardening).

## Autonomous Agent

This project has autonomous agent support configured. See:
- `memory/autonomous-workflows.md` for scheduled cron patterns
- `memory/task-queue.md` for persistent task list

Quality gates MUST pass: `npx tsc --noEmit` + `npm run test:run` + `npm run build`
