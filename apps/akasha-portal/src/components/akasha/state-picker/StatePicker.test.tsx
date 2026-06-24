/**
 * @akasha/portal — StatePicker component tests
 *
 * Wave 9.1 One-Screen Hub. Renders 4 tiles, fires onSelect with the
 * correct enum, and has the accessibility wiring (radiogroup).
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StatePicker } from './StatePicker';

describe('StatePicker', () => {
  it('renders 4 tiles for the 4 emotional states', () => {
    render(<StatePicker onSelect={() => {}} />);
    for (const state of ['centrado', 'ansioso', 'perdido', 'curioso'] as const) {
      expect(
        screen.getByTestId(`state-picker-tile-${state}`)
      ).toBeInTheDocument();
    }
  });

  it('has role=radiogroup with aria-label', () => {
    render(<StatePicker onSelect={() => {}} heading="Como você está?" />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-label', 'Como você está?');
  });

  it('each tile is a radio with aria-checked=false initially', () => {
    render(<StatePicker onSelect={() => {}} />);
    const tiles = screen.getAllByRole('radio');
    expect(tiles).toHaveLength(4);
    for (const tile of tiles) {
      expect(tile).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('calls onSelect with the enum when a tile is clicked', () => {
    const onSelect = vi.fn();
    render(<StatePicker onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('state-picker-tile-ansioso'));
    expect(onSelect).toHaveBeenCalledWith('ansioso');

    fireEvent.click(screen.getByTestId('state-picker-tile-curioso'));
    expect(onSelect).toHaveBeenLastCalledWith('curioso');
  });

  it('renders the skip button when onSkip is provided', () => {
    render(<StatePicker onSelect={() => {}} onSkip={() => {}} />);
    expect(screen.getByTestId('state-picker-skip')).toBeInTheDocument();
  });

  it('omits the skip button when onSkip is not provided', () => {
    render(<StatePicker onSelect={() => {}} />);
    expect(screen.queryByTestId('state-picker-skip')).toBeNull();
  });

  it('skip button calls onSkip', () => {
    const onSkip = vi.fn();
    render(<StatePicker onSelect={() => {}} onSkip={onSkip} />);
    fireEvent.click(screen.getByTestId('state-picker-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});