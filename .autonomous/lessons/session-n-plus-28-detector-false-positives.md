# Lesson — Detector false positives: "missing_tradition" e "tech_debt" repetidos

**Date:** 2026-06-16
**Session:** N+28 (loop/w2, akasha-evolution iter 5)
**Commits context:** 4908ac13 (v0.6.0), commits 3db6502d/a50f0118/4528e2be/16b3a9c7

## Contexto

Durante a iteração 5 do akasha-evolution, 5 agents foram spawned em
paralelo. Dois deles encontraram **falsos positivos** documentados
e corretamente sinalizaram o status `already_present` ou `0 fixes`:

1. **Agent `missing_tradition` (ta-1781621060-0)** — task pedia
   "ODUS missing from traducao-areas". O agent leu o arquivo
   `traducao-areas.ts` e descobriu:
   - L116: `const CABALA: TraducaoArea[]`
   - L148: `const ASTROLOGIA: TraducaoArea[]`
   - L175: `const TANTRICA: TraducaoArea[]`
   - **L205: `const ODU: TraducaoArea[]`** ← JÁ EXISTIA com 9 entries
   - L237: `const ICHING: TraducaoArea[]`
   - L295: `export const TRADUCOES_DETALHADO: Partial<Record<Pilar, Record<Area, ...>>>`
     (mapa detalhado que inclui ODU_DETALHADO)
   - Result: `success: false, status: "already_present"` com evidência completa

2. **Agent `tech_debt` (ta-1781621060-2)** — task apontava
   "2 files with TODO" (significados-curados). O agent identificou:
   - TODOS_PILARES é uma **constante de fixture** (lista de pilares)
   - Não é um comentário TODO
   - Já auditado em 13:19, 13:38, e 14:21 (3x antes)
   - Result: `success: true, message: "0 actionable tech_debt markers"`

## Aprendizado

1. **Falsos positivos são EXPECTÁVEIS em detectores baseados em regex/heurística.**
   O detector `missing_tradition` provavelmente busca por um padrão
   "ODU/ODUS" e assume que se não há const exata, está missing.
   Mas o arquivo tem 2 representações: constante simples (ODU) e
   mapa detalhado (TRADUCOES_DETALHADO).

2. **O agent que RECEBE a tarefa tem obrigação de validar a premissa.**
   O agent -0 não adicionou uma entrada ODUS fictícia só para
   "completar" o task — escreveu `success: false` com evidência
   completa das 5 traditions e o status `already_present`. Isso
   é o comportamento correto: parar antes de introduzir código
   desnecessário.

3. **Tech_debt em significados-curados é um padrão repetido de
   falso positivo.** A constante `TODOS_PILARES` (lista de pilares
   Cabala/Astrologia/Tântrica/Odu/I-Ching) tem "TODO" no nome mas
   é um array de strings, não um comentário. Detectores que buscam
   por "TODO" precisam filtrar contexto (estar dentro de `// TODO`
   ou `/* TODO */`).

4. **3 auditorias repetidas em 1 dia (13:19, 13:38, 14:21, 11:46)
   é um sinal de loop inefficiency.** O detector `tech_debt` para
   esses 2 arquivos deveria:
   - Adicionar o arquivo a uma skip-list após 2 confirmações de "0 fixes"
   - Ou usar regex mais específica (`^\s*//\s*TODO\b`)

## Implicação para o loop

- A política de "release sempre" continua válida — falsos positivos
  não causam dano, apenas desperdiçam ~3 min de agent time.
- A taxa de sucesso real da iter 5: 3/5 (60%) commits efetivos
  (missing_tests, console_cleanup × 3 commits). 2/5 falsos
  positivos identificados corretamente.

## Sugestão de melhoria (proposal)

- Adicionar `skip_list.json` no `intelligence.py` para evitar
  re-rodar detectores que já confirmaram "0 fixes" 2+ vezes
- Detector `missing_tradition` deveria buscar por `TRADUCOES_DETALHADO[pilar]`
  E `const <TRADICAO>` antes de flagar
- Detector `tech_debt` deveria usar `^\s*//\s*TODO\b` (com `//` antes)
