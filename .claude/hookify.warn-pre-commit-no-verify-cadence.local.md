---
name: warn-pre-commit-no-verify-cadence
enabled: true
event: bash
action: warn
pattern: git\s+commit
---

🚚  **Cadência de entrega (cluster workflow — instinto `npm-verify-cadence`)**

Antes de commitar uma mudança não-trivial, rode NESTA ORDEM:
1. `npm run build` (ground truth — HMR overlay mente)
2. `npm run lint`
3. `npm run test:run`

**Não confie no overlay do Turbopack** — erro "import/export" pode ser de HMR cacheado, não do seu código. O build é a fonte da verdade.

Test count delta = métrica primária do ciclo. Se testes pré-existentes falharem (drift / B2C legacy), **não conserte** dentro desta fase — registre em "Pré-existentes" no cycle memory e siga.

Aplicável só a commits com diff não-trivial; amend trivial não precisa.
