'use client';

/**
 * MandalaNarrativeLoader — busca síntese daily no cliente
 * (a API usa cookie de sessão, não token no header)
 */
import { useState, useEffect } from 'react';
import { MandalaNarrative } from './MandalaNarrative';

interface MandalaNarrativeLoaderProps {
  locale: string;
}

export function MandalaNarrativeLoader({ locale }: MandalaNarrativeLoaderProps) {
  const [synthesis, setSynthesis] = useState<Parameters<typeof MandalaNarrative>[0]['synthesis']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/akasha/daily`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.synthesis) {
          // F-232: flatten synthesizedProfile.narrativaCentral for MandalaNarrative
          const s = json.synthesis;
          if (s?.synthesizedProfile?.narrativaCentral != null) {
            s.narrativaCentral = s.synthesizedProfile.narrativaCentral;
          }
          setSynthesis(s);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return <MandalaNarrative synthesis={synthesis} loading={loading} locale={locale} />;
}
