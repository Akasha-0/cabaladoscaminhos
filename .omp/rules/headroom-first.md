---
name: headroom-first
description: Compress all tool outputs >5k tokens with Headroom proxy (60-92% fewer tokens).
condition:
  - 'read\s'
  - 'stdout|stderr|artifact'
  - 'result|output|response'
  - 'large|big|long|huge'
interruptMode: tool-only
level: critical
priority: 2
---

## Headroom: compressão automática de outputs grandes

O Headroom proxy (porta 8787) comprime automaticamente outputs de ferramentas
com mais de 5k tokens, reduzindo 60-92% do consumo.

### Para outputs grandes:

```bash
# Verificar status do headroom
curl -s http://127.0.0.1:8787/health

# Para ver estatísticas de compressão:
mcp__headroom__headroom_stats

# Se um bloco estiver comprimido use:
mcp__headroom__headroom_retrieve <hash>
```

### NÃO faça isso:
- Leia arquivos inteiros quando precisa de uma seção
- Grepe resultados grandes sem comprimir

### Em vez disso:
1. Output >5k tokens → Headroom comprime automaticamente via proxy
2. Se vir `[CCR:hash]` → use headroom_retrieve para expandir
3. Economia típica: 60-92% em buscas de código, logs, JSON dumps