import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CorrelationPredictionsWidget } from '@/components/dashboard/CorrelationPredictionsWidget';
import type { UserSpiritualData } from '@/lib/ai/types';

// Mock the AI modules
vi.mock('@/lib/ai/deep-correlation-engine', () => {
  const mockCorrelations = [
    {
      source: 'kabbalah' as const,
      target: 'tarot_arcana',
      correlation: 0.8,
      explanation: 'Test correlation',
      shared_energy: 'Mystical transformation',
    },
    {
      source: 'ifa' as const,
      target: 'candomble_orixas',
      correlation: 0.85,
      explanation: 'Test correlation',
      shared_energy: 'Ancestral wisdom',
    },
  ];

  const mockCrossPatterns = [
    {
      name: 'Ciclo de Transformação',
      description: 'Padrão de transformação espiritual identificado em múltiplos sistemas.',
      strength: 0.75,
      involved_systems: ['kabbalah', 'tarot', 'astrology'] as const,
      manifestations: ['Caminho das Sefirot', 'Arcana XIII', 'Plutão em Trígono'],
    },
  ];

  const mockEnergyHarmony = {
    overall_score: 0.78,
    system_harmonies: {
      kabbalah: 0.8,
      ifa: 0.7,
      candomble: 0.75,
      tarot: 0.85,
      astrology: 0.72,
      numerology: 0.68,
    },
    dominant_energy: 'Luz Divina',
    balance_indicators: {
      harmonious: ['tarot', 'kabbalah', 'candomble'],
      conflicting: ['numerology'],
      neutral: ['ifa', 'astrology'],
    },
    recommendations: ['Pratique meditação diária', 'Conecte-se com a natureza'],
  };

  class MockDeepCorrelationEngine {
    analyzeCorrelations() {
      return mockCorrelations;
    }
    findCrossSystemPatterns() {
      return mockCrossPatterns;
    }
    calculateEnergyHarmony() {
      return mockEnergyHarmony;
    }
  }

  return {
    DeepCorrelationEngine: MockDeepCorrelationEngine,
  };
});

vi.mock('@/lib/ai/pattern-recognizer', () => {
  const mockArchetypes = [
    {
      id: 'warrior',
      name: 'Guerreiro',
      traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
      energy_signature: 'força, coragem, ação',
      manifestations: {
        kabbalah: 'Chesed - Misericordia',
        ifa: 'Ogbe - Primeiro Odu',
        candomble: 'Ogun - O ferro',
        tarot: 'A Torre',
        astrology: 'Marte',
        numerology: '9',
      },
      growth_areas: ['impaciência', 'agressividade'],
    },
  ];

  return {
    patternRecognizer: {
      recognizeArchetypePatterns: () => mockArchetypes,
    },
  };
});

const mockUserData: UserSpiritualData = {
  id: 'test-user-123',
  nome: 'João Silva',
  dataNascimento: '1990-06-15',
  numeroPessoal: 7,
  arcoPessoal: 19,
  odu: 'Ogbe',
  orixaRegente: 'Ogum',
  sefirotDominante: ['Chesed', 'Gevurah'],
  arcoMaior: [1, 5, 9, 13, 19],
  sign: 'Gêmeos',
  houses: { asc: 3, sun: 10, moon: 15 },
  rashi: 'Mithuna',
};

describe('CorrelationPredictionsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText('Correlações Espirituais')).toBeTruthy();
    });
  });

  it('renders with custom className', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} className="custom-class" />);
    await waitFor(() => {
      expect(screen.getByText('Correlações Espirituais')).toBeTruthy();
    });
  });

  it('displays correlation predictions', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/Conexão Kabbalah/i)).toBeTruthy();
    });
  });

  it('shows pattern predictions', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/Padrão: Ciclo de Transformação/i)).toBeTruthy();
    });
  });

  it('displays archetype prediction', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/Arquetipo Dominante: Guerreiro/i)).toBeTruthy();
    });
  });

  it('shows energy harmony prediction', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/Harmonia Energética Sistêmica/i)).toBeTruthy();
    });
  });

  it('displays confidence percentages', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/78%/)).toBeTruthy();
    });
  });

  it('shows system badges', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getAllByText(/kabbalah/i).length).toBeGreaterThan(0);
    });
  });

  it('allows expanding prediction cards', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].click();
      }
    });
  });

  it('handles loading state', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    // Should show skeleton or loading state initially
    await waitFor(() => {
      const skeleton = document.querySelector('.skeleton-spiritual');
      expect(skeleton).toBeTruthy();
    });
  });

  it('displays recommendations when expanded', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    // Wait for predictions to load
    await waitFor(() => {
      expect(screen.getByText(/Arquetipo Dominante:/i)).toBeTruthy();
    }, { timeout: 5000 });
    // Find and click the archetype card button to expand
    const archetypeButton = screen.getByText(/Arquetipo Dominante:/i).closest('button');
    if (archetypeButton) {
      archetypeButton.click();
    }
    // Verify recommendation is shown after expand
    await waitFor(() => {
      expect(screen.getAllByText(/Recomendação/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows correlation count in footer', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/\d+ correlações/)).toBeTruthy();
    });
  });

  it('shows high confidence count', async () => {
    render(<CorrelationPredictionsWidget userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/alta confiança/)).toBeTruthy();
    });
  });

  it('renders with empty userData gracefully', async () => {
    const emptyUserData: UserSpiritualData = {
      id: 'empty-user',
      nome: '',
      dataNascimento: '',
      numeroPessoal: 0,
      arcoPessoal: 0,
      odu: '',
      orixaRegente: '',
      sefirotDominante: [],
      arcoMaior: [],
      sign: '',
      houses: {},
      rashi: '',
    };
    render(<CorrelationPredictionsWidget userData={emptyUserData} />);
    await waitFor(() => {
      expect(screen.getByText('Correlações Espirituais')).toBeTruthy();
    });
  });
});
