# Ancestral DOX

## Purpose

Odus de Ifá — sistema de adivinhação nigeriano/yorubá (Merindilogun).
**Pilar 4 (Odu)** do Akasha — alimenta Mandala (Layer 1: Ori,
centro), Mandato, e Mentor via RAG. Curadoria manual canonical
(15 Odus derivados de D-044, NÃO 16).

## Ownership

- **15 Odus canônicos** (D-044, Merindilogun): Ogbe, Oyeku, Iwori,
  Odi, Irosun, Owonrin, Obara, Ika, Oturupon, Otura, Irete, Ojuani,
  Ejila, Ika_14, Oturupon_15 (nomes em PT-BR + transliteração yorubá).
- 1 Odu composto (`odu-13-eji-ogbe.md` — Ogbe+Oyeku) é derivado, não
  entry separada. Total **15 entries canônicas + 1 composto**.

## Local Contracts

- **15 Odus canônicos** (NÃO 16). O `package.json` de `core-odus`
  diz "16 Odus" mas é impreciso — `ODUS_IFA` tem 15 entries
  canônicas. Odu 16º (Irosu Odi) é composto, tratado via
  `comparison.ts` em `core-odus`. Ver
  `packages/core-odus/AGENTS.md` §"Canonical count" e lesson
  `session-n-plus-15-f-219-pilar4-truth-base.md`.
- **Pilar 4 ethics invariant** (Doc 25 §4.4): Pilar 4 (Odu) é o mais
  sensível culturalmente. Toda nova entry ou rule DEVE ser curada
  contra o canon (D-044). NUNCA inventar correspondência esotérica.
- **Aviso `requer consentimento + terreiro`**: ao tocar em temas
  Odu no Mentor (`@akasha/mentor`), mostrar este aviso. Pilar 4
  é o único pilar com ethics hard-stop.
- **Canonical whitelist (15 nomes)** — derivada de D-044. Fora dela,
  stub fallback + warning. NÃO inventar nomes compostos como
  entries separadas.
- **Naming**: PT-BR primário (significados, preceitos, oferendas),
  EN secundário (frontmatter `title_en` + `## EN` section).
- **Formato MD**: frontmatter YAML (id, slug, title, title_en,
  categoria: Odu, biblioteca: ancestral, Elementos_Regentes,
  Orixas_Associados, Numeros_Kabalisticos, Odus_Associados,
  Acao_Principal) + body markdown estruturado.

## Work Guidance

- **PT-BR primeiro** (i18n config do projeto). Significados,
  preceitos, oferendas em PT-BR.
- **Curadoria contra D-044**: toda nova entry precisa de source
  canônico (livro publicado, babalawo confirmado, ou D-044).
- **Pilar 4 ethics invariant**: este é o ÚNICO pilar com hard-stop
  (`requer consentimento + terreiro`). Outras correspondências
  esotéricas são permitidas (Pilar 1-3, 5 são IP-clean).
- **NÃO inventar correspondências esotéricas** (AGENTS.md §5 do
  projeto). Toda relação Odu-Orixá-Número-Sefirot deve ter
  source.
- **Manter consistência de formato** entre todos os 15 Odus.
- **Atualizar quando prática ancestral evoluir** — curadoria
  contínua, não set-and-forget.
- **Stub fallback para nomes compostos**: se um consumer pedir
  um Odu composto (ex: "Irosu Odi"), retornar a entry canônica
  + warning, NÃO inventar nome composto.
- **Tests determinísticos**: usar `vi.useFakeTimers()` quando
  test depender de data (Odu de Nascimento muda com calendário).

## Verification

- `pnpm --filter @akasha/core-odus typecheck` (engine funciona)
- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts`
  (cobre este dir; lesson N+18 fix aplicou)
- Antes de adicionar nova entry: verificar D-044 source
- Antes de modificar entry: revisão de pares (peer review de
  outro agente)

## Known Issues / Notes

- **Discrepância histórica**: versões antigas deste AGENTS.md
  diziam "16 Odus" mas a canonical engine (`core-odus`) tem 15.
  Atualizado para refletir a canonical 15+1 composto.
- **Compromisso Pilar 4 (Odu)**: messages do Mentor que tocam
  Odu precisam do aviso. Ver `packages/mentor/AGENTS.md` §Work
  Guidance.

## Related Files

- `packages/core-odus/AGENTS.md` — engine (canonical 15)
- `.autonomous/research/designs/d-040-prisma-5-pilares-design.md` —
  Pilar 4 schema proposal (awaiting human approval)
- `grimoire/AGENTS.md` (parent) — DOX chain
- `grimoire/mentor/system-prompt.md` — system prompt que invoca
  Pilar 4

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `grimoire/ancestral/
odu-{N}/` for criado com sub-páginas, ganhar AGENTS.md próprio.)
