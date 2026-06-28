# 🚧 Blockers — Akasha Portal

> Status consolidado de bloqueios ativos para o ciclo de desenvolvimento.
> Última atualização: 2026-06-28 06:30 UTC

---

## B2026-06-28-06:00-UTC-001 — TSC=2792 (gate TSC=0 não atingido)

**Status:** 🔴 ACTIVE — bloqueia qualquer commit com gate TSC=0
**Severidade:** P0 (gate de qualidade)
**Owner:** user (decisão sobre deletar orphans)

### Resumo

`npx tsc --noEmit --skipLibCheck` retorna **2792 erros** na branch `feat/community-platform` @ `0db6c4f`.

### Distribuição

| Categoria | Count | % | Origem |
|---|---|---|---|
| TS7006 (parameter implicitly any) | 1420 | 50.9% | orphan tests em `tests/lib/*` |
| TS2307 (cannot find module) | 824 | 29.5% | orphan tests importando `@/lib/...` que não existe |
| TS18046 (Prisma tipos) | 449 | 16.1% | residual pós `prisma generate` |
| Outros (TS2339/2322/2345/2353/etc) | 99 | 3.5% | mix de src/ + __tests__/ reais |

### Origem dos arquivos quebrados

- **`tests/lib/*` orphans: ~158 arquivos** (134 dirs + 24 root .test.ts) — `src/lib/<feature>/` foi deletado no refactor v3.0, mas os testes foram deixados. **NÃO há código de produção correspondente.** Total ~2693 erros (~96%).
- **`__tests__/*` reais: ~38 erros** — testes do app com bugs genuínos pequenos
- **`src/*` real: ~50 erros** — código de produção com bugs em seed/explore/akashic/feedback
- **`middleware.ts`, `prisma/seed/`: ~10 erros** — bugs genuínos

### Investigação (2026-06-28 06:00 UTC)

```bash
# Confirmar que src/lib/correlation NÃO existe
$ ls src/lib/correlation
ls: cannot access 'src/lib/correlation': No such file or directory

# Confirmar que tests/lib/correlation/ TEM 145 arquivos
$ find tests/lib/correlation -type f | wc -l
145

# Listar 134 dirs órfãs (de 137 totais)
$ for d in tests/lib/*/; do
    dirname=$(basename "$d")
    [ ! -d "src/lib/$dirname" ] && echo "ORPHAN: $dirname"
  done | wc -l
134
```

**Confirmação:** 134 dirs em `tests/lib/*` não têm `src/lib/*` correspondente. Apenas 3 dirs têm par válido: `ai`, `notifications`, `statistics`.

### Opções de desbloqueio

#### Opção A — Deletar orphan tests (RECOMENDADA, ~5 min)

**Procedimento:**
```bash
cd /workspace/cabaladoscaminhos
# Deletar dirs órfãs
for d in tests/lib/*/; do
  dirname=$(basename "$d")
  [ ! -d "src/lib/$dirname" ] && rm -rf "$d"
done
# Deletar root-level orphans
for f in tests/lib/*.test.ts; do
  base=$(basename "$f" .test.ts)
  if [ ! -d "src/lib/$base" ] && [ ! -f "src/lib/$base.ts" ]; then
    rm "$f"
  fi
done
# Validar
npx tsc --noEmit --skipLibCheck
```

**Resultado esperado:** TSC < 100 (residuais: __tests__ + src + middleware + ~50 erros genuínos)

**Trade-off:** perde 158 arquivos de teste. Mas os testes são **dead code** (não há produção correspondente). Documentar em commit message.

**Mensagem de commit sugerida:**
```
chore(tests): remove 158 orphan test files from v2→v3.0 refactor

Tests in tests/lib/* were left behind when src/lib/<feature>/ was deleted
during the v3.0 community-platform refactor (2026-06-27). Each orphan test
imports from @/lib/<feature>/ that no longer exists. 96% of TSC errors
(2693 of 2792) come from these orphans.

Kept: tests/lib/ai, tests/lib/notifications, tests/lib/statistics
(those have corresponding src/lib/*).

Refs: gap analysis 2026-06-28 P0 #2; EVOLUTION-LOG entry 2026-06-28.
```

#### Opção B — Preservar orphans via stubs (~30 min, NÃO recomendado)

Criar `src/lib/_stubs/<dirname>.ts` com exports vazios. Trabalho braçal, sem valor agregado, mascara dívida técnica.

#### Opção C — Aceitar TSC>0 com documentação (~0 min)

Manter orphans, adicionar `// @ts-expect-error` em cada import. Piora a dívida, não recomendado.

### Decisão recomendada

**Opção A**, após aprovação do user. Estimativa: 5-15 min para execução + 1 commit.

---

## B2026-06-28-06:00-UTC-002 — Sandbox intermitente (workaround ativo)

**Status:** 🟡 MONITORED — 11 resets detectados entre 00:00-06:00 UTC
**Severidade:** P2 (operação, não bloqueador de feature)
**Owner:** infra (provisionar host persistente OU bake creds no sandbox image)

### Resumo

A cada 30-60 min, o sandbox é wiped (`/workspace` vazio, sem `.git-credentials`, sem `mavis`, sem `gh`). Wave-spawner logs e BLOCKERS.md criados em ciclo anterior são perdidos.

### Workaround atual (esta sessão)

1. `git clone --depth 50 https://x-access-token:${GITHUB_TOKEN}@github.com/...` 
2. `git remote set-url origin https://github.com/...` (sanitiza token)
3. `git fetch origin refs/heads/<branch>:<ref>` (refspec explícito para refs não-default)
4. `npm ci` (~2min para 854 pkgs)

### Recomendação

- Provisionar host persistente para wave-spawner (NÃO ephemeral)
- OU bake `~/.git-credentials` + `mavis` CLI no sandbox image
- OU rodar wave-spawner como one-shot script no início de cada ciclo

---

## Histórico de blockers resolvidos

- **B2026-06-27-P0-001** — BUG-001 migration quebrada — RESOLVIDO (migration `20260627_000000_search_discovery` aplicada e idempotente, commit anterior)
- **B2026-06-27-P0-002** — Schema unificado pendente — RESOLVIDO (`prisma/community.prisma` mesclado em `schema.prisma`, B2B removido)
- **B2026-06-28-01:00-UTC-001** — Prisma 7.x schema `url` syntax — **RESOLVIDO nesta sessão** (linha removida, `prisma generate` passa, TSC residual -38)
