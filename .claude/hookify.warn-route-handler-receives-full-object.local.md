---
name: warn-route-handler-receives-full-object
enabled: true
event: file
action: warn
pattern: (client|matrixData|reportHouses|fullObject)\s*:\s*(z\.object|z\.record|Record<)
---

🎯  **Pattern: rota recebendo objeto completo no body** (cluster patterns — 2 instintos)

Você está tipando um campo no body de rota que parece ser um objeto de domínio completo. Antes de commitar, considere:

1. **Derivar do ID, não receber no body** (instinto `derive-route-data-from-db-by-id-not-request-body`): se a rota precisa de `Client`/`matrixData`/`reportHouses` etc., prefira receber só o `id` e carregar via `getXxxContext(id)`. Elimina drift cliente/servidor, reduz payload, fecha attack surface de field overwrite.
2. **Returns T | NextResponse** (instinto `explicit-union-return-pattern`): helpers que podem falhar (auth, not-found, validation) devem retornar união em vez de throw. Caller faz `if (x instanceof NextResponse) return x`. Throw só pra condições excepcionais reais (DB unreachable, programmer error).

Skill carregada: implicit no cluster patterns — abra o instinto `derive-route-data-from-db-by-id-not-request-body` se precisar do rationale completo.
