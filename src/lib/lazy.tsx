'use client';

import { ComponentType, lazy as reactLazy, Suspense, ReactNode } from 'react';

/**
 * Lazy load a module and return the default export as a React component.
 * Use this for heavy components that are not needed on initial render.
 */
 
export function lazyImport<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = reactLazy(importer);
   
  const LazyWrapper = (props: React.ComponentProps<T> & { fallback?: ReactNode; children?: ReactNode }) => {
    const { fallback: _fallback, ...componentProps } = props;
    return (
      <Suspense fallback={fallback ?? _fallback ?? null}>
        { }
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    );
  };
  LazyWrapper.displayName = 'lazyImport';
  return LazyWrapper;
}

/**
 * Higher-order component that lazy-loads a component with Suspense.
 * Returns a component that renders the imported component inside a Suspense boundary.
 */
 
export function LazyComponent<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  fallback?: ReactNode
): ComponentType<Omit<React.ComponentProps<T>, 'children'>> {
  const LazyTheComponent = reactLazy(importer);
   
  const LazyWrapper = (props: Omit<React.ComponentProps<T>, 'children'>) => (
    <Suspense fallback={fallback ?? null}>
      { }
      <LazyTheComponent {...(props as any)} />
    </Suspense>
  );
  LazyWrapper.displayName = 'LazyComponent';
  return LazyWrapper;
}

export default { lazyImport, LazyComponent };