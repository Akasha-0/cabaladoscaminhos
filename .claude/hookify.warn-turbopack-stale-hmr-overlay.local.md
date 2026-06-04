---
name: warn-turbopack-stale-hmr-overlay
enabled: true
event: bash
action: warn
pattern: (cannot be used outside of module code|Failed to resolve import|Cannot find module)
---

🐛  **Possível erro stale do Turbopack HMR** (instinto `nextjs-turbopack-stale-hmr`, cluster debugging)

O overlay do dev server Turbopack pode mostrar erros de "import/export" ou "Failed to resolve" **vários minutos depois** de você ter corrigido o arquivo, porque o HMR cacheia a falha. A mensagem não é ground truth.

**Antes de mexer no código:**
1. Rode `npm run build` para confirmar o estado real
2. Se passar, **diga ao usuário para dar hard-reload** (Ctrl+Shift+R) ou reiniciar `npm run dev`
3. O nome da variável na mensagem stale pode nem bater com o conteúdo atual do arquivo

Aplicável a qualquer erro de build que apareça "do nada" após corrigir import missing.
