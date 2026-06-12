# Lesson — F-221 Significados Curados (Camada de Significado)

**Date:** 2026-06-12
**Session:** N+16
**Commits:** `f2d222ee` (lib + component) + `3b9d19d9` (Tela 04 + F-222)
**Category:** FASE 6 implementation

## Contexto

Working tree tinha F-221 in-flight do supervisor (sessão anterior) sem commit:
- `apps/akasha-portal/src/lib/grimoire/significados-curados.ts` (1203 linhas, novo)
- `apps/akasha-portal/src/components/akasha/SignificadoPilar.tsx` (268 linhas, novo)
- `apps/akasha-portal/src/app/[locale]/(akasha)/diario/page.tsx` (modificado: 03 → 04 telas)
- `apps/akasha-portal/src/app/api/akasha/mandato-do-dia/route.ts` (modificado: expõe `pilares`)

## Aprendizado

### 1. Sem curadoria, o dado é vazio
Akasha-core computa "Life Path 11", "Sol em Escorpião", "Hexagrama 51". Sem
camada de Significado, usuário recebe números/códigos sem compreender o que
SIGNIFICAM. F-221 cria a **Camada de Significado** (159 entradas curadas) que
transforma dados em compreensão — VISION §3 axioma 3.

### 2. Pilar 4 (Odu Ifá) precisa flag `requer_terreiro:true`
Respeita R-022 §4.4 (ética Ifá): informação geral ok, interpretação profunda
vem de babalaô/yaô com consentimento. Cada entrada Odu carrega a flag.

### 3. Bug pré-existente: missing close brace
`coberturaSignificados()` (linha 1195) terminava o return object com `};` mas
faltava `}` para fechar a função. Typecheck falhou: `error TS1005: ',' expected`
na linha do comentário subsequente. **Lição**: a posição do erro aponta ao
sintoma, não à causa — diff mental para o bloco anterior até achar
statement não-fechado.

### 4. `significadosEspecificos(pilares: PilaresDados)` resolve
Recebe o **shape mínimo** dos 5 Pilares (definido localmente na lib, sem
acoplar a @akasha/core) e devolve 1 SignificadoCurado por Pilar. Ex:
`life_path=11` → "Iluminador · Mestre"; `sol_signo="Escorpião"` → "Sol em
Escorpião". Fallback para `significadoGenericoDoPilar` se símbolo ausente.

### 5. Non-breaking API extension
`/api/akasha/mandato-do-dia` ganhou campo `pilares` ADICIONAL ao lado de
`mandato` e `mentor_hook`. Clientes que só leem `mandato` continuam funcionando
— aditivo, não mutante. Pattern: **novos campos em payload são sempre seguros**
se opcionais; substituições sim são breaking.

### 6. Pilar ordem canônica
`['cabala', 'astrologia', 'tantrica', 'odu', 'iching']` é a ordem dos 5
Pilares (interior → exterior) — fixada em synthesis_v1.md §5 e agora também
em `PILARES_VALIDOS` (const) + `ordem` (array local na Tela 04). Derivada,
não hardcoded em 2 lugares.

## Smoke test (rodou)

```
cobertura: { cabala: 43, astrologia: 19, tantrica: 18, odu: 15, iching: 64 }
cabala generico titulo: Caminho de Vida
LP11 titulo: Iluminador · Mestre
Escorpião: Sol em Escorpião
```

## Triad
- `pnpm typecheck` 0 errors
- `pnpm test:run` 1374 (235 pre-existing pollution unchanged, 0 regressão)
- `pnpm lint` skipped (eslint @eslint/js missing — pre-existing per N+10)

## Como aplicar

- Próxima sessão: usar `significadosEspecificos(pilares)` em outros pontos
  (MandalaChart tooltip, Mural de Mandatos anteriores) — atualmente só Diario
- F-206 tooltip por Pilar agora tem backing real
- D-040 (Prisma) ainda bloqueado em aprovação humana — não tocar
- Padrão "non-breaking API extension" aplicar a futuras rotas
