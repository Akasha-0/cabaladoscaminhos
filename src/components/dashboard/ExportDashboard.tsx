'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  FileDown,
  FileJson,
  FileText,
  BarChart3,
  BookOpen,
  History,
  Download,
  Check,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';

interface DashboardExportData {
  charts?: {
    numerology: unknown;
    astrologia: unknown;
    odu: unknown;
  };
  readings?: {
    tarot: unknown[];
    odu: unknown[];
    numerologia: unknown[];
  };
  history?: {
    rituals: unknown[];
    meditations: unknown[];
    affirmations: unknown[];
  };
  userName?: string;
  dataNascimento?: string;
}

interface ExportDashboardProps {
  data?: DashboardExportData;
  onExport?: (format: 'pdf' | 'json', selectedData: DashboardExportData) => Promise<void>;
}

type ExportSection = 'charts' | 'readings' | 'history';

const SECTIONS: { id: ExportSection; label: string; icon: string }[] = [
  { id: 'charts', label: 'Gráficos', icon: '📊' },
  { id: 'readings', label: 'Leituras', icon: '📖' },
  { id: 'history', label: 'Histórico', icon: '📜' },
];

function SectionCard({
  title,
  description,
  icon,
  selected,
  onToggle,
  disabled,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="text-2xl mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{title}</h4>
          {selected && (
            <Badge variant="secondary" className="h-5 text-xs">
              <Check className="w-3 h-3 mr-0.5" />
              Selecionado
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onToggle(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 rounded border border-purple-500/30 bg-[#020617] text-purple-600 focus:ring-purple-500/50 accent-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Selecionar ${title}`}
      />
    </div>
  );
}

export function ExportDashboard({ data, onExport }: ExportDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<ExportSection>>(
    new Set(['charts', 'readings', 'history'])
  );
  const [activeTab, setActiveTab] = useState<ExportSection>('charts');

  const toggleSection = useCallback((section: ExportSection) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedSections(new Set(['charts', 'readings', 'history']));
  }, []);

  const selectNone = useCallback(() => {
    setSelectedSections(new Set());
  }, []);

  const buildExportData = useCallback((): DashboardExportData => {
    const result: DashboardExportData = {};

    if (selectedSections.has('charts') && data?.charts) {
      result.charts = data.charts;
    }
    if (selectedSections.has('readings') && data?.readings) {
      result.readings = data.readings;
    }
    if (selectedSections.has('history') && data?.history) {
      result.history = data.history;
    }
    if (data?.userName) result.userName = data.userName;
    if (data?.dataNascimento) result.dataNascimento = data.dataNascimento;

    return result;
  }, [data, selectedSections]);

  const handlePDFExport = useCallback(async () => {
    if (!onExport) return;
    setLoading(true);
    try {
      const exportData = buildExportData();
      await onExport('pdf', exportData);
    } finally {
      setLoading(false);
    }
  }, [onExport, buildExportData]);

  const handleJSONExport = useCallback(() => {
    setLoading(true);
    try {
      const exportData = buildExportData();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }, [buildExportData]);

  const hasAnyData = data && (
    (data.charts && Object.keys(data.charts).length > 0) ||
    (data.readings && Object.keys(data.readings).length > 0) ||
    (data.history && Object.keys(data.history).length > 0)
  );

  const selectedCount = selectedSections.size;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Exportar Dashboard</CardTitle>
        </div>
        <CardDescription>
          Exporte seus dados de gráficos, leituras e histórico em PDF ou JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              {selectedCount} seção{selectedCount !== 1 ? 'ões' : ''} selecionada{selectedCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
              Selecionar tudo
            </Button>
            <Button variant="ghost" size="sm" onClick={selectNone} className="h-7 text-xs">
              Limpar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExportSection)}>
          <TabsList className="grid grid-cols-3 h-8">
            {SECTIONS.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="text-xs gap-1.5"
              >
                <span>{section.icon}</span>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="charts" className="mt-3 space-y-2">
            <SectionCard
              title="Gráficos"
              description="Numerologia, Astrologia e Odu"
              icon={<BarChart3 className="w-5 h-5" />}
              selected={selectedSections.has('charts')}
              onToggle={() => toggleSection('charts')}
              disabled={!data?.charts}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {data?.charts && (
                <>
                  {data.charts.numerology && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Numerologia
                    </Badge>
                  )}
                  {data.charts.astrologia && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Astrologia
                    </Badge>
                  )}
                  {data.charts.odu && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Odu
                    </Badge>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="readings" className="mt-3 space-y-2">
            <SectionCard
              title="Leituras"
              description="Tarot, Odu e Numerologia"
              icon={<BookOpen className="w-5 h-5" />}
              selected={selectedSections.has('readings')}
              onToggle={() => toggleSection('readings')}
              disabled={!data?.readings}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {data?.readings && (
                <>
                  {data.readings.tarot && (
                    <Badge variant="secondary" className="text-xs">
                      {data.readings.tarot.length} Tarot
                    </Badge>
                  )}
                  {data.readings.odu && (
                    <Badge variant="secondary" className="text-xs">
                      {data.readings.odu.length} Odu
                    </Badge>
                  )}
                  {data.readings.numerologia && (
                    <Badge variant="secondary" className="text-xs">
                      {data.readings.numerologia.length} Numerologia
                    </Badge>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-3 space-y-2">
            <SectionCard
              title="Histórico"
              description="Rituais, Meditações e Afirmações"
              icon={<History className="w-5 h-5" />}
              selected={selectedSections.has('history')}
              onToggle={() => toggleSection('history')}
              disabled={!data?.history}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {data?.history && (
                <>
                  {data.history.rituals && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {data.history.rituals.length} Rituais
                    </Badge>
                  )}
                  {data.history.meditations && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {data.history.meditations.length} Meditações
                    </Badge>
                  )}
                  {data.history.affirmations && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {data.history.affirmations.length} Afirmações
                    </Badge>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {data?.userName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{data.userName}</span>
            {data.dataNascimento && (
              <>
                <span>•</span>
                <Calendar className="w-3 h-3" />
                <span>{data.dataNascimento}</span>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            onClick={handlePDFExport}
            disabled={loading || selectedCount === 0 || !hasAnyData}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="ml-2">Exportar PDF</span>
          </Button>
          <Button
            onClick={handleJSONExport}
            disabled={loading || selectedCount === 0 || !hasAnyData}
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileJson className="w-4 h-4" />
            )}
            <span className="ml-2">Exportar JSON</span>
          </Button>
        </div>

        {(!data || !hasAnyData) && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Nenhum dado disponível para exportar
          </p>
        )}
      </CardContent>
    </Card>
  );
}