/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OduCardFull } from '@/components/mapa/OduCardFull';
import type { OduResults } from '@/lib/engines/types/mapa-alma';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Crown: ({ className }: any) => (
    <div data-testid="crown-icon" className={className}>👑</div>
  ),
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className}>⭐</div>
  ),
  AlertTriangle: ({ className }: any) => (
    <div data-testid="alert-icon" className={className}>⚠️</div>
  ),
  CheckCircle2: ({ className }: any) => (
    <div data-testid="check-icon" className={className}>✅</div>
  ),
  Flame: ({ className }: any) => (
    <div data-testid="flame-icon" className={className}>🔥</div>
  ),
}));

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>{children}</h3>
  ),
}));

// Mock Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

const mockOduData: OduResults = {
  regente: {
    numero: 7,
    Caminho: 7,
    nome: 'Oyei',
    significado: 'Conhecimento, sabedoria',
  },
  secundario: {
    numero: 3,
    Caminho: 3,
    nome: 'Oxê',
    significado: 'Força,威力',
  },
  orixas: ['Oxum', 'Iemanjá', 'Obatalá'],
  quizilas: [
    'Não mexa com fogo à noite',
    'Evite说有谎话',
    'Não atravesse rios sem permissão',
  ],
  preceitos: [
    'Fale sempre a verdade',
    'Respeite os mais velhos',
    'Faça oferendas mensais',
  ],
  ebos: [
    'Oferta de dendê e akará',
    'Banho de ervas sagradas',
  ],
  elemento: 'Água',
  arcanoTarot: 14,
  caminhoSephirah: 'Netzach',
};

describe('OduCardFull', () => {
  describe('renders Odu name and numero', () => {
    it('displays the main odu name', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Oyei')).toBeInTheDocument();
    });

    it('displays the main odu numero', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('#7')).toBeInTheDocument();
    });

    it('displays the secondary odu name when present', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Oxê')).toBeInTheDocument();
      expect(screen.getByText('Odu Secundário')).toBeInTheDocument();
    });

    it('displays only main odu when no secondary', () => {
      const noSecondary: OduResults = {
        ...mockOduData,
        secundario: null,
      };
      render(<OduCardFull odu={noSecondary} />);
      expect(screen.queryByText('Odu Secundário')).not.toBeInTheDocument();
    });

    it('has "Odu do Destino" title', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Odu do Destino')).toBeInTheDocument();
    });

    it('renders Crown icon in header', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      expect(container.querySelector('[data-testid="crown-icon"]')).toBeInTheDocument();
    });
  });

  describe('renders orixás regentes', () => {
    it('displays all orixás associated', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Oxum')).toBeInTheDocument();
      expect(screen.getByText('Iemanjá')).toBeInTheDocument();
      expect(screen.getByText('Obatalá')).toBeInTheDocument();
    });

    it('displays Orixás section header', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Oixás Regentes')).toBeInTheDocument();
    });

    it('renders Star icon for each orixá badge', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const starIcons = container.querySelectorAll('[data-testid="star-icon"]');
      expect(starIcons.length).toBe(3); // One per orixá
    });

    it('renders orixás as badges with correct styling', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const emeraldBadges = container.querySelectorAll('.bg-emerald-400\\/10');
      expect(emeraldBadges.length).toBeGreaterThan(0);
    });
  });

  describe('renders quizilas (interdições)', () => {
    it('displays all quizilas', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Não mexa com fogo à noite')).toBeInTheDocument();
      expect(screen.getByText('Evite说有谎话')).toBeInTheDocument();
      expect(screen.getByText('Não atravesse rios sem permissão')).toBeInTheDocument();
    });

    it('displays Quizilas section header with warning style', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Quizilas (Evitar)')).toBeInTheDocument();
    });

    it('renders AlertTriangle icon for quizilas section', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const alertIcons = container.querySelectorAll('[data-testid="alert-icon"]');
      expect(alertIcons.length).toBeGreaterThan(0);
    });

    it('renders quizilas as amber warning badges', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const amberBadges = container.querySelectorAll('.bg-amber-500\\/10');
      expect(amberBadges.length).toBe(3);
    });

    it('does not render quizilas section when empty', () => {
      const noQuizilas: OduResults = {
        ...mockOduData,
        quizilas: [],
      };
      render(<OduCardFull odu={noQuizilas} />);
      expect(screen.queryByText('Quizilas (Evitar)')).not.toBeInTheDocument();
    });

    it('does not render AlertTriangle icon when no quizilas', () => {
      const noQuizilas: OduResults = {
        ...mockOduData,
        quizilas: [],
      };
      const { container } = render(<OduCardFull odu={noQuizilas} />);
      expect(container.querySelector('[data-testid="alert-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('renders preceitos (recomendações)', () => {
    it('displays all preceitos', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Fale sempre a verdade')).toBeInTheDocument();
      expect(screen.getByText('Respeite os mais velhos')).toBeInTheDocument();
      expect(screen.getByText('Faça oferendas mensais')).toBeInTheDocument();
    });

    it('displays Preceitos section header', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Preceitos (Fazer)')).toBeInTheDocument();
    });

    it('renders CheckCircle2 icon for preceitos section', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const checkIcons = container.querySelectorAll('[data-testid="check-icon"]');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('renders preceitos as emerald success badges', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const emeraldBadges = container.querySelectorAll('.bg-emerald-400\\/10');
      expect(emeraldBadges.length).toBeGreaterThan(0);
    });

    it('does not render preceitos section when empty', () => {
      const noPreceitos: OduResults = {
        ...mockOduData,
        preceitos: [],
      };
      render(<OduCardFull odu={noPreceitos} />);
      expect(screen.queryByText('Preceitos (Fazer)')).not.toBeInTheDocument();
    });
  });

  describe('renders ebós', () => {
    it('displays all ebós', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Oferta de dendê e akará')).toBeInTheDocument();
      expect(screen.getByText('Banho de ervas sagradas')).toBeInTheDocument();
    });

    it('displays Ebós section header', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Ebós Sugeridos')).toBeInTheDocument();
    });

    it('renders Flame icon for ebós section', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const flameIcons = container.querySelectorAll('[data-testid="flame-icon"]');
      expect(flameIcons.length).toBeGreaterThan(0);
    });

    it('renders ebós as orange offering badges', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const orangeBadges = container.querySelectorAll('.bg-orange-400\\/10');
      expect(orangeBadges.length).toBe(2);
    });

    it('does not render ebós section when empty', () => {
      const noEbos: OduResults = {
        ...mockOduData,
        ebos: [],
      };
      render(<OduCardFull odu={noEbos} />);
      expect(screen.queryByText('Ebós Sugeridos')).not.toBeInTheDocument();
    });

    it('does not render Flame icon when no ebós', () => {
      const noEbos: OduResults = {
        ...mockOduData,
        ebos: [],
      };
      const { container } = render(<OduCardFull odu={noEbos} />);
      expect(container.querySelector('[data-testid="flame-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('renders arcano and sephirah info', () => {
    it('displays the Arcano Tarot number', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('#14')).toBeInTheDocument();
    });

    it('displays Arcano Tarot section label', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Arcano Tarot')).toBeInTheDocument();
    });

    it('displays the Sephirah path', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Netzach')).toBeInTheDocument();
    });

    it('displays Sephirah section label', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText('Caminho Sephirah')).toBeInTheDocument();
    });

    it('renders arcano and sephirah in a 2-column grid', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const grid = container.querySelector('.grid.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('renders elemento', () => {
    it('displays the element', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText(/Elemento: Água/i)).toBeInTheDocument();
    });
    it('displays Elemento section label', () => {
      render(<OduCardFull odu={mockOduData} />);
      expect(screen.getByText(/Elemento:/)).toBeInTheDocument();
    });
  });

  describe('visual structure', () => {
    it('renders with dark background styling', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const card = container.querySelector('[data-testid="card"]');
      expect(card).toHaveClass('bg-slate-900');
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <OduCardFull odu={mockOduData} className="custom-odu-class" />
      );
      const card = container.querySelector('[data-testid="card"]');
      expect(card).toHaveClass('custom-odu-class');
    });

    it('has card header with amber title', () => {
      const { container } = render(<OduCardFull odu={mockOduData} />);
      const title = container.querySelector('[data-testid="card-title"]');
      expect(title).toHaveClass('text-amber-400');
    });
  });

  describe('edge cases', () => {
    it('handles odu with no secondary', () => {
      const noSecondary: OduResults = {
        regente: mockOduData.regente,
        orixas: ['Oxum'],
        quizilas: ['Evite说有谎话'],
        preceitos: ['Fale a verdade'],
        ebos: [],
        elemento: 'Fogo',
        arcanoTarot: 1,
        caminhoSephirah: 'Keter',
      };

      render(<OduCardFull odu={noSecondary} />);
      expect(screen.getByText('Oxum')).toBeInTheDocument();
      expect(screen.queryByText('Odu Secundário')).not.toBeInTheDocument();
    });

    it('handles odu with single quizila', () => {
      const singleQuizila: OduResults = {
        ...mockOduData,
        quizilas: ['Não coma sal'],
      };
      render(<OduCardFull odu={singleQuizila} />);
      expect(screen.getByText('Não coma sal')).toBeInTheDocument();
    });

    it('handles odu with single preceito', () => {
      const singlePreceito: OduResults = {
        ...mockOduData,
        preceitos: ['Respeite a natureza'],
      };
      render(<OduCardFull odu={singlePreceito} />);
      expect(screen.getByText('Respeite a natureza')).toBeInTheDocument();
    });

    it('handles odu with single ebo', () => {
      const singleEbo: OduResults = {
        ...mockOduData,
        ebos: ['Água de cheiro'],
      };
      render(<OduCardFull odu={singleEbo} />);
      expect(screen.getByText('Água de cheiro')).toBeInTheDocument();
    });

    it('handles empty orixás array', () => {
      const noOrixas: OduResults = {
        ...mockOduData,
        orixas: [],
      };
      render(<OduCardFull odu={noOrixas} />);
      // Should still render the section header
      expect(screen.getByText('Oixás Regentes')).toBeInTheDocument();
    });

    it('handles all elements with special characters', () => {
      const specialChars: OduResults = {
        regente: {
          numero: 1,
          Caminho: 1,
          nome: 'Ogbe-Worí',
          significado: 'Criação &🌱',
        },
        orixas: ['Oxum 🌊', 'Ogum ⚔️'],
        quizilas: ['Evite <mentiras>'],
        preceitos: ['Faça "ofertas"'],
        ebos: ['Use água & ervas'],
        elemento: 'Fogo 🔥',
        arcanoTarot: 0,
        caminhoSephirah: 'Keter - Coroa',
      };
      render(<OduCardFull odu={specialChars} />);
      expect(screen.getByText('Ogbe-Worí')).toBeInTheDocument();
      expect(screen.getByText('Evite <mentiras>')).toBeInTheDocument();
    });
  });
});