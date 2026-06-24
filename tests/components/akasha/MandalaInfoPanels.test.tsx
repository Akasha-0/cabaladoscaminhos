import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KabalaInfoPanel, TantricBodyInfoPanel } from '@/components/akasha/MandalaInfoPanels';
import type { MandalaData } from '@/components/akasha/MandalaChart';

const mockKabala: MandalaData['kabala'] = {
  lifePath: 3,
  lifePathMaster: false,
  expression: 5,
  expressionMaster: false,
  motivation: 7,
  impression: 9,
  mission: 4,
  personalYear: 6,
  personalMonth: 2,
  personalDay: 15,
  sefira: null,
  hebrewLetter: null,
  tarotCard: null,
  challenges: null,
  pinnacles: null,
  lifeCycles: null,
};

const mockKabalaMaster: MandalaData['kabala'] = {
  ...mockKabala,
  lifePath: 11,
  lifePathMaster: true,
};

const mockTantra: MandalaData['tantra'] = {
  soul: 1,
  karma: 2,
  divineGift: 3,
  destiny: 4,
  tantricPath: 5,
  bodies: [
    { index: 1, name: 'Corpo da Alma', active: true },
    { index: 2, name: 'Mente Negativa', active: true },
    { index: 3, name: 'Mente Positiva', active: false },
    { index: 4, name: 'Mente Neutra', active: true },
    { index: 5, name: 'Corpo Físico', active: true },
    { index: 6, name: 'Linha do Arco', active: false },
    { index: 7, name: 'Aura', active: true },
    { index: 8, name: 'Corpo Prânico', active: true },
    { index: 9, name: 'Corpo Sutil', active: false },
    { index: 10, name: 'Corpo Radiante', active: true },
    { index: 11, name: 'Mente Divina', active: true },
  ],
};

// ── KabalaInfoPanel ────────────────────────────────────────────────────────────

describe('KabalaInfoPanel', () => {
  it('renders title and subtitle', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning="Caminho do Criador" />);
    expect(screen.getByText('Número de Vida — Geometria Sagrada')).toBeTruthy();
    expect(screen.getByText('Geometria Interna · Camada 2')).toBeTruthy();
  });

  it('renders life path value', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning={null} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders expression and motivation rows', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning={null} />);
    expect(screen.getByText('Expressão — como você se manifesta')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('Motivação — o que move suas escolhas')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('shows master badge when lifePathMaster is true', () => {
    render(<KabalaInfoPanel kabala={mockKabalaMaster} lpMeaning={null} />);
    expect(screen.getByText(/Mestre/)).toBeTruthy();
  });

  it('shows life path meaning when provided', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning="Caminho do Criador — expressão e comunicação." />);
    expect(screen.getByText(/Caminho do Criador/)).toBeTruthy();
  });

  it('shows advanced details when showAdvanced is toggled', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning={null} />);
    const btn = screen.getByRole('button', { name: /detalhes avançados/i });
    fireEvent.click(btn);
    // Should show impression, mission etc.
    expect(screen.getByText('Impressão — como os outros te percebem')).toBeTruthy();
    expect(screen.getByText('Missão — seu propósito nesta encarnação')).toBeTruthy();
  });

  it('hides advanced details initially', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning={null} />);
    expect(screen.queryByText('Impressão — como os outros te percebem')).toBeNull();
  });

  it('toggles advanced details off when clicked again', () => {
    render(<KabalaInfoPanel kabala={mockKabala} lpMeaning={null} />);
    const btn = screen.getByRole('button', { name: /detalhes avançados/i });
    fireEvent.click(btn);
    expect(screen.getByText('Impressão — como os outros te percebem')).toBeTruthy();
    fireEvent.click(btn);
    expect(screen.queryByText('Impressão — como os outros te percebem')).toBeNull();
  });

  it('handles null personalYear/personalMonth/personalDay', () => {
    const nulls: MandalaData['kabala'] = {
      ...mockKabala,
      personalYear: null,
      personalMonth: null,
      personalDay: null,
    };
    render(<KabalaInfoPanel kabala={nulls} lpMeaning={null} />);
    // Should render without crashing — rows with null are hidden
    expect(screen.getByText('Número de Vida — Geometria Sagrada')).toBeTruthy();
  });
});

// ── TantricBodyInfoPanel ─────────────────────────────────────────────────────

describe('TantricBodyInfoPanel', () => {
  it('renders title and subtitle', () => {
    render(
      <TantricBodyInfoPanel
        tantra={mockTantra}
        inactiveBodies={[
          { i: 2, active: false },
          { i: 5, active: false },
        ]}
      />
    );
    expect(screen.getByText('Corpo e Energia — Os 11 Corpos')).toBeTruthy();
    expect(screen.getByText('Teia de Conexão · Camada 3')).toBeTruthy();
  });

  it('renders path, soul, karma, divineGift rows', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    expect(screen.getByText('Caminho Tântrico — sua prática de integração')).toBeTruthy();
    expect(screen.getByText('Alma — essência que reencarna')).toBeTruthy();
    expect(screen.getByText('Karma — legado de ações passadas')).toBeTruthy();
    expect(screen.getByText('Dom Divino — talento espiritual a cultivar')).toBeTruthy();
  });

  it('shows insight when all bodies are active', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    expect(screen.getByText(/Todos os 11 Corpos estão ativos/)).toBeTruthy();
  });

  it('lists inactive bodies when some are inactive', () => {
    render(
      <TantricBodyInfoPanel
        tantra={mockTantra}
        inactiveBodies={[
          { i: 2, active: false },
          { i: 5, active: false },
          { i: 8, active: false },
        ]}
      />
    );
    // Should NOT show the "all active" insight
    expect(screen.queryByText(/Todos os 11 Corpos estão ativos/)).toBeNull();
  });

  it('shows advanced kosha details when showAdvanced is toggled', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    const btn = screen.getByRole('button', { name: /detalhes avançados/i });
    fireEvent.click(btn);
    // 5 koshas should be visible (PT-BR names from KOSHA_PT)
    expect(screen.getByText('Físico')).toBeTruthy();
    expect(screen.getByText('Vital')).toBeTruthy();
    expect(screen.getByText('Mental')).toBeTruthy();
  });

  it('hides koshas initially', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    expect(screen.queryByText('Físico')).toBeNull();
  });

  it('toggles koshas off when clicked again', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    const btn = screen.getByRole('button', { name: /detalhes avançados/i });
    fireEvent.click(btn);
    expect(screen.getByText('Físico')).toBeTruthy();
    fireEvent.click(btn);
    expect(screen.queryByText('Físico')).toBeNull();
  });

  it('renders with empty inactiveBodies array', () => {
    render(
      <TantricBodyInfoPanel tantra={mockTantra} inactiveBodies={[]} />
    );
    expect(screen.getByText('Corpo e Energia — Os 11 Corpos')).toBeTruthy();
  });

  it('handles null soul/karma values', () => {
    const nullTantra: MandalaData['tantra'] = {
      ...mockTantra,
      soul: null,
      karma: null,
    };
    render(
      <TantricBodyInfoPanel tantra={nullTantra} inactiveBodies={[]} />
    );
    // Should render without crashing
    expect(screen.getByText('Corpo e Energia — Os 11 Corpos')).toBeTruthy();
  });
});
