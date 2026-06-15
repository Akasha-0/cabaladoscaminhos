# Vibracional DOX

## Purpose
Corpo sutil e energia - anatomia energética espiritual.
**Pilar 3 (Tantra)** do Akasha — alimenta Mandala (Layer 2), Mandato,
e Mentor via RAG. Baseado em Yogi Bhajan (KRI 2007) — 11 corpos
(1 Alma + 10 corpos: Físico, Astral, Mental Negativa, Mental Positiva,
Linha do Arco, Prana, Aura, Radiante, Mente Divina) + 5 koshas védicas
(pancha kosha, Taittiriya Upanishad) como camada complementar.

## Ownership
- **11 corpos canônicos** documentados: `corpo-01-alma.md` a `corpo-11-mente-divina.md`
  (Alma, Físico, Astral, Mental Negativa, Mental Posativa, Linha do Arco,
  Prana, Aura, Radiante, Mente Divina — KRI 2007 Aquarian Teacher)
- **5 koshas védicas** como conceito paralelo (pancha kosha — Taittiriya Upanishad)
  - Annamaya (físico), Pranamaya (energia), Manomaya (mente), Vijnanamaya (sabedoria), Anandamaya (bênção)
  - Usado no InfoPanel Tantra do MandalaChart (Fase 4, F-230)
- Engine em `packages/core-tantra/` (Pilar 3 engine) — `corpo_predominante`,
  `trigemeo`, `temperamento_atual` (R-019 4 Temperamentos Gregos, F-220)

## Local Contracts
- Cada camada contém: descrição, características, práticas associadas
- Formato MD com frontmatter YAML (id, slug, title, title_en, categoria,
  biblioteca, Elementos_Regentes, Trigramas, Numeros_Kabalisticos,
  Corpos_Tantricos_Alvo, Odus_Associados, Acao_Principal)
- Progressão do físico ao divino (Yogi Bhajan)
- `biblioteca: vibracional` em todos os entries (consistente)
- Inclui `## EN` section (translation-status note + English summary)
- Pilar 3 (Tantra) é IP-clean (Yogi Bhajan KRI 2007 é open curriculum)

## Work Guidance
- **PT-BR primeiro** (i18n config do projeto). Nomes em PT-BR (Alma, Mente Divina).
- Manter consistência de formato entre camadas
- Usar terminologia do sistema tântrico/kundalini
- Updates em pares (PT-BR e EN juntos)
- 11 corpos são canon KRI — NÃO inventar corpo 12 ou renomear
- Engines: `packages/core-tantra/` — usado pelo `calcular()` em
  `packages/akasha-core/`
- Sexualidade Deep (F-225): usa 11 corpos × `deriveSexualArchetype` em
  `synthesis-engine.ts`

## Verification
- `pnpm --filter @akasha/core-tantra typecheck` (engine funciona)
- `pnpm --filter @akasha/core-tantra test`
- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts`
  (cobre este dir; lesson N+18 fix aplicou)
- Antes de modificar entry: revisão de pares (peer review de outro agente)

## Related Files
- `packages/core-tantra/AGENTS.md` — engine
- `apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts`
  — consome Tantra via `PilarTantrica.corpo_predominante` + `temperamento_atual`
- `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` (InfoPanel Tantra)
- `grimoire/AGENTS.md` (parent) — DOX chain
- `.autonomous/research/systems/tantra.md` — research (R-013) que fundamentou

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado. Se `grimoire/vibracional/
corpo-{N}/` for criado com sub-páginas, ganhar AGENTS.md próprio.)
