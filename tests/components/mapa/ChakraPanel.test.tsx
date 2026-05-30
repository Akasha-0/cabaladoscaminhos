'use client';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraPanel } from '@/components/mapa/ChakraPanel';

vi.mock('@/components/design-system/Typography', () => ({
  Heading: ({ children, level }: { children: React.ReactNode; level?: 'h1' | 'h2' | 'h3' | 'h4' }) => {
    const Tag = level || 'h2';
    return <Tag data-testid="chakra-heading">{children}</Tag>;
  },
}));

const createMockChakraData = (overrides?: Partial<import('@/lib/engines/types/mapa-alma').ChakraResults>): import('@/lib/engines/types/mapa-alma').ChakraResults => ({
  chakras: [
    { numero: 1, nome: 'Muladhara', estado: 'equilibrado', intensidade: 80 },
    { numero: 2, nome: 'Svadhisthana', estado: 'hiperativo', intensidade: 90 },
    { numero: 3, nome: 'Manipura', estado: 'bloqueado', intensidade: 30 },
    { numero: 4, nome: 'Anahata', estado: 'equilibrado', intensidade: 75 },
    { numero: 5, nome: 'Vishuddha', estado: 'desbalanceado', intensidade: 55 },
    { numero: 6, nome: 'Ajna', estado: 'equilibrado', intensidade: 70 },
    { numero: 7, nome: 'Sahasrara', estado: 'equilibrado', intensidade: 85 },
  ],
  dominante: 'Sahasrara',
  bloqueado: 'Manipura',
  equilibrio: 69,
  ...overrides,
});

describe('ChakraPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the panel with heading', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByTestId('chakra-heading')).toBeInTheDocument();
  });

  it('displays chakra data from the API', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    
    // Should have chakra names visible (may appear multiple times due to responsive layouts)
    const muladharaElements = screen.getAllByText(/Muladhara/i);
    expect(muladharaElements.length).toBeGreaterThan(0);
  });

  it('shows balance information', () => {
    const data = createMockChakraData({ equilibrio: 75 });
    render(<ChakraPanel data={data} />);
    
    // Check for equilibrium percentage in the display
    const equilibriumText = screen.getAllByText(/75/);
    expect(equilibriumText.length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders the chakra region', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });

  it('displays chakra count for screen readers', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    
    // Screen reader should announce chakra count
    const srAnnouncement = screen.getByRole('status');
    expect(srAnnouncement).toBeInTheDocument();
  });

  it('renders with empty optional properties', () => {
    const data = {
      chakras: [
        { numero: 1, nome: 'Muladhara', estado: 'equilibrado' as const, intensidade: 80 },
      ],
      equilibrio: 50,
    };
    
    // Should not throw
    expect(() => render(<ChakraPanel data={data} />)).not.toThrow();
  });

  it('renders chakra with minimal data', () => {
    const data = {
      chakras: [
        { numero: 1, nome: 'TestChakra', estado: 'bloqueado' as const, intensidade: 0 },
      ],
      equilibrio: 0,
    };
    
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
