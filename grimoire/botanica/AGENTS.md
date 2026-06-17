# Botânica DOX

## Purpose
Ervas e plantas sagradas - conhecimento fitoterápico espiritual.
Cross-referenced com Pilar 4 (Odu) e Pilar 3 (Tantra) — curadoria
manual canônica. Alimenta RAG do Mentor e Ritual de ervas no DailyContent.

## Ownership
- **52 ervas documentadas** (PT-BR): `erva-001-manjericao.md` a
  `erva-052-unha-de-gato.md` (numeração sequencial, gaps esperados)
- 4 categorias principais:
  - **Ervas medicinais**: manjericão, boldo, erva-cidreira, hortelã
  - **Ervas rituais**: arruda, guiné, alecrim, patchouli
  - **Ervas sagradas**: salvia, lavanda, mirra, olíbano
  - **Ervas afro-brasileiras**: dandá, peregum, abre-caminho
- Mapeamento Odu-Ervas:
  - Ogbe (clareza) → arruda, alecrim
  - Oyeku (mistério) → mirra, olíbano
  - Irosun (transformação) → guiné, abre-caminho

## Local Contracts
- Cada erva contém: nome PT-BR, nome científico, propriedades medicinais,
  uso ritual, correspondências astrológicas + Odu, fonte canônica
- Formato MD com frontmatter YAML (id, slug, title, title_en, categoria,
  biblioteca, Elementos_Regentes, Orixas_Associados, Numeros_Kabalisticos,
  Corpos_Tantricos_Alvo, Odus_Associados, Acao_Principal)
- Numeração sequencial (001-052) com gaps esperados para entries futuras
- `biblioteca: botanica` em todos os entries (consistente)
- Inclui `## EN` section (translation-status note + English summary)
- Pilar 4 (Odu) ethics: ervas Odu-relacionadas precisam de `requer_terreiro: true`

## Work Guidance
- **PT-BR primeiro** (i18n config do projeto). Nome comum + científico.
- Manter consistência de formato entre ervas
- Usar terminologia botânica padrão (Houaiss, Lorenzi)
- Updates em pares (PT-BR e EN juntos)
- NÃO inventar correspondências Odu-Erva sem source (AGENTS.md §5)
- Adicionar nova erva: criar com numeração +1, atualizar contagem aqui
- Cross-reference com `cross-engine.ts` (DailyRitual.herbs)

## Verification
- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts`
  (cobre este dir; lesson N+18 fix aplicou)
- Antes de adicionar nova erva: validar source canônica (mínimo 1 referência)
- Antes de modificar entry: revisão de pares (peer review de outro agente)

## Related Files
- `apps/akasha-portal/src/lib/application/akasha/cross-engine.ts`
  — `ELEMENT_HERBS` (4 elements × 3-4 herbs cada)
- `grimoire/AGENTS.md` (parent) — DOX chain
- `.autonomous/research/systems/botanica.md` — research (R-013) que fundamentou

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado. Se `grimoire/botanica/
erva-{N}/` for criado com sub-páginas, ganhar AGENTS.md próprio.)
