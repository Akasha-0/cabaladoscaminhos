# Grimoire DOX

## Purpose

Base de conhecimento esotérico curado do Akasha — fonte de verdade
para os 5 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching). Alimenta:
- `significados-curados.ts` (Pilar 1-5 curadoria)
- `traducao-areas.ts` (9 áreas de vida × 5 Pilares)
- `conexoes-pilares.ts` (matriz 5×5 de conexões)
- `rag-mapa.ts` (RAG do Mentor)
- `synthesis/synthesizer.ts` (Akasha Authority)

## Ownership

Diretórios de curadoria (cada um com seu AGENTS.md):

- `ancestral/`: Odus de Ifá (Pilar 4, **15 canônicos** D-044, NÃO 16)
  → [AGENTS.md](ancestral/AGENTS.md)
- `iching/`: Hexagramas do I Ching (Pilar 5, **16 de 64** documentados)
  → [AGENTS.md](iching/AGENTS.md)
- `botanica/`: Ervas e plantas sagradas (**52 ervas**)
  → [AGENTS.md](botanica/AGENTS.md)
- `mentor/`: System prompts para mentores (F-227 Authority)
  → [AGENTS.md](mentor/AGENTS.md)
- `vibracional/`: Corpo sutil, aura, alma (Pilar 3 — **11 corpos + 5 koshas**)
  → [AGENTS.md](vibracional/AGENTS.md)
- `diagnostico/`: Alertas astrológicos situacionais (4 entries)
  → [AGENTS.md](diagnostico/AGENTS.md)

## Local Contracts

**Para entries MD em qualquer subdir:**

- Formato MD com **frontmatter YAML** (campos):
  - `id`, `slug`, `title`, `title_en`
  - `categoria` (Odu, Hexagrama, Erva, Alerta, Ritual, etc)
  - `biblioteca` (ancestral, iching, botanica, mentor, vibracional, diagnostico)
  - `Elementos_Regentes`, `Orixas_Associados` (quando aplicável)
  - `Numeros_Kabalisticos`, `Corpos_Tantricos_Alvo`
  - `Odus_Associados`, `Acao_Principal`
- `## EN` section: translation-status note + English summary
  (NÃO full translation — pattern matching `botanica/erva-001`)
- **PT-BR primeiro** (i18n config)
- **Pilar 4 (Odu) ethics invariant**: aviso `requer consentimento + terreiro`
  - R-022 §4.4, lesson N+15, F-219 Pilar 4 truth-base
- **Não inventar correspondências esotéricas** (lesson N+15)
- **Nomes canônicos apenas** (15 Odus, 64 hexagramas, 12 signos, 11 corpos)

## Work Guidance

- **Curadoria manual**: cada entry revisada por pares antes de merge
- **Sources obrigatórias**: livros publicados, papers, ou R-XXX research
- **Pilar 4 (Odu)**: 1 fonte canônica MÍNIMO (D-044, Verger 1973, ou
  babalawo confirmado). Múltiplas fontes = qualidade++
- **Pilar 5 (I Ching)**: Wilhelm/Baynes 1950 é canônica
- **Pilar 3 (Tantra)**: KRI 2007 (Yogi Bhajan) é open curriculum
- **Pilar 1 (Cabala)**: Mispar Hechrachi (Goldschmidt 2021) + Sefer Yetzirah
- **Pilar 2 (Astrologia)**: Brennan 2017 é referência contemporânea
- **Updates em pares** (PT-BR + EN via translation-status note)

## Verification

- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts`
  (valida cobertura de cada biblioteca — lesson N+18 fix)
- Cobertura: `botanica` 52/52, `ancestral` 15/15, `iching` 16/64,
  `vibracional` 11/11, `diagnostico` 4/4, `mentor` 1
- Lint custom: nomes canônicos respeitados
- Review de pares: cada entry curada por ≥1 pessoa antes de merge

## Related Files

- `apps/akasha-portal/src/lib/grimoire/significados-curados.ts` — Pilar 1-5
- `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts` — 9 áreas × 5 Pilares
- `apps/akasha-portal/src/lib/grimoire/conexoes-pilares.ts` — matriz 5×5
- `apps/akasha-portal/src/lib/grimoire/rag-mapa.ts` — RAG
- `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts` — Authority
- `.autonomous/research/systems/` — research docs por Pilar

## Child DOX Index

- [ancestral](file:///home/skynet/cabala-dos-caminhos/grimoire/ancestral/AGENTS.md) — Odus de Ifá (Pilar 4, 15 canônicos)
- [iching](file:///home/skynet/cabala-dos-caminhos/grimoire/iching/AGENTS.md) — Hexagramas I Ching (16 de 64)
- [botanica](file:///home/skynet/cabala-dos-caminhos/grimoire/botanica/AGENTS.md) — Ervas sagradas (52)
- [mentor](file:///home/skynet/cabala-dos-caminhos/grimoire/mentor/AGENTS.md) — System prompts (F-227)
- [vibracional](file:///home/skynet/cabala-dos-caminhos/grimoire/vibracional/AGENTS.md) — Corpo sutil (11 corpos)
- [diagnostico](file:///home/skynet/cabala-dos-caminhos/grimoire/diagnostico/AGENTS.md) — Alertas astrológicos
