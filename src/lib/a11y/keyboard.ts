/**
 * Keyboard shortcut system for accessible navigation and actions
 */

export interface Shortcut {
  /** Display label for the shortcut */
  label: string;
  /** Keyboard key (e.g., 'k', 'Escape', 'Enter') */
  key: string;
  /** Modifier keys required */
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  /** Scope where shortcut is active (undefined = global) */
  scope?: string;
  /** Handler function called when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Priority for conflict resolution (higher = wins) */
  priority?: number;
}

interface RegisteredShortcut extends Shortcut {
  id: string;
  registeredAt: number;
}

const registry = new Map<string, RegisteredShortcut>();
const scopeRegistry = new Map<string, string[]>();

/**
 * Normalizes modifier array to canonical form
 */
function normalizeModifiers(modifiers?: Shortcut['modifiers']): string[] {
  return modifiers ? modifiers.slice().sort() : [];
}

/**
 * Generates a unique key for shortcut identification
 */
function getShortcutKey(key: string, modifiers?: string[], scope?: string): string {
  const mods = normalizeModifiers(modifiers as ('ctrl' | 'alt' | 'shift' | 'meta')[]);
  return `${scope ?? 'global'}:${mods.join('+')}:${key.toLowerCase()}`;
}

/**
 * Registers a keyboard shortcut, checking for conflicts
 * @throws Error if a conflicting shortcut is already registered with higher or equal priority
 */
export function registerShortcut(shortcut: Shortcut, id?: string): string {
  const shortcutId = id ?? `${shortcut.key}-${Date.now()}`;
  const existing = registry.get(getShortcutKey(shortcut.key, shortcut.modifiers, shortcut.scope));

  if (existing) {
    const existingPriority = existing.priority ?? 0;
    const newPriority = shortcut.priority ?? 0;
    if (existingPriority >= newPriority) {
      throw new Error(
        `Shortcut conflict: "${shortcut.key}" is already registered for ` +
        `"${existing.label}"${shortcut.scope ? ` in scope "${shortcut.scope}"` : ''}`
      );
    }
    // New shortcut has higher priority, replace existing
    unregisterShortcut(shortcutId);
  }

  const registered: RegisteredShortcut = {
    ...shortcut,
    id: shortcutId,
    registeredAt: Date.now(),
  };

  registry.set(getShortcutKey(shortcut.key, shortcut.modifiers, shortcut.scope), registered);

  if (shortcut.scope) {
    if (!scopeRegistry.has(shortcut.scope)) {
      scopeRegistry.set(shortcut.scope, []);
    }
    const scopeIds = scopeRegistry.get(shortcut.scope)!;
    if (scopeIds.indexOf(shortcutId) === -1) {
      scopeIds.push(shortcutId);
    }
  }

  return shortcutId;
}

/**
 * Unregisters a keyboard shortcut by its ID
 */
export function unregisterShortcut(id: string): boolean {
  const keys = Array.from(registry.keys());
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const shortcut = registry.get(key);
    if (shortcut && shortcut.id === id) {
      registry.delete(key);
      if (shortcut.scope) {
        const scopeIds = scopeRegistry.get(shortcut.scope);
        if (scopeIds) {
          const idx = scopeIds.indexOf(id);
          if (idx !== -1) scopeIds.splice(idx, 1);
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Unregisters all shortcuts within a specific scope
 */
export function unregisterScope(scope: string): void {
  const ids = scopeRegistry.get(scope);
  if (ids) {
    for (let i = 0; i < ids.length; i++) {
      unregisterShortcut(ids[i]);
    }
    scopeRegistry.delete(scope);
  }
}

/**
 * Gets all registered shortcuts, optionally filtered by scope
 */
export function getRegisteredShortcuts(scope?: string): Shortcut[] {
  const shortcuts: Shortcut[] = [];
  const values = Array.from(registry.values());
  for (let i = 0; i < values.length; i++) {
    const shortcut = values[i];
    if (!scope || shortcut.scope === scope) {
      shortcuts.push({
        label: shortcut.label,
        key: shortcut.key,
        modifiers: shortcut.modifiers,
        scope: shortcut.scope,
        handler: shortcut.handler,
        preventDefault: shortcut.preventDefault,
        priority: shortcut.priority,
      });
    }
  }
  return shortcuts;
}

/**
 * Core handler for keyboard events
 */
function handleKeyDown(event: KeyboardEvent, activeScope?: string): void {
  // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
  const target = event.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
    // Allow Escape to blur regardless
    if (event.key !== 'Escape') return;
  }

  // Build modifier state
  const modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[] = [];
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');

  // Check active scope shortcuts first (higher priority)
  if (activeScope) {
    const scopeIds = scopeRegistry.get(activeScope);
    if (scopeIds) {
      for (let i = 0; i < scopeIds.length; i++) {
        const id = scopeIds[i];
        const values = Array.from(registry.values());
        for (let j = 0; j < values.length; j++) {
          const shortcut = values[j];
          if (shortcut.id === id && shortcut.scope === activeScope) {
            const key = getShortcutKey(event.key, modifiers, activeScope);
            const existing = registry.get(key);
            if (existing && existing.id === id) {
              if (shortcut.preventDefault !== false) {
                event.preventDefault();
              }
              shortcut.handler(event);
              return;
            }
          }
        }
      }
    }
  }

  // Fall back to global shortcuts
  const globalKey = getShortcutKey(event.key, modifiers);
  const values = Array.from(registry.values());
  for (let i = 0; i < values.length; i++) {
    const shortcut = values[i];
    if (!shortcut.scope) {
      const key = getShortcutKey(shortcut.key, shortcut.modifiers);
      if (key === globalKey) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler(event);
        return;
      }
    }
  }
}

// Store active listeners for cleanup
const activeListeners = new Map<string, (event: KeyboardEvent) => void>();

/**
 * React hook for managing keyboard shortcuts
 * Registers global listener on mount, cleans up on unmount
 */
export function useKeyboardShortcuts(activeScope?: string): {
  register: (shortcut: Shortcut, id?: string) => string;
  unregister: (id: string) => boolean;
  unregisterScope: (scope: string) => void;
  shortcuts: Shortcut[];
} {
  const scopeKey = activeScope ?? 'global';

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    handleKeyDown(event, activeScope);
  };

  // Attach listener on first render
  if (typeof window !== 'undefined') {
    // Remove any existing listener for this scope
    const existing = activeListeners.get(scopeKey);
    if (existing) {
      window.removeEventListener('keydown', existing);
    }
    window.addEventListener('keydown', handleKeyDownEvent);
    activeListeners.set(scopeKey, handleKeyDownEvent);
  }

  // Return cleanup and registration functions
  return {
    register: (shortcut: Shortcut, id?: string) => registerShortcut(shortcut, id),
    unregister: unregisterShortcut,
    unregisterScope,
    shortcuts: getRegisteredShortcuts(activeScope),
  };
}
