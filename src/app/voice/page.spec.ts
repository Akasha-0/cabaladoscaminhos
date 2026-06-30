// ============================================================================
// /voice page — structural + behavioral spec (no JSX/Playwright needed)
// ============================================================================
// Reads the page source via readFileSync and asserts on a11y attributes,
// mobile-first patterns, and engine imports.
// ============================================================================

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGE_PATH = resolve(__dirname, './page.tsx');
const H_PATH = resolve(__dirname, './h.ts');
const ENGINE_INDEX = resolve(__dirname, '../../engine/voice/index.ts');

function read(p: string): string {
  return readFileSync(p, 'utf8');
}

const page = read(PAGE_PATH);
const h = read(H_PATH);
const engineIndex = read(ENGINE_INDEX);

describe('/voice — page file structure', () => {
  it('page exists and uses client directive', () => {
    expect(page.startsWith("'use client'")).toBe(true);
  });

  it('page imports from engine/voice index', () => {
    expect(page).toMatch(/from\s+['"]@\/engine\/voice['"]/);
  });

  it('page imports the h() helper (isolated-worktree JSX pattern)', () => {
    expect(page).toMatch(/from\s+['"]\.\/h['"]/);
  });

  it('h.ts is a hyperscript helper using React.createElement', () => {
    expect(h).toContain('React.createElement');
    expect(h).toContain("from 'react'");
  });

  it('engine index re-exports all major modules', () => {
    expect(engineIndex).toContain("./types");
    expect(engineIndex).toContain("./engine");
    expect(engineIndex).toContain("./VoiceAdapter");
    expect(engineIndex).toContain("./voices");
    expect(engineIndex).toContain("./markdown");
    expect(engineIndex).toContain("./cueId");
  });
});

describe('/voice — a11y attributes (mobile-first)', () => {
  it('has aria-live="polite" for status updates', () => {
    expect(page).toContain('aria-live="polite"');
  });

  it('uses role="radiogroup" + role="radio" + aria-checked for tradição picker', () => {
    expect(page).toContain('role="radiogroup"');
    expect(page).toContain('role="radio"');
    expect(page).toContain('aria-checked');
  });

  it('uses aria-current for active queue/current item', () => {
    expect(page).toContain('aria-current');
  });

  it('uses aria-label on interactive controls', () => {
    expect(page).toContain('aria-label="Tocar texto"');
    expect(page).toContain('aria-label="Pausar');
    expect(page).toContain('aria-label="Retomar');
    expect(page).toContain('aria-label="Cancelar');
  });

  it('control buttons meet 48px tap target', () => {
    expect(page).toContain("minHeight: '48px'");
    expect(page).toContain("minWidth: '48px'");
  });

  it('uses semantic h1 + h2 headings', () => {
    expect(page).toContain('<h1');
    expect(page).toMatch(/<h2[^>]*>/g);
  });

  it('uses <button> for actions (not divs)', () => {
    const buttons = (page.match(/<button\b/g) ?? []).length;
    expect(buttons).toBeGreaterThanOrEqual(5);
  });

  it('uses <ul>/<li> for queue list (semantic)', () => {
    expect(page).toContain('<ul');
    expect(page).toContain('<li');
  });
});

describe('/voice — tradição coverage', () => {
  it('renders all 7 tradições as chips', () => {
    expect(page).toContain('ALL_KNOWN_TRADICOES');
    expect(page).toMatch(/'cigano'|cigano:/);
    expect(page).toMatch(/'candomble'|candomble:/);
    expect(page).toMatch(/'umbanda'|umbanda:/);
    expect(page).toMatch(/'ifa'|ifa:/);
    expect(page).toMatch(/'cabala'|cabala:/);
    expect(page).toMatch(/'astrologia'|astrologia:/);
    expect(page).toMatch(/'tantra'|tantra:/);
  });

  it('uses sacred-cultural symbols from W85-C (✦ 🪶 ☩ ◈ ☸ ☉ ☬)', () => {
    expect(page).toContain('✦');
    expect(page).toContain('🪶');
    expect(page).toContain('☩');
    expect(page).toContain('◈');
    expect(page).toContain('☸');
    expect(page).toContain('☉');
    expect(page).toContain('☬');
  });

  it('disables Ifá chip (coming-soon)', () => {
    expect(page).toContain('disabled={isIfa}');
  });

  it('has aria-label for each tradição chip', () => {
    expect(page).toMatch(/aria-label=\{`\$\{TRADICAO_LABELS\[t\]\}/);
  });
});

describe('/voice — TTS engine selector', () => {
  it('has 2 TTS engine options', () => {
    expect(page).toContain("id: 'web-speech'");
    expect(page).toContain("id: 'in-memory'");
  });

  it('uses input[type="radio"] for TTS selection', () => {
    expect(page).toContain('type="radio"');
    expect(page).toContain("name=\"tts-engine\"");
  });
});

describe('/voice — queue UI', () => {
  it('renders queue section with list', () => {
    expect(page).toContain('aria-label="Itens na fila"');
  });

  it('shows current item with aria-current="true"', () => {
    expect(page).toContain('aria-current="true"');
  });

  it('shows empty state when queue is empty', () => {
    expect(page).toContain('Fila vazia');
  });
});

describe('/voice — mobile-first responsive', () => {
  it('uses matchMedia to detect desktop breakpoint', () => {
    expect(page).toContain("matchMedia('(min-width: 880px)')");
  });

  it('adjusts padding for mobile vs desktop', () => {
    expect(page).toMatch(/padding:.*isMobile.*\?/);
  });

  it('uses 48px tap targets consistently', () => {
    const minHeights = (page.match(/minHeight:\s*'48px'/g) ?? []).length;
    expect(minHeights).toBeGreaterThanOrEqual(2);
  });
});

describe('/voice — voice adapter wiring', () => {
  it('instantiates adapter based on ttsEngine state', () => {
    expect(page).toContain('new InMemoryVoiceAdapter()');
    expect(page).toContain('new WebSpeechVoiceAdapter()');
  });

  it('creates VoiceEngine instance with adapter', () => {
    expect(page).toContain('new VoiceEngine(adapter)');
  });

  it('calls engine.play with text + voiceId', () => {
    expect(page).toContain('e.play({');
    expect(page).toContain('voiceId: voiceForTradicao.id');
  });

  it('calls pause/resume/cancel on the engine', () => {
    expect(page).toContain('e.pause()');
    expect(page).toContain('e.resume()');
    expect(page).toContain('e.cancel()');
  });
});
