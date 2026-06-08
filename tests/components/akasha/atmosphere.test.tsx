/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// Mock @react-three/fiber — jsdom has no WebGL so we stub the Canvas.
// The Torus / Particles children never render in this test path.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    frameloop,
    dpr,
  }: {
    children?: React.ReactNode;
    frameloop?: string;
    dpr?: number[] | [number, number];
  }) => (
    <div
      data-testid="r3f-canvas"
      data-frameloop={frameloop}
      data-dpr={JSON.stringify(dpr)}
    >
      {children}
    </div>
  ),
  useFrame: () => undefined,
}));

import { MandalaAtmosphere } from '@/components/akasha/MandalaAtmosphere';

const mockMatchMedia = (reducedMotion: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion ? query.includes('reduce') : false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));

beforeEach(() => {
  // Default: motion allowed. Reduced-motion tests override.
  window.matchMedia = mockMatchMedia(false) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MandalaAtmosphere', () => {
  it('renders with default medium intensity and always frameloop when motion is allowed', () => {
    const { getByTestId } = render(<MandalaAtmosphere />);
    const canvas = getByTestId('r3f-canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.dataset.frameloop).toBe('always');
    expect(canvas.dataset.dpr).toBe('[1,2]');
  });

  it('reflects low intensity on the wrapper', () => {
    const { getByTestId } = render(<MandalaAtmosphere intensity="low" />);
    expect(getByTestId('mandala-atmosphere').dataset.intensity).toBe('low');
  });

  it('reflects high intensity on the wrapper', () => {
    const { getByTestId } = render(<MandalaAtmosphere intensity="high" />);
    expect(getByTestId('mandala-atmosphere').dataset.intensity).toBe('high');
  });

  it('uses demand frameloop when prefers-reduced-motion is set', () => {
    window.matchMedia = mockMatchMedia(true) as unknown as typeof window.matchMedia;

    const { getByTestId } = render(<MandalaAtmosphere />);
    const canvas = getByTestId('r3f-canvas');
    expect(canvas.dataset.frameloop).toBe('demand');
    expect(getByTestId('mandala-atmosphere').dataset.reducedMotion).toBe('true');
  });

  it('exposes the wrapper with absolute positioning and pointer-events-none', () => {
    render(<MandalaAtmosphere />);
    const wrapper = screen.getByTestId('mandala-atmosphere');
    expect(wrapper.className).toContain('absolute');
    expect(wrapper.className).toContain('inset-0');
    expect(wrapper.className).toContain('-z-10');
    expect(wrapper.className).toContain('pointer-events-none');
  });
});
