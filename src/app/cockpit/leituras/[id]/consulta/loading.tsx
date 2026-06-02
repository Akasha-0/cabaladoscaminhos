/**
 * loading.tsx — Skeleton de loading para /cockpit/leituras/[id]/consulta
 * (Tela do Oráculo). Aparece automaticamente durante Suspense boundaries
 * enquanto a página carrega dados do RAG/DB.
 *
 * Refs: T7.1 (Sprint 8 UX), docs/05_uiux-spec.md, docs/13_identidade-ramiro-design-v2.md
 */
import { LoadingOrbital } from '@/components/cockpit/dossier/LoadingOrbital';

export default function ConsultaLoading(): JSX.Element {
  return (
    <div className="ramiro min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
      <LoadingOrbital />
      <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse">
        Consultando o Oráculo…
      </p>
    </div>
  );
}
