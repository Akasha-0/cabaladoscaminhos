# Mentor DOX

## Purpose

System prompts e contextos para os agentes de mentoria espiritual do
Akasha. **Ponte entre os 5 Pilares** (Cabala, Astrologia, Tantra, Odu,
I Ching) e a voz conversacional do Mentor — agente que fala com o
usuário em PT-BR 2ª pessoa, com tom de caboclo/bruxo contemporâneo.

## Ownership

- `system-prompt.md`: Prompt base unificado do Mentor (todos os agentes)
  - 1 frontmatter YAML com metadata (model, temperature, max_tokens)
  - 1 seção `## PT-BR` (idioma primário, 2ª pessoa)
  - 1 seção `## EN` (translation-status note + English summary)
  - 1 seção `## Sources` (todos os curadores: Brennan, KRI, Verger, Wilhelm, Goldschmidt)
  - Pilar 4 (Odu) ethics invariant: aviso `requer consentimento + terreiro`

- Outros arquivos (TBD): agent-specific personas (Tântrica, Cabalística, Astrológica, I Ching)
  - Atualmente tudo roda 1 prompt unificado
  - F-228 mobile pode demandar personas separadas

## Local Contracts

- System prompt define comportamento e personalidade do mentor
- Formato MD estruturado com frontmatter + seções
- PT-BR é o idioma primário (i18n config do projeto)
- EN é secundário, summary only (não full translation)
- **Pilar 4 ethics invariant**: qualquer menção a Odu precisa de aviso
  `requer consentimento + terreiro` (Doc 25 §4.4)
- **RAG source whitelist**: significados-curados.ts + traduções curadas
  (NÃO inventar correspondências esotéricas, ver lesson N+15/N+16)
- **Crisis detection**: regex para suicidal ideation → CVV-188 (Centro
  de Valorização da Vida, Brasil); ver `packages/akasha-core/`
  `detectarCrise()`
- **Tipos compartilhados**: `UserMaps` em `packages/mentor/src/types.ts`

## Work Guidance

- Atualizar quando houver mudanças de arquitetura de IA
- Manter consistência com tipos definidos em `packages/mentor`
- Manter cobertura de teste em `tests/lib/integration/mentor/`
- RAG via `apps/akasha-portal/src/lib/grimoire/rag-mapa.ts`
  (`ragForPilares` + `ragForUserMaps`)
- **Não inventar nomes de Odu** fora do whitelist (15 canônicos, D-044)
- **Não inventar correspondências** entre Odu-Orixá-Signo-Número-Sefirot
- Crisis detection: regex `/suicid|morrer|matar|automutil|desesper[oa]/i`
  → CVV-188 (R-022 §5.5-5.6)

## Verification

- Testes de integração em `tests/integration/mentor/`
- `pnpm --filter @akasha/mentor typecheck`
- `pnpm --filter @akasha/mentor test`
- Cobertura de teste: `rag-mapa.test.ts`, `insight-e-conexoes.test.ts`,
  `significados-curados.test.ts`, `traducao-areas.test.ts`

## Related Files

- `packages/mentor/AGENTS.md` — engine + tipos compartilhados
- `apps/akasha-portal/src/lib/grimoire/rag-mapa.ts` — RAG layer
- `apps/akasha-portal/src/lib/grimoire/significados-curados.ts` — truth-base
- `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts` — deriveAkashaAuthority
- `grimoire/AGENTS.md` (parent) — DOX chain
- `.autonomous/research/designs/r-022-ethics-charter.md` — ethics doc

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `grimoire/mentor/
agent-{N}/` for criado com personas específicas, ganhar AGENTS.md próprio.)
