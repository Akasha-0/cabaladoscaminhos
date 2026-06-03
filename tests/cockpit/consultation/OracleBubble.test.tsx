// tests/cockpit/consultation/OracleBubble.test.tsx
// Tests for OracleBubble — oracle response bubble (Doc 12 §8, royal, left-aligned, streaming).

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { OracleBubble } from '@/components/cockpit/consultation/OracleBubble';

beforeEach(cleanup);

describe('OracleBubble', () => {
  it('renders the message content', () => {
    render(<OracleBubble content="O oráculo revela que Vênus está favorecendo suas finanças." />);
    expect(screen.getByText(/oráculo revela/)).toBeInTheDocument();
  });

  it('renders Sparkles SVG icon inside the avatar circle', () => {
    render(<OracleBubble content="Resposta" />);
    const iconSvg = document.querySelector('.lucide-sparkles');
    expect(iconSvg).toBeInTheDocument();
  });

  it('is left-aligned via flex justify-start on outer wrapper', () => {
    const { container } = render(<OracleBubble content="Resposta" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });

  it('applies royal background via class', () => {
    const { container } = render(<OracleBubble content="Resposta" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="ramiro-royal"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
  });

  it('shows pending state with pulsing text when pending=true and no content', () => {
    render(<OracleBubble content="" pending={true} />);
    expect(screen.getByText('Consultando os oráculos…')).toBeInTheDocument();
    const p = screen.getByText('Consultando os oráculos…');
    expect(p.className).toContain('animate-pulse');
  });

  it('does NOT show pending pulse when content is present even if pending=true', () => {
    render(<OracleBubble content="Resposta" pending={true} />);
    expect(screen.queryByText('Consultando os oráculos…')).not.toBeInTheDocument();
  });

  it('does NOT show pending pulse when pending=false and content exists', () => {
    render(<OracleBubble content="Resposta" pending={false} />);
    expect(screen.queryByText('Consultando os oráculos…')).not.toBeInTheDocument();
  });

  it('shows streaming cursor span when pending and has content', () => {
    const { container } = render(<OracleBubble content="Resposta parcial" pending={true} />);
    const cursors = container.querySelectorAll('[class*="inline-block"]');
    expect(cursors.length).toBeGreaterThan(0);
    const cursor = Array.from(cursors).find((el) =>
      el.className.includes('animate-pulse') && el.className.includes('h-')
    );
    expect(cursor).toBeInTheDocument();
  });

  it('does not show streaming cursor when not pending', () => {
    const { container } = render(<OracleBubble content="Resposta" pending={false} />);
    const cursors = container.querySelectorAll('[class*="inline-block"]');
    const pulsingCursors = Array.from(cursors).filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(pulsingCursors.length).toBe(0);
  });

  it('applies max-width 80% to inner bubble', () => {
    const { container } = render(<OracleBubble content="Resposta" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="max-w-[80%]"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
  });

  it('uses royal royal border on bubble', () => {
    const { container } = render(<OracleBubble content="Resposta" />);
    const wrapper = container.firstChild as HTMLElement;
    const bubble = wrapper.querySelector('[class*="border"]') as HTMLElement;
    expect(bubble).toBeInTheDocument();
    expect(bubble.className).toContain('border');
  });
});
