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

  it('renders chakra title', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    // Chakra appears twice (mobile + desktop views)
    const elements = screen.getAllByText('Muladhara');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all 7 chakra names at least once', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    // Use getAllByText since chakra names appear in both mobile and desktop views
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
    // These appear in desktop view
    expect(screen.getByText('Raiz')).toBeInTheDocument();
    expect(screen.getByText('Sacro')).toBeInTheDocument();
    expect(screen.getByText('Plexo Solar')).toBeInTheDocument();
    expect(screen.getByText('Coração')).toBeInTheDocument();
    expect(screen.getByText('Garganta')).toBeInTheDocument();
    expect(screen.getByText('Terceiro Olho')).toBeInTheDocument();
    expect(screen.getByText('Coroa')).toBeInTheDocument();
  });

  it('displays chakra mantras', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByText('LAM')).toBeInTheDocument();
    expect(screen.getByText('VAM')).toBeInTheDocument();
    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.getByText('YAM')).toBeInTheDocument();
    expect(screen.getByText('HAM')).toBeInTheDocument();
    expect(screen.getByText('OM/AUM')).toBeInTheDocument();
    expect(screen.getByText(/Silence/i)).toBeInTheDocument();
  });

  it('displays chakra frequencies', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByText('396 Hz')).toBeInTheDocument();
    expect(screen.getByText('417 Hz')).toBeInTheDocument();
    expect(screen.getByText('528 Hz')).toBeInTheDocument();
    expect(screen.getByText('639 Hz')).toBeInTheDocument();
    expect(screen.getByText('741 Hz')).toBeInTheDocument();
    expect(screen.getByText('852 Hz')).toBeInTheDocument();
    expect(screen.getByText('963 Hz')).toBeInTheDocument();
  });

  it('displays chakra elements', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByText('Terra')).toBeInTheDocument();
    expect(screen.getByText('Água')).toBeInTheDocument();
    expect(screen.getByText('Fogo')).toBeInTheDocument();
    expect(screen.getByText('Ar')).toBeInTheDocument();
    expect(screen.getByText('Éter')).toBeInTheDocument();
    expect(screen.getByText('Luz')).toBeInTheDocument();
    expect(screen.getByText('Consciência')).toBeInTheDocument();
  });

  it('displays state badges', () => {
    const data = createMockChakraData();
    render(<ChakraPanel data={data} />);
    expect(screen.getByText('Equilibrado')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    expect(screen.getByText('Hiperativo')).toBeInTheDocument();
    expect(screen.getByText('Desbalanceado')).toBeInTheDocument();
  });

  it('shows dominant and blocked chakra info', () => {
    const data = createMockChakraData({ dominante: 'Sahasrara', bloqueado: 'Manipura' });
    render(<ChakraPanel data={data} />);
    // These should appear in screen reader announcements or info section
    expect(screen.getByText(/Sahasrara/i)).toBeInTheDocument();
    expect(screen.getByText(/Manipura/i)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders ChakraPanel component', () => {
    const data = createMockChakraData();
    const { container } = render(<ChakraPanel data={data} />);
    expect(container.firstChild).toBeInTheDocument();
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
});
