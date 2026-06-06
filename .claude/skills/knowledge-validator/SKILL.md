# Knowledge Validator — Validação de Base de Conhecimento

> **Tipo:** Agente especialista em validação de conhecimento esotérico fundamentado
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** Doc 11 (Cálculo Determinístico), Doc 15 (Glossário), Doc 20 (Governança)

## Quando Ativar

- Validação de base de conhecimento
- Verificar integridade do glossário
- Antes de adicionar novos dados ao `knowledge-base.ts`
- "validar conhecimento", "checar glossário", "verificar base", "validar dados"

## Entrada

```json
{
  "scope": "full|glossary|calculators|knowledge-base",
  "target_files": ["src/lib/swarm/knowledge-base.ts", "src/lib/constants/lenormand-cards.ts", "src/lib/constants/odus.ts"]
}
```

## Tarefas

### 1. Validar Glossário das 36 Cartas (Doc 15)

**`lenormand-cards.ts`:**

Para cada carta (1-36):
- `baseMeaning` presente e descritivo?
- `shadow` presente (lado oculto)?
- `quizila` presente (se aplicável)?
- `baseAdvice` presente?
- `source`/`lineage` rastreável?
- `provisional` marcado se pendente validação?

**Tabela de verificação (Doc 15):**
```
1.  O Cavaleiro    → "notícias chegando" | source: Lenormand tradicional
2.  O Trevo        → "pequena sorte"    | source: Lenormand tradicional
... (até 36)
```

### 2. Validar Glossário dos 16 Odus (Doc 11, Doc 15)

**`odus.ts`:**

Para cada Odu:
- `name` (Ogbe, Oyeku, Iwori...)?
- `essence` presente?
- `quizila` presente (proibições)?
- `baseAdvice` presente?
- `orixaRegente` presente?
- `dayOfWeek` presente?
- `source`/`lineage` rastreável?
- `provisional` marcado se D4 pendente?

**16 Odus do Merindilogun:**
```
Ogbe | Oyeku | Iwori | Odi | Irosun | Owonrin | Obara | Okanran
Oturupon | Ogunda | Osa | Ika | Otura | Ofun | Oya | Eji-Ogbe
```

### 3. Validar Calculadoras (Doc 11)

**`reduceToSingleDigit()`:**
- Números mestres (11, 22, 33) preservados?
- 11 → 11 (não → 2)?
- 22 → 22 (não → 4)?
- 33 → 33 (não → 6)?

**Kabalistic Calculator:**
- Tabela Pitagórica correta?
- Normalização de nome (acentos, Ç, Y, hífen)?
- Life Path, Expression, Motivation, Impression?
- Challenges, Pinnacles, Karmic Lessons, Debts?
- Personal Cycles?

**Tantric Calculator:**
- Alma (dia) → 1-9 ou mestre?
- Karma (mês) → 1-9 ou mestre?
- Dom Divino (2 dígitos do ano)?
- Destino (soma de 4 dígitos)?
- Caminho Tântrico (soma completa)?

**Odu Birth Calculator:**
- Algoritmo data→Odu (Doc 11 §4.1)?
- day + month → 1-16?
- Provisional marcado?

### 4. Validar Knowledge Base (`knowledge-base.ts`)

- Domínios cobertos: Orixá, Odu, Tantra, Chakra, Numerologia, Astrologia, Wicca, Flora, Xing Ling, Sexualidade?
- Cada entrada com `source`/`lineage`?
- Dados духовны (spirits) fundamentados em tradição real?
- Nenhuma alucinação ("isso é uma "crença popular" sem fonte)?

### 5. Verificar Decisões Pendentes (D1-D4)

| ID | O que | Status | Ação |
|----|-------|--------|------|
| D1 | Tabela alfanumérica | `provisional`? | Confirma Pitagórico |
| D2 | Rótulos tântricos | `provisional`? | Confirma fórmula |
| D3 | Data→Odu natal | `provisional`? | Confirma algoritmo |
| D4 | Linhagem dos 16 Odus | `provisional`? | Valida com operador |

### 6. Propor Enriquecimento (Vetores Doc 20)

**Vetor 1 — Profundidade:**
- Mais combinações carta×casa?
- Mais interpretações Odu×tema?
- Correlações cruzadas mais ricas?

**Vetor 2 — Refino:**
- `rationale` mais detalhado para cada delegação?
- Fontes mais específicas?

**Vetor 3 — Extensão:**
- I-Ching como novo sistema?
- Runa como novo sistema?

## Gate de Validação

```
AD-20.1: source presente em cada entrada?
AD-20.2: significado do glossário (não inventado)?
AD-20.4: provisional marcado para D1-D4?
AD-20.5: IDEIA.md tem correspondência?
Números mestres: preservados no reduceToSingleDigit?
16 Odus: todos com essence/quizila/baseAdvice?
```

## Saída

```json
{
  "lenormand_cards": {
    "total": 36,
    "with_base_meaning": 36,
    "with_shadow": 36,
    "with_quizila": 36,
    "with_source": 36,
    "provisional": [],
    "missing_fields": []
  },
  "odus": {
    "total": 16,
    "with_essence": 16,
    "with_quizila": 16,
    "with_base_advice": 16,
    "with_source": 16,
    "provisional": ["D4 entries..."],
    "missing_fields": []
  },
  "calculators": {
    "reduce_to_single_digit": { "master_numbers_preserved": true },
    "kabalistic": { "fields_complete": 15, "method": "pythagorean" },
    "tantric": { "fields_complete": 5, "method": "tantric" },
    "odu_birth": { "algorithm": "default", "provisional": true }
  },
  "knowledge_base": {
    "domains": ["orixa", "odu", "tantra", "chakra", "numerology", "astrology", "wicca", "flora", "xing", "sexuality"],
    "total_entries": 0,
    "without_source": []
  },
  "decisions": {
    "D1": "provisional|confirmed",
    "D2": "provisional|confirmed",
    "D3": "provisional|confirmed",
    "D4": "provisional|confirmed"
  },
  "gates_passed": ["AD-20.1", "AD-20.2", "AD-20.4", "master_numbers", "all_odus_fields"],
  "quality_score": 0.93
}
```

## Regras

1. **Nunca inventar significado.** Fonte é obrigatória (AD-20.1).
2. **Números mestres preservados.** 11=11, 22=22, 33=33.
3. **Tudo provisional até confirmado.** D1-D4.
4. **Glossário = fonte única.** `lenormand-cards.ts` / `odus.ts`.
5. **Proveniência machine-readable.** Campo, não comentário.
