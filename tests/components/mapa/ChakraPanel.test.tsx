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

  it('renders heading', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByTestId('chakra-heading')).toBeInTheDocument();
  });

  it('renders Muladhara chakra', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    const elements = screen.getAllByText('Muladhara');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all 7 chakra names at least once', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getAllByText('Muladhara').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Svadhisthana').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Manipura').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Anahata').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Vishuddha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ajna').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sahasrara').length).toBeGreaterThanOrEqual(1);
  });

  it('displays chakra Portuguese names', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    // Names appear as separate text nodes with dash prefix
    expect(screen.getAllByText((content) => content.includes('Raiz')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Sacro')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Plexo Solar')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Coração')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Garganta')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Terceiro Olho')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((content) => content.includes('Coroa')).length).toBeGreaterThanOrEqual(1);
  });

  it('displays chakra mantras', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getAllByText('LAM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('VAM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('RAM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('YAM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('HAM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('OM/AUM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Silence/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays chakra frequencies', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getAllByText('396 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('417 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('528 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('639 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('741 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('852 Hz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('963 Hz').length).toBeGreaterThanOrEqual(1);
  });

  it('displays chakra elements', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getAllByText('Terra').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Água').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Fogo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Éter').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Luz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Consciência').length).toBeGreaterThanOrEqual(1);
  });

  it('displays state badges', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getAllByText('Equilibrado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bloqueado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hiperativo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Desbalanceado').length).toBeGreaterThanOrEqual(1);
  });

  it('renders ChakraPanel component', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with blocked chakra highlighted', () => {
    const data = createMockChakraData({ bloqueado: 'Manipura', equilibrio: 30 });
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with balanced chakras', () => {
    const data = createMockChakraData({ equilibrio: 85 });
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders empty chakras array gracefully', () => {
    const data = createMockChakraData({ chakras: [] });
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with all equilibrio states', () => {
    const data = createMockChakraData({
      chakras: [
        { numero: 1, nome: 'Muladhara', estado: 'equilibrado', intensidade: 80 },
        { numero: 2, nome: 'Svadhisthana', estado: 'hiperativo', intensidade: 90 },
        { numero: 3, nome: 'Manipura', estado: 'bloqueado', intensidade: 30 },
        { numero: 4, nome: 'Anahata', estado: 'desbalanceado', intensidade: 50 },
      ],
    });
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
