<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Análise Fallow - akasha-v0.0.8

**Data:** 2026-06-08  
**Total de Issues:** 3.168

---

## Breakdown por Categoria

| Categoria | Qtd | % | Severidade |
|-----------|-----|---|------------|
| Unresolved Imports | 2.647 | 83.6% | Alta |
| Unused Files | 228 | 7.2% | Alta |
| Unused Exports | 226 | 7.1% | Média |
| Unused Dependencies | 8 | 0.3% | Alta |
| Duplicate Exports | 6 | 0.2% | Média |
| Stale Suppressions | 12 | 0.4% | Baixa |
| Unlisted Dependencies | 1 | 0.03% | Alta |
| Test-only Dep in Prod | 1 | 0.03% | Baixa |
| **TOTAL** | **3.168** | **100%** | - |

---

## Detalhamento por Categoria

### 1. Unresolved Imports (2.647) - CRÍTICO

**Origem principal:** Diretório `tests/` (618 arquivos)

Padrões identificados:
- `tests/lib/correlation/*.test.ts` - Módulos de correlação não resolvidos
- Imports com path alias `@/lib/correlation/*` falhando em todos os arquivos de teste

**Arquivos mais afetados:**
- `tests/lib/gamification.test.ts` (24 unresolved)
- `tests/lib/correlation/zodiac-planet.test.ts` (21)
- `tests/lib/correlation/frequency-odu.test.ts` (20)
- `tests/lib/correlation/zodiac-day.test.ts` (20)

**Ação:** Investigar configuração de path aliases (tsconfig.json) ou atualizar imports nos testes.

---

### 2. Unused Files (228) - ALTO

| Local | Qtd | % do total |
|-------|-----|------------|
| apps/akasha-portal/ | 222 | 97.4% |
| packages/ | 4 | 1.8% |
| scripts/ | 2 | 0.9% |

**Nota:** 97% dos arquivos não utilizados estão em `apps/akasha-portal/`.

---

### 3. Unused Exports (226) - MÉDIO

**Arquivos com múltiplas exports não utilizadas:**

| Arquivo | Qtd |
|---------|-----|
| packages/core-iching/src/natal.ts | 5 |
| apps/akasha-portal/src/lib/application/auth/akasha-jwt.ts | 3 |
| apps/akasha-portal/src/lib/domain/tarot/cards.ts | 3 |
| apps/akasha-portal/src/lib/application/ai/llm-router.ts | 2 |
| apps/akasha-portal/src/lib/domain/odu-data.ts | 2 |
| apps/akasha-portal/src/lib/shared/logging.ts | 2 |
| packages/core-cabala/src/ciclos.ts | 2 |

**+195 mais** em arquivos já reportados como unused.

---

### 4. Unused Type Exports (34) - MÉDIO

| Arquivo | Qtd |
|---------|-----|
| apps/akasha-portal/src/components/design-system/Typography.tsx | 3 |
| apps/akasha-portal/src/lib/shared/logging.ts | 1 |
| apps/akasha-portal/src/stores/cockpit-store.ts | 1 |

**+29 mais** em arquivos já reportados como unused.

---

### 5. Unused Class Members (5) - MÉDIO

**Arquivo:** `apps/akasha-portal/src/lib/application/ai/deep-correlation-engine.ts`

```
- DeepCorrelationEngine.correlateChakraElement
- DeepCorrelationEngine.correlatePlanetOrixa
- DeepCorrelationEngine.getAllSystemCorrelations
- DeepCorrelationEngine.detectPatterns
- DeepCorrelationEngine.generatePracticalAdvice
```

---

### 6. Unused Dependencies (8) - ALTO

```
@akasha/types
@react-three/drei
qrcode
@vercel/og
jspdf
otpauth
react-markdown
remark-gfm
```

**Nota:** `qrcode` está marcado como test-only dependency (já em devDependencies).

---

### 7. Duplicate Exports (6) - MÉDIO

| Arquivo A | Arquivo B | Export |
|-----------|-----------|--------|
| packages/core-cabala/src/calculos.ts | numerology-kabalah.ts | calculateExpression, calculateLifePath |
| apps/akasha-portal/src/components/akasha/MandalaAtmosphere.tsx | stores/cockpit-store.ts | AtmosphereIntensity |
| packages/core-odus/src/calculos.ts | odus-ifa-data.ts | OduInfo |
| packages/core-odus/src/matching.ts | suggestions.ts | RitualSuggestion |
| packages/core-cabala/src/number-meanings.ts | sefirot-meanings.ts | getMeanings |

---

### 8. Stale Suppressions (12) - BAIXO

Comentários de supressão que não correspondem a nenhum issue:
- `apps/akasha-portal/src/app/api/progresso/route.ts:91`
- `apps/akasha-portal/src/components/shared/ErrorState.tsx:7`
- `apps/akasha-portal/src/lib/application/ai/theme-router.ts:28,199`
- `apps/akasha-portal/src/lib/application/payments/service.ts:5`
- `apps/akasha-portal/src/lib/application/swarm/swarm-orchestrator.ts:340`
- `apps/akasha-portal/src/lib/domain/tarot/spread-calculator.ts:22`
- `apps/akasha-portal/src/lib/interface/api/auth-utils.ts:21`
- `apps/akasha-portal/src/lib/interface/api/base-route.ts:191`
- `apps/akasha-portal/src/lib/interface/api/error-handler.ts:12`
- +2 mais

---

### 9. Unlisted Dependency (1) - ALTO

```
@react-three/fiber
```

---

## Padrões Identificados

### Padrão 1: Catálogo de Testes Quebrado
- **2.647 issues (83.6%)** provenientes de imports não resolvidos em `tests/`
- Causa raiz: módulos de correlação não existem ou path aliases mal configurados
- **Impacto:** Inviabiliza execução de testes

### Padrão 2: Portal Akasha Dead Code
- 222 arquivos não utilizados em `apps/akasha-portal/`
- Código de funcionalidades removidas ou migradas sem limpeza
- **Impacto:** Aumento de bundle, confusão de codebase

### Padrão 3: Duplicação em Módulos Core
- 6 pares de exports duplicadas entre arquivos de mesmo domínio
- Indica reexportação desnecessária ou refatoração incompleta
- **Impacto:** Ambiguidade em imports, bundle inflation

### Padrão 4: Cleanup Post-Migração
- 12 supressões obsoletas
- 8 dependências não utilizadas
- **Impacto:** Manutenção dificultada, debt técnica

---

## Prioridades para Limpeza

### T5 - URGENTE: Corrigir Unresolved Imports (Tabela de Testes)

**Objetivo:** Permitir execução dos testes

**Ações:**
1. Verificar se módulos em `tests/lib/correlation/` existem
2. Corrigir path aliases em `tsconfig.json`
3. OU criar módulos stub se não existirem
4. OU remover testes órfãos

**Estimativa:** ~20 arquivos afetados diretamente, resolve 2.647 issues

---

### T6 - ALTA: Limpeza de Unused Files (Portal)

**Objetivo:** Reduzir codebase do portal

**Ações:**
1. Analisar os 222 arquivos não utilizados
2. Categorizar: removíveis vs. precisam de entry-point
3. Remover código definitivamente morto
4. Adicionar entry-points para código ainda necessário

**Estimativa:** ~50-100 arquivos removíveis diretamente

---

### T7 - MÉDIA: Dependências e Exports

**Objetivo:** Limpeza de dependências

**Ações:**
1. Remover 8 dependências não utilizadas
2. Remover 6 duplicate exports (consolidar em um local)
3. Limpar 12 stale suppressions
4. Corrigir 5 class members não utilizados

**Estimativa:** ~30 issues diretos

---

## Resumo Executivo

| Prioridade | Task | Issues | Esforço |
|------------|------|--------|---------|
| URGENTE | T5 - Corrigir testes | 2.647 | Alto |
| ALTA | T6 - Dead files portal | 222 | Médio |
| MÉDIA | T7 - Deps/Exports | ~50 | Baixo |

**Resultado esperado após T5+T6+T7:** ~300-500 issues restantes (majoritariamente stale suppressions e type exports menores)
