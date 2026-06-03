import { useCallback } from 'react';

export function useToast() {
export function useToast() {
  const toast = useCallback((opts: { title?: string; description?: string; variant?: string }) => {
    console.log('[toast]', opts.title, opts.description);
  }, []);
  return { toast };
}
