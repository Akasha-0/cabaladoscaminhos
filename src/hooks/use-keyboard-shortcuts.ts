'use client';

/**
 * useKeyboardShortcuts — global keydown handler hook (T7.2, Sprint 8)
 *
 * Binds `shortcuts` to a single window keydown listener. The listener is
 * re-bound when the shortcuts array changes, and unbound on unmount.
 *
 * Modifier semantics match platform conventions:
 *   - `ctrl: true` matches `ctrlKey` on non-Mac and `metaKey` on Mac.
 *   - `shift: true` requires `shiftKey` (no Mac translation).
 *   - `alt: true` requires `altKey`.
 *   - When a modifier flag is omitted/false, that modifier must NOT be
 *     pressed for the shortcut to fire (strict equality).
 *
 * Editable element guard: shortcuts are skipped when the event target is
 * an `<input>`, `<textarea>`, or `contentEditable` element — except for
 * Escape, which always fires (to dismiss overlays / blur inputs).
 *
 * Stops at the first matching shortcut and calls `preventDefault` by
 * default; pass `preventDefault: false` to opt out per shortcut.
 */
import { useEffect } from 'react';

export interface KeyboardShortcut {
  /** Lower- or upper-case key. Matched case-insensitively. */
  key: string;
  /**
   * Modifier flag. On non-Mac platforms matches `ctrlKey`; on Mac
   * matches `metaKey` (Cmd). True is required, false forbids.
   */
  ctrl?: boolean;
  /** True requires `shiftKey`; false forbids it. */
  shift?: boolean;
  /** True requires `altKey`; false forbids it. */
  alt?: boolean;
  /** Called with the original KeyboardEvent. */
  handler: (e: KeyboardEvent) => void;
  /** Defaults to true. Pass false to opt out of preventDefault. */
  preventDefault?: boolean;
}

const isMac = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const platform = navigator.platform ?? '';
  return /Mac|iPhone|iPad|iPod/.test(platform);
};

const isEditable = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  // jsdom doesn't keep `isContentEditable` in sync with the property
  // assignment used by the test suite, so fall back to the raw attribute.
  if (target.isContentEditable) return true;
  const ce = target.contentEditable;
  return ce === 'true' || ce === 'plaintext-only' || ce === '';
};

const matchesShortcut = (e: KeyboardEvent, shortcut: KeyboardShortcut, mac: boolean): boolean => {
  if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;

  // Escape must always pass the editable guard (handled in caller).
  const wantCtrl = !!shortcut.ctrl;
  const haveCtrlMeta = mac ? e.metaKey : e.ctrlKey;
  if (wantCtrl !== haveCtrlMeta) return false;

  if (!!shortcut.shift !== e.shiftKey) return false;
  if (!!shortcut.alt !== e.altKey) return false;

  // Reject the "wrong side" of ctrl/cmd: a Mac user pressing ctrl
  // should not fire a `ctrl: true` shortcut (cmd is canonical on Mac).
  if (mac && wantCtrl && e.ctrlKey) return false;
  if (!mac && wantCtrl && e.metaKey) return false;

  return true;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    const mac = isMac();

    const handler = (e: KeyboardEvent): void => {
      if (shortcuts.length === 0) return;

      // Editable element guard — Escape is always allowed through.
      if (e.key !== 'Escape' && isEditable(e.target)) return;

      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut, mac)) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [shortcuts]);
}
