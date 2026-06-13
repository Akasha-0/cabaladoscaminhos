# coordination/w-main/STATE.md — Integrator / Main (Ciclo 534)

**Versão atual**: v0.1.3
**Última atualização**: 2026-06-12
**Ciclo**: 534

---

## Ciclo 534 — Auditoria Local + Domain Clarification

**Typecheck**: 0 erros ✅ | **Git**: clean

### w-main Domain Clarification

DOMAINS.md não atribui nenhum glob de código a w-main.
O integrador é o único com autoridade para modificar código em main.
**Consequência**: w-main NÃO pode modificar componentes UI em `apps/akasha-portal/`.
Tentativas resultam em reverts pelo Akasha Merge Bot.

### Akasha Merge Bot — Comportamento Observado

- Akasha Merge Bot reverteu commits w-main em `AkashaLifeAreasDashboard.tsx`
- Motivo: w-main não tem glob que cubra `apps/akasha-portal/src/components/**`
- Após reverts, `pillarContribution` survives (re-implementado em `a7cb2064`)
- **w-main deve parar de tocar arquivos em `apps/akasha-portal/src/`**

### Auditoria — Achados

1. **DEC-004**: CRITICA — shadow/gift/siddhi vs Gene Keys, pendente há 10+ ciclos
2. **DEC-005**: TYPE VIOLATION — w-main violou dominio w2 ciclos 526-529
3. **`./setup-swarm.sh`**: blocker há 10+ ciclos — sem worktrees
4. **AkashaSignificadoCard em /mapa/significado**: defaultNivel não passado (w2 bug)
5. **Cross-engine**: `_kab`/`_date` params orfãos (w1 domain)
6. **Test failures**: 241+ falhas ambientais (w4 domain)

### w-main Domain Atual

- `coordination/w-main/**` ✅
- `docs/DECISIONS.md` ✅

---

## Histórico

- **534**: Auditoria — domain clarification, w-main para de tocar UI
- **533**: Auditoria + re-implementação pillarContribution
- **532**: Auditoria + ARCHITECTURE.md
- Detalhado: `historico.md`

---

## Próximos Passos

1. **HUMAN**: `./setup-swarm.sh` + decisão DEC-004 + clarificar domínio w-main em DOMAINS.md
2. **w2**: AkashaSignificadoCard defaultNivel + Capacitor APK
3. **w1**: cross-engine cleanup
4. **w4**: test failures
