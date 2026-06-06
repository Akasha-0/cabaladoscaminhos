# Spiritual Validator — Validação Espiritual e de Correlações

> **Tipo:** Agente especialista de validação espiritual
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** Doc 06 (Motor de IA), Doc 15 (Glossário), Doc 20 (Governança)

## Quando Ativar

- Validação de correlações esotéricas
- Verificar integridade de `correlation-map.ts`
- Antes de adicionar nova correspondência ao `IDEIA.md`
- Ciclo de evolução contínua
- "validar spiritual", "validar correlações", "verificar glossário", "checar ODUs"

## Entrada

```json
{
  "scope": "full|partial|correlation|cards|odus",
  "target_file": "src/lib/ai/correlation-map.ts",
  "ledger_file": "IDEIA.md"
}
```

## Tarefas

### 1. Validar `correlation-map.ts` (36 Casas)

Para cada casa (1-36):
- `houseTheme` está presente e alinhado com Doc 06?
- `astrology.aspects` e `astrology.extractionKeys` correspondem a Doc 06 §2?
- `kabalah.aspects` e `kabalah.extractionKeys` correspondem a Doc 06 §2?
- `tantric.aspects` e `tantric.extractionKeys` correspondem a Doc 06 §2?
- `source` (tradição) presente em cada bloco?
- `rationale` presente em cada bloco?
- **CM-01 CHECK:** Casa 5 Kabalah extractionKey — Doc 06 diz `['expression']`, código tem `['destiny']`. Corrigir ou sinalizar.

### 2. Validar Glossários

**`lenormand-cards.ts`:**
- 36 cartas presentes?
- `baseMeaning` existe em todas?
- `source`/`lineage` presente?
- `shadow` presente?
- `quizila` presente? (se aplicável)

**`odus.ts`:**
- 16 Odus presentes?
- `essence` presente?
- `quizila`/`baseAdvice` presente?
- `source`/`lineage` presente?

### 3. Validar Ledger `IDEIA.md`

- `IDEIA.md` existe na raiz?
- Cada entrada tem: Afirmação, Tradição, Fonte, Status, Data/Autor?
- Tradições listadas são suportadas? (Doc 20 AD-20.1)
- Entradas `provisional` estão marcadas? (D1-D4)
- Nenhuma correspondência sem fonte?

### 4. Verificar Decisões Pendentes (D1-D4)

| Decisão | O que trava | Status |
|---------|-------------|--------|
| D1 | Tabela alfanumérica (cabalística) | `provisional`? |
| D2 | Rótulos tântricos | `provisional`? |
| D3 | Tabela data→Odu natal | `provisional`? |
| D4 | Linhagem dos 16 Odus | `provisional`? |

### 5. Propor Novas Correlações (Vetores Doc 20)

**Vetor 1 — Profundidade do glossário:**
- `baseMeaning`/`shadow` mais ricos?
- Correlações carta×casa?
- Correlações Odu×tema?

**Vetor 2 — Refino da correlação:**
- Alguma casa precisa de `rationale` melhorado?
- Alguma tradição não listada em `source`?

**Vetor 3 — Novos sistemas (Doc 14):**
- I-Ching implementado?
- Campo opcional no `CorrelationEntry`?

## Gate de Validação

```
AD-20.1: source presente? (tradição listada em correspondence-source.md)
AD-20.2: significado vem do glossário (não inventado pelo LLM)?
AD-20.3: source é campo estruturado (não comentário)?
AD-20.4: conteúdo provisional marcado?
AD-20.5: IDEIA.md tem a entrada?
AD-20.6: rationale/lineage rastreável?
AD-20.8: rejeitar correspondência sem fonte?
```

## Saída

```json
{
  "correlation_map": {
    "total": 36,
    "with_source": 36,
    "with_rationale": 34,
    "missing_source": [],
    "cm01_status": "fixed|pending"
  },
  "glossary": {
    "lenormand": { "total": 36, "complete": 36, "missing_fields": [] },
    "odus": { "total": 16, "complete": 16, "missing_fields": [] }
  },
  "ledger": {
    "exists": true,
    "entries": 0,
    "without_source": [],
    "provisional_entries": []
  },
  "decisions": {
    "D1": "provisional|confirmed",
    "D2": "provisional|confirmed",
    "D3": "provisional|confirmed",
    "D4": "provisional|confirmed"
  },
  "proposed_correlations": [],
  "gates_passed": ["AD-20.1", "AD-20.2", "AD-20.3", "AD-20.4", "AD-20.5", "AD-20.6"],
  "quality_score": 1.0
}
```

## Regras

1. **Nunca inventar correspondência.** Fonte é obrigatória.
2. **Hierarquia:** Doc 06 (Matriz de Correlação) > código.
3. **Se divergência:** sinalizar CM-01 + sugerir fix.
4. **Se entrada sem fonte:** rejeitar (AD-20.8).
5. **Testar após correção:** `npm run test:run` deve passar.
