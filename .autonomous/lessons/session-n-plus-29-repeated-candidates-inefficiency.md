# Lesson — Loop inefficiency: repeated candidates (false positives) sem skip_list

**Date:** 2026-06-16
**Session:** N+29 (loop/w2, akasha-evolution iter 5→6)
**Commits context:** d55369fd (v0.7.0), iter 6 ativa

## Contexto

Comparando iterações 5 e 6 do akasha-evolution:

**Iter 5 (4 candidates):**
1. missing_tradition: ODUS missing from traducao-areas → FALSO POSITIVO (ODU já existe)
2. missing_tests: vida-numero-9.ts → ✅ 6 tests adicionados
3. tech_debt: 2 files with TODO (significados-curados) → FALSO POSITIVO (TODOS_PILARES)
4. console_cleanup: 5 files → 3 commits efetivos
5. large_file: MandalaChart → 1 commit (OduInfoPanel)

**Iter 6 (4 candidates):**
1. missing_tradition: **ODUS missing from traducao-areas** → MESMO FALSO POSITIVO
2. tech_debt: **2 files with TODO (significados-curados)** → MESMO FALSO POSITIVO
3. console_cleanup: 5 files (chat.tsx, recommendation-generator.ts + 3 novos) → 5 commits esperados
4. large_file: 28 oversized files → próximo da lista

3/4 candidates da iter 6 são IDÊNTICOS aos da iter 5. Os detectores
estão rodando novamente, sabendo (via memory.json) que produziram
0 fixes, mas ainda assim o `intelligence.py` os seleciona.

## Padrão observado (cronologia)

- 11:30 — tech_debt auditou (0 fixes)
- 11:30 — agent identificou TODOS_PILARES como constante
- 13:19 — tech_debt auditou (0 fixes) — 2ª vez
- 13:38 — tech_debt auditou (0 fixes) — 3ª vez
- 14:21 — tech_debt auditou (0 fixes) — 4ª vez (in-loop)
- 11:46 (iter 5) — 5ª vez
- 11:58 (iter 6) — 6ª vez (em curso)

Total: **6 auditorias de tech_debt em significados-curados em 1 dia**.
Cada uma consome ~3 min de agent time sem produzir mudança.

## Aprendizado

1. **O `intelligence.py` tem campo `outcome: "skip"` no enum
   (L60 do source) mas não implementa skip_list persistente.**
   Quando um detector retorna `success: true, message: "0 fixes"`
   ou `success: false, status: "already_present"` por 2+ vezes,
   deveria ser adicionado a uma skip_list por N iterações.

2. **A memória do loop está em `memory.json: error_patterns` mas
   não está sendo consultada para suprimir candidates repetidos.**

3. **Detector `missing_tradition` é ainda mais ineficiente porque
   a falha é DETERMINÍSTICA**: ODU sempre existirá em
   `TRADUCOES_DETALHADO` no arquivo. Não há razão para re-rodar.

4. **Custo medido**: cada agent `claude -p` consome ~2-5 min wall-clock
   + 1 commit que precisa ser revertido/limpo. Em 6 audits de
   tech_debt, foram ~18-30 min desperdiçados.

## Sugestão de melhoria (NÃO aplicada — apenas documentada)

Adicionar ao `intelligence.py`:

```python
SKIP_PATTERNS_FILE = MA / "skip_patterns.json"

def should_skip(file_key: str, max_age_iters: int = 5) -> bool:
    """Check if a file+improvement_type combo has been audited recently."""
    skip_data = load_json(SKIP_PATTERNS_FILE, {"patterns": []})
    for entry in skip_data.get("patterns", []):
        if (entry["key"] == file_key
            and current_iteration - entry["iter"] <= max_age_iters
            and entry["result"] in ("0_fixes", "already_present")):
            return True
    return False

def mark_skip(file_key: str, result: str):
    """Record a skip pattern after a '0 fixes' audit."""
    skip_data = load_json(SKIP_PATTERNS_FILE, {"patterns": []})
    skip_data["patterns"].append({
        "key": file_key,
        "iter": current_iteration,
        "result": result,
        "ts": datetime.now(timezone.utc).isoformat()
    })
    save_json(SKIP_PATTERNS_FILE, skip_data)
```

## Métrica de impacto esperado

- Antes: 6 tech_debt audits/dia, 0 fixes (ineficiência = 100%)
- Depois: 1 tech_debt audit a cada 5 iterations, 0 fixes
- Saving: ~5 agents/dia, ~15-25 min/dia wall-clock

## Estado da iteração 6 (em curso)

- 4 agents paralelos spawned às 11:56:40
- tech_debt (300588) já terminou com 0 fixes (6ª vez)
- large_file (300587) ainda processando (alvo: practices.ts ou deep-correlation-engine.ts)
- console_cleanup (300585) ainda processando (5 files)
- missing_tradition (300586) ainda processando (vai dar falso positivo de novo)

## Recomendação

A lesson N+28 (false positives) já documentou o problema. Esta
lesson N+29 quantifica o custo. Próxima ação prática seria patch
do `intelligence.py` com skip_list — preferencialmente feita em
uma nova iteration do loop com scope específico: `intelligence_skip_patterns`.
