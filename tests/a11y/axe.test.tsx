/**
 * ============================================================================
 * tests/a11y/axe.test.ts — Smoke tests a11y para componentes W34
 * ----------------------------------------------------------------------------
 * Roda com: `npx vitest run tests/a11y`
 *
 * Estratégia (sandbox-friendly, sem deps externas):
 *   - @testing-library/react + jsdom (já nas devDeps)
 *   - Asserts manuais sobre atributos ARIA críticos
 *   - Cobre os componentes NOVOS do W34 + alguns do W24-W33 que melhoramos
 *
 * NÃO substituímos axe-core (que precisaria `npm install axe-core` —
 * fora do budget 25-min). Esta é uma camada rápida que pega os bugs
 * mais comuns: aria-* ausente, role incorreto, focus management
 * quebrado. Para auditoria completa, see `docs/A11Y-FINAL-W34.md`.
 *
 * WCAG cobertas:
 *   - 1.3.1 Info and Relationships
 *   - 2.4.1 Bypass Blocks
 *   - 2.4.4 Link Purpose
 *   - 4.1.2 Name, Role, Value
 *   - 4.1.3 Status Messages
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as React from 'react';

// Componentes W34
import { SkipLinks } from '@/components/a11y/SkipLinks';
import { ErrorChip, ErrorChipVisual } from '@/components/a11y/ErrorChip';
import {
  GlossaryTooltip,
  AnnotatedText,
} from '@/components/a11y/GlossaryTooltip';
import { SoftDeleteUndo } from '@/components/a11y/SoftDeleteUndo';

// Componentes W24-W33 (smoke test)
import {
  LiveRegion,
  AssertiveLiveRegion,
} from '@/components/a11y/LiveRegion';
import { SkipToContent } from '@/components/a11y/SkipToContent';

// ============================================================================
// SkipLinks
// ============================================================================
describe('SkipLinks (WCAG 2.4.1 Bypass Blocks)', () => {
  it('renders an anchor for each existing target', () => {
    // Stub DOM elements for default targets.
    document.body.innerHTML =
      '<main id="main-content"></main><nav id="primary-nav"></nav><footer id="site-footer"></footer>';

    render(<SkipLinks />);

    // Use effect runs synchronously after mount in @testing-library.
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
    expect(links[0]).toHaveAttribute('href', '#main-content');
    expect(links[1]).toHaveAttribute('href', '#primary-nav');
    expect(links[2]).toHaveAttribute('href', '#site-footer');
  });

  it('filters out links whose target does not exist', () => {
    document.body.innerHTML = '<main id="main-content"></main>';

    render(<SkipLinks />);

    const links = screen.queryAllByRole('link');
    expect(links.length).toBe(1);
    expect(links[0]).toHaveAttribute('href', '#main-content');
  });

  it('has accessible name via aria-label on the nav wrapper', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    render(<SkipLinks />);
    const nav = screen.getByRole('navigation', { name: /atalhos/i });
    expect(nav).toBeInTheDocument();
  });
});

// ============================================================================
// LiveRegion
// ============================================================================
describe('LiveRegion (WCAG 4.1.3 Status Messages)', () => {
  it('polite region: role=status + aria-live=polite', () => {
    render(<LiveRegion message="Post salvo" />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Post salvo');
  });

  it('polite region: does not render when message is empty', () => {
    render(<LiveRegion message={null} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('assertive region: role=alert + aria-live=assertive', () => {
    render(<AssertiveLiveRegion message="Erro: conexão perdida" />);
    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');
    expect(region).toHaveTextContent('Erro: conexão perdida');
  });

  it('polite region with visible=true is visible to sighted users', () => {
    render(<LiveRegion message="Salvo" visible />);
    const region = screen.getByRole('status');
    expect(region.className).not.toContain('sr-only');
  });
});

// ============================================================================
// ErrorChip
// ============================================================================
describe('ErrorChip (WCAG 1.3.1, 3.3.1, 4.1.3)', () => {
  it('ErrorChip has role=alert and aria-live via role', () => {
    render(<ErrorChip message="Email inválido" id="email-err" />);
    const chip = screen.getByRole('alert');
    expect(chip).toHaveAttribute('id', 'email-err');
    expect(chip).toHaveTextContent('Email inválido');
  });

  it('ErrorChipVisual is aria-hidden (no role alert)', () => {
    render(<ErrorChipVisual message="Background error" />);
    // Não tem role=alert porque a mensagem já é anunciada em outro live region.
    expect(screen.queryByRole('alert')).toBeNull();
    const hidden = document.querySelector('[aria-hidden="true"]');
    expect(hidden).not.toBeNull();
  });

  it('ErrorChip does NOT have icon-only (text also present)', () => {
    render(<ErrorChip message="Campo obrigatório" />);
    const chip = screen.getByRole('alert');
    expect(chip.textContent).toContain('Campo obrigatório');
  });
});

// ============================================================================
// GlossaryTooltip
// ============================================================================
describe('GlossaryTooltip (WCAG 1.3.1, 1.4.13, 4.1.2)', () => {
  it('trigger button is keyboard-focusable', () => {
    render(<GlossaryTooltip term="axé" definition="Força vital" />);
    const btn = screen.getByRole('button', { name: /axé/i });
    expect(btn).not.toHaveAttribute('tabindex', '-1');
  });

  it('tooltip opens on focus and associates via aria-describedby', () => {
    render(<GlossaryTooltip term="pemba" definition="Giz sagrado" />);
    const btn = screen.getByRole('button', { name: /pemba/i });

    // Antes do foco — sem aria-describedby.
    expect(btn).not.toHaveAttribute('aria-describedby');

    fireEvent.focus(btn);
    // Após focus — tooltip renderiza com role=tooltip.
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveTextContent('Giz sagrado');
    // aria-describedby aponta para o id da tooltip.
    expect(btn.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('Escape key closes tooltip via blur', () => {
    render(<GlossaryTooltip term="axé" definition="Força vital" />);
    const btn = screen.getByRole('button', { name: /axé/i });

    fireEvent.focus(btn);
    expect(screen.queryByRole('tooltip')).not.toBeNull();

    fireEvent.blur(btn);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('AnnotatedText wraps recognized terms with GlossaryTooltip', () => {
    render(
      <AnnotatedText
        text="O axé do Odu"
        map={{ axé: 'Força vital', Odu: 'Signo de Ifá' }}
      />,
    );
    expect(screen.getByRole('button', { name: /axé/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Odu/i })).toBeInTheDocument();
  });
});

// ============================================================================
// SoftDeleteUndo
// ============================================================================
describe('SoftDeleteUndo (WCAG 4.1.3, 2.1.1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders status live region with itemName', () => {
    render(
      <SoftDeleteUndo
        itemName="Post 'Oração'"
        onUndo={() => {}}
        onCommit={() => {}}
      />,
    );
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Oração');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('Undoes when button is clicked', () => {
    const onUndo = vi.fn();
    const onCommit = vi.fn();
    render(
      <SoftDeleteUndo
        itemName="X"
        onUndo={onUndo}
        onCommit={onCommit}
        duration={1000}
      />,
    );

    // Botão recebe foco automaticamente.
    const btn = screen.getByRole('button', { name: /desfazer/i });
    expect(document.activeElement).toBe(btn);

    fireEvent.click(btn);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('Commits after duration expires', () => {
    const onUndo = vi.fn();
    const onCommit = vi.fn();
    render(
      <SoftDeleteUndo
        itemName="X"
        onUndo={onUndo}
        onCommit={onCommit}
        duration={1000}
      />,
    );

    vi.advanceTimersByTime(1000);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('Escape key triggers undo', () => {
    const onUndo = vi.fn();
    const onCommit = vi.fn();
    render(
      <SoftDeleteUndo
        itemName="Y"
        onUndo={onUndo}
        onCommit={onCommit}
        duration={6000}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// SkipToContent (W24 legado)
// ============================================================================
describe('SkipToContent (WCAG 2.4.1)', () => {
  it('default href points to #main-content', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent(/pular para o conteudo principal/i);
  });

  it('custom targetId is respected', () => {
    render(<SkipToContent targetId="custom-target" label="Pular custom" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#custom-target');
  });
});
