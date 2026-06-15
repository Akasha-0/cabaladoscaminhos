# I Ching DOX

## Purpose
Hexagramas do I Ching - clássico chino de adivinhação e filosofia.
**Pilar 5 (I Ching)** do Akasha — alimenta Mandala (Layer 1: Ori, centro),
Mandato, e Mentor via RAG. Curadoria manual canônica (King Wen sequence).

## Ownership
- **16 de 64 hexagramas canônicos** documentados: `hex-01-qian.md` a `hex-16-yu.md`
  (Qian, Kun, Zhun, Meng, Xu, Song, Shi, Bi, Xiao Chu, Lü, Tai, Pi, Tong Ren,
  Da You, Qian, Yu — sequência King Wen).
- **48 hexagramas restantes** (17-64) a serem documentados conforme prioridade
  (F-226 narrative-generator + F-228 mobile). King Wen sequence é canônica
  (Wilhelm/Baynes 1950).
- Engine em `packages/core-iching/` (Pilar 5 engine) — tem 64 hexagramas
  canônicos em código; grimoire docs cobrem os 16 prioritários.

## Local Contracts
- Cada hexagrama contém: nome PT-BR, trigrama superior/inferior, 6 linhas,
  interpretação, fonte (Wilhelm/Baynes 1950 ou Kunst 1985)
- Formato MD com frontmatter YAML (id, slug, title, title_en, categoria,
  biblioteca, Elementos_Regentes, Trigramas, Numeros_Kabalisticos,
  Corpos_Tantricos_Alvo, Odus_Associados, Acao_Principal)
- Usar terminologia original em chino (Qian, Kun, etc.) + transliteração PT-BR
- `biblioteca: iching` em todos os entries (consistente)
- Inclui `## EN` section (translation-status note + English summary,
  NÃO full translation — pattern matching `botanica/erva-001`)

## Work Guidance
- **PT-BR primeiro** (i18n config do projeto). Interpretações em PT-BR.
- Manter consistência de formato entre hexagramas documentados
- Seguir estrutura canônica do I Ching (King Wen sequence, Wilhelm/Baynes 1950)
- Updates em pares (PT-BR e EN juntos)
- Pilar 5 (I Ching) é IP-clean — sem hard-stop ethics (diferente de Pilar 4/Odu)
- Test coverage: `grimoire-completeness.test.ts` CATEGORIES inclui `iching`
  (16 of 64 documented; meta é 64 ao longo do tempo)
- Engines: `packages/core-iching/` — usado pelo `calcular()` em
  `packages/akasha-core/`

## Verification
- `pnpm --filter @akasha/core-iching typecheck` (engine funciona)
- `pnpm --filter @akasha/core-iching test` (43+ tests verdes; ver wings.test.ts)
- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts`
  (cobre este dir; lesson N+18 fix aplicou)
- Antes de adicionar nova entry: validar King Wen sequence ordering
- Antes de modificar entry: revisão de pares (peer review de outro agente)

## Related Files
- `packages/core-iching/AGENTS.md` — engine (64 hexagramas canônicos)
- `apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts`
  — consome I Ching via `PilarIChing.hexagrama_dia`
- `grimoire/AGENTS.md` (parent) — DOX chain
- `.autonomous/research/systems/iching-64.md` — research (R-013) que
  fundamentou os 64 hexagramas

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado. Se `grimoire/iching/
hex-{N}/` for criado com sub-páginas, ganhar AGENTS.md próprio.)
