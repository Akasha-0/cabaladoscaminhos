// tests/cockpit/consultation/UserBubble.test.tsx
// Tests for UserBubble — user message bubble (Doc 12 §8, laranja, right-aligned).

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UserBubble } from '@/components/cockpit/consultation/UserBubble';

beforeEach(cleanup);

describe('UserBubble', () => {
  it('renders the message content', () => {
    render(<UserBubble content="E quanto à minha vida amorosa?" />);
    expect(screen.getByText('E quanto à minha vida amorosa?')).toBeInTheDocument();
  });

  it('is right-aligned via flex justify-end on outer wrapper', () => {
    const { container } = render(<UserBubble content="Teste" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('applies orange text color via CSS variable class', () => {
    const { container } = render(<UserBubble content="Teste" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="ramiro-orange"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
  });

  it('applies max-width 80% on inner bubble div', () => {
    const { container } = render(<UserBubble content="Teste" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="max-w"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
    expect(bubble.className).toContain('max-w-[80%]');
  });

  it('has aria-label for accessibility', () => {
    render(<UserBubble content="Teste" />);
    // Use getAllByRole since multiple bubbles may be in document from prior tests
    const wrappers = screen.getAllByRole('listitem');
    const last = wrappers[wrappers.length - 1];
    expect(last.getAttribute('aria-label')).toBe('Sua mensagem');
  });

  it('handles multi-line messages', () => {
    const multiLine = 'Linha um\nLinha dois\nLinha três';
    render(<UserBubble content={multiLine} />);
    expect(screen.getByText(/Linha um/)).toBeInTheDocument();
  });

  it('renders orange rounded bubble shape', () => {
    const { container } = render(<UserBubble content="Teste" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="rounded-2xl"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
    expect(bubble.className).toContain('rounded-tr-sm'); // top-right corner rounded
  });
});
