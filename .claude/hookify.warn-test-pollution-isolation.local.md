---
name: warn-test-pollution-isolation
enabled: true
event: bash
action: warn
pattern: npm\s+run\s+test:run
---

🧪  **Suite completa detectada (cluster testing — 6 instintos carregados)**

Você está rodando o suite completo. Lembre:
- Se aparecer falha **só no suite** (passa em `npx vitest run <file>` isolado), é **test pollution** (instinto `test-pollution-shared-module-state`)
- Investigar antes de mexer no código: `vi.resetModules()` + `vi.clearAllMocks()` em `beforeEach`, ou refatorar caches atrás de factories
- **Falhas pré-existentes** (drift / B2C legacy) NÃO devem ser consertadas dentro desta fase — registrar em cycle memory

Skill carregada: `a-vitest-test-fails-in-the-ful` (6 instintos).
