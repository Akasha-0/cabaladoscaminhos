/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArvoreVidaViz } from '@/components/mapa/ArvoreVidaViz';
import type { NumerologyResults, OduResults } from '@/lib/engines/types/mapa-alma';

const mockNumerologia: NumerologyResults = {
  vida: 5,
  expressao: 3,
  motivacao: 7,
  impressao: 11,
  destino: 9,
  cicloAtual: 5,
  anoPessoal: 1,
  metodoUsado: 'pitagorica',
};

const mockOdu = {
  odu: 'EjiOko',
  regente: {
    nome: 'Ogum',
    Caminho: 7,
  } as OduResults['regente'],
  caminhoSephirah: 'Netzach',
  significado: 'Vitória e conquista',
  caracteristicas: [],
  tendencias: [],
  forca: 'forte',
  periodoFavoravel: {
    dias: [],
    meses: [],
    anos: [],
  },
} as unknown as OduResults;

describe('ArvoreVidaViz', () => {
  it('renders without crashing', () => {
    render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    expect(screen.getByText('ÁRVORE DA VIDA')).toBeDefined();
  });

  it('renders SVG container with viewBox', () => {
    const { container } = render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 300 500');
  });

  it('renders all 10 Sephiroth circles', () => {
    const { container } = render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(10);
  });

  it('renders path lines connecting Sephiroth', () => {
    const { container } = render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(22);
  });

  it('renders legend with color indicators', () => {
    render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    expect(screen.getByText(/Seus Caminhos/)).toBeDefined();
    expect(screen.getByText(/Caminhos Cabalísticos/)).toBeDefined();
  });

  it('displays vida number and odu info', () => {
    render(<ArvoreVidaViz numerologia={mockNumerologia} odu={mockOdu} />);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getByText('Ogum')).toBeDefined();
  });
});