// ============================================================================
// W93-D — CALENDAR EXPORT (download .ics)
// ----------------------------------------------------------------------------
// Botão que gera string .ics client-side e dispara download.
//
// O conteúdo é gerado server-side e passado via prop (filename + content)
// OU gerado client-side a partir de um eventId chamando endpoint.
//
// Padrão usado aqui: prop `icsContent` + `filename`. O parent decide
// se gera no server (preferred, mais rápido) ou client.
// ============================================================================

'use client';

import { useState } from 'react';
import { Calendar, Download, Check, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarExportProps {
  /** Conteúdo do arquivo .ics (CRLF-terminated). */
  icsContent: string;
  /** Nome do arquivo (default: evento-{slug}.ics). */
  filename: string;
  /** Label do botão */
  label?: string;
  /** Variante */
  variant?: 'default' | 'outline' | 'ghost' | 'golden';
  fullWidth?: boolean;
  className?: string;
}

type ExportState = 'idle' | 'generating' | 'success' | 'error';

function downloadIcs(content: string, filename: string): void {
  // Adiciona BOM UTF-8 para garantir compatibilidade com Apple Calendar
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Libera o URL após o click (Safari precisa de delay)
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CalendarExport({
  icsContent,
  filename,
  label = 'Adicionar ao calendário',
  variant = 'outline',
  fullWidth = false,
  className,
}: CalendarExportProps) {
  const [state, setState] = useState<ExportState>('idle');

  const handleClick = async () => {
    setState('generating');
    try {
      // Pequeno delay para dar feedback visual (Apple Calendar UX)
      await new Promise((r) => setTimeout(r, 100));
      downloadIcs(icsContent, filename);
      setState('success');
      // Volta para idle após 2s
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={state === 'generating'}
      className={cn(fullWidth && 'w-full', className)}
      data-testid="calendar-export"
      aria-label={`${label} (arquivo .ics)`}
    >
      {state === 'generating' ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
      ) : state === 'success' ? (
        <Check className="w-4 h-4 mr-2 text-emerald-400" aria-hidden="true" />
      ) : state === 'error' ? (
        <AlertCircle className="w-4 h-4 mr-2 text-rose-400" aria-hidden="true" />
      ) : (
        <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
      )}
      {state === 'success' ? 'Calendário baixado!' : state === 'error' ? 'Erro ao baixar' : label}
      {state === 'idle' && <Download className="w-3.5 h-3.5 ml-1.5 opacity-60" aria-hidden="true" />}
    </Button>
  );
}