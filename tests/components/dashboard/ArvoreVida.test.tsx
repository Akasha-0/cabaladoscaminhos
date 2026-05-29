import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArvoreVida } from '../../src/components/dashboard/ArvoreVida';

describe('ArvoreVida', () => {
  it('renders all 10 sephiroth', () => {
    const result = renderToString(<ArvoreVida />);
    expect(result).toContain('Kether');
    expect(result).toContain('Chokhmah');
    expect(result).toContain('Binah');
    expect(result).toContain('Chesed');
    expect(result).toContain('Geburah');
    expect(result).toContain('Tiphereth');
    expect(result).toContain('Netzach');
    expect(result).toContain('Hod');
    expect(result).toContain('Yesod');
    expect(result).toContain('Malkuth');
  });

  it('renders with highlighted sephiroth', () => {
    const result = renderToString(
      <ArvoreVida highlightedSephiroth={['kether', 'tiphereth']} />
    );
    expect(result).toContain('Kether');
    expect(result).toContain('Tiphereth');
  });

  it('renders SVG with viewBox', () => {
    const result = renderToString(<ArvoreVida size="lg" />);
    expect(result).toContain('viewBox="0 0 100 100"');
  });
});
