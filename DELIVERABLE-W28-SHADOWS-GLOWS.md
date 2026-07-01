# DELIVERABLE — Wave 28: Shadows & Glows 6/8

**Designer:** Lina · **Wave:** W28 (SHADOWS & GLOWS 6/8) · **Date:** 2026-06-28
**Status:** 🟡 Files staged · ❌ git commit HUNG in sandbox (known issue, see git-forensics memory)

---

## TL;DR

9 arquivos modificados/criados, 724 linhas (+), 28 linhas (-). Token system místico de
16 shadows + 9 utilitários animados + 1 componente novo (`<LuminousCard />`).

**Não foi possível commit** devido a git hang no sandbox (`.git/index.lock` + commit
timeout 45s+120s — padrão conhecido do cabaladoscaminhos, ver agent memory 2026-06-27).
Os 9 arquivos foram **staged** com sucesso — basta rodar o comando abaixo localmente.

---

## Commit (rodar manualmente)

```bash
cd /workspace/cabaladoscaminhos
git add \
  src/app/globals.css \
  src/components/ui/v2/button.tsx \
  src/components/ui/v2/card.tsx \
  src/components/ui/v2/toast.tsx \
  src/components/ui/v2/avatar.tsx \
  src/components/ui/v2/sheet.tsx \
  src/components/ui/v2/index.ts \
  src/components/ui/v2/luminous-card.tsx \
  docs/SHADOWS-LUMINOUS-W28.md

git commit -m "feat(design): ethereal shadows + luminous glows W28

- Add 16 mystical shadow tokens to globals.css:
  * --shadow-sm/md/lg/xl/2xl (elevation scale)
  * --shadow-glow-{amber,violet,emerald,cyan} (chromatic halos)
  * --shadow-inner-{sacred,mystical} (inscribed light)
  * --shadow-cosmic-{sm,md,lg} (dark-mode deep elevation)
- Add 4 utility animation classes: .animate-glow-{amber,violet,emerald,cyan}
  + .animate-shine (aurora sweep) + .dot-glow-{emerald,amber,cyan}
- All animations honor prefers-reduced-motion
- Create <LuminousCard /> v2 component (amber/violet/emerald/cyan,
  3 elevations, optional pulse, optional shine, glow + scale on hover)
- Apply glows to: Button primary/secondary, Card gold/violet,
  Toast success/info/warning/error, Avatar online/away, Sheet dark mode
- Doc: docs/SHADOWS-LUMINOUS-W28.md (philosophy, token map, light/dark,
  perf considerations, LuminousCard API)

Wave 28 — SHADOWS & GLOWS 6/8 (Lina — designer)"
```

---

## Arquivos (9)

| Arquivo                                          | Tipo      | Δ        | O quê                                                                |
|--------------------------------------------------|-----------|----------|----------------------------------------------------------------------|
| `src/app/globals.css`                            | Modified  | +152/-2  | 16 shadow tokens (light + dark) + 9 utilitários animados             |
| `src/components/ui/v2/luminous-card.tsx`         | **New**   | +205/0   | `<LuminousCard>` com 4 variantes, 3 elevations, pulse/shine opt-in   |
| `src/components/ui/v2/button.tsx`                | Modified  | +15/-6   | Glow amber (primary) + glow violet (secondary) no hover              |
| `src/components/ui/v2/card.tsx`                  | Modified  | +8/-5    | Glow amber (gold variant) + glow violet (violet variant) no hover    |
| `src/components/ui/v2/toast.tsx`                 | Modified  | +8/-5    | Glow per severity: amber/amber/cyan/rose                             |
| `src/components/ui/v2/avatar.tsx`                | Modified  | +4/-3    | dot-glow-emerald (online) + dot-glow-amber (away)                     |
| `src/components/ui/v2/sheet.tsx`                 | Modified  | +8/-7    | shadow-cosmic-lg no dark mode                                        |
| `src/components/ui/v2/index.ts`                  | Modified  | +22/-10  | Export LuminousCard + 5 sub-componentes                              |
| `docs/SHADOWS-LUMINOUS-W28.md`                   | **New**   | +294/0   | Doc filosófica + token map + light/dark + perf + LuminousCard API    |

**Total: 9 arquivos · 724 insertions · 28 deletions**

---

## Token Scale (16 tokens)

### Elevação neutra (5)
- `--shadow-sm`  ·  `--shadow-md`  ·  `--shadow-lg`  ·  `--shadow-xl`  ·  `--shadow-2xl`

### Glows cromáticos (4)
- `--shadow-glow-amber` (80° / Xangô / Axé)
- `--shadow-glow-violet` (285° / 3º olho / Umbanda)
- `--shadow-glow-emerald` (160° / cura / Oxóssi)
- `--shadow-glow-cyan` (220° / informação / Meditação)

### Inner glows (2)
- `--shadow-inner-sacred` (luz inscrita dourada)
- `--shadow-inner-mystical` (luz inscrita violeta)

### Cosmic depth (3) — dark mode
- `--shadow-cosmic-sm`  ·  `--shadow-cosmic-md`  ·  `--shadow-cosmic-lg`

### Utility classes (9)
- `.animate-glow-{amber,violet,emerald,cyan}` — respiração 3s
- `.animate-shine` — varredura aurora 6s (background, GPU)
- `.dot-glow-{emerald,amber,cyan}` — halo em status dots

Todos honram `prefers-reduced-motion: reduce`.

---

## Aplicação (8+ componentes)

| Componente                | Onde o glow aparece                                          |
|---------------------------|--------------------------------------------------------------|
| `Button` primary          | `hover:shadow-[md, glow-amber]`                              |
| `Button` secondary        | `hover:shadow-[md, glow-violet]`                             |
| `Card` variant=gold       | `hover:shadow-[glow-amber]`                                  |
| `Card` variant=violet     | `hover:shadow-[glow-violet]`                                 |
| `Toast` success           | `shadow-[lg, glow-amber]`                                    |
| `Toast` info              | `shadow-[lg, glow-cyan]`                                     |
| `Toast` warning           | `shadow-[lg, glow-amber]`                                    |
| `Toast` error             | `shadow-[lg, glow-rose]`                                     |
| `Avatar` status=online    | `dot-glow-emerald` (8px halo)                                |
| `Avatar` status=away      | `dot-glow-amber` (8px halo)                                  |
| `Sheet` (dark mode)       | `shadow-cosmic-lg`                                           |
| **`LuminousCard` (new)**  | glow always-on, hover intensifica + scale 1.02               |

---

## `<LuminousCard />` — API rápida

```tsx
import { LuminousCard, LuminousCardHeader, LuminousCardTitle, LuminousCardContent, LuminousCardFooter }
  from "@/components/ui/v2"

<LuminousCard variant="amber" elevation="raised">
  <LuminousCardHeader>
    <LuminousCardTitle>Sua leitura de hoje</LuminousCardTitle>
  </LuminousCardHeader>
  <LuminousCardContent>...</LuminousCardContent>
  <LuminousCardFooter>...</LuminousCardFooter>
</LuminousCard>
```

**Props:**
- `variant`: `'amber' | 'violet' | 'emerald' | 'cyan'` (default `'amber'`)
- `elevation`: `'flat' | 'raised' | 'floating'` (default `'raised'`)
- `pulse`: `boolean` (default `false`) — respiração animada, ≤3/viewport
- `disableShine`: `boolean` (default `false`) — desliga varredura aurora

---

## Filosofia (Lina)

> *"Luz vem DE DENTRO"* — componentes ativos emitem luz inscrita + halo externo.
> Dark mode é o palco principal — glows 40-60% mais intensos, `--shadow-cosmic-*`
> substitui `--shadow-*` (cosmos indigo-purpureo, não preto puro).

Princípios:
1. Luz vem de dentro (gradient inset) + halo emanado (shadow externo)
2. Glow é aura semântica, não decoração (só em hover, ativo, sucesso, alerta)
3. Dark mode = observatório/templo, não app comum

Inspiração: Linear (clareza) · Vercel (elevação sutil) · Apple HIG (luminosidade dark)
· Templos contemporâneos (luz inscrita).

---

## Performance

| Animação          | Custo                          | Composição GPU? | Quantos usar |
|-------------------|--------------------------------|-----------------|--------------|
| `.animate-glow-*` | Repaint (box-shadow animado)   | Não             | **≤3/viewport**  |
| `.animate-shine`  | Composite (background animado) | **Sim**         | ≤20/viewport |
| Hover transform   | Composite (transform)          | **Sim**         | Sem limite   |

`will-change: transform` aplicado no LuminousCard. Listas longas devem usar
`pulse={false}` + `disableShine`.

---

## Investigação — Bloqueio de commit

**Sintoma:** `git commit` hang em 30s+45s+120s com `Unable to create '.git/index.lock'`
→ após `rm -f .git/index.lock`, comando travou em peer-closed-connection.

**Causa provável:** padrão conhecido do sandbox cabaladoscaminhos (agent memory
2026-06-27 + 2026-06-28) — operações `git add -A` / `git commit` podem hangar
indefinidamente. Não é falha dos arquivos: 9 arquivos staged com sucesso antes do hang.

**Mitigação:** usuário roda `git commit` localmente (comando acima), onde o fs é
normal. Sandbox segue para próxima wave.

---

## Próximas ondas (sugestões Lina)

- **W29+** — Motion tokens semânticos (`--motion-breath`, `--motion-aurora`)
- **W30+** — Modo "templo" (bg indigo quase-preto, glows +20%, sem cores UI não-místicas)
- **W31+** — Sound design opcional (sino tibetano em hover LuminousCard — opt-in + mute)