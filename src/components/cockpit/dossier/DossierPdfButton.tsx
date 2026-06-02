// src/components/cockpit/dossier/DossierPdfButton.tsx
// Botão "Exportar PDF" — integrado no header da página de dossiê.
// Cliente: chama /api/mesa-real/pdf, depois jsPDF no browser.
'use client';

import { Download, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { generateDossierPDF, type DossierPdfData } from '@/lib/pdf/dossier-pdf';

interface DossierPdfButtonProps {
  readingId: string;
}

export function DossierPdfButton({ readingId }: DossierPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mesa-real/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const pdfData: DossierPdfData = await res.json();
      generateDossierPDF(pdfData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  }, [readingId, loading]);

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-400 hidden sm:inline">{error}</span>
      )}
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Exportar dossiê como PDF"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{loading ? 'Gerando…' : 'Exportar PDF'}</span>
      </button>
    </div>
  );
}
