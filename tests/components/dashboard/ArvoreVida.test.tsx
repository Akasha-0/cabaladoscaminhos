import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ArvoreVida } from '@/components/dashboard/ArvoreVida';

describe('ArvoreVida', () => {
  it('renders all 10 sephiroth labels', () => {
    const { getByText } = render(<ArvoreVida />);
    expect(getByText('Kether')).toBeTruthy();
    expect(getByText('Chokhmah')).toBeTruthy();
    expect(getByText('Binah')).toBeTruthy();
    expect(getByText('Chesed')).toBeTruthy();
    expect(getByText('Geburah')).toBeTruthy();
    expect(getByText(/Tiferet/i)).toBeTruthy();
    expect(getByText('Netzach')).toBeTruthy();
    expect(getByText('Hod')).toBeTruthy();
    expect(getByText('Yesod')).toBeTruthy();
    expect(getByText('Malkuth')).toBeTruthy();
  });

  it('renders Hebrew letters for each sephirah', () => {
    const { getByText } = render(<ArvoreVida />);
    // Check for Hebrew letters
    expect(getByText('כתר')).toBeTruthy(); // Kether
    expect(getByText('חכמה')).toBeTruthy(); // Chokhmah
    expect(getByText('בינה')).toBeTruthy(); // Binah
  });

  it('renders SVG with viewBox', () => {
    const { container } = render(<ArvoreVida size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('renders with highlighted sephiroth', () => {
    const { getByText } = render(
      <ArvoreVida highlightedSephiroth={['kether', 'tiferet']} />
    );
    expect(getByText('Kether')).toBeTruthy();
    expect(getByText(/Tiferet/i)).toBeTruthy();
  });

  it('renders pillar legend', () => {
    const { getByText } = render(<ArvoreVida />);
    expect(getByText('♦ Misericórdia')).toBeTruthy();
    expect(getByText('♦ Equilíbrio')).toBeTruthy();
    expect(getByText('♦ Severidade')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<ArvoreVida size="sm" />);
    let svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('250');

    rerender(<ArvoreVida size="xl" />);
    svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('800');
  });

  it('renders with labels hidden', () => {
    const { queryByText } = render(<ArvoreVida showLabels={false} />);
    expect(queryByText('Kether')).toBeNull();
  });

  it('renders with path numbers', () => {
    const { container } = render(<ArvoreVida showPathNumbers={true} />);
    const texts = container.querySelectorAll('text');
    // Check for path numbers (1-26)
    const textContents = Array.from(texts).map(t => t.textContent);
    expect(textContents.some(t => t === '11' || t === '1')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<ArvoreVida />);
    expect(getByText('Árvore da Vida')).toBeTruthy();
  });
});
