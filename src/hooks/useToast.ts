import { useCallback } from 'react';

// fallow-ignore-next-line unused-files
export function useToast() {
  const toast = useCallback((opts: { title?: string; description?: string; variant?: string }) => {
    console.log('[toast]', opts.title, opts.description);
  }, []);
  return { toast };
}
