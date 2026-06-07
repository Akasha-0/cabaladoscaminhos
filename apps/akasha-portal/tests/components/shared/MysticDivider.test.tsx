/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MysticDivider } from '@/components/shared/MysticDivider';

describe('MysticDivider', () => {
  it('renders without crashing', () => {
    const { container } = render(<MysticDivider />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with default star symbol', () => {
    const { container } = render(<MysticDivider />);
    expect(container.textContent).toContain('✦');
  });

  it('renders with diamond symbol', () => {
    const { container } = render(<MysticDivider symbol="diamond" />);
    expect(container.textContent).toContain('◆');
  });

  it('renders with custom className', () => {
    const { container } = render(<MysticDivider className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('has aria-hidden for accessibility', () => {
    const { container } = render(<MysticDivider />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeDefined();
  });
});
