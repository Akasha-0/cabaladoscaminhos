# coordination/w-main/ARCHITECTURE.md

## Papel w-main no Swarm Akasha

**Definido em**: `coordination/DOMAINS.md`
**Autor**: w-main (main branch)
**Última atualizacao**: Ciclo 532

---

## Dominio w-main

w-main opera como **INTEGRADOR** no branch `main`. Seu dominio e **exclusivamente** de coordinacao:

| Arquivo/Diretorio | Tipo | Justificativa |
|---|---|---|
| `coordination/w-main/**` | LEITURA+ESCRITA | Domnio declarado em DOMAINS.md |
| `coordination/DOMAINS.md` | LEITURA | PROIBIDO editar |
| `coordination/integrator/**` | LEITURA | PROIBIDO editar |
| `coordination/w{N}/**` (N!=main) | LEITURA | PROIBIDO editar |
| `docs/DECISIONS.md` | LEITURA+ESCRITA | Decisoes de dominio w-main |
| `STATE.md` (raiz) | LEITURA | PROIBIDO editar |
| `VERSION`, `CHANGELOG.md` | LEITURA | PROIBIDO editar |
| `CHECKPOINT.md` | LEITURA | PROIBIDO editar |
| Qualquer codigo fonte | LEITURA | Fuera del dominio |

**Nota**: `./setup-swarm.sh` nao foi executado. w-main NAO possui worktree `loop/w1/w2/w3/w4`. w-main nao pode implementar features em nenhum dominio de codigo.

---

## Por que w-main ciclo 9x sem implementacao

Ciclos 523-532: w-main executou **10 ciclos consecutivos** sem implementar nenhuma feature.

**Causa raiz**: `./setup-swarm.sh` nao executado = sem worktree = sem dominio de codigo.

**Estrutura do swarm**:
- w-main (main): `coordination/w-main/**` + integrator authority
- w1 (loop/w1): motor — `packages/akasha-core/**`, `src/lib/**`
- w2 (loop/w2): UI — `apps/akasha-portal/src/**`
- w3 (loop/w3): conteudo — `src/content/**`
- w4 (loop/w4): qualidade — `tests/**`

**Bloqueio**: sem `./setup-swarm.sh`, apenas w-main opera. w1-w4 estao parados.

---

## O que w-main PODE fazer sem worktree

1. **Auditoria de codigo** (leitura de todo o repositorio)
2. **Documentacao de coordinacao** (historico, requests, backlog)
3. **Identificacao de problemas estruturais** (violacoes de dominio, blockers)
4. **Escalacao ao integrador** via `requests.md`

## O que w-main NAO PODE fazer sem worktree

1. Implementar features em qualquer dominio de codigo
2. Corrigir bugs em arquivos `apps/`, `packages/`, `src/`, `tests/`
3. Fazer build ou testes funcionais
4. Modificar arquivos `coordination/w{N}/` de outros workers

---

## Resolucao

1. **HUMAN ACTION**: `./setup-swarm.sh` — cria worktrees e desbloqueia w1-w4
2. Alternativa: definr explicitamente um dominio de codigo para w-main em `DOMAINS.md`
3. w-main continua como auditor ate que worktree exista

---

## Historico de ciclos (resumo)

| Range | Qtd | Tipo predominante |
|---|---|---|
| 523-532 | 10 | Auditoria Local |
| 528 | 1 | CHECKPOINT + Integracao |
| 524-527 | 4 | Features + Quality |

**Media**: ~1 ciclo/dia desde 2026-06-12
