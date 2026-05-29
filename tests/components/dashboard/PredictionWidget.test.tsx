import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PredictionWidget } from '@/components/dashboard/PredictionWidget';

describe('PredictionWidget', () => {
  it('renders without crashing', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      expect(screen.getByText('Previsões do Dia')).toBeTruthy();
    });
  });

  it('renders with custom className', async () => {
    render(<PredictionWidget className="custom-class" />);
    await waitFor(() => {
      expect(screen.getByText('Previsões do Dia')).toBeTruthy();
    });
  });

  it('renders daily prediction', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      expect(screen.getByText('Previsões do Dia')).toBeTruthy();
    });
  });

  it('shows prediction type', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      // Use getAllByText since there are multiple prediction types
      const predictions = screen.getAllByText(/Caminho Espiritual|Relacionamentos|Energia Vital/i);
      expect(predictions.length).toBeGreaterThan(0);
    });
  });

  it('displays prediction text content', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      const paragraphs = screen.getAllByText(/jornada|conexões profundas|energia está|projetos significativos/i);
      expect(paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('shows day energy indicator', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      expect(screen.getByText(/Energia Solar|Início da Semana|Força Interior|Comunicação Sagrada|Abundância|Amor e Beleza|Proteção e Sabedoria/i)).toBeTruthy();
    });
  });

  it('renders multiple prediction cards', async () => {
    render(<PredictionWidget />);
    await waitFor(() => {
      const spiritual = screen.getAllByText(/Caminho Espiritual/i);
      expect(spiritual.length).toBeGreaterThan(0);
    });
  });
});