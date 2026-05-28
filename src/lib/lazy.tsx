'use client';

import { ComponentType, lazy as reactLazy, Suspense, ReactNode } from 'react';

/**
 * Lazy load a module and return the default export as a React component.
 * Use this for heavy components that are not needed on initial render.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyImport<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = reactLazy(importer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (props: React.ComponentProps<T> & { fallback?: ReactNode; children?: ReactNode }) => (
    <Suspense fallback={fallback ?? props.fallback ?? null}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Higher-order component that lazy-loads a component with Suspense.
 * Returns a component that renders the imported component inside a Suspense boundary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LazyComponent<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  fallback?: ReactNode
): ComponentType<Omit<React.ComponentProps<T>, 'children'>> {
  const LazyComponent = reactLazy(importer);
  return (props: Omit<React.ComponentProps<T>, 'children'>) => (
    <Suspense fallback={fallback ?? null}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export default { lazyImport, LazyComponent };