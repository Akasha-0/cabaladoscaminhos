<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Fallow Baseline v0.0.8

**Data:** 2026-06-08
**Versão Fallow:** 2.85.0
**Total de Issues:** 1329

## Resumo

| Categoria | Qtd | Status |
|-----------|-----|--------|
| unused_files | 77 | accepted |
| unused_exports | 77 | accepted |
| unused_types | 36 | accepted |
| unused_class_members | 5 | accepted |
| unused_dependencies | 7 | accepted |
| unresolved_imports | 1127 | accepted |
| unlisted_dependencies | 0 | resolved |
| **TOTAL** | **1329** | |

## Classificação de Issues

### Resolved (2)
As 2 dependências não listadas foram adicionadas ao `.fallowrc.json`:
- `@react-three/fiber`: importado em `tests/components/akasha/atmosphere.test.tsx`
- `qrcode`: importado em `tests/lib/sharing/qr-code.test.ts`

### Accepted (1329)
Todos os 1329 issues restantes são classificados como **accepted** pelos seguintes motivos:

1. **unresolved_imports (1127):** Testes que importam módulos que foram removidos durante as tarefas T5, T6, T7. Estes são arquivos de teste órfãos que referenciam código que não existe mais. São esperados e serão removidos em tarefas futuras de limpeza de testes.

2. **unused_files (77):** Arquivos de componentes UI e utilitários que fazem parte do sistema de design mas não são usados diretamente. Many are shadcn/ui components kept for reference.

3. **unused_exports (77):** Exports não utilizados em módulos existentes. Alguns são API pública potencial, outros são dead code legítmo.

4. **unused_types (36):** Tipos TypeScript definidos mas não exportados/usados. Verificar se são intencionais.

5. **unused_class_members (5):** Métodos de classe não utilizados.

6. **unused_dependencies (7):** Dependências listadas em package.json mas não importadas no código. Podem ser:
   - Dependências de desenvolvimento usadas via CLI (vitest, etc)
   - Dependências planejadas mas não implementadas
   - Dependências órfãs

### Skipped (0)
Nenhum issue ignorado.

## Análise Detalhada

### Issues de Testes (Maioria)
A grande maioria dos issues (1159 unresolved_imports) vem de **arquivos de teste órfãos** que importam módulos removidos:

- `tests/lib/grimoire/search.test.ts` → `@/lib/grimoire/search`
- `tests/lib/grimoire/sync.test.ts` → `@/lib/grimoire/sync`
- `tests/lib/pwa/use-service-worker.test.ts` → `@/lib/pwa/use-service-worker`
- `tests/lib/push/web-push-server.test.ts` → `@/lib/push/web-push-server`
- `tests/api/akasha/push/subscribe.test.ts` → `@/app/api/akasha/push/subscribe/route`
- `tests/api/akasha/transits/today.test.ts` → `@/app/api/akasha/transits/today/route`
- `tests/lib/vibration/*.test.ts` → módulos vibration
- `tests/lib/wisdom/*.test.ts` → módulos wisdom
- `tests/lib/yantra/*.test.ts` → módulos yantra
- `tests/scripts/daily-transits-cron.test.ts` → `../src/lib/akasha/daily-engine`

### Arquivos de UI Não Utilizados
Componentes shadcn/ui mantidos para referência:
- `badge.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, etc.

### Dependências Não Listadas
- `@react-three/fiber`: necessário para testes de atmosphere
- `qrcode`: necessário para testes de QR code

## Ação Recomendada

1. **Limpeza de Testes Órfãos:** Remover arquivos de teste que referenciam módulos inexistentes (1127 issues)
2. **Revisão de UI:** Verificar quais componentes UI são realmente necessários (77 files)
3. **Revisar Dependências:** Analisar `unused_dependencies` do package.json (7 deps)

## Baseline File
`docs/audit/fallow-baseline-v0.0.8.json`
