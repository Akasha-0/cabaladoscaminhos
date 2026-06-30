/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-B — /mentorship · Page spec (source-inspection)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 86 W86-B lesson: source-inspection spec > vitest+jsdom para
 * 'use client' pages. Lê o arquivo e verifica contratos ARIA/data-testid
 * sem precisar de camada de render.
 *
 * Coverage:
 *   - ARIA: role="dialog" no modal, aria-live em filter changes, aria-label
 *   - data-testid: mentor-card, filter-chip-tradição-<name>, pairing-modal, lgpd-consent
 *   - LGPD consent required (disabled no submit sem consent)
 *   - 7 tradição symbols visíveis no source
 *   - Mobile breakpoint CSS (sm: classes, p-4 em mobile)
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };
declare const require: (id: string) => unknown;
declare const __dirname: string;

// @ts-ignore — node-strip-types
import { readFileSync } from 'node:fs';
// @ts-ignore — node-strip-types
import { fileURLToPath } from 'node:url';
// @ts-ignore — node-strip-types
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);

const PAGE_PATH = join(__dirnameLocal, 'page.tsx');
const TYPES_PATH = join(__dirnameLocal, '../../engine/mentorship/types.ts');
const PAGE_SRC = readFileSync(PAGE_PATH, 'utf-8');
const TYPES_SRC = readFileSync(TYPES_PATH, 'utf-8');
const ALL_SRC = PAGE_SRC + '\n' + TYPES_SRC;

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void;
}

const specs: SpecEntry[] = [];
function it(name: string, run: () => void): void {
  specs.push({ name, run });
}
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error('ASSERT FAIL: ' + msg);
}
function assertMatch(re: RegExp, msg: string): void {
  if (!re.test(PAGE_SRC)) throw new Error(`ASSERT FAIL: ${msg} (pattern: ${re})`);
}

// ════════════════════════════════════════════════════════════════════════════
// Spec — ARIA contracts
// ════════════════════════════════════════════════════════════════════════════

it('aria: role="dialog" presente no modal', () => {
  assertMatch(/role="dialog"/, 'modal deve ter role="dialog"');
});

it('aria: aria-modal="true" no modal', () => {
  assertMatch(/aria-modal="true"/, 'modal deve ser aria-modal');
});

it('aria: aria-labelledby referencia o título do modal', () => {
  assertMatch(/aria-labelledby="pairing-modal-title"/, 'modal deve referenciar o título');
});

it('aria: aria-describedby referencia a descrição do modal', () => {
  assertMatch(/aria-describedby="pairing-modal-desc"/, 'modal deve referenciar a descrição');
});

it('aria: aria-live="polite" em filter changes', () => {
  const matches = PAGE_SRC.match(/aria-live="polite"/g) ?? [];
  assert(matches.length >= 2, `deve ter ao menos 2 aria-live="polite", tem ${matches.length}`);
});

it('aria: aria-required="true" no LGPD checkbox', () => {
  assertMatch(/aria-required="true"/, 'LGPD consent deve ter aria-required');
});

it('aria: aria-label no botão de fechar modal', () => {
  assertMatch(/aria-label="Fechar modal"/, 'botão de fechar modal deve ter aria-label');
});

it('aria: aria-label no score (mentor-card)', () => {
  assertMatch(/aria-label=\{`Score de compatibilidade/, 'score deve ter aria-label descritivo');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — data-testid contracts
// ════════════════════════════════════════════════════════════════════════════

it('data-testid: mentorship-page', () => {
  assertMatch(/data-testid="mentorship-page"/, 'mentorship-page deve existir');
});

it('data-testid: mentorship-filters container', () => {
  assertMatch(/data-testid="mentorship-filters"/, 'mentorship-filters container deve existir');
});

it('data-testid: mentorship-list container', () => {
  assertMatch(/data-testid="mentorship-list"/, 'mentorship-list container deve existir');
});

it('data-testid: mentor-card presente', () => {
  assertMatch(/data-testid="mentor-card"/, 'mentor-card deve existir');
});

it('data-testid: mentor-name, mentor-bio, mentor-score presentes', () => {
  assertMatch(/data-testid="mentor-name"/, 'mentor-name deve existir');
  assertMatch(/data-testid="mentor-bio"/, 'mentor-bio deve existir');
  assertMatch(/data-testid="mentor-score"/, 'mentor-score deve existir');
});

it('data-testid: filter-chip-tradição-<name> é gerado dinamicamente para 7 tradições', () => {
  // O componente renderiza o testId via template literal:
  //   testId={`filter-chip-tradição-${t}`}
  // Verificamos que (a) o template existe e (b) o array TRADIÇÕES tem os 7
  // nomes esperados (que serão interpolados em runtime).
  assertMatch(/testId=\{`filter-chip-tradição-\$\{t\}`\}/, 'template dinâmico deve existir');
  assert(TYPES_SRC.includes("'cigano'"), 'types.ts deve ter cigano');
  assert(TYPES_SRC.includes("'candomble'"), 'types.ts deve ter candomble');
  assert(TYPES_SRC.includes("'umbanda'"), 'types.ts deve ter umbanda');
  assert(TYPES_SRC.includes("'ifa'"), 'types.ts deve ter ifa');
  assert(TYPES_SRC.includes("'cabala'"), 'types.ts deve ter cabala');
  assert(TYPES_SRC.includes("'astrologia'"), 'types.ts deve ter astrologia');
  assert(TYPES_SRC.includes("'tantra'"), 'types.ts deve ter tantra');
});

it('data-testid: pairing-modal presente', () => {
  assertMatch(/data-testid="pairing-modal"/, 'pairing-modal deve existir');
});

it('data-testid: lgpd-consent presente', () => {
  assertMatch(/data-testid="lgpd-consent"/, 'lgpd-consent deve existir');
});

it('data-testid: pairing-modal-submit presente', () => {
  assertMatch(/data-testid="pairing-modal-submit"/, 'pairing-modal-submit deve existir');
});

it('data-testid: pairing-modal-close presente', () => {
  assertMatch(/data-testid="pairing-modal-close"/, 'pairing-modal-close deve existir');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — LGPD consent REQUIRED (sem consent, submit fica disabled)
// ════════════════════════════════════════════════════════════════════════════

it('LGPD: canSubmit depende de lgpdConsent', () => {
  assertMatch(/canSubmit\s*=\s*lgpdConsent/, 'canSubmit deve depender de lgpdConsent');
});

it('LGPD: submit disabled quando !canSubmit', () => {
  assertMatch(/disabled=\{!canSubmit\}/, 'submit deve estar disabled sem canSubmit');
});

it('LGPD: checkbox checked→onConsentChange→setLgpdConsent(true)', () => {
  assertMatch(/onConsentChange\(e\.target\.checked\)/, 'checkbox deve chamar onConsentChange com checked');
});

it('LGPD: mensagem menciona LGPD_VERSION', () => {
  assertMatch(/versão \{LGPD_VERSION\}|versão \{`\$\{LGPD_VERSION\}`\}/, 'modal deve mencionar LGPD_VERSION');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — 7 tradição symbols visíveis no source
// ════════════════════════════════════════════════════════════════════════════

it('symbols: ✦🪶☩◈☸☉☬ (cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra)', () => {
  for (const sym of ['✦', '🪶', '☩', '◈', '☸', '☉', '☬']) {
    assert(ALL_SRC.includes(sym), `símbolo ${sym} deve aparecer no source`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — Mobile-first CSS
// ════════════════════════════════════════════════════════════════════════════

it('mobile: sm: breakpoints presentes', () => {
  assertMatch(/sm:/, 'deve ter breakpoints sm:');
});

it('mobile: padding p-4 ou px-4 em mobile', () => {
  assertMatch(/p[xy]-?4|sm:p[xy]-?/, 'deve ter padding responsivo');
});

it('mobile: max-w-3xl wrapper no main', () => {
  assertMatch(/max-w-3xl/, 'main deve ter max-w-3xl para legibilidade');
});

it('mobile: modal sm:items-center (vira centralizado em telas grandes)', () => {
  assertMatch(/sm:items-center/, 'modal deve centralizar em desktop');
});

it('mobile: items-end no mobile (modal bottom-sheet)', () => {
  assertMatch(/items-end/, 'modal deve ser bottom-sheet no mobile');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — Score + reason explicativo
// ════════════════════════════════════════════════════════════════════════════

it('score: pairing.reason exibido em lista', () => {
  assertMatch(/pairing\.reason\.map/, 'deve renderizar pairing.reason');
});

it('score: isPlausible controla cor (emerald vs muted)', () => {
  assertMatch(/pairing\.isPlausible/, 'isPlausible deve controlar variante visual');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — Sacred terms preservation
// ════════════════════════════════════════════════════════════════════════════

it('sacred: "Candomblé" preservado verbatim', () => {
  assert(ALL_SRC.includes('Candomblé'), 'Candomblé deve aparecer verbatim');
});

it('sacred: "Ifá" preservado verbatim', () => {
  assert(ALL_SRC.includes('Ifá'), 'Ifá deve aparecer verbatim');
});

it('sacred: "Tantra" preservado verbatim', () => {
  assert(ALL_SRC.includes('Tantra'), 'Tantra deve aparecer verbatim');
});

it('sacred: nenhum termo excluído (curator intent)', () => {
  for (const banned of ['amarre de amor', 'vinculação amorosa', 'prejudicar terceiros']) {
    assert(!ALL_SRC.toLowerCase().includes(banned), `termo banned: ${banned}`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Runner
// ════════════════════════════════════════════════════════════════════════════

function runAll(): void {
  let pass = 0;
  let fail = 0;
  const failures: { name: string; err: Error }[] = [];
  for (const s of specs) {
    try {
      s.run();
      pass++;
      console.log(`  ✓ ${s.name}`);
    } catch (err) {
      fail++;
      const e = err instanceof Error ? err : new Error(String(err));
      failures.push({ name: s.name, err: e });
      console.log(`  ✗ ${s.name}`);
      console.log(`    ${e.message}`);
    }
  }
  console.log('');
  console.log(`═ ${pass} PASS · ${fail} FAIL · ${pass + fail} total ═`);
  if (fail > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
      console.log(`  - ${f.name}: ${f.err.message}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

runAll();
