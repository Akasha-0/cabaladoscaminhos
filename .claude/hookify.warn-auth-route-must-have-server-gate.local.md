---
name: warn-auth-route-must-have-server-gate
enabled: true
event: file
action: warn
pattern: src/app/api/.*\.(ts|tsx)
---

🔐  **Rota API sob edição (cluster auth — 10 instintos carregados)**

Você está editando uma rota em `src/app/api/`. Antes de commitar, confirme:

1. **Gate server-side obrigatório** (instinto `server-side-auth-gate-mandatory-not-client-only`): a PRIMEIRA linha após parsing deve ser `requireOperator()` ou equivalente. Client-side guards são só UX, não segurança.
2. **Anti-enumeração** (instinto `anti-enumeration-generic-credentials-error`): retorne a MESMA mensagem e status para "usuário não existe" e "senha errada" — incluindo bcrypt dummy hash em branch de user-not-found pra tempo de resposta constante.
3. **JWT verify com allowlist** (instinto `jwt-algorithm-allowlist-downgrade-attack`): sempre passe `algorithms: ['HS256']` (ou o algoritmo correto) — nunca deixe o `alg` do header ser honrado.
4. **Zod preprocess** (instinto `zod-preprocess-normalize-before-validate`): se valida email/username, normalizar (`trim().toLowerCase()`) ANTES de `.email()`.

Skill carregada: `or-reviewing-any-authenticatio` (10 instintos).
