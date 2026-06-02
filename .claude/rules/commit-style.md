---
paths:
  - "**/*"
---

# Commit Style — Cabala dos Caminhos

## Convenção de mensagem

- **Conventional Commits** (sem scope obrigatório, mas recomendado):
  - `feat(scope): descrição` — feature nova
  - `fix(scope): descrição` — bug fix
  - `refactor(scope): descrição` — refactor sem mudança de comportamento
  - `test(scope): descrição` — só testes
  - `docs(scope): descrição` — só docs
  - `chore(scope): descrição` — deps, configs, build
- Exemplos do projeto: `feat(cockpit): Operator login page`, `refactor(lenormand): Fase 10 — limpar mesa-real-types`

## Escopo

Scopes usados no projeto: `auth`, `cockpit`, `lenormand`, `divination`, `numerology`, `astrology`, `db`, `prisma`, `api`, `ui`, `docs`, `tests`.

## Antes de commitar (cadência obrigatória)

1. `npm run build` — ground truth, NÃO confie no HMR overlay
2. `npm run lint`
3. `npm run test:run`
4. Se testes pré-existentes falharem (drift / B2C legacy), **NÃO conserte** — registre em "Pré-existentes" do cycle memory

## Multi-task por fase

Cada fase do projeto é um commit (ou conjunto pequeno de commits coesos). Mensagem deve incluir "Fase N — descrição" para rastreabilidade com `memory/cycle-*.md`.

## NÃO commitar

- `.env*` (exceto `.env.example`)
- `node_modules/`, `dist/`, `.next/`
- Cycles unstaged > 1 semana sem revisão
- Mudanças não relacionadas (autoformat em 150 arquivos sem aprovação)
