# W82-A — Cruzamento por Casa Engine

**Cycle:** 82 (2026-06-30)
**Branch:** `w82/cruzamento-por-casa-engine`
**Worker:** W82-A (Mavis orchestrator session 414743105200419)
**Worktree:** `/tmp/w82-a`

## TL;DR

Built the cross-reference engine for Mesa Real that pulls from the
consulente's 4 natal maps (Astrologia, Numerologia, Odu de Nascimento,
Mapa Cigano) and produces a unified interpretation per mesa casa.

- `cruzamentoPorCasa(mesa, mapa) → CruzamentoCasa[36]`
- 36 PT-BR temas constants (Casa 1 = O Consulente → Casa 36 = O Retorno)
- 7-tradição sacred catalog (cigano, orixás, astrologia, cabala, numerologia, tantra, tarot)
- Branded types (CasaId, CartaCiganaId, OduKey, OrixaKey, ConsulenteId)
- Object.freeze on all constants + every output record
- Pure function — no I/O, no React, no crypto

## Verification

| Check | Result |
|-------|--------|
| **TSC** (`tsc -p tsconfig.w82-a.json --noEmit`) | **0** (exit 0) |
| **Spec** (`node --experimental-strip-types src/lib/engines/cruzamento-por-casa.spec.ts`) | **46/46 PASS** |
| **Smoke** (`node --experimental-strip-types scripts/smoke/cruzamento-por-casa.ts`) | **25/25 PASS** |

## File tree

```
src/lib/engines/cruzamento-por-casa/
├── types.ts             159 LOC — branded primitives + DTOs
├── constants.ts         208 LOC — 36 temas + 7-tradição catalog + card names
├── mapa-consulente.ts   179 LOC — validateMapa + branded constructors
├── cruzamento.ts        235 LOC — main engine (cruzamentoPorCasa)
├── index.ts              50 LOC — public re-exports
└── node-stubs.d.ts       19 LOC — process/console stubs
src/lib/engines/cruzamento-por-casa.spec.ts   385 LOC — self-running spec
scripts/smoke/cruzamento-por-casa.ts          184 LOC — runtime smoke
tsconfig.w82-a.json                           22 LOC — isolated TSC config
```

**Total:** 1441 LOC across 9 files

## Engine API

```typescript
import { cruzamentoPorCasa, validateMapa } from '@/lib/engines/cruzamento-por-casa';

// 1. Validate the consulente's natal maps
const mapaValido = validateMapa(mapa); // Result<MapaConsulente>

// 2. Cross-reference 36 mesa casas against 4 natal maps
const cruzamento = cruzamentoPorCasa(mesa, mapa);
// → ReadonlyArray<CruzamentoCasa> (length 36, frozen)

// 3. Inspect each casa's cruzamento
cruzamento[7]; // Casa 8 = Sexualidade e Transformação
// {
//   casa: 8,
//   tema: 'Sexualidade e Transformação',
//   contribuicoes: [
//     { tradicao: 'astrologia', texto: 'Casa astrológica 8 em Câncer ilumina Sexualidade e Transformação', ref: 'casa-8-Câncer' },
//     { tradicao: 'numerologia', texto: 'Número 5 — vibração do destino 11 sobre Sexualidade e Transformação', ref: 'numero-5-casa-8' },
//     { tradicao: 'orixas',    texto: 'Ejiogbe (princípio) — Oxalá regente, Iemanjá pede passagem em Sexualidade e Transformação', ref: 'odu-Ejiogbe' },
//     { tradicao: 'cigano',    texto: 'Carta Cigana em pé em Sexualidade e Transformação', ref: 'carta-2' }
//   ],
//   sintese: 'Na casa de Sexualidade e Transformação, o mapa natal aponta...',
//   fontes: ['astrologia', 'numerologia', 'orixas', 'cigano']
// }
```

## Algorithm (cruzamentoPorCasa)

For each casa `c` in 1..36:

1. **tema** ← `TEMAS_CASAS[c]`
2. **contribuicoes** computed per map:
   - **Astrologia**: `(c-1) % 12 + 1` → cusp sign from `mapa.astrologia.casas`
   - **Numerologia**: `(numeroDestino + c) % 9 || 9` → vibração number
   - **Odu**: `mapa.odu.odu + orixaRegente + orixaAtencao` → keyword + patrons
   - **Cigano**: carta drawn at `cartaPorCasa.get(c)` → card name + posição
3. **sintese** ← 2-3 sentences citing one symbol per contributing map
4. **fontes** ← unique `tradiacao` set from `contribuicoes`
5. Return frozen `CruzamentoCasa`

## Sacred coverage (7-tradição catalog)

```typescript
TRADICOES = ['cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot']
SACRED_TERMS_BY_TRADICAO covers 7 traditions with curated sacred terms:
- cigano:     Cigano, Cigana, Cavaleiro, Mesa Real, Jogo de 36 cartas
- orixas:     Orixá, Odu, Ifá, Bará, Oxalá, Iemanjá, Ogum, Oxóssi, Xangô
- astrologia: Ascendente, Meio-do-Céu, Lilith, Carta Natal, Casa Astrológica
- cabala:     Sephirot, Árvore da Vida, Tiferet, Yesod, Malkuth
- numerologia: Número de Destino, Ano Pessoal, Dia Natalício, Pythágoras
- tantra:     Prana, Chacra, Kundalini, Mantra
- tarot:      Arcanos Maiores, Arcanos Menores, Torre, Eremita, Sacerdote
```

## Worker notes

- **Pure engine, no I/O**: `cruzamento.ts` has no imports outside
  `./constants.ts` and `./types.ts`. Zero external deps, zero React,
  zero crypto — safe for spec + smoke + future server-side use.
- **Branded types** (`CasaId = number & {__brand}`) prevent CasaId from
  being confused with arbitrary numbers. The `casa()` and `cartaCigana()`
  helpers in `mapa-consulente.ts` are the only sanctioned constructors.
- **Deep freeze**: Every output array, every CruzamentoCasa record, every
  `contribuicoes` array, and every `fontes` array is `Object.freeze`'d.
  Constants (`TEMAS_CASAS`, `TRADICOES`, `SACRED_TERMS_BY_TRADICAO`) are
  frozen at module load.
- **Modulo wrap for astrologia**: Mesa casas > 12 wrap modulo 12 (casa 13
  = astro casa 1, etc.). This handles the 36-casa Mesa → 12-casa
  Astrologia mismatch cleanly.
- **Numerologia math**: `(numeroDestino + c) % 9 || 9` keeps the result in
  1..9 (the `|| 9` corrects for modulo returning 0). Master numbers
  (11/22/33) are preserved in `numeroDestino` — they're not collapsed to
  single digits at the engine boundary.
- **Sintese is SURGICAL**: each sentence cites one specific symbol from
  the contributing map (cusp sign, número, odu keyword, card name).
  Verifiers can cross-check the sintese against the contributing maps.
- **No `extends "../../tsconfig.json"`**: avoids path-escape when the
  worktree is mounted under `/tmp`. The worktree tsconfig inlines
  compilerOptions following the w75 pattern.
- **node-stubs.d.ts** is a sibling script in the engine folder (no top-level
  imports/exports) so `declare global { var process }` augments correctly.
- **Inline SHA-256 (FNV-1a 64-bit + djb2)**: not cryptographic — used
  only as a content fingerprint for stability assertions in the spec.
  Pattern reused from cycles 67+.

## Constraints satisfied

- TSC=0 ✓
- Self-running spec (no vitest) ✓
- Runtime smoke exits 0 ✓
- 7-tradição catalog with sacred terms ✓
- Object.freeze on all constants ✓
- Branded types ✓
- Single file per concern (5 source files + spec + smoke + tsconfig) ✓
- Compact prompts/data in fixtures (~80-120 words each) ✓
- No external deps ✓
- No commit/push on main (work on `w82/cruzamento-por-casa-engine`) ✓

## Reusable patterns (carry-forward for w83+)

- Pure engine module: only imports `./constants.ts` + `./types.ts`
- Branded ID pattern with `casa()` / `cartaCigana()` helper constructors
- Module-level `Object.freeze` for all export constants
- Result type for validation (`{ok:true,value} | {ok:false,error}`)
- Self-running spec with `let pass = 0, fail = 0` + `expect(label, cond, info?)`
- Inline FNV-1a fingerprint (no node:crypto dep)
- Modulo-wrap for cross-domain mapping (mesa 36 → astro 12)
- Surrogate citation pattern: every contribuicao carries a stable `ref`

## Commit + Push

**Do NOT auto-run `git push`** (sandbox push timeouts are known, see
memory 2026-06-27). The commit and push commands are:

```bash
cd /tmp/w82-a
git add src/lib/engines/cruzamento-por-casa/ src/lib/engines/cruzamento-por-casa.spec.ts scripts/smoke/cruzamento-por-casa.ts tsconfig.w82-a.json DELIVERABLE.md
git commit -m "feat(w82-a): cruzamento-por-casa engine — 36 casas × 4 maps cross-reference

- MesaRealState + MapaConsulente inputs
- cruzamentoPorCasa(mesa, mapa) → CruzamentoCasa[36]
- 36 PT-BR temas constants
- 7-tradição sacred catalog
- Self-running spec, smoke, TSC=0"
timeout 60 git push -u origin w82/cruzamento-por-casa-engine
```

## Status

✅ **PUSHED @ `3d70c1d445ae1b49420b79d141b6d48dfc3b63f7`** on branch `w82/cruzamento-por-casa-engine`.

TSC=0, spec 46/46 PASS, smoke 25/25 PASS.

Branch: `w82/cruzamento-por-casa-engine`
Worktree: `/tmp/w82-a`
Remote: https://github.com/Akasha-0/cabaladoscaminhos/tree/w82/cruzamento-por-casa-engine