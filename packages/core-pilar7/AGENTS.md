# @akasha/core-pilar7 DOX

## Purpose

**Pilar 7 — Espectro de Transformacao** (Wave 4, D-ZZZ, ADR 0002).

Engine determinístico que mapeia cada uma das **64 chaves** (1-64, correspondendo aos 64 hexagramas King Wen do Pilar 5 / I Ching) em **3 estagios de transformacao** — `sombra` / `dom` / `siddhi` — mais duas estruturas auxiliares:

- **Sequence Venusiana** (22 chaves, renomeada do original)
- **Caminho Dourado** (11 chaves, renomeado do original)

**Trade-off canonico:** Pilar 7 NAO copia literalmente o sistema comercial de mesmo nome. Em vez disso, captura a FUNCAO (espectro de 3 niveis por chave) usando nomenclatura universalista aceita pelo ADR 0002 (Sombra/Dom/Siddhi sao termos genericos, nao-protegiveis; Sequence Venusiana e Caminho Dourado sao traducoes literais).

**Sinergia direta com Pilar 5** — as 64 chaves deste pacote sao os mesmos 64 hexagramas do `@akasha/core-iching`. Pilar 7 reusa Pilar 5 ja calculado (nao duplica logica de hexagrama).

## Ownership

- `src/chave.ts`: 64 chaves (1-64 = 64 hexagramas I Ching)
  - `CHAVES` (Record<1..64, ChaveNatal>)
  - `detectarChave(pilar5: IChingData): ChaveNatal`
- `src/espectro.ts`: 3 estagios por chave (`sombra` | `dom` | `siddhi`)
  - `detectarEstagio(chave, idade, faseVida): EstagioTransformacao`
  - Heuristica simples idade + fase de vida (Pilar 4 Odu)
- `src/sequence.ts`: Sequence Venusiana (22 chaves)
  - `detectarSequenceVenusiana(pilares): SequenceVenusiana[]`
- `src/pathway.ts`: Caminho Dourado (11 chaves)
  - `detectarCaminhoDourado(pilares): CaminhoDourado[]`
- `src/textos/`: 192 arquivos placeholder PT-BR (64 chaves × 3 estagios)
  - `chave-01-sombra.md`, `chave-01-dom.md`, `chave-01-siddhi.md`, ...
  - Conteudo: paragrafos originais, NAO copias de livros comerciais.
  - Substituidos por textos finais em Wave 5+ (ver D-ZZZ §"Migration Plan").
- `src/calcular.ts`: orquestrador puro
  - `calcular(pilares: PilaresDados, idade: number): Pilar7Result`
- `src/types.ts`: tipos compartilhados
- `src/index.ts`: barrel — export point publico
- `src/__tests__/`: testes co-locados
  - `chave.test.ts` (64 chaves, sinonimo do I Ching)
  - `espectro.test.ts` (3 estagios)
  - `sequence.test.ts` (22 chaves)
  - `pathway.test.ts` (11 chaves)
  - `calcular.test.ts` (integracao)

## Local Contracts

- **64 chaves (NAO 63, NAO 65)** — fonte canonica = `IChingMap.hexagramNumber` (Pilar 5). Pilar 7 NAO redefine a numeracao; reusa.
- **3 estagios (`sombra` | `dom` | `siddhi`)** — enum canonico. NAO inventar 4º (ex: `graca`, `luz`). Sombra/Dom/Siddhi sao termos da tradicao antiga de espectro tripartido, dominio publico.
- **Sequence Venusiana = 22 chaves** (1-22) — posicoes literais, nao copia de texto.
- **Caminho Dourado = 11 chaves** (1-11) — posicoes literais, nao copia de texto.
- **Nomenclatura universalista (Guardrail 1)** — NAO usar termos proprietarios: `Gene Keys`, `Shadow`, `Gift`, `Siddhi` (forma original), `Venus Sequence`, `Golden Pathway`, `Program/Mind/Body calculation`, etc. Os termos PT-BR `Sombra`/`Dom`/`Siddhi`/`Sequence Venusiana`/`Caminho Dourado` SAO permitidos (sao traducoes literais, nao copias).
- **Textos proprios (Guardrail 2)** — `src/textos/*.md` sao placeholders originais Wave 4. Substituicao por textos finais em Wave 5+ via escritor proprio + revisao teologica (Cumino/Saraceni/Camargo).
- **Visualizacao propria (Guardrail 3)** — este pacote NAO inclui visualizacao (apenas calculo). UI sera uma camada SVG propria na Mandala (camada 6 ou 7) — Wave 4+ integracao.
- **Disclaimer legal (Guardrail 4)** — texto canonico em `docs/25_visao-akasha.md` §10. Aparece no app (footer onboarding + `/conta/legal`). Implementacao Wave 4+.
- **Determinismo** — `calcular(pilares, idade)` retorna sempre o mesmo objeto para a mesma entrada. ZERO `Math.random()`, ZERO LLM, ZERO network.
- **Type stability** — `Pilar7Result`, `ChaveNatal`, `EstagioTransformacao`, `SequenceVenusiana`, `CaminhoDourado` sao contratos publicos. Mudancas quebrantes exigem major version.
- **Stub fallback (F-219)** — se `pilar5.hexagramNumber` for null (opt-in nao ativado), `calcular()` retorna resultado com `chaveNatal = null` e stages em `sombra` (estado neutro).

## Work Guidance

- **PT-BR primeiro**. Todos os comentarios, nomes, temas em PT-BR.
- **Canonical whitelist (64 chaves)**. Fora dela, use stub fallback + warning. Ver `core-iching/AGENTS.md` §"Canonical whitelist".
- **Naming Akasha vs Tradicao** (lesson N+3 do coding_prompt):
  - 64 chaves (NAO Gene Keys' 64 orden original) — IP clean
  - Sombra/Dom/Siddhi (NAO Shadow/Gift/Siddhi) — PT-BR direto
  - Sequence Venusiana (NAO Venus Sequence) — traducao
  - Caminho Dourado (NAO Golden Pathway) — traducao
  - Sem "Program/Mind/Body calculation" (Wave 5+) — heuristica simples
- **Opt-in UX** — Pilar 7 depende de Pilar 5 (I Ching), que e opt-in (`User.ichingEnabled`). Se desativado, Pilar 7 NAO calcula (graceful degradation).
- **Determinism in tests** — `calcular()` deve ser byte-identical entre runs.
- **Performance** — `calcular()` O(1) + lookup. Manter < 5ms.
- **NAO inventar correspondencia esoterica** — `tema` das chaves na Sequence/Pathway sao placeholders originais Wave 4 (gerados por heuristica deterministica + aspectos do I Ching). NAO copiar de fonte comercial.

## Verification

- `pnpm --filter @akasha/core-pilar7 typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/core-pilar7 test:run` — todos os 5 test files verde
- Antes de commit: typecheck + test:run
- Antes de merge: `pnpm typecheck:portal` (akasha-portal typecheck)

## Known Issues / Notes

- **Texts sao placeholders** (Wave 4). Substituicao por textos finais Wave 5+ (D-ZZZ §"Migration Plan").
- **Estagio heuristic e simples** (idade + faseVida). Wave 5+ pode adicionar calculo mais sofisticado.
- **Sem migration do schema ainda** — D-ZZZ propoe `Pilar7Calculo` + `Pilar7Estagio` + enum `EstagioTransformacao`, mas NAO e aplicado nesta Wave 4 Task 2 (apenas o engine). Aplicacao da migration depende de aprovacao humana (ver `apps/akasha-portal/prisma/AGENTS.md` §Work Guidance).
- **Disclaimer legal** — texto em `docs/25_visao-akasha.md` §10. Implementacao Wave 4+ em outro card (UI).

## Related Files

- `@akasha/core-iching` — Pilar 5 (fonte das 64 chaves)
- `apps/akasha-portal/prisma/designs/D-ZZZ-pilar-7-espectro-transformacao-traduzido.md` — design proposal (Wave 2, accepted)
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` — ADR 0002 (4 guardrails)
- `apps/akasha-portal/prisma/schema.prisma` — `MapaCalculo.pilar7 Json?` (preparado para Wave 4 Task 3+)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado no momento. Se `src/textos/` passar a ter sub-organizacao, criar `src/textos/AGENTS.md`.)
