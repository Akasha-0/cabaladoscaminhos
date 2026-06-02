---
name: warn-bash-curl-without-auth-header
enabled: true
event: bash
action: warn
pattern: (curl|http|fetch)\s+.*localhost:3000.*api/(?!auth/login|auth/register)
---

🔐  **Requisição HTTP para rota protegida sem header de auth** (cluster auth)

Você está fazendo uma chamada HTTP a uma rota que provavelmente exige auth. Sem header `Cookie: cockpit_session=...` ou `x-dev-operator-id`, vai retornar 401.

Se for teste ad-hoc, use o header dev: `curl -H "x-dev-operator-id: <id>" ...`. Em prod, autentique antes.

Skill carregada: `or-reviewing-any-authenticatio` (10 instintos).
