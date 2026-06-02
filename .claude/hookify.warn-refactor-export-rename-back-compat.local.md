---
name: warn-refactor-export-rename-back-compat
enabled: true
event: file
action: warn
pattern: ^\s*export\s+(function|const|class|interface|type|enum)\s+\w+
---

♻️  **Refactor detectável: novo export ou rename de símbolo** (cluster refactor — 2 instintos)

Você está adicionando ou renomeando um símbolo `export`. Antes de commitar, confirme:

1. **Back-compat aliases** (instinto `back-compat-legacy-types-aliases`): se renomeou algo, mantenha `export type OldName = NewName` (ou similar) até confirmar que nenhum consumidor ainda usa. Quebrar consumidores externos em uma refactor "interna" é scope creep.
2. **Derive, não invente** (instinto `agents-md-derive-not-invent-correspondences`): se está adicionando um novo tipo de correlação (cabalística, astrológica, etc.), verifique se já existe em `IDEIA.md` ou `AGENTS.md`. **NUNCA** invente uma correspondência esotérica nova sem fonte — esse é o instinto mais importante do projeto.

HMR overlay mente — após renames, rode `npm run build` pra confirmar que tudo ainda compila.

Skill carregada: `refactoring-legacy-code-while-` (2 instintos).
