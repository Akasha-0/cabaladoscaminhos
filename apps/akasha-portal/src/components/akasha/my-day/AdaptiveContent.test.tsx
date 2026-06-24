/**
 * @akasha/portal — AdaptiveContent dispatcher tests
 *
 * Wave 9.1 One-Screen Hub. The router picks the right view based on state.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdaptiveContent } from './AdaptiveContent';

const noData = null;
const loading = false;

describe('AdaptiveContent', () => {
  it('centrado → CentradoView', () => {
    render(<AdaptiveContent state="centrado" locale="pt-BR" data={noData} loading={loading} />);
    expect(screen.getByTestId('centrado-view')).toBeInTheDocument();
  });

  it('ansioso → AnsiosoView', () => {
    render(<AdaptiveContent state="ansioso" locale="pt-BR" data={noData} loading={loading} />);
    expect(screen.getByTestId('ansioso-view')).toBeInTheDocument();
  });

  it('perdido → PerdidoView', () => {
    render(<AdaptiveContent state="perdido" locale="pt-BR" data={noData} loading={loading} />);
    expect(screen.getByTestId('perdido-view')).toBeInTheDocument();
  });

  it('curioso → CuriosoView', () => {
    render(<AdaptiveContent state="curioso" locale="pt-BR" data={noData} loading={loading} />);
    expect(screen.getByTestId('curioso-view')).toBeInTheDocument();
  });

  it('wrapper carries data-state attribute for analytics', () => {
    const { container } = render(
      <AdaptiveContent state="ansioso" locale="pt-BR" data={noData} loading={loading} />
    );
    const wrapper = container.querySelector('[data-state="ansioso"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('data-testid', 'adaptive-content');
  });
});