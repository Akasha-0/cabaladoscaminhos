'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileDown, Share2, FileText, Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { generatePDF, type ReadingData, type PDFOptions } from '@/lib/export/pdf';
import { generateReport, exportToPDF, exportToJSON, type ReportType } from '@/lib/export/reports';
import { createShareableLink } from '@/lib/export/share';

interface ExportPanelProps {
  readingData?: ReadingData;
  userName?: string;
  dataNascimento?: string;
}

type ExportFormat = 'pdf' | 'json' | 'share';

const REPORT_TYPES: { type: ReportType; label: string; icon: string }[] = [
  { type: 'numerologia', label: 'Numerologia', icon: '🔢' },
  { type: 'astrologia', label: 'Astrologia', icon: '🌟' },
  { type: 'odu', label: 'Odu', icon: '🔮' },
];

export function ExportPanel({ readingData, userName, dataNascimento }: ExportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePDFDownload = useCallback(async (options?: PDFOptions) => {
    if (!readingData) {
      setError('Dados da leitura não disponíveis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pdfBlob = await generatePDF(readingData, options);
      const blobUrl = URL.createObjectURL(new Blob([pdfBlob as BlobPart], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${readingData.tipo}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Falha ao gerar PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [readingData]);

  const handleReportGeneration = useCallback(async (reportType: ReportType) => {
    if (!userName || !dataNascimento) {
      setError('Dados do usuário não disponíveis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = generateReport(reportType, {
        nome: userName,
        dataNascimento,
      });

      const reportJson = exportToJSON(report);
      const blob = new Blob([reportJson], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${reportType}-report-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Falha ao gerar relatório');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userName, dataNascimento]);

  const handleShare = useCallback(() => {
    if (!readingData) {
      setError('Dados da leitura não disponíveis');
      return;
    }

    const shareData = {
      type: readingData.tipo,
      data: readingData,
    };

    const share = createShareableLink(shareData);
    const url = `${window.location.origin}/shared/${share.id}`;
    setShareUrl(url);
  }, [readingData]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Falha ao copiar link');
    }
  }, [shareUrl]);

  const handleExportAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (readingData) {
        await handlePDFDownload();
      }

      if (userName && dataNascimento) {
        for (const rt of REPORT_TYPES) {
          const report = generateReport(rt.type, {
            nome: userName,
            dataNascimento,
          });
          const reportJson = exportToJSON(report);
const blob = new Blob([reportJson], { type: 'application/json' });
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${rt.type}-report-${Date.now()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }
      }
    } catch (err) {
      setError('Falha ao exportar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [readingData, userName, dataNascimento, handlePDFDownload]);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            <CardTitle>Exportar</CardTitle>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <CardDescription>
          Baixe relatórios em PDF ou JSON, compartilhe link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PDF Downloads */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePDFDownload()}
              disabled={loading || !readingData}
            >
              <FileDown className="h-4 w-4 mr-1" />
              PDF Padrão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePDFDownload({ formato: 'a4', orientacao: 'landscape' })}
              disabled={loading || !readingData}
            >
              <FileDown className="h-4 w-4 mr-1" />
              PDF Landscape
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePDFDownload({ formato: 'letter' })}
              disabled={loading || !readingData}
            >
              <FileDown className="h-4 w-4 mr-1" />
              PDF Letter
            </Button>
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={loading || !readingData}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Gerar Link
          </Button>

          {shareUrl && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent border-none text-sm px-2 py-1 outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Report Generation */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </h4>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((rt) => (
              <Button
                key={rt.type}
                variant="outline"
                size="sm"
                onClick={() => handleReportGeneration(rt.type)}
                disabled={loading || !userName || !dataNascimento}
              >
                <span className="mr-1">{rt.icon}</span>
                {rt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Export All */}
        {(readingData || (userName && dataNascimento)) && (
          <Button
            variant="default"
            size="sm"
            onClick={handleExportAll}
            disabled={loading}
            className="w-full mt-2"
          >
            <FileDown className="h-4 w-4 mr-1" />
            Exportar Tudo
          </Button>
        )}

        {/* Info Badge */}
        <div className="pt-2">
          <Badge variant="secondary" className="text-xs">
            Links expiram em 7 dias
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
