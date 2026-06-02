import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  const triggerKeydown = (
    key: string,
    options: Partial<KeyboardEventInit> & { target?: EventTarget } = {}
  ): KeyboardEvent => {
    const { target, ...eventOptions } = options;
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...eventOptions,
    });
    // Set the target if provided (needed for editable element tests)
    if (target) {
      Object.defineProperty(event, 'target', {
        value: target,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
    if (keydownHandler) {
      keydownHandler(event);
    }
    return event;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    // Capture the handler for manual invocation
    addEventListenerSpy.mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (e: KeyboardEvent) => void;
      }
      return undefined;
    });
  });

  afterEach(() => {
    keydownHandler = null;
    vi.restoreAllMocks();
  });

  describe('registration', () => {
    it('registers keydown listener on mount', () => {
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler: vi.fn() }])
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes keydown listener on unmount', () => {
      const handler = vi.fn();
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('updates listener when shortcuts change', () => {
      const shortcuts1 = [{ key: 'a', handler: vi.fn() }];
      const shortcuts2 = [{ key: 'b', handler: vi.fn() }];

      const { rerender } = renderHook(
        ({ shortcuts }: { shortcuts: KeyboardShortcut[] }) =>
          useKeyboardShortcuts(shortcuts),
        { initialProps: { shortcuts: shortcuts1 } }
      );

      const callsBefore = addEventListenerSpy.mock.calls.length;
      rerender({ shortcuts: shortcuts2 });
      expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe('matchesShortcut', () => {
    describe('key matching', () => {
      it('matches exact key case-insensitively', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', handler }])
        );
        triggerKeydown('K');
        expect(handler).toHaveBeenCalledTimes(1);
        triggerKeydown('k');
        expect(handler).toHaveBeenCalledTimes(2);
      });

      it('does not match different keys', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'a', handler }])
        );
        triggerKeydown('b');
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe('ctrl/cmd modifier', () => {
      it('matches ctrl key on non-Mac', () => {
        const handler = vi.fn();
        vi.stubGlobal('navigator', { platform: 'Win32' });
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, handler }])
        );
        triggerKeydown('k', { ctrlKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
        vi.restoreAllMocks();
      });

      it('matches meta key (Cmd) on Mac', () => {
        const handler = vi.fn();
        vi.stubGlobal('navigator', { platform: 'MacIntel' });
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, handler }])
        );
        triggerKeydown('k', { metaKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
        vi.restoreAllMocks();
      });

      it('does not match when ctrl not pressed but required', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, handler }])
        );
        triggerKeydown('k');
        expect(handler).not.toHaveBeenCalled();
      });

      it('does not match when ctrl pressed but not required', () => {
        vi.stubGlobal('navigator', { platform: 'Win32' });
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', handler }])
        );
        triggerKeydown('k', { ctrlKey: true });
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe('shift modifier', () => {
      it('matches when shift required and pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: '?', shift: true, handler }])
        );
        triggerKeydown('?', { shiftKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('does not match when shift required but not pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: '?', shift: true, handler }])
        );
        triggerKeydown('?');
        expect(handler).not.toHaveBeenCalled();
      });

      it('does not match when shift not required but pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'a', handler }])
        );
        triggerKeydown('a', { shiftKey: true });
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe('alt modifier', () => {
      it('matches when alt required and pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'a', alt: true, handler }])
        );
        triggerKeydown('a', { altKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('does not match when alt required but not pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'a', alt: true, handler }])
        );
        triggerKeydown('a');
        expect(handler).not.toHaveBeenCalled();
      });

      it('does not match when alt not required but pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'a', handler }])
        );
        triggerKeydown('a', { altKey: true });
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe('multiple modifiers', () => {
      it('matches ctrl+shift combination', () => {
        const handler = vi.fn();
        vi.stubGlobal('navigator', { platform: 'Win32' });
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, shift: true, handler }])
        );
        triggerKeydown('k', { ctrlKey: true, shiftKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
        vi.restoreAllMocks();
      });

      it('matches ctrl+alt combination', () => {
        const handler = vi.fn();
        vi.stubGlobal('navigator', { platform: 'Win32' });
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, alt: true, handler }])
        );
        triggerKeydown('k', { ctrlKey: true, altKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
        vi.restoreAllMocks();
      });

      it('does not match partial modifier combination', () => {
        const handler = vi.fn();
        vi.stubGlobal('navigator', { platform: 'Win32' });
        renderHook(() =>
          useKeyboardShortcuts([{ key: 'k', ctrl: true, shift: true, handler }])
        );
        triggerKeydown('k', { ctrlKey: true });
        expect(handler).not.toHaveBeenCalled();
        vi.restoreAllMocks();
      });
    });
  });

  describe('editable element guard', () => {
    it('does not trigger shortcuts in INPUT elements except Escape', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );

      const input = document.createElement('input');
      document.body.appendChild(input);

      triggerKeydown('a', { target: input });
      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('does not trigger shortcuts in TEXTAREA elements except Escape', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      triggerKeydown('a', { target: textarea });
      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('does not trigger shortcuts in contentEditable elements except Escape', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);

      triggerKeydown('a', { target: div });
      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });

    it('still triggers shortcuts in INPUT when key is Escape', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'Escape', handler }])
      );

      const input = document.createElement('input');
      document.body.appendChild(input);

      triggerKeydown('Escape', { target: input });
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });

    it('still triggers shortcuts in TEXTAREA when key is Escape', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'Escape', handler }])
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      triggerKeydown('Escape', { target: textarea });
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(textarea);
    });

    it('triggers shortcuts when focus is on non-editable element', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );

      const div = document.createElement('div');
      document.body.appendChild(div);

      triggerKeydown('a', { target: div });
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(div);
    });
  });

  describe('handler execution', () => {
    it('calls handler with KeyboardEvent', () => {
      let receivedEvent: KeyboardEvent | null = null;
      renderHook(() =>
        useKeyboardShortcuts([{
          key: 'a',
          handler: (e) => { receivedEvent = e; }
        }])
      );
      triggerKeydown('a');
      expect(receivedEvent).toBeInstanceOf(KeyboardEvent);
    });

    it('stops after first matching shortcut', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'a', handler: handler1 },
          { key: 'a', handler: handler2 },
        ])
      );
      triggerKeydown('a');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('respects preventDefault: false option', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler, preventDefault: false }])
      );
      const event = triggerKeydown('a');
      expect(event.defaultPrevented).toBe(false);
    });

    it('calls preventDefault by default', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler }])
      );
      const event = triggerKeydown('a');
      expect(event.defaultPrevented).toBe(true);
    });

    it('calls preventDefault when explicitly true', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'a', handler, preventDefault: true }])
      );
      const event = triggerKeydown('a');
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('canonical shortcuts coverage', () => {
    it('supports Ctrl/Cmd+K for search (canonical)', () => {
      const handler = vi.fn();
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', ctrl: true, handler }])
      );
      triggerKeydown('k', { metaKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
      vi.restoreAllMocks();
    });

    it('supports Ctrl/Cmd+N for new consulente (canonical)', () => {
      const handler = vi.fn();
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'n', ctrl: true, handler }])
      );
      triggerKeydown('n', { metaKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
      vi.restoreAllMocks();
    });

    it('supports Ctrl/Cmd+S for save (canonical)', () => {
      const handler = vi.fn();
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
      renderHook(() =>
        useKeyboardShortcuts([{ key: 's', ctrl: true, handler }])
      );
      triggerKeydown('s', { metaKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
      vi.restoreAllMocks();
    });

    it('supports Escape for close (canonical)', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'Escape', handler }])
      );
      triggerKeydown('Escape');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('supports Shift+? for help (canonical)', () => {
      const handler = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: '?', shift: true, handler }])
      );
      triggerKeydown('?', { shiftKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty shortcuts array', () => {
    it('registers listener with no shortcuts', () => {
      renderHook(() => useKeyboardShortcuts([]));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('does not call any handler with empty shortcuts', () => {
      renderHook(() => useKeyboardShortcuts([]));
      triggerKeydown('a');
      // No error thrown
    });
  });
});
