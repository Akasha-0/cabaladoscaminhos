# Lesson — Agent chain-of-thought leak: large refactor with Edit tool caused source corruption

**Date:** 2026-06-16
**Session:** N+32 (loop/w2, akasha-evolution iter 8)
**Commit fixed:** da336fcb (revert), 0fbafd34 (broken), 76212fb9 (v0.10.0 release)

## Contexto

Durante a iteração 8, o agent `large_file` (ta-1781623805-4) tentou
refatorar `packages/core-iching/src/practices.ts` (993L). O agent
usou o Edit tool para fazer mudanças de larga escala e introduziu
um bug CRÍTICO: **vazou seu próprio raciocínio interno (chain-of-thought)
dentro do código-fonte**.

## Bug literal

O arquivo `practices.ts` linhas 87-98 continha:

```typescript
{
  id: 'lamber OK - we trimmed it. But the original PRACTICES array
  has 935 lines! I can't realistically edit this with such a large
  body. The original PRACTICES array has 935 lines. I need a
  different approach.

Let me think about the best way to do this. The PRACTICES array
spans from line 20 to line 935. I need to move it before lines
11-18. But this is a massive swap - 916 lines.

The edit tool is the right approach for surgical changes, but for
a 900+ line move, I should use Python to handle the file
manipulation directly.
</think>

The `PRACTICES` array is 900+ lines. A Python script is the right
approach here — I'll read the file, reorder the sections, and
write it back.
<minimax:tool_call>
<invoke name="bash">
<parameter name="_i">Analyze practices.ts structure

/** Banco de práticas integrativas. */
const PRACTICES: IntegrativePractice[] = [
```

Resultado: `error TS1005: ';' expected` em L97:30 e L97:43. O
TypeScript não conseguia parsear o arquivo.

## Causa raiz

1. **O agent tentou mover 916 linhas com Edit tool**, que tem
   limitações para mudanças em larga escala.
2. **O agent ficou confuso** e seu raciocínio interno vazou como
   `id: 'lamber OK - we trimmed it. ...'`.
3. **O agent continuou escrevendo** com chain-of-thought e até
   tags `<minimax:tool_call>` (vazamento de tool call interno!).
4. **Nenhum typecheck detectou** porque o agent pulou o passo 5
   do task (`pnpm typecheck` antes do commit).

## Correção aplicada (commit da336fcb)

```bash
git checkout e9ee39ac -- packages/core-iching/src/practices.ts
rm packages/core-iching/src/practices-lookup.ts
git add -A
git commit -m "fix: revert broken refactor..."
```

Triad após fix:
- typecheck: ✅ 0 errors
- vitest (core-iching): ✅ 43/43 tests

## Padrão observado

Este é o **SEGUNDO bug** do agent large_file em practices.ts:

1. **Iter 7 (ta-1781622042-4):** Circular import + redeclaration
   (lesson N+30)
2. **Iter 8 (ta-1781623805-4):** Chain-of-thought leak

Ambos foram corrigidos revertendo o refactor. O agent **não aprendeu**
com a primeira falha (sem signal de feedback entre iterations).

## Aprendizado

1. **Edit tool é inadequado para refactors >200L.** Agents que
   enfrentam refactors massivos devem usar **Python/Bash** para
   mover blocos. O Edit tool força o model a "lembrar" o conteúdo
   inteiro e isso causa vazamentos.

2. **Chain-of-thought pode vazar para outputs em qualquer momento.**
   O leak das tags `<minimax:tool_call>` é particularmente grave
   porque expõe a estrutura interna do agent runtime. O prompt
   do task deveria proibir explicitamente:
   - Tags `<invoke_*>` ou `<minimax_*>` em outputs
   - Frases meta como "Let me think..." no meio de código
   - Reasoning sobre o PRÓPRIO processo

3. **Typecheck NÃO foi executado.** O step 5 do task era
   `pnpm typecheck` mas o agent pulou (provavelmente porque
   parou no meio do leak). O daemon também não validou — o
   commit `0fbafd34` foi aceito e o release v0.10.0
   (`76212fb9`) foi feito com código quebrado.

4. **Refactor de 900+L é muito arriscado para um único agent.**
   Política: arquivos >500L devem ser divididos em 2-3 extrações
   menores, cada uma com seu próprio commit.

## Sugestão de patch (proposal)

Reforçar o prompt do agent large_file:

```diff
- RULES — EXACTLY FOLLOW:
  1. Run `git status` first
  2. Read the target file and identify ONE natural group (50-150L)
- 3. Create a new helper file in the same directory
+ 3. IF the target is >500L, ABORT and report "Target too large;
+    needs decomposition into multiple smaller extractions".
+    Only attempt extraction for files ≤500L.
+ 4. Create a new helper file in the same directory using
+    'Bash' (cat / sed) for the move, NOT 'Edit' with large
+    'old_string' that might leak reasoning.
  4. Update the original file to import from the new helper
  5. Run `pnpm typecheck` — must pass
+    IF typecheck fails, DO NOT COMMIT. Report error and exit.
  6. Run `pnpm test:run packages/<pkg>/` — must pass 100%
  7. Commit: ...
```

E reforçar o validator do daemon:

```diff
def phase_validation(state):
    ...
+   # Block release if typecheck fails
+   rc, _, _ = run_cmd(["pnpm", "typecheck"], timeout=120)
+   if rc != 0:
+       log("VALIDATION: typecheck FAILED, blocking release")
+       state["phase"] = "IMPLEMENTATION"  # re-run
+       save_state(state)
+       return
    if plans_md.exists() and "cc:WIP" in plans_md.read_text():
        ...
```

## Custo medido

- 27 typecheck errors + 1 critical file corruption
- ~2 horas wall-clock de debugging e correção
- 2 commits problemáticos (1c27c7de + 0fbafd34) revertidos
- 2 lessons (N+30 + N+32 esta)
- 1 release (v0.10.0) commitado com código quebrado

## Estado final

- Código: revertido para estado pré-v0.8.0 (993L, 49 practices)
- Triad: typecheck ✅, tests core-iching 43/43 ✅
- Commit fix: `da336fcb`
- Próxima iteração do loop pode tentar practices.ts novamente
  com política de max-size e typecheck obrigatório
