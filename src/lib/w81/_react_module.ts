// ============================================================================
// W81-B — react module shim (path-mapped to runtime react import)
// ----------------------------------------------------------------------------
// Re-export runtime helpers from _vnode_recorder. Type definitions live in
// react-stubs.d.ts (which uses `declare module 'react'`) and are picked up
// automatically via tsconfig include.
// ============================================================================

// Fragment is declared in react-stubs.d.ts (declare module 'react') and
// also in _vnode_recorder.ts as a runtime symbol — the same `Fragment`
// name would conflict in this re-export. Skip Fragment from the re-export;
// consumers should import it directly from the `react` module stub.
export {
  createElement,
  useState,
  useEffect,
  useMemo,
  useId,
  useRef,
  useCallback,
} from './_vnode_recorder.ts';