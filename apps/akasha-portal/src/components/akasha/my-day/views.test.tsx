/**
 * @akasha/portal — view smoke tests
 *
 * Wave 9.1 One-Screen Hub. Each view renders its testid and the core
 * affordances. We don't assert on copy (PT-BR may change) — only on
 * structural data-testids and accessibility roles.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CentradoView } from './centrado/CentradoView';
import { AnsiosoView } from './ansioso/AnsiosoView';
import { PerdidoView } from './perdido/PerdidoView';
import { CuriosoView } from './curioso/CuriosoView';

describe('CentradoView', () => {
  it('renders the centred view wrapper', () => {
    render(<CentradoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('centrado-view')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    render(<CentradoView locale="pt-BR" data={null} loading={true} />);
    expect(screen.getByTestId('centrado-loading')).toBeInTheDocument();
  });

  it('shows fallback when nothing is provided', () => {
    render(<CentradoView locale="pt-BR" data={null} loading={false} />);
    // Fallback paragraph present
    expect(screen.getByText(/silencioso hoje/i)).toBeInTheDocument();
  });
});

describe('AnsiosoView', () => {
  it('renders the anxious view + breath orb', () => {
    render(<AnsiosoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('ansioso-view')).toBeInTheDocument();
    expect(screen.getByTestId('breath-orb')).toBeInTheDocument();
  });

  it('shows the start-breath button (paused=true initially)', () => {
    render(<AnsiosoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('ansioso-start-breath')).toBeInTheDocument();
  });

  it('Mentor link points to /diario with intencao=ansiedade', () => {
    render(<AnsiosoView locale="pt-BR" data={null} loading={false} />);
    const link = screen.getByTestId('ansioso-mentor-link');
    expect(link).toHaveAttribute('href', '/pt-BR/diario?intencao=ansiedade');
  });
});

describe('PerdidoView', () => {
  it('renders the lost view + mini mandala', () => {
    render(<PerdidoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('perdido-view')).toBeInTheDocument();
    expect(screen.getByTestId('perdido-mini-mandala')).toBeInTheDocument();
  });

  it('shows the three practice cards (silence + write)', () => {
    render(<PerdidoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('perdido-practice-silence')).toBeInTheDocument();
    expect(screen.getByTestId('perdido-practice-write')).toBeInTheDocument();
  });

  it('Mentor link uses intencao=perdido', () => {
    render(<PerdidoView locale="pt-BR" data={null} loading={false} />);
    const link = screen.getByTestId('perdido-mentor-link');
    expect(link).toHaveAttribute('href', '/pt-BR/diario?intencao=perdido');
  });
});

describe('CuriosoView', () => {
  it('renders all 5 pilar cards', () => {
    render(<CuriosoView locale="pt-BR" data={null} loading={false} />);
    for (const pilar of ['cabala', 'astrologia', 'tantra', 'odu', 'iching']) {
      expect(screen.getByTestId(`curioso-pilar-${pilar}`)).toBeInTheDocument();
    }
  });

  it('links to /mandala with the correct layer param', () => {
    render(<CuriosoView locale="pt-BR" data={null} loading={false} />);
    expect(screen.getByTestId('curioso-pilar-cabala')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=2'
    );
    expect(screen.getByTestId('curioso-pilar-iching')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=5'
    );
  });
});